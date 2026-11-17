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
    HookDenied,
    HookProducer,
    HookProducerPolicy,
    type HookOutboxFailure,
    type HookProducerBinding,
    type HookProducerTarget,
} from '@eventiva/contracts/hook';
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
    /** Validate the retained service against the consumer's exact schema before exposing it. */
    readonly resolve: <A, I>(schema: Schema.Schema<A, I>) => Effect.Effect<A, KernelError>;
}

/** Validate the producer contract before publication; retain its decoded service, not its wire encoding. */
export const kernelProvider = <A, I>(
    schema: Schema.Schema<A, I>,
    value: NoInfer<A>
): Effect.Effect<KernelProvider, KernelError> =>
    Schema.validate(schema, { onExcessProperty: 'error' })(value).pipe(
        Effect.mapError(
            /** Hide schema details behind a stable provider contract error. */ () =>
                error('<provider>', 'invalid-contract')
        ),
        Effect.map(
            /** Retain the validated service for subsequent consumer-specific checks. */ (service): KernelProvider => ({
                /** Resolve only if the retained service also satisfies the requesting consumer. */
                resolve: (consumer) =>
                    Schema.validate(consumer, { onExcessProperty: 'error' })(service).pipe(
                        Effect.mapError(
                            /** Do not expose consumer schema diagnostics through the kernel. */ () =>
                                error('<provider>', 'invalid-contract')
                        )
                    ),
            })
        )
    );

