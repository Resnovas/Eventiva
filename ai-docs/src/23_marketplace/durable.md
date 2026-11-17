# Durable participant metadata

Compose `marketplace(dialect)` from `@eventiva/integrations.sql/marketplace` with one trusted marketplace `SqlClient`. It provides the existing `MarketplaceStore` plus `MarketplaceAdministration` and `MarketplaceOutbox` from `@eventiva/contracts/marketplace-durable`. Forward migration 0006 is additive; the integration owner applies it through the existing checksum-verifying runner. No production consumer is activated.

## Authority contract

Provide `Caller`, `CurrentTenant` and live `MarketplaceOperatorPolicy` on each administration/processing invocation. The operator policy must independently refresh identity/session/delegation, authorize the exact operation/full exchange scope and enforce classified-metadata/assurance requirements. There is a deny layer, not an accepting production layer. Provision/revoke require the owner tenant; audit/process require a participant. Processing additionally requires the original intent subject, participant tenant and delegation. Outbox calls also require the independent live `MarketplaceAuthority` for the original classified snapshot. Missing authority never becomes an implicit allow.

The existing staging runtime retains strict decoding, default-off flag, live `IdentityResolver` and metadata authorization, including identical command retries. SQL serializes those checks with revocation. Store callbacks preserve `A`, `E`, `R`, rollback on all causes and reject ambient/escaped transaction capabilities. This is one marketplace database transaction, never cross-tenant/cross-database ACID.

## Requests

- `provision({ request, snapshot, grant })`: strict UUID request key, immutable complete snapshot reference and matching participant grant with explicit future expiry. Owner-only, audited and idempotent after live operator authorization. Replay never unrevokes a grant.
- `revoke({ request, scope, grant })`: monotonic, owner-only revocation with atomic audit/idempotency evidence.
- `audit({ scope, limit })`: live authorized participant-scope query; explicit limit 1 through 100, no public metadata enumeration.
- `claim({ command, leaseMs, maxAttempts })`: known local command only; explicit positive safe integers, no policy defaults. First claim pins maxAttempts. Database clock determines lease expiry. Returns `{ command, lease, attempt }` or no eligible item.
- `settle({ claim, outcome })`: `recorded` means local evidence only; `retry` requires explicit `availableAt`. New settlement requires the current unexpired fence. Exact accepted settlement replay reauthorizes but never mutates later state; changed body conflicts. Retry exhaustion and grant/metadata blocking are durable audit events. Unavailable policy rolls back; denied operator does not alter state.

The new PostgreSQL attempt/budget columns are bigint so the strict safe-integer contract is not narrowed to 32 bits. New settlement checks lease expiry again after live authorization, not only before a potentially slow policy call. Administration/outbox boundaries sanitize policy defects to unavailable while preserving interruption; generic trusted store callbacks retain their original causes and environment. Tests reproduce these boundary failures before the fixes. The compiling `02_durable.ts` example retains the SQL client and all live per-call services as requirements.

No external saga effects, transport, accepting sink, payload release or admin redrive exists. EVE-251's provider-neutral architecture is confirmed, but concrete crypto/vendor/custody composition remains unapproved; `privateExchangeUnavailable` still fails `trust-unapproved`. No canonical record IO, payment, jurisdiction, freshness, retention or residency defaults are supplied.

## Validation and integration

Storage specs exercise both dialects, concurrent staging/claims, identical/changed retries, foreign tenants, monotonic revocation, audit rollback, error/cause preservation, foreign ambient transactions and escaped transaction capabilities. The process fixture uses public package imports and six actual SIGKILL/reopen workers against the same database, proving rollback before commit, stage/settlement acknowledgement loss, lease reclamation/stale fencing and persisted revocation. PostgreSQL execution uses only the existing authorized disposable loopback fixture. No production tests or migrations are authorized.

Central owns public export maps, numbered migration files, the compiling agent TypeScript example, documentation generation and graph refresh. Do not substitute source aliases in the integrated tree. Disable composition to roll back application usage; retain additive tables/evidence, with no down/reset/retention operation.
