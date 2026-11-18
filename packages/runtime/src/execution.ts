/**
 * @file packages/runtime/src/execution.ts
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import type { ActionSpec, ApprovalPolicy } from '@eventiva/contracts/action';
import { Authorizer, Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { type PlatformError } from '@eventiva/contracts/errors';
import { Json } from '@eventiva/contracts/storage';
import { Cause, Clock, Effect, Either, Exit, Option, Random, Schema } from 'effect';
import type { ActionBinding } from './action.ts';
import {
    Approvals,
    Audit,
    type AuditUnavailable,
    ExecutionPolicy,
    type ExecutionRequirements,
    IdentityResolver,
    InputDigest,
    Integrity,
    InvocationDenied,
    type InvocationResult,
    type InvokeOptions,
    type Receipt,
    canonicalJson,
} from './invocation.ts';

export type InvocationError = PlatformError | InvocationDenied | AuditUnavailable;

/** Captured action binding whose availability must remain valid across live rechecks and transaction waits. */
export interface Executable extends ActionBinding {
    readonly available: Effect.Effect<void, PlatformError>;
}

const Intent = Schema.Struct({
    idempotencyKey: Schema.optional(Schema.NonEmptyString.pipe(Schema.maxLength(512))),
    approvalId: Schema.optional(Schema.NonEmptyString.pipe(Schema.maxLength(512))),
    mode: Schema.optional(Schema.Literal('online', 'offline-intent', 'scheduled')),
    notBefore: Schema.optional(Schema.NonNegative.pipe(Schema.finite())),
    deadline: Schema.optional(Schema.NonNegative.pipe(Schema.finite())),
    expectedVersion: Schema.optional(Schema.NonEmptyString),
    expectedState: Schema.optional(Schema.NonEmptyString),
});

const rank: Readonly<Record<ApprovalPolicy, number>> = { none: 0, confirm: 1, always: 2 };
/** Identify agent principals subject to stricter routine-mutation and independent human-approval floors. */
const agent = (caller: CallerIdentity) => caller.kind === 'first-party-agent' || caller.kind === 'external-agent';

/** Enforce fresh authority constraints; commit checks omit only business preconditions the admitted mutation may consume. */
const checkExecution = (
    caller: CallerIdentity,
    spec: ActionSpec,
    intent: InvokeOptions,
    live: ExecutionRequirements,
    hash: string,
    now: number,
    approvals: typeof Approvals.Service,
    phase: 'admission' | 'commit' = 'admission'
): Effect.Effect<void, InvocationDenied> =>
    Effect.gen(
        /** Reject intent or approval that cannot justify execution at this instant, including replay revalidation. */ function* () {
            /** Retain only a safe gate identifier and action name in public denial evidence. */
            const deny = (reason: string) => new InvocationDenied({ action: spec.name, reason });
            // Offline and scheduled intent cannot relax live state checks or manufacture a valid execution window.
            if (intent.notBefore !== undefined && now < intent.notBefore) return yield* deny('not-before');
            if (intent.deadline !== undefined && now >= intent.deadline) return yield* deny('expired');
            if (intent.mode === 'scheduled' && (intent.notBefore === undefined || intent.deadline === undefined))
                return yield* deny('schedule-window-required');
            if (spec.risk === 'live-production' && intent.deadline === undefined)
                return yield* deny('deadline-required');
            if (
                intent.mode === 'offline-intent' &&
                (spec.offline === 'online-only' || spec.risk === 'financial' || spec.risk === 'live-production')
            )
                return yield* deny('online-only');
            if (
                intent.mode === 'offline-intent' &&
                spec.risk !== 'routine' &&
                (intent.expectedVersion === undefined ||
                    intent.expectedState === undefined ||
                    intent.deadline === undefined)
            )
                return yield* deny('guarded-intent-required');
            // These are pre-mutation assertions, not postconditions: the handler may legitimately advance or consume them.
            if (phase === 'admission') {
                if (intent.expectedVersion !== undefined && intent.expectedVersion !== live.currentVersion)
                    return yield* deny('version-conflict');
                if (intent.expectedState !== undefined && intent.expectedState !== live.currentState)
                    return yield* deny('state-conflict');
                if (!live.dependenciesReady) return yield* deny('dependency-conflict');
                if (!live.capacityAvailable) return yield* deny('capacity-conflict');
            }
            if (spec.sideEffect !== 'read' && intent.idempotencyKey === undefined)
                return yield* deny('idempotency-key-required');

            // Approval is the strictest of specification, risk/agent floor and live tenant policy, never the caller's choice.
            const floor: ApprovalPolicy =
                spec.risk !== 'routine'
                    ? 'always'
                    : spec.sideEffect !== 'read' && agent(caller) && !live.routinePreauthorized
                      ? 'confirm'
                      : 'none';
            const required = Math.max(rank[spec.approval], rank[floor], rank[live.approval]);
            if (required === 0) return;
            if (intent.approvalId === undefined) return yield* deny('approval-required');
            const approval = yield* approvals.get(intent.approvalId);
            // Human evidence authorizes this principal, tenant, action version and canonical input, not an interchangeable request.
            if (approval.approver.kind !== 'human' || (agent(caller) && approval.approver.subject === caller.subject))
                return yield* deny('human-approval-required');
            if (
                approval.principal !== caller.subject ||
                approval.tenant !== caller.tenant ||
                approval.approver.tenant !== caller.tenant ||
                approval.action !== spec.name ||
                approval.version !== spec.version ||
                approval.inputHash !== hash
            )
                return yield* deny('approval-binding');
            if (
                !Number.isFinite(approval.issuedAt) ||
                !Number.isFinite(approval.expiresAt) ||
                approval.issuedAt > now ||
                approval.expiresAt <= now ||
                approval.expiresAt <= approval.issuedAt
            )
                return yield* deny('approval-expired');
            if (live.stepUp && !approval.stepUp) return yield* deny('step-up-required');
            for (const [key, value] of Object.entries(live.bounds)) {
                const limit = approval.limits[key];
                if (
                    !Number.isFinite(value) ||
                    value < 0 ||
                    limit === undefined ||
                    !Number.isFinite(limit) ||
                    limit < value
                )
                    return yield* deny('approval-limit');
            }
        }
    );

