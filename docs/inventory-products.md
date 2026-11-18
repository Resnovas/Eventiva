# Private product catalogue backend

EVE-81's 2026-11-18 rank-1 packet authorizes a bounded private product backend before import commit. The [dispatch and guard approval](https://ampcode.com/threads/T-01a1edbf-8aca-7321-bd1e-e052e15ff66d) relays Jonathan's building approval through the [coordinating thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a). The broader issue remains open. No screen, kit, technical enrichment, public model publication, quantity, movement, valuation, availability or offline synchronization is implemented here. EVE-248 remains deferred.

The 200-code-unit text bound, 100-row page maximum, 32-bit revision ceiling, four-attempt guard budget and terminal archive are conservative implementation choices under that bounded approval, not verbatim values from the older issue. They require no configuration or shared contract expansion; the exact semantics below are the current slice's contract.

## Compose the backend

1. Provide an authenticated tenant route, live identity resolver/authorizer and flags service. Product input cannot select a tenant, principal, SQL dialect or database.
2. Evaluate `productResources` from `@eventiva/runtime/inventory-product`. Apply the two portable resource declarations through the existing privileged SQL resource migrator. No product-specific SQL, migration file or shared Resources API is added.
3. Bind `resourceRuntime` to that tenant's provider with live policy. Only the common product actions may mutate `inventory.product` or `inventory.product-guard`; do not grant other modules direct mutation access. The future import must invoke the same product actions, not create product rows itself.
4. Compose durable Integrity/Audit from the **same provider Storage transaction owner**, then register `productModule` on the common ActionHost. Supply authenticated Caller per invocation. The compiling registration example is `ai-docs/src/27_commerce/03_inventory.ts`; the complete disposable SQL composition is in `tests/runtime/src/inventory-product.spec.ts`.
5. Keep `inventory.f6-inventory` off. This valid dotted key explicitly maps to EVE-81's historical `f6-inventory` label. Its safe default is false. No deployment or external flag is enabled by this slice.

The module is not installed in the application shell. Enabling and registering it does **not** currently establish action-inventory/provider parity: the conservative shared compiler refuses Google's string pattern/length constraints, composed bounds and nullable cursors. Discovery fails closed rather than publishing weakened schemas; direct authorized invocation is separately tested. Do not activate the module in a shared discovery host until this limitation is resolved. The separate exact-UUID compiler amendment does not remove these restrictions.

## Call the actions

`@eventiva/contracts/inventory-product` exports all five specifications. Every action is online-only and sensitive. Read permission is `inventory.catalogue.read`; create/update/archive require `inventory.catalogue.write`. The unchanged common host owns approvals, audit, exact-input idempotency and public failure encoding. Writes require an invocation idempotency key. Neither a previous successful call nor a stored preview grants lasting permission.

| Action | Required input | Result and constraints |
| --- | --- | --- |
| `inventory.product.create` | UUIDv7 `id`, complete `product` | Revision 1, not archived. Existing identity returns RevisionConflict. |
| `inventory.product.update` | `id`, expected `revision`, complete `product` | Metadata replacement, not a partial patch; archive and identity are immutable through this action. |
| `inventory.product.archive` | `id`, expected `revision` | Terminal archive, keeping identity and SKU. No unarchive action is provided. |
| `inventory.product.get` | `id` | Includes archived products, never another tenant's row. |
| `inventory.product.list` | `limit` 1-100, explicit `includeArchived` boolean | Optional exact `category` and exclusive UUIDv7 `after`; sorted by identity. No implicit paging defaults. |

Complete `product` contains `name`, private `sku`, `category`, `tracking` and `unit`. Text is required, trimmed, nonempty and at most 200 UTF-16 code units. Tracking is exactly `serialised`, `bulk` or `consumable`; it is classification, not a stock assertion. Unknown fields, quantities, prices, public reference IDs and tenant overrides are rejected. Caller-selected IDs must be lowercase UUIDv7. Update/archive revision input is bounded to 1-2147483646; returned revisions may reach 2147483647, after which further mutation fails closed. No field defaults exist besides create's internal archive=false and initial revision=1.

