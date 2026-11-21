/**
 * @file tools/references/import.mjs
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

import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const [catalogPath, destination] = process.argv.slice(2);
if (!catalogPath || !destination)
    throw new Error('Usage: node tools/references/import.mjs <catalog.json> <empty-directory>');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const root = resolve(destination);
mkdirSync(root);
const cache = mkdtempSync(join(tmpdir(), 'eventiva-upstream-'));
const git = (cwd, args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
try {
    const sources = [];
    for (const entry of catalog) {
        if (
            !/^[a-z0-9-]+$/.test(entry.id) ||
            !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(entry.upstream) ||
            !/^[a-f0-9]{40}$/.test(entry.commit)
        )
            throw new Error(`Invalid pinned source: ${entry.id}`);
        const repo = join(cache, entry.id);
        mkdirSync(repo);
        git(repo, ['init', '--quiet']);
        git(repo, ['fetch', '--quiet', '--depth=1', entry.upstream, entry.commit]);
        const actual = git(repo, ['rev-parse', 'FETCH_HEAD']).trim();
        if (actual !== entry.commit) throw new Error(`Revision mismatch: ${entry.id}`);
        const top = git(repo, ['ls-tree', '--name-only', actual]).trim().split('\n');
        const noticeName = /^(?:licen[cs]e|notice|copying|copyright|patents|authors)(?:[.-]|$)/i;
        const notices = git(repo, ['ls-tree', '-r', '--name-only', actual, '--', ...entry.paths])
            .trim()
            .split('\n')
            .filter((path) => noticeName.test(path.split('/').at(-1)));
        notices.push(...top.filter((path) => noticeName.test(path)));
        if (notices.length === 0) throw new Error(`Missing upstream licence: ${entry.id}`);
        const paths = [
            ...new Set([
                ...entry.paths,
                ...notices,
                ...top.filter((path) => /^(?:README(?:\.[^/]+)?|package.json)$/.test(path)),
            ]),
        ];
        for (const path of paths) {
            if (
                path !== '.' &&
                (path.startsWith('/') || path.split('/').some((part) => part === '..' || part === '.git'))
            )
                throw new Error(`Unsafe source path: ${path}`);
            git(repo, ['cat-file', '-e', `${actual}:${path === '.' ? '' : path}`]);
        }
        const target = join(root, entry.id);
        mkdirSync(target);
        const archive = execFileSync('git', ['-C', repo, 'archive', '--worktree-attributes', actual, '--', ...paths], {
            maxBuffer: 384 * 1024 * 1024,
        });
        execFileSync('tar', ['-xf', '-', '-C', target, '--no-same-owner'], { input: archive });
        const trees = Object.fromEntries(
            paths.map((path) => [path, git(repo, ['rev-parse', `${actual}:${path === '.' ? '' : path}`]).trim()])
        );
        sources.push({ ...entry, paths, notices, trees });
        console.log(`Prepared ${entry.id} at ${actual}`);
    }
    writeFileSync(join(root, 'sources.json'), JSON.stringify(sources, null, 2) + '\n');
    git(root, ['init', '--quiet']);
    git(root, ['add', '--force', '--all']);
    console.log(
        `Reference bundle staged at ${root}; review and commit it with the repository's author, sign-off and AI-credit rules before git subtree import`
    );
} finally {
    rmSync(cache, { recursive: true, force: true });
}
