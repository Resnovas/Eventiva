/**
 * @file packages/runtime/src/telemetry-export.ts
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

import { Flags, type Flag } from '@eventiva/contracts/flags';
import { TelemetryRecord, TelemetrySink, TelemetrySinkFailure } from '@eventiva/contracts/observability';
import {
    TelemetryExportAuthority,
    TelemetryExportBinding,
    TelemetryExportPolicy,
    TelemetryExportProvider,
    type TelemetryExportOperation,
} from '@eventiva/contracts/telemetry-export';
import { Effect, Layer, Schema } from 'effect';

/** Optional remote export remains off even when existing local diagnostics are enabled. */
export const telemetryExportFlag: Flag = {
    key: 'telemetry.export.enabled',
    owner: 'platform',
    description: 'Allow explicitly authorized minimized diagnostic export.',
    safeDefault: false,
};

/**
 * One trusted tenant/classification binding per pipeline. Use separate pipelines
 * for other tenants or security scopes; this cannot classify a mixed global logger.
 * The existing telemetryLayer owns bounded collection, deadlines and draining.
 */
export const governedTelemetrySinkLayer = (
    binding: TelemetryExportBinding,
    policy: TelemetryExportPolicy
): Layer.Layer<TelemetrySink, TelemetrySinkFailure, Flags | TelemetryExportAuthority | TelemetryExportProvider> =>
    Layer.scoped(
        TelemetrySink,
        Effect.gen(
            /** Capture one immutable security scope and its reviewed projection policy for this pipeline. */ function* () {
                // Decode once at acquisition; records and later callers cannot choose another release scope.
                const trusted = yield* Schema.decode(TelemetryExportBinding)(binding).pipe(
                    Effect.mapError(
                        /** Do not retain invalid binding values or decoder diagnostics. */ () =>
                            new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                const catalog = yield* Schema.decode(TelemetryExportPolicy)(policy).pipe(
                    Effect.mapError(
                        /** Hide rejected catalog text at the configuration boundary. */ () =>
                            new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                const flags = yield* Flags;
                const authority = yield* TelemetryExportAuthority;
                const provider = yield* TelemetryExportProvider;
                let closed = false;
                yield* Effect.addFinalizer(
                    /** Revoke retained sink handles when the owning scope closes. */ () =>
                        Effect.sync(
                            /** Close admission without flushing records under a stale authority. */ () => {
                                closed = true;
                            }
                        )
                );
                /** Recheck the host security floor and live grant at worker delivery, never at enqueue alone. */
                const authorize = (operation: TelemetryExportOperation) =>
                    Effect.gen(
                        /** Enforce static classification before consulting the current flag and grant. */ function* () {
                            // A permissive injected authority cannot waive the host's protected-operation floor.
                            if (
                                closed ||
                                trusted.operation !== 'ordinary' ||
                                trusted.profile === 'restricted' ||
                                trusted.profile === 'vault'
                            )
                                return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                            const flag = yield* flags.evaluate(telemetryExportFlag);
                            if (!flag.value) return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                            yield* authority.authorize(trusted, operation);
                            if (closed) return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                        }
                    );
                return TelemetrySink.of({
                    /** Project a catalog-approved record only after matching its static host classification. */
                    write: (input) =>
                        Effect.gen(
                            /** Detach and minimize input before granting one current provider release. */ function* () {
                                // Decode produces a detached value; caller mutation cannot change an in-flight projection.
                                const record = yield* Schema.decode(TelemetryRecord)(input, {
                                    onExcessProperty: 'error',
                                }).pipe(
                                    Effect.mapError(
                                        /** Never expose rejected diagnostic payloads in validation errors. */ () =>
                                            new TelemetrySinkFailure({ reason: 'invalid-record' })
                                    )
                                );
                                if (record.profile !== trusted.profile || !Object.hasOwn(catalog.messages, record.code))
                                    return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                const projected: TelemetryRecord = {
                                    ...record,
                                    profile: trusted.profile,
                                    text: catalog.messages[record.code] ?? '',
                                    attributes: {},
                                };
                                yield* authorize(record.signal);
                                yield* provider.write(trusted, projected);
                            }
                        ),
                    flush: Effect.gen(
                        /** Reauthorize the payload-free provider barrier instead of replaying queued metadata. */ function* () {
                            // Flush still reaches the retained provider, so a revoked export grant must stop even this payload-free call.
                            yield* authorize('flush');
                            yield* provider.flush(trusted);
                        }
                    ),
                });
            }
        )
    );
