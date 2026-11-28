/**
 * @file apps/server/tests/http-client.spec.ts
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
import * as NodeSocketServer from '@effect/platform-node/NodeSocketServer';
import { SqlClient } from '@effect/sql';
import { describe, expect, it } from '@effect/vitest';
import { define, type ActionSpec, type Input } from '@eventiva/contracts/action';
import { Authorizer } from '@eventiva/contracts/caller';
import { Forbidden } from '@eventiva/contracts/errors';
import { Flags } from '@eventiva/contracts/flags';
import { IdentityStore, RoleId, organizationGet } from '@eventiva/contracts/identity';
import { SubjectId, TenantId } from '@eventiva/contracts/ids';
import { ActionInventory } from '@eventiva/contracts/inventory';
import { CurrentTenant, EpochMillis, GuardedCommand, RoutingDenied, Storage } from '@eventiva/contracts/storage';
import {
    discoverHttpActions,
    HttpActionClientFailure,
    HttpActionCredentials,
    invokeHttpAction,
    invokeHttpActionBatch,
    type HttpActionBatchCalls,
} from '@eventiva/integrations.http-client/action';
import { makeOidcVerifier, oidcSessionId } from '@eventiva/integrations.oidc/token';
import { identityStore } from '@eventiva/integrations.sql/identity';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { sqlRouter } from '@eventiva/integrations.sql/router';
import { storage } from '@eventiva/integrations.sql/storage';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { identitySecurity } from '@eventiva/runtime/identity';
import { Approvals, InputDigest, InvocationDenied } from '@eventiva/runtime/invocation';
import { durable } from '@eventiva/runtime/storage';
import { ConfigProvider, Context, Effect, Layer, Logger, Redacted, Schedule, Schema } from 'effect';
import { backend } from '../src/backend.ts';
import { ClusterActions } from '../src/cluster-actions.ts';
import { DeploymentProfile } from '../src/cluster-profile.ts';
import { ClusterStatus } from '../src/cluster.ts';
import { httpActionBatchFlag } from '../src/http-action-batch.ts';
import { httpActionsFlag } from '../src/http-actions.ts';
import { serveLocalHttp } from '../src/http-entry.ts';
import { oidcStandardsVerifier } from '../src/identity-oidc.ts';

/** Stable UUIDv7-shaped synthetic identities keep provider subjects distinct from canonical identities. */
const id = (n: number) => `019b0000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`;
const tenant = TenantId.make(id(501));
const subject = SubjectId.make(id(502));
const role = RoleId.make(id(503));
const issuer = 'https://client-issuer.example.test/realms/eventiva';
const policy = { issuer, audience: 'eventiva-http-client', scopes: ['eventiva.invoke'] };
const session = oidcSessionId(issuer, 'client-provider-session');
const Units = Schema.Int.pipe(Schema.brand('HttpClientUnits'));
const ActionInput = Schema.Struct({ units: Units, adjustment: Schema.Int });
const common = {
    version: 1,
    description: 'Synthetic structural HTTP client conformance action.',
    input: ActionInput,
    output: Schema.Struct({ total: Schema.Int }),
    permission: 'fixture.invoke',
    sideEffect: 'write',
    offline: 'online-only',
} as const;
const writeFlag = {
    key: 'fixture.client-write-enabled',
    description: 'Synthetic per-action discovery refresh control.',
    owner: 'test',
    safeDefault: false,
};
const write = define('fixture.client-write', { ...common, flag: writeFlag.key });
const hidden = define('fixture.client-hidden', { ...common, permission: 'fixture.admin' });
const sensitive = define('fixture.client-sensitive', { ...common, sensitive: true });
const batchWrite = define('fixture.client-batch-write', common);
const LabelInput = Schema.Struct({ label: Schema.String, marker: Units });
const batchLabel = define('fixture.client-batch-label', {
    ...common,
    input: LabelInput,
    output: Schema.Struct({ label: Schema.String }),
});
const registered = [write, hidden, sensitive, batchWrite];
const input = { units: Units.make(7), adjustment: -2 };

