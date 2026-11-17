/**
 * @file packages/integrations/sql/src/resource.ts
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

import { createHash } from 'node:crypto';
import { SqlClient } from '@effect/sql';
import { HookChangeFeed, HookOutbox, HookRecovery } from '@eventiva/contracts/hook';
import type { TenantId } from '@eventiva/contracts/ids';
import {
    canonicalDefinition,
    validateDefinition,
    validateEvolution,
    ResourceDefinition,
    ResourceFailure,
    ResourceMigrationPolicy,
    ResourceProviderIdentity,
    type Fields,
    type ResourceDriver,
    type ResourceMigrationEvidence,
    type ResourceMigrationPlan,
    type ResourceMigrationResult,
    type ResourceProvider,
    type ResourceRecord,
} from '@eventiva/contracts/resource';
import { CurrentTenant, JsonValue, UuidV7 } from '@eventiva/contracts/storage';
import { Context, Effect, Either, Option, Redacted, Schema } from 'effect';
import { hookContext } from './hook.ts';
import type { Dialect } from './migrations.ts';
import { transactionScope, type TransactionScope } from './transaction.ts';

/** Construct a resource-domain failure with an explicit detail and a storage reason unless overridden. */
const fail = (detail: string, reason: ResourceFailure['reason'] = 'storage') => new ResourceFailure({ reason, detail });
/** Keep underlying driver or codec errors redacted while exposing only a fixed resource-storage failure detail. */
const sqlFailure = (cause: Error) =>
    new ResourceFailure({ reason: 'storage', detail: 'Resource SQL operation failed', cause: Redacted.make(cause) });
// Migrations and provider acquisition never inherit an ambient connection, even from a trusted root.
/** Refuse any ambient SQL transaction before migration or provider acquisition, including a different trusted root. */
const checkTransaction = () =>
    Effect.gen(
        /** Reject an inherited transaction instead of allowing Effect SQL to reuse a foreign connection. */ function* () {
            const transaction = yield* Effect.serviceOption(SqlClient.TransactionConnection);
            if (Option.isNone(transaction)) return;
            return yield* fail(
                'Resource operation cannot inherit another provider or unowned SQL transaction',
                'denied'
            );
        }
    );
const definitionJson = Schema.parseJson(ResourceDefinition);
/** Decode persisted definition JSON exactly; canonical agreement is checked separately by migration or binding. */
const decodeDefinition = (text: string) =>
    Schema.decodeUnknown(definitionJson)(text, { onExcessProperty: 'error' }).pipe(Effect.mapError(sqlFailure));
const StoredSchemaRow = Schema.Struct({
    resource: ResourceDefinition.fields.id,
    version: ResourceDefinition.fields.version,
    definition: Schema.String,
    checksum: Schema.String.pipe(Schema.pattern(/^[a-f0-9]{64}$/)),
});
const StoredRow = Schema.Struct({
    id: UuidV7,
    revision: Schema.Number.pipe(Schema.int(), Schema.between(1, 2147483647)),
    schema_version: Schema.Number.pipe(Schema.int(), Schema.between(1, 2147483647)),
    payload: Schema.String,
});
type Row = typeof StoredRow.Type;
// Vendor data stays private and is decoded, not asserted into a domain record by SqlClient's generic.
/** Decode row identity, version pins and scalar payload shape; runtime retains resource-specific field validation. */
const decodeRow = (input: Row) =>
    Effect.gen(
        /** Translate validated SQL metadata and JSON scalar fields into the portable record representation. */ function* () {
            const row = yield* Schema.decodeUnknown(StoredRow)(input);
            // Stored scalar shape is not the active resource codec; historical records keep their writing schema version.
            const value = yield* Schema.decodeUnknown(
                Schema.parseJson(
                    Schema.Record({
                        key: Schema.String,
                        value: Schema.Union(Schema.String, Schema.JsonNumber, Schema.Boolean),
                    })
                )
            )(row.payload);
            return {
                id: row.id,
                revision: row.revision,
                schemaVersion: row.schema_version,
                value,
            } satisfies ResourceRecord<Fields>;
        }
    ).pipe(Effect.mapError(sqlFailure));

