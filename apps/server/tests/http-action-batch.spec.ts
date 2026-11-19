/**
 * @file apps/server/tests/http-action-batch.spec.ts
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
import { SqlClient } from '@effect/sql';
import { describe, expect, it } from '@effect/vitest';
import { define } from '@eventiva/contracts/action';
import { Authorizer } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import { Flags } from '@eventiva/contracts/flags';
import { IdentityStore, RoleId, organizationGet } from '@eventiva/contracts/identity';
import { SubjectId, TenantId } from '@eventiva/contracts/ids';
import { ActionInventory } from '@eventiva/contracts/inventory';
import { CurrentTenant, EpochMillis, GuardedCommand, RoutingDenied, Storage } from '@eventiva/contracts/storage';
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
import { ConfigProvider, Context, Deferred, Effect, Fiber, Layer, Logger, Ref, Schedule, Schema } from 'effect';
import { backend } from '../src/backend.ts';
import { DeploymentProfile } from '../src/cluster-profile.ts';
import { ClusterActions } from '../src/cluster-actions.ts';
import { ClusterStatus } from '../src/cluster.ts';
import { httpActionBatchFlag } from '../src/http-action-batch.ts';
import { httpActionsFlag } from '../src/http-actions.ts';
import { serveLocalHttp } from '../src/http-entry.ts';
import { oidcStandardsVerifier } from '../src/identity-oidc.ts';

/** Deterministic synthetic IDs keep tenant, canonical identity and business records visibly distinct. */
const id = (value: number) => `019b0000-0000-7000-8000-${value.toString(16).padStart(12, '0')}`;
const tenant = TenantId.make(id(701));
const subject = SubjectId.make(id(702));
const role = RoleId.make(id(703));
const issuer = 'https://batch-issuer.example.test/realms/eventiva';
const policy = { issuer, audience: 'eventiva-batch', scopes: ['eventiva.invoke'] };
const session = oidcSessionId(issuer, 'provider-batch-session');
const Input = Schema.Struct({ value: Schema.Int });
const common = {
    version: 1,
    description: 'Synthetic batch action.',
    input: Input,
    output: Schema.Struct({ value: Schema.Number }),
    error: Schema.Literal('fixture-denied'),
    permission: 'fixture.invoke',
    sideEffect: 'write',
    offline: 'online-only',
} as const;
const write = define('batch.write', common);
const wait = define('batch.wait', common);
const gated = define('batch.gated', { ...common, flag: 'fixture.enabled' });
const hidden = define('batch.hidden', { ...common, permission: 'fixture.admin' });
const sensitive = define('batch.secret', { ...common, sensitive: true, description: 'HIDDEN_SCHEMA_CANARY' });
const registered = [write, wait, gated, hidden, sensitive];
const actionFlag = { key: 'fixture.enabled', description: 'Fixture action gate.', owner: 'test', safeDefault: false };

