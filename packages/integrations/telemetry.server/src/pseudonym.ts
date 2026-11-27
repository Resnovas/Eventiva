/**
 * @file packages/integrations/telemetry.server/src/pseudonym.ts
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

import { createHmac, hkdfSync } from 'node:crypto';
import { TenantId } from '@eventiva/contracts/ids';
import { ModuleId } from '@eventiva/contracts/module-manifest';
import { TelemetrySinkFailure } from '@eventiva/contracts/observability';
import {
    CorrelationAuthority,
    CorrelationIdentity,
    CorrelationIssuer,
    TelemetryConsent,
    TelemetryCorrelation,
    TelemetryExportAuthority,
    TelemetryExportBinding,
    correlationEpochMs,
} from '@eventiva/contracts/telemetry-export';
import { Clock, Config, Effect, Layer, Redacted, Schema } from 'effect';

/**
 * Raw fixture identity stays redacted and server-local; this is not an authentication/issuer endpoint.
 *
 * @since 0.0.1
 * @example
 * const identity = Schema.decodeUnknownSync(FixtureCorrelationIdentity)({ namespace, subject, session, expiresAt });
 */
export const FixtureCorrelationIdentity = Schema.Struct({
    namespace: Schema.Redacted(Schema.NonEmptyString),
    subject: Schema.Redacted(Schema.NonEmptyString),
    session: Schema.Redacted(Schema.NonEmptyString),
    expiresAt: Schema.Number.pipe(Schema.int(), Schema.between(1, Number.MAX_SAFE_INTEGER)),
}).annotations({ parseOptions: { onExcessProperty: 'error' } });
/**
 * Decoded fixture identity whose namespace, subject and session remain redacted until HMAC derivation.
 *
 * @since 0.0.1
 * @example
 * const identity: FixtureCorrelationIdentity = { namespace, subject, session, expiresAt: Date.now() + 60_000 };
 */
export type FixtureCorrelationIdentity = typeof FixtureCorrelationIdentity.Type;

/**
 * Exact secret-store key scope; no environment, tenant, purpose, destination or epoch fallback is permitted.
 *
 * @since 0.0.1
 * @example
 * const scope: CorrelationKeyScope = { environment: 'staging', tenantId, destinationId, purpose, epoch };
 */
export interface CorrelationKeyScope {
    readonly environment: 'test' | 'development' | 'staging';
    readonly tenantId: TelemetryExportBinding['tenantId'];
    readonly destinationId: string;
    readonly purpose: string;
    readonly epoch: number;
}

/**
 * Server-only custody boundary; keys never enter portable contracts, identity tokens or transport attributes.
 *
 * @since 0.0.1
 * @example
 * const keys: CorrelationKeys = yield* rootCorrelationKeys;
 */
export interface CorrelationKeys {
    /** Return the active exact-scope 256-bit key, denying missing/revoked/future epochs without fallback. */
    readonly get: (scope: CorrelationKeyScope) => Effect.Effect<
        {
            readonly scope: CorrelationKeyScope;
            readonly material: Redacted.Redacted<Uint8Array>;
        },
        TelemetrySinkFailure
    >;
}

/**
 * Fixture alias for the exact key scope; fixtures follow the same no-fallback scoping as stored keys.
 *
 * @since 0.0.1
 * @example
 * const scope: FixtureCorrelationKeyScope = { environment: 'development', tenantId, destinationId, purpose, epoch };
 */
export type FixtureCorrelationKeyScope = CorrelationKeyScope;
/**
 * Fixture alias for the key custody boundary, so local proofs exercise the same provider contract.
 *
 * @since 0.0.1
 * @example
 * const keys: FixtureCorrelationKeys = { get: (scope) => Effect.succeed({ scope, material }) };
 */
export type FixtureCorrelationKeys = CorrelationKeys;

const KeyScope = Schema.Struct({
    environment: Schema.Literal('development', 'staging'),
    tenantId: TenantId,
    destinationId: Schema.UUID,
    purpose: ModuleId,
    epoch: Schema.Number.pipe(Schema.int(), Schema.between(0, Number.MAX_SAFE_INTEGER)),
}).annotations({ parseOptions: { onExcessProperty: 'error' } });

