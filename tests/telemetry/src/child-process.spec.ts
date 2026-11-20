/**
 * @file tests/telemetry/src/child-process.spec.ts
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

import { describe, expect, it } from '@effect/vitest';
import { Flags } from '@eventiva/contracts/flags';
import { Effect, Exit, Layer, Option, Schema } from 'effect';
import { vi } from 'vitest';
import {
    ChildTimingEnabled,
    childBudgetIssue,
    childTests,
    childTimingFlag,
    runChild,
    withChildBudgets,
} from './child-process.ts';

describe('budgeted subprocess contract', /** Test public plans, real child results and mandatory safe timing. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () => {
    it('rejects the original incompatible bounds and reserves termination headroom', /** Equal sums still leave no time for assertions or cleanup. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () => {
        // Adjacent passing and failing sums expose the strict cleanup/headroom boundary, not just gross overruns.
        expect(childBudgetIssue([10000, 10000], 5000)).toMatch(/fit below.*shorten/);
        expect(childBudgetIssue([2400, 2400], 5000)).toMatch(/fit below/);
        expect(childBudgetIssue([2300, 2300], 5000)).toBeUndefined();
        expect(childBudgetIssue([60000], 65000)).toBeUndefined();
        for (const budgets of [[], [0], [NaN], [Infinity], [1.5], [-1]])
            expect(childBudgetIssue(budgets, 5000)).toMatch(/positive integer/);
        expect(childTimingFlag.safeDefault).toBe(false);
    });

    it('rejects incompatible budgets during registration', /** Fail collection before a process can be created. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () => {
        expect(
            /** Invalid registration must not reach the runner. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () =>
                childTests()(
                    'invalid plan',
                    [10000, 10000],
                    /** No process is needed to reject a malformed plan. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () =>
                        Effect.void
                )
        ).toThrow(/fit below/);
    });

    it.live(
        'requires the enabled test flag and rejects undeclared or unused children',
        /** A false provider must fail, not silently remove the observability invariant. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () =>
            Effect.gen(
                /** Catch typed failures as observable scenario outcomes. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ function* () {
                    // Rejected work uses an unmistakable exit code; the permitted control must still complete normally.
                    const disabled = Layer.succeed(Flags, {
                        /** Simulate a test override that tries to disable mandatory diagnostics. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */
                        evaluate: (flag) =>
                            Effect.succeed({ flag: flag.key, value: false, reason: 'STATIC', fallback: false }),
                    });
                    const off = yield* withChildBudgets([500], runChild(['--eval', 'process.exit(77)'])).pipe(
                        Effect.provide(disabled),
                        Effect.exit
                    );
                    expect(Exit.isFailure(off)).toBe(true);
                    expect(String(off)).toContain('Child timing must be enabled');
                    const unused = yield* withChildBudgets([500], Effect.void).pipe(Effect.exit);
                    expect(String(unused)).toContain('Unused child budget');
                    const extra = yield* withChildBudgets(
                        [500],
                        Effect.gen(
                            /** The second launch has no declared lifetime. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ function* () {
                                // One real admitted child distinguishes slot exhaustion from a globally broken launcher.
                                const first = yield* runChild(['--eval', 'process.stdout.write("control")']);
                                expect(first.status).toBe(0);
                                return yield* runChild(['--eval', 'process.exit(77)']);
                            }
                        )
                    ).pipe(Effect.provide(ChildTimingEnabled), Effect.exit);
                    expect(String(extra)).toContain('Undeclared child launch');
                }
            )
    );

    it.live(
        'records phases without payloads and preserves real output and exit',
        /** Timing must not alter business output or expose arbitrary data. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () =>
            Effect.gen(
                /** Inspect the public timing journal and emitted diagnostic records. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ function* () {
                    // Capture the external safe records without mocking or changing the child's business streams.
                    const output = vi.spyOn(process.stdout, 'write');
                    try {
                        const result = yield* withChildBudgets(
                            [1000],
                            runChild([
                                '--eval',
                                'process.stdout.write("SECRET_CANARY"); process.stderr.write("business-error"); process.exitCode=7',
                            ])
                        ).pipe(Effect.provide(ChildTimingEnabled));
                        expect(result.status).toBe(7);
                        expect(result.error).toBeUndefined();
                        expect(result.stdout).toBe('SECRET_CANARY');
                        expect(result.stderr).toBe('business-error');
                        expect(
                            result.timings?.map(
                                /** Compare only contractual phase names, not volatile timestamps. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
                                    row
                                ) => row.phase
                            )
                        ).toEqual(
                            expect.arrayContaining(['spawn-request', 'spawned', 'output-first', 'exit', 'total'])
                        );
                        expect(
                            result.timings?.every(
                                /** No phase may report a negative or unbounded duration. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
                                    row
                                ) => Number.isFinite(row.elapsedMs) && row.elapsedMs >= 0
                            )
                        ).toBe(true);
                        const journal = JSON.stringify(output.mock.calls);
                        expect(journal).toContain('test.child.timing');
                        expect(journal).not.toMatch(/SECRET_CANARY|business-error|--eval/);
                    } finally {
                        output.mockRestore();
                    }
                }
            )
    );

    it.live(
        'bounds a stuck child and awaits close on interruption',
        /** Deadline and cancellation must both release the process before the scenario finishes. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () =>
            Effect.gen(
                /** Use a real keepalive instead of relying on mocked signals. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ function* () {
                    // Deadline expiry is a result; parent interruption must also wait for resource release.
                    const stuck = ['--eval', 'setInterval(() => {}, 1000)'];
                    const result = yield* withChildBudgets([150], runChild(stuck)).pipe(
                        Effect.provide(ChildTimingEnabled)
                    );
                    expect(result.error).toMatchObject({ code: 'ETIMEDOUT' });
                    expect(result.signal).toBe('SIGTERM');
                    expect(result.timings?.at(-1)?.phase).toBe('total');
                    const output = vi.spyOn(process.stdout, 'write');
                    try {
                        const interrupted = yield* withChildBudgets([1000], runChild(stuck)).pipe(
                            Effect.provide(ChildTimingEnabled),
                            Effect.timeoutOption('100 millis')
                        );
                        expect(Option.isNone(interrupted)).toBe(true);
                        const phases = output.mock.calls.map(
                            /** Logs are the public cancellation evidence, not private process internals. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
                                call
                            ) =>
                                Schema.decodeUnknownSync(Schema.parseJson(Schema.Struct({ phase: Schema.String })))(
                                    String(call[0])
                                ).phase
                        );
                        expect(phases).toContain('exit');
                        expect(phases.at(-1)).toBe('total');
                        expect(phases).not.toContain('deadline');
                    } finally {
                        output.mockRestore();
                    }
                }
            )
    );
});
