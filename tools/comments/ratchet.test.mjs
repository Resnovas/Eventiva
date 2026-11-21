/**
 * @file tools/comments/ratchet.test.mjs
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
import { test } from 'node:test';
import { Linter } from 'eslint';
import { noInlineCommentsRule } from './no-inline-comments.mjs';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isExemptComment, isInScopeCommentFile, readIfPresent } from './policy.mjs';
import {
    buildRatchetLedger,
    evaluateRatchet,
    scanBannedComments,
    stripBannedComments,
    tightenRatchetLedger,
    validateRatchetLedger,
} from './ratchet.mjs';

const lintWithRule = (code, filename, options = {}) => {
    const linter = new Linter();
    return linter.verify(
        code,
        [
            {
                files: ['**/*.js', '**/*.mjs', '**/*.ts', '**/*.tsx'],
                plugins: { eventiva: { rules: { 'no-inline-comments': noInlineCommentsRule } } },
                rules: { 'eventiva/no-inline-comments': ['error', options] },
            },
        ],
        { filename }
    );
};

test('rejects inline and block comments while preserving JSDoc, FCL headers, effect-boundary and test @ts-expect-error', () => {
    const license =
        '/**\n * @file packages/runtime/src/sample.ts\n * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.\n */\n';
    const clean = [
        license,
        '/** Document the exported callable contract. */',
        '// effect-boundary: vendor SDK callback requires Promise bridging.',
        'export const run = () => 1;',
    ].join('\n');

    assert.deepEqual(scanBannedComments('packages/runtime/src/sample.ts', clean), []);
    assert.deepEqual(lintWithRule(clean, 'packages/runtime/src/sample.js', { root: '' }), []);

    const withBanned = `${clean}\n// Tautology repeating code.\n/* Block workaround note. */\nexport const two = () => 2;\n`;
    const scanned = scanBannedComments('packages/runtime/src/sample.ts', withBanned);
    assert.equal(scanned.length, 2);

    const messages = lintWithRule(withBanned, 'packages/runtime/src/sample.js', { root: '' });
    assert.equal(messages.length, 2);
    assert.match(messages[0].message, /Do not add inline or block comments/);
    assert.match(messages[0].message, /docs\/adr\//);
    assert.match(messages[0].message, /\/delete-comment/);
});

test('allows @ts-expect-error only in test files and rejects it in production code', () => {
    const code = '// @ts-expect-error Invalid literal state.\nconst bad = 1;\n';
    assert.deepEqual(scanBannedComments('tests/contracts/src/storage.spec.ts', code), []);
    assert.deepEqual(lintWithRule(code, 'tests/contracts/src/storage.spec.js', { root: '' }), []);
    assert.equal(scanBannedComments('packages/runtime/src/storage.ts', code).length, 1);
    assert.equal(lintWithRule(code, 'packages/runtime/src/storage.js', { root: '' }).length, 1);
});

test('skips house-synced files managed by Resnovas/.github', () => {
    const synced =
        '// Synced from Resnovas/.github templates/tools/dev/example.mjs.\n// Local note.\nexport const x = 1;\n';
    assert.deepEqual(scanBannedComments('tools/dev/example.mjs', synced), []);
    assert.deepEqual(lintWithRule(synced, 'tools/dev/example.mjs', { root: '' }), []);
});

test('enforces per-file ratchet budgets in ESLint and rejects excess comments', () => {
    const twoComments = '// One.\n// Two.\nexport const x = 1;\n';
    const threeComments = '// One.\n// Two.\n// Three.\nexport const x = 1;\n';
    const budget = { 'packages/runtime/src/legacy.js': 2 };

    assert.deepEqual(lintWithRule(twoComments, 'packages/runtime/src/legacy.js', { root: '', budget }), []);

    const exceeded = lintWithRule(threeComments, 'packages/runtime/src/legacy.js', { root: '', budget });
    assert.equal(exceeded.length, 1);
    assert.equal(exceeded[0].line, 3);
    assert.match(exceeded[0].message, /exceeding its ratchet budget of 2/);

    const unbudgeted = lintWithRule('// One.\nexport const y = 2;\n', 'packages/runtime/src/new.js', {
        root: '',
        budget,
    });
    assert.equal(unbudgeted.length, 1);
    assert.match(unbudgeted[0].message, /Do not add inline or block comments/);
});

