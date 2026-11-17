# Durable trust nonce consumption

The SQL adapter implements the existing `TrustReplay.consume` port for PostgreSQL and SQLite. A nonce is a unique request identifier. After the independent trust checks succeed, consuming it prevents that nonce from being used again in the same database. This adapter is not activated in application composition.

## Prepare a composition

1. Apply the reviewed migrations in `storage/migrations/<dialect>` with the existing `load` and `migrate` functions. Migration `0007.sql` creates `trust_replay`.
2. Supply the SQL client for the intended trust database to `trustReplay` from `@eventiva/integrations.sql/trust`.
3. Supply a strictly valid `TrustRequest` and trusted `TrustPolicy`. Set `policy.now` explicitly to Unix-epoch milliseconds. Do not accept policy from an untrusted caller.
4. Call `consume` outside every ambient SQL transaction. Success is returned only after this adapter's transaction commits. Even a transaction from another SQL client is rejected.

```ts
import { TrustReplay, type TrustPolicy, type TrustRequest } from '@eventiva/contracts/trust';
import { trustReplay } from '@eventiva/integrations.sql/trust';
import { Effect } from 'effect';

// Trusted composition provides the intended database's SqlClient to this Effect.
export const consumeOnce = (request: TrustRequest, trustedPolicy: TrustPolicy) =>
    TrustReplay.pipe(
        Effect.flatMap((replay) => replay.consume(request, trustedPolicy)),
        Effect.provide(trustReplay)
    );
```

This example consumes a nonce only. It is not an authorization endpoint. Call the port only in a trusted composition after independently verifying the request.

## Inputs, storage and defaults

The layer requires only `SqlClient.SqlClient`; it has no options, automatic activation or retention defaults. Both dialects use the same parameterized statement and their own transaction implementation.

`consume(request, policy)` strictly decodes the existing contract schemas, including nested fields. Extra properties and malformed values are rejected before SQL insertion. `request` contains the exact scope, nonce and immutable key-version references defined by `TrustRequest`. `policy` contains required `now`, four `freshAfter` values and `minimumAssurance`; no time or assurance default is supplied. Schema decoding does not independently verify policy freshness, authority, signatures, revocation or custody.

One row stores the complete decoded secret-free request metadata as JSON, explicit `policy.now` as `consumed_at`, and a generated opaque UUID as `audit`. The primary key is the lower-case UUID nonce; the JSON retains the original spelling. The audit reference is unique. Reusing a nonce fails even if its tenant, purpose, key version or letter casing changes. The uniqueness domain is one physical database, not all independent databases.

Treat stored metadata as access-controlled data. Do not place secrets in requests, expose the table to clients or log full requests. The audit UUID is a lookup reference, not a signature, authorization or cryptographic proof.

## Preserve admitted preflight inputs

Use `trustPreflight` from `@eventiva/runtime/trust` when composing the four
independent verifier ports with replay consumption. It strictly decodes the
request and trusted policy, then takes detached immutable snapshots before any
adapter runs. The snapshots include the nested scope, key references/versions
and all four freshness floors. Schema decoding alone is not an ownership
boundary: it can preserve references to caller-owned objects.

Every verifier and the final replay port receives the admitted original binding
and policy. Caller writes during a suspended verifier, or writes through an
earlier adapter's retained reference during a later gate, cannot substitute the
tenant, purpose, nonce, key versions, evaluation time, freshness or assurance
floor. Caller-owned objects are not frozen or modified by preflight. Changes
made before execution/admission are still input, not a live policy refresh; to
evaluate newly authorized values, start a new preflight.

For example, with an explicit trusted `minimumAssurance: 'A5'` and A4 workload
evidence, an identity adapter's attempted downgrade to A1 cannot turn denial
into success or consume the nonce. Genuine A5 evidence can pass the metadata
checks, but the result still says `release: 'denied'`. A nonthrowing rejected
write does not itself deny otherwise valid original-bound evidence. A throwing
write is sanitized by the existing adapter boundary to that gate's
`TrustFailure` with reason `unavailable`; pure interruption stays interruption.
No raw mutation error, request value or private canary is exposed.

Run the focused isolation and existing failure/binding controls:

```sh
pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/trust.spec.ts --coverage.enabled=false
```

These are public preflight tests with volatile replay fixtures, not a new SQL
durability claim. Direct calls to `TrustReplay.consume` still require trusted
composition and do not gain four-gate verification from input immutability.
This mandatory binding fix adds no rollout switch, policy defaults,
cryptography, key/plaintext release or production composition. See the
[agent boundary note](../ai-docs/src/24_trust/03_preflight-isolation.md).

## Handle failures

All failures expose only `TrustFailure` with `gate: 'replay'` and one of these reasons:

| Reason        | Meaning                                                                 | Next action                                                               |
| ------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `invalid`     | Request or policy failed strict decoding.                               | Correct the trusted input.                                                |
| `replay`      | This database already consumed the nonce.                               | Obtain a fresh authorized request; do not retry the same nonce.           |
| `unavailable` | Ambient transaction, storage/commit failure or UUID generation failure. | Restore the approved composition/storage; reauthorize with a fresh nonce. |

Raw SQL errors, schema diagnostics and request values are not attached to failures. A connection loss during commit can leave the outcome uncertain; failure does not prove that insertion did not commit. Do not automatically replay or delete a row to recover.

Effect cancellation remains interruption rather than becoming an `unavailable` failure. Cancellation is not a receipt and does not prove that a transaction did not commit.

## Limits and checks

There is no cleanup, expiry, retention policy, deletion API, production wiring, cryptography or key release. There is no claim that nonce uniqueness proves current revocation or authorizes decryption. Database durability and access control remain deployment responsibilities. Do not wrap this standalone port in a transaction expecting atomic replay-plus-release.

Run `pnpm exec vitest run --config tests/storage/vitest.config.mts tests/storage/src/trust.spec.ts` against the disposable loopback `eventiva_test` PostgreSQL database and SQLite. Set `STORAGE_TEST_POSTGRES_URL` only to that approved disposable database; the fixture refuses other hosts and database names. Tests apply real migrations, create disposable databases, and cover duplicate/changed-binding replay, concurrent claims, layer reconstruction, malformed inputs, foreign transactions, rollback and sanitized outages. PostgreSQL additionally injects a deferred commit-time failure. Layer reconstruction is not a process-crash or power-loss test; SQLite in-memory fixtures are not disk durability tests.

Run `node tests/storage/fixtures/trust-process.mjs proof sqlite` or `proof postgres`
for the separate real-process proof. The coordinator kills a worker with SIGKILL
inside nonce insertion before commit and verifies no row survives. A replacement
commits, pauses before its IPC acknowledgement and is killed. A third process
refuses the identical nonce and the retained request, timestamp and audit reference
remain unchanged. SQLite uses a disk file; PostgreSQL uses a disposable database.
This tests process loss and reopen, not power failure, replicated database failover,
independent database nonce coordination or atomic replay-plus-key-release.
