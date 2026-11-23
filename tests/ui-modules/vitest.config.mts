/**
 * @file tests/ui-modules/vitest.config.mts
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

import { defineConfig } from 'vitest/config';
import { testProject } from '../../vitest.shared.ts';

const shared = testProject(
    'ui-module-tests',
    ['packages/contracts/src/ui-module.ts', 'packages/ui-modules/src/*.ts', 'packages/ui-modules/src/*.tsx'],
    import.meta.url
);
/**
 * The UI module test project: declarative module, registry and screen context specs, measuring coverage of the UI
 * module contract and the ui-modules package.
 *
 * @since 0.0.1
 * @example
 * pnpm nx run @eventiva/ui-module-tests:test
 */
export default defineConfig({
    ...shared,
    test: { ...shared.test, include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'] },
});
