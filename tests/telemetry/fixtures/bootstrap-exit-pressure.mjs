/**
 * @file tests/telemetry/fixtures/bootstrap-exit-pressure.mjs
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

import { pbkdf2 } from 'node:crypto';
import { channel } from 'node:diagnostics_channel';

// Adapt the scheduling trigger from nodejs/node#66171, not the server's exit implementation.
// --stress-concurrent-allocation parks a V8 worker when the main thread stops serving GC.
channel('eventiva.bootstrap.lifecycle').subscribe(
    /**
     * Create finite CPU/heap pressure only after the real failed root has released every Effect scope.
     *
     * @param {unknown} phase - Lifecycle phase published on the bootstrap channel; only `root-exit:failure` triggers pressure.
     */
    (phase) => {
        if (phase !== 'root-exit:failure') return;
        // Forced exit waits for the crypto pool before joining V8 workers; natural drain can still serve GC.
        pbkdf2(
            'fixture',
            'fixture',
            1500000,
            64,
            'sha512',
            /**
             * Discard fixture-only CPU work without scheduling more.
             *
             * @returns {undefined} Nothing, so the completed derivation schedules no follow-up work.
             */
            () => undefined
        );
        for (let i = 0; i < 40; i++) new Array(100000).fill(i);
    }
);
