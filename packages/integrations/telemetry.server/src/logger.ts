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

/** Read local telemetryFile settings with a redacted required directory; acquisition validates the numeric limits. */
export const serverLoggerConfig = Config.all({
    directory: Config.redacted('directory'),
    maxFileBytes: Config.integer('maxFileBytes').pipe(Config.withDefault(1048576)),
    maxFiles: Config.integer('maxFiles').pipe(Config.withDefault(7)),
    retentionDays: Config.integer('retentionDays').pipe(Config.withDefault(7)),
}).pipe(Config.nested('telemetryFile'));

/**
 * Dedicated private absolute directory and local retention limits: 1024-67108864
 * bytes per segment, 1-1024 segments and 1-365 UTC days, all integral.
 * The scoped sink validates injected settings as well as configuration-derived values.
 */
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
    /** Accept only schema-validated formatted records; failures must use the closed sink error type. */
    write: (text: string) => Effect.Effect<void, TelemetrySinkFailure> =
        /** Use Effect's console service so bootstrap output needs no application or file configuration. */
        (text) => Console.log(text)
): Layer.Layer<TelemetrySink> =>
    Layer.succeed(TelemetrySink, {
        /** Decode even typed callers and replace all output failures or defects with a bounded write reason. */
        write: (input) =>
            Schema.decode(TelemetryRecord)(input).pipe(
                Effect.mapError(
                    /** Do not retain malformed record contents in the decoder's error representation. */
                    () => new TelemetrySinkFailure({ reason: 'invalid-record' })
                ),
                Effect.flatMap(
                    /** Format only decoded records; caller-controlled text must already satisfy the wire schema. */
                    (record) => write(formatConsoleRecord(record))
                ),
                Effect.catchAllCause(
                    /** Keep even defects in the injected writer from escaping as arbitrary diagnostic payloads. */
                    () => Effect.fail(new TelemetrySinkFailure({ reason: 'write' }))
                )
            ),
        flush: Effect.void,
    });

/**
 * One scoped owner per dedicated private directory. Never a production audit
 * store. No Node filesystem capability leaks into runtime or feature packages.
 * Disk writes rotate bounded JSONL segments and sync each record; valid records
 * still reach the console after disk failure. Flush waits for serialized disk work.
 */
