# Kernel lifecycle telemetry

Use lifecycle spans to inspect actual kernel admission, startup, replacement and
cleanup. These are optional process-local diagnostics, not durable lifecycle
events or evidence that an application is ready for production.

## Observe lifecycle work

1. Compose `KernelLive` with the authenticated caller and trusted authority from
   [the kernel composition example](../ai-docs/src/21_kernel/01_kernel.ts).
2. Install the existing `telemetryLayer` around the consuming effect. Recognize
   only the fixed names below in its trusted message catalog.
3. Allow-list `eventiva.kernel.outcome` with the finite values below when operation
   distinctions are needed. Do not accept attributes from module configuration.
4. Run the lifecycle operation and flush `TelemetryControl` before inspecting a
   completed local snapshot. Check exporter health separately from its result.

| Span                      | Observed operation                                                |
| ------------------------- | ----------------------------------------------------------------- |
| `kernel.register`         | Manifest admission and scoped registration                        |
| `kernel.validate`         | Standalone validation and state transition                        |
| `kernel.preflight`        | Non-mutating module validation, including composition candidates  |
| `kernel.install`          | Installation and acquisition of the module's scoped services      |
| `kernel.activate`         | Activation and provider validation                                |
| `kernel.ready`            | Readiness checks or an unchanged-generation receipt               |
| `kernel.deactivate`       | Explicit deactivation                                             |
| `kernel.unregister`       | Explicit registration removal                                     |
| `kernel.retire`           | Explicit retirement                                               |
| `kernel.update`           | Candidate evaluation and replacement, or restart-required refusal |
| `kernel.recover`          | Recovery through existing validation, installation and activation |
| `kernel.compose`          | Whole-graph admission, preflight and startup or rollback          |
| `kernel.release`          | Deactivation and scope closure, including failure cleanup         |
| `kernel.provider.select`  | Actual private provider selection, including internal resolution  |
| `kernel.workflow.acquire` | Scoped workflow-lease admission and acquisition                   |
| `kernel.workflow.release` | Workflow-lease release in its owning scope's finalizer            |

The operation attribute is one of `succeeded`, `failed`, `interrupted`, `emitted`,
`unchanged`, `updated` or `restart-required`. Readiness and composition use
`emitted` or `unchanged`; this describes the process-local receipt, not delivery
of an external ready event. Update preserves its actual `updated` or
`restart-required` result. Other successful operations use `succeeded`.
The central record's separate `outcome` field reports Effect success or failure;
use the allow-listed attribute to distinguish interruption and refused updates.

For a complete executable example, run the real kernel acceptance specification:

```sh
pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/kernel-telemetry.spec.ts tests/runtime/src/kernel-runtime.spec.ts --coverage.enabled=false
```

The specification composes the existing kernel and telemetry layers, calls real
operations and checks results, generation retention and exact scoped cleanup as
well as spans. Composition traces contain the private install/activate/ready
operations that actually execute. They do not invent register/validate spans for
composition's separate candidate-admission path. Candidate update hooks likewise
remain inside the update operation rather than fabricating public transitions.

Provider selection is observed where the kernel actually resolves a binding,
including internal module-environment resolution. Authorization denial before
selection does not produce a selection observation. Lease acquisition is a
short operation span, not workflow duration. Its release span appears only when
the owning scope closes; rejected admission produces no release span. A held
lease still rejects replacement, and closing its scope permits replacement.

## Privacy, options and missing records

Names and outcome values are static. Stack capture is disabled. No module,
runtime, provider, caller or tenant identifier, manifest, configuration value,
error message or payload is attached. Keep the central telemetry layer around
these effects to sanitize exits before export; an arbitrary tracer does not
inherit that guarantee.

No option, dependency, service or exporter is added. Existing defaults remain
`telemetry.enabled: true`, `telemetry.capacity: 256` and
`telemetry.timeoutMs: 1000`; see [Telemetry](telemetry.md) for bounds. Disabling
optional telemetry or losing the exporter does not change authority, mutexes,
generation handling, finalizers or lifecycle results.

- A `redacted` code or missing operation attribute means the trusted catalog or
  attribute allow-list does not recognize it. Add only the fixed values above.
- Missing records can also mean opt-out, bounded-queue drops or exporter failure.
  A failed flush does not imply that the lifecycle operation failed.
- A successful child can belong to a failed composition that later cleans up.
  Inspect the parent result and current kernel snapshot, not only child spans.
- A release span covers cleanup even after a lifecycle failure. It does not
  certify that arbitrary install side effects were rolled back.

This does not add persistent trace handoff, distributed lease fencing, workflow
recovery, provider-resolution metrics, production activation or native proof.
EVE-44 and EVE-261 retain their other acceptance gates.