/** Real signed JWT, SQL identity, durable handlers and actual SQL Cluster. Only public discovery/JWKS transport is deterministic. */
const fixture = Effect.gen(
    /** Own the disposable database and release listeners/runners before dropping it. */ function* () {
        const target = new URL(
            process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test'
        );
        expect(['localhost', '127.0.0.1', '[::1]']).toContain(target.hostname);
        expect(target.pathname).toBe('/eventiva_test');
        /** Keep fixture SQL credentials inside a scoped configuration provider. */
        const pg = (url: string) =>
            client.pipe(
                Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]]))))
            );
        const admin = Context.get(yield* Layer.build(pg(target.toString())), SqlClient.SqlClient);
        const database = `batch_test_${randomUUID().replaceAll('-', '')}`;
        yield* admin`CREATE DATABASE ${admin(database)} TEMPLATE template0`;
        yield* Effect.addFinalizer(
            /** Kill only connections owned by the fixture role; plain DROP never terminates roleless workers. */ () =>
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
        const state = yield* Layer.build(
            Layer.mergeAll(storage('postgres'), identityStore).pipe(
                Layer.provide(routing),
                Layer.provide(Layer.succeedContext(connection))
            )
        );
        const identity = Context.get(state, IdentityStore);
        const store = Context.get(state, Storage);
        yield* identity.put('principal', { id: subject, kind: 'human', active: true }, null);
        yield* identity.put(
            'session',
            { id: session, subject, active: true, expiresAt: EpochMillis.make(Date.now() + 300000), delegation: null },
            null
        );
        const grants = [{ permission: 'fixture.invoke', resources: ['organization'] }];
        yield* identity.put('role', { id: role, name: 'Batch fixture', grants }, null);
        yield* identity.put('membership', { id: subject, active: true, roles: [role] }, null);
        yield* identity.link({ issuer, subject: 'external-batch-subject' }, subject);
        const security = yield* Layer.build(
            identitySecurity.pipe(Layer.provide(routing), Layer.provide(Layer.succeedContext(state)))
        );
        const live = Context.get(security, Authorizer);
        const switches = yield* Ref.make({ transport: true, batch: true, action: true });
        const control = {
            fail: false,
            revoke: 'none' as 'none' | 'session' | 'membership' | 'permission' | 'action' | 'batch' | 'transport',
            at: 0,
        };
        const entered = yield* Deferred.make<void>();
        const release = yield* Deferred.make<void>();
        const flags = Layer.succeed(Flags, {
            /** Evaluate independently controlled transport, batch and action capabilities without granting permissions. */ evaluate:
                (flag) =>
                    Ref.get(switches).pipe(
                        Effect.map(
                            /** Unknown flags retain their safe default, matching unchanged callers. */ (on) => ({
                                flag: flag.key,
                                value:
                                    flag.key === httpActionsFlag.key
                                        ? on.transport
                                        : flag.key === httpActionBatchFlag.key
                                          ? on.batch
                                          : flag.key === actionFlag.key
                                            ? on.action
                                            : flag.safeDefault,
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
                /** Delegate the synthetic module's organization target to current SQL resource grants. */ check: (
                    caller,
                    spec,
                    input
                ) =>
                    registered.some(
                        /** Only registered fixture definitions own this resource mapping. */ (entry) =>
                            entry.name === spec.name
                    ) && Schema.is(Input)(input)
                        ? live.check(caller, { ...spec, name: organizationGet.name }, input)
                        : Effect.fail(new Forbidden({ action: spec.name, reason: 'resource-policy-required' })),
            }),
            Layer.succeed(InputDigest, {
                /** Bind replay through the production canonical digest boundary. */ digest: (value) =>
                    Effect.sync(
                        /** Hash only; never log or retain raw input. */ () =>
                            createHash('sha256').update(value).digest('hex')
                    ),
            }),
            Layer.succeed(Approvals, {
                /** No fixture approval can bypass existing protected-action rules. */ get: () =>
                    Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'approval-unavailable' })),
                /** Keep accepting use unavailable without changing the batch's existing authority controls. */ use: () =>
                    Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'approval-unavailable' })),
                /** Refuse approved-read lifecycle work rather than create fixture consent. */ transaction: () =>
                    Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'approval-unavailable' })),
            })
        );
        /** Mutate live authority after a handler writes, so the next item cannot rely on the admitted inventory snapshot. */
        const revoke = Effect.gen(
            /** Each test restores the actual SQL row or flag before attempting recovery. */ function* () {
                // Change persisted authority between invocations rather than altering the transport's admitted caller snapshot.
                switch (control.revoke) {
                    case 'session': {
                        const row = yield* identity.get('session', session);
                        if (!row) return yield* Effect.dieMessage('missing session');
                        yield* identity.put('session', { ...row.value, active: false }, row.version);
                        break;
                    }
                    case 'membership': {
                        const row = yield* identity.get('membership', subject);
                        if (!row) return yield* Effect.dieMessage('missing membership');
                        yield* identity.put('membership', { ...row.value, active: false }, row.version);
                        break;
                    }
                    case 'permission': {
                        const row = yield* identity.get('role', role);
                        if (!row) return yield* Effect.dieMessage('missing role');
                        yield* identity.put('role', { ...row.value, grants: [] }, row.version);
                        break;
                    }
                    case 'action':
                        yield* Ref.update(
                            switches,
                            /** Revoke only the module capability. */ (on) => ({ ...on, action: false })
                        );
                        break;
                    case 'batch':
                        yield* Ref.update(
                            switches,
                            /** Stop the admitted batch suffix. */ (on) => ({ ...on, batch: false })
                        );
                        break;
                    case 'transport':
                        yield* Ref.update(
                            switches,
                            /** Stop the parent transport mid-batch. */ (on) => ({ ...on, transport: false })
                        );
                        break;
                    case 'none':
                        break;
                }
            }
        );
        /** Register the same definitions in discovery and the backend's independently routed host. */
        const initialize = (host: ActionHost['Type']) =>
            Effect.gen(
                /** Capture tenant-routed storage, never a submitted database selector. */ function* () {
                    // The receiver owns the storage binding; discovery registration alone never runs these handlers.
                    const routed = yield* Storage;
                    yield* host.register({
                        manifest: {
                            format: 1,
                            id: 'batch',
                            version: '1.0.0',
                            description: 'Batch fixture.',
                            actions: registered.map(
                                /** Derive manifest names from bindings. */ (action) => action.name
                            ),
                            flags: [actionFlag],
                        },
                        actions: registered.map(
                            /** The real executor decodes inputs, controls integrity and writes durable audit around each handler. */ (
                                spec
                            ) =>
                                implement(
                                    spec,
                                    /** Record order in SQL payloads and optionally revoke authority or suspend a real in-flight invocation. */ (
                                        input
                                    ) =>
                                        Effect.gen(
                                            /** A failed second item must not roll back the already committed first item. */ function* () {
                                                // The stored sequence makes both parallel dispatch and duplicate replay observable.
                                                if (control.fail && input.value === 22)
                                                    return yield* new Forbidden({
                                                        action: spec.name,
                                                        reason: 'RAW_INPUT_CANARY',
                                                    });
                                                if (spec.name === wait.name) {
                                                    yield* Deferred.succeed(entered, undefined);
                                                    yield* Deferred.await(release);
                                                }
                                                const previous = yield* routed.get(id(800));
                                                const order = Schema.is(Schema.Array(Schema.Number))(previous?.payload)
                                                    ? previous.payload
                                                    : [];
                                                if (previous)
                                                    yield* routed.compareAndSet(
                                                        yield* Schema.decodeUnknown(GuardedCommand)({
                                                            id: id(800),
                                                            expectedVersion: previous.version,
                                                            expectedState: 'pending',
                                                            idempotencyKey: `order-${input.value}`,
                                                            clientMutationId: id(2000 + input.value),
                                                            deadline: Date.now() + 60000,
                                                        }),
                                                        'pending',
                                                        [...order, input.value],
                                                        { pending: ['pending'] }
                                                    );
                                                else
                                                    yield* routed.create({
                                                        id: id(800),
                                                        state: 'pending',
                                                        version: 0,
                                                        payload: [input.value],
                                                        leaseUntil: null,
                                                    });
                                                if (input.value === control.at) yield* revoke;
                                                return { value: input.value * 7 + order.length };
                                            }
                                        ).pipe(
                                            Effect.mapError(
                                                /** Keep handler failures on the declared domain channel without input or driver diagnostics. */ () =>
                                                    'fixture-denied' as const
                                            )
                                        )
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
            Effect.provideService(CurrentTenant, { id: tenant }),
            Effect.provideService(Storage, store)
        );
        const profile = yield* Schema.decodeUnknown(DeploymentProfile)({
            edition: 'community',
            port: 34574,
            shards: 8,
            assignmentRefreshMs: 25,
            messagePollMs: 25,
            replyPollMs: 25,
        });
        const captured: string[] = [];
        const logger = Logger.make(
            /** Capture private logs to assert credential/input redaction independently of public errors. */ (
                options
            ) =>
                captured.push(
                    JSON.stringify({
                        message: options.message,
                        cause: options.cause,
                        annotations: [...options.annotations],
                    })
                )
        );
        const runner = yield* Layer.build(
            backend(profile, initialize, Effect.void, dependencies).pipe(
                Layer.provide(
                    sqlRouter(
                        'postgres',
                        /** A foreign tenant never aliases this fixture database. */ (candidate) =>
                            candidate === tenant
                                ? Effect.succeed(sql)
                                : Effect.fail(new RoutingDenied({ reason: 'unknown tenant' })),
                        /** Permit only the explicitly provisioned tenant route. */ (candidate) =>
                            candidate === tenant
                                ? Effect.void
                                : Effect.fail(new RoutingDenied({ reason: 'unknown tenant' }))
                    )
                ),
                Layer.provide(dependencies),
                Layer.provide(Layer.succeedContext(connection))
            )
        ).pipe(Effect.provide(Logger.replace(Logger.defaultLogger, logger)));
        yield* Context.get(runner, ClusterStatus).snapshot.pipe(
            Effect.repeat({
                schedule: Schedule.spaced('25 millis'),
                /** Wait for real SQL shard ownership. */ until: (value) => value.status === 'healthy',
            }),
            Effect.timeout('10 seconds')
        );
        const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
        const now = Math.floor(Date.now() / 1000);
        /** Mint independently signed proofs including an expired negative control; no accepting verifier. */
        const mint = (expired = false) => {
            // Sign the negative time-bound case too, so rejection cannot be explained by a malformed token.
            const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'at+jwt', kid: 'batch-test' })).toString(
                'base64url'
            );
            const claims = Buffer.from(
                JSON.stringify({
                    iss: issuer,
                    sub: 'external-batch-subject',
                    aud: policy.audience,
                    scope: 'eventiva.invoke',
                    sid: 'provider-batch-session',
                    client_id: 'batch-fixture',
                    iat: now - 2,
                    nbf: now - 2,
                    exp: expired ? now - 1 : now + 300,
                    jti: 'batch-proof',
                })
            ).toString('base64url');
            const unsigned = `${header}.${claims}`;
            return `${unsigned}.${sign('RSA-SHA256', Buffer.from(unsigned), privateKey).toString('base64url')}`;
        };
        const verifier = yield* makeOidcVerifier(
            {
                issuer,
                audience: policy.audience,
                clients: ['batch-fixture'],
                algorithms: ['RS256'],
                allowInsecureLoopback: false,
            },
            {
                /** Only public OIDC discovery/key retrieval is deterministic; cryptographic and claims validation are real. */ fetch: (
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
                                              kid: 'batch-test',
                                              alg: 'RS256',
                                              use: 'sig',
                                          },
                                      ],
                                  }
                        )
                    ),
            }
        );
        const address = yield* serveLocalHttp(policy).pipe(
            Effect.provide(
                Layer.mergeAll(
                    dependencies,
                    routing,
                    Layer.succeedContext(state),
                    oidcStandardsVerifier(verifier),
                    Layer.succeed(ActionInventory, Context.get(hostContext, ActionInventory)),
                    Layer.succeed(ClusterActions, Context.get(runner, ClusterActions))
                )
            ),
            Effect.withConfigProvider(
                ConfigProvider.fromMap(
                    new Map([
                        ['EVENTIVA_ENVIRONMENT', 'test'],
                        ['HTTP_PORT', '0'],
                    ])
                )
            ),
            Effect.provide(Logger.replace(Logger.defaultLogger, logger))
        );
        if (address._tag !== 'TcpAddress') return yield* Effect.dieMessage('no TCP listener');
        const base = `http://127.0.0.1:${address.port}`;
        const http = yield* HttpClient.HttpClient;
        const token = mint();
        /** Drive actual HTTP, retaining only closed response text/status and never the credential. */
        const request = (
            body: string,
            options: { path?: string; method?: 'GET' | 'POST'; authorization?: string; contentType?: string } = {}
        ) =>
            http
                .execute(
                    HttpClientRequest.make(options.method ?? 'POST')(
                        `${base}${options.path ?? `/tenants/${tenant}/actions:batch`}`
                    ).pipe(
                        HttpClientRequest.setHeaders({
                            authorization: options.authorization ?? `Bearer ${token}`,
                            'content-type': options.contentType ?? 'application/json',
                        }),
                        HttpClientRequest.setBody(
                            options.method === 'GET'
                                ? HttpBody.empty
                                : HttpBody.text(body, options.contentType ?? 'application/json')
                        )
                    )
                )
                .pipe(
                    Effect.flatMap(
                        /** Consume error bodies as well, so diagnostics cannot hide outside assertions. */ (reply) =>
                            reply.text.pipe(
                                Effect.map(
                                    /** Preserve public wire evidence only. */ (text) => ({
                                        status: reply.status,
                                        text,
                                    })
                                )
                            )
                    )
                );
        /** Restore actual live authority, never clear durable business or replay evidence. */
        const restore = Effect.gen(
            /** Versioned SQL writes ensure recovery does not resurrect an obsolete snapshot. */ function* () {
                // Restore only authority. Business writes, audit history and deduplication records remain intact.
                const s = yield* identity.get('session', session);
                const m = yield* identity.get('membership', subject);
                const r = yield* identity.get('role', role);
                if (!s || !m || !r) return yield* Effect.dieMessage('missing authority');
                yield* identity.put('session', { ...s.value, active: true }, s.version);
                yield* identity.put('membership', { ...m.value, active: true }, m.version);
                yield* identity.put('role', { ...r.value, grants }, r.version);
                yield* Ref.set(switches, { transport: true, batch: true, action: true });
                control.revoke = 'none';
            }
        );
        return { request, store, sql, identity, switches, control, restore, captured, token, mint, entered, release };
    }
).pipe(Effect.provide(FetchHttpClient.layer));

