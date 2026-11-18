/**
 * @file apps/server/src/agent-run.ts
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

import * as Entity from '@effect/cluster/Entity';
import { Persisted, ShardGroup } from '@effect/cluster/ClusterSchema';
import * as Rpc from '@effect/rpc/Rpc';
import * as Activity from '@effect/workflow/Activity';
import * as Workflow from '@effect/workflow/Workflow';
import { AgentOutputLog, type OutputPayload } from '@eventiva/contracts/agent-output';
import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Json, JsonValue, Storage, TenantRouter, UuidV7 } from '@eventiva/contracts/storage';
import { canonicalJson, IdentityResolver } from '@eventiva/runtime/invocation';
import { type Cause, Context, Data, Effect, Either, Exit, Layer, Option, Schema } from 'effect';
import { ClusterActions, entityId } from './cluster-actions.ts';

/** Sanitized run failures never carry stored inputs, provider output or transport diagnostics. */
interface RunFailureFields {
    readonly reason: 'denied' | 'conflict' | 'invalid' | 'unavailable' | 'missing';
}
/** Keep the emitted error constructor exact rather than exporting the vendor's open generic. */
const runFailureBase: new (
    fields: RunFailureFields
) => Cause.YieldableError & RunFailureFields & { readonly _tag: 'AgentRunDenied' } = Data.TaggedError('AgentRunDenied');
/** A live access refusal, immutable-input conflict or unavailable mandatory execution adapter. */
export class AgentRunDenied extends runFailureBase {}
const Failure = Schema.Struct({
    _tag: Schema.Literal('AgentRunDenied'),
    reason: Schema.Literal('denied', 'conflict', 'invalid', 'unavailable', 'missing'),
});

const Input = Schema.Union(
    Schema.Struct({ _tag: Schema.Literal('Literal'), value: JsonValue }),
    Schema.Struct({ _tag: Schema.Literal('Previous') })
);
const Step = Schema.Union(
    Schema.Struct({ _tag: Schema.Literal('Model'), input: Input }),
    Schema.Struct({
        _tag: Schema.Literal('Action'),
        input: Input,
        action: Schema.NonEmptyString,
        entityKey: Schema.NonEmptyString,
        approvalId: Schema.optional(Schema.NonEmptyString),
        deadline: Schema.optional(Schema.Number),
        expectedState: Schema.optional(Schema.String),
        expectedVersion: Schema.optional(Schema.String),
    })
);

/** Only fixed scripted definitions are admitted; module-bound runs await EVE-54 pin resolution/fencing. */
export const AgentRunInput = Schema.Struct({
    caller: CallerIdentity,
    runId: UuidV7,
    definition: Schema.Literal('scripted-v1'),
    steps: Schema.NonEmptyArray(Step),
});
export type AgentRunInput = typeof AgentRunInput.Type;
/** Control callers present their live identity, never a workflow execution id as bearer authority. */
export const AgentRunReference = Schema.Struct({ caller: CallerIdentity, runId: UuidV7 });
export type AgentRunReference = typeof AgentRunReference.Type;

/** Trusted policy must check current run/resource access and model-call approval, timing and state. No default grant exists. */
export class AgentRunAccess extends Context.Tag('@eventiva/server/AgentRunAccess')<
    AgentRunAccess,
    {
        /** Authorize every control operation and step boundary; completed Activities confer no current authority. */
        readonly check: (
            reference: AgentRunReference,
            operation: 'start' | 'status' | 'interrupt' | 'step',
            stepIndex?: number
        ) => Effect.Effect<void, AgentRunDenied>;
    }
>() {}

/** Provider-neutral model execution port; adapters own live model policy and external idempotency limitations. */
export class AgentRunModel extends Context.Tag('@eventiva/server/AgentRunModel')<
    AgentRunModel,
    {
        /** Execute one model call with a tenant-scoped, attempt-independent business key and validated JSON. */
        readonly call: (request: {
            readonly caller: CallerIdentity;
            readonly runId: string;
            readonly stepIndex: number;
            readonly idempotencyKey: string;
            readonly input: JsonValue;
            /** Emit approved text using a deterministic zero-based chunk index, reused unchanged on retry; await each emit. */
            readonly emit: (chunkIndex: number, text: string) => Effect.Effect<void, AgentRunDenied>;
        }) => Effect.Effect<JsonValue, AgentRunDenied>;
    }
