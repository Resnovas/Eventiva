/**
 * @file tests/contracts/src/crm-organisation.spec.ts
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

import { describe, expect, it } from '@effect/vitest';
import { Effect, Either, Schema } from 'effect';
import {
    crmFlag,
    organisationActions,
    organisationCreate,
    organisationList,
    organisationResources,
    contactPointActions,
    contactPointAdd,
    contactPointUpdate,
    contactPointList,
    ContactPoint,
} from '@eventiva/contracts/crm-organisation';
import { validateDefinitions, validateInventory } from '@eventiva/contracts/inventory';
import { make } from '@eventiva/contracts/json-schema';

describe('CRM organisation contracts', /** Keep bounded wire validation independent of incomplete provider discovery. */ () => {
    it.effect(
        'declares six canonical private actions and paired resource identities',
        /**
         * Validate metadata without falsely claiming all provider profiles compile.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Check declarations and explicit discovery refusal on intact schemas rather than replacing them with primitives. */ function* () {
                    yield* validateDefinitions(organisationActions);
                    expect(
                        organisationActions.map(
                            /**
                             * Compare the exact implemented public operations.
                             *
                             * @param spec - One declared organisation action.
                             * @returns The action's public name.
                             */
                            (spec) => spec.name
                        )
                    ).toEqual([
                        'crm.organisation.create',
                        'crm.organisation.update',
                        'crm.organisation.archive',
                        'crm.organisation.restore',
                        'crm.organisation.get',
                        'crm.organisation.list',
                    ]);
                    expect(crmFlag.safeDefault).toBe(false);
                    const resources = yield* organisationResources;
                    expect(resources.party.id).toBe('crm.party');
                    expect(resources.organisation.id).toBe('crm.organisation');
                    for (const spec of organisationActions) {
                        expect(spec.permission).toBe(spec.sideEffect === 'read' ? 'crm.read' : 'crm.write');
                        expect(spec.sensitive).toBe(true);
                    }
                    // Negative control: discovery must fail closed, never silently erase unsupported refinements.
                    expect(yield* Effect.either(validateInventory(organisationActions))).toMatchObject({
                        left: { _tag: 'UnsupportedSchema' },
                    });
                    expect(
                        yield* Effect.either(
                            make(Schema.Struct({ name: Schema.String.pipe(Schema.maxLength(200)) }), 'google')
                        )
                    ).toMatchObject({ left: { path: '$.name', reason: 'Unsupported string keyword: maxLength' } });
                    expect(
                        yield* Effect.either(
                            make(
                                Schema.Struct({ limit: Schema.Number.pipe(Schema.int(), Schema.between(1, 100)) }),
                                'anthropic'
                            )
                        )
                    ).toMatchObject({
                        left: { reason: 'Conflicting composed constraint: minimum' },
                    });
                    expect(
                        Either.isRight(yield* Effect.either(make(Schema.Struct({ active: Schema.Boolean }), 'google')))
                    ).toBe(true);
                }
            )
    );
    it.effect(
        'keeps work contacts sensitive, bounded and outside claimed provider parity',
        /**
         * All contact specifications use the same live CRM gate without a transport exemption.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Distinguish local definition validity from the explicitly unsupported provider projection. */ function* () {
                    // Keep metadata admission and actual runtime decoding separate from conservative provider-schema compatibility.
                    yield* validateDefinitions(contactPointActions);
                    expect(
                        contactPointActions.map(
                            /**
                             * Assert the six canonical additions only.
                             *
                             * @param spec - One declared contact-point action.
                             * @returns The action's public name.
                             */
                            (spec) => spec.name
                        )
                    ).toEqual([
                        'crm.contact-point.add',
                        'crm.contact-point.update',
                        'crm.contact-point.remove',
                        'crm.contact-point.set-primary',
                        'crm.contact-point.get',
                        'crm.contact-point.list',
                    ]);
                    for (const spec of contactPointActions) {
                        expect(spec.sensitive).toBe(true);
                        expect(spec.offline).toBe('online-only');
                        expect(spec.flag).toMatchObject({ _tag: 'Some', value: 'crm.enabled' });
                        expect(spec.permission).toBe(spec.sideEffect === 'read' ? 'crm.read' : 'crm.write');
                    }
                    expect(yield* Effect.either(validateInventory(contactPointActions))).toMatchObject({
                        left: { _tag: 'UnsupportedSchema' },
                    });
                    const input = {
                        id: '019b0000-0000-7000-8000-000000000011',
                        organisationId: '019b0000-0000-7000-8000-000000000001',
                        label: 'work',
                        kind: 'email',
                        value: 'Sales.Team+demo@Example.test',
                    };
                    const decode = Schema.decodeUnknownEither(contactPointAdd.input);
                    expect(Either.isRight(decode(input))).toBe(true);
                    expect(Either.isRight(decode({ ...input, kind: 'phone', value: '+442079460123' }))).toBe(true);
                    for (const invalid of [
                        { value: 'a..b@example.test' },
                        { value: 'user@-bad.test' },
                        { value: ' user@example.test' },
                        { value: 'a@b' },
                        { value: 'x'.repeat(255) },
                        { kind: 'phone', value: '020 7946 0123' },
                        { kind: 'phone', value: '+012345678' },
                        { kind: 'phone', value: '+1234567890123456' },
                        { label: 'personal' },
                        { kind: 'website' },
                        { primary: true },
                        { verified: true },
                        { tenant: input.id },
                        { owner: input.id },
                        { createdBy: input.id },
                        { userId: input.id },
                        { visibility: 'team' },
                        { visibility: 'private' },
                    ])
                        expect(Either.isLeft(decode({ ...input, ...invalid }))).toBe(true);
                    const update = {
                        id: input.id,
                        organisationId: input.organisationId,
                        expectedRevision: 1,
                        value: 'new@example.test',
                    };
                    for (const forged of [
                        { kind: 'phone' },
                        { label: 'personal' },
                        { primary: true },
                        { verified: true },
                        { owner: input.id },
                    ])
                        expect(
                            Either.isLeft(
                                Schema.decodeUnknownEither(contactPointUpdate.input)({ ...update, ...forged })
                            )
                        ).toBe(true);
                    for (const limit of [0, 101, 1.5])
                        expect(
                            Either.isLeft(
                                Schema.decodeUnknownEither(contactPointList.input)({
                                    organisationId: input.organisationId,
                                    limit,
                                })
                            )
                        ).toBe(true);
                    for (const limit of [1, 100])
                        expect(
                            Either.isRight(
                                Schema.decodeUnknownEither(contactPointList.input)({
                                    organisationId: input.organisationId,
                                    limit,
                                })
                            )
                        ).toBe(true);
                    expect(
                        Either.isLeft(
                            Schema.decodeUnknownEither(ContactPoint)({
                                ...input,
                                revision: 1,
                                primary: false,
                                removed: false,
                                verified: true,
                            })
                        )
                    ).toBe(true);
                }
            )
    );
    it('rejects excess private fields, malformed identities and paging boundaries', /** Demonstrate inputs where stripped or merely primitive validation would incorrectly admit mutation. */ () => {
        // Boundary and forged-authority inputs distinguish strict rejection from silently stripping attacker-supplied fields.
        const input = {
            id: '019b0000-0000-7000-8000-000000000001',
            displayName: 'Synthetic',
            legalName: 'Synthetic Ltd',
        };
        expect(Either.isRight(Schema.decodeUnknownEither(organisationCreate.input)(input))).toBe(true);
        for (const invalid of [
            { id: 'not-a-uuid' },
            { displayName: '' },
            { legalName: ' untrimmed ' },
            { displayName: 'x'.repeat(201) },
        ])
            expect(Either.isLeft(Schema.decodeUnknownEither(organisationCreate.input)({ ...input, ...invalid }))).toBe(
                true
            );
        for (const extra of [
            { owner: input.id },
            { tenant: input.id },
            { visibility: 'private' },
            { visibility: 'team' },
            { email: 'secret@example.test' },
            { taxNumber: 'secret' },
            { contactPoints: [] },
            { arbitrary: {} },
        ]) {
            expect(Either.isLeft(Schema.decodeUnknownEither(organisationCreate.input)({ ...input, ...extra }))).toBe(
                true
            );
        }
        for (const limit of [0, 101, 1.5])
            expect(Either.isLeft(Schema.decodeUnknownEither(organisationList.input)({ limit }))).toBe(true);
        for (const limit of [1, 100])
            expect(Either.isRight(Schema.decodeUnknownEither(organisationList.input)({ limit }))).toBe(true);
    });
});
