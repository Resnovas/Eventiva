/**
 * @file packages/integrations/sql/src/identity.ts
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

import { SqlClient } from '@effect/sql';
import {
    FederatedSubject,
    IdentityStore,
    records,
    type IdentityKind,
    type IdentityRecords,
} from '@eventiva/contracts/identity';
import { SubjectId } from '@eventiva/contracts/ids';
import { Receipt } from '@eventiva/contracts/receipt';
import { CurrentTenant, StorageFailure, Version } from '@eventiva/contracts/storage';
import { Effect, Layer, Schema } from 'effect';

/** Build with the exact tenant client used by Storage; never expose this client through TenantRouter. */
export const identityStore = Layer.effect(
    IdentityStore,
    Effect.gen(function* () {
        const tenant = yield* CurrentTenant;
        const sql = yield* SqlClient.SqlClient;
        const failure = (cause: unknown) => new StorageFailure({ operation: 'identity', cause });
        const decode = <A, I>(schema: Schema.Schema<A, I>, value: unknown) =>
            Schema.decodeUnknown(schema)(value, { onExcessProperty: 'error' }).pipe(Effect.mapError(failure));
        const lock = sql`UPDATE identity_guard SET version = version WHERE id = 1 RETURNING id`.pipe(
            Effect.flatMap((rows) =>
                rows.length === 1 ? Effect.void : Effect.fail(failure('identity-guard-missing'))
            ),
            Effect.mapError(failure)
        );
        const codecs: { readonly [K in IdentityKind]: Schema.Schema<IdentityRecords[K]> } = {
            principal: Schema.typeSchema(records.principal),
            session: Schema.typeSchema(records.session),
            organization: Schema.typeSchema(records.organization),
            membership: Schema.typeSchema(records.membership),
            team: Schema.typeSchema(records.team),
            role: Schema.typeSchema(records.role),
            profile: Schema.typeSchema(records.profile),
        };
        const codec = <K extends IdentityKind>(kind: K): Schema.Schema<IdentityRecords[K]> => codecs[kind];
        const table = (kind: IdentityKind) => sql(`identity_${kind}`);
        const get: IdentityStore['Type']['get'] = (kind, id) =>
            Effect.gen(function* () {
                const [row] = yield* sql<{
                    body: string;
                    version: number | string;
                }>`SELECT body, version FROM ${table(kind)} WHERE id = ${id}`;
                if (!row) return undefined;
                const value = yield* decode(Schema.parseJson(codec(kind)), row.body);
                if (value.id !== id) return yield* failure('identity-key-mismatch');
                return { value, version: yield* decode(Version, Number(row.version)) };
            }).pipe(Effect.catchTag('SqlError', (cause) => Effect.fail(failure(cause))));
        return IdentityStore.of({
            tenant: tenant.id,
            lock,
            get,
            put: (kind, value, expectedVersion) =>
                sql
                    .withTransaction(
                        Effect.gen(function* () {
                            yield* lock;
                            const checked = yield* decode(codec(kind), value);
                            yield* decode(Schema.NullOr(Version), expectedVersion);
                            const body = yield* Schema.encode(Schema.parseJson(codec(kind)))(checked).pipe(
                                Effect.mapError(failure)
                            );
                            const rows =
                                expectedVersion === null
                                    ? yield* sql`INSERT INTO ${table(kind)} (id, version, body) VALUES (${checked.id}, 0, ${body}) ON CONFLICT (id) DO NOTHING RETURNING id`
                                    : yield* sql`UPDATE ${table(kind)} SET body = ${body}, version = version + 1 WHERE id = ${checked.id} AND version = ${expectedVersion} RETURNING id`;
                            if (rows.length !== 1) return yield* failure('identity-version-conflict');
                        })
                    )
                    .pipe(Effect.catchTag('SqlError', (cause) => Effect.fail(failure(cause)))),
            teams: (subject) =>
                Effect.gen(function* () {
                    const rows = yield* sql<{ body: string }>`SELECT body FROM identity_team ORDER BY id`;
                    const teams = yield* Effect.forEach(rows, (row) =>
                        decode(Schema.parseJson(records.team), row.body)
                    );
                    return teams.filter((team) => team.members.includes(subject));
                }).pipe(Effect.catchTag('SqlError', (cause) => Effect.fail(failure(cause)))),
            link: (external, subject) =>
                sql
                    .withTransaction(
                        Effect.gen(function* () {
                            yield* lock;
                            const key = yield* decode(FederatedSubject, external);
                            const canonical = yield* decode(SubjectId, subject);
                            const principal = yield* get('principal', canonical);
                            if (!principal?.value.active) return yield* failure('identity-principal-required');
                            yield* sql`INSERT INTO identity_federation (issuer, external_subject, subject) VALUES (${key.issuer}, ${key.subject}, ${canonical}) ON CONFLICT (issuer, external_subject) DO NOTHING`;
                            const [row] = yield* sql<{
                                subject: string;
                            }>`SELECT subject FROM identity_federation WHERE issuer = ${key.issuer} AND external_subject = ${key.subject}`;
                            if (row?.subject !== canonical) return yield* failure('identity-link-collision');
                        })
                    )
                    .pipe(Effect.catchTag('SqlError', (cause) => Effect.fail(failure(cause)))),
            lookup: (external) =>
                Effect.gen(function* () {
                    const key = yield* decode(FederatedSubject, external);
                    const [row] = yield* sql<{
                        subject: string;
                    }>`SELECT subject FROM identity_federation WHERE issuer = ${key.issuer} AND external_subject = ${key.subject}`;
                    return row ? yield* decode(SubjectId, row.subject) : undefined;
                }).pipe(Effect.catchTag('SqlError', (cause) => Effect.fail(failure(cause)))),
            audit: (limit) =>
                Effect.gen(function* () {
                    const bounded = yield* decode(Schema.Int.pipe(Schema.between(1, 100)), limit);
                    const rows = yield* sql<{
                        receipt: string;
                    }>`SELECT receipt FROM action_receipt ORDER BY id DESC LIMIT ${bounded}`;
                    const receipts = yield* Effect.forEach(rows, (row) =>
                        decode(Schema.parseJson(Receipt), row.receipt)
                    );
                    if (receipts.some((receipt) => receipt.caller.tenant !== tenant.id))
                        return yield* failure('identity-audit-tenant-mismatch');
                    return receipts;
                }).pipe(Effect.catchTag('SqlError', (cause) => Effect.fail(failure(cause)))),
        });
    })
);
