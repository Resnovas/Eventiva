/**
 * @file tests/storage/src/agent-output.spec.ts
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
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqlClient } from '@effect/sql';
import { describe, expect, it } from '@effect/vitest';
import { AgentOutputFailure, AgentOutputLog, type OutputAppend } from '@eventiva/contracts/agent-output';
import { TenantId } from '@eventiva/contracts/ids';
import { CurrentTenant } from '@eventiva/contracts/storage';
import { agentOutputLog } from '@eventiva/integrations.sql/agent-output';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { client } from '@eventiva/integrations.sql/postgres';
import { localFile, memory } from '@eventiva/integrations.sql/sqlite';
import { ConfigProvider, Context, Effect, Layer, Redacted } from 'effect';

const tenant = TenantId.make('019b0000-0000-7000-8000-000000000001');
const other = TenantId.make('019b0000-0000-7000-8000-000000000002');
const runId = '019b0000-0000-7000-8000-000000001001';
const otherRun = '019b0000-0000-7000-8000-000000001002';
const local = process.env['STORAGE_TEST_POSTGRES_URL'] ?? 'postgres://postgres@127.0.0.1:5432/eventiva_test';
const target = new URL(local);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.pathname !== '/eventiva_test')
    throw new Error('Output conformance requires disposable loopback eventiva_test');
/** Connect only to a fixture-owned PostgreSQL database. */
const pg = (url: string) =>
    client.pipe(Layer.provide(Layer.setConfigProvider(ConfigProvider.fromMap(new Map([['DATABASE_URL', url]])))));

