/**
 * @file packages/runtime/src/hook.ts
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
    HookClaim,
    HookDeclaration,
    HookDenied,
    HookEvent,
    HookObserverFailure,
    HookOutboxFailure,
    HookOutbox,
    HookReleasePolicy,
    hookReleaseRequirements,
    hookFlag,
    type HookPin,
    type HookSettlement,
} from '@eventiva/contracts/hook';
import { Flags } from '@eventiva/contracts/flags';
import { Cause, Clock, Context, Effect, Exit, Layer, Option, Ref, Schema, type Scope } from 'effect';

/** Trusted dispatcher, not a plugin callback or decryption service. Additive requests MUST go through the
 * canonical ActionHost with a scoped service principal, fresh resource policy and ALL normal human approvals.
 * Never impersonate the event's originator or treat a commit/idempotency key as authorization.
 * The sink must deduplicate by key; return only after durable acceptance. No raw action input is released.
 */
export class HookSink extends Context.Tag('@eventiva/runtime/HookSink')<
    HookSink,
    {
        readonly deliver: (
            declaration: HookDeclaration,
            event: HookEvent,
            key: string
        ) => Effect.Effect<void, HookObserverFailure>;
    }
>() {}
export const HookSinkUnavailable = Layer.succeed(HookSink, {
    deliver: () => Effect.fail(new HookObserverFailure()),
});

type Callback = (event: HookEvent, idempotencyKey: string) => Effect.Effect<void, HookObserverFailure>;
const keyOf = (pin: HookPin): string =>
    JSON.stringify([pin.tenant, pin.owner.module, pin.owner.version, pin.owner.generation, pin.hook, pin.revision]);
type DispatchResult = 'unloaded' | 'disabled' | 'empty' | 'delivered' | 'retry' | 'dead-letter';
type WorkerOutcome = DispatchResult | 'succeeded' | 'failed' | 'interrupted' | 'timeout' | 'claimed' | 'settled';

// Static codes only. Central telemetry sanitizes Exit causes before forwarding to an exporter.
const workerSpan = <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    name: 'hook.dispatch' | 'hook.claim' | 'hook.release' | 'hook.deliver' | 'hook.settle',
    outcome: (value: A) => WorkerOutcome
) =>
    effect.pipe(
        Effect.onExit((exit) =>
            Effect.annotateCurrentSpan(
                'eventiva.hook.outcome',
                Exit.isSuccess(exit)
                    ? outcome(exit.value)
                    : Cause.isInterruptedOnly(exit.cause)
                      ? 'interrupted'
                      : 'failed'
            )
        ),
        Effect.withSpan(name, { captureStackTrace: false })
    );

export class HookDispatcher extends Context.Tag('@eventiva/runtime/HookDispatcher')<
    HookDispatcher,
    {
        /** Scope closure stops admission and drains in-flight deliveries; durable pending rows remain pinned.
         * Executable callbacks require separately isolated/trusted code at composition, never upload-and-eval.
         */
        readonly register: (
            declaration: HookDeclaration,
            callback?: Callback
        ) => Effect.Effect<
            {
                readonly dispatch: Effect.Effect<DispatchResult, HookOutboxFailure>;
                readonly drain: Effect.Effect<void>;
            },
            HookDenied,
            Scope.Scope
        >;
    }
>() {}

/** Dispatch-only: deliberately accepts no originating operation, transaction, raw inputs, results or key handles.
 * Nothing here runs in the decrypting/emergency path. Core stages sanitized facts after that path commits.
 * No lifecycle guards, veto, before hooks, or policy-extension registry exists.
 */
