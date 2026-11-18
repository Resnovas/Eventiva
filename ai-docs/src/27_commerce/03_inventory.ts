/**
 * @file ai-docs/src/27_commerce/03_inventory.ts
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

import { ActionHost } from '@eventiva/runtime/host';
import { productModule } from '@eventiva/runtime/inventory-product';
import { Effect } from 'effect';

/**
 * Register only inside trusted tenant routing after productResources migration and Resources policy composition.
 * The ActionHost must share the provider's Storage owner for durable Integrity/Audit; Caller is supplied per call.
 * No application activation occurs here. Keep inventory.f6-inventory default-off while discovery compatibility is unresolved.
 */
export const registerPrivateProducts = Effect.gen(
    /** Register the same portable specifications and backend handlers for every authorized invocation surface. */ function* () {
        const host = yield* ActionHost;
        return yield* host.register(yield* productModule);
    }
);
