/**
 * @file packages/contracts/src/module-manifest.ts
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

import { Schema } from 'effect';

const strict = { parseOptions: { onExcessProperty: 'error' } } as const;

/** Kernel wire contracts reject extra fields, including nested declarations. */
export const ModuleId = Schema.String.pipe(Schema.pattern(/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/));
export type ModuleId = typeof ModuleId.Type;
export const ModuleVersion = Schema.String.pipe(Schema.pattern(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/));
export type ModuleVersion = typeof ModuleVersion.Type;
export const ModuleDependency = Schema.Struct({ id: ModuleId, version: ModuleVersion }).annotations(strict);
export const CapabilityDeclaration = Schema.Struct({
    name: Schema.NonEmptyString,
    capability: ModuleId,
    version: ModuleVersion,
}).annotations(strict);
export const CapabilityRequirement = CapabilityDeclaration;
export const MigrationDeclaration = Schema.Struct({
    id: ModuleId,
    kind: Schema.Literal('additive', 'staged'),
    online: Schema.Boolean,
}).annotations(strict);
export const KernelManifest = Schema.Struct({
    id: ModuleId,
    version: ModuleVersion,
    /** Host policy must attest trust; this declaration does not grant authority. */
    trust: Schema.Literal('first-party', 'vetted', 'untrusted'),
    isolation: Schema.Literal('in-process', 'isolated'),
    dependencies: Schema.Array(ModuleDependency),
    provides: Schema.Array(CapabilityDeclaration),
    requires: Schema.Array(CapabilityRequirement),
    migrations: Schema.Array(MigrationDeclaration),
    restartRequired: Schema.Boolean,
}).annotations(strict);
export type KernelManifest = typeof KernelManifest.Type;
export const ProviderKey = Schema.Struct({ module: ModuleId, instance: Schema.NonEmptyString }).annotations(strict);
export type ProviderKey = typeof ProviderKey.Type;
export const ProviderBinding = Schema.Struct({
    consumer: ModuleId,
    requirement: Schema.NonEmptyString,
    provider: ModuleId,
    instance: Schema.NonEmptyString,
}).annotations(strict);
export type ProviderBinding = typeof ProviderBinding.Type;
export const PlatformComposition = Schema.Struct({
    modules: Schema.Array(ModuleDependency),
    bindings: Schema.Array(ProviderBinding),
}).annotations(strict);
export type PlatformComposition = typeof PlatformComposition.Type;
/** Immutable run identity contains references only: never live services, credentials or executable code. */
export const RunSnapshot = Schema.Struct({
    composition: PlatformComposition,
    providers: Schema.Array(
        Schema.Struct({
            module: ModuleId,
            instance: Schema.NonEmptyString,
            configuration: Schema.NonEmptyString,
        }).annotations(strict)
    ),
    schema: Schema.Array(
        Schema.Struct({
            name: Schema.String.pipe(Schema.pattern(/^\d{4}\.sql$/)),
            checksum: Schema.String.pipe(Schema.pattern(/^[a-f0-9]{64}$/)),
        }).annotations(strict)
    ),
    origin: Schema.Struct({
        incarnation: Schema.NonEmptyString,
        generation: Schema.Number.pipe(
            Schema.int(),
            Schema.positive(),
            Schema.lessThanOrEqualTo(Number.MAX_SAFE_INTEGER)
        ),
    }).annotations(strict),
}).annotations(strict);
export type RunSnapshot = typeof RunSnapshot.Type;
export const LifecycleOperation = Schema.Literal(
    'register',
    'validate',
    'install',
    'activate',
    'ready',
    'deactivate',
    'unregister',
    'retire',
    'update',
    'recover'
);
export type LifecycleOperation = typeof LifecycleOperation.Type;
export const ModuleState = Schema.Literal(
    'registered',
    'validated',
    'installed',
    'active',
    'ready',
    'inactive',
    'failed',
    'retired'
);
export type ModuleState = typeof ModuleState.Type;
export const ReadyReceipt = Schema.Struct({
    runtimeId: ModuleId,
    generation: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
    emitted: Schema.Boolean,
}).annotations(strict);
export type ReadyReceipt = typeof ReadyReceipt.Type;
export const UpdateResult = Schema.Union(
    Schema.Struct({ status: Schema.Literal('updated'), version: ModuleVersion }),
    Schema.Struct({
        status: Schema.Literal('restart-required'),
        reason: Schema.Literal('incompatible', 'migration', 'declared'),
    })
).annotations(strict);
export type UpdateResult = typeof UpdateResult.Type;
