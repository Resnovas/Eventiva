/**
 * @file tests/telemetry/src/core-diagnostics-qualification.spec.ts
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
import { TelemetryRecord, TelemetrySink } from '@eventiva/contracts/observability';
import { telemetryLayer } from '@eventiva/runtime/telemetry';
import { Cause, ConfigProvider, Effect, Exit, Layer, Schema } from 'effect';
import { childTests, runChild } from './child-process.ts';

const childTest = childTests();

/** Launch the unchanged public diagnostic entry with only synthetic local configuration. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */
const launch = (environment: Readonly<Record<string, string>>) =>
    runChild(['apps/server/src/main.ts'], environment, false);

describe('Core failed bootstrap qualification', /** Fill the partial-acquisition and rendered-Cause gaps left by existing bootstrap tests. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () => {
    // One declared slot per real process preserves every failure/reacquisition pair under the original aggregate limit.
    childTest(
        'releases an acquired local sink after invalid Config or Schema and registers only on a later valid launch',
        [2300, 2300, 2300, 2300, 2300, 2300, 2300, 2300, 2300, 2300],
        /** Observe lock removal, persisted diagnostics and successful reuse after each distinct rejection boundary. */ () =>
            Effect.gen(
                /** Exercise the actual main composition rather than a test-only imitation of bootstrap ordering. */ function* () {
                    const fs = yield* FileSystem.FileSystem;
                    // Each failure owns a fresh directory; a later successful child must genuinely reacquire the same sink.
                    for (const invalid of [
                        { telemetry_capacity: 'CORE_SECRET_CONFIG_913' },
                        { EVENTIVA_CLUSTER_PROFILE: 'CORE_SECRET_JSON_927' },
                        { EVENTIVA_CLUSTER_PROFILE: '{"edition":"CORE_SECRET_EDITION_931"}' },
                        {
                            EVENTIVA_CLUSTER_PROFILE: '{"edition":"community","storage":"CORE_SECRET_PROVIDER_937"}',
                        },
                        {
                            EVENTIVA_CLUSTER_PROFILE:
                                '{"edition":"community","port":0,"host":"CORE_SECRET_SCHEMA_941"}',
                        },
                    ]) {
                        const directory = yield* fs.makeTempDirectoryScoped();
                        const failed = yield* launch({ ...invalid, telemetryFile_directory: directory });
                        expect(failed.error).toBeUndefined();
                        expect(failed.status).toBe(1);
                        expect(failed.signal).toBeNull();
                        expect(failed.stderr).toBe('');
                        expect(failed.stdout).toContain('bootstrap.failure');
                        expect(failed.stdout).not.toMatch(
                            /diagnostic.registered|modules registered|CORE_SECRET|ParseError|InvalidData/
                        );
                        expect(yield* fs.exists(`${directory}/.eventiva-telemetry.lock`)).toBe(false);
                        const before = yield* fs.readDirectory(directory);
                        const failedRecords = yield* Effect.forEach(
                            before,
                            /** Decode persisted records independently of their console projection. */ (file) =>
                                fs
                                    .readFileString(`${directory}/${file}`)
                                    .pipe(
                                        Effect.flatMap(
                                            /** Require schema-valid local JSONL even on failed bootstrap. */ (text) =>
                                                Effect.forEach(
                                                    text.trimEnd().split('\n'),
                                                    /** Reject malformed diagnostic serialization rather than accepting matching text. */ (
                                                        line
                                                    ) => Schema.decode(Schema.parseJson(TelemetryRecord))(line)
                                                )
                                        )
                                    )
                        );
                        expect(JSON.stringify(failedRecords)).not.toMatch(/CORE_SECRET|diagnostic.registered/);
                        expect(failedRecords.flat()).toHaveLength('telemetry_capacity' in invalid ? 0 : 1);
                        if (!('telemetry_capacity' in invalid)) {
                            expect(failedRecords.flat()[0]).toMatchObject({
                                code: 'diagnostic.startup',
                                outcome: 'failed',
                            });
                        }
                        const valid = yield* launch({ telemetryFile_directory: directory });
                        expect(valid.error).toBeUndefined();
                        expect(valid.status).toBe(0);
                        expect(valid.stderr).toBe('');
                        expect(valid.stdout).toContain('diagnostic.registered');
                        expect(valid.stdout).not.toContain('bootstrap.failure');
                        expect(yield* fs.exists(`${directory}/.eventiva-telemetry.lock`)).toBe(false);
                    }
                }
            ).pipe(Effect.scoped, Effect.provide(NodeFileSystem.layer)),
        30000
    );

    it.effect(
        'replaces malformed telemetry configuration with a secret-free typed Cause before publishing control',
        /** Check JSON and human Cause rendering as well as the failure tag, with a valid acquisition control. */ () =>
            Effect.gen(
                /** Use a local sink so Config rejection cannot be confused with exporter failure. */ function* () {
                    const sink = Layer.succeed(TelemetrySink, {
                        /** Accept schema-projected records without IO or external ingestion. */
                        write: () => Effect.void,
                        flush: Effect.void,
                    });
                    const live = telemetryLayer({ messages: {}, attributes: {} }).pipe(Layer.provide(sink));
                    // A successful use proves the typed error is caused by invalid Config, not an unavailable dependency.
                    const valid = yield* Effect.void.pipe(
                        Effect.provide(live),
                        Effect.withConfigProvider(ConfigProvider.fromMap(new Map())),
                        Effect.exit
                    );
                    expect(Exit.isSuccess(valid)).toBe(true);
                    const invalid = yield* Effect.void.pipe(
                        Effect.provide(live),
                        Effect.withConfigProvider(
                            ConfigProvider.fromMap(new Map([['telemetry.capacity', 'CORE_SECRET_CAUSE_953']]))
                        ),
                        Effect.exit
                    );
                    expect(Exit.isFailure(invalid)).toBe(true);
                    if (Exit.isFailure(invalid)) {
                        expect(Cause.failureOption(invalid.cause)).toMatchObject({
                            _tag: 'Some',
                            value: { _tag: 'TelemetrySinkFailure', reason: 'configuration' },
                        });
                        expect(Cause.pretty(invalid.cause)).not.toContain('CORE_SECRET_CAUSE_953');
                        expect(JSON.stringify(invalid)).not.toContain('CORE_SECRET_CAUSE_953');
                    }
                }
            )
    );
});
