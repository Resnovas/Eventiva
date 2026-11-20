/**
 * @file packages/integrations/oidc/src/session.ts
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

import { IdentitySession, IdentityStore, SessionActivity, SessionRenewalSettings } from '@eventiva/contracts/identity';
import type { SessionId } from '@eventiva/contracts/ids';
import type { StorageFailure } from '@eventiva/contracts/storage';
import { type Cause, Clock, Data, Effect, Schema } from 'effect';
import type { OidcAccessClaims } from './token.ts';

/** Fields of {@link OidcSessionRefused}: only a closed reason, never input, token or diagnostics. */
interface OidcSessionRefusedFields {
    readonly reason: 'unlinked' | 'inactive-principal' | 'not-human' | 'expired' | 'conflict';
}
/** Construct an exact yieldable error without exporting the vendor's open error constructor generic. */
const OidcSessionRefusedBase: new (
    args: OidcSessionRefusedFields
) => Cause.YieldableError & OidcSessionRefusedFields & { readonly _tag: 'OidcSessionRefused' } =
    Data.TaggedError('OidcSessionRefused');
/** Session provisioning was refused. Only the closed reason is exposed. */
export class OidcSessionRefused extends OidcSessionRefusedBase {}

/**
 * Trusted backend provisioning: open the Eventiva session for a freshly verified access token. Run it only in the
 * server's login completion path with claims from `OidcVerifier.verify`, inside the tenant route the control plane
 * resolved, and within the same Storage transaction as its audit. It never creates principals, links or memberships:
 * an unlinked issuer/subject is refused. The deadline or bounded rolling settings come from server policy, not the token.
 * Repeating an already live session is idempotent: token refresh never moves its sign-in/activity/absolute anchors.
 */
export const openOidcSession = (
    claims: OidcAccessClaims,
    expiresAt: number | typeof SessionRenewalSettings.Type
): Effect.Effect<SessionId, OidcSessionRefused | StorageFailure, IdentityStore> =>
    Effect.gen(
        /** Serialize with revocation, require an existing human link, then create the session row create-only. */ function* () {
            const store = yield* IdentityStore;
            yield* store.lock;
            // A contended login cannot use a clock sampled before another transaction's revocation or expiry boundary.
            const now = yield* Clock.currentTimeMillis;
            let deadline: number;
            let activity: typeof SessionActivity.Type | undefined;
            if (typeof expiresAt === 'number') deadline = expiresAt;
            else {
                const settings = yield* Schema.decode(SessionRenewalSettings)(expiresAt, {
                    onExcessProperty: 'error',
                }).pipe(
                    Effect.mapError(
                        /** Invalid trusted settings never fall back to an accepting deadline. */
                        () => new OidcSessionRefused({ reason: 'conflict' })
                    )
                );
                deadline = now + settings.idleMs;
                activity = {
                    issuedAt: now,
                    lastRealActivityAt: now,
                    absoluteExpiresAt: now + settings.absoluteMs,
                    idleMs: settings.idleMs,
                    issuer: claims.issuer,
                    clientId: claims.clientId,
                };
            }
            if (deadline <= now || claims.expiresAt <= now) return yield* new OidcSessionRefused({ reason: 'expired' });
            // Exact issuer/subject only; never fall back to email or another issuer's subject.
            const subject = yield* store.lookup({ issuer: claims.issuer, subject: claims.subject });
            if (subject === undefined) return yield* new OidcSessionRefused({ reason: 'unlinked' });
            const principal = (yield* store.get('principal', subject))?.value;
            if (principal === undefined || !principal.active)
                return yield* new OidcSessionRefused({ reason: 'inactive-principal' });
            // Agents and services need their own delegation/credential path; a user login cannot mint one.
            if (principal.kind !== 'human') return yield* new OidcSessionRefused({ reason: 'not-human' });
            const existing = yield* store.get('session', claims.session);
            if (existing !== undefined) {
                // A closed or foreign session is never reopened; the provider must start a new session.
                const same =
                    existing.value.subject === subject &&
                    existing.value.active &&
                    existing.value.expiresAt > now &&
                    existing.value.delegation === null;
                return same ? claims.session : yield* new OidcSessionRefused({ reason: 'conflict' });
            }
            const session = yield* Schema.decode(IdentitySession)({
                id: claims.session,
                subject,
                expiresAt: deadline,
                active: true,
                delegation: null,
                ...(activity === undefined ? {} : { activity }),
            }).pipe(
                Effect.mapError(
                    /** Numeric overflow and contradictory lifecycle metadata are denied before the create-only write. */
                    () => new OidcSessionRefused({ reason: 'conflict' })
                )
            );
            yield* store.put('session', session, null);
            return claims.session;
        }
    );

/**
 * Trusted backend revocation for logout or deprovisioning: close the Eventiva session derived from a provider session.
 * Run it only after the logout signal itself is authenticated. Closing an absent or already closed session succeeds.
 */
export const closeOidcSession = (session: SessionId): Effect.Effect<void, StorageFailure, IdentityStore> =>
    Effect.gen(
        /** Lock, then CAS the session inactive so concurrent refreshes observe the revocation. */ function* () {
            // Serialize the read and versioned revoke; an already inactive or absent session needs no replacement write.
            const store = yield* IdentityStore;
            yield* store.lock;
            const existing = yield* store.get('session', session);
            if (existing === undefined || !existing.value.active) return;
            yield* store.put('session', { ...existing.value, active: false }, existing.version);
        }
    );
