# Foundation and integration timeline

Last reconciled with Linear: 2026-11-17 (EVE-250/251 parameter checkpoint added 2026-11-18). Dates describe recorded decisions or this snapshot, not invented delivery deadlines. Status is the issue's observed status; repository source presence and focused tests do not close broader acceptance. Detailed contracts remain in the [modular specification](../architecture/modular-platform.md) and the [decision index](decisions.md).

## Concrete trust and marketplace parameters - 2026-11-18

Jonathan approved standard concrete choices for EVE-251/EVE-250 on 2026-11-18,
relayed through the [Puck coordination thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a).
Each choice and its reasons are in the [decision index](decisions.md#concrete-trust-and-marketplace-parameters---2026-11-18).
Both issues remain In Progress; this checkpoint does not mark either Done.

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Record concrete choices | Completed | Ed25519, RFC 8785, SHA-256, AES-256-GCM per-record DEKs under KMS KEKs, 3-of-5 root custody, rotation, timing, freshness, retention, recovery, compensation and reconciliation basis recorded with reasons. Architecture register and diagrams updated. |
| Portable contracts | Completed locally | `@eventiva/contracts/trust-profile` and `@eventiva/contracts/marketplace-policy`: schemas, ports, safe `CryptoUnavailable`, RFC 8785 canonicalization and pure policy functions with boundary tests. |
| Node implementation | Completed locally | `@eventiva/integrations.trust.server/crypto` over `node:crypto`, no new dependency: envelope seal/open, M2 request sign/verify, signed per-gate evidence feeding the existing `trustPreflight`. Tamper, swap, vault, revocation, purpose, service, window and stale-evidence negatives pass; mutation controls fail as expected. |
| Shared outputs and gates | Recorded on Linear with the delivered commits | LLMS, planning and Graphify regenerated; root check, full verify and strict planning results are posted on EVE-251 and EVE-250. |
| Provisioning and activation | Upcoming / separately gated | No KMS, HSM or attestation product selected or provisioned; `privateExchangeUnavailable` still refuses release. Region mapping, lawful bases, staff access and M3 thresholds remain open. |

```mermaid
flowchart LR
    Approve["2026-11-18 approval: standard choices"] --> Record["Decisions with reasoning"]
    Record --> Contracts["trust-profile and marketplace-policy contracts"]
    Contracts --> Node["Node Ed25519 and AES-256-GCM integration"]
    Node --> Verify["Full verification and signed main delivery"]
    Verify --> Open["Provisioning, regions, staff access still open"]
```

## Canonical invoice sandbox - 2026-11-18

[EVE-246](https://linear.app/resnovas/issue/EVE-246) slice 2 follows the explicit no-real-money continuation in [the coordinating thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a). Detailed contracts and chosen bounds remain in [the payment guide](../payments.md#canonical-invoice-and-local-fake-provider-sandbox---slice-2).

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Canonical revision and mapping | Full slice verification passed | Exact minor-unit sums, bounded lines, separate provider identity and strict schema rejection; no legal numbering, statutory invoice or persistence claim. |
| Local neutral-port sandbox | Full slice verification passed | Synthetic card/bank issue, payment, split refund and read-back; exact-input idempotency, cumulative fee rounding, outage and wrong-merchant/mapping negatives. No real money, credential or network. |
| Shared outputs and delivery gates | Completed for this slice | Full verification and strict reviewed planning passed after rebasing concurrent security changes; clean-source graph and signed main revisions are recorded on EVE-246 with delivery evidence. |
| Real-provider sandbox adapter | External prerequisite open | Needs an authorized test platform and connected merchant, secure test API/webhook access and endpoint; no account provisioning or live credential is implied. Catalogue evidence/import work continues independently. |

```mermaid
flowchart LR
    Revision["Canonical exact-money revision"] --> Fake["Local fake provider"]
    Fake --> Flow["Issue / simulate pay / refund / read-back"]
    Flow --> Gates["Full gates and signed slice"]
    Gates --> External["Test-account adapter remains separate"]
    Gates --> Catalogue["Continue catalogue evidence and import"]
```

## Dependency security remediation - 2026-11-18

[EVE-265](https://linear.app/resnovas/issue/EVE-265/remediate-dependabotaudit-security-alerts-on-main)
was created In Progress on this date after searching for an existing dependency-security
issue. It is newer than the frozen complete issue capture; this checkpoint is not
a claim that the full mirror was refreshed. Jonathan's upgrade approval is relayed
through [the requesting thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a).
The [inventory and residual reasons](../dependency-security.md) own the details.

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Audit active and historical lockfiles | Completed inventory | Active: 0 critical, 2 high, 2 moderate. Historical main snapshot: 11 critical, 166 high, 175 moderate, 27 low; separate nested lockfiles recorded without double-counting the parent workspace. Dependabot API read denied (403). |
| Expo Zod major override | Completed delivery | Signed main commits e06839cf and 86a40aea; root audit 4 -> 3 (1 high, 2 moderate). Root check, full verify and uncached PostgreSQL/SQLite storage suite pass; exact evidence recorded on EVE-265. |
| Glob/minimatch majors | Completed delivery | Signed main source 2633f6f2 and graph 21b6eb8e after commerce/trust rebases. Scoped glob 14.0.4 / minimatch 11.0.7 preserve legacy APIs/cooldown. Root check, full verify (92 aggregate tasks), uncached storage (11 files / 206 tests), both SQLite/PostgreSQL process-loss proofs and 15 smoke/dependency tasks pass. Audit 3 -> 1 (high picomatch only); evidence on EVE-265. |
| Picomatch investigation | Blocked on upstream patch | Every dependency is transitive; all published versions through latest 4.0.7 are affected. Twenty checked latest-parent records retain it. Build-pattern exposure reproduced; no untrusted application glob API found. [Full tree and analysis](../dependency-security.md#picomatch-dependency-paths-and-reachability); no unsafe replacement or suppression. |
| Preserved-directory scanner policy | Current delivery increment | Jonathan approved all-case/all-depth examples/externals exclusions on 2026-11-18, preserving contents. Dependabot version-update filters, local house override and literal CodeQL case variants are covered by the root reference tests; full verification and exact delivery recorded on EVE-265. |
| Hosted alert triage / count | Pending owner access and action | Repository config cannot remove dependency-graph entries/alerts. [Documented owner steps](../dependency-security.md#apply-the-remaining-github-side-alert-policy) cover manifest auto-triage/dismissal and rebuild. Alert API 403; last push banner 401 (13 critical/188 high/170 moderate/30 low), not a post-rebuild count. Separate automatic Code Quality exclusions remain unverified. |
| Vendored reference refreshes | Upcoming / upstream boundary | Inventoried separately; reviewed upstream/subtree refreshes required, not provenance-breaking local patches. |

```mermaid
flowchart LR
    Inventory["Audit all lockfiles"] --> Zod["Expo Zod security batch"]
    Zod --> Matchers["Glob / minimatch compatibility batch"]
    Matchers --> Residual["Unpatched picomatch; preserve reference source"]
    Matchers --> Policy["Owner-approved all-case scanner policy"]
    Policy --> Triage["Owner manifest triage and graph rebuild"]
    Triage --> Count["Record actual hosted alert counts"]
```

## Payment and catalogue resumption - 2026-11-18

Jonathan's [owner message](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a#M-034zciY2mZuppwjcEvwc6g)
resumes the explicitly named issues; his later same-day decision defers EVE-248
until January 2027 while EVE-246/247 continue. The historical issue snapshot is not rewritten;
dated issue comments and the following checkpoint distinguish implementation
from broad product acceptance. Detailed contracts stay in the
[payment](../payments.md), [catalogue](../catalogue.md) and
[enrollment](../smartcloud-enrollment.md#eve-248-deferral---2026-11-18) guides.

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Read all three live issues and terminal comment pages | Completed | Original comments contain only GitHub synchronization notices. Owner resumption is separately cited; an agent relay does not authorize paid spend. |
| EVE-246 advisory per-obligation assessment | Full slice verification passed | Version 1 uses 14/7/3-day maturity delays, fourteen-day no-response eligibility, reminder evidence and fail-closed dispute/provider capability checks. Fake-clock boundary and negative tests pass; no funds or provider command. [Issue evidence](https://linear.app/resnovas/issue/EVE-246#comment-1301864e). |
| EVE-247 bounded mapped-stock preview | Full slice verification passed | Public/private identity separation, exact case-insensitive model matching, variant/punctuation controls, all-duplicate refusal and row-local correction outcomes. Eight focused tests across the two modules and production/test TypeScript compilation pass. [Issue evidence](https://linear.app/resnovas/issue/EVE-247#comment-719b971b). The catalogue guide separately cites two official manufacturer samples and two tool-format guides; source rights, connector compatibility and supplier discovery remain open. |
| EVE-248 owner deferral | Deferred; due 2027-01-04 | Jonathan: "Leave off for now, revisit in January only". [Decision recorded](https://linear.app/resnovas/issue/EVE-248#comment-887d205b). Keep override and all budgets unchanged; do not reopen before January 2027. No further work or read-only investigation by this lane. |
| Shared outputs and aggregate gates | Passed locally above main 86a40aea; signed delivery recorded separately | Planning/LLMS and clean-source Graphify regenerated after the generated-surface and dependency-security rebases. Root check passes 102 documentation fixtures and the ratchet with zero blocking violations; full disposable-PostgreSQL verification passes all 86 aggregate tasks (43 cached), 116 boundary/type fixtures and 15 smoke/dependency tasks (nine cached). Source/emitted graphs retain zero violations/cycles. Strict reviewed planning passes 258 issues/692 edges with zero unresolved/stale sources; Nx sync is current. Eight new rationale candidates received semantic review without classifier/debt changes. Exact signed revisions and pending/passed remote CI are recorded separately on EVE-246/247; local success is not remote acceptance. |
| Provider and inventory application integration | Upcoming / open | Canonical invoices/actions/fake-adapter conformance precede provider sandbox. Source/licensing research precedes real catalogue ingestion; mapped CSV staging/persistence/undo remains separate. Both broader issues remain open. |

```mermaid
flowchart LR
    A["Owner resumes EVE-246/247/248"] --> P["Advisory fulfilment assessment"]
    A --> C["Mapped private-stock preview"]
    A --> R["EVE-248 deferred by owner"]
    P --> V["Full gates and signed main slice"]
    C --> V
    R --> B["Revisit 2027-01-04; no work before January"]
    V --> N["Provider/action and catalogue research next"]
```

## Governed telemetry export isolation, batch 7 - 2026-11-17

Revision 4 of the [batch-7 packet](https://ampcode.com/artifacts/eventiva-next-parallel-slices-batch-7-readiness-3f236807-623e-4880-84ac-3a3624072841)
requires two private reference-isolation fixes, not new release policy. The
[EVE-60 checkpoint](https://linear.app/resnovas/issue/EVE-60#comment-94b7d482)
and [EVE-44 checkpoint](https://linear.app/resnovas/issue/EVE-44#comment-10803948)
record red-first execution on unchanged main 2e41eaf2. Live issue reads retain
EVE-60 Backlog and EVE-44 In Progress; neither is marked Done. The full source
snapshot remains historical. Detailed behavior stays in the
[export guide](../telemetry-export.md#preserve-admitted-scope-across-adapter-calls).

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Export binding and retained correlation token corruption | Completed reproduction | Eight mutation regressions fail on unchanged runtime source; 29 tests pass, including four new untouched controls. Provider/authority mutation widens record scope, changes a later pair or extends a released request beyond hourly UTC rotation. |
| Private admitted values | Focused verification passed | Fresh scalar views at authority/provider calls leave later profile and lease checks bound to the decoded originals. The same 37 focused cases pass; independent live-flag revocation controls are added. No contract, dependency, default-off flag or hourly refresh change. |
| Shared outputs and aggregate gates | Passed locally above main bbd214c2; signed delivery recorded separately | Planning/LLMS and clean-source Graphify regenerated. Root check passes 102 documentation fixtures with zero ratchet violations; full fixture-backed verify passes all 86 aggregate tasks (14 cached), source/declaration boundaries and three smoke projects plus 12 dependencies (nine cached). Strict reviewed planning reports 258 issues/692 edges with zero unresolved/stale sources. Final signed revisions and exact-head CI are recorded separately on both issues; local success is not remote CI acceptance. |
| Real correlation/export acceptance | Upcoming / separately gated | No authenticated ingress/device execution, ingestion, real issuer/consent/key custody, provisioning or production authorization. Broader EVE-60/EVE-44 acceptance remains open. |

```mermaid
flowchart LR
    Red["Batch 7: two alias defects reproduced"] --> Private["Private binding and request token"]
    Private --> Views["Disposable authority and provider views"]
    Views --> Fences["Original profile and hourly UTC fences"]
    Fences --> Verify["Full verification and signed main delivery"]
    Verify --> Open["EVE-60 / EVE-44 broader acceptance open"]
```

## PostgreSQL fixture cleanup checkpoint - 2026-11-17

The [batch 6 slice 2 contract](https://ampcode.com/artifacts/eventiva-next-parallel-slices-batch-6-readiness-3f236807-623e-4880-84ac-3a3624072841)
revision 3 covers test cleanup only, including the separately cleared server
fixtures. [EVE-261](https://linear.app/resnovas/issue/EVE-261) and
[EVE-42](https://linear.app/resnovas/issue/EVE-42) remain In Progress, independently
read on this date. Detailed cleanup instructions stay in [storage](../storage.md).

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| FORCE with a roleless autovacuum worker | Reproduced from unchanged main 954f8ec2 finalizer | Exact approved PG17.12 Bookworm fixture, generated SCRAM credentials, non-superuser CREATEDB role without pg_signal_backend. Both autovacuum-only and autovacuum-plus-own-session cases fail 42501 in TerminateOtherDBBackends; worker usesysid is NULL. |
| Own-role termination then plain DROP | Implemented; real autovacuum proof passed | The actual replacement marketplace finalizer drops both databases while workers are attached; the second case also has a lingering own-role session. No databases remain. The permanent scoped regression separately retains an independent own-role pool and asserts backend/database removal. No grant, role, image, scenario output, parser or timeout change. |
| Compatibility | Local verification completed above main 954f8ec2 | Three uncached storage runs each pass 202 tests plus both-dialect migration recovery; uncached server passes 25 tests plus PostgreSQL multi-process conformance. Root check, full verify (86 aggregate tasks, 12 cached; 15 smoke/dependency tasks, nine cached) and strict reviewed-source planning pass. No generated databases remain. |
| Independent delivery | Attribution hold resolved; final delivery checks required | Jonathan selected option B on 2026-11-17 via [Puck](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a), relayed to the [implementing thread](https://ampcode.com/threads/T-01a1eb07-4d9b-7261-ae91-ff657619305a): auto-added Amp-Thread-ID and generic Amp coauthor trailers are allowed as a standing attribution-only exception. Retain model-specific credit, Jonathan's sign-off and signed commits. This resolves the [EVE-261 hold](https://linear.app/resnovas/issue/EVE-261#comment-01748ac3) and [EVE-42 hold](https://linear.app/resnovas/issue/EVE-42#comment-e51eba87); it does not waive checks, extend the image exception or authorize production. Rebase onto latest main, regenerate shared outputs and rerun check, verify and strict reviewed planning before direct main push. Exact pushed revisions and results are recorded on the issues; pending CI is not passed evidence. |
| Broader storage/platform acceptance | Upcoming / open | Test-harness cleanup does not establish production least privilege, deferred Drizzle/device scope or G01-G15 acceptance. The fixture image exception still expires 2026-11-22 UTC or earlier on a recorded trigger; no extension or production authorization is supplied. |

```mermaid
flowchart LR
    R["PG17 FORCE: autovacuum 42501"] --> F["Terminate own sessions; plain DROP"]
    F --> V["Both-dialect storage and server compatibility"]
    V --> O["EVE-42 / EVE-261 broader acceptance open"]
    click R "https://linear.app/resnovas/issue/EVE-261"
    click O "https://linear.app/resnovas/issue/EVE-42"
```

## Declarative UI protection-floor checkpoint - 2026-11-17

[EVE-259](https://linear.app/resnovas/issue/EVE-259) and
[EVE-50](https://linear.app/resnovas/issue/EVE-50) remain In Progress, independently
read on this date. The [batch 5 slice 2 contract](https://ampcode.com/artifacts/eventiva-next-parallel-slices-batch-5-readiness-3f236807-623e-4880-84ac-3a3624072841)
requires private adapter isolation, not a contract change. Detailed behavior stays
in [the declarative module guide](../declarative-modules.md).

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Adapter-corrupted protection floor | Reproduced on unchanged source at main 355b1182 | New mutation cases failed four ways while the untouched protected control passed: suppression returned success instead of protected-node, node writes pruned traversal, and binding writes corrupted later dispatch. |
| Retained definition isolation | Implemented; focused checks passed | Private format-1 copies at admission, visibility, input validation and invocation preserve the admitted tree and binding. All 56 UI-module/screen-context tests pass; affected lint/typecheck pass. Live revocation, flags, offline state, field masking, stale handles and tenant controls remain tested. |
| Independent delivery | Signed checkpoints tracked on owning issues | The first full check/verify and strict reviewed-source planning passed above main 71ef9f65. Latest-main rebase, planning/LLMS/Graphify regeneration and repeated full gates precede each push; exact signed revisions and final results are recorded on both owning issues. Pending CI is not passing evidence; unresolved auto-added attribution trailers hold the push. |
| Native/device parity and broader UI acceptance | Upcoming / open | This process-local adapter regression does not prove native execution, renderer approval, real security composition or full screen-awareness acceptance. No dependency, public contract, provisioning or production activation changes. |

```mermaid
flowchart LR
    R["EVE-259: red adapter regression"] --> P["Private retained definition floor"]
    P --> V["UI and screen-context compatibility gates"]
    V --> O["EVE-259 / EVE-50 broader acceptance remains open"]
    click R "https://linear.app/resnovas/issue/EVE-259"
    click O "https://linear.app/resnovas/issue/EVE-50"
```

## Registered schema isolation, batch 4 slice 2 - 2026-11-17

The [revision 6 packet](https://ampcode.com/artifacts/eventiva-next-parallel-slices-current-main-readiness-f4c31b8c-2405-4743-ad32-bedc11c633a5)
limits this increment to the existing host registry. The [EVE-258 checkpoint](https://linear.app/resnovas/issue/EVE-258#comment-c32dee12)
and [EVE-23 checkpoint](https://linear.app/resnovas/issue/EVE-23#comment-4bee9f1d)
are agent evidence, not new owner decisions. EVE-258 remains In Progress;
EVE-23's existing completed status is unchanged, not newly certified.
Detailed lifetime behavior stays in [the foundation guide](../foundation.md#registered-declaration-isolation-eve-258--eve-23).

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Unscoped mutation regression | Reproduced on unchanged 6a2699b9 host | Two public regressions failed; 22 controls passed. Clearing the original contribution array removed its admitted field, and the activation wait reread caller-mutated declarations. |
| Admitted declarations and detached views | Implemented; focused verification passed | Resources, contributions, maps and field metadata are detached before preflight and for views. Host/execution passed 115 tests; schema compatibility passed 16. Independent scope removal, original ownership/protection/schema identities, optional metadata and concurrent conflict cleanup are covered. SQL and pure compose are unchanged. |
| Independent combined verification and signed delivery | Latest-main full gates passed; signed delivery tracked separately | Repeated after a rejected push race above immutable main 2dd741b8154c3dcc2f254c6ba0db78b8f02ce1b7, preserving independent execution, UI, compose, resource-driver, bootstrap, fixture-cleanup and kernel manifest-isolation changes. Root check passed with 102 documentation fixtures and zero blocking findings/violations. Full verify passed all 86 aggregate tasks (49 cached), all three smoke targets plus 12 dependencies (12 cached), source graph 178 files/641 edges and emitted graph 70 files/264 edges, both without violations/cycles. Strict reviewed planning passed 258 issues/692 edges with zero unresolved sources/stale outputs. Planning, LLMS and clean-source Graphify regenerated for publication under the attribution exception below. No settings or hook bypass. Signed revisions and remote CI follow-up are recorded on the owning issues; local success is not remote CI evidence. |
| Broader Resources and platform acceptance | Upcoming / open | No canonical registry redesign, SQL/migration behavior, durable recovery, decryption, production authorization or G01-G15 completion is supplied by this in-process lifetime correction. |

The approved disposable loopback PostgreSQL fixture used a non-superuser test
login and was removed after execution; no production service was provisioned.
The normal prune-only documentation generator removes one stale enclosing-suite
rationale identity after test additions, not a semantic debt remediation. All
other accepted identities remain, with source locations refreshed. The broader
captured issue mirror remains historical; these are separately dated evidence
annotations, not a complete live-source refresh or whole-issue acceptance.

**Attribution hold superseded, 2026-11-17:** Jonathan selected option B,
relayed through the [Puck thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a)
and recorded on [EVE-258](https://linear.app/resnovas/issue/EVE-258#comment-585506ae)
and [EVE-23](https://linear.app/resnovas/issue/EVE-23#comment-5b25448f).
The standing attribution-only exception permits auto-added `Amp-Thread-ID` and
`Co-authored-by: Amp <amp@ampcode.com>` trailers. Model-specific AI credit and
Jonathan's authorized sign-off remain required; no other gate, signing setting,
hook or production authorization changes. The exact owner-selection time was
not supplied. This supersedes the earlier absent-generic-trailers delivery hold,
not the latest-main regeneration and full-verification requirement.

## Marketplace authority input isolation checkpoint - 2026-11-17

[EVE-250](https://linear.app/resnovas/issue/EVE-250) remains In Progress,
independently read with its terminal 18-comment page. The
[batch 5 slice 3 contract](https://ampcode.com/artifacts/eventiva-next-parallel-slices-batch-5-readiness-3f236807-623e-4880-84ac-3a3624072841)
requires private input isolation, not new marketplace policy. The documentation
lane cleared all four reserved paths before test edits. Detailed behavior remains
in [the marketplace guide](../marketplace.md).

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Public regression before implementation | Completed | On unchanged runtime source, five new regressions failed and the 24 existing cases passed: stale version accepted, read/stage authority rewrites and both write-input mutation directions. The untouched stale request still conflicted. |
| Private runtime isolation | Focused verification passed | All 29 marketplace cases pass. Authority receives detached caller/snapshot/scope objects; independent intent/snapshot/scope objects cross the insert/enqueue boundaries. Stored version 3 rejects expectedVersion 2 without writes; original purpose/subject and identical-versus-changed retry semantics are retained. No contract or SQL adapter change. |
| Independent delivery gates | Signed delivery authorized; exact-head evidence tracked on EVE-250 | Jonathan selected option B on 2026-11-17 via Puck, relayed in the [delivery thread](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a): auto-added Amp-Thread-ID and generic Amp co-author trailers are a standing attribution-only exception; model-specific credit and Jonathan's sign-off remain required. This lifts the earlier push hold, not any verification or production boundary. The prior full check/verify and uncached 201-test storage/process proofs remain recorded separately. Latest-main rebase, planning/LLMS/clean-source Graphify regeneration, repeated full gates and final signed delivery are recorded on [EVE-250](https://linear.app/resnovas/issue/EVE-250). No pending CI is counted as passing evidence. |
| Broader marketplace acceptance | Upcoming / open | Saga, concrete identity/crypto/verifier/custody composition, policy parameters and private release remain separate. No dependency, production activation or policy choice is included. |

```mermaid
flowchart LR
    R["EVE-250: public red regressions"] --> I["Private authority and write inputs"]
    I --> V["Runtime, SQL/process and full gates"]
    V --> B["Broader marketplace acceptance remains open"]
    click R "https://linear.app/resnovas/issue/EVE-250"
    click B "https://linear.app/resnovas/issue/EVE-250"
```

## Exact admitted action input checkpoint - 2026-11-17

[EVE-39](https://linear.app/resnovas/issue/EVE-39) remains Backlog, independently
read with its terminal comment page. The [batch 3 slice 2 contract](https://ampcode.com/artifacts/eventiva-next-parallel-slices-current-main-readiness-f4c31b8c-2405-4743-ad32-bedc11c633a5)
revision 5 applies the already approved A1/A2 binding, not a new API or policy.
Detailed lifetime/codec behavior stays in [the action guide](../actions.md).

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Original mutable preparation | Reproduced on unchanged main 50668875 | Four corrupting trusted-authorizer/policy cases returned nested amount 999 and substituted batch items instead of approved 20; both unchanged controls passed. This is a volatile in-process fixture, not an external exploit or payment. |
| Preparation-only isolation | Focused verification passed | Private canonical encoded bytes, lazily decoded independently for every resource check, policy inspection and handler. All 114 execution/host/type tests pass, including nested arrays/objects, NumberFromString, retained-reference transaction waits and replay. |
| Independent verification and delivery | Full local gates passed; signed delivery evidence tracked separately | Above immutable main 7877c40d, root `check`, full `verify` (all 86 aggregate targets, 34 cached; all three smoke targets plus 12 dependencies, nine cached) and strict reviewed-source planning pass. Separate uncached storage compatibility passes 201 tests plus both-dialect migration proofs. Rebase/regenerate/reverify any newer main before pushing; final base, signed revisions and results are recorded on the [owning issue checkpoint](https://linear.app/resnovas/issue/EVE-39#comment-7f7ed992-bf10-4c34-9161-7afb155f51fc). Pending CI is not passed evidence. |
| Broader EVE-39 acceptance | Upcoming / open | No durable SQL/crash or real financial proof is supplied by this regression. Host, execution, invocation, testing and contracts are unchanged. No dependency, secret or production change is authorized. |

```mermaid
flowchart LR
    A["Approved A1/A2 exact binding"] --> R["EVE-39: public red regression"]
    R --> P["Preparation isolates typed observer inputs"]
    P --> V["Host, storage, type and full compatibility gates"]
    V --> B["Broader EVE-39 acceptance remains open"]
    click R "https://linear.app/resnovas/issue/EVE-39"
    click B "https://linear.app/resnovas/issue/EVE-39"
```

## Independent migration recovery checkpoint - 2026-11-17

Jonathan's later direction, relayed in the [slice 1 assignment](https://ampcode.com/threads/T-a0a1608d-284c-46c6-8bd0-372ce1a02efb), ends the coordinator delivery gate. Each lane respects actual source reservations, rebases onto current main, regenerates affected shared outputs, verifies and pushes its own signed work. Older coordinated-window statements below are historical, not current ownership constraints. This does not authorize production or change G01-G15 acceptance.

| Stage | State | Evidence / next boundary |
| --- | --- | --- |
| EVE-258/EVE-42 migration process loss | Implemented; both-dialect focused proof passed | Separate uncached `migration-proof` target now feeds storage `test`; exact v1 rollback, v2/v3 acknowledgement-loss recovery, empty repeats, changed-prefix and stale-writer rejection with a current-writer control. [EVE-258 checkpoint](https://linear.app/resnovas/issue/EVE-258/add-the-database-neutral-resources-api-and-privileged-tenant-migration#comment-79bf922f) and [EVE-42 checkpoint](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-b23c70d9). |
| False-positive control | Executed; target rejected broken transaction | Temporarily bypassing the fixture's transaction delegation exposed provisional v2/v3 to the independent connection; `migration-proof` failed with `ERR_ASSERTION`. The control was removed before final verification. |
| Independent delivery | Current | Full aggregate checks, strict reviewed planning and exact signed delivery are recorded on the owning issues; no pending CI is counted as passed. The default transaction proof and held parent spec remain intact. |
| Remaining G04/platform work | Upcoming, not closed | Distributed migration/lease fencing, power-loss/native durability, production least privilege and broader EVE-258/EVE-42/EVE-261 acceptance remain separate. No dependency, secret or production change. |

## Completed foundation and decisions

| Step                                                                              | Observed state                                              | Meaning                                                                                                                                   |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [EVE-243](https://linear.app/resnovas/issue/EVE-243) house enrollment             | Done                                                        | Current governance/tooling baseline; external administration limitations remain in [enrollment](../smartcloud-enrollment.md).             |
| [EVE-244](https://linear.app/resnovas/issue/EVE-244) fresh workspace              | Done                                                        | Accepted foundation, not product capabilities.                                                                                            |
| [EVE-23](https://linear.app/resnovas/issue/EVE-23) contracts/schema/runtime split | Done                                                        | Existing package boundaries are the baseline, not work to repeat.                                                                         |
| [EVE-17](https://linear.app/resnovas/issue/EVE-17) offline engine selection       | Done                                                        | Selected record/document direction; native-iOS follow-up remains open.                                                                    |
| [EVE-45](https://linear.app/resnovas/issue/EVE-45) producer semantics             | Three defaults approved 2026-11-17; issue still In Progress | Fresh durable incarnation; ambiguous callback reconciliation; committed-transition provenance. Approval is not journal/kernel completion. |

## Current work and prerequisites

| Lane / issue                                                                                                                                                                              | Linear state at snapshot                                           | Current acceptance boundary                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [EVE-13](https://linear.app/resnovas/issue/EVE-13) platform direction                                                                                                                     | In Progress                                                        | Parent acceptance remains open; architecture decisions do not prove every implementation.                                                                                                                                                                                                                                 |
| [EVE-257](https://linear.app/resnovas/issue/EVE-257) kernel                                                                                                                               | In Progress                                                        | Controlled transitions, exact providers, scoped cleanup and serving generations; distributed recovery is a separate gate.                                                                                                                                                                                                 |
| [EVE-258](https://linear.app/resnovas/issue/EVE-258) Resources                                                                                                                            | In Progress                                                        | Privileged tenant-bound migrations, unchanged features/provider composition, immutable revision/history and SQL boundaries.                                                                                                                                                                                               |
| [EVE-41](https://linear.app/resnovas/issue/EVE-41), [EVE-43](https://linear.app/resnovas/issue/EVE-43), [EVE-44](https://linear.app/resnovas/issue/EVE-44) config, identity and telemetry | In Progress                                                        | Redaction, authorization/audit and correlated bootstrap/runtime evidence. EVE-43 adoption remains blocked. Exporter contract and documentation checkpoints do not prove production ingestion/security or complete adoption.                                                                                               |
| [EVE-45](https://linear.app/resnovas/issue/EVE-45) durable producers and feed | In Progress | Delivered journal and actual kernel mutation-owner/cascade/disposal wiring retain authoritative committed facts. Slice 2 adds restart/redrive release-policy evidence; full governed-consumer and distributed/production acceptance remain open. |
| [EVE-262](https://linear.app/resnovas/issue/EVE-262) governed dispatch | In Progress, independently read 2026-11-17 | Slice 2 proves current synthetic release policy after claim/revocation/restart and authorized redrive. EVE-45 owns durable producers/feed; broad governed-consumer acceptance remains open. |
| [EVE-35](https://linear.app/resnovas/issue/EVE-35) busy controls | Backlog, independently read 2026-11-17 | Slice 3 measures persisted Interrupt submission below 1,000 ms on healthy SQL runners. Full conversation/input/approval orchestration and EVE-54 interrupt-to-failed lifecycle remain open; acknowledgement is not immediate cancellation. |
| [EVE-259](https://linear.app/resnovas/issue/EVE-259), [EVE-50](https://linear.app/resnovas/issue/EVE-50) declarative UI/screen context                                                    | In Progress                                                        | Data-only schema plus action/projection parity; native/UI end-to-end acceptance is not proven here.                                                                                                                                                                                                                       |
| [EVE-263](https://linear.app/resnovas/issue/EVE-263) exact types/acyclic graphs                                                                                                           | Backlog, binding quality gate                                      | Review actual source/declarations/export graphs and runtime admission; do not treat old isolated audit counts as current clearance.                                                                                                                                                                                       |
| [EVE-261](https://linear.app/resnovas/issue/EVE-261) integration | In Progress | Each lane independently rebases, regenerates affected shared outputs, verifies and ships its work under Jonathan's later direction. Exact overlapping source reservations still apply; all G01-G15 evidence remains explicit. |
| Documentation governance (under EVE-13/261)                                                                                                                                               | Implementation/review in progress, not a new approved Linear issue | This checkpoint publishes only the human timeline and decisions. The complete source mirror is frozen pending a verified canonical commit-hook correction for exact generated paths. The approved documentation-debt ratchet remains a separate reviewed delivery; no checker activation or global compliance is claimed. |

## Upcoming sequence

1. Respect exact active source reservations while each lane develops and ships independently. Clear applicable EVE-263 type/boundary findings without widening contracts or weakening checks; there is no central delivery gate.
2. Retain the delivered EVE-45 producer journal and actual kernel mutation-owner/cascade/disposal integration documented below. Its presence is not complete governed-consumer or production acceptance.
3. Extend durable governed-consumer evidence with bounded process-loss/revocation/replay slices. Preserve callback idempotency and authoritative provenance; snapshots and successful method returns cannot establish committed transitions.
4. Combine kernel/resources/config/identity/telemetry with durable governed hooks; prove pinned workflows, cleanup, readiness and protected-release boundaries on the actual composed system.
5. Complete declarative UI/action/screen parity and [EVE-260](https://linear.app/resnovas/issue/EVE-260) (Backlog) exact archived word-art reference only after verified ready and telemetry. No invented banner or physical exactly-once claim.
6. Complete target-specific [EVE-16](https://linear.app/resnovas/issue/EVE-16) federation/OTA and [EVE-252](https://linear.app/resnovas/issue/EVE-252) multi-runner recovery evidence (both In Progress), and [EVE-240](https://linear.app/resnovas/issue/EVE-240) native-iOS follow-up (Backlog). Independent portable work need not wait for every broad issue; full platform acceptance does.
7. Reconcile each lane's evidence on Linear and Markdown, rebase onto latest origin/main, regenerate affected shared outputs, run full gates and push signed commits directly to main. Rebase/regenerate/reverify a raced push. Keep EVE-45/EVE-261 open until full acceptance; no deployment or production readiness is authorized.

## Producer and exporter checkpoint - 2026-11-17

The source includes the [producer journal](../../packages/integrations/sql/src/hook-producer.ts) and [governed diagnostic export](../telemetry-export.md). Producer implementation commit `489819054e61d27ecc018b676de6814e54947196` and exporter implementation commit `5c241cbe68dbe743b3474f4c24e46f783365f135` are rebased onto the delivered EVE-264 archive head `980cac6f682336e97da5d72dea72650570dab6c7`. The 480 archive renames preserve source bytes and the private-tests gitlink; this checkpoint does not rewrite the archive.

The journal commits unresolved intent before granting first callback execution. Duplicate admission never permits replay; a restarted incarnation cannot directly confirm its predecessor. Authoritative reconciliation and confirmation publish only the original immutable fact, atomically through the existing feed. Missing/foreign attempts fail with policy denial rather than exposing another tenant/runtime's existence. Additive migration 0008 is tested on both dialects, not run against production.

The exporter rechecks a default-off flag and live tenant/purpose/module-generation grant for every delivery and flush. It drops input text/attributes and denies Restricted/Vault and nonordinary operations. Its replaceable SDK adapter uses immediate diagnostic events with no retry/backlog, handles swallowed HTTP errors and retains cancellation ownership through delayed preparation. Existing local logging and host composition are unchanged. No new dependency version, external ingestion or production activation is included.

Executed on the combined implementation before the archive-only base rebase:

- `bash .amp/in/orb-backup/run-storage.sh node --run verify`: exit 0; all 85 Nx lint/typecheck/test/build/parity tasks (16 cache hits), then smoke for three projects plus 12 dependency tasks. The disposable approved PostgreSQL fixture was removed. Android export is not device execution.
- `bash .amp/in/orb-backup/run-storage.sh pnpm exec vitest run --config tests/storage/vitest.config.mts tests/storage/src/hook-producer.spec.ts tests/storage/src/hook-process.spec.ts --coverage.enabled=false`: two files, 20 tests passed. Separate SIGKILL/reopen processes prove both-dialect journal recovery without source callback replay, alongside rollback, authority/tenant isolation and stale-resolution races.
- `pnpm exec vitest run --config tests/telemetry/vitest.config.mts`: 37 tests passed; 98.28% lines and 95.1% branches. `pnpm exec vitest run --config tests/integrations/posthog-server/vitest.config.mts`: 11 passed; 96.72% lines and 92.85% branches. Transport is fixture-intercepted; these are not production delivery receipts.
- `pnpm nx sync:check`: all files up to date. Source graph: 166 files/578 edges/28 packages, zero violations or cycles. Emitted graph: 67 files/256 edges, zero violations or cycles. Final post-rebase checks and exact-head CI are recorded on EVE-45/EVE-261; pending CI is not counted as passed.

Independent documentation review confirmed all 62 new production callable attachments; the test/example pass documented 139 callable nodes with unchanged comment-free AST/tokens. Semantic rationale remains reviewed, not inferred from a heuristic count. The exact debt ratchet and full Linear mirror are held separately; no broad suppression or source-prose rewriting is used to pass a gate.

Next, connect actual lifecycle mutation owners, dependent cascades and disposal to stable callback keys and authoritative provenance. Public-method success or snapshot differences cannot establish these transitions. EVE-45/EVE-261 remain In Progress, EVE-260 remains gated by verified readiness, and EVE-43 component adoption remains blocked. No new product decision is required for this bounded prerequisite; full native/UI/security/distributed/production acceptance is unproved.

## Kernel mutation-owner and OTLP checkpoint - 2026-11-17

The next dependency-ordered increment connects the existing journal to the actual
kernel mutation owners, not method-return wrappers or snapshot differences.
EVE-243/244 remain Done; live EVE-45/261 remain In Progress. EVE-260 is Backlog
with six open implementation prerequisites and is not the next unblocked slice.

| Stage | State in this increment | Evidence and remaining boundary |
| --- | --- | --- |
| Actual kernel producer, cascades and disposal | Implemented and aggregate-verified | 38 real SQLite/PostgreSQL producer tests passed; persisted intent precedes callbacks, confirmation follows actual publication, mandatory teardown survives denied intent and self-interrupting dependent cleanup without fabricated facts. |
| Kernel lifecycle/telemetry regression | Focused verification executed | 60 tests passed across kernel-runtime and kernel-telemetry; local-only host behavior remains supported. |
| Approved original EVE-21 OTLP scope | Implemented and aggregate-verified, default off | 43 telemetry tests passed; 96.66% lines/94.88% branches. Exact compatible dependencies, redacted endpoint/headers and bounded one-shot HTTP; no ingestion activation. |
| Rationale classifier calibration | Bounded improvement, global enforcement held | 52 fixtures passed, including execution hidden in destructuring and nested/outer security phases. Three reviewed adequate security/ownership bodies remain unresolved heuristic candidates; no broad exception or gate weakening. |
| EVE-22 house boundary reference | Human house merge verified; downstream aggregate-verified | [House PR 47](https://github.com/Resnovas/.github/pull/47) merged at 12:14:25Z. The downstream five-file patch is applied and all 16 workspace rows independently match ESLint; Eventiva delivery and asynchronous CI remain separate evidence. |
| Next implementation | Durable governed consumer integration | Combine actual kernel facts with persisted consumer dedup/drain and live release authority before the EVE-260 reference extension. Full G01-G15, native, protected security and distributed evidence remain open. |

Jonathan's two later owner choices are recorded separately in the
[decision index](decisions.md#later-owner-decisions---2026-11-17), with authenticated
selection times and agent-relay provenance. Mandatory finalization is not
permission to fabricate an event; OTLP dependency approval is not remote release
authorization. Final combined gates and exact delivered commits are recorded on
EVE-45/EVE-21/EVE-261; pending verification is never counted as passed.

Executed on the combined tree above immutable delivered base
`9af03961801dc6e6376da030332d92e11684f178`:
`NX_DAEMON=false NX_SKIP_NX_CACHE=true DOCUMENTATION_BASE=9af03961801dc6e6376da030332d92e11684f178 bash .amp/in/orb-backup/run-storage.sh node --run verify`
exited zero. Root checks passed, including 89 documentation fixtures; all 85 Nx
lint/typecheck/test/build/parity tasks passed without cache, followed by all three
smoke targets and 12 dependencies without cache. Source boundaries cover 169 files,
596 edges and 28 packages; emitted boundaries cover 68 files and 259 edges. Both
report zero violations/cycles. The approved disposable PostgreSQL fixture/network
were removed. Web/Android export is not native-device execution or production release.

The existing Effect compiler patch was restored after an installation omitted it;
the original diagnostic regression and the complete runtime suite then passed.
Temporary source backups were renamed as text after the licence guard correctly
rejected their copied file headers. No gate, test or threshold was weakened.
`NX_DAEMON=false pnpm nx sync:check`, scoped formatting and whitespace checks pass.
Planning remains 258 captured issues/692 edges with three explicit unresolved
decision sources and zero stale outputs, not exhaustive live semantic clearance.
Signed delivery revisions, clean-source Graphify and pending exact-head CI are
recorded on the owning issues; none of these local results approves ingestion,
production migrations, security-component adoption or full EVE-261 acceptance.

### House boundary reference delivery

Human TGTGamer merged [house PR47](https://github.com/Resnovas/.github/pull/47)
at 2026-11-17T12:14:25Z as
[983ce559](https://github.com/Resnovas/.github/commit/983ce5595b75f1d485446b320fdc85b322c80dd4).
GitHub merge state and the owning EVE-22 discussion were independently read.
The held downstream patch is now integrated: both architecture reference copies
and their changelogs, plus the house-standards summary, describe the same 16
intersecting boundary rows as Eventiva's ESLint. No boundary rule changed.
EVE-22 remains In Progress pending Eventiva delivery evidence; a house merge
does not claim that asynchronous aggregate CI finished or approve production.

### Parallel EVE-34 checkpoint allocation

The [2026-11-17 EVE-34 packet](https://linear.app/resnovas/issue/EVE-34#comment-01bffbbf-3f7b-433e-9397-e964b555037c)
was read in full after publication. It is explicitly agent-authored analysis,
not owner acceptance. Coordination reserved a bounded source-only implementation
of the server-local run/step checkpoint as part of EVE-54, reusing the existing
Cluster Workflow engine and authorized action path. Both live issues remain
Backlog; reservation does not rewrite that captured or live state.

Require raw executor counts across acknowledged steps 2/3 and automatic takeover,
not only business dedup after an interrupted Activity. Stable tenant/run/step keys
and live access checks are part of the checkpoint. EVE-35/36 consume the same run
model later; EVE-54 keeps full lifecycle/control and persisted module/provider/schema
pinning/fencing, and EVE-47 still needs the real EVE-52 agent loop. No production
module-bound run or complete agent acceptance is authorized by this allocation.
Root/planning/LLMS/Graphify delivery remains coordinated after the current increment.

## Unsettled marketplace revocation checkpoint - 2026-11-17

[EVE-250](https://linear.app/resnovas/issue/EVE-250) remains In Progress.
The [slice 3 contract](https://ampcode.com/artifacts/eventiva-next-parallel-slices-current-main-readiness-f4c31b8c-2405-4743-ad32-bedc11c633a5)
and [execution thread](https://ampcode.com/threads/T-01a1e9e1-b366-759e-b622-c4881886c1ee)
scope this increment to the existing SQL metadata APIs and reserved process fixture.
It does not select concrete marketplace policy, crypto, providers or custody.

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Existing six-worker crash/replay proof | Preserved | Original assertions and stdout contract remain; post-settlement revocation alone was not unsettled-work recovery proof. |
| Pending and running revocation | Focused execution passed | SQLite and approved disposable PostgreSQL default invocations pass pending claim denial, expired-running reclaim denial and live-lease settlement denial. Distinct workers revoke and reopen; exact rows retain one blocked audit per transition and no revoked settlement. |
| Negative and positive controls | Focused execution passed | A scratch loader that ignores revocation only for the added namespaces fails at the pending denied-claim assertion; the unmodified adapter passes. An unrelated authorized namespace records settlement without changing prior evidence. |
| Combined verification and delivery | Verification passed | Rebased onto origin/main 970e4485; full `node --run verify` passes the root gate, all 85 aggregate targets, source/declaration boundaries and all three smoke targets. Strict reviewed planning passes with zero unresolved sources/stale outputs. Planning/LLMS/Graphify are regenerated for independent direct-main signed delivery; exact revisions and results are posted on EVE-250. No coordinator or shared-output window is required. |
| Remaining marketplace acceptance | Upcoming / separately gated | Real saga destinations, identity/crypto/custody composition, policy parameters, payments, protected release and production remain unproved or unauthorized. This metadata process-loss proof closes none of those broad gates. |

The earlier coordinator/window-only wording in historical checkpoints is not the
current delivery gate. The later explicit independent-delivery instruction governs
this slice; actual other-lane source reservations remain in force. No other slice's
fixture or storage project wiring is changed. The complete issue mirror remains a
dated historical capture, not a fresh all-issue acquisition.

## Dependency roadmap

Solid arrows indicate implementation prerequisites from the modular specification/current EVE-45 plan, not new Linear blocking relations. Dotted arrows indicate broader target evidence required for complete integration. The text above is the accessible equivalent of this graph. Every issue node links to Linear.

```mermaid
flowchart TD
    F["EVE-244 + EVE-23: completed foundation"] --> K["EVE-257: kernel"]
    F --> R["EVE-258: Resources"]
    F --> RI["EVE-258/23: registered declaration isolation"]
    RI -.-> I["EVE-261: full acceptance remains open"]
    R --> REC["EVE-258/42: local migration process-loss evidence"]
    REC -.-> I["EVE-261: full acceptance remains open"]
    F --> C["EVE-41/43/44: config, identity, telemetry"]
    K --> J["EVE-45: explicit producer journal prerequisite"]
    R --> J
    J --> P["EVE-45: actual mutation/cascade/disposal producers"]
    C --> P
    P --> H["EVE-262: durable governed delivery integration"]
    H --> HR["EVE-262/45 slice 2: restart/redrive release proof"]
    K --> U["EVE-259 + EVE-50: UI and screen parity"]
    H --> B["EVE-260: verified ready / exact banner"]
    U --> B
    C --> B
    B --> I["EVE-261: full acceptance remains open"]
    T["EVE-263: exact types and acyclic boundaries"] --> I
    HR -.-> I
    N["EVE-16 / EVE-240: target and device evidence"] -.-> I
    D["EVE-252: distributed recovery evidence"] -.-> I
    M["EVE-250: existing metadata grants/outbox"] --> MR["EVE-250: unsettled revocation process-loss proof"]
    MR --> MA["EVE-250: remaining saga/security/policy acceptance"]
    MA -.-> I
    AR["EVE-34: scripted durable runs present"] --> BC["EVE-35 slice 3: measured busy-control submission"]
    BC --> AL["EVE-35/54: session and cancellation lifecycle acceptance"]
    AL -.-> I
    DOC_A["D01 complete; D02 attachments complete"] --> DOC_B["D03: adapter packets current; SQL next"]
    DOC_B --> DOC_C["D04-D06: remaining documentation"]
    HOUSE_DOC["House PR48 accepted; 13 tool copies synced"] --> DOC_C
    DOC_C --> DOC_D["D07: strict zero held on remaining debt and safe calibration"]
    DOC_D -.-> I
    click F "https://linear.app/resnovas/issue/EVE-244"
    click K "https://linear.app/resnovas/issue/EVE-257"
    click R "https://linear.app/resnovas/issue/EVE-258"
    click RI "https://linear.app/resnovas/issue/EVE-258"
    click REC "https://linear.app/resnovas/issue/EVE-258"
    click C "https://linear.app/resnovas/issue/EVE-44"
    click J "https://linear.app/resnovas/issue/EVE-45"
    click P "https://linear.app/resnovas/issue/EVE-45"
    click H "https://linear.app/resnovas/issue/EVE-262"
    click HR "https://linear.app/resnovas/issue/EVE-262"
    click U "https://linear.app/resnovas/issue/EVE-259"
    click B "https://linear.app/resnovas/issue/EVE-260"
    click I "https://linear.app/resnovas/issue/EVE-261"
    click T "https://linear.app/resnovas/issue/EVE-263"
    click N "https://linear.app/resnovas/issue/EVE-16"
    click D "https://linear.app/resnovas/issue/EVE-252"
    click M "https://linear.app/resnovas/issue/EVE-250"
    click MR "https://linear.app/resnovas/issue/EVE-250"
    click MA "https://linear.app/resnovas/issue/EVE-250"
    click AR "https://linear.app/resnovas/issue/EVE-34"
    click BC "https://linear.app/resnovas/issue/EVE-35"
    click AL "https://linear.app/resnovas/issue/EVE-54"
```

## Acceptance ledger

The authoritative detailed matrix remains [specification G01-G15](../architecture/modular-platform.md#14-hard-readiness-gates-and-acceptance-evidence-ledger) and the live [EVE-261](https://linear.app/resnovas/issue/EVE-261) packet. This lane has not executed platform acceptance and marks none of those rows passed. Each completed checkpoint must name commit, command/output, runtime/provider, negative control and remaining limits. In particular, native/UI, production security/ingestion and full platform integration are **not proven** by this governance change.

## House tooling JSDoc sync - 2026-11-17

| Step | State | Evidence and limits |
| --- | --- | --- |
| Canonical house JSDoc | Human accepted | Jonathan merged [house PR48](https://github.com/Resnovas/.github/pull/48) at 14:35:04Z as [30c7ff08](https://github.com/Resnovas/.github/commit/30c7ff08dd05dc492feb26fc42da9f2e8903bbda). House CI and smartcloud passed on the tested PR head. |
| Thirteen Eventiva tooling copies | Source verified | Rendered from accepted templates against immutable pre-packet main `416ef0aa7a4035b35f77bdf3eb4e1430b22b00f2`; copies match canonical bytes, ASTs preserve behavior, no parse errors or scoped blocking JSDoc findings. |
| Exact ledger prune and semantic review | Completed | Only 87 identities removed: 72 attachments and 15 rationale candidates. Five adequate scoped candidates and all unrelated debt remain. After two intervening batches, regenerate from `970e44851983a15ef8f2130c930ffafc15b0c129` and its published trusted-fingerprint reconciliation: 338 to 251. Zero missing contracts and 330 live rationale review candidates, not strict zero. No authored checker, suppression or acceptance-policy change. |
| Eventiva local verification | Completed | Full `node --run verify` passed against the original base, `b5837844e68a28e5031f76d60006b1d4728f20ba`, `970e44851983a15ef8f2130c930ffafc15b0c129`, and final combined base `ded8c72a5958e7ccc26d8f08d3002cebb413c561`, using the approved disposable PostgreSQL fixture. Final run: 98 documentation fixtures, 95 resource/type-boundary fixtures, all 85 aggregate Nx tasks (63 cached), and three-project smoke plus 12 dependencies (12 cached) passed. Source/emitted boundaries have zero violations/cycles. Root `check` and the trusted-base ratchet also passed; each fixture/network was removed. |
| Eventiva direct-main delivery | This verified increment | Authorized after the human house merge. Exact pushed head and asynchronous CI status are recorded on [EVE-22](https://linear.app/resnovas/issue/EVE-22), [EVE-13](https://linear.app/resnovas/issue/EVE-13) and [EVE-261](https://linear.app/resnovas/issue/EVE-261); local verification is not remote CI success. |
| Remaining D03-D07 and product acceptance | Upcoming / held | This is partial D06 remediation. It does not complete EVE-22, strict global documentation, runtime integration, production release or any native/device gate. |

Semantic scope and the retained-candidate rationale are in the
[documentation standard](../documentation-standard.md#canonical-house-tooling-checkpoint---2026-11-17).
Canonical Markdown remains the source; no AsciiDoc pointers or historical
example edits are introduced. The directing owner ended the coordinator gate
for this packet and authorized this lane to verify and ship only the accepted
copies after the human house merge.

## Anchor-confirmation planning resolution - 2026-11-17

After the delivered D02 head
`8a1440bbbbc04e8f5bed2e7d253683600a713d00` returned the shared window, the
coordinator mirrored Jonathan's EVE-84 decision from the
[12:31:56.867Z Amp relay](https://linear.app/resnovas/issue/EVE-84#comment-f9c96ce3-873a-46ba-9702-bf00bcebc44d).
The source covers general Event planning, so option B applies: any Event/Phase
anchor-date change requires confirmation, including dependency-delay cascades;
non-anchor dates may cascade automatically. The exact owner-selection time is
unknown. This completes the scope decision, not the Backlog implementation or its
dependency gates. The [decision index](decisions.md#tasks-anchor-confirmation)
records the narrowed supersession of earlier automatic-delay direction.

At that checkpoint two unavailable owner-infrastructure references still blocked
strict source review. The bounded reconciliation below supersedes that source
blocker only. Next implement EVE-84 only after its recorded prerequisites and
applicable authorization/confirmation tests are met.

## Marketplace source reconciliation - 2026-11-17

Jonathan's [Puck instruction](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a)
designates the existing [architecture index](../architecture/eventiva-platform-and-marketplace.md)
as the current repository replacement/index for the unavailable historical
`Eventiva-marketplace-infrastructure-v1.md`. The exact instruction time is unknown.
Current EVE-250/251 descriptions and their authorized mirrors now point directly
there and explicitly supersede historical missing-source/archive statements for
current source status. All 30 existing issue comments are unchanged; the original
file is still unavailable and unread, not recovered. Only these two issues were
refreshed, at 13:22:30.954Z and 13:22:32.697Z respectively; the original complete
enumeration timestamp and all other captured issues remain unchanged.

This resolves the two missing-file source-review blockers, not implementation or
acceptance. EVE-250/251 remain In Progress. The 2026-11-16 binding architecture and
provider-neutral authorization govern; concrete crypto/provider/verifier/custody,
canonicalization/timing, regional/legal/retention, freshness/recovery/reconciliation
and moderation gates remain where not independently approved. EVE-261, production
security/ingestion, native/device proof and unrelated blockers are not cleared.

## Documentation adapter and CI diagnostics checkpoint - 2026-11-17

This bounded increment compares against the coordinator's delivered
`1674f6fec4c3cf061794975dde61d6959a4afe75`, not its unrelated local EVE-34
packet. Tracking remains [EVE-13](https://linear.app/resnovas/issue/EVE-13) and
[EVE-261](https://linear.app/resnovas/issue/EVE-261); see the exact semantic and
execution evidence in [the documentation backlog](documentation-backlog.md#d03-first-adapters-and-bounded-ci-diagnostics---2026-11-17).

| Step | Status | Evidence / remaining boundary |
| --- | --- | --- |
| D01 source and D02 runtime attachments | Completed delivery, not strict global zero | D02 delivered at `8a1440bbbbc04e8f5bed2e7d253683600a713d00`; its verify/smoke/application CI passed. Nine adequate retained runtime rationale candidates remain. |
| First four D03 adapters | Source and focused verification complete | 33 attachment fixes and one rationale improvement, exact parsed executable tokens, zero scoped scanner findings, 26 uncached Nx tasks passed. |
| Bounded subprocess diagnostics | Reviewed source; combined delivery current | Coordinator approved the exact patch after independent reading; seven assertions and the 10-second bound remain. Real timeout negative control produced bounded redacted context, not a root-cause finding. |
| Exact prune and full verification | Completed local gate; delivery current | Uncached verify passed all 85 Nx tasks, 89 documentation fixtures, 95 boundary/type fixtures and all three smoke targets plus 12 dependencies. Retained debt is 3,117 (2,420 attachments and 697 rationale); five removed test rationale identities are replacements, not semantic fixes. |
| Remaining D03-D06, then D07 | Upcoming | Reserve remaining sources, review semantically and deliver verified packets. Strict zero cannot be activated while adequate candidates lack a safe general classifier refinement. |

The first D02 head failed both the original CI attempt and its one authorized
same-head rerun in different children. The coordinator also observed recurrence
on the pre-diagnostics planning head. Child signal/output were absent in those
logs; passing local probes and final-D02 CI do not establish why they timed out.
The diagnostics add evidence for future failures without retries, timeout
inflation, assertion weakening or runtime changes. Existing platform dependency
edges and production/native/UI acceptance gates remain unchanged.

## Second D03 adapter checkpoint - 2026-11-17

The coordinator returned the shared window at confirmed remote main
`17631eaf5712d422376e5d3d2f0bbfd939773959`. Its EVE-250/251 source
reconciliation is inherited, not reimplemented here; the unrelated EVE-34 packet
is not imported. Tracking remains EVE-13/EVE-261. The
[per-file backlog evidence](documentation-backlog.md#second-d03-flag-and-local-logger-checkpoint---2026-11-17)
records the review and exact immutable-base accounting.

| Step | Status | Evidence / remaining boundary |
| --- | --- | --- |
| First D03 packet and approved diagnostics | Delivered | Signed source `cad66393` and clean graph `285fc569`; passing local verification did not prevent a later CI timeout. |
| PostHog flag adapters and local logger | Source and focused verification complete | Exact executable tokens, zero scoped findings, 52 attachments and three rationale improvements; all 22 affected uncached Nx tasks passed. |
| Exact prune and combined verification | Completed local gate; signed delivery current | 3,062 retained identities: 2,368 attachments and 694 rationale. Uncached immutable-base verify passed all 85 Nx tasks, 89 documentation fixtures, 95 boundary/type fixtures and three smoke targets plus 12 dependencies; exact-head CI is separate. |
| Remaining SQL adapters and D04-D06 | Upcoming | Five SQL sources reserved for documentation only; no production migrations, provider changes or dependencies are authorized. |
| D07 strict zero | Held | Adequate retained rationale candidates still need a safe general classifier refinement; neither token equality nor the ratchet proves repository-wide compliance. |

The first-D03 exact-head CI failed the contracts-suite opt-out invalid-profile
child with `ETIMEDOUT`/`SIGTERM` after recording `bootstrap.failure`; its stdout
summary had 142 characters and stderr was empty. Root cause and shutdown timing
remain unproven. No timeout increase, retry, assertion change or runtime fix is
part of this documentation packet. Puck assigned further root-cause work to a
separate reserved lane; this lane stopped that investigation and supplied its
evidence. Existing platform and production acceptance gates remain unchanged.

## D03-D07 independent documentation delivery - 2026-11-17

Jonathan/Puck ended central shared-output windows. Documentation batches now deliver directly after immutable-base verification; canonical house-template ownership and production-authorization limits remain unchanged. Read the exact [source checkpoint and inventory](documentation-backlog.md#d03-d06-identity-independent-source-checkpoint---2026-11-17), tracked on [EVE-13](https://linear.app/resnovas/issue/EVE-13) and [EVE-261](https://linear.app/resnovas/issue/EVE-261).

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Identity-independent Eventiva sources | Delivered | Signed [source](https://github.com/Resnovas/Eventiva/commit/44078885a4136e5403415e506e9c207369d28d87) and [clean-source graph/head](https://github.com/Resnovas/Eventiva/commit/b5837844e68a28e5031f76d60006b1d4728f20ba). Documentation resolves 976 attachments and 207 live rationale candidates; exact debt shrinks by 1,155. Uncached full serial gates passed at both immutable bases; exact-head CI remains separate. |
| Nineteen retained-ID source files | Full serial verification passed; signed delivery current | Documentation resolves 1,308 attachments and 248 rationale candidates. Trusted-byte parser reconciliation normalizes 395 accepted IDs without changing count or admitting debt; separate pruning takes 1,894 to 338. All 98 documentation fixtures, 95 boundary/type fixtures, aggregate targets and smoke passed uncached against immutable b5837844. |
| Canonical synced tools | Delivered independently | Human-merged house PR 48 supplies the normal 13-file render at Eventiva head `c39cfb4f`. Its separate 72 attachment and 15 rationale removals take 338 to 251; all 20 scoped candidates reviewed, five adequate candidates retained. |
| Runtime and adapter rationale | Combined full serial verification passed; signed delivery current | Twenty sources receive 36 meaningful comments with all 41,353 parsed terminals unchanged. Exact prune removes 21 accepted identities, 246 to 225, without new debt; the independent trust input-isolation implementation pruned five other identities. Independent canonical sync and marketplace/resource/trust delivery through 6016e99d are preserved. All 98 documentation fixtures, 95 boundary/type fixtures, 85 aggregate Nx targets and smoke pass uncached against that immutable head; exact-head CI is separate. All five EVE-60 path holds are released. |
| Bounded test-scaffolding correction | Combined full verification passed; signed delivery current | Semantic review confirms 28 registration-only suites and four type-assertion bodies have no separate implementation phase, including the new EVE-60 registration suite. Lexical import identity and conservative escape rejection clear exactly 32 false positives without changing TypeScript source; 24 accepted identities prune 225 to 201. Combined uncached verification through EVE-60 head d8b529c4 passes 102 documentation fixtures, 116 boundary/type fixtures, aggregate Nx targets and smoke. Final root/clean graph checks and exact-head CI are separate. |
| Application and boundary test rationale | Latest combined full verification passed; signed delivery current | All nineteen scoped candidates reviewed; fourteen comments resolve eleven live findings. After preserving independent EVE-35/EVE-39 changes through 355b1182, all 13,953 parsed terminals remain unchanged. Eight adequately contracted short bodies stay visible, not suppressed. Exact accepted debt prunes 192 to 188; checker corrections are zero. Latest full repeat passes 102 documentation fixtures, 116 boundary/type fixtures, 86 aggregate tasks (65 cached) and 15 smoke/dependency tasks (12 cached). The prior local EADDRINUSE startup failure remains recorded separately. |
| Contract/provider/resource/schema test rationale | Combined full verification passed; signed delivery current | All 49 candidates in thirteen files reviewed; thirteen comments across eight sources resolve twelve accepted and one never-ledgered finding. All 24,756 parsed terminals are unchanged. Thirty-six adequate bodies remain visibly reviewed, not suppressed. Exact accepted debt prunes 188 to 176; checker corrections are zero. Full immutable-base gate passes 102 documentation fixtures, 116 boundary/type fixtures, 86 aggregate tasks (50 cached) and 15 smoke/dependency tasks (12 cached). |
| Hook/trust runtime test rationale | Combined full verification passed; signed delivery current | All 26 candidates in four files reviewed; eight comments in two sources resolve three accepted and four never-ledgered findings. All 12,349 parsed terminals remain unchanged. Nineteen adequate bodies stay visibly reviewed. Exact debt prunes 176 to 173; checker corrections are zero. Full immutable-base gate passes 102 documentation fixtures, 116 boundary/type fixtures, 86 aggregate tasks (60 cached) and 15 smoke/dependency tasks (12 cached). |
| Execution test rationale | Combined full verification passed; signed delivery current | All thirty candidates reviewed; eight comments resolve five accepted and three never-ledgered findings. All 10,409 parsed terminals remain unchanged. Twenty-two adequate bodies stay visibly reviewed. Exact debt prunes 173 to 168; checker corrections are zero. Full immutable-base gate passes 102 documentation fixtures, 116 boundary/type fixtures, 86 aggregate tasks (60 cached) and 15 smoke/dependency tasks (12 cached). The active host implementation hold keeps host.spec.ts outside this packet. |
| Execution latest-main integration | Combined full verification passed | Preserves independent UI head b5f68920 and its six new review-only candidates. Repeated proof preserves all 10,409 terminals and the same eight documentation resolutions; full gate passes 102 documentation fixtures, 116 boundary/type fixtures, 86 aggregate tasks (58 cached) and 15 smoke/dependency tasks (12 cached). Seventh-checkpoint remote CI passed; eighth-head CI remains separate. |
| Cleared storage/telemetry/UI review | Full serial verification passed; signed delivery current | All 146 candidates across twenty files reviewed; seven comments resolve one accepted and six never-ledgered findings. Three JSDoc clarifications bound synthetic-work evidence. All 17,482 parsed terminals stay unchanged; 139 adequate candidates remain visible. Exact debt prunes 168 to 167, with zero checker corrections. Full gate passes 102 documentation fixtures, 116 boundary/type fixtures, 86 aggregate tasks (47 cached) and 15 smoke/dependency tasks (12 cached), with zero boundary violations/cycles. Held implementation paths remain untouched. |
| Native-shutdown latest-main integration | Repeated full verification passed | Independent delivered head c7a27fdb is preserved with no documentation credit. Exact terminals and seven documentation resolutions are unchanged; the new native-pressure candidate is retained. All five now-unheld bootstrap-test candidates are semantically reviewed and adequate, with per-line reasons in the backlog. Repeated full gate passes 102 documentation fixtures, 116 boundary/type fixtures, 86 aggregate tasks (55 cached), 15 smoke/dependency tasks (12 cached), zero boundary violations/cycles and PostgreSQL cleanup. |
| Released host/kernel and strict-zero follow-through | Combined full verification passed; signed delivery current | Seven runtime specs receive 96 useful comments, preserving all 56,173 parsed terminals. Documentation clears 63 accepted and 33 never-ledgered candidates; zero checker corrections. After preserving marketplace delivery bbd214c2, exact debt is 102 across 32 files and the live queue 191 including 89 never ledgered. Combined verification passes 102 documentation fixtures, 116 boundary/type fixtures, 86 aggregate tasks (49 cached) and 15 smoke/dependency tasks (12 cached), with no boundary violations/cycles and completed PostgreSQL cleanup. Marketplace is now available for the next semantic batch. House PR49 passes executed CI but requires human attestations/merge and downstream sync. Strict remains upcoming. |
| Telemetry and released marketplace rationale | Combined full verification passed; signed delivery current | After preserving independent export isolation through 29de9634, eight files receive 92 useful rationale additions, preserving all 30,920 parsed terminals. Documentation clears seventeen accepted and 75 never-ledgered candidates; zero checker corrections. Exact debt prunes 102 to 85 across 29 files; complete live queue is 108 including 23 never ledgered. Repeated full combined gate passes 102 documentation fixtures, 116 boundary/type fixtures, 86 aggregate tasks (49 cached), 15 smoke/dependency tasks (12 cached), zero source/emitted boundary violations/cycles and PostgreSQL cleanup. Tenth exact-head CI ee9c58f5 passed all executed checks; this packet's final root/graph checks and exact-head CI remain separate. |
| Complete noncanonical rationale queue | Full verification passed; signed delivery current | Thirty files receive 103 useful rationale comments, preserving all 104,683 parsed executable/type terminals. Documentation clears eighty accepted and 23 never-ledgered candidates; zero checker corrections. Exact debt prunes 85 to five across four canonical tool files; complete live queue is five with zero JSDoc/prose findings or ratchet violations. Full gate passes 102 documentation fixtures, 116 boundary/type fixtures, 86 aggregate tasks (39 cached), 15 smoke/dependency tasks (12 cached), zero boundary violations/cycles and PostgreSQL cleanup. The strict scanner exits one on exactly the five tools, not a suppressed success. No unknown source semantics are established; signed source/clean-graph publication and exact-head CI remain separate. |
| Canonical sync and D07 strict activation | Blocked on human house merge/sync | Both exact accepted debt and the entire live queue must reach zero, then strict rationale CI must be enabled and verified. The only five live findings are canonical release tools. PR49 remains open/unmerged, passing executed CI but requiring Jonathan's human attestations and merge before normal downstream sync. No suppression, new accepted debt or weakened gate is permitted. Historical retained dispositions are not exemptions. |

The bounded-checker head 3bb0bb5a failed remote verification in the invalid-application-config subprocess, with its failure-exit boundary recorded at 1,041ms but termination at the ten-second timeout. Read the [actual CI evidence on EVE-261](https://linear.app/resnovas/issue/EVE-261#comment-1e674ce8): this differs from earlier late-import timing but is not an established cause. The aggregate failure is not a second independent defect. No timeout, retry or assertion changes belong to this documentation increment.

Eighth head b89d05b3 also failed remote verify in two bootstrap children; [EVE-261 evidence](https://linear.app/resnovas/issue/EVE-261#comment-caabbd22) records the observer's original child timeout and the Config-free failure child's 791ms exit-call boundary versus 10,030ms termination. Native-shutdown implementation remains with its active owner. This is not evidence of comment-caused behavior, a successful exit or a passing remote gate.

```mermaid
flowchart LR
    Safe[Identity-independent source verification] --> Ship[Signed direct-main batch]
    Ship --> Identity[Trusted parser identity reconciliation]
    Identity --> Blocked[Nineteen documented source files]
    Blocked --> AppTests[Application and boundary rationale packet]
    AppTests --> ProviderTests[Contract and provider test rationale]
    ProviderTests --> TrustTests[Hook and trust test rationale]
    TrustTests --> ExecutionTests[Execution test rationale]
    ExecutionTests --> ClearedTests[Cleared storage telemetry and UI review]
    ClearedTests --> RuntimeTests[Released runtime authority rationale]
    RuntimeTests --> TelemetryTests[Telemetry and marketplace rationale]
    TelemetryTests --> Review[Noncanonical review complete: five tools remain]
    House[Canonical tooling sync] --> Strict[D07 strict zero and full verification]
    Review --> Strict
```

No passing aggregate, CI success, source-intent waiver or timeout diagnosis is inferred from token equality. Serial PostgreSQL-backed verification preserves every existing deadline, assertion and coverage threshold.

## AgentRun and synthetic correlation integration - 2026-11-17

This bounded increment starts at delivered main
`d771b3664ab260b418983b68ab40fc255fb77163`. EVE-243/244 are already
Done; EVE-260 remains dependency-gated. EVE-34's fixed-definition checkpoint and
EVE-60's local synthetic boundary reuse existing engines/services without new
dependencies, provisioning or production ingress. Both live issues remain
Backlog, not accepted by the existence of a source packet.

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| EVE-34 scripted durable run source | Integrated; central process conformance passed | Existing Workflow engine and short per-run control handle, immutable tenant-routed acceptance, live control/step authority, completed Activity counts across SIGKILL/drain/restart. [Lane evidence](https://linear.app/resnovas/issue/EVE-34#comment-b52be1a7-b8d8-426f-877a-296deb20d658) is distinct from the central rerun. |
| EVE-60 synthetic request boundary | Integrated; six central acceptance groups passed | Default-off flag, complete finite allowlisted pairs, inherited/restored span/log context and existing minimized sink. Not raw-ID admission, SDK/device execution, captured-error events or production export. |
| Durable coverage and aggregate gate | Central verification passed | Both new modules remain in normal server coverage with unchanged 90% thresholds. Added public-contract tests close the initial 77.9% branch gap: AgentRun covers 42/44 branches (95.45%), synthetic correlation 18/18 (100%), aggregate 84/86 (97.67%). Uncached immutable-base verify passed all 85 aggregate Nx tasks, 89 documentation fixtures, 95 boundary/type fixtures and three smoke targets plus 12 dependencies. Signed delivery and exact-head CI remain separate evidence. |
| Downstream work | Upcoming / held where stated | EVE-35/36 build on this run model; EVE-52 turns, EVE-54 module/provider/schema pins and distributed fencing, full lifecycle and real external-effect acceptance remain separate. EVE-60 real correlation implementation awaits its rotation-lifetime decision and separate governed providers; production remains denied. |

Jonathan selected pseudonymous session/user correlation at
13:16:16.737Z and dedicated tenant/destination/purpose-separated rotating key
custody at 13:18:55.545Z. The later Amp relays are [55507185](https://linear.app/resnovas/issue/EVE-60#comment-55507185-3858-42e4-b1f9-e868357b54f7)
and [9cb2d84b](https://linear.app/resnovas/issue/EVE-60#comment-9cb2d84b-90b0-41b8-aeb9-1253346d5f39).
Per-request opt-in, current user consent and protected-profile exclusion remain
mandatory. One-hour UTC epochs, local HMAC-SHA-256 and 256-bit keys are proposals,
not selected lifetime/algorithm or provisioning authority. The source mirror
refresh is bounded to EVE-34/60; all other issue captures remain historical.

### Bootstrap timeout investigation checkpoint

The [timeout lane's EVE-261 checkpoint](https://linear.app/resnovas/issue/EVE-261#comment-2d5107ee-cf1e-4404-8e88-cb1928902019)
reports unchanged `285fc569` stress controls, not a fix: 58/60 six-way single-CPU
launches timed out; 13 emitted the same 142-character failure signature only at
9,827-10,003ms after spawn and returned within 281ms. Their status 1/null signal
differs from CI's null status/SIGTERM. Sixteen instrumented exit controls reached
`process.exit(1)` with no keepalive Timeout; they did not capture the actual CI
failure. Its separate contracts run was 401 passed/10 PostgreSQL connection
failures without a fixture, not a green aggregate. Exact CI cause remains
unknown: the old summary cannot distinguish late startup from a post-log stall.
No force-exit, cleanup, deadline or retry fix is justified by those observations.
The [diagnostic-capture checkpoint](https://linear.app/resnovas/issue/EVE-261#comment-c0e0d66f-9f2c-4009-9164-3695a7413038)
adds bounded launch-relative module, root and scoped-release phases, retaining
the original 10-second timeout and all assertions. Observed/unobserved executable
controls, invalid-journal/redaction controls and an actual synthetic timeout
exercise capture, not the historical cause. The private channel is inert without
subscribers; the test-only fd3 journal cannot become a business prerequisite.
On 2026-11-17 Jonathan ended central delivery windows; this lane now integrates
and delivers its own verified increment. Next: inspect phase evidence from any
actual CI recurrence before selecting a runtime fix. Investigation does not
clear failed CI or EVE-261 acceptance.

Executed on immutable `c3a541b9172c7ce22ecde7cd118df5a1cc10e2df` plus this
increment: `NX_SKIP_NX_CACHE=true NX_DAEMON=false timeout 20m node --run verify`
passed root checks, all 85 aggregate tasks, source/declaration boundaries and
smoke with the approved disposable PostgreSQL fixture. The fixture and its
network were removed. This is local combined evidence, not exact-head CI or a
verified runtime repair.

## Hook release reauthorization slice 2 - 2026-11-17

This independently delivered EVE-262/EVE-45 slice starts at main
`c3a541b9172c7ce22ecde7cd118df5a1cc10e2df`. The
[reservation and execution thread](https://ampcode.com/threads/T-01a1e9e1-a727-7765-932d-bd55c3f03d51)
owns only the hook process fixture and corresponding Markdown sources, plus its
affected shared generated outputs. Jonathan's later independent-delivery direction
supersedes coordinator-window language in historical checkpoints above; no new
product/security/production decision is introduced.

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Default hook-process extension | Completed focused verification | Four existing wrapper tests passed on SQLite and approved disposable loopback PostgreSQL. Revocation after durable claim and before SIGKILL yields a denied terminal delivery after actual lease expiry; a pre-crash claim cannot settle it. |
| Authorized redrive and allowed control | Completed focused verification | A further fresh worker rechecks revoked permission after operator replay: two denied policy checks, zero sink calls. Exact origin/receipt/fact/projection and retained replay history stay unchanged; the independent allowed control has two sink attempts but one durable application. |
| Negative control | Executed and rejected | Temporarily bypassing fixture policy denial made the unchanged SQLite proof fail with actual `delivered`, expected `dead-letter`. The bypass was removed before verification/delivery. |
| Shared outputs and aggregate gates | Passed locally; outputs regenerated | Root check, storage Nx tests, full verify and strict reviewed-source planning check passed. Planning/LLMS and clean-source Graphify are regenerated. Signed delivery revisions and exact-head CI are recorded separately on both owning issues; local results do not establish CI success. |
| Governed consumers and release | Upcoming / unaccepted | EVE-262 and EVE-45 remain In Progress. Production grants/sink, protected payloads, cancellation of an already-running sink, native targets, distributed drain and full platform acceptance remain separate. |

The [people guide](../hooks.md#verify-current-release-permission-after-restart)
and [agent guide](../../ai-docs/src/18_hooks/03_release-recovery.md) specify the
default self-asserting command and retained evidence. Existing JSON/parser,
consumer-cursor cases and 60-second subprocess bound are unchanged; no storage
project wiring or other slice's fixture changed. The complete source mirror
remains historical. A separately dated roadmap annotation records the live
EVE-262 In Progress status read through the connected MCP, not a silent rewrite
of captured Backlog or a full live freshness claim.

Final aggregate execution rebased onto immutable main
`970e44851983a15ef8f2130c930ffafc15b0c129`:
`NX_DAEMON=false bash .amp/in/orb-backup/run-hook-storage.sh node --run verify`
exited zero. Root checks passed, including 98 documentation fixtures; all 85
aggregate Nx tasks passed (49 cache hits), including the storage suite. The
separate uncached storage target passed all 201 tests with 96.32% lines/92.66%
branches before this final documentation-only base increment. All three smoke
targets and 12 dependencies passed (12 cache hits). Source boundaries cover 175
files/627 edges/28 packages; emitted boundaries cover 68 files/259 edges, both
with zero violations/cycles. Strict planning reports 258 issues/692 edges, zero
unresolved decision sources and zero stale outputs. The disposable PostgreSQL
fixture/network were removed; Android export is not native-device execution.

## Independent-process trust replay checkpoint - 2026-11-17

This [EVE-251 slice 4 checkpoint](https://linear.app/resnovas/issue/EVE-251#comment-eaf4d8a6-1612-4ae7-9bde-97244b878250)
advances metadata replay acceptance only. Jonathan ended central delivery gates;
actual source reservations remain. Earlier coordinator-window passages above are
historical checkpoints, not current delivery constraints. The trust lane owns its
fixture and people/agent guides, not the other process fixtures or storage project
wiring. See [the trust guide](../trust.md#prove-independent-process-nonce-consumption)
for commands, exact assertions and limits.

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Existing SQL consume-once and sequential crash proof | Already delivered | Reused unchanged public adapter/port and both migration dialects; not a new trust-policy choice. |
| Two four-process races per dialect | Implemented; standalone proofs passed | Identical and case-equivalent UUIDs retain one exact winner; sanitized losers, four deterministic fresh-process replay refusals and a distinct receipt control. An isolated lowercasing-removal mutation is rejected. |
| Independent aggregate verification and delivery | Current | Final commands/results and signed commits are recorded on EVE-251; no whole-issue completion or remote CI success is inferred from source presence. |
| Concrete trust composition and full acceptance | Upcoming / gated | Four independent real verifiers, crypto/custody/timing/retention decisions and release composition remain separately governed. No production change or key/plaintext release. |

```mermaid
flowchart LR
    SQL["Delivered SQL nonce port"] --> RACE["EVE-251: independent-process races"]
    RACE --> PROOF["One winner / retained audit / deterministic reopen"]
    PROOF --> FULL["EVE-251: full trust acceptance still open"]
    POLICY["Owner-approved concrete policy and providers"] -.-> FULL
    FULL -.-> PLATFORM["EVE-261: integrated acceptance"]
    click RACE "https://linear.app/resnovas/issue/EVE-251"
    click FULL "https://linear.app/resnovas/issue/EVE-251"
    click PLATFORM "https://linear.app/resnovas/issue/EVE-261"
```

## Trust-preflight input isolation, next-batch slice 2 - 2026-11-17

This bounded [EVE-251](https://linear.app/resnovas/issue/EVE-251) increment
implements revision 4 of the next-parallel-slices packet. The
[source and red/green checkpoint](https://linear.app/resnovas/issue/EVE-251#comment-b5a4e484-a21b-4b81-8292-566b8b76ba9d)
is agent implementation evidence, not a new owner policy decision. EVE-251
remains In Progress. Its parallel trust-process proof and broader acceptance
are separate; no coordinator delivery gate is introduced.

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| A5-floor red control | Reproduced on unchanged cd35465d production source | Identity's attempted A5-to-A1 downgrade incorrectly admitted A4 evidence and produced a replay receipt; success still denied release. |
| Admitted-value isolation | Implemented; focused green | Copy/freeze request, scope, keys, policy and freshness records before adapters. All 171 trust tests pass, including separate barrier cases for caller writes during identity suspension and retained adapter references during resource suspension, original-bound gates/replay, freshness denial, sanitized failures and interruption. Observations are asserted outside adapter failure sanitization, permitting original-bound success or safe denial without coupling tests to freezing. |
| Shared outputs and full gates | Passed locally; signed delivery recorded separately | Planning/LLMS and clean-source Graphify regenerated. Root check, full uncached verify and strict reviewed-source planning passed on the rebased source. Exact signed delivery and asynchronous CI are recorded on EVE-251; local success is not remote CI success. |
| Concrete trust composition | Upcoming / separately gated | No crypto, provider, custody, canonicalization, timing, retention, key/plaintext release or production activation selected. A successful metadata preflight always says release denied. |

```mermaid
flowchart LR
    Red[Reproduced policy downgrade] --> Isolate[Admitted immutable metadata]
    Isolate --> Gates[Four original-bound gates]
    Gates --> Replay[Original-bound replay consume]
    Replay --> Denied[Metadata only - release denied]
    Isolate --> Verify[Full checks and independent delivery]
```

The [preflight-to-consume guide](../trust-replay.md#preserve-admitted-preflight-inputs)
owns the boundary details. The new agent note does not replace the trust
specification or claim SQL/process durability. No dependency, secret or
production change is part of this slice. The historical issue capture remains
unchanged; the generated annotation is a separately dated live-status/evidence
checkpoint, not an exhaustive live refresh.

Executed above immutable main `50668875c7ae129d68a3f0773dff67c4c94575bc`:
`node --run check` exited zero with 98 documentation fixtures and zero blocking
documentation findings/violations. `NX_DAEMON=false NX_SKIP_NX_CACHE=true DOCUMENTATION_BASE=50668875c7ae129d68a3f0773dff67c4c94575bc bash .amp/in/orb-backup/run-eve251-storage.sh node --run verify`
exited zero: all 86 aggregate Nx tasks passed uncached, followed by smoke for
three projects and 12 dependencies, also uncached. Source boundaries cover 175
files/627 edges/28 packages; emitted boundaries cover 68 files/259 edges, both
with zero violations/cycles. `node tools/documentation/planning.mjs --check --require-reviewed`
reports 258 issues/692 edges, zero unresolved decision sources/stale outputs.
`pnpm nx sync:check` reports all files up to date. The approved disposable
PostgreSQL fixture/network were removed; Android export is not device execution.
An earlier aggregate attempt failed two test tuple-inference checks, corrected
before this successful run. Formatting pruned five obsolete rationale-debt
identities without accepting new debt or claiming semantic remediation. The
[delivery evidence](https://linear.app/resnovas/issue/EVE-251#comment-e4158f5c-9e7e-4741-a8a5-37322651b305)
records signed revisions and remote CI separately. LLMS regeneration is
byte-unchanged: the generator includes index Markdown and TypeScript examples,
not sibling Markdown notes; the reserved trust index remains untouched.

## EVE-60 governed correlation follow-up - 2026-11-17

This increment leaves the delivered synthetic wrapper and EVE-34 sources
unchanged. Jonathan's hourly rotation confirmation is separately recorded in
the [decision index](decisions.md#historical-open-and-superseded-information)
and on [EVE-60](https://linear.app/resnovas/issue/EVE-60#comment-c07d8ede-14b4-49b1-bb83-0088bae5cd6e)
and [EVE-19](https://linear.app/resnovas/issue/EVE-19#comment-f9740a5b-d126-4a55-8000-12bf9971a349).
The [export guide](../telemetry-export.md#govern-pseudonymous-request-correlation-eve-60)
owns the detailed fixture contract. The frozen source capture is preserved;
dated annotations distinguish later owner direction from historical proposals.

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Identifier/key/rotation direction | Confirmed | Pseudonyms only, per-request opt-in/current consent, no protected profiles; server-only tenant/destination/purpose keys; hourly UTC renewal without failed/replayed/dropped business actions. Provisioning is not authorized. |
| Fixture issuer and governed channel | Focused verification passed | Strict separate pair channel, local HMAC with matching key metadata, exact binding/current consent and dispatch checks; production denied. Sixteen focused groups include real loopback OTLP bytes through central instrumentation, exact pair attributes and no raw headers. |
| Scoped refresh and central worker | Focused verification passed | Four automatic rotations, exact-boundary in-flight action finishes once, issuer outage/recovery, two interleaved span/error-log pipelines and raw canaries. Normal telemetry suite: 67 tests, 97.01% lines / 95.29% branches / 93.37% functions; unchanged gates. |
| Shared generation and full repository gate | Passed locally; delivery recorded separately | Planning/LLMS and clean-source graph regenerated. Full serial verification on the rebased source passes all 86 aggregate tasks and smoke for three projects with 12 dependencies. Signed direct-main revisions and exact-head CI are recorded on EVE-60; local success is not remote CI success. |
| Real ingress/devices and production | Upcoming / unaccepted | No real issuer/consent store or keys, SDK propagation, authenticated ingress, captured-error/AI/replay association or native-device proof. EVE-60 remains open; EVE-58 is not a local-proof prerequisite. |

```mermaid
flowchart LR
    Policy[Owner pseudonym and hourly renewal policy] --> Fixture[Fixture issuer and governed channel]
    Synthetic[Delivered synthetic boundary unchanged] --> Fixture
    Fixture --> Local[Local consent and automatic epoch proof]
    Local --> Verify[Shared outputs and full repository verification]
    Verify --> Delivery[Signed main delivery and exact-head CI]
    Delivery --> Real[Separately authorized real ingress and devices]
```

Executed above main `6016e99d7c4f49beb8a8cb0efac071b07056771b`:
`DOCUMENTATION_BASE=6016e99d7c4f49beb8a8cb0efac071b07056771b NX_DAEMON=false bash .amp/in/orb-backup/run-eve60-storage.sh node --run verify`
exited zero. Normal Nx caching supplied 14 of 86 aggregate tasks and nine smoke
dependencies; the remaining tasks executed. Two earlier full uncached runs also
passed before integrating newer main. Source boundaries cover 178 files/641
edges/28 packages and emitted boundaries 70 files/264 edges, both with zero
violations/cycles. Root check passes 98 documentation fixtures, 258 issues/692
planning edges, zero unresolved/stale planning sources and zero documentation
ratchet violations. The final uncached telemetry lint/typecheck/test targets
also pass after independent literal-hour and suspended-key epoch controls.
The disposable PostgreSQL fixture/network were removed. No native-device,
authenticated-ingress or production acceptance is inferred from these results.

## Measured busy-control slice 3 - 2026-11-17

The bounded [EVE-35 checkpoint](../cluster.md#measured-busy-control-checkpoint-eve-35)
uses the existing per-run control entity and approved disposable loopback SQL
fixture, without production source, dependency or public transport changes.
Two runs with the exact same caller/session remain pending behind deterministic
step-2 barriers. Unauthorized Interrupt requests leave both unsignalled. One
authorized attempt must acknowledge in less than 1,000 ms and already have its
exact persisted signal, without implying completed cancellation. Each released
run succeeds with output 172, executor counts [1,1,1] and one complete business
commit/receipt set, unchanged from the no-fault control.

Revision 4 of the [slice brief](https://ampcode.com/artifacts/eventiva-next-parallel-slices-current-main-readiness-f4c31b8c-2405-4743-ad32-bedc11c633a5)
incorrectly claimed an existing failed snapshot. The first SQL probe measured
16.22 ms and then failed that proposed assertion with actual succeeded/output
172. Pinned Cluster 0.60.5 reads InterruptSignal on suspension/failure; waiting
for its deferred reply while holding execution instead reached the existing
convergence deadline. This is a test-accuracy correction, not a product decision.
Interrupt-to-failed termination stays with EVE-54. The later
[clarification](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a)
and [EVE-35 evidence](https://linear.app/resnovas/issue/EVE-35#comment-b06cb0d8-09d1-4d31-bdb2-7e75ca7f274e)
retain this distinction; the issue remains Backlog, not Done.

Focused protocol validation passed seven tests. The uncached server target
passed 25 tests with 99.09% lines/97.67% branches and SQL cluster conformance;
the measured authorized acknowledgement was 24.03 ms. Coupling Interrupt to
the still-held step made the negative control fail at the unchanged 1,000 ms
bound; the temporary production mutation was removed. Full `node --run verify`
passed root checks (98 documentation fixtures, zero ratchet violations),
aggregate Nx targets and all three smoke targets. Strict reviewed planning
passed 258 issues/692 edges with zero unresolved sources and stale outputs.
Final rebased-head checks and signed delivery are recorded on EVE-35, not
inferred from an earlier head. The complete historical mirror is unchanged;
a dated planning annotation cites this bounded live issue read.

## Executor intent lifetime, batch 4 slice 1 - 2026-11-17

The [EVE-39 checkpoint](https://linear.app/resnovas/issue/EVE-39#comment-b29e9dc6-13ad-4601-b816-2775d340b154)
and [EVE-40 A3 checkpoint](https://linear.app/resnovas/issue/EVE-40#comment-f520561e-5fa6-4843-b0f3-5e8c70c885f1)
implement revision 6's private executor-lifetime correction. They do not select
new policy or close broader acceptance. EVE-39 remains Backlog; EVE-40 was already
Done when read, and this increment changes neither status. Earlier batch-3 input
isolation is preserved; the parallel host-registry lane's sources are untouched.

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Shared-intent substitution | Reproduced | Original inspection behavior fails 14 of 17 public regressions, with three unchanged controls passing. Deleting deadline 0 incorrectly permits execution. |
| Private admitted intent | Focused verification passed | Each inspection gets a fresh scalar view. All 17 regressions and 131 execution/host/action-type tests pass; deterministic waits and replay preserve original timing, state/version and idempotency/approval references. Current policy/identity/approval revocation stays live. |
| Shared outputs and independent delivery | Full local gates passed; signed delivery recorded separately | Root `check`, full `verify` (86 aggregate targets, source/declaration boundaries and three smoke targets) and strict reviewed planning pass. Planning/LLMS/clean-source Graphify are regenerated after rebase. Exact commands, signed revisions and asynchronous CI are recorded on both issues; local success does not establish remote CI success. |
| Durable runner and complete action acceptance | Upcoming / open | Volatile adapter-corruption fixtures do not prove SQL/process recovery, real dispatch, production readiness or EVE-39's broader duplicate-runner contract. No public API, policy, dependency, secret or production change. |

```mermaid
flowchart LR
    A3["Approved EVE-40 A3"] --> Intent["EVE-39: private admitted intent"]
    Intent --> Views["Disposable policy views"]
    Intent --> Gates["Original-bound wait and replay gates"]
    Live["Fresh policy and revocation"] --> Gates
    Gates --> Runner["Remaining durable-runner acceptance"]
    click A3 "https://linear.app/resnovas/issue/EVE-40"
    click Intent "https://linear.app/resnovas/issue/EVE-39"
```

## EVE-261 native bootstrap shutdown - 2026-11-17

The [new captured recurrence](https://github.com/Resnovas/Eventiva/actions/runs/44136214792/job/134226340803)
reached root-exit and Node's exit event at 1041 ms, then hit the unchanged
10000 ms child deadline. On immutable source `3bb0bb5a6e552caa435418f1bfea6985763a8ea2`,
the real failed server reproduced a native forced-exit deadlock under finite
test-only allocation/crypto pressure on pinned Node 24.22.3. Native stacks show
the main thread joining V8 workers while a worker waits for main-thread GC.
This matches Node issue 64274; CI has no native stack to identify its exact job.
The [detailed contract](../telemetry.md#drain-failed-roots-without-forced-native-exit)
and [EVE-261 evidence](https://linear.app/resnovas/issue/EVE-261#comment-0a5d61f4-2406-4d01-93ef-bd20b20abac4)
separate executed reproduction from historical inference.

| Step | State | Evidence / boundary |
| --- | --- | --- |
| Reproduce the failed-root native join | Completed | gdb: DefaultProcessExitHandlerInternal / WorkerThreadsTaskRunner::Shutdown / uv_thread_join versus CollectionBarrier::AwaitCollectionBackground. No unfinished Effect scope. |
| Preserve failure code with natural drain | Focused proof passed | Composition-only teardown; real-child regression fails before at 10091 ms and passes after in 3540 ms. Original assertions, 10000 ms bounds and signals unchanged. |
| Full uncached local verification | Completed | `node --run verify` passes all 86 aggregate Nx tasks, source/declaration boundaries and smoke using disposable PostgreSQL, including two uncached runs before later documentation-only main advances. Latest-base gate commands, direct-main revision and exact-head CI are recorded separately on EVE-261 after execution. |
| Broader EVE-261 acceptance | Upcoming / unaccepted | No inference that every historical timeout, native target or other platform gate is resolved. |

```mermaid
flowchart LR
    Capture[CI phase evidence] --> Native[Real-server native stack reproduction]
    Native --> Drain[Failed-root natural drain and regression]
    Drain --> Gates[Full verification and direct-main delivery]
    Gates --> CI[Exact-head CI evidence]
```

## Tied schema contribution diagnostics - 2026-11-17

This bounded [EVE-258](https://linear.app/resnovas/issue/EVE-258) /
[EVE-263](https://linear.app/resnovas/issue/EVE-263) slice implements the
[next-batch revision 4 contract](https://ampcode.com/artifacts/eventiva-next-parallel-slices-current-main-readiness-f4c31b8c-2405-4743-ad32-bedc11c633a5).
It starts at immutable main `cd35465d1792f348e745383e7cd34e57ed7a1cf1`.
The [schema guide](../schema-typing.md#deterministic-contribution-diagnostics)
owns the ordering details; no new product/security decision or release authority
is introduced. Source reservations cover only compose, its existing schema test
and the people/agent schema guides; affected shared outputs are regenerated by
this delivering lane, not a central coordinator.

The separately dated live evidence is on
[EVE-258](https://linear.app/resnovas/issue/EVE-258#comment-6fa4a2e3-c204-4013-98c8-4fafac707c2e)
and [EVE-263](https://linear.app/resnovas/issue/EVE-263#comment-3883ecfa-eec2-4d34-ad9a-c18f3373c869).
The complete issue snapshot is still historical, not silently refreshed.
The generated documentation ledger preserves newer main's remediation and
refreshes source locations; this slice claims no semantic rationale remediation.

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Unchanged-main negative control | Completed | The schema suite with the added regression failed: expected DuplicateField alpha, received beta, with the same events/tickets attribution. |
| Metadata tie-break and controls | Implemented; focused schema verification passed | All six orders of three same-module contributions, both resource orders, fixed typed collision/name/protection/reference diagnostics and frozen-input/schema-identity controls. Accepted schemas and public error classes are unchanged. |
| Host/resources compatibility and aggregate verification | Passed locally; direct-main delivery tracked on owning issues | Schema/runtime/resources tests and typechecks, root check, full verify and strict reviewed-source planning passed. Rebase, regenerate LLMS/planning/clean-source Graphify and repeat full gates for newer main. Exact final commands/results and signed delivered commits are recorded on both owning issues; remote CI remains separate. |
| Broader platform acceptance | Upcoming / open | EVE-258 remains In Progress and EVE-263 Backlog on this lane's live read. This pure invariant correction does not close either issue, prove all G01-G15 gates or authorize dependencies, secrets, migrations or production. |

```mermaid
flowchart LR
    Reproduce[Tied diagnostic red control] --> Fix[Canonical validation metadata order]
    Fix --> Controls[Permutation and input identity controls]
    Controls --> Verify[Host resources and full gates]
    Verify --> Deliver[Independent direct-main delivery]
    Deliver --> Remaining[Broader EVE-258 and EVE-263 acceptance stays open]
```

## Kernel manifest ownership, batch 5 slice 1 - 2026-11-17

The [EVE-257 checkpoint](https://linear.app/resnovas/issue/EVE-257#comment-b21e1a9b-d224-416a-bd29-a85d3e81ac38)
implements private registry ownership without a contract change. The documentation
lane cleared the four reserved source/test/guide paths before test edits. The
complete historical Linear capture remains unchanged; a dated generated
annotation records the bounded live In Progress read and implementation evidence.

| Step | State | Evidence / remaining boundary |
| --- | --- | --- |
| Returned manifest and retained authority aliases | Reproduced before the fix | Seven new public cases fail on unchanged 355b1182 production source: clearing dependencies bypasses missing-dependency validation, renaming leaks registration after scope close, metadata changes snapshots, and authority views corrupt composition or replacement. All 39 existing cases and three new controls pass. |
| Private admitted metadata and original disposal key | Focused verification passed | Detached nested wire declarations at register return and each authority callback; update admission remains private across deterministic preflight suspension. Kernel/runtime telemetry passes 70 tests, and the durable producer suite passes 38 tests against SQLite and the approved disposable PostgreSQL fixture. Callable services, executable Layers and public signatures are unchanged. |
| Latest-main integration and aggregate gates | Integrated / delivery evidence separate | Full gates passed after rebase onto 954f8ec2; a later pre-push race was integrated at 2484fdb7, preserving the disjoint resource-catalogue correction as well as documentation, native-shutdown and schema-diagnostic deliveries. Regenerated planning/LLMS, location evidence and clean-source Graphify; repeated final integration gates and signed delivery are recorded on EVE-257. Jonathan's 2026-11-17 option B removes the attribution-only push hold while preserving model-specific credit and his sign-off. |
| Complete kernel/platform acceptance | Upcoming / open | In-process alias isolation does not prove distributed fencing, durable registry reconstruction, external executable isolation, native behavior or production activation. EVE-257 is not marked Done. |

The first runtime aggregate omitted the disposable PostgreSQL environment and
failed ten connection checks; that run is not a passing gate. Both subsequent
full fixture-backed verifications passed without skipping tests or changing
thresholds; latest-main integration evidence remains separately recorded.
One stale test-suite rationale fingerprint was automatically pruned, not accepted
as new debt or claimed as semantic remediation. Graphify Cloud memory and the
MCP gateway were unavailable; local source/graph and the connected Linear tool
supplied evidence instead. No API behavior was implemented from memory.

Jonathan selected option B on 2026-11-17, through Puck and the
[delivery relay](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a):
auto-added `Amp-Thread-ID` and `Co-authored-by: Amp <amp@ampcode.com>` trailers
are allowed on agent commits as a standing attribution-only exception. Keep
the model-specific AI credit and Jonathan's sign-off. This does not waive
verification or authorize production changes; EVE-257 remains In Progress.

```mermaid
flowchart LR
    Red["EVE-257: alias regressions red"] --> Private["Private admitted manifests"]
    Private --> Views["Detached caller and authority views"]
    Views --> Scope["Original-key dependent-first disposal"]
    Scope --> Gates["Latest-main full verification"]
    Gates --> Delivery["Signed delivery under option B attribution exception"]
    Delivery --> Open["Broader kernel acceptance remains open"]
```

<!-- planning:generated:start -->
## Generated all-issue planning coverage

Snapshot enumeration: 2026-11-17T07:42:41.684Z; 258 issues, 692 prerequisite edges. Planning counts after explicitly cited annotations: completed 20; current 18; upcoming 218; closed without implementation 2; additionally blocked 176. Captured Linear status is retained in every detail table and accessible SVG node; later evidence is never a silent source refresh.

Layers use longest prerequisite distance, not a newly approved delivery order, deadline or priority. P/F prefixes are preserved as recorded phase labels; unnumbered work is not assigned an invented phase. Only completed prerequisites satisfy recorded edges; canceled/duplicate closure alone does not. Completed status is not independent acceptance proof. No structured blocker does not establish readiness: prose/security/native/device gates still apply. See each complete issue's acceptance criteria and comments before choosing work.

Legend: COMPLETED solid green; CURRENT double blue; UPCOMING dashed slate; CLOSED dashed violet; BLOCKED hatched amber, always labeled in text. Blocked overrides base fill/border except the current double outline. Arrows point prerequisite -> dependent. A blocked current issue stays CURRENT / BLOCKED.

### Curated evidence separate from capture

- EVE-246, 2026-11-18, later-status: Jonathan resumed the named issues on 2026-11-18. First bounded slice adds a schema-validated advisory per-obligation fulfilment assessment with fake-clock 14/7/3-day boundaries, no-response reminders and dispute/unsupported-hold refusal. Focused tests and TypeScript compilation pass; full gates and signed delivery are recorded separately. No provider command, payment, dependency, production integration or whole-issue acceptance. The historical issue capture is unchanged. [evidence](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a#M-034zciY2mZuppwjcEvwc6g), [evidence](https://linear.app/resnovas/issue/EVE-246#comment-1301864e).
- EVE-247, 2026-11-18, later-status: Owner resumed the named issue. First bounded library slice previews mapped bulk stock against separate public model identities. Exact case-insensitive matching retains punctuation/variants; invalid rows, all colliding valid SKUs and ambiguous references remain explicit. Conservative 1000-row/10000-reference limits are implementation choices, not researched coverage. Eight focused tests across the payment/catalogue modules and TypeScript compilation pass; full gates and signed delivery follow separately. The catalogue guide separately cites two official manufacturer samples and two inventory-tool format guides; source rights, connector compatibility and supplier discovery remain open. No scraping, source-rights claim, stock persistence, dependency or broader acceptance. Frozen source remains historical. [evidence](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a#M-034zciY2mZuppwjcEvwc6g), [evidence](https://linear.app/resnovas/issue/EVE-247#comment-719b971b).
- EVE-248, 2026-11-18, blocker: Jonathan's superseding 2026-11-18 decision: Leave off for now, revisit in January only. Recorded on EVE-248 with due date 2027-01-04. Keep the AI-gate override and all budgets unchanged; do not reopen before January 2027. No further EVE-248 work or read-only investigation by this lane. Supersedes the earlier same-day readiness checkpoint; EVE-246/247 continue independently. Frozen issue capture remains historical. [evidence](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a#M-034zciY2mZuppwjcEvwc6g), [evidence](https://linear.app/resnovas/issue/EVE-248#comment-887d205b).
- EVE-257, 2026-11-17, later-status: Batch 5 slice 1 preserves private admitted kernel manifests across register return values, fresh authority views and staged updates. Red-first public regressions reproduce missing-dependency bypass, renamed-scope leakage and retained authority replacement corruption: seven fail on unchanged production source while all 39 existing tests and three new controls pass. The private typed manifest copy and captured disposal key leave contracts, executable Layers and provider service values unchanged. Focused kernel/telemetry and two-dialect producer checks pass; final latest-main aggregate verification and signed delivery are recorded separately in the timeline and owning issue. EVE-257 remains In Progress; in-process alias isolation is not distributed fencing, durable registry reconstruction, production activation or complete platform acceptance. The historical issue capture is unchanged. [evidence](https://linear.app/resnovas/issue/EVE-257#comment-b21e1a9b-d224-416a-bd29-a85d3e81ac38), [evidence](https://ampcode.com/threads/T-7fb29ae7-0008-4ec1-81c5-7078270fe066).
- EVE-39, 2026-11-17, later-status: Batch 3 slice 2 preserves the already approved A1/A2 exact-input binding in action preparation only; its prior red/green and signed delivery remain cited. Batch 4 slice 1 implements the approved EVE-40 A3 intent lifetime inside the executor: each policy inspection receives a disposable scalar view, never the decoded intent subsequently enforced. Restoring shared-intent behavior makes 14 of 17 public regressions fail, including deadline-0 deletion incorrectly succeeding; all 17 pass with isolation, and the focused execution/host/action-type suite passes 131 tests. Retained references across integrity waits and replay cannot rewrite timing, schedule, expected state/version or idempotency/approval bindings; live identity, policy and approval revocation remain fresh. Full gates and signed delivery evidence are recorded separately on EVE-39/EVE-40. EVE-39 remains Backlog; EVE-40 was already Done, and neither status is changed. This volatile in-process fixture is not an external exploit, payment, durable SQL/crash proof, production authorization or whole-issue completion. The historical issue capture remains unchanged. [evidence](https://linear.app/resnovas/issue/EVE-39#comment-7f7ed992-bf10-4c34-9161-7afb155f51fc), [evidence](https://ampcode.com/threads/T-01a1ea44-9e01-725c-9b01-9126c260a325), [evidence](https://linear.app/resnovas/issue/EVE-39#comment-b29e9dc6-13ad-4601-b816-2775d340b154), [evidence](https://linear.app/resnovas/issue/EVE-40#comment-f520561e-5fa6-4843-b0f3-5e8c70c885f1), [evidence](https://ampcode.com/threads/T-1d187d8d-5a8e-492a-b9f9-66786c3a790a).
- EVE-60, 2026-11-17T15:28:28.416Z, later-status: Live issue and complete terminal comment page rechecked. Jonathan confirmed one-hour rotation at 15:27:19.582Z, conditional on automatic client renewal without disrupted actions; the separate 15:27:26.780Z Puck relay specifies UTC alignment, in-flight boundary and multi-epoch tests. This supersedes the historical lifetime-pending clause, not privacy/consent/protected-profile denial. The governed follow-up uses injected non-production fixture keys only; production, provisioning and real issuer/consent stores remain denied. Source/tests and exact-head aggregate/delivery evidence are recorded separately in the timeline and export guide. Frozen issue capture is unchanged; this is not a full live-source refresh or whole-issue acceptance. [evidence](https://linear.app/resnovas/issue/EVE-60#comment-c07d8ede-14b4-49b1-bb83-0088bae5cd6e), [evidence](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a#M-034zDqigs0qoRlB2tOAQYo).
- EVE-19, 2026-11-17T15:28:29.172Z, later-status: Live capability-study issue retains historical Done, not EVE-60 implementation acceptance. The later decision records the owner's hourly rotation with automatic trusted-issuer renewal, no user-visible failure or action replay/drop, and UTC boundary/multi-epoch tests. Only pseudonyms may leave the process with per-request opt-in and current consent/release; raw SDK headers remain forbidden. Dedicated server-only tenant/destination/purpose keys are design-authorized, not provisioned; production remains denied. The source capture stays historical and the later cited annotation supersedes only the lifetime-pending proposal. [evidence](https://linear.app/resnovas/issue/EVE-19#comment-f9740a5b-d126-4a55-8000-12bf9971a349), [evidence](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a#M-034zDqigs0qoRlB2tOAQYo).
- EVE-35, 2026-11-17T15:45:43.910Z, later-status: Bounded live description and terminal comment-page review retains Backlog. Slice 3 adds a single-attempt under-1000-ms authorized Interrupt measurement on healthy registered SQL runners, exact persisted-signal attribution, same-session independent-run and foreign-tenant denial controls. Acknowledgement means persisted signal submission, not cancellation completion. Revision 4's failed-snapshot claim was contradicted by pinned Cluster 0.60.5: after release both runs succeed with output 172 and exact once-only business counts; interrupt-to-failed termination remains EVE-54 work. Execution and signed delivery evidence are separately recorded on EVE-35 and in the maintained timeline; full conversation/user-input/approval orchestration and EVE-54 lifecycle acceptance remain open. No production authorization or complete live snapshot refresh is implied. [evidence](https://linear.app/resnovas/issue/EVE-35#comment-b06cb0d8-09d1-4d31-bdb2-7e75ca7f274e), [evidence](https://ampcode.com/threads/T-01a1ea29-6178-7380-a38b-2ad341f4da81).
- EVE-261, 2026-11-17, blocker: The initial diagnostic checkpoint did not establish cause. Later CI 44136214792 on 3bb0bb5a reached root/Node exit at 1041 ms before timing out at 10031 ms. A real-server reproduction on pinned Node 24.22.3 with finite test-only allocation/crypto pressure and native gdb stacks proves a reachable forced-exit deadlock: main joins V8 workers while a worker awaits main-thread GC, matching nodejs/node issue 64274. Composition now preserves failed-root code 1 through natural drain; success/interruption callback, scopes, signals, original assertions and 10000 ms bounds remain unchanged. The new actual-child regression fails before at 10091 ms and passes after in 3540 ms. CI lacks native stacks to identify its exact job; earlier occurrences and broader acceptance are not proven resolved. Combined verification, delivery and exact-head CI are separate evidence on EVE-261, not a refreshed historical issue snapshot. [evidence](https://linear.app/resnovas/issue/EVE-261#comment-0a5d61f4-2406-4d01-93ef-bd20b20abac4), [evidence](https://github.com/Resnovas/Eventiva/actions/runs/44136214792/job/134226340803), [evidence](https://linear.app/resnovas/issue/EVE-261#comment-c0e0d66f-9f2c-4009-9164-3695a7413038), [evidence](https://github.com/Resnovas/Eventiva/actions/runs/44096066749/job/134083384961), [evidence](https://ampcode.com/threads/T-1cb8af52-2e52-4924-bb42-cc7c523a6ddc).
- EVE-262, 2026-11-17, later-status: Slice 2 independently read the live description and terminal comment page: EVE-262 is In Progress (state change recorded 08:14:06.002Z), not the historical Backlog capture. Current bounded work proves hook release reauthorization after claim/revocation/process loss and operator redrive using fixture-persisted policy, with an allowed durable-dedup control. Execution and delivered-head evidence are recorded separately on EVE-262/EVE-45 and in the maintained timeline; this annotation grants no production release or whole-issue acceptance. The complete historical source capture is unchanged. [evidence](https://linear.app/resnovas/issue/EVE-262), [evidence](https://linear.app/resnovas/issue/EVE-262#comment-4cad4584-11e3-45e2-80cc-afc7df728cec), [evidence](https://ampcode.com/threads/T-01a1e9e1-a727-7765-932d-bd55c3f03d51).
- EVE-258, 2026-11-17, later-status: Slice 1 adds a separate self-asserting declaration migration process-loss target to storage test, preserving the held parent spec and its migrationCrashProof:false default report. SQLite and disposable PostgreSQL pass precommit SIGKILL rollback, postcommit acknowledgement loss, empty repeat history, valid changed-prefix refusal and stale-writer rejection with a current-writer control. Separately, batch 4 slice 2 reproduces caller-owned declaration aliasing in the existing EVE-23 host and detaches admitted resource/contribution metadata and returned schema views. Its focused host/execution and schema controls pass; combined gates and signed delivery are recorded separately on the issues and timeline. Jonathan's option B, relayed through Puck on 2026-11-17 with exact selection time unknown, permits auto-added Amp-Thread-ID and generic Amp coauthor trailers as a standing attribution-only exception; model-specific credit, Jonathan's sign-off and all other gates remain required. EVE-23's completed status is unchanged. This is bounded in-process registry and local G04 evidence, not canonical storage integration, power loss, distributed fencing, native execution, production least privilege or whole-issue acceptance. Source capture remains historical; later execution and delivery evidence is cited separately. [evidence](https://linear.app/resnovas/issue/EVE-258/add-the-database-neutral-resources-api-and-privileged-tenant-migration#comment-79bf922f), [evidence](https://ampcode.com/threads/T-a0a1608d-284c-46c6-8bd0-372ce1a02efb), [evidence](https://linear.app/resnovas/issue/EVE-258#comment-c32dee12), [evidence](https://linear.app/resnovas/issue/EVE-23#comment-4bee9f1d), [evidence](https://ampcode.com/threads/T-01a1ea75-2cdd-758c-aa90-a1e5ba6ba432), [evidence](https://linear.app/resnovas/issue/EVE-258#comment-585506ae), [evidence](https://linear.app/resnovas/issue/EVE-23#comment-5b25448f), [evidence](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a).
- EVE-42, 2026-11-17, later-status: The EVE-258 migration process-loss slice executes on both SQL dialects through the existing public migrator with fixture-only barriers and three distinct SIGKILL workers. Two asymmetric records, exact declaration bytes/checksums and five original revisions survive rollback/retry and acknowledgement loss; repeat history applies nothing and stale writers fail closed. No adapter policy, dependency, secret or production change. Deferred Drizzle/device/provider least-privilege and complete storage acceptance remain open. This dated checkpoint does not silently refresh the captured issue discussion or infer completion. [evidence](https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state#comment-b23c70d9), [evidence](https://ampcode.com/threads/T-a0a1608d-284c-46c6-8bd0-372ce1a02efb).
- EVE-251, 2026-11-17T15:44:16.936Z, later-status: The 14:28:01.568Z slice 4 checkpoint adds independent-process consume-once evidence to the existing default trust fixture: identical and case-equivalent UUID races, one retained matching winner, sanitized fail-closed losers, deterministic replay after all racing clients close, and a distinct-nonce positive control. Both standalone dialect proofs passed; an isolated lowercasing-removal mutation was rejected. The 15:44:16.936Z next-batch slice 2 checkpoint independently read the live description and terminal 16-comment page; EVE-251 remains In Progress. Its A5-policy/A4-evidence adapter-mutation regression reproduced metadata success and nonce consumption before the fix; detached immutable admitted request/policy snapshots passed the initial 170-case checkpoint. The maintained timeline records the final separate suspension barriers, checks and delivery. Aggregate verification and signed delivery are separately recorded on the issue, not inferred from either checkpoint. The captured issue prose remains historical; this is not a full live mirror refresh. No concrete crypto/provider/custody/timing/retention choice, key/plaintext release, production activation or whole-issue completion is established. [evidence](https://linear.app/resnovas/issue/EVE-251#comment-eaf4d8a6-1612-4ae7-9bde-97244b878250), [evidence](https://ampcode.com/threads/T-01a1e9e1-bcd6-7217-97ea-fd5de5a09a96), [evidence](https://linear.app/resnovas/issue/EVE-251#comment-b5a4e484-a21b-4b81-8292-566b8b76ba9d), [evidence](https://ampcode.com/threads/T-01a1ea29-5659-70f4-acdb-3856f1dc28ae).
- EVE-84, 2026-11-17T12:31:56.867Z, later-status: Live description and complete comment list independently reviewed: EVE-84 covers general Event planning, not MDT only. Jonathan's conditional 2026-11-17 decision therefore selects option B: confirm every Event/Phase anchor-date change, including dependency-delay cascades; non-anchor dates may cascade automatically. Exact owner-selection time is unknown; this date is the Amp Linear relay, not the owner-selection or capture time. Baseline/history, absolute/completed-date exclusions, manual locks, authorization and readiness remain. The prior source ambiguity is resolved, but implementation prerequisites and whole-issue acceptance remain open. Frozen capture is unchanged; this is not a complete live roadmap refresh. [evidence](https://linear.app/resnovas/issue/EVE-84#comment-f9c96ce3-873a-46ba-9702-bf00bcebc44d), [evidence](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a).
- EVE-22, 2026-11-17T12:15:01.148Z, later-status: Live MCP recheck retains In Progress. Human TGTGamer merged house PR 47 at 12:14:25Z as squash commit 983ce5595b75f1d485446b320fdc85b322c80dd4; GitHub state was independently checked. The tested downstream architecture references and house summary now align with Eventiva's 16 intersecting ESLint rows, without changing lint/runtime behavior. Eventiva combined verification/delivery and exact-head CI remain separate evidence; the historical mirror is not silently refreshed and whole-issue acceptance is not inferred from the house merge. [evidence](https://github.com/Resnovas/.github/pull/47), [evidence](https://github.com/Resnovas/.github/commit/983ce5595b75f1d485446b320fdc85b322c80dd4), [evidence](https://linear.app/resnovas/issue/EVE-22#comment-9b58885c-134f-49a6-aed2-59bfb9a1ef60).
- EVE-34, 2026-11-17T12:03:57.576Z, later-status: Bounded EVE-34 refresh retains Backlog and includes the checkpoint plus source-lane evidence. Central immutable-d771b366 verification on 2026-11-17 passed completed-Activity SIGKILL/drain/restart controls, all 85 aggregate Nx tasks and smoke with disposable PostgreSQL. Both new modules remain in normal coverage: AgentRun branches 42/44 and combined server branches 84/86, above the unchanged 90% gate after public-contract tests closed the initial gap. Exact-head CI remains separate. EVE-35/36 consume the run model; EVE-52 and EVE-54 module pin/fence/full lifecycle acceptance remain separate. No production activation or whole-issue completion. [evidence](https://linear.app/resnovas/issue/EVE-34#comment-01bffbbf-3f7b-433e-9397-e964b555037c), [evidence](https://ampcode.com/threads/T-5a85c8b5-cf76-429d-b85e-30bc35c680a4), [evidence](https://ampcode.com/threads/T-66e90dd6-0f21-4bf7-809b-fb3bb8b9eb9c).
- EVE-45, 2026-11-17T11:41:17.706Z, later-status: Live MCP recheck retains In Progress. Jonathan's authenticated option-A selection at 2026-11-17T11:38:55.329Z in the cited Puck thread requires mandatory finalizers despite failed durable admission, visible recovery-required and no fabricated fact. The Amp relay was recorded separately at 11:41:17.721Z on EVE-45. Ordinary mutations fail closed before callbacks with no replay. Kernel implementation and focused SQL acceptance are a bounded checkpoint, not full EVE-45/EVE-261 acceptance or production authorization. Historical capture is unchanged. [evidence](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a), [evidence](https://linear.app/resnovas/issue/EVE-45/p16-build-the-change-flow-domain-events-and-a-durable-resource-change#comment-2ef327d5).
- EVE-21, 2026-11-17T11:53:50.319Z, later-status: Live MCP recheck retains Backlog, not accepted. Jonathan's authenticated selection at 2026-11-17T11:40:29.023Z approved adding @effect/opentelemetry and configurable OTLP endpoint/headers. Redaction, compatible 0.64.2/API1.9.0 pins, default-off/local behavior and one-shot no-backlog transport are scoped implementation constraints, not verbatim human wording or production-ingestion approval. Lane reports43 fixture tests; combined delivery remains separately verified. Later evidence is cited without changing the captured description/comments. [evidence](https://ampcode.com/threads/T-01a1e940-37a3-7691-a5c0-e935b711c99a), [evidence](https://linear.app/resnovas/issue/EVE-21/remove-sentry-from-core-and-make-telemetry-export-vendor-neutral#comment-bbcf9d9f).
- EVE-43, 2026-11-17T07:22:23.589Z, blocker: Exact-component adoption remains technically blocked: unresolved security, producer-provenance and inventory/licence evidence must close. Candidate readiness is denied; no risk acceptance or architecture change is established. [evidence](https://linear.app/resnovas/issue/EVE-43#comment-f95261be-6166-4781-8e5d-f8cbe2a9ec96).
- EVE-264, 2026-11-17, later-status: Central independently rechecked the live issue via MCP: Done/completed, source updatedAt 2026-11-17T08:24:52.805Z. Acceptance comment and delivered rename commit are cited. Captured Linear remains In Progress; this verified newer state is not full live reacquisition or an acceptance-test rerun. [evidence](https://linear.app/resnovas/issue/EVE-264), [evidence](https://linear.app/resnovas/issue/EVE-264/rename-the-top-level-examples-directory-to-lowercase-examples#comment-9e3bcf9c), [evidence](https://github.com/Resnovas/Eventiva/commit/980cac6f682336e97da5d72dea72650570dab6c7).

[Every issue, blockers and unlocks](roadmap/README.md) | [Layered SVG export](roadmap.svg) | [Mermaid source](roadmap/graph.mmd) | [Decision evidence coverage](roadmap/decision-sources.md)

This generated view augments, and does not replace or rewrite, the dated delivered human checkpoint above. Every mirrored issue is included exactly once in the linked layer tables. Live freshness requires separate credentialed acquisition; an offline pass proves consistency with the recorded snapshot only.
<!-- planning:generated:end -->
