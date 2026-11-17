/**
 * @file packages/contracts/src/inventory.ts
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

import { type Cause, Context, Data, Effect, Either, Option, ParseResult, Schema } from 'effect';
import { ActionName, type ActionSpec, Permission } from './action.ts';
import type { CallerIdentity } from './caller.ts';
import type { Forbidden } from './errors.ts';
import { make, Provider, type ProviderSchema, UnsupportedSchema } from './json-schema.ts';

/** Locate invalid portable metadata or schema identity without retaining the submitted action definition. */
interface InvalidActionDefinitionFields {
    readonly action: string;
    readonly field: string;
    readonly reason: string;
}
/** Construct the exact yieldable validation error without exporting vendor constructor generics. */
const InvalidActionDefinitionBase: new (args: InvalidActionDefinitionFields) => Cause.YieldableError &
    InvalidActionDefinitionFields & {
        readonly _tag: 'InvalidActionDefinition';
    } = Data.TaggedError('InvalidActionDefinition');
/** Registration or inventory admission rejected one portable definition before deriving provider metadata. */
export class InvalidActionDefinition extends InvalidActionDefinitionBase {}

/** Identify the repeated action name; version differences do not create separate registration identities. */
interface DuplicateActionFields {
    readonly action: string;
}
/** Construct a yieldable duplicate-name error with a stable public field shape. */
const DuplicateActionBase: new (args: DuplicateActionFields) => Cause.YieldableError &
    DuplicateActionFields & {
        readonly _tag: 'DuplicateAction';
    } = Data.TaggedError('DuplicateAction');
/** Reject ambiguous action-name registration instead of selecting a winner by ordering. */
export class DuplicateAction extends DuplicateActionBase {}

/** Identify the surface/action mismatch found by build-time parity validation, not caller-filtered discovery. */
interface InventoryParityErrorFields {
    readonly surface: string;
    readonly action: string;
    readonly reason: string;
}
/** Construct the exact yieldable parity diagnostic without exposing the vendor's open constructor generic. */
const InventoryParityErrorBase: new (args: InventoryParityErrorFields) => Cause.YieldableError &
    InventoryParityErrorFields & {
        readonly _tag: 'InventoryParityError';
    } = Data.TaggedError('InventoryParityError');
/** An unfiltered surface omitted, duplicated or changed the canonical action contract. */
export class InventoryParityError extends InventoryParityErrorBase {}

export type DefinitionError = InvalidActionDefinition | DuplicateAction;
export type InventoryError = DefinitionError | UnsupportedSchema;

/** JSON-valued metadata only: no handlers, Effect schemas, caller data or secrets. */
export interface ActionMetadata {
    readonly id: string;
    readonly version: number;
    readonly description: string;
    readonly permission: Permission;
    readonly approval: ActionSpec['approval'];
    readonly risk: ActionSpec['risk'];
    readonly sensitive: boolean;
    readonly sideEffect: ActionSpec['sideEffect'];
    readonly offline: ActionSpec['offline'];
    readonly providerSchemas: Readonly<
        Record<
            Provider,
            {
                readonly input: ProviderSchema;
                readonly output: ProviderSchema;
            }
        >
    >;
}

/**
 * Runtime implements this over live host entries, never a separately maintained registry.
 * Both operations must refresh identity and filter through canInvoke for this caller
 * and current flag state on every call. Identity denial fails with Forbidden;
 * a permission-filtered, disabled or unknown action returns None from find.
 * Discovery does not authorise invocation or replace the post-decode permission check.
 */
export class ActionInventory extends Context.Tag('@eventiva/contracts/ActionInventory')<
    ActionInventory,
    {
        /** Refresh identity and expose only currently enabled, permission-visible metadata for this caller. */
        readonly list: (
            caller: CallerIdentity
        ) => Effect.Effect<ReadonlyArray<ActionMetadata>, InventoryError | Forbidden>;
        /** Refresh identity and return a visible enabled action, or None without distinguishing hidden and unknown names. */
        readonly find: (
            caller: CallerIdentity,
            id: string
        ) => Effect.Effect<Option.Option<ActionMetadata>, InventoryError | Forbidden>;
    }
>() {}

const Definition = Schema.Struct({
    _tag: Schema.Literal('ActionSpec'),
    name: ActionName,
    version: Schema.Int.pipe(Schema.positive()),
    description: Schema.String.pipe(Schema.pattern(/\S/)),
    permission: Permission,
    approval: Schema.Literal('none', 'confirm', 'always'),
    risk: Schema.Literal('routine', 'irreversible', 'financial', 'permission', 'capacity', 'stock', 'live-production'),
    sensitive: Schema.Boolean,
    sideEffect: Schema.Literal('read', 'write', 'external'),
    offline: Schema.Literal('local', 'queued', 'online-only'),
});

