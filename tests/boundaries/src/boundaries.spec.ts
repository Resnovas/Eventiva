/**
 * @file tests/boundaries/src/boundaries.spec.ts
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

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { builtinModules, createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from '@effect/vitest';
import { ESLint } from 'eslint';
import { build } from 'vite';

// The boundary rules in eslint.config.mjs, checked against fixtures that break
// them on purpose. Each fixture project carries the tags of the role it plays.
// A deleted or weakened rule turns its case red.

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const fixtures = 'tests/boundaries/fixtures';
const eslint = new ESLint({ cwd: root, ignore: false });

/**
 * Keep architecture and policy diagnostics, dropping the JSDoc contract's findings on undocumented probe snippets.
 * The JSDoc rules have their own test, so these probes stay focused on the rule they exercise.
 *
 * @param message - One ESLint diagnostic.
 * @param message.ruleId - The rule that reported it, or null for a parse error.
 * @returns Whether it comes from a rule other than the JSDoc contract.
 */
const isArchitectureDiagnostic = (message: { readonly ruleId: string | null }) => !message.ruleId?.startsWith('jsdoc/');

/**
 * Lint a deliberately violating tagged fixture and expose rule ids without depending on diagnostic wording.
 *
 * @param file - The fixture path under `tests/boundaries/fixtures`.
 * @returns The rule id of every diagnostic, in order.
 */
const rulesIn = async (file: string) => {
    // Exercise real on-disk project tags rather than a duplicate rule configuration in the test.
    const [result] = await eslint.lintFiles([join(root, fixtures, file)]);
    return (result?.messages ?? []).map(
        /**
         * Keep each diagnostic's rule identity, including duplicates for distinct violations.
         *
         * @param message - One ESLint diagnostic.
         * @returns Its rule id.
         */
        (message) => message.ruleId
    );
};

