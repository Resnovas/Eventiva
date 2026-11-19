/**
 * @file packages/runtime/src/approval.ts
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

import {
    ApprovalBinding,
    ApprovalEvents,
    ApprovalEventScope,
    ApprovalFailure,
    ApprovalPreparation,
    ApprovalRecord,
    ApprovalSettings,
    ApprovalStore,
    approvalRetentionEnd,
    cancelApprovalsPermission,
} from '@eventiva/contracts/approval';
import { Authorizer, Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { IdentityStore } from '@eventiva/contracts/identity';
import { Json, type JsonValue } from '@eventiva/contracts/storage';
import { Clock, Context, Effect, Layer, Option, Schema } from 'effect';
import type { ActionBinding } from './action.ts';
import { Approvals, ExecutionPolicy, IdentityResolver, InputDigest, InvocationDenied } from './invocation.ts';

export { approvalRetentionEnd } from '@eventiva/contracts/approval';

/** Convert foreign failures into a fixed approval denial without leaking schema, policy or SQL diagnostics. */
const denied = () => new ApprovalFailure({ reason: 'denied' });
/** Validate service-boundary arguments too; typed server callers are not a persistence validation exemption. */
const decode = <A, I>(schema: Schema.Schema<A, I>, value: NoInfer<I>) =>
    Schema.decode(schema)(value, { onExcessProperty: 'error' }).pipe(
        Effect.mapError(
            /** Never expose the rejected decision content in diagnostics. */
            () => new ApprovalFailure({ reason: 'invalid' })
        )
    );

/** Derive bounded review data without invoking a handler; the host supplies the live registered binding and refreshed caller. */
export const prepareApproval = <Wire>(action: ActionBinding, input: Wire, caller: CallerIdentity, writeKey: string) =>
    Effect.gen(
        /** Authorize decoded targets and derive limits from live server policy, never from transport-supplied hash/bounds. */
        function* () {
            // Preparation shares the invocation codec so transformed wire inputs cannot acquire a different consent hash.
            if (caller.tenant === undefined) return yield* denied();
            const authorizer = yield* Authorizer;
            const policy = yield* ExecutionPolicy;
            const digest = yield* InputDigest;
            yield* authorizer.canInvoke(caller, action.spec);
            const prepared = yield* action.prepare(input);
            yield* prepared.authorize(authorizer, caller);
            const live = yield* prepared.inspect(policy, caller, { idempotencyKey: writeKey });
            if (live.stepUp) return yield* new ApprovalFailure({ reason: 'step-up' });
            const binding = yield* decode(ApprovalBinding, {
                tenant: caller.tenant,
                principal: caller.subject,
                action: action.spec.name,
                version: action.spec.version,
                inputHash: yield* digest.digest(yield* prepared.canonicalInput),
                writeKey,
            });
            const events = yield* Effect.serviceOption(ApprovalEvents);
            const resolved = Option.isSome(events)
                ? yield* events.value.resolve(binding, yield* Schema.decode(Json)(yield* prepared.canonicalInput))
                : undefined;
            const eventScope = resolved === undefined ? undefined : yield* decode(ApprovalEventScope, resolved);
            // Decode into detached data so a retained policy map cannot mutate the review after it is shown.
            return yield* decode(ApprovalPreparation, {
                binding,
                limits: live.bounds,
                ...(eventScope === undefined ? {} : { eventScope }),
            });
        }
    ).pipe(
        Effect.mapError(
            /** Keep the explicit unavailable-step-up category while hiding target-policy failures. */
            (error) => (error._tag === 'ApprovalFailure' ? error : denied())
        )
    );

