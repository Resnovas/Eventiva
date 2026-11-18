# Portable contract-typed HTTP action client (EVE-46)

Import `@eventiva/integrations.http-client/action` from native, web or test
composition. Pass a canonical `ActionSpec`, its **domain** input, a trusted
origin/tenant and a caller-chosen idempotency key. The adapter uses Effect
HttpApi and the specification's exact Schema ASTs to encode input and decode
output. It does not copy the action catalogue or compile discovery schemas.

This is partial EVE-46 acceptance: spec-typed single-action/sequential batch clients
and explicit authenticated JSON discovery, not the
complete inventory-generated SDK, streaming transport, session UI
or offline engine. No application startup request, public listener, production
activation or credential issuance is added. The existing local HTTP flag and
production refusal remain unchanged. See [the server contract](http-actions.md).

## Compose a call

1. Install the repository with its pinned toolchain using `node --run setup`.
   The new workspace package reuses the already approved Effect platform pin;
   it adds no registry dependency/version to the owner-approved matrix.
2. Import a canonical action from its owning contracts subpath. Possession of
   a specification or discovery document does not grant permission.
3. Provide a single-attempt platform `HttpClient` and `HttpActionCredentials`.
   Its `proof` Effect reads a separately protected current bearer credential
   on each invocation. Do not supply a session UUID as proof, cache authority,
   issue/refresh a token here, or put a token in source, URLs or request input.
4. Choose the tenant from trusted application routing and retain the original
   key and domain input until the mutation's authoritative result is known.
5. Execute the returned Effect in the application's existing scoped runtime.
   Interrupt its fiber to cancel client IO; cancellation does not roll back an
   accepted durable action.

The following complete local composition reads a credential from a securely
injected config provider. A native host instead supplies its protected-store
Effect; it must not copy this environment-based composition into startup code.
The example does not run itself or provision a credential:

```typescript
import * as FetchHttpClient from '@effect/platform/FetchHttpClient';
import type { ActionSpec, Input } from '@eventiva/contracts/action';
import { TenantId } from '@eventiva/contracts/ids';
import {
    HttpActionClientFailure,
    HttpActionCredentials,
    invokeHttpAction,
} from '@eventiva/integrations.http-client/action';
import { Config, Effect, Layer, Schema } from 'effect';

const credentials = Layer.succeed(HttpActionCredentials, {
    proof: Config.redacted('EVENTIVA_ACCESS_TOKEN').pipe(
        Effect.mapError(() => new HttpActionClientFailure({ reason: 'credential-unavailable' }))
    ),
});

const program = <S extends ActionSpec>(spec: S, input: NoInfer<Input<S>>) =>
    Effect.gen(function* () {
        const baseUrl = yield* Config.string('EVENTIVA_HTTP_ORIGIN');
        const tenant = yield* Config.string('EVENTIVA_TENANT').pipe(Effect.flatMap(Schema.decodeUnknown(TenantId)));
        return yield* invokeHttpAction(spec, input, {
            baseUrl,
            tenant,
            idempotencyKey: 'retained-intent:0001',
        });
    }).pipe(Effect.provide(credentials), Effect.provide(FetchHttpClient.layer));

void program;
```

Supply a canonical non-sensitive action that the server actually registers.
All current identity action definitions are sensitive and deliberately hidden
from this HTTP surface; they are not a working shortcut for this example.

Use [the compiling example](../ai-docs/src/29_http/02_client.ts) for an injected
protected-store effect without environment access. The native compile fixture
at `apps/client/src/http-client.typecheck.ts` includes positive/negative domain,
wire, input-inference and output assertions. It is not imported by the UI.

## Target and result contract

All target fields are required and have **no implicit default**:

| Field            | Contract                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `baseUrl`        | Trusted origin only. HTTPS, or HTTP on localhost/127.0.0.1/[::1]. No user info, path prefix, query or fragment.                |
| `tenant`         | Canonical UUIDv7 `TenantId`; this selects a route, never grants tenant membership.                                             |
| `idempotencyKey` | 1..128 ASCII letters, digits, dot, underscore, colon or hyphen. Chosen and retained by the caller, never silently regenerated. |

`invokeHttpAction(spec, input, target)` requires `HttpActionCredentials` and
`HttpClient`, and returns `{ output: Output<typeof spec>, receiptId: string }`.
`input` is `Input<typeof spec>`, not its encoded JSON type. Both schemas must
be service-free, as the canonical action contract already requires.

