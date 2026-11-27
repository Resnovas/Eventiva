/**
 * @file tools/verification/run.test.mjs
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

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseRegistry, redact, selectFeatures, summarizeProof } from './run.mjs';

const menu =
    '| menu | apps/menu/;packages/contracts/src/menu.ts | web | / then Open menu | keyboard focus and dismissal | `["pnpm","nx","test","menu","--skip-nx-cache"]` | native unverified |';
const billing =
    '| billing | apps/billing/ | HTTP | authenticated invoice action | durable receipt replay | `["pnpm","nx","test","billing","--skip-nx-cache"]` | synthetic fixture only |';

test('affected paths select their own public proof and explicit shared dependencies, not unrelated UI', /** Changed paths select only the features that declare them or depend on them. */ () => {
    const registry = parseRegistry(`${menu}\n${billing}`);
    assert.deepEqual(
        selectFeatures(registry, ['apps/billing/create.ts']).map(
            /**
             * Keep a selected feature's ID.
             *
             * @param {{ id: string }} entry - One selected feature.
             * @returns {string} Its ID.
             */
            (entry) => entry.id
        ),
        ['billing']
    );
    assert.deepEqual(
        selectFeatures(registry, ['packages/contracts/src/menu.ts']).map(
            /**
             * Keep a selected feature's ID.
             *
             * @param {{ id: string }} entry - One selected feature.
             * @returns {string} Its ID.
             */
            (entry) => entry.id
        ),
        ['menu']
    );
    assert.deepEqual(selectFeatures(registry, ['docs/notes.md']), []);
    assert.deepEqual(
        selectFeatures(
            registry,
            ['packages/contracts/src/menu.ts'],
            [
                ['apps/billing/create.ts', 'packages/contracts/src/menu.ts'],
                ['apps/billing/index.ts', 'apps/billing/create.ts'],
            ]
        ).map(
            /**
             * Keep a selected feature's ID.
             *
             * @param {{ id: string }} entry - One selected feature.
             * @returns {string} Its ID.
             */
            (entry) => entry.id
        ),
        ['menu', 'billing']
    );
    assert.throws(
        /** Expect the call to throw. */ () => {
            selectFeatures(registry, ['apps/menu-other/index.ts']);
        },
        /Map affected application paths/
    );
});

test('malformed, duplicate and executable-shell registry rows fail before executing any proof', /** Bad registry rows are refused at parse time. */ () => {
    assert.throws(
        /** Expect the call to throw. */ () => {
            parseRegistry(`${menu}\n${menu}`);
        },
        /duplicate/
    );
    assert.throws(
        /** Expect the call to throw. */ () => {
            parseRegistry(menu.replace('apps/menu/', '../private/'));
        },
        /traversal/
    );
    assert.throws(
        /** Expect the call to throw. */ () => {
            parseRegistry(menu.replace('"pnpm"', '"sh"'));
        },
        /argument array/
    );
    assert.throws(
        /** Expect the call to throw. */ () => {
            parseRegistry(menu.replace('keyboard focus and dismissal', ''));
        },
        /Invalid/
    );
    assert.equal(parseRegistry(menu)[0].reach, '/ then Open menu');
    for (const override of ['--parallel=2', '--parallel', '--parallel=3'])
        assert.throws(
            /** Expect the parallel override to be refused. */ () => {
                parseRegistry(menu.replace('"--skip-nx-cache"', `"--skip-nx-cache","${override}"`));
            },
            /evidence runs Nx serially/
        );
});

test('fixture log redaction preserves useful failure information while replacing credentials', /** Redaction keeps the failure text but hides credentials. */ () => {
    assert.equal(
        redact('connect postgres://user:abc@localhost/db failed: abc', ['abc']),
        'connect postgres://[REDACTED]@localhost/db failed: [REDACTED]'
    );
    assert.equal(redact('assertion: expected 4, received 3'), 'assertion: expected 4, received 3');
});

