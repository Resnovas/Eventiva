/**
 * @file ai-docs/src/21_kernel/01_kernel.ts
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
import { type KernelManifest } from '@eventiva/contracts/module-manifest';
import { type KernelAuthority } from '@eventiva/contracts/module-policy';
import {
    Kernel,
    KernelEnvironment,
    KernelLive,
    KernelModule,
    kernelProvider,
    type KernelProvider,
    type ModuleDefinition,
} from '@eventiva/runtime/kernel-runtime';
import { Effect, Layer, Schema } from 'effect';

// A neutral, trusted callable service contract, shared by providers and consumer.
/** Example in-process message capability; the captured provider prefix makes selected bindings observable. */
class Messages {
    /** Produce a deterministic message without IO or access to another provider's state. */
    readonly read: /** Read a key without IO; the result carries this instance's provider prefix. */ (key: string) => Effect.Effect<string>;
    /** Bind this instance's immutable prefix for all subsequent reads. */
    constructor(prefix: string) {
        this.read = /** Format a key using only this provider's captured prefix. */ (key) => Effect.succeed(`${prefix}:${key}`);
    }
}
const MessagesSchema = Schema.instanceOf(Messages);
/** Build a minimal example manifest with no implicit dependencies or migration work. */
const manifest = (id: string): KernelManifest => ({
    id,
    version: '1.0.0',
    trust: 'first-party',
    isolation: 'in-process',
    dependencies: [],
    provides: [],
    requires: [],
    migrations: [],
    restartRequired: false,
});

/** Publish one typed messages instance under an explicit capability/version declaration. */
const provider = (id: string): ModuleDefinition => ({
    manifest: { ...manifest(id), provides: [{ name: 'Tenant A', capability: 'messages', version: '1.0.0' }] },
    validate: Effect.void,
    layer: Layer.effect(
        KernelModule,
        Effect.gen(
            /** Wrap the trusted service instance for kernel admission and publish it under the manifest's instance name. */ function* () {
                // Admission uses the schema-wrapped capability; publishing the raw instance would bypass that boundary.
                const service = yield* kernelProvider(MessagesSchema, new Messages(id));
                return KernelModule.of({
                    providers: new Map([['Tenant A', service]]),
                    install: Effect.void,
                    activate: Effect.void,
                    ready: Effect.void,
                    deactivate: Effect.void,
                });
            }
        )
    ),
});
const feature: ModuleDefinition = {
    manifest: { ...manifest('feature'), requires: [{ name: 'startup', capability: 'messages', version: '1.0.0' }] },
    validate: Effect.void,
    layer: Layer.effect(
        KernelModule,
        Effect.gen(
            /** Resolve only the declared startup binding and use it during feature activation. */ function* () {
                // Resolution stays in the kernel environment so choosing a provider cannot become ambient global lookup.
                const environment = yield* KernelEnvironment;
                const messages = yield* environment.resolve('startup', MessagesSchema);
                return KernelModule.of({
                    providers: new Map<string, KernelProvider>(),
                    install: Effect.void,
                    activate: messages.read('hello').pipe(Effect.asVoid),
                    ready: Effect.void,
                    deactivate: Effect.void,
                });
            }
        )
    ),
};

/** Supply authenticated identity and real admission/authorization policy at the app boundary. */
export const runKernelExample = (
    caller: CallerIdentity,
    authority: Layer.Layer<KernelAuthority>,
    selected: 'local' | 'regional'
) =>
    Effect.gen(
        /** Compose the chosen provider and consumer with an exact instance binding in the authorized kernel scope. */ function* () {
            // Pin both module identities and the binding; a capability name alone does not select an implementation.
            const kernel = yield* Kernel;
            const selectedProvider = provider(selected);
            return yield* kernel.compose(
                {
                    modules: [feature.manifest, selectedProvider.manifest].map(
                        /** Admit the exact module versions used by this composition. */ ({ id, version }) => ({
                            id,
                            version
                        })
                    ),
                    bindings: [
                        { consumer: 'feature', requirement: 'startup', provider: selected, instance: 'Tenant A' }
                    ],
                },
                [feature, selectedProvider]
            );
        }
    ).pipe(
        Effect.provideService(Caller, caller),
        Effect.provide(KernelLive('example-runtime').pipe(Layer.provide(authority))),
        Effect.scoped
    );
