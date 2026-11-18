/**
 * @file ai-docs/src/29_http/02_client.ts
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

/** @title Invoke a canonical specification with portable domain types and separately protected current proof */
import { define, type ActionSpec, type Input } from '@eventiva/contracts/action';
import {
    discoverHttpActions,
    HttpActionCredentials,
    invokeHttpAction,
    invokeHttpActionBatch,
    type HttpActionTarget,
} from '@eventiva/integrations.http-client/action';
import { Effect, Layer, Schema } from 'effect';

/**
 * Build an unexecuted canonical call; the caller still provides its platform HttpClient and runs the Effect.
 * The protected store effect is evaluated on every call, while server identity/consent/policy remain live authority.
 * This is the spec-typed single-action boundary, not generated inventory, streaming or offline support.
 */
export const callWithCurrentProof = <S extends ActionSpec>(
    spec: S,
    input: NoInfer<Input<S>>,
    target: HttpActionTarget,
    currentProof: HttpActionCredentials['Type']['proof']
) =>
    invokeHttpAction(spec, input, target).pipe(
        Effect.provide(Layer.succeed(HttpActionCredentials, { proof: currentProof }))
    );

/**
 * Prepare one explicit current-proof GET, returning only this caller's private historical JSON snapshot.
 * Provide an unretried platform HttpClient to execute; references/servers remain inert JSON, never destinations.
 * Actual body intake is capped at 1 MiB, 64 nested containers and 100000 structural tokens before JSON decoding.
 * A refresh failure is not permission to reuse a prior snapshot as current authority; invocation still needs canonical specs.
 */
export const discoverWithCurrentProof = (
    target: Omit<HttpActionTarget, 'idempotencyKey'>,
    currentProof: HttpActionCredentials['Type']['proof']
) =>
    discoverHttpActions(target).pipe(
        Effect.provideService(HttpActionCredentials, { proof: currentProof }),
        Effect.map(
            /** The typed envelope retains optional components and arbitrary JSON extensions without compiling them. */ (
                document
            ) => ({
                version: document.openapi,
                title: document.info.title,
                paths: document.paths,
                schemas: document.components.schemas,
                securitySchemes: document.components.securitySchemes,
                document,
            })
        )
    );

const reserve = define('example.reserve', {
    version: 1,
    description: 'Synthetic structural example; the actual server must register the canonical owning spec.',
    input: Schema.Struct({ units: Schema.Int }),
    output: Schema.Struct({ reserved: Schema.Int }),
    permission: 'example.write',
    sideEffect: 'write',
    offline: 'online-only',
});
const annotate = define('example.annotate', {
    version: 1,
    description: 'Synthetic distinct output shape for portable positional inference.',
    input: Schema.Struct({ note: Schema.String }),
    output: Schema.Struct({ accepted: Schema.Boolean }),
    permission: 'example.write',
    sideEffect: 'write',
    offline: 'online-only',
});

/**
 * Prepare one heterogeneous sequential batch without executing it. Supply an unretried platform HttpClient to run.
 * Retain these exact keys and inputs for explicit recovery: a failure may follow a committed prefix and supplies
 * no partial results/index or rollback guarantee. Wire receipts can change while original SQL commits remain stable.
 */
export const batchWithCurrentProof = (
    target: Omit<HttpActionTarget, 'idempotencyKey'>,
    currentProof: HttpActionCredentials['Type']['proof']
) =>
    invokeHttpActionBatch(
        [reserve, annotate],
        [
            { input: { units: 7 }, idempotencyKey: 'retained:reserve:0001' },
            { input: { note: 'Reviewed separately' }, idempotencyKey: 'retained:annotate:0001' },
        ],
        target
    ).pipe(
        Effect.provide(Layer.succeed(HttpActionCredentials, { proof: currentProof })),
        Effect.map(
            /** Each result retains its canonical position without a union, cast or copied DTO. */ (results) => ({
                reserved: results[0].output.reserved,
                accepted: results[1].output.accepted,
                receipts: [results[0].receiptId, results[1].receiptId],
            })
        )
    );
