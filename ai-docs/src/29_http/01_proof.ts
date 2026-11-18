/**
 * @file ai-docs/src/29_http/01_proof.ts
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

/** @title Inspect current inventory only after credential verification inside one trusted tenant */
import { ActionInventory } from '@eventiva/contracts/inventory';
import { authenticateTokenSession, type TokenPolicy } from '@eventiva/runtime/identity';
import { Effect, type Redacted } from 'effect';

/** Server-only metadata inspection, not an HTTP executor, accepting identity layer or permission snapshot. */
export const inspectAfterProof = (proof: Redacted.Redacted<string>, policy: TokenPolicy) =>
    Effect.gen(
        /** Resolve the canonical tenant-local identity before asking the real registered inventory for current visibility. */ function* () {
            // A UUID or raw provider subject is not proof; missing verification, SQL identity or policy must fail closed.
            const authenticated = yield* authenticateTokenSession(proof, policy);
            const inventory = yield* ActionInventory;
            const visible = yield* inventory.list(authenticated.caller);
            return visible.filter(
                /** Apply the same conservative sensitive-action exclusion used by the local HTTP projection. */ (
                    action
                ) => !action.sensitive
            );
        }
    );
