/**
 * @file tools/documentation/check.test.mjs
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
import { inspectSource, isEditableTypeScript, usefulDescription } from './check.mjs';

const contract = '/** Preserve tenant boundaries before exposing records to an observer. */';
const findings = (source) => inspectSource('fixture.ts', source);

// Each negative distinguishes an uncovered AST form from a declaration-only rule.
for (const [name, source, count = 1] of [
    ['function declaration', 'function read() { return 1; }'],
    ['named expression', 'const read = function inner() { return 1; };'],
    ['anonymous expression', 'const read = function () { return 1; };'],
    ['arrow', 'const read = () => 1;'],
    ['parenthesized arrow', 'const read = (() => 1);'],
    ['async arrow', 'const read = async () => 1;'],
    ['generator callback', 'Effect.gen(function* () { yield* Effect.void; });'],
    ['nested callback', `${contract} const read = () => values.map(value => value.id);`],
    ['class', 'class Registry {}'],
    ['class expression', 'const Registry = class {};'],
    ['interface', 'interface Registry { readonly id: string; }'],
    ['object method', 'const registry = { read() { return 1; } };'],
    ['object arrow property', 'const registry = { read: () => 1 };'],
    [
        'class members',
        `${contract} class Registry { constructor() {} read() {} get id() { return 1; } set id(value: number) {} }`,
        4,
    ],
    ['interface method', `${contract} interface Registry { read(): number; }`],
    ['property function type', `${contract} interface Registry { read: () => number; }`],
    ['call signature', `${contract} interface Registry { (): number; }`],
    ['construct signature', `${contract} interface Registry { new (): Registry; }`],
    ['function type alias', 'type Read = () => number;'],
    ['constructor type alias', 'type Registry = new () => object;'],
    ['parameter function type', `${contract} function read(callback: () => void) {}`],
    ['variable function type', 'let read: () => void;'],
    ['overloads', 'function read(id: string): string; function read(id: number): number;', 2],
]) {
    test(`requires a separate contract for ${name}`, () => {
        assert.equal(findings(source).filter((finding) => finding.rule === 'missing-jsdoc').length, count);
    });
}

for (const [name, source] of [
    ['exported generic binding', `${contract} export const read = <T>(value: T): T => value;`],
    ['default declaration', `${contract} export default function read() { return 1; }`],
    ['parenthesized expression', `${contract} const read = (function () { return 1; });`],
    ['anonymous inline callback', `values.map(${contract} (value) => value.id);`],
    ['generator callback', `Effect.gen(${contract} function* () { yield* Effect.void; });`],
    ['object arrow binding', `const registry = { ${contract} read: () => 1 };`],
    ['object method', `const registry = { ${contract} read() { return 1; } };`],
    [
        'class and members',
        `${contract} class Registry { ${contract} constructor() {} ${contract} get id() { return 1; } ${contract} set id(value: number) {} }`,
    ],
    ['function type alias', `${contract} type Read = () => number;`],
    ['parameter function type', `${contract} function read(${contract} callback: () => void) {}`],
    ['variable function type', `${contract} let read: () => void;`],
    ['typed callable initializer', `${contract} const read: () => number = ${contract} () => 1;`],
    ['call signature', `${contract} interface Registry { ${contract} (): number; }`],
    [
        'internal contract',
        '/** @internal Trusted SQL composition only; never create an independent transaction root. */ const compose = () => 1;',
    ],
    [
        'required vendor boundary marker',
        `${contract}\n// effect-boundary: only the approved SDK constructs this client.\nconst read = () => 1;`,
    ],
]) {
    test(`accepts useful attached JSDoc on ${name}`, () => assert.deepEqual(findings(source), []));
}

test('rejects licence headers, ordinary comments, tags alone, placeholders and name-only repetition', () => {
    for (const doc of [
        '/** @file fixture.ts\n * Preserve tenant boundaries before exposing records to an observer. */',
        '// Preserve tenant boundaries before exposing records to an observer.\n',
        '/** @param value - Preserve tenant boundaries before exposing records to an observer. */',
        '/** TODO Preserve tenant boundaries before exposing records to an observer. */',
        '/** Read read read read read read function. */',
    ])
        assert.ok(['missing-jsdoc', 'review-jsdoc'].includes(findings(`${doc}\nconst read = () => 1;`)[0]?.rule));
    assert.equal(usefulDescription('Normalize locale tags.', 'normalizeLocale'), true);
    assert.deepEqual(findings('/** Normalize locale tags. */ const normalizeLocale = () => 1;'), []);
});

