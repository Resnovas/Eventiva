## Eventiva application foundation (EVE-244)

Workspace: PNPM 12.18.0, Nx 24.0.5 (`neverConnectToCloud`), TypeScript 6.0.3 (nodenext, strict, `exactOptionalPropertyTypes`, custom condition `@eventiva/source` resolving workspace packages to `src/*.ts`), Effect 3.22.4 from the pnpm catalog. Projects:

- `packages/contracts` (`@eventiva/contracts`; `type:core layer:shared capability:contracts`): `./action` (`define`, `ActionSpec`, `Input`, `Output`, `Failure`, `wireName`), `./errors` (`Schema.TaggedError` platform errors), `./flags` (`Flags` tag, `FlagSource` precedence, `safeDefault`), `./i18n` (`I18n` tag, `MessageKey`, `TerminologyPack`, `canonicalLocale`), `./telemetry` (OTel attribute and span names only; no exporter).
- `packages/schema` (`@eventiva/schema`; `type:shared`): `./manifest` (`ModuleManifest`, format 1).
- `packages/runtime` (`@eventiva/runtime`; `type:runtime layer:backend`): `./action` (`implement`), `./host` (`ActionHost`, `ActionHostLive`, `ServerModule`, `DuplicateAction`, `InvalidModule`). Registration is scoped and all-or-nothing; `invoke` gates the flag, decodes input, runs the handler and encodes the output or typed error inside span `action.<name>`.
- `packages/integrations/{formatjs,openfeature-server,openfeature-client,posthog-server,posthog-client}` (`type:integration`): the only places that import vendor SDKs. PostHog connects only when a key is configured and sends no analytics or flag-called events.
- `apps/server`, `apps/client` (Expo 56, Hermes; `index.ts` loads `src/polyfills.ts` first), `apps/client-e2e` (Playwright web smoke), `tests/*` (Vitest 4 with `@effect/vitest`, 90% coverage thresholds, and the `boundaries` rule tests).

Rules: subpath exports only, no root barrel, no `export *`, `"sideEffects": false`. A specification never imports runtime code; a handler is registered only through `ActionHost`. Boundaries come from Nx tags in `eslint.config.mjs`: `core`/`shared` import only `effect` externally, `frontend` and `shared` never import `backend` or server-only packages, capabilities stay acyclic. Every flag has a safe default. Only dependencies in the EVE-244 approval matrix, at exact versions.

Gates: `node --run check`; `pnpm nx sync:check`; `pnpm nx run-many -t lint typecheck test build`; `pnpm nx run-many -t smoke` (server start, `client:i18n`, Android export with Hermes bytecode, web export plus Playwright). `node --run verify` runs all of them. CI's required `application check` aggregates `.github/workflows/ci.yml`.

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
    actions: [implement(Status, () => Effect.map(actions, (names) => ({ runtime: 'eventiva' as const, actions: names })))],
});
```

Run it with `host.register(platformModule(host.actions))` inside `Effect.scoped`, then `host.invoke('platform.status', {})`, as `apps/server/src/main.ts` does.

Feature flags: this foundation adds the flag plumbing and one client flag, `client.shell.offline-banner` (safe default `false`). It adds no product behaviour to gate.
