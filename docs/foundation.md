# Application foundation

The foundation from [EVE-244](https://linear.app/resnovas/issue/EVE-244) is the starting point for every Eventiva feature: one PNPM and Nx workspace with a Node backend shell, an Expo client for Android, iOS and the web, and three platform packages that feature modules build on. It holds no product features yet. It exists so the first feature issue, [EVE-23](https://linear.app/resnovas/issue/EVE-23), starts from checked boundaries, tests and smoke runs instead of from nothing.

[Back to the README](../README.md)

## What is in the workspace

| Project | Path | Tags | What it does |
| --- | --- | --- | --- |
| `@eventiva/contracts` | `packages/contracts` | `type:core`, `layer:shared` | Portable contracts: action specifications, platform errors, flag, i18n and telemetry names. Depends only on `effect`. |
| `@eventiva/schema` | `packages/schema` | `type:shared`, `layer:shared` | The module manifest schema (format 1). |
| `@eventiva/runtime` | `packages/runtime` | `type:runtime`, `layer:backend` | `implement` binds a handler to a specification; `ActionHost` registers modules and runs every action through one path. |
| `@eventiva/integrations.formatjs` | `packages/integrations/formatjs` | `type:integration`, `layer:shared` | The `I18n` service over FormatJS, with terminology overlays and the en-GB default message as fallback. |
| `@eventiva/integrations.openfeature.server` and `.client` | `packages/integrations/openfeature-*` | `type:integration` | The `Flags` service over OpenFeature, with sources in a fixed precedence and a safe default for every flag. |
| `@eventiva/integrations.posthog.server` and `.client` | `packages/integrations/posthog-*` | `type:integration` | PostHog as an OpenFeature provider. Nothing connects without a key. |
| `@eventiva/server` | `apps/server` | `type:platform`, `layer:backend` | The backend composition root. It registers the built-in `platform` module and runs `platform.status` once. |
| `@eventiva/client` | `apps/client` | `type:platform`, `layer:frontend` | The Expo shell with React Intl, OpenFeature and the Hermes `Intl` polyfills. |
| `@eventiva/client-e2e` | `apps/client-e2e` | `type:test` | The Playwright web smoke test. |
| Test projects | `tests/*` | `type:test` | Vitest and `@effect/vitest` tests for each package, and the boundary rule tests. |

Every package exports subpaths only, such as `@eventiva/contracts/action`. There is no root `index.ts`, no `export *`, and every package sets `"sideEffects": false`, so bundlers drop what a screen does not import.

## Why actions are split in two

A specification (`define` from `@eventiva/contracts/action`) is data: a name, a version, schemas, side effect, offline behaviour and an optional flag. The web, Expo, agents and the backend can all import it. A handler (`implement` from `@eventiva/runtime/action`) is an Effect and lives only in backend code. `ActionHost.invoke` is the only way to run one: it checks the flag, decodes the input, runs the handler and encodes the result or the typed error, inside the span `action.<name>`.

## Boundaries

`eslint.config.mjs` enforces the module boundaries from the Nx project tags:

- **Type**: `core` imports only `core`; `shared` adds `shared`; `runtime`, `integration` and `extension` each add their own type to `core` and `shared`; `platform` imports every library type but no other platform; `test` imports anything.
- **Layer**: `frontend` imports `frontend` and `shared`, `backend` imports `backend` and `shared`, and `shared` imports only `shared`.
- **Capability**: `contracts` imports only `contracts`; `schema`, `actions`, `flags` and `i18n` import `contracts` and the capabilities below them, so the graph stays acyclic.
- **External**: `core` and `shared` packages import only `effect`; server-only packages, Node built-ins and Node globals are refused in `shared` and `frontend` code.

The `boundaries` test project runs these rules against fixture projects, so a rule that stops working fails a test.

## Set up

1. Install Node at the version in `.node-version` (24.22.3) and enable pnpm with Corepack: `corepack enable pnpm`.
2. Install and check the workspace:

   ```sh
   pnpm install --frozen-lockfile
   node --run setup
   node --run check
   pnpm exec playwright install --with-deps chromium
   ```

3. Run the full gate, as CI does:

   ```sh
   node --run verify
   ```

Nx runs locally only (`neverConnectToCloud` in `nx.json`). Nothing in the workspace deploys, builds through EAS or sends data to PostHog.

## Example: add an action

```ts
import { define } from '@eventiva/contracts/action';
import { implement } from '@eventiva/runtime/action';
import type { ServerModule } from '@eventiva/runtime/host';
import { Effect, Schema } from 'effect';

// Portable: safe to import from the client.
export const Greet = define('demo.greet', {
    version: 1,
    description: 'Greet a person by name. Reads nothing else.',
    input: Schema.Struct({ name: Schema.NonEmptyTrimmedString }),
    output: Schema.Struct({ greeting: Schema.String }),
    sideEffect: 'read',
    offline: 'local',
});

// Backend only: the handler and the module that registers it.
export const demoModule: ServerModule = {
    manifest: { format: 1, id: 'demo', version: '0.0.1', description: 'Demo.', actions: [Greet.name], flags: [] },
    actions: [implement(Greet, ({ name }) => Effect.succeed({ greeting: `Hello ${name}` }))],
};
```

Register it with `host.register(demoModule)` inside a scope and run it with `host.invoke('demo.greet', { name: 'Sam' })`, as `apps/server/src/main.ts` does for `platform.status`.

## Targets

| Command | What it runs |
| --- | --- |
| `node --run check` | House gate: toolchain pins agree, generated agent files, licence headers, `LLMS.md`. Needs no install. |
| `pnpm nx run-many -t lint typecheck test build` | ESLint with the boundary rules, TypeScript project references, Vitest with 90% coverage thresholds, package builds. |
| `pnpm nx run-many -t smoke` | Starts the server once, checks the i18n catalogue (`client:i18n`), exports Android and checks for Hermes bytecode, exports the web build and runs the Playwright smoke in Chromium. |
| `node --run verify` | All of the above. |
| `node --run toolchain` | Prints the pinned and active Node and pnpm versions. |

## Settings

| Setting | Default | Effect |
| --- | --- | --- |
| `POSTHOG_API_KEY` (server) | unset | Unset: the server uses the Git baseline flags only and opens no connection. Read as a redacted secret. |
| `POSTHOG_HOST` (server) | `https://eu.i.posthog.com` | The PostHog host used when a key is set. |
| `EXPO_PUBLIC_POSTHOG_KEY` (client, build time) | unset | Unset: the client uses its baseline flags only. Set: flags only, with analytics opted out, GeoIP off and no flag-called events. |
| `EXPO_PUBLIC_POSTHOG_HOST` (client, build time) | `https://eu.i.posthog.com` | The PostHog host used when a key is set. |

Every flag declares a safe default, which applies whenever no source answers.

## Common problems

- **`nx` reports the workspace is out of sync**: run `pnpm nx sync`, then commit the updated `tsconfig.json` references.
- **`toolchain: ... pins Node`**: `.node-version`, `.nvmrc`, `.tool-versions` and `engines.node` disagree; set them all to the same release.
- **`client:i18n` fails with a stale catalogue**: a message changed in code. Run `pnpm --filter @eventiva/client exec formatjs extract 'src/**/*.tsx' --format simple --out-file lang/en-GB.json`.
- **The web smoke cannot start Chromium**: run `pnpm exec playwright install --with-deps chromium`.
- **A lint error names a dependency constraint**: the import crosses a type or layer boundary. Move the code to a package the importer may use instead of relaxing the rule.
