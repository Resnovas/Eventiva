/**
 * @file packages/runtime/src/invocation.ts
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

import type { ActionSpec, ApprovalPolicy, Input } from '@eventiva/contracts/action';
import type { CallerIdentity } from '@eventiva/contracts/caller';
import type { PlatformError } from '@eventiva/contracts/errors';
import type { Receipt } from '@eventiva/contracts/receipt';
import type { JsonValue } from '@eventiva/contracts/storage';
import { type Cause, Context, Data, Effect, Either, type Exit, Layer } from 'effect';

export type { Receipt } from '@eventiva/contracts/receipt';

interface InvocationDeniedFields {
    readonly action: string;
    readonly reason: string;
}
const InvocationDeniedBase: new (args: InvocationDeniedFields) => Cause.YieldableError &
    InvocationDeniedFields & {
        readonly _tag: 'InvocationDenied';
    } = Data.TaggedError('InvocationDenied');
/** A platform gate failed. Reasons are safe identifiers, never input or credentials. */
export class InvocationDenied extends InvocationDeniedBase {}

interface AuditUnavailableFields {
    readonly action: string;
}
const AuditUnavailableBase: new (args: AuditUnavailableFields) => Cause.YieldableError &
    AuditUnavailableFields & {
        readonly _tag: 'AuditUnavailable';
    } = Data.TaggedError('AuditUnavailable');
export class AuditUnavailable extends AuditUnavailableBase {}

/** Caller-supplied execution intent, not proof of authorization or approval. */
export interface InvokeOptions {
    readonly idempotencyKey?: string | undefined;
    readonly approvalId?: string | undefined;
    readonly mode?: 'online' | 'offline-intent' | 'scheduled' | undefined;
    readonly notBefore?: number | undefined;
    readonly deadline?: number | undefined;
    /** Exact registered action version, not a resource-state version. Checked before preparation. */
    readonly expectedActionVersion?: number | undefined;
    readonly expectedVersion?: string | undefined;
    readonly expectedState?: string | undefined;
}

export interface InvocationResult<E = PlatformError | InvocationDenied | AuditUnavailable, A = JsonValue> {
    readonly result: Exit.Exit<A, E>;
    readonly receipt: Receipt;
    readonly replayed: boolean;
    readonly audit: 'durable' | 'spooled';
}

/** Refresh identity, session and delegation from trusted state for every invocation/discovery. */
export class IdentityResolver extends Context.Tag('@eventiva/runtime/IdentityResolver')<
    IdentityResolver,
    { readonly resolve: (caller: CallerIdentity) => Effect.Effect<CallerIdentity, InvocationDenied> }
>() {}

/** A cryptographic digest, supplied by the platform boundary (SHA-256 or stronger). */
export class InputDigest extends Context.Tag('@eventiva/runtime/InputDigest')<
    InputDigest,
    { readonly digest: (canonical: string) => Effect.Effect<string> }
>() {}

export interface Approval {
    readonly principal: string;
    readonly tenant: string | undefined;
    readonly action: string;
    readonly version: number;
    readonly inputHash: string;
    /** Exact batch items and aggregate limits are covered by inputHash as well as these live bounds. */
    readonly limits: Readonly<Record<string, number>>;
    readonly approver: CallerIdentity;
    readonly issuedAt: number;
    readonly expiresAt: number;
    readonly stepUp: boolean;
}

/** Never accepts an approval object from a transport: the transport supplies only an opaque id. */
export class Approvals extends Context.Tag('@eventiva/runtime/Approvals')<
    Approvals,
    { readonly get: (id: string) => Effect.Effect<Approval, InvocationDenied> }
>() {}

export interface ExecutionRequirements {
    /** Tenant policy can only raise the specification and risk floor. */
    readonly approval: ApprovalPolicy;
    readonly routinePreauthorized: boolean;
    readonly stepUp: boolean;
    /** Derived from decoded input by trusted policy, never copied from transport claims. */
    readonly bounds: Readonly<Record<string, number>>;
    readonly currentVersion?: string;
    readonly currentState?: string;
    readonly dependenciesReady: boolean;
    readonly capacityAvailable: boolean;
}

/** Checks live resource state, dependencies and capacity, including on scheduled calls and replays. */
export class ExecutionPolicy extends Context.Tag('@eventiva/runtime/ExecutionPolicy')<
    ExecutionPolicy,
    {
        readonly inspect: <S extends ActionSpec>(
            caller: CallerIdentity,
            spec: S,
            input: Input<NoInfer<S>>,
            intent: InvokeOptions
        ) => Effect.Effect<ExecutionRequirements, InvocationDenied>;
    }
