/**
 * @file vitest.shared.ts
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

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const workspaceRoot = dirname(fileURLToPath(import.meta.url));

/**
 * The shared Vitest settings every test project extends. Tests live in their
 * own Nx projects under `tests/<package>/src/**`, mirroring the package they
 * test, and resolve workspace packages to their TypeScript sources through the
 * `@eventiva/source` condition. Coverage of the package under test below 90%
 * fails the run.
 *
 * @param name - The test project's name.
 * @param covers - Source globs of the package under test, relative to the workspace root.
 * @param configUrl - The suite config's import.meta.url, anchoring discovery and reports.
 */
export const testProject = (name: string, covers: ReadonlyArray<string>, configUrl: string) => {
    const projectRoot = dirname(fileURLToPath(configUrl));
    return defineConfig({
        // Vitest only transforms uncovered TypeScript inside the Vite root.
        root: workspaceRoot,
        resolve: { conditions: ['@eventiva/source'] },
        ssr: { resolve: { conditions: ['@eventiva/source'] } },
        test: {
            name,
            dir: projectRoot,
            watch: false,
            environment: 'node',
            include: ['src/**/*.spec.ts'],
            coverage: {
                enabled: covers.length > 0,
                provider: 'v8',
                reportsDirectory: join(projectRoot, 'test-output/coverage'),
                allowExternal: true,
                include: covers.map((glob) => join(workspaceRoot, glob)),
                thresholds: { lines: 90, functions: 90, statements: 90, branches: 90 },
            },
        },
    });
};
