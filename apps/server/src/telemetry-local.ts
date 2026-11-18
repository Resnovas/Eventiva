/**
 * @file apps/server/src/telemetry-local.ts
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

import { fileURLToPath } from 'node:url';
import * as FileSystem from '@effect/platform/FileSystem';
import { SqlClient } from '@effect/sql';
import { IdentityStore } from '@eventiva/contracts/identity';
import { SubjectId } from '@eventiva/contracts/ids';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { TelemetryConsent, type TelemetryExportBinding } from '@eventiva/contracts/telemetry-export';
import { TelemetrySinkFailure } from '@eventiva/contracts/observability';
import { fromConfig } from '@eventiva/integrations.posthog.server/flags';
import { layer as flagLayer } from '@eventiva/integrations.openfeature.server/flags';
import { openOidcSession } from '@eventiva/integrations.oidc/session';
import { makeOidcVerifier, oidcVerifierSettings } from '@eventiva/integrations.oidc/token';
import { identityStore } from '@eventiva/integrations.sql/identity';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { localFile } from '@eventiva/integrations.sql/sqlite';
import { telemetryConsentStore } from '@eventiva/integrations.sql/telemetry-consent';
import { authenticateTokenSession, identitySecurity } from '@eventiva/runtime/identity';
import { TelemetryControl, telemetryLayer } from '@eventiva/runtime/telemetry';
import { Clock, Config, Context, Effect, Layer, Option, Redacted, Schema } from 'effect';
import { oidcStandardsVerifier } from './identity-oidc.ts';
import {
    requestTelemetryLayer,
    telemetryTenants,
    updateTelemetryConsent,
    type TelemetrySession,
} from './telemetry-live.ts';

/** Finite local commands: status is read-only; grants/revocations are deliberate authenticated operator actions. */
export const telemetryCommand = Config.literal(
    'onboard',
    'status',
    'grant',
    'revoke',
    'probe'
)('TELEMETRY_COMMAND').pipe(Config.withDefault('status'));

/**
 * Persistent single-machine dev/staging composition. Supply a real verifier-backed session Effect, never a fixture.
 * Each environment has a distinct private SQLite database and trusted tenant route. No HTTP listener is exposed.
 * Identity provisioning belongs to the OIDC onboarding command; absent users/sessions/consent always deny.
 */
export const localTelemetryProgram = <E, R>(currentSession: Effect.Effect<TelemetrySession, E, R>) =>
    Effect.scoped(
        Effect.gen(
            /** Resolve deployment and private storage before authenticating; never derive routing from the token or input headers. */ function* () {
                const environment = yield* Config.literal('development', 'staging')('EVENTIVA_ENVIRONMENT');
                const command = yield* telemetryCommand;
                const binding: TelemetryExportBinding = {
                    ...telemetryTenants[environment],
                    moduleId: 'platform.telemetry',
                    moduleVersion: '1.0.0',
                    generation: 1,
                    profile: 'baseline',
                    operation: 'ordinary',
                    purpose: 'diagnostics',
                };
                const root = yield* Config.redacted('TELEMETRY_STATE_DIRECTORY').pipe(
                    Config.withDefault(
                        Redacted.make(fileURLToPath(new URL('../../../.data/telemetry', import.meta.url)))
                    )
                );
                const directory = `${Redacted.value(root)}/${environment}`;
                const fs = yield* FileSystem.FileSystem;
                yield* fs.makeDirectory(directory, { recursive: true, mode: 0o700 });
                const stat = yield* fs.stat(directory);
                if (
                    stat.type !== 'Directory' ||
                    (stat.mode & 0o077) !== 0 ||
                    (yield* fs.realPath(directory)) !== directory
                )
                    return yield* new TelemetrySinkFailure({ reason: 'configuration' });
                const database = localFile(Redacted.make(`${directory}/tenant.sqlite`));
                const migrations = yield* load(
                    fileURLToPath(new URL('../../../storage/migrations/sqlite', import.meta.url))
                );
                const stores = Layer.merge(identityStore, telemetryConsentStore).pipe(
                    Layer.provideMerge(
                        Layer.effectDiscard(migrate('sqlite', migrations)).pipe(Layer.provideMerge(database))
                    ),
                    Layer.provideMerge(Layer.succeed(CurrentTenant, { id: binding.tenantId }))
                );
                const context = yield* Layer.build(identitySecurity.pipe(Layer.provideMerge(stores)));
                const authenticated = currentSession.pipe(Effect.provide(context));
                const session = yield* authenticated;
                const principal = {
                    namespace: Redacted.make(session.issuer),
                    subject: Redacted.make(session.caller.subject),
                    session: Redacted.make(session.caller.session),
                    expiresAt: session.sessionExpiresAt,
                };
                const consent = Context.get(context, TelemetryConsent);
                if (command === 'grant' || command === 'revoke') {
                    const revision = yield* Config.option(Config.integer('TELEMETRY_CONSENT_REVISION'));
                    return {
                        command,
                        environment,
                        consent:
                            (yield* updateTelemetryConsent(
                                binding,
                                authenticated,
                                command === 'grant',
                                Option.getOrNull(revision)
                            ).pipe(Effect.provide(context))) ?? null,
                    };
                }
                if (command === 'status' || command === 'onboard')
                    return { command, environment, consent: (yield* consent.get(binding, principal)) ?? null };
                // Only the explicit probe may construct a network provider; status/consent need neither export credential.
                const remote = yield* fromConfig;
                if (Option.isNone(remote)) return yield* new TelemetrySinkFailure({ reason: 'configuration' });
                const flags = flagLayer([{ source: 'remote', provider: remote.value }]);
                const policy = { messages: { 'telemetry.probe': 'Telemetry connectivity probe.' } };
                const pipeline = telemetryLayer({ ...policy, attributes: {} }).pipe(
                    Layer.provide(requestTelemetryLayer(binding, authenticated, true, policy)),
                    Layer.provide(flags)
                );
                const exported = yield* Effect.gen(
                    /** Capture only a random trace identifier and bounded health; HTTP acceptance still requires a PostHog query. */ function* () {
                        // Flush the scoped sink before reading health so this result includes the probe's delivery attempt.
                        const traceId = yield* Effect.gen(
                            /** Both records pass through the same central minimizer and request-scoped release gates. */ function* () {
                                yield* Effect.logInfo('telemetry.probe');
                                return (yield* Effect.currentSpan).traceId;
                            }
                        ).pipe(Effect.withSpan('telemetry.probe'));
                        const control = yield* TelemetryControl;
                        yield* control.flush;
                        return { traceId, health: yield* control.health };
                    }
                ).pipe(Effect.provide(pipeline.pipe(Layer.provideMerge(Layer.succeedContext(context)))));
                return { command, environment, ...exported };
            }
        )
    );

