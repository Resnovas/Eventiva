<!-- linear:generated:start -->
# EVE-39: Make every entity action idempotent and persisted by default

[Live Linear source](https://linear.app/resnovas/issue/EVE-39/make-every-entity-action-idempotent-and-persisted-by-default) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T21:55:43.584Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Code, Decision: Audit needed, Delivery: Implementation pending, Enhancement |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-103](EVE-103.md), [EVE-114](EVE-114.md), [EVE-145](EVE-145.md), [EVE-170](EVE-170.md), [EVE-172](EVE-172.md) |
| Related to | [EVE-18](EVE-18.md), [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-63](EVE-63.md), [EVE-71](EVE-71.md), [EVE-76](EVE-76.md), [EVE-107](EVE-107.md), [EVE-191](EVE-191.md), [EVE-252](EVE-252.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Every action that reaches an entity is persisted and carries an idempotency key, so the at-least-once delivery the cluster gives can never double-apply a change.

## Context

* Found in <issue id="37a1be99-529e-478c-a187-48c120672aeb" label="EVE-18" href="https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and" />. Evidence: `/mnt/project-files/eve-18/kill/analysis.txt`.
* Persisted RPCs with a `PrimaryKey` lost nothing in any scenario and arrived in order per entity, but SIGKILL produced 12 duplicate handler executions out of 10,000 (messages in flight when the runner died were replayed on the new owner).
* Non-persisted RPCs are dropped during moves (up to 42%).
* `DemoEntity.Shoot` is declared `Persisted=false`, which is the wrong default to copy.

## Work

1. In the shared action contract (<issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> actions, Effect Schema), require an `idempotencyKey` on every mutating action and make it the RPC `PrimaryKey`.
2. Entity handlers write a `(entity, idempotencyKey)` row in the same transaction as the change and skip if it exists. Provide this as one core helper, not per handler.
3. Make `ClusterSchema.Persisted` true the default in the core entity helper; volatile needs an explicit opt-in with a comment.
4. Test with two SQL runners: kill one mid-stream and assert zero double-applied changes (count rows, not log lines).

## Acceptance

Duplicate test passes; the helper is used by the demo entity.

## Done signal

Comment with the test output.

## Linear comments (2)

### Comment a66d4df3-06ed-44fe-8df3-470ff08a108b

Author: GitHub. Created: 2026-10-31T22:29:55.608Z; updated: 2026-10-31T22:29:55.588Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-39/make-every-entity-action-idempotent-and-persisted-by-default) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/806). All replies are displayed in both locations.


### Comment f801aab4-5db2-4be2-8605-af7158ec3876

Author: jonathan@resnovas.com. Created: 2026-11-15T01:45:06.386Z; updated: 2026-11-15T01:45:06.374Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-39/make-every-entity-action-idempotent-and-persisted-by-default) (comment ID above). Parent: None. Resolved: Not recorded.

## Approved foundation policy reference

Jonathan approved A2–A4 and S2–S4 on 2026-11-15. Approval cannot be self-issued or weakened; guarded offline/scheduled work uses explicit state/version/idempotency/deadline and online revalidation; protected audit fails closed; scarce resources use ledgers/reservations/CAS; device records use typed raw tables/migrations; migrations are forward-only expand/contract; canonical IDs/time/decimals follow S4. See [EVE-40](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema), [EVE-42](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state) and the [decision sheet](https://ampcode.com/artifacts/eventiva-architecture-decisions-3169b540-652d-4795-ae9c-7ad78a534f17). No dependencies or implementation are approved by this cross-reference.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
