/**
 * @file apps/server/tests/agent-run.spec.ts
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

import * as ClusterWorkflowEngine from '@effect/cluster/ClusterWorkflowEngine';
import * as MessageStorage from '@effect/cluster/MessageStorage';
import * as RunnerHealth from '@effect/cluster/RunnerHealth';
import * as Runners from '@effect/cluster/Runners';
import * as RunnerStorage from '@effect/cluster/RunnerStorage';
import * as Sharding from '@effect/cluster/Sharding';
import * as ShardingConfig from '@effect/cluster/ShardingConfig';
import { describe, expect, it } from '@effect/vitest';
import { define } from '@eventiva/contracts/action';
import { AgentOutputLog, AgentOutputFailure, type OutputEvent } from '@eventiva/contracts/agent-output';
import { CallerIdentity } from '@eventiva/contracts/caller';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import {
    Conflict,
    JsonValue,
    type RecordValue,
    RoutingDenied,
    Storage,
    StorageFailure,
} from '@eventiva/contracts/storage';
import { router } from '@eventiva/integrations.sql/router';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { IdentityResolver } from '@eventiva/runtime/invocation';
import { makeTestOnlyHarness, testOnlyDigest } from '@eventiva/runtime/testing';
import { Clock, Context, Deferred, Effect, Either, Layer, Ref, Schema } from 'effect';
import {
    AgentRunAccess,
    AgentRunDenied,
    AgentRunInput,
    AgentRunModel,
    agentRuns,
    registerAgentRuns,
} from '../src/agent-run.ts';
import {
    ClusterActionDenied,
    ClusterActionExecutor,
    ClusterActions,
    ClusterActionsLive,
} from '../src/cluster-actions.ts';
import { DeploymentProfile, shardingConfig } from '../src/cluster-profile.ts';

const caller = Schema.decodeUnknownSync(CallerIdentity)({
    subject: '019b0000-0000-7000-8000-000000000011',
    session: '019b0000-0000-7000-8000-000000000021',
    tenant: '019b0000-0000-7000-8000-000000000001',
    kind: 'human',
});
const input: AgentRunInput = {
    caller,
    runId: '019b0000-0000-7000-8000-000000001001',
    definition: 'scripted-v1',
    steps: [{ _tag: 'Model', input: { _tag: 'Literal', value: 13 } }],
};

/** Trusted adapter fault inputs exercise the public handle without changing the Workflow implementation. */
interface FixtureOptions {
    readonly host?: ActionHost['Type'];
    readonly identity?: CallerIdentity;
    readonly createError?: StorageFailure | Conflict;
    readonly getError?: StorageFailure;
    readonly routeDenied?: boolean;
    readonly records?: ReadonlyArray<RecordValue>;
    readonly model?: AgentRunModel['Type'];
    readonly outputFailure?: boolean;
}

