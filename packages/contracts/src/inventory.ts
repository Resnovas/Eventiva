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

import { Context, Data, Effect, Option, Schema } from 'effect';
import { ActionName, type ActionSpec, Permission } from './action.ts';
import type { CallerIdentity } from './caller.ts';
import type { Forbidden } from './errors.ts';
import { make, Provider, type ProviderSchema, UnsupportedSchema } from './json-schema.ts';

export class InvalidActionDefinition extends Data.TaggedError('InvalidActionDefinition')<{
    readonly action: string;
    readonly field: string;
    readonly reason: string;
}> {}

export class DuplicateAction extends Data.TaggedError('DuplicateAction')<{
    readonly action: string;
}> {}

export class InventoryParityError extends Data.TaggedError('InventoryParityError')<{
    readonly surface: string;
    readonly action: string;
    readonly reason: string;
}> {}

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
        readonly list: (
            caller: CallerIdentity
        ) => Effect.Effect<ReadonlyArray<ActionMetadata>, InventoryError | Forbidden>;
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
    Effect.gen(function* () {
        const names = new Set<string>();
        for (const spec of specs) {
            for (const field of Object.keys(Definition.fields) as Array<keyof typeof Definition.fields>) {
                const schema: Schema.Schema.AnyNoContext = Definition.fields[field];
                if (!Schema.is(schema)(spec[field])) {
                    return yield* new InvalidActionDefinition({ action: spec.name, field, reason: `Invalid ${field}` });
                }
            }
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
    });

/** Derive all provider profiles from the same validated portable specifications. No IO. */
export const validateInventory = (
    specs: ReadonlyArray<ActionSpec>
): Effect.Effect<ReadonlyArray<ActionMetadata>, InventoryError> =>
    Effect.gen(function* () {
        yield* validateDefinitions(specs);
        return yield* Effect.forEach(specs, (spec) =>
            Effect.gen(function* () {
                const entries = yield* Effect.forEach(Provider.literals, (provider) =>
                    Effect.gen(function* () {
                        const input = yield* make(spec.input, provider);
                        if (input.type !== 'object') {
                            return yield* new UnsupportedSchema({
                                provider,
                                path: '$',
                                reason: `Tool input for ${spec.name} must be an object`,
                            });
                        }
                        const output = yield* make(spec.output, provider);
                        return [provider, { input, output }] as const;
                    })
                );
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
                    providerSchemas: Object.fromEntries(entries) as ActionMetadata['providerSchemas'],
                };
            })
        );
    });

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
    Effect.gen(function* () {
        const fail = (surface: string, action: string, reason: string) =>
            new InventoryParityError({ surface, action, reason });
        const canonical = new Map<string, ActionMetadata>();
        for (const action of inventory) {
            if (canonical.has(action.id)) return yield* fail('inventory', action.id, 'Duplicate action');
            canonical.set(action.id, action);
        }
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
                if (action.version !== expected.version) return yield* fail(surface, action.id, 'Mismatched version');
                seen.add(action.id);
            }
            for (const id of canonical.keys()) {
                if (!seen.has(id)) return yield* fail(surface, id, 'Missing action');
            }
        }
    });
