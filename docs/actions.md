# Action inventory and authorized execution

EVE-40 extends the EVE-23 boundary: declare portable specifications in `@eventiva/contracts/action`, bind handlers in `@eventiva/runtime/action`, and register them with `ActionHost`. Never import backend handlers into a client. Never call a handler from a transport, UI or agent directly.

## Define and register an action

Use this complete specification/module example, compiled in `apps/server/src/status.ts`:

```ts
import { define } from '@eventiva/contracts/action';
import { implement } from '@eventiva/runtime/action';
import type { ServerModule } from '@eventiva/runtime/host';
import { Effect, Schema } from 'effect';

export const Status = define('platform.status', {
    version: 1,
    description: 'Report the running Eventiva runtime and its registered actions. Reads nothing else.',
    input: Schema.Struct({}),
    output: Schema.Struct({ runtime: Schema.Literal('eventiva'), actions: Schema.Array(Schema.String) }),
    permission: 'platform.status',
    sideEffect: 'read',
    offline: 'local',
});

export const platformModule = (actions: Effect.Effect<ReadonlyArray<string>>): ServerModule => ({
    manifest: {
        format: 1,
        id: 'platform',
        version: '0.0.1',
        description: 'Built-in platform status.',
        actions: [Status.name],
        flags: [],
    },
    actions: [
        implement(Status, () => Effect.map(actions, (names) => ({ runtime: 'eventiva' as const, actions: names }))),
    ],
});
```

Register inside an Effect scope. Registration validates the complete manifest, canonical names, versions, permissions, descriptions, security metadata, resources and duplicate claims before activating the module layer. A failed registration publishes nothing. Closing the scope removes its entries and releases its layer. Existing EVE-23 typed duplicate, compatibility and activation errors remain available.

Keep the specification inferred from `define` when passing it to `implement`. The handler receives decoded input and must return the specification's decoded output and declared failure type. A transforming schema can therefore receive a wire string while the handler works with a number. `Authorizer.check` and `ExecutionPolicy.inspect` tie their decoded input to that same specification. `ActionSpec` without type arguments is a discovery view of metadata and schema ASTs, not a callable decoder or an erased handler contract.

Register handlers requiring services with `ServerModule<Services, LayerError>` and a layer providing those services. Both generic parameters default to `never`; a module without a layer accepts only service-free handlers. Keep the layer's actual error type rather than annotating it as an opaque error. Manifests accept JSON values and are decoded against `ModuleManifest` before admission. The host stores schema-bound preparation closures, so mixing specifications in a module does not widen their handlers' input, output, error or environment types.

Specification options:

| Option            | Default   | Meaning                                                                                                                                                |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `version`         | Required  | Positive integer; bump on breaking input, output or meaning changes.                                                                                   |
| `description`     | Required  | Nonblank agent-facing English description.                                                                                                             |
| `input`, `output` | Required  | Service-free Effect schemas; runtime decodes input and encodes output.                                                                                 |
| `error`           | None      | Portable tagged error schema or union; declared failures become encoded `ActionFailed` errors. Undeclared failures and invalid outputs remain defects. |
| `permission`      | Required  | Canonical dotted permission, checked before decode and again against the decoded resource.                                                             |
| `sideEffect`      | Required  | `read`, `write` or `external`. External handlers stage an outbox command; they do not send external effects inside a transaction.                      |
| `offline`         | Required  | `local`, `queued` or `online-only`; this metadata never grants authorization or authoritative offline success.                                         |
| `approval`        | `none`    | `none`, `confirm` or `always`. This is a minimum, never a tenant override.                                                                             |
| `risk`            | `routine` | `routine`, `irreversible`, `financial`, `permission`, `capacity`, `stock` or `live-production`. Nonroutine risks enforce `always`.                     |
| `sensitive`       | `false`   | Sensitive reads require durable audit, without a spool fallback.                                                                                       |
| `flag`            | None      | Optional capability flag declared in the module manifest; existing safe-default flag evaluation remains in force.                                      |

