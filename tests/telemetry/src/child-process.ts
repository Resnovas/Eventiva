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

/** Mandatory test diagnostics with a production-safe default; no remote provider or production flag is provisioned. */
export const childTimingFlag: Flag = {
    key: 'telemetry.bootstrap.child-timing',
    description: 'Report closed subprocess phases and per-child elapsed times in bootstrap tests.',
    owner: 'Eventiva bootstrap tests',
    safeDefault: false,
};

/** Mandatory test default through the existing flag service, without a production or environment override. */
export const ChildTimingEnabled = Layer.succeed(Flags, {
    /** Enable only this diagnostic capability; all other declarations retain their safe default. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */
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

/** Timing is relative to parent invocation; a missing output phase means no such output was observed. */
export interface ChildTiming {
    readonly phase: string;
    readonly elapsedMs: number;
}

/** Preserve existing process assertions while exposing bounded, flag-controlled timing evidence. */
export type ChildResult = SpawnSyncReturns<string> & {
    readonly spawnedAtMs: number;
    readonly elapsedMs: number;
    readonly timings?: ReadonlyArray<ChildTiming>;
};

/** A malformed plan or an undeclared launch must fail rather than silently borrowing a test's deadline. */
export class ChildBudgetFailure extends Data.TaggedError('ChildBudgetFailure')<{
    readonly message: string;
}> {}

/** Check declared serial lifetimes plus forced-termination grace before Vitest registers the test. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */
export const childBudgetIssue = (budgets: ReadonlyArray<number>, testMs: number): string | undefined => {
    // Validate lifetimes before arithmetic so unknown values cannot appear to leave spare time.
    if (
        !Number.isSafeInteger(testMs) ||
        testMs <= 0 ||
        budgets.length === 0 ||
        budgets.some(
            /** Reject unknown, unbounded or fractional lifetimes instead of guessing a deadline. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
                value
            ) => !Number.isSafeInteger(value) || value <= 0
        )
    )
        return 'Declare positive integer child budgets and a finite test timeout.';
    if (
        budgets.reduce(
            /** Serial launches consume the same enclosing wall-clock budget. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
                sum,
                value
            ) => sum + value + terminationGraceMs,
            0
        ) >= testMs
    )
        return 'Child budgets and termination grace must fit below the test timeout; measure and shorten the children, not raise the test limit.';
    return undefined;
};

/** One test owns its launch allowance; no child can inherit another test's budget. */
export class ChildProcesses extends Context.Tag('eventiva/tests/ChildProcesses')<
    ChildProcesses,
    {
        /** Launch one declared child with isolated configuration and bounded streams. */
        readonly run: (
            args: ReadonlyArray<string>,
            environment?: Readonly<Record<string, string>>,
            journal?: boolean
        ) => Effect.Effect<ChildResult, ChildBudgetFailure>;
    }
>() {}

/** Invoke the test-owned boundary; direct child_process imports in probe specs are lint errors. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */
export const runChild = (
    args: ReadonlyArray<string>,
    environment: Readonly<Record<string, string>> = {},
    journal = true
) =>
    Effect.flatMap(
        ChildProcesses,
        /** Consume exactly one slot from this test's plan. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
            children
        ) => children.run(args, environment, journal)
    );

/** Collect real stream/exit events without blocking Vitest's watchdog or retaining a child after interruption. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */
const launch = (
    args: ReadonlyArray<string>,
    environment: Readonly<Record<string, string>>,
    journal: boolean,
    budgetMs: number,
    ordinal: number
) =>
    Effect.gen(
        /** Resolve the existing flag before spawning; absence remains default-off. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ function* () {
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
                /** All Node callbacks belong to this one cancellable vendor boundary. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
                    resume
                ) => {
                    const started = performance.now();
                    const spawnedAtMs = Math.round(performance.timeOrigin + started);
                    const timings: ChildTiming[] = [];
                    const seen = new Set<string>();
                    /** Publish closed numeric evidence only; never serialize arbitrary child output or errors. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */
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
                    /** Bound even a child that ignores SIGTERM; the plan reserves this cleanup grace per launch. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */
                    const terminate = (code: string) => {
                        // Preserve the first failure and prevent repeated output from scheduling more kill timers.
                        if (error) return;
                        error = Object.assign(new Error('Bounded child did not complete normally.'), { code });
                        phase(code === 'ETIMEDOUT' ? 'deadline' : 'output-limit');
                        child.kill('SIGTERM');
                        forced = setTimeout(
                            /** A refused graceful signal cannot leak a process beyond this test. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () =>
                                child.kill('SIGKILL'),
                            terminationGraceMs
                        );
                    };
                    const deadline = setTimeout(
                        /** The declared child lifetime, not the enclosing test, initiates termination. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () =>
                            terminate('ETIMEDOUT'),
                        budgetMs
                    );
                    child.once(
                        'spawn',
                        /** Distinguish process creation from module loading and application diagnostics. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () =>
                            phase('spawned')
                    );
                    child.stdout?.on(
                        'data',
                        /** Observe output arrival separately from the later OS exit and pipe close. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
                            chunk: string
                        ) => {
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
                        /** Retain bounded stderr for existing assertions, never for diagnostic logging. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
                            chunk: string
                        ) => {
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
                            /** Decode each complete closed journal row before exposing its phase or timestamp. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
                                chunk: Buffer
                            ) => {
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
                        /** Keep launch failures in the result so existing process assertions remain authoritative. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
                            failure
                        ) => {
                            error = failure;
                        }
                    );
                    child.once(
                        'exit',
                        /** OS exit is distinct from completed pipe collection. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () =>
                            phase('exit')
                    );
                    child.once(
                        'close',
                        /** Emit mandatory close timing even without fd3, then complete after output drains. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#mandatory-phase-evidence */ (
                            status,
                            signal
                        ) => {
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
                        /** Interruption waits for pipe close, not merely signal delivery, before releasing ownership. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
                            complete
                        ) => {
                            // Cancellation must await release instead of racing a deadline or leaving a child alive.
                            clearTimeout(deadline);
                            clearTimeout(forced);
                            if (closed) complete(Effect.void);
                            else {
                                child.once(
                                    'close',
                                    /** Await actual resource release after cancellation. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () =>
                                        complete(Effect.void)
                                );
                                child.kill('SIGKILL');
                            }
                        }
                    );
                }
            );
        }
    );

/** Own a fresh launch allowance for a complete scenario, including rejected plans and interruption. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */
export const withChildBudgets = <A, E, R>(
    budgets: ReadonlyArray<number>,
    program: Effect.Effect<A, E, R | ChildProcesses>,
    testMs = 5000
) =>
    Effect.suspend(
        /** Allocate allowance only when the scenario actually runs. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () => {
            // Runtime clients get registration's validation too; a direct program cannot bypass the budget invariant.
            const issue = childBudgetIssue(budgets, testMs);
            if (issue) return Effect.fail(new ChildBudgetFailure({ message: issue }));
            let launched = 0;
            return program.pipe(
                Effect.provideService(ChildProcesses, {
                    /** Reject undeclared work before process creation, even when its typed failure is caught by the caller. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */
                    run: (args, environment = {}, journal = true) =>
                        Effect.suspend(
                            /** Lazy Effect construction must not consume an allowance. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () => {
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
                    /** Preserve every declared positive control instead of accepting a silently shortened scenario. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () =>
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

/** Register tests with one source for child lifetimes, enclosing timeout and mandatory diagnostic flag injection. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */
export const childTests =
    (flags: Layer.Layer<Flags> = ChildTimingEnabled) =>
    /** Bind each test's declared limits to the runner timeout; flag overrides cannot suppress child timings. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ <
        A,
        E,
    >(
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
            /** Every runner execution receives a fresh plan and explicit on-by-default test flag layer. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () =>
                withChildBudgets(budgets, body(), testMs).pipe(Effect.provide(flags)),
            testMs
        );
    };
