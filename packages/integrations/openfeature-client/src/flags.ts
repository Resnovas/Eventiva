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

/** Construct bounded lifecycle failures; the exact constructor type keeps the vendor's open generic out of public declarations. */
const flagProviderErrorBase: new (
    fields: FlagProviderErrorFields
) => Cause.YieldableError & FlagProviderErrorFields & { readonly _tag: 'FlagProviderError' } = Data.TaggedError(
    'FlagProviderError'
)<FlagProviderErrorFields>;

/**
 * A provider failed to start or to close. It carries only the lifecycle phase and a closed reason; the vendor's
 * rejection value is never retained, so it cannot leak targeting data.
 *
 * @since 0.0.1
 * @example
 * const failure = new FlagProviderError({ operation: 'initialize', reason: 'provider-failed' });
 */
export class FlagProviderError extends flagProviderErrorBase {}

/**
 * An OpenFeature provider tagged with the precedence source it speaks for.
 *
 * @since 0.0.1
 * @example
 * const baseline: SourcedProvider = { source: 'git-baseline', provider: staticValues({ 'shell.offline-banner': false }) };
 */
export interface SourcedProvider {
    readonly source: FlagSource;
    readonly provider: Provider;
}

/**
 * A static provider for fixed values, such as the Git-managed baseline.
 *
 * @since 0.0.1
 * @param values - Each flag key and the value it always resolves to.
 * @returns An in-memory provider whose flags are enabled two-variant booleans defaulting to the given value.
 * @example
 * const baseline = staticValues({ 'shell.offline-banner': false });
 */
export const staticValues = (values: Readonly<Record<string, boolean>>): Provider =>
    new InMemoryProvider(
        Object.fromEntries(
            Object.entries(values).map(
                /**
                 * Represent each boolean as an enabled two-variant flag with an explicit default variant.
                 *
                 * @param entry - The flag key and its fixed value.
                 * @returns The key paired with its in-memory flag definition.
                 */
                (entry) => [
                    entry[0],
                    { variants: { on: true, off: false }, defaultVariant: entry[1] ? 'on' : 'off', disabled: false },
                ]
            )
        )
    );

/**
 * Flatten device attributes for the SDK, giving an explicit targeting key precedence over an attribute of that name.
 *
 * @param context - The device's evaluation context, if one was set.
 * @returns The attributes as one flat OpenFeature context.
 */
const toOpenFeature = (context: FlagContext | undefined) => ({
    ...context?.attributes,
    ...(context?.targetingKey === undefined ? {} : { targetingKey: context.targetingKey }),
});

/**
 * A `Flags` layer over the given providers, bound to an OpenFeature domain for the layer's lifetime. The client SDK
 * uses one static context per device, set here; a per-call context is ignored. A provider that fails to start stays
 * bound in OpenFeature's recoverable error state: it answers for what it knows and every other flag uses its safe
 * default.
 *
 * @since 0.0.1
 * @param providers - The providers, each tagged with its precedence source; they are consulted in precedence order.
 * @param options - Optional layer settings.
 * @param options.domain - The OpenFeature domain to bind; defaults to `eventiva`.
 * @param options.context - The device's static evaluation context.
 * @returns A scoped layer providing `Flags`. It never fails: startup and shutdown failures are logged.
 * @example
 * const flags = layer([{ source: 'git-baseline', provider: staticValues({ 'shell.offline-banner': false }) }]);
 */
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
                        /**
                         * Assign unique provider names in stable source-precedence order for first-match resolution.
                         *
                         * @param sourced - The provider and the source it speaks for.
                         * @param index - Its position in precedence order.
                         * @returns The provider with a unique name.
                         */
                        (sourced, index) => ({
                            provider: sourced.provider,
                            name: `${sourced.source}-${index}`,
                        })
                    ),
                    new FirstMatchStrategy()
                );
                yield* Effect.acquireRelease(
                    Effect.tryPromise({
                        /**
                         * Await domain initialization with the device context before exposing the client service.
                         *
                         * @returns The SDK's promise that settles once the providers are ready.
                         */
                        // effect-boundary: OpenFeature binds providers and context through a promise.
                        try: () => OpenFeature.setProviderAndWait(domain, multi, toOpenFeature(options.context)),
                        /**
                         * Discard rejection contents so startup diagnostics cannot expose vendor or targeting secrets.
                         *
                         * @returns The bounded startup failure.
                         */
                        catch: () => new FlagProviderError({ operation: 'initialize', reason: 'provider-failed' }),
                    }).pipe(
                        Effect.catchAll(
                            /**
                             * Report the sanitized startup failure while leaving the recoverable provider bound.
                             *
                             * @param error - The bounded startup failure.
                             * @returns An Effect that logs the warning.
                             */
                            (error) =>
                                Effect.logWarning('A flag provider failed to start; flags use safe defaults', error)
                        )
                    ),
                    /**
                     * Replace this domain's provider on scope exit; log bounded cleanup failures rather than failing finalization.
                     *
                     * @returns An Effect that unbinds the domain and never fails.
                     */
                    () =>
                        Effect.tryPromise({
                            /**
                             * Await SDK replacement, which closes the domain's previous provider.
                             *
                             * @returns The SDK's promise that settles once the old provider is closed.
                             */
                            // effect-boundary: replacing the provider closes the old one.
                            try: () => OpenFeature.setProviderAndWait(domain, NOOP_PROVIDER),
                            /**
                             * Retain only lifecycle phase and closed reason when provider replacement rejects.
                             *
                             * @returns The bounded shutdown failure.
                             */
                            catch: () => new FlagProviderError({ operation: 'close', reason: 'provider-failed' }),
                        }).pipe(Effect.ignoreLogged)
                );
                const client = OpenFeature.getClient(domain);
                return Flags.of({
                    /**
                     * Resolve a boolean using the bound device context, translating SDK error details to the declared
                     * safe default. OpenFeature catches provider failures and returns the default with an error code.
                     *
                     * @param flag - The flag declaration, including its safe default.
                     * @returns An Effect with the resolved value and its reason; it never fails.
                     */
                    evaluate: (flag: Flag) =>
                        Effect.sync(
                            /**
                             * Read synchronous provider details with the declaration's fallback; evaluation emits no new context.
                             *
                             * @returns The SDK's evaluation details.
                             */
                            () => client.getBooleanDetails(flag.key, flag.safeDefault)
                        ).pipe(
                            Effect.map(
                                /**
                                 * Preserve successful provider metadata, or mark an error-code fallback without exposing raw provider errors.
                                 *
                                 * @param details - The SDK's evaluation details.
                                 * @returns The evaluation, or the declared safe default when the SDK reported an error.
                                 */
                                (details) =>
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
