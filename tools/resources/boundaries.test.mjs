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

/**
 * Build a temporary repository from the given files, run every boundary audit over it, hand the results to `run`, then delete it.
 *
 * @param {Record<string, string>} sources - Root-relative file paths and their contents; each named package manifest under `packages` is also linked under `node_modules`.
 * @param {(...results: object[]) => void} run - Receives the source boundary, resource graph, workspace graph, source type, declaration type, emitted graph and emitted boundary results, in that order.
 */
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
            checkWorkspaceGraph(root, { declarations: true }),
            checkResourceBoundaries(root, { declarations: true })
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
    test(`rejects direct/type-graph boundary: ${syntax}`, /** Feed the forbidden syntax to the boundary audit as the only feature file. */ () => {
        fixture(
            { 'feature.ts': syntax },
            /**
             * Expect exactly one boundary violation for the forbidden syntax.
             *
             * @param {object} boundary - The source feature-boundary result for `feature.ts`.
             * @param {object[]} boundary.findings - Its violations, each with a reason and import chain.
             * @returns {void} Nothing; the assertion throws on failure.
             */
            ({ findings }) => assert.equal(findings.length, 1)
        );
    });

test('follows aliases, relative re-exports and type queries transitively', /** Hide a SQL driver type behind a path alias, a relative re-export and a nested import type. */ () => {
    fixture(
        {
            'feature.ts': `export type { Port } from '@bridge'`,
            'bridge.ts': `export type { Port } from './nested/port.ts'`,
            'nested/port.ts': `export type Port = import('pg').Client`,
        },

        /**
         * Expect one violation whose chain runs through the alias, the re-export and the nested type query.
         *
         * @param {object} boundary - The source feature-boundary result for `feature.ts`.
         * @param {object[]} boundary.findings - Its violations, each with a reason and import chain.
         */
        ({ findings }) => {
            assert.equal(findings.length, 1);
            assert.equal(findings[0].chain.length, 4);
        }
    );
});

test('relative paths cannot evade the privileged SQL directory', /** Import the SQL integration through a plain relative path. */ () => {
    fixture(
        {
            'feature.ts': `import './packages/integrations/sql/src/resource.ts'`,
            'packages/integrations/sql/src/resource.ts': 'export {}',
        },

        /**
         * Expect the relative import to be reported as reaching the SQL implementation.
         *
         * @param {object} boundary - The source feature-boundary result for `feature.ts`.
         * @param {object[]} boundary.findings - Its violations, each with a reason and import chain.
         * @returns {void} Nothing; the assertion throws on failure.
         */
        ({ findings }) => assert.match(findings[0].reason, /privileged SQL implementation/)
    );
});

for (const syntax of [
    `import { value } from './externals/upstream/library/src/index.ts'`,
    `export type { Value } from './externals/upstream/library/src/index.ts'`,
    `type Value = import('./externals/upstream/library/src/index.ts').Value`,
    `const value = require('./externals/upstream/library/src/index.ts')`,
    `const value = import('./externals/upstream/library/src/index.ts')`,
    `export type { Value } from '@bridge'`,
])
    test(`rejects reference-only source through the resolved graph: ${syntax}`, /** Reach vendored upstream source directly or through a bridge alias. */ () => {
        fixture(
            {
                'feature.ts': syntax,
                'bridge.ts': `export type { Value } from './externals/upstream/library/src/index.ts'`,
                'externals/upstream/library/src/index.ts': 'export const value = 1; export type Value = number;',
            },

            /**
             * Expect one graph violation and no recorded edge into `externals`.
             *
             * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
             * @param {object} graph - The resource-rooted graph result for `feature.ts`.
             */
            (_boundary, graph) => {
                assert.equal(graph.findings.length, 1);
                assert.match(graph.findings[0].reason, /reference-only upstream source/);
                assert.equal(
                    graph.edges.some(
                        /**
                         * Detect an edge whose target is reference-only upstream source.
                         *
                         * @param {string[]} edge - A `[from, to]` pair of root-relative paths.
                         * @returns {boolean} Whether the target lies under `externals`.
                         */
                        (edge) => edge[1].startsWith('externals/')
                    ),
                    false
                );
            }
        );
    });

test('fails closed on unresolved local types', /** Import a type from a local file that does not exist. */ () => {
    fixture(
        { 'feature.ts': `type T = import('./hidden.ts').Client` },
        /**
         * Expect the unresolved local import type to be reported.
         *
         * @param {object} boundary - The source feature-boundary result for `feature.ts`.
         * @param {object[]} boundary.findings - Its violations, each with a reason and import chain.
         * @returns {void} Nothing; the assertion throws on failure.
         */
        ({ findings }) => assert.match(findings[0].reason, /Unresolved/)
    );
});

