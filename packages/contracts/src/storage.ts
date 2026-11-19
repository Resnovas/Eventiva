/**
 * @file packages/contracts/src/storage.ts
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

import { type Cause, Context, Data, type Effect, Schema } from 'effect';
import { TenantId } from './ids.ts';
import { RunSnapshot } from './module-manifest.ts';

/** Provider-neutral values. Integer quantities never pass through floating point arithmetic. */
export const UuidV7 = Schema.UUID.pipe(
    Schema.pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
);
export const EpochMillis = Schema.Number.pipe(Schema.int(), Schema.between(-62135596800000, 253402300799999));
export const ExactDecimal = Schema.String.pipe(Schema.pattern(/^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/));
export const MinorUnits = Schema.String.pipe(Schema.pattern(/^-?(0|[1-9][0-9]*)$/));
export const Quantity = Schema.Number.pipe(Schema.int(), Schema.between(1, Number.MAX_SAFE_INTEGER));
export const Version = Schema.Number.pipe(Schema.int(), Schema.between(0, Number.MAX_SAFE_INTEGER));
export type JsonValue =
    null | boolean | number | string | ReadonlyArray<JsonValue> | { readonly [key: string]: JsonValue };
export const JsonValue: Schema.Schema<JsonValue> = Schema.suspend(
    /** Resolve recursive JSON containers lazily while excluding nonfinite numbers and non-JSON values. */ () =>
        Schema.Union(
            Schema.Null,
            Schema.Boolean,
            Schema.JsonNumber,
            Schema.String,
            Schema.Array(JsonValue),
            Schema.Record({ key: Schema.String, value: JsonValue })
        )
);
export const Json: Schema.Schema<JsonValue, string> = Schema.parseJson(JsonValue);

/** Sanitized storage operation and optional bounded failure reason; raw driver errors do not cross this port. */
interface StorageFailureFields {
    readonly operation: string;
    readonly reason?:
        | 'invalid-data'
        | 'database'
        | 'filesystem'
        | 'randomness'
        | 'identity-guard-missing'
        | 'identity-key-mismatch'
        | 'identity-version-conflict'
        | 'identity-principal-required'
        | 'identity-link-collision'
        | 'identity-audit-tenant-mismatch';
}
/** Identify the rejected optimistic operation and its recoverable conflict category without database diagnostics. */
interface ConflictFields {
    readonly id: string;
    readonly reason: 'stale' | 'illegal-transition' | 'expired' | 'unavailable' | 'duplicate' | 'input-changed';
}
/** Explain a routing refusal without granting access to the requested tenant database. */
interface RoutingDeniedFields {
    readonly reason: string;
}

// Exact constructors keep the vendor's open generic out of emitted public declarations.
/** Construct the exact yieldable storage failure shape exported by this package. */
const storageFailureBase: new (
    fields: StorageFailureFields
) => Cause.YieldableError & StorageFailureFields & { readonly _tag: 'StorageFailure' } = Data.TaggedError(
    'StorageFailure'
)<StorageFailureFields>;
/** Construct a yieldable storage conflict without exposing the vendor's open error generic. */
const conflictBase: new (
    fields: ConflictFields
) => Cause.YieldableError & ConflictFields & { readonly _tag: 'StorageConflict' } = Data.TaggedError(
    'StorageConflict'
)<ConflictFields>;
/** Construct a routing denial whose fields carry no database capability. */
const routingDeniedBase: new (
    fields: RoutingDeniedFields
) => Cause.YieldableError & RoutingDeniedFields & { readonly _tag: 'RoutingDenied' } = Data.TaggedError(
    'RoutingDenied'
)<RoutingDeniedFields>;

/** Diagnostics contain module-owned identifiers only, never database errors or rejected input. */
export class StorageFailure extends storageFailureBase {}
/** An optimistic, expiry or deduplication conflict that the caller must resolve before retrying. */
export class Conflict extends conflictBase {}
/** Tenant admission failed; no routed storage service is supplied by this error. */
export class RoutingDenied extends routingDeniedBase {}

/** A queued command is an intent, never evidence of a confirmed allocation. */
export const GuardedCommand = Schema.Struct({
    id: UuidV7,
    expectedVersion: Version,
    expectedState: Schema.NonEmptyString,
    idempotencyKey: Schema.NonEmptyString,
    clientMutationId: UuidV7,
    deadline: EpochMillis,
});
export type GuardedCommand = typeof GuardedCommand.Type;
export const IntentOutcome = Schema.Literal('pending', 'confirmed', 'rejected', 'expired');

/** Required server-side integrity capabilities; device storage cannot satisfy this durable port. */
export interface Capabilities {
    readonly transactions: true;
    readonly compareAndSet: true;
    readonly appendOnlyLedger: true;
    readonly device: false;
}
/** Tenant-local operational record with optimistic version, state-machine state and optional expiry lease. */
export interface RecordValue {
    readonly id: string;
    readonly state: string;
    readonly version: number;
    readonly payload: JsonValue;
    readonly leaseUntil: number | null;
}
/** Stable scoped idempotency identity plus canonical input digest used to reject changed-input replays. */
export interface CommitRequest {
    /** Caller/action/version scope is part of the key, not hidden database state. */
    readonly key: string;
    readonly inputHash: string;
    readonly fence?: RunFence;
}
/** JSON-only mutation result and its receipt, persisted atomically for subsequent replay. */
export interface CommitResult {
    readonly output: JsonValue;
    readonly receipt: JsonValue;
}

