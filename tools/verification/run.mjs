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
const digest = (value) => createHash('sha256').update(value).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

/** Bind local proof to both committed content and all staged, unstaged and untracked source changes. */
const treeDigest = () =>
    digest(
        git('rev-parse', 'HEAD^{tree}') +
            git('diff', '--binary', 'HEAD', '--') +
            git('ls-files', '--others', '--exclude-standard', '-z')
                .split('\0')
                .filter(Boolean)
                .map((path) => `${path}\0${digest(readFileSync(join(root, path)))}`)
                .join('\0')
    );

/** Read the canonical Markdown table without executing code or silently accepting malformed rows. */
export function parseRegistry(markdown) {
    const rows = markdown
        .split('\n')
        .filter((line) => line.startsWith('| ') && !line.startsWith('| Feature ') && !line.startsWith('| ---'));
    const ids = new Set();
    return rows.map((line) => {
        const [id, paths, surface, reach, proof, command, limitations, extra] = line
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim());
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
        const sources = paths.split(';').map((path) => path.trim());
        if (sources.some((path) => path.startsWith('/') || path.includes('..') || !path))
            throw new Error(`${id}: use repository-relative paths, never traversal.`);
        const argv = JSON.parse(command.replace(/^`|`$/g, ''));
        if (
            !Array.isArray(argv) ||
            argv.length < 2 ||
            !argv.every((part) => typeof part === 'string' && part.length > 0) ||
            !['node', 'pnpm'].includes(argv[0])
        ) {
            throw new Error(`${id}: provide an explicit node/pnpm argument array; shell commands are not accepted.`);
        }
        if (
            argv[0] === 'pnpm' &&
            argv[1] === 'nx' &&
            argv.some((part) => part.startsWith('--parallel') && part !== '--parallel=1')
        ) {
            throw new Error(`${id}: evidence runs Nx serially. Remove the parallel override or use --parallel=1.`);
        }
        return { id, sources, surface, reach, proof, argv, limitations };
    });
}

/** Select only declared feature dependencies; unmapped application changes require a registry entry, not a false empty pass. */
export function selectFeatures(features, paths, edges = []) {
    const matches = (feature, path) =>
        feature.sources.some((source) => (source.endsWith('/') ? path.startsWith(source) : path === source));
    const missing = paths.filter(
        (path) => /^(apps|packages)\//.test(path) && !features.some((feature) => matches(feature, path))
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
    return features.filter((feature) => [...affected].some((path) => matches(feature, path)));
}

/** Preserve useful diagnostics while removing supplied fixture passwords and common credential-bearing URLs. */
export function redact(text, secrets = []) {
    let result = text.replace(/(postgres(?:ql)?:\/\/)[^\s@]+@/g, '$1[REDACTED]@');
    for (const secret of secrets.filter(Boolean)) result = result.split(secret).join('[REDACTED]');
    return result;
}

/** Normalize actual test-runner reports; a successful command with zero selected tests is not feature proof. */
export function summarizeProof(report, output) {
    if (report?.testResults) {
        const assertions = report.testResults.flatMap((suite) =>
            suite.assertionResults.map((entry) => ({ name: entry.fullName, status: entry.status }))
        );
        return {
            count: assertions.length,
            passed: assertions.filter((entry) => entry.status === 'passed').length,
            assertions,
        };
    }
    if (report?.suites) {
        const visit = (suite) => [
            ...(suite.specs ?? []).flatMap((spec) =>
                spec.tests.map((entry) => ({
                    name: spec.title,
                    status:
                        entry.results.at(-1)?.status === entry.expectedStatus && entry.status === 'expected'
                            ? 'passed'
                            : 'failed',
                }))
            ),
            ...(suite.suites ?? []).flatMap(visit),
        ];
        const assertions = report.suites.flatMap(visit);
        return {
            count: assertions.length,
            passed: assertions.filter((entry) => entry.status === 'passed').length,
            assertions,
        };
    }
    const count = Number(output.match(/^# tests (\d+)$/m)?.[1] ?? 0);
    const passed = Number(output.match(/^# pass (\d+)$/m)?.[1] ?? 0);
    const assertions = [...output.matchAll(/^(ok|not ok) \d+ - (.+)$/gm)].map((match) => ({
        name: match[2],
        status: match[1] === 'ok' ? 'passed' : 'failed',
    }));
    return { count, passed, assertions, format: 'node-tap-summary' };
}

/** Execute uncached public-path checks and retain one manifest/log per affected feature, including failures. */
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
                .filter((path) => /\.(?:[cm]?ts|tsx)$/.test(path))
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
        affectedFeatures: selected.map((feature) => feature.id),
        execution: { featureConcurrency: 1, nxParallel: 1 },
        startedAt: new Date().toISOString(),
        results: [],
        status: selected.length ? 'running' : 'not-applicable',
    };
    const save = () => writeFileSync(join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    save();
    const environment = Object.fromEntries(
        ['PATH', 'HOME', 'TMPDIR', 'CI', 'PLAYWRIGHT_BROWSERS_PATH', 'SYSTEMROOT']
            .filter((key) => process.env[key])
            .map((key) => [key, process.env[key]])
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
                .filter((entry) => entry.isFile())
                .map((entry) => {
                    const path = join(entry.parentPath, entry.name);
                    return { path: path.slice(directory.length + 1), digest: digest(readFileSync(path)) };
                }),
        });
        save();
        console.log(`${feature.id}: ${manifest.results.at(-1).status}`);
    }
    manifest.finishedAt = new Date().toISOString();
    manifest.status = manifest.results.some((result) => result.status === 'failed')
        ? 'failed'
        : selected.length
          ? 'passed'
          : 'not-applicable';
    save();
    console.log(`Evidence: ${directory}`);
    if (manifest.status === 'failed') process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
