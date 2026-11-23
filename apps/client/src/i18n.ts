/**
 * @file apps/client/src/i18n.ts
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

import { canonicalLocale } from '@eventiva/contracts/i18n';
import { getLocales } from 'expo-localization';
import enGB from '../lang/en-GB.json';

/**
 * Offline catalogues bundled with the app, by locale.
 *
 * @since 0.0.1
 * @example
 * const messages = catalogues[deviceLocale()];
 */
export const catalogues: Readonly<Record<string, Readonly<Record<string, string>>>> = { [canonicalLocale]: enGB };

/**
 * The device's first preferred locale that has a catalogue, else en-GB.
 *
 * @since 0.0.1
 * @returns The BCP 47 tag of the locale to format in.
 * @example
 * const locale = deviceLocale();
 */
export const deviceLocale = (): string =>
    getLocales()
        .map(
            /**
             * Preserve device preference order while extracting catalogue lookup keys.
             *
             * @param locale - One of the device's preferred locales.
             * @returns Its BCP 47 language tag.
             */
            (locale) => locale.languageTag
        )
        .find(
            /**
             * Accept only an exact bundled catalogue key, without network negotiation.
             *
             * @param tag - A preferred language tag.
             * @returns Whether a catalogue is bundled for it.
             */
            (tag) => tag in catalogues
        ) ?? canonicalLocale;