test('allows feature contracts and ordinary pure helpers', /** Import Effect and a pure relative helper from the feature. */ () => {
    fixture(
        {
            'feature.ts': `import { Effect } from 'effect'; import './pure.ts'`,
            'pure.ts': `export const name = 'safe'`,
        },

        /**
         * Expect no violations for Effect and a pure relative helper.
         *
         * @param {object} boundary - The source feature-boundary result for `feature.ts`.
         * @param {object[]} boundary.findings - Its violations, each with a reason and import chain.
         * @returns {void} Nothing; the assertion throws on failure.
         */
        ({ findings }) => assert.equal(findings.length, 0)
    );
});

test('allows named feature contracts without exposing the provider namespace', /** Import named public contracts from the resource contract module. */ () => {
    fixture(
        {
            'feature.ts': `import { Resources, declareResource } from './packages/contracts/src/resource.ts'`,
            'packages/contracts/src/resource.ts': `export class Resources {}; export const declareResource = () => 1`,
        },

        /**
         * Expect the named contract imports to pass.
         *
         * @param {object} boundary - The source feature-boundary result for `feature.ts`.
         * @param {object[]} boundary.findings - Its violations, each with a reason and import chain.
         * @returns {void} Nothing; the assertion throws on failure.
         */
        ({ findings }) => assert.equal(findings.length, 0)
    );
});

test('relative type aliases cannot expose the provider port', /** Re-export the provider port under another name through a relative path. */ () => {
    fixture(
        {
            'feature.ts': `export type { ResourceDriver as Driver } from './packages/contracts/src/resource.ts'`,
            'packages/contracts/src/resource.ts': `export interface ResourceDriver {}`,
        },

        /**
         * Expect the aliased `ResourceDriver` re-export to be reported once.
         *
         * @param {object} boundary - The source feature-boundary result for `feature.ts`.
         * @param {object[]} boundary.findings - Its violations, each with a reason and import chain.
         * @returns {void} Nothing; the assertion throws on failure.
         */
        ({ findings }) => assert.equal(findings.length, 1)
    );
});

test('resolved graph rejects a direct self cycle', /** Make the feature re-export a type from itself. */ () => {
    fixture(
        { 'feature.ts': `export type { T } from './feature.ts'` },
        /**
         * Expect the self re-export to be reported as a cycle.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} graph - The resource-rooted graph result for `feature.ts`.
         * @returns {void} Nothing; the assertion throws on failure.
         */
        (_boundary, graph) => assert.match(graph.findings[0].reason, /cycle/)
    );
});

test('resolved graph rejects indirect type-only alias and re-export cycles', /** Close a cycle through an alias, an import type and a type-only import. */ () => {
    fixture(
        {
            'feature.ts': `export type { T } from '@bridge'`,
            'bridge.ts': `export type T = import('./nested/port.ts').T`,
            'nested/port.ts': `import type { T } from '../feature.ts'`,
        },

        /**
         * Expect the type-only loop back to `feature.ts` to be reported as a cycle.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} graph - The resource-rooted graph result for `feature.ts`.
         * @returns {void} Nothing; the assertion throws on failure.
         */
        (_boundary, graph) => assert.match(graph.findings[0].reason, /cycle/)
    );
});

test('resolved graph allows a positive shared-contract diamond', /** Reach one contract module from two branches. */ () => {
    fixture(
        {
            'feature.ts': `import './left.ts'; import './right.ts'`,
            'left.ts': `export type { T } from './contracts.ts'`,
            'right.ts': `type T = import('./contracts.ts').T`,
            'contracts.ts': 'export type T = string',
        },

        /**
         * Expect two paths to one contract to pass with all four edges recorded.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} graph - The resource-rooted graph result for `feature.ts`.
         */
        (_boundary, graph) => {
            assert.equal(graph.findings.length, 0);
            assert.equal(graph.edges.length, 4);
        }
    );
});

test('createRequire constructs a resolver rather than loading its base path', /** Call `createRequire` with the module URL. */ () => {
    fixture(
        {
            'feature.ts': `import { createRequire } from 'node:module'; const resolver = createRequire(import.meta.url)`,
        },

        /**
         * Expect no graph violation for constructing a resolver.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} graph - The resource-rooted graph result for `feature.ts`.
         * @returns {void} Nothing; the assertion throws on failure.
         */
        (_boundary, graph) => assert.equal(graph.findings.length, 0)
    );
});

