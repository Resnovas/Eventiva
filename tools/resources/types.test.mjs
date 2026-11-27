/**
 * @file tools/resources/types.test.mjs
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
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const config = ts.readConfigFile(join(root, 'tsconfig.base.json'), ts.sys.readFile).config;
const options = {
    ...ts.parseJsonConfigFileContent(config, ts.sys, root).options,
    composite: false,
    noEmit: true,
    emitDeclarationOnly: false,
    rewriteRelativeImportExtensions: false,
    rootDir: root,
};
const prefix = `import { Effect } from 'effect';
import { declareResource, contributeFields, decodeResource, validateDefinition, type Resources } from ${JSON.stringify(join(root, 'packages/contracts/src/resource.ts'))};
const contact = declareResource({id:'crm.contact',owner:'crm',moduleVersion:'1.0.0',fields:{name:{type:'text',optional:false},seats:{type:'integer',optional:false}}});
declare const resource: Effect.Effect.Success<typeof contact>;
declare const api: Resources['Type'];
void contributeFields; void decodeResource; void validateDefinition;
`;
const cases = [
    [
        'valid typed feature calls and contribution',
        `[api.create(resource,'id',{name:'One',seats:3}), api.query(resource,{where:{field:'seats',equals:4},limit:2}), Effect.map(contributeFields(resource,{owner:'extra',moduleVersion:'1.0.0',fields:{tag:{type:'text',optional:true}}}),r=>api.create(r,'id',{name:'One',seats:3,tag:'extra'}))];`,
        undefined,
    ],
    ['missing required field', `api.create(resource,'id',{name:'One'});`, 2345],
    ['wrong primitive', `api.update(resource,'id',1,{name:false});`, 2322],
    ['unknown query field', `api.query(resource,{where:{field:'missing',equals:4},limit:2});`, 2322],
    ['uncorrelated query value', `api.query(resource,{where:{field:'seats',equals:'four'},limit:2});`, 2322],
    ['SQL escape hatch', `api.sql;`, 2339],
    [
        'partial decoder is not a full record',
        `Effect.map(decodeResource(resource,{},true),value=>{const required:string=value.name;return required;});`,
        2322,
    ],
    ['definition ingress is a concrete declaration', `validateDefinition('not a declaration');`, 2345],
    ['record ingress is a JSON object, not an erased scalar', `decodeResource(resource,7);`, 2345],
    [
        'full decoder preserves required field outputs',
        `Effect.map(decodeResource(resource,{name:'One',seats:3}),value=>{const name:string=value.name;const seats:number=value.seats;return {name,seats};});`,
        undefined,
    ],
];
for (const [name, body, code] of cases)
    test(`resource compiler contract: ${name}`, /** Compile the case against the real contracts and expect its exact diagnostic, or none. */ () => {
        mkdirSync(join(root, '.amp/in'), { recursive: true });
        const directory = mkdtempSync(join(root, '.amp/in/resource-types-'));
        try {
            const path = join(directory, 'case.mts');
            writeFileSync(path, prefix + 'export const result = ' + body);
            const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram([path], options)).filter(
                /**
                 * Keep only errors, ignoring suggestions and messages.
                 *
                 * @param {ts.Diagnostic} diagnostic - One pre-emit diagnostic.
                 * @returns {boolean} Whether it is an error.
                 */
                (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
            );
            assert.equal(
                diagnostics.length,
                code === undefined ? 0 : 1,
                ts.formatDiagnosticsWithColorAndContext(diagnostics, {
                    /**
                     * Report the repository root as the working directory, so paths print relative to it.
                     *
                     * @returns {string} The repository root.
                     */
                    getCurrentDirectory: () => root,
                    /**
                     * Keep file names as given, since the test paths are already canonical.
                     *
                     * @param {string} file - A diagnostic's file name.
                     * @returns {string} The same name.
                     */
                    getCanonicalFileName: (file) => file,
                    /**
                     * Separate formatted diagnostics with a line feed.
                     *
                     * @returns {string} A single newline character.
                     */
                    getNewLine: () => '\n',
                })
            );
            if (code !== undefined) {
                assert.equal(diagnostics[0].code, code);
                assert.equal(diagnostics[0].file.fileName, path);
            }
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    });

