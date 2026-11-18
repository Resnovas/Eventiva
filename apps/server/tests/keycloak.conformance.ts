/**
 * @file apps/server/tests/keycloak.conformance.ts
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

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { describe, expect, it } from '@effect/vitest';
import { IdentityStore } from '@eventiva/contracts/identity';
import { SubjectId, TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { closeOidcSession, openOidcSession } from '@eventiva/integrations.oidc/session';
import { makeOidcVerifier } from '@eventiva/integrations.oidc/token';
import { identityStore } from '@eventiva/integrations.sql/identity';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { memory } from '@eventiva/integrations.sql/sqlite';
import { authenticateTokenSession, identitySecurity } from '@eventiva/runtime/identity';
import { Clock, Context, Effect, Layer, Redacted } from 'effect';
import { oidcStandardsVerifier } from '../src/identity-oidc.ts';

/*
 * Live conformance against the pinned Keycloak 26.8.2 image and the synthetic realm in
 * tests/integrations/oidc/fixtures/realm.json. Run with `pnpm nx run @eventiva/server:keycloak-conformance` after
 * starting the fixture as docs/identity-oidc.md describes. Missing OIDC_TEST_ISSUER fails rather than skips.
 */
const issuer = process.env['OIDC_TEST_ISSUER'] ?? '';
const realm = JSON.parse(
    readFileSync(
        fileURLToPath(new URL('../../../tests/integrations/oidc/fixtures/realm.json', import.meta.url)),
        'utf8'
    )
) as {
    clients: ReadonlyArray<{ clientId: string; secret: string }>;
    users: ReadonlyArray<{ username: string; credentials: ReadonlyArray<{ value: string }> }>;
};
const client = realm.clients[0]!;
const user = realm.users[0]!;
const tenantA = TenantId.make('019a95c0-0000-7000-8000-0000000000a1');
const tenantB = TenantId.make('019a95c0-0000-7000-8000-0000000000b1');
const human = SubjectId.make('019a95c0-0000-7000-8000-000000000201');
const policy = { issuer, audience: 'eventiva-api', scopes: ['eventiva.invoke'] };

/** Request a token from the fixture realm with the given grant parameters. */
const token = (grant: Record<string, string>) =>
    Effect.tryPromise(
        /** Call the realm token endpoint over loopback. */ () =>
            fetch(`${issuer}/protocol/openid-connect/token`, {
                method: 'POST',
                body: new URLSearchParams({ client_id: client.clientId, client_secret: client.secret, ...grant }),
            })
    ).pipe(
        Effect.flatMap(/** Read the JSON body. */ (response) => Effect.promise(/** Parse it. */ () => response.json())),
        Effect.map(/** Keep only the tokens. */ (body) => body as { access_token: string; refresh_token?: string })
    );

