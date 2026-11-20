/**
 * @file tools/test-process/check.test.mjs
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

import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { ESLint } from 'eslint';

const root = fileURLToPath(new URL('../../', import.meta.url));
const eslint = new ESLint({ cwd: root, ignore: false });

/** Exercise the actual required rule configuration, not a copied rule or a test-only selector. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */
const restrictions = async (source, file = 'tests/telemetry/src/bootstrap-diagnostics.spec.ts') => {
    const [result] = await eslint.lintText(source, { filePath: root + file });
    return result.messages.filter(
        /** Retain only the actual boundary diagnostics. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ (
            message
        ) => ['no-restricted-imports', 'no-restricted-syntax'].includes(message.ruleId)
    );
};

test('bootstrap probes reject original and alternate direct subprocess imports with the replacement named', /** Retain all original rejection controls. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ async () => {
    for (const source of [
        'import { spawnSync } from "node:child_process"; void spawnSync;',
        'import * as child from "child_process"; void child;',
        'void import("node:child_process");',
        'void require("child_process");',
    ]) {
        const messages = await restrictions(source);
        assert.equal(messages.length, 1, source);
        assert.match(messages[0].message, /childTests\/runChild.*timing.*budget|childTests\/runChild.*budget.*timing/);
    }
});

test('the measured harness and unrelated built-ins remain usable without a baseline', /** Distinguish the correction from a globally unusable import policy. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ async () => {
    assert.deepEqual(await restrictions('import { runChild } from "./child-process.ts"; void runChild;'), []);
    assert.deepEqual(await restrictions('import { fileURLToPath } from "node:url"; void fileURLToPath;'), []);
});
