/**
 * @file apps/server/tests/module-run.spec.ts
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

import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as Entity from '@effect/cluster/Entity';
import { Persisted, ShardGroup } from '@effect/cluster/ClusterSchema';
import * as Rpc from '@effect/rpc/Rpc';
import { SqlClient } from '@effect/sql';
import { describe, expect, it } from '@effect/vitest';
import { define } from '@eventiva/contracts/action';
import { Caller, CallerIdentity } from '@eventiva/contracts/caller';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { TenantId } from '@eventiva/contracts/ids';
import type { RunSnapshot } from '@eventiva/contracts/module-manifest';
import { Receipt } from '@eventiva/contracts/receipt';
import { Json, JsonValue, RoutingDenied, RunFence, Storage } from '@eventiva/contracts/storage';
import { agentOutputLog } from '@eventiva/integrations.sql/agent-output';
import { client } from '@eventiva/integrations.sql/postgres';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { sqlRouter } from '@eventiva/integrations.sql/router';
import { localFile } from '@eventiva/integrations.sql/sqlite';
import { storage } from '@eventiva/integrations.sql/storage';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { canonicalJson } from '@eventiva/runtime/invocation';
import { makeTestOnlyHarness } from '@eventiva/runtime/testing';
import { ConfigProvider, Context, Effect, Either, Layer, Redacted, Ref, Schedule, Schema } from 'effect';
import {
    AgentRunAccess,
    AgentRunDenied,
    AgentRunModel,
    agentRuns,
    registerAgentRuns,
    type AgentRunInput,
} from '../src/agent-run.ts';
import { backend } from '../src/backend.ts';
import { ClusterActions, ClusterInvocation, entityId } from '../src/cluster-actions.ts';
import { DeploymentProfile } from '../src/cluster-profile.ts';
import { ClusterStatus } from '../src/cluster.ts';
import {
    ModuleRunCatalog,
    RunRecoveryRequired,
    registerRunArtifact,
    runArtifact,
    type RunArtifact,
} from '../src/module-run.ts';

const recorded: RunSnapshot = {
    composition: {
        modules: [{ id: 'fixture', version: '1.0.0' }],
        bindings: [{ consumer: 'fixture', requirement: 'math', provider: 'fixture', instance: 'primary' }],
    },
    providers: [{ module: 'fixture', instance: 'primary', configuration: 'immutable-config:old' }],
    schema: [{ name: '0011.sql', checksum: 'a'.repeat(64) }],
    origin: { incarnation: 'original-process', generation: 7 },
};
/** Materialize only against the routed service; the process fixture separately proves actual old executable behavior. */
const artifact = (snapshot: RunSnapshot, version = snapshot.composition.modules[0]!.version): RunArtifact => ({
    snapshot,
    modules: Effect.as(Storage, [
        {
            manifest: {
                format: 1,
                id: 'fixture',
                version,
                description: 'Synthetic retained module.',
                actions: [],
                flags: [],
            },
            actions: [],
        },
    ]),
});
const newer: RunSnapshot = {
    ...recorded,
    composition: { ...recorded.composition, modules: [{ id: 'fixture', version: '2.0.0' }] },
};
const services = storage('sqlite').pipe(Layer.provide(localFile(Redacted.make(':memory:'))));

