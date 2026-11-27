/**
 * @file apps/client/src/http-client.typecheck.ts
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

import { define, type Input, type Output } from '@eventiva/contracts/action';
import type { JsonValue } from '@eventiva/contracts/storage';
import {
    discoverHttpActions,
    invokeHttpAction,
    invokeHttpActionBatch,
    type HttpActionTarget,
} from '@eventiva/integrations.http-client/action';
import { Effect, Schema } from 'effect';

const canonical = define('fixture.client-types', {
    version: 1,
    description: 'Compile-only portable codec demonstration, not a registered server transformation.',
    input: Schema.Struct({ units: Schema.NumberFromString }),
    output: Schema.Struct({ total: Schema.NumberFromString }),
    permission: 'fixture.invoke',
    sideEffect: 'write',
    offline: 'online-only',
});

const distinct = define('fixture.batch-types', {
    version: 1,
    description: 'Distinct positional domain and encoded types; client seam only.',
    input: Schema.Struct({ accepted: Schema.BooleanFromString }),
    output: Schema.Struct({ label: Schema.String }),
    permission: 'fixture.invoke',
    sideEffect: 'write',
    offline: 'online-only',
});

/**
 * Compile the public JSON-valued discovery result on native/web without asserting executable schemas or invoking IO.
 *
 * @since 0.0.1
 * @param target - The tenant and server to discover actions from.
 * @returns An Effect whose success type proves the discovery document's exact field types.
 * @example
 * const typed = checkHttpDiscoveryTypes(target);
 */
export const checkHttpDiscoveryTypes = (target: Omit<HttpActionTarget, 'idempotencyKey'>) =>
    discoverHttpActions(target).pipe(
        Effect.map(
            /**
             * Exact envelope types coexist with untouched JSON-valued schema/reference/extension data.
             *
             * @param document - The discovered OpenAPI document.
             * @returns Its version, title, batch path, an example schema and an extension, each at its exact type.
             */
            (document) => {
                const version: '3.1.0' = document.openapi;
                const title: string = document.info.title;
                const path: JsonValue | undefined = document.paths[`/tenants/${target.tenant}/actions:batch`];
                const schema: JsonValue | undefined = document.components.schemas?.['Example'];
                const extension: JsonValue | undefined = document['x-future'];
                return { version, title, path, schema, extension };
            }
        )
    );

/**
 * Compile heterogeneous tuple inference without importing server/runtime code or executing a network request. Input
 * inference comes only from the ordered canonical tuple, never a union widened by a mismatching input.
 *
 * @since 0.0.1
 * @param target - The tenant and server the batch would call.
 * @returns An Effect whose success type proves each positional output keeps its own decoded type.
 * @example
 * const typed = checkHttpBatchTypes(target);
 */
export const checkHttpBatchTypes = (target: Omit<HttpActionTarget, 'idempotencyKey'>) => {
    /** The two action specifications in call order. */
    type Specs = readonly [typeof canonical, typeof distinct];
    /** The calls the batch accepts for those specifications. */
    type Calls = Parameters<typeof invokeHttpActionBatch<Specs>>[1];
    /** The positional results the batch yields. */
    type Results = Effect.Effect.Success<ReturnType<typeof invokeHttpActionBatch<Specs>>>;
    const swappedInputRejected: { readonly accepted: boolean } extends Calls[0]['input'] ? false : true = true;
    const wireInputRejected: { readonly units: string } extends Calls[0]['input'] ? false : true = true;
    const swappedOutputRejected: Results[1]['output'] extends Results[0]['output'] ? false : true = true;
    const wireOutputRejected: string extends Results[0]['output']['total'] ? false : true = true;
    void swappedInputRejected;
    void wireInputRejected;
    void swappedOutputRejected;
    void wireOutputRejected;
    return invokeHttpActionBatch(
        [canonical, distinct],
        [
            { input: { units: 7 }, idempotencyKey: 'retained:first' },
            { input: { accepted: true }, idempotencyKey: 'retained:second' },
        ],
        target
    ).pipe(
        Effect.map(
            /**
             * Positional outputs are inferred from an inline tuple without caller casts or duplicate DTOs.
             *
             * @param results - The batch's positional results.
             * @returns The first output's total and the second output's label at their decoded types.
             */
            (results) => {
                const total: number = results[0].output.total;
                const label: string = results[1].output.label;
                return { total, label };
            }
        )
    );
};

/**
 * Native/web compile proof only; never called by the application shell and never supplies an authentication shortcut.
 * The canonical schema, not a handwritten transport DTO, distinguishes domain numbers from wire strings, and the
 * rejection constants compile only while wrong representations stay unassignable; no diagnostic is suppressed.
 *
 * @since 0.0.1
 * @param target - The tenant, server and idempotency key the call would use.
 * @returns An Effect whose success type proves the decoded output and receipt keep their exact types.
 * @example
 * const typed = checkHttpClientTypes(target);
 */
export const checkHttpClientTypes = (target: HttpActionTarget) => {
    const input: Input<typeof canonical> = { units: 7 };
    const wire: Schema.Schema.Encoded<typeof canonical.input> = { units: '7' };
    /** The input type the client accepts for the canonical action. */
    type ClientInput = Parameters<typeof invokeHttpAction<typeof canonical>>[1];
    /** The decoded output type the client yields for the canonical action. */
    type ClientOutput = Effect.Effect.Success<ReturnType<typeof invokeHttpAction<typeof canonical>>>['output'];
    const wireInputRejected: typeof wire extends ClientInput ? false : true = true;
    const domainWireRejected: typeof input extends typeof wire ? false : true = true;
    const wireOutputRejected: string extends ClientOutput['total'] ? false : true = true;
    void wire;
    void wireInputRejected;
    void domainWireRejected;
    void wireOutputRejected;
    return invokeHttpAction(canonical, input, target).pipe(
        Effect.map(
            /**
             * A decoded result retains the exact output type through the public client API.
             *
             * @param result - The decoded action result.
             * @returns The output total and the invocation receipt.
             */
            (result) => {
                const output: Output<typeof canonical> = result.output;
                const total: number = output.total;
                return { total, invocationReceipt: result.receiptId };
            }
        )
    );
};
