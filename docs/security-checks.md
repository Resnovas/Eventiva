<!-- Synced from Resnovas/.github templates/docs/security-checks.md. Edit it there. -->
# Adopt the security checks

Seven checks keep insecure code out of a deploy: secrets, row-level security, unguessable IDs, admin gating, test credentials, rate limits, and input validation with bound SQL and no raw HTML. The `security-checks` agent skill explains every rule, why it exists and how to fix a finding. This page covers adoption only. The tooling adds no dependency: it uses the ESLint already required by the house funnel.

## What ships

| File | Role |
| --- | --- |
| `tools/lint/security.mjs` | ESLint rules under `house-security/` and four configs: `security` (every editable source), `securityClient` (client bundles), `securityServer` (server entry points) and `securityDeclarations(list)` (required properties on registrations). |
| `tools/security/scan.mjs` | Dependency-free scanner: `--tracked` (committed secrets and data-file credentials), `--bundle DIR` (built client bundle), `--postgres DIR` (RLS, BYPASSRLS, sequential keys), `--sqlite DIR` (sequential keys), `--baseline FILE`. |

## Enable in a repository

1. Add the lint configs after the existing parser in `eslint.config.mjs`, in the `house:local` section, with the repository's own globs:

```js
import { security, securityClient, securityServer, securityDeclarations } from './tools/lint/security.mjs'

export default [
  ...existingConfig,
  { ...security, files: sources, ignores: ['path/to/migration-runner.ts'] },
  { ...securityClient, files: clientSources },
  { ...securityServer, files: serverEntryPoints },
  { ...securityDeclarations([{ callee: 'Action.define', argument: 1, properties: ['permission', 'rateLimit'], message: 'Every action declares its permission and rate limit.' }]), files: sources },
]
```

   The only allowed `ignores` for `no-raw-sql` is the migration runner that executes statements read from reviewed migration files. Publishable-by-design public variables go in `no-secret-env`'s `allow` option with a reason.

2. Add `node tools/security/scan.mjs --tracked` plus every migration directory (`--postgres`, `--sqlite`) to `verify:static`, so the commit gate and CI both run it. Add `--bundle <client build output>` to `verify` after the client build.

3. Fix existing findings. For a finding that needs its own design or migration, add an entry to `tools/security/baseline.json` with `rule`, `path`, `subject`, `issue` (its own follow-up issue) and `reason`. Entries that stop matching fail the scan, so the baseline only shrinks. Never add an entry for new code.

4. Set provider-side spend caps on every AI provider account. Lint cannot stop a runaway bill at runtime; this is an owner action, not a code change.

## Verify

`test/security.test.mjs` in the house runs a passing and a failing case for each of the seven checks, the baseline ratchet and the CLI. A downstream repository proves adoption by running its own `verify:static` against its real config; a synced file alone does not enable a gate.
