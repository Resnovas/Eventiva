<!-- linear:generated:start -->
# EVE-60: Telemetry F4: Propagate session and person context from clients into server spans, logs, errors and AI spans

[Live Linear source](https://linear.app/resnovas/issue/EVE-60/telemetry-f4-propagate-session-and-person-context-from-clients-into) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-17T13:23:55.589Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Backlog (backlog) |
| Priority | 0: No priority |
| Labels | Decision: Confirmed, Delivery: Implementation pending |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | None recorded |
| Related to | [EVE-19](EVE-19.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Goal

Every server-side span, log line, captured error and AI span carries the caller's PostHog session id and distinct id, so logs link to Session Replay and Person and AI Observability links to replay and errors (house telemetry must-haves).

## Context

* Decided contract: [EVE-19](<https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend>) comment "S6 findings" (accepted 2026-10-31).
* posthog-js has a `tracingHeaders` extension that adds session id and distinct id headers to fetch/XHR (`lib/src/extensions/tracing-headers.d.ts`, posthog-js 1.444.0). posthog-react-native 4.85.1 has the same option, `addTracingHeaders` (adds `X-POSTHOG-DISTINCT-ID` and `X-POSTHOG-SESSION-ID` to matching fetch requests; corrected 2026-10-31, see <issue id="a5a3ce16-9f4f-484c-9a58-4562bfc9e5b3" label="EVE-19" href="https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend" /> recheck comment).
* posthog-node has no log API, so server logs go out as OTLP via Effect and need these attributes to link.

## Work

1. Read posthog-js `tracing-headers` to get the exact header names. Record them in a comment.
2. Clients: enable `addTracingHeaders` (native) and the web equivalent for Eventiva's API hostnames only, and confirm Effect `FetchHttpClient` requests go through the patched global fetch. If they do not, add the two headers in the app's `HttpClient` layer instead.
3. Server: one Effect middleware for the HTTP and RPC entrypoints that reads the headers through `Schema`, validates them, and puts them on a `FiberRef` / span attributes (`posthog.distinct_id`, `$session_id`) and `Effect.annotateLogs`, so every span and log below inherits them.
4. `ErrorReports.report` and AI span creation read the same context; AI spans set the attributes PostHog uses to link generations to sessions (confirm names from `@posthog/ai` source).
5. Agents calling actions without a browser session: use the agent run id as the session-like id and the delegating user as the distinct id; document it.
6. Respect `telemetry: false`: no headers sent, no attributes set.
7. Tests with `@effect/vitest` for header parsing, inheritance into child spans and logs, and the telemetry-off path.

## Acceptance

A request from web and from native produces a server span, a log line and an error event that all show the same session and person in PostHog (verify once F2's dev project exists; until then, verify with an OTLP debug sink).

## Done signal

Merged to main with tests and docs (people docs and ai-docs).

## Linear comments (5)

### Comment 7f7ecc12-701e-425c-86c4-d949875c97eb

Author: GitHub. Created: 2026-10-31T22:45:49.160Z; updated: 2026-10-31T22:45:49.130Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-60/telemetry-f4-propagate-session-and-person-context-from-clients-into) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/827). All replies are displayed in both locations.


### Comment ed4d2185-de8f-48cf-bd7d-ec3741619162

Author: Amp. Created: 2026-11-17T13:06:36.910Z; updated: 2026-11-17T13:06:36.883Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-60/telemetry-f4-propagate-session-and-person-context-from-clients-into) (comment ID above). Parent: None. Resolved: Not recorded.

## EVE-60 readiness evidence - synthetic local-only checkpoint (2026-11-17)

Analysis only. No repository files changed, implementation started, tests executed or reservations acquired. EVE-60 remains Backlog. EVE-58 is not a hard prerequisite: this checkpoint uses the existing central local sink. The requester has sent the identifier-policy question to Jonathan; real-identity/export work is deferred entirely until he decides.

### Goal and scope

One app-owned Schema/Effect request wrapper, exercised through real ephemeral loopback HTTP requests and the current telemetryLayer/TelemetrySink. Parse the exact headers X-POSTHOG-DISTINCT-ID and X-POSTHOG-SESSION-ID; admit only complete pairs of finite, composition-declared synthetic tokens. Scope annotations over the request span, nested spans, scoped child-fiber logs and fixed ERROR logs; restore context after completion/failure/interruption. Headers never authenticate a Caller, select a tenant or confer a grant.

