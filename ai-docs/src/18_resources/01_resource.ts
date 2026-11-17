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

/** Privileged app composition only. The existing Storage migrations and authenticated SQL scope must be ready. */
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
            // The kernel must fence real workflow leases before this privileged execution call.
            const migration = yield* migrateResources(dialect, tenant, [initial, annotated], policy);
            if (migration.status === 'restart-required') return migration;
            const provider = yield* resourceHookProvider(
                dialect,
                tenant,
                { key: { module: 'platform-sql', instance: 'operational' }, version: '1.0.0' },
                [annotated]
            );
            /** Create an annotated record through the injected authorized resource runtime. */
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
            // Trusted composition supplies minimized facts and exact approved observer pins, never raw feature input.
            /** Atomically couple a resource write and trusted event staging using this provider's storage transaction. */
            const writeAndStage = (
                id: string,
                message: string,
                event: HookEvent,
                observers: ReadonlyArray<HookDeclaration>
            ) =>
                provider.storage.transaction(
                    Effect.gen(
                        /** Stage observers only after the domain create succeeds, rolling both back on failure. */ function* () {
                            // Sharing the provider transaction prevents an event from describing a resource write that never committed.
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
