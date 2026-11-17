/**
 * @file tools/resources/boundaries.test.mjs
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

import { strict as assert } from 'node:assert';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import {
    checkResourceBoundaries,
    checkResourceGraph,
    checkWorkspaceGraph,
    checkTypeEscapes,
    dependencyCycles,
} from './boundaries.mjs';

const fixture = (sources, run) => {
    const root = mkdtempSync(join(tmpdir(), 'resource-boundary-'));
    try {
        writeFileSync(
            join(root, 'tsconfig.base.json'),
            JSON.stringify({
                compilerOptions: {
                    module: 'nodenext',
                    moduleResolution: 'nodenext',
                    paths: { '@bridge': ['./bridge.ts'] },
                },
            })
        );
        for (const [path, text] of Object.entries(sources)) {
            mkdirSync(dirname(join(root, path)), { recursive: true });
            writeFileSync(join(root, path), text);
        }
        for (const [path, text] of Object.entries(sources)) {
            if (!path.endsWith('/package.json') || !path.startsWith('packages/')) continue;
            const { name } = JSON.parse(text);
            if (!name) continue;
            const link = join(root, 'node_modules', name);
            mkdirSync(dirname(link), { recursive: true });
            symlinkSync(dirname(join(root, path)), link, 'dir');
        }
        run(
            checkResourceBoundaries(root, { entries: ['feature.ts'] }),
            checkResourceGraph(root, { entries: ['feature.ts'] }),
            checkWorkspaceGraph(root),
            checkTypeEscapes(root, { entries: ['feature.ts'] }),
            checkTypeEscapes(root, { declarations: true }),
            checkWorkspaceGraph(root, { declarations: true })
        );
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
};

for (const syntax of [
    `import { SqlClient } from '@effect/sql'`,
    `export type { SqlClient } from '@effect/sql/SqlClient'`,
    `type Client = import('@effect/sql').SqlClient`,
    `import driver = require('pg')`,
    `const driver = require('better-sqlite3')`,
    `const driver = import('mysql2')`,
    `import { resourceProvider } from '@eventiva/integrations.sql/resource'`,
    `import { ResourceDriver as Port } from '@eventiva/contracts/resource'`,
    `import * as Port from '@eventiva/contracts/resource'`,
    `export * from '@eventiva/contracts/resource'`,
    `type Port = import('@eventiva/contracts/resource').ResourceDriver`,
    `import { connect } from 'node:net'`,
    `import(connectionModule)`,
])
    test(`rejects direct/type-graph boundary: ${syntax}`, () =>
        fixture({ 'feature.ts': syntax }, ({ findings }) => assert.equal(findings.length, 1)));

test('follows aliases, relative re-exports and type queries transitively', () =>
    fixture(
        {
            'feature.ts': `export type { Port } from '@bridge'`,
            'bridge.ts': `export type { Port } from './nested/port.ts'`,
            'nested/port.ts': `export type Port = import('pg').Client`,
        },
        ({ findings }) => {
            assert.equal(findings.length, 1);
            assert.equal(findings[0].chain.length, 4);
        }
    ));

test('relative paths cannot evade the privileged SQL directory', () =>
    fixture(
        {
            'feature.ts': `import './packages/integrations/sql/src/resource.ts'`,
            'packages/integrations/sql/src/resource.ts': 'export {}',
        },
        ({ findings }) => assert.match(findings[0].reason, /privileged SQL implementation/)
    ));

for (const syntax of [
    `import { value } from './externals/upstream/library/src/index.ts'`,
    `export type { Value } from './externals/upstream/library/src/index.ts'`,
    `type Value = import('./externals/upstream/library/src/index.ts').Value`,
    `const value = require('./externals/upstream/library/src/index.ts')`,
    `const value = import('./externals/upstream/library/src/index.ts')`,
    `export type { Value } from '@bridge'`,
])
    test(`rejects reference-only source through the resolved graph: ${syntax}`, () =>
        fixture(
            {
                'feature.ts': syntax,
                'bridge.ts': `export type { Value } from './externals/upstream/library/src/index.ts'`,
                'externals/upstream/library/src/index.ts': 'export const value = 1; export type Value = number;',
            },
            (_boundary, graph) => {
                assert.equal(graph.findings.length, 1);
                assert.match(graph.findings[0].reason, /reference-only upstream source/);
                assert.equal(
                    graph.edges.some(([, target]) => target.startsWith('externals/')),
                    false
                );
            }
        ));

test('fails closed on unresolved local types', () =>
    fixture({ 'feature.ts': `type T = import('./hidden.ts').Client` }, ({ findings }) =>
        assert.match(findings[0].reason, /Unresolved/)
    ));

test('allows feature contracts and ordinary pure helpers', () =>
    fixture(
        {
            'feature.ts': `import { Effect } from 'effect'; import './pure.ts'`,
            'pure.ts': `export const name = 'safe'`,
        },
        ({ findings }) => assert.equal(findings.length, 0)
    ));

test('allows named feature contracts without exposing the provider namespace', () =>
    fixture(
        {
            'feature.ts': `import { Resources, declareResource } from './packages/contracts/src/resource.ts'`,
            'packages/contracts/src/resource.ts': `export class Resources {}; export const declareResource = () => 1`,
        },
        ({ findings }) => assert.equal(findings.length, 0)
    ));

test('relative type aliases cannot expose the provider port', () =>
    fixture(
        {
            'feature.ts': `export type { ResourceDriver as Driver } from './packages/contracts/src/resource.ts'`,
            'packages/contracts/src/resource.ts': `export interface ResourceDriver {}`,
        },
        ({ findings }) => assert.equal(findings.length, 1)
    ));

test('resolved graph rejects a direct self cycle', () =>
    fixture({ 'feature.ts': `export type { T } from './feature.ts'` }, (_boundary, graph) =>
        assert.match(graph.findings[0].reason, /cycle/)
    ));

test('resolved graph rejects indirect type-only alias and re-export cycles', () =>
    fixture(
        {
            'feature.ts': `export type { T } from '@bridge'`,
            'bridge.ts': `export type T = import('./nested/port.ts').T`,
            'nested/port.ts': `import type { T } from '../feature.ts'`,
        },
        (_boundary, graph) => assert.match(graph.findings[0].reason, /cycle/)
    ));

test('resolved graph allows a positive shared-contract diamond', () =>
    fixture(
        {
            'feature.ts': `import './left.ts'; import './right.ts'`,
            'left.ts': `export type { T } from './contracts.ts'`,
            'right.ts': `type T = import('./contracts.ts').T`,
            'contracts.ts': 'export type T = string',
        },
        (_boundary, graph) => {
            assert.equal(graph.findings.length, 0);
            assert.equal(graph.edges.length, 4);
        }
    ));

test('createRequire constructs a resolver rather than loading its base path', () =>
    fixture(
        {
            'feature.ts': `import { createRequire } from 'node:module'; const resolver = createRequire(import.meta.url)`,
        },
        (_boundary, graph) => assert.equal(graph.findings.length, 0)
    ));

test('workspace graph includes disconnected type-only source cycles', () =>
    fixture(
        {
            'feature.ts': 'export {}',
            'packages/a/src/a.ts': `export type { B } from './b.ts'`,
            'packages/a/src/b.ts': `export type B = import('./a.ts').A`,
        },
        (_boundary, _graph, workspace) => assert.match(workspace.findings[0].reason, /cycle/)
    ));

test('workspace graph rejects manifest-only cycles even with no source imports', () =>
    fixture(
        {
            'feature.ts': 'export {}',
            'packages/a/package.json': JSON.stringify({
                name: '@fixture/a',
                dependencies: { '@fixture/b': 'workspace:*' },
            }),
            'packages/b/package.json': JSON.stringify({
                name: '@fixture/b',
                devDependencies: { '@fixture/a': 'workspace:*' },
            }),
        },
        (_boundary, _graph, workspace) =>
            assert.deepEqual(workspace.packageCycles, [['@fixture/a', '@fixture/b', '@fixture/a']])
    ));

test('cycle paths are closed and shared dependencies remain acyclic', () => {
    assert.deepEqual(
        dependencyCycles([
            ['a', 'c'],
            ['b', 'c'],
        ]),
        []
    );
    assert.deepEqual(
        dependencyCycles([
            ['a', 'b'],
            ['b', 'c'],
            ['c', 'a'],
        ]),
        [['a', 'b', 'c', 'a']]
    );
    assert.deepEqual(dependencyCycles([['self', 'self']]), [['self', 'self']]);
});

for (const syntax of [
    'const value: any = 1',
    'const value: unknown = 1',
    'const value = input as string',
    'const value = <string>input',
    'const value = input!',
    'const value = Schema.Unknown',
    'type Value = Schema.AnyNoContext',
    '// @ts-expect-error\nconst value: string = 1',
])
    test(`rejects authored type escape: ${syntax}`, () =>
        fixture({ 'feature.ts': syntax }, (_boundary, _graph, _workspace, types) =>
            assert.ok(types.findings.length > 0)
        ));

test('allows exact generics, safe narrowing and const preservation', () =>
    fixture(
        {
            'feature.ts': `const value = {name:'safe'} as const; const identity = <A>(input:A):A => input; const label = 'unknown';`,
        },
        (_boundary, _graph, _workspace, types) => assert.deepEqual(types.findings, [])
    ));

test('missing declarations fail closed instead of silently skipping unbuilt APIs', () =>
    fixture(
        {
            'feature.ts': 'export {}',
            'packages/a/package.json': JSON.stringify({ exports: { './api': { types: './dist/api.d.ts' } } }),
        },
        (_boundary, _graph, _workspace, _types, declarations, emitted) => {
            assert.equal(declarations.findings[0].reason, 'Missing emitted public declaration');
            assert.equal(emitted.findings[0].reason, 'Missing emitted public declaration');
        }
    ));

test('emitted constructor erasure is rejected even when authored roots are clean', () =>
    fixture(
        {
            'feature.ts': 'export {}',
            'packages/a/package.json': JSON.stringify({ exports: { './api': { types: './dist/api.d.ts' } } }),
            'packages/a/dist/api.d.ts': 'declare const Base: new (...args: any[]) => Error;',
        },
        (_boundary, _graph, _workspace, types, declarations) => {
            assert.deepEqual(types.findings, []);
            assert.equal(declarations.findings[0].reason, 'Erased any/unknown type');
        }
    ));

const declarationPackage = (name) =>
    JSON.stringify({
        name,
        type: 'module',
        exports: {
            './api': {
                '@eventiva/source': './src/api.ts',
                types: './dist/api.d.ts',
                default: './dist/api.js',
            },
        },
    });

for (const [label, declarations, cycle] of [
    [
        'direct',
        { 'api.d.ts': `export type { B } from './b.js'`, 'b.d.ts': `import type { A } from './api.js'` },
        ['api', 'b', 'api'],
    ],
    [
        'transitive type-only',
        {
            'api.d.ts': `export type { A } from './a.js'`,
            'a.d.ts': `export type A = import('./b.js').B`,
            'b.d.ts': `export type { C as B } from './c.js'`,
            'c.d.ts': `import type { A } from './a.js'; export type C = A`,
        },
        ['a', 'b', 'c', 'a'],
    ],
])
    test(`emitted declaration graph rejects ${label} cycles with clean source`, () =>
        fixture(
            {
                'feature.ts': 'export {}',
                'packages/a/package.json': declarationPackage('@eventiva/a'),
                'packages/a/src/api.ts': 'export type A = string',
                ...Object.fromEntries(
                    Object.entries(declarations).map(([path, text]) => [`packages/a/dist/${path}`, text])
                ),
            },
            (_boundary, _graph, workspace, _types, _declarations, emitted) => {
                assert.deepEqual(workspace.findings, []);
                assert.equal(emitted.findings.length, 1);
                assert.match(emitted.findings[0].reason, /cycle/);
                assert.deepEqual(
                    emitted.findings[0].chain,
                    cycle.map((name) => `packages/a/dist/${name}.d.ts`)
                );
            }
        ));

test('emitted declaration resolution follows types instead of the active source condition', () =>
    fixture(
        {
            'tsconfig.base.json': JSON.stringify({
                compilerOptions: {
                    module: 'nodenext',
                    moduleResolution: 'nodenext',
                    customConditions: ['@eventiva/source'],
                },
            }),
            'feature.ts': 'export {}',
            'packages/a/package.json': declarationPackage('@eventiva/a'),
            'packages/b/package.json': declarationPackage('@eventiva/b'),
            'packages/a/src/api.ts': 'export type A = string',
            'packages/b/src/api.ts': 'export type B = number',
            'packages/a/dist/api.d.ts': `export type { B as A } from '@eventiva/b/api'`,
            'packages/b/dist/api.d.ts': `export type B = import('@eventiva/a/api').A`,
        },
        (_boundary, _graph, workspace, _types, _declarations, emitted) => {
            assert.deepEqual(workspace.findings, []);
            assert.equal(emitted.findings.length, 1);
            assert.match(emitted.findings[0].reason, /cycle/);
            assert.deepEqual(emitted.findings[0].chain, [
                'packages/a/dist/api.d.ts',
                'packages/b/dist/api.d.ts',
                'packages/a/dist/api.d.ts',
            ]);
        }
    ));

test('emitted declarations allow a shared-contract diamond through aliases and re-exports', () =>
    fixture(
        {
            'tsconfig.base.json': JSON.stringify({
                compilerOptions: {
                    module: 'nodenext',
                    moduleResolution: 'nodenext',
                    paths: { '@shared': ['./packages/a/dist/shared.d.ts'] },
                },
            }),
            'feature.ts': 'export {}',
            'packages/a/package.json': declarationPackage('@eventiva/a'),
            'packages/a/src/api.ts': 'export type A = string',
            'packages/a/dist/api.d.ts': `export type { Left } from './left.js'; export type { Right } from './right.js'`,
            'packages/a/dist/left.d.ts': `export type { Shared as Left } from '@shared'`,
            'packages/a/dist/right.d.ts': `export type Right = import('@shared').Shared`,
            'packages/a/dist/shared.d.ts': 'export type Shared = string',
        },
        (_boundary, _graph, _workspace, _types, _declarations, emitted) => {
            assert.deepEqual(emitted.findings, []);
            assert.equal(emitted.scanned, 4);
            assert.equal(emitted.edges.length, 4);
        }
    ));

test('emitted declaration aliases cannot silently fall back to source', () =>
    fixture(
        {
            'tsconfig.base.json': JSON.stringify({
                compilerOptions: {
                    module: 'nodenext',
                    moduleResolution: 'nodenext',
                    paths: { '@shared': ['./packages/a/src/api.ts'] },
                },
            }),
            'feature.ts': 'export {}',
            'packages/a/package.json': declarationPackage('@eventiva/a'),
            'packages/a/src/api.ts': 'export type A = string',
            'packages/a/dist/api.d.ts': `export type { A } from '@shared'`,
        },
        (_boundary, _graph, workspace, _types, _declarations, emitted) => {
            assert.deepEqual(workspace.findings, []);
            assert.equal(emitted.findings.length, 1);
            assert.match(emitted.findings[0].reason, /resolves to non-declaration source/);
            assert.deepEqual(emitted.findings[0].chain, ['packages/a/dist/api.d.ts', 'packages/a/src/api.ts']);
        }
    ));

test('unresolved transitive emitted declarations fail closed', () =>
    fixture(
        {
            'feature.ts': 'export {}',
            'packages/a/package.json': declarationPackage('@eventiva/a'),
            'packages/a/src/api.ts': 'export type A = string',
            'packages/a/dist/api.d.ts': `export type { A } from './missing.js'`,
        },
        (_boundary, _graph, _workspace, _types, _declarations, emitted) => {
            assert.equal(emitted.findings.length, 1);
            assert.equal(emitted.findings[0].reason, 'Unresolved workspace dependency: ./missing.js');
        }
    ));

const invocationPath = 'packages/runtime/src/invocation.ts';
const invocationSource = readFileSync(new URL('../../packages/runtime/src/invocation.ts', import.meta.url), 'utf8');
const reflectionFixture = (text, { path = invocationPath, declarations = false } = {}) => {
    const root = mkdtempSync(join(tmpdir(), 'reflection-boundary-'));
    try {
        mkdirSync(dirname(join(root, path)), { recursive: true });
        writeFileSync(join(root, path), text);
        return checkTypeEscapes(root, { entries: [path], declarations });
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
};

test('approves only the real-source private recursive reflection ingress', () => {
    assert.ok(invocationSource.includes('const child: unknown = descriptor.value;'));
    assert.deepEqual(reflectionFixture(invocationSource).findings, []);
});

test('reflection approval ignores comments, not structure', () => {
    const text = invocationSource.replace(
        'const child: unknown',
        '/* reflection ingress */\n            const child: unknown'
    );
    assert.deepEqual(reflectionFixture(text).findings, []);
});