describe(
    'module boundaries',
    { timeout: 60_000 },
    /** Exercise permitted edges as controls alongside forbidden imports so rules cannot simply reject everything. */ () => {
        it('F1 lets frontend code import portable contracts and schema', /** Positive control for frontend consumption of portable modules. */ async () => {
            expect(await rulesIn('frontend-extension/src/portable.ts')).toEqual([]);
        });

        it('F2 stops frontend code importing the backend runtime', /** Require the architecture rule, not an unrelated lint failure, on a backend edge. */ async () => {
            expect(await rulesIn('frontend-extension/src/runtime.ts')).toEqual(['@nx/enforce-module-boundaries']);
        });

        // Nx never sees Node built-ins as external packages, so the core rules carry this case.
        it('F3 stops portable code using Node built-ins and globals', /** Verify both import and global restrictions where Nx does not classify built-ins as packages. */ async () => {
            expect((await rulesIn('shared-library/src/node.ts')).sort()).toEqual([
                'no-restricted-globals',
                'no-restricted-imports',
                'no-restricted-imports',
            ]);
        });

        it('F4 bans server SDKs and Node platform layers in frontend code', /** Assert both server-only dependencies are rejected by project boundaries. */ async () => {
            expect(await rulesIn('frontend-extension/src/server-sdk.ts')).toEqual([
                '@nx/enforce-module-boundaries',
                '@nx/enforce-module-boundaries',
            ]);
        });

        it('F5 stops an extension importing an integration', /** Keep vendor integration wiring outside extension modules. */ async () => {
            expect(await rulesIn('frontend-extension/src/integration.ts')).toEqual(['@nx/enforce-module-boundaries']);
        });

        it('F6 keeps contracts at the bottom of the graph', /** Reject a reverse dependency from core contracts into schema composition. */ async () => {
            expect(await rulesIn('core-library/src/schema.ts')).toEqual(['@nx/enforce-module-boundaries']);
        });

        it('F9 lets portable code import effect and nothing else', /** Detect an unapproved dependency edge from the portable library fixture. */ async () => {
            expect(await rulesIn('shared-library/src/cluster.ts')).toEqual(['@nx/enforce-module-boundaries']);
        });

        /**
         * Lint synthetic source as a real project path so Nx uses the repository's actual dependency graph.
         *
         * @param file - The workspace path the source is linted as.
         * @param code - The source text.
         * @returns Each non-JSDoc diagnostic's rule id and message.
         */
        const rulesInText = async (file: string, code: string) => {
            // The supplied workspace path determines Nx ownership even though the violating import stays in memory.
            const [result] = await eslint.lintText(code, { filePath: join(root, file) });
            return (result?.messages ?? []).filter(isArchitectureDiagnostic).map(
                /**
                 * Preserve message wording where the assertion must distinguish a cycle from a generic forbidden edge.
                 *
                 * @param message - One ESLint diagnostic.
                 * @returns Its rule id and message.
                 */
                (message) => [message.ruleId, message.message] as const
            );
        };

        // Real packages, so the check follows the actual graph: runtime -> schema -> contracts.
        it('F7 refuses any import that points back down the package graph', /** Prove both schema/runtime and contracts/schema reverse edges produce explicit cycle diagnostics. */ async () => {
            // Real tagged paths make these checks sensitive to the active graph rather than fixture-only rules.
            for (const [file, from] of [
                ['packages/schema/src/cycle.ts', '@eventiva/runtime/host'],
                ['packages/contracts/src/cycle.ts', '@eventiva/schema/compose'],
            ] as const) {
                const messages = await rulesInText(file, `import { x } from '${from}';\nexport const y = x;\n`);
                expect(messages).toEqual([
                    ['@nx/enforce-module-boundaries', expect.stringMatching(/^Circular dependency between/)],
                ]);
            }
        });

        it('F11 keeps Node built-ins, drivers and platform layers out of the action runtime', /** Require portable runtime restrictions for both built-ins and Node platform integration. */ async () => {
            // Assert rule identities independently of reporting order so both enforcement layers remain necessary.
            const messages = await rulesInText(
                'packages/runtime/src/platform.ts',
                "import { readFileSync } from 'node:fs';\nimport { NodeRuntime } from '@effect/platform-node';\nexport const x = [readFileSync, NodeRuntime];\n"
            );
            expect(
                messages
                    .map(
                        /**
                         * Compare enforcement identities rather than vendor diagnostic prose.
                         *
                         * @param diagnostic - One rule id and message pair.
                         * @returns The rule id.
                         */
                        (diagnostic) => diagnostic[0]
                    )
                    .sort()
            ).toEqual(['@nx/enforce-module-boundaries', 'no-restricted-imports']);
        });

        it('F10 refuses hard-coded strings in client JSX', /** Keep visible client copy on the localization path. */ async () => {
            // A client path activates the same JSX policy as production source.
            const [result] = await eslint.lintText(
                "import { Text } from 'react-native';\n\nexport const Bad = () => <Text>Hello</Text>;\n",
                { filePath: join(root, 'apps/client/src/Bad.tsx') }
            );
            expect(
                result?.messages.filter(isArchitectureDiagnostic).map(
                    /**
                     * Isolate the localization rule from message wording.
                     *
                     * @param message - One ESLint diagnostic.
                     * @returns Its rule id.
                     */
                    (message) => message.ruleId
                )
            ).toEqual(['formatjs/no-literal-string-in-jsx']);
        });

        it('F8 refuses export * barrels in package sources', /** Keep package APIs explicit rather than allowing wildcard export growth. */ async () => {
            // Package source paths activate the wildcard-export restriction.
            const [result] = await eslint.lintText("export * from './action.ts';\n", {
                filePath: join(root, 'packages/contracts/src/barrel.ts'),
            });
            expect(
                result?.messages.map(
                    /**
                     * Identify the wildcard restriction without binding to diagnostic text.
                     *
                     * @param message - One ESLint diagnostic.
                     * @returns Its rule id.
                     */
                    (message) => message.ruleId
                )
            ).toEqual(['no-restricted-syntax']);
        });

        it('routes React lifecycle work to bootstrap or event owners in every active scope', /** Exercise import policy through ESLint, including aliases and alternate loading forms. */ async () => {
            // An unrelated architecture diagnostic must not substitute for the corrective lifecycle restriction.
            const correction =
                'Initialize app-owned services in bootstrap before rendering product content. Derive render state or update its owner from events; use named React imports, never useEffect.';
            for (const file of [
                'apps/client/src/probe.ts',
                'apps/server/src/probe.ts',
                'packages/runtime/src/probe.ts',
                'packages/ui-modules/src/probe.ts',
                'tests/boundaries/src/probe.ts',
            ]) {
                for (const code of [
                    "export { useEffect } from 'react';",
                    "import { useEffect as lifecycle } from 'react'; export { lifecycle };",
                    "import * as React from 'react'; export const lifecycle = React.useEffect;",
                    "import React from 'react'; export const lifecycle = React.useEffect;",
                ]) {
                    const diagnostics = await rulesInText(file, code);
                    expect(
                        diagnostics.some(
                            /**
                             * Require the corrective import rule even where other architecture rules also reject React.
                             *
                             * @param diagnostic - One rule id and message pair.
                             * @returns Whether it is the import restriction with the lifecycle correction.
                             */
                            (diagnostic) =>
                                diagnostic[0] === 'no-restricted-imports' && diagnostic[1].endsWith(correction)
                        )
                    ).toBe(true);
                }
                for (const [code, expected] of [
                    ["export const react = import('react');", 'no-restricted-syntax'],
                    ["export const react = require('react');", 'no-restricted-modules'],
                ]) {
                    const diagnostics = await rulesInText(file, code ?? '');
                    expect(
                        diagnostics.some(
                            /**
                             * Alternate loading cannot recover the forbidden hook through a namespace.
                             *
                             * @param diagnostic - One rule id and message pair.
                             * @returns Whether it is the expected rule with the lifecycle correction.
                             */
                            (diagnostic) => diagnostic[0] === expected && diagnostic[1].endsWith(correction)
                        )
                    ).toBe(true);
                }
            }
            expect(
                await rulesInText(
                    'apps/client/src/probe.ts',
                    "export { useState, useSyncExternalStore, createElement } from 'react';"
                )
            ).toEqual([]);
        });

        it('rejects zero-delay UI timers with a correction while preserving real delays and local methods', /** Exercise actual frontend policies, lexical shadows and existing package restrictions together. */ async () => {
            // Each input isolates the timer rule; an unrelated parse or empty-body error is not proof.
            for (const file of ['apps/client/src/timer-probe.ts', 'packages/ui-modules/src/timer-probe.ts']) {
                for (const call of [
                    'setTimeout(done, 0)',
                    'setTimeout(done)',
                    'globalThis.setTimeout(done, 0)',
                    'window["setTimeout"](done, 0)',
                    'self.setTimeout(done, -0)',
                    'globalThis.setTimeout?.(done, +0)',
                ]) {
                    expect(await rulesInText(file, `export const defer = (done: () => void) => ${call};`)).toEqual([
                        [
                            'eventiva/no-zero-delay-ui-timer',
                            'Do not defer UI state with a zero-delay timer. Keep state in one owner and update it from the event; use scoped Effect scheduling for genuine timed work.',
                        ],
                    ]);
                }
                for (const code of [
                    'export const defer = (done: () => void) => setTimeout(done, 20);',
                    'export const defer = (args: [() => void, number]) => setTimeout(...args);',
                    'export const update = (done: () => void) => done();',
                    'export const local = (setTimeout: (value: number, delay: number) => number) => setTimeout(1, 0);',
                    'export const local = (window: { setTimeout: (value: number, delay: number) => number }) => window.setTimeout(1, 0);',
                ]) {
                    expect(await rulesInText(file, code)).toEqual([]);
                }
            }
            expect(
                await rulesInText('packages/ui-modules/src/barrel-probe.ts', "export * from './registry.ts';")
            ).toEqual([['no-restricted-syntax', 'No barrels: export each name explicitly.']]);
            expect(
                await rulesInText(
                    'apps/server/src/timer-probe.ts',
                    'export const defer = (done: () => void) => setTimeout(done, 0);'
                )
            ).toEqual([]);
        });

        it('holds adopted packages to the JSDoc contract and refuses banned tags', /** Exercise the jsdoc rule set through ESLint on an adopted package path, with a passing control. */ async () => {
            const filePath = join(root, 'packages/integrations/formatjs/src/jsdoc-probe.ts');
            /**
             * Build a fully documented export carrying the given extra tag lines.
             *
             * @param tags - Extra JSDoc tag lines to insert.
             * @returns The probe source text.
             */
            const documented = (tags: string) =>
                [
                    '/**',
                    ' * Read one catalogue entry for the caller.',
                    ' *',
                    ' * @since 0.0.1',
                    tags,
                    ' * @param key - The catalogue key to read.',
                    ' * @returns The entry text, or the key itself when the entry is missing.',
                    ' * @example',
                    " * entry('shell.title');",
                    ' */',
                    'export const entry = (key: string): string => key;',
                    '',
                ].join('\n');
            /**
             * Lint source as an adopted formatjs file and keep each rule with its message.
             *
             * @param code - The probe source text.
             * @returns Each diagnostic's rule id and message.
             */
            const lint = async (code: string) =>
                (await eslint.lintText(code, { filePath }))[0]?.messages.map(
                    /**
                     * Keep the rule and its corrective message, not positions.
                     *
                     * @param message - One ESLint diagnostic.
                     * @returns Its rule id and message.
                     */
                    (message) => ({
                        rule: message.ruleId,
                        message: message.message,
                    })
                ) ?? [];
            expect(
                await lint(
                    documented(
                        ' * @access inventory.catalogue.read\n * @fails {CatalogueMissing} When the catalogue is not loaded.'
                    )
                )
            ).toEqual([]);
            for (const [tag, correction] of [
                [' * @throws {Error} Never.', /@fails/],
                [' * @exception {Error} Never.', /@fails/],
                [' * @author Someone', /Git records/],
                [' * @license MIT', /file header/],
                [' * @version 1.0.0', /@since/],
                [' * @access admin', /resource or action permission/],
                [' * @access public', /resource or action permission/],
            ] as const) {
                const messages = await lint(documented(tag));
                expect(
                    messages.some(
                        /**
                         * Require the corrective diagnostic from the tag ban, not just any failure.
                         *
                         * @param entry - One rule id and message pair.
                         * @returns Whether it is the tag ban with the expected correction.
                         */
                        (entry) => entry.rule === 'jsdoc/no-restricted-syntax' && correction.test(entry.message)
                    )
                ).toBe(true);
            }
            expect(await lint('/** Read one entry. */\nexport const entry = (key: string): string => key;\n')).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ rule: 'jsdoc/require-param' }),
                    expect.objectContaining({ rule: 'jsdoc/require-returns' }),
                    expect.objectContaining({ rule: 'jsdoc/require-example' }),
                    expect.objectContaining({
                        message: 'Record when this export arrived with @since <package version>.',
                    }),
                ])
            );
        });
    }
);

