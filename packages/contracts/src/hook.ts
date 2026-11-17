/**
 * @file packages/contracts/src/hook.ts
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

import { Context, Effect, Layer, Schema } from 'effect';
import { TenantId } from './ids.ts';
import { SecurityProfile } from './security.ts';

const strict = { parseOptions: { onExcessProperty: 'error' as const } };
const Name = Schema.String.pipe(Schema.pattern(/^[a-z][a-z0-9-]*(\.[a-z0-9-]+)*$/), Schema.maxLength(128));
const Version = Schema.Int.pipe(Schema.between(1, Number.MAX_SAFE_INTEGER));
const Time = Schema.Int.pipe(Schema.between(0, Number.MAX_SAFE_INTEGER));

/** Trusted receipt/lease or future lifecycle-envelope identity, never an inferred snapshot field.
 * Current KernelSnapshot has no generation. Producers must verify provenance, not synthesize increments.
 * Nonnegative metadata proves neither readiness nor durable publication.
 */
export const HookModuleIdentity = Schema.Struct({
    module: Name,
    version: Schema.String.pipe(Schema.pattern(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/)),
    generation: Time,
}).annotations(strict);
export const HookPin = Schema.Struct({
    tenant: TenantId,
    // Serving pins require a verified active/ready generation; positivity alone is NOT that verification.
    owner: HookModuleIdentity.pipe(
        Schema.filter(
            /** Exclude non-serving generation zero; provenance and readiness still require independent verification. */ (
                identity
            ) => identity.generation > 0
        )
    ),
    hook: Name,
    revision: Version,
}).annotations(strict);
export type HookPin = typeof HookPin.Type;

/** Observation, never a guard. Absence after unregister is represented by null. */
const ModuleState = Schema.NullOr(
    Schema.Literal('registered', 'validated', 'installed', 'active', 'ready', 'inactive', 'failed', 'retired')
);
export const HookObservation = Schema.Union(
    Schema.Struct({
        kind: Schema.Literal('module.lifecycle'),
        operation: Schema.Literal(
            'register',
            'validate',
            'install',
            'activate',
            'ready',
            'deactivate',
            'unregister',
            'retire',
            'update',
            'recover'
        ),
        identity: HookModuleIdentity,
        from: ModuleState,
        to: ModuleState,
    }).annotations(strict),
    Schema.Struct({
        kind: Schema.Literal('platform.ready'),
        runtimeId: Schema.UUID,
        generation: Version,
    }).annotations(strict),
    Schema.Struct({
        kind: Schema.Literal('execution', 'step'),
        phase: Schema.Literal('start', 'finish', 'fail', 'retry', 'cancel', 'pause', 'resume'),
        identity: HookModuleIdentity,
        execution: Schema.UUID,
        step: Schema.NullOr(Name),
    })
        .annotations(strict)
        .pipe(
            Schema.filter(
                /** Require a step name only for step observations, never for whole-execution observations. */ (
                    value
                ) => (value.kind === 'step') === (value.step !== null)
            )
        ),
    Schema.Struct({
        kind: Schema.Literal('domain.change'),
        identity: HookModuleIdentity,
        change: Schema.Literal('created', 'updated', 'deleted'),
        revision: Version,
    }).annotations(strict)
);
export type HookObservation = typeof HookObservation.Type;

/** Only core-produced, policy-minimized metadata can cross this boundary. No values, errors, keys or secrets.
 * Identifiers are still potentially sensitive: a trusted release policy must approve every delivery.
 * platform.ready is staged ONLY with a durable ReadyReceipt, never inferred from a local Scope.
 */
export const HookEvent = Schema.Struct({
    format: Schema.Literal(1),
    id: Schema.UUID,
    tenant: TenantId,
    commit: Schema.UUID,
    resource: Name,
    resourceId: Schema.UUID,
    purpose: Name,
    profile: SecurityProfile,
    operation: Schema.Literal('ordinary', 'protected', 'financial', 'emergency', 'decrypting'),
    sequence: Version,
    projection: HookObservation,
}).annotations(strict);
export type HookEvent = typeof HookEvent.Type;

