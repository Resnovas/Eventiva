/**
 * @file tests/integrations/formatjs/src/i18n.spec.ts
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

import { I18n } from '@eventiva/contracts/i18n';
import { layer } from '@eventiva/integrations.formatjs/i18n';
import { describe, expect, it } from '@effect/vitest';
import { Effect } from 'effect';

const count = { id: 'events.count', defaultMessage: '{n, plural, one {# event} other {# events}}' };
const incident = { id: 'mdt.incident', defaultMessage: 'Incident' };
const catalogue = { 'events.count': '{n, plural, one {# event today} other {# events today}}', 'mdt.incident': 'Incident' };

describe('FormatJS I18n', () => {
    it.effect('formats ICU plurals from the catalogue, not the default message', () =>
        Effect.gen(function* () {
            const i18n = yield* I18n;
            expect(i18n.locale).toBe('en-GB');
            expect(i18n.format(count, { n: 1 })).toBe('1 event today');
            expect(i18n.format(count, { n: 2 })).toBe('2 events today');
        }).pipe(Effect.provide(layer({ locale: 'en-GB', catalogue })))
    );

    it.effect('falls back to the default message for a key the catalogue lacks', () =>
        Effect.gen(function* () {
            const i18n = yield* I18n;
            expect(i18n.format({ id: 'events.missing', defaultMessage: 'Fallback {name}' }, { name: 'A' })).toBe('Fallback A');
            expect(i18n.format({ id: 'events.missing', defaultMessage: 'Fallback {name}' }, { name: 'B' })).toBe('Fallback B');
        }).pipe(Effect.provide(layer({ locale: 'en-GB', catalogue: {} })))
    );

    it.effect('falls back to the en-GB default when another locale lacks a translation', () =>
        Effect.gen(function* () {
            const i18n = yield* I18n;
            const missing = { id: 'events.missing', defaultMessage: '{n, plural, one {# day} other {# days}}' };
            expect(i18n.format(missing, { n: 1 })).toBe('1 day');
            expect(i18n.format(missing, { n: 3 })).toBe('3 days');
            expect(i18n.format(incident)).toBe('Incident');
        }).pipe(Effect.provide(layer({ locale: 'fr-FR', catalogue: { 'mdt.incident': 'Incident' } })))
    );

    it.effect('applies a terminology pack for the same locale only', () =>
        Effect.gen(function* () {
            const pack = { id: 'jesip', version: 1, locale: 'en-GB', messages: { 'mdt.incident': 'Major incident' } };
            const gb = yield* Effect.provide(I18n, layer({ locale: 'en-GB', catalogue, terminology: pack }));
            const us = yield* Effect.provide(I18n, layer({ locale: 'en-US', catalogue, terminology: pack }));
            expect(gb.format(incident)).toBe('Major incident');
            expect(us.format(incident)).toBe('Incident');
        })
    );
});
