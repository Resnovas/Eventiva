/**
 * @file ai-docs/src/24_trust/02_replay.ts
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
 * @title Compose standalone durable nonce consumption
 * Apply storage migrations through 0007 before building this unactivated adapter.
 * Run only outside ambient SQL transactions, after independent trusted checks.
 * The receipt is an opaque reference, not release authority or revocation proof.
 * There are no retention, cleanup, activation or policy defaults.
 * See docs/trust-replay.md for failure handling and deployment limitations.
 */
import { TrustReplay, type TrustPolicy, type TrustRequest } from '@eventiva/contracts/trust';
import { trustReplay } from '@eventiva/integrations.sql/trust';
import { Effect } from 'effect';

/** The returned Effect still requires the intended trust database's SqlClient. */
export const consumeOnce = (request: TrustRequest, trustedPolicy: TrustPolicy) =>
    TrustReplay.pipe(
        Effect.flatMap(
            /** Consume against the injected durable authority only after the caller's independent trust checks. */ (
                replay
            ) => replay.consume(request, trustedPolicy)
        ),
        Effect.provide(trustReplay)
    );
