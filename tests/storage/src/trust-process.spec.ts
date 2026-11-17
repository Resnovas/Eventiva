/**
 * @file tests/storage/src/trust-process.spec.ts
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

for (const dialect of ['sqlite', 'postgres'] as const)
    describe(`${dialect} trust replay process recovery`, () => {
        it('rolls back before commit and refuses a consumed nonce after SIGKILL and reopen', async () => {
            const stdout = await new Promise<string>((resolve, reject) => {
                execFile(
                    process.execPath,
                    [fileURLToPath(new URL('../fixtures/trust-process.mjs', import.meta.url)), 'proof', dialect],
                    { timeout: 60000, maxBuffer: 1024 * 1024 },
                    (error, stdout, stderr) => {
                        if (error) reject(new Error(`${error.message}\n${stdout}\n${stderr}`));
                        else resolve(stdout);
                    }
                );
            });
            expect(JSON.parse(stdout.trim())).toEqual({
                event: 'trust-process-recovery-passed',
                dialect,
                beforeCommitRolledBack: true,
                lostAcknowledgementReplayed: false,
                retained: 1,
                release: 'not-implemented',
            });
        }, 65000);
    });
