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
import { CallerIdentity } from '@eventiva/contracts/caller';
import {
    ActionFailed,
    Forbidden,
    InvalidInput,
    PlatformError,
    Unavailable,
    UnknownAction,
} from '@eventiva/contracts/errors';
import { SubjectId, TenantId } from '@eventiva/contracts/ids';
import { Receipt } from '@eventiva/contracts/receipt';
import { isWeaker, SecurityProfile } from '@eventiva/contracts/security';
import {
    canonicalLocale,
    GovernedTerminologyPack,
    LocaleTag,
    MessageKey,
    TerminologyPack,
    TerminologyProfileReference,
} from '@eventiva/contracts/i18n';
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
            permission: 'events.create',
            sideEffect: 'write',
            offline: 'queued',
            flag: 'events.create-v2',
        });
        expect(spec._tag).toBe('ActionSpec');
        expect(spec.version).toBe(2);
        expect(spec.permission).toBe('events.create');
        expect(Option.getOrNull(spec.flag)).toBe('events.create-v2');
        expect(Option.getOrNull(spec.error)).toBe(Failure);
        expect(Object.keys(spec)).not.toContain('handler');

        const read = define('events.get', {
            version: 1,
            description: 'Read an event.',
            input: Schema.Struct({}),
            output: Schema.Struct({}),
            permission: 'events.get',
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
            new Forbidden({ action: 'a.b', reason: 'missing permission a.b' }),
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

describe('governed terminology metadata', () => {
    const pack = {
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
    };
    const decode = Schema.decodeUnknownEither(GovernedTerminologyPack);

    it('roundtrips governed overlays and exact profile/version references without changing the basic overlay', () => {
        const decoded = Schema.decodeUnknownSync(GovernedTerminologyPack)(pack);
        expect(Schema.encodeSync(GovernedTerminologyPack)(decoded)).toEqual(pack);
        const reference = { id: decoded.id, version: decoded.version };
        const historic = Schema.decodeUnknownSync(TerminologyProfileReference)(reference);
        expect(Schema.encodeSync(TerminologyProfileReference)(historic)).toEqual(reference);
        const revised = Schema.decodeUnknownSync(GovernedTerminologyPack)({ ...pack, version: 2 });
        expect(revised.version).toBe(2);
        expect(historic).toEqual({ id: pack.id, version: 1 });
        expect(
            Schema.decodeUnknownEither(TerminologyPack)({
                id: pack.id,
                version: pack.version,
                locale: pack.locale,
                messages: pack.messages,
            })._tag
        ).toBe('Right');
    });

    it('requires every provenance field to be nonblank and already trimmed', () => {
        for (const field of [
            'id',
            'authority',
            'source',
            'sourceVersion',
            'jurisdiction',
            'effectiveDate',
            'licenceOrReuseBasis',
            'intendedContext',
            'mappingConfidence',
        ] as const) {
            const { [field]: omitted, ...missing } = pack;
            expect(omitted).toBeDefined();
            expect(decode(missing)._tag, field).toBe('Left');
            for (const value of ['', '   ', '\t\n', ` ${pack[field]} `, `${pack[field]}\n`, undefined, null, 42]) {
                expect(decode({ ...pack, [field]: value })._tag, field).toBe('Left');
            }
        }
        expect(decode({ ...pack, mappingConfidence: 0.9 })._tag).toBe('Left');
    });

    it('rejects unknown fields instead of silently stripping policy or selection claims', () => {
        for (const extra of [{ verified: true }, { selectedBy: 'individual' }, { provenance: {} }]) {
            expect(decode({ ...pack, ...extra })._tag).toBe('Left');
        }
        const reference = Schema.decodeUnknownEither(TerminologyProfileReference);
        expect(reference({ id: pack.id, version: 1, locale: 'en-GB' })._tag).toBe('Left');
        expect(reference({ id: pack.id, version: 1, latest: true })._tag).toBe('Left');
        expect(reference({ id: pack.id })._tag).toBe('Left');
        expect(reference({ id: ' ', version: 1 })._tag).toBe('Left');
    });

    it('requires positive finite safe integer versions for packs and references', () => {
        for (const version of [0, -1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, '1', 'latest']) {
            expect(decode({ ...pack, version })._tag).toBe('Left');
            expect(Schema.decodeUnknownEither(TerminologyProfileReference)({ id: pack.id, version })._tag).toBe('Left');
        }
        for (const version of [1, Number.MAX_SAFE_INTEGER]) {
            expect(decode({ ...pack, version })._tag).toBe('Right');
            expect(Schema.decodeUnknownEither(TerminologyProfileReference)({ id: pack.id, version })._tag).toBe(
                'Right'
            );
        }
    });

    it('validates calendar dates without imposing activation or a current-date policy', () => {
        for (const effectiveDate of ['0001-01-01', '2000-02-29', '2024-02-29', '9999-12-31']) {
            expect(decode({ ...pack, effectiveDate })._tag, effectiveDate).toBe('Right');
        }
        for (const effectiveDate of [
            '0000-01-01',
            '10000-01-01',
            '1900-02-29',
            '2100-02-29',
            '2026-02-29',
            '2026-04-31',
            '2026-00-01',
            '2026-13-01',
            '2026-01-00',
            '2026-01-32',
            '2026-1-01',
            '2026-11-17T00:00:00Z',
            'not-a-date',
        ]) {
            expect(decode({ ...pack, effectiveDate })._tag, effectiveDate).toBe('Left');
        }
    });

    it('rejects invalid message keys, values and locales while allowing empty overlays', () => {
        for (const key of ['Bad', 'incident', '', 'training..incident', 'training.incident ']) {
            expect(decode({ ...pack, messages: { ...pack.messages, [key]: 'Invalid' } })._tag, key).toBe('Left');
        }
        expect(decode({ ...pack, messages: { 'training.incident': 3 } })._tag).toBe('Left');
        expect(decode({ ...pack, locale: 'english' })._tag).toBe('Left');
        expect(decode({ ...pack, messages: {} })._tag).toBe('Right');
    });
});

describe('telemetry names', () => {
    it('name action spans and attributes consistently', () => {
        expect(actionSpan('events.create')).toBe('action.events.create');
        expect(Attributes.flagKey).toBe('feature_flag.key');
    });
});

describe('callers and identifiers', () => {
    const subject = '0193a4f0-0000-7000-8000-000000000001';
    const session = '0193a4f0-0000-7000-8000-000000000002';

    it('decode a delegated agent caller and refuse malformed ids or kinds', () => {
        const decode = Schema.decodeUnknownEither(CallerIdentity);
        const agent = { subject, kind: 'external-agent', tenant: subject, onBehalfOf: session, session };
        expect(Schema.decodeUnknownSync(CallerIdentity)(agent)).toEqual(agent);
        expect(decode({ subject, kind: 'service', session })._tag).toBe('Right');
        expect(decode({ ...agent, subject: 'alice' })._tag).toBe('Left');
        expect(decode({ ...agent, kind: 'admin' })._tag).toBe('Left');
    });

    it('brand ids by kind', () => {
        expect(Schema.is(TenantId)(subject)).toBe(true);
        expect(Schema.is(SubjectId)('ten_123')).toBe(false);
    });
});

describe('security profiles', () => {
    it('order profiles from baseline to vault', () => {
        expect(SecurityProfile.literals).toEqual(['baseline', 'sensitive', 'restricted', 'vault']);
        expect(isWeaker('baseline', 'restricted')).toBe(true);
        expect(isWeaker('vault', 'restricted')).toBe(false);
        expect(isWeaker('restricted', 'restricted')).toBe(false);
    });
});

describe('portable receipts', () => {
    it('roundtrips denied unknown-action evidence and rejects invalid durations and versions', () => {
        const receipt = {
            id: 'receipt-1',
            caller: {
                subject: '0193a4f0-0000-7000-8000-000000000001',
                kind: 'human',
                session: '0193a4f0-0000-7000-8000-000000000002',
            },
            action: 'not a canonical name',
            version: null,
            inputHash: 'sha256-digest',
            outcome: 'denied',
            startedAt: 4,
            durationMs: 3,
        };
        const decoded = Schema.decodeUnknownSync(Receipt)(receipt);
        expect(Schema.encodeSync(Receipt)(decoded)).toEqual(receipt);
        expect(Schema.is(Receipt)({ ...receipt, durationMs: -1 })).toBe(false);
        expect(Schema.is(Receipt)({ ...receipt, version: 0 })).toBe(false);
        expect(Schema.is(Receipt)({ ...receipt, outcome: 'queued-success' })).toBe(false);
    });
});
