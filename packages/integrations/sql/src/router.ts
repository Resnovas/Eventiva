/**
 * @file packages/integrations/sql/src/router.ts
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

import { Caller } from '@eventiva/contracts/caller';
import { CurrentTenant, RoutingDenied, Storage, TenantRouter } from '@eventiva/contracts/storage';
import type { TenantId } from '@eventiva/contracts/ids';
import { Context, Effect, Layer, Option } from 'effect';

/** Routing is an injected, audited control-plane operation; this layer cannot enumerate tenant data. */
export const router = (
    /** Resolve only the authorized tenant's database capability; routing metadata stays control-plane owned. */
    resolve: (tenant: TenantId) => Effect.Effect<Storage['Type'], RoutingDenied>,
    /** Recheck live tenant admission on every run, including reuse of a resolved database. */
    authorize: (tenant: TenantId) => Effect.Effect<void, RoutingDenied>
) =>
    Layer.succeed(
        TenantRouter,
        TenantRouter.of({
            /** Refuse missing/mismatched caller scope before resolving storage or running tenant work. */
            run: (tenant, effect) =>
                Effect.gen(
                    /** Provide authenticated tenant context only after the injected admission check succeeds. */ function* () {
                        // An existing tenant scope may be reused, never switched by a nested routing call.
                        const caller = yield* Effect.serviceOption(Caller);
                        const current = yield* Effect.serviceOption(CurrentTenant);
                        if (
                            Option.isNone(caller) ||
                            caller.value.tenant !== tenant ||
                            (Option.isSome(current) && current.value.id !== tenant)
                        ) {
                            return yield* new RoutingDenied({ reason: 'authenticated tenant scope required' });
                        }
                        yield* authorize(tenant);
                        const storage = yield* resolve(tenant);
                        return yield* Effect.provide(
                            effect,
                            Context.make(Storage, storage).pipe(Context.add(CurrentTenant, { id: tenant }))
                        );
                    }
                ),
        })
    );