The request is exactly `POST /tenants/<tenant>/actions/<canonical.name>` with
`{ input: <encoded input>, idempotencyKey }`; the proof goes only in its bearer
header. No caller, grants, policy, database, queue or backend service is sent.
Success and closed error envelopes are decoded strictly, including extra-field
refusal. Output is decoded using the original canonical output schema.

The current server discovery compiler does **not** support transformations such
as `NumberFromString`. Portable codec tests prove number/string domain-wire
round trips only at the client transport seam. Actual HTTP/SQL conformance uses
currently representable branded structural schemas, and a negative registered
transformation proves discovery fails closed. Do not infer transformed server
inventory support from a portable client codec succeeding.

## Discover current private inventory

Call `discoverHttpActions({ baseUrl, tenant })` explicitly to send one
`GET /tenants/<tenant>/openapi.json`. Both required fields use the target rules
above; there is no spec, key, request body or default credential. The same
`HttpActionCredentials` service reads fresh protected bearer proof for each
call, and the same injected single-attempt `HttpClient` supplies transport.
Nothing runs at startup, refreshes in the background or retries automatically.

This complete composition prepares, but does not execute, a discovery request:

```typescript
import {
    discoverHttpActions,
    HttpActionCredentials,
    type HttpActionTarget,
} from '@eventiva/integrations.http-client/action';
import { Effect } from 'effect';

const prepareDiscovery = (
    target: Omit<HttpActionTarget, 'idempotencyKey'>,
    currentProof: HttpActionCredentials['Type']['proof']
) => discoverHttpActions(target).pipe(Effect.provideService(HttpActionCredentials, { proof: currentProof }));
void prepareDiscovery;
```

Provide the host's approved protected-store Effect and unretried platform
`HttpClient`, then execute in its scoped runtime. See the compiling
`discoverWithCurrentProof` example in chapter 29. Interrupting the request
cancels the actual response stream/socket; it does not return stale data.

The result, `HttpActionOpenApiDocument`, is a detached private JSON snapshot
with `openapi: '3.1.0'`, string `info.title`/`info.version`, object `paths`
and object `components.securitySchemes`. `components.schemas` is optional:
the current server can emit schemas inline without that component map. Unknown
fields at every level remain JSON data. Nested JSON Schema keywords, internal
and external `$ref` strings, components, action version/permission/approval/risk
extensions and the literal `actions:batch` route are preserved without
stripping or dereferencing. Even JSON member names such as `__proto__` remain
own data members. This narrow envelope check is **not full OpenAPI validation**
and never asserts the unchecked document is a complete vendor OpenAPI type.
An empty `paths` object is valid. The current server's route advertisement is
distinct from action authorization: with both transport gates on, a caller
with no roles receives exactly the literal batch route, whose request-item
and output schemas are `{ not: {} }`. Turning the batch gate off produces
empty paths for that caller. The advertised batch route grants no execution
authority: no-role single/batch attempts remain denied with no business
mutation or durable commit. Do not infer unconditional empty paths or a
permission grant from the transport route alone.

Fixed reversible engineering limits, not server or product completeness promises:

| Limit                 | Value and behavior                                                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actual response bytes | At most 1048576 (1 MiB), including multibyte UTF-8. Content-Length is not trusted. Intake stops at the first excess chunk, before copying it, and releases the reader. |
| Container depth       | At most 64 nested objects/arrays, counting the root, checked before recursive JSON/schema parsing.                                                                     |
| Structural work       | At most 100000 unquoted opening containers, commas and colons combined. Quoted patterns/references/escaped characters do not count as structure.                       |
| Text encoding         | UTF-8 must round-trip exactly; replacement/truncation of malformed bytes is refused as `codec`, not silently accepted.                                                 |

These bounds also apply to refusal bodies. Limits fail explicitly with
`response-limit`; larger legitimate inventories are never truncated into a
successful partial route set. Unsupported versions, missing/wrong envelope
fields, non-JSON and malformed closed error bodies fail as `codec`. Non-200
successes/unexpected statuses and request/stream errors fail as `transport`.
No body, URL, proof or vendor cause is retained in failures, logs or spans.