/** Classify execution for receipts without exposing handler payloads, arbitrary defects or cause text. */
const outcome = <A>(exit: Exit.Exit<A, InvocationError>): Receipt['outcome'] => {
    if (Exit.isSuccess(exit)) return 'succeeded';
    if (Cause.isInterruptedOnly(exit.cause)) return 'interrupted';
    // Only typed declared handler failures are business failures; untyped causes remain defects and gates are denials.
    const error = Cause.failureOption(exit.cause);
    if (Option.isNone(error)) return 'defect';
    return error.value._tag === 'ActionFailed' ? 'failed' : 'denied';
};

/** One engine for every surface; invoke is only a convenience projection of execute. */
export const makeExecutor = Effect.gen(
    /** Capture the host's trusted execution services once; identity and policy observations remain per invocation. */ function* () {
        const identity = yield* IdentityResolver;
        const authorizer = yield* Authorizer;
        const policy = yield* ExecutionPolicy;
        const approvals = yield* Approvals;
        const audit = yield* Audit;
        const integrity = yield* Integrity;
        const digest = yield* InputDigest;

        return /** Execute untrusted wire input through refreshed authority and durable receipt handling; audit failure stays on the outer channel. */ <
            Wire,
        >(
            action: string,
            input: Wire,
            lookup: Effect.Effect<Executable, PlatformError>,
            options: InvokeOptions = {}
        ) =>
            Effect.uninterruptibleMask(
                /** Keep receipt finalization masked while allowing the execution body to inherit caller interruption. */ (
                    restore
                ) =>
                    Effect.gen(
                        /** Retain bounded invocation evidence even when lookup, execution or interruption prevents a normal handler result. */ function* () {
                            const presented = yield* Caller;
                            const startedAt = yield* Clock.currentTimeMillis;
                            const id = `${startedAt}-${yield* Random.nextInt}-${yield* Random.nextInt}`;
                            let caller = presented;
                            let spec: ActionSpec | undefined;
                            let inputHash = yield* digest.digest(
                                Either.getOrElse(
                                    canonicalJson(input),
                                    /** Hash a fixed marker for rejected non-JSON wire input rather than coercing arbitrary values. */ () =>
                                        '<non-json>'
                                )
                            );
                            let committed: { readonly receipt: Receipt; readonly replayed: boolean } | undefined;
                            /** Snapshot receipt metadata using the latest trusted caller/spec/hash, never raw input or failure details. */
                            const receipt = <A>(exit: Exit.Exit<A, InvocationError>, ended: number): Receipt => ({
                                id,
                                caller,
                                action,
                                version: spec?.version ?? null,
                                inputHash,
                                outcome: outcome(exit),
                                startedAt,
                                durationMs: Math.max(0, ended - startedAt),
                            });
                            const exit = yield* Effect.exit(
                                restore(
                                    Effect.gen(
                                        /** Resolve current authority before preparation, then authorize the decoded target before execution. */ function* () {
                                            caller = yield* identity.resolve(presented);
                                            const entry = yield* lookup;
                                            spec = entry.spec;
                                            yield* entry.available;
                                            yield* authorizer.canInvoke(caller, spec);
                                            const intent = yield* Schema.decodeUnknown(Intent)(options).pipe(
                                                Effect.mapError(
                                                    /** Hide untrusted intent decoding diagnostics behind a bounded public denial. */ () =>
                                                        new InvocationDenied({ action, reason: 'invalid-intent' })
                                                )
                                            );
                                            const prepared = yield* entry.prepare(input);
                                            yield* prepared.authorize(authorizer, caller);
                                            const canonical = yield* prepared.canonicalInput;
                                            inputHash = yield* digest.digest(canonical);
                                            // Intent contains only decoded scalars. Keep it private: each policy
                                            // inspection receives a disposable view, never the values we enforce.
                                            const live = yield* prepared.inspect(policy, caller, { ...intent });
                                            yield* checkExecution(
                                                caller,
                                                spec,
                                                intent,
                                                live,
                                                inputHash,
                                                yield* Clock.currentTimeMillis,
                                                approvals
                                            );
                                            const protectedCall =
                                                spec.sideEffect !== 'read' || spec.sensitive || spec.risk !== 'routine';
                                            if (protectedCall) yield* audit.ready(action);
                                            // Integrity may wait for a competing transaction. Recheck inside
                                            // its callback, not just before waiting; a deadline or grant can expire.
                                            /** Refresh common authority at admission/replay or before committing new effects, without reapplying consumed preconditions. */
                                            const revalidate = (phase: 'admission' | 'commit') =>
                                                Effect.gen(
                                                    /** Recheck captured action, identity and current policy at the selected transaction boundary. */ function* () {
                                                        const currentCaller = yield* identity.resolve(presented);
                                                        // A refreshed grant may change, but it cannot silently substitute another principal, tenant or session.
                                                        if (
                                                            currentCaller.subject !== caller.subject ||
                                                            currentCaller.session !== caller.session ||
                                                            currentCaller.tenant !== caller.tenant ||
                                                            currentCaller.kind !== caller.kind ||
                                                            currentCaller.onBehalfOf !== caller.onBehalfOf
                                                        )
                                                            return yield* new InvocationDenied({
                                                                action,
                                                                reason: 'identity-changed',
                                                            });
                                                        yield* entry.available;
                                                        yield* authorizer.canInvoke(currentCaller, entry.spec);
                                                        yield* prepared.authorize(authorizer, currentCaller);
                                                        const current = yield* prepared.inspect(policy, currentCaller, {
                                                            ...intent,
                                                        });
                                                        yield* checkExecution(
                                                            currentCaller,
                                                            entry.spec,
                                                            intent,
                                                            current,
                                                            inputHash,
                                                            yield* Clock.currentTimeMillis,
                                                            approvals,
                                                            phase
                                                        );
                                                        yield* audit.ready(action);
                                                    }
                                                );
                                            const run = prepared.run;
                                            if (spec.sideEffect === 'read') return yield* run;
                                            const saved = yield* integrity.commit(
                                                {
                                                    key: JSON.stringify([
                                                        caller.tenant ?? null,
                                                        caller.subject,
                                                        action,
                                                        spec.version,
                                                        intent.idempotencyKey,
                                                    ]),
                                                    inputHash,
                                                    caller,
                                                    action,
                                                    version: spec.version,
                                                },
                                                Effect.gen(
                                                    /** Produce mutation output and success evidence inside the integrity adapter's atomic transaction. */ function* () {
                                                        // Revalidate inside the transaction callback because waiting for its lock can expire earlier authority.
                                                        yield* revalidate('admission');
                                                        const output = yield* run;
                                                        // Handler waits can outlive approval, grants or deadlines; denial here rolls back the paired transaction.
                                                        yield* revalidate('commit');
                                                        return {
                                                            output,
                                                            receipt: receipt(
                                                                Exit.succeed(output),
                                                                yield* Clock.currentTimeMillis
                                                            ),
                                                        };
                                                    }
                                                )
                                            );
                                            if (saved.replayed) yield* revalidate('admission');
                                            committed = saved;
                                            return yield* canonicalJson(saved.output).pipe(
                                                Effect.flatMap(Schema.decode(Json)),
                                                Effect.orDie
                                            );
                                        }
                                    ).pipe(
                                        Effect.catchAllDefect(
                                            /** Sanitize arbitrary implementation defects before retaining the execution Exit. */ () =>
                                                Effect.dieMessage('Action execution defect.')
                                        )
                                    )
                                )
                            );
                            const current =
                                committed !== undefined && !committed.replayed && Exit.isSuccess(exit)
                                    ? committed.receipt
                                    : receipt(exit, yield* Clock.currentTimeMillis);
                            // A new mutation's receipt was already committed in the A1 transaction.
                            // A replay is a new invocation and needs a new audit record after live revalidation.
                            const persisted =
                                committed !== undefined && !committed.replayed && Exit.isSuccess(exit)
                                    ? ('durable' as const)
                                    : yield* audit.record(
                                          current,
                                          spec !== undefined &&
                                              spec.sideEffect === 'read' &&
                                              !spec.sensitive &&
                                              spec.risk === 'routine'
                                      );
                            return {
                                result: exit,
                                receipt: current,
                                replayed: committed?.replayed ?? false,
                                audit: persisted,
                            } satisfies InvocationResult<InvocationError>;
                        }
                    )
            );
    }
);
