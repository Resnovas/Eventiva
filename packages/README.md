# Production packages

The platform packages from [EVE-244](https://linear.app/resnovas/issue/EVE-244):

- `contracts`: `@eventiva/contracts`, portable action specifications, platform errors, flag, i18n and telemetry contracts.
- `schema`: `@eventiva/schema`, the module manifest schema.
- `runtime`: `@eventiva/runtime`, handler registration and the action host.
- `integrations/*`: vendor integrations (FormatJS, OpenFeature, PostHog) behind the contracts.

Each package exports subpaths only, has no root barrel and sets `"sideEffects": false`. Tests live under [`tests/`](../tests). Read [the foundation guide](../docs/foundation.md) for boundaries, targets and an example, and follow [EVE-13](https://linear.app/resnovas/issue/EVE-13) and the current [AGENTS.md](../AGENTS.md).

The two snapshots under [Examples](../Examples) are historical reference only, not implementation baselines.