export const serverLoggerLayer = (
    configuration: Config.Config<ServerLoggerOptions> = serverLoggerConfig,
    /** Emit schema-validated formatted records independently of the file result, with closed sink failures only. */
    consoleWrite: (text: string) => Effect.Effect<void, TelemetrySinkFailure> =
        /** Keep default console output within Effect's console service rather than a Node-only primitive. */
        (text) => Console.log(text)
): Layer.Layer<TelemetrySink, TelemetrySinkFailure, FileSystem.FileSystem> =>
    Layer.scoped(
        TelemetrySink,
        Effect.gen(
            /** Own directory locking and rotation state for one scope; publish no sink until acquisition succeeds. */ function* () {
                const fs = yield* FileSystem.FileSystem;
                const config = yield* configuration.pipe(
                    Effect.mapError(
                        /** Discard configuration errors that may retain the private directory or malformed values. */
                        () => new TelemetrySinkFailure({ reason: 'configuration' })
                    )
                );
                const directory = Redacted.value(config.directory);
                // Validate injected settings too; aliases and permissive directories would undermine exclusive ownership.
                if (
                    !directory.startsWith('/') ||
                    directory.endsWith('/') ||
                    directory.includes('//') ||
                    Array.from(directory).some(
                        /** Reject path control characters before any filesystem work or diagnostic rendering. */
                        (character) => (character.codePointAt(0) ?? 0) < 32 || character === '\u007f'
                    ) ||
                    directory.split('/').some(
                        /** Disallow dot-segment aliases rather than normalizing a caller's sensitive directory. */
                        (part) => part === '.' || part === '..'
                    ) ||
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
                if (
                    info.type !== 'Directory' ||
                    (info.mode & 0o077) !== 0 ||
                    (yield* fs.realPath(directory)) !== directory
                )
                    return yield* new TelemetrySinkFailure({ reason: 'configuration' });
                const lockPath = `${directory}/.eventiva-telemetry.lock`;
                // Acquire the exclusive lock before looking at or changing managed files.
                yield* Effect.acquireRelease(
                    fs.open(lockPath, { flag: 'wx', mode: 0o600 }),
                    /** Release the ownership marker on scope exit; cleanup failure must not silently imply reacquisition is safe. */
                    () =>
                        fs.remove(lockPath).pipe(
                            Effect.orDieWith(
                                /** Replace path-bearing cleanup errors even when shutdown must report a defect. */
                                () => new TelemetrySinkFailure({ reason: 'flush' })
                            )
                        )
                );
                const lock = yield* Effect.makeSemaphore(1);
                let current = '';
                let size = 0;
                // Validate surviving segments before promising a byte bound. Never truncate an oversized file.
                const initial = (yield* fs.readDirectory(directory))
                    .filter(
                        /** Manage only date-and-sequence JSONL segments; unrelated directory entries are not retention targets. */
                        (file) => filenamePattern.test(file)
                    )
                    .sort();
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
                /** Serialize disk mutation and sync before console delivery; preserve the disk result if console succeeds. */
                const write = (input: TelemetryRecord): Effect.Effect<void, TelemetrySinkFailure> =>
                    lock
                        .withPermits(1)(
                            Effect.gen(
                                /** Apply retention and rotation under the disk permit before appending one bounded encoded record. */ function* () {
                                    // Exporter boundary: validate even typed input (JS, IPC and malformed callers exist).
                                    const record = yield* Schema.decode(TelemetryRecord)(input).pipe(
                                        Effect.mapError(
                                            /** Malformed input is rejected without retaining its decoder details or contents. */
                                            () => new TelemetrySinkFailure({ reason: 'invalid-record' })
                                        )
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
                                        .filter(
                                            /** Restrict disk accounting and retention deletion to managed segment names. */
                                            (file) => filenamePattern.test(file)
                                        )
                                        .sort();
                                    for (const file of files) {
                                        if (file.slice(0, 10) < cutoff) {
                                            yield* fs.remove(`${directory}/${file}`);
                                            if (current === file) current = '';
                                        }
                                    }
                                    files = files.filter(
                                        /** Exclude expired segments from subsequent count and sequence calculations. */
                                        (file) => file.slice(0, 10) >= cutoff
                                    );
                                    let fresh = false;
                                    if (!current.startsWith(`${day}.`) || size + bytes.length > config.maxFileBytes) {
                                        const today = files.filter(
                                            /** Sequence numbers advance within the current UTC day, not across day boundaries. */
                                            (file) => file.startsWith(`${day}.`)
                                        );
                                        const last = today.at(-1);
                                        const next = last === undefined ? 0 : Number(last.slice(11, 17)) + 1;
                                        if (next > 999999)
                                            return yield* new TelemetrySinkFailure({ reason: 'unavailable' });
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
                                        Effect.gen(
                                            /** Own the open descriptor only through validation, append and sync for this record. */ function* () {
                                                const file = yield* fs.open(path, {
                                                    flag: fresh ? 'wx' : 'a',
                                                    mode: 0o600
                                                });
                                                const stat = yield* file.stat;
                                                // Recheck the opened file, not just its name, before trusting permissions and byte accounting.
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
                                            }
                                        )
                                    );
                                    size += bytes.length;
                                    // File and console failures are independent; console still gets a chance below.
                                }
                            ).pipe(
                                Effect.catchAllCause(
                                    /** Sanitize all disk failures and force a fresh segment after an uncertain append. */ () => {
                                        current = ''; // Never append after a partial/uncertain write.
                                        return Effect.fail(new TelemetrySinkFailure({ reason: 'write' }));
                                    }
                                )
                            )
                        )
                        .pipe(
                            Effect.exit,
                            Effect.flatMap(
                                /** Attempt independent console delivery before replaying the disk result; console failure takes precedence. */ (
                                    result
                                ) =>
                                    Schema.decode(TelemetryRecord)(input).pipe(
                                        Effect.mapError(
                                            /** Disk failure does not authorize malformed input to reach the independent console path. */
                                            () => new TelemetrySinkFailure({ reason: 'invalid-record' })
                                        ),
                                        Effect.flatMap(
                                            /** Console delivery still runs after disk failure, but only with a decoded record. */
                                            (record) => consoleWrite(formatConsoleRecord(record))
                                        ),
                                        Effect.zipRight(result)
                                    )
                            )
                        );
                return TelemetrySink.of({ write, flush: lock.withPermits(1)(Effect.void) });
            }
        ).pipe(
            Effect.mapError(
                /** Hide filesystem paths and configuration details from every acquisition error. */
                () => new TelemetrySinkFailure({ reason: 'configuration' })
            )
        )
    );
