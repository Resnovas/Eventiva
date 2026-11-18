/**
 * @file packages/runtime/src/inventory-kit.ts
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
import { DefineKit, GetKit, KitComponents, KitFailure, type KitComponent } from '@eventiva/contracts/inventory-kit';
import { inventoryFlag, Product } from '@eventiva/contracts/inventory-product';
import { declareResource, Resources } from '@eventiva/contracts/resource';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { Data, Effect, Option, Schema } from 'effect';
import { implement } from './action.ts';
import { productResources } from './inventory-product.ts';
import { IdentityResolver } from './invocation.ts';

/** Kit composition and its tenant-local serialization guard have no product or stock write capability. */
export const kitResources = Effect.gen(
    /** Store the whole ordered list in one scalar text field so replacement and history have one atomic revision. */ function* () {
        // JSON is a private codec for a fixed bounded array, never an arbitrary JSON action field or a new SQL field kind.
        const definitions = yield* declareResource({
            id: 'inventory.kit',
            owner: 'inventory.kits',
            moduleVersion: '1.0.0',
            fields: { components: { type: 'text', optional: false } },
        });
        const guard = yield* declareResource({
            id: 'inventory.kit-guard',
            owner: 'inventory.kits',
            moduleVersion: '1.0.0',
            fields: { marker: { type: 'boolean', optional: false } },
        });
        return { definitions, guard };
    }
);
const guardId = '019b0000-0000-7000-8000-000000000002';
const storedComponents = Schema.String.pipe(Schema.maxLength(16384), Schema.compose(Schema.parseJson(KitComponents)));
/** Only a recognized guard initialization/CAS conflict permits a bounded full-transaction retry. */
class GuardConflict extends Data.TaggedError('KitGuardConflict') {}

