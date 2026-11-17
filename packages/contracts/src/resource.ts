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
    Schema.filter(
        /** Exclude special prototype-related property names from the portable field namespace. */ (s) =>
            s !== 'constructor' && s !== 'prototype'
    )
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
/** A portable definition retaining literal field types so required keys and value primitives remain correlated. */
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
/** A stored revision with its writing schema version; historical values are not silently coerced to the current shape. */
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
/** Bounded resource failure category with a safe detail and optional redacted internal cause; public consumers must not unwrap it. */
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
/** Construct an exact yieldable resource failure without exposing the vendor's open error generic. */
const resourceFailureBase: new (
    fields: ResourceFailureFields
) => Cause.YieldableError & ResourceFailureFields & { readonly _tag: 'ResourceFailure' } = Data.TaggedError(
    'ResourceFailure'
)<ResourceFailureFields>;
/** Reject invalid values, unsafe evolution, policy denial or persistence failure rather than returning partial success. */
export class ResourceFailure extends resourceFailureBase {}
export type ResourceScope = CurrentTenant | Caller;
export type ResourceOperation = 'read' | 'write' | 'history' | 'transaction';

/** Structurally implementable privileged port. Runtime owns policy, adapters own persistence. */
export interface ResourceDriver {
    /** Read a tenant-bound current record by resource identity; adapters do not replace runtime authorization. */
    readonly get: (resource: string, id: string) => Effect.Effect<ResourceRecord<Fields> | undefined, ResourceFailure>;
    /** Evaluate a bounded equality query against the active declaration, ordered by record id after an exclusive cursor. */
    readonly query: (
        resource: ResourceDefinition,
        query: ResourceQuery<Fields>
    ) => Effect.Effect<ReadonlyArray<ResourceRecord<Fields>>, ResourceFailure>;
    /** Create with expected revision zero or compare-and-set an existing revision, appending immutable history in the owned transaction. */
    readonly write: (
        resource: ResourceDefinition,
        id: string,
        revision: number,
        value: ResourceValue<Fields>
    ) => Effect.Effect<ResourceRecord<Fields>, ResourceFailure>;
    /** Return retained revisions with their original schema versions and values, not current-schema projections. */
    readonly history: (
        resource: string,
        id: string
    ) => Effect.Effect<ReadonlyArray<ResourceRecord<Fields>>, ResourceFailure>;
}
/** Trusted composition bundle binding a named provider, definitions, driver and transaction owner to one authenticated tenant. */
export interface ResourceProvider {
    readonly identity: ResourceProviderIdentity;
    readonly tenant: TenantId;
    readonly definitions: ReadonlyArray<ResourceDefinition>;
    readonly storage: Storage['Type'];
    readonly driver: ResourceDriver;
}
/** Additive migration evidence reconstructed from immutable applied declarations/checksums, not authority to execute arbitrary migration SQL. */
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
        /** Reauthorize the caller and active declaration before reading a typed record or returning genuine absence. */
        readonly get: <F extends Fields>(
            resource: Resource<F>,
            id: string
        ) => Effect.Effect<ResourceRecord<F> | undefined, ResourceFailure, ResourceScope>;
        /** Reauthorize and validate declared equality/cursor/limit inputs before returning up to one bounded page of typed records. */
        readonly query: <F extends Fields>(
            resource: Resource<F>,
            query: ResourceQuery<F>
        ) => Effect.Effect<ReadonlyArray<ResourceRecord<F>>, ResourceFailure, ResourceScope>;
        /** Validate a complete value and atomically create its first revision; an existing record conflicts rather than being replaced. */
        readonly create: <F extends Fields>(
            resource: Resource<F>,
            id: string,
            value: ResourceValue<F>
        ) => Effect.Effect<ResourceRecord<F>, ResourceFailure, ResourceScope>;
        /** Apply a validated partial patch only at the expected current revision, preserving omitted fields and appending history. */
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
        /** Authorize the tenant transaction boundary and run nested operations on this provider's owner, never a foreign database transaction. */
        readonly transaction: <A, E, R>(
            effect: Effect.Effect<A, E, R>
        ) => Effect.Effect<A, E | ResourceFailure, R | ResourceScope>;
    }
>() {}

const strict = { onExcessProperty: 'error' } as const;
/** Keep diagnostic detail module-owned and wrap optional internal causes instead of exposing decoder or driver objects directly. */
const failure = (reason: ResourceFailure['reason'], detail: string, cause?: Error) =>
    new ResourceFailure({ reason, detail, ...(cause ? { cause: Redacted.make(cause) } : {}) });
/** Strictly decode the concrete schema's encoded input, rejecting excess properties and redacting decoder details on failure. */
const decode = <A, I>(schema: Schema.Schema<A, I>, input: I, reason: ResourceFailure['reason']) =>
    Schema.decodeUnknown(schema)(input, strict).pipe(
        Effect.mapError(
            /** Retain decoder diagnostics only behind the internal redacted cause, with a fixed public detail. */ (
                cause
            ) => failure(reason, 'Schema validation failed', cause)
        )
    );

