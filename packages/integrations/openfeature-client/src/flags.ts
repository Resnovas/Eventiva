/**
 * @file packages/integrations/openfeature-client/src/flags.ts
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

import {
    type EvaluationContext as FlagContext,
    type Flag,
    Flags,
    type FlagSource,
    byPrecedence,
    safeDefault,
} from '@eventiva/contracts/flags';
import {
    FirstMatchStrategy,
    InMemoryProvider,
    MultiProvider,
    NOOP_PROVIDER,
    OpenFeature,
    type Provider,
} from '@openfeature/web-sdk';
import { type Cause, Data, Effect, Layer } from 'effect';

/**
 * The `Flags` service on the OpenFeature web SDK, for Expo native and web.
 * The client SDK uses one static context per device, set when the layer is
 * built. Providers are ordered by Eventiva's source precedence; a flag no
 * provider knows resolves to its safe default, so the app works offline from
 * a cold start.
 */

/** Closed lifecycle diagnostics that deliberately exclude the vendor's rejection value and targeting data. */
interface FlagProviderErrorFields {
    readonly operation: 'initialize' | 'close';
    readonly reason: 'provider-failed';
}

// The exact constructor keeps the vendor's open generic out of public declarations.
/** Construct bounded lifecycle failures without exposing the vendor's open generic signature. */
const flagProviderErrorBase: new (
    fields: FlagProviderErrorFields
) => Cause.YieldableError & FlagProviderErrorFields & { readonly _tag: 'FlagProviderError' } = Data.TaggedError(
    'FlagProviderError'
)<FlagProviderErrorFields>;

/** Bounded lifecycle diagnostics only; vendor failures are never retained. */
export class FlagProviderError extends flagProviderErrorBase {}

/** An OpenFeature provider tagged with the precedence source it speaks for. */
export interface SourcedProvider {
    readonly source: FlagSource;
    readonly provider: Provider;
}

/** A static provider for fixed values, such as the Git-managed baseline. */
export const staticValues = (values: Readonly<Record<string, boolean>>): Provider =>
    new InMemoryProvider(
        Object.fromEntries(
            Object.entries(values).map(
                /** Represent each boolean as an enabled two-variant flag with an explicit default variant. */ ([
                    key,
                    value
                ]) => [
                    key,
                    { variants: { on: true, off: false }, defaultVariant: value ? 'on' : 'off', disabled: false },
                ]
            )
        )
    );

/** Flatten device attributes for the SDK, giving an explicit targeting key precedence over an attribute of that name. */
const toOpenFeature = (context: FlagContext | undefined) => ({
    ...context?.attributes,
    ...(context?.targetingKey === undefined ? {} : { targetingKey: context.targetingKey }),
});

/** A `Flags` layer over the given providers, bound to an OpenFeature domain for the layer's lifetime. */
export const layer = (
    providers: ReadonlyArray<SourcedProvider>,
    options: { readonly domain?: string; readonly context?: FlagContext } = {}
): Layer.Layer<Flags> =>
    Layer.scoped(
        Flags,
        Effect.gen(
            /** Own provider binding for one domain and expose evaluations against its layer-time device context. */ function* () {
                const domain = options.domain ?? 'eventiva';
                const multi = new MultiProvider(
                    byPrecedence(providers).map(
                        /** Assign unique provider names in stable source-precedence order for first-match resolution. */ (
                            { source, provider },
                            index
                        ) => ({
                            provider,
                            name: `${source}-${index}`,
                        })
                    ),
                    new FirstMatchStrategy()
                );
                // A provider that fails to start stays bound in OpenFeature's recoverable
                // ERROR state: it answers for what it knows and everything else falls back.
                yield* Effect.acquireRelease(
                    Effect.tryPromise({
                        /** Await domain initialization with the device context before exposing the client service. */
                        // effect-boundary: OpenFeature binds providers and context through a promise.
                        try: () => OpenFeature.setProviderAndWait(domain, multi, toOpenFeature(options.context)),
                        /** Discard rejection contents so startup diagnostics cannot expose vendor or targeting secrets. */
                        catch: () => new FlagProviderError({ operation: 'initialize', reason: 'provider-failed' }),
                    }).pipe(
                        Effect.catchAll(
                            /** Report the sanitized startup failure while leaving the recoverable provider bound. */ (
                                error
                            ) => Effect.logWarning('A flag provider failed to start; flags use safe defaults', error)
                        )
                    ),
                    /** Replace this domain's provider on scope exit; log bounded cleanup failures rather than failing finalization. */
                    () =>
                        Effect.tryPromise({
                            /** Await SDK replacement, which closes the domain's previous provider. */
                            // effect-boundary: replacing the provider closes the old one.
                            try: () => OpenFeature.setProviderAndWait(domain, NOOP_PROVIDER),
                            /** Retain only lifecycle phase and closed reason when provider replacement rejects. */
                            catch: () => new FlagProviderError({ operation: 'close', reason: 'provider-failed' }),
                        }).pipe(Effect.ignoreLogged)
                );
                const client = OpenFeature.getClient(domain);
                return Flags.of({
                    // The client SDK evaluates against the static context; a per-call context is ignored.
                    /** Resolve a boolean using the bound device context, translating SDK error details to the declared safe default. */
                    evaluate: (flag: Flag) =>
                        // OpenFeature catches provider failures and returns the default with an error code.
                        Effect.sync(
                            /** Read synchronous provider details with the declaration's fallback; evaluation emits no new context. */ () =>
                                client.getBooleanDetails(flag.key, flag.safeDefault)
                        ).pipe(
                            Effect.map(
                                /** Preserve successful provider metadata, or mark an error-code fallback without exposing raw provider errors. */ (
                                    details
                                ) =>
                                    details.errorCode === undefined
                                        ? {
                                              flag: flag.key,
                                              value: details.value,
                                              reason: details.reason ?? 'UNKNOWN',
                                              fallback: false,
                                          }
                                        : safeDefault(flag, details.errorCode)
                            )
                        ),
                });
            }
        )
    );
