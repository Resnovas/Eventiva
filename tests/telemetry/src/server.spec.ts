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

import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as FileSystem from '@effect/platform/FileSystem';
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import { describe, expect, it } from '@effect/vitest';
import { TelemetryRecord, TelemetrySinkFailure } from '@eventiva/contracts/observability';
import { consoleLoggerLayer, formatConsoleRecord } from '@eventiva/integrations.telemetry.server/logger';
import { Audit, FailClosed } from '@eventiva/runtime/invocation';
import { telemetryLayer } from '@eventiva/runtime/telemetry';
import { Cause, Config, Effect, Exit, Layer, Option, Schema } from 'effect';

const workspace = fileURLToPath(new URL('../../../', import.meta.url));

/** Run the actual server entry point with isolated configuration and a ten-second child lifetime bound. */
const launch = (
    environment: Readonly<Record<string, string>> = {}
): Effect.Effect<SpawnSyncReturns<string>, TelemetrySinkFailure> =>
    Effect.try({
        /** Capture child output without inheriting the host environment; subprocess failures remain in the result. */
        try: () => {
            return spawnSync(process.execPath, ['--conditions=@eventiva/source', 'apps/server/src/main.ts'], {
                cwd: workspace,
                encoding: 'utf8',
                timeout: 10000,
                maxBuffer: 65536,
                // Do not inherit keys, endpoints, NODE_OPTIONS or local secrets.
                env: { NODE_NO_WARNINGS: '1', ...environment },
            });
        },
        /** Translate only a synchronous spawn invocation failure, never its raw error or arguments. */
        catch: () => new TelemetrySinkFailure({ reason: 'unavailable' }),
    });

/** Count timestamp-prefixed console records independently of non-record output. */
const headers = (output: string): ReadonlyArray<string> =>
    output
        .split('\n')
        .filter(
            /** Recognize the ISO-date prefix emitted by the console formatter. */ (line) =>
                /^\d{4}-\d\d-\d\dT/.test(line)
        );

/** Describe child termination without retaining configuration values, raw errors or arbitrary process output. */
const launchFailureContext = (result: SpawnSyncReturns<string>): string => {
    // Keep only closed diagnostic event names: even an unexpected secret format must never reach CI logs.
    /** Bound each output summary to its length and eight recognized diagnostic events, excluding all other text. */
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
        status: result.status,
        signal: result.signal,
        errorCode,
        stdout: summarize(result.stdout),
        stderr: summarize(result.stderr),
    });
};

describe('real diagnostic server telemetry composition', /** Cover real process exit and scoped sinks independently of in-process service checks. */ () => {
    // Child launches use isolated configuration so these checks exercise bootstrap and finalization, not host credentials.
    it.effect(
        'preserves the production fail-closed audit service with telemetry enabled or opted out',
        /** Verify optional telemetry never replaces the production audit denial service. */ () =>
            Effect.gen(
                /** Require AuditUnavailable under both telemetry settings without installing a permissive audit stub. */ function* () {
                    // Telemetry is optional; mandatory audit denial must survive either configuration.
                    for (const enabled of [true, false]) {
                        const result = yield* Effect.gen(
                            /** Observe the audit failure as an Exit so telemetry cannot hide it behind successful startup. */ function* () {
                                const audit = yield* Audit;
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
                                                /** Discard console writes; this case tests audit semantics, not output formatting. */ () =>
                                                    Effect.void
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

    it.effect(
        'runs the real main and drains one correlated console diagnostic, never ready or banner',
        /** Run the executable without optional configuration to verify its diagnostic-only contract. */ () =>
            Effect.gen(
                /** Require one correlated startup trace and registration diagnostics, never a readiness claim. */ function* () {
                    const result = yield* launch();
                    expect(result.error, launchFailureContext(result)).toBeUndefined();
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
                                /** Compare trace identities across records without depending on the randomly generated value. */ (
                                    match
                                ) => match[1]
                            )
                        ).size
                    ).toBe(1);
                }
            )
    );

    it.effect(
        'flushes the real file layer before process exit and releases its scoped lock',
        /** Exercise the configured file sink through the executable with a scoped disposable directory. */ () =>
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
                        /** Decode each persisted JSON line through the public telemetry schema. */ (line) =>
                            Schema.decode(Schema.parseJson(TelemetryRecord))(line)
                    );
                    expect(
                        records.map(
                            /** Preserve emission order when checking which diagnostics reached disk. */ ({ code }) =>
                                code
                        )
                    ).toEqual([
                        'diagnostic.unavailable',
                        'diagnostic.registered',
                        'diagnostic.startup',
                    ]);
                    expect(
                        records.map(
                            /** Distinguish log diagnostics from the completed startup span. */ ({ signal }) => signal
                        )
                    ).toEqual(['log', 'log', 'span']);
                    expect(
                        records.map(
                            /** Compare completion states independently from record codes and signal kinds. */ ({
                                outcome
                            }) => outcome
                        )
                    ).toEqual(['none', 'none', 'succeeded']);
                    expect(
                        new Set(
                            records.map(
                                /** Require all persisted records to share one startup trace. */ ({ traceId }) =>
                                    traceId
                            )
                        ).size
                    ).toBe(1);
                    expect(records[0]?.traceId).toMatch(/^[a-f0-9]{32}$/);
                    expect(records[0]?.spanId).toBe(records[2]?.spanId);
                    expect(
                        records.every(
                            /** Reject unexpected diagnostic attributes rather than snapshotting arbitrary payloads. */ ({
                                attributes
                            }) => Object.keys(attributes).length === 0
                        )
                    ).toBe(true);
                    expect(result.stdout).toBe(`${records.map(formatConsoleRecord).join('\n')}\n`);
                }
            ).pipe(Effect.scoped, Effect.provide(NodeFileSystem.layer))
    );

    it.effect(
        'redacts invalid application configuration through the outer bootstrap, including failed span',
        /** Exercise an invalid profile whose contents must never appear in bootstrap diagnostics. */ () =>
            Effect.gen(
                /** Require sanitized failure and startup-span output without configuration or raw Effect errors. */ function* () {
                    const result = yield* launch({
                        EVENTIVA_CLUSTER_PROFILE: '{"edition":"SECRET_PROFILE_CANARY\\nFORGED"}'
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

    it.effect(
        'keeps Config-free diagnostics when the main telemetry layer cannot acquire',
        /** Fail main telemetry configuration to verify the independent bootstrap sink remains usable. */ () =>
            Effect.gen(
                /** Require a bootstrap failure record rather than leaking the invalid capacity or parsing failure. */ function* () {
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

    it.effect(
        'keeps bootstrap diagnostics when the configured server sink fails acquisition',
        /** Reject a relative file-sink directory before use without losing bootstrap reporting. */ () =>
            Effect.gen(
                /** Require sanitized fallback output when the configured main sink cannot acquire. */ function* () {
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

    it.effect(
        'optional telemetry opt-out cannot turn off bootstrap failure diagnostics',
        /** Compare opted-out normal startup with invalid-profile failure under the same telemetry setting. */ () =>
            Effect.gen(
                /** Require silence for successful opt-out but one sanitized bootstrap record when startup fails. */ function* () {
                    const disabled = yield* launch({ telemetry_enabled: 'false' });
                    expect(disabled.error, launchFailureContext(disabled)).toBeUndefined();
                    expect(disabled.status).toBe(0);
                    expect(disabled.stdout).toBe('');
                    expect(disabled.stderr).toBe('');
                    const failed = yield* launch({
                        telemetry_enabled: 'false',
                        EVENTIVA_CLUSTER_PROFILE: 'SECRET_BAD_JSON'
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
