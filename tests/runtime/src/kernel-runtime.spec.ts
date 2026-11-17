/**
 * @file tests/runtime/src/kernel-runtime.spec.ts
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

import { describe, expect, expectTypeOf, it } from '@effect/vitest';
import { Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { KernelAuthority, KernelError } from '@eventiva/contracts/module-policy';
import { type KernelManifest, type PlatformComposition } from '@eventiva/contracts/module-manifest';
import { SessionId, SubjectId } from '@eventiva/contracts/ids';
import {
    Kernel,
    KernelEnvironment,
    KernelLive,
    KernelModule,
    kernelProvider,
    type KernelProvider,
    type ModuleDefinition,
} from '@eventiva/runtime/kernel-runtime';
import { Config, ConfigProvider, Data, Deferred, Effect, Either, Exit, Fiber, Layer, Ref, Schema, Scope } from 'effect';

class ReadFailure extends Data.TaggedError('ReadFailure')<{ readonly code: 'negative-key' }> {}
class Records {
    readonly read: (key: number) => Effect.Effect<string, ReadFailure, Caller>;
    constructor(prefix: string) {
        this.read = (key) =>
            Effect.gen(function* () {
                const identity = yield* Caller;
                if (key < 0) return yield* new ReadFailure({ code: 'negative-key' });
                return `${prefix}:${key}:${identity.kind}`;
            });
    }
}
const RecordsSchema = Schema.instanceOf(Records);

const caller: CallerIdentity = {
    kind: 'human',
    subject: SubjectId.make('11111111-1111-4111-8111-111111111111'),
    session: SessionId.make('22222222-2222-4222-8222-222222222222'),
};
const failure = (module: string) => new KernelError({ module, reason: 'module-failed' });
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
const run = <A, E>(effect: Effect.Effect<A, E, Kernel | Caller | Scope.Scope>) =>
    effect.pipe(
        Effect.provideService(Caller, caller),
        Effect.provide(KernelLive('test-runtime').pipe(Layer.provide(authority))),
        Effect.scoped
    );
const definition = (
    spec: KernelManifest,
    events: Array<string>,
    hooks: Partial<ContextService> = {}
): ModuleDefinition => ({
    manifest: spec,
    compatibleWith: '1.0.0',
    validate: Effect.void,
    layer: Layer.scoped(
        KernelModule,
        Effect.gen(function* () {
            yield* Effect.acquireRelease(
                Effect.sync(() => events.push(`acquire:${spec.id}:${spec.version}`)),
                () =>
                    Effect.sync(() => {
                        events.push(`release:${spec.id}:${spec.version}`);
                    })
            );
            const providers = yield* Effect.forEach(spec.provides, ({ name }) =>
                kernelProvider(Schema.String, `${spec.id}/${name}`).pipe(
                    Effect.map((provider) => [name, provider] as const)
                )
            );
            return KernelModule.of({
                providers: new Map(providers),
                install: Effect.sync(() => {
                    events.push(`install:${spec.id}:${spec.version}`);
                }),
                activate: Effect.sync(() => {
                    events.push(`activate:${spec.id}:${spec.version}`);
                }),
                ready: Effect.void,
                deactivate: Effect.void,
                ...hooks,
            });
        })
    ),
});
type ContextService = typeof KernelModule.Service;
const composition = (
    manifests: ReadonlyArray<KernelManifest>,
    bindings: PlatformComposition['bindings'] = []
): PlatformComposition => ({
    modules: manifests.map(({ id, version }) => ({ id, version })),
    bindings,
});
const start = (kernel: typeof Kernel.Service, module: ModuleDefinition) =>
    Effect.gen(function* () {
        const spec = yield* kernel.register(module);
        yield* kernel.validate(spec.id);
        yield* kernel.install(spec.id);
        yield* kernel.activate(spec.id);
        return yield* kernel.ready;
    });
const reason = <A, R>(effect: Effect.Effect<A, KernelError, R>) =>
    effect.pipe(
        Effect.either,
        Effect.map((result) => (Either.isLeft(result) ? result.left.reason : 'unexpected-success'))
    );

describe('isolated modular kernel', () => {
    it('keeps decoded public results and authority requirements statically concrete', () => {
        expectTypeOf<typeof Kernel.Service.ready>().toEqualTypeOf<
            Effect.Effect<
                { readonly runtimeId: string; readonly generation: number; readonly emitted: boolean },
                KernelError,
                Caller
            >
        >();
        expectTypeOf<ReturnType<typeof Kernel.Service.workflow>>().toEqualTypeOf<
            Effect.Effect<
                { readonly module: string; readonly version: string; readonly generation: number },
                KernelError,
                Caller | Scope.Scope
            >
        >();
        expectTypeOf<ReturnType<typeof Kernel.Service.register>>().toEqualTypeOf<
            Effect.Effect<KernelManifest, KernelError, Caller | Scope.Scope>
        >();
        expectTypeOf<ModuleDefinition['manifest']>().toEqualTypeOf<KernelManifest>();
        expectTypeOf<Parameters<typeof Kernel.Service.compose>[0]>().toEqualTypeOf<PlatformComposition>();
        expectTypeOf<typeof KernelModule.Service.providers>().toEqualTypeOf<ReadonlyMap<string, KernelProvider>>();
        expectTypeOf<KernelError['cycle']>().toEqualTypeOf<ReadonlyArray<string> | undefined>();
        expectTypeOf<ModuleDefinition['validate']>().toEqualTypeOf<Effect.Effect<void, KernelError>>();
        expectTypeOf<ModuleDefinition>().not.toExtend<{ readonly validate?: never }>();
        expectTypeOf<KernelManifest>().not.toExtend<{ readonly trust: 'arbitrary' }>();
    });

    it.effect('validates producer and consumer Schemas without encoding decoded services', () =>
        Effect.gen(function* () {
            expect(yield* reason(kernelProvider(Schema.NonEmptyString, ''))).toBe('invalid-contract');
            const extra = { label: 'valid', secret: 'must-not-escape' };
            expect(yield* reason(kernelProvider(Schema.Struct({ label: Schema.String }), extra))).toBe(
                'invalid-contract'
            );
            const provider = yield* kernelProvider(Schema.NumberFromString, 37);
            expect(yield* provider.resolve(Schema.NumberFromString)).toBe(37);
            expect(yield* reason(provider.resolve(Schema.String))).toBe('invalid-contract');
            const service = new Records('primary');
            const callable = yield* kernelProvider(RecordsSchema, service);
            const resolved = yield* callable.resolve(RecordsSchema);
            expect(resolved).toBe(service);
            expectTypeOf(resolved.read).toEqualTypeOf<(key: number) => Effect.Effect<string, ReadFailure, Caller>>();
            expect(yield* resolved.read(5).pipe(Effect.provideService(Caller, caller))).toBe('primary:5:human');
            expect(yield* resolved.read(-1).pipe(Effect.provideService(Caller, caller), Effect.flip)).toEqual(
                new ReadFailure({ code: 'negative-key' })
            );
        })
    );

    for (const selected of ['local', 'regional']) {
        it.effect(`swaps callable ${selected} services using only named composition bindings`, () => {
            const released: Array<string> = [];
            return run(
                Effect.gen(function* () {
                    const kernel = yield* Kernel;
                    const observed = yield* Ref.make<ReadonlyArray<string>>([]);
                    const providers = ['local', 'regional'].map((id) => {
                        const spec = manifest(id, {
                            provides: ['Tenant A', 'Tenant B'].map((name) => ({
                                name,
                                capability: 'records',
                                version: '2.0.0',
                            })),
                        });
                        const module: ModuleDefinition = {
                            manifest: spec,
                            validate: Effect.void,
                            layer: Layer.scoped(
                                KernelModule,
                                Effect.gen(function* () {
                                    const values = yield* Effect.forEach(spec.provides, ({ name }) =>
                                        Effect.acquireRelease(
                                            kernelProvider(RecordsSchema, new Records(`${id}/${name}`)),
                                            () =>
                                                Effect.sync(() => {
                                                    released.push(`${id}/${name}`);
                                                })
                                        ).pipe(Effect.map((provider) => [name, provider] as const))
                                    );
                                    return KernelModule.of({
                                        providers: new Map(values),
                                        install: Effect.void,
                                        activate: Effect.void,
                                        ready: Effect.void,
                                        deactivate: Effect.void,
                                    });
                                })
                            ),
                        };
                        return { spec, module };
                    });
                    const feature = manifest('feature', {
                        requires: ['primary', 'reporting'].map((name) => ({
                            name,
                            capability: 'records',
                            version: '2.0.0',
                        })),
                    });
                    // This feature is unchanged across provider swaps and cannot see unbound instances.
                    const module: ModuleDefinition = {
                        manifest: feature,
                        validate: Effect.void,
                        layer: Layer.effect(
                            KernelModule,
                            Effect.gen(function* () {
                                const environment = yield* KernelEnvironment;
                                return KernelModule.of({
                                    providers: new Map<string, KernelProvider>(),
                                    install: Effect.void,
                                    activate: Effect.gen(function* () {
                                        const primary = yield* environment.resolve('primary', RecordsSchema);
                                        const reporting = yield* environment.resolve('reporting', RecordsSchema);
                                        expectTypeOf(primary.read).toEqualTypeOf<Records['read']>();
                                        expect(yield* reason(environment.resolve('unbound', RecordsSchema))).toBe(
                                            'undeclared-dependency'
                                        );
                                        const values = yield* Effect.all([primary.read(7), reporting.read(31)]).pipe(
                                            Effect.provideService(Caller, caller),
                                            Effect.mapError(() => failure('feature'))
                                        );
                                        yield* Ref.set(observed, values);
                                    }),
                                    ready: Effect.void,
                                    deactivate: Effect.void,
                                });
                            })
                        ),
                    };
                    yield* kernel.compose(
                        composition(
                            [feature, ...providers.map(({ spec }) => spec)],
                            [
                                {
                                    consumer: 'feature',
                                    requirement: 'primary',
                                    provider: selected,
                                    instance: 'Tenant A',
                                },
                                {
                                    consumer: 'feature',
                                    requirement: 'reporting',
                                    provider: selected,
                                    instance: 'Tenant B',
                                },
                            ]
                        ),
                        [module, ...providers.map(({ module }) => module)]
                    );
                    expect(yield* Ref.get(observed)).toEqual([
                        `${selected}/Tenant A:7:human`,
                        `${selected}/Tenant B:31:human`,
                    ]);
                    expect(released).toEqual([]);
                })
            ).pipe(
                Effect.tap(() =>
                    Effect.sync(() => {
                        expect(released.toSorted()).toEqual([
                            'local/Tenant A',
                            'local/Tenant B',
                            'regional/Tenant A',
                            'regional/Tenant B',
                        ]);
                    })
                )
            );
        });
    }

    for (const database of ['local', 'regional']) {
        it.effect(`composes ${database} providers without changing the feature`, () =>
            run(
                Effect.gen(function* () {
                    const kernel = yield* Kernel;
                    const events: Array<string> = [];
                    const observed = yield* Ref.make('');
                    const provider = manifest(database, {
                        provides: [
                            { name: 'primary', capability: 'storage', version: '2.0.0' },
                            { name: 'reporting', capability: 'storage', version: '2.0.0' },
                        ],
                    });
                    const feature = manifest('feature', {
                        requires: [{ name: 'records', capability: 'storage', version: '2.0.0' }],
                    });
                    // The feature has no knowledge of provider module or instance names.
                    const module: ModuleDefinition = {
                        manifest: feature,
                        validate: Effect.void,
                        layer: Layer.effect(
                            KernelModule,
                            Effect.gen(function* () {
                                const environment = yield* KernelEnvironment;
                                return KernelModule.of({
                                    providers: new Map<string, KernelProvider>(),
                                    install: Effect.void,
                                    activate: environment
                                        .resolve('records', Schema.String)
                                        .pipe(Effect.flatMap((value) => Ref.set(observed, value))),
                                    ready: Effect.void,
                                    deactivate: Effect.void,
                                });
                            })
                        ),
                    };
                    const receipt = yield* kernel.compose(
                        composition(
                            [feature, provider],
                            [{ consumer: 'feature', requirement: 'records', provider: database, instance: 'reporting' }]
                        ),
                        [module, definition(provider, events)]
                    );
                    expect(yield* Ref.get(observed)).toBe(`${database}/reporting`);
                    expect(yield* kernel.resolve('feature', 'records')).toEqual({
                        consumer: 'feature',
                        requirement: 'records',
                        provider: database,
                        instance: 'reporting',
                    });
                    expect(receipt.emitted).toBe(true);
                    expect(yield* kernel.ready).toEqual({ ...receipt, emitted: false });
                    expect((yield* kernel.snapshot).every(({ state }) => state === 'ready')).toBe(true);
                    expect(yield* reason(kernel.deactivate(database))).toBe('dependency-active');
                })
            )
        );
    }

    it.effect('enforces transitions, scoped release, reactivation and data retention', () => {
        const events: Array<string> = [];
        const data = ['persisted-record'];
        return run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                yield* start(kernel, definition(manifest('feature'), events));
                expect(yield* reason(kernel.unregister('feature'))).toBe('invalid-state');
                yield* kernel.deactivate('feature');
                expect(data).toEqual(['persisted-record']);
                expect(yield* reason(kernel.ready)).toBe('not-ready');
                yield* kernel.activate('feature');
                expect(events.filter((event) => event.startsWith('install:'))).toHaveLength(1);
                yield* kernel.ready;
                yield* kernel.deactivate('feature');
                yield* kernel.retire('feature');
                expect(yield* reason(kernel.activate('feature'))).toBe('invalid-state');
                expect(yield* kernel.snapshot).toEqual([{ module: 'feature', version: '1.0.0', state: 'retired' }]);
            })
        ).pipe(
            Effect.tap(() =>
                Effect.sync(() => {
                    expect(events.filter((event) => event.startsWith('acquire:'))).toHaveLength(2);
                    expect(events.filter((event) => event.startsWith('release:'))).toHaveLength(2);
                })
            )
        );
    });

    it.effect('hot swaps a compatible provider and invalidates ready generation', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const spec = manifest('provider', {
                    provides: [{ name: 'primary', capability: 'storage', version: '1.0.0' }],
                });
                const before = yield* start(kernel, definition(spec, events));
                expect(yield* kernel.update('provider', definition({ ...spec, version: '1.1.0' }, events))).toEqual({
                    status: 'updated',
                    version: '1.1.0',
                });
                expect(yield* kernel.snapshot).toEqual([{ module: 'provider', version: '1.1.0', state: 'active' }]);
                const after = yield* kernel.ready;
                expect(after.generation).toBeGreaterThan(before.generation);
                expect(after.emitted).toBe(true);
                expect(events.filter((event) => event === 'release:provider:1.0.0')).toHaveLength(1);
            })
        )
    );

    it.effect('keeps the serving generation on failed candidate readiness', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const spec = manifest('feature');
                const before = yield* start(kernel, definition(spec, events));
                const candidate = definition({ ...spec, version: '1.0.1' }, events, {
                    ready: Effect.fail(failure('feature')),
                });
                expect(yield* reason(kernel.update('feature', candidate))).toBe('module-failed');
                expect(yield* kernel.ready).toEqual({ ...before, emitted: false });
                expect(yield* kernel.snapshot).toEqual([{ module: 'feature', version: '1.0.0', state: 'ready' }]);
                expect(events.filter((event) => event === 'release:feature:1.0.0')).toHaveLength(0);
                expect(events.filter((event) => event === 'release:feature:1.0.1')).toHaveLength(1);
            })
        )
    );

    it.effect('pins long-running work and rejects updates until safe release', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const spec = manifest('workflow');
                const before = yield* start(kernel, definition(spec, events));
                const entered = yield* Deferred.make<void>();
                const finish = yield* Deferred.make<void>();
                const effects = yield* Ref.make(0);
                const workflow = yield* Effect.scoped(
                    Effect.gen(function* () {
                        const lease = yield* kernel.workflow('workflow');
                        expect(lease).toEqual({ module: 'workflow', version: '1.0.0', generation: before.generation });
                        yield* Deferred.succeed(entered, undefined);
                        yield* Deferred.await(finish);
                        yield* Ref.update(effects, (count) => count + 1);
                    })
                ).pipe(Effect.fork);
                yield* Deferred.await(entered);
                const replacement = definition({ ...spec, version: '1.0.1' }, events);
                expect(yield* reason(kernel.update('workflow', replacement))).toBe('workflow-active');
                expect(yield* reason(kernel.deactivate('workflow'))).toBe('workflow-active');
                expect(yield* kernel.ready).toEqual({ ...before, emitted: false });
                yield* Deferred.succeed(finish, undefined);
                yield* Fiber.join(workflow);
                expect(yield* Ref.get(effects)).toBe(1);
                expect(yield* kernel.update('workflow', replacement)).toEqual({ status: 'updated', version: '1.0.1' });
                expect(yield* Ref.get(effects)).toBe(1);
            })
        )
    );

    it.effect('recovers initial activation failure without faking readiness', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const fail = yield* Ref.make(true);
                const module = definition(manifest('feature'), events, {
                    activate: Ref.get(fail).pipe(
                        Effect.flatMap((value) => (value ? Effect.fail(failure('feature')) : Effect.void))
                    ),
                });
                yield* kernel.register(module);
                yield* kernel.validate('feature');
                yield* kernel.install('feature');
                expect(yield* reason(kernel.activate('feature'))).toBe('module-failed');
                expect(yield* kernel.snapshot).toEqual([{ module: 'feature', version: '1.0.0', state: 'failed' }]);
                yield* Ref.set(fail, false);
                yield* kernel.recover('feature');
                expect(yield* kernel.snapshot).toEqual([{ module: 'feature', version: '1.0.0', state: 'active' }]);
                expect(events.filter((event) => event.startsWith('install:'))).toHaveLength(1);
                expect((yield* kernel.ready).emitted).toBe(true);
            })
        )
    );

    it.effect('rolls back composition and releases every acquisition after install failure', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const first = manifest('first');
                const second = manifest('second', { dependencies: [{ id: 'first', version: '1.0.0' }] });
                expect(
                    yield* reason(
                        kernel.compose(composition([second, first]), [
                            definition(second, events, { install: Effect.fail(failure('second')) }),
                            definition(first, events),
                        ])
                    )
                ).toBe('module-failed');
                expect(yield* kernel.snapshot).toEqual([]);
                expect(events.filter((event) => event.startsWith('release:')).sort()).toEqual([
                    'release:first:1.0.0',
                    'release:second:1.0.0',
                ]);
                expect((yield* kernel.compose(composition([first]), [definition(first, events)])).emitted).toBe(true);
            })
        )
    );

    it.effect('requires explicit compatibility and stages breaking/native/migration updates without acquisition', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const spec = manifest('feature');
                const before = yield* start(kernel, definition(spec, events));
                for (const [extra, expected] of [
                    [{ version: '2.0.0' }, 'incompatible'],
                    [{ version: '1.0.1', restartRequired: true }, 'declared'],
                    [{ version: '1.0.1', migrations: [{ id: 'break', kind: 'staged', online: true }] }, 'migration'],
                    [
                        { version: '1.0.1', migrations: [{ id: 'offline', kind: 'additive', online: false }] },
                        'migration',
                    ],
                    [{ version: '1.0.1', trust: 'vetted' }, 'incompatible'],
                ] as const) {
                    expect(yield* kernel.update('feature', definition({ ...spec, ...extra }, events))).toEqual({
                        status: 'restart-required',
                        reason: expected,
                    });
                }
                const noDeclaration = definition({ ...spec, version: '1.0.1' }, events);
                expect(yield* kernel.update('feature', { ...noDeclaration, compatibleWith: '0.9.0' })).toEqual({
                    status: 'restart-required',
                    reason: 'incompatible',
                });
                expect(events.filter((event) => event.startsWith('acquire:'))).toHaveLength(1);
                expect(yield* kernel.ready).toEqual({ ...before, emitted: false });
                expect(
                    yield* kernel.update(
                        'feature',
                        definition(
                            {
                                ...spec,
                                version: '1.0.1',
                                migrations: [{ id: 'expand', kind: 'additive', online: true }],
                            },
                            events
                        )
                    )
                ).toEqual({ status: 'updated', version: '1.0.1' });
            })
        )
    );

    it.effect('rejects denied, untrusted, isolated and duplicate registrations atomically', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const spec = manifest('feature');
                const module = definition(spec, events);
                expect(
                    yield* reason(
                        kernel.register(module).pipe(
                            Effect.provideService(Caller, {
                                ...caller,
                                subject: SubjectId.make('33333333-3333-4333-8333-333333333333'),
                            })
                        )
                    )
                ).toBe('denied');
                expect(yield* reason(kernel.register(definition({ ...spec, trust: 'untrusted' }, events)))).toBe(
                    'untrusted'
                );
                expect(yield* reason(kernel.register(definition({ ...spec, isolation: 'isolated' }, events)))).toBe(
                    'isolation-unavailable'
                );
                expect(yield* kernel.snapshot).toEqual([]);
                yield* kernel.register(module);
                expect(yield* reason(kernel.register(module))).toBe('duplicate');
                expect(yield* reason(kernel.register(definition({ ...spec, version: '1.0.1' }, events)))).toBe(
                    'incompatible'
                );
                expect(events).toEqual([]);
            })
        )
    );

    it.effect('validates Config without leaking secrets in failures', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const module = definition(manifest('feature'), events);
                const validate = Config.all({ limit: Config.integer('LIMIT'), secret: Config.redacted('SECRET') }).pipe(
                    Effect.asVoid,
                    Effect.mapError(() => new KernelError({ module: 'feature', reason: 'invalid-config' }))
                );
                yield* kernel.register({ ...module, validate });
                const invalid = yield* Effect.either(
                    kernel.validate('feature').pipe(
                        Effect.withConfigProvider(
                            ConfigProvider.fromMap(
                                new Map([
                                    ['LIMIT', 'bad-private-value'],
                                    ['SECRET', 'private-secret'],
                                ])
                            )
                        )
                    )
                );
                expect(Either.isLeft(invalid)).toBe(true);
                expect(JSON.stringify(invalid)).not.toContain('private');
                expect(events).toEqual([]);
                yield* kernel.validate('feature').pipe(
                    Effect.withConfigProvider(
                        ConfigProvider.fromMap(
                            new Map([
                                ['LIMIT', '17'],
                                ['SECRET', 'private-secret'],
                            ])
                        )
                    )
                );
                expect(yield* kernel.snapshot).toEqual([{ module: 'feature', version: '1.0.0', state: 'validated' }]);
            })
        )
    );

    it.effect('preflights every module before publishing or starting a composition', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const first = manifest('first');
                const second = manifest('second', { dependencies: [{ id: 'first', version: '1.0.0' }] });
                const validations: Array<string> = [];
                const modules = [first, second].map((spec) => ({
                    ...definition(spec, events),
                    validate: Effect.gen(function* () {
                        validations.push(spec.id);
                        expect(events).toEqual([]);
                        expect(yield* kernel.snapshot).toEqual([]);
                        yield* Config.integer(spec.id).pipe(
                            Effect.mapError(() => new KernelError({ module: spec.id, reason: 'invalid-config' }))
                        );
                    }),
                }));
                const invalid = yield* Effect.either(
                    kernel.compose(composition([second, first]), modules).pipe(
                        Effect.withConfigProvider(
                            ConfigProvider.fromMap(
                                new Map([
                                    ['first', '17'],
                                    ['second', 'private-invalid-value'],
                                ])
                            )
                        )
                    )
                );
                expect(invalid).toEqual(Either.left(new KernelError({ module: 'second', reason: 'invalid-config' })));
                expect(JSON.stringify(invalid)).not.toContain('private');
                expect(validations).toEqual(['first', 'second']);
                expect(events).toEqual([]);
                expect(yield* kernel.snapshot).toEqual([]);
                validations.length = 0;
                expect(
                    (yield* kernel.compose(composition([second, first]), modules).pipe(
                        Effect.withConfigProvider(
                            ConfigProvider.fromMap(
                                new Map([
                                    ['first', '17'],
                                    ['second', '23'],
                                ])
                            )
                        )
                    )).emitted
                ).toBe(true);
                expect(validations).toEqual(['first', 'second']);
                expect(events).toEqual([
                    'acquire:first:1.0.0',
                    'install:first:1.0.0',
                    'activate:first:1.0.0',
                    'acquire:second:1.0.0',
                    'install:second:1.0.0',
                    'activate:second:1.0.0',
                ]);
            })
        )
    );

    it.effect('interrupts composition preflight without publication and allows retry', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const first = manifest('first');
                const second = manifest('second', { dependencies: [{ id: 'first', version: '1.0.0' }] });
                const entered = yield* Deferred.make<void>();
                const finalized = yield* Ref.make(false);
                const modules = [definition(first, events), definition(second, events)] as const;
                const composing = yield* kernel
                    .compose(composition([second, first]), [
                        modules[0],
                        {
                            ...modules[1],
                            validate: Deferred.succeed(entered, undefined).pipe(
                                Effect.andThen(Effect.never),
                                Effect.ensuring(Ref.set(finalized, true))
                            ),
                        },
                    ])
                    .pipe(Effect.fork);
                yield* Deferred.await(entered);
                expect(yield* kernel.snapshot).toEqual([]);
                expect(Exit.isInterrupted(yield* Fiber.interrupt(composing))).toBe(true);
                expect(yield* Ref.get(finalized)).toBe(true);
                expect(events).toEqual([]);
                expect(yield* kernel.snapshot).toEqual([]);
                yield* Effect.scoped(kernel.compose(composition([second, first]), modules));
                expect(yield* kernel.snapshot).toEqual([]);
                expect(events.filter((event) => event.startsWith('release:'))).toEqual([
                    'release:second:1.0.0',
                    'release:first:1.0.0',
                ]);
            })
        )
    );

    it.effect('redacts composition preflight defects without publication and allows retry', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const first = manifest('first');
                const second = manifest('second', { dependencies: [{ id: 'first', version: '1.0.0' }] });
                const invalid = yield* Effect.either(
                    kernel.compose(composition([first, second]), [
                        definition(first, events),
                        { ...definition(second, events), validate: Effect.die('private-config-value') },
                    ])
                );
                expect(invalid).toEqual(Either.left(new KernelError({ module: 'second', reason: 'invalid-config' })));
                expect(JSON.stringify(invalid)).not.toContain('private');
                expect(events).toEqual([]);
                expect(yield* kernel.snapshot).toEqual([]);
                yield* Effect.scoped(
                    kernel.compose(composition([first, second]), [
                        definition(first, events),
                        definition(second, events),
                    ])
                );
                expect(yield* kernel.snapshot).toEqual([]);
                expect(events.filter((event) => event.startsWith('release:'))).toEqual([
                    'release:second:1.0.0',
                    'release:first:1.0.0',
                ]);
            })
        )
    );

    it.effect('registration scope closes and removes its module', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                yield* Effect.scoped(start(kernel, definition(manifest('temporary'), events)));
                expect(yield* kernel.snapshot).toEqual([]);
                expect(events.filter((event) => event.startsWith('release:'))).toEqual(['release:temporary:1.0.0']);
                expect(yield* reason(kernel.validate('temporary'))).toBe('missing');
            })
        )
    );

    it.effect('checks dependency versions, cycles and migrations before acquiring modules', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                for (const [specs, expected, cycle] of [
                    [
                        [manifest('feature', { dependencies: [{ id: 'missing', version: '1.0.0' }] })],
                        'dependency-missing',
                        undefined,
                    ],
                    [
                        [manifest('feature', { dependencies: [{ id: 'base', version: '1.0.1' }] }), manifest('base')],
                        'dependency-version',
                        undefined,
                    ],
                    [
                        [
                            manifest('base'),
                            manifest('feature', {
                                dependencies: [{ id: 'base', version: '1.0.0' }],
                                migrations: [{ id: 'staged', kind: 'staged', online: true }],
                            }),
                        ],
                        'migration-required',
                        undefined,
                    ],
                    [
                        [
                            manifest('base'),
                            manifest('feature', {
                                dependencies: [{ id: 'base', version: '1.0.0' }],
                                migrations: [{ id: 'offline', kind: 'additive', online: false }],
                            }),
                        ],
                        'migration-required',
                        undefined,
                    ],
                    [
                        [
                            manifest('feature', { dependencies: [{ id: 'base', version: '1.0.0' }] }),
                            manifest('base', { dependencies: [{ id: 'feature', version: '1.0.0' }] }),
                        ],
                        'cycle',
                        ['feature', 'base', 'feature'],
                    ],
                    [
                        [
                            manifest('feature', { dependencies: [{ id: 'middle', version: '1.0.0' }] }),
                            manifest('middle', { dependencies: [{ id: 'base', version: '1.0.0' }] }),
                            manifest('base', { dependencies: [{ id: 'feature', version: '1.0.0' }] }),
                        ],
                        'cycle',
                        ['feature', 'middle', 'base', 'feature'],
                    ],
                    [
                        [
                            manifest('entry', { dependencies: [{ id: 'feature', version: '1.0.0' }] }),
                            manifest('feature', { dependencies: [{ id: 'base', version: '1.0.0' }] }),
                            manifest('base', { dependencies: [{ id: 'feature', version: '1.0.0' }] }),
                        ],
                        'cycle',
                        ['feature', 'base', 'feature'],
                    ],
                ] as const) {
                    const result = yield* Effect.either(
                        kernel.compose(
                            composition(specs),
                            specs.map((spec) => definition(spec, events))
                        )
                    );
                    expect(result._tag).toBe('Left');
                    if (Either.isLeft(result)) {
                        expect(result.left.reason).toBe(expected);
                        expect(result.left.cycle).toEqual(cycle);
                        if (cycle === undefined) expect('cycle' in result.left).toBe(false);
                        else expect(result.left.module).toBe('feature');
                    }
                    expect(yield* kernel.snapshot).toEqual([]);
                }
                expect(events).toEqual([]);
            })
        )
    );

    it.effect('accepts shared dependencies without mistaking a diamond for a cycle', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const specs = [
                    manifest('top', {
                        dependencies: [
                            { id: 'left', version: '1.0.0' },
                            { id: 'right', version: '1.0.0' },
                        ],
                    }),
                    manifest('left', { dependencies: [{ id: 'base', version: '1.0.0' }] }),
                    manifest('right', { dependencies: [{ id: 'base', version: '1.0.0' }] }),
                    manifest('base'),
                ];
                expect(
                    (yield* kernel.compose(
                        composition(specs),
                        specs.map((spec) => definition(spec, events))
                    )).emitted
                ).toBe(true);
                expect((yield* kernel.snapshot).map(({ module, state }) => ({ module, state }))).toEqual([
                    { module: 'top', state: 'ready' },
                    { module: 'left', state: 'ready' },
                    { module: 'right', state: 'ready' },
                    { module: 'base', state: 'ready' },
                ]);
                expect(events.filter((event) => event.startsWith('install:'))).toEqual([
                    'install:base:1.0.0',
                    'install:left:1.0.0',
                    'install:right:1.0.0',
                    'install:top:1.0.0',
                ]);
            })
        )
    );

    it.effect('rejects direct and indirect provider binding cycles before acquiring services', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const specs = ['alpha', 'beta', 'gamma'].map((id) =>
                    manifest(id, {
                        provides: [{ name: 'primary', capability: 'storage', version: '1.0.0' }],
                        requires: [{ name: 'store', capability: 'storage', version: '1.0.0' }],
                    })
                );
                for (const [members, cycle] of [
                    [specs.slice(0, 1), ['alpha', 'alpha']],
                    [specs.slice(0, 2), ['alpha', 'beta', 'alpha']],
                    [specs, ['alpha', 'beta', 'gamma', 'alpha']],
                ] as const) {
                    const bindings = members.map((spec, index) => ({
                        consumer: spec.id,
                        requirement: 'store',
                        provider: members[(index + 1) % members.length]?.id ?? 'missing',
                        instance: 'primary',
                    }));
                    const result = yield* Effect.either(
                        kernel.compose(
                            composition(members, bindings),
                            members.map((spec) => definition(spec, events))
                        )
                    );
                    expect(result).toMatchObject({
                        _tag: 'Left',
                        left: { module: 'alpha', reason: 'cycle', cycle },
                    });
                    expect(yield* kernel.snapshot).toEqual([]);
                }
                expect(events).toEqual([]);
            })
        )
    );

    it.effect('rejects ambiguous, missing, mismatched and undeclared provider bindings', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const provider = manifest('provider', {
                    provides: [{ name: 'main', capability: 'storage', version: '2.0.0' }],
                });
                const feature = manifest('feature', {
                    requires: [{ name: 'records', capability: 'storage', version: '1.0.0' }],
                });
                const binding = { consumer: 'feature', requirement: 'records', provider: 'provider', instance: 'main' };
                for (const [bindings, expected] of [
                    [[], 'provider-unavailable'],
                    [[binding, binding], 'provider-ambiguous'],
                    [[binding], 'capability-version'],
                    [[{ ...binding, requirement: 'not-declared' }], 'invalid-contract'],
                ] as const) {
                    expect(
                        yield* reason(
                            kernel.compose(composition([provider, feature], bindings), [
                                definition(provider, events),
                                definition(feature, events),
                            ])
                        )
                    ).toBe(expected);
                    expect(yield* kernel.snapshot).toEqual([]);
                }
                yield* kernel.register(definition(manifest('plain'), events));
                expect(yield* reason(kernel.resolve('plain', 'undeclared'))).toBe('undeclared-dependency');
                expect(events).toEqual([]);
            })
        )
    );

    it.effect('rejects malformed and duplicate declarations without acquiring a layer', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const dep = { id: 'base', version: '1.0.0' };
                const capability = { name: 'main', capability: 'storage', version: '1.0.0' };
                const migration = { id: 'expand', kind: 'additive', online: true } as const;
                for (const extra of [
                    { dependencies: [dep, dep] },
                    { provides: [capability, capability] },
                    { requires: [capability, capability] },
                    { migrations: [migration, migration] },
                ])
                    expect(yield* reason(kernel.register(definition(manifest('feature', extra), events)))).toBe(
                        'duplicate'
                    );
                const module = definition(manifest('feature'), events);
                const extraFields = { ...manifest('feature'), secret: 'private' };
                expect(yield* reason(kernel.register({ ...module, manifest: extraFields }))).toBe('invalid-contract');
                expect(yield* kernel.snapshot).toEqual([]);
                expect(events).toEqual([]);
            })
        )
    );

    it.effect('rejects invalid state requests without changing registrations', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                expect(yield* reason(kernel.ready)).toBe('invalid-state');
                yield* kernel.register(definition(manifest('feature'), events));
                for (const effect of [
                    kernel.install('feature'),
                    kernel.activate('feature'),
                    kernel.deactivate('feature'),
                    kernel.retire('feature'),
                    kernel.recover('feature'),
                    kernel.workflow('feature'),
                ]) {
                    expect(yield* reason(effect)).toBe('invalid-state');
                }
                expect(
                    yield* reason(
                        kernel.update('feature', definition(manifest('feature', { version: '1.0.1' }), events))
                    )
                ).toBe('invalid-state');
                yield* kernel.validate('feature');
                yield* kernel.validate('feature');
                yield* kernel.install('feature');
                expect(yield* reason(kernel.validate('feature'))).toBe('invalid-state');
                yield* kernel.unregister('feature');
                expect(yield* kernel.snapshot).toEqual([]);
                expect(events.filter((event) => event.startsWith('release:'))).toHaveLength(1);
            })
        )
    );

    it.effect('keeps inactive and installed updates non-serving', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                yield* kernel.register(definition(manifest('feature'), events));
                yield* kernel.validate('feature');
                yield* kernel.install('feature');
                expect(
                    yield* kernel.update('feature', definition(manifest('feature', { version: '1.1.0' }), events))
                ).toEqual({ status: 'updated', version: '1.1.0' });
                expect(yield* kernel.snapshot).toEqual([{ module: 'feature', version: '1.1.0', state: 'installed' }]);
                expect(events.filter((event) => event.startsWith('activate:'))).toEqual([]);
                yield* kernel.activate('feature');
                yield* kernel.deactivate('feature');
                const next = {
                    ...definition(manifest('feature', { version: '1.2.0' }), events),
                    compatibleWith: '1.1.0',
                };
                expect(yield* kernel.update('feature', next)).toEqual({ status: 'updated', version: '1.2.0' });
                expect(yield* kernel.snapshot).toEqual([{ module: 'feature', version: '1.2.0', state: 'inactive' }]);
                expect(events.filter((event) => event === 'activate:feature:1.2.0')).toEqual([]);
            })
        )
    );

    it.effect('runs resource preflight before candidate installation and after lease rejection', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const before = yield* start(kernel, definition(manifest('feature'), events));
                const preflights = yield* Ref.make(0);
                const candidate = {
                    ...definition(manifest('feature', { version: '1.0.1' }), events),
                    validate: Ref.update(preflights, (count) => count + 1).pipe(
                        Effect.andThen(
                            Effect.fail(new KernelError({ module: 'feature', reason: 'migration-required' }))
                        )
                    ),
                };
                yield* Effect.scoped(
                    Effect.gen(function* () {
                        yield* kernel.workflow('feature');
                        expect(yield* reason(kernel.update('feature', candidate))).toBe('workflow-active');
                        expect(yield* Ref.get(preflights)).toBe(0);
                    })
                );
                expect(yield* kernel.update('feature', candidate)).toEqual({
                    status: 'restart-required',
                    reason: 'migration',
                });
                expect(yield* Ref.get(preflights)).toBe(1);
                expect(events.filter((event) => event.startsWith('acquire:'))).toHaveLength(1);
                expect(yield* kernel.ready).toEqual({ ...before, emitted: false });
            })
        )
    );

    it.effect('retains exact dependency contracts and disallows pinned consumer auto-upgrades', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const base = manifest('base');
                const feature = manifest('feature', { dependencies: [{ id: 'base', version: '1.0.0' }] });
                const before = yield* kernel.compose(composition([base, feature]), [
                    definition(base, events),
                    definition(feature, events),
                ]);
                for (const spec of [
                    { ...feature, version: '1.0.1', dependencies: [] },
                    {
                        ...feature,
                        version: '1.0.1',
                        dependencies: [...feature.dependencies, { id: 'missing', version: '1.0.0' }],
                    },
                ])
                    expect(yield* kernel.update('feature', definition(spec, events))).toEqual({
                        status: 'restart-required',
                        reason: 'incompatible',
                    });
                expect(yield* kernel.update('base', definition({ ...base, version: '1.0.1' }, events))).toEqual({
                    status: 'restart-required',
                    reason: 'incompatible',
                });
                expect(yield* kernel.ready).toEqual({ ...before, emitted: false });
                expect(yield* reason(kernel.update('feature', definition(feature, events)))).toBe('duplicate');
                expect(
                    yield* reason(kernel.update('feature', definition(manifest('other', { version: '1.0.1' }), events)))
                ).toBe('invalid-contract');
            })
        )
    );

    it.effect('closes candidate scope on interruption without changing the serving generation', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const before = yield* start(kernel, definition(manifest('feature'), events));
                const entered = yield* Deferred.make<void>();
                const candidate = definition(manifest('feature', { version: '1.0.1' }), events, {
                    activate: Deferred.succeed(entered, undefined).pipe(Effect.andThen(Effect.never)),
                });
                const updating = yield* kernel.update('feature', candidate).pipe(Effect.fork);
                yield* Deferred.await(entered);
                const exit = yield* Fiber.interrupt(updating);
                expect(Exit.isInterrupted(exit)).toBe(true);
                expect(yield* kernel.ready).toEqual({ ...before, emitted: false });
                expect(events.filter((event) => event === 'release:feature:1.0.1')).toHaveLength(1);
            })
        )
    );

    it.effect('drains workflow leases before scoped disposal and rejects new admission', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const owner = yield* Scope.make();
                yield* start(kernel, definition(manifest('feature'), events)).pipe(
                    Effect.provideService(Scope.Scope, owner)
                );
                const work = yield* Scope.make();
                yield* kernel.workflow('feature').pipe(Effect.provideService(Scope.Scope, work));
                const disposing = yield* Scope.close(owner, Exit.void).pipe(Effect.fork);
                yield* Effect.yieldNow();
                expect(events.filter((event) => event.startsWith('release:'))).toHaveLength(0);
                expect(yield* reason(kernel.workflow('feature'))).toBe('invalid-state');
                expect(yield* reason(kernel.ready)).toBe('invalid-state');
                expect(yield* reason(kernel.register(definition(manifest('new'), events)))).toBe('invalid-state');
                yield* Scope.close(work, Exit.void);
                yield* Fiber.join(disposing);
                expect(yield* kernel.snapshot).toEqual([]);
                expect(events.filter((event) => event.startsWith('release:'))).toHaveLength(1);
            })
        )
    );

    it.effect('fails closed on unimplemented providers and staged initial migrations', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const spec = manifest('provider', {
                    provides: [{ name: 'main', capability: 'storage', version: '1.0.0' }],
                });
                yield* kernel.register(definition(spec, events, { providers: new Map<string, KernelProvider>() }));
                yield* kernel.validate('provider');
                expect(yield* reason(kernel.install('provider'))).toBe('module-failed');
                expect(events.filter((event) => event.startsWith('release:'))).toHaveLength(1);
                yield* kernel.unregister('provider');
                yield* kernel.register(
                    definition(
                        manifest('staged', { migrations: [{ id: 'break', kind: 'staged', online: false }] }),
                        events
                    )
                );
                yield* kernel.validate('staged');
                expect(yield* reason(kernel.install('staged'))).toBe('migration-required');
                expect(events.filter((event) => event.startsWith('acquire:'))).toHaveLength(1);
            })
        )
    );

    it.effect('cleans live dependents when a provider registration scope closes', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const scope = yield* Scope.make();
                const base = manifest('base');
                const feature = manifest('feature', { dependencies: [{ id: 'base', version: '1.0.0' }] });
                yield* kernel.register(definition(base, events)).pipe(Effect.provideService(Scope.Scope, scope));
                yield* kernel.register(definition(feature, events));
                for (const id of ['base', 'feature']) {
                    yield* kernel.validate(id);
                    yield* kernel.install(id);
                    yield* kernel.activate(id);
                }
                yield* kernel.ready;
                yield* Scope.close(scope, Exit.void);
                expect(yield* kernel.snapshot).toEqual([]);
                expect(events.filter((event) => event.startsWith('release:'))).toEqual([
                    'release:feature:1.0.0',
                    'release:base:1.0.0',
                ]);
            })
        )
    );

    it.effect('readiness failure cleans dependent services and failed recovery stays failed', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const unhealthy = yield* Ref.make(false);
                const failPreflight = yield* Ref.make(false);
                const base = definition(manifest('base'), events, {
                    ready: Ref.get(unhealthy).pipe(
                        Effect.flatMap((value) => (value ? Effect.fail(failure('base')) : Effect.void))
                    ),
                });
                const feature = manifest('feature', { dependencies: [{ id: 'base', version: '1.0.0' }] });
                yield* kernel.register({
                    ...base,
                    validate: Ref.get(failPreflight).pipe(
                        Effect.flatMap((value) => (value ? Effect.fail(failure('base')) : Effect.void))
                    ),
                });
                yield* kernel.register(definition(feature, events));
                for (const id of ['base', 'feature']) {
                    yield* kernel.validate(id);
                    yield* kernel.install(id);
                    yield* kernel.activate(id);
                }
                yield* Ref.set(unhealthy, true);
                expect(yield* reason(kernel.ready)).toBe('module-failed');
                expect((yield* kernel.snapshot).map(({ state }) => state)).toEqual(['failed', 'failed']);
                expect(events.filter((event) => event.startsWith('release:'))).toEqual([
                    'release:feature:1.0.0',
                    'release:base:1.0.0',
                ]);
                yield* Ref.set(failPreflight, true);
                expect(yield* reason(kernel.recover('base'))).toBe('invalid-config');
                expect((yield* kernel.snapshot)[0]?.state).toBe('failed');
            })
        )
    );

    it.effect('preserves serving state when candidate config fails and rejects nonempty composition', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const before = yield* start(kernel, definition(manifest('feature'), events));
                const candidate = {
                    ...definition(manifest('feature', { version: '1.0.1' }), events),
                    validate: Effect.fail(failure('feature')),
                };
                expect(yield* reason(kernel.update('feature', candidate))).toBe('invalid-config');
                expect(yield* kernel.ready).toEqual({ ...before, emitted: false });
                expect(yield* reason(kernel.compose(composition([]), []))).toBe('invalid-state');
                expect(yield* reason(kernel.retire('feature'))).toBe('invalid-state');
            })
        )
    );

    it.effect('composition validates exact module selections and undeclared bindings transactionally', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const spec = manifest('feature');
                const module = definition(spec, events);
                expect(yield* reason(kernel.compose(composition([spec, spec]), [module]))).toBe('duplicate');
                expect(yield* reason(kernel.compose(composition([spec]), [module, module]))).toBe('invalid-contract');
                expect(
                    yield* reason(
                        kernel.compose({ modules: [{ id: 'feature', version: '1.0.1' }], bindings: [] }, [module])
                    )
                ).toBe('incompatible');
                expect(
                    yield* reason(
                        kernel.compose(
                            composition(
                                [spec],
                                [
                                    {
                                        consumer: 'feature',
                                        requirement: 'undeclared',
                                        provider: 'feature',
                                        instance: 'main',
                                    },
                                ]
                            ),
                            [module]
                        )
                    )
                ).toBe('invalid-contract');
                expect(yield* kernel.snapshot).toEqual([]);
                expect(events).toEqual([]);
            })
        )
    );

    it.effect('attests provenance and assurance independently of self-declared trust', () =>
        Effect.gen(function* () {
            const events: Array<string> = [];
            const denied = Layer.succeed(KernelAuthority, {
                authorize: () => Effect.void,
                admit: () => Effect.fail(new KernelError({ module: 'feature', reason: 'assurance-unmet' })),
            });
            yield* Effect.gen(function* () {
                const kernel = yield* Kernel;
                expect(yield* reason(kernel.register(definition(manifest('feature'), events)))).toBe('assurance-unmet');
                expect(yield* kernel.snapshot).toEqual([]);
                expect(events).toEqual([]);
            }).pipe(
                Effect.provideService(Caller, caller),
                Effect.provide(KernelLive('denied-runtime').pipe(Layer.provide(denied))),
                Effect.scoped
            );
        })
    );

    it.effect('snapshots decoded identities independently of caller-owned manifest mutation', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const source = { ...manifest('feature'), version: '1.0.0' };
                const receipt = yield* start(kernel, definition(source, events));
                yield* Effect.scoped(
                    Effect.gen(function* () {
                        const lease = yield* kernel.workflow('feature');
                        source.version = '9.9.9';
                        expect(lease).toEqual({ module: 'feature', version: '1.0.0', generation: receipt.generation });
                        expect(yield* kernel.snapshot).toEqual([
                            { module: 'feature', version: '1.0.0', state: 'ready' },
                        ]);
                    })
                );
            })
        )
    );

    it.effect('redacts defective config and still releases scope when deactivation fails', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                yield* kernel.register({
                    ...definition(manifest('invalid'), events),
                    validate: Effect.die('private-config-value'),
                });
                const invalid = yield* Effect.either(kernel.validate('invalid'));
                expect(Either.isLeft(invalid)).toBe(true);
                expect(JSON.stringify(invalid)).not.toContain('private-config-value');
                yield* kernel.unregister('invalid');
                yield* start(
                    kernel,
                    definition(manifest('feature'), events, { deactivate: Effect.fail(failure('feature')) })
                );
                expect(yield* reason(kernel.deactivate('feature'))).toBe('module-failed');
                expect(yield* kernel.snapshot).toEqual([{ module: 'feature', version: '1.0.0', state: 'inactive' }]);
                yield* kernel.unregister('feature');
                expect(events.filter((event) => event.startsWith('release:'))).toHaveLength(1);
            })
        )
    );

    it.effect('retries an unverified installation on recovery', () =>
        run(
            Effect.gen(function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const attempts = yield* Ref.make(0);
                const module = definition(manifest('feature'), events, {
                    install: Ref.updateAndGet(attempts, (count) => count + 1).pipe(
                        Effect.flatMap((count) => (count === 1 ? Effect.fail(failure('feature')) : Effect.void))
                    ),
                });
                yield* kernel.register(module);
                yield* kernel.validate('feature');
                expect(yield* reason(kernel.install('feature'))).toBe('module-failed');
                yield* kernel.recover('feature');
                expect(yield* Ref.get(attempts)).toBe(2);
                expect((yield* kernel.ready).emitted).toBe(true);
            })
        )
    );
});
