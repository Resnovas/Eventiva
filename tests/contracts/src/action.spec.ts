/**
 * @file tests/contracts/src/action.spec.ts
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

import { ActionName, define, wireName } from '@eventiva/contracts/action';
import { ActionFailed, InvalidInput, PlatformError, Unavailable, UnknownAction } from '@eventiva/contracts/errors';
import { canonicalLocale, LocaleTag, MessageKey, TerminologyPack } from '@eventiva/contracts/i18n';
import { Attributes, actionSpan } from '@eventiva/contracts/telemetry';
import { describe, expect, it } from '@effect/vitest';
import { Option, Schema } from 'effect';

describe('action specifications', () => {
    it('hold metadata without a handler and record an optional flag and error schema', () => {
        const Failure = Schema.TaggedStruct('LimitReached', { limit: Schema.Int });
        const spec = define('events.create', {
            version: 2,
            description: 'Create an event.',
            input: Schema.Struct({ title: Schema.String }),
            output: Schema.Struct({ id: Schema.String }),
            error: Failure,
            sideEffect: 'write',
            offline: 'queued',
            flag: 'events.create-v2',
        });
        expect(spec._tag).toBe('ActionSpec');
        expect(spec.version).toBe(2);
        expect(Option.getOrNull(spec.flag)).toBe('events.create-v2');
        expect(Option.getOrNull(spec.error)).toBe(Failure);
        expect(Object.keys(spec)).not.toContain('handler');

        const read = define('events.get', {
            version: 1,
            description: 'Read an event.',
            input: Schema.Struct({}),
            output: Schema.Struct({}),
            sideEffect: 'read',
            offline: 'local',
        });
        expect(Option.isNone(read.flag)).toBe(true);
        expect(Option.isNone(read.error)).toBe(true);
    });

    it('validates canonical names and derives provider-safe wire names', () => {
        const valid = Schema.is(ActionName);
        expect(valid('events.tickets.create')).toBe(true);
        expect(valid('events')).toBe(false);
        expect(valid('Events.create')).toBe(false);
        expect(valid('events.1create')).toBe(false);
        expect(wireName('events.tickets.create')).toBe('events_tickets_create');
    });
});

describe('platform errors', () => {
    it('round-trip through their wire encoding', () => {
        const errors = [
            new UnknownAction({ action: 'a.b' }),
            new InvalidInput({ action: 'a.b', message: 'Expected string' }),
            new Unavailable({ action: 'a.b', reason: 'flag-off' }),
            new ActionFailed({ action: 'a.b', error: { _tag: 'LimitReached', limit: 3 } }),
        ];
        for (const error of errors) {
            const wire = Schema.encodeSync(PlatformError)(error);
            expect(JSON.parse(JSON.stringify(wire))).toEqual(wire);
            const decoded = Schema.decodeUnknownSync(PlatformError)(wire);
            expect(decoded).toBeInstanceOf(error.constructor);
            expect(decoded).toEqual(error);
        }
    });
});

describe('message keys and terminology packs', () => {
    it('validate keys, locales and overlays', () => {
        expect(canonicalLocale).toBe('en-GB');
        expect(Schema.is(MessageKey)('client.shell.title')).toBe(true);
        expect(Schema.is(MessageKey)('title')).toBe(false);
        expect(Schema.is(LocaleTag)('en-GB')).toBe(true);
        expect(Schema.is(LocaleTag)('english')).toBe(false);
        const decode = Schema.decodeUnknownEither(TerminologyPack);
        expect(
            decode({ id: 'jesip', version: 1, locale: 'en-GB', messages: { 'mdt.incident': 'Incident' } })._tag
        ).toBe('Right');
        expect(decode({ id: 'jesip', version: 0, locale: 'en-GB', messages: {} })._tag).toBe('Left');
        expect(decode({ id: 'jesip', version: 1, locale: 'en-GB', messages: { Bad: 'x' } })._tag).toBe('Left');
    });
});

describe('telemetry names', () => {
    it('name action spans and attributes consistently', () => {
        expect(actionSpan('events.create')).toBe('action.events.create');
        expect(Attributes.flagKey).toBe('feature_flag.key');
    });
});