Reuse current TelemetryPolicy exact-value allowlists, not a new logger/exporter/unfiltered sink or a request-derived dynamic allowlist. Local keys are posthog.distinct_id and posthog.session_id; the latter is explicitly a schema-compatible local alias, NOT verified PostHog $session_id linkage. Restrict this synthetic checkpoint to nonempty 1..96 ASCII identifier characters. Invalid, partial, duplicate/comma-joined, overlong or unallowlisted pairs contribute no metadata and do not fail the business request or expose rejected values.

Declare a safeDefault=false telemetry.correlation.enabled flag in the app-owned module, using injected Flags, and also honor existing telemetry.enabled. Preserve existing profile minimization. The listener/send-only synthetic clients belong to the test harness; do not activate an endpoint in diagnostic main or change the held PostHog connect integration. Error evidence is an ERROR log plus a failed span, not a captured exception event.

### Exact paths to request

- apps/server/src/telemetry-correlation.ts (new request wrapper/schema/flag)
- apps/server/tests/telemetry-correlation.spec.ts (new loopback/public-boundary tests)
- docs/telemetry.md (existing people guide)
- ai-docs/src/17_telemetry/index.md (existing agent guide)

These are proposed reservations only. No runtime, contracts, kernel, exporter, dependency, root/Nx/CI or checker change is necessary. Existing server test discovery includes tests/**/*.spec.ts. Its coverage list currently covers cluster*.ts/backend.ts only: explicitly measure the new module in focused CLI coverage and hand durable coverage wiring to the coordinator before integration. Shared planning mirrors/generators, manifests, LLMS, Graphify and debt/governance outputs remain coordinator-owned.

Avoid all packages/contracts/src; current documentation reservations packages/integrations/formatjs/src/i18n.ts, packages/integrations/openfeature-client/src/flags.ts, packages/integrations/openfeature-server/src/flags.ts, packages/integrations/posthog-client/src/connect.ts, tests/telemetry/src/server.spec.ts; and all six pending EVE-34 paths: apps/server/src/agent-run.ts, apps/server/tests/agent-run.spec.ts, apps/server/tests/sql-fixture.mjs, apps/server/tests/two-runners.mjs, docs/cluster.md, ai-docs/src/14_cluster/index.md. Reservation evidence came from the current coordinator/documentation threads; no EVE-34 patch was imported.

### Acceptance tests (@effect/vitest)

1. Send two asymmetric synthetic pairs through actual loopback HTTP using FetchHttpClient. Assert each request/nested span, scoped forked log and ERROR log retains its own exact pair; failure produces a correlated failed span, correct trace/parent IDs and the unchanged safe response.
2. Barrier-interleave A/B requests; no cross-request ID mixture. Headerless next request and outside/parent logs are clean. Restore after typed failure/interruption and close scoped child fibers. Detached/daemon work is not certified.
3. Accept mixed-case header names. Reject missing/empty/malformed, duplicates/comma joins, controls, 97-character values and syntactically valid unallowlisted values; independently prove an explicitly allowlisted 96-character value works. No partial context or raw rejected-value/decoder canary leak. Invalid correlation cannot change business authorization/outcome.
4. Missing/false correlation flag installs neither annotation even with supplied headers; telemetry.enabled=false produces no optional records. Probe annotation scope independently so a silent sink alone cannot pass the off test. Bootstrap diagnostics/mandatory audit remain unaffected.
5. Restricted/Vault and invalid profiles preserve minimization; no header can downgrade profile/select identity/tenant. Bodies, credentials and error-message canaries stay absent from central records.
6. Sink failure remains lossy and does not change business results; existing bounded flush/drain, no new retry/backlog.

Focused planned command (NOT executed): pnpm exec vitest run --config apps/server/vitest.config.mts tests/telemetry-correlation.spec.ts --coverage.include=apps/server/src/telemetry-correlation.ts

Retain thresholds. Coordinator combines affected server lint/typecheck/test/build, the complete tests/telemetry/vitest.config.mts suite, node --run documentation, node --run check and normal aggregate verification. The Nx server test has cluster-conformance dependencies: use the prepared coordinator fixture; do not weaken it or edit pending EVE-34 fixtures. Deliver both guides/JSDoc and exact-head evidence; do not close EVE-60 for this checkpoint.

### Why this is bounded

Read live EVE-60 and its complete returned comments; EVE-19 and all four comments; readiness artifact; current source, planning and reservation reports. Checkout HEAD was 8a1440bbbbc04e8f5bed2e7d253683600a713d00; git merge-base --is-ancestor 82320fc HEAD exited 0. 82320fc is the landed batch's graph refresh, not its implementation diff alone.

