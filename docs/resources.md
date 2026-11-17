# Central resources (EVE-258)

Resources provide a typed, database-neutral access boundary for feature modules. This increment adds declarations, compatible optional field contributions, bounded equality queries, atomic writes and immutable schema/record history. It does not activate resources in the server, replace the existing Storage contract or complete device storage, synchronization, field-designer or EVE-42 scope.

## Declare and compose resources

Import `Resources`, `declareResource` and `contributeFields` from `@eventiva/contracts/resource` in a feature. Declare an exact numeric module version such as `1.0.0`. Resource schema versions are separate positive integers. Module/resource/provider identifiers use lowercase segments separated by dots or hyphens; provider identity is `{ key: { module, instance }, version }`.

Declare fields using `text`, `integer`, `boolean`, `decimal`, `uuid` or `timestamp` and an explicit `optional` boolean. Integers are JavaScript-safe integers, decimals are exact strings preserving scale, UUIDs are application-generated v7 and timestamps are integer epoch milliseconds from year 1 through 9999. There are no SQL expressions, connection URLs, executable validators or implicit conversions in a declaration. Unknown fields and explicit `undefined` values are rejected.

Contribute only new optional fields. Contributions retain their original module/version owner. Collisions, removal, retyping, changing optionality or ownership, skipping schema versions and adding required fields are refused. A resource's original module version is an immutable creation pin, not the current kernel module version. Keep every prior schema declaration when assembling migration history. Resource schema versions and record revisions are bounded to signed 32-bit positive integers for both adapters; an update at revision 2147483647 is refused rather than overflowing.

Read the compiling [composition example](../ai-docs/src/18_resources/01_resource.ts). The privileged composition root prepares declarations and migration policy, then binds the provider; feature handlers receive only Resources:

```ts
import { Resources } from '@eventiva/contracts/resource';
import { Effect } from 'effect';

// contacts is the active composed resource declaration, not an independently mutable registry.
const read = Effect.gen(function* () {
    const resources = yield* Resources;
    return yield* resources.query(contacts, {
        where: { field: 'name', equals: 'Example' },
        limit: 20,
    });
});
```

The existing `@eventiva/schema/resource` format is not silently reinterpreted. Its compatibility adapter, shared exports and root gate integration belong to the coordinated integration window. Until those exports are installed, isolated verification uses temporary local aliases only.

## Bind one authenticated tenant and provider

Install only the pinned approved workspace dependencies. Run the existing numbered Storage migrations first, then resource migration admission outside any transaction. Pass the scoped approved PostgreSQL or Node SQLite SqlClient to `resourceProvider`; it captures that exact client and constructs EVE-42 Storage on it. The SQL adapter imports contracts, never runtime. `resourceRuntime(provider, authorize)` imports contracts, never SQL. App composition connects the two Layers; no reverse Nx dependency exception is needed.

Authenticate before `TenantRouter.run`. The trusted router resolver returns `provider.storage`; build `durable` against that same Storage and provide the matching Resources Layer inside the tenant route. Every resource read, query, history, write and transaction rechecks live Caller, CurrentTenant and the injected resource authorization callback. A mismatched tenant or revoked permission is a failure, not an empty result. Policy callbacks must enforce and audit the required access before returning success; this substrate does not implement field-level redaction, approval, protected-key release or mandatory access-audit policy on their behalf.

Each database is permanently bound to one tenant. Named provider instances may coexist, but cannot inherit each other's transactions. The pinned Effect SQL client uses a global transaction connection tag: the resource adapter explicitly refuses foreign or unowned ambient transactions instead of changing databases or pretending to preserve atomicity. Use `provider.storage.transaction` or Resources.transaction to open an owned transaction; an independently constructed Storage/raw SQL transaction is not a supported outer boundary, even when it appears to target the same database.

The runtime's validated active catalogue stays private. Each request is validated and compared canonically with that catalogue; drivers receive the detached, equal request definition, never the retained catalogue entry. Changes a query or write adapter makes to its argument cannot make later legitimate declarations fail or admit a widened declaration. This isolation changes no provider/driver contract or configuration default, and does not make an arbitrary driver trustworthy for persistence.

For example, if an adapter makes required `title` optional and adds `secret` to its argument, later calls with the real declaration still succeed. A create using the altered declaration and `{ secret: 'smuggled' }` fails with `schema-mismatch` before the driver can store a record or revision. Current get/query/write results still pass the active field decoder; retained history remains undecoded.

Use Integrity.commit through the existing `durable` runtime for action mutations. Its execute effect and nested Resources writes share the provider's transaction: resource data, revisions, operational history, outbox, idempotency and success receipt commit or roll back together. Never open another client or detach work inside that effect. Independent providers cannot form a distributed transaction.

## Queries and retained data

`get(resource, id)` returns a record or `undefined`; `create(resource, id, value)` requires absence; `update(resource, id, expectedRevision, patch)` uses compare-and-set and preserves untouched fields. A conflict is a typed failure, not permission to force a write. Every write appends immutable history. `history` returns original values and schema versions, not coerced current objects. There is no feature delete, drop, reset or down-migration operation.