/** Stable synthetic identities keep business records independent of SQL database allocation. */
const id = (value: number) => `019b0000-0000-7000-8000-${value.toString(16).padStart(12, '0')}`;
/** Compose source-instrumented server paths with actual tenant SQL; forked tests separately own restart evidence. */
const moduleFixture = (withCatalog = true) =>
    Effect.gen(
        /** Acquire only an owned disposable database and close runner/pools before dropping it. */ function* () {
            const target = new URL(
                process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test'
            );
            if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.pathname !== '/eventiva_test')
                return yield* new RunRecoveryRequired();
            /** Keep fixture credentials in the existing redacted configuration boundary. */
            const pg = (url: string) =>
                client.pipe(
                    Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]]))))
                );
            const admin = Context.get(yield* Layer.build(pg(target.toString())), SqlClient.SqlClient);
            const database = `module_${randomUUID().replaceAll('-', '')}`;
            yield* admin`CREATE DATABASE ${admin(database)} TEMPLATE template0`;
            yield* Effect.addFinalizer(
                /** Release only this fixture's sessions; never touch a shared database. */ () =>
                    admin`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ${database} AND usename = current_user AND pid <> pg_backend_pid()`.pipe(
                        Effect.zipRight(admin`DROP DATABASE ${admin(database)}`),
                        Effect.orDie
                    )
            );
            target.pathname = `/${database}`;
            const sql = Context.get(yield* Layer.build(pg(target.toString())), SqlClient.SqlClient);
            const migrations = yield* load(
                fileURLToPath(new URL('../../../storage/migrations/postgres', import.meta.url))
            );
            yield* migrate('postgres', migrations).pipe(Effect.provideService(SqlClient.SqlClient, sql));
            const store = Context.get(
                yield* Layer.build(storage('postgres').pipe(Layer.provide(Layer.succeed(SqlClient.SqlClient, sql)))),
                Storage
            );
            const caller = Schema.decodeUnknownSync(CallerIdentity)({
                subject: id(1),
                session: id(2),
                tenant: id(3),
                kind: 'human',
            });
            const tenant = TenantId.make(id(3));
            const harness = yield* makeTestOnlyHarness(caller);
            const available = yield* Ref.make(true);
            const snapshot: RunSnapshot = {
                ...recorded,
                schema: migrations.map(
                    /** Record every actual migration checksum, not a compatible-looking default. */ ({
                        name,
                        checksum,
                    }) => ({ name, checksum })
                ),
            };
            const spec = define('fixture.pinned', {
                version: 1,
                description: 'Retained SQL action.',
                permission: 'fixture.pinned',
                sideEffect: 'write',
                offline: 'online-only',
                input: Schema.Number,
                output: Schema.Number,
            });
            const retained: RunArtifact = {
                snapshot,
                modules: Effect.gen(
                    /** Capture only the currently routed tenant storage, never bootstrap compute state. */ function* () {
                        // Availability can change after acceptance; refusing here must not silently use a newer default.
                        if (!(yield* Ref.get(available))) return yield* new RunRecoveryRequired();
                        const routed = yield* Storage;
                        return [
                            {
                                manifest: {
                                    format: 1,
                                    id: 'fixture',
                                    version: '1.0.0',
                                    description: 'Retained SQL executable.',
                                    actions: [spec.name],
                                    flags: [],
                                },
                                actions: [
                                    implement(
                                        spec,
                                        /** A real domain row exposes replay or default-selection mistakes. */ (
                                            value
                                        ) =>
                                            routed
                                                .create({
                                                    id: id(10000 + value),
                                                    state: 'complete',
                                                    version: 0,
                                                    leaseUntil: null,
                                                    payload: value,
                                                })
                                                .pipe(Effect.as(value * 3 + 1), Effect.orDie)
                                    ),
                                ],
                            },
                        ];
                    }
                ),
            };
            const catalog = { incarnation: `source:${randomUUID()}`, current: snapshot, artifacts: [retained] };
            const base = Layer.mergeAll(
                harness.TestOnly,
                FlagsSafeDefaults,
                agentOutputLog(
                    /** Resolve the already authenticated disposable tenant only. */ () => Effect.succeed(sql)
                ),
                sqlRouter(
                    'postgres',
                    /** Never allow another tenant to borrow this storage capability. */ (value) =>
                        value === tenant ? Effect.succeed(sql) : Effect.fail(new RoutingDenied({ reason: 'denied' })),
                    /** Synthetic route grants do not replace normal Caller checks. */ () => Effect.void
                ),
                Layer.succeed(AgentRunAccess, {
                    /** Isolate module pinning from policy changes tested by the existing run suite. */ check: () =>
                        Effect.void,
                }),
                Layer.succeed(AgentRunModel, {
                    /** Module runs may not silently enter a model fallback. */ call: () =>
                        Effect.fail(new AgentRunDenied({ reason: 'invalid' })),
                })
            );
            const security = Layer.merge(base, withCatalog ? Layer.succeed(ModuleRunCatalog, catalog) : Layer.empty);
            const profile = yield* Schema.decodeUnknown(DeploymentProfile)({
                edition: 'community',
                port: 34685,
                shards: 24,
                assignmentRefreshMs: 50,
            });
            const context = yield* Layer.build(
                backend(
                    profile,
                    /** A module-bound invocation must never initialize the admission default. */ () =>
                        Effect.fail(new RunRecoveryRequired()),
                    registerAgentRuns.pipe(Effect.provide(security)),
                    harness.TestOnly
                ).pipe(Layer.provideMerge(security), Layer.provide(Layer.succeed(SqlClient.SqlClient, sql)))
            );
            yield* Context.get(context, ClusterStatus).snapshot.pipe(
                Effect.repeat({
                    schedule: Schedule.spaced('25 millis'),
                    /** Wait for real shard ownership rather than assuming startup timing. */ until: (status) =>
                        status.status === 'healthy',
                }),
                Effect.timeout('10 seconds')
            );
            const runs = yield* agentRuns.pipe(Effect.provide(context));
            // An independent wire client bypasses sender checks so receiver denial cannot be mistaken for sender denial.
            const direct = yield* Entity.make('EventivaAction', [
                Rpc.make('Execute', {
                    payload: ClusterInvocation,
                    success: Schema.Struct({
                        output: JsonValue,
                        receipt: Receipt,
                        replayed: Schema.Boolean,
                        audit: Schema.Literal('durable', 'spooled'),
                    }),
                    error: Schema.Struct({ _tag: Schema.Literal('ClusterActionDenied'), reason: Schema.String }),
                }).annotate(Persisted, true),
            ])
                .annotate(
                    ShardGroup,
                    /** Match the deployed wire mailbox without exporting production internals. */ () =>
                        'eventiva-actions'
                )
                .client.pipe(Effect.provide(context));
            const accepted: AgentRunInput = {
                caller,
                runId: id(40),
                definition: 'module-v1',
                steps: [
                    { _tag: 'Action', action: spec.name, entityKey: 'first', input: { _tag: 'Literal', value: 13 } },
                    { _tag: 'Action', action: spec.name, entityKey: 'second', input: { _tag: 'Previous' } },
                ],
            };
            return {
                store,
                sql,
                tenant,
                caller,
                harness,
                available,
                snapshot,
                catalog,
                runs,
                accepted,
                actions: Context.get(context, ClusterActions),
                direct,
            };
        }
    );

