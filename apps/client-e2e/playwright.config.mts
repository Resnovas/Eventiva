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
import { Config, Effect, Option } from 'effect';

const port = 4317;
const evidence = Option.getOrUndefined(Effect.runSync(Config.option(Config.string('EVE_EVIDENCE_DIR'))));

/**
 * The web smoke test configuration. It serves the exported client (`nx run @eventiva/client:export-web`) with Expo's
 * static server and checks it in Chromium; nothing is deployed. Set `EVE_EVIDENCE_DIR` to keep traces and reports.
 *
 * @since 0.0.1
 * @example
 * pnpm nx run @eventiva/client-e2e:e2e
 */
export default defineConfig({
    ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
    retries: 0,
    ...(evidence === undefined
        ? {}
        : {
              outputDir: evidence,
              reporter: [['list'], ['json', { outputFile: `${evidence}/test-results.json` }]],
          }),
    use: {
        baseURL: `http://localhost:${port}`,
        trace: 'retain-on-failure',
        screenshot: evidence === undefined ? 'only-on-failure' : 'on',
    },
    webServer: {
        command: `pnpm --filter @eventiva/client exec expo serve dist/web --port ${port}`,
        url: `http://localhost:${port}`,
        reuseExistingServer: false,
        cwd: workspaceRoot,
        timeout: 120_000,
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
