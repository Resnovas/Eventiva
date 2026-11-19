/**
 * @file tests/runtime/src/proof-boundary-qualification.spec.ts
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

import { define } from '@eventiva/contracts/action';
import { Caller, type CallerIdentity } from '@eventiva/contracts/caller';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import { SessionId, SubjectId, TenantId } from '@eventiva/contracts/ids';
import { implement } from '@eventiva/runtime/action';
import { ActionHost, ActionHostLive } from '@eventiva/runtime/host';
import { Approvals, FailClosed } from '@eventiva/runtime/invocation';
import { makeTestOnlyHarness, testOnlyDigest } from '@eventiva/runtime/testing';
import { expect, it } from '@effect/vitest';
import { Context, Effect, Exit, Layer, Ref, Schema } from 'effect';

const human: CallerIdentity = {
    subject: SubjectId.make('019b0000-0000-7000-8000-000000000001'),
    tenant: TenantId.make('019b0000-0000-7000-8000-000000000002'),
    session: SessionId.make('019b0000-0000-7000-8000-000000000003'),
    kind: 'human',
};
const action = define('qualification.proof', {
    version: 3,
    description: 'Qualify unavailable approval lookup without claiming a production proof store.',
    permission: 'qualification.proof',
    sideEffect: 'write',
    offline: 'online-only',
    approval: 'always',
    input: Schema.Struct({ quantity: Schema.Number }),
    output: Schema.Number,
    error: Schema.Never,
});

it.scoped(
    'default approval lookup denies a fixture-valid opaque id while a supplied test provider permits replay',
    /** Compare the real unavailable provider with an explicitly volatile accepting control through public host execution. */ () =>
        Effect.gen(
            /** Isolate approval availability from otherwise identical identity, policy, handler and audit fixtures. */ function* () {
                const unavailable = yield* Approvals.pipe(Effect.provide(FailClosed));
                for (const accepting of [false, true]) {
                    const h = yield* makeTestOnlyHarness(human);
                    const calls = yield* Ref.make(0);
                    // The same id has valid fixture evidence in both cases. Only the selected lookup service changes.
                    yield* Ref.set(
                        h.approvals,
                        new Map([
                            [
                                'opaque-proof',
                                {
                                    principal: human.subject,
                                    tenant: human.tenant,
                                    action: action.name,
                                    version: action.version,
                                    inputHash: testOnlyDigest('{"quantity":7}'),
                                    limits: {},
                                    approver: human,
                                    issuedAt: 0,
                                    expiresAt: 60_000,
                                    stepUp: false,
                                },
                            ],
                        ])
                    );
                    const services = accepting
                        ? h.TestOnly
                        : Layer.merge(h.TestOnly, Layer.succeed(Approvals, unavailable));
                    const context = yield* Layer.build(
                        ActionHostLive.pipe(Layer.provide(services), Layer.provide(FlagsSafeDefaults))
                    );
                    const host = Context.get(context, ActionHost);
                    yield* host.register({
                        manifest: {
                            format: 1,
                            id: 'qualification',
                            version: '1.0.0',
                            description: 'Volatile proof boundary control, not production custody.',
                            actions: [action.name],
                            flags: [],
                        },
                        actions: [
                            implement(
                                action,
                                /** Stage observable business data only after the host admits the proof. */ (input) =>
                                    Ref.update(
                                        calls,
                                        /** Count handler entries independently from transaction rollback. */ (count) =>
                                            count + 1
                                    ).pipe(
                                        Effect.zipRight(h.ledger.stage('domain', input.quantity)),
                                        Effect.as(input.quantity)
                                    )
                            ),
                        ],
                    });
                    const execute = host
                        .execute(
                            action.name,
                            { quantity: 7 },
                            {
                                idempotencyKey: 'same-intent',
                                approvalId: 'opaque-proof',
                            }
                        )
                        .pipe(Effect.provideService(Caller, human));
                    const first = yield* execute;
                    const second = yield* execute;
                    const state = yield* Ref.get(h.state);
                    if (accepting) {
                        expect(first.result).toEqual(Exit.succeed(7));
                        expect(first.replayed).toBe(false);
                        expect(second.result).toEqual(Exit.succeed(7));
                        expect(second.replayed).toBe(true);
                        expect(yield* Ref.get(calls)).toBe(1);
                        expect(state.domain).toEqual([7]);
                        expect(state.dedup.size).toBe(1);
                    } else {
                        expect(first.result).toMatchObject({ _tag: 'Failure' });
                        expect(second.result).toMatchObject({ _tag: 'Failure' });
                        expect(JSON.stringify(first.result)).toContain('approval-unavailable');
                        expect(JSON.stringify(first.result)).not.toContain('opaque-proof');
                        expect(yield* Ref.get(calls)).toBe(0);
                        expect(state.domain).toEqual([]);
                        expect(state.dedup.size).toBe(0);
                        expect(state.receipts).toHaveLength(2);
                        expect(first.receipt.outcome).toBe('denied');
                        expect(second.receipt.outcome).toBe('denied');
                    }
                }
            }
        )
);