describe('module run source composition', /** Instrument the real server seams without confusing coverage with independent-process evidence. */ () => {
    it.scopedLive(
        'binds acceptance, orchestration, receiver artifacts and live sender fences',
        /** Exercise the public internal run/Cluster handles against actual SQL and source modules. */ () =>
            Effect.gen(
                /** Distinct malformed controls must fail before returning retained business success. */ function* () {
                    // This is one live server composition; the separate process harness proves the actual restart case.
                    const f = yield* moduleFixture();
                    yield* f.runs.start(f.accepted);
                    f.catalog.current = { ...f.snapshot, composition: newer.composition };
                    yield* f.runs.status(f.accepted).pipe(
                        Effect.repeat({
                            schedule: Schedule.spaced('20 millis'),
                            /** Observe the public terminal result, not a fixed execution delay. */ until: (value) =>
                                value.state !== 'pending',
                        }),
                        Effect.timeout('15 seconds')
                    );
                    expect(yield* f.runs.status(f.accepted)).toEqual({ state: 'succeeded', output: 121 });
                    yield* f.runs.start(f.accepted);
                    expect((yield* f.store.getRun(f.tenant, f.accepted.runId))?.snapshot).toEqual(f.snapshot);
                    const stored = yield* f.store.getRun(f.tenant, f.accepted.runId);
                    const fence = yield* Schema.decodeUnknown(RunFence)({
                        tenant: f.tenant,
                        runId: f.accepted.runId,
                        owner: stored?.owner,
                        epoch: stored?.epoch,
                    });
                    const request: ClusterInvocation = {
                        caller: f.caller,
                        entityKey: 'first',
                        action: 'fixture.pinned',
                        input: 13,
                        intent: { idempotencyKey: `${f.accepted.runId}:1` },
                        fence,
                    };
                    expect((yield* f.actions.execute(request)).output).toBe(40);
                    /** Bypass only sender caching to test the real receiver's own independently required guards. */
                    const raw = (value: ClusterInvocation) =>
                        f.direct(entityId(value.caller, value.entityKey)).Execute(value);
                    expect(
                        Either.isLeft(yield* Effect.either(raw({ ...request, fence: { ...fence, runId: id(90) } })))
                    ).toBe(true);
                    expect(
                        Either.isLeft(
                            yield* Effect.either(
                                raw({ ...request, intent: { idempotencyKey: `${f.accepted.runId}:99` } })
                            )
                        )
                    ).toBe(true);
                    expect(
                        Either.isLeft(
                            yield* Effect.either(
                                raw({ ...request, fence: { ...fence, tenant: TenantId.make(id(91)) } })
                            )
                        )
                    ).toBe(true);
                    expect(
                        Either.isLeft(
                            yield* Effect.either(
                                f.actions.execute({ ...request, fence: { ...fence, tenant: TenantId.make(id(91)) } })
                            )
                        )
                    ).toBe(true);
                    const changedCaller = {
                        ...f.caller,
                        subject: Schema.decodeUnknownSync(CallerIdentity)({ ...f.caller, subject: id(92) }).subject,
                    };
                    yield* Ref.set(f.harness.identity, changedCaller);
                    expect(Either.isLeft(yield* Effect.either(raw({ ...request, caller: changedCaller })))).toBe(true);
                    yield* Ref.set(f.harness.identity, f.caller);
                    const script = { ...f.accepted, runId: id(93), definition: 'scripted-v1' as const };
                    yield* f.store.acceptRun(
                        f.tenant,
                        script.runId,
                        yield* canonicalJson(script).pipe(Effect.flatMap(Schema.decode(Json))),
                        f.snapshot
                    );
                    const scriptFence = yield* f.store.claimRun(f.tenant, script.runId, 0, 'invalid-script-promotion');
                    expect(
                        Either.isLeft(
                            yield* Effect.either(
                                raw({ ...request, fence: scriptFence, intent: { idempotencyKey: `${script.runId}:1` } })
                            )
                        )
                    ).toBe(true);
                    const successor = yield* f.store.claimRun(f.tenant, f.accepted.runId, fence.epoch, 'successor');
                    expect(Either.isLeft(yield* Effect.either(f.actions.execute(request)))).toBe(true);
                    expect((yield* f.actions.execute({ ...request, fence: successor })).output).toBe(40);
                    yield* Ref.set(f.available, false);
                    expect(yield* Effect.either(f.runs.start(f.accepted))).toMatchObject({
                        left: { reason: 'recovery-required' },
                    });
                    expect(
                        yield* Effect.either(
                            f.runs.start({
                                ...f.accepted,
                                runId: id(94),
                                steps: [{ _tag: 'Model', input: { _tag: 'Literal', value: 17 } }],
                            })
                        )
                    ).toMatchObject({ left: { reason: 'recovery-required' } });
                    expect(yield* f.sql`SELECT * FROM operational_record WHERE state = 'complete'`).toHaveLength(2);
                    expect(yield* f.sql`SELECT * FROM action_commit WHERE result IS NOT NULL`).toHaveLength(2);
                    expect(yield* f.sql`SELECT * FROM agent_output_event`).toHaveLength(2);
                    yield* Ref.set(f.available, true);
                    // An actual database history change must report recovery, not suggest transient availability or repinning.
                    const [latest] = yield* f.sql<{
                        name: string;
                    }>`SELECT name FROM storage_migration ORDER BY name DESC LIMIT 1`;
                    const future = `${String(Number(latest?.name.slice(0, -4) ?? '0') + 1).padStart(4, '0')}.sql`;
                    yield* f.sql`INSERT INTO storage_migration (name, checksum) VALUES (${future}, ${'a'.repeat(64)})`;
                    expect(yield* Effect.either(f.runs.start(f.accepted))).toMatchObject({
                        left: { reason: 'recovery-required' },
                    });
                    expect((yield* f.store.getRun(f.tenant, f.accepted.runId))?.epoch).toBe(successor.epoch);
                }
            ),
        30000
    );
    it.scopedLive(
        'refuses a missing catalog at admission and independently at the receiver',
        /** Possessing a valid tenant owner token cannot substitute for retained executable artifacts. */ () =>
            Effect.gen(
                /** Seed a trusted recorded run only to exercise receiver refusal independently of admission. */ function* () {
                    // Admission must fail without writing; the receiver also fails when a prior deployment supplied the snapshot.
                    const f = yield* moduleFixture(false);
                    expect(yield* Effect.either(f.runs.start(f.accepted))).toMatchObject({
                        left: { reason: 'recovery-required' },
                    });
                    expect(yield* f.sql`SELECT * FROM operational_record`).toHaveLength(0);
                    yield* f.store.acceptRun(
                        f.tenant,
                        f.accepted.runId,
                        yield* canonicalJson(f.accepted).pipe(Effect.flatMap(Schema.decode(Json))),
                        f.snapshot
                    );
                    const fence = yield* f.store.claimRun(f.tenant, f.accepted.runId, 0, 'retained-prior-owner');
                    expect(
                        Either.isLeft(
                            yield* Effect.either(
                                f.direct(entityId(f.caller, 'first')).Execute({
                                    caller: f.caller,
                                    entityKey: 'first',
                                    action: 'fixture.pinned',
                                    input: 13,
                                    intent: { idempotencyKey: `${f.accepted.runId}:1` },
                                    fence,
                                })
                            )
                        )
                    ).toBe(true);
                    expect(yield* f.sql`SELECT * FROM action_commit`).toHaveLength(0);
                }
            ),
        30000
    );
});