>() {}

const Snapshot = Schema.Union(
    Schema.Struct({ state: Schema.Literal('pending') }),
    Schema.Struct({ state: Schema.Literal('succeeded'), output: JsonValue }),
    Schema.Struct({ state: Schema.Literal('failed') })
);

const Run = Workflow.make({
    name: 'EventivaAgentRun-v1',
    payload: { accepted: AgentRunInput },
    success: JsonValue,
    error: Failure,
    /** Input conflicts are rejected in Storage before this stable execution identity is used. */
    idempotencyKey: ({ accepted }) => entityId(accepted.caller, accepted.runId),
}).annotate(
    ShardGroup,
    /** Share the backend's registered workflow/action placement group in every edition. */
    () => 'eventiva-actions'
);

const Control = Entity.make('EventivaAgentRunControl-v1', [
    Rpc.make('Start', { payload: AgentRunInput, success: Schema.String, error: Failure }).annotate(Persisted, true),
    Rpc.make('Status', { payload: AgentRunReference, success: Snapshot, error: Failure }).annotate(Persisted, true),
    Rpc.make('Interrupt', { payload: AgentRunReference, error: Failure }).annotate(Persisted, true),
]).annotate(
    ShardGroup,
    /** Keep per-run control independent of workflow execution while retaining the common shard group. */
    () => 'eventiva-actions'
);

/** Canonical JSON distinguishes changed definitions without depending on transport property ordering. */
const canonical = <A>(value: A) =>
    canonicalJson(value).pipe(
        Either.mapLeft(
            /** Do not expose rejected data or parser diagnostics across the run boundary. */
            () => new AgentRunDenied({ reason: 'invalid' })
        )
    );

/** Resolve current identity and enforce tenant/address integrity before any stored input/result is read. */
const authorize = (reference: AgentRunReference, operation: 'start' | 'status' | 'interrupt' | 'step', step?: number) =>
    Effect.gen(
        /** Refresh authority before performing any tenant-routed lookup. */ function* () {
            const resolver = yield* IdentityResolver;
            const caller = yield* resolver.resolve(reference.caller);
            if (caller.tenant === undefined || (yield* canonical(caller)) !== (yield* canonical(reference.caller)))
                return yield* new AgentRunDenied({ reason: 'denied' });
            // Policy is live even when the requested workflow or its Activities have completed.
            yield* (yield* AgentRunAccess).check({ ...reference, caller }, operation, step);
            return caller;
        }
    ).pipe(
        Effect.mapError(
            /** Identity diagnostics are not run data and must not escape this boundary. */
            () => new AgentRunDenied({ reason: 'denied' })
        )
    );

