/**
 * @file tools/documentation/ratchet.test.mjs
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
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { inspectSource } from './check.mjs';
import { addedRanges, evaluate, history, refreshLedger, renderInventory, validateLedger } from './ratchet.mjs';

const base = '1'.repeat(40);
const source = 'const read = () => 1;\nconst write = () => 2;';
const original = inspectSource('packages/a.ts', source);
const accepted = refreshLedger(original, null, base);
const check = (findings, ledger = accepted, extras = {}) =>
    evaluate({ findings, ledger, previousFindings: original, previousLedger: accepted, ...extras });

test('unchanged exact debt is visible and passes, while a touched indebted file must improve', () => {
    assert.deepEqual(check(original), []);
    assert.match(check(original, accepted, { touched: ['packages/a.ts'] }).join('\n'), /Touched file must reduce debt/);
    const improved = inspectSource(
        'packages/a.ts',
        '/** Return the fixed read sentinel. */ const read = () => 1;\nconst write = () => 2;'
    );
    const pruned = refreshLedger(improved, accepted, base);
    assert.equal(pruned.entries.length, 1);
    assert.deepEqual(check(improved, pruned, { touched: ['packages/a.ts'] }), []);
    assert.match(check(improved).join('\n'), /Resolved\/stale debt must be removed/);
});

test('new/changed code cannot be accepted by ledger edits or traded against a lower count', () => {
    const changed = inspectSource('packages/a.ts', 'const read = () => 3;');
    assert.match(check(changed).join('\n'), /New or changed undocumented syntax/);
    const forged = refreshLedger(changed, null, base);
    assert.match(check(changed, forged, { touched: ['packages/a.ts'] }).join('\n'), /Debt addition or mutation/);
    const added = inspectSource('packages/new.ts', 'const helper = () => 1;');
    assert.match(check([...original, ...added]).join('\n'), /New or changed undocumented syntax/);
    // Pruning never adds the new finding, even when requested after a legitimate deletion.
    assert.equal(refreshLedger(changed, accepted, base).entries.length, 0);
});

test('copied identical callbacks on added lines cannot inherit old accepted identities', () => {
    assert.match(
        check([original[0]], refreshLedger([original[0]], accepted, base), {
            added: new Map([['packages/a.ts', [[1, 1]]]]),
        }).join('\n'),
        /Changed source must comply/
    );
});

test('ledger tampering, duplicate/wildcard entries, parse errors and rewritten provenance fail closed', () => {
    for (const mutate of [
        (ledger) => ledger.entries.push(ledger.entries[0]),
        (ledger) => {
            ledger.entries[0].file = 'packages/*.ts';
        },
        (ledger) => {
            ledger.entries[0].rule = 'parse-error';
        },
        (ledger) => {
            ledger.entries[0].ignore = true;
        },
        (ledger) => {
            ledger.entries[0].file = '../outside.ts';
        },
    ]) {
        const candidate = structuredClone(accepted);
        mutate(candidate);
        assert.throws(() => validateLedger(candidate));
    }
    const forged = structuredClone(accepted);
    forged.initialBase = '2'.repeat(40);
    assert.throws(() => check(original, forged), /provenance/);
    const malformed = inspectSource('packages/broken.ts', 'const broken = ( => ;');
    assert.match(check(malformed).join('\n'), /parse-error/);
});

test('bootstrap can record only preexisting trusted-source findings, never new in-flight source', () => {
    assert.deepEqual(evaluate({ findings: original, ledger: accepted, previousFindings: original }), []);
    const extra = inspectSource('packages/inflight.ts', 'const run = () => 1;');
    const candidate = refreshLedger([...original, ...extra], null, base);
    assert.match(
        evaluate({ findings: [...original, ...extra], ledger: candidate, previousFindings: original }).join('\n'),
        /Debt addition or mutation/
    );
});

test('source locations may shift but exact declaration metadata may not be reassigned', () => {
    const shifted = inspectSource('packages/a.ts', '\n' + source);
    assert.deepEqual(check(shifted), []);
    const altered = structuredClone(accepted);
    altered.entries[0].name = 'other';
    assert.match(check(original, altered).join('\n'), /Debt addition or mutation/);
});