## Discover capabilities

Use `ActionInventory.list(caller)` or `find(caller, canonicalId)` from `@eventiva/contracts/inventory`. `ActionHostLive` supplies this service over the same scoped entries as dispatch. It refreshes identity and checks current coarse permission and flag state each time. A forbidden, disabled or absent action is not discoverable. Invalid identity fails with `Forbidden`. Listing is not authorization to access a particular resource; invoke still runs both authorization checks.

Metadata includes canonical id/version, description, permission, approval/risk, sensitivity, side-effect/offline policy and generated input/output profiles. Use `wireName` only for provider names; retain canonical ids everywhere else.

`@eventiva/contracts/json-schema` compiles a conservative structural subset of Effect schemas for `anthropic`, `openai` and `google`. Provider profiles are schema compatibility checks, not claims of live provider certification or implicit OpenAI strict mode. Unsupported structures return `UnsupportedSchema` rather than dropping constraints. Root unions, recursive schemas, general unions and transformations (including `Schema.NumberFromString`) are not portable tool objects. Runtime invocation retains transforming-schema support; provider-facing specifications must use structural wire schemas so generation never silently drops post-transform validation. Provider snapshot fixtures cover read, write and external actions. No AJV dependency is required.

The bounded 2026-11-18 EVE-81 compatibility amendment recognizes only the pinned Effect UUID pattern: its redundant case-insensitive flag adds no characters because every hexadecimal class already contains both ASCII cases. The compiler emits that exact pattern, not a provider-dependent `uuid` format. The existing lowercase UUIDv7 refinement implies the base pattern and replaces it without losing validation. Generic flagged regular expressions and other conflicting regex compositions still fail. Runtime schemas are unchanged. No new option or default is introduced.

This is not full common-provider support for private product schemas. The conservative Google profile still refuses patterns and string-length bounds. General/nullable unions (including nullable cursors), root unions and conflicting composed bounds still refuse. Tool inputs must be objects in `validateInventory`; structural scalar/array outputs remain permitted, and a root array input still fails. Do not remove runtime constraints to make discovery pass. An enabled registered action with an incompatible profile makes discovery fail closed; direct authorized invocation remains independently testable. Keep such optional modules off until their discovery contract is resolved. Run the compiling examples and negative controls with `pnpm exec vitest run --config tests/contracts/vitest.config.mts tests/contracts/src/json-schema.spec.ts tests/contracts/src/inventory.spec.ts --coverage.enabled=false`.

Run `node --run parity` to validate the canonical server inventory, scoped discovery and its shared dispatch path. Run `node --run verify` for parity plus lint, typecheck, tests, builds and smoke. CI includes parity in the required `application check`; dependency-free `node --run check` does not load application code. New surfaces must compare their complete advertised ids, versions and permissions using `validateParity` and name every required surface explicitly. The current production surface is the server shell; HTTP, MCP, ACP, UI transport bindings and provider selection are separate work, not simulated adapters in this package.

## Invoke with receipts

### Prepare an approval review without executing

Call `host.prepareApproval(action, wireInput, targetWriteKey, expectedActionVersion?)` with the per-call `Caller`. It uses the SAME live registered binding as execution, refreshes identity, checks coarse and decoded-target permissions, and derives input digest and numeric limits from the registered codec and trusted live policy. It rechecks registration/flags after preparation waits. The returned `ApprovalPreparation` contains only `binding` (tenant, refreshed principal, action/version, canonical input hash and exact target write key) and detached `limits`. It returns no handler, raw input, approval id or permission grant. It never runs the target or creates an approval.

The compiling example and negative controls are in `tests/runtime/src/approval-wiring.spec.ts`:

```ts
const review = yield* host.prepareApproval('fixture.review', { amount: '17' }, 'target-19', 3);
// Review the returned target binding and bounds; preparation alone is not consent.
```

