/**
 * @file tests/telemetry/src/server.spec.ts
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

import * as FileSystem from '@effect/platform/FileSystem';
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import { describe, expect, it } from '@effect/vitest';
import { TelemetryRecord } from '@eventiva/contracts/observability';
import { consoleLoggerLayer, formatConsoleRecord } from '@eventiva/integrations.telemetry.server/logger';
import { Audit, FailClosed } from '@eventiva/runtime/invocation';
import { telemetryLayer } from '@eventiva/runtime/telemetry';
import { Cause, Config, Effect, Exit, Layer, Option, Schema } from 'effect';
import { childTests, runChild, type ChildResult as LaunchResult } from './child-process.ts';

const childTest = childTests();

/**
 * Keep real main composition, isolated configuration and the observer while consuming the test's declared budget.
 *
 * @param environment - Extra environment variables for the child; defaults to none.
 * @returns An effect yielding the finished child result, including its journal descriptor output.
 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
 */
const launch = (environment: Readonly<Record<string, string>> = {}) =>
    runChild(
        ['--import', './tests/telemetry/fixtures/bootstrap-diagnostics.mjs', 'apps/server/src/main.ts'],
        environment
    );

/**
 * Count timestamp-prefixed console records independently of non-record output.
 *
 * @param output - Captured stdout from one child run.
 * @returns Only the lines that start with an ISO timestamp.
 */
const headers = (output: string): ReadonlyArray<string> =>
    output.split('\n').filter(
        /**
         * Recognize the ISO-date prefix emitted by the console formatter.
         *
         * @param line - One line of captured stdout.
         * @returns Whether the line starts with an ISO date.
         */
        (line) => /^\d{4}-\d\d-\d\dT/.test(line)
    );

const Journal = Schema.parseJson(
    Schema.Array(
        Schema.Tuple(
            Schema.String.pipe(
                Schema.pattern(
                    /^(?:child-start|module-first|module-64|module-256|module-1024|entry-source-loaded|effect-source-loaded|root-start|bootstrap-failure-logged|process-before-exit|process-exit-success|process-exit-failure|(?:main-use-exit|main-services-released|main-telemetry-released|bootstrap-use-exit|root-exit):(?:success|failure|interrupted))(?![\s\S])/
                )
            ),
            Schema.Int.pipe(Schema.nonNegative(), Schema.lessThanOrEqualTo(Number.MAX_SAFE_INTEGER))
        )
    ).pipe(Schema.maxItems(32))
);

/**
 * Reject the entire untrusted journal before it can contribute text to assertion messages.
 *
 * @param input - Raw journal text read from the child descriptor, or nothing when it was not captured.
 * @returns A closed state, with the decoded phases only when the whole journal is valid.
 */
const journalSummary = (input: string | null | undefined) => {
    if (typeof input !== 'string' || input.length === 0) return { state: 'absent' };
    // Validate size before parsing: neither malformed text nor a forged phase can become CI output.
    if (Buffer.byteLength(input) > 4096) return { state: 'oversized' };
    const decoded = Schema.decodeUnknownOption(Journal)(`[${input.trimEnd().split('\n').join(',')}]`);
    return Option.isSome(decoded) ? { state: 'captured', phases: decoded.value } : { state: 'invalid' };
};

/**
 * Describe child termination without retaining configuration values, raw errors or arbitrary process output.
 *
 * @param result - Finished child process result.
 * @returns A JSON summary of timing, exit status, a recognized error code, bounded output summaries and the journal state.
 */