/**
 * Assert that TypeScript text has no erased, placeholder or asserted types and no suppression comments.
 *
 * @param {string} path - The file name used to parse the text and label findings.
 * @param {string} text - The TypeScript source or declaration text to audit.
 */
const preciseTypes = (path, text) => {
    const ast = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
    const findings = [];
    /**
     * Record `any`, `unknown`, `object`, `{}`, `Object`, `Function`, casts and non-null assertions below a node.
     *
     * @param {ts.Node} node - The subtree to audit.
     */
    const visit = (node) => {
        if (
            [ts.SyntaxKind.AnyKeyword, ts.SyntaxKind.UnknownKeyword, ts.SyntaxKind.ObjectKeyword].includes(node.kind) ||
            ts.isTypeAssertionExpression(node) ||
            ts.isNonNullExpression(node) ||
            (ts.isAsExpression(node) && node.type.getText(ast) !== 'const') ||
            (ts.isTypeLiteralNode(node) && node.members.length === 0) ||
            (ts.isTypeReferenceNode(node) && ['Object', 'Function'].includes(node.typeName.getText(ast)))
        )
            findings.push(
                `${path}:${ast.getLineAndCharacterOfPosition(node.getStart()).line + 1}: ${node.getText(ast)}`
            );
        ts.forEachChild(node, visit);
    };
    visit(ast);
    assert.doesNotMatch(text, /@ts-(?:ignore|nocheck|expect-error)|eslint-disable|@effect-diagnostics[^\n]*:off/);
    assert.deepEqual(findings, []);
};

test('owned resource TypeScript and emitted contract declarations contain no erasure or unsafe assertions', /** Audit the resource sources and the declaration the contracts module actually emits. */ () => {
    for (const path of [
        'packages/contracts/src/resource.ts',
        'packages/runtime/src/resource.ts',
        'packages/integrations/sql/src/resource.ts',
        'tests/resources/src/resource.spec.ts',
        'tests/resources/src/types.ts',
    ])
        preciseTypes(path, readFileSync(join(root, path), 'utf8'));
    const path = join(root, 'packages/contracts/src/resource.ts');
    const program = ts.createProgram([path], {
        ...options,
        noEmit: false,
        declaration: true,
        emitDeclarationOnly: true,
    });
    assert.equal(ts.getPreEmitDiagnostics(program).length, 0);
    let declarations = 0;
    /**
     * Audit the emitted contracts declaration in memory instead of writing it to disk.
     *
     * @param {string} name - The path the declaration would be written to.
     * @param {string} text - The emitted declaration text.
     */
    const writeFile = (name, text) => {
        if (name.endsWith('/contracts/src/resource.d.ts')) {
            preciseTypes(name, text);
            declarations++;
        }
    };
    const result = program.emit(undefined, writeFile);
    assert.equal(result.emitSkipped, false);
    assert.equal(result.diagnostics.length, 0);
    assert.equal(declarations, 1);
});

test('strict type audit rejects erasure, casts, non-null, placeholders and suppressions', /** Prove the audit fails each unsafe shape and passes a precise one. */ () => {
    for (const source of [
        'type T = any',
        'type T = unknown',
        'type T = object',
        'type T = {}',
        'type T = Object',
        'type T = Function',
        'const x = value as string',
        'const x = value!',
        '// @ts-ignore\nconst x = 1',
    ])
        assert.throws(
            /** Audit one unsafe snippet, which must fail. */ () => {
                preciseTypes('negative.ts', source);
            }
        );
    preciseTypes('positive.ts', 'type T = {readonly value:string}; const x = {value:"one"} as const');
});
