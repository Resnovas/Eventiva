# Declarative UI module substrate

Status: EVE-259 format-1 contracts/interpreter with real public export maps,
Nx project ownership and shared verification. Client entrypoint adoption, actual
Rambo/native rendering and live security adapters remain separate gates. The owner
deferred Rambo until an approved releasable Resnovas/Rambo-UI React Native package/API
exists; do not block unrelated modular delivery or substitute another library.
Use [the people guide](../../../docs/declarative-modules.md) for the complete JSON
example, required fields, limits and diagnosis. Never import archived application
code or infer production activation from the coordinated kernel/resource/hook sources.

## Dependency direction and public names

`packages/contracts/src/ui-module.ts` owns Effect Schemas and inferred types
`UiModuleDefinition`, `UiNode`, `UiActionBinding`, `UiProjection`, `UiConfig`,
`UiValue`, the `UiModuleFailure` tagged-error Schema and the `UiPlatform` and
`UiScreenContext` Context tags.
It imports only Effect and existing same-level action/caller/flag/i18n contracts.
The versioned format is data-only; services are trusted host ports, not manifest
callbacks. No `unknown`, `any`, erased schema placeholder, cast or suppression is
introduced by this lane.

`packages/ui-modules/src/declarative-registry.ts` owns `DeclarativeRegistry`,
`UiRegistration`, `declarativeRegistry` and `declarativeUiFlag`. The library points
to contracts, never runtime/features. The sole local type-only edge is registry
to the renderer interface; there is no reverse edge. Both consumers depend on
the lower-level Schema contract (A -> C <- B), not each other's features.

`DeclarativeModule.tsx` owns the stateless interpreter plus `UiRenderer` and
`UiRendererProps`. Only trusted preinstalled adapters may contain executable
React. There is no Eventiva component library, DOM prop spreading, dynamic
import, eval, UI business handler or direct data/storage access.

## Typed use

This shape is exercised in `tests/ui-modules/src/declarative-module.spec.tsx` through
real library exports. Provide the real approved services at
the composition root; never add a permissive default implementation.

```ts
import { Caller } from '@eventiva/contracts/caller';
import { UiModuleFailure, type UiProjection } from '@eventiva/contracts/ui-module';
import { Effect } from 'effect';
import { DeclarativeRegistry } from '@eventiva/ui-modules/declarative-registry';

export const projectModule = (json: string) =>
    Effect.scoped(
        Effect.gen(function* () {
            const registry = yield* DeclarativeRegistry;
            const registration = yield* registry.register(json);
            const projection: UiProjection = yield* registration.project;
            return projection;
        })
    ) satisfies Effect.Effect<UiProjection, UiModuleFailure, Caller | DeclarativeRegistry>;
```

The returned snapshot above is for immediate inspection only: the example Scope
closes at return. For an active screen, retain the Scope and refresh the projection
under the current Caller; never reuse a released registration for interaction.
No background work, lease service or route engine is created by this example.

Layer signature:
`Layer<DeclarativeRegistry, never, UiPlatform | Flags | I18n | ActionInventory>`.
`register(json, replace = false)` requires `Caller | Scope`; `project` and
`invoke(nodeId)` require `Caller` and fail only with `UiModuleFailure`. Invocation
returns `void`, never handler output or a feature-specific result placeholder.
Both foundation/module flags default false; neither authorizes anything.

`modules` requires `Caller` and returns `Effect<ReadonlyArray<string>, never,
Caller>`, filtering by tenant and fresh admission. Registry identity is the pair
of tenant and module id, not module id alone. Cross-tenant handles fail `denied`;
same-name registrations and replacements in another tenant cannot change a
handle's projection or be removed by its finalizer.

`UiRegistration.mount` is `Effect<void, UiModuleFailure, Caller | Scope.Scope |
UiScreenContext>`. The screen port accepts only lazy `read:
Effect<UiProjection, UiModuleFailure, Caller>` and `invoke(node): Effect<void,
UiModuleFailure, Caller>` capabilities. Its own Effect requires `Caller |
Scope.Scope`. Implement it in the trusted EVE-50 composition, never in a
declarative manifest; use fresh current-caller reads and identity-checked scoped
disposal. No screen-context implementation or app navigation is included here.

## Security and validation

Decode JSON text with Effect Schema and excess-property rejection before admission
or publication. Restrict format-1 config/action input to flat JSON scalar records.
Resolve exact component/action versions; validate action input centrally; reject
unbound interactions, duplicate/cyclic/orphan nodes and missing en-GB defaults.
Fields are read-only, scalar and viewer-masked. UI and agent screen state share one
projection, excluding hidden node references and all action input/permission data.
Recheck admission after asynchronous masking reads before publishing. Decode the
completed available snapshot against `UiProjection`; malformed adapter output
fails `invalid-projection`. Positive action versions are checked on output too.

