## Eventiva application foundation (EVE-244)

Workspace: PNPM 12.18.0, Nx 24.0.5 (`neverConnectToCloud`), TypeScript 6.0.3 (nodenext, strict, `exactOptionalPropertyTypes`, custom condition `@eventiva/source` resolving workspace packages to `src/*.ts`), Effect 3.22.4 from the pnpm catalog. Projects:

- `packages/contracts` (`@eventiva/contracts`; `type:core layer:shared capability:contracts`): `./action` (`define`, `ActionSpec`, `Permission`, `Input`, `Output`, `Failure`, `wireName`), `./caller` (`Caller` tag, `CallerIdentity`, `Authorizer` tag with `canInvoke` and `check`), `./errors` (`Schema.TaggedError` platform errors: `UnknownAction`, `InvalidInput`, `Unavailable`, `Forbidden`, `ActionFailed`), `./ids` (branded UUID `TenantId`, `SubjectId`, `SessionId`; generation is a service, never a contract), `./security` (`SecurityProfile` baseline < sensitive < restricted < vault, `isWeaker`), `./flags` (`Flags` tag, `FlagSource` precedence, `safeDefault`), `./i18n` (`I18n` tag, `MessageKey`, `TerminologyPack`, `canonicalLocale`), `./telemetry` (OTel attribute and span names only; no exporter).
- `packages/schema` (`@eventiva/schema`; `type:shared layer:shared capability:schema`): `./field` (`id`, `text`, `integer`, `decimal` as exact strings, `boolean`, `timestamp`, `json`, `reference`; pipeable `nullable`, `classify`, `conflict`, `label`), `./resource` (`make`, `row`, `FieldName`), `./compose` (`contribute`, pure order-independent `compose` returning `Either` with `DuplicateResource`, `DuplicateField`, `UnknownTarget`, `WeakerClassification`, `InvalidName`), `./manifest` (`ModuleManifest` format 1 with optional `resources`, `ResourceName`, `ModuleId`). No driver, column type, tenant id or global registry.
- `packages/runtime` (`@eventiva/runtime`; `type:runtime layer:backend capability:actions`; imports only `effect`, no Node built-ins): `./action` (`implement`), `./host` (`ActionHost`, `ActionHostLive`, `ServerModule<R>`, `DuplicateAction`, `InvalidModule`, `ActivationFailed`, `RegistrationError`, `InvocationError`). EVE-40 adds the required invocation services and receipt path described below. `register` is scoped and all-or-nothing: checks manifest, actions, resources and composition, builds the module `layer` in a child scope (`ActivationFailed` releases it), then commits. Closing the scope removes the module first and releases its layer second, exactly once. `schema` returns the composed schema of registered modules.
- `packages/integrations/*` (`type:integration`): vendor/platform adapters, including FormatJS, OpenFeature, PostHog, SQL and telemetry.server. The telemetry integration is backend-only; its local logger and default-off governed OTLP span subpaths do not introduce a runtime-to-integration import. PostHog flags connect only when a key is configured and send no analytics or flag-called events.
- `apps/server`, `apps/client` (Expo 56, Hermes; `index.ts` loads `src/polyfills.ts` first), `apps/client-e2e` (Playwright web smoke), `tests/*` (Vitest 4 with `@effect/vitest`, 90% coverage thresholds, and the `boundaries` rule tests).

Rules: subpath exports only, no root barrel, no `export *`, `"sideEffects": false`. A specification never imports runtime code; a handler is registered only through `ActionHost`, and every surface (UI, HTTP, MCP, ACP, agents) calls `invoke`; there is no privileged path. Authorisation is an invariant, never a flag. The platform packages form the chain `runtime` -> `schema` -> `contracts`; a back-import is a lint error (circular dependency). Storage adapters (EVE-42) compile `compose` output into tables; action inventory, receipts and JSON Schema belong to EVE-40. Every flag has a safe default. Dependencies require exact owner-approved versions: the EVE-244 matrix plus separately recorded additions, including the 2026-11-17 EVE-21 OTLP approval described in the telemetry guide.

### Boundary rules (EVE-22 reconciliation)

