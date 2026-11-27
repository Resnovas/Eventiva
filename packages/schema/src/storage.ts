/**
 * @file packages/schema/src/storage.ts
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

import type { Field } from './field.ts';

/**
 * Portable column declarations, not SQL types. Canonical sync records are typed raw columns.
 *
 * @since 0.0.1
 * @example
 * const column: Column = { name: 'title', logical: 'text', nullable: false, conflict: 'field-lww' };
 */
export interface Column {
    readonly name: string;
    readonly logical: Field['logical'];
    readonly nullable: boolean;
    readonly conflict: Field['conflict'];
}
/**
 * Project portable column metadata in the declaration's entry order; omit codecs, security policy and driver-specific types.
 *
 * @since 0.0.1
 * @param fields - The fields of a resource, by field name.
 * @returns One column per field, in the order the fields were declared.
 * @example
 * const declared = columns(Event.fields);
 */
export const columns = (fields: Readonly<Record<string, Field>>): ReadonlyArray<Column> =>
    Object.entries(fields).map(
        /**
         * Retain only column shape and offline conflict metadata, not an executable field schema.
         *
         * @param entry - The field name and its field declaration.
         * @returns The column describing that field.
         */
        (entry) => ({
            name: entry[0],
            logical: entry[1].logical,
            nullable: entry[1].nullable,
            conflict: entry[1].conflict,
        })
    );
/**
 * How a resource syncs: a canonical record stored as raw typed columns, or a JSON projection of another source.
 *
 * @since 0.0.1
 * @example
 * const sync: SyncDeclaration = { kind: 'canonical', storage: 'raw', columns: columns(Event.fields), migrationVersion: 1 };
 */
export type SyncDeclaration =
    | {
          readonly kind: 'canonical';
          readonly storage: 'raw';
          readonly columns: ReadonlyArray<Column>;
          readonly migrationVersion: number;
      }
    | { readonly kind: 'projection'; readonly storage: 'json'; readonly source: string };
