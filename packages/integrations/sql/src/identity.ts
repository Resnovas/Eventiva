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

/**
 * Build with the exact tenant client used by Storage; never expose this client through TenantRouter.
 *
 * @since 0.0.1
 * @example
 * const program = Effect.provide(signIn, identityStore);
 */
export const identityStore = Layer.effect(
    IdentityStore,
    Effect.gen(
        /** Capture one authenticated tenant and its storage client; persistence does not grant caller permissions. */ function* () {
            const tenant = yield* CurrentTenant;
            const sql = yield* SqlClient.SqlClient;
            // All tables belong to the routed database; never choose a tenant from a presented identity record.
            /**
             * Report only the closed identity failure reason, never driver diagnostics or stored identity contents.
             *
             * @param reason - The closed identity failure reason to report.
             * @returns A StorageFailure for the `identity` operation carrying only that reason.
             */
            const failure = (reason: NonNullable<StorageFailure['reason']>) =>
                new StorageFailure({ operation: 'identity', reason });
            /**
             * Decode exact records and versions at the storage boundary, including values supplied by typed callers.
             *
             * @template A - The decoded value.
             * @template I - The encoded input accepted by the schema.
             * @param schema - The schema the value must satisfy exactly, with no excess properties.
             * @param value - The value to decode.
             * @returns The decoded value.
             * @fails {StorageFailure} With `invalid-data` when the value does not decode.
             */
            const decode = <A, I>(schema: Schema.Schema<A, I>, value: NoInfer<I>) =>
                Schema.decode(schema)(value, { onExcessProperty: 'error' }).pipe(
                    Effect.mapError(
                        /**
                         * Replace schema diagnostics so malformed identity data cannot escape through errors.
                         *
                         * @returns A StorageFailure with the `invalid-data` reason.
                         */
                        () => failure('invalid-data')
                    )
                );
            const lock = sql`UPDATE identity_guard SET version = version WHERE id = 1 RETURNING id`.pipe(
                Effect.flatMap(
                    /**
                     * Refuse a database without the singleton guard; an empty update would otherwise provide no lock.
                     *
                     * @param rows - The rows the guard update returned.
                     * @returns Success when exactly one guard row was locked.
                     * @fails {StorageFailure} With `identity-guard-missing` when the guard row is absent.
                     */
                    (rows) => (rows.length === 1 ? Effect.void : Effect.fail(failure('identity-guard-missing')))
                ),
                Effect.catchTag(
                    'SqlError',
                    /**
                     * Hide database diagnostics while preserving the missing-guard domain failure.
                     *
                     * @returns A failure with the `database` reason.
                     */
                    () => Effect.fail(failure('database'))
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
            /**
             * Select the decoded record schema associated with the closed identity kind.
             *
             * @template K - The identity kind.
             * @param kind - The identity kind whose record schema is wanted.
             * @returns The type-side schema for that kind's record.
             */
            const codec = <K extends IdentityKind>(kind: K): Schema.Schema<IdentityRecords[K]> => codecs[kind];
            /**
             * Quote a table identifier derived only from the internal closed identity-kind vocabulary.
             *
             * @param kind - The identity kind naming the table.
             * @returns The quoted `identity_<kind>` table identifier.
             */
            const table = (kind: IdentityKind) => sql(`identity_${kind}`);
            /**
             * Read one exact record and version; absence is distinct from corrupt persisted data.
             *
             * @param kind - The identity kind to read.
             * @param id - The record id, which must match the id embedded in the stored body.
             * @returns The decoded record and its version, or undefined when no row exists.
             * @fails {StorageFailure} With `invalid-data`, `identity-key-mismatch` or `database` for corrupt data, a mismatched id or a database error.
             */
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
                        /**
                         * Do not expose SQL or record contents through read failures.
                         *
                         * @returns A failure with the `database` reason.
                         */
                        () => Effect.fail(failure('database'))
                    )
                );
            return IdentityStore.of({
                tenant: tenant.id,
                lock,
                get,
                /**
                 * Atomically insert at version zero or advance the expected version; callers still own authorization.
                 *
                 * @param kind - The identity kind to write.
                 * @param value - The record to store, validated before encoding.
                 * @param expectedVersion - The version the writer last read, or null to insert at version zero.
                 * @returns An effect that completes once exactly one row was written inside the guarded transaction.
                 * @fails {StorageFailure} With `identity-version-conflict` when the row exists or the version is stale, `invalid-data` for an invalid record, `identity-guard-missing` without the guard, or `database`.
                 */
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
                                            /**
                                             * Keep invalid record details out of persistence failures.
                                             *
                                             * @returns A StorageFailure with the `invalid-data` reason.
                                             */
                                            () => failure('invalid-data')
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
                                /**
                                 * Preserve version conflicts but redact driver failures.
                                 *
                                 * @returns A failure with the `database` reason.
                                 */
                                () => Effect.fail(failure('database'))
                            )
                        ),
                /**
                 * Return decoded teams containing the subject in stable ID order; this lookup does not authorize a grant.
                 *
                 * @param subject - The subject whose explicit team memberships are wanted.
                 * @returns The teams listing the subject as a member, ordered by id.
                 * @fails {StorageFailure} With `invalid-data` when any stored team is corrupt, or `database`.
                 */
                teams: (subject) =>
                    Effect.gen(
                        /** Reject corrupt team records before selecting the subject's explicit memberships. */ function* () {
                            const rows = yield* sql<{ body: string }>`SELECT body FROM identity_team ORDER BY id`;
                            // Validate the complete stored team set rather than silently skipping malformed membership data.
                            const teams = yield* Effect.forEach(
                                rows,
                                /**
                                 * Reject malformed team bodies before testing their membership lists.
                                 *
                                 * @param row - The stored team row.
                                 * @returns The decoded team.
                                 */
                                (row) => decode(Schema.parseJson(records.team), row.body)
                            );
                            return teams.filter(
                                /**
                                 * Match explicit team membership without deriving roles or permissions here.
                                 *
                                 * @param team - The decoded team to test.
                                 * @returns Whether the subject is listed as a member.
                                 */
                                (team) => team.members.includes(subject)
                            );
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /**
                             * Hide driver details without swallowing invalid team data.
                             *
                             * @returns A failure with the `database` reason.
                             */
                            () => Effect.fail(failure('database'))
                        )
                    ),
                /**
                 * Idempotently bind an exact issuer/subject pair to an active local principal; never silently relink it.
                 *
                 * @param external - The exact federated issuer and subject pair.
                 * @param subject - The local principal's subject id, which must be active.
                 * @returns An effect that completes once the pair is bound to that principal.
                 * @fails {StorageFailure} With `identity-principal-required` for a missing or inactive principal, `identity-link-collision` when the pair is bound elsewhere, `invalid-data`, `identity-guard-missing` or `database`.
                 */
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
                                /**
                                 * Retain collision failures without returning federation data in SQL diagnostics.
                                 *
                                 * @returns A failure with the `database` reason.
                                 */
                                () => Effect.fail(failure('database'))
                            )
                        ),
                /**
                 * Resolve an exact federation key in this tenant database; absence neither provisions nor authenticates a principal.
                 *
                 * @param external - The exact federated issuer and subject pair to resolve.
                 * @returns The bound local subject id, or undefined when the pair is not linked.
                 * @fails {StorageFailure} With `invalid-data` for an invalid key or stored subject, or `database`.
                 */
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
                            /**
                             * Do not leak federation keys through database diagnostics.
                             *
                             * @returns A failure with the `database` reason.
                             */
                            () => Effect.fail(failure('database'))
                        )
                    ),
                /**
                 * Read at most 100 newest receipts and reject cross-tenant contents; operator access is authorized elsewhere.
                 *
                 * @param limit - The page size, an integer from 1 to 100.
                 * @returns The newest receipts, newest first.
                 * @fails {StorageFailure} With `invalid-data` for a bad limit or corrupt receipt, `identity-audit-tenant-mismatch` when any receipt names another tenant, or `database`.
                 */
                audit: (limit) =>
                    Effect.gen(
                        /** Bound the receipt page before decoding and checking every entry's captured tenant. */ function* () {
                            const bounded = yield* decode(Schema.Int.pipe(Schema.between(1, 100)), limit);
                            const rows = yield* sql<{
                                receipt: string;
                            }>`SELECT receipt FROM action_receipt ORDER BY id DESC LIMIT ${bounded}`;
                            const receipts = yield* Effect.forEach(
                                rows,
                                /**
                                 * Decode persisted audit evidence before exposing it as a receipt.
                                 *
                                 * @param row - The stored receipt row.
                                 * @returns The decoded receipt.
                                 */
                                (row) => decode(Schema.parseJson(Receipt), row.receipt)
                            );
                            // Database routing alone is insufficient evidence that persisted receipts belong to this tenant.
                            if (
                                receipts.some(
                                    /**
                                     * Fail the whole bounded page if any receipt crosses the captured tenant boundary.
                                     *
                                     * @param receipt - The decoded receipt to test.
                                     * @returns Whether the receipt belongs to another tenant.
                                     */
                                    (receipt) => receipt.caller.tenant !== tenant.id
                                )
                            )
                                return yield* failure('identity-audit-tenant-mismatch');
                            return receipts;
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /**
                             * Preserve audit validation failures and redact SQL diagnostics.
                             *
                             * @returns A failure with the `database` reason.
                             */
                            () => Effect.fail(failure('database'))
                        )
                    ),
            });
        }
    )
);
