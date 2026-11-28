import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineProject } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { workspaceLinkedPackagesVite } from '../../../tests/vitest-coverage-preset.js';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const workspaceRoot = path.resolve(projectRoot, '../../../');

export default defineProject({
    ...workspaceLinkedPackagesVite,
    plugins: [
        tsconfigPaths({
            root: workspaceRoot,
            projects: [path.join(workspaceRoot, 'tsconfig.base.json'), path.join(projectRoot, 'tsconfig.json')],
        }),
    ],
    test: {
        root: projectRoot,
        include: ['src/**/*.spec.ts'],
        environment: 'node',
        globals: false,
        passWithNoTests: true,
        coverage: {
            provider: 'v8',
            allowExternal: true,
            reportsDirectory: path.join(projectRoot, 'coverage'),
            reporter: ['text', 'text-summary', 'json-summary', 'html', 'lcov'],
            include: ['**/libs/domain/gdpr/src/**/*.ts'],
            exclude: ['**/libs/domain/gdpr/src/__tests__/**', '**/libs/domain/gdpr/src/index.ts'],
            all: true,
            cleanOnRerun: true,
            thresholds: {
                statements: 90,
                branches: 90,
                functions: 85,
                lines: 90,
            },
        },
    },
});
