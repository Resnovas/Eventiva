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
    /** Implement the exact decoded specification types; the host owns authorization, execution gates and wire encoding. */
    readonly handler: (input: Input<S>) => Effect.Effect<Output<S>, Failure<S>, R>;
}

/** A decoded invocation captured without erasing the handler's schema types. */
export interface PreparedAction<R = never> {
    readonly canonicalInput: Effect.Effect<string, InvalidInput>;
    /** Authorize the captured decoded target using the host's freshly resolved caller and trusted authorizer. */
    readonly authorize: (
        authorizer: typeof Authorizer.Service,
        caller: CallerIdentity
    ) => Effect.Effect<void, Forbidden>;
    /** Derive live execution requirements from the decoded target and untrusted intent, not from transport claims. */
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
    /** Decode wire input and capture typed operations without executing the handler or granting invocation authority. */
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
    /** Bind decoded input/output/error types without allowing the handler to widen the specification inferred from spec. */
    handler: (input: Input<NoInfer<S>>) => Effect.Effect<Output<NoInfer<S>>, Failure<NoInfer<S>>, R>
): Implementation<S, R> => ({
    _tag: 'Implementation',
    spec,
    handler,
    /** Reject excess wire properties before any target policy or handler can observe decoded input. */
    prepare: (input) =>
        Schema.decodeUnknown(spec.input)(input, { onExcessProperty: 'error' }).pipe(
            Effect.mapError(
                /** Hide decoder details and rejected values behind the fixed public invalid-input message. */ () =>
                    new InvalidInput({ action: spec.name, message: 'Input does not match its schema.' })
            ),
            Effect.flatMap(
                /** Snapshot encoded input before an adapter can retain or mutate the decoded target. */ (decoded) =>
                    Schema.encode(spec.input)(decoded).pipe(
                        Effect.catchAll(
                            /** Treat a broken declared input encoder as a sanitized implementation defect, not a caller failure. */ () =>
                                Effect.dieMessage('Action input cannot be encoded.')
                        ),
                        Effect.flatMap(canonicalJson),
                        Effect.mapError(
                            /** Refuse non-JSON input hashes without exposing the rejected encoded value. */ () =>
                                new InvalidInput({ action: spec.name, message: 'Input must encode as JSON.' })
                        ),
                        Effect.map(
                            /** Reconstruct isolated typed targets from private immutable wire bytes for every observer. */ (
                                canonical
                            ): PreparedAction<R> => {
                                // Round-trip the encoded representation, never the decoded domain object or shared schema AST.
                                const fresh = Effect.suspend(
                                    /** Schema decoding can be eager; rerun it rather than sharing a successful decoded object. */ () =>
                                        Schema.decode(Schema.parseJson(spec.input))(canonical, {
                                            onExcessProperty: 'error',
                                        })
                                ).pipe(
                                    Effect.catchAll(
                                        /** A declared codec must decode its own encoded input; hide broken implementation details. */ () =>
                                            Effect.dieMessage('Action input cannot be decoded.')
                                    )
                                );
                                return {
                                    canonicalInput: Effect.succeed(canonical),
                                    /** Check target-level permission on the decoded schema type rather than the wire representation. */
                                    authorize: (authorizer, caller) =>
                                        fresh.pipe(
                                            Effect.flatMap(
                                                /** Give resource authorization its own decoded target, including during revalidation. */ (
                                                    value
                                                ) => authorizer.check<S>(caller, spec, value)
                                            )
                                        ),
                                    /** Keep the specification's exact decoded type when querying trusted live execution policy. */
                                    inspect: (policy, caller, intent) =>
                                        fresh.pipe(
                                            Effect.flatMap(
                                                /** Isolate policy references from authorization, subsequent inspections and handler execution. */ (
                                                    value
                                                ) => policy.inspect<S>(caller, spec, value, intent)
                                            )
                                        ),
                                    run: fresh.pipe(
                                        Effect.flatMap(
                                            /** Construct the handler only after live gates, with an unshared decoded target. */ (
                                                value
                                            ) => handler(value)
                                        ),
                                        Effect.catchAllDefect(
                                            /** Replace arbitrary handler defects before they can retain implementation or input details. */ () =>
                                                Effect.dieMessage('Action handler defect.')
                                        ),
                                        Effect.catchAll(
                                            /** Publish declared errors only after encoding and JSON validation; undeclared failures are defects. */ (
                                                error
                                            ) =>
                                                Option.match(spec.error, {
                                                    /** Refuse typed failure output when the specification declares no error codec. */
                                                    onNone: () => Effect.dieMessage('Undeclared action failure.'),
                                                    /** Encode only through the declared error schema before exposing an ActionFailed wire payload. */
                                                    onSome: (schema) =>
                                                        Schema.encode(schema)(error).pipe(
                                                            Effect.flatMap(canonicalJson),
                                                            Effect.flatMap(Schema.decode(Json)),
                                                            Effect.catchAll(
                                                                /** Treat error-codec or JSON incompatibility as a sanitized defect, never unchecked error output. */ () =>
                                                                    Effect.dieMessage('Action error cannot be encoded.')
                                                            ),
                                                            Effect.flatMap(
                                                                /** Wrap only the validated JSON representation, not the original handler error object. */ (
                                                                    encodedError
                                                                ) =>
                                                                    Effect.fail(
                                                                        new ActionFailed({
                                                                            action: spec.name,
                                                                            error: encodedError,
                                                                        })
                                                                    )
                                                            )
                                                        ),
                                                })
                                        ),
                                        Effect.flatMap(
                                            /** Encode successful values through the exact declared schema and reject non-JSON transport output. */ (
                                                output
                                            ) =>
                                                Schema.encode(spec.output)(output).pipe(
                                                    Effect.flatMap(canonicalJson),
                                                    Effect.flatMap(Schema.decode(Json)),
                                                    Effect.catchAll(
                                                        /** Do not turn invalid implementation output into an apparently successful unchecked response. */ () =>
                                                            Effect.dieMessage('Action output cannot be encoded.')
                                                    )
                                                )
                                        )
                                    ),
                                };
                            }
                        )
                    )
            )
        ),
});