/** A fresh migrated in-memory SQLite tenant database with the real SQL IdentityStore. */
const tenantDatabase = (tenant: TenantId) =>
    Effect.gen(
        /** Migrate, then capture the store for this tenant only. */ function* () {
            const sql = Context.get(yield* Layer.build(memory()), SqlClient.SqlClient);
            yield* migrate(
                'sqlite',
                yield* load(fileURLToPath(new URL('../../../storage/migrations/sqlite', import.meta.url)))
            ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            const routed = Layer.succeed(CurrentTenant, { id: tenant });
            const store = identityStore.pipe(
                Layer.provide(routed),
                Layer.provide(Layer.succeed(SqlClient.SqlClient, sql))
            );
            return Layer.mergeAll(routed, store, identitySecurity.pipe(Layer.provide(Layer.merge(routed, store))));
        }
    );

describe('Keycloak 26.8.2 OIDC conformance', /** Real tokens through the adapter, runtime policy and SQL. */ () => {
    it.scopedLive(
        'authenticates only provisioned, live, tenant-linked sessions and denies forged, foreign and revoked proof',
        /** Walk one login from token issue to revocation. */ () =>
            Effect.gen(
                /** Each step asserts the observable authentication outcome. */ function* () {
                    expect(issuer, 'start the fixture and set OIDC_TEST_ISSUER').toMatch(
                        /^http:\/\/127\.0\.0\.1:\d+\/realms\//
                    );
                    const verifier = yield* makeOidcVerifier({
                        issuer,
                        audience: 'eventiva-api',
                        clients: [client.clientId],
                        algorithms: ['ES256'],
                        allowInsecureLoopback: true,
                    });
                    const seam = oidcStandardsVerifier(verifier);
                    const a = yield* tenantDatabase(tenantA);
                    const b = yield* tenantDatabase(tenantB);
                    /** Authenticate a raw token against one tenant's live identity state. */
                    const authenticate = (value: string, tenant = a) =>
                        Effect.either(
                            authenticateTokenSession(Redacted.make(value), policy).pipe(
                                Effect.provide(Layer.merge(tenant, seam))
                            )
                        );
                    /** Run trusted provisioning in one tenant. */
                    const inTenant = <A, E>(effect: Effect.Effect<A, E, IdentityStore>, tenant = a) =>
                        Effect.provide(effect, tenant);

                    const login = yield* token({
                        grant_type: 'password',
                        username: user.username,
                        password: user.credentials[0]!.value,
                    });
                    const claims = yield* verifier.verify(Redacted.make(login.access_token));
                    expect(claims).toMatchObject({ issuer, audiences: ['eventiva-api'], clientId: client.clientId });
                    expect(claims.scopes).toContain('eventiva.invoke');

                    // A verified token alone grants nothing: no link, no principal, no session.
                    expect(yield* authenticate(login.access_token)).toMatchObject({ _tag: 'Left' });
                    yield* inTenant(
                        Effect.gen(
                            /** Trusted bootstrap of one human member and its exact federated link. */ function* () {
                                const store = yield* IdentityStore;
                                yield* store.put('principal', { id: human, kind: 'human', active: true }, null);
                                yield* store.put('membership', { id: human, active: true, roles: [] }, null);
                                yield* store.link({ issuer, subject: claims.subject }, human);
                            }
                        )
                    );
                    // Linked but no provisioned session: a copied or guessed SessionId has nothing to match.
                    expect(yield* authenticate(login.access_token)).toMatchObject({ _tag: 'Left' });
                    const now = yield* Clock.currentTimeMillis;
                    const session = yield* inTenant(openOidcSession(claims, now + 3_600_000));
                    expect(session).toBe(claims.session);
                    const accepted = yield* authenticate(login.access_token);
                    expect(accepted).toMatchObject({
                        _tag: 'Right',
                        right: {
                            caller: { subject: human, session, tenant: tenantA, kind: 'human' },
                            issuer,
                            sessionExpiresAt: now + 3_600_000,
                        },
                    });

                    // Forged signature, client-credential token without a provider session, and another tenant all fail.
                    const [h, p, s] = login.access_token.split('.');
                    const forged = `${h}.${p}.${s!.startsWith('A') ? `B${s!.slice(1)}` : `A${s!.slice(1)}`}`;
                    // The runtime deliberately collapses verifier refusals; the adapter reports why.
                    expect(yield* authenticate(forged)).toMatchObject({ left: { reason: 'identity-denied' } });
                    expect(yield* Effect.flip(verifier.verify(Redacted.make(forged)))).toMatchObject({
                        reason: 'invalid',
                    });
                    const service = yield* token({ grant_type: 'client_credentials' });
                    expect(yield* authenticate(service.access_token)).toMatchObject({ _tag: 'Left' });
                    expect(yield* Effect.flip(verifier.verify(Redacted.make(service.access_token)))).toMatchObject({
                        reason: 'missing-session',
                    });
                    expect(yield* authenticate(login.access_token, b)).toMatchObject({ _tag: 'Left' });

                    // Revoking the Eventiva session denies the still-unexpired provider token immediately.
                    yield* inTenant(closeOidcSession(session));
                    expect(yield* authenticate(login.access_token)).toMatchObject({ _tag: 'Left' });

                    // A new provider login gets a new session; deactivating membership still denies it.
                    const relogin = yield* token({
                        grant_type: 'password',
                        username: user.username,
                        password: user.credentials[0]!.value,
                    });
                    const reclaims = yield* verifier.verify(Redacted.make(relogin.access_token));
                    expect(reclaims.session).not.toBe(session);
                    yield* inTenant(openOidcSession(reclaims, now + 3_600_000));
                    expect(yield* authenticate(relogin.access_token)).toMatchObject({ _tag: 'Right' });
                    yield* inTenant(
                        Effect.gen(
                            /** Deprovision membership through the trusted store. */ function* () {
                                const store = yield* IdentityStore;
                                const membership = (yield* store.get('membership', human))!;
                                yield* store.put(
                                    'membership',
                                    { ...membership.value, active: false },
                                    membership.version
                                );
                            }
                        )
                    );
                    expect(yield* authenticate(relogin.access_token)).toMatchObject({ _tag: 'Left' });

                    // A verifier configured for another audience refuses the same real token.
                    const otherAudience = yield* makeOidcVerifier({
                        issuer,
                        audience: 'other-api',
                        clients: [client.clientId],
                        algorithms: ['ES256'],
                        allowInsecureLoopback: true,
                    });
                    expect(yield* Effect.flip(otherAudience.verify(Redacted.make(relogin.access_token)))).toMatchObject(
                        {
                            reason: 'invalid',
                        }
                    );
                }
            )
    );
});
