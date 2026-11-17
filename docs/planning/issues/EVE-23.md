<!-- linear:generated:start -->
# EVE-23: Split core into portable contracts and backend runtime, with a shared schema package

[Live Linear source](https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared) | [Issue index](README.md) | [Maintained timeline](../timeline.md)

Snapshot: 2026-11-17; Linear updated: 2026-11-15T22:28:43.113Z. Generated source mirror; edit Linear and refresh, not this region.

| Field | Value |
| --- | --- |
| Status | Done (completed) |
| Priority | 0: No priority |
| Labels | Code, Refactor |
| Project | Eventiva platform foundations |
| Archived | No |
| Parent | [EVE-13](EVE-13.md) |
| Children | None recorded |
| Blocked by | None recorded |
| Blocks | [EVE-40](EVE-40.md), [EVE-42](EVE-42.md), [EVE-64](EVE-64.md), [EVE-68](EVE-68.md), [EVE-82](EVE-82.md), [EVE-98](EVE-98.md), [EVE-257](EVE-257.md), [EVE-258](EVE-258.md) |
| Related to | [EVE-28](EVE-28.md), [EVE-32](EVE-32.md), [EVE-33](EVE-33.md), [EVE-67](EVE-67.md), [EVE-80](EVE-80.md), [EVE-128](EVE-128.md), [EVE-133](EVE-133.md), [EVE-146](EVE-146.md), [EVE-170](EVE-170.md), [EVE-242](EVE-242.md), [EVE-244](EVE-244.md), [EVE-261](EVE-261.md) |
| Duplicate of | None recorded |

## Publication omissions and authority

Enumerated visible EVE set: 259; mirrored: 258. Enumeration timestamp: 2026-11-17T07:42:41.684Z. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.

Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.

## Linear description

## Binding architecture approval — 2026-11-14

Jonathan approved this architecture on 2026-11-14 after the <issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" />, <issue id="dc89a6af-338c-417b-a352-80cbfb05ec1e" label="EVE-40" href="https://linear.app/resnovas/issue/EVE-40/p11-build-the-action-contract-and-inventory-in-effect-schema" />, <issue id="e4fa521d-c5d2-4f24-ab86-ed41def53953" label="EVE-42" href="https://linear.app/resnovas/issue/EVE-42/p13-build-the-storage-layer-drizzle-on-postgres-and-sqlite-state" /> and <issue id="57425d1f-fae5-49c9-af1e-51cd26f64d20" label="EVE-244" href="https://linear.app/resnovas/issue/EVE-244/scaffold-the-fresh-nx-expo-effect-and-testing-foundation" /> research review. This is architecture approval only: it does not start implementation, approve unlisted dependencies, provision services, change spending limits, or re-enable paid AI gates.

This issue now implements a clean three-package boundary rather than extracting or preserving the archived core:

1. `@eventiva/contracts` (`type:core`, `layer:shared`; Effect peer only) owns portable action specifications and cross-runtime contracts.
2. `@eventiva/schema` (`type:shared`, `layer:shared`) owns database-neutral resources/fields and pure schema composition, replacing global registries and `defineExtensionTable` coupling.
3. `@eventiva/runtime` (`type:runtime`, `layer:backend`) owns Effect v3 execution/composition, ActionHost, authorization, audit, lifecycle and local dispatch; no driver/vendor SDK and no domain-specific handlers.

Features split into portable, `.server` and `.client` packages as required. Integrations/apps alone import drivers, vendor SDKs, Node platform layers or Cluster. Use explicit subpath exports, no root barrel, `sideEffects: false`, shared Effect singleton, acyclic Nx directions and portability gates for TypeScript, lint/import bans, browser bundling and Expo/Hermes.

Action specification and Effect handler are separate. A handler registers against exactly one specification. Dynamic modules register/unregister compatible manifests transactionally and dispose routes, actions, projections, listeners and scoped resources safely.

Any older extraction/legacy-API direction below is historical and superseded by this approval; rewrite it before implementation so implementers receive one unambiguous specification.

