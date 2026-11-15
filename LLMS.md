<!--
  Generated from ai-docs/src by tools/ai-docs/docgen.mjs. Do not edit by hand:
  edit the sources and run `node tools/ai-docs/docgen.mjs`.
-->

# @eventiva/eventiva for agents

Guidance for an AI agent working on or with this repository, assembled into one
file so it can be read in a single pass. Each example is a real file under
`ai-docs/src`, kept compiling by the repository type check. The people-facing
documentation covers the same ground in plain words; see the README.

---

## House standards

Every Resnovas repository follows the same standards. This section is synced from
[`Resnovas/.github`](https://github.com/Resnovas/.github); the rules come from
`AGENTS.md`, `CONTRIBUTING.md`, `AI_POLICY.md` and the PostHog skill
`coding-preferences`, and those documents win if this summary ever disagrees
with them. The sections after this one describe this repository itself.

### Code

- **Effect-TS v3 first.** TypeScript is the primary language, written with
  Effect v3: services as `Context.Tag` with `Layer`s, `Effect.gen` for
  sequencing, `Schema` to decode anything from outside the process. Load the
  PostHog skill `coding-preferences` and its `effect` reference before writing
  Effect code, and look up current APIs with Context7 rather than from memory.
- **Strict TypeScript, never `any`.** Keep `strict` on. Decode unknown input
  with `Schema` instead of casting it.
- **Typed errors.** Model failures as tagged errors (`Data.TaggedError` or
  `Schema.TaggedError`) in the error channel, so a caller sees every way a call
  can fail. Do not throw for expected failures.
- **Secrets through `Config` and `Redacted`.** Read configuration with
  Effect `Config`, and hold every secret as `Redacted` (`Config.redacted`)
  until the boundary that needs its value. Never put a secret in source, logs,
  telemetry, command-line arguments, issues or pull requests.
- **PostHog telemetry and feature flags.** Every app ships PostHog feature
  flags; new behaviour goes behind a flag with a safe default in code, never
  behind an environment variable or configuration toggle (house skill
  `feature-flags`). Telemetry events carry no secret or personal data.
- **Module boundaries.** The core package holds domain-agnostic building
  blocks only. Vendor SDKs and API clients live in
  `@resnovas/integrations.<vendor>`. Features depend on core and
  integrations, never the other way round (`AI_POLICY.md` AI-13).
- **Comments explain why.** Constraints, trade-offs and anything surprising;
  never a restatement of the code.

### Tests

- Write tests with `@effect/vitest`. Line and branch coverage never falls
  below 90%, and most repositories hold 100%.
- **Never delete, skip or weaken a test** to make a change pass: fix the code
  (`AI_POLICY.md` AI-11). A flaky test is a bug to fix, not to retry away.
- Every bug fix comes with a regression test that fails before the fix.

### TypeScript

- Effect-TS v3 is the foundation of all production TypeScript, in every
  repository (house skill `coding-preferences`, `references/effect.md`).
  Anything that does IO, can fail, reads configuration, retries, runs
  concurrently or holds a resource is an `Effect` with `Data.TaggedError`
  failures, services as `Context.Tag` classes behind a `Layer`, input through
  `Schema`, configuration through `Config`, tests with `@effect/vitest`, in
  the shape of the module's existing code.
- Raw Promise code (`async`, `await`, `try`/`catch`, `throw`, `new Promise`,
  `.then`) lives only at a vendor boundary inside an integration module, in
  the one `Effect.tryPromise` or `Effect.try` that wraps the vendor call,
  marked with `// effect-boundary: <reason>` on the line above. The commit
  hook refuses it anywhere else in added source lines, and refuses `any`.
- A pure function with no IO and no failure path stays plain TypeScript. A
  whole feature in plain TypeScript is never an agent's decision: it is a
  house-rule override only the accountable human gives, by naming the rule.

### Files

- Every source file carries the FCL-1.0-MIT licence header from
  `tools/license/header.txt`, with its own path on the second line and the
  current year. `node tools/license/check-headers.mjs` (the `headers` package
  script) verifies it and `--fix` writes it; synced house tools carry none.
- ASCII hyphen-minus only in text an agent writes: no em or en dashes, and no
  emoji in titles or descriptions (house skill `no-em-or-en-dashes`,
  `AI_POLICY.md` AI-09).

### Commits and pull requests

- Conventional commits (`type(scope): summary`, imperative mood), one logical
  change each, and every commit signed off for the Developer Certificate of
  Origin with the commit author's name and address. An AI tool never signs off
  (`AI_POLICY.md` AI-03).
- Every commit an AI tool materially changed carries one `Co-authored-by`
  trailer per tool naming the tool and the model at the tool's attribution
  address (`AI_POLICY.md` AI-02); the commit author and the sign-off are the
  accountable human. No "Generated with" footer, robot emoji or host session
  line (house skill `commits-and-rd-evidence`). `tools/dev/commit-check.mjs`,
  installed as the commit-msg hook by setup, refuses a commit that breaks
  these rules.
- A pull request an agent opens is a draft (`AI_POLICY.md` AI-20) and states
  `AI level: autonomous` and every tool and model used (AI-01); the
  accountable human fills in `Accountable human` and `Human review` when
  marking it ready (AI-21). No "Generated with" footer or session link.
- One pull request per batch of work: one stacked branch per issue, each
  squashed to one conventional, signed-off commit naming its issue, all opened
  as a single pull request. Once a maintainer approves it, it lands as an owner
  fast-forward (its signed commits pushed onto the default branch unchanged),
  so each issue keeps its own commit; the merge queue squashes, because GitHub
  cannot sign rebased commits. Run the full gate locally first; CI is not the
  debugger.
- Deterministic gates (the repository's checks and the `smartcloud` check)
  decide a merge. AI review bots are advisory.
- Releases are cut by the synced house release workflow from `release.config.json`
  at the repository root (what the repository ships: bundles, apps, the major
  tag, error tracking project, npm package); the tools under `tools/release/`
  are synced too. The workflow runs on every push to the default branch and
  releases when the conventional commits call for it (before the first stable
  `v*` tag, the `firstRelease` version); never add a release that needs
  starting by hand. Never run `nx release` without `--dry-run`; the workflow
  is the only release path.

### Document everything twice

Every change to a feature, option, preset or workflow updates both kinds of
documentation in the same commit:

- **ELI5 docs for people.** Plain words and short sentences; what it is and why
  you would want it before how; step-by-step setup; one complete example; what
  you will see when it runs; every option with its default; common problems
  and their fixes.
- **ai-docs for agents.** The sections under `ai-docs/src`, with compiling
  examples in the codebase's own style. `LLMS.md` is generated from them by
  `node tools/ai-docs/docgen.mjs` and checked in CI with `--check`; never edit
  it by hand.

---

## Eventiva enrollment and reset boundary

EVE-243 enrolls the house preset through `.github/smartcloud.yml`. Enrollment supplies no application test, coverage, deployment or release target; the EVE-244 foundation (section 11) supplies the application and its tests. Never add a passing placeholder.

Run `pnpm install --frozen-lockfile`, `node --run setup` and `node --run check` with Node from `.node-version` and pnpm from `package.json`. Check validates toolchain pins, agent-file drift, local commit-hook installation, licence headers outside `Examples/` and generated `LLMS.md`. CI's `house check` job runs the same gate without a commit hook. Regenerate agent mirrors with `node tools/dev/surfaces.mjs sync` and this document with `node tools/ai-docs/docgen.mjs`.

Read `docs/smartcloud-enrollment.md` for sources, the pre-apply dry-run effects, supported CLI route, idempotence checks and the external administration blocker. Published Smartcloud 2.0.0 is not usable; the documented source build at `61eedd655f31d7e1f511f85bbb6621ab6454d465` starts and runs validate, plan, dry-run and local sync. CLI sync merges against remote default-branch files, not a dirty local tree. Preview first.

Eventiva extends `Resnovas/.github/smartcloud/house-base.yml@main`, not `house.yml`, under a temporary owner-approved exception (EVE-243, revisit in EVE-248). The base preset leaves out the two ruleset gates that spend AI credits, Code Quality and Copilot review. Keep `sync.values.HOUSE_PRESET: house-base.yml` and `settings.ruleset.copilotReview: false` after the `house:local` line until EVE-248 removes them. Never set `codeQuality` or turn Copilot review on without the owner's budget approval. Do not re-add the `Examples/cluster-docker` gitlink, which broke every checkout.

Preserve all `house:local` content. Coding agents deliver straight to `main` under the owner's existing exception in `AGENTS.md`, including where synced governance describes the generic PR path. The house ruleset retains an administrator `always` bypass (repository role 5). Standard house sync/Graphify bot PRs are not coding-agent delivery. A token's admin user role is not proof of administration scope; HTTP 403 or restricted-mode skips leave enrollment incomplete.

Canonical governance is Markdown; obsolete root AsciiDoc compatibility links have been removed. Canonical owners/funding live in `.github/`. `Examples/` is historical reference only, excluded from workspace discovery, Graphify, CodeQL and licence checking. Never initialize its private tests gitlink during setup, run its old active checks or treat it as an implementation baseline.

Enrollment introduces no runtime behavior or feature flag: it is repository governance and CI configuration. Application APIs and examples are in section 11.

---

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

---

## Action inventory and runtime host (EVE-40)

Canonical human documentation: `docs/actions.md`. The compiled module example remains `apps/server/src/status.ts`; runtime integration/negative examples are compiled under `tests/runtime/src/{execution,parity}.spec.ts`.

Portable API:

- `@eventiva/contracts/action`: `ApprovalPolicy`, `Risk`, and specification fields `approval` (default `none`), `risk` (default `routine`), `sensitive` (default `false`). Existing required version, schemas, description, permission, sideEffect and offline fields remain.
- `@eventiva/contracts/inventory`: `ActionInventory`, `ActionMetadata`, `SurfaceAction`, `validateDefinitions`, `validateInventory`, `validateParity`; typed `InvalidActionDefinition`, `DuplicateAction`, `InventoryParityError`. Discovery also fails with portable `Forbidden` for invalid identity.
- `@eventiva/contracts/receipt`: portable `Receipt` schema/type for callers and audit consumers without importing the backend runtime.
- `@eventiva/contracts/json-schema`: `Provider` (`anthropic`, `openai`, `google`), `ProviderSchema`, `make`, `UnsupportedSchema`. Structural Effect AST compilation only. Flattened object composition, homogeneous arrays, nested homogeneous literal enums and accepted refinement annotations are supported. Root tool inputs must be objects. Root unions, arbitrary nested unions, transformations (including NumberFromString), recursive schemas, records, tuples, unannotated filters and unsafe annotation keywords fail explicitly. Do not use encodedSchema to silently erase post-transform validation. Runtime invocation retains EVE-23 transforming-schema support, but such schemas cannot be advertised in provider profiles. Keep provider-facing DTOs within the structural subset. Optional properties remain optional; OpenAI strict mode is not implied. Snapshot tests do not claim live provider certification.

`ActionHostLive` supplies both `ActionHost` and `ActionInventory` over one live scoped registry. It requires `Flags | Authorizer | IdentityResolver | InputDigest | ExecutionPolicy | Approvals | Audit | Integrity`. Inventory refreshes identity and filters current coarse permissions and flags per caller; discovery does not replace resource authorization. Never keep a separate agent inventory or privileged invoke implementation.

`host.execute(action, input, options?)` requires a per-call `Caller` and returns `{ result: Exit, receipt, replayed, audit: 'durable' | 'spooled' }`; `AuditUnavailable` is an outer failure, not a receipt-free success. `invoke` projects the same execute path to the output/error. Receipts contain invocation id, resolved caller, action/version, canonical input digest, outcome, start and duration, never raw input or approval tokens. The app supplies SHA-256 or stronger via `InputDigest`; the runtime canonicalizer sorts keys, preserves array ordering and rejects non-JSON values. Input decode rejects excess wire keys. Declared handler failures encode as `ActionFailed`; defects and interruptions stay distinct and are audited.

Execution: refresh trusted identity/delegation; resolve current registration and flags; coarse permission before decode; strict decode; resource permission; canonical input hash; live ExecutionPolicy; timing, state/version, dependency and capacity gates; approval floor/binding/limits; protected audit availability; read handler or A1 integrity transaction; durable receipt. The mutation callback repeats live gates inside the transaction after lock waits. Replays repeat gates before returning and get a fresh invocation receipt. A new mutation returns exactly its transaction-committed successful receipt.

Untrusted `InvokeOptions` defaults: mode `online`; all other fields absent. Writes/external actions require nonempty idempotencyKey, maximum 512 characters; approvalId is an opaque trusted-store lookup reference with the same length bound. `notBefore` and exclusive `deadline` are finite nonnegative epoch milliseconds. Scheduled work requires both. Live-production work requires deadline. Financial and live-production risks reject offline intents even with weaker specification metadata. Guarded nonroutine offline intents require expectedVersion, expectedState and deadline. Expected values are checked against trusted live state, including on replays. Offline-intent is online processing of a queued intent, not an offline queue or authoritative offline success. Domain features/storage retain immutable baseline versus live forecast; the runtime does not create a scheduler or database.

A2: direct human routine reversible writes need no second confirmation. Agents need confirm unless trusted policy preauthorizes the bounded routine operation. Specification policy, nonroutine risk (`always`) and tenant policy combine by maximum strength. Only human approvals are accepted; no agent self-approval. Bind principal, tenant, action/version, canonical input/exact batch items, live numeric limits, issued/expiry time and required step-up. ExecutionPolicy derives bounds from decoded input, not transport assertions. Tenants, flags and offline mode never weaken safeguards.

`@eventiva/runtime/invocation` owns the service/error/result contracts and `FailClosed`. A1 `Integrity.commit` must serialize duplicate keys and atomically commit domain mutation, dedup result, transition/append-only history, outbox and successful receipt; handlers' storage services must join the same transaction. Roll back on failure, defect or interruption. External handlers stage outbox commands instead of executing an untracked irreversible provider effect. Preserve high-integrity deduplication evidence for the business-record lifetime, not a short universal TTL.

A4: `Audit.ready` checks protected availability; `Audit.record` persists or, only for low-risk reads, appends to a durable capacity-bounded local spool and returns visible `spooled` degradation. Mutations, sensitive and privileged reads never spool. Exhaustion fails closed. Recovery deduplicates receipt ids and drains exactly once. No best-effort audit. The server shell has no durable adapter: it supplies its process-owned identity, deny-by-default grants and SHA-256, validates inventory and reports Cluster unavailable without invoking a business action. Every executable deployment uses the common Node Cluster composition documented in `docs/cluster.md`; no local invocation fallback. Do not wire a memory fallback to make smoke appear successful. Storage implementation (EVE-42), provider selection (EVE-43) and feed delivery (EVE-45) are excluded.

`@eventiva/runtime/testing` exports explicitly volatile `makeTestOnlyHarness`, `TestOnlyLedger` and `testOnlyDigest`. It models staged transactions, dedup races, audit outage/spool/recovery and live revocation for tests only. Never supply its TestOnly layer in production. Test behavior through public host operations, not private helper order.

Run `node --run parity` or Nx target `@eventiva/runtime-tests:parity`. It checks the current server module's canonical metadata and actual authorized dispatch, live discovery and typed incompatibility controls. Every new registered surface must use validateParity with explicit required surface names, exact canonical ids, versions and permissions; omitted surfaces/actions, extras and duplicates fail. Protocol transports are not implemented by EVE-40. `verify` and CI's required `application check` include parity; root dependency-free `check` remains application-dependency-free. Security invariants are not feature flags; new optional capabilities still use the existing safe-default manifest flag mechanism.

---

# SQL storage increment

EVE-42's first increment is SQL-only, not completion of deferred Drizzle/device-sync scope. Read `docs/storage.md` and `docs/neon-storage.md`. Portable storage/capability and machine contracts occupy distinct subpaths; driver clients remain in `@eventiva/integrations.sql`. PostgreSQL/Neon and in-memory Node SQLite share conformance; Node SQLite is not device storage.

Authenticate before `TenantRouter.run`. Inject a trusted resolver and an authorization callback that also audits current control-plane access; no caller-supplied URL, cross-tenant operational query or tenant ID in isolated database primary keys. Build the runtime `durable` layer inside that tenant scope and use the same Storage service in handlers. Do not wire server main until a separate durable integration is accepted.

Persistence seam v1 is the existing `Storage.commit` result/replay contract, operational `compareAndSet` with leases and atomic transition history, and `enqueue` outbox staging. No second workflow abstraction is needed. `client` from `@eventiva/integrations.sql/postgres` already supplies upstream `SqlClient.SqlClient` and `PgClient.PgClient`; share one layer instance with `storage('postgres')` and trusted SQL consumers only when database/role routing intentionally matches. The tenant router does not expose a raw SQL client. Within the tenant route, provide `durable` to ActionHost and retain that same Storage for handlers: commit's execute effect runs inside its captured client's transaction, including nested Storage operations. Do not capture another client, replace Storage or detach work. Transport transactions are not implicitly atomic with business actions.

Migration locks are transaction-scoped `pg_advisory_xact_lock`; runtime locking is row/transaction based, with no session advisory locks or `LISTEN`. Transaction pooling does not preserve backend session identity between transactions. Upstream runner lease-row ownership, polling and message storage require their own compatibility verification; installed cluster packages alone do not prove sharding/recovery. Keep migration/direct and runtime/pooled privileges separate. See `docs/storage.md` for exact v1 composition and boundaries.

Integrity serializes scoped keys and atomically stores domain/history/outbox/dedup/success receipt. Audit persists or fails closed; no spool is implemented. External actions enqueue commands, never call providers inside a SQL transaction. Runtime revalidates live gates after waiting and before replay. Conflicts are visible typed failures, not authorization for force writes. Exact money/decimal values are strings, quantities/versions safe integers, times epoch milliseconds, UUIDs application-generated v7. Typed raw canonical/device records remain distinct from JSON projections; device migrations and PowerSync are deferred.

Use forward-only exact-byte SHA-256 migrations and the protected database applied ledger. Git-based root policy is dependency-free and guards review history; deployment must additionally export the trusted applied ledger for `tools/storage/guard.mjs`. Runtime roles must not own/DDL/truncate/disable triggers or modify the migration ledger. Expand, retain old-client compatibility, then approve contraction after isolated restore rehearsal. Never weaken the guard or pnpm build policy.

Production direction is one Neon PG17 project per tenant in AWS London, not branches. Use verified TLS, direct migration credentials and separately tested pooled ordinary SQL. The only authorized remote test target is the synthetic London development project described in `docs/neon-storage.md`; secure credentials and quota measurement gate execution. Historical Frankfurt is protected. Replication is disabled and separately gated because enablement is irreversible and connected subscribers prevent scale-to-zero. No paid infrastructure, provider service, ingestion or feature activation is introduced, so this library increment has no new runtime rollout toggle.

Bounded Neon development validation passed 16 direct/pooled connectivity, verified-TLS/hostname-rejection, migration, atomicity, rollback, concurrency, routing-denial and exact-value checks using the owner's explicitly authorized existing full-access test secret. Scratch schema was removed and clients closed; no credentials or grants changed. This exception is development-only, not a production least-privilege configuration. Role metadata matched the supplied restricted roles, but `SET LOCAL ROLE eventiva_test_migrator` failed with 42501 before the effective-role/RLS probe could run; do not claim that probe or independent role authentication passed. Before/after project usage counters did not advance despite real writes, so attributable consumption and autosuspend remain unverified. EVE-42 and cluster Phase B delivery/recovery are not established by these provider checks.

The owner accepted the exact pinned PG17.12 Bookworm image's residual scan findings for disposable synthetic local/CI tests only, expiring 2026-11-22 UTC or earlier on a relevant exploit/input/fix/rebuild trigger. The scan remains 4 critical/140 high/231 medium/190 low/11 unknown, with no suppression or production waiver. Follow `docs/storage.md`: dedicated bridge network, loopback only, SCRAM with generated per-run test credentials, non-superuser CREATEDB fixture login, bounded resources/time and complete teardown; no host networking, privileged mode, unrelated mounts, cloud credentials or unreviewed inputs. CI fails closed on expiry and PR/dispatch events rather than skipping conformance. Trixie is not approved; later image acceptance must address event coverage and the outstanding findings.

### Commit an action with its outbox command

Provide the same tenant-scoped Storage service to Integrity and handlers.
The runtime supplies the validated successful receipt and rechecks live gates.

```ts
import type { Receipt } from '../../../packages/contracts/src/receipt.ts';
import { Storage } from '../../../packages/contracts/src/storage.ts';
import { Integrity } from '../../../packages/runtime/src/invocation.ts';
import { Effect } from 'effect';

export const stage = (receipt: Receipt & { readonly version: number }) =>
    Effect.gen(function* () {
        const storage = yield* Storage;
        const integrity = yield* Integrity;
        return yield* integrity.commit(
            {
                key: 'example:invoice:1',
                inputHash: receipt.inputHash,
                caller: receipt.caller,
                action: receipt.action,
                version: receipt.version,
            },
            Effect.gen(function* () {
                yield* storage.enqueue('invoice:1', {
                    type: 'send-invoice',
                    minorUnits: '9007199254740993',
                    currency: 'GBP',
                });
                return { output: { queued: true }, receipt };
            })
        );
    });
```

---

## Mandatory Cluster composition (EVE-252 Phase A)

Canonical Markdown: `docs/cluster.md`. Compiling examples and policy/protocol tests: `apps/server/src/cluster{,-profile,-actions}.ts` and `apps/server/tests/cluster.spec.ts`, included by `apps/server/tsconfig.spec.json` and its Vitest config. The tests reuse already-approved dependencies inside the owning server project without changing package/lock files or weakening Nx boundaries.

Use one Node composition for every edition: `clusterRunner(profile)` requires Effect SQL SqlClient plus registered ActionHost and trusted IdentityResolver. It supplies ClusterActions, ClusterStatus, Sharding and SQL transport services. Community defaults to one runner; cloud defaults to two and rejects fewer. No local/noop profile and no disable-Cluster flag. Existing action/module flags still apply. Shared/client contracts and `packages/runtime` remain Cluster/driver-free.

Decode DeploymentProfile before composition; `deploymentProfile` loads JSON from Config `EVENTIVA_CLUSTER_PROFILE`, default `{"edition":"community"}`. Full options/defaults and constraints are in the canonical docs. Topology changes do not spawn processes or autoscale. Same shard count/group layout across runners is required. Defaults bind/advertise loopback; raw runner sockets are internal-only, not authenticated public ingress.

ClusterActions.execute refreshes identity before routing a JSON tuple `[tenant-or-null, entityKey]`; the receiver refreshes it again, rejects tenant/address mismatch and invokes the existing ActionHost.execute path. Preserve per-entity concurrency 1 and explicitly persisted RPC annotation. Keep business idempotency separate from transport request identity: no business-key RPC primaryKey, because cached replies could bypass live replay authorization and changed-input detection. Fresh invocations enter ActionHost again; tests assert fresh receipts on business replay. Never expose cached transport reply lookup as a public result API. Route tenant databases only through authenticated CurrentTenant/TenantRouter, not shard ids or untrusted entity keys.

ClusterStatus.snapshot observes SQL registered membership, live probes, locally acquired shards, shutdown and active entities. Cloud with one responding runner is degraded. Storage failure is unavailable. Capacity fields describe configured weight/mailbox bounds and active entities, not measured spare capacity or an autoscaler. Upstream ping retries mean healthCheckMs alone is not a failover SLA.

Phase B dependency is EVE-42 landing, not a new portable persistence contract. Share its postgres client Layer with upstream SqlRunnerStorage/SqlMessageStorage and handler Storage. Construct @eventiva/runtime/storage durable inside authenticated TenantRouter scope; the same Storage.commit transaction must include handler writes, dedup, history, outbox and receipt. Do not fork transaction work. Existing CAS/lease/deadline operations are the v1 seam. No new workflow-storage abstraction is needed.

The runner selects shardLockDisableAdvisory=true (lease rows). Cluster still reserves a PG connection, so pooled transaction semantics require actual validation. Never infer pooled compatibility from EVE-42's transaction-scoped migration locks. Upstream SQL layers do startup DDL/legacy cleanup; bootstrap/runtime least privilege is unresolved. Entity registration is included, but transport acquisition and registration are separate; a startup/readiness barrier still requires SQL conformance before traffic admission. Membership/ping alone cannot certify hosted entity registrations. No direct route, SQLite-only support or production readiness is claimed. ClusterWorkflowEngine.layer needs BOTH Sharding and MessageStorage, and workflow recovery awaits Phase B.

Phase A main is only a validated module-registration diagnostic: unavailable, zero healthy runners, no local business invocation fallback. Test-only in-memory protocol/health tests are not independent-runner proof. `two-runners.mjs` forks distinct OS processes and checks actual shard snapshots and external signals only when supplied the Phase B real-SQL Dependencies bootstrap. Missing bootstrap is a failure, never a passing skip. That bootstrap and real PostgreSQL 17 recovery/business-mutation evidence are not delivered by Phase A. No EVE-18 archived code is integrated. Canonical docs name remaining tests and exact activation gates.