/** Build an exact envelope without generating or changing caller-owned idempotency keys. */
const envelope = (values: ReadonlyArray<number>, key: string, action: string = write.name) =>
    JSON.stringify({
        calls: values.map(
            /** Give each intended operation a distinct stable key. */ (value) => ({
                action,
                input: { value },
                idempotencyKey: `${key}-${value}`,
            })
        ),
    });
const Success = Schema.parseJson(
    Schema.Struct({
        results: Schema.Array(
            Schema.Struct({ output: Schema.Struct({ value: Schema.Number }), receiptId: Schema.String })
        ),
    })
);

describe('bounded sequential local batch over real SQL/JWT/Cluster', /** Exercise the user-visible transport without editing the original HTTP suite or entry. */ () => {
    it.scopedLive(
        'preflights all entries, preserves ordered durable prefix/replay, and reauthorizes between items',
        /** Observe exact wire outputs and independent SQL evidence through failures and recovery. */ () =>
            Effect.gen(
                /** One owned composition retains durable state while flags and identity change. */ function* () {
                    const f = yield* fixture;
                    const docPath = `/tenants/${tenant}/openapi.json`;
                    for (const authorization of ['', `Bearer ${session}`, `Bearer ${f.mint(true)}`])
                        expect(yield* f.request(envelope([1], 'proof'), { authorization })).toEqual({
                            status: 401,
                            text: '{"error":"unauthenticated"}',
                        });
                    for (const body of [
                        'bad',
                        '{}',
                        '{"calls":[]}',
                        envelope(
                            Array.from({ length: 11 }, /** Independent range for the upper bound. */ (_, i) => i),
                            'large'
                        ),
                        '{"calls":[{"action":"batch.write","input":{},"idempotencyKey":""}]}',
                        '{"calls":[{"action":"batch.write","input":{},"idempotencyKey":"valid"}],"tenant":"untrusted"}',
                        '{"calls":[{"action":"batch.write","input":{},"idempotencyKey":"valid","extra":true}]}',
                        JSON.stringify({
                            calls: [{ action: write.name, input: 'x'.repeat(65536), idempotencyKey: 'large' }],
                        }),
                        JSON.stringify({ calls: [{ action: write.name, input: {}, idempotencyKey: 'a'.repeat(129) }] }),
                        JSON.stringify({ calls: [{ action: write.name, input: {}, idempotencyKey: 'bad key' }] }),
                    ])
                        expect(yield* f.request(body)).toEqual({ status: 400, text: '{"error":"invalid-request"}' });
                    expect(yield* f.request(envelope([1], 'type'), { contentType: 'text/plain' })).toMatchObject({
                        status: 400,
                    });
                    // A valid first call must remain untouched when any later structure or visibility is invalid.
                    for (const action of [
                        hidden.name,
                        sensitive.name,
                        'batch.unknown',
                        `/tenants/${id(999)}/actions/batch.write`,
                    ])
                        expect(
                            yield* f.request(
                                JSON.stringify({
                                    calls: [
                                        { action: write.name, input: { value: 1 }, idempotencyKey: 'preflight' },
                                        { action, input: { value: 2 }, idempotencyKey: 'later' },
                                    ],
                                })
                            )
                        ).toEqual({ status: 404, text: '{"error":"unavailable"}' });
                    expect(
                        yield* f.request(
                            '{"calls":[{"action":"batch.write","input":{"value":1},"idempotencyKey":"preflight"},{"action":"batch.write","input":{},"idempotencyKey":"bad key"}]}'
                        )
                    ).toMatchObject({ status: 400 });
                    expect(
                        yield* f.request(envelope([1], 'foreign'), { path: `/tenants/${id(999)}/actions:batch` })
                    ).toMatchObject({ status: 404 });
                    expect(yield* f.store.get(id(800))).toBeUndefined();
                    expect(yield* f.sql`SELECT * FROM action_commit`).toEqual([]);
                    expect(yield* f.identity.audit(100)).toEqual([]);
                    const document = yield* f.request('', { path: docPath, method: 'GET' });
                    expect(document.status).toBe(200);
                    const operation = ['paths', `/tenants/${tenant}/actions:batch`, 'post'];
                    const alternatives = [gated, wait, write].map(
                        /** Compare exact independent domain schemas and discriminants. */ (spec) => ({
                            type: 'object',
                            additionalProperties: false,
                            required: ['action', 'input', 'idempotencyKey'],
                            properties: {
                                action: { type: 'string', enum: [spec.name] },
                                input: {
                                    type: 'object',
                                    properties: {
                                        value: {
                                            type: 'integer',
                                            minimum: -9007199254740991,
                                            maximum: 9007199254740991,
                                            description: 'an integer',
                                        },
                                    },
                                    required: ['value'],
                                    additionalProperties: false,
                                },
                                idempotencyKey: { type: 'string', pattern: '^[A-Za-z0-9._:-]{1,128}$' },
                            },
                        })
                    );
                    expect(JSON.parse(document.text)).toHaveProperty(
                        [
                            ...operation,
                            'requestBody',
                            'content',
                            'application/json',
                            'schema',
                            'properties',
                            'calls',
                            'items',
                            'oneOf',
                        ],
                        alternatives
                    );
                    expect(document.text).not.toContain('HIDDEN_SCHEMA_CANARY');
                    expect(document.text).not.toContain(hidden.name);
                    expect(document.text).not.toContain(sensitive.name);
                    for (const suffix of ['actionsXYZ', 'actions:other', 'actions::batch', 'actionsbatch'])
                        expect(
                            yield* f.request(envelope([1], 'neighbor'), { path: `/tenants/${tenant}/${suffix}` })
                        ).toMatchObject({ status: 404 });
                    yield* Ref.set(f.switches, { transport: true, batch: true, action: false });
                    expect(yield* f.request(envelope([1], 'action-off', gated.name))).toMatchObject({ status: 404 });
                    expect((yield* f.request('', { path: docPath, method: 'GET' })).text).not.toContain(gated.name);
                    yield* Ref.set(f.switches, { transport: true, batch: false, action: true });
                    expect(yield* f.request(envelope([1], 'off'))).toMatchObject({ status: 404 });
                    const disabledDoc = yield* f.request('', { path: docPath, method: 'GET' });
                    expect(disabledDoc.text).not.toContain('actions:batch');
                    expect(disabledDoc.text).not.toContain('actionBatch');
                    yield* f.restore;
                    const success = yield* f.request(envelope([9, 2, 7], 'ordered'));
                    expect(success.status).toBe(200);
                    const decoded = yield* Schema.decodeUnknown(Success)(success.text);
                    expect(
                        decoded.results.map(
                            /** Assert non-symmetric values including the committed predecessor count. */ (entry) =>
                                entry.output.value
                        )
                    ).toEqual([63, 15, 51]);
                    const commits = yield* f.sql`SELECT key, result FROM action_commit ORDER BY key`;
                    expect(commits).toHaveLength(3);
                    const receipts = yield* f.identity.audit(100);
                    for (const result of decoded.results)
                        expect(
                            receipts.some(
                                /** Every wire receipt must be real durable SQL evidence. */ (receipt) =>
                                    receipt.id === result.receiptId &&
                                    receipt.caller.subject === subject &&
                                    receipt.caller.session === session &&
                                    receipt.caller.tenant === tenant &&
                                    receipt.outcome === 'succeeded'
                            )
                        ).toBe(true);
                    const replay = yield* f.request(envelope([9, 2, 7], 'ordered'));
                    expect(replay.status).toBe(200);
                    expect(
                        (yield* Schema.decodeUnknown(Success)(replay.text)).results.map(
                            /** Replay retains output, not the per-attempt receipt identity. */ (entry) =>
                                entry.output.value
                        )
                    ).toEqual([63, 15, 51]);
                    expect(yield* f.sql`SELECT key, result FROM action_commit ORDER BY key`).toEqual(commits);
                    expect((yield* f.store.get(id(800)))?.payload).toEqual([9, 2, 7]);
                    f.control.fail = true;
                    expect(yield* f.request(envelope([11, 22, 33], 'partial'))).toEqual({
                        status: 503,
                        text: '{"error":"unavailable"}',
                    });
                    expect((yield* f.store.get(id(800)))?.payload).toEqual([9, 2, 7, 11]);
                    const prefixCommits =
                        yield* f.sql`SELECT key, result FROM action_commit WHERE result IS NOT NULL ORDER BY key`;
                    expect(prefixCommits).toHaveLength(4);
                    f.control.fail = false;
                    const recovered = yield* f.request(envelope([11, 22, 33], 'partial'));
                    expect(recovered.status).toBe(200);
                    expect(
                        (yield* Schema.decodeUnknown(Success)(recovered.text)).results.map(
                            /** First output belongs to the original prefix; only the suffix observes later state. */ (
                                entry
                            ) => entry.output.value
                        )
                    ).toEqual([80, 158, 236]);
                    expect((yield* f.store.get(id(800)))?.payload).toEqual([9, 2, 7, 11, 22, 33]);
                    for (const row of prefixCommits)
                        expect(yield* f.sql`SELECT key, result FROM action_commit WHERE key = ${row['key']}`).toEqual([
                            row,
                        ]);
                    expect(
                        yield* f.request(
                            '{"calls":[{"action":"batch.write","input":{"value":12},"idempotencyKey":"partial-11"}]}'
                        )
                    ).toMatchObject({ status: 503 });
                    expect(
                        yield* f.request(
                            '{"calls":[{"action":"batch.write","input":{"value":44},"idempotencyKey":"domain-first"},{"action":"batch.write","input":{"value":"RAW_INPUT_CANARY"},"idempotencyKey":"domain-second"},{"action":"batch.write","input":{"value":55},"idempotencyKey":"domain-third"}]}'
                        )
                    ).toMatchObject({ status: 503 });
                    expect((yield* f.store.get(id(800)))?.payload).toEqual([9, 2, 7, 11, 22, 33, 44]);
                    // These changes occur inside item 1, after the request's visibility preflight and before item 2 enters Cluster.
                    let next = 100;
                    for (const kind of [
                        'session',
                        'membership',
                        'permission',
                        'action',
                        'batch',
                        'transport',
                    ] as const) {
                        f.control.at = next;
                        f.control.revoke = kind;
                        const before = yield* f.store.get(id(800));
                        const authorityBefore = {
                            session: yield* f.identity.get('session', session),
                            membership: yield* f.identity.get('membership', subject),
                            role: yield* f.identity.get('role', role),
                        };
                        const historyBefore =
                            yield* f.sql`SELECT * FROM transition_history WHERE record_id = ${id(800)} ORDER BY version, command_id`;
                        const commitsBefore =
                            yield* f.sql`SELECT key, result FROM action_commit WHERE result IS NOT NULL ORDER BY key`;
                        const successfulBefore = (yield* f.identity.audit(100))
                            .filter(
                                /** Denied attempts may append audit, but must not fabricate successful mutation evidence. */ (
                                    receipt
                                ) => receipt.outcome === 'succeeded'
                            )
                            .map(
                                /** Compare immutable success identities independently of audit ordering. */ (
                                    receipt
                                ) => receipt.id
                            )
                            .toSorted();
                        expect(
                            yield* f.request(envelope([next, next + 1, next + 2], `revoke-${kind}`, gated.name))
                        ).toMatchObject({ status: 503 });
                        const transportOnly = kind === 'batch' || kind === 'transport';
                        const historyAfter =
                            yield* f.sql`SELECT * FROM transition_history WHERE record_id = ${id(800)} ORDER BY version, command_id`;
                        const commitsAfter =
                            yield* f.sql`SELECT key, result FROM action_commit WHERE result IS NOT NULL ORDER BY key`;
                        if (transportOnly) {
                            // Transport admission stops the suffix, not an item still authorized at its own SQL commit boundary.
                            expect((yield* f.store.get(id(800)))?.payload).toEqual([
                                ...(Schema.is(Schema.Array(Schema.Number))(before?.payload) ? before.payload : []),
                                next,
                            ]);
                            expect(historyAfter).toHaveLength(historyBefore.length + 1);
                            expect(commitsAfter).toHaveLength(commitsBefore.length + 1);
                        } else {
                            // The handler revoked its own action authority: item 1 and its SQL identity edits roll back together.
                            expect(yield* f.store.get(id(800))).toEqual(before);
                            expect(historyAfter).toEqual(historyBefore);
                            expect(commitsAfter).toEqual(commitsBefore);
                            expect({
                                session: yield* f.identity.get('session', session),
                                membership: yield* f.identity.get('membership', subject),
                                role: yield* f.identity.get('role', role),
                            }).toEqual(authorityBefore);
                            expect(
                                (yield* f.identity.audit(100))
                                    .filter(
                                        /** Successful evidence cannot survive an action-authority refusal at commit. */ (
                                            receipt
                                        ) => receipt.outcome === 'succeeded'
                                    )
                                    .map(
                                        /** Keep the comparison independent of fresh denial-audit ordering. */ (
                                            receipt
                                        ) => receipt.id
                                    )
                                    .toSorted()
                            ).toEqual(successfulBefore);
                        }
                        yield* f.restore;
                        if (transportOnly) {
                            const recovered = yield* f.request(
                                envelope([next, next + 1, next + 2], `revoke-${kind}`, gated.name)
                            );
                            expect(recovered.status).toBe(200);
                            expect((yield* f.store.get(id(800)))?.payload).toEqual([
                                ...(Schema.is(Schema.Array(Schema.Number))(before?.payload) ? before.payload : []),
                                next,
                                next + 1,
                                next + 2,
                            ]);
                            for (const row of commitsAfter)
                                expect(
                                    yield* f.sql`SELECT key, result FROM action_commit WHERE key = ${row['key']}`
                                ).toEqual([row]);
                        }
                        next += 10;
                    }
                    yield* f.sql`ALTER TABLE action_receipt RENAME TO batch_audit_unavailable`;
                    expect(yield* f.request(envelope([200, 201], 'audit'))).toEqual({
                        status: 503,
                        text: '{"error":"unavailable"}',
                    });
                    yield* f.sql`ALTER TABLE batch_audit_unavailable RENAME TO action_receipt`;
                    const afterAudit = yield* f.store.get(id(800));
                    expect(
                        Schema.is(Schema.Array(Schema.Number))(afterAudit?.payload) && afterAudit.payload.includes(200)
                    ).toBe(false);
                    const boundary = yield* f.request(
                        envelope([301, 302, 303, 304, 305, 306, 307, 308, 309, 310], 'ten')
                    );
                    expect(boundary.status).toBe(200);
                    expect((yield* Schema.decodeUnknown(Success)(boundary.text)).results).toHaveLength(10);
                    const storedRole = yield* f.identity.get('role', role);
                    if (!storedRole) return yield* Effect.dieMessage('missing role');
                    yield* f.identity.put('role', { ...storedRole.value, grants: [] }, storedRole.version);
                    const empty = yield* f.request('', { path: docPath, method: 'GET' });
                    expect(empty.status).toBe(200);
                    expect(JSON.parse(empty.text)).toHaveProperty(
                        [
                            ...operation,
                            'requestBody',
                            'content',
                            'application/json',
                            'schema',
                            'properties',
                            'calls',
                            'items',
                        ],
                        { not: {} }
                    );
                    expect(JSON.parse(empty.text)).toHaveProperty(
                        [
                            ...operation,
                            'responses',
                            '200',
                            'content',
                            'application/json',
                            'schema',
                            'properties',
                            'results',
                            'items',
                            'properties',
                            'output',
                        ],
                        { not: {} }
                    );
                    expect(JSON.stringify(f.captured)).not.toContain(f.token);
                    expect(JSON.stringify(f.captured)).not.toContain('RAW_INPUT_CANARY');
                    expect(httpActionBatchFlag.safeDefault).toBe(false);
                }
            ),
        90000
    );

    it.scopedLive(
        'timeout and disconnected client preserve the committed prefix and stop the suffix',
        /** Use a real suspended handler and sockets; cancellation is not represented as atomic rollback. */ () =>
            Effect.gen(
                /** Independently scoped listeners distinguish application timeout from an actually aborted client request. */ function* () {
                    // Separate scopes prevent a released barrier or earlier receipt from masking the disconnect control.
                    for (const mode of ['timeout', 'disconnect'] as const)
                        yield* Effect.scoped(
                            Effect.gen(
                                /** Keep an observable committed prefix while item 2 is suspended and item 3 remains undispatched. */ function* () {
                                    // Releasing item 2 must not resume the cancelled HTTP loop and dispatch item 3.
                                    const f = yield* fixture;
                                    const body = JSON.stringify({
                                        calls: [
                                            { action: write.name, input: { value: 4 }, idempotencyKey: 'prefix' },
                                            { action: wait.name, input: { value: 3 }, idempotencyKey: 'wait' },
                                            { action: write.name, input: { value: 8 }, idempotencyKey: 'suffix' },
                                        ],
                                    });
                                    const pending = yield* Effect.fork(f.request(body));
                                    yield* Deferred.await(f.entered).pipe(Effect.timeout('10 seconds'));
                                    expect((yield* f.store.get(id(800)))?.payload).toEqual([4]);
                                    const prefix =
                                        yield* f.sql`SELECT key, result FROM action_commit WHERE result IS NOT NULL`;
                                    expect(prefix).toHaveLength(1);
                                    if (mode === 'timeout')
                                        expect(yield* Fiber.join(pending)).toEqual({
                                            status: 503,
                                            text: '{"error":"unavailable"}',
                                        });
                                    else yield* Fiber.interrupt(pending);
                                    yield* Deferred.succeed(f.release, undefined);
                                    yield* Effect.sleep('300 millis');
                                    const after = (yield* f.store.get(id(800)))?.payload;
                                    expect([[4], [4, 3]]).toContainEqual(after);
                                    const retry = yield* f.request(body);
                                    expect(retry.status).toBe(200);
                                    expect((yield* f.store.get(id(800)))?.payload).toEqual([4, 3, 8]);
                                    for (const row of prefix)
                                        expect(
                                            yield* f.sql`SELECT key, result FROM action_commit WHERE key = ${row['key']}`
                                        ).toEqual([row]);
                                }
                            )
                        );
                }
            ),
        40000
    );
});