test('report outcomes distinguish passed, failed, skipped and empty execution', /** Only reports with at least one passing test and no failures count as proof. */ () => {
    const result = summarizeProof(
        {
            testResults: [
                {
                    assertionResults: [
                        { fullName: 'ready', status: 'passed' },
                        { fullName: 'failed', status: 'failed' },
                        { fullName: 'not exercised', status: 'pending' },
                    ],
                },
            ],
        },
        ''
    );
    assert.equal(result.count, 3);
    assert.equal(result.passed, 1);
    assert.equal(summarizeProof(undefined, 'command exited successfully').count, 0);
    assert.equal(summarizeProof(undefined, '# tests 2\n# pass 1\n').passed, 1);
    const browser = summarizeProof(
        {
            suites: [
                {
                    specs: [
                        {
                            title: 'shell',
                            tests: [
                                { expectedStatus: 'passed', status: 'expected', results: [{ status: 'passed' }] },
                                { expectedStatus: 'passed', status: 'skipped', results: [] },
                            ],
                        },
                    ],
                },
            ],
        },
        ''
    );
    assert.equal(browser.count, 2);
    assert.equal(browser.passed, 1);
});

/**
 * Isolate real CLI/hook operations from this checkout and leave reproducible fixtures in ignored orb scratch.
 *
 * @param {{ pipeline?: boolean }} [options] - What to copy into the disposable repository.
 * @param {boolean} [options.pipeline] - Also copy the pipeline and hook files and their package scripts.
 * @returns {{ cwd: string, git: Function, run: Function, env: object }} The fixture directory, a Git runner, a tool runner and the child environment.
 */
function fixture({ pipeline = false } = {}) {
    const parent = resolve(import.meta.dirname, '../../.amp/in/orb-backup/test-output/verification-fixtures');
    mkdirSync(parent, { recursive: true });
    const cwd = mkdtempSync(join(parent, 'run-'));

    /**
     * Run Git in the fixture repository.
     *
     * @param {...string} args - The Git arguments.
     * @returns {string} Git's trimmed output.
     */
    const git = (...args) =>
        execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    git('init', '--quiet');
    git('config', 'user.name', 'Synthetic Fixture');
    git('config', 'user.email', 'fixture@example.invalid');
    mkdirSync(join(cwd, 'tools/verification'), { recursive: true });
    mkdirSync(join(cwd, 'tools/dev'), { recursive: true });
    copyFileSync(resolve(import.meta.dirname, '../dev/pre-commit.mjs'), join(cwd, 'tools/dev/pre-commit.mjs'));
    mkdirSync(join(cwd, 'tools/resources'), { recursive: true });
    copyFileSync(
        resolve(import.meta.dirname, '../resources/boundaries.mjs'),
        join(cwd, 'tools/resources/boundaries.mjs')
    );
    mkdirSync(join(cwd, 'docs/verification'), { recursive: true });
    mkdirSync(join(cwd, 'apps/billing'), { recursive: true });
    for (const name of ['run.mjs', 'pre-commit.mjs', 'pipeline.mjs', 'affected.mjs'])
        copyFileSync(join(import.meta.dirname, name), join(cwd, 'tools/verification', name));
    writeFileSync(join(cwd, '.gitignore'), 'test-output/\n');
    writeFileSync(join(cwd, 'apps/billing/input'), 'before\n');
    writeFileSync(
        join(cwd, 'package.json'),
        JSON.stringify({
            name: 'synthetic-proof',
            scripts: {
                'verify:static': 'node -e "console.log(\'STATIC_OK\')"',
                'test:affected': 'node tools/verification/affected.mjs',
                'verify:staged': 'node tools/verification/pre-commit.mjs',
                check: 'node -e "console.log(\'CHECK_OK\')"',
                'verify:features': 'node -e "console.log(\'FEATURES_OK\')"',
                verify: 'node tools/verification/pipeline.mjs',
            },
        })
    );
    if (pipeline) {
        for (const [path, marker] of [
            ['tools/resources/boundaries.test.mjs', 'BOUNDARIES'],
            ['tools/resources/types.test.mjs', 'TYPES'],
            ['tools/verification/run.test.mjs', 'RUNNER'],
        ])
            writeFileSync(join(cwd, path), `console.log('${marker}_OK');\n`);
        mkdirSync(join(cwd, 'node_modules/nx/dist/bin'), { recursive: true });
        writeFileSync(
            join(cwd, 'node_modules/nx/dist/bin/nx.js'),
            `const args = process.argv.slice(2).join(' ');
if (args === 'run-many -t test build parity') console.log('AGGREGATE_OK');
else if (args === 'run-many -t smoke') console.log('SMOKE_OK');
else if (args === 'affected -t test --stdin') {
    require('node:fs').writeFileSync('test-output/affected-paths.json', JSON.stringify(require('node:fs').readFileSync(0, 'utf8').trimEnd().split('\\n')));
    console.log('AFFECTED_OK');
}
else process.exit(9);
`
        );
        mkdirSync(join(cwd, 'test-output'), { recursive: true });
    }
    git('add', '.');
    git(
        '-c',
        'core.hooksPath=/dev/null',
        '-c',
        'commit.gpgsign=false',
        'commit',
        '--quiet',
        '-m',
        'synthetic baseline'
    );
    const env = { PATH: process.env.PATH, HOME: cwd };

    /**
     * Run one copied verification tool in the fixture.
     *
     * @param {string} file - The tool's base name, such as `run` or `pre-commit`.
     * @param {...string} args - Its arguments.
     * @returns {object} The child process result.
     */
    const run = (file, ...args) =>
        spawnSync(process.execPath, [`tools/verification/${file}.mjs`, ...args], {
            cwd,
            encoding: 'utf8',
            env,
        });
    return { cwd, git, run, env };
}

