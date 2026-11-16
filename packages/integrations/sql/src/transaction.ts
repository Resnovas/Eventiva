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
    Effect.gen(function* () {
        const client = yield* SqlClient.SqlClient;
        const base = Context.get(yield* Layer.build(storage(dialect)), Storage);
        const binding = Symbol();
        const check = Effect.gen(function* () {
            const transaction = yield* Effect.serviceOption(SqlClient.TransactionConnection);
            const origin = yield* Effect.serviceOption(Origin);
            if (
                Option.isSome(transaction) &&
                (Option.isNone(origin) ||
                    origin.value.binding !== binding ||
                    origin.value.connection !== transaction.value[0])
            )
                return yield* new StorageFailure({ operation });
        });
        const required = Effect.gen(function* () {
            yield* check;
            if (Option.isNone(yield* Effect.serviceOption(SqlClient.TransactionConnection)))
                return yield* new StorageFailure({ operation: 'hook-transaction-required' });
        });
        const owned = <A, E, R>(effect: Effect.Effect<A, E, R>) => check.pipe(Effect.zipRight(effect));
        const inside = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
            Effect.gen(function* () {
                const transaction = yield* Effect.serviceOption(SqlClient.TransactionConnection);
                if (Option.isNone(transaction))
                    return yield* new StorageFailure({ operation: 'hook-transaction-required' });
                return yield* effect.pipe(Effect.provideService(Origin, { binding, connection: transaction.value[0] }));
            });
        const paired = Storage.of({
            capabilities: base.capabilities,
            ready: owned(base.ready),
            // The ownership check runs BEFORE Effect SQL can reuse a foreign ambient connection.
            transaction: (effect) => owned(base.transaction(inside(effect))),
            commit: (request, execute) => owned(base.commit(request, inside(execute))),
            create: (...args) => owned(base.create(...args)),
            get: (...args) => owned(base.get(...args)),
            compareAndSet: (...args) => owned(base.compareAndSet(...args)),
            stock: (...args) => owned(base.stock(...args)),
            available: (...args) => owned(base.available(...args)),
            reserve: (...args) => owned(base.reserve(...args)),
            settle: (...args) => owned(base.settle(...args)),
            expire: owned(base.expire),
            reconcile: (...args) => owned(base.reconcile(...args)),
            enqueue: (...args) => owned(base.enqueue(...args)),
            audit: (...args) => owned(base.audit(...args)),
        });
        return { client, storage: paired, check, required };
    });

export type TransactionScope = Effect.Effect.Success<ReturnType<typeof transactionScope>>;