`query` accepts only the following options:

| Option  | Default   | Meaning                                                         |
| ------- | --------- | --------------------------------------------------------------- |
| `limit` | Required  | Integer from 1 through 100.                                     |
| `where` | No filter | One declared field with an equality value of that field's type. |
| `after` | Beginning | Exclusive UUIDv7 record-id cursor; results sort by id.          |

Values are bound parameters, not interpolated SQL. This increment stores extension values as JSON text; equality predicates scan the selected resource's payloads. There are no field indexes, joins, projections, arbitrary sorting, aggregation or decimal arithmetic. Exact decimals compare their preserved string representations. JSON extension payloads are not typed canonical/device tables. PostgreSQL and Node SQLite share these semantics; MySQL and device SQLite remain future adapters.

## Share a resource and hook transaction

Use `resourceHookProvider(dialect, tenant, identity, definitions)` from `@eventiva/integrations.sql/resource` when a resource mutation must stage a hook fact in the same durable commit. All four arguments are required, with the same meanings as `resourceProvider`; there is no automatic activation or policy default. Supply the existing scoped `SqlClient` and authenticated `CurrentTenant`, whose ID must equal `tenant`. Migrate the storage and resource schemas first, outside any ambient transaction.

The result is a normal resource provider plus `outbox`. Give that exact provider to `resourceRuntime`, its `storage` to durable Integrity, and its `outbox` to `HookOutbox`. The compiling `ai-docs/src/18_resources/01_resource.ts` example includes `writeAndStage`: it commits the resource write and typed, trusted metadata together. Use the same Storage `commit` boundary for durable receipt/idempotency replay. Failure escaping the transaction rolls back the resource, immutable revision and staged fact together; successful replay does not rerun the originating write.

Do not nest an independently constructed `resourceProvider` and `hookStorage`, even on the same client. The shared composition captures one private root identity and checks the actual ambient connection before entry; another root or raw SQL transaction remains foreign. Constructing providers or running migrations inside an existing transaction is also refused. Claim and settlement run only after commit, outside every SQL transaction. This composition grants no release permission, service principal, approval, generation provenance or observer execution authority. Keep the hook flag default-off and release/sink default-deny until trusted composition supplies them.

## Plan and apply forward-only evolution

Call `planResourceMigrations(history, policy)` for admission. Policy has three required fields with no defaults: `kind` (`additive` or `staged`), `restartRequired` (boolean) and `retainedGenerations` (nonnegative safe integer). Retained generations, declared restart, staged execution and incompatible evolution return `restart-required` before SQL acquisition or mutation. The kernel must reject active workflow leases before invoking migration; a supplied count is not distributed lease fencing.

Kernel MigrationDeclaration remains exactly `{ id, kind, online }`. It is metadata, not proof that database migration is safe. Translate resource preflight into kernel admission explicitly. Installation executes no SQL in kernel validation; privileged orchestration applies an approved migration only after admission and returns its evidence.

`migrateResources(dialect, tenant, completeHistory, policy)` replans and verifies the immutable applied prefix under a transaction/migration lock. Evidence contains `id`, SHA-256 `checksum`, `resource`, `from`, `to`, previous-version `dependencies`, `kind: 'additive'`, `online: true`, `compatibleFrom: 1` and `compatibleThrough`. The database stores the immutable canonical declaration/checksum from which that evidence is reconstructed. Missing or modified applied history fails. Retrying the same history applies nothing twice. Database triggers reject record-history/schema-history mutation. Additive migrations preserve old records without backfill; stale resource generations cannot write after the active schema advances.

The PostgreSQL/SQLite conformance test rejects version 3 only after version 2 is visible inside the same migration attempt. The resulting `storage` failure must leave the original schema definitions/checksums, records and revisions intact, with the old provider still usable. Removing that fixture-only failure permits a retry applying exactly versions 2 and 3; repeating it applies nothing, and stale writers remain fenced. This proves SQL-error rollback/retry, not migration process-crash or power-loss recovery.

### Verify migration process-loss recovery

