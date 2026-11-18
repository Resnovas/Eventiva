/**
 * @file apps/server/src/http-entry.ts
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

import { createServer } from 'node:http';
import * as NodeHttpServer from '@effect/platform-node/NodeHttpServer';
import type { TokenPolicy } from '@eventiva/runtime/identity';
import { Config, Effect } from 'effect';
import { httpActions } from './http-actions.ts';

/**
 * Acquire only a scoped IPv4 loopback listener, never a deployed/public ingress.
 * The caller must compose real OIDC verification, routed SQL identity/inventory and the existing backend ClusterActions.
 * There is intentionally no autonomous shell bootstrap or accepting fallback for missing critical services.
 */
export const serveLocalHttp = (policy: TokenPolicy) =>
    Effect.gen(
        /** Validate the local deployment boundary before opening a socket; the scope owns all listener teardown. */ function* () {
            // Reject production configuration before acquiring a listener; this transport is deliberately loopback-only.
            yield* Config.literal('development', 'staging', 'test')('EVENTIVA_ENVIRONMENT');
            const port = yield* Config.integer('HTTP_PORT').pipe(
                Config.withDefault(34446),
                Config.validate({
                    message: 'HTTP_PORT must be between 0 and 65535.',
                    /** Port zero requests an ephemeral local socket for isolated tests. */ validation: (value) =>
                        value >= 0 && value <= 65535,
                })
            );
            const server = yield* NodeHttpServer.make(createServer, { host: '127.0.0.1', port });
            yield* server.serve(httpActions(policy));
            return server.address;
        }
    );
