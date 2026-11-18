# Portable contract-typed HTTP action client (EVE-46)

Import `@eventiva/integrations.http-client/action` from native, web or test
composition. Pass a canonical `ActionSpec`, its **domain** input, a trusted
origin/tenant and a caller-chosen idempotency key. The adapter uses Effect
HttpApi and the specification's exact Schema ASTs to encode input and decode
output. It does not copy the action catalogue or compile discovery schemas.

This is partial EVE-46 acceptance: a spec-typed single-action client, not the
complete inventory-generated SDK, batch client, streaming transport, session UI
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

## Recover an ambiguous mutation

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
`credential-unavailable`, `unauthenticated`, `unavailable`, `codec` and
`transport`. `codec` covers canonical encoding and response decoding failures;
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

## Run the evidence

With the documented disposable PostgreSQL fixture available, run:

```sh
pnpm exec vitest run --config tests/integrations/http-client/vitest.config.mts
pnpm exec tsc -b packages/integrations/http-client apps/client apps/server/tsconfig.spec.json
pnpm exec vitest run --config apps/server/vitest.config.mts apps/server/tests/http-client.spec.ts apps/server/tests/http-actions.spec.ts --coverage.include=apps/server/src/http-actions.ts --coverage.include=apps/server/src/http-entry.ts
node tools/documentation/check.mjs
node --run check
node --run verify
```

The new conformance composes actual loopback HTTP, signed proof validation,
current SQL identity, Cluster and durable backend execution. It checks missing,
expired, session-only, hidden/sensitive, foreign-tenant, permission-revoked and
session-revoked cases. No real tenant data or production service is used.