`UiPlatform` requires per-viewer admission, canonical input validation, authorized
host invocation, visibility and minimized field-value services. No production
implementation is included. The same approval, audit, tenant isolation and sealed
baseline/sensitive/restricted/vault release floors still apply. Self-declared
`protected` is not trust. Protected-containing modules conservatively refuse all
replacement and conditional hiding; protected labels ignore terminology overlays.

The retained decoded definition never crosses `UiPlatform` boundaries. Private
format-1 copies detach messages, nodes, children, component/config records and
binding input for each `admit`, `visible`, `checkInput` and `invoke` call. Config
and input contain scalars only; this is not a general decoded-domain cloning
policy. An adapter clearing `protected` cannot make viewer suppression succeed
or permit an unprotected replacement. Node/binding rewrites cannot change later
projection or canonical dispatch, even through retained callback arguments.
Inventory action/version validation remains live on invocation; admission,
flags, offline state, masking and tenant checks are not memoized. Public
contracts and failure reasons are unchanged. The regression is process-local
adapter isolation, not native/device parity or production security acceptance.

Publication and invocation use a local semaphore. Finalizers compare registration
identity before removal, so old scopes cannot overwrite/remove replacements. Failed
candidates leave the current registration intact. Disposal waits for admitted
invocation; it is not a kernel workflow lease, distributed drain or recovery proof.
No observer/listener is registered, so there is none to leak. App-wide route/menu
and the real screen-context adapter remain held. Effect spans for
`ui.module.project`, `ui.module.invoke`, `ui.module.mount`, `ui.module.unmount`
reuse the selected tracer. Failure logging uses only `ui.module.failed` and bounded
`ui.failure.reason`, with no payload annotation. Exporters, central navigation and
render-error handling remain composition-root obligations, not a second telemetry
implementation in this lane.

## Evidence and shared obligations

Focused tests include malformed/executable/unknown/unbound/denied/offline/config
negatives, exact metadata versions, masking, replacement, closed Scope and in-flight
serialization. Compile-time fixtures independently constrain input, output, error,
Layer and environment types and reject function/nested config, wrong format/version,
wrong output and erased failure/service requirements without suppression comments.
The 40-case refinement adds tenant isolation, NaN output rejection, admission
revocation during reads, scoped lazy screen reads and parent-trace correlation.
Projection JSON roundtrip and negative output versions are exercised. Coverage was
explicitly enabled with the existing v8 provider and a 90% floor for every
category; no threshold was reduced. See the people guide for per-source figures.
The source dependency audit uses TypeScript resolution, including type-only edges,
aliases and reexports. Complete source/package/manifest cycle detection and negative
controls run in `node --run verify` and CI; isolated UI results alone do not replace them.

The coordinated action/schema/storage remediation replaces the prototype's broad
lower-level contracts; isolated UI results do not clear the combined EVE-263 gate.
No vendor-unknown adapter is introduced here.

The registry and interpreter moved unchanged from the client application into
the internal frontend library packages/ui-modules. Nx forbids imports of apps,
even for private test subpaths; do not disable that rule. Use the real exports
`@eventiva/ui-modules/DeclarativeModule` and
`@eventiva/ui-modules/declarative-registry` after the library build. Its tags are
type:extension/layer:frontend/capability:ui. Tests retain separate project ownership
and aliases are not required. Verify shared package/manifest/source graphs and
declarations together, then regenerate LLMS and Graphify centrally.

Browser captures show the real interpreter with injected DOM adapters and stubbed
policy/action ports. They prove neither Rambo approval, React Native execution,
production authorization nor full platform/UI readiness. No banner implementation
belongs here; EVE-260 remains gated on verified ready/central telemetry.

The owner-selected identity is `Resnovas/Rambo-UI` (EVE-13 D8). Main inspected at
[b47a58c](https://github.com/Resnovas/Rambo-UI/commit/b47a58cc45c7c982deaaa4f002eee686e775ab98)
has historical Mitosis templates, not an
approved RN package/version/catalogue. The sample package
`@builder.io/basic-example@0.0.1` is not production dependency approval. The client
has no installed Rambo package. Request exact release/digest, exports, supported
components/targets, accessibility and source evidence; never substitute another
vendor, adopt a historical template or create a private component library.

## Portable current-screen state

`@eventiva/ui-modules/screen-context` exports scoped `makeScreenContext`. Provide
its `service` to `UiRegistration.mount`, and supply the current authenticated
Caller separately on every `read`/`invoke`. Selection is isolated by tenant and
session; lazy capabilities retain fresh masking and canonical action authority.
Replacement/unmount invalidates pending reads without deleting newer entries.
Unavailable projections and typed module failures become absence; defects and
external interruption remain failures. See the compiling `02_screen-context.ts`
example and [people guide](../../../docs/screen-context.md). No app entrypoint,
navigation persistence, native execution or production security adapter is added.
