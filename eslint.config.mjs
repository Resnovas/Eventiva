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
import reactHooks from 'eslint-plugin-react-hooks';

// Module boundaries (EVE-13, EVE-23 package architecture). Every project
// carries one type, one layer and one capability tag. Types depend only
// downwards, layers never cross between backend and frontend, and a capability
// depends only on the contracts it implements. Nx reports dependency cycles.

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

// Packages that need Node, a server or a database. Portable code never imports them.
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

// Contracts and schema depend on effect alone, and so does the action runtime:
// drivers, vendor SDKs, Node platform layers and Cluster arrive through apps and integrations.
const portableOnly = [
    { sourceTag: 'type:core', allowedExternalImports: ['effect', 'effect/*'] },
    { sourceTag: 'type:shared', allowedExternalImports: ['effect', 'effect/*'] },
    { sourceTag: 'capability:actions', allowedExternalImports: ['effect', 'effect/*'] },
];

// The Node globals portable code must not touch; Hermes and browsers lack them.
const nodeGlobals = ['process', 'Buffer', 'require', 'module', 'global', '__dirname', '__filename', 'setImmediate'].map(
    (name) => ({ name, message: 'Portable code runs on Hermes and in browsers: take this from a service.' })
);
const nodeBuiltins = [
    ...new Set(builtinModules.flatMap((name) => [name.replace(/^node:/, ''), `node:${name.replace(/^node:/, '')}`])),
];

// Source globs per tag, read from each project.json when the config loads, so
// the rules follow tags rather than directory names.
const root = dirname(fileURLToPath(import.meta.url));
const skip = new Set(['node_modules', 'dist', '.git', '.nx', 'examples', 'graphify-out', 'test-output', '.expo']);
const projects = [];
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
const filesTagged = (...tags) =>
    projects
        .filter((project) => tags.some((tag) => project.tags.includes(tag)))
        .map((project) => `${project.root}/**/*.{ts,tsx,mts}`);
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

// A lexical rule distinguishes browser globals from unrelated local methods;
// adding another no-restricted-syntax block would replace the package export rule.
const noZeroDelayUiTimer = {
    meta: {
        type: 'problem',
        schema: [],
        messages: {
            stateOwner:
                'Do not defer UI state with a zero-delay timer. Keep state in one owner and update it from the event; use scoped Effect scheduling for genuine timed work.',
        },
    },
    create(context) {
        return {
            CallExpression(node) {
                // Spread arguments can supply a real delay; this rule does not evaluate runtime values.
                if (node.arguments.some((argument) => argument.type === 'SpreadElement')) return;
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
                // A same-named local parameter/object is not the browser timer API.
                const reference = context.sourceCode
                    .getScope(node)
                    .references.find((entry) => entry.identifier === global);
                if (reference?.resolved?.defs.length) return;
                context.report({ node, messageId: 'stateOwner' });
            },
        };
    },
};

// When the house JSDoc `contracts` set from tools/lint/funnel.mjs is adopted, append
// jsdocTagBan(files) from tools/documentation/jsdoc-tags.mjs after it for the same
// files. It bans @throws, @exception, @author and @license (owner decision, 2026-11-21).
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
            // Boundary fixtures break the rules on purpose; tests/boundaries lints them.
            'tests/boundaries/fixtures/**',
        ],
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.js', '**/*.mjs'],
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
            'no-restricted-syntax': ['error', reactDynamicRestriction],
        },
    },
    {
        // Package entry points: explicit named exports only, so subpaths stay tree-shakeable.
        files: ['packages/**/src/**/*.ts'],
        rules: {
            'no-restricted-syntax': [
                'error',
                reactDynamicRestriction,
                { selector: 'ExportAllDeclaration', message: 'No barrels: export each name explicitly.' },
            ],
        },
    },
    {
        // Step 1: bootstrap probes share measured child/test budgets; other suites are queued for coordinated migration.
        files: ['tests/telemetry/src/**/*.spec.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        reactLifecycleRestriction,
                        { name: 'zod', message: 'Eventiva is Zod-free: use effect/Schema.' },
                        ...['node:child_process', 'child_process'].map(
                            /** Build the finite forbidden-import declarations once. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
                                name
                            ) => ({
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
                            /** Preserve the existing portable boundary declarations. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
                                name
                            ) => ({
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
        // The action runtime is backend code but owns no platform: Node arrives through an app's layers.
        files: runtimeFiles,
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        reactLifecycleRestriction,
                        { name: 'zod', message: 'Eventiva is Zod-free: use effect/Schema.' },
                        ...nodeBuiltins.map(
                            /** Preserve the existing service-owned platform boundary declarations. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
                                name
                            ) => ({
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
            eventiva: { rules: { 'no-zero-delay-ui-timer': noZeroDelayUiTimer } },
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'eventiva/no-zero-delay-ui-timer': 'error',
            // Every user-facing string is a message with a key and an en-GB default.
            'formatjs/no-literal-string-in-jsx': 'error',
            'formatjs/enforce-default-message': ['error', 'literal'],
            'formatjs/enforce-placeholders': 'error',
            'formatjs/no-offset': 'error',
        },
    },
    prettier,
];
