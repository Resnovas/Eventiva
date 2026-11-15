## Eventiva application foundation (EVE-244)

Workspace: PNPM 12.18.0, Nx 24.0.5 (`neverConnectToCloud`), TypeScript 6.0.3 (nodenext, strict, `exactOptionalPropertyTypes`, custom condition `@eventiva/source` resolving workspace packages to `src/*.ts`), Effect 3.22.4 from the pnpm catalog. Projects:

- `packages/contracts` (`@eventiva/contracts`; `type:core layer:shared capability:contracts`): `./action` (`define`, `ActionSpec`, `Permission`, `Input`, `Output`, `Failure`, `wireName`), `./caller` (`Caller` tag, `CallerIdentity`, `Authorizer` tag with `canInvoke` and `check`), `./errors` (`Schema.TaggedError` platform errors: `UnknownAction`, `InvalidInput`, `Unavailable`, `Forbidden`, `ActionFailed`), `./ids` (branded UUID `TenantId`, `SubjectId`, `SessionId`; generation is a service, never a contract), `./security` (`SecurityProfile` baseline < sensitive < restricted < vault, `isWeaker`), `./flags` (`Flags` tag, `FlagSource` precedence, `safeDefault`), `./i18n` (`I18n` tag, `MessageKey`, `TerminologyPack`, `canonicalLocale`), `./telemetry` (OTel attribute and span names only; no exporter).
- `packages/schema` (`@eventiva/schema`; `type:shared layer:shared capability:schema`): `./field` (`id`, `text`, `integer`, `decimal` as exact strings, `boolean`, `timestamp`, `json`, `reference`; pipeable `nullable`, `classify`, `conflict`, `label`), `./resource` (`make`, `row`, `FieldName`), `./compose` (`contribute`, pure order-independent `compose` returning `Either` with `DuplicateResource`, `DuplicateField`, `UnknownTarget`, `WeakerClassification`, `InvalidName`), `./manifest` (`ModuleManifest` format 1 with optional `resources`, `ResourceName`, `ModuleId`). No driver, column type, tenant id or global registry.
- `packages/runtime` (`@eventiva/runtime`; `type:runtime layer:backend capability:actions`; imports only `effect`, no Node built-ins): `./action` (`implement`), `./host` (`ActionHost`, `ActionHostLive`, `ServerModule<R>`, `DuplicateAction`, `InvalidModule`, `ActivationFailed`, `RegistrationError`, `InvocationError`). EVE-40 adds the required invocation services and receipt path described below. `register` is scoped and all-or-nothing: checks manifest, actions, resources and composition, builds the module `layer` in a child scope (`ActivationFailed` releases it), then commits. Closing the scope removes the module first and releases its layer second, exactly once. `schema` returns the composed schema of registered modules.
- `packages/integrations/{formatjs,openfeature-server,openfeature-client,posthog-server,posthog-client}` (`type:integration`): the only places that import vendor SDKs. PostHog connects only when a key is configured and sends no analytics or flag-called events.
- `apps/server`, `apps/client` (Expo 56, Hermes; `index.ts` loads `src/polyfills.ts` first), `apps/client-e2e` (Playwright web smoke), `tests/*` (Vitest 4 with `@effect/vitest`, 90% coverage thresholds, and the `boundaries` rule tests).

Rules: subpath exports only, no root barrel, no `export *`, `"sideEffects": false`. A specification never imports runtime code; a handler is registered only through `ActionHost`, and every surface (UI, HTTP, MCP, ACP, agents) calls `invoke`; there is no privileged path. Authorisation is an invariant, never a flag. The platform packages form the chain `runtime` -> `schema` -> `contracts`; a back-import is a lint error (circular dependency). Storage adapters (EVE-42) compile `compose` output into tables; action inventory, receipts and JSON Schema belong to EVE-40. Boundaries come from Nx tags in `eslint.config.mjs`: `core`/`shared` import only `effect` externally, `frontend` and `shared` never import `backend` or server-only packages, capabilities stay acyclic. Every flag has a safe default. Only dependencies in the EVE-244 approval matrix, at exact versions.

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

Boundary tests (`tests/boundaries`): ESLint rule cases against fixtures and real packages, package hygiene, and a portable bundle check: every contracts and schema subpath bundled for the browser contains only those packages and `effect` with its dependency closure, no Node import; a one-subpath bundle drops the rest; React Native's `hermes-compiler` compiles the full bundle.

Feature flags: this foundation adds the flag plumbing and one client flag, `client.shell.offline-banner` (safe default `false`). It adds no product behaviour to gate.
