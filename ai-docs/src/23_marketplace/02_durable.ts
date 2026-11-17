/**
 * @file ai-docs/src/23_marketplace/02_durable.ts
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
 * @title Record local marketplace metadata only
 * Apply migration 0006 before composing the captured trusted marketplace client.
 * Caller, CurrentTenant, live MarketplaceOperatorPolicy and MarketplaceAuthority
 * remain required. No policy defaults, external invocation or payload release.
 */
import { MarketplaceOutbox, type ClaimExchange } from '@eventiva/contracts/marketplace-durable';
import { marketplace } from '@eventiva/integrations.sql/marketplace';
import type { Dialect } from '@eventiva/integrations.sql/migrations';
import { Effect } from 'effect';

/** Explicit lease/retry bounds come from approved policy, never this example. */
export const recordLocalMetadata = (dialect: Dialect, input: ClaimExchange) =>
    Effect.gen(function* () {
        const outbox = yield* MarketplaceOutbox;
        const claim = yield* outbox.claim(input);
        if (claim !== undefined) yield* outbox.settle({ claim, outcome: { state: 'recorded' } });
    }).pipe(Effect.provide(marketplace(dialect)));