/** Pure preflight. Retained generations/restarts/staged changes are refused before client acquisition or DDL. */
export const planResourceMigrations = (
    history: ReadonlyArray<ResourceDefinition>,
    policy: ResourceMigrationPolicy
): Effect.Effect<ResourceMigrationPlan, ResourceFailure> =>
    Effect.gen(
        /** Refuse unsafe online admission before deriving deterministic, version-linked migration evidence. */ function* () {
            const admission = yield* Schema.decodeUnknown(ResourceMigrationPolicy)(policy, {
                onExcessProperty: 'error',
            }).pipe(Effect.mapError(sqlFailure));
            if (admission.retainedGenerations > 0)
                return { status: 'restart-required', reason: 'active-generations' } as const;
            if (admission.restartRequired) return { status: 'restart-required', reason: 'declared' } as const;
            if (admission.kind === 'staged') return { status: 'restart-required', reason: 'migration' } as const;
            // Only contiguous additive histories may be advertised as ready; planning does not execute or admit a provider.
            const previous = new Map<string, ResourceDefinition>();
            const checked: Array<ResourceDefinition> = [];
            const migrations: Array<ResourceMigrationEvidence> = [];
            for (const input of history) {
                const definition = yield* validateDefinition(input);
                const last = previous.get(definition.id);
                if (last) {
                    const compatible = yield* Effect.either(validateEvolution(last, definition));
                    if (Either.isLeft(compatible)) return { status: 'restart-required', reason: 'migration' } as const;
                } else if (definition.version !== 1)
                    return yield* fail('Resource history must start at version 1', 'unsafe-migration');
                const checksum = createHash('sha256').update(canonicalDefinition(definition)).digest('hex');
                migrations.push({
                    id: `${definition.id}.v${definition.version}`,
                    checksum,
                    resource: definition.id,
                    from: last?.version ?? 0,
                    to: definition.version,
                    dependencies: last ? [`${last.id}.v${last.version}`] : [],
                    kind: 'additive',
                    online: true,
                    compatibleFrom: 1,
                    compatibleThrough: definition.version,
                });
                checked.push(definition);
                previous.set(definition.id, definition);
            }
            return { status: 'ready', history: checked, migrations } as const;
        }
    );

