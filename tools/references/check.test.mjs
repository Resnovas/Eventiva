/**
 * @file tools/references/check.test.mjs
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

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, matchesGlob } from 'node:path';
import { test } from 'node:test';
import { checkReferences } from './check.mjs';

/**
 * Build a disposable repository with one pinned, identity-checked reference tree, run a scenario in it, and remove
 * it afterwards.
 *
 * @param {(state: { root: string, write: (path: string, text: string) => void, base: string }) => void} run - The scenario, given the fixture root, a file writer and the reference tree path.
 */
const fixture = (run) => {
    const root = mkdtempSync(join(tmpdir(), 'reference-check-'));
    /**
     * Write a fixture file, creating its directories.
     *
     * @param {string} path - The path relative to the fixture root.
     * @param {string} text - The file contents.
     */
    const write = (path, text) => {
        mkdirSync(dirname(join(root, path)), { recursive: true });
        writeFileSync(join(root, path), text);
    };
    /**
     * Run Git in the fixture repository.
     *
     * @param {...string} args - The Git arguments.
     * @returns {string} Git's trimmed output.
     */
    const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
    try {
        for (const path of ['apps', 'packages', 'tests', 'ai-docs', 'tools/references'])
            mkdirSync(join(root, path), { recursive: true });
        write('package.json', JSON.stringify({ dependencies: { effect: 'catalog:' } }));
        write('pnpm-workspace.yaml', "packages:\n  - '!externals/**'\ncatalog:\n  effect: 3.22.4\n");
        write('.nxignore', 'externals/**\n');
        write('.github/codeql/codeql-config.yml', 'paths-ignore:\n  - externals/**\n');
        const base = 'externals/upstream/effect-stable';
        write(`${base}/src/index.ts`, 'export const value = 31;\n');
        write(`${base}/src/nested/a.ts`, 'export const other = 7;\n');
        write(`${base}/src/script.sh`, '#!/bin/sh\nexit 0\n');
        chmodSync(join(root, base, 'src/script.sh'), 0o755);
        symlinkSync('index.ts', join(root, base, 'src/link.ts'));
        write(`${base}/LICENSE`, 'Synthetic test notice\n');
        git('init', '--quiet');
        git('add', '--force', '--all');
        const tree = git('write-tree');
        const entry = {
            id: 'effect-stable',
            upstream: 'https://github.com/Effect-TS/effect',
            commit: 'a'.repeat(40),
            ref: 'effect@3.22.4',
            license: 'MIT',
            packages: [{ name: 'effect', version: '3.22.4' }],
            paths: ['src'],
        };
        write('tools/references/catalog.json', JSON.stringify([entry]));
        write(
            'externals/upstream/sources.json',
            JSON.stringify([
                {
                    ...entry,
                    notices: ['LICENSE'],
                    trees: {
                        src: git('rev-parse', `${tree}:${base}/src`),
                        LICENSE: git('rev-parse', `${tree}:${base}/LICENSE`),
                    },
                },
            ])
        );
        run({ root, write, base });
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
};

/**
 * Assert the exact fixture tree passes with its counted files and bytes.
 *
 * @param {{ root: string }} state - The fixture state.
 */
const acceptsExactTree = (state) => {
    assert.deepEqual(checkReferences(state.root), { sources: 1, files: 5, bytes: 96 });
};

test('accepts exact upstream bytes, executable modes, nested trees and internal symlinks against Git identities', /** Run the exact-tree scenario. */ () => {
    fixture(acceptsExactTree);
});

for (const [label, change, expected] of [
    [
        'changed implementation',
        /**
         * Change an implementation file.
         *
         * @param {object} state - The fixture state.
         */
        (state) => {
            state.write(`${state.base}/src/index.ts`, 'export const value = 32;\n');
        },
        /source changed or incomplete/,
    ],
    [
        'missing implementation',
        /**
         * Delete an implementation file.
         *
         * @param {object} state - The fixture state.
         */
        (state) => {
            rmSync(join(state.root, state.base, 'src/nested/a.ts'));
        },
        /source changed or incomplete/,
    ],
    [
        'changed executable mode',
        /**
         * Drop a script's executable bit.
         *
         * @param {object} state - The fixture state.
         */
        (state) => {
            chmodSync(join(state.root, state.base, 'src/script.sh'), 0o644);
        },
        /source changed or incomplete/,
    ],
    [
        'escaping symlink',
        /**
         * Add a symlink that leaves the tree.
         *
         * @param {object} state - The fixture state.
         */
        (state) => {
            symlinkSync('/etc/passwd', join(state.root, state.base, 'src/escape'));
        },
        /symlink escapes/,
    ],
    [
        'uncatalogued file outside the selected source scope',
        /**
         * Add a file outside the pinned scopes.
         *
         * @param {object} state - The fixture state.
         */
        (state) => {
            state.write(`${state.base}/unexpected.txt`, 'not upstream source');
        },
        /Uncatalogued reference file/,
    ],
    [
        'file dependency',
        /**
         * Depend on a reference as a file package.
         *
         * @param {object} state - The fixture state.
         */
        (state) => {
            state.write(
                'package.json',
                JSON.stringify({ dependencies: { unsafe: 'file:externals/upstream/effect-stable' } })
            );
        },
        /package dependency/,
    ],
    [
        'release drift',
        /**
         * Pin effect to another release.
         *
         * @param {object} state - The fixture state.
         */
        (state) => {
            state.write('package.json', JSON.stringify({ dependencies: { effect: '3.22.5' } }));
        },
        /version drift/,
    ],
    [
        'missing workspace exclusion',
        /**
         * Empty the Nx ignore file.
         *
         * @param {object} state - The fixture state.
         */
        (state) => {
            state.write('.nxignore', '');
        },
        /exclusions are missing/,
    ],
    [
        'missing CodeQL reference exclusion',
        /**
         * Drop the externals CodeQL exclusion.
         *
         * @param {object} state - The fixture state.
         */
        (state) => {
            state.write('.github/codeql/codeql-config.yml', 'paths-ignore:\n  - examples/**\n');
        },
        /CodeQL reference exclusion is missing/,
    ],
])
    test(`rejects ${label}`, /** Apply the change and expect the named rejection. */ () => {
        fixture(
            /**
             * Break the fixture and check the error.
             *
             * @param {object} state - The fixture state.
             */
            (state) => {
                change(state);
                assert.throws(
                    /** Run the check on the broken fixture. */ () => {
                        checkReferences(state.root);
                    },
                    expected
                );
            }
        );
    });

test('excludes every case/depth of reference directories while retaining active scans and house protections', /** Verify the repository's scanner policy without modifying preserved reference trees. */ () => {
    const { parse } = createRequire(import.meta.resolve('nx/package.json'))('yaml');
    /**
     * Parse one repository YAML file.
     *
     * @param {string} file - The path relative to the repository root.
     * @returns {object} The parsed document.
     */
    const read = (file) => parse(readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8'));
    const dependabot = read('.github/dependabot.yml');
    const codeql = read('.github/codeql/codeql-config.yml');
    const house = read('.github/smartcloud.yml');
    assert.ok(house.sync.exclude.includes('.github/dependabot.yml'));
    assert.equal(codeql['disable-default-queries'], undefined);
    assert.equal(codeql.paths, undefined);
    assert.ok(
        codeql['paths-ignore'].every(
            /**
             * Reject glob syntax the scanners treat differently.
             *
             * @param {string} pattern - One CodeQL ignore pattern.
             * @returns {boolean} Whether it uses no `?`, `+`, bracket or `!` syntax.
             */
            (pattern) => !/[?+[\]!]/.test(pattern)
        )
    );

    const policies = [codeql['paths-ignore']];
    for (const ecosystem of ['github-actions', 'npm'])
        assert.ok(
            dependabot.updates.some(
                /**
                 * Match an update entry to the ecosystem.
                 *
                 * @param {object} update - One Dependabot update entry.
                 * @returns {boolean} Whether it covers this ecosystem.
                 */
                (update) => update['package-ecosystem'] === ecosystem
            )
        );
    for (const update of dependabot.updates) {
        assert.equal(update.schedule.interval, 'weekly');
        assert.equal(update.cooldown['default-days'], 7);
        assert.ok(
            Object.values(update.groups).some(
                /**
                 * Find the security-update group.
                 *
                 * @param {object} group - One Dependabot group.
                 * @returns {boolean} Whether it applies to security updates.
                 */
                (group) => group['applies-to'] === 'security-updates'
            )
        );
        policies.push(update['exclude-paths']);
    }
    for (const word of ['examples', 'externals']) {
        let variants = [''];
        for (const letter of word)
            variants = variants.flatMap(
                /**
                 * Extend a spelling with the next letter in both cases.
                 *
                 * @param {string} prefix - A spelling built so far.
                 * @returns {Array<string>} The prefix with the lower- and upper-case letter.
                 */
                (prefix) => [prefix + letter, prefix + letter.toUpperCase()]
            );
        for (const variant of variants) {
            const literal = `**/${variant}/**`;
            assert.ok(codeql['paths-ignore'].includes(literal), literal);
            for (const file of [`${variant}/package.json`, `nested/project/${variant}/deep/pnpm-lock.yaml`]) {
                assert.ok(matchesGlob(file, literal), file);
                for (const update of dependabot.updates)
                    assert.ok(
                        update['exclude-paths'].some(
                            /**
                             * Check one Dependabot exclusion against the file.
                             *
                             * @param {string} pattern - One exclude-paths glob.
                             * @returns {boolean} Whether it matches the file.
                             */
                            (pattern) => matchesGlob(file, pattern)
                        ),
                        file
                    );
            }
        }
    }
    for (const file of [
        'apps/client/src/index.ts',
        'packages/contracts/src/action.ts',
        'tools/references/check.mjs',
        'notexamples/package.json',
        'nested/externals-copy/package.json',
        'nested/examples.ts',
    ])
        for (const patterns of policies)
            assert.ok(
                !patterns.some(
                    /**
                     * Check one exclusion against an active file.
                     *
                     * @param {string} pattern - One exclusion glob.
                     * @returns {boolean} Whether it would wrongly exclude the file.
                     */
                    (pattern) => matchesGlob(file, pattern)
                ),
                file
            );
});

test('OSV gitignore policy excludes reference directory segments but retains active manifests', /** Keep OSV's default gitignore-based scope narrow without suppressing vulnerability IDs. */ () => {
    fixture(
        /**
         * Copy the real gitignore into the fixture and check what Git ignores.
         *
         * @param {object} state - The fixture state.
         */
        (state) => {
            const { root, write } = state;
            write('.gitignore', readFileSync(new URL('../../.gitignore', import.meta.url), 'utf8'));
            const { parse } = createRequire(import.meta.resolve('nx/package.json'))('yaml');
            const house = parse(readFileSync(new URL('../../.github/smartcloud.yml', import.meta.url), 'utf8'));
            const workflow = parse(
                readFileSync(new URL('../../.github/workflows/house-scorecard.yml', import.meta.url), 'utf8')
            );
            assert.ok(house.sync.exclude.includes('.github/workflows/house-scorecard.yml'));
            const steps = workflow.jobs['house-scorecard'].steps;
            const scanner = steps.find(
                /**
                 * Find the Scorecard step.
                 *
                 * @param {object} step - One workflow step.
                 * @returns {boolean} Whether it runs the Scorecard action.
                 */
                (step) => step.uses?.startsWith('ossf/scorecard-action@')
            );
            assert.equal(scanner.uses, 'ossf/scorecard-action@fa7117db83c52d787ae5a89f350999701505d78e');
            assert.equal(scanner.with.results_format, 'sarif');
            assert.equal(scanner.with.publish_results, false);
            assert.ok(
                steps.some(
                    /**
                     * Find the SARIF upload for Scorecard.
                     *
                     * @param {object} step - One workflow step.
                     * @returns {boolean} Whether it uploads with the scorecard category.
                     */
                    (step) => step.with?.category === 'scorecard'
                )
            );
            const excluded = [];
            for (const word of ['examples', 'externals']) {
                let variants = [''];
                for (const letter of word)
                    variants = variants.flatMap(
                        /**
                         * Extend a spelling with the next letter in both cases.
                         *
                         * @param {string} prefix - A spelling built so far.
                         * @returns {Array<string>} The prefix with the lower- and upper-case letter.
                         */
                        (prefix) => [prefix + letter, prefix + letter.toUpperCase()]
                    );
                for (const variant of variants)
                    excluded.push(`${variant}/pnpm-lock.yaml`, `apps/nested/${variant}/deep/pnpm-lock.yaml`);
            }
            const retained = [
                'pnpm-lock.yaml',
                'apps/server/pnpm-lock.yaml',
                'packages/nested/pnpm-lock.yaml',
                'notexamples/pnpm-lock.yaml',
                'nested/externals-copy/yarn.lock',
                'nested/examples.ts',
            ];
            const ignored = execFileSync('git', ['-C', root, 'check-ignore', '--no-index', '--stdin'], {
                input: [...excluded, ...retained].join('\n') + '\n',
                encoding: 'utf8',
            })
                .trim()
                .split('\n');
            assert.deepEqual(ignored, excluded);
        }
    );
});
