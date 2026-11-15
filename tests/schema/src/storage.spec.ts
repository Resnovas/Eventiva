/**
 * @file tests/schema/src/storage.spec.ts
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

import { integer, json, text } from '@eventiva/schema/field';
import { columns, type SyncDeclaration } from '@eventiva/schema/storage';
import { expect, it } from '@effect/vitest';
import { Schema } from 'effect';

it('declares typed raw canonical sync columns separately from JSON projections', () => {
    const declaration: SyncDeclaration = {
        kind: 'canonical',
        storage: 'raw',
        migrationVersion: 1,
        columns: columns({ name: text(), quantity: integer(), projection: json(Schema.String) }),
    };
    expect(declaration.columns).toEqual([
        { name: 'name', logical: 'text', nullable: false, conflict: 'field-lww' },
        { name: 'quantity', logical: 'integer', nullable: false, conflict: 'field-lww' },
        { name: 'projection', logical: 'json', nullable: false, conflict: 'field-lww' },
    ]);
    // @ts-expect-error Canonical records cannot use JSON projection storage.
    const invalid: SyncDeclaration = { kind: 'canonical', storage: 'json', source: 'records' };
    expect(invalid).toBeDefined();
});
