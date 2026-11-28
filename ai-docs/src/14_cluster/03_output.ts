/**
 * @file ai-docs/src/14_cluster/03_output.ts
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

/**
 * This privileged storage example requires an already authorized tenant route.
 * Public readers use the server's readAgentOutput seam, which reauthorizes
 * accepted ownership on every page. SQL and run-process examples live in the
 * storage/server tests; docs/agent-output.md owns bounds and crash limitations.
 *
 * @title Durable output persistence and exclusive reconnect
 */
import { AgentOutputLog } from '@eventiva/contracts/agent-output';
import { Effect } from 'effect';

/**
 * Append the same logical event twice and read strictly after the original append's offset.
 *
 * @since 0.0.0
 * @example
 * const nextPage = outputExample.pipe(Effect.map(({ nextPage }) => nextPage));
 */
export const outputExample = Effect.gen(
    /** Stable producer identity is fixed before retryable SQL; it is never a random transport identity. */ function* () {
        const log = yield* AgentOutputLog;
        const event = {
            runId: '019b0000-0000-7000-8000-000000001001',
            eventId: 'step:1:text:0',
            payload: { _tag: 'Text' as const, text: 'Scripted output' },
        };
        const committed = yield* log.append(event);
        const retry = yield* log.append(event);
        const nextPage = yield* log.read({ runId: event.runId, after: committed.offset, limit: 25 });
        return { committed, retry, nextPage };
    }
);
