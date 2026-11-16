/**
 * @file packages/integrations/telemetry.server/src/logger.ts
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
import { TelemetryRecord, TelemetrySink, TelemetrySinkFailure } from '@eventiva/contracts/observability';
import { Clock, Config, Console, Effect, Layer, Option, Redacted, Schema } from 'effect';

export const serverLoggerConfig = Config.all({
    directory: Config.redacted('directory'),
    maxFileBytes: Config.integer('maxFileBytes').pipe(Config.withDefault(1048576)),
    maxFiles: Config.integer('maxFiles').pipe(Config.withDefault(7)),
    retentionDays: Config.integer('retentionDays').pipe(Config.withDefault(7)),
}).pipe(Config.nested('telemetryFile'));

export interface ServerLoggerOptions {
    readonly directory: Redacted.Redacted<string>;
    readonly maxFileBytes: number;
    readonly maxFiles: number;
    readonly retentionDays: number;
}

/** Trusted newlines survive verbatim after the header. Untrusted text never reaches this formatter. */
export const formatConsoleRecord = (record: TelemetryRecord): string =>
    `${record.timestamp} ${record.level} ${record.code} trace=${record.traceId || '-'} span=${record.spanId || '-'}\n${record.text}`;

const filenamePattern = /^\d{4}-\d{2}-\d{2}\.\d{6}\.jsonl$/;

/** Config-free bootstrap sink. Install before acquiring even the file sink or main configuration. */
export const consoleLoggerLayer = (
    write: (text: string) => Effect.Effect<void, TelemetrySinkFailure> = (text) => Console.log(text)
): Layer.Layer<TelemetrySink> =>
    Layer.succeed(TelemetrySink, {
        write: (input) =>
            Schema.decode(TelemetryRecord)(input).pipe(
                Effect.mapError(() => new TelemetrySinkFailure({ reason: 'invalid-record' })),
                Effect.flatMap((record) => write(formatConsoleRecord(record))),
                Effect.catchAllCause(() => Effect.fail(new TelemetrySinkFailure({ reason: 'write' })))
            ),
        flush: Effect.void,
    });

/**
 * One scoped owner per dedicated private directory. Never a production audit
 * store. No Node filesystem capability leaks into runtime or feature packages.
 */
