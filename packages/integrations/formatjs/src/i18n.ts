/**
 * @file packages/integrations/formatjs/src/i18n.ts
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

import { I18n, type LocaleTag, type TerminologyPack, canonicalLocale } from '@eventiva/contracts/i18n';
import { createIntl, createIntlCache } from '@formatjs/intl';
import { Effect, Layer, Runtime } from 'effect';

/**
 * The `I18n` service on `@formatjs/intl`. Catalogues are plain key-to-ICU
 * records bundled with the app, so formatting works offline. A tenant's
 * terminology pack overlays the locale catalogue key by key. A key missing
 * from both falls back to the en-GB default message, and the miss is logged
 * once, never thrown.
 */

/** A compiled catalogue: message key to ICU MessageFormat text. */
export type Catalogue = Readonly<Record<string, string>>;

/** Options for one `I18n` layer. */
export interface I18nOptions {
    readonly locale: LocaleTag;
    readonly catalogue: Catalogue;
    readonly terminology?: TerminologyPack;
}

/** Builds the service value; exported so a React tree can share the same formatter. */
export const make = (options: I18nOptions) =>
    Effect.gen(
        /** Allocate one locale formatter with layer-local fallback deduplication and matching terminology. */ function* () {
            const missing = new Set<string>();
            const runtime = yield* Effect.runtime<never>();
            // A pack selected for another locale must not replace translations in this formatter.
            const messages = {
                ...options.catalogue,
                ...(options.terminology?.locale === options.locale ? options.terminology.messages : {}),
            };
            const intl = createIntl(
                {
                    locale: options.locale,
                    defaultLocale: canonicalLocale,
                    messages,
                    /** Report each distinct formatter error once through the captured Effect runtime without throwing it. */
                    onError: (error) => {
                        // A missing or broken translation falls back to the default message; report each once.
                        if (missing.has(error.message)) return;
                        missing.add(error.message);
                        Runtime.runFork(runtime)(Effect.logDebug('Message fallback', error.code, error.message));
                    },
                },
                createIntlCache()
            );
            return I18n.of({
                locale: options.locale,
                /** Format catalogue or matching-overlay ICU text, using the descriptor's canonical default on fallback. */
                format: (message, values) => intl.formatMessage(message, values),
            });
        }
    );

/** An `I18n` layer for one locale. */
export const layer = (options: I18nOptions): Layer.Layer<I18n> => Layer.effect(I18n, make(options));
