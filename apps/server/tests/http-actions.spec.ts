/**
 * @file apps/server/tests/http-actions.spec.ts
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

import { createHash, generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as FetchHttpClient from '@effect/platform/FetchHttpClient';
import * as HttpBody from '@effect/platform/HttpBody';
import * as HttpClient from '@effect/platform/HttpClient';
import * as HttpClientRequest from '@effect/platform/HttpClientRequest';
import * as NodeSocketServer from '@effect/platform-node/NodeSocketServer';
import { SqlClient } from '@effect/sql';
import { describe, expect, it } from '@effect/vitest';
import { define } from '@eventiva/contracts/action';
import { Authorizer } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import { Flags } from '@eventiva/contracts/flags';
import { IdentityStore, RoleId, organizationGet } from '@eventiva/contracts/identity';
import { SubjectId, TenantId } from '@eventiva/contracts/ids';
import { ActionInventory } from '@eventiva/contracts/inventory';
import { CurrentTenant, EpochMillis, RoutingDenied, Storage } from '@eventiva/contracts/storage';
import { identityStore } from '@eventiva/integrations.sql/identity';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { sqlRouter } from '@eventiva/integrations.sql/router';
import { storage } from '@eventiva/integrations.sql/storage';
import { makeOidcVerifier, oidcSessionId } from '@eventiva/integrations.oidc/token';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { identitySecurity } from '@eventiva/runtime/identity';
import { Approvals, InputDigest, InvocationDenied } from '@eventiva/runtime/invocation';
import { durable } from '@eventiva/runtime/storage';
import { ConfigProvider, Context, Effect, Exit, Layer, Logger, Ref, Schedule, Schema } from 'effect';
import { backend } from '../src/backend.ts';
import { DeploymentProfile } from '../src/cluster-profile.ts';
import { ClusterActions } from '../src/cluster-actions.ts';
import { ClusterStatus } from '../src/cluster.ts';
import { httpActionsFlag } from '../src/http-actions.ts';
import { serveLocalHttp } from '../src/http-entry.ts';
import { oidcStandardsVerifier } from '../src/identity-oidc.ts';

/** Stable test-only UUIDs keep canonical identity visibly different from provider subjects. */
const id = (value: number) => `019b0000-0000-7000-8000-${value.toString(16).padStart(12, '0')}`;
const tenant = TenantId.make(id(401));
const subject = SubjectId.make(id(402));
const role = RoleId.make(id(403));
const issuer = 'https://http-issuer.example.test/realms/eventiva';
const policy = { issuer, audience: 'eventiva-http', scopes: ['eventiva.invoke'] };
const session = oidcSessionId(issuer, 'provider-http-session');
const Input = Schema.Struct({ value: Schema.Int });
const common = {
    version: 3,
    description: 'Synthetic registered HTTP conformance action.',
    input: Input,
    output: Schema.Struct({ value: Schema.Number }),
    permission: 'fixture.invoke',
    sideEffect: 'read',
    offline: 'online-only',
} as const;
const write = define('fixture.write', { ...common, sideEffect: 'write' });
const read = define('fixture.read', common);
const hidden = define('fixture.hidden', { ...common, permission: 'fixture.admin' });
const disabled = define('fixture.disabled', { ...common, flag: 'fixture.disabled-enabled' });
const sensitive = define('fixture.secret', { ...common, sensitive: true, description: 'PRIVATE_METADATA_CANARY' });
const registered = [write, read, hidden, disabled, sensitive];
const disabledFlag = {
    key: 'fixture.disabled-enabled',
    description: 'Conformance gate.',
    owner: 'test',
    safeDefault: false,
};

