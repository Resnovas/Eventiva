/**
 * @file packages/runtime/src/inventory-location.ts
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
    Location,
    LocationFailure,
    locationActions,
    locationCreate,
    locationUpdate,
    locationGet,
    locationList,
    locationResources,
} from '@eventiva/contracts/inventory-location';
import { inventoryFlag } from '@eventiva/contracts/inventory-product';
import { Resources, type ResourceRecord } from '@eventiva/contracts/resource';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { Data, Effect, Option, Schema } from 'effect';
import { implement } from './action.ts';
import type { ServerModule } from './host.ts';
import { IdentityResolver } from './invocation.ts';

const guardId = '019b0000-0000-7000-8000-000000000001';
/** Retry only guard CAS/initialization conflicts after rollback, never arbitrary domain, policy or storage failures. */
class GraphConflict extends Data.TaggedError('LocationGraphConflict') {}

/**
 * Compose on a trusted tenant route with the same Resources/Storage owner as durable Integrity.
 * The tenant-local guard serializes all graph changes, including disjoint rows on separate connections.
 * No import registers actions, enables the flag or grants permission; no stock authority is inferred.
 */
export const inventoryLocationModule = Effect.gen(
    /** Capture routing/infrastructure only; identity, permissions and flag are refreshed for each invocation and guard wait. */ function* () {
        // Holding a registration-time caller would incorrectly preserve authority after session/membership revocation.
        const api = yield* Resources;
        const tenant = yield* CurrentTenant;
        const identity = yield* IdentityResolver;
        const authorizer = yield* Authorizer;
        const flags = yield* Flags;
        const { locations, guard } = yield* locationResources;
        /** Decode every persisted projection strictly; internal root representation never escapes this feature boundary. */
        const output = (row: ResourceRecord<typeof locations.fields>) =>
            Schema.decodeUnknown(Location)({
                id: row.id,
                revision: row.revision,
                ...row.value,
                parent: row.value.parent === '' ? null : row.value.parent,
            }).pipe(
                Effect.mapError(
                    /** Corrupt persisted metadata must not become schema-error diagnostics containing private values. */ () =>
                        new LocationFailure({ reason: 'unavailable' })
                )
            );
        /** Require an exact current tenant row before either projecting or mutating it. */
        const load = (id: string) =>
            api
                .get(locations, id)
                .pipe(
                    Effect.flatMap(
                        /** Missing location identity is not fabricated or resolved through another tenant's provider. */ (
                            row
                        ) => (row ? output(row) : Effect.fail(new LocationFailure({ reason: 'not-found' })))
                    )
                );
        /** Walk exact ancestors, not a query page, while the shared guard is held; overlong/invalid graphs fail closed. */
        const parentChain = (own: string, parent: string | null) =>
            Effect.gen(
                /** Follow every edge up to a bounded 1024 ancestors, refusing repetition, self-reference or genuine absence. */ function* () {
                    // Per-target CAS cannot stop two disjoint writes forming a cycle; run only after acquiring the graph guard.
                    const seen = new Set([own]);
                    let next = parent;
                    while (next !== null) {
                        if (seen.has(next)) return yield* new LocationFailure({ reason: 'cycle' });
                        if (seen.size > 1024) return yield* new LocationFailure({ reason: 'invalid-parent' });
                        seen.add(next);
                        const row = yield* api.get(locations, next);
                        if (!row) return yield* new LocationFailure({ reason: 'invalid-parent' });
                        next = (yield* output(row)).parent;
                    }
                }
            );
        /** Join the existing transaction owner and reauthorize after serialization; guard retries never replay a committed mutation. */
        const run = <S extends ActionSpec, A, E>(
            spec: S & { readonly input: Schema.Schema<Input<S>, Schema.Schema.Encoded<S['input']>> },
            input: Input<S>,
            work: Effect.Effect<A, E, Caller | CurrentTenant>,
            write = false
        ) =>
            Effect.gen(
                /** Bind canonical current authority to the captured tenant instead of accepting a caller-selected database route. */ function* () {
                    const ambient = yield* Effect.serviceOption(Caller);
                    if (Option.isNone(ambient)) return yield* new LocationFailure({ reason: 'unavailable' });
                    const presented = ambient.value;
                    // Authorizer targets are disposable decoded copies, never the input later persisted by a handler.
                    const encoded = yield* Schema.encode(Schema.parseJson(spec.input))(input);
                    const authorize = Effect.gen(
                        /** Guard waits can outlive grants, so admission-time identity is not a lasting capability. */ function* () {
                            // Reject any identity/routing change instead of following it into another tenant's storage.
                            const caller = yield* identity.resolve(presented);
                            if (
                                caller.subject !== presented.subject ||
                                caller.session !== presented.session ||
                                caller.tenant !== presented.tenant ||
                                caller.tenant !== tenant.id ||
                                caller.kind !== presented.kind ||
                                caller.onBehalfOf !== presented.onBehalfOf
                            )
                                return yield* new LocationFailure({ reason: 'unavailable' });
                            if (!(yield* flags.evaluate(inventoryFlag)).value)
                                return yield* new LocationFailure({ reason: 'unavailable' });
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
                    return yield* api
                        .transaction(
                            Effect.gen(
                                /** Lock before all graph reads/writes, including first initialization, using the provider's SQL transaction. */ function* () {
                                    // Guard revision CAS both serializes initialized graphs and fences simultaneous initial creation.
                                    if (write) {
                                        const previous = yield* api.get(guard, guardId);
                                        yield* (
                                            previous
                                                ? api.update(guard, guardId, previous.revision, { marker: true })
                                                : api.create(guard, guardId, { marker: true })
                                        ).pipe(
                                            Effect.mapError(
                                                /** Only a recognized guard conflict permits a bounded rollback/retry. */ (
                                                    error
                                                ) => (error.reason === 'conflict' ? new GraphConflict() : error)
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
                Effect.retry({
                    times: 3,
                    /** Do not retry location CAS, policy failure, interruption or database uncertainty. */ while: (
                        error
                    ) => error instanceof GraphConflict,
                }),
                Effect.mapError(
                    /** Hide all undeclared policy/codec/database diagnostics behind a fixed feature failure. */ (
                        error
                    ) => (error instanceof LocationFailure ? error : new LocationFailure({ reason: 'unavailable' }))
                )
            );
        return {
            manifest: {
                format: 1,
                id: 'inventory.location',
                version: '1.0.0',
                description: 'Tenant-private physical location metadata without stock.',
                flags: [inventoryFlag],
                actions: locationActions.map(
                    /** Register only these four canonical metadata specifications. */ (spec) => spec.name
                ),
            },
            actions: [
                implement(
                    locationCreate,
                    /** Preserve client identity and validate ancestry before the first tentative write. */ (input) =>
                        run(
                            locationCreate,
                            input,
                            Effect.gen(
                                /** Existing identities conflict even if the submitted metadata happens to match. */ function* () {
                                    // No upsert or name deduplication: only the original action key may replay a creation.
                                    if (yield* api.get(locations, input.id))
                                        return yield* new LocationFailure({ reason: 'conflict' });
                                    yield* parentChain(input.id, input.parent ?? null);
                                    return yield* output(
                                        yield* api.create(locations, input.id, {
                                            kind: input.kind,
                                            name: input.name,
                                            parent: input.parent ?? '',
                                        })
                                    );
                                }
                            ),
                            true
                        )
                ),
                implement(
                    locationUpdate,
                    /** Retain omitted values, never permit identity/kind mutation, and fence at the supplied revision. */ (
                        input
                    ) =>
                        run(
                            locationUpdate,
                            input,
                            Effect.gen(
                                /** Complete ancestry checks and mutation share the guard transaction, including rename-only updates. */ function* () {
                                    // Revalidate retained ancestry as well as explicit reparenting; corruption cannot be legitimized by a rename.
                                    const current = yield* load(input.id);
                                    if (current.revision !== input.expectedRevision)
                                        return yield* new LocationFailure({ reason: 'conflict' });
                                    const parent = input.parent === undefined ? current.parent : input.parent;
                                    yield* parentChain(input.id, parent);
                                    return yield* output(
                                        yield* api.update(locations, input.id, input.expectedRevision, {
                                            name: input.name ?? current.name,
                                            parent: parent ?? '',
                                        })
                                    );
                                }
                            ),
                            true
                        )
                ),
                implement(
                    locationGet,
                    /** Public read failures contain no private persistence diagnostics. */ (input) =>
                        run(locationGet, input, load(input.id))
                ),
                implement(
                    locationList,
                    /** Translate null roots into a single declared scalar equality filter, never a shared Resources change. */ (
                        input
                    ) =>
                        run(
                            locationList,
                            input,
                            Effect.gen(
                                /** Keep cursor ordering independent of insertion order and apply parent filtering before the page bound. */ function* () {
                                    // Omitted parent means all rows; truthiness would incorrectly conflate null roots with no filter.
                                    const limit = input.limit ?? 50;
                                    const rows = yield* api.query(locations, {
                                        limit,
                                        ...(input.after === undefined ? {} : { after: input.after }),
                                        ...(input.parent === undefined
                                            ? {}
                                            : { where: { field: 'parent' as const, equals: input.parent ?? '' } }),
                                    });
                                    return {
                                        items: yield* Effect.forEach(rows, output),
                                        next: rows.length === limit ? (rows.at(-1)?.id ?? null) : null,
                                    };
                                }
                            )
                        )
                ),
            ],
        } satisfies ServerModule;
    }
);
