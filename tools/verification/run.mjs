/**
 * @file tools/verification/run.mjs
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

import { createHash, randomUUID } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { checkWorkspaceGraph } from '../resources/boundaries.mjs';

const root = resolve(import.meta.dirname, '../..');

/**
 * Hash a value with SHA-256.
 *
 * @param {string | Buffer} value - The text or bytes to hash.
 * @returns {string} The hexadecimal digest.
 */
const digest = (value) => createHash('sha256').update(value).digest('hex');

/**
 * Run Git in the repository with a large output buffer.
 *
 * @param {...string} args - The Git arguments.
 * @returns {string} Git's standard output.
 */
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

/**
 * Bind local proof to both committed content and all staged, unstaged and untracked source changes.
 *
 * @returns {string} A digest of the committed tree, the working diff against HEAD and every untracked file's bytes.
 */
const treeDigest = () =>
    digest(
        git('rev-parse', 'HEAD^{tree}') +
            git('diff', '--binary', 'HEAD', '--') +
            git('ls-files', '--others', '--exclude-standard', '-z')
                .split('\0')
                .filter(Boolean)
                .map(
                    /**
                     * Pair an untracked file with its content digest.
                     *
                     * @param {string} path - One untracked file.
                     * @returns {string} The path and digest, NUL-separated.
                     */
                    (path) => `${path}\0${digest(readFileSync(join(root, path)))}`
                )
                .join('\0')
    );

/**
 * Read the canonical Markdown table without executing code or silently accepting malformed rows.
 *
 * @since 0.0.1
 * @param {string} markdown - The registry document's text.
 * @returns {Array<object>} Each feature's ID, source paths, interface, reach, proof, command argv and limitations.
 * @example
 * const features = parseRegistry(readFileSync('docs/verification/registry.md', 'utf8'));
 */
export function parseRegistry(markdown) {
    const rows = markdown.split('\n').filter(
        /**
         * Keep table body rows, not the header or divider.
         *
         * @param {string} line - One document line.
         * @returns {boolean} Whether it is a feature row.
         */
        (line) => line.startsWith('| ') && !line.startsWith('| Feature ') && !line.startsWith('| ---')
    );
    const ids = new Set();
    return rows.map(
        /**
         * Parse and validate one feature row.
         *
         * @param {string} line - One feature row.
         * @returns {object} The feature's parsed fields.
         */
        (line) => {
            const [id, paths, surface, reach, proof, command, limitations, extra] = line
                .split('|')
                .slice(1, -1)
                .map(
                    /**
                     * Trim one table cell.
                     *
                     * @param {string} cell - The raw cell text.
                     * @returns {string} The cell without surrounding spaces.
                     */
                    (cell) => cell.trim()
                );
            if (
                extra !== undefined ||
                ![id, paths, surface, reach, proof, command, limitations].every(Boolean) ||
                !/^[a-z][a-z0-9-]*$/.test(id) ||
                ids.has(id)
            ) {
                throw new Error(
                    `Invalid or duplicate feature row: ${id ?? line}. Supply seven cells and a unique stable ID.`
                );
            }
            ids.add(id);
            const sources = paths.split(';').map(
                /**
                 * Trim one declared source path.
                 *
                 * @param {string} path - One semicolon-separated path.
                 * @returns {string} The path without surrounding spaces.
                 */
                (path) => path.trim()
            );
            if (
                sources.some(
                    /**
                     * Detect an absolute, traversing or empty source path.
                     *
                     * @param {string} path - One declared source path.
                     * @returns {boolean} Whether it is unsafe.
                     */
                    (path) => path.startsWith('/') || path.includes('..') || !path
                )
            )
                throw new Error(`${id}: use repository-relative paths, never traversal.`);
            const argv = JSON.parse(command.replace(/^`|`$/g, ''));
            if (
                !Array.isArray(argv) ||
                argv.length < 2 ||
                !argv.every(
                    /**
                     * Require each argument to be a non-empty string.
                     *
                     * @param {unknown} part - One command argument.
                     * @returns {boolean} Whether it is a non-empty string.
                     */
                    (part) => typeof part === 'string' && part.length > 0
                ) ||
                !['node', 'pnpm'].includes(argv[0])
            ) {
                throw new Error(
                    `${id}: provide an explicit node/pnpm argument array; shell commands are not accepted.`
                );
            }
            if (
                argv[0] === 'pnpm' &&
                argv[1] === 'nx' &&
                argv.some(
                    /**
                     * Detect an Nx parallelism override other than serial.
                     *
                     * @param {string} part - One command argument.
                     * @returns {boolean} Whether it raises Nx parallelism.
                     */
                    (part) => part.startsWith('--parallel') && part !== '--parallel=1'
                )
            ) {
                throw new Error(`${id}: evidence runs Nx serially. Remove the parallel override or use --parallel=1.`);
            }
            return { id, sources, surface, reach, proof, argv, limitations };
        }
    );
}

