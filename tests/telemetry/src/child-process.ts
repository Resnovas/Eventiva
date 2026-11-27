/**
 * @file tests/telemetry/src/child-process.ts
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

import { spawn, type SpawnSyncReturns } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { it } from '@effect/vitest';
import { Flags, type Flag } from '@eventiva/contracts/flags';
import { Context, Data, Effect, Layer, Option, Schema } from 'effect';

const workspace = fileURLToPath(new URL('../../../', import.meta.url));
const terminationGraceMs = 100;

/**
 * Mandatory test diagnostics with a production-safe default; no remote provider or production flag is provisioned.
 *
 * @since 0.0.1
 * @example const enabled = (yield* flags.evaluate(childTimingFlag)).value;
 */
export const childTimingFlag: Flag = {
    key: 'telemetry.bootstrap.child-timing',
    description: 'Report closed subprocess phases and per-child elapsed times in bootstrap tests.',
    owner: 'Eventiva bootstrap tests',
    safeDefault: false,
};

/**
 * Mandatory test default through the existing flag service, without a production or environment override.
 *
 * @since 0.0.1
 * @example withChildBudgets([1500], program).pipe(Effect.provide(ChildTimingEnabled));
 */
export const ChildTimingEnabled = Layer.succeed(Flags, {
    /**
     * Enable only this diagnostic capability; all other declarations retain their safe default.
     *
     * @param flag - Declared flag being evaluated; only the child-timing flag is switched on.
     * @returns A static evaluation that is on for child timing and the safe default for every other flag.
     * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
     */
    evaluate: (flag) =>
        Effect.succeed({
            flag: flag.key,
            value: flag.key === childTimingFlag.key || flag.safeDefault,
            reason: 'STATIC',
            fallback: false,
        }),
});

/** Safe phases contain no command, configuration, stream payload, identity or filesystem path. */
const JournalPhase = Schema.String.pipe(
    Schema.pattern(
        /^(?:child-start|module-first|module-64|module-256|module-1024|entry-source-loaded|effect-source-loaded|root-start|bootstrap-failure-logged|process-before-exit|process-exit-success|process-exit-failure|(?:main-use-exit|main-services-released|main-telemetry-released|bootstrap-use-exit|root-exit):(?:success|failure|interrupted))(?![\s\S])/
    )
);
const JournalRow = Schema.parseJson(
    Schema.Tuple(JournalPhase, Schema.Int.pipe(Schema.nonNegative(), Schema.lessThanOrEqualTo(Number.MAX_SAFE_INTEGER)))
);

/**
 * Timing is relative to parent invocation; a missing output phase means no such output was observed.
 *
 * @since 0.0.1
 * @example const timing: ChildTiming = { phase: 'spawned', elapsedMs: 12 };
 */
export interface ChildTiming {
    readonly phase: string;
    readonly elapsedMs: number;
}

/**
 * Preserve existing process assertions while exposing bounded, flag-controlled timing evidence.
 *
 * @since 0.0.1
 * @example const result: ChildResult = yield* runChild(['--version']);
 */
export type ChildResult = SpawnSyncReturns<string> & {
    readonly spawnedAtMs: number;
    readonly elapsedMs: number;
    readonly timings?: ReadonlyArray<ChildTiming>;
};

/**
 * A malformed plan or an undeclared launch must fail rather than silently borrowing a test's deadline.
 *
 * @since 0.0.1
 * @example Effect.fail(new ChildBudgetFailure({ message: 'Undeclared child launch.' }));
 */
export class ChildBudgetFailure extends Data.TaggedError('ChildBudgetFailure')<{
    readonly message: string;
}> {}

/**
 * Check declared serial lifetimes plus forced-termination grace before Vitest registers the test.
 *
 * @param budgets - Declared lifetime in milliseconds of each serial child launch, in launch order.
 * @param testMs - Enclosing Vitest timeout in milliseconds that every lifetime plus grace must fit below.
 * @returns A message describing the invalid plan, or `undefined` when the plan fits.
 * @since 0.0.1
 * @example const issue = childBudgetIssue([1500, 1500], 5000);
 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
 */
