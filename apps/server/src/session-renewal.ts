/**
 * @file apps/server/src/session-renewal.ts
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
import { IdentityStore, SessionRenewalSettings } from '@eventiva/contracts/identity';
import { Receipt } from '@eventiva/contracts/receipt';
import { CurrentTenant, EpochMillis, Json, Storage } from '@eventiva/contracts/storage';
import type { OidcVerifier } from '@eventiva/integrations.oidc/token';
import { canonicalJson, IdentityResolver, InputDigest } from '@eventiva/runtime/invocation';
import { Clock, Context, Effect, Either, Layer, Random, type Redacted, Schema } from 'effect';
import { IdentitySessionPolicy } from './identity-session-policy.ts';

/** Default-off capability; declaring this flag does not register an endpoint or classify a request as human activity. */
export const sessionRenewalFlag = {
    key: 'identity.session-renewal-enabled',
    owner: 'platform',
    description: 'Renew live human sessions only through trusted interactive application ingress.',
    safeDefault: false,
} satisfies Flag;

/** Trusted server registration, never a request field; CLI activity cannot renew sessions under the selected owner policy. */
export const InteractiveIngress = Schema.Struct({
    route: Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(512)),
    clientId: Schema.NonEmptyTrimmedString.pipe(Schema.maxLength(512)),
    surface: Schema.Literal('web', 'native'),
    activity: Schema.Literal('human-mutation', 'interactive-read', 'navigation'),
});

/** Closed public denial contains no credentials, identity contents, configuration or SQL diagnostics. */
export class SessionRenewalFailure extends Schema.TaggedError<SessionRenewalFailure>()('SessionRenewalFailure', {
    reason: Schema.Literal('invalid', 'denied', 'unavailable'),
}) {}

/** Routed composition-only capability; a handler supplies its fixed allowlisted route, never a body/header/TTY boolean. */
export class SessionRenewal extends Context.Tag('@eventiva/server/SessionRenewal')<
    SessionRenewal,
    {
        /** Verify the bearer anew and atomically renew real activity; repeated token refresh alone never calls this method. */
        readonly renew: (
            route: string,
            token: Redacted.Redacted<string>
        ) => Effect.Effect<{ readonly expiresAt: number }, SessionRenewalFailure>;
    }
>() {}

/**
 * Build inside the authenticated tenant route with the SAME IdentityStore/Storage transaction owner. Register only
 * explicit interactive handlers after accepted human activity, never generic HTTP middleware, polling or token refresh.
 * The verifier and registrations are trusted server composition. No CLI registration, endpoint or scheduler is installed.
 */
