/**
 * @file tools/verification/pipeline.test.mjs
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
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { verificationStages } from './pipeline.mjs';

const manifest = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const nx = JSON.parse(readFileSync(new URL('../../nx.json', import.meta.url), 'utf8'));

/**
 * Preserve the static-first funnel while allowing measured independent Nx work.
 * The earlier seven-stage candidate passed at two tasks in 924.58s and failed at four in 935.82s.
 * Reconciled full verification and all three selected proofs passed in 983.71s; assertions alone do not qualify it.
 */
test('verification preserves every gate and dependency barrier without serializing independent Nx work', /** Guard the actual manifest, not a duplicated runner. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () => {
    assert.deepEqual(manifest.scripts['verify:static'].split(' && '), [
        'nx run-many -t build',
        'nx run-many -t lint typecheck',
        'node tools/resources/boundaries.mjs',
        'node tools/resources/boundaries.mjs --declarations',
    ]);
    assert.equal(manifest.scripts.verify, 'node tools/verification/pipeline.mjs');
    assert.equal(manifest.scripts['test:affected'], 'node tools/verification/affected.mjs');
    assert.deepEqual(
        verificationStages,
        [
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
        ],
        'Retain static-first ordering and every funnel gate; feature evidence keeps its separately tested serial scheduling.'
    );
    assert.equal(manifest.scripts['verify:features'], 'node tools/verification/run.mjs');
    assert.equal(
        nx.parallel,
        2,
        'Use the measured two-task Nx budget; benchmark changes against the same complete gate and inspect CPU, memory, PostgreSQL and port contention.'
    );
    assert.equal(
        nx.neverConnectToCloud,
        true,
        'Verification remains local; this optimization does not authorize Nx Cloud.'
    );
    assert.deepEqual(
        nx.targetDefaults['export-android'].dependsOn,
        ['export-web'],
        'Order Expo --clear exports through the real task graph; keep independent smoke work parallel rather than racing the shared Metro cache.'
    );
    const ci = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8');
    assert.match(ci, /push:\s+branches: \[main\]/);
    assert.match(ci, /pull_request:/);
    const commands = [
        'run: node --run verify:static',
        'run: node --run check',
        'run: pnpm nx run-many -t lint typecheck test build parity',
        'node tools/resources/boundaries.mjs --declarations',
        'node tools/verification/run.mjs --base "$VERIFICATION_BASE"',
    ];
    const offsets = commands.map(
        /**
         * Locate a CI stage in the workflow text.
         *
         * @param {string} command - One required CI command.
         * @returns {number} Its offset, or -1 when missing.
         */
        (command) => ci.indexOf(command)
    );
    assert.ok(
        offsets.every(
            /**
             * Require the stage to be present.
             *
             * @param {number} offset - One stage's offset.
             * @returns {boolean} Whether it was found.
             */
            (offset) => offset >= 0
        ),
        'Retain every full CI verification stage.'
    );
    assert.deepEqual(
        offsets,
        [...offsets].sort(
            /**
             * Sort offsets ascending.
             *
             * @param {number} a - One offset.
             * @param {number} b - Another offset.
             * @returns {number} Their difference.
             */
            (a, b) => a - b
        ),
        'CI must remain static-first.'
    );
    assert.match(ci, /smoke:\s+name: smoke\s+#[^\n]*\n\s+needs: \[verify\]/);
    assert.match(ci, /run: pnpm nx run-many -t smoke[^\n]*--skip-nx-cache/);
    assert.match(ci, /name: Upload affected-feature evidence\s+if: always\(\)/);
    assert.match(ci, /path: test-output\/verification\/\s+retention-days: 7/);
    assert.match(ci, /needs: \[verify, smoke\]/);
});

