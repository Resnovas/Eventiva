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

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from '@effect/vitest';
import { ESLint } from 'eslint';

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

describe('package hygiene', () => {
    const manifests = filesUnder(join(root, 'packages')).filter((file) => file.endsWith('/package.json'));

    it('finds every library package', () => {
        expect(manifests.map((file) => relative(root, dirname(file))).sort()).toEqual([
            'packages/contracts',
            'packages/integrations/formatjs',
            'packages/integrations/openfeature-client',
            'packages/integrations/openfeature-server',
            'packages/integrations/posthog-client',
            'packages/integrations/posthog-server',
            'packages/runtime',
            'packages/schema',
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
                expect(target).toMatchObject({ '@eventiva/source': expect.stringMatching(/^\.\/src\/.+\.ts$/) });
            }
            // One shared copy of effect: a peer wherever the sources use it, never a direct dependency.
            const usesEffect = filesUnder(join(dirname(file), 'src')).some((source) =>
                /from 'effect'/.test(readFileSync(source, 'utf8'))
            );
            expect(manifest.peerDependencies).toEqual(usesEffect ? { effect: 'catalog:' } : undefined);
            expect(manifest.dependencies?.effect).toBeUndefined();
        }
    );

    it('keeps the historical snapshots out of every production import', () => {
        const sources = ['apps', 'packages'].flatMap((top) => filesUnder(join(root, top)));
        const offenders = sources.filter((file) => /\.(ts|tsx|js|mjs|json)$/.test(file) && /Examples\//.test(readFileSync(file, 'utf8')));
        expect(offenders).toEqual([]);
    });
});
