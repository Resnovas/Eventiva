/**
 * @file tests/contracts/src/module-manifest.spec.ts
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

import { describe, expect, expectTypeOf, it } from '@effect/vitest';
import { Effect, Schema } from 'effect';
import {
    CapabilityDeclaration,
    KernelManifest,
    ModuleVersion,
    PlatformComposition,
    ProviderBinding,
    ProviderKey,
} from '@eventiva/contracts/module-manifest';

describe('kernel wire contracts', /** Cover exact kernel declarations separately from runtime composition and lifecycle behavior. */ () => {
    it('preserves strict schema-derived declaration types without erased fields', /** Pin trust, dependency and migration types so schema inference cannot silently erase contract fields. */ () => {
        expectTypeOf<KernelManifest['trust']>().toEqualTypeOf<'first-party' | 'vetted' | 'untrusted'>();
        expectTypeOf<KernelManifest['dependencies']>().toEqualTypeOf<
            ReadonlyArray<{ readonly id: string; readonly version: string }>
        >();
        expectTypeOf<KernelManifest['migrations']>().toEqualTypeOf<
            ReadonlyArray<{ readonly id: string; readonly kind: 'additive' | 'staged'; readonly online: boolean }>
        >();
        expectTypeOf<KernelManifest>().not.toBeAny();
        expectTypeOf<KernelManifest>().not.toBeUnknown();
        expectTypeOf<KernelManifest>().not.toEqualTypeOf<Record<string, never>>();
    });

    it.effect(
        'rejects range syntax, partial pins and noncanonical versions',
        /** Exercise kernel exact-version parsing independently of package range conventions. */ () =>
            Effect.gen(
                /** Require canonical three-part version pins and reject ranges, prereleases and build suffixes. */ function* () {
                    // A concrete multi-digit pin is the positive control for rejection of ambiguous or noncanonical versions.
                    for (const version of [
                        '^1.0.0',
                        '~1.2.0',
                        '1',
                        '1.2',
                        '01.2.3',
                        '1.2.3-beta',
                        '1.2.3+build',
                        '*'
                    ]) {
                        expect(yield* Schema.decodeUnknown(ModuleVersion)(version).pipe(Effect.isFailure)).toBe(true);
                    }
                    expect(yield* Schema.decodeUnknown(ModuleVersion)('12.3.47')).toBe('12.3.47');
                }
            )
    );

    it.effect(
        'keeps local instance and requirement names distinct from module identifiers',
        /** Exercise local naming freedom without relaxing canonical module identity constraints. */ () =>
            Effect.gen(
                /** Accept nonempty human-readable instance and requirement names but reject empty names and invalid module ids. */ function* () {
                    // Spaces and slashes are legal in local names, not in module identifiers used for provider lookup.
                    const key = { module: 'storage', instance: 'Tenant A/primary' };
                    expect(yield* Schema.decode(ProviderKey)(key)).toEqual(key);
                    const declaration = { name: key.instance, capability: 'storage', version: '2.0.0' };
                    expect(yield* Schema.decode(CapabilityDeclaration)(declaration)).toEqual(declaration);
                    const binding = {
                        consumer: 'feature',
                        requirement: 'Read records',
                        provider: key.module,
                        instance: key.instance,
                    };
                    expect(yield* Schema.decode(ProviderBinding)(binding)).toEqual(binding);
                    expect(yield* Schema.decode(ProviderKey)({ ...key, instance: '' }).pipe(Effect.isFailure)).toBe(
                        true
                    );
                    expect(
                        yield* Schema.decode(CapabilityDeclaration)({ ...declaration, name: '' }).pipe(Effect.isFailure)
                    ).toBe(true);
                    expect(
                        yield* Schema.decode(ProviderBinding)({ ...binding, requirement: '' }).pipe(Effect.isFailure)
                    ).toBe(true);
                    expect(
                        yield* Schema.decode(ProviderKey)({ ...key, module: 'Tenant A' }).pipe(Effect.isFailure)
                    ).toBe(true);
                }
            )
    );

    it.effect(
        'round trips portable manifests and rejects nested extra fields',
        /** Exercise strict wire round trips without installing modules or executing migrations. */ () =>
            Effect.gen(
                /** Verify manifest transport rejects extra root and migration fields plus incomplete provider bindings. */ function* () {
                    // Migration declarations carry portable metadata, not executable SQL smuggled through an extra field.
                    const input = {
                        id: 'feature',
                        version: '1.0.0',
                        trust: 'vetted',
                        isolation: 'in-process',
                        dependencies: [],
                        requires: [],
                        provides: [],
                        restartRequired: false,
                        migrations: [{ id: 'expand', kind: 'additive', online: true }],
                    };
                    const decode = Schema.decodeUnknown(KernelManifest);
                    const decoded = yield* decode(input);
                    expect(yield* Schema.encode(KernelManifest)(decoded)).toEqual(input);
                    expect(yield* decode({ ...input, arbitrary: true }).pipe(Effect.isFailure)).toBe(true);
                    expect(
                        yield* decode({ ...input, migrations: [{ ...input.migrations[0], sql: 'DELETE' }] }).pipe(
                            Effect.isFailure
                        )
                    ).toBe(true);
                    expect(
                        yield* Schema.decodeUnknown(PlatformComposition, { onExcessProperty: 'error' })({
                            modules: [],
                            bindings: [{ consumer: 'feature', requirement: 'db', provider: 'database' }],
                        }).pipe(Effect.isFailure)
                    ).toBe(true);
                }
            )
    );
});
