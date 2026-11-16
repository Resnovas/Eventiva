/**
 * @file ai-docs/src/18_hooks/composition.ts
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

import {
    HookChangeFeed,
    HookOutbox,
    HookReleaseDeny,
    type HookDeclaration,
    type HookEvent,
} from '@eventiva/contracts/hook';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { Storage } from '@eventiva/contracts/storage';
import { hookStorage } from '@eventiva/integrations.sql/hook';
import { HookDispatcherLive, HookSinkUnavailable } from '@eventiva/runtime/hook';
import { Effect, Layer } from 'effect';

export const hooks = hookStorage('sqlite');
export const dispatch = HookDispatcherLive.pipe(
    Layer.provide(hooks),
    Layer.provide(HookReleaseDeny),
    Layer.provide(HookSinkUnavailable),
    Layer.provide(FlagsSafeDefaults)
);

export const stageMetadata = (event: HookEvent, observers: ReadonlyArray<HookDeclaration>) =>
    Effect.gen(function* () {
        const store = yield* Storage;
        const outbox = yield* HookOutbox;
        // Include the real domain write in this transaction before staging.
        yield* store.transaction(outbox.stage(event, observers));
    });

/** Trusted host only; release policy is still required before exposing facts to a consumer. */
export const resume = (savedCursor: number) =>
    Effect.gen(function* () {
        const feed = yield* HookChangeFeed;
        // Call outside SQL transactions and persist the returned cursor only after durable acceptance.
        return yield* feed.read(savedCursor, 50);
    });