/**
 * Enumerate source/manifests recursively while excluding generated bundles, compiler output and installed dependencies.
 *
 * @param dir - The directory to walk.
 * @returns Every owned file path below it.
 */
const filesUnder = (dir: string): ReadonlyArray<string> =>
    readdirSync(dir, { withFileTypes: true }).flatMap(
        /**
         * Descend only editable directory entries so generated dependencies cannot affect hygiene expectations.
         *
         * @param entry - One directory entry.
         * @returns The files it contributes; dependency and output directories contribute none.
         */
        (entry) => {
            // Outputs can contain manifests and imports that are not owned package source.
            if (['node_modules', 'dist', 'test-output', '.expo', 'out-tsc'].includes(entry.name)) return [];
            const path = join(dir, entry.name);
            return entry.isDirectory() ? filesUnder(path) : [path];
        }
    );

describe('package hygiene', /** Verify portable package exports and historical-source isolation without importing the archive. */ () => {
    // Per-manifest checks are vacuous if discovery misses a package, so pin the discovered package set too.
    const manifests = filesUnder(join(root, 'packages')).filter(
        /**
         * Select owned package manifests, not arbitrary source JSON.
         *
         * @param file - One owned file path.
         * @returns Whether it is a package manifest.
         */
        (file) => file.endsWith('/package.json')
    );

    it('finds every library package', /** Pin enumeration coverage so a missing package cannot silently escape the per-manifest assertions. */ () => {
        expect(
            manifests
                .map(
                    /**
                     * Normalize manifest directories for stable repository-relative expectations.
                     *
                     * @param file - One manifest path.
                     * @returns Its package directory relative to the repository root.
                     */
                    (file) => relative(root, dirname(file))
                )
                .sort()
        ).toEqual([
            'packages/contracts',
            'packages/integrations/formatjs',
            'packages/integrations/http-client',
            'packages/integrations/oidc',
            'packages/integrations/openfeature-client',
            'packages/integrations/openfeature-server',
            'packages/integrations/posthog-client',
            'packages/integrations/posthog-server',
            'packages/integrations/sql',
            'packages/integrations/telemetry.server',
            'packages/integrations/trust.server',
            'packages/runtime',
            'packages/schema',
            'packages/ui-modules',
        ]);
    });

    it.each(
        manifests.map(
            /**
             * Name each hygiene case with its owning package while retaining its absolute read path.
             *
             * @param file - One manifest path.
             * @returns The case name and the manifest path.
             */
            (file) => [relative(root, dirname(file)), file]
        )
    )(
        '%s is an ESM package of explicit subpaths with no side effects',
        /**
         * Require ESM explicit source subpaths and peer-only Effect ownership for every discovered package.
         *
         * @param _name - The case name; unused.
         * @param file - The manifest path.
         */
        (_name, file) => {
            const manifest = JSON.parse(readFileSync(file, 'utf8'));
            expect(manifest.type).toBe('module');
            expect(manifest.sideEffects).toBe(false);
            expect(manifest.main).toBeUndefined();
            expect(Object.keys(manifest.exports)).not.toContain('.');
            for (const [subpath, target] of Object.entries(manifest.exports)) {
                if (subpath === './package.json') continue;
                expect(target).toMatchObject({ '@eventiva/source': expect.stringMatching(/^\.\/src\/.+\.tsx?$/) });
            }
            // One shared copy of effect: a peer wherever the sources use it, never a direct dependency.
            const usesEffect = filesUnder(join(dirname(file), 'src')).some(
                /**
                 * Infer whether this package needs the shared Effect peer from its authored imports.
                 *
                 * @param source - One source file of the package.
                 * @returns Whether it imports `effect`.
                 */
                (source) => /from 'effect'/.test(readFileSync(source, 'utf8'))
            );
            expect(manifest.peerDependencies?.effect).toEqual(usesEffect ? 'catalog:' : undefined);
            expect(manifest.dependencies?.effect).toBeUndefined();
        }
    );

    it('uses exactly the lowercase top-level archive path on case-sensitive and case-insensitive filesystems', /** Check stored directory spelling rather than filesystem-dependent lookup behavior. */ () => {
        // Directory entries expose the stored spelling even when path lookup ignores case.
        expect(
            readdirSync(root).filter(
                /**
                 * Select archive-name case variants without changing the stored spelling.
                 *
                 * @param name - One top-level entry name.
                 * @returns Whether it spells `examples` in any case.
                 */
                (name) => name.toLowerCase() === 'examples'
            )
        ).toEqual(['examples']);
    });

    it('keeps the historical snapshots out of every production import', /** Reject archive references throughout active application and package source. */ () => {
        // Archived source may legitimately retain historical imports; only active roots define this boundary.
        const sources = ['apps', 'packages'].flatMap(
            /**
             * Enumerate active source roots only; historical fixtures are not production.
             *
             * @param top - One active top-level directory.
             * @returns Every owned file below it.
             */
            (top) => filesUnder(join(root, top))
        );
        const offenders = sources.filter(
            /**
             * Scan import-bearing text case-insensitively so either archive spelling remains forbidden.
             *
             * @param file - One active source file.
             * @returns Whether it is source that references the archive.
             */
            (file) => /\.(ts|tsx|js|mjs|json)$/.test(file) && /examples\//i.test(readFileSync(file, 'utf8'))
        );
        expect(offenders).toEqual([]);
    });
});