Treat the result as this caller's **historical private snapshot**, not a global
cache, inferred grants, executable schemas, a dynamic ActionSpec registry or
authority to invoke. No persistence/cache is provided. Never send proof to a
returned `servers` URL, fetch an external `$ref`, evaluate schema code or infer
current authorization from a previously returned route. Refresh explicitly after
identity/permission/flag changes; a failed refresh must not serve the old result
as current authority. Single/batch invocation still takes canonical specs and
crosses fresh server identity/policy gates. Current server compiler limitations
remain unchanged, including refusal of unrepresentable transformed inventory.

## Recover an ambiguous mutation

### Send a typed sequential batch

Call `invokeHttpActionBatch(specs, calls, { baseUrl, tenant })` with an ordered
tuple of canonical specifications and the same-length tuple of domain inputs
and original per-item keys. Inline tuples infer positions automatically; use
`as const` when retaining a tuple in a variable. Repeated specs are valid. The
result is a readonly tuple of `{ output, receiptId }`, with each domain output
in its specification's original position, not a widened union.

This complete unexecuted example uses two structural synthetic specifications;
a real caller imports the actual registered canonical specs instead. Provide
current proof from the protected host store and an unretried `HttpClient` to
execute it. Spec possession never registers an action or grants permission.

```typescript
import { define } from '@eventiva/contracts/action';
import {
    HttpActionCredentials,
    invokeHttpActionBatch,
    type HttpActionTarget,
} from '@eventiva/integrations.http-client/action';
import { Effect, Schema } from 'effect';

const reserve = define('example.reserve', {
    version: 1,
    description: 'Synthetic reservation example.',
    input: Schema.Struct({ units: Schema.Int }),
    output: Schema.Struct({ reserved: Schema.Int }),
    permission: 'example.write',
    sideEffect: 'write',
    offline: 'online-only',
});
const annotate = define('example.annotate', {
    version: 1,
    description: 'Synthetic annotation example.',
    input: Schema.Struct({ note: Schema.String }),
    output: Schema.Struct({ accepted: Schema.Boolean }),
    permission: 'example.write',
    sideEffect: 'write',
    offline: 'online-only',
});
const prepare = (
    target: Omit<HttpActionTarget, 'idempotencyKey'>,
    currentProof: HttpActionCredentials['Type']['proof']
) =>
    invokeHttpActionBatch(
        [reserve, annotate],
        [
            { input: { units: 7 }, idempotencyKey: 'retained:reserve:0001' },
            { input: { note: 'Reviewed separately' }, idempotencyKey: 'retained:annotate:0001' },
        ],
        target
    ).pipe(
        Effect.provideService(HttpActionCredentials, { proof: currentProof }),
        Effect.map((results) => ({ reserved: results[0].output.reserved, accepted: results[1].output.accepted }))
    );
void prepare;
```

Batch options have no inferred defaults:

- `specs`: 1..10 canonical service-free specs in caller-selected order.
- `calls`: one `{ input, idempotencyKey }` per spec. Inputs use its domain type;
  keys use the same required 1..128-character syntax as a single invocation.
- `target`: the same trusted `baseUrl` and canonical `tenant` as above; there
  is no batch-wide replay key. Preserve every original item key and input.

The adapter validates routing, count, **all** keys and canonical encodings,
then the entire serialized UTF-8 body against 65536 bytes before reading proof
or sending. A bad later item sends nothing. It detaches the accepted JSON
request and captures output codecs before waiting for proof, so retained caller
objects/arrays cannot rewrite the validated request. The protected proof is
read once per batch HTTP attempt, afresh on each explicit call, not per item.
It sends exactly one literal `POST /tenants/<tenant>/actions:batch` containing
`{ calls: [{ action, input: <encoded input>, idempotencyKey }] }`.

Success requires the closed `{ results: [{ output, receiptId }] }` envelope,
exact result count, each position's canonical output codec, and a nonempty
receipt. Short/long responses, extra fields, distinguishably reordered outputs,
empty receipts and malformed bodies fail as a whole. Identical output shapes
cannot establish semantic order themselves; the server's sequential contract
remains authoritative. The client never returns an inferred partial result or
failed-item index. Both `http.actions.enabled` and `http.action-batch.enabled`
remain safe-default-off; local-only listening and production refusal are unchanged.

### Recover explicitly after batch failure

The server preflights the full structural/visibility envelope, but evaluates
domain/resource policy per item through the existing durable executor. A
second-item refusal can follow the first commit and prevent the third item.
A 503, malformed success, disconnect or cancellation therefore **does not**
imply zero commits. There is no rollback, atomicity or partial-result guarantee.

