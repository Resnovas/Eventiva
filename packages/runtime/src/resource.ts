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

const failure = (reason: ResourceFailure['reason'], detail: string, cause?: Error) =>
    new ResourceFailure({ reason, detail, ...(cause ? { cause: Redacted.make(cause) } : {}) });
const decode = <A, I>(schema: Schema.Schema<A, I>, input: I) =>
    Schema.decodeUnknown(schema)(input, { onExcessProperty: 'error' }).pipe(
        Effect.mapError((cause) => failure('invalid-value', 'Schema validation failed', cause))
    );

/** App/kernel composition supplies a named provider and live policy; integrations never depend on runtime. */
export const resourceRuntime = (
    provider: ResourceProvider,
    authorize: (
        caller: CallerIdentity,
        resource: string,
        operation: ResourceOperation
    ) => Effect.Effect<void, ResourceFailure>
) =>
    Layer.effect(
        Resources,
        Effect.gen(function* () {
            yield* decode(ResourceProviderIdentity, provider.identity);
            const { tenant, driver, storage } = provider;
            const catalog = new Map<string, ResourceDefinition>();
            for (const input of provider.definitions) {
                const definition = yield* validateDefinition(input);
                if (catalog.has(definition.id))
                    return yield* failure('invalid-definition', 'Duplicate active resource');
                catalog.set(definition.id, definition);
            }
            const check = (id: string, operation: ResourceOperation) =>
                Effect.gen(function* () {
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
                });
            const resolve = (input: Resource, operation: ResourceOperation) =>
                Effect.gen(function* () {
                    const requested = yield* validateDefinition(input);
                    yield* check(requested.id, operation);
                    const definition = catalog.get(requested.id);
                    if (!definition || canonicalDefinition(definition) !== canonicalDefinition(requested))
                        return yield* failure(
                            'schema-mismatch',
                            'Only the active composed declaration can access resources'
                        );
                    return definition;
                });
            const transaction = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
                storage
                    .transaction(effect)
                    .pipe(
                        Effect.mapError((cause) =>
                            cause instanceof StorageFailure
                                ? failure('storage', 'Resource transaction failed', cause)
                                : cause
                        )
                    );
            const record = <F extends Fields>(resource: Resource<F>, row: ResourceRecord<Fields>) =>
                decodeResource(resource, row.value).pipe(Effect.map((value): ResourceRecord<F> => ({ ...row, value })));
            const recordId = (id: string) => decode(UuidV7, id);
            return Resources.of({
                get: (resource, id) =>
                    Effect.gen(function* () {
                        yield* resolve(resource, 'read');
                        yield* recordId(id);
                        const row = yield* driver.get(resource.id, id);
                        return row ? yield* record(resource, row) : undefined;
                    }),
                query: (resource, query) =>
                    Effect.gen(function* () {
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
                        return yield* Effect.forEach(rows, (row) => record(resource, row));
                    }),
                create: (resource, id, value) =>
                    Effect.gen(function* () {
                        const definition = yield* resolve(resource, 'write');
                        yield* recordId(id);
                        const data = yield* decodeResource(resource, value);
                        return yield* transaction(
                            driver.write(definition, id, 0, data).pipe(Effect.flatMap((row) => record(resource, row)))
                        );
                    }),
                update: (resource, id, revision, patch) =>
                    Effect.gen(function* () {
                        const definition = yield* resolve(resource, 'write');
                        yield* recordId(id);
                        yield* decode(Schema.Number.pipe(Schema.int(), Schema.between(1, 2147483646)), revision);
                        const changes = yield* decodeResource(resource, patch, true);
                        return yield* transaction(
                            Effect.gen(function* () {
                                const previous = yield* driver.get(resource.id, id);
                                if (!previous || previous.revision !== revision)
                                    return yield* failure('conflict', 'Missing record or stale revision');
                                const value = yield* decodeResource(resource, { ...previous.value, ...changes });
                                return yield* record(resource, yield* driver.write(definition, id, revision, value));
                            })
                        );
                    }),
                history: (resource, id) =>
                    Effect.gen(function* () {
                        yield* resolve(resource, 'history');
                        yield* recordId(id);
                        return yield* driver.history(resource.id, id);
                    }),
                transaction: (effect) =>
                    Effect.gen(function* () {
                        yield* check('*', 'transaction');
                        return yield* transaction(effect);
                    }),
            });
        })
    );
