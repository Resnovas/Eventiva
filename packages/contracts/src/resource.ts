/**
 * @file packages/contracts/src/resource.ts
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

import { type Cause, Context, Data, Effect, Redacted, Schema } from 'effect';
import { EpochMillis, ExactDecimal, UuidV7, type CurrentTenant, type JsonValue, type Storage } from './storage.ts';
import type { Caller } from './caller.ts';
import type { TenantId } from './ids.ts';

const Name = Schema.String.pipe(
    Schema.pattern(/^[a-z][a-zA-Z0-9_]{0,62}$/),
    Schema.filter((s) => s !== 'constructor' && s !== 'prototype')
);
const Namespace = Schema.String.pipe(Schema.pattern(/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/));
export const ResourceModuleVersion = Schema.String.pipe(
    Schema.pattern(/^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/)
);
export const ResourceProviderIdentity = Schema.Struct({
    key: Schema.Struct({ module: Namespace, instance: Namespace }),
    version: ResourceModuleVersion,
}).annotations({ parseOptions: { onExcessProperty: 'error' } });
export type ResourceProviderIdentity = typeof ResourceProviderIdentity.Type;
export const Field = Schema.Struct({
    type: Schema.Literal('text', 'integer', 'boolean', 'decimal', 'uuid', 'timestamp'),
    optional: Schema.Boolean,
}).annotations({ parseOptions: { onExcessProperty: 'error' } });
export type Field = typeof Field.Type;
export const Fields = Schema.Record({ key: Name, value: Field }).annotations({
    parseOptions: { onExcessProperty: 'error' },
});
export type Fields = typeof Fields.Type;

/** Versioned portable declarations contain data only, never SQL, codecs or connection configuration. */
export const ResourceDefinition = Schema.Struct({
    apiVersion: Schema.Literal(1),
    id: Namespace,
    owner: Namespace,
    moduleVersion: ResourceModuleVersion,
    version: Schema.Number.pipe(Schema.int(), Schema.between(1, 2147483647)),
    fields: Fields,
    owners: Schema.Record({ key: Name, value: Schema.Struct({ module: Namespace, version: ResourceModuleVersion }) }),
}).annotations({ parseOptions: { onExcessProperty: 'error' } });
export type ResourceDefinition = typeof ResourceDefinition.Type;
export interface Resource<F extends Fields = Fields> extends ResourceDefinition {
    readonly fields: F;
}
type FieldValue<T extends Field> = {
    text: string;
    integer: number;
    boolean: boolean;
    decimal: string;
    uuid: string;
    timestamp: number;
}[T['type']];
export type ResourceValue<F extends Fields> = {
    readonly [K in keyof F as F[K]['optional'] extends false ? K : never]: FieldValue<F[K]>;
} & {
    readonly [K in keyof F as F[K]['optional'] extends false ? never : K]?: FieldValue<F[K]>;
};
export interface ResourceRecord<F extends Fields> {
    readonly id: string;
    readonly revision: number;
    readonly schemaVersion: number;
    readonly value: ResourceValue<F>;
}
export type ResourceQuery<F extends Fields> = {
    readonly where?: {
        [K in Extract<keyof F, string>]: { readonly field: K; readonly equals: FieldValue<F[K]> };
    }[Extract<keyof F, string>];
    /** Exclusive record-id cursor; results are sorted by id, at most 100 per page. */
    readonly after?: string;
    readonly limit: number;
};
interface ResourceFailureFields {
    readonly reason:
        | 'invalid-definition'
        | 'invalid-value'
        | 'unsafe-migration'
        | 'schema-mismatch'
        | 'denied'
        | 'conflict'
        | 'storage';
    readonly detail: string;
    readonly cause?: Redacted.Redacted<Error>;
}
const resourceFailureBase: new (
    fields: ResourceFailureFields
) => Cause.YieldableError & ResourceFailureFields & { readonly _tag: 'ResourceFailure' } = Data.TaggedError(
    'ResourceFailure'
)<ResourceFailureFields>;
export class ResourceFailure extends resourceFailureBase {}
export type ResourceScope = CurrentTenant | Caller;
export type ResourceOperation = 'read' | 'write' | 'history' | 'transaction';