for (const path of ['packages/runtime/src/other.ts', 'packages/contracts/src/invocation.ts', 'feature.ts'])
    test(`reflection approval rejects the same code at ${path}`, () => {
        assert.ok(reflectionFixture(invocationSource, { path }).findings.length > 0);
    });

for (const [label, before, after] of [
    ['any at the approved site', 'child: unknown', 'child: any'],
    ['indexed read/get trap', 'child: unknown = descriptor.value', 'child: unknown = item[key]'],
    [
        'another descriptor origin',
        'Object.getOwnPropertyDescriptor(item, key)',
        'Object.getOwnPropertyDescriptor(other, key)',
    ],
    ['another initializer', 'child: unknown = descriptor.value', 'child: unknown = other'],
    ['moved recursion', 'const encoded = visit(child);', 'const marker = 1; const encoded = visit(child);'],
    ['missing recursion', 'const encoded = visit(child);', "const encoded = Either.right('unsafe');"],
    ['changed validator', 'const encoded = visit(child);', 'const encoded = validate(child);'],
    ['changed recursive argument', 'const encoded = visit(child);', 'const encoded = visit(item);'],
    ['escaped value', 'const encoded = visit(child);', 'leak(child); const encoded = visit(child);'],
    ['alias before validation', 'const encoded = visit(child);', 'const alias = child; const encoded = visit(alias);'],
    ['use after validation', 'const encoded = visit(child);', 'const encoded = visit(child); leak(child);'],
    ['public return', 'const encoded = visit(child);', 'return child;'],
    [
        'missing accessor guard',
        "if (descriptor === undefined || !('value' in descriptor))",
        'if (descriptor === undefined)',
    ],
    ['missing failure propagation', 'if (Either.isLeft(encoded)) return encoded;', ''],
    [
        'changed primitive validation',
        "if (item === null) return Either.right('null');",
        "return Either.right('unsafe');",
    ],
    ['changed cycle validation', 'ancestors.has(item)', 'false'],
    ['reassigned visitor', 'const visit = <Item>', 'let visit = <Item>'],
    ['exported visitor', 'const visit = <Item>', 'export const visit = <Item>'],
    [
        'moved private binding',
        'const child: unknown = descriptor.value;',
        'export const child: unknown = descriptor.value;',
    ],
])
    test(`reflection approval rejects ${label}`, () => {
        assert.ok(invocationSource.includes(before), `real source must contain ${before}`);
        assert.ok(reflectionFixture(invocationSource.replace(before, after)).findings.length > 0);
    });