/**
 * Derive independent exact-scope hourly HMAC keys from the dedicated 32-byte root (64 hexadecimal characters).
 * HKDF salt/version and framed info prevent cross-environment/tenant/destination/purpose/epoch reuse.
 * Missing/malformed roots deny; this server-only adapter never generates, prints or persists secrets.
 *
 * @since 0.0.1
 * @example
 * const keys = yield* rootCorrelationKeys;
 */
export const rootCorrelationKeys: Effect.Effect<CorrelationKeys, TelemetrySinkFailure> = Config.redacted(
    'TELEMETRY_CORRELATION_ROOT_KEY'
).pipe(
    Effect.mapError(
        /**
         * Configuration diagnostics may include a secret; retain only a bounded reason.
         *
         * @returns The bounded `configuration` failure.
         */
        () => new TelemetrySinkFailure({ reason: 'configuration' })
    ),
    Effect.flatMap(
        /**
         * Validate encoding before retaining the redacted root in the key provider closure.
         *
         * @param root - The redacted root key, which must be exactly 64 hexadecimal characters.
         * @returns The key provider, or a `configuration` failure for malformed material.
         */
        (root) => {
            // Refuse malformed root material before publishing a provider that could derive correlation keys from it.
            if (!/^[0-9a-fA-F]{64}$/.test(Redacted.value(root)))
                return Effect.fail(new TelemetrySinkFailure({ reason: 'configuration' }));
            return Effect.succeed<CorrelationKeys>({
                /**
                 * Derive only the current UTC epoch; no old-key grace, cache or future-key provisioning path.
                 *
                 * @param input - The requested scope, decoded strictly before any secret bytes are read.
                 * @returns The derived 32-byte redacted key with its decoded scope.
                 * @fails {TelemetrySinkFailure} When the scope is invalid, not the current epoch, or HKDF fails.
                 */
                get: (input) =>
                    Effect.gen(
                        /** Snapshot and validate scope before reading secret bytes; no caller-owned scope is retained. */ function* () {
                            const scope = yield* Schema.decodeUnknown(KeyScope)(input).pipe(
                                Effect.mapError(
                                    /**
                                     * Reject out-of-scope derivation without exposing the rejected fields.
                                     *
                                     * @returns The bounded `unavailable` failure.
                                     */
                                    () => new TelemetrySinkFailure({ reason: 'unavailable' })
                                )
                            );
                            if (scope.epoch !== Math.floor((yield* Clock.currentTimeMillis) / correlationEpochMs))
                                return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                            return yield* Effect.try({
                                /**
                                 * Use local RFC 5869 HKDF-SHA256; raw identity never participates in key derivation.
                                 *
                                 * @returns The decoded scope and its redacted derived key; the owned root copy is zeroed.
                                 */
                                // effect-boundary: Node HKDF can fail; its inputs and secret material remain server-local.
                                try: () => {
                                    const owned = Buffer.from(Redacted.value(root), 'hex');
                                    // effect-boundary: clear only our owned input copy even when the crypto provider throws.
                                    try {
                                        return {
                                            scope,
                                            material: Redacted.make(
                                                new Uint8Array(
                                                    hkdfSync(
                                                        'sha256',
                                                        owned,
                                                        'eventiva.correlation.hkdf.v1',
                                                        JSON.stringify([
                                                            1,
                                                            scope.environment,
                                                            scope.tenantId,
                                                            scope.destinationId,
                                                            scope.purpose,
                                                            scope.epoch,
                                                        ]),
                                                        32
                                                    )
                                                )
                                            ),
                                        };
                                    } finally {
                                        owned.fill(0);
                                    }
                                },
                                /**
                                 * Never retain a crypto exception, root bytes or key scope in an error.
                                 *
                                 * @returns The bounded `unavailable` failure.
                                 */
                                catch: () => new TelemetrySinkFailure({ reason: 'unavailable' }),
                            });
                        }
                    ),
            });
        }
    )
);