test('does not borrow a sibling, enclosing contract or multi-declaration statement comment', () => {
    assert.equal(findings(`${contract} const first = () => 1; const second = () => 2;`).length, 1);
    assert.equal(findings(`${contract} const first = () => 1, second = () => 2;`).length, 2);
    assert.equal(findings(`${contract} class Registry { read() {} }`).length, 1);
});

test('requests rationale review for separate calls and nontrivial branching', () => {
    for (const body of ['const value = decode(); return authorize(value);', 'if (denied) return 0; return read();']) {
        assert.deepEqual(
            findings(`${contract} function read() { ${body} }`).map((f) => f.rule),
            ['review-internal-rationale']
        );
    }
    assert.deepEqual(
        findings(`${contract} function read() {
        // Validate tenant ownership before returning potentially protected records.
        const value = decode(); return authorize(value);
    }`),
        []
    );
});

test('nested function rationale and local JSDoc do not satisfy their enclosing body', () => {
    const source = `${contract} function read() {
        ${contract} const nested = () => {
            // Validate tenant ownership before returning potentially protected records.
            const value = decode(); return authorize(value);
        };
        return finish(nested());
    }`;
    assert.deepEqual(
        findings(source).map(({ name, rule }) => ({ name, rule })),
        [{ name: 'read', rule: 'review-internal-rationale' }]
    );
});

test('comment-like strings and placeholders cannot satisfy internal rationale', () => {
    for (const body of [
        'const fake = "// Validate tenant ownership before returning potentially protected records."; return finish(decode(fake));',
        '// TODO Validate tenant ownership before returning potentially protected records.\nconst value = decode(); return authorize(value);',
        '// Set value\nconst value = decode(); return authorize(value);',
    ])
        assert.equal(findings(`${contract} function read() { ${body} }`)[0]?.rule, 'review-internal-rationale');
});

test('pure expressions and trivial straight-line bodies need contracts but no internal narration', () => {
    for (const expression of [
        '() => 1',
        '() => ({ id: 1 })',
        '() => { return 1; }',
        '() => { const value = 1; return value; }',
        '() => { if (denied) return 0; }',
        '() => { if (denied) { return 0; } }',
    ]) {
        assert.deepEqual(findings(`${contract} const read = ${expression};`), []);
        assert.deepEqual(
            findings(`const read = ${expression};`).map((f) => f.rule),
            ['missing-jsdoc']
        );
    }
});

test('value-only selectors do not need invented phase narration', () => {
    for (const body of [
        'if (value === null) return false; return value.enabled;',
        'if (value === null) { return false; } else { return value.enabled; }',
        'const key = value.kind; if (key === "public") return { readable: true }; return { readable: false };',
        'const { kind = "private" } = value; if (kind === "public") return true; return false;',
        'switch (value.kind) { case "public": return true; case "private": return false; }',
        'switch (value.kind) { case "public": case "shared": return true; default: return false; }',
    ])
        assert.deepEqual(findings(`${contract} function select(value) { ${body} }`), [], body);
});

test('destructuring selectors inspect defaults and computed binding keys for execution', () => {
    for (const binding of [
        '{ kind = decode() }',
        '[kind = decode()]',
        '{ nested: { kind = decode() } }',
        '{ [decode()]: kind }',
        '{ kind = new Receipt() }',
        '{ kind = (value.enabled = true) }',
        '{ kind = () => true }',
    ])
        assert.ok(
            findings(
                `${contract} function select(value) { const ${binding} = value; if (kind === "public") return true; return false; }`
            ).some((finding) => finding.rule === 'review-internal-rationale'),
            binding
        );
});

