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
    owner: HookModuleIdentity.pipe(Schema.filter((identity) => identity.generation > 0)),
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
        .pipe(Schema.filter((value) => (value.kind === 'step') === (value.step !== null))),
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
    .pipe(Schema.filter((d) => d.capability.kind === 'observation' || d.target === 'declarative'));
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

export class HookDenied extends Schema.TaggedError<HookDenied>()('HookDenied', {
    reason: Schema.Literal('disabled', 'invalid', 'duplicate', 'unavailable', 'policy-denied'),
}) {}
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
export class HookObserverFailure extends Schema.TaggedError<HookObserverFailure>()('HookObserverFailure', {}) {}

/** Trusted internal policy, never supplied by a plugin. Recheck live grants and provider evidence on EVERY retry.
 * Bind evidence to tenant, resource + resourceId, purpose, profile, exact pin and projection. Registration grants nothing.
 */
export class HookReleasePolicy extends Context.Tag('@eventiva/contracts/HookReleasePolicy')<
    HookReleasePolicy,
    {
        readonly authorize: (
            declaration: HookDeclaration,
            event: HookEvent,
            requirements: ReturnType<typeof hookReleaseRequirements>
        ) => Effect.Effect<void, HookDenied>;
    }
>() {}
export const HookReleaseDeny = Layer.succeed(HookReleasePolicy, {
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
        readonly stage: (
            event: HookEvent,
            observers: ReadonlyArray<HookDeclaration>
        ) => Effect.Effect<void, HookOutboxFailure>;
        readonly claim: (
            declaration: HookDeclaration,
            now: number
        ) => Effect.Effect<HookClaim | undefined, HookOutboxFailure>;
        readonly settle: (claim: HookClaim, settlement: HookSettlement) => Effect.Effect<void, HookOutboxFailure>;
    }
>() {}
export const HookOutboxUnavailable = Layer.succeed(HookOutbox, {
    stage: () => Effect.fail(new HookOutboxFailure({ reason: 'unavailable' })),
    claim: () => Effect.fail(new HookOutboxFailure({ reason: 'unavailable' })),
    settle: () => Effect.fail(new HookOutboxFailure({ reason: 'unavailable' })),
});

export const hookFlag = {
    key: 'hooks.foundation-enabled',
    owner: 'runtime',
    safeDefault: false,
    description: 'Enable authorized post-commit metadata observations and additive dispatch.',
};
