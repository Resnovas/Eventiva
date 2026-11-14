/**
 * @file tests/schema/src/manifest.spec.ts
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

import { ModuleId, ModuleManifest, manifestFormat } from '@eventiva/schema/manifest';
import { describe, expect, it } from '@effect/vitest';
import { Schema } from 'effect';

const manifest = {
    format: manifestFormat,
    id: 'events.tickets',
    version: '1.2.0-beta.1',
    description: 'Ticket sales.',
    flag: 'events.tickets.enabled',
    actions: ['events.tickets.create'],
    flags: [{ key: 'events.tickets.enabled', description: 'Ticket sales.', owner: 'events', safeDefault: false }],
};

describe('module manifests', () => {
    const decode = Schema.decodeUnknownEither(ModuleManifest);

    it('decode a complete manifest unchanged', () => {
        const result = decode(manifest);
        expect(result._tag).toBe('Right');
        expect(Schema.encodeSync(ModuleManifest)(Schema.decodeUnknownSync(ModuleManifest)(manifest))).toEqual(manifest);
    });

    it('reject another format, a bad version, a bad action name and a bad module id', () => {
        expect(decode({ ...manifest, format: 2 })._tag).toBe('Left');
        expect(decode({ ...manifest, version: '1.2' })._tag).toBe('Left');
        expect(decode({ ...manifest, actions: ['create'] })._tag).toBe('Left');
        expect(decode({ ...manifest, id: 'Events' })._tag).toBe('Left');
        expect(Schema.is(ModuleId)('platform')).toBe(true);
    });
});
