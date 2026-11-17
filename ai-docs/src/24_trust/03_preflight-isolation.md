# Isolate admitted trust-preflight metadata

`trustPreflight` from `@eventiva/runtime/trust` strictly decodes a request and
trusted policy, then detaches and freezes their complete current record shapes
before invoking adapters. Nested `scope`, `keys` and `freshAfter` are included.
Do not rely on schema decoding or TypeScript `readonly` to remove runtime aliases.
When extending either contract, preserve isolation for every new nested value.

All four independent verifier ports, host binding/freshness/assurance checks and
the final replay consumption use the admitted original values. Caller mutation
while a verifier is suspended and retained adapter references cannot rewrite
that in-flight binding or policy. Preflight does not freeze caller-owned data;
it snapshots on execution/admission, not when the Effect is constructed. New
authorized values require a new preflight, not mutation of an in-flight one.

## Example and failure contract

Keep the existing explicit-policy API and safe unavailable composition:

```ts
import { TrustUnavailable, type TrustPolicy, type TrustRequest } from '@eventiva/contracts/trust';
import { trustPreflight } from '@eventiva/runtime/trust';
import { Effect } from 'effect';

/** Observe safe default refusal; replace unavailable ports only with independently reviewed verifiers and replay storage. */
export const refusedIsolatedPreflight = (request: TrustRequest, policy: TrustPolicy) =>
    trustPreflight(request, policy).pipe(Effect.provide(TrustUnavailable));
```

This example returns identity `unavailable`, not a successful admission. With
fixture verifiers, trusted A5 policy plus A4 workload evidence fails
`workload/assurance` without nonce consumption even if identity attempts to lower
the floor to A1. A genuine A5 control succeeds only as
`decision: 'metadata-preflight-only', release: 'denied'`. Rejected nonthrowing
writes leave original-bound evaluation intact; throwing writes become sanitized
gate-local `TrustFailure`/`unavailable`. Pure interruption remains interruption.
Binding failures, safe typed reasons and secret-canary redaction remain intact.

Run the public preflight regressions:

```sh
pnpm exec vitest run --config tests/runtime/vitest.config.mts tests/runtime/src/trust.spec.ts --coverage.enabled=false
```

Tests use deterministic suspension barriers, nested mutation attempts and an
earlier adapter reference exercised at a later gate. They check originals at
every gate and replay, the strict A5 floor, stale evidence refusal, sanitized
throwing writes and metadata-only positive controls without type escapes.
The volatile replay fixture does not establish SQL/process durability.

This is input isolation, not a sandbox against arbitrary code in the same
JavaScript realm or proof of verifier honesty. It selects no crypto, custody,
provider, timing, retention or concrete trust policy. No feature flag may weaken
the mandatory binding boundary. Direct replay calls retain their separate
trusted-composition requirements. Read [the preflight-to-consume boundary](../../../../docs/trust-replay.md#preserve-admitted-preflight-inputs)
without redefining retention or the four-gate trust specification.
