# Modular kernel contracts

The isolated EVE-257 kernel coordinates admission, exact module/capability pins,
named providers, lifecycle, scoped disposal and process-local workflow leases.
Business execution remains on the authorized ActionHost. EVE-263 tightens the
public contracts without adding a second action path or a global service locator.

## Construct and consume a provider

Use `kernelProvider(schema, value)` inside the provider's scoped Layer. Pass a
decoded value matching the Schema's Type, not its Encoded representation. The
factory returns `Effect<KernelProvider, KernelError>` and validates the producer
Schema before returning the handle. Put handles in `KernelModule.providers`, a
`ReadonlyMap<string, KernelProvider>`, under declared local instance names.
Create these runtime handles in trusted composition; integration implementations
still depend only on neutral contracts, never on runtime.

Resolve a declared requirement through `KernelEnvironment.resolve(name, schema)`.
The consumer Schema validates the retained value and determines the exact result.
No service is converted to JSON, encoded, asserted into another type or exposed
through an erased map. A callable service retains its methods' input, output,
error and environment types; callers still supply those environment services.
Schema validation of a class checks its identity, not arbitrary executable code's
correctness. Only policy-admitted trusted code runs in process.

For transforming Schemas, both provider construction and consumer resolution
validate the decoded Type. For example, `Schema.NumberFromString` accepts the
decoded number `37` here, not the string `"37"`. Decode untrusted wire data at its
transport boundary first. This API does not introduce a generic untrusted ingress
adapter or an exception to EVE-263.

Follow the complete [composition example](../ai-docs/src/21_kernel/01_kernel.ts):

1. Supply an authenticated `CallerIdentity` and a real `KernelAuthority` Layer.
2. Call `runKernelExample(caller, authority, 'local')` inside an Effect program.
3. Repeat with `'regional'`. Only the explicit binding changes; feature code and
   its callable service Schema stay unchanged.
4. Provide each acquired provider's finalizers in its Layer. The example's Scope
   closes all registrations when it returns; a serving application keeps its
   outer Scope open.

The reserved package subpaths are `@eventiva/contracts/module-manifest`,
`@eventiva/contracts/module-policy` and `@eventiva/runtime/kernel-runtime`.
Shared export maps are intentionally held for coordinator integration. Isolated
test aliases are not evidence that these subpaths are published or buildable.

## Exact inputs and names

`ModuleDefinition.manifest` is `KernelManifest`; `Kernel.compose` takes
`PlatformComposition`. Both still decode with strict excess-property rejection
before using their inputs. The private decoder accepts the Schema's exact
Encoded type, not an erased input. A typed input does not bypass runtime format,
version, nested-field or topology validation.

| Input                                | Rule / default                                                             |
| ------------------------------------ | -------------------------------------------------------------------------- |
| Module/capability identity           | ModuleId grammar; required, no default                                     |
| Module/capability version            | Exact numeric `x.y.z`; required, no ranges/default                         |
| Provider instance / requirement name | Nonempty local string, case-sensitive; required, no default                |
| Provider binding                     | Explicit consumer/requirement/provider/instance; no automatic selection    |
| `ModuleDefinition.validate`          | Required non-mutating `Effect<void, KernelError>` preflight                |
| `compatibleWith`                     | Optional exact predecessor; absent means restart-required for update       |
| Migration declaration                | Exactly `id`, `kind: additive or staged`, `online`; kernel executes no SQL |

The same local instance name in different modules is valid. Duplicate names
within a module, duplicate requirement bindings and incompatible capability pins
fail admission. Name uniqueness and explicit binding are separate from service
Schema validation.

## Cycle diagnostics and lifecycle guarantees

`KernelError` remains a Data.TaggedError with the existing closed reason union.
It adds `readonly cycle?: ReadonlyArray<ModuleId>`. Kernel-produced cycle failures
include the closed dependency path, with the repeated module at both ends, and
keep `module` equal to that module's identity. Other errors omit `cycle` entirely.
The path contains only validated module identifiers, not inputs, service values,
Config, credentials or raw causes. For example:

```text
module: alpha
reason: cycle
cycle: [alpha, beta, gamma, alpha]
```

Both manifest and selected-provider edges participate. Direct/indirect cycles
reject composition before service acquisition; rejection leaves an empty registry.
Shared dependencies and diamonds are valid. Existing lifecycle states, ready
generation invalidation, authorization, conservative busy refusal, candidate
failure recovery, migration preflight and lease-aware shutdown are unchanged.

## Composition preflight

`Kernel.compose` admits the whole requested graph before publishing registrations
or acquiring module Layers. It strictly decodes manifests and exact pins, checks
lifecycle authorization and trust, validates dependencies and provider bindings,
then runs each module's non-mutating `validate` once in dependency order. Staged
or offline migrations also reject before publication. Only after every preflight
succeeds does it publish validated entries and install/activate in dependency
order. Install, activate and ready still recheck their operation's authorization.

Keep `ModuleDefinition.validate` limited to Config, secret-safe admission and
resource compatibility checks. Do not acquire services or mutate storage there.
For example, if valid module A is a dependency of module B and B is missing a
required Config value, neither module's Layer, install hook or activate hook runs.
The registry stays empty, including snapshots requested while validation is in
progress. Empty snapshots do not wait for the lifecycle lock; nonempty snapshots
retain lifecycle serialization.

A preflight failure or defect leaves no registrations or bindings to roll back;
defects become secret-safe `invalid-config` errors. Interruption remains
interruption and runs the validator's finalizers. Retry `compose` after fixing
the configuration or interruption. Successful validation is not repeated during
that composition's startup. This is not a transaction for module install side
effects: failures after publication retain the existing scoped rollback behavior.
Standalone `register` still publishes a registered entry without running Config;
call `validate` explicitly before `install`. Update and recovery validation are
unchanged.

## Lifecycle diagnostics

Read [Kernel telemetry](kernel-telemetry.md) to observe actual lifecycle,
composition, replacement and cleanup spans through the existing central telemetry
layer. Fixed outcome attributes distinguish unchanged readiness and
restart-required updates from new receipts and applied replacements. Optional
diagnostics do not change authority, lifecycle results or scoped ownership and
are not durable transition events.

## Troubleshoot and verify

- Fix an `invalid-contract` provider error by checking the producer's decoded
  value and the consumer's precise Schema. Error messages do not echo that value.
- Fix `provider-unavailable` by checking the explicit binding, declaration and
  provider lifecycle. Do not substitute another available instance implicitly.
- Fix `cycle` by removing a dependency edge or extracting a shared lower-level
  contract; do not weaken missing-node or admission checks.
- Fix `invalid-config` by supplying the module's required Config values, then
  retry composition. Errors deliberately omit the rejected values and secrets.
- Treat ready receipts and leases as process-local only. They do not prove durable
  publication, cross-runner fencing or persisted crash recovery.

The dedicated tests are `tests/contracts/src/module-manifest.spec.ts` and
`tests/runtime/src/kernel-runtime.spec.ts`. Run them with coordinator-provided
aliases until the held exports exist, plus strict TypeScript, typed lint and
declaration/type-negative fixtures. The original 36 focused tests remain; new
coverage includes callable provider swaps, independent named instances, exact
producer/consumer validation, local-name grammar and closed cycle paths. Shared
Nx/export/source-graph integration, generated LLMS and Graphify remain coordinator
obligations, not claims established by isolated checks.
