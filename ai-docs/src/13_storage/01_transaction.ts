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
 * Provide the same tenant-scoped Storage service to Integrity and handlers.
 * The runtime supplies the validated successful receipt and rechecks live gates.
 *
 * @title Commit an action with its outbox command
 */
import type { Receipt } from '@eventiva/contracts/receipt';
import { Storage } from '@eventiva/contracts/storage';
import { Integrity } from '@eventiva/runtime/invocation';
import { Effect } from 'effect';

/**
 * Commit the invoice command on the receipt's tenant storage so neither write can survive alone.
 *
 * @param receipt - Successful invocation receipt with the admitted action version.
 * @returns An Effect that stages the durable command without dispatching an invoice.
 * @since 0.0.0
 * @example
 * const commit = stage(successfulReceipt);
 */
export const stage = (receipt: Receipt & { readonly version: number }) =>
    Effect.gen(
        /** Couple outbox staging to integrity commit rather than dispatching an external invoice during the transaction. */ function* () {
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
                Effect.gen(
                    /** Stage only the durable command and return the receipt; delivery belongs to an outbox consumer. */ function* () {
                        yield* storage.enqueue('invoice:1', {
                            type: 'send-invoice',
                            minorUnits: '9007199254740993',
                            currency: 'GBP',
                        });
                        return { output: { queued: true }, receipt };
                    }
                )
            );
        }
    );