## Scope correction from Jonathan - stop current extraction

Decision recorded 2026-11-10: the current implementations under packages/cluster-compose, packages/cluster-tooling, packages/core, packages/databases (including pg), packages/extensions and packages/platforms were manually created legacy implementations. They are functional reference material but are not the implementation baseline for the Amp-led rebuild. They must be archived under Examples in a clearly named legacy location, preserving history and allowing agents to inspect behavior, and the production package foundations must then be designed cleanly from the approved specifications and current house standards.

Do not land the behavior-preserving package extraction attempted before this clarification. No commit-hook exception is approved or needed for relocating its legacy internals into new production packages. Stop before commit or push, preserve the uncommitted work only long enough to report/recover any useful inventory, then revert it safely. Before moving the current package tree, resolve the archive destination because Examples/packages-old already exists; do not overwrite or merge two legacy snapshots silently.

<issue id="c31b6b08-1532-4a7a-945f-24a70bbab765" label="EVE-23" href="https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared" /> must be re-scoped after the archive/reset to create new portable contracts, runtime and schema package boundaries from scratch. Legacy code is evidence and may inform tests/contracts, but is not copied by default. Behavior that remains required must be justified by the approved product specification rather than preserved solely because the old code implemented it.

## Goal

Web and native code can import Eventiva's core contracts without pulling in drivers, cluster runtime or Node APIs, and extensions get schema helpers without importing database drivers.

## Context

* Decisions D5 and D6 on <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> (2026-10-31).
* At 322ab45 `packages/core` is tagged `type:core`, `layer:backend` and depends on `@effect/cluster`, `@effect/sql-pg`, `@effect/sql-mysql2`, `@effect/platform-node`, `drizzle-orm` beta and more. Its `src/` mixes contracts (config schemas, hook types, typeid) with runtime (cluster platform, SQL layers, observability).
* Extensions import `type:database` for helpers like `defineExtensionTable`.
* Packaging rule from <issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" />: one entry point per module, `sideEffects: false`, no barrels that pull drivers or vendors.

## Work

1. Inventory every export of `packages/core/src/index.ts` and classify it: portable contract (no IO, no Node, no driver) or backend runtime.
2. Create `packages/core-contracts` (`type:core`, `layer:shared`, zero workspace dependencies, `effect` only) and move portable items there; keep runtime in `packages/core` (or rename to `core-runtime`) depending on contracts.
3. Create a `type:shared` schema package for Drizzle-neutral schema helpers; move `defineExtensionTable` and column facades; update extensions; then remove `type:database` from the extension constraint in `eslint.config.mjs` and update `module-boundaries.md` to match.
4. Add a lint fixture proving a `layer:frontend` package can import contracts and cannot import runtime.
5. Keep behaviour identical: all existing tests pass unchanged; never weaken a test.

## Acceptance

`pnpm exec nx run-many -t lint,typecheck,build,test` passes (paste output); a bundle of core-contracts contains no driver or Node import (show the check); graph refreshed.

## Done signal

Landed per the delivery rule (<issue id="5c7aeec2-d49c-4028-9eca-1bc641d3618c" label="EVE-13" href="https://linear.app/resnovas/issue/EVE-13/establish-modular-core-foundations-for-database-adapters-expo-and" /> item 12); comment with evidence.

## Linear comments (4)

### Comment 635b4fa7-b65c-4473-8848-1bd576b64f69

Author: GitHub. Created: 2026-10-31T21:49:38.427Z; updated: 2026-10-31T21:49:38.397Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared) (comment ID above). Parent: None. Resolved: Not recorded.

This comment thread is synced to a corresponding [GitHub issue](https://github.com/Resnovas/Eventiva/issues/790). All replies are displayed in both locations.


### Comment dbdb9164-6a6c-40c0-a60f-e4d6c4ccecb4

Author: jonathan@resnovas.com. Created: 2026-11-10T23:51:45.962Z; updated: 2026-11-10T23:51:45.896Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared) (comment ID above). Parent: None. Resolved: Not recorded.