export const childBudgetIssue = (budgets: ReadonlyArray<number>, testMs: number): string | undefined => {
    // Validate lifetimes before arithmetic so unknown values cannot appear to leave spare time.
    if (
        !Number.isSafeInteger(testMs) ||
        testMs <= 0 ||
        budgets.length === 0 ||
        budgets.some(
            /**
             * Reject unknown, unbounded or fractional lifetimes instead of guessing a deadline.
             *
             * @param value - One declared child lifetime in milliseconds.
             * @returns Whether the lifetime is not a positive safe integer.
             * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
             */
            (value) => !Number.isSafeInteger(value) || value <= 0
        )
    )
        return 'Declare positive integer child budgets and a finite test timeout.';
    if (
        budgets.reduce(
            /**
             * Serial launches consume the same enclosing wall-clock budget.
             *
             * @param sum - Milliseconds consumed by the launches counted so far.
             * @param value - Next declared child lifetime in milliseconds.
             * @returns The running total including this launch and its termination grace.
             * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
             */
            (sum, value) => sum + value + terminationGraceMs,
            0
        ) >= testMs
    )
        return 'Child budgets and termination grace must fit below the test timeout; measure and shorten the children, not raise the test limit.';
    return undefined;
};

/**
 * One test owns its launch allowance; no child can inherit another test's budget.
 *
 * @since 0.0.1
 * @example const result = yield* Effect.flatMap(ChildProcesses, (children) => children.run(['--version']));
 */
export class ChildProcesses extends Context.Tag('eventiva/tests/ChildProcesses')<
    ChildProcesses,
    {
        /**
         * Launch one declared child with isolated configuration and bounded streams.
         *
         * @param args - Node arguments after the source-conditions flag.
         * @param environment - Complete child environment; nothing is inherited from the parent.
         * @param journal - Whether to open the fd3 phase journal pipe.
         * @returns The collected process result with timing evidence.
         * @fails {ChildBudgetFailure} When the launch is undeclared or child timing is disabled.
         * @example const result = yield* children.run(['--version'], {}, false);
         */
        readonly run: (
            args: ReadonlyArray<string>,
            environment?: Readonly<Record<string, string>>,
            journal?: boolean
        ) => Effect.Effect<ChildResult, ChildBudgetFailure>;
    }
>() {}

/**
 * Invoke the test-owned boundary; direct child_process imports in probe specs are lint errors.
 *
 * @param args - Node arguments after the source-conditions flag.
 * @param environment - Complete child environment; defaults to empty so nothing is inherited.
 * @param journal - Whether to open the fd3 phase journal pipe; defaults to on.
 * @returns The collected process result with timing evidence.
 * @fails {ChildBudgetFailure} When the launch is undeclared or child timing is disabled.
 * @since 0.0.1
 * @example const result = yield* runChild(['--import', fixture, entry], { EVENTIVA_ENV: 'test' });
 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
 */
export const runChild = (
    args: ReadonlyArray<string>,
    environment: Readonly<Record<string, string>> = {},
    journal = true
) =>
    Effect.flatMap(
        ChildProcesses,
        /**
         * Consume exactly one slot from this test's plan.
         *
         * @param children - The test-owned launch service.
         * @returns The launch effect for this child.
         * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
         */
        (children) => children.run(args, environment, journal)
    );

/**
 * Collect real stream/exit events without blocking Vitest's watchdog or retaining a child after interruption.
 *
 * @param args - Node arguments after the source-conditions flag.
 * @param environment - Complete child environment; nothing is inherited from the parent.
 * @param journal - Whether to open the fd3 phase journal pipe.
 * @param budgetMs - Declared lifetime in milliseconds before termination begins.
 * @param ordinal - One-based position of this launch in the test plan, reported with each timing.
 * @returns The collected process result with timing evidence.
 * @fails {ChildBudgetFailure} When child timing is disabled.
 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
 */
