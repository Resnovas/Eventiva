/**
 * @file packages/runtime/src/inventory-product.ts
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

import type { ActionSpec, Input } from '@eventiva/contracts/action';
import { Authorizer, Caller } from '@eventiva/contracts/caller';
import { Flags } from '@eventiva/contracts/flags';
import {
    ArchiveProduct,
    canonicalSku,
    CreateProduct,
    GetProduct,
    inventoryFlag,
    ListProducts,
    Product,
    ProductFailure,
    productActions,
    UpdateProduct,
} from '@eventiva/contracts/inventory-product';
import { declareResource, Resources, type ResourceRecord } from '@eventiva/contracts/resource';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { Data, Effect, Option, Schema } from 'effect';
import { implement } from './action.ts';
import { IdentityResolver } from './invocation.ts';

/** Declare the private product and serialization guard together; only common product actions may mutate either resource. */
export const productResources = Effect.gen(
    /** Retain canonical SKU separately from presentation; the guard's revision is the lock, not its boolean payload. */ function* () {
        // Existing Resources has no unique-field contract; a separate guard must serialize uniqueness reads.
        const products = yield* declareResource({
            id: 'inventory.product',
            owner: 'inventory',
            moduleVersion: '1.0.0',
            fields: {
                name: { type: 'text', optional: false },
                sku: { type: 'text', optional: false },
                skuKey: { type: 'text', optional: false },
                category: { type: 'text', optional: false },
                tracking: { type: 'text', optional: false },
                unit: { type: 'text', optional: false },
                archived: { type: 'boolean', optional: false },
            },
        });
        const guard = yield* declareResource({
            id: 'inventory.product-guard',
            owner: 'inventory',
            moduleVersion: '1.0.0',
            fields: { marker: { type: 'boolean', optional: false } },
        });
        return { products, guard };
    }
);
const guardId = '019b0000-0000-7000-8000-000000000001';
/** Only a failed guard create/CAS permits retry; product revision errors and infrastructure failures do not. */
class GuardConflict extends Data.TaggedError('ProductGuardConflict') {}

/**
 * Compose inside an authenticated tenant/session route with its Resources provider and live policy services.
 * Tenant routing is pinned, never selectable by product input. Refresh identity and authorization on every attempt.
 * Register the returned module on that route's common ActionHost; this is not an alternate invocation surface.
 */
