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
    describe(`${dialect} hook process recovery`, () => {
        it('survives SIGKILL before delivery, after sink acceptance and after operator replay commit with stale fencing', async () => {
            const stdout = await new Promise<string>((resolve, reject) => {
                execFile(
                    process.execPath,
                    [fileURLToPath(new URL('../fixtures/hook-process.mjs', import.meta.url)), 'proof', dialect],
                    { timeout: 60000, maxBuffer: 1024 * 1024 },
                    (error, stdout, stderr) => {
                        if (error) reject(new Error(`${error.message}\n${stdout}\n${stderr}`));
                        else resolve(stdout);
                    }
                );
            });
            expect(JSON.parse(stdout.trim())).toMatchObject({
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
            });
        }, 65000);
    });