/** Privileged forward-only gate re-plans rather than trusting a caller-forged plan. Kernel must fence leases first. */
export const migrateResources = (
    dialect: Dialect,
    tenant: TenantId,
    history: ReadonlyArray<ResourceDefinition>,
    policy: ResourceMigrationPolicy
): Effect.Effect<ResourceMigrationResult, ResourceFailure, SqlClient.SqlClient> =>
    Effect.gen(
        /** Recompute admission before touching SQL, then apply tenant-bound history under one transaction. */ function* () {
            const plan = yield* planResourceMigrations(history, policy);
            if (plan.status === 'restart-required') return plan;
            // Caller-supplied history cannot bypass preflight or borrow an existing transaction's migration authority.
            yield* checkTransaction();
            const sql = yield* SqlClient.SqlClient;
            return yield* sql.withTransaction(
                Effect.gen(
                    /** Fence tenant writes, preserve immutable schema history and install only checked additive versions. */ function* () {
                        if (dialect === 'postgres') yield* sql`SELECT pg_advisory_xact_lock(4217002)`;
                        yield* sql`CREATE TABLE IF NOT EXISTS resource_tenant (singleton integer PRIMARY KEY CHECK (singleton = 1), tenant text NOT NULL)`;
                        yield* sql`INSERT INTO resource_tenant (singleton, tenant) VALUES (1, ${tenant}) ON CONFLICT (singleton) DO NOTHING`;
                        yield* sql`UPDATE resource_tenant SET tenant = tenant WHERE singleton = 1`;
                        const [binding] = yield* sql<{
                            tenant: string;
                        }>`SELECT tenant FROM resource_tenant WHERE singleton = 1`;
                        if (binding?.tenant !== tenant)
                            return yield* fail('A resource database belongs to exactly one tenant', 'denied');
                        yield* sql`CREATE TABLE IF NOT EXISTS resource_schema (resource text NOT NULL, version integer NOT NULL, definition text NOT NULL, checksum text NOT NULL, PRIMARY KEY (resource, version))`;
                        yield* sql`CREATE TABLE IF NOT EXISTS resource_record (resource text NOT NULL, id text NOT NULL, revision integer NOT NULL, schema_version integer NOT NULL, payload text NOT NULL, PRIMARY KEY (resource, id), FOREIGN KEY (resource, schema_version) REFERENCES resource_schema(resource, version))`;
                        yield* sql`CREATE INDEX IF NOT EXISTS resource_record_schema ON resource_record(resource, schema_version)`;
                        yield* sql`CREATE TABLE IF NOT EXISTS resource_revision (resource text NOT NULL, id text NOT NULL, revision integer NOT NULL, schema_version integer NOT NULL, payload text NOT NULL, PRIMARY KEY (resource, id, revision), FOREIGN KEY (resource, id) REFERENCES resource_record(resource, id), FOREIGN KEY (resource, schema_version) REFERENCES resource_schema(resource, version))`;
                        yield* sql`CREATE INDEX IF NOT EXISTS resource_revision_schema ON resource_revision(resource, schema_version)`;
                        // Both database dialects enforce history immutability even against accidental privileged updates.
                        if (dialect === 'postgres') {
                            yield* sql.unsafe(
                                `CREATE OR REPLACE FUNCTION resource_reject_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF TG_TABLE_NAME = 'resource_tenant' AND TG_OP = 'UPDATE' THEN IF OLD.tenant = NEW.tenant AND OLD.singleton = NEW.singleton THEN RETURN NEW; END IF; END IF; RAISE EXCEPTION 'Resource history is immutable'; END $$`
                            );
                            for (const table of ['resource_schema', 'resource_revision', 'resource_tenant']) {
                                const exists =
                                    yield* sql`SELECT 1 FROM pg_trigger WHERE tgname = ${table + '_immutable'} AND tgrelid = ${table}::regclass`;
                                if (exists.length === 0)
                                    yield* sql.unsafe(
                                        `CREATE TRIGGER ${table}_immutable BEFORE UPDATE OR DELETE ON ${table} FOR EACH ROW EXECUTE FUNCTION resource_reject_mutation()`
                                    );
                            }
                        } else {
                            for (const table of ['resource_schema', 'resource_revision', 'resource_tenant']) {
                                for (const operation of table === 'resource_tenant' ? ['DELETE'] : ['UPDATE', 'DELETE'])
                                    yield* sql.unsafe(
                                        `CREATE TRIGGER IF NOT EXISTS ${table}_immutable_${operation.toLowerCase()} BEFORE ${operation} ON ${table} BEGIN SELECT RAISE(ABORT, 'Resource history is immutable'); END`
                                    );
                            }
                            yield* sql`CREATE TRIGGER IF NOT EXISTS resource_tenant_immutable_update BEFORE UPDATE ON resource_tenant WHEN OLD.tenant <> NEW.tenant OR OLD.singleton <> NEW.singleton BEGIN SELECT RAISE(ABORT, 'Resource tenant binding is immutable'); END`;
                        }
                        const applied = yield* Schema.decodeUnknown(Schema.Array(StoredSchemaRow))(
                            yield* sql`SELECT resource, version, definition, checksum FROM resource_schema ORDER BY resource, version`
                        ).pipe(Effect.mapError(sqlFailure));
                        const candidates = new Map<string, Array<ResourceDefinition>>();
                        for (const input of plan.history) {
                            const definition = yield* validateDefinition(input);
                            const versions = candidates.get(definition.id) ?? [];
                            const previous = versions.at(-1);
                            if (previous) yield* validateEvolution(previous, definition);
                            else if (definition.version !== 1)
                                return yield* fail('Resource history must start at version 1', 'unsafe-migration');
                            versions.push(definition);
                            candidates.set(definition.id, versions);
                        }
                        for (const row of applied) {
                            const candidate = candidates.get(row.resource)?.[row.version - 1];
                            const previous = yield* decodeDefinition(row.definition);
                            const evidence = plan.migrations.find(
                                /** Match immutable applied rows to their independently recomputed migration evidence. */
                                (migration) => migration.resource === row.resource && migration.to === row.version
                            );
                            if (
                                !candidate ||
                                canonicalDefinition(previous) !== canonicalDefinition(candidate) ||
                                row.checksum !== evidence?.checksum
                            )
                                return yield* fail(
                                    'Applied resource history was removed or changed',
                                    'unsafe-migration'
                                );
                        }
                        const executed: Array<ResourceMigrationEvidence> = [];
                        for (const versions of candidates.values()) {
                            for (const definition of versions) {
                                if (
                                    applied.some(
                                        /** Do not rewrite an already validated immutable schema version. */ (row) =>
                                            row.resource === definition.id && row.version === definition.version
                                    )
                                )
                                    continue;
                                const json = yield* Schema.encode(definitionJson)(definition).pipe(
                                    Effect.mapError(sqlFailure)
                                );
                                const evidence = plan.migrations.find(
                                    /** Use the planned checksum for this exact resource/version insertion. */
                                    (migration) =>
                                        migration.resource === definition.id && migration.to === definition.version
                                );
                                if (!evidence)
                                    return yield* fail(
                                        'Missing planned resource migration evidence',
                                        'unsafe-migration'
                                    );
                                yield* sql`INSERT INTO resource_schema (resource, version, definition, checksum) VALUES (${definition.id}, ${definition.version}, ${json}, ${evidence.checksum})`;
                                executed.push(evidence);
                            }
                        }
                        return { status: 'applied', migrations: executed } as const;
                    }
                )
            );
        }
    ).pipe(
        Effect.catchTag(
            'SqlError',
            /** Redact database details without changing explicit migration/admission failures. */ (cause) =>
                Effect.fail(sqlFailure(cause))
        )
    );