/**
 * Executable local composition using the approved OIDC verifier, canonical SQL links and live session checks.
 * Onboarding is an explicit operator action, limited to these private non-production databases. It never
 * reactivates a revoked principal/membership/session, replaces a conflicting link or grants telemetry consent.
 */
export const localOidcTelemetryProgram = Effect.gen(
    /** Construct one verifier per command so repeated release checks share discovery/JWKS ownership, not authority. */ function* () {
        // Share verifier resources within this command while leaving session authentication lazy for each release check.
        yield* Config.literal('development', 'staging')('EVENTIVA_ENVIRONMENT');
        const command = yield* telemetryCommand;
        const settings = yield* oidcVerifierSettings;
        const verifier = yield* makeOidcVerifier(settings);
        const token = yield* Config.redacted('TELEMETRY_ACCESS_TOKEN');
        const expected = { issuer: settings.issuer, audience: settings.audience, scopes: ['eventiva.invoke'] };
        const authenticated = authenticateTokenSession(token, expected);
        const current = Effect.gen(
            /** Even onboarding verifies token provenance before writing identity; ordinary commands never provision anything. */ function* () {
                // Only the explicit onboarding command may provision identity; every command still authenticates afterward.
                if (command === 'onboard') {
                    const claims = yield* verifier.verify(token);
                    if (!claims.scopes.includes('eventiva.invoke'))
                        return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                    const canonical = yield* Config.redacted('TELEMETRY_CANONICAL_SUBJECT');
                    const subject = yield* Schema.decodeUnknown(SubjectId)(Redacted.value(canonical));
                    const store = yield* IdentityStore;
                    const sql = yield* SqlClient.SqlClient;
                    yield* sql.withTransaction(
                        Effect.gen(
                            /** Provision atomically; stale links, disabled membership and closed sessions must roll back all writes. */ function* () {
                                yield* store.lock;
                                const principal = yield* store.get('principal', subject);
                                const membership = yield* store.get('membership', subject);
                                if (
                                    (principal && (!principal.value.active || principal.value.kind !== 'human')) ||
                                    (membership && !membership.value.active)
                                )
                                    return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                if (!principal)
                                    yield* store.put('principal', { id: subject, active: true, kind: 'human' }, null);
                                if (!membership)
                                    yield* store.put('membership', { id: subject, active: true, roles: [] }, null);
                                yield* store.link({ issuer: claims.issuer, subject: claims.subject }, subject);
                                // This is a server policy deadline, not an untrusted token claim or a consent duration.
                                yield* openOidcSession(claims, (yield* Clock.currentTimeMillis) + 3_600_000);
                            }
                        )
                    );
                }
                return yield* authenticated;
            }
        );
        return yield* localTelemetryProgram(current).pipe(Effect.provide(oidcStandardsVerifier(verifier)));
    }
);