test('CLI serializes real Nx prerequisite processes sharing an exclusive synthetic resource', /** Feature commands run one at a time against a shared exclusive resource. */ () => {
    const { cwd, git, run } = fixture();
    symlinkSync(resolve(import.meta.dirname, '../../node_modules'), join(cwd, 'node_modules'), 'dir');
    writeFileSync(join(cwd, 'apps/billing/input'), 'after\n');
    writeFileSync(join(cwd, '.gitignore'), 'test-output/\nnode_modules/\n.nx/\n');
    writeFileSync(join(cwd, 'nx.json'), '{}');
    writeFileSync(join(cwd, 'pnpm-workspace.yaml'), 'packages:\n  - .\n');
    writeFileSync(
        join(cwd, 'exclusive.mjs'),
        `import { openSync, closeSync, unlinkSync, appendFileSync } from 'node:fs';
const directory = process.env.EVE_EVIDENCE_DIR;
const id = process.argv[2];
const lock = directory + '/exclusive.lock';
const fd = openSync(lock, 'wx');
appendFileSync(directory + '/events.log', id + ':start\\n');
setTimeout(() => {
    appendFileSync(directory + '/events.log', id + ':end\\n');
    closeSync(fd);
    unlinkSync(lock);
}, 2000);
`
    );
    writeFileSync(
        join(cwd, 'project.json'),
        JSON.stringify({
            name: 'synthetic-proof',
            targets: {
                first: { executor: 'nx:run-commands', options: { command: 'node exclusive.mjs first' } },
                second: { executor: 'nx:run-commands', options: { command: 'node exclusive.mjs second' } },
                test: {
                    executor: 'nx:run-commands',
                    dependsOn: ['first', 'second'],
                    options: { command: 'node --test --test-reporter=tap proof.test.mjs' },
                },
            },
        })
    );
    writeFileSync(
        join(cwd, 'proof.test.mjs'),
        `import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('exclusive resource was released before the next prerequisite', () => {
    const events = readFileSync(process.env.EVE_EVIDENCE_DIR + '/events.log', 'utf8').trim().split('\\n');
    const [first, second] = [events[0].split(':')[0], events[2].split(':')[0]];
    assert.notEqual(first, second);
    assert.deepEqual(events, [first + ':start', first + ':end', second + ':start', second + ':end']);
});
`
    );
    writeFileSync(
        join(cwd, 'docs/verification/registry.md'),
        billing.replace(
            '["pnpm","nx","test","billing","--skip-nx-cache"]',
            JSON.stringify([
                'node',
                resolve(import.meta.dirname, '../../node_modules/nx/dist/bin/nx.js'),
                'test',
                'synthetic-proof',
                '--skip-nx-cache',
            ])
        )
    );
    git('add', '.');
    const result = run('run');
    const directory = join(cwd, 'test-output/verification', readdirSync(join(cwd, 'test-output/verification'))[0]);
    const log = readFileSync(join(directory, 'billing/command.log'), 'utf8');
    assert.equal(result.status, 0, `${result.stderr}\n${log}`);
    const manifest = JSON.parse(readFileSync(join(directory, 'manifest.json'), 'utf8'));
    assert.equal(manifest.results[0].testCount, 1);
    assert.equal(
        manifest.results[0].assertions[0].name,
        'exclusive resource was released before the next prerequisite'
    );
    assert.deepEqual(manifest.execution, { featureConcurrency: 1, nxParallel: 1 });
});