/** Bind checked active definitions and provider identity to a tenant database and its private transaction owner. */
const bindResourceProvider = (
    dialect: Dialect,
    tenant: TenantId,
    identity: ResourceProviderIdentity,
    definitions: ReadonlyArray<ResourceDefinition>,
    owner: TransactionScope
) =>
    Effect.gen(
        /** Validate provider identity and applied schema agreement before exposing a captured SQL driver. */ function* () {
            const providerIdentity = yield* Schema.decodeUnknown(ResourceProviderIdentity)(identity, {
                onExcessProperty: 'error',
            }).pipe(Effect.mapError(sqlFailure));
            yield* checkTransaction();
            const sql = yield* SqlClient.SqlClient;
            const checkOwner = owner.check.pipe(
                Effect.mapError(
                    /** Translate a foreign-root connection into a denied resource operation without exposing its details. */ () =>
                        fail('Resource operation cannot inherit an unowned SQL transaction', 'denied')
                )
            );
            const [binding] = yield* sql<{ tenant: string }>`SELECT tenant FROM resource_tenant WHERE singleton = 1`;
            if (binding?.tenant !== tenant) return yield* fail('Resource provider tenant binding mismatch', 'denied');
            const active = yield* Schema.decodeUnknown(Schema.Array(StoredSchemaRow))(
                yield* sql`SELECT resource, version, definition, checksum FROM resource_schema WHERE (resource, version) IN (SELECT resource, MAX(version) FROM resource_schema GROUP BY resource)`
            ).pipe(Effect.mapError(sqlFailure));
            const checked: Array<ResourceDefinition> = [];
            // Binding accepts only the applied active schema; a merely compatible or forged declaration is insufficient.
            for (const input of definitions) {
                const definition = yield* validateDefinition(input);
                const applied = active.find(
                    /** Locate this resource's highest applied version for canonical comparison. */ (row) =>
                        row.resource === definition.id
                );
                if (
                    !applied ||
                    canonicalDefinition(yield* decodeDefinition(applied.definition)) !== canonicalDefinition(definition)
                )
                    return yield* fail('Resource declaration is not the applied active version', 'schema-mismatch');
                checked.push(definition);
            }
            const driver: ResourceDriver = {
                /** Read a record from the captured database, rejecting foreign ambient transactions and preserving schema pins. */
                get: (resource, id) =>
                    Effect.gen(
                        /** Check transaction provenance before loading and decoding an optional stored row. */ function* () {
                            yield* checkOwner;
                            const [row] =
                                yield* sql<Row>`SELECT id, revision, schema_version, payload FROM resource_record WHERE resource = ${resource} AND id = ${id}`;
                            return row ? yield* decodeRow(row) : undefined;
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /** Redact driver details on record lookup failure. */ (cause) =>
                                Effect.fail(sqlFailure(cause))
                        )
                    ),
                /** Run the runtime-validated keyset query with bound values and dialect-specific scalar JSON equality. */
                query: (resource, query) =>
                    Effect.gen(
                        /** Preserve transaction ownership and normalize only dialect-specific comparison representations. */ function* () {
                            yield* checkOwner;
                            const where = query.where;
                            // Identifiers and JSON paths come only from validated declarations, values remain bound parameters.
                            const key = where ? String(where.field) : '';
                            const path = '$.' + key;
                            const jsonValue =
                                dialect === 'postgres'
                                    ? sql`payload::jsonb ->> ${key}`
                                    : sql`json_extract(payload, ${path})`;
                            const value =
                                where && typeof where.equals === 'boolean' && dialect === 'sqlite'
                                    ? Number(where.equals)
                                    : where?.equals;
                            const predicate = where
                                ? dialect === 'postgres'
                                    ? sql`${jsonValue} = ${String(value)}`
                                    : sql`${jsonValue} = ${value}`
                                : sql.literal('1 = 1');
                            const rows =
                                yield* sql<Row>`SELECT id, revision, schema_version, payload FROM resource_record WHERE resource = ${resource.id} AND id > ${query.after ?? ''} AND ${predicate} ORDER BY id LIMIT ${query.limit}`;
                            return yield* Effect.forEach(rows, decodeRow);
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /** Keep database query details redacted from resource failures. */ (cause) =>
                                Effect.fail(sqlFailure(cause))
                        )
                    ),
                /** Perform an optimistic write and append its revision; callers must supply the atomic storage transaction. Zero means create. */
                write: (resource, id, revision, value) =>
                    Effect.gen(
                        /** Fence migrations and recheck the active schema before updating the record and immutable revision history. */ function* () {
                            yield* checkOwner;
                            // Migration takes an exclusive tenant lock. PG writes share it; SQLite serializes writes.
                            if (dialect === 'postgres')
                                yield* sql`SELECT singleton FROM resource_tenant WHERE singleton = 1 FOR SHARE`;
                            else yield* sql`UPDATE resource_tenant SET tenant = tenant WHERE singleton = 1`;
                            const [schema] = yield* sql<{
                                readonly definition: string;
                            }>`SELECT definition FROM resource_schema WHERE resource = ${resource.id} ORDER BY version DESC LIMIT 1`;
                            if (
                                !schema ||
                                canonicalDefinition(yield* decodeDefinition(schema.definition)) !==
                                    canonicalDefinition(resource)
                            )
                                return yield* fail(
                                    'Migration changed the active resource; recompose before writing',
                                    'schema-mismatch'
                                );
                            const checked = yield* Schema.decodeUnknown(JsonValue)(value).pipe(
                                Effect.mapError(sqlFailure)
                            );
                            const payload = yield* Schema.encode(Schema.parseJson(JsonValue))(checked).pipe(
                                Effect.mapError(sqlFailure)
                            );
                            const rows =
                                revision === 0
                                    ? yield* sql<Row>`INSERT INTO resource_record (resource, id, revision, schema_version, payload) VALUES (${resource.id}, ${id}, 1, ${resource.version}, ${payload}) ON CONFLICT (resource, id) DO NOTHING RETURNING id, revision, schema_version, payload`
                                    : yield* sql<Row>`UPDATE resource_record SET revision = revision + 1, schema_version = ${resource.version}, payload = ${payload} WHERE resource = ${resource.id} AND id = ${id} AND revision = ${revision} RETURNING id, revision, schema_version, payload`;
                            const row = rows[0];
                            if (!row) return yield* fail('Record exists or revision changed', 'conflict');
                            yield* sql`INSERT INTO resource_revision (resource, id, revision, schema_version, payload) VALUES (${resource.id}, ${id}, ${row.revision}, ${resource.version}, ${payload})`;
                            return yield* decodeRow(row);
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /** Preserve explicit schema/revision conflicts while redacting SQL diagnostics. */ (
                                cause
                            ) => Effect.fail(sqlFailure(cause))
                        )
                    ),
                /** Read all immutable revisions in ascending order, retaining each version's original schema pin. */
                history: (resource, id) =>
                    Effect.gen(
                        /** Verify transaction provenance before decoding the ordered stored revision sequence. */ function* () {
                            yield* checkOwner;
                            const rows =
                                yield* sql<Row>`SELECT id, revision, schema_version, payload FROM resource_revision WHERE resource = ${resource} AND id = ${id} ORDER BY revision`;
                            return yield* Effect.forEach(rows, decodeRow);
                        }
                    ).pipe(
                        Effect.catchTag(
                            'SqlError',
                            /** Keep revision-query driver details behind the redacted storage failure. */ (cause) =>
                                Effect.fail(sqlFailure(cause))
                        )
                    ),
            };
            return {
                identity: providerIdentity,
                tenant,
                definitions: checked,
                storage: owner.storage,
                driver,
            } satisfies ResourceProvider;
        }
    ).pipe(
        Effect.catchTag(
            'SqlError',
            /** Do not expose provider-acquisition SQL details in the public error representation. */ (cause) =>
                Effect.fail(sqlFailure(cause))
        )
    );