describe('durable tenant/run output log', /** Register both real SQL dialects; missing PostgreSQL is a failure. */ () => {
    // Each driver must prove concurrent retry and reconnect guarantees; one dialect's success cannot stand in for the other.
    for (const dialect of ['sqlite', 'postgres'] as const) {
        it.scopedLive(
            `deduplicates concurrent logical retries and reconstructs exclusive pages after ${dialect} reconnect`,
            /** The public port owns persistence assertions; SQL is used only for fault injection and independent isolation controls. */ () =>
                Effect.gen(
                    /** Keep every database disposable and close clients before removing its fixture. */ function* () {
                        let connection: ReturnType<typeof pg> | ReturnType<typeof localFile>;
                        if (dialect === 'sqlite') {
                            const directory = yield* Effect.acquireRelease(
                                Effect.sync(
                                    /** Allocate only test-owned state. */ () =>
                                        mkdtempSync(join(tmpdir(), 'eventiva-output-'))
                                ),
                                /** Remove only this fixture after scoped connections release. */ (path) =>
                                    Effect.sync(
                                        /** No shared state is removed. */ () =>
                                            rmSync(path, { recursive: true, force: true })
                                    )
                            );
                            connection = localFile(Redacted.make(join(directory, 'output.sqlite')));
                        } else {
                            const admin = Context.get(yield* Layer.build(pg(local)), SqlClient.SqlClient);
                            const name = `output_${randomUUID().replaceAll('-', '')}`;
                            yield* admin`CREATE DATABASE ${admin(name)} TEMPLATE template0`;
                            yield* Effect.addFinalizer(
                                /** All opened clients release before plain DROP. */ () =>
                                    admin`DROP DATABASE ${admin(name)}`.pipe(Effect.orDie)
                            );
                            const url = new URL(local);
                            url.pathname = `/${name}`;
                            connection = pg(url.toString());
                        }
                        const first = Context.get(yield* Layer.build(connection), SqlClient.SqlClient);
                        yield* migrate(
                            dialect,
                            yield* load(
                                fileURLToPath(new URL(`../../../storage/migrations/${dialect}`, import.meta.url))
                            )
                        ).pipe(Effect.provideService(SqlClient.SqlClient, first));
                        /** Independently reconnect without reusing any output service state. */
                        const open = (sql: SqlClient.SqlClient) =>
                            Layer.build(
                                agentOutputLog(
                                    /** Tenant is fixed by the route, even when two tenants share one physical database. */ () =>
                                        Effect.succeed(sql)
                                )
                            ).pipe(
                                Effect.map(
                                    /** Return only the privileged public persistence port. */ (context) =>
                                        Context.get(context, AgentOutputLog)
                                )
                            );
                        const a = yield* open(first);
                        const second = Context.get(yield* Layer.build(Layer.fresh(connection)), SqlClient.SqlClient);
                        const b = yield* open(second);
                        const event: OutputAppend = {
                            runId,
                            eventId: 'step:1:text:0',
                            payload: { _tag: 'Text', text: 'approved-output' },
                        };
                        /** Supply tenant authority outside event data; this fixture does not model run authorization. */
                        const inTenant = <A, E>(effect: Effect.Effect<A, E, CurrentTenant>, id = tenant) =>
                            effect.pipe(Effect.provideService(CurrentTenant, { id }));
                        expect(yield* inTenant(a.read({ runId, after: -1, limit: 100 }))).toEqual([]);
                        const retries = yield* Effect.all([inTenant(a.append(event)), inTenant(b.append(event))], {
                            concurrency: 'unbounded',
                        });
                        expect(retries[0]).toEqual(retries[1]);
                        expect(retries[0]?.offset).toBe(0);
                        expect(
                            yield* inTenant(
                                b.append({ ...event, payload: { _tag: 'Text', text: 'changed-private-canary' } })
                            ).pipe(Effect.either)
                        ).toMatchObject({ left: { reason: 'conflict' } });
                        const appends = yield* Effect.forEach(
                            [1, 2, 3, 4, 5, 6, 7],
                            /** Competing distinct events must allocate disjoint offsets, not MAX(offset)+1 races. */ (
                                index
                            ) =>
                                inTenant(
                                    (index % 2 ? a : b).append({
                                        ...event,
                                        eventId: `event:${index}`,
                                        payload: { _tag: 'StepCompleted', stepIndex: index },
                                    })
                                ),
                            { concurrency: 'unbounded' }
                        );
                        expect(
                            appends
                                .map(
                                    /** Compare the complete allocation set independently of scheduling order. */ (
                                        item
                                    ) => item.offset
                                )
                                .sort()
                        ).toEqual([1, 2, 3, 4, 5, 6, 7]);
                        const prefix = yield* inTenant(a.read({ runId, after: -1, limit: 3 }));
                        expect(
                            prefix.map(/** Offset order is part of the consumer contract. */ (item) => item.offset)
                        ).toEqual([0, 1, 2]);
                        const c = yield* open(
                            Context.get(yield* Layer.build(Layer.fresh(connection)), SqlClient.SqlClient)
                        );
                        const suffix = yield* inTenant(c.read({ runId, after: 2, limit: 100 }));
                        expect(
                            suffix.map(
                                /** Reconnection must exclude the already consumed cursor itself. */ (item) =>
                                    item.offset
                            )
                        ).toEqual([3, 4, 5, 6, 7]);
                        expect(yield* inTenant(c.read({ runId, after: 7, limit: 1 }))).toEqual([]);
                        expect((yield* inTenant(c.read({ runId, after: 6, limit: 1 })))[0]?.offset).toBe(7);
                        expect(yield* inTenant(c.read({ runId, after: -1, limit: 100 }), other)).toEqual([]);
                        expect(yield* inTenant(c.read({ runId: otherRun, after: -1, limit: 100 }))).toEqual([]);
                        expect((yield* inTenant(c.append(event), other)).offset).toBe(0);
                        expect((yield* inTenant(c.append({ ...event, runId: otherRun }))).offset).toBe(0);
                        for (const limit of [0, 101, 1.5])
                            expect(
                                yield* inTenant(c.read({ runId, after: -1, limit })).pipe(Effect.either)
                            ).toMatchObject({ left: { reason: 'invalid' } });
                        expect(
                            yield* inTenant(c.read({ runId, after: -2, limit: 1 })).pipe(Effect.either)
                        ).toMatchObject({ left: { reason: 'invalid' } });
                        for (const payload of [
                            { _tag: 'Text' as const, text: 'x'.repeat(4097) },
                            { _tag: 'Text' as const, text: 'safe', prompt: 'raw-prompt-canary' },
                        ]) {
                            const failure = yield* inTenant(c.append({ ...event, payload })).pipe(Effect.either);
                            expect(failure).toMatchObject({ left: { reason: 'invalid' } });
                            expect(JSON.stringify(failure)).not.toContain('raw-prompt-canary');
                        }
                        // A rolled-back unrelated transaction cannot own the output commit via SQL's shared transaction tag.
                        const unrelated =
                            dialect === 'sqlite'
                                ? Context.get(yield* Layer.build(memory()), SqlClient.SqlClient)
                                : first;
                        yield* unrelated
                            .withTransaction(
                                inTenant(c.append({ ...event, eventId: 'independent' })).pipe(
                                    Effect.zipRight(Effect.fail('rollback'))
                                )
                            )
                            .pipe(Effect.either);
                        expect((yield* inTenant(b.read({ runId, after: 7, limit: 1 })))[0]?.offset).toBe(8);
                        yield* first`UPDATE agent_output_run SET next_offset = 9007199254740991 WHERE tenant_id = ${tenant} AND run_id = ${otherRun}`;
                        expect(
                            yield* inTenant(c.append({ ...event, runId: otherRun, eventId: 'exhausted' })).pipe(
                                Effect.either
                            )
                        ).toMatchObject({ left: { reason: 'unavailable' } });
                        yield* first`UPDATE agent_output_event SET payload = 'corrupt-private-canary' WHERE tenant_id = ${tenant} AND run_id = ${otherRun}`;
                        const corrupt = yield* inTenant(c.read({ runId: otherRun, after: -1, limit: 1 })).pipe(
                            Effect.either
                        );
                        expect(corrupt).toMatchObject({ left: { reason: 'invalid' } });
                        expect(JSON.stringify(corrupt)).not.toContain('corrupt-private-canary');
                        yield* first`ALTER TABLE agent_output_event RENAME TO unavailable_output_event`;
                        expect(
                            yield* inTenant(c.append({ ...event, eventId: 'outage' })).pipe(Effect.either)
                        ).toMatchObject({ left: { reason: 'unavailable' } });
                        expect(
                            yield* inTenant(c.read({ runId, after: -1, limit: 1 })).pipe(Effect.either)
                        ).toMatchObject({ left: { reason: 'unavailable' } });
                        const denied = Context.get(
                            yield* Layer.build(
                                agentOutputLog(
                                    /** Unknown capability resolution fails before queries. */ () =>
                                        Effect.fail(new AgentOutputFailure({ reason: 'unavailable' }))
                                )
                            ),
                            AgentOutputLog
                        );
                        expect(yield* inTenant(denied.append(event)).pipe(Effect.either)).toMatchObject({
                            left: { reason: 'unavailable' },
                        });
                    }
                ),
            20000
        );
    }
});
