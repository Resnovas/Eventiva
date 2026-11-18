/**
 * @file apps/server/src/agent-output.ts
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

import { AgentOutputLog, OutputRead } from '@eventiva/contracts/agent-output';
import { Caller } from '@eventiva/contracts/caller';
import { TenantRouter } from '@eventiva/contracts/storage';
import { Effect, Schema } from 'effect';
import { AgentRunDenied, AgentRunReference, authorizeAgentOutput } from './agent-run.ts';

/** Explicit limits and exclusive cursor are mandatory; initial callers use after:-1, reconnects their last consumed offset. */
export const AgentOutputRead = Schema.Struct({
    ...AgentRunReference.fields,
    after: OutputRead.fields.after,
    limit: OutputRead.fields.limit,
});
export type AgentOutputRead = typeof AgentOutputRead.Type;

/** Poll this bounded durable read at 200 ms; only a successfully consumed event advances the client's cursor. */
export const readAgentOutput = (input: AgentOutputRead) =>
    Effect.gen(
        /** Decode before authority lookup, then refresh run ownership on every page without caching transport replies. */ function* () {
            const value = yield* Schema.decodeUnknown(AgentOutputRead)(input, { onExcessProperty: 'error' });
            yield* authorizeAgentOutput(value);
            const tenant = value.caller.tenant;
            if (tenant === undefined) return yield* new AgentRunDenied({ reason: 'denied' });
            const log = yield* AgentOutputLog;
            return yield* (yield* TenantRouter)
                .run(tenant, log.read({ runId: value.runId, after: value.after, limit: value.limit }))
                .pipe(Effect.provideService(Caller, value.caller));
        }
    ).pipe(
        Effect.catchTags({
            /** Invalid cursors and bounds never expose parser input. */
            ParseError: () => Effect.fail(new AgentRunDenied({ reason: 'invalid' })),
            /** SQL failures omit diagnostics and release no partial page. */
            AgentOutputFailure: () => Effect.fail(new AgentRunDenied({ reason: 'unavailable' })),
            /** Routing remains independently live after the run ownership check. */
            RoutingDenied: () => Effect.fail(new AgentRunDenied({ reason: 'denied' })),
        })
    );

/** Wait for one nonempty bounded page at 200 ms cadence; interruption stops polling, and every retry reauthorizes. */
export const pollAgentOutput = (input: AgentOutputRead) =>
    Effect.gen(
        /** Empty pages are not terminal; every attempt reads committed data through fresh authorization. */ function* () {
            while (true) {
                const events = yield* readAgentOutput(input);
                if (events.length > 0) return events;
                yield* Effect.sleep('200 millis');
            }
        }
    );
