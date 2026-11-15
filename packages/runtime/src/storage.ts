/**
 * @file packages/runtime/src/storage.ts
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

import { Receipt } from '@eventiva/contracts/receipt';
import { Conflict, CurrentTenant, Json, Storage, StorageFailure } from '@eventiva/contracts/storage';
import { Effect, Layer, Schema } from 'effect';
import { Audit, AuditUnavailable, canonicalJson, Integrity, InvocationDenied } from './invocation.ts';

/** Build inside a tenant route. No drivers, global client, external effects or in-memory audit fallback. */
export const durable = Layer.unwrapEffect(
    Effect.gen(function* () {
        const storage = yield* Storage;
        const tenant = yield* CurrentTenant;
        const receiptJson = (receipt: Receipt) =>
            Schema.encode(Schema.parseJson(Receipt))(receipt).pipe(Effect.flatMap(Schema.decodeUnknown(Json)));
        return Layer.mergeAll(
            Layer.succeed(
                Audit,
                Audit.of({
                    ready: (action) => storage.ready.pipe(Effect.mapError(() => new AuditUnavailable({ action }))),
                    record: (receipt, _allowSpool) =>
                        Effect.gen(function* () {
                            if (receipt.caller.tenant !== tenant.id)
                                return yield* new AuditUnavailable({ action: receipt.action });
                            const body = yield* receiptJson(receipt).pipe(
                                Effect.mapError(() => new AuditUnavailable({ action: receipt.action }))
                            );
                            yield* storage
                                .audit(receipt.id, body)
                                .pipe(Effect.mapError(() => new AuditUnavailable({ action: receipt.action })));
                            return 'durable' as const;
                        }),
                })
            ),
            Layer.succeed(
                Integrity,
                Integrity.of({
                    commit: (request, execute) =>
                        Effect.gen(function* () {
                            if (request.caller.tenant !== tenant.id)
                                return yield* new InvocationDenied({
                                    action: request.action,
                                    reason: 'tenant-scope-mismatch',
                                });
                            const key = JSON.stringify([
                                request.caller.tenant,
                                request.caller.subject,
                                request.caller.onBehalfOf ?? null,
                                request.action,
                                request.version,
                                request.key,
                            ]);
                            const committed = yield* storage
                                .commit(
                                    { key, inputHash: request.inputHash },
                                    Effect.gen(function* () {
                                        const result = yield* execute;
                                        const receipt = yield* Schema.decodeUnknown(Receipt)(result.receipt).pipe(
                                            Effect.mapError(() => new AuditUnavailable({ action: request.action }))
                                        );
                                        if (
                                            receipt.outcome !== 'succeeded' ||
                                            receipt.action !== request.action ||
                                            receipt.version !== request.version ||
                                            receipt.inputHash !== request.inputHash ||
                                            receipt.caller.tenant !== tenant.id ||
                                            receipt.caller.subject !== request.caller.subject ||
                                            receipt.caller.kind !== request.caller.kind ||
                                            receipt.caller.session !== request.caller.session ||
                                            receipt.caller.onBehalfOf !== request.caller.onBehalfOf
                                        ) {
                                            return yield* new AuditUnavailable({ action: request.action });
                                        }
                                        const output = yield* Effect.flatMap(
                                            canonicalJson(result.output),
                                            Schema.decodeUnknown(Json)
                                        ).pipe(Effect.mapError(() => new AuditUnavailable({ action: request.action })));
                                        const body = yield* receiptJson(receipt).pipe(
                                            Effect.mapError(() => new AuditUnavailable({ action: request.action }))
                                        );
                                        return { output, receipt: body };
                                    })
                                )
                                .pipe(
                                    Effect.mapError((error) =>
                                        error instanceof StorageFailure
                                            ? new AuditUnavailable({ action: request.action })
                                            : error instanceof Conflict
                                              ? new InvocationDenied({ action: request.action, reason: error.reason })
                                              : error
                                    )
                                );
                            const receipt = yield* Schema.decodeUnknown(Receipt)(committed.receipt).pipe(
                                Effect.mapError(() => new AuditUnavailable({ action: request.action }))
                            );
                            return { ...committed, receipt };
                        }),
                })
            )
        );
    })
);