Implementation update from Amp (autonomous). Scope clarification received from the originating thread: EVE-23 extracts driver-free schema building and preserves existing synchronous Drizzle/PostgreSQL behavior. This does not claim full ORM or dialect neutrality. Adapter injection and genuine dialect-neutral generalization remain in EVE-42, with compatibility imports documented. No new third-party dependency is required.

Baseline at ae54174aa209be4c21f00226eebae8a01ed04df6: the exact acceptance command recursively selects eventiva:lint/test (root aggregate scripts select themselves); stopped the runaway process. After initializing the existing tests submodule unchanged for this test task, the package-only command stops at @nx/js:typescript-sync: Missing root "tsconfig.json". Recording these pre-existing gate blockers separately from the split. Further targeted verification will use --exclude=eventiva --skipSync and report all failures honestly.


### Comment b1fe4860-87ea-4daf-aa73-c0a7a41eb70f

Author: jonathan@resnovas.com. Created: 2026-11-11T00:12:47.327Z; updated: 2026-11-11T00:12:47.277Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared) (comment ID above). Parent: None. Resolved: Not recorded.

Amp update (autonomous agent): followed Jonathan's prepended scope correction and stopped the extraction. No commit, push, deployment or commit-hook bypass occurred. The earlier request for a legacy relocation exception is withdrawn; no exception is needed for this abandoned approach.

Confirmed ownership before reverting: 47 tracked modified files, 48 untracked files, nothing staged. Restored only those tracked paths from the unchanged HEAD and removed only this attempt's new files/directories and generated build output. Restored the installed dependency graph with .agents/setup (exit 0, Orb setup ready). The initialized private tests submodule is clean and remains at its recorded revision. Examples/packages-old, the existing package tree and graphify-out are unchanged.

Exact final git status:

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

HEAD remains ae54174aa209be4c21f00226eebae8a01ed04df6. git status --porcelain=v1 --untracked-files=all returned no output; git diff --exit-code HEAD -- . passed.

Useful reference only: inventoried 243 existing core exports (the discarded attempt had one additional createTable export). The classified inventory and exact pre-revert status are retained as review attachments in https://ampcode.com/threads/T-01a1c7d6-9130-71b8-b9d6-acf8cb80490e, explicitly labeled abandoned, not approved foundation design. No implementation snapshot is being proposed for reuse.