/** Per-module access is restricted to explicitly bound, version-checked requirements. */
export class KernelEnvironment extends Context.Tag('@eventiva/runtime/KernelEnvironment')<
    KernelEnvironment,
    {
        /** Resolve a declared binding to a live provider and validate its value for this consumer. */
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

/** Trusted executable definition paired with a validated manifest and mutation-free preflight. */
export interface ModuleDefinition {
    /** Exact wire contract; register/update still validate all runtime constraints before use. */
    readonly manifest: KernelManifest;
    readonly layer: Layer.Layer<KernelModule, KernelError, KernelEnvironment>;
    /** Preflight only: Config, secret-safe admission and resource compatibility; no mutation. */
    readonly validate: Effect.Effect<void, KernelError>;
    /** Explicit hot-compatibility declaration naming exactly the previous version. */
    readonly compatibleWith?: string;
}

/** Public registry observation; deliberately excludes generation and resource ownership. */
export interface KernelSnapshot {
    readonly module: string;
    readonly version: string;
    readonly state: ModuleState;
}

/** Scoped process-local generation pin that prevents lifecycle mutation until released. */
export interface WorkflowLease {
    readonly module: string;
    readonly version: string;
    readonly generation: number;
}

/** Trusted, explicitly composed journal; keep its policy, tenant-captured producer and UUID source out of plugin context. */
export class KernelProducer extends Context.Tag('@eventiva/runtime/KernelProducer')<
    KernelProducer,
    {
        readonly producer: typeof HookProducer.Service;
        readonly policy: typeof HookProducerPolicy.Service;
        readonly requestId: Effect.Effect<string, HookOutboxFailure>;
    }
>() {}

/** Mutation-owner context for policy binding and callback idempotency/status, never a caller-supplied projection.
 * A null request denotes local-only operation or mandatory cleanup without durable admission, not replay permission.
 * Callback implementations namespace the request by callback slot; status reconciliation never invokes them again.
 */
export class KernelMutation extends Context.Tag('@eventiva/runtime/KernelMutation')<
    KernelMutation,
    { readonly request: string | null; readonly projection: HookProducerBinding['projection'] }
>() {}

type Operation<A = void> = Effect.Effect<A, KernelError, Caller>;

/** Administrative lifecycle only. Business execution still goes through ActionHost. */
export class Kernel extends Context.Tag('@eventiva/runtime/Kernel')<
    Kernel,
    {
        /** Admit and register a definition whose removal belongs to the caller's scope. */
        readonly register: (
            definition: ModuleDefinition
        ) => Effect.Effect<KernelManifest, KernelError, Caller | Scope.Scope>;
        /** Check dependency planning and mutation-free preflight before installation. */
        readonly validate: (id: string) => Operation;
        /** Build scoped services and run only supported online installation hooks. */
        readonly install: (id: string) => Operation;
        /** Activate installed services only while their dependencies are live. */
        readonly activate: (id: string) => Operation;
        readonly ready: Operation<ReadyReceipt>;
        /** Stop live services when no live dependent or workflow lease blocks disposal. */
        readonly deactivate: (id: string) => Operation;
        /** Remove a nonlive, nonretired registration after authorization. */
        readonly unregister: (id: string) => Operation;
        /** Retire an installed, inactive or failed module without deleting its data. */
        readonly retire: (id: string) => Operation;
        /** Stage a compatible replacement or return an explicit restart requirement. */
        readonly update: (id: string, definition: ModuleDefinition) => Operation<UpdateResult>;
        /** Restart a failed module locally; this does not reconcile journal ambiguity. */
        readonly recover: (id: string) => Operation;
        /** Exact wire contract, validated before registry mutation. */
        readonly compose: (
            composition: PlatformComposition,
            definitions: ReadonlyArray<ModuleDefinition>
        ) => Effect.Effect<ReadyReceipt, KernelError, Caller | Scope.Scope>;
        /** Authorize the consumer and return its exact version-checked provider binding. */
        readonly resolve: (consumer: string, requirement: string) => Operation<ProviderBinding>;
        /** Pin a ready generation for the caller's scope; reject degraded or closing kernels. */
        readonly workflow: (id: string) => Effect.Effect<WorkflowLease, KernelError, Caller | Scope.Scope>;
        readonly snapshot: Effect.Effect<ReadonlyArray<KernelSnapshot>>;
        /** Sticky recovery status survives module removal; only a rebuilt incarnation can resume ordinary mutation. */
        readonly durability: Effect.Effect<{
            readonly state: 'local' | 'healthy' | 'recovery-required';
            readonly unconfirmed: ReadonlyArray<string>;
        }>;
    }
>() {}

/** Private resource ownership for one built module service and its finalizers. */
interface Running {
    readonly scope: Scope.CloseableScope;
    readonly service: Context.Tag.Service<KernelModule>;
}
/** Mutable registration identity retained across hot replacement and scope cleanup. */
interface Entry {
    manifest: KernelManifest;
    definition: ModuleDefinition;
    state: ModuleState;
    running: Running | undefined;
    installed: boolean;
}

/** Construct a stable module-scoped failure without retaining underlying diagnostic payloads. */
const error = (module: string, reason: KernelError['reason']) => new KernelError({ module, reason });
const strict = { onExcessProperty: 'error' } as const;
/** Decode a strict wire contract and expose only the kernel's public contract failure. */
const decode = <A, I>(schema: Schema.Schema<A, I>, value: NoInfer<I>) =>
    Schema.decode(
        schema,
        strict
    )(value).pipe(
        Effect.mapError(
            /** Replace decoder diagnostics with a stable public reason. */ () =>
                error('<contract>', 'invalid-contract')
        )
    );
/** Check exact identifier uniqueness without normalizing or mutating caller input. */
const unique = (names: ReadonlyArray<string>) => new Set(names).size === names.length;
/** Identify states whose running services may satisfy consumers. */
const live = (entry: Entry) => entry.state === 'active' || entry.state === 'ready';
/** Combine declared dependency pins with explicit provider edges for graph traversal. */
const dependencies = (manifest: KernelManifest, bindings: ReadonlyArray<ProviderBinding>) => [
    ...manifest.dependencies.map(/** Preserve each exact declared dependency identifier. */ ({ id }) => id),
    ...bindings
        .filter(/** Include only bindings owned by this consumer. */ ({ consumer }) => consumer === manifest.id)
        .map(/** Add the provider as a dependency edge. */ ({ provider }) => provider),
];

type KernelOutcome = 'succeeded' | 'failed' | 'interrupted' | 'emitted' | 'unchanged' | 'updated' | 'restart-required';

// Operation observations only; central telemetry sanitizes Exit causes before export.
/** Annotate lifecycle outcomes without changing results or exporting raw failure causes. */
const kernelSpan = <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    name: `kernel.${LifecycleOperation | 'compose' | 'preflight' | 'release' | 'provider.select' | 'workflow.acquire' | 'workflow.release'}`,
    /** Classify a successful result without inspecting failures. */
    outcome: (value: A) => KernelOutcome = /** Default successful operations to the common outcome. */ () => 'succeeded'
) =>
    effect.pipe(
        Effect.onExit(
            /** Distinguish interruption from failure while leaving the original exit untouched. */ (exit) =>
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
 * The optional trusted producer is host opt-in, not production activation or journal recovery.
 */
export const KernelLive = (runtimeId: string): Layer.Layer<Kernel, KernelError, KernelAuthority> =>
    Layer.scoped(
        Kernel,
        Effect.gen(
            /** Capture trusted services once; a later caller cannot substitute producer provenance. */ function* () {
                // Producer capability is captured from layer construction, never from a lifecycle caller.
                yield* decode(ModuleId, runtimeId);
                const authority = yield* KernelAuthority;
                const journal = yield* Effect.serviceOption(KernelProducer);
                if (Option.isSome(journal) && journal.value.producer.runtime.logical !== runtimeId)
                    return yield* error('<platform>', 'invalid-contract');
                const mutex = yield* Effect.makeSemaphore(1);
                const entries = new Map<string, Entry>();
                let bindings: ReadonlyArray<ProviderBinding> = [];
                let generation = 0;
                let readyGeneration = -1;
                let leases = 0;
                let closing = 0;
                let drained = yield* Deferred.make<void>();
                let degraded = false;
                const unconfirmed = new Set<string>();

                /** Derive lifecycle provenance while holding the mutation lock, including removal and candidate version. */
                const projection = (
                    entry: Entry,
                    operation: LifecycleOperation,
                    to: ModuleState | null,
                    advance = false,
                    from: ModuleState | null = entry.state,
                    manifest = entry.manifest
                ): HookProducerBinding['projection'] => ({
                    kind: 'module.lifecycle',
                    operation,
                    identity: {
                        module: manifest.id,
                        version: manifest.version,
                        generation: generation + Number(advance),
                    },
                    from,
                    to,
                });
                /** Reject a host binding that contradicts the exact transition owned by this kernel. */
                const sameProjection = (
                    left: HookProducerBinding['projection'],
                    right: HookProducerBinding['projection']
                ) =>
                    left.kind === 'platform.ready' && right.kind === 'platform.ready'
                        ? left.runtimeId === right.runtimeId && left.generation === right.generation
                        : left.kind === 'module.lifecycle' &&
                          right.kind === 'module.lifecycle' &&
                          left.operation === right.operation &&
                          left.from === right.from &&
                          left.to === right.to &&
                          left.identity.module === right.identity.module &&
                          left.identity.version === right.identity.version &&
                          left.identity.generation === right.identity.generation;
                /** Mandatory cleanup cannot fail admission; missing evidence yields an explicitly unadmitted context. */
                function begin(
                    fact: HookProducerBinding['projection'],
                    mandatory: true
                ): Effect.Effect<typeof KernelMutation.Service>;
                /** Ordinary mutation requires fresh durable intent before any callback can execute. */
                function begin(
                    fact: HookProducerBinding['projection'],
                    mandatory?: boolean
                ): Effect.Effect<typeof KernelMutation.Service, KernelError>;
                /** Persist intent before callbacks; mandatory teardown alone may proceed visibly without admission. */
                function begin(fact: HookProducerBinding['projection'], mandatory = false) {
                    return Effect.gen(
                        /** Bind policy to core state, then require fresh admission rather than replaying any duplicate. */ function* () {
                            // Journal opt-out is distinct from failed admission; only the former may omit intent during ordinary work.
                            let mutation: typeof KernelMutation.Service = { request: null, projection: fact };
                            if (Option.isNone(journal)) return mutation;
                            const configured = journal.value;
                            const admitted = Effect.gen(
                                /** Validate retained projection before granting first callback execution. */ function* () {
                                    // Once outcome is ambiguous, ordinary callbacks stay fenced until reconciliation instead of retrying admission.
                                    if (degraded && !mandatory) return yield* error('<platform>', 'recovery-required');
                                    const request = yield* configured.requestId;
                                    mutation = { request, projection: fact };
                                    const target: HookProducerTarget =
                                        fact.kind === 'platform.ready'
                                            ? { kind: fact.kind, generation: fact.generation }
                                            : {
                                                  kind: fact.kind,
                                                  module: fact.identity.module,
                                                  operation: fact.operation,
                                              };
                                    const policy = HookProducerPolicy.of({
                                        ...configured.policy,
                                        /** Tenant/purpose/profile remain host-owned; the kernel alone fixes the transition identity. */
                                        bind: (tenant, runtime, incarnation, target) =>
                                            configured.policy.bind(tenant, runtime, incarnation, target).pipe(
                                                Effect.filterOrFail(
                                                    /** Field order is irrelevant; every actual provenance field must agree. */ (
                                                        binding
                                                    ) => sameProjection(binding.projection, fact),
                                                    /** Conflicting provenance never authorizes callbacks. */ () =>
                                                        new HookDenied({ reason: 'policy-denied' })
                                                )
                                            ),
                                    });
                                    const result = yield* configured.producer
                                        .begin(request, target)
                                        .pipe(
                                            Effect.provideService(HookProducerPolicy, policy),
                                            Effect.provideService(KernelMutation, mutation)
                                        );
                                    unconfirmed.add(request);
                                    if (!result.fresh || !sameProjection(result.attempt.binding.projection, fact))
                                        return yield* error('<platform>', 'recovery-required');
                                    return mutation;
                                }
                            );
                            return yield* admitted.pipe(
                                Effect.catchAllCause(
                                    /** A failed admission can have lost its acknowledgement; never infer absence or replay. */ () => {
                                        // Mandatory cleanup still runs, but its null request prevents later confirmation from fabricating evidence.
                                        degraded = true;
                                        if (mutation.request !== null) unconfirmed.add(mutation.request);
                                        return mandatory
                                            ? Effect.succeed({ ...mutation, request: null })
                                            : Effect.fail(error('<platform>', 'recovery-required'));
                                    }
                                )
                            );
                        }
                    );
                }
                /** Supply a stable key; release wrappers retain masked entry while ordinary module callbacks restore cancellation. */
                const callback = <A, E, R>(
                    effect: Effect.Effect<A, E, R>,
                    mutation: typeof KernelMutation.Service,
                    interruptible = true
                ) =>
                    (interruptible ? Effect.interruptible(effect) : effect).pipe(
                        Effect.provideService(KernelMutation, mutation),
                        Effect.onError(
                            /** Callback failure does not prove absence of external side effects. */ () =>
                                Effect.sync(
                                    /** Make callback ambiguity sticky for the lifetime of this kernel incarnation. */ () => {
                                        // A callback failure cannot establish that its external side effects were rolled back.
                                        if (mutation.request !== null) degraded = true;
                                    }
                                )
                        )
                    );
                /** Confirm exactly where state commits, independently of later cleanup or public return values. */
                const confirm = (mutation: typeof KernelMutation.Service): Effect.Effect<void, KernelError> =>
                    Effect.gen(
                        /** Never fabricate a fact for mandatory teardown that lacked durable admission. */ function* () {
                            // Neither journal opt-out nor the mandatory-cleanup fallback grants durable intent that may be confirmed.
                            if (mutation.request === null || Option.isNone(journal)) return;
                            const status = yield* journal.value.producer.confirm(mutation.request).pipe(
                                Effect.provideService(HookProducerPolicy, journal.value.policy),
                                Effect.provideService(KernelMutation, mutation),
                                Effect.catchAllCause(
                                    /** Commit acknowledgement loss requires reconciliation, not callback replay. */ () => {
                                        // Preserve the recovery fence even when the caller handles this typed failure.
                                        degraded = true;
                                        return Effect.fail(error('<platform>', 'recovery-required'));
                                    }
                                )
                            );
                            if (status !== 'committed') {
                                degraded = true;
                                return yield* error('<platform>', 'recovery-required');
                            }
                            unconfirmed.delete(mutation.request);
                        }
                    );
                /** Invalidate ready generations even after journal failure; readiness never survives a committed mutation. */
                const changed = (): Effect.Effect<void> =>
                    Effect.gen(
                        /** Internal invalidation cannot undo the mutation that made readiness stale. */ function* () {
                            // Readiness describes the whole composition; one committed mutation invalidates every ready entry.
                            generation += 1;
                            readyGeneration = -1;
                            for (const entry of entries.values()) {
                                if (entry.state !== 'ready') continue;
                                const mutation = yield* begin(projection(entry, 'ready', 'active'), true);
                                entry.state = 'active';
                                yield* confirm(mutation).pipe(
                                    Effect.catchAll(
                                        /** Preserve physical invalidation while exposing sticky recovery status. */ () =>
                                            Effect.void
                                    )
                                );
                            }
                        }
                    );
                /** Advance the process-local generation with its primary fact ordered before derived invalidations. */
                const committed = (
                    mutation: typeof KernelMutation.Service,
                    advance = false
                ): Effect.Effect<void, KernelError> =>
                    Effect.gen(
                        /** Always invalidate readiness, including when confirmation fails after the state write. */ function* () {
                            // Capture failure as data so invalidation runs before the confirmation failure is propagated.
                            const result = yield* Effect.exit(confirm(mutation));
                            if (advance) yield* changed();
                            if (Exit.isFailure(result)) return yield* result;
                        }
                    );
                /** Keep admission and state/confirmation boundaries atomic to interruption, but restore module callbacks. */
                const serialized = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
                    mutex.withPermits(1)(
                        effect.pipe(
                            Effect.uninterruptible,
                            Effect.onError(
                                /** Unsettled intent is never permission to repeat an interrupted public operation. */ () =>
                                    Effect.sync(
                                        /** Preserve ambiguity even for a later phase that failed before its own callback. */ () => {
                                            // The public operation can fail after another phase created intent; fence on outstanding work, not only this error.
                                            if (unconfirmed.size > 0) degraded = true;
                                        }
                                    )
                            )
                        )
                    );
                /** Read the selected registry at execution time, failing for absent identifiers. */
                const lookup = (id: string, registry: ReadonlyMap<string, Entry> = entries) =>
                    Effect.suspend(
                        /** Avoid capturing an entry before its serialized operation executes. */ () => {
                            // Registry replacement may happen before this suspended lookup runs; resolve from the execution-time view.
                            const entry = registry.get(id);
                            return entry === undefined ? Effect.fail(error(id, 'missing')) : Effect.succeed(entry);
                        }
                    );
                /** Check the current caller against the captured host authority and exact manifest. */
                const authorize = (entry: Entry, operation: LifecycleOperation) =>
                    Effect.gen(
                        /** Caller identity remains operation-scoped rather than construction-scoped. */ function* () {
                            const caller = yield* Caller;
                            yield* authority.authorize(caller, operation, entry.manifest);
                        }
                    );
                /** Reject ordinary mutations during ambiguity, disposal or active workflow leases. */
                const mutable = () =>
                    degraded
                        ? Effect.fail(error('<platform>', 'recovery-required'))
                        : closing
                          ? Effect.fail(error('<platform>', 'invalid-state'))
                          : leases > 0
                            ? Effect.fail(error('<platform>', 'workflow-active'))
                            : Effect.void;
                /** Reject unsupported execution isolation and duplicate declarations before publication. */
                const admitted = (manifest: KernelManifest) =>
                    Effect.gen(
                        /** Require host admission in addition to trusted manifest declarations. */ function* () {
                            if (manifest.trust === 'untrusted') return yield* error(manifest.id, 'untrusted');
                            // A self-declared isolation mode is not an actual sandbox. No executable fallback.
                            if (manifest.isolation !== 'in-process')
                                return yield* error(manifest.id, 'isolation-unavailable');
                            yield* authority.admit(manifest);
                            if (
                                !unique(
                                    manifest.dependencies.map(
                                        /** Use dependency identifiers as uniqueness keys. */ ({ id }) => id
                                    )
                                ) ||
                                !unique(
                                    manifest.provides.map(
                                        /** Provider instance names are unique within the module. */ ({ name }) => name
                                    )
                                ) ||
                                !unique(
                                    manifest.requires.map(
                                        /** Requirement names distinguish consumer binding slots. */ ({ name }) => name
                                    )
                                ) ||
                                !unique(
                                    manifest.migrations.map(
                                        /** Migration identifiers cannot repeat within a manifest. */ ({ id }) => id
                                    )
                                )
                            )
                                return yield* error(manifest.id, 'duplicate');
                        }
                    );
                /** Resolve exactly one declared requirement binding and verify its capability/version pin. */
                const selected = (
                    consumer: string,
                    requirement: string,
                    candidate?: Entry,
                    registry: ReadonlyMap<string, Entry> = entries,
                    selectionBindings: ReadonlyArray<ProviderBinding> = bindings
                ) =>
                    Effect.gen(
                        /** Selection checks contracts only; service liveness is checked by resolution. */ function* () {
                            // Explicit binding and exact capability versions prevent inferred provider authority.
                            const entry = candidate ?? (yield* lookup(consumer));
                            const required = entry.manifest.requires.find(
                                /** Match the consumer's declared requirement slot. */ ({ name }) =>
                                    name === requirement
                            );
                            const matches = selectionBindings.filter(
                                /** Restrict binding lookup to this consumer and requirement pair. */
                                (binding) => binding.consumer === consumer && binding.requirement === requirement
                            );
                            if (required === undefined) return yield* error(consumer, 'undeclared-dependency');
                            const [binding] = matches;
                            if (binding === undefined) return yield* error(consumer, 'provider-unavailable');
                            if (matches.length > 1) return yield* error(consumer, 'provider-ambiguous');
                            const provider = registry.get(binding.provider);
                            if (provider === undefined) return yield* error(consumer, 'provider-unavailable');
                            const declaration = provider.manifest.provides.find(
                                /** Locate the explicitly selected provider instance. */ ({ name }) =>
                                    name === binding.instance
                            );
                            if (declaration === undefined) return yield* error(consumer, 'provider-unavailable');
                            if (
                                declaration.capability !== required.capability ||
                                declaration.version !== required.version
                            )
                                return yield* error(consumer, 'capability-version');
                            return { binding, provider };
                        }
                    ).pipe(
                        /** Observe selection without altering its contract failures. */ (effect) =>
                            kernelSpan(effect, 'kernel.provider.select')
                    );
                /** Validate all graph edges and return dependency-first order without publishing candidates. */
                const plan = (
                    candidate?: Entry,
                    registry: ReadonlyMap<string, Entry> = entries,
                    plannedBindings: ReadonlyArray<ProviderBinding> = bindings
                ) =>
                    Effect.gen(
                        /** Overlay a replacement privately so incompatibility cannot mutate the registry. */ function* () {
                            // A private overlay lets hot-update planning include every existing consumer.
                            const all = new Map(registry);
                            if (candidate !== undefined) all.set(candidate.manifest.id, candidate);
                            for (const binding of plannedBindings) {
                                const consumer = all.get(binding.consumer);
                                if (
                                    consumer === undefined ||
                                    !consumer.manifest.requires.some(
                                        /** Reject bindings to undeclared consumer slots. */ ({ name }) =>
                                            name === binding.requirement
                                    )
                                )
                                    return yield* error(binding.consumer, 'invalid-contract');
                            }
                            const ordered: Array<string> = [];
                            const visiting = new Set<string>();
                            const visited = new Set<string>();
                            const path: Array<string> = [];
                            /** Traverse exact dependency edges once and retain the active path for cycle diagnostics. */
                            const visit = (id: string): Effect.Effect<void, KernelError> =>
                                Effect.gen(
                                    /** Validate each node before adding it to dependency-first output. */ function* () {
                                        // The active path distinguishes a real cycle from an already completed shared dependency.
                                        if (visiting.has(id))
                                            return yield* new KernelError({
                                                module: id,
                                                reason: 'cycle',
                                                cycle: [...path.slice(path.indexOf(id)), id],
                                            });
                                        if (visited.has(id)) return;
                                        const entry = all.get(id);
                                        if (entry === undefined || entry.state === 'retired')
                                            return yield* error(id, 'missing');
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
                                    }
                                );
                            for (const [id, entry] of all) if (entry.state !== 'retired') yield* visit(id);
                            return ordered;
                        }
                    );
                /** Preserve interruption while redacting module callback failures and defects. */
                const guardFailure = <A, E, R>(id: string, effect: Effect.Effect<A, E, R>) =>
                    effect.pipe(
                        Effect.catchAllCause(
                            /** Do not turn cancellation into an ordinary module failure. */ (cause) =>
                                Cause.isInterruptedOnly(cause)
                                    ? Effect.interrupt
                                    : Effect.fail(error(id, 'module-failed'))
                        )
                    );
                /** Run interruptible validation without allocating module services or mutating lifecycle state. */
                const preflight = (entry: Entry) =>
                    entry.definition.validate.pipe(
                        Effect.interruptible,
                        Effect.catchAllCause(
                            /** Preserve only actionable migration status from private validation diagnostics. */ (
                                cause
                            ) => {
                                // Cancellation is control flow; all other details remain behind public kernel reasons.
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
                            }
                        ),
                        /** Observe validation without exposing its underlying cause. */ (effect) =>
                            kernelSpan(effect, 'kernel.preflight')
                    );
                /** Once entered, close the private scope after deactivation, preferring the hook's failure if both fail. */
                const release = (id: string, running: Running) =>
                    Effect.uninterruptibleMask(
                        /** Permit cancellation only around the module hook, not release entry or resource finalizers. */ () =>
                            Effect.gen(
                                /** Capture both exits so deactivation failure cannot skip owned finalizers. */ function* () {
                                    // Finalizers run even when deactivation fails or is interrupted.
                                    const result = yield* Effect.exit(
                                        Effect.interruptible(guardFailure(id, running.service.deactivate))
                                    );
                                    const closed = yield* Effect.exit(
                                        guardFailure(id, Scope.close(running.scope, Exit.void))
                                    );
                                    if (Exit.isFailure(result)) return yield* result;
                                    if (Exit.isFailure(closed)) return yield* closed;
                                }
                            )
                    ).pipe(
                        /** Observe disposal without replacing the release result. */ (effect) =>
                            kernelSpan(effect, 'kernel.release')
                    );
                /** Best-effort release for an unpublished candidate, logging typed cleanup failure. */
                const cleanup = (id: string, running: Running) =>
                    release(id, running).pipe(
                        Effect.catchAll(
                            /** Keep the original preparation failure while making cleanup failure observable. */ () =>
                                Effect.logError('Kernel scope cleanup failed', { module: id, reason: 'module-failed' })
                        )
                    );
                /** Attempt release and record inactivity; mandatory disposal may proceed without durable intent. */
                const close = (entry: Entry, mandatory = false) =>
                    Effect.gen(
                        /** Clear running ownership after release and confirm the physical inactive transition. */ function* () {
                            const running = entry.running;
                            if (running === undefined) return;
                            const mutation = yield* begin(projection(entry, 'deactivate', 'inactive', true), mandatory);
                            // Never restore interruption before release installs its finalization mask.
                            const result = yield* Effect.exit(
                                callback(release(entry.manifest.id, running), mutation, false)
                            );
                            entry.running = undefined;
                            entry.state = 'inactive';
                            const confirmed = yield* Effect.exit(committed(mutation, true));
                            if (Exit.isFailure(result)) return yield* result;
                            if (Exit.isFailure(confirmed)) return yield* confirmed;
                        }
                    );
                /** Find only live consumers whose declared or bound provider edges require this module. */
                const dependents = (id: string) =>
                    [...entries.values()].filter(
                        /** Inactive registrations do not prevent stopping a dependency. */ (entry) =>
                            live(entry) && dependencies(entry.manifest, bindings).includes(id)
                    );
                /** Fail live dependents first and dispose resources even if durable admission is unavailable. */
                const markFailed = (entry: Entry, operation: LifecycleOperation = 'activate'): Effect.Effect<void> =>
                    Effect.gen(
                        /** Preserve physical failure state. */ function* () {
                            // Consumers lose their providers, so teardown propagates before the provider is marked failed.
                            for (const dependent of dependents(entry.manifest.id))
                                yield* markFailed(dependent, operation);
                            yield* close(entry, true).pipe(
                                Effect.catchAllCause(
                                    /** Hook interruption cannot abort mandatory dependent cleanup or erase sticky recovery. */ () =>
                                        Effect.logError('Kernel failed-module cleanup failed', {
                                            module: entry.manifest.id,
                                        })
                                )
                            );
                            const mutation = yield* begin(projection(entry, operation, 'failed'), true);
                            entry.state = 'failed';
                            yield* confirm(mutation).pipe(
                                Effect.catchAll(
                                    /** Sticky durability status retains confirmation failure after mandatory teardown. */ () =>
                                        Effect.void
                                )
                            );
                        }
                    );
                /** Remove only the owned registration identity, recursively disposing its live dependents. */
                const removeScoped = (id: string, entry: Entry): Effect.Effect<void> =>
                    Effect.gen(
                        /** Mandatory scope disposal continues without inventing durable admission evidence. */ function* () {
                            // A stale finalizer must not remove a later registration with the same identifier.
                            if (entries.get(id) !== entry) return;
                            for (const dependent of dependents(id))
                                yield* removeScoped(dependent.manifest.id, dependent);
                            yield* close(entry, true).pipe(
                                Effect.catchAllCause(
                                    /** A self-interrupting hook cannot skip scope removal or the remaining owned finalizers. */ () =>
                                        Effect.logError('Kernel scope cleanup failed', { module: id })
                                )
                            );
                            const mutation = yield* begin(projection(entry, 'unregister', null, true), true);
                            entries.delete(id);
                            bindings = bindings.filter(
                                /** Remove both incoming and outgoing bindings for the deleted registration. */ (
                                    binding
                                ) => binding.consumer !== id && binding.provider !== id
                            );
                            yield* committed(mutation, true).pipe(
                                Effect.catchAll(
                                    /** Disposal cannot be rolled back; durability remains visibly degraded on failure. */ () =>
                                        Effect.void
                                )
                            );
                        }
                    );
                /** Block new mutation, drain workflow ownership and remove the scope's registration under lock. */
                const dispose = (id: string, entry: Entry) =>
                    Effect.gen(
                        /** Keep lease draining outside the mutex needed by lease release. */ function* () {
                            if (entries.get(id) !== entry) return;
                            // Do not hold the lifecycle mutex while waiting: workflow releases must progress.
                            const wait = yield* mutex.withPermits(1)(
                                Effect.sync(
                                    /** Establish the closing barrier before observing outstanding leases. */ () => {
                                        closing += 1;
                                        return leases > 0 ? Deferred.await(drained) : Effect.void;
                                    }
                                )
                            );
                            yield* wait;
                            yield* mutex
                                .withPermits(1)(removeScoped(id, entry))
                                .pipe(
                                    Effect.ensuring(
                                        Effect.sync(
                                            /** Release this disposal's barrier even if removal fails. */ () => {
                                                closing -= 1;
                                            }
                                        )
                                    )
                                );
                        }
                    );
                /** Install scope ownership before publication can fail its durable confirmation. */
                const publish = (entry: Entry) =>
                    Effect.gen(
                        /** Admit registration before transferring its removal to the caller's scope. */ function* () {
                            // The finalizer is installed before visibility, including confirmation-loss paths.
                            const mutation = yield* begin(projection(entry, 'register', entry.state, true, null));
                            yield* Effect.addFinalizer(
                                /** Retain entry identity so hot replacement remains owned by this registration. */ () =>
                                    dispose(entry.manifest.id, entry)
                            );
                            entries.set(entry.manifest.id, entry);
                            yield* committed(mutation, true);
                        }
                    );
                /** Decode and authorize a unique registration before publishing scoped ownership. */
                const register = (definition: ModuleDefinition) =>
                    Effect.gen(
                        /** No executable module layer is built during registration. */ function* () {
                            // Validate and admit the manifest before it becomes registry-visible.
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
                        }
                    ).pipe(
                        /** Observe registration without changing its publication result. */ (effect) =>
                            kernelSpan(effect, 'kernel.register')
                    );
                /** Plan dependencies and run preflight before committing the validated lifecycle state. */
                const validate = (id: string) =>
                    Effect.gen(
                        /** Revalidation checks health without recording a duplicate validated transition. */ function* () {
                            // Authorization precedes state inspection; only the first transition needs durable intent.
                            const entry = yield* lookup(id);
                            yield* authorize(entry, 'validate');
                            yield* mutable();
                            if (!['registered', 'validated'].includes(entry.state))
                                return yield* error(id, 'invalid-state');
                            yield* plan();
                            yield* admitted(entry.manifest);
                            if (entry.state === 'validated') return yield* preflight(entry);
                            const mutation = yield* begin(projection(entry, 'validate', 'validated'));
                            yield* callback(preflight(entry), mutation);
                            entry.state = 'validated';
                            yield* committed(mutation);
                        }
                    ).pipe(
                        /** Observe validation without exposing private module diagnostics. */ (effect) =>
                            kernelSpan(effect, 'kernel.validate')
                    );
                /** Build services in a private scope, closing it if layer construction or provider validation fails. */
                const build = (entry: Entry) =>
                    Effect.gen(
                        /** Supply only the module's explicit provider environment to its layer. */ function* () {
                            // Kernel and registration finalizers drain leases before closing these private scopes.
                            const scope = yield* Scope.make();
                            const environment = KernelEnvironment.of({
                                /** Resolve only a declared live provider through its consumer schema boundary. */
                                resolve: (requirement, schema) =>
                                    Effect.gen(
                                        /** Binding validity does not imply service availability; check both. */ function* () {
                                            // Provider values never bypass the schema selected by this consumer.
                                            const { binding, provider } = yield* selected(
                                                entry.manifest.id,
                                                requirement,
                                                entry
                                            );
                                            if (!live(provider) || provider.running === undefined)
                                                return yield* error(entry.manifest.id, 'provider-unavailable');
                                            const service = provider.running.service.providers.get(binding.instance);
                                            if (service === undefined)
                                                return yield* error(entry.manifest.id, 'provider-unavailable');
                                            return yield* service.resolve(schema);
                                        }
                                    ),
                            });
                            const prepared = Effect.gen(
                                /** Require runtime provider keys to match the admitted manifest exactly. */ function* () {
                                    // Layer construction remains private until its declared provider surface is verified.
                                    const context = yield* Layer.buildWithScope(entry.definition.layer, scope).pipe(
                                        Effect.provideService(KernelEnvironment, environment)
                                    );
                                    const service = Context.get(context, KernelModule);
                                    const provided = [...service.providers.keys()];
                                    if (
                                        provided.length !== entry.manifest.provides.length ||
                                        !entry.manifest.provides.every(
                                            /** Every declared provider must have a runtime value. */ ({ name }) =>
                                                service.providers.has(name)
                                        )
                                    )
                                        return yield* error(entry.manifest.id, 'invalid-contract');
                                    return { scope, service };
                                }
                            );
                            return yield* guardFailure(entry.manifest.id, prepared).pipe(
                                Effect.onError(
                                    /** Failed construction never transfers ownership of this private scope. */ () =>
                                        Scope.close(scope, Exit.void)
                                )
                            );
                        }
                    );
                /** Install validated modules only when migration metadata permits online execution. */
                const install = (id: string) =>
                    Effect.gen(
                        /** Admit installation before building services or invoking the module hook. */ function* () {
                            // Unsupported migrations stop before durable intent or resource acquisition.
                            const entry = yield* lookup(id);
                            yield* authorize(entry, 'install');
                            yield* mutable();
                            if (entry.state !== 'validated') return yield* error(id, 'invalid-state');
                            yield* plan();
                            if (
                                entry.manifest.migrations.some(
                                    /** Detect coordinated migrations. */ ({ kind, online }) =>
                                        kind === 'staged' || !online
                                )
                            )
                                return yield* error(id, 'migration-required');
                            const mutation = yield* begin(projection(entry, 'install', 'installed'));
                            const prepared = Effect.gen(
                                /** Release newly built resources if the install hook fails. */ function* () {
                                    // Until installation succeeds, cleanup belongs to this preparation branch.
                                    const running = yield* build(entry);
                                    yield* guardFailure(id, running.service.install).pipe(
                                        Effect.onError(
                                            /** Dispose the unpublished running candidate on hook failure. */ () =>
                                                cleanup(id, running)
                                        )
                                    );
                                    return running;
                                }
                            );
                            entry.running = yield* callback(prepared, mutation).pipe(
                                Effect.onError(
                                    /** Installation failure invalidates this module and its live dependents. */ () =>
                                        markFailed(entry, 'install')
                                )
                            );
                            entry.installed = true;
                            entry.state = 'installed';
                            yield* committed(mutation);
                        }
                    ).pipe(
                        /** Observe installation without changing its commit semantics. */ (effect) =>
                            kernelSpan(effect, 'kernel.install')
                    );
                /** Activate installed or inactive modules after verifying all provider dependencies are live. */
                const activate = (id: string) =>
                    Effect.gen(
                        /** Rebuild disposed services when needed and commit only after readiness succeeds. */ function* () {
                            // Provider liveness is checked before admitting activation or executing module code.
                            const entry = yield* lookup(id);
                            yield* authorize(entry, 'activate');
                            yield* mutable();
                            if (entry.state !== 'installed' && entry.state !== 'inactive')
                                return yield* error(id, 'invalid-state');
                            for (const dependency of dependencies(entry.manifest, bindings)) {
                                if (!live(yield* lookup(dependency))) return yield* error(id, 'provider-unavailable');
                            }
                            const mutation = yield* begin(projection(entry, 'activate', 'active', true));
                            if (entry.running === undefined)
                                entry.running = yield* callback(build(entry), mutation).pipe(
                                    Effect.onError(
                                        /** Failed reconstruction propagates mandatory failure cleanup. */ () =>
                                            markFailed(entry)
                                    )
                                );
                            yield* callback(
                                guardFailure(
                                    id,
                                    Effect.zipRight(entry.running.service.activate, entry.running.service.ready)
                                ),
                                mutation
                            ).pipe(
                                Effect.onError(
                                    /** Failed activation or health checks revoke live dependent services. */ () =>
                                        markFailed(entry)
                                )
                            );
                            entry.state = 'active';
                            yield* committed(mutation, true);
                        }
                    ).pipe(
                        /** Observe activation without masking readiness failure. */ (effect) =>
                            kernelSpan(effect, 'kernel.activate')
                    );
                const ready = Effect.gen(
                    /** Check graph-wide health and emit at most one successful receipt per local generation. */ function* () {
                        if (degraded) return yield* error('<platform>', 'recovery-required');
                        if (closing) return yield* error('<platform>', 'invalid-state');
                        const order = yield* plan();
                        if (order.length === 0) return yield* error('<platform>', 'invalid-state');
                        for (const id of order) yield* authorize(yield* lookup(id), 'ready');
                        if (readyGeneration === generation) return { runtimeId, generation, emitted: false };
                        // Precheck the whole graph before durable intent or callbacks; a missing provider is not a mutation.
                        for (const id of order) {
                            const entry = yield* lookup(id);
                            if (!live(entry) || entry.running === undefined) return yield* error(id, 'not-ready');
                        }
                        const platform = Option.isNone(journal)
                            ? undefined
                            : yield* begin({
                                  kind: 'platform.ready',
                                  runtimeId: journal.value.producer.runtime.incarnation,
                                  generation,
                              });
                        const mutations = new Map<string, typeof KernelMutation.Service>();
                        for (const id of order) {
                            const entry = yield* lookup(id);
                            if (!live(entry) || entry.running === undefined) return yield* error(id, 'not-ready');
                            const mutation = yield* begin(projection(entry, 'ready', 'ready'));
                            mutations.set(id, mutation);
                            yield* callback(guardFailure(id, entry.running.service.ready), mutation).pipe(
                                Effect.onError(
                                    /** Readiness failure removes unhealthy services and their live dependents. */ () =>
                                        markFailed(entry, 'ready')
                                )
                            );
                        }
                        for (const [id, mutation] of mutations) {
                            (yield* lookup(id)).state = 'ready';
                            yield* committed(mutation);
                        }
                        readyGeneration = generation;
                        if (platform !== undefined) yield* committed(platform);
                        return { runtimeId, generation, emitted: true };
                    }
                ).pipe(
                    /** Classify readiness receipts without creating additional delivery events. */ (effect) =>
                        kernelSpan(
                            effect,
                            'kernel.ready',
                            /** Classify receipt emission. */ (receipt) => (receipt.emitted ? 'emitted' : 'unchanged')
                        )
                );
                /** Apply authorized ordinary stop/removal only when dependents and leases permit mutation. */
                const stop = (id: string, operation: 'deactivate' | 'unregister' | 'retire') =>
                    Effect.gen(
                        /** Finish resource shutdown before committing removal or retirement. */ function* () {
                            // Ordinary stop is fail-closed; mandatory scope disposal uses a separate path.
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
                            if (operation === 'deactivate') return;
                            const mutation = yield* begin(
                                projection(entry, operation, operation === 'unregister' ? null : 'retired', true)
                            );
                            if (operation === 'unregister') entries.delete(id);
                            if (operation === 'retire') entry.state = 'retired';
                            yield* committed(mutation, true);
                        }
                    ).pipe(
                        /** Attribute stop outcomes to the requested lifecycle operation. */ (effect) =>
                            kernelSpan(effect, `kernel.${operation}`)
                    );
                /** Stage an explicitly compatible same-major upgrade before replacing the owned registration. */
                const update = (id: string, definition: ModuleDefinition): Operation<UpdateResult> =>
                    Effect.gen(
                        /** Keep the old service installed until the candidate has passed compatibility and hooks. */ function* () {
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
                            if (
                                manifest.migrations.some(
                                    /** Offline or staged work cannot run as a hot replacement. */ ({ kind, online }) =>
                                        kind === 'staged' || !online
                                )
                            )
                                return { status: 'restart-required', reason: 'migration' } satisfies UpdateResult;
                            // Exact dependencies stay pinned. No inferred range, downgrade or major compatibility.
                            /** Require each previous declaration to survive with its exact serialized structure. */
                            const retained = <A>(before: ReadonlyArray<A>, after: ReadonlyArray<A>) =>
                                before.every(
                                    /** Check every old pin rather than inferring semantic compatibility. */ (item) =>
                                        after.some(
                                            /** Compare the existing contract representation without normalization. */ (
                                                other
                                            ) => JSON.stringify(item) === JSON.stringify(other)
                                        )
                                );
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
                            const nextState = live(entry) ? 'active' : entry.state;
                            const mutation = yield* begin(
                                projection(entry, 'update', nextState, true, entry.state, manifest)
                            );
                            const running = yield* callback(build(candidate), mutation);
                            candidate.running = running;
                            yield* callback(
                                guardFailure(
                                    id,
                                    Effect.gen(
                                        /** Install the candidate and verify live replacements before publication. */ function* () {
                                            // Inactive replacements stay inactive; live replacements must pass readiness first.
                                            yield* running.service.install;
                                            if (live(entry)) {
                                                yield* running.service.activate;
                                                yield* running.service.ready;
                                            }
                                        }
                                    )
                                ),
                                mutation
                            ).pipe(
                                Effect.onError(
                                    /** A candidate that fails its hooks retains no published resource ownership. */ () =>
                                        cleanup(id, running)
                                )
                            );
                            const previous = entry.running;
                            if (nextState === 'inactive') {
                                yield* callback(release(id, candidate.running), mutation, false);
                                candidate.running = undefined;
                            }
                            // Keep the registration identity so its scope finalizer owns the replacement too.
                            entry.manifest = manifest;
                            entry.definition = definition;
                            entry.running = candidate.running;
                            entry.installed = true;
                            entry.state = nextState;
                            const confirmation = yield* Effect.exit(committed(mutation, true));
                            if (previous !== undefined) {
                                // Release old code only after the candidate is ready. Cleanup failure is visible.
                                const released = yield* Effect.exit(callback(release(id, previous), mutation, false));
                                if (Exit.isFailure(confirmation)) return yield* Effect.failCause(confirmation.cause);
                                if (Exit.isFailure(released)) return yield* Effect.failCause(released.cause);
                            }
                            if (Exit.isFailure(confirmation)) return yield* Effect.failCause(confirmation.cause);
                            return { status: 'updated', version: manifest.version } satisfies UpdateResult;
                        }
                    ).pipe(
                        /** Record restart requirements separately from completed hot replacements. */ (effect) =>
                            kernelSpan(
                                effect,
                                'kernel.update',
                                /** Use only the public update status for telemetry. */ (result) => result.status
                            )
                    );
                /** Recover a failed local module; sticky producer ambiguity still rejects this ordinary mutation. */
                const recover = (id: string) =>
                    Effect.gen(
                        /** Revalidate before reconstructing services, retaining whether installation already succeeded. */ function* () {
                            // This lifecycle operation is not durable-attempt reconciliation or permission to replay callbacks.
                            const entry = yield* lookup(id);
                            yield* authorize(entry, 'recover');
                            yield* mutable();
                            if (entry.state !== 'failed') return yield* error(id, 'invalid-state');
                            const mutation = yield* begin(projection(entry, 'recover', 'registered'));
                            entry.state = 'registered';
                            yield* committed(mutation);
                            yield* Effect.gen(
                                /** Reuse installation history without rerunning an already successful install hook. */ function* () {
                                    // Rebuild prior installations; fresh failures still follow the normal install contract.
                                    yield* validate(id);
                                    if (entry.installed) {
                                        const mutation = yield* begin(projection(entry, 'install', 'installed'));
                                        entry.running = yield* callback(build(entry), mutation);
                                        entry.state = 'installed';
                                        yield* committed(mutation);
                                    } else {
                                        yield* install(id);
                                    }
                                    yield* activate(id);
                                }
                            ).pipe(
                                Effect.onError(
                                    /** Restore failed state and mandatory cleanup if recovery cannot complete. */ () =>
                                        markFailed(entry, 'recover')
                                )
                            );
                        }
                    ).pipe(
                        /** Observe module recovery without implying journal reconciliation. */ (effect) =>
                            kernelSpan(effect, 'kernel.recover')
                    );
                /** Preflight an exact empty-registry composition, then publish and start it with scoped rollback. */
                const compose = (input: PlatformComposition, definitions: ReadonlyArray<ModuleDefinition>) =>
                    Effect.gen(
                        /** Reject invalid composition contracts before any module layer is published. */ function* () {
                            yield* mutable();
                            if (entries.size !== 0) return yield* error('<platform>', 'invalid-state');
                            const composition = yield* decode(PlatformComposition, input);
                            if (!unique(composition.modules.map(/** Extract pinned identity. */ ({ id }) => id)))
                                return yield* error('<platform>', 'duplicate');
                            if (
                                !unique(
                                    composition.bindings.map(
                                        /** Identify binding slots. */ ({ consumer, requirement }) =>
                                            `${consumer}/${requirement}`
                                    )
                                )
                            )
                                return yield* error('<platform>', 'provider-ambiguous');
                            const decoded = yield* Effect.forEach(
                                definitions,
                                /** Decode each definition without constructing its executable layer. */ (definition) =>
                                    decode(KernelManifest, definition.manifest).pipe(
                                        Effect.map(
                                            /** Preserve the definition associated with its decoded manifest. */ (
                                                manifest
                                            ) => ({ manifest, definition })
                                        )
                                    )
                            );
                            if (
                                !unique(
                                    decoded.map(/** Extract executable identity. */ ({ manifest }) => manifest.id)
                                ) ||
                                decoded.length !== composition.modules.length
                            )
                                return yield* error('<platform>', 'invalid-contract');
                            // Plan and preflight private candidates; no registration or layer is published yet.
                            const candidates = new Map<string, Entry>();
                            for (const pin of composition.modules) {
                                const selected = decoded.find(
                                    /** Select only the executable matching this exact composition version pin. */
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
                                if (
                                    entry.manifest.migrations.some(
                                        /** Detect coordinated migrations. */ ({ kind, online }) =>
                                            kind === 'staged' || !online
                                    )
                                )
                                    return yield* error(id, 'migration-required');
                            }
                            const scope = yield* Scope.fork(yield* Effect.scope, ExecutionStrategy.sequential);
                            const previous = bindings;
                            const start = Effect.gen(
                                /** Publish preflighted registrations into the rollback-owned child scope. */ function* () {
                                    // Provider bindings must be visible before dependency-ordered installation and activation.
                                    bindings = composition.bindings;
                                    for (const entry of candidates.values()) {
                                        yield* publish(entry);
                                    }
                                    for (const entry of candidates.values()) {
                                        const mutation = yield* begin(projection(entry, 'validate', 'validated'));
                                        entry.state = 'validated';
                                        yield* committed(mutation);
                                    }
                                    for (const id of order) {
                                        yield* install(id);
                                        yield* activate(id);
                                    }
                                    return yield* ready;
                                }
                            ).pipe(Effect.provideService(Scope.Scope, scope));
                            // Rollback finalizers cannot acquire the mutex already held by compose.
                            return yield* start.pipe(
                                Effect.onError(
                                    /** Undo owned registrations directly while compose still holds the lifecycle lock. */ () =>
                                        Effect.gen(
                                            /** Remove published candidates before closing their registration finalizers. */ function* () {
                                                // Direct removal makes finalizers identity no-ops and avoids recursive mutex acquisition.
                                                for (const [id, entry] of [...entries].reverse())
                                                    yield* removeScoped(id, entry);
                                                bindings = previous;
                                                yield* Scope.close(scope, Exit.void);
                                            }
                                        )
                                )
                            );
                        }
                    ).pipe(
                        /** Observe composition through its final public readiness receipt. */ (effect) =>
                            kernelSpan(
                                effect,
                                'kernel.compose',
                                /** Classify emission. */ (receipt) => (receipt.emitted ? 'emitted' : 'unchanged')
                            )
                    );
                yield* Effect.addFinalizer(
                    /** Dispose remaining registrations in reverse insertion order when the kernel scope closes. */ () =>
                        Effect.forEach(
                            [...entries].reverse(),
                            /** Each disposal retains the exact registration identity it owns. */ ([id, entry]) =>
                                dispose(id, entry),
                            { discard: true }
                        )
                );
                return Kernel.of({
                    /** Serialize registration with all other lifecycle mutations. */
                    register: (definition) => serialized(register(definition)),
                    /** Serialize validation so planning observes one registry state. */
                    validate: (id) => serialized(validate(id)),
                    /** Serialize installation and its service ownership transfer. */
                    install: (id) => serialized(install(id)),
                    /** Serialize activation against dependency and workflow changes. */
                    activate: (id) => serialized(activate(id)),
                    ready: serialized(ready),
                    /** Serialize ordinary deactivation without mandatory-admission fallback. */
                    deactivate: (id) => serialized(stop(id, 'deactivate')),
                    /** Serialize authorized registration removal. */
                    unregister: (id) => serialized(stop(id, 'unregister')),
                    /** Serialize retirement while preserving module data. */
                    retire: (id) => serialized(stop(id, 'retire')),
                    /** Serialize candidate preparation, replacement and old-service release. */
                    update: (id, definition) => serialized(update(id, definition)),
                    /** Serialize local recovery without clearing durable ambiguity. */
                    recover: (id) => serialized(recover(id)),
                    /** Serialize composition preflight and rollback as one lifecycle operation. */
                    compose: (composition, definitions) => serialized(compose(composition, definitions)),
                    /** Read an authorized binding under the lifecycle lock without mutating state. */
                    resolve: (consumer, requirement) =>
                        mutex.withPermits(1)(
                            Effect.gen(
                                /** Authorize the consumer before exposing provider selection. */ function* () {
                                    // Provider selection can reveal composition metadata, so even a nonmutating resolve needs current consumer authority.
                                    const entry = yield* lookup(consumer);
                                    yield* authorize(entry, 'validate');
                                    return (yield* selected(consumer, requirement)).binding;
                                }
                            )
                        ),
                    /** Acquire a scoped ready-generation lease while holding the same lock as mutations. */
                    workflow: (id) =>
                        mutex.withPermits(1)(
                            Effect.gen(
                                /** Reject stale readiness before increasing process-local workflow ownership. */ function* () {
                                    // The shared lock makes readiness validation and lease acquisition atomic to mutation.
                                    const entry = yield* lookup(id);
                                    yield* authorize(entry, 'activate');
                                    if (degraded) return yield* error(id, 'recovery-required');
                                    if (closing || readyGeneration !== generation || entry.state !== 'ready')
                                        return yield* error(id, 'invalid-state');
                                    if (leases === 0) drained = yield* Deferred.make<void>();
                                    return yield* Effect.acquireRelease(
                                        Effect.sync(
                                            /** Pin the current module version and generation until this lease's scope closes. */ () => {
                                                leases += 1;
                                                return { module: id, version: entry.manifest.version, generation };
                                            }
                                        ),
                                        /** Wake waiting disposals only when the last workflow owner releases its lease. */ () =>
                                            Effect.suspend(
                                                /** Release cannot wait on the lifecycle mutex held by acquisition. */ () => {
                                                    // The last release resolves the barrier that mandatory disposal awaits.
                                                    leases -= 1;
                                                    return leases === 0
                                                        ? Deferred.succeed(drained, undefined).pipe(Effect.asVoid)
                                                        : Effect.void;
                                                }
                                            ).pipe(
                                                /** Observe lease release without extending its ownership lifetime. */ (
                                                    effect
                                                ) => kernelSpan(effect, 'kernel.workflow.release')
                                            )
                                    );
                                }
                            ).pipe(
                                /** Observe acquisition independently from its eventual scoped release. */ (effect) =>
                                    kernelSpan(effect, 'kernel.workflow.acquire')
                            )
                        ),
                    durability: mutex.withPermits(1)(
                        Effect.sync(
                            /** Return a copied status view; observation never reconciles or retries attempts. */ () => ({
                                state: Option.isNone(journal)
                                    ? ('local' as const)
                                    : degraded
                                      ? ('recovery-required' as const)
                                      : ('healthy' as const),
                                unconfirmed: [...unconfirmed],
                            })
                        )
                    ),
                    snapshot: Effect.suspend(
                        /** Read current public registry state without exposing resources or generation. */ () =>
                            // Empty preflight state is observable without waiting for its lifecycle lock.
                            entries.size === 0
                                ? Effect.succeed([])
                                : mutex.withPermits(1)(
                                      Effect.sync(
                                          /** Copy registry fields while the lifecycle lock protects their consistency. */ () =>
                                              [...entries.values()].map(
                                                  /** Copy public fields. */ ({ manifest, state }) => ({
                                                      module: manifest.id,
                                                      version: manifest.version,
                                                      state,
                                                  })
                                              )
                                      )
                                  )
                    ),
                });
            }
        )
    );
