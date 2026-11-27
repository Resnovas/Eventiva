/**
 * @file eslint.config.mjs
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

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import nx from '@nx/eslint-plugin';
import prettier from 'eslint-config-prettier';
import formatjs from 'eslint-plugin-formatjs';
import jsdoc from 'eslint-plugin-jsdoc';
import reactHooks from 'eslint-plugin-react-hooks';
import { noInlineCommentsRule } from './tools/comments/no-inline-comments.mjs';

const typeConstraints = [
    { sourceTag: 'type:core', onlyDependOnLibsWithTags: ['type:core'] },
    { sourceTag: 'type:shared', onlyDependOnLibsWithTags: ['type:core', 'type:shared'] },
    { sourceTag: 'type:runtime', onlyDependOnLibsWithTags: ['type:core', 'type:shared', 'type:runtime'] },
    { sourceTag: 'type:integration', onlyDependOnLibsWithTags: ['type:core', 'type:shared', 'type:integration'] },
    { sourceTag: 'type:extension', onlyDependOnLibsWithTags: ['type:core', 'type:shared', 'type:extension'] },
    {
        sourceTag: 'type:platform',
        onlyDependOnLibsWithTags: ['type:core', 'type:shared', 'type:runtime', 'type:integration', 'type:extension'],
    },
    { sourceTag: 'type:test', onlyDependOnLibsWithTags: ['*'] },
];

const capabilityConstraints = [
    { sourceTag: 'capability:contracts', onlyDependOnLibsWithTags: ['capability:contracts'] },
    { sourceTag: 'capability:schema', onlyDependOnLibsWithTags: ['capability:contracts', 'capability:schema'] },
    {
        sourceTag: 'capability:actions',
        onlyDependOnLibsWithTags: ['capability:contracts', 'capability:schema', 'capability:actions'],
    },
    { sourceTag: 'capability:flags', onlyDependOnLibsWithTags: ['capability:contracts', 'capability:flags'] },
    { sourceTag: 'capability:i18n', onlyDependOnLibsWithTags: ['capability:contracts', 'capability:i18n'] },
];

const serverOnly = [
    '@effect/platform-node',
    '@effect/platform-node-shared',
    '@effect/cluster',
    '@effect/sql',
    '@effect/sql-*',
    '@effect/workflow',
    '@effect/experimental',
    '@effect/rpc',
    '@effect/opentelemetry',
    '@openfeature/server-sdk',
    '@posthog/openfeature-node-provider',
    'posthog-node',
    'pg',
    'postgres',
    'mysql2',
    'better-sqlite3',
    'drizzle-orm',
    'drizzle-orm/*',
];

const layerConstraints = [
    { sourceTag: 'layer:shared', onlyDependOnLibsWithTags: ['layer:shared'], bannedExternalImports: serverOnly },
    {
        sourceTag: 'layer:frontend',
        onlyDependOnLibsWithTags: ['layer:frontend', 'layer:shared'],
        bannedExternalImports: serverOnly,
    },
    { sourceTag: 'layer:backend', onlyDependOnLibsWithTags: ['layer:backend', 'layer:shared'] },
    {
        sourceTag: 'layer:test',
        onlyDependOnLibsWithTags: ['layer:frontend', 'layer:backend', 'layer:shared', 'layer:test'],
    },
];

const portableOnly = [
    { sourceTag: 'type:core', allowedExternalImports: ['effect', 'effect/*'] },
    { sourceTag: 'type:shared', allowedExternalImports: ['effect', 'effect/*'] },
    { sourceTag: 'capability:actions', allowedExternalImports: ['effect', 'effect/*'] },
];

const nodeGlobals = ['process', 'Buffer', 'require', 'module', 'global', '__dirname', '__filename', 'setImmediate'].map(
    /**
     * Direct portable callers to inject the host capability instead.
     *
     * @param name - Node global unavailable on other hosts.
     * @returns The restricted-global entry ESLint reports at the use site.
     */
    (name) => ({ name, message: 'Portable code runs on Hermes and in browsers: take this from a service.' })
);
const nodeBuiltins = [
    ...new Set(
        builtinModules.flatMap(
            /**
             * Cover both spellings of a built-in when restricting imports.
             *
             * @param name - Module identifier supplied by the installed Node runtime.
             * @returns The bare and protocol-prefixed identifiers.
             */
            (name) => [name.replace(/^node:/, ''), `node:${name.replace(/^node:/, '')}`]
        )
    ),
];

