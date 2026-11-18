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

/** Lint a deliberately violating tagged fixture and expose rule ids without depending on diagnostic wording. */
const rulesIn = async (file: string) => {
    // Exercise real on-disk project tags rather than a duplicate rule configuration in the test.
    const [result] = await eslint.lintFiles([join(root, fixtures, file)]);
    return (result?.messages ?? []).map(
        /** Keep each diagnostic's rule identity, including duplicates for distinct violations. */ (message) =>
            message.ruleId
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

        /** Lint synthetic source as a real project path so Nx uses the repository's actual dependency graph. */
        const rulesInText = async (file: string, code: string) => {
            // The supplied workspace path determines Nx ownership even though the violating import stays in memory.
            const [result] = await eslint.lintText(code, { filePath: join(root, file) });
            return (result?.messages ?? []).map(
                /** Preserve message wording where the assertion must distinguish a cycle from a generic forbidden edge. */ (
                    message
                ) => [message.ruleId, message.message]
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
                    .map(/** Compare enforcement identities rather than vendor diagnostic prose. */ ([rule]) => rule)
                    .sort()
            ).toEqual([
                '@nx/enforce-module-boundaries',
                'no-restricted-imports',
            ]);
        });

        it('F10 refuses hard-coded strings in client JSX', /** Keep visible client copy on the localization path. */ async () => {
            // A client path activates the same JSX policy as production source.
            const [result] = await eslint.lintText(
                "import { Text } from 'react-native';\n\nexport const Bad = () => <Text>Hello</Text>;\n",
                { filePath: join(root, 'apps/client/src/Bad.tsx') }
            );
            expect(
                result?.messages.map(
                    /** Isolate the localization rule from message wording. */ (message) => message.ruleId
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
                    /** Identify the wildcard restriction without binding to diagnostic text. */ (message) =>
                        message.ruleId
                )
            ).toEqual(['no-restricted-syntax']);
        });
    }
);

/** Enumerate source/manifests recursively while excluding generated bundles, compiler output and installed dependencies. */
const filesUnder = (dir: string): ReadonlyArray<string> =>
    readdirSync(dir, { withFileTypes: true }).flatMap(
        /** Descend only editable directory entries so generated dependencies cannot affect hygiene expectations. */ (
            entry
        ) => {
            // Outputs can contain manifests and imports that are not owned package source.
            if (['node_modules', 'dist', 'test-output', '.expo', 'out-tsc'].includes(entry.name)) return [];
            const path = join(dir, entry.name);
            return entry.isDirectory() ? filesUnder(path) : [path];
        }
    );

