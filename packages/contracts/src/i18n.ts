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