export const HookDispatcherLive = Layer.effect(
    HookDispatcher,
    Effect.gen(function* () {
        const outbox = yield* HookOutbox;
        const policy = yield* HookReleasePolicy;
        const sink = yield* HookSink;
        const flags = yield* Flags;
        const entries = yield* Ref.make<ReadonlyMap<string, Ref.Ref<boolean>>>(new Map());
        const registry = yield* Effect.makeSemaphore(1);
        const settle = (claim: HookClaim, settlement: HookSettlement) =>
            workerSpan(outbox.settle(claim, settlement), 'hook.settle', () => 'settled');
        const register = (raw: HookDeclaration, callback?: Callback) =>
            Effect.gen(function* () {
                // Decoding copies the declaration: callers cannot change pins/policy after registration.
                const declaration = yield* Schema.decodeUnknown(HookDeclaration)(raw).pipe(
                    Effect.mapError(() => new HookDenied({ reason: 'invalid' }))
                );
                Object.freeze(declaration.pin.owner);
                Object.freeze(declaration.pin);
                Object.freeze(declaration.capability);
                Object.freeze(declaration.observations);
                Object.freeze(declaration.profiles);
                Object.freeze(declaration);
                if ((declaration.target === 'executable') !== (callback !== undefined))
                    return yield* new HookDenied({ reason: 'invalid' });
                const id = keyOf(declaration.pin);
                const active = yield* Ref.make(true);
                const permits = yield* Effect.makeSemaphore(declaration.concurrency);
                const drain = Ref.set(active, false).pipe(
                    Effect.zipRight(
                        permits.withPermits(declaration.concurrency)(
                            Ref.update(entries, (all) =>
                                all.get(id) !== active ? all : new Map([...all].filter(([key]) => key !== id))
                            )
                        )
                    )
                );
                yield* Effect.acquireRelease(
                    registry.withPermits(1)(
                        Effect.gen(function* () {
                            if ((yield* Ref.get(entries)).has(id))
                                return yield* new HookDenied({ reason: 'duplicate' });
                            yield* Ref.update(entries, (all) => new Map([...all, [id, active]]));
                        })
                    ),
                    () => drain
                );
                const dispatch = permits.withPermits(1)(
                    Effect.gen(function* () {
                        if (!(yield* Ref.get(active))) return 'unloaded' as const;
                        if (!(yield* flags.evaluate(hookFlag, { targetingKey: declaration.pin.tenant })).value)
                            return 'disabled' as const;
                        return yield* Effect.uninterruptibleMask((restore) =>
                            Effect.gen(function* () {
                                const now = yield* Clock.currentTimeMillis;
                                const leased = yield* workerSpan(
                                    outbox.claim(declaration, now),
                                    'hook.claim',
                                    (lease) => (lease === undefined ? 'empty' : 'claimed')
                                );
                                if (leased === undefined) return 'empty' as const;
                                const decoded = yield* Schema.decodeUnknown(HookClaim)(leased).pipe(Effect.either);
                                // No validated lease identity exists: fail closed, never settle an invalid envelope.
                                if (decoded._tag === 'Left') {
                                    return yield* new HookOutboxFailure({ reason: 'invalid' });
                                }
                                const claim = decoded.right;
                                const event = claim.event;
                                if ('identity' in event.projection) Object.freeze(event.projection.identity);
                                Object.freeze(event.projection);
                                Object.freeze(event);
                                const protectedEvent =
                                    event.profile === 'restricted' ||
                                    event.profile === 'vault' ||
                                    event.operation !== 'ordinary';
                                const invalid =
                                    keyOf(claim.pin) !== id ||
                                    event.tenant !== declaration.pin.tenant ||
                                    !declaration.observations.includes(event.projection.kind) ||
                                    !declaration.profiles.includes(event.profile) ||
                                    claim.attempt > declaration.maxAttempts;
                                const forbidden =
                                    event.operation === 'decrypting' ||
                                    event.operation === 'emergency' ||
                                    (protectedEvent && declaration.target === 'executable') ||
                                    (event.operation === 'financial' && declaration.capability.kind === 'additive');
                                if (invalid || forbidden) {
                                    yield* settle(claim, {
                                        state: 'dead-letter',
                                        reason: invalid ? 'invalid' : 'denied',
                                    });
                                    return 'dead-letter' as const;
                                }
                                const released = yield* restore(
                                    Effect.suspend(() =>
                                        policy.authorize(declaration, event, hookReleaseRequirements(event))
                                    )
                                ).pipe(
                                    Effect.timeoutOption(declaration.timeoutMs),
                                    (effect) =>
                                        workerSpan(effect, 'hook.release', (result) =>
                                            Option.isSome(result) ? 'succeeded' : 'timeout'
                                        ),
                                    Effect.exit
                                );
                                if (Exit.isFailure(released) || Option.isNone(released.value)) {
                                    yield* settle(claim, { state: 'dead-letter', reason: 'denied' });
                                    return 'dead-letter' as const;
                                }
                                const delivered = yield* restore(
                                    Effect.suspend(() =>
                                        callback === undefined
                                            ? sink.deliver(declaration, event, claim.idempotencyKey)
                                            : callback(event, claim.idempotencyKey)
                                    )
                                ).pipe(
                                    Effect.timeoutOption(declaration.timeoutMs),
                                    (effect) =>
                                        workerSpan(effect, 'hook.deliver', (result) =>
                                            Option.isSome(result) ? 'succeeded' : 'timeout'
                                        ),
                                    Effect.exit
                                );
                                if (Exit.isSuccess(delivered) && Option.isSome(delivered.value)) {
                                    yield* settle(claim, { state: 'delivered' });
                                    return 'delivered' as const;
                                }
                                const settlement =
                                    claim.attempt >= declaration.maxAttempts
                                        ? { state: 'dead-letter' as const, reason: 'exhausted' as const }
                                        : {
                                              state: 'retry' as const,
                                              availableAt: (yield* Clock.currentTimeMillis) + declaration.retryDelayMs,
                                          };
                                yield* settle(claim, settlement);
                                return settlement.state;
                            })
                        );
                    })
                );
                return { dispatch: workerSpan(dispatch, 'hook.dispatch', (result) => result), drain };
            });
        return HookDispatcher.of({ register });
    })
);