/** Real SQL identity and backend Cluster composition; only synthetic token discovery/key material is fixture-owned. */
const fixture = Effect.gen(
    /** Own a disposable database, migrated storage, signed issuer, registered action and loopback listener. */ function* () {
        // Refuse nonlocal targets before CREATE DATABASE; cleanup is scoped to the fixture role and generated name.
        const target = new URL(
            process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test'
        );
        expect(['localhost', '127.0.0.1', '[::1]']).toContain(target.hostname);
        expect(target.pathname).toBe('/eventiva_test');
        /** Keep connection credentials inside Effect configuration rather than command arguments or output. */
        const pg = (url: string) =>
            client.pipe(
                Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]]))))
            );
        const admin = Context.get(yield* Layer.build(pg(target.toString())), SqlClient.SqlClient);
        const database = `http_client_${randomUUID().replaceAll('-', '')}`;
        yield* admin`CREATE DATABASE ${admin(database)} TEMPLATE template0`;
        yield* Effect.addFinalizer(
            /** Close only this role's fixture sessions before dropping its owned disposable database. */ () =>
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
        yield* identity.put(
            'role',
            {
                id: role,
                name: 'Client fixture',
                grants: [{ permission: 'fixture.invoke', resources: ['organization'] }],
            },
            null
        );
        yield* identity.put('membership', { id: subject, active: true, roles: [role] }, null);
        yield* identity.link({ issuer, subject: 'provider-not-canonical' }, subject);
        const security = yield* Layer.build(
            identitySecurity.pipe(Layer.provide(routing), Layer.provide(Layer.succeedContext(state)))
        );
        const live = Context.get(security, Authorizer);
        const control = { http: true, batch: true, write: true, denySecond: false };
        const dependencies = Layer.mergeAll(
            Layer.succeedContext(security),
            Layer.succeed(Flags, {
                /** Enable only the existing local transport; every unrelated flag retains its safe default. */
                evaluate: (flag) =>
                    Effect.succeed({
                        flag: flag.key,
                        value:
                            (flag.key === httpActionsFlag.key && control.http) ||
                            (flag.key === httpActionBatchFlag.key && control.batch) ||
                            (flag.key === writeFlag.key && control.write) ||
                            flag.safeDefault,
                        fallback: false,
                        reason: 'TEST',
                    }),
            }),
            Layer.succeed(Authorizer, {
                canInvoke: live.canInvoke,
                /** The fixture owns an organization resource; retain real SQL authorization for every attempt, including replay. */
                check: (caller, spec, value) =>
                    (
                        spec.name === batchLabel.name
                            ? Schema.is(LabelInput)(value) && !control.denySecond
                            : registered.some(
                                  /** Do not admit unregistered definitions to the synthetic resource policy. */ (
                                      entry
                                  ) => entry.name === spec.name
                              ) && Schema.is(ActionInput)(value)
                    )
                        ? live.check(caller, { ...spec, name: organizationGet.name }, value)
                        : Effect.fail(new Forbidden({ action: spec.name, reason: 'resource-policy-required' })),
            }),
            Layer.succeed(InputDigest, {
                /** Bind the existing durable executor to real canonical input bytes. */
                digest: (value) =>
                    Effect.sync(
                        /** Retain only the digest, never input text in diagnostic state. */ () =>
                            createHash('sha256').update(value).digest('hex')
                    ),
            }),
            Layer.succeed(Approvals, {
                /** No test approval may satisfy an operation requiring protected authorization. */
                get: () => Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'approval-unavailable' })),
                /** The same missing capability denies accepting use, not just admission. */
                use: () => Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'approval-unavailable' })),
                /** Preserve denial for protected reads without manufacturing a transaction. */
                transaction: () =>
                    Effect.fail(new InvocationDenied({ action: '<approval>', reason: 'approval-unavailable' })),
            })
        );
        /** Register identical definitions in discovery and the independently tenant-routed durable backend. */
        const initialize = (host: ActionHost['Type']) =>
            Effect.gen(
                /** Capture the backend-selected store, not a transport-provided SQL handle. */ function* () {
                    // Repeated handler execution collides on one fixed record, exposing a broken durable replay path.
                    const routed = yield* Storage;
                    /** Persist an ordered sequence through the same tenant-routed transaction as the durable action commit. */
                    const record = (marker: number) =>
                        Effect.gen(
                            /** Unique markers and retained order detect prefix reexecution and parallel dispatch independently of wire receipts. */ function* () {
                                // A single CAS-protected record is enough for this sequential fixture, not a new batch transaction primitive.
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
                                            idempotencyKey: `order:${marker}`,
                                            clientMutationId: id(1000 + marker),
                                            deadline: Date.now() + 60000,
                                        }),
                                        'pending',
                                        [...order, marker],
                                        { pending: ['pending'] }
                                    );
                                else
                                    yield* routed.create({
                                        id: id(800),
                                        state: 'pending',
                                        version: 0,
                                        payload: [marker],
                                        leaseUntil: null,
                                    });
                                return order.length;
                            }
                        ).pipe(Effect.orDie);
                    yield* host.register({
                        manifest: {
                            format: 1,
                            id: 'fixture',
                            version: '1.0.0',
                            description: 'Client conformance.',
                            actions: [...registered, batchLabel].map(
                                /** Reflect actual registered bindings in the manifest. */ (spec) => spec.name
                            ),
                            flags: [writeFlag],
                        },
                        actions: [
                            ...registered.map(
                                /** Use canonical codecs and durable host execution instead of a test HTTP result echo. */ (
                                    spec
                                ) =>
                                    implement(
                                        spec,
                                        /** A repeated execution would collide on this fixed record; asymmetric output catches swapped or echoed fields. */ (
                                            value
                                        ) =>
                                            spec.name === batchWrite.name
                                                ? record(value.units).pipe(
                                                      Effect.map(
                                                          /** The prior durable sequence length makes dispatch order observable in the result. */ (
                                                              position
                                                          ) => ({
                                                              total: value.units * 5 + value.adjustment + position,
                                                          })
                                                      )
                                                  )
                                                : routed
                                                      .create({
                                                          id: id(504),
                                                          state: 'pending',
                                                          version: 0,
                                                          payload: { units: value.units, adjustment: value.adjustment },
                                                          leaseUntil: null,
                                                      })
                                                      .pipe(
                                                          Effect.as({ total: value.units * 5 + value.adjustment }),
                                                          Effect.orDie
                                                      )
                                    )
                            ),
                            implement(
                                batchLabel,
                                /** A structurally distinct action shares ordered durable evidence, never a transport echo. */ (
                                    value
                                ) =>
                                    record(value.marker).pipe(
                                        Effect.map(
                                            /** Distinct output shape proves positional decoding over actual HTTP. */ (
                                                position
                                            ) => ({ label: `${value.label}:${position}` })
                                        )
                                    )
                            ),
                        ],
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
        const captured: string[] = [];
        const logger = Logger.make(
            /** Independently reject credential and raw-value leakage from client/server structured logs. */ (
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
        const socket = yield* NodeSocketServer.make({ host: '127.0.0.1', port: 0 });
        const runner = yield* Layer.build(
            backend(
                yield* Schema.decodeUnknown(DeploymentProfile)({
                    edition: 'community',
                    shards: 8,
                    assignmentRefreshMs: 25,
                    messagePollMs: 25,
                    replyPollMs: 25,
                }),
                initialize,
                Effect.void,
                dependencies,
                undefined,
                socket
            ).pipe(
                Layer.provide(
                    sqlRouter(
                        'postgres',
                        /** Another tenant cannot select this fixture's storage through a header or URL. */ (
                            candidate
                        ) =>
                            candidate === tenant
                                ? Effect.succeed(sql)
                                : Effect.fail(new RoutingDenied({ reason: 'unknown tenant' })),
                        /** Release checks retain the same independently owned route. */ (candidate) =>
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
                /** Dispatch only after actual PostgreSQL shard ownership. */
                until: (value) => value.status === 'healthy',
            }),
            Effect.timeout('10 seconds')
        );
        const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
        const now = Math.floor(Date.now() / 1000);
        /** Mint valid signatures around both allowed and deliberately expired claims, never an accepting verifier. */
        const mint = (overrides: object = {}) => {
            // Claim overrides stay inside the signature so negative controls exercise validation, not broken cryptography.
            const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'at+jwt', kid: 'client-test' })).toString(
                'base64url'
            );
            const claims = Buffer.from(
                JSON.stringify({
                    iss: issuer,
                    sub: 'provider-not-canonical',
                    aud: policy.audience,
                    scope: 'eventiva.invoke',
                    sid: 'client-provider-session',
                    client_id: 'client-fixture',
                    iat: now - 2,
                    nbf: now - 2,
                    exp: now + 300,
                    jti: 'client-proof',
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
                clients: ['client-fixture'],
                algorithms: ['RS256'],
                allowInsecureLoopback: false,
            },
            {
                /** Only discovery/JWKS is synthetic; pinned standards validation verifies every signed request. */
                fetch: (url) =>
                    Promise.resolve(
                        Response.json(
                            url.endsWith('/.well-known/openid-configuration')
                                ? { issuer, jwks_uri: `${issuer}/jwks` }
                                : {
                                      keys: [
                                          {
                                              ...publicKey.export({ format: 'jwk' }),
                                              kid: 'client-test',
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
        const address = yield* serveLocalHttp(policy).pipe(
            Effect.provide(services),
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
        if (address._tag !== 'TcpAddress') return yield* Effect.dieMessage('missing loopback address');
        const baseUrl = `http://127.0.0.1:${address.port}`;
        const token = mint();
        /** Execute the public portable client over real sockets while changing only synthetic caller proof and target. */
        const invoke = <S extends ActionSpec>(
            spec: S,
            value: NoInfer<Input<S>>,
            key = 'client-write',
            credential = token,
            route = tenant
        ) =>
            invokeHttpAction(spec, value, { baseUrl, tenant: route, idempotencyKey: key }).pipe(
                Effect.provide(FetchHttpClient.layer),
                Effect.provideService(HttpActionCredentials, { proof: Effect.succeed(Redacted.make(credential)) }),
                Effect.provide(Logger.replace(Logger.defaultLogger, logger))
            );
        /** Invoke the new public batch client over real JWT/HTTP/SQL/Cluster with no accepting verifier or executor stub. */
        const batch = <const S extends readonly ActionSpec[]>(
            specs: S,
            calls: NoInfer<HttpActionBatchCalls<S>>,
            credential = token,
            route = tenant
        ) =>
            invokeHttpActionBatch(specs, calls, { baseUrl, tenant: route }).pipe(
                Effect.provide(FetchHttpClient.layer),
                Effect.provideService(HttpActionCredentials, { proof: Effect.succeed(Redacted.make(credential)) }),
                Effect.provide(Logger.replace(Logger.defaultLogger, logger))
            );
        /** Fetch caller-private current inventory over the actual signed-proof HTTP boundary, never an in-process document adapter. */
        const discover = (credential = token, route = tenant) =>
            discoverHttpActions({ baseUrl, tenant: route }).pipe(
                Effect.provide(FetchHttpClient.layer),
                Effect.provideService(HttpActionCredentials, { proof: Effect.succeed(Redacted.make(credential)) }),
                Effect.provide(Logger.replace(Logger.defaultLogger, logger))
            );
        return {
            invoke,
            batch,
            discover,
            control,
            sql,
            identity,
            store,
            mint,
            token,
            captured,
            register: Context.get(hostContext, ActionHost).register,
            inventory: Context.get(hostContext, ActionInventory),
        };
    }
);

describe('portable client versus authenticated HTTP and real SQL Cluster', /** New client conformance leaves the original HTTP source and original conformance unchanged. */ () => {
    it.scopedLive(
        'discovers exact current non-sensitive inventory and refreshes after action, transport and SQL authority revocation',
        /** A previously disclosed route remains only historical data; every later GET and invocation rechecks authority. */ () =>
            Effect.gen(
                /** Compare complete provider schemas, then revoke independent gates on the same real host and signed session. */ function* () {
                    // Neither possession of a document nor the client fixture's canonical specs may bypass live SQL authority.
                    const f = yield* fixture;
                    const prefix = `/tenants/${tenant}`;
                    for (const credential of [
                        '',
                        session,
                        'not-a-token',
                        f.mint({ exp: Math.floor(Date.now() / 1000) - 1 }),
                    ])
                        expect((yield* f.discover(credential).pipe(Effect.flip)).reason).toBe('unauthenticated');
                    expect((yield* f.discover(f.token, TenantId.make(id(999))).pipe(Effect.flip)).reason).toBe(
                        'unavailable'
                    );
                    const projected = (yield* f.inventory.list({ subject, session, tenant, kind: 'human' })).filter(
                        /** Match the existing HTTP boundary, not a separately maintained client catalogue. */ (
                            entry
                        ) => !entry.sensitive
                    );
                    const expected = projected.map(
                        /** Include every actually disclosed registered action, not just a known successful route. */ (
                            entry
                        ) => `${prefix}/actions/${entry.id}`
                    );
                    expect(
                        projected
                            .map(
                                /** Assert the fixture's asymmetric complete inventory independently. */ (entry) =>
                                    entry.id
                            )
                            .sort()
                    ).toEqual([batchLabel.name, batchWrite.name, write.name].sort());
                    const first = yield* f.discover();
                    expect(Object.keys(first.paths).sort()).toEqual([...expected, `${prefix}/actions:batch`].sort());
                    expect(first.components.securitySchemes).toEqual({
                        bearerAuth: { type: 'http', scheme: 'bearer' },
                    });
                    for (const action of projected) {
                        const operation = ['paths', `${prefix}/actions/${action.id}`, 'post'];
                        expect(first).toHaveProperty([...operation, 'x-action-version'], action.version);
                        expect(first).toHaveProperty([...operation, 'x-action-permission'], action.permission);
                        expect(first).toHaveProperty([...operation, 'x-action-approval'], action.approval);
                        expect(first).toHaveProperty([...operation, 'x-action-risk'], action.risk);
                        expect(first).toHaveProperty(
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
                        expect(first).toHaveProperty(
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
                    }
                    expect(JSON.stringify(first)).not.toContain(hidden.name);
                    expect(JSON.stringify(first)).not.toContain(sensitive.name);
                    f.control.batch = false;
                    expect(Object.keys((yield* f.discover()).paths).sort()).toEqual(expected.sort());
                    f.control.batch = true;
                    f.control.http = false;
                    expect((yield* f.discover().pipe(Effect.flip)).reason).toBe('unavailable');
                    f.control.http = true;
                    expect(Object.keys((yield* f.discover()).paths).sort()).toEqual(Object.keys(first.paths).sort());
                    f.control.write = false;
                    expect((yield* f.discover()).paths).not.toHaveProperty(`${prefix}/actions/${write.name}`);
                    expect((yield* f.invoke(write, input, 'revoked-discovery').pipe(Effect.flip)).reason).toBe(
                        'unavailable'
                    );
                    f.control.write = true;
                    expect((yield* f.discover()).paths).toHaveProperty(`${prefix}/actions/${write.name}`);
                    const membership = yield* f.identity.get('membership', subject);
                    if (!membership) return yield* Effect.dieMessage('missing discovery membership');
                    yield* f.identity.put('membership', { ...membership.value, roles: [] }, membership.version);
                    // Route advertisement describes transport, not authority: with both gates on, zero roles still exposes batch only.
                    const noRoles = yield* f.discover();
                    expect(Object.keys(noRoles.paths)).toEqual([`${prefix}/actions:batch`]);
                    const batchOperation = ['paths', `${prefix}/actions:batch`, 'post'];
                    expect(noRoles).toHaveProperty(
                        [
                            ...batchOperation,
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
                    expect(noRoles).toHaveProperty(
                        [
                            ...batchOperation,
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
                    expect(
                        (yield* f.batch([write], [{ input, idempotencyKey: 'no-roles-batch' }]).pipe(Effect.flip))
                            .reason
                    ).toBe('unavailable');
                    f.control.batch = false;
                    expect((yield* f.discover()).paths).toEqual({});
                    f.control.batch = true;
                    expect((yield* f.invoke(write, input, 'permission-revoked').pipe(Effect.flip)).reason).toBe(
                        'unavailable'
                    );
                    expect(yield* f.sql`SELECT * FROM action_commit`).toEqual([]);
                    expect(yield* f.sql`SELECT * FROM operational_record`).toEqual([]);
                    expect(Object.keys(first.paths).sort()).toEqual([...expected, `${prefix}/actions:batch`].sort());
                    yield* f.identity.put('membership', { ...membership.value, active: false }, membership.version + 1);
                    expect((yield* f.discover().pipe(Effect.flip)).reason).toBe('unauthenticated');
                    yield* f.identity.put('membership', membership.value, membership.version + 2);
                    expect(Object.keys((yield* f.discover()).paths).sort()).toEqual(Object.keys(first.paths).sort());
                    yield* Effect.scoped(
                        Effect.gen(
                            /** An unrepresentable registered schema must still make actual discovery fail closed. */ function* () {
                                // Scope removal restores inventory; this is a negative contract test, not transformed-server support.
                                const unsupported = define('unsupported.discovery', {
                                    ...common,
                                    input: Schema.Struct({ units: Schema.NumberFromString, adjustment: Schema.Int }),
                                });
                                yield* f.register({
                                    manifest: {
                                        format: 1,
                                        id: 'unsupported-discovery',
                                        version: '1.0.0',
                                        description: 'Negative discovery control.',
                                        actions: [unsupported.name],
                                        flags: [],
                                    },
                                    actions: [
                                        implement(
                                            unsupported,
                                            /** A failed discovery never grants execution. */ () =>
                                                Effect.succeed({ total: 999 })
                                        ),
                                    ],
                                });
                                expect((yield* f.discover().pipe(Effect.flip)).reason).toBe('unavailable');
                            }
                        )
                    );
                    const stored = yield* f.identity.get('session', session);
                    if (!stored) return yield* Effect.dieMessage('missing discovery session');
                    yield* f.identity.put('session', { ...stored.value, active: false }, stored.version);
                    expect((yield* f.discover().pipe(Effect.flip)).reason).toBe('unauthenticated');
                    expect((yield* f.invoke(write, input, 'session-revoked').pipe(Effect.flip)).reason).toBe(
                        'unauthenticated'
                    );
                    expect(yield* f.sql`SELECT * FROM action_commit`).toEqual([]);
                    expect(yield* f.sql`SELECT * FROM operational_record`).toEqual([]);
                    expect(JSON.stringify(f.captured)).not.toContain(f.token);
                    expect(JSON.stringify(f.captured)).not.toContain('provider-not-canonical');
                }
            ),
        60000
    );

    it.scopedLive(
        'preserves heterogeneous order, durable replay and explicit same-key recovery after a refused second item',
        /** Public client calls cross actual JWT, SQL authority and Cluster before independent durable-state assertions. */ () =>
            Effect.gen(
                /** A transient resource refusal is server-side, not a client codec defect or invented rollback. */ function* () {
                    // Asymmetric markers and outputs expose reordering, duplicates and an incorrectly dispatched third item.
                    const f = yield* fixture;
                    const specs = [batchWrite, batchLabel, batchWrite] as const;
                    const calls = [
                        { input: { units: Units.make(7), adjustment: -2 }, idempotencyKey: 'batch:first' },
                        { input: { label: 'middle', marker: Units.make(2) }, idempotencyKey: 'batch:middle' },
                        { input: { units: Units.make(9), adjustment: -3 }, idempotencyKey: 'batch:last' },
                    ] as const;
                    for (const credential of ['', session, f.mint({ exp: Math.floor(Date.now() / 1000) - 1 })])
                        expect((yield* f.batch(specs, calls, credential).pipe(Effect.flip)).reason).toBe(
                            'unauthenticated'
                        );
                    for (const concealed of [hidden, sensitive])
                        expect(
                            (yield* f.batch([batchWrite, concealed], [calls[0], calls[0]]).pipe(Effect.flip)).reason
                        ).toBe('unavailable');
                    const unknown = define('fixture.unknown', common);
                    expect((yield* f.batch([unknown], [calls[0]]).pipe(Effect.flip)).reason).toBe('unavailable');
                    expect(
                        (yield* f.batch(specs, calls, f.token, TenantId.make(id(999))).pipe(Effect.flip)).reason
                    ).toBe('unavailable');
                    f.control.batch = false;
                    expect((yield* f.batch(specs, calls).pipe(Effect.flip)).reason).toBe('unavailable');
                    f.control.batch = true;
                    expect(yield* f.sql`SELECT * FROM action_commit`).toEqual([]);
                    expect(yield* f.store.get(id(800))).toBeUndefined();
                    const first = yield* f.batch(specs, calls);
                    expect(
                        first.map(
                            /** Compare only domain outputs here; durable receipts are independently read below. */ (
                                result
                            ) => result.output
                        )
                    ).toEqual([{ total: 33 }, { label: 'middle:1' }, { total: 44 }]);
                    expect((yield* f.store.get(id(800)))?.payload).toEqual([7, 2, 9]);
                    const commits = yield* f.sql<{
                        key: string;
                        result: string;
                    }>`SELECT key, result FROM action_commit WHERE result IS NOT NULL ORDER BY key`;
                    expect(commits).toHaveLength(3);
                    const replay = yield* f.batch(specs, calls);
                    expect(
                        replay.map(/** Stable outputs accompany fresh invocation receipts. */ (result) => result.output)
                    ).toEqual([{ total: 33 }, { label: 'middle:1' }, { total: 44 }]);
                    for (let index = 0; index < 3; index++)
                        expect(replay[index]?.receiptId).not.toBe(first[index]?.receiptId);
                    expect(
                        yield* f.sql`SELECT key, result FROM action_commit WHERE result IS NOT NULL ORDER BY key`
                    ).toEqual(commits);
                    expect((yield* f.store.get(id(800)))?.payload).toEqual([7, 2, 9]);

                    const recovery = [
                        { input: { units: Units.make(11), adjustment: -4 }, idempotencyKey: 'recovery:first' },
                        { input: { label: 'recover', marker: Units.make(22) }, idempotencyKey: 'recovery:second' },
                        { input: { units: Units.make(13), adjustment: 2 }, idempotencyKey: 'recovery:third' },
                    ] as const;
                    f.control.denySecond = true;
                    const refusal = yield* f.batch(specs, recovery).pipe(Effect.flip);
                    expect(refusal.reason).toBe('unavailable');
                    expect(Object.keys(refusal).sort()).toEqual(['_tag', 'reason']);
                    expect((yield* f.store.get(id(800)))?.payload).toEqual([7, 2, 9, 11]);
                    const prefix = yield* f.sql<{
                        key: string;
                        result: string;
                    }>`SELECT key, result FROM action_commit WHERE result IS NOT NULL ORDER BY key`;
                    expect(prefix).toHaveLength(4);
                    // Refusal of item two leaves no partial-success result, but the first item is already committed.
                    f.control.denySecond = false;
                    const recovered = yield* f.batch(specs, recovery);
                    expect(
                        recovered.map(
                            /** Recovery retains the original input/key tuple rather than constructing a new intent. */ (
                                result
                            ) => result.output
                        )
                    ).toEqual([{ total: 54 }, { label: 'recover:4' }, { total: 72 }]);
                    expect((yield* f.store.get(id(800)))?.payload).toEqual([7, 2, 9, 11, 22, 13]);
                    expect(yield* f.sql`SELECT key, result FROM action_commit WHERE result IS NOT NULL`).toHaveLength(
                        6
                    );
                    for (const row of prefix)
                        expect(yield* f.sql`SELECT key, result FROM action_commit WHERE key = ${row.key}`).toEqual([
                            row,
                        ]);
                    const membership = yield* f.identity.get('membership', subject);
                    if (!membership) return yield* Effect.dieMessage('missing membership');
                    yield* f.identity.put('membership', { ...membership.value, roles: [] }, membership.version);
                    expect((yield* f.batch(specs, recovery).pipe(Effect.flip)).reason).toBe('unavailable');
                    yield* f.identity.put('membership', membership.value, membership.version + 1);
                    const stored = yield* f.identity.get('session', session);
                    if (!stored) return yield* Effect.dieMessage('missing session');
                    yield* f.identity.put('session', { ...stored.value, active: false }, stored.version);
                    expect((yield* f.batch(specs, recovery).pipe(Effect.flip)).reason).toBe('unauthenticated');
                    expect((yield* f.store.get(id(800)))?.payload).toEqual([7, 2, 9, 11, 22, 13]);
                    expect(JSON.stringify(f.captured)).not.toContain(f.token);
                }
            ),
        60000
    );

    it.scopedLive(
        'preserves canonical output, durable replay and live denial without treating spec possession as authority',
        /** Exercise all acceptance through the client, then inspect independent durable SQL evidence. */ () =>
            Effect.gen(
                /** Own one live host so later policy/session changes must invalidate earlier successful calls. */ function* () {
                    const f = yield* fixture;
                    for (const credential of [
                        '',
                        session,
                        'not-a-token',
                        f.mint({ exp: Math.floor(Date.now() / 1000) - 1 }),
                    ]) {
                        const refused = yield* f.invoke(write, input, 'invalid-proof', credential).pipe(Effect.flip);
                        expect(refused).toBeInstanceOf(HttpActionClientFailure);
                        expect(refused.reason).toBe('unauthenticated');
                    }
                    for (const spec of [hidden, sensitive]) {
                        expect((yield* f.invoke(spec, input, 'hidden').pipe(Effect.flip)).reason).toBe('unavailable');
                    }
                    expect(
                        (yield* f.invoke(write, input, 'foreign', f.token, TenantId.make(id(999))).pipe(Effect.flip))
                            .reason
                    ).toBe('unavailable');
                    const first = yield* f.invoke(write, input);
                    expect(first.output).toEqual({ total: 33 });
                    expect(first.receiptId.length).toBeGreaterThan(0);
                    const committed = yield* f.sql<{
                        result: string;
                    }>`SELECT result FROM action_commit WHERE result IS NOT NULL`;
                    expect(committed).toHaveLength(1);
                    const original = yield* Schema.decodeUnknown(
                        Schema.parseJson(
                            Schema.Struct({
                                output: Schema.Struct({ total: Schema.Int }),
                                receipt: Schema.Struct({ id: Schema.String }),
                            })
                        )
                    )(committed[0]?.result);
                    expect(original).toEqual({ output: { total: 33 }, receipt: { id: first.receiptId } });
                    const replay = yield* f.invoke(write, input);
                    expect(replay.output).toEqual({ total: 33 });
                    // A fresh wire invocation records reauthorization; it does not replace the original commit receipt.
                    expect(replay.receiptId).not.toBe(first.receiptId);
                    expect(
                        yield* f.sql<{ result: string }>`SELECT result FROM action_commit WHERE result IS NOT NULL`
                    ).toEqual(committed);
                    expect(
                        (yield* f.invoke(write, { units: Units.make(9), adjustment: -2 }).pipe(Effect.flip)).reason
                    ).toBe('unavailable');
                    expect(
                        yield* f.sql<{ count: number }>`SELECT COUNT(*)::integer AS count FROM operational_record`
                    ).toEqual([{ count: 1 }]);
                    expect(
                        (yield* f.identity.audit(100))
                            .filter(
                                /** Require independent persisted receipts for both successful invocations. */ (
                                    receipt
                                ) => receipt.outcome === 'succeeded'
                            )
                            .map(
                                /** Raw provider subjects cannot substitute for canonical SQL identity. */ (receipt) =>
                                    receipt.caller
                            )
                    ).toEqual([
                        { subject, session, tenant, kind: 'human' },
                        { subject, session, tenant, kind: 'human' },
                    ]);
                    yield* Effect.scoped(
                        Effect.gen(
                            /** A portable codec can be valid while this server's current discovery compiler explicitly cannot advertise it. */ function* () {
                                // Unregister on scope close; otherwise the negative discovery control would mask later revocation checks.
                                const unsupported = define('unsupported.transform', {
                                    ...common,
                                    input: Schema.Struct({ units: Schema.NumberFromString, adjustment: Schema.Int }),
                                });
                                yield* f.register({
                                    manifest: {
                                        format: 1,
                                        id: 'unsupported',
                                        version: '1.0.0',
                                        description: 'Transformation negative control.',
                                        actions: [unsupported.name],
                                        flags: [],
                                    },
                                    actions: [
                                        implement(
                                            unsupported,
                                            /** This handler must never become reachable through failed discovery. */ () =>
                                                Effect.succeed({ total: 999 })
                                        ),
                                    ],
                                });
                                expect(
                                    (yield* f.inventory
                                        .list({ subject, session, tenant, kind: 'human' })
                                        .pipe(Effect.either))._tag
                                ).toBe('Left');
                                expect((yield* f.invoke(write, input).pipe(Effect.flip)).reason).toBe('unavailable');
                            }
                        )
                    );
                    const membership = yield* f.identity.get('membership', subject);
                    if (!membership) return yield* Effect.dieMessage('fixture membership missing');
                    yield* f.identity.put('membership', { ...membership.value, roles: [] }, membership.version);
                    expect((yield* f.invoke(write, input).pipe(Effect.flip)).reason).toBe('unavailable');
                    yield* f.identity.put('membership', membership.value, membership.version + 1);
                    const stored = yield* f.identity.get('session', session);
                    if (!stored) return yield* Effect.dieMessage('fixture session missing');
                    yield* f.identity.put('session', { ...stored.value, active: false }, stored.version);
                    expect((yield* f.invoke(write, input).pipe(Effect.flip)).reason).toBe('unauthenticated');
                    expect(
                        yield* f.sql<{ count: number }>`SELECT COUNT(*)::integer AS count FROM operational_record`
                    ).toEqual([{ count: 1 }]);
                    expect(JSON.stringify(f.captured)).not.toContain(f.token);
                    expect(JSON.stringify(f.captured)).not.toContain('provider-not-canonical');
                }
            ),
        60000
    );
});
