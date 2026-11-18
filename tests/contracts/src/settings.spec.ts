/**
 * @file tests/contracts/src/settings.spec.ts
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
import { declareSetting, decodeSettingValue } from '@eventiva/contracts/settings';
import { Effect } from 'effect';

const declaration = {
    module: 'calendar',
    instance: 'primary',
    key: 'page-size',
    scope: 'user',
    classification: 'non-secret',
    purpose: 'preference',
    type: 'integer',
    default: 25,
} as const;

it.effect(
    'validates explicit defaults and rejects secret-bearing declarations without reflecting the canary',
    /** Exercise all supported families and malformed declarations through the public codec. */ () =>
        Effect.gen(
            /** Check defaults, strict metadata and sanitized diagnostics independently of runtime storage. */ function* () {
                expect(yield* declareSetting(declaration)).toEqual(declaration);
                const mutable = { ...declaration };
                const captured = yield* declareSetting(mutable);
                Object.defineProperty(mutable, 'default', { value: 99 });
                Object.defineProperty(mutable, 'instance', { value: 'different' });
                expect(captured).toEqual(declaration);
                for (const [type, value] of [
                    ['text', 'NON_SECRET_CANARY'],
                    ['boolean', false],
                    ['integer', 0],
                    ['text', 'x'.repeat(4096)],
                ] as const) {
                    const definition = yield* declareSetting({ ...declaration, type, default: value });
                    expect(yield* decodeSettingValue(definition, value)).toBe(value);
                }
                for (const input of [
                    { ...declaration, default: false },
                    { ...declaration, default: 'NON_SECRET_CANARY' },
                    { ...declaration, classification: 'secret', default: 'SECRET_DECLARATION_CANARY' },
                    { ...declaration, secret: true, default: 'SECRET_DECLARATION_CANARY' },
                    { ...declaration, purpose: 'authorization' },
                    { ...declaration, type: 'json' },
                    { ...declaration, module: 'invalid namespace' },
                    { ...declaration, key: 'x'.repeat(101) },
                    { ...declaration, type: 'text', default: 'x'.repeat(4097) },
                    {},
                ]) {
                    // The declaration entry point, not a raw parser diagnostic, is the safe registration boundary.
                    const result = yield* declareSetting(input).pipe(Effect.flip);
                    expect(result.reason).toBe('invalid-definition');
                    expect(JSON.stringify(result)).not.toContain('CANARY');
                }
                expect((yield* decodeSettingValue(declaration, 1.5).pipe(Effect.flip)).reason).toBe('invalid-value');
                expect(
                    (yield* decodeSettingValue({ ...declaration, type: 'text' }, 'x'.repeat(4097)).pipe(Effect.flip))
                        .reason
                ).toBe('invalid-value');
            }
        )
);
