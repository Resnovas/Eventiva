/**
 * @file packages/runtime/src/kernel-runtime.ts
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

import { Caller } from '@eventiva/contracts/caller';
import {
    KernelManifest,
    ModuleId,
    PlatformComposition,
    type LifecycleOperation,
    type ModuleState,
    type ProviderBinding,
    type ReadyReceipt,
    type UpdateResult,
} from '@eventiva/contracts/module-manifest';
import { KernelAuthority, KernelError } from '@eventiva/contracts/module-policy';
import { Cause, Context, Deferred, Effect, ExecutionStrategy, Exit, Layer, Option, Order, Schema, Scope } from 'effect';

/** A provider value is accessible only through the consumer's exact service Schema. */
export interface KernelProvider {
    readonly resolve: <A, I>(schema: Schema.Schema<A, I>) => Effect.Effect<A, KernelError>;
}

/** Validate the producer contract before publication; retain its decoded service, not its wire encoding. */
export const kernelProvider = <A, I>(
    schema: Schema.Schema<A, I>,
    value: NoInfer<A>
): Effect.Effect<KernelProvider, KernelError> =>
    Schema.validate(schema, { onExcessProperty: 'error' })(value).pipe(
        Effect.mapError(() => error('<provider>', 'invalid-contract')),
        Effect.map((service): KernelProvider => ({
            resolve: (consumer) =>
                Schema.validate(consumer, { onExcessProperty: 'error' })(service).pipe(
                    Effect.mapError(() => error('<provider>', 'invalid-contract'))
                ),
        }))
    );

/** Per-module access is restricted to explicitly bound, version-checked requirements. */
export class KernelEnvironment extends Context.Tag('@eventiva/runtime/KernelEnvironment')<
    KernelEnvironment,
    {
        readonly resolve: <A, I>(requirement: string, schema: Schema.Schema<A, I>) => Effect.Effect<A, KernelError>;
    }
>() {}

/**
 * A trusted module's scoped services. All acquired resources must have scope finalizers.
 * install may apply only coordinated additive migrations; no lifecycle hook deletes data.
 * ready verifies health; platform-ready delivery belongs to the receipt, not activation.
 */
export class KernelModule extends Context.Tag('@eventiva/runtime/KernelModule')<
    KernelModule,
    {
        readonly providers: ReadonlyMap<string, KernelProvider>;
        readonly install: Effect.Effect<void, KernelError>;
        readonly activate: Effect.Effect<void, KernelError>;
        readonly ready: Effect.Effect<void, KernelError>;
        readonly deactivate: Effect.Effect<void, KernelError>;
    }
>() {}

export interface ModuleDefinition {
    /** Exact wire contract; register/update still validate all runtime constraints before use. */
    readonly manifest: KernelManifest;
    readonly layer: Layer.Layer<KernelModule, KernelError, KernelEnvironment>;
    /** Preflight only: Config, secret-safe admission and resource compatibility; no mutation. */
    readonly validate: Effect.Effect<void, KernelError>;
    /** Explicit hot-compatibility declaration naming exactly the previous version. */
    readonly compatibleWith?: string;
}

export interface KernelSnapshot {
    readonly module: string;
    readonly version: string;
    readonly state: ModuleState;
}

export interface WorkflowLease {
    readonly module: string;
    readonly version: string;
    readonly generation: number;
}

type Operation<A = void> = Effect.Effect<A, KernelError, Caller>;

/** Administrative lifecycle only. Business execution still goes through ActionHost. */
export class Kernel extends Context.Tag('@eventiva/runtime/Kernel')<
    Kernel,
    {
        readonly register: (
            definition: ModuleDefinition
        ) => Effect.Effect<KernelManifest, KernelError, Caller | Scope.Scope>;
        readonly validate: (id: string) => Operation;
        readonly install: (id: string) => Operation;
        readonly activate: (id: string) => Operation;
        readonly ready: Operation<ReadyReceipt>;
        readonly deactivate: (id: string) => Operation;
        readonly unregister: (id: string) => Operation;
        readonly retire: (id: string) => Operation;
        readonly update: (id: string, definition: ModuleDefinition) => Operation<UpdateResult>;
        readonly recover: (id: string) => Operation;
        /** Exact wire contract, validated before registry mutation. */
        readonly compose: (
            composition: PlatformComposition,
            definitions: ReadonlyArray<ModuleDefinition>
        ) => Effect.Effect<ReadyReceipt, KernelError, Caller | Scope.Scope>;
        readonly resolve: (consumer: string, requirement: string) => Operation<ProviderBinding>;
        readonly workflow: (id: string) => Effect.Effect<WorkflowLease, KernelError, Caller | Scope.Scope>;
        readonly snapshot: Effect.Effect<ReadonlyArray<KernelSnapshot>>;
    }