test('CLI retains real assertion evidence and fails empty or malformed proof even after exit zero', /** Evidence keeps real assertions and fails empty or malformed reports. */ () => {
    const { cwd, run } = fixture();
    writeFileSync(join(cwd, 'apps/billing/input'), 'after\n');
    for (const [script, expected] of [
        ['console.log("ok 1 - receipt replay\\n# tests 1\\n# pass 1")', 'passed'],
        ['console.log("zero selected tests")', 'failed'],
        ['require("node:fs").writeFileSync(process.env.EVE_EVIDENCE_DIR + "/test-results.json", "{bad")', 'failed'],
        [
            'require("node:fs").writeFileSync("apps/billing/input", "changed during proof"); console.log("ok 1 - receipt replay\\n# tests 1\\n# pass 1")',
            'failed',
        ],
    ]) {
        writeFileSync(
            join(cwd, 'docs/verification/registry.md'),
            billing.replace('["pnpm","nx","test","billing","--skip-nx-cache"]', JSON.stringify(['node', '-e', script]))
        );
        const result = run('run');
        assert.equal(result.status, expected === 'passed' ? 0 : 1, result.stderr);
        const manifests = readdirSync(join(cwd, 'test-output/verification')).map(
            /**
             * Read one run's manifest.
             *
             * @param {string} id - One evidence directory name.
             * @returns {object} Its parsed manifest.
             */
            (id) => JSON.parse(readFileSync(join(cwd, 'test-output/verification', id, 'manifest.json'), 'utf8'))
        );
        const manifest = manifests
            .sort(
                /**
                 * Order manifests by start time.
                 *
                 * @param {{ startedAt: string }} a - One manifest.
                 * @param {{ startedAt: string }} b - Another manifest.
                 * @returns {number} Their start-time comparison.
                 */
                (a, b) => a.startedAt.localeCompare(b.startedAt)
            )
            .at(-1);
        assert.equal(manifest.status, expected);
        assert.deepEqual(manifest.affectedFeatures, ['billing']);
        assert.match(manifest.committedTree, /^[a-f0-9]{40}$/);
        assert.ok(
            manifest.results[0].files.some(
                /**
                 * Find the feature's command log among its evidence files.
                 *
                 * @param {{ path: string }} file - One evidence file.
                 * @returns {boolean} Whether it is the billing command log.
                 */
                (file) => file.path === 'billing/command.log'
            )
        );
        if (expected === 'passed') assert.equal(manifest.results[0].assertions[0].name, 'receipt replay');
    }
});

