/**
 * @file packages/integrations/oidc/src/token.ts
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

import { createHash } from 'node:crypto';
import { SessionId } from '@eventiva/contracts/ids';
import { type Cause, Config, Data, Effect, Redacted, Schema } from 'effect';
import {
    allowInsecureRequests,
    type AuthorizationServer,
    type DiscoveryRequestOptions,
    clockSkew,
    clockTolerance,
    customFetch,
    discoveryRequest,
    type JWTAccessTokenClaims,
    processDiscoveryResponse,
    type ValidateJWTAccessTokenOptions,
    validateJwtAccessToken,
} from 'oauth4webapi';

/**
 * Asymmetric JWS algorithms an issuer may use. Shared-secret HMAC and `none` are never accepted.
 *
 * @since 0.0.1
 * @example
 * const algorithm = Schema.decodeUnknownSync(OidcAlgorithm)('ES256');
 */
export const OidcAlgorithm = Schema.Literal(
    'ES256',
    'ES384',
    'ES512',
    'PS256',
    'PS384',
    'PS512',
    'RS256',
    'RS384',
    'RS512',
    'EdDSA'
);

/**
 * Trusted server configuration for one issuer. None of these values may come from a request, token or tenant header.
 * `clients` lists the OAuth client IDs whose tokens this API accepts; a token minted for another client is refused even
 * when its audience matches.
 *
 * @since 0.0.1
 * @example
 * const settings = Schema.decodeUnknownSync(OidcVerifierSettings)({ issuer, audience, clients: ['web'], algorithms: ['ES256'], allowInsecureLoopback: false });
 */
export const OidcVerifierSettings = Schema.Struct({
    issuer: Schema.NonEmptyTrimmedString,
    audience: Schema.NonEmptyTrimmedString,
    clients: Schema.NonEmptyArray(Schema.NonEmptyTrimmedString),
    algorithms: Schema.NonEmptyArray(OidcAlgorithm),
    allowInsecureLoopback: Schema.Boolean,
});
/**
 * Decoded, trusted verifier settings.
 *
 * @since 0.0.1
 * @example
 * const loopbackAllowed: OidcVerifierSettings['allowInsecureLoopback'] = false;
 */
export type OidcVerifierSettings = typeof OidcVerifierSettings.Type;

/**
 * Untrusted-shape settings input; `makeOidcVerifier` decodes it against `OidcVerifierSettings` before use.
 *
 * @since 0.0.1
 * @example
 * const input: OidcVerifierInput = yield* oidcVerifierSettings;
 */
export interface OidcVerifierInput {
    readonly issuer: string;
    readonly audience: string;
    readonly clients: ReadonlyArray<string>;
    readonly algorithms: ReadonlyArray<string>;
    readonly allowInsecureLoopback: boolean;
}

/**
 * Read verifier settings from configuration: `OIDC_ISSUER`, `OIDC_AUDIENCE`, `OIDC_CLIENTS`, `OIDC_ALGORITHMS`
 * (default `ES256`) and `OIDC_ALLOW_INSECURE_LOOPBACK` (default `false`). HTTP issuers are refused unless explicitly
 * loopback-only.
 *
 * @since 0.0.1
 * @example
 * const verifier = yield* makeOidcVerifier(yield* oidcVerifierSettings);
 */
export const oidcVerifierSettings = Config.all({
    issuer: Config.string('OIDC_ISSUER'),
    audience: Config.string('OIDC_AUDIENCE'),
    clients: Config.array(Config.string(), 'OIDC_CLIENTS'),
    algorithms: Config.withDefault(Config.array(Config.string(), 'OIDC_ALGORITHMS'), ['ES256']),
    allowInsecureLoopback: Config.withDefault(Config.boolean('OIDC_ALLOW_INSECURE_LOOPBACK'), false),
});