export const serverLoggerLayer = (
    configuration: Config.Config<ServerLoggerOptions> = serverLoggerConfig,
    consoleWrite: (text: string) => Effect.Effect<void, TelemetrySinkFailure> = (text) => Console.log(text)
): Layer.Layer<TelemetrySink, TelemetrySinkFailure, FileSystem.FileSystem> =>
    Layer.scoped(
        TelemetrySink,
        Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const config = yield* configuration.pipe(
                Effect.mapError(() => new TelemetrySinkFailure({ reason: 'configuration' }))
            );
            const directory = Redacted.value(config.directory);
            if (
                !directory.startsWith('/') ||
                directory.endsWith('/') ||
                directory.includes('//') ||
                Array.from(directory).some(
                    (character) => (character.codePointAt(0) ?? 0) < 32 || character === '\u007f'
                ) ||
                directory.split('/').some((part) => part === '.' || part === '..') ||
                !Number.isInteger(config.maxFileBytes) ||
                config.maxFileBytes < 1024 ||
                config.maxFileBytes > 67108864 ||
                !Number.isInteger(config.maxFiles) ||
                config.maxFiles < 1 ||
                config.maxFiles > 1024 ||
                !Number.isInteger(config.retentionDays) ||
                config.retentionDays < 1 ||
                config.retentionDays > 365
            )
                return yield* new TelemetrySinkFailure({ reason: 'configuration' });
            yield* fs.makeDirectory(directory, { recursive: true, mode: 0o700 });
            const info = yield* fs.stat(directory);
            if (info.type !== 'Directory' || (info.mode & 0o077) !== 0 || (yield* fs.realPath(directory)) !== directory)
                return yield* new TelemetrySinkFailure({ reason: 'configuration' });
            const lockPath = `${directory}/.eventiva-telemetry.lock`;
            // Acquire the exclusive lock before looking at or changing managed files.
            yield* Effect.acquireRelease(fs.open(lockPath, { flag: 'wx', mode: 0o600 }), () =>
                fs.remove(lockPath).pipe(Effect.orDieWith(() => new TelemetrySinkFailure({ reason: 'flush' })))
            );
            const lock = yield* Effect.makeSemaphore(1);
            let current = '';
            let size = 0;
            // Validate surviving segments before promising a byte bound. Never truncate an oversized file.
            const initial = (yield* fs.readDirectory(directory)).filter((file) => filenamePattern.test(file)).sort();
            const initialDay = new Date((yield* Clock.currentTimeMillis) - (config.retentionDays - 1) * 86400000)
                .toISOString()
                .slice(0, 10);
            for (const file of initial) {
                if (file.slice(0, 10) < initialDay || initial.indexOf(file) < initial.length - config.maxFiles) {
                    yield* fs.remove(`${directory}/${file}`);
                } else {
                    const stat = yield* fs.stat(`${directory}/${file}`);
                    if (
                        stat.type !== 'File' ||
                        Number(stat.size) > config.maxFileBytes ||
                        (stat.mode & 0o077) !== 0 ||
                        (Option.isSome(stat.nlink) && stat.nlink.value !== 1) ||
                        (yield* fs.realPath(`${directory}/${file}`)) !== `${directory}/${file}`
                    )
                        return yield* new TelemetrySinkFailure({ reason: 'configuration' });
                }
            }
            const write = (input: TelemetryRecord): Effect.Effect<void, TelemetrySinkFailure> =>
                lock
                    .withPermits(1)(
                        Effect.gen(function* () {
                            // Exporter boundary: validate even typed input (JS, IPC and malformed callers exist).
                            const record = yield* Schema.decode(TelemetryRecord)(input).pipe(
                                Effect.mapError(() => new TelemetrySinkFailure({ reason: 'invalid-record' }))
                            );
                            const bytes = new TextEncoder().encode(`${JSON.stringify(record)}\n`);
                            if (bytes.length > config.maxFileBytes)
                                return yield* new TelemetrySinkFailure({ reason: 'invalid-record' });
                            const now = yield* Clock.currentTimeMillis;
                            const day = new Date(now).toISOString().slice(0, 10);
                            const cutoff = new Date(now - (config.retentionDays - 1) * 86400000)
                                .toISOString()
                                .slice(0, 10);
                            let files = (yield* fs.readDirectory(directory))
                                .filter((file) => filenamePattern.test(file))
                                .sort();
                            for (const file of files) {
                                if (file.slice(0, 10) < cutoff) {
                                    yield* fs.remove(`${directory}/${file}`);
                                    if (current === file) current = '';
                                }
                            }
                            files = files.filter((file) => file.slice(0, 10) >= cutoff);
                            let fresh = false;
                            if (!current.startsWith(`${day}.`) || size + bytes.length > config.maxFileBytes) {
                                const today = files.filter((file) => file.startsWith(`${day}.`));
                                const last = today.at(-1);
                                const next = last === undefined ? 0 : Number(last.slice(11, 17)) + 1;
                                if (next > 999999) return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
                                current = `${day}.${String(next).padStart(6, '0')}.jsonl`;
                                size = 0;
                                fresh = true;
                                // Remove before create, keeping managed bytes <= maxFiles * maxFileBytes.
                                while (files.length >= config.maxFiles) {
                                    const oldest = files.shift();
                                    if (oldest !== undefined) yield* fs.remove(`${directory}/${oldest}`);
                                }
                            }
                            const path = `${directory}/${current}`;
                            yield* Effect.scoped(
                                Effect.gen(function* () {
                                    const file = yield* fs.open(path, { flag: fresh ? 'wx' : 'a', mode: 0o600 });
                                    const stat = yield* file.stat;
                                    if (
                                        stat.type !== 'File' ||
                                        (stat.mode & 0o077) !== 0 ||
                                        (Option.isSome(stat.nlink) && stat.nlink.value !== 1) ||
                                        Number(stat.size) !== size ||
                                        (yield* fs.realPath(path)) !== path
                                    )
                                        return yield* new TelemetrySinkFailure({ reason: 'write' });
                                    yield* file.writeAll(bytes);
                                    yield* file.sync;
                                })
                            );
                            size += bytes.length;
                            // File and console failures are independent; console still gets a chance below.
                        }).pipe(
                            Effect.catchAllCause(() => {
                                current = ''; // Never append after a partial/uncertain write.
                                return Effect.fail(new TelemetrySinkFailure({ reason: 'write' }));
                            })
                        )
                    )
                    .pipe(
                        Effect.exit,
                        Effect.flatMap((result) =>
                            Schema.decode(TelemetryRecord)(input).pipe(
                                Effect.mapError(() => new TelemetrySinkFailure({ reason: 'invalid-record' })),
                                Effect.flatMap((record) => consoleWrite(formatConsoleRecord(record))),
                                Effect.zipRight(result)
                            )
                        )
                    );
            return TelemetrySink.of({ write, flush: lock.withPermits(1)(Effect.void) });
        }).pipe(Effect.mapError(() => new TelemetrySinkFailure({ reason: 'configuration' })))
    );
