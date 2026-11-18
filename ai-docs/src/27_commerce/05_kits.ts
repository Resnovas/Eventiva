/**
 * @file ai-docs/src/27_commerce/05_kits.ts
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

import { DefineKit, GetKit } from '@eventiva/contracts/inventory-kit';
import { ActionHost } from '@eventiva/runtime/host';
import { kitModule } from '@eventiva/runtime/inventory-kit';
import { Effect } from 'effect';

/**
 * Register alongside productModule only after kit/product Resources migration and tenant-local live policy composition.
 * Share provider Storage with durable Integrity/Audit; supply Caller per invocation, not here.
 * This compiling example does not install or enable the default-off inventory capability.
 */
export const registerPrivateKits = Effect.gen(
    /** Keep all surfaces on the same common host instead of calling a private handler or alternate kit writer. */ function* () {
        const host = yield* ActionHost;
        return yield* host.register(yield* kitModule);
    }
);

/** A complete counted composition example; the two existing Product IDs must belong to the authenticated tenant. */
export const defineAndReadKit = Effect.gen(
    /** Retain the original write key for acknowledgement recovery; a new key is not an overwrite or replay mechanism. */ function* () {
        // This is composition metadata only: no quantity is added to stock and no product revision is changed.
        const host = yield* ActionHost;
        const id = '019b0000-0000-7000-8000-000000000010';
        yield* host.invoke(
            DefineKit.name,
            {
                id,
                revision: 0,
                components: [
                    { product: '019b0000-0000-7000-8000-000000000011', quantity: 7, optional: false },
                    { product: '019b0000-0000-7000-8000-000000000012', quantity: 2, optional: true },
                ],
            },
            { idempotencyKey: '019b0000-0000-7000-8000-000000000099' }
        );
        return yield* host.invoke(GetKit.name, { id });
    }
);