/** Route only after identity refresh and remove no tenant transaction context inside the route. */
const acceptedRun = (reference: AgentRunReference, candidate?: AgentRunInput) =>
    Effect.gen(
        /** Admit immutable input inside the authenticated tenant route only. */ function* () {
            const routing = yield* TenantRouter;
            const caller = reference.caller;
            if (caller.tenant === undefined) return yield* new AgentRunDenied({ reason: 'denied' });
            // Caller is supplied only after live identity refresh; the reference is never a database selector.
            return yield* routing
                .run(
                    caller.tenant,
                    Effect.gen(
                        /** Compare persisted acceptance after unique insertion, never overwrite it. */ function* () {
                            const store = yield* Storage;
                            if (candidate !== undefined) {
                                // A unique tenant-local record binds the logical id before Workflow.execute.
                                // A crash after acceptance can safely retry Start with exactly the same definition.
                                yield* store
                                    .create({
                                        id: candidate.runId,
                                        state: 'agent-run.accepted-v1',
                                        version: 0,
                                        leaseUntil: null,
                                        payload: yield* canonical(candidate).pipe(Effect.flatMap(Schema.decode(Json))),
                                    })
                                    .pipe(
                                        Effect.catchTag(
                                            'StorageConflict',
                                            /** Only a unique-id collision is eligible for immutable-input comparison. */
                                            (error) => (error.reason === 'duplicate' ? Effect.void : Effect.fail(error))
                                        )
                                    );
                            }
                            const record = yield* store.get(reference.runId);
                            if (record === undefined) return yield* new AgentRunDenied({ reason: 'missing' });
                            if (record.state !== 'agent-run.accepted-v1')
                                return yield* new AgentRunDenied({ reason: 'conflict' });
                            const accepted = yield* Schema.decodeUnknown(AgentRunInput)(record.payload);
                            // The same tenant cannot read another principal's cached confidential output.
                            if ((yield* canonical(accepted.caller)) !== (yield* canonical(caller)))
                                return yield* new AgentRunDenied({ reason: 'denied' });
                            if (
                                candidate !== undefined &&
                                (yield* canonical(accepted)) !== (yield* canonical(candidate))
                            )
                                return yield* new AgentRunDenied({ reason: 'conflict' });
                            return accepted;
                        }
                    )
                )
                .pipe(Effect.provideService(Caller, caller));
        }
    ).pipe(
        Effect.catchTags({
            /** Storage/parser/routing diagnostics never disclose the stored definition. */
            StorageFailure: () => Effect.fail(new AgentRunDenied({ reason: 'unavailable' })),
            /** Non-duplicate storage conflicts remain safe input conflicts. */
            StorageConflict: () => Effect.fail(new AgentRunDenied({ reason: 'conflict' })),
            /** Malformed stored data cannot be executed using a fallback definition. */
            ParseError: () => Effect.fail(new AgentRunDenied({ reason: 'invalid' })),
            /** Do not reveal another routed tenant's existence. */
            RoutingDenied: () => Effect.fail(new AgentRunDenied({ reason: 'denied' })),
        })
    );

/** Reauthorize an accepted run for confidential output reads without treating an execution id as authority. */
export const authorizeAgentOutput = (reference: AgentRunReference) =>
    Effect.gen(
        /** Current identity and run ownership precede every page, including reads after completion. */ function* () {
            yield* authorize(reference, 'status');
            yield* acceptedRun(reference);
        }
    );

