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
import { ApprovalStore } from '@eventiva/contracts/approval';
import { IdentityStore } from '@eventiva/contracts/identity';
import { CurrentTenant, RoutingDenied, Storage, TenantRouter } from '@eventiva/contracts/storage';
import type { TenantId } from '@eventiva/contracts/ids';
import { SqlClient } from '@effect/sql';
import { Context, Effect, Layer, Option } from 'effect';
import { approvalStore } from './approval.ts';
import { identityStore } from './identity.ts';
import { storage } from './storage.ts';
import type { Dialect } from './migrations.ts';

/** Check the existing authenticated route before any database is selected, including nested route reuse. */
const admission = (
    tenant: TenantId,
    /** Recheck control-plane admission even when an existing scope already selected the same tenant. */
    authorize: (tenant: TenantId) => Effect.Effect<void, RoutingDenied>
) =>
    Effect.gen(
        /** A nested request can reuse its tenant but cannot switch to another physical database. */
        function* () {
            // Caller and CurrentTenant are evidence to compare, never a caller-controlled SQL connection selector.
            const caller = yield* Effect.serviceOption(Caller);
            const current = yield* Effect.serviceOption(CurrentTenant);
            if (
                Option.isNone(caller) ||
                caller.value.tenant !== tenant ||
                (Option.isSome(current) && current.value.id !== tenant)
            )
                return yield* new RoutingDenied({ reason: 'authenticated tenant scope required' });
            yield* authorize(tenant);
        }
    );

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
                        // Share the same admission rules with SQL-capability routing below.
                        yield* admission(tenant, authorize);
                        const storage = yield* resolve(tenant);
                        return yield* Effect.provide(
                            effect,
                            Context.make(Storage, storage).pipe(Context.add(CurrentTenant, { id: tenant }))
                        );
                    }
                ),
        })
    );

/** Integration-owned route capability. Raw SQL is never added to the portable TenantRouter contract. */
export class TenantSqlRouter extends Context.Tag('@eventiva/integrations.sql/TenantSqlRouter')<
    TenantSqlRouter,
    {
        /** Build every tenant persistence service from one explicitly resolved client, never from ambient compute SQL. */
        readonly run: <A, E, R>(
            tenant: TenantId,
            effect: Effect.Effect<
                A,
                E,
                R | Storage | CurrentTenant | IdentityStore | ApprovalStore | SqlClient.SqlClient
            >
        ) => Effect.Effect<
            A,
            E | RoutingDenied,
            Exclude<R, Storage | CurrentTenant | IdentityStore | ApprovalStore | SqlClient.SqlClient>
        >;
    }
>() {}

/** Resolve tenant SQL only after live admission and expose both secure server composition and portable Storage routing. */
export const sqlRouter = (
    dialect: Dialect,
    /** The trusted control plane returns only this authenticated tenant's already-owned client. */
    resolve: (tenant: TenantId) => Effect.Effect<SqlClient.SqlClient, RoutingDenied>,
    /** This live admission check runs on every operation, not just connection acquisition. */
    authorize: (tenant: TenantId) => Effect.Effect<void, RoutingDenied>
) => {
    // Keep the portable output narrow even though server composition needs the complete same-client persistence set.
    /** Resolve all persistence owners together for either integration-only or portable route consumers. */
    const layerFor = (tenant: TenantId) =>
        Layer.unwrapEffect(
            Effect.gen(
                /** Physical routing precedes store construction, preventing an ambient compute client from satisfying tenant persistence. */
                function* () {
                    // Do not capture Caller or a transaction connection when resolving reusable client capabilities.
                    yield* admission(tenant, authorize);
                    const client = yield* resolve(tenant);
                    const root = Layer.merge(
                        Layer.succeed(SqlClient.SqlClient, client),
                        Layer.succeed(CurrentTenant, { id: tenant })
                    );
                    return Layer.mergeAll(storage(dialect), identityStore, approvalStore).pipe(
                        Layer.provideMerge(root)
                    );
                }
            )
        );
    /** Preserve callback failures and transaction state while supplying the complete selected SQL capability set. */
    const run: TenantSqlRouter['Type']['run'] = (tenant, effect) => Effect.provide(effect, layerFor(tenant));
    return Layer.merge(
        Layer.succeed(TenantSqlRouter, { run }),
        Layer.succeed(TenantRouter, {
            /** Preserve the portable route's narrower environment contract while providing additional trusted integration services internally. */
            run: (tenant, effect) =>
                Effect.provide(
                    effect,
                    Layer.merge(Layer.service(Storage), Layer.service(CurrentTenant)).pipe(
                        Layer.provide(layerFor(tenant))
                    )
                ),
        })
    );
};
