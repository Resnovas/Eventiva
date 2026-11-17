/**
 * @file tests/runtime/src/kernel-telemetry.spec.ts
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
import { Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { SessionId, SubjectId } from '@eventiva/contracts/ids';
import { type KernelManifest, type PlatformComposition } from '@eventiva/contracts/module-manifest';
import { KernelAuthority, KernelError } from '@eventiva/contracts/module-policy';
import { TelemetryRecord, TelemetrySink, TelemetrySinkFailure } from '@eventiva/contracts/observability';
import {
    Kernel,
    KernelEnvironment,
    KernelLive,
    KernelModule,
    kernelProvider,
    type ModuleDefinition,
} from '@eventiva/runtime/kernel-runtime';
import { TelemetryControl, telemetryLayer } from '@eventiva/runtime/telemetry';
import {
    Cause,
    Config,
    ConfigProvider,
    Deferred,
    Effect,
    Either,
    Exit,
    Fiber,
    Layer,
    Ref,
    Schema,
    Scope,
} from 'effect';

const caller: CallerIdentity = {
    kind: 'human',
    subject: SubjectId.make('11111111-1111-4111-8111-111111111111'),
    session: SessionId.make('22222222-2222-4222-8222-222222222222'),
};
const messages = {
    'kernel.register': 'Kernel registration.',
    'kernel.validate': 'Kernel validation.',
    'kernel.preflight': 'Kernel preflight.',
    'kernel.install': 'Kernel installation.',
    'kernel.activate': 'Kernel activation.',
    'kernel.ready': 'Kernel readiness.',
    'kernel.deactivate': 'Kernel deactivation.',
    'kernel.unregister': 'Kernel unregistration.',
    'kernel.retire': 'Kernel retirement.',
    'kernel.update': 'Kernel update.',
    'kernel.recover': 'Kernel recovery.',
    'kernel.compose': 'Kernel composition.',
    'kernel.release': 'Kernel release.',
    'kernel.provider.select': 'Kernel provider selection.',
    'kernel.workflow.acquire': 'Kernel workflow lease acquisition.',
    'kernel.workflow.release': 'Kernel workflow lease release.',
};
const outcomes = ['succeeded', 'failed', 'interrupted', 'emitted', 'unchanged', 'updated', 'restart-required'];
const canaries = [
    'private-base',
    'private-feature',
    'private-runtime',
    'private-requirement',
    'private-instance',
    'private-capability',
    'private-undeclared',
    'PRIVATE_CONFIG_VALUE',
    'PRIVATE_SECRET',
    'PRIVATE_ERROR',
    caller.subject,
    caller.session,
];
const manifest = (id: string, extra: Partial<KernelManifest> = {}): KernelManifest => ({
    id,
    version: '1.0.0',
    trust: 'first-party',
    isolation: 'in-process',
    dependencies: [],
    provides: [],
    requires: [],
    migrations: [],
    restartRequired: false,
    ...extra,
});
const authority = Layer.succeed(KernelAuthority, {
    admit: () => Effect.void,
    authorize: (identity) =>
        identity.subject === caller.subject
            ? Effect.void
            : Effect.fail(new KernelError({ module: '<policy>', reason: 'denied' })),
});
const definition = (
    spec: KernelManifest,
    events: Array<string>,
    hooks: Partial<typeof KernelModule.Service> = {}
): ModuleDefinition => ({
    manifest: spec,
    compatibleWith: '1.0.0',
    validate: Effect.void,
    layer: Layer.scoped(
        KernelModule,
        Effect.gen(function* () {
            yield* Effect.acquireRelease(
                Effect.sync(() => events.push(`acquire:${spec.id}:${spec.version}`)),
                () => Effect.sync(() => events.push(`release:${spec.id}:${spec.version}`))
            );
            const record = (operation: string) =>
                Effect.sync(() => {
                    events.push(`${operation}:${spec.id}:${spec.version}`);
                });
            return KernelModule.of({
                providers: new Map(),
                install: record('install'),
                activate: record('activate'),
                ready: record('ready'),
                deactivate: record('deactivate'),
                ...hooks,
            });
        })
    ),
});
const composition = (specs: ReadonlyArray<KernelManifest>): PlatformComposition => ({
    modules: specs.map(({ id, version }) => ({ id, version })),
    bindings: [],
});
const start = (kernel: typeof Kernel.Service, module: ModuleDefinition) =>
    Effect.gen(function* () {
        const spec = yield* kernel.register(module);
        yield* kernel.validate(spec.id);
        yield* kernel.install(spec.id);
        yield* kernel.activate(spec.id);
        return yield* kernel.ready;
    });
const collect = <A, E>(
    effect:
        | Effect.Effect<A, E, Kernel | Caller | Scope.Scope>
        | ((
              snapshot: Effect.Effect<ReadonlyArray<TelemetryRecord>, never, TelemetryControl>
          ) => Effect.Effect<A, E, Kernel | Caller | Scope.Scope | TelemetryControl>),
    mode: 'enabled' | 'disabled' | 'outage' = 'enabled'
) =>
    Effect.gen(function* () {
        const records = yield* Ref.make<ReadonlyArray<TelemetryRecord>>([]);
        const telemetry = telemetryLayer(
            { messages, attributes: { 'eventiva.kernel.outcome': outcomes } },
            Config.succeed({ enabled: mode !== 'disabled', capacity: 256, timeoutMs: 1000 })
        ).pipe(
            Layer.provide(
                Layer.succeed(TelemetrySink, {
                    write: (record) =>
                        Ref.update(records, (all) => [...all, record]).pipe(
                            Effect.zipRight(
                                mode === 'outage'
                                    ? Effect.fail(new TelemetrySinkFailure({ reason: 'write' }))
                                    : Effect.void
                            )
                        ),
                    flush: Effect.void,
                })
            )
        );
        return yield* Effect.gen(function* () {
            const snapshot = Effect.gen(function* () {
                const control = yield* TelemetryControl;
                yield* Effect.either(control.flush);
                return yield* Ref.get(records);
            });
            const value = yield* (typeof effect === 'function' ? effect(snapshot) : effect).pipe(
                Effect.provideService(Caller, caller),
                Effect.provide(KernelLive('private-runtime').pipe(Layer.provide(authority))),
                Effect.scoped
            );
            const control = yield* TelemetryControl;
            const flushed = yield* Effect.either(control.flush);
            return { value, records: yield* Ref.get(records), health: yield* control.health, flushed };
        }).pipe(Effect.provide(telemetry), Effect.scoped);
    });
const spansFor = (records: ReadonlyArray<TelemetryRecord>, code: keyof typeof messages) =>
    records.filter((record) => record.code === code);
const outcomeOf = (record: TelemetryRecord | undefined) => record?.attributes['eventiva.kernel.outcome'];
const sanitized = (records: ReadonlyArray<TelemetryRecord>) => {
    expect(records.length).toBeGreaterThan(0);
    for (const record of records) {
        expect(record.signal).toBe('span');
        expect(Object.keys(messages)).toContain(record.code);
        expect(Object.keys(record.attributes)).toEqual(['eventiva.kernel.outcome']);
        expect(outcomes).toContain(outcomeOf(record));
    }
    for (const canary of canaries) expect(JSON.stringify(records)).not.toContain(canary);
};

for (const mode of ['enabled', 'disabled', 'outage'] as const) {
    it.effect(`observes private provider selection and authorized resolution with telemetry ${mode}`, () =>
        Effect.gen(function* () {
            const events: Array<string> = [];
            const base = manifest('private-base', {
                provides: [{ name: 'private-instance', capability: 'private-capability', version: '1.0.0' }],
            });
            const feature = manifest('private-feature', {
                requires: [{ name: 'private-requirement', capability: 'private-capability', version: '1.0.0' }],
            });
            const binding = {
                consumer: feature.id,
                requirement: 'private-requirement',
                provider: base.id,
                instance: 'private-instance',
            };
            const provider = yield* kernelProvider(Schema.String, 'PRIVATE_SECRET');
            const { records, health, flushed } = yield* collect(
                (snapshot) =>
                    Effect.gen(function* () {
                        const kernel = yield* Kernel;
                        yield* kernel.compose({ ...composition([feature, base]), bindings: [binding] }, [
                            definition(base, events, { providers: new Map([['private-instance', provider]]) }),
                            {
                                ...definition(feature, events),
                                layer: Layer.effect(
                                    KernelModule,
                                    Effect.gen(function* () {
                                        const environment = yield* KernelEnvironment;
                                        expect(yield* environment.resolve('private-requirement', Schema.String)).toBe(
                                            'PRIVATE_SECRET'
                                        );
                                        return KernelModule.of({
                                            providers: new Map(),
                                            install: Effect.void,
                                            activate: Effect.void,
                                            ready: Effect.void,
                                            deactivate: Effect.void,
                                        });
                                    })
                                ),
                            },
                        ]);
                        const composed = yield* snapshot;
                        const root = spansFor(composed, 'kernel.compose')[0];
                        const internal = spansFor(composed, 'kernel.provider.select');
                        if (mode === 'disabled') expect(internal).toEqual([]);
                        else expect(internal.length).toBeGreaterThan(0);
                        for (const selection of internal) {
                            expect(selection.traceId).toBe(root?.traceId);
                            expect(outcomeOf(selection)).toBe('succeeded');
                        }
                        const before = internal.length;
                        expect(
                            yield* Effect.either(
                                kernel.resolve(feature.id, 'private-requirement').pipe(
                                    Effect.provideService(Caller, {
                                        ...caller,
                                        subject: SubjectId.make('33333333-3333-4333-8333-333333333333'),
                                    })
                                )
                            )
                        ).toEqual(Either.left(new KernelError({ module: '<policy>', reason: 'denied' })));
                        expect(spansFor(yield* snapshot, 'kernel.provider.select')).toHaveLength(before);
                        expect(yield* kernel.resolve(feature.id, 'private-requirement')).toEqual(binding);
                        expect(yield* Effect.either(kernel.resolve(feature.id, 'private-undeclared'))).toEqual(
                            Either.left(new KernelError({ module: feature.id, reason: 'undeclared-dependency' }))
                        );
                        expect(
                            spansFor(yield* snapshot, 'kernel.provider.select')
                                .slice(before)
                                .map(outcomeOf)
                        ).toEqual(mode === 'disabled' ? [] : ['succeeded', 'failed']);
                    }),
                mode
            );
            if (mode === 'disabled') expect(records).toEqual([]);
            else sanitized(records);
            if (mode === 'outage') {
                expect(health.failed).toBeGreaterThan(0);
                expect(flushed).toEqual(Either.left(new TelemetrySinkFailure({ reason: 'flush' })));
            } else expect(flushed).toEqual(Either.right(undefined));
        })
    );
}

for (const mode of ['enabled', 'disabled', 'outage'] as const) {
    it.effect(`observes scoped lease admission and exactly one owning-scope release with telemetry ${mode}`, () =>
        Effect.gen(function* () {
            const events: Array<string> = [];
            const spec = manifest('private-feature');
            const { records, health, flushed } = yield* collect(
                (snapshot) =>
                    Effect.gen(function* () {
                        const kernel = yield* Kernel;
                        const before = yield* start(kernel, definition(spec, events));
                        const candidate = definition({ ...spec, version: '1.0.1' }, events);
                        yield* Effect.scoped(
                            Effect.gen(function* () {
                                const owner = yield* Effect.acquireRelease(Scope.make(), (scope) =>
                                    Scope.close(scope, Exit.void)
                                );
                                const lease = yield* kernel
                                    .workflow(spec.id)
                                    .pipe(Effect.provideService(Scope.Scope, owner));
                                expect(lease).toEqual({
                                    module: spec.id,
                                    version: spec.version,
                                    generation: before.generation,
                                });
                                const held = yield* snapshot;
                                expect(spansFor(held, 'kernel.workflow.acquire').map(outcomeOf)).toEqual(
                                    mode === 'disabled' ? [] : ['succeeded']
                                );
                                expect(spansFor(held, 'kernel.workflow.release')).toEqual([]);
                                expect(yield* Effect.either(kernel.update(spec.id, candidate))).toEqual(
                                    Either.left(new KernelError({ module: '<platform>', reason: 'workflow-active' }))
                                );
                                expect(yield* kernel.ready).toEqual({ ...before, emitted: false });
                                yield* Scope.close(owner, Exit.void);
                                yield* Scope.close(owner, Exit.void);
                                expect(spansFor(yield* snapshot, 'kernel.workflow.release').map(outcomeOf)).toEqual(
                                    mode === 'disabled' ? [] : ['succeeded']
                                );
                                expect(yield* kernel.update(spec.id, candidate)).toEqual({
                                    status: 'updated',
                                    version: '1.0.1',
                                });
                                expect((yield* kernel.ready).generation).toBeGreaterThan(before.generation);
                            })
                        );
                    }),
                mode
            );
            expect(events.filter((event) => event.startsWith('release:')).sort()).toEqual([
                'release:private-feature:1.0.0',
                'release:private-feature:1.0.1',
            ]);
            expect(health.dropped).toBe(0);
            if (mode === 'disabled') expect(records).toEqual([]);
            else {
                sanitized(records);
                expect(spansFor(records, 'kernel.workflow.acquire').map(outcomeOf)).toEqual(['succeeded']);
                expect(spansFor(records, 'kernel.workflow.release').map(outcomeOf)).toEqual(['succeeded']);
            }
            if (mode === 'outage') {
                expect(health.failed).toBeGreaterThan(0);
                expect(flushed).toEqual(Either.left(new TelemetrySinkFailure({ reason: 'flush' })));
            } else expect(flushed).toEqual(Either.right(undefined));
        })
    );
}

for (const scenario of ['denied', 'not-ready'] as const) {
    it.effect(`observes rejected ${scenario} lease admission without a release or leaked lease`, () =>
        Effect.gen(function* () {
            const events: Array<string> = [];
            const spec = manifest('private-feature');
            const { records } = yield* collect((snapshot) =>
                Effect.gen(function* () {
                    const kernel = yield* Kernel;
                    if (scenario === 'denied') yield* start(kernel, definition(spec, events));
                    else yield* kernel.register(definition(spec, events));
                    yield* Effect.scoped(
                        Effect.gen(function* () {
                            const attempt = kernel.workflow(spec.id);
                            expect(
                                yield* Effect.either(
                                    scenario === 'denied'
                                        ? attempt.pipe(
                                              Effect.provideService(Caller, {
                                                  ...caller,
                                                  subject: SubjectId.make('33333333-3333-4333-8333-333333333333'),
                                              })
                                          )
                                        : attempt
                                )
                            ).toEqual(
                                Either.left(
                                    new KernelError({
                                        module: scenario === 'denied' ? '<policy>' : spec.id,
                                        reason: scenario === 'denied' ? 'denied' : 'invalid-state',
                                    })
                                )
                            );
                            expect(spansFor(yield* snapshot, 'kernel.workflow.acquire').map(outcomeOf)).toEqual([
                                'failed',
                            ]);
                            expect(spansFor(yield* snapshot, 'kernel.workflow.release')).toEqual([]);
                            // Mutation must succeed before this rejected attempt's scope closes.
                            if (scenario === 'denied') yield* kernel.deactivate(spec.id);
                            yield* kernel.unregister(spec.id);
                        })
                    );
                    expect(yield* kernel.snapshot).toEqual([]);
                })
            );
            sanitized(records);
            expect(spansFor(records, 'kernel.workflow.release')).toEqual([]);
        })
    );
}

it.effect('traces real compose descendants without invented registration and closes every module once', () =>
    Effect.gen(function* () {
        const events: Array<string> = [];
        const base = manifest('private-base');
        const feature = manifest('private-feature', { dependencies: [{ id: base.id, version: base.version }] });
        const { records } = yield* collect(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const initial = yield* Effect.scoped(
                    Effect.gen(function* () {
                        const receipt = yield* kernel.compose(composition([feature, base]), [
                            definition(feature, events),
                            definition(base, events),
                        ]);
                        expect(receipt).toMatchObject({ runtimeId: 'private-runtime', emitted: true });
                        expect(receipt.generation).toBeGreaterThan(0);
                        expect(yield* kernel.ready).toEqual({ ...receipt, emitted: false });
                        expect(yield* kernel.snapshot).toEqual([
                            { module: feature.id, version: feature.version, state: 'ready' },
                            { module: base.id, version: base.version, state: 'ready' },
                        ]);
                        return receipt;
                    })
                );
                expect(initial.emitted).toBe(true);
                expect(yield* kernel.snapshot).toEqual([]);
            })
        );
        for (const spec of [base, feature]) {
            for (const operation of ['acquire', 'install', 'activate', 'deactivate', 'release'])
                expect(events.filter((event) => event === `${operation}:${spec.id}:${spec.version}`)).toHaveLength(1);
            expect(events.filter((event) => event === `ready:${spec.id}:${spec.version}`)).toHaveLength(2);
        }
        sanitized(records);
        const roots = spansFor(records, 'kernel.compose');
        expect(roots).toHaveLength(1);
        const root = roots[0];
        expect(outcomeOf(root)).toBe('emitted');
        expect(spansFor(records, 'kernel.register')).toEqual([]);
        expect(spansFor(records, 'kernel.validate')).toEqual([]);
        for (const code of ['kernel.preflight', 'kernel.install', 'kernel.activate'] as const) {
            const children = spansFor(records, code);
            expect(children).toHaveLength(2);
            for (const child of children) {
                expect(child.traceId).toBe(root?.traceId);
                expect(child.parentSpanId).toBe(root?.spanId);
                expect(outcomeOf(child)).toBe('succeeded');
            }
        }
        expect(spansFor(records, 'kernel.ready').map(outcomeOf)).toEqual(['emitted', 'unchanged']);
        const ready = spansFor(records, 'kernel.ready')[0];
        expect(ready?.parentSpanId).toBe(root?.spanId);
        expect(ready?.traceId).toBe(root?.traceId);
        expect(spansFor(records, 'kernel.release').map(outcomeOf)).toEqual(['succeeded', 'succeeded']);
    })
);

for (const scenario of ['updated', 'restart-required', 'candidate-failed'] as const) {
    it.effect(`reports ${scenario} from a real update without inventing candidate transition operations`, () =>
        Effect.gen(function* () {
            const events: Array<string> = [];
            const spec = manifest('private-feature');
            const { records } = yield* collect(
                Effect.gen(function* () {
                    const kernel = yield* Kernel;
                    const before = yield* start(kernel, definition(spec, events));
                    const candidate = definition(
                        { ...spec, version: '1.0.1', restartRequired: scenario === 'restart-required' },
                        events,
                        scenario === 'candidate-failed' ? { ready: Effect.die('PRIVATE_ERROR') } : {}
                    );
                    const result = yield* Effect.either(kernel.update(spec.id, candidate));
                    if (scenario === 'candidate-failed') {
                        expect(result).toEqual(
                            Either.left(new KernelError({ module: spec.id, reason: 'module-failed' }))
                        );
                        expect(events.filter((event) => event === `release:${spec.id}:1.0.1`)).toHaveLength(1);
                    } else {
                        expect(result).toEqual(
                            Either.right(
                                scenario === 'updated'
                                    ? { status: 'updated', version: '1.0.1' }
                                    : { status: 'restart-required', reason: 'declared' }
                            )
                        );
                    }
                    expect(events.filter((event) => event === `release:${spec.id}:1.0.0`)).toHaveLength(
                        scenario === 'updated' ? 1 : 0
                    );
                    expect(yield* kernel.snapshot).toEqual([
                        {
                            module: spec.id,
                            version: scenario === 'updated' ? '1.0.1' : '1.0.0',
                            state: scenario === 'updated' ? 'active' : 'ready',
                        },
                    ]);
                    const after = yield* kernel.ready;
                    if (scenario === 'updated') {
                        expect(after.generation).toBeGreaterThan(before.generation);
                        expect(after.emitted).toBe(true);
                    } else expect(after).toEqual({ ...before, emitted: false });
                })
            );
            expect(events.filter((event) => event.startsWith('release:')).sort()).toEqual(
                scenario === 'restart-required'
                    ? [`release:${spec.id}:1.0.0`]
                    : [`release:${spec.id}:1.0.0`, `release:${spec.id}:1.0.1`]
            );
            expect(events.filter((event) => event.startsWith('acquire:')).sort()).toEqual(
                scenario === 'restart-required'
                    ? [`acquire:${spec.id}:1.0.0`]
                    : [`acquire:${spec.id}:1.0.0`, `acquire:${spec.id}:1.0.1`]
            );
            sanitized(records);
            expect(spansFor(records, 'kernel.update').map(outcomeOf)).toEqual([
                scenario === 'candidate-failed' ? 'failed' : scenario,
            ]);
            // Candidate hooks execute inside update, not as independent public transitions.
            for (const code of ['kernel.register', 'kernel.validate', 'kernel.install', 'kernel.activate'] as const)
                expect(spansFor(records, code).map(outcomeOf)).toEqual(['succeeded']);
            expect(spansFor(records, 'kernel.ready').map(outcomeOf)).toEqual([
                'emitted',
                scenario === 'updated' ? 'emitted' : 'unchanged',
            ]);
            expect(spansFor(records, 'kernel.release')).toHaveLength(scenario === 'restart-required' ? 1 : 2);
        })
    );
}

for (const scenario of ['denied', 'invalid-config'] as const) {
    it.effect(`rejects ${scenario} before compose publication or acquisition`, () =>
        Effect.gen(function* () {
            const events: Array<string> = [];
            const spec = manifest('private-feature');
            const { records } = yield* collect(
                Effect.gen(function* () {
                    const kernel = yield* Kernel;
                    const module = {
                        ...definition(spec, events),
                        validate: Config.all({
                            limit: Config.integer('LIMIT'),
                            secret: Config.redacted('SECRET'),
                        }).pipe(
                            Effect.asVoid,
                            Effect.mapError(() => new KernelError({ module: spec.id, reason: 'invalid-config' }))
                        ),
                    };
                    const attempt = kernel.compose(composition([spec]), [module]);
                    const result = yield* Effect.either(
                        scenario === 'denied'
                            ? attempt.pipe(
                                  Effect.provideService(Caller, {
                                      ...caller,
                                      subject: SubjectId.make('33333333-3333-4333-8333-333333333333'),
                                  })
                              )
                            : attempt.pipe(
                                  Effect.withConfigProvider(
                                      ConfigProvider.fromMap(
                                          new Map([
                                              ['LIMIT', 'PRIVATE_CONFIG_VALUE'],
                                              ['SECRET', 'PRIVATE_SECRET'],
                                          ])
                                      )
                                  )
                              )
                    );
                    expect(result).toEqual(
                        Either.left(
                            new KernelError({ module: scenario === 'denied' ? '<policy>' : spec.id, reason: scenario })
                        )
                    );
                    expect(yield* kernel.snapshot).toEqual([]);
                    expect(events).toEqual([]);
                })
            );
            expect(events).toEqual([]);
            sanitized(records);
            expect(spansFor(records, 'kernel.compose').map(outcomeOf)).toEqual(['failed']);
            expect(spansFor(records, 'kernel.preflight').map(outcomeOf)).toEqual(
                scenario === 'denied' ? [] : ['failed']
            );
            for (const code of [
                'kernel.register',
                'kernel.validate',
                'kernel.install',
                'kernel.activate',
                'kernel.ready',
                'kernel.release',
            ] as const)
                expect(spansFor(records, code)).toEqual([]);
        })
    );
}

it.effect('keeps interrupted validation an interruption and never acquires a module', () =>
    Effect.gen(function* () {
        const events: Array<string> = [];
        const { records } = yield* collect(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const entered = yield* Deferred.make<void>();
                const finalized = yield* Ref.make(false);
                const spec = manifest('private-feature');
                yield* kernel.register({
                    ...definition(spec, events),
                    validate: Deferred.succeed(entered, undefined).pipe(
                        Effect.zipRight(Effect.never),
                        Effect.ensuring(Ref.set(finalized, true))
                    ),
                });
                const validating = yield* Effect.fork(kernel.validate(spec.id));
                yield* Deferred.await(entered);
                const exit = yield* Fiber.interrupt(validating);
                expect(Exit.isFailure(exit) && Cause.isInterruptedOnly(exit.cause)).toBe(true);
                expect(yield* Ref.get(finalized)).toBe(true);
                expect(yield* kernel.snapshot).toEqual([
                    { module: spec.id, version: spec.version, state: 'registered' },
                ]);
                yield* kernel.unregister(spec.id);
                expect(yield* kernel.snapshot).toEqual([]);
            })
        );
        expect(events).toEqual([]);
        sanitized(records);
        expect(spansFor(records, 'kernel.validate').map(outcomeOf)).toEqual(['interrupted']);
        expect(spansFor(records, 'kernel.preflight').map(outcomeOf)).toEqual(['interrupted']);
        const validation = spansFor(records, 'kernel.validate')[0];
        const preflight = spansFor(records, 'kernel.preflight')[0];
        expect(preflight?.parentSpanId).toBe(validation?.spanId);
        expect(preflight?.traceId).toBe(validation?.traceId);
        expect(spansFor(records, 'kernel.release')).toEqual([]);
    })
);

it.effect(
    'traces recovery children while retrying the failed install and releasing both acquisitions exactly once',
    () =>
        Effect.gen(function* () {
            const events: Array<string> = [];
            const { records } = yield* collect(
                Effect.gen(function* () {
                    const kernel = yield* Kernel;
                    const attempts = yield* Ref.make(0);
                    const spec = manifest('private-feature');
                    yield* kernel.register(
                        definition(spec, events, {
                            install: Ref.updateAndGet(attempts, (count) => count + 1).pipe(
                                Effect.flatMap((count) => (count === 1 ? Effect.die('PRIVATE_ERROR') : Effect.void))
                            ),
                        })
                    );
                    yield* kernel.validate(spec.id);
                    expect(yield* Effect.either(kernel.install(spec.id))).toEqual(
                        Either.left(new KernelError({ module: spec.id, reason: 'module-failed' }))
                    );
                    expect(yield* kernel.snapshot).toEqual([
                        { module: spec.id, version: spec.version, state: 'failed' },
                    ]);
                    expect(events.filter((event) => event.startsWith('release:'))).toEqual([
                        `release:${spec.id}:1.0.0`,
                    ]);
                    yield* kernel.recover(spec.id);
                    expect(yield* Ref.get(attempts)).toBe(2);
                    expect(yield* kernel.snapshot).toEqual([
                        { module: spec.id, version: spec.version, state: 'active' },
                    ]);
                    expect((yield* kernel.ready).emitted).toBe(true);
                })
            );
            expect(events.filter((event) => event.startsWith('acquire:'))).toEqual([
                'acquire:private-feature:1.0.0',
                'acquire:private-feature:1.0.0',
            ]);
            expect(events.filter((event) => event.startsWith('release:'))).toEqual([
                'release:private-feature:1.0.0',
                'release:private-feature:1.0.0',
            ]);
            sanitized(records);
            expect(spansFor(records, 'kernel.recover').map(outcomeOf)).toEqual(['succeeded']);
            expect(spansFor(records, 'kernel.install').map(outcomeOf)).toEqual(['failed', 'succeeded']);
            const recovery = spansFor(records, 'kernel.recover')[0];
            for (const code of ['kernel.validate', 'kernel.install', 'kernel.activate'] as const) {
                const child = spansFor(records, code).at(-1);
                expect(child?.parentSpanId).toBe(recovery?.spanId);
                expect(child?.traceId).toBe(recovery?.traceId);
                expect(outcomeOf(child)).toBe('succeeded');
            }
            expect(spansFor(records, 'kernel.release').map(outcomeOf)).toEqual(['succeeded', 'succeeded']);
        })
);

it.effect('observes failed release without losing resource cleanup, unregistration or retirement results', () =>
    Effect.gen(function* () {
        const events: Array<string> = [];
        const { records } = yield* collect(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const feature = manifest('private-feature');
                yield* start(kernel, definition(feature, events, { deactivate: Effect.die('PRIVATE_ERROR') }));
                expect(yield* Effect.either(kernel.deactivate(feature.id))).toEqual(
                    Either.left(new KernelError({ module: feature.id, reason: 'module-failed' }))
                );
                expect(yield* kernel.snapshot).toEqual([
                    { module: feature.id, version: feature.version, state: 'inactive' },
                ]);
                expect(events.filter((event) => event.startsWith('release:'))).toEqual([`release:${feature.id}:1.0.0`]);
                yield* kernel.unregister(feature.id);
                expect(yield* kernel.snapshot).toEqual([]);
                const base = manifest('private-base');
                yield* kernel.register(definition(base, events));
                yield* kernel.validate(base.id);
                yield* kernel.install(base.id);
                yield* kernel.retire(base.id);
                expect(yield* kernel.snapshot).toEqual([{ module: base.id, version: base.version, state: 'retired' }]);
            })
        );
        expect(events.filter((event) => event.startsWith('release:')).sort()).toEqual([
            'release:private-base:1.0.0',
            'release:private-feature:1.0.0',
        ]);
        sanitized(records);
        expect(spansFor(records, 'kernel.deactivate').map(outcomeOf)).toEqual(['failed']);
        expect(spansFor(records, 'kernel.release').map(outcomeOf)).toEqual(['failed', 'succeeded']);
        const release = spansFor(records, 'kernel.release')[0];
        const deactivate = spansFor(records, 'kernel.deactivate')[0];
        expect(release?.parentSpanId).toBe(deactivate?.spanId);
        expect(release?.traceId).toBe(deactivate?.traceId);
        expect(spansFor(records, 'kernel.unregister').map(outcomeOf)).toEqual(['succeeded']);
        expect(spansFor(records, 'kernel.retire').map(outcomeOf)).toEqual(['succeeded']);
    })
);

it.effect('rolls back a partially installed composition and exposes its failed child and root', () =>
    Effect.gen(function* () {
        const events: Array<string> = [];
        const base = manifest('private-base');
        const feature = manifest('private-feature', { dependencies: [{ id: base.id, version: base.version }] });
        const { records } = yield* collect(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                expect(
                    yield* Effect.either(
                        kernel.compose(composition([feature, base]), [
                            definition(feature, events, { install: Effect.die('PRIVATE_ERROR') }),
                            definition(base, events),
                        ])
                    )
                ).toEqual(Either.left(new KernelError({ module: feature.id, reason: 'module-failed' })));
                expect(yield* kernel.snapshot).toEqual([]);
            })
        );
        expect(events.filter((event) => event.startsWith('release:')).sort()).toEqual([
            'release:private-base:1.0.0',
            'release:private-feature:1.0.0',
        ]);
        expect(events.filter((event) => event.startsWith('acquire:')).sort()).toEqual([
            'acquire:private-base:1.0.0',
            'acquire:private-feature:1.0.0',
        ]);
        sanitized(records);
        expect(spansFor(records, 'kernel.compose').map(outcomeOf)).toEqual(['failed']);
        expect(spansFor(records, 'kernel.install').map(outcomeOf)).toEqual(['succeeded', 'failed']);
        expect(spansFor(records, 'kernel.activate').map(outcomeOf)).toEqual(['succeeded']);
        expect(spansFor(records, 'kernel.ready')).toEqual([]);
        expect(spansFor(records, 'kernel.release').map(outcomeOf)).toEqual(['succeeded', 'succeeded']);
    })
);

for (const mode of ['enabled', 'disabled', 'outage'] as const) {
    it.effect(`preserves real lifecycle results and finalizers with telemetry ${mode}`, () =>
        Effect.gen(function* () {
            const events: Array<string> = [];
            const { records, value, health, flushed } = yield* collect(
                Effect.gen(function* () {
                    const kernel = yield* Kernel;
                    const spec = manifest('private-feature');
                    const receipt = yield* Effect.scoped(start(kernel, definition(spec, events)));
                    expect(yield* kernel.snapshot).toEqual([]);
                    return receipt;
                }),
                mode
            );
            expect(value).toMatchObject({ runtimeId: 'private-runtime', emitted: true });
            expect(value.generation).toBeGreaterThan(0);
            for (const operation of ['acquire', 'install', 'activate', 'deactivate', 'release'])
                expect(events.filter((event) => event === `${operation}:private-feature:1.0.0`)).toHaveLength(1);
            expect(health.dropped).toBe(0);
            if (mode === 'disabled') {
                expect(records).toEqual([]);
                expect(health.accepted).toBe(0);
            } else {
                sanitized(records);
                expect(spansFor(records, 'kernel.ready').map(outcomeOf)).toEqual(['emitted']);
                expect(spansFor(records, 'kernel.release').map(outcomeOf)).toEqual(['succeeded']);
                expect(health.accepted).toBe(records.length);
                expect(health.completed).toBe(records.length);
            }
            if (mode === 'outage') {
                expect(health.failed).toBe(records.length);
                expect(flushed).toEqual(Either.left(new TelemetrySinkFailure({ reason: 'flush' })));
            } else {
                expect(health.failed).toBe(0);
                expect(flushed).toEqual(Either.right(undefined));
            }
        })
    );
}
