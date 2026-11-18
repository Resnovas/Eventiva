/**
 * @file tests/integrations/oidc/src/token.spec.ts
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

import { webcrypto } from 'node:crypto';
import {
    makeOidcVerifier,
    type OidcFetch,
    oidcSessionId,
    oidcVerifierSettings,
    type OidcVerifierInput,
    type OidcVerifierSettings,
} from '@eventiva/integrations.oidc/token';
import { describe, expect, it } from '@effect/vitest';
import { ConfigProvider, Effect, Redacted, Schema } from 'effect';

const issuer = 'https://issuer.test/realms/eventiva';
const settings: typeof OidcVerifierSettings.Encoded = {
    issuer,
    audience: 'eventiva-api',
    clients: ['eventiva-web'],
    algorithms: ['ES256'],
    allowInsecureLoopback: false,
};

/** Encode bytes or JSON as unpadded base64url, the JWS compact serialization alphabet. */
const b64 = (value: Uint8Array | object) =>
    Buffer.from(value instanceof Uint8Array ? value : JSON.stringify(value)).toString('base64url');

/** Generate an ECDSA P-256 signing key and its public JWK with a fixed key ID. */
const keyPair = (kid: string) =>
    Effect.promise(
        /** Create a fresh key for each fixture so no static private key lives in the repository. */ () =>
            webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])
    ).pipe(
        Effect.flatMap(
            /** Export the public half as the JWKS entry the fake issuer serves. */ (pair) =>
                Effect.promise(
                    /** Read the public JWK. */ () => webcrypto.subtle.exportKey('jwk', pair.publicKey)
                ).pipe(
                    Effect.map(
                        /** Tag the JWK for selection by `kid`. */ (jwk) => ({
                            pair,
                            jwk: { ...jwk, kid, alg: 'ES256', use: 'sig' },
                        })
                    )
                )
        )
    );

/** Sign a compact JWS with the given header and payload using ES256. */
const sign = (key: webcrypto.CryptoKey, header: object, payload: object) =>
    Effect.promise(
        /** Produce the IEEE P1363 signature JWS requires over `header.payload`. */ () =>
            webcrypto.subtle.sign(
                { name: 'ECDSA', hash: 'SHA-256' },
                key,
                Buffer.from(`${b64(header)}.${b64(payload)}`)
            )
    ).pipe(
        Effect.map(
            /** Assemble the compact token. */ (signature) =>
                `${b64(header)}.${b64(payload)}.${b64(new Uint8Array(signature))}`
        )
    );

/** Serve discovery and JWKS for one issuer; `jwks: undefined` simulates a key endpoint outage. */
const fakeIssuer =
    (served: { issuer: string; keys?: ReadonlyArray<object> }): OidcFetch =>
    /** Answer only the two endpoints the verifier may call. */ (url) => {
        if (url.endsWith('/.well-known/openid-configuration'))
            return Promise.resolve(
                Response.json({ issuer: served.issuer, jwks_uri: `${issuer}/protocol/openid-connect/certs` })
            );
        if (url.endsWith('/certs') && served.keys !== undefined)
            return Promise.resolve(Response.json({ keys: served.keys }));
        return Promise.reject(new TypeError('fetch failed'));
    };

/** Build a verifier and a token minter around a fresh issuer key. */
const fixture = Effect.gen(
    /** Share one key and verifier across the cases of a test. */ function* () {
        const good = yield* keyPair('k1');
        const now = Math.floor(Date.now() / 1000);
        const claims = {
            iss: issuer,
            sub: 'external-user',
            aud: 'eventiva-api',
            client_id: 'eventiva-web',
            jti: 'token-1',
            iat: now - 5,
            exp: now + 300,
            sid: 'provider-session',
            scope: 'openid eventiva.invoke',
        };
        const header = { alg: 'ES256', typ: 'at+jwt', kid: 'k1' };
        const verifier = yield* makeOidcVerifier(settings, { fetch: fakeIssuer({ issuer, keys: [good.jwk] }) });
        /** Mint a token with optional header/claim overrides and signing key. */
        const mint = (overrides: object = {}, headerOverrides: object = {}, key = good.pair.privateKey) =>
            sign(key, { ...header, ...headerOverrides }, { ...claims, ...overrides });
        return { verifier, mint, claims, now, good };
    }
);