const launch = (
    args: ReadonlyArray<string>,
    environment: Readonly<Record<string, string>>,
    journal: boolean,
    budgetMs: number,
    ordinal: number
) =>
    Effect.gen(
        /**
         * Resolve the existing flag before spawning; absence remains default-off.
         *
         * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
         */
        function* () {
            // A false provider is a test-contract failure, never permission to run an unobservable child.
            const flags = yield* Effect.serviceOption(Flags);
            const enabled = Option.isSome(flags)
                ? (yield* flags.value.evaluate(childTimingFlag)).value
                : childTimingFlag.safeDefault;
            if (!enabled)
                return yield* Effect.fail(
                    new ChildBudgetFailure({
                        message:
                            'Child timing must be enabled in tests; use the harness test flag layer and remove the disabling override.',
                    })
                );
            return yield* Effect.async<ChildResult, ChildBudgetFailure>(
                /**
                 * All Node callbacks belong to this one cancellable vendor boundary.
                 *
                 * @param resume - Completes the async effect with the collected result.
                 * @returns The interruption finalizer that waits for the child to close.
                 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                 */
                (resume) => {
                    const started = performance.now();
                    const spawnedAtMs = Math.round(performance.timeOrigin + started);
                    const timings: ChildTiming[] = [];
                    const seen = new Set<string>();
                    /**
                     * Publish closed numeric evidence only; never serialize arbitrary child output or errors.
                     *
                     * @param name - Closed phase label; repeated labels are ignored.
                     * @param elapsedMs - Milliseconds since spawn request; defaults to the time now.
                     * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                     */
                    const phase = (name: string, elapsedMs = Math.round(performance.now() - started)) => {
                        // First observations bound journal floods and preserve the earliest phase timestamp.
                        if (seen.has(name)) return;
                        seen.add(name);
                        const timing = { phase: name, elapsedMs: Math.max(0, elapsedMs) };
                        timings.push(timing);
                        process.stdout.write(
                            `${JSON.stringify({ code: 'test.child.timing', child: ordinal, startedAtMs: spawnedAtMs, budgetMs, ...timing })}\n`
                        );
                    };
                    phase('spawn-request');
                    const child = spawn(process.execPath, ['--conditions=@eventiva/source', ...args], {
                        cwd: workspace,
                        env: { NODE_NO_WARNINGS: '1', ...environment },
                        stdio: journal ? ['pipe', 'pipe', 'pipe', 'pipe'] : ['pipe', 'pipe', 'pipe'],
                    });
                    let stdout = '';
                    let stderr = '';
                    let diagnostic = '';
                    let pendingJournal = '';
                    let bytes = 0;
                    let error: Error | undefined;
                    let forced: ReturnType<typeof setTimeout> | undefined;
                    let closed = false;
                    // Decode across chunks so instrumentation preserves split multibyte business output.
                    child.stdout?.setEncoding('utf8');
                    child.stderr?.setEncoding('utf8');
                    /**
                     * Bound even a child that ignores SIGTERM; the plan reserves this cleanup grace per launch.
                     *
                     * @param code - Failure code, `ETIMEDOUT` for the deadline or `ENOBUFS` for the output cap.
                     * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                     */
                    const terminate = (code: string) => {
                        // Preserve the first failure and prevent repeated output from scheduling more kill timers.
                        if (error) return;
                        error = Object.assign(new Error('Bounded child did not complete normally.'), { code });
                        phase(code === 'ETIMEDOUT' ? 'deadline' : 'output-limit');
                        child.kill('SIGTERM');
                        forced = setTimeout(
                            /**
                             * A refused graceful signal cannot leak a process beyond this test.
                             *
                             * @returns Whether the kill signal was delivered.
                             * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                             */
                            () => child.kill('SIGKILL'),
                            terminationGraceMs
                        );
                    };
                    const deadline = setTimeout(
                        /**
                         * The declared child lifetime, not the enclosing test, initiates termination.
                         *
                         * @returns Nothing; termination is scheduled as a side effect.
                         * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                         */
                        () => terminate('ETIMEDOUT'),
                        budgetMs
                    );
                    child.once(
                        'spawn',
                        /**
                         * Distinguish process creation from module loading and application diagnostics.
                         *
                         * @returns Nothing; the `spawned` phase is recorded as a side effect.
                         * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                         */
                        () => phase('spawned')
                    );
                    child.stdout?.on(
                        'data',
                        /**
                         * Observe output arrival separately from the later OS exit and pipe close.
                         *
                         * @param chunk - Decoded UTF-8 stdout text received from the child.
                         * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                         */
                        (chunk: string) => {
                            // Business output shares a hard cap with diagnostics, independently of stream choice.
                            bytes += Buffer.byteLength(chunk);
                            if (bytes > 65536) {
                                terminate('ENOBUFS');
                                return;
                            }
                            stdout += chunk;
                            phase('output-first');
                            if (
                                /\b(?:bootstrap\.failure|diagnostic\.(?:startup|registered|unavailable))\b/.test(stdout)
                            )
                                phase('diagnostic-output');
                            if (/Eventiva modules registered/.test(stdout)) phase('registration-output');
                        }
                    );
                    child.stderr?.on(
                        'data',
                        /**
                         * Retain bounded stderr for existing assertions, never for diagnostic logging.
                         *
                         * @param chunk - Decoded UTF-8 stderr text received from the child.
                         * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                         */
                        (chunk: string) => {
                            // A child cannot evade the retained-output cap by writing errors instead of results.
                            bytes += Buffer.byteLength(chunk);
                            if (bytes > 65536) {
                                terminate('ENOBUFS');
                                return;
                            }
                            stderr += chunk;
                            phase('output-first');
                        }
                    );
                    const descriptor = child.stdio[3];
                    if (descriptor && 'on' in descriptor)
                        descriptor.on(
                            'data',
                            /**
                             * Decode each complete closed journal row before exposing its phase or timestamp.
                             *
                             * @param chunk - Raw bytes received on the fd3 journal pipe; rows may span chunks.
                             * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                             */
                            (chunk: Buffer) => {
                                // Validate untrusted journal rows before any phase text can enter parent logs.
                                bytes += chunk.length;
                                if (bytes > 65536) {
                                    terminate('ENOBUFS');
                                    return;
                                }
                                diagnostic += chunk.toString('utf8');
                                pendingJournal += chunk.toString('utf8');
                                const lines = pendingJournal.split('\n');
                                pendingJournal = lines.pop() ?? '';
                                for (const line of lines) {
                                    const row = Schema.decodeUnknownOption(JournalRow)(line);
                                    if (Option.isSome(row)) phase(row.value[0], row.value[1] - spawnedAtMs);
                                }
                            }
                        );
                    child.once(
                        'error',
                        /**
                         * Keep launch failures in the result so existing process assertions remain authoritative.
                         *
                         * @param failure - Spawn or signal error Node reported for the child.
                         * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                         */
                        (failure) => {
                            error = failure;
                        }
                    );
                    child.once(
                        'exit',
                        /**
                         * OS exit is distinct from completed pipe collection.
                         *
                         * @returns Nothing; the `exit` phase is recorded as a side effect.
                         * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                         */
                        () => phase('exit')
                    );
                    child.once(
                        'close',
                        /**
                         * Emit mandatory close timing even without fd3, then complete after output drains.
                         *
                         * @param status - Exit code, or `null` when a signal ended the child.
                         * @param signal - Terminating signal, or `null` when the child exited by itself.
                         * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#mandatory-phase-evidence
                         */
                        (status, signal) => {
                            // Pipe close, not OS exit alone, proves all business output has drained.
                            closed = true;
                            clearTimeout(deadline);
                            clearTimeout(forced);
                            phase('close');
                            phase('total');
                            resume(
                                Effect.succeed({
                                    pid: child.pid ?? 0,
                                    status,
                                    signal,
                                    ...(error === undefined ? {} : { error }),
                                    stdout,
                                    stderr,
                                    output: journal ? [null, stdout, stderr, diagnostic] : [null, stdout, stderr],
                                    spawnedAtMs,
                                    elapsedMs: Math.round(performance.now() - started),
                                    timings,
                                })
                            );
                        }
                    );
                    return Effect.async<void>(
                        /**
                         * Interruption waits for pipe close, not merely signal delivery, before releasing ownership.
                         *
                         * @param complete - Resumes the finalizer once the child's pipes have closed.
                         * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                         */
                        (complete) => {
                            // Cancellation must await release instead of racing a deadline or leaving a child alive.
                            clearTimeout(deadline);
                            clearTimeout(forced);
                            if (closed) complete(Effect.void);
                            else {
                                child.once(
                                    'close',
                                    /**
                                     * Await actual resource release after cancellation.
                                     *
                                     * @returns Nothing; the finalizer is resumed as a side effect.
                                     * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                                     */
                                    () => complete(Effect.void)
                                );
                                child.kill('SIGKILL');
                            }
                        }
                    );
                }
            );
        }
    );

