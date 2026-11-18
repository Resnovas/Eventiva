# Decision index

Last checked: 2026-11-17. This is an index, not a new approval register. The owning Linear decision governs; detailed contracts stay in the linked architecture/feature document. `Approved direction` does not mean every implementation or target is accepted.

| Direction                                                                                                                                    | Authority and recorded state                                                                                                                                                                                                      | Repository home / boundary                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fresh PNPM/Nx/Expo/React Native/Effect foundation; historical snapshots are reference only                                                   | [EVE-244](https://linear.app/resnovas/issue/EVE-244), Done; [EVE-23](https://linear.app/resnovas/issue/EVE-23), Done                                                                                                              | [Foundation](../foundation.md). Do not import or run active checks against `examples/**`.                                                                                                                                                                                                                                                                    |
| Portable contracts, portable schema, backend runtime; one validated/authorized action path for every surface                                 | [EVE-13](https://linear.app/resnovas/issue/EVE-13), approved three-package foundation, 2026-11-14; EVE-23 Done                                                                                                                    | [Actions](../actions.md), [modular specification](../architecture/modular-platform.md). Architecture approval is not dependency, provisioning or release approval.                                                                                                                                                                                           |
| Named provider composition, controlled lifecycle and safe hot/restart distinction                                                            | [EVE-13](https://linear.app/resnovas/issue/EVE-13), modular-platform continuity; [EVE-257](https://linear.app/resnovas/issue/EVE-257), In Progress                                                                                | [Kernel](../kernel.md), specification sections 2-4. Process-local workflow leases do not prove distributed fencing.                                                                                                                                                                                                                                          |
| Database-neutral Resources over one tenant-bound privileged Storage/SQL path, forward-only migrations                                        | [EVE-258](https://linear.app/resnovas/issue/EVE-258), In Progress; [EVE-261](https://linear.app/resnovas/issue/EVE-261) final resource wiring contract                                                                            | [Resources](../resources.md), [storage](../storage.md). No feature-level SQL escape or replacement atomicity engine.                                                                                                                                                                                                                                         |
| Hooks observe committed changes and add separately authorized effects; never mutate/veto/override originating execution                      | [EVE-13](https://linear.app/resnovas/issue/EVE-13), continuity requirements; [EVE-45](https://linear.app/resnovas/issue/EVE-45) and [EVE-262](https://linear.app/resnovas/issue/EVE-262) divide durability from governed dispatch | [Hooks](../hooks.md), specification sections 6-7. Callback/volatile delivery alone is not durable evidence.                                                                                                                                                                                                                                                  |
| Fresh durable runtime-incarnation UUID on every restart, linked to stable logical runtime identity                                           | [EVE-45](https://linear.app/resnovas/issue/EVE-45), `Binding EVE-45 producer decisions`, 2026-11-17, explicitly records Jonathan's approval                                                                                       | Producer journal is current prerequisite; do not reuse an unfenced incarnation. Automatic kernel integration is next work, not a delivered consequence.                                                                                                                                                                                                      |
| Crash after callback success but before durable confirmation leaves unresolved intent; reconcile by idempotency key and authoritative status | Same EVE-45 binding decision, 2026-11-17                                                                                                                                                                                          | Never blindly replay an ambiguous callback. Atomic confirmation against the existing feed belongs to the producer journal checkpoint.                                                                                                                                                                                                                        |
| Lifecycle events mean committed transitions; invocation attempts/outcomes are separate; authoritative producer bindings establish provenance | Same EVE-45 binding decision, 2026-11-17                                                                                                                                                                                          | Tenant, purpose, security profile, module version and generation come from authoritative context, not snapshots. Actual mutations/cascades/disposal and callback keys must be integrated.                                                                                                                                                                    |
| PowerSync Open Edition for records plus Yjs updates as rows; CRDT convergence and immediate document teardown on lost access                 | [EVE-17](https://linear.app/resnovas/issue/EVE-17), Done; EVE-13 sync decision, 2026-11-09                                                                                                                                        | Decision/spike completion is not complete product sync. [EVE-240](https://linear.app/resnovas/issue/EVE-240) remains native-iOS follow-up; do not claim all devices verified.                                                                                                                                                                                |
| Strict acyclic graphs and exact Effect types are a binding cross-cutting gate                                                                | [EVE-263](https://linear.app/resnovas/issue/EVE-263), Backlog; EVE-261 binding appendix                                                                                                                                           | Existing [source/declaration gate](../../tools/resources/boundaries.mjs) plus Nx/runtime negatives. A Backlog status does not suspend a binding owner constraint.                                                                                                                                                                                            |
| Security profiles/assurance, independent decryption gates, regional marketplace exchange                                                     | [Existing approval-linked register](../architecture/eventiva-platform-and-marketplace.md#decision-register) cites EVE-13/250/251 comments                                                                                         | Keep that register's approved/proposed distinctions; this index does not select vendors, algorithms, regions or key providers.                                                                                                                                                                                                                               |
| Useful JSDoc on every editable TypeScript function/method/class/interface; meaningful internal rationale                                     | Owner documentation requirement; Jonathan approved the reviewed exact debt ratchet on 2026-11-17 and directed complete live zero before strict rationale activation                                                                 | The [2026-11-18 checkpoint](documentation-backlog.md#thirteenth-semantic-checkpoint-and-strict-activation---2026-11-18) reaches empty accepted ledger and complete live zero, adding strict scanning after the ratchet without suppressions or broader exclusions. Preserve the empty provenance ledger; every live finding blocks. Semantic usefulness and meaningful-phase coverage still require review. Publication/CI are separate from local evidence and product acceptance. |

## Sequential local batch boundary - 2026-11-18

The owner-relayed [revision 6 packet and dispatch](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a)
authorize EVE-46's bounded default-off local/test batch route. Exact original
owner-selection time is unknown. This does not authorize atomic execution,
parallel dispatch, automatic mutation retry, public deployment or paid work.
The [issue checkpoint](https://linear.app/resnovas/issue/EVE-46#comment-aecfe4dd)
records executed proof separately; EVE-46 stays Backlog/open. The source mirror
remains historical rather than silently absorbing a partial live refresh.

The [HTTP guide](../http-actions.md#sequential-non-atomic-batches) owns the
contract: exact 1..10-call envelope within the existing total body bound,
whole structural/visibility preflight, sequential existing Cluster/backend
execution with fresh authority and audit, fixed safe errors and preserved
committed prefix. Both transport flags must remain enabled. Original supplied
keys/inputs support explicit recovery; fresh per-attempt wire receipts do not
replace stable original SQL committed evidence. Original HTTP entry/spec,
identity/SQL/execution/compiler and unpublished trust files are not amended.
The separate client lane requires no batch implementation or shared source edit.

## Authenticated local HTTP boundary - 2026-11-18

The owner-relayed [revision 2 packet](https://ampcode.com/artifacts/next-implementation-packets-cd16f2fd-d187-4163-9463-9270422c87b0)
and [dispatch](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a)
authorize EVE-46's bounded local/test HTTP implementation, not its whole issue or
production release. Exact owner-selection time is unknown. The
[implementation checkpoint](https://linear.app/resnovas/issue/EVE-46#comment-3f17d066-7c11-456e-987d-af9676fff29c)
records executed evidence separately from that authority.

Implementation choices in [the existing feature guide](../http-actions.md):
bind only IPv4 loopback; require independently verified bearer proof and live
tenant-local SQL identity for each request; derive routes and Effect HttpApi
OpenAPI from the same current non-sensitive registered inventory; send all
invocations through existing ClusterActions and durable host gates. Sensitive
actions have neither a route nor exposed metadata. The default-off
`http.actions.enabled` flag does not confer permissions. The entry refuses
production; trusted tenant selection and critical dependencies are mandatory,
never request-selected or replaced by the diagnostic shell. Wire bounds and
generic refusals are transport implementation constraints, not newly attributed
owner wording. No compiler/provider contract is weakened.

The first slice has no approval issuance/options API, streaming, batch,
machine-token invention, native client, offline queue or deployment. It does
not accept EVE-46's remaining criteria or authorize telemetry identity export.

## Dependency security and preserved-directory scanning - 2026-11-18

Jonathan approved necessary dependency-security upgrades, including majors, then
approved ignoring every `examples` and `externals` directory regardless of depth
or case, without changing their contents. The decisions were relayed through
[the requesting thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a)
and recorded on [EVE-265](https://linear.app/resnovas/issue/EVE-265#comment-5b68387c-8fd2-4841-ba02-a293a3041e54).
The exact owner-selection times were not supplied. This permits the documented
repository-local house-sync exclusion for Dependabot configuration; it does not
override historical/source preservation or authorize global security disablement.

The [security guide](../dependency-security.md#batch-3-exclude-preserved-reference-directories-from-supported-scans)
separates delivered repository policy, hosted-scanner evidence and owner-side
alert triage. Dependabot version-update exclusions do not remove dependency-graph
entries or alerts. Manifest-path triage and a post-rebuild count need GitHub
security access; this lane's API reads remain denied. Separate automatic Code
Quality path exclusions are not established by the advanced House CodeQL config.
These are explicit remaining boundaries, not waived checks or patch claims.

The same-day quoted 481-vulnerability warning was subsequently traced to
[House Scorecard](https://github.com/Resnovas/Eventiva/actions/runs/44287585365/job/134744139427),
whose CodeQL action only uploads SARIF. The approved directory policy is implemented
for that actual OSV scanner through root gitignore rules and a repository-local,
house-sync-excluded Action v2.5.0 workflow. The scanner upgrade is necessary to
read PNPM's application YAML document, not return a false zero after exclusions.
Real archived-source checks retain one active picomatch finding (481 -> 1), while
all-case/depth and similar-name controls prove narrow scope. This implementation
does not approve advisory-ID suppressions, reference edits, external publication,
shared house changes or reopening EVE-248; [the security guide](../dependency-security.md#batch-4-fix-the-actual-scorecard--osv-scan)
records the tested versions, supported mechanism and remaining hosted-alert boundary.

## Resumed commerce work - 2026-11-18

Jonathan's [owner message](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a#M-034zciY2mZuppwjcEvwc6g)
explicitly follows a list naming EVE-246/247/248 and approves starting/building
the issues. This supersedes deferral for bounded repository implementation,
not source licensing, paid spending, dependency approval, provider agreements
or production activation. Jonathan's later same-day decision defers EVE-248
again, as recorded below; EVE-246/247 remain resumed.

- [EVE-246](https://linear.app/resnovas/issue/EVE-246#comment-1301864e): the
  [payment guide](../payments.md) records the first local per-obligation
  assessment. Policy v1 uses the existing 14/7/3-day calibration; exactly seven
  days for Established is an implementation choice from the approximate issue
  target. A clock result never authorizes moving money or claims escrow.
- [EVE-247](https://linear.app/resnovas/issue/EVE-247#comment-719b971b): the
  [catalogue guide](../catalogue.md) records a bounded mapped-row preview with
  public/private identity separation. Limits of 1,000 rows/10,000 references and
  exact case-insensitive matching are conservative implementation choices, not
  research-derived coverage targets or owner-approved supplier-tool selection.
- [EVE-248](https://linear.app/resnovas/issue/EVE-248#comment-887d205b): Jonathan
  explicitly decides "Leave off for now, revisit in January only". Due date is
  2027-01-04; do not reopen before January 2027. Keep the override and all budgets
  unchanged; no further EVE-248 work or read-only investigation by this lane.
  This supersedes the earlier same-day readiness checkpoint. See the
  [enrollment deferral](../smartcloud-enrollment.md#eve-248-deferral---2026-11-18).

Full aggregate verification and signed delivery evidence are recorded separately
on the owning issues; none of these narrow checkpoints closes broad acceptance.

## Non-production telemetry custody - 2026-11-18

The [EVE-58 activation checkpoint](https://linear.app/resnovas/issue/EVE-58#comment-1ab3f885-5de7-49bc-841d-21126d64fef0)
and [EVE-60 correlation checkpoint](https://linear.app/resnovas/issue/EVE-60#comment-0e6caaaf-6444-4066-8c8a-c06f2a69cb06)
record Jonathan's direction relayed through Puck to the telemetry lane on this
date. The source is an agent relay, not an independently timed human-authored
Linear decision. Select existing dedicated EU project 344329, enable only
dev/staging, and retain every production/protected-profile/consent gate.

Use one dedicated private `TELEMETRY_CORRELATION_ROOT_KEY` and derive 32-byte
per-environment/tenant/destination/purpose/hour keys with HKDF-SHA256. Keep the
hourly UTC rotation, distinct HMAC domains and no old/new alias bridge. Exact
salt/info framing and custody are documented in the
[existing export contract](../telemetry-export.md#configure-private-custody-and-rollout).
This refines key provisioning, not the earlier raw-ID exclusion or live user
consent requirement. Jonathan entered `POSTHOG_API_KEY` privately into Amp
project `resnovas/Eventiva`; the root was pending at the original checkpoint.
Later on this date Puck confirmed both masked project-secret entries and
authorized environment refresh and dev/staging arrival proof. The refreshed
environment contains both; root format validation passed without revealing it.
The live provider returned both dev/staging flags true and production false,
without fallbacks. No deployment target or production release is authorized.

Private local SQLite tenants and explicit storage-backed consent/onboarding are
implementation choices under this scope. EVE-43's verified canonical subject,
session, configured issuer and live SQL deadline are the integration seam.
Presence of code, flags or transport interception is not live ingestion proof,
production authorization or completion of EVE-58's full endpoint matrix.

The same coordination thread explicitly authorized bounded recovery of the
stopped EVE-43 lane's exact unpublished implementation. Preserve its original
signed objects, source checkout, author and model credit; replay the source onto
current main and regenerate the graph rather than recreating its implementation.
Recovery alone neither resolves the supplier findings nor authorizes production.

## PostgreSQL fixture standing acceptance - 2026-11-18

Jonathan's original human messages at
[08:47:18.801Z](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a#M-034zdN6MvN88wCu04N6SDf)
accept continued residual PostgreSQL fixture findings, and at
[08:50:00.894Z](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a#M-034zdRCPlGPp83UkEzUx4k)
approve Alpine and watching Bookworm/Alpine for the lower-vulnerability OS.
The implementing relay replaces the 2026-11-22 expiry and earlier trigger gate
with standing acceptance, no hard expiry and routine rescan/digest hygiene,
solely for isolated disposable synthetic local/CI fixtures. It selects exact
Alpine digest `a77aa70e641402a21411b92b721c58d10f23b50ae5fdd2333efd22d166e1e5f7`
conditional on full storage/server and musl/locale compatibility checks; retain
Bookworm if those fail. Do not infer universal locale parity or production use.

The [storage guide](../storage.md#run-conformance) owns the exact quotes, pins,
fresh scan counts and isolation contract. [EVE-42's dated record](https://linear.app/resnovas/issue/EVE-42#comment-83baa9b6-3011-48f2-9924-861ba5bd3b9c)
supersedes its historical expiry. Both independently scanned architectures
report Alpine 62 findings versus Bookworm 586; neither scan is clean. Keep the
non-superuser CREATEDB role, own-role termination/plain DROP cleanup, trusted
events and all resource/credential/data limits unchanged. This supersedes only
the fixture-image risk/selection terms of `sql-test-image-bounded-risk-exception`
below; the frozen source, original scan and timestamps remain historical.
No production, real-data, provider, broader dependency or whole-issue acceptance
is supplied. Execution and signed delivery are recorded separately in the timeline
and issue rather than inferred from the owner's policy decision.

## Later owner decisions - 2026-11-17

These updates postdate the frozen issue/comment capture. Their distinct owner
selection and agent relay timestamps must not be substituted for capture dates.

- **Mandatory disposal (EVE-45):** Jonathan selected option A at
  11:38:55.329Z in the authenticated choice recorded in the
  [Puck coordination thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a).
  Run resource finalizers even when durable admission is unavailable, expose
  degraded/recovery-required, and never fabricate a durable lifecycle fact.
  Ordinary requested mutations fail closed before callbacks, without replay.
  [EVE-45's Amp relay](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change#comment-2ef327d5)
  was created at 11:41:17.721Z. The [kernel contract](../kernel.md#opt-into-durable-lifecycle-production)
  implements this narrow decision; no production recovery/release is approved.
- **Original OTLP scope (EVE-21):** Jonathan selected adding
  `@effect/opentelemetry` plus a configurable endpoint and headers at
  11:40:29.023Z in the same authenticated Puck thread. Compatible exact versions,
  redacted configuration, default-off/local routing, no retained retry queue and
  tests are implementation constraints, not additional quoted human selections.
  [The source lane's report](https://linear.app/resnovas/issue/EVE-21/remove-sentry-from-core-and-make-telemetry-export-vendor-neutral#comment-bbcf9d9f)
  was created at 11:53:50.388Z. The [telemetry guide](../telemetry.md) keeps
  production ingestion separate from dependency and fixture approval. Live EVE-21
  remains Backlog and EVE-45 In Progress; neither approval closes EVE-261.
- **Event/Phase anchor confirmation (EVE-84):** Jonathan's conditional decision,
  relayed through the same Puck thread on 2026-11-17, selects **option B** for
  general Event planning. The complete live EVE-84 description covers Event
  templates and F1-owned Event/Phase/Segment/Itinerary anchors, not MDT only.
  Confirm every Event/Phase anchor-date change, including changes caused by a
  dependency-delay cascade; non-anchor dates may cascade automatically. Preserve
  baseline/history, absolute/completed-date exclusions, locks, authorization and
  readiness. [The dated Amp relay](https://linear.app/resnovas/issue/EVE-84#comment-f9c96ce3-873a-46ba-9702-bf00bcebc44d)
  was created at 12:31:56.867Z; the exact owner-selection time was not supplied.
  This resolves the earlier scope ambiguity without rewriting the frozen source
  capture, closing implementation prerequisites or authorizing deployment.

## Concrete trust and marketplace parameters - 2026-11-18

Jonathan approved on 2026-11-18 that agents choose well-established standard
options for the concrete cryptography, custody, retention, freshness, recovery
and compensation parameters of [EVE-251](https://linear.app/resnovas/issue/EVE-251)
and [EVE-250](https://linear.app/resnovas/issue/EVE-250), record each with its
reasoning, and implement them. The approval was relayed through the
[Puck coordination thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a);
the exact owner-instruction time was not supplied. The choices below were made by
the implementing agent under that approval. They are sealed floors: callers may
tighten them, never relax them. Values live in
`@eventiva/contracts/trust-profile` and `@eventiva/contracts/marketplace-policy`;
the [trust profile guide](../trust-profile.md) explains each one.

| Decision | Choice | Reasoning |
| --- | --- | --- |
| Signature algorithm | Ed25519 (RFC 8032) for service requests and verifier evidence | Deterministic, no per-signature randomness to misuse, small keys and signatures, native in Node, cloud KMS and HSMs. |
| Canonicalization | RFC 8785 JSON Canonicalization Scheme with `eventiva.m2.v1` / `eventiva.evidence.v1` domain prefixes | Published standard; removes ordering and number ambiguity; prefixes stop cross-protocol signature reuse. |
| Payload binding | SHA-256 digest of exact envelope bytes in the signed header | Standard, collision resistant, already used in the repository. |
| Envelope encryption | AES-256-GCM, fresh KMS-generated 256-bit DEK per record version, 12-byte random IV, canonical header as AAD and KMS encryption context | NIST-approved AEAD; one key per seal keeps GCM far below its random-IV limit; AAD and context stop ciphertext moving between tenants, records, versions or profiles. |
| Key custody | KEKs in an HSM-backed KMS at FIPS 140-3 level 3, non-exportable; root offline 3-of-5 quorum; two approvals for KEK administration | Matches the approved EVE-13 M-of-N custody with the common majority-of-five quorum; no single administrator can destroy or disable keys. |
| Rotation | Signing keys 90 days with 7-day overlap; KEKs 90 days, older versions decrypt-only; intermediates 1 year; root 5 years | Common cloud KMS defaults; overlap covers propagation; decrypt-only versions keep retained evidence readable. |
| Request timing | 5-minute lifetime, 30-second skew, 7-day replay-nonce retention | Short enough to limit replay, long enough for queued gateway retries; retention well beyond lifetime plus skew. |
| Evidence freshness | Identity and resource 5 minutes, workload attestation 15 minutes, broker 60 seconds | Broker authorizes key use so it is strictest; attestation is expensive and changes less often. |
| Revocation propagation | 60 seconds to service caches and key handles; offline devices show cached grants up to 15 minutes and never stage new exchange offline | Bounded staleness required by EVE-251 `304faca9`; offline never confirms authoritative effects. |
| Marketplace freshness | Quote send 24 h; award 15 min with synchronous recheck; contract acceptance and payment 1 min with synchronous recheck; quote validity default 14 days, maximum 90 | Rechecks wherever stock or money is committed; missing or future-dated assertions are `unknown`, never `verified`. |
| Retention | Messages and unawarded quotes 2 years; contract, payment and audit evidence 7 years; public tombstones 30 days; offline caches 15 minutes; legal hold suspends; jurisdictions may only lengthen; destruction waits for every participant obligation | Seven years covers the six-year UK limitation and HMRC periods with margin; shorter limits minimize personal data; satisfies EVE-251 `304faca9`. |
| Recovery | Exponential backoff 1 s doubling to 5 min, 8 attempts; ambiguous outcomes reconcile by idempotency key first | Standard retry shape; never blindly replay an outcome that may already have taken effect (as in EVE-45). |
| Compensation | Undo completed steps in reverse (cancel payment schedule, void contract snapshot, release stock hold); voids append, never delete; collected payments always go to manual recovery and provider refund; mixed-award legs recover independently | Preserves immutable evidence and the non-custodial payment model; no automatic money movement. |
| Invoice reconciliation basis | Immutable Eventiva contract schedule is the baseline; provider and supplier lines that differ, are missing, extra or duplicated become discrepancies for manual review | Answers EVE-250 open decision 6 without inventing component pricing. |

Still open: region placement and jurisdiction mapping, lawful bases per
jurisdiction, staff access to private exchange records (EVE-250 open decision 7),
anti-fraud thresholds (M3), the A2 approval policy, and selection or provisioning
of any KMS, HSM or attestation product. This approval authorizes no spending,
provisioning, new dependency or production activation;
`privateExchangeUnavailable` still refuses private release.

## Later owner decisions - 2026-11-18

- **Keycloak/OIDC identity component adopted (EVE-43):** Jonathan approved, on
  2026-11-18, adopting the EVE-43 identity component and any new packages it
  needs. The instruction was relayed by the
  [Puck coordination thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a)
  to the [implementing lane](https://ampcode.com/threads/T-01a1edbf-561a-77d0-8d2a-98b8242307e4).
  This lane recorded it as the adoption decision for the consolidated batch the
  2026-11-16 owner comment described: image
  `quay.io/keycloak/keycloak@sha256:c68e286cacd87b942ac1939a0a1481461109d6acd3a57dc496969a319a76bbf0`
  and `oauth4webapi@3.8.8`. The lane's own reading, not a quoted owner term, is
  that the decision accepts the residual findings in the
  [vulnerability register](../supply-chain/eve-43-keycloak-findings.md) under
  their listed controls. No finding is reported as fixed. Production
  provisioning, paid infrastructure, mutable tags and version changes remain
  outside it. The [OIDC guide](../identity-oidc.md) owns the contract.

## Historical open and superseded information

- **EVE-60 hourly rotation follow-up, 2026-11-17:** Jonathan confirmed one-hour
  rotation at 15:27:19.582Z in [the authenticated Puck message](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a#M-034zDqigs0qoRlB2tOAQYo),
  conditional on automatic client updating without disrupted actions. The
  separate 15:27:26.780Z relay specifies UTC alignment and tests for in-flight
  and multi-epoch sessions. [EVE-60](https://linear.app/resnovas/issue/EVE-60#comment-c07d8ede-14b4-49b1-bb83-0088bae5cd6e)
  and [EVE-19](https://linear.app/resnovas/issue/EVE-19#comment-f9740a5b-d126-4a55-8000-12bf9971a349)
  retain the decision. This supersedes only the lifetime-pending clause in the
  historical `correlation-epoch-crypto-proposal` below; HMAC/framing are the
  bounded implementation design, not new universal owner crypto selections.
  Production is denied; provisioning, new dependencies and real issuer/consent
  stores are not authorized. The [export guide](../telemetry-export.md#govern-pseudonymous-request-correlation-eve-60)
  owns the contract and current limits. The frozen source mirror remains
  historical; dated planning annotations cite the later evidence separately.

- The 2026-11-15 modular-platform spec and EVE-261 description preserve historical main-integration holds and isolated lane findings. Current coordination owns delivery; this docs lane neither cancels a hold nor pushes independently.
- Proposed algorithms/providers, native federation/OTA combinations, production trust/ingestion and complete multi-runner acceptance remain governed by their owning issues. Their presence in an architecture diagram is not approval or proof.
- The earlier platform index recorded `Eventiva-marketplace-infrastructure-v1.md` as unavailable. Jonathan's 2026-11-17 [bounded reconciliation instruction](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a) designates the [existing architecture index](../architecture/eventiva-platform-and-marketplace.md#current-source-status-and-preserved-history---2026-11-17) as the current repository replacement/index, not a recovered original. Current descriptions explicitly supersede historical missing-source/archive statements for source status while preserving comments unchanged. The two historical reports are reviewed evidence, not unread original content or new approval. Architecture/provider-neutral implementation remains governed by EVE-250 `91db949b` and EVE-251 `15483735`, dated 2026-11-16; composition/policy and full acceptance gates remain open.
- The first documentation scan's 4,114 combined findings were provisional: they mixed missing JSDoc with quality/rationale heuristics and included an inline-comment attachment defect. The corrected classifier separates mechanical attachments from review-only rationale candidates; its inventory, remediation ledger and enforcement remain a separate pending delivery. Neither count establishes global compliance.

<!-- planning:generated:start -->
## Generated decision and evidence inventory

399 curated public-safe decision records; 853 source records covered; **0 sources still require semantic decision review**. This is exhaustive source inventory, NOT a claim that all recoverable decisions have been extracted. Strict decision-review acceptance remains blocked until that queue is cleared. Account identity, an APPROVED keyword, issue Done status and agent reports cannot themselves establish owner approval. Unknown dates and unproven supersession remain explicit.

[Every source and review disposition](roadmap/decision-sources.md). Source changes invalidate exact digests. New decision summaries never copy raw private source bodies/comments. Existing owner-authorized issue pages retain their separate publication policy.

| Record | Public-safe summary | Evidence timestamp | Authority |
| --- | --- | --- | --- |
| [portable-topology](#portable-topology) | Use the same domain code from a laptop to distributed deployments, with replaceable Effect provider contracts and shared conformance suites. | 2026-11-11T00:31:41.924Z | recorded-owner-direction |
| [tenant-database-default](#tenant-database-default) | Default to a dedicated database per tenant, with a narrow shared control plane and tenant-scoped routing, backups and portability; shared operational tables are not the default. | 2026-11-11T00:34:51.853Z | recorded-owner-direction |
| [identity-independence](#identity-independence) | Introduce hosted federated identity early while retaining independent local/OIDC operation; authentication, tenant authorization and entitlement remain separate. Agents receive delegated handles, never reusable credentials. | 2026-11-11T00:39:35.862Z | recorded-owner-direction |
| [resource-permissions](#resource-permissions) | Resource/action permissions are the enforcement primitive across every surface. Roles are convenience bundles, with direct grants, inheritance, conditions, explain-access and narrowly delegated agents. | 2026-11-11T00:42:39.928Z | recorded-owner-direction |
| [managed-permission-groups](#managed-permission-groups) | Managed role/team/organization/deployment relationships remain live: changing a group&apos;s permission bundle changes effective access. Preserve direct exceptions and explain the full granting path. | 2026-11-11T00:43:54.414Z | recorded-owner-direction |
| [permission-simulation](#permission-simulation) | Provide protected permission simulation, what-if/access-diff previews, explainable decisions and saved regression assertions through the same authorized evaluator; simulation never grants access. | 2026-11-11T00:45:08.764Z | recorded-owner-direction |
| [offline-consistency-classes](#offline-consistency-classes) | Declare and test offline behavior by data class: CRDT documents, optimistic ordinary records, authoritative invariant commands and append-only operational journals. Never display unconfirmed physical execution as complete. | 2026-11-11T00:46:07.877Z | recorded-owner-direction |
| [universal-audit](#universal-audit) | Audit mutations, sensitive reads, policy decisions and agent/integration activity with redacted provenance. Sealed evidence is append-only, tamper-evident and verifiable beneath UI controls. | 2026-11-11T00:47:55.439Z | recorded-owner-direction |
| [integrity-profiles](#integrity-profiles) | Select collaborative, versioned, controlled, sealed-record or operational-journal integrity per resource. Universal audit remains mandatory; not every resource uses a submit/approve/post/seal lifecycle. | 2026-11-11T00:50:31.912Z | recorded-owner-direction |
| [module-execution-tiers](#module-execution-tiers) | Use declarative modules by default, capability-confined executable sandboxes for custom logic, and reviewed application releases for native/trusted modules. Registry scanning is evidence, not a sandbox substitute. | 2026-11-11T00:54:47.149Z | recorded-owner-direction |
| [deletion-erasure-accountability](#deletion-erasure-accountability) | Ordinary deletion defaults to 30 days recycle plus 60 days protected quarantine before purge; lawful erasure is distinct and retains only justified evidence. Agents record purpose without gaining permission from purpose text. | 2026-11-11T01:05:06.142Z | recorded-owner-direction |
| [personal-connection-sovereignty](#personal-connection-sovereignty) | Personal connections stay under their owner&apos;s consent and revocation. Tenant policy may constrain use but cannot take ownership or expose credentials; executions show the connection and funding source. | 2026-11-11T01:07:33.545Z | recorded-owner-direction |
| [sponsored-connection-authorities](#sponsored-connection-authorities) | Separate credential ownership, funding authority and tenant execution policy for sponsored connections. Use scoped handles, visible attribution and explicit fallback rather than silently switching who pays. | 2026-11-11T01:09:34.641Z | recorded-owner-direction |
| [portable-tenant-data](#portable-tenant-data) | Make complete tenant migration and structured interoperability first-class, with versioned signed manifests, fidelity declarations, preview/validation and provider-independent adapters. | 2026-11-11T01:16:37.302Z | recorded-owner-direction |
| [protected-export-release](#protected-export-release) | Sensitive exports default to phishing-resistant MFA and a 24-hour cancellation window; sealed/regulated exports require independent dual approval and 48 hours. Scope changes invalidate approval and usable keys stay withheld until release. | 2026-11-11T01:19:56.789Z | recorded-owner-direction |
| [recovery-tiers](#recovery-tiers) | Distinguish community recovery targets (24-hour RPO/RTO), production (1-hour RPO/4-hour RTO), and explicit critical live operations (near-zero RPO/1-hour-or-better RTO), backed by restore/failover evidence rather than blanket guarantees. | 2026-11-11T09:09:44.658Z | recorded-owner-direction |
| [approval-policy-a2](#approval-policy-a2) | Bound routine agent work to preauthorization and live scopes; other writes default to confirmation, while high-risk irreversible/financial/permission/capacity/live actions need fresh human authorization. Agents cannot self-approve. | 2026-11-15T01:44:33.600Z | recorded-owner-direction |
| [guarded-offline-a3](#guarded-offline-a3) | Queue reversible edits or explicit guarded intents with state/version/idempotency/deadline; revalidate online. Payments and live dispatch/show control stay online-only absent a separately validated safety-local profile. | 2026-11-15T01:44:33.600Z | recorded-owner-direction |
| [audit-availability-a4](#audit-availability-a4) | Fail closed when mutations or sensitive reads cannot record durable receipts. Only low-risk reads may use a bounded durable local spool with visible degradation; exhaustion fails closed. | 2026-11-15T01:44:33.600Z | recorded-owner-direction |
| [scarce-resource-integrity-s2](#scarce-resource-integrity-s2) | Use authoritative append-only ledgers, expiring reservations and typed CAS for scarce resources; reconcile payments idempotently and represent money exactly, never with binary floating point. | 2026-11-15T01:44:34.461Z | recorded-owner-direction |
| [offline-device-s3](#offline-device-s3) | Use typed raw device tables with explicit migrations; guarded envelopes carry expected state/version, idempotency key, client mutation ID and deadline through the same server action path. | 2026-11-15T01:44:34.461Z | recorded-owner-direction |
| [forward-migrations-s4](#forward-migrations-s4) | Use forward-only checksum-verified expand/contract migrations with compatibility and recovery evidence; UUIDv7 IDs, exact decimal strings and one Postgres/SQLite temporal contract. This supersedes the blanket down-step requirement. | 2026-11-15T01:44:34.461Z | recorded-owner-direction |
| [neon-production-direction](#neon-production-direction) | Use a dedicated London Neon Postgres project per production tenant; local PostgreSQL images are conformance fixtures and branches are not equivalent production isolation. Keep contracts provider-neutral. | 2026-11-15T03:45:44.054Z | recorded-owner-direction |
| [cdc-cost-and-compatibility](#cdc-cost-and-compatibility) | Keep initial synthetic development replication disabled; a PowerSync/CDC trial needs separate approval, direct privileged replication endpoint and measured active time, lag, retention and cost. Do not silently abandon the approved sync architecture. | 2026-11-15T03:47:29.606Z | recorded-owner-direction |
| [live-control-room-scope](#live-control-room-scope) | Build the full live control-room workflow on real existing issues, not simulated emergency call intake. Reuse shared guided procedures and keep optional training simulation isolated from live dispatch. | 2026-11-15T18:59:10.660Z | recorded-owner-direction |
| [guided-procedure-default](#guided-procedure-default) | Guided procedures are advisory by default; tenant admins may require steps, evidence and named authorized sign-off. Use shared EVE-253 procedures against real linked records, not a second MDT-only engine. | 2026-11-15T19:05:44.515Z | recorded-owner-direction |
| [trust-architecture-reconciled](#trust-architecture-reconciled) | Existing root trust, non-exportable key hierarchy, four independent release gates, sealed profiles, zero trust and assurance floors are binding architecture, not an entirely undecided trust design. Provider-neutral contracts and negative tests may proceed within approved dependencies. | 2026-11-16T19:03:34.533Z | recorded-owner-direction |
| [typed-feature-controls](#typed-feature-controls) | Flag meaningful optional capabilities through typed OpenFeature contracts; never flag away deterministic invariants, permission checks or mandatory security. Signed safety, entitlement and deployment policy override rollout providers. | 2026-11-11T14:43:08.685Z | recorded-owner-direction |
| [fair-core-licensing](#fair-core-licensing) | Retain canonical FCL-1.0-MIT terms and per-version future MIT licensing, with signed portable entitlements distinct from activation flags. Expiry must not disable mandatory security or required customer-data retrieval. | 2026-11-11T14:59:45.599Z | recorded-owner-direction |
| [release-channels](#release-channels) | Use Stable, Beta, Nightly and signed Emergency channels; Canary is a rollout strategy, not separate source truth. Managed stable rollout is staged; self-hosted updates default to administrator approval/schedule. | 2026-11-11T15:02:06.642Z | recorded-owner-direction |
| [compatibility-lifecycle](#compatibility-lifecycle) | Support compatibility for at least two stable majors or 36 months, whichever is longer. Separate 0-24-month active support, 24-36-month community maintenance, license transition and hosted entitlement. | 2026-11-11T15:03:50.229Z | recorded-owner-direction |
| [state-aware-migrations](#state-aware-migrations) | Plan migrations from actual deployment/module/data state rather than a version string alone. Expand, backfill, verify and contract with resumable checkpoints; ambiguous state pauses rather than guesses. | 2026-11-11T15:06:04.206Z | recorded-owner-direction |
| [degraded-operation-contracts](#degraded-operation-contracts) | Every capability declares and tests degraded behavior before production readiness, including staleness, timeouts, bounded queues, truthful pending outcomes and deterministic recovery. Security/integrity uncertainty fails closed. | 2026-11-11T15:08:38.233Z | recorded-owner-direction |
| [reliability-and-simulation](#reliability-and-simulation) | Production capabilities declare measured SLIs/SLOs, error budgets and supported operating envelopes. Provisional objectives are not achieved SLOs; reproducible synthetic simulation tests correctness as well as throughput. | 2026-11-11T15:11:45.069Z | recorded-owner-direction |
| [architecture-01](#architecture-01) | One action specification and one authorized runtime path for every surface | 2026-11-14T22:01:56.117Z | settled-requirement |
| [architecture-02](#architecture-02) | A1: one atomic write of domain state, idempotency evidence, history, outbox and receipt | 2026-11-14T22:35:34.990Z | recorded-owner-direction |
| [architecture-03](#architecture-03) | Three offline execution categories | 2026-11-14T22:07:19.690Z | recorded-owner-direction |
| [architecture-04](#architecture-04) | S1: one logical database per tenant plus a narrow shared control plane | 2026-11-14T22:40:37.397Z | recorded-owner-direction |
| [architecture-05](#architecture-05) | Key hierarchy, root trust, M-of-N custody, envelope encryption | 2026-11-11T09:21:58.718Z | recorded-owner-direction |
| [architecture-06](#architecture-06) | Four independent decryption gates, non-exportable keys | 2026-11-11T09:39:04.901Z | recorded-owner-direction |
| [architecture-07](#architecture-07) | Sealed core security profiles (Baseline, Sensitive, Restricted, Vault) | 2026-11-11T09:23:11.047Z | recorded-owner-direction |
| [architecture-08](#architecture-08) | Zero trust on every route and surface | 2026-11-11T09:55:18.831Z | recorded-owner-direction |
| [architecture-09](#architecture-09) | Assurance levels A1 to A5, A4 for Restricted server-side decryption | 2026-11-11T09:47:42.781Z | recorded-owner-direction |
| [architecture-10](#architecture-10) | Canonical record ownership between the marketplace and tenant databases | 2026-11-14T23:11:16.105Z | recorded-owner-direction |
| [architecture-11](#architecture-11) | Standard marketplace decryption profile | 2026-11-14T23:43:52.873Z | recorded-owner-direction |
| [architecture-12](#architecture-12) | Application-layer envelope encryption for every private exchange | 2026-11-15T00:03:10.888Z | recorded-owner-direction |
| [architecture-13](#architecture-13) | Classification defaults: messages Sensitive; quotes, contracts, awards, invoices, payment evidence Restricted | 2026-11-15T00:15:11.244Z | recorded-owner-direction |
| [architecture-14](#architecture-14) | Marketplace KEKs under M-of-N, per-record DEKs, no universal decrypt key | 2026-11-15T00:36:30.920Z | recorded-owner-direction |
| [architecture-15](#architecture-15) | Revocation, retention and lawful erasure | 2026-11-15T00:46:34.688Z | recorded-owner-direction |
| [architecture-16](#architecture-16) | Region-scoped marketplace cells, global replication limited to public projections | 2026-11-15T01:05:23.343Z | recorded-owner-direction |
| [architecture-17](#architecture-17) | Allowlisted public listing projections | Unknown | settled-requirement |
| [architecture-18](#architecture-18) | Private two-party enquiry threads | Unknown | settled-requirement |
| [architecture-19](#architecture-19) | Mixed-supplier awards with a separate contract, commitment and payment schedule per supplier | Unknown | settled-requirement |
| [architecture-20](#architecture-20) | Non-custodial connected-account payments, commission deducted by the provider, provider-neutral records | Unknown | settled-requirement |
| [architecture-21](#architecture-21) | A2 approval policy, A3 offline and scheduled execution, A4 audit availability | 2026-11-14T22:01:56.117Z | proposal |
| [architecture-22](#architecture-22) | S2 scarce-resource ledgers, S3 device schema and command envelope, S4 migrations and canonical values | 2026-11-14T22:01:56.621Z | proposal |
| [architecture-23](#architecture-23) | M1 cell selection for cross-region exchange | Unknown | proposal |
| [architecture-24](#architecture-24) | M2 canonical signed request envelope | Unknown | proposal |
| [architecture-25](#architecture-25) | M3 anti-fraud review floors | Unknown | proposal |
| [architecture-26](#architecture-26) | Freshness thresholds, compensation and manual recovery, invoice reconciliation basis, staff access to private records | Unknown | proposal |
| [architecture-27](#architecture-27) | Exact region placement and jurisdiction mapping, per-jurisdiction lawful bases and retention schedules | Unknown | proposal |
| [architecture-28](#architecture-28) | Vendors, payment provider, HSM or KMS, attestation verifier and evidence format, algorithms, package pins, paid services | Unknown | proposal |
| [one-client-runtime](#one-client-runtime) | Use one React Native client runtime on native and web, with one agent screen registry; learn upstream DOM behavior rather than porting its browser implementation. | 2026-10-31T22:08:17.505Z | recorded-owner-direction |
| [no-agent-sql](#no-agent-sql) | Agents use canonical actions rather than SQL tools; the accepted capability-map exclusions remain excluded until the owner changes them. | 2026-10-31T22:08:17.505Z | recorded-owner-direction |
| [phase-one-original-proposal](#phase-one-original-proposal) | The original phase-one issue filing proposes actions, config, storage, identity, telemetry, events, HTTP, agent, inbound protocols, screens and collaboration as individual work packets. | 2026-10-31T22:32:36.606Z | proposal |
| [vendor-neutral-telemetry](#vendor-neutral-telemetry) | Keep Effect spans/logs/metrics protocol-neutral, export OTLP directly without a collector, and provide product events/flags/error/LLM services behind replaceable integration layers and an off/no-op mode. | 2026-10-31T22:46:00.372Z | recorded-owner-direction |
| [effect-ai-only](#effect-ai-only) | Eventiva uses Effect AI and Effect Schema through one authorized Action invocation path, without Zod, the AI SDK or the MCP SDK on main. The recorded Eventiva override sets aside the house AI-SDK-alongside-Effect rule. | 2026-10-31T22:47:42.062Z | recorded-owner-direction |
| [effect-ai-upgrade-proposals](#effect-ai-upgrade-proposals) | The same agent-stack decision proposes a later Effect upgrade, chat UI, provider selection and import enforcement; these follow-ups are not approved by the accepted Effect-AI-only boundary. | 2026-10-31T22:47:42.062Z | proposal |
| [posthog-preferred-platform](#posthog-preferred-platform) | PostHog is the preferred telemetry/analytics/flags/replay/error/AI platform through Eventiva-owned neutral contracts, not embedded domain dependencies. | 2026-10-31T22:49:39.693Z | recorded-owner-direction |
| [cluster-base-and-order](#cluster-base-and-order) | Retain Effect Cluster as the server sharding/load-distribution base, addressing platform gaps before dependent agent-run work. | 2026-10-31T22:55:45.695Z | recorded-owner-direction |
| [uk-residency-default](#uk-residency-default) | Hosted residency defaults to the UK with an initial EU alternative; self-hosted operators control location. Apply boundaries to databases, objects, backups, logs, replicas and derived data, not only primary storage. | 2026-11-11T09:11:53.700Z | recorded-owner-direction |
| [mixed-provider-uk-profile](#mixed-provider-uk-profile) | Use a mixed-provider UK deployment profile: dedicated London tenant Postgres plus verified UK-region adapters for services unavailable there. Maintain a per-tenant data-flow/residency manifest and block noncompliant placement. | 2026-11-11T09:16:29.468Z | recorded-owner-direction |
| [deployment-key-authority](#deployment-key-authority) | Deployment owners control root/key authority; cloud uses M-of-N custody and self-hosting has no hidden universal recovery key. Separate tenant/resource/record keys and provenance identities; applications receive scoped short-lived handles only. | 2026-11-11T09:21:58.635Z | recorded-owner-direction |
| [security-profile-semantics](#security-profile-semantics) | Baseline, Sensitive, Restricted and Vault profiles vary authority, key scope, audit, retention, recovery and processing, never cryptographic strength. Every resource/field declares a core profile; mandatory classifications cannot silently weaken. | 2026-11-11T09:23:11.047Z | recorded-owner-direction |
| [sealed-core-security-profiles](#sealed-core-security-profiles) | Only versioned core contracts define security-profile guarantees. Modules compose/request profiles, cannot redefine crypto or gain raw keys, and adapters fail closed when required capabilities are unavailable. | 2026-11-11T09:24:38.979Z | recorded-owner-direction |
| [case-scoped-support-recovery](#case-scoped-support-recovery) | Support has no standing plaintext access. Managed access is tenant-opt-in, case-scoped, ephemeral, independently authorized and audited, with automatic destruction/revocation; self-hosted recovery remains operator-controlled. | 2026-11-11T09:28:36.652Z | recorded-owner-direction |
| [legal-hold-separate-from-decryption](#legal-hold-separate-from-decryption) | A distinct deployment-governed legal-hold authority preserves in-scope ciphertext/evidence across stores, suspending destructive retention without granting plaintext access or recreating already erased data. | 2026-11-11T09:35:26.449Z | recorded-owner-direction |
| [four-decryption-gates](#four-decryption-gates) | Non-exportable keys require independent identity/delegation, resource/purpose, workload-attestation and key-broker evidence before protected unwrap/decrypt; stale/revoked/uncertain evidence or unavailable audit fails closed. | 2026-11-11T09:39:04.901Z | recorded-owner-direction |
| [assurance-levels](#assurance-levels) | Use A1 verified software, A2 hardware-bound, A3 protected keys, A4 confidential workloads and A5 quorum/continuous high assurance. Sensitive defaults to A2 and Restricted server decryption to A4; achieved assurance requires evidence. | 2026-11-11T09:47:42.252Z | recorded-owner-direction |
| [community-assurance-override](#community-assurance-override) | Self-hosted owners may explicitly accept scoped, expiring degraded hardware assurance with repeated warnings, step-up, signed risk acceptance and audit; defaults remain fail-closed and achieved assurance is never upgraded by the override. | 2026-11-11T09:53:27.521Z | recorded-owner-direction |
| [zero-trust-all-surfaces](#zero-trust-all-surfaces) | No role, device, network location or internal subnet is inherently trusted. Every surface uses the same identity/resource/purpose/tenant/assurance checks, default-deny access, short-lived identity and explicit egress. | 2026-11-11T09:55:17.667Z | recorded-owner-direction |
| [security-control-centre](#security-control-centre) | Provide core-governed private-access setup and a security control centre that verifies effective posture, evidence freshness, drift and remediation. Public sensitive traffic requires HTTPS and risk-appropriate authentication; recognizable outbound phrases are not authentication. | 2026-11-11T10:24:27.229Z | recorded-owner-direction |
| [sms-composite-authentication](#sms-composite-authentication) | SMS is never standalone authentication; default SMS use adds independent verified email and remains lower assurance than phishing-resistant methods. High-risk, Restricted, key/legal/support/export/permission actions cannot use SMS-plus-email to satisfy their floor. | 2026-11-11T10:28:15.357Z | recorded-owner-direction |
| [password-screening-and-response](#password-screening-and-response) | Use long nontruncated passwords, no arbitrary composition/periodic rotation, current memory-hard salted storage and privacy-preserving replaceable breached-password screening. Reset on credible compromise evidence, not ordinary failed attempts alone. | 2026-11-11T10:33:57.109Z | recorded-owner-direction |
| [independent-commercial-dimensions](#independent-commercial-dimensions) | Treat software entitlement, hosting resources and support as independent dimensions. Free signed entitlements are first-class; security, portability, accessibility and safe shutdown are not paywalled or destroyed on expiry. | 2026-11-11T15:15:32.208Z | recorded-owner-direction |
| [broad-community-baseline](#broad-community-baseline) | Community retains a broad functional core, not an intentionally crippled edition. Monetize transparent managed resources/services/support; feature paywalls are exceptional and never weaken security, portability or accessibility. | 2026-11-11T16:22:10.794Z | recorded-owner-direction |
| [resource-first-cloud-billing](#resource-first-cloud-billing) | Bill managed resources and explicit consumption rather than primarily active users, using transparent modest cost-plus infrastructure pricing and an immutable idempotent usage ledger reconciled to provider invoices. | 2026-11-11T16:24:12.929Z | recorded-owner-direction |
| [preexecution-cost-contract](#preexecution-cost-contract) | Expensive canonical actions expose typed estimates, payer, uncertainty and limits before execution. Related-job splitting cannot bypass budgets; bind approval/reservations to maximum spend and requote material changes. | 2026-11-11T16:25:34.329Z | recorded-owner-direction |
| [support-severity-and-targets](#support-severity-and-targets) | Separate S0-S6 impact severity, request type and community triage. Community is best-effort without SLA; Standard/Priority/Critical response structures are provisional, not automatically contractual. | 2026-11-11T16:28:55.360Z | recorded-owner-direction |
| [entitlement-grace-defaults](#entitlement-grace-defaults) | Unregistered self-hosted unprotected Community needs no account/key or license telemetry. Registered Community uses renewable12-month grants and90-day offline grace; evaluation defaults30days and paid technical grace30days with safe read/export/security preservation. | 2026-11-11T16:32:21.078Z | recorded-owner-direction |
| [sponsorship-separate-from-rights](#sponsorship-separate-from-rights) | Education/nonprofit/contributor self-hosting retains the broad Community rights; managed sponsorship is separate resource credit, not ownership of a project&apos;s data, entitlement or governance. | 2026-11-11T16:33:29.311Z | recorded-owner-direction |
| [external-module-distribution](#external-module-distribution) | Permit external/private module distribution with commission only on Eventiva-processed transactions. Every installation channel retains signed bundles, quarantine, scanning/provenance, capability review, isolation and revocation; price never buys security clearance. | 2026-11-11T16:50:19.935Z | recorded-owner-direction |
| [authoritative-notification-inbox](#authoritative-notification-inbox) | The encrypted in-app inbox is the communication source of truth; external channels carry delivery/escalation evidence, never falsely equating submission with delivery. Preserve canonical IDs, permissions, offline state, acknowledgement and audit across adapters. | 2026-11-11T16:52:48.984Z | recorded-owner-direction |
| [canonical-operational-taxonomies](#canonical-operational-taxonomies) | Use stable coded taxonomies with versioned domain/tenant profiles, separate status/priority/risk/disposition families and governed transitions. Accessible text/code/icon and immutable requested-versus-confirmed provenance survive wording changes. | 2026-11-11T18:57:27.217Z | recorded-owner-direction |
| [source-backed-operational-profiles](#source-backed-operational-profiles) | Model emergency/event terminology as versioned source-backed jurisdictional profiles over canonical concepts, not a universal hard-coded code set. Preserve authority, reuse rights, mappings, history and plain-language interoperability. | 2026-11-11T19:09:48.188Z | recorded-owner-direction |
| [terminology-layer-original](#terminology-layer-original) | Separate locale, domain vocabulary, operational communication profiles and organizational overrides with stable canonical identifiers and reconstructable source/profile versions. | 2026-11-11T19:14:01.424Z | recorded-owner-direction |
| [tenant-controlled-terminology](#tenant-controlled-terminology) | Tenant admins select operational/domain terminology consistently; users may vary language/accessibility only without changing operational meaning. Govern event/channel exceptions, preview changes and retain historical profile versions. | 2026-11-11T19:15:09.373Z | recorded-owner-direction |
| [competency-not-permission](#competency-not-permission) | Distinguish participation, knowledge, assessor-signed practical competency and scoped operational authorization. Signed credentials can drive live conditional group eligibility, but do not themselves grant unrestricted roles or sensitive access. | 2026-11-11T19:41:09.418Z | recorded-owner-direction |
| [external-qualification-evidence](#external-qualification-evidence) | Credential validity, evidence verification and issuer trust are separate. Uploaded documents or OCR/AI extraction alone never establish authenticity or unlock protected operational access; retain named verification provenance and challenge/correction paths. | 2026-11-11T19:44:42.582Z | recorded-owner-direction |
| [assessment-no-core-proctoring](#assessment-no-core-proctoring) | Keep invasive webcam/biometric/screen/AI cheating surveillance out of core assessment. High-risk eligibility relies on configured supervised competency, not guaranteed unaided quizzes; optional proctoring stays separately governed and off by default. | 2026-11-11T19:48:04.499Z | recorded-owner-direction |
| [training-version-impact](#training-version-impact) | Published training versions and their completion evidence are immutable. Eventiva packs classify editorial/minor/material/critical impact with targeted retraining; tenant-authored impact consequences remain optional unless tenant policy requires them. | 2026-11-11T19:51:43.742Z | recorded-owner-direction |
| [cluster-core-topology](#cluster-core-topology) | Use one cluster-capable authorized execution path in every edition: one local runner for Community and multiple independent processes for production. Topology is deployment configuration, not a second business engine. | 2026-11-15T10:42:18.481Z | recorded-owner-direction |
| [agent-native-acceptance-parity](#agent-native-acceptance-parity) | Shared actions/data/screen state and UI-agent-protocol parity are mandatory acceptance criteria. Learn pinned upstream behavior without adopting its business engine; source audits do not prove all surfaces deployed. | 2026-11-15T16:04:44.360Z | settled-requirement |
| [replaceable-foundation-providers](#replaceable-foundation-providers) | Foundation analytics, telemetry, flags, persistence, sync and other external services stay behind Eventiva-owned Effect contracts; OpenFeature and OpenTelemetry are neutral APIs with explicit provider capabilities. | 2026-11-11T00:30:20.562Z | recorded-owner-direction |
| [foundation-enrollment-clearance](#foundation-enrollment-clearance) | The owner historically unblocked the foundation after house enrollment, retained direct-main delivery and the temporary AI-gate exception, and waived the manual five-ref push limit. | 2026-11-13T13:43:58.704Z | recorded-owner-direction |
| [fresh-foundation-not-archive](#fresh-foundation-not-archive) | Rebuild the production foundation from current specifications; historical applications and private tests are reference evidence, not APIs or executable implementation baselines to preserve. | Unknown | recorded-owner-direction |
| [three-package-foundation-approval](#three-package-foundation-approval) | Separate portable action specifications in contracts, domain/resource composition in schema, and Effect orchestration in runtime; feature modules own handlers and composition roots select vendor implementations. | Unknown | recorded-owner-direction |
| [foundation-exact-dependency-approval](#foundation-exact-dependency-approval) | The foundation body reports approval of Node 24.22.3, pnpm 12.18.0, aligned Nx 24.0.5, TypeScript 6.0.3, Expo 56.0.24, React Native 0.85.3, React 19.2.3, Effect 3.22.4, Vitest 4.1.12 and @effect/vitest 0.30.1. | Unknown | recorded-owner-direction |
| [synchronized-toolchain-and-foundation-controls](#synchronized-toolchain-and-foundation-controls) | Use one synchronized Node 24 and exact pnpm toolchain across managers, setup and CI, with deterministic drift checks, real Effect/web-smoke tests and dependency-risk evidence. | Unknown | recorded-owner-direction |
| [effect-native-agent-framework-ownership](#effect-native-agent-framework-ownership) | Eventiva owns its Effect-native action/server/auth/data framework; map upstream Agent-Native capabilities individually for build, integration wrapping, later port or omission rather than running its backend or rewriting everything at once. | Unknown | recorded-owner-direction |
| [screen-awareness-and-action-registration](#screen-awareness-and-action-registration) | Agents must understand and invoke the user&apos;s visible interactions through registered actions and receive permission-filtered application/screen context, including module activation and disposal. | Unknown | recorded-owner-direction |
| [versioned-protocol-conformance-and-dual-acp](#versioned-protocol-conformance-and-dual-acp) | Inventory and test the pinned upstream connection/execution surface, with explicit Eventiva requirements for HTTP, MCP, webhooks and both inbound and outbound ACP. | Unknown | recorded-owner-direction |
| [powersync-yjs-selected-sync-and-revocation](#powersync-yjs-selected-sync-and-revocation) | Use self-hosted PowerSync Open Edition with Postgres bucket storage for records and Yjs row-carried updates for text/canvas; destroy documents, editors and presence immediately when bucket access is lost. | Unknown | recorded-owner-direction |
| [external-cross-platform-component-ownership](#external-cross-platform-component-ownership) | Rambo-UI is the separate cross-platform component library; Eventiva consumes and binds it rather than maintaining a duplicate library or porting an upstream DOM toolkit. | Unknown | recorded-owner-direction |
| [effect-cluster-multirunner-topology](#effect-cluster-multirunner-topology) | Use horizontally distributed Effect Cluster execution with explicit shard ownership, load distribution, graceful drain and runner-loss recovery; prioritize sharding rather than weakening it for agent convenience. | Unknown | recorded-owner-direction |
| [single-app-hybrid-desktop-and-complementary-updates](#single-app-hybrid-desktop-and-complementary-updates) | Deliver one role/module-aware application per platform on shared React Native/Expo UI, with hybrid desktop shells and narrow native bridges; OTA and runtime federation are complementary update mechanisms. | Unknown | recorded-owner-direction |
| [open-declarative-module-ecosystem](#open-declarative-module-ecosystem) | Keep private/community modules open to direct tenant installation without official catalogue approval; ordinary immediate activation uses a versioned cross-platform declarative schema over already installed capabilities. | Unknown | recorded-owner-direction |
| [module-localization-terminology-and-package-envelope](#module-localization-terminology-and-package-envelope) | Every module carries validated localization, offline locale bundles and canonical terminology contracts alongside its actions, permissions, data, screens, flags, telemetry and lifecycle declarations. | Unknown | settled-requirement |
| [vendor-neutral-observability-and-local-bootstrap-sinks](#vendor-neutral-observability-and-local-bootstrap-sinks) | Remove core Sentry coupling, use central vendor-neutral Effect/OpenTelemetry instrumentation with PostHog as default product adapter, and provide safe bootstrap logging plus multiline console, bounded date-rotated file and test sinks. | Unknown | recorded-owner-direction |
| [modular-kernel-explicit-providers-and-safe-lifecycle](#modular-kernel-explicit-providers-and-safe-lifecycle) | Use a minimal composable kernel with explicit named provider bindings, scoped lifecycle, immutable workflow pins and safe compatible hot replacement or restart refusal; never guess a provider or repin active work. | Unknown | recorded-owner-direction |
| [central-resources-and-privileged-evolution](#central-resources-and-privileged-evolution) | Feature modules use one typed database-neutral Resources API; privileged adapters alone own migrations, tenant/client binding and immutable resource/schema history, with no direct or transitive feature SQL access. | Unknown | recorded-owner-direction |
| [committed-observation-only-governed-hooks](#committed-observation-only-governed-hooks) | Hooks observe committed facts and may request separately authorized additive work; they never veto or rewrite source operations, bypass approval, control transactions or expose protected execution. | Unknown | recorded-owner-direction |
| [acyclic-exact-types-g15-gate](#acyclic-exact-types-g15-gate) | Reject direct and indirect static/runtime dependency cycles and type escapes, preserving exact Effect Schema input/output/error/environment contracts before shared integration. | Unknown | recorded-owner-direction |
| [verified-ready-historical-banner-reference](#verified-ready-historical-banner-reference) | The first reference extension preserves the exact historical startup word-art and copyright through the central structured logger only after verified platform readiness; it is a template, not an editor. | Unknown | recorded-owner-direction |
| [scoped-modular-review-before-main-hold](#scoped-modular-review-before-main-hold) | For the modular-platform increment, owner approval of the detailed brief and review gates precedes shared integration and main delivery; isolated authorized lanes do not authorize exports, settings, dependencies or production changes. | Unknown | recorded-owner-direction |
| [conjunctive-platform-acceptance-and-bounded-checkpoints](#conjunctive-platform-acceptance-and-bounded-checkpoints) | Full modular-platform acceptance requires the combined G01-G15 evidence ledger and owner review; isolated tests and bounded checkpoints clear only the exact scenarios they demonstrate. | Unknown | settled-requirement |
| [marketplace-saga-and-indivisible-package-requote](#marketplace-saga-and-indivisible-package-requote) | Coordinate mixed-supplier awards as a recoverable saga, not one global ACID transaction; selecting part of an indivisible supplier package requires a supplier-confirmed re-quote. | Unknown | settled-requirement |
| [architecture-record-source-precedence-and-reconciliation](#architecture-record-source-precedence-and-reconciliation) | Architecture diagrams record decisions rather than make them: preserve linked owner provenance, proposal markings and the current repository replacement/index for the unavailable historical infrastructure document. | Unknown | settled-requirement |
| [single-location-collector-contract](#single-location-collector-contract) | Reuse one operations-owned device-location collector and consent path for active units and opted-in crew on current live-event shifts; maps render role-filtered unit and crew layers from that stream rather than collecting again. | Unknown | settled-requirement |
| [purchasing-accounting-ownership-contract](#purchasing-accounting-ownership-contract) | Inventory owns purchase requests, purchase orders and receiving; accounting owns supplier bills and postings. Emit goods-received evidence per receipt and keep period valuation export a separate contract. | Unknown | settled-requirement |
| [sales-accounting-event-boundary](#sales-accounting-event-boundary) | Sales emits order-paid, refund-completed, payment-fee, payout-settled and register-session-closed evidence; accounting owns journal postings, invoices and tax codes and reports invoice settlement back to sales. | Unknown | settled-requirement |
| [commercial-record-ownership-contract](#commercial-record-ownership-contract) | Keep CRM enquiries and opportunities in contacts, quotes and hire pricing in sales, equipment availability and reservations in inventory, and invoices in accounting; compose these owners for accepted hire quotes rather than duplicate records. | Unknown | settled-requirement |
| [one-cross-product-rules-engine](#one-cross-product-rules-engine) | Add the approved task rule builder on one domain-neutral rules engine and extend that same engine across Studio and other feature sets, rather than create a second Studio automation engine or authorization model. | Unknown | recorded-owner-direction |
| [independent-ticket-seat-editor-scope](#independent-ticket-seat-editor-scope) | Build reserved-seating editing in ticketing now rather than wait for site maps; a site map may later serve as a read-only backdrop without owning seat inventory. | Unknown | recorded-owner-direction |
| [seat-map-shared-rendering-direction](#seat-map-shared-rendering-direction) | Reuse the selected MapLibre-backed map-engine port and metric site-local frame for seating rather than add an independent rendering library; prove the rendering approach through the named spike. | Unknown | recorded-owner-direction |
| [directory-quote-commission-at-source](#directory-quote-commission-at-source) | Support paying accepted directory quotes through the shared sales payment path and deduct platform commission at capture, rather than build a separate directory payment integration. | Unknown | recorded-owner-direction |
| [quote-payments-noncustodial-contract](#quote-payments-noncustodial-contract) | Route quote payments to the vendor&apos;s connected merchant account, take commission as the platform fee and keep customer funds outside an Eventiva-held balance; accounting in the operator tenant issues commission invoices. | Unknown | settled-requirement |
| [unclaimed-seeded-directory-scope](#unclaimed-seeded-directory-scope) | Allow platform staff and organisers to seed unclaimed business listings that the businesses can claim later, rather than restrict the directory to self-published claimed listings. | Unknown | recorded-owner-direction |
| [maps-cover-buildings-and-custom-venues](#maps-cover-buildings-and-custom-venues) | Site planning must cover arenas, buildings, custom structures and festivals, not merely outdoor street-map overlays. | Unknown | recorded-owner-direction |
| [performance-reviews-in-hr-scope](#performance-reviews-in-hr-scope) | Include worker performance reviews in the HR feature set rather than omit that capability from HR scope. | Unknown | recorded-owner-direction |
| [bridge-and-direct-dmx-product-scope](#bridge-and-direct-dmx-product-scope) | Include both external-console cue triggers and direct simple DMX output for small rigs in show-control product scope, preserving a composable bridge transport service. | Unknown | recorded-owner-direction |
| [exact-versus-functional-requirement-policy-proposal](#exact-versus-functional-requirement-policy-proposal) | Model each versioned equipment line as either an exact model/variant mandate or an outcome-based requirement that permits verified equivalents; explicit line constraints take precedence over tenant or category defaults. | Unknown | proposal |
| [supplier-alternative-adoption-policy-proposal](#supplier-alternative-adoption-policy-proposal) | Keep supplier alternatives linked to the requirement version as proposals. An alternate to an exact mandate remains non-compliant without an authorized waiver; only explicit adoption creates a new event-plan version and propagates impact, never quote comparison alone. | Unknown | proposal |
| [emergency-operations-deliberate-human-initiation](#emergency-operations-deliberate-human-initiation) | Operational alarms and incidents may generate alerts, analysis and proposed responses, but Eventiva must not actuate consequential show, audio, lighting, PA or dispatch responses without a deliberate authorized human initiation. Agents, tenant rules and integrations cannot auto-approve that boundary. | Unknown | recorded-owner-direction |
| [ordinary-armed-show-automation-boundary](#ordinary-armed-show-automation-boundary) | Keep deliberately programmed, human-armed ordinary show cues and authorized external operator cue inputs available; a show-control protocol carrying an alarm remains an alert and cannot acquire emergency-actuation authority. | Unknown | recorded-owner-direction |
| [independent-certified-safety-system-autonomy](#independent-certified-safety-system-autonomy) | Do not inhibit independent certified fire, evacuation, emergency-lighting or physical intervention functions, or require Eventiva confirmation that delays them. Direct control of certified safety hardware requires separate engineering and approval. | Unknown | recorded-owner-direction |
| [bidirectional-single-show-control-path](#bidirectional-single-show-control-path) | Support mapped authorized local console/hardware inputs and permitted MDT show-operation requests through one canonical show-control action path, with source-scoped trust and explicit accepted, sent and observed outcomes. | Unknown | recorded-owner-direction |
| [production-cue-media-lifecycle-goal](#production-cue-media-lifecycle-goal) | Extend product planning beyond external console triggering to a full production lifecycle and rich local cue/media capability while retaining the existing bridge transport scope. | 2026-11-15T19:20:57.628Z | recorded-owner-direction |
| [native-local-playback-separate-module](#native-local-playback-separate-module) | Include native local playback and the full requested cue-type range in a deterministic media executor separate from MDT/CAD. Preserve bridge transport behavior and one cue-fire/authorization path, with inbound signal mapping included in proof. | 2026-11-15T19:31:03.330Z | recorded-owner-direction |
| [repeatable-show-configuration-scope](#repeatable-show-configuration-scope) | Make repeatable show setup a core capability using versioned reusable cue groups, lists, carts and venue/output profiles, with new date/venue instances, relative timings, media manifests and explicit safe overrides. | 2026-11-15T19:31:05.466Z | recorded-owner-direction |
| [show-template-instance-isolation](#show-template-instance-isolation) | Freeze published and armed cue snapshots against shared-template edits; adopting template changes must be explicit and reviewable. Never clone live runs, sign-offs, prior execution/audit receipts or active credentials. | 2026-11-15T19:31:05.466Z | recorded-owner-direction |
| [guided-sop-shared-workflow-boundary](#guided-sop-shared-workflow-boundary) | Keep guided procedures advisory by default with configurable mandatory steps, evidence and authorized sign-off. Rules may suggest or start authorized procedures, but procedure state, branching and human approvals reuse shared durable workflows rather than a separate SOP rules engine. | 2026-11-15T19:05:47.536Z | recorded-owner-direction |
| [payroll-1](#payroll-1) | Propose Eventiva calculating gross pay with a recognized payroll provider calculating net pay and filing tax through PayrollProvider. | Unknown | proposal |
| [payroll-2](#payroll-2) | Propose UK-first payroll with currency/jurisdiction fields ready for expansion. | Unknown | proposal |
| [payroll-3](#payroll-3) | Propose generated self-billed freelancer invoices rather than upload-only invoices. | Unknown | proposal |
| [payroll-4](#payroll-4) | Propose organisation-configurable two-person payroll approval, disabled by default. | Unknown | proposal |
| [payroll-5](#payroll-5) | Propose organisation opt-in location capture only at clock-in/out, with no continuous tracking. | Unknown | proposal |
| [tasks-1](#tasks-1) | Task completion wins concurrent offline status conflicts until explicit reopen. | Unknown | recorded-owner-direction |
| [tasks-2](#tasks-2) | Start with finish-to-start task dependencies with lag, not all dependency types. | Unknown | recorded-owner-direction |
| [tasks-3](#tasks-3) | Use five fixed task status categories with tenant-renameable labels; custom workflows belong to F14. | Unknown | recorded-owner-direction |
| [tasks-4](#tasks-4) | Embed collaborative Yjs task-description rich text in the task record. | Unknown | recorded-owner-direction |
| [tasks-5](#tasks-5) | Allow task guests restricted to their own assignments. | Unknown | recorded-owner-direction |
| [tasks-6](#tasks-6) | Allow undoable agent task edits for the requester; confirm assigning others, bulk above 10 or templates above 25; agents never sign off. | Unknown | recorded-owner-direction |
| [tasks-7](#tasks-7) | Build the F3 rule builder on one domain-agnostic engine extended by F14, not separate engines. | Unknown | recorded-owner-direction |
| [inventory-1](#inventory-1) | Derive inventory levels from append-only movements rather than mutable quantities. | Unknown | recorded-owner-direction |
| [inventory-2](#inventory-2) | F9 owns rental quotes/prices, F11 invoices and F6 availability/reservations. | Unknown | recorded-owner-direction |
| [inventory-3](#inventory-3) | Start with camera barcode/QR and keyboard-mode scanners, deferring RFID. | Unknown | recorded-owner-direction |
| [inventory-4](#inventory-4) | Accept disconnected duplicate serialized checkout and raise discrepancy on sync, retaining both movements. | Unknown | recorded-owner-direction |
| [inventory-5](#inventory-5) | F6 owns purchase requests/orders/receipts/reorder points; F11 owns supplier bills. | Unknown | recorded-owner-direction |
| [inventory-6](#inventory-6) | Use serialized asset cost and straight-line depreciation, with average cost for bulk/consumables, exported to accounting. | Unknown | recorded-owner-direction |
| [crm-proposal-1](#crm-proposal-1) | Propose separate CRM Person and login User records with optional linking. | Unknown | proposal |
| [crm-proposal-2](#crm-proposal-2) | Propose F4 ownership of enquiries/opportunities that convert to F1 Events. | Unknown | proposal |
| [crm-proposal-3](#crm-proposal-3) | Propose mailbox/calendar ports and separately approved Google/Microsoft adapters, with forwarding/manual logging as the first fallback. | Unknown | proposal |
| [crm-proposal-4](#crm-proposal-4) | Propose no third-party enrichment, allowing approved public-site lookups on request. | Unknown | proposal |
| [crm-proposal-5](#crm-proposal-5) | Propose duplicate suggestions followed by confirmed merge and reversible unmerge, not automatic email-match merges. | Unknown | proposal |
| [directory-d5-1](#directory-d5-1) | Allow tenant-owned directory listings plus seeded unclaimed listings owners can claim later. | Unknown | recorded-owner-direction |
| [directory-d5-2](#directory-d5-2) | Keep listings/enquiries free and charge commission on accepted marketplace quotes. | Unknown | recorded-owner-direction |
| [directory-d5-3](#directory-d5-3) | Allow verified marketplace reviews only. | Unknown | recorded-owner-direction |
| [directory-d5-4](#directory-d5-4) | Use PostGIS on Neon for geo search; Jonathan explicitly approved this dependency for F5.4. | Unknown | recorded-owner-direction |
| [directory-d5-5](#directory-d5-5) | Publish a public indexable directory subdomain. | Unknown | recorded-owner-direction |
| [directory-d5-6](#directory-d5-6) | Deduct commission at source through F9 connected-account splits; suppliers remain merchant of record and Eventiva holds no client money. | Unknown | recorded-owner-direction |
| [roster-1](#roster-1) | F2 owns time capture and approved timesheets; F12 consumes approved results. | Unknown | recorded-owner-direction |
| [roster-2](#roster-2) | F13 owns qualifications; F2 reads them for matching. | Unknown | recorded-owner-direction |
| [roster-3](#roster-3) | Use a pure deterministic TypeScript roster constraint solver with sharded execution for large events and agent explanations. | Unknown | recorded-owner-direction |
| [roster-4](#roster-4) | Use UK Working Time Regulations rule data first, EU next. | Unknown | recorded-owner-direction |
| [roster-5](#roster-5) | Offer same-app invite-based guest access plus signed single-use offer/availability response links. | Unknown | recorded-owner-direction |
| [roster-6](#roster-6) | Initial personal calendars use read-only ICS; defer two-way Google/Microsoft sync. | Unknown | recorded-owner-direction |
| [accounting-own-ledger](#accounting-own-ledger) | Build Eventiva&apos;s own Postgres/Drizzle double-entry ledger behind LedgerPort instead of Blnk, preserving online-target balance/transaction/reference compatibility. | Unknown | recorded-owner-direction |
| [accounting-proposal-2](#accounting-proposal-2) | Propose UK VAT with MTD submission as the first tax jurisdiction. | Unknown | proposal |
| [accounting-proposal-3](#accounting-proposal-3) | Propose bank statement file import first and flagged open-banking feeds later. | Unknown | proposal |
| [accounting-proposal-4](#accounting-proposal-4) | Propose receipt/bill extraction by the Eventiva agent using the selected model engine, not a separate OCR vendor. | Unknown | proposal |
| [fleet-proposal-1](#fleet-proposal-1) | Propose keeping fleet/MDT live operations inside F7 with two feature flags. | Unknown | proposal |
| [fleet-proposal-2](#fleet-proposal-2) | Propose acknowledged priority text messaging first, radio/push-to-talk later. | Unknown | proposal |
| [fleet-proposal-3](#fleet-proposal-3) | Propose active-unit phone location first with a telematics port but no initial adapter. | Unknown | proposal |
| [fleet-proposal-4](#fleet-proposal-4) | Propose no controller dispatch assignment while offline; crew status may queue. | Unknown | proposal |
| [fleet-proposal-5](#fleet-proposal-5) | Propose F13 ownership of driver licences as qualifications read by F7. | Unknown | proposal |
| [fleet-proposal-6](#fleet-proposal-6) | Propose deferring drivers-hours/tachographs instead of shipping incomplete compliance. | Unknown | proposal |
| [show-direct-dmx](#show-direct-dmx) | Include OSC/MIDI/MSC/timecode triggers plus simple direct DMX over sACN/Art-Net for small rigs. | Unknown | recorded-owner-direction |
| [show-proposal-2](#show-proposal-2) | Propose Event as anchor with optional EventSeries rather than a mandatory Project. | Unknown | proposal |
| [show-proposal-3](#show-proposal-3) | Propose fixed and predecessor-relative run-of-show timing with live drift. | Unknown | proposal |
| [show-proposal-4](#show-proposal-4) | Propose GDTF fixture data and MVR scene exchange. | Unknown | proposal |
| [show-proposal-5](#show-proposal-5) | Propose indicative rigging loads with human competent-person sign-off invalidated by changes. | Unknown | proposal |
| [show-proposal-6](#show-proposal-6) | Propose a paired headless Effect show bridge owning hardware/network IO independently of UI. | Unknown | proposal |
| [ticketing-1](#ticketing-1) | F8 owns ticket types, capacity, holds, tickets and admission; F9 owns checkout/orders/payments/refunds. | Unknown | recorded-owner-direction |
| [ticketing-2](#ticketing-2) | Use signed tickets, synced validity snapshots and an append-only offline scan ledger. | Unknown | recorded-owner-direction |
| [ticketing-3](#ticketing-3) | Build an F8 seat-map editor now, optionally using an F10 backdrop without waiting for F10. | Unknown | recorded-owner-direction |
| [ticketing-4](#ticketing-4) | Provide organiser-controlled transfers and face-value resale through the waiting list. | Unknown | recorded-owner-direction |
| [ticketing-5](#ticketing-5) | Deliver in-app/email QR and PDF first; wallet passes come in a later slice. | Unknown | recorded-owner-direction |
| [hr-1](#hr-1) | Give employees, freelancers, volunteers and agency crew a Worker record. | Unknown | recorded-owner-direction |
| [hr-2](#hr-2) | Worker extends the F4 Person per tenant rather than creating another human identity. | Unknown | recorded-owner-direction |
| [hr-3](#hr-3) | Hard-block qualification failures on rosters, with approved audited overrides only. | Unknown | recorded-owner-direction |
| [hr-4](#hr-4) | Start with built-in simple e-signature and an evidence record behind ESignature. | Unknown | recorded-owner-direction |
| [hr-5](#hr-5) | Start manual right-to-work records/document checks/reminders; defer provider integration. | Unknown | recorded-owner-direction |
| [hr-6](#hr-6) | Use UK statutory leave rules first with configurable policies for other jurisdictions. | Unknown | recorded-owner-direction |
| [hr-7](#hr-7) | Add performance reviews, goals and feedback as an F13 slice. | Unknown | recorded-owner-direction |
| [sales-1](#sales-1) | F9 owns cart/checkout/orders/payments/refunds/discounts/tax lines/receipts; other domains register line providers. | Unknown | recorded-owner-direction |
| [sales-2](#sales-2) | Select Stripe behind PaymentGateway/CardTerminal with connected accounts so each tenant is merchant of record receiving direct payouts. | Unknown | recorded-owner-direction |
| [sales-3](#sales-3) | Permit supported-reader offline card sales only behind a flag with merchant risk notice and per-device daily/per-order limits defaulting to zero; cash works offline. | Unknown | recorded-owner-direction |
| [sales-4](#sales-4) | F11 owns tax codes/rates; F9 maps categories and calculates inclusive UK/EU VAT through built-in TaxCalculator. | Unknown | recorded-owner-direction |
| [sales-5](#sales-5) | Specify connected-account vendor split payments now and build them after F9.3. | Unknown | recorded-owner-direction |
| [sales-6](#sales-6) | Ticket capacity uses preallocated device quotas; stock uses deltas and flags oversell. | Unknown | recorded-owner-direction |
| [sales-7](#sales-7) | Keep closed-loop cashless wristbands outside F9 for a possible later feature set. | Unknown | recorded-owner-direction |
| [maps-maplibre-open-tiles](#maps-maplibre-open-tiles) | Use MapLibre device/web renderers with self-hosted OpenStreetMap vector tiles and an imagery-vendor port, shared with F8 seating. | Unknown | recorded-owner-direction |
| [maps-imagery-online-only](#maps-imagery-online-only) | Keep satellite imagery online only; offline packs use open basemap plus tenant-owned plans/drone orthophotos, without paid self-hosted imagery licensing. | Unknown | recorded-owner-direction |
| [maps-proposal-2](#maps-proposal-2) | Propose per-layer Yjs documents so sync authorization can hide entire layers. | Unknown | proposal |
| [maps-proposal-4](#maps-proposal-4) | Propose F7 as the single unit/crew location collector, with F10 consuming live layers. | Unknown | proposal |
| [maps-proposal-5](#maps-proposal-5) | Propose image/GeoTIFF/PDF/DXF reference imports, asking for DXF/PDF exports instead of direct DWG reading. | Unknown | proposal |
| [studio-sites-1](#studio-sites-1) | Build Studio core before Sites so sites reuse fields/customization definitions. | Unknown | recorded-owner-direction |
| [studio-sites-2](#studio-sites-2) | Render shared Rambo-UI site blocks server-side through react-native-web with no-JS output checks and Lighthouse gates. | Unknown | recorded-owner-direction |
| [studio-sites-3](#studio-sites-3) | Store custom fields in a per-extensible-table JSONB column, JSON text on SQLite, with expression indexes for indexed fields. | Unknown | recorded-owner-direction |
| [studio-sites-4](#studio-sites-4) | Use Vercel behind SiteHosting and DomainProvisioning. | Unknown | recorded-owner-direction |
| [studio-sites-5](#studio-sites-5) | Keep F14 customization declarative; consider sandboxed user code in a later spike. | Unknown | recorded-owner-direction |
| [studio-sites-6](#studio-sites-6) | Build canvas/layers/inspector in Rambo-UI for native/web; use Puck as a data-model reference, not a dependency. | Unknown | recorded-owner-direction |
| [catalogue-evidence-intake](#catalogue-evidence-intake) | Keep shared manufacturer/model specification evidence separate from tenant Products/Assets/Kits/stock; supplier intake retains provenance, verification status and historical versions. | Unknown | settled-requirement |
| [supplier-inventory-disclosure](#supplier-inventory-disclosure) | Separate detailed private inventory capture from supplier-controlled buyer disclosure: permitted detailed fields, dates only or hidden, with category/product overrides. | Unknown | settled-requirement |
| [supplier-old-matching-opt-in](#supplier-old-matching-opt-in) | Earlier D5-15/D6-8 assumed a separate positive opt-in for inventory-backed cross-tenant matching, especially hidden inventory. | Unknown | settled-requirement |
| [supplier-default-on-private-matching](#supplier-default-on-private-matching) | Enable eligible internal inventory-backed supplier matching by default with clear notice and explicit supplier opt-out, independently of public stock visibility. | Unknown | settled-requirement |
| [supplier-technical-availability-separation](#supplier-technical-availability-separation) | Use structured technical evidence and contextual criteria for supplier fit; keep suitability, stock/kit quantities, date availability and confirmed commitment separate. | Unknown | settled-requirement |
| [quotes-mixed-awards](#quotes-mixed-awards) | Support whole-quote or mixed-supplier awards with separately confirmed supplier contracts, commitments and payment schedules. | Unknown | settled-requirement |
| [quotes-progressive-comparison](#quotes-progressive-comparison) | Show stage/area summaries first, then categories, requirements, supplier lines and evidence without losing context. | Unknown | settled-requirement |
| [quotes-round-redlines](#quotes-round-redlines) | Retain immutable supplier quote rounds, stable requirement/line continuity and selectable historical comparison baselines. | Unknown | settled-requirement |
| [quotes-neutral-change-review](#quotes-neutral-change-review) | Mark both price increases and decreases neutrally as changed; allow one-action review/dismiss without erasing immutable differences. | Unknown | settled-requirement |
| [quotes-internal-plan-propagation](#quotes-internal-plan-propagation) | Automatically propagate F1 requirement revisions into internal comparison/equivalence/coverage/forecast impact views without rewriting supplier quotes or executed commitments. | Unknown | settled-requirement |
| [quotes-manual-supplier-release](#quotes-manual-supplier-release) | Require deliberate authorized release of selected version-locked supplier change sets; exploratory plans may stay unsent indefinitely. | Unknown | settled-requirement |
| [quotes-selected-supplier-batches](#quotes-selected-supplier-batches) | Allow one or several explicitly selected suppliers with independent recipient authority, version lock and auditable request/send/retry status. | Unknown | settled-requirement |
| [quotes-flexible-view-provenance](#quotes-flexible-view-provenance) | Split/combine/group supplier proposals for presentation while preserving immutable quotes, separate legal contracts, bundle lineage and original prices. | Unknown | settled-requirement |
| [quotes-exact-functional-requirements](#quotes-exact-functional-requirements) | Choose exact-model or functional-criteria policy per F1 requirement; deviations from exact require an authorized waiver and equivalence is contextual, not global identity. | Unknown | settled-requirement |
| [quotes-old-severity-treatment](#quotes-old-severity-treatment) | Earlier comparison wording emphasized price-regression warnings when quotation values changed. | Unknown | settled-requirement |
| [emergency-human-initiation](#emergency-human-initiation) | Never automatically execute consequential operational incident/alarm/emergency responses in Eventiva; an authorized accountable human assesses and deliberately initiates the selected response. | Unknown | recorded-owner-direction |
| [independent-certified-safety-boundary](#independent-certified-safety-boundary) | Do not inhibit independent certified alarms, evacuation/voice systems, emergency lighting, lawful fire-panel interlocks or physical overrides by requiring Eventiva confirmation. | Unknown | recorded-owner-direction |
| [incident-approved-preset-bridge](#incident-approved-preset-bridge) | Offer authorized incident-linked invocation of a selected version-pinned preapproved show preset through the separate F1 bridge/local engine, not F7 playback. | Unknown | settled-requirement |
| [shared-event-operational-graph](#shared-event-operational-graph) | Event planning and MDT/live operations share canonical event/phase/resource/action records under profile-specific views, not separate product data models. | Unknown | settled-requirement |
| [operations-planned-and-unscheduled](#operations-planned-and-unscheduled) | Initial CAD/MDT supports crew incidents and preplanned assigned production jobs with upcoming/active/history views and per-venue tour-template instances. | 2026-11-13T20:12:52.978Z | recorded-owner-direction |
| [operations-routine-release](#operations-routine-release) | Routine scheduled production defaults to automatic release with configurable controller release; activation always requires start eligibility, completed predecessors and valid sign-offs. | 2026-11-13T20:16:00.222Z | recorded-owner-direction |
| [tasks-continuous-forecast](#tasks-continuous-forecast) | Continuously recalculate dependency-linked forecasts as predecessors run late while retaining immutable baseline, subsequent revisions, actuals and uncertainty. | 2026-11-13T20:23:20.022Z | recorded-owner-direction |
| [tasks-anchor-confirmation](#tasks-anchor-confirmation) | EVE-84 covers general Event planning, not MDT only. Confirm every Event/Phase anchor-date change, including dependency-delay cascades; non-anchor dates may cascade automatically. | Unknown | recorded-owner-direction |
| [tasks-delay-tolerance](#tasks-delay-tolerance) | Default automated rescheduling tolerance to 10 minutes, editable as any numeric minute value from 5 through 60 inclusive. | 2026-11-13T20:25:23.091Z | recorded-owner-direction |
| [operations-queue-first](#operations-queue-first) | Prioritize incident/job queue, unit/status board, assignments, acknowledgements and timestamped log in the initial MDT/live-operations product vertical; maps are optional/contextual. | 2026-11-13T20:10:47.350Z | recorded-owner-direction |
| [canonical-ids-time-decimals-reference](#canonical-ids-time-decimals-reference) | Follow the S4 canonical identifier, time and decimal conventions referenced by the owner-approved foundation policy. | 2026-11-15T01:45:09.727Z | recorded-owner-direction |
| [show-full-lifecycle-benchmark](#show-full-lifecycle-benchmark) | Target one event system across rig/construction, show calling/cues/tasks/emergencies and derig/postshow, with QLab-class cue capability as a major benchmark. | 2026-11-15T19:20:55.623Z | recorded-owner-direction |
| [show-local-execution-proposal](#show-local-execution-proposal) | Propose a deterministic local show-execution boundary for expanded cue graphs and native playback capability. | 2026-11-15T19:20:55.623Z | proposal |
| [show-separate-native-playback](#show-separate-native-playback) | Provide native QLab-class local playback/show control as a module separate from F7 MDT/CAD while sharing event lifecycle and canonical actions/records. | 2026-11-15T19:31:07.614Z | recorded-owner-direction |
| [cross-tenant-lawful-retention](#cross-tenant-lawful-retention) | Revocation immediately stops new exchange and ordinary access while legally required contractual/payment/audit evidence stays purpose-limited and audited. | 2026-11-15T00:46:36.066Z | recorded-owner-direction |
| [platform-household-display-proposal](#platform-household-display-proposal) | Add household alert display and device setup documentation. | Unknown | proposal |
| [platform-verified-tickets-proposal](#platform-verified-tickets-proposal) | Provide per-event verified investor and press ticket issuance without checkout. | Unknown | proposal |
| [platform-neutral-telemetry-spec](#platform-neutral-telemetry-spec) | Remove legacy core telemetry vendor coupling and compose configurable vendor-neutral telemetry with an opt-out path. | Unknown | settled-requirement |
| [platform-boundary-documentation-spec](#platform-boundary-documentation-spec) | Keep colon-separated module tags and boundary documentation consistent with enforced rules, repairing house guidance at its source. | Unknown | settled-requirement |
| [platform-notification-messaging-spec](#platform-notification-messaging-spec) | Use shared authorized actions for notifications, transactional email and linked-user messaging, with neutral channel services and verified inbound requests. | Unknown | settled-requirement |
| [platform-private-files-spec](#platform-private-files-spec) | Provide permission-checked private files, offline uploads, document import and versioned run-linked artifacts through neutral storage ports. | Unknown | settled-requirement |
| [platform-authorized-search-spec](#platform-authorized-search-spec) | Search registered resource projections with permission filtering inside the query, including counts; support offline keyword search and online semantic search without payer fallback. | Unknown | settled-requirement |
| [platform-review-suggestions-spec](#platform-review-suggestions-spec) | Treat suggestions as pending original actions executed under the authorized accepter, retaining proposer attribution and stable comment anchors. | Unknown | settled-requirement |
| [platform-modular-localization-spec](#platform-modular-localization-spec) | Localize human and agent presentation with module-owned message bundles while preserving canonical concepts and offline availability. | Unknown | settled-requirement |
| [platform-terminology-original-direction](#platform-terminology-original-direction) | Separate locale, domain vocabulary, operational phraseology and organization overlays; preserve canonical IDs, lawful provenance and historical profile versions. | 2026-11-11T19:14:01.565Z | recorded-owner-direction |
| [platform-tenant-admin-terminology](#platform-tenant-admin-terminology) | Tenant administrators select operational/domain terminology consistently; users may choose safe locale and accessibility presentation, not independent operational meanings. | 2026-11-11T19:15:09.373Z | recorded-owner-direction |
| [platform-agent-evaluations-spec](#platform-agent-evaluations-spec) | Maintain repeatable action-based agent evaluations from redacted traces and authored cases, with CI checks that detect deliberately worse prompts. | Unknown | settled-requirement |
| [platform-dashboards-widgets-spec](#platform-dashboards-widgets-spec) | Use typed portable widgets and saved action queries that rerun under viewer permissions, with organization brand styling. | Unknown | settled-requirement |
| [platform-voice-spec](#platform-voice-spec) | Voice input produces the same confirmed authorized actions as touch, with event vocabulary, provider-neutral transcription and no default audio retention. | Unknown | settled-requirement |
| [platform-settings-navigation-spec](#platform-settings-navigation-spec) | Expose schema-driven scoped settings, profiles, onboarding and permission-filtered navigation equally to people and agents. | Unknown | settled-requirement |
| [platform-shared-scheduling-spec](#platform-shared-scheduling-spec) | Reuse generic scheduling for people, vehicles, equipment and rooms with conflict detection, DST-safe computation and visible offline conflicts. | Unknown | settled-requirement |
| [platform-workflow-resume-spec](#platform-workflow-resume-spec) | Model agent runs as durable workflows with independently idempotent model/tool activities, resuming completed-step evidence after runner loss. | Unknown | settled-requirement |
| [platform-session-responsiveness-spec](#platform-session-responsiveness-spec) | Keep long workflows separate from short session commands so cancel, status and approval messages remain responsive. | Unknown | settled-requirement |
| [platform-durable-output-stream-spec](#platform-durable-output-stream-spec) | Persist run output by stable offsets and resume client reads after runner loss without visible gaps or duplicate presentation. | Unknown | settled-requirement |
| [platform-entity-hosting-runner-spec](#platform-entity-hosting-runner-spec) | Avoid entity-empty shard-owning managers; runners that own shards must host the relevant entity types. | Unknown | settled-requirement |
| [platform-failover-tuning-proposal](#platform-failover-tuning-proposal) | Tune failover through typed cluster configuration, with a proposed ten-second lock expiry and measured reassignment budget. | Unknown | proposal |
| [platform-persisted-entity-actions-spec](#platform-persisted-entity-actions-spec) | Persist mutating entity actions and atomically store deduplication with the state change so retries cannot double-apply business effects. | Unknown | settled-requirement |
| [platform-action-inventory-spec](#platform-action-inventory-spec) | Keep portable action specifications separate from handlers and drive all surfaces through one current-identity authorized runtime with scoped atomic registration and parity checks. | Unknown | settled-requirement |
| [platform-a1-original-proposal](#platform-a1-original-proposal) | Originally proposed atomically committing authoritative mutation, deduplication, history, outbox and receipt with live replay checks. | 2026-11-14T22:01:56.117Z | proposal |
| [platform-s1-original-proposal](#platform-s1-original-proposal) | Originally proposed authenticated tenant database/branch routing with narrowly shared control metadata. | 2026-11-14T22:01:56.621Z | proposal |
| [platform-broad-sql-dependency-proposal](#platform-broad-sql-dependency-proposal) | A broad initial dependency request included SQL, Drizzle tooling, native build permissions and an unselected database image. | 2026-11-15T01:16:21.474Z | proposal |
| [platform-sql-only-recommendation](#platform-sql-only-recommendation) | Research recommends an SQL-only first increment, deferring risky Drizzle tooling and rejecting unnecessary native build permissions. | 2026-11-15T01:54:26.340Z | proposal |
| [platform-exact-sql-only-approval](#platform-exact-sql-only-approval) | Approve only the exact SQL/PostgreSQL first increment, with no native build allowances and no Drizzle, sync/device, extra runtime or paid-provider dependencies. | 2026-11-15T03:44:18.071Z | recorded-owner-direction |
| [platform-synthetic-development-target](#platform-synthetic-development-target) | Use only the bounded synthetic London PostgreSQL development target, with quotas, secure credentials and logical replication disabled. | 2026-11-15T03:58:42.562Z | recorded-owner-direction |
| [platform-legacy-test-target-retirement](#platform-legacy-test-target-retirement) | Retire only the explicitly authorized empty legacy database project and use the preserved synthetic development target instead. | 2026-11-15T04:01:10.506Z | recorded-owner-direction |
| [platform-cluster-core-direction](#platform-cluster-core-direction) | Cluster-backed sharding is mandatory core: Community defaults to one cluster-capable runner, Cloud/Production to multiple independent runners, sharing authorization and durable integrity paths. | 2026-11-15T10:44:12.886Z | recorded-owner-direction |
| [platform-development-credential-exception](#platform-development-credential-exception) | Allow the existing full-access credential for synthetic development without blocking on staged restricted-role credentials; production still requires least privilege and key-management proof. | 2026-11-15T11:22:52.419Z | recorded-owner-direction |
| [platform-observation-feed-spec](#platform-observation-feed-spec) | Use one after-commit durable event/outbox/change-feed engine with tenant cursors, fenced retries and subscription-specific deduplication; hooks cannot veto, mutate or rerun the original action. | Unknown | settled-requirement |
| [platform-runtime-incarnation-direction](#platform-runtime-incarnation-direction) | Each runtime restart creates a fresh persisted incarnation UUID linked to stable logical runtime identity; never reuse an unfenced session/incarnation. | Unknown | recorded-owner-direction |
| [platform-callback-ambiguity-direction](#platform-callback-ambiguity-direction) | Record callback-success/crash-before-confirmation as unresolved and reconcile through stable idempotency and authoritative status, never blind replay. | Unknown | recorded-owner-direction |
| [platform-committed-transition-provenance-direction](#platform-committed-transition-provenance-direction) | Lifecycle events mean committed transitions; invocation attempts/outcomes are separate observations and producer identity comes from authoritative tenant/purpose/profile/module/version/generation bindings. | Unknown | recorded-owner-direction |
| [platform-http-session-proof-spec](#platform-http-session-proof-spec) | Derive HTTP/OpenAPI/client interfaces from actions and require separately verified credential proof; a public session UUID never grants access. | Unknown | settled-requirement |
| [platform-agent-umbrella-spec](#platform-agent-umbrella-spec) | Agent implementation must share action permissions/approvals and pass a killed/resumed approved-write end-to-end scenario, not merely close component issues. | Unknown | settled-requirement |
| [platform-inbound-mcp-spec](#platform-inbound-mcp-spec) | Expose the authorized action inventory through MCP with permission-preserving identity, approvals, cancellation and change-feed resources. | Unknown | settled-requirement |
| [platform-inbound-acp-spec](#platform-inbound-acp-spec) | Expose Eventiva&apos;s agent over authenticated inbound ACP stdio with durable sessions, human permission requests and cancellable execution. | Unknown | settled-requirement |
| [platform-screen-awareness-spec](#platform-screen-awareness-spec) | Register every screen interaction against canonical actions and expose only viewer-authorized declared screen state, reusing the single declarative UI substrate. | Unknown | settled-requirement |
| [platform-collaboration-conflicts-spec](#platform-collaboration-conflicts-spec) | Use PowerSync records plus Yjs text/canvas with action-authorized guarded changes, explicit conflicts and immediate revoked-document teardown. | Unknown | settled-requirement |
| [platform-agent-turn-loop-spec](#platform-agent-turn-loop-spec) | Run turns through inventory-derived tools, approval pause/resume, redacted errors/context and progress events under the user&apos;s authority. | Unknown | settled-requirement |
| [platform-model-provider-launch-direction](#platform-model-provider-launch-direction) | Use sanctioned API-key/user-billed model flows with explicit payer identity, quota/audit and typed credential failure; never silently switch to platform-funded inference. | Unknown | recorded-owner-direction |
| [platform-agent-thread-spec](#platform-agent-thread-spec) | Use one tenant-scoped persisted conversation model across surfaces, with bounded model-context projections and synced offline reads. | Unknown | settled-requirement |
| [platform-outbound-harness-memory-spec](#platform-outbound-harness-memory-spec) | Support outbound ACP under the same permission policy, user/tenant-editable agent memory and exact redacted turn-context inspection. | Unknown | settled-requirement |
| [platform-native-otlp-spike-spec](#platform-native-otlp-spike-spec) | Measure native OTLP trace/metric export, loss and bundle cost in an isolated spike using a local receiver, without hosted ingestion authorization. | Unknown | settled-requirement |
| [platform-otlp-endpoint-proof-spec](#platform-otlp-endpoint-proof-spec) | Verify signal-specific OTLP endpoints/authentication and actual ingestion on a separately owner-authorized dedicated development project. | Unknown | settled-requirement |
| [platform-early-access-parity-spec](#platform-early-access-parity-spec) | Provide Early Access enrollment through a shared Flags service on web/native/server, with a permission-checked server-side feature listing and safe no-op behavior. | Unknown | settled-requirement |
| [platform-ios-sync-proof-spec](#platform-ios-sync-proof-spec) | Require target-specific iOS and Safari synchronization/revocation checks before claiming those platforms supported, without blocking initial portable collaboration work. | Unknown | settled-requirement |
| [platform-social-suite-proposal](#platform-social-suite-proposal) | Consider channel-specific social publishing, shared inbox conversations and posting-time analytics. | Unknown | proposal |
| [platform-paid-ai-gate-restoration-spec](#platform-paid-ai-gate-restoration-spec) | Restore paid AI review gates only after the owner separately approves budgets and restoration, preserving the temporary zero-spend exception until then. | Unknown | settled-requirement |
| [platform-investor-merge-proposal](#platform-investor-merge-proposal) | Consider integrating investor verification/profile/dashboard changes from the named test branch. | Unknown | proposal |
| [platform-marketplace-selection-direction](#platform-marketplace-selection-direction) | Select the controlled participant-scoped marketplace with revocable grants and durable idempotent saga/outbox workflows, preserving tenant ownership, public projection limits and supplier-owned noncustodial financial records. | 2026-11-16T18:51:51.499Z | recorded-owner-direction |
| [platform-marketplace-product-spec](#platform-marketplace-product-spec) | Preserve public allowlists, private two-party enquiry threads, requirement-level quote comparison and mixed awards with separate supplier contracts, commitments, invoices and reconciliation streams. | Unknown | settled-requirement |
| [platform-marketplace-open-policy-proposal](#platform-marketplace-open-policy-proposal) | Specify remaining marketplace freshness, failure recovery, invoice matching, moderation and jurisdiction policy without reopening the selected architecture. | Unknown | proposal |
| [platform-retention-interaction-original-proposal](#platform-retention-interaction-original-proposal) | Originally proposed preserving independently lawful contractual evidence after participant-grant revocation while erasing separable personal data and delaying final shredding. | 2026-11-15T00:36:30.920Z | proposal |
| [platform-trust-conformance-spec](#platform-trust-conformance-spec) | Implement already binding deployment-root/key hierarchy, four independent release gates, sealed profiles and assurance floors through neutral contracts and fail-closed conformance tests, not a fresh architecture redesign. | Unknown | settled-requirement |
| [platform-trust-concrete-parameters](#platform-trust-concrete-parameters) | Adopt standard concrete trust and marketplace parameters: Ed25519 over RFC 8785, SHA-256 payload digests, AES-256-GCM per-record DEKs under non-exportable KMS KEKs, 3-of-5 root custody and 90-day rotation, bounded request/evidence/revocation timing, step freshness with synchronous rechecks, class retention with legal hold, retry/compensation/manual recovery and contract-schedule invoice reconciliation. | Unknown | recorded-owner-direction |
| [platform-trust-composition-parameters](#platform-trust-composition-parameters) | Resolve concrete crypto/provider/verifier composition and remaining legal policy within the approved root-trust architecture. | Unknown | proposal |
| [platform-integration-acceptance-spec](#platform-integration-acceptance-spec) | Keep umbrella integration open until composition, boundaries, durable state/lifecycle/workflow, protected security, configuration, telemetry, real UI targets and aggregate gates have explicit reproducible evidence. | Unknown | settled-requirement |
| [platform-lowercase-archive-direction](#platform-lowercase-archive-direction) | Rename only the top-level archive directory to lowercase with a Git-visible case-safe move, preserving all historical bytes and the private-test gitlink. | Unknown | recorded-owner-direction |
| [verified-recovery-main-gate-release](#verified-recovery-main-gate-release) | The owner released separate review-before-main permission for verified safe Eventiva repository recovery/integration; ordinary engineering, tests and direct main delivery proceed autonomously under existing gates. | Unknown | recorded-owner-direction |
| [private-validated-reflection-ingress-exception](#private-validated-reflection-ingress-exception) | Permit private TypeScript PropertyDescriptor/reflection unknown ingress only when immediately and recursively validated; never export the unknown or widen public domain contracts. | Unknown | recorded-owner-direction |
| [rambo-adapter-scoped-deferral](#rambo-adapter-scoped-deferral) | Defer the real Rambo adapter until an approved releasable React Native package/API exists; do not block unrelated verified modular-platform delivery on that adapter. | Unknown | recorded-owner-direction |
| [read-only-archive-recovery-authorization](#read-only-archive-recovery-authorization) | Permit temporary restoration of archived Eventiva threads/orbs for read-only fresh filesystem audits and safe recovery of missing work; rearchive after the audit. | Unknown | recorded-owner-direction |
| [sql-test-image-bounded-risk-exception](#sql-test-image-bounded-risk-exception) | Historical 2026-11-15 exception for the exact PostgreSQL17.12 Bookworm digest solely in isolated disposable synthetic local/CI fixtures; its expiry/trigger terms are superseded by the separately cited 2026-11-18 standing acceptance in the authored decision checkpoint. | Unknown | recorded-owner-direction |
| [platform-action-projection-spike-spec](#platform-action-projection-spike-spec) | Prove one Effect action specification, handler, authorization and error model projected to HTTP, MCP and AI tools in a throwaway spike. | Unknown | settled-requirement |
| [platform-action-spike-sdk-proposal](#platform-action-spike-sdk-proposal) | Use a shared action-construction API and protocol/AI adapters to avoid independently maintained tool schemas. | 2026-10-31T21:58:41.581Z | proposal |
| [platform-no-zod-spike-direction](#platform-no-zod-spike-direction) | Avoid Zod in the action-projection spike while preserving a single Effect Schema source. | 2026-10-31T22:37:43.234Z | recorded-owner-direction |
| [platform-capability-matrix-spec](#platform-capability-matrix-spec) | Maintain a pinned exhaustive Build/Wrap/Later/Not-needed capability map and file-backed protocol conformance assessment. | Unknown | settled-requirement |
| [platform-capability-order-proposal](#platform-capability-order-proposal) | Implement the proposed P1 platform sequence following the upstream capability inventory. | 2026-10-31T22:01:36.046Z | proposal |
| [platform-capability-order-direction](#platform-capability-order-direction) | Keep P1 steps one through eight; schedule screen awareness ninth, MCP tenth, ACP eleventh and collaboration twelfth. | 2026-11-01T12:44:07.553Z | recorded-owner-direction |
| [platform-federation-target-proof-spec](#platform-federation-target-proof-spec) | Measure remote switch, disposal, incompatible fallback, offline behavior and rebuild requirements independently on web and native targets. | Unknown | settled-requirement |
| [platform-federation-original-proposal](#platform-federation-original-proposal) | Adopt Expo 56, Re.Pack 5.4.2, Rspack 2.3 and MF 2.9.2 with web-first delivery and a native feature flag until a device run. | 2026-10-31T22:04:24.377Z | proposal |
| [platform-federation-historical-adoption](#platform-federation-historical-adoption) | Historically adopt the named Expo 56/Re.Pack 5.4.2/Rspack 2.3/MF 2.9.2 stack on a development build without a native feature-flag gate. | 2026-10-31T22:36:34.263Z | recorded-owner-direction |
| [platform-federation-disposable-spike-direction](#platform-federation-disposable-spike-direction) | Run the disposable federation compatibility spike with exact dependencies confined to the experiment. | 2026-11-15T17:42:56.296Z | recorded-owner-direction |
| [platform-federation-later-fallback-proposal](#platform-federation-later-fallback-proposal) | Prefer web-only federation first and keep native modules bundled after the later compatibility experiment. | 2026-11-15T18:00:52.799Z | proposal |
| [platform-offline-combined-proof-spec](#platform-offline-combined-proof-spec) | Evaluate record/field and collaborative text/canvas sync together with durable restart queues and permission loss on reconnect. | Unknown | settled-requirement |
| [platform-sync-original-proposal](#platform-sync-original-proposal) | Pair self-hosted PowerSync records with Yjs update rows and server-authorized per-kind conflict handling. | 2026-10-31T22:03:07.504Z | proposal |
| [platform-sync-additional-client-proof-direction](#platform-sync-additional-client-proof-direction) | Test web and Expo clients before adopting the proposed sync engine. | 2026-10-31T23:03:52.654Z | recorded-owner-direction |
| [platform-native-yjs-crypto-proposal](#platform-native-yjs-crypto-proposal) | Use a secure approved native crypto provider for Yjs rather than the spike-only random fallback. | 2026-10-31T23:35:00.684Z | proposal |
| [platform-sync-adoption-direction](#platform-sync-adoption-direction) | Adopt self-hosted PowerSync Open Edition with Postgres bucket storage and Yjs rows, with all writes through authorized Effect actions. | 2026-11-09T22:04:28.180Z | recorded-owner-direction |
| [platform-cluster-measurement-spec](#platform-cluster-measurement-spec) | Measure two independent runner placement, graceful drain and crash recovery and state observed ordering/loss/duplication guarantees. | Unknown | settled-requirement |
| [platform-cluster-base-proposal](#platform-cluster-base-proposal) | Keep the existing cluster base and separately fix empty runners, failover tuning, persisted idempotency and agent-run recovery. | 2026-10-31T22:30:24.491Z | proposal |
| [platform-cluster-base-historical-direction](#platform-cluster-base-historical-direction) | Keep Effect Cluster as the historical sharding base; address platform gaps EVE-37/38/39 before agent-run EVE-34/35/36. | 2026-10-31T22:55:44.972Z | recorded-owner-direction |
| [platform-telemetry-matrix-spec](#platform-telemetry-matrix-spec) | Establish a cited web/native/server product-tool and OTel signal matrix with vendor-neutral services and explicit gaps. | Unknown | settled-requirement |
| [platform-direct-otlp-original-proposal](#platform-direct-otlp-original-proposal) | Use neutral Effect telemetry and product ports with direct OTLP to the default backend and no collector initially. | 2026-10-31T21:55:24.140Z | proposal |
| [platform-direct-otlp-direction](#platform-direct-otlp-direction) | Accept the neutral telemetry contract with direct OTLP to PostHog and no collector. | 2026-10-31T22:46:01.133Z | recorded-owner-direction |
| [platform-sanctioned-ai-research-spec](#platform-sanctioned-ai-research-spec) | Permit only source-backed sanctioned AI credential/delegation routes and keep unconfirmed subscription use unavailable. | Unknown | settled-requirement |
| [platform-ai-launch-original-proposal](#platform-ai-launch-original-proposal) | Offer sanctioned API keys, user-billed OAuth/SDK flows, local models and user-authenticated desktop agents with scoped credential handles and no silent fallback. | 2026-10-31T21:54:44.251Z | proposal |
| [platform-ai-launch-owner-direction](#platform-ai-launch-owner-direction) | Adopt the full sanctioned launch set and apply for OpenAI plan-use approval, retaining the credential model and no-fallback rule. | 2026-10-31T22:51:05.261Z | recorded-owner-direction |
| [platform-fresh-three-package-direction](#platform-fresh-three-package-direction) | Create fresh portable contracts, database-neutral schema and backend runtime boundaries instead of extracting the archived manual core. | Unknown | recorded-owner-direction |
| [platform-configuration-credentials-spec](#platform-configuration-credentials-spec) | Validate namespaced module configuration before publication and expose scoped settings/secret/credential services without exposing plaintext. | Unknown | settled-requirement |
| [platform-keycloak-selection-direction](#platform-keycloak-selection-direction) | Select Keycloak 26.8.2 as central identity/SSO platform and proceed with provider-neutral identity implementation under exact-component security gates. | Unknown | recorded-owner-direction |
| [platform-trust-investigation-original-proposal](#platform-trust-investigation-original-proposal) | Investigate marketplace mutual service identity, attestation and key separation before choosing concrete cryptographic components. | 2026-11-14T23:11:18.596Z | proposal |
| [platform-bidirectional-identity-spec](#platform-bidirectional-identity-spec) | Require identity platform conformance in both outbound provider and inbound broker roles with stable multi-tenant subject linking. | 2026-11-15T14:50:06.558Z | settled-requirement |
| [platform-keycloak-reviewed-batch-direction](#platform-keycloak-reviewed-batch-direction) | Authorize one consolidated SBOM-reviewed immutable Keycloak 26.8.2 image and necessary pinned OIDC dependency batch within its documented reviewed boundary. | 2026-11-16T18:51:49.841Z | recorded-owner-direction |
| [platform-central-observability-spec](#platform-central-observability-spec) | Provide central Effect-native bootstrap-safe structured console/date-file telemetry, correlated spans and swappable exporters without coupling features or suppressing mandatory audit. | Unknown | settled-requirement |
| [platform-reset-tool-retention-proposal](#platform-reset-tool-retention-proposal) | Temporarily propose retaining still-referenced manual test/declaration tooling outside production packages while preserving the archive. | 2026-11-11T00:14:21.006Z | proposal |
| [platform-full-manual-reset-direction](#platform-full-manual-reset-direction) | Archive all manual implementation and tooling as historical references, retire active discovery/CI references and build the replacement from fresh approved specifications. | Unknown | recorded-owner-direction |
| [platform-reset-owner-acceptance](#platform-reset-owner-acceptance) | Accept the validated archive/reset and authorize its direct-main delivery. | 2026-11-11T00:32:43.986Z | recorded-owner-direction |
| [platform-project-mission-restoration-direction](#platform-project-mission-restoration-direction) | Restore the historical product mission in the active README while retaining current setup and archive guidance. | 2026-11-13T19:52:38.350Z | recorded-owner-direction |
| [platform-house-enrollment-direction](#platform-house-enrollment-direction) | Fully enroll the reset repository in current house synchronization while preserving Eventiva direct-main delivery and security/spending controls. | Unknown | recorded-owner-direction |
| [platform-billing-hard-stop-spec](#platform-billing-hard-stop-spec) | Keep independently enforced metered-spend hard stops and require explicit owner approval for increases or cost-incurring automation. | Unknown | settled-requirement |
| [platform-direct-main-reconfirmation](#platform-direct-main-reconfirmation) | All Eventiva coding agents deliver directly to main; separate governance repository and house/graph bot workflows retain their established processes. | 2026-11-13T13:30:01.964Z | recorded-owner-direction |
| [platform-house-enrollment-completion-direction](#platform-house-enrollment-completion-direction) | Mark house enrollment Done following the successful settings/workflow evidence. | 2026-11-13T13:42:04.980Z | recorded-owner-direction |
| [platform-house-five-ref-waiver](#platform-house-five-ref-waiver) | Skip the manual five-ref push limit as an enrollment requirement and unblock the fresh foundation. | 2026-11-13T13:43:59.417Z | recorded-owner-direction |
| [platform-learning-platform-spec](#platform-learning-platform-spec) | Plan an integrated accessible offline-capable learning, assessment and competency platform with immutable content/evidence versions and portable contracts. | Unknown | settled-requirement |
| [platform-training-terminology-initial](#platform-training-terminology-initial) | Separate locale, domain vocabulary, operational profile and organization overlays while preserving stable concepts and historical profile versions. | 2026-11-11T19:14:01.424Z | recorded-owner-direction |
| [platform-training-tenant-terminology](#platform-training-tenant-terminology) | Tenant administrators select operational vocabulary and phraseology consistently; users retain only safe locale/accessibility choices. | 2026-11-11T19:15:09.387Z | recorded-owner-direction |
| [platform-credential-competency-direction](#platform-credential-competency-direction) | Separate viewed participation, assessed knowledge, assessor-signed practical competence and scoped operational authorization. | 2026-11-11T19:41:09.418Z | recorded-owner-direction |
| [platform-qualification-verification-direction](#platform-qualification-verification-direction) | Keep qualification validity, evidence verification and issuer trust independent; unverified uploads cannot activate protected operational permissions. | 2026-11-11T19:44:42.853Z | recorded-owner-direction |
| [platform-assessment-integrity-direction](#platform-assessment-integrity-direction) | Exclude invasive proctoring from core and use proportionate knowledge checks and human-assessed practical competence instead. | 2026-11-11T19:48:04.624Z | recorded-owner-direction |
| [platform-training-version-impact-direction](#platform-training-version-impact-direction) | Publish immutable training versions and preserve exact evidence versions; apply differentiated editorial/minor/material/critical retraining governance. | 2026-11-11T19:51:43.819Z | recorded-owner-direction |
| [platform-small-training-simulation-direction](#platform-small-training-simulation-direction) | Keep simulation a small optional training submodule using synthetic branching scenarios, not a standalone simulator or prerequisite to live dispatch. | 2026-11-15T18:59:07.444Z | recorded-owner-direction |
| [platform-guided-sop-default-direction](#platform-guided-sop-default-direction) | Make shared guided SOPs advisory by default, with tenant-configurable mandatory steps/evidence and independent authorized sign-off. | 2026-11-15T19:05:46.112Z | recorded-owner-direction |
| [platform-marketplace-payments-direction](#platform-marketplace-payments-direction) | Plan supplier-merchant noncustodial payments through neutral actions with a first direct-charge connected-account invoice adapter and application fee. | Unknown | recorded-owner-direction |
| [platform-supplier-maturity-calibration-proposal](#platform-supplier-maturity-calibration-proposal) | Calibrate versioned supplier maturity targets and provider-supported payout timing using history, verified diversity and fulfillment/loss evidence rather than turnover alone. | Unknown | proposal |
| [platform-catalogue-discovery-deferral](#platform-catalogue-discovery-deferral) | Defer supplier catalogue onboarding to later source-rights and import discovery, keeping shared technical references separate from tenant-private stock. | Unknown | settled-requirement |
| [platform-cluster-generation-proof-spec](#platform-cluster-generation-proof-spec) | Use one cluster-capable authorized execution path and persist exact module/provider/schema generation and fenced workflow ownership through runner recovery. | Unknown | settled-requirement |
| [platform-shared-procedure-spec](#platform-shared-procedure-spec) | Use one versioned controlled procedure/run model attached to existing issues with durable steps, evidence, handover and canonical authorized actions. | Unknown | settled-requirement |
| [platform-emergency-human-initiation-direction](#platform-emergency-human-initiation-direction) | Require deliberate authorized human initiation for every Eventiva operational incident/alarm/emergency response output; alerts and suggested procedures alone never actuate control. | Unknown | recorded-owner-direction |
| [platform-show-native-vs-orchestration-proposal](#platform-show-native-vs-orchestration-proposal) | Historically consider native playback versus orchestration-only show control before locking media/runtime design. | Unknown | proposal |
| [platform-native-show-product-direction](#platform-native-show-product-direction) | Target complete QLab-class cue families with native playback and external control in a dedicated deterministic local show engine, separate from MDT dispatch. | Unknown | recorded-owner-direction |
| [platform-bidirectional-show-mdt-direction](#platform-bidirectional-show-mdt-direction) | Connect authorized MDT incident commands and external controls to allowlisted F1 cue actions through one versioned mapping and separate local playback executor. | Unknown | recorded-owner-direction |
| [platform-module-kernel-spec](#platform-module-kernel-spec) | Compose exact-version modules and named provider instances with declared environments, governed lifecycle and safe ready-generation updates over the existing ActionHost. | Unknown | settled-requirement |
| [platform-resources-migration-spec](#platform-resources-migration-spec) | Expose one typed authorized Resources API while only privileged adapters perform tenant-routed SQL and compatible forward declaration migrations. | Unknown | settled-requirement |
| [platform-declarative-ui-spec](#platform-declarative-ui-spec) | Initial untrusted UI extensions are validated data only interpreted by installed approved components and bound to the canonical authorized action/screen inventory. | Unknown | settled-requirement |
| [platform-ready-banner-reference-spec](#platform-ready-banner-reference-spec) | Build the exact historical startup banner as the first clean reference extension, released only after verified ready and demonstrating resources, hooks, UI and central logging. | Unknown | settled-requirement |
| [platform-observer-dispatch-spec](#platform-observer-dispatch-spec) | Deliver immutable after-commit observations through a governed registry and current scoped release policy, with additive effects only through separately authorized canonical actions. | Unknown | settled-requirement |
| [platform-acyclic-exact-types-direction](#platform-acyclic-exact-types-direction) | Reject static, type-only, generated and runtime manifest/provider cycles and preserve precise Effect contracts without erased types, unsafe casts or suppressed diagnostics. | Unknown | recorded-owner-direction |
| [platform-declaration-checker-callback-direction](#platform-declaration-checker-callback-direction) | Approve emitted-declaration traversal/checker strengthening and only existing required private Effect Logger/Tracer opaque callbacks that are immediately narrowed or discarded. | 2026-11-17T05:59:38.706Z | recorded-owner-direction |
| [pseudonymous-request-correlation](#pseudonymous-request-correlation) | Only pseudonymous session and user correlation is selected, with per-request opt-in, current user consent and protected-profile exclusion; raw identifier export is not authorized. | 2026-11-17T13:17:48.704Z | recorded-owner-direction |
| [dedicated-correlation-key-custody](#dedicated-correlation-key-custody) | Use a dedicated secret-store/KMS correlation key separated per tenant, destination and purpose, retaining cross-server linkability only until rotation. | 2026-11-17T13:23:58.129Z | recorded-owner-direction |
| [correlation-epoch-crypto-proposal](#correlation-epoch-crypto-proposal) | The analysis lane recommends one-hour UTC-aligned epochs and local HMAC-SHA-256 with separately scoped 256-bit keys, without an old-key alias bridge; this is not owner-selected. | 2026-11-17T13:23:58.129Z | proposal |

### portable-topology

Use the same domain code from a laptop to distributed deployments, with replaceable Effect provider contracts and shared conformance suites.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T00:31:41.924Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/feb6d39b-a6e9-46db-b761-8f8c67c517fd](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-feb6d39b-a6e9-46db-b761-8f8c67c517fd), [EVE-244/beddf327-076b-4c42-8d76-4733941af565](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-beddf327-076b-4c42-8d76-4733941af565).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Deployment profiles and production adapter evidence remain implementation work; architecture does not select new vendors.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### tenant-database-default

Default to a dedicated database per tenant, with a narrow shared control plane and tenant-scoped routing, backups and portability; shared operational tables are not the default.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T00:34:51.853Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/04355bc1-9b30-4d93-9a0f-f8f7e56ce9c0](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-04355bc1-9b30-4d93-9a0f-f8f7e56ce9c0), [EVE-244/84a979d0-1c55-42bb-8c9b-5ce4c806c817](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-84a979d0-1c55-42bb-8c9b-5ce4c806c817).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Provisioning and production isolation must be demonstrated per adapter; SQLite remains capability-dependent.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### identity-independence

Introduce hosted federated identity early while retaining independent local/OIDC operation; authentication, tenant authorization and entitlement remain separate. Agents receive delegated handles, never reusable credentials.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T00:39:35.862Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/4f3876a5-c410-49bb-90dc-5935e7dfec2e](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-4f3876a5-c410-49bb-90dc-5935e7dfec2e), [EVE-244/5a73a0c9-7aa7-43ec-b126-e2580594782d](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-5a73a0c9-7aa7-43ec-b126-e2580594782d).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Hosted threat model, security review, privacy/retention, incident response and audited key-provider choices remain production gates.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### resource-permissions

Resource/action permissions are the enforcement primitive across every surface. Roles are convenience bundles, with direct grants, inheritance, conditions, explain-access and narrowly delegated agents.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T00:42:39.928Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/64bb47d5-cffb-4a56-a11b-78039632cded](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-64bb47d5-cffb-4a56-a11b-78039632cded), [EVE-244/a958c3a7-6d63-409d-b7f2-8e4f90dc8b87](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-a958c3a7-6d63-409d-b7f2-8e4f90dc8b87).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Conflict rules, engine-specific conformance and full administration surfaces require implementation evidence.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### managed-permission-groups

Managed role/team/organization/deployment relationships remain live: changing a group's permission bundle changes effective access. Preserve direct exceptions and explain the full granting path.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T00:43:54.414Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/50569b7f-fb59-4dd2-8f6e-fa1a6434432c](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-50569b7f-fb59-4dd2-8f6e-fa1a6434432c), [EVE-244/036605e8-fdf3-49c3-ac28-c7d8b8d69a5c](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-036605e8-fdf3-49c3-ac28-c7d8b8d69a5c).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: This refines resource-first permissions rather than replacing them; policy conflict and safety rules must remain explicit.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### permission-simulation

Provide protected permission simulation, what-if/access-diff previews, explainable decisions and saved regression assertions through the same authorized evaluator; simulation never grants access.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T00:45:08.764Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/d06e0cab-d9b6-47c7-887c-1a86b37ee2b8](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-d06e0cab-d9b6-47c7-887c-1a86b37ee2b8), [EVE-244/bc2a425b-e2e3-43a7-9376-23ccf4cfa987](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-bc2a425b-e2e3-43a7-9376-23ccf4cfa987).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Test cross-adapter conformance and protect sensitive relationship explanations; full UI/agent parity is not verified by foundation status.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### offline-consistency-classes

Declare and test offline behavior by data class: CRDT documents, optimistic ordinary records, authoritative invariant commands and append-only operational journals. Never display unconfirmed physical execution as complete.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T00:46:07.877Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/8bf65268-b894-4928-a905-88a1b76ac736](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-8bf65268-b894-4928-a905-88a1b76ac736), [EVE-244/c7a2e885-073d-40e8-ae5e-2385640e5ab9](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-c7a2e885-073d-40e8-ae5e-2385640e5ab9).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Visible conflict handling, durable queues, long-disconnection recovery, migrations and explicit online-only safety exceptions require feature-level evidence.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### universal-audit

Audit mutations, sensitive reads, policy decisions and agent/integration activity with redacted provenance. Sealed evidence is append-only, tamper-evident and verifiable beneath UI controls.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T00:47:55.439Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/7048ce25-b700-436a-8404-90ac0dec2330](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-7048ce25-b700-436a-8404-90ac0dec2330), [EVE-244/ba2b627f-ddf6-47f5-afab-98014a68e264](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-ba2b627f-ddf6-47f5-afab-98014a68e264).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Cryptographic implementations, independent anchoring, retention/legal-hold policy and operational verification require separate concrete review.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### integrity-profiles

Select collaborative, versioned, controlled, sealed-record or operational-journal integrity per resource. Universal audit remains mandatory; not every resource uses a submit/approve/post/seal lifecycle.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T00:50:31.912Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/3a7b1029-15b1-402d-b4da-2846ebc1b2d9](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-3a7b1029-15b1-402d-b4da-2846ebc1b2d9), [EVE-244/26d56c9c-b9a8-4932-b914-823b2505b6c2](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-26d56c9c-b9a8-4932-b914-823b2505b6c2).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Each module declares and justifies its profile, transitions and strengthening rules. This refines rather than revokes universal audit.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### module-execution-tiers

Use declarative modules by default, capability-confined executable sandboxes for custom logic, and reviewed application releases for native/trusted modules. Registry scanning is evidence, not a sandbox substitute.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T00:54:47.149Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/d81ec5dd-5213-4ab7-a0ed-3502102da9af](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-d81ec5dd-5213-4ab7-a0ed-3502102da9af), [EVE-244/f3750f40-d7c3-4e1b-ac6b-9d27ef03aab1](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-f3750f40-d7c3-4e1b-ac6b-9d27ef03aab1).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Exact sandbox/runtime, quotas, release/signature implementation and vulnerability evidence require reviewed implementation choices.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### deletion-erasure-accountability

Ordinary deletion defaults to 30 days recycle plus 60 days protected quarantine before purge; lawful erasure is distinct and retains only justified evidence. Agents record purpose without gaining permission from purpose text.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T01:05:06.142Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/6b715b51-eea2-46bb-922e-6a5e1d7d4568](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-6b715b51-eea2-46bb-922e-6a5e1d7d4568), [EVE-244/c0b1d40e-3962-4d77-ad83-e78c4d7e215f](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-c0b1d40e-3962-4d77-ad83-e78c4d7e215f).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Retention may strengthen within law; legal holds, erasure propagation, nonreversible subject tombstones and high-risk approval controls need independent evidence.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### personal-connection-sovereignty

Personal connections stay under their owner's consent and revocation. Tenant policy may constrain use but cannot take ownership or expose credentials; executions show the connection and funding source.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T01:07:33.545Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/95b136c6-7b1e-4cf0-b7e9-b6fc1235b4d4](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-95b136c6-7b1e-4cf0-b7e9-b6fc1235b4d4), [EVE-244/7139117e-a3b7-4993-95e6-5d5f34c8be46](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-7139117e-a3b7-4993-95e6-5d5f34c8be46).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Offboarding continuity and fallback policy must be explicit; only provider-authorized mechanisms are permitted.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### sponsored-connection-authorities

Separate credential ownership, funding authority and tenant execution policy for sponsored connections. Use scoped handles, visible attribution and explicit fallback rather than silently switching who pays.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T01:09:34.641Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/f525b939-1a72-487a-ab5f-2ae391eb6bfd](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-f525b939-1a72-487a-ab5f-2ae391eb6bfd), [EVE-244/1c277d6c-efc7-4b1e-a18f-018986777e36](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-1c277d6c-efc7-4b1e-a18f-018986777e36).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Per-user/team/project limits, data classifications, regions, retention, rotation and offboarding require concrete policy and tests.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### portable-tenant-data

Make complete tenant migration and structured interoperability first-class, with versioned signed manifests, fidelity declarations, preview/validation and provider-independent adapters.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T01:16:37.302Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/7e40a37f-67e5-4d47-af9b-340196101d4b](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-7e40a37f-67e5-4d47-af9b-340196101d4b), [EVE-244/162a21c5-6f42-4d73-ae01-9837234ad518](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-162a21c5-6f42-4d73-ae01-9837234ad518).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Exact export formats, module mappings, migration fidelity and restore/cutover evidence remain resource-specific.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### protected-export-release

Sensitive exports default to phishing-resistant MFA and a 24-hour cancellation window; sealed/regulated exports require independent dual approval and 48 hours. Scope changes invalidate approval and usable keys stay withheld until release.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T01:19:56.789Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/4ebadc72-22d4-437b-9163-2145cd046db2](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-4ebadc72-22d4-437b-9163-2145cd046db2), [EVE-244/23d84e7c-03a8-42fd-8092-4317e9897760](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-23d84e7c-03a8-42fd-8092-4317e9897760).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Destination binding, expiry, strengthened legal controls and narrowly audited emergency procedures need concrete implementation and legal review.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### recovery-tiers

Distinguish community recovery targets (24-hour RPO/RTO), production (1-hour RPO/4-hour RTO), and explicit critical live operations (near-zero RPO/1-hour-or-better RTO), backed by restore/failover evidence rather than blanket guarantees.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:09:44.658Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/9bbcdcef-4699-47c4-9547-40587bcd42a6](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-9bbcdcef-4699-47c4-9547-40587bcd42a6), [EVE-244/0dd7f367-e2eb-4913-b4a4-2bfa7544d734](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-0dd7f367-e2eb-4913-b4a4-2bfa7544d734).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Deployment-specific redundancy, retention, restoration drills, corruption safeguards and proof of achievable targets remain required.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### approval-policy-a2

Bound routine agent work to preauthorization and live scopes; other writes default to confirmation, while high-risk irreversible/financial/permission/capacity/live actions need fresh human authorization. Agents cannot self-approve.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T01:44:33.600Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-40](issues/EVE-40.md), [EVE-42](issues/EVE-42.md), [EVE-71](issues/EVE-71.md), [EVE-147](issues/EVE-147.md).
- Evidence: [EVE-40/ed996139-45e9-4c0d-ab14-2a5f0f19afdc](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema#comment-ed996139-45e9-4c0d-ab14-2a5f0f19afdc), [EVE-71/e49f736c-0dd1-4abf-abe7-70515e14e203](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-e49f736c-0dd1-4abf-abe7-70515e14e203), [EVE-147/5e4ac4bd-3e3c-4994-b75c-c711e5f0d087](https://linear.app/resnovas/issue/EVE-147/f77-build-the-incident-control-log-and-dispatch-for-live-events#comment-5e4ac4bd-3e3c-4994-b75c-c711e5f0d087).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Approvals bind principal, tenant, action/version, exact input/hash, limits and expiry; tenants may raise but not lower floors. No new provider or dependency is approved.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### guarded-offline-a3

Queue reversible edits or explicit guarded intents with state/version/idempotency/deadline; revalidate online. Payments and live dispatch/show control stay online-only absent a separately validated safety-local profile.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T01:44:33.600Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-40](issues/EVE-40.md), [EVE-42](issues/EVE-42.md), [EVE-71](issues/EVE-71.md), [EVE-147](issues/EVE-147.md).
- Evidence: [EVE-40/ed996139-45e9-4c0d-ab14-2a5f0f19afdc](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema#comment-ed996139-45e9-4c0d-ab14-2a5f0f19afdc), [EVE-71/e49f736c-0dd1-4abf-abe7-70515e14e203](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-e49f736c-0dd1-4abf-abe7-70515e14e203), [EVE-147/5e4ac4bd-3e3c-4994-b75c-c711e5f0d087](https://linear.app/resnovas/issue/EVE-147/f77-build-the-incident-control-log-and-dispatch-for-live-events#comment-5e4ac4bd-3e3c-4994-b75c-c711e5f0d087).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Scheduled jobs recheck notBefore, deadline, dependencies, permissions, capacity, state and approval validity; preserve immutable baseline versus forecast.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### audit-availability-a4

Fail closed when mutations or sensitive reads cannot record durable receipts. Only low-risk reads may use a bounded durable local spool with visible degradation; exhaustion fails closed.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T01:44:33.600Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-40](issues/EVE-40.md), [EVE-42](issues/EVE-42.md), [EVE-71](issues/EVE-71.md), [EVE-147](issues/EVE-147.md).
- Evidence: [EVE-40/ed996139-45e9-4c0d-ab14-2a5f0f19afdc](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema#comment-ed996139-45e9-4c0d-ab14-2a5f0f19afdc), [EVE-71/e49f736c-0dd1-4abf-abe7-70515e14e203](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-e49f736c-0dd1-4abf-abe7-70515e14e203), [EVE-147/5e4ac4bd-3e3c-4994-b75c-c711e5f0d087](https://linear.app/resnovas/issue/EVE-147/f77-build-the-incident-control-log-and-dispatch-for-live-events#comment-5e4ac4bd-3e3c-4994-b75c-c711e5f0d087).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Recovery and bounded-spool tests must show durable persistence without weakening protected audit.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### scarce-resource-integrity-s2

Use authoritative append-only ledgers, expiring reservations and typed CAS for scarce resources; reconcile payments idempotently and represent money exactly, never with binary floating point.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T01:44:34.461Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-42](issues/EVE-42.md), [EVE-40](issues/EVE-40.md), [EVE-71](issues/EVE-71.md), [EVE-147](issues/EVE-147.md).
- Evidence: [EVE-42/fbbed675-50b0-4e5a-b5fb-7ec6187c30b9](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-fbbed675-50b0-4e5a-b5fb-7ec6187c30b9), [EVE-71/e49f736c-0dd1-4abf-abe7-70515e14e203](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-e49f736c-0dd1-4abf-abe7-70515e14e203), [EVE-147/5e4ac4bd-3e3c-4994-b75c-c711e5f0d087](https://linear.app/resnovas/issue/EVE-147/f77-build-the-incident-control-log-and-dispatch-for-live-events#comment-5e4ac4bd-3e3c-4994-b75c-c711e5f0d087).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Prove no oversell/negative availability, stale-CAS denial, lease expiry and payment reconciliation on actual adapters.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### offline-device-s3

Use typed raw device tables with explicit migrations; guarded envelopes carry expected state/version, idempotency key, client mutation ID and deadline through the same server action path.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T01:44:34.461Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-42](issues/EVE-42.md), [EVE-40](issues/EVE-40.md), [EVE-71](issues/EVE-71.md), [EVE-147](issues/EVE-147.md).
- Evidence: [EVE-42/fbbed675-50b0-4e5a-b5fb-7ec6187c30b9](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-fbbed675-50b0-4e5a-b5fb-7ec6187c30b9), [EVE-71/e49f736c-0dd1-4abf-abe7-70515e14e203](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-e49f736c-0dd1-4abf-abe7-70515e14e203), [EVE-147/5e4ac4bd-3e3c-4994-b75c-c711e5f0d087](https://linear.app/resnovas/issue/EVE-147/f77-build-the-incident-control-log-and-dispatch-for-live-events#comment-5e4ac4bd-3e3c-4994-b75c-c711e5f0d087).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Projection JSON remains derived; migration and visible-conflict tests are required.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### forward-migrations-s4

Use forward-only checksum-verified expand/contract migrations with compatibility and recovery evidence; UUIDv7 IDs, exact decimal strings and one Postgres/SQLite temporal contract. This supersedes the blanket down-step requirement.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T01:44:34.461Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-42](issues/EVE-42.md), [EVE-40](issues/EVE-40.md), [EVE-71](issues/EVE-71.md), [EVE-147](issues/EVE-147.md).
- Evidence: [EVE-42/fbbed675-50b0-4e5a-b5fb-7ec6187c30b9](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-fbbed675-50b0-4e5a-b5fb-7ec6187c30b9), [EVE-71/e49f736c-0dd1-4abf-abe7-70515e14e203](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-e49f736c-0dd1-4abf-abe7-70515e14e203), [EVE-147/5e4ac4bd-3e3c-4994-b75c-c711e5f0d087](https://linear.app/resnovas/issue/EVE-147/f77-build-the-incident-control-log-and-dispatch-for-live-events#comment-5e4ac4bd-3e3c-4994-b75c-c711e5f0d087).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Offline-client windows, restore/branch recovery and applied-checksum immutability must be tested; physical tenant keys omit tenant ID while routing stays scoped.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### neon-production-direction

Use a dedicated London Neon Postgres project per production tenant; local PostgreSQL images are conformance fixtures and branches are not equivalent production isolation. Keep contracts provider-neutral.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T03:45:44.054Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-42](issues/EVE-42.md).
- Evidence: [EVE-13/ae0f8d88-d938-4467-a17f-ec7249662c98](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-ae0f8d88-d938-4467-a17f-ec7249662c98), [EVE-42/973441a3-2e26-4a9c-9311-17ad84583730](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-973441a3-2e26-4a9c-9311-17ad84583730).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Validate pooled/direct connections, SSL, lifecycle/autosuspend, direct migrations, DDL/extensions, transactions, routing and exact values; no production provisioning or spend authorized.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### cdc-cost-and-compatibility

Keep initial synthetic development replication disabled; a PowerSync/CDC trial needs separate approval, direct privileged replication endpoint and measured active time, lag, retention and cost. Do not silently abandon the approved sync architecture.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T03:47:29.606Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-17](issues/EVE-17.md), [EVE-42](issues/EVE-42.md), [EVE-51](issues/EVE-51.md).
- Evidence: [EVE-17/1c92bc96-9aa9-4d16-af7a-6ef7216c52a7](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and#comment-1c92bc96-9aa9-4d16-af7a-6ef7216c52a7), [EVE-42/92d05be3-ecbd-4272-bbdd-e3294bbd5fea](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-92d05be3-ecbd-4272-bbdd-e3294bbd5fea), [EVE-51/6326f24f-c1ea-4835-a39e-96ceeaf2b1cc](https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and#comment-6326f24f-c1ea-4835-a39e-96ceeaf2b1cc).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Replication is irreversible at project level and may prevent scale-to-zero; quota/isolation/cost and slot recovery need measured evidence before enablement.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### live-control-room-scope

Build the full live control-room workflow on real existing issues, not simulated emergency call intake. Reuse shared guided procedures and keep optional training simulation isolated from live dispatch.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T18:59:10.660Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-71](issues/EVE-71.md).
- Evidence: [EVE-71/3a3bdad5-0f46-4507-9c53-425a2d7bbfb9](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-3a3bdad5-0f46-4507-9c53-425a2d7bbfb9).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Controller coverage/handover, assessment and closure refinements are design candidates, not implicitly approved safety standards; coordination-only until a separate safety case.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### guided-procedure-default

Guided procedures are advisory by default; tenant admins may require steps, evidence and named authorized sign-off. Use shared EVE-253 procedures against real linked records, not a second MDT-only engine.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T19:05:44.515Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-71](issues/EVE-71.md).
- Evidence: [EVE-71/aaa4f6c3-c97c-4fbc-86f0-c7e50ab84214](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-aaa4f6c3-c97c-4fbc-86f0-c7e50ab84214).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Per-procedure mandatory/evidence/sign-off policy remains configurable under unchanged agent approval and online dispatch floors.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### trust-architecture-reconciled

Existing root trust, non-exportable key hierarchy, four independent release gates, sealed profiles, zero trust and assurance floors are binding architecture, not an entirely undecided trust design. Provider-neutral contracts and negative tests may proceed within approved dependencies.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-16T19:03:34.533Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-251](issues/EVE-251.md).
- Evidence: [EVE-251/15483735-fbab-487d-a03e-3c15f27e2682](https://linear.app/resnovas/issue/EVE-251/decide-marketplace-service-attestation-and-cryptographic-trust#comment-15483735-fbab-487d-a03e-3c15f27e2682).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Exact algorithms/canonicalization, custody/provider, attestation evidence/verifier independence, replay/rotation timing, jurisdiction/lawful basis and fraud thresholds remain separately reviewable.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### typed-feature-controls

Flag meaningful optional capabilities through typed OpenFeature contracts; never flag away deterministic invariants, permission checks or mandatory security. Signed safety, entitlement and deployment policy override rollout providers.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T14:43:08.685Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/754712b6-407c-448a-aa8d-38fdc1e695bd](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-754712b6-407c-448a-aa8d-38fdc1e695bd), [EVE-244/071492be-2018-4e0e-b942-1a58626b6134](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-071492be-2018-4e0e-b942-1a58626b6134).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Registry ownership, expiry/removal, both-state tests, signed cache freshness and permitted override sources must be explicit; only bootstrap trust uses environment/mounted secrets.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### fair-core-licensing

Retain canonical FCL-1.0-MIT terms and per-version future MIT licensing, with signed portable entitlements distinct from activation flags. Expiry must not disable mandatory security or required customer-data retrieval.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T14:59:45.599Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/84c3ffcc-2f26-455e-840c-69d3cb919ba5](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-84c3ffcc-2f26-455e-840c-69d3cb919ba5), [EVE-244/e6fc730d-cee9-40cf-959f-d7400094b8d8](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-e6fc730d-cee9-40cf-959f-d7400094b8d8).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Tamper-evident release dates, offline grace/recovery, transparent state and qualified commercial/jurisdictional legal review remain required.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### release-channels

Use Stable, Beta, Nightly and signed Emergency channels; Canary is a rollout strategy, not separate source truth. Managed stable rollout is staged; self-hosted updates default to administrator approval/schedule.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T15:02:06.642Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/9b25b62f-89df-4a3b-9caf-8db5c81b4b04](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-9b25b62f-89df-4a3b-9caf-8db5c81b4b04), [EVE-244/5d474b86-eb6c-461a-b1bd-4a2e8956116c](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-5d474b86-eb6c-461a-b1bd-4a2e8956116c).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Signed manifests, provenance/SBOM, assurance, atomic health-checked activation, halt/rollback thresholds and mixed-client compatibility require target-specific evidence.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### compatibility-lifecycle

Support compatibility for at least two stable majors or 36 months, whichever is longer. Separate 0-24-month active support, 24-36-month community maintenance, license transition and hosted entitlement.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T15:03:50.229Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/73f7d476-250c-422a-8497-424cbf33f402](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-73f7d476-250c-422a-8497-424cbf33f402), [EVE-244/b3036f55-cc51-4deb-a9e2-b123ae2e089d](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-b3036f55-cc51-4deb-a9e2-b123ae2e089d).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Publish lifecycle dates and deprecation paths; security may shorten unsafe protocol support only with advisory and safe migration. Community maintenance is not an SLA.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### state-aware-migrations

Plan migrations from actual deployment/module/data state rather than a version string alone. Expand, backfill, verify and contract with resumable checkpoints; ambiguous state pauses rather than guesses.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T15:06:04.206Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/5dd1c144-eba5-4db3-b881-341d11ec8553](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-5dd1c144-eba5-4db3-b881-341d11ec8553), [EVE-244/ca51e26a-4b98-4269-8ea2-569e8def607b](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-ca51e26a-4b98-4269-8ea2-569e8def607b).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Managed canaries versus self-hosted preview/backup/approval, mixed-client windows, recovery and drift/provider/partial-upgrade tests must be explicit.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### degraded-operation-contracts

Every capability declares and tests degraded behavior before production readiness, including staleness, timeouts, bounded queues, truthful pending outcomes and deterministic recovery. Security/integrity uncertainty fails closed.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T15:08:38.233Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/4b5a0625-64c5-424c-9991-09359a7fc0bb](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-4b5a0625-64c5-424c-9991-09359a7fc0bb), [EVE-244/970dd4b7-1e0e-4432-afab-798416747005](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-970dd4b7-1e0e-4432-afab-798416747005).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Module-specific thresholds, cascading failure handling, chaos/contract evidence and operator runbooks remain required; unavailable is not an implicit fallback.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### reliability-and-simulation

Production capabilities declare measured SLIs/SLOs, error budgets and supported operating envelopes. Provisional objectives are not achieved SLOs; reproducible synthetic simulation tests correctness as well as throughput.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T15:11:45.069Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/9000c637-dfee-49b0-824c-8976cb88c218](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-9000c637-dfee-49b0-824c-8976cb88c218), [EVE-244/f88d38d2-0b05-476c-87ff-8fc45f20dbac](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-f88d38d2-0b05-476c-87ff-8fc45f20dbac).
- Implementation: Policy is recorded; complete implementation and acceptance have not been independently verified by this planning review. Observed issue status is shown below, not promoted to delivery proof.
- Concrete outstanding parameters: Capacity/failure limits, resource/cost curves, monitored cohorts and runbooks need evidence; physical/safety paths still require controlled hardware/field tests beyond simulation.
- Superseded by: None explicitly established in this record. No whole-decision replacement established; later refinements may apply to individual clauses.

### architecture-01

One action specification and one authorized runtime path for every surface

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: 2026-11-14T22:01:56.117Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-40](issues/EVE-40.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-40/fa3a5b15-87a8-4b1d-a41b-ea89e9beb12a](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema#comment-fa3a5b15-87a8-4b1d-a41b-ea89e9beb12a).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: No new surface-specific business engine: preserve one spec/handler split, current identity/approval checks and exact input/output/error/environment types. Verify UI/native/agent/protocol parity and scoped registration/disposal; current source inventory alone does not prove those targets.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-02

A1: one atomic write of domain state, idempotency evidence, history, outbox and receipt

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-14T22:35:34.990Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-40](issues/EVE-40.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-40/a412365e-b4df-4172-a316-606b06a7e763](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema#comment-a412365e-b4df-4172-a316-606b06a7e763).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Prove one same-client transaction covers authoritative state, business-lifetime idempotency result, transition/history, outbox and successful receipt; replays revalidate live authorization/approval. Crash, cross-tenant, duplicate and concurrency negatives remain acceptance evidence, not additional approved transaction defaults.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-03

Three offline execution categories

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-14T22:07:19.690Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-40](issues/EVE-40.md), [EVE-42](issues/EVE-42.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-40/aba96798-42e6-4502-b8c0-7f18b6ca6b35](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema#comment-aba96798-42e6-4502-b8c0-7f18b6ca6b35), [EVE-42/1807bbaf-0431-4f46-8282-535bfa78aa7b](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-1807bbaf-0431-4f46-8282-535bfa78aa7b).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Classify each action as reversible queued edit, guarded authoritative intent or safety-sensitive online work; specify expected state/version, idempotency and deadline for guarded intents. Payments/live dispatch/show control stay online-only unless a separately validated safety profile applies. Exact freshness and timeout budgets are not supplied by this category decision.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-04

S1: one logical database per tenant plus a narrow shared control plane

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-14T22:40:37.397Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-42](issues/EVE-42.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-42/e7459930-9d89-4f53-b7cb-d6b76d4c8cfc](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-e7459930-9d89-4f53-b7cb-d6b76d4c8cfc).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Use one logical operational database per tenant and narrow shared control metadata; authenticate before routing and never expose an unscoped tenant client. Production Neon project/pooling/TLS/isolation/region and sync compatibility need adapter-specific evidence. A branch is not automatically equivalent to isolated production projects, and provider creation/spend remains separately authorized.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-05

Key hierarchy, root trust, M-of-N custody, envelope encryption

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:21:58.718Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-13/9e6e287a-4a28-4695-801a-23a0889f6a56](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-9e6e287a-4a28-4695-801a-23a0889f6a56).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Separate root, signing/identity, tenant/resource/record key authorities; cloud root custody uses M-of-N and self-hosting has no vendor master key. Exact quorum sizes, HSM/KMS provider, algorithms, rotation/recovery procedures and evidence formats require their own approval; profile/key hierarchy does not select them.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-06

Four independent decryption gates, non-exportable keys

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:39:04.901Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-13/ebbcbe62-4eab-4919-9b33-03288c232e73](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-ebbcbe62-4eab-4919-9b33-03288c232e73).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Require independent live identity/delegation, resource/purpose, attested workload and key-broker scope/audience/action evidence before nonexportable-key release. Specify concrete verifier contracts, evidence age/revocation and fail-closed behavior with unavailable audit; signatures or network identity alone are insufficient. No numeric evidence-freshness budget is supplied here.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-07

Sealed core security profiles (Baseline, Sensitive, Restricted, Vault)

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:23:11.047Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-13/c3a06adc-8c33-4a6c-b43c-815bb8479410](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-c3a06adc-8c33-4a6c-b43c-815bb8479410), [EVE-13/08f09405-dbfb-4d5f-ac19-920cf95a98df](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-08f09405-dbfb-4d5f-ac19-920cf95a98df).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Core alone versions Baseline/Sensitive/Restricted/Vault semantics and minimums; modules cannot redefine guarantees or acquire raw keys. Declare each resource/field profile, enforce strongest required classification and fail closed on unsupported adapters. Allowed downgrade/reclassification migration conditions require explicit core-governed approval and proof.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-08

Zero trust on every route and surface

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:55:18.831Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-13/1da54684-89c0-4ce7-895c-aeec61af9c8a](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-1da54684-89c0-4ce7-895c-aeec61af9c8a).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Apply tenant/resource/purpose/assurance checks on every surface, default deny and bounded credentials/egress; internal network, admin role and support are not trust exemptions. Exact private-access adapter and emergency-risk controls remain deployment-specific; no provider or standing plaintext access is selected.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-09

Assurance levels A1 to A5, A4 for Restricted server-side decryption

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:47:42.781Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-13/6770565a-053c-47e6-8980-adab5ed9a109](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-6770565a-053c-47e6-8980-adab5ed9a109).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: A1 verified software, A2 hardware-bound, A3 protected keys, A4 confidential workload and A5 quorum/continuous high assurance require achieved evidence, not labels. Sensitive defaults A2; Restricted server decryption defaults A4. Exact attestation/verifier/freshness parameters and scoped self-hosted degraded-risk acceptance require explicit evidence without lowering mandatory floors.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-10

Canonical record ownership between the marketplace and tenant databases

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-14T23:11:16.105Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-250](issues/EVE-250.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-250/804a4ef1-945e-41b6-9343-d4ef9cb58fe1](https://linear.app/resnovas/issue/EVE-250/decide-controlled-cross-tenant-marketplace-gateway-architecture#comment-804a4ef1-945e-41b6-9343-d4ef9cb58fe1).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Marketplace owns exchanged two-party workflow/grants, immutable snapshots, comparison/mixed-award mapping and saga correlation; tenant databases retain internal operational/financial/PII records. Final concrete shared schema, participant grants, version locks and failure-recovery policy remain implementation detail; no routine direct cross-tenant query is permitted.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-11

Standard marketplace decryption profile

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-14T23:43:52.873Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-251](issues/EVE-251.md), [EVE-250](issues/EVE-250.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-251/a81300d7-254f-4ae7-b2f7-2f8f1204ea27](https://linear.app/resnovas/issue/EVE-251/decide-marketplace-service-attestation-and-cryptographic-trust#comment-a81300d7-254f-4ae7-b2f7-2f8f1204ea27), [EVE-250/cf103d23-9d8d-46fb-98f3-b456947158e7](https://linear.app/resnovas/issue/EVE-250/decide-controlled-cross-tenant-marketplace-gateway-architecture#comment-cf103d23-9d8d-46fb-98f3-b456947158e7).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Attested authorized workload plus every independent release gate is required; Restricted needs achieved A4 and Vault remains opt-in/client-controlled. Per-tenant processing consent, legal basis, verifier independence, decryption evidence and exact provider/crypto composition still require explicit conformance; later private-envelope scope approval supersedes only the older open scope clause.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-12

Application-layer envelope encryption for every private exchange

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T00:03:10.888Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-251](issues/EVE-251.md), [EVE-250](issues/EVE-250.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-251/86d01307-78cd-4ec6-9b91-ba2414789321](https://linear.app/resnovas/issue/EVE-251/decide-marketplace-service-attestation-and-cryptographic-trust#comment-86d01307-78cd-4ec6-9b91-ba2414789321), [EVE-250/eb60bd20-60cc-4e93-b44b-f66d214b287b](https://linear.app/resnovas/issue/EVE-250/decide-controlled-cross-tenant-marketplace-gateway-architecture#comment-eb60bd20-60cc-4e93-b44b-f66d214b287b).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Envelope-encrypt every private cross-tenant exchange in addition to authenticated transport and encryption at rest. Public exemption is restricted to intentionally published allowlisted projections with consent/provenance/revocation controls. Exact algorithms, libraries, key broker and signed-envelope representation remain separate approvals.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-13

Classification defaults: messages Sensitive; quotes, contracts, awards, invoices, payment evidence Restricted

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T00:15:11.244Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-251](issues/EVE-251.md), [EVE-250](issues/EVE-250.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-251/a2a18d4b-4965-4ab1-9da6-eab36244b322](https://linear.app/resnovas/issue/EVE-251/decide-marketplace-service-attestation-and-cryptographic-trust#comment-a2a18d4b-4965-4ab1-9da6-eab36244b322), [EVE-250/4cae40dc-9eb5-40c7-b0fd-40201234c261](https://linear.app/resnovas/issue/EVE-250/decide-controlled-cross-tenant-marketplace-gateway-architecture#comment-4cae40dc-9eb5-40c7-b0fd-40201234c261).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Messages default Sensitive; quotes/contracts/awards/invoices/payment evidence Restricted; attachments inherit the strongest parent. Restricted server decrypt needs achieved A4 and every gate; Vault is explicitly opted in, not silently downgraded for server processing. Validate classification propagation and deny unapproved profile weakening; no arbitrary lower tenant default is authorized.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-14

Marketplace KEKs under M-of-N, per-record DEKs, no universal decrypt key

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T00:36:30.920Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-251](issues/EVE-251.md), [EVE-250](issues/EVE-250.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-251/d42e2263-a1a3-4db9-bbce-2c69d215ebad](https://linear.app/resnovas/issue/EVE-251/decide-marketplace-service-attestation-and-cryptographic-trust#comment-d42e2263-a1a3-4db9-bbce-2c69d215ebad), [EVE-250/64bbd7e5-dc1c-47ac-aced-add8427a8657](https://linear.app/resnovas/issue/EVE-250/decide-controlled-cross-tenant-marketplace-gateway-architecture#comment-64bbd7e5-dc1c-47ac-aced-add8427a8657).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Use dedicated marketplace-service KEKs and unique versioned per-record DEKs under deployment M-of-N root governance, with separate signing/encryption and no universal decrypt key. Decide exact quorum membership, rotation/rewrap/recovery/escrow procedures, HSM/KMS provider and algorithm batch separately; no implementation or provisioning permission follows.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-15

Revocation, retention and lawful erasure

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T00:46:34.688Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-251](issues/EVE-251.md), [EVE-250](issues/EVE-250.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-251/304faca9-ecbb-4ce6-8255-20c771e2e1b9](https://linear.app/resnovas/issue/EVE-251/decide-marketplace-service-attestation-and-cryptographic-trust#comment-304faca9-ecbb-4ce6-8255-20c771e2e1b9), [EVE-250/dee7bd36-24be-4806-8f27-6e2f806561c1](https://linear.app/resnovas/issue/EVE-250/decide-controlled-cross-tenant-marketplace-gateway-architecture#comment-dee7bd36-24be-4806-8f27-6e2f806561c1).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Revoke new exchange and ordinary access immediately, retaining only independently lawful contractual/payment/audit evidence in purpose-limited audited lanes. Establish jurisdiction/lawful basis, retention schedules, erasure separation, overlapping participant obligations and legal holds before final key shredding. No universal retention duration or unilateral destruction of another party's required evidence is approved.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-16

Region-scoped marketplace cells, global replication limited to public projections

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T01:05:23.343Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-251](issues/EVE-251.md), [EVE-250](issues/EVE-250.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-251/2377819a-8c8c-4ba4-8c78-408ece1e0ca8](https://linear.app/resnovas/issue/EVE-251/decide-marketplace-service-attestation-and-cryptographic-trust#comment-2377819a-8c8c-4ba4-8c78-408ece1e0ca8), [EVE-250/47ac2058-6f81-41b4-8826-9751b577db28](https://linear.app/resnovas/issue/EVE-250/decide-controlled-cross-tenant-marketplace-gateway-architecture#comment-47ac2058-6f81-41b4-8826-9751b577db28).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Keep private ciphertext, keys, achieved-assurance decryption and security evidence regional; replicate only public projections and minimal nonsensitive routing globally. Exact cell regions, participant permitted-region policies, cross-region transfer/consent/legal basis and failover placement remain open; no silent private global fallback is authorized.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-17

Allowlisted public listing projections

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-66](issues/EVE-66.md), [EVE-75](issues/EVE-75.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Define and test an explicit public listing allowlist and supplier-controlled projection, excluding private stock, contacts and exact availability unless separately published. Apply publication consent, provenance, removal/revocation and source/version control. No additional numeric publication threshold is specified by the settled register row.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-18

Private two-party enquiry threads

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-119](issues/EVE-119.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Private enquiry threads are participant-scoped two-party exchanges, not shared searchable public discussions. Define participant grants, tenant isolation, profile/envelope handling, attachment inheritance and lawful retention. Exact message schema/retention and production security evidence remain unverified, not approved by this settled product requirement.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-19

Mixed-supplier awards with a separate contract, commitment and payment schedule per supplier

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-124](issues/EVE-124.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Each selected supplier retains a separate confirmed contract, commitment and payment schedule; preserve immutable quote/requirement versions and explicit award mapping. Partial selection of indivisible packages needs supplier-confirmed re-quote. Saga compensation, manual repair, inventory freshness and invoice reconciliation basis remain open concrete policies, not a global ACID transaction.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-20

Non-custodial connected-account payments, commission deducted by the provider, provider-neutral records

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-237](issues/EVE-237.md), [EVE-246](issues/EVE-246.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Use supplier-connected merchant accounts with provider-deducted platform commission and neutral PaymentRequest/transaction/refund/dispute/payout/commission records. Select exact provider/SDK/account/legal terms and production CommissionPlan rate/minimum/cap separately; five percent in proposed fixtures is test-only. Reconciliation/refund/dispute handling must prove noncustodial behavior; no legal or production-ingestion claim is established.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-21

A2 approval policy, A3 offline and scheduled execution, A4 audit availability

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-11-14T22:01:56.117Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-40](issues/EVE-40.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-40/fa3a5b15-87a8-4b1d-a41b-ea89e9beb12a](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema#comment-fa3a5b15-87a8-4b1d-a41b-ea89e9beb12a).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Historical proposal resolved for A2-A4 by the later explicit six-policy approval: bind human approval to principal/tenant/action/version/input hash/bounds/expiry, guard queued intents and scheduled execution with current checks, fail closed when protected durable audit is unavailable. Exact approval expiry, scheduler deadlines and bounded low-risk spool capacity remain unspecified and need implementation policy. The old proposal label does not reopen the settled policies.
- Superseded by: [approval-policy-a2](#approval-policy-a2), [guarded-offline-a3](#guarded-offline-a3), [audit-availability-a4](#audit-availability-a4). The older register proposal classification is superseded for these three foundation policies by the later EVE-40 approval; other proposal clauses do not acquire approval.

### architecture-22

S2 scarce-resource ledgers, S3 device schema and command envelope, S4 migrations and canonical values

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-11-14T22:01:56.621Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-42](issues/EVE-42.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [EVE-42/fe5c339d-4de7-4a46-a71e-a7ae0967f485](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-fe5c339d-4de7-4a46-a71e-a7ae0967f485).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Historical proposal resolved for S2-S4 by later explicit approval: authoritative ledgers/reservations/CAS, typed raw device tables and visible guarded envelopes, forward-only checksum expand/contract, UUIDv7 and portable temporal/exact-decimal values. Reservation/lease expiry, compatibility windows and production adapter/migration/device proof remain concrete follow-ups. Exact dependency approvals are separate and scope-limited.
- Superseded by: [scarce-resource-integrity-s2](#scarce-resource-integrity-s2), [offline-device-s3](#offline-device-s3), [forward-migrations-s4](#forward-migrations-s4). The older register proposal classification is superseded for these three foundation policies by the later EVE-42 approval; exact dependencies remain separately governed.

### architecture-23

M1 cell selection for cross-region exchange

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Proposed M1 selects a private exchange cell only where both tenants' permitted processing/storage regions and lawful transfer/consent policy overlap, otherwise blocks with remediation. Owner ratification, exact region/jurisdiction matrix, selection precedence and failure/failover behavior remain open before private cross-region exchange; EVE-23/EVE-40 are not blocked by this deferred choice.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-24

M2 canonical signed request envelope

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-251](issues/EVE-251.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Proposed M2 envelope fields include version, sender/service/tenant/participant/recipient, action/version/resource/purpose, payload digest, idempotency/correlation, issue/expiry/nonce/key IDs and attestation reference. Ratify exact schema, canonicalization, replay/freshness/key-rotation rules and independent verification before transport implementation; algorithms/libraries require separate approval.
- Superseded by: [platform-trust-concrete-parameters](#platform-trust-concrete-parameters). Superseded by the 2026-11-18 concrete parameter approval, which fixes the eventiva.m2.v1 schema, Ed25519, RFC 8785 and timing rules.

### architecture-25

M3 anti-fraud review floors

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Proposed M3 review floors cover payout-destination changes, first supplier payments, participant/grant changes, unusual award/refund patterns and profile downgrades. Ratify mandatory cases, explainable signals, jurisdiction/tenant monetary thresholds and review/appeal authority before fraud-sensitive settlement. No opaque autonomous adverse action or tenant lowering of mandatory floors is authorized by this proposal.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry.

### architecture-26

Freshness thresholds, compensation and manual recovery, invoice reconciliation basis, staff access to private records

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-250](issues/EVE-250.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Resolve availability/price freshness thresholds, compensation versus manual recovery after partial failure, invoice reconciliation against quote/award/receipt versions and exceptional staff access to private records. These remain explicit proposed policies; current sources provide no universal numeric freshness budget, staff plaintext exemption or completed reconciliation design.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry. Partially superseded on 2026-11-18 by platform-trust-concrete-parameters for its concrete crypto, custody, timing, freshness, recovery, reconciliation and default retention parts; remaining parts stay open.

### architecture-27

Exact region placement and jurisdiction mapping, per-jurisdiction lawful bases and retention schedules

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-250](issues/EVE-250.md), [EVE-251](issues/EVE-251.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Choose exact marketplace region/cell placement and jurisdiction mapping plus lawful processing bases, retention schedules, transfer safeguards and participant-consent rules. UK-default residency direction does not itself settle every cross-region exchange or legal schedule; obtain policy/legal validation before claims or activation.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry. Partially superseded on 2026-11-18 by platform-trust-concrete-parameters for its concrete crypto, custody, timing, freshness, recovery, reconciliation and default retention parts; remaining parts stay open.

### architecture-28

Vendors, payment provider, HSM or KMS, attestation verifier and evidence format, algorithms, package pins, paid services

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md).
- Implementation: The register and its supporting captured comments/specifications have been semantically reviewed. Recorded approval/settled/proposed scope is preserved; actual whole-issue implementation, target conformance and production acceptance have not been independently established by this planning review.
- Concrete outstanding parameters: Approve exact remaining payment/crypto/HSM/KMS/attestation providers, algorithms, evidence formats, versions and paid services only in their owning implementation batch. Existing separate foundation matrix, SQL-only batch, production Neon direction and Keycloak product selection do not approve arbitrary new packages/images or vendor operation; exact Keycloak component adoption remains blocked pending its security/provenance gate.
- Superseded by: None explicitly established in this record. No explicit whole-record supersession established in this curated entry. Partially superseded on 2026-11-18 by platform-trust-concrete-parameters for its concrete crypto, custody, timing, freshness, recovery, reconciliation and default retention parts; remaining parts stay open.

### one-client-runtime

Use one React Native client runtime on native and web, with one agent screen registry; learn upstream DOM behavior rather than porting its browser implementation.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:08:17.505Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [EVE-13/1bff877b-388d-4595-97cd-9d6b132ff5d2](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-1bff877b-388d-4595-97cd-9d6b132ff5d2).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: WebMCP remains a web-only projection; target-specific UI parity and device evidence still need verification.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### no-agent-sql

Agents use canonical actions rather than SQL tools; the accepted capability-map exclusions remain excluded until the owner changes them.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:08:17.505Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [EVE-13/1bff877b-388d-4595-97cd-9d6b132ff5d2](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-1bff877b-388d-4595-97cd-9d6b132ff5d2).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Changing an excluded capability requires a new explicit owner direction, not inferred upstream availability.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### phase-one-original-proposal

The original phase-one issue filing proposes actions, config, storage, identity, telemetry, events, HTTP, agent, inbound protocols, screens and collaboration as individual work packets.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:32:36.606Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [EVE-13/f5690bf0-5b5c-49d6-a789-ee7851abdd18](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-f5690bf0-5b5c-49d6-a789-ee7851abdd18).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Later approved ordering changes govern. This filing explicitly remains proposed and does not approve new dependencies.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### vendor-neutral-telemetry

Keep Effect spans/logs/metrics protocol-neutral, export OTLP directly without a collector, and provide product events/flags/error/LLM services behind replaceable integration layers and an off/no-op mode.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:46:00.372Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [EVE-13/ee36e764-71d9-4bb9-9069-da9c592cab10](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-ee36e764-71d9-4bb9-9069-da9c592cab10).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Native Hermes OTLP, endpoint smoke, early access and identity context have separate follow-ups; source decision is not a production-ingestion authorization.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### effect-ai-only

Eventiva uses Effect AI and Effect Schema through one authorized Action invocation path, without Zod, the AI SDK or the MCP SDK on main. The recorded Eventiva override sets aside the house AI-SDK-alongside-Effect rule.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:47:42.062Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [EVE-13/1c50bea8-cbf2-4cff-b089-ddaee70739a1](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-1c50bea8-cbf2-4cff-b089-ddaee70739a1).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Exact current dependency pins must come from the accepted foundation matrix; old0.33.x approval does not approve the later proposed upgrades/providers.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### effect-ai-upgrade-proposals

The same agent-stack decision proposes a later Effect upgrade, chat UI, provider selection and import enforcement; these follow-ups are not approved by the accepted Effect-AI-only boundary.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:47:42.062Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [EVE-13/1c50bea8-cbf2-4cff-b089-ddaee70739a1](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-1c50bea8-cbf2-4cff-b089-ddaee70739a1).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Reconcile later exact dependency approvals before selecting any version; no permission to upgrade from this proposal.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### posthog-preferred-platform

PostHog is the preferred telemetry/analytics/flags/replay/error/AI platform through Eventiva-owned neutral contracts, not embedded domain dependencies.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:49:39.693Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [EVE-13/12100a9e-2741-4b38-9901-16a79ca46c51](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-12100a9e-2741-4b38-9901-16a79ca46c51).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: A dedicated service project and native gaps require their own authorization/evidence; this historical decision reports the project was not yet created.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### cluster-base-and-order

Retain Effect Cluster as the server sharding/load-distribution base, addressing platform gaps before dependent agent-run work.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:55:45.695Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [EVE-13/6ee5fb20-83e4-4215-be8d-abb1bd00e6d6](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-6ee5fb20-83e4-4215-be8d-abb1bd00e6d6).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: The archived prototype and old versions are evidence only; later core-distribution direction and current matrix govern the fresh foundation.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### uk-residency-default

Hosted residency defaults to the UK with an initial EU alternative; self-hosted operators control location. Apply boundaries to databases, objects, backups, logs, replicas and derived data, not only primary storage.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:11:53.700Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/8b0b61d5-1c6c-478c-bfe0-70b14f8435c2](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-8b0b61d5-1c6c-478c-bfe0-70b14f8435c2), [EVE-244/2a13d176-df98-4266-b325-29f2033fbc14](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-2a13d176-df98-4266-b325-29f2033fbc14).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Cross-region transfer/failover/support needs explicit policy and lawful controls; region selection alone is not legal compliance.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### mixed-provider-uk-profile

Use a mixed-provider UK deployment profile: dedicated London tenant Postgres plus verified UK-region adapters for services unavailable there. Maintain a per-tenant data-flow/residency manifest and block noncompliant placement.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:16:29.468Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/53aea8ef-7e45-4807-8ac3-55467bd3b2c0](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-53aea8ef-7e45-4807-8ac3-55467bd3b2c0), [EVE-244/b2fb366f-6388-4cda-9763-e43c9e563107](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-b2fb366f-6388-4cda-9763-e43c9e563107).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Verify current capabilities, contracts/subprocessors, disclosure and change impact before residency claims or activation; this is not provisioning permission.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### deployment-key-authority

Deployment owners control root/key authority; cloud uses M-of-N custody and self-hosting has no hidden universal recovery key. Separate tenant/resource/record keys and provenance identities; applications receive scoped short-lived handles only.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:21:58.635Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/9e6e287a-4a28-4695-801a-23a0889f6a56](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-9e6e287a-4a28-4695-801a-23a0889f6a56), [EVE-244/e814ad76-03b5-4ca3-b9a9-776149ca2083](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-e814ad76-03b5-4ca3-b9a9-776149ca2083).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Choose audited crypto/providers separately; vault processing/recovery limitations, rotation, revocation and exceptional support access need explicit evidence.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### security-profile-semantics

Baseline, Sensitive, Restricted and Vault profiles vary authority, key scope, audit, retention, recovery and processing, never cryptographic strength. Every resource/field declares a core profile; mandatory classifications cannot silently weaken.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:23:11.047Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/c3a06adc-8c33-4a6c-b43c-815bb8479410](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-c3a06adc-8c33-4a6c-b43c-815bb8479410), [EVE-244/543be514-dd73-415d-99b0-e743676ce2d5](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-543be514-dd73-415d-99b0-e743676ce2d5).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Threat-model data flow and conformance before production; default protected accounting, identity and permission-policy records to Restricted.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### sealed-core-security-profiles

Only versioned core contracts define security-profile guarantees. Modules compose/request profiles, cannot redefine crypto or gain raw keys, and adapters fail closed when required capabilities are unavailable.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:24:38.979Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/08f09405-dbfb-4d5f-ac19-920cf95a98df](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-08f09405-dbfb-4d5f-ac19-920cf95a98df), [EVE-244/c8f85162-eb34-4a5c-8ce3-6d9c86c4257b](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-c8f85162-eb34-4a5c-8ce3-6d9c86c4257b).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Classification downgrades default forbidden; any allowed core-governed migration must prove safe reclassification and key/data transformation.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### case-scoped-support-recovery

Support has no standing plaintext access. Managed access is tenant-opt-in, case-scoped, ephemeral, independently authorized and audited, with automatic destruction/revocation; self-hosted recovery remains operator-controlled.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:28:36.652Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/63580da7-6f2c-4a8e-8509-79184b7126d1](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-63580da7-6f2c-4a8e-8509-79184b7126d1), [EVE-244/e983df5c-c16f-4adf-979a-c5fc23a84846](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-e983df5c-c16f-4adf-979a-c5fc23a84846).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Vault recovery requires an explicitly configured compatible quorum path; tenant opt-in alone cannot bypass high-risk independent authentication/approval.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### legal-hold-separate-from-decryption

A distinct deployment-governed legal-hold authority preserves in-scope ciphertext/evidence across stores, suspending destructive retention without granting plaintext access or recreating already erased data.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:35:26.449Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/9291cfc1-112d-4620-93cc-47b1a53048c0](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-9291cfc1-112d-4620-93cc-47b1a53048c0), [EVE-244/86b7857b-c9b0-4cc8-8690-d810cc001219](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-86b7857b-c9b0-4cc8-8690-d810cc001219).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Independent approvals, lawful-access cases, notices, overlap checks and adapter preservation proof remain required; missed reminders never auto-release a hold.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### four-decryption-gates

Non-exportable keys require independent identity/delegation, resource/purpose, workload-attestation and key-broker evidence before protected unwrap/decrypt; stale/revoked/uncertain evidence or unavailable audit fails closed.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:39:04.901Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/ebbcbe62-4eab-4919-9b33-03288c232e73](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-ebbcbe62-4eab-4919-9b33-03288c232e73), [EVE-244/eb3cc116-e095-463f-b190-dc5a4ccbe149](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-eb3cc116-e095-463f-b190-dc5a4ccbe149).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Exact attestation/provider/crypto details remain reviewed implementation choices; support/legal-hold/admin status bypasses no gate.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### assurance-levels

Use A1 verified software, A2 hardware-bound, A3 protected keys, A4 confidential workloads and A5 quorum/continuous high assurance. Sensitive defaults to A2 and Restricted server decryption to A4; achieved assurance requires evidence.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:47:42.252Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/6770565a-053c-47e6-8980-adab5ed9a109](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-6770565a-053c-47e6-8980-adab5ed9a109), [EVE-244/3e541ebd-3abe-46b1-bead-ea0df40c47e1](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-3e541ebd-3abe-46b1-bead-ea0df40c47e1).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Modules declare minimums and degraded behavior; deployment labels are not proof, and safety certification remains separate.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### community-assurance-override

Self-hosted owners may explicitly accept scoped, expiring degraded hardware assurance with repeated warnings, step-up, signed risk acceptance and audit; defaults remain fail-closed and achieved assurance is never upgraded by the override.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:53:27.521Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/9b5c6de1-9887-4af9-b760-4e8c9e1ebee2](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-9b5c6de1-9887-4af9-b760-4e8c9e1ebee2), [EVE-244/d5e6bc1e-708c-437e-8192-731a216c08a8](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-d5e6bc1e-708c-437e-8192-731a216c08a8).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Managed cloud cannot weaken mandatory profiles; non-overridable legal/safety floors persist, and Restricted API/agent use defaults to a private zero-trust access plane.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### zero-trust-all-surfaces

No role, device, network location or internal subnet is inherently trusted. Every surface uses the same identity/resource/purpose/tenant/assurance checks, default-deny access, short-lived identity and explicit egress.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T09:55:17.667Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/1da54684-89c0-4ce7-895c-aeec61af9c8a](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-1da54684-89c0-4ce7-895c-aeec61af9c8a), [EVE-244/2726745a-fe06-4d31-b0f9-71e7ed04ce71](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-2726745a-fe06-4d31-b0f9-71e7ed04ce71).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Private access adapters remain replaceable; community hardware overrides still require zero trust and narrowly audited emergency access.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### security-control-centre

Provide core-governed private-access setup and a security control centre that verifies effective posture, evidence freshness, drift and remediation. Public sensitive traffic requires HTTPS and risk-appropriate authentication; recognizable outbound phrases are not authentication.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T10:24:27.229Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/4571a167-a4fa-432c-b7c3-ed08747b363d](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-4571a167-a4fa-432c-b7c3-ed08747b363d), [EVE-244/20b80eb6-ef63-4a49-ad8c-df641e8b5fcd](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-20b80eb6-ef63-4a49-ad8c-df641e8b5fcd).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Preview and authorize external setup changes; support cryptographic message verification, not multiple static passwords as MFA, and never complete sensitive actions from untrusted links alone.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### sms-composite-authentication

SMS is never standalone authentication; default SMS use adds independent verified email and remains lower assurance than phishing-resistant methods. High-risk, Restricted, key/legal/support/export/permission actions cannot use SMS-plus-email to satisfy their floor.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T10:28:15.357Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/f9145bac-2b74-432e-8140-241f76206c0c](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-f9145bac-2b74-432e-8140-241f76206c0c), [EVE-244/549dc491-10f3-4808-88c0-487e42a1c4bb](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-549dc491-10f3-4808-88c0-487e42a1c4bb).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Rate limits, cooldowns, replay protection, private destinations and tenant strengthening remain mandatory; users may disable SMS.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### password-screening-and-response

Use long nontruncated passwords, no arbitrary composition/periodic rotation, current memory-hard salted storage and privacy-preserving replaceable breached-password screening. Reset on credible compromise evidence, not ordinary failed attempts alone.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T10:33:57.109Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/8d3b1098-8a28-4ccf-b99d-85d40923d0a7](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-8d3b1098-8a28-4ccf-b99d-85d40923d0a7), [EVE-244/6d00b89b-e5f0-46d9-b553-aec7cc87529b](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-6d00b89b-e5f0-46d9-b553-aec7cc87529b).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Minimum15 alone or8 with MFA, at least64 supported; breach lookups must not weaken storage or expose plaintext/suffixes. Account/email monitoring is separately transparent and opt-in.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### independent-commercial-dimensions

Treat software entitlement, hosting resources and support as independent dimensions. Free signed entitlements are first-class; security, portability, accessibility and safe shutdown are not paywalled or destroyed on expiry.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T15:15:32.208Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/8d02b5b9-6be8-4741-aade-eeda10169d1f](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-8d02b5b9-6be8-4741-aade-eeda10169d1f), [EVE-244/33ac9e73-cb3a-4cc9-afa3-17212cb2791e](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-33ac9e73-cb3a-4cc9-afa3-17212cb2791e).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Final commercial/permitted-use wording still needs legal approval; the linked working specification may hold further parameters not established by this comment.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### broad-community-baseline

Community retains a broad functional core, not an intentionally crippled edition. Monetize transparent managed resources/services/support; feature paywalls are exceptional and never weaken security, portability or accessibility.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T16:22:10.794Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/d68637af-5f23-41db-a89d-f0b15c0b6d7b](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-d68637af-5f23-41db-a89d-f0b15c0b6d7b), [EVE-244/d77691cb-ebe3-40ee-82dd-a199e4d72252](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-d77691cb-ebe3-40ee-82dd-a199e4d72252).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Exact included allowances, fair-use budgets and exceptional commercial/third-party restrictions require explicit documented costing/terms.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### resource-first-cloud-billing

Bill managed resources and explicit consumption rather than primarily active users, using transparent modest cost-plus infrastructure pricing and an immutable idempotent usage ledger reconciled to provider invoices.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T16:24:12.929Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/2a122c6c-85e9-445c-a453-bc699d66f303](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-2a122c6c-85e9-445c-a453-bc699d66f303), [EVE-244/b8f38ba1-41fe-4845-99d4-f8a80db0e43f](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-b8f38ba1-41fe-4845-99d4-f8a80db0e43f).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Exact prices/allowances await measured cost models; signed close, corrections/disputes, budgets/caps and independent synthetic evidence precede production charging.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### preexecution-cost-contract

Expensive canonical actions expose typed estimates, payer, uncertainty and limits before execution. Related-job splitting cannot bypass budgets; bind approval/reservations to maximum spend and requote material changes.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T16:25:34.329Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/9ab5c646-2e75-4090-9e6c-05b2ee63796e](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-9ab5c646-2e75-4090-9e6c-05b2ee63796e), [EVE-244/c144d4f9-07f0-4abd-b0b1-17a86ef7e355](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-c144d4f9-07f0-4abd-b0b1-17a86ef7e355).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: High-cost estimation failure must not silently proceed; reconcile estimate versus actual with privacy-safe evidence and explicit funding policy.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### support-severity-and-targets

Separate S0-S6 impact severity, request type and community triage. Community is best-effort without SLA; Standard/Priority/Critical response structures are provisional, not automatically contractual.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T16:28:55.360Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/aadb4993-fea3-40ce-8eab-32437285eb46](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-aadb4993-fea3-40ce-8eab-32437285eb46), [EVE-244/dc68c11e-a79f-4bff-8856-5b46381b7c77](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-dc68c11e-a79f-4bff-8856-5b46381b7c77).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Targets require sustainable staffing/monitoring evidence before contracts; initial S1 targets4business-hours/1covered-hour/30minutes and Critical S0 target15minutes remain provisional.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### entitlement-grace-defaults

Unregistered self-hosted unprotected Community needs no account/key or license telemetry. Registered Community uses renewable12-month grants and90-day offline grace; evaluation defaults30days and paid technical grace30days with safe read/export/security preservation.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T16:32:21.078Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/99632c95-04ff-4eb7-a512-aeb738a31bb3](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-99632c95-04ff-4eb7-a512-aeb738a31bb3), [EVE-244/3cce0c42-f3f9-4e40-8a61-2a7c96495ed6](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-3cce0c42-f3f9-4e40-8a61-2a7c96495ed6).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Evaluation warnings startday21; approved terms/security may alter paid grace. Hosted allocation and opaque abuse controls do not authorize self-hosted activity surveillance.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### sponsorship-separate-from-rights

Education/nonprofit/contributor self-hosting retains the broad Community rights; managed sponsorship is separate resource credit, not ownership of a project's data, entitlement or governance.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T16:33:29.311Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/1faf74b0-0d07-4a30-bf3b-f19b4ba0b821](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-1faf74b0-0d07-4a30-bf3b-f19b4ba0b821), [EVE-244/febc6151-fa26-4189-9036-e9e19c98154c](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-febc6151-fa26-4189-9036-e9e19c98154c).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Eligibility, allowances, renewal, appeals and conflict rules need publication/cost modelling; contributor value is not raw commit count.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### external-module-distribution

Permit external/private module distribution with commission only on Eventiva-processed transactions. Every installation channel retains signed bundles, quarantine, scanning/provenance, capability review, isolation and revocation; price never buys security clearance.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T16:50:19.935Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/73caf2a5-eadd-41cb-8a23-d51c65fa3d34](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-73caf2a5-eadd-41cb-8a23-d51c65fa3d34), [EVE-244/183b0835-2384-4c67-8945-7fab1486b2d2](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-183b0835-2384-4c67-8945-7fab1486b2d2).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Exact fees/payout/tax/refund policy remains open; optional build/hosting services are separate, external entitlements stay portable, data stays exportable after expiry.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### authoritative-notification-inbox

The encrypted in-app inbox is the communication source of truth; external channels carry delivery/escalation evidence, never falsely equating submission with delivery. Preserve canonical IDs, permissions, offline state, acknowledgement and audit across adapters.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T16:52:48.984Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/6bdae33b-bc21-4084-addf-fa6a540de91f](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-6bdae33b-bc21-4084-addf-fa6a540de91f), [EVE-244/3d9164a1-a6e5-48b8-9477-78c9f9c314b6](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-3d9164a1-a6e5-48b8-9477-78c9f9c314b6).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Quiet-hour overrides require narrow policy; channel retention/residency, budgets, cost estimates, degradation and sensitive-content minimization remain explicit.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### canonical-operational-taxonomies

Use stable coded taxonomies with versioned domain/tenant profiles, separate status/priority/risk/disposition families and governed transitions. Accessible text/code/icon and immutable requested-versus-confirmed provenance survive wording changes.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T18:57:27.217Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-71](issues/EVE-71.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/351ac51e-72a5-48f4-ad84-f60fa7f83023](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-351ac51e-72a5-48f4-ad84-f60fa7f83023), [EVE-71/c7865da9-d490-4fae-a4c0-f53f93c2cb68](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-c7865da9-d490-4fae-a4c0-f53f93c2cb68), [EVE-244/253784d7-0f52-41de-a943-5dee7bfad595](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-253784d7-0f52-41de-a943-5dee7bfad595).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Manifests specify forms, transition fields, acknowledgement/escalation levels, timeouts and offline conflicts; no unsupported emergency-standard claims.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### source-backed-operational-profiles

Model emergency/event terminology as versioned source-backed jurisdictional profiles over canonical concepts, not a universal hard-coded code set. Preserve authority, reuse rights, mappings, history and plain-language interoperability.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T19:09:48.188Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-71](issues/EVE-71.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/ca04d31a-1100-428a-a67d-398e1b7211ee](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-ca04d31a-1100-428a-a67d-398e1b7211ee), [EVE-71/3b8bd43f-58bb-4a3f-8eb5-3b561204cf4e](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-3b8bd43f-58bb-4a3f-8eb5-3b561204cf4e), [EVE-244/059e5b02-83b7-40ae-9004-d45d48012836](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-059e5b02-83b7-40ae-9004-d45d48012836).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Only public or properly licensed organizational guidance may be included; profile adoption does not establish affiliation, live-service suitability or safety certification.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### terminology-layer-original

Separate locale, domain vocabulary, operational communication profiles and organizational overrides with stable canonical identifiers and reconstructable source/profile versions.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T19:14:01.424Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-28](issues/EVE-28.md), [EVE-71](issues/EVE-71.md), [EVE-244](issues/EVE-244.md), [EVE-245](issues/EVE-245.md).
- Evidence: [EVE-13/aaccbbdf-40b3-43dc-99f9-78773ef8b1c9](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-aaccbbdf-40b3-43dc-99f9-78773ef8b1c9), [EVE-28/0e12aa2d-1d85-42a7-940a-31a3e4835b4c](https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent#comment-0e12aa2d-1d85-42a7-940a-31a3e4835b4c), [EVE-71/57141262-a413-49a2-9c73-5514ebb8c931](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-57141262-a413-49a2-9c73-5514ebb8c931), [EVE-244/09b1ea95-2d77-43a2-9115-0957eff14cbb](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-09b1ea95-2d77-43a2-9115-0957eff14cbb), [EVE-245/9f030b49-6392-4805-8e3a-8ef4bfd0c0e7](https://linear.app/resnovas/issue/EVE-245/build-the-integrated-training-competency-and-certification-platform#comment-9f030b49-6392-4805-8e3a-8ef4bfd0c0e7).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: The original personal terminology-selection clause is explicitly replaced by the following tenant-admin correction; locale/accessibility choices remain distinct.
- Superseded by: [tenant-controlled-terminology](#tenant-controlled-terminology). Only personal operational/domain profile selection is superseded, not the four-layer canonical model.

### tenant-controlled-terminology

Tenant admins select operational/domain terminology consistently; users may vary language/accessibility only without changing operational meaning. Govern event/channel exceptions, preview changes and retain historical profile versions.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T19:15:09.373Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-28](issues/EVE-28.md), [EVE-71](issues/EVE-71.md), [EVE-244](issues/EVE-244.md), [EVE-245](issues/EVE-245.md).
- Evidence: [EVE-13/612b8e91-8a9e-48d3-860c-9f3c9b566770](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-612b8e91-8a9e-48d3-860c-9f3c9b566770), [EVE-28/1c4b2cd5-0fc0-481d-9a08-02ebf0fa272c](https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent#comment-1c4b2cd5-0fc0-481d-9a08-02ebf0fa272c), [EVE-71/8aca2a3e-ae72-42de-a731-c29d7c5bd79e](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-8aca2a3e-ae72-42de-a731-c29d7c5bd79e), [EVE-244/31b28e86-4d8a-44c6-8b36-00768c5540b0](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-31b28e86-4d8a-44c6-8b36-00768c5540b0), [EVE-245/bd361840-0379-48ea-9dd6-73ffd38e469b](https://linear.app/resnovas/issue/EVE-245/build-the-integrated-training-competency-and-certification-platform#comment-bd361840-0379-48ea-9dd6-73ffd38e469b).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Cross-tenant collaboration shows canonical/plain-language equivalents; agents follow active tenant/event/channel vocabulary. This explicitly supersedes personal operational-profile selection.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### competency-not-permission

Distinguish participation, knowledge, assessor-signed practical competency and scoped operational authorization. Signed credentials can drive live conditional group eligibility, but do not themselves grant unrestricted roles or sensitive access.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T19:41:09.418Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-80](issues/EVE-80.md), [EVE-154](issues/EVE-154.md), [EVE-244](issues/EVE-244.md), [EVE-245](issues/EVE-245.md).
- Evidence: [EVE-13/9d6fe7ae-93ba-490f-9b71-6780cbb3a294](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-9d6fe7ae-93ba-490f-9b71-6780cbb3a294), [EVE-80/0ba7fcad-6e45-4dbd-8e9e-664d82a8b46b](https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave#comment-0ba7fcad-6e45-4dbd-8e9e-664d82a8b46b), [EVE-154/02ad23ba-d34a-43e9-b118-0d85f85c0322](https://linear.app/resnovas/issue/EVE-154/f135-build-qualifications-requirements-and-the-eligibility-check#comment-02ad23ba-d34a-43e9-b118-0d85f85c0322), [EVE-244/bd34471d-684c-4a17-9520-0a1652931952](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-bd34471d-684c-4a17-9520-0a1652931952), [EVE-245/6503ce79-31b1-405a-923e-5a5baf87d0ce](https://linear.app/resnovas/issue/EVE-245/build-the-integrated-training-competency-and-certification-platform#comment-6503ce79-31b1-405a-923e-5a5baf87d0ce).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Expiry/revocation/trust or training changes re-evaluate grants and assignments; high-risk scopes require independent practical/manager policy and agents cannot self-issue or self-approve.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### external-qualification-evidence

Credential validity, evidence verification and issuer trust are separate. Uploaded documents or OCR/AI extraction alone never establish authenticity or unlock protected operational access; retain named verification provenance and challenge/correction paths.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T19:44:42.582Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-80](issues/EVE-80.md), [EVE-154](issues/EVE-154.md), [EVE-244](issues/EVE-244.md), [EVE-245](issues/EVE-245.md).
- Evidence: [EVE-13/c91bfee6-c31f-47f4-8c38-31a16e727871](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-c91bfee6-c31f-47f4-8c38-31a16e727871), [EVE-80/f1b09e07-29d3-4ede-bce1-8c7845b78d87](https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave#comment-f1b09e07-29d3-4ede-bce1-8c7845b78d87), [EVE-154/cd295d73-fdcb-423c-b43a-a42b144ca20c](https://linear.app/resnovas/issue/EVE-154/f135-build-qualifications-requirements-and-the-eligibility-check#comment-cd295d73-fdcb-423c-b43a-a42b144ca20c), [EVE-244/e078604d-1469-4af1-ba02-e46e270855af](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-e078604d-1469-4af1-ba02-e46e270855af), [EVE-245/668fab6f-9c43-4e5e-b059-9f11eeed079b](https://linear.app/resnovas/issue/EVE-245/build-the-integrated-training-competency-and-certification-platform#comment-668fab6f-9c43-4e5e-b059-9f11eeed079b).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Tenant issuer registries, revocation refresh, minimization/residency, bounded low-risk provisional access and offline revalidation need explicit policy.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### assessment-no-core-proctoring

Keep invasive webcam/biometric/screen/AI cheating surveillance out of core assessment. High-risk eligibility relies on configured supervised competency, not guaranteed unaided quizzes; optional proctoring stays separately governed and off by default.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T19:48:04.499Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-154](issues/EVE-154.md), [EVE-245](issues/EVE-245.md).
- Evidence: [EVE-13/55486019-53cf-403f-bb95-846bf44179c2](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-55486019-53cf-403f-bb95-846bf44179c2), [EVE-154/2fe78df2-ac23-40bc-b174-5561be9ae844](https://linear.app/resnovas/issue/EVE-154/f135-build-qualifications-requirements-and-the-eligibility-check#comment-2fe78df2-ac23-40bc-b174-5561be9ae844), [EVE-245/72c52075-f89a-4fc3-84d7-df6e0371b7e1](https://linear.app/resnovas/issue/EVE-245/build-the-integrated-training-competency-and-certification-platform#comment-72c52075-f89a-4fc3-84d7-df6e0371b7e1).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Retain versioned questions/attempt rules, accessible accommodations, named assessors and appeals without treating accommodations as suspicious.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### training-version-impact

Published training versions and their completion evidence are immutable. Eventiva packs classify editorial/minor/material/critical impact with targeted retraining; tenant-authored impact consequences remain optional unless tenant policy requires them.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T19:51:43.742Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-80](issues/EVE-80.md), [EVE-154](issues/EVE-154.md), [EVE-245](issues/EVE-245.md).
- Evidence: [EVE-13/a67f0cf1-94b9-4dec-94f6-749c95b444df](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-a67f0cf1-94b9-4dec-94f6-749c95b444df), [EVE-80/2270be42-1fc6-4e2e-bec1-ad709eb02a44](https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave#comment-2270be42-1fc6-4e2e-bec1-ad709eb02a44), [EVE-154/12558fa6-7e78-4540-957e-cffd74cdaa6b](https://linear.app/resnovas/issue/EVE-154/f135-build-qualifications-requirements-and-the-eligibility-check#comment-12558fa6-7e78-4540-957e-cffd74cdaa6b), [EVE-245/cc371f77-4c6b-4ac2-ae98-cd0109db0745](https://linear.app/resnovas/issue/EVE-245/build-the-integrated-training-competency-and-certification-platform#comment-cc371f77-4c6b-4ac2-ae98-cd0109db0745).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Named publishers approve impact, AI only proposes; critical default floors cannot silently weaken, offline manifests preserve version/currentness and later reclassification is audited.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### cluster-core-topology

Use one cluster-capable authorized execution path in every edition: one local runner for Community and multiple independent processes for production. Topology is deployment configuration, not a second business engine.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T10:42:18.481Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [EVE-13/9695bf67-7b0a-4b6c-8614-34292999acbe](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-9695bf67-7b0a-4b6c-8614-34292999acbe).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Real distribution/drain/SIGKILL/recovery/idempotency tests, tenant isolation, truthful achieved redundancy and storage compatibility remain acceptance gates; no new dependency/spend authority.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### agent-native-acceptance-parity

Shared actions/data/screen state and UI-agent-protocol parity are mandatory acceptance criteria. Learn pinned upstream behavior without adopting its business engine; source audits do not prove all surfaces deployed.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T16:04:44.360Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md).
- Evidence: [EVE-13/91262654-d113-41b1-b909-b76ea750c95a](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and#comment-91262654-d113-41b1-b909-b76ea750c95a).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Screen awareness precedes inbound MCP/ACP after prerequisites; keep approved/implemented/tested/upstream/future matrix states separate and require actual cross-surface/negative fixtures.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### replaceable-foundation-providers

Foundation analytics, telemetry, flags, persistence, sync and other external services stay behind Eventiva-owned Effect contracts; OpenFeature and OpenTelemetry are neutral APIs with explicit provider capabilities.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T00:30:20.562Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-244/1a7a1810-8bc5-45d8-aa40-4c91bbe7e283](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-1a7a1810-8bc5-45d8-aa40-4c91bbe7e283).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: Preferred Postgres/Neon, SQLite, PowerSync and PostHog implementations must not become domain assumptions or expand archive-only reset scope.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### foundation-enrollment-clearance

The owner historically unblocked the foundation after house enrollment, retained direct-main delivery and the temporary AI-gate exception, and waived the manual five-ref push limit.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-13T13:43:58.704Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-244/f5d29c09-2424-4be4-9a93-fc21d2b11f84](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation#comment-f5d29c09-2424-4be4-9a93-fc21d2b11f84).
- Implementation: Recorded policy direction; whole-issue implementation and acceptance are not independently established by this source review.
- Concrete outstanding parameters: This dated clearance does not weaken current house/application gates or approve restoring retired AI-credit checks; later governance decisions still apply.
- Superseded by: None explicitly established in this record. No whole-record replacement established; subsequent refinements retain their own cited scope.

### fresh-foundation-not-archive

Rebuild the production foundation from current specifications; historical applications and private tests are reference evidence, not APIs or executable implementation baselines to preserve.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [EVE-244/description](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation).
- Implementation: The bodies report a completed archive/reset and later foundation work; this review verifies neither delivery nor acceptance.
- Concrete outstanding parameters: Fresh tests, archive exclusions, no production archive imports and idempotent setup remain required; do not reopen completed foundation issues merely to deliver later increments.
- Superseded by: None explicitly established in this record. Explicit reset direction replaces earlier extract-and-preserve wording, not retained architectural requirements.

### three-package-foundation-approval

Separate portable action specifications in contracts, domain/resource composition in schema, and Effect orchestration in runtime; feature modules own handlers and composition roots select vendor implementations.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-23](issues/EVE-23.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [EVE-244/description](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: Architecture approval is explicitly reported for November 14; it is not implementation authorization or completion evidence.
- Concrete outstanding parameters: Require acyclic explicit Nx type/layer/capability boundaries, portable client imports, tree-shakeable subpaths and safe registration/disposal; no drivers or vendor SDKs in portable packages/runtime.
- Superseded by: None explicitly established in this record. Explicitly replaces portable actions in schema, handlers embedded in client specifications and separate adapter business paths. Refines architecture-01 rather than duplicating its parity requirement.

### foundation-exact-dependency-approval

The foundation body reports approval of Node 24.22.3, pnpm 12.18.0, aligned Nx 24.0.5, TypeScript 6.0.3, Expo 56.0.24, React Native 0.85.3, React 19.2.3, Effect 3.22.4, Vitest 4.1.12 and @effect/vitest 0.30.1.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-244/description](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation).
- Implementation: Reported foundation version approval corroborated by authenticated foundation approval artifact revision3. The dependency matrix and three-package shape are approved; later action/storage recommendation sections are not blanket approvals. Installed package correctness and full acceptance were not rerun by this planning review.
- Concrete outstanding parameters: Localization/Hermes and OpenFeature/PostHog families are included without individual exact pins in this body. No @nx/react-native. OTel contracts only; exporters and storage/sync dependencies remain separate approvals. No service provisioning, spending or implementation start follows.
- Superseded by: None explicitly established in this record. Resolves the older select-exact-patches instruction only for the explicitly enumerated table; does not supersede architecture-28 for unrelated vendors/packages.

### synchronized-toolchain-and-foundation-controls

Use one synchronized Node 24 and exact pnpm toolchain across managers, setup and CI, with deterministic drift checks, real Effect/web-smoke tests and dependency-risk evidence.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-244/description](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation).
- Implementation: Requirements and ancillary approvals are reported, not tested by this source review.
- Concrete outstanding parameters: Align .node-version/.nvmrc/applicable .tool-versions, engines/packageManager and setup reports through one source/update command; no unpinned global pnpm. Approved controls include minimumReleaseAge, incompatible-major ignores, removal of unnecessary generator additions, audit/license reports and required application CI only when real tests exist.
- Superseded by: None explicitly established in this record. Replaces the legacy Node 22 baseline; exact approved pins are captured separately.

### effect-native-agent-framework-ownership

Eventiva owns its Effect-native action/server/auth/data framework; map upstream Agent-Native capabilities individually for build, integration wrapping, later port or omission rather than running its backend or rewriting everything at once.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-15](issues/EVE-15.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and).
- Implementation: The description explicitly reports the refined owner choice; historical upstream observations and spike outcomes are not fresh implementation proof.
- Concrete outstanding parameters: Read pinned upstream source, retain MIT attribution, prioritize capability ports and keep vendor boundaries in integration modules. House AI libraries complement Effect; every additional dependency still needs approval.
- Superseded by: None explicitly established in this record. The later framework-ownership paragraph expressly supersedes the earlier thin-adapter/as-is upstream-runtime interpretation, not architecture-01 capability parity.

### screen-awareness-and-action-registration

Agents must understand and invoke the user's visible interactions through registered actions and receive permission-filtered application/screen context, including module activation and disposal.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-50](issues/EVE-50.md), [EVE-259](issues/EVE-259.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: Confirmed behavioral requirement; no UI/agent/native parity inferred from server inventory or DOM-only fixtures.
- Concrete outstanding parameters: Navigation/selection/focus, visible rendered terminology, safe masking and no hidden-state leakage are required. The five-part proposed projection/CI mechanism still needs validation and is not promoted to a separately approved implementation merely by proximity.
- Superseded by: None explicitly established in this record. Extends architecture-01 operation parity to readable UI context without granting additional authority.

### versioned-protocol-conformance-and-dual-acp

Inventory and test the pinned upstream connection/execution surface, with explicit Eventiva requirements for HTTP, MCP, webhooks and both inbound and outbound ACP.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-15](issues/EVE-15.md), [EVE-49](issues/EVE-49.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and).
- Implementation: A versioned conformance matrix is required; upstream support and Eventiva implementation are not interchangeable claims.
- Concrete outstanding parameters: Include applicable A2A/CLI, teams, schedules/events, skills/memory and streaming/cancel/resume. Distinguish upstream-native support, Eventiva adapters, provider limitations and missing required methods; ACP/webhooks are requirements rather than verified upstream facts.
- Superseded by: None explicitly established in this record. Explicit both-direction ACP requirement is not satisfied by the observed upstream outbound-only implementation.

### powersync-yjs-selected-sync-and-revocation

Use self-hosted PowerSync Open Edition with Postgres bucket storage for records and Yjs row-carried updates for text/canvas; destroy documents, editors and presence immediately when bucket access is lost.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-17](issues/EVE-17.md), [EVE-51](issues/EVE-51.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and).
- Implementation: The body explicitly reports the November 9 selection and limited historical device/web evidence; this is not acceptance of the reset production sync stack.
- Concrete outstanding parameters: Design/test record and document editing together through shared permission/action/audit paths. Canvas conflict order is CRDT merge order, not last arrival. Native iOS, Safari/WebKit and Neon replication are named unverified checks in that historical report. Electric/TanStack is a conditional license fallback, not simultaneous approval to switch.
- Superseded by: None explicitly established in this record. Resolves earlier sync-engine evaluation wording. Refines offline-consistency-classes; cdc-cost-and-compatibility still governs later CDC trials and spend.

### external-cross-platform-component-ownership

Rambo-UI is the separate cross-platform component library; Eventiva consumes and binds it rather than maintaining a duplicate library or porting an upstream DOM toolkit.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-259](issues/EVE-259.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: The description reports an owner decision; the later modular checkpoint explicitly has only an injected renderer seam, not real Rambo/native proof.
- Concrete outstanding parameters: The library build approach remains open. Neutral interaction/projection hooks are a proposal, not approval of a specific integration API. The delivered packages/ui-modules move preserves interpreter ownership, not a new component library.
- Superseded by: None explicitly established in this record. Replaces Eventiva-local component-library ownership; does not silently select new renderer dependencies.

### effect-cluster-multirunner-topology

Use horizontally distributed Effect Cluster execution with explicit shard ownership, load distribution, graceful drain and runner-loss recovery; prioritize sharding rather than weakening it for agent convenience.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-252](issues/EVE-252.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: Historical two-runner spike evidence is acknowledged but does not prove distributed recovery in the reset tree.
- Concrete outstanding parameters: Require at least two independent runners, documented ordering/retry/idempotency/persistence and bounded telemetry. Compute sharding does not select physical database partitioning; process-local leases are not durable fencing or exactly-once proof.
- Superseded by: None explicitly established in this record. Adds concrete topology requirements beyond portable-topology without changing tenant-database-default.

### single-app-hybrid-desktop-and-complementary-updates

Deliver one role/module-aware application per platform on shared React Native/Expo UI, with hybrid desktop shells and narrow native bridges; OTA and runtime federation are complementary update mechanisms.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-16](issues/EVE-16.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and).
- Implementation: Confirmed direction, not evidence that Expo/Re.Pack/federation/desktop combinations work together.
- Concrete outstanding parameters: Exact desktop shell is undecided. Require signed manifests, compatibility checks, staged rollout/rollback and known-good offline fallback; native capability/binary/bridge changes need releases. Federation targets are subject to compatibility proof, not automatic dependency approval.
- Superseded by: None explicitly established in this record. No unconditional no-rebuild or universal native-hot-swap promise is authorized.

### open-declarative-module-ecosystem

Keep private/community modules open to direct tenant installation without official catalogue approval; ordinary immediate activation uses a versioned cross-platform declarative schema over already installed capabilities.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-259](issues/EVE-259.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: Reported owner openness/activation decision; injected data-only interpreter evidence does not establish executable isolation or native support.
- Concrete outstanding parameters: Catalogue is discovery/trust metadata, not functional gate. Tenant consent, scoped capabilities, provenance, audit, revocation and rollback remain mandatory. Canonical schema is neither raw XML nor browser HTML; executable/native tiers remain subject to module-execution-tiers and platform policy.
- Superseded by: None explicitly established in this record. Adds ecosystem/governance and canonical-format requirements without duplicating module-execution-tiers.

### module-localization-terminology-and-package-envelope

Every module carries validated localization, offline locale bundles and canonical terminology contracts alongside its actions, permissions, data, screens, flags, telemetry and lifecycle declarations.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-244](issues/EVE-244.md), [EVE-259](issues/EVE-259.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [EVE-244/description](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: Explicit foundation/specification requirement; not independently verified approval of each package-envelope field or delivered validation.
- Concrete outstanding parameters: Missing defaults/keys and hard-coded strings fail validation; language and tenant vocabulary remain separate. Canonical IDs do not change with labels. Full distribution envelope is not KernelManifest alone and requires an explicit compatibility adapter rather than unchecked extra fields.
- Superseded by: None explicitly established in this record. typed-feature-controls covers flag policy; this record adds localization, terminology and envelope completeness only.

### vendor-neutral-observability-and-local-bootstrap-sinks

Remove core Sentry coupling, use central vendor-neutral Effect/OpenTelemetry instrumentation with PostHog as default product adapter, and provide safe bootstrap logging plus multiline console, bounded date-rotated file and test sinks.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-44](issues/EVE-44.md), [EVE-244](issues/EVE-244.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [EVE-244/description](https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: Owner telemetry direction and local sink requirements are reported. Specific buffer/file defaults and isolated test counts are implementation checkpoints, not new owner-approved parameters or production ingestion evidence.
- Concrete outstanding parameters: Require per-target capability verification, bounded nonblocking failure, safe correlation, privacy/consent/masking and no duplicate reload instrumentation. Missing ingestion paths return for decision; no exporter/package/provisioning permission follows. Mandatory audit remains separately governed by universal-audit/audit-availability-a4.
- Superseded by: None explicitly established in this record. Historical direct-OTLP spike mention is not fresh production-export approval; optional telemetry opt-out never disables mandatory audit.

### modular-kernel-explicit-providers-and-safe-lifecycle

Use a minimal composable kernel with explicit named provider bindings, scoped lifecycle, immutable workflow pins and safe compatible hot replacement or restart refusal; never guess a provider or repin active work.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-257](issues/EVE-257.md), [EVE-261](issues/EVE-261.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: The body explicitly reports approved central principles. Exact numeric versions, eight states, ten operations, ProviderKey and API freeze are recorded implementation contracts, not independently sourced approval of every field.
- Concrete outstanding parameters: Resolve declared exact capabilities only; validate complete graph before publication, isolate candidate scope, preserve old generation on failure, dispose once and reject leased mutation. Kernel executes no SQL or second workflow engine. Retire/unregister/deactivate preserve data. Persisted distributed recovery remains separate proof.
- Superseded by: None explicitly established in this record. state-aware-migrations and forward-migrations-s4 continue to govern schema compatibility; local lifecycle receipts do not supersede their evidence requirements.

### central-resources-and-privileged-evolution

Feature modules use one typed database-neutral Resources API; privileged adapters alone own migrations, tenant/client binding and immutable resource/schema history, with no direct or transitive feature SQL access.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-42](issues/EVE-42.md), [EVE-258](issues/EVE-258.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: Strict central DB API is explicitly reported as owner-approved; two-provider transaction guard results are checkpoint claims, not independently rerun tests.
- Concrete outstanding parameters: Preserve field ownership, current caller/tenant/revocation and A1's same-client transaction. Reject foreign ambient transactions before disclosure. Additive fields preserve data/security floors. Existing schema helpers adapt to one canonical model; JSON extension storage does not replace raw typed device tables. SQL reachability gates resolve aliases/reexports/type-only/transitive edges.
- Superseded by: None explicitly established in this record. Adds central API ownership and ambient-client isolation detail beyond architecture-02/04 and forward-migrations-s4; broad field-designer scope remains separate.

### committed-observation-only-governed-hooks

Hooks observe committed facts and may request separately authorized additive work; they never veto or rewrite source operations, bypass approval, control transactions or expose protected execution.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-45](issues/EVE-45.md), [EVE-262](issues/EVE-262.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: Observation-only and protected-event principles are explicitly reported approvals. Process-local dispatch/tests and default-off flags do not establish SQL outbox durability.
- Concrete outstanding parameters: One durable event engine; transactional staging, exact revision/generation pins, per-attempt permission checks, fenced leases, bounded ordered delivery, dedup and audited replay. Initial decrypt/emergency hooks and financial additive dispatch are denied; protected executable observers are denied. Observer failure/retry cannot fail or rerun source work. At-least-once delivery needs idempotent effects/reconciliation.
- Superseded by: None explicitly established in this record. Trust profiles/four release gates remain covered by architecture-05 through architecture-09 and trust-architecture-reconciled; module installation grants no release exemption.

### acyclic-exact-types-g15-gate

Reject direct and indirect static/runtime dependency cycles and type escapes, preserving exact Effect Schema input/output/error/environment contracts before shared integration.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-263](issues/EVE-263.md), [EVE-261](issues/EVE-261.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: Explicitly described as a new binding owner quality gate; earlier green focused tests do not grandfather existing violations.
- Concrete outstanding parameters: Cover type-only/alias/reexport/generated/dynamic source edges and runtime provider graphs, with cycle negatives and shared-contract/diamond positives. No any, exposed unknown, unsafe casts, erased placeholders or diagnostic suppression. Unavoidable private vendor opacity needs narrow decoding and explicit review, not automatic exemption. Existing exact-location findings are historical audit evidence, not a new code review.
- Superseded by: None explicitly established in this record. Adds conjunctive G15 to G01-G14 rather than reopening completed foundation issues or permitting integration-first cleanup.

### verified-ready-historical-banner-reference

The first reference extension preserves the exact historical startup word-art and copyright through the central structured logger only after verified platform readiness; it is a template, not an editor.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-260](issues/EVE-260.md), [EVE-261](issues/EVE-261.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: Explicit owner-mandated end-to-end proof remains gated. Historical fixture bytes and actual banner delivery were not inspected in this source-only review.
- Concrete outstanding parameters: Register observer before ready but emit nothing on construction/activation/failure; independently derive fixture bytes, verify Eventiva/by-Resnovas/copyright order and logical dedup per runtime/generation. Resource contribution, authorized status UI, provider coexistence and recovery evidence are template requirements. Physical console crash gaps require sink evidence, not in-memory exactly-once claims.
- Superseded by: None explicitly established in this record. Explicitly excludes invented replacement art, an editable word-art product and resurrected archive hook behavior.

### scoped-modular-review-before-main-hold

For the modular-platform increment, owner approval of the detailed brief and review gates precedes shared integration and main delivery; isolated authorized lanes do not authorize exports, settings, dependencies or production changes.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-261](issues/EVE-261.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: Historical scoped hold, not a current request for separate main-delivery permission. The later original owner messages expressly release that approval gate for verified ready repository work only; no production or dependency authorization follows.
- Concrete outstanding parameters: Retain verified tests/security/integration gates and genuine product/architecture escalation; production/settings/secrets/infrastructure/spending/exact new dependencies remain separately controlled. Do not apply this old hold to block ready repository delivery.
- Superseded by: [verified-recovery-main-gate-release](#verified-recovery-main-gate-release). Explicit partial release verified in original origin:human owner messages https://ampcode.com/threads/T-01a189ae-399d-7162-9765-4488b9600016#M-034yK7dqD8FfEXQCkvRC8t at2026-11-16T01:36:34.954Z and https://ampcode.com/threads/T-01a189ae-399d-7162-9765-4488b9600016#M-034yTJM7UC975J1PtN46wQ at2026-11-16T07:51:01.844Z. These supplemental message timestamps do not replace mirrored description creation-time unknowns.

### conjunctive-platform-acceptance-and-bounded-checkpoints

Full modular-platform acceptance requires the combined G01-G15 evidence ledger and owner review; isolated tests and bounded checkpoints clear only the exact scenarios they demonstrate.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-261](issues/EVE-261.md), [EVE-260](issues/EVE-260.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: The November 17 checkpoint reports PostgreSQL/SQLite producer-journal recovery and fixture-intercepted export checks, superseding only those previously unrun bounded scenarios. No acceptance inferred from the report.
- Concrete outstanding parameters: Require composition/provider portability, boundaries, resource evolution, lifecycle/workflow safety, protected non-disclosure, secret-canary serialization, correlated sinks, bootstrap failure, ready/banner, crash/audit, rendered parity, deterministic repository gates and exact types. Automatic mutation producers, ingestion, native/device/Rambo support and broad durable/distributed claims remain separately unverified. Lower-level checkpoints need not wait for every broad product issue.
- Superseded by: None explicitly established in this record. Later bounded evidence updates earlier unrun-check claims without replacing conjunctive acceptance. The separately verified original owner release removes the earlier main-delivery permission hold only for verified ready repository work, not production acceptance.

### marketplace-saga-and-indivisible-package-requote

Coordinate mixed-supplier awards as a recoverable saga, not one global ACID transaction; selecting part of an indivisible supplier package requires a supplier-confirmed re-quote.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-250](issues/EVE-250.md), [EVE-124](issues/EVE-124.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md).
- Implementation: Requirements are stated in the architecture narrative; no exact matching owner comment was independently established in this restricted review.
- Concrete outstanding parameters: architecture-19 already covers separate contracts/commitments/payment schedules; architecture-26 retains unresolved compensation/manual recovery, freshness and reconciliation choices. No provider or cross-tenant distributed transaction is selected here.
- Superseded by: None explicitly established in this record. Adds the non-global-ACID and indivisible-package constraint, not another duplicate mixed-award record.

### architecture-record-source-precedence-and-reconciliation

Architecture diagrams record decisions rather than make them: preserve linked owner provenance, proposal markings and the current repository replacement/index for the unavailable historical infrastructure document.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-250](issues/EVE-250.md), [EVE-251](issues/EVE-251.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md), [EVE-250/description](https://linear.app/resnovas/issue/EVE-250/decide-controlled-cross-tenant-marketplace-gateway-architecture), [EVE-251/description](https://linear.app/resnovas/issue/EVE-251/decide-marketplace-service-attestation-and-cryptographic-trust).
- Implementation: Document maintenance contract only; no new owner decision is inferred from diagram color, register labels or implemented APIs.
- Concrete outstanding parameters: The 2026-11-17 owner-directed source reconciliation designates docs/architecture/eventiva-platform-and-marketplace.md as the current replacement/index below applicable Linear owner decisions and above derivative sheets. The original remains unavailable and unread, not recovered. Historical missing-source/archive statements are explicitly superseded for current source status, not edited. EVE-250 91db949b and EVE-251 15483735, dated 2026-11-16, govern bounded architecture/provider-neutral implementation. Concrete composition and policy parameters remain gated. The modular spec has its own scoped source hierarchy; no universal precedence rule is invented.
- Superseded by: None explicitly established in this record. Replacement designation resolves the missing-file blocker, not original recovery, new approval, implementation acceptance or production authorization. Source: Jonathan's 2026-11-17 Puck reconciliation instruction; exact instruction time unavailable.

### single-location-collector-contract

Reuse one operations-owned device-location collector and consent path for active units and opted-in crew on current live-event shifts; maps render role-filtered unit and crew layers from that stream rather than collecting again.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-181](issues/EVE-181.md), [EVE-205](issues/EVE-205.md).
- Evidence: [EVE-181/description](https://linear.app/resnovas/issue/EVE-181/f710-build-live-unit-positions-on-the-event-map-with-consent-and), [EVE-205/description](https://linear.app/resnovas/issue/EVE-205/f109-crew-positions-layer-and-as-built-reporting).
- Implementation: Cross-feature agreement is reported in the descriptions; no collector, consent flow, device test or owner implementation authorization was independently verified.
- Concrete outstanding parameters: Validate shift/consent revocation behavior, staleness and event audience grants; reporting intervals and the described 30-day default/90-day maximum retention require policy validation, not assumed approval.
- Superseded by: None explicitly established in this record. Replaces a second F10 collector design at the ownership level only; no whole-contract supersession established.

### purchasing-accounting-ownership-contract

Inventory owns purchase requests, purchase orders and receiving; accounting owns supplier bills and postings. Emit goods-received evidence per receipt and keep period valuation export a separate contract.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-187](issues/EVE-187.md), [EVE-190](issues/EVE-190.md), [EVE-63](issues/EVE-63.md), [EVE-69](issues/EVE-69.md).
- Evidence: [EVE-187/description](https://linear.app/resnovas/issue/EVE-187/f68-build-purchasing-supplier-products-requests-orders-receiving-and), [EVE-190/description](https://linear.app/resnovas/issue/EVE-190/f611-build-stock-valuation-asset-depreciation-and-the-per-period).
- Implementation: Descriptions report an inter-feature agreement; receipt and valuation payload acceptance and actual journals remain unverified.
- Concrete outstanding parameters: Obtain the stated F11 confirmation of inventory:goods_received and inventory:valuation_exported schemas; validate reconciliation and prevention of duplicate postings. Straight-line depreciation and average-cost methods are recommendations here, not extracted owner approvals.
- Superseded by: None explicitly established in this record. No replacement established; preserve the distinction between receipt events and period exports.

### sales-accounting-event-boundary

Sales emits order-paid, refund-completed, payment-fee, payout-settled and register-session-closed evidence; accounting owns journal postings, invoices and tax codes and reports invoice settlement back to sales.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-222](issues/EVE-222.md), [EVE-107](issues/EVE-107.md), [EVE-69](issues/EVE-69.md).
- Evidence: [EVE-222/description](https://linear.app/resnovas/issue/EVE-222/f911-build-receipts-reconciliation-sales-reporting-and-accounting).
- Implementation: Reported contract agreement only; no shared-schema test, reconciliation run or provider payout integration was verified.
- Concrete outstanding parameters: Confirm the five event payloads and invoice-settlement correlation with F11; prove exact totals, idempotency and treatment of unforwarded offline payments before acceptance.
- Superseded by: None explicitly established in this record. No replacement established; the reported agreement does not authorize a payment vendor.

### commercial-record-ownership-contract

Keep CRM enquiries and opportunities in contacts, quotes and hire pricing in sales, equipment availability and reservations in inventory, and invoices in accounting; compose these owners for accepted hire quotes rather than duplicate records.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-225](issues/EVE-225.md), [EVE-63](issues/EVE-63.md), [EVE-65](issues/EVE-65.md), [EVE-69](issues/EVE-69.md), [EVE-107](issues/EVE-107.md).
- Evidence: [EVE-225/description](https://linear.app/resnovas/issue/EVE-225/f914-build-quotes-deposits-and-equipment-hire-orders).
- Implementation: Description reports F4/F6 agreements; no accepted quote, deposit transaction, inventory reservation or invoice delivery was verified.
- Concrete outstanding parameters: Confirm reservation/commit/release period contract, quote-to-order correlation and invoice handoff; deposit percentages, hire multipliers and damage-charge handling remain specification parameters, not approved financial commitments.
- Superseded by: None explicitly established in this record. No replacement established; scope boundary is separate from implementation permission.

### one-cross-product-rules-engine

Add the approved task rule builder on one domain-neutral rules engine and extend that same engine across Studio and other feature sets, rather than create a second Studio automation engine or authorization model.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-62](issues/EVE-62.md), [EVE-191](issues/EVE-191.md), [EVE-235](issues/EVE-235.md).
- Evidence: [EVE-191/description](https://linear.app/resnovas/issue/EVE-191/f145-automations-extend-the-f3-rules-engine-across-every-feature-set), [EVE-235/description](https://linear.app/resnovas/issue/EVE-235/f310-build-the-task-rule-builder-when-x-then-y-on-a-generic-rule).
- Implementation: Descriptions attribute the rule-builder choice to the owner and record the shared-engine design; EVE-235 expressly remains planning-only until implementation is requested.
- Concrete outstanding parameters: Ratify proposed wait/approval/branch/agent extensions with the rules owner; validate runtime-owner permission checks, rule-safe registration and emergency human-initiation exclusions. Preview count 20 and loop depth 5 are specification values, not separately approved owner decisions.
- Superseded by: None explicitly established in this record. EVE-191 explicitly drops the earlier separate Studio service-principal engine and studio.automations action family; the later SOP boundary refines, rather than replaces, this shared-engine requirement.

### independent-ticket-seat-editor-scope

Build reserved-seating editing in ticketing now rather than wait for site maps; a site map may later serve as a read-only backdrop without owning seat inventory.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-76](issues/EVE-76.md), [EVE-211](issues/EVE-211.md).
- Evidence: [EVE-211/description](https://linear.app/resnovas/issue/EVE-211/f811-build-the-seat-map-editor-and-reserved-seating-in-f8).
- Implementation: Description explicitly attributes option D3(b) to the owner; this is product scope, not evidence that editor, holds or concurrency tests exist.
- Concrete outstanding parameters: Complete required rendering spike and shared-port readiness; validate sold-seat immutability, concurrent reservations, accessible picker and collaborative plan editing. The listed 2000/5000-seat targets are acceptance targets, not measured capacities.
- Superseded by: None explicitly established in this record. Replaces waiting for F10 as a prerequisite for owning the editor, but retains the explicit shared-rendering-port dependency.

### seat-map-shared-rendering-direction

Reuse the selected MapLibre-backed map-engine port and metric site-local frame for seating rather than add an independent rendering library; prove the rendering approach through the named spike.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-108](issues/EVE-108.md), [EVE-120](issues/EVE-120.md), [EVE-211](issues/EVE-211.md), [EVE-238](issues/EVE-238.md).
- Evidence: [EVE-211/description](https://linear.app/resnovas/issue/EVE-211/f811-build-the-seat-map-editor-and-reserved-seating-in-f8).
- Implementation: Owner engine choice is explicitly attributed in the description; linked spike results and dependency authorization were not independently checked.
- Concrete outstanding parameters: Resolve the description's custom-Skia fallback only if the approved spike outcome calls for it; no permission to introduce another library follows from that fallback mention. Prove plan-only rendering and native/web support.
- Superseded by: None explicitly established in this record. No replacement established; do not confuse independent seating-domain ownership with a second canvas engine.

### directory-quote-commission-at-source

Support paying accepted directory quotes through the shared sales payment path and deduct platform commission at capture, rather than build a separate directory payment integration.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-66](issues/EVE-66.md), [EVE-124](issues/EVE-124.md), [EVE-174](issues/EVE-174.md), [EVE-215](issues/EVE-215.md), [EVE-223](issues/EVE-223.md), [EVE-237](issues/EVE-237.md).
- Evidence: [EVE-223/description](https://linear.app/resnovas/issue/EVE-223/f912-build-vendor-sales-at-events-with-split-payments), [EVE-237/description](https://linear.app/resnovas/issue/EVE-237/f514-build-quote-payments-with-commission-deducted-at-source).
- Implementation: Both descriptions explicitly attribute commission-at-source choice to the owner; no provider, account, SDK, real payment or sandbox acceptance was verified.
- Concrete outstanding parameters: Select and approve the provider separately; set actual production CommissionPlan rate/minimum/cap and effective dates, validate tax-exclusive base and fee reversal, and confirm onboarding/verification/terms prerequisites. The 5 percent value is test-only.
- Superseded by: None explicitly established in this record. Settles product payment direction, not the gateway description's still-pending vendor approval or every detailed commission exception.

### quote-payments-noncustodial-contract

Route quote payments to the vendor's connected merchant account, take commission as the platform fee and keep customer funds outside an Eventiva-held balance; accounting in the operator tenant issues commission invoices.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-126](issues/EVE-126.md), [EVE-174](issues/EVE-174.md), [EVE-223](issues/EVE-223.md), [EVE-237](issues/EVE-237.md).
- Evidence: [EVE-223/description](https://linear.app/resnovas/issue/EVE-223/f912-build-vendor-sales-at-events-with-split-payments), [EVE-237/description](https://linear.app/resnovas/issue/EVE-237/f514-build-quote-payments-with-commission-deducted-at-source).
- Implementation: Reported cross-feature money-flow contract only; the source expressly leaves non-custody claims subject to selected-provider terms. No legal conclusion or implementation proof is inferred.
- Concrete outstanding parameters: Confirm merchant-of-record and regulated-provider terms, capture/refund/dispute correlation by PaymentRequest and monthly invoice reconciliation; approve any non-refundable deposit-commission exception separately.
- Superseded by: None explicitly established in this record. Consistent in direction with existing architecture-20; retain as source-specific supporting contract rather than replacing or broadening that catalogue record.

### unclaimed-seeded-directory-scope

Allow platform staff and organisers to seed unclaimed business listings that the businesses can claim later, rather than restrict the directory to self-published claimed listings.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-66](issues/EVE-66.md), [EVE-236](issues/EVE-236.md).
- Evidence: [EVE-236/description](https://linear.app/resnovas/issue/EVE-236/f513-build-seeded-listings-claiming-claim-disputes-and-removal).
- Implementation: Description explicitly attributes D5-1(b) to the owner despite the overall proposed status. No seeding, invitation, dispute or removal workflow was verified.
- Concrete outstanding parameters: Validate public-business-only field allowlist, exclusion of individual professionals, moderation and domain-claim proof, removal/do-not-seed matching, invitation legality/suppression and claimed-owner transfer. Numeric deadlines/caps and data licences remain specification and approval work; no scraping or bulk-source permission is inferred.
- Superseded by: None explicitly established in this record. Extends directory product scope only; does not approve a data vendor, licensed dataset or bulk import.

### maps-cover-buildings-and-custom-venues

Site planning must cover arenas, buildings, custom structures and festivals, not merely outdoor street-map overlays.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-108](issues/EVE-108.md), [EVE-120](issues/EVE-120.md), [EVE-238](issues/EVE-238.md).
- Evidence: [EVE-238/description](https://linear.app/resnovas/issue/EVE-238/f1012-venue-and-building-plans-arenas-halls-custom-structures-and).
- Implementation: Description includes a specifically attributed owner instruction; no plan-only, arena, import or indoor-route test was independently verified.
- Concrete outstanding parameters: Prove blank metric-canvas mode, levels and anchoring without geometry drift; approve any DXF/IMDF parsing dependencies and validate cross-level accessible routes. Detailed element list and import formats are the proposed implementation response, not all separately owner-selected.
- Superseded by: None explicitly established in this record. Refines map scope beyond an outdoor-only interpretation without replacing shared map/space ownership.

### performance-reviews-in-hr-scope

Include worker performance reviews in the HR feature set rather than omit that capability from HR scope.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-80](issues/EVE-80.md), [EVE-239](issues/EVE-239.md).
- Evidence: [EVE-239/description](https://linear.app/resnovas/issue/EVE-239/f1310-build-performance-reviews-goals-and-feedback).
- Implementation: Description explicitly attributes option 7(b) to the owner; no review cycle, personal-data processing or drafting engine was verified or authorized by this review.
- Concrete outstanding parameters: Validate review/feedback access and human-only submission, retention schedule and legal basis, optional repeat-freelancer ranking exposure and agent-drafting data constraints. Six-year retention and rating-derived crewing are proposed details, not established owner policy here.
- Superseded by: None explicitly established in this record. No replacement established; scope approval is narrower than approval of every review/ratings behavior in the specification.

### bridge-and-direct-dmx-product-scope

Include both external-console cue triggers and direct simple DMX output for small rigs in show-control product scope, preserving a composable bridge transport service.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-73](issues/EVE-73.md), [EVE-203](issues/EVE-203.md), [EVE-231](issues/EVE-231.md), [EVE-232](issues/EVE-232.md).
- Evidence: [EVE-231/description](https://linear.app/resnovas/issue/EVE-231/f113-build-the-show-bridge-a-local-process-that-fires-cues-to-consoles), [EVE-232/description](https://linear.app/resnovas/issue/EVE-232/f114-build-direct-dmx-output-for-small-rigs-over-sacn-and-art-net).
- Implementation: Descriptions explicitly attribute option C to the owner; no packet capture, node test, MIDI/audio dependency or executable implementation approval is established.
- Concrete outstanding parameters: Validate transport conformance, safe-look behavior, fade rates, heartbeat loss and arming; reconcile stop/blackout wording with emergency-response policy before output to hardware. No effects or moving-light engine is approved by this small-rig scope statement.
- Superseded by: None explicitly established in this record. Later native-playback scope adds a separate engine; it does not withdraw the bridge/direct-DMX scope or authorize emergency automation.

### exact-versus-functional-requirement-policy-proposal

Model each versioned equipment line as either an exact model/variant mandate or an outcome-based requirement that permits verified equivalents; explicit line constraints take precedence over tenant or category defaults.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-124](issues/EVE-124.md), [EVE-229](issues/EVE-229.md).
- Evidence: [EVE-229/description](https://linear.app/resnovas/issue/EVE-229/f111-build-equipment-requirements-roll-up-placed-elements-and-hand).
- Implementation: A distinct dated planning-policy section records this proposal, but its owner approval and linked D5-13 discussion were not established in the reviewed range. No implementation was verified.
- Concrete outstanding parameters: Confirm owner ratification and versioned line schema; define hard/soft acceptance criteria, rider provenance, compatibility/safety evidence and who may approve deviations. Functional lines must not be forced to pick an exact SKU merely to enter planning.
- Superseded by: None explicitly established in this record. Refines catalogue-centric rollup assumptions as a proposal; no approved whole-policy replacement established.

### supplier-alternative-adoption-policy-proposal

Keep supplier alternatives linked to the requirement version as proposals. An alternate to an exact mandate remains non-compliant without an authorized waiver; only explicit adoption creates a new event-plan version and propagates impact, never quote comparison alone.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-124](issues/EVE-124.md), [EVE-229](issues/EVE-229.md).
- Evidence: [EVE-229/description](https://linear.app/resnovas/issue/EVE-229/f111-build-equipment-requirements-roll-up-placed-elements-and-hand).
- Implementation: Explicit planning-policy proposal only; no owner ratification, waiver authorization or adoption workflow was independently established.
- Concrete outstanding parameters: Specify waiver authority, adoption confirmation, requirement-version linkage and impact propagation to inventory/commitments; preserve manual supplier-release approval and executed commitments until separately changed.
- Superseded by: None explicitly established in this record. No replacement established; do not silently promote proposal selection into a plan or contract mutation.

### emergency-operations-deliberate-human-initiation

Operational alarms and incidents may generate alerts, analysis and proposed responses, but Eventiva must not actuate consequential show, audio, lighting, PA or dispatch responses without a deliberate authorized human initiation. Agents, tenant rules and integrations cannot auto-approve that boundary.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-71](issues/EVE-71.md), [EVE-191](issues/EVE-191.md), [EVE-231](issues/EVE-231.md), [EVE-232](issues/EVE-232.md), [EVE-235](issues/EVE-235.md).
- Evidence: [EVE-231/description](https://linear.app/resnovas/issue/EVE-231/f113-build-the-show-bridge-a-local-process-that-fires-cues-to-consoles).
- Implementation: Description expressly labels this a binding owner policy; it also states implementation and dependencies remain unapproved. No false-alarm or reconnect proof was verified.
- Concrete outstanding parameters: Define emergency classification and preset/version correlation; audit initiator, confirmation, selected response and partial outcomes. Prove zero automatic or replayed emergency outputs after false alarms, misclassification and reconnect; prevent configurable or remote-input bypass.
- Superseded by: None explicitly established in this record. Overrides any older broad automation or agent-delegation interpretation for incident/emergency response, not ordinary non-emergency show cue programming.

### ordinary-armed-show-automation-boundary

Keep deliberately programmed, human-armed ordinary show cues and authorized external operator cue inputs available; a show-control protocol carrying an alarm remains an alert and cannot acquire emergency-actuation authority.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-230](issues/EVE-230.md), [EVE-231](issues/EVE-231.md), [EVE-232](issues/EVE-232.md).
- Evidence: [EVE-231/description](https://linear.app/resnovas/issue/EVE-231/f113-build-the-show-bridge-a-local-process-that-fires-cues-to-consoles).
- Implementation: Explicit exception within the owner emergency policy, not a blanket authorization of native listeners or code; execution remains unverified.
- Concrete outstanding parameters: Keep ordinary cue programming distinguishable from incident-triggered outputs; test source mapping, arming, permissions and explicit external human initiation without accepting remote emergency auto-approval.
- Superseded by: None explicitly established in this record. Clarifies the emergency restriction without withdrawing legitimate non-emergency MIDI/OSC/MSC/timecode show automation.

### independent-certified-safety-system-autonomy

Do not inhibit independent certified fire, evacuation, emergency-lighting or physical intervention functions, or require Eventiva confirmation that delays them. Direct control of certified safety hardware requires separate engineering and approval.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-231](issues/EVE-231.md), [EVE-232](issues/EVE-232.md).
- Evidence: [EVE-231/description](https://linear.app/resnovas/issue/EVE-231/f113-build-the-show-bridge-a-local-process-that-fires-cues-to-consoles).
- Implementation: Explicit owner system-of-systems boundary only; no certified hardware or interlock integration was authorized or tested.
- Concrete outstanding parameters: Document hardware ownership and mandatory interlocks; prove Eventiva failures cannot block independent protection. Resolve safe illumination/PA behavior independently of show.stopAll, which is not universal emergency blackout.
- Superseded by: None explicitly established in this record. Limits the human-confirmation requirement to Eventiva-initiated responses, not independent legally mandated safety functions.

### bidirectional-single-show-control-path

Support mapped authorized local console/hardware inputs and permitted MDT show-operation requests through one canonical show-control action path, with source-scoped trust and explicit accepted, sent and observed outcomes.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-231](issues/EVE-231.md), [EVE-254](issues/EVE-254.md), [EVE-255](issues/EVE-255.md), [EVE-256](issues/EVE-256.md).
- Evidence: [EVE-231/description](https://linear.app/resnovas/issue/EVE-231/f113-build-the-show-bridge-a-local-process-that-fires-cues-to-consoles).
- Implementation: Description records an owner scope clarification for bidirectional operation; adapters, listeners, dependencies and executable implementation remain separately unapproved.
- Concrete outstanding parameters: Approve each local input adapter and isolation design; validate opt-in mappings, endpoint scope, replay/rate restrictions, arming, input validation and correlated show/incident logs. Raw protocols are not generally authenticated and must not be exposed publicly by assumption.
- Superseded by: None explicitly established in this record. Extends earlier outbound-only bridge interpretation; emergency MDT response requests still require deliberate human initiation and cannot bypass independent safety systems.

### production-cue-media-lifecycle-goal

Extend product planning beyond external console triggering to a full production lifecycle and rich local cue/media capability while retaining the existing bridge transport scope.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T19:20:57.628Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-231](issues/EVE-231.md), [EVE-254](issues/EVE-254.md).
- Evidence: [EVE-231/f3592592-be83-46ba-834c-1dfd7c47195f](https://linear.app/resnovas/issue/EVE-231/f113-build-the-show-bridge-a-local-process-that-fires-cues-to-consoles#comment-f3592592-be83-46ba-834c-1dfd7c47195f).
- Implementation: Comment explicitly reports the owner goal but at that time leaves native playback versus orchestration unresolved; no media dependency or local engine was authorized.
- Concrete outstanding parameters: The native-playback choice is resolved by the later native-local-playback-separate-module record; detailed cue parity, deterministic execution, media support and lifecycle acceptance remain to be specified and approved.
- Superseded by: [native-local-playback-separate-module](#native-local-playback-separate-module). Partial supersession only: the later same-day comment resolves native playback and module placement; the full-lifecycle goal and preserved bridge scope remain in force.

### native-local-playback-separate-module

Include native local playback and the full requested cue-type range in a deterministic media executor separate from MDT/CAD. Preserve bridge transport behavior and one cue-fire/authorization path, with inbound signal mapping included in proof.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T19:31:03.330Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-231](issues/EVE-231.md), [EVE-254](issues/EVE-254.md), [EVE-255](issues/EVE-255.md).
- Evidence: [EVE-231/4ae25b66-f20f-4cc9-a442-843ed6ae6669](https://linear.app/resnovas/issue/EVE-231/f113-build-the-show-bridge-a-local-process-that-fires-cues-to-consoles#comment-4ae25b66-f20f-4cc9-a442-843ed6ae6669).
- Implementation: Binding owner scope is recorded, while dependencies, devices and executable implementation are expressly not approved. The linked detailed engine and parity specifications were not independently reviewed.
- Concrete outstanding parameters: Confirm exhaustive cue/media parity and supported platforms, deterministic playback timing, module interface and inbound OSC/MIDI/MSC/LTC/MTC source mapping. Seek separate dependency/device/implementation approval and preserve emergency actuation restrictions.
- Superseded by: None explicitly established in this record. Settles the preceding playback-versus-orchestration question and supersedes an external-trigger-only product interpretation; does not remove the bridge or move native execution into MDT.

### repeatable-show-configuration-scope

Make repeatable show setup a core capability using versioned reusable cue groups, lists, carts and venue/output profiles, with new date/venue instances, relative timings, media manifests and explicit safe overrides.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T19:31:05.466Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-233](issues/EVE-233.md), [EVE-255](issues/EVE-255.md).
- Evidence: [EVE-233/ca5cf26b-1530-44f2-8015-8c56662861ab](https://linear.app/resnovas/issue/EVE-233/f115-build-event-templates-and-cloning-reuse-phases-departments-plans#comment-ca5cf26b-1530-44f2-8015-8c56662861ab).
- Implementation: Comment expressly records approved product goals, not implementation authorization; no template, clone or playback implementation was verified.
- Concrete outstanding parameters: Define template/instance identity, venue/output binding, date and relative-time shifting, media-manifest resolution and override validation; align with the separately scoped local engine.
- Superseded by: None explicitly established in this record. Extends event-only cloning to repeatable show/cue configuration without withdrawing the original event-template capability.

### show-template-instance-isolation

Freeze published and armed cue snapshots against shared-template edits; adopting template changes must be explicit and reviewable. Never clone live runs, sign-offs, prior execution/audit receipts or active credentials.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T19:31:05.466Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-233](issues/EVE-233.md), [EVE-255](issues/EVE-255.md).
- Evidence: [EVE-233/ca5cf26b-1530-44f2-8015-8c56662861ab](https://linear.app/resnovas/issue/EVE-233/f115-build-event-templates-and-cloning-reuse-phases-departments-plans#comment-ca5cf26b-1530-44f2-8015-8c56662861ab).
- Implementation: Explicit owner requirement only; no snapshot isolation, clone exclusion or template-adoption test was verified.
- Concrete outstanding parameters: Define immutable snapshot hashes, adoption diff/confirmation, armed-run protection and credential rebinding; prove no update propagates silently into a running show.
- Superseded by: None explicitly established in this record. Refines the existing no-live-runs/no-sign-offs clone exclusions, adding reusable cue-instance isolation and active credential/execution-evidence exclusions.

### guided-sop-shared-workflow-boundary

Keep guided procedures advisory by default with configurable mandatory steps, evidence and authorized sign-off. Rules may suggest or start authorized procedures, but procedure state, branching and human approvals reuse shared durable workflows rather than a separate SOP rules engine.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T19:05:47.536Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-191](issues/EVE-191.md), [EVE-235](issues/EVE-235.md), [EVE-253](issues/EVE-253.md).
- Evidence: [EVE-235/ac968f9e-e251-40ad-a874-0ae0d93afead](https://linear.app/resnovas/issue/EVE-235/f310-build-the-task-rule-builder-when-x-then-y-on-a-generic-rule#comment-ac968f9e-e251-40ad-a874-0ae0d93afead).
- Implementation: Comment expressly records approved governance and architecture boundaries, not permission to change implementation; linked detailed procedure scope was not independently read.
- Concrete outstanding parameters: Specify procedure step-state/workflow interfaces, branch persistence, required-evidence policy and authorized human sign-off integration; confirm rules cannot auto-approve protected or emergency response actions.
- Superseded by: None explicitly established in this record. Corroborates existing guided-procedure-default and narrows integration architecture; does not replace the one cross-product rules-engine direction.

### payroll-1

Propose Eventiva calculating gross pay with a recognized payroll provider calculating net pay and filing tax through PayrollProvider.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-61](issues/EVE-61.md).
- Evidence: [EVE-61/description](https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D1-D5 are explicit recommendations, not owner-selected choices.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### payroll-2

Propose UK-first payroll with currency/jurisdiction fields ready for expansion.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-61](issues/EVE-61.md).
- Evidence: [EVE-61/description](https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D1-D5 are explicit recommendations, not owner-selected choices.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### payroll-3

Propose generated self-billed freelancer invoices rather than upload-only invoices.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-61](issues/EVE-61.md).
- Evidence: [EVE-61/description](https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D1-D5 are explicit recommendations, not owner-selected choices.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### payroll-4

Propose organisation-configurable two-person payroll approval, disabled by default.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-61](issues/EVE-61.md).
- Evidence: [EVE-61/description](https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D1-D5 are explicit recommendations, not owner-selected choices.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### payroll-5

Propose organisation opt-in location capture only at clock-in/out, with no continuous tracking.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-61](issues/EVE-61.md).
- Evidence: [EVE-61/description](https://linear.app/resnovas/issue/EVE-61/f12-payroll-pay-staff-and-crew-from-rosters-and-approved-timesheets).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D1-D5 are explicit recommendations, not owner-selected choices.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### tasks-1

Task completion wins concurrent offline status conflicts until explicit reopen.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-62](issues/EVE-62.md).
- Evidence: [EVE-62/description](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan chose 1A-6A and 7B on the 2026-11-08 decision card. Description provides no exact comment timestamp; implementation remains separately gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### tasks-2

Start with finish-to-start task dependencies with lag, not all dependency types.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-62](issues/EVE-62.md).
- Evidence: [EVE-62/description](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan chose 1A-6A and 7B on the 2026-11-08 decision card. Description provides no exact comment timestamp; implementation remains separately gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### tasks-3

Use five fixed task status categories with tenant-renameable labels; custom workflows belong to F14.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-62](issues/EVE-62.md).
- Evidence: [EVE-62/description](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan chose 1A-6A and 7B on the 2026-11-08 decision card. Description provides no exact comment timestamp; implementation remains separately gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### tasks-4

Embed collaborative Yjs task-description rich text in the task record.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-62](issues/EVE-62.md).
- Evidence: [EVE-62/description](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan chose 1A-6A and 7B on the 2026-11-08 decision card. Description provides no exact comment timestamp; implementation remains separately gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### tasks-5

Allow task guests restricted to their own assignments.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-62](issues/EVE-62.md).
- Evidence: [EVE-62/description](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan chose 1A-6A and 7B on the 2026-11-08 decision card. Description provides no exact comment timestamp; implementation remains separately gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### tasks-6

Allow undoable agent task edits for the requester; confirm assigning others, bulk above 10 or templates above 25; agents never sign off.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-62](issues/EVE-62.md).
- Evidence: [EVE-62/description](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan chose 1A-6A and 7B on the 2026-11-08 decision card. Description provides no exact comment timestamp; implementation remains separately gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### tasks-7

Build the F3 rule builder on one domain-agnostic engine extended by F14, not separate engines.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-62](issues/EVE-62.md).
- Evidence: [EVE-62/description](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan chose 1A-6A and 7B on the 2026-11-08 decision card. Description provides no exact comment timestamp; implementation remains separately gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### inventory-1

Derive inventory levels from append-only movements rather than mutable quantities.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-63](issues/EVE-63.md).
- Evidence: [EVE-63/description](https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1-D6 option A on 2026-11-08. No implementation acceptance inferred.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### inventory-2

F9 owns rental quotes/prices, F11 invoices and F6 availability/reservations.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-63](issues/EVE-63.md).
- Evidence: [EVE-63/description](https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1-D6 option A on 2026-11-08. No implementation acceptance inferred.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### inventory-3

Start with camera barcode/QR and keyboard-mode scanners, deferring RFID.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-63](issues/EVE-63.md).
- Evidence: [EVE-63/description](https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1-D6 option A on 2026-11-08. No implementation acceptance inferred.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### inventory-4

Accept disconnected duplicate serialized checkout and raise discrepancy on sync, retaining both movements.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-63](issues/EVE-63.md).
- Evidence: [EVE-63/description](https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1-D6 option A on 2026-11-08. No implementation acceptance inferred.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### inventory-5

F6 owns purchase requests/orders/receipts/reorder points; F11 owns supplier bills.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-63](issues/EVE-63.md).
- Evidence: [EVE-63/description](https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1-D6 option A on 2026-11-08. No implementation acceptance inferred.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### inventory-6

Use serialized asset cost and straight-line depreciation, with average cost for bulk/consumables, exported to accounting.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-63](issues/EVE-63.md).
- Evidence: [EVE-63/description](https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1-D6 option A on 2026-11-08. No implementation acceptance inferred.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### crm-proposal-1

Propose separate CRM Person and login User records with optional linking.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-65](issues/EVE-65.md).
- Evidence: [EVE-65/description](https://linear.app/resnovas/issue/EVE-65/f4-contacts-and-crm-people-organisations-relationships-and-history).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D1-D5 are recommendations without explicit Jonathan selection; dependencies and provider accounts remain approval-gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### crm-proposal-2

Propose F4 ownership of enquiries/opportunities that convert to F1 Events.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-65](issues/EVE-65.md).
- Evidence: [EVE-65/description](https://linear.app/resnovas/issue/EVE-65/f4-contacts-and-crm-people-organisations-relationships-and-history).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D1-D5 are recommendations without explicit Jonathan selection; dependencies and provider accounts remain approval-gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### crm-proposal-3

Propose mailbox/calendar ports and separately approved Google/Microsoft adapters, with forwarding/manual logging as the first fallback.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-65](issues/EVE-65.md).
- Evidence: [EVE-65/description](https://linear.app/resnovas/issue/EVE-65/f4-contacts-and-crm-people-organisations-relationships-and-history).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D1-D5 are recommendations without explicit Jonathan selection; dependencies and provider accounts remain approval-gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### crm-proposal-4

Propose no third-party enrichment, allowing approved public-site lookups on request.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-65](issues/EVE-65.md).
- Evidence: [EVE-65/description](https://linear.app/resnovas/issue/EVE-65/f4-contacts-and-crm-people-organisations-relationships-and-history).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D1-D5 are recommendations without explicit Jonathan selection; dependencies and provider accounts remain approval-gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### crm-proposal-5

Propose duplicate suggestions followed by confirmed merge and reversible unmerge, not automatic email-match merges.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-65](issues/EVE-65.md).
- Evidence: [EVE-65/description](https://linear.app/resnovas/issue/EVE-65/f4-contacts-and-crm-people-organisations-relationships-and-history).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D1-D5 are recommendations without explicit Jonathan selection; dependencies and provider accounts remain approval-gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### directory-d5-1

Allow tenant-owned directory listings plus seeded unclaimed listings owners can claim later.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-66](issues/EVE-66.md).
- Evidence: [EVE-66/description](https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan choice recorded 2026-11-08. For commission, configure CommissionPlan before rollout; 5 percent is a test value, not an approved rate. Supplier commission invoices and per-payment splits do not confer platform custody.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### directory-d5-2

Keep listings/enquiries free and charge commission on accepted marketplace quotes.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-66](issues/EVE-66.md).
- Evidence: [EVE-66/description](https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan choice recorded 2026-11-08. For commission, configure CommissionPlan before rollout; 5 percent is a test value, not an approved rate. Supplier commission invoices and per-payment splits do not confer platform custody.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### directory-d5-3

Allow verified marketplace reviews only.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-66](issues/EVE-66.md).
- Evidence: [EVE-66/description](https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan choice recorded 2026-11-08. For commission, configure CommissionPlan before rollout; 5 percent is a test value, not an approved rate. Supplier commission invoices and per-payment splits do not confer platform custody.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### directory-d5-4

Use PostGIS on Neon for geo search; Jonathan explicitly approved this dependency for F5.4.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-66](issues/EVE-66.md), [EVE-79](issues/EVE-79.md).
- Evidence: [EVE-66/description](https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings), [EVE-79/description](https://linear.app/resnovas/issue/EVE-79/f54-build-directory-search-filters-geo-radius-and-transparent-ranking).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan choice recorded 2026-11-08. For commission, configure CommissionPlan before rollout; 5 percent is a test value, not an approved rate. Supplier commission invoices and per-payment splits do not confer platform custody.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### directory-d5-5

Publish a public indexable directory subdomain.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-66](issues/EVE-66.md).
- Evidence: [EVE-66/description](https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan choice recorded 2026-11-08. For commission, configure CommissionPlan before rollout; 5 percent is a test value, not an approved rate. Supplier commission invoices and per-payment splits do not confer platform custody.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### directory-d5-6

Deduct commission at source through F9 connected-account splits; suppliers remain merchant of record and Eventiva holds no client money.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-66](issues/EVE-66.md).
- Evidence: [EVE-66/description](https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan choice recorded 2026-11-08. For commission, configure CommissionPlan before rollout; 5 percent is a test value, not an approved rate. Supplier commission invoices and per-payment splits do not confer platform custody.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### roster-1

F2 owns time capture and approved timesheets; F12 consumes approved results.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-67](issues/EVE-67.md).
- Evidence: [EVE-67/description](https://linear.app/resnovas/issue/EVE-67/f2-scheduling-and-rosters-crew-availability-shifts-offers-call-sheets).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan chose all six option A selections on 2026-11-08. Pure calculation is not permission for an unapproved optimization dependency.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### roster-2

F13 owns qualifications; F2 reads them for matching.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-67](issues/EVE-67.md).
- Evidence: [EVE-67/description](https://linear.app/resnovas/issue/EVE-67/f2-scheduling-and-rosters-crew-availability-shifts-offers-call-sheets).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan chose all six option A selections on 2026-11-08. Pure calculation is not permission for an unapproved optimization dependency.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### roster-3

Use a pure deterministic TypeScript roster constraint solver with sharded execution for large events and agent explanations.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-67](issues/EVE-67.md).
- Evidence: [EVE-67/description](https://linear.app/resnovas/issue/EVE-67/f2-scheduling-and-rosters-crew-availability-shifts-offers-call-sheets).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan chose all six option A selections on 2026-11-08. Pure calculation is not permission for an unapproved optimization dependency.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### roster-4

Use UK Working Time Regulations rule data first, EU next.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-67](issues/EVE-67.md).
- Evidence: [EVE-67/description](https://linear.app/resnovas/issue/EVE-67/f2-scheduling-and-rosters-crew-availability-shifts-offers-call-sheets).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan chose all six option A selections on 2026-11-08. Pure calculation is not permission for an unapproved optimization dependency.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### roster-5

Offer same-app invite-based guest access plus signed single-use offer/availability response links.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-67](issues/EVE-67.md).
- Evidence: [EVE-67/description](https://linear.app/resnovas/issue/EVE-67/f2-scheduling-and-rosters-crew-availability-shifts-offers-call-sheets).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan chose all six option A selections on 2026-11-08. Pure calculation is not permission for an unapproved optimization dependency.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### roster-6

Initial personal calendars use read-only ICS; defer two-way Google/Microsoft sync.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-67](issues/EVE-67.md).
- Evidence: [EVE-67/description](https://linear.app/resnovas/issue/EVE-67/f2-scheduling-and-rosters-crew-availability-shifts-offers-call-sheets).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan chose all six option A selections on 2026-11-08. Pure calculation is not permission for an unapproved optimization dependency.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### accounting-own-ledger

Build Eventiva's own Postgres/Drizzle double-entry ledger behind LedgerPort instead of Blnk, preserving online-target balance/transaction/reference compatibility.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-69](issues/EVE-69.md), [EVE-74](issues/EVE-74.md).
- Evidence: [EVE-69/description](https://linear.app/resnovas/issue/EVE-69/f11-accounting-ledgers-invoices-bills-event-budgets-and-tax), [EVE-74/description](https://linear.app/resnovas/issue/EVE-74/f111-build-the-ledger-port-chart-of-accounts-journals-and-periods).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Explicit Jonathan choice recorded 2026-11-08 overrides the Eventiva house Blnk local-role default only. Blnk is not a dependency; migration compatibility remains required.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### accounting-proposal-2

Propose UK VAT with MTD submission as the first tax jurisdiction.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-69](issues/EVE-69.md).
- Evidence: [EVE-69/description](https://linear.app/resnovas/issue/EVE-69/f11-accounting-ledgers-invoices-bills-event-budgets-and-tax).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Recommendations without explicit Jonathan selections; child implementation specifications do not supply owner approval.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### accounting-proposal-3

Propose bank statement file import first and flagged open-banking feeds later.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-69](issues/EVE-69.md).
- Evidence: [EVE-69/description](https://linear.app/resnovas/issue/EVE-69/f11-accounting-ledgers-invoices-bills-event-budgets-and-tax).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Recommendations without explicit Jonathan selections; child implementation specifications do not supply owner approval.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### accounting-proposal-4

Propose receipt/bill extraction by the Eventiva agent using the selected model engine, not a separate OCR vendor.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-69](issues/EVE-69.md).
- Evidence: [EVE-69/description](https://linear.app/resnovas/issue/EVE-69/f11-accounting-ledgers-invoices-bills-event-budgets-and-tax).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Recommendations without explicit Jonathan selections; child implementation specifications do not supply owner approval.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### fleet-proposal-1

Propose keeping fleet/MDT live operations inside F7 with two feature flags.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-71](issues/EVE-71.md).
- Evidence: [EVE-71/description](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Section 15 proposals are not selected solely because subsequent issue descriptions use their recommended shapes. Binding emergency response policy remains mandatory.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### fleet-proposal-2

Propose acknowledged priority text messaging first, radio/push-to-talk later.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-71](issues/EVE-71.md).
- Evidence: [EVE-71/description](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Section 15 proposals are not selected solely because subsequent issue descriptions use their recommended shapes. Binding emergency response policy remains mandatory.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### fleet-proposal-3

Propose active-unit phone location first with a telematics port but no initial adapter.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-71](issues/EVE-71.md).
- Evidence: [EVE-71/description](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Section 15 proposals are not selected solely because subsequent issue descriptions use their recommended shapes. Binding emergency response policy remains mandatory.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### fleet-proposal-4

Propose no controller dispatch assignment while offline; crew status may queue.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-71](issues/EVE-71.md).
- Evidence: [EVE-71/description](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Section 15 proposals are not selected solely because subsequent issue descriptions use their recommended shapes. Binding emergency response policy remains mandatory.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### fleet-proposal-5

Propose F13 ownership of driver licences as qualifications read by F7.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-71](issues/EVE-71.md).
- Evidence: [EVE-71/description](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Section 15 proposals are not selected solely because subsequent issue descriptions use their recommended shapes. Binding emergency response policy remains mandatory.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### fleet-proposal-6

Propose deferring drivers-hours/tachographs instead of shipping incomplete compliance.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-71](issues/EVE-71.md).
- Evidence: [EVE-71/description](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Section 15 proposals are not selected solely because subsequent issue descriptions use their recommended shapes. Binding emergency response policy remains mandatory.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### show-direct-dmx

Include OSC/MIDI/MSC/timecode triggers plus simple direct DMX over sACN/Art-Net for small rigs.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-73](issues/EVE-73.md).
- Evidence: [EVE-73/description](https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan chose C on 2026-11-08, adding F1.14 to scope. Later native playback direction expands capability, not approval for hardware, packages or implementation.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### show-proposal-2

Propose Event as anchor with optional EventSeries rather than a mandatory Project.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-73](issues/EVE-73.md).
- Evidence: [EVE-73/description](https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D2-D6 remain recommendations; the explicit D1 choice does not approve all show-control details. Local deterministic execution is later scoped but exact packaging is subject to technical review.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### show-proposal-3

Propose fixed and predecessor-relative run-of-show timing with live drift.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-73](issues/EVE-73.md).
- Evidence: [EVE-73/description](https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D2-D6 remain recommendations; the explicit D1 choice does not approve all show-control details. Local deterministic execution is later scoped but exact packaging is subject to technical review.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### show-proposal-4

Propose GDTF fixture data and MVR scene exchange.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-73](issues/EVE-73.md).
- Evidence: [EVE-73/description](https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D2-D6 remain recommendations; the explicit D1 choice does not approve all show-control details. Local deterministic execution is later scoped but exact packaging is subject to technical review.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### show-proposal-5

Propose indicative rigging loads with human competent-person sign-off invalidated by changes.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-73](issues/EVE-73.md).
- Evidence: [EVE-73/description](https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D2-D6 remain recommendations; the explicit D1 choice does not approve all show-control details. Local deterministic execution is later scoped but exact packaging is subject to technical review.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### show-proposal-6

Propose a paired headless Effect show bridge owning hardware/network IO independently of UI.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-73](issues/EVE-73.md).
- Evidence: [EVE-73/description](https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D2-D6 remain recommendations; the explicit D1 choice does not approve all show-control details. Local deterministic execution is later scoped but exact packaging is subject to technical review.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### ticketing-1

F8 owns ticket types, capacity, holds, tickets and admission; F9 owns checkout/orders/payments/refunds.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-76](issues/EVE-76.md).
- Evidence: [EVE-76/description](https://linear.app/resnovas/issue/EVE-76/f8-ticketing-ticket-types-capacity-issuance-admissions-and-scanning).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1,D2,D4,D5 and chose D3 option B on 2026-11-08. Offline duplicate admissions reconcile after sync, not global prevention while disconnected. Libraries/wallet accounts remain separately gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### ticketing-2

Use signed tickets, synced validity snapshots and an append-only offline scan ledger.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-76](issues/EVE-76.md).
- Evidence: [EVE-76/description](https://linear.app/resnovas/issue/EVE-76/f8-ticketing-ticket-types-capacity-issuance-admissions-and-scanning).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1,D2,D4,D5 and chose D3 option B on 2026-11-08. Offline duplicate admissions reconcile after sync, not global prevention while disconnected. Libraries/wallet accounts remain separately gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### ticketing-3

Build an F8 seat-map editor now, optionally using an F10 backdrop without waiting for F10.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-76](issues/EVE-76.md), [EVE-108](issues/EVE-108.md).
- Evidence: [EVE-76/description](https://linear.app/resnovas/issue/EVE-76/f8-ticketing-ticket-types-capacity-issuance-admissions-and-scanning), [EVE-108/description](https://linear.app/resnovas/issue/EVE-108/f10-interactive-site-maps).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1,D2,D4,D5 and chose D3 option B on 2026-11-08. Offline duplicate admissions reconcile after sync, not global prevention while disconnected. Libraries/wallet accounts remain separately gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### ticketing-4

Provide organiser-controlled transfers and face-value resale through the waiting list.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-76](issues/EVE-76.md).
- Evidence: [EVE-76/description](https://linear.app/resnovas/issue/EVE-76/f8-ticketing-ticket-types-capacity-issuance-admissions-and-scanning).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1,D2,D4,D5 and chose D3 option B on 2026-11-08. Offline duplicate admissions reconcile after sync, not global prevention while disconnected. Libraries/wallet accounts remain separately gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### ticketing-5

Deliver in-app/email QR and PDF first; wallet passes come in a later slice.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-76](issues/EVE-76.md).
- Evidence: [EVE-76/description](https://linear.app/resnovas/issue/EVE-76/f8-ticketing-ticket-types-capacity-issuance-admissions-and-scanning).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1,D2,D4,D5 and chose D3 option B on 2026-11-08. Offline duplicate admissions reconcile after sync, not global prevention while disconnected. Libraries/wallet accounts remain separately gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### hr-1

Give employees, freelancers, volunteers and agency crew a Worker record.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-80](issues/EVE-80.md).
- Evidence: [EVE-80/description](https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan selected 1a-6a and 7b on 2026-11-08; planning only, not implementation/vendor sign-up acceptance.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### hr-2

Worker extends the F4 Person per tenant rather than creating another human identity.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-80](issues/EVE-80.md).
- Evidence: [EVE-80/description](https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan selected 1a-6a and 7b on 2026-11-08; planning only, not implementation/vendor sign-up acceptance.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### hr-3

Hard-block qualification failures on rosters, with approved audited overrides only.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-80](issues/EVE-80.md).
- Evidence: [EVE-80/description](https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan selected 1a-6a and 7b on 2026-11-08; planning only, not implementation/vendor sign-up acceptance.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### hr-4

Start with built-in simple e-signature and an evidence record behind ESignature.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-80](issues/EVE-80.md).
- Evidence: [EVE-80/description](https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan selected 1a-6a and 7b on 2026-11-08; planning only, not implementation/vendor sign-up acceptance.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### hr-5

Start manual right-to-work records/document checks/reminders; defer provider integration.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-80](issues/EVE-80.md).
- Evidence: [EVE-80/description](https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan selected 1a-6a and 7b on 2026-11-08; planning only, not implementation/vendor sign-up acceptance.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### hr-6

Use UK statutory leave rules first with configurable policies for other jurisdictions.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-80](issues/EVE-80.md).
- Evidence: [EVE-80/description](https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan selected 1a-6a and 7b on 2026-11-08; planning only, not implementation/vendor sign-up acceptance.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### hr-7

Add performance reviews, goals and feedback as an F13 slice.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-80](issues/EVE-80.md).
- Evidence: [EVE-80/description](https://linear.app/resnovas/issue/EVE-80/f13-human-resources-worker-records-onboarding-qualifications-and-leave).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan selected 1a-6a and 7b on 2026-11-08; planning only, not implementation/vendor sign-up acceptance.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### sales-1

F9 owns cart/checkout/orders/payments/refunds/discounts/tax lines/receipts; other domains register line providers.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-107](issues/EVE-107.md).
- Evidence: [EVE-107/description](https://linear.app/resnovas/issue/EVE-107/f9-online-and-in-person-sales-storefront-point-of-sale-orders-payments).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1-D7 as recommended on 2026-11-08. New dependencies, accounts and implementation still require child-slice approval; provider direction is not sign-up authorization.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### sales-2

Select Stripe behind PaymentGateway/CardTerminal with connected accounts so each tenant is merchant of record receiving direct payouts.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-107](issues/EVE-107.md).
- Evidence: [EVE-107/description](https://linear.app/resnovas/issue/EVE-107/f9-online-and-in-person-sales-storefront-point-of-sale-orders-payments).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1-D7 as recommended on 2026-11-08. New dependencies, accounts and implementation still require child-slice approval; provider direction is not sign-up authorization.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### sales-3

Permit supported-reader offline card sales only behind a flag with merchant risk notice and per-device daily/per-order limits defaulting to zero; cash works offline.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-107](issues/EVE-107.md).
- Evidence: [EVE-107/description](https://linear.app/resnovas/issue/EVE-107/f9-online-and-in-person-sales-storefront-point-of-sale-orders-payments).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1-D7 as recommended on 2026-11-08. New dependencies, accounts and implementation still require child-slice approval; provider direction is not sign-up authorization.
- Superseded by: [guarded-offline-a3](#guarded-offline-a3). The older2026-11-08 supported-reader offline-card direction is constrained by the later explicit2026-11-15 A3 online-only payments policy; cash/reversible offline work and zero-default risk limits are not themselves a validated exception. Seek scoped reconciliation before implementing offline card capture.

### sales-4

F11 owns tax codes/rates; F9 maps categories and calculates inclusive UK/EU VAT through built-in TaxCalculator.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-107](issues/EVE-107.md).
- Evidence: [EVE-107/description](https://linear.app/resnovas/issue/EVE-107/f9-online-and-in-person-sales-storefront-point-of-sale-orders-payments).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1-D7 as recommended on 2026-11-08. New dependencies, accounts and implementation still require child-slice approval; provider direction is not sign-up authorization.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### sales-5

Specify connected-account vendor split payments now and build them after F9.3.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-107](issues/EVE-107.md).
- Evidence: [EVE-107/description](https://linear.app/resnovas/issue/EVE-107/f9-online-and-in-person-sales-storefront-point-of-sale-orders-payments).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1-D7 as recommended on 2026-11-08. New dependencies, accounts and implementation still require child-slice approval; provider direction is not sign-up authorization.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### sales-6

Ticket capacity uses preallocated device quotas; stock uses deltas and flags oversell.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-107](issues/EVE-107.md).
- Evidence: [EVE-107/description](https://linear.app/resnovas/issue/EVE-107/f9-online-and-in-person-sales-storefront-point-of-sale-orders-payments).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1-D7 as recommended on 2026-11-08. New dependencies, accounts and implementation still require child-slice approval; provider direction is not sign-up authorization.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### sales-7

Keep closed-loop cashless wristbands outside F9 for a possible later feature set.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-107](issues/EVE-107.md).
- Evidence: [EVE-107/description](https://linear.app/resnovas/issue/EVE-107/f9-online-and-in-person-sales-storefront-point-of-sale-orders-payments).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan approved D1-D7 as recommended on 2026-11-08. New dependencies, accounts and implementation still require child-slice approval; provider direction is not sign-up authorization.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### maps-maplibre-open-tiles

Use MapLibre device/web renderers with self-hosted OpenStreetMap vector tiles and an imagery-vendor port, shared with F8 seating.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-108](issues/EVE-108.md), [EVE-120](issues/EVE-120.md).
- Evidence: [EVE-108/description](https://linear.app/resnovas/issue/EVE-108/f10-interactive-site-maps), [EVE-120/description](https://linear.app/resnovas/issue/EVE-120/f100-spike-map-engine-with-offline-tiles-and-yjs-bound-editing-on-expo).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan choice recorded 2026-11-08. Spike confirms criteria; alternatives only if a criterion fails. No web/Android/offline/performance pass is established by this specification.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### maps-imagery-online-only

Keep satellite imagery online only; offline packs use open basemap plus tenant-owned plans/drone orthophotos, without paid self-hosted imagery licensing.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-108](issues/EVE-108.md).
- Evidence: [EVE-108/description](https://linear.app/resnovas/issue/EVE-108/f10-interactive-site-maps).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan choice recorded 2026-11-08. Source licences and renderer compatibility must be checked before real use.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### maps-proposal-2

Propose per-layer Yjs documents so sync authorization can hide entire layers.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-108](issues/EVE-108.md).
- Evidence: [EVE-108/description](https://linear.app/resnovas/issue/EVE-108/f10-interactive-site-maps).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: These are recommendations/agreed contracts without explicit named Jonathan selections; SDK/conversion dependencies remain separately gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### maps-proposal-4

Propose F7 as the single unit/crew location collector, with F10 consuming live layers.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-108](issues/EVE-108.md).
- Evidence: [EVE-108/description](https://linear.app/resnovas/issue/EVE-108/f10-interactive-site-maps).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: These are recommendations/agreed contracts without explicit named Jonathan selections; SDK/conversion dependencies remain separately gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### maps-proposal-5

Propose image/GeoTIFF/PDF/DXF reference imports, asking for DXF/PDF exports instead of direct DWG reading.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-108](issues/EVE-108.md).
- Evidence: [EVE-108/description](https://linear.app/resnovas/issue/EVE-108/f10-interactive-site-maps).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: These are recommendations/agreed contracts without explicit named Jonathan selections; SDK/conversion dependencies remain separately gated.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### studio-sites-1

Build Studio core before Sites so sites reuse fields/customization definitions.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-111](issues/EVE-111.md).
- Evidence: [EVE-111/description](https://linear.app/resnovas/issue/EVE-111/f14-website-builder-and-in-app-customisation).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan selected all six option A choices on 2026-11-08. Recheck renderer with F14.10; hosting account sign-up still needs F14.11 approval.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### studio-sites-2

Render shared Rambo-UI site blocks server-side through react-native-web with no-JS output checks and Lighthouse gates.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-111](issues/EVE-111.md).
- Evidence: [EVE-111/description](https://linear.app/resnovas/issue/EVE-111/f14-website-builder-and-in-app-customisation).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan selected all six option A choices on 2026-11-08. Recheck renderer with F14.10; hosting account sign-up still needs F14.11 approval.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### studio-sites-3

Store custom fields in a per-extensible-table JSONB column, JSON text on SQLite, with expression indexes for indexed fields.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-111](issues/EVE-111.md).
- Evidence: [EVE-111/description](https://linear.app/resnovas/issue/EVE-111/f14-website-builder-and-in-app-customisation).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan selected all six option A choices on 2026-11-08. Recheck renderer with F14.10; hosting account sign-up still needs F14.11 approval.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### studio-sites-4

Use Vercel behind SiteHosting and DomainProvisioning.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-111](issues/EVE-111.md).
- Evidence: [EVE-111/description](https://linear.app/resnovas/issue/EVE-111/f14-website-builder-and-in-app-customisation).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan selected all six option A choices on 2026-11-08. Recheck renderer with F14.10; hosting account sign-up still needs F14.11 approval.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### studio-sites-5

Keep F14 customization declarative; consider sandboxed user code in a later spike.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-111](issues/EVE-111.md).
- Evidence: [EVE-111/description](https://linear.app/resnovas/issue/EVE-111/f14-website-builder-and-in-app-customisation).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan selected all six option A choices on 2026-11-08. Recheck renderer with F14.10; hosting account sign-up still needs F14.11 approval.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### studio-sites-6

Build canvas/layers/inspector in Rambo-UI for native/web; use Puck as a data-model reference, not a dependency.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-111](issues/EVE-111.md).
- Evidence: [EVE-111/description](https://linear.app/resnovas/issue/EVE-111/f14-website-builder-and-in-app-customisation).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Jonathan selected all six option A choices on 2026-11-08. Recheck renderer with F14.10; hosting account sign-up still needs F14.11 approval.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### catalogue-evidence-intake

Keep shared manufacturer/model specification evidence separate from tenant Products/Assets/Kits/stock; supplier intake retains provenance, verification status and historical versions.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-63](issues/EVE-63.md), [EVE-81](issues/EVE-81.md), [EVE-119](issues/EVE-119.md), [EVE-124](issues/EVE-124.md).
- Evidence: [EVE-63/description](https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D6-7: extracted supplier claims are not verified references. F5 owns contextual equivalence; permission-controlled availability projections must retain freshness. No explicit named-owner approval for this addition.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### supplier-inventory-disclosure

Separate detailed private inventory capture from supplier-controlled buyer disclosure: permitted detailed fields, dates only or hidden, with category/product overrides.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-63](issues/EVE-63.md), [EVE-66](issues/EVE-66.md).
- Evidence: [EVE-63/description](https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing), [EVE-66/description](https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D6-8/D5-15: storage, disclosure and internal matching are independent. Never publish tenant costs/serials/clients or infer shared-model training authorization. User endorsement is recorded but Jonathan is not named for these clauses.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### supplier-old-matching-opt-in

Earlier D5-15/D6-8 assumed a separate positive opt-in for inventory-backed cross-tenant matching, especially hidden inventory.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-63](issues/EVE-63.md), [EVE-66](issues/EVE-66.md).
- Evidence: [EVE-63/description](https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing), [EVE-66/description](https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Historical replaced clause, not the current matching default.
- Superseded by: [supplier-default-on-private-matching](#supplier-default-on-private-matching). Only the separate-positive-opt-in matching restriction is superseded by D5-16/D6-9; publication control and privacy safeguards survive.

### supplier-default-on-private-matching

Enable eligible internal inventory-backed supplier matching by default with clear notice and explicit supplier opt-out, independently of public stock visibility.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-63](issues/EVE-63.md), [EVE-66](issues/EVE-66.md), [EVE-124](issues/EVE-124.md), [EVE-161](issues/EVE-161.md).
- Evidence: [EVE-63/description](https://linear.app/resnovas/issue/EVE-63/f6-warehousing-and-inventory-equipment-stock-availability-purchasing), [EVE-66/description](https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings), [EVE-124/description](https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D5-16/D6-9: verify lawful basis/terms before rollout, including existing tenants. Opt-out removes private-derived ranking/index/cache signals, not ordinary listings or own-tenant AI. Hidden suppliers receive only publicly justified generic copy; prevent repeated-query/ranking stock-oracle leaks. No raw cross-tenant access, auto-contact or shared-model training.
- Superseded by: None explicitly established in this record. Explicit replacement of D5-15/D6-8 matching opt-in only, not disclosure/privacy controls. EVE-161 older coarse public availability opt-in concerns publication, a separate control.

### supplier-technical-availability-separation

Use structured technical evidence and contextual criteria for supplier fit; keep suitability, stock/kit quantities, date availability and confirmed commitment separate.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-63](issues/EVE-63.md), [EVE-66](issues/EVE-66.md), [EVE-81](issues/EVE-81.md), [EVE-119](issues/EVE-119.md), [EVE-124](issues/EVE-124.md).
- Evidence: [EVE-66/description](https://linear.app/resnovas/issue/EVE-66/f5-directory-and-marketplace-vendor-venue-and-professional-listings), [EVE-124/description](https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D5-14: stale/missing evidence remains unknown or needs confirmation; text similarity, ownership or technical fit never establishes availability or contract. No automatic holds/awards/contact.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### quotes-mixed-awards

Support whole-quote or mixed-supplier awards with separately confirmed supplier contracts, commitments and payment schedules.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-124](issues/EVE-124.md), [EVE-119](issues/EVE-119.md), [EVE-229](issues/EVE-229.md).
- Evidence: [EVE-124/description](https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D5-7: versioned AwardPlan/Selections/SupplierAwards; partial indivisible bundles need supplier-confirmed repricing. Independent supplier failure does not silently reverse another accepted contract. Attached detailed requirement-level comparison document is unavailable in this snapshot; unseen action contracts/tests are not inferred.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### quotes-progressive-comparison

Show stage/area summaries first, then categories, requirements, supplier lines and evidence without losing context.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-124](issues/EVE-124.md), [EVE-119](issues/EVE-119.md), [EVE-229](issues/EVE-229.md).
- Evidence: [EVE-124/description](https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D5-8: accessible coverage/issue rollups retain unknown/not-supplied/not-applicable distinctions. F1 requirements remain authoritative; accepted contracts stay unchanged. Attached detailed comparison specification is unavailable.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### quotes-round-redlines

Retain immutable supplier quote rounds, stable requirement/line continuity and selectable historical comparison baselines.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-124](issues/EVE-124.md), [EVE-119](issues/EVE-119.md), [EVE-229](issues/EVE-229.md).
- Evidence: [EVE-124/description](https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D5-9: decompose quantities/prices/discounts/fees/tax/bundles and reconcile totals. Negotiated rates need supplier evidence; uncertain matches and opaque prices remain reviewable, not invented. Neutral severity is refined by D5-10.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### quotes-neutral-change-review

Mark both price increases and decreases neutrally as changed; allow one-action review/dismiss without erasing immutable differences.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-124](issues/EVE-124.md), [EVE-119](issues/EVE-119.md), [EVE-229](issues/EVE-229.md).
- Evidence: [EVE-124/description](https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D5-10 user correction is not explicitly named Jonathan. Distinguish unreviewed/reviewed/verified issue. New revisions create new review items; thresholds must not hide full diffs and no numeric threshold is chosen.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### quotes-internal-plan-propagation

Automatically propagate F1 requirement revisions into internal comparison/equivalence/coverage/forecast impact views without rewriting supplier quotes or executed commitments.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-124](issues/EVE-124.md), [EVE-119](issues/EVE-119.md), [EVE-229](issues/EVE-229.md).
- Evidence: [EVE-124/description](https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D5-11: distinguish exploratory/approved budgets and last supplier-visible baselines; never silently cancel reservations, revise contracts or post accounting.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### quotes-manual-supplier-release

Require deliberate authorized release of selected version-locked supplier change sets; exploratory plans may stay unsent indefinitely.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-124](issues/EVE-124.md), [EVE-119](issues/EVE-119.md), [EVE-229](issues/EVE-229.md).
- Evidence: [EVE-124/description](https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D5-11: batch against last brief actually sent, require refreshed approval for changed content, preserve later edits as unsent and dispatch idempotently. No debounce/timer auto-send; review acknowledgement is not contact authorization.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### quotes-selected-supplier-batches

Allow one or several explicitly selected suppliers with independent recipient authority, version lock and auditable request/send/retry status.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-124](issues/EVE-124.md), [EVE-119](issues/EVE-119.md), [EVE-229](issues/EVE-229.md).
- Evidence: [EVE-124/description](https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D5-12: selection is not authorization and partial failure must not duplicate sends. Support supplier-specific RFQ/design/budget/mixed formats and many-to-many requirement scope.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### quotes-flexible-view-provenance

Split/combine/group supplier proposals for presentation while preserving immutable quotes, separate legal contracts, bundle lineage and original prices.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-124](issues/EVE-124.md), [EVE-119](issues/EVE-119.md), [EVE-229](issues/EVE-229.md).
- Evidence: [EVE-124/description](https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D5-12: saved flexible views must not double-count totals, fabricate component prices or turn partial bundle selection into binding supplier terms.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### quotes-exact-functional-requirements

Choose exact-model or functional-criteria policy per F1 requirement; deviations from exact require an authorized waiver and equivalence is contextual, not global identity.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-124](issues/EVE-124.md), [EVE-119](issues/EVE-119.md), [EVE-229](issues/EVE-229.md).
- Evidence: [EVE-124/description](https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: D5-13: preserve versions, technical evidence and match states; unknown is not verified. Accepting a supplier alternative is separate from adopting it into a new plan revision.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### quotes-old-severity-treatment

Earlier comparison wording emphasized price-regression warnings when quotation values changed.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-124](issues/EVE-124.md).
- Evidence: [EVE-124/description](https://linear.app/resnovas/issue/EVE-124/f58-build-quotes-quote-comparison-and-the-acceptance-handoff-to-the).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Historical visual-severity clause only, not the entire redline/comparison policy.
- Superseded by: [quotes-neutral-change-review](#quotes-neutral-change-review). D5-10 explicitly replaces ordinary increase/decrease warning/error implications with neutral bidirectional review; evidenced pricing breaches can still escalate.

### emergency-human-initiation

Never automatically execute consequential operational incident/alarm/emergency responses in Eventiva; an authorized accountable human assesses and deliberately initiates the selected response.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-71](issues/EVE-71.md), [EVE-73](issues/EVE-73.md), [EVE-147](issues/EVE-147.md), [EVE-148](issues/EVE-148.md), [EVE-256](issues/EVE-256.md).
- Evidence: [EVE-71/description](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and), [EVE-147/description](https://linear.app/resnovas/issue/EVE-147/f77-build-the-incident-control-log-and-dispatch-for-live-events).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Binding owner policy dated 2026-11-15. Alerts can classify/log/notify/propose, not auto-GO/hold/mute/DMX/PA/dispatch. No admin/agent/rule bypass or deferred replay after reconnect. Ordinary separately programmed human-armed non-emergency cues remain allowed.
- Superseded by: None explicitly established in this record. Constrains all earlier incident-driven automation proposals. Does not prohibit separately governed routine production release or ordinary human-armed non-emergency sequences.

### independent-certified-safety-boundary

Do not inhibit independent certified alarms, evacuation/voice systems, emergency lighting, lawful fire-panel interlocks or physical overrides by requiring Eventiva confirmation.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-147](issues/EVE-147.md), [EVE-71](issues/EVE-71.md).
- Evidence: [EVE-71/description](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and), [EVE-147/description](https://linear.app/resnovas/issue/EVE-147/f77-build-the-incident-control-log-and-dispatch-for-live-events).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: The human-initiation restriction concerns Eventiva-initiated responses only; certified systems retain mandatory automatic functions. Direct control of safety-certified hardware requires separate safety engineering/approval.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### incident-approved-preset-bridge

Offer authorized incident-linked invocation of a selected version-pinned preapproved show preset through the separate F1 bridge/local engine, not F7 playback.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-71](issues/EVE-71.md), [EVE-147](issues/EVE-147.md), [EVE-148](issues/EVE-148.md), [EVE-255](issues/EVE-255.md), [EVE-256](issues/EVE-256.md).
- Evidence: [EVE-71/description](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and), [EVE-147/description](https://linear.app/resnovas/issue/EVE-147/f77-build-the-incident-control-log-and-dispatch-for-live-events).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Require show-operator permission, armed target, tested venue mapping, correlated incident/show logs and request/endpoint/observed/failure results. The bridge clarification is specified but does not explicitly name Jonathan.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### shared-event-operational-graph

Event planning and MDT/live operations share canonical event/phase/resource/action records under profile-specific views, not separate product data models.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-62](issues/EVE-62.md), [EVE-71](issues/EVE-71.md), [EVE-73](issues/EVE-73.md).
- Evidence: [EVE-73/description](https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: User clarification is recorded without named Jonathan attribution for this clause. Initial coordination-only use does not establish safety-critical suitability.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### operations-planned-and-unscheduled

Initial CAD/MDT supports crew incidents and preplanned assigned production jobs with upcoming/active/history views and per-venue tour-template instances.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-13T20:12:52.978Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-62](issues/EVE-62.md), [EVE-71](issues/EVE-71.md), [EVE-73](issues/EVE-73.md), [EVE-147](issues/EVE-147.md), [EVE-148](issues/EVE-148.md).
- Evidence: [EVE-62/19700bfd-4017-4333-a804-af412c2bf840](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event#comment-19700bfd-4017-4333-a804-af412c2bf840), [EVE-71/6d21c70e-b56d-402c-8a6d-08184b4278fc](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-6d21c70e-b56d-402c-8a6d-08184b4278fc).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Retain job-versus-incident source, plan linkage and shared assignment/acknowledgement/audit. Future relative times can recalculate, but active/completed work must not silently change.
- Superseded by: None explicitly established in this record. The release-mode question left open here is resolved by operations-routine-release; planned/unscheduled scope remains.

### operations-routine-release

Routine scheduled production defaults to automatic release with configurable controller release; activation always requires start eligibility, completed predecessors and valid sign-offs.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-13T20:16:00.222Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-62](issues/EVE-62.md), [EVE-71](issues/EVE-71.md), [EVE-147](issues/EVE-147.md), [EVE-148](issues/EVE-148.md).
- Evidence: [EVE-62/9dd1bd87-d4e8-46d0-9d08-658789a0d8b7](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event#comment-9dd1bd87-d4e8-46d0-9d08-658789a0d8b7), [EVE-71/549af67f-1fb3-417e-8470-9d18d02237f3](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-549af67f-1fb3-417e-8470-9d18d02237f3), [EVE-147/99987aec-7ba6-400e-81cc-3ef65eab317c](https://linear.app/resnovas/issue/EVE-147/f77-build-the-incident-control-log-and-dispatch-for-live-events#comment-99987aec-7ba6-400e-81cc-3ef65eab317c).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Preassignment/visibility is not authorization to start. Display scheduled/blocked/ready/active distinctly without replacing canonical statuses. Reopened prerequisites on active work need alerts and documented operational decisions. Incidents still need controller approval; offline state cannot fabricate verified readiness.
- Superseded by: None explicitly established in this record. Resolves earlier routine-job release uncertainty; emergency-human-initiation still forbids automatic consequential emergency response.

### tasks-continuous-forecast

Continuously recalculate dependency-linked forecasts as predecessors run late while retaining immutable baseline, subsequent revisions, actuals and uncertainty.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-13T20:23:20.022Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-62](issues/EVE-62.md), [EVE-71](issues/EVE-71.md), [EVE-84](issues/EVE-84.md).
- Evidence: [EVE-62/6ac23009-f0ee-44d4-967b-651ccdf69549](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event#comment-6ac23009-f0ee-44d4-967b-651ccdf69549), [EVE-71/cdb2196d-2ef9-472b-adba-68c6fa179e3e](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-cdb2196d-2ef9-472b-adba-68c6fa179e3e).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Use predecessor estimates, lag, earliest starts and constraints; preserve manual locks, actual/historical completions and other shows' commitments. Readiness/approval gates are independent of forecasting.
- Superseded by: None explicitly established in this record. Originally superseded confirmation for dependency-delay cascades. Jonathan's later 2026-11-17 option B, cited in tasks-anchor-confirmation and the EVE-84 annotation, narrows that clause: every Event/Phase anchor-date change requires confirmation even when caused by a cascade; non-anchor dates may cascade automatically. Continuous forecasting, baseline/history and safety constraints remain.

### tasks-anchor-confirmation

EVE-84 covers general Event planning, not MDT only. Confirm every Event/Phase anchor-date change, including dependency-delay cascades; non-anchor dates may cascade automatically.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-62](issues/EVE-62.md), [EVE-71](issues/EVE-71.md), [EVE-84](issues/EVE-84.md).
- Evidence: [EVE-84/description](https://linear.app/resnovas/issue/EVE-84/f34-build-event-relative-due-dates-task-templates-and-reschedule).
- Implementation: Planning decision only; EVE-84 remains Backlog with implementation prerequisites. The frozen description establishes broad Event scope; the later owner relay supplies the explicit cascade distinction, not implementation acceptance.
- Concrete outstanding parameters: Jonathan supplied the conditional choice through Puck on 2026-11-17; exact owner-selection time is unknown. The complete live description and sole synchronization comment establish general Event templates and F1-owned Event/Phase/Segment/Itinerary anchors, so the broad-scope option B applies. Supplemental relay: https://linear.app/resnovas/issue/EVE-84#comment-f9c96ce3-873a-46ba-9702-bf00bcebc44d at 2026-11-17T12:31:56.867Z; authority route: https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a. Preserve absolute/completed-date exclusions, baseline/history, locks, authorization and readiness. The captured source has not been rewritten or silently reacquired.
- Superseded by: None explicitly established in this record. Resolves the earlier anchor-confirmation ambiguity and narrows only automatic rescheduling that changes an Event/Phase anchor. Does not remove template-application confirms, other anchor controls or safety gates; does not authorize deployment.

### tasks-delay-tolerance

Default automated rescheduling tolerance to 10 minutes, editable as any numeric minute value from 5 through 60 inclusive.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-13T20:25:23.091Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-62](issues/EVE-62.md), [EVE-71](issues/EVE-71.md), [EVE-84](issues/EVE-84.md).
- Evidence: [EVE-62/d7caf802-c15c-4a1d-9398-5e01083cad0c](https://linear.app/resnovas/issue/EVE-62/f3-tasks-task-lists-assignments-dependencies-and-checklists-per-event#comment-d7caf802-c15c-4a1d-9398-5e01083cad0c), [EVE-71/6c1ceaae-6636-4596-a193-ce368f725f27](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-6c1ceaae-6636-4596-a193-ce368f725f27).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Continuously show lateness/forecast/impacts below threshold. At or above tolerance, commit an idempotent working-schedule cascade and corresponding notifications without changing original baseline/history. Dependencies apply at every delay. Exact configuration scope/inheritance remains UI/policy design.
- Superseded by: None explicitly established in this record. Corrects initial verbal five-minute default and clarifies forecast-versus-committed-schedule semantics; no safety gate is relaxed. Jonathan's later tasks-anchor-confirmation decision requires confirmation whenever the cascade changes an Event/Phase anchor, regardless of tolerance; other non-anchor cascade behavior remains.

### operations-queue-first

Prioritize incident/job queue, unit/status board, assignments, acknowledgements and timestamped log in the initial MDT/live-operations product vertical; maps are optional/contextual.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-13T20:10:47.350Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-71](issues/EVE-71.md), [EVE-73](issues/EVE-73.md), [EVE-147](issues/EVE-147.md), [EVE-148](issues/EVE-148.md).
- Evidence: [EVE-71/4b4184dc-a72e-4f8a-9910-a8127ed644b6](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-4b4184dc-a72e-4f8a-9910-a8127ed644b6).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Do not require geolocation to dispatch or hard-code city/police assumptions. Precise screen priorities/map-switching remain follow-up design; no new dependencies or live safety deployment accepted.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### canonical-ids-time-decimals-reference

Follow the S4 canonical identifier, time and decimal conventions referenced by the owner-approved foundation policy.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T01:45:09.727Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-40](issues/EVE-40.md), [EVE-42](issues/EVE-42.md), [EVE-71](issues/EVE-71.md), [EVE-147](issues/EVE-147.md).
- Evidence: [EVE-71/e49f736c-0dd1-4abf-abe7-70515e14e203](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-e49f736c-0dd1-4abf-abe7-70515e14e203), [EVE-147/5e4ac4bd-3e3c-4994-b75c-c711e5f0d087](https://linear.app/resnovas/issue/EVE-147/f77-build-the-incident-control-log-and-dispatch-for-live-events#comment-5e4ac4bd-3e3c-4994-b75c-c711e5f0d087).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Reference only; exact formats are not specified in these comments. Linked decision sheet is unavailable in snapshot; resolve from independently reviewed canonical S4 source rather than inventing values.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### show-full-lifecycle-benchmark

Target one event system across rig/construction, show calling/cues/tasks/emergencies and derig/postshow, with QLab-class cue capability as a major benchmark.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T19:20:55.623Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-73](issues/EVE-73.md), [EVE-254](issues/EVE-254.md), [EVE-255](issues/EVE-255.md).
- Evidence: [EVE-73/42d78d06-088c-4d4b-8ba2-b74ee22042fe](https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show#comment-42d78d06-088c-4d4b-8ba2-b74ee22042fe).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Owner request is explicit, not blanket approval of the authored capability matrix or local technical design. No hardware/dependencies/implementation authorized.
- Superseded by: None explicitly established in this record. The native-versus-orchestration scope question left open here is answered by show-separate-native-playback. Earlier trigger/direct-DMX scope is not silently erased.

### show-local-execution-proposal

Propose a deterministic local show-execution boundary for expanded cue graphs and native playback capability.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T19:20:55.623Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-73](issues/EVE-73.md), [EVE-254](issues/EVE-254.md), [EVE-255](issues/EVE-255.md).
- Evidence: [EVE-73/42d78d06-088c-4d4b-8ba2-b74ee22042fe](https://linear.app/resnovas/issue/EVE-73/f1-events-and-production-planning-the-event-record-run-of-show#comment-42d78d06-088c-4d4b-8ba2-b74ee22042fe).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Authored technical proposal remains subject to review; the owner benchmark request does not approve detailed renderer, hardware, output routing or recovery design.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### show-separate-native-playback

Provide native QLab-class local playback/show control as a module separate from F7 MDT/CAD while sharing event lifecycle and canonical actions/records.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T19:31:07.614Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-71](issues/EVE-71.md), [EVE-73](issues/EVE-73.md), [EVE-254](issues/EVE-254.md), [EVE-255](issues/EVE-255.md), [EVE-256](issues/EVE-256.md).
- Evidence: [EVE-71/b4e8e82c-9a5f-456a-8240-7a9d2bed3bf5](https://linear.app/resnovas/issue/EVE-71/f7-fleet-and-live-operations-vehicles-maintenance-units-dispatch-and#comment-b4e8e82c-9a5f-456a-8240-7a9d2bed3bf5).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: F7 owns incidents/dispatch/units/messages/approved SOP response and links show timeline/hold/operator alerts; it must not host media playback or arbitrary scripts. This selects native capability, not a renderer, package or output implementation.
- Superseded by: None explicitly established in this record. Resolves the earlier native playback versus external-orchestration-only question; emergency-human-initiation remains mandatory.

### cross-tenant-lawful-retention

Revocation immediately stops new exchange and ordinary access while legally required contractual/payment/audit evidence stays purpose-limited and audited.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T00:46:36.066Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-116](issues/EVE-116.md), [EVE-250](issues/EVE-250.md), [EVE-251](issues/EVE-251.md).
- Evidence: [EVE-116/ec9c79b0-6d3d-4ffd-8f1c-28958f7799bf](https://linear.app/resnovas/issue/EVE-116/f132-build-the-sensitive-profile-with-field-masking-reveal-audit-and#comment-ec9c79b0-6d3d-4ffd-8f1c-28958f7799bf).
- Implementation: Planning only; implementation and owner acceptance were not independently verified.
- Concrete outstanding parameters: Erase/anonymize separable PII when lawful; valid holds suspend deletion and crypto-shredding waits for all obligations. Schedules are record/jurisdiction/purpose/law-specific. EVE-250/EVE-251 are referenced but their complete policies are not reproduced in this comment.
- Superseded by: None explicitly established in this record. No whole-record supersession established in reviewed sources.

### platform-household-display-proposal

Add household alert display and device setup documentation.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-9](issues/EVE-9.md).
- Evidence: [EVE-9/description](https://linear.app/resnovas/issue/EVE-9/set-up-home-assistant-os-runbook-and-oled-status-app).
- Implementation: No delivery or owner approval established.
- Concrete outstanding parameters: Confirm product/repository ownership, device target, alert sources and reliability acceptance before implementation.
- Superseded by: None explicitly established in this record. No explicit replacement established.

### platform-verified-tickets-proposal

Provide per-event verified investor and press ticket issuance without checkout.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-11](issues/EVE-11.md).
- Evidence: [EVE-11/description](https://linear.app/resnovas/issue/EVE-11/enable-verified-investorpress-tickets-without-checkout).
- Implementation: Request only; no completed ticket flow or approval established.
- Concrete outstanding parameters: Specify verifier authority, ticket/capacity accounting, audit, revocation and abuse controls; checkout bypass cannot imply capacity or payment-policy bypass.
- Superseded by: None explicitly established in this record. No replacement or approval established.

### platform-neutral-telemetry-spec

Remove legacy core telemetry vendor coupling and compose configurable vendor-neutral telemetry with an opt-out path.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-21](issues/EVE-21.md).
- Evidence: [EVE-21/description](https://linear.app/resnovas/issue/EVE-21/remove-sentry-from-core-and-make-telemetry-export-vendor-neutral).
- Implementation: Historical package paths describe work, not verified current implementation.
- Concrete outstanding parameters: Prove enabled/disabled exporters and absence of legacy core imports; exact exporter dependencies and hosted ingestion remain separately gated.
- Superseded by: None explicitly established in this record. Preserve intent without treating archived package layout as the fresh foundation.

### platform-boundary-documentation-spec

Keep colon-separated module tags and boundary documentation consistent with enforced rules, repairing house guidance at its source.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-22](issues/EVE-22.md).
- Evidence: [EVE-22/description](https://linear.app/resnovas/issue/EVE-22/correct-boundary-docs-to-match-lint-use-colon-tags-and-fix-the-house).
- Implementation: No documentation/lint conformance rerun in this review.
- Concrete outstanding parameters: Reconcile historical database-import allowances with later strict source/declaration graph requirements; verify cycle checks and rendered upstream template changes independently.
- Superseded by: None explicitly established in this record. Historical allowed imports do not supersede later narrower platform boundaries.

### platform-notification-messaging-spec

Use shared authorized actions for notifications, transactional email and linked-user messaging, with neutral channel services and verified inbound requests.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-24](issues/EVE-24.md).
- Evidence: [EVE-24/description](https://linear.app/resnovas/issue/EVE-24/port-notifications-messaging-channels-and-transactional-email).
- Implementation: Specification only; channel integration and acceptance not verified.
- Concrete outstanding parameters: Define exact channel SDK approvals, linked-account identity mapping, replay windows and delivery behavior. Start with in-app/email, then the specified workplace channels; exclude marketing and calls.
- Superseded by: None explicitly established in this record. No explicit replacement established.

### platform-private-files-spec

Provide permission-checked private files, offline uploads, document import and versioned run-linked artifacts through neutral storage ports.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-25](issues/EVE-25.md).
- Evidence: [EVE-25/description](https://linear.app/resnovas/issue/EVE-25/port-files-private-attachments-artifacts-and-document-import).
- Implementation: Specification only; no storage, import or offline proof verified.
- Concrete outstanding parameters: Write deletion/orphan-retention rules; select approved storage/import dependencies and key-broker integration; prove encrypted bytes, denied access and offline reconnect. No public CDN default.
- Superseded by: None explicitly established in this record. No explicit replacement established.

### platform-authorized-search-spec

Search registered resource projections with permission filtering inside the query, including counts; support offline keyword search and online semantic search without payer fallback.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-26](issues/EVE-26.md).
- Evidence: [EVE-26/description](https://linear.app/resnovas/issue/EVE-26/port-search-and-embeddings-across-every-resource).
- Implementation: Specification only; no index or permission-leak tests verified.
- Concrete outstanding parameters: Approve exact full-text/vector dependencies and embedding provider separately; specify index freshness, tenant-safe reindexing and offline scope. External web search is excluded.
- Superseded by: None explicitly established in this record. No explicit replacement established.

### platform-review-suggestions-spec

Treat suggestions as pending original actions executed under the authorized accepter, retaining proposer attribution and stable comment anchors.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-27](issues/EVE-27.md).
- Evidence: [EVE-27/description](https://linear.app/resnovas/issue/EVE-27/port-comments-mentions-and-review-suggestions-on-any-resource).
- Implementation: Specification only; no suggestion acceptance or concurrent-anchor proof verified.
- Concrete outstanding parameters: Specify stored-input/version compatibility, approval expiry, anchored position mapping and offline conflict behavior; comment permission never implies accept permission.
- Superseded by: None explicitly established in this record. No action-specific human approval is implied by this generic workflow.

### platform-modular-localization-spec

Localize human and agent presentation with module-owned message bundles while preserving canonical concepts and offline availability.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-28](issues/EVE-28.md).
- Evidence: [EVE-28/description](https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent).
- Implementation: Agent reports metadata contracts only; activation and full screen/agent localization remain unverified.
- Concrete outstanding parameters: Select an approved i18n implementation, fallback/missing-key policy and catalogue lifecycle tests; operational terminology ownership follows the explicit tenant-admin correction, not personal choice.
- Superseded by: None explicitly established in this record. Tenant-admin operational terminology refines the separation of locale and domain vocabulary.

### platform-terminology-original-direction

Separate locale, domain vocabulary, operational phraseology and organization overlays; preserve canonical IDs, lawful provenance and historical profile versions.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T19:14:01.565Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-28](issues/EVE-28.md).
- Evidence: [EVE-28/0e12aa2d-1d85-42a7-940a-31a3e4835b4c](https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent#comment-0e12aa2d-1d85-42a7-940a-31a3e4835b4c).
- Implementation: Reported metadata increment is not profile activation, source licensing or safety conformance.
- Concrete outstanding parameters: Profile authority, jurisdiction, licence, mapping confidence and cross-profile tests must be supplied. The original personal operational-profile selection clause is no longer current.
- Superseded by: [platform-tenant-admin-terminology](#platform-tenant-admin-terminology). Partial supersession only: the next explicit correction replaces personal operational terminology selection, not provenance, canonical IDs or historical evidence requirements.

### platform-tenant-admin-terminology

Tenant administrators select operational/domain terminology consistently; users may choose safe locale and accessibility presentation, not independent operational meanings.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T19:15:09.373Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-28](issues/EVE-28.md).
- Evidence: [EVE-28/1c4b2cd5-0fc0-481d-9a08-02ebf0fa272c](https://linear.app/resnovas/issue/EVE-28/port-localization-for-people-and-for-the-agent#comment-1c4b2cd5-0fc0-481d-9a08-02ebf0fa272c).
- Implementation: Agent reports provenance/version references delivered; persisted selection, governed activation and licensing are not proven.
- Concrete outstanding parameters: Specify administrator preview, ambiguity and training-impact checks, versioned activation/audit, regulated-form locale policy and governed event/channel exceptions; preserve cross-tenant source-profile labels.
- Superseded by: None explicitly established in this record. Explicitly replaces only user-selectable operational terminology in the preceding direction.

### platform-agent-evaluations-spec

Maintain repeatable action-based agent evaluations from redacted traces and authored cases, with CI checks that detect deliberately worse prompts.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-29](issues/EVE-29.md).
- Evidence: [EVE-29/description](https://linear.app/resnovas/issue/EVE-29/port-agent-evaluations-linked-to-posthog-datasets).
- Implementation: No evaluation execution or redacted dataset inspected.
- Concrete outstanding parameters: Choose capability-specific scorers/thresholds, fast versus nightly partition and approved dataset/ingestion dependencies; preserve permission, cost and PII-negative cases.
- Superseded by: None explicitly established in this record. No hosted dataset ingestion or paid service authorization is implied.

### platform-dashboards-widgets-spec

Use typed portable widgets and saved action queries that rerun under viewer permissions, with organization brand styling.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-30](issues/EVE-30.md).
- Evidence: [EVE-30/description](https://linear.app/resnovas/issue/EVE-30/port-data-widgets-saved-dashboards-and-brand-kits).
- Implementation: No rendered dashboard or permission-parity test verified.
- Concrete outstanding parameters: Specify query/input version compatibility, sharing authority, truncation and approved rendering components; never use privileged stored data snapshots as panel authorization.
- Superseded by: None explicitly established in this record. No explicit replacement established.

### platform-voice-spec

Voice input produces the same confirmed authorized actions as touch, with event vocabulary, provider-neutral transcription and no default audio retention.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-31](issues/EVE-31.md).
- Evidence: [EVE-31/description](https://linear.app/resnovas/issue/EVE-31/port-voice-input-and-transcription-for-the-agent).
- Implementation: Offline recognition and confirmation behavior not executed in this review.
- Concrete outstanding parameters: Approve exact transcription/device APIs, consent/retention rules and supported offline command set; offline recognition cannot confirm authoritative dispatch or safety effects.
- Superseded by: None explicitly established in this record. No operational safety floor is relaxed.

### platform-settings-navigation-spec

Expose schema-driven scoped settings, profiles, onboarding and permission-filtered navigation equally to people and agents.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-32](issues/EVE-32.md).
- Evidence: [EVE-32/description](https://linear.app/resnovas/issue/EVE-32/port-settings-profiles-navigation-command-menu-and-onboarding).
- Implementation: No generated-settings or screen action parity proof verified.
- Concrete outstanding parameters: Define setting ownership/defaults, onboarding progress scope and approved UI components. General navigation belongs with screen awareness; billing settings are excluded.
- Superseded by: None explicitly established in this record. Screen-awareness allocation is reflected in the later EVE-50 specification; no duplicate registry.

### platform-shared-scheduling-spec

Reuse generic scheduling for people, vehicles, equipment and rooms with conflict detection, DST-safe computation and visible offline conflicts.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-33](issues/EVE-33.md).
- Evidence: [EVE-33/description](https://linear.app/resnovas/issue/EVE-33/port-scheduling-primitives-for-availability-bookings-and-rosters).
- Implementation: No booking/DST or large-roster cluster test inspected.
- Concrete outstanding parameters: Specify recurrence/time-zone rules, resource authority and provider dependencies; offline edits remain pending until authoritative capacity checks, not confirmed double-bookings.
- Superseded by: None explicitly established in this record. Interpret offline work within later immutable authoritative-operation safeguards.

### platform-workflow-resume-spec

Model agent runs as durable workflows with independently idempotent model/tool activities, resuming completed-step evidence after runner loss.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-34](issues/EVE-34.md), [EVE-54](issues/EVE-54.md).
- Evidence: [EVE-34/description](https://linear.app/resnovas/issue/EVE-34/agent-runs-restart-from-scratch-when-their-shard-moves), [EVE-54/description](https://linear.app/resnovas/issue/EVE-54/p18c-build-durable-agent-runs-on-effect-cluster-and-workflow).
- Implementation: Historical restart observations and specified kill tests are not current two-runner implementation proof.
- Concrete outstanding parameters: Approve exact Cluster/Workflow dependencies, persist composition/schema/provider pins and effect keys, test crash boundaries and live revocation. Active workflow leases must reject destructive updates until safely released; never force-repin to permit update.
- Superseded by: None explicitly established in this record. Later durable-module update requirements refine, not replace, resumable-run intent.

### platform-session-responsiveness-spec

Keep long workflows separate from short session commands so cancel, status and approval messages remain responsive.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-35](issues/EVE-35.md).
- Evidence: [EVE-35/description](https://linear.app/resnovas/issue/EVE-35/keep-a-long-agent-run-from-blocking-its-entitys-other-messages).
- Implementation: No measured cancel-while-busy result supplied in reviewed sources.
- Concrete outstanding parameters: Test a subsecond cancel reply during a long step and document any explicit entity concurrency; historical mailbox blocking measurements are baseline evidence only.
- Superseded by: None explicitly established in this record. No explicit replacement established.

### platform-durable-output-stream-spec

Persist run output by stable offsets and resume client reads after runner loss without visible gaps or duplicate presentation.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-36](issues/EVE-36.md).
- Evidence: [EVE-36/description](https://linear.app/resnovas/issue/EVE-36/stream-agent-output-from-a-durable-log-not-volatile-rpcs).
- Implementation: No two-runner stream recovery test executed in this review.
- Concrete outstanding parameters: Choose approved notification/polling and client transport; define cursor retention and atomic step/output persistence. Offset dedup is not exactly-once underlying delivery or external effects.
- Superseded by: None explicitly established in this record. No explicit replacement established.

### platform-entity-hosting-runner-spec

Avoid entity-empty shard-owning managers; runners that own shards must host the relevant entity types.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-37](issues/EVE-37.md).
- Evidence: [EVE-37/description](https://linear.app/resnovas/issue/EVE-37/remove-the-shard-manager-process-that-owns-shards-with-no-entities).
- Implementation: Historical demo defect report only; fresh foundation composition not reverified.
- Concrete outstanding parameters: Demonstrate two valid runners and no unregistered-entity delivery failures; reconcile old demo/manifests against fresh EVE-252 ownership without importing archived implementation.
- Superseded by: None explicitly established in this record. Retain behavioral requirement, not archived paths as an implementation baseline.

### platform-failover-tuning-proposal

Tune failover through typed cluster configuration, with a proposed ten-second lock expiry and measured reassignment budget.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-38](issues/EVE-38.md).
- Evidence: [EVE-38/description](https://linear.app/resnovas/issue/EVE-38/cut-runner-loss-failover-from-36s-and-expose-the-cluster-settings-in).
- Implementation: Historical roughly 36-second failure baseline is reported; no after measurement or production SLO acceptance established.
- Concrete outstanding parameters: Validate proposed refresh3s/expiry10s/termination15s/shards300 and health interval against real SQL runners; eliminate database/runner address collisions and falsely advertised layer outputs.
- Superseded by: None explicitly established in this record. Numeric proposal defaults are not an approved availability guarantee.

### platform-persisted-entity-actions-spec

Persist mutating entity actions and atomically store deduplication with the state change so retries cannot double-apply business effects.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-39](issues/EVE-39.md).
- Evidence: [EVE-39/description](https://linear.app/resnovas/issue/EVE-39/make-every-entity-action-idempotent-and-persisted-by-default).
- Implementation: Historical duplicate observations motivate the requirement; no fresh two-runner row-count proof verified.
- Concrete outstanding parameters: Use stable entity/action idempotency keys and explicit volatile opt-in, test process loss and concurrent duplicates, and apply live replay authorization plus business-record retention from A1.
- Superseded by: None explicitly established in this record. A1 provides the stronger atomic boundary; this record does not claim exactly-once transport.

### platform-action-inventory-spec

Keep portable action specifications separate from handlers and drive all surfaces through one current-identity authorized runtime with scoped atomic registration and parity checks.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-40](issues/EVE-40.md).
- Evidence: [EVE-40/description](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema), [EVE-40/fa3a5b15-87a8-4b1d-a41b-ea89e9beb12a](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema#comment-fa3a5b15-87a8-4b1d-a41b-ea89e9beb12a).
- Implementation: Agent reports API/tests and exact-head CI delivery; no independent runtime/production acceptance was executed by this review.
- Concrete outstanding parameters: Prove read/write/external provider-schema snapshots, duplicate/missing metadata rejection, registration cleanup and actual surface reachability; parity belongs in verify/application check, not dependency-free house check.
- Superseded by: None explicitly established in this record. The description explicitly replaces handler-bearing portable definitions and schema-package action authority.

### platform-a1-original-proposal

Originally proposed atomically committing authoritative mutation, deduplication, history, outbox and receipt with live replay checks.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-11-14T22:01:56.117Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-40](issues/EVE-40.md).
- Evidence: [EVE-40/fa3a5b15-87a8-4b1d-a41b-ea89e9beb12a](https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema#comment-fa3a5b15-87a8-4b1d-a41b-ea89e9beb12a).
- Implementation: Proposal source is not its own approval.
- Concrete outstanding parameters: Current policy is the later explicit A1 approval; lower-risk idempotency retention still requires compatibility/audit windows.
- Superseded by: [architecture-02](#architecture-02). A1 approved separately at 22:35; do not cite this proposal as the approval artifact.

### platform-s1-original-proposal

Originally proposed authenticated tenant database/branch routing with narrowly shared control metadata.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-11-14T22:01:56.621Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-42](issues/EVE-42.md).
- Evidence: [EVE-42/fe5c339d-4de7-4a46-a71e-a7ae0967f485](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-fe5c339d-4de7-4a46-a71e-a7ae0967f485).
- Implementation: Historical proposal, not the approval source.
- Concrete outstanding parameters: Use later separate-database and production-isolation directions; a branch is not automatically equivalent to independently isolated production infrastructure.
- Superseded by: [architecture-04](#architecture-04), [neon-production-direction](#neon-production-direction). Later S1 and production-specific directions narrow this original database/branch wording.

### platform-broad-sql-dependency-proposal

A broad initial dependency request included SQL, Drizzle tooling, native build permissions and an unselected database image.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T01:16:21.474Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-42](issues/EVE-42.md).
- Evidence: [EVE-42/ebdee5e0-80c0-4165-b1f5-bb7774bcf590](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-ebdee5e0-80c0-4165-b1f5-bb7774bcf590).
- Implementation: Explicitly unapproved request; later research corrects native-build assumptions.
- Concrete outstanding parameters: Drizzle ORM0.45.4/Kit0.31.11/sql-drizzle0.51.1 and any esbuild/build exception remain outside SQL-only approval; no build allowance may be inferred.
- Superseded by: [platform-sql-only-recommendation](#platform-sql-only-recommendation), [platform-exact-sql-only-approval](#platform-exact-sql-only-approval). Partial replacement: SQL-only scope proceeds; deferred Drizzle/tooling risk is not approved by deferral.

### platform-sql-only-recommendation

Research recommends an SQL-only first increment, deferring risky Drizzle tooling and rejecting unnecessary native build permissions.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T01:54:26.340Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-42](issues/EVE-42.md).
- Evidence: [EVE-42/ade562e4-6b6b-4230-8c8c-a820f83fc322](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-ade562e4-6b6b-4230-8c8c-a820f83fc322).
- Implementation: Research compatibility claims are not installation, image-risk or owner acceptance.
- Concrete outstanding parameters: Separate native prebuild feasibility, transitive tooling advisory remediation and SQL-Drizzle side-effect exceptions; no direct esbuild or tsx is required by this recommendation.
- Superseded by: [platform-exact-sql-only-approval](#platform-exact-sql-only-approval). Later approval covers only the exact SQL-only increment; deferred tooling remains unapproved.

### platform-exact-sql-only-approval

Approve only the exact SQL/PostgreSQL first increment, with no native build allowances and no Drizzle, sync/device, extra runtime or paid-provider dependencies.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T03:44:18.071Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-42](issues/EVE-42.md).
- Evidence: [EVE-42/f9427783-867d-49ea-8097-adc786220c11](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-f9427783-867d-49ea-8097-adc786220c11).
- Implementation: Partial SQL delivery is reported; this review does not validate installability or image-risk acceptance.
- Concrete outstanding parameters: Approved sql0.52.2/sql-pg0.53.1/sql-sqlite-node0.54.1, dev types/pg8.23.1 and locked pg8.23.1/better-sqlite3 13.0.3 plus PG17/exact Bookworm digest; no native scripts. Stop SQLite if the approved prebuild fails. The separately recorded sql-test-image-bounded-risk-exception specifies synthetic-only image scope, expiry and unsuppressed findings, not blanket CVE acceptance.
- Superseded by: None explicitly established in this record. Exact dependency/image selection is not production authorization or blanket CVE acceptance.

### platform-synthetic-development-target

Use only the bounded synthetic London PostgreSQL development target, with quotas, secure credentials and logical replication disabled.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T03:58:42.562Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-42](issues/EVE-42.md), [EVE-51](issues/EVE-51.md).
- Evidence: [EVE-42/b60b3090-6ad5-49b8-93f0-759ee83819c0](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-b60b3090-6ad5-49b8-93f0-759ee83819c0), [EVE-51/0fb5beb4-3d90-4a1b-a5b7-761193106735](https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and#comment-0fb5beb4-3d90-4a1b-a5b7-761193106735).
- Implementation: Test provisioning and live checks are reported, not independently queried; no project identifiers or credentials reproduced.
- Concrete outstanding parameters: Limits: active36000s, compute9000s, written100MiB, transfer1GiB, logical100MiB, fixed0.25CU, restore6h. Autosuspend is unproven; no CDC, additional project, paid tier or production use authorized.
- Superseded by: [platform-legacy-test-target-retirement](#platform-legacy-test-target-retirement). Partial supersession only: legacy preservation is replaced by the later explicit retirement; current synthetic target and quota/CDC limits remain.

### platform-legacy-test-target-retirement

Retire only the explicitly authorized empty legacy database project and use the preserved synthetic development target instead.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T04:01:10.506Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-42](issues/EVE-42.md), [EVE-51](issues/EVE-51.md).
- Evidence: [EVE-42/775139d8-eb75-4e8a-9e07-7932627617c6](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-775139d8-eb75-4e8a-9e07-7932627617c6), [EVE-42/5dbae902-823e-469e-a334-fc230cf50d43](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-5dbae902-823e-469e-a334-fc230cf50d43), [EVE-51/a1d0023c-fff0-45ca-8253-882fe9c2f4d7](https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and#comment-a1d0023c-fff0-45ca-8253-882fe9c2f4d7).
- Implementation: Deletion and independent inventory are reported, not rerun. This is a completed one-resource authorization record, not a reusable deletion grant.
- Concrete outstanding parameters: Do not reconnect to, recreate or reuse credentials for the retired project; preserve synthetic-only, quota and disabled-CDC limits on the remaining target.
- Superseded by: None explicitly established in this record. Explicitly supersedes the earlier legacy-preservation clause only.

### platform-cluster-core-direction

Cluster-backed sharding is mandatory core: Community defaults to one cluster-capable runner, Cloud/Production to multiple independent runners, sharing authorization and durable integrity paths.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T10:44:12.886Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-42](issues/EVE-42.md), [EVE-252](issues/EVE-252.md).
- Evidence: [EVE-42/c356a918-294e-4421-b902-60785cfca534](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-c356a918-294e-4421-b902-60785cfca534).
- Implementation: Direction recorded; EVE-252 bodies were not reviewed in this pass and no multi-runner acceptance is inferred.
- Concrete outstanding parameters: Prove one and multiple runners, drain/loss/fencing and persisted action recovery; integration transport/runner storage must not enter Expo contracts or impose managed hosting on self-hosted users. Exact packages remain separately approved.
- Superseded by: None explicitly established in this record. No optional-future-cluster interpretation is compatible with this explicit direction.

### platform-development-credential-exception

Allow the existing full-access credential for synthetic development without blocking on staged restricted-role credentials; production still requires least privilege and key-management proof.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T11:22:52.419Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-42](issues/EVE-42.md).
- Evidence: [EVE-42/3172133e-baa0-4c6c-8dbc-394e04c344c6](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-3172133e-baa0-4c6c-8dbc-394e04c344c6).
- Implementation: Role metadata was reported; effective-role DML/RLS execution failed before proof. This review did not access credentials or database state.
- Concrete outstanding parameters: Do not rotate/replace the existing secret as part of this exception; validate production runtime/migrator privileges, default grants and key handling separately. No CDC/provider-setting change is authorized.
- Superseded by: None explicitly established in this record. Development-only exception does not lower production isolation or least-privilege floors.

### platform-observation-feed-spec

Use one after-commit durable event/outbox/change-feed engine with tenant cursors, fenced retries and subscription-specific deduplication; hooks cannot veto, mutate or rerun the original action.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-45](issues/EVE-45.md).
- Evidence: [EVE-45/description](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change).
- Implementation: Agents report cursor/replay and synthetic sink crash proofs; automatic producers, native consumers and production release remain unaccepted. EVE-45 stays In Progress.
- Concrete outstanding parameters: Prove crash before/after enqueue/effect/ack, ordering, bounded capacity, cancellation, replay, revoked subscriptions and data-classified redaction across errors/logs/dead letters; no protected/emergency autonomous side effects or exactly-once delivery claim.
- Superseded by: None explicitly established in this record. EVE-262 governs typed dispatch/gateway and EVE-45 retains durable producer/storage/recovery; no second engine.

### platform-runtime-incarnation-direction

Each runtime restart creates a fresh persisted incarnation UUID linked to stable logical runtime identity; never reuse an unfenced session/incarnation.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-45](issues/EVE-45.md).
- Evidence: [EVE-45/description](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change).
- Implementation: Explicitly attributed owner approval is recorded in the undated description; journal implementation and acceptance are not established by earlier agent reports.
- Concrete outstanding parameters: Specify durable incarnation creation, ready-generation association and uniqueness/fencing tests through crashes; do not infer provenance from process-local snapshots.
- Superseded by: None explicitly established in this record. Resolves the prior incarnation-versus-resumption proposal question, not implementation acceptance.

### platform-callback-ambiguity-direction

Record callback-success/crash-before-confirmation as unresolved and reconcile through stable idempotency and authoritative status, never blind replay.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-45](issues/EVE-45.md).
- Evidence: [EVE-45/description](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change).
- Implementation: Description records explicit approval; no completed durable callback journal/reconciliation proof is present in reviewed evidence.
- Concrete outstanding parameters: Define unresolved-operation states, authoritative lookup contracts, retry/operator recovery and audit; test success/crash/ack loss independently from SQL-only atomic consumers.
- Superseded by: None explicitly established in this record. Resolves prior callback semantics question only; journal and external-adapter proof remain work.

### platform-committed-transition-provenance-direction

Lifecycle events mean committed transitions; invocation attempts/outcomes are separate observations and producer identity comes from authoritative tenant/purpose/profile/module/version/generation bindings.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-45](issues/EVE-45.md).
- Evidence: [EVE-45/description](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change).
- Implementation: Description records explicit approval; actual transition producer/journal integration is not established by local lifecycle spans or synthetic consumer tests.
- Concrete outstanding parameters: Specify cascade/disposal observations, authoritative security classification, module pins and durable atomic publication; reject snapshot-inferred identity and fabricated automatic-producer success.
- Superseded by: None explicitly established in this record. Resolves earlier transition-versus-invocation semantics question without declaring EVE-45 or EVE-261 complete.

### platform-http-session-proof-spec

Derive HTTP/OpenAPI/client interfaces from actions and require separately verified credential proof; a public session UUID never grants access.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-46](issues/EVE-46.md).
- Evidence: [EVE-46/description](https://linear.app/resnovas/issue/EVE-46/p17-build-the-http-api-streaming-and-the-typed-client-from-the-action).
- Implementation: No external transport or authentication proof executed; fixed diagnostic identity is not an approved network identity resolver.
- Concrete outstanding parameters: Before network exposure isolate/replace diagnostic resolver; test guessed/copied IDs, expired/revoked credentials, tenant/action limits, route parity and cancellable ordered streams. Select an approved proof mechanism and exact SDKs separately.
- Superseded by: None explicitly established in this record. Session-proof appendix tightens the transport acceptance requirement without treating correlation IDs as secrets.

### platform-agent-umbrella-spec

Agent implementation must share action permissions/approvals and pass a killed/resumed approved-write end-to-end scenario, not merely close component issues.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-47](issues/EVE-47.md).
- Evidence: [EVE-47/description](https://linear.app/resnovas/issue/EVE-47/p18-build-the-agent-loop-engines-durable-runs-threads-and-harness).
- Implementation: No umbrella end-to-end execution or audit inspected.
- Concrete outstanding parameters: Demonstrate one applied write under delegated user authority across kill/resume, supported engine payer rules and all subissue acceptance evidence; distinguish business effect dedup from transport attempts.
- Superseded by: None explicitly established in this record. No explicit replacement established.

### platform-inbound-mcp-spec

Expose the authorized action inventory through MCP with permission-preserving identity, approvals, cancellation and change-feed resources.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-48](issues/EVE-48.md).
- Evidence: [EVE-48/description](https://linear.app/resnovas/issue/EVE-48/p19-build-inbound-mcp-from-the-action-inventory).
- Implementation: No HTTP/stdio SDK conformance or live client verified.
- Concrete outstanding parameters: Approve exact MCP SDK version; test tool parity, denied calls, cancellation and approval elicitation versus pending-link fallback on both supported transports.
- Superseded by: None explicitly established in this record. Mentioned candidate SDK version is not a dependency approval.

### platform-inbound-acp-spec

Expose Eventiva's agent over authenticated inbound ACP stdio with durable sessions, human permission requests and cancellable execution.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-49](issues/EVE-49.md).
- Evidence: [EVE-49/description](https://linear.app/resnovas/issue/EVE-49/p110-build-inbound-acp-so-editors-can-drive-eventivas-agent).
- Implementation: No SDK transport test or editor/version check verified.
- Concrete outstanding parameters: Approve exact ACP SDK; prove initialize/new/load/prompt/permission/cancel, and one real editor. Keep experimental network transports disabled until separately stable/approved.
- Superseded by: None explicitly established in this record. No explicit replacement established.

### platform-screen-awareness-spec

Register every screen interaction against canonical actions and expose only viewer-authorized declared screen state, reusing the single declarative UI substrate.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-50](issues/EVE-50.md).
- Evidence: [EVE-50/description](https://linear.app/resnovas/issue/EVE-50/p111-build-screen-awareness-app-state-navigation-and-the-screen).
- Implementation: Agent reports portable lazy context delivery, not activated app UI, WebMCP or native acceptance.
- Concrete outstanding parameters: Test unbound/unknown actions, protected-node immutability, stale/revoked projection removal, real web and Android parity and sensitive-value-safe trace correlation; native execution cannot be replaced with web schema tests.
- Superseded by: None explicitly established in this record. EVE-259 owns constrained schema/registry/renderer; no duplicate registry or implicit executable federation acceptance.

### platform-collaboration-conflicts-spec

Use PowerSync records plus Yjs text/canvas with action-authorized guarded changes, explicit conflicts and immediate revoked-document teardown.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-51](issues/EVE-51.md).
- Evidence: [EVE-51/description](https://linear.app/resnovas/issue/EVE-51/p112-build-collaboration-yjs-for-text-and-canvas-with-record-sync-and).
- Implementation: Prior device outcomes are reported in the specification; no fresh convergence or revocation execution performed here.
- Concrete outstanding parameters: Per-field record merge; CAS for guarded fields; append-only quantities; membership/fractional ordering; Yjs property convergence, not last-arrival-wins. Destroy revoked documents/presence/undo immediately. Exact sync/device/crypto packages, CDC and offline web shell remain separately gated.
- Superseded by: None explicitly established in this record. Canvas convergence correction supersedes any implied same-property last-arrival-wins promise, not the selected record/document architecture.

### platform-agent-turn-loop-spec

Run turns through inventory-derived tools, approval pause/resume, redacted errors/context and progress events under the user's authority.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-52](issues/EVE-52.md).
- Evidence: [EVE-52/description](https://linear.app/resnovas/issue/EVE-52/p18a-build-the-agent-turn-loop-with-actions-as-tools).
- Implementation: No scripted-model or 200-action tool-search tests verified.
- Concrete outstanding parameters: Approve exact AI dependencies, tool-search selection semantics and persisted pause boundaries; test read/approved write/denial/error cases without secrets in prompts.
- Superseded by: None explicitly established in this record. Relative latest-major discussion is not an exact approved dependency set.

### platform-model-provider-launch-direction

Use sanctioned API-key/user-billed model flows with explicit payer identity, quota/audit and typed credential failure; never silently switch to platform-funded inference.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-53](issues/EVE-53.md).
- Evidence: [EVE-53/description](https://linear.app/resnovas/issue/EVE-53/p18b-build-model-engines-model-selection-and-user-owned-subscriptions).
- Implementation: Description attributes the launch matrix to Jonathan; provider signups/credentials/dependencies and no-fallback acceptance not independently verified.
- Concrete outstanding parameters: Keys: Anthropic/OpenAI/Gemini/Vertex/Mistral/Foundry; user-billed OpenRouter PKCE/Copilot SDK; local desktop/self-hosted Ollama and Cloud keys; desktop ACP holds no credential. ChatGPT plan flow requires private-client approval first; Claude/Gemini/Mistral consumer subscriptions excluded. Exact SDKs, provider terms, retries/timeouts and quotas need verification.
- Superseded by: None explicitly established in this record. No conditional provider flow becomes approved merely because it appears in the matrix.

### platform-agent-thread-spec

Use one tenant-scoped persisted conversation model across surfaces, with bounded model-context projections and synced offline reads.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-55](issues/EVE-55.md).
- Evidence: [EVE-55/description](https://linear.app/resnovas/issue/EVE-55/p18d-build-chat-threads-and-message-projections).
- Implementation: No persisted stream/HTTP/projection roundtrip executed.
- Concrete outstanding parameters: Define exact message-format compatibility, sharing authority, trimming limits and change-feed cursor behavior; preserve permission filtering across cached/offline projections.
- Superseded by: None explicitly established in this record. No explicit replacement established.

### platform-outbound-harness-memory-spec

Support outbound ACP under the same permission policy, user/tenant-editable agent memory and exact redacted turn-context inspection.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-56](issues/EVE-56.md).
- Evidence: [EVE-56/description](https://linear.app/resnovas/issue/EVE-56/p18e-build-the-agent-harness-outbound-acp-agent-memory-and-context).
- Implementation: No outbound transport/resume or memory deletion tests inspected.
- Concrete outstanding parameters: Approve exact nondeprecated ACP SDK and external process boundary, map permissions/cancel/loadSession, and test memory tenancy, deletion and secret-redacted context reconstruction.
- Superseded by: None explicitly established in this record. No external-agent unrestricted authority is granted.

### platform-native-otlp-spike-spec

Measure native OTLP trace/metric export, loss and bundle cost in an isolated spike using a local receiver, without hosted ingestion authorization.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-57](issues/EVE-57.md).
- Evidence: [EVE-57/description](https://linear.app/resnovas/issue/EVE-57/telemetry-f1-spike-effect-otlp-export-of-traces-and-metrics-from-expo).
- Implementation: No native target or serialization result is supplied by the reviewed sources.
- Concrete outstanding parameters: Record iOS/Android release/Hermes versions, JSON/protobuf support, background/offline/kill losses and size delta; fallback is conditional on results, not approved silently. No hosted project or main implementation is authorized by this spike.
- Superseded by: None explicitly established in this record. A proposed measurement/fallback path is not achieved native support.

### platform-otlp-endpoint-proof-spec

Verify signal-specific OTLP endpoints/authentication and actual ingestion on a separately owner-authorized dedicated development project.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-58](issues/EVE-58.md).
- Evidence: [EVE-58/description](https://linear.app/resnovas/issue/EVE-58/telemetry-f2-smoke-test-posthog-otlp-endpoints-and-auth-for-logs).
- Implementation: Project authorization and ingestion results are absent here; candidate headers/endpoints are not confirmed values.
- Concrete outstanding parameters: Require dedicated-project go-ahead, secure server credentials, signal/auth/result matrix and queried arrival counts, including AI-span filtering negative control; do not provision or reuse another project by inference.
- Superseded by: None explicitly established in this record. No explicit replacement established.

### platform-early-access-parity-spec

Provide Early Access enrollment through a shared Flags service on web/native/server, with a permission-checked server-side feature listing and safe no-op behavior.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-59](issues/EVE-59.md).
- Evidence: [EVE-59/description](https://linear.app/resnovas/issue/EVE-59/telemetry-f3-implement-early-access-enrollment-on-native-and-server).
- Implementation: No enrollment payload/source or cross-runtime result verified.
- Concrete outstanding parameters: Pin and inspect actual web SDK enrollment event/property semantics, golden-test native/Node parity and flag reload, protect server listing credentials and cache safe offline values. Expected field names are not verified implementation inputs.
- Superseded by: None explicitly established in this record. No unapproved ingestion/dependency authorization follows from the parity requirement.

### platform-ios-sync-proof-spec

Require target-specific iOS and Safari synchronization/revocation checks before claiming those platforms supported, without blocking initial portable collaboration work.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-240](issues/EVE-240.md).
- Evidence: [EVE-240/description](https://linear.app/resnovas/issue/EVE-240/s4-follow-up-run-the-powersync-and-yjs-device-test-on-ios).
- Implementation: The specification explicitly says iOS/Safari were unrun; no later result appears in this issue's reviewed comments.
- Concrete outstanding parameters: Use an authorized Mac/Xcode/device or simulator, record versions and six sync/offline/restart/convergence/revocation outcomes plus Safari/WebKit. Development cleartext exception stays host-scoped; no production client or distribution authorization.
- Superseded by: None explicitly established in this record. Web/Android results cannot supersede missing iOS proof.

### platform-social-suite-proposal

Consider channel-specific social publishing, shared inbox conversations and posting-time analytics.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-241](issues/EVE-241.md).
- Evidence: [EVE-241/description](https://linear.app/resnovas/issue/EVE-241/add-social-publishing-shared-inbox-and-analytics-suite).
- Implementation: Sparse request only; no product integration approval established.
- Concrete outstanding parameters: Confirm product ownership, external ERP boundary, channel scopes, metrics/privacy policy and exact dependencies before executable work.
- Superseded by: None explicitly established in this record. No explicit replacement or approval established.

### platform-paid-ai-gate-restoration-spec

Restore paid AI review gates only after the owner separately approves budgets and restoration, preserving the temporary zero-spend exception until then.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-248](issues/EVE-248.md).
- Evidence: [EVE-248/description](https://linear.app/resnovas/issue/EVE-248/revisit-and-remove-eventivas-temporary-house-ai-gate-override).
- Implementation: No approved budget amounts or live restoration read-back are present in the reviewed issue.
- Concrete outstanding parameters: Record budget amounts/scope/hard-stop/alerts and explicit restoration choice, validate effective preset/ruleset and review one billing cycle later. A successful quality workflow is not billing authorization.
- Superseded by: None explicitly established in this record. Future removal request does not itself authorize raising budgets or enabling paid gates.

### platform-investor-merge-proposal

Consider integrating investor verification/profile/dashboard changes from the named test branch.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-249](issues/EVE-249.md).
- Evidence: [EVE-249/description](https://linear.app/resnovas/issue/EVE-249/rebase-investor-tests-into-production-and-merge-changes).
- Implementation: No exact revision, gate evidence or production permission established.
- Concrete outstanding parameters: Reconcile reset/fresh-foundation ownership, exact diff and acceptance; repository code delivery is distinct from production deployment or enabling checkout-free tickets.
- Superseded by: None explicitly established in this record. No production merge approval inferred from the short request.

### platform-marketplace-selection-direction

Select the controlled participant-scoped marketplace with revocable grants and durable idempotent saga/outbox workflows, preserving tenant ownership, public projection limits and supplier-owned noncustodial financial records.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-16T18:51:51.499Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-250](issues/EVE-250.md).
- Evidence: [EVE-250/91db949b-6e9c-4cc8-8a80-879f2d815be3](https://linear.app/resnovas/issue/EVE-250/decide-controlled-cross-tenant-marketplace-gateway-architecture#comment-91db949b-6e9c-4cc8-8a80-879f2d815be3), [EVE-250/description](https://linear.app/resnovas/issue/EVE-250/decide-controlled-cross-tenant-marketplace-gateway-architecture).
- Implementation: Agents report metadata/intents and later SQL recovery increments; no external saga effects, private release, complete marketplace or owner acceptance proven.
- Concrete outstanding parameters: Bounded engineering may proceed under existing dependencies/security. Specify freshness, reconciliation basis, compensation/manual recovery, staff access and legal/retention/residency policies; no direct tenant DB access, global ACID, crypto/provider/provisioning/spend authorization.
- Superseded by: None explicitly established in this record. Explicitly supersedes proposal-only architecture selection, not unresolved detailed policies or concrete security composition gates.

### platform-marketplace-product-spec

Preserve public allowlists, private two-party enquiry threads, requirement-level quote comparison and mixed awards with separate supplier contracts, commitments, invoices and reconciliation streams.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-250](issues/EVE-250.md).
- Evidence: [EVE-250/description](https://linear.app/resnovas/issue/EVE-250/decide-controlled-cross-tenant-marketplace-gateway-architecture).
- Implementation: Requirements are summarized by the description; original out-of-range product issue bodies were not reviewed here and no full product acceptance inferred.
- Concrete outstanding parameters: Maintain immutable sent snapshots, functional-alternative approval and package allocations without invented unit prices; indivisible partial package awards require supplier requote. Supplier remains merchant of record; no offline payment or platform custody.
- Superseded by: None explicitly established in this record. These are preserved product requirements, not newly approved by the marketplace security discussion.

### platform-marketplace-open-policy-proposal

Specify remaining marketplace freshness, failure recovery, invoice matching, moderation and jurisdiction policy without reopening the selected architecture.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-250](issues/EVE-250.md).
- Evidence: [EVE-250/description](https://linear.app/resnovas/issue/EVE-250/decide-controlled-cross-tenant-marketplace-gateway-architecture).
- Implementation: No final parameter values or production-policy acceptance established.
- Concrete outstanding parameters: Choose synchronous stock recheck steps/TTL thresholds; per-boundary compensation/operator states; provider-line versus accounting-line versus contract-schedule matching; support/moderator roles and approvals; exchange fields and bounded offline revocation; exact residency/legal schedules.
- Superseded by: None explicitly established in this record. Architecture selection is approved; these narrower parameters remain open, not the entire marketplace topology. Partially superseded on 2026-11-18 by platform-trust-concrete-parameters for its concrete crypto, custody, timing, freshness, recovery, reconciliation and default retention parts; remaining parts stay open.

### platform-retention-interaction-original-proposal

Originally proposed preserving independently lawful contractual evidence after participant-grant revocation while erasing separable personal data and delaying final shredding.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T00:36:30.920Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-250](issues/EVE-250.md), [EVE-251](issues/EVE-251.md).
- Evidence: [EVE-251/d42e2263-a1a3-4db9-bbce-2c69d215ebad](https://linear.app/resnovas/issue/EVE-251/decide-marketplace-service-attestation-and-cryptographic-trust#comment-d42e2263-a1a3-4db9-bbce-2c69d215ebad), [EVE-250/64bbd7e5-dc1c-47ac-aced-add8427a8657](https://linear.app/resnovas/issue/EVE-250/decide-controlled-cross-tenant-marketplace-gateway-architecture#comment-64bbd7e5-dc1c-47ac-aced-add8427a8657).
- Implementation: Proposal provenance retained separately from approved key governance.
- Concrete outstanding parameters: Apply the subsequent explicit retention approval; exact lawful bases, schedules and hold obligations remain jurisdiction/record specific.
- Superseded by: [architecture-15](#architecture-15). Later explicit approval supersedes this retention interaction proposal, not unresolved jurisdictional parameter choices.

### platform-trust-conformance-spec

Implement already binding deployment-root/key hierarchy, four independent release gates, sealed profiles and assurance floors through neutral contracts and fail-closed conformance tests, not a fresh architecture redesign.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-251](issues/EVE-251.md).
- Evidence: [EVE-251/description](https://linear.app/resnovas/issue/EVE-251/decide-marketplace-service-attestation-and-cryptographic-trust).
- Implementation: Agents report provider-neutral preflight and durable nonce fixtures; all successful metadata preflight still denies release, without signature validation, attestation, usable handles or production composition.
- Concrete outstanding parameters: Test replay/expiry/revocation, audience/resource/purpose/profile mismatches, unavailable brokers, cumulative assurance and protected observer redaction. Modules/tenants may strengthen but never redefine/lower core controls.
- Superseded by: None explicitly established in this record. Binding reconciliation and baseline trust-architecture-reconciled supersede stale whole-design proposal wording, not exact composition review.

### platform-trust-concrete-parameters

Adopt standard concrete trust and marketplace parameters: Ed25519 over RFC 8785, SHA-256 payload digests, AES-256-GCM per-record DEKs under non-exportable KMS KEKs, 3-of-5 root custody and 90-day rotation, bounded request/evidence/revocation timing, step freshness with synchronous rechecks, class retention with legal hold, retry/compensation/manual recovery and contract-schedule invoice reconciliation.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-250](issues/EVE-250.md), [EVE-251](issues/EVE-251.md).
- Evidence: [docs/architecture/eventiva-platform-and-marketplace.md](../../docs/architecture/eventiva-platform-and-marketplace.md).
- Implementation: Jonathan approved agent selection of well-established standard options on 2026-11-18, relayed through the Puck coordination thread; exact instruction time unavailable. Implemented in @eventiva/contracts/trust-profile, @eventiva/contracts/marketplace-policy and @eventiva/integrations.trust.server/crypto with focused tests; no vendor, provisioning, dependency, spending or production release. privateExchangeUnavailable still refuses release.
- Concrete outstanding parameters: Values are sealed floors (tighten only): 5 min request lifetime, 30 s skew, evidence max ages 5/5/15/1 min (identity/resource/workload/broker), 60 s revocation propagation, 15 min offline display without offline staging, 7 d nonce retention; freshness 24 h/15 min/1 min/1 min; retention 2 y/7 y/30 d/15 min classes; retry 1 s x2 to 5 min, 8 attempts. Still open: region/jurisdiction mapping, lawful bases, staff access, M3 thresholds, A2 approval policy, KMS/HSM/attestation product selection and provisioning.
- Superseded by: None explicitly established in this record. Supersedes the proposed M2 envelope record and the concrete crypto/timing/custody/freshness/recovery/reconciliation/retention portions of earlier proposal records; their region, legal, staff-access and vendor portions remain open.

### platform-trust-composition-parameters

Resolve concrete crypto/provider/verifier composition and remaining legal policy within the approved root-trust architecture.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-251](issues/EVE-251.md).
- Evidence: [EVE-251/description](https://linear.app/resnovas/issue/EVE-251/decide-marketplace-service-attestation-and-cryptographic-trust).
- Implementation: No exact algorithm, library, attestation evidence format, custody deployment, infrastructure or production release approval established.
- Concrete outstanding parameters: Review canonical signed format/algorithms/key sizes, evidence/verifier independence, broker/custody vendor, replay/rotation timing, anti-fraud thresholds and regions. Owner policy remaining: lawful processing/retention/holds, mandatory independent review, nonoverridable degraded assurance and product-wide custodian quorum. Engineering selections are not a reopening of root trust.
- Superseded by: None explicitly established in this record. Earlier blanket not-approved-for-implementation text is subordinate to binding neutral-contract authorization; only concrete composition remains gated. Partially superseded on 2026-11-18 by platform-trust-concrete-parameters for its concrete crypto, custody, timing, freshness, recovery, reconciliation and default retention parts; remaining parts stay open.

### platform-integration-acceptance-spec

Keep umbrella integration open until composition, boundaries, durable state/lifecycle/workflow, protected security, configuration, telemetry, real UI targets and aggregate gates have explicit reproducible evidence.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-261](issues/EVE-261.md).
- Evidence: [EVE-261/description](https://linear.app/resnovas/issue/EVE-261/integrate-the-modular-platform-and-prove-every-owner-required).
- Implementation: Numerous bounded agent deliveries and CI passes are reported, but EVE-261 remains In Progress; no owner sign-off or complete A-J acceptance established. Review-before-integration authorization trail is ambiguous in supplied artifacts.
- Concrete outstanding parameters: Require per-target pass/fail/unrun revision/commands; reconcile owner integration-window approval; finish journal/producer, durable workflow fencing, protected verifier/key release and real native/UI ready demonstration. Migration error rollback is not migration process-crash proof; local spans are not persisted trace continuity; do not infer all gates from verify.
- Superseded by: None explicitly established in this record. Later bounded delivery reports do not supersede mandatory owner gates. EVE-45 producer semantics are decided in its description; implementation/proof remains open despite older comments calling them undecided.

### platform-lowercase-archive-direction

Rename only the top-level archive directory to lowercase with a Git-visible case-safe move, preserving all historical bytes and the private-test gitlink.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-264](issues/EVE-264.md).
- Evidence: [EVE-264/description](https://linear.app/resnovas/issue/EVE-264/rename-the-top-level-examples-directory-to-lowercase-examples).
- Implementation: Explicitly attributed owner request is recorded in the description; primary thread and tree-equality/delivery proof were not independently inspected.
- Concrete outstanding parameters: Update active references/checks/workflows/docs, preserve immutable quoted historical paths and snapshots, add uppercase-return regression coverage and prove tree/object equality plus repository verification. No production/infrastructure/dependency or archive-content changes authorized.
- Superseded by: None explicitly established in this record. No explicit replacement established; description date is unavailable rather than inferred from issue/comment dates.

### verified-recovery-main-gate-release

The owner released separate review-before-main permission for verified safe Eventiva repository recovery/integration; ordinary engineering, tests and direct main delivery proceed autonomously under existing gates.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-261](issues/EVE-261.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [EVE-261/description](https://linear.app/resnovas/issue/EVE-261/integrate-the-modular-platform-and-prove-every-owner-required), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: Supplemental original origin:human owner messages were reviewed at https://ampcode.com/threads/T-01a189ae-399d-7162-9765-4488b9600016#M-034yK7dqD8FfEXQCkvRC8t (2026-11-16T01:36:34.954Z) and #M-034yTJM7UC975J1PtN46wQ (2026-11-16T07:51:01.844Z). These message times are distinct from the cited mirrored descriptions' unavailable decision timestamps. Central independently corroborated provenance; no later revocation found in that review.
- Concrete outstanding parameters: Only verified ready repository work is released. Preserve failing/blocked work safely; no unsafe push, production deployment, infrastructure/secrets/settings/billing/spend or unapproved exact dependency/component changes. Actual implementation and full platform acceptance remain separate evidence.
- Superseded by: None explicitly established in this record. Supersedes the earlier scoped-modular-review-before-main-hold only for verified ready repository delivery; retains its product/security/production limits.

### private-validated-reflection-ingress-exception

Permit private TypeScript PropertyDescriptor/reflection unknown ingress only when immediately and recursively validated; never export the unknown or widen public domain contracts.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-261](issues/EVE-261.md), [EVE-263](issues/EVE-263.md).
- Evidence: [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: Supplemental original owner message verified: https://ampcode.com/threads/T-01a189ae-399d-7162-9765-4488b9600016#M-034yTJM7UC975J1PtN46wQ, 2026-11-16T07:51:01.844Z. This resolves the linked specification's historical proposed exception only at the named boundary, not all vendor opacity.
- Concrete outstanding parameters: Keep immediate recursive decoding and exact public types; no any, unchecked casts, public unknown or unrelated vendor/API exemptions. Validate actual implementations against the narrow boundary and EVE-263 negatives.
- Superseded by: None explicitly established in this record. Refines acyclic-exact-types-g15-gate: the earlier blanket unresolved reflection-approval statement is historical, not a current blocker for compliant private reflection ingress.

### rambo-adapter-scoped-deferral

Defer the real Rambo adapter until an approved releasable React Native package/API exists; do not block unrelated verified modular-platform delivery on that adapter.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-259](issues/EVE-259.md), [EVE-261](issues/EVE-261.md).
- Evidence: [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md), [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and).
- Implementation: Supplemental original owner message verified at https://ampcode.com/threads/T-01a189ae-399d-7162-9765-4488b9600016#M-034yTJM7UC975J1PtN46wQ, 2026-11-16T07:51:01.844Z. Existing renderer seams remain bounded evidence, not real Rambo/native acceptance.
- Concrete outstanding parameters: An approved package/version/API and component contract remain necessary for the real adapter; no alternative component library, dependency, native-device support or UI completion is selected by this deferral.
- Superseded by: None explicitly established in this record. Partially qualifies external-cross-platform-component-ownership: ownership direction survives, but unavailable adapter cannot hold unrelated repository delivery.

### read-only-archive-recovery-authorization

Permit temporary restoration of archived Eventiva threads/orbs for read-only fresh filesystem audits and safe recovery of missing work; rearchive after the audit.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-13](issues/EVE-13.md), [EVE-261](issues/EVE-261.md).
- Evidence: [EVE-13/description](https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and), [docs/architecture/modular-platform.md](../../docs/architecture/modular-platform.md).
- Implementation: Supplemental original owner message verified: https://ampcode.com/threads/T-01a189ae-399d-7162-9765-4488b9600016#M-034yTJM7UC975J1PtN46wQ, 2026-11-16T07:51:01.844Z. This documentation task did not restore or mutate archived threads.
- Concrete outstanding parameters: Restoration is scoped to read-only audit and safe source recovery, not unrelated mutations, production operation or service activation; preserve missing/blocked work and restore archive state afterward.
- Superseded by: None explicitly established in this record. No wider archive mutation or historical-byte rewrite is authorized.

### sql-test-image-bounded-risk-exception

Historical 2026-11-15 exception for the exact PostgreSQL17.12 Bookworm digest solely in isolated disposable synthetic local/CI fixtures; its expiry/trigger terms are superseded by the separately cited 2026-11-18 standing acceptance in the authored decision checkpoint.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-42](issues/EVE-42.md), [EVE-261](issues/EVE-261.md).
- Evidence: [EVE-42/description](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state).
- Implementation: Full description and supplemental SQL evidence artifact https://ampcode.com/artifacts/eve-42-sql-evidence-6f270af4-a889-4337-98aa-0ff0f25804db revision9 were read. Reported bounded fixture evidence is not independently rerun here, and the exception is not a clean scan or production acceptance.
- Concrete outstanding parameters: Only postgres:17.12-bookworm sha256:40865bc877a289da75963d97d72b59633f639fc5af7a4e856bfa3714cae5b536; expires2026-11-22UTC or earlier relevant exploit/input/fix/rebuild trigger. Retain4critical/140high/231medium/190low/11unknown findings, SCRAM/generated credentials, loopback/dedicated bridge, resource/time bounds and teardown; no real data/cloud credentials, arbitrary SQL/XML/extensions, host networking/privilege or Trixie/production/broader waiver.
- Superseded by: None explicitly established in this record. The frozen source and historical parameters above are preserved, not current policy. Jonathan's original 2026-11-18T08:47:18.801Z message https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a#M-034zdN6MvN88wCu04N6SDf accepts residual fixture findings on a standing basis; his 08:50:00.894Z message #M-034zdRCPlGPp83UkEzUx4k approves Alpine and comparing both variants. The implementing relay replaces the expiry/trigger gate with no hard expiry and routine hygiene, conditional on compatibility. See docs/storage.md, the authored decision/timeline checkpoint and EVE-42 comment83baa9b6-3011-48f2-9924-861ba5bd3b9c. Synthetic-only isolation, no production/broader waiver and dependency boundaries survive; no frozen source timestamp or hash was changed.

### platform-action-projection-spike-spec

Prove one Effect action specification, handler, authorization and error model projected to HTTP, MCP and AI tools in a throwaway spike.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-14](issues/EVE-14.md).
- Evidence: [EVE-14/description](https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory).
- Implementation: Spike scope only; parity results do not authorize production dependencies or persistence/auth/UI implementation.
- Concrete outstanding parameters: Show equivalent typed errors, tenant denials and derived JSON Schema on each surface; separately approve main packages.
- Superseded by: None explicitly established in this record. No replacement of parity intent established.

### platform-action-spike-sdk-proposal

Use a shared action-construction API and protocol/AI adapters to avoid independently maintained tool schemas.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T21:58:41.581Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-14](issues/EVE-14.md).
- Evidence: [EVE-14/5ab14c1f-bc67-49a4-acd6-af0b23e2b60e](https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory#comment-5ab14c1f-bc67-49a4-acd6-af0b23e2b60e).
- Implementation: Six reported spike tests; mock-header identity and erased generic implementation are not production clearance.
- Concrete outstanding parameters: Reconcile SDK dependency closure with no-Zod direction; exact packages remain separately gated.
- Superseded by: [platform-no-zod-spike-direction](#platform-no-zod-spike-direction). Later owner no-Zod direction narrows viable adapter implementation; portable parity survives.

### platform-no-zod-spike-direction

Avoid Zod in the action-projection spike while preserving a single Effect Schema source.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:37:43.234Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-14](issues/EVE-14.md).
- Evidence: [EVE-14/542a6bd6-5968-4c9b-b3e4-64c05488a788](https://linear.app/resnovas/issue/EVE-14/s1-prove-one-effect-action-serves-ui-mcp-and-ai-sdk-from-one-inventory#comment-542a6bd6-5968-4c9b-b3e4-64c05488a788).
- Implementation: Agent explicitly reports owner request and ten Effect-only tests; no owner override dropping AI SDK is recorded.
- Concrete outstanding parameters: Resolve any AI SDK/Effect AI coexistence conflict explicitly before production adoption; do not infer approval of removing the mandated SDK.
- Superseded by: None explicitly established in this record. Supersedes incompatible Zod-based spike approach only.

### platform-capability-matrix-spec

Maintain a pinned exhaustive Build/Wrap/Later/Not-needed capability map and file-backed protocol conformance assessment.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-15](issues/EVE-15.md).
- Evidence: [EVE-15/description](https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol).
- Implementation: Research specification, not framework implementation or protocol completeness.
- Concrete outstanding parameters: Classify every upstream module exactly once; distinguish inbound/outbound ACP, cancellation and webhook signing gaps.
- Superseded by: None explicitly established in this record. Later P1 order refines sequencing, not evidence obligations.

### platform-capability-order-proposal

Implement the proposed P1 platform sequence following the upstream capability inventory.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:01:36.046Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-15](issues/EVE-15.md).
- Evidence: [EVE-15/5ce9da61-4401-40bd-a013-ee9e1f9f30e6](https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol#comment-5ce9da61-4401-40bd-a013-ee9e1f9f30e6).
- Implementation: 126 inventory rows reported; research completion is not owner approval.
- Concrete outstanding parameters: Validate missing inbound ACP, MCP cancellation, webhook signatures and limited A2A separately.
- Superseded by: [platform-capability-order-direction](#platform-capability-order-direction). Owner subsequently approved P1 with explicit reordered final four steps.

### platform-capability-order-direction

Keep P1 steps one through eight; schedule screen awareness ninth, MCP tenth, ACP eleventh and collaboration twelfth.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-01T12:44:07.553Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-15](issues/EVE-15.md).
- Evidence: [EVE-15/2fc6a52d-5aa6-42cb-8e66-6b26c3db86e4](https://linear.app/resnovas/issue/EVE-15/s2-build-the-upstream-agent-native-capability-map-and-protocol#comment-2fc6a52d-5aa6-42cb-8e66-6b26c3db86e4).
- Implementation: Recorded owner sequencing, not a claim the steps are implemented or all dependencies approved.
- Concrete outstanding parameters: Track implementation/evidence in each owning child; retain one common action pathway.
- Superseded by: None explicitly established in this record. Replaces only the earlier proposed order where explicitly changed.

### platform-federation-target-proof-spec

Measure remote switch, disposal, incompatible fallback, offline behavior and rebuild requirements independently on web and native targets.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-16](issues/EVE-16.md), [EVE-259](issues/EVE-259.md).
- Evidence: [EVE-16/description](https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web).
- Implementation: Trusted executable federation research is separate from the initial declarative-only extension substrate.
- Concrete outstanding parameters: Record exact supported Expo/Re.Pack/MF combinations, Android device execution, iOS availability and OTA/desktop gaps; assertions in a manifest are not executable isolation.
- Superseded by: None explicitly established in this record. No browser or native bundle result replaces actual device execution evidence.

### platform-federation-original-proposal

Adopt Expo 56, Re.Pack 5.4.2, Rspack 2.3 and MF 2.9.2 with web-first delivery and a native feature flag until a device run.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:04:24.377Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-16](issues/EVE-16.md).
- Evidence: [EVE-16/5636ac4b-3418-4f95-a607-fe81a4472516](https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web#comment-5636ac4b-3418-4f95-a607-fe81a4472516).
- Implementation: Web switching/disposal/offline observed; Android only bundled and iOS outstanding.
- Concrete outstanding parameters: Historical proposal only; listed new package versions require the corresponding explicit adoption boundary.
- Superseded by: [platform-federation-historical-adoption](#platform-federation-historical-adoption). Owner explicitly removed the proposed native flag/device gate for the named historical stack.

### platform-federation-historical-adoption

Historically adopt the named Expo 56/Re.Pack 5.4.2/Rspack 2.3/MF 2.9.2 stack on a development build without a native feature-flag gate.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:36:34.263Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-16](issues/EVE-16.md).
- Evidence: [EVE-16/487268e7-d3f6-478c-8077-865d709f6c23](https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web#comment-487268e7-d3f6-478c-8077-865d709f6c23).
- Implementation: Owner explicitly accepted missing native device proof as implementation risk, not a passing test.
- Concrete outstanding parameters: Does not approve newer spike versions or importing the reset manual implementation; fresh production dependency matrix still controls exact adoption.
- Superseded by: None explicitly established in this record. Preserve historical decision without inferring that later spike restrictions revoke all of it; later authorization is expressly spike-only.

### platform-federation-disposable-spike-direction

Run the disposable federation compatibility spike with exact dependencies confined to the experiment.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T17:42:56.296Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-16](issues/EVE-16.md).
- Evidence: [EVE-16/c46f162f-26c9-485a-bbd1-44a6eaab3cd2](https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web#comment-c46f162f-26c9-485a-bbd1-44a6eaab3cd2).
- Implementation: No production dependency introduction, EVE-50 start, provisioning or experimental-branch delivery authorized.
- Concrete outstanding parameters: Require real switch/disposal/fallback/offline and target support evidence; publish security/version matrix and recommendation.
- Superseded by: None explicitly established in this record. Defines later experiment authorization, not blanket adoption of its newer pins.

### platform-federation-later-fallback-proposal

Prefer web-only federation first and keep native modules bundled after the later compatibility experiment.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T18:00:52.799Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-16](issues/EVE-16.md), [EVE-50](issues/EVE-50.md).
- Evidence: [EVE-16/ef4f9650-9e28-4c17-b651-2c685da833fe](https://linear.app/resnovas/issue/EVE-16/s3-prove-runtime-loading-and-switching-of-a-remote-module-on-expo-web#comment-ef4f9650-9e28-4c17-b651-2c685da833fe).
- Implementation: Web probe passes; Android alpha bundling blocked or manual bundles only, iOS unexecuted. Not owner approval overriding historical adoption.
- Concrete outstanding parameters: Close actual Android/iOS runtime gaps and separately approve any production dependency/version change; no native support claim from builds.
- Superseded by: None explicitly established in this record. Recommendation remains a proposal; no later acceptance supplied.

### platform-offline-combined-proof-spec

Evaluate record/field and collaborative text/canvas sync together with durable restart queues and permission loss on reconnect.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-17](issues/EVE-17.md).
- Evidence: [EVE-17/description](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and).
- Implementation: Requires SQLite device and Postgres authoritative behavior, not only a candidate score table.
- Concrete outstanding parameters: Cover per-kind conflicts, schema evolution, self-host/licence, Expo support and revoked-data removal on each claimed target.
- Superseded by: None explicitly established in this record. Engine choice is later decided; platform-specific proof remains.

### platform-sync-original-proposal

Pair self-hosted PowerSync records with Yjs update rows and server-authorized per-kind conflict handling.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:03:07.504Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-17](issues/EVE-17.md).
- Evidence: [EVE-17/917d072f-8a9b-4004-a74d-401433e614b9](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and#comment-917d072f-8a9b-4004-a74d-401433e614b9).
- Implementation: Initial Node-only convergence report; mobile/web/Neon unexecuted at this point.
- Concrete outstanding parameters: Ordinary fields use changed-field server merges; guarded fields reject invalid preconditions; quantities use deltas, lists stable rows/fractional order, live requests expire/revalidate. Canvas must follow later CRDT-order correction.
- Superseded by: [platform-sync-adoption-direction](#platform-sync-adoption-direction). Later owner adoption settles engine choice and adds explicit canvas/revocation rules; it does not automatically accept every proposed policy detail.

### platform-sync-additional-client-proof-direction

Test web and Expo clients before adopting the proposed sync engine.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T23:03:52.654Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-17](issues/EVE-17.md).
- Evidence: [EVE-17/913385af-5c66-483f-b954-6431d4e45c97](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and#comment-913385af-5c66-483f-b954-6431d4e45c97).
- Implementation: Browser tests ran; this round did not build/run Android or test Safari/Neon.
- Concrete outstanding parameters: Record native build/runtime separately; offline cold-start needs app-shell assets and storage/worker support.
- Superseded by: [platform-sync-adoption-direction](#platform-sync-adoption-direction). Subsequent real Android evidence supports the adoption; iOS/Safari/Neon remain explicit follow-ups.

### platform-native-yjs-crypto-proposal

Use a secure approved native crypto provider for Yjs rather than the spike-only random fallback.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T23:35:00.684Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-17](issues/EVE-17.md), [EVE-51](issues/EVE-51.md).
- Evidence: [EVE-17/e8304233-6dec-4e8d-8b78-98980b15501f](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and#comment-e8304233-6dec-4e8d-8b78-98980b15501f).
- Implementation: Android APK build succeeded but runtime had not run; proposed Expo crypto dependency remained unapproved.
- Concrete outstanding parameters: Approve exact provider/package/version and prove Hermes behavior before production; cleartext development transport is not production policy.
- Superseded by: None explicitly established in this record. Later engine adoption explicitly leaves this dependency approval open.

### platform-sync-adoption-direction

Adopt self-hosted PowerSync Open Edition with Postgres bucket storage and Yjs rows, with all writes through authorized Effect actions.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-09T22:04:28.180Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-17](issues/EVE-17.md), [EVE-51](issues/EVE-51.md).
- Evidence: [EVE-17/986fe67b-7198-4c7d-9184-232c3f4216f0](https://linear.app/resnovas/issue/EVE-17/s4-choose-the-offline-sync-engine-for-record-edits-and-live-text-and#comment-986fe67b-7198-4c7d-9184-232c3f4216f0).
- Implementation: Owner adoption follows reported Node/browser/real-Android evidence, not complete all-platform acceptance.
- Concrete outstanding parameters: Canvas resolves by Yjs CRDT order, not server arrival order. Bucket revocation immediately destroys open Y.Doc/editors/presence. iOS, Safari, Neon and native crypto dependency remain open; Electric/TanStack is licence-contingent fallback only.
- Superseded by: None explicitly established in this record. Supersedes candidate selection and incorrect canvas arrival-order interpretation; no blanket package/version approval.

### platform-cluster-measurement-spec

Measure two independent runner placement, graceful drain and crash recovery and state observed ordering/loss/duplication guarantees.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-18](issues/EVE-18.md).
- Evidence: [EVE-18/description](https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and).
- Implementation: Historical cluster research only; fresh rebuilt runtime requires its own EVE-252 proof.
- Concrete outstanding parameters: No exactly-once execution claim; record long-handler restart/blocking/stream gaps and stop before unapproved main changes.
- Superseded by: None explicitly established in this record. Legacy evidence informs but cannot substitute for current-version cluster tests.

### platform-cluster-base-proposal

Keep the existing cluster base and separately fix empty runners, failover tuning, persisted idempotency and agent-run recovery.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:30:24.491Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-18](issues/EVE-18.md).
- Evidence: [EVE-18/7dec5531-bc1d-40c7-89bd-cbeac373bd4d](https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and#comment-7dec5531-bc1d-40c7-89bd-cbeac373bd4d).
- Implementation: Probe observed persisted at-least-once duplicates, volatile loss and long-handler blocking; not a new owner approval.
- Concrete outstanding parameters: Use measured failover and idempotent business effects rather than deriving exactly-once from one reply.
- Superseded by: [platform-cluster-base-historical-direction](#platform-cluster-base-historical-direction). Owner subsequently accepts the base and orders its gap work.

### platform-cluster-base-historical-direction

Keep Effect Cluster as the historical sharding base; address platform gaps EVE-37/38/39 before agent-run EVE-34/35/36.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:55:44.972Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-18](issues/EVE-18.md).
- Evidence: [EVE-18/276de2c3-5be0-467f-910c-7ba5bfff2b2b](https://linear.app/resnovas/issue/EVE-18/s5-verify-sharding-across-two-independent-runners-with-drain-and#comment-276de2c3-5be0-467f-910c-7ba5bfff2b2b).
- Implementation: Historical commits/probe delivery reported with a pre-existing format gate failure, not clean new-foundation acceptance.
- Concrete outstanding parameters: Re-scope implementation after reset; retain measured delivery/idempotency lessons but do not copy archived runtime by default.
- Superseded by: None explicitly established in this record. Later reset changes implementation baseline, while EVE-252 reconfirms cluster architectural direction.

### platform-telemetry-matrix-spec

Establish a cited web/native/server product-tool and OTel signal matrix with vendor-neutral services and explicit gaps.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-19](issues/EVE-19.md).
- Evidence: [EVE-19/description](https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend).
- Implementation: Research only; no project creation, production ingestion or main changes authorized.
- Concrete outstanding parameters: Verify exact SDK versions, supported/partial/no cells, endpoints/auth and minimal exporter routes separately from actual ingestion.
- Superseded by: None explicitly established in this record. Later contract acceptance does not close all runtime follow-ups.

### platform-direct-otlp-original-proposal

Use neutral Effect telemetry and product ports with direct OTLP to the default backend and no collector initially.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T21:55:24.140Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-19](issues/EVE-19.md).
- Evidence: [EVE-19/051ce0d2-313f-49ab-bfc8-fd27fbcb53fe](https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend#comment-051ce0d2-313f-49ab-bfc8-fd27fbcb53fe).
- Implementation: SDK/docs inspection and contract sketch, not executed backend ingestion.
- Concrete outstanding parameters: Native Hermes exporters, endpoint auth, Early Access and client context propagation need proofs; second vendor is an adapter/config change and redaction occurs centrally.
- Superseded by: [platform-direct-otlp-direction](#platform-direct-otlp-direction). Owner accepts architecture later; RN tracing-header omission is separately corrected by the source recheck.

### platform-direct-otlp-direction

Accept the neutral telemetry contract with direct OTLP to PostHog and no collector.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:46:01.133Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-19](issues/EVE-19.md), [EVE-44](issues/EVE-44.md).
- Evidence: [EVE-19/506c10de-16dd-4ad9-a934-76638463a4ac](https://linear.app/resnovas/issue/EVE-19/s6-map-posthog-and-opentelemetry-support-across-web-native-and-backend#comment-506c10de-16dd-4ad9-a934-76638463a4ac).
- Implementation: Recorded owner acceptance of architecture, not provisioning or proof of native/endpoints.
- Concrete outstanding parameters: Follow-ups EVE-57/58/59/60 retain runtime/export/auth/enrollment/correlation evidence obligations and exact dependency gates.
- Superseded by: None explicitly established in this record. Does not supersede vendor-neutrality, opt-out or mandatory independent audit.

### platform-sanctioned-ai-research-spec

Permit only source-backed sanctioned AI credential/delegation routes and keep unconfirmed subscription use unavailable.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-20](issues/EVE-20.md).
- Evidence: [EVE-20/description](https://linear.app/resnovas/issue/EVE-20/s7-find-which-ai-providers-allow-users-to-bring-their-own-subscription).
- Implementation: Provider terms research, not connected flows or provider agreements.
- Concrete outstanding parameters: Record per-provider scopes, billing, revocation/expiry and inbound/outbound identities; prohibit scraped cookies and unofficial tokens.
- Superseded by: None explicitly established in this record. Later launch approval operates within these constraints.

### platform-ai-launch-original-proposal

Offer sanctioned API keys, user-billed OAuth/SDK flows, local models and user-authenticated desktop agents with scoped credential handles and no silent fallback.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T21:54:44.251Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-20](issues/EVE-20.md).
- Evidence: [EVE-20/abacfa23-8d6c-4647-a909-14de8435285d](https://linear.app/resnovas/issue/EVE-20/s7-find-which-ai-providers-allow-users-to-bring-their-own-subscription#comment-abacfa23-8d6c-4647-a909-14de8435285d).
- Implementation: Research only; provider terms cited in the source are not independently revalidated in this semantic review.
- Concrete outstanding parameters: Encrypted per-tenant credential references, per-run payer/principal, caps and revocation pause; ChatGPT plan usage waits for provider client approval.
- Superseded by: [platform-ai-launch-owner-direction](#platform-ai-launch-owner-direction). Owner subsequently approves launch selection and credential/no-fallback model, not unconfirmed provider access.

### platform-ai-launch-owner-direction

Adopt the full sanctioned launch set and apply for OpenAI plan-use approval, retaining the credential model and no-fallback rule.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-10-31T22:51:05.261Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-20](issues/EVE-20.md), [EVE-52](issues/EVE-52.md).
- Evidence: [EVE-20/eb178cb1-00df-496f-9293-6087b94686a6](https://linear.app/resnovas/issue/EVE-20/s7-find-which-ai-providers-allow-users-to-bring-their-own-subscription#comment-eb178cb1-00df-496f-9293-6087b94686a6).
- Implementation: Launch direction, not provider approval or connection completion.
- Concrete outstanding parameters: API keys: Anthropic/OpenAI/Gemini/Vertex/Mistral/Foundry; user-billed OpenRouter/Copilot; Ollama local/cloud and own-agent desktop ACP. No consumer Claude/Gemini/Mistral login in Eventiva; provider application is conditional.
- Superseded by: None explicitly established in this record. Consistent with the previously reviewed model-provider direction; no extra dependency/paid account approved.

### platform-fresh-three-package-direction

Create fresh portable contracts, database-neutral schema and backend runtime boundaries instead of extracting the archived manual core.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-23](issues/EVE-23.md).
- Evidence: [EVE-23/description](https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared).
- Implementation: Description records architecture approval and prior stop/reset; later agent reports delivery but this is not inferred owner acceptance.
- Concrete outstanding parameters: Effect-only shared contracts, pure schema composition, runtime without drivers/vendor/Node/Cluster; spec-handler split, exact subpaths, shared singleton, acyclic portability/browser/Hermes gates and transactional registration/disposal.
- Superseded by: None explicitly established in this record. Explicitly supersedes older legacy extraction/behavior-preservation instructions within the same description.

### platform-configuration-credentials-spec

Validate namespaced module configuration before publication and expose scoped settings/secret/credential services without exposing plaintext.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-41](issues/EVE-41.md).
- Evidence: [EVE-41/description](https://linear.app/resnovas/issue/EVE-41/p12-build-app-config-settings-secrets-and-credentials).
- Implementation: Bootstrap preflight is delivered in a bounded report; full store/actions/rotation are explicitly incomplete.
- Concrete outstanding parameters: Prove invalid/unknown/missing config, two independent providers, hot rollback/audit and revoked/expired handles; canaries must not enter JSON/inspect/Cause/log/telemetry/action/event/projection. Config is not authorization or a feature flag.
- Superseded by: None explicitly established in this record. Module bootstrap seam does not replace the original complete settings/credential scope. Dated 2026-11-18 bounded implementation checkpoint: EVE-41 comment 2c87ee41-1747-49e5-a4a3-46d73a859768 records packet-3 user/tenant Resources actions and focused evidence, with full delivery gates pending at that checkpoint. See docs/settings.md and the authored timeline checkpoint for current delivery evidence. App-global authority/storage remains unavailable; secrets/credential custody, hot-update and full acceptance remain open. The settings-only canonical-caller bridge does not fix the protected execution seam. This annotation does not alter frozen source text, review hashes, issue status or production authorization.

### platform-keycloak-selection-direction

Select Keycloak 26.8.2 as central identity/SSO platform and proceed with provider-neutral identity implementation under exact-component security gates.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-43](issues/EVE-43.md).
- Evidence: [EVE-43/description](https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and).
- Implementation: Mocked standards verifier and SQL identity foundation do not prove working Keycloak federation; integration remains In Progress.
- Concrete outstanding parameters: Community standalone and production resilience; inbound enterprise broker plus outbound OIDC/OAuth/SAML IdP; exact supplier image, protocol matrix and Eventiva-owned tenant membership/authorization/audit. No automatic claims-based rights or unapproved provisioning.
- Superseded by: None explicitly established in this record. Explicitly supersedes older provider-undecided/co-equal ZITADEL wording; later reviewed-batch approval narrows the component hold, not security findings.

### platform-trust-investigation-original-proposal

Investigate marketplace mutual service identity, attestation and key separation before choosing concrete cryptographic components.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-11-14T23:11:18.596Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-43](issues/EVE-43.md), [EVE-251](issues/EVE-251.md).
- Evidence: [EVE-43/a49505fd-7f92-42d4-96ee-0e6c3d0f2833](https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and#comment-a49505fd-7f92-42d4-96ee-0e6c3d0f2833).
- Implementation: Agent explicitly labels proposal and then-missing hierarchy evidence, not owner approval.
- Concrete outstanding parameters: Current open work is concrete algorithm/provider/custody/verifier conformance within later approved root trust, not wholesale undecided architecture.
- Superseded by: [architecture-11](#architecture-11), [platform-trust-conformance-spec](#platform-trust-conformance-spec). Later binding hierarchy/four-release-gate direction governs; this early absence report cannot undo it.

### platform-bidirectional-identity-spec

Require identity platform conformance in both outbound provider and inbound broker roles with stable multi-tenant subject linking.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T14:50:06.558Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-43](issues/EVE-43.md).
- Evidence: [EVE-43/99c9d573-22dd-4091-8d0b-9fe1b53d36e2](https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and#comment-99c9d573-22dd-4091-8d0b-9fe1b53d36e2).
- Implementation: Evaluation scope is binding; candidate recommendation in this historical comment is not selection or container-run approval.
- Concrete outstanding parameters: Test OIDC/SAML both ways, directory federation, SCIM direction/capabilities, session/logout/revocation, passkeys/step-up, audience/scope, account-link collisions and outages. Enumerate unsupported legacy variants rather than universal compatibility.
- Superseded by: None explicitly established in this record. Provider-undecided clauses are superseded by explicit Keycloak selection; conformance requirements remain.

### platform-keycloak-reviewed-batch-direction

Authorize one consolidated SBOM-reviewed immutable Keycloak 26.8.2 image and necessary pinned OIDC dependency batch within its documented reviewed boundary.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-16T18:51:49.841Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-43](issues/EVE-43.md).
- Evidence: [EVE-43/5d66b4b8-811a-4b50-908b-878fa09c90da](https://linear.app/resnovas/issue/EVE-43/p14-build-identity-and-access-orgs-authorization-user-profiles-and#comment-5d66b4b8-811a-4b50-908b-878fa09c90da).
- Implementation: Batch approach approved, not automatic exact-component clearance. Latest technical report still has six unresolved security occurrences plus inventory/licence/final OCI provenance gaps.
- Concrete outstanding parameters: Enumerate exact names/versions/digests/integrity/provenance/licences/SBOM findings before use; escalate materially changed components/findings. No mutable tags, upgrades, paid/production infrastructure or weakened gates.
- Superseded by: None explicitly established in this record. Supersedes general historical absence of batch authorization only; unresolved material findings are not risk-accepted.

### platform-central-observability-spec

Provide central Effect-native bootstrap-safe structured console/date-file telemetry, correlated spans and swappable exporters without coupling features or suppressing mandatory audit.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-44](issues/EVE-44.md).
- Evidence: [EVE-44/description](https://linear.app/resnovas/issue/EVE-44/p15-build-telemetry-opentelemetry-spans-on-every-call-and-a-vendor).
- Implementation: Many bounded instrumentation deliveries exist, but process-local observations and test sinks do not complete production OTel/propagation/native readiness.
- Concrete outstanding parameters: Bound buffers/backpressure/deadlines/retention/UTC rotation and flush; sanitize before all exporters, test outages/secret canaries/correlation and exact archive fixture. Full durable trace handoff, supported native sink and actual ready/banner remain proof obligations; private callbacks use only later narrow approval.
- Superseded by: None explicitly established in this record. Older isolated-lane no-push/private-review holds are historical after verified recovery release and narrow callback approval; acceptance gates remain.

### platform-reset-tool-retention-proposal

Temporarily propose retaining still-referenced manual test/declaration tooling outside production packages while preserving the archive.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T00:14:21.006Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-242](issues/EVE-242.md).
- Evidence: [EVE-242/9a75b7d5-81c3-4ba1-8c5e-c5dfc100565f](https://linear.app/resnovas/issue/EVE-242/archive-the-manual-pre-amp-packages-and-create-a-clean-package-tree#comment-9a75b7d5-81c3-4ba1-8c5e-c5dfc100565f).
- Implementation: Agent paused without moving files and sought owner clarification; no permission to preserve the tooling was established.
- Concrete outstanding parameters: Historical alternative only; do not resurrect it because old CI referenced those tools.
- Superseded by: [platform-full-manual-reset-direction](#platform-full-manual-reset-direction). Final owner reset expressly retires active manual test/coverage/declaration/Nx/workspace tooling.

### platform-full-manual-reset-direction

Archive all manual implementation and tooling as historical references, retire active discovery/CI references and build the replacement from fresh approved specifications.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-242](issues/EVE-242.md), [EVE-23](issues/EVE-23.md).
- Evidence: [EVE-242/description](https://linear.app/resnovas/issue/EVE-242/archive-the-manual-pre-amp-packages-and-create-a-clean-package-tree).
- Implementation: Explicit final reset selects a minimal clean skeleton, then house enrollment, then fresh application foundation; no legacy copying by default.
- Concrete outstanding parameters: Preserve history, distinct existing archive and private tests gitlink; do not overwrite snapshots, point active checks into archives or scaffold replacement in the reset issue. Later approved lowercase rename retains historical bytes.
- Superseded by: None explicitly established in this record. Supersedes manual-tool retention proposal and original behavior-preserving core extraction; does not erase historical evidence.

### platform-reset-owner-acceptance

Accept the validated archive/reset and authorize its direct-main delivery.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T00:32:43.986Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-242](issues/EVE-242.md).
- Evidence: [EVE-242/f649e149-1a12-408e-ba9c-a56fa53c723d](https://linear.app/resnovas/issue/EVE-242/archive-the-manual-pre-amp-packages-and-create-a-clean-package-tree#comment-f649e149-1a12-408e-ba9c-a56fa53c723d).
- Implementation: Explicit acceptance reported alongside verified reset commits; retired application tests are absent, not passed.
- Concrete outstanding parameters: House enrollment proceeds next; foundation and EVE-23 remain separately sequenced. Historical hosted billing-lock failure does not undo byte-preservation evidence.
- Superseded by: None explicitly established in this record. Releases reset acceptance hold only.

### platform-project-mission-restoration-direction

Restore the historical product mission in the active README while retaining current setup and archive guidance.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-13T19:52:38.350Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-242](issues/EVE-242.md).
- Evidence: [EVE-242/fdaab9f5-8585-45ba-8dd1-b872e3cd70e9](https://linear.app/resnovas/issue/EVE-242/archive-the-manual-pre-amp-packages-and-create-a-clean-package-tree#comment-fdaab9f5-8585-45ba-8dd1-b872e3cd70e9).
- Implementation: Documentation and graph delivery reported; product aims are explicitly not claims of working features.
- Concrete outstanding parameters: Do not present historical survey percentages without methodology or imply missing fleet code exists; no reopening of the accepted reset.
- Superseded by: None explicitly established in this record. Adds mission context without restoring archived operational tooling.

### platform-house-enrollment-direction

Fully enroll the reset repository in current house synchronization while preserving Eventiva direct-main delivery and security/spending controls.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-243](issues/EVE-243.md).
- Evidence: [EVE-243/description](https://linear.app/resnovas/issue/EVE-243/fully-enrol-eventiva-in-smartcloud-house-synchronization).
- Implementation: Description combines authorized enrollment with historical billing reports; later comments supply actual successful settings/workflow evidence and explicit completion direction.
- Concrete outstanding parameters: Dry-run and record managed-file/settings effects, preserve local exception, verify idempotence and settings read-back; no automatic budget increases, paid agents or destructive ambiguity.
- Superseded by: None explicitly established in this record. Early billing/CI-blocked description status is historical after later executed enrollment; safeguards remain.

### platform-billing-hard-stop-spec

Keep independently enforced metered-spend hard stops and require explicit owner approval for increases or cost-incurring automation.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-243](issues/EVE-243.md), [EVE-248](issues/EVE-248.md).
- Evidence: [EVE-243/description](https://linear.app/resnovas/issue/EVE-243/fully-enrol-eventiva-in-smartcloud-house-synchronization).
- Implementation: Separate browser-session report says zero-overage hard stops were applied; this review did not access live billing and does not turn reported settings into independent verification.
- Concrete outstanding parameters: Verify billed account/product scope, hard-stop behavior and alerts; included usage differs from paid overage, subscriptions/licences are separate, no per-app cap invented. Nonzero ceilings and paid AI-gate restoration need owner decision.
- Superseded by: None explicitly established in this record. Corrected billing attribution supersedes initial speculation; successful CI does not authorize spending or prove all billing settings.

### platform-direct-main-reconfirmation

All Eventiva coding agents deliver directly to main; separate governance repository and house/graph bot workflows retain their established processes.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-13T13:30:01.964Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-243](issues/EVE-243.md).
- Evidence: [EVE-243/b3587ec4-b6d3-4624-ac7c-3579cc7e29f3](https://linear.app/resnovas/issue/EVE-243/fully-enrol-eventiva-in-smartcloud-house-synchronization#comment-b3587ec4-b6d3-4624-ac7c-3579cc7e29f3).
- Implementation: Explicit owner reconfirmation, not permission to bypass source security or invent human review on the separate house PR.
- Concrete outstanding parameters: Retain signed/checked delivery, owner identity and zero-spend controls; outside-repository changes follow their own approvals.
- Superseded by: None explicitly established in this record. Reconfirms the repository-specific delivery exception rather than universal house PR behavior.

### platform-house-enrollment-completion-direction

Mark house enrollment Done following the successful settings/workflow evidence.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-13T13:42:04.980Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-243](issues/EVE-243.md).
- Evidence: [EVE-243/15b75a04-74d2-40c7-a143-e5a6b0b6c874](https://linear.app/resnovas/issue/EVE-243/fully-enrol-eventiva-in-smartcloud-house-synchronization#comment-15b75a04-74d2-40c7-a143-e5a6b0b6c874).
- Implementation: Explicit owner instruction, with manual push-limit and billing follow-ups initially left separate.
- Concrete outstanding parameters: Do not infer every restricted admin/billing read-back succeeded; next owner decision specifically removes the manual-limit enrollment gate.
- Superseded by: None explicitly established in this record. Supersedes earlier blocked enrollment status, not independent billing/paid gate controls.

### platform-house-five-ref-waiver

Skip the manual five-ref push limit as an enrollment requirement and unblock the fresh foundation.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-13T13:43:59.417Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-243](issues/EVE-243.md).
- Evidence: [EVE-243/f4aff849-cdfc-4d5b-8a67-89ea645e5c09](https://linear.app/resnovas/issue/EVE-243/fully-enrol-eventiva-in-smartcloud-house-synchronization#comment-f4aff849-cdfc-4d5b-8a67-89ea645e5c09).
- Implementation: Explicit bounded owner waiver; later read-back comment ending in stale blocked advice is not a reversal.
- Concrete outstanding parameters: No waiver of signature, security, spending or other evidence requirements; live billing recheck remains distinct.
- Superseded by: None explicitly established in this record. Supersedes earlier five-ref prerequisite only; EVE-244 is not currently blocked by this historical condition.

### platform-learning-platform-spec

Plan an integrated accessible offline-capable learning, assessment and competency platform with immutable content/evidence versions and portable contracts.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-245](issues/EVE-245.md).
- Evidence: [EVE-245/description](https://linear.app/resnovas/issue/EVE-245/build-the-integrated-training-competency-and-certification-platform).
- Implementation: Planning only; later owner scope explicitly limits invasive proctoring and simulation.
- Concrete outstanding parameters: Programme/pathway/course/module/activity hierarchy; configurable assessment, renewal and assignments; competent-human approval of regulated content, exportable signed evidence, lawful sourced packs, privacy/retention/residency and agent parity. Standards support must preserve offline/security requirements.
- Superseded by: None explicitly established in this record. Original broad optional anti-cheating language is narrowed by explicit no-core-proctoring direction; simulations remain supporting scope.

### platform-training-terminology-initial

Separate locale, domain vocabulary, operational profile and organization overlays while preserving stable concepts and historical profile versions.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T19:14:01.424Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-245](issues/EVE-245.md), [EVE-28](issues/EVE-28.md).
- Evidence: [EVE-245/9f030b49-6392-4805-8e3a-8ef4bfd0c0e7](https://linear.app/resnovas/issue/EVE-245/build-the-integrated-training-competency-and-certification-platform#comment-9f030b49-6392-4805-8e3a-8ef4bfd0c0e7).
- Implementation: Historical wording allowed individual terminology choice; not current operational policy after immediate owner correction.
- Concrete outstanding parameters: Keep licensed provenance, canonical round-trip IDs, safe cross-profile handover and training evidence versions; personal locale is distinct from operational vocabulary.
- Superseded by: [platform-training-tenant-terminology](#platform-training-tenant-terminology). Only individual operational/domain selection is superseded; provenance/locale/canonical concepts survive.

### platform-training-tenant-terminology

Tenant administrators select operational vocabulary and phraseology consistently; users retain only safe locale/accessibility choices.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T19:15:09.387Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-245](issues/EVE-245.md), [EVE-28](issues/EVE-28.md).
- Evidence: [EVE-245/bd361840-0379-48ea-9dd6-73ffd38e469b](https://linear.app/resnovas/issue/EVE-245/build-the-integrated-training-competency-and-certification-platform#comment-bd361840-0379-48ea-9dd6-73ffd38e469b).
- Implementation: Explicit correction, not independent user-selectable operational meaning.
- Concrete outstanding parameters: Govern event/channel interoperability, preview ambiguity/training impacts, audit versioned activation and retain historical profiles; cross-tenant labels show canonical equivalents without changing either tenant's policy.
- Superseded by: None explicitly established in this record. Supersedes immediately preceding personal operational-selection clause only.

### platform-credential-competency-direction

Separate viewed participation, assessed knowledge, assessor-signed practical competence and scoped operational authorization.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T19:41:09.418Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-245](issues/EVE-245.md), [EVE-154](issues/EVE-154.md), [EVE-80](issues/EVE-80.md).
- Evidence: [EVE-245/6503ce79-31b1-405a-923e-5a5baf87d0ce](https://linear.app/resnovas/issue/EVE-245/build-the-integrated-training-competency-and-certification-platform#comment-6503ce79-31b1-405a-923e-5a5baf87d0ce).
- Implementation: Recorded policy; a credential is not unrestricted/permanent role membership or an agent self-issued grant.
- Concrete outstanding parameters: Signed versioned issuer/subject/scope/evidence/content/profile/expiry/revocation claims; tenant maps them to live conditional grants. Low-risk auto-unlock permitted by policy, high-risk needs practical/independent approval; explain/simulate/revoke and recheck planning, shift and sensitive-action eligibility including bounded offline evidence.
- Superseded by: None explicitly established in this record. Refines learning completion into a conditional permission/eligibility model, not automatic role awards.

### platform-qualification-verification-direction

Keep qualification validity, evidence verification and issuer trust independent; unverified uploads cannot activate protected operational permissions.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T19:44:42.853Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-245](issues/EVE-245.md), [EVE-154](issues/EVE-154.md), [EVE-80](issues/EVE-80.md).
- Evidence: [EVE-245/668fab6f-9c43-4e5e-b059-9f11eeed079b](https://linear.app/resnovas/issue/EVE-245/build-the-integrated-training-competency-and-certification-platform#comment-668fab6f-9c43-4e5e-b059-9f11eeed079b).
- Implementation: OCR/AI extraction is proposed metadata, never proof of authenticity.
- Concrete outstanding parameters: Support signed/registry/API/manual methods and explicit unverified/pending/verified/rejected/expired/suspended/revoked/superseded states; record named verifier and minimal evidence, trust scopes, refresh/revocation and appeals. Only explicit low-risk bounded supervised provisional access is allowed.
- Superseded by: None explicitly established in this record. Does not conflate genuine-but-untrusted credentials with accepted authorization.

### platform-assessment-integrity-direction

Exclude invasive proctoring from core and use proportionate knowledge checks and human-assessed practical competence instead.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T19:48:04.624Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-245](issues/EVE-245.md), [EVE-154](issues/EVE-154.md).
- Evidence: [EVE-245/72c52075-f89a-4fc3-84d7-df6e0371b7e1](https://linear.app/resnovas/issue/EVE-245/build-the-integrated-training-competency-and-certification-platform#comment-72c52075-f89a-4fc3-84d7-df6e0371b7e1).
- Implementation: No guarantee of unaided unsupervised completion; optional third-party proctoring is outside core and disabled by default.
- Concrete outstanding parameters: Four levels: practice, knowledge check, verified knowledge and supervised practical competence. Retain versioned pools/attempts/passmarks/signatures/audit, learner rules/appeal/accommodations; no webcam/biometric/screen/lockdown/AI-cheating detection built into core.
- Superseded by: None explicitly established in this record. Narrows broader anti-cheating wording in the training description without removing ordinary integrity controls.

### platform-training-version-impact-direction

Publish immutable training versions and preserve exact evidence versions; apply differentiated editorial/minor/material/critical retraining governance.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-11T19:51:43.819Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-245](issues/EVE-245.md), [EVE-154](issues/EVE-154.md).
- Evidence: [EVE-245/cc371f77-4c6b-4ac2-ae98-cd0109db0745](https://linear.app/resnovas/issue/EVE-245/build-the-integrated-training-competency-and-certification-platform#comment-cc371f77-4c6b-4ac2-ae98-cd0109db0745).
- Implementation: Named authorized publisher, not AI, approves critical/regulated impact.
- Concrete outstanding parameters: Default packs require impact class, diff, standard changes and migration/retraining policy with non-weakenable critical floors; tenant-authored impact/access-consequence fields remain optional unless tenant policy requires. Unset tenant fields do not silently retrain. Signed offline manifests expose obsolete critical content.
- Superseded by: None explicitly established in this record. Exact content versioning is universal; mandatory impact classification is intentionally not universal.

### platform-small-training-simulation-direction

Keep simulation a small optional training submodule using synthetic branching scenarios, not a standalone simulator or prerequisite to live dispatch.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T18:59:07.444Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-245](issues/EVE-245.md).
- Evidence: [EVE-245/68494ba4-67df-4d3a-a399-71d75c526182](https://linear.app/resnovas/issue/EVE-245/build-the-integrated-training-competency-and-certification-platform#comment-68494ba4-67df-4d3a-a399-71d75c526182).
- Implementation: Product scope only, no implementation or dependencies; learning results do not confer practical competence or live authority.
- Concrete outstanding parameters: Reuse controlled SOP/action semantics but isolate records/projections from live dispatch, messages, external effects and production logs; start with resumable branching choices/feedback, no simulated emergency phone intake or game/voice system.
- Superseded by: None explicitly established in this record. Narrows earlier broad simulator interpretation. Its then-open SOP default is explicitly decided by the next owner approval.

### platform-guided-sop-default-direction

Make shared guided SOPs advisory by default, with tenant-configurable mandatory steps/evidence and independent authorized sign-off.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-15T19:05:46.112Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-245](issues/EVE-245.md), [EVE-253](issues/EVE-253.md).
- Evidence: [EVE-245/fc5bad0d-14b9-488c-929f-7e2aa081f181](https://linear.app/resnovas/issue/EVE-245/build-the-integrated-training-competency-and-certification-platform#comment-fc5bad0d-14b9-488c-929f-7e2aa081f181).
- Implementation: Product specification approved; neither separate workflow engine nor implementation/dependency adoption authorized.
- Concrete outstanding parameters: Isolate optional training reuse, preserve controlled procedure versions, and never infer competency or permissions from scenario completion.
- Superseded by: None explicitly established in this record. Resolves the advisory-versus-mandatory default previously left open, without allowing weakened protected approval floors.

### platform-marketplace-payments-direction

Plan supplier-merchant noncustodial payments through neutral actions with a first direct-charge connected-account invoice adapter and application fee.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-246](issues/EVE-246.md).
- Evidence: [EVE-246/description](https://linear.app/resnovas/issue/EVE-246/define-provider-neutral-connected-account-invoicing-and-settlement).
- Implementation: Approved direction only; no SDK, provider agreement/account/provisioning or code implementation authorized.
- Concrete outstanding parameters: Eventiva owns canonical invoice/payment/commission/refund/dispute/fulfilment/reconciliation/audit IDs; adapters own provider maps/capabilities. Supplier remains merchant, no Eventiva custody/escrow/payment credentials or offline money movement. Replay-safe signed webhooks/read-back, same human approvals on every surface, safe provider-held release eligibility and separate contractual/payment disputes.
- Superseded by: None explicitly established in this record. Provider neutrality does not silently transplant issued invoices/captured payments or authorize new providers.

### platform-supplier-maturity-calibration-proposal

Calibrate versioned supplier maturity targets and provider-supported payout timing using history, verified diversity and fulfillment/loss evidence rather than turnover alone.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-246](issues/EVE-246.md).
- Evidence: [EVE-246/description](https://linear.app/resnovas/issue/EVE-246/define-provider-neutral-connected-account-invoicing-and-settlement).
- Implementation: Initial configurable calibration, not final underwriting/provider/legal clearance or automatic trust from badges.
- Concrete outstanding parameters: New: 14 days after eligibility; Established: six months, 50k-100k settled, 12+ contracts, 2-3 verified clients/qualifying month, about seven-day delay; Proven: six qualifying months, 500k-1m, 50+ contracts, about 10 clients/month, 72 hours or safest provider schedule. Qualify five of six months; one missed grace, two warning, three demotion review. Define loss thresholds, alternative low-turnover evidence, reminders and appeal; 14-day no-response eligibility, per-milestone/dispute holds need provider/legal proof.
- Superseded by: None explicitly established in this record. Core noncustodial/supplier-merchant architecture is approved; these numerical risk settings remain calibration, not an unqualified launch guarantee.

### platform-catalogue-discovery-deferral

Defer supplier catalogue onboarding to later source-rights and import discovery, keeping shared technical references separate from tenant-private stock.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-247](issues/EVE-247.md).
- Evidence: [EVE-247/description](https://linear.app/resnovas/issue/EVE-247/research-supplier-product-catalogue-coverage-and-bulk-inventory).
- Implementation: No research execution, scraping, survey/outreach, import/code/model training or vendor selection authorized now.
- Concrete outstanding parameters: On resumption decide priority categories/manufacturers, lawful/licensed sources, provenance/version conflict handling, inventory export tools, CSV mapping/preview/duplicate/idempotent rollback and quality metrics/budget. Preserve private pricing/quantity/availability controls and no private-record training default; Firecrawl is only a candidate.
- Superseded by: None explicitly established in this record. No approval of a scraper or promise of universal product coverage follows from the adoption goal.

### platform-cluster-generation-proof-spec

Use one cluster-capable authorized execution path and persist exact module/provider/schema generation and fenced workflow ownership through runner recovery.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-252](issues/EVE-252.md), [EVE-257](issues/EVE-257.md).
- Evidence: [EVE-252/description](https://linear.app/resnovas/issue/EVE-252/implement-effect-cluster-sharding-and-multi-runner-recovery-in-the).
- Implementation: Owner one-runner Community/multi-runner production direction already recorded separately; current process-harness evidence does not establish production topology readiness or durable module fencing.
- Concrete outstanding parameters: Same conformance single/two-plus independent runners, drain/SIGKILL/restart/order/dedup/live approval/revocation/tenant isolation; never repin pending work to latest. Expose achieved healthy runner count, preserve atomic A1, verify pooled/direct storage and least-privilege/DDL/Neon behavior before production. Nonnegative observation generation differs from verified serving pin.
- Superseded by: None explicitly established in this record. Rejects local-only alternate business engine and process-local lease-as-distributed-proof interpretations, not database-per-tenant architecture.

### platform-shared-procedure-spec

Use one versioned controlled procedure/run model attached to existing issues with durable steps, evidence, handover and canonical authorized actions.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-253](issues/EVE-253.md).
- Evidence: [EVE-253/description](https://linear.app/resnovas/issue/EVE-253/build-shared-guided-sop-procedures-and-governed-step-execution).
- Implementation: Approved SOP default is separate owner direction; no implementation/driver/dependency authorization supplied.
- Concrete outstanding parameters: Draft/publish/supersede/retire exact definitions; runs preserve original issue and immutable attempts, approvals and content/profile versions. Reuse Workflow/Cluster and common rule engine; routine offline notes only, fresh online authority for dispatch/safety/sign-off. Synthetic learning cannot invoke live write executor or issue credentials.
- Superseded by: None explicitly established in this record. No simulated emergency intake or second SOP-only workflow/rules engine is required.

### platform-emergency-human-initiation-direction

Require deliberate authorized human initiation for every Eventiva operational incident/alarm/emergency response output; alerts and suggested procedures alone never actuate control.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-253](issues/EVE-253.md), [EVE-254](issues/EVE-254.md), [EVE-255](issues/EVE-255.md), [EVE-256](issues/EVE-256.md).
- Evidence: [EVE-253/description](https://linear.app/resnovas/issue/EVE-253/build-shared-guided-sop-procedures-and-governed-step-execution), [EVE-254/description](https://linear.app/resnovas/issue/EVE-254/define-qlab-class-cue-playback-and-end-to-end-production-control), [EVE-255/description](https://linear.app/resnovas/issue/EVE-255/build-separate-local-show-playback-and-cue-execution-engine), [EVE-256/description](https://linear.app/resnovas/issue/EVE-256/connect-mdt-incidents-and-external-controls-to-live-show-cues-and).
- Implementation: Unconditional product policy, not tenant-configurable bypass or current implementation claim.
- Concrete outstanding parameters: False alarm/misclassification produces zero show/audio/light/PA/dispatch outputs; manual selected versioned preset logs initiator/result/partial failures and never replays stale emergency commands. Ordinary human-armed nonemergency cue automation remains allowed. Independent certified fire/evacuation/physical overrides remain autonomous and must not wait for Eventiva confirmation.
- Superseded by: None explicitly established in this record. Supersedes any default-only interpretation allowing configured alarm automation; does not revoke ordinary show programming or certified-system duties.

### platform-show-native-vs-orchestration-proposal

Historically consider native playback versus orchestration-only show control before locking media/runtime design.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-254](issues/EVE-254.md).
- Evidence: [EVE-254/description](https://linear.app/resnovas/issue/EVE-254/define-qlab-class-cue-playback-and-end-to-end-production-control).
- Implementation: Older open A/B discussion retained as historical text within the updated description.
- Concrete outstanding parameters: No longer an open product-scope choice; exact engine/library/codecs and host-OS proof remain undecided implementation parameters.
- Superseded by: [platform-native-show-product-direction](#platform-native-show-product-direction). Prepended explicit owner decision selects native playback plus external control, not orchestration-only.

### platform-native-show-product-direction

Target complete QLab-class cue families with native playback and external control in a dedicated deterministic local show engine, separate from MDT dispatch.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-254](issues/EVE-254.md), [EVE-255](issues/EVE-255.md).
- Evidence: [EVE-254/description](https://linear.app/resnovas/issue/EVE-254/define-qlab-class-cue-playback-and-end-to-end-production-control), [EVE-255/description](https://linear.app/resnovas/issue/EVE-255/build-separate-local-show-playback-and-cue-execution-engine).
- Implementation: Product scope and parity target only, no working implementation/licence to copy proprietary code/UI or approval of codecs/drivers/runtime.
- Concrete outstanding parameters: Audio/mic/video/camera/text/light/fades/network/MIDI/files/timecode/scripts; lists/carts/nested groups/timeline/operator controls, routing/effects/sync and reusable versioned cue/template/venue assets. Pin published/armed snapshots; require review/rehearsal/republish after source edits. Prove supported hardware/latency/jitter/offline media/clock/crash/fencing/manual stop and script sandbox/budgets before adoption; Cluster is not a per-frame executor.
- Superseded by: None explicitly established in this record. Resolves native-versus-orchestration scope while preserving already approved protocol/direct-DMX direction and independent safety systems.

### platform-bidirectional-show-mdt-direction

Connect authorized MDT incident commands and external controls to allowlisted F1 cue actions through one versioned mapping and separate local playback executor.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-256](issues/EVE-256.md), [EVE-254](issues/EVE-254.md), [EVE-255](issues/EVE-255.md).
- Evidence: [EVE-256/description](https://linear.app/resnovas/issue/EVE-256/connect-mdt-incidents-and-external-controls-to-live-show-cues-and).
- Implementation: Confirmed product requirement only; no listener/driver/dependency/network exposure or deployment authorization.
- Concrete outstanding parameters: Model event received, authorized/accepted command, delivered transport and observed device state separately. Bind tenant/event/show/source identity, mapping version, freshness/replay/rate/fencing and endpoint outcomes; no public raw OSC/MIDI/DMX listener or protocol-implied authentication. Local path must actually reach a safe bridge; template edits cannot mutate armed presets. Operational emergency always needs human initiation.
- Superseded by: None explicitly established in this record. Refines notification-only interpretation without creating a second cue/dispatch engine or automatic emergency response.

### platform-module-kernel-spec

Compose exact-version modules and named provider instances with declared environments, governed lifecycle and safe ready-generation updates over the existing ActionHost.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-257](issues/EVE-257.md).
- Evidence: [EVE-257/description](https://linear.app/resnovas/issue/EVE-257/implement-the-composable-module-kernel-and-safe-lifecycleprovider).
- Implementation: Process-local lifecycle/lease tests and instrumentation are bounded evidence; distributed fencing and durable ready delivery remain separate gates.
- Concrete outstanding parameters: Reject duplicate/missing/ambiguous/cyclic/incompatible/unachieved trust and isolation bindings. Prevalidate without mutation; preserve old serving generation on candidate failure; busy leased updates refuse, scope releases permit retry, staged/incompatible migration returns restart-required before mutation. Register/validate/install/activate/ready/deactivate/unregister/retire/update/recover, reverse cleanup and nondeleted data/history need explicit tests.
- Superseded by: None explicitly established in this record. Older checkpoint unknown-type defects/holds are historical findings, not accepted API erasure; current exact typing and owner narrow review govern.

### platform-resources-migration-spec

Expose one typed authorized Resources API while only privileged adapters perform tenant-routed SQL and compatible forward declaration migrations.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-258](issues/EVE-258.md).
- Evidence: [EVE-258/description](https://linear.app/resnovas/issue/EVE-258/add-the-database-neutral-resources-api-and-privileged-tenant-migration).
- Implementation: Two-dialect process and SQL-error rollback evidence exists; full migration crash/power-loss, durable generation and all platform acceptance remain open.
- Concrete outstanding parameters: Recheck tenant/principal/field grants each operation; use exact existing Storage transaction for records/revisions/outbox/audit. Canonical registry, namespace ownership, collision/type/history checks, retained generation preflight, checksums/stale-writer fencing and no down/delete/reset. Features cannot reach SQL indirectly; runtime/integration both depend one-way on contracts. No JSON-only substitute for approved raw device tables.
- Superseded by: None explicitly established in this record. SQL adapter owns physical plans/history; kernel migration metadata is not a second executor or transaction engine.

### platform-declarative-ui-spec

Initial untrusted UI extensions are validated data only interpreted by installed approved components and bound to the canonical authorized action/screen inventory.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-259](issues/EVE-259.md).
- Evidence: [EVE-259/description](https://linear.app/resnovas/issue/EVE-259/implement-the-initial-declarative-ui-module-registry-over-approved).
- Implementation: Injected DOM interpreter/browser evidence is not adopted Rambo, real native, production identity or executable sandbox proof.
- Concrete outstanding parameters: Reject functions/eval/imports/unknown components or actions, duplicate nodes, absent translations and inaccessible layouts before publication. Atomically register/dispose routes/projections/listeners; viewer masks and protected controls cannot be bypassed/relabelled by extensions. Prove default/error/denied/offline/accessibility states and every claimed native target; tenant-private/community imports need capability consent, not compulsory catalogue review.
- Superseded by: None explicitly established in this record. Keeps executable federation, screen awareness and rich designer work distinct without duplicating registries.

### platform-ready-banner-reference-spec

Build the exact historical startup banner as the first clean reference extension, released only after verified ready and demonstrating resources, hooks, UI and central logging.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-260](issues/EVE-260.md).
- Evidence: [EVE-260/description](https://linear.app/resnovas/issue/EVE-260/build-the-clean-word-art-reference-extension-after-verified-platform).
- Implementation: Required integrated acceptance fixture remains blocked/unproved, not satisfied by matching a logger test fixture or synthetic ready event.
- Concrete outstanding parameters: Inspect archived word art/copyright bytes, preserve output order/layout, no onLoad/early banner or core/feature edits. Dedup logical job per persisted runtime/generation/source event, document physical-console crash ambiguity rather than promise exactly-once. Show two unchanged-source compositions, schema/config redaction, optional field migration/history, declarative UI/action parity and clean update/drain/unregister.
- Superseded by: None explicitly established in this record. Not an editable word-art product; downstream banner success must not become a circular prerequisite for producing ready.

### platform-observer-dispatch-spec

Deliver immutable after-commit observations through a governed registry and current scoped release policy, with additive effects only through separately authorized canonical actions.

- Authority: **settled-requirement**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-262](issues/EVE-262.md).
- Evidence: [EVE-262/description](https://linear.app/resnovas/issue/EVE-262/implement-governed-observation-only-execution-and-lifecycle-hooks-with).
- Implementation: Producer/outbox belongs EVE-45; dispatcher registration/drain is process-local until durable adapter/fencing proof. Manifest trust grants no plaintext rights.
- Concrete outstanding parameters: Initial policy denies all decrypting/emergency hooks, executable observers of Restricted/Vault/protected operations and financial additive dispatch. Keep issuer identity authoritative, payload projections minimal, enrollment/delivery grants live, queues bounded, retry/dedup/dead-letter tenant scoped; no arbitrary plugin on protected transaction critical path or mutation/veto/result replacement. Conceptual headings are not extra public API names.
- Superseded by: None explicitly established in this record. Initial stricter denials narrow broad future boundary-service language; later broad capability discussion does not silently allow protected callbacks.

### platform-acyclic-exact-types-direction

Reject static, type-only, generated and runtime manifest/provider cycles and preserve precise Effect contracts without erased types, unsafe casts or suppressed diagnostics.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: Unknown; no owner decision time available. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-263](issues/EVE-263.md).
- Evidence: [EVE-263/description](https://linear.app/resnovas/issue/EVE-263/enforce-acyclic-moduledependency-graphs-and-exact-effect-ts-types).
- Implementation: Binding quality gate; isolated test success and existing violations are not grandfathered acceptance.
- Concrete outstanding parameters: Resolve aliases/reexports/type queries/transitive edges from actual exports; source/manifest/provider/declaration graph negatives plus shared-contract positives and precise input/output/error/environment fixtures. External input decodes narrowly; unavoidable private vendor opacity needs explicit review, never public unknown/any or a catch-all none.
- Superseded by: None explicitly established in this record. Later callback approval is narrow and preserves the broader gate, rather than authorizing general escapes.

### platform-declaration-checker-callback-direction

Approve emitted-declaration traversal/checker strengthening and only existing required private Effect Logger/Tracer opaque callbacks that are immediately narrowed or discarded.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-17T05:59:38.706Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-263](issues/EVE-263.md), [EVE-44](issues/EVE-44.md).
- Evidence: [EVE-263/7c52f4a2-9333-4f9e-9f2b-0b66eae29996](https://linear.app/resnovas/issue/EVE-263/enforce-acyclic-moduledependency-graphs-and-exact-effect-ts-types#comment-7c52f4a2-9333-4f9e-9f2b-0b66eae29996).
- Implementation: Explicit owner approval reported with exact checker/fixture evidence; latest delivery is not broad EVE-263 completion or all remote CI passed.
- Concrete outstanding parameters: No new explicit opaque type, public erasure, unsafe cast/suppression or expanded checker exception. Traverse exported declaration imports/reexports/type queries; fail missing declarations or nondeclaration fallback. Source/manifest/security gates remain intact.
- Superseded by: None explicitly established in this record. Supersedes earlier absent-review concern for these exact required private callbacks only. Central separately owns original-thread provenance and reflection exception reconciliation.

### pseudonymous-request-correlation

Only pseudonymous session and user correlation is selected, with per-request opt-in, current user consent and protected-profile exclusion; raw identifier export is not authorized.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-17T13:17:48.704Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-60](issues/EVE-60.md), [EVE-19](issues/EVE-19.md).
- Evidence: [EVE-60/55507185-3858-42e4-b1f9-e868357b54f7](https://linear.app/resnovas/issue/EVE-60/telemetry-f4-propagate-session-and-person-context-from-clients-into#comment-55507185-3858-42e4-b1f9-e868357b54f7).
- Implementation: Authenticated owner selection was at 2026-11-17T13:16:16.737Z; this record timestamp is the later Amp Linear relay. Synthetic local admission remains the implemented prerequisite, not production ingress or identity export.
- Concrete outstanding parameters: Current consent/issuer/ingress/export enforcement, client/native replay compatibility, captured-error/AI linkage and release remain unproved. The agent relay additionally prohibits raw SDK tracing headers; it is not quoted owner wording.
- Superseded by: None explicitly established in this record. Narrows the historical EVE-19/EVE-60 raw-header sketch for actual identities without changing the finite synthetic fixture.

### dedicated-correlation-key-custody

Use a dedicated secret-store/KMS correlation key separated per tenant, destination and purpose, retaining cross-server linkability only until rotation.

- Authority: **recorded-owner-direction**. This records evidence, not a new approval.
- Source timestamp: 2026-11-17T13:23:58.129Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-60](issues/EVE-60.md), [EVE-19](issues/EVE-19.md).
- Evidence: [EVE-60/9cb2d84b-90b0-41b8-aeb9-1253346d5f39](https://linear.app/resnovas/issue/EVE-60/telemetry-f4-propagate-session-and-person-context-from-clients-into#comment-9cb2d84b-90b0-41b8-aeb9-1253346d5f39).
- Implementation: Authenticated choice completed at 2026-11-17T13:18:55.545Z; the record timestamp is the later agent relay. Design-only authority provisions no key/secret and enables no production path.
- Concrete outstanding parameters: Concrete rotation lifetime and algorithm were not selected. Server-only custody, no existing-key reuse/dependencies and injected fixture keys are separately recorded agent constraints, not additional human selections.
- Superseded by: None explicitly established in this record. Refines pseudonymous-request-correlation key ownership, not a provisioning or release approval.

### correlation-epoch-crypto-proposal

The analysis lane recommends one-hour UTC-aligned epochs and local HMAC-SHA-256 with separately scoped 256-bit keys, without an old-key alias bridge; this is not owner-selected.

- Authority: **proposal**. This records evidence, not a new approval.
- Source timestamp: 2026-11-17T13:23:58.129Z. Comment creation time is evidence time, not necessarily the time of the owner's instruction.
- Scope: [EVE-60](issues/EVE-60.md).
- Evidence: [EVE-60/9cb2d84b-90b0-41b8-aeb9-1253346d5f39](https://linear.app/resnovas/issue/EVE-60/telemetry-f4-propagate-session-and-person-context-from-clients-into#comment-9cb2d84b-90b0-41b8-aeb9-1253346d5f39).
- Implementation: No crypto/export implementation, key generation/provisioning or production transport is included in the synthetic checkpoint.
- Concrete outstanding parameters: Owner must confirm the rotation lifetime before real-identity follow-up. Algorithm/framing/domain separation, grant-expiry and queued-dispatch controls still require bounded implementation and proof, not inference from this proposal.
- Superseded by: None explicitly established in this record. No approval or replacement of unresolved choices is inferred from a recommendation.
<!-- planning:generated:end -->
