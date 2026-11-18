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

/** @title Verify a Keycloak access token, open its session, then authenticate inside one routed tenant */
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

/** Sign-in completion: IdentityStore, CurrentTenant and identitySecurity are provided by the tenant composition root. */
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
            // openOidcSession refuses unlinked or non-human subjects; it never creates principals or links.
            yield* openOidcSession(claims, now + 8 * 3_600_000);
            return yield* authenticateTokenSession(token, {
                issuer: verifier.issuer,
                audience: settings.audience,
                scopes: ['eventiva.invoke'],
            }).pipe(
                Effect.provideService(StandardsTokenVerifier, {
                    /** Hand the runtime only the claim fields its policy reads. */
                    verify: (presented) =>
                        verifier.verify(presented).pipe(
                            Effect.map(
                                /** Drop the provider-only client ID. */ ({ clientId: _clientId, ...rest }) => rest
                            ),
                            Effect.mapError(
                                /** Collapse refusal detail into a safe reason. */ (error) =>
                                    new InvocationDenied({ action: '<token>', reason: `oidc-${error.reason}` })
                            )
                        ),
                })
            );
        }
    );