Use `eslint.config.mjs`, not the archived core/database hierarchy or the uncorrected house architecture reference, as the source of truth. The full [boundary tables](../../../docs/foundation.md#boundaries) enumerate every configured type/layer/capability row. Active tags use colons. Every matching constraint applies simultaneously, including to type-only imports; a devDependency is not an exemption.

- Types: core -> core; shared -> core/shared; runtime, integration and extension -> core/shared plus their own type; platform -> every listed library type but not platform; test -> any type, still constrained by layer. Same-type permission never permits a cycle. SQL adapters are integrations, not `type:database`; UI modules are a frontend extension.
- Layers: shared -> shared; frontend -> frontend/shared; backend -> backend/shared; test -> frontend/backend/shared/test. A backend test project cannot import frontend libraries merely because it is type:test.
- Capability constraints are exact sets, not a hierarchy: contracts -> contracts; schema -> contracts/schema; actions -> contracts/schema/actions; flags -> contracts/flags; i18n -> contracts/i18n. The app/storage/telemetry/ui/test tags have no capability-specific ESLint row; other constraints still apply. Tags alone do not establish an acyclic graph.
- External packages: core/shared/actions allow only effect and effect/*; shared/frontend also ban the explicit serverOnly SDK list. Node built-ins are banned in shared/frontend/actions; listed Node globals are banned in shared/frontend only. Zod is rejected globally; export-all declarations are rejected in package TypeScript. See the actual config for exact package/global names, not a presumed ban on every server SDK.

For example, frontend extensions may import contracts/schema but not runtime or client integrations; the latter still fails type constraints despite matching layers. Runtime and telemetry.server independently import contracts and are composed by the server app. The separate resource source/manifest/emitted-declaration audits impose additional graph and privileged SQL restrictions, not a new ESLint type tier. Run `pnpm nx test @eventiva/boundaries-tests`: Nx must supply its cached graph, or direct Vitest execution skips the Nx lint rule with a warning and negative fixtures fail. Run the resolved-graph gate after dependency builds as described below. No new gate or dependency is needed for this documentation correction.

Gates: `node --run check`; `pnpm nx sync:check`; `pnpm nx run-many -t lint typecheck test build parity`; `pnpm nx run-many -t smoke` (server start, `client:i18n`, Android export with Hermes bytecode, web export plus Playwright). `node --run verify` runs all of them. CI's required `application check` aggregates `.github/workflows/ci.yml`.

Example, compiled as `apps/server/src/status.ts`: a portable specification and the backend module that implements it.

```ts
import { define } from '@eventiva/contracts/action';
import { implement } from '@eventiva/runtime/action';
import type { ServerModule } from '@eventiva/runtime/host';
import { Effect, Schema } from 'effect';

export const Status = define('platform.status', {
    version: 1,
    description: 'Report the running Eventiva runtime and its registered actions. Reads nothing else.',
    input: Schema.Struct({}),
    output: Schema.Struct({ runtime: Schema.Literal('eventiva'), actions: Schema.Array(Schema.String) }),
    permission: 'platform.status',
    sideEffect: 'read',
    offline: 'local',
});

export const platformModule = (actions: Effect.Effect<ReadonlyArray<string>>): ServerModule => ({
    manifest: {
        format: 1,
        id: 'platform',
        version: '0.0.1',
        description: 'Built-in platform status.',
        actions: [Status.name],
        flags: [],
    },
    actions: [
        implement(Status, () => Effect.map(actions, (names) => ({ runtime: 'eventiva' as const, actions: names }))),
    ],
});
```

Register with `host.register(platformModule(host.actions))` inside `Effect.scoped`. EVE-40 additionally requires the invocation services below. The current server shell has no durable audit adapter and explicitly reports execution disabled rather than returning an unaudited successful status.

### Host declaration isolation (EVE-258 / EVE-23)

`register` snapshots resource/contribution arrays, declaration scalars, field maps and field metadata before preflight. It reuses that admitted snapshot across layer activation and replans against current registry state at atomic publication. Caller mutations during the wait cannot bypass ownership, manifest matching, reference validation, conflicts or classification floors. A concurrent conflicting winner still rejects the entire candidate and releases its acquired layer once; failed activation publishes nothing.

`schema` composes detached resource/contribution metadata, including optional label/reference wrappers. Writes through a retained view cannot alter later views or subsequent admission. Example: `contributions.length = 0` on the caller's original array leaves admitted fields present; attempting to lower a returned field's `security` leaves the next view and registration floor unchanged. Remove fields only by closing the contributor's scope; remove the base resource by closing its owner's scope after contributors. No additional registry or public API is introduced.

Preserve exact Effect value-schema and AST identities, schema-compatible field operations and field inference. Do not recursively clone/freeze caller schemas or modify pure `compose` identity/order behavior. Schema constructors and library prototypes remain opaque, not mutation targets. This is an existing-invariant correction, with no runtime option, feature flag, SQL change or production activation.

Public regression command: `pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/host.spec.ts --coverage.enabled=false`. It covers independent base/contributor scopes, original array/map/scalar writes, returned-view writes, deterministic activation suspension, subsequent valid and weaker-profile admission, concurrent conflict rollback and cleanup. Run full `node --run verify` for compatibility/type/lint/coverage gates. See [the people guide](../../../docs/foundation.md#registered-declaration-isolation-eve-258--eve-23). Narrow in-process isolation does not close EVE-258's canonical storage integration or G01-G15 acceptance, nor change EVE-23's existing completed status.

Boundary tests (`tests/boundaries`): ESLint rule cases against fixtures and real packages, package hygiene, and a portable bundle check: every contracts and schema subpath bundled for the browser contains only those packages and `effect` with its dependency closure, no Node import; a one-subpath bundle drops the rest; React Native's `hermes-compiler` compiles the full bundle.

Feature flags: this foundation adds the flag plumbing and one client flag, `client.shell.offline-banner` (safe default `false`). It adds no product behaviour to gate.

Provider diagnostic remediation retains existing recovery/default/teardown behavior while replacing raw vendor causes with bounded operation/reason literals. OpenFeature errors retain initialize|close and provider-failed; server-provider shutdown retains shutdown and shutdown-failed. Never log vendor exception payloads to diagnose provider configuration.

Coordinated module validation uses real package export conditions and Nx-tagged test/example projects. Reusable UI registry/interpreter source lives in the frontend extension library @eventiva/ui-modules; tests build and consume that library, never the client app. Run frozen install, nx sync:check and verify. verify and CI build declared outputs before tools/resources/boundaries.mjs plus its fixtures, run the complete Nx gate serially, then audit public declarations; the dependency-free house check stays separate. Process conformance intentionally imports the built server, so graph resolution requires those outputs even on a clean checkout. Serial execution bounds memory without skipping targets or weakening coverage. The checker covers disconnected source, type-only/alias edges, manifest cycles and syntax escapes, not vendor-opacity approval or production acceptance. tests/resources composes callable kernel providers with real SQL resources on PostgreSQL/Node SQLite, including ready and tenant rejection; no production module activation follows from that test.

EVE-263 schema aliases: `checkTypeEscapes` binds each file with the installed TypeScript checker without loading vendor declarations. Import module/original member plus lexical symbol identity identify `Schema as S` from `effect`, namespace imports from `effect/Schema`, named `Unknown`/`Any` imports and direct or local re-exports, qualified type references and import-type queries. `AnyNoContext` is inside the vendor's `Schema` type namespace, not a top-level export. Both modes reject these erased contracts with the existing diagnostic. Typed `S.Struct({ name: S.String, count: S.Number })` remains valid; unrelated application exports/objects and lexical shadows are positive controls. Keep the legacy unbound `Schema.Unknown` diagnostic. This is file-local import provenance, not transitive value-flow soundness. No new option, dependency, flag or policy is introduced; run the existing Node fixtures and both CLI modes after builds. See the complete example in `docs/foundation.md`, "Erased schema import aliases (EVE-263)".

EVE-263 reflection approval: owner message1982 in `T-01a189ae-399d-7162-9765-4488b9600016` permits only private `PropertyDescriptor` reflection `unknown`, immediately recursively validated and never publicly exposed. `checkTypeEscapes` recognizes only the local `const child: unknown = descriptor.value; const encoded = visit(child);` inside `canonicalJson`'s private visitor at `packages/runtime/src/invocation.ts`. It requires source mode, no parse diagnostics, the exact binding/initializer and the reviewed entire declaration's SHA-256 AST fingerprint (node kinds, flags, leaf text). That pins descriptor origin, accessor rejection, immediate recursion, error propagation and no additional child uses. Evaluate this unchanged parser-AST predicate before TypeScript binding annotates node flags; do not repin its fingerprint. Comments are not suppressions. Every other `unknown`, every `any`, assertions, erased schemas and diagnostic suppressions stay rejected. Declaration mode never applies the exception, even for the approved implementation. No blanket borrowed Effect opacity approval follows.

Run `node --test tools/resources/boundaries.test.mjs` and `node tools/resources/boundaries.mjs` for focused proof. A changed/missing validator, another path/initializer, moved value or extra use must fail closed; do not automatically regenerate the fingerprint. Review structural changes or a TypeScript upgrade before repinning. This syntax predicate does not prove semantics or ambient binding integrity. Keep compiler checks for lexical/type correctness, emitted declaration audits for public API erasure, and `tests/runtime/src/execution.spec.ts` for getter/Proxy `get` non-execution, cycles, sparse/non-JSON rejection and valid ordered arrays/canonical objects. Arbitrary reflection traps and mutated built-ins are not proven safe by those checks. See `docs/foundation.md`, "Approved private reflection ingress (EVE-263)", for the approval scope and example failure.

Test projects run explicit `tsc -p ... --noEmit` targets after dependency builds, not Nx's inferred disabled-target placeholder. The shared Vitest helper takes the suite config URL to anchor discovery/reports and keeps the workspace inside Vite's root for uncovered TypeScript transformation. All four coverage thresholds stay at 90%; a silently excluded source file is not coverage evidence.

Package-wide coverage reuses public cross-package specifications: runtime includes resources/telemetry, storage includes resources, and contracts includes resources/telemetry/UI/kernel. Nx implicit test dependencies track these inputs. Keep both package-wide coverage globs and thresholds; do not restore silent external-source exclusions. The paired hook Storage scenario tests handled versus escaping transaction failures, inventory settlement and exact payment replay through its public Storage methods.
