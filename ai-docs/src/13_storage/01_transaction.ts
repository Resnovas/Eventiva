/**
 * @file ai-docs/src/13_storage/01_transaction.ts
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
 * @title Commit an action with its outbox command
 * Provide the same tenant-scoped Storage service to Integrity and handlers.
 * The runtime supplies the validated successful receipt and rechecks live gates.
 */
import type { Receipt } from '../../../packages/contracts/src/receipt.ts';
import { Storage } from '../../../packages/contracts/src/storage.ts';
import { Integrity } from '../../../packages/runtime/src/invocation.ts';
import { Effect } from 'effect';

export const stage = (receipt: Receipt & { readonly version: number }) =>
    Effect.gen(function* () {
        const storage = yield* Storage;
        const integrity = yield* Integrity;
        return yield* integrity.commit(
            {
                key: 'example:invoice:1',
                inputHash: receipt.inputHash,
                caller: receipt.caller,
                action: receipt.action,
                version: receipt.version,
            },
            Effect.gen(function* () {
                yield* storage.enqueue('invoice:1', {
                    type: 'send-invoice',
                    minorUnits: '9007199254740993',
                    currency: 'GBP',
                });
                return { output: { queued: true }, receipt };
            })
        );
    });
