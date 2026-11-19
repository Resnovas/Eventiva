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
import type { Authorizer, Caller, CallerIdentity } from '@eventiva/contracts/caller';
import type { ActionFailed, Forbidden, InvalidInput, PlatformError } from '@eventiva/contracts/errors';
import type { Receipt } from '@eventiva/contracts/receipt';
import type { JsonValue, RunFence } from '@eventiva/contracts/storage';
import { type Cause, Context, Data, Effect, Either, type Exit, Layer } from 'effect';

export type { Receipt } from '@eventiva/contracts/receipt';

/** Bind a safe platform denial reason to the requested action without retaining input or credentials. */
interface InvocationDeniedFields {
    readonly action: string;
    readonly reason: string;
}
/** Construct an exact yieldable denial without exporting the vendor's open error constructor generic. */
const InvocationDeniedBase: new (args: InvocationDeniedFields) => Cause.YieldableError &
    InvocationDeniedFields & {
        readonly _tag: 'InvocationDenied';
    } = Data.TaggedError('InvocationDenied');
/** A platform gate failed. Reasons are safe identifiers, never input or credentials. */
export class InvocationDenied extends InvocationDeniedBase {}

/** Identify which action could not satisfy mandatory audit durability without exposing persistence diagnostics. */
interface AuditUnavailableFields {
    readonly action: string;
}
/** Construct the bounded audit-unavailability error while keeping arbitrary vendor fields private. */
const AuditUnavailableBase: new (args: AuditUnavailableFields) => Cause.YieldableError &
    AuditUnavailableFields & {
        readonly _tag: 'AuditUnavailable';
    } = Data.TaggedError('AuditUnavailable');
/** Fail the outer invocation when required receipt persistence is unavailable, never report an unaudited success. */
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

/** A decoded invocation captured without erasing the handler's schema types. */
export interface PreparedAction<R = never> {
    readonly canonicalInput: Effect.Effect<string, InvalidInput>;
    /** Authorize the captured decoded target using the host's freshly resolved caller and trusted authorizer. */
    readonly authorize: (
        authorizer: typeof Authorizer.Service,
        caller: CallerIdentity
    ) => Effect.Effect<void, Forbidden>;
    /** Derive live execution requirements from the decoded target and untrusted intent, not from transport claims. */
    readonly inspect: (
        policy: typeof ExecutionPolicy.Service,
        caller: CallerIdentity,
        intent: InvokeOptions
    ) => Effect.Effect<ExecutionRequirements, InvocationDenied>;
    readonly run: Effect.Effect<JsonValue, ActionFailed, R>;
}

/** Heterogeneous registry capability, not an erased input/output handler. */
export interface ActionBinding<R = never> {
    readonly spec: ActionSpec;
    /** Decode wire input and capture typed operations without executing the handler or granting invocation authority. */
    readonly prepare: <Wire>(input: Wire) => Effect.Effect<PreparedAction<R>, InvalidInput>;
}

/** Preserve the executed Exit and its persisted invocation receipt, distinguishing durable mutation replay from a new execution. */
export interface InvocationResult<E = PlatformError | InvocationDenied | AuditUnavailable, A = JsonValue> {
    readonly result: Exit.Exit<A, E>;
    readonly receipt: Receipt;
    readonly replayed: boolean;
    readonly audit: 'durable' | 'spooled';
}

/** Refresh identity, session and delegation from trusted state for every invocation/discovery. */
export class IdentityResolver extends Context.Tag('@eventiva/runtime/IdentityResolver')<
    IdentityResolver,
    {
        /** Resolve trusted current authority from presented identity, rejecting stale or unavailable identity state. */ readonly resolve: (
            caller: CallerIdentity
        ) => Effect.Effect<CallerIdentity, InvocationDenied>;
    }
>() {}

/** A cryptographic digest, supplied by the platform boundary (SHA-256 or stronger). */
export class InputDigest extends Context.Tag('@eventiva/runtime/InputDigest')<
    InputDigest,
    {
        /** Hash canonical input bytes deterministically with the host's cryptographic digest, never a transport-provided hash. */ readonly digest: (
            canonical: string
        ) => Effect.Effect<string>;
    }
>() {}

/** Trusted human approval pinned to principal, tenant, action/version, input hash, limits and a finite validity window. */
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

/** Live registered target supplied by the executor, never an action/hash/key selected by a proof adapter. */
export interface ApprovalTarget {
    readonly action: ActionBinding;
    readonly input: JsonValue;
    readonly writeKey: string;
}