/** Structurally implementable privileged port. Runtime owns policy, adapters own persistence. */
export interface ResourceDriver {
    readonly get: (resource: string, id: string) => Effect.Effect<ResourceRecord<Fields> | undefined, ResourceFailure>;
    readonly query: (
        resource: ResourceDefinition,
        query: ResourceQuery<Fields>
    ) => Effect.Effect<ReadonlyArray<ResourceRecord<Fields>>, ResourceFailure>;
    readonly write: (
        resource: ResourceDefinition,
        id: string,
        revision: number,
        value: ResourceValue<Fields>
    ) => Effect.Effect<ResourceRecord<Fields>, ResourceFailure>;
    readonly history: (
        resource: string,
        id: string
    ) => Effect.Effect<ReadonlyArray<ResourceRecord<Fields>>, ResourceFailure>;
}
export interface ResourceProvider {
    readonly identity: ResourceProviderIdentity;
    readonly tenant: TenantId;
    readonly definitions: ReadonlyArray<ResourceDefinition>;
    readonly storage: Storage['Type'];
    readonly driver: ResourceDriver;
}
export interface ResourceMigrationEvidence {
    readonly id: string;
    readonly checksum: string;
    readonly resource: string;
    readonly from: number;
    readonly to: number;
    readonly dependencies: ReadonlyArray<string>;
    readonly kind: 'additive';
    readonly online: true;
    readonly compatibleFrom: 1;
    readonly compatibleThrough: number;
}
export const ResourceMigrationPolicy = Schema.Struct({
    kind: Schema.Literal('additive', 'staged'),
    restartRequired: Schema.Boolean,
    retainedGenerations: Schema.Number.pipe(Schema.int(), Schema.between(0, Number.MAX_SAFE_INTEGER)),
}).annotations({ parseOptions: { onExcessProperty: 'error' } });
export type ResourceMigrationPolicy = typeof ResourceMigrationPolicy.Type;
export type ResourceMigrationPlan =
    | {
          readonly status: 'ready';
          readonly history: ReadonlyArray<ResourceDefinition>;
          readonly migrations: ReadonlyArray<ResourceMigrationEvidence>;
      }
    | { readonly status: 'restart-required'; readonly reason: 'migration' | 'declared' | 'active-generations' };
export type ResourceMigrationResult =
    | { readonly status: 'applied'; readonly migrations: ReadonlyArray<ResourceMigrationEvidence> }
    | { readonly status: 'restart-required'; readonly reason: 'migration' | 'declared' | 'active-generations' };

/** The feature-facing surface has no SQL, driver, backend connection, delete or schema mutation escape hatch. */
export class Resources extends Context.Tag('@eventiva/contracts/Resources')<
    Resources,
    {
        readonly get: <F extends Fields>(
            resource: Resource<F>,
            id: string
        ) => Effect.Effect<ResourceRecord<F> | undefined, ResourceFailure, ResourceScope>;
        readonly query: <F extends Fields>(
            resource: Resource<F>,
            query: ResourceQuery<F>
        ) => Effect.Effect<ReadonlyArray<ResourceRecord<F>>, ResourceFailure, ResourceScope>;
        readonly create: <F extends Fields>(
            resource: Resource<F>,
            id: string,
            value: ResourceValue<F>
        ) => Effect.Effect<ResourceRecord<F>, ResourceFailure, ResourceScope>;
        readonly update: <F extends Fields>(
            resource: Resource<F>,
            id: string,
            revision: number,
            patch: Partial<ResourceValue<F>>
        ) => Effect.Effect<ResourceRecord<F>, ResourceFailure, ResourceScope>;
        /** Raw historical values retain the schema version that wrote them; they are not coerced into today's shape. */
        readonly history: (
            resource: Resource,
            id: string
        ) => Effect.Effect<ReadonlyArray<ResourceRecord<Fields>>, ResourceFailure, ResourceScope>;
        readonly transaction: <A, E, R>(
            effect: Effect.Effect<A, E, R>
        ) => Effect.Effect<A, E | ResourceFailure, R | ResourceScope>;
    }
>() {}

