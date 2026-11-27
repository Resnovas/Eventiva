/**
 * @file tests/contracts/src/inventory.spec.ts
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

import { describe, expect, it } from '@effect/vitest';
import { Effect, Either, Option, Schema } from 'effect';
import { define, type ActionSpec } from '@eventiva/contracts/action';
import {
    ActionInventory,
    DuplicateAction,
    InvalidActionDefinition,
    InventoryParityError,
    validateDefinitions,
    validateInventory,
    validateParity,
    type SurfaceAction,
} from '@eventiva/contracts/inventory';
import { make, Provider, UnsupportedSchema } from '@eventiva/contracts/json-schema';

const read = define('events.get', {
    version: 1,
    description: 'Read an event.',
    input: Schema.Struct({ id: Schema.String }),
    output: Schema.Struct({ title: Schema.String, tags: Schema.Array(Schema.String), active: Schema.Boolean }),
    permission: 'events.read',
    sideEffect: 'read',
    offline: 'local',
});
const write = define('events.create', {
    version: 2,
    description: 'Create an event.',
    input: Schema.Struct({ title: Schema.String }).pipe(
        Schema.extend(
            Schema.Struct({
                category: Schema.Literal('concert', 'conference'),
                capacity: Schema.Int,
                notes: Schema.optional(Schema.String),
            })
        )
    ),
    output: Schema.Struct({ id: Schema.String }),
    permission: 'events.create',
    sideEffect: 'write',
    offline: 'queued',
    approval: 'confirm',
    risk: 'capacity',
});
const external = define('payments.refund', {
    version: 1,
    description: 'Refund a payment.',
    input: Schema.Struct({ payment: Schema.String, amount: Schema.Number }),
    output: Schema.Struct({ status: Schema.Literal('refunded'), receipt: Schema.Null }),
    permission: 'payments.refund',
    sideEffect: 'external',
    offline: 'online-only',
    approval: 'always',
    risk: 'financial',
    sensitive: true,
});
const specs = [read, write, external];

describe('portable action inventory', /** Cover schema-free published metadata, provider conversion and exact consumer surface parity. */ () => {
    it.effect(
        'keeps compatible defaults and explicit policy metadata without handlers or Effect schemas',
        /**
         * Exercise portable inventory construction with read, queued write and sensitive external fixtures.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Verify policy defaults, JSON transport and the empty inventory service shape without runtime handlers. */ function* () {
                    // The projection checks publication metadata separately from source Effect schemas and handlers.
                    expect(read).toMatchObject({ approval: 'none', risk: 'routine', sensitive: false });
                    const inventory = yield* validateInventory(specs);
                    expect(
                        inventory.map(
                            /**
                             * Select only policy fields so default and explicit policies can be compared directly.
                             *
                             * @param entry - One validated inventory entry.
                             * @returns The entry's identifier and policy fields.
                             */
                            (entry) => ({
                                id: entry.id,
                                approval: entry.approval,
                                risk: entry.risk,
                                sensitive: entry.sensitive,
                            })
                        )
                    ).toEqual([
                        { id: 'events.get', approval: 'none', risk: 'routine', sensitive: false },
                        { id: 'events.create', approval: 'confirm', risk: 'capacity', sensitive: false },
                        { id: 'payments.refund', approval: 'always', risk: 'financial', sensitive: true },
                    ]);
                    expect(JSON.parse(JSON.stringify(inventory))).toEqual(inventory);
                    expect(Object.keys(inventory[0] ?? {})).not.toContain('input');
                    expect(yield* validateInventory([])).toEqual([]);
                    expect(ActionInventory.key).toBe('@eventiva/contracts/ActionInventory');
                    const service = ActionInventory.of({
                        /**
                         * Supply an empty inventory without requiring a registered runtime host.
                         *
                         * @returns An Effect that succeeds with no actions.
                         */
                        list: () => Effect.succeed([]),
                        /**
                         * Model an absent action lookup without introducing a service failure.
                         *
                         * @returns An Effect that succeeds with no action.
                         */
                        find: () => Effect.succeed(Option.none()),
                    });
                    expect(service).toHaveProperty('find');
                }
            )
    );

    // Enumerating the contract keeps newly supported providers in snapshot coverage without a second provider list.
    for (const provider of Provider.literals) {
        it.effect(
            `snapshots read, write and external schemas for ${provider}`,
            /**
             * Build the same action inventory for each supported provider snapshot.
             *
             * @returns The Effect that runs these assertions.
             */
            () =>
                Effect.gen(
                    /** Pin provider input/output schemas with stable action identifiers for comparison. */ function* () {
                        // Project the same validated inventory per provider so snapshots expose wire-schema differences only.
                        const inventory = yield* validateInventory(specs);
                        expect(
                            inventory.map(
                                /**
                                 * Isolate the selected provider's wire schemas while preserving their owning action identity.
                                 *
                                 * @param entry - One validated inventory entry.
                                 * @returns The entry's identifier with the selected provider's schemas.
                                 */
                                (entry) => ({ id: entry.id, ...entry.providerSchemas[provider] })
                            )
                        ).toMatchSnapshot();
                    }
                )
        );
    }

    it.effect(
        'reports typed duplicate names even when versions differ',
        /**
         * Exercise name uniqueness independently of action version differences.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Verify a repeated canonical action name produces a typed error naming that action. */ function* () {
                    // Changing only version proves a new version does not create a second dispatch name.
                    const error = yield* Effect.flip(validateDefinitions([read, { ...read, version: 2 }]));
                    expect(error).toBeInstanceOf(DuplicateAction);
                    expect(error).toMatchObject({ action: 'events.get' });
                }
            )
    );

    for (const [field, value] of [
        ['_tag', 'WrongSpec'],
        ['name', 'Invalid'],
        ['version', 0],
        ['version', 1.1],
        ['version', Infinity],
        ['description', ''],
        ['description', ' \n '],
        ['description', undefined],
        ['permission', undefined],
        ['permission', ''],
        ['permission', 'invalid'],
        ['approval', 'sometimes'],
        ['risk', 'dangerous'],
        ['sensitive', 'yes'],
        ['sideEffect', 'mutation'],
        ['offline', 'eventually'],
        ['input', undefined],
        ['output', {}],
    ] as const) {
        it.effect(
            `refuses invalid ${field}: ${String(value)}`,
            /**
             * Check each malformed definition field against an otherwise valid read action.
             *
             * @returns The Effect that runs these assertions.
             */
            () =>
                Effect.gen(
                    /** Require typed definition rejection to identify the deliberately corrupted field. */ function* () {
                        // The assertion bypass deliberately simulates untyped input; validation must not trust static ActionSpec types.
                        const spec = { ...read, [field]: value } as ActionSpec;
                        const error = yield* Effect.flip(validateInventory([spec]));
                        expect(error).toBeInstanceOf(InvalidActionDefinition);
                        expect(error).toMatchObject({ field });
                    }
                )
        );
    }

    it.effect(
        'propagates unsupported input and output schemas rather than publishing an incomplete inventory',
        /**
         * Exercise unsupported schema propagation and the distinct allowance for scalar outputs.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Reject unsupported roots rather than publishing partial schemas while retaining supported scalar outputs. */ function* () {
                    // Object-shaped tool inputs are mandatory even though outputs may be scalar.
                    for (const spec of [
                        { ...read, input: Schema.Unknown },
                        { ...read, output: Schema.Unknown },
                        { ...read, input: Schema.String },
                        { ...read, input: Schema.Array(Schema.String) },
                    ]) {
                        expect(yield* Effect.flip(validateInventory([spec]))).toBeInstanceOf(UnsupportedSchema);
                    }
                    const scalarOutput = yield* validateInventory([{ ...read, output: Schema.String }]);
                    expect(scalarOutput[0]?.providerSchemas.google.output.type).toBe('string');
                }
            )
    );

    it.effect(
        'checks exact surface parity and required surfaces',
        /**
         * Exercise complete surface parity plus isolated membership and metadata mismatches.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Verify required surfaces expose exactly the inventory action names, versions and permissions. */ function* () {
                    const inventory = yield* validateInventory(specs);
                    const actions = inventory.map(
                        /**
                         * Build the minimal consumer declaration needed for exact inventory parity.
                         *
                         * @param entry - One validated inventory entry.
                         * @returns The surface declaration for that entry.
                         */
                        (entry) => ({ id: entry.id, version: entry.version, permission: entry.permission })
                    );
                    yield* validateParity(inventory, { ui: actions, agent: actions }, ['ui', 'agent']);
                    yield* validateParity([], {}, []);
                    const first = actions[0] as SurfaceAction;
                    // Each mutation isolates a parity failure so missing authority metadata cannot pass as surface compatibility.
                    const cases = [
                        { inventory, surfaces: { ui: actions }, required: ['ui', 'agent'], reason: 'Missing surface' },
                        { inventory, surfaces: { ui: actions.slice(1) }, required: ['ui'], reason: 'Missing action' },
                        {
                            inventory,
                            surfaces: { ui: [...actions, first] },
                            required: ['ui'],
                            reason: 'Duplicate action',
                        },
                        {
                            inventory,
                            surfaces: { ui: [{ ...first, id: 'unknown.action' }] },
                            required: ['ui'],
                            reason: 'Unknown action',
                        },
                        {
                            inventory,
                            surfaces: { ui: [{ ...first, permission: undefined } as unknown as SurfaceAction] },
                            required: ['ui'],
                            reason: 'Missing or mismatched permission',
                        },
                        {
                            inventory,
                            surfaces: { ui: [{ ...first, permission: 'wrong.permission' }] },
                            required: ['ui'],
                            reason: 'Missing or mismatched permission',
                        },
                        {
                            inventory,
                            surfaces: { ui: [{ ...first, version: 99 }] },
                            required: ['ui'],
                            reason: 'Mismatched version',
                        },
                        {
                            inventory: [...inventory, ...inventory],
                            surfaces: {},
                            required: [],
                            reason: 'Duplicate action',
                        },
                    ];
                    for (const item of cases) {
                        const error = yield* Effect.flip(validateParity(item.inventory, item.surfaces, item.required));
                        expect(error).toBeInstanceOf(InventoryParityError);
                        expect(error.reason).toBe(item.reason);
                    }
                }
            )
    );
});

