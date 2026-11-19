/**
 * @file apps/server/src/module-run.ts
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

import { RunSnapshot } from '@eventiva/contracts/module-manifest';
import { Storage } from '@eventiva/contracts/storage';
import { type ActionHost, type ServerModule } from '@eventiva/runtime/host';
import { canonicalJson } from '@eventiva/runtime/invocation';
import { Context, Data, Effect, Schema } from 'effect';

/** Missing exact executable/config/schema artifacts require operator recovery, never selection of latest. */
export class RunRecoveryRequired extends Data.TaggedError('RunRecoveryRequired')<Record<never, never>> {}

/** Trusted retained executable artifacts and their non-secret configuration/schema identity. */
export interface RunArtifact {
    readonly snapshot: RunSnapshot;
    /** Materialize tenant-bound handlers only inside the authenticated route; acquire services through their normal scoped module layers. */
    readonly modules: Effect.Effect<ReadonlyArray<ServerModule>, RunRecoveryRequired, Storage>;
}

/** Explicit composition-only service: no code download, mutable module registry, tenant selection or default fallback. */
export class ModuleRunCatalog extends Context.Tag('@eventiva/server/ModuleRunCatalog')<
    ModuleRunCatalog,
    {
        /** Unique per process incarnation; the orchestrator binds each attempt once, never refreshes a stale token. */
        readonly incarnation: string;
        readonly current: RunSnapshot;
        readonly artifacts: ReadonlyArray<RunArtifact>;
    }
>() {}

/** Resolve exact recorded executable/config/schema identity independently of the current admission default. */
export const runArtifact = (recorded: RunSnapshot) =>
    Effect.gen(
        /** Validate metadata before selecting trusted executable objects, and fail closed on missing or ambiguous entries. */ function* () {
            const catalog = yield* ModuleRunCatalog;
            const snapshot = yield* Schema.decodeUnknown(RunSnapshot)(recorded);
            const identity = yield* canonicalJson({
                composition: snapshot.composition,
                providers: snapshot.providers,
                schema: snapshot.schema,
            });
            const matches: Array<RunArtifact> = [];
            for (const artifact of catalog.artifacts) {
                const candidate = yield* Schema.decodeUnknown(RunSnapshot)(artifact.snapshot);
                if (
                    (yield* canonicalJson({
                        composition: candidate.composition,
                        providers: candidate.providers,
                        schema: candidate.schema,
                    })) === identity
                )
                    matches.push(artifact);
            }
            const selected = matches[0];
            if (matches.length !== 1 || selected === undefined) return yield* new RunRecoveryRequired();
            const modules = yield* selected.modules;
            if (modules.length !== snapshot.composition.modules.length) return yield* new RunRecoveryRequired();
            // Actual registered executable manifests must match every exact selected version, not just the catalog label.
            for (const pin of snapshot.composition.modules) {
                const matching = modules.filter(
                    /** Treat manifests as untrusted data until the normal host registration validates their full contract. */
                    (module) =>
                        typeof module.manifest === 'object' &&
                        module.manifest !== null &&
                        !Array.isArray(module.manifest) &&
                        'id' in module.manifest &&
                        'version' in module.manifest &&
                        module.manifest.id === pin.id &&
                        module.manifest.version === pin.version
                );
                if (matching.length !== 1) return yield* new RunRecoveryRequired();
            }
            // Each explicit provider binding must retain one exact configuration reference for that selected provider instance.
            for (const binding of snapshot.composition.bindings) {
                if (
                    snapshot.providers.filter(
                        /** Resolve named instances only; another provider or default configuration cannot satisfy the recorded binding. */
                        (provider) => provider.module === binding.provider && provider.instance === binding.instance
                    ).length !== 1
                )
                    return yield* new RunRecoveryRequired();
            }
            return { snapshot, modules };
        }
    ).pipe(
        Effect.mapError(
            /** Keep executable and configuration diagnostics out of transport errors. */ () =>
                new RunRecoveryRequired()
        )
    );

/** Register only exact retained modules on the already tenant-bound host; ordinary invocation gates remain unchanged. */
export const registerRunArtifact = (host: ActionHost['Type'], snapshot: RunSnapshot) =>
    Effect.gen(
        /** Resolve the entire selection before publishing any handler in this invocation's disposable scope. */ function* () {
            // The host is disposable and tenant-bound: never replace its exact selection with the admission default.
            const artifact = yield* runArtifact(snapshot);
            for (const module of artifact.modules) yield* host.register(module);
        }
    );
