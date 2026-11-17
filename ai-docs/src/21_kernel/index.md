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
publish registered entries then record validated transitions without calling the
public `validate` again. Reject staged/offline migrations before publication too.
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

## Trusted durable mutation owner

Build `KernelLive` with optional captured `KernelProducer` for durable lifecycle
facts. Without it, behavior stays local and `Kernel.durability` reports `local`.
The logical runtime must match the producer; platform-ready facts use the fresh
persisted incarnation UUID, not the local receipt's logical name. The complete
`03_producer.ts` example takes trusted services and authenticated caller inputs;
it does not create a permissive production policy or driver inside runtime.

Kernel-owned `KernelMutation` binds the exact projection and stable request UUID
before callbacks. Trusted policy supplies tenant/purpose/profile classification
and cannot contradict transition/version/generation. Callbacks may inspect this
optional context for status/idempotency, namespace the key per callback slot and
never infer replay authority from its presence. A null key is local-only or
mandatory cleanup without durable admission. Producer/policy remain host-private.

Only fresh durable admission permits first execution. Confirm at actual state
writes, not successful public returns: the replacement is committed before old
cleanup and may remain installed when `update` returns an error. Failure/removal
cascades and ready invalidation produce their actual intermediate transitions.
Ready deduplicates by incarnation/generation; module facts precede platform-ready.
An ambiguous callback or lost confirmation sets sticky `recovery-required`, blocks
ordinary mutations/new ready/workflow leases, and retains request IDs for status
reconciliation without callback replay. No automatic reset/recovery is supplied.

Jonathan's 2026-11-17 mandatory-disposal option A is recorded on EVE-45 comment
`2ef327d5-35a0-4a74-a70f-2e8ef126222e`: failed intent cannot prevent finalizers or
scope removal. Report recovery-required and never fabricate an unadmitted fact.
The existing journal reconciles retained status; it does not reconstruct a lost
kernel registry or prove cross-runner fencing. EVE-45/EVE-261 remain open for
broader composed consumers, security, native and production acceptance.

The source and declaration boundary gates, strict typecheck, lifecycle tests and
two-dialect producer acceptance run in the combined workspace. Shared LLMS/Graphify
generation and final delivery remain coordinator-owned. Local ReadyReceipt and
workflow lease evidence is process-local; durable journal confirmation does not
turn it into distributed fencing or complete EVE-261/EVE-263 acceptance.