/** Captures one scoped client and private transaction root. Runtime owns policy orchestration. */
export const resourceProvider = (
    dialect: Dialect,
    tenant: TenantId,
    identity: ResourceProviderIdentity,
    definitions: ReadonlyArray<ResourceDefinition>
) =>
    Effect.gen(
        /** Acquire a private transaction root, then bind only this tenant's applied active resource definitions. */ function* () {
            const owner = yield* transactionScope(dialect, 'resource-provider-boundary');
            return yield* bindResourceProvider(dialect, tenant, identity, definitions, owner);
        }
    );

/** Trusted composition: resources, durable Integrity and hook staging use ONE Storage transaction owner.
 * This grants no release/sink authority and executes no observer in the originating transaction.
 */
export const resourceHookProvider = (
    dialect: Dialect,
    tenant: TenantId,
    identity: ResourceProviderIdentity,
    definitions: ReadonlyArray<ResourceDefinition>
) =>
    Effect.gen(
        /** Compose resource and hook capabilities only after checking their shared authenticated tenant. */ function* () {
            // Resource writes and hook staging must share both the tenant and the exact transaction owner, not just a SQL client.
            if ((yield* CurrentTenant).id !== tenant)
                return yield* fail('Hook resource tenant binding mismatch', 'denied');
            const owner = yield* transactionScope(dialect, 'resource-provider-boundary');
            const provider = yield* bindResourceProvider(dialect, tenant, identity, definitions, owner);
            const context = yield* hookContext(dialect, owner);
            return {
                ...provider,
                outbox: Context.get(context, HookOutbox),
                feed: Context.get(context, HookChangeFeed),
                recovery: Context.get(context, HookRecovery),
            };
        }
    );