describe('OIDC access-token verifier', /** Signature, RFC 9068 and Eventiva client/session rules. */ () => {
    it.live(
        'normalizes a valid at+jwt token and derives the Eventiva session from the issuer and sid',
        /** Accept one well-formed token. */ () =>
            Effect.gen(
                /** Compare every normalized field against values derived independently from the fixture. */ function* () {
                    const { verifier, mint, now } = yield* fixture;
                    const result = yield* verifier.verify(Redacted.make(yield* mint()));
                    expect(result).toEqual({
                        issuer,
                        subject: 'external-user',
                        audiences: ['eventiva-api'],
                        scopes: ['openid', 'eventiva.invoke'],
                        session: oidcSessionId(issuer, 'provider-session'),
                        clientId: 'eventiva-web',
                        expiresAt: (now + 300) * 1000,
                        notBefore: (now - 5) * 1000,
                    });
                    expect(verifier.issuer).toBe(issuer);
                    const multi = yield* verifier.verify(
                        Redacted.make(yield* mint({ aud: ['other', 'eventiva-api'], nbf: now - 1, scope: undefined }))
                    );
                    expect(multi.audiences).toEqual(['other', 'eventiva-api']);
                    expect(multi.scopes).toEqual([]);
                    expect(multi.notBefore).toBe((now - 1) * 1000);
                }
            )
    );

    it.live(
        'refuses tokens that fail signature, type, issuer, audience, time, client or session rules',
        /** Each case changes exactly one property of an otherwise valid token. */ () =>
            Effect.gen(
                /** Collect each refusal reason so a wrong classification is visible. */ function* () {
                    const { verifier, mint, now } = yield* fixture;
                    const other = yield* keyPair('k1');
                    /** Verify a token and return the refusal reason it fails with. */
                    const reason = (token: string) =>
                        verifier.verify(Redacted.make(token)).pipe(
                            Effect.flip,
                            Effect.map(/** Keep only the closed reason. */ (error) => error.reason)
                        );
                    const valid = yield* mint();
                    const [h, p] = valid.split('.');
                    const cases: ReadonlyArray<readonly [string, string]> = [
                        ['wrong key, same kid', yield* mint({}, {}, other.pair.privateKey)],
                        [
                            'tampered payload',
                            `${h}.${b64({ ...JSON.parse(Buffer.from(p!, 'base64url').toString()), sub: 'admin' })}.${valid.split('.')[2]}`,
                        ],
                        ['alg none', `${b64({ alg: 'none', typ: 'at+jwt' })}.${p}.`],
                        ['generic JWT type', yield* mint({}, { typ: 'JWT' })],
                        ['algorithm outside allowlist', yield* mint({}, { alg: 'ES384' })],
                        ['other issuer', yield* mint({ iss: 'https://attacker.test/realms/eventiva' })],
                        ['issuer with trailing slash', yield* mint({ iss: `${issuer}/` })],
                        ['other audience', yield* mint({ aud: 'other-api' })],
                        ['expired one second ago', yield* mint({ exp: now - 1 })],
                        ['not yet valid', yield* mint({ nbf: now + 60 })],
                        ['missing client_id', yield* mint({ client_id: undefined })],
                        ['missing jti', yield* mint({ jti: undefined })],
                        ['malformed', 'not-a-jwt'],
                    ];
                    for (const [name, token] of cases) expect([name, yield* reason(token)]).toEqual([name, 'invalid']);
                    expect(yield* reason(yield* mint({ client_id: 'other-client' }))).toBe('unsupported-client');
                    expect(yield* reason(yield* mint({ sid: undefined }))).toBe('missing-session');
                    expect(yield* reason(yield* mint({ sid: '' }))).toBe('missing-session');
                }
            )
    );

    it.live(
        'reports a key endpoint outage as unavailable rather than invalid',
        /** Discovery succeeds but JWKS cannot be fetched. */ () =>
            Effect.gen(
                /** A verifier whose key fetch fails must refuse with the outage reason. */ function* () {
                    const { mint } = yield* fixture;
                    const verifier = yield* makeOidcVerifier(settings, { fetch: fakeIssuer({ issuer }) });
                    const error = yield* Effect.flip(verifier.verify(Redacted.make(yield* mint())));
                    expect(error.reason).toBe('unavailable');
                }
            )
    );

    it.effect(
        'fails construction closed for bad settings, insecure issuers and mismatched discovery',
        /** No verifier is returned unless the issuer is safe and exactly confirmed. */ () =>
            Effect.gen(
                /** Collect each configuration refusal reason. */ function* () {
                    const ok = fakeIssuer({ issuer, keys: [] });
                    /** Build a verifier and return the configuration refusal reason. */
                    const reason = (input: OidcVerifierInput, fetch = ok) =>
                        makeOidcVerifier(input, { fetch }).pipe(
                            Effect.flip,
                            Effect.map(/** Keep only the closed reason. */ (error) => error.reason)
                        );
                    expect(yield* reason({ ...settings, clients: [] })).toBe('invalid-settings');
                    expect(yield* reason({ ...settings, algorithms: ['HS256'] })).toBe('invalid-settings');
                    expect(yield* reason({ ...settings, issuer: 'not a url' })).toBe('invalid-settings');
                    expect(yield* reason({ ...settings, issuer: 'ftp://issuer.test/realm' })).toBe('insecure-issuer');
                    expect(
                        yield* reason({ ...settings, issuer: 'http://issuer.test/realm', allowInsecureLoopback: true })
                    ).toBe('insecure-issuer');
                    expect(yield* reason({ ...settings, issuer: 'http://127.0.0.1:8080/realms/x' })).toBe(
                        'insecure-issuer'
                    );
                    expect(yield* reason(settings, fakeIssuer({ issuer: `${issuer}/other`, keys: [] }))).toBe(
                        'discovery-failed'
                    );
                    expect(
                        yield* reason(
                            settings,
                            /** Simulate the issuer being unreachable. */ () =>
                                Promise.reject(new TypeError('fetch failed'))
                        )
                    ).toBe('discovery-failed');
                    const loopback = 'http://127.0.0.1:8080/realms/x';
                    const local = yield* makeOidcVerifier(
                        { ...settings, issuer: loopback, allowInsecureLoopback: true },
                        { fetch: fakeIssuer({ issuer: loopback, keys: [] }) }
                    );
                    expect(local.issuer).toBe(loopback);
                }
            )
    );

    it('derives distinct, deterministic UUIDv8 session IDs per issuer and sid', /** Pure derivation checks. */ () => {
        const a = oidcSessionId(issuer, 'sid-1');
        expect(oidcSessionId(issuer, 'sid-1')).toBe(a);
        expect(oidcSessionId(issuer, 'sid-2')).not.toBe(a);
        expect(oidcSessionId(`${issuer}2`, 'sid-1')).not.toBe(a);
        // The separator prevents issuer/sid boundary shifting from producing the same input.
        expect(oidcSessionId('ab', 'c')).not.toBe(oidcSessionId('a', 'bc'));
        expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it.effect(
        'reads settings from configuration with safe defaults',
        /** Defaults are ES256 only and no plain HTTP. */ () =>
            Effect.gen(
                /** Parse a minimal configuration and check the defaults. */ function* () {
                    const read = yield* oidcVerifierSettings;
                    expect(read).toEqual({
                        issuer,
                        audience: 'eventiva-api',
                        clients: ['eventiva-web', 'eventiva-cli'],
                        algorithms: ['ES256'],
                        allowInsecureLoopback: false,
                    });
                    expect(Schema.is(Schema.Array(Schema.String))(read.clients)).toBe(true);
                }
            ).pipe(
                Effect.withConfigProvider(
                    ConfigProvider.fromMap(
                        new Map([
                            ['OIDC_ISSUER', issuer],
                            ['OIDC_AUDIENCE', 'eventiva-api'],
                            ['OIDC_CLIENTS', 'eventiva-web,eventiva-cli'],
                        ])
                    )
                )
            )
    );
});
