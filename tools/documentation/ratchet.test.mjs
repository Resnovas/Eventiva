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