/** Observation gets no command authority. Additive capabilities can only request a separately authorized action. */
export const HookCapability = Schema.Union(
    Schema.Struct({ kind: Schema.Literal('observation') }).annotations(strict),
    Schema.Struct({ kind: Schema.Literal('additive'), action: Name, version: Version }).annotations(strict)
);
export const HookDeclaration = Schema.Struct({
    format: Schema.Literal(1),
    pin: HookPin,
    delivery: Schema.Literal('post-commit'),
    target: Schema.Literal('declarative', 'executable'),
    capability: HookCapability,
    observations: Schema.Array(
        Schema.Literal('module.lifecycle', 'platform.ready', 'execution', 'step', 'domain.change')
    ).pipe(Schema.minItems(1), Schema.maxItems(5)),
    profiles: Schema.Array(SecurityProfile).pipe(Schema.minItems(1), Schema.maxItems(4)),
    maxAttempts: Schema.Int.pipe(Schema.between(1, 20)),
    retryDelayMs: Schema.Int.pipe(Schema.between(1, 86_400_000)),
    timeoutMs: Schema.Int.pipe(Schema.between(1, 300_000)),
    concurrency: Schema.Int.pipe(Schema.between(1, 32)),
    capacity: Schema.Int.pipe(Schema.between(1, 10_000)),
})
    .annotations(strict)
    .pipe(
        Schema.filter(
            /** Keep additive action requests declarative; executable callbacks receive observation authority only. */ (
                d
            ) => d.capability.kind === 'observation' || d.target === 'declarative'
        )
    );
export type HookDeclaration = typeof HookDeclaration.Type;

/** Provider-neutral requirements, NOT attestation, broker evidence or authority to decrypt. */
export const hookReleaseRequirements = (event: HookEvent) =>
    ({
        tenantCapability: 'hooks.release',
        resourcePurposePolicy: true,
        projection: 'metadata-only.v1',
        profile: event.profile,
        attestation:
            event.profile === 'restricted'
                ? 'confidential-workload'
                : event.profile === 'sensitive'
                  ? 'workload'
                  : event.profile === 'vault'
                    ? 'client-authorized-release'
                    : 'none',
        brokerEvidence: event.profile !== 'baseline',
        grantsDecryption: false,
    }) as const;

/** Bounded admission or release refusal without rejected declaration data or policy details. */
export class HookDenied extends Schema.TaggedError<HookDenied>()('HookDenied', {
    reason: Schema.Literal('disabled', 'invalid', 'duplicate', 'unavailable', 'policy-denied'),
}) {}
/** Safe durable-journal, transaction or lease failure; no database diagnostics or event payloads escape. */
export class HookOutboxFailure extends Schema.TaggedError<HookOutboxFailure>()('HookOutboxFailure', {
    reason: Schema.Literal(
        'unavailable',
        'capacity',
        'conflict',
        'lease-lost',
        'invalid',
        'transaction-required',
        'transaction-active'
    ),
}) {}
/** Opaque observer failure that cannot retain callback causes or released metadata. */
export class HookObserverFailure extends Schema.TaggedError<HookObserverFailure>()('HookObserverFailure', {}) {}

/** Trusted internal policy, never supplied by a plugin. Recheck live grants and provider evidence on EVERY retry.
 * Bind evidence to tenant, resource + resourceId, purpose, profile, exact pin and projection. Registration grants nothing.
 */
export class HookReleasePolicy extends Context.Tag('@eventiva/contracts/HookReleasePolicy')<
    HookReleasePolicy,
    {
        /** Recheck exact event/pin binding, live grants and required provider evidence on every delivery attempt. */
        readonly authorize: (
            declaration: HookDeclaration,
            event: HookEvent,
            requirements: ReturnType<typeof hookReleaseRequirements>
        ) => Effect.Effect<void, HookDenied>;
    }