>() {}

interface Running {
    readonly scope: Scope.CloseableScope;
    readonly service: Context.Tag.Service<KernelModule>;
}
interface Entry {
    manifest: KernelManifest;
    definition: ModuleDefinition;
    state: ModuleState;
    running: Running | undefined;
    installed: boolean;
}

const error = (module: string, reason: KernelError['reason']) => new KernelError({ module, reason });
const strict = { onExcessProperty: 'error' } as const;
const decode = <A, I>(schema: Schema.Schema<A, I>, value: NoInfer<I>) =>
    Schema.decode(schema, strict)(value).pipe(Effect.mapError(() => error('<contract>', 'invalid-contract')));
const unique = (names: ReadonlyArray<string>) => new Set(names).size === names.length;
const live = (entry: Entry) => entry.state === 'active' || entry.state === 'ready';
const dependencies = (manifest: KernelManifest, bindings: ReadonlyArray<ProviderBinding>) => [
    ...manifest.dependencies.map(({ id }) => id),
    ...bindings.filter(({ consumer }) => consumer === manifest.id).map(({ provider }) => provider),
];

type KernelOutcome = 'succeeded' | 'failed' | 'interrupted' | 'emitted' | 'unchanged' | 'updated' | 'restart-required';

// Operation observations only; central telemetry sanitizes Exit causes before export.
const kernelSpan = <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    name: `kernel.${LifecycleOperation | 'compose' | 'preflight' | 'release' | 'provider.select' | 'workflow.acquire' | 'workflow.release'}`,
    outcome: (value: A) => KernelOutcome = () => 'succeeded'
) =>
    effect.pipe(
        Effect.onExit((exit) =>
            Effect.annotateCurrentSpan(
                'eventiva.kernel.outcome',
                Exit.isSuccess(exit)
                    ? outcome(exit.value)
                    : Cause.isInterruptedOnly(exit.cause)
                      ? 'interrupted'
                      : 'failed'
            )
        ),
        Effect.withSpan(name, { captureStackTrace: false })
    );

/**
 * One independent registry per built layer; no globals or ambient singleton.
 * Leases and ready receipts are process-local, not durable fencing or outbox delivery.
 */