/**
 * Select only declared feature dependencies; unmapped application changes require a registry entry, not a false empty pass.
 *
 * @since 0.0.1
 * @param {Array<object>} features - The parsed registry.
 * @param {Array<string>} paths - The changed repository paths.
 * @param {Array<[string, string]>} [edges] - Consumer and dependency file pairs, followed transitively.
 * @returns {Array<object>} The features whose declared sources include a changed path or a consumer of one.
 * @example
 * const selected = selectFeatures(features, ['packages/runtime/src/host.ts'], graph.edges);
 */
export function selectFeatures(features, paths, edges = []) {
    /**
     * Check whether a path belongs to a feature's declared sources.
     *
     * @param {{ sources: Array<string> }} feature - One registry feature.
     * @param {string} path - One repository path.
     * @returns {boolean} Whether a source equals the path, or is a directory containing it.
     */
    const matches = (feature, path) =>
        feature.sources.some(
            /**
             * Match one declared source against the path.
             *
             * @param {string} source - A file path, or a directory ending in `/`.
             * @returns {boolean} Whether it covers the path.
             */
            (source) => (source.endsWith('/') ? path.startsWith(source) : path === source)
        );
    const missing = paths.filter(
        /**
         * Find application paths no feature declares.
         *
         * @param {string} path - One changed path.
         * @returns {boolean} Whether it is unmapped application source.
         */
        (path) =>
            /^(apps|packages)\//.test(path) &&
            !features.some(
                /**
                 * Check whether a feature declares the path.
                 *
                 * @param {object} feature - One registry feature.
                 * @returns {boolean} Whether it covers the path.
                 */
                (feature) => matches(feature, path)
            )
    );
    if (missing.length)
        throw new Error(
            `Map affected application paths in docs/verification/registry.md before claiming proof: ${missing.join(', ')}`
        );
    const affected = new Set(paths);
    let size;
    do {
        size = affected.size;
        for (const [consumer, dependency] of edges) if (affected.has(dependency)) affected.add(consumer);
    } while (size !== affected.size);
    return features.filter(
        /**
         * Keep features touched by an affected path.
         *
         * @param {object} feature - One registry feature.
         * @returns {boolean} Whether any affected path belongs to it.
         */
        (feature) =>
            [...affected].some(
                /**
                 * Check one affected path against the feature.
                 *
                 * @param {string} path - One affected path.
                 * @returns {boolean} Whether it belongs to the feature.
                 */
                (path) => matches(feature, path)
            )
    );
}

/**
 * Preserve useful diagnostics while removing supplied fixture passwords and common credential-bearing URLs.
 *
 * @since 0.0.1
 * @param {string} text - The log text.
 * @param {Array<string>} [secrets] - Exact secret values to replace.
 * @returns {string} The text with PostgreSQL credentials and the given secrets replaced by `[REDACTED]`.
 * @example
 * redact(log, [password]);
 */
export function redact(text, secrets = []) {
    let result = text.replace(/(postgres(?:ql)?:\/\/)[^\s@]+@/g, '$1[REDACTED]@');
    for (const secret of secrets.filter(Boolean)) result = result.split(secret).join('[REDACTED]');
    return result;
}

/**
 * Normalize actual test-runner reports; a successful command with zero selected tests is not feature proof.
 *
 * @since 0.0.1
 * @param {object | undefined} report - A Vitest or Playwright JSON report, if the command wrote one.
 * @param {string} output - The command's log, parsed as node:test TAP when there is no report.
 * @returns {{ count: number, passed: number, assertions: Array<{ name: string, status: string }> }} The test count, passed count and each test's result.
 * @example
 * const proof = summarizeProof(JSON.parse(reportText), log);
 */
