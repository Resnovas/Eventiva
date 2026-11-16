/**
 * @file packages/runtime/src/action.ts
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

import type { ActionSpec, Failure, Input, Output } from '@eventiva/contracts/action';
import { Authorizer, type CallerIdentity } from '@eventiva/contracts/caller';
import { ActionFailed, InvalidInput, type Forbidden } from '@eventiva/contracts/errors';
import { Json, type JsonValue } from '@eventiva/contracts/storage';
import { Effect, Option, Schema } from 'effect';
import {
    canonicalJson,
    type ExecutionPolicy,
    type ExecutionRequirements,
    type InvocationDenied,
    type InvokeOptions,
} from './invocation.ts';

/**
 * Handlers for portable action specifications. A feature module's backend
 * package implements each specification once; the only way to run a handler
 * is `ActionHost.invoke`, so every surface shares the same path.
 */

/** A handler bound to the specification it implements. */
export interface Implementation<S extends ActionSpec, R = never> extends ActionBinding<R> {
    readonly _tag: 'Implementation';
    readonly spec: S;
    readonly handler: (input: Input<S>) => Effect.Effect<Output<S>, Failure<S>, R>;
}

/** A decoded invocation captured without erasing the handler's schema types. */
export interface PreparedAction<R = never> {
    readonly canonicalInput: Effect.Effect<string, InvalidInput>;
    readonly authorize: (
        authorizer: typeof Authorizer.Service,
        caller: CallerIdentity
    ) => Effect.Effect<void, Forbidden>;
    readonly inspect: (
        policy: typeof ExecutionPolicy.Service,
        caller: CallerIdentity,
        intent: InvokeOptions
    ) => Effect.Effect<ExecutionRequirements, InvocationDenied>;
    readonly run: Effect.Effect<JsonValue, ActionFailed, R>;
}

/** Heterogeneous registry capability, not an erased input/output handler. */
export interface ActionBinding<R = never> {
    readonly spec: ActionSpec;
    readonly prepare: <Wire>(input: Wire) => Effect.Effect<PreparedAction<R>, InvalidInput>;
}

/**
 * Implements a specification. The handler may need services `R`; the module
 * that registers it supplies them with its own layer, built when the module
 * registers and released when it is removed.
 */
export const implement = <S extends ActionSpec, R = never>(
    spec: S & {
        readonly input: Schema.Schema<Input<S>, Schema.Schema.Encoded<S['input']>>;
        readonly output: Schema.Schema<Output<S>, Schema.Schema.Encoded<S['output']>>;
        readonly error: Option.Option<
            Schema.Schema<Failure<S>, Schema.Schema.Encoded<Option.Option.Value<S['error']>>>
        >;
    },
    handler: (input: Input<NoInfer<S>>) => Effect.Effect<Output<NoInfer<S>>, Failure<NoInfer<S>>, R>
): Implementation<S, R> => ({
    _tag: 'Implementation',
    spec,
    handler,
    prepare: (input) =>
        Schema.decodeUnknown(spec.input)(input, { onExcessProperty: 'error' }).pipe(
            Effect.mapError(() => new InvalidInput({ action: spec.name, message: 'Input does not match its schema.' })),
            Effect.map((decoded): PreparedAction<R> => ({
                canonicalInput: Schema.encode(spec.input)(decoded).pipe(
                    Effect.catchAll(() => Effect.dieMessage('Action input cannot be encoded.')),
                    Effect.flatMap(canonicalJson),
                    Effect.mapError(
                        () => new InvalidInput({ action: spec.name, message: 'Input must encode as JSON.' })
                    )
                ),
                authorize: (authorizer, caller) => authorizer.check<S>(caller, spec, decoded),
                inspect: (policy, caller, intent) => policy.inspect<S>(caller, spec, decoded, intent),
                run: Effect.suspend(() => handler(decoded)).pipe(
                    Effect.catchAllDefect(() => Effect.dieMessage('Action handler defect.')),
                    Effect.catchAll((error) =>
                        Option.match(spec.error, {
                            onNone: () => Effect.dieMessage('Undeclared action failure.'),
                            onSome: (schema) =>
                                Schema.encode(schema)(error).pipe(
                                    Effect.flatMap(canonicalJson),
                                    Effect.flatMap(Schema.decode(Json)),
                                    Effect.catchAll(() => Effect.dieMessage('Action error cannot be encoded.')),
                                    Effect.flatMap((encodedError) =>
                                        Effect.fail(new ActionFailed({ action: spec.name, error: encodedError }))
                                    )
                                ),
                        })
                    ),
                    Effect.flatMap((output) =>
                        Schema.encode(spec.output)(output).pipe(
                            Effect.flatMap(canonicalJson),
                            Effect.flatMap(Schema.decode(Json)),
                            Effect.catchAll(() => Effect.dieMessage('Action output cannot be encoded.'))
                        )
                    )
                ),
            }))
        ),
});