const root = dirname(fileURLToPath(import.meta.url));
const skip = new Set(['node_modules', 'dist', '.git', '.nx', 'examples', 'graphify-out', 'test-output', '.expo']);
const projects = [];
/**
 * Collect workspace-relative project roots and their declared tags, excluding generated trees.
 *
 * @param dir - Directory to scan for Nx project manifests.
 */
const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
        if (skip.has(entry)) continue;
        const path = join(dir, entry);
        if (entry === 'project.json') {
            const { tags = [] } = JSON.parse(readFileSync(path, 'utf8'));
            projects.push({ root: relative(root, dir), tags });
        } else if (statSync(path).isDirectory()) walk(path);
    }
};
for (const top of ['apps', 'packages', 'tests']) walk(join(root, top));
/**
 * Scope a lint rule to projects carrying at least one requested tag.
 *
 * @param tags - Alternative Nx tags, not a required combination.
 * @returns TypeScript source globs relative to the workspace.
 */
const filesTagged = (...tags) =>
    projects
        .filter(
            /**
             * Include a project only when its manifest opts into this restriction.
             *
             * @param project - Root and tags read from one manifest.
             * @returns Whether any requested tag applies.
             */
            (project) =>
                tags.some(
                    /**
                     * Compare complete Nx labels without matching prefixes.
                     *
                     * @param tag - One alternative requested by the rule.
                     * @returns Whether the manifest declares this label.
                     */
                    (tag) => project.tags.includes(tag)
                )
        )
        .map(
            /**
             * Include source and configuration TypeScript beneath the matched root.
             *
             * @param project - Manifest selected by its tags.
             * @returns The flat-config files pattern for this project.
             */
            (project) => `${project.root}/**/*.{ts,tsx,mts}`
        );
const portableFiles = filesTagged('layer:shared', 'layer:frontend');
const runtimeFiles = filesTagged('capability:actions');

const reactLifecycleMessage =
    'Initialize app-owned services in bootstrap before rendering product content. Derive render state or update its owner from events; use named React imports, never useEffect.';
const reactLifecycleRestriction = {
    name: 'react',
    importNames: ['useEffect', 'default'],
    message: reactLifecycleMessage,
};
const reactDynamicRestriction = {
    selector: 'ImportExpression[source.value="react"]',
    message: reactLifecycleMessage,
};
const noEmptyCatchRestriction = {
    selector: 'CatchClause > BlockStatement[body.length=0]',
    message:
        'Do not swallow errors in an empty catch block. Handle the specific expected error code (for example ENOENT or EBADF) and rethrow all other errors.',
};
const noPositionalUnionMemberIndexRestriction = {
    selector:
        'MemberExpression[computed=true][property.type="Literal"][property.raw=/^[0-9]+$/][object.type="MemberExpression"][object.computed=false][object.property.name="members"]',
    message:
        'Do not index Schema.Union.members by numeric position. Extract named schema constants and reference them directly in both unions.',
};
const baseSyntaxRestrictions = [reactDynamicRestriction, noEmptyCatchRestriction];

const noZeroDelayUiTimer = {
    meta: {
        type: 'problem',
        schema: [],
        messages: {
            stateOwner:
                'Do not defer UI state with a zero-delay timer. Keep state in one owner and update it from the event; use scoped Effect scheduling for genuine timed work.',
        },
    },
    /**
     * Check timer calls against their lexical bindings so local substitutes are not flagged.
     *
     * @param context - ESLint rule context for this source file.
     * @returns The call visitor used during traversal.
     */
    create(context) {
        return {
            /**
             * Report global timeouts with an omitted delay or literal zero.
             *
             * @param node - Call whose arguments and callee can establish the violation.
             */
            CallExpression(node) {
                if (
                    node.arguments.some(
                        /**
                         * Identify calls whose effective delay cannot be located by argument position.
                         *
                         * @param argument - One syntactic argument of the timer candidate.
                         * @returns Whether it expands an iterable at runtime.
                         */
                        (argument) => argument.type === 'SpreadElement'
                    )
                )
                    return;
                const delay = node.arguments[1];
                const literal =
                    delay?.type === 'UnaryExpression' && ['-', '+'].includes(delay.operator) ? delay.argument : delay;
                if (node.arguments.length !== 1 && !(literal?.type === 'Literal' && literal.value === 0)) return;
                const callee = node.callee;
                let global;
                if (callee.type === 'Identifier' && callee.name === 'setTimeout') global = callee;
                else if (
                    callee.type === 'MemberExpression' &&
                    callee.object.type === 'Identifier' &&
                    ['globalThis', 'window', 'self'].includes(callee.object.name) &&
                    ((!callee.computed &&
                        callee.property.type === 'Identifier' &&
                        callee.property.name === 'setTimeout') ||
                        (callee.computed &&
                            callee.property.type === 'Literal' &&
                            callee.property.value === 'setTimeout'))
                )
                    global = callee.object;
                if (!global) return;
                const reference = context.sourceCode.getScope(node).references.find(
                    /**
                     * Locate the binding for this occurrence rather than matching identifier text.
                     *
                     * @param entry - Reference recorded by ESLint for the current scope.
                     * @returns Whether it describes the exact callee or receiver under inspection.
                     */
                    (entry) => entry.identifier === global
                );
                if (reference?.resolved?.defs.length) return;
                context.report({ node, messageId: 'stateOwner' });
            },
        };
    },
};