/** Real signed-token, persistent tenant identity and real PostgreSQL Cluster composition; no accepting identity fixture. */
const fixture = Effect.gen(
    /** Allocate only owned synthetic state and tear it down after listeners, runners and SQL clients close. */ function* () {
        // A private database and real runner keep replay/revocation assertions independent of other tests' authority.
        const target = new URL(
            process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test'
        );
        expect(['localhost', '127.0.0.1', '[::1]']).toContain(target.hostname);
        expect(target.pathname).toBe('/eventiva_test');
        /** Keep every SQL connection's credential in a scoped configuration provider, not logs. */
        const pg = (url: string) =>
            client.pipe(
                Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]]))))
            );
        const admin = Context.get(yield* Layer.build(pg(target.toString())), SqlClient.SqlClient);
        const database = `http_test_${randomUUID().replaceAll('-', '')}`;
        yield* admin`CREATE DATABASE ${admin(database)} TEMPLATE template0`;
        yield* Effect.addFinalizer(
            /** Terminate only the fixture role's sessions before plain DROP; do not terminate roleless server processes. */ () =>
                admin`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ${database} AND usename = current_user AND pid <> pg_backend_pid()`.pipe(
                    Effect.zipRight(admin`DROP DATABASE ${admin(database)}`),
                    Effect.orDie
                )
        );
        target.pathname = `/${database}`;
        const connection = yield* Layer.build(pg(target.toString()));
        const sql = Context.get(connection, SqlClient.SqlClient);
        yield* migrate(
            'postgres',
            yield* load(fileURLToPath(new URL('../../../storage/migrations/postgres', import.meta.url)))
        ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
        const routing = Layer.succeed(CurrentTenant, { id: tenant });
        const data = Layer.mergeAll(storage('postgres'), identityStore).pipe(
            Layer.provide(routing),
            Layer.provide(Layer.succeedContext(connection))
        );
        const state = yield* Layer.build(data);
        const identity = Context.get(state, IdentityStore);
        const store = Context.get(state, Storage);
        const expiresAt = EpochMillis.make(Date.now() + 300000);
        yield* identity.put('principal', { id: subject, kind: 'human', active: true }, null);
        yield* identity.put('session', { id: session, subject, active: true, expiresAt, delegation: null }, null);
        yield* identity.put(
            'role',
            { id: role, name: 'HTTP fixture', grants: [{ permission: 'fixture.invoke', resources: ['organization'] }] },
            null
        );
        yield* identity.put('membership', { id: subject, active: true, roles: [role] }, null);
        yield* identity.link({ issuer, subject: 'external-subject-NOT-canonical' }, subject);
        const security = yield* Layer.build(
            identitySecurity.pipe(Layer.provide(routing), Layer.provide(Layer.succeedContext(state)))
        );
        const live = Context.get(security, Authorizer);
        const enabled = yield* Ref.make(true);
        const fault = { flags: false };
        const flags = Layer.succeed(Flags, {
            /** Enable only this local HTTP fixture capability; undeclared/disabled flags retain safe defaults. */
            evaluate: (flag) =>
                fault.flags
                    ? Effect.dieMessage('RAW_INPUT_CANARY')
                    : Ref.get(enabled).pipe(
                          Effect.map(
                              /** Preserve module flags independently of the transport flag. */ (on) => ({
                                  flag: flag.key,
                                  value: flag.key === httpActionsFlag.key ? on : flag.safeDefault,
                                  fallback: false,
                                  reason: 'TEST',
                              })
                          )
                      ),
        });
        const dependencies = Layer.mergeAll(
            Layer.succeedContext(security),
            flags,
            Layer.succeed(Authorizer, {
                canInvoke: live.canInvoke,
                /** The synthetic module owns exactly an organization target; delegate its current grant check to live SQL identity. */
                check: (caller, spec, input) =>
                    registered.some(
                        /** Accept only definitions this fixture actually registers. */ (entry) =>
                            entry.name === spec.name
                    ) && Schema.is(Input)(input)
                        ? live.check(caller, { ...spec, name: organizationGet.name }, input)
                        : Effect.fail(new Forbidden({ action: spec.name, reason: 'resource-policy-required' })),
            }),
            Layer.succeed(InputDigest, {
                /** Exercise real canonical SHA-256 binding in the existing durable executor. */ digest: (value) =>
                    Effect.sync(
                        /** No input text is retained by the hash service. */ () =>
                            createHash('sha256').update(value).digest('hex')
                    ),
            }),
            Layer.succeed(Approvals, {
                /** No synthetic approval can satisfy a protected operation. */ get: () =>
                    Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'approval-unavailable' })),
                /** Keep accepting use unavailable under the same denying fixture contract. */ use: () =>
                    Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'approval-unavailable' })),
                /** No approved read can acquire a transaction through this denying fixture. */ transaction: () =>
                    Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'approval-unavailable' })),
            })
        );
        /** Reuse this exact module initializer for discovery and for the backend's independently routed execution host. */
        const initialize = (host: ActionHost['Type']) =>
            Effect.gen(
                /** Capture only the router-selected Storage, not a transport-selected client or caller. */ function* () {
                    // Discovery and execution register the same definitions but must obtain their own trusted tenant route.
                    const bound = yield* CurrentTenant;
                    expect(bound.id).toBe(tenant);
                    const routed = yield* Storage;
                    yield* host.register({
                        manifest: {
                            format: 1,
                            id: 'fixture',
                            version: '1.0.0',
                            description: 'HTTP fixture.',
                            actions: registered.map(
                                /** Derive discovery from actual registered bindings. */ (action) => action.name
                            ),
                            flags: [disabledFlag],
                        },
                        actions: registered.map(
                            /** The host still decodes the declared input and writes its durable receipt/integrity record. */ (
                                spec
                            ) =>
                                implement(
                                    spec,
                                    /** Prove the mutation is not executed twice on replay, and keep read output asymmetric. */ (
                                        input
                                    ) =>
                                        spec.name === write.name
                                            ? routed
                                                  .create({
                                                      id: id(404),
                                                      state: 'pending',
                                                      version: 0,
                                                      payload: input.value,
                                                      leaseUntil: null,
                                                  })
                                                  .pipe(Effect.as({ value: input.value * 2 }), Effect.orDie)
                                            : Effect.succeed({ value: input.value + 3 })
                                )
                        ),
                    });
                }
            );
        const hostContext = yield* Layer.build(
            ActionHostLive.pipe(
                Layer.provide(durable),
                Layer.provide(dependencies),
                Layer.provide(routing),
                Layer.provide(Layer.succeedContext(state))
            )
        );
        yield* initialize(Context.get(hostContext, ActionHost)).pipe(
            Effect.provide(Layer.merge(routing, Layer.succeedContext(state)))
        );
        const socket = yield* NodeSocketServer.make({ host: '127.0.0.1', port: 0 });
        const profile = yield* Schema.decodeUnknown(DeploymentProfile)({
            edition: 'community',
            shards: 8,
            assignmentRefreshMs: 25,
            messagePollMs: 25,
            replyPollMs: 25,
        });
        const captured: string[] = [];
        const logger = Logger.make(
            /** Capture structured logger inputs to independently reject token and raw-input canaries. */ (options) =>
                captured.push(
                    JSON.stringify({
                        message: options.message,
                        cause: options.cause,
                        annotations: [...options.annotations],
                    })
                )
        );
        const runner = yield* Layer.build(
            backend(profile, initialize, Effect.void, dependencies, undefined, socket).pipe(
                Layer.provide(
                    sqlRouter(
                        'postgres',
                        /** A second tenant is not another name for this database. */ (candidate) =>
                            candidate === tenant
                                ? Effect.succeed(sql)
                                : Effect.fail(new RoutingDenied({ reason: 'unknown tenant' })),
                        /** This synthetic fixture owns only its explicitly provisioned trusted route. */ (
                            candidate
                        ) =>
                            candidate === tenant
                                ? Effect.void
                                : Effect.fail(new RoutingDenied({ reason: 'unknown tenant' }))
                    )
                ),
                Layer.provide(dependencies),
                Layer.provide(Layer.succeedContext(connection))
            )
        ).pipe(Effect.provide(Logger.replace(Logger.defaultLogger, logger)));
        const status = Context.get(runner, ClusterStatus);
        yield* status.snapshot.pipe(
            Effect.repeat({
                schedule: Schedule.spaced('25 millis'),
                /** Dispatch only after real SQL shard ownership. */ until: (value) => value.status === 'healthy',
            }),
            Effect.timeout('10 seconds')
        );
        expect(Context.getOption(runner, ActionHost)._tag).toBe('None');
        const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
        const now = Math.floor(Date.now() / 1000);
        /** Mint real signed access credentials for negative claims as well as the allowed identity. */
        const mint = (overrides: object = {}) => {
            // Sign overridden claims too, so negative cases test claim enforcement rather than merely a broken signature.
            const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'at+jwt', kid: 'http-test' })).toString(
                'base64url'
            );
            const claims = Buffer.from(
                JSON.stringify({
                    iss: issuer,
                    sub: 'external-subject-NOT-canonical',
                    aud: policy.audience,
                    scope: 'eventiva.invoke',
                    sid: 'provider-http-session',
                    client_id: 'http-fixture',
                    iat: now - 2,
                    nbf: now - 2,
                    exp: now + 300,
                    jti: 'http-proof',
                    ...overrides,
                })
            ).toString('base64url');
            const unsigned = `${header}.${claims}`;
            return `${unsigned}.${sign('RSA-SHA256', Buffer.from(unsigned), privateKey).toString('base64url')}`;
        };
        const verifier = yield* makeOidcVerifier(
            {
                issuer,
                audience: policy.audience,
                clients: ['http-fixture'],
                algorithms: ['RS256'],
                allowInsecureLoopback: false,
            },
            {
                /** Serve only public discovery/JWKS. Signature verification remains the actual OIDC adapter, never an accepting stub. */ fetch: (
                    url
                ) =>
                    Promise.resolve(
                        Response.json(
                            url.endsWith('/.well-known/openid-configuration')
                                ? { issuer, jwks_uri: `${issuer}/jwks` }
                                : {
                                      keys: [
                                          {
                                              ...publicKey.export({ format: 'jwk' }),
                                              kid: 'http-test',
                                              alg: 'RS256',
                                              use: 'sig',
                                          },
                                      ],
                                  }
                        )
                    ),
            }
        );
        const services = Layer.mergeAll(
            dependencies,
            routing,
            Layer.succeedContext(state),
            oidcStandardsVerifier(verifier),
            Layer.succeed(ActionInventory, Context.get(hostContext, ActionInventory)),
            Layer.succeed(ClusterActions, Context.get(runner, ClusterActions))
        );
        /** Isolate listener settings from ambient dev credentials and prohibit production composition. */
        const config = (environment: string, port = '0') =>
            ConfigProvider.fromMap(
                new Map([
                    ['EVENTIVA_ENVIRONMENT', environment],
                    ['HTTP_PORT', port],
                ])
            );
        const address = yield* serveLocalHttp(policy).pipe(
            Effect.provide(services),
            Effect.withConfigProvider(config('test')),
            Effect.provide(Logger.replace(Logger.defaultLogger, logger))
        );
        expect(address._tag).toBe('TcpAddress');
        const base = address._tag === 'TcpAddress' ? `http://127.0.0.1:${address.port}` : '';
        const http = yield* HttpClient.HttpClient;
        const token = mint();
        /** Make a real loopback request and fully consume its public response before releasing resources. */
        const request = (
            path: string,
            options: {
                method?: 'GET' | 'POST';
                authorization?: string;
                body?: string;
                contentType?: string;
                tenantHeader?: string;
            } = {}
        ) =>
            http
                .execute(
                    HttpClientRequest.make(options.method ?? 'POST')(`${base}${path}`).pipe(
                        HttpClientRequest.setHeaders({
                            authorization: options.authorization ?? `Bearer ${token}`,
                            'content-type': options.contentType ?? 'application/json',
                            'x-eventiva-tenant': options.tenantHeader ?? '',
                        }),
                        HttpClientRequest.setBody(
                            options.method === 'GET'
                                ? HttpBody.empty
                                : HttpBody.text(
                                      options.body ??
                                          JSON.stringify({ input: { value: 21 }, idempotencyKey: 'http-write' }),
                                      options.contentType ?? 'application/json'
                                  )
                        )
                    )
                )
                .pipe(
                    Effect.flatMap(
                        /** Consume error bodies too, so hidden diagnostics cannot escape assertion. */ (reply) =>
                            reply.text.pipe(
                                Effect.map(
                                    /** Preserve wire evidence, not internal error objects. */ (text) => ({
                                        status: reply.status,
                                        text,
                                        headers: reply.headers,
                                    })
                                )
                            )
                    )
                );
        return {
            request,
            token,
            mint,
            identity,
            store,
            sql,
            enabled,
            captured,
            config,
            services,
            fault,
            register: Context.get(hostContext, ActionHost).register,
            inventory: Context.get(hostContext, ActionInventory),
        };
    }
).pipe(Effect.provide(FetchHttpClient.layer));

