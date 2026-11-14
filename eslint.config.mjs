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
];

// Contracts and schema depend on effect alone.
const portableOnly = [
    { sourceTag: 'type:core', allowedExternalImports: ['effect', 'effect/*'] },
    { sourceTag: 'type:shared', allowedExternalImports: ['effect', 'effect/*'] },
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
const skip = new Set(['node_modules', 'dist', '.git', '.nx', 'Examples', 'graphify-out', 'test-output', '.expo']);
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
            'Examples/**',
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
                { paths: [{ name: 'zod', message: 'Eventiva is Zod-free: use effect/Schema.' }] },
            ],
        },
    },
    {
        // Package entry points: explicit named exports only, so subpaths stay tree-shakeable.
        files: ['packages/**/src/**/*.ts'],
        rules: {
            'no-restricted-syntax': [
                'error',
                { selector: 'ExportAllDeclaration', message: 'No barrels: export each name explicitly.' },
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
                        { name: 'zod', message: 'Eventiva is Zod-free: use effect/Schema.' },
                        ...nodeBuiltins.map((name) => ({
                            name,
                            message: 'Portable code runs on Hermes and in browsers: no Node built-ins.',
                        })),
                    ],
                },
            ],
            'no-restricted-globals': ['error', ...nodeGlobals],
        },
    },
    {
        files: ['apps/client/**/*.tsx', 'apps/client/**/*.ts'],
        plugins: { formatjs, 'react-hooks': reactHooks },
        rules: {
            ...reactHooks.configs.recommended.rules,
            // Every user-facing string is a message with a key and an en-GB default.
            'formatjs/no-literal-string-in-jsx': 'error',
            'formatjs/enforce-default-message': ['error', 'literal'],
            'formatjs/enforce-placeholders': 'error',
            'formatjs/no-offset': 'error',
        },
    },
    prettier,
];