/**
 * Local proof only. Deny by default unless NODE_ENV explicitly selects test/development.
 * Consent is a fresh fixture policy read returning its expiry, not a client-carried assertion.
 * Production has no accepting key, identity, issuer, consent-store or network composition.
 *
 * @param binding - The trusted host export binding the issuer is pinned to.
 * @param identity - The redacted fixture principal whose pseudonyms are derived.
 * @param keys - The exact-scope key provider.
 * @param consent - A fresh fixture policy read returning the consent expiry in epoch milliseconds.
 * @returns A layer providing the correlation issuer and authority for this binding and principal.
 * @fails {TelemetrySinkFailure} When NODE_ENV is not test/development, or the binding or identity is invalid.
 * @since 0.0.1
 * @example
 * const layer = fixtureCorrelationLayer(binding, identity, keys, Effect.succeed(Date.now() + 60_000));
 */
export const fixtureCorrelationLayer = (
    binding: TelemetryExportBinding,
    identity: FixtureCorrelationIdentity,
    keys: FixtureCorrelationKeys,
    consent: Effect.Effect<number, TelemetrySinkFailure>
): Layer.Layer<CorrelationIssuer | CorrelationAuthority, TelemetrySinkFailure> =>
    scopedCorrelationLayer(
        binding,
        identity,
        keys,
        consent,
        Config.string('NODE_ENV').pipe(Config.withDefault('production')),
        ['test', 'development']
    );

/**
 * Real non-production composition. Each issuance/release rereads verified identity and persistent consent.
 * The trusted identity resolver must recheck active session/tenant routing, not decode an unverified request.
 * No consent management capability or secret is exposed to clients. Production remains unconditionally denied.
 *
 * @template R - Services the live identity resolver needs.
 * @param binding - The trusted host export binding.
 * @param identity - The verified principal the session was opened for.
 * @param keys - The exact-scope key provider.
 * @param currentIdentity - The trusted resolver that rereads the live verified identity on every check.
 * @returns A layer providing the issuer, the correlation authority and the export authority for this session scope.
 * @fails {TelemetrySinkFailure} When the environment is not development/staging, or the binding or identity is invalid.
 * @since 0.0.1
 * @example
 * const layer = storedCorrelationLayer(binding, identity, keys, resolveVerifiedIdentity);
 */
export const storedCorrelationLayer = <R>(
    binding: TelemetryExportBinding,
    identity: CorrelationIdentity,
    keys: CorrelationKeys,
    currentIdentity: Effect.Effect<CorrelationIdentity, TelemetrySinkFailure, R>
): Layer.Layer<
    CorrelationIssuer | CorrelationAuthority | TelemetryExportAuthority,
    TelemetrySinkFailure,
    TelemetryConsent | R
