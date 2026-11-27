/**
 * @file ai-docs/src/15_identity/02_oidc.ts
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

/**
 * Complete sign-in only for a previously linked human subject on the tenant route.
 *
 * @title Verify a Keycloak access token, open its session, then authenticate inside one routed tenant
 */
import { openOidcSession } from '@eventiva/integrations.oidc/session';
import { makeOidcVerifier } from '@eventiva/integrations.oidc/token';
import { authenticateTokenSession, StandardsTokenVerifier } from '@eventiva/runtime/identity';
import { InvocationDenied } from '@eventiva/runtime/invocation';
import { Clock, Effect, Redacted } from 'effect';

/** Trusted settings come from server configuration, never from the request. */
const settings = {
    issuer: 'https://id.example.com/realms/eventiva',
    audience: 'eventiva-api',
    clients: ['eventiva-web'],
    algorithms: ['ES256'],
    allowInsecureLoopback: false,
};

/**
 * Open a bounded session and resolve the live caller using the tenant root's identity services.
 *
 * @param accessToken - Credential presented to the configured issuer verifier; never log it.
 * @returns An Effect that refuses unlinked subjects rather than provisioning a principal.
 * @since 0.0.0
 * @example
 * const completion = signIn(presentedToken);
 */
export const signIn = (accessToken: string) =>
    Effect.gen(
        /** Verify, provision the session with a server-chosen expiry, then resolve the caller from live SQL. */ function* () {
            const verifier = yield* makeOidcVerifier({
                ...settings,
                clients: [...settings.clients],
                algorithms: [...settings.algorithms],
            });
            const token = Redacted.make(accessToken);
            const claims = yield* verifier.verify(token);
            const now = yield* Clock.currentTimeMillis;
            yield* openOidcSession(claims, now + 8 * 3_600_000);
            return yield* authenticateTokenSession(token, {
                issuer: verifier.issuer,
                audience: settings.audience,
                scopes: ['eventiva.invoke'],
            }).pipe(
                Effect.provideService(StandardsTokenVerifier, {
                    /**
                     * Hand the runtime only the claim fields its policy reads.
                     *
                     * @param presented - Redacted credential supplied for this verification.
                     * @returns Verified runtime claims or a denial with a bounded reason.
                     */
                    verify: (presented) =>
                        verifier.verify(presented).pipe(
                            Effect.map(
                                /**
                                 * Drop the provider-only client ID.
                                 *
                                 * @param claims - Claims that passed issuer verification.
                                 * @param claims.clientId - Client identifier already checked against server configuration.
                                 * @returns The remaining claims for session authentication.
                                 */ ({ clientId: _clientId, ...rest }) => rest
                            ),
                            Effect.mapError(
                                /**
                                 * Report the refusal category without exposing the presented token.
                                 *
                                 * @param error - Verifier failure with a closed reason code.
                                 * @returns A runtime denial suitable for the authentication boundary.
                                 */ (error) =>
                                    new InvocationDenied({ action: '<token>', reason: `oidc-${error.reason}` })
                            )
                        ),
                })
            );
        }
    );
