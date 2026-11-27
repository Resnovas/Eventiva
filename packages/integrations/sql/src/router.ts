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

/**
 * Check the existing authenticated route before any database is selected, including nested route reuse.
 *
 * @param tenant - The tenant the operation is routed to.
 * @param authorize - The live control-plane admission check for that tenant.
 * @returns An effect that succeeds only when the caller and any current route match the tenant and admission passes.
 * @fails {RoutingDenied} When no caller is present, the caller or current route names another tenant, or admission refuses.
 */
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

/**
 * Routing is an injected, audited control-plane operation; this layer cannot enumerate tenant data.
 *
 * @param resolve - The control-plane lookup from an admitted tenant to its storage service.
 * @param authorize - The live admission check run before every routed operation.
 * @returns A layer providing the portable TenantRouter.
 * @since 0.0.1
 * @example
 * const layer = router((tenant) => Effect.succeed(storageFor(tenant)), () => Effect.void);
 */
export const router = (
    /** Resolve only the authorized tenant's database capability; routing metadata stays control-plane owned. */
    resolve: (tenant: TenantId) => Effect.Effect<Storage['Type'], RoutingDenied>,
    /** Recheck live tenant admission on every run, including reuse of a resolved database. */
    authorize: (tenant: TenantId) => Effect.Effect<void, RoutingDenied>
) =>
    Layer.succeed(
        TenantRouter,
        TenantRouter.of({
            /**
             * Refuse missing/mismatched caller scope before resolving storage or running tenant work.
             *
             * @param tenant - The tenant to route the work to; it must match the authenticated caller.
             * @param effect - The tenant work, given Storage and CurrentTenant for that tenant.
             * @returns The work's result.
             * @fails {RoutingDenied} When caller scope is missing or mismatched, or admission or resolution refuses.
             */
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

/**
 * Integration-owned route capability. Raw SQL is never added to the portable TenantRouter contract.
 *
 * @since 0.0.1
 * @example
 * const value = yield* (yield* TenantSqlRouter).run(tenant, program);
 */
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

/**
 * Resolve tenant SQL only after live admission and expose both secure server composition and portable Storage routing.
 *
 * @param dialect - The SQL engine of every resolved tenant client.
 * @param resolve - The trusted control-plane lookup from an admitted tenant to its own SQL client.
 * @param authorize - The live admission check run before every routed operation.
 * @returns A layer providing both TenantSqlRouter and the portable TenantRouter.
 * @since 0.0.1
 * @example
 * const layer = sqlRouter('postgres', (tenant) => clientFor(tenant), () => Effect.void);
 */
export const sqlRouter = (
    dialect: Dialect,
    /** The trusted control plane returns only this authenticated tenant's already-owned client. */
    resolve: (tenant: TenantId) => Effect.Effect<SqlClient.SqlClient, RoutingDenied>,
    /** This live admission check runs on every operation, not just connection acquisition. */
    authorize: (tenant: TenantId) => Effect.Effect<void, RoutingDenied>
) => {
    // Keep the portable output narrow even though server composition needs the complete same-client persistence set.
    /**
     * Resolve all persistence owners together for either integration-only or portable route consumers.
     *
     * @param tenant - The tenant whose persistence services are built.
     * @returns A layer providing Storage, identity, approval, the SQL client and CurrentTenant for that tenant.
     * @fails {RoutingDenied} When admission or client resolution refuses.
     */
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
    /**
     * Preserve callback failures and transaction state while supplying the complete selected SQL capability set.
     *
     * @param tenant - The tenant to route the work to.
     * @param effect - The tenant work, given the full same-client persistence set.
     * @returns The work's result.
     * @fails {RoutingDenied} When admission or client resolution refuses; the work's own failures pass through.
     */
    const run: TenantSqlRouter['Type']['run'] = (tenant, effect) => Effect.provide(effect, layerFor(tenant));
    return Layer.merge(
        Layer.succeed(TenantSqlRouter, { run }),
        Layer.succeed(TenantRouter, {
            /**
             * Preserve the portable route's narrower environment contract while providing additional trusted integration services internally.
             *
             * @param tenant - The tenant to route the work to.
             * @param effect - The tenant work, given only Storage and CurrentTenant.
             * @returns The work's result.
             * @fails {RoutingDenied} When admission or client resolution refuses; the work's own failures pass through.
             */
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