const launchFailureContext = (result: LaunchResult): string => {
    // Keep only closed diagnostic event names: even an unexpected secret format must never reach CI logs.
    /**
     * Bound each output summary to its length and eight recognized diagnostic events, excluding all other text.
     *
     * @param output - Captured stdout or stderr, or null when it was not captured.
     * @returns The character count and at most eight recognized diagnostic event names.
     */
    const summarize = (output: string | null) => ({
        characters: output?.length ?? 0,
        events: (
            output?.match(/\b(?:bootstrap\.failure|diagnostic\.(?:startup|registered|unavailable))\b/g) ?? []
        ).slice(0, 8),
    });
    const errorCode =
        result.error && 'code' in result.error && typeof result.error.code === 'string'
            ? (result.error.code.match(/^(?:ETIMEDOUT|ENOBUFS|ENOENT|EACCES|EAGAIN|ENOMEM|EINVAL|E2BIG|EPERM)$/)?.[0] ??
              'unrecognized')
            : null;
    return JSON.stringify({
        spawnedAtMs: result.spawnedAtMs,
        elapsedMs: result.elapsedMs,
        status: result.status,
        signal: result.signal,
        errorCode,
        stdout: summarize(result.stdout),
        stderr: summarize(result.stderr),
        journal: journalSummary(result.output[3]),
    });
};

describe('bounded bootstrap journal validation', /** Reject diagnostic data independently of bootstrap success or failure. */ () => {
    it('accepts only closed phases and integer timestamps', /** Preserve safe timing while excluding arbitrary child data. */ () => {
        // One valid journal anchors the rejection matrix; invalid data must collapse to a closed state, not echo input.
        expect(journalSummary('["child-start",100]\n["root-exit:failure",251]\n')).toEqual({
            state: 'captured',
            phases: [
                ['child-start', 100],
                ['root-exit:failure', 251],
            ],
        });
        for (const input of [
            'SECRET_BAD_JSON',
            '["SECRET_CANARY",123]\n',
            '["child-start",1.5]\n',
            '["child-start",-1]\n',
            '["child-start",1,"SECRET_CANARY"]\n',
            '["root-exit:failure",1e99]\n',
            '["child-start",1]\n'.repeat(33),
            JSON.stringify(['root-start\n', 123]),
        ]) {
            expect(journalSummary(input)).toEqual({ state: 'invalid' });
        }
        expect(journalSummary(null)).toEqual({ state: 'absent' });
        expect(journalSummary('')).toEqual({ state: 'absent' });
        expect(journalSummary('SECRET'.repeat(1000))).toEqual({ state: 'oversized' });
    });
    it('reports termination and timing without raw errors or output', /** Assertion context retains closed evidence even when every raw channel contains a canary. */ () => {
        const stdout = 'SECRET_STDOUT bootstrap.failure '.repeat(20);
        const stderr = 'SECRET_STDERR';
        const result: LaunchResult = {
            pid: 1,
            status: null,
            signal: 'SIGTERM',
            error: Object.assign(new Error('SECRET_ERROR'), { code: 'ETIMEDOUT' }),
            stdout,
            stderr,
            output: [null, stdout, stderr, '["SECRET_JOURNAL",123]\n'],
            spawnedAtMs: 100,
            elapsedMs: 10000,
        };
        // Error messages and process text must never be serialized alongside safe phase timing.
        const context = launchFailureContext(result);
        expect(context).toContain('"spawnedAtMs":100');
        expect(context).toContain('"elapsedMs":10000');
        expect(context).toContain('"status":null,"signal":"SIGTERM","errorCode":"ETIMEDOUT"');
        expect(context).toContain('"journal":{"state":"invalid"}');
        expect(context.match(/bootstrap.failure/g)).toHaveLength(8);
        expect(context).not.toMatch(/SECRET/);
        expect(context.length).toBeLessThan(5000);
    });
});

