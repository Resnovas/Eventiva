/**
 * @file tools/verification/pre-commit.mjs
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
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runVerification } from './pipeline.mjs';
import { installPreCommit } from '../dev/pre-commit.mjs';

const root = resolve(import.meta.dirname, '../..');
/**
 * Run Git in the repository and return its trimmed output.
 *
 * @param {...string} args - The Git arguments.
 * @returns {string} Git's trimmed standard output.
 */
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const marker = '# eventiva:verified-staged-snapshot';
const hook = resolve(root, git('rev-parse', '--git-path', 'hooks/pre-commit'));

if (process.argv[2] === '--install') {
    const legacy = [
        `#!/bin/sh\n${marker}\nset -eu\nnode tools/verification/pre-commit.mjs\n`,
        '#!/bin/sh\n# house:pre-commit\nexec node "$(git rev-parse --show-toplevel)/tools/dev/pre-commit.mjs" run\n',
    ];
    if (existsSync(hook)) {
        const current = readFileSync(hook, 'utf8');
        if (legacy.includes(current)) {
            const backup = `${hook}.before-eventiva-composition`;
            if (!existsSync(backup)) writeFileSync(backup, current, { flag: 'wx' });
            unlinkSync(hook);
        }
    }
    installPreCommit(root, false, {
        script: 'verify:staged',
        marker: marker.slice(2),
    });
    console.log('Eventiva pre-commit installed; commit-msg preserved.');
} else {
    /**
     * Record the staged tree, refusing to run while unstaged or untracked changes exist.
     *
     * @returns {string} The staged tree's object identity.
     */
    const snapshot = () => {
        if (
            spawnSync('git', ['diff', '--quiet'], { cwd: root }).status !== 0 ||
            git('ls-files', '--others', '--exclude-standard')
        ) {
            throw new Error(
                'Verification must inspect the staged tree. Stage or separately preserve all working-tree changes and untracked files before committing; nothing was stashed or overwritten.'
            );
        }
        return git('write-tree');
    };
    const before = snapshot();
    const verificationEnv = { ...process.env };
    for (const name of git('rev-parse', '--local-env-vars').split('\n')) delete verificationEnv[name];
    runVerification({
        env: verificationEnv,
        staged: true,
        /** Refuse to continue when the staged tree changed during verification. */
        afterStage() {
            if (snapshot() !== before)
                throw new Error('The staged tree changed during verification. Review it and rerun the commit.');
        },
    });
}