`action`, `wireInput` and `targetWriteKey` are required. The target key must be nonblank, already trimmed and at most 512 characters; do not substitute a consent transport action's own idempotency key. `expectedActionVersion` defaults to absent, resolving the current registration; when supplied it must match that registration before decoding. This is an action-version pin, not a resource-state precondition. Changed input or key yields different binding and requires fresh consent. Missing/removed actions, disabled flags, stale identity, malformed input/key/bounds and denied targets refuse preparation. Unsupported required step-up refuses rather than claiming assurance.

Run `pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/approval-wiring.spec.ts --coverage.enabled=false` for focused mechanics. The fixture deliberately uses volatile identity/policy services to isolate preparation; it is not durable SQL or whole EVE-275 acceptance. An explicit trusted human completion must freshly validate the reviewed binding and current authority; never infer consent from this projection, login or a boolean field.

### Registered human consent and routed persistence

The server registers `approvals.prepare`, `approvals.complete` and `approvals.cancel` through the same host. Their local capability gate `identity.approval-consent-enabled` defaults to false. This gates the lifecycle feature, not mandatory approval enforcement on target execution. Only a current same-tenant interactive human can enter these operations. Target permissions are checked independently for that human and any executing agent; the intrinsic consent admission grants no target permission. Own-pending cancellation does not require an administrator grant. Cancelling another person's approval still needs the separately granted tenant/event scope and live authority.

Preparation takes the target `action`, encoded `input`, executing `principal`, exact target `writeKey` and registered `version`, all required. It returns a detached `review` and `expiresAt` calculated from trusted tenant policy and the actual live SQL session's earlier expiry. Completion takes the same required fields and that reviewed tuple. Its own transport idempotency key must be kept stable on retry and is distinct from the target's key. Completion runs no target handler, compares the complete current review, refuses changed input/key/version/limits/event association and returns only the issued `id` and `expiresAt`. Cancellation takes only a required proof `id`; caller-supplied owner or event fields confer no authority.

The compiling complete example is `apps/server/tests/approval-consent.spec.ts`: invoke preparation, explicitly confirm with a separate key, then invoke the original target with `{ idempotencyKey: targetWriteKey, approvalId: issued.id }`. The actual Cluster fixture covers SQLite and PostgreSQL tenant stores, each with two independent tenant clients and a separate PostgreSQL compute database, different policy windows and an earlier real session expiry. It checks issuance retry, target use/replay, changed intent, foreign proof, agent self-consent, policy loss/tightening and own cancellation. Test durations are synthetic, not selected production settings.

`backend` now requires integration-owned `TenantSqlRouter`, supplied by `sqlRouter(dialect, resolveClient, authorize)`. The resolver and admission callback are mandatory; no ambient compute-client fallback exists. The portable `TenantRouter` still exposes only `Storage` and `CurrentTenant`. Every routed identity, proof, handler write, outbox, successful receipt and dedup operation uses the same tenant SQL client. Optional fourth `security` uses the existing fail-closed identity policy by default; optional fifth `sessionPolicy` has only an unavailable-source denial by default, no accepting duration or policy source. Supply a trusted routed `IdentitySessionPolicy` layer explicitly before enabling consent. Its required tenant, session maximum and approval window have no numeric defaults. The unactivated Config adapter's keys are documented in the [policy record](core-qualification/session-policy.md).

