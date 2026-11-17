# Documentation debt remediation

Jonathan approved the exact reviewed debt ratchet on 2026-11-17 through the current coordinated governance task. Tracking parents are [EVE-13](https://linear.app/resnovas/issue/EVE-13) and [EVE-261](https://linear.app/resnovas/issue/EVE-261); the batch identifiers below are repository work packets, not invented Linear issues or newly approved product scope. The coordinator records the plan/evidence on those issues when integrating this delivery. No global compliance is claimed.

## Policy and migration status

- New/changed editable TypeScript must satisfy attached JSDoc checks and semantic meaningful-rationale review immediately. Existing entries are exact visible debt/review work, never wildcard exemptions. Every touched file with blocking debt must reduce its blocking count; changing an undocumented declaration cannot consume its old token fingerprint. Added source lines cannot reuse an accepted callback identity.
- The ledger starts from existing source at `05e07b6dee66cddb594c089959df45bbd9a4c0aa`, not from another lane's undocumented in-flight additions. The CLI's trusted comparison base is a separate explicit verified Git input, never that historical SHA baked into a root command. After integration/rename, use the coordinator's actual trusted delivered base.
- All entry kinds have positive/negative executable fixtures. Missing attachments are mechanical; heuristic rationale/prose entries remain explicit review work, not 808 proven semantic failures. Rationale activation is held: adequate adjacent invariant contracts, simple reauthorization/barrier bodies and nested cleanup ownership explanations can still be flagged. The ratchet reports these candidates as review-only, does not fail new source for them, and never appends them to accepted debt. Touched-file reduction applies to blocking attachment/prose debt. Semantic rationale review remains mandatory; only a generally applicable tested classifier refinement may activate its automatic gate. The initial 4,114 mixed findings were not a validated violation count: an inline attachment defect and overstrict prose threshold were corrected before this ledger.
- `packages/contracts/src/action.ts` is the representative documentation-only source migration. It explains exact schema retention, declaration versus authorization, defaults and formatter limits; the pure expressions need no invented internal narration. No behavior or types changed. The calibrated scanner reports zero findings there. This is a useful-doc example, not a claim that it cleared previously missing attachments under the calibrated rule.
- The producer/exporter lane's new functions/callbacks are not accepted into this ledger. Their owner is documenting them before delivery. Existing tests/configs/examples stay in scope; do not exempt a file because its callbacks are small.

## Tracked batches toward strict zero

Every batch starts by reserving its exact files, reading the current implementation and latest binding owner decisions, then inspecting each ledger entry. Add useful contracts/rationale, or submit a generally applicable, positively and negatively tested classifier correction when an entry is genuinely a false positive. There is no per-entry suppress/waiver mechanism. Do not pad comments or mechanically generate filler. Small bodies and pure expressions still need useful JSDoc but not syntax narration. Keep public runtime contracts unchanged during documentation-only batches.

| Batch | Scope / order | Done signal |
| --- | --- | --- |
| D01 | Portable contracts and schema first; service member signatures, call signatures, classes, schema callbacks | Scope ledger count zero; package lint/type/tests; no widened public types |
| D02 | Runtime, after the relevant contract packet; action/kernel/lifecycle, authorization and cleanup boundaries | Scope ledger count zero; runtime lint/type/tests and affected parity, no behavior changes |
| D03 | Integration adapters; reserve ongoing SQL/export work before touching it; transaction/cancellation/security ownership rationale | Scope ledger count zero; integration lint/type/tests on actual supported fixture targets |
| D04 | Application shells; coordinate any interaction semantics separately from this documentation-only task | Scope ledger count zero; app lint/type/tests/smoke, rendered checks only if UI changes |
| D05 | Test suites and fixtures, in bounded directory packets; assertion/fixture intent, no narration of each assertion | Scope ledger count zero; unchanged tests and coverage thresholds pass |
| D06 | Handwritten configs/tools/agent examples and remaining editable TS; compiling examples must remain accurate | Scope ledger count zero; root check, doc generation and affected example typechecks |
| D07 | Strict-zero switch after D01-D06; remove debt acceptance, retain exclusions and all existing gates | Empty exact ledger; strict `node tools/documentation/check.mjs` succeeds repository-wide; full `node --run verify` passes |

Independent modules may be remediated in parallel only under disjoint reservations. These are implementation sequencing packets, not deadlines or release approval. After every packet, run `node tools/documentation/ratchet.mjs --base HEAD --update-ledger` locally to **prune only**, review ledger removals and this generated table, then record exact commands/output and delivered commit on the tracking parent. CI must compare against its trusted event SHA rather than a candidate-chosen ref. Keep all existing lint, type, coverage, boundary, license and documentation gates.

## Partial D01 semantic checkpoint - 2026-11-17

This packet starts from immutable remote main `87a82c9a3d1229f9a306230dfb5ebf268f9170bb` under the central coordinator's exclusive eight-file reservation. It resolves 26 missing attachments and one retained rationale candidate through documentation, with zero checker corrections. All eight files have zero live findings; their comment-free TypeScript token kind/text sequences match that base exactly. This is partial D01 progress, not complete contracts/schema remediation or global compliance. D02-D07 remain upcoming after their prerequisite packets.

| Reviewed contract source | Semantic evidence and boundary | Ledger removals |
| --- | --- | --- |
| `caller.ts` | Pre-decode permission discovery is distinct from post-decode target authorization; live grants apply to both. | 2 attachments |
| `flags.ts` | Stable source-rank sorting preserves same-source order; the provider-free layer ignores targeting and returns the declared safe default. | 3 attachments |
| `i18n.ts` | ICU formatting retains canonical fallback. Gregorian arithmetic rejects impossible calendar days without Date overflow normalization or years-below-100 remapping; a date is not an activation instant. | 2 attachments, 1 rationale |
| `identity.ts` | The SQL implementation confirms optimistic versions, current team membership, exact case-sensitive federation lookup, collision denial and bounded tenant-checked receipt reads. Persistence does not replace provisioning authorization. | 7 attachments |
| `machine.ts` | Edge validation does not mutate state or replace storage's atomic compare-and-set. | 1 attachment |
| `module-policy.ts` | Exact error construction excludes arbitrary causes; provenance admission does not replace caller authorization for lifecycle operations. | 4 attachments |
| `observability.ts` | Text predicates restrict terminal/directional control characters, attributes have a separate cardinality bound, and the composition-only sink keeps closed sanitized failures. The predicate is a single-return calculation, not a phased body needing invented narration. | 6 attachments |
| `security.ts` | Protection rank uses only the validated closed profile order; no new classification or downgrade behavior. | 1 attachment |

The pruning command uses `--base 87a82c9a3d1229f9a306230dfb5ebf268f9170bb --update-ledger`, not candidate HEAD: 178 files, 3,206 blocking findings, 854 live rationale candidates, zero violations. Retained debt is 4,009 identities: 3,206 attachments and 803 rationale candidates. Live candidates include 51 identities never admitted to the ledger. No source exception, exclusion change, heuristic activation or debt addition is included. Final verification and delivered commit/CI evidence are recorded on [EVE-13](https://linear.app/resnovas/issue/EVE-13) and [EVE-261](https://linear.app/resnovas/issue/EVE-261); pending execution is not a pass.

Executed before delivery: `pnpm nx run-many -t lint typecheck --projects=@eventiva/contracts --parallel=1` passed package lint/typecheck plus build; `DOCUMENTATION_BASE=87a82c9a3d1229f9a306230dfb5ebf268f9170bb node --run check` passed, including 84 documentation fixtures and offline consistency. `node --run verify`, under the approved disposable PostgreSQL 17 fixture with random run-only credentials, exited zero: 85 Nx lint/typecheck/test/build/parity tasks, zero source/declaration boundary violations, and smoke for all three projects plus 12 dependencies. The fixture and network were removed. An earlier contracts-suite run without PostgreSQL failed with connection refused; the full configured rerun passed, including that suite, without weakening tests. Android export is not native-device execution. Token equivalence and exact prune assertions passed for every reserved file. No UI behavior changed. Delivery commits and asynchronous exact-head CI are linked from the tracking issues rather than represented here as already passed.

## Second partial D01 semantic checkpoint - 2026-11-17

This packet starts from delivered immutable main `22c13a08a76ffc0efc2077c0404a37ab90950fc4`. The coordinator released these eight contract sources and the shared evidence/generated window for sequential delivery. Documentation resolves 119 missing attachments and six retained rationale candidates; checker corrections are zero. Each reviewed file has zero live findings and its parsed noncomment TypeScript terminal kind/text sequence matches that base exactly. Rationale comments explain actual boundaries rather than satisfying a word-count threshold. This remains partial D01, not complete contracts/schema remediation.

| Reviewed contract source | Semantic evidence and boundary | Ledger removals |
| --- | --- | --- |
| `hook.ts` | Subscription authorization, feed cursor/retention bounds, delivery leases and committed-fact provenance remain distinct from originating mutation authority. `KernelSnapshot` carries module/version/state, not the separate live generation pin. | 19 attachments |
| `inventory.ts` | Validate the whole registry before advertising any action; reject unsupported protection profiles instead of silently publishing a partial catalogue. Provider formats retain object-only tool inputs while scalar result schemas remain valid. | 19 attachments, 5 rationale |
| `json-schema.ts` | Conservative portable schema compilation rejects unsupported annotations/shapes; safe own-property definition avoids prototype setters without widening the accepted vocabulary. | 10 attachments, 1 rationale |
| `marketplace-durable.ts` | Tenant-bound persistence joins the existing storage transaction owner; durable provider methods do not authorize marketplace operations. | 8 attachments |
| `marketplace.ts` | Admission, custody, listing and installation contracts keep independent caller, protection, trust and tenant boundaries. Persistence is not permission. | 14 attachments |
| `storage.ts` | Replay, deadline, lock, lease, transaction and outbox contracts preserve exact wire values and one atomic owner; no external provider execution is implied. | 26 attachments |
| `trust.ts` | Evidence verification and replay consumption enforce separate one-use, audience and lifetime constraints; trust does not replace independent key/decryption gates. | 15 attachments |
| `ui-module.ts` | Viewer context is resolved lazily in the authorized screen boundary; portable declarations contain data rather than executable UI or ambient caller state. | 8 attachments |

The exact prune is 4,009 to 3,884 identities: 3,087 missing attachments and 797 retained rationale candidates. It removes only this packet's 125 accepted identities. Resource/schema source work is staged as a later sequential packet and is not included here. Completed: semantic review, exact-token proof, unchanged checker fixtures (47/47), uncached contracts/schema package lint/typecheck/build (6/6) and approved-fixture contracts/schema tests (2/2 targets); the eight-file contracts packet also passed all 405 contract tests before resource/schema edits. Current: full repository verification and clean-source graph delivery against the immutable base. Upcoming: resource/schema D01 packet, then D02-D06 and D07 strict-zero acceptance. No source-semantic unknown was established in this packet. Exact commits and asynchronous CI evidence are recorded on [EVE-13](https://linear.app/resnovas/issue/EVE-13) and [EVE-261](https://linear.app/resnovas/issue/EVE-261), not inferred from local checks.

Executed before the second packet's delivery: `DOCUMENTATION_BASE=22c13a08a76ffc0efc2077c0404a37ab90950fc4 node --run verify` exited zero under the approved disposable PostgreSQL 17 fixture. Root checks passed; all 85 Nx lint/typecheck/test/build/parity tasks passed (18 cache hits); source and emitted declaration boundaries reported zero violations/cycles; all three smoke targets and 12 dependencies passed. The fixture/network were removed. Exact token and prune assertions passed. Clean-source Graphify generation and its separate signed commit follow source commitment; CI is asynchronous, not a local verification claim. The first delivered head's final CI rollup also completed successfully, including [Code Quality](https://github.com/Resnovas/Eventiva/actions/runs/44075216962); release jobs were skipped, not deployed.

## Final D01 source packet semantic checkpoint - 2026-11-17

The second packet was delivered at [12dff4c8](https://github.com/Resnovas/Eventiva/commit/12dff4c8ba8001ed2071b2f543456f75b1aacb84), comprising source/evidence commit [03033cee](https://github.com/Resnovas/Eventiva/commit/03033cee) and a separate clean-source graph commit. Its post-commit ratchet still used immutable pre-packet `22c13a08a76ffc0efc2077c0404a37ab90950fc4` with zero violations; Graphify matched committed code. Exact-head CI follow-up is active, not presumed passed.

This final D01 source packet compares against actual delivered immutable main `12dff4c8ba8001ed2071b2f543456f75b1aacb84`, not candidate HEAD. Documentation resolves 76 missing attachments and nine retained rationale candidates, with zero checker corrections. All four files have zero live findings and exact parsed noncomment TypeScript terminal kind/text equivalence to that base. Source comments preserve behavior and explain ownership, validation and evolution constraints rather than inventing new guarantees.

| Reviewed source | Semantic evidence and boundary | Ledger removals |
| --- | --- | --- |
| `packages/contracts/src/resource.ts` | Complete own field-owner maps; detached literal templates; stable contributor/version pins; contiguous additive optional-only evolution; historical values retain writing schemas. Full versus partial codecs differ only in required presence and both reject explicit undefined/excess keys. Driver persistence is distinct from caller-authorized resource operations. Revision zero is the creation precondition, not the stored first revision. | 48 attachments, 8 rationale |
| `packages/schema/src/compose.ts` | Code-unit ordering selects deterministic diagnostics and output while retaining owner/contributor provenance; collision and protection-floor failures never pick an arbitrary winner. | 20 attachments |
| `packages/schema/src/field.ts` | Annotation returns a schema rather than a field; metadata transforms copy without changing value validation. Decimal validation counts lexical whole/fraction digits without Number conversion and requires caller-supplied valid precision/scale options. | 6 attachments, 1 rationale |
| `packages/schema/src/storage.ts` | Portable column projection keeps entry order and shape/conflict metadata only; executable codecs, security policy and driver types are deliberately not projected. | 2 attachments |

The exact prune is 3,884 to 3,799 retained identities across 111 files: 3,011 missing attachments and 788 rationale candidates. All retained D01 ledger identities are removed and every contracts/schema source scans clean. Completed: per-file semantic review and source-only package/test/checker evidence above. Current: this packet's immutable-base full verification, canonical evidence and clean-source graph delivery. Upcoming: coordinated D02-D06 remediation and D07 strict-zero acceptance. This is D01 scope completion after delivery, not global compliance, rationale-gate activation, producer acceptance or deployment. No source-semantic unknown was established; no exclusions, suppressions or accepted identities were added. The coordinator retains runtime/checker/planning model ownership; its unrelated local kernel/OTLP work is absent from this tree.

Executed before final D01 delivery: `DOCUMENTATION_BASE=12dff4c8ba8001ed2071b2f543456f75b1aacb84 node --run verify` exited zero under the approved disposable PostgreSQL 17 fixture. Root checks passed; all 85 Nx lint/typecheck/test/build/parity tasks passed (16 cache hits); source and emitted declaration boundaries reported zero violations/cycles; all three smoke targets and 12 dependencies passed. The fixture/network were removed. Exact assertions confirm only this packet's 85 ledger identities were removed, every other identity is unchanged, and the entire contracts/schema scanner scope has zero findings. Clean-source graph generation and its separate signed commit follow source commitment; the delivered head and CI follow-up are recorded on EVE-13/EVE-261. D02's next source-only reservation is runtime `action.ts`, `execution.ts`, `host.ts`, `invocation.ts`; its shared evidence/prune/delivery waits for the coordinator's next handback. Strict global rationale remains held because adequate adjacent-contract/barrier/nested-cleanup cases still need a safe tested general classifier rule.

## Kernel integration and classifier checkpoint - 2026-11-17

The kernel producer integration compares against delivered immutable main `9af03961801dc6e6376da030332d92e11684f178`, after all D01 packets. Its useful contracts and phase/ownership comments remove exactly 202 retained kernel identities: 176 missing attachments and 26 rationale candidates. Other ledger identities remain unchanged. This is a behavioral kernel increment with documentation, not a claim of comment-only token equivalence. The retained ledger is 3,597 identities: 2,835 attachments and 762 rationale candidates; all touched new source satisfies the blocking documentation gate. Kernel rationale still requires semantic review rather than filler.

The bounded classifier refinement accepts standalone own-body JSDoc and value-only selection, while negative fixtures preserve callable/nested/file-contract boundaries, meaningful outer/security phases and execution hidden in destructuring defaults/computed keys. All 52 checker fixtures pass. Running the old and new classifiers against the same combined tree gives exactly the same 3,684 live findings and identities: none of the ledger reduction is attributed to calibration. The three reported identity/barrier/SDK-cleanup examples remain adequate review-only candidates; strict rationale activation is still held. Full combined verification and exact delivery evidence belong on EVE-45/EVE-21/EVE-261, not inferred from these inventory counts.

Executed combined verification above immutable base `9af03961801dc6e6376da030332d92e11684f178`: `node --run verify` exited zero under the approved disposable PostgreSQL fixture, with cache disabled. Root checks and all 89 documentation fixtures passed; all 85 Nx tasks, source/declaration boundary audits and all three smoke targets plus 12 dependencies passed. Both boundary graphs have zero violations/cycles. The fixture/network were removed. Exact-head CI and signed source/graph revisions are separate asynchronous delivery evidence on the owning issues; this passing ratchet is not global documentation compliance.

## First D02 semantic checkpoint - 2026-11-17

This packet integrates the coordinator's delivered kernel/OTLP head `82320fc5bfbe2f0cb620604b1a6ec756d76e33da` before pruning. The four reserved runtime sources retain exact parsed TypeScript terminal kind/text sequences against that immutable base and have zero live findings. Documentation resolves 129 missing attachments and 12 rationale candidates; checker corrections are zero. No source-semantic unknown was established. The checker, exclusions, runtime behavior and callback contracts are unchanged.

| Reviewed runtime source | Semantic evidence and boundary | Ledger removals |
| --- | --- | --- |
| `action.ts` | Registered handlers retain their exact input/output/error schemas; registration and wire encoding do not grant caller authority or expose raw runtime errors. | 21 attachments |
| `execution.ts` | Refresh caller identity and bind approvals to the exact invocation; revalidate after transaction waits/replays and atomically commit receipts with durable state. | 17 attachments, 4 rationale |
| `host.ts` | Validate complete module ownership and registration before publication; unregister handlers before releasing their scoped layers so consumers cannot reach released resources. | 66 attachments, 7 rationale |
| `invocation.ts` | Canonical transport values and sanitized failure encoding preserve the wire boundary rather than trusting arbitrary caller objects or provider failures. | 25 attachments, 1 rationale |

The prune removes exactly 141 accepted identities: 3,597 to 3,456 retained identities, comprising 2,706 attachments and 750 rationale candidates. Completed: per-file semantic review, exact parsed-token proof, runtime lint/typecheck/build (7 tasks), runtime tests (16 files, 470 tests) and parity/typecheck (7 tasks). Current: separate clean-source graph delivery after full verification. Upcoming: the seven prepared runtime sources and reserved hook source in the next D02 packet, then D03-D06 and D07. Seven adequate candidates in that following packet and two read-only reviewed kernel bodies remain explicitly review-only; strict rationale activation is not authorized. Exact execution/delivery evidence is recorded on [EVE-13](https://linear.app/resnovas/issue/EVE-13) and [EVE-261](https://linear.app/resnovas/issue/EVE-261). D01's final CI rollup passed every executed check, including Code Quality; skipped release jobs did not deploy anything.

Executed `DOCUMENTATION_BASE=82320fc5bfbe2f0cb620604b1a6ec756d76e33da NX_SKIP_NX_CACHE=true node --run verify` under the approved disposable PostgreSQL fixture: exit zero, all 85 Nx tasks, all three smoke targets plus 12 dependencies, 89 documentation fixtures and 95 resource/boundary/type fixtures passed. Source and declaration graphs report zero violations/cycles. The fixture/network were removed. The initial attempt lacked the newly delivered approved OpenTelemetry package; `pnpm install --frozen-lockfile` repaired the orb installation without tracked dependency changes, then the identical uncached gate passed. Nx retained that earlier failure in its local flaky-task history; no failed target was suppressed or retried by a cloud service. No UI behavior changed and no deployment ran. This packet's checker remains unchanged; clean-source graph and exact-head CI follow separately.

## Second D02 source and hook checkpoint - 2026-11-17

The first packet was delivered at [c0719a76](https://github.com/Resnovas/Eventiva/commit/c0719a76a3e827f9e6faa56df1bf7f4065d091b7): signed source [ad42fa6f](https://github.com/Resnovas/Eventiva/commit/ad42fa6fc26f4a037dc62aa71d89e1373edc262c) and a separate signed clean-source graph commit. Independent `git ls-remote` matched that head. Graphify matched committed code, the post-commit immutable-base ratchet had zero violations, and exact-head CI follow-up is active rather than presumed green.

This packet compares against that actual immutable delivered head. All eight files retain exact parsed TypeScript terminal kind/text sequences and have zero blocking findings. Documentation resolves 224 attachments and 44 retained rationale candidates; checker corrections are zero. Seven adequate rationale candidates retain their original identities. No source-semantic unknown was established, no accepted identity was added, and exclusions/heuristics/runtime behavior are unchanged.

| Reviewed runtime source | Semantic evidence and boundary | Ledger removals |
| --- | --- | --- |
| `identity.ts` | Tenant-routed trusted records, intersected principal/human/delegation grants and explicit target grammar; membership barriers and optimistic writes do not trust presented authority. | 53 attachments, 9 rationale |
| `marketplace.ts` | Reauthorize before retry lookup and after delayed authority checks; metadata intent and outbox staging share an atomic storage owner, not private-record release. | 15 attachments, 4 rationale |
| `resource.ts` | Validate the active schema, tenant and revision before driver operations; historical values retain their original schema pins, while transaction admission uses wildcard resource authority. | 29 attachments, 9 rationale |
| `storage.ts` | Keep tenant/delegation routing, intent binding, receipt durability and transaction ownership explicit rather than imply that a persistence provider grants authorization. | 16 attachments, 4 rationale |
| `telemetry.ts` | Minimize static codes/attributes, strip unsafe details and bound scoped cleanup; tracer/logger installation shares one scoped minimizing policy. | 36 attachments, 7 rationale |
| `testing.ts` | Test-controlled identity/approval/policy reads stay fresh; staging, spooling and deterministic digest are explicitly volatile/test-only, not production durability or cryptography. | 30 attachments, 6 rationale |
| `trust.ts` | Trust, key/decryption, freshness and replay preflight are independent checks; verification alone cannot authorize private release. | 15 attachments, 2 rationale |
| `hook.ts` | Detached frozen generation pins, locked admission, drain-before-removal, validated durable claims and fresh release policy precede bounded delivery; retry preserves the delivery key because external work may already have happened. | 30 attachments, 3 rationale |

Retained adequate candidates are `identity` target grammar, authorizer target dispatch and profile membership barrier; `marketplace` enabled barrier; `resource` authorized transaction; `telemetry` paired scoped tracer/logger install; and `testing` missing/present approval selection. Adjacent contracts explain these bodies' constraints. Read-only review also confirms kernel `lookup` defers registry selection until serialized execution and kernel `resolve` authorizes the consumer before provider selection; both existing contracts are adequate. Their two retained identities are untouched. No safe general classifier exemption was established, so none is invented and no filler is added to make the inventory zero.

Exact pruning removes only this packet's 268 accepted identities: 3,456 to 3,188 across 104 files, comprising 2,482 attachments and 706 rationale candidates. Runtime's blocking attachment debt is zero, but its nine retained adequate rationale identities keep D02's strict-zero done signal open. Completed: semantic review, exact-token proof and the prior seven-source runtime/resource/telemetry test targets plus runtime lint/typecheck/build/parity. Current: combined eight-source immutable-base full verification and clean-source graph delivery. Upcoming: four reserved source-only D03 adapters after explicit shared-window handback, remaining D03-D06 and D07. Do not equate review completion with classifier clearance, global compliance, product acceptance or production authorization. Evidence is linked from EVE-13/EVE-261.

Executed `DOCUMENTATION_BASE=c0719a76a3e827f9e6faa56df1bf7f4065d091b7 NX_SKIP_NX_CACHE=true node --run verify` under the approved disposable PostgreSQL fixture: exit zero, all 85 Nx tasks and all three smoke targets plus 12 dependencies passed uncached. All 89 documentation fixtures and 95 resource/boundary/type fixtures passed; source/declaration graphs report zero violations/cycles. The fixture/network were removed. Exact parsed-token and 268-only prune assertions passed. Completed: local full verification. Current: clean-source graph delivery and asynchronous CI follow-up. This does not complete strict-zero acceptance or authorize production.

First-packet CI evidence is separate from local success: [attempt 1](https://github.com/Resnovas/Eventiva/actions/runs/44086269222/attempts/1) failed one runtime-suite case in unchanged `tests/telemetry/src/server.spec.ts`: the invalid-configuration subprocess returned `error.code=ETIMEDOUT` at its existing 10,000 ms bound (test elapsed 10,044 ms). The failed assertion did not record child signal/stdout/stderr, so no cause or harmless-flake conclusion is established. Parent [82320fc5 CI](https://github.com/Resnovas/Eventiva/actions/runs/44084089147) passed the same runtime case in 871 ms, and its telemetry/contracts executions in 862/819 ms.

Thirty local exact-child probes preserved all original status/redaction/failed-span/output assertions and the 10-second kill bound: 30 passed, 904-1,438 ms, status 1, null signal, no spawn error and empty stderr. This does not distinguish CI cold-loader/resource contention from bootstrap liveness. No executable runtime tokens or test code changed in response; no timeout inflation or test retries were added. One same-head failed-job rerun was requested as [attempt 2](https://github.com/Resnovas/Eventiva/actions/runs/44086269222/attempts/2); its result is pending, not substituted for the original failure. The inspected CI workflow runs verification and bounded disposable fixtures only, with no deployment/release/production operations; successful smoke was not repeated.

## D03 first adapters and bounded CI diagnostics - 2026-11-17

The coordinator returned shared outputs at independently fetched immutable main `1674f6fec4c3cf061794975dde61d6959a4afe75`, after the EVE-84 planning mirror. The final D02 packet is delivered at [8a1440bb](https://github.com/Resnovas/Eventiva/commit/8a1440bbbbc04e8f5bed2e7d253683600a713d00), with signed source [b195b2d5](https://github.com/Resnovas/Eventiva/commit/b195b2d5c80352cca25b6275d421c9d67ceff5ce) and a separate signed clean-source graph commit. Its [CI](https://github.com/Resnovas/Eventiva/actions/runs/44088005556) verify, smoke and application aggregate passed. This does not erase the earlier first-packet failures or establish their cause.

The first D03 packet documents exactly four reserved integration sources. Parsed TypeScript terminal kind/text sequences match that immutable base, and all four now have zero scanner findings. Documentation resolves 33 attachments and one rationale candidate; checker corrections are zero. No dependency, provider behavior, signature, exclusion or classifier changed.

| Reviewed integration source | Semantic boundary | Ledger removals |
| --- | --- | --- |
| `formatjs/src/i18n.ts` | Apply terminology only for the matching locale; retain canonical defaults and formatter-local deduplication of fallback diagnostics. | 3 attachments, 1 rationale |
| `openfeature-client/src/flags.ts` | Stable source precedence, one layer-time device context, closed lifecycle errors and scoped provider replacement; per-call targeting is deliberately ignored. | 14 attachments |
| `openfeature-server/src/flags.ts` | Same precedence and lifecycle ownership, with targeting flattened per evaluation rather than bound statically. | 14 attachments |
| `posthog-client/src/connect.ts` | Cache reads preserve absent/variant values; subscriptions return SDK cleanup owned by the provider. Existing capture opt-out settings are unchanged. | 2 attachments |

The earlier first-packet [CI rerun](https://github.com/Resnovas/Eventiva/actions/runs/44086269222/attempts/2) failed a different child in contracts-tests `server.spec.ts:168`: invalid-profile startup with optional telemetry disabled returned `ETIMEDOUT` under the unchanged 10-second bound; the whole two-launch case took 10,677 ms. The original redaction case passed in 635 ms. Neither failed run recorded signal/stdout/stderr, so cold-loader/resource contention and bootstrap liveness remain unproven alternatives. No further rerun, timeout inflation or retry was introduced.

The coordinator reserved `tests/telemetry/src/server.spec.ts` for a diagnostics-only change and approved source patch SHA256 `8643998591f535b3aed9abb17db8902d8f24d6b57200a7493b1762020cdc4d03` after independent full-patch reading and apply-check at `1674f6fe`. The coordinator did not apply or execute it; the focused execution below belongs to this lane. It adds one pure failure-context formatter and a message argument to each of seven existing launch-error assertions. It retains every original predicate, status/redaction/failed-span/output assertion, launch argument, isolated environment, 65,536-byte capture limit and 10,000 ms timeout. New context contains status/signal, a closed spawn-error code, and stdout/stderr summaries restricted to character counts and at most eight recognized diagnostic event names each. Arbitrary output, configuration, raw errors and launch environment are not serialized by the formatter. The existing assertion's actual error remains unchanged. A parsed-token subtraction proof removes only the formatter and seven message arguments and exactly recovers the original test's executable tokens.

The coordinator separately read [1674f6fe verify job 134058877336](https://github.com/Resnovas/Eventiva/actions/runs/44088916726/job/134058877336): the same opt-out invalid-profile child timed out in runtime-tests at the unchanged line 168 (whole case 10,836 ms), while the original redaction case passed in 736 ms and that opt-out case passed in contracts-tests in 1,253 ms. Only runtime-tests failed; smoke passed and the application aggregate failed downstream. This is additional recurrence evidence from the pre-diagnostics parent, not proof of cause. No new blind rerun was requested.

Documentation covers the test's affected callback identities and formatter-moved legacy callbacks rather than borrowing their old debt. Its 29 attachment findings are resolved. Three meaningful rationale improvements explain suite isolation, mandatory audit independence and persisted-record validation. Five other old rationale identities are replaced by changed diagnostic-assertion bodies, not counted as documentation fixes: their new candidates remain live and review-only. Alongside one unchanged audit-Exit candidate, all six test candidates have been read and have adequate adjacent contracts for their simple observe/assert bodies; no safe general classifier exemption is established. They are not added to accepted debt or claimed as strict-zero clearance.

Exact pruning removes 71 accepted identities from only these five files: 34 D03 findings plus 29 test attachments and eight old test rationale identities. The ledger shrinks from 3,188 to 3,117 across 100 files: 2,420 attachments and 697 rationale candidates. This is 62 attachment fixes, four rationale improvements and five explicitly explained identity replacements, not 71 semantic documentation fixes. The raw scanner still sees 789 rationale candidates, including five replacement identities and other candidates never admitted to debt. No source-semantic unknown was established in this packet; the CI timeout's cause remains unknown.

Executed focused checks: all 26 uncached Nx lint/typecheck/build/test tasks across the four integrations and their test projects passed. The corrected diagnostics source passed telemetry `tsc --noEmit`, ESLint and all seven unchanged server cases. A scratch-only real child printed invalid-config/telemetry canaries and arbitrary credential-shaped text, then remained alive: the unchanged timeout killed it after 10,011 ms with null status, `SIGTERM` and `ETIMEDOUT`. Its 6,600 stdout and 84 stderr characters became a 301-character diagnostic containing only the closed event names and counts; none of the canaries/arbitrary text survived. An injected unknown error-code canary was also excluded. The control was never applied to executable source. Completed: semantic/source review, focused checks and exact proofs. Current: coordinator diagnostics review, immutable-base full verification, documentation generation and clean-source graph delivery. Upcoming: remaining reserved D03 integration packets, D04-D06, and D07 only when strict zero is honestly attainable. EVE-13/EVE-261 retain the delivery and CI links; no platform or production acceptance is implied.

Executed combined `DOCUMENTATION_BASE=1674f6fec4c3cf061794975dde61d6959a4afe75 NX_SKIP_NX_CACHE=true node --run verify` under the approved disposable PostgreSQL fixture: exit zero. Root checks, all 89 documentation fixtures, all 95 resource/boundary/type fixtures, all 85 Nx lint/typecheck/test/build/parity tasks, and all three smoke targets plus 12 dependencies passed uncached. Source graph: 169 files and 596 edges, zero violations/cycles; emitted graph: 68 files and 259 edges, zero violations/cycles. The fixture/network were removed. Nx still reports its earlier local telemetry-build failure history, not a failure or cloud retry in this run. The complete final-D02 CI rollup also passed every executed check, including Code Quality; skipped release jobs did not deploy. Completed: coordinator source approval, focused/negative-control proofs and full local verification. Current: immutable-base post-evidence check, signed source/clean-graph delivery and asynchronous exact-head CI. Other packets and strict-zero acceptance remain open.

<!-- documentation:inventory:start -->
## Exact current inventory (generated)

3117 remaining findings across 100 files: 2420 mechanically missing JSDoc; 0 prose-review candidates; 697 internal-rationale review candidates. Review candidates are not asserted semantic policy violations. Exact declaration identities and source locations are in [debt.json](../../tools/documentation/debt.json).

| Batch | File | Missing JSDoc | Prose review | Rationale review |
| --- | --- | --- | --- | --- |
| D06 | [ai-docs/src/13_storage/01_transaction.ts](../../ai-docs/src/13_storage/01_transaction.ts) | 3 | 0 | 1 |
| D06 | [ai-docs/src/15_identity/01_host.ts](../../ai-docs/src/15_identity/01_host.ts) | 1 | 0 | 1 |
| D06 | [ai-docs/src/18_hooks/composition.ts](../../ai-docs/src/18_hooks/composition.ts) | 5 | 0 | 0 |
| D06 | [ai-docs/src/18_resources/01_resource.ts](../../ai-docs/src/18_resources/01_resource.ts) | 5 | 0 | 1 |
| D06 | [ai-docs/src/19_declarative-modules/02_screen-context.ts](../../ai-docs/src/19_declarative-modules/02_screen-context.ts) | 2 | 0 | 0 |
| D06 | [ai-docs/src/21_kernel/01_kernel.ts](../../ai-docs/src/21_kernel/01_kernel.ts) | 10 | 0 | 3 |
| D06 | [ai-docs/src/23_marketplace/02_durable.ts](../../ai-docs/src/23_marketplace/02_durable.ts) | 1 | 0 | 1 |
| D06 | [ai-docs/src/24_trust/01_preflight.ts](../../ai-docs/src/24_trust/01_preflight.ts) | 1 | 0 | 0 |
| D06 | [ai-docs/src/24_trust/02_replay.ts](../../ai-docs/src/24_trust/02_replay.ts) | 1 | 0 | 0 |
| D04 | [apps/client-e2e/src/shell.spec.ts](../../apps/client-e2e/src/shell.spec.ts) | 3 | 0 | 1 |
| D04 | [apps/client/src/App.tsx](../../apps/client/src/App.tsx) | 3 | 0 | 1 |
| D04 | [apps/client/src/i18n.ts](../../apps/client/src/i18n.ts) | 2 | 0 | 0 |
| D04 | [apps/server/src/access.ts](../../apps/server/src/access.ts) | 3 | 0 | 0 |
| D04 | [apps/server/src/backend.ts](../../apps/server/src/backend.ts) | 6 | 0 | 3 |
| D04 | [apps/server/src/cluster-actions.ts](../../apps/server/src/cluster-actions.ts) | 12 | 0 | 2 |
| D04 | [apps/server/src/cluster-profile.ts](../../apps/server/src/cluster-profile.ts) | 3 | 0 | 0 |
| D04 | [apps/server/src/cluster.ts](../../apps/server/src/cluster.ts) | 14 | 0 | 4 |
| D04 | [apps/server/src/main.ts](../../apps/server/src/main.ts) | 12 | 0 | 1 |
| D04 | [apps/server/src/status.ts](../../apps/server/src/status.ts) | 3 | 0 | 0 |
| D04 | [apps/server/tests/backend.spec.ts](../../apps/server/tests/backend.spec.ts) | 12 | 0 | 1 |
| D04 | [apps/server/tests/cluster.spec.ts](../../apps/server/tests/cluster.spec.ts) | 37 | 0 | 16 |
| D03 | [packages/integrations/posthog-client/src/flags.ts](../../packages/integrations/posthog-client/src/flags.ts) | 14 | 0 | 2 |
| D03 | [packages/integrations/posthog-server/src/flags.ts](../../packages/integrations/posthog-server/src/flags.ts) | 10 | 0 | 0 |
| D03 | [packages/integrations/sql/src/hook.ts](../../packages/integrations/sql/src/hook.ts) | 39 | 0 | 9 |
| D03 | [packages/integrations/sql/src/identity.ts](../../packages/integrations/sql/src/identity.ts) | 31 | 0 | 7 |
| D03 | [packages/integrations/sql/src/marketplace.ts](../../packages/integrations/sql/src/marketplace.ts) | 65 | 0 | 19 |
| D03 | [packages/integrations/sql/src/migrations.ts](../../packages/integrations/sql/src/migrations.ts) | 10 | 0 | 2 |
| D03 | [packages/integrations/sql/src/resource.ts](../../packages/integrations/sql/src/resource.ts) | 33 | 0 | 7 |
| D03 | [packages/integrations/sql/src/router.ts](../../packages/integrations/sql/src/router.ts) | 4 | 0 | 1 |
| D03 | [packages/integrations/sql/src/sqlite.ts](../../packages/integrations/sql/src/sqlite.ts) | 1 | 0 | 0 |
| D03 | [packages/integrations/sql/src/storage.ts](../../packages/integrations/sql/src/storage.ts) | 40 | 0 | 10 |
| D03 | [packages/integrations/sql/src/transaction.ts](../../packages/integrations/sql/src/transaction.ts) | 18 | 0 | 3 |
| D03 | [packages/integrations/sql/src/trust.ts](../../packages/integrations/sql/src/trust.ts) | 11 | 0 | 0 |
| D03 | [packages/integrations/sql/src/values.ts](../../packages/integrations/sql/src/values.ts) | 4 | 0 | 0 |
| D03 | [packages/integrations/telemetry.server/src/logger.ts](../../packages/integrations/telemetry.server/src/logger.ts) | 28 | 0 | 1 |
| D02 | [packages/runtime/src/identity.ts](../../packages/runtime/src/identity.ts) | 0 | 0 | 3 |
| D02 | [packages/runtime/src/kernel-runtime.ts](../../packages/runtime/src/kernel-runtime.ts) | 0 | 0 | 2 |
| D02 | [packages/runtime/src/marketplace.ts](../../packages/runtime/src/marketplace.ts) | 0 | 0 | 1 |
| D02 | [packages/runtime/src/resource.ts](../../packages/runtime/src/resource.ts) | 0 | 0 | 1 |
| D02 | [packages/runtime/src/telemetry.ts](../../packages/runtime/src/telemetry.ts) | 0 | 0 | 1 |
| D02 | [packages/runtime/src/testing.ts](../../packages/runtime/src/testing.ts) | 0 | 0 | 1 |
| D06 | [packages/ui-modules/src/DeclarativeModule.tsx](../../packages/ui-modules/src/DeclarativeModule.tsx) | 6 | 0 | 2 |
| D06 | [packages/ui-modules/src/declarative-registry.ts](../../packages/ui-modules/src/declarative-registry.ts) | 51 | 0 | 10 |
| D06 | [packages/ui-modules/src/screen-context.ts](../../packages/ui-modules/src/screen-context.ts) | 18 | 0 | 4 |
| D05 | [tests/boundaries/src/boundaries.spec.ts](../../tests/boundaries/src/boundaries.spec.ts) | 46 | 0 | 11 |
| D05 | [tests/contracts/src/action.spec.ts](../../tests/contracts/src/action.spec.ts) | 23 | 0 | 18 |
| D05 | [tests/contracts/src/flags.spec.ts](../../tests/contracts/src/flags.spec.ts) | 10 | 0 | 5 |
| D05 | [tests/contracts/src/hook.spec.ts](../../tests/contracts/src/hook.spec.ts) | 6 | 0 | 3 |
| D05 | [tests/contracts/src/identity.spec.ts](../../tests/contracts/src/identity.spec.ts) | 2 | 0 | 1 |
| D05 | [tests/contracts/src/inventory.spec.ts](../../tests/contracts/src/inventory.spec.ts) | 33 | 0 | 11 |
| D05 | [tests/contracts/src/module-manifest.spec.ts](../../tests/contracts/src/module-manifest.spec.ts) | 8 | 0 | 5 |
| D05 | [tests/contracts/src/storage.spec.ts](../../tests/contracts/src/storage.spec.ts) | 5 | 0 | 2 |
| D05 | [tests/integrations/formatjs/src/i18n.spec.ts](../../tests/integrations/formatjs/src/i18n.spec.ts) | 9 | 0 | 5 |
| D05 | [tests/integrations/openfeature-client/src/flags.spec.ts](../../tests/integrations/openfeature-client/src/flags.spec.ts) | 29 | 0 | 6 |
| D05 | [tests/integrations/openfeature-server/src/flags.spec.ts](../../tests/integrations/openfeature-server/src/flags.spec.ts) | 31 | 0 | 11 |
| D05 | [tests/integrations/posthog-client/src/flags.spec.ts](../../tests/integrations/posthog-client/src/flags.spec.ts) | 11 | 0 | 3 |
| D05 | [tests/integrations/posthog-server/src/flags.spec.ts](../../tests/integrations/posthog-server/src/flags.spec.ts) | 8 | 0 | 4 |
| D05 | [tests/resources/src/resource.spec.ts](../../tests/resources/src/resource.spec.ts) | 99 | 0 | 25 |
| D05 | [tests/resources/src/types.ts](../../tests/resources/src/types.ts) | 0 | 0 | 1 |
| D05 | [tests/runtime/src/action-types.spec.ts](../../tests/runtime/src/action-types.spec.ts) | 11 | 0 | 0 |
| D05 | [tests/runtime/src/execution.spec.ts](../../tests/runtime/src/execution.spec.ts) | 101 | 0 | 37 |
| D05 | [tests/runtime/src/hook-telemetry.spec.ts](../../tests/runtime/src/hook-telemetry.spec.ts) | 24 | 0 | 3 |
| D05 | [tests/runtime/src/hook.spec.ts](../../tests/runtime/src/hook.spec.ts) | 80 | 0 | 17 |
| D05 | [tests/runtime/src/host.spec.ts](../../tests/runtime/src/host.spec.ts) | 115 | 0 | 32 |
| D05 | [tests/runtime/src/identity.spec.ts](../../tests/runtime/src/identity.spec.ts) | 49 | 0 | 10 |
| D05 | [tests/runtime/src/kernel-runtime.spec.ts](../../tests/runtime/src/kernel-runtime.spec.ts) | 170 | 0 | 52 |
| D05 | [tests/runtime/src/kernel-telemetry.spec.ts](../../tests/runtime/src/kernel-telemetry.spec.ts) | 84 | 0 | 30 |
| D05 | [tests/runtime/src/marketplace.spec.ts](../../tests/runtime/src/marketplace.spec.ts) | 53 | 0 | 14 |
| D05 | [tests/runtime/src/parity.spec.ts](../../tests/runtime/src/parity.spec.ts) | 24 | 0 | 9 |
| D05 | [tests/runtime/src/storage.spec.ts](../../tests/runtime/src/storage.spec.ts) | 26 | 0 | 2 |
| D05 | [tests/runtime/src/trust.spec.ts](../../tests/runtime/src/trust.spec.ts) | 72 | 0 | 21 |
| D05 | [tests/schema/src/compose.spec.ts](../../tests/schema/src/compose.spec.ts) | 26 | 0 | 15 |
| D05 | [tests/schema/src/manifest.spec.ts](../../tests/schema/src/manifest.spec.ts) | 3 | 0 | 3 |
| D05 | [tests/schema/src/storage.spec.ts](../../tests/schema/src/storage.spec.ts) | 1 | 0 | 1 |
| D05 | [tests/storage/src/conformance.spec.ts](../../tests/storage/src/conformance.spec.ts) | 58 | 0 | 26 |
| D05 | [tests/storage/src/hook.spec.ts](../../tests/storage/src/hook.spec.ts) | 125 | 0 | 28 |
| D05 | [tests/storage/src/identity.spec.ts](../../tests/storage/src/identity.spec.ts) | 39 | 0 | 10 |
| D05 | [tests/storage/src/marketplace-process.spec.ts](../../tests/storage/src/marketplace-process.spec.ts) | 4 | 0 | 2 |
| D05 | [tests/storage/src/marketplace.spec.ts](../../tests/storage/src/marketplace.spec.ts) | 74 | 0 | 17 |
| D05 | [tests/storage/src/resource-process.spec.ts](../../tests/storage/src/resource-process.spec.ts) | 5 | 0 | 2 |
| D05 | [tests/storage/src/trust-process.spec.ts](../../tests/storage/src/trust-process.spec.ts) | 4 | 0 | 2 |
| D05 | [tests/storage/src/trust.spec.ts](../../tests/storage/src/trust.spec.ts) | 28 | 0 | 8 |
| D05 | [tests/telemetry/src/server.spec.ts](../../tests/telemetry/src/server.spec.ts) | 0 | 0 | 1 |
| D05 | [tests/telemetry/src/telemetry.spec.ts](../../tests/telemetry/src/telemetry.spec.ts) | 134 | 0 | 40 |
| D05 | [tests/ui-modules/src/declarative-module.spec.tsx](../../tests/ui-modules/src/declarative-module.spec.tsx) | 149 | 0 | 48 |
| D05 | [tests/ui-modules/src/screen-context.spec.ts](../../tests/ui-modules/src/screen-context.spec.ts) | 46 | 0 | 14 |
| D06 | [tools/ci/coverage-goal.ts](../../tools/ci/coverage-goal.ts) | 8 | 0 | 2 |
| D06 | [tools/ci/flaky-tests.ts](../../tools/ci/flaky-tests.ts) | 9 | 0 | 0 |
| D06 | [tools/dev/docs.ts](../../tools/dev/docs.ts) | 1 | 0 | 0 |
| D06 | [tools/release/changelog-renderer.ts](../../tools/release/changelog-renderer.ts) | 5 | 0 | 1 |
| D06 | [tools/release/changelogs.ts](../../tools/release/changelogs.ts) | 1 | 0 | 0 |
| D06 | [tools/release/config.ts](../../tools/release/config.ts) | 8 | 0 | 3 |
| D06 | [tools/release/nightly-version.ts](../../tools/release/nightly-version.ts) | 4 | 0 | 1 |
| D06 | [tools/release/nightly.ts](../../tools/release/nightly.ts) | 13 | 0 | 3 |
| D06 | [tools/release/preview.ts](../../tools/release/preview.ts) | 6 | 0 | 4 |
| D06 | [tools/release/release-preview.ts](../../tools/release/release-preview.ts) | 6 | 0 | 3 |
| D06 | [tools/release/release.ts](../../tools/release/release.ts) | 6 | 0 | 2 |
| D06 | [tools/release/sourcemaps.ts](../../tools/release/sourcemaps.ts) | 3 | 0 | 1 |
| D06 | [tools/typecheck/tests.ts](../../tools/typecheck/tests.ts) | 2 | 0 | 0 |
| D06 | [vitest.shared.ts](../../vitest.shared.ts) | 1 | 0 | 0 |
<!-- documentation:inventory:end -->