test('monotonic ratchet rejects increases, flags stale loose budgets and tightens downward cleanly', () => {
    const prior = buildRatchetLedger({ 'packages/runtime/src/a.ts': 2, 'packages/runtime/src/b.ts': 1 });
    assert.deepEqual(
        evaluateRatchet({
            actualCounts: { 'packages/runtime/src/a.ts': 2, 'packages/runtime/src/b.ts': 1 },
            ledger: prior,
            previousLedger: prior,
        }),
        []
    );

    const staleErrors = evaluateRatchet({
        actualCounts: { 'packages/runtime/src/a.ts': 1, 'packages/runtime/src/b.ts': 1 },
        ledger: prior,
        previousLedger: prior,
    });
    assert.equal(staleErrors.length, 1);
    assert.match(staleErrors[0], /stale ratchet budget/);

    const tightened = tightenRatchetLedger({ 'packages/runtime/src/a.ts': 1, 'packages/runtime/src/b.ts': 0 }, prior);
    assert.deepEqual(tightened.files, { 'packages/runtime/src/a.ts': 1 });
    assert.equal(tightened.total, 1);

    const raised = buildRatchetLedger({ 'packages/runtime/src/a.ts': 3, 'packages/runtime/src/b.ts': 1 });
    const increaseErrors = evaluateRatchet({
        actualCounts: { 'packages/runtime/src/a.ts': 3, 'packages/runtime/src/b.ts': 1 },
        ledger: raised,
        previousLedger: prior,
    });
    assert.ok(increaseErrors.some((message) => /Ratchet budget increased/.test(message)));

    assert.throws(() =>
        tightenRatchetLedger({ 'packages/runtime/src/a.ts': 3, 'packages/runtime/src/b.ts': 1 }, prior)
    );
});

test('validates ratchet ledger schema and scope boundaries', () => {
    assert.throws(() => validateRatchetLedger({ version: 1, policy: 'test', total: 2, files: { 'packages/a.ts': 1 } }));
    assert.throws(() => validateRatchetLedger({ version: 1, policy: 'test', total: 1, files: { 'packages/*.ts': 1 } }));
    assert.throws(() => validateRatchetLedger({ version: 1, policy: 'test', total: 0, files: { 'packages/a.ts': 0 } }));
    assert.equal(isInScopeCommentFile('packages/runtime/src/a.ts'), true);
    assert.equal(isInScopeCommentFile('examples/old/a.ts'), false);
    assert.equal(isInScopeCommentFile('.opencode/skills/monitor-ci/scripts/a.mjs'), false);
    assert.equal(isInScopeCommentFile('tests/boundaries/fixtures/core-library/a.ts'), false);
    assert.equal(isExemptComment({ type: 'Block', value: '', raw: '/**/' }), false);
    assert.equal(isExemptComment({ type: 'Block', value: '** banner **', raw: '/*** banner ***/' }), false);
});

test('counts only real comments, never regex or template text, and agrees with ESLint', () => {
    const code = [
        '#!/usr/bin/env node',
        "export const strip = (value) => value.replace(/^\\.\\//, '').replace(/\\/\\*.*\\*\\//g, '');",
        'export const glob = `${"src"}/**/*.ts // not a comment`;',
        "export const url = 'https://example.test/a';",
        'export const real = 1; // Real trailing comment.',
        '',
    ].join('\n');
    const scanned = scanBannedComments('packages/runtime/src/strings.ts', code);
    assert.deepEqual(
        scanned.map(({ line, raw }) => ({ line, raw })),
        [{ line: 5, raw: '// Real trailing comment.' }]
    );
    assert.equal(lintWithRule(code, 'packages/runtime/src/strings.mjs', { root: '' }).length, 1);
});

test('strips banned comments while keeping exempt ones and code intact', () => {
    const code = [
        '/** Contract. */',
        'export const a = 1; // Trailing.',
        '',
        '// Own line between blanks.',
        '',
        'export const b = /* inline */ 2;',
        '// effect-boundary: vendor callback.',
        'export const c = 3;',
        '',
    ].join('\n');
    const { text, removed } = stripBannedComments('packages/runtime/src/strip.ts', code);
    assert.equal(removed, 3);
    assert.equal(
        text,
        [
            '/** Contract. */',
            'export const a = 1;',
            '',
            'export const b = 2;',
            '// effect-boundary: vendor callback.',
            'export const c = 3;',
            '',
        ].join('\n')
    );
});

test('reads a ledger without a check-then-use race: only a missing file is absent', () => {
    const dir = mkdtempSync(join(tmpdir(), 'comment-ratchet-'));
    const file = join(dir, 'ratchet.json');
    assert.equal(readIfPresent(file), undefined);
    writeFileSync(file, '{}\n');
    assert.equal(readIfPresent(file), '{}\n');
    assert.throws(() => readIfPresent(dir), { code: 'EISDIR' });
});