test('hook installs idempotently without replacing foreign hooks or commit-msg', /** Installing twice is safe and never overwrites another hook. */ () => {
    const { cwd, run } = fixture();
    const hook = join(cwd, '.git/hooks/pre-commit');
    const commitMsg = join(cwd, '.git/hooks/commit-msg');
    writeFileSync(commitMsg, 'existing commit validation\n');
    writeFileSync(hook, '#!/bin/sh\nexit 9\n');
    assert.notEqual(run('pre-commit', '--install').status, 0);
    assert.equal(readFileSync(hook, 'utf8'), '#!/bin/sh\nexit 9\n');
    const fresh = fixture();
    assert.equal(fresh.run('pre-commit', '--install').status, 0);
    assert.equal(fresh.run('pre-commit', '--install').status, 0);
    assert.equal(readFileSync(commitMsg, 'utf8'), 'existing commit validation\n');
    const custom = '#!/bin/sh\n# eventiva:verified-staged-snapshot\necho custom-check\nexit 17\n';
    writeFileSync(hook, custom);
    assert.notEqual(run('pre-commit', '--install').status, 0);
    assert.equal(readFileSync(hook, 'utf8'), custom);
    for (const legacy of [
        '#!/bin/sh\n# house:pre-commit\nexec node "$(git rev-parse --show-toplevel)/tools/dev/pre-commit.mjs" run\n',
        '#!/bin/sh\n# eventiva:verified-staged-snapshot\nset -eu\nnode tools/verification/pre-commit.mjs\n',
    ]) {
        const migrated = fixture();
        const path = join(migrated.cwd, '.git/hooks/pre-commit');
        writeFileSync(path, legacy);
        assert.equal(migrated.run('pre-commit', '--install').status, 0);
        assert.equal(readFileSync(`${path}.before-eventiva-composition`, 'utf8'), legacy);
        assert.equal(readFileSync(path, 'utf8'), '#!/bin/sh\n# eventiva:verified-staged-snapshot\nexec node --run verify:staged\n');
        assert.equal(migrated.run('pre-commit', '--install').status, 0);
        writeFileSync(`${path}.before-eventiva-composition`, 'preserved owner backup\n');
        writeFileSync(path, legacy);
        assert.equal(migrated.run('pre-commit', '--install').status, 0);
        assert.equal(readFileSync(`${path}.before-eventiva-composition`, 'utf8'), 'preserved owner backup\n');
    }
});

