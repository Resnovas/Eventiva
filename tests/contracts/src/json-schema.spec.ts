/**
 * @file tests/contracts/src/json-schema.spec.ts
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

import { expect, it } from '@effect/vitest';
import { define } from '@eventiva/contracts/action';
import { validateInventory } from '@eventiva/contracts/inventory';
import { make, Provider } from '@eventiva/contracts/json-schema';
import { UuidV7 } from '@eventiva/contracts/storage';
import { Effect, Schema } from 'effect';

it.effect(
    'normalizes only the pinned UUID grammar without losing ASCII case or version semantics',
    /** Compare compiled regex acceptance to the unchanged runtime schemas over asymmetric boundaries. */ () =>
        Effect.gen(
            /** Generic flagged regexes, fake UUID annotations and unsupported Google patterns must continue to refuse. */ function* () {
                // Uppercase and invalid version/variant controls distinguish exact normalization from weaker UUID validation.
                const inputs = [
                    '019b0000-0000-7000-8000-0000000000af',
                    '019B0000-0000-7000-8000-0000000000AF',
                    '019b0000-0000-4000-8000-0000000000af',
                    '019b0000-0000-7000-c000-0000000000af',
                    '019b0000-0000-7000-8000-0000000000ag',
                    '019b0000-0000-7000-8000-0000000000af\n',
                    '',
                ];
                for (const provider of ['anthropic', 'openai'] as const) {
                    for (const schema of [Schema.UUID, UuidV7]) {
                        const compiled = yield* make(schema, provider);
                        expect(compiled.type).toBe('string');
                        expect(compiled).not.toHaveProperty('format');
                        const regex = new RegExp(compiled.pattern ?? '(?!)');
                        for (const value of inputs) expect(regex.test(value)).toBe(Schema.is(schema)(value));
                    }
                }
                expect(yield* Effect.flip(make(UuidV7, 'google'))).toMatchObject({
                    provider: 'google',
                    reason: 'Unsupported string keyword: pattern',
                });
                for (const schema of [
                    Schema.String.pipe(Schema.pattern(/abc/i)),
                    Schema.String.pipe(
                        Schema.pattern(/^[0-9a-f]+$/i, {
                            schemaId: Schema.UUIDSchemaId,
                            jsonSchema: { pattern: '^[0-9a-f]+$', format: 'uuid' },
                        })
                    ),
                    Schema.UUID.pipe(Schema.pattern(/foo/)),
                ])
                    expect((yield* Effect.either(make(schema, 'openai')))._tag).toBe('Left');
            }
        )
);

it.effect(
    'retains union, nullable and tool-input restrictions independently from structural output support',
    /** Distinguish a structural array output from a prohibited root tool-array input; no provider capability is inferred. */ () =>
        Effect.gen(
            /** Verify exact optional/required/object shape and fail closed for unrepresentable nullable or mixed unions. */ function* () {
                // Array output is a positive control: the same root shape must remain invalid for tool input.
                const input = Schema.Struct({
                    value: Schema.Literal('read', 'write'),
                    notes: Schema.optional(Schema.String),
                });
                const action = define('fixture.schema-result', {
                    version: 1,
                    description: 'Synthetic output shape.',
                    permission: 'fixture.read',
                    sideEffect: 'read',
                    offline: 'local',
                    input,
                    output: Schema.Array(Schema.Boolean),
                });
                const metadata = yield* validateInventory([action]);
                for (const provider of Provider.literals) {
                    expect(metadata[0]?.providerSchemas[provider].input).toMatchObject({
                        required: ['value'],
                        additionalProperties: false,
                        properties: { value: { enum: ['read', 'write'] }, notes: { type: 'string' } },
                    });
                    expect(metadata[0]?.providerSchemas[provider].output).toMatchObject({
                        type: 'array',
                        items: { type: 'boolean' },
                    });
                    for (const schema of [
                        Schema.NullOr(Schema.String),
                        Schema.Struct({ next: Schema.NullOr(Schema.String) }),
                        Schema.Struct({ value: Schema.Union(Schema.String, Schema.Number) }),
                    ]) {
                        expect((yield* Effect.either(make(schema, provider)))._tag).toBe('Left');
                    }
                    expect(
                        (yield* Effect.either(
                            make(
                                Schema.Struct({ value: Schema.String.pipe(Schema.minLength(2), Schema.maxLength(9)) }),
                                provider
                            )
                        ))._tag
                    ).toBe(provider === 'google' ? 'Left' : 'Right');
                }
                const unsupported = define('fixture.schema-input', {
                    version: 1,
                    description: 'Synthetic unsupported input.',
                    permission: 'fixture.read',
                    sideEffect: 'read',
                    offline: 'local',
                    input: Schema.Array(Schema.Boolean),
                    output: Schema.String,
                });
                expect(yield* Effect.flip(validateInventory([unsupported]))).toMatchObject({
                    path: '$',
                    reason: 'Tool input for fixture.schema-input must be an object',
                });
            }
        )
);
