# Trusted approval-retention maintenance

Refs: EVE-275. Refs: Resnovas/Eventiva#1063. Whole Core remains open.

Use `@eventiva/contracts/approval-retention` for the typed
`ApprovalRetentionMaintenance` service, required `ApprovalRetentionRequest`,
`ApprovalRetentionResult` and closed `ApprovalRetentionFailure`. Compose the
`@eventiva/integrations.sql/approval-retention` `approvalRetentionMaintenance`
layer with the existing physically routed `SqlClient.SqlClient` and
`CurrentTenant`; no dialect parameter or new dependency is needed. This is a
trusted lifecycle capability, not an action, endpoint, scheduler or activation.
See `docs/core-qualification/approval-retention.md` for complete composition,
migration steps, options, examples, error handling and preservation limits.

Call `run({tenant, limit, after?})` with explicit integer `limit` 1..100 and
optional exclusive UUIDv7 cursor. There is no default limit, cadence or tenant
selection. Tenant mismatch denies before SQL. Standalone invocation commits
before returning; an enclosing SQL transaction must commit before its owner
acknowledges these provisional counts/cursor externally. `next`, when present,
is the last inspected ID and continues this traversal.
Restart from the beginning on a later pass because retained proofs can become
eligible after an earlier cursor. Never advance a cursor on failure.

Acquire `identity_guard` first, sample one operation time inside that SQL
transaction and never run business handlers there. Reuse the existing
`ApprovalRetention` and `approvalRetentionEnd` contract. The current validated
record's deadline is exactly
`approvalRetentionEnd(usedAt ?? revokedAt ?? expiresAt, retention)`.
First use/cancel replaces the provisional expiry anchor; replay never renews.
Earlier immutable decision snapshots may retain their original provisional
anchors; they do not override the current proof's terminal retention.

Fetch at most limit+1 proofs and inspect at most limit. The producer permits
issuance plus one terminal decision only; inspect at most three decisions per
eligible proof and fail closed on a third. Delete history only after terminal
retention, and operational proof only after BOTH expiry and retention. Keep
decision UPDATE immutable and DELETE protected with exact ID/revision/body
permits and temporal triggers in additive PostgreSQL/SQLite migration0013.
Permits are scoped to the guarded transaction and removed before commit,
never a global disable flag or independent evidence store.

Sanitize `invalid`, `denied`, `unavailable` failures without raw SQL/proof data.
Typed pre-commit failures roll the page back when SQL finalization succeeds,
including permits and preceding deletions; retry explicitly after fixing the
cause. The installed SQL driver turns commit/rollback errors into defects;
the provider maps only `SqlError` leaves in either failure channel to bounded
`unavailable`. Preserve other typed errors, unrelated defects, interruption and
sequential/parallel cause structure. Never expose SQL diagnostics through a
serialized Exit/Cause or acknowledge counts/cursor on a failed Exit.
Actual two-client SQLite/PostgreSQL finalization tests distinguish rejected
COMMIT, real COMMIT with lost acknowledgement and rejected ROLLBACK. Lost
acknowledgement can mean committed deletion; failed rollback is not restoration.
Keep the original cursor and establish a usable, settled connection before an
explicit existing-state retry. Fixture-only rollback before retry is not
provider recovery, automatic pool repair or exactly-once acknowledgement.
No automatic retry, second transaction owner or reversal protocol is added.
Production lifecycle recovery/release remains separately qualified. Preserve action_commit,
receipts, business state/history/dedup and outbox. Do not claim backup, replica,
WAL/journal, exported evidence or external-processor erasure. Production
migration/activation, schedule/cadence and operational retention of those
copies need separate authorization. No public runtime behavior is activated
by this unregistered composition-only capability.