test('added-range parser respects single additions, deletions and asymmetric offsets', () => {
    assert.deepEqual(addedRanges('@@ -2 +5,3 @@\n+x\n@@ -10,2 +14,0 @@\n-x\n@@ -20,0 +24 @@\n+x'), [
        [5, 7],
        [24, 24],
    ]);
});

test('trusted history requires an explicit immutable SHA or local HEAD and does not accept arbitrary refs', () => {
    for (const value of [undefined, 'main', 'origin/main', '--help', 'abc123'])
        assert.throws(() => history(process.cwd(), value), /Pass --base HEAD/);
});

test('the complete inventory distinguishes mechanical debt and heuristic queues across bounded batches', () => {
    const findings = [
        ...inspectSource('packages/runtime/src/guard.ts', 'function guard() { if (denied) return 0; return read(); }'),
        ...inspectSource('tests/runtime/guard.spec.ts', 'const fixture = () => 1;'),
    ];
    const ledger = refreshLedger(findings, null, base);
    const rendered = renderInventory(ledger);
    assert.match(rendered, /3 remaining findings across 2 files: 2 mechanically missing JSDoc/);
    assert.match(rendered, /0 prose-review candidates; 1 internal-rationale review candidates/);
    assert.match(rendered, /D02.*guard\.ts.*1 \| 0 \| 1/);
    assert.match(rendered, /D05.*guard\.spec\.ts.*1 \| 0 \| 0/);
    assert.match(renderInventory(refreshLedger([], ledger, base)), /0 remaining findings across 0 files/);
    assert.equal(renderInventory(ledger), rendered);
});

test('uncalibrated rationale candidates require semantic review but cannot be misrepresented as new code failures', () => {
    const adequate = inspectSource(
        'packages/new.ts',
        '/** Reauthorize the payload-free provider barrier instead of replaying queued metadata. */ function flush() { authorize(); barrier(); }'
    );
    assert.deepEqual(
        adequate.map((entry) => entry.rule),
        ['review-internal-rationale']
    );
    assert.deepEqual(check([...original, ...adequate]), []);
    // New review candidates are not silently appended to the accepted ledger.
    assert.deepEqual(refreshLedger([...original, ...adequate], accepted, base), accepted);
    const missing = inspectSource('packages/new.ts', 'function flush() { authorize(); barrier(); }');
    assert.match(check([...original, ...missing]).join('\n'), /New or changed undocumented syntax/);
});

const contextualSource =
    'const read = () => { const query = sql`select ${table} where id = ${id}`; return finish(query); };\nconst write = () => 2;\n';

