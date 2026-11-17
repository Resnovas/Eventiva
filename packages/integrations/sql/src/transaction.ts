/**
 * @file packages/integrations/sql/src/transaction.ts
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
import { Storage, StorageFailure } from '@eventiva/contracts/storage';
import { Context, Effect, Layer, Option } from 'effect';
import type { Dialect } from './migrations.ts';
import { storage } from './storage.ts';

/** Private to the SQL integration. A client alone is not proof of transaction ownership. */
class Origin extends Context.Tag('@eventiva/integrations.sql/transaction/Origin')<
    Origin,
    {
        readonly binding: symbol;
        readonly connection: Context.Tag.Service<typeof SqlClient.TransactionConnection>[0];
    }
>() {}

/** One trusted composition root; independently constructed roots never share authority. */
export const transactionScope = (
    dialect: Dialect,
    operation: 'hook-foreign-transaction' | 'resource-provider-boundary'
) =>
    Effect.gen(
        /** Pair storage with an unforgeable local binding and checks for its exact transaction connection. */ function* () {
            const client = yield* SqlClient.SqlClient;
            const base = Context.get(yield* Layer.build(storage(dialect)), Storage);
            const binding = Symbol();
            const check = Effect.gen(
                /** Permit no ambient transaction, or only one bearing this root's binding and connection. */ function* () {
                    // A tag from another root, or a stale tag on another connection, cannot confer ownership.
                    const transaction = yield* Effect.serviceOption(SqlClient.TransactionConnection);
                    const origin = yield* Effect.serviceOption(Origin);
                    if (
                        Option.isSome(transaction) &&
                        (Option.isNone(origin) ||
                            origin.value.binding !== binding ||
                            origin.value.connection !== transaction.value[0])
                    )
                        return yield* new StorageFailure({ operation });
                }
            );
            const required = Effect.gen(
                /** Require an owned live transaction before transaction-only adapters perform SQL. */ function* () {
                    yield* check;
                    if (Option.isNone(yield* Effect.serviceOption(SqlClient.TransactionConnection)))
                        return yield* new StorageFailure({ operation: 'hook-transaction-required' });
                }
            );
            /** Check ambient ownership before evaluating work, preserving its result and typed failures. */
            const owned = <A, E, R>(effect: Effect.Effect<A, E, R>) => check.pipe(Effect.zipRight(effect));
            /** Bind work to the transaction established by the paired storage, not an arbitrary supplied client. */
            const inside = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
                Effect.gen(
                    /** Attach private ownership only while a transaction connection is present in the current context. */ function* () {
                        // The surrounding paired transaction/commit supplies the connection; absence is never authority.
                        const transaction = yield* Effect.serviceOption(SqlClient.TransactionConnection);
                        if (Option.isNone(transaction))
                            return yield* new StorageFailure({ operation: 'hook-transaction-required' });
                        return yield* effect.pipe(
                            Effect.provideService(Origin, { binding, connection: transaction.value[0] })
                        );
                    }
                );
            const paired = Storage.of({
                capabilities: base.capabilities,
                ready: owned(base.ready),
                // The ownership check runs BEFORE Effect SQL can reuse a foreign ambient connection.
                /** Reject foreign ambient connections, then mark the paired transaction's body as owned. */
                transaction: (effect) => owned(base.transaction(inside(effect))),
                /** Guard key serialization and mark only the mutation body with this root's transaction authority. */
                commit: (request, execute) => owned(base.commit(request, inside(execute))),
                /** Guard record insertion against reuse of a foreign ambient transaction. */
                create: (...args) => owned(base.create(...args)),
                /** Guard record reads even though they do not open their own transaction. */
                get: (...args) => owned(base.get(...args)),
                /** Preserve the base optimistic transition checks after verifying ambient ownership. */
                compareAndSet: (...args) => owned(base.compareAndSet(...args)),
                /** Guard atomic opening stock and its ledger entry with this root's ownership check. */
                stock: (...args) => owned(base.stock(...args)),
                /** Refuse stock observations through a foreign ambient transaction connection. */
                available: (...args) => owned(base.available(...args)),
                /** Preserve atomic reservation and expiry handling after rejecting foreign ambient ownership. */
                reserve: (...args) => owned(base.reserve(...args)),
                /** Guard confirmation/release without changing the base pending/expiry rules. */
                settle: (...args) => owned(base.settle(...args)),
                expire: owned(base.expire),
                /** Guard event deduplication and exact payment comparison against foreign transactions. */
                reconcile: (...args) => owned(base.reconcile(...args)),
                /** Guard outbox insertion without executing the queued command. */
                enqueue: (...args) => owned(base.enqueue(...args)),
                /** Guard immutable receipt persistence without bypassing the base replay comparison. */
                audit: (...args) => owned(base.audit(...args)),
            });
            return { client, storage: paired, check, required };
        }
    );

export type TransactionScope = Effect.Effect.Success<ReturnType<typeof transactionScope>>;
