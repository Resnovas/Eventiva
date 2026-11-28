/**
 * @file tests/telemetry/benchmark/workload.ts
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

import { Effect, Function } from 'effect';
import { FlagsSafeDefaults } from '@eventiva/contracts/flags';
import {
    functionCatalog,
    functionObservation,
    functionTelemetryTestLayer,
} from '@eventiva/runtime/function-instrumentation';

const native = Effect.fn('bench.operation', { captureStackTrace: false })(
    /** Use the identical asymmetric arithmetic in both benchmark arms. */ function* (a: number, b: number) {
        return yield* Effect.succeed(a * 10 + b);
    }
);
/** Measure one production or profiling trial with six retained, order-alternating rounds. */
export const benchmark = (testTimer: boolean) =>
    Effect.runPromise(
        Effect.scoped(
            Effect.gen(
                /** Prepare once outside the timed loop and verify business results via the returned checksum. */ function* () {
                    const catalog = yield* functionCatalog(['bench.operation']);
                    const observation = yield* functionObservation(catalog, 'bench.operation');
                    const samples: { native: number[]; observed: number[] } = { native: [], observed: [] };
                    let total = 0;
                    for (let round = 0; round < 7; round++) {
                        for (const variant of round % 2 === 0
                            ? (['native', 'observed'] as const)
                            : (['observed', 'native'] as const)) {
                            for (let index = 0; index < 1200; index++) {
                                const begin = performance.now();
                                total += yield* variant === 'native' ? native(4, 1) : native(4, 1).pipe(observation);
                                const elapsed = (performance.now() - begin) * 1000;
                                if (round > 0) samples[variant].push(elapsed);
                            }
                        }
                    }
                    const result = Object.fromEntries(
                        Object.entries(samples).map(
                            /** Report order statistics in microseconds after discarding warmup. */ ([
                                name,
                                values,
                            ]) => {
                                values.sort(
                                    /** Order numerically rather than by decimal string representation. */ (a, b) =>
                                        a - b
                                );
                                return [
                                    name,
                                    {
                                        n: values.length,
                                        p50us: values[Math.floor(values.length * 0.5)],
                                        p95us: values[Math.floor(values.length * 0.95)],
                                        meanUs:
                                            values.reduce(
                                                /** Sum every retained measurement, including tail latency. */ (a, b) =>
                                                    a + b,
                                                0
                                            ) / values.length,
                                    },
                                ];
                            }
                        )
                    );
                    return { testTimer, total, result };
                }
            ).pipe(
                Effect.provide(FlagsSafeDefaults),
                testTimer ? Effect.provide(functionTelemetryTestLayer) : Function.identity
            )
        )
    );