/** Issue only at trusted explicit human-consent completion using the authoritative registered binding, never a public mint API. */
export const issueApproval = (
    action: ActionBinding,
    input: JsonValue,
    principal: CallerIdentity,
    writeKey: string,
    settings: typeof ApprovalSettings.Encoded,
    /** Preserve the exact deadline reviewed by the human; trusted completions may shorten, never extend, the live cap. */
    reviewedExpiresAt?: number
) =>
    Effect.gen(
        /** Compute and persist one exact human decision under the shared identity/proof transaction guard. */
        function* () {
            // Select the routed provider before acquiring its authority guard, never from an untrusted tenant field.
            const store = yield* ApprovalStore;
            return yield* store.transaction(
                Effect.gen(
                    /** Resolve both the interactive human and executing principal before deriving server-owned evidence. */
                    function* () {
                        const identity = yield* IdentityResolver;
                        const identities = yield* IdentityStore;
                        const human = yield* identity.resolve(yield* Caller);
                        const actor = yield* identity.resolve(principal);
                        if (
                            human.kind !== 'human' ||
                            human.onBehalfOf !== undefined ||
                            human.tenant !== store.tenant ||
                            actor.tenant !== store.tenant ||
                            identities.tenant !== store.tenant ||
                            (actor.subject !== human.subject &&
                                (!['first-party-agent', 'external-agent'].includes(actor.kind) ||
                                    actor.onBehalfOf !== human.subject))
                        )
                            return yield* denied();
                        const configured = yield* decode(ApprovalSettings, settings);
                        // Both parties need live target authority; consent does not grant the agent otherwise missing permissions.
                        yield* prepareApproval(action, input, human, writeKey);
                        const target = yield* prepareApproval(action, input, actor, writeKey);
                        const session = (yield* identities.get('session', human.session))?.value;
                        const now = yield* Clock.currentTimeMillis;
                        if (
                            !session?.active ||
                            session.subject !== human.subject ||
                            session.delegation !== null ||
                            session.expiresAt <= now
                        )
                            return yield* denied();
                        const policyDeadline = now + configured.lifetimeMs;
                        if (!Number.isSafeInteger(policyDeadline))
                            return yield* new ApprovalFailure({ reason: 'invalid' });
                        const cap = Math.min(policyDeadline, session.expiresAt);
                        const expiresAt = reviewedExpiresAt ?? cap;
                        if (!Number.isSafeInteger(expiresAt) || expiresAt <= now || expiresAt > cap)
                            return yield* new ApprovalFailure({ reason: 'expired' });
                        const record = yield* decode(ApprovalRecord, {
                            schemaVersion: 1,
                            id: yield* store.nextId,
                            revision: 0,
                            binding: target.binding,
                            ...(target.eventScope === undefined ? {} : { eventScope: target.eventScope }),
                            approver: human,
                            issuedAt: now,
                            expiresAt,
                            limits: target.limits,
                            stepUp: false,
                            retention: configured.retention,
                            retainUntil: approvalRetentionEnd(expiresAt, configured.retention),
                            usedAt: null,
                            revokedAt: null,
                        });
                        yield* store.save(record, human, 'issued');
                        return record;
                    }
                )
            );
        }
    ).pipe(
        Effect.mapError(
            /** Loss of live identity is a bounded refusal, not a reason to trust the presented principal. */
            (error) => (error._tag === 'ApprovalFailure' ? error : denied())
        )
    );

/** Look up exact proof with live identity/delegation/permissions; callers must use the currently registered binding each time. */
export const lookupApproval = (id: string, action: ActionBinding, input: JsonValue, writeKey: string) =>
    Effect.gen(
        /** Join the authoritative transaction when called at admission/commit; never cache accepting proof state. */
        function* () {
            // Nested provider transactions retain the same fiber's tenant SQL connection and authority lock.
            const store = yield* ApprovalStore;
            return yield* store.transaction(
                Effect.gen(
                    /** Refresh both actor and consenting human, then compare canonical input and write identity. */
                    function* () {
                        // Repeating live resolution matters on replay even when the mutation's original receipt is immutable.
                        const identity = yield* IdentityResolver;
                        const record = yield* store.get(id);
                        if (!record) return yield* new ApprovalFailure({ reason: 'missing' });
                        if (record.revokedAt !== null) return yield* new ApprovalFailure({ reason: 'revoked' });
                        const now = yield* Clock.currentTimeMillis;
                        if (record.issuedAt > now || record.expiresAt <= now)
                            return yield* new ApprovalFailure({ reason: 'expired' });
                        const caller = yield* identity.resolve(yield* Caller);
                        const human = yield* identity.resolve(record.approver);
                        if (
                            caller.tenant !== store.tenant ||
                            human.kind !== 'human' ||
                            human.tenant !== store.tenant ||
                            (['first-party-agent', 'external-agent'].includes(caller.kind) &&
                                caller.onBehalfOf !== human.subject)
                        )
                            return yield* denied();
                        yield* prepareApproval(action, input, human, writeKey);
                        const target = yield* prepareApproval(action, input, caller, writeKey);
                        if (
                            JSON.stringify(record.binding) !== JSON.stringify(target.binding) ||
                            JSON.stringify(record.eventScope) !== JSON.stringify(target.eventScope)
                        )
                            return yield* new ApprovalFailure({ reason: 'binding' });
                        for (const [key, amount] of Object.entries(target.limits)) {
                            const limit = record.limits[key];
                            if (!Number.isFinite(amount) || amount < 0 || limit === undefined || limit < amount)
                                return yield* new ApprovalFailure({ reason: 'binding' });
                        }
                        return record;
                    }
                )
            );
        }
    ).pipe(
        Effect.mapError(
            /** Preserve closed approval categories; foreign live-authority failures remain denied. */
            (error) => (error._tag === 'ApprovalFailure' ? error : denied())
        )
    );

