# Production packages

The platform packages from [EVE-244](https://linear.app/resnovas/issue/EVE-244):

- `contracts`: `@eventiva/contracts`, portable action specifications, callers and authorisation, platform errors, identifiers, security profiles, flag, i18n and telemetry contracts.
- `schema`: `@eventiva/schema`, database-neutral resources and fields, pure schema composition and the module manifest.
- `runtime`: `@eventiva/runtime`, handler registration, module lifecycle and the authorised action host.
- `integrations/*`: vendor/platform adapters behind contracts, including FormatJS, OpenFeature, PostHog, privileged SQL storage, the local Node telemetry sink and default-off governed OTLP span export.
- `ui-modules`: `@eventiva/ui-modules`, the frontend extension library for declarative UI registration and interpretation.

Each package exports subpaths only, has no root barrel and sets `"sideEffects": false`. Tests live under [`tests/`](../tests). Read [the foundation guide](../docs/foundation.md) for boundaries, targets and an example, and follow [EVE-13](https://linear.app/resnovas/issue/EVE-13) and the current [AGENTS.md](../AGENTS.md).

## Package boundaries

Use the exact [type, layer and capability tables](../docs/foundation.md#boundaries), derived from [`eslint.config.mjs`](../eslint.config.mjs). All matching constraints apply together. Same-type library imports are permitted only when the layer/capability rules and cycle checks also permit them; `type:test` does not bypass its layer. Contracts are `type:core`, schema is `type:shared`, runtime is `type:runtime`, adapters are `type:integration`, and UI modules are `type:extension`. There is no active database type or exemption for type-only imports.

For example, a frontend extension may import contracts/schema but not runtime or an integration. Runtime and telemetry.server both depend on the neutral telemetry contract, not each other; the server app composes them. SQL is available only through the privileged storage composition, not by importing a database adapter into an extension. The resource source/declaration audits impose additional restrictions beyond ESLint's tag table.

Run `pnpm nx test @eventiva/boundaries-tests` for executable import-denial, package-export and portable-bundle checks. If a dependency constraint fails, move the dependency to its owning layer; do not loosen tags or copy the archived core/database rules. See [coordinated validation](../docs/foundation.md#coordinated-module-validation) for the separate resolved-graph and emitted-declaration gates.

The two snapshots under [examples](../examples) are historical reference only, not implementation baselines.