/** An attempt binding is not bearer authority; callers still need current tenant/action authorization. */
export const RunFence = Schema.Struct({
    tenant: TenantId,
    runId: UuidV7,
    owner: Schema.NonEmptyString,
    epoch: Version.pipe(Schema.positive()),
}).annotations({ parseOptions: { onExcessProperty: 'error' } });
export type RunFence = typeof RunFence.Type;
/** Trusted invocation context, explicitly transported between backend runners, never accepted in public action intent. */
export class CurrentRunFence extends Context.Tag('@eventiva/contracts/CurrentRunFence')<CurrentRunFence, RunFence>() {}
/** Immutable acceptance and mutable monotonic ownership are read together from the authenticated tenant database. */
export interface StoredRun {
    readonly input: JsonValue;
    readonly snapshot: RunSnapshot;
    readonly epoch: number;
    readonly owner: string | null;
}

/** All methods are bound to exactly one authenticated tenant database. No raw query escape hatch. */
export class Storage extends Context.Tag('@eventiva/contracts/Storage')<
    Storage,
    {
        readonly capabilities: Capabilities;
        readonly ready: Effect.Effect<void, StorageFailure>;
        /** Insert once, compare identical retries and never rewrite the accepted input or exact snapshot. */
        readonly acceptRun: (
            tenant: TenantId,
            id: string,
            input: JsonValue,
            snapshot: RunSnapshot
        ) => Effect.Effect<StoredRun, StorageFailure | Conflict>;
        /** Read recorded identity without selecting defaults or conferring current execution authority. */
        readonly getRun: (tenant: TenantId, id: string) => Effect.Effect<StoredRun | undefined, StorageFailure>;
        /** Compare the observed epoch and commit a monotonic owner transfer; only its transaction commit linearizes takeover. */
        readonly claimRun: (
            tenant: TenantId,
            id: string,
            expectedEpoch: number,
            owner: string
        ) => Effect.Effect<RunFence, StorageFailure | Conflict>;
        /** Lock/check ownership before executing and retain that lock through the supplied transaction's commit. */
        readonly fence: <A, E, R>(
            fence: RunFence,
            effect: Effect.Effect<A, E, R>
        ) => Effect.Effect<A, E | StorageFailure | Conflict, R>;
        /** Commit the supplied effect atomically, rolling back its storage writes on failure, defect or interruption. */
        readonly transaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E | StorageFailure, R>;
        /** Serialize by scoped key, reject changed input and persist result plus receipt; replay never reruns execute. */
        readonly commit: <E, R>(
            request: CommitRequest,
            execute: Effect.Effect<CommitResult, E, R>
        ) => Effect.Effect<CommitResult & { readonly replayed: boolean }, E | StorageFailure | Conflict, R>;
        /** Insert a new tenant-local record, rejecting an existing identity rather than overwriting it. */
        readonly create: (record: RecordValue) => Effect.Effect<void, StorageFailure | Conflict>;
        /** Read the routed tenant's record or return absence; no cross-tenant lookup is available. */
        readonly get: (id: string) => Effect.Effect<RecordValue | undefined, StorageFailure>;
        /** Check current version/state, deadline and lease under serialization, then apply an allowed transition and increment version. */
        readonly compareAndSet: (
            command: GuardedCommand,
            next: string,
            payload: JsonValue,
            machine: Readonly<Record<string, ReadonlyArray<string>>>,
            leaseUntil?: number
        ) => Effect.Effect<RecordValue, StorageFailure | Conflict>;
        /** Initialize positive integer stock and its opening ledger entry atomically; this is not an upsert. */
        readonly stock: (id: string, capacity: number) => Effect.Effect<void, StorageFailure>;
        /** Read recorded available stock; callers must explicitly expire old reservations when current expiry reclamation is required. */
        readonly available: (id: string) => Effect.Effect<number, StorageFailure>;
        /** Reclaim expired holds, then atomically reserve positive available quantity until a future expiry and append its ledger delta. */
        readonly reserve: (
            id: string,
            resource: string,
            quantity: number,
            expiresAt: number
        ) => Effect.Effect<void, StorageFailure | Conflict>;
        /** Confirm or release a still-pending unexpired reservation; release restores stock and records the quantity delta. */
        readonly settle: (
            id: string,
            outcome: 'confirmed' | 'released'
        ) => Effect.Effect<void, StorageFailure | Conflict>;
        readonly expire: Effect.Effect<void, StorageFailure>;
        /** Append exact integer payment units once per event; identical replay succeeds and changed payment data conflicts. */
        readonly reconcile: (
            event: string,
            payment: string,
            currency: string,
            minorUnits: string
        ) => Effect.Effect<'applied' | 'replayed', StorageFailure | Conflict>;
        /** Persist a JSON command for later processing, never execute an external effect in the originating transaction. */
        readonly enqueue: (id: string, command: JsonValue) => Effect.Effect<void, StorageFailure>;
        /** Persist a JSON receipt once per identifier; identical replay succeeds but different receipt content fails. */
        readonly audit: (id: string, receipt: JsonValue) => Effect.Effect<void, StorageFailure>;
    }
>() {}

/** Set only by the router after live authentication/authorization, never from an untrusted tenant header. */
export class CurrentTenant extends Context.Tag('@eventiva/contracts/CurrentTenant')<
    CurrentTenant,
    { readonly id: TenantId }
>() {}

/** Control plane owns routing metadata only. Authorization is checked for every scope, including reuse. */
export class TenantRouter extends Context.Tag('@eventiva/contracts/TenantRouter')<
    TenantRouter,
    {
        /** Reauthorize tenant access even on route reuse, providing only that scope's Storage and authenticated CurrentTenant. */
        readonly run: <A, E, R>(
            tenant: TenantId,
            effect: Effect.Effect<A, E, R | Storage | CurrentTenant>
        ) => Effect.Effect<A, E | RoutingDenied, Exclude<R, Storage | CurrentTenant>>;
    }
>() {}
