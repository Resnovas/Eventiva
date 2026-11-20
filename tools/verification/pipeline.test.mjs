/**
 * @file tools/verification/pipeline.test.mjs
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
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { verificationStages } from './pipeline.mjs';

const manifest = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const nx = JSON.parse(readFileSync(new URL('../../nx.json', import.meta.url), 'utf8'));

/**
 * Preserve the static-first funnel while allowing measured independent Nx work.
 * The earlier seven-stage candidate passed at two tasks in 924.58s and failed at four in 935.82s.
 * Reconciled full verification and all three selected proofs passed in 983.71s; assertions alone do not qualify it.
 */
test('verification preserves every gate and dependency barrier without serializing independent Nx work', /** Guard the actual manifest, not a duplicated runner. @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/core-qualification/telemetry-timeouts.md#function-optimization-review */ () => {
    assert.deepEqual(manifest.scripts['verify:static'].split(' && '), [
        'nx run-many -t build',
        'nx run-many -t lint typecheck',
        'node tools/resources/boundaries.mjs',
        'node tools/resources/boundaries.mjs --declarations',
    ]);
    assert.equal(manifest.scripts.verify, 'node tools/verification/pipeline.mjs');
    assert.deepEqual(
        verificationStages,
        [
            ['--run', 'verify:static'],
            ['--run', 'check'],
            [
                '--test',
                'tools/resources/boundaries.test.mjs',
                'tools/resources/types.test.mjs',
                'tools/verification/run.test.mjs',
            ],
            ['node_modules/nx/dist/bin/nx.js', 'run-many', '-t', 'test', 'build', 'parity'],
            ['node_modules/nx/dist/bin/nx.js', 'run-many', '-t', 'smoke'],
            ['--run', 'verify:features'],
        ],
        'Retain static-first ordering and every funnel gate; feature evidence keeps its separately tested serial scheduling.'
    );
    assert.equal(manifest.scripts['verify:features'], 'node tools/verification/run.mjs');
    assert.equal(
        nx.parallel,
        2,
        'Use the measured two-task Nx budget; benchmark changes against the same complete gate and inspect CPU, memory, PostgreSQL and port contention.'
    );
    assert.equal(
        nx.neverConnectToCloud,
        true,
        'Verification remains local; this optimization does not authorize Nx Cloud.'
    );
    assert.deepEqual(
        nx.targetDefaults['export-android'].dependsOn,
        ['export-web'],
        'Order Expo --clear exports through the real task graph; keep independent smoke work parallel rather than racing the shared Metro cache.'
    );
});