Current source: contracts/observability.ts:52-54 rejects $ in attribute keys and has only log/span signals; runtime/telemetry-export.ts:108-115 strips all attributes; telemetry.server/src/otlp.ts:244 emits empty span attributes and ignores logs. docs/telemetry.md permits finite synthetic tokens, not arbitrary real identities. apps/server/src/main.ts:39-46 is explicitly a registration diagnostic; no active ErrorReports/captureException/AI producer was found. Installed @posthog/core 1.64.1 tracing-headers.js:34-35 confirms both header names and exact-hostname global-fetch patching; the current client pins posthog-react-native 4.85.3 and exposes flags-only connect. No new SDK is needed for this slice.

Unproven/out of scope: real authenticated HTTP/RPC ingress and trusted identity reconciliation; real web SDK/client composition, CORS/hostname/redirect/opt-out/fetch timing; iOS/Android devices or Hermes/replay lifecycle; captured errors, AI generations and agent-run/delegating-user fallback; actual PostHog association/OTLP log or identity export; production release/provisioning. SDK-shaped Node fixture requests are NOT web/native execution. A failed span is NOT a captured error event.

Read-only git status remained empty and git diff --quiet returned zero. No tests were rerun. Graphify query returned not set up; direct scoped source inspection substituted without setup/writes. Graphify Cloud and gateway tools were unavailable; connected Linear reads succeeded. Repository mirrors intentionally remain unchanged under the no-files instruction and need coordinator synchronization at implementation handback.

Full packet: https://ampcode.com/artifacts/eve-60-local-correlation-492fa4b8-fe37-4f55-970d-25284b885113
Analysis thread: https://ampcode.com/threads/T-4be99227-4a2c-4631-8695-0c0b97c802f0


### Comment 55507185-3858-42e4-b1f9-e868357b54f7

Author: Amp. Created: 2026-11-17T13:17:48.704Z; updated: 2026-11-17T13:17:48.683Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-60/telemetry-f4-propagate-session-and-person-context-from-clients-into) (comment ID above). Parent: None. Resolved: Not recorded.

## Binding EVE-60 identifier decision - Jonathan, 2026-11-17

Jonathan selected option A at **2026-11-17T13:16:16.737Z** in the [Puck/source thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a), message 111, message ID M-034zAdKE8gYXMPhFvUXwdD. The source was read and identifies this as an authenticated human selection by Jonathan Stevens, not merely an agent-authored proposal.

Exact selection:

> A: scrambled (hashed or rotating) session and user IDs. Each request opts in, the user needs current consent, and protected profiles are always excluded.
>
> this please.

The subsequent Puck relay to the analysis lane states the implementation constraints explicitly: only pseudonymous session/person identifiers, hashed or rotating, may leave the process through a narrowly governed correlation field/channel; every use requires per-request opt-in, the user's current consent/release grant, and denial for Restricted, Vault and other protected profiles. Raw IDs never leave the process. This paragraph records relay wording separately from the verbatim human selection.

This later decision narrows the earlier EVE-19/EVE-60 raw session/distinct-ID propagation sketch; it does not authorize raw tracing headers, arbitrary metadata, stable identity profiles, new keys/dependencies, project provisioning or production ingestion. A flag or request-carried boolean is not current authenticated consent. Existing protected-operation/profile denials and fresh release checks remain mandatory.

The synthetic local-only lane T-9ac7101a-b703-4cc7-ba70-a5532abd4cdd remains unchanged. A separate follow-up design packet is being prepared; it is not implementation or release authorization. Any deployment key/secret provisioning or new dependency still requires Jonathan. The need for dedicated correlation-key ownership/provisioning and a rotation lifetime has been immediately escalated; no key was provisioned or secret generated/stored.

Repository files remain unchanged under this analysis-only task. The canonical repository decision/timeline/source mirror therefore does not yet contain this new decision and must be synchronized by the coordinator in its reserved planning window. Source citation and timestamp above govern until then. Neither whole EVE-60 acceptance nor any new passing test is claimed. Recorded by the analysis agent from the cited human selection and separate Puck relay. Follow-up packet will be linked separately.


### Comment f1fbb53f-8bc1-433b-abbe-679e8419dfc2

Author: Amp. Created: 2026-11-17T13:23:55.634Z; updated: 2026-11-17T13:23:55.589Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-60/telemetry-f4-propagate-session-and-person-context-from-clients-into) (comment ID above). Parent: None. Resolved: Not recorded.

## Synthetic local-only checkpoint implemented, not whole-issue acceptance

Autonomous Amp (GPT-6.1 Sol, openai/gpt-6.1-sol). Implemented packet revision 2 after coordinator clearance, on immutable base 1674f6fec4c3cf061794975dde61d6959a4afe75 (independently matched origin/main before editing). No commit/push or status change; EVE-60 remains open. Source-only handoff goes to coordinator T-66e90dd6.

