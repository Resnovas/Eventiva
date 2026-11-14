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

/** Offline catalogues bundled with the app, by locale. */
export const catalogues: Readonly<Record<string, Readonly<Record<string, string>>>> = { [canonicalLocale]: enGB };

/** The device's first preferred locale that has a catalogue, else en-GB. */
export const deviceLocale = (): string =>
    getLocales()
        .map((locale) => locale.languageTag)
        .find((tag) => tag in catalogues) ?? canonicalLocale;
