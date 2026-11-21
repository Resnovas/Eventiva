/**
 * @file tools/verification/pipeline.mjs
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

import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(import.meta.dirname, '../..');

/**
 * Full acceptance remains available locally and required in CI, separate from commit admission.
 *
 * @since 0.0.1
 * @example
 * for (const argv of verificationStages) spawnSync(process.execPath, argv);
 */
export const verificationStages = [
    ['--run', 'verify:static'],
    ['--run', 'check'],
    [
        '--test',
        'tools/resources/boundaries.test.mjs',
        'tools/resources/types.test.mjs',
        'tools/verification/run.test.mjs',
    ],
    ['node_modules/nx/dist/bin/nx.js', 'run-many', '-t', 'test', 'build', 'parity'],
    ['node_modules/nx/dist/bin/nx.js', 'run-many', '-t', 'smoke'],
    ['--run', 'verify:features'],
];

/**
 * The default after-stage hook: a full local run has no staged snapshot to re-check.
 *
 * @returns {undefined} Nothing.
 */
const noStageCheck = () => undefined;

/**
 * Stop at the first failed gate or snapshot barrier; no caller can skip static verification.
 *
 * @since 0.0.1
 * @param {{ env?: object, afterStage?: () => void, staged?: boolean }} [options] - How to run the stages.
 * @param {object} [options.env] - The environment for each stage; defaults to this process's.
 * @param {() => void} [options.afterStage] - Called after each passing stage, for example to check the staged tree is unchanged.
 * @param {boolean} [options.staged] - Run only the static gate and affected tests, for commit admission.
 * @example
 * runVerification({ staged: true });
 */
export function runVerification({ env = process.env, afterStage = noStageCheck, staged = false } = {}) {
    const stages = staged ? [verificationStages[0], ['--run', 'test:affected']] : verificationStages;
    for (const argv of stages) {
        const result = spawnSync(process.execPath, argv, { cwd: root, stdio: 'inherit', env });
        if (result.status !== 0 || result.error)
            throw new Error(
                `Verification failed: node ${argv.join(' ')} (${result.error?.message ?? result.signal ?? result.status}). Fix the reported source or public-path proof; do not bypass the gate.`
            );
        afterStage();
    }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runVerification();