After building the public packages and starting the approved disposable database from [Storage conformance](storage.md#run-conformance), run:

```sh
pnpm nx run @eventiva/storage-tests:migration-proof --skip-nx-cache
```

This independently executable, uncached target builds the required packages and runs `node tests/storage/fixtures/resource-process.mjs migration-proof sqlite`, then the same command with `postgres`. The existing storage `test` target depends on it, so `node --run verify` and the existing CI test gate execute the assertions without changing the transaction-process parent spec. The PostgreSQL URL uses the existing `STORAGE_TEST_POSTGRES_URL` fixture setting and disposable-loopback validation; a missing fixture fails rather than skipping that dialect. There are no new options or runtime defaults. For a SQLite-only development probe, build the public packages first and run the first Node command directly; that is not both-dialect acceptance.

The mode seeds two v1 records with different values and revision counts. A migration child pauses with v2/v3 declarations written inside the real public `migrateResources` transaction. Another connection sees only the exact v1 definitions/checksums and unchanged record/revision rows. After SIGKILL, a new process verifies that same state; an old-provider write succeeds. Retrying the complete history applies exactly v2 and v3. A separate SIGKILL after commit but before acknowledgement retains both versions and every original record/revision. A third worker reopens and repeats the history twice, applying nothing. A valid but edited applied prefix fails with `unsafe-migration`, a retained v1 writer fails with `schema-mismatch`, and a freshly composed v3 writer succeeds without rewriting historical revisions or the unrelated record.

Assertions run before the success report and fail the target on disagreement. The report includes distinct worker PIDs, actual SIGKILL exits and the six asserted outcomes. Fixture-only transaction barriers delegate the production migration implementation and its connection; no production failpoint or alternate migration engine is added. The original `proof` mode still reports `migrationCrashProof: false` because its migrations finish before its record-transaction crashes. The separate mode proves local declaration migration process-loss recovery only, not power-loss durability, distributed migration/lease fencing, native-device execution or production least privilege. EVE-258/EVE-42 and the broader G04 acceptance remain open.

Use a privileged migration role separately from runtime credentials. Runtime roles must not own tables, truncate, disable triggers, DDL or alter schema history. These functions do not create roles or grant privileges. SQLite's file owner remains a trust boundary. A database owner can bypass triggers; this is not cryptographic tamper evidence. PostgreSQL migration locks briefly block resource writers; schedule migration under the kernel admission/drain gate and keep transactions short. Deactivation/unregister only closes active registration, never removes stored definitions or records. Recover by verifying history and repairing forward, not by down-migrating or replaying an edited declaration.

## Verify and integrate

Use the approved disposable PostgreSQL fixture procedure and expiry in [Storage conformance](storage.md#run-conformance); set `STORAGE_TEST_POSTGRES_URL` securely. Resource tests refuse remote hosts and databases other than the disposable `eventiva_test` administration database. SQLite uses fresh in-memory databases; it is not an Android/iOS run.

Run the resource Vitest project and TypeScript configuration under `tests/resources` using the coordinated package exports. Independently run `node tools/resources/boundaries.mjs` and `node --test tools/resources/boundaries.test.mjs tools/resources/types.test.mjs`. The checker follows TypeScript-resolved aliases, relative imports, re-exports, type-only dependencies and static dynamic imports from `type:extension`/`type:feature` projects or feature/extension directories. It rejects privileged SQL/backend connections, ResourceDriver/ResourceProvider access and nonliteral module loads. Its separate resource-rooted graph rejects cycles and reverse contracts/runtime/SQL edges; direct/indirect alias/type-only cycle negatives and a shared-contract diamond positive test it. Compiler fixtures independently reject missing required fields, wrong primitives, uncorrelated query values, unknown query fields, SQL escape and treating a partial decoder as a full record. Root `verify` and CI invoke these commands and audit built public declarations; the dependency-free house `check` stays separate. Static source boundaries are not an executable third-party sandbox.

Resource declarations enter through the concrete `ResourceDefinition` contract. Record decoding accepts `ResourceInput`, a JSON object whose values may also be `undefined` so exact optional-field rejection can be tested and enforced; undefined, null, nested data and wrong primitives are never coerced into resource values. Transport adapters decode their untrusted envelopes with Effect Schema before calling these concrete APIs. Private generic decoders bind input to the supplied schema's encoded type. Field templates are copied and validated before publication; full and partial codecs refine copied scalar records against the complete strict dynamic field schema. No generic assertions restore output types. The precise ResourceFailure constructor annotation retains the pinned tagged error behavior without exposing its vendor open generic in declarations.

The owned resource source, tests and emitted resource declarations are checked for explicit erasure, unsafe assertions, non-null assertions and suppressions. Type fixtures preserve required/optional fields, exact error/environment types, schema field algebra and yieldable errors. Missing-service tests clear the live fiber Context with the supported FiberRef API while retaining type-safe outer provisioning. Existing reachable baseline violations remain outside this increment and must be remediated by their owners, not grandfathered. The resource-rooted graph is not the required whole-workspace Nx plus TypeScript-resolved graph, including exported declarations and generated entrypoints; integration remains blocked on those coordinated gates. The coordinator owns `tools/resources/boundaries.mjs` and its graph fixtures; resource codec changes require no change to them.

Common failures: export resolution requires the coordinated three subpaths; do not add a second alias in production. `schema-mismatch` requires recomposing against the applied current declaration, not forced writes. `unsafe-migration` requires preserving the applied history or a separately reviewed staged protocol. `denied` requires fixing trusted authentication/routing/policy or removing a foreign transaction boundary. A missing local PostgreSQL fixture is a failing check, not a reason to skip conformance. ResourceFailure retains only redacted internal causes; public error serialization must not unwrap them.

No server wiring, new runtime feature activation, ingestion, dependency, external database or deployment is included. The safe default remains unconfigured/unavailable until the app composition and its existing feature policy explicitly supply the service.