/** Register the reusable run and short control entity before backend membership readiness. Required adapters have no fallback. */
export const registerAgentRuns = Effect.gen(
    /** Capture only trusted adapters and register before backend readiness opens. */ function* () {
        // Missing execution adapters fail before either registration or acceptance.
        const modelPort = yield* Effect.serviceOption(AgentRunModel);
        const accessPort = yield* Effect.serviceOption(AgentRunAccess);
        const outputPort = yield* Effect.serviceOption(AgentOutputLog);
        if (Option.isNone(modelPort) || Option.isNone(accessPort) || Option.isNone(outputPort))
            return yield* new AgentRunDenied({ reason: 'unavailable' });
        const model = modelPort.value;
        const output = outputPort.value;
        const dependencies = (yield* Effect.context<IdentityResolver | TenantRouter | ClusterActions>()).pipe(
            Context.pick(IdentityResolver, TenantRouter, ClusterActions),
            Context.add(AgentRunAccess, accessPort.value)
        );
        // Do not capture bootstrap Scope, WorkflowInstance, Caller or transaction services.
        const actions = Context.get(dependencies, ClusterActions);
        /** Persist only explicitly selected output through the same authenticated tenant route as run acceptance. */
        const append = (accepted: AgentRunInput, stepIndex: number, eventId: string, payload: OutputPayload) =>
            Effect.gen(
                /** The identity is allocated by orchestration before the retryable SQL effect, never by the adapter. */ function* () {
                    const caller = yield* authorize(accepted, 'step', stepIndex);
                    if (caller.tenant === undefined) return yield* new AgentRunDenied({ reason: 'denied' });
                    yield* Context.get(dependencies, TenantRouter)
                        .run(caller.tenant, output.append({ runId: accepted.runId, eventId, payload }))
                        .pipe(Effect.provideService(Caller, caller));
                }
            ).pipe(
                Effect.provide(dependencies),
                Effect.mapError(
                    /** Output failure cannot expose raw provider text or SQL diagnostics. */ () =>
                        new AgentRunDenied({ reason: 'unavailable' })
                )
            );
        yield* Layer.build(
            Run.toLayer(
                /** Replay only pure input selection; each raw model/action entry belongs to one persisted Activity. */
                ({ accepted }) =>
                    Effect.gen(
                        /** Recover ordered Activity outputs before selecting the next call's input. */ function* () {
                            let previous: JsonValue = null;
                            for (const [offset, step] of accepted.steps.entries()) {
                                const stepIndex = offset + 1;
                                const input: JsonValue = step.input._tag === 'Previous' ? previous : step.input.value;
                                // This boundary runs after the previous Activity's durable reply, including on replay.
                                yield* authorize(accepted, 'step', stepIndex);
                                previous = yield* Activity.make<
                                    AgentRunAccess | IdentityResolver,
                                    typeof JsonValue,
                                    typeof Failure
                                >({
                                    name: `step:${stepIndex}:${step._tag}`,
                                    success: JsonValue,
                                    error: Failure,
                                    execute: Effect.gen(
                                        /** Reauthorize at the raw effect boundary before invoking the injected executor. */ function* () {
                                            const caller = yield* authorize(accepted, 'step', stepIndex);
                                            const idempotencyKey = `${accepted.runId}:${stepIndex}`;
                                            if (step._tag === 'Model') {
                                                const result: JsonValue = yield* model.call({
                                                    caller,
                                                    runId: accepted.runId,
                                                    stepIndex,
                                                    idempotencyKey,
                                                    input,
                                                    /** Stable producer ordinals deduplicate an unfinished model Activity after runner loss. */
                                                    emit: (chunkIndex, text) => {
                                                        if (!Number.isSafeInteger(chunkIndex) || chunkIndex < 0)
                                                            return Effect.fail(
                                                                new AgentRunDenied({ reason: 'invalid' })
                                                            );
                                                        return append(
                                                            accepted,
                                                            stepIndex,
                                                            `step:${stepIndex}:text:${chunkIndex}`,
                                                            { _tag: 'Text', text }
                                                        );
                                                    },
                                                });
                                                yield* append(accepted, stepIndex, `step:${stepIndex}:complete`, {
                                                    _tag: 'StepCompleted',
                                                    stepIndex,
                                                });
                                                return result;
                                            }
                                            // ClusterActions reaches the same authorized ActionHost and tenant A1 transaction.
                                            const result: Effect.Effect.Success<
                                                ReturnType<ClusterActions['Type']['execute']>
                                            > = yield* actions
                                                .execute({
                                                    caller,
                                                    entityKey: step.entityKey,
                                                    action: step.action,
                                                    input,
                                                    intent: {
                                                        idempotencyKey,
                                                        ...(step.approvalId === undefined
                                                            ? {}
                                                            : { approvalId: step.approvalId }),
                                                        ...(step.deadline === undefined
                                                            ? {}
                                                            : { deadline: step.deadline }),
                                                        ...(step.expectedState === undefined
                                                            ? {}
                                                            : { expectedState: step.expectedState }),
                                                        ...(step.expectedVersion === undefined
                                                            ? {}
                                                            : { expectedVersion: step.expectedVersion }),
                                                    },
                                                })
                                                .pipe(
                                                    Effect.mapError(
                                                        /** Preserve fail-closed tool denial without leaking action internals. */
                                                        () => new AgentRunDenied({ reason: 'denied' })
                                                    )
                                                );
                                            // Completion metadata is safe; never implicitly copy tool output or its input into this log.
                                            yield* append(accepted, stepIndex, `step:${stepIndex}:complete`, {
                                                _tag: 'StepCompleted',
                                                stepIndex,
                                            });
                                            return result.output;
                                        }
                                    ),
                                });
                            }
                            return previous;
                        }
                    ).pipe(Effect.provide(dependencies))
            )
        );
        yield* Layer.build(
            Control.toLayer(
                Effect.gen(
                    /** Bind short control handlers to their tenant-namespaced entity address. */ function* () {
                        const address = yield* Entity.CurrentAddress;
                        /** Validate the receiving entity address before accepting, querying or interrupting work. */
                        const access = (reference: AgentRunReference, operation: 'start' | 'status' | 'interrupt') =>
                            Effect.gen(
                                /** Reject mismatched addresses even when identity resolution succeeds. */ function* () {
                                    const caller = yield* authorize(reference, operation);
                                    // A valid tenant identity still cannot address another run's control mailbox.
                                    if (entityId(caller, reference.runId) !== address.entityId)
                                        return yield* new AgentRunDenied({ reason: 'denied' });
                                }
                            ).pipe(Effect.provide(dependencies));
                        return {
                            /** Persist acceptance then submit without awaiting the Workflow lifetime. */
                            Start: ({ payload }: { readonly payload: AgentRunInput }) =>
                                Effect.gen(
                                    /** Bind the complete accepted definition before enqueueing durable execution. */ function* () {
                                        yield* access(payload, 'start');
                                        const first = payload.steps[0];
                                        if (first.input._tag === 'Previous')
                                            return yield* new AgentRunDenied({ reason: 'invalid' });
                                        // Acceptance must win unique insertion before Workflow idempotency can hide input changes.
                                        const accepted = yield* acceptedRun(payload, payload).pipe(
                                            Effect.provide(dependencies)
                                        );
                                        return yield* Run.execute({ accepted }, { discard: true });
                                    }
                                ),
                            /** Reauthorize before looking up even a previously completed Workflow result. */
                            Status: ({ payload }: { readonly payload: AgentRunReference }) =>
                                Effect.gen(
                                    /** Live access precedes any potentially confidential cached output lookup. */ function* () {
                                        yield* access(payload, 'status');
                                        // Reconstruct the execution id from accepted input, never from a bearer-supplied id.
                                        const accepted = yield* acceptedRun(payload).pipe(Effect.provide(dependencies));
                                        const result = yield* Run.poll(yield* Run.executionId({ accepted }));
                                        if (result?._tag !== 'Complete') return { state: 'pending' as const };
                                        return Exit.isSuccess(result.exit)
                                            ? { state: 'succeeded' as const, output: result.exit.value }
                                            : { state: 'failed' as const };
                                    }
                                ),
                            /** Send the engine's interrupt signal; do not await completion or disclose output. */
                            Interrupt: ({ payload }: { readonly payload: AgentRunReference }) =>
                                Effect.gen(
                                    /** Only an authorized principal may signal this exact accepted run. */ function* () {
                                        yield* access(payload, 'interrupt');
                                        // Use accepted identity so cancellation cannot target a different cached execution.
                                        const accepted = yield* acceptedRun(payload).pipe(Effect.provide(dependencies));
                                        yield* Run.interrupt(yield* Run.executionId({ accepted }));
                                    }
                                ),
                        };
                    }
                ),
                { concurrency: 1 }
            )
        );
    }
);

/** Obtain an internal run handle from the existing Sharding service; never expose raw persisted replies publicly. */
export const agentRuns = Effect.gen(
    /** Create fresh per-invocation transports over the existing internal Sharding service. */ function* () {
        const client = yield* Control.client;
        return {
            /** Fresh transport invocation ids preserve conflict and live-access checks for duplicate starts. */
            start: (input: AgentRunInput) => client(entityId(input.caller, input.runId)).Start(input),
            /** Query by tenant/principal-bound logical run identity, not a caller-selected execution id. */
            status: (reference: AgentRunReference) =>
                client(entityId(reference.caller, reference.runId)).Status(reference),
            /** Signal cancellation through a short per-run handler without occupying the execution entity. */
            interrupt: (reference: AgentRunReference) =>
                client(entityId(reference.caller, reference.runId)).Interrupt(reference),
        };
    }
);