Exactly four paths: apps/server/src/telemetry-correlation.ts; apps/server/tests/telemetry-correlation.spec.ts; docs/telemetry.md; ai-docs/src/17_telemetry/index.md. The app-owned Effect wrapper admits only complete unique 1..96 ASCII identifier-character pairs from the existing finite composition-owned TelemetryPolicy allowlists. correlationFlag telemetry.correlation.enabled defaults false; telemetry.enabled independently prevents annotations. Log/span scope covers request/nested/scoped-child/error work and restores after success/failure/interruption. Existing minimized sink/profile rules remain authoritative. No dependency, auth, tenant derivation, production endpoint, runtime/contracts/exporter or shared generated output change.

Executed on this base plus the source patch:

- pnpm exec vitest run --config apps/server/vitest.config.mts tests/telemetry-correlation.spec.ts --coverage.include=apps/server/src/telemetry-correlation.ts: 1 file passed; all 6 acceptance groups passed. New-module coverage 100% statements (26/26), branches (18/18), functions (6/6), lines (23/23); unchanged thresholds.
- pnpm exec tsc -b apps/server/tsconfig.spec.json --pretty false: exit 0, no diagnostics.
- NX_DAEMON=false pnpm nx run @eventiva/server:lint: Successfully ran target lint, exit 0.
- pnpm exec vitest run --config tests/telemetry/vitest.config.mts: 4 files/43 tests passed; aggregate statements 96.21%, branches 94.88%, functions 92.79%, lines 96.67%, existing gate retained. Existing diagnostic/bootstrap/audit tests unchanged.
- node --run documentation: 89 fixtures passed; offline mirror/planning 0 stale outputs; ratchet 0 violations. This is not live Linear freshness or resolution of the 2 pre-existing unresolved decision sources.
- Four-path prettier check, licence-header check, git diff --check and reverse patch check passed. Both new guide examples typecheck against installed sources. Useful JSDoc/semantic review completed: production module has zero documentation findings; test source has no missing/prose debt and 3 reviewed rationale-only assertion/registration candidates, no checker exemptions.

The six groups cover real ephemeral loopback HTTP with pinned FetchHttpClient/Node server and two asymmetric pairs; exact log/span/error metadata and parentage; barrier interleaving/no mixtures, following headerless/outside logs and cleanup/restoration on all exits; header shape/duplicate/control/96-vs-97/allowlist boundaries; independent annotation probes for both opt-outs; protected/invalid profiles, actual Caller/CurrentTenant preservation and payload/credential/error canaries; lossy sink rejection/outage without business failure or added retries/backlog. HTTP-invalid bytes are tested at the wrapper boundary, not falsely claimed as transmitted. First-run fixture ConfigProvider delimiter and child-start race were corrected without weakening tests.

Patch SHA-256 f8d22db23299ad3ad71e0e8163685ce7b548db390ddff7e6c9cc3ff4521ef24c. Coordinator receives source patch, raw logs, example checker and full evidence in the handoff archive. Coordinator retains durable coverage inclusion, planning/mirror updates, LLMS/Graphify regeneration, exact-head combined checks and delivery. Root check/combined server tests/normal aggregate are not claimed here.

Real identifiers remain held pending Jonathan's decision. posthog.session_id is only a local alias, not verified $session_id association. SDK-shaped synthetic fixtures do not prove actual web/native/device SDK propagation. ERROR log plus failed span is not a captured exception event. Production ingress, AI/agent-run fallback, PostHog association, real identifier/OTLP log export and release remain out of scope.

Graphify query was unavailable (not set up); scoped source inspection substituted. Graphify Cloud/gateway discovery were not connected; used connected Linear, Context7 pinned Effect docs and installed source/declarations. Shared setup/regeneration was left with its reserved owner.

Implementation thread: https://ampcode.com/threads/T-9ac7101a-b703-4cc7-ba70-a5532abd4cdd


### Comment 9cb2d84b-90b0-41b8-aeb9-1253346d5f39

Author: Amp. Created: 2026-11-17T13:23:58.129Z; updated: 2026-11-17T13:23:58.114Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-60/telemetry-f4-propagate-session-and-person-context-from-clients-into) (comment ID above). Parent: None. Resolved: Not recorded.

## EVE-60 key-design authorization and follow-up packet - 2026-11-17

