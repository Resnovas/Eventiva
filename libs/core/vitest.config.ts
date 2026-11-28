/**
 * Vitest config for @eventiva/core-db.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineProject } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const workspaceRoot = path.resolve(projectRoot, '../../../');

export default defineProject({
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
      include: ['**/libs/core/src/**/*.ts'],
      exclude: ['**/libs/core/src/__tests__/**', '**/libs/core/src/index.ts'],
      all: true,
      cleanOnRerun: true,
    },
  },
});