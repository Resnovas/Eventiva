/**
 * @file ai-docs/src/28_settings/01_settings.ts
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

import { Effect } from 'effect';
import { declareSetting, settingsRead, settingsWrite, settingsResource } from '@eventiva/contracts/settings';
import { ActionHost } from '@eventiva/runtime/host';
import { settingsModule } from '@eventiva/runtime/settings';

/** Return unactivated composition helpers; the trusted caller supplies Resources, digest, tenant and durable host services. */
export const example = Effect.gen(
    /** Validate metadata before returning resource migration and registration inputs. */ function* () {
        const definition = yield* declareSetting({
            module: 'calendar',
            instance: 'primary',
            key: 'page-size',
            scope: 'user',
            classification: 'non-secret',
            purpose: 'preference',
            type: 'integer',
            default: 25,
        });
        const resource = yield* settingsResource;
        const register = Effect.gen(
            /** Resources migrations/provider and a matching durable integrity owner must exist before this effect runs. */ function* () {
                const host = yield* ActionHost;
                yield* host.register(yield* settingsModule([definition]));
            }
        );
        const use = Effect.gen(
            /** Invoke only after separately approved activation and authenticated permission checks. */ function* () {
                const host = yield* ActionHost;
                const target = { module: 'calendar', instance: 'primary', key: 'page-size', scope: 'user' } as const;
                const before = yield* host.invoke(settingsRead.name, target);
                const stored = yield* host.invoke(
                    settingsWrite.name,
                    { ...target, value: '37', expectedRevision: 0 },
                    { idempotencyKey: 'example-first-preference' }
                );
                return { before, stored };
            }
        );
        return { resource, register, use };
    }
);