const eventivaPlugin = {
    rules: {
        'no-zero-delay-ui-timer': noZeroDelayUiTimer,
        'no-inline-comments': noInlineCommentsRule,
    },
};

const jsdocAdoptedFiles = [
    'eslint.config.mjs',
    'vitest.shared.ts',
    'apps/client/**/*.{ts,tsx,mts,js}',
    'apps/client-e2e/**/*.{ts,mts}',
    'packages/integrations/*/src/**/*.{ts,tsx}',
    'packages/schema/src/**/*.ts',
    'packages/ui-modules/src/**/*.{ts,tsx}',
    'tests/boundaries/{src/**/*.ts,vitest.config.mts}',
    'tests/contracts/{src/**/*.ts,vitest.config.mts}',
    'tests/resources/{src/**/*.ts,vitest.config.mts}',
    'tests/schema/**/*.{ts,mts}',
    'tests/telemetry/{src/**/*.ts,fixtures/**/*.mjs,vitest.config.mts}',
    'tests/ui-modules/{src/**/*.{ts,tsx},vitest.config.mts}',
    'tools/comments/**/*.mjs',
    'tools/documentation/**/*.mjs',
    'tools/function-telemetry/**/*.mjs',
    'tools/references/**/*.mjs',
    'tools/resources/**/*.mjs',
    'tools/test/**/*.ts',
    'tools/test-process/**/*.mjs',
    'tools/toolchain/**/*.mjs',
    'tools/verification/**/*.mjs',
];
const effectGenCallback =
    'CallExpression[callee.type="MemberExpression"][callee.object.name="Effect"][callee.property.name="gen"] > FunctionExpression';
