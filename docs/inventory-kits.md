# Private kit composition

[EVE-81](https://linear.app/resnovas/issue/EVE-81) remains open. This bounded
backend slice follows rank 2 of revision 7 of the
[implementation packet](https://ampcode.com/artifacts/next-implementation-packets-cd16f2fd-d187-4163-9463-9270422c87b0)
and its [2026-11-18 dispatch](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a).
The dispatch relays building authority, not production, financial or whole-issue
acceptance; the exact owner-selection timestamp is unknown.

A kit is an existing tenant-private Product plus a separate ordered composition.
Defining a kit does not create, copy, update or archive a Product, add stock,
reserve equipment, expand quantities or establish fulfilment. Nested kits retain
their component Product identities rather than flattening or copying descendants.

## Compose the backend

1. Declare `productResources` and `kitResources` and apply their declarations with
   existing `migrateResources` in the authenticated tenant's test/development
   database. No physical kit SQL migration or new field kind is required.
2. Build `resourceRuntime` with a current tenant/actor Resource policy. Restrict
   composition and kit-guard writes to these actions; never expose arbitrary
   Resources writes to an application caller. Restrict Product writes to the
   existing product actions. Fixture seeding is not an application write path.
3. Provide the same provider `storage` to durable Integrity/Audit. Build
   `productModule` and `kitModule` with that Resources service, trusted
   `CurrentTenant`, live IdentityResolver, Authorizer and Flags, and register both
   on the same ActionHost. The module IDs are `inventory` and `inventory.kits`;
   resource names are `inventory.kit` and `inventory.kit-guard`.
4. Supply Caller per invocation, never at kit-module registration. The bounded
   kit implementation follows products by refusing a changed canonical
   subject/session/tenant/kind/delegation instead of redirecting its captured
   provider. This does not fix the protected global Caller propagation seam
   described in [settings](settings.md#bounded-canonical-caller-adaptation-and-trust-recovery).
5. Keep `inventory.f6-inventory` safe-default false. This maps the older issue
   label `f6-inventory` without changing the shared dotted key grammar. The
   module remains uninstalled in the application shell; these instructions do
   not authorize remote enablement or production migrations.

`ai-docs/src/27_commerce/05_kits.ts` compiles registration and the complete
action input. The real composition is exercised in
`tests/runtime/src/inventory-kit.spec.ts`; SQL and test dependencies are already
approved and pinned. No dependency, provider or custody change is included.

## Replace and read

`inventory.kit.define` requires `inventory.catalogue.write`; `inventory.kit.get`
requires `inventory.catalogue.read`. Both are sensitive and online-only. A
request cannot supply tenant, owner, stock, a public model reference or an
arbitrary field. Every field below is required, with no implicit defaults.

```json
{
  "id": "019b0000-0000-7000-8000-000000000010",
  "revision": 0,
  "components": [
    {
      "product": "019b0000-0000-7000-8000-000000000011",
      "quantity": 7,
      "optional": false
    },
    {
      "product": "019b0000-0000-7000-8000-000000000012",
      "quantity": 2,
      "optional": true
    }
  ]
}
```

Submit this through the common ActionHost with an idempotency key. `id` and each
component `product` are Product UUIDv7 IDs in the trusted tenant. `revision: 0`
means first definition only; positive revisions compare-and-set an existing
composition. A successful replacement increments its composition revision by
one, independently of Product revision. Empty `components` explicitly defines a
leaf kit or clears a composition. Nonempty lists replace the entire prior list;
duplicates are rejected, not summed. Preserve order, integer multiplicities and
explicit optional values exactly. Optional edges still participate in cycles.

Get takes `{ "id": "019b0000-0000-7000-8000-000000000010" }` and returns
`{ id, revision, components }`. Product archival never cascades or rewrites the
composition; authorized get retains it. A later define revalidates the target
and all reachable component Products, including nested and optional references.
Missing/archived/foreign products refuse. The counted pilot requires exact unit
`each` throughout that reachable subgraph; other units refuse rather than
inventing conversion, rounding or fulfilment semantics. Current or future
availability needs its own stock/reservation expansion and double-counting rules.

### Engineering ceilings

These reversible pilot bounds are implementation safeguards, not owner-selected
business limits or throughput promises:

| Field or operation | Bound | Default |
| --- | --- | --- |
| Components per definition | 0-100, all explicit | None |
| Component quantity | Integer 1-1,000,000; no coercion/fractions | None |
| Expected revision | Integer 0-2,147,483,646 | None |
| Returned revision | Integer 1-2,147,483,647 | None |
| Complete tenant kit inventory | At most 1,000 definitions, read in pages of 100 | No truncation |
| Reachable Products on define | At most 1,000 distinct IDs, including target and non-kit leaves | No partial validation |
| Persisted composition codec | Fixed JSON array in scalar text; 16,384 UTF-16 code units maximum | None |
| Guard retries | At most three retries, four total attempts; recognized guard create/CAS conflicts only | No arbitrary SQL retry |

The complete-inventory and distinct-Product ceilings deliberately bound both
validation memory and product-read IO. They are stricter than an unbounded
tenant catalogue with only a reachable-kit budget. At the ceiling replacement
still works; creating definition 1,001 or traversing Product 1,001 fails closed.
One canonical scalar text record per composition keeps each replacement/history
revision atomic without introducing a general JSON Resource field. The action
wire value is a typed component array, not JSON-encoded caller text. Malformed or
oversize persisted text fails closed; no unvalidated JSON leaves the module.

## Atomicity, authorization and retries

Every define acquires the kit-owned tenant singleton by create/CAS inside the
same Resources transaction as full graph loading, iterative all-edge cycle
validation and replacement. Optional edges cannot hide a back edge. A concurrent
A-to-B/B-to-A race has at most one committed definition; the loser rereads the
serialized graph or fails closed. No product guard is written. Do not add another
kit writer that skips this protocol.

Identity, feature state, action permission/target and Resource access remain live
after lock acquisition and on each retry. Caller IDs and trusted tenant routing
are detached/frozen; policy targets are freshly decoded copies. Earlier grants
are not reusable authority. Common-host Integrity owns durable idempotency:
replay the same input/key after an ambiguous acknowledgement, rather than
allocating a new identity/key. Exact replay does not append composition history;
changed content conflicts. A failed post-write operation rolls back definition,
history, guard and successful commit together. Failure audit may remain.

Independent synchronous SQLite clients can busy-refuse under contention. The
single-owner SQLite concurrency test is not universal multiprocess-success
evidence. Storage/deadlock/busy failures never become blind retries. PostgreSQL
tests use independent real pools and deterministic guard contention, including
an actual `pg_stat_activity` lock-wait observation before revocation.

## Refusals and verification

Domain errors contain fixed tags only: `KitCycle`, `DuplicateComponent`,
`KitNotFound`, `ProductNotFound`, `ProductArchived`, `UnsupportedKitUnit`,
`RevisionConflict`, `KitLimit`, `KitUnavailable`. Private competing records,
composition text and database diagnostics never enter them. Host-level invalid
input, disabled capability, permission, audit and changed-retry refusals remain
the common host's typed errors.

- For `RevisionConflict`, reload the recorded composition and review a full
  replacement; never automatically merge or overwrite.
- For `KitCycle` or duplicates, correct the submitted graph. Removing an
  optional label does not remove an edge.
- For missing/archived references, correct the private Product references.
  Historical get is not an instruction to fulfil an archived kit.
- For `KitLimit`, reduce the graph or seek a separately reviewed bounded
  expansion. Never truncate validation or silently discard components.
- For `KitUnavailable`, retry only after current access/storage is restored,
  retaining the original idempotency key/input if acknowledgement was ambiguous.

Run focused contracts and fixture-backed runtime tests with their existing
Vitest configs, including unchanged product/import tests, then run
`node tools/documentation/check.mjs`, `node --run check`, fixture-backed
`node --run verify`, `pnpm nx sync:check` and
`node tools/documentation/planning.mjs --check --require-reviewed`.
Focused tests alone do not establish package coverage or complete EVE-81.

Complete provider discovery remains unsupported by conservative pattern/bounds
profiles; no Google/provider parity or compiler widening is claimed. UI,
offline sync, stock/product mutation, serial assets, fulfilment/substitution,
fractional conversions, publication and production activation remain out of
scope. EVE-248 stays deferred until January 2027; no paid work is authorized.