const strict = { onExcessProperty: 'error' } as const;
const failure = (reason: ResourceFailure['reason'], detail: string, cause?: Error) =>
    new ResourceFailure({ reason, detail, ...(cause ? { cause: Redacted.make(cause) } : {}) });
const decode = <A, I>(schema: Schema.Schema<A, I>, input: I, reason: ResourceFailure['reason']) =>
    Schema.decodeUnknown(schema)(input, strict).pipe(
        Effect.mapError((cause) => failure(reason, 'Schema validation failed', cause))
    );

export const validateDefinition = (input: ResourceDefinition) =>
    Effect.gen(function* () {
        const definition = yield* decode(ResourceDefinition, input, 'invalid-definition');
        const names = Object.keys(definition.fields);
        if (
            names.length === 0 ||
            names.length !== Object.keys(definition.owners).length ||
            names.some((key) => !Object.hasOwn(definition.owners, key))
        )
            return yield* failure('invalid-definition', 'Every field requires exactly one contributing owner');
        return definition;
    });

export const declareResource = <const F extends Fields>(input: {
    readonly id: string;
    readonly owner: string;
    readonly moduleVersion: string;
    readonly fields: F;
}): Effect.Effect<Resource<F>, ResourceFailure> =>
    Effect.gen(function* () {
        const checked = yield* decode(
            Schema.Struct({ id: Namespace, owner: Namespace, moduleVersion: ResourceModuleVersion, fields: Fields }),
            input,
            'invalid-definition'
        );
        const fields = copyFields(input.fields);
        const definition = yield* validateDefinition({
            ...checked,
            fields,
            apiVersion: 1,
            version: 1,
            owners: Object.fromEntries(
                Object.keys(checked.fields).map((key) => [
                    key,
                    { module: checked.owner, version: checked.moduleVersion },
                ])
            ),
        });
        return { ...definition, fields };
    });

export const contributeFields = <F extends Fields, const G extends Fields>(
    resource: Resource<F>,
    input: { readonly owner: string; readonly moduleVersion: string; readonly fields: G }
): Effect.Effect<Resource<F & G>, ResourceFailure> =>
    Effect.gen(function* () {
        const previous = yield* validateDefinition(resource);
        const priorFields = copyFields(resource.fields);
        const checked = yield* decode(
            Schema.Struct({ owner: Namespace, moduleVersion: ResourceModuleVersion, fields: Fields }),
            input,
            'invalid-definition'
        );
        const fields = copyFields(input.fields);
        if (
            Object.keys(checked.fields).length === 0 ||
            Object.keys(checked.fields).some((key) => Object.hasOwn(priorFields, key))
        )
            return yield* failure(
                'unsafe-migration',
                'Contributions must add new fields, never replace existing fields'
            );
        const combinedFields = { ...priorFields, ...fields };
        const next = yield* validateDefinition({
            ...previous,
            version: previous.version + 1,
            fields: combinedFields,
            owners: {
                ...previous.owners,
                ...Object.fromEntries(
                    Object.keys(checked.fields).map((key) => [
                        key,
                        { module: checked.owner, version: checked.moduleVersion },
                    ])
                ),
            },
        });
        yield* validateEvolution(previous, next);
        return { ...next, fields: combinedFields };
    });

// Preserve each caller-proven literal field type while detaching declaration data from mutable input objects.
const copyFields = <F extends Fields>(fields: F): F => {
    const copied = { ...fields };
    for (const key in copied) copied[key] = { ...copied[key] };
    return copied;
};

export const canonicalDefinition = (definition: ResourceDefinition) =>
    JSON.stringify({
        apiVersion: definition.apiVersion,
        id: definition.id,
        owner: definition.owner,
        moduleVersion: definition.moduleVersion,
        version: definition.version,
        fields: Object.fromEntries(
            Object.entries(definition.fields)
                .sort(([a], [b]) => (a === b ? 0 : a < b ? -1 : 1))
                .map(([key, field]) => [
                    key,
                    {
                        type: field.type,
                        optional: field.optional,
                        module: definition.owners[key]?.module,
                        version: definition.owners[key]?.version,
                    },
                ])
        ),
    });

