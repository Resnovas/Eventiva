# ADR-0002: Module Boundaries, Portability, and Package Structure

- Status: Accepted
- Date: 2026-11-21
- Owners: Architecture & Tooling

## Context

Eventiva shares contracts and schema composition across Node 24 server processes, web browsers, and React Native's Hermes runtime, while isolating vendor SDKs, SQL drivers, and Effect Cluster infrastructure in dedicated integration and application shells. Without strict mechanical enforcement, server-only packages, Node built-ins, barrel re-exports, duplicate Effect instances, or open vendor type escapes can silently leak into portable bundles or public declarations.

## Decision

1. **Three-axis Nx tag taxonomy**: Every project carries one `type:*`, one `layer:*`, and one `capability:*` tag in `project.json`, enforced by `@nx/enforce-module-boundaries` in `eslint.config.mjs` and verified against deliberate negative fixtures in `tests/boundaries/fixtures/` (`tests/boundaries/src/boundaries.spec.ts`):
   - Types depend strictly downward (`type:core` -> `type:shared` -> `type:runtime` / `type:integration` / `type:extension` -> `type:platform`, with `type:test` unrestricted).
   - `layer:frontend` and `layer:backend` never cross; both may depend on `layer:shared`.
   - Capabilities depend only on the contracts they implement; Nx flags dependency cycles on the real workspace graph.
2. **Effect-only portable core and action runtime**: Projects tagged `type:core`, `type:shared`, or `capability:actions` may externally import `effect` and `effect/*` only. Database drivers, vendor SDKs, `@effect/platform-node`, and `@effect/cluster` enter exclusively through apps and integration packages.
3. **Tag-driven ESLint file globs and core rules for Node built-ins**: `eslint.config.mjs` computes flat-config `files` globs from `project.json` tags at config load time rather than hardcoding directory conventions. Because Nx's dependency graph does not classify Node built-ins as external packages, portable and runtime scopes additionally enforce ESLint `no-restricted-imports` and `no-restricted-globals` for Node built-ins and globals.
4. **Explicit named exports and no barrels**: `ExportAllDeclaration` (`export *`) is banned across `packages/**/src/**/*.ts` so every package subpath stays tree-shakeable and explicit.
5. **Single shared `effect` peer dependency**: Every library package whose source imports `effect` must declare `effect` under `peerDependencies` with `catalog:` and never under `dependencies`, ensuring one Effect runtime instance and shared `Context.Tag` identity across the workspace.
6. **Direct workspace TypeScript resolution via `@eventiva/source`**: Internal packages expose `@eventiva/source` export conditions pointing to `./src/*.ts` so Metro (`apps/client/metro.config.js`), TypeScript, and Vitest resolve workspace packages without an intermediate build step. Emitted declaration auditing (`tools/resources/boundaries.mjs`) explicitly strips `@eventiva/source` so consumer `.d.ts` resolution is validated against published declarations rather than development source.
7. **Closed `Data.TaggedError` public declarations**: Public error classes in `packages/contracts/src/storage.ts` and `packages/schema/src/compose.ts` bind `Data.TaggedError` bases to intermediate constants with explicit closed constructor types (`new (fields) => Cause.YieldableError & Fields & { readonly _tag }`) before subclassing so emitted `.d.ts` files never leak Effect's open vendor generic.
8. **AST-pinned reflection ingress and isolated syntax binding**: Under EVE-263, `canonicalJson` in `packages/runtime/src/invocation.ts` is the sole permitted `unknown`-typed private reflection ingress (reading own properties exclusively via `Object.getOwnPropertyDescriptor` to prevent getter or Proxy trap execution). `tools/resources/boundaries.mjs` pins its whole-function SHA-256 AST fingerprint before `ts.createProgram` binds the file (because TypeScript binding mutates `node.flags` in place). The type-escape gate binds each source file in isolation (`noResolve: true`, `noLib: true`), treats unbound `Schema` identifiers as Effect Schema while respecting local shadowing, and delegates broken or source-targeting module edges to the separate workspace graph gate.

## Consequences

- Portable packages bundle cleanly for browsers and compile to Hermes bytecode with zero Node or vendor SDK leakage.
- Adding a new package requires explicit tags, explicit subpath exports, and a `catalog:` Effect peer dependency.
- Any structural edit to `canonicalJson` fails `tools/resources/boundaries.mjs` until explicitly re-reviewed and re-pinned.

## References

- `eslint.config.mjs`
- `apps/client/metro.config.js`
- `packages/contracts/src/storage.ts`
- `packages/schema/src/compose.ts`
- `packages/runtime/src/invocation.ts`
- `tests/boundaries/src/boundaries.spec.ts`
- `tools/resources/boundaries.mjs`