> =>
    Layer.unwrapScoped(
        Effect.gen(
            /** Close over persistent policy without caching a consent grant or trusting a request assertion. */ function* () {
                // Retained handles share this scope's revocation state, not a cached authorization decision.
                const store = yield* TelemetryConsent;
                const context = yield* Effect.context<R>();
                let closed = false;
                yield* Effect.addFinalizer(
                    /**
                     * Revoke retained release handles on session-scope disposal.
                     *
                     * @returns The effect that marks this scope closed.
                     */
                    () =>
                        Effect.sync(
                            /** Scope closure cannot be reversed by a still-present database grant. */ () => {
                                closed = true;
                            }
                        )
                );
                const trusted = yield* Schema.decode(TelemetryExportBinding)(binding).pipe(
                    Effect.mapError(
                        /**
                         * Do not retain rejected host provenance in configuration errors.
                         *
                         * @returns The bounded `configuration` failure.
                         */
                        () => new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                const principal = yield* Schema.decode(Schema.typeSchema(CorrelationIdentity))(identity).pipe(
                    Effect.mapError(
                        /**
                         * Omit schema details containing raw identity.
                         *
                         * @returns The bounded `configuration` failure.
                         */
                        () => new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                const consent = Effect.gen(
                    /** Recheck the exact authenticated principal after every suspension at issuance and dispatch. */ function* () {
                        const live = yield* currentIdentity.pipe(
                            Effect.provide(context),
                            Effect.flatMap(Schema.decode(Schema.typeSchema(CorrelationIdentity))),
                            Effect.mapError(
                                /**
                                 * A live identity failure is optional telemetry denial, never raw issuer diagnostics.
                                 *
                                 * @returns The bounded `unavailable` failure.
                                 */
                                () => new TelemetrySinkFailure({ reason: 'unavailable' })
                            )
                        );
                        const now = yield* Clock.currentTimeMillis;
                        if (
                            closed ||
                            Redacted.value(live.namespace) !== Redacted.value(principal.namespace) ||
                            Redacted.value(live.subject) !== Redacted.value(principal.subject) ||
                            Redacted.value(live.session) !== Redacted.value(principal.session) ||
                            live.expiresAt <= now
                        )
                            return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                        const grant = yield* store.get({ ...trusted }, { ...principal });
                        // A database read can suspend past expiry; authorize only a current committed grant.
                        const after = yield* Clock.currentTimeMillis;
                        if (closed || !grant || grant.expiresAt <= after || live.expiresAt <= after)
                            return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                        return Math.min(grant.expiresAt, live.expiresAt);
                    }
                );
                return Layer.merge(
                    scopedCorrelationLayer(
                        trusted,
                        principal,
                        keys,
                        consent,
                        Config.string('EVENTIVA_ENVIRONMENT').pipe(Config.withDefault('production')),
                        ['development', 'staging']
                    ),
                    Layer.succeed(TelemetryExportAuthority, {
                        /**
                         * Ordinary diagnostic release still requires exact live persistent consent, even without pseudonyms.
                         *
                         * @param candidate - The binding a transport proposes to release under; it must equal the trusted one.
                         * @returns An effect that succeeds only when release is authorized now.
                         * @fails {TelemetrySinkFailure} When the binding differs, the profile is protected, or consent is not live.
                         */
                        authorize: (candidate) =>
                            Effect.gen(
                                /** Enforce host profile and binding independently of a transport's own validation. */ function* () {
                                    // Consent for one host binding cannot authorize a substituted destination or protected profile.
                                    const decoded = yield* Schema.decode(TelemetryExportBinding)(candidate).pipe(
                                        Effect.mapError(
                                            /**
                                             * Hide rejected caller metadata from the release failure.
                                             *
                                             * @returns The bounded `unavailable` failure.
                                             */
                                            () => new TelemetrySinkFailure({ reason: 'unavailable' })
                                        )
                                    );
                                    if (
                                        JSON.stringify(decoded) !== JSON.stringify(trusted) ||
                                        trusted.operation !== 'ordinary' ||
                                        trusted.profile === 'restricted' ||
                                        trusted.profile === 'vault'
                                    )
                                        return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                    yield* consent;
                                }
                            ),
                    })
                );
            }
        )
    );

/**
 * Shared HMAC implementation; wrappers select environment admission and authoritative consent, never crypto variants.
 *
 * @param binding - The trusted host export binding.
 * @param identity - The redacted principal whose pseudonyms are derived.
 * @param keys - The exact-scope key provider.
 * @param consent - The authoritative consent read returning an expiry in epoch milliseconds.
 * @param environmentConfig - The configuration naming the running environment; an omitted value must deny.
 * @param allowed - The environments the calling wrapper admits.
 * @returns A layer providing the correlation issuer and authority, revoked when its scope closes.
 * @fails {TelemetrySinkFailure} When the environment is not admitted, or the binding or identity is invalid.
 */
const scopedCorrelationLayer = (
    binding: TelemetryExportBinding,
    identity: FixtureCorrelationIdentity,
    keys: CorrelationKeys,
    consent: Effect.Effect<number, TelemetrySinkFailure>,
    environmentConfig: Config.Config<string>,
    allowed: ReadonlyArray<CorrelationKeyScope['environment']>
): Layer.Layer<CorrelationIssuer | CorrelationAuthority, TelemetrySinkFailure> =>
    Layer.unwrapScoped(
        Effect.gen(
            /** Keep raw identities and key access within this scoped server integration. */ function* () {
                // An omitted environment must never turn fixture cryptography into an accepting production issuer.
                const environment = yield* environmentConfig.pipe(
                    Effect.mapError(
                        /**
                         * Configuration diagnostics are not safe identity diagnostics.
                         *
                         * @returns The bounded `configuration` failure.
                         */
                        () => new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                if (
                    (environment !== 'test' && environment !== 'development' && environment !== 'staging') ||
                    !allowed.includes(environment)
                )
                    return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                const trusted = yield* Schema.decode(TelemetryExportBinding)(binding).pipe(
                    Effect.mapError(
                        /**
                         * Never expose rejected binding fields through schema diagnostics.
                         *
                         * @returns The bounded `configuration` failure.
                         */
                        () => new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                const principal = yield* Schema.decode(Schema.typeSchema(FixtureCorrelationIdentity))(identity).pipe(
                    Effect.mapError(
                        /**
                         * Raw fixture identity never appears in the public failure channel.
                         *
                         * @returns The bounded `configuration` failure.
                         */
                        () => new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                let closed = false;
                yield* Effect.addFinalizer(
                    /**
                     * Invalidate retained issuer/authority handles after trusted session disposal.
                     *
                     * @returns The effect that marks this scope closed.
                     */
                    () =>
                        Effect.sync(
                            /** Scope closure cannot mint, replay or prolong linkage. */ () => {
                                closed = true;
                            }
                        )
                );
                /** Obtain a fresh consent deadline; policy must include exact destination/purpose release and live protection. */
                const authorize = Effect.gen(
                    /** The immutable host floor cannot be waived by a permissive fixture policy. */ function* () {
                        if (
                            closed ||
                            trusted.operation !== 'ordinary' ||
                            trusted.profile === 'restricted' ||
                            trusted.profile === 'vault'
                        )
                            return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                        const expiry = yield* consent;
                        // Consent can suspend across expiry or scope disposal; both checks need post-consent state.
                        const now = yield* Clock.currentTimeMillis;
                        if (closed || !Number.isSafeInteger(expiry) || expiry <= now || principal.expiresAt <= now)
                            return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                        return Math.min(expiry, principal.expiresAt);
                    }
                );
                /**
                 * Derive with current exact-scope keys and recheck policy after asynchronous key preparation.
                 *
                 * @param optIn - The caller's explicit opt-in; anything other than `true` denies.
                 * @returns Version 1 person and session pseudonyms for the current epoch, with their expiry.
                 * @fails {TelemetrySinkFailure} When opt-in, consent, scope, epoch or key checks fail, or HMAC fails.
                 */
                const issue = (optIn: boolean) =>
                    Effect.gen(
                        /** A token is not authority; every issuance and presentation reruns live fixture consent. */ function* () {
                            if (optIn !== true) return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                            yield* authorize;
                            const epoch = Math.floor((yield* Clock.currentTimeMillis) / correlationEpochMs);
                            const key = yield* keys.get({
                                environment,
                                tenantId: trusted.tenantId,
                                destinationId: trusted.destinationId,
                                purpose: trusted.purpose,
                                epoch,
                            });
                            // Key access may suspend across revocation or rotation; an earlier consent result is insufficient.
                            const expiresAt = Math.min(yield* authorize, (epoch + 1) * correlationEpochMs);
                            if (
                                Math.floor((yield* Clock.currentTimeMillis) / correlationEpochMs) !== epoch ||
                                key.scope.epoch !== epoch ||
                                key.scope.environment !== environment ||
                                key.scope.tenantId !== trusted.tenantId ||
                                key.scope.destinationId !== trusted.destinationId ||
                                key.scope.purpose !== trusted.purpose ||
                                Redacted.value(key.material).byteLength !== 32
                            )
                                return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                            return yield* Effect.try({
                                /**
                                 * Canonical JSON arrays frame opaque UTF-8 strings without delimiter collisions or normalization.
                                 *
                                 * @returns The correlation token; the owned key copy is zeroed before returning.
                                 */
                                // effect-boundary: Node HMAC can throw; raw preimages and owned key copies never leave this integration.
                                try: () => {
                                    const ownedKey = Uint8Array.from(Redacted.value(key.material));
                                    const scope = [
                                        'eventiva.correlation.v1',
                                        environment,
                                        trusted.tenantId,
                                        trusted.destinationId,
                                        trusted.purpose,
                                        epoch,
                                    ];
                                    /**
                                     * Separate session/person domains; raw identifiers are neither returned nor logged.
                                     *
                                     * @param kind - The pseudonym domain; only `session` includes the session identifier.
                                     * @returns The hexadecimal HMAC-SHA256 digest for that domain.
                                     */
                                    const hash = (kind: 'person' | 'session') =>
                                        createHmac('sha256', ownedKey)
                                            .update(
                                                JSON.stringify([
                                                    ...scope,
                                                    kind,
                                                    Redacted.value(principal.namespace),
                                                    Redacted.value(principal.subject),
                                                    ...(kind === 'session' ? [Redacted.value(principal.session)] : []),
                                                ]),
                                                'utf8'
                                            )
                                            .digest('hex');
                                    // effect-boundary: Release our HMAC key copy even when the Node crypto primitive throws.
                                    try {
                                        return {
                                            version: 1,
                                            person: hash('person'),
                                            session: hash('session'),
                                            epoch,
                                            expiresAt,
                                        } satisfies TelemetryCorrelation;
                                    } finally {
                                        // Clear only our copy, never the injected owner's buffer; JS strings/crypto copies cannot be proven zeroized.
                                        ownedKey.fill(0);
                                    }
                                },
                                /**
                                 * Discard crypto/key details instead of retaining a vendor cause.
                                 *
                                 * @returns The bounded `unavailable` failure.
                                 */
                                catch: () => new TelemetrySinkFailure({ reason: 'unavailable' }),
                            });
                        }
                    );
                return Layer.merge(
                    Layer.succeed(CorrelationIssuer, { issue }),
                    Layer.succeed(CorrelationAuthority, {
                        /**
                         * Recompute from this scope's trusted fixture identity; possession never authorizes another caller.
                         *
                         * @param candidate - The binding proposed for release; every field must equal the trusted one.
                         * @param input - The presented correlation token, re-derived and compared before release.
                         * @returns An effect that succeeds only when the token matches a fresh derivation.
                         * @fails {TelemetrySinkFailure} When the binding or token differs, has expired, or issuance is denied.
                         */
                        authorize: (candidate, input) =>
                            Effect.gen(
                                /** Validate every binding field and token before any provider can serialize correlation. */ function* () {
                                    const decoded = yield* Schema.decode(TelemetryExportBinding)(candidate).pipe(
                                        Effect.mapError(
                                            /**
                                             * Caller-selected provenance cannot enter public errors.
                                             *
                                             * @returns The bounded `unavailable` failure.
                                             */
                                            () => new TelemetrySinkFailure({ reason: 'unavailable' })
                                        )
                                    );
                                    if (
                                        decoded.tenantId !== trusted.tenantId ||
                                        decoded.destinationId !== trusted.destinationId ||
                                        decoded.purpose !== trusted.purpose ||
                                        decoded.moduleId !== trusted.moduleId ||
                                        decoded.moduleVersion !== trusted.moduleVersion ||
                                        decoded.generation !== trusted.generation ||
                                        decoded.profile !== trusted.profile ||
                                        decoded.operation !== trusted.operation
                                    )
                                        return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                    const token = yield* Schema.decode(TelemetryCorrelation)(input).pipe(
                                        Effect.mapError(
                                            /**
                                             * No input or schema cause crosses the failure boundary.
                                             *
                                             * @returns The bounded `unavailable` failure.
                                             */
                                            () => new TelemetrySinkFailure({ reason: 'unavailable' })
                                        )
                                    );
                                    // Re-derivation binds possession to this trusted principal without a stored reverse-ID map.
                                    const current = yield* issue(true);
                                    const now = yield* Clock.currentTimeMillis;
                                    if (
                                        token.person !== current.person ||
                                        token.session !== current.session ||
                                        token.epoch !== current.epoch ||
                                        token.expiresAt <= now ||
                                        token.expiresAt > current.expiresAt
                                    )
                                        return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                }
                            ),
                    })
                );
            }
        )
    );
