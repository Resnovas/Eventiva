/**
 * @file tests/storage/src/resource-process.spec.ts
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

import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from '@effect/vitest';
import { Schema } from 'effect';

// Child Node processes use emitted public package subpaths, never source aliases.
for (const dialect of ['sqlite', 'postgres'] as const)
    describe(`${dialect} resource process recovery`, /** Register local resource transaction recovery proofs against emitted packages. */ () => {
        it('rolls back SIGKILL before the outer resource commit and replays a lost acknowledgement in a new process', /** Verify local transaction evidence across process loss, without claiming external-effect or migration recovery. */ async () => {
            // Reopening from independent processes rules out in-memory deduplication as recovery evidence.
            const stdout = await new Promise<string>(
                /** Execute the crash harness with bounded runtime and captured diagnostics. */ (resolve, reject) => {
                    execFile(
                        process.execPath,
                        [fileURLToPath(new URL('../fixtures/resource-process.mjs', import.meta.url)), 'proof', dialect],
                        { timeout: 60000, maxBuffer: 1024 * 1024 },
                        /** Preserve child failure diagnostics or resolve the completed proof report. */ (
                            error,
                            stdout,
                            stderr
                        ) => {
                            // Printed migration observations are accepted only after the orchestrating child exits successfully.
                            if (error) reject(new Error(`${error.message}\n${stdout}\n${stderr}`));
                            else resolve(stdout);
                        }
                    );
                }
            );
            const result: unknown = JSON.parse(stdout.trim());
            expect(result).toMatchObject({
                event: 'resource-process-recovery-passed',
                dialect,
                scope: 'local resource transaction process-loss proof only',
                beforeOuterCommit: { tentativeSets: 5, rolledBack: true, reopenedEmpty: true },
                afterOuterCommit: { acknowledgementLost: true, replayed: true, replayWorkRuns: 0 },
                retained: { records: 1, revisions: 1, outbox: 1, commits: 1, receipts: 1 },
                immutableEvidence: true,
                migrationCrashProof: false,
                externalEffects: false,
                generalExactlyOnce: false,
            });
            const processes = Schema.decodeUnknownSync(
                Schema.Struct({
                    coordinatorPid: Schema.Int,
                    pids: Schema.Array(Schema.Int),
                    exits: Schema.Array(
                        Schema.Struct({ pid: Schema.Int, code: Schema.Null, signal: Schema.Literal('SIGKILL') })
                    ),
                })
            )(result);
            expect(processes.pids).toHaveLength(3);
            expect(new Set([...processes.pids, processes.coordinatorPid, process.pid]).size).toBe(5);
            expect(processes.exits).toEqual(
                processes.pids.map(
                    /** Bind each reported crash to its actual child PID and expected kill signal. */ (pid) => ({
                        pid,
                        code: null,
                        signal: 'SIGKILL'
                    })
                )
            );
        }, 65000);
    });