describe('package hygiene', /** Verify portable package exports and historical-source isolation without importing the archive. */ () => {
    // Per-manifest checks are vacuous if discovery misses a package, so pin the discovered package set too.
    const manifests = filesUnder(join(root, 'packages')).filter(
        /** Select owned package manifests, not arbitrary source JSON. */ (file) => file.endsWith('/package.json')
    );

    it('finds every library package', /** Pin enumeration coverage so a missing package cannot silently escape the per-manifest assertions. */ () => {
        expect(
            manifests
                .map(
                    /** Normalize manifest directories for stable repository-relative expectations. */ (file) =>
                        relative(root, dirname(file))
                )
                .sort()
        ).toEqual([
            'packages/contracts',
            'packages/integrations/formatjs',
            'packages/integrations/openfeature-client',
            'packages/integrations/openfeature-server',
            'packages/integrations/posthog-client',
            'packages/integrations/posthog-server',
            'packages/integrations/sql',
            'packages/integrations/telemetry.server',
            'packages/runtime',
            'packages/schema',
            'packages/ui-modules',
        ]);
    });

    it.each(
        manifests.map(
            /** Name each hygiene case with its owning package while retaining its absolute read path. */ (file) => [
                relative(root, dirname(file)),
                file
            ]
        )
    )(
        '%s is an ESM package of explicit subpaths with no side effects',
        /** Require ESM explicit source subpaths and peer-only Effect ownership for every discovered package. */
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
                /** Infer whether this package needs the shared Effect peer from its authored imports. */ (source) =>
                    /from 'effect'/.test(readFileSync(source, 'utf8'))
            );
            expect(manifest.peerDependencies?.effect).toEqual(usesEffect ? 'catalog:' : undefined);
            expect(manifest.dependencies?.effect).toBeUndefined();
        }
    );

    it('uses exactly the lowercase top-level archive path on case-sensitive and case-insensitive filesystems', /** Check stored directory spelling rather than filesystem-dependent lookup behavior. */ () => {
        // Directory entries expose the stored spelling even when path lookup ignores case.
        expect(
            readdirSync(root).filter(
                /** Select archive-name case variants without changing the stored spelling. */ (name) =>
                    name.toLowerCase() === 'examples'
            )
        ).toEqual(['examples']);
    });

    it('keeps the historical snapshots out of every production import', /** Reject archive references throughout active application and package source. */ () => {
        // Archived source may legitimately retain historical imports; only active roots define this boundary.
        const sources = ['apps', 'packages'].flatMap(
            /** Enumerate active source roots only; historical fixtures are not production. */ (top) =>
                filesUnder(join(root, top))
        );
        const offenders = sources.filter(
            /** Scan import-bearing text case-insensitively so either archive spelling remains forbidden. */
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
            /** Discover all public portable subpaths so newly exported modules enter the portability checks. */ (
                name
            ) => {
                // Manifest exports, not source filenames, define the portable consumer surface under test.
                const { exports } = JSON.parse(readFileSync(join(root, 'packages', name, 'package.json'), 'utf8'));
                return Object.keys(exports)
                    .filter(
                        /** Exclude manifest metadata from executable bundle entries. */ (subpath) =>
                            subpath !== './package.json'
                    )
                    .map(
                        /** Resolve explicit export keys to consumer-visible package specifiers. */ (subpath) =>
                            `@eventiva/${name}/${subpath.slice(2)}`
                    );
            }
        );

        /** Bundle retained imports under browser/source conditions and report both requested and included modules for distinct boundary assertions. */
        const bundle = async (name: string, imports: ReadonlyArray<string>) => {
            // Exporting every namespace prevents unused-import elimination from making the portability control vacuous.
            mkdirSync(out, { recursive: true });
            const entry = join(out, `${name}.ts`);
            writeFileSync(
                entry,
                imports
                    .map(
                        /** Assign deterministic namespace names to retain each requested subpath. */ (from, index) =>
                            `import * as m${index} from '${from}';`
                    )
                    .join('\n') +
                    `\nexport const all = [${imports.map(/** Retain the corresponding namespaces in bundle output. */ (_, index) => `m${index}`).join(', ')}];\n`
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
                        /** Observe attempted imports without overriding normal bundler resolution. */
                        resolveId(source) {
                            requested.add(source);
                            return null;
                        },
                        /** Track included modules separately from attempted imports and normalize their paths. */
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
            /** Resolve transitive runtime dependencies from their owning manifest and deduplicate cycles. */
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
            /** Accept only portable source, generated entry/helpers and packages reachable from Effect. */
            const allowed = (id: string) =>
                /^packages\/(contracts|schema)\/src\//.test(id) ||
                id.startsWith('tests/boundaries/test-output/bundle/') ||
                // Transpilation helpers the bundler itself injects for class fields.
                id.includes('@oxc-project+runtime@') ||
                [...closure].some(
                    /** Match pnpm's encoded package directory without admitting arbitrary installed modules. */ (
                        name
                    ) => id.startsWith(`node_modules/.pnpm/${name.replace('/', '+')}@`)
                );
            expect(
                modules.filter(/** Identify included modules outside the permitted closure. */ (id) => !allowed(id))
            ).toEqual([]);
            const node = new Set(
                builtinModules.flatMap(
                    /** Cover both spellings of each Node built-in. */ (name) => [name, `node:${name}`]
                )
            );
            expect(
                requested.filter(
                    /** Detect even attempted Node imports that bundling might otherwise externalize. */ (source) =>
                        node.has(source)
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
                    /** Restrict this assertion to authored workspace modules, not transitive dependencies. */ (id) =>
                        id.startsWith('packages/')
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
