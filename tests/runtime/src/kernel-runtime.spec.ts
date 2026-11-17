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

/** Typed fixture failure for rejected negative record keys. */
class ReadFailure extends Data.TaggedError('ReadFailure')<{ readonly code: 'negative-key' }> {}
/** Callable decoded service used to detect accidental schema re-encoding. */
class Records {
    readonly read: /** Read a nonnegative key with a live caller requirement and typed failure. */ (key: number) => Effect.Effect<string, ReadFailure, Caller>;
    /** Bind record results to the selected provider instance prefix. */
    constructor(prefix: string) {
        this.read = /** Build a caller-dependent read without executing it during provider resolution. */ (key) =>
            Effect.gen(/** Reject negative keys and include caller kind in successful fixture output. */ function* () {
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
/** Build a bounded lifecycle failure for the named fixture module. */
const failure = (module: string) => new KernelError({ module, reason: 'module-failed' });
/** Define an in-process first-party fixture with scenario-specific manifest overrides. */
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
    /** Admit fixture provenance without simulating external attestation. */
    admit: () => Effect.void,
    /** Restrict lifecycle operations to the fixture's expected subject. */
    authorize: (identity) =>
        identity.subject === caller.subject
            ? Effect.void
            : Effect.fail(new KernelError({ module: '<policy>', reason: 'denied' })),
});
/** Provide a fresh scoped kernel and fixture identity for one scenario. */
const run = <A, E>(effect: Effect.Effect<A, E, Kernel | Caller | Scope.Scope>) =>
    effect.pipe(
        Effect.provideService(Caller, caller),
        Effect.provide(KernelLive('test-runtime').pipe(Layer.provide(authority))),
        Effect.scoped
    );
/** Build observable module acquisition/lifecycle hooks with optional fault overrides. */
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
        Effect.gen(/** Acquire tracked resources and expose each declared string provider. */ function* () {
            // Track resource ownership independently of lifecycle hooks so failed hooks cannot hide leaked acquisitions.
            yield* Effect.acquireRelease(
                Effect.sync(/** Record acquisition of this exact module version. */ () => events.push(`acquire:${spec.id}:${spec.version}`)),
                /** Release the resource when its owning module scope closes. */ () =>
                    Effect.sync(/** Record finalization independently of deactivation success. */ () => {
                        events.push(`release:${spec.id}:${spec.version}`);
                    })
            );
            const providers = yield* Effect.forEach(spec.provides, /** Expose an instance-distinguishable validated string service. */ ({ name }) =>
                kernelProvider(Schema.String, `${spec.id}/${name}`).pipe(
                    Effect.map(/** Preserve the manifest's instance name as the provider-map key. */ (provider) => [name, provider] as const)
                )
            );
            return KernelModule.of({
                providers: new Map(providers),
                install: Effect.sync(/** Record installation without creating external state. */ () => {
                    events.push(`install:${spec.id}:${spec.version}`);
                }),
                activate: Effect.sync(/** Record when this version becomes activated. */ () => {
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
/** Select exact module versions and caller-supplied capability bindings. */
const composition = (
    manifests: ReadonlyArray<KernelManifest>,
    bindings: PlatformComposition['bindings'] = []
): PlatformComposition => ({
    modules: manifests.map(/** Retain only composition selection identity and version. */ ({ id, version }) => ({ id, version })),
    bindings,
});
/** Traverse the public lifecycle to a ready receipt for one module. */
const start = (kernel: typeof Kernel.Service, module: ModuleDefinition) =>
    Effect.gen(/** Register, validate, install and activate before requesting readiness. */ function* () {
        // Use public transitions rather than fixture state mutation so readiness exercises actual lifecycle prerequisites.
        const spec = yield* kernel.register(module);
        yield* kernel.validate(spec.id);
        yield* kernel.install(spec.id);
        yield* kernel.activate(spec.id);
        return yield* kernel.ready;
    });
/** Extract bounded failure reasons while making unexpected success explicit in assertions. */
const reason = <A, R>(effect: Effect.Effect<A, KernelError, R>) =>
    effect.pipe(
        Effect.either,
        Effect.map(/** Distinguish typed rejection from a mistakenly successful operation. */ (result) => (Either.isLeft(result) ? result.left.reason : 'unexpected-success'))
    );

describe('isolated modular kernel', /** Register lifecycle, composition and resource-ownership conformance tests. */ () => {
    it('keeps decoded public results and authority requirements statically concrete', /** Assert decoded public types retain exact error and authority requirements. */ () => {
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

    it.effect('validates producer and consumer Schemas without encoding decoded services', /** Exercise strict provider validation with transformed and callable schemas. */ () =>
        Effect.gen(/** Verify decoded service identity and its callable error/environment contract survive resolution. */ function* () {
            // Transformed numbers and class instances distinguish decoded-value validation from accidental encoding.
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
            expectTypeOf(resolved.read).toEqualTypeOf</** Preserve caller-dependent reads and negative-key failures after resolution. */ (key: number) => Effect.Effect<string, ReadFailure, Caller>>();
            expect(yield* resolved.read(5).pipe(Effect.provideService(Caller, caller))).toBe('primary:5:human');
            expect(yield* resolved.read(-1).pipe(Effect.provideService(Caller, caller), Effect.flip)).toEqual(
                new ReadFailure({ code: 'negative-key' })
            );
        })
    );

    for (const selected of ['local', 'regional']) {
        it.effect(`swaps callable ${selected} services using only named composition bindings`, /** Select callable provider instances without changing consumer implementation. */ () => {
            // Check release after run closes its kernel scope, not while provider resources are still live.
            const released: Array<string> = [];
            return run(
                Effect.gen(/** Verify named bindings resolve the selected callable instances and conceal unbound names. */ function* () {
                    // Both providers exist simultaneously; only explicit composition bindings select what the unchanged feature observes.
                    const kernel = yield* Kernel;
                    const observed = yield* Ref.make<ReadonlyArray<string>>([]);
                    const providers = ['local', 'regional'].map(/** Build equivalent providers with distinguishable outputs and tracked release. */ (id) => {
                        // Give each instance distinct output so resolving the right capability with the wrong binding still fails parity.
                        const spec = manifest(id, {
                            provides: ['Tenant A', 'Tenant B'].map(/** Declare two same-capability instances under distinct names. */ (name) => ({
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
                                Effect.gen(/** Acquire a separate callable service for each declared instance. */ function* () {
                                    // Instance-level finalizers prove all provided services close with their module, including unused bindings.
                                    const values = yield* Effect.forEach(spec.provides, /** Couple callable provider ownership to module scope. */ ({ name }) =>
                                        Effect.acquireRelease(
                                            kernelProvider(RecordsSchema, new Records(`${id}/${name}`)),
                                            /** Finalize this instance when its provider module closes. */ () =>
                                                Effect.sync(/** Retain instance-specific evidence of resource release. */ () => {
                                                    released.push(`${id}/${name}`);
                                                })
                                        ).pipe(Effect.map(/** Index the validated service by its declared instance name. */ (provider) => [name, provider] as const))
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
                        requires: ['primary', 'reporting'].map(/** Declare consumer-local aliases without provider identities. */ (name) => ({
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
                            Effect.gen(/** Resolve services only through the consumer's injected environment. */ function* () {
                                const environment = yield* KernelEnvironment;
                                return KernelModule.of({
                                    providers: new Map<string, KernelProvider>(),
                                    install: Effect.void,
                                    activate: Effect.gen(/** Exercise both bound services and reject an undeclared dependency name. */ function* () {
                                        // Resolve consumer-local aliases only; selected provider and instance names belong exclusively to composition.
                                        const primary = yield* environment.resolve('primary', RecordsSchema);
                                        const reporting = yield* environment.resolve('reporting', RecordsSchema);
                                        expectTypeOf(primary.read).toEqualTypeOf<Records['read']>();
                                        expect(yield* reason(environment.resolve('unbound', RecordsSchema))).toBe(
                                            'undeclared-dependency'
                                        );
                                        const values = yield* Effect.all([primary.read(7), reporting.read(31)]).pipe(
                                            Effect.provideService(Caller, caller),
                                            Effect.mapError(/** Normalize fixture service failure to the consumer lifecycle error. */ () => failure('feature'))
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
                            [feature, ...providers.map(/** Select provider manifests without coupling the feature to their implementation. */ ({ spec }) => spec)],
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
                        [module, ...providers.map(/** Supply the implementation paired with each selected provider manifest. */ ({ module }) => module)]
                    );
                    expect(yield* Ref.get(observed)).toEqual([
                        `${selected}/Tenant A:7:human`,
                        `${selected}/Tenant B:31:human`,
                    ]);
                    expect(released).toEqual([]);
                })
            ).pipe(
                Effect.tap(/** Inspect ownership only after the scoped kernel has finalized. */ () =>
                    Effect.sync(/** Require both instances of both providers to release exactly once. */ () => {
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
        it.effect(`composes ${database} providers without changing the feature`, /** Select the reporting instance solely through composition metadata. */ () =>
            run(
                Effect.gen(/** Verify interchangeable string providers leave feature code and alias names unchanged. */ function* () {
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
                            Effect.gen(/** Capture the injected consumer environment rather than a concrete provider. */ function* () {
                                const environment = yield* KernelEnvironment;
                                return KernelModule.of({
                                    providers: new Map<string, KernelProvider>(),
                                    install: Effect.void,
                                    activate: environment
                                        .resolve('records', Schema.String)
                                        .pipe(Effect.flatMap(/** Retain the selected service's observable value for the assertion. */ (value) => Ref.set(observed, value))),
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
                    expect((yield* kernel.snapshot).every(/** Require readiness of both the consumer and provider. */ ({ state }) => state === 'ready')).toBe(true);
                    expect(yield* reason(kernel.deactivate(database))).toBe('dependency-active');
                })
            )
        );
    }

    it.effect('enforces transitions, scoped release, reactivation and data retention', /** Observe lifecycle events through retirement and final scope cleanup. */ () => {
        const events: Array<string> = [];
        const data = ['persisted-record'];
        return run(
            Effect.gen(/** Verify reactivation skips reinstall and retirement prevents future activation. */ function* () {
                // Keep fixture data outside module ownership to distinguish service teardown from data deletion.
                const kernel = yield* Kernel;
                yield* start(kernel, definition(manifest('feature'), events));
                expect(yield* reason(kernel.unregister('feature'))).toBe('invalid-state');
                yield* kernel.deactivate('feature');
                expect(data).toEqual(['persisted-record']);
                expect(yield* reason(kernel.ready)).toBe('not-ready');
                yield* kernel.activate('feature');
                expect(events.filter(/** Count installations independently of activation attempts. */ (event) => event.startsWith('install:'))).toHaveLength(1);
                yield* kernel.ready;
                yield* kernel.deactivate('feature');
                yield* kernel.retire('feature');
                expect(yield* reason(kernel.activate('feature'))).toBe('invalid-state');
                expect(yield* kernel.snapshot).toEqual([{ module: 'feature', version: '1.0.0', state: 'retired' }]);
            })
        ).pipe(
            Effect.tap(/** Check ownership after the enclosing kernel scope closes. */ () =>
                Effect.sync(/** Require acquisition and release counts to balance across reactivation. */ () => {
                    expect(events.filter(/** Count owned resource acquisitions. */ (event) => event.startsWith('acquire:'))).toHaveLength(2);
                    expect(events.filter(/** Count completed resource finalizations. */ (event) => event.startsWith('release:'))).toHaveLength(2);
                })
            )
        );
    });

    it.effect('hot swaps a compatible provider and invalidates ready generation', /** Replace a serving provider with an explicitly compatible version. */ () =>
        run(
            Effect.gen(/** Verify successful replacement advances readiness and releases the old version once. */ function* () {
                // Compare receipts across replacement so a version change without generation invalidation cannot pass.
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
                expect(events.filter(/** Isolate cleanup of the replaced provider version. */ (event) => event === 'release:provider:1.0.0')).toHaveLength(1);
            })
        )
    );

    it.effect('keeps the serving generation on failed candidate readiness', /** Fail replacement readiness after candidate acquisition. */ () =>
        run(
            Effect.gen(/** Verify failed candidate cleanup leaves the serving version and receipt unchanged. */ function* () {
                // Track releases by version to prove rollback closes only the failed candidate, not the serving module.
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
                expect(events.filter(/** Detect erroneous cleanup of the still-serving version. */ (event) => event === 'release:feature:1.0.0')).toHaveLength(0);
                expect(events.filter(/** Count cleanup of the failed candidate only. */ (event) => event === 'release:feature:1.0.1')).toHaveLength(1);
            })
        )
    );

    it.effect('pins long-running work and rejects updates until safe release', /** Hold a workflow lease across replacement and deactivation attempts. */ () =>
        run(
            Effect.gen(/** Verify active leases block mutation until their owning work completes. */ function* () {
                // Coordinate lease ownership with barriers so update rejection cannot depend on scheduler timing.
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const spec = manifest('workflow');
                const before = yield* start(kernel, definition(spec, events));
                const entered = yield* Deferred.make<void>();
                const finish = yield* Deferred.make<void>();
                const effects = yield* Ref.make(0);
                const workflow = yield* Effect.scoped(
                    Effect.gen(/** Hold this exact serving generation until the test permits completion. */ function* () {
                        // Signal only after lease acquisition so concurrent mutations encounter a genuinely pinned generation.
                        const lease = yield* kernel.workflow('workflow');
                        expect(lease).toEqual({ module: 'workflow', version: '1.0.0', generation: before.generation });
                        yield* Deferred.succeed(entered, undefined);
                        yield* Deferred.await(finish);
                        yield* Ref.update(effects, /** Count completed business work independently of replacement. */ (count) => count + 1);
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

    it.effect('recovers initial activation failure without faking readiness', /** Fail activation once while leaving installation successful. */ () =>
        run(
            Effect.gen(/** Verify recovery resumes activation without reinstalling the verified module. */ function* () {
                // Toggle only activation health after failure; recovery must retain the successful installation phase.
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const fail = yield* Ref.make(true);
                const module = definition(manifest('feature'), events, {
                    activate: Ref.get(fail).pipe(
                        Effect.flatMap(/** Fail activation only while the fixture fault switch is enabled. */ (value) => (value ? Effect.fail(failure('feature')) : Effect.void))
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
                expect(events.filter(/** Detect unintended reinstallation during activation recovery. */ (event) => event.startsWith('install:'))).toHaveLength(1);
                expect((yield* kernel.ready).emitted).toBe(true);
            })
        )
    );

    it.effect('rolls back composition and releases every acquisition after install failure', /** Fail a dependent installation after its prerequisite has started. */ () =>
        run(
            Effect.gen(/** Verify composition rollback empties registrations and permits a fresh composition. */ function* () {
                // Submit the dependent first so dependency ordering and rollback are exercised rather than fixture array order.
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
                expect(events.filter(/** Collect resource cleanup evidence independent of rollback order. */ (event) => event.startsWith('release:')).sort()).toEqual([
                    'release:first:1.0.0',
                    'release:second:1.0.0',
                ]);
                expect((yield* kernel.compose(composition([first]), [definition(first, events)])).emitted).toBe(true);
            })
        )
    );

    it.effect('requires explicit compatibility and stages breaking/native/migration updates without acquisition', /** Compare restart-only candidates with an additive online-compatible update. */ () =>
        run(
            Effect.gen(/** Verify unsafe candidates never acquire resources or invalidate serving readiness. */ function* () {
                // Check acquisition count before the positive online migration control to isolate rejected candidates.
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
                expect(events.filter(/** Detect acquisitions by rejected restart-only candidates. */ (event) => event.startsWith('acquire:'))).toHaveLength(1);
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

    it.effect('rejects denied, untrusted, isolated and duplicate registrations atomically', /** Probe authorization and admission failures before lifecycle acquisition. */ () =>
        run(
            Effect.gen(/** Verify rejected registrations leave no published modules or acquired resources. */ function* () {
                // Establish an empty snapshot before the valid registration, then distinguish duplicate from incompatible reuse.
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

    it.effect('validates Config without leaking secrets in failures', /** Feed invalid then valid configuration into the same registered module. */ () =>
        run(
            Effect.gen(/** Verify configuration failures stay bounded and validation can subsequently succeed. */ function* () {
                // Keep the secret constant across failure and retry so successful validation cannot depend on removing redaction.
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const module = definition(manifest('feature'), events);
                const validate = Config.all({ limit: Config.integer('LIMIT'), secret: Config.redacted('SECRET') }).pipe(
                    Effect.asVoid,
                    Effect.mapError(/** Replace configuration details with a bounded module validation failure. */ () => new KernelError({ module: 'feature', reason: 'invalid-config' }))
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

    it.effect('preflights every module before publishing or starting a composition', /** Observe validation order and resource state during whole-composition preflight. */ () =>
        run(
            Effect.gen(/** Verify all validation succeeds before any composition module acquires or publishes. */ function* () {
                // Fail the second validator first; a valid prerequisite must not become visible before whole-plan validation finishes.
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const first = manifest('first');
                const second = manifest('second', { dependencies: [{ id: 'first', version: '1.0.0' }] });
                const validations: Array<string> = [];
                const modules = [first, second].map(/** Attach an observable preflight validator to each module. */ (spec) => ({
                    ...definition(spec, events),
                    validate: Effect.gen(/** Assert no publication or acquisition occurs while validating configuration. */ function* () {
                        // Inspect the kernel from inside validation to detect premature publication, not just eventual rollback.
                        validations.push(spec.id);
                        expect(events).toEqual([]);
                        expect(yield* kernel.snapshot).toEqual([]);
                        yield* Config.integer(spec.id).pipe(
                            Effect.mapError(/** Bound invalid configuration to the module currently being validated. */ () => new KernelError({ module: spec.id, reason: 'invalid-config' }))
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

    it.effect('interrupts composition preflight without publication and allows retry', /** Cancel composition while a validator is suspended. */ () =>
        run(
            Effect.gen(/** Verify canceled preflight finalizes validation without acquiring or publishing modules. */ function* () {
                // Wait for the validator barrier before cancellation, then retry unmodified modules to expose retained transaction state.
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
                expect(events.filter(/** Observe reverse-dependency finalization after retry scope exit. */ (event) => event.startsWith('release:'))).toEqual([
                    'release:second:1.0.0',
                    'release:first:1.0.0',
                ]);
            })
        )
    );

    it.effect('redacts composition preflight defects without publication and allows retry', /** Defect during whole-plan validation before module acquisition. */ () =>
        run(
            Effect.gen(/** Verify private configuration defects become bounded failures and leave composition retryable. */ function* () {
                // Retry after checking the empty snapshot to distinguish true preflight isolation from cleanup after publication.
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
                expect(events.filter(/** Observe finalization order after the successful post-defect retry. */ (event) => event.startsWith('release:'))).toEqual([
                    'release:second:1.0.0',
                    'release:first:1.0.0',
                ]);
            })
        )
    );

    it.effect('registration scope closes and removes its module', /** Start a module under a deliberately short registration scope. */ () =>
        run(
            Effect.gen(/** Verify scope exit releases resources and removes future lifecycle addressability. */ function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                yield* Effect.scoped(start(kernel, definition(manifest('temporary'), events)));
                expect(yield* kernel.snapshot).toEqual([]);
                expect(events.filter(/** Isolate the temporary registration's resource finalization. */ (event) => event.startsWith('release:'))).toEqual(['release:temporary:1.0.0']);
                expect(yield* reason(kernel.validate('temporary'))).toBe('missing');
            })
        )
    );

    it.effect('checks dependency versions, cycles and migrations before acquiring modules', /** Exercise rejected dependency and migration graphs without acquisition. */ () =>
        run(
            Effect.gen(/** Verify plan failures include exact cycle witnesses only when a cycle exists. */ function* () {
                // Reuse an empty kernel across invalid plans so any leaked registration or acquisition contaminates later controls.
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
                            specs.map(/** Build tracked implementations for each rejected plan selection. */ (spec) => definition(spec, events))
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

    it.effect('accepts shared dependencies without mistaking a diamond for a cycle', /** Compose a diamond with one shared base module. */ () =>
        run(
            Effect.gen(/** Verify shared dependencies install once in dependency order rather than triggering cycle rejection. */ function* () {
                // Select the top module first so topological startup must differ from the supplied manifest order.
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
                        specs.map(/** Build one tracked implementation per diamond vertex. */ (spec) => definition(spec, events))
                    )).emitted
                ).toBe(true);
                expect((yield* kernel.snapshot).map(/** Compare registration identity and readiness without version noise. */ ({ module, state }) => ({ module, state }))).toEqual([
                    { module: 'top', state: 'ready' },
                    { module: 'left', state: 'ready' },
                    { module: 'right', state: 'ready' },
                    { module: 'base', state: 'ready' },
                ]);
                expect(events.filter(/** Preserve installation order to verify dependency-first startup. */ (event) => event.startsWith('install:'))).toEqual([
                    'install:base:1.0.0',
                    'install:left:1.0.0',
                    'install:right:1.0.0',
                    'install:top:1.0.0',
                ]);
            })
        )
    );

    it.effect('rejects direct and indirect provider binding cycles before acquiring services', /** Build cycles through named capability bindings rather than declared dependency edges. */ () =>
        run(
            Effect.gen(/** Verify self, two-node and three-node capability cycles remain unpublished. */ function* () {
                // Close each binding ring explicitly so cycle detection must include provider-selection edges.
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const specs = ['alpha', 'beta', 'gamma'].map(/** Declare a provider that also consumes the same capability. */ (id) =>
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
                    const bindings = members.map(/** Connect each consumer to the next provider, closing the ring. */ (spec, index) => ({
                        consumer: spec.id,
                        requirement: 'store',
                        provider: members[(index + 1) % members.length]?.id ?? 'missing',
                        instance: 'primary',
                    }));
                    const result = yield* Effect.either(
                        kernel.compose(
                            composition(members, bindings),
                            members.map(/** Track acquisition if an invalid binding ring is mistakenly admitted. */ (spec) => definition(spec, events))
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

    it.effect('rejects ambiguous, missing, mismatched and undeclared provider bindings', /** Vary provider bindings while preserving consumer capability requirements. */ () =>
        run(
            Effect.gen(/** Verify binding validation fails before acquisition and undeclared runtime resolution is denied. */ function* () {
                // Keep module implementations valid so each rejection is attributable to binding selection or version metadata.
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

    it.effect('rejects malformed and duplicate declarations without acquiring a layer', /** Exercise strict manifest decoding and unique declaration names. */ () =>
        run(
            Effect.gen(/** Verify duplicate declaration categories and excess fields never publish registrations. */ function* () {
                // Duplicate each declaration family independently to prevent one early category from masking another.
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

    it.effect('rejects invalid state requests without changing registrations', /** Invoke lifecycle operations outside their permitted states. */ () =>
        run(
            Effect.gen(/** Verify invalid transitions do not mutate state and valid cleanup still releases once. */ function* () {
                // Continue with valid transitions after rejection to reveal state corruption caused by failed requests.
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
                expect(events.filter(/** Count finalization after rejected transitions and valid unregistration. */ (event) => event.startsWith('release:'))).toHaveLength(1);
            })
        )
    );

    it.effect('keeps inactive and installed updates non-serving', /** Replace versions outside the serving state. */ () =>
        run(
            Effect.gen(/** Verify updates preserve installed or inactive status without silently activating replacements. */ function* () {
                // Exercise installed and previously deactivated states separately; neither grants implicit activation on update.
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                yield* kernel.register(definition(manifest('feature'), events));
                yield* kernel.validate('feature');
                yield* kernel.install('feature');
                expect(
                    yield* kernel.update('feature', definition(manifest('feature', { version: '1.1.0' }), events))
                ).toEqual({ status: 'updated', version: '1.1.0' });
                expect(yield* kernel.snapshot).toEqual([{ module: 'feature', version: '1.1.0', state: 'installed' }]);
                expect(events.filter(/** Detect activation incorrectly introduced by an installed-state update. */ (event) => event.startsWith('activate:'))).toEqual([]);
                yield* kernel.activate('feature');
                yield* kernel.deactivate('feature');
                const next = {
                    ...definition(manifest('feature', { version: '1.2.0' }), events),
                    compatibleWith: '1.1.0',
                };
                expect(yield* kernel.update('feature', next)).toEqual({ status: 'updated', version: '1.2.0' });
                expect(yield* kernel.snapshot).toEqual([{ module: 'feature', version: '1.2.0', state: 'inactive' }]);
                expect(events.filter(/** Detect activation of the replacement of an inactive module. */ (event) => event === 'activate:feature:1.2.0')).toEqual([]);
            })
        )
    );

    it.effect('runs resource preflight before candidate installation and after lease rejection', /** Combine a held workflow lease with a migration-denying candidate validator. */ () =>
        run(
            Effect.gen(/** Verify lease rejection precedes preflight and migration preflight precedes acquisition. */ function* () {
                // Count preflight entry to distinguish lease admission rejection from candidate migration rejection.
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const before = yield* start(kernel, definition(manifest('feature'), events));
                const preflights = yield* Ref.make(0);
                const candidate = {
                    ...definition(manifest('feature', { version: '1.0.1' }), events),
                    validate: Ref.update(preflights, /** Count candidate validation independently of resource acquisition. */ (count) => count + 1).pipe(
                        Effect.andThen(
                            Effect.fail(new KernelError({ module: 'feature', reason: 'migration-required' }))
                        )
                    ),
                };
                yield* Effect.scoped(
                    Effect.gen(/** Keep a workflow lease live while attempting the migration candidate. */ function* () {
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
                expect(events.filter(/** Ensure migration denial acquired no candidate resource. */ (event) => event.startsWith('acquire:'))).toHaveLength(1);
                expect(yield* kernel.ready).toEqual({ ...before, emitted: false });
            })
        )
    );

    it.effect('retains exact dependency contracts and disallows pinned consumer auto-upgrades', /** Attempt dependency-changing and pinned-provider updates against a serving composition. */ () =>
        run(
            Effect.gen(/** Verify incompatible dependency edits require restart and preserve readiness generation. */ function* () {
                // Change dependencies independently from version so compatibility checks cannot rely on semver alone.
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

    it.effect('closes candidate scope on interruption without changing the serving generation', /** Suspend candidate activation before canceling replacement. */ () =>
        run(
            Effect.gen(/** Verify interrupted replacement releases only candidate ownership and retains the serving receipt. */ function* () {
                // Interrupt after candidate activation enters, ensuring cleanup covers an actually acquired candidate scope.
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
                expect(events.filter(/** Count candidate cleanup caused by update interruption. */ (event) => event === 'release:feature:1.0.1')).toHaveLength(1);
            })
        )
    );

    it.effect('drains workflow leases before scoped disposal and rejects new admission', /** Close registration ownership while an independently scoped workflow lease remains active. */ () =>
        run(
            Effect.gen(/** Verify disposal blocks new work but defers release until existing workflow ownership drains. */ function* () {
                // Separate registration and work scopes so disposal can wait for, rather than forcibly close, the lease.
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
                expect(events.filter(/** Detect premature release before outstanding work drains. */ (event) => event.startsWith('release:'))).toHaveLength(0);
                expect(yield* reason(kernel.workflow('feature'))).toBe('invalid-state');
                expect(yield* reason(kernel.ready)).toBe('invalid-state');
                expect(yield* reason(kernel.register(definition(manifest('new'), events)))).toBe('invalid-state');
                yield* Scope.close(work, Exit.void);
                yield* Fiber.join(disposing);
                expect(yield* kernel.snapshot).toEqual([]);
                expect(events.filter(/** Require exactly one release after lease ownership ends. */ (event) => event.startsWith('release:'))).toHaveLength(1);
            })
        )
    );

    it.effect('fails closed on unimplemented providers and staged initial migrations', /** Attempt installation with missing services and offline staged migration metadata. */ () =>
        run(
            Effect.gen(/** Verify missing provider cleanup and pre-acquisition migration rejection remain distinct. */ function* () {
                // Compare release and acquisition counts to distinguish post-acquisition provider failure from migration preflight denial.
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const spec = manifest('provider', {
                    provides: [{ name: 'main', capability: 'storage', version: '1.0.0' }],
                });
                yield* kernel.register(definition(spec, events, { providers: new Map<string, KernelProvider>() }));
                yield* kernel.validate('provider');
                expect(yield* reason(kernel.install('provider'))).toBe('module-failed');
                expect(events.filter(/** Count cleanup of the acquired but incomplete provider. */ (event) => event.startsWith('release:'))).toHaveLength(1);
                yield* kernel.unregister('provider');
                yield* kernel.register(
                    definition(
                        manifest('staged', { migrations: [{ id: 'break', kind: 'staged', online: false }] }),
                        events
                    )
                );
                yield* kernel.validate('staged');
                expect(yield* reason(kernel.install('staged'))).toBe('migration-required');
                expect(events.filter(/** Detect forbidden acquisition of a migration-blocked module. */ (event) => event.startsWith('acquire:'))).toHaveLength(1);
            })
        )
    );

    it.effect('cleans live dependents when a provider registration scope closes', /** Dispose provider registration while its dependent remains independently registered. */ () =>
        run(
            Effect.gen(/** Verify provider scope disposal cascades dependent cleanup in reverse dependency order. */ function* () {
                // Bind only the base registration to the short scope so dependent cleanup must be driven by kernel dependency ownership.
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
                expect(events.filter(/** Preserve dependent-before-provider cleanup order. */ (event) => event.startsWith('release:'))).toEqual([
                    'release:feature:1.0.0',
                    'release:base:1.0.0',
                ]);
            })
        )
    );

    it.effect('readiness failure cleans dependent services and failed recovery stays failed', /** Fail base health after startup, then fail its recovery preflight. */ () =>
        run(
            Effect.gen(/** Verify health failure cascades cleanup and invalid recovery never fabricates an active state. */ function* () {
                // Independent health and preflight switches distinguish readiness failure from a failed recovery attempt.
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const unhealthy = yield* Ref.make(false);
                const failPreflight = yield* Ref.make(false);
                const base = definition(manifest('base'), events, {
                    ready: Ref.get(unhealthy).pipe(
                        Effect.flatMap(/** Fail readiness only after the health switch is enabled. */ (value) => (value ? Effect.fail(failure('base')) : Effect.void))
                    ),
                });
                const feature = manifest('feature', { dependencies: [{ id: 'base', version: '1.0.0' }] });
                yield* kernel.register({
                    ...base,
                    validate: Ref.get(failPreflight).pipe(
                        Effect.flatMap(/** Fail recovery validation independently of runtime health. */ (value) => (value ? Effect.fail(failure('base')) : Effect.void))
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
                expect((yield* kernel.snapshot).map(/** Compare failure propagation across base and dependent registrations. */ ({ state }) => state)).toEqual(['failed', 'failed']);
                expect(events.filter(/** Observe dependency-ordered release after readiness failure. */ (event) => event.startsWith('release:'))).toEqual([
                    'release:feature:1.0.0',
                    'release:base:1.0.0',
                ]);
                yield* Ref.set(failPreflight, true);
                expect(yield* reason(kernel.recover('base'))).toBe('invalid-config');
                expect((yield* kernel.snapshot)[0]?.state).toBe('failed');
            })
        )
    );

    it.effect('preserves serving state when candidate config fails and rejects nonempty composition', /** Reject candidate validation and invalid mutations of a serving kernel. */ () =>
        run(
            Effect.gen(/** Verify failed configuration and invalid composition leave the existing generation serving. */ function* () {
                // Establish readiness first so rejection must preserve a serving generation rather than merely leave an empty kernel.
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

    it.effect('composition validates exact module selections and undeclared bindings transactionally', /** Supply duplicate, mismatched and undeclared composition metadata. */ () =>
        run(
            Effect.gen(/** Verify invalid selections publish no registration and acquire no module resources. */ function* () {
                // Reuse the empty kernel after each rejection to expose partial registration or acquisition from any invalid request.
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

    it.effect('attests provenance and assurance independently of self-declared trust', /** Deny attestation despite a first-party manifest and otherwise allowed operations. */ () =>
        Effect.gen(/** Verify independent authority admission overrides self-declared manifest trust. */ function* () {
            const events: Array<string> = [];
            const denied = Layer.succeed(KernelAuthority, {
                /** Leave operation authorization open to isolate provenance admission. */
                authorize: () => Effect.void,
                /** Reject assurance independently of the module's declared trust value. */
                admit: () => Effect.fail(new KernelError({ module: 'feature', reason: 'assurance-unmet' })),
            });
            yield* Effect.gen(/** Verify failed admission neither registers the module nor acquires its layer. */ function* () {
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

    it.effect('snapshots decoded identities independently of caller-owned manifest mutation', /** Mutate source manifest metadata after successful startup. */ () =>
        run(
            Effect.gen(/** Verify caller-owned objects cannot rewrite registered identity or lease version. */ function* () {
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const source = { ...manifest('feature'), version: '1.0.0' };
                const receipt = yield* start(kernel, definition(source, events));
                yield* Effect.scoped(
                    Effect.gen(/** Compare a pinned lease and live snapshot after mutating the source version. */ function* () {
                        // Mutate only after leasing so both the lease and kernel snapshot must retain independently decoded identity.
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

    for (const change of ['untouched', 'dependencies', 'id', 'metadata'] as const) {
        it.effect(
            `isolates the returned registration manifest: ${change}`,
            /** Keep dependency rejection and scope removal bound to the admitted manifest. */ () =>
                run(
                    Effect.gen(
                        /** Observe validation and disposal before asserting, so a renamed registration cannot hide a leak. */ function* () {
                            // The registration scope closes while the kernel stays alive, exposing stale registry entries.
                            const kernel = yield* Kernel;
                            const observed = yield* Effect.scoped(
                                Effect.gen(
                                    /** Attempt independent identity, topology and security rewrites through the public return value. */ function* () {
                                        const returned = yield* kernel.register(
                                            definition(
                                                manifest('consumer', {
                                                    dependencies: [{ id: 'absent', version: '1.0.0' }],
                                                    provides: [
                                                        { name: 'primary', capability: 'records', version: '2.0.0' },
                                                    ],
                                                }),
                                                []
                                            )
                                        );
                                        if (change === 'dependencies')
                                            Object.assign(returned.dependencies, { length: 0 });
                                        if (change === 'id') Object.assign(returned, { id: 'renamed' });
                                        if (change === 'metadata') {
                                            Object.assign(returned, {
                                                version: '9.9.9',
                                                trust: 'untrusted',
                                                isolation: 'isolated',
                                            });
                                            for (const item of returned.provides)
                                                Object.assign(item, {
                                                    name: 'changed',
                                                    capability: 'changed',
                                                    version: '9.9.9',
                                                });
                                            Object.assign(returned.requires, {
                                                0: { name: 'input', capability: 'changed', version: '9.9.9' },
                                                length: 1,
                                            });
                                        }
                                        return {
                                            validation: yield* reason(kernel.validate('consumer')),
                                            snapshot: yield* kernel.snapshot,
                                        };
                                    }
                                )
                            );
                            expect(yield* kernel.snapshot).toEqual([]);
                            expect(observed).toEqual({
                                validation: 'dependency-missing',
                                snapshot: [{ module: 'consumer', version: '1.0.0', state: 'registered' }],
                            });
                        }
                    )
                )
        );
    }

    for (const boundary of ['untouched', 'admit', 'authorize'] as const) {
        it.effect(
            `isolates authority manifest views during composition: ${boundary}`,
            /** Exercise original provider pins, lifecycle and disposal despite adapter rewrites. */ () => {
                const events: Array<string> = [];
                /** Corrupt both nested declarations and top-level fields to distinguish deep isolation from a shallow copy. */
                const rewrite = (view: KernelManifest) => {
                    for (const item of [...view.dependencies, ...view.provides, ...view.requires, ...view.migrations])
                        Object.assign(item, {
                            id: 'absent',
                            name: 'changed',
                            capability: 'changed',
                            version: '9.9.9',
                            online: false,
                        });
                    Object.assign(view.dependencies, { length: 0 });
                    Object.assign(view, {
                        id: 'renamed',
                        version: '9.9.9',
                        trust: 'untrusted',
                        isolation: 'isolated',
                        restartRequired: true,
                    });
                };
                const hostile = Layer.succeed(KernelAuthority, {
                    /** Inspect a disposable view without authority to rewrite admitted provenance. */
                    admit: (view) =>
                        Effect.sync(
                            /** Apply the mutation only at the boundary selected by this scenario. */ () => {
                                if (boundary === 'admit') rewrite(view);
                            }
                        ),
                    /** Inspect every operation, including resolve and workflow, without changing registry metadata. */
                    authorize: (_identity, _operation, view) =>
                        Effect.sync(
                            /** Isolate operation authorization from provenance admission mutations. */ () => {
                                if (boundary === 'authorize') rewrite(view);
                            }
                        ),
                });
                return Effect.gen(
                    /** Start an explicitly bound graph, observe provider selection and then close only registration ownership. */ function* () {
                        // Keep two same-capability instances so a changed instance cannot accidentally return an equivalent binding.
                        const kernel = yield* Kernel;
                        const provider = manifest('provider', {
                            provides: [
                                { name: 'primary', capability: 'records', version: '2.0.0' },
                                { name: 'reporting', capability: 'records', version: '2.0.0' },
                            ],
                        });
                        const consumer = manifest('consumer', {
                            dependencies: [{ id: 'provider', version: '1.0.0' }],
                            requires: [{ name: 'input', capability: 'records', version: '2.0.0' }],
                            migrations: [{ id: 'initial', kind: 'additive', online: true }],
                        });
                        const binding = {
                            consumer: 'consumer',
                            requirement: 'input',
                            provider: 'provider',
                            instance: 'reporting',
                        };
                        yield* Effect.scoped(
                            Effect.gen(
                                /** Verify admitted manifests still drive planning and public ready leases. */ function* () {
                                    yield* kernel.compose(composition([consumer, provider], [binding]), [
                                        definition(consumer, events),
                                        definition(provider, events),
                                    ]);
                                    expect(yield* kernel.resolve('consumer', 'input')).toEqual(binding);
                                    yield* Effect.scoped(
                                        Effect.gen(
                                            /** Pin the original identity/version after repeated adapter callbacks. */ function* () {
                                                expect(yield* kernel.workflow('consumer')).toMatchObject({
                                                    module: 'consumer',
                                                    version: '1.0.0',
                                                });
                                            }
                                        )
                                    );
                                    expect(yield* kernel.snapshot).toEqual([
                                        { module: 'consumer', version: '1.0.0', state: 'ready' },
                                        { module: 'provider', version: '1.0.0', state: 'ready' },
                                    ]);
                                }
                            )
                        );
                        expect(yield* kernel.snapshot).toEqual([]);
                        expect(
                            events.filter(
                                /** Observe dependent-first cleanup rather than internal registry implementation. */ (
                                    event
                                ) => event.startsWith('release:')
                            )
                        ).toEqual(['release:consumer:1.0.0', 'release:provider:1.0.0']);
                    }
                ).pipe(
                    Effect.provideService(Caller, caller),
                    Effect.provide(KernelLive('authority-runtime').pipe(Layer.provide(hostile))),
                    Effect.scoped
                );
            }
        );
    }

    for (const boundary of ['caller', 'admit', 'authorize'] as const) {
        it.effect(
            `isolates a staged update from retained ${boundary} manifests`,
            /** Attempt replacement rewrites while deterministic preflight holds the candidate unpublished. */ () => {
                const retained: Array<KernelManifest> = [];
                const events: Array<string> = [];
                const observing = Layer.succeed(KernelAuthority, {
                    /** Retain the candidate admission view for mutation during its later preflight. */
                    admit: (view) =>
                        Effect.sync(
                            /** Capture only the replacement, leaving the serving control untouched. */ () => {
                                if (boundary === 'admit' && view.version === '1.0.1') retained.push(view);
                            }
                        ),
                    /** Retain the candidate authorization view rather than the serving module's update check. */
                    authorize: (_identity, _operation, view) =>
                        Effect.sync(
                            /** Separate candidate and serving identities using their exact versions. */ () => {
                                if (boundary === 'authorize' && view.version === '1.0.1') retained.push(view);
                            }
                        ),
                });
                return Effect.gen(
                    /** Keep the admitted replacement and its registration finalizer independent of all retained views. */ function* () {
                        // Mutate after admission but before build, without letting fixture layer closures read caller-owned metadata.
                        const kernel = yield* Kernel;
                        const entered = yield* Deferred.make<void>();
                        const resume = yield* Deferred.make<void>();
                        const provider = manifest('provider', {
                            provides: [{ name: 'primary', capability: 'records', version: '2.0.0' }],
                        });
                        const consumer = manifest('consumer', {
                            requires: [{ name: 'input', capability: 'records', version: '2.0.0' }],
                        });
                        const source = {
                            ...consumer,
                            version: '1.0.1',
                            migrations: [{ id: 'add', kind: 'additive' as const, online: true }],
                        };
                        const binding = {
                            consumer: 'consumer',
                            requirement: 'input',
                            provider: 'provider',
                            instance: 'primary',
                        };
                        yield* Effect.scoped(
                            Effect.gen(
                                /** Stage and publish a compatible replacement under the original registration scope. */ function* () {
                                    yield* kernel.compose(composition([consumer, provider], [binding]), [
                                        definition(consumer, events),
                                        definition(provider, events),
                                    ]);
                                    const candidate = {
                                        ...definition(structuredClone(source), events),
                                        manifest: source,
                                        validate: Deferred.succeed(entered, undefined).pipe(
                                            Effect.andThen(Deferred.await(resume))
                                        ),
                                    };
                                    const updating = yield* kernel.update('consumer', candidate).pipe(Effect.fork);
                                    yield* Deferred.await(entered);
                                    if (boundary === 'caller') retained.push(source);
                                    expect(retained.length).toBeGreaterThan(0);
                                    for (const view of retained) {
                                        for (const requirement of view.requires)
                                            Object.assign(requirement, {
                                                name: 'changed',
                                                capability: 'changed',
                                                version: '9.9.9',
                                            });
                                        for (const migration of view.migrations)
                                            Object.assign(migration, { kind: 'staged', online: false });
                                        Object.assign(view, {
                                            id: 'renamed',
                                            version: '9.9.9',
                                            trust: 'untrusted',
                                            isolation: 'isolated',
                                            dependencies: [{ id: 'absent', version: '1.0.0' }],
                                        });
                                    }
                                    yield* Deferred.succeed(resume, undefined);
                                    expect(yield* Fiber.join(updating)).toEqual({
                                        status: 'updated',
                                        version: '1.0.1',
                                    });
                                    yield* kernel.ready;
                                    expect(yield* kernel.resolve('consumer', 'input')).toEqual(binding);
                                    expect(yield* kernel.snapshot).toEqual([
                                        { module: 'consumer', version: '1.0.1', state: 'ready' },
                                        { module: 'provider', version: '1.0.0', state: 'ready' },
                                    ]);
                                }
                            )
                        );
                        expect(yield* kernel.snapshot).toEqual([]);
                        expect(
                            events.filter(
                                /** Require exactly one release for the old version and each surviving registration. */ (
                                    event
                                ) => event.startsWith('release:')
                            )
                        ).toEqual(['release:consumer:1.0.0', 'release:consumer:1.0.1', 'release:provider:1.0.0']);
                    }
                ).pipe(
                    Effect.provideService(Caller, caller),
                    Effect.provide(KernelLive('update-runtime').pipe(Layer.provide(observing))),
                    Effect.scoped
                );
            }
        );
    }

    it.effect('redacts defective config and still releases scope when deactivation fails', /** Exercise private validation defects and failed deactivation cleanup. */ () =>
        run(
            Effect.gen(/** Verify bounded configuration errors and resource finalization survive distinct lifecycle failures. */ function* () {
                // Unregister the invalid module before the deactivation scenario so its unacquired scope cannot inflate cleanup evidence.
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
                expect(events.filter(/** Ensure failed deactivation does not duplicate or skip resource release. */ (event) => event.startsWith('release:'))).toHaveLength(1);
            })
        )
    );

    it.effect('retries an unverified installation on recovery', /** Fail the first install while allowing its recovery attempt. */ () =>
        run(
            Effect.gen(/** Verify recovery repeats failed installation before reporting readiness. */ function* () {
                // Count the actual hook calls so a state-only recovery cannot falsely satisfy readiness.
                const kernel = yield* Kernel;
                const events: Array<string> = [];
                const attempts = yield* Ref.make(0);
                const module = definition(manifest('feature'), events, {
                    install: Ref.updateAndGet(attempts, /** Count every installation attempt, including failure. */ (count) => count + 1).pipe(
                        Effect.flatMap(/** Reject only the first install so recovery must actually retry it. */ (count) => (count === 1 ? Effect.fail(failure('feature')) : Effect.void))
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
