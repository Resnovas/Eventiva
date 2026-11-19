# Required trusted session policy - packet B

## START - 2026-11-19T11:25:41Z

Refs: [EVE-275](https://linear.app/resnovas/issue/EVE-275),
[Resnovas/Eventiva#1063](https://github.com/Resnovas/Eventiva/issues/1063).

Packet B starts in the existing
[Sol owner thread](https://ampcode.com/threads/T-01a1f129-c9e5-733f-bdbd-2dc010253693),
with no delegation. Freshly fetched published main and starting HEAD are
`e7370b021e22cc0f855a40100df93ac6076fdc86`. The isolated worktree is
`repo-session-policy`, branch `agents/eve275-session-policy`. Original provider,
held fencing candidate, proof checkpoints, worktrees and bundles remain unchanged.

Exclusive handwritten scope is this report plus new
`apps/server/src/identity-session-policy.ts` and
`apps/server/tests/identity-session-policy.spec.ts`. Packet A retains production
backend/OIDC/host/execution/router/approval composition and shared authored guides.
No unpublished provider, its migration or held fixture is a dependency of B.

The [canonical packet](approval-wiring.md#packet-b-independent-required-session-policy-capability)
requires typed trusted configuration, refreshed policy, tenant isolation and
fail-closed missing/invalid configuration. The tenant window is at least five
minutes, at most the configured session maximum, and capped by actual live session
expiry. Jonathan's actual duration and authority choice remain pending. No
production value, default, generic preference Settings, step-up, dependency,
activation or spend is authorized or inferred. Whole EVE-275/Core remains open.

## Evidence and integration state

The [Linear START](https://linear.app/resnovas/issue/EVE-275#comment-de8e6c56-629d-4efe-b93f-5d9e8b39301d)
has an [independently read GitHub mirror](https://github.com/Resnovas/Eventiva/issues/1063#issuecomment-7007804596).
Both references are non-closing. The implementation is an unactivated security
policy capability, not proof of authenticated session issuance or full approval
wiring. No existing tests, thresholds, fixtures or production composition changed.

### Stable public contract

`apps/server/src/identity-session-policy.ts` exports:

- `IdentitySessionPolicyValue`, the Schema and inferred type containing required
  `tenant: TenantId`, `sessionLifetimeMs: number` and `approvalWindowMs: number`.
- `SessionPolicyFailure`, a tagged typed error with closed reasons `unavailable`,
  `invalid`, `tenant` or `expired`. Decode and Config diagnostics are discarded,
  not attached as causes or included in public errors.
- `IdentitySessionPolicy`, a Context service whose `current` is
  `Effect<IdentitySessionPolicyValue, SessionPolicyFailure>`, `sessionExpiresAt` is
  `Effect<number, SessionPolicyFailure>`, and
  `approvalExpiresAt({ tenant, expiresAt })` returns the latter Effect type.
- `identitySessionPolicy(source: Effect<unknown, SessionPolicyFailure>)`, returning
  `Layer<IdentitySessionPolicy, never, CurrentTenant>`. The routed tenant is bound
  once; policy is reread and decoded on every operation, not cached in request
  context or captured when the layer is built.
- `sessionPolicyFromConfig`, an unactivated Effect with the same value/error
  output as `current`. `IDENTITY_SESSION_POLICY_TENANT`,
  `IDENTITY_SESSION_MAXIMUM_MS` and `IDENTITY_APPROVAL_WINDOW_MS` are all mandatory.
  It has no defaults or automatically selected configuration authority.

Durations are finite safe-integer milliseconds. The configured approval window
must be at least 300000 and no greater than the configured session maximum.
Absolute deadlines and the current clock must be nonnegative safe integers;
overflow is denied before an earlier live-session cap can conceal it.
`sessionExpiresAt` computes now plus the current maximum. `approvalExpiresAt`
requires the separately supplied session's tenant to match, denies expiry at or
before now, and returns the earlier of now plus the current approval window and
that actual expiry. A remaining session lifetime below five minutes is usable;
the five-minute minimum constrains configuration, not remaining session life.

### Clause-level executed evidence

All seven public-contract tests are in
`apps/server/tests/identity-session-policy.spec.ts`, using `@effect/vitest` and
explicit injected policy/clock values, without an unpublished provider import.

| Boundary                              | Observable evidence                                                                                                                                             | Limit                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Required policy, no one-hour fallback | Missing tuple/each Config field, malformed or excess fields and unavailable source deny; explicit two-hour maximum yields the independently calculated deadline | No production maximum selected                                  |
| Window and actual expiry              | Two-hour maximum, 15-minute window and earlier asymmetric actual expiry; exact five-minute configuration and five-millisecond remaining session                 | Supplied expiry must first be authenticated elsewhere           |
| Tenant isolation                      | Foreign valid policy and earlier foreign session deny; a separately routed second tenant succeeds                                                               | Trusted router is an injected prerequisite                      |
| Fresh security policy                 | Change the source without rebuilding the service; current value and both deadline operations change, then foreign/missing values deny                           | No claim of database locking or atomic admission                |
| Numeric safety                        | Below-minimum, fractional, nonfinite, unsafe-integer, expired and overflowing deadlines deny                                                                    | Clock and live-session freshness remain composition obligations |
| Sanitized failure                     | Config canary is absent from serialized errors; no raw cause is exposed                                                                                         | Trusted source adapters must use the closed failure contract    |

### Commands and decisive results

Executed in the isolated B tree based on
`e7370b021e22cc0f855a40100df93ac6076fdc86` plus the three reserved files:

- `NX_DAEMON=false NX_NO_CLOUD=true pnpm exec nx run-many -t lint typecheck build -p @eventiva/server --outputStyle=static`:
  exit 0, 23 successful tasks including dependencies; lint has zero errors and
  11 existing non-null assertion warnings in unchanged test files.
- `pnpm exec vitest run --config apps/server/vitest.config.mts apps/server/tests/identity-session-policy.spec.ts --coverage.include=apps/server/src/identity-session-policy.ts`:
  seven tests pass; 100% statements, branches, functions and lines for the new
  module. This supplemental run does not replace the normal suite.
- `NX_DAEMON=false NX_NO_CLOUD=true bash .amp/in/orb-backup/session-policy-postgres.sh pnpm exec nx run @eventiva/server:test --outputStyle=stream`:
  exit 0, 14 successful tasks; real PostgreSQL Cluster and module-run conformance
  succeed; normal Vitest 14 files/63 tests pass, statements 97.83%, branches
  95.32%, functions 96.36%, lines 98.26%. The disposable existing fixture uses
  pinned PostgreSQL 17.12, a non-superuser application role and cleanup on exit.
- `node --run check`: exit 0; 104 documentation fixtures pass, 284 editable
  TypeScript files, zero strict findings and zero ratchet violations.

An initial offline dependency installation could not find the pinned TypeScript
tarball; `pnpm install --frozen-lockfile` then installed the existing approved
lockfile without manifest, dependency or version changes. Initial strict
documentation scanning identified missing rationale comments; those were
addressed with boundary-specific explanations, not suppressions or checker edits.

### Remaining composition and authority obligations

Packet A owns the normal server coverage include amendment: the current
`apps/server/vitest.config.mts` explicitly enumerates sources and does not yet
include this new module. Test discovery already includes the new spec. The
supplemental 100% run establishes current coverage but is not a permanent include
or combined acceptance claim.

A must consume this capability inside the trusted tenant route, resolve the
actual stored live session, apply the policy at real issuance, and map the current
maximum/window to the approval settings. Calculated deadlines are policy only,
never authenticated session evidence. Revalidation, SQL authority freshness,
admission/commit/replay and transaction coordination remain A's implementation
and acceptance obligations. People/agent shared guide integration remains A-owned.

`apps/server/src/telemetry-local.ts` also uses `+3_600_000` in the non-production
`localOidcTelemetryProgram` onboarding source. Therefore, saying that one hour
exists only in test fixtures would be inaccurate. That local source still does
not establish a production maximum, its authority or activation authorization.
Jonathan's production duration/configuration-authority choice remains pending.
The missing trusted event association/lead authority is not supplied by this
module. No step-up assurance, retention enforcement, event role or consent
provider is invented. The prior provider, AI-11-held fencing candidate and proof
refs remain separate and unchanged.

Graphify Cloud memory and the MCP gateway were unavailable; local repository
sources and the committed graph were used, and no memory acceptance is claimed.