The [later owner-policy amendment](core-qualification/approval-wiring.md#binding-policy-amendment---2026-11-19) selects a one-hour sliding idle window renewed only by real user activity, with a hard eight-hour maximum from sign-in: `min(lastRealActivity + 1 hour, issuedAt + 8 hours)`. Polling, background sync/calls and automated/token refresh do not renew. Trusted server authentication settings supply policy with optional trusted tenant overrides; no override above those bounds is inferred. Agree the exact activity classification and trusted ingress with Jonathan before the renewal follow-up. Explicit resource-scoped cancellation grants, not implicit lead roles, are also selected. Neither renewal nor arbitrary resource-scoped cancellation is implemented by A: it issues bounded sessions without renewal, and its event-grant/authority seam needs resource-permission reconciliation. Preserve actual session-expiry caps, trusted preparation-time resource association and fresh execution/replay checks; no issuer route or production activation follows.

`openOidcSessionWithPolicy` composes the same required policy with actual SQL session issuance. It accepts only freshly verified claims at the trusted login boundary and must run in the routed transaction with its audit. It activates no issuer or login route. Execution lookup is invocation-bound, not a globally captured action/input/key. New successful mutations mark first use within Integrity after post-handler revalidation; approval-requiring reads transactionally pair use with their mandatory successful audit without caching reads. Failed handler/use/audit rolls back the paired changes; replay rechecks live evidence without another use decision. A missing event-authority port denies event cancellation while own/tenant paths remain available. Cleanup remains separate [packet C work](core-qualification/approval-wiring.md#packet-c-retention-enforcement-after-provider-reconciliation); a retention timestamp alone is not enforcement or full erasure.

### Execute and retain receipts

Provide `Caller` per call. Call `host.execute(name, wireInput, options)` to receive `{ result, receipt, replayed, audit }`. `result` is an Effect `Exit` preserving success, declared failure, defect or interruption. `host.invoke` is a convenience projection of this same path that returns the output or fails; it never bypasses receipts. If the receipt cannot be persisted under A4, the call fails with `AuditUnavailable` instead of returning unrecorded output.

The handler receives the trusted resolved Caller admitted by the executor, for
reads and new mutations alike. That invocation Caller takes precedence even if
a module Layer exports its own Caller. Only Caller is overlaid at deferred
execution: unrelated captured module services retain their precedence, the
Layer is not rebuilt, and Integrity's transaction-local services remain
available. Do not merge the entire ambient invocation context over the module
context or capture Caller at registration. Post-wait and precommit checks still
reject changes to the admitted identity tuple and refresh live authority.
Replay skips the handler and returns historical committed output; its new
receipt uses the freshly admitted Caller, not a rewritten historical payload.

Run `pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/caller-qualification.spec.ts --coverage.enabled=false`
for the compiling public-host example and regression controls. Distinct
registration/presented/resolved identities, benign/conflicting once-built
Layers, preserved module/transaction markers, delegated calls, fresh-session
replay, tenant/principal key isolation and post-handler rollback distinguish
the boundary. See the [qualification and repair record](core-qualification/caller.md)
for before/after evidence. Synthetic identity substitution does not demonstrate
a current-ingress exploit. Trusted handlers can still explicitly replace their
own inner services or capture values during construction; this context guarantee
does not sandbox module code or implement the separate production approval provider.

Dynamic action names return the existing `JsonValue` wire contract. Encoded outputs and declared failures must pass strict canonical JSON validation; dates, undefined values, cycles and nonfinite numbers are not coerced into JSON. `ActionFailed.error` uses this same portable schema. `Integrity.commit` accepts generic adapter ingress but must validate it before returning its JSON-valued committed result; the volatile fixture performs the same validation. Schema diagnostics and handler defects return bounded messages rather than raw input, output or underlying causes. `ActivationFailed` exposes `module` and `reason: 'layer-failed'`, not the layer's raw error. This is an intentional non-disclosure change to the previous `cause` payload.

The portable `Receipt` schema is exported from `@eventiva/contracts/receipt`. Each receipt identifies its invocation and resolved caller, canonical action/version, canonical input digest, outcome, start time and duration. It contains no raw input or approval token. The platform supplies a SHA-256-or-stronger `InputDigest`. Canonicalization sorts object keys, preserves array order and rejects non-JSON values. Input schemas reject excess wire properties. Successful mutations return exactly the receipt committed by the integrity adapter; replays receive a new invocation receipt after current authorization is checked.

Invocation options are untrusted intent:

| Option                             | Default  | Meaning                                                                                                                                                                                                     |
| ---------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `idempotencyKey`                   | None     | Required for writes/external actions; nonblank, at most 512 characters. Scoped by tenant, principal, action and version. Reusing a key for different canonical input fails.                                 |
| `approvalId`                       | None     | Opaque reference resolved through trusted `Approvals`; never accept an approval object from an adapter.                                                                                                     |
| `mode`                             | `online` | `online`, `offline-intent` or `scheduled`. Processing an offline intent here is online authoritative revalidation, not an offline queue.                                                                    |
| `notBefore`                        | None     | Earliest execution time in epoch milliseconds. Scheduled calls require it.                                                                                                                                  |
| `deadline`                         | None     | Exclusive execution deadline in epoch milliseconds. Scheduled/live-production calls and guarded offline intents require it.                                                                                 |
| `expectedActionVersion`            | None     | Exact registered action version (a positive integer), checked on the captured registration before input preparation, including replay. A mismatch fails with `Forbidden`, reason `action-version-conflict`. |
| `expectedVersion`, `expectedState` | None     | Must match trusted current state when supplied. Both are required for nonroutine offline intents.                                                                                                           |

Use `expectedActionVersion` when a trusted composition pins work to a particular action contract. For example, `host.execute('fixture.annotate', { resourceId, revision: 1 }, { idempotencyKey: deliveryKey, expectedActionVersion: 1 })` either uses registered action version 1 or denies the call; it never silently upgrades queued work. This intent does not grant permission or approval. `expectedVersion` remains the separate string-valued resource-state check; it is not an action-version pin.

The SQL hook integration fixture in `tests/storage/src/hook.spec.ts` composes the existing `HookSink` with canonical `ActionHost` and durable Integrity/Audit. It tests a committed SQL effect followed by lost settlement, worker connection/scope closure and fenced reclaim, with one business effect and current authorization on replay. The principal binding, exact subscription/producer pins and event-to-input mapping in that fixture are test-only trusted composition. They do not supply a production principal registry, prove producer readiness from a numeric generation, or define a general hook renderer. A production composition must supply those trust decisions separately; additive hooks never bypass required human approval.

Human routine reversible writes need no second confirmation. Agent writes require confirmation unless trusted live policy preauthorizes that bounded routine operation. Nonroutine action risk and tenant policy can raise, never lower, this floor. Only a human approval is accepted; agents cannot self-approve. Approval binds principal, tenant, action/version, canonical input (including exact batch items), live numeric bounds, validity window and step-up when policy requires it. The policy must derive limits from decoded input, not transport assertions. An approval id is not authorization, and revoked approvals do not authorize replays.

Preparation captures canonical encoded input before resource authorization or policy inspection can retain a decoded reference. Each resource check, policy inspection and handler execution decodes its own target from those private immutable bytes. A callback that mutates its target cannot substitute the value used by another callback, transaction revalidation, the handler or replay binding. Transforming schemas still supply decoded domain types, such as a number for `NumberFromString`; the runtime does not JSON-serialize decoded domain objects or freeze shared schema definitions. Keep codecs deterministic and round-trip consistent: a codec that cannot decode its own encoded value fails closed with a sanitized defect.

Run `pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/execution.spec.ts -t 'A1/A2: admitted' --coverage.enabled=false` from the repository root to exercise the EVE-39 regression. The synthetic financial fixture binds approval/hash to nested amount 20 and limit 20, then attempts amount 999, nested item replacement and array extension from trusted authorization/policy callbacks, immediately and through retained references during a transaction-admission wait. Unchanged controls, transformed input, committed replay and changed-input rejection share the public host path. This explicitly volatile proof is not an external exploit, real payment, durable SQL/crash test or production acceptance.

Scheduled and queued intents recheck live identity/delegation, permission, state/version, dependencies, capacity, approval and timing at execution. The mutation callback rechecks after any integrity lock wait; replay returns recheck too. Conflicts and expired instructions are explicit denials, never last-write-wins. Financial and live-production risks enforce online-only execution even if a specification declares weaker offline metadata. Scheduling, durable queues, domain-specific state transitions, and immutable baseline versus live forecast storage remain feature/storage responsibilities; do not implement them in a transport.

After a new mutation handler returns, the executor refreshes identity, registration/flag availability, coarse and decoded-target permissions, live policy, approval evidence, timing and audit readiness before returning success to `Integrity.commit`. A refusal rolls back the paired SQL transaction, including staged domain/guard history and successful commit evidence. This final check does not repeat `expectedVersion`, `expectedState`, dependency readiness or capacity availability: those admission preconditions may have been consumed by the authorized mutation itself. They remain mandatory before the handler and on replay. Policy inspection and decoded-target authorization must support checking authority against the transaction's post-mutation state; do not use target authorization as a substitute for optimistic business preconditions. The existing real-SQL batch regression in `apps/server/tests/http-action-batch.spec.ts` distinguishes in-handler session/membership/permission/action revocation (current item rolls back) from transport/batch-only switches (the authorized current item commits, the suffix stops and retry replays that prefix).

Run `pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/execution-approval-commit.spec.ts --coverage.enabled=false` with the disposable loopback PostgreSQL fixture described in [machine setup](../AGENT-SETUP.md). The same public-host suite runs actual SQLite and PostgreSQL Resources with paired Storage/Integrity/Audit. Deterministic handler waits cover raised approval requirements, revoked proofs, exclusive deadline/proof expiry, rollback of domain/guard history and successful receipts/deduplication, recovery/replay and authorized self-mutation consuming version/state/dependency/capacity preconditions. Trusted synthetic target policy and approval references are fixture assumptions, not production approval-store or Caller-propagation certification. This protects SQL commit boundaries, not already-performed external effects; stage external work in the transactional outbox. Broader EVE-275/core qualification and paused asset acceptance remain separate.

The executor keeps decoded execution intent private for the invocation's lifetime. Each policy inspection receives a separate view of its scalar fields. Deleting or replacing that view's deadline, schedule, expected state/version, idempotency key or approval reference cannot change the values enforced before execution, after integrity waits or before replay returns. This isolates intent only: current policy, identity and approval revocation still apply. There is no new option, public freezing requirement or policy override.

Run `pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/execution.spec.ts -t 'A3: admitted' --coverage.enabled=false` to check this boundary. An unchanged future deadline succeeds; deadline 0 remains expired even when policy deletes its received deadline, with no handler entry, domain write or successful dedup entry. Separate cases attempt immediate idempotency/approval/mode substitution and retained-reference changes during deterministic integrity waits for new work and replay. Timing and changed live state/version still deny; unchanged original references still replay one committed write. The fixture is volatile in-process adapter-corruption evidence, not a production dispatch, durable SQL/crash proof or whole EVE-39 acceptance.

## Supply trusted platform services

`ActionHostLive` requires `Flags`, `Authorizer`, `IdentityResolver`, `InputDigest`, `ExecutionPolicy`, `Approvals`, `Audit` and `Integrity`. Supply them at the app/integration boundary. Security, approval and audit are mandatory foundation invariants, not optional feature flags. Feature capabilities retain their manifest flags; the portable inventory itself has no autonomous IO.

`Integrity.commit` must atomically commit domain state, the idempotency result, state transition/append-only history, outbox and successful receipt in one authoritative transaction. Storage services used by a handler must participate in that same transaction. Failure, defect or interruption rolls back every part. Serialize competing identical keys. Keep high-integrity deduplication evidence for the business record's lifetime; this runtime imposes no short TTL. External actions commit an outbox command, not a second untracked provider call.

`Audit.ready` checks protected-call availability before handlers run. `Audit.record` must persist a receipt or, only for low-risk reads, append it to a durable bounded local spool and report `spooled`. Protected calls never spool. Exhaustion fails closed. Recovery must deduplicate receipt ids and drain exactly once. An in-memory array and a log line are not durable audit.

`FailClosed` supplies no permissive identity, approval, policy, integrity or audit fallback. The server shell wires its process-owned identity and SHA-256 digest only for inventory diagnostics; smoke lists registrations without invoking an action. Authenticated backends use the common [SQL Cluster composition](cluster.md), which builds `durable` inside each trusted tenant route against the handler's same Storage transaction. There is no direct local invocation fallback. EVE-42 supplies real persistence; EVE-43 owns provider selection; EVE-45 owns feed delivery. The shell is not a public authentication provider.

For tests only, use `makeTestOnlyHarness` from `@eventiva/runtime/testing`. Its explicitly volatile ledger stages domain/history/outbox writes and atomically models receipts/deduplication, bounded spooling, recovery, revocation and concurrency. Its digest is deliberately noncryptographic. Never wire `TestOnly` into a production composition root or claim it proves durable database behavior.

## Troubleshoot

- `InvalidModule`: fix the manifest/specification mismatch, blank description, invalid permission/version or security metadata; do not bypass registration.
- `Forbidden` with `action-version-conflict`: restore the exact pinned action registration or explicitly reauthorize new work for the new contract. Do not retry with the current version copied from inventory.
- `UnsupportedSchema`: simplify the wire schema or add a reviewed structural profile rule with a negative test. Do not silently discard validation constraints.
- `InvocationDenied`: inspect the safe reason identifier, then correct identity, approval, timing or live resource state. Retrying an expired or changed intent does not repair it.
- `AuditUnavailable`: wire/recover the durable audit or integrity adapter. Do not catch this error and return the handler output.
- `ActivationFailed`: check the module's service configuration and provider health; never copy credentials or raw causes into the public registration error.
- `InventoryParityError`: restore the missing surface/action/version/permission mapping. Do not exclude a surface to make parity pass.

Run `pnpm exec vitest run --config vitest.config.mts` from `tests/runtime` for host and strict compile-negative action proofs. The type proof uses the pinned patched compiler, keeps strict settings, checks decoded versus encoded types and declared failures, rejects missing/wrong service layers and proves that swapping two providers of the same service does not change a handler. It does not clear unrelated baseline storage, identity or schema typing findings in EVE-263, nor does it certify vendor opacity exceptions or the combined source graph.

## Cancel consent with an exact resource grant

The resource-cancellation follow-up supersedes only A's event-grant/lead seam
described above. It does not change the selected session policy or implement
rolling renewal. See the [qualification record](core-qualification/resource-cancellation.md)
for policy provenance, executed evidence and delivery state.

For another person's pending approval, grant `approvals.cancel` on the exact
trusted resource reference captured during registered preparation. For example,
if `ApprovalEvents.resolve` returns
`{ "event": "event-a", "resource": "registered-target-17" }`, the permission is:

```json
{
    "permission": "approvals.cancel",
    "resources": ["registered-target-17"]
}
```

This grant does not cover another resource in `event-a`. An event-shaped grant,
wildcard or a role named `Event lead` does not substitute for the exact reference.
The existing `ApprovalEvents.canCancel` method now documents an association-only
contract: verify the target still belongs to its captured tenant/event, fail
changed/unavailable association closed, and do not infer lead authority. The
runtime independently reads live explicit grants from roles and teams. No
contract shape, cancellation input, new event-domain table or production event
provider is introduced; cancellation still takes only the approval id.

Own-pending cancellation and an independently granted exact `tenant:<tenant id>`
cancellation scope keep their existing behavior without requiring this adapter.
All paths still require a current same-tenant human/session/membership. Used or
expired pending approvals cannot be cancelled; authorized repeats do not append
another decision. The original approver remains immutable, while cancellation
and its cancelling-actor audit commit or roll back together. The lifecycle gate
`identity.approval-consent-enabled` remains default false; missing association
has no accepting fallback. No other options or defaults change.

Run the normal storage and runtime gates with the disposable database in
[machine setup](../AGENT-SETUP.md). The compiling real-SQL cancellation examples
are in `tests/storage/src/approval.spec.ts`; their association adapter is synthetic,
not an implemented event feature. If cancellation is denied, inspect current
exact grants and trusted association availability instead of submitting a
resource in cancellation input or granting a broader event scope. Retention
cleanup, renewal activity classification and production activation remain separate.
