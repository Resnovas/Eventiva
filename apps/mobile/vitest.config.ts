import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineProject } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const workspaceRoot = path.resolve(projectRoot, '../../');

export default defineProject({
  plugins: [
    tsconfigPaths({
      root: workspaceRoot,
      projects: [path.join(workspaceRoot, 'tsconfig.base.json'), path.join(projectRoot, 'tsconfig.json')],
    }),
  ],
  resolve: {
    alias: {
      'react-native': path.join(projectRoot, 'src/__mocks__/react-native.ts'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    root: projectRoot,
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    environment: 'node',
    globals: true,
    passWithNoTests: true,
  },
});
