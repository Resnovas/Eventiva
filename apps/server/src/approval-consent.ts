/**
 * @file apps/server/src/approval-consent.ts
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

import { ActionName, define } from '@eventiva/contracts/action';
import { ApprovalEvents, ApprovalFailure, ApprovalPreparation, ApprovalStore } from '@eventiva/contracts/approval';
import { Authorizer, Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import type { Flag } from '@eventiva/contracts/flags';
import { IdentityStore } from '@eventiva/contracts/identity';
import { EpochMillis, JsonValue, UuidV7 } from '@eventiva/contracts/storage';
import { openOidcSession } from '@eventiva/integrations.oidc/session';
import type { OidcAccessClaims } from '@eventiva/integrations.oidc/token';
import { implement } from '@eventiva/runtime/action';
import { cancelApproval } from '@eventiva/runtime/approval';
import type { ActionHost } from '@eventiva/runtime/host';
import { ExecutionPolicy, IdentityResolver, InputDigest } from '@eventiva/runtime/invocation';
import { Context, Effect, Layer, Option, Schema } from 'effect';
import { IdentitySessionPolicy } from './identity-session-policy.ts';

/** Local default-off capability gate; enabling it does not supply trusted authentication policy or event authority. */
export const approvalConsentFlag = {
    key: 'identity.approval-consent-enabled',
    description: 'Allow explicit registered human approval preparation, completion and cancellation.',
    owner: 'platform',
    safeDefault: false,
} satisfies Flag;
const intent = Schema.Struct({
    action: ActionName,
    input: JsonValue,
    principal: CallerIdentity,
    writeKey: Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(512)),
    version: Schema.Number.pipe(Schema.int(), Schema.positive()),
});
const review = Schema.Struct({ review: ApprovalPreparation, expiresAt: EpochMillis });
const metadata = {
    version: 1,
    permission: 'approvals.consent',
    offline: 'online-only' as const,
    sensitive: true,
    flag: approvalConsentFlag.key,
    error: ApprovalFailure,
};

/** Preparation is not a grant and cannot execute the requested target. */
export const prepareConsent = define('approvals.prepare', {
    ...metadata,
    description: 'Review the current registered action and exact target key for explicit human consent.',
    input: intent,
    output: review,
    sideEffect: 'read',
});
/** The explicit authenticated human confirmation operation; its transport key deduplicates issuance, not target execution. */
export const completeConsent = define('approvals.complete', {
    ...metadata,
    description: 'Confirm an unchanged reviewed action using current live human and target authority.',
    input: Schema.Struct({ ...intent.fields, ...review.fields }),
    output: Schema.Struct({ id: UuidV7, expiresAt: EpochMillis }),
    sideEffect: 'write',
});
/** Own-pending cancellation needs no administrative grant; cancelling another human's proof is separately authorized. */
export const cancelConsent = define('approvals.cancel', {
    ...metadata,
    description: 'Cancel pending consent with live own, tenant or independently granted event authority.',
    input: Schema.Struct({ id: UuidV7 }),
    output: Schema.Struct({ id: UuidV7, revokedAt: EpochMillis }),
    sideEffect: 'write',
});

/** Identify only this registered module's intrinsic human operations, never target actions with similar prefixes. */
const intrinsic = (action: string) =>
    action === prepareConsent.name || action === completeConsent.name || action === cancelConsent.name;

/**
 * Route this module's intrinsic human admission to its handler-owned target/ownership checks. It grants no target
 * permission and delegates every other action unchanged; agents and unscoped humans cannot invoke these operations.
 */
export const approvalConsentAuthorizer = (base: Authorizer['Type']): Authorizer['Type'] => {
    /** A live identity is resolved by the host before either phase and again inside the accepting handler. */
    const human = (caller: CallerIdentity, action: string) =>
        caller.kind === 'human' && caller.onBehalfOf === undefined && caller.tenant !== undefined
            ? Effect.void
            : Effect.fail(new Forbidden({ action, reason: 'human-consent-required' }));
    return {
        /** Consent cannot mint permissions; the target's original authorizer is called by preparation/completion. */
        canInvoke: (caller, action) =>
            intrinsic(action.name) ? human(caller, action.name) : base.canInvoke(caller, action),
        /** Cancellation checks the actual persisted proof in its transaction, not caller-supplied event/owner fields. */
        check: (caller, action, input) =>
            intrinsic(action.name) ? human(caller, action.name) : base.check(caller, action, input),
    };
};

/** Read actual same-route SQL session state; calculated policy deadlines and presented identity are not session evidence. */
const liveSession = Effect.gen(
    /** Refresh revocation and resolve the stored human's session before calculating any review deadline. */
    function* () {
        // A policy calculation alone cannot establish that this human still owns an active SQL session.
        const human = yield* (yield* IdentityResolver).resolve(yield* Caller);
        const identities = yield* IdentityStore;
        const session = (yield* identities.get('session', human.session))?.value;
        if (
            human.kind !== 'human' ||
            human.onBehalfOf !== undefined ||
            human.tenant !== identities.tenant ||
            session === undefined ||
            !session.active ||
            session.subject !== human.subject ||
            session.delegation !== null
        )
            return yield* new ApprovalFailure({ reason: 'denied' });
        return { tenant: identities.tenant, expiresAt: session.expiresAt };
    }
);

/**
 * Trusted login composition only: claims must come from fresh OidcVerifier.verify, inside the resolved tenant's
 * Storage transaction with its mandatory audit. This wrapper selects no policy source and activates no login route.
 */
