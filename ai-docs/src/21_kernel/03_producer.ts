/**
 * @file ai-docs/src/21_kernel/03_producer.ts
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

import { Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import type { PlatformComposition } from '@eventiva/contracts/module-manifest';
import type { KernelAuthority } from '@eventiva/contracts/module-policy';
import { Kernel, KernelLive, KernelProducer, type ModuleDefinition } from '@eventiva/runtime/kernel-runtime';
import { Effect, Layer } from 'effect';

/**
 * Compose inside the caller's Scope with an already authenticated journal, classification policy and UUID source.
 * The host owns producer migrations/lifetime and authoritative reconciliation; this example enables no consumer.
 *
 * @param caller - Authenticated identity used to authorize composition.
 * @param authority - Admission and lifecycle policy supplied by the host.
 * @param journal - Migrated producer binding for the intended logical runtime.
 * @param composition - Requested exact module versions and provider bindings.
 * @param definitions - Implementations matching the pinned manifests.
 * @returns The composed kernel and receipt in the serving host's scope.
 * @since 0.0.0
 * @example
 * const prepared = composeDurableKernel(caller, policy, journal, pins, definitions);
 */
export const composeDurableKernel = (
    caller: CallerIdentity,
    authority: Layer.Layer<KernelAuthority>,
    journal: typeof KernelProducer.Service,
    composition: PlatformComposition,
    definitions: ReadonlyArray<ModuleDefinition>
) =>
    Effect.gen(
        /** Retain the kernel service in the enclosing Scope so callers can inspect status even after teardown. */ function* () {
            const context = yield* Layer.build(
                KernelLive(journal.producer.runtime.logical).pipe(
                    Layer.provide(authority),
                    Layer.provide(Layer.succeed(KernelProducer, journal))
                )
            );
            const kernel = yield* Kernel.pipe(Effect.provide(context));
            const receipt = yield* kernel.compose(composition, definitions).pipe(Effect.provideService(Caller, caller));
            return { kernel, receipt };
        }
    );
