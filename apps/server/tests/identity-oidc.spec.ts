/**
 * @file apps/server/tests/identity-oidc.spec.ts
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

import { describe, expect, it } from '@effect/vitest';
import { OidcTokenRejected, oidcSessionId, type OidcVerifier } from '@eventiva/integrations.oidc/token';
import { StandardsTokenVerifier } from '@eventiva/runtime/identity';
import { ConfigProvider, Effect, Layer, Redacted } from 'effect';
import { OidcStandardsVerifierLive, oidcStandardsVerifier } from '../src/identity-oidc.ts';

const issuer = 'https://issuer.test/realms/eventiva';

/** A verifier double that accepts one exact token string and refuses everything else. */
const verifier: OidcVerifier = {
    issuer,
    /** Accept only the fixture token; this exercises mapping, not cryptography. */
    verify: (token) =>
        Redacted.value(token) === 'accepted'
            ? Effect.succeed({
                  issuer,
                  subject: 'external-user',
                  audiences: ['eventiva-api'],
                  scopes: ['eventiva.invoke'],
                  session: oidcSessionId(issuer, 'sid-1'),
                  clientId: 'eventiva-web',
                  expiresAt: 5000,
                  notBefore: 500,
              })
            : Effect.fail(new OidcTokenRejected({ reason: 'unsupported-client' })),
};

describe('OIDC token seam composition', /** Server-side mapping from the adapter to the runtime seam. */ () => {
    it.effect(
        'passes only the runtime claim fields and maps refusals to a fixed InvocationDenied reason',
        /** Compare the mapped claims and error. */ () =>
            Effect.gen(
                /** The client ID must not cross into the runtime claims. */ function* () {
                    const seam = yield* StandardsTokenVerifier;
                    expect(yield* seam.verify(Redacted.make('accepted'))).toEqual({
                        issuer,
                        subject: 'external-user',
                        audiences: ['eventiva-api'],
                        scopes: ['eventiva.invoke'],
                        session: oidcSessionId(issuer, 'sid-1'),
                        expiresAt: 5000,
                        notBefore: 500,
                    });
                    expect(yield* Effect.flip(seam.verify(Redacted.make('other')))).toMatchObject({
                        _tag: 'InvocationDenied',
                        action: '<token>',
                        reason: 'oidc-unsupported-client',
                    });
                }
            ).pipe(Effect.provide(oidcStandardsVerifier(verifier)))
    );

    it.effect(
        'fails construction from configuration instead of falling back to an accepting verifier',
        /** An insecure configured issuer must stop the layer from building. */ () =>
            Effect.gen(
                /** Build the live layer against refused settings. */ function* () {
                    const error = yield* Effect.flip(Layer.build(OidcStandardsVerifierLive).pipe(Effect.scoped));
                    expect(error).toMatchObject({ _tag: 'OidcConfigurationError', reason: 'insecure-issuer' });
                }
            ).pipe(
                Effect.withConfigProvider(
                    ConfigProvider.fromMap(
                        new Map([
                            ['OIDC_ISSUER', 'http://issuer.test/realms/eventiva'],
                            ['OIDC_AUDIENCE', 'eventiva-api'],
                            ['OIDC_CLIENTS', 'eventiva-web'],
                        ])
                    )
                )
            )
    );
});
