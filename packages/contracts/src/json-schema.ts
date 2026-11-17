/**
 * @file packages/contracts/src/json-schema.ts
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

import { type Cause, Data, Effect, Either, Option, Schema, SchemaAST } from 'effect';
import type { ActionSchema } from './action.ts';

/** Conservative tool-schema profiles, not provider request envelopes or strict-mode guarantees. */
export const Provider = Schema.Literal('anthropic', 'openai', 'google');
export type Provider = typeof Provider.Type;

/** Conservative JSON-valued tool-schema subset; optional keys remain optional and arbitrary provider keywords are absent. */
export interface ProviderSchema {
    readonly type: 'string' | 'number' | 'integer' | 'boolean' | 'null' | 'object' | 'array';
    readonly properties?: Readonly<Record<string, ProviderSchema>>;
    readonly required?: ReadonlyArray<string>;
    readonly additionalProperties?: false;
    readonly items?: ProviderSchema;
    readonly enum?: ReadonlyArray<string | number | boolean | null>;
    readonly description?: string;
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly pattern?: string;
    readonly format?: 'date-time';
    readonly minimum?: number;
    readonly maximum?: number;
    readonly exclusiveMinimum?: number;
    readonly exclusiveMaximum?: number;
    readonly multipleOf?: number;
    readonly minItems?: number;
    readonly maxItems?: number;
}

/** Locate an unrepresentable schema node for one provider without retaining handlers or submitted input values. */
interface UnsupportedSchemaFields {
    readonly provider: Provider;
    readonly path: string;
    readonly reason: string;
}
/** Construct an exact yieldable conversion failure while keeping vendor constructor generics private. */
const UnsupportedSchemaBase: new (args: UnsupportedSchemaFields) => Cause.YieldableError &
    UnsupportedSchemaFields & {
        readonly _tag: 'UnsupportedSchema';
    } = Data.TaggedError('UnsupportedSchema');
/** Schema conversion failed closed rather than advertising a weakened provider contract. */
export class UnsupportedSchema extends UnsupportedSchemaBase {}

const constraints: Readonly<Record<string, ReadonlyArray<string>>> = {
    string: ['minLength', 'maxLength', 'pattern', 'format'],
    number: ['minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf'],
    integer: ['minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf'],
    array: ['minItems', 'maxItems'],
};

const Refinement = Schema.Struct({
    minLength: Schema.optionalWith(Schema.Number, { exact: true }),
    maxLength: Schema.optionalWith(Schema.Number, { exact: true }),
    pattern: Schema.optionalWith(Schema.String, { exact: true }),
    format: Schema.optionalWith(Schema.Literal('date-time'), { exact: true }),
    minimum: Schema.optionalWith(Schema.Number, { exact: true }),
    maximum: Schema.optionalWith(Schema.Number, { exact: true }),
    exclusiveMinimum: Schema.optionalWith(Schema.Number, { exact: true }),
    exclusiveMaximum: Schema.optionalWith(Schema.Number, { exact: true }),
    multipleOf: Schema.optionalWith(Schema.Number, { exact: true }),
    minItems: Schema.optionalWith(Schema.Number, { exact: true }),
    maxItems: Schema.optionalWith(Schema.Number, { exact: true }),
});
const isConstraint = Schema.is(Schema.keyof(Refinement));

/** Classify a JSON literal without treating null as an object; callers reject nonfinite numeric literals. */
const primitiveType = (value: string | number | boolean | null) =>
    value === null ? 'null' : typeof value === 'string' ? 'string' : typeof value === 'number' ? 'number' : 'boolean';

/**
 * Compile the structural, JSON-valued part of Effect Schema without executing user code.
 * Transformations, recursive schemas, unannotated filters, records, tuples and general
 * unions fail closed. Object composition via Schema.extend is already flattened in
 * the Effect AST. Explicit JSON Schema overrides are not trusted to replace the AST.
 * Refinement annotations are treated as the author's declared wire constraints.
 * encodedSchema is deliberately not used: it erases post-transform validation,
 * including the numeric-string constraint of NumberFromString.
 * Optional keys stay optional; callers must not enable OpenAI strict mode implicitly.
 */
