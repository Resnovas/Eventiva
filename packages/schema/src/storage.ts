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

/** Portable column declarations, not SQL types. Canonical sync records are typed raw columns. */
export interface Column {
    readonly name: string;
    readonly logical: Field['logical'];
    readonly nullable: boolean;
    readonly conflict: Field['conflict'];
}
export const columns = (fields: Readonly<Record<string, Field>>): ReadonlyArray<Column> =>
    Object.entries(fields).map(([name, field]) => ({
        name,
        logical: field.logical,
        nullable: field.nullable,
        conflict: field.conflict,
    }));
export type SyncDeclaration =
    | {
          readonly kind: 'canonical';
          readonly storage: 'raw';
          readonly columns: ReadonlyArray<Column>;
          readonly migrationVersion: number;
      }
    | { readonly kind: 'projection'; readonly storage: 'json'; readonly source: string };
