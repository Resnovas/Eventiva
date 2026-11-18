/**
 * @file apps/server/src/identity-oidc.ts
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

import { makeOidcVerifier, type OidcVerifier, oidcVerifierSettings } from '@eventiva/integrations.oidc/token';
import { StandardsTokenVerifier } from '@eventiva/runtime/identity';
import { InvocationDenied } from '@eventiva/runtime/invocation';
import { Effect, Layer } from 'effect';

/**
 * Expose one discovered OIDC verifier as the runtime's provider-neutral token seam. Only the normalized claims the
 * runtime policy reads cross the boundary; provider refusal reasons become a fixed `InvocationDenied` reason.
 */
export const oidcStandardsVerifier = (verifier: OidcVerifier): Layer.Layer<StandardsTokenVerifier> =>
    Layer.succeed(StandardsTokenVerifier, {
        /** Verify with the adapter, then hand the runtime exactly the claim fields its policy checks. */
        verify: (token) =>
            verifier.verify(token).pipe(
                Effect.map(
                    /** Drop provider-only fields such as the client ID before the runtime decodes the claims. */ (
                        claims
                    ) => ({
                        issuer: claims.issuer,
                        subject: claims.subject,
                        audiences: claims.audiences,
                        scopes: claims.scopes,
                        session: claims.session,
                        expiresAt: claims.expiresAt,
                        notBefore: claims.notBefore,
                    })
                ),
                Effect.mapError(
                    /** Keep the refusal class but never the token or library diagnostics. */ (error) =>
                        new InvocationDenied({ action: '<token>', reason: `oidc-${error.reason}` })
                )
            ),
    });

/**
 * Build the token seam from `OIDC_*` configuration. Not wired into the shell: the server stays fail-closed until a
 * transport, tenant routing and the `identity.foundation-enabled` flag are composed together.
 */
export const OidcStandardsVerifierLive = Layer.unwrapEffect(
    Effect.gen(
        /** Read trusted settings, discover the issuer once, and fail construction rather than fall back. */ function* () {
            const settings = yield* oidcVerifierSettings;
            return oidcStandardsVerifier(yield* makeOidcVerifier(settings));
        }
    )
);
