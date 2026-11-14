/**
 * @file apps/client-e2e/playwright.config.mts
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

import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';
import { defineConfig, devices } from '@playwright/test';

// The web smoke serves the exported client (nx run @eventiva/client:export-web)
// with Expo's static server and checks it in Chromium. Nothing is deployed.
const port = 4317;

export default defineConfig({
    ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
    use: { baseURL: `http://localhost:${port}`, trace: 'retain-on-failure' },
    webServer: {
        command: `pnpm --filter @eventiva/client exec expo serve dist/web --port ${port}`,
        url: `http://localhost:${port}`,
        reuseExistingServer: false,
        cwd: workspaceRoot,
        timeout: 120_000,
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
