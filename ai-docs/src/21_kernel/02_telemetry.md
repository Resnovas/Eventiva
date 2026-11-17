# Actual kernel lifecycle spans

Read [Kernel telemetry](../../../docs/kernel-telemetry.md). `KernelLive`
instruments the existing private lifecycle boundaries so composition and recovery
include their actual nested work. Fixed names are `kernel.register`,
`kernel.validate`, `kernel.preflight`, `kernel.install`, `kernel.activate`,
`kernel.ready`, `kernel.deactivate`, `kernel.unregister`, `kernel.retire`,
`kernel.update`, `kernel.recover`, `kernel.compose`, `kernel.release`,
`kernel.provider.select`, `kernel.workflow.acquire` and `kernel.workflow.release`.

The only attached attribute is `eventiva.kernel.outcome`, with finite values
`succeeded`, `failed`, `interrupted`, `emitted`, `unchanged`, `updated` and
`restart-required`. Stack capture is disabled. Keep module/runtime/provider and
caller identifiers, manifest/config values, errors and secrets out of tracing
options. Reuse the central telemetry layer's trusted static catalog, attribute
allow-list, opt-out, bounded queue and Exit sanitization. No sink belongs in a
feature. Foreign tracers are not covered by central sanitization.

`tests/runtime/src/kernel-telemetry.spec.ts` is the executable composition example.
It invokes the real kernel under central telemetry, asserting compose ancestry,
exact acquisitions/finalizers, failure cleanup, retained serving generations,
ready/update distinctions, denial/preflight, interruption and recovery, redaction,
opt-out and exporter outage. Preserve the existing lifecycle results and order;
never move authorization, mutation, mutexes or finalizers to improve a trace.

Provider-selection spans belong to the real private selector, including internal
resolution; authorization denial before it runs emits no selection span. Lease
acquisition is a short observation, not workflow duration. Only the owning scope's
actual finalizer emits release, exactly once. Denied/not-ready admission emits
failure without release or a leaked lease. Tests retain update refusal while a
lease is held and successful replacement after release, including disabled
telemetry and exporter outage. These remain process-local guards, not persistent
lease ownership or distributed fencing.

Do not synthesize register/validate spans for composition's candidate path or
public transition spans for raw candidate update hooks. A ready `emitted`
attribute describes a process-local receipt, not external publication. Diagnostic
records are not immutable lifecycle evidence, distributed fencing, persisted
producer provenance or restart trace continuity. This adds no configuration or
dependency and does not clear EVE-44/EVE-261 as a whole.
