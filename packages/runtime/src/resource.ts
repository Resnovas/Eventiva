/**
 * @file packages/runtime/src/resource.ts
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

import { Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { CurrentTenant, StorageFailure, UuidV7 } from '@eventiva/contracts/storage';
import {
    canonicalDefinition,
    decodeResource,
    resourceFieldSchema,
    validateDefinition,
    ResourceFailure,
    ResourceProviderIdentity,
    Resources,
    type Fields,
    type Resource,
    type ResourceDefinition,
    type ResourceOperation,
    type ResourceProvider,
    type ResourceRecord,
} from '@eventiva/contracts/resource';
import { Effect, Layer, Option, Redacted, Schema } from 'effect';

/** Expose bounded resource diagnostics while keeping an optional underlying error redacted. */
const failure = (reason: ResourceFailure['reason'], detail: string, cause?: Error) =>
    new ResourceFailure({ reason, detail, ...(cause ? { cause: Redacted.make(cause) } : {}) });
/** Strictly decode resource-boundary values and retain validation causes only in the redacted failure field. */
const decode = <A, I>(schema: Schema.Schema<A, I>, input: I) =>
    Schema.decodeUnknown(schema)(input, { onExcessProperty: 'error' }).pipe(
        Effect.mapError(
            /** Keep rejected values and schema internals out of the public resource diagnostic. */ (cause) =>
                failure('invalid-value', 'Schema validation failed', cause)
        )
    );

