/**
 * @file apps/client-e2e/src/shell.spec.ts
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

import { expect, test } from '@playwright/test';

test('the exported web client renders the localised shell with safe flag defaults', /** Verify the exported bundle localizes ICU messages without browser errors or an enabled optional banner. */ async ({
    page
}) => {
    const errors: Array<string> = [];
    page.on(
        'pageerror',
        /** Retain uncaught browser failures for the final assertion. */ (error) => errors.push(error.message)
    );
    page.on(
        'console',
        /** Treat error-level console output as a shell regression, ignoring routine diagnostics. */ (message) => {
            // Uncaught exceptions are captured separately; console diagnostics fail this proof only at error level.
            if (message.type() === 'error') errors.push(message.text());
        }
    );

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Eventiva' })).toBeVisible();
    // An ICU plural message, formatted through react-intl and Intl.PluralRules.
    await expect(page.getByTestId('modules')).toHaveText('0 modules installed');
    // No provider is configured, so the optional banner keeps its safe default: off.
    await expect(page.getByTestId('offline-banner')).toHaveCount(0);
    expect(errors).toEqual([]);
});
