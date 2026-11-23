/**
 * @file tools/verification/affected.mjs
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

import { execFileSync, spawnSync } from 'node:child_process';
import { globSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const paths = execFileSync('git', ['diff', '--cached', '--name-only', '--no-renames', '-z'], {
    cwd: root,
    encoding: 'utf8',
})
    .split('\0')
    .filter(Boolean);
if (
    paths.some(
        /**
         * Detect a path Nx's line-based stdin cannot carry.
         *
         * @param {string} path - One changed path.
         * @returns {boolean} Whether it contains a newline.
         */
        (path) => path.includes('\n')
    )
)
    throw new Error('Rename newline-containing paths before testing; Nx stdin accepts one path per line.');

if (paths.length) {
    const commands = [['node_modules/nx/dist/bin/nx.js', 'affected', '-t', 'test', '--stdin']];
    if (
        paths.some(
            /**
             * Detect a root, tooling, script or workflow change, which can affect the root tooling tests.
             *
             * @param {string} path - One changed path.
             * @returns {boolean} Whether it is at the root or under tools, scripts or the workflows.
             */
            (path) => !path.includes('/') || /^(tools|scripts|\.github\/workflows)\//.test(path)
        )
    ) {
        const tests = globSync('tools/**/*.test.mjs', { cwd: root }).sort();
        if (tests.length) commands.push(['--test', ...tests]);
    }
    for (const argv of commands) {
        const result = spawnSync(process.execPath, argv, {
            cwd: root,
            stdio: ['pipe', 'inherit', 'inherit'],
            input: paths.join('\n') + '\n',
        });
        if (result.status !== 0 || result.error)
            throw new Error(
                `Affected tests failed: node ${argv.join(' ')} (${result.error?.message ?? result.signal ?? result.status}). Fix the affected test; do not replace it with full verification or bypass it.`
            );
    }
} else {
    console.log('Affected tests: no staged paths.');
}
