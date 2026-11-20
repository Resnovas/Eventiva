# Application foundation

The foundation from [EVE-244](https://linear.app/resnovas/issue/EVE-244) is the starting point for every Eventiva feature: one PNPM and Nx workspace with a Node backend shell, an Expo client for Android, iOS and the web, and three platform packages that feature modules build on. It holds no product features yet. It exists so the first feature issue, [EVE-23](https://linear.app/resnovas/issue/EVE-23), starts from checked boundaries, tests and smoke runs instead of from nothing.

[Back to the README](../README.md)

## What is in the workspace

| Project                                                   | Path                                     | Tags                                | What it does                                                                                                                                                                                   |
| --------------------------------------------------------- | ---------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@eventiva/contracts`                                     | `packages/contracts`                     | `type:core`, `layer:shared`         | Portable contracts: action specifications, the caller and `Authorizer`, platform errors, identifiers, security profiles, flag, i18n and telemetry names. Depends only on `effect`.             |
| `@eventiva/schema`                                        | `packages/schema`                        | `type:shared`, `layer:shared`       | Database-neutral resources and fields, pure schema composition, and the module manifest (format 1).                                                                                            |
| `@eventiva/runtime`                                       | `packages/runtime`                       | `type:runtime`, `layer:backend`     | `implement` binds a handler to a specification; `ActionHost` registers modules, authorises every call and runs it through one path.                                                            |
| `@eventiva/integrations.formatjs`                         | `packages/integrations/formatjs`         | `type:integration`, `layer:shared`  | The `I18n` service over FormatJS, with terminology overlays and the en-GB default message as fallback.                                                                                         |
| `@eventiva/integrations.openfeature.server` and `.client` | `packages/integrations/openfeature-*`    | `type:integration`                  | The `Flags` service over OpenFeature, with sources in a fixed precedence and a safe default for every flag.                                                                                    |
| `@eventiva/integrations.posthog.server` and `.client`     | `packages/integrations/posthog-*`        | `type:integration`                  | PostHog as an OpenFeature provider. Nothing connects without a key.                                                                                                                            |
| `@eventiva/integrations.telemetry.server`                 | `packages/integrations/telemetry.server` | `type:integration`, `layer:backend` | Local Node telemetry sinks and the separately approved EVE-21 default-off governed OTLP span adapter. See [telemetry](telemetry.md).                                                           |
| `@eventiva/integrations.trust.server`                     | `packages/integrations/trust.server`     | `type:integration`, `layer:backend` | Node `node:crypto` implementation of the approved `eventiva.trust.v1` profile: Ed25519 requests and evidence, AES-256-GCM envelopes over KMS-held keys. See [trust profile](trust-profile.md). |
| `@eventiva/server`                                        | `apps/server`                            | `type:platform`, `layer:backend`    | The backend composition root. It registers the built-in `platform` module and runs `platform.status` once.                                                                                     |
| `@eventiva/client`                                        | `apps/client`                            | `type:platform`, `layer:frontend`   | The Expo shell with React Intl, OpenFeature and the Hermes `Intl` polyfills.                                                                                                                   |
| `@eventiva/client-e2e`                                    | `apps/client-e2e`                        | `type:test`                         | The Playwright web smoke test.                                                                                                                                                                 |
| Test projects                                             | `tests/*`                                | `type:test`                         | Vitest and `@effect/vitest` tests for each package, and the boundary rule tests.                                                                                                               |

Every package exports subpaths only, such as `@eventiva/contracts/action`. There is no root `index.ts`, no `export *`, and every package sets `"sideEffects": false`, so bundlers drop what a screen does not import.

## Why actions are split in two

A specification (`define` from `@eventiva/contracts/action`) is data: a name, a version, schemas, the permission it needs, side effect, offline behaviour and an optional flag. The web, Expo, agents and the backend can all import it. A handler (`implement` from `@eventiva/runtime/action`) is an Effect and lives only in backend code. `ActionHost.invoke` is the only way to run one, for the UI, agents and every protocol alike. In order, it:

1. checks the module and action flags (`Unavailable` when one is off);
2. reads the current `Caller` and asks `Authorizer.canInvoke` for the specification's permission (`Forbidden`), before looking at the input, so a caller without the permission learns nothing about its input;
3. decodes the input (`InvalidInput`);
4. asks `Authorizer.check` with the decoded input, so a policy can refuse a particular target (`Forbidden`);
5. runs the handler and encodes the output or its declared error (`ActionFailed`).

All of it runs inside the span `action.<name>`. The caller is read on every call, so a revoked grant stops working inside a running session. Authorisation is an invariant of the action path, not a feature flag.

## Resources and schema composition

A module declares the records it owns as resources (`@eventiva/schema/resource`) built from fields (`@eventiva/schema/field`). A field names a logical kind, its Effect Schema, a security profile and an offline conflict rule; it never names a column type or a driver. Each tenant has its own database, so resources carry no tenant id. Another module adds fields to a resource with `contribute` (`@eventiva/schema/compose`), and `compose` combines them into one checked schema. There is no global registry: composition is a pure function, and its result and errors do not depend on the order modules arrive in. Storage adapters compile the composed schema into tables; that belongs to the storage issue (EVE-42), not to these packages.

| Field                           | Value                                                               | Wire form                      |
| ------------------------------- | ------------------------------------------------------------------- | ------------------------------ |
| `id()`, `reference(resource)`   | UUID string                                                         | the same string                |
| `text({ maxLength })`           | string, optionally bounded                                          | the same string                |
| `integer()`                     | safe integer                                                        | the same number                |
| `decimal({ precision, scale })` | exact decimal string, such as `-999.99` for precision 5 and scale 2 | the same string, never a float |
| `boolean()`                     | boolean                                                             | the same boolean               |
| `timestamp()`                   | `Date`                                                              | ISO 8601 string                |
| `json(schema)`                  | the schema's value                                                  | the schema's encoding          |

Every field defaults to profile `baseline` and conflict rule `field-lww`; pipe it through `classify(profile)`, `conflict(rule)`, `label(key)` or wrap it in `nullable(...)` to change that. `Resource.make` takes `module`, `version`, `plane` (`tenant` or `control`), `consistency` (`record`, `invariant` or `append-only`), an optional `security` floor (default `baseline`) and `fields`.

`compose` fails with one typed error:

| Error                  | Cause                                                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `DuplicateResource`    | two modules declare the same resource name                                                                           |
| `DuplicateField`       | two declarations give one resource the same field name                                                               |
| `UnknownTarget`        | a contribution or a `reference` field names a resource nobody declares                                               |
| `WeakerClassification` | a field's profile is weaker than its resource's `security` floor; a contribution can raise a profile, never lower it |
| `InvalidName`          | a resource name is not `module.record` or a field name is not lower camel case                                       |

## Registering and removing modules

`ActionHost.register` takes a `ServerModule`: its manifest as data, its handlers, and optionally its `resources`, its `contributions` and a `layer` that provides the services its handlers need. Registration is all or nothing:

1. The manifest is decoded, and every action and resource it lists must be supplied, and nothing else. Resources and contributions must belong to the registering module, and the composed schema must stay valid. A module that fails any check starts nothing.
2. The module's `layer` is built in a scope of its own. If it fails, whatever it acquired is released and `register` fails with `ActivationFailed`.
3. The actions, resources and contributions are added in one step.

Registration lasts until the scope that called `register` closes. Then the host removes the module's actions, resources and contributions first, so no new call can reach them, and releases its layer second, exactly once. The module can then register again, for example after an update. `ActionHost.schema` returns the composed schema of every module currently registered.

### Registered declaration isolation (EVE-258 / EVE-23)

Treat a successful registration as admitting a snapshot, not a live link to a module's resource declarations. Before preflight, the host copies resource and contribution arrays, declaration metadata, field maps and field metadata (including optional label/reference values). That same snapshot is rechecked against the latest registry after layer activation. Editing the original arrays, ownership, names, protection profiles or field maps during activation or after registration cannot change the admitted schema. Another module can still win a conflicting registration while activation waits; the losing registration publishes nothing and releases its acquired layer once.

Read `host.schema` for a detached view. Changing its resource or field metadata cannot change later views or the checks for a subsequent registration. For example, clearing a registered contributor's original array does not remove its fields, and changing a returned field's `security` does not lower the registered resource's protection floor. Close that contributor's registration scope to remove its admitted fields; close the resource owner's scope after its contributors to remove the resource.

Effect value schemas and their ASTs retain their exact identities and are not recursively copied or frozen. Do not mutate schema constructors or library prototypes. Pure `compose` retains its existing identity and ordering contract; this isolation belongs only to the host registry. No public signature, schema format, SQL behavior, option, feature flag or production activation changes.

Run `pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/host.spec.ts --coverage.enabled=false` for the public declaration/view-mutation regressions, deterministic activation barrier, concurrent conflict cleanup and ordinary scoped-removal controls. Run `node --run verify` for schema/resource compatibility, types, lint, coverage and the complete workspace gate. This in-process registry evidence does not establish canonical storage integration, durable migration or G01-G15 acceptance.

`ActionHostLive` needs a `Flags` and an `Authorizer` service; `invoke` needs a `Caller`. The server shell in `apps/server` provides a deny-by-default `Authorizer` that grants its own service identity `platform.status` and nothing else, until the authorisation issue brings real policy.

## Boundaries

[`eslint.config.mjs`](../eslint.config.mjs) is the source of truth for Nx import constraints. Active projects use colon-separated `type:*`, `layer:*` and `capability:*` tags in `project.json`. An import must satisfy every matching constraint, not just one row or one tag family. These tables list allowed workspace targets; they do not grant access to external packages.

| Source type tag    | Allowed target type tags                                                         |
| ------------------ | -------------------------------------------------------------------------------- |
| `type:core`        | `type:core`                                                                      |
| `type:shared`      | `type:core`, `type:shared`                                                       |
| `type:runtime`     | `type:core`, `type:shared`, `type:runtime`                                       |
| `type:integration` | `type:core`, `type:shared`, `type:integration`                                   |
| `type:extension`   | `type:core`, `type:shared`, `type:extension`                                     |
| `type:platform`    | `type:core`, `type:shared`, `type:runtime`, `type:integration`, `type:extension` |
| `type:test`        | Any type, subject to its layer and any other matching constraints                |

Same-type library imports are allowed, but cycles are not. `type:platform` does not allow another platform project. There is no active `type:database` rule: SQL adapters are integrations, not a tier available to extensions. Do not restore the archived core/database hierarchy or a type-only/devDependency exemption.

| Source layer tag | Allowed target layer tags                                       |
| ---------------- | --------------------------------------------------------------- |
| `layer:shared`   | `layer:shared`                                                  |
| `layer:frontend` | `layer:frontend`, `layer:shared`                                |
| `layer:backend`  | `layer:backend`, `layer:shared`                                 |
| `layer:test`     | `layer:frontend`, `layer:backend`, `layer:shared`, `layer:test` |

A `type:test` project with `layer:backend` still cannot import a frontend library. Only the explicit `layer:test` row permits both frontend and backend targets.

| Source capability tag with an ESLint constraint | Allowed target capability tags                                    |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| `capability:contracts`                          | `capability:contracts`                                            |
| `capability:schema`                             | `capability:contracts`, `capability:schema`                       |
| `capability:actions`                            | `capability:contracts`, `capability:schema`, `capability:actions` |
| `capability:flags`                              | `capability:contracts`, `capability:flags`                        |
| `capability:i18n`                               | `capability:contracts`, `capability:i18n`                         |

Other active capabilities, including `app`, `storage`, `telemetry`, `ui` and `test`, have no capability-specific ESLint row. Their type/layer constraints still apply. These capabilities are not a single ordered hierarchy: for example, flags cannot import i18n merely because both implement contracts.

External imports have additional restrictions:

- `type:core`, `type:shared` and `capability:actions` allow only `effect` and its subpaths externally. Workspace imports still follow all tables above. The action runtime receives drivers, SDKs, Node platform layers and Cluster through services composed by apps/integrations.
- `layer:shared` and `layer:frontend` ban the exact `serverOnly` list in the ESLint configuration: server Effect packages (including SQL, Cluster, Workflow and OpenTelemetry), server OpenFeature/PostHog SDKs, and the listed database packages. This is an explicit list, not detection of every possible server SDK.
- Shared/frontend source also rejects Node built-in imports (bare and `node:` names) and the globals `process`, `Buffer`, `require`, `module`, `global`, `__dirname`, `__filename` and `setImmediate`. The action runtime rejects Node built-in imports too; it has no separate Node-global rule.
- `zod` imports are rejected workspace-wide. Package TypeScript source rejects `export *`; the package hygiene tests additionally require explicit subpaths, no root export and `"sideEffects": false`.

For example, a frontend extension may import `@eventiva/schema/compose` and `@eventiva/contracts/action`. It cannot import the backend runtime (type and layer), a client integration (type, even when the layer matches), the SQL integration, or a listed server SDK. Runtime may import schema/contracts; the reverse creates a cycle in the current graph and is also outside the allowed target tags. Moving an import to `import type` does not grant an exception.

The Nx rule detects project cycles in addition to tag checks; equal-type permissions alone do not prevent them. The separate source/manifest and emitted-declaration audits described under "Coordinated module validation" check resolved dependency graphs. Neither a tag table nor a single clean fixture is proof that all graphs are cycle-free.

Run `pnpm nx test @eventiva/boundaries-tests` from the root so Nx supplies the cached project graph used by the ESLint rule. Running Vitest directly before that graph exists skips Nx enforcement with a warning and makes the negative fixtures fail; that is not boundary proof. The suite checks imports against fixture projects and real packages, bundles all contracts/schema subpaths for the browser with only Effect's dependency closure and no Node import, checks unused subpaths are dropped, and compiles the portable bundle with React Native's Hermes compiler. It does not execute a native device.

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
import * as Field from '@eventiva/schema/field';
import * as Resource from '@eventiva/schema/resource';
import { Context, Effect, Layer, Schema } from 'effect';

// Portable: safe to import from the client.
export const Greet = define('demo.greet', {
    version: 1,
    description: 'Greet a person by name. Reads nothing else.',
    input: Schema.Struct({ name: Schema.NonEmptyTrimmedString }),
    output: Schema.Struct({ greeting: Schema.String }),
    permission: 'demo.greet',
    sideEffect: 'read',
    offline: 'local',
});

// Portable: a resource the module owns.
export const Greeting = Resource.make('demo.greeting', {
    module: 'demo',
    version: 1,
    plane: 'tenant',
    consistency: 'record',
    fields: { id: Field.id(), name: Field.text({ maxLength: 200 }).pipe(Field.label('demo.greeting.name')) },
});

// Backend only: a service the handler needs, the handler and the module that registers both.
class Salutation extends Context.Tag('@eventiva/demo/Salutation')<Salutation, { readonly word: string }>() {}

export const demoModule: ServerModule<Salutation> = {
    manifest: {
        format: 1,
        id: 'demo',
        version: '0.0.1',
        description: 'Demo.',
        actions: [Greet.name],
        flags: [],
        resources: [Greeting.name],
    },
    actions: [implement(Greet, ({ name }) => Effect.map(Salutation, ({ word }) => ({ greeting: `${word} ${name}` })))],
    resources: [Greeting],
    layer: Layer.succeed(Salutation, { word: 'Hello' }),
};
```

Register it with `host.register(demoModule)` inside a scope. EVE-40 adds mandatory invocation services and receipts: follow [the action guide](actions.md) before calling `host.execute` or `host.invoke` with a per-call `Caller`. The server shell deliberately disables execution until durable audit is configured; registration alone does not imply an executable unaudited action.

## Targets

| Command                                         | What it runs                                                                                                                                                                        |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node --run check`                              | House gate: toolchain pins agree, generated agent files, licence headers, `LLMS.md`. Needs no install.                                                                              |
| `pnpm nx run-many -t lint typecheck test build` | ESLint with the boundary rules, TypeScript project references, Vitest with 90% coverage thresholds, package builds.                                                                 |
| `pnpm nx run-many -t smoke`                     | Starts the server once, checks the i18n catalogue (`client:i18n`), exports Android and checks for Hermes bytecode, exports the web build and runs the Playwright smoke in Chromium. |
| `node --run verify`                             | All of the above.                                                                                                                                                                   |
| `node --run parity`                             | Canonical action inventory, registered server dispatch and negative parity checks; also included in `verify` and CI's required `application check`.                                 |
| `node --run toolchain`                          | Prints the pinned and active Node and pnpm versions.                                                                                                                                |

## Settings

| Setting                                         | Default                    | Effect                                                                                                                          |
| ----------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `POSTHOG_API_KEY` (server)                      | unset                      | Unset: the server uses the Git baseline flags only and opens no connection. Read as a redacted secret.                          |
| `POSTHOG_HOST` (server)                         | `https://eu.i.posthog.com` | The PostHog host used when a key is set.                                                                                        |
| `EXPO_PUBLIC_POSTHOG_KEY` (client, build time)  | unset                      | Unset: the client uses its baseline flags only. Set: flags only, with analytics opted out, GeoIP off and no flag-called events. |
| `EXPO_PUBLIC_POSTHOG_HOST` (client, build time) | `https://eu.i.posthog.com` | The PostHog host used when a key is set.                                                                                        |

Every flag declares a safe default, which applies whenever no source answers.

Provider initialization and teardown diagnostics contain bounded operation/reason fields, never raw vendor errors. OpenFeature reports `initialize` or `close` with `provider-failed`; the server provider shutdown reports `shutdown` with `shutdown-failed`. Existing safe defaults, source precedence, startup recovery and scoped teardown remain unchanged. If a provider fails, inspect its trusted configuration rather than expecting its exception payload in application logs.

## Coordinated module validation

The kernel, resource, hook, declarative UI and telemetry substrates expose real package subpaths. Their test projects and `ai-docs` examples use workspace dependencies and Nx tags rather than production aliases. The reusable UI registry/interpreter lives in `@eventiva/ui-modules`, a frontend extension library. Tests consume its subpaths after its build; libraries never import the client application.

Run `pnpm install --frozen-lockfile` and `pnpm nx sync:check` after composing the workspace. Immediately after coding, run `node --run verify:static` before documentation. It builds declared outputs, runs all Nx lint/typecheck targets, then audits source and emitted-declaration boundaries. It has no additional options or runtime flags; Nx uses its normal input-hashed cache and a two-task default for independent root-stage work. The separately enforced feature-evidence runner remains serial, including its Nx prerequisites. The process conformance harness imports the actual built server, so even static verification needs build prerequisites on a clean checkout. If Nx reports stale references, run `pnpm nx sync` and inspect its generated changes.

Run `node --run verify` for acceptance: static verification first, then the existing house/documentation gate, boundary regression fixtures, Nx tests/builds/action parity, smoke and affected-feature evidence. CI also runs the static command before documentation. No existing target or coverage threshold is removed. The source audit follows source/type-only imports and workspace package manifests, rejects cycles and unchecked type escapes, and includes disconnected active projects. A static pass is not behavioral proof or production release authorization. Database-backed tests require the approved disposable fixture. CI retains trusted-event integration and adds the separately approved isolated PR fixture; read the [trust review and registry](verification/registry.md).

`node --run setup` installs the staged-snapshot pre-commit guard in addition to the existing commit-msg check. The guard runs static analysis then full verification, rejects staged/working-tree divergence and index mutation, and refuses to overwrite a foreign pre-commit hook. Reconcile a foreign hook explicitly; the installer does not rename, delete or bypass it. Missing fixtures remain failures. Run `node tools/verification/run.mjs --base HEAD` while editing, or pass the trusted base SHA for committed work. The [registry](verification/registry.md) owns interfaces, commands, limitations and evidence options. CI uploads only selected-feature proof with seven-day retention and the existing artifact audience.

### Correct UI scheduling at its state owner

`eventiva/no-zero-delay-ui-timer` rejects literal zero or omitted delays in client and UI-module TypeScript. For example, `setTimeout(updateSelection, 0)` fails with a message to keep state in one owner and update it from the event. Call the owning event operation directly, or remove a second state copy; use scoped Effect scheduling when the operation genuinely needs timed work. Do not change zero to a small positive number merely to silence the rule.

The rule recognizes direct globals and `globalThis`, `window` or `self` member calls, including computed literal properties, optional calls and signed zero. Nonzero delays, locally shadowed names, backend code and spread arguments are outside its rejection predicate. It does not follow aliases or evaluate dynamic delays. Existing hook and package-export checks still apply. Run `pnpm nx test @eventiva/boundaries-tests --skip-nx-cache` to exercise the real ESLint configuration, corrective message, allowed alternatives and retained export restriction. No active zero-delay timer violation was found in the initial audit.

All active-source React imports reject `useEffect`, aliases, namespace/default imports and alternate literal CommonJS/dynamic loading. The diagnostic directs service initialization to bootstrap and state updates to their event owner. The client root now registers a minimal shell synchronously, then initializes flags outside React. `useSyncExternalStore` reads bootstrap's single readiness snapshot; only `ready` mounts product content. Loading exposes a status and fatal acquisition exposes a bounded alert. Normal provider failures retain the adapter's established safe-default recovery. Bootstrap retains the scoped provider until interruption, and Metro disposal requests interruption. Tests exercise registration before unresolved acquisition, readiness, fatal acquisition release, listener removal and exactly-once cleanup. Native device qualification remains distinct from web rendering and Android export.

Run `node tools/resources/boundaries.mjs --declarations` after building to check emitted public dependency graphs as well as the existing source, manifest and declaration-type checks. The emitted graph starts at every exported `types` entrypoint and follows local imports, type queries and re-exports, including aliases and private declaration helpers. It reports closed cycle paths and rejects missing declarations or aliases that resolve back to non-declaration source. Resolution disables the development-only `@eventiva/source` condition so clean source cannot hide a cycle in generated declarations. The flag defaults to off; `verify` already enables it after builds. Fix the declaration dependency or export rather than removing the check. This adds no runtime behavior or vendor-type exception.

### Erased schema import aliases (EVE-263)

The type-escape audit identifies Effect imports by their module and lexical binding, not only the spelling `Schema`. In source and declaration mode it rejects renamed `Schema` imports from `effect`, namespace imports from `effect/Schema`, named `Unknown`/`Any` imports and re-exports from `effect/Schema`, and their type references or import-type queries. The pinned vendor exposes `AnyNoContext` inside the `Schema` type namespace, not as a top-level named export; that erased type remains rejected too.

For example, `import { Schema as S } from 'effect'; export const payload = S.Unknown;` and `export { Unknown as Payload } from 'effect/Schema';` both report `Erased schema contract`. Replace erasure with a precise contract:

```ts
import { Schema as S } from 'effect';

export const payload = S.Struct({ name: S.String, count: S.Number });
export type Payload = typeof payload.Type;
```

Unrelated application exports named `Unknown`, `Any` or `AnyNoContext`, local objects named `Schema`, and lexical shadows are not Effect schema references. The existing unbound direct `Schema.Unknown` diagnostic is retained. This is a file-local import-origin check, not whole-program value-flow analysis or a replacement for the resolved dependency graph and compiler gates. It adds no option, dependency, runtime flag or policy exception. Run `node --test tools/resources/boundaries.test.mjs` for alias/re-export negatives and typed/shadowing controls in both modes; run the source and `--declarations` CLI gates after builds. If an alias is rejected, fix the schema rather than changing its import spelling or broadening the reflection approval below.

### Approved private reflection ingress (EVE-263)

Owner message1982 in thread `T-01a189ae-399d-7162-9765-4488b9600016` approves only a private TypeScript `PropertyDescriptor` reflection value typed `unknown`, immediately recursively validated and never exposed as a public value or type. The source gate implements that approval only for `const child: unknown = descriptor.value; const encoded = visit(child);` in the private recursive visitor inside `canonicalJson` in `packages/runtime/src/invocation.ts`.

The predicate requires source mode, that exact path, a parseable file, the exact local binding and initializer, and a SHA-256 fingerprint of the entire reviewed `canonicalJson` declaration's AST (syntax tree node kinds, flags and leaf text). This pins the descriptor's `Object.getOwnPropertyDescriptor(item, key)` origin, data-descriptor guard, immediate recursive validation, rejection propagation and absence of other child uses. Comments and whitespace do not grant approval. Changed structure, moved or escaped values, another initializer, a missing or changed validator, and new public or private `unknown` sites fail closed. Every `any`, unchecked assertion, erased schema and diagnostic suppression remains rejected. Declaration mode has no exception, including at the approved source path. This is not approval for all borrowed Effect opacity or other vendor boundaries.

Run the focused checks with `node --test tools/resources/boundaries.test.mjs` and `node tools/resources/boundaries.mjs`. For example, replacing `visit(child)` with `validate(child)` must restore an `Erased any/unknown type` finding; do not update the fingerprint to silence it. Review structural changes against the owner's constraints before changing the pinned fingerprint. TypeScript upgrades can also change the fingerprint and require review.

The fingerprint proves the reviewed syntax is unchanged, not general semantic validation or ambient binding integrity. Compiler checks supply lexical/type correctness and emitted declarations supply the separate public API audit. The public regression in `tests/runtime/src/execution.spec.ts` checks that object/array getters and a Proxy `get` trap are not executed, rejects cycles, sparse arrays and non-JSON values, and accepts ordered arrays and canonical objects. It does not prove arbitrary Proxy reflection traps or mutated global built-ins are harmless. Keep these checks in addition to the source gate; this approval does not replace them.

The resource suite composes real PostgreSQL and Node SQLite resources through a schema-validated callable kernel provider, checks readiness against persisted data, and rejects another tenant's retained access. This is local integration evidence only. Production hook release/sink policy, native UI component adapters, cryptographic provenance and external telemetry ingestion remain separate acceptance gates. No default production module activation is added.

Every test project has an executable `tsc -p ... --noEmit` target after dependency builds. Nx's inferred disabled-target message is not typecheck evidence. The shared Vitest helper anchors each suite to its config URL while keeping the workspace inside Vite's root, so uncovered TypeScript is transformed instead of silently omitted from coverage. Coverage thresholds remain 90% for statements, branches, functions and lines.

Package-wide coverage includes existing cross-package contract scenarios: runtime also runs resource and telemetry specifications, storage runs resource specifications, and contracts runs resource, telemetry, UI and kernel specifications. These suites exercise the public contracts together rather than excluding newly composed modules from coverage. Nx test dependencies track the reused suites. The paired hook Storage regression checks inventory settlement and rollback, including the distinction between handling a failure inside a transaction and allowing it to escape, plus exact payment replay.

## Common problems

- **`nx` reports the workspace is out of sync**: run `pnpm nx sync`, then commit the updated `tsconfig.json` references.
- **`toolchain: ... pins Node`**: `.node-version`, `.nvmrc`, `.tool-versions` and `engines.node` disagree; set them all to the same release.
- **`client:i18n` fails with a stale catalogue**: a message changed in code. Run `pnpm --filter @eventiva/client exec formatjs extract 'src/**/*.tsx' --format simple --out-file lang/en-GB.json`.
- **The web smoke cannot start Chromium**: run `pnpm exec playwright install --with-deps chromium`.
- **A lint error names a dependency constraint**: the import crosses a type or layer boundary. Move the code to a package the importer may use instead of relaxing the rule.
- **A lint error reports a circular dependency between platform packages**: the import points back down the chain `runtime` -> `schema` -> `contracts`. Move the shared piece into the lower package.
- **`invoke` fails with `Forbidden` in a new composition root**: the `Authorizer` you provide does not grant the action's `permission` to the current `Caller`.
- **`register` fails with `InvalidModule: declared but not provided`** (or `provided but not declared`): the manifest's `actions` or `resources` list does not match what the module supplies.
- **`register` fails with `UnknownTarget`**: a contribution names a resource no registered module declares. Register the owning module first.