/** Pure, lazy validation shared by host registration and inventory construction. */
export const validateDefinitions = (specs: ReadonlyArray<ActionSpec>): Effect.Effect<void, DefinitionError> =>
    Effect.gen(
        /** Validate portable metadata and schema identities without executing handlers or schema filters. */ function* () {
            const names = new Set<string>();
            for (const spec of specs) {
                const definition = Schema.decodeUnknownEither(Definition)(spec);
                if (Either.isLeft(definition)) {
                    const key = ParseResult.ArrayFormatter.formatErrorSync(definition.left)[0]?.path[0];
                    const field = typeof key === 'string' ? key : 'definition';
                    return yield* new InvalidActionDefinition({ action: spec.name, field, reason: `Invalid ${field}` });
                }
                // Admission checks schema identity, not sample values: running filters here would execute author code.
                for (const field of ['input', 'output'] as const) {
                    if (!Schema.isSchema(spec[field])) {
                        return yield* new InvalidActionDefinition({
                            action: spec.name,
                            field,
                            reason: `Invalid ${field} schema`,
                        });
                    }
                }
                if (names.has(spec.name)) return yield* new DuplicateAction({ action: spec.name });
                names.add(spec.name);
            }
        }
    );

/** Derive all provider profiles from the same validated portable specifications. No IO. */
export const validateInventory = (
    specs: ReadonlyArray<ActionSpec>
): Effect.Effect<ReadonlyArray<ActionMetadata>, InventoryError> =>
    Effect.gen(
        /** Reject invalid or duplicate registrations before deriving any provider-facing inventory. */ function* () {
            // Validate the whole registry first so duplicate/definition failures are not hidden behind profile conversion errors.
            yield* validateDefinitions(specs);
            return yield* Effect.forEach(
                specs,
                /** Derive handler-free metadata for one validated portable action. */ (spec) =>
                    Effect.gen(
                        /** Compile every supported profile from this action's same input/output pair. */ function* () {
                            /** Compile one provider's schemas, requiring object-shaped tool arguments but permitting scalar results. */
                            const profile = (provider: Provider) =>
                                Effect.gen(
                                    /** Reject unsupported tool inputs before exposing either half of a provider schema pair. */ function* () {
                                        const input = yield* make(spec.input, provider);
                                        // Tool arguments must be objects even when a valid output schema is a primitive or array.
                                        if (input.type !== 'object') {
                                            return yield* new UnsupportedSchema({
                                                provider,
                                                path: '$',
                                                reason: `Tool input for ${spec.name} must be an object`,
                                            });
                                        }
                                        const output = yield* make(spec.output, provider);
                                        return { input, output };
                                    }
                                );
                            // One profile failure rejects the action rather than advertising incomplete provider support.
                            const providerSchemas = yield* Effect.all({
                                anthropic: profile('anthropic'),
                                openai: profile('openai'),
                                google: profile('google'),
                            });
                            return {
                                id: spec.name,
                                version: spec.version,
                                description: spec.description,
                                permission: spec.permission,
                                approval: spec.approval,
                                risk: spec.risk,
                                sensitive: spec.sensitive,
                                sideEffect: spec.sideEffect,
                                offline: spec.offline,
                                providerSchemas,
                            };
                        }
                    )
            );
        }
    );

/** What a surface advertises; permission is required, never inferred from the id. */
export interface SurfaceAction {
    readonly id: string;
    readonly version: number;
    readonly permission: Permission;
}

/**
 * Compare unfiltered inventories in tests/build validation, not caller-filtered discovery.
 * Required surfaces are explicit so omitting a whole adapter cannot silently pass.
 * Every supplied surface must expose exactly the canonical ids, versions and permissions.
 */
export const validateParity = (
    inventory: ReadonlyArray<ActionMetadata>,
    surfaces: Readonly<Record<string, ReadonlyArray<SurfaceAction>>>,
    requiredSurfaces: ReadonlyArray<string>
): Effect.Effect<void, InventoryParityError> =>
    Effect.gen(
        /** Compare unique canonical actions and all explicit surface contracts without permission filtering. */ function* () {
            /** Attribute the first parity failure to its surface and action without carrying implementation objects. */
            const fail = (surface: string, action: string, reason: string) =>
                new InventoryParityError({ surface, action, reason });
            const canonical = new Map<string, ActionMetadata>();
            for (const action of inventory) {
                if (canonical.has(action.id)) return yield* fail('inventory', action.id, 'Duplicate action');
                canonical.set(action.id, action);
            }
            // Check required names independently: iterating supplied surfaces alone cannot detect an omitted adapter.
            for (const surface of requiredSurfaces) {
                if (!Object.hasOwn(surfaces, surface)) return yield* fail(surface, '', 'Missing surface');
            }
            for (const [surface, actions] of Object.entries(surfaces)) {
                const seen = new Set<string>();
                for (const action of actions) {
                    const expected = canonical.get(action.id);
                    if (expected === undefined) return yield* fail(surface, action.id, 'Unknown action');
                    if (seen.has(action.id)) return yield* fail(surface, action.id, 'Duplicate action');
                    if (!Schema.is(Permission)(action.permission) || action.permission !== expected.permission) {
                        return yield* fail(surface, action.id, 'Missing or mismatched permission');
                    }
                    if (action.version !== expected.version)
                        return yield* fail(surface, action.id, 'Mismatched version');
                    seen.add(action.id);
                }
                for (const id of canonical.keys()) {
                    if (!seen.has(id)) return yield* fail(surface, id, 'Missing action');
                }
            }
        }
    );