describe('exact retained run artifacts', /** Recovery selects identity, never a process default or compatible-looking substitute. */ () => {
    // Every negative still offers a newer artifact, so falling back to the admission default would be observable.
    it.scoped(
        'retains the recorded version/configuration after the admission default changes',
        /** Origin is audit identity, not a requirement to resurrect a dead process. */ () =>
            Effect.gen(
                /** Require actual tenant-bound module materialization through the trusted catalog. */ function* () {
                    // A changed process identity must not invalidate an otherwise exact retained executable selection.
                    const selected = yield* runArtifact(recorded);
                    expect(selected.snapshot).toEqual(recorded);
                    expect(selected.modules[0]?.manifest).toMatchObject({ id: 'fixture', version: '1.0.0' });
                }
            ).pipe(
                Effect.provideService(ModuleRunCatalog, {
                    incarnation: 'restart',
                    current: newer,
                    artifacts: [
                        artifact(newer),
                        artifact({ ...recorded, origin: { incarnation: 'retained-copy', generation: 9 } }),
                    ],
                }),
                Effect.provide(services)
            )
    );
    it.scoped(
        'registers and executes the retained selection rather than the admission default',
        /** Exercise registration through the real host; volatile audit is not durability evidence. */ () =>
            Effect.gen(
                /** A skipped registration or a newer selection must produce a different observable invocation. */ function* () {
                    // This fixture isolates registration; real SQL and process suites own persistence and crash evidence.
                    const caller = Schema.decodeUnknownSync(CallerIdentity)({
                        kind: 'human',
                        subject: '019b0000-0000-7000-8000-000000000001',
                        session: '019b0000-0000-7000-8000-000000000002',
                    });
                    const harness = yield* makeTestOnlyHarness(caller);
                    const context = yield* Layer.build(
                        ActionHostLive.pipe(Layer.provide(harness.TestOnly), Layer.provide(FlagsSafeDefaults))
                    );
                    const host = Context.get(context, ActionHost);
                    const spec = define('fixture.version', {
                        version: 1,
                        description: 'Observe registered retained code.',
                        permission: 'fixture.version',
                        sideEffect: 'read',
                        offline: 'local',
                        input: Schema.Number,
                        output: Schema.Number,
                    });
                    const retained: RunArtifact = {
                        snapshot: recorded,
                        modules: Effect.succeed([
                            {
                                manifest: {
                                    format: 1,
                                    id: 'fixture',
                                    version: '1.0.0',
                                    description: 'Retained executable.',
                                    actions: [spec.name],
                                    flags: [],
                                },
                                actions: [
                                    implement(
                                        spec,
                                        /** Distinct old-code arithmetic, not an identity label. */ (value) =>
                                            Effect.succeed(value * 3 + 1)
                                    ),
                                ],
                            },
                        ]),
                    };
                    yield* registerRunArtifact(host, recorded).pipe(
                        Effect.provideService(ModuleRunCatalog, {
                            incarnation: 'new-process',
                            current: newer,
                            artifacts: [retained, artifact(newer)],
                        })
                    );
                    expect(yield* host.invoke(spec.name, 13).pipe(Effect.provideService(Caller, caller))).toBe(40);
                }
            ).pipe(Effect.provide(services))
    );
    it.scoped(
        'refuses a matching catalog entry whose provider binding has no retained instance',
        /** Matching metadata cannot conceal an incomplete provider selection. */ () =>
            Effect.gen(
                /** Both the recorded and offered metadata omit the instance, forcing validation beyond catalog equality. */ function* () {
                    // Matching broken metadata is not evidence of a complete provider binding, even when catalog equality succeeds.
                    const incomplete = { ...recorded, providers: [] };
                    const result = yield* Effect.either(
                        runArtifact(incomplete).pipe(
                            Effect.provideService(ModuleRunCatalog, {
                                incarnation: 'restart',
                                current: newer,
                                artifacts: [artifact(incomplete)],
                            })
                        )
                    );
                    expect(Either.isLeft(result) && result.left._tag).toBe('RunRecoveryRequired');
                }
            ).pipe(Effect.provide(services))
    );
    for (const [name, artifacts] of [
        ['missing executable', [artifact(newer)]],
        ['mislabeled executable', [artifact(recorded, '2.0.0')]],
        ['missing registered module', [{ ...artifact(recorded), modules: Effect.succeed([]) }]],
        [
            'provider configuration mismatch',
            [artifact({ ...recorded, providers: [{ ...recorded.providers[0]!, configuration: 'latest' }] })],
        ],
        [
            'schema checksum mismatch',
            [artifact({ ...recorded, schema: [{ name: '0011.sql', checksum: 'b'.repeat(64) }] })],
        ],
        ['ambiguous retained artifact', [artifact(recorded), artifact(recorded)]],
        ['missing provider instance', [artifact({ ...recorded, providers: [] })]],
    ] as const) {
        it.scoped(
            `refuses ${name} without latest fallback`,
            /** A wrong retained artifact must fail before any business executor is admitted. */ () =>
                Effect.gen(
                    /** Assert the public bounded recovery error, not an incidental parser or registry failure. */ function* () {
                        // Match the failure category so a missing service or test defect cannot impersonate safe recovery refusal.
                        const result = yield* Effect.either(runArtifact(recorded));
                        expect(Either.isLeft(result) && result.left._tag).toBe('RunRecoveryRequired');
                    }
                ).pipe(
                    Effect.provideService(ModuleRunCatalog, { incarnation: 'restart', current: newer, artifacts }),
                    Effect.provide(services)
                )
        );
    }
});