export const make = (
    schema: Pick<ActionSchema, 'ast'>,
    provider: Provider
): Effect.Effect<ProviderSchema, UnsupportedSchema> => {
    /** Attribute unsupported syntax or constraints to the exact traversal path and requested provider. */
    const fail = (path: string, reason: string) => Effect.fail(new UnsupportedSchema({ provider, path, reason }));
    /** Recursively compile only explicitly supported structural nodes, never execute refinement predicates or transformations. */
    const visit = (ast: SchemaAST.AST, path: string): Effect.Effect<ProviderSchema, UnsupportedSchema> =>
        Effect.gen(
            /** Preserve supported wire constraints or reject the node instead of silently erasing validation. */ function* () {
                // Structural overrides could hide transforms or validation absent from the advertised contract.
                const annotation = SchemaAST.getJSONSchemaAnnotation(ast);
                if (ast._tag !== 'Refinement' && Option.isSome(annotation)) {
                    return yield* fail(path, 'JSON Schema overrides are unsupported');
                }
                const description = Option.getOrUndefined(SchemaAST.getDescriptionAnnotation(ast));
                let result: ProviderSchema;
                switch (ast._tag) {
                    case 'StringKeyword':
                        result = { type: 'string' };
                        break;
                    case 'NumberKeyword':
                        result = { type: 'number' };
                        break;
                    case 'BooleanKeyword':
                        result = { type: 'boolean' };
                        break;
                    case 'Literal':
                        if (
                            typeof ast.literal === 'bigint' ||
                            (typeof ast.literal === 'number' && !Number.isFinite(ast.literal))
                        ) {
                            return yield* fail(path, 'Non-JSON literals are unsupported');
                        }
                        result = { type: primitiveType(ast.literal), enum: [ast.literal] };
                        break;
                    case 'Union': {
                        if (
                            path === '$' ||
                            !ast.types.every(
                                /** Only literal members can form this conservative nested enum subset. */ (member) =>
                                    member._tag === 'Literal'
                            )
                        ) {
                            return yield* fail(path, 'Only nested homogeneous literal unions are supported');
                        }
                        const values: Array<string | number | boolean | null> = [];
                        for (const member of ast.types) {
                            if (member._tag !== 'Literal') return yield* fail(path, 'Only literal enums are supported');
                            const value = member.literal;
                            if (
                                typeof value === 'bigint' ||
                                value === null ||
                                (typeof value === 'number' && !Number.isFinite(value)) ||
                                (values.length > 0 && typeof value !== typeof values[0])
                            ) {
                                return yield* fail(path, 'Mixed, non-JSON or nullable enums are unsupported');
                            }
                            values.push(value);
                        }
                        const first = values[0];
                        if (first === undefined) return yield* fail(path, 'Empty literal enums are unsupported');
                        result = { type: primitiveType(first), enum: values };
                        break;
                    }
                    case 'TypeLiteral': {
                        if (ast.indexSignatures.length > 0)
                            return yield* fail(path, 'Index signatures are unsupported');
                        const properties: Record<string, ProviderSchema> = {};
                        const required: Array<string> = [];
                        for (const property of ast.propertySignatures) {
                            if (typeof property.name !== 'string')
                                return yield* fail(path, 'Non-string keys are unsupported');
                            let type = property.type;
                            if (property.isOptional && type._tag === 'Union') {
                                // Missing optional keys have no JSON value; required undefined remains unsupported.
                                const members = type.types.filter(
                                    /** Remove only the undefined arm introduced for an optional property. */ (
                                        member
                                    ) => member._tag !== 'UndefinedKeyword'
                                );
                                type = SchemaAST.Union.make(members);
                            }
                            // Define an own data property so a schema key such as __proto__ cannot change the result's prototype.
                            Object.defineProperty(properties, property.name, {
                                value: yield* visit(type, `${path}.${property.name}`),
                                enumerable: true,
                            });
                            if (!property.isOptional) required.push(property.name);
                        }
                        result = { type: 'object', properties, required, additionalProperties: false };
                        break;
                    }
                    case 'TupleType': {
                        const element = ast.rest[0];
                        if (ast.elements.length > 0 || ast.rest.length !== 1 || element === undefined) {
                            return yield* fail(path, 'Only homogeneous arrays are supported');
                        }
                        result = { type: 'array', items: yield* visit(element.type, `${path}[]`) };
                        break;
                    }
                    case 'Refinement': {
                        if (Option.isNone(annotation))
                            return yield* fail(path, 'Refinement needs a JSON Schema annotation');
                        const base = yield* visit(ast.from, path);
                        const parsed = Schema.decodeUnknownEither(
                            Schema.Record({
                                key: Schema.String,
                                value: Schema.Union(Schema.String, Schema.Number, Schema.Boolean, Schema.Null),
                            })
                        )(annotation.value);
                        if (Either.isLeft(parsed)) return yield* fail(path, 'Invalid refinement annotation');
                        const additions = parsed.right;
                        if (Object.keys(additions).length === 0)
                            return yield* fail(path, 'Empty refinement annotation');
                        const pattern = ast.annotations[Schema.PatternSchemaId];
                        if (
                            typeof pattern === 'object' &&
                            pattern !== null &&
                            'regex' in pattern &&
                            pattern.regex instanceof RegExp &&
                            pattern.regex.flags !== ''
                        ) {
                            return yield* fail(path, 'Regular expression flags are unsupported');
                        }
                        const type = additions.type === 'integer' && base.type === 'number' ? 'integer' : base.type;
                        const allowed = constraints[type] ?? [];
                        // An annotation declares wire constraints; unsupported or conflicting composition must not weaken them.
                        for (const [key, value] of Object.entries(additions)) {
                            if (key === 'type' && value === type) continue;
                            if (
                                !allowed.includes(key) ||
                                (provider === 'google' &&
                                    !['minimum', 'maximum', 'minItems', 'maxItems', 'format'].includes(key))
                            ) {
                                return yield* fail(path, `Unsupported ${type} keyword: ${key}`);
                            }
                            if (key === 'format' && value !== 'date-time')
                                return yield* fail(path, `Unsupported format: ${String(value)}`);
                            if (key === 'pattern' && typeof value !== 'string')
                                return yield* fail(path, 'Invalid pattern');
                            if (
                                key !== 'format' &&
                                key !== 'pattern' &&
                                (typeof value !== 'number' ||
                                    !Number.isFinite(value) ||
                                    (['minLength', 'maxLength', 'minItems', 'maxItems'].includes(key) &&
                                        (!Number.isInteger(value) || value < 0)) ||
                                    (key === 'multipleOf' && value <= 0))
                            ) {
                                return yield* fail(path, `Invalid constraint: ${key}`);
                            }
                            if (isConstraint(key) && base[key] !== undefined && base[key] !== value) {
                                return yield* fail(path, `Conflicting composed constraint: ${key}`);
                            }
                        }
                        const refined = Schema.decodeUnknownEither(Refinement)(additions);
                        if (Either.isLeft(refined)) return yield* fail(path, 'Invalid refinement annotation');
                        result = { ...base, ...refined.right, type };
                        if (Option.getOrUndefined(SchemaAST.getSchemaIdAnnotation(ast)) === Schema.IntSchemaId) {
                            result = {
                                ...result,
                                minimum: Math.max(
                                    typeof result.minimum === 'number' ? result.minimum : Number.MIN_SAFE_INTEGER,
                                    Number.MIN_SAFE_INTEGER
                                ),
                                maximum: Math.min(
                                    typeof result.maximum === 'number' ? result.maximum : Number.MAX_SAFE_INTEGER,
                                    Number.MAX_SAFE_INTEGER
                                ),
                            };
                        }
                        break;
                    }
                    default:
                        return yield* fail(path, `Unsupported Effect schema: ${ast._tag}`);
                }
                return description === undefined ? result : { ...result, description };
            }
        );
    return visit(schema.ast, '$');
};
