/**
 * @file tests/telemetry/benchmark/check.mjs
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
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInThisContext } from 'node:vm';
import { build } from 'vite';

/**
 * Qualify both compositions against their own paired native samples. Fix the trial count before sampling;
 * a noisy trial cannot trigger a discretionary retry or move the threshold.
 * @param {Function} benchmark - Executes the matched workload for one timer composition.
 * @param {boolean} goal - Additionally check the ongoing 2x goal after enforcing the release gate.
 * @returns {Promise<void>} Rejects incomplete evidence or a failed mode after both modes have run.
 */
export async function qualify(benchmark, goal = false) {
    const violations = [];
    for (const testTimer of [false, true]) {
        const ratios = [];
        for (let trial = 0; trial < 5; trial++) {
            const row = await benchmark(testTimer);
            assert.equal(row.testTimer, testTimer);
            assert.equal(row.total, 688800);
            for (const arm of [row.result.native, row.result.observed]) {
                assert.equal(arm.n, 7200);
                for (const value of [arm.p50us, arm.p95us, arm.meanUs]) assert.ok(Number.isFinite(value) && value > 0);
                assert.ok(arm.p95us >= arm.p50us);
            }
            const ratio = row.result.observed.p50us / row.result.native.p50us;
            ratios.push(ratio);
            console.log(JSON.stringify({ trial, ratio, ...row }));
        }
        ratios.sort((a, b) => a - b);
        const medianRatio = ratios[2];
        if (!(medianRatio < 3) || (goal && medianRatio > 2)) violations.push({ testTimer, medianRatio });
    }
    assert.deepEqual(
        violations,
        [],
        goal ? '2x optimization goal not met' : 'Matched p50 must be strictly below 3x in both modes'
    );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const output = await build({
        configFile: false,
        logLevel: 'silent',
        resolve: { conditions: ['@eventiva/source', 'browser', 'module', 'import', 'default'] },
        build: {
            write: false,
            minify: false,
            target: 'es2022',
            lib: { entry: fileURLToPath(new URL('workload.ts', import.meta.url)), formats: ['iife'], name: 'Eve44' },
        },
    });
    const chunk = (Array.isArray(output) ? output[0] : output).output.find((item) => item.type === 'chunk');
    const benchmark = runInThisContext(`${chunk.code}\nEve44.benchmark`);
    await qualify(benchmark, process.argv.includes('--target-2x'));
}