describe('real diagnostic server telemetry composition', /** Cover real process exit and scoped sinks independently of in-process service checks. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () => {
    // Child launches use isolated configuration so these checks exercise bootstrap and finalization, not host credentials.
    it.effect(
        'preserves the production fail-closed audit service with telemetry enabled or opted out',
        /**
         * Verify optional telemetry never replaces the production audit denial service.
         *
         * @returns The scenario that builds the server with telemetry on and off and expects audit denial.
         */
        () =>
            Effect.gen(
                /** Require AuditUnavailable under both telemetry settings without installing a permissive audit stub. */ function* () {
                    // Telemetry is optional; mandatory audit denial must survive either configuration.
                    for (const enabled of [true, false]) {
                        const result = yield* Effect.gen(
                            /** Observe the audit failure as an Exit so telemetry cannot hide it behind successful startup. */ function* () {
                                const audit = yield* Audit;
                                // Capture denial inside the telemetry setting's scope rather than after its services are disposed.
                                return yield* Effect.exit(audit.ready('platform.status'));
                            }
                        ).pipe(
                            Effect.provide(
                                Layer.mergeAll(
                                    FailClosed,
                                    telemetryLayer(
                                        { messages: {}, attributes: {} },
                                        Config.succeed({ enabled, capacity: 1, timeoutMs: 100 })
                                    ).pipe(
                                        Layer.provide(
                                            consoleLoggerLayer(
                                                /**
                                                 * Discard console writes; this case tests audit semantics, not output formatting.
                                                 *
                                                 * @returns An effect that writes nothing.
                                                 */
                                                () => Effect.void
                                            )
                                        )
                                    )
                                )
                            )
                        );
                        expect(Exit.isFailure(result)).toBe(true);
                        if (Exit.isFailure(result)) {
                            const denial = Cause.failureOption(result.cause);
                            expect(Option.isSome(denial)).toBe(true);
                            if (Option.isSome(denial)) expect(denial.value._tag).toBe('AuditUnavailable');
                        }
                    }
                }
            )
    );

    childTest(
        'runs the real main and drains one correlated console diagnostic, never ready or banner',
        [2300],
        /**
         * Run the executable without optional configuration to verify its diagnostic-only contract.
         *
         * @returns The scenario that runs the server once and checks its console diagnostics.
         */
        () =>
            Effect.gen(
                /** Require one correlated startup trace and registration diagnostics, never a readiness claim. */ function* () {
                    // Observe the real child to distinguish diagnostic registration from a claim that the platform is ready.
                    const result = yield* launch();
                    expect(result.error, launchFailureContext(result)).toBeUndefined();
                    expect(launchFailureContext(result)).toContain('"state":"captured"');
                    expect(result.status).toBe(0);
                    expect(result.stderr).toBe('');
                    expect(headers(result.stdout)).toHaveLength(3);
                    expect(result.stdout.match(/Diagnostic only:/g)).toHaveLength(1);
                    expect(result.stdout.match(/Eventiva modules registered/g)).toHaveLength(1);
                    expect(result.stdout).toContain('diagnostic.startup');
                    expect(result.stdout).not.toMatch(/app.ready|platform.ready|copyright|bootstrap.failure|redacted/i);
                    expect(
                        new Set(
                            [...result.stdout.matchAll(/trace=([a-f0-9]{32})/g)].map(
                                /**
                                 * Compare trace identities across records without depending on the randomly generated value.
                                 *
                                 * @param match - One trace pattern match from stdout.
                                 * @returns The captured trace identifier.
                                 */
                                (match) => match[1]
                            )
                        ).size
                    ).toBe(1);
                }
            )
    );

    childTest(
        'flushes the real file layer before process exit and releases its scoped lock',
        [2300],
        /**
         * Exercise the configured file sink through the executable with a scoped disposable directory.
         *
         * @returns The scenario that runs the server with a file sink and reads the persisted records.
         */
        () =>
            Effect.gen(
                /** Read persisted diagnostics after process exit to verify draining and lock-file cleanup. */ function* () {
                    const fs = yield* FileSystem.FileSystem;
                    const directory = yield* fs.makeTempDirectoryScoped();
                    const result = yield* launch({ telemetryFile_directory: directory });
                    expect(result.error, launchFailureContext(result)).toBeUndefined();
                    expect(result.status).toBe(0);
                    expect(result.stderr).toBe('');
                    const files = yield* fs.readDirectory(directory);
                    expect(files).toHaveLength(1);
                    expect(files[0]).toMatch(/^\d{4}-\d{2}-\d{2}\.000000\.jsonl$/);
                    const text = yield* fs.readFileString(`${directory}/${files[0]}`);
                    // Validate persisted records independently of the console projection before comparing their rendered forms.
                    const records = yield* Effect.forEach(
                        text.trimEnd().split('\n'),
                        /**
                         * Decode each persisted JSON line through the public telemetry schema.
                         *
                         * @param line - One persisted JSON line.
                         * @returns An effect yielding the decoded record, or failing when the line does not match the schema.
                         */
                        (line) => Schema.decode(Schema.parseJson(TelemetryRecord))(line)
                    );
                    expect(
                        records.map(
                            /**
                             * Preserve emission order when checking which diagnostics reached disk.
                             *
                             * @param root0 - One decoded telemetry record.
                             * @param root0.code - Diagnostic code of the record.
                             * @returns The diagnostic code.
                             */
                            ({ code }) => code
                        )
                    ).toEqual(['diagnostic.unavailable', 'diagnostic.registered', 'diagnostic.startup']);
                    expect(
                        records.map(
                            /**
                             * Distinguish log diagnostics from the completed startup span.
                             *
                             * @param root0 - One decoded telemetry record.
                             * @param root0.signal - Whether the record is a log or a span.
                             * @returns The record kind.
                             */
                            ({ signal }) => signal
                        )
                    ).toEqual(['log', 'log', 'span']);
                    expect(
                        records.map(
                            /**
                             * Compare completion states independently from record codes and signal kinds.
                             *
                             * @param root0 - One decoded telemetry record.
                             * @param root0.outcome - Completion state of the record.
                             * @returns The completion state.
                             */
                            ({ outcome }) => outcome
                        )
                    ).toEqual(['none', 'none', 'succeeded']);
                    expect(
                        new Set(
                            records.map(
                                /**
                                 * Require all persisted records to share one startup trace.
                                 *
                                 * @param root0 - One decoded telemetry record.
                                 * @param root0.traceId - Trace the record belongs to.
                                 * @returns The trace identifier.
                                 */
                                ({ traceId }) => traceId
                            )
                        ).size
                    ).toBe(1);
                    expect(records[0]?.traceId).toMatch(/^[a-f0-9]{32}$/);
                    expect(records[0]?.spanId).toBe(records[2]?.spanId);
                    expect(
                        records.every(
                            /**
                             * Reject unexpected diagnostic attributes rather than snapshotting arbitrary payloads.
                             *
                             * @param root0 - One decoded telemetry record.
                             * @param root0.attributes - Attributes carried by the record.
                             * @returns Whether the record carries no attributes.
                             */
                            ({ attributes }) => Object.keys(attributes).length === 0
                        )
                    ).toBe(true);
                    expect(result.stdout).toBe(`${records.map(formatConsoleRecord).join('\n')}\n`);
                }
            ).pipe(Effect.scoped, Effect.provide(NodeFileSystem.layer))
    );

    childTest(
        'redacts invalid application configuration through the outer bootstrap, including failed span',
        [2300],
        /**
         * Exercise an invalid profile whose contents must never appear in bootstrap diagnostics.
         *
         * @returns The scenario that starts the server with an invalid profile and checks the sanitized failure.
         */
        () =>
            Effect.gen(
                /** Require sanitized failure and startup-span output without configuration or raw Effect errors. */ function* () {
                    // The escaped newline probes private-data leakage and line injection through decoded diagnostics.
                    const result = yield* launch({
                        EVENTIVA_CLUSTER_PROFILE: '{"edition":"SECRET_PROFILE_CANARY\\nFORGED"}',
                    });
                    expect(result.error, launchFailureContext(result)).toBeUndefined();
                    expect(result.status).toBe(1);
                    expect(result.stderr).toBe('');
                    expect(headers(result.stdout)).toHaveLength(2);
                    expect(result.stdout.match(/bootstrap.failure/g)).toHaveLength(1);
                    expect(result.stdout).toContain('diagnostic.startup');
                    expect(result.stdout).not.toMatch(
                        /SECRET|FORGED|ParseError|FiberFailure|registered|ready|copyright/i
                    );
                }
            )
    );

    childTest(
        'keeps Config-free diagnostics when the main telemetry layer cannot acquire',
        [2300],
        /**
         * Fail main telemetry configuration to verify the independent bootstrap sink remains usable.
         *
         * @returns The scenario that breaks main telemetry configuration and checks the bootstrap failure record.
         */
        () =>
            Effect.gen(
                /** Require a bootstrap failure record rather than leaking the invalid capacity or parsing failure. */ function* () {
                    // Fail the main telemetry layer itself; fallback diagnostics cannot depend on its Config acquisition.
                    const result = yield* launch({ telemetry_capacity: 'SECRET_CAPACITY_CANARY' });
                    expect(result.error, launchFailureContext(result)).toBeUndefined();
                    expect(result.status).toBe(1);
                    expect(result.stderr).toBe('');
                    expect(headers(result.stdout)).toHaveLength(1);
                    expect(result.stdout).toContain('bootstrap.failure');
                    expect(result.stdout).not.toMatch(/SECRET|InvalidData|registered|ready|copyright/i);
                }
            )
    );

    childTest(
        'keeps bootstrap diagnostics when the configured server sink fails acquisition',
        [2300],
        /**
         * Reject a relative file-sink directory before use without losing bootstrap reporting.
         *
         * @returns The scenario that sets a relative sink directory and checks the fallback output.
         */
        () =>
            Effect.gen(
                /** Require sanitized fallback output when the configured main sink cannot acquire. */ function* () {
                    // A relative path fails sink acquisition, exercising a different fallback boundary from invalid Config.
                    const result = yield* launch({ telemetryFile_directory: 'SECRET_RELATIVE_PATH_CANARY' });
                    expect(result.error, launchFailureContext(result)).toBeUndefined();
                    expect(result.status).toBe(1);
                    expect(result.stderr).toBe('');
                    expect(headers(result.stdout)).toHaveLength(1);
                    expect(result.stdout).toContain('bootstrap.failure');
                    expect(result.stdout).not.toMatch(/SECRET|TelemetrySinkFailure|registered|ready|copyright/i);
                }
            )
    );

    childTest(
        'optional telemetry opt-out cannot turn off bootstrap failure diagnostics',
        [2300, 2300],
        /**
         * Compare opted-out normal startup with invalid-profile failure under the same telemetry setting.
         *
         * @returns The scenario that runs an opted-out normal start and an opted-out failing start.
         */
        () =>
            Effect.gen(
                /** Require silence for successful opt-out but one sanitized bootstrap record when startup fails. */ function* () {
                    // The successful control proves opt-out is applied; only mandatory failure reporting must survive it.
                    const disabled = yield* launch({ telemetry_enabled: 'false' });
                    expect(disabled.error, launchFailureContext(disabled)).toBeUndefined();
                    expect(disabled.status).toBe(0);
                    expect(disabled.stdout).toBe('');
                    expect(disabled.stderr).toBe('');
                    const failed = yield* launch({
                        telemetry_enabled: 'false',
                        EVENTIVA_CLUSTER_PROFILE: 'SECRET_BAD_JSON',
                    });
                    expect(failed.error, launchFailureContext(failed)).toBeUndefined();
                    expect(failed.status).toBe(1);
                    expect(failed.stderr).toBe('');
                    expect(headers(failed.stdout)).toHaveLength(1);
                    expect(failed.stdout).toContain('bootstrap.failure');
                    expect(failed.stdout).not.toMatch(/SECRET|registered|ready|copyright/i);
                }
            )
    );
});
