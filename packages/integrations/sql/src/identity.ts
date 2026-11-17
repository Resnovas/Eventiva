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
    Effect.gen(
        /** Capture one authenticated tenant and its storage client; persistence does not grant caller permissions. */ function* () {
            const tenant = yield* CurrentTenant;
            const sql = yield* SqlClient.SqlClient;
            // All tables belong to the routed database; never choose a tenant from a presented identity record.
            /** Report only the closed identity failure reason, never driver diagnostics or stored identity contents. */
            const failure = (reason: NonNullable<StorageFailure['reason']>) =>
                new StorageFailure({ operation: 'identity', reason });
            /** Decode exact records and versions at the storage boundary, including values supplied by typed callers. */
            const decode = <A, I>(schema: Schema.Schema<A, I>, value: NoInfer<I>) =>
                Schema.decode(schema)(value, { onExcessProperty: 'error' }).pipe(
                    Effect.mapError(
                        /** Replace schema diagnostics so malformed identity data cannot escape through errors. */ () =>
                            failure('invalid-data')
                    )
                );
            const lock = sql`UPDATE identity_guard SET version = version WHERE id = 1 RETURNING id`.pipe(
                Effect.flatMap(
                    /** Refuse a database without the singleton guard; an empty update would otherwise provide no lock. */ (
                        rows
                    ) => rows.length === 1 ? Effect.void : Effect.fail(failure('identity-guard-missing'))
                ),
                Effect.catchTag(
                    'SqlError',
                    /** Hide database diagnostics while preserving the missing-guard domain failure. */ () =>
                        Effect.fail(failure('database'))
                )
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
            /** Select the decoded record schema associated with the closed identity kind. */
            const codec = <K extends IdentityKind>(kind: K): Schema.Schema<IdentityRecords[K]> => codecs[kind];
            /** Quote a table identifier derived only from the internal closed identity-kind vocabulary. */
            const table = (kind: IdentityKind) => sql(`identity_${kind}`);
            /** Read one exact record and version; absence is distinct from corrupt persisted data. */
            const get: IdentityStore['Type']['get'] = (kind, id) =>
                Effect.gen(
                    /** Cross-check persisted body identity and version against the requested row key. */ function* () {
                        const [row] = yield* sql<{
                            body: string;
                            version: number | string;
                        }>`SELECT body, version FROM ${table(kind)} WHERE id = ${id}`;
                        if (!row) return undefined;
                        const value = yield* decode(Schema.parseJson(codec(kind)), row.body);
                        // The row key, embedded identity and optimistic version must describe the same stored record.
                        if (value.id !== id) return yield* failure('identity-key-mismatch');
                        return { value, version: yield* decode(Version, Number(row.version)) };
                    }
                ).pipe(
                    Effect.catchTag(
                        'SqlError',
                        /** Do not expose SQL or record contents through read failures. */ () =>
                            Effect.fail(failure('database'))
                    )
                );
            return IdentityStore.of({
                tenant: tenant.id,
                lock,
                get,
                /** Atomically insert at version zero or advance the expected version; callers still own authorization. */
                put: (kind, value, expectedVersion) =>
                    sql
                        .withTransaction(
                            Effect.gen(
                                /** Hold the shared identity guard through exact validation and the optimistic write. */ function* () {
                                    yield* lock;
                                    // Validate before encoding; a failed precondition must never replace an existing identity.
                                    const checked = yield* decode(codec(kind), value);
                                    yield* decode(Schema.NullOr(Version), expectedVersion);
                                    const body = yield* Schema.encode(Schema.parseJson(codec(kind)))(checked).pipe(
                                        Effect.mapError(
                                            /** Keep invalid record details out of persistence failures. */ () =>
                                                failure('invalid-data')
                                        )
                                    );
                                    const rows =
                                        expectedVersion === null
                                            ? yield* sql`INSERT INTO ${table(kind)} (id, version, body) VALUES (${checked.id}, 0, ${body}) ON CONFLICT (id) DO NOTHING RETURNING id`
                                            : yield* sql`UPDATE ${table(kind)} SET body = ${body}, version = version + 1 WHERE id = ${checked.id} AND version = ${expectedVersion} RETURNING id`;
                                    if (rows.length !== 1) return yield* failure('identity-version-conflict');
                                }
                            )
                        )
                        .pipe(
                            Effect.catchTag(
                                'SqlError',
                                /** Preserve version conflicts but redact driver failures. */ () =>
                                    Effect.fail(failure('database'))
                            )
                        ),
                /** Return decoded teams containing the subject in stable ID order; this lookup does not authorize a grant. */
                teams: (subject) =>
                    Effect.gen(
                        /** Reject corrupt team records before selecting the subject's explicit memberships. */ function* () {
                            const rows = yield* sql<{ body: string }>`SELECT body FROM identity_team ORDER BY id`;
                            // Validate the complete stored team set rather than silently skipping malformed membership data.
                            const teams = yield* Effect.forEach(
                                rows,
                                /** Reject malformed team bodies before testing their membership lists. */ (row) =>
                                    decode(Schema.parseJson(records.team), row.body)
                            );
                            return teams.filter(
                                /** Match explicit team membership without deriving roles or permissions here. */ (
                                    team
                                ) => team.members.includes(subject)
                            );
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /** Hide driver details without swallowing invalid team data. */ () =>
                                Effect.fail(failure('database'))
                        )
                    ),
                /** Idempotently bind an exact issuer/subject pair to an active local principal; never silently relink it. */
                link: (external, subject) =>
                    sql
                        .withTransaction(
                            Effect.gen(
                                /** Serialize principal admission and collision checks with every other guarded identity write. */ function* () {
                                    yield* lock;
                                    const key = yield* decode(FederatedSubject, external);
                                    const canonical = yield* decode(SubjectId, subject);
                                    const principal = yield* get('principal', canonical);
                                    if (!principal?.value.active) return yield* failure('identity-principal-required');
                                    // A conflicting insert is not success until its existing binding matches the requested principal.
                                    yield* sql`INSERT INTO identity_federation (issuer, external_subject, subject) VALUES (${key.issuer}, ${key.subject}, ${canonical}) ON CONFLICT (issuer, external_subject) DO NOTHING`;
                                    const [row] = yield* sql<{
                                        subject: string;
                                    }>`SELECT subject FROM identity_federation WHERE issuer = ${key.issuer} AND external_subject = ${key.subject}`;
                                    if (row?.subject !== canonical) return yield* failure('identity-link-collision');
                                }
                            )
                        )
                        .pipe(
                            Effect.catchTag(
                                'SqlError',
                                /** Retain collision failures without returning federation data in SQL diagnostics. */ () =>
                                    Effect.fail(failure('database'))
                            )
                        ),
                /** Resolve an exact federation key in this tenant database; absence neither provisions nor authenticates a principal. */
                lookup: (external) =>
                    Effect.gen(
                        /** Validate both the external key and any stored canonical subject without normalizing either. */ function* () {
                            // Preserve the issuer and external subject exactly; URL normalization would merge distinct bindings.
                            const key = yield* decode(FederatedSubject, external);
                            const [row] = yield* sql<{
                                subject: string;
                            }>`SELECT subject FROM identity_federation WHERE issuer = ${key.issuer} AND external_subject = ${key.subject}`;
                            return row ? yield* decode(SubjectId, row.subject) : undefined;
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /** Do not leak federation keys through database diagnostics. */ () =>
                                Effect.fail(failure('database'))
                        )
                    ),
                /** Read at most 100 newest receipts and reject cross-tenant contents; operator access is authorized elsewhere. */
                audit: (limit) =>
                    Effect.gen(
                        /** Bound the receipt page before decoding and checking every entry's captured tenant. */ function* () {
                            const bounded = yield* decode(Schema.Int.pipe(Schema.between(1, 100)), limit);
                            const rows = yield* sql<{
                                receipt: string;
                            }>`SELECT receipt FROM action_receipt ORDER BY id DESC LIMIT ${bounded}`;
                            const receipts = yield* Effect.forEach(
                                rows,
                                /** Decode persisted audit evidence before exposing it as a receipt. */ (row) =>
                                    decode(Schema.parseJson(Receipt), row.receipt)
                            );
                            // Database routing alone is insufficient evidence that persisted receipts belong to this tenant.
                            if (
                                receipts.some(
                                    /** Fail the whole bounded page if any receipt crosses the captured tenant boundary. */ (
                                        receipt
                                    ) => receipt.caller.tenant !== tenant.id
                                )
                            )
                                return yield* failure('identity-audit-tenant-mismatch');
                            return receipts;
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /** Preserve audit validation failures and redact SQL diagnostics. */ () =>
                                Effect.fail(failure('database'))
                        )
                    ),
            });
        }
    )
);