After resolving the current refusal or ambiguous outcome, explicitly reconcile
or resubmit the same original key/input tuple. Do not generate replacement keys,
drop an assumed prefix or blindly retry. Successful original items replay their
stored durable results without repeating the mutation; current identity,
permissions, flags and audit can still refuse replay. Wire receipts may differ.
The real JWT/SQL/Cluster client fixture asserts ordered heterogeneous outputs,
unchanged stored `action_commit` evidence and business sequence on replay, a
committed prefix/no third on second-item resource refusal, and explicit same-key
recovery without prefix reexecution. It does not prove transformed server
inventory, production transport or offline behavior.

### Recover a single invocation

There is no automatic retry, timeout policy, offline queue or cached authority
inside the adapter. Supply an unretried transport; do not add a generic retry or
redirect-following wrapper around mutation requests. A platform transport's own
configuration remains the composition root's responsibility.

If a response is lost, interrupted or unavailable, the action may already be
committed. Ask the authoritative host or deliberately repeat the same original
key/input. The server revalidates current permissions, session and flags before
replay. Reusing the key with changed input is refused.

Distinguish the two receipts: `receiptId` is the **wire invocation** receipt and
may be fresh on replay; `action_commit` retains the **original durable commit**
receipt/result. The real SQL test proves one committed mutation, identical
stored result/receipt after replay, and a new wire invocation receipt. Do not
use invocation receipt equality as a deduplication test.

## Handle failures without exposing input or proof

Failures use `HttpActionClientFailure` with a fixed `reason`, never a retained
vendor cause, request, body or token. Reasons are `invalid-request`,
`credential-unavailable`, `unauthenticated`, `unavailable`, `codec`,
`transport` and `response-limit`. `response-limit` is discovery's explicit
byte/structure safeguard. `codec` covers canonical encoding and response decoding failures;
an unexpected status/network error is `transport`. Treat both as ambiguous for
mutations, not an instruction to retry. Typed failures from the proof store are
sanitized; defective adapters become a fixed transport failure. Fiber
interruption remains interruption rather than becoming a public error value.

Built-in HTTP tracing/propagation is disabled for this adapter so raw tenant
URLs do not bypass governed telemetry correlation. It adds no body/header
logger. Do not inject a logging client that records credentials or bodies.

Common problems:

- `invalid-request`: check the canonical tenant, dotted action name, origin
  without a path/query, and the original key's syntax/length.
- `credential-unavailable` or `unauthenticated`: obtain current approved proof
  through the host's existing identity flow. A session UUID is not a secret.
- `unavailable`: a route can be hidden, sensitive, foreign-tenant, flag-disabled,
  revoked or refused by the backend. Do not enumerate private diagnostics.
- `codec`: check the canonical spec/version and server support. A valid HTTP
  200 status alone does not make a body valid output.
- `response-limit`: reconcile inventory size/depth/structure with the documented
  client limits. Do not silently truncate routes, retry, weaken server schemas
  or treat an older private document as current authority.

## Run the evidence

With the documented disposable PostgreSQL fixture available, run:

```sh
pnpm exec vitest run --config tests/integrations/http-client/vitest.config.mts
pnpm exec tsc -b packages/integrations/http-client apps/client apps/server/tsconfig.spec.json
pnpm exec vitest run --config apps/server/vitest.config.mts apps/server/tests/http-client.spec.ts apps/server/tests/http-actions.spec.ts apps/server/tests/http-action-batch.spec.ts --coverage.include=apps/server/src/http-actions.ts --coverage.include=apps/server/src/http-entry.ts --coverage.include=apps/server/src/http-action-batch.ts
node tools/documentation/check.mjs
node --run check
node --run verify
```

The new conformance composes actual loopback HTTP, signed proof validation,
current SQL identity, Cluster and durable backend execution. It checks missing,
expired, session-only, hidden/sensitive, foreign-tenant, permission-revoked and
session-revoked cases. No real tenant data or production service is used.
Discovery additionally compares the complete current non-sensitive path set,
inline input/output schemas and policy extensions with actual registered
inventory, both batch/transport gates, exact no-role batch-only/empty paths,
unchanged `{ not: {} }` schemas, denied no-role invocation, action-flag
refresh, active membership/session revocation and invocation refusal after
earlier disclosure. Portable tests independently cover exact 1 MiB boundaries,
misleading/missing length headers, nested references/extensions, depth/work
limits, safe failures and real held-body Fetch cancellation. Native/web builds
prove compilation, not native-device execution or production readiness.
