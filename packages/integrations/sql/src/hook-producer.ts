/**
 * @file packages/integrations/sql/src/hook-producer.ts
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

import { SqlClient } from '@effect/sql';
import type { SqlError } from '@effect/sql/SqlError';
import {
    HookDenied,
    HookOutbox,
    HookOutboxFailure,
    HookProducer,
    HookProducerAttempt,
    HookProducerBinding,
    HookProducerPolicy,
    HookProducerStatus,
    HookProducerTarget,
} from '@eventiva/contracts/hook';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { Context, Effect, Layer, Option, Schema } from 'effect';
import { hookContext } from './hook.ts';
import type { Dialect } from './migrations.ts';
import { transactionScope } from './transaction.ts';
import { uuidV7 } from './values.ts';

/** Emit bounded adapter failures, never SQL/policy text or rejected values. */
const failure = (reason: HookOutboxFailure['reason']) => new HookOutboxFailure({ reason });
/** Decode policy and retained SQL metadata before granting it producer meaning. */
const decode = <A, I, Input>(schema: Schema.Schema<A, I>, input: Input) =>
    Schema.decodeUnknown(schema)(input).pipe(
        Effect.mapError(
            /** Discard rejected metadata and parser diagnostics at the persistence boundary. */ () =>
                failure('invalid')
        )
    );
/** Sanitize infrastructure defects while preserving typed denial/conflict and interruption. */
const safe = <A, E, R>(effect: Effect.Effect<A, E | SqlError, R>) =>
    effect.pipe(
        Effect.catchTag(
            'SqlError',
            /** Never expose SQL text or connection details through producer errors. */ () =>
                Effect.fail(failure('unavailable'))
        ),
        Effect.catchAllDefect(
            /** A defective authority must fail closed without retaining its cause. */ () =>
                Effect.fail(failure('unavailable'))
        )
    );

/** Explicit trusted-host opt-in, not application bootstrap or a plugin capability.
 * One build persists one NEW incarnation. No callback executes inside a SQL transaction.
 * The existing paired outbox is the sole publisher; this is not another delivery engine.
 */
