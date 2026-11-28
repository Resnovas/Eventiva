# ADR-0008: Verification Tooling, Migration Safety, and Test Isolation

- Status: Accepted
- Date: 2026-11-21
- Owners: Verification & Tooling

## Context

Eventiva's verification pipeline runs across local worktrees, pre-commit hooks, and CI jobs exercising TypeScript AST gates, SQL migration immutability, multi-process crash-recovery harnesses, disposable PostgreSQL databases, and upstream reference security scans. Subtle environment leaks, driver connection quirks, or weak test boundaries can invalidate proofs or mutate developer state.

## Decision

1. **Migration immutability trust tiers and multi-dialect SQL lexer**:
   - `tools/storage/policy.mjs` verifies migration immutability across three trust tiers: local checks compare against `HEAD`, CI supplies a trusted event base SHA via `STORAGE_MIGRATION_BASE` (never trusting a candidate-edited checksum file), and deployments additionally verify against the exported `storage_migration` table via `guard.mjs --applied`.
   - `tools/storage/guard.mjs` uses a custom multi-dialect SQL lexer handling PostgreSQL nested block comments, dollar quotes, `E'...'` escapes, and SQLite quoted identifiers so semicolons inside literals or comments are never misread as statement terminators.
2. **Disposable PostgreSQL test isolation and teardown**:
   - Destructive storage test suites never read `DATABASE_URL` and never target Neon or production databases; they exclusively read `STORAGE_TEST_POSTGRES_URL` restricted to loopback `/eventiva_test` under a least-privilege role granted only `LOGIN` and `CREATEDB` (`tests/storage/src/conformance.spec.ts`, `tests/storage/src/hook.spec.ts`, `tests/storage/src/hook-producer.spec.ts`, `tests/resources/src/invoice-draft.spec.ts`).
   - Teardown avoids `DROP DATABASE WITH (FORCE)` because non-superuser roles cannot signal autovacuum workers; instead it calls `pg_terminate_backend` filtered by `usename = current_user` before `DROP DATABASE` (`apps/server/tests/sql-fixture.mjs`, `tests/storage/fixtures/*.mjs`).
   - Because `@effect/sql` shares one `SqlClient.TransactionConnection` tag across clients, queries against a secondary `SqlClient` inside another client's transaction omit `SqlClient.TransactionConnection` from input context (`apps/server/tests/sql-fixture.mjs`).
3. **SQLite vs PostgreSQL concurrency, DDL lifecycle, and finalization errors**:
   - SQLite clients cache failed prepared statements attempted before DDL migrations run, so upgraded binaries and post-migration services open fresh SQLite clients after schema migrations complete (`tests/storage/src/hook.spec.ts`).
   - In-process concurrency tests use a second PostgreSQL connection for server-side row locks, while SQLite uses the shared client semaphore in-process (avoiding `SQLITE_BUSY` on synchronous JS driver threads) and proves multi-process contention in separate process fixtures (`tests/storage/src/hook.spec.ts`, `tests/resources/src/invoice-draft.spec.ts`).
   - When `COMMIT` or `ROLLBACK` fails before executing, production retention maintenance fails closed without ad-hoc connection recovery, leaving disposal to the pool (`tests/storage/src/approval-finalization.spec.ts`).
   - Child-process crash-recovery tests run directly under Node and resolve emitted workspace package subpaths rather than Vitest source aliases, requiring builds before storage tests (`tests/storage/src/*-process.spec.ts`).
   - Live Keycloak 26.8.2 OIDC conformance runs in a dedicated Vitest configuration (`apps/server/vitest.keycloak.mts`) excluded from the default test target and fails closed when `OIDC_TEST_ISSUER` is unset (`apps/server/tests/keycloak.conformance.ts`).
