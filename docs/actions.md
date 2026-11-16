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

Run `node --run parity` to validate the canonical server inventory, scoped discovery and its shared dispatch path. Run `node --run verify` for parity plus lint, typecheck, tests, builds and smoke. CI includes parity in the required `application check`; dependency-free `node --run check` does not load application code. New surfaces must compare their complete advertised ids, versions and permissions using `validateParity` and name every required surface explicitly. The current production surface is the server shell; HTTP, MCP, ACP, UI transport bindings and provider selection are separate work, not simulated adapters in this package.

## Invoke with receipts

Provide `Caller` per call. Call `host.execute(name, wireInput, options)` to receive `{ result, receipt, replayed, audit }`. `result` is an Effect `Exit` preserving success, declared failure, defect or interruption. `host.invoke` is a convenience projection of this same path that returns the output or fails; it never bypasses receipts. If the receipt cannot be persisted under A4, the call fails with `AuditUnavailable` instead of returning unrecorded output.

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

Scheduled and queued intents recheck live identity/delegation, permission, state/version, dependencies, capacity, approval and timing at execution. The mutation callback rechecks after any integrity lock wait; replay returns recheck too. Conflicts and expired instructions are explicit denials, never last-write-wins. Financial and live-production risks enforce online-only execution even if a specification declares weaker offline metadata. Scheduling, durable queues, domain-specific state transitions, and immutable baseline versus live forecast storage remain feature/storage responsibilities; do not implement them in a transport.

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