/**
 * Own a fresh launch allowance for a complete scenario, including rejected plans and interruption.
 *
 * @template A - Success value of the scenario.
 * @template E - Typed failure of the scenario.
 * @template R - Services the scenario needs besides the launch allowance.
 * @param budgets - Declared lifetime in milliseconds of each serial child launch, in launch order.
 * @param program - Scenario that launches exactly the declared children.
 * @param testMs - Enclosing timeout in milliseconds the plan must fit below; defaults to 5000.
 * @returns The scenario's result once every declared child has launched.
 * @fails {ChildBudgetFailure} When the plan is invalid, a launch is undeclared or a declared launch is unused.
 * @since 0.0.1
 * @example yield* withChildBudgets([1500], runChild([entry]), 5000);
 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
 */
export const withChildBudgets = <A, E, R>(
    budgets: ReadonlyArray<number>,
    program: Effect.Effect<A, E, R | ChildProcesses>,
    testMs = 5000
) =>
    Effect.suspend(
        /**
         * Allocate allowance only when the scenario actually runs.
         *
         * @returns The scenario with a fresh launch allowance, or a budget failure for an invalid plan.
         * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
         */
        () => {
            // Runtime clients get registration's validation too; a direct program cannot bypass the budget invariant.
            const issue = childBudgetIssue(budgets, testMs);
            if (issue) return Effect.fail(new ChildBudgetFailure({ message: issue }));
            let launched = 0;
            return program.pipe(
                Effect.provideService(ChildProcesses, {
                    /**
                     * Reject undeclared work before process creation, even when its typed failure is caught by the caller.
                     *
                     * @param args - Node arguments after the source-conditions flag.
                     * @param environment - Complete child environment; defaults to empty.
                     * @param journal - Whether to open the fd3 phase journal pipe; defaults to on.
                     * @returns A lazy launch that consumes the next declared budget when run.
                     * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                     */
                    run: (args, environment = {}, journal = true) =>
                        Effect.suspend(
                            /**
                             * Lazy Effect construction must not consume an allowance.
                             *
                             * @returns The launch for the next declared budget, or a failure when none remains.
                             * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                             */
                            () => {
                                // Reject before spawn and consume only admitted slots, including caught failures.
                                const budget = budgets[launched];
                                if (budget === undefined)
                                    return Effect.fail(
                                        new ChildBudgetFailure({
                                            message:
                                                'Undeclared child launch; add its measured budget to the test plan.',
                                        })
                                    );
                                launched += 1;
                                return launch(args, environment, journal, budget, launched);
                            }
                        ),
                }),
                Effect.tap(
                    /**
                     * Preserve every declared positive control instead of accepting a silently shortened scenario.
                     *
                     * @returns Success when every declared launch ran, otherwise an unused-budget failure.
                     * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                     */
                    () =>
                        launched === budgets.length
                            ? Effect.void
                            : Effect.fail(
                                  new ChildBudgetFailure({
                                      message:
                                          'Unused child budget; restore the declared control or correct the test plan.',
                                  })
                              )
                )
            );
        }
    );

