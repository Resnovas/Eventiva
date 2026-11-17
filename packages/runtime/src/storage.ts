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
    Effect.gen(
        /** Bind audit and mutation-integrity services to this route's storage owner and tenant, with no spool fallback. */ function* () {
            // Capture tenant and storage together at route composition; invocation must not select a different tenant's durable owner.
            const storage = yield* Storage;
            const tenant = yield* CurrentTenant;
            /** Encode validated receipt structure into portable JSON for the storage boundary without preserving class instances. */
            const receiptJson = (receipt: Receipt) =>
                Schema.encode(Schema.parseJson(Receipt))(receipt).pipe(Effect.flatMap(Schema.decodeUnknown(Json)));
            return Layer.mergeAll(
                Layer.succeed(
                    Audit,
                    Audit.of({
                        /** Translate storage readiness failures to the bounded action audit failure. */
                        ready: (action) =>
                            storage.ready.pipe(
                                Effect.mapError(
                                    /** Keep storage diagnostics out of invocation evidence. */ () =>
                                        new AuditUnavailable({ action })
                                )
                            ),
                        /** Persist a tenant-bound receipt durably; allowSpool does not enable an unimplemented fallback. */
                        record: (receipt, _allowSpool) =>
                            Effect.gen(
                                /** Validate tenant ownership and receipt serialization before acknowledging durable audit insertion. */ function* () {
                                    // A routed adapter cannot write audit evidence for a caller from another tenant.
                                    if (receipt.caller.tenant !== tenant.id)
                                        return yield* new AuditUnavailable({ action: receipt.action });
                                    const body = yield* receiptJson(receipt).pipe(
                                        Effect.mapError(
                                            /** Treat an unencodable receipt as unavailable audit, never a successful acknowledgment. */ () =>
                                                new AuditUnavailable({ action: receipt.action })
                                        )
                                    );
                                    yield* storage
                                        .audit(receipt.id, body)
                                        .pipe(
                                            Effect.mapError(
                                                /** Hide persistence failure details while failing receipt delivery closed. */ () =>
                                                    new AuditUnavailable({ action: receipt.action })
                                            )
                                        );
                                    return 'durable' as const;
                                }
                            ),
                    })
                ),
                Layer.succeed(
                    Integrity,
                    Integrity.of({
                        /** Scope deduplication to routed authority and atomically commit validated output/receipt with handler writes. */
                        commit: (request, execute) =>
                            Effect.gen(
                                /** Delegate mutation atomicity to Storage and recover the typed receipt from its durable JSON representation. */ function* () {
                                    // The composite key includes delegation as well as principal/action/version, preventing cross-authority replay.
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
                                            Effect.gen(
                                                /** Run inside the storage transaction and reject success evidence that does not bind this exact mutation. */ function* () {
                                                    const result = yield* execute;
                                                    const receipt = yield* Schema.decodeUnknown(Receipt)(
                                                        result.receipt
                                                    ).pipe(
                                                        Effect.mapError(
                                                            /** Reject malformed success evidence before the transaction can commit it. */ () =>
                                                                new AuditUnavailable({ action: request.action })
                                                        )
                                                    );
                                                    // Receipt fields must agree with the request, not merely pass the portable receipt schema.
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
                                                    ).pipe(
                                                        Effect.mapError(
                                                            /** Roll back instead of retaining output that cannot be represented as canonical JSON. */ () =>
                                                                new AuditUnavailable({ action: request.action })
                                                        )
                                                    );
                                                    const body = yield* receiptJson(receipt).pipe(
                                                        Effect.mapError(
                                                            /** Fail the atomic mutation when its bound receipt cannot cross the JSON storage boundary. */ () =>
                                                                new AuditUnavailable({ action: request.action })
                                                        )
                                                    );
                                                    return { output, receipt: body };
                                                }
                                            )
                                        )
                                        .pipe(
                                            Effect.mapError(
                                                /** Sanitize infrastructure failures, expose bounded conflicts, and preserve the handler's typed failures. */ (
                                                    error
                                                ) =>
                                                    error instanceof StorageFailure
                                                        ? new AuditUnavailable({ action: request.action })
                                                        : error instanceof Conflict
                                                          ? new InvocationDenied({
                                                                action: request.action,
                                                                reason: error.reason
                                                            })
                                                          : error
                                            )
                                        );
                                    const receipt = yield* Schema.decodeUnknown(Receipt)(committed.receipt).pipe(
                                        Effect.mapError(
                                            /** Refuse malformed durable replay evidence rather than returning an unchecked receipt. */ () =>
                                                new AuditUnavailable({ action: request.action })
                                        )
                                    );
                                    return { ...committed, receipt };
                                }
                            ),
                    })
                )
            );
        }
    )
);
