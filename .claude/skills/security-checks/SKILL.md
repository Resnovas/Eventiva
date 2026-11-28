---
name: security-checks
description: "The seven house security checks and how to pass them first time: secrets stay on the server, row-level security on every SQL table, unguessable IDs with access checks, server-side admin gating, no common or production test credentials, rate limits and AI budgets on every endpoint, and server-side input validation with bound SQL and no raw HTML. Use when writing or reviewing server routes, actions, SQL migrations, environment variables, seeds, fixtures, client bundles, AI calls or rendering of user content, and when a house-security lint rule or tools/security/scan.mjs finding fails."
---

# Security checks

Seven checks stop insecure code before it deploys. They run in the commit gate (`verify:static`) and in CI (`verify`), and every finding fails the build. The lint rules live in `tools/lint/security.mjs`; the scanner lives in `tools/security/scan.mjs`. Both come from `Resnovas/.github` through house sync: change them there, never in a downstream copy. Adoption steps are in `docs/security-checks.md`.

Fix the code, never the check. Do not add `eslint-disable`, widen `ignores`, or add a baseline entry to get a green build. A baseline entry is only for a violation that existed when the check was adopted, and it needs its own follow-up issue.

## 1. Secrets stay on the server

**Why:** anything in a client bundle (Expo web, Android, iOS) is public. An API key in a bundle is a leaked key.

| Finding | Fix |
| --- | --- |
| `house-security/no-secret-env` `publicSecret` | A secret-like name (`SECRET`, `TOKEN`, `PASSWORD`, `API_KEY`, `*_KEY`, `DATABASE_URL`...) has a public prefix (`EXPO_PUBLIC_`, `NEXT_PUBLIC_`, `VITE_`...). Rename it without the prefix, read it on the server, and expose a server action that uses it. A value that is publishable by design (such as a PostHog project key) goes in the rule's `allow` list with the reason beside it. |
| `no-secret-env` `clientSecret` | Client code reads a secret-like variable. Move the call behind a server action. |
| `house-security/no-server-import` | Client code imports `server-only`, a `*.server` package or a `/server` path. Call the server instead, or move shared types to a portable package. Nx module boundary tags enforce the same split between projects. |
| `security/secret` | A key format (AWS, GitHub, Slack, Stripe, Google, OpenAI, Anthropic, private key, password in a URL) or a high-entropy value under a secret-like name is committed. Revoke and rotate it first, then remove it. Deleting it in a later commit does not unleak it. |
| `security/bundle-secret` | The built client bundle contains a secret. Same fix as above, then rebuild. |

Test fixtures that need key-shaped strings build them at runtime, for example by joining a prefix and a generated body, so the file never contains the literal.

## 2. Row-level security wherever there is SQL

**Why:** one missing `WHERE tenant = ...` leaks another tenant's data. Row-level security makes the database refuse it.

| Finding | Fix |
| --- | --- |
| `security/rls-enable`, `rls-force`, `rls-policy` | In a forward migration, add `ALTER TABLE t ENABLE ROW LEVEL SECURITY`, `ALTER TABLE t FORCE ROW LEVEL SECURITY` and at least one `CREATE POLICY ... ON t` that admits only the current tenant or principal, read from transaction-local context (`SET LOCAL`, `current_setting`). |
| `security/bypassrls` | Never grant `BYPASSRLS` to the application role; create roles with `NOBYPASSRLS`. Only a separately approved migration or operations role may differ, and never in runtime code. |

SQLite has no row-level security. Enforce the tenant guard in the storage layer (one database bound to one tenant, checked on every scope) and test it. Every tenant-scoped repository needs a test that proves one tenant cannot read or change another tenant's rows.

## 3. Unguessable URLs, with access checks behind them

**Why:** `/invoice/1042` invites `/invoice/1043`. Random IDs stop guessing; access checks stop everything else.

| Finding | Fix |
| --- | --- |
| `security/sequential-id` | Replace `SERIAL`, `BIGSERIAL`, `GENERATED ... AS IDENTITY` or `AUTOINCREMENT` with a random UUID (application UUIDv7 or `gen_random_uuid()`) for anything that can appear in a route or public API. |

An unguessable ID is not a permission. Every route or action that loads a resource checks that the caller may access that resource, and a test proves that a valid ID belonging to someone else returns not-found (not forbidden, which confirms it exists).

## 4. Admin pages are permission-gated, not hidden

**Why:** hiding a link stops nobody who can type a URL.

| Finding | Fix |
| --- | --- |
| `house-security/require-declaration` on the guard property | Declare the permission on the registration (for example `permission: 'admin.users.delete'`) so the server checks it on every call. Check access to the specific resource too, not only the page. |

## 5. No common admin or test credentials

**Why:** `admin`/`admin` and `test`/`password` are the first logins every attacker tries.

| Finding | Fix |
| --- | --- |
| `house-security/no-common-credentials`, `security/common-credential` | Replace the denylisted value (`admin`, `administrator`, `root`, `password`, `test`, `123456`...) with the repository's unique fixed test identifier, such as a string of digits. It may be committed. |

Committed test accounts must only work in local and test environments: the seed refuses to run when the environment is production or unknown, and a test proves that refusal.

## 6. Rate limiting everywhere, including AI

**Why:** without a limit, one client can exhaust the service, brute-force a login, or run up an AI bill.

| Finding | Fix |
| --- | --- |
| `house-security/require-declaration` on the rate-limit property | Declare the rate-limit policy on the action or route registration. The runtime enforces it per caller and per tenant. |

Every AI model call and agent skill goes through the budgeted, rate-limited AI port with a per-tenant spending budget; never call a model SDK directly. Lint cannot stop a runaway bill at runtime, so the owner also sets provider-side spend caps on every AI provider account.

## 7. Server-side input validation, no SQL injection, no XSS

**Why:** every public input is attacker-controlled. Client form checks are convenience only.

| Finding | Fix |
| --- | --- |
| `house-security/require-input-decode` | A server function reads request input (`body`, `query`, `params`, `headers`, `cookies`, `text`, `json`, `url`...) without decoding it. Decode it with the shared Effect Schema boundary (`Schema.decodeUnknown`, `HttpServerRequest.schemaBodyJson`) in the same function before use. Webhooks and uploaded file metadata go through the same step. |
| `house-security/no-raw-sql` | Use the tagged `sql` template or the query builder, which binds every value. Use `sql(identifier)` for a trusted identifier in DDL. `sql.unsafe`/`raw` accept only a constant string; only the allowlisted migration runner may execute statements read from migration files. |
| `house-security/no-raw-html` | Render user content as text through components. If HTML is unavoidable, pass it through an approved sanitiser listed in the rule's `sanitizers` option. The web app also sets a strict Content Security Policy. |

## Limits

The checks are lexical. They do not follow aliases, prove that a policy predicate is correct, or measure runtime spend. Keep the behavioural tests named above (cross-tenant, IDOR not-found, production seed refusal, budget exhaustion); a passing lint is not proof that access control works.
