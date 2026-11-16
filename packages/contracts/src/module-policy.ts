/**
 * @file packages/contracts/src/module-policy.ts
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

import { type Cause, Context, Data, type Effect } from 'effect';
import type { CallerIdentity } from './caller.ts';
import type { KernelManifest, LifecycleOperation, ModuleId } from './module-manifest.ts';

/** Deliberately excludes inputs, configuration, secrets and arbitrary failure causes. */
interface KernelErrorFields {
    readonly module: string;
    /** Closed dependency path, present only for cycle failures. */
    readonly cycle?: ReadonlyArray<ModuleId>;
    readonly reason:
        | 'invalid-contract'
        | 'duplicate'
        | 'missing'
        | 'incompatible'
        | 'cycle'
        | 'invalid-state'
        | 'denied'
        | 'untrusted'
        | 'isolation-unavailable'
        | 'dependency-active'
        | 'workflow-active'
        | 'module-failed'
        | 'provider-unavailable'
        | 'dependency-missing'
        | 'dependency-version'
        | 'provider-ambiguous'
        | 'capability-version'
        | 'undeclared-dependency'
        | 'assurance-unmet'
        | 'invalid-config'
        | 'not-ready'
        | 'migration-required'
        | 'recovery-required';
}

// Constrain the vendor's open generic constructor so declarations retain the exact error contract.
const KernelErrorBase: new (
    fields: KernelErrorFields
) => Cause.YieldableError & KernelErrorFields & { readonly _tag: 'KernelError' } = Data.TaggedError('KernelError');
export class KernelError extends KernelErrorBase {}

/** No permissive default. Admission verifies provenance, not just the manifest's self-assertion. */
export class KernelAuthority extends Context.Tag('@eventiva/contracts/KernelAuthority')<
    KernelAuthority,
    {
        readonly admit: (manifest: KernelManifest) => Effect.Effect<void, KernelError>;
        readonly authorize: (
            caller: CallerIdentity,
            operation: LifecycleOperation,
            manifest: KernelManifest
        ) => Effect.Effect<void, KernelError>;
    }
>() {}
