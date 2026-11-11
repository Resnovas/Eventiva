# Eventiva before the Amp-led rebuild

**Functional historical reference only. Inspect for behaviour and lessons; do not copy this workspace as the implementation baseline.** Nothing here is an active production package, CI workflow, test suite or supported development command.

This archive implements Jonathan's full-reset decision in [EVE-242](https://linear.app/resnovas/issue/EVE-242), recorded on 2026-11-11 with the decision dated 2026-11-10. It preserves the workspace from main at [ae54174aa209be4c21f00226eebae8a01ed04df6](https://github.com/Resnovas/Eventiva/commit/ae54174aa209be4c21f00226eebae8a01ed04df6), including later evidence committed alongside the manual implementation. It is not a claim that every file was manually authored or that every historical command currently passes.

## Contents and provenance

The original relative layout is retained: `packages/` contains cluster-compose, cluster-tooling, core, databases (including pg), extensions, integrations (Kafka) and platforms, plus test-repo. The original root manifests, lockfile, Nx/TypeScript/lint configuration, patches, runtime notes, documentation, CI workflows and local actions are preserved beside them. The old Markdown root guide is named `README.before-reset.md`; the original agent instructions are `AGENTS.before-reset.md` so they are not automatically applied as current directory instructions.

- Kafka was introduced by Jonathan with the cluster-hook implementation in [2d90430](https://github.com/Resnovas/Eventiva/commit/2d90430cbf7d7cf5f36795ddda0828ff4f71d599) on 2026-04-03 and depends on the historical core.
- Test-repo was introduced with cluster tooling in [51f230c](https://github.com/Resnovas/Eventiva/commit/51f230cc769a0eaec523adb36809c2213db8d749) on 2026-04-04, with a dependency correction in [025bf9b](https://github.com/Resnovas/Eventiva/commit/025bf9b284e8b7a9c76244474026129ebedf5fba). Its generators and coverage templates are archived, not retained under active `tools/`.
- `packages/cluster-tooling/dts-docs/` preserves the old declaration-documentation tools. Current checks do not call them.
- `tests` is the original private `https://github.com/Eventiva/tests` gitlink at `a69ea5392411c129df5b85a9bd06134bc2063c01`. It is intentionally unpopulated and configured inactive with `update = none` in the current root `.gitmodules`. The `.gitmodules` in this archive is the original historical file. No tests were deleted or rewritten to pass a gate.

[`../packages-old`](../packages-old) is a distinct older snapshot and remains unchanged. Neither snapshot supersedes the other.

## Read without activating

Open the files directly or inspect history, for example:

```sh
git log --follow -- Examples/eventiva-before-amp/packages/core/src/index.ts
git show ae54174aa209be4c21f00226eebae8a01ed04df6:package.json
```

Old commands and links are preserved as evidence of their original context; they may assume the old repository root, installed dependencies, private test access or external services. Do not run the archived setup, generators, workflows or infrastructure commands as part of current repository setup. Reproducing a historical runtime is separate work requiring its own disposable environment and approval for external effects.

## Current source of direction

Follow [EVE-13](https://linear.app/resnovas/issue/EVE-13) and the current root [AGENTS.md](../../AGENTS.md), not archived instructions. The sequence is EVE-242 acceptance, [EVE-243](https://linear.app/resnovas/issue/EVE-243) Smartcloud enrollment, then [EVE-244](https://linear.app/resnovas/issue/EVE-244) fresh workspace and testing foundation. Old tests can inform requirements but do not constrain the new architecture by default. EVE-23 must not restart on this archive as a baseline.
