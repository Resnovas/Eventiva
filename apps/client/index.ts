/**
 * @file apps/client/index.ts
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

import './src/polyfills.ts';
import { registerRootComponent } from 'expo';
import { Effect, Fiber } from 'effect';
import { App } from './src/App.tsx';
import { startup } from './src/bootstrap.ts';
import { FlagsLive } from './src/flags.ts';

/** Metro supplies the optional development disposal hook; it is not a production service dependency. */
declare const module: {
    readonly hot?: {
        /** Request release of the old application's providers when Metro disposes this entry module. */
        dispose(/** Metro invokes this callback when disposing the entry module. */ callback: () => void): void;
    };
};

const application = Effect.runSync(
    startup.start(
        Effect.sync(
            /** Make the native root available immediately; product content waits for the shared readiness snapshot. */ () =>
                registerRootComponent(App)
        ),
        FlagsLive
    )
);

module.hot?.dispose(
    /** Interrupt the application scope so provider subscriptions are released on module replacement. */ () => {
        Effect.runFork(Fiber.interrupt(application));
    }
);