export const hookProducer = (dialect: Dialect, logicalRuntime: string) =>
    Layer.scoped(
        HookProducer,
        safe(
            Effect.gen(
                /** Capture authenticated storage ownership and persist one fresh incarnation per layer build. */ function* () {
                    // Capture identity once so later callers cannot switch the journal's tenant or connection.
                    const sql = yield* SqlClient.SqlClient;
                    const tenant = (yield* CurrentTenant).id;
                    const runtime = yield* decode(
                        Schema.String.pipe(Schema.pattern(/^[a-z][a-z0-9-]*(\.[a-z0-9-]+)*$/), Schema.maxLength(128)),
                        logicalRuntime
                    );
                    const outside = Effect.gen(
                        /** Refuse any ambient transaction that could swallow a durable intent commit. */ function* () {
                            if (Option.isSome(yield* Effect.serviceOption(SqlClient.TransactionConnection)))
                                return yield* failure('transaction-active');
                        }
                    );
                    yield* outside;
                    const incarnation = yield* uuidV7.pipe(
                        Effect.mapError(
                            /** Keep UUID acquisition failures bounded and non-sensitive. */ () =>
                                failure('unavailable')
                        )
                    );
                    yield* sql`INSERT INTO hook_runtime (tenant, incarnation, logical_runtime) VALUES (${tenant}, ${incarnation}, ${runtime})`;
                    const owner = yield* transactionScope(dialect, 'hook-foreign-transaction');
                    const outbox = Context.get(yield* hookContext(dialect, owner), HookOutbox);
                    /** Serialize tenant facts across incarnations, retaining locks through the paired commit. */
                    const atomic = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
                        Effect.gen(
                            /** Own a standalone transaction so confirmation and publication share one outcome. */ function* () {
                                // The paired owner prevents an unrelated outer transaction from absorbing this commit.
                                yield* outside;
                                return yield* owner.storage.transaction(
                                    Effect.gen(
                                        /** Lock the tenant journal head before staging into the existing feed. */ function* () {
                                            yield* sql`INSERT INTO hook_producer_head (tenant, sequence) VALUES (${tenant}, 0) ON CONFLICT (tenant) DO NOTHING`;
                                            yield* sql`UPDATE hook_producer_head SET sequence = sequence WHERE tenant = ${tenant}`;
                                            return yield* effect;
                                        }
                                    )
                                );
                            }
                        ).pipe(
                            Effect.catchTag(
                                'StorageFailure',
                                /** Hide storage internals while preserving failed atomic publication. */ () =>
                                    Effect.fail(failure('unavailable'))
                            )
                        );
                    /** Read only the captured tenant/logical runtime; validate retained body against its key. */
                    const read = (request: string) =>
                        Effect.gen(
                            /** Decode retained intent only within its captured tenant and logical-runtime boundary. */ function* () {
                                const id = yield* decode(Schema.UUID, request);
                                const [row] = yield* sql<{
                                    body: string;
                                    state: string;
                                }>`SELECT body, state FROM hook_producer_attempt WHERE tenant = ${tenant} AND request = ${id}`;
                                if (row === undefined) return undefined;
                                const attempt = yield* decode(Schema.parseJson(HookProducerAttempt), row.body);
                                const status = yield* decode(HookProducerStatus, row.state);
                                if (attempt.id !== id || attempt.tenant !== tenant) return yield* failure('conflict');
                                // Logical-runtime isolation must not disclose another runtime's attempt existence.
                                if (attempt.runtime !== runtime)
                                    return yield* new HookDenied({ reason: 'policy-denied' });
                                return { attempt, status };
                            }
                        );
                    /** Release attempt metadata only after fresh trusted producer authorization. */
                    const inspect = (request: string, operation: 'inspect' | 'confirm' | 'reconcile') =>
                        Effect.gen(
                            /** Reauthorize each retained attempt without distinguishing absent and foreign identities. */ function* () {
                                // Reading SQL is not permission to disclose an attempt or assert its outcome.
                                yield* outside;
                                const current = yield* read(request);
                                if (current === undefined) return yield* new HookDenied({ reason: 'policy-denied' });
                                yield* (yield* HookProducerPolicy).authorize(current.attempt, operation);
                                return current;
                            }
                        );
                    /** Compare immutable intent under lock, then commit its status and original fact together. */
                    const settle = (attempt: HookProducerAttempt, next: HookProducerStatus) =>
                        atomic(
                            Effect.gen(
                                /** Fence stale resolutions and atomically stage only the original committed fact. */ function* () {
                                    const current = yield* read(attempt.id);
                                    if (
                                        current === undefined ||
                                        JSON.stringify(current.attempt) !== JSON.stringify(attempt)
                                    )
                                        return yield* failure('conflict');
                                    if (current.status !== 'unresolved') {
                                        if (next !== 'unresolved' && next !== current.status)
                                            return yield* failure('conflict');
                                        return current.status;
                                    }
                                    if (next === 'unresolved') return next;
                                    if (next === 'committed') {
                                        const projection = attempt.binding.projection;
                                        const factKey =
                                            projection.kind === 'platform.ready'
                                                ? JSON.stringify([attempt.incarnation, 'ready', projection.generation])
                                                : attempt.id;
                                        const duplicate =
                                            yield* sql`SELECT request FROM hook_producer_attempt WHERE tenant = ${tenant} AND fact_key = ${factKey} AND state = 'committed'`;
                                        if (duplicate.length !== 0) return yield* failure('conflict');
                                        const [head] = yield* sql<{
                                            sequence: string | number;
                                        }>`UPDATE hook_producer_head SET sequence = sequence + 1 WHERE tenant = ${tenant} RETURNING sequence`;
                                        const sequence = yield* decode(
                                            Schema.NumberFromString.pipe(
                                                Schema.int(),
                                                Schema.positive(),
                                                Schema.lessThanOrEqualTo(Number.MAX_SAFE_INTEGER)
                                            ),
                                            String(head?.sequence)
                                        );
                                        // No supplied event/classification fields: the persisted policy binding is authoritative.
                                        yield* outbox.stage(
                                            {
                                                format: 1,
                                                id: attempt.id,
                                                commit: attempt.id,
                                                tenant,
                                                resource: 'kernel.lifecycle',
                                                resourceId: attempt.incarnation,
                                                purpose: attempt.binding.purpose,
                                                profile: attempt.binding.profile,
                                                operation: attempt.binding.operation,
                                                sequence,
                                                projection,
                                            },
                                            []
                                        );
                                    }
                                    yield* sql`UPDATE hook_producer_attempt SET state = ${next} WHERE tenant = ${tenant} AND request = ${attempt.id}`;
                                    return next;
                                }
                            )
                        );
                    return HookProducer.of({
                        runtime: { logical: runtime, incarnation },
                        /** Only the first durable admission permits callback execution; duplicates never do. */
                        begin: (request, input) =>
                            safe(
                                Effect.gen(
                                    /** Bind authoritative intent before granting exactly one first-invocation admission. */ function* () {
                                        // Duplicates retain their original binding instead of reclassifying a prior callback.
                                        yield* outside;
                                        const id = yield* decode(Schema.UUID, request);
                                        const target = yield* decode(HookProducerTarget, input);
                                        const policy = yield* HookProducerPolicy;
                                        const previous = yield* read(id);
                                        if (previous !== undefined) {
                                            yield* policy.authorize(previous.attempt, 'inspect');
                                            if (JSON.stringify(previous.attempt.target) !== JSON.stringify(target))
                                                return yield* failure('conflict');
                                            return { ...previous, fresh: false };
                                        }
                                        const binding = yield* decode(
                                            HookProducerBinding,
                                            yield* policy.bind(tenant, runtime, incarnation, target)
                                        );
                                        const projection = binding.projection;
                                        if (
                                            target.kind === 'module.lifecycle'
                                                ? projection.kind !== 'module.lifecycle' ||
                                                  projection.identity.module !== target.module ||
                                                  projection.operation !== target.operation ||
                                                  (projection.from === projection.to && target.operation !== 'update')
                                                : projection.kind !== 'platform.ready' ||
                                                  projection.runtimeId !== incarnation ||
                                                  projection.generation !== target.generation
                                        )
                                            return yield* failure('invalid');
                                        const attempt = yield* decode(HookProducerAttempt, {
                                            id,
                                            tenant,
                                            runtime,
                                            incarnation,
                                            target,
                                            binding,
                                        });
                                        const factKey =
                                            projection.kind === 'platform.ready'
                                                ? JSON.stringify([incarnation, 'ready', projection.generation])
                                                : id;
                                        return yield* atomic(
                                            Effect.gen(
                                                /** Resolve competing admissions under the tenant lock before inserting intent. */ function* () {
                                                    // Another admission can win after the preflight read; only the locked recheck decides freshness.
                                                    const raced = yield* read(id);
                                                    if (raced !== undefined) {
                                                        if (JSON.stringify(raced.attempt) !== JSON.stringify(attempt))
                                                            return yield* failure('conflict');
                                                        return { ...raced, fresh: false };
                                                    }
                                                    yield* sql`INSERT INTO hook_producer_attempt (tenant, request, incarnation, body, state, fact_key) VALUES (${tenant}, ${id}, ${incarnation}, ${JSON.stringify(attempt)}, 'unresolved', ${factKey})`;
                                                    return { attempt, status: 'unresolved' as const, fresh: true };
                                                }
                                            )
                                        );
                                    }
                                )
                            ),
                        /** Read status without issuing or inferring any operation outcome. */
                        inspect: (request) => safe(inspect(request, 'inspect')),
                        /** Only the originating incarnation may directly confirm its mutation owner's result. */
                        confirm: (request) =>
                            safe(
                                Effect.gen(
                                    /** Confirm only this incarnation's mutation-owner evidence, never a predecessor's. */ function* () {
                                        const current = yield* inspect(request, 'confirm');
                                        // An unfenced restarted process cannot assert that its predecessor's callback committed.
                                        if (current.attempt.incarnation !== incarnation)
                                            return yield* failure('conflict');
                                        return yield* settle(current.attempt, 'committed');
                                    }
                                )
                            ),
                        /** Query authoritative status outside SQL, then fence contradictory concurrent decisions. */
                        reconcile: (request) =>
                            safe(
                                Effect.gen(
                                    /** Obtain status outside SQL and settle it without invoking the original callback. */ function* () {
                                        // Status lookup may perform external IO; never hold the journal lock across it.
                                        const current = yield* inspect(request, 'reconcile');
                                        if (current.status !== 'unresolved') return current.status;
                                        const next = yield* decode(
                                            HookProducerStatus,
                                            yield* (yield* HookProducerPolicy).reconcile(current.attempt)
                                        );
                                        return yield* settle(current.attempt, next);
                                    }
                                )
                            ),
                    });
                }
            )
        )
    );
