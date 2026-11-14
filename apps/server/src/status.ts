/**
 * @file apps/server/src/status.ts
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

import { define } from '@eventiva/contracts/action';
import { implement } from '@eventiva/runtime/action';
import type { ServerModule } from '@eventiva/runtime/host';
import { Effect, Schema } from 'effect';

/**
 * The foundation's one built-in module: a read-only status action that proves
 * the action path end to end. Feature modules replace it with their own.
 */

export const Status = define('platform.status', {
    version: 1,
    description: 'Report the running Eventiva runtime and its registered actions. Reads nothing else.',
    input: Schema.Struct({}),
    output: Schema.Struct({ runtime: Schema.Literal('eventiva'), actions: Schema.Array(Schema.String) }),
    sideEffect: 'read',
    offline: 'local',
});

export const platformModule = (actions: Effect.Effect<ReadonlyArray<string>>): ServerModule => ({
    manifest: {
        format: 1,
        id: 'platform',
        version: '0.0.1',
        description: 'Built-in platform status.',
        actions: [Status.name],
        flags: [],
    },
    actions: [implement(Status, () => Effect.map(actions, (names) => ({ runtime: 'eventiva' as const, actions: names })))],
});