const permissionPattern = '/^[a-z][a-z0-9-]*(\\.[a-z0-9-]+)+(\\s|$)/';
const contractComment = { context: 'any', comment: 'JsdocBlock:not(:has(JsdocTag[tag="file"]))' };
const bannedJsdocTags = [
    {
        comment: 'JsdocBlock:not(:has(JsdocTag[tag="since"]))',
        context: 'ExportNamedDeclaration[declaration]',
        message: 'Record when this export arrived with @since <package version>.',
    },
    {
        comment: 'JsdocBlock:has(JsdocTag[tag=/^(throws|exception)$/])',
        context: 'any',
        message:
            'Do not use @throws or @exception. Effect code never throws: document each typed failure in the Effect error channel with @fails {ErrorTag} and when it happens.',
    },
    {
        comment: 'JsdocBlock:has(JsdocTag[tag="author"])',
        context: 'any',
        message: 'Do not use @author. Git records who wrote the code.',
    },
    {
        comment: 'JsdocBlock:has(JsdocTag[tag="license"])',
        context: 'any',
        message: 'Do not use @license. The file header holds the licence terms.',
    },
    {
        comment: 'JsdocBlock:has(JsdocTag[tag="version"])',
        context: 'any',
        message:
            'Do not use @version: a hand-written symbol version goes stale. Record when the symbol arrived with @since <package version>.',
    },
    {
        comment: `JsdocBlock:has(JsdocTag[tag="access"]:not([description=${permissionPattern}]))`,
        context: 'any',
        message:
            'Write @access as the resource or action permission a caller must hold, dotted and lower case (for example @access inventory.catalogue.write), never a role or a TypeScript visibility.',
    },
];
const jsdocContracts = {
    plugins: { jsdoc },
    settings: {
        jsdoc: {
            mode: 'typescript',
            tagNamePreference: { arg: 'param', argument: 'param', return: 'returns', emits: 'fires' },
        },
    },
    rules: {
        'jsdoc/require-jsdoc': [
            'error',
            {
                require: {
                    ArrowFunctionExpression: false,
                    ClassDeclaration: true,
                    ClassExpression: true,
                    FunctionDeclaration: true,
                    FunctionExpression: true,
                    MethodDefinition: true,
                },
                contexts: [
                    ':matches(ArrowFunctionExpression)',
                    'TSInterfaceDeclaration',
                    'TSTypeAliasDeclaration',
                    'TSMethodSignature',
                    'TSDeclareFunction',
                    'ExportNamedDeclaration',
                    'ExportDefaultDeclaration',
                ],
                checkAllFunctionExpressions: true,
                exemptEmptyConstructors: false,
                exemptEmptyFunctions: false,
            },
        ],
        'jsdoc/require-description': ['error', { contexts: [contractComment] }],
        'jsdoc/match-description': [
            'error',
            {
                contexts: [contractComment],
                matchDescription:
                    '^\\s*(?:-\\s*)?[\\p{Upper}`][\\s\\S]*[.!?](?:\\s+@agent-optimization\\s[^\\n]*)?\\s*$',
                tags: { param: true, returns: true, template: true, fails: true, fires: true, yields: true },
                message:
                    'Write a complete sentence with an initial capital and closing punctuation; explain the contract rather than repeating the name.',
            },
        ],
        'jsdoc/informative-docs': ['error', { aliases: { run: ['runs', 'running'], main: ['entry', 'point'] } }],
        'jsdoc/no-blank-block-descriptions': 'error',
        'jsdoc/require-param': [
            'error',
            {
                contexts: [
                    `:not(${effectGenCallback}):matches(ArrowFunctionExpression, FunctionDeclaration, FunctionExpression, TSDeclareFunction, TSMethodSignature)`,
                ],
            },
        ],
        'jsdoc/require-param-description': 'error',
        'jsdoc/check-param-names': 'error',
        'jsdoc/require-returns': [
            'error',
            {
                contexts: [
                    `:not(${effectGenCallback}):matches(ArrowFunctionExpression, FunctionDeclaration, FunctionExpression, TSDeclareFunction, TSMethodSignature)`,
                ],
            },
        ],
        'jsdoc/require-returns-description': 'error',
        'jsdoc/require-yields': [
            'error',
            {
                contexts: [
                    `FunctionDeclaration[generator=true], :not(${effectGenCallback})FunctionExpression[generator=true]`,
                ],
            },
        ],
        'jsdoc/check-tag-names': ['error', { definedTags: ['fails', 'file', 'internal', 'agent-optimization'] }],
        'jsdoc/no-types': 'error',
        'jsdoc/valid-types': 'error',
        'jsdoc/require-template': 'error',
        'jsdoc/empty-tags': 'error',
        'jsdoc/check-alignment': 'error',
        'jsdoc/multiline-blocks': 'error',
        'jsdoc/tag-lines': ['error', 'never', { startLines: 1 }],
        'jsdoc/no-restricted-syntax': ['error', { contexts: bannedJsdocTags }],
        'jsdoc/require-example': [
            'error',
            {
                enableFixer: false,
                contexts: [
                    'ExportNamedDeclaration',
                    'ExportDefaultDeclaration',
                    ':matches(ExportNamedDeclaration,ExportDefaultDeclaration) > ClassDeclaration > ClassBody > MethodDefinition:not([accessibility="private"]):not([accessibility="protected"]):not([key.type="PrivateIdentifier"])',
                    'ExportNamedDeclaration > TSInterfaceDeclaration > TSInterfaceBody > TSMethodSignature',
                ],
            },
        ],
    },
};

/**
 * Apply workspace boundaries before project-specific restrictions and formatting overrides.
 *
 * @since 0.0.1
 * @example
 * import config from './eslint.config.mjs';
 * const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: config });
 */