test('selector-shaped bodies with execution or mutation still request rationale', () => {
    for (const body of [
        'if (denied) return 0; return read();',
        'if (authorize(value)) return true; return false;',
        'if (value.kind === "public") return new Receipt(); return false;',
        'if (value.kind === "public") return tag`value`; return false;',
        'if (value.kind === "public") return value.count++; return false;',
        'if (value.kind === "public") return delete value.private; return false;',
        'if (value.kind === "public") return (value.enabled = true); return false;',
        'if (value.kind === "public") return () => read(); return false;',
        'const key = decode(value); if (key === "public") return true; return false;',
        'switch (value.kind) { case "public": publish(value); return true; default: return false; }',
        'if (value.kind === "public") return yield* read(); return false;',
        'if (value.kind === "public") return await read(); return false;',
    ])
        assert.ok(
            findings(`${contract} function* select(value) { ${body} }`).some(
                (finding) => finding.rule === 'review-internal-rationale'
            ),
            body
        );
});

test('own-body JSDoc can explain a phase without documenting another callable', () => {
    for (const comment of [
        '/** Decode the tenant reference before authorizing it so encoded aliases cannot escape scope. */',
        '/**\n * Decode the tenant reference before authorizing it so encoded aliases cannot escape scope.\n */',
    ])
        assert.deepEqual(
            findings(`${contract} function read() { ${comment}\nconst value = decode(); return authorize(value); }`),
            []
        );
});

test('callable contracts and JSDoc placeholders never substitute for own-body rationale', () => {
    for (const body of [
        `${contract} const nested = () => 1; return finish(nested());`,
        `${contract} function nested() { return 1; } return finish(nested());`,
        'const nested = /** Decode the tenant reference before authorizing its scope. */ () => 1; return finish(nested());',
        '/** TODO Decode before authorization so aliases cannot escape scope. */ const value = decode(); return authorize(value);',
        '/** Set value */ const value = decode(); return authorize(value);',
        '/** @file Decode before authorization so aliases cannot escape scope. */ const value = decode(); return authorize(value);',
    ])
        assert.ok(
            findings(`${contract} function read() { ${body} }`).some(
                (finding) => finding.rule === 'review-internal-rationale'
            ),
            body
        );
});

test('exact finding identity survives prose/line shifts but not changed code, names or duplicate additions', () => {
    const first = findings('const read = (value: string) => value;');
    const shifted = findings('\n// Existing surrounding context.\nconst read = (value: string) => value;');
    assert.equal(first[0].id, shifted[0].id);
    assert.notEqual(first[0].id, findings('const read = (value: string) => value.trim();')[0].id);
    assert.notEqual(first[0].id, findings('const write = (value: string) => value;')[0].id);
    const duplicate = findings('values.map(value => value.id); values.map(value => value.id);');
    assert.notEqual(duplicate[0].id, duplicate[1].id);
});

test('parses TSX and rejects malformed TypeScript without skipping its declarations', () => {
    assert.deepEqual(inspectSource('fixture.tsx', `${contract} const View = () => <Text>Content</Text>;`), []);
    assert.ok(findings('const read = ( => 1;').some((f) => f.rule === 'parse-error'));
});

test('covers editable declarations, configs, tests, examples and tools; excludes only history/vendor/output', () => {
    for (const file of [
        'packages/a/src/a.ts',
        'apps/a/src/a.tsx',
        'tests/a/a.spec.ts',
        'ai-docs/src/a.ts',
        'tools/a.ts',
        'scripts/a.cts',
        'types/ambient.d.ts',
        'tests/boundaries/fixtures/a.ts',
        'vitest.shared.ts',
        '.agents/skills/local/example.ts',
    ]) {
        assert.equal(isEditableTypeScript(file), true, file);
    }
    for (const file of [
        'Examples/a.ts',
        'examples/a.ts',
        'externals/a.ts',
        'node_modules/a.ts',
        'apps/a/dist/a.d.ts',
        'apps/a/.expo/types/a.ts',
        '.claude/skills/a.ts',
        '.cursor/commands/a.ts',
        'graphify-out/a.ts',
        '.amp/in/a.ts',
        'a.js',
        'a.md',
    ]) {
        assert.equal(isEditableTypeScript(file), false, file);
    }
});
