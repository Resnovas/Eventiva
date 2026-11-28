# ADR-0004: Action Execution, Human Approvals, and Idempotent Replay

- Status: Accepted
- Date: 2026-11-21
- Owners: Runtime & Security

## Context

`ActionHost` executes tenant-scoped, permissioned actions invoked by humans and delegated agents, with optional human approval consent, optimistic concurrency checks, and idempotent mutation replay. Authority, deadlines, and policy limits can change while a transaction waits on a lock, while a handler suspends, or between an original mutation and a later replay.

## Decision

1. **Fail-closed composition root with no volatile defaults**: `ActionHostLive` leaves `IdentityStore`, `Storage`, `Approvals`, `InputDigest`, `Flags`, and `CurrentTenant` as required services (`ai-docs/src/15_identity/01_host.ts`, `tests/runtime/src/host.spec.ts`). Optional approval stores fail closed when absent rather than falling back to in-memory stores (`packages/runtime/src/host.ts`).
2. **Pure two-stage module registration and LIFO teardown**:
   - Module registration computes a pure plan from the current registry snapshot and candidate definitions, then re-runs the same plan under the commit lock so preflight and publication enforce identical invariants (`packages/runtime/src/host.ts`).
   - Each registered module acquires its layer in a child `Scope` whose release finalizer is registered before the registry-removal finalizer. Because Effect scopes run finalizers LIFO, routes are removed from `ActionHost` before module resources close.
3. **Canonical `Caller` propagation and layer precedence**:
   - Execution resolves the canonical `Caller` and overlays only `Caller` onto the module's captured context (`packages/runtime/src/execution.ts`, `packages/runtime/src/host.ts`). All other services keep module-composition precedence so ambient request layers cannot hijack module dependencies.
   - Modules registered on `ActionHost` read per-invocation identity via `Effect.serviceOption(Caller)` or pick `Caller` as a placeholder that `ActionHost` overlays per call (`apps/server/src/approval-consent.ts`, `tests/runtime/src/caller-qualification.spec.ts`).
4. **Action version vs resource version and discovery boundary**:
   - `ActionHost` requires exact matches against the registered action contract version, independent of domain optimistic concurrency `expectedVersion`.
   - Action discovery evaluates visibility from live refreshed identity and never confers target-level execution authority because no decoded target exists at discovery time.
5. **Invocation exit outcome taxonomy**: Declared schema errors become typed business failures (`ActionFailed`), authorization or policy rejections become denials, and all untyped causes remain defects (`packages/runtime/src/execution.ts`).
6. **Two-phase admission vs in-transaction commit revalidation**:
   - Admission asserts pre-mutation validity (allowing handlers to legitimately advance revisions or consume state).
   - Because acquiring the `Integrity` transaction lock and running a handler can suspend across grant, approval, or deadline expiry, authority and deadlines are revalidated inside the transaction before and after handler execution so expired attempts roll back cleanly.
7. **Monotonic approval policy, canonical binding, and provenance separation**:
   - Effective approval requirements take the strictest floor across action specification, risk/agent policy, and live tenant policy. Once an attempt is admitted under approval, a subsequent live policy relaxation cannot clear the latched requirement before commit.
   - Approval preparation encodes inputs through the exact invocation codec used at execution time and binds the live policy limits in force at issuance (`packages/runtime/src/approval.ts`, `tests/runtime/src/approval.spec.ts`).
   - Approval lookup is read-only and decoupled from transactional consumption so denied or rolled-back executions do not burn pending approvals.
   - Approval completion requires live target authority for both the consenting human and the requesting agent; immutable approver provenance is stored separately from the executing principal.
   - Approval consent cannot target intrinsic consent actions (`apps/server/src/approval-consent.ts`), and event-scoped cancellation independently verifies continued event association rather than treating event membership as broadened resource authority.
8. **Idempotent replay semantics**:
   - Mutation deduplication keys bind `(tenant, subject, delegation, action, version, idempotencyKey)` so retries span refreshed sessions without crossing delegation boundaries (`packages/runtime/src/storage.ts`, `tests/runtime/src/caller-qualification.spec.ts`).
   - Replay separates deduplication from authority: every replay re-runs live identity, policy, approval, step-up, and optimistic precondition (`expectedVersion`/`expectedState`) checks, and writes its own fenced replay audit receipt attributed to the newly admitted session (`packages/runtime/src/execution.ts`, `packages/runtime/src/storage.ts`, `tests/runtime/src/execution-approval-commit.spec.ts`).
   - An ordered HTTP batch can fail after a committed prefix. Keep its original keys and inputs for reconciliation; a new receipt identifies a new attempt, not a rollback. Historical output is private to the authorized caller and is not a current resource read (`ai-docs/src/29_http/03_batch.ts`, `ai-docs/src/30_crm/01_organisations.ts`).
9. **Durable event boundaries in the compiling examples**:
   - Use the domain write's tenant storage transaction for its receipt, minimized hook facts and approved observer pins. Otherwise an invoice command or observer event could survive a rolled-back write. Keep money in exact minor-unit strings; the storage example deliberately exceeds JavaScript's safe integer range.
   - Read the hook feed outside the transaction and persist its cursor only after durable acceptance. A retained producer attempt may already have mutated an external system: query its status rather than invoking its callback again. For output reconnect, retry identical event content and read strictly after its committed offset.
   - Registration and metadata examples confer no execution or release authority. The host supplies the current caller and authenticated tenant, checks field visibility at use time, and keeps private results out of telemetry. Recording an exchange requires an owned lease; a valid signature, inventory listing, kit definition or location record grants neither decryption nor a stock movement.

## Consequences

- Cached execution success never becomes cached authorization.
- In-flight revocations, expired deadlines, and tightened policy limits take effect before commit or replay release.
- Note: a known gap where shared replay skips handler-level Resource reauthorization checks is tracked separately as a filed issue from this audit.

## References

- `packages/runtime/src/host.ts`
- `packages/runtime/src/execution.ts`
- `packages/runtime/src/approval.ts`
- `packages/runtime/src/storage.ts`
- `apps/server/src/approval-consent.ts`
- `tests/runtime/src/approval.spec.ts`
- `tests/runtime/src/caller-qualification.spec.ts`
- `tests/runtime/src/execution.spec.ts`
- `tests/runtime/src/execution-approval-commit.spec.ts`