export const openOidcSessionWithPolicy = (claims: OidcAccessClaims) =>
    Effect.gen(
        /** The same required policy used for consent supplies issuance; caller/token expiry is not the configured maximum. */
        function* () {
            const policy = yield* IdentitySessionPolicy;
            return yield* openOidcSession(claims, yield* policy.sessionExpiresAt);
        }
    );

/** Register inside the routed SQL host; capture only stable service capabilities and leave invocation Caller dynamic. */
export const registerApprovalConsent = (host: ActionHost['Type']) =>
    Effect.gen(
        /** Build one intrinsic module whose mutation receipts, decision writes and business dedup share Integrity's tenant client. */
        function* () {
            // Select capabilities explicitly; copying the entire route could retain a bootstrap transaction or foreign service.
            const routed = (yield* Effect.context<
                | ApprovalStore
                | IdentityStore
                | IdentityResolver
                | Authorizer
                | ExecutionPolicy
                | InputDigest
                | IdentitySessionPolicy
                | Caller
            >()).pipe(
                Context.pick(
                    ApprovalStore,
                    IdentityStore,
                    IdentityResolver,
                    Authorizer,
                    ExecutionPolicy,
                    InputDigest,
                    IdentitySessionPolicy,
                    Caller
                )
            );
            // The host overlays the canonical invocation Caller on this typed registration placeholder, as for every module.
            const events = yield* Effect.serviceOption(ApprovalEvents);
            const dependencies = Option.isSome(events) ? Context.add(routed, ApprovalEvents, events.value) : routed;
            return yield* host.register({
                manifest: {
                    format: 1,
                    id: 'approval-consent',
                    version: '1.0.0',
                    description: 'Explicit human approval lifecycle.',
                    actions: [prepareConsent.name, completeConsent.name, cancelConsent.name],
                    flags: [approvalConsentFlag],
                },
                layer: Layer.succeedContext(dependencies),
                actions: [
                    implement(
                        prepareConsent,
                        /** Recompute the target review without running it; missing trusted policy fails closed here. */
                        (value) =>
                            Effect.gen(
                                /** Serialize SQL identity checks with concurrent revocation while deriving the live review. */
                                function* () {
                                    // Recursively consenting to consent would create an alternate authority path rather than reviewing a target.
                                    if (intrinsic(value.action))
                                        return yield* new ApprovalFailure({ reason: 'denied' });
                                    const store = yield* ApprovalStore;
                                    return yield* store.transaction(
                                        Effect.gen(
                                            /** The requested actor is untrusted until the host resolves its actual current identity. */
                                            function* () {
                                                const session = yield* liveSession;
                                                const policy = yield* IdentitySessionPolicy;
                                                const expiresAt = yield* policy.approvalExpiresAt(session);
                                                // Reviewing for an agent cannot expose a target the consenting human cannot independently authorize.
                                                yield* host.prepareApproval(
                                                    value.action,
                                                    value.input,
                                                    value.writeKey,
                                                    value.version
                                                );
                                                const prepared = yield* host
                                                    .prepareApproval(
                                                        value.action,
                                                        value.input,
                                                        value.writeKey,
                                                        value.version
                                                    )
                                                    .pipe(Effect.provideService(Caller, value.principal));
                                                return { review: prepared, expiresAt };
                                            }
                                        )
                                    );
                                }
                            ).pipe(
                                Effect.mapError(
                                    /** Never expose parser, identity or configuration diagnostics through a consent action. */
                                    (error) =>
                                        error._tag === 'ApprovalFailure'
                                            ? error
                                            : new ApprovalFailure({ reason: 'denied' })
                                )
                            )
                    ),
                    implement(
                        completeConsent,
                        /** Integrity deduplicates this explicit completion by its own key; the reviewed target key is not reused. */
                        (value) =>
                            Effect.gen(
                                /** Recheck current policy and actual session before the host compares the entire reviewed target. */
                                function* () {
                                    // The transport command key deduplicates this confirmation, not the separate target work key.
                                    if (
                                        intrinsic(value.action) ||
                                        value.writeKey !== value.review.binding.writeKey ||
                                        value.version !== value.review.binding.version
                                    )
                                        return yield* new ApprovalFailure({ reason: 'binding' });
                                    const session = yield* liveSession;
                                    const policy = yield* IdentitySessionPolicy;
                                    const configured = yield* policy.current;
                                    if (value.expiresAt > (yield* policy.approvalExpiresAt(session)))
                                        return yield* new ApprovalFailure({ reason: 'expired' });
                                    const record = yield* host.completeApproval(
                                        value.action,
                                        value.input,
                                        value.principal,
                                        value.review,
                                        value.expiresAt,
                                        {
                                            sessionLifetimeMs: configured.sessionLifetimeMs,
                                            lifetimeMs: configured.approvalWindowMs,
                                        }
                                    );
                                    return { id: record.id, expiresAt: record.expiresAt };
                                }
                            ).pipe(
                                Effect.mapError(
                                    /** Completion preserves bounded approval refusal only; it never returns private target-policy diagnostics. */
                                    (error) =>
                                        error._tag === 'ApprovalFailure'
                                            ? error
                                            : new ApprovalFailure({ reason: 'denied' })
                                )
                            )
                    ),
                    implement(
                        cancelConsent,
                        /** Cancellation's intrinsic human admission does not replace its independently scoped ownership/lead checks. */
                        ({ id }) =>
                            cancelApproval(id).pipe(
                                Effect.map(
                                    /** A successful cancellation always has a terminal timestamp; return no stored principal/session detail. */
                                    (record) => ({ id: record.id, revokedAt: record.revokedAt ?? record.issuedAt })
                                )
                            )
                    ),
                ],
            });
        }
    );