>() {}

/**
 * Durable audit boundary. Protected calls use ready before running. record must
 * persist before returning, or, ONLY when allowSpool is true, append to a durable
 * capacity-bounded local spool. Receipt ids are deduplicated when draining it.
 * No in-memory or best-effort implementation satisfies this interface.
 */
export class Audit extends Context.Tag('@eventiva/runtime/Audit')<
    Audit,
    {
        readonly ready: (action: string) => Effect.Effect<void, AuditUnavailable>;
        readonly record: (
            receipt: Receipt,
            allowSpool: boolean
        ) => Effect.Effect<'durable' | 'spooled', AuditUnavailable>;
    }
>() {}

export interface IntegrityRequest {
    readonly key: string;
    readonly inputHash: string;
    readonly caller: CallerIdentity;
    readonly action: string;
    readonly version: number;
}

export interface Committed {
    readonly output: JsonValue;
    readonly receipt: Receipt;
    readonly replayed: boolean;
}

/**
 * A1 transaction boundary. The adapter must serialize identical keys, reject
 * changed hashes, and atomically commit domain state, dedup result, transition/
 * append-only history, outbox and successful receipt. The handler's storage
 * services must participate in this SAME transaction. On failure/defect/
 * interruption roll everything back. External handlers stage an outbox command;
 * they must not send an irreversible external effect inside the transaction.
 * Replay lookup happens only after the host rechecks every live gate.
 * There is deliberately no production in-memory fallback or universal TTL.
 */
export class Integrity extends Context.Tag('@eventiva/runtime/Integrity')<
    Integrity,
    {
        readonly commit: <E, Value>(
            request: IntegrityRequest,
            execute: Effect.Effect<{ readonly output: Value; readonly receipt: Receipt }, E>
        ) => Effect.Effect<Committed, E | InvocationDenied | AuditUnavailable>;
    }
>() {}

/** JSON canonicalization rejects non-JSON values rather than hashing ambiguous coercions. */
export const canonicalJson = <Value>(value: Value): Either.Either<string, string> => {
    const ancestors = new Set<object>();
    const visit = <Item>(item: Item): Either.Either<string, string> => {
        if (item === null) return Either.right('null');
        if (typeof item === 'string' || typeof item === 'boolean') return Either.right(JSON.stringify(item));
        if (typeof item === 'number')
            return Number.isFinite(item) ? Either.right(JSON.stringify(item)) : Either.left('non-json-input');
        if (typeof item !== 'object' || ancestors.has(item)) return Either.left('non-json-input');
        if (!Array.isArray(item) && Object.getPrototypeOf(item) !== Object.prototype)
            return Either.left('non-json-input');
        ancestors.add(item);
        const parts: Array<string> = [];
        const keys = Array.isArray(item)
            ? Array.from({ length: item.length }, (_, index) => String(index))
            : Object.keys(item).sort();
        for (const key of keys) {
            const descriptor = Object.getOwnPropertyDescriptor(item, key);
            if (descriptor === undefined || !('value' in descriptor)) return Either.left('non-json-input');
            // Owner-approved private ingress: recursively validate lib.es5's descriptor value immediately.
            // Do not read item[key]: that would execute getters or Proxy get traps.
            const child: unknown = descriptor.value;
            const encoded = visit(child);
            if (Either.isLeft(encoded)) return encoded;
            parts.push(Array.isArray(item) ? encoded.right : `${JSON.stringify(key)}:${encoded.right}`);
        }
        ancestors.delete(item);
        return Either.right(Array.isArray(item) ? `[${parts.join(',')}]` : `{${parts.join(',')}}`);
    };
    return visit(value);
};

/** Safe server defaults until trusted identity/policy and durable adapters are wired. */
export const FailClosed = Layer.mergeAll(
    Layer.succeed(IdentityResolver, {
        resolve: () => Effect.fail(new InvocationDenied({ action: '<identity>', reason: 'identity-unavailable' })),
    }),
    Layer.succeed(Approvals, {
        get: () => Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'approval-unavailable' })),
    }),
    Layer.succeed(ExecutionPolicy, {
        inspect: (_caller, spec) =>
            Effect.fail(new InvocationDenied({ action: spec.name, reason: 'policy-unavailable' })),
    }),
    Layer.succeed(Audit, {
        ready: (action) => Effect.fail(new AuditUnavailable({ action })),
        record: (receipt) => Effect.fail(new AuditUnavailable({ action: receipt.action })),
    }),
    Layer.succeed(Integrity, {
        commit: (request) =>
            Effect.fail(new InvocationDenied({ action: request.action, reason: 'integrity-unavailable' })),
    })
);
