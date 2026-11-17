/**
 * @file packages/contracts/src/telemetry-export.ts
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

import { Context, type Effect, Layer, Schema } from 'effect';
import { HookEvent } from './hook.ts';
import { TenantId } from './ids.ts';
import { ModuleId, ModuleVersion } from './module-manifest.ts';
import { TelemetryRecord, TelemetrySinkFailure } from './observability.ts';

/** Authenticated host provenance, never derived from a record or plugin assertion. */
export const TelemetryExportBinding = Schema.Struct({
    tenantId: TenantId,
    moduleId: ModuleId,
    moduleVersion: ModuleVersion,
    generation: Schema.Number.pipe(Schema.int(), Schema.between(0, Number.MAX_SAFE_INTEGER)),
    profile: TelemetryRecord.fields.profile,
    /** Reuse the existing operation taxonomy; only ordinary scopes may export. */
    operation: HookEvent.fields.operation,
    purpose: ModuleId,
    /** Host-approved opaque export pseudonym, not a tenant/principal identifier. */
    destinationId: Schema.UUID,
}).annotations({ parseOptions: { onExcessProperty: 'error' } });
export type TelemetryExportBinding = typeof TelemetryExportBinding.Type;

/** Static reviewed source only. Input text and attributes never cross this boundary. */
export const TelemetryExportPolicy = Schema.Struct({
    messages: Schema.Record({ key: TelemetryRecord.fields.code, value: TelemetryRecord.fields.text }).pipe(
        Schema.filter(
            /** Bound reviewed catalog size independently of application log volume. */ (messages) =>
                Object.keys(messages).length <= 128
        )
    ),
}).annotations({ parseOptions: { onExcessProperty: 'error' } });
export type TelemetryExportPolicy = typeof TelemetryExportPolicy.Type;

/** Every provider interaction, including a payload-free flush barrier, needs a fresh grant. */
export type TelemetryExportOperation = TelemetryRecord['signal'] | 'flush';

/** Must check live tenant/purpose/module-generation grants; registration grants nothing. */
export class TelemetryExportAuthority extends Context.Tag('@eventiva/contracts/TelemetryExportAuthority/v1')<
    TelemetryExportAuthority,
    {
        /** Check the current complete tenant/destination grant, including payload-free flush barriers. */
        readonly authorize: (
            binding: TelemetryExportBinding,
            operation: TelemetryExportOperation
        ) => Effect.Effect<void, TelemetrySinkFailure>;
    }
>() {}

/** No remote release is permitted until composition supplies an explicit live policy. */
export const TelemetryExportDeny = Layer.succeed(TelemetryExportAuthority, {
    /** Missing release policy never permits diagnostic metadata to leave the host. */
    authorize: () => new TelemetrySinkFailure({ reason: 'unavailable' }),
});

/**
 * Trusted composition-only port below the governed sink. No internal payload queue
 * or retry: flush/shutdown must never release records admitted under an old grant.
 */
export class TelemetryExportProvider extends Context.Tag('@eventiva/contracts/TelemetryExportProvider/v1')<
    TelemetryExportProvider,
    {
        /** Send one minimized authorized record for this exact binding without retaining it for replay. */
        readonly write: (
            binding: TelemetryExportBinding,
            record: TelemetryRecord
        ) => Effect.Effect<void, TelemetrySinkFailure>;
        /** Complete an authorized barrier without releasing payloads queued under an earlier grant. */
        readonly flush: (binding: TelemetryExportBinding) => Effect.Effect<void, TelemetrySinkFailure>;
    }
>() {}