/** Build an isolated, disposable history so reconciliation never trusts candidate source or synthetic maps. */
const historicalFixture = (t, text = contextualSource) => {
    const scratch = resolve('.amp/in/orb-backup');
    mkdirSync(scratch, { recursive: true });
    const root = mkdtempSync(join(scratch, 'fingerprint-history-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const git = (...args) =>
        execFileSync(
            'git',
            ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', '-c', 'commit.gpgsign=false', ...args],
            { cwd: root, encoding: 'utf8' }
        ).trim();
    const file = 'packages/a.ts';
    mkdirSync(join(root, 'packages'), { recursive: true });
    mkdirSync(join(root, 'tools/documentation'), { recursive: true });
    mkdirSync(join(root, 'docs/planning'), { recursive: true });
    for (const name of ['check.mjs', 'ratchet.mjs'])
        copyFileSync(resolve('tools/documentation', name), join(root, 'tools/documentation', name));
    writeFileSync(join(root, file), text);
    git('init', '--quiet');
    git('add', '.');
    git('commit', '--quiet', '-m', 'fixture source');
    const initialBase = git('rev-parse', 'HEAD');
    const findings = inspectSource(file, text, { internalLegacyFingerprint: true });
    const ledger = refreshLedger(findings, null, initialBase);
    const writeLedger = (value) => {
        writeFileSync(join(root, 'tools/documentation/debt.json'), `${JSON.stringify(value, null, 2)}\n`);
        writeFileSync(join(root, 'docs/planning/documentation-backlog.md'), renderInventory(value));
    };
    writeLedger(ledger);
    git('add', '.');
    git('commit', '--quiet', '-m', 'fixture accepted ledger');
    const base = git('rev-parse', 'HEAD');
    const run = (...args) =>
        spawnSync(process.execPath, ['tools/documentation/ratchet.mjs', '--base', base, ...args], {
            cwd: root,
            encoding: 'utf8',
            env: { ...process.env, DOCUMENTATION_BASE: base },
        });
    return { root, file, base, ledger, writeLedger, run, git };
};

test('strict CLI rejects accepted and never-ledgered rationale while documented source passes', (t) => {
    const undocumented =
        '/** Recheck live authorization before the provider barrier. */ function flush() { authorize(); barrier(); }';
    const fixture = historicalFixture(t, undocumented);
    const strict = (...args) =>
        spawnSync(process.execPath, ['tools/documentation/check.mjs', ...args], {
            cwd: fixture.root,
            encoding: 'utf8',
        });
    // Accepted historical rationale passes the migration ratchet, never the separate strict scanner.
    assert.equal(fixture.run().status, 0);
    assert.equal(fixture.ledger.entries.length, 1);
    assert.equal(strict().status, 1);
    assert.match(strict().stdout, /review-internal-rationale/);
    const documented = undocumented.replace(
        '{ authorize();',
        '{ /* Revocation must precede provider work. */ authorize();'
    );
    writeFileSync(join(fixture.root, fixture.file), documented);
    assert.equal(strict().status, 0);
    // New untracked source must not evade strict enforcement by staying outside the accepted ledger or Git index.
    writeFileSync(join(fixture.root, 'packages/new.ts'), undocumented);
    const result = strict('--json');
    assert.equal(result.status, 1);
    const inventory = JSON.parse(result.stdout);
    assert.equal(inventory.checked, 2);
    assert.deepEqual(
        inventory.findings.map(({ file, rule }) => ({ file, rule })),
        [{ file: 'packages/new.ts', rule: 'review-internal-rationale' }]
    );
});

test('root and uncached Nx documentation wiring retain the ratchet and end with the strict scanner', () => {
    const { scripts, nx } = JSON.parse(readFileSync('package.json', 'utf8'));
    const commands = scripts.documentation.split(' && ');
    assert.equal(commands.at(-1), 'node tools/documentation/check.mjs');
    assert.ok(commands.includes('node tools/documentation/ratchet.mjs --base HEAD'));
    assert.ok(scripts.check.split(' && ').includes('node --run documentation'));
    assert.equal(nx.targets.documentation.cache, false);
    assert.equal(nx.targets.documentation.options.command, 'node --run documentation');
});

test('trusted history reconciles exact legacy pairs without changing provenance, metadata or classification', (t) => {
    const fixture = historicalFixture(t);
    const trusted = history(fixture.root, fixture.base);
    const canonical = inspectSource(fixture.file, contextualSource);
    assert.notEqual(fixture.ledger.entries[0].id, canonical[0].id);
    assert.deepEqual(trusted.previousFindings, canonical);
    assert.deepEqual(trusted.previousLedger, { ...fixture.ledger, entries: canonical });
    assert.deepEqual(trusted.normalizeLedger(fixture.ledger), trusted.previousLedger);
    assert.deepEqual(trusted.normalizeLedger(trusted.previousLedger), trusted.previousLedger);
    assert.deepEqual(fixture.ledger.entries.at(-1), canonical.at(-1));
    assert.equal(fixture.run().status, 0);
    assert.equal(fixture.run('--update-ledger').status, 0);
    const written = JSON.parse(readFileSync(join(fixture.root, 'tools/documentation/debt.json'), 'utf8'));
    assert.deepEqual(written, trusted.previousLedger);
    assert.deepEqual(evaluate({ findings: canonical, ledger: written, ...trusted }), []);
});

test('same-node comment and line shifts keep canonical identity while touched debt must still decrease', (t) => {
    const fixture = historicalFixture(t);
    const shifted = contextualSource.replace(
        '; return',
        ';\n/* Retain query ownership through finalization. */\nreturn'
    );
    writeFileSync(join(fixture.root, fixture.file), shifted);
    const trusted = history(fixture.root, fixture.base);
    const current = inspectSource(fixture.file, shifted);
    assert.equal(current[0].id, trusted.previousFindings[0].id);
    // Internal rationale has genuinely been supplied, reducing this file's accepted review queue only.
    const normalized = trusted.normalizeLedger(fixture.ledger);
    const ledger = refreshLedger(current, normalized, fixture.base);
    const errors = evaluate({ findings: current, ledger, ...trusted });
    assert.ok(!errors.some((error) => /New or changed undocumented syntax/.test(error)), errors.join('\n'));
    assert.ok(
        errors.some((error) => /Touched file must reduce debt/.test(error)),
        errors.join('\n')
    );
    assert.notEqual(fixture.run('--update-ledger').status, 0);
});

test('comment-only remapping permits real contract remediation without erasing an independent rationale candidate', (t) => {
    const text = contextualSource
        .replace('const read', '/** Retain query identity through row projection. */ const read')
        .replace('return finish(query)', 'const rows = values.map(value => value.id); return finish(query, rows)');
    const fixture = historicalFixture(t, text);
    const documented = text.replace('value =>', '\n/** Project existing row identifiers in source order. */\nvalue =>');
    writeFileSync(join(fixture.root, fixture.file), documented);
    const trusted = history(fixture.root, fixture.base);
    const current = inspectSource(fixture.file, documented);
    const before = trusted.previousFindings.find((entry) => entry.rule === 'review-internal-rationale');
    assert.ok(current.some((entry) => entry.id === before.id));
    const result = fixture.run('--update-ledger');
    assert.equal(result.status, 0, result.stderr);
    const written = JSON.parse(readFileSync(join(fixture.root, 'tools/documentation/debt.json'), 'utf8'));
    assert.ok(written.entries.some((entry) => entry.id === before.id));
    assert.equal(written.entries.filter((entry) => entry.rule === 'missing-jsdoc').length, 1);
});

test('migration never maps changed code, renamed contracts or candidate-provided debt into accepted history', (t) => {
    const fixture = historicalFixture(t);
    for (const changed of [
        contextualSource.replace('${table}', '${otherTable}'),
        contextualSource.replace('where id =', 'where key ='),
        contextualSource.replace('const read', 'const renamed'),
    ]) {
        writeFileSync(join(fixture.root, fixture.file), changed);
        const result = fixture.run('--update-ledger');
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /New or changed undocumented syntax/);
        fixture.writeLedger(refreshLedger(inspectSource(fixture.file, changed), null, fixture.ledger.initialBase));
        const forged = fixture.run();
        assert.notEqual(forged.status, 0);
        assert.match(forged.stderr, /Debt addition or mutation/);
        fixture.writeLedger(fixture.ledger);
    }
});

test('reconciliation rejects malformed entries, metadata reassignment, duplicates and provenance resets', (t) => {
    const fixture = historicalFixture(t);
    const trusted = history(fixture.root, fixture.base);
    assert.equal(typeof trusted.normalizeLedger, 'function');
    for (const mutate of [
        (ledger) => {
            ledger.entries[0].name = 'write';
        },
        (ledger) => {
            ledger.entries[0].file = 'packages/unrelated.ts';
        },
        (ledger) => {
            ledger.entries[0].rule = 'review-jsdoc';
        },
        (ledger) => {
            ledger.entries.push({ ...ledger.entries[0], id: trusted.previousFindings[0].id });
        },
        (ledger) => {
            ledger.mapping = { [ledger.entries[0].id]: trusted.previousFindings[0].id };
        },
    ]) {
        const malformed = structuredClone(fixture.ledger);
        mutate(malformed);
        assert.throws(() => trusted.normalizeLedger(malformed));
    }
    const reset = { ...fixture.ledger, initialBase: '2'.repeat(40) };
    fixture.writeLedger(reset);
    assert.match(fixture.run().stderr, /provenance/);
    rmSync(join(fixture.root, 'tools/documentation/debt.json'));
    assert.match(fixture.run('--update-ledger').stderr, /cannot be deleted or reset/);
});

test('duplicate substitutions on added lines cannot inherit a reconciled legacy identity', (t) => {
    const first = 'values.map(value => `id:${value.id}`);';
    const second = 'values.map(value => `other:${value.id}`);';
    const third = 'values.map(value => `last:${value.id}`);';
    const fixture = historicalFixture(t, `${first}\n${second}\n${third}\n`);
    // Retain the original, delete another and replace the remaining callback with a copy: a lower total is insufficient.
    writeFileSync(join(fixture.root, fixture.file), `${first}\n${first}\n`);
    const result = fixture.run('--update-ledger');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /New or changed undocumented syntax/);
    assert.match(result.stderr, /Changed source must comply immediately/);
});