for (const syntax of [
    'export const exposed: unknown = 1;',
    'export interface Public { value: unknown }',
    'export type Public = unknown;',
    'const privateOther: unknown = 1;',
    'const erased: any = 1;',
])
    test(`reflection approval does not waive another escape: ${syntax}`, () => {
        const findings = reflectionFixture(`${invocationSource}\n${syntax}`).findings;
        assert.equal(findings.length, 1);
        assert.equal(findings[0].reason, 'Erased any/unknown type');
    });

test('declaration mode never approves even the exact reflection implementation', () => {
    assert.equal(reflectionFixture(invocationSource, { declarations: true }).findings.length, 1);
});

test('emitted public unknown remains rejected through manifest declaration discovery', () =>
    fixture(
        {
            'feature.ts': 'export {}',
            'packages/a/package.json': JSON.stringify({ exports: { './api': { types: './dist/api.d.ts' } } }),
            'packages/a/dist/api.d.ts': 'export declare const exposed: unknown;',
        },
        (_boundary, _graph, _workspace, _types, declarations) => {
            assert.equal(declarations.findings.length, 1);
            assert.equal(declarations.findings[0].reason, 'Erased any/unknown type');
        }
    ));

for (const [from, to] of [
    ['contracts', 'runtime'],
    ['runtime', 'integrations/sql'],
    ['integrations/sql', 'runtime'],
])
    test(`resolved graph rejects reverse ${from} -> ${to} edge`, () =>
        fixture(
            {
                'feature.ts': `import './packages/${from}/src/entry.ts'`,
                [`packages/${from}/src/entry.ts`]: `export type T = import('${'../'.repeat(from.split('/').length + 1)}${to}/src/entry.ts').T`,
                [`packages/${to}/src/entry.ts`]: 'export type T = string',
            },
            (_boundary, graph) => assert.match(graph.findings[0].reason, /Reverse package edge/)
        ));