/** App/kernel composition supplies a named provider and live policy; integrations never depend on runtime. */
export const resourceRuntime = (
    provider: ResourceProvider,
    /** Authorize this provider's current tenant caller for a resource operation; transaction scope uses the explicit wildcard target. */
    authorize: (
        caller: CallerIdentity,
        resource: string,
        operation: ResourceOperation
    ) => Effect.Effect<void, ResourceFailure>
) =>
    Layer.effect(
        Resources,
        Effect.gen(
            /** Build a validated active-definition catalogue and enforce tenant/policy checks before driver access. */ function* () {
                // A named provider may expose only its validated active composed definitions, never arbitrary caller-supplied schemas.
                yield* decode(ResourceProviderIdentity, provider.identity);
                const { tenant, driver, storage } = provider;
                const catalog = new Map<string, ResourceDefinition>();
                for (const input of provider.definitions) {
                    const definition = yield* validateDefinition(input);
                    if (catalog.has(definition.id))
                        return yield* failure('invalid-definition', 'Duplicate active resource');
                    catalog.set(definition.id, definition);
                }
                /** Require matching ambient caller/tenant scope before consulting the composition-supplied live policy. */
                const check = (id: string, operation: ResourceOperation) =>
                    Effect.gen(
                        /** Reject absent or cross-tenant context before resource authorization can grant access. */ function* () {
                            // Provider routing is fixed at composition; neither ambient service may select another tenant's driver.
                            const caller = yield* Effect.serviceOption(Caller);
                            const current = yield* Effect.serviceOption(CurrentTenant);
                            if (
                                Option.isNone(caller) ||
                                caller.value.tenant !== tenant ||
                                Option.isNone(current) ||
                                current.value.id !== tenant
                            )
                                return yield* failure(
                                    'denied',
                                    'Authenticated tenant scope does not match this resource provider'
                                );
                            yield* authorize(caller.value, id, operation);
                        }
                    );
                /** Authorize access only through the exact currently composed definition, including its ownership/version pins. */
                const resolve = (input: Resource, operation: ResourceOperation) =>
                    Effect.gen(
                        /** Validate requested structure and policy before comparing it with the provider's active canonical declaration. */ function* () {
                            // Matching an id alone cannot permit an older or independently altered field schema to reach the driver.
                            const requested = yield* validateDefinition(input);
                            yield* check(requested.id, operation);
                            const definition = catalog.get(requested.id);
                            if (!definition || canonicalDefinition(definition) !== canonicalDefinition(requested))
                                return yield* failure(
                                    'schema-mismatch',
                                    'Only the active composed declaration can access resources'
                                );
                            // Give drivers the detached validated request, never the catalogue that admits later calls.
                            return requested;
                        }
                    );
                /** Join the provider's storage transaction, sanitizing storage errors while preserving domain failures. */
                const transaction = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
                    storage
                        .transaction(effect)
                        .pipe(
                            Effect.mapError(
                                /** Translate only infrastructure failure; caller effects retain their declared error contract. */ (
                                    cause
                                ) =>
                                    cause instanceof StorageFailure
                                        ? failure('storage', 'Resource transaction failed', cause)
                                        : cause
                            )
                        );
                /** Revalidate driver data through the requested active field types while preserving stored record metadata. */
                const record = <F extends Fields>(resource: Resource<F>, row: ResourceRecord<Fields>) =>
                    decodeResource(resource, row.value).pipe(
                        Effect.map(
                            /** Replace only the untyped stored value with its decoded typed representation. */ (
                                value
                            ): ResourceRecord<F> => ({ ...row, value })
                        )
                    );
                /** Require portable UUIDv7 record identity before invoking the persistence driver. */
                const recordId = (id: string) => decode(UuidV7, id);
                return Resources.of({
                    /** Read one authorized active-schema record, returning absence without fabricating a row. */
                    get: (resource, id) =>
                        Effect.gen(
                            /** Check policy and identifier before reading, then validate any stored value against the active resource. */ function* () {
                                // Authorization precedes lookup so record existence cannot bypass tenant/resource policy.
                                yield* resolve(resource, 'read');
                                yield* recordId(id);
                                const row = yield* driver.get(resource.id, id);
                                return row ? yield* record(resource, row) : undefined;
                            }
                        ).pipe(Effect.withSpan('resource.get', { captureStackTrace: false })),
                    /** Execute a bounded equality/page query after validating filter values against the active field schema. */
                    query: (resource, query) =>
                        Effect.gen(
                            /** Reject unknown fields, invalid filter values and out-of-range paging before asking the driver. */ function* () {
                                // The portable field codec, not a driver's coercion behavior, defines legal equality values.
                                const definition = yield* resolve(resource, 'read');
                                const request = yield* decode(
                                    Schema.Struct({
                                        where: Schema.optionalWith(
                                            Schema.Struct({
                                                field: Schema.String,
                                                equals: Schema.Union(Schema.String, Schema.Number, Schema.Boolean),
                                            }),
                                            { exact: true }
                                        ),
                                        after: Schema.optionalWith(UuidV7, { exact: true }),
                                        limit: Schema.Number.pipe(Schema.int(), Schema.between(1, 100)),
                                    }),
                                    query
                                );
                                if (request.where) {
                                    const field = definition.fields[request.where.field];
                                    if (!field) return yield* failure('invalid-value', 'Unknown query field');
                                    yield* decode(resourceFieldSchema(field), request.where.equals);
                                }
                                const rows = yield* driver.query(definition, request);
                                return yield* Effect.forEach(
                                    rows,
                                    /** Validate each returned row without changing the driver's page order. */ (row) =>
                                        record(resource, row)
                                );
                            }
                        ).pipe(Effect.withSpan('resource.query', { captureStackTrace: false })),
                    /** Create a fully decoded value with revision zero as the absence precondition, within the provider transaction. */
                    create: (resource, id, value) =>
                        Effect.gen(
                            /** Authorize and validate before atomically writing a new record and decoding its stored result. */ function* () {
                                // Revision zero is a creation precondition; the driver must reject replacement of an existing record.
                                const definition = yield* resolve(resource, 'write');
                                yield* recordId(id);
                                const data = yield* decodeResource(resource, value);
                                return yield* transaction(
                                    driver
                                        .write(definition, id, 0, data)
                                        .pipe(
                                            Effect.flatMap(
                                                /** Validate the persisted result before allowing the creation transaction to finish. */ (
                                                    row
                                                ) => record(resource, row)
                                            )
                                        )
                                );
                            }
                        ).pipe(Effect.withSpan('resource.create', { captureStackTrace: false })),
                    /** Apply a validated partial patch only at the expected revision; validate the merged full record atomically. */
                    update: (resource, id, revision, patch) =>
                        Effect.gen(
                            /** Validate mutation intent before entering the provider transaction's read/merge/compare-and-set boundary. */ function* () {
                                // Patch decoding permits omitted required fields, but never makes the final stored value a partial record.
                                const definition = yield* resolve(resource, 'write');
                                yield* recordId(id);
                                yield* decode(
                                    Schema.Number.pipe(Schema.int(), Schema.between(1, 2147483646)),
                                    revision
                                );
                                const changes = yield* decodeResource(resource, patch, true);
                                return yield* transaction(
                                    Effect.gen(
                                        /** Reject stale/missing rows and validate the complete merged value before the revision-checked write. */ function* () {
                                            // Read/merge/write share a transaction; the write's revision precondition still guards concurrent changes.
                                            const previous = yield* driver.get(resource.id, id);
                                            if (!previous || previous.revision !== revision)
                                                return yield* failure('conflict', 'Missing record or stale revision');
                                            const value = yield* decodeResource(resource, {
                                                ...previous.value,
                                                ...changes
                                            });
                                            return yield* record(
                                                resource,
                                                yield* driver.write(definition, id, revision, value)
                                            );
                                        }
                                    )
                                );
                            }
                        ).pipe(Effect.withSpan('resource.update', { captureStackTrace: false })),
                    /** Return authorized append-only history as stored, without decoding old values through today's field schema. */
                    history: (resource, id) =>
                        Effect.gen(
                            /** Require history-specific policy and a valid id before exposing driver history. */ function* () {
                                // History is not a current-record read: historical entries retain the schemas/version pins that wrote them.
                                yield* resolve(resource, 'history');
                                yield* recordId(id);
                                return yield* driver.history(resource.id, id);
                            }
                        ).pipe(Effect.withSpan('resource.history', { captureStackTrace: false })),
                    /** Authorize wildcard transaction scope and run the supplied effect under this provider's atomic storage owner. */
                    transaction: (effect) =>
                        Effect.gen(
                            /** Require transaction authority before entering the provider's storage transaction. */ function* () {
                                // Check the wildcard transaction capability before the driver can reuse or acquire a transaction.
                                yield* check('*', 'transaction');
                                return yield* transaction(effect);
                            }
                        ).pipe(Effect.withSpan('resource.transaction', { captureStackTrace: false })),
                });
            }
        )
    );