export function summarizeProof(report, output) {
    if (report?.testResults) {
        const assertions = report.testResults.flatMap(
            /**
             * Flatten one Vitest suite's assertions.
             *
             * @param {object} suite - One test file's results.
             * @returns {Array<{ name: string, status: string }>} Its assertions.
             */
            (suite) =>
                suite.assertionResults.map(
                    /**
                     * Keep an assertion's name and status.
                     *
                     * @param {object} entry - One Vitest assertion result.
                     * @returns {{ name: string, status: string }} Its full name and status.
                     */
                    (entry) => ({ name: entry.fullName, status: entry.status })
                )
        );
        return {
            count: assertions.length,
            passed: assertions.filter(
                /**
                 * Keep passing assertions.
                 *
                 * @param {{ status: string }} entry - One assertion.
                 * @returns {boolean} Whether it passed.
                 */
                (entry) => entry.status === 'passed'
            ).length,
            assertions,
        };
    }
    if (report?.suites) {
        /**
         * Flatten one Playwright suite and its nested suites.
         *
         * @param {object} suite - One Playwright suite.
         * @returns {Array<{ name: string, status: string }>} Every test result below it.
         */
        const visit = (suite) => [
            ...(suite.specs ?? []).flatMap(
                /**
                 * Flatten one Playwright spec's tests.
                 *
                 * @param {object} spec - One Playwright spec.
                 * @returns {Array<{ name: string, status: string }>} Its test results.
                 */
                (spec) =>
                    spec.tests.map(
                        /**
                         * Reduce one Playwright test to its outcome.
                         *
                         * @param {object} entry - One Playwright test.
                         * @returns {{ name: string, status: string }} The spec title and whether its last attempt met the expected status.
                         */
                        (entry) => ({
                            name: spec.title,
                            status:
                                entry.results.at(-1)?.status === entry.expectedStatus && entry.status === 'expected'
                                    ? 'passed'
                                    : 'failed',
                        })
                    )
            ),
            ...(suite.suites ?? []).flatMap(visit),
        ];
        const assertions = report.suites.flatMap(visit);
        return {
            count: assertions.length,
            passed: assertions.filter(
                /**
                 * Keep passing tests.
                 *
                 * @param {{ status: string }} entry - One test.
                 * @returns {boolean} Whether it passed.
                 */
                (entry) => entry.status === 'passed'
            ).length,
            assertions,
        };
    }
    const count = Number(output.match(/^# tests (\d+)$/m)?.[1] ?? 0);
    const passed = Number(output.match(/^# pass (\d+)$/m)?.[1] ?? 0);
    const assertions = [...output.matchAll(/^(ok|not ok) \d+ - (.+)$/gm)].map(
        /**
         * Turn one TAP result line into a test result.
         *
         * @param {RegExpMatchArray} match - The `ok` or `not ok` line's match.
         * @returns {{ name: string, status: string }} The test name and status.
         */
        (match) => ({
            name: match[2],
            status: match[1] === 'ok' ? 'passed' : 'failed',
        })
    );
    return { count, passed, assertions, format: 'node-tap-summary' };
}

/**
 * Execute uncached public-path checks and retain one manifest/log per affected feature, including failures.
 *
 * @since 0.0.1
 * @example
 * node tools/verification/run.mjs --base origin/main
 */
export function main() {
    const { values } = parseArgs({
        options: { base: { type: 'string', default: 'HEAD' }, staged: { type: 'boolean' }, check: { type: 'boolean' } },
    });
    const markdown = readFileSync(join(root, 'docs/verification/registry.md'), 'utf8');
    const features = parseRegistry(markdown);
    if (!features.length)
        throw new Error('The feature registry is empty. Register reachable interfaces and executable proof.');
    const inventory = [
        ...new Set(
            git('ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', 'apps', 'packages')
                .split('\0')
                .filter(
                    /**
                     * Keep TypeScript sources.
                     *
                     * @param {string} path - One application or package path.
                     * @returns {boolean} Whether it is a TypeScript file.
                     */
                    (path) => /\.(?:[cm]?ts|tsx)$/.test(path)
                )
        ),
    ];
    selectFeatures(features, inventory);
    if (values.check) {
        console.log(
            `Verification registry: ${features.length} feature/interface entries; ${inventory.length} source files mapped`
        );
        return;
    }
    const base = git('rev-parse', '--verify', `${values.base}^{commit}`).trim();
    const paths = [
        ...new Set(
            (values.staged
                ? git('diff', '--cached', '--name-only', '--no-renames', '-z')
                : git('diff', '--name-only', '--no-renames', '-z', base, '--') +
                  git('ls-files', '--others', '--exclude-standard', '-z')
            )
                .split('\0')
                .filter(Boolean)
        ),
    ].sort();
    const graph = checkWorkspaceGraph(root);
    if (graph.findings.length)
        throw new Error('Resolve the source graph findings with verify:static before collecting feature evidence.');
    const selected = selectFeatures(features, paths, graph.edges);
    const directory = join(root, 'test-output', 'verification', randomUUID());
    mkdirSync(directory, { recursive: true });
    const manifest = {
        head: git('rev-parse', 'HEAD').trim(),
        committedTree: git('rev-parse', 'HEAD^{tree}').trim(),
        base,
        treeDigest: treeDigest(),
        registryDigest: digest(markdown),
        inventoryDigest: digest(JSON.stringify({ inventory, edges: graph.edges })),
        paths,
        affectedFeatures: selected.map(
            /**
             * Record a selected feature's ID.
             *
             * @param {{ id: string }} feature - One selected feature.
             * @returns {string} Its ID.
             */
            (feature) => feature.id
        ),
        execution: { featureConcurrency: 1, nxParallel: 1 },
        startedAt: new Date().toISOString(),
        results: [],
        status: selected.length ? 'running' : 'not-applicable',
    };

    /**
     * Write the current manifest to the evidence directory.
     *
     * @returns {undefined} Nothing.
     */
    const save = () => writeFileSync(join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    save();
    const environment = Object.fromEntries(
        ['PATH', 'HOME', 'TMPDIR', 'CI', 'PLAYWRIGHT_BROWSERS_PATH', 'SYSTEMROOT']
            .filter(
                /**
                 * Keep environment variables that are set.
                 *
                 * @param {string} key - One allowed variable name.
                 * @returns {boolean} Whether it has a value.
                 */
                (key) => process.env[key]
            )
            .map(
                /**
                 * Pair an allowed variable with its value.
                 *
                 * @param {string} key - One set variable name.
                 * @returns {[string, string]} The name and value.
                 */
                (key) => [key, process.env[key]]
            )
    );
    const database = process.env.STORAGE_TEST_POSTGRES_URL;
    if (database) {
        const url = new URL(database);
        if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.username !== 'eventiva_fixture')
            throw new Error('Evidence requires a loopback eventiva_fixture database, never a shared database.');
        environment.STORAGE_TEST_POSTGRES_URL = database;
    }
    for (const feature of selected) {
        const evidence = join(directory, feature.id);
        mkdirSync(evidence);
        const start = new Date().toISOString();
        const result = spawnSync(feature.argv[0], feature.argv.slice(1), {
            cwd: root,
            env: {
                ...environment,
                NX_DAEMON: 'false',
                NX_NO_CLOUD: 'true',
                NX_PARALLEL: '1',
                EVE_EVIDENCE_DIR: evidence,
            },
            encoding: 'utf8',
            timeout: 20 * 60 * 1000,
            maxBuffer: 32 * 1024 * 1024,
        });
        const log = redact(
            `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? `\n${result.error.message}` : ''}`,
            database ? [database, decodeURIComponent(new URL(database).password)] : []
        );
        writeFileSync(join(evidence, 'command.log'), log);
        const reportPath = join(evidence, 'test-results.json');
        let proof;
        let reportError;
        try {
            proof = summarizeProof(
                existsSync(reportPath) ? JSON.parse(readFileSync(reportPath, 'utf8')) : undefined,
                log
            );
        } catch {
            reportError = 'Malformed test report. Repair the reporter; command success alone is not proof.';
            proof = { count: 0, passed: 0, assertions: [] };
        }
        const sourceChanged = treeDigest() !== manifest.treeDigest;
        const status =
            result.status === 0 && !result.error && !sourceChanged && proof.count > 0 && proof.count === proof.passed
                ? 'passed'
                : 'failed';
        manifest.results.push({
            feature: feature.id,
            interface: feature.surface,
            reach: feature.reach,
            proof: feature.proof,
            limitations: feature.limitations,
            argv: feature.argv,
            startedAt: start,
            finishedAt: new Date().toISOString(),
            status,
            testCount: proof.count,
            passedTests: proof.passed,
            assertions: proof.assertions,
            exitCode: result.status,
            signal: result.signal,
            evidence: feature.id,
            reportError,
            sourceChanged,
            files: readdirSync(evidence, { recursive: true, withFileTypes: true })
                .filter(
                    /**
                     * Keep evidence files, not directories.
                     *
                     * @param {object} entry - One directory entry.
                     * @returns {boolean} Whether it is a file.
                     */
                    (entry) => entry.isFile()
                )
                .map(
                    /**
                     * Record an evidence file's path and digest.
                     *
                     * @param {object} entry - One evidence file entry.
                     * @returns {{ path: string, digest: string }} Its path in the evidence directory and SHA-256 digest.
                     */
                    (entry) => {
                        const path = join(entry.parentPath, entry.name);
                        return { path: path.slice(directory.length + 1), digest: digest(readFileSync(path)) };
                    }
                ),
        });
        save();
        console.log(`${feature.id}: ${manifest.results.at(-1).status}`);
    }
    manifest.finishedAt = new Date().toISOString();
    manifest.status = manifest.results.some(
        /**
         * Detect a failed feature.
         *
         * @param {{ status: string }} result - One feature result.
         * @returns {boolean} Whether it failed.
         */
        (result) => result.status === 'failed'
    )
        ? 'failed'
        : selected.length
          ? 'passed'
          : 'not-applicable';
    save();
    console.log(`Evidence: ${directory}`);
    if (manifest.status === 'failed') process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
