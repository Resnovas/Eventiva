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
import { invokeHttpAction, type HttpActionTarget } from '@eventiva/integrations.http-client/action';
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

/** Native/web compile proof only; never called by the application shell and never supplies an authentication shortcut. */
export const checkHttpClientTypes = (target: HttpActionTarget) => {
    // The canonical schema, not a handwritten transport DTO, must distinguish domain numbers from wire strings.
    const input: Input<typeof canonical> = { units: 7 };
    const wire: Schema.Schema.Encoded<typeof canonical.input> = { units: '7' };
    type ClientInput = Parameters<typeof invokeHttpAction<typeof canonical>>[1];
    type ClientOutput = Effect.Effect.Success<ReturnType<typeof invokeHttpAction<typeof canonical>>>['output'];
    // Rejection assertions compile only while wrong representations remain unassignable; no diagnostic is suppressed.
    const wireInputRejected: typeof wire extends ClientInput ? false : true = true;
    const domainWireRejected: typeof input extends typeof wire ? false : true = true;
    const wireOutputRejected: string extends ClientOutput['total'] ? false : true = true;
    void wire;
    void wireInputRejected;
    void domainWireRejected;
    void wireOutputRejected;
    return invokeHttpAction(canonical, input, target).pipe(
        Effect.map(
            /** A decoded result retains the exact output type through the public client API. */ (result) => {
                const output: Output<typeof canonical> = result.output;
                const total: number = output.total;
                return { total, invocationReceipt: result.receiptId };
            }
        )
    );
};
