<!-- linear:generated:start -->
# EVE-42: P1.3 Build the storage layer: Drizzle on Postgres and SQLite, state machines and tenant guards

[Live Linear source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:53:39.893Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | In Progress (started) |
| Priority | 0: No priority |
| Labels | Code, Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | [EVE-258](EVE-258.md) |
| Blocked by | [EVE-23](EVE-23.md) |
| Blocks | [EVE-54](EVE-54.md), [EVE-55](EVE-55.md), [EVE-64](EVE-64.md), [EVE-68](EVE-68.md), [EVE-74](EVE-74.md), [EVE-75](EVE-75.md), [EVE-81](EVE-81.md), [EVE-82](EVE-82.md), [EVE-87](EVE-87.md), [EVE-94](EVE-94.md), [EVE-98](EVE-98.md), [EVE-100](EVE-100.md), [EVE-103](EVE-103.md), [EVE-106](EVE-106.md), [EVE-112](EVE-112.md), [EVE-128](EVE-128.md), [EVE-129](EVE-129.md), [EVE-131](EVE-131.md), [EVE-133](EVE-133.md), [EVE-136](EVE-136.md), [EVE-138](EVE-138.md), [EVE-143](EVE-143.md), [EVE-145](EVE-145.md), [EVE-146](EVE-146.md), [EVE-166](EVE-166.md), [EVE-170](EVE-170.md), [EVE-172](EVE-172.md), [EVE-204](EVE-204.md), [EVE-252](EVE-252.md) |
| Related to | [EVE-17](EVE-17.md), [EVE-22](EVE-22.md), [EVE-39](EVE-39.md), [EVE-40](EVE-40.md), [EVE-43](EVE-43.md), [EVE-51](EVE-51.md), [EVE-61](EVE-61.md), [EVE-62](EVE-62.md), [EVE-63](EVE-63.md), [EVE-65](EVE-65.md), [EVE-66](EVE-66.md), [EVE-67](EVE-67.md), [EVE-69](EVE-69.md), [EVE-71](EVE-71.md), [EVE-73](EVE-73.md), [EVE-76](EVE-76.md), [EVE-80](EVE-80.md), [EVE-107](EVE-107.md), [EVE-108](EVE-108.md), [EVE-111](EVE-111.md), [EVE-119](EVE-119.md), [EVE-124](EVE-124.md), [EVE-125](EVE-125.md), [EVE-126](EVE-126.md), [EVE-127](EVE-127.md), [EVE-147](EVE-147.md), [EVE-237](EVE-237.md), [EVE-244](EVE-244.md), [EVE-246](EVE-246.md), [EVE-250](EVE-250.md), [EVE-251](EVE-251.md), [EVE-257](EVE-257.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Binding storage architecture — 2026-11-15

Jonathan approved S1-S4 and the three offline execution categories. <issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" /> and the migration guard are landed. The approved SQL-only first increment was delivered to main on 2026-11-15 with exact-head CI green at [e0914e34](<https://github.com/Resnovas/Eventiva/commit/e0914e34450e6f6c103e0ae3d2d83134484e0273>).

This issue remains In Progress, not Done: deferred Drizzle/device scope, production least-privilege acceptance and <issue id="55c2d64a-d779-41d9-b74e-dcc7d062b86b" label="EVE-252" href="https://linear.app/resnovas/issue/EVE-252/implement-effect-cluster-sharding-and-multi-runner-recovery-in-the" /> Phase B SQL/process recovery are not completed by this increment. [Delivery evidence](<https://ampcode.com/artifacts/eve-42-sql-evidence-6f270af4-a889-4337-98aa-0ff0f25804db>).

## Goal

Provide one portable storage contract with Postgres/Neon server and SQLite Node conformance, typed state machines and tenant database routing, while keeping drivers out of shared/client packages.

## Approved rules

* S1: one logical operational database per tenant, selected only after authentication through explicit scoped routing; a narrow shared control plane holds identity/routing/provisioning metadata. No routine cross-tenant operational queries.
* S2: authoritative append-only ledgers/deltas, expiring reservations and typed CAS state machines for scarce resources; online-only provider payment actions plus idempotent reconciliation; dispatch/scheduled production leases, deadlines and transition history; exact money values.
* S3: typed raw PowerSync tables and explicit device migrations for canonical offline records; JSON only for projections; explicit guarded command envelopes and visible conflicts through the same server Effect action.
* S4: forward-only checksum-verified expand-and-contract migrations, compatibility windows and tested restore/branch recovery; UUIDv7, Postgres `timestamptz`, SQLite epoch milliseconds, exact decimal strings and no tenant ID in physically isolated tenant primary keys.
* The old tenant-predicate query guard is superseded by tenant database routing. The old mandatory down-migration guard is superseded by S4.

## Planned scope

* Portable database capabilities, errors and state-machine contracts.
* Tenant database router and scoped current-tenant context.
* Database-neutral column/sync declarations in `@eventiva/schema`.
* Driver integrations for approved Postgres and SQLite packages, dialect projections and platform integrity tables.
* Forward-only migration generation and a dependency-free storage guard rejecting `drizzle push`, changed applied checksums and unannotated destructive changes.
* One conformance suite for SQLite in memory and PostgreSQL in CI; a Postgres service job feeds required `application check`.

## Acceptance

* Both dialect suites pass the same storage conformance contract.
* Concurrent reservation tests prove no oversell/negative availability; stale CAS, illegal transitions and expired leases fail with typed errors.
* Payment retries reconcile exactly once; rollback leaves no receipt or outbox record; replay returns the stored receipt.
* Device migrations and explicit guarded-envelope fields are verified; stale offline commands surface visible conflicts.
* Tenant routing cannot cross operational databases; control-plane access remains explicitly scoped and audited.
* UUIDv7, temporal and exact-decimal round trips pass.
* The dependency-free storage guard runs in root `check`; package-backed conformance runs in `verify` and required `application check`.

## Dependency gate

The owner approved only @effect/sql@0.52.2, @effect/sql-pg@0.53.1, @effect/sql-sqlite-node@0.54.1, development-only @types/pg@8.23.1, locked pg@8.23.1 and better-sqlite3@13.0.3, PostgreSQL 17, and the exact Bookworm image digest recorded in delivery evidence. No better-sqlite3 build script was authorized or enabled; its bundled prebuild executed.

The exact postgres:17.12-bookworm digest 40865bc877a289da75963d97d72b59633f639fc5af7a4e856bfa3714cae5b536 has a bounded owner exception only for isolated disposable synthetic local/CI testing, expiring 2026-11-22 UTC or earlier on a relevant exploit/input/fix/rebuild trigger. Its 4 critical/140 high/231 medium/190 low/11 unknown scan findings remain unsuppressed. No production use, Trixie adoption, provider/paid infrastructure, CDC or broader waiver is authorized. Fixtures use generated SCRAM credentials, loopback/dedicated bridge, resource/time limits and teardown; CI fails closed at expiry and for PR/dispatch code rather than skipping conformance.

Other dependencies and the deferred scope still require their own owner approval.

## Delivery

After <issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" /> and the dependency gate, implement on current main under Eventiva's direct-to-main exception, preserve Smartcloud/$0 AI safeguards, run required checks and record evidence here.

## Verified SQL-only delivery evidence (2026-11-15)

Agent-authored delivery record. Signed/signed-off feature [75cd2537](<https://github.com/Resnovas/Eventiva/commit/75cd2537ddcd7bdd468b846bce1dd5e4de439698>), graph [54318c49](<https://github.com/Resnovas/Eventiva/commit/54318c4949a6c955ed402a3a608ed79c01fe1c6d>), CI fix [325e211e](<https://github.com/Resnovas/Eventiva/commit/325e211e52a525c6081cb37d554ed18d7e7ce5f1>), type-proof fix [75e99cfd](<https://github.com/Resnovas/Eventiva/commit/75e99cfd7e84564e448e5119064ff738d7e304b8>), final graph/head [e0914e34](<https://github.com/Resnovas/Eventiva/commit/e0914e34450e6f6c103e0ae3d2d83134484e0273>). All five SSH signatures verified. Based on <issue id="55c2d64a-d779-41d9-b74e-dcc7d062b86b" label="EVE-252" href="https://linear.app/resnovas/issue/EVE-252/implement-effect-cluster-sharding-and-multi-runner-recovery-in-the" /> Phase A, preserving its source/config/tests/docs byte-for-byte, without post-publication rewriting.

Exact-head [CI run 43713418653](<https://github.com/Resnovas/Eventiva/actions/runs/43713418653>) passed verify, smoke and application check at 12:23:12 UTC. House/Smartcloud, actionlint/zizmor, CodeQL, scorecard and graph workflows passed. Release jobs stayed inactive.

Commands/results:

* Explicit Effect compiler patch reproduced the CI floating Effect diagnostic. Returning the deliberate invalid transition preserved both the expected vocabulary type error and the Effect diagnostic; no suppression added.
* After removing build-info files, NX_SKIP_NX_CACHE=true NX_NO_CLOUD=true NX_DAEMON=false timeout 20m node --run verify passed: guard55, 67 application tasks and 13 smoke tasks, all uncached, including real PG17/SQLite, Android/Hermes, server and browser.
* pnpm nx run-many -t test -p @eventiva/storage-tests @eventiva/server --skip-nx-cache passed SQL29/server10.
* Final node --run check with node_modules absent passed55/zero skipped. Frozen install, Nx sync, clean-archive Graphify, diff and signature checks passed.
* Exact fixture script executed locally: SCRAM identity/privileges passed, invalid password rejected28P01, expiry/untrusted-event gates rejected before fixture creation. Dedicated bridge/loopback, 2CPU/1GiB/256PID limits, tmpfs data and teardown verified; generated credentials deleted and daemon stopped.

London Neon development probe passed16 direct/pooled TLS1.3/hostname-denial, migration/checksum, atomicity/replay/rollback/concurrency, value-fidelity and routing checks under the explicit full-access development exception. Scratch schema removed and clients closed. Native bigint/numeric/array/aggregate fidelity also passed without text casts. Restricted-role metadata passed, but SET LOCAL ROLE migrator failed42501 before effective-role/RLS execution; independent restricted-role/default-grant/RLS proof remains untested. Stale usage snapshots (608 active seconds,156 compute seconds,0 writes,616 transfer despite real writes) cannot attribute consumption or prove zero cost/autosuspend. No provider/CDC/paid change or legacy Frankfurt access occurred.

Existing v1 seam is sufficient for <issue id="55c2d64a-d779-41d9-b74e-dcc7d062b86b" label="EVE-252" href="https://linear.app/resnovas/issue/EVE-252/implement-effect-cluster-sharding-and-multi-runner-recovery-in-the" />: postgres client exports upstream SqlClient/PgClient; durable is built inside authenticated tenant scope with the same handler Storage. Commit joins that client's fiber transaction. Runtime row/transaction locking and migration pg_advisory_xact_lock require no session advisory lock/LISTEN. Upstream pooling/multi-process recovery is not proved here. Server activation, Drizzle/device scope remain deferred.

[Full evidence and exact dependency/native/licence/image review](<https://ampcode.com/artifacts/eve-42-sql-evidence-6f270af4-a889-4337-98aa-0ff0f25804db>). No native-script allowance or new dependency beyond the approved set. Image findings remain unsuppressed under the bounded exception; this is not clean-security or production acceptance. Graphify Cloud/gateway were unavailable; local graph and pinned source were used. The app-authored Linear comment path is not installed, so this evidence is recorded directly in the issue rather than claiming a posted comment.

## Central Resources increment ownership (2026-11-15)

<issue id="555738cd-b6eb-4f45-b9d0-d1e590a75785" label="EVE-258" href="https://linear.app/resnovas/issue/EVE-258/add-the-database-neutral-resources-api-and-privileged-tenant-migration" /> is the narrowly scoped resource API/adapter/migration increment; canonical spec [https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c](<https://ampcode.com/artifacts/eventiva-modular-platform-b115f8c7-0edb-4b1b-9219-abf845e2f85c>). Keep this issue's original SQL/Drizzle/SQLite/state/tenant/device/sync intent and approval matrix. ResourceDriver/ResourceProvider, declarations/codec/evolution/plans stay contracts; runtime resourceRuntime(provider,authorize) and SQL resourceProvider/planResourceMigrations/migrateResources import contracts only. SQL captures SqlClient and constructs Storage on that exact client; Resources.transaction delegates existing Storage.transaction/Integrity fiber. One authenticated tenant/client per instance; CurrentTenant+Caller+authorization every operation. Dedicated resource/revision/schema history tables preserve immutable values/evidence; additive migration only, pure restart preflight before SQL acquisition. No duplicate schema authority or weakened Nx exception. Root SQL reachability hook/export/Nx wiring at coordinator checkpoint. Full owner acceptance still requires actual conformance/restart/tenant/atomicity evidence, not only neutral types. AI-authored planning addition.

## Linear comments (18)

### Comment 14206760-f207-408f-9bae-d852579424de

Author: GitHub. Created: 2026-10-31T22:31:28.148Z; updated: 2026-10-31T22:31:28.130Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/809). All replies are displayed in both locations.


### Comment fe5c339d-4de7-4a46-a71e-a7ae0967f485

Author: jonathan@resnovas.com. Created: 2026-11-14T22:01:56.621Z; updated: 2026-11-14T22:01:56.467Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

## PROPOSAL - storage and consistency decision cards (not approved)

These cards preserve the approved package architecture and EVE-17 decision. They do not authorize implementation, dependencies, provisioning or spending.

### Settled requirements - do not reopen

- PowerSync self-hosted Open Edition handles record sync; Yjs handles text/canvas with updates carried through PowerSync. Electric/TanStack DB is only the licence fallback.
- Every authoritative write passes through the same server Effect action, permission check and audit path.
- Default record fields merge per field; guarded status/money/assignment/dispatch changes use expected state/version and reject conflicts; quantities use append-only deltas; Yjs governs documents/canvas; live operations are online-only.
- Revocation immediately removes the bucket and destroys open Yjs documents, presence and undo state.
- Effect v3 and portable schema/runtime boundaries are already approved.

### S1 - Tenant isolation topology (most consequential)

**Recommend:** one logical database/branch per tenant for tenant data, selected by an authenticated routing service; a narrowly scoped shared control-plane database holds tenant directory/routing only. Use RLS as defence in depth on shared control-plane tables, not as the primary tenant boundary. PowerSync gets a separate replication role and bucket authorization.

**Alternatives:** shared tenant tables with RLS, or database-per-tenant with no control-plane RLS.

**Consequences:** a missing query predicate cannot cross tenant data boundaries, while routing and lifecycle operations remain manageable. This increases provisioning/migration orchestration and requires explicit cross-tenant administration paths.

### S2 - Integrity model for tickets, stock, payments and production state

**Recommend:** tickets/stock/capacity are server-authoritative ledgers: append-only deltas plus expiring reservation state machines; availability is derived and cannot go below zero. Payments are online-only external actions with idempotent authorization/capture/refund commands and a local reconciliation ledger. Dispatch and scheduled production dependencies use typed compare-and-set state machines with leases, deadlines and append-only transition history. Money uses currency plus exact decimal/minor-unit representation, never floating point.

**Alternatives:** mutable counters/LWW, provider-only payment state, or generic status strings.

**Consequences:** offline MDT may draft or queue requests but cannot promise scarce inventory or payment success. Concurrent winners are explicit; stale requests return typed conflicts. Reconciliation and audit remain possible after provider or runner failures.

### S3 - Device schema and guarded-write envelope

**Recommend:** use raw PowerSync tables for authoritative typed offline records and explicit device migrations; reserve JSON projections for derived/read models. Carry expected version/state, idempotency key, client mutation ID and deadline in an explicit command envelope, not hidden metadata.

**Alternatives:** PowerSync JSON views everywhere, `trackMetadata`, or `trackPreviousValues`.

**Consequences:** stronger type/index support and inspectable conflict semantics across MDT/web/server, at the cost of device migration work. Hidden metadata is easier initially but couples correctness to sync-engine internals.

### S4 - Migration and canonical value policy

**Recommend:** forward-only expand-and-contract migrations with checksum enforcement and restore/branch rollback; no routine hand-written down migration promise. Use UUIDv7 IDs, Postgres `timestamptz`, SQLite epoch milliseconds behind one temporal schema, exact decimal strings at portable boundaries, and no tenant ID in domain primary keys when tenant data is physically isolated.

**Alternatives:** mandatory handwritten down SQL, ISO timestamp text on SQLite, composite `(tenant_id,id)` keys.

**Consequences:** safer evolution for old offline clients and fewer misleading rollback guarantees. Destructive changes require staged compatibility windows and explicit recovery plans.

**Owner decisions requested:** approve/amend S1-S4. PostgreSQL major, native package versions and service provisioning remain later implementation approvals.


### Comment 1807bbaf-0431-4f46-8282-535bfa78aa7b

Author: jonathan@resnovas.com. Created: 2026-11-14T22:07:19.690Z; updated: 2026-11-14T22:07:19.646Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

## APPROVED - three offline execution categories (2026-11-14)

Jonathan approved this policy as the Eventiva default. This approval is limited to these categories; S1-S4 and the remaining A-cards are still proposals unless separately approved.

1. **Routine work:** crew task/status updates, checklists and notes may queue durably offline and synchronize with visible conflicts.
2. **Authoritative operations:** dispatch allocation, stock reservations, ticket capacity and payment/financial commitments require an authoritative service. Offline preparation is allowed, but an unconfirmed allocation or commitment must never be shown as successful.
3. **Safety-sensitive operations:** show control and safety-critical output follow explicitly approved procedures, current authorization, and validated local-execution/degraded-mode requirements. Offline access never relaxes safety policy.

Tenants may configure safe behaviour, but mandatory integrity and safety safeguards are immutable. Storage and sync must represent pending, confirmed, rejected and expired outcomes distinctly; a queued intent is not a committed allocation.

Product examples: [EVE-71](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and) and [EVE-147](https://linear.app/resnovas/issue/EVE-147/f77-build-the-incident-control-log-and-dispatch-for-live-events). EVE-147 already keeps incidents/log entries queueable while dispatch assignment is online-only and serialized.


### Comment e7459930-9d89-4f53-b7cb-d6b76d4c8cfc

Author: jonathan@resnovas.com. Created: 2026-11-14T22:40:37.397Z; updated: 2026-11-14T22:40:37.381Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

## APPROVED WITH CROSS-TENANT DESIGN FOLLOW-UP - S1 tenant isolation (2026-11-14)

Jonathan approved S1 as the platform default:

- one separate logical operational database per tenant;
- only a narrow shared control plane for tenant identity, routing and provisioning metadata;
- authentication before tenant database selection;
- explicit scoped tenant resolution and auditing; and
- no routine direct cross-tenant operational queries.

**Critical boundary:** this approval does not specify Eventiva's cross-tenant marketplace transaction architecture. F5 directory, listings, enquiries, quotes, mixed supplier awards, purchasing, sales, supplier-owned invoicing and payments must not implement direct cross-tenant database access or infer a global ACID transaction from S1.

The proposal-only follow-up is [EVE-250](https://linear.app/resnovas/issue/EVE-250/decide-controlled-cross-tenant-marketplace-gateway-architecture), related to [EVE-66](https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings), [EVE-119](https://linear.app/resnovas/issue/EVE-119/f57-build-cross-tenant-enquiries-rfps-and-private-message-threads), [EVE-124](https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the), [EVE-237](https://linear.app/resnovas/issue/EVE-237/f514-build-quote-payments-with-commission-deducted-at-source), [EVE-246](https://linear.app/resnovas/issue/EVE-246/define-provider-neutral-connected-account-invoicing-and-settlement) and [EVE-43](https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and). It preserves existing decisions and asks only the remaining gateway, participant-grant, freshness, saga-recovery, residency and reconciliation questions.

S2-S4 remain PROPOSAL. This is architecture approval, not implementation, dependency, provisioning or spending authorization.


### Comment 8796e14b-0c29-4a7f-85b4-cac39567ecbb

Author: jonathan@resnovas.com. Created: 2026-11-15T01:06:42.064Z; updated: 2026-11-15T01:06:42.040Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

## Durable architecture diagrams and batched decisions

The editable decision sheet and Mermaid sources are here: [Eventiva architecture decisions](https://ampcode.com/artifacts/eventiva-architecture-decisions-3169b540-652d-4795-ae9c-7ad78a534f17).

Rendered diagrams:
- [Platform topology](https://ampcode.com/artifacts/visuals/eventiva-platform-topology-642e7f6c-7f4c-4a0a-9b8a-a3238de5488d)
- [Regional marketplace cells](https://ampcode.com/artifacts/visuals/regional-marketplace-cells-53e16fa9-4142-491a-a36a-b190ce591e90)
- [Marketplace decryption gates](https://ampcode.com/artifacts/visuals/marketplace-decryption-gates-ee91fc95-83c9-4a15-8662-80b11dabb75d)
- [Marketplace award sequence](https://ampcode.com/artifacts/visuals/marketplace-award-sequence-e6c99855-c5e6-41d0-8587-00bfb92a289d)

Approved and proposed elements are labelled separately. This documentation does not authorize implementation, dependencies, algorithms, infrastructure or spending.


### Comment ebdee5e0-80c0-4165-b1f5-bb7774bcf590

Author: jonathan@resnovas.com. Created: 2026-11-15T01:16:21.474Z; updated: 2026-11-15T01:16:21.446Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

## Implementation-readiness and exact dependency gate — 2026-11-15

EVE-42 is not ready to implement yet. EVE-23, A3/A4 and S2/S3/S4 must settle first. Forward-only expand/contract migrations with checksums are already approved; the old mandatory-down-migration and tenant-predicate guards are superseded.

Exact dependency approval still required as one batch:
- `@effect/sql-pg@0.53.1` (transitively `pg@^8.16.3`)
- `@effect/sql-sqlite-node@0.54.1` (transitively native `better-sqlite3@^13.0.3`)
- `@effect/sql-drizzle@0.51.1` (requires an explicit side-effects exception)
- `drizzle-orm@0.45.4`
- `drizzle-kit@0.31.11` (dev only; brings esbuild transitively)
- confirm direct use of existing `@effect/sql@0.52.2`
- approve pnpm `allowBuilds` for `better-sqlite3` and `esbuild`
- choose PostgreSQL major and pinned CI image digest

Neither EVE-40 nor EVE-42 needs direct esbuild. PowerSync, Yjs, device SQLite and Expo crypto remain EVE-51. The storage guard can run in root `check`; package-backed conformance runs in `verify`/`application check`.

Current batched decisions: [Eventiva architecture decisions](https://ampcode.com/artifacts/eventiva-architecture-decisions-3169b540-652d-4795-ae9c-7ad78a534f17). No dependency is approved by this comment.


### Comment fbbed675-50b0-4e5a-b5fb-7ec6187c30b9

Author: jonathan@resnovas.com. Created: 2026-11-15T01:44:34.461Z; updated: 2026-11-15T01:44:34.218Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

## APPROVED — S2, S3 and S4 foundation policy (2026-11-15)

Jonathan approved all three together.

### S2 — Integrity
Tickets, stock and capacity use authoritative append-only deltas/ledgers, expiring reservations and typed compare-and-set state machines; availability cannot oversell or become negative. Payments are online-only provider actions with idempotent local reconciliation. Dispatch and scheduled production use CAS state machines with leases, deadlines and transition history. Money uses exact currency minor units or decimal strings, never binary floating point.

### S3 — Offline device contract
Canonical offline records use typed raw PowerSync tables with explicit device migrations; JSON projections are only derived/read models. Guarded command envelopes explicitly carry expected state/version, idempotency key, client mutation ID and deadline, and use the same Effect server action path with visible conflicts.

### S4 — Migration and values
Migrations are forward-only, checksum-verified expand-and-contract with offline-client compatibility windows and tested restore/branch recovery. This supersedes the blanket down-step requirement. IDs are UUIDv7; Postgres uses `timestamptz`; SQLite uses epoch milliseconds behind one temporal contract; portable decimals are exact strings; physically isolated tenant DB primary keys omit tenant ID while routing/auth remains tenant-scoped.

### Acceptance tests
- Concurrent reservation/ledger tests prove no oversell or negative availability; stale CAS and expired leases fail with typed errors; payment retries reconcile once.
- Raw device tables migrate explicitly; guarded envelopes expose every required field; stale offline commands become visible conflicts through the server action path.
- Migration checks reject changed applied checksums, `drizzle push`, and unannotated destructive changes; old-client compatibility and restore/branch recovery are tested.
- UUIDv7 ordering/uniqueness, Postgres/SQLite temporal round trips, exact decimal round trips and tenant-router isolation are covered.

Architecture approval only. EVE-42 dependency versions, PostgreSQL major, providers and infrastructure remain unapproved. [Decision sheet](https://ampcode.com/artifacts/eventiva-architecture-decisions-3169b540-652d-4795-ae9c-7ad78a534f17).


### Comment ade562e4-6b6b-4230-8c8c-a820f83fc322

Author: jonathan@resnovas.com. Created: 2026-11-15T01:54:26.340Z; updated: 2026-11-15T01:54:26.325Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

## Consolidated dependency approval research — read-only

Permanent sheet: [EVE-42 dependency approval](https://ampcode.com/artifacts/eve-42-dependency-approval-42a40b75-5dca-458d-89cc-0417e45b4f00)

Verified compatible candidates: `@effect/sql@0.52.2`, `@effect/sql-pg@0.53.1`, `@effect/sql-sqlite-node@0.54.1`, `@effect/sql-drizzle@0.51.1`, `drizzle-orm@0.45.4`, `drizzle-kit@0.31.11`, and dev-only `@types/pg@8.23.1`. Recommended PostgreSQL target: 17.12 on the pinned official Bookworm digest recorded in the sheet.

Important corrections: `better-sqlite3@13.0.3` has no install hook, so do **not** grant `allowBuilds.better-sqlite3=true`. No direct esbuild or tsx dependency is needed. The full Drizzle-kit route brings legacy `esbuild@0.18.20` through deprecated tooling and therefore needs explicit dev-only risk acceptance/remediation, exact esbuild build permissions, and a backend-only SQL-Drizzle side-effects exception.

Recommendation remains **proposal only**: start with Effect SQL/Postgres/Node-SQLite plus `@types/pg`, deferring Drizzle tooling until its legacy advisory is resolved or explicitly accepted. No package, image, risk or deferral is approved by this comment.


### Comment f9427783-867d-49ea-8097-adc786220c11

Author: jonathan@resnovas.com. Created: 2026-11-15T03:44:18.071Z; updated: 2026-11-15T03:44:18.025Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

## APPROVED — exact SQL-only dependency and PostgreSQL set (2026-11-15)

Jonathan explicitly approved the SQL-only first increment from the consolidated approval sheet:

- existing `@effect/sql@0.52.2`
- `@effect/sql-pg@0.53.1`
- `@effect/sql-sqlite-node@0.54.1`
- development-only `@types/pg@8.23.1`
- expected transitives `pg@8.23.1` and `better-sqlite3@13.0.3`
- PostgreSQL major 17
- CI image `docker.io/library/postgres:17.12-bookworm@sha256:40865bc877a289da75963d97d72b59633f639fc5af7a4e856bfa3714cae5b536`

Hard boundary: do **not** authorize `better-sqlite3` build scripts. If the approved prebuild cannot install or run without that allowance, stop the SQLite portion and return exact technical evidence plus a narrow remedy for separate approval. No direct esbuild, tsx, PowerSync, Yjs, device SQLite, Drizzle ORM/Kit, `@effect/sql-drizzle`, cloud resource or paid provider is approved.

EVE-23 is verified on `main` at `7df42178c6ea00fa24b70a861848b65825a000ab`. The dependency-free migration guard landed at `d0f582c0e398c42c54e9f7557c84002b205b8892` with CI passing. Full EVE-42 SQL-only implementation is now running in an isolated GPT/Codex orb, staged around EVE-40 path ownership and direct-to-main integration.

Approval sheet: https://ampcode.com/artifacts/eve-42-dependency-approval-42a40b75-5dca-458d-89cc-0417e45b4f00


### Comment 973441a3-2e26-4a9c-9311-17ad84583730

Author: jonathan@resnovas.com. Created: 2026-11-15T03:45:44.135Z; updated: 2026-11-15T03:45:44.104Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

## BINDING production provider direction — Neon (2026-11-15)

Jonathan confirmed Neon as Eventiva's intended production PostgreSQL provider. Production tenancy uses a dedicated Neon Postgres project per tenant in AWS London (`eu-west-2`) under the existing EVE-13 policy. The approved PostgreSQL 17 Docker image remains CI/local conformance tooling, not the hosted production database.

EVE-42 must validate the approved `@effect/sql-pg@0.53.1` / `pg@8.23.1` path against Neon pooled and direct connections, SSL and connection lifecycle/autosuspend, direct migration connections where required, DDL and extension availability, transactional semantics, branching/test isolation, controlled tenant routing, regional placement, RLS as control-plane defense, and exact integer/time/UUIDv7 fidelity. Portable contracts remain provider-neutral and no implementation may rely on unavailable Neon features.

A Neon branch is not equivalent to a dedicated tenant production project. Branches may be used for isolated development/conformance only after quota, cost and data isolation are verified. No production mutation, credential exposure, paid resource, destructive test or provider configuration change is authorized by this direction.


### Comment 92d05be3-ecbd-4272-bbdd-e3294bbd5fea

Author: jonathan@resnovas.com. Created: 2026-11-15T03:47:29.606Z; updated: 2026-11-15T03:47:29.568Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

## BINDING Neon CDC / PowerSync cost and compatibility gate — 2026-11-15

Fresh official Neon guidance confirms logical replication is enabled per project, permanently changes `wal_level` to `logical`, cannot be reverted, and restarts every compute. A connected subscriber prevents scale-to-zero and can create continuous compute cost. Inactive slots are removed after about 40 hours without acknowledged `flush_lsn`; branch restore removes slots. Neon supports at most 10 WAL senders and 10 replication slots by default.

For Eventiva/PowerSync, CDC must use a direct Neon endpoint without the `-pooler` suffix and a correctly privileged dedicated replication role; persistent replication is incompatible with PgBouncer pooling. Runtime Effect SQL queries must test pooled and direct paths separately. Do not enable replication or run tests on the existing historical PG16 Frankfurt project.

Plan the first London PG17 synthetic test project with replication disabled. Any later PowerSync/CDC integration trial requires separate owner approval, synthetic-only data, direct endpoint, measured active time, slot lag/retention and cost evidence before broad enablement. This is especially material for the project-per-tenant production model. A Neon branch remains a test-isolation mechanism, not equivalent production tenant isolation.

Official sources refreshed 2026-11-15:
- https://neon.com/docs/guides/logical-replication-guide (updated 2026-10-21)
- https://neon.com/docs/guides/logical-replication-neon (updated 2026-10-09)

Do not silently discard the approved PowerSync design if economics or scaling fail. Return an evidence-backed architecture proposal for owner decision.


### Comment b60b3090-6ad5-49b8-93f0-759ee83819c0

Author: jonathan@resnovas.com. Created: 2026-11-15T03:58:42.562Z; updated: 2026-11-15T03:58:42.532Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

## AUTHORIZED Neon development database — created 2026-11-15

A clean synthetic-only Neon project is available for EVE-42 production-compatibility testing:

- Project: **Eventiva Development - UK PG17**
- Project ID: `icy-band-49524350`
- Main branch ID: `br-dawn-resonance-zadcbu0j`
- Database: `eventiva_dev`
- PostgreSQL 17.12, verified by live read-only SQL
- AWS London `aws-eu-west-2`
- Free plan; no paid-tier change

Quotas: active time 36,000s (10h), compute 9,000s (2.5 CUh), written data 100 MiB, transfer 1 GiB, logical size 100 MiB. Compute is fixed at 0.25 CU and restore retention is 6h. The account rejected a custom suspend interval with HTTP 412 and reports `suspend_timeout_seconds=0`; do not assume scale-to-zero. Verify behavior, avoid idle compute and monitor quota.

Logical replication is disabled. Do not enable CDC without separate owner approval. Use synthetic data only and isolated branches when needed. Never expose privileged connection strings or passwords; use the approved Neon connector or secret manager and least privilege. Run SSL, pooled/direct connection, migration, transaction, tenant-routing and exact-value conformance against this project and compare with local PostgreSQL 17 CI.

The legacy Frankfurt PG16 project `cool-unit-72575963` remains untouched and must not be deleted, reset or tested without a separate request. This authorization provisions no application infrastructure and permits no additional project, paid resource or plan change.


### Comment 775139d8-eb75-4e8a-9e07-7932627617c6

Author: jonathan@resnovas.com. Created: 2026-11-15T04:01:10.506Z; updated: 2026-11-15T04:01:10.484Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

## Neon legacy project retirement — 2026-11-15 (owner-approved)

Jonathan explicitly confirmed the old Neon project contained nothing of value and authorized its deletion/reset. The Neon connector successfully deleted the legacy project **Eventiva** (`cool-unit-72575963`, PostgreSQL 16, AWS Frankfurt `aws-eu-central-1`), including its legacy branches, and a subsequent project listing confirmed it is no longer active.

**Preserved and verified:** new development/testing project **Eventiva Development - UK PG17** (`icy-band-49524350`), PostgreSQL **17.12**, AWS London `aws-eu-west-2`, database `eventiva_dev`, branch `br-dawn-resonance-zadcbu0j`. Its conservative free-plan quotas remain in place; logical replication remains disabled and no provider costs or other resources were authorized. Use only synthetic data for testing. Do not attempt any connection to the retired project or use its old credentials/connection strings; update any dev/test references to the new project via secure credentials, not in issue bodies or logs.

The new project was not modified by this deletion. This is a resource lifecycle update, not new permission to enable CDC or create paid infrastructure.


### Comment c356a918-294e-4421-b902-60785cfca534

Author: jonathan@resnovas.com. Created: 2026-11-15T10:44:12.886Z; updated: 2026-11-15T10:44:12.852Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

## Effect Cluster core deployment decision — 2026-11-15

Jonathan confirmed that **Effect Cluster-backed sharding/distribution is mandatory core architecture** in both Community and Cloud/Production, not an optional future feature. Default **Community/single host = one cluster-capable runner**; default **Cloud/Production = multiple independent runners** with shard ownership, distribution, drain and recovery. Both profiles use the same authorized Effect action, persistence, idempotency and audit path; additional Community runners are supported without a rewrite. Backend cluster transport and SQL runner storage belong behind integrations/composition roots, not inside portable contracts/runtime shared with Expo.

Implementation work is tracked as **EVE-252 (Urgent)**. EVE-42's PG17/Neon-compatible SQL storage interfaces and transactions should explicitly support the cluster's durable runner/advisory-lock requirements. Coordinate file ownership with EVE-252; don't copy the archived legacy cluster platform, claim a generic local ActionHost is distributed, or impose managed Neon on self-hosted Community installations. Require 1-runner and 2+ runner conformance, recoverable persisted actions, failover tests and tenant DB routing. No new dependencies or paid resources authorized by this comment.


### Comment 5dbae902-823e-469e-a334-fc230cf50d43

Author: jonathan@resnovas.com. Created: 2026-11-15T10:48:25.116Z; updated: 2026-11-15T10:48:25.063Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

## Neon inventory correction — legacy project removed

Supersedes the earlier instruction to preserve the Frankfurt PG16 project: current verified inventory reports legacy project `cool-unit-72575963` has been deleted. Do not rely on it or attempt to recreate it. The authorized synthetic London PG17 project `icy-band-49524350` remains the only Eventiva Neon test target. Logical replication stays disabled and separately gated.


### Comment 3172133e-baa0-4c6c-8dbc-394e04c344c6

Author: jonathan@resnovas.com. Created: 2026-11-15T11:22:52.419Z; updated: 2026-11-15T11:22:52.398Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

Neon development access update (owner-authorized): on synthetic London PG17 project `icy-band-49524350` / branch `br-dawn-resonance-zadcbu0j` / database `eventiva_dev`, two staged LOGIN roles now exist. `eventiva_test_runtime` has scoped DML access without schema/database/role creation, RLS bypass, or superuser. `eventiva_test_migrator` additionally has narrowly scoped `CREATE ON SCHEMA public`; default privileges on its future tables/sequences grant runtime access. No credentials are recorded here or stored in Amp.

For current synthetic development validation, Jonathan explicitly authorizes continued use of the existing full-access project secret `EVE_NEON_TEST_DATABASE_URL` to reduce friction. Do not replace or rotate it, and do not treat restricted-role credentials or a separate direct migration secret as a current blocker. Production remains gated on least-privilege credentials and explicit key-management validation. No CDC, paid infrastructure, Data API, provider setting, or production-data change is authorized.


### Comment cee0c114-6c54-4f7d-8e46-41e13cc00559

Author: jonathan@resnovas.com. Created: 2026-11-15T11:29:17.591Z; updated: 2026-11-15T11:29:17.569Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

Authorized live Neon validation completed on the synthetic London PG17.12 development database using the unchanged full-access development secret in memory. Both inventory-provided direct and advertised pooled routes connected through the exact Effect/pg adapter. TLS 1.3 certificate and hostname verification passed; intentional hostname mismatch was rejected on both routes.

The scoped probe passed 16 checks covering migration/reapply/checksum denial, atomic domain/history/outbox/dedup/receipt behavior, replay/hash rejection, rollback on failure/defect/interruption, duplicate/CAS/scarce-stock concurrency, exact value fidelity, tenant-route denial, and synthetic cleanup. Connections were closed and source checkpoints remain unchanged.

Role catalog assertions confirmed both staged test roles lack superuser, CREATEDB, CREATEROLE, REPLICATION, BYPASSRLS, neon_superuser membership, and database CREATE; runtime lacks public CREATE while migrator has it. Effective-role DML/RLS/login validation remains unexecuted after `SET LOCAL ROLE eventiva_test_migrator` was denied with SQLSTATE 42501. Do not claim that restricted-role path, autosuspend, CDC, cross-project isolation, or process recovery as tested. Project counters did not refresh sufficiently to attribute consumption. The PostgreSQL image decision remains a separate delivery gate.


### Comment be798256-81fb-4a13-b44e-9cde29305f17

Author: jonathan@resnovas.com. Created: 2026-11-15T12:00:24.095Z; updated: 2026-11-15T12:00:23.982Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) (comment ID above). Parent: None. Resolved: Not recorded.

Pinned Trixie image evaluation completed without repository or infrastructure changes. Exact candidate `postgres:17.12-trixie@sha256:0d938e975177bef9f1f61f3f9dbcf2e0aa0a139568f66d3415ed8892eb97f6ac` matched metadata. Both amd64 and arm64 scans using Trivy 0.76.2 and vulnerability DB UpdatedAt 2026-11-15T07:02:44Z returned 2 critical, 149 high, 191 medium, 154 low and 11 unknown findings. Compared with the historical Bookworm result, this is -2 critical but +9 high; libxml2 and gosu criticals remain.

Recommendation: do not replace the approved Bookworm pin with this exact Trixie candidate as a security-only upgrade. No CVE was accepted or suppressed, and no image replacement is authorized. Evidence: https://ampcode.com/artifacts/postgresql-trixie-security-evaluation-2284bc44-117c-44e5-92da-721858358c21 . EVE-42 signed checkpoints remain preserved and unpushed pending an explicit bounded Bookworm-risk decision.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
