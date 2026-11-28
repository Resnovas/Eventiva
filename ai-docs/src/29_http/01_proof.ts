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

/**
 * Resolve live identity on the routed tenant before listing any action metadata.
 *
 * @title Inspect current inventory only after credential verification inside one trusted tenant
 */
import { ActionInventory } from '@eventiva/contracts/inventory';
import { authenticateTokenSession, type TokenPolicy } from '@eventiva/runtime/identity';
import { Effect, type Redacted } from 'effect';

/**
 * Exclude sensitive actions from the currently visible inventory; visibility is not execution permission.
 *
 * @param proof - Protected token, not a principal UUID or provider subject.
 * @param policy - Trusted issuer, audience and scope requirements.
 * @returns A tenant-local inventory read that fails closed if authentication fails.
 * @since 0.0.0
 * @example
 * const listing = inspectAfterProof(protectedToken, serverPolicy);
 */
export const inspectAfterProof = (proof: Redacted.Redacted<string>, policy: TokenPolicy) =>
    Effect.gen(
        /** Resolve the canonical tenant-local identity before asking the real registered inventory for current visibility. */ function* () {
            const authenticated = yield* authenticateTokenSession(proof, policy);
            const inventory = yield* ActionInventory;
            const visible = yield* inventory.list(authenticated.caller);
            return visible.filter(
                /**
                 * Apply the local HTTP projection's conservative exclusion.
                 *
                 * @param action - Descriptor already visible to the authenticated caller.
                 * @returns Whether this descriptor can appear in the nonsensitive listing.
                 */ (
                    action
                ) => !action.sensitive
            );
        }
    );