/** Volatile protocol fixture only; the independent SQL harness supplies all durability and kill evidence. */
const fixture = (options: FixtureOptions = {}) =>
    Effect.gen(
        /** Compose volatile protocol services with the real ClusterWorkflowEngine implementation. */ function* () {
            // Only the independent process harness may establish SQL transaction/recovery evidence.
            const records = new Map<string, RecordValue>(
                options.records?.map(
                    /** Seed only adapter-visible storage, never the Workflow's private result cache. */
                    (record) => [record.id, record]
                )
            );
            const unavailable = Effect.fail(new StorageFailure({ operation: 'unused-test-operation' }));
            const store = Storage.of({
                capabilities: { transactions: true, compareAndSet: true, appendOnlyLedger: true, device: false },
                ready: Effect.void,
                /** Preserve test scope; this fixture never claims transaction or durability evidence. */
                transaction: (effect) => effect,
                /** Reject unused mutation paths rather than silently emulating business integrity. */
                commit: () => unavailable,
                /** Mirror unique record admission so duplicate Start exercises the source contract. */
                create: (record) =>
                    Effect.suspend(
                        /** One synchronous map insertion models only the unique-id conflict, not SQL concurrency. */
                        () => {
                            // Neither an injected failure nor a duplicate may mutate the acceptance map.
                            if (options.createError !== undefined) return Effect.fail(options.createError);
                            if (records.has(record.id))
                                return Effect.fail(new Conflict({ id: record.id, reason: 'duplicate' }));
                            records.set(record.id, record);
                            return Effect.void;
                        }
                    ),
                /** Return only this test's accepted definitions. */
                get: (id) =>
                    options.getError === undefined
                        ? Effect.sync(
                              /** Read the volatile fixture without introducing a second run executor. */
                              () => records.get(id)
                          )
                        : Effect.fail(options.getError),
                /** Fail unused state transitions closed. */
                compareAndSet: () => unavailable,
                /** Fail unused stock initialization closed. */
                stock: () => unavailable,
                /** Fail unused stock queries closed. */
                available: () => unavailable,
                /** Fail unused reservations closed. */
                reserve: () => unavailable,
                /** Fail unused settlements closed. */
                settle: () => unavailable,
                expire: unavailable,
                /** Fail unused payment reconciliation closed. */
                reconcile: () => unavailable,
                /** Fail unused outbox writes closed. */
                enqueue: () => unavailable,
                /** Fail unused audit writes closed. */
                audit: () => unavailable,
            });
            const allowed = yield* Ref.make(true);
            const output: Array<OutputEvent> = [];
            const log = AgentOutputLog.of({
                /** Volatile protocol capture only; SQL fixtures own retry/transaction durability evidence. */
                append: (event) =>
                    Effect.suspend(
                        /** Reject injected storage outages without swallowing the failed append. */ () => {
                            // Refuse before capture so the failure control cannot leave an apparently released event behind.
                            if (options.outputFailure)
                                return Effect.fail(new AgentOutputFailure({ reason: 'unavailable' }));
                            const value = { ...event, tenant: caller.tenant!, offset: output.length };
                            output.push(value);
                            return Effect.succeed(value);
                        }
                    ),
                /** No read acceptance is claimed from this volatile capture. */
                read: () => Effect.succeed([]),
            });
            const calls = yield* Ref.make(0);
            const stepDenied = yield* Deferred.make<void>();
            const access = AgentRunAccess.of({
                /** Simulate live policy revocation independently of completed Workflow data. */
                check: (_reference, operation) =>
                    Ref.get(allowed).pipe(
                        Effect.flatMap(
                            /** Convert current policy state into an explicit typed refusal. */
                            (value) =>
                                value
                                    ? Effect.void
                                    : (operation === 'step'
                                          ? Deferred.succeed(stepDenied, undefined)
                                          : Effect.void
                                      ).pipe(Effect.zipRight(Effect.fail(new AgentRunDenied({ reason: 'denied' }))))
                        )
                    ),
            });
            const model =
                options.model ??
                AgentRunModel.of({
                    /** Count real Activity executor entries and return an asymmetric deterministic result. */
                    call: () =>
                        Ref.update(
                            calls,
                            /** Preserve entry count even if a later policy check rejects a control call. */
                            (count) => count + 1
                        ).pipe(Effect.as(41)),
                });
            const profile = yield* Schema.decodeUnknown(DeploymentProfile)({
                edition: 'community',
                assignmentRefreshMs: 10,
            });
            const cluster = Sharding.layer.pipe(
                Layer.provideMerge(Runners.layerNoop),
                Layer.provideMerge(MessageStorage.layerMemory),
                Layer.provide(RunnerStorage.layerMemory),
                Layer.provide(RunnerHealth.layerNoop),
                Layer.provide(ShardingConfig.layer(shardingConfig(profile)))
            );
            const context = yield* Layer.build(ClusterWorkflowEngine.layer.pipe(Layer.provideMerge(cluster)));
            const identity = Layer.succeed(IdentityResolver, {
                /** This protocol fixture accepts only the immutable presented identity. */
                resolve: (presented) => Effect.succeed(options.identity ?? presented),
            });
            const actionLayer =
                options.host === undefined
                    ? Layer.succeed(ClusterActions, {
                          /** A model-only fixture must never silently execute a tool outside ActionHost. */
                          execute: () => Effect.fail(new ClusterActionDenied({ reason: 'unavailable' })),
                      })
                    : ClusterActionsLive.pipe(
                          Layer.provide(Layer.succeed(ClusterActionExecutor, { execute: options.host.execute })),
                          Layer.provide(identity),
                          Layer.provide(Layer.succeedContext(context))
                      );
            // Keep registered action entities alive for the entire test, not only run registration.
            const security = yield* Layer.build(
                Layer.mergeAll(
                    identity,
                    actionLayer,
                    router(
                        /** Bind the volatile fixture only after the real router has checked Caller/tenant scope. */
                        () => Effect.succeed(store),
                        /** Run access is independently checked by AgentRunAccess in these protocol cases. */
                        () =>
                            options.routeDenied
                                ? Effect.fail(new RoutingDenied({ reason: 'test-route-denied' }))
                                : Effect.void
                    )
                )
            );
            const registration = registerAgentRuns.pipe(
                Effect.provide(security),
                Effect.provide(context),
                Effect.provideService(AgentOutputLog, log)
            );
            yield* registration.pipe(
                Effect.provideService(AgentRunModel, model),
                Effect.provideService(AgentRunAccess, access)
            );
            return {
                runs: yield* agentRuns.pipe(Effect.provide(context)),
                allowed,
                calls,
                registration,
                model,
                access,
                stepDenied,
                output,
            };
        }
    );