/** Fields of {@link OidcConfigurationError}: only a closed reason, never input, token or diagnostics. */
interface OidcConfigurationErrorFields {
    readonly reason: 'invalid-settings' | 'insecure-issuer' | 'discovery-failed';
}
/** Construct an exact yieldable error without exporting the vendor's open error constructor generic. */
const OidcConfigurationErrorBase: new (
    args: OidcConfigurationErrorFields
) => Cause.YieldableError & OidcConfigurationErrorFields & { readonly _tag: 'OidcConfigurationError' } =
    Data.TaggedError('OidcConfigurationError');
/**
 * The issuer, its discovery metadata or the settings are unusable. Construction fails closed.
 *
 * @since 0.0.1
 * @example
 * const failure = new OidcConfigurationError({ reason: 'insecure-issuer' });
 */
export class OidcConfigurationError extends OidcConfigurationErrorBase {}

/** Fields of {@link OidcTokenRejected}: only a closed reason, never input, token or diagnostics. */
interface OidcTokenRejectedFields {
    readonly reason: 'invalid' | 'unsupported-client' | 'missing-session' | 'unavailable';
}
/** Construct an exact yieldable error without exporting the vendor's open error constructor generic. */
const OidcTokenRejectedBase: new (
    args: OidcTokenRejectedFields
) => Cause.YieldableError & OidcTokenRejectedFields & { readonly _tag: 'OidcTokenRejected' } =
    Data.TaggedError('OidcTokenRejected');
/**
 * A presented token was refused. The reason is coarse on purpose: token contents and library diagnostics never escape.
 *
 * @since 0.0.1
 * @example
 * const rejected = new OidcTokenRejected({ reason: 'invalid' });
 */
export class OidcTokenRejected extends OidcTokenRejectedBase {}

/**
 * Claims normalized after signature, type, issuer, audience, client and time validation.
 *
 * @since 0.0.1
 * @example
 * const claims: OidcAccessClaims = yield* verifier.verify(token);
 */
export interface OidcAccessClaims {
    readonly issuer: string;
    readonly subject: string;
    readonly audiences: ReadonlyArray<string>;
    readonly scopes: ReadonlyArray<string>;
    /** Eventiva SessionId derived from the issuer and provider `sid`. A correlation ID, never proof by itself. */
    readonly session: SessionId;
    readonly clientId: string;
    readonly expiresAt: number;
    readonly notBefore: number;
}

/**
 * A verifier bound to one discovered issuer.
 *
 * @since 0.0.1
 * @example
 * const verifier: OidcVerifier = yield* makeOidcVerifier(input);
 */
export interface OidcVerifier {
    /** The exact issuer identifier confirmed by discovery. */
    readonly issuer: string;
    /**
     * Validate a bearer access token and normalize its claims, or refuse it without revealing why in detail.
     *
     * @param token - The redacted bearer access token.
     * @returns An Effect yielding the normalized claims.
     */
    readonly verify: (token: Redacted.Redacted<string>) => Effect.Effect<OidcAccessClaims, OidcTokenRejected>;
}

/**
 * Test and composition hooks. `fetch` replaces the network transport only; validation stays the library's.
 *
 * @since 0.0.1
 * @example
 * const options: OidcVerifierOptions = { fetch: fixtureFetch };
 */
export interface OidcVerifierOptions {
    readonly fetch?: OidcFetch;
}

/**
 * The transport signature oauth4webapi calls for discovery and key fetches.
 *
 * @since 0.0.1
 * @example
 * const fixtureFetch: OidcFetch = (url, init) => fetch(url, init);
 */
export type OidcFetch = NonNullable<DiscoveryRequestOptions[typeof customFetch]>;

/**
 * Derive the Eventiva SessionId for a provider session. The issuer is part of the input so two issuers' `sid` values
 * can never collide. The value is a deterministic UUIDv8 and is not secret: knowing it grants nothing without a
 * verified token whose subject also matches the live SQL session row. SHA-256 is used for collision resistance, not
 * secrecy; the first 128 bits get the RFC 9562 version nibble (8, custom) and variant bits (10xx).
 *
 * @since 0.0.1
 * @param issuer - The exact issuer identifier.
 * @param providerSession - The provider's `sid` claim.
 * @returns The deterministic Eventiva session identifier.
 * @example
 * const session = oidcSessionId('https://id.example.test/realms/eventiva', sid);
 */