Safest next step: Jonathan chooses a new, non-colliding archive destination, for example Examples/legacy-manual-platform-2026-11-10/packages/. Then move only the named legacy directories using history-preserving Git renames, leave Examples/packages-old unchanged, and update active workspace references. Examples/** is already excluded by .nxignore. Re-scope EVE-23 against approved specifications after that reset. No dependency is unblocked; EVE-40 remains waiting on the replacement EVE-23 foundation.


### Comment 394d211c-7824-41d7-a30d-6b6777d3c5ce

Author: jonathan@resnovas.com. Created: 2026-11-15T03:23:58.855Z; updated: 2026-11-15T03:23:58.532Z. [Live discussion source](https://linear.app/resnovas/issue/EVE-23/split-core-into-portable-contracts-and-backend-runtime-with-a-shared) (comment ID above). Parent: None. Resolved: Not recorded.

Amp update (autonomous agent): EVE-23 implementation landed on main by direct push under the Eventiva delivery exception. No PR, no new dependency, no change to Smartcloud safeguards or AI-overage controls. docs/architecture/eventiva-platform-and-marketplace.md was not touched.

**Commits** (rebased onto origin/main d0f582c just before the push; pushed `d0f582c..7df4217`):
- [3e1ab01](https://github.com/Resnovas/Eventiva/commit/3e1ab01) feat(platform): complete the EVE-23 contracts, schema and runtime boundaries
- [7df4217](https://github.com/Resnovas/Eventiva/commit/7df4217) chore(graphify): refresh the code graph (EVE-23)

**Audit of EVE-244.** It already had: the spec/handler split (`define` / `implement`), subpath exports with `sideEffects: false`, the effect peer singleton, the type/layer/capability tags, scoped all-or-nothing action registration, and fixtures F1-F6, F8, F9 and F10 (formatjs).

It lacked: caller and authorisation contracts, ids, security profiles, a permission on each spec, database-neutral fields, resources and composition, authorisation in the action path, module-scoped resources and disposal, schema registration, a runtime import ban, a cycle check, and the bundle and Hermes checks.

**Added**
- `@eventiva/contracts`:
  - `./caller`: `Caller`, `CallerIdentity`, and `Authorizer` with `canInvoke` and `check`.
  - `./ids`: branded UUID `TenantId`, `SubjectId` and `SessionId`.
  - `./security`: `SecurityProfile` and `isWeaker`.
  - A required `permission` on every action spec, and the `Forbidden` platform error.
- `@eventiva/schema`:
  - `./field` and `./resource`: no driver, no column types and no tenant id.
  - `./compose`: pure, order-independent, no global registry, with typed errors `DuplicateResource`, `DuplicateField`, `UnknownTarget`, `WeakerClassification` and `InvalidName`.
  - Manifests gain an optional `resources` list.
- `@eventiva/runtime`:
  - `invoke` runs in this order: flag gates, then `canInvoke` before decode, then decode, then `check` on the decoded input, then the handler. The Caller is read on every call.
  - `register` now also checks resources and composition. It builds an optional module `layer` in a child scope and fails with `ActivationFailed` if the layer fails, releasing what it acquired. On scope close it removes the module first and releases the layer second, exactly once.
  - `ActionHost.schema` returns the composed schema of registered modules.
- Boundaries:
  - The runtime (`capability:actions`) may import only effect and no Node built-ins.
  - New tests: F7 cycle check against the real packages; F11 runtime ban; F12 browser bundle of every contracts and schema subpath contains only those packages and the effect dependency closure, with no Node import; F13 a one-subpath bundle drops the rest; F14 React Native's own `hermes-compiler` compiles the bundle.
  - The bundle checks use the Vite already installed; esbuild, publint and attw were not added. A mutation that imported `node:fs` into contracts failed F12, then was reverted.
- `apps/server`: a deny-by-default Authorizer granting its own service identity `platform.status` only.
- Docs: `docs/foundation.md`, `ai-docs/src/11_foundation`, `packages/README.md`, and a regenerated `LLMS.md`.

**Evidence**
```text
$ node --run verify        # on 3e1ab01 before rebase
NX   Successfully ran targets lint, typecheck, test, build for 20 projects
NX   Successfully ran target smoke for 3 projects and 10 tasks they depend on
VERIFY EXIT 0
$ node apps/server/dist/main.js
INFO Eventiva runtime ready { runtime: 'eventiva', actions: [ 'platform.status' ] }
tests: boundaries 24, runtime 21, contracts 12, schema 10, integrations 21, all passed;
coverage runtime host.ts 98.6% stmts, schema 100% stmts / 93.9% branches (gate 90%)
$ pnpm nx run-many -t lint typecheck test build   # on final rebased 7df4217
NX   Successfully ran targets lint, typecheck, test, build for 20 projects
$ node --run check   # on 7df4217
toolchain pins agree; agent files up to date; 65 source files carry the licence header; LLMS.md is up to date
$ pnpm nx sync:check
All files are up to date.
$ sh tools/graphify/graphify update
nodes 13382, edges 13500 (no build output in graph)
```
A CI subscription is watching 7df4217.

**Left out of EVE-23, by design:** action inventory, JSON Schema, receipts and audit observer (EVE-40); storage adapters that compile `compose` output into tables (EVE-42); real authorisation policy; Cluster dispatch.

**Found, not fixed here:** the test projects' Nx `typecheck` target is an echo placeholder, because their tsconfig sets `noEmit`. For this change I ran `tsc -p tests/<project>/tsconfig.json --noEmit` for runtime, contracts, schema and boundaries, and all were clean.
<!-- linear:generated:end -->

## Repository context (human-maintained)

Add implementation notes here, with source links. This section never grants owner approval.
