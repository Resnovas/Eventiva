# Governed terminology metadata

A terminology pack replaces selected message texts without changing their namespaced keys. A governed profile adds descriptive provenance to that overlay. This contract validates metadata only: it does not verify an authority, a licence, mapping accuracy or fitness for operational use, and it does not activate a profile.

Only tenant administrators select governed profiles. Individual locale preference remains separate from that selection. Historical records must retain the exact profile ID and version used at the time, even after a tenant selects a newer revision. Selection, authorization, storage and historical rendering are not implemented by these schemas.

## Validate a profile

Use the existing `@eventiva/contracts/i18n` subpath; no additional dependency or service setup is needed. Keep `TerminologyPack` for existing basic overlays. Use `GovernedTerminologyPack` at a governed metadata boundary and `TerminologyProfileReference` for an exact revision reference.

Every field below is required and has no default:

| Field                 | Meaning and validation                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                  | Stable profile identifier; nonempty, already-trimmed string.                                                                          |
| `version`             | Profile revision; integer from 1 through `Number.MAX_SAFE_INTEGER`.                                                                   |
| `locale`              | Overlay language tag using the existing `LocaleTag` contract; not a personal profile selection.                                       |
| `messages`            | Dictionary of existing namespaced `MessageKey` keys to strings; an empty dictionary is valid.                                         |
| `authority`           | Descriptive name of the claimed issuing authority; not verified by decoding.                                                          |
| `source`              | Descriptive identification of the source material; no prescribed publisher or URL scheme.                                             |
| `sourceVersion`       | Source edition/version description, separate from the numeric profile revision.                                                       |
| `jurisdiction`        | Description of the jurisdiction to which the source/profile is intended to apply.                                                     |
| `effectiveDate`       | Real Gregorian calendar date in `YYYY-MM-DD`, from `0001-01-01` through `9999-12-31`. Neither past nor future dates imply activation. |
| `licenceOrReuseBasis` | Description of the licence or other claimed reuse basis; not a legal determination.                                                   |
| `intendedContext`     | Description of the intended use and limitations.                                                                                      |
| `mappingConfidence`   | Descriptive assessment of how confidently the overlay maps to its source; no official scale or numeric score is imposed.              |

All descriptive strings must be nonempty and already trimmed. The governed pack and reference reject unknown fields rather than silently discarding them. Message keys keep the existing validation, including rejection of invalid keys alongside valid keys. Message text is not parsed as ICU syntax by this metadata schema; formatting remains the existing integration's responsibility.

```ts
import { GovernedTerminologyPack, TerminologyProfileReference } from '@eventiva/contracts/i18n';
import { Effect, Schema } from 'effect';

const metadata = Effect.gen(function* () {
    const profile = yield* Schema.decodeUnknown(GovernedTerminologyPack)({
        id: 'eventiva-training',
        version: 1,
        locale: 'en-GB',
        messages: { 'training.incident': 'Practice incident' },
        authority: 'Eventiva synthetic training team',
        source: 'Eventiva fictional training vocabulary',
        sourceVersion: 'Training edition A',
        jurisdiction: 'Fictional training jurisdiction only',
        effectiveDate: '2026-11-17',
        licenceOrReuseBasis: 'Synthetic example text authored for Eventiva documentation',
        intendedContext: 'Training exercises, not operational guidance',
        mappingConfidence: 'Unassessed synthetic mapping; no external authority review',
    });
    const reference = yield* Schema.decodeUnknown(TerminologyProfileReference)({
        id: profile.id,
        version: profile.version,
    });
    return { profile, reference };
});
```

This is synthetic Eventiva material, not copied standards content or an official vocabulary. `metadata` is an unexecuted Effect that can fail with a schema parse error; decoding it grants no approval.

## Retain exact historical references

Keep `{ id, version }` with each historical record. Treat that pair as immutable: publish changes under a new numeric revision, retain the referenced revision and do not resolve an old record through a moving `latest` alias. The reference's fields are readonly in TypeScript; schema decoding does not freeze JavaScript objects, check that a referenced pack exists or enforce storage immutability. Persistence and tenant authorization must enforce those requirements when implemented.

## Resolve validation failures

- Supply every provenance field; empty or whitespace-only values are rejected rather than replaced with invented metadata.
- Use a valid calendar date, not a timestamp. Leap-day and month-length checks apply without timezone conversion.
- Use a positive safe integer for the profile version, not a source edition string, fractional number or `latest`. Describe source editions in `sourceVersion`.
- Correct unexpected fields instead of relying on them being discarded. Fields such as `verified` are not part of this contract.
- Correct invalid message keys instead of expecting partial ingestion. Keys such as `Bad` and `incident` are invalid; `training.incident` is valid.

The existing basic overlay API and its consumers are unchanged. This metadata-only library addition has no runtime rollout or feature flag. Runtime activation, settings, UI, authorization, persistence, marketplace/trust integration and provider verification remain outside this change.