export const KernelLive = (runtimeId: string): Layer.Layer<Kernel, KernelError, KernelAuthority> =>
    Layer.scoped(
        Kernel,
        Effect.gen(function* () {
            yield* decode(ModuleId, runtimeId);
            const authority = yield* KernelAuthority;
            const mutex = yield* Effect.makeSemaphore(1);
            const entries = new Map<string, Entry>();
            let bindings: ReadonlyArray<ProviderBinding> = [];
            let generation = 0;
            let readyGeneration = -1;
            let leases = 0;
            let closing = 0;
            let drained = yield* Deferred.make<void>();

            const changed = () => {
                generation += 1;
                readyGeneration = -1;
                for (const entry of entries.values()) if (entry.state === 'ready') entry.state = 'active';
            };
            const lookup = (id: string, registry: ReadonlyMap<string, Entry> = entries) =>
                Effect.suspend(() => {
                    const entry = registry.get(id);
                    return entry === undefined ? Effect.fail(error(id, 'missing')) : Effect.succeed(entry);
                });
            const authorize = (entry: Entry, operation: LifecycleOperation) =>
                Effect.gen(function* () {
                    const caller = yield* Caller;
                    yield* authority.authorize(caller, operation, entry.manifest);
                });
            const mutable = () =>
                closing
                    ? Effect.fail(error('<platform>', 'invalid-state'))
                    : leases > 0
                      ? Effect.fail(error('<platform>', 'workflow-active'))
                      : Effect.void;
            const admitted = (manifest: KernelManifest) =>
                Effect.gen(function* () {
                    if (manifest.trust === 'untrusted') return yield* error(manifest.id, 'untrusted');
                    // A self-declared isolation mode is not an actual sandbox. No executable fallback.
                    if (manifest.isolation !== 'in-process') return yield* error(manifest.id, 'isolation-unavailable');
                    yield* authority.admit(manifest);
                    if (
                        !unique(manifest.dependencies.map(({ id }) => id)) ||
                        !unique(manifest.provides.map(({ name }) => name)) ||
                        !unique(manifest.requires.map(({ name }) => name)) ||
                        !unique(manifest.migrations.map(({ id }) => id))
                    )
                        return yield* error(manifest.id, 'duplicate');
                });
            const selected = (
                consumer: string,
                requirement: string,
                candidate?: Entry,
                registry: ReadonlyMap<string, Entry> = entries,
                selectionBindings: ReadonlyArray<ProviderBinding> = bindings
            ) =>
                Effect.gen(function* () {
                    const entry = candidate ?? (yield* lookup(consumer));
                    const required = entry.manifest.requires.find(({ name }) => name === requirement);
                    const matches = selectionBindings.filter(
                        (binding) => binding.consumer === consumer && binding.requirement === requirement
                    );
                    if (required === undefined) return yield* error(consumer, 'undeclared-dependency');
                    const [binding] = matches;
                    if (binding === undefined) return yield* error(consumer, 'provider-unavailable');
                    if (matches.length > 1) return yield* error(consumer, 'provider-ambiguous');
                    const provider = registry.get(binding.provider);
                    if (provider === undefined) return yield* error(consumer, 'provider-unavailable');
                    const declaration = provider.manifest.provides.find(({ name }) => name === binding.instance);
                    if (declaration === undefined) return yield* error(consumer, 'provider-unavailable');
                    if (declaration.capability !== required.capability || declaration.version !== required.version)
                        return yield* error(consumer, 'capability-version');
                    return { binding, provider };
                }).pipe((effect) => kernelSpan(effect, 'kernel.provider.select'));
            const plan = (
                candidate?: Entry,
                registry: ReadonlyMap<string, Entry> = entries,
                plannedBindings: ReadonlyArray<ProviderBinding> = bindings
            ) =>
                Effect.gen(function* () {
                    const all = new Map(registry);
                    if (candidate !== undefined) all.set(candidate.manifest.id, candidate);
                    for (const binding of plannedBindings) {
                        const consumer = all.get(binding.consumer);
                        if (
                            consumer === undefined ||
                            !consumer.manifest.requires.some(({ name }) => name === binding.requirement)
                        )
                            return yield* error(binding.consumer, 'invalid-contract');
                    }
                    const ordered: Array<string> = [];
                    const visiting = new Set<string>();
                    const visited = new Set<string>();
                    const path: Array<string> = [];
                    const visit = (id: string): Effect.Effect<void, KernelError> =>
                        Effect.gen(function* () {
                            if (visiting.has(id))
                                return yield* new KernelError({
                                    module: id,
                                    reason: 'cycle',
                                    cycle: [...path.slice(path.indexOf(id)), id],
                                });
                            if (visited.has(id)) return;
                            const entry = all.get(id);
                            if (entry === undefined || entry.state === 'retired') return yield* error(id, 'missing');
                            visiting.add(id);
                            path.push(id);
                            for (const dependency of entry.manifest.dependencies) {
                                const target = all.get(dependency.id);
                                if (target === undefined) return yield* error(id, 'dependency-missing');
                                if (target.manifest.version !== dependency.version)
                                    return yield* error(id, 'dependency-version');
                            }
                            for (const requirement of entry.manifest.requires) {
                                yield* selected(id, requirement.name, entry, all, plannedBindings);
                            }
                            for (const dependency of dependencies(entry.manifest, plannedBindings))
                                yield* visit(dependency);
                            path.pop();
                            visiting.delete(id);
                            visited.add(id);
                            ordered.push(id);
                        });
                    for (const [id, entry] of all) if (entry.state !== 'retired') yield* visit(id);
                    return ordered;
                });
            const guardFailure = <A, E, R>(id: string, effect: Effect.Effect<A, E, R>) =>
                effect.pipe(
                    Effect.catchAllCause((cause) =>
                        Cause.isInterruptedOnly(cause) ? Effect.interrupt : Effect.fail(error(id, 'module-failed'))
                    )
                );
            const preflight = (entry: Entry) =>
                entry.definition.validate.pipe(
                    Effect.catchAllCause((cause) => {
                        if (Cause.isInterruptedOnly(cause)) return Effect.interrupt;
                        const failure = Cause.failureOption(cause);
                        return Effect.fail(
                            error(
                                entry.manifest.id,
                                Option.isSome(failure) && failure.value.reason === 'migration-required'
                                    ? 'migration-required'
                                    : 'invalid-config'
                            )
                        );
                    }),
                    (effect) => kernelSpan(effect, 'kernel.preflight')
                );
            const release = (id: string, running: Running) =>
                Effect.uninterruptibleMask((restore) =>
                    Effect.gen(function* () {
                        const result = yield* Effect.exit(restore(guardFailure(id, running.service.deactivate)));
                        const closed = yield* Effect.exit(guardFailure(id, Scope.close(running.scope, Exit.void)));
                        if (Exit.isFailure(result)) return yield* result;
                        if (Exit.isFailure(closed)) return yield* closed;
                    })
                ).pipe((effect) => kernelSpan(effect, 'kernel.release'));
            const cleanup = (id: string, running: Running) =>
                release(id, running).pipe(
                    Effect.catchAll(() =>
                        Effect.logError('Kernel scope cleanup failed', { module: id, reason: 'module-failed' })
                    )
                );
            const close = (entry: Entry) =>
                Effect.gen(function* () {
                    const running = entry.running;
                    if (running === undefined) return;
                    // Scope finalizers always run even when the module's deactivation hook fails.
                    const result = yield* Effect.exit(release(entry.manifest.id, running));
                    entry.running = undefined;
                    entry.state = 'inactive';
                    changed();
                    if (Exit.isFailure(result)) return yield* result;
                });
            const dependents = (id: string) =>
                [...entries.values()].filter(
                    (entry) => live(entry) && dependencies(entry.manifest, bindings).includes(id)
                );
            const markFailed = (entry: Entry): Effect.Effect<void> =>
                Effect.gen(function* () {
                    for (const dependent of dependents(entry.manifest.id)) yield* markFailed(dependent);
                    yield* close(entry).pipe(
                        Effect.catchAll(() =>
                            Effect.logError('Kernel failed-module cleanup failed', { module: entry.manifest.id })
                        )
                    );
                    entry.state = 'failed';
                });
            const removeScoped = (id: string, entry: Entry): Effect.Effect<void> =>
                Effect.gen(function* () {
                    if (entries.get(id) !== entry) return;
                    for (const dependent of dependents(id)) yield* removeScoped(dependent.manifest.id, dependent);
                    yield* close(entry).pipe(
                        Effect.catchAll(() => Effect.logError('Kernel scope cleanup failed', { module: id }))
                    );
                    entries.delete(id);
                    bindings = bindings.filter((binding) => binding.consumer !== id && binding.provider !== id);
                    changed();
                });
            const dispose = (id: string, entry: Entry) =>
                Effect.gen(function* () {
                    if (entries.get(id) !== entry) return;
                    // Do not hold the lifecycle mutex while waiting: workflow releases must progress.
                    const wait = yield* mutex.withPermits(1)(
                        Effect.sync(() => {
                            closing += 1;
                            return leases > 0 ? Deferred.await(drained) : Effect.void;
                        })
                    );
                    yield* wait;
                    yield* mutex
                        .withPermits(1)(removeScoped(id, entry))
                        .pipe(
                            Effect.ensuring(
                                Effect.sync(() => {
                                    closing -= 1;
                                })
                            )
                        );
                });
            const publish = (entry: Entry) =>
                Effect.acquireRelease(
                    Effect.sync(() => {
                        entries.set(entry.manifest.id, entry);
                        changed();
                        return entry;
                    }),
                    () => dispose(entry.manifest.id, entry)
                );
            const register = (definition: ModuleDefinition) =>
                Effect.gen(function* () {
                    yield* mutable();
                    const manifest = yield* decode(KernelManifest, definition.manifest);
                    const entry: Entry = {
                        manifest,
                        definition,
                        state: 'registered',
                        running: undefined,
                        installed: false,
                    };
                    yield* authorize(entry, 'register');
                    yield* admitted(manifest);
                    const previous = entries.get(manifest.id);
                    if (previous !== undefined)
                        return yield* error(
                            manifest.id,
                            previous.manifest.version === manifest.version ? 'duplicate' : 'incompatible'
                        );
                    yield* publish(entry);
                    return manifest;
                }).pipe((effect) => kernelSpan(effect, 'kernel.register'));
            const validate = (id: string) =>
                Effect.gen(function* () {
                    const entry = yield* lookup(id);
                    yield* authorize(entry, 'validate');
                    yield* mutable();
                    if (!['registered', 'validated'].includes(entry.state)) return yield* error(id, 'invalid-state');
                    yield* plan();
                    yield* admitted(entry.manifest);
                    yield* preflight(entry);
                    entry.state = 'validated';
                }).pipe((effect) => kernelSpan(effect, 'kernel.validate'));
            const build = (entry: Entry) =>
                Effect.gen(function* () {
                    // Kernel and registration finalizers drain leases before closing these private scopes.
                    const scope = yield* Scope.make();
                    const environment = KernelEnvironment.of({
                        resolve: (requirement, schema) =>
                            Effect.gen(function* () {
                                const { binding, provider } = yield* selected(entry.manifest.id, requirement, entry);
                                if (!live(provider) || provider.running === undefined)
                                    return yield* error(entry.manifest.id, 'provider-unavailable');
                                const service = provider.running.service.providers.get(binding.instance);
                                if (service === undefined)
                                    return yield* error(entry.manifest.id, 'provider-unavailable');
                                return yield* service.resolve(schema);
                            }),
                    });
                    const prepared = Effect.gen(function* () {
                        const context = yield* Layer.buildWithScope(entry.definition.layer, scope).pipe(
                            Effect.provideService(KernelEnvironment, environment)
                        );
                        const service = Context.get(context, KernelModule);
                        const provided = [...service.providers.keys()];
                        if (
                            provided.length !== entry.manifest.provides.length ||
                            !entry.manifest.provides.every(({ name }) => service.providers.has(name))
                        )
                            return yield* error(entry.manifest.id, 'invalid-contract');
                        return { scope, service };
                    });
                    return yield* guardFailure(entry.manifest.id, prepared).pipe(
                        Effect.onError(() => Scope.close(scope, Exit.void))
                    );
                });
            const install = (id: string) =>
                Effect.gen(function* () {
                    const entry = yield* lookup(id);
                    yield* authorize(entry, 'install');
                    yield* mutable();
                    if (entry.state !== 'validated') return yield* error(id, 'invalid-state');
                    yield* plan();
                    if (entry.manifest.migrations.some(({ kind, online }) => kind === 'staged' || !online))
                        return yield* error(id, 'migration-required');
                    const prepared = Effect.gen(function* () {
                        const running = yield* build(entry);
                        yield* guardFailure(id, running.service.install).pipe(
                            Effect.onError(() => cleanup(id, running))
                        );
                        return running;
                    });
                    entry.running = yield* prepared.pipe(
                        Effect.onError(() =>
                            Effect.sync(() => {
                                entry.state = 'failed';
                            })
                        )
                    );
                    entry.installed = true;
                    entry.state = 'installed';
                }).pipe((effect) => kernelSpan(effect, 'kernel.install'));
            const activate = (id: string) =>
                Effect.gen(function* () {
                    const entry = yield* lookup(id);
                    yield* authorize(entry, 'activate');
                    yield* mutable();
                    if (entry.state !== 'installed' && entry.state !== 'inactive')
                        return yield* error(id, 'invalid-state');
                    for (const dependency of dependencies(entry.manifest, bindings)) {
                        if (!live(yield* lookup(dependency))) return yield* error(id, 'provider-unavailable');
                    }
                    if (entry.running === undefined)
                        entry.running = yield* build(entry).pipe(
                            Effect.onError(() =>
                                Effect.sync(() => {
                                    entry.state = 'failed';
                                })
                            )
                        );
                    yield* guardFailure(
                        id,
                        Effect.zipRight(entry.running.service.activate, entry.running.service.ready)
                    ).pipe(Effect.onError(() => markFailed(entry)));
                    entry.state = 'active';
                    changed();
                }).pipe((effect) => kernelSpan(effect, 'kernel.activate'));
            const ready = Effect.gen(function* () {
                if (closing) return yield* error('<platform>', 'invalid-state');
                const order = yield* plan();
                if (order.length === 0) return yield* error('<platform>', 'invalid-state');
                for (const id of order) yield* authorize(yield* lookup(id), 'ready');
                if (readyGeneration === generation) return { runtimeId, generation, emitted: false };
                for (const id of order) {
                    const entry = yield* lookup(id);
                    if (!live(entry) || entry.running === undefined) return yield* error(id, 'not-ready');
                    yield* guardFailure(id, entry.running.service.ready).pipe(Effect.onError(() => markFailed(entry)));
                }
                for (const id of order) (yield* lookup(id)).state = 'ready';
                readyGeneration = generation;
                return { runtimeId, generation, emitted: true };
            }).pipe((effect) =>
                kernelSpan(effect, 'kernel.ready', (receipt) => (receipt.emitted ? 'emitted' : 'unchanged'))
            );
            const stop = (id: string, operation: 'deactivate' | 'unregister' | 'retire') =>
                Effect.gen(function* () {
                    const entry = yield* lookup(id);
                    yield* authorize(entry, operation);
                    yield* mutable();
                    if (dependents(id).length > 0) return yield* error(id, 'dependency-active');
                    if (operation === 'deactivate' && !live(entry)) return yield* error(id, 'invalid-state');
                    if (operation === 'unregister' && (live(entry) || entry.state === 'retired'))
                        return yield* error(id, 'invalid-state');
                    if (operation === 'retire' && !['installed', 'inactive', 'failed'].includes(entry.state))
                        return yield* error(id, 'invalid-state');
                    yield* close(entry);
                    if (operation === 'unregister') entries.delete(id);
                    if (operation === 'retire') entry.state = 'retired';
                    changed();
                }).pipe((effect) => kernelSpan(effect, `kernel.${operation}`));
            const update = (id: string, definition: ModuleDefinition): Operation<UpdateResult> =>
                Effect.gen(function* () {
                    const entry = yield* lookup(id);
                    yield* authorize(entry, 'update');
                    yield* mutable();
                    if (!['installed', 'inactive', 'active', 'ready'].includes(entry.state))
                        return yield* error(id, 'invalid-state');
                    const manifest = yield* decode(KernelManifest, definition.manifest);
                    if (manifest.id !== id) return yield* error(id, 'invalid-contract');
                    const candidate: Entry = {
                        manifest,
                        definition,
                        state: 'registered',
                        running: undefined,
                        installed: false,
                    };
                    yield* authorize(candidate, 'update');
                    yield* admitted(manifest);
                    if (manifest.version === entry.manifest.version) return yield* error(id, 'duplicate');
                    if (manifest.restartRequired)
                        return { status: 'restart-required', reason: 'declared' } satisfies UpdateResult;
                    if (manifest.migrations.some(({ kind, online }) => kind === 'staged' || !online))
                        return { status: 'restart-required', reason: 'migration' } satisfies UpdateResult;
                    // Exact dependencies stay pinned. No inferred range, downgrade or major compatibility.
                    const retained = <A>(before: ReadonlyArray<A>, after: ReadonlyArray<A>) =>
                        before.every((item) => after.some((other) => JSON.stringify(item) === JSON.stringify(other)));
                    if (
                        definition.compatibleWith !== entry.manifest.version ||
                        manifest.trust !== entry.manifest.trust ||
                        manifest.isolation !== entry.manifest.isolation ||
                        !retained(entry.manifest.dependencies, manifest.dependencies) ||
                        !retained(entry.manifest.requires, manifest.requires) ||
                        !retained(entry.manifest.provides, manifest.provides) ||
                        entry.manifest.version.split('.')[0] !== manifest.version.split('.')[0] ||
                        Order.array(Order.bigint)(
                            manifest.version.split('.').map(BigInt),
                            entry.manifest.version.split('.').map(BigInt)
                        ) <= 0
                    )
                        return { status: 'restart-required', reason: 'incompatible' } satisfies UpdateResult;
                    const compatible = yield* Effect.either(plan(candidate));
                    if (compatible._tag === 'Left')
                        return { status: 'restart-required', reason: 'incompatible' } satisfies UpdateResult;
                    const checked = yield* Effect.either(preflight(candidate));
                    if (checked._tag === 'Left') {
                        if (checked.left.reason === 'migration-required')
                            return { status: 'restart-required', reason: 'migration' } satisfies UpdateResult;
                        return yield* checked.left;
                    }
                    const running = yield* build(candidate);
                    candidate.running = running;
                    yield* guardFailure(
                        id,
                        Effect.gen(function* () {
                            yield* running.service.install;
                            if (live(entry)) {
                                yield* running.service.activate;
                                yield* running.service.ready;
                            }
                        })
                    ).pipe(Effect.onError(() => cleanup(id, running)));
                    const previous = entry.running;
                    const nextState = live(entry) ? 'active' : entry.state;
                    if (nextState === 'inactive') {
                        yield* release(id, candidate.running);
                        candidate.running = undefined;
                    }
                    // Keep the registration identity so its scope finalizer owns the replacement too.
                    entry.manifest = manifest;
                    entry.definition = definition;
                    entry.running = candidate.running;
                    entry.installed = true;
                    entry.state = nextState;
                    changed();
                    if (previous !== undefined) {
                        // Release old code only after the candidate is ready. Cleanup failure is visible.
                        yield* release(id, previous);
                    }
                    return { status: 'updated', version: manifest.version } satisfies UpdateResult;
                }).pipe((effect) => kernelSpan(effect, 'kernel.update', (result) => result.status));
            const recover = (id: string) =>
                Effect.gen(function* () {
                    const entry = yield* lookup(id);
                    yield* authorize(entry, 'recover');
                    yield* mutable();
                    if (entry.state !== 'failed') return yield* error(id, 'invalid-state');
                    entry.state = 'registered';
                    yield* Effect.gen(function* () {
                        yield* validate(id);
                        if (entry.installed) {
                            entry.running = yield* build(entry);
                            entry.state = 'installed';
                        } else {
                            yield* install(id);
                        }
                        yield* activate(id);
                    }).pipe(
                        Effect.onError(() =>
                            Effect.sync(() => {
                                entry.state = 'failed';
                            })
                        )
                    );
                }).pipe((effect) => kernelSpan(effect, 'kernel.recover'));
            const compose = (input: PlatformComposition, definitions: ReadonlyArray<ModuleDefinition>) =>
                Effect.gen(function* () {
                    yield* mutable();
                    if (entries.size !== 0) return yield* error('<platform>', 'invalid-state');
                    const composition = yield* decode(PlatformComposition, input);
                    if (!unique(composition.modules.map(({ id }) => id)))
                        return yield* error('<platform>', 'duplicate');
                    if (!unique(composition.bindings.map(({ consumer, requirement }) => `${consumer}/${requirement}`)))
                        return yield* error('<platform>', 'provider-ambiguous');
                    const decoded = yield* Effect.forEach(definitions, (definition) =>
                        decode(KernelManifest, definition.manifest).pipe(
                            Effect.map((manifest) => ({ manifest, definition }))
                        )
                    );
                    if (
                        !unique(decoded.map(({ manifest }) => manifest.id)) ||
                        decoded.length !== composition.modules.length
                    )
                        return yield* error('<platform>', 'invalid-contract');
                    // Plan and preflight private candidates; no registration or layer is published yet.
                    const candidates = new Map<string, Entry>();
                    for (const pin of composition.modules) {
                        const selected = decoded.find(
                            ({ manifest }) => manifest.id === pin.id && manifest.version === pin.version
                        );
                        if (selected === undefined) return yield* error(pin.id, 'incompatible');
                        candidates.set(pin.id, {
                            ...selected,
                            state: 'registered',
                            running: undefined,
                            installed: false,
                        });
                    }
                    for (const entry of candidates.values()) {
                        yield* authorize(entry, 'register');
                        yield* admitted(entry.manifest);
                        yield* authorize(entry, 'validate');
                        yield* authorize(entry, 'install');
                        yield* authorize(entry, 'activate');
                        yield* authorize(entry, 'ready');
                    }
                    const order = yield* plan(undefined, candidates, composition.bindings);
                    for (const id of order) {
                        const entry = yield* lookup(id, candidates);
                        yield* preflight(entry);
                        if (entry.manifest.migrations.some(({ kind, online }) => kind === 'staged' || !online))
                            return yield* error(id, 'migration-required');
                    }
                    const scope = yield* Scope.fork(yield* Effect.scope, ExecutionStrategy.sequential);
                    const previous = bindings;
                    const start = Effect.gen(function* () {
                        bindings = composition.bindings;
                        for (const entry of candidates.values()) {
                            entry.state = 'validated';
                            yield* publish(entry);
                        }
                        for (const id of order) {
                            yield* install(id);
                            yield* activate(id);
                        }
                        return yield* ready;
                    }).pipe(Effect.provideService(Scope.Scope, scope));
                    // Rollback finalizers cannot acquire the mutex already held by compose.
                    return yield* start.pipe(
                        Effect.onError(() =>
                            Effect.gen(function* () {
                                for (const [id, entry] of [...entries].reverse()) yield* removeScoped(id, entry);
                                bindings = previous;
                                yield* Scope.close(scope, Exit.void);
                            })
                        )
                    );
                }).pipe((effect) =>
                    kernelSpan(effect, 'kernel.compose', (receipt) => (receipt.emitted ? 'emitted' : 'unchanged'))
                );
            yield* Effect.addFinalizer(() =>
                Effect.forEach([...entries].reverse(), ([id, entry]) => dispose(id, entry), { discard: true })
            );
            return Kernel.of({
                register: (definition) => mutex.withPermits(1)(register(definition)),
                validate: (id) => mutex.withPermits(1)(validate(id)),
                install: (id) => mutex.withPermits(1)(install(id)),
                activate: (id) => mutex.withPermits(1)(activate(id)),
                ready: mutex.withPermits(1)(ready),
                deactivate: (id) => mutex.withPermits(1)(stop(id, 'deactivate')),
                unregister: (id) => mutex.withPermits(1)(stop(id, 'unregister')),
                retire: (id) => mutex.withPermits(1)(stop(id, 'retire')),
                update: (id, definition) => mutex.withPermits(1)(update(id, definition)),
                recover: (id) => mutex.withPermits(1)(recover(id)),
                compose: (composition, definitions) => mutex.withPermits(1)(compose(composition, definitions)),
                resolve: (consumer, requirement) =>
                    mutex.withPermits(1)(
                        Effect.gen(function* () {
                            const entry = yield* lookup(consumer);
                            yield* authorize(entry, 'validate');
                            return (yield* selected(consumer, requirement)).binding;
                        })
                    ),
                workflow: (id) =>
                    mutex.withPermits(1)(
                        Effect.gen(function* () {
                            const entry = yield* lookup(id);
                            yield* authorize(entry, 'activate');
                            if (closing || readyGeneration !== generation || entry.state !== 'ready')
                                return yield* error(id, 'invalid-state');
                            if (leases === 0) drained = yield* Deferred.make<void>();
                            return yield* Effect.acquireRelease(
                                Effect.sync(() => {
                                    leases += 1;
                                    return { module: id, version: entry.manifest.version, generation };
                                }),
                                () =>
                                    Effect.suspend(() => {
                                        leases -= 1;
                                        return leases === 0
                                            ? Deferred.succeed(drained, undefined).pipe(Effect.asVoid)
                                            : Effect.void;
                                    }).pipe((effect) => kernelSpan(effect, 'kernel.workflow.release'))
                            );
                        }).pipe((effect) => kernelSpan(effect, 'kernel.workflow.acquire'))
                    ),
                snapshot: Effect.suspend(() =>
                    // Empty preflight state is observable without waiting for its lifecycle lock.
                    entries.size === 0
                        ? Effect.succeed([])
                        : mutex.withPermits(1)(
                              Effect.sync(() =>
                                  [...entries.values()].map(({ manifest, state }) => ({
                                      module: manifest.id,
                                      version: manifest.version,
                                      state,
                                  }))
                              )
                          )
                ),
            });
        })
    );
