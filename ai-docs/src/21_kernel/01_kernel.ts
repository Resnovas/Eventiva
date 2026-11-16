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
class Messages {
    readonly read: (key: string) => Effect.Effect<string>;
    constructor(prefix: string) {
        this.read = (key) => Effect.succeed(`${prefix}:${key}`);
    }
}
const MessagesSchema = Schema.instanceOf(Messages);
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

const provider = (id: string): ModuleDefinition => ({
    manifest: { ...manifest(id), provides: [{ name: 'Tenant A', capability: 'messages', version: '1.0.0' }] },
    validate: Effect.void,
    layer: Layer.effect(
        KernelModule,
        Effect.gen(function* () {
            const service = yield* kernelProvider(MessagesSchema, new Messages(id));
            return KernelModule.of({
                providers: new Map([['Tenant A', service]]),
                install: Effect.void,
                activate: Effect.void,
                ready: Effect.void,
                deactivate: Effect.void,
            });
        })
    ),
});
const feature: ModuleDefinition = {
    manifest: { ...manifest('feature'), requires: [{ name: 'startup', capability: 'messages', version: '1.0.0' }] },
    validate: Effect.void,
    layer: Layer.effect(
        KernelModule,
        Effect.gen(function* () {
            const environment = yield* KernelEnvironment;
            const messages = yield* environment.resolve('startup', MessagesSchema);
            return KernelModule.of({
                providers: new Map<string, KernelProvider>(),
                install: Effect.void,
                activate: messages.read('hello').pipe(Effect.asVoid),
                ready: Effect.void,
                deactivate: Effect.void,
            });
        })
    ),
};

/** Supply authenticated identity and real admission/authorization policy at the app boundary. */
export const runKernelExample = (
    caller: CallerIdentity,
    authority: Layer.Layer<KernelAuthority>,
    selected: 'local' | 'regional'
) =>
    Effect.gen(function* () {
        const kernel = yield* Kernel;
        const selectedProvider = provider(selected);
        return yield* kernel.compose(
            {
                modules: [feature.manifest, selectedProvider.manifest].map(({ id, version }) => ({ id, version })),
                bindings: [{ consumer: 'feature', requirement: 'startup', provider: selected, instance: 'Tenant A' }],
            },
            [feature, selectedProvider]
        );
    }).pipe(
        Effect.provideService(Caller, caller),
        Effect.provide(KernelLive('example-runtime').pipe(Layer.provide(authority))),
        Effect.scoped
    );