describe('AgentRun internal handle', /** Exercise the reusable Workflow source without claiming process recovery. */ function agentRunContract() {
    it.scopedLive(
        'persists explicitly emitted chunks before completion and fails closed when emission is invalid or unavailable',
        /** Probe the public model emission callback without asserting private Workflow implementation details. */ () =>
            Effect.gen(
                /** Accepted input is confidential unless the trusted producer deliberately releases text. */ function* () {
                    // Keep emitted text fixed while varying ordinal validity and storage availability to isolate each release boundary.
                    for (const [index, outputFailure, state] of [
                        [0, false, 'succeeded'],
                        [-1, false, 'failed'],
                        [0.5, false, 'failed'],
                        [0, true, 'failed'],
                    ] as const) {
                        const h = yield* fixture({
                            outputFailure,
                            model: {
                                /** The adapter chooses a stable producer ordinal, never an attempt/PID-generated event key. */
                                call: ({ emit }) => emit(index, 'approved-text').pipe(Effect.as(17)),
                            },
                        });
                        yield* h.runs.start(input);
                        expect(
                            yield* h.runs.status(input).pipe(
                                Effect.delay('10 millis'),
                                Effect.repeat({
                                    /** Wait for the logical run's public terminal state. */ until: (value) =>
                                        value.state !== 'pending',
                                }),
                                Effect.timeout('10 seconds')
                            )
                        ).toEqual(state === 'succeeded' ? { state, output: 17 } : { state });
                        expect(
                            h.output.map(
                                /** Compare only the public release payload sequence. */ (event) => event.payload
                            )
                        ).toEqual(
                            state === 'succeeded'
                                ? [
                                      { _tag: 'Text', text: 'approved-text' },
                                      { _tag: 'StepCompleted', stepIndex: 1 },
                                  ]
                                : []
                        );
                    }
                }
            ),
        15000
    );
    it.scopedLive(
        'binds immutable input and reauthorizes cached status, duplicate Start and interruption',
        /** Public handle behavior must remain invariant across orchestration refactors. */
        () =>
            Effect.gen(
                /** Check identity binding and live access via the public internal handle. */ function* () {
                    const h = yield* fixture();
                    const execution = yield* h.runs.start(input);
                    const completed = yield* h.runs.status(input).pipe(
                        Effect.delay('10 millis'),
                        Effect.repeat({
                            /** Wait for persisted protocol completion, not a fixed timing sleep. */
                            until: (value) => value.state !== 'pending',
                        }),
                        Effect.timeout('10 seconds')
                    );
                    expect(completed).toEqual({ state: 'succeeded', output: 41 });
                    expect(yield* h.runs.start(input)).toBe(execution);
                    expect(yield* Ref.get(h.calls)).toBe(1);
                    expect(
                        yield* h.runs
                            .start({ ...input, steps: [{ _tag: 'Model', input: { _tag: 'Literal', value: 14 } }] })
                            .pipe(Effect.either)
                    ).toMatchObject({ left: { _tag: 'AgentRunDenied', reason: 'conflict' } });
                    const foreign = Schema.decodeUnknownSync(CallerIdentity)({
                        ...caller,
                        tenant: '019b0000-0000-7000-8000-000000000099',
                    });
                    expect(yield* h.runs.status({ ...input, caller: foreign }).pipe(Effect.either)).toMatchObject({
                        left: { reason: 'denied' },
                    });
                    yield* h.runs.interrupt(input);
                    yield* Ref.set(h.allowed, false);
                    // Completed output does not authorize a new control invocation.
                    for (const operation of [h.runs.start(input), h.runs.status(input), h.runs.interrupt(input)])
                        expect(yield* Effect.either(operation)).toMatchObject({ left: { reason: 'denied' } });
                    expect(yield* Ref.get(h.calls)).toBe(1);
                }
            ),
        15000
    );
    it.scopedLive(
        'rejects missing mandatory execution services before registration or input acceptance',
        /** Remove one injected port at a time; neither may gain a production fallback. */
        () =>
            Effect.gen(
                /** Missing ports must fail before the existing fixture can register a duplicate handler. */ function* () {
                    // The fixture already owns a registration, so unavailable must win over duplicate-name rejection.
                    const h = yield* fixture();
                    expect(
                        yield* h.registration.pipe(Effect.provideService(AgentRunModel, h.model), Effect.either)
                    ).toMatchObject({ left: { reason: 'unavailable' } });
                    expect(
                        yield* h.registration.pipe(Effect.provideService(AgentRunAccess, h.access), Effect.either)
                    ).toMatchObject({ left: { reason: 'unavailable' } });
                }
            )
    );
    it.scopedLive(
        'composes model and real ActionHost results with stable business keys and optional action constraints',
        /** Exercise actual authorized dispatch, not a stub that merely records an execute call. */
        () =>
            Effect.gen(
                /** Assert observable domain effects and output through the public run handle. */ function* () {
                    // Observable domain writes distinguish real host dispatch from a model that merely echoes success.
                    const audit = yield* makeTestOnlyHarness(caller);
                    const host = Context.get(
                        yield* Layer.build(
                            ActionHostLive.pipe(Layer.provide(audit.TestOnly), Layer.provide(FlagsSafeDefaults))
                        ),
                        ActionHost
                    );
                    const action = define('fixture.run', {
                        version: 1,
                        description: 'AgentRun action dispatch.',
                        input: Schema.Number,
                        output: Schema.Number,
                        permission: 'fixture.run',
                        sideEffect: 'write',
                        offline: 'queued',
                    });
                    yield* host.register({
                        manifest: {
                            format: 1,
                            id: 'fixture',
                            version: '1.0.0',
                            description: 'Run fixture.',
                            actions: [action.name],
                            flags: [],
                        },
                        actions: [
                            implement(
                                action,
                                /** Only the real host's integrity transaction may publish this synthetic domain write. */
                                (value) => audit.ledger.stage('domain', value).pipe(Effect.as(value * 3 + 1))
                            ),
                        ],
                    });
                    const h = yield* fixture({
                        host,
                        model: {
                            /** Echo selected inputs so broken Previous selection or step numbering changes final output. */
                            call: (request) =>
                                Effect.succeed(
                                    request.stepIndex === 1
                                        ? request.input
                                        : {
                                              previous: request.input,
                                              key: request.idempotencyKey,
                                              step: request.stepIndex,
                                          }
                                ),
                        },
                    });
                    const now = yield* Clock.currentTimeMillis;
                    yield* Ref.set(
                        audit.approvals,
                        new Map([
                            [
                                'approved',
                                {
                                    principal: caller.subject,
                                    tenant: caller.tenant,
                                    action: 'fixture.run',
                                    version: 1,
                                    inputHash: testOnlyDigest('13'),
                                    limits: {},
                                    approver: caller,
                                    issuedAt: now,
                                    expiresAt: now + 60000,
                                    stepUp: false,
                                },
                            ],
                        ])
                    );
                    yield* Ref.update(
                        audit.policy,
                        /** Require a real approval lookup on the constrained run. */
                        (policy) => ({ ...policy, approval: 'confirm' as const })
                    );
                    const constrained: AgentRunInput = {
                        ...input,
                        steps: [
                            input.steps[0],
                            {
                                _tag: 'Action',
                                action: action.name,
                                entityKey: 'resource:13',
                                input: { _tag: 'Previous' },
                                approvalId: 'approved',
                                deadline: now + 60000,
                                expectedState: 'open',
                                expectedVersion: '1',
                            },
                            { _tag: 'Model', input: { _tag: 'Previous' } },
                        ],
                    };
                    yield* h.runs.start(constrained);
                    const result = yield* h.runs.status(constrained).pipe(
                        Effect.delay('10 millis'),
                        Effect.repeat({
                            /** Wait for a final public result, not incidental scheduler ordering. */
                            until: (snapshot) => snapshot.state !== 'pending',
                        }),
                        Effect.timeout('10 seconds')
                    );
                    expect(result).toEqual({
                        state: 'succeeded',
                        output: { previous: 40, key: `${input.runId}:3`, step: 3 },
                    });
                    const committed = yield* Ref.get(audit.state);
                    expect(committed.domain).toEqual([13]);
                    expect(committed.receipts).toHaveLength(1);
                    expect(committed.receipts[0]).toMatchObject({ caller, action: action.name, outcome: 'succeeded' });
                    expect([...committed.dedup.keys()][0]).toContain(`${input.runId}:2`);
                    yield* Ref.update(
                        audit.policy,
                        /** The second run intentionally omits every optional action constraint. */
                        (policy) => ({ ...policy, approval: 'none' as const })
                    );
                    // This positive control detects a dispatcher that incorrectly requires every optional constraint.
                    const plain: AgentRunInput = {
                        ...input,
                        runId: '019b0000-0000-7000-8000-000000001002',
                        steps: [
                            {
                                _tag: 'Action',
                                action: action.name,
                                entityKey: 'resource:7',
                                input: { _tag: 'Literal', value: 7 },
                            },
                        ],
                    };
                    yield* h.runs.start(plain);
                    expect(
                        yield* h.runs.status(plain).pipe(
                            Effect.delay('10 millis'),
                            Effect.repeat({
                                /** Verify the unconstrained path independently of the preceding approved call. */
                                until: (snapshot) => snapshot.state !== 'pending',
                            }),
                            Effect.timeout('10 seconds')
                        )
                    ).toEqual({ state: 'succeeded', output: 22 });
                    expect((yield* Ref.get(audit.state)).domain).toEqual([13, 7]);
                    yield* Ref.update(
                        audit.policy,
                        /** Each constraint must independently reach the real host rather than be dropped by run dispatch. */
                        (policy) => ({ ...policy, approval: 'confirm' as const })
                    );
                    // Change one otherwise-valid constraint per run so a dropped field would permit another write.
                    const constraints = [
                        { approvalId: 'missing' },
                        { deadline: now - 1 },
                        { expectedState: 'closed' },
                        { expectedVersion: '0' },
                    ];
                    for (const [index, constraint] of constraints.entries()) {
                        const rejected: AgentRunInput = {
                            ...input,
                            runId: `019b0000-0000-7000-8000-00000000200${index}`,
                            steps: [
                                {
                                    _tag: 'Action',
                                    action: action.name,
                                    entityKey: 'resource:13',
                                    input: { _tag: 'Literal', value: 13 },
                                    approvalId: 'approved',
                                    deadline: now + 60000,
                                    expectedState: 'open',
                                    expectedVersion: '1',
                                    ...constraint,
                                },
                            ],
                        };
                        yield* h.runs.start(rejected);
                        expect(
                            yield* h.runs.status(rejected).pipe(
                                Effect.delay('10 millis'),
                                Effect.repeat({
                                    /** A dropped constraint would incorrectly publish a successful result and domain write. */
                                    until: (snapshot) => snapshot.state !== 'pending',
                                }),
                                Effect.timeout('10 seconds')
                            )
                        ).toEqual({ state: 'failed' });
                        expect((yield* Ref.get(audit.state)).domain).toEqual([13, 7]);
                    }
                    yield* Ref.update(
                        audit.policy,
                        /** Isolate permission revocation from the approval failures above. */
                        (policy) => ({ ...policy, approval: 'none' as const })
                    );
                    // Remove approval requirements before revocation so an approval rejection cannot mask host denial.
                    yield* Ref.set(audit.authorization, { invoke: false, input: true });
                    const denied = { ...plain, runId: '019b0000-0000-7000-8000-000000001003' };
                    yield* h.runs.start(denied);
                    expect(
                        yield* h.runs.status(denied).pipe(
                            Effect.delay('10 millis'),
                            Effect.repeat({
                                /** A host denial must become a sanitized failed run, never a successful cached output. */
                                until: (snapshot) => snapshot.state !== 'pending',
                            }),
                            Effect.timeout('10 seconds')
                        )
                    ).toEqual({ state: 'failed' });
                    expect((yield* Ref.get(audit.state)).domain).toEqual([13, 7]);
                }
            ),
        15000
    );
    it.scopedLive(
        'fails closed for missing, malformed, foreign and unavailable acceptance records and invalid first input',
        /** Fault adapters through their public ports; never invoke private run helpers. */
        () =>
            Effect.gen(
                /** Storage corruption and outages must not turn into a new execution or expose stored input. */ function* () {
                    const accepted: RecordValue = {
                        id: input.runId,
                        state: 'agent-run.accepted-v1',
                        version: 0,
                        leaseUntil: null,
                        payload: Schema.decodeUnknownSync(JsonValue)(input),
                    };
                    const cases: ReadonlyArray<readonly [FixtureOptions, 'start' | 'status', string]> = [
                        [{}, 'status', 'missing'],
                        [
                            { createError: new StorageFailure({ operation: 'synthetic-private-diagnostic' }) },
                            'start',
                            'unavailable',
                        ],
                        [{ createError: new Conflict({ id: input.runId, reason: 'stale' }) }, 'start', 'conflict'],
                        [
                            { getError: new StorageFailure({ operation: 'synthetic-private-diagnostic' }) },
                            'status',
                            'unavailable',
                        ],
                        [{ routeDenied: true }, 'status', 'denied'],
                        [{ records: [{ ...accepted, state: 'business-record' }] }, 'status', 'conflict'],
                        [
                            { records: [{ ...accepted, payload: { secret: 'malformed-acceptance' } }] },
                            'status',
                            'invalid',
                        ],
                        [
                            {
                                records: [
                                    {
                                        ...accepted,
                                        payload: Schema.decodeUnknownSync(JsonValue)({
                                            ...input,
                                            caller: { ...caller, session: '019b0000-0000-7000-8000-000000000022' },
                                        }),
                                    },
                                ],
                            },
                            'status',
                            'denied',
                        ],
                        [{ identity: { ...caller, tenant: undefined } }, 'start', 'denied'],
                        [
                            {
                                identity: {
                                    ...caller,
                                    subject: Schema.decodeUnknownSync(CallerIdentity)({
                                        ...caller,
                                        subject: '019b0000-0000-7000-8000-000000000099',
                                    }).subject,
                                },
                            },
                            'start',
                            'denied',
                        ],
                    ];
                    for (const [options, operation, reason] of cases) {
                        yield* Effect.scoped(
                            Effect.gen(
                                /** Close each independent actor set before testing the next adapter failure. */ function* () {
                                    const h = yield* fixture(options);
                                    const invoke =
                                        operation === 'start'
                                            ? h.runs.start(input).pipe(Effect.asVoid)
                                            : h.runs.status(input).pipe(Effect.asVoid);
                                    const result = yield* Effect.either(invoke);
                                    // A typed denial alone proves neither private-cause redaction nor refusal before model execution.
                                    expect(result).toMatchObject({
                                        _tag: 'Left',
                                        left: { _tag: 'AgentRunDenied', reason },
                                    });
                                    expect(JSON.stringify(result)).not.toContain('synthetic-private-diagnostic');
                                    expect(JSON.stringify(result)).not.toContain('malformed-acceptance');
                                    expect(yield* Ref.get(h.calls)).toBe(0);
                                }
                            )
                        );
                    }
                    // A valid pending record is the positive control against rejecting every acceptance indiscriminately.
                    const h = yield* fixture({ records: [accepted] });
                    expect(yield* h.runs.status(input)).toEqual({ state: 'pending' });
                    const invalid: AgentRunInput = {
                        ...input,
                        steps: [{ _tag: 'Model', input: { _tag: 'Previous' } }],
                    };
                    expect(yield* h.runs.start(invalid).pipe(Effect.either)).toMatchObject({
                        left: { reason: 'invalid' },
                    });
                    expect(yield* Ref.get(h.calls)).toBe(0);
                }
            ),
        15000
    );
    it.scopedLive(
        'keeps busy-run controls authorized and independent within one session',
        /** Volatile protocol proof complements, but cannot replace, the measured SQL process checkpoint. */
        () =>
            Effect.gen(
                /** Hold actual executor work while invoking the public per-run controls. */ function* () {
                    const entered = yield* Deferred.make<void>();
                    const release = yield* Deferred.make<void>();
                    const h = yield* fixture({
                        model: {
                            /** Hold only the selected run; another run in the same session must finish independently. */
                            call: (request) =>
                                request.runId === input.runId
                                    ? Deferred.succeed(entered, undefined).pipe(
                                          Effect.zipRight(Deferred.await(release)),
                                          Effect.as(19)
                                      )
                                    : Effect.succeed(73),
                        },
                    });
                    yield* h.runs.start(input);
                    yield* Deferred.await(entered).pipe(Effect.timeout('10 seconds'));
                    expect(yield* h.runs.status(input).pipe(Effect.timeout('1 second'))).toEqual({ state: 'pending' });
                    // Same-tenant but different session cannot signal the accepted run using its id.
                    const foreign = Schema.decodeUnknownSync(CallerIdentity)({
                        ...caller,
                        session: '019b0000-0000-7000-8000-000000000099',
                    });
                    expect(yield* h.runs.interrupt({ ...input, caller: foreign }).pipe(Effect.either)).toMatchObject({
                        left: { _tag: 'AgentRunDenied', reason: 'denied' },
                    });
                    const independent: AgentRunInput = {
                        ...input,
                        runId: '019b0000-0000-7000-8000-000000001002',
                    };
                    yield* h.runs.start(independent).pipe(Effect.timeout('1 second'));
                    expect(
                        yield* h.runs.status(independent).pipe(
                            Effect.delay('10 millis'),
                            Effect.repeat({
                                /** Completion must not wait for the first run's still-closed executor barrier. */
                                until: (snapshot) => snapshot.state !== 'pending',
                            }),
                            Effect.timeout('10 seconds')
                        )
                    ).toEqual({ state: 'succeeded', output: 73 });
                    yield* h.runs.interrupt(input).pipe(Effect.timeout('1 second'));
                    // A short signal reply must not be mistaken for a terminal cancellation snapshot.
                    expect(yield* h.runs.status(input)).toEqual({ state: 'pending' });
                    expect(yield* Deferred.isDone(release)).toBe(false);
                    expect(yield* h.runs.status(independent)).toEqual({ state: 'succeeded', output: 73 });
                    yield* Deferred.succeed(release, undefined);
                }
            ),
        15000
    );
    it.scopedLive(
        'returns pending without awaiting a model and denies the next effect after live revocation',
        /** A completed Activity output must not authorize dispatch of a later protected effect. */
        () =>
            Effect.gen(
                /** Coordinate at the public model port instead of relying on a sleep to hold execution. */ function* () {
                    const entered = yield* Deferred.make<void>();
                    const release = yield* Deferred.make<void>();
                    const entries = yield* Ref.make(0);
                    const h = yield* fixture({
                        model: {
                            /** Expose a deterministic in-flight boundary without changing the Workflow's implementation. */
                            call: () =>
                                Ref.update(
                                    entries,
                                    /** Count actual executor entry, not a cached Activity replay. */
                                    (count) => count + 1
                                ).pipe(
                                    Effect.zipRight(Deferred.succeed(entered, undefined)),
                                    Effect.zipRight(Deferred.await(release)),
                                    Effect.as(19)
                                ),
                        },
                    });
                    const protectedRun: AgentRunInput = {
                        ...input,
                        steps: [input.steps[0], { _tag: 'Model', input: { _tag: 'Previous' } }],
                    };
                    yield* h.runs.start(protectedRun);
                    yield* Deferred.await(entered).pipe(Effect.timeout('10 seconds'));
                    expect(yield* h.runs.status(protectedRun)).toEqual({ state: 'pending' });
                    yield* Ref.set(h.allowed, false);
                    yield* Deferred.succeed(release, undefined);
                    expect(yield* h.runs.status(protectedRun).pipe(Effect.either)).toMatchObject({
                        left: { reason: 'denied' },
                    });
                    yield* Deferred.await(h.stepDenied).pipe(Effect.timeout('10 seconds'));
                    // Wait for execution denial before restoring control access, so success cannot race the assertion.
                    yield* Ref.set(h.allowed, true);
                    expect(
                        yield* h.runs.status(protectedRun).pipe(
                            Effect.delay('10 millis'),
                            Effect.repeat({
                                /** Observe the persisted execution failure after live control access is restored. */
                                until: (snapshot) => snapshot.state !== 'pending',
                            }),
                            Effect.timeout('10 seconds')
                        )
                    ).toEqual({ state: 'failed' });
                    expect(yield* Ref.get(entries)).toBe(1);
                }
            ),
        15000
    );
    it('rejects invalid step data, non-JSON values and unimplemented module-bound definitions', /** Validate the wire contract independently of fixture serialization. */ function invalidWireInput() {
        // The schema is the transport contract, not a provider-specific SDK type.
        const decode = Schema.decodeUnknownEither(AgentRunInput);
        expect(Either.isRight(decode(input))).toBe(true);
        for (const invalid of [
            { ...input, steps: [] },
            { ...input, runId: 'not-a-run-id' },
            { ...input, definition: 'module-latest' },
            { ...input, steps: [{ _tag: 'Model', input: { _tag: 'Literal', value: undefined } }] },
            { ...input, steps: [{ _tag: 'Model', input: { _tag: 'Literal', value: 3n } }] },
            { ...input, steps: [{ _tag: 'Action', action: '', entityKey: 'x', input: { _tag: 'Previous' } }] },
        ])
            expect(Either.isLeft(decode(invalid))).toBe(true);
    });
});