test('workspace graph includes disconnected type-only source cycles', /** Add a package-internal type cycle that no feature imports. */ () => {
    fixture(
        {
            'feature.ts': 'export {}',
            'packages/a/src/a.ts': `export type { B } from './b.ts'`,
            'packages/a/src/b.ts': `export type B = import('./a.ts').A`,
        },

        /**
         * Expect the disconnected type cycle to be reported by the workspace graph.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
         * @param {object} workspace - The source workspace graph result.
         * @returns {void} Nothing; the assertion throws on failure.
         */
        (_boundary, _graph, workspace) => assert.match(workspace.findings[0].reason, /cycle/)
    );
});

test('workspace graph rejects manifest-only cycles even with no source imports', /** Declare two packages that depend on each other only in their manifests. */ () => {
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

        /**
         * Expect the dependency and devDependency pair to form one closed package cycle.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
         * @param {object} workspace - The source workspace graph result.
         * @returns {void} Nothing; the assertion throws on failure.
         */
        (_boundary, _graph, workspace) =>
            assert.deepEqual(workspace.packageCycles, [['@fixture/a', '@fixture/b', '@fixture/a']])
    );
});

test('cycle paths are closed and shared dependencies remain acyclic', /** Check that cycles repeat their first node and that a diamond or self edge is handled. */ () => {
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
    test(`rejects authored type escape: ${syntax}`, /** Audit the escaping snippet as the only feature file. */ () => {
        fixture(
            { 'feature.ts': syntax },
            /**
             * Expect at least one type-escape finding.
             *
             * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
             * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
             * @param {object} _workspace - The source workspace graph result, unused here.
             * @param {object} types - The type-escape audit of `feature.ts`.
             * @returns {void} Nothing; the assertion throws on failure.
             */
            (_boundary, _graph, _workspace, types) => assert.ok(types.findings.length > 0)
        );
    });

test('allows exact generics, safe narrowing and const preservation', /** Audit a const assertion, a generic identity function and the word unknown in a string. */ () => {
    fixture(
        {
            'feature.ts': `const value = {name:'safe'} as const; const identity = <A>(input:A):A => input; const label = 'unknown';`,
        },

        /**
         * Expect a clean type audit.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
         * @param {object} _workspace - The source workspace graph result, unused here.
         * @param {object} types - The type-escape audit of `feature.ts`.
         * @returns {void} Nothing; the assertion throws on failure.
         */
        (_boundary, _graph, _workspace, types) => assert.deepEqual(types.findings, [])
    );
});

for (const syntax of [
    `import { Schema as S } from 'effect'; export const payload = S.Unknown;`,
    `import { Schema as S } from 'effect'; export const payload = S.Any;`,
    `import * as S from 'effect/Schema'; export const payload = S.Unknown;`,
    `import { Unknown as Payload } from 'effect/Schema'; export { Payload };`,
    `import { Any as Payload } from 'effect/Schema'; export { Payload as Public };`,
    `export { Unknown as Payload } from 'effect/Schema';`,
    `export { Any as Payload } from 'effect/Schema';`,
    `import type { Schema as S } from 'effect'; export type Payload = S.Schema.AnyNoContext;`,
    `import type { Schema as S } from 'effect/Schema'; export type Payload = S.AnyNoContext;`,
    `export type Payload = import('effect/Schema').Schema.AnyNoContext;`,
    `import type { Unknown as Payload } from 'effect/Schema'; export type Public = Payload;`,
    `import * as E from 'effect'; export const payload = E.Schema.Unknown;`,
])
    test(`rejects erased Effect schema aliases in source and declarations: ${syntax}`, /** Audit the erasing schema alias as both authored source and an emitted declaration. */ () => {
        fixture(
            {
                'feature.ts': syntax,
                'packages/a/package.json': JSON.stringify({ exports: { './api': { types: './dist/api.d.ts' } } }),
                'packages/a/dist/api.d.ts': syntax,
            },

            /**
             * Expect both the source and declaration audits to report an erased schema contract.
             *
             * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
             * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
             * @param {object} _workspace - The source workspace graph result, unused here.
             * @param {object} types - The type-escape audit of `feature.ts`.
             * @param {object} declarations - The type-escape audit of every emitted package declaration.
             */
            (_boundary, _graph, _workspace, types, declarations) => {
                for (const result of [types, declarations])
                    assert.ok(
                        result.findings.some(
                            /**
                             * Recognise an erased schema finding.
                             *
                             * @param {object} finding - One type-escape finding.
                             * @param {string} finding.reason - Why it was reported.
                             * @returns {boolean} Whether it is `Erased schema contract`.
                             */
                            ({ reason }) => reason === 'Erased schema contract'
                        )
                    );
            }
        );
    });

for (const syntax of [
    `import { Schema as S } from 'effect'; export const payload = S.Struct({ name: S.String, count: S.Number }); export type Payload = typeof payload.Type;`,
    `import { String as Text } from 'effect/Schema'; export { Text };`,
    `import { Unknown as Payload, Any } from './application.js'; export { Payload, Any };`,
    `export { Unknown, Any, AnyNoContext } from './application.js';`,
    `const Schema = { Unknown: 'domain', Any: 2, AnyNoContext: true }; export const payload = Schema.Unknown;`,
    `import { Schema as S } from 'effect'; function read(S: { Unknown: string }) { return S.Unknown; } export { read };`,
    `import { Unknown as Payload } from 'effect/Schema'; function read(Payload: string) { return Payload; } export { read };`,
    `import { Schema as S } from 'effect'; namespace Domain { export namespace S { export type AnyNoContext = string; } export type Payload = S.AnyNoContext; }`,
    `import { Schema as S } from 'effect'; const domain = { S: { Unknown: 'domain' } }; export const payload = domain.S.Unknown;`,
])
    test(`allows typed schemas, unrelated names and lexical shadows: ${syntax}`, /** Audit the safe snippet as both authored source and an emitted declaration, beside a same-named domain module. */ () => {
        fixture(
            {
                'feature.ts': syntax,
                'application.ts': `export const Unknown = 'domain'; export const Any = 2; export type AnyNoContext = string;`,
                'packages/a/package.json': JSON.stringify({ exports: { './api': { types: './dist/api.d.ts' } } }),
                'packages/a/dist/api.d.ts': syntax,
            },

            /**
             * Expect both the source and declaration audits to stay clean.
             *
             * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
             * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
             * @param {object} _workspace - The source workspace graph result, unused here.
             * @param {object} types - The type-escape audit of `feature.ts`.
             * @param {object} declarations - The type-escape audit of every emitted package declaration.
             */
            (_boundary, _graph, _workspace, types, declarations) => {
                assert.deepEqual(types.findings, []);
                assert.deepEqual(declarations.findings, []);
            }
        );
    });

test('missing declarations fail closed instead of silently skipping unbuilt APIs', /** Declare a package export whose declaration file was never emitted. */ () => {
    fixture(
        {
            'feature.ts': 'export {}',
            'packages/a/package.json': JSON.stringify({ exports: { './api': { types: './dist/api.d.ts' } } }),
        },

        /**
         * Expect the declaration type audit and the emitted graph to report the missing declaration.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
         * @param {object} _workspace - The source workspace graph result, unused here.
         * @param {object} _types - The type-escape audit of `feature.ts`, unused here.
         * @param {object} declarations - The type-escape audit of every emitted package declaration.
         * @param {object} emitted - The emitted-declaration workspace graph result.
         */
        (_boundary, _graph, _workspace, _types, declarations, emitted) => {
            assert.equal(declarations.findings[0].reason, 'Missing emitted public declaration');
            assert.equal(emitted.findings[0].reason, 'Missing emitted public declaration');
        }
    );
});

test('emitted constructor erasure is rejected even when authored roots are clean', /** Emit an `any` constructor declaration while the authored feature stays clean. */ () => {
    fixture(
        {
            'feature.ts': 'export {}',
            'packages/a/package.json': JSON.stringify({ exports: { './api': { types: './dist/api.d.ts' } } }),
            'packages/a/dist/api.d.ts': 'declare const Base: new (...args: any[]) => Error;',
        },

        /**
         * Expect only the declaration audit to catch the emitted `any`.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
         * @param {object} _workspace - The source workspace graph result, unused here.
         * @param {object} types - The type-escape audit of `feature.ts`.
         * @param {object} declarations - The type-escape audit of every emitted package declaration.
         */
        (_boundary, _graph, _workspace, types, declarations) => {
            assert.deepEqual(types.findings, []);
            assert.equal(declarations.findings[0].reason, 'Erased any/unknown type');
        }
    );
});

/**
 * Write a package manifest whose `./api` export has source, types and default conditions.
 *
 * @param {string} name - The scoped name the manifest declares, such as `@eventiva/a`.
 * @returns {string} The manifest as JSON text.
 */
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

for (const [label, entry, bridge] of [
    [
        'direct re-export',
        /**
         * Re-export the client type straight from the dependency.
         *
         * @param {string} name - The dependency specifier.
         * @returns {string} The `api.d.ts` text.
         */
        (name) => `export type { Client } from '${name}'`,
        false,
    ],
    [
        'import-type',
        /**
         * Read the client type through an import type of the dependency.
         *
         * @param {string} name - The dependency specifier.
         * @returns {string} The `api.d.ts` text.
         */
        (name) => `export type Client = import('${name}').Client`,
        false,
    ],
    [
        'relative transitive',
        /**
         * Reach the dependency through the relative bridge declaration.
         *
         * @returns {string} The `api.d.ts` text.
         */
        () => `export type { Client } from './bridge.js'`,
        true,
    ],
    [
        'path-alias transitive',
        /**
         * Reach the dependency through the path alias to the second package.
         *
         * @returns {string} The `api.d.ts` text.
         */
        () => `export type Client = import('@bridge').Client`,
        true,
    ],
    [
        'package types-condition transitive',
        /**
         * Reach the dependency through the second package's `types` export condition.
         *
         * @returns {string} The `api.d.ts` text.
         */
        () => `export type { Client } from '@eventiva/b/api'`,
        true,
    ],
])
    for (const sql of [true, false])
        test(`emitted feature SQL ${sql ? 'rejects' : 'allows legal control for'} ${label}`, /** Build two packages whose emitted declarations reach either `pg` or a safe local file. */ () => {
            const dependency = sql ? 'pg' : './safe.js';
            fixture(
                {
                    'tsconfig.base.json': JSON.stringify({
                        compilerOptions: {
                            module: 'nodenext',
                            moduleResolution: 'nodenext',
                            customConditions: ['@eventiva/source'],
                            paths: { '@bridge': ['./packages/b/dist/api.d.ts'] },
                        },
                    }),
                    'feature.ts': 'export {}',
                    'packages/a/project.json': JSON.stringify({ tags: ['type:extension'] }),
                    'packages/a/package.json': declarationPackage('@eventiva/a'),
                    'packages/a/src/api.ts': 'export type Client = string',
                    'packages/a/dist/api.d.ts': entry(dependency),
                    'packages/a/dist/bridge.d.ts': `export type { Client } from '${dependency}'`,
                    'packages/a/dist/safe.d.ts': 'export type Client = string',
                    'packages/b/package.json': declarationPackage('@eventiva/b'),
                    'packages/b/src/api.ts': 'export type Client = string',
                    'packages/b/dist/api.d.ts': `export type { Client } from '${dependency}'`,
                    'packages/b/dist/safe.d.ts': 'export type Client = string',
                    'node_modules/pg/package.json': JSON.stringify({ name: 'pg', types: './index.d.ts' }),
                    'node_modules/pg/index.d.ts': 'export type Client = unknown',
                },

                /**
                 * Expect the source graphs to stay clean and only the emitted feature audit to report `pg`, with the full chain.
                 *
                 * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
                 * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
                 * @param {object} workspace - The source workspace graph result.
                 * @param {object} _types - The type-escape audit of `feature.ts`, unused here.
                 * @param {object} _declarations - The type-escape audit of every emitted package declaration, unused here.
                 * @param {object} emitted - The emitted-declaration workspace graph result.
                 * @param {object} resources - The emitted feature-boundary result.
                 */
                (_boundary, _graph, workspace, _types, _declarations, emitted, resources) => {
                    assert.deepEqual(workspace.findings, []);
                    assert.deepEqual(emitted.findings, []);
                    assert.equal(resources.scanned, 1);
                    if (!sql) {
                        assert.deepEqual(resources.findings, []);
                        return;
                    }
                    assert.equal(resources.findings.length, 1);
                    assert.equal(resources.findings[0].reason, 'Feature reaches privileged dependency: pg');
                    assert.equal(resources.findings[0].chain.length, bridge ? 3 : 2);
                    assert.equal(resources.findings[0].chain.at(-1), 'pg');
                }
            );
        });

for (const erased of ['any', 'unknown'])
    for (const firstParty of [true, false])
        test(`emitted type closure ${firstParty ? 'rejects owned' : 'does not police third-party'} ${erased}`, /** Route an erased type to an owned declaration or a vendor declaration. */ () => {
            fixture(
                {
                    'tsconfig.base.json': JSON.stringify({
                        compilerOptions: {
                            module: 'nodenext',
                            moduleResolution: 'nodenext',
                            paths: { '@bridge': ['./packages/b/dist/hidden.d.ts'] },
                        },
                    }),
                    'feature.ts': 'export {}',
                    'packages/a/package.json': declarationPackage('@eventiva/a'),
                    'packages/a/src/api.ts': 'export type Value = string',
                    'packages/a/dist/api.d.ts': `export type { Value } from './bridge.js'`,
                    'packages/a/dist/bridge.d.ts': `export type Value = import('${firstParty ? '@bridge' : 'vendor'}').Value`,
                    'packages/b/dist/hidden.d.ts': `export type Value = ${erased}`,
                    'node_modules/vendor/package.json': JSON.stringify({ name: 'vendor', types: './index.d.ts' }),
                    'node_modules/vendor/index.d.ts': `export type Value = ${erased}`,
                },

                /**
                 * Expect the owned erasure to be reported at its file and line and the vendor one to be ignored.
                 *
                 * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
                 * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
                 * @param {object} _workspace - The source workspace graph result, unused here.
                 * @param {object} _types - The type-escape audit of `feature.ts`, unused here.
                 * @param {object} declarations - The type-escape audit of every emitted package declaration.
                 * @param {object} emitted - The emitted-declaration workspace graph result.
                 */
                (_boundary, _graph, _workspace, _types, declarations, emitted) => {
                    assert.deepEqual(emitted.findings, []);
                    assert.deepEqual(
                        declarations.findings,
                        firstParty
                            ? [{ path: 'packages/b/dist/hidden.d.ts', line: 1, reason: 'Erased any/unknown type' }]
                            : []
                    );
                }
            );
        });

test('type auditing leaves reference-only dependency declarations to the graph boundary', /** Import a type from a vendored upstream declaration under `externals`. */ () => {
    fixture(
        {
            'feature.ts': 'export {}',
            'packages/a/package.json': declarationPackage('@eventiva/a'),
            'packages/a/src/api.ts': 'export type Value = string',
            'packages/a/dist/api.d.ts': `export type Value = import('../../../externals/vendor/api.d.ts').Value`,
            'externals/vendor/api.d.ts': 'export type Value = unknown',
        },

        /**
         * Expect the type audit to skip the vendored file and the emitted graph to report it.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
         * @param {object} _workspace - The source workspace graph result, unused here.
         * @param {object} _types - The type-escape audit of `feature.ts`, unused here.
         * @param {object} declarations - The type-escape audit of every emitted package declaration.
         * @param {object} emitted - The emitted-declaration workspace graph result.
         */
        (_boundary, _graph, _workspace, _types, declarations, emitted) => {
            assert.deepEqual(declarations.findings, []);
            assert.equal(declarations.scanned, 1);
            assert.equal(emitted.findings.length, 1);
            assert.match(emitted.findings[0].reason, /reference-only upstream source/);
        }
    );
});

test('workspace package symlinks do not turn owned declarations into vendor exemptions', /** Reach an owned declaration through a workspace package symlink with symlinks preserved. */ () => {
    fixture(
        {
            'tsconfig.base.json': JSON.stringify({
                compilerOptions: { module: 'nodenext', moduleResolution: 'nodenext', preserveSymlinks: true },
            }),
            'feature.ts': 'export {}',
            'packages/a/package.json': declarationPackage('@eventiva/a'),
            'packages/a/src/api.ts': 'export type Value = string',
            'packages/a/dist/api.d.ts': `export type Value = import('@eventiva/b/hidden').Value`,
            'packages/b/package.json': JSON.stringify({
                name: '@eventiva/b',
                type: 'module',
                exports: { './hidden': { default: './dist/hidden.d.ts' } },
            }),
            'packages/b/dist/hidden.d.ts': 'export type Value = unknown',
        },

        /**
         * Expect the symlinked declaration to be audited as owned.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
         * @param {object} _workspace - The source workspace graph result, unused here.
         * @param {object} _types - The type-escape audit of `feature.ts`, unused here.
         * @param {object} declarations - The type-escape audit of every emitted package declaration.
         * @param {object} emitted - The emitted-declaration workspace graph result.
         */
        (_boundary, _graph, _workspace, _types, declarations, emitted) => {
            assert.deepEqual(emitted.findings, []);
            assert.deepEqual(declarations.findings, [
                { path: 'packages/b/dist/hidden.d.ts', line: 1, reason: 'Erased any/unknown type' },
            ]);
        }
    );
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
    test(`emitted declaration graph rejects ${label} cycles with clean source`, /** Emit only the cyclic declarations while the source stays acyclic. */ () => {
        fixture(
            {
                'feature.ts': 'export {}',
                'packages/a/package.json': declarationPackage('@eventiva/a'),
                'packages/a/src/api.ts': 'export type A = string',
                ...Object.fromEntries(
                    Object.entries(declarations).map(
                        /**
                         * Place one declaration under the package's `dist` directory.
                         *
                         * @param {string[]} entry - A `[file, text]` pair.
                         * @returns {string[]} The fixture path and text.
                         */
                        (entry) => [`packages/a/dist/${entry[0]}`, entry[1]]
                    )
                ),
            },

            /**
             * Expect only the emitted graph to report the cycle, with the declaration chain.
             *
             * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
             * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
             * @param {object} workspace - The source workspace graph result.
             * @param {object} _types - The type-escape audit of `feature.ts`, unused here.
             * @param {object} _declarations - The type-escape audit of every emitted package declaration, unused here.
             * @param {object} emitted - The emitted-declaration workspace graph result.
             */
            (_boundary, _graph, workspace, _types, _declarations, emitted) => {
                assert.deepEqual(workspace.findings, []);
                assert.equal(emitted.findings.length, 1);
                assert.match(emitted.findings[0].reason, /cycle/);
                assert.deepEqual(
                    emitted.findings[0].chain,
                    cycle.map(
                        /**
                         * Expand a short declaration name to its fixture path.
                         *
                         * @param {string} name - The file name without `.d.ts`.
                         * @returns {string} The root-relative declaration path.
                         */
                        (name) => `packages/a/dist/${name}.d.ts`
                    )
                );
            }
        );
    });

test('emitted declaration resolution follows types instead of the active source condition', /** Emit declarations that cycle only when the source condition is ignored. */ () => {
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

        /**
         * Expect the emitted graph, not the source graph, to report the cycle.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
         * @param {object} workspace - The source workspace graph result.
         * @param {object} _types - The type-escape audit of `feature.ts`, unused here.
         * @param {object} _declarations - The type-escape audit of every emitted package declaration, unused here.
         * @param {object} emitted - The emitted-declaration workspace graph result.
         */
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
    );
});

test('emitted declarations allow a shared-contract diamond through aliases and re-exports', /** Reach one shared declaration through an alias re-export and an alias import type. */ () => {
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

        /**
         * Expect the diamond to pass with four files and four edges.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
         * @param {object} _workspace - The source workspace graph result, unused here.
         * @param {object} _types - The type-escape audit of `feature.ts`, unused here.
         * @param {object} _declarations - The type-escape audit of every emitted package declaration, unused here.
         * @param {object} emitted - The emitted-declaration workspace graph result.
         */
        (_boundary, _graph, _workspace, _types, _declarations, emitted) => {
            assert.deepEqual(emitted.findings, []);
            assert.equal(emitted.scanned, 4);
            assert.equal(emitted.edges.length, 4);
        }
    );
});

test('emitted declaration aliases cannot silently fall back to source', /** Point a path alias in a declaration at authored source. */ () => {
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

        /**
         * Expect the emitted graph to report the fallback to source.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
         * @param {object} workspace - The source workspace graph result.
         * @param {object} _types - The type-escape audit of `feature.ts`, unused here.
         * @param {object} _declarations - The type-escape audit of every emitted package declaration, unused here.
         * @param {object} emitted - The emitted-declaration workspace graph result.
         */
        (_boundary, _graph, workspace, _types, _declarations, emitted) => {
            assert.deepEqual(workspace.findings, []);
            assert.equal(emitted.findings.length, 1);
            assert.match(emitted.findings[0].reason, /resolves to non-declaration source/);
            assert.deepEqual(emitted.findings[0].chain, ['packages/a/dist/api.d.ts', 'packages/a/src/api.ts']);
        }
    );
});

test('unresolved transitive emitted declarations fail closed', /** Re-export a type from a declaration that does not exist. */ () => {
    fixture(
        {
            'feature.ts': 'export {}',
            'packages/a/package.json': declarationPackage('@eventiva/a'),
            'packages/a/src/api.ts': 'export type A = string',
            'packages/a/dist/api.d.ts': `export type { A } from './missing.js'`,
        },

        /**
         * Expect the missing relative declaration to be reported as unresolved.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
         * @param {object} _workspace - The source workspace graph result, unused here.
         * @param {object} _types - The type-escape audit of `feature.ts`, unused here.
         * @param {object} _declarations - The type-escape audit of every emitted package declaration, unused here.
         * @param {object} emitted - The emitted-declaration workspace graph result.
         */
        (_boundary, _graph, _workspace, _types, _declarations, emitted) => {
            assert.equal(emitted.findings.length, 1);
            assert.equal(emitted.findings[0].reason, 'Unresolved workspace dependency: ./missing.js');
        }
    );
});

const invocationPath = 'packages/runtime/src/invocation.ts';
const invocationSource = readFileSync(new URL('../../packages/runtime/src/invocation.ts', import.meta.url), 'utf8');
/**
 * Write one file into a temporary repository and run the type-escape audit over it alone.
 *
 * @param {string} text - The TypeScript text to audit.
 * @param {object} [options] - Where to place the file and how to audit it.
 * @param {string} [options.path] - The root-relative path; defaults to the runtime invocation module, the only approved location.
 * @param {boolean} [options.declarations] - Audit in declaration mode, where no reflection approval applies.
 * @returns {{ scanned: number, findings: object[] }} The audit result.
 */
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

test('approves only the real-source private recursive reflection ingress', /** Confirm the real invocation module carries the approved binding and passes the audit. */ () => {
    assert.ok(invocationSource.includes('const child: unknown = descriptor.value;'));
    assert.deepEqual(reflectionFixture(invocationSource).findings, []);
});

test('reflection approval ignores comments, not structure', /** Insert a comment before the approved binding and expect the fingerprint to still match. */ () => {
    const text = invocationSource.replace(
        'const child: unknown',
        '/* reflection ingress */\n            const child: unknown'
    );
    assert.deepEqual(reflectionFixture(text).findings, []);
});

for (const path of ['packages/runtime/src/other.ts', 'packages/contracts/src/invocation.ts', 'feature.ts'])
    test(`reflection approval rejects the same code at ${path}`, /** Move the exact approved source to another path and expect a finding. */ () => {
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
    test(`reflection approval rejects ${label}`, /** Apply one structural mutation to the real source and expect the approval to be withdrawn. */ () => {
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
    test(`reflection approval does not waive another escape: ${syntax}`, /** Append another escape and expect exactly that one to be reported. */ () => {
        const findings = reflectionFixture(`${invocationSource}\n${syntax}`).findings;
        assert.equal(findings.length, 1);
        assert.equal(findings[0].reason, 'Erased any/unknown type');
    });

test('declaration mode never approves even the exact reflection implementation', /** Audit the approved source in declaration mode and expect its `unknown` to be reported. */ () => {
    assert.equal(reflectionFixture(invocationSource, { declarations: true }).findings.length, 1);
});

test('emitted public unknown remains rejected through manifest declaration discovery', /** Emit a public `unknown` declaration found only through a manifest export. */ () => {
    fixture(
        {
            'feature.ts': 'export {}',
            'packages/a/package.json': JSON.stringify({ exports: { './api': { types: './dist/api.d.ts' } } }),
            'packages/a/dist/api.d.ts': 'export declare const exposed: unknown;',
        },

        /**
         * Expect exactly one erased type finding in the declaration audit.
         *
         * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
         * @param {object} _graph - The resource-rooted graph result for `feature.ts`, unused here.
         * @param {object} _workspace - The source workspace graph result, unused here.
         * @param {object} _types - The type-escape audit of `feature.ts`, unused here.
         * @param {object} declarations - The type-escape audit of every emitted package declaration.
         */
        (_boundary, _graph, _workspace, _types, declarations) => {
            assert.equal(declarations.findings.length, 1);
            assert.equal(declarations.findings[0].reason, 'Erased any/unknown type');
        }
    );
});

for (const [from, to] of [
    ['contracts', 'runtime'],
    ['runtime', 'integrations/sql'],
    ['integrations/sql', 'runtime'],
])
    test(`resolved graph rejects reverse ${from} -> ${to} edge`, /** Make one resource package import a type from a package it must not depend on. */ () => {
        fixture(
            {
                'feature.ts': `import './packages/${from}/src/entry.ts'`,
                [`packages/${from}/src/entry.ts`]: `export type T = import('${'../'.repeat(from.split('/').length + 1)}${to}/src/entry.ts').T`,
                [`packages/${to}/src/entry.ts`]: 'export type T = string',
            },

            /**
             * Expect the edge to be reported as a reverse package edge.
             *
             * @param {object} _boundary - The source feature-boundary result for `feature.ts`, unused here.
             * @param {object} graph - The resource-rooted graph result for `feature.ts`.
             * @returns {void} Nothing; the assertion throws on failure.
             */
            (_boundary, graph) => assert.match(graph.findings[0].reason, /Reverse package edge/)
        );
    });
