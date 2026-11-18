/**
 * @file apps/server/tests/agent-output.spec.ts
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
import { SqlClient } from '@effect/sql';
import { expect, it } from '@effect/vitest';
import { AgentOutputLog } from '@eventiva/contracts/agent-output';
import { CallerIdentity } from '@eventiva/contracts/caller';
import { CurrentTenant, JsonValue, RoutingDenied, Storage } from '@eventiva/contracts/storage';
import { agentOutputLog } from '@eventiva/integrations.sql/agent-output';
import { load, migrate } from '@eventiva/integrations.sql/migrations';
import { router } from '@eventiva/integrations.sql/router';
import { memory } from '@eventiva/integrations.sql/sqlite';
import { storage } from '@eventiva/integrations.sql/storage';
import { IdentityResolver, InvocationDenied } from '@eventiva/runtime/invocation';
import { Context, Effect, Fiber, Layer, Ref, Schema } from 'effect';
import { pollAgentOutput, readAgentOutput } from '../src/agent-output.ts';
import { AgentRunAccess, AgentRunDenied, type AgentRunInput } from '../src/agent-run.ts';

const caller = Schema.decodeUnknownSync(CallerIdentity)({
    subject: '019b0000-0000-7000-8000-000000000011',
    session: '019b0000-0000-7000-8000-000000000021',
    tenant: '019b0000-0000-7000-8000-000000000001',
    kind: 'human',
});
const accepted: AgentRunInput = {
    caller,
    runId: '019b0000-0000-7000-8000-000000001001',
    definition: 'scripted-v1',
    steps: [{ _tag: 'Model', input: { _tag: 'Literal', value: 'raw-prompt-canary' } }],
};

it.scopedLive(
    'reauthorizes every exclusive page and refuses foreign sessions, invalid bounds and storage outages',
    /** Exercise the public read against persisted acceptance, not an unauthenticated direct database lookup. */ () =>
        Effect.gen(
            /** SQLite supplies real acceptance/output state; the separate two-process PostgreSQL harness supplies failover proof. */ function* () {
                const sql = Context.get(yield* Layer.build(memory()), SqlClient.SqlClient);
                yield* migrate(
                    'sqlite',
                    yield* load(fileURLToPath(new URL('../../../storage/migrations/sqlite', import.meta.url)))
                ).pipe(Effect.provideService(SqlClient.SqlClient, sql));
                const store = Context.get(
                    yield* Layer.build(storage('sqlite').pipe(Layer.provide(Layer.succeed(SqlClient.SqlClient, sql)))),
                    Storage
                );
                const allowed = yield* Ref.make(true);
                const identity = yield* Ref.make(true);
                const route = yield* Ref.make(true);
                const dependencies = yield* Layer.build(
                    Layer.mergeAll(
                        agentOutputLog(
                            /** Trusted SQL capability cannot be selected by the submitted run reference. */ () =>
                                Effect.succeed(sql)
                        ),
                        Layer.succeed(IdentityResolver, {
                            /** Resolve fresh identity; the fixture never manufactures another tenant's grants. */ resolve:
                                (value) =>
                                    Ref.get(identity).pipe(
                                        Effect.flatMap(
                                            /** Revocation must still win after a previous successful page. */ (
                                                live
                                            ) =>
                                                live
                                                    ? Effect.succeed(value)
                                                    : Effect.fail(
                                                          new InvocationDenied({
                                                              action: '<identity>',
                                                              reason: 'unknown-session',
                                                          })
                                                      )
                                        )
                                    ),
                        }),
                        Layer.succeed(AgentRunAccess, {
                            /** Policy remains independently live, not inferred from output existence. */ check: () =>
                                Ref.get(allowed).pipe(
                                    Effect.flatMap(
                                        /** Convert current policy into a typed denial. */ (live) =>
                                            live ? Effect.void : Effect.fail(new AgentRunDenied({ reason: 'denied' }))
                                    )
                                ),
                        }),
                        router(
                            /** All fixture tenants share SQL so application ownership cannot hide behind different databases. */ () =>
                                Effect.succeed(store),
                            /** Exercise routing revocation after identity resolution separately. */ () =>
                                Ref.get(route).pipe(
                                    Effect.flatMap(
                                        /** No fallback route exists. */ (live) =>
                                            live
                                                ? Effect.void
                                                : Effect.fail(new RoutingDenied({ reason: 'fixture-denied' }))
                                    )
                                )
                        )
                    )
                );
                yield* store.create({
                    id: accepted.runId,
                    state: 'agent-run.accepted-v1',
                    version: 0,
                    leaseUntil: null,
                    payload: Schema.decodeUnknownSync(JsonValue)(accepted),
                });
                const log = Context.get(dependencies, AgentOutputLog);
                if (caller.tenant === undefined) return yield* Effect.die('fixture caller requires tenant');
                yield* log
                    .append({
                        runId: accepted.runId,
                        eventId: 'step:1:text:0',
                        payload: { _tag: 'Text', text: 'released' },
                    })
                    .pipe(Effect.provideService(CurrentTenant, { id: caller.tenant }));
                /** Callers cannot supply tenant or SQL context outside the authorized read contract. */
                const read = (value: Parameters<typeof readAgentOutput>[0]) =>
                    readAgentOutput(value).pipe(Effect.provide(dependencies));
                const request = { caller, runId: accepted.runId, after: -1, limit: 1 };
                expect(
                    (yield* read(request)).map(
                        /** Assert only the explicitly released text, not the accepted prompt. */ (event) =>
                            event.payload
                    )
                ).toEqual([{ _tag: 'Text', text: 'released' }]);
                expect(yield* read({ ...request, after: 0 })).toEqual([]);
                const waiting = yield* pollAgentOutput({ ...request, after: 0 }).pipe(
                    Effect.provide(dependencies),
                    Effect.forkScoped
                );
                yield* Effect.sleep('250 millis');
                yield* log
                    .append({
                        runId: accepted.runId,
                        eventId: 'step:1:complete',
                        payload: { _tag: 'StepCompleted', stepIndex: 1 },
                    })
                    .pipe(Effect.provideService(CurrentTenant, { id: caller.tenant }));
                expect((yield* Fiber.join(waiting))[0]?.offset).toBe(1);
                const revokedPoll = yield* pollAgentOutput({ ...request, after: 1 }).pipe(
                    Effect.provide(dependencies),
                    Effect.either,
                    Effect.forkScoped
                );
                yield* Effect.sleep('250 millis');
                yield* Ref.set(allowed, false);
                expect(yield* Fiber.join(revokedPoll)).toMatchObject({ left: { reason: 'denied' } });
                yield* Ref.set(allowed, true);
                expect(yield* read({ ...request, limit: 101 }).pipe(Effect.either)).toMatchObject({
                    left: { reason: 'invalid' },
                });
                expect(
                    yield* read({ ...request, runId: '019b0000-0000-7000-8000-000000001002' }).pipe(Effect.either)
                ).toMatchObject({ left: { reason: 'missing' } });
                const foreign = Schema.decodeUnknownSync(CallerIdentity)({
                    ...caller,
                    session: '019b0000-0000-7000-8000-000000000022',
                });
                expect(yield* read({ ...request, caller: foreign }).pipe(Effect.either)).toMatchObject({
                    left: { reason: 'denied' },
                });
                for (const control of [identity, allowed, route]) {
                    yield* Ref.set(control, false);
                    expect(yield* read(request).pipe(Effect.either)).toMatchObject({ left: { reason: 'denied' } });
                    yield* Ref.set(control, true);
                }
                yield* sql`ALTER TABLE agent_output_event RENAME TO unavailable_output`;
                const failed = yield* read(request).pipe(Effect.either);
                expect(failed).toMatchObject({ left: { reason: 'unavailable' } });
                expect(JSON.stringify(failed)).not.toContain('raw-prompt-canary');
                expect(JSON.stringify(failed)).not.toContain('unavailable_output');
            }
        )
);
