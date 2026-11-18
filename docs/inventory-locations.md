# Tenant-private physical locations

This bounded [EVE-103](https://linear.app/resnovas/issue/EVE-103) checkpoint implements physical warehouse/zone/bin metadata under the owner-relayed [revision 10 packet and dispatch](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a). The broader ledger issue remains open. Locations do not assert ownership, stock, availability or emptiness. No archive/delete action exists: without the authoritative ledger query required for `LocationNotEmpty`, missing stock information is unknown, not zero.

## Compose without activating

1. Evaluate `locationResources` from `@eventiva/contracts/inventory-location`. Admit its `inventory.location` and `inventory.location-guard` declarations through the existing privileged Resources migrator/provider on an authenticated tenant route. No new physical migration is needed.
2. Bind the live Resources policy to that tenant provider. Permit these actions to mutate the location and graph guard; do not permit unrelated modules to bypass the graph lock with direct resource writes. The graph invariant depends on this exclusive mutation path.
3. Compose durable Integrity/Audit from the exact same provider Storage transaction owner. Sharing only a database URL or SQL client is insufficient. Provide live IdentityResolver, Authorizer and Flags, matching CurrentTenant and Resources, then evaluate `inventoryLocationModule` from `@eventiva/runtime/inventory-location` and register it on the common ActionHost. Supply Caller through the authenticated route per invocation, never through location input.
4. Keep `inventory.f6-inventory` default-off until separately enabled. Reuse this existing flag; do not create a second inventory switch. Enabling it grants no action/resource authority. Read/get/list require `inventory.location.read`; create/update require `inventory.location.write`. This dotted spelling is the current canonical permission grammar, not a second permission family alongside the historical issue label.

Importing either module registers nothing and grants nothing. All four actions are sensitive and online-only. The local ActionHost path is tested separately from provider discovery: intact strict bounded schemas still produce explicit `UnsupportedSchema` in `validateInventory`. Do not erase constraints or activate a shared discovery host on the assumption that local invocation proves provider parity. No HTTP/client, application-shell, UI or offline registration is included.

## Invoke metadata actions

| Action | Input | Output and defaults |
| --- | --- | --- |
| `inventory.location.create` | UUIDv7 `id`, `kind`, `name`, optional `parent` | Revision 1. Omitted/null parent means root. Existing ID conflicts; duplicate names are allowed. |
| `inventory.location.update` | `id`, `expectedRevision`, optional `name`, optional `parent` | Incremented revision. Omitted fields retain values; explicit parent null detaches. ID/kind cannot change. A no-field update still validates the graph and advances revision. |
| `inventory.location.get` | `id` | Strict current `{id, revision, kind, name, parent}` from the trusted tenant only. |
| `inventory.location.list` | Optional `limit`, `after`, `parent` | `{items, next}` ordered by UUID, exclusive `after`. Limit 1..100/default 50. Omitted parent selects all rows, null roots only, UUID exact children only. |

Kind is exactly `warehouse`, `zone` or `bin`. There is deliberately no parent-kind taxonomy: any of these kinds can parent any other if the graph is acyclic. Names must already be trimmed, nonempty and at most 200 UTF-16 code units. IDs/parents are lowercase UUIDv7. Update revisions are 1..2147483646; output may reach 2147483647, after which further updates fail closed. Extra tenant/owner/kind-update/quantity/archive fields are rejected, not ignored. Tenant routing is never caller input.

In an already composed authenticated host, use a fresh synthetic database for this complete sequence (the compiling agent example is chapter 31):

```ts
const warehouse = '019b0000-0000-7000-8000-000000000001';
const bin = '019b0000-0000-7000-8000-000000000002';
yield* host.invoke('inventory.location.create', {
    id: warehouse, kind: 'warehouse', name: 'Synthetic warehouse',
}, { idempotencyKey: 'location-example-warehouse' });
yield* host.invoke('inventory.location.create', {
    id: bin, kind: 'bin', name: 'Synthetic bin', parent: warehouse,
}, { idempotencyKey: 'location-example-bin' });
yield* host.invoke('inventory.location.update', {
    id: bin, expectedRevision: 1, name: 'Detached bin', parent: null,
}, { idempotencyKey: 'location-example-detach' });
const current = yield* host.invoke('inventory.location.get', { id: bin });
const roots = yield* host.invoke('inventory.location.list', { parent: null, limit: 25 });
```

Follow `next` until null, retaining the same parent filter. A full last page can require one final empty request. Filtering occurs before the page limit, so roots and exact children do not lose page slots to unrelated rows. Persisted parent is a declared text scalar: empty string represents root, all nonempty values strictly decode as UUIDv7. This is a feature-local encoding only; public input never accepts the empty-string marker, and Resources has no new nullable/unset behavior.

## Serialization, failures and recovery

Create/update first create or revision-CAS a fixed guard record in the tenant database, inside the existing Resources/Storage transaction. Only after acquiring it do they read the target/ancestors and write metadata. All graph writes for one tenant serialize, including disjoint target rows and first guard initialization across independent connections. Other tenants have independent databases/guards. The payload is constant; guard revisions/history provide fencing. No process-global or in-memory lock owns the invariant.

Follow exact ancestor IDs until a root, checking every persisted projection under live resource policy. Missing/foreign, corrupt, denied or repeated ancestors fail closed. The bound is 1024 ancestors; reaching beyond it refuses the operation rather than accepting a partially checked graph. This conservative bound, 200-code-unit name bound and four-attempt guard budget are implementation limits of this slice, not new stock/product policy. Rename-only writes revalidate retained ancestry too.

Only recognized guard initialization/CAS conflicts retry a rolled-back transaction, with at most three retries/four total attempts. Identity, flag, action permission and target policy are refreshed on transaction entry and after guard waits. A location revision conflict, policy failure, database error, deadlock/busy refusal or interruption does not cause an automatic mutation retry. Infrastructure uncertainty is not a reason to issue a new identity/key. Explicit recovery uses the original key and identical input; the durable host preserves the original committed result/receipt even if current metadata has since changed. Changed input with the same key is refused by the host.

Public domain failures are `LocationFailure` with reason `not-found`, `conflict`, `invalid-parent`, `cycle` or `unavailable`, wrapped as ActionFailed. Resource/policy/parser/SQL diagnostics never become public names or ancestor details. Host input/authentication/audit failures keep their finite platform outcomes. A refusal never acknowledges a successful metadata revision; transaction rollback also removes tentative guard/location history and the action commit. Reopen/get resolves uncertain delivery without inferring stock.

## Verify and troubleshoot

Run fixture-backed `pnpm exec vitest run --config tests/contracts/vitest.config.mts inventory-location.spec.ts --coverage.enabled=false` and the same filter with `tests/resources/vitest.config.mts`. The contracts project also includes SQL resource tests for coverage, so both commands need the approved disposable loopback PostgreSQL fixture from `docs/storage.md`. The normal full suites retain their coverage gates. Execute `node tools/documentation/check.mjs`, `node --run check`, `node --run verify` and `node tools/documentation/planning.mjs --check --require-reviewed` before delivery. Focused proof is in the reserved contract/resource specs.

`invalid-parent` can mean absent foreign parent or an exhausted complete-traversal bound, never permission to guess a root. `unavailable` after contention/SQLite busy is fail-closed, not universal multiprocess SQLite acceptance. PostgreSQL reverse/disjoint-cycle proof requires independent SQL clients, not parallel effects on one serialized connection. Keep stock/product/import/kit paths separate; this packet adds no quantities, movements, availability, compiler change, dependency, deployment or paid call. EVE-248 remains deferred until January 2027.

Ordinary public-host tests keep the existing SQL identity mutex intact. The dedicated graph race fixture replaces only that unrelated mutex with a no-op, retaining real SQL session/membership/grant resolution and independent SQL Resources/Integrity owners. Otherwise the identity mutex serializes before the location guard and hides a broken graph lock. This is a fixture-only isolation control, not a production identity policy or weaker runtime API. Concurrent first initialization, reverse edges and disjoint longer cycles must pass under this stronger graph-specific interleaving too.