// Portability beyond lint: bundle every portable subpath for the browser, as
// Metro and the web export do, and compile the bundle with React Native's own
// Hermes compiler.
describe(
    'portable bundle',
    { timeout: 120_000 },
    /** Verify browser dependency closure, tree shaking and native bytecode compatibility using real bundler/compiler output. */ () => {
        const out = join(root, 'tests/boundaries/test-output/bundle');
        // One public-entry inventory prevents new exports escaping closure, tree-shaking or Hermes checks independently.
        const portable = ['contracts', 'schema'].flatMap(
            /**
             * Discover all public portable subpaths so newly exported modules enter the portability checks.
             *
             * @param name - One portable package directory name.
             * @returns The package's public subpath specifiers.
             */
            (name) => {
                // Manifest exports, not source filenames, define the portable consumer surface under test.
                const { exports } = JSON.parse(readFileSync(join(root, 'packages', name, 'package.json'), 'utf8'));
                return Object.keys(exports)
                    .filter(
                        /**
                         * Exclude manifest metadata from executable bundle entries.
                         *
                         * @param subpath - One export key.
                         * @returns Whether it is an executable entry.
                         */
                        (subpath) => subpath !== './package.json'
                    )
                    .map(
                        /**
                         * Resolve explicit export keys to consumer-visible package specifiers.
                         *
                         * @param subpath - One executable export key.
                         * @returns The package specifier a consumer imports.
                         */
                        (subpath) => `@eventiva/${name}/${subpath.slice(2)}`
                    );
            }
        );

        /**
         * Bundle retained imports under browser/source conditions and report both requested and included modules for distinct boundary assertions.
         *
         * @param name - The bundle's file name.
         * @param imports - The package specifiers to import and retain.
         * @returns The bundle file, the requested and included modules, and the emitted code.
         */
        const bundle = async (name: string, imports: ReadonlyArray<string>) => {
            // Exporting every namespace prevents unused-import elimination from making the portability control vacuous.
            mkdirSync(out, { recursive: true });
            const entry = join(out, `${name}.ts`);
            writeFileSync(
                entry,
                imports
                    .map(
                        /**
                         * Assign deterministic namespace names to retain each requested subpath.
                         *
                         * @param from - One package specifier.
                         * @param index - Its position.
                         * @returns The namespace import statement.
                         */
                        (from, index) => `import * as m${index} from '${from}';`
                    )
                    .join('\n') +
                    `\nexport const all = [${imports
                        .map(
                            /**
                             * Retain the corresponding namespaces in bundle output.
                             *
                             * @param _ - The specifier; unused.
                             * @param index - Its position.
                             * @returns The namespace binding name.
                             */
                            (_, index) => `m${index}`
                        )
                        .join(', ')}];\n`
            );
            const modules = new Set<string>();
            const requested = new Set<string>();
            const result = await build({
                configFile: false,
                logLevel: 'silent',
                root: join(root, 'tests/boundaries'),
                resolve: { conditions: ['@eventiva/source', 'browser', 'module', 'import', 'default'] },
                plugins: [
                    {
                        name: 'record-modules',
                        /**
                         * Observe attempted imports without overriding normal bundler resolution.
                         *
                         * @param source - The import specifier the bundler is resolving.
                         * @returns Null, so normal resolution continues.
                         */
                        resolveId(source) {
                            requested.add(source);
                            return null;
                        },
                        /**
                         * Track included modules separately from attempted imports and normalize their paths.
                         *
                         * @param info - The bundler's parsed module information.
                         */
                        moduleParsed(info) {
                            modules.add(relative(root, info.id));
                        },
                    },
                ],
                build: {
                    write: false,
                    minify: false,
                    target: 'es2019',
                    lib: { entry, formats: ['iife'], name: 'Portable' },
                },
            });
            const [first] = Array.isArray(result) ? result : [result];
            const chunk = first !== undefined && 'output' in first ? first.output[0] : undefined;
            const file = join(out, `${name}.js`);
            writeFileSync(file, chunk?.code ?? '');
            return { modules: [...modules], requested: [...requested], code: chunk?.code ?? '', file };
        };

        it('F12 contains only the portable packages and effect, with no Node import', /** Bound the real browser bundle to portable source, Effect's dependency closure and compiler helpers. */ async () => {
            const { modules, requested, code } = await bundle('portable', portable);
            expect(portable).toEqual(
                expect.arrayContaining(['@eventiva/contracts/caller', '@eventiva/schema/compose'])
            );
            // effect and everything it depends on; nothing else from node_modules.
            const closure = new Set<string>();
            /**
             * Resolve transitive runtime dependencies from their owning manifest and deduplicate cycles.
             *
             * @param name - The package to resolve.
             * @param from - The manifest that depends on it.
             */
            const visit = (name: string, from: string) => {
                if (closure.has(name)) return;
                closure.add(name);
                // Node's lookup, by hand: some packages do not export their package.json.
                let dir = dirname(realpathSync(from));
                while (!existsSync(join(dir, 'node_modules', name, 'package.json'))) {
                    if (dirname(dir) === dir) throw new Error(`cannot find ${name} from ${from}`);
                    dir = dirname(dir);
                }
                const manifest = realpathSync(join(dir, 'node_modules', name, 'package.json'));
                const { dependencies = {} } = JSON.parse(readFileSync(manifest, 'utf8'));
                for (const dependency of Object.keys(dependencies)) visit(dependency, manifest);
            };
            visit('effect', join(root, 'packages/contracts/package.json'));
            expect([...closure]).toEqual(expect.arrayContaining(['effect', 'fast-check']));
            /**
             * Accept only portable source, generated entry/helpers and packages reachable from Effect.
             *
             * @param id - One included module path.
             * @returns Whether the bundle may contain it.
             */
            const allowed = (id: string) =>
                /^packages\/(contracts|schema)\/src\//.test(id) ||
                id.startsWith('tests/boundaries/test-output/bundle/') ||
                // Transpilation helpers the bundler itself injects for class fields.
                id.includes('@oxc-project+runtime@') ||
                [...closure].some(
                    /**
                     * Match pnpm's encoded package directory without admitting arbitrary installed modules.
                     *
                     * @param name - One package in Effect's closure.
                     * @returns Whether the module lives in that package's pnpm directory.
                     */
                    (name) => id.startsWith(`node_modules/.pnpm/${name.replace('/', '+')}@`)
                );
            expect(
                modules.filter(
                    /**
                     * Identify included modules outside the permitted closure.
                     *
                     * @param id - One included module path.
                     * @returns Whether it is not allowed.
                     */
                    (id) => !allowed(id)
                )
            ).toEqual([]);
            const node = new Set(
                builtinModules.flatMap(
                    /**
                     * Cover both spellings of each Node built-in.
                     *
                     * @param name - One Node built-in module name.
                     * @returns The bare and `node:` spellings.
                     */
                    (name) => [name, `node:${name}`]
                )
            );
            expect(
                requested.filter(
                    /**
                     * Detect even attempted Node imports that bundling might otherwise externalize.
                     *
                     * @param source - One requested import.
                     * @returns Whether it is a Node built-in.
                     */
                    (source) => node.has(source)
                )
            ).toEqual([]);
            // Control for F13: the full bundle does carry these service keys.
            expect(code).toContain('@eventiva/contracts/Authorizer');
            expect(code).toContain('@eventiva/contracts/Flags');
        });

        it('F13 drops every subpath an importer does not use', /** Contrast the full-bundle control with an ids-only import to prove subpath isolation. */ async () => {
            // Service-key absence supplements module inclusion checks with observable emitted-code evidence.
            const { modules, code } = await bundle('ids-only', ['@eventiva/contracts/ids']);
            expect(
                modules.filter(
                    /**
                     * Restrict this assertion to authored workspace modules, not transitive dependencies.
                     *
                     * @param id - One included module path.
                     * @returns Whether it is workspace package source.
                     */
                    (id) => id.startsWith('packages/')
                )
            ).toEqual(['packages/contracts/src/ids.ts']);
            expect(code).not.toContain('@eventiva/contracts/Authorizer');
            expect(code).not.toContain('@eventiva/contracts/Flags');
        });

        it('F14 compiles to Hermes bytecode with the compiler React Native ships', /** Validate portable output with the installed native compiler, not merely a browser transpiler. */ async () => {
            const { file } = await bundle('hermes', portable);
            const fromClient = createRequire(join(root, 'apps/client/package.json'));
            const fromNative = createRequire(fromClient.resolve('react-native/package.json'));
            const compiler = dirname(fromNative.resolve('hermes-compiler/package.json'));
            const platform = { linux: 'linux64-bin', darwin: 'osx-bin', win32: 'win64-bin' }[
                process.platform as string
            ];
            expect(platform).toBeDefined();
            const hermesc = join(
                compiler,
                'hermesc',
                platform ?? '',
                process.platform === 'win32' ? 'hermesc.exe' : 'hermesc'
            );
            const bytecode = file.replace(/\.js$/, '.hbc');
            execFileSync(hermesc, ['-emit-binary', '-out', bytecode, file], { stdio: 'pipe' });
            expect(existsSync(bytecode)).toBe(true);
            // Hermes bytecode files start with this magic number.
            expect(readFileSync(bytecode).readBigUInt64LE(0)).toBe(0x1f1903c103bc1fc6n);
        });
    }
);