/** Compose with productModule on the same tenant Resources/Integrity owner; this module never mutates Product. */
export const kitModule = Effect.gen(
    /** Retain infrastructure only; resolve and recheck caller authority separately for every invocation and lock wait. */ function* () {
        // A second module ID lets kit actions coexist with the existing inventory module without replacing registration.
        const resources = yield* Resources;
        const route = Object.freeze({ ...(yield* CurrentTenant) });
        const identity = yield* IdentityResolver;
        const authorizer = yield* Authorizer;
        const flags = yield* Flags;
        const { definitions, guard } = yield* kitResources;
        const { products } = yield* productResources;

        /** Decode only our fixed bounded persisted codec; never return stored JSON or parser diagnostics unchecked. */
        const components = (text: string) => Schema.decodeUnknown(storedComponents)(text);

        /** Supply disposable policy targets and recheck after contention, preserving the handler's detached input. */
        const run = <S extends ActionSpec, A, E>(
            spec: S & { readonly input: Schema.Schema<Input<S>, Schema.Schema.Encoded<S['input']>> },
            input: Input<S>,
            work: Effect.Effect<A, E, Caller | CurrentTenant>,
            write: boolean
        ) =>
            Effect.gen(
                /** Require the presented identity to remain canonical and bound to the composed tenant, rather than switching providers. */ function* () {
                    // The shared execution seam is protected; like products, fail closed on any ambient/resolved identity mismatch.
                    const ambient = yield* Effect.serviceOption(Caller);
                    if (Option.isNone(ambient)) return yield* Effect.fail({ _tag: 'KitUnavailable' } as const);
                    const presented = Object.freeze({ ...ambient.value });
                    const encoded = yield* Schema.encode(Schema.parseJson(spec.input))(input);
                    const authorize = Effect.gen(
                        /** A retained observer reference is not reusable authority and cannot rewrite the eventual stored list. */ function* () {
                            // Refresh every security dimension after waiting; a grant or flag may have been revoked in the meantime.
                            const caller = Object.freeze({ ...(yield* identity.resolve({ ...presented })) });
                            if (
                                caller.subject !== presented.subject ||
                                caller.session !== presented.session ||
                                caller.tenant !== route.id ||
                                caller.tenant !== presented.tenant ||
                                caller.kind !== presented.kind ||
                                caller.onBehalfOf !== presented.onBehalfOf
                            )
                                return yield* Effect.fail({ _tag: 'KitUnavailable' } as const);
                            if (!(yield* flags.evaluate(inventoryFlag)).value)
                                return yield* Effect.fail({ _tag: 'KitUnavailable' } as const);
                            yield* authorizer.canInvoke({ ...caller }, spec);
                            // Decode through the exact action schema; no observer receives the detached handler object.
                            yield* authorizer.check(
                                { ...caller },
                                spec,
                                yield* Schema.decode(Schema.parseJson(spec.input))(encoded)
                            );
                            return Object.freeze({ ...presented });
                        }
                    );
                    const caller = yield* authorize;
                    return yield* resources
                        .transaction(
                            Effect.gen(
                                /** The guard and replacement must share the durable invocation transaction, not two in-memory preflight reads. */ function* () {
                                    // Guard-first ordering serializes graph snapshots across distinct hosts and database connections.
                                    if (write) {
                                        const previous = yield* resources.get(guard, guardId);
                                        yield* (
                                            previous
                                                ? resources.update(guard, guardId, previous.revision, { marker: true })
                                                : resources.create(guard, guardId, { marker: true })
                                        ).pipe(
                                            Effect.mapError(
                                                /** Retry only this known serialization boundary, never graph or SQL failures. */ (
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
                        .pipe(Effect.provideService(Caller, caller), Effect.provideService(CurrentTenant, route));
                }
            ).pipe(
                Effect.retry({
                    times: 3,
                    /** Do not retry deadlocks, SQLite busy, policy or domain refusal. */ while: (error) =>
                        error instanceof GuardConflict,
                }),
                Effect.mapError(
                    /** Hide provider/decoder failures and retain only the declared bounded domain category. */ (
                        error
                    ): KitFailure => (Schema.is(KitFailure)(error) ? error : { _tag: 'KitUnavailable' })
                )
            );

        /** Load a complete bounded tenant graph, refusing the first row beyond the ceiling instead of truncating. */
        const graph = Effect.gen(
            /** Resources queries are capped at 100; an extra page distinguishes an exact ceiling from an incomplete scan. */ function* () {
                // All graph writers hold the same guard, so pages are one serialized graph snapshot.
                const result = new Map<string, ReadonlyArray<KitComponent>>();
                let after: string | undefined;
                for (;;) {
                    const rows = yield* resources.query(definitions, { limit: 100, ...(after ? { after } : {}) });
                    for (const row of rows) {
                        if (result.size >= 1000) return yield* Effect.fail({ _tag: 'KitLimit' } as const);
                        result.set(row.id, yield* components(row.value.components));
                    }
                    if (rows.length < 100) return result;
                    after = rows.at(-1)?.id;
                }
            }
        );

        /** Iterative color DFS checks every edge, including optional ones, without a recursion-depth escape. */
        const acyclic = (nodes: ReadonlyMap<string, ReadonlyArray<KitComponent>>) =>
            Effect.gen(
                /** A gray revisit is a cycle; black revisits preserve DAG sharing without multiplying work. */ function* () {
                    // Complete traversal matters: silently stopping at a visited/depth budget could admit an unchecked back edge.
                    const gray = new Set<string>();
                    const black = new Set<string>();
                    for (const root of nodes.keys()) {
                        const stack: Array<readonly [string, boolean]> = [[root, false]];
                        while (stack.length) {
                            const entry = stack.pop();
                            if (!entry) break;
                            const [id, leaving] = entry;
                            if (leaving) {
                                gray.delete(id);
                                black.add(id);
                                continue;
                            }
                            if (black.has(id)) continue;
                            if (gray.has(id)) return yield* Effect.fail({ _tag: 'KitCycle' } as const);
                            gray.add(id);
                            stack.push([id, true]);
                            for (const edge of nodes.get(id) ?? []) stack.push([edge.product, false]);
                        }
                    }
                }
            );

        /** Revalidate counted-unit products reachable from this replacement, with a distinct-product work ceiling. */
        const eligible = (id: string, nodes: ReadonlyMap<string, ReadonlyArray<KitComponent>>) =>
            Effect.gen(
                /** Nested products must still exist and be unarchived now; historical get deliberately does not make that claim. */ function* () {
                    // Count leaf products too: a wide graph must not turn bounded definition traversal into unbounded IO.
                    const seen = new Set<string>();
                    const pending = [id];
                    while (pending.length) {
                        const key = pending.pop();
                        if (!key || seen.has(key)) continue;
                        if (seen.size >= 1000) return yield* Effect.fail({ _tag: 'KitLimit' } as const);
                        seen.add(key);
                        const row = yield* resources.get(products, key);
                        if (!row) return yield* Effect.fail({ _tag: 'ProductNotFound' } as const);
                        const product = yield* Schema.decodeUnknown(Product)({
                            id: row.id,
                            revision: row.revision,
                            name: row.value.name,
                            sku: row.value.sku,
                            category: row.value.category,
                            tracking: row.value.tracking,
                            unit: row.value.unit,
                            archived: row.value.archived,
                        });
                        if (product.archived) return yield* Effect.fail({ _tag: 'ProductArchived' } as const);
                        if (product.unit !== 'each') return yield* Effect.fail({ _tag: 'UnsupportedKitUnit' } as const);
                        for (const edge of nodes.get(key) ?? []) pending.push(edge.product);
                    }
                }
            );

        return {
            manifest: {
                format: 1,
                id: 'inventory.kits',
                version: '1.0.0',
                description: 'Private counted kit composition, without stock.',
                flags: [inventoryFlag],
                actions: [DefineKit.name, GetKit.name],
            },
            actions: [
                implement(
                    DefineKit,
                    /** Snapshot through host decoding; replacement never mutates a product or its guard. */ (input) =>
                        run(
                            DefineKit,
                            input,
                            Effect.gen(
                                /** Validate the prospective whole graph before its one-row composition replacement. */ function* () {
                                    // Keep prior definitions intact on every domain failure, including late traversal exhaustion.
                                    const previous = yield* resources.get(definitions, input.id);
                                    if ((previous?.revision ?? 0) !== input.revision)
                                        return yield* Effect.fail({ _tag: 'RevisionConflict' } as const);
                                    const unique = new Set<string>();
                                    for (const edge of input.components) {
                                        if (unique.has(edge.product))
                                            return yield* Effect.fail({ _tag: 'DuplicateComponent' } as const);
                                        unique.add(edge.product);
                                    }
                                    const nodes = yield* graph;
                                    nodes.set(input.id, input.components);
                                    if (nodes.size > 1000) return yield* Effect.fail({ _tag: 'KitLimit' } as const);
                                    yield* acyclic(nodes);
                                    yield* eligible(input.id, nodes);
                                    const value = { components: JSON.stringify(input.components) };
                                    const stored = previous
                                        ? yield* resources.update(definitions, input.id, input.revision, value)
                                        : yield* resources.create(definitions, input.id, value);
                                    return { id: stored.id, revision: stored.revision, components: input.components };
                                }
                            ),
                            true
                        )
                ),
                implement(
                    GetKit,
                    /** Preserve recorded composition through later product archive; never infer fulfilment. */ (
                        input
                    ) =>
                        run(
                            GetKit,
                            input,
                            Effect.gen(
                                /** Return only a strictly decoded bounded snapshot, not raw stored JSON or current product details. */ function* () {
                                    // Historical metadata must not disappear or be rewritten merely because a product was archived later.
                                    const row = yield* resources.get(definitions, input.id);
                                    if (!row) return yield* Effect.fail({ _tag: 'KitNotFound' } as const);
                                    return {
                                        id: row.id,
                                        revision: row.revision,
                                        components: yield* components(row.value.components),
                                    };
                                }
                            ),
                            false
                        )
                ),
            ],
        };
    }
);
