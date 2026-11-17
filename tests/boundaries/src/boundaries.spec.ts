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

const rulesIn = async (file: string) => {
    const [result] = await eslint.lintFiles([join(root, fixtures, file)]);
    return (result?.messages ?? []).map((message) => message.ruleId);
};

describe('module boundaries', { timeout: 60_000 }, () => {
    it('F1 lets frontend code import portable contracts and schema', async () => {
        expect(await rulesIn('frontend-extension/src/portable.ts')).toEqual([]);
    });

    it('F2 stops frontend code importing the backend runtime', async () => {
        expect(await rulesIn('frontend-extension/src/runtime.ts')).toEqual(['@nx/enforce-module-boundaries']);
    });

    // Nx never sees Node built-ins as external packages, so the core rules carry this case.
    it('F3 stops portable code using Node built-ins and globals', async () => {
        expect((await rulesIn('shared-library/src/node.ts')).sort()).toEqual([
            'no-restricted-globals',
            'no-restricted-imports',
            'no-restricted-imports',
        ]);
    });

    it('F4 bans server SDKs and Node platform layers in frontend code', async () => {
        expect(await rulesIn('frontend-extension/src/server-sdk.ts')).toEqual([
            '@nx/enforce-module-boundaries',
            '@nx/enforce-module-boundaries',
        ]);
    });

    it('F5 stops an extension importing an integration', async () => {
        expect(await rulesIn('frontend-extension/src/integration.ts')).toEqual(['@nx/enforce-module-boundaries']);
    });

    it('F6 keeps contracts at the bottom of the graph', async () => {
        expect(await rulesIn('core-library/src/schema.ts')).toEqual(['@nx/enforce-module-boundaries']);
    });

    it('F9 lets portable code import effect and nothing else', async () => {
        expect(await rulesIn('shared-library/src/cluster.ts')).toEqual(['@nx/enforce-module-boundaries']);
    });

    const rulesInText = async (file: string, code: string) => {
        const [result] = await eslint.lintText(code, { filePath: join(root, file) });
        return (result?.messages ?? []).map((message) => [message.ruleId, message.message]);
    };

    // Real packages, so the check follows the actual graph: runtime -> schema -> contracts.
    it('F7 refuses any import that points back down the package graph', async () => {
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

    it('F11 keeps Node built-ins, drivers and platform layers out of the action runtime', async () => {
        const messages = await rulesInText(
            'packages/runtime/src/platform.ts',
            "import { readFileSync } from 'node:fs';\nimport { NodeRuntime } from '@effect/platform-node';\nexport const x = [readFileSync, NodeRuntime];\n"
        );
        expect(messages.map(([rule]) => rule).sort()).toEqual([
            '@nx/enforce-module-boundaries',
            'no-restricted-imports',
        ]);
    });

    it('F10 refuses hard-coded strings in client JSX', async () => {
        const [result] = await eslint.lintText(
            "import { Text } from 'react-native';\n\nexport const Bad = () => <Text>Hello</Text>;\n",
            { filePath: join(root, 'apps/client/src/Bad.tsx') }
        );
        expect(result?.messages.map((message) => message.ruleId)).toEqual(['formatjs/no-literal-string-in-jsx']);
    });

    it('F8 refuses export * barrels in package sources', async () => {
        const [result] = await eslint.lintText("export * from './action.ts';\n", {
            filePath: join(root, 'packages/contracts/src/barrel.ts'),
        });
        expect(result?.messages.map((message) => message.ruleId)).toEqual(['no-restricted-syntax']);
    });
});

// Every file under a directory, skipping build output and dependencies.
const filesUnder = (dir: string): ReadonlyArray<string> =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        if (['node_modules', 'dist', 'test-output', '.expo', 'out-tsc'].includes(entry.name)) return [];
        const path = join(dir, entry.name);
        return entry.isDirectory() ? filesUnder(path) : [path];
    });

describe('package hygiene', /** Verify portable package exports and historical-source isolation without importing the archive. */ () => {
    const manifests = filesUnder(join(root, 'packages')).filter((file) => file.endsWith('/package.json'));

    it('finds every library package', () => {
        expect(manifests.map((file) => relative(root, dirname(file))).sort()).toEqual([
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

    it.each(manifests.map((file) => [relative(root, dirname(file)), file]))(
        '%s is an ESM package of explicit subpaths with no side effects',
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
            const usesEffect = filesUnder(join(dirname(file), 'src')).some((source) =>
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
describe('portable bundle', { timeout: 120_000 }, () => {
    const out = join(root, 'tests/boundaries/test-output/bundle');
    const portable = ['contracts', 'schema'].flatMap((name) => {
        const { exports } = JSON.parse(readFileSync(join(root, 'packages', name, 'package.json'), 'utf8'));
        return Object.keys(exports)
            .filter((subpath) => subpath !== './package.json')
            .map((subpath) => `@eventiva/${name}/${subpath.slice(2)}`);
    });

    const bundle = async (name: string, imports: ReadonlyArray<string>) => {
        mkdirSync(out, { recursive: true });
        const entry = join(out, `${name}.ts`);
        writeFileSync(
            entry,
            imports.map((from, index) => `import * as m${index} from '${from}';`).join('\n') +
                `\nexport const all = [${imports.map((_, index) => `m${index}`).join(', ')}];\n`
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
                    resolveId(source) {
                        requested.add(source);
                        return null;
                    },
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

    it('F12 contains only the portable packages and effect, with no Node import', async () => {
        const { modules, requested, code } = await bundle('portable', portable);
        expect(portable).toEqual(expect.arrayContaining(['@eventiva/contracts/caller', '@eventiva/schema/compose']));
        // effect and everything it depends on; nothing else from node_modules.
        const closure = new Set<string>();
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
        const allowed = (id: string) =>
            /^packages\/(contracts|schema)\/src\//.test(id) ||
            id.startsWith('tests/boundaries/test-output/bundle/') ||
            // Transpilation helpers the bundler itself injects for class fields.
            id.includes('@oxc-project+runtime@') ||
            [...closure].some((name) => id.startsWith(`node_modules/.pnpm/${name.replace('/', '+')}@`));
        expect(modules.filter((id) => !allowed(id))).toEqual([]);
        const node = new Set(builtinModules.flatMap((name) => [name, `node:${name}`]));
        expect(requested.filter((source) => node.has(source))).toEqual([]);
        // Control for F13: the full bundle does carry these service keys.
        expect(code).toContain('@eventiva/contracts/Authorizer');
        expect(code).toContain('@eventiva/contracts/Flags');
    });

    it('F13 drops every subpath an importer does not use', async () => {
        const { modules, code } = await bundle('ids-only', ['@eventiva/contracts/ids']);
        expect(modules.filter((id) => id.startsWith('packages/'))).toEqual(['packages/contracts/src/ids.ts']);
        expect(code).not.toContain('@eventiva/contracts/Authorizer');
        expect(code).not.toContain('@eventiva/contracts/Flags');
    });

    it('F14 compiles to Hermes bytecode with the compiler React Native ships', async () => {
        const { file } = await bundle('hermes', portable);
        const fromClient = createRequire(join(root, 'apps/client/package.json'));
        const fromNative = createRequire(fromClient.resolve('react-native/package.json'));
        const compiler = dirname(fromNative.resolve('hermes-compiler/package.json'));
        const platform = { linux: 'linux64-bin', darwin: 'osx-bin', win32: 'win64-bin' }[process.platform as string];
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
});
