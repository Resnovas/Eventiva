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

import { Context, Data, type Effect, Schema } from 'effect';
import type { TenantId } from './ids.ts';

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
export const JsonValue: Schema.Schema<JsonValue> = Schema.suspend(() =>
    Schema.Union(
        Schema.Null,
        Schema.Boolean,
        Schema.JsonNumber,
        Schema.String,
        Schema.Array(JsonValue),
        Schema.Record({ key: Schema.String, value: JsonValue })
    )
);
export const Json = Schema.parseJson(JsonValue);

export class StorageFailure extends Data.TaggedError('StorageFailure')<{
    readonly operation: string;
    readonly cause?: unknown;
}> {}
export class Conflict extends Data.TaggedError('StorageConflict')<{
    readonly id: string;
    readonly reason: 'stale' | 'illegal-transition' | 'expired' | 'unavailable' | 'duplicate' | 'input-changed';
}> {}
export class RoutingDenied extends Data.TaggedError('RoutingDenied')<{ readonly reason: string }> {}

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

export interface Capabilities {
    readonly transactions: true;
    readonly compareAndSet: true;
    readonly appendOnlyLedger: true;
    readonly device: false;
}
export interface RecordValue {
    readonly id: string;
    readonly state: string;
    readonly version: number;
    readonly payload: JsonValue;
    readonly leaseUntil: number | null;
}
export interface CommitRequest {
    /** Caller/action/version scope is part of the key, not hidden database state. */
    readonly key: string;
    readonly inputHash: string;
}
export interface CommitResult {
    readonly output: JsonValue;
    readonly receipt: JsonValue;
}

/** All methods are bound to exactly one authenticated tenant database. No raw query escape hatch. */
export class Storage extends Context.Tag('@eventiva/contracts/Storage')<
    Storage,
    {
        readonly capabilities: Capabilities;
        readonly ready: Effect.Effect<void, StorageFailure>;
        readonly transaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E | StorageFailure, R>;
        readonly commit: <E, R>(
            request: CommitRequest,
            execute: Effect.Effect<CommitResult, E, R>
        ) => Effect.Effect<CommitResult & { readonly replayed: boolean }, E | StorageFailure | Conflict, R>;
        readonly create: (record: RecordValue) => Effect.Effect<void, StorageFailure | Conflict>;
        readonly get: (id: string) => Effect.Effect<RecordValue | undefined, StorageFailure>;
        readonly compareAndSet: (
            command: GuardedCommand,
            next: string,
            payload: JsonValue,
            machine: Readonly<Record<string, ReadonlyArray<string>>>,
            leaseUntil?: number
        ) => Effect.Effect<RecordValue, StorageFailure | Conflict>;
        readonly stock: (id: string, capacity: number) => Effect.Effect<void, StorageFailure>;
        readonly available: (id: string) => Effect.Effect<number, StorageFailure>;
        readonly reserve: (
            id: string,
            resource: string,
            quantity: number,
            expiresAt: number
        ) => Effect.Effect<void, StorageFailure | Conflict>;
        readonly settle: (
            id: string,
            outcome: 'confirmed' | 'released'
        ) => Effect.Effect<void, StorageFailure | Conflict>;
        readonly expire: Effect.Effect<void, StorageFailure>;
        readonly reconcile: (
            event: string,
            payment: string,
            currency: string,
            minorUnits: string
        ) => Effect.Effect<'applied' | 'replayed', StorageFailure | Conflict>;
        readonly enqueue: (id: string, command: JsonValue) => Effect.Effect<void, StorageFailure>;
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
        readonly run: <A, E, R>(
            tenant: TenantId,
            effect: Effect.Effect<A, E, R | Storage | CurrentTenant>
        ) => Effect.Effect<A, E | RoutingDenied, Exclude<R, Storage | CurrentTenant>>;
    }
>() {}