describe('conservative provider JSON Schema', /** Cover the intentionally bounded cross-provider schema vocabulary and typed refusals. */ () => {
    it.effect(
        'flattens object composition and preserves optional keys, nested enums and annotations',
        /**
         * Exercise supported composed input conversion without broadening provider schema support.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Verify composition flattens required fields while retaining optional properties and descriptions. */ function* () {
                    // Flattening must preserve requiredness; optional notes must not become a required tool argument.
                    const output = yield* make(write.input, 'openai');
                    expect(output.required).toEqual(['title', 'category', 'capacity']);
                    expect(output).not.toHaveProperty('allOf');
                    expect(output.properties?.notes?.type).toBe('string');
                    const named = Schema.Struct({
                        value: Schema.String.annotations({ description: 'A useful value.' }),
                    });
                    expect((yield* make(named, 'anthropic')).properties?.value?.description).toBe('A useful value.');
                }
            )
    );

    // Construct real Effect schema nodes: conversion must reject runtime-only shapes before publishing wire JSON.
    for (const [label, schema] of [
        ['root object union', Schema.Union(Schema.Struct({ a: Schema.String }), Schema.Struct({ b: Schema.String }))],
        ['root enum', Schema.Literal('a', 'b')],
        ['nested general union', Schema.Struct({ value: Schema.Union(Schema.String, Schema.Number) })],
        ['mixed enum', Schema.Struct({ value: Schema.Literal('a', 1) })],
        ['nullable enum', Schema.Struct({ value: Schema.NullOr(Schema.Literal('a')) })],
        ['bigint enum', Schema.Struct({ value: Schema.Literal(1n, 2n) })],
        ['bigint literal', Schema.Literal(1n)],
        ['nonfinite literal', Schema.Literal(Infinity)],
        ['unknown', Schema.Unknown],
        ['undefined', Schema.Undefined],
        ['never', Schema.Never],
        ['record', Schema.Record({ key: Schema.String, value: Schema.String })],
        ['symbol key', Schema.Struct({ [Symbol.for('private')]: Schema.String })],
        ['tuple', Schema.Tuple(Schema.String)],
        ['empty tuple', Schema.Tuple()],
        ['transform', Schema.NumberFromString],
        [
            'suspend',
            Schema.suspend(
                /**
                 * Defer a scalar schema solely to exercise rejection of suspended schema nodes.
                 *
                 * @returns The deferred string schema.
                 */
                () => Schema.String
            ),
        ],
        [
            'custom filter',
            Schema.String.pipe(
                Schema.filter(
                    /**
                     * Supply a runtime-only restriction with no portable JSON Schema representation.
                     *
                     * @param value - The decoded string under test.
                     * @returns Whether the value is allowed.
                     */
                    (value) => value !== 'secret'
                )
            ),
        ],
        ['override', Schema.String.annotations({ jsonSchema: { type: 'number' } })],
    ] as const) {
        it.effect(
            `rejects ${label} with a typed path and provider`,
            /**
             * Exercise each unsupported schema against every provider profile.
             *
             * @returns The Effect that runs these assertions.
             */
            () =>
                Effect.gen(
                    /** Require typed unsupported-schema failures to identify both the provider and a rooted schema path. */ function* () {
                        // A provider-specific failure must remain diagnosable instead of silently dropping an unsupported node.
                        for (const provider of Provider.literals) {
                            const result = yield* Effect.either(make(schema, provider));
                            expect(Either.isLeft(result)).toBe(true);
                            if (Either.isLeft(result)) {
                                expect(result.left).toBeInstanceOf(UnsupportedSchema);
                                expect(result.left.provider).toBe(provider);
                                expect(result.left.path.startsWith('$')).toBe(true);
                            }
                        }
                    }
                )
        );
    }

    it.effect(
        'preserves supported constraints and rejects profile-incompatible or conflicting constraints',
        /**
         * Exercise constraint preservation alongside malformed, conflicting and provider-incompatible refinements.
         *
         * @returns The Effect that runs these assertions.
         */
        () =>
            Effect.gen(
                /** Verify supported bounds survive conversion and unsupported annotations fail explicitly rather than weakening validation. */ function* () {
                    // Positive controls establish supported constraints before checking profile limits and malformed annotations.
                    const bounded = Schema.String.pipe(Schema.minLength(2), Schema.maxLength(9), Schema.pattern(/abc/));
                    expect(yield* make(bounded, 'openai')).toMatchObject({
                        minLength: 2,
                        maxLength: 9,
                        pattern: 'abc',
                    });
                    expect(yield* make(Schema.Number.pipe(Schema.greaterThan(0)), 'anthropic')).toMatchObject({
                        exclusiveMinimum: 0,
                    });
                    expect(
                        yield* make(Schema.Array(Schema.Boolean).pipe(Schema.minItems(2)), 'anthropic')
                    ).toMatchObject({
                        minItems: 2,
                    });
                    expect(
                        yield* make(Schema.Number.pipe(Schema.between(0, 20), Schema.int()), 'openai')
                    ).toMatchObject({
                        type: 'integer',
                        minimum: 0,
                        maximum: 20,
                    });
                    expect(yield* make(Schema.Int, 'google')).toMatchObject({
                        minimum: Number.MIN_SAFE_INTEGER,
                        maximum: Number.MAX_SAFE_INTEGER,
                    });
                    expect(yield* Effect.flip(make(bounded, 'google'))).toMatchObject({
                        reason: 'Unsupported string keyword: minLength',
                    });
                    expect(
                        yield* Effect.flip(make(Schema.String.pipe(Schema.minLength(2), Schema.minLength(4)), 'openai'))
                    ).toMatchObject({ reason: 'Conflicting composed constraint: minLength' });
                    const date = Schema.String.pipe(
                        Schema.filter(
                            /**
                             * Accept runtime values so this fixture isolates the supported format annotation.
                             *
                             * @returns Always true, so every value passes.
                             */
                            () => true,
                            { jsonSchema: { format: 'date-time' } }
                        )
                    );
                    expect(yield* make(date, 'google')).toMatchObject({ format: 'date-time' });
                    const customFormat = Schema.String.pipe(
                        Schema.filter(
                            /**
                             * Isolate an unsupported format annotation without adding a runtime predicate restriction.
                             *
                             * @returns Always true, so every value passes.
                             */
                            () => true,
                            { jsonSchema: { format: 'custom' } }
                        )
                    );
                    expect(yield* Effect.flip(make(customFormat, 'openai'))).toMatchObject({
                        reason: 'Unsupported format: custom',
                    });
                    const illegal = Schema.Boolean.pipe(
                        Schema.filter(
                            /**
                             * Isolate a string-only keyword attached illegally to a boolean schema.
                             *
                             * @returns Always true, so every value passes.
                             */
                            () => true,
                            { jsonSchema: { pattern: 'yes' } }
                        )
                    );
                    expect(yield* Effect.flip(make(illegal, 'openai'))).toMatchObject({
                        reason: 'Unsupported boolean keyword: pattern',
                    });
                    expect(
                        yield* Effect.flip(make(Schema.String.pipe(Schema.pattern(/abc/i)), 'openai'))
                    ).toMatchObject({
                        reason: 'Regular expression flags are unsupported',
                    });
                    const empty = Schema.String.pipe(
                        Schema.filter(
                            /**
                             * Supply no runtime restriction so rejection depends on the empty refinement annotation.
                             *
                             * @returns Always true, so every value passes.
                             */
                            () => true,
                            { jsonSchema: {} }
                        )
                    );
                    expect(yield* Effect.flip(make(empty, 'openai'))).toMatchObject({
                        reason: 'Empty refinement annotation',
                    });
                    for (const jsonSchema of [
                        { minLength: -1 },
                        { minLength: 1.5 },
                        { minLength: Infinity },
                        { minLength: 'short' },
                        { pattern: 1 },
                    ]) {
                        const malformed = Schema.String.pipe(
                            Schema.filter(
                                /**
                                 * Isolate the current malformed annotation from runtime predicate behavior.
                                 *
                                 * @returns Always true, so every value passes.
                                 */
                                () => true,
                                { jsonSchema }
                            )
                        );
                        expect(yield* Effect.flip(make(malformed, 'openai'))).toBeInstanceOf(UnsupportedSchema);
                    }
                    const zeroMultiple = Schema.Number.pipe(
                        Schema.filter(
                            /**
                             * Isolate the invalid zero divisor in the portable numeric constraint annotation.
                             *
                             * @returns Always true, so every value passes.
                             */
                            () => true,
                            { jsonSchema: { multipleOf: 0 } }
                        )
                    );
                    expect(yield* Effect.flip(make(zeroMultiple, 'openai'))).toMatchObject({
                        reason: 'Invalid constraint: multipleOf',
                    });
                }
            )
    );
});