/** Decode a nonempty portable resource definition and require a one-to-one field-to-contributor ownership map. */
export const validateDefinition = (input: ResourceDefinition) =>
    Effect.gen(
        /** Check declaration shape and complete ownership before it can participate in composition or evolution. */ function* () {
            const definition = yield* decode(ResourceDefinition, input, 'invalid-definition');
            const names = Object.keys(definition.fields);
            // Equal counts alone can hide a missing owner paired with an unrelated owner key.
            if (
                names.length === 0 ||
                names.length !== Object.keys(definition.owners).length ||
                names.some(
                    /** Require each declared field to have its own explicit owner entry, not an inherited property. */ (
                        key
                    ) => !Object.hasOwn(definition.owners, key)
                )
            )
                return yield* failure('invalid-definition', 'Every field requires exactly one contributing owner');
            return definition;
        }
    );

/** Declare schema version one with every initial field pinned to the creating module/version; returned templates are detached copies. */
export const declareResource = <const F extends Fields>(input: {
    readonly id: string;
    readonly owner: string;
    readonly moduleVersion: string;
    readonly fields: F;
}): Effect.Effect<Resource<F>, ResourceFailure> =>
    Effect.gen(
        /** Validate identity and field templates before constructing the initial complete ownership map. */ function* () {
            const checked = yield* decode(
                Schema.Struct({
                    id: Namespace,
                    owner: Namespace,
                    moduleVersion: ResourceModuleVersion,
                    fields: Fields
                }),
                input,
                'invalid-definition'
            );
            // Detach templates while retaining caller-proven literal field types; decoded metadata alone widens that correlation.
            const fields = copyFields(input.fields);
            const definition = yield* validateDefinition({
                ...checked,
                fields,
                apiVersion: 1,
                version: 1,
                owners: Object.fromEntries(
                    Object.keys(checked.fields).map(
                        /** Pin each initial field to the creating module's immutable version. */ (key) => [
                            key,
                            { module: checked.owner, version: checked.moduleVersion },
                        ]
                    )
                ),
            });
            return { ...definition, fields };
        }
    );

/** Add a nonempty set of new optional fields as the next schema version, preserving all prior field shapes and ownership pins. */
export const contributeFields = <F extends Fields, const G extends Fields>(
    resource: Resource<F>,
    input: { readonly owner: string; readonly moduleVersion: string; readonly fields: G }
): Effect.Effect<Resource<F & G>, ResourceFailure> =>
    Effect.gen(
        /** Validate and detach both declaration sides before checking additive-only ownership-preserving evolution. */ function* () {
            const previous = yield* validateDefinition(resource);
            const priorFields = copyFields(resource.fields);
            const checked = yield* decode(
                Schema.Struct({ owner: Namespace, moduleVersion: ResourceModuleVersion, fields: Fields }),
                input,
                'invalid-definition'
            );
            const fields = copyFields(input.fields);
            // Contributions cannot replace owner fields, even with an identical value type or a different module pin.
            if (
                Object.keys(checked.fields).length === 0 ||
                Object.keys(checked.fields).some(
                    /** Detect collisions with any existing own field before merging contributor metadata. */ (key) =>
                        Object.hasOwn(priorFields, key)
                )
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
                        Object.keys(checked.fields).map(
                            /** Attach the contributing module/version only to newly introduced fields. */ (key) => [
                                key,
                                { module: checked.owner, version: checked.moduleVersion },
                            ]
                        )
                    ),
                },
            });
            yield* validateEvolution(previous, next);
            return { ...next, fields: combinedFields };
        }
    );

/** Copy the field map and its scalar templates without erasing caller-proven literal field types. */
const copyFields = <F extends Fields>(fields: F): F => {
    // Both map and template objects are mutable at ingress; copying only the map would retain aliases to field flags/types.
    const copied = { ...fields };
    for (const key in copied) copied[key] = { ...copied[key] };
    return copied;
};

/** Serialize validated declaration identity, sorted field shapes and owner pins for equality/checksum comparison, not authentication. */
export const canonicalDefinition = (definition: ResourceDefinition) =>
    JSON.stringify({
        apiVersion: definition.apiVersion,
        id: definition.id,
        owner: definition.owner,
        moduleVersion: definition.moduleVersion,
        version: definition.version,
        fields: Object.fromEntries(
            Object.entries(definition.fields)
                .sort(
                    /** Use code-unit field order so canonical bytes do not depend on insertion order or host locale. */ (
                        [a],
                        [b]
                    ) => (a === b ? 0 : a < b ? -1 : 1)
                )
                .map(
                    /** Include field shape and contributor pins together so ownership changes cannot compare equal. */ ([
                        key,
                        field
                    ]) => [
                        key,
                        {
                            type: field.type,
                            optional: field.optional,
                            module: definition.owners[key]?.module,
                            version: definition.owners[key]?.version,
                        },
                    ]
                )
        ),
    });