/** Expand only. Contract/drop/backfill require a separately approved staged protocol. */
export const validateEvolution = (previous: ResourceDefinition, next: ResourceDefinition) =>
    Effect.gen(function* () {
        yield* validateDefinition(previous);
        yield* validateDefinition(next);
        if (
            previous.id !== next.id ||
            previous.owner !== next.owner ||
            previous.moduleVersion !== next.moduleVersion ||
            next.version !== previous.version + 1
        )
            return yield* failure(
                'unsafe-migration',
                'Resource identity and owner pin are stable; schema versions must be contiguous'
            );
        for (const [key, field] of Object.entries(previous.fields)) {
            const candidate = next.fields[key];
            if (
                !candidate ||
                candidate.type !== field.type ||
                candidate.optional !== field.optional ||
                previous.owners[key]?.module !== next.owners[key]?.module ||
                previous.owners[key]?.version !== next.owners[key]?.version
            )
                return yield* failure(
                    'unsafe-migration',
                    `Existing field cannot be removed, retyped, reassigned or tightened: ${key}`
                );
        }
        const additions = Object.keys(next.fields).filter((key) => !Object.hasOwn(previous.fields, key));
        if (additions.length === 0 || additions.some((key) => !next.fields[key]?.optional))
            return yield* failure(
                'unsafe-migration',
                'A new version must add optional fields without rewriting historical data'
            );
    });

const fieldPredicate = (field: Field) => {
    switch (field.type) {
        case 'text':
            return Schema.is(Schema.String);
        case 'integer':
            return Schema.is(
                Schema.Number.pipe(Schema.int(), Schema.between(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER))
            );
        case 'boolean':
            return Schema.is(Schema.Boolean);
        case 'decimal':
            return Schema.is(ExactDecimal);
        case 'uuid':
            return Schema.is(UuidV7);
        case 'timestamp':
            return Schema.is(EpochMillis);
    }
};
export const resourceFieldSchema = (field: Field) => {
    const accepts = fieldPredicate(field);
    return Schema.Union(Schema.String, Schema.Number, Schema.Boolean).pipe(Schema.filter((value) => accepts(value)));
};
/** JSON object ingress permits malformed field values to be rejected by the resource codec, never asserted. */
export type ResourceInput = Readonly<Record<string, JsonValue | undefined>>;
const ResourceScalars = Schema.Record({
    key: Schema.String,
    value: Schema.Union(Schema.String, Schema.Number, Schema.Boolean, Schema.Undefined),
});
export function decodeResource<F extends Fields>(
    resource: Resource<F>,
    input: ResourceInput,
    partial?: false
): Effect.Effect<ResourceValue<F>, ResourceFailure>;
export function decodeResource<F extends Fields>(
    resource: Resource<F>,
    input: ResourceInput,
    partial: true
): Effect.Effect<Partial<ResourceValue<F>>, ResourceFailure>;
export function decodeResource<F extends Fields>(
    resource: Resource<F>,
    input: ResourceInput,
    partial = false
): Effect.Effect<Partial<ResourceValue<F>>, ResourceFailure> {
    const fields = Object.fromEntries(
        Object.entries(resource.fields).map(([key, field]) => {
            const schema = resourceFieldSchema(field);
            return [key, partial || field.optional ? Schema.optionalWith(schema, { exact: true }) : schema];
        })
    );
    // The refinement checks the complete dynamic Struct, including required fields and excess keys.
    // The scalar record decoder copies input before refinement; no unchecked value reaches the typed output.
    const accepts = Schema.is(Schema.Struct(fields), strict);
    if (partial)
        return Schema.decodeUnknown(
            ResourceScalars.pipe(Schema.filter((value): value is Partial<ResourceValue<F>> => accepts(value)))
        )(input, strict).pipe(Effect.mapError((cause) => failure('invalid-value', 'Schema validation failed', cause)));
    return Schema.decodeUnknown(
        ResourceScalars.pipe(Schema.filter((value): value is ResourceValue<F> => accepts(value)))
    )(input, strict).pipe(Effect.mapError((cause) => failure('invalid-value', 'Schema validation failed', cause)));
}
