/**
 * @file packages/contracts/src/i18n.ts
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { Context, Schema } from 'effect';

/**
 * Localisation contracts. Messages are ICU MessageFormat strings addressed by
 * namespaced keys with an en-GB default message. Catalogues and formatting
 * live in `@eventiva/integrations.formatjs`; code only names keys.
 */

/** The canonical locale every default message is written in. */
export const canonicalLocale = 'en-GB';

/** A namespaced message key, such as `client.shell.title`. */
export const MessageKey = Schema.String.pipe(Schema.pattern(/^[a-z][a-z0-9-]*(\.[a-z0-9-]+)+$/));
export type MessageKey = typeof MessageKey.Type;

/** A BCP 47 language tag, such as `en-GB`. */
export const LocaleTag = Schema.String.pipe(Schema.pattern(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/));
export type LocaleTag = typeof LocaleTag.Type;

/** A message to format: its key, its en-GB default and an optional note for translators. */
export interface MessageDescriptor {
    readonly id: string;
    readonly defaultMessage: string;
    readonly description?: string;
}

/** Values interpolated into a message. */
export type MessageValues = Readonly<Record<string, string | number | boolean | Date | null | undefined>>;

/** Formats messages in the active locale. A missing translation falls back to the default message. */
export class I18n extends Context.Tag('@eventiva/contracts/I18n')<
    I18n,
    {
        readonly locale: LocaleTag;
        /** Interpolate ICU values in the active locale, falling back to the descriptor's canonical message. */
        readonly format: (message: MessageDescriptor, values?: MessageValues) => string;
    }
>() {}

/**
 * A terminology pack: a tenant-selected overlay that replaces message texts
 * for a domain vocabulary or operational profile, without changing keys.
 */
export const TerminologyPack = Schema.Struct({
    id: Schema.NonEmptyTrimmedString,
    version: Schema.Int.pipe(Schema.positive()),
    locale: LocaleTag,
    // A key that is not a message key is an error, never silently dropped.
    messages: Schema.Record({ key: MessageKey, value: Schema.String }).annotations({
        parseOptions: { onExcessProperty: 'error' },
    }),
});
export type TerminologyPack = typeof TerminologyPack.Type;

const ProfileVersion = Schema.Int.pipe(Schema.between(1, Number.MAX_SAFE_INTEGER));

/** A calendar date, not an activation timestamp or proof that a source is current. */
const EffectiveDate = Schema.String.pipe(
    Schema.pattern(/^\d{4}-\d{2}-\d{2}$/),
    Schema.filter(
        /** Reject impossible Gregorian dates without treating the calendar date as a time-zone instant. */ (value) => {
            // Calendar arithmetic avoids Date normalization accepting overflow days or remapping years below 100.
            const year = Number(value.slice(0, 4));
            const month = Number(value.slice(5, 7));
            const day = Number(value.slice(8, 10));
            const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
            const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return year >= 1 && day >= 1 && day <= (days[month - 1] ?? 0);
        }
    )
);

/**
 * Descriptive provenance for a governed profile. Decoding validates metadata,
 * not authority, licensing, mapping quality, permission to select or activation.
 * Only tenant administrators select governed profiles; locale preference is separate.
 */
export const GovernedTerminologyPack = Schema.Struct({
    ...TerminologyPack.fields,
    version: ProfileVersion,
    authority: Schema.NonEmptyTrimmedString,
    source: Schema.NonEmptyTrimmedString,
    sourceVersion: Schema.NonEmptyTrimmedString,
    jurisdiction: Schema.NonEmptyTrimmedString,
    effectiveDate: EffectiveDate,
    licenceOrReuseBasis: Schema.NonEmptyTrimmedString,
    intendedContext: Schema.NonEmptyTrimmedString,
    // Descriptive assessment, not an invented official scale or verification claim.
    mappingConfidence: Schema.NonEmptyTrimmedString,
}).annotations({ parseOptions: { onExcessProperty: 'error' } });
export type GovernedTerminologyPack = typeof GovernedTerminologyPack.Type;

/**
 * Exact, readonly profile identity for historical records. Retain this version
 * when tenant selection changes; never reinterpret it as a moving "latest" alias.
 * Storage must preserve the referenced revision; this schema does not enforce persistence.
 */
export const TerminologyProfileReference = Schema.Struct({
    id: Schema.NonEmptyTrimmedString,
    version: ProfileVersion,
}).annotations({ parseOptions: { onExcessProperty: 'error' } });
export type TerminologyProfileReference = typeof TerminologyProfileReference.Type;