describe('authenticated local HTTP through real SQL Cluster', /** Transport acceptance never substitutes the diagnostic shell for credential proof. */ () => {
    it.scopedLive(
        'denies invalid proof, routes canonical identity, replays safely, and reconciles OpenAPI from registered inventory',
        /** Exercise both successful routes and all security boundaries over actual sockets. */ () =>
            Effect.gen(
                /** Reuse one owned runner so revocation tests distinguish live reads from cached authority. */ function* () {
                    // Mutate authority behind the same socket and token to expose transport or runner authorization caches.
                    const f = yield* fixture;
                    const prefix = `/tenants/${tenant}`;
                    const path = `${prefix}/actions/${write.name}`;
                    const documentPath = `${prefix}/openapi.json`;
                    for (const authorization of [
                        '',
                        'Basic invalid',
                        `Bearer ${session}`,
                        'Bearer not-a-token',
                        `Bearer ${f.token} invalid`,
                        `Bearer ${f.token.slice(0, f.token.lastIndexOf('.') + 1)}invalid-signature`,
                        `Bearer ${'a'.repeat(8193)}`,
                        `Bearer ${f.mint({ exp: Math.floor(Date.now() / 1000) - 1 })}`,
                        `Bearer ${f.mint({ sub: 'unlinked' })}`,
                        `Bearer ${f.mint({ scope: 'openid' })}`,
                        `Bearer ${f.mint({ aud: 'other-audience' })}`,
                        `Bearer ${f.mint({ sid: 'unprovisioned-session' })}`,
                        `Bearer ${f.mint({ nbf: Math.floor(Date.now() / 1000) + 60 })}`,
                    ]) {
                        expect(yield* f.request(path, { authorization })).toMatchObject({
                            status: 401,
                            text: '{"error":"unauthenticated"}',
                        });
                    }
                    const caller = { subject, session, tenant, kind: 'human' as const };
                    const projected = (yield* f.inventory.list(caller)).filter(
                        /** Match the documented non-sensitive HTTP projection. */ (entry) => !entry.sensitive
                    );
                    expect(
                        projected.map(/** Compare complete names, not a success count. */ (entry) => entry.id).sort()
                    ).toEqual(['fixture.read', 'fixture.write']);
                    const document = yield* f.request(documentPath, { method: 'GET' });
                    expect(document.status).toBe(200);
                    expect(document.headers['cache-control']).toBe('no-store');
                    const decoded = yield* Schema.decodeUnknown(
                        Schema.parseJson(
                            Schema.Struct({
                                paths: Schema.Record({
                                    key: Schema.String,
                                    value: Schema.Struct({ post: Schema.Struct({ operationId: Schema.String }) }),
                                }),
                            })
                        )
                    )(document.text);
                    expect(Object.keys(decoded.paths).sort()).toEqual(
                        projected
                            .map(
                                /** Derive the complete expected route set independently from the registered host. */ (
                                    entry
                                ) => `${prefix}/actions/${entry.id}`
                            )
                            .sort()
                    );
                    for (const action of projected) {
                        const operation = ['paths', `${prefix}/actions/${action.id}`, 'post'];
                        expect(JSON.parse(document.text)).toHaveProperty(
                            [...operation, 'x-action-version'],
                            action.version
                        );
                        expect(JSON.parse(document.text)).toHaveProperty(
                            [...operation, 'x-action-permission'],
                            action.permission
                        );
                        expect(JSON.parse(document.text)).toHaveProperty(
                            [
                                ...operation,
                                'requestBody',
                                'content',
                                'application/json',
                                'schema',
                                'properties',
                                'input',
                            ],
                            action.providerSchemas.anthropic.input
                        );
                        expect(JSON.parse(document.text)).toHaveProperty(
                            [
                                ...operation,
                                'responses',
                                '200',
                                'content',
                                'application/json',
                                'schema',
                                'properties',
                                'output',
                            ],
                            action.providerSchemas.anthropic.output
                        );
                        expect(JSON.parse(document.text)).toHaveProperty(
                            [...operation, 'security'],
                            [{ bearerAuth: [] }]
                        );
                    }
                    expect(document.text).not.toContain('PRIVATE_METADATA_CANARY');
                    for (const name of [hidden.name, disabled.name, sensitive.name, 'fixture.unknown']) {
                        expect(document.text).not.toContain(name);
                        expect(yield* f.request(`${prefix}/actions/${name}`)).toMatchObject({
                            status: 404,
                            text: '{"error":"unavailable"}',
                        });
                    }
                    expect(yield* f.request(`/tenants/${id(999)}/actions/${write.name}`)).toMatchObject({
                        status: 404,
                    });
                    expect(yield* f.request(path, { method: 'GET' })).toMatchObject({ status: 404 });
                    expect(yield* f.request(`${path}?token=RAW_INPUT_CANARY`)).toMatchObject({ status: 400 });
                    expect(yield* f.request(`/${'a'.repeat(513)}`)).toMatchObject({ status: 400 });
                    for (const body of [
                        'RAW_INPUT_CANARY',
                        JSON.stringify({ input: { value: 21 }, idempotencyKey: '' }),
                        JSON.stringify({ input: { value: 21 }, idempotencyKey: 'one', caller: { subject } }),
                        JSON.stringify({ input: { value: 'a'.repeat(65536) }, idempotencyKey: 'oversize' }),
                    ]) {
                        expect(yield* f.request(path, { body })).toMatchObject({
                            status: 400,
                            text: '{"error":"invalid-request"}',
                        });
                    }
                    for (const body of [
                        JSON.stringify({ input: { value: 'RAW_INPUT_CANARY' }, idempotencyKey: 'bad-schema' }),
                        JSON.stringify({
                            input: { value: 1, extra: 'RAW_INPUT_CANARY' },
                            idempotencyKey: 'extra-input',
                        }),
                    ]) {
                        expect(yield* f.request(path, { body })).toMatchObject({
                            status: 503,
                            text: '{"error":"unavailable"}',
                        });
                    }
                    expect(yield* f.request(path, { contentType: 'text/plain' })).toMatchObject({ status: 400 });
                    const success = yield* f.request(path, { tenantHeader: id(999) });
                    expect(success.status).toBe(200);
                    expect(JSON.parse(success.text)).toMatchObject({ output: { value: 42 } });
                    const replay = yield* f.request(path);
                    expect(replay.status).toBe(200);
                    expect(JSON.parse(replay.text)).toMatchObject({ output: { value: 42 } });
                    expect(
                        yield* f.request(path, {
                            body: JSON.stringify({ input: { value: 22 }, idempotencyKey: 'http-write' }),
                        })
                    ).toMatchObject({ status: 503, text: '{"error":"unavailable"}' });
                    const readResult = yield* f.request(`${prefix}/actions/${read.name}`, {
                        body: JSON.stringify({ input: { value: 5 }, idempotencyKey: 'http-read' }),
                        authorization: `bearer ${f.token}`,
                    });
                    expect(readResult.status).toBe(200);
                    expect(JSON.parse(readResult.text)).toMatchObject({ output: { value: 8 } });
                    const receipts = yield* f.identity.audit(100);
                    expect(
                        receipts.filter(
                            /** Require actual successful durable evidence before inspecting its identity. */ (
                                receipt
                            ) => receipt.outcome === 'succeeded'
                        ).length
                    ).toBeGreaterThanOrEqual(3);
                    expect(
                        receipts
                            .filter(
                                /** Inspect exact server-owned identity from durable SQL evidence, not request echo. */ (
                                    receipt
                                ) => receipt.outcome === 'succeeded'
                            )
                            .every(
                                /** Raw OIDC sub must never substitute for the tenant-local canonical identity. */ (
                                    receipt
                                ) =>
                                    receipt.caller.subject === subject &&
                                    receipt.caller.session === session &&
                                    receipt.caller.tenant === tenant
                            )
                    ).toBe(true);
                    expect(
                        yield* f.sql<{ count: number }>`SELECT COUNT(*)::integer AS count FROM operational_record`
                    ).toEqual([{ count: 1 }]);
                    expect(
                        yield* f.sql<{
                            count: number;
                        }>`SELECT COUNT(*)::integer AS count FROM action_commit WHERE result IS NOT NULL`
                    ).toEqual([{ count: 1 }]);
                    yield* f.sql`ALTER TABLE action_receipt RENAME TO http_receipt_unavailable`;
                    expect(yield* f.request(path)).toMatchObject({ status: 503, text: '{"error":"unavailable"}' });
                    yield* f.sql`ALTER TABLE http_receipt_unavailable RENAME TO action_receipt`;
                    expect(yield* f.request(path)).toMatchObject({ status: 200 });
                    f.fault.flags = true;
                    expect(yield* f.request(documentPath, { method: 'GET' })).toMatchObject({
                        status: 503,
                        text: '{"error":"unavailable"}',
                    });
                    f.fault.flags = false;
                    yield* Effect.scoped(
                        Effect.gen(
                            /** An actual unrepresentable registered definition must fail discovery closed, without a fallback route list. */ function* () {
                                // Register unsupported input in the real inventory; a synthetic projection error could hide fallback routes.
                                const unsupported = define('unsupported.decode', {
                                    ...common,
                                    input: Schema.Array(Schema.Number),
                                });
                                yield* f.register({
                                    manifest: {
                                        format: 1,
                                        id: 'unsupported',
                                        version: '1.0.0',
                                        description: 'Inventory outage control.',
                                        actions: [unsupported.name],
                                        flags: [],
                                    },
                                    actions: [
                                        implement(
                                            unsupported,
                                            /** Runtime-valid arrays are deliberately unsupported for advertised object tool arguments. */ () =>
                                                Effect.succeed({ value: 0 })
                                        ),
                                    ],
                                });
                                expect(yield* f.request(documentPath, { method: 'GET' })).toMatchObject({
                                    status: 503,
                                    text: '{"error":"unavailable"}',
                                });
                            }
                        )
                    );
                    const storedRole = yield* f.identity.get('role', role);
                    expect(storedRole).toBeDefined();
                    if (!storedRole) return yield* Effect.dieMessage('fixture role missing');
                    yield* f.identity.put('role', { ...storedRole.value, grants: [] }, storedRole.version);
                    expect(yield* f.request(path)).toMatchObject({ status: 404 });
                    const noPermissions = yield* f.request(documentPath, { method: 'GET' });
                    expect(JSON.parse(noPermissions.text)).toMatchObject({ paths: {} });
                    yield* Ref.set(f.enabled, false);
                    expect(yield* f.request(documentPath, { method: 'GET' })).toMatchObject({ status: 404 });
                    yield* Ref.set(f.enabled, true);
                    const storedMembership = yield* f.identity.get('membership', subject);
                    if (!storedMembership) return yield* Effect.dieMessage('fixture membership missing');
                    yield* f.identity.put(
                        'membership',
                        { ...storedMembership.value, active: false },
                        storedMembership.version
                    );
                    expect(yield* f.request(documentPath, { method: 'GET' })).toMatchObject({ status: 401 });
                    yield* f.identity.put('membership', storedMembership.value, storedMembership.version + 1);
                    const storedSession = yield* f.identity.get('session', session);
                    if (!storedSession) return yield* Effect.dieMessage('fixture session missing');
                    yield* f.identity.put('session', { ...storedSession.value, active: false }, storedSession.version);
                    expect(yield* f.request(path)).toMatchObject({ status: 401 });
                    expect(yield* f.request(documentPath, { method: 'GET' })).toMatchObject({ status: 401 });
                    yield* f.identity.put(
                        'session',
                        { ...storedSession.value, expiresAt: EpochMillis.make(Date.now() - 1) },
                        storedSession.version + 1
                    );
                    expect(yield* f.request(path)).toMatchObject({ status: 401 });
                    expect(JSON.stringify(f.captured)).toContain('Listening on:');
                    expect(JSON.stringify(f.captured)).not.toContain(f.token);
                    expect(JSON.stringify(f.captured)).not.toContain('RAW_INPUT_CANARY');
                    for (const [environment, port] of [
                        ['production', '0'],
                        ['test', '-1'],
                        ['test', '65536'],
                    ] as const) {
                        expect(
                            Exit.isFailure(
                                yield* Effect.exit(
                                    serveLocalHttp(policy).pipe(
                                        Effect.provide(f.services),
                                        Effect.withConfigProvider(f.config(environment, port))
                                    )
                                )
                            )
                        ).toBe(true);
                    }
                    expect(httpActionsFlag.safeDefault).toBe(false);
                }
            ),
        60000
    );
});