>() {}
export const HookReleaseDeny = Layer.succeed(HookReleasePolicy, {
    /** Refuse metadata release when no trusted live release policy is composed. */
    authorize: () => Effect.fail(new HookDenied({ reason: 'policy-denied' })),
});

export const HookClaim = Schema.Struct({
    lease: Schema.UUID,
    idempotencyKey: Schema.UUID,
    pin: HookPin,
    event: HookEvent,
    attempt: Version,
}).annotations(strict);
export type HookClaim = typeof HookClaim.Type;
export const HookSettlement = Schema.Union(
    Schema.Struct({ state: Schema.Literal('delivered') }).annotations(strict),
    Schema.Struct({ state: Schema.Literal('retry'), availableAt: Time }).annotations(strict),
    Schema.Struct({
        state: Schema.Literal('dead-letter'),
        reason: Schema.Literal('denied', 'invalid', 'exhausted'),
    }).annotations(strict)
);
export type HookSettlement = typeof HookSettlement.Type;
export const HookDeliveryState = Schema.Literal('pending', 'running', 'retry', 'delivered', 'dead-letter');

/** Durable adapter REQUIRED; no volatile production implementation is supplied.
 * stage participates in the SAME originating transaction, after mandatory internal checks. Atomic capacity
 * reservation rejects overflow before commit; replaying event+pin deduplicates and changed content conflicts.
 * Pins capture exact module/version/generation/hook revision at commit, never the latest loaded observer.
 * claim atomically leases a due head in each (pin, resource) stream; retry blocks later sequences in that stream
 * but not other observers/streams. Leases are fenced, expire after worker loss and survive process restart.
 * Stable event+pin idempotencyKey survives retries/reclaim. settle is CAS on lease and idempotent on replay.
 * Terminal dead letters unblock the stream, remain inspectable and require explicit authorized redrive.
 * Sink deduplication is required for crash-after-side-effect recovery: this is at-least-once, NOT exactly-once.
 */
export class HookOutbox extends Context.Tag('@eventiva/contracts/HookOutbox')<
    HookOutbox,
    {
        /** Atomically stage minimized event facts and exact observer pins inside the originating transaction, rejecting overflow or changed replay. */
        readonly stage: (
            event: HookEvent,
            observers: ReadonlyArray<HookDeclaration>
        ) => Effect.Effect<void, HookOutboxFailure>;
        /** Lease a due stream head under a fence; adapters must decide eligibility using authoritative time after serialization. */
        readonly claim: (
            declaration: HookDeclaration,
            now: number
        ) => Effect.Effect<HookClaim | undefined, HookOutboxFailure>;
        /** Settle only the matching lease fence; identical settlement replay is safe and terminal outcomes unblock the stream. */
        readonly settle: (claim: HookClaim, settlement: HookSettlement) => Effect.Effect<void, HookOutboxFailure>;
    }
>() {}
export const HookOutboxUnavailable = Layer.succeed(HookOutbox, {
    /** Reject staging rather than substitute a volatile production outbox. */
    stage: () => Effect.fail(new HookOutboxFailure({ reason: 'unavailable' })),
    /** Report unavailable durable storage rather than pretend the delivery queue is empty. */
    claim: () => Effect.fail(new HookOutboxFailure({ reason: 'unavailable' })),
    /** Refuse to acknowledge delivery without persisting its fenced settlement. */
    settle: () => Effect.fail(new HookOutboxFailure({ reason: 'unavailable' })),
});

/** Host-only operator authority. Inspection itself releases metadata and requires fresh authorization.
 * Redrive grants no delivery authority: every attempt still passes the live release policy.
 */
export class HookOperatorPolicy extends Context.Tag('@eventiva/contracts/HookOperatorPolicy')<
    HookOperatorPolicy,
    {
        /** Authorize metadata inspection or redrive of an exact pin using live host-only operator policy. */
        readonly authorize: (pin: HookPin, operation: 'inspect' | 'replay') => Effect.Effect<void, HookDenied>;
    }
