/**
 * @file tests/runtime/src/hook-telemetry.spec.ts
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

import { expect, it } from '@effect/vitest';
import { Flags } from '@eventiva/contracts/flags';
import {
    HookClaim,
    HookDeclaration,
    HookDenied,
    HookObserverFailure,
    HookOutbox,
    HookOutboxFailure,
    HookReleasePolicy,
    type HookSettlement,
} from '@eventiva/contracts/hook';
import { TelemetryRecord, TelemetrySink } from '@eventiva/contracts/observability';
import { HookDispatcher, HookDispatcherLive, HookSink } from '@eventiva/runtime/hook';
import { TelemetryControl, telemetryLayer } from '@eventiva/runtime/telemetry';
import { Cause, Context, Deferred, Effect, Exit, Fiber, Layer, Ref, Schema, TestClock } from 'effect';

/** Produce deterministic UUID-shaped canaries whose appearance in telemetry would expose private identifiers. */
const uuid = (n: number) => `019b0000-0000-7000-8000-${n.toString().padStart(12, '0')}`;
const owner = { module: 'private-module', version: '1.2.3', generation: 7 };
const declaration = Schema.decodeUnknownSync(HookDeclaration)({
    format: 1,
    pin: { tenant: uuid(1), owner, hook: 'private.observe', revision: 1 },
    delivery: 'post-commit',
    target: 'declarative',
    capability: { kind: 'observation' },
    observations: ['domain.change'],
    profiles: ['baseline'],
    maxAttempts: 2,
    retryDelayMs: 10,
    timeoutMs: 100,
    concurrency: 1,
    capacity: 4,
});
/** Decode a fixed private envelope with the selected attempt so exhaustion uses the same event and lease. */
const claim = (attempt: number) =>
    Schema.decodeUnknownSync(HookClaim)({
        pin: declaration.pin,
        lease: uuid(2),
        idempotencyKey: uuid(3),
        attempt,
        event: {
            format: 1,
            id: uuid(4),
            tenant: uuid(1),
            commit: uuid(5),
            resource: 'private.record',
            resourceId: uuid(6),
            purpose: 'private.notify',
            profile: 'baseline',
            operation: 'ordinary',
            sequence: 1,
            projection: { kind: 'domain.change', identity: owner, change: 'updated', revision: 1 },
        },
    });
const messages = {
    'hook.dispatch': 'Hook dispatch.',
    'hook.claim': 'Hook claim.',
    'hook.release': 'Hook release.',
    'hook.deliver': 'Hook delivery.',
    'hook.settle': 'Hook settlement.',
};
const outcomes = [
    'unloaded',
    'disabled',
    'empty',
    'delivered',
    'retry',
    'dead-letter',
    'succeeded',
    'failed',
    'interrupted',
    'timeout',
    'claimed',
    'settled',
];

