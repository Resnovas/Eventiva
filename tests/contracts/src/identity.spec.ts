/**
 * @file tests/contracts/src/identity.spec.ts
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

import { expect, it } from '@effect/vitest';
import {
    auditList,
    FederatedSubject,
    Grant,
    IdentitySession,
    membershipGet,
    membershipSet,
    organizationGet,
    organizationSet,
    profileGet,
    profileSet,
    roleGet,
    roleSet,
    teamGet,
    teamSet,
} from '@eventiva/contracts/identity';
import { validateDefinitions } from '@eventiva/contracts/inventory';
import { Effect, Either, Schema } from 'effect';

it.effect(
    'identity action definitions are portable, explicitly scoped and JSON-encodable',
    /** Exercise identity definition validation and wire schemas without an identity backend. */ () =>
        Effect.gen(
            /** Verify online sensitive identity policy, exact subject preservation and bounded strictly scoped request shapes. */ function* () {
                const specs = [
                    auditList,
                    membershipGet,
                    membershipSet,
                    organizationGet,
                    organizationSet,
                    profileGet,
                    profileSet,
                    roleGet,
                    roleSet,
                    teamGet,
                    teamSet,
                ];
                // Policy metadata must survive definition validation before individual wire constraints are exercised.
                yield* validateDefinitions(specs);
                for (const spec of specs) {
                    expect(spec.offline).toBe('online-only');
                    expect(spec.sensitive).toBe(true);
                    if (spec.risk === 'permission') expect(spec.approval).toBe('always');
                }
                // Federated subjects retain issuer and subject spelling; this contract does not normalize external identities.
                expect(
                    Schema.decodeUnknownSync(FederatedSubject)({
                        issuer: 'https://EXAMPLE.test/realm',
                        subject: 'CaseSensitive',
                    })
                ).toEqual({ issuer: 'https://EXAMPLE.test/realm', subject: 'CaseSensitive' });
                for (const value of [
                    { issuer: '', subject: 'x' },
                    { issuer: 'x', subject: '' },
                ])
                    expect(Either.isLeft(Schema.decodeUnknownEither(FederatedSubject)(value))).toBe(true);
                expect(Either.isLeft(Schema.decodeUnknownEither(Grant)({ permission: '*', resources: ['*'] }))).toBe(
                    true
                );
                for (const limit of [0, 101, 1.5])
                    expect(Either.isLeft(Schema.decodeUnknownEither(auditList.input)({ limit }))).toBe(true);
                expect(Either.isRight(Schema.decodeUnknownEither(auditList.input)({ limit: 100 }))).toBe(true);
                expect(
                    Either.isLeft(
                        Schema.decodeUnknownEither(IdentitySession)({
                            id: 'not-a-uuid',
                            active: true,
                            expiresAt: Infinity
                        })
                    )
                ).toBe(true);
                expect(
                    Either.isLeft(
                        // Extra tenant scope must not be silently stripped from a profile request.
                        Schema.decodeUnknownEither(profileGet.input)(
                            { subject: '019b0000-0000-7000-8000-000000000001', tenant: 'forged' },
                            { onExcessProperty: 'error' }
                        )
                    )
                ).toBe(true);
            }
        )
);