Jonathan's authenticated choice completed at **2026-11-17T13:18:55.545Z**: "Dedicated correlation key in a secret store/KMS, separated per tenant, destination and purpose, with a rotation period (IDs stay linkable across servers until it rotates)". [Source message 117](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a#M-034zAhMfkED3GP4HRhDPyQ) is a recorded human option selection, not human-authored prose selecting an algorithm or lifetime.

The separate [Puck relay at 13:18:57.817Z, message 118](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a#M-034zAhN4VPsAMH7pJlvtnd) explicitly requires server-only custody, tenant/destination/purpose separation, a fixed schedule with lifetime still unconfirmed, design-only authority, no provisioning/generating/storing deployment secrets, no existing-key reuse or dependencies, injected non-production fixture keys and production denial. It confirms that clients carry only trusted-issuer pseudonyms: raw SDK tracing headers are forbidden. This narrows the historical EVE-19 raw-header propagation sketch; synthetic lane T-9ac7101a stays unchanged.

**Recommendation, not owner-selected lifetime:** fixed **one-hour UTC-aligned epochs**, no outbound old-key grace or alias bridge. One hour bounds ordinary linkability substantially below a day while allowing short incident/request analysis across runners; per-request random values would lose that useful continuity. Leases end at the earliest epoch/session/consent/request deadline; exact expiry denies and queued old work is dropped, not rehashed/replayed. Jonathan still needs to confirm the lifetime.

Recommended crypto: local HMAC-SHA-256, independent 256-bit server-only key for each environment/tenant/destination/purpose/epoch, canonical framed preimages and distinct person/session domains. No unkeyed/public-salt hashing, universal key, key reuse or raw-ID bridge. A secret store/KMS may supply a locally usable scoped handle/key after separate provisioning authority; do not send raw preimages to a remote HMAC service. No provisioning occurred.

**Follow-up packet:** https://ampcode.com/artifacts/eve-60-pseudonymous-correlation-60a10e90-aa5c-4ac4-aa12-3844328635fc

Proposed source/doc paths (not acquired):
- packages/contracts/src/telemetry-export.ts (only after contracts-lane/coordinator clearance)
- packages/runtime/src/telemetry-export.ts
- packages/integrations/telemetry.server/src/pseudonym.ts (new)
- packages/integrations/telemetry.server/src/otlp.ts
- tests/telemetry/src/correlation-export.spec.ts (new)
- docs/telemetry-export.md
- ai-docs/src/17_telemetry/02_export.md

Coordinator-only wiring: telemetry.server package.json for the new subpath without dependencies, tests/telemetry/vitest.config.mts coverage inclusion, and reserved planning/source mirrors plus normal LLMS/Graphify/debt outputs. Exact shared paths and sequence are in the packet. None of the synthetic lane's four files, D03 files, pending EVE-34 files, kernel, root/Nx/CI or checker is changed or newly reserved.

Use a dedicated strict pseudonymous channel below a bounded request-scoped existing central telemetry pipeline; leave TelemetryRecord v1 and arbitrary-attribute minimization unchanged. Identity-free local records enter the existing queue; the private request lease rechecks live user consent and exact release binding at each delivery/flush and immediately before transport dispatch, attaching only pseudonyms to the explicit correlation-capable provider. No optional provider argument that an old adapter can silently ignore. Existing non-correlation providers stay denied. A current business authorization is not telemetry consent. Unknown protection classifications and all Restricted/Vault/protected/financial/emergency/decrypting work deny even under a permissive fixture grant. Already dispatched bytes cannot be recalled.

Tests cover independent HMAC vectors/framing/domain separation, multi-runner deterministic output, exact rotation/expiry boundaries, every opt-in/consent/config/profile gate, queued/preparation/dispatch revocation barriers, request isolation, local logs/error logs and failed spans, actual loopback OTLP trace payloads, forged/replayed/substituted pseudonyms, raw/key/error canaries, secret failures/closed scopes, and unchanged synthetic/general-export behavior. Trace-only OTLP does not become Logs/captured-error/AI/replay proof. Proposed focused command: pnpm exec vitest run --config tests/telemetry/vitest.config.mts src/correlation-export.spec.ts --coverage.enabled=false; full suite without overrides and normal affected/aggregate gates remain required. Nothing was executed by this analysis lane.

Production ingress/issuer/current-consent providers, native devices, actual replay/session namespace compatibility, captured errors/AI and OTLP log delivery remain unproven. Do not enable raw SDK tracing headers or assume a server-side hash automatically links to existing replay. Production stays denied. EVE-60 remains open; EVE-19's historical completion is not implementation acceptance.

No repository files or secrets changed; no dependencies or tests added/executed. The new decisions await coordinator synchronization into canonical repository mirrors in its reserved window; this comment and the cited human selections govern in the meantime.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