/** Mark successful use INSIDE Integrity's transaction after its live gates; never consume pending consent during initial lookup. */
export const useApproval = (id: string, action: ActionBinding, input: JsonValue, writeKey: string) =>
    Effect.gen(
        /** Failed mutation or audit must roll this lifecycle change back with the domain change. */
        function* () {
            // Lifecycle use is separate from lookup so a denied or rolled-back attempt remains cancellable.
            const store = yield* ApprovalStore;
            return yield* store.transaction(
                Effect.gen(
                    /** Revalidate again rather than trusting a proof record retained by a handler. */
                    function* () {
                        const record = yield* lookupApproval(id, action, input, writeKey);
                        if (record.usedAt !== null) return record;
                        const now = yield* Clock.currentTimeMillis;
                        const used = {
                            ...record,
                            revision: record.revision + 1,
                            usedAt: now,
                            retainUntil: approvalRetentionEnd(now, record.retention),
                        };
                        // Keep immutable human consent provenance separate from the live principal that actually used it.
                        yield* store.save(used, yield* Caller, 'used');
                        return used;
                    }
                )
            );
        }
    );

/** Cancel only pending evidence: the consenting human owns it; other humans need an independently granted exact tenant permission. */
export const cancelApproval = (id: string) =>
    Effect.gen(
        /** Refresh current role/team grants in the same transaction; role names and untrusted event IDs confer nothing. */
        function* () {
            // Cancellation shares proof-use ordering instead of racing a second connection's unguarded update.
            const store = yield* ApprovalStore;
            return yield* store.transaction(
                Effect.gen(
                    /** Resolve cancellation authority without requiring the target action's now-possibly-revoked permission. */
                    function* () {
                        const identity = yield* IdentityResolver;
                        const identities = yield* IdentityStore;
                        const caller = yield* identity.resolve(yield* Caller);
                        if (
                            caller.kind !== 'human' ||
                            caller.tenant !== store.tenant ||
                            identities.tenant !== store.tenant
                        )
                            return yield* denied();
                        const record = yield* store.get(id);
                        if (!record) return yield* new ApprovalFailure({ reason: 'missing' });
                        if (caller.subject !== record.approver.subject) {
                            const membership = (yield* identities.get('membership', caller.subject))?.value;
                            const teams = yield* identities.teams(caller.subject);
                            const roles = [
                                ...new Set([
                                    ...(membership?.roles ?? []),
                                    ...teams.flatMap(
                                        /** Read inherited roles live; a team name is not a security-admin assertion. */
                                        (team) => team.roles
                                    ),
                                ]),
                            ];
                            const records = yield* Effect.forEach(
                                roles,
                                /** Revoked role definitions must immediately remove cancellation authority. */
                                (role) => identities.get('role', role)
                            );
                            const grants = records.flatMap(
                                /** Current team/role records are the only source of independent cancellation grants. */
                                (role) => role?.value.grants ?? []
                            );
                            const allowed = grants.some(
                                /** Exact framed tenant scope prevents a grant for another tenant/event becoming global authority. */
                                (grant) =>
                                    grant.permission === cancelApprovalsPermission &&
                                    grant.resources.includes(`tenant:${store.tenant}`)
                            );
                            if (!allowed) {
                                const events = yield* Effect.serviceOption(ApprovalEvents);
                                // An event-shaped grant is insufficient without captured association and a current trusted lead/target check.
                                if (
                                    record.eventScope === undefined ||
                                    Option.isNone(events) ||
                                    !grants.some(
                                        /** Event authority remains independently grantable and cannot broaden into tenant authority. */
                                        (grant) =>
                                            grant.permission === cancelApprovalsPermission &&
                                            grant.resources.includes(`event:${record.eventScope?.event}`)
                                    )
                                )
                                    return yield* denied();
                                yield* events.value.canCancel(caller, record.binding, record.eventScope);
                            }
                        }
                        if (record.revokedAt !== null) return record;
                        const now = yield* Clock.currentTimeMillis;
                        if (record.usedAt !== null) return yield* new ApprovalFailure({ reason: 'conflict' });
                        if (record.expiresAt <= now) return yield* new ApprovalFailure({ reason: 'expired' });
                        const cancelled = {
                            ...record,
                            revision: record.revision + 1,
                            revokedAt: now,
                            retainUntil: approvalRetentionEnd(now, record.retention),
                        };
                        yield* store.save(cancelled, caller, 'cancelled');
                        return cancelled;
                    }
                )
            );
        }
    ).pipe(
        Effect.mapError(
            /** Identity-store failure cannot preserve stale cancellation permissions. */
            (error) => (error._tag === 'ApprovalFailure' ? error : denied())
        )
    );

