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
    HookOperatorDeny,
    HookOutbox,
    HookRecovery,
    HookReleaseDeny,
    type HookDeclaration,
    type HookEvent,
} from '@eventiva/contracts/hook';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { Storage } from '@eventiva/contracts/storage';
import { hookStorage } from '@eventiva/integrations.sql/hook';
import { HookDispatcherLive, HookSinkUnavailable } from '@eventiva/runtime/hook';
import { Effect, Layer } from 'effect';

/**
 * Construct tenant-local SQLite feed and recovery services; this does not migrate the store or start delivery.
 *
 * @since 0.0.0
 * @example
 * const reader = resume(lastAcceptedCursor).pipe(Effect.provide(hooks));
 */
export const hooks = hookStorage('sqlite');
/**
 * Compose a dispatcher with release denied, no external sink and safe flag defaults.
 *
 * @since 0.0.0
 * @example
 * const isolatedDispatcher = Layer.build(dispatch);
 */
export const dispatch = HookDispatcherLive.pipe(
    Layer.provide(hooks),
    Layer.provide(HookReleaseDeny),
    Layer.provide(HookSinkUnavailable),
    Layer.provide(FlagsSafeDefaults)
);

/**
 * Stage minimized metadata on the domain write's transaction so rollback discards both.
 *
 * @param event - Trusted event facts, not the original action input.
 * @param observers - Exact declaration pins approved to observe this event.
 * @returns A storage Effect that stages work without notifying an external consumer.
 * @since 0.0.0
 * @example
 * const pending = stageMetadata(facts, approvedPins);
 */
export const stageMetadata = (event: HookEvent, observers: ReadonlyArray<HookDeclaration>) =>
    Effect.gen(
        /** Enlist hook outbox staging in the same transaction that should contain the domain write. */ function* () {
            const store = yield* Storage;
            const outbox = yield* HookOutbox;
            yield* store.transaction(outbox.stage(event, observers));
        }
    );

/**
 * Read at most fifty changes outside the SQL transaction. Save a cursor only after durable acceptance.
 *
 * @param savedCursor - Last position acknowledged by the consumer.
 * @returns A bounded page that still requires release authorization before disclosure.
 * @since 0.0.0
 * @example
 * const page = resume(lastAcceptedCursor);
 */
export const resume = (savedCursor: number) =>
    Effect.gen(
        /** Fetch a bounded batch after the consumer's durable cursor, without advancing it here. */ function* () {
            const feed = yield* HookChangeFeed;
            return yield* feed.read(savedCursor, 50);
        }
    );

/**
 * Request the first dead-letter page with operator access explicitly denied.
 *
 * @param declaration - Observer pin whose recovery metadata the operator requested.
 * @returns A denied inspection rather than an unauthorized page of metadata.
 * @since 0.0.0
 * @example
 * const inspection = inspectDeadLetters(observerPin);
 */
export const inspectDeadLetters = (declaration: HookDeclaration) =>
    Effect.gen(
        /** Request the first dead-letter metadata page under the deliberately denying operator policy. */ function* () {
            const recovery = yield* HookRecovery;
            return yield* recovery.deadLetters(declaration, null, 25);
        }
    ).pipe(Effect.provide(HookOperatorDeny));

/**
 * Request a replay under the denying operator policy. Reuse the request UUID after an ambiguous reply.
 *
 * @param declaration - Observer declaration that owns the dead letter.
 * @param key - Delivery key retained from the failed attempt.
 * @param requestId - Stable replay request UUID, not a fresh worker identifier.
 * @returns A recovery Effect that refuses to reset work without operator access.
 * @since 0.0.0
 * @example
 * const replay = replayDeadLetter(observerPin, failedKey, originalRequestId);
 */
export const replayDeadLetter = (declaration: HookDeclaration, key: string, requestId: string) =>
    Effect.gen(
        /** Reuse the caller-retained replay identifier; the denying policy prevents this sample from resetting work. */ function* () {
            const recovery = yield* HookRecovery;
            return yield* recovery.replay(declaration, key, requestId);
        }
    ).pipe(Effect.provide(HookOperatorDeny));