test('installed hook runs only static and affected tests while standalone retains full acceptance', /** The hook runs the commit subset; the standalone run keeps every stage. */ () => {
    const { cwd, git, run, env } = fixture({ pipeline: true });
    assert.equal(run('pre-commit', '--install').status, 0);
    writeFileSync(join(cwd, 'apps/billing/input'), 'staged\n');
    git('add', '.');
    const tree = git('write-tree');
    const commit = spawnSync('git', ['-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'ordered proof'], {
        cwd,
        encoding: 'utf8',
        env,
    });
    const standalone = spawnSync(process.execPath, ['--run', 'verify'], { cwd, encoding: 'utf8', env });
    assert.equal(commit.status, 0, commit.stderr);
    assert.deepEqual((commit.stdout + commit.stderr).match(/\b[A-Z]+_OK\b/g), ['STATIC_OK', 'AFFECTED_OK']);
    assert.equal(standalone.status, 0, standalone.stderr);
    const stages = (standalone.stdout + standalone.stderr).match(/\b[A-Z]+_OK\b/g);
    assert.deepEqual(stages.slice(0, 2), ['STATIC_OK', 'CHECK_OK']);
    assert.deepEqual(stages.slice(2, 5).sort(), ['BOUNDARIES_OK', 'RUNNER_OK', 'TYPES_OK']);
    assert.deepEqual(stages.slice(5), ['AGGREGATE_OK', 'SMOKE_OK', 'FEATURES_OK']);
    assert.equal(git('rev-parse', 'HEAD^{tree}'), tree);
    assert.equal(git('write-tree'), tree);
    assert.deepEqual(JSON.parse(readFileSync(join(cwd, 'test-output/affected-paths.json'))), ['apps/billing/input']);

    git('mv', 'apps/billing/input', 'apps/billing/renamed, input');
    writeFileSync(join(cwd, 'apps/billing/unstaged'), 'not selected\n');
    const renamed = run('affected');
    assert.equal(renamed.status, 0, renamed.stderr);
    assert.deepEqual(JSON.parse(readFileSync(join(cwd, 'test-output/affected-paths.json'))), [
        'apps/billing/input',
        'apps/billing/renamed, input',
    ]);
    git('add', '.');
    git('-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'renamed fixture');
    git('rm', 'apps/billing/renamed, input');
    assert.equal(run('affected').status, 0);
    assert.deepEqual(JSON.parse(readFileSync(join(cwd, 'test-output/affected-paths.json'))), [
        'apps/billing/renamed, input',
    ]);

    writeFileSync(join(cwd, 'tools/verification/run.test.mjs'), "console.log('RUNNER_OK');\n// changed tooling\n");
    git('add', '.');
    const tooling = run('pre-commit');
    assert.equal(tooling.status, 0, tooling.stderr);
    const toolingStages = (tooling.stdout + tooling.stderr).match(/\b[A-Z]+_OK\b/g);
    assert.deepEqual(toolingStages.slice(0, 2), ['STATIC_OK', 'AFFECTED_OK']);
    assert.deepEqual(toolingStages.slice(2).sort(), ['BOUNDARIES_OK', 'RUNNER_OK', 'TYPES_OK']);
    writeFileSync(join(cwd, 'node_modules/nx/dist/bin/nx.js'), "console.log('AFFECTED_FAILED'); process.exit(7);\n");
    git('add', '.');
    const failed = run('pre-commit');
    assert.notEqual(failed.status, 0);
    assert.match(failed.stdout, /STATIC_OK[\s\S]*AFFECTED_FAILED/);
    assert.doesNotMatch(failed.stdout, /RUNNER_OK|CHECK_OK|SMOKE_OK|FEATURES_OK/);

    const manifestPath = join(cwd, 'package.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    delete manifest.scripts['test:affected'];
    writeFileSync(manifestPath, JSON.stringify(manifest));
    git('add', '.');
    const missing = run('pre-commit');
    assert.notEqual(missing.status, 0, 'A missing adapter must fail, never fall back to full verification.');
    assert.doesNotMatch(missing.stdout, /CHECK_OK|AGGREGATE_OK|SMOKE_OK|FEATURES_OK/);
});

test('static failure stops installed hook and standalone verification before documentation', /** A static failure stops both runs before later stages. */ () => {
    const { cwd, git, run, env } = fixture({ pipeline: true });
    const path = join(cwd, 'package.json');
    const manifest = JSON.parse(readFileSync(path, 'utf8'));
    manifest.scripts['verify:static'] = 'node -e "console.log(\'STATIC_FAILED\'); process.exit(7)"';
    writeFileSync(path, JSON.stringify(manifest));
    git('add', '.');
    const head = git('rev-parse', 'HEAD');
    assert.equal(run('pre-commit', '--install').status, 0);
    const commit = spawnSync('git', ['-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'reject static'], {
        cwd,
        encoding: 'utf8',
        env,
    });
    const standalone = spawnSync(process.execPath, ['--run', 'verify'], { cwd, encoding: 'utf8', env });
    for (const result of [commit, standalone]) {
        assert.notEqual(result.status, 0);
        assert.match(result.stdout + result.stderr, /STATIC_FAILED/);
        assert.doesNotMatch(
            result.stdout + result.stderr,
            /AFFECTED_OK|CHECK_OK|BOUNDARIES_OK|AGGREGATE_OK|SMOKE_OK|FEATURES_OK/
        );
    }
    assert.equal(git('rev-parse', 'HEAD'), head);
});

test('hook checks static before verification and rejects unstaged files and index mutation', /** The hook refuses unstaged work and a staged tree that changes mid-run. */ () => {
    const { cwd, git, run } = fixture({ pipeline: true });
    writeFileSync(join(cwd, 'apps/billing/input'), 'staged\n');
    git('add', '.');
    const pass = run('pre-commit');
    assert.equal(pass.status, 0, pass.stderr);
    assert.match(pass.stdout, /STATIC_OK[\s\S]*AFFECTED_OK/);
    assert.doesNotMatch(pass.stdout, /CHECK_OK|AGGREGATE_OK|SMOKE_OK|FEATURES_OK/);
    writeFileSync(join(cwd, 'untracked'), 'not staged\n');
    assert.match(run('pre-commit').stderr, /staged tree/);
    git('add', '.');
    writeFileSync(join(cwd, 'apps/billing/input'), 'unstaged\n');
    assert.match(run('pre-commit').stderr, /staged tree/);
    git('add', '.');
    writeFileSync(
        join(cwd, 'package.json'),
        JSON.stringify({
            scripts: {
                'verify:static':
                    "node -e \"require('node:fs').writeFileSync('apps/billing/input', 'mutated'); require('node:child_process').execFileSync('git', ['add', 'apps/billing/input'])\"",
                verify: 'node -e "console.log(\'VERIFY_OK\')"',
            },
        })
    );
    git('add', '.');
    const mutation = run('pre-commit');
    assert.notEqual(mutation.status, 0);
    assert.match(mutation.stderr, /staged tree changed/);
});

test('installed worktree hook isolates nested Git histories while preserving the outer commit and index guard', /** Nested repositories created by tests cannot touch the outer worktree's index. */ () => {
    const primary = fixture({ pipeline: true });
    const cwd = `${primary.cwd}-worktree`;
    primary.git('worktree', 'add', '--quiet', '-b', 'nested-history-proof', cwd);

    /**
     * Run Git in the nested worktree.
     *
     * @param {...string} args - The Git arguments.
     * @returns {string} Git's trimmed output.
     */
    const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
    writeFileSync(
        join(cwd, 'nested.mjs'),
        `import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const stage = process.argv[2];
const cwd = resolve('test-output', stage);
mkdirSync(cwd, { recursive: true });
const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
git('init', '--quiet');
git('config', 'user.name', 'Nested Fixture');
git('config', 'user.email', 'nested@example.invalid');
git('config', 'commit.gpgsign', 'false');
writeFileSync(cwd + '/receipt', stage);
git('add', '.');
git('commit', '--quiet', '-m', stage + ' fixture');
assert.equal(git('rev-parse', '--show-toplevel'), cwd);
assert.equal(git('show', 'HEAD:receipt'), stage);
console.log(stage + '_HISTORY_OK');
`
    );
    const manifestPath = join(cwd, 'package.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.scripts['verify:static'] = 'node nested.mjs static';
    const affectedPath = join(cwd, 'node_modules/nx/dist/bin/nx.js');
    writeFileSync(
        affectedPath,
        "require('node:child_process').execFileSync(process.execPath, ['nested.mjs', 'affected'], { stdio: 'inherit' });\n"
    );
    writeFileSync(manifestPath, JSON.stringify(manifest));
    writeFileSync(join(cwd, 'apps/billing/input'), 'outer staged receipt\n');
    git('add', '.');
    const tree = git('write-tree');
    const primaryHead = primary.git('rev-parse', 'HEAD');
    execFileSync(process.execPath, ['tools/verification/pre-commit.mjs', '--install'], { cwd });
    const commit = spawnSync('git', ['-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'outer receipt'], {
        cwd,
        encoding: 'utf8',
        env: primary.env,
    });
    assert.equal(commit.status, 0, commit.stderr);
    assert.match(commit.stderr + commit.stdout, /static_HISTORY_OK[\s\S]*affected_HISTORY_OK/);
    assert.equal(git('rev-parse', 'HEAD^{tree}'), tree);
    assert.equal(git('write-tree'), tree);
    assert.equal(git('show', 'HEAD:apps/billing/input'), 'outer staged receipt');
    assert.equal(primary.git('rev-parse', 'HEAD'), primaryHead);

    for (const stage of ['verify:static', 'affected']) {
        manifest.scripts['verify:static'] = 'node -e "console.log(\'STATIC_OK\')"';
        writeFileSync(affectedPath, "console.log('AFFECTED_OK');\n");
        const mutate = `require('node:fs').writeFileSync('apps/billing/input', '${stage} mutation'); require('node:child_process').execFileSync('git', ['add', 'apps/billing/input']);`;
        if (stage === 'affected') writeFileSync(affectedPath, mutate);
        else manifest.scripts[stage] = `node -e "${mutate}"`;
        writeFileSync(manifestPath, JSON.stringify(manifest));
        git('add', '.');
        const head = git('rev-parse', 'HEAD');
        const mutation = spawnSync(
            'git',
            ['-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'reject mutation'],
            {
                cwd,
                encoding: 'utf8',
                env: primary.env,
            }
        );
        assert.notEqual(mutation.status, 0);
        assert.match(mutation.stderr, /staged tree changed/);
        assert.equal(git('rev-parse', 'HEAD'), head);
        if (stage === 'verify:static')
            assert.doesNotMatch(
                mutation.stdout + mutation.stderr,
                /CHECK_OK|BOUNDARIES_OK|AGGREGATE_OK|SMOKE_OK|FEATURES_OK/
            );
        else assert.match(mutation.stdout + mutation.stderr, /STATIC_OK/);
    }
});