export default [
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/javascript'],
    {
        ignores: [
            '**/dist',
            '**/out-tsc',
            '**/test-output',
            '**/test-results',
            '**/playwright-report',
            '**/.expo',
            '**/vitest.config.*.timestamp*',
            'examples/**',
            'externals/**',
            'graphify-out/**',
            '.claude/**',
            '.cursor/**',
            '.opencode/**',
            'tests/boundaries/fixtures/**',
        ],
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.js', '**/*.mjs'],
        plugins: {
            eventiva: eventivaPlugin,
        },
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: false,
                    allow: ['^.*/eslint\\.config\\.mjs$', '^.*/vitest\\.shared(\\.ts)?$'],
                    depConstraints: [
                        ...typeConstraints,
                        ...layerConstraints,
                        ...capabilityConstraints,
                        ...portableOnly,
                    ],
                },
            ],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'eventiva/no-inline-comments': ['error', { ratchetPath: 'tools/comments/ratchet.json', root }],
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        reactLifecycleRestriction,
                        { name: 'zod', message: 'Eventiva is Zod-free: use effect/Schema.' },
                    ],
                },
            ],
            'no-restricted-modules': ['error', { paths: [{ name: 'react', message: reactLifecycleMessage }] }],
            'no-restricted-syntax': ['error', ...baseSyntaxRestrictions],
        },
    },
    {
        files: ['packages/**/src/**/*.ts'],
        rules: {
            'no-restricted-syntax': [
                'error',
                ...baseSyntaxRestrictions,
                { selector: 'ExportAllDeclaration', message: 'No barrels: export each name explicitly.' },
            ],
        },
    },
    {
        files: ['packages/contracts/src/**/*.ts'],
        rules: {
            'no-restricted-syntax': [
                'error',
                ...baseSyntaxRestrictions,
                { selector: 'ExportAllDeclaration', message: 'No barrels: export each name explicitly.' },
                noPositionalUnionMemberIndexRestriction,
            ],
        },
    },
    {
        files: ['tests/telemetry/src/**/*.spec.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        reactLifecycleRestriction,
                        { name: 'zod', message: 'Eventiva is Zod-free: use effect/Schema.' },
                        ...['node:child_process', 'child_process'].map(
                            /**
                             * Restrict both spellings of direct child-process imports. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                             *
                             * @param name - Built-in specifier bypassing the measured test harness.
                             * @returns An import diagnostic pointing to the bounded runner.
                             */ (name) => ({
                                name,
                                message:
                                    'Use childTests/runChild from ./child-process.ts: record every child timing and declare budgets that fit the test timeout.',
                            })
                        ),
                    ],
                },
            ],
            'no-restricted-syntax': [
                'error',
                reactDynamicRestriction,
                {
                    selector: 'ImportExpression[source.value=/^(node:)?child_process$/]',
                    message:
                        'Use childTests/runChild from ./child-process.ts: dynamic subprocess imports bypass timing and budget enforcement.',
                },
                {
                    selector: 'CallExpression[callee.name="require"][arguments.0.value=/^(node:)?child_process$/]',
                    message:
                        'Use childTests/runChild from ./child-process.ts: require subprocess calls bypass timing and budget enforcement.',
                },
            ],
        },
    },
    {
        files: portableFiles,
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        reactLifecycleRestriction,
                        { name: 'zod', message: 'Eventiva is Zod-free: use effect/Schema.' },
                        ...nodeBuiltins.map(
                            /**
                             * Restrict host-specific imports in shared and frontend code. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                             *
                             * @param name - Bare or protocol-prefixed Node module identifier.
                             * @returns An import diagnostic explaining the portability boundary.
                             */ (name) => ({
                                name,
                                message: 'Portable code runs on Hermes and in browsers: no Node built-ins.',
                            })
                        ),
                    ],
                },
            ],
            'no-restricted-globals': ['error', ...nodeGlobals],
        },
    },
    {
        files: runtimeFiles,
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        reactLifecycleRestriction,
                        { name: 'zod', message: 'Eventiva is Zod-free: use effect/Schema.' },
                        ...nodeBuiltins.map(
                            /**
                             * Require action runtime code to obtain host capabilities from services. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review
                             *
                             * @param name - Bare or protocol-prefixed Node module identifier.
                             * @returns An import diagnostic naming the service boundary.
                             */ (name) => ({
                                name,
                                message:
                                    'The action runtime takes platform capabilities from services, not Node built-ins.',
                            })
                        ),
                    ],
                },
            ],
        },
    },
    {
        files: ['apps/client/**/*.tsx', 'apps/client/**/*.ts', 'packages/ui-modules/src/**/*.{ts,tsx}'],
        plugins: {
            formatjs,
            'react-hooks': reactHooks,
            eventiva: eventivaPlugin,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'eventiva/no-zero-delay-ui-timer': 'error',
            'formatjs/no-literal-string-in-jsx': 'error',
            'formatjs/enforce-default-message': ['error', 'literal'],
            'formatjs/enforce-placeholders': 'error',
            'formatjs/no-offset': 'error',
        },
    },
    { files: jsdocAdoptedFiles, ...jsdocContracts },
    { files: ['**/*.{js,mjs,cjs}'], plugins: { jsdoc }, rules: { 'jsdoc/no-types': 'off' } },
    prettier,
];