test('Nx test hashes include every reused spec family and restore exactly without hashing unrelated docs', /** Exercise installed Nx against real configs and source bytes, never a hand-written hash approximation. */ () => {
    const root = resolve(import.meta.dirname, '../..');
    const parent = join(root, '.amp/in/orb-backup/test-output/cache-input-regression');
    mkdirSync(parent, { recursive: true });
    const cwd = mkdtempSync(join(parent, 'run-'));
    const archive = execFileSync(
        'git',
        [
            'archive',
            'HEAD',
            'apps',
            'packages',
            'tests',
            'tools',
            'README.md',
            '.gitignore',
            '.nxignore',
            'nx.json',
            'package.json',
            'pnpm-lock.yaml',
            'pnpm-workspace.yaml',
            'tsconfig.json',
            'tsconfig.base.json',
            'vitest.shared.ts',
            'eslint.config.mjs',
        ],
        { cwd: root, maxBuffer: 128 * 1024 * 1024 }
    );
    execFileSync('tar', ['-xf', '-'], { cwd, input: archive });
    for (const path of ['tests/contracts/project.json', 'tests/runtime/project.json'])
        copyFileSync(join(root, path), join(cwd, path));
    symlinkSync(join(root, 'node_modules'), join(cwd, 'node_modules'), 'dir');
    const probe = `
const { createRequire } = require('node:module');
const { resolve } = require('node:path');
const { readFileSync } = require('node:fs');
const req = createRequire(resolve('package.json'));
const { createProjectGraphAsync } = req('./node_modules/nx/dist/src/project-graph/project-graph.js');
const { createTaskHasher } = req('./node_modules/nx/dist/src/hasher/create-task-hasher.js');
const { createTaskGraph } = req('./node_modules/nx/dist/src/tasks-runner/create-task-graph.js');
(async () => {
    const graph = await createProjectGraphAsync();
    const nx = JSON.parse(readFileSync('nx.json', 'utf8'));
    const tasks = createTaskGraph(graph, {}, ['@eventiva/contracts-tests', '@eventiva/runtime-tests'], ['test'], undefined, {});
    const selected = ['@eventiva/contracts-tests:test', '@eventiva/runtime-tests:test'].map(id => tasks.tasks[id]);
    const hashes = await createTaskHasher(graph, nx, {}).hashTasks(selected, tasks, process.env, process.cwd(), true);
    process.stdout.write(JSON.stringify(hashes.map(hash => hash.value)));
})().catch(error => { console.error(error); process.exitCode = 1; });
`;
    /**
     * Compute Nx's test-target hashes for the fixture workspace in a child process.
     *
     * @returns {Array<string>} The hash of each test target.
     */
    const hashes = () =>
        JSON.parse(
            execFileSync(process.execPath, ['-e', probe], {
                cwd,
                encoding: 'utf8',
                maxBuffer: 8 * 1024 * 1024,
                env: {
                    PATH: process.env.PATH,
                    HOME: process.env.HOME,
                    NX_DAEMON: 'false',
                    NX_CACHE_PROJECT_GRAPH: 'false',
                },
            })
        );
    const before = hashes();
    const paths = [
        'tests/resources/src/inventory-location.spec.ts',
        'tests/telemetry/src/telemetry.spec.ts',
        'tests/ui-modules/src/declarative-module.spec.tsx',
        'tests/runtime/src/kernel-runtime.spec.ts',
        'tests/runtime/src/marketplace.spec.ts',
        'tests/runtime/src/trust.spec.ts',
    ];
    for (const path of paths) {
        const file = join(cwd, path);
        const source = readFileSync(file, 'utf8');
        const changed = source.replace(/\.(toBe|toEqual|toMatchObject)\(/, '.not.$1(');
        assert.notEqual(changed, source, `Select a real public assertion in ${path}.`);
        try {
            writeFileSync(file, changed);
            const after = hashes();
            assert.notEqual(
                after[0],
                before[0],
                `Hash the reused spec ${path}; use dependency default inputs, not production.`
            );
            if (!path.startsWith('tests/ui-modules/'))
                assert.notEqual(after[1], before[1], `Hash the runtime spec input ${path}.`);
        } finally {
            writeFileSync(file, source);
        }
        assert.deepEqual(hashes(), before, `Restoring ${path} must restore both hashes.`);
    }
    const unrelated = join(cwd, 'README.md');
    writeFileSync(unrelated, readFileSync(unrelated, 'utf8') + '\nUnrelated hash control.\n');
    assert.deepEqual(hashes(), before, 'Do not hash files outside these test projects and their dependency closure.');
});
