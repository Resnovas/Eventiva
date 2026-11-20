/**
 * @file tools/function-telemetry/structure.test.mjs
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
import test from 'node:test';
import { inspectStructure, inspectOptimizationChange } from './structure.mjs';

const record = '@agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/proof.md#initial';

/**
 * Compare diverse executable forms with bodyless declarations and wrapper-name camouflage.
 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/architecture/function-telemetry.md#s1-implementation-evidence
 */
function inventoryContract() {
    const source = `// generated source, still first-party
declare function typeOnly(): number;
interface Shape { method(): number }
const tiny = (n: number) => n + 2;
function outer() { function inner() { return 7; } return inner(); }
class Sample {
 constructor() {}
 #private() { return 1; }
 get value() { return 2; }
 set value(n: number) {}
 async pending() { return 3; }
 *sequence() { yield 4; }
}
const camouflage = Effect.fn('fake')(() => 5);`;
    const result = inspectStructure(source, 'generated/sample.ts');
    assert.deepEqual(result.diagnostics, []);
    assert.equal(result.functions.length, 10);
    assert.ok(
        result.functions.every(
            /**
             * No recognized syntax constitutes an emitted instrumentation certificate.
             * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/architecture/function-telemetry.md#s1-implementation-evidence
             */
            (entry) => entry.status === 'blocked' && entry.reason.includes('do not suppress')
        )
    );
    assert.equal(
        new Set(
            result.functions.map(
                /**
                 * Every nested body needs its own offline occurrence, not only its exported parent.
                 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/architecture/function-telemetry.md#s1-implementation-evidence
                 */
                (entry) => entry.id
            )
        ).size,
        10
    );
    const capacityControl = 'function repeated() {}\n';
    assert.equal(inspectStructure(capacityControl.repeat(8192)).capacityExceeded, false);
    assert.equal(inspectStructure(capacityControl.repeat(8193)).capacityExceeded, true);
}

/**
 * A missing record in one changed function must not create findings for an unchanged sibling.
 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/architecture/function-telemetry.md#s1-implementation-evidence
 */
function changeContract() {
    const before = 'function unchanged() { return 2 }\nfunction changed() { return 3 }';
    const rejected = inspectOptimizationChange(before, before.replace('return 3', 'return 11'));
    assert.equal(rejected.length, 1);
    assert.equal(rejected[0].name, 'changed');
    const after = `function unchanged() { return 2 }\n/** ${record} */\nfunction changed() { return 11 }`;
    assert.deepEqual(inspectOptimizationChange(before, after), []);
    assert.deepEqual(inspectOptimizationChange(before, before), []);
    const classBefore = 'class Original { f() { return 1 } }';
    const classAfter = `class Copied { f() { return 1 } }\nclass Original {\n/** ${record} */\nf() { return 1 } }`;
    assert.equal(inspectOptimizationChange(classBefore, classAfter).length, 1);
    const callbacksBefore = `/** ${record} */\nfunction parent() { return xs.map(x => x + 1); }`;
    const callbacksAfter = `/** ${record} */\nfunction parent() { return [xs.map(x => x + 1), xs.map(\n/** ${record} */\nx => x + 1)]; }`;
    const copiedCallback = inspectOptimizationChange(callbacksBefore, callbacksAfter);
    assert.equal(copiedCallback.length, 1);
    assert.equal(copiedCallback[0].name, '<anonymous>');
}

/**
 * Tiny helpers must carry their own optimization record even inside a reviewed parent.
 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/architecture/function-telemetry.md#s1-implementation-evidence
 */
function attachmentContract() {
    const after = `/** ${record} */\nconst parent = () => { const child = () => 4; return child() };`;
    const findings = inspectOptimizationChange('', after);
    assert.equal(findings.length, 1);
    assert.equal(findings[0].name, 'child');
    const fixed = after.replace('const child =', `\n/** ${record} */\nconst child =`);
    assert.deepEqual(inspectOptimizationChange('', fixed), []);
}

/**
 * Deliberately plausible invalid records must fail instead of validating a magic substring.
 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/architecture/function-telemetry.md#s1-implementation-evidence
 */
function invalidRecordContract() {
    const variants = [
        `// ${record}\nfunction f() { return 1 }`,
        `/** ${record.replace('2026-11-20', '2026-02-30')} */ function f() { return 1 }`,
        `/** ${record.replace('docs/proof.md#initial', '../private.md')} */ function f() { return 1 }`,
        `/** ${record}\n * ${record} */ function f() { return 1 }`,
    ];
    for (const source of variants) assert.equal(inspectOptimizationChange('', source).length, 1);
}

/**
 * A parse failure must not masquerade as empty successful coverage.
 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/architecture/function-telemetry.md#s1-implementation-evidence
 */
function parseContract() {
    assert.equal(inspectOptimizationChange('', 'function broken(')[0].rule, 'parse-blocked');
    assert.deepEqual(inspectStructure('declare function onlyType(): void;').functions, []);
}

test(
    'pure/internal/generated functions stay blocked rather than exempt or covered by a fake wrapper',
    inventoryContract
);
test('changed body requires an attached record while untouched control remains untouched', changeContract);
test('variable and nested-arrow attachment works, but parent prose cannot cover a child', attachmentContract);
test('prose lookalikes, invalid dates, duplicate tags and unsafe references cannot pass', invalidRecordContract);
test('syntax failures block comparison and bodyless declarations do not invent functions', parseContract);
