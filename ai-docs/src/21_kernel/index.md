# Exact modular kernel

Read `docs/kernel.md` before changing EVE-257/EVE-263 kernel contracts. The kernel
owns lifecycle/admission/composition only, never business action execution or SQL.
Keep contracts below runtime and all provider implementations outside the kernel.

`ModuleDefinition.manifest: KernelManifest` and
`Kernel.compose(composition: PlatformComposition, definitions)` are concrete
Schema-backed wire types, still strictly decoded at runtime. The private decoder
accepts `NoInfer<I>` for `Schema<A, I>`. Decode untrusted transport inputs before
calling these APIs; do not reintroduce erased inputs, assertions or suppressions.

`kernelProvider<A, I>(schema, value: NoInfer<A>)` returns
`Effect<KernelProvider, KernelError>`. It validates the Type-side service before
creating the handle. `KernelModule.providers` holds
`ReadonlyMap<string, KernelProvider>`, not raw heterogeneous values.
`KernelEnvironment.resolve<A, I>(requirement, schema)` validates the retained
service's Type and returns `Effect<A, KernelError>`. Callable service methods keep
their own exact inputs/outputs/errors/requirements; never encode or serialize
them, replace them with Json or validate a transformed value twice as wire input.

`KernelError` is still Data.TaggedError, with an exact constructor annotation to
avoid the vendor factory's open generic leaking into emitted declarations. The
reason union is unchanged. `readonly cycle?: ReadonlyArray<ModuleId>` is populated
only for cycle failures, e.g. `[alpha, beta, gamma, alpha]`; `module` remains
`alpha`. Never emit Config, raw causes, protected payloads or service values.

Provider instance/requirement names are nonempty local strings, not ModuleIds.
Module/capability IDs and exact versions retain their original grammar. Both
manifest and provider cycles reject before acquisition; diamonds remain valid.
Preserve authorization, state transitions, generation invalidation, leases,
candidate cleanup/recovery and additive migration preflight while changing types.

Composition uses a private candidate registry and explicit candidate bindings for
topology planning. Decode and pin every manifest, authorize the lifecycle, admit
trust, plan the full graph and run all non-mutating Config preflights before
publishing entries, bindings or Layers. Run preflights once in dependency order;
publish their entries directly as `validated`, rather than calling public
`validate` again. Reject staged/offline migrations before publication too.
Install/activate/ready retain their normal authorization checks during startup.

During preflight, `snapshot` returns an empty registry without waiting on the
lifecycle mutex; nonempty snapshots retain serialization. Failed Config or
defective validation publishes nothing; preserve secret-safe `invalid-config`
mapping and interruption, including validator finalizers. Retry must succeed on
the same Kernel after failure, defect or interruption. After publication, keep
the existing reverse scoped cleanup and binding restoration on startup failure.
This does not roll back arbitrary install side effects. Standalone register and
validate, update and recovery retain their original behavior. The dependent-module
regressions verify no acquisition/install/activate before all preflights, empty
snapshots during validation, single successful validation and cleanup on retry.

`01_kernel.ts` is a complete typed composition example. Its authority and caller
are supplied by trusted composition, not a permissive policy default. The same
feature is used with two explicit provider choices. Tests also keep two named
instances per provider live simultaneously and verify each finalizer once.

Read [lifecycle telemetry](02_telemetry.md) before instrumenting kernel work.
The real private boundaries emit fixed operation spans through central telemetry,
with finite `eventiva.kernel.outcome` values and no identifiers or configuration.
Readiness receipts and restart-required updates retain distinct outcomes; these
diagnostics are not durable lifecycle facts or distributed fencing.

No new dependency, export map, Nx setting, generated file or main push belongs to
this lane. Shared exports, whole-repository source/package graphs, LLMS generation
and Graphify refresh are held by the coordinator. Isolated aliases and emitted
declarations do not clear EVE-261 or repository-wide EVE-263. Ready/lease evidence
is process-local, not durable delivery or distributed fencing.
