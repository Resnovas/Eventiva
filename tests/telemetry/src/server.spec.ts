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

const launch = (
    environment: Readonly<Record<string, string>> = {}
): Effect.Effect<SpawnSyncReturns<string>, TelemetrySinkFailure> =>
    Effect.try({
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
        catch: () => new TelemetrySinkFailure({ reason: 'unavailable' }),
    });

const headers = (output: string): ReadonlyArray<string> =>
    output.split('\n').filter((line) => /^\d{4}-\d\d-\d\dT/.test(line));

describe('real diagnostic server telemetry composition', () => {
    it.effect('preserves the production fail-closed audit service with telemetry enabled or opted out', () =>
        Effect.gen(function* () {
            for (const enabled of [true, false]) {
                const result = yield* Effect.gen(function* () {
                    const audit = yield* Audit;
                    return yield* Effect.exit(audit.ready('platform.status'));
                }).pipe(
                    Effect.provide(
                        Layer.mergeAll(
                            FailClosed,
                            telemetryLayer(
                                { messages: {}, attributes: {} },
                                Config.succeed({ enabled, capacity: 1, timeoutMs: 100 })
                            ).pipe(Layer.provide(consoleLoggerLayer(() => Effect.void)))
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
        })
    );

    it.effect('runs the real main and drains one correlated console diagnostic, never ready or banner', () =>
        Effect.gen(function* () {
            const result = yield* launch();
            expect(result.error).toBeUndefined();
            expect(result.status).toBe(0);
            expect(result.stderr).toBe('');
            expect(headers(result.stdout)).toHaveLength(3);
            expect(result.stdout.match(/Diagnostic only:/g)).toHaveLength(1);
            expect(result.stdout.match(/Eventiva modules registered/g)).toHaveLength(1);
            expect(result.stdout).toContain('diagnostic.startup');
            expect(result.stdout).not.toMatch(/app.ready|platform.ready|copyright|bootstrap.failure|redacted/i);
            expect(new Set([...result.stdout.matchAll(/trace=([a-f0-9]{32})/g)].map((match) => match[1])).size).toBe(1);
        })
    );

    it.effect('flushes the real file layer before process exit and releases its scoped lock', () =>
        Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const directory = yield* fs.makeTempDirectoryScoped();
            const result = yield* launch({ telemetryFile_directory: directory });
            expect(result.error).toBeUndefined();
            expect(result.status).toBe(0);
            expect(result.stderr).toBe('');
            const files = yield* fs.readDirectory(directory);
            expect(files).toHaveLength(1);
            expect(files[0]).toMatch(/^\d{4}-\d{2}-\d{2}\.000000\.jsonl$/);
            const text = yield* fs.readFileString(`${directory}/${files[0]}`);
            const records = yield* Effect.forEach(text.trimEnd().split('\n'), (line) =>
                Schema.decode(Schema.parseJson(TelemetryRecord))(line)
            );
            expect(records.map(({ code }) => code)).toEqual([
                'diagnostic.unavailable',
                'diagnostic.registered',
                'diagnostic.startup',
            ]);
            expect(records.map(({ signal }) => signal)).toEqual(['log', 'log', 'span']);
            expect(records.map(({ outcome }) => outcome)).toEqual(['none', 'none', 'succeeded']);
            expect(new Set(records.map(({ traceId }) => traceId)).size).toBe(1);
            expect(records[0]?.traceId).toMatch(/^[a-f0-9]{32}$/);
            expect(records[0]?.spanId).toBe(records[2]?.spanId);
            expect(records.every(({ attributes }) => Object.keys(attributes).length === 0)).toBe(true);
            expect(result.stdout).toBe(`${records.map(formatConsoleRecord).join('\n')}\n`);
        }).pipe(Effect.scoped, Effect.provide(NodeFileSystem.layer))
    );

    it.effect('redacts invalid application configuration through the outer bootstrap, including failed span', () =>
        Effect.gen(function* () {
            const result = yield* launch({ EVENTIVA_CLUSTER_PROFILE: '{"edition":"SECRET_PROFILE_CANARY\\nFORGED"}' });
            expect(result.error).toBeUndefined();
            expect(result.status).toBe(1);
            expect(result.stderr).toBe('');
            expect(headers(result.stdout)).toHaveLength(2);
            expect(result.stdout.match(/bootstrap.failure/g)).toHaveLength(1);
            expect(result.stdout).toContain('diagnostic.startup');
            expect(result.stdout).not.toMatch(/SECRET|FORGED|ParseError|FiberFailure|registered|ready|copyright/i);
        })
    );

    it.effect('keeps Config-free diagnostics when the main telemetry layer cannot acquire', () =>
        Effect.gen(function* () {
            const result = yield* launch({ telemetry_capacity: 'SECRET_CAPACITY_CANARY' });
            expect(result.error).toBeUndefined();
            expect(result.status).toBe(1);
            expect(result.stderr).toBe('');
            expect(headers(result.stdout)).toHaveLength(1);
            expect(result.stdout).toContain('bootstrap.failure');
            expect(result.stdout).not.toMatch(/SECRET|InvalidData|registered|ready|copyright/i);
        })
    );

    it.effect('keeps bootstrap diagnostics when the configured server sink fails acquisition', () =>
        Effect.gen(function* () {
            const result = yield* launch({ telemetryFile_directory: 'SECRET_RELATIVE_PATH_CANARY' });
            expect(result.error).toBeUndefined();
            expect(result.status).toBe(1);
            expect(result.stderr).toBe('');
            expect(headers(result.stdout)).toHaveLength(1);
            expect(result.stdout).toContain('bootstrap.failure');
            expect(result.stdout).not.toMatch(/SECRET|TelemetrySinkFailure|registered|ready|copyright/i);
        })
    );

    it.effect('optional telemetry opt-out cannot turn off bootstrap failure diagnostics', () =>
        Effect.gen(function* () {
            const disabled = yield* launch({ telemetry_enabled: 'false' });
            expect(disabled.error).toBeUndefined();
            expect(disabled.status).toBe(0);
            expect(disabled.stdout).toBe('');
            expect(disabled.stderr).toBe('');
            const failed = yield* launch({ telemetry_enabled: 'false', EVENTIVA_CLUSTER_PROFILE: 'SECRET_BAD_JSON' });
            expect(failed.error).toBeUndefined();
            expect(failed.status).toBe(1);
            expect(failed.stderr).toBe('');
            expect(headers(failed.stdout)).toHaveLength(1);
            expect(failed.stdout).toContain('bootstrap.failure');
            expect(failed.stdout).not.toMatch(/SECRET|registered|ready|copyright/i);
        })
    );
});
