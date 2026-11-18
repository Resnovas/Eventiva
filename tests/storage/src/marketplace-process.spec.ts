/**
 * @file tests/storage/src/marketplace-process.spec.ts
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

// Real child processes reopen the database. Normal verification resolves emitted public subpaths.
for (const dialect of ['sqlite', 'postgres'] as const)
    describe(`${dialect} marketplace process recovery`, /** Register emitted-code crash proofs for both database implementations. */ () => {
        it('survives SIGKILL before commit, after stage/settle commit and while leased; reauthorizes durable replay', /** Verify committed marketplace evidence survives process loss without bypassing live authorization. */ async () => {
            // Distinct child processes distinguish durable recovery from coordinator memory.
            const stdout = await new Promise<string>(
                /** Execute the bounded crash harness and preserve failure diagnostics. */ (resolve, reject) => {
                    execFile(
                        process.execPath,
                        [
                            fileURLToPath(new URL('../fixtures/marketplace-process.mjs', import.meta.url)),
                            'proof',
                            dialect
                        ],
                        { timeout: 60000, maxBuffer: 1024 * 1024 },
                        /** Reject unsuccessful proof execution with both captured streams; accept only its completed report. */ (
                            error,
                            stdout,
                            stderr
                        ) => {
                            // A worker can print before crashing; only a successful exit permits interpreting its report as evidence.
                            if (error) reject(new Error(`${error.message}\n${stdout}\n${stderr}`));
                            else resolve(stdout);
                        }
                    );
                }
            );
            const result = JSON.parse(stdout.trim());
            expect(result).toMatchObject({
                event: 'marketplace-process-recovery-passed',
                dialect,
                beforeCommitRolledBack: true,
                stageAcknowledgementLost: true,
                settlementAcknowledgementLost: true,
                staleFenceRejected: true,
                revocationSurvived: true,
                intents: 1,
                settlements: 1,
                localOnly: true,
            });
            expect(new Set<number>(result.pids).size).toBe(6);
            expect(result.pids).not.toContain(process.pid);
        }, 65000);
    });