/** Build inside the routed identity/proof scope; every lookup/use receives its actual registered invocation rather than a captured fixture target. */
export const approvalServices = Layer.effect(
    Approvals,
    Effect.gen(
        /** Capture only routed services while keeping the executor's canonical Caller live at every operation. */
        function* () {
            // Capturing Caller here would bind subsequent use/replay to the layer's construction identity.
            const routed = (yield* Effect.context<
                ApprovalStore | IdentityResolver | Authorizer | ExecutionPolicy | InputDigest
            >()).pipe(Context.pick(ApprovalStore, IdentityResolver, Authorizer, ExecutionPolicy, InputDigest));
            const events = yield* Effect.serviceOption(ApprovalEvents);
            const dependencies = Option.isSome(events) ? Context.add(routed, ApprovalEvents, events.value) : routed;
            const store = yield* ApprovalStore;
            return Approvals.of({
                /** Decode and reauthorize exact proof against this invocation's live binding/input/target key without consuming it. */
                get: (id, target) =>
                    lookupApproval(id, target.action, target.input, target.writeKey).pipe(
                        Effect.provide(dependencies),
                        Effect.map(
                            /** Preserve independent executor validation while keeping lifecycle persistence behind the provider. */
                            (record) => ({
                                ...record.binding,
                                approver: record.approver,
                                issuedAt: record.issuedAt,
                                expiresAt: record.expiresAt,
                                limits: record.limits,
                                stepUp: record.stepUp,
                            })
                        ),
                        Effect.mapError(
                            /** Hide SQL, private identity and proof-state diagnostics at the public invocation boundary. */
                            () => new InvocationDenied({ action: target.action.spec.name, reason: 'approval-denied' })
                        )
                    ),
                /** Recheck live evidence and write its first use on the accepting fiber's same routed SQL transaction. */
                use: (id, target) =>
                    useApproval(id, target.action, target.input, target.writeKey).pipe(
                        Effect.provide(dependencies),
                        Effect.asVoid,
                        Effect.mapError(
                            /** A failed lifecycle write is an accepting denial, never an acknowledged partial success. */
                            () => new InvocationDenied({ action: target.action.spec.name, reason: 'approval-denied' })
                        )
                    ),
                /** Approved reads need a real transaction for use and successful audit; mutation use already joins Integrity. */
                transaction: (effect) =>
                    store.transaction(effect).pipe(
                        Effect.mapError(
                            /** Preserve the callback's own typed failure, sanitizing only the provider transaction failure. */
                            (error) =>
                                error instanceof ApprovalFailure
                                    ? new InvocationDenied({ action: '<approval>', reason: 'approval-unavailable' })
                                    : error
                        )
                    ),
            });
        }
    )
);
