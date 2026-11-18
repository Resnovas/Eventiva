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

const fixture = (run) => {
    const root = mkdtempSync(join(tmpdir(), 'reference-check-'));
    const write = (path, text) => {
        mkdirSync(dirname(join(root, path)), { recursive: true });
        writeFileSync(join(root, path), text);
    };
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

test('accepts exact upstream bytes, executable modes, nested trees and internal symlinks against Git identities', () =>
    fixture(({ root }) => {
        assert.deepEqual(checkReferences(root), { sources: 1, files: 5, bytes: 96 });
    }));

for (const [label, change, expected] of [
    [
        'changed implementation',
        ({ write, base }) => write(`${base}/src/index.ts`, 'export const value = 32;\n'),
        /source changed or incomplete/,
    ],
    [
        'missing implementation',
        ({ root, base }) => rmSync(join(root, base, 'src/nested/a.ts')),
        /source changed or incomplete/,
    ],
    [
        'changed executable mode',
        ({ root, base }) => chmodSync(join(root, base, 'src/script.sh'), 0o644),
        /source changed or incomplete/,
    ],
    [
        'escaping symlink',
        ({ root, base }) => symlinkSync('/etc/passwd', join(root, base, 'src/escape')),
        /symlink escapes/,
    ],
    [
        'uncatalogued file outside the selected source scope',
        ({ write, base }) => write(`${base}/unexpected.txt`, 'not upstream source'),
        /Uncatalogued reference file/,
    ],
    [
        'file dependency',
        ({ write }) =>
            write(
                'package.json',
                JSON.stringify({ dependencies: { unsafe: 'file:externals/upstream/effect-stable' } })
            ),
        /package dependency/,
    ],
    [
        'release drift',
        ({ write }) => write('package.json', JSON.stringify({ dependencies: { effect: '3.22.5' } })),
        /version drift/,
    ],
    ['missing workspace exclusion', ({ write }) => write('.nxignore', ''), /exclusions are missing/],
    [
        'missing CodeQL reference exclusion',
        ({ write }) => write('.github/codeql/codeql-config.yml', 'paths-ignore:\n  - examples/**\n'),
        /CodeQL reference exclusion is missing/,
    ],
])
    test(`rejects ${label}`, () =>
        fixture((state) => {
            change(state);
            assert.throws(() => checkReferences(state.root), expected);
        }));

/** Verify the repository's scanner policy without modifying preserved reference trees. */
test('excludes every case/depth of reference directories while retaining active scans and house protections', () => {
    // Reuse Nx's installed parser rather than adding a new tooling dependency.
    const { parse } = createRequire(import.meta.resolve('nx/package.json'))('yaml');
    const read = (file) => parse(readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8'));
    const dependabot = read('.github/dependabot.yml');
    const codeql = read('.github/codeql/codeql-config.yml');
    const house = read('.github/smartcloud.yml');
    assert.ok(house.sync.exclude.includes('.github/dependabot.yml'));
    assert.equal(codeql['disable-default-queries'], undefined);
    assert.equal(codeql.paths, undefined);
    assert.ok(codeql['paths-ignore'].every((pattern) => !/[?+\[\]!]/.test(pattern)));

    const policies = [codeql['paths-ignore']];
    for (const ecosystem of ['github-actions', 'npm'])
        assert.ok(dependabot.updates.some((update) => update['package-ecosystem'] === ecosystem));
    for (const update of dependabot.updates) {
        assert.equal(update.schedule.interval, 'weekly');
        assert.equal(update.cooldown['default-days'], 7);
        assert.ok(Object.values(update.groups).some((group) => group['applies-to'] === 'security-updates'));
        policies.push(update['exclude-paths']);
    }
    for (const word of ['examples', 'externals']) {
        // Build combinations independently of the literal list's bit-mask generation.
        let variants = [''];
        for (const letter of word)
            variants = variants.flatMap((prefix) => [prefix + letter, prefix + letter.toUpperCase()]);
        for (const variant of variants) {
            const literal = `**/${variant}/**`;
            assert.ok(codeql['paths-ignore'].includes(literal), literal);
            for (const file of [`${variant}/package.json`, `nested/project/${variant}/deep/pnpm-lock.yaml`]) {
                assert.ok(matchesGlob(file, literal), file);
                for (const update of dependabot.updates)
                    assert.ok(
                        update['exclude-paths'].some((pattern) => matchesGlob(file, pattern)),
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
        for (const patterns of policies) assert.ok(!patterns.some((pattern) => matchesGlob(file, pattern)), file);
});