export const oidcSessionId = (issuer: string, providerSession: string): SessionId => {
    const hash = createHash('sha256').update(issuer).update('\u0000').update(providerSession).digest('hex');
    const variant = ((Number.parseInt(hash.slice(16, 17), 16) & 0x3) | 0x8).toString(16);
    const hex = `${hash.slice(0, 12)}8${hash.slice(13, 16)}${variant}${hash.slice(17, 32)}`;
    return SessionId.make(
        `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
    );
};

/**
 * True only for hosts that resolve to this machine; used to confine plain-HTTP issuers to local fixtures.
 *
 * @param url - The issuer URL.
 * @returns Whether its host is a loopback name or address.
 */
const isLoopback = (url: URL) => ['127.0.0.1', '[::1]', 'localhost'].includes(url.hostname);

/**
 * Turn an epoch-seconds claim into epoch milliseconds, refusing non-finite values.
 *
 * @param seconds - The claim value, if present.
 * @returns The time in milliseconds, or undefined when absent or not finite.
 */
const millis = (seconds: number | undefined) =>
    seconds !== undefined && Number.isFinite(seconds) ? Math.trunc(seconds * 1000) : undefined;

/**
 * Map validated library claims to the normalized shape, enforcing Eventiva's extra client and session rules. The
 * library has already checked the signature, `typ: at+jwt`, iss, aud, exp and required claims. Without a provider
 * session there is nothing to bind to an Eventiva session, so service tokens fail closed here.
 *
 * @param settings - The trusted verifier settings.
 * @param claims - The claims the library validated.
 * @returns An Effect yielding the normalized claims.
 * @fails {OidcTokenRejected} With `unsupported-client`, `missing-session` or `invalid`.
 */
const normalize = (
    settings: OidcVerifierSettings,
    claims: JWTAccessTokenClaims
): Effect.Effect<OidcAccessClaims, OidcTokenRejected> => {
    if (!settings.clients.includes(claims.client_id))
        return Effect.fail(new OidcTokenRejected({ reason: 'unsupported-client' }));
    const sid = claims['sid'];
    if (typeof sid !== 'string' || sid.length === 0)
        return Effect.fail(new OidcTokenRejected({ reason: 'missing-session' }));
    const expiresAt = millis(claims.exp);
    const notBefore = millis(claims.nbf ?? claims.iat);
    if (expiresAt === undefined || notBefore === undefined)
        return Effect.fail(new OidcTokenRejected({ reason: 'invalid' }));
    const scope = claims['scope'];
    return Effect.succeed({
        issuer: claims.iss,
        subject: claims.sub,
        audiences: typeof claims.aud === 'string' ? [claims.aud] : [...claims.aud],
        scopes:
            typeof scope === 'string'
                ? scope.split(' ').filter(
                      /**
                       * Drop empty separators.
                       *
                       * @param s - One space-separated part of the scope claim.
                       * @returns Whether it is a non-empty scope.
                       */
                      (s) => s.length > 0
                  )
                : [],
        session: oidcSessionId(claims.iss, sid),
        clientId: claims.client_id,
        expiresAt,
        notBefore,
    });
};

/**
 * Discover one issuer and return a verifier for RFC 9068 JWT access tokens. Discovery must return exactly the
 * configured issuer. Validation uses oauth4webapi with an explicit algorithm allowlist and zero clock tolerance.
 * Plain HTTP would let anyone on the path swap keys, so it is allowed only for an explicit loopback fixture.
 *
 * @since 0.0.1
 * @param input - The verifier settings, decoded before use.
 * @param options - Optional transport override for tests.
 * @returns An Effect yielding the verifier for the discovered issuer.
 * @fails {OidcConfigurationError} With `invalid-settings`, `insecure-issuer` or `discovery-failed`.
 * @example
 * const verifier = yield* makeOidcVerifier(yield* oidcVerifierSettings);
 */
export const makeOidcVerifier = (
    input: OidcVerifierInput,
    options: OidcVerifierOptions = {}
): Effect.Effect<OidcVerifier, OidcConfigurationError> =>
    Effect.gen(
        /** Validate settings, confine plain HTTP to loopback, then pin the discovered authorization server. */ function* () {
            const settings = yield* Schema.decodeUnknown(OidcVerifierSettings)(input).pipe(
                Effect.mapError(
                    /**
                     * Hide schema diagnostics.
                     *
                     * @returns The `invalid-settings` failure.
                     */
                    () => new OidcConfigurationError({ reason: 'invalid-settings' })
                )
            );
            const issuer = yield* Effect.try({
                /**
                 * Parse the configured issuer identifier.
                 *
                 * @returns The issuer URL.
                 */
                try: () => new URL(settings.issuer),
                /**
                 * An unparsable issuer is a configuration error.
                 *
                 * @returns The `invalid-settings` failure.
                 */
                catch: () => new OidcConfigurationError({ reason: 'invalid-settings' }),
            });
            const insecure = issuer.protocol === 'http:';
            if (
                (insecure && !(settings.allowInsecureLoopback && isLoopback(issuer))) ||
                (!insecure && issuer.protocol !== 'https:')
            )
                return yield* new OidcConfigurationError({ reason: 'insecure-issuer' });
            const transport: DiscoveryRequestOptions = { [allowInsecureRequests]: insecure };
            if (options.fetch !== undefined) transport[customFetch] = options.fetch;
            const discovery = yield* Effect.tryPromise({
                // effect-boundary: oauth4webapi exposes discovery only as a Promise-returning fetch.
                /**
                 * Fetch the issuer's discovery document.
                 *
                 * @returns The discovery response promise.
                 */
                try: () => discoveryRequest(issuer, transport),
                /**
                 * Network failure during discovery.
                 *
                 * @returns The `discovery-failed` failure.
                 */
                catch: () => new OidcConfigurationError({ reason: 'discovery-failed' }),
            });
            const server: AuthorizationServer = yield* Effect.tryPromise({
                // effect-boundary: the library checks the discovery document's issuer equals the configured one exactly.
                /**
                 * Parse discovery and pin the exact issuer.
                 *
                 * @returns The promise of the pinned authorization server.
                 */
                try: () => processDiscoveryResponse(issuer, discovery),
                /**
                 * Issuer mismatch or malformed metadata.
                 *
                 * @returns The `discovery-failed` failure.
                 */
                catch: () => new OidcConfigurationError({ reason: 'discovery-failed' }),
            });
            const validation: ValidateJWTAccessTokenOptions = {
                ...transport,
                signingAlgorithms: [...settings.algorithms],
                [clockSkew]: 0,
                [clockTolerance]: 0,
            };
            return {
                issuer: server.issuer,
                /**
                 * Validate one bearer token against the pinned server; never log or return the token.
                 *
                 * @param token - The redacted bearer access token.
                 * @returns An Effect yielding the normalized claims.
                 */
                verify: (token) =>
                    Effect.tryPromise({
                        // effect-boundary: oauth4webapi validates the JWT (and fetches JWKS) through a Promise.
                        /**
                         * Validate signature, type, issuer, audience and time.
                         *
                         * @returns The promise of the validated claims.
                         */
                        try: () =>
                            validateJwtAccessToken(
                                server,
                                new Request(server.issuer, {
                                    headers: { authorization: `Bearer ${Redacted.value(token)}` },
                                }),
                                settings.audience,
                                validation
                            ),
                        /**
                         * Distinguish key-fetch outages from invalid tokens without exposing either.
                         *
                         * @param error - The library's rejection, inspected only for its kind.
                         * @returns `unavailable` for a network failure, otherwise `invalid`.
                         */
                        catch: (error) =>
                            new OidcTokenRejected({
                                reason: error instanceof TypeError && !('code' in error) ? 'unavailable' : 'invalid',
                            }),
                    }).pipe(
                        Effect.flatMap(
                            /**
                             * Apply Eventiva's client and session rules.
                             *
                             * @param claims - The claims the library validated.
                             * @returns An Effect yielding the normalized claims.
                             */
                            (claims) => normalize(settings, claims)
                        )
                    ),
            };
        }
    );
