# Declared non-secret settings

[EVE-41](https://linear.app/resnovas/issue/EVE-41) packet 3 adds durable user and tenant preferences through `settings.read` and `settings.write`. Deployment configuration still uses Effect Config. Preferences do not grant permissions, select unrestricted providers or replace feature flags. This slice does not implement secrets, credential handles, encryption, rotation, UI or production activation.

## Compose and use settings

1. Declare every `(module, instance, key, scope)` with `declareSetting` from `@eventiva/contracts/settings`. Supply `classification: 'non-secret'`, `purpose: 'preference'`, `type` and an explicit schema-valid `default`. Supported types are `text`, `integer` and `boolean`. Unknown metadata, secret classification, arbitrary JSON and mismatched defaults refuse registration. Metadata cannot detect a secret disguised as a preference: only approved non-secret declarations belong here.
2. In privileged tenant composition, include `settingsResource` in the existing Resources migration/provider declarations. Use the approved Resources additive-migration policy; there is no settings SQL migration or independent store. Supply the authorized `Resources`, trusted `CurrentTenant`, cryptographic `InputDigest` and the matching durable host transaction owner. Never register this module with the test-only volatile ledger in a real composition.
3. Build `settingsModule(definitions)` from `@eventiva/runtime/settings` and register the result with the existing ActionHost. The composition, not action input, owns the declaration whitelist and tenant route. The compiling [composition example](../ai-docs/src/28_settings/01_settings.ts) returns the resource and registration effects for that trusted seam; it does not activate an application.
4. Configure the existing flag provider for `settings.enabled` only when activation is authorized. Its in-code default is false. Existing `settings.read`/`settings.write` action permissions and live Resources policy remain required; the flag never grants authority.
5. Invoke the actions through the common authenticated host, with a fresh idempotency key for each write intent. Do not call handlers directly or submit subject, owner, tenant, grants or storage identifiers.

Example action inputs and outputs for a declared integer preference:

```json
{
    "module": "calendar",
    "instance": "primary",
    "key": "page-size",
    "scope": "user",
    "value": "37",
    "expectedRevision": 0
}
```

`settings.write` returns `{"value":"37","source":"stored","revision":1}`. A read uses only `module`, `instance`, `key` and `scope`. Before the first write it returns the explicit declaration default, for example `{"value":"25","source":"default","revision":0}`. Storing the default explicitly still creates revision 1 with `source: 'stored'`; a default read does not create data. Writes replace one value, never merge JSON. Expected revision 0 is create-only. Subsequent writes must use the observed positive revision; stale or concurrent competing writes return a conflict, never overwrite unconditionally. A replay of the same admitted idempotent intent returns its saved result, subject to the host's live rechecks.

## Options, bounds and transport limitation

All declaration and action fields are required; there are no implicit scopes, namespaces or default values. Namespace components are 1-100 characters matching `^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$`. `scope` is `user`, `tenant` or `app`. Text is at most 4096 UTF-16 code units, integers are safe integral numbers, and booleans are literal booleans. Expected revision is an integer from 0 through 2147483646. Duplicate exact declarations refuse module construction. Module construction detaches declaration metadata so subsequent source-object mutation cannot change a captured default or namespace.

The generic action inventory's current common provider subset cannot express the mixed scalar union and all string constraints consistently. Therefore **wire `value` is a string containing one JSON-encoded scalar**, on both inputs and results. Integer 37 uses `"37"`, boolean false uses `"false"`, and text hello uses `"\"hello\""`. Objects, arrays and null are not preferences. Before JSON parsing, the handler bounds encoded input to 24578 UTF-16 code units (the worst-case escaped 4096-character string plus quotes); decoded schema and family validation follow. Invalid names, ranges and payloads fail closed below the coarse inventory schema. This is a bounded transport limitation, not arbitrary JSON support or a global schema-converter fix. HTTP byte/stream ingress limits remain the transport owner's separate responsibility.

## Isolation and application scope

User ownership derives only from the host-authorized canonical subject. Tenant ownership derives from the trusted composed route. The durable address hashes a structured tuple of canonical tenant, exact module/instance/key/scope and canonical subject for user scope; tenant scope omits the subject. UUID identity spelling is normalized to lowercase for addressing. The digest must return lowercase SHA-256 hex. A deterministic 122-bit UUID-shaped resource key is an address, not a chronological UUID generator; the stored full tuple is checked on every read, failing closed on collisions. Resource policy still authorizes each operation. Reconnecting a new SQL client observes persisted values without a module cache.

Application declarations are recognized, but **both app reads and writes return `app-scope-unavailable`**, including for tenant administrators. Current Resources are tenant-bound; there is no app-global store/authority composition contract. Storing an app preference in an arbitrary tenant would create false application semantics. A separately authorized app-global control-plane seam is required before app operations can be enabled. This local contract gap and the secret/credential scope keep EVE-41 In Progress.

## Bounded canonical-caller adaptation and trust recovery

The protected `packages/runtime/src/execution.ts` resolves `caller = yield* identity.resolve(presented)`, authorizes with `prepared.authorize(authorizer, caller)`, but later executes `const run = prepared.run` without supplying that canonical caller as the handler's `Caller` service. The ambient presented identity can therefore differ from the already-authorized identity seen by the handler. The existing `implement` in `packages/runtime/src/action.ts` captures invocation dependencies from that ambient context. These are source observations; this settings change does not repair the global host or replace preservation-first recovery of the unpublished trust work.

Only settings bindings use a local preparation bridge: each preparation allocates private admission state, detaches and freezes the scalar canonical identity before passing a separate disposable copy to the authorizer, publishes it only on successful current authorization, and consumes it once when running. Reauthorization clears earlier admission first; a later failure, run or interrupted attempt invalidates an older suspended success. No registered binding holds shared mutable caller state. The handler validates the captured caller against the composed route and supplies it to Resources. It never resolves a second, potentially different identity after authorization. Existing host identity/permission/flag/policy revalidation and Resources policy are not bypassed. This is not a general authorization-to-use revocation guarantee outside those existing boundaries.

The dedicated regression interleaves two callers' authorize/run steps in reverse order against one real registered binding, with distinct stored values, mutated original/retained authorizer references, repeat run, missing authorization, failed reauthorization and delayed old success after denial. Public host tests independently revoke action permission, decoded-target permission, the flag and Resources permission. Protected execution, action and trust sources stay untouched; report this seam to their recovery owner rather than implementing a competing fix.

Negative controls removed only the canonical Caller provision, causing a forged presented caller to receive default 25 instead of canonical stored 37 and making the second user's write collide with the first. Moving admission from preparation-local state onto the shared binding independently fails the reverse-order caller test. Both mutations were restored; the full focused suite passes with private state. A prepared read authorized before Resources revocation is also denied at run time, and restoring the grant cannot reuse its consumed admission. These controls establish the bounded settings behavior, not a repair or comprehensive assessment of other host bindings.

## Verify and troubleshoot

Run the focused fixtures:

```sh
pnpm exec vitest run --config tests/contracts/vitest.config.mts tests/contracts/src/settings.spec.ts --coverage.enabled=false
pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/settings.spec.ts --coverage.enabled=false
```

They use synthetic data and real disposable SQLite Resources with a matching durable host ledger. They cover schema/default validation, undeclared/secret declaration refusal, malformed/oversize transport, inventory parity, caller/tenant/instance isolation, reconnect persistence, optimistic conflicts and live denial. Package coverage and the fixture-backed full `node --run verify` remain delivery requirements, as do root `node --run check` and `node tools/documentation/planning.mjs --check --require-reviewed`.

- `Unavailable`: confirm separately approved flag targeting and live permission. Do not change the safe default to bypass a refusal.
- `undeclared` or `invalid-definition`: correct the trusted declaration, not the whitelist or parser rules.
- `invalid-value`: send JSON-encoded scalar text of the declared family within the documented bounds.
- `conflict`: reread and reconcile; retry with a new intent only after deciding against the current value.
- `denied`: check canonical identity, tenant route and live Resources policy. A guessed owner ID is not a remedy.
- `app-scope-unavailable`: supply the missing reviewed app-global architecture in a separate increment; tenant administration is not application authority.
- `storage`: inspect authorized infrastructure diagnostics separately. Public settings errors retain only bounded categories, not rejected values or underlying SQL/parser causes. Do not put secrets in declarations, values, audit input or logs.
