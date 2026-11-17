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

<!-- documentation:inventory:start -->
## Exact current inventory (generated)

4036 remaining findings across 131 files: 3232 mechanically missing JSDoc; 0 prose-review candidates; 804 internal-rationale review candidates. Review candidates are not asserted semantic policy violations. Exact declaration identities and source locations are in [debt.json](../../tools/documentation/debt.json).

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
| D01 | [packages/contracts/src/caller.ts](../../packages/contracts/src/caller.ts) | 2 | 0 | 0 |
| D01 | [packages/contracts/src/flags.ts](../../packages/contracts/src/flags.ts) | 3 | 0 | 0 |
| D01 | [packages/contracts/src/hook.ts](../../packages/contracts/src/hook.ts) | 19 | 0 | 0 |
| D01 | [packages/contracts/src/i18n.ts](../../packages/contracts/src/i18n.ts) | 2 | 0 | 1 |
| D01 | [packages/contracts/src/identity.ts](../../packages/contracts/src/identity.ts) | 7 | 0 | 0 |
| D01 | [packages/contracts/src/inventory.ts](../../packages/contracts/src/inventory.ts) | 19 | 0 | 5 |
| D01 | [packages/contracts/src/json-schema.ts](../../packages/contracts/src/json-schema.ts) | 10 | 0 | 1 |
| D01 | [packages/contracts/src/machine.ts](../../packages/contracts/src/machine.ts) | 1 | 0 | 0 |
| D01 | [packages/contracts/src/marketplace-durable.ts](../../packages/contracts/src/marketplace-durable.ts) | 8 | 0 | 0 |
| D01 | [packages/contracts/src/marketplace.ts](../../packages/contracts/src/marketplace.ts) | 14 | 0 | 0 |
| D01 | [packages/contracts/src/module-policy.ts](../../packages/contracts/src/module-policy.ts) | 4 | 0 | 0 |
| D01 | [packages/contracts/src/observability.ts](../../packages/contracts/src/observability.ts) | 6 | 0 | 0 |
| D01 | [packages/contracts/src/resource.ts](../../packages/contracts/src/resource.ts) | 48 | 0 | 8 |
| D01 | [packages/contracts/src/security.ts](../../packages/contracts/src/security.ts) | 1 | 0 | 0 |
| D01 | [packages/contracts/src/storage.ts](../../packages/contracts/src/storage.ts) | 26 | 0 | 0 |
| D01 | [packages/contracts/src/trust.ts](../../packages/contracts/src/trust.ts) | 15 | 0 | 0 |
| D01 | [packages/contracts/src/ui-module.ts](../../packages/contracts/src/ui-module.ts) | 8 | 0 | 0 |
| D03 | [packages/integrations/formatjs/src/i18n.ts](../../packages/integrations/formatjs/src/i18n.ts) | 3 | 0 | 1 |
| D03 | [packages/integrations/openfeature-client/src/flags.ts](../../packages/integrations/openfeature-client/src/flags.ts) | 14 | 0 | 0 |
| D03 | [packages/integrations/openfeature-server/src/flags.ts](../../packages/integrations/openfeature-server/src/flags.ts) | 14 | 0 | 0 |
| D03 | [packages/integrations/posthog-client/src/connect.ts](../../packages/integrations/posthog-client/src/connect.ts) | 2 | 0 | 0 |
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
| D02 | [packages/runtime/src/action.ts](../../packages/runtime/src/action.ts) | 21 | 0 | 0 |
| D02 | [packages/runtime/src/execution.ts](../../packages/runtime/src/execution.ts) | 17 | 0 | 4 |
| D02 | [packages/runtime/src/hook.ts](../../packages/runtime/src/hook.ts) | 30 | 0 | 3 |
| D02 | [packages/runtime/src/host.ts](../../packages/runtime/src/host.ts) | 66 | 0 | 7 |
| D02 | [packages/runtime/src/identity.ts](../../packages/runtime/src/identity.ts) | 53 | 0 | 12 |
| D02 | [packages/runtime/src/invocation.ts](../../packages/runtime/src/invocation.ts) | 25 | 0 | 1 |
| D02 | [packages/runtime/src/kernel-runtime.ts](../../packages/runtime/src/kernel-runtime.ts) | 176 | 0 | 28 |
| D02 | [packages/runtime/src/marketplace.ts](../../packages/runtime/src/marketplace.ts) | 15 | 0 | 5 |
| D02 | [packages/runtime/src/resource.ts](../../packages/runtime/src/resource.ts) | 29 | 0 | 10 |
| D02 | [packages/runtime/src/storage.ts](../../packages/runtime/src/storage.ts) | 16 | 0 | 4 |
| D02 | [packages/runtime/src/telemetry.ts](../../packages/runtime/src/telemetry.ts) | 36 | 0 | 8 |
| D02 | [packages/runtime/src/testing.ts](../../packages/runtime/src/testing.ts) | 30 | 0 | 7 |
| D02 | [packages/runtime/src/trust.ts](../../packages/runtime/src/trust.ts) | 15 | 0 | 2 |
| D01 | [packages/schema/src/compose.ts](../../packages/schema/src/compose.ts) | 20 | 0 | 0 |
| D01 | [packages/schema/src/field.ts](../../packages/schema/src/field.ts) | 6 | 0 | 1 |
| D01 | [packages/schema/src/storage.ts](../../packages/schema/src/storage.ts) | 2 | 0 | 0 |
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
| D05 | [tests/telemetry/src/server.spec.ts](../../tests/telemetry/src/server.spec.ts) | 29 | 0 | 9 |
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