/** Expand only. Contract/drop/backfill require a separately approved staged protocol. */
export const validateEvolution = (previous: ResourceDefinition, next: ResourceDefinition) =>
    Effect.gen(
        /** Require contiguous additive history with stable identity, original fields and contributor pins. */ function* () {
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
            // Existing records and older generations keep their original field contract; even optionality loosening changes it.
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
            const additions = Object.keys(next.fields).filter(
                /** Isolate truly new fields after proving all previous fields remain unchanged. */ (key) =>
                    !Object.hasOwn(previous.fields, key)
            );
            if (
                additions.length === 0 ||
                additions.some(
                    /** Reject required additions because historical records have no backfilled values. */ (key) =>
                        !next.fields[key]?.optional
                )
            )
                return yield* failure(
                    'unsafe-migration',
                    'A new version must add optional fields without rewriting historical data'
                );
        }
    );

/** Select the exact portable scalar validator without coercion, including safe integers, UUIDv7 and bounded epoch milliseconds. */
const fieldPredicate = (field: Field) => {
    // Primitive JavaScript types are insufficient: numeric instants/integers and exact decimal strings need distinct wire constraints.
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
/** Build a scalar-only schema refined by the field's portable wire constraints; optional presence is handled by the record codec. */
export const resourceFieldSchema = (field: Field) => {
    const accepts = fieldPredicate(field);
    // The structural scalar decoder rejects objects/null before refinement; no conversion invents an accepted field value.
    return Schema.Union(Schema.String, Schema.Number, Schema.Boolean).pipe(
        Schema.filter(
            /** Keep only already-decoded scalars satisfying this field's exact validator. */ (value) => accepts(value)
        )
    );
};
/** JSON object ingress permits malformed field values to be rejected by the resource codec, never asserted. */
export type ResourceInput = Readonly<Record<string, JsonValue | undefined>>;
const ResourceScalars = Schema.Record({
    key: Schema.String,
    value: Schema.Union(Schema.String, Schema.Number, Schema.Boolean, Schema.Undefined),
});
/** Decode a complete detached record, requiring every nonoptional field and rejecting excess keys and explicit undefined. */
export function decodeResource<F extends Fields>(
    resource: Resource<F>,
    input: ResourceInput,
    partial?: false
): Effect.Effect<ResourceValue<F>, ResourceFailure>;
/** Decode a detached patch with omitted fields allowed, without relaxing value types or admitting explicit undefined. */
export function decodeResource<F extends Fields>(
    resource: Resource<F>,
    input: ResourceInput,
    partial: true
): Effect.Effect<Partial<ResourceValue<F>>, ResourceFailure>;
/** Refine a copied scalar record against the strict dynamic field schema; partial mode changes presence only, never value constraints. */
export function decodeResource<F extends Fields>(
    resource: Resource<F>,
    input: ResourceInput,
    partial = false
): Effect.Effect<Partial<ResourceValue<F>>, ResourceFailure> {
    const fields = Object.fromEntries(
        Object.entries(resource.fields).map(
            /** Compile each declared field with exact optionality for a complete record or partial patch. */ ([
                key,
                field
            ]) => {
                const schema = resourceFieldSchema(field);
                // Patch mode relaxes required presence only; exact optional properties still reject explicit undefined.
                return [key, partial || field.optional ? Schema.optionalWith(schema, { exact: true }) : schema];
            }
        )
    );
    // The refinement checks the complete dynamic Struct, including required fields and excess keys.
    // The scalar record decoder copies input before refinement; no unchecked value reaches the typed output.
    const accepts = Schema.is(Schema.Struct(fields), strict);
    if (partial)
        return Schema.decodeUnknown(
            ResourceScalars.pipe(
                Schema.filter(
                    /** Narrow only after strict dynamic validation proves this detached scalar record is a valid patch. */ (
                        value
                    ): value is Partial<ResourceValue<F>> => accepts(value)
                )
            )
        )(input, strict).pipe(
            Effect.mapError(
                /** Hide rejected values and detailed codec diagnostics behind a redacted internal cause. */ (cause) =>
                    failure('invalid-value', 'Schema validation failed', cause)
            )
        );
    return Schema.decodeUnknown(
        ResourceScalars.pipe(
            Schema.filter(
                /** Narrow only after the strict dynamic schema proves required keys and all field values. */ (
                    value
                ): value is ResourceValue<F> => accepts(value)
            )
        )
    )(input, strict).pipe(
        Effect.mapError(
            /** Expose a fixed invalid-value failure while retaining decoder details only in redacted internal context. */ (
                cause
            ) => failure('invalid-value', 'Schema validation failed', cause)
        )
    );
}
