/**
 * @file ai-docs/src/18_resources/01_resource.ts
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

import { Effect } from 'effect';
import type { HookDeclaration, HookEvent } from '@eventiva/contracts/hook';
import type { TenantId } from '@eventiva/contracts/ids';
import {
    contributeFields,
    declareResource,
    Resources,
    type ResourceMigrationPolicy,
} from '@eventiva/contracts/resource';
import { migrateResources, resourceHookProvider } from '@eventiva/integrations.sql/resource';
import type { Dialect } from '@eventiva/integrations.sql/migrations';
import { resourceRuntime } from '@eventiva/runtime/resource';

/**
 * Prepare the contributed receipt schema on migrated, authenticated tenant storage after fencing workflow leases.
 *
 * @param dialect - Engine of the routed SQL client.
 * @param tenant - Trusted tenant binding of that client.
 * @param policy - Approved migration policy for this schema change.
 * @param authorize - Live resource authorization supplied by the host.
 * @returns A restart requirement or an unactivated provider and operations sharing its transaction.
 * @since 0.0.0
 * @example
 * const preparation = composeExample('sqlite', routedTenant, migrationPolicy, authorizeResource);
 */
export const composeExample = (
    dialect: Dialect,
    tenant: TenantId,
    policy: ResourceMigrationPolicy,
    authorize: Parameters<typeof resourceRuntime>[1]
) =>
    Effect.gen(
        /** Declare a contributed resource, apply the approved migration policy and expose unactivated composition helpers. */ function* () {
            const initial = yield* declareResource({
                id: 'example.receipt',
                owner: 'example',
                moduleVersion: '1.0.0',
                fields: {
                    message: { type: 'text', optional: false },
                },
            });
            const annotated = yield* contributeFields(initial, {
                owner: 'annotation',
                moduleVersion: '1.2.3',
                fields: {
                    annotation: { type: 'text', optional: true },
                },
            });
            const migration = yield* migrateResources(dialect, tenant, [initial, annotated], policy);
            if (migration.status === 'restart-required') return migration;
            const provider = yield* resourceHookProvider(
                dialect,
                tenant,
                { key: { module: 'platform-sql', instance: 'operational' }, version: '1.0.0' },
                [annotated]
            );
            /**
             * Create a receipt through the authorized runtime using the contributed schema.
             *
             * @param id - Identity of the new receipt record.
             * @param message - Value of its required text field.
             * @returns A create Effect requiring the authorized resource runtime.
             */
            const feature = (id: string, message: string) =>
                Effect.gen(
                    /** Use the contributed schema without mutating the original resource declaration. */ function* () {
                        const resources = yield* Resources;
                        return yield* resources.create(annotated, id, {
                            message,
                            annotation: 'Contributed without changing the original resource fields',
                        });
                    }
                );
            /**
             * Stage the hook in the same transaction as the receipt so a rolled-back write emits no event.
             *
             * @param id - Identity of the receipt to create.
             * @param message - Required receipt text, not a hook payload.
             * @param event - Minimized facts supplied by trusted composition.
             * @param observers - Exact observer pins approved for those facts.
             * @returns The created record only when both writes succeed.
             */
            const writeAndStage = (
                id: string,
                message: string,
                event: HookEvent,
                observers: ReadonlyArray<HookDeclaration>
            ) =>
                provider.storage.transaction(
                    Effect.gen(
                        /** Stage observers only after the domain create succeeds, rolling both back on failure. */ function* () {
                            const record = yield* feature(id, message);
                            yield* provider.outbox.stage(event, observers);
                            return record;
                        }
                    )
                );
            return {
                status: 'prepared',
                provider,
                layer: resourceRuntime(provider, authorize),
                feature,
                writeAndStage,
            } as const;
        }
    );
