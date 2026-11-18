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
import type { ActionSpec, Input } from '@eventiva/contracts/action';
import {
    HttpActionCredentials,
    invokeHttpAction,
    type HttpActionTarget,
} from '@eventiva/integrations.http-client/action';
import { Effect, Layer } from 'effect';

/**
 * Build an unexecuted canonical call; the caller still provides its platform HttpClient and runs the Effect.
 * The protected store effect is evaluated on every call, while server identity/consent/policy remain live authority.
 * This is the spec-typed single-action boundary, not generated inventory, batch, streaming or offline support.
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