>() {}
export const HookOperatorDeny = Layer.succeed(HookOperatorPolicy, {
    /** Deny operator inspection and redrive until independent host authority is supplied. */
    authorize: () => Effect.fail(new HookDenied({ reason: 'policy-denied' })),
});

/** No payload/error projection. Full retained facts remain behind the separate release boundary. */
export const HookDeadLetter = Schema.Struct({
    idempotencyKey: Schema.UUID,
    eventId: Schema.UUID,
    attempt: Version,
    reason: Schema.Literal('denied', 'invalid', 'exhausted'),
}).annotations(strict);
export type HookDeadLetter = typeof HookDeadLetter.Type;

/** Authorized dead-letter inspection and explicit retry-safe redrive, never an observer release grant. */
export class HookRecovery extends Context.Tag('@eventiva/contracts/HookRecovery')<
    HookRecovery,
    {
        /** List bounded dead-letter metadata after an exclusive delivery-key cursor; authorize the exact declaration before reading. */
        readonly deadLetters: (
            declaration: HookDeclaration,
            after: string | null,
            limit: number
        ) => Effect.Effect<ReadonlyArray<HookDeadLetter>, HookOutboxFailure | HookDenied, HookOperatorPolicy>;
        /** Fresh request UUID provides idempotent operator retry. Same delivery key/pin survives redrive.
         * Returns false for an already accepted request; only terminal dead letters may be redriven.
         */
        readonly replay: (
            declaration: HookDeclaration,
            idempotencyKey: string,
            requestId: string
        ) => Effect.Effect<boolean, HookOutboxFailure | HookDenied, HookOperatorPolicy>;
    }
>() {}

/** Trusted host capability, NOT a client/plugin subscription or authorization grant.
 * Reads committed minimized facts for the captured authenticated tenant, independent of observers.
 * A transport must apply live resource/purpose/profile policy before releasing even event existence.
 * Cursors are tenant-local commit order, not source sequence, time or delivery acknowledgement.
 */
export class HookChangeFeed extends Context.Tag('@eventiva/contracts/HookChangeFeed')<
    HookChangeFeed,
    {
        /** Page committed tenant facts after an exclusive commit-order cursor; an empty page retains the supplied cursor. */
        readonly read: (
            after: number,
            limit: number
        ) => Effect.Effect<
            {
                readonly cursor: number;
                readonly events: ReadonlyArray<{ readonly cursor: number; readonly event: HookEvent }>;
            },
            HookOutboxFailure
        >;
    }
>() {}

export const hookFlag = {
    key: 'hooks.foundation-enabled',
    owner: 'runtime',
    safeDefault: false,
    description: 'Enable authorized post-commit metadata observations and additive dispatch.',
};

/** Trusted producer intent, not evidence that the callback or transition committed. */
export const HookProducerTarget = Schema.Union(
    Schema.Struct({
        kind: Schema.Literal('module.lifecycle'),
        module: Name,
        operation: Schema.Literal(
            'register',
            'validate',
            'install',
            'activate',
            'ready',
            'deactivate',
            'unregister',
            'retire',
            'update',
            'recover'
        ),
    }).annotations(strict),
    Schema.Struct({ kind: Schema.Literal('platform.ready'), generation: Version }).annotations(strict)
);
export type HookProducerTarget = typeof HookProducerTarget.Type;
export const HookProducerBinding = Schema.Struct({
    purpose: Name,
    profile: SecurityProfile,
    operation: HookEvent.fields.operation,
    // Reuse the exact lifecycle/ready schemas without admitting execution or domain facts in the type.
    projection: Schema.Union(HookObservation.members[0], HookObservation.members[1]),
}).annotations(strict);
export type HookProducerBinding = typeof HookProducerBinding.Type;
export const HookProducerAttempt = Schema.Struct({
    id: Schema.UUID,
    tenant: TenantId,
    runtime: Name,
    incarnation: Schema.UUID,
    target: HookProducerTarget,
    binding: HookProducerBinding,
}).annotations(strict);
export type HookProducerAttempt = typeof HookProducerAttempt.Type;
export const HookProducerStatus = Schema.Literal('unresolved', 'committed', 'abandoned');
export type HookProducerStatus = typeof HookProducerStatus.Type;