/**
 * Register tests with one source for child lifetimes, enclosing timeout and mandatory diagnostic flag injection.
 *
 * @param flags - Flag layer provided to each test; defaults to the child-timing test layer.
 * @returns A registrar that declares one budgeted Vitest effect test.
 * @since 0.0.1
 * @example childTests()('reports startup', [1500], () => runChild([entry]), 5000);
 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
 */
export const childTests =
    (flags: Layer.Layer<Flags> = ChildTimingEnabled) =>
    /**
     * Bind each test's declared limits to the runner timeout; flag overrides cannot suppress child timings.
     *
     * @template A - Success value of the test scenario.
     * @template E - Typed failure of the test scenario.
     * @param name - Vitest test name.
     * @param budgets - Declared lifetime in milliseconds of each serial child launch.
     * @param body - Builds the scenario for each run.
     * @param testMs - Vitest timeout in milliseconds; defaults to 5000.
     * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
     */
    <A, E>(
        name: string,
        budgets: ReadonlyArray<number>,
        /** Produce a scenario whose child requirements belong to this test plan. */
        body: () => Effect.Effect<A, E, ChildProcesses>,
        testMs = 5000
    ) => {
        const issue = childBudgetIssue(budgets, testMs);
        // Registration is the Vitest vendor boundary: invalid plans must fail before any child can run.
        if (issue) throw new Error(issue);
        it.effect(
            name,
            /**
             * Every runner execution receives a fresh plan and explicit on-by-default test flag layer.
             *
             * @returns The budgeted scenario with the test flag layer provided.
             * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
             */
            () => withChildBudgets(budgets, body(), testMs).pipe(Effect.provide(flags)),
            testMs
        );
    };
