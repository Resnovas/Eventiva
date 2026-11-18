# Authenticated local action HTTP

EVE-46's first slice exposes registered actions over real local HTTP. It is a
composition API and an executable conformance target, not a deployed service or
an activation of the diagnostic server shell. The owner-relayed
[revision 2 packet](https://ampcode.com/artifacts/next-implementation-packets-cd16f2fd-d187-4163-9463-9270422c87b0)
authorizes this local/test slice on 2026-11-18. Revision 6 adds the separately
default-off [sequential batch capability](#sequential-non-atomic-batches).
Streaming, machine credential issuance, a typed native client, offline queueing and public
deployment remain outside it. EVE-46 remains open for those acceptance criteria.

## Run the complete local example

1. Run the pinned repository setup described in `AGENT-SETUP.md`.
2. Start the disposable, synthetic PostgreSQL fixture using
   [Run conformance](storage.md#run-conformance). Keep its generated
   `STORAGE_TEST_POSTGRES_URL` in the environment. The account must be a local
   non-superuser fixture login with CREATEDB, not a production credential.
3. Run the following before tearing down the fixture:

    ```sh
    pnpm nx run @eventiva/server:http-conformance
    node --run verify
    ```

The focused target uses a real ephemeral loopback listener, real signed JWT
access tokens, the adopted OIDC verifier, live PostgreSQL identity/session and
role records, the existing SQL Cluster runner, and the existing durable action
executor. Only public issuer discovery/JWKS are served by the deterministic
fixture. It never accepts a token merely because a test supplied it. The
synthetic module registers real typed handlers; discovery and backend execution
reuse the same initializer. Fixture target policy delegates its explicit
organization resource scope to the real SQL authorizer. No accepting identity,
approval, shell or local-executor substitute is supplied.

The suite creates and removes its own database. Never point it at real data or
a remote database. A missing database fails the check; it is not skipped.
Its narrowly scoped coverage target checks both new transport files at the
unchanged 90% thresholds; the normal server suite also includes both files.
The `Check authenticated local HTTP` editor/agent action invokes the same target.

## Compose a trusted listener

`apps/server/src/http-entry.ts` exports `serveLocalHttp(policy)`, an Effect whose
scope owns the listener. Provide all of these before running it:

- One exact trusted token policy: issuer, audience and nonempty required scopes.
- `StandardsTokenVerifier` through `oidcStandardsVerifier` or
  `OidcStandardsVerifierLive` from `identity-oidc.ts`.
- A control-plane-selected `CurrentTenant` and its matching SQL `IdentityStore`
  and `identitySecurity` services. Do not choose a database from a request.
- The real registered host's `ActionInventory` for that tenant, and
  `ClusterActions` from `backend(profile, initialize)`. Discovery and the backend
  must use the same module initializer and authorized tenant route. The backend
  constructs its own host inside that route; the HTTP adapter never invokes a
  discovery host locally.
- Existing flags, input digest, module-owned resource policies, approvals and
  durable audit/integrity dependencies required by that backend. Missing
  authority is a denial, not an invitation to supply a permissive placeholder.

See the fully compiling composition in `apps/server/tests/http-actions.spec.ts`.
There is deliberately no standalone executable that guesses these services or
provisions identity when started. Importing `http-entry.ts` opens no socket.
`main.ts` and `access.ts` remain the non-networked diagnostic and are not used.

Configuration:

| Setting                     | Required/default           | Contract                                                                                                                                                                                            |
| --------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EVENTIVA_ENVIRONMENT`      | Required                   | Only `development`, `staging`, `test`. `production` or an absent/other value refuses listener acquisition. This is a deployment boundary, not a feature switch.                                     |
| `HTTP_PORT`                 | `34446`                    | Integer 0..65535. Zero selects an ephemeral test port.                                                                                                                                              |
| Bind address                | Fixed `127.0.0.1`          | No configurable public bind, portal, deployment or reverse proxy.                                                                                                                                   |
| `http.actions.enabled`      | Flag, safe default `false` | Rechecked on every authenticated request through the existing `Flags` service. Not an environment-variable toggle. The conformance fixture alone enables it; no external rollout is created.        |
| `http.action-batch.enabled` | Flag, safe default `false` | Enables only the optional batch route and its OpenAPI metadata, and only while the parent transport flag is also on. Both flags are checked before each batch item. No external rollout is created. |

## Authenticate before discovery or invocation

Supply a separately protected RFC 9068 bearer access token in `Authorization`.
Never supply it in a URL, body, source file, transcript or log. The adapter calls
`authenticateTokenSession` on every request. It verifies the credential, exact
issuer/audience/scopes and time bounds, resolves the exact tenant-local
issuer/subject link, and requires current active SQL principal, session and
membership. Canonical subject/session and tenant come from those services, not
OIDC role claims, a raw `sub`, request headers or submitted caller data.

The tenant in the path must equal the already selected tenant. An
`x-eventiva-tenant` header has no authority and cannot change that route. A
copied `SessionId` UUID is not a credential. Revoking a session or membership
stops the same token on the next request. Role removal removes routes and
OpenAPI metadata immediately. The Cluster sender, receiver and executor repeat
their existing identity/resource/flag/audit checks, including on replay.

## Request and response contract

- `GET /tenants/<trusted-tenant-uuid>/openapi.json`: authenticated, current,
  caller-filtered OpenAPI document. It is not a public or startup-cached listing.
- `POST /tenants/<trusted-tenant-uuid>/actions/<canonical-action-name>`: one
  route for each currently visible, enabled, non-sensitive inventory entry.
  Sensitive actions are omitted from both routes and documentation, including
  their descriptions/schemas; there is no undocumented privileged endpoint.

Send `Content-Type: application/json` (optional UTF-8 charset) and exactly:

```json
{ "input": { "value": 21 }, "idempotencyKey": "client-operation-001" }
```

`input` follows that action's registered schema, not the illustrative fixture
shape above. `idempotencyKey` is required for every HTTP call, 1..128 ASCII
letters, digits, dots, underscores, colons or hyphens. Retry an ambiguous call
only with the same key and same input. Changed input under the same committed
key is refused. A success returns, for the synthetic write example:

```json
{ "output": { "value": 42 }, "receiptId": "opaque-invocation-receipt" }
```

The receipt ID identifies this invocation's audit evidence, not a stable replay
identity. Receipts, canonical identity and input hashes are not returned in
full. This slice exposes only online input and idempotency intent, not approval
issuance, arbitrary authority, scheduling or the entire invocation-options API.
An action whose existing policy requires additional approval cannot bypass it
through HTTP and may be refused by the backend.

Limits are 8192 characters for the complete Authorization field, 512 characters
for the request URL and 65536 bytes for the body. Query strings, wrong content
types, malformed envelopes and excess envelope fields are refused. Domain
input decoding and excess input-property rejection remain the existing host's
responsibility. The application request budget is 10 seconds; a timeout does
not prove that a queued durable action never committed. Consult authoritative
state and retain the original idempotency key rather than issuing a new mutation.

Responses use `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`.
Fixed errors contain only `{ "error": "<code>" }`:

| Status | Code              | Meaning                                                                                                                                                                     |
| ------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400    | `invalid-request` | Invalid transport envelope, content type, URL/query or body limit.                                                                                                          |
| 401    | `unauthenticated` | Missing, malformed, expired, invalid or SQL-revoked credential/identity.                                                                                                    |
| 404    | `unavailable`     | Unknown, foreign-tenant, unauthorized, disabled or sensitive action, or transport flag off.                                                                                 |
| 503    | `unavailable`     | Discovery dependency loss, backend refusal (including domain input validation), missing audit, defect or timeout. The adapter does not disclose which internal gate failed. |

No automatic HTTP retries, request/body logging or error-message serialization
are installed. Business output remains the registered action's responsibility.
Existing action spans and the central telemetry redaction/correlation policy
are not replaced by this transport.

## Inventory and OpenAPI parity

For each authenticated request, the adapter obtains `ActionInventory.list`,
omits sensitive entries, and folds that exact projection into both Effect
HttpRouter routes and an Effect HttpApi. `OpenApi.fromApi` renders the latter.
Schemas come directly from the inventory's conservative structural JSON schema
profile, with version, permission, approval and risk metadata. There is no
static route list, second action schema compiler or fallback after a compiler
failure. HttpRouter decodes only the generic bounded envelope; the unchanged
executor remains the authority for the actual action's Effect schema.

The real HTTP test compares the complete route-path set, action versions and
permissions, complete input/output schemas and bearer security against the
registered inventory. It invokes every projected fixture route with asymmetric
results, proves one durable mutation across replay and changed-input refusal,
and observes canonical identity in SQL receipts. It also exercises invalid
signatures/claims, copied UUIDs, foreign tenants, live role/membership/session
changes, hidden/disabled/sensitive actions, body limits, missing audit,
unrepresentable discovery and a dependency defect. Captured live logs include
a positive logging control and exclude token/input canaries.

Common failures: 401 needs valid credential plus explicit current SQL
onboarding, not a SessionId or automatic reactivation; 404 requires the correct
trusted tenant, actual permissions and both transport/action flags; 503 requires
checking private operational health, audit and action schema/policy without
returning diagnostics to the caller. Do not activate the shell to fix a denial.

## Sequential non-atomic batches

The owner-relayed revision 6 packet authorizes a local/test batch sub-slice,
not production activation or completion of EVE-46. The unchanged scoped
listener and service composition above also serve batches; no additional
mandatory service, dependency, listener or environment variable is required.
The new capability uses the existing `Flags` service. When either transport
flag is off, there is no batch route or batch OpenAPI operation. The existing
single-action contract is unchanged.

With both flags enabled for an authorized local fixture, send exactly this
envelope to `POST /tenants/<trusted-tenant-uuid>/actions:batch`:

```json
{
    "calls": [
        { "action": "batch.write", "input": { "value": 9 }, "idempotencyKey": "ordered-9" },
        { "action": "batch.write", "input": { "value": 2 }, "idempotencyKey": "ordered-2" },
        { "action": "batch.write", "input": { "value": 7 }, "idempotencyKey": "ordered-7" }
    ]
}
```

These action names and values belong only to the executable conformance
fixture, not a built-in production module. Substitute current visible action
names and their declared inputs in an actual composition. Each item's key is
supplied by the caller, follows the single-call 1..128-character grammar and
has no generated default. The batch must contain 1..10 items; the total body,
not each item, must fit the existing 65536-byte limit. Content type, credential,
trusted tenant and URL restrictions are the same as single calls. Excess
envelope/item properties are rejected, including caller/tenant overrides.

Before dispatching anything, the adapter decodes the entire envelope and
requires every action to be in the current caller's visible, enabled,
non-sensitive inventory. A later structural error returns 400; a later
invisible, unknown, disabled, sensitive or foreign action returns 404. Neither
case dispatches a valid first item. This preflight is **not** domain-input,
resource-policy or transaction validation for all calls.

The adapter then awaits each item in order through the existing Cluster and
durable backend. Each invocation freshly checks canonical identity, current
session/membership/permissions, module resource policy, action flags, replay
integrity and audit. Both transport flags are also rechecked between items.
Preflight grants no cached authority. No parallel dispatch or automatic
mutation retry is installed.

For the fixture above, success is:

```json
{
    "results": [
        { "output": { "value": 63 }, "receiptId": "opaque-attempt-1" },
        { "output": { "value": 15 }, "receiptId": "opaque-attempt-2" },
        { "output": { "value": 51 }, "receiptId": "opaque-attempt-3" }
    ]
}
```

Receipt strings are illustrative. Results preserve request order; every actual
receipt ID identifies durable audit for that attempt. Replay preserves original
committed output and the SQL `action_commit` receipt, but returns fresh
per-invocation wire receipts, exactly as single calls do.

On the first invocation refusal, audit/backend failure or timeout, the adapter
returns the existing fixed 503 `unavailable` response and does not dispatch the
remaining suffix. It does not return partial results or diagnostics. Previously
committed items remain committed: this is **non-atomic**, with no rollback or
cross-tenant promise. A domain-invalid second item can therefore leave the
first committed, unlike an invalid transport envelope caught during preflight.

Client disconnect and the existing 10-second request budget interrupt further
dispatch. An already accepted durable item may complete or be interrupted;
neither a timeout nor a disconnected socket proves it never committed. Inspect
authoritative state and recover by explicitly resubmitting the original keys
and inputs. Never mint new keys to recover an ambiguous mutation. Replay still
requires current authorization and audit; a revoked caller cannot recover by
reusing an old batch.

OpenAPI contains the literal `actions:batch` path, exact 1..10 envelope bounds,
current action-discriminated input alternatives and corresponding output
schemas. No hidden schema is placed in the batch union. An authorized caller
with no visible actions sees an unsatisfiable item schema, not private metadata.
The pinned router's literal-colon escaping and OpenAPI path correction do not
create wildcard aliases such as `actionsXYZ` or `actions:other`.

Run `pnpm nx run @eventiva/server:http-batch-conformance` with the same approved
disposable PostgreSQL setup above. The new spec exercises actual loopback HTTP,
real signed JWT validation, live SQL identity and real SQL Cluster/backend:
ordered asymmetric outputs, durable replay, partial-prefix recovery, later
invalid preflight with zero SQL commits/audit/handler work, session/membership/
permission/action/transport revocation between items, missing audit, 1/10/11
boundaries, hidden metadata and timeout/disconnect with preserved prefix.
Only public discovery/JWKS retrieval is deterministic. Run the original
`http-conformance` target unchanged, ordinary server tests and full verification
as well. No paid provider, external flag change, public deployment, batch client,
streaming or machine-token issuance is included.