```ts
const fields = { name: 'Synthetic lead', sku: 'AV-1', category: 'cables', tracking: 'bulk', unit: 'each' };
const created = yield* host.invoke('inventory.product.create', {
    id: '019b0000-0000-7000-8000-000000000014', product: fields,
}, { idempotencyKey: 'synthetic-create-1' });
const page = yield* host.invoke('inventory.product.list', { limit: 25, includeArchived: false });
```

This fragment assumes the authenticated common host composition above; the permanent public-host test is the executable full example. The page returns `products` and `next` (UUIDv7 or null). Filtering archived rows happens **after** a bounded storage page; an empty page can have a continuation. Follow `next` until null. A full last page may require one extra empty request. Category matching is exact and case-sensitive; SKU equivalence alone ignores case, retaining punctuation/internal spaces, consistently with existing import preview. `AV-1` equals `av-1`, not `AV1` or `AV 1`.

## Atomic uniqueness and failure behavior

All product mutations first create/CAS one fixed tenant-local guard record, inside the **same Resources transaction** as product lookup, uniqueness query and write. Concurrent first initialization is also guarded by atomic record creation. This serializes **all product writes per tenant**, not only writes to one SKU. The guard payload is constant; its retained revision/history provides ordering. Rename releases the old SKU; archived products retain the new SKU. Archive never implicitly deletes a product or releases its key. The invariant is owned by this exclusive mutation path, not a physical database unique-field constraint. A privileged bypass writer would violate it and is forbidden by composition policy.

Only recognized guard initialization/CAS conflicts retry the complete Resources transaction, at most three retries (four total attempts), with fresh identity, flag and permission/target authorization. Authorization is checked again after guard waits before product access. Product revision conflicts do not retry. Arbitrary storage errors, deadlocks, busy refusals and ambiguous commits fail closed as ProductUnavailable, never a blind retry. Host integrity/audit failures retain their own fixed platform outcome. Reconcile through get or retry with the same host idempotency key after an uncertain response; do not invent a new identity to conceal an unknown commit result.

Each repeated target-policy check receives a freshly decoded copy of captured input bytes. A policy adapter retaining or mutating its target cannot rewrite the metadata later persisted. Public-host regressions reproduce the unisolated SKU rewrite on both dialects, then verify the original SKU after isolation. The same suite exhausts the four-attempt guard budget, refuses arbitrary storage failures without retry, and revokes permissions during conflict/retry plus permissions/flags after guard acquisition; failed attempts leave both product and guard unchanged.

Public domain failures are DuplicateSku, ProductNotFound, ProductArchived, RevisionConflict and ProductUnavailable, wrapped by the host as ActionFailed. Errors never include competing product identity, SKU or database diagnostics. SQL audit receipts carry canonical input digests and action/caller outcomes, not raw product metadata. There is no product telemetry exporter, cross-tenant projection or public reference mutation.

SQLite's pinned synchronous adapter serializes concurrent fibers on one canonical client using BEGIN IMMEDIATE. Independent clients can block each other and produce a bounded busy/storage refusal rather than both succeeding; a probe observed approximately five seconds. This is **not universal multiprocess SQLite acceptance**. PostgreSQL concurrency uses transactional CAS and lock waits; fixed guard-first ordering reduces this path's lock cycles but does not prove all possible external deadlocks absent. No connection/timeouts/retry policy is changed.

## Verify and troubleshoot

Run `pnpm exec vitest run --config tests/contracts/vitest.config.mts tests/contracts/src/inventory-product.spec.ts --coverage.enabled=false`, then fixture-backed `pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/inventory-product.spec.ts --coverage.enabled=false`. PostgreSQL tests require the approved disposable loopback `eventiva_test` fixture described in `docs/storage.md`; never point them at production. The fixture migrates isolated tenant databases and cleans them up. The normal package suite keeps coverage enabled; focused commands are not delivery gates.

Run `node --run check`, full fixture-backed `node --run verify` and `node tools/documentation/planning.mjs --check --require-reviewed` before delivery. A schema/provider discovery refusal is not permission to erase validation; keep the optional gate off. DuplicateSku after archive is intentional. An empty filtered page is not end-of-list when `next` is present. ProductUnavailable during contention means no success was acknowledged, not proof no write occurred. Test evidence and delivered commits belong on EVE-81; passing this slice does not close kits, screens, sync or the broader issue.