/** Core-owned provenance/status authority. No plugin or caller-supplied classification fallback.
 * Reconciliation queries authoritative idempotency/status evidence; it MUST NOT invoke the callback.
 * A failed callback is not by itself evidence of no side effect. Default is denial, never replay.
 */
export class HookProducerPolicy extends Context.Tag('@eventiva/contracts/HookProducerPolicy')<
    HookProducerPolicy,
    {
        /** Bind captured tenant/runtime identity to a transition derived from authoritative core state. */
        readonly bind: (
            tenant: TenantId,
            runtime: string,
            incarnation: string,
            target: HookProducerTarget
        ) => Effect.Effect<HookProducerBinding, HookDenied>;
        /** Recheck current access to an immutable retained attempt before releasing metadata or settling it. */
        readonly authorize: (
            attempt: HookProducerAttempt,
            operation: 'inspect' | 'confirm' | 'reconcile'
        ) => Effect.Effect<void, HookDenied>;
        /** Query status by retained idempotency key without invoking the original callback. */
        readonly reconcile: (attempt: HookProducerAttempt) => Effect.Effect<HookProducerStatus, HookDenied>;
    }
>() {}
export const HookProducerDeny = Layer.succeed(HookProducerPolicy, {
    /** Missing core provenance authority never admits a callback intent. */
    bind: () => Effect.fail(new HookDenied({ reason: 'policy-denied' })),
    /** Retained attempts remain private until a live core authority is supplied. */
    authorize: () => Effect.fail(new HookDenied({ reason: 'policy-denied' })),
    /** Missing status evidence never turns ambiguity into a replay or committed fact. */
    reconcile: () => Effect.fail(new HookDenied({ reason: 'policy-denied' })),
});

/** Durable producer prerequisite. A fresh layer build persists a fresh incarnation, never resumes one.
 * begin commits unresolved intent BEFORE the callback. Only fresh:true permits its first invocation;
 * a duplicate request must be inspected/reconciled, never blindly re-executed, even after restart.
 * confirm is for the trusted mutation owner after commit, NOT a successful public method wrapper.
 * It atomically confirms the attempt and stages the policy-bound fact in the existing outbox/feed.
 * These APIs do not reconstruct kernel state, invoke callbacks or grant observer release authority.
 */
export class HookProducer extends Context.Tag('@eventiva/contracts/HookProducer')<
    HookProducer,
    {
        readonly runtime: { readonly logical: string; readonly incarnation: string };
        /** Persist unresolved intent; only fresh:true authorizes its first callback invocation. */
        readonly begin: (
            request: string,
            target: HookProducerTarget
        ) => Effect.Effect<
            { readonly fresh: boolean; readonly attempt: HookProducerAttempt; readonly status: HookProducerStatus },
            HookDenied | HookOutboxFailure,
            HookProducerPolicy
        >;
        /** Return retained status after live authorization, without inferring a callback outcome. */
        readonly inspect: (
            request: string
        ) => Effect.Effect<
            { readonly attempt: HookProducerAttempt; readonly status: HookProducerStatus },
            HookDenied | HookOutboxFailure,
            HookProducerPolicy
        >;
        /** Atomically publish the mutation owner's confirmed transition from this incarnation only. */
        readonly confirm: (
            request: string
        ) => Effect.Effect<HookProducerStatus, HookDenied | HookOutboxFailure, HookProducerPolicy>;
        /** Settle authoritative status evidence without replay, including after incarnation loss. */
        readonly reconcile: (
            request: string
        ) => Effect.Effect<HookProducerStatus, HookDenied | HookOutboxFailure, HookProducerPolicy>;
    }
>() {}