export const sessionRenewal = (verifier: OidcVerifier, registrations: ReadonlyArray<typeof InteractiveIngress.Type>) =>
    Layer.effect(
        SessionRenewal,
        Effect.gen(
            /** Detach the closed allowlist and capture only tenant-bound services, not a request Caller or mutable configuration. */
            function* () {
                // Decode before capturing services: an invalid registration must never publish a partially accepting capability.
                const allowed = yield* Schema.decode(Schema.Array(InteractiveIngress))(registrations, {
                    onExcessProperty: 'error',
                }).pipe(
                    Effect.mapError(
                        /** Invalid trusted registrations must prevent capability publication. */
                        () => new SessionRenewalFailure({ reason: 'invalid' })
                    )
                );
                const routes = allowed.map(
                    /** Copy scalars so a later mutation of the supplied configuration cannot authorize another client or route. */
                    (entry) => ({ ...entry })
                );
                const { id: tenant } = yield* CurrentTenant;
                const store = yield* IdentityStore;
                const storage = yield* Storage;
                const resolver = yield* IdentityResolver;
                const policy = yield* IdentitySessionPolicy;
                const flags = yield* Flags;
                const digest = yield* InputDigest;
                if (store.tenant !== tenant) return yield* new SessionRenewalFailure({ reason: 'denied' });
                return SessionRenewal.of({
                    /** Reverify tokens before taking the transaction guard so provider verification never holds the identity lock. */
                    renew: (route, token) =>
                        Effect.gen(
                            /** Classification is an exact registration/client pair, not an HTTP method, scope or caller assertion. */
                            function* () {
                                // A matching server route is insufficient without a freshly verified token from its registered app.
                                const claims = yield* verifier.verify(token).pipe(
                                    Effect.mapError(
                                        /** Authentication refusal does not expose provider details. */
                                        () => new SessionRenewalFailure({ reason: 'denied' })
                                    )
                                );
                                if (
                                    claims.issuer !== verifier.issuer ||
                                    !routes.some(
                                        /** Similar route names or another first-party client do not inherit this registration. */
                                        (entry) => entry.route === route && entry.clientId === claims.clientId
                                    )
                                )
                                    return yield* new SessionRenewalFailure({ reason: 'denied' });
                                return yield* storage.transaction(
                                    Effect.gen(
                                        /** Serialize identity, policy observation, renewal and durable evidence with logout/revocation. */
                                        function* () {
                                            // First transactional statement is the shared guard; time spent waiting cannot resurrect expiry.
                                            yield* store.lock;
                                            const now = yield* Schema.decode(EpochMillis)(
                                                yield* Clock.currentTimeMillis
                                            );
                                            if (
                                                now < 0 ||
                                                claims.notBefore > now ||
                                                claims.expiresAt <= now ||
                                                !(yield* flags.evaluate(sessionRenewalFlag)).value
                                            )
                                                return yield* new SessionRenewalFailure({ reason: 'denied' });
                                            const configured = yield* policy.current;
                                            const settings = yield* Schema.decode(SessionRenewalSettings)({
                                                idleMs: configured.sessionLifetimeMs,
                                                absoluteMs: 28_800_000,
                                            });
                                            if (configured.tenant !== tenant)
                                                return yield* new SessionRenewalFailure({ reason: 'denied' });
                                            const subject = yield* store.lookup({
                                                issuer: claims.issuer,
                                                subject: claims.subject,
                                            });
                                            if (subject === undefined)
                                                return yield* new SessionRenewalFailure({ reason: 'denied' });
                                            yield* resolver.resolve({
                                                subject,
                                                session: claims.session,
                                                tenant,
                                                kind: 'human',
                                            });
                                            const stored = yield* store.get('session', claims.session);
                                            const session = stored?.value;
                                            const activity = session?.activity;
                                            if (
                                                stored === undefined ||
                                                session === undefined ||
                                                activity === undefined ||
                                                !session.active ||
                                                session.subject !== subject ||
                                                session.delegation !== null ||
                                                session.expiresAt <= now ||
                                                activity.lastRealActivityAt > now ||
                                                activity.absoluteExpiresAt <= now ||
                                                activity.issuer !== claims.issuer ||
                                                // A newly tightened idle policy takes effect before, not after, activity admission.
                                                activity.lastRealActivityAt + settings.idleMs <= now
                                            )
                                                return yield* new SessionRenewalFailure({ reason: 'denied' });
                                            const expiresAt = yield* Schema.decode(EpochMillis)(
                                                Math.min(now + settings.idleMs, activity.absoluteExpiresAt)
                                            );
                                            yield* store.put(
                                                'session',
                                                {
                                                    ...session,
                                                    expiresAt,
                                                    activity: {
                                                        ...activity,
                                                        lastRealActivityAt: now,
                                                        idleMs: settings.idleMs,
                                                    },
                                                },
                                                stored.version
                                            );
                                            // Hash actual server classification and lifecycle evidence; never persist a bearer or external subject.
                                            const canonical = canonicalJson({
                                                route,
                                                session: claims.session,
                                                now,
                                                expiresAt,
                                            });
                                            if (Either.isLeft(canonical))
                                                return yield* new SessionRenewalFailure({ reason: 'invalid' });
                                            const inputHash = yield* digest.digest(canonical.right);
                                            const id = `${now}-${yield* Random.nextInt}-${yield* Random.nextInt}`;
                                            const receipt = yield* Schema.decode(Receipt)({
                                                id,
                                                caller: { subject, session: claims.session, tenant, kind: 'human' },
                                                action: 'identity.session.renew',
                                                version: 1,
                                                inputHash,
                                                outcome: 'succeeded',
                                                startedAt: now,
                                                durationMs: 0,
                                            });
                                            const body = yield* Schema.encode(Schema.parseJson(Receipt))(receipt).pipe(
                                                Effect.flatMap(Schema.decodeUnknown(Json))
                                            );
                                            yield* storage.audit(id, body);
                                            return { expiresAt };
                                        }
                                    )
                                );
                            }
                        ).pipe(
                            Effect.mapError(
                                /** Rollback is owned by Storage; only fixed categories leave this capability. */
                                (error) =>
                                    error._tag === 'SessionRenewalFailure'
                                        ? error
                                        : new SessionRenewalFailure({
                                              reason: error._tag === 'InvocationDenied' ? 'denied' : 'unavailable',
                                          })
                            )
                        ),
                });
            }
        )
    );
