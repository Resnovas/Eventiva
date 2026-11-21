/**
 * @file tests/telemetry/fixtures/bootstrap-diagnostics.mjs
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

import { subscribe } from 'node:diagnostics_channel';
import { fstatSync, writeSync } from 'node:fs';
import { registerHooks } from 'node:module';

// No Effect import here: child-start must precede the application's module graph.
const seen = new Set();
let bytes = 0;
let available = false;
try {
    const descriptor = fstatSync(3);
    available = descriptor.isFIFO() || descriptor.isSocket();
} catch (error) {
    if (!error || typeof error !== 'object' || error.code !== 'EBADF') throw error;
}

/** Keep a deduplicated, phase-only journal below one pipe buffer, including under malformed event floods. */
const record = (phase) => {
    if (!available || typeof phase !== 'string' || phase.length > 64 || seen.has(phase)) return;
    // Reject terminal line breaks too: JavaScript's dollar anchor alone permits a final newline.
    if (
        !/^(?:child-start|module-first|module-64|module-256|module-1024|entry-source-loaded|effect-source-loaded|root-start|bootstrap-failure-logged|process-before-exit|process-exit-success|process-exit-failure|(?:main-use-exit|main-services-released|main-telemetry-released|bootstrap-use-exit|root-exit):(?:success|failure|interrupted))(?![\s\S])/.test(
            phase
        )
    )
        return;
    const line = `${JSON.stringify([phase, Math.round(performance.timeOrigin + performance.now())])}\n`;
    if (bytes + Buffer.byteLength(line) > 4096) return;
    seen.add(phase);
    bytes += Buffer.byteLength(line);
    try {
        writeSync(3, line);
    } catch {
        // Observability is optional even when the parent closes its journal pipe.
        available = false;
    }
};

record('child-start');
subscribe('eventiva.bootstrap.lifecycle', record);
let modules = 0;
registerHooks({
    /** Observe source availability, not evaluation; return the loader's result untouched. */
    load(url, context, nextLoad) {
        const source = nextLoad(url, context);
        modules += 1;
        if (modules === 1) record('module-first');
        if (modules === 64) record('module-64');
        if (modules === 256) record('module-256');
        if (modules === 1024) record('module-1024');
        if (url.endsWith('/apps/server/src/main.ts')) record('entry-source-loaded');
        if (url.endsWith('/effect/dist/esm/index.js')) record('effect-source-loaded');
        return source;
    },
});
process.on(
    'beforeExit',
    /** Observe natural drain without scheduling work or retaining resources. */ () => record('process-before-exit')
);
process.on(
    'exit',
    /** Observe Node teardown without replacing runMain's exit or installing signal handlers. */ (code) =>
        record(code === 0 ? 'process-exit-success' : 'process-exit-failure')
);