4. **Vitest, affected selection, and verification runner hygiene**:
   - The exported client smoke runs without a flag provider. Assert that the optional banner is absent: this tests the safe default, not a remotely configured flag. The rendered module count exercises ICU plural formatting in the same browser session (`apps/client-e2e/src/shell.spec.ts`).
   - `vitest.shared.ts` sets Vite `root` to `workspaceRoot` while anchoring `test.dir` to each suite's `projectRoot` so Vitest transforms uncovered TypeScript files in `packages/<pkg>` outside `tests/<pkg>`.
   - `tools/verification/run.mjs` expands changed paths through the transitive reverse closure of resolved workspace import edges, records a full working-tree `treeDigest` alongside `HEAD`, enforces a strict child environment allowlist (permitting `STORAGE_TEST_POSTGRES_URL` only for loopback `eventiva_fixture` databases), and forces `NX_PARALLEL=1`, `NX_DAEMON=false`, and `NX_NO_CLOUD=true` to avoid lease-sensitive CPU/DB contention.
   - `tools/verification/affected.mjs` runs `git diff --no-renames` so both old and new paths trigger affected projects, and treats root config/tool/workflow edits as triggering the entire `tools/**/*.test.mjs` root tooling suite.
   - `tools/verification/pre-commit.mjs` strips every variable from `git rev-parse --local-env-vars` so nested disposable Git repositories created during tests cannot mutate the caller's outer worktree; nested `node --test` subprocesses omit `NODE_TEST_CONTEXT` so Node does not silently skip executing child test files (`tools/verification/run.test.mjs`).
5. **Documentation, planning, telemetry, and supply-chain governance**:
   - `tools/documentation/ratchet.mjs` blocks copied undocumented callbacks on added diff lines even when their fingerprint matches historical debt, and keeps legacy-to-canonical fingerprint reconciliation private inside trusted Git base-commit bytes.
   - `tools/function-telemetry/structure.mjs` requires identity-group multiplicity to match between prior and current files so copying an anonymous sibling cannot inherit an unreviewed ordinal.
   - `tools/documentation/linear-mirror.mjs` permanently excludes wrong-repo issue `EVE-10` by owner direction (2026-11-17); `tools/documentation/planning.mjs` wraps SVG roadmap node titles at 23 characters and applies presentation normalization only to generated views while preserving byte-faithful mirror evidence.
   - `tools/documentation/planning.mjs` lets later reported verification change planning readiness but never the captured service fields, and a duplicate or canceled closure never counts as delivering the prerequisite contract it recorded.
   - `tools/documentation/sync-linear.mjs` refuses to carry enrichment onto an edited source whose current accuracy it cannot read, and preflights generated markers and removals before it changes the normalized snapshot or any page.
   - `tools/references/import.mjs` stages upstream references via `git archive` (no symlinks, no submodules, no install scripts) for manual `git subtree` import; `tools/references/check.test.mjs` pins `ossf/scorecard-action` v2.5.0 for PNPM workspace coverage and verifies OSV `.gitignore` exclusion with `git check-ignore --no-index`.

6. **Resource package boundaries** (`tools/resources/boundaries.mjs`):
   - The approved parser-flag AST fingerprint is evaluated before TypeScript binds the file, because binding annotates those flags.
   - Files are bound without vendor declarations: import provenance, not assignability or vendor-internal erased types, defines this syntax gate. A real local `Schema` binding, including a lexical shadow, is not Effect and keeps the unbound direct-form diagnostic.
   - Only owned emitted files are expanded; the separate graph gate diagnoses unresolved and source edges.
   - Consumer declarations are resolved without the `development` source condition so published types never silently follow source.

## Consequences

- Local, pre-commit, and CI verification runs stay deterministic, isolated from developer secrets and databases, and immune to silent skips or fingerprint forgery.

## References

- `vitest.shared.ts`
- `apps/server/vitest.keycloak.mts`
- `apps/server/tests/keycloak.conformance.ts`
- `apps/server/tests/sql-fixture.mjs`
- `tools/storage/guard.mjs`
- `tools/storage/policy.mjs`
- `tools/verification/affected.mjs`
- `tools/verification/pre-commit.mjs`
- `tools/verification/run.mjs`
- `tools/verification/run.test.mjs`
- `tools/documentation/ratchet.mjs`
- `tools/documentation/linear-mirror.mjs`
- `tools/documentation/planning.mjs`
- `tools/function-telemetry/structure.mjs`
- `tools/references/import.mjs`
- `tools/references/check.test.mjs`
- `tools/documentation/sync-linear.mjs`
- `tools/resources/boundaries.mjs`