export const productModule = Effect.gen(
    /** Capture trusted routing capabilities, not caller-supplied tenant or backend selection. */ function* () {
        // Capture infrastructure only: caller authority must remain per-invocation and revocable.
        const resources = yield* Resources;
        const tenant = yield* CurrentTenant;
        const identity = yield* IdentityResolver;
        const authorizer = yield* Authorizer;
        const flags = yield* Flags;
        const { products, guard } = yield* productResources;
        /** Decode stored metadata and deliberately omit the internal canonical SKU column from public output. */
        const output = (row: ResourceRecord<typeof products.fields>) =>
            Schema.decodeUnknown(Product)({
                id: row.id,
                revision: row.revision,
                name: row.value.name,
                sku: row.value.sku,
                category: row.value.category,
                tracking: row.value.tracking,
                unit: row.value.unit,
                archived: row.value.archived,
            });
        /** Authorize fresh identity inside each transaction before taking the guard; arbitrary failures never become retryable conflicts. */
        const run = <S extends ActionSpec, A, E>(
            spec: S & { readonly input: Schema.Schema<Input<S>, Schema.Schema.Encoded<S['input']>> },
            input: Input<S>,
            work: Effect.Effect<A, E, Caller | CurrentTenant>,
            write = false
        ) =>
            Effect.gen(
                /** Refuse session or tenant changes rather than redirect a captured provider to a newly resolved tenant. */ function* () {
                    const ambient = yield* Effect.serviceOption(Caller);
                    if (Option.isNone(ambient)) return yield* Effect.fail({ _tag: 'ProductUnavailable' } as const);
                    const presented = ambient.value;
                    // Policy observers receive disposable decoded targets, never the metadata subsequently persisted.
                    const encoded = yield* Schema.encode(Schema.parseJson(spec.input))(input);
                    const authorize = Effect.gen(
                        /** Recheck on transaction entry and after lock waits; no admitted policy snapshot grants lasting access. */ function* () {
                            // Waiting for a guard or retry can outlive a grant, so admission alone is insufficient.
                            const caller = yield* identity.resolve(presented);
                            if (
                                caller.subject !== presented.subject ||
                                caller.session !== presented.session ||
                                caller.tenant !== presented.tenant ||
                                caller.tenant !== tenant.id ||
                                caller.kind !== presented.kind ||
                                caller.onBehalfOf !== presented.onBehalfOf
                            )
                                return yield* Effect.fail({ _tag: 'ProductUnavailable' } as const);
                            if (!(yield* flags.evaluate(inventoryFlag)).value)
                                return yield* Effect.fail({ _tag: 'ProductUnavailable' } as const);
                            yield* authorizer.canInvoke(caller, spec);
                            yield* authorizer.check(
                                caller,
                                spec,
                                yield* Schema.decode(Schema.parseJson(spec.input))(encoded)
                            );
                            return caller;
                        }
                    );
                    const caller = yield* authorize;
                    return yield* resources
                        .transaction(
                            Effect.gen(
                                /** Always acquire the tenant singleton before any product read/write, including first initialization. */ function* () {
                                    // Every mutation uses guard-first ordering; uniqueness reads cannot precede it.
                                    if (write) {
                                        const previous = yield* resources.get(guard, guardId);
                                        yield* (
                                            previous
                                                ? resources.update(guard, guardId, previous.revision, {
                                                      marker: true,
                                                  })
                                                : resources.create(guard, guardId, { marker: true })
                                        ).pipe(
                                            Effect.mapError(
                                                /** Retry only a recognized guard CAS/initialization conflict, after the enclosing transaction rolls back. */ (
                                                    error
                                                ) => (error.reason === 'conflict' ? new GuardConflict() : error)
                                            )
                                        );
                                    }
                                    yield* authorize;
                                    return yield* work;
                                }
                            )
                        )
                        .pipe(Effect.provideService(Caller, caller), Effect.provideService(CurrentTenant, tenant));
                }
            ).pipe(
                // Only CAS conflicts retry a complete transaction, at most four total attempts. Storage/deadlock failures fail closed.
                Effect.retry({
                    times: 3,
                    /** Never retry policy, domain or arbitrary storage failure. */
                    while: (error) => error instanceof GuardConflict,
                }),
                Effect.mapError(
                    /** Preserve declared domain outcomes, hiding all policy/storage/decoder diagnostics. */ (
                        error
                    ): ProductFailure => (Schema.is(ProductFailure)(error) ? error : { _tag: 'ProductUnavailable' })
                )
            );
        /** Resolve one exact tenant record; missing identity and stale revision remain distinct public outcomes. */
        const existing = (id: string, revision?: number) =>
            Effect.gen(
                /** Archive is terminal in this slice and cannot be changed through metadata replacement. */ function* () {
                    // Edits require a current revision, while historical reads intentionally retain archived access.
                    const row = yield* resources.get(products, id);
                    if (!row) return yield* Effect.fail({ _tag: 'ProductNotFound' } as const);
                    if (revision !== undefined && row.revision !== revision)
                        return yield* Effect.fail({ _tag: 'RevisionConflict' } as const);
                    if (revision !== undefined && row.value.archived)
                        return yield* Effect.fail({ _tag: 'ProductArchived' } as const);
                    return row;
                }
            );
        /** Query only after guard acquisition; archived records retain their key and rename may keep its own key. */
        const unique = (sku: string, own?: string) =>
            resources
                .query(products, { where: { field: 'skuKey', equals: canonicalSku(sku) }, limit: 2 })
                .pipe(
                    Effect.flatMap(
                        /** A competing identity, even archived, owns this key until a separately authorized future policy changes it. */ (
                            rows
                        ) =>
                            rows.some(/** Ignore only the exact product being renamed. */ (row) => row.id !== own)
                                ? Effect.fail({ _tag: 'DuplicateSku' } as const)
                                : Effect.void
                    )
                );
        return {
            manifest: {
                format: 1,
                id: 'inventory',
                version: '1.0.0',
                description: 'Tenant-private product metadata, without stock.',
                flags: [inventoryFlag],
                actions: productActions.map(/** Register the exact portable action list. */ (action) => action.name),
            },
            actions: [
                implement(
                    CreateProduct,
                    /** Creation and uniqueness share the guard transaction. */ (input) =>
                        run(
                            CreateProduct,
                            input,
                            Effect.gen(
                                /** Preserve client identity without permitting replacement. */ function* () {
                                    // Even a matching SKU cannot turn create into replacement of an existing identity.
                                    if (yield* resources.get(products, input.id))
                                        return yield* Effect.fail({ _tag: 'RevisionConflict' } as const);
                                    yield* unique(input.product.sku);
                                    return yield* output(
                                        yield* resources.create(products, input.id, {
                                            ...input.product,
                                            skuKey: canonicalSku(input.product.sku),
                                            archived: false,
                                        })
                                    );
                                }
                            ),
                            true
                        )
                ),
                implement(
                    UpdateProduct,
                    /** Replace metadata at the caller's revision, never archive state. */ (input) =>
                        run(
                            UpdateProduct,
                            input,
                            Effect.gen(
                                /** A failed duplicate rename rolls back the guard as well as the product. */ function* () {
                                    // Revision and new-key checks share the guard so a stale rename cannot displace another product.
                                    yield* existing(input.id, input.revision);
                                    yield* unique(input.product.sku, input.id);
                                    return yield* output(
                                        yield* resources.update(products, input.id, input.revision, {
                                            ...input.product,
                                            skuKey: canonicalSku(input.product.sku),
                                        })
                                    );
                                }
                            ),
                            true
                        )
                ),
                implement(
                    ArchiveProduct,
                    /** Archive retains both private identity and reserved SKU. */ (input) =>
                        run(
                            ArchiveProduct,
                            input,
                            Effect.gen(
                                /** Archive uses the same lock order as creation and rename. */ function* () {
                                    // Retain the row and canonical key to prevent misleading reuse after archival.
                                    yield* existing(input.id, input.revision);
                                    return yield* output(
                                        yield* resources.update(products, input.id, input.revision, { archived: true })
                                    );
                                }
                            ),
                            true
                        )
                ),
                implement(
                    GetProduct,
                    /** Historical inspection may return archived products. */ (input) =>
                        run(GetProduct, input, existing(input.id).pipe(Effect.flatMap(output)))
                ),
                implement(
                    ListProducts,
                    /** Bound scans before archive filtering; preserve cursor even when a page filters empty. */ (
                        input
                    ) =>
                        run(
                            ListProducts,
                            input,
                            Effect.gen(
                                /** Exact category uses the existing single-field portable query; never invent SQL predicates. */ function* () {
                                    // Advance by raw rows, not visible rows, or an archive-filtered page could lose its continuation.
                                    const rows = yield* resources.query(products, {
                                        limit: input.limit,
                                        ...(input.after ? { after: input.after } : {}),
                                        ...(input.category
                                            ? { where: { field: 'category' as const, equals: input.category } }
                                            : {}),
                                    });
                                    const visible = rows.filter(
                                        /** Archived products appear only on explicit authorized request. */ (row) =>
                                            input.includeArchived || !row.value.archived
                                    );
                                    return {
                                        products: yield* Effect.forEach(visible, output),
                                        next: rows.length === input.limit ? (rows.at(-1)?.id ?? null) : null,
                                    };
                                }
                            )
                        )
                ),
            ],
        };
    }
);
