/**
 * @file packages/contracts/src/inventory-location.ts
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

import { Effect, Schema } from 'effect';
import { define } from './action.ts';
import { inventoryFlag } from './inventory-product.ts';
import { declareResource } from './resource.ts';
import { UuidV7 } from './storage.ts';

const strict = { parseOptions: { onExcessProperty: 'error' } } as const;
const Name = Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(200));
const Revision = Schema.Int.pipe(Schema.between(1, 2147483646));
const Parent = Schema.NullOr(UuidV7);

/** Physical metadata only: kind and identity are immutable; null parent denotes a root, not an unknown stock level. */
export const Location = Schema.Struct({
    id: UuidV7,
    revision: Schema.Int.pipe(Schema.between(1, 2147483647)),
    kind: Schema.Literal('warehouse', 'zone', 'bin'),
    name: Name,
    parent: Parent,
}).annotations(strict);
export type Location = typeof Location.Type;

/** Finite failures carry neither private ancestor names nor persistence/authorization diagnostics. */
export class LocationFailure extends Schema.TaggedError<LocationFailure>()('LocationFailure', {
    reason: Schema.Literal('not-found', 'conflict', 'invalid-parent', 'cycle', 'unavailable'),
}) {}

const common = {
    version: 1,
    offline: 'online-only',
    sensitive: true,
    flag: inventoryFlag.key,
    error: LocationFailure,
} as const;
const write = { ...common, permission: 'inventory.location.write', sideEffect: 'write' } as const;
const read = { ...common, permission: 'inventory.location.read', sideEffect: 'read' } as const;

/** Create a distinct client UUIDv7 identity; omitted or null parent means root, with no kind hierarchy inferred. */
export const locationCreate = define('inventory.location.create', {
    ...write,
    description: 'Create tenant-private physical location metadata without adding stock.',
    input: Schema.Struct({
        id: UuidV7,
        kind: Location.fields.kind,
        name: Name,
        parent: Schema.optionalWith(Parent, { exact: true }),
    }).annotations(strict),
    output: Location,
});

/** Rename/reparent at an explicit revision; omitted fields remain unchanged and explicit null detaches the parent. */
export const locationUpdate = define('inventory.location.update', {
    ...write,
    description: 'Rename or reparent a physical location at its expected revision.',
    input: Schema.Struct({
        id: UuidV7,
        expectedRevision: Revision,
        name: Schema.optionalWith(Name, { exact: true }),
        parent: Schema.optionalWith(Parent, { exact: true }),
    }).annotations(strict),
    output: Location,
});

/** Read one strict current projection from the trusted tenant only, never a stock or availability assertion. */
export const locationGet = define('inventory.location.get', {
    ...read,
    description: 'Read tenant-private physical location metadata.',
    input: Schema.Struct({ id: UuidV7 }).annotations(strict),
    output: Location,
});

/** Exclusive-ID page, limit 1..100/default 50; omitted parent selects all, null selects roots, UUID selects exact children. */
export const locationList = define('inventory.location.list', {
    ...read,
    description: 'List physical locations in exclusive UUID order, optionally filtering their exact parent.',
    input: Schema.Struct({
        after: Schema.optionalWith(UuidV7, { exact: true }),
        limit: Schema.optionalWith(Schema.Int.pipe(Schema.between(1, 100)), { exact: true }),
        parent: Schema.optionalWith(Parent, { exact: true }),
    }).annotations(strict),
    output: Schema.Struct({ items: Schema.Array(Location), next: Schema.NullOr(UuidV7) }).annotations(strict),
});

/** No archive/delete exists until an authoritative ledger can enforce LocationNotEmpty. Import grants no authority. */
export const locationActions = [locationCreate, locationUpdate, locationGet, locationList] as const;

/** Declare the metadata and tenant-local graph lock through normalized Resources, without a new physical SQL schema. */
export const locationResources = Effect.gen(
    /** A scalar parent sentinel stays feature-local because Resources deliberately has no nullable/unset field. */ function* () {
        // Parent uses text solely to represent a root as ''; public codecs still require UUIDv7 or null.
        const locations = yield* declareResource({
            id: 'inventory.location',
            owner: 'inventory',
            moduleVersion: '1.0.0',
            fields: {
                kind: { type: 'text', optional: false },
                name: { type: 'text', optional: false },
                parent: { type: 'text', optional: false },
            },
        });
        const guard = yield* declareResource({
            id: 'inventory.location-guard',
            owner: 'inventory',
            moduleVersion: '1.0.0',
            fields: { marker: { type: 'boolean', optional: false } },
        });
        return { locations, guard };
    }
);