/** Never accepts transport proof: resolve an opaque id against each live target and commit use with its successful effects. */
export class Approvals extends Context.Tag('@eventiva/runtime/Approvals')<
    Approvals,
    {
        /** Look up exact live proof without consuming it; the executor independently checks the returned binding and bounds. */
        readonly get: (id: string, target: ApprovalTarget) => Effect.Effect<Approval, InvocationDenied, Caller>;
        /** Mark successful use within the accepting transaction, rechecking authority; replay never calls this operation. */
        readonly use: (id: string, target: ApprovalTarget) => Effect.Effect<void, InvocationDenied, Caller>;
        /** Pair approved-read effects, use and mandatory successful audit; mutation use joins Integrity's existing transaction. */
        readonly transaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E | InvocationDenied, R>;
    }
>() {}

/** Trusted policy observations that can raise approval floors and constrain current state, capacity and dependencies. */
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
        /** Inspect decoded action input and current trusted state; caller intent cannot supply its own readiness or approval evidence. */
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
        /** Require durable audit availability before a protected invocation starts; a later record/commit can still fail closed. */
        readonly ready: (action: string) => Effect.Effect<void, AuditUnavailable>;
        /** Persist this invocation receipt, permitting only an explicitly allowed durable bounded spool fallback. */
        readonly record: (
            receipt: Receipt,
            allowSpool: boolean
        ) => Effect.Effect<'durable' | 'spooled', AuditUnavailable>;
    }
>() {}

/** Host-derived deduplication identity and exact input binding for one tenant/principal/action-version mutation. */
export interface IntegrityRequest {
    readonly key: string;
    readonly inputHash: string;
    readonly caller: CallerIdentity;
    readonly action: string;
    readonly version: number;
    readonly fence?: RunFence;
}

/** Successful atomic mutation result and its original durable receipt, with an explicit replay marker. */
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
        /** Serialize the request key, reject changed input and commit callback output/receipt atomically with its domain writes. */
        readonly commit: <E, Value>(
            request: IntegrityRequest,
            execute: Effect.Effect<{ readonly output: Value; readonly receipt: Receipt }, E>
        ) => Effect.Effect<Committed, E | InvocationDenied | AuditUnavailable>;
    }
>() {}

/** JSON canonicalization rejects non-JSON values rather than hashing ambiguous coercions. */
export const canonicalJson = <Value>(value: Value): Either.Either<string, string> => {
    // Track only the active traversal path: shared acyclic children are valid, while an ancestor reference is a cycle.
    const ancestors = new Set<object>();
    /** Encode finite JSON primitives, ordered array slots or sorted plain-object data properties; reject ancestor cycles and accessors. */
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
            ? Array.from(
                  { length: item.length },
                  /** Name array slots in numeric order so traversal validates holes instead of skipping them. */ (
                      _,
                      index
                  ) => String(index)
              )
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
        /** Deny identity resolution rather than trust presented authority without a production resolver. */
        resolve: () => Effect.fail(new InvocationDenied({ action: '<identity>', reason: 'identity-unavailable' })),
    }),
    Layer.succeed(Approvals, {
        /** Refuse opaque approval ids until a trusted evidence store is composed. */
        get: () => Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'approval-unavailable' })),
        /** Missing durable lifecycle support cannot acknowledge successful proof consumption. */
        use: () => Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'approval-unavailable' })),
        /** Never enter an approved read without an authoritative transaction owner. */
        transaction: () => Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'approval-unavailable' })),
    }),
    Layer.succeed(ExecutionPolicy, {
        /** Reject execution when no live resource/readiness policy is available. */
        inspect: (_caller, spec) =>
            Effect.fail(new InvocationDenied({ action: spec.name, reason: 'policy-unavailable' })),
    }),
    Layer.succeed(Audit, {
        /** Prevent protected execution without a durable audit readiness implementation. */
        ready: (action) => Effect.fail(new AuditUnavailable({ action })),
        /** Refuse receipt acknowledgment rather than substitute a volatile or best-effort audit sink. */
        record: (receipt) => Effect.fail(new AuditUnavailable({ action: receipt.action })),
    }),
    Layer.succeed(Integrity, {
        /** Never execute the mutation callback when no atomic deduplication/storage owner is composed. */
        commit: (request) =>
            Effect.fail(new InvocationDenied({ action: request.action, reason: 'integrity-unavailable' })),
    })
);