for (const scenario of [
    'delivered',
    'retry',
    'exhausted',
    'disabled',
    'empty',
    'unloaded',
    'denied',
    'timeout',
    'release-timeout',
    'interrupted',
    'release-interrupted',
    'defect',
    'settlement-failed',
] as const) {
    it.scoped(
        `emits real bounded worker spans and preserves ${scenario} settlement`,
        /** Supply isolated scoped worker and telemetry state for this outcome scenario. */ () =>
            Effect.gen(
                /** Assert telemetry reflects real worker order without changing settlement or disclosing private data. */ function* () {
                    // Separate durable-protocol observations from emitted spans so telemetry cannot stand in for settlement proof.
                    const records = yield* Ref.make<ReadonlyArray<TelemetryRecord>>([]);
                    const settlements = yield* Ref.make<ReadonlyArray<HookSettlement>>([]);
                    const calls = yield* Ref.make<ReadonlyArray<string>>([]);
                    const started = yield* Deferred.make<void>();
                    const telemetry = telemetryLayer({
                        messages,
                        attributes: { 'eventiva.hook.outcome': outcomes }
                    }).pipe(
                        Layer.provide(
                            Layer.succeed(TelemetrySink, {
                                /** Capture emitted records in arrival order for parentage and privacy assertions. */
                                write: (record) =>
                                    Ref.update(
                                        records,
                                        /** Retain every emitted record without rewriting its attributes. */ (all) => [
                                            ...all,
                                            record
                                        ]
                                    ),
                                flush: Effect.void,
                            })
                        )
                    );
                    const blocked = Deferred.succeed(started, undefined).pipe(Effect.zipRight(Effect.never));
                    /** Observe actual adapter entry order independently of the tracing implementation. */
                    const recordCall = (name: string) =>
                        Ref.update(
                            calls,
                            /** Append the entered protocol phase without deduplication. */ (all) => [...all, name]
                        );
                    const worker = HookDispatcherLive.pipe(
                        Layer.provide(
                            Layer.mergeAll(
                                Layer.succeed(HookOutbox, {
                                    /** Accept unused staging calls; this fixture starts with a predetermined lease. */
                                    stage: () => Effect.void,
                                    /** Supply an empty queue or selected attempt after recording claim admission. */
                                    claim: () =>
                                        recordCall('claim').pipe(
                                            Effect.as(
                                                scenario === 'empty'
                                                    ? undefined
                                                    : claim(scenario === 'exhausted' ? 2 : 1)
                                            )
                                        ),
                                    /** Observe lease settlement and optionally simulate a lost durable acknowledgement. */
                                    settle: (leased, settlement) =>
                                        Effect.gen(
                                            /** Validate exact lease ownership before recording only acknowledged settlements. */ function* () {
                                                // Failed acknowledgement must not appear in the successful settlement history.
                                                expect(leased).toEqual(claim(scenario === 'exhausted' ? 2 : 1));
                                                yield* recordCall('settle');
                                                if (scenario === 'settlement-failed')
                                                    return yield* new HookOutboxFailure({ reason: 'lease-lost' });
                                                yield* Ref.update(
                                                    settlements,
                                                    /** Preserve acknowledged settlements for comparison with worker outcomes. */ (
                                                        all
                                                    ) => [...all, settlement]
                                                );
                                            }
                                        ),
                                }),
                                Layer.succeed(HookReleasePolicy, {
                                    /** Model release denial or a blocked policy phase independently from observer delivery. */
                                    authorize: () =>
                                        recordCall('release').pipe(
                                            Effect.zipRight(
                                                scenario === 'denied'
                                                    ? Effect.fail(new HookDenied({ reason: 'policy-denied' }))
                                                    : scenario === 'release-timeout' ||
                                                        scenario === 'release-interrupted'
                                                      ? blocked
                                                      : Effect.void
                                            )
                                        ),
                                }),
                                Layer.succeed(HookSink, {
                                    /** Inject the selected observer failure, defect or wait after recording delivery entry. */
                                    deliver: () =>
                                        recordCall('deliver').pipe(
                                            Effect.zipRight(
                                                scenario === 'retry' || scenario === 'exhausted'
                                                    ? Effect.fail(new HookObserverFailure())
                                                    : scenario === 'timeout' || scenario === 'interrupted'
                                                      ? blocked
                                                      : scenario === 'defect'
                                                        ? Effect.dieMessage('SECRET_WORKER_CAUSE')
                                                        : Effect.void
                                            )
                                        ),
                                }),
                                Layer.succeed(Flags, {
                                    /** Enable the worker except in the explicit disabled scenario. */
                                    evaluate: (flag) =>
                                        Effect.succeed({
                                            flag: flag.key,
                                            value: scenario !== 'disabled',
                                            reason: 'TEST',
                                            fallback: false,
                                        }),
                                })
                            )
                        )
                    );
                    yield* Effect.gen(
                        /** Drive dispatch to completion, interruption or virtual timeout before flushing spans. */ function* () {
                            // Await actual phase entry before advancing time or interrupting, avoiding scheduler-dependent assertions.
                            const dispatcher = Context.get(yield* Layer.build(worker), HookDispatcher);
                            const handle = yield* dispatcher.register(declaration);
                            if (scenario === 'unloaded') yield* handle.drain;
                            const fiber = yield* Effect.fork(handle.dispatch);
                            if (scenario === 'timeout' || scenario === 'release-timeout') {
                                yield* Deferred.await(started);
                                yield* TestClock.adjust(100);
                            }
                            const result =
                                scenario === 'interrupted' || scenario === 'release-interrupted'
                                    ? yield* Deferred.await(started).pipe(Effect.zipRight(Fiber.interrupt(fiber)))
                                    : yield* Fiber.await(fiber);
                            if (scenario === 'interrupted' || scenario === 'release-interrupted') {
                                expect(Exit.isFailure(result) && Cause.isInterruptedOnly(result.cause)).toBe(true);
                            } else if (scenario === 'settlement-failed') {
                                expect(result).toEqual(Exit.fail(new HookOutboxFailure({ reason: 'lease-lost' })));
                            } else {
                                const expected =
                                    scenario === 'exhausted' || scenario === 'denied' || scenario === 'release-timeout'
                                        ? 'dead-letter'
                                        : scenario === 'timeout' || scenario === 'defect'
                                          ? 'retry'
                                          : scenario;
                                expect(result).toEqual(Exit.succeed(expected));
                            }
                            yield* (yield* TelemetryControl).flush;
                        }
                    ).pipe(Effect.provide(telemetry));
                    const settled = yield* Ref.get(settlements);
                    if (['disabled', 'empty', 'unloaded', 'settlement-failed'].includes(scenario))
                        expect(settled).toEqual([]);
                    else if (['retry', 'timeout', 'interrupted', 'defect'].includes(scenario))
                        expect(settled).toEqual([{ state: 'retry', availableAt: scenario === 'timeout' ? 110 : 10 }]);
                    else if (['denied', 'release-timeout', 'release-interrupted'].includes(scenario))
                        expect(settled).toEqual([{ state: 'dead-letter', reason: 'denied' }]);
                    else if (scenario === 'exhausted')
                        expect(settled).toEqual([{ state: 'dead-letter', reason: 'exhausted' }]);
                    else expect(settled).toEqual([{ state: 'delivered' }]);
                    const spans = yield* Ref.get(records);
                    const order = yield* Ref.get(calls);
                    expect(order).toEqual(
                        ['disabled', 'unloaded'].includes(scenario)
                            ? []
                            : scenario === 'empty'
                              ? ['claim']
                              : ['denied', 'release-timeout', 'release-interrupted'].includes(scenario)
                                ? ['claim', 'release', 'settle']
                                : ['claim', 'release', 'deliver', 'settle']
                    );
                    expect(
                        spans.map(/** Compare emitted phase codes in completion order. */ (entry) => entry.code)
                    ).toEqual([
                        ...order.map(
                            /** Derive expected span codes from independently observed adapter calls. */ (name) =>
                                `hook.${name}`
                        ),
                        'hook.dispatch'
                    ]);
                    const root = spans.at(-1);
                    for (const span of spans) {
                        expect(span.signal).toBe('span');
                        expect(span.traceId).toBe(root?.traceId);
                        if (span !== root) expect(span.parentSpanId).toBe(root?.spanId);
                        expect(Object.keys(span.attributes)).toEqual(['eventiva.hook.outcome']);
                        expect(outcomes).toContain(span.attributes['eventiva.hook.outcome']);
                    }
                    expect(
                        spans.find(
                            /** Locate claim telemetry without assuming all scenarios enter that phase. */ (entry) =>
                                entry.code === 'hook.claim'
                        )?.attributes['eventiva.hook.outcome']
                    ).toBe(
                        ['disabled', 'unloaded'].includes(scenario)
                            ? undefined
                            : scenario === 'empty'
                              ? 'empty'
                              : 'claimed'
                    );
                    expect(
                        spans.find(
                            /** Locate the release span, absent when admission or claiming short-circuits. */ (entry) =>
                                entry.code === 'hook.release'
                        )?.attributes['eventiva.hook.outcome']
                    ).toBe(
                        ['disabled', 'unloaded', 'empty'].includes(scenario)
                            ? undefined
                            : scenario === 'release-timeout'
                              ? 'timeout'
                              : scenario === 'release-interrupted'
                                ? 'interrupted'
                                : scenario === 'denied'
                                  ? 'failed'
                                  : 'succeeded'
                    );
                    expect(
                        spans.find(
                            /** Locate delivery telemetry only when release allowed observer entry. */ (entry) =>
                                entry.code === 'hook.deliver'
                        )?.attributes['eventiva.hook.outcome']
                    ).toBe(
                        ['disabled', 'unloaded', 'empty', 'denied', 'release-timeout', 'release-interrupted'].includes(
                            scenario
                        )
                            ? undefined
                            : scenario === 'timeout'
                              ? 'timeout'
                              : scenario === 'interrupted'
                                ? 'interrupted'
                                : ['retry', 'exhausted', 'defect'].includes(scenario)
                                  ? 'failed'
                                  : 'succeeded'
                    );
                    expect(
                        spans.find(
                            /** Locate settlement telemetry including failed durable acknowledgement. */ (entry) =>
                                entry.code === 'hook.settle'
                        )?.attributes['eventiva.hook.outcome']
                    ).toBe(
                        ['disabled', 'unloaded', 'empty'].includes(scenario)
                            ? undefined
                            : scenario === 'settlement-failed'
                              ? 'failed'
                              : 'settled'
                    );
                    expect(root?.attributes['eventiva.hook.outcome']).toBe(
                        scenario === 'interrupted' || scenario === 'release-interrupted'
                            ? 'interrupted'
                            : scenario === 'settlement-failed'
                              ? 'failed'
                              : scenario === 'exhausted' || scenario === 'denied' || scenario === 'release-timeout'
                                ? 'dead-letter'
                                : scenario === 'timeout' || scenario === 'defect'
                                  ? 'retry'
                                  : scenario
                    );
                    if (scenario === 'timeout' || scenario === 'release-timeout')
                        expect(
                            spans.find(
                                /** Select the phase deliberately blocked for the virtual timeout measurement. */ (
                                    entry
                                ) => entry.code === (scenario === 'timeout' ? 'hook.deliver' : 'hook.release')
                            )
                        ).toMatchObject({ durationMs: 100, attributes: { 'eventiva.hook.outcome': 'timeout' } });
                    for (const canary of [
                        'SECRET_WORKER_CAUSE',
                        'private-module',
                        'private.record',
                        'private.notify',
                        'private.observe',
                        ...[1, 2, 3, 4, 5, 6].map(uuid),
                    ])
                        expect(JSON.stringify(spans)).not.toContain(canary);
                }
            )
    );
}
