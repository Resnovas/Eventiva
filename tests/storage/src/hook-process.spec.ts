/**
 * @file tests/storage/src/hook-process.spec.ts
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

// Node deliberately resolves emitted package subpaths, not Vitest's source
// condition. The normal verify pipeline builds workspace dependencies first.
for (const dialect of ['sqlite', 'postgres'] as const)
    describe(`${dialect} hook process recovery`, /** Verify emitted SQL recovery protocols in independent processes for each supported dialect. */ () => {
        it('survives SIGKILL with stale delivery fencing, operator replay and trusted synthetic consumer cursor recovery', /** Assert durable delivery and consumer recovery without treating in-memory state as evidence. */ async () => {
            const stdout = await new Promise<string>(
                /** Run the existing child-process proof and preserve its failure diagnostics. */ (resolve, reject) => {
                    execFile(
                        process.execPath,
                        [fileURLToPath(new URL('../fixtures/hook-process.mjs', import.meta.url)), 'proof', dialect],
                        { timeout: 60000, maxBuffer: 1024 * 1024 },
                        /** Reject failed child execution with captured diagnostics, otherwise return its proof report. */
                        (error, stdout, stderr) => {
                            if (error) reject(new Error(`${error.message}\n${stdout}\n${stderr}`));
                            else resolve(stdout);
                        }
                    );
                }
            );
            const report = JSON.parse(stdout.trim());
            expect(report).toMatchObject({
                event: 'hook-process-recovery-passed',
                dialect,
                attempts: 3,
                applied: 1,
                originRuns: 1,
                operatorReplay: {
                    acknowledgementLost: true,
                    retryAccepted: false,
                    historyRecords: 1,
                    terminalAttempts: 4,
                    preservedAttempt: 2,
                },
                trustedSyntheticConsumer: {
                    scope: 'trusted synthetic consumer proof only',
                    acknowledgementLost: true,
                    resumedAfter: 1,
                    beforeCommitRollback: true,
                    retriedEvent: '019b0000-0000-7000-8000-00000000000c',
                    cursor: 2,
                    applied: 2,
                    duplicateApplications: 0,
                    metadataOnly: true,
                    productionNativeRelease: false,
                    generalExactlyOnce: false,
                },
            });
            expect(report.trustedSyntheticConsumer.pids).toHaveLength(3);
            expect(new Set(report.trustedSyntheticConsumer.pids).size).toBe(3);
        }, 65000);

        it('retains unresolved producer callbacks across SIGKILL and reconciles without replay', /** Verify crash recovery in distinct emitted-code processes, without replaying the mutation. */ async () => {
            // Separate processes prevent in-memory state from masquerading as durable intent or reconciliation.
            const stdout = await new Promise<string>(
                /** Run the crash proof and retain diagnostics if any child process fails. */ (resolve, reject) => {
                    execFile(
                        process.execPath,
                        [
                            fileURLToPath(new URL('../fixtures/hook-producer-process.mjs', import.meta.url)),
                            'proof',
                            dialect,
                        ],
                        { timeout: 60000, maxBuffer: 1024 * 1024 },
                        /** Surface child failure output or return the completed producer recovery report. */
                        (error, stdout, stderr) => {
                            if (error) reject(new Error(`${error.message}\n${stdout}\n${stderr}`));
                            else resolve(stdout);
                        }
                    );
                }
            );
            expect(JSON.parse(stdout.trim())).toEqual({
                event: 'hook-producer-process-passed',
                dialect,
                processes: 3,
                distinctIncarnations: 3,
                unresolvedBeforeReconcile: true,
                callbackExecutions: 1,
                committedFacts: 1,
                confirmationAcknowledgementLost: true,
                automaticKernelProduction: false,
                productionRelease: false,
            });
        }, 65000);
    });
