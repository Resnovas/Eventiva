/**
 * @file packages/integrations/posthog-server/src/flags.ts
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

import { PostHogServerProvider } from '@posthog/openfeature-node-provider';
import type { Provider } from '@openfeature/server-sdk';
import { type Cause, Config, type ConfigError, Data, Effect, Option, Redacted, type Scope } from 'effect';
import { PostHog } from 'posthog-node';

/**
 * PostHog as the remote rollout provider for OpenFeature on the server.
 * Nothing contacts PostHog until a project key is configured: without
 * `POSTHOG_API_KEY` no client is created. Flag-called events and GeoIP are off
 * by default, so evaluating a flag captures nothing.
 */

/** Closed shutdown diagnostics intentionally exclude the SDK's rejection, host and credential values. */
interface PostHogShutdownErrorFields {
    readonly operation: 'shutdown';
    readonly reason: 'shutdown-failed';
}

/** Construct sanitized shutdown errors; the exact constructor type keeps the vendor's open generic out of public declarations. */
const postHogShutdownErrorBase: new (
    fields: PostHogShutdownErrorFields
) => Cause.YieldableError & PostHogShutdownErrorFields & { readonly _tag: 'PostHogShutdownError' } = Data.TaggedError(
    'PostHogShutdownError'
)<PostHogShutdownErrorFields>;

/**
 * The PostHog client failed to shut down. It carries only the operation and a closed reason; client failures and
 * credentials are never retained.
 *
 * @since 0.0.1
 * @example
 * const failure = new PostHogShutdownError({ operation: 'shutdown', reason: 'shutdown-failed' });
 */
export class PostHogShutdownError extends postHogShutdownErrorBase {}

/**
 * Where the provider connects. The key is a secret; the host defaults to PostHog's EU region.
 *
 * @since 0.0.1
 * @example
 * const settings: PostHogOptions = { apiKey: Redacted.make(key), host: 'https://eu.i.posthog.com' };
 */
export interface PostHogOptions {
    readonly apiKey: Redacted.Redacted<string>;
    readonly host: string;
}

/**
 * PostHog rejects dots in persisted keys, so this maps Eventiva's telemetry flag keys to the dash-separated keys
 * stored in PostHog, without changing Eventiva's existing gate contracts.
 *
 * @since 0.0.1
 * @example
 * const remoteKey = telemetryFlagKeys['telemetry.export.enabled'];
 */
export const telemetryFlagKeys: Readonly<Record<string, string>> = {
    'telemetry.export.enabled': 'eventiva-telemetry-export-enabled',
    'telemetry.correlation.pseudonymous.enabled': 'eventiva-telemetry-correlation-pseudonymous-enabled',
};

/**
 * The PostHog settings from configuration, or none when no key is set. Reads `POSTHOG_API_KEY` (redacted) and
 * `POSTHOG_HOST` (default `https://eu.i.posthog.com`).
 *
 * @since 0.0.1
 * @fails {ConfigError} When the configuration provider cannot read `POSTHOG_API_KEY` or `POSTHOG_HOST`.
 * @example
 * const settings = yield* options;
 */
export const options: Effect.Effect<Option.Option<PostHogOptions>, ConfigError.ConfigError> = Config.all({
    apiKey: Config.option(Config.redacted('POSTHOG_API_KEY')),
    host: Config.string('POSTHOG_HOST').pipe(Config.withDefault('https://eu.i.posthog.com')),
}).pipe(
    Effect.map(
        /**
         * A missing key disables the provider; retain configured credentials in their redacted wrapper.
         *
         * @param config - The optional key and the resolved host.
         * @returns The settings, or none when no key is configured.
         */
        (config) =>
            Option.map(
                config.apiKey,
                /**
                 * Pair the configured secret with its resolved host without constructing an SDK client.
                 *
                 * @param key - The redacted project key.
                 * @returns The provider settings.
                 */
                (key) => ({ apiKey: key, host: config.host })
            )
    )
);

/**
 * An OpenFeature provider backed by a PostHog client that lives as long as the scope. GeoIP enrichment and
 * flag-evaluation events are off, so evaluating a flag captures nothing.
 *
 * @since 0.0.1
 * @param settings - The redacted project key and host.
 * @returns A scoped Effect yielding the provider. It never fails; a failed shutdown on scope exit is logged.
 * @example
 * const remote = yield* provider({ apiKey: Redacted.make(key), host: 'https://eu.i.posthog.com' });
 */
export const provider = (settings: PostHogOptions): Effect.Effect<Provider, never, Scope.Scope> =>
    Effect.acquireRelease(
        Effect.sync(
            /**
             * Reveal the key only at SDK construction; disable GeoIP enrichment and flag-evaluation events.
             *
             * @returns The owned PostHog client.
             */
            () =>
                new PostHog(Redacted.value(settings.apiKey), {
                    host: settings.host,
                    disableGeoip: true,
                    sendFeatureFlagEvent: false,
                })
        ),
        /**
         * Flush and stop the owned SDK client on scope exit; log only sanitized shutdown failures.
         *
         * @param client - The PostHog client this scope owns.
         * @returns An Effect that shuts the client down and never fails.
         */
        (client) =>
            Effect.tryPromise({
                /**
                 * Await vendor shutdown before releasing the scope's client ownership.
                 *
                 * @returns The SDK's promise that settles once events are flushed and the client stops.
                 */
                // effect-boundary: posthog-node flushes and stops through a promise.
                try: () => client.shutdown(),
                /**
                 * Discard vendor rejection contents rather than retaining possible credentials or event data.
                 *
                 * @returns The bounded shutdown failure.
                 */
                catch: () => new PostHogShutdownError({ operation: 'shutdown', reason: 'shutdown-failed' }),
            }).pipe(Effect.ignoreLogged)
    ).pipe(
        Effect.map(
            /**
             * Adapt the scoped client without enabling the provider's own flag-evaluation event capture.
             *
             * @param client - The scoped PostHog client.
             * @returns The OpenFeature provider over it.
             */
            (client) => new PostHogServerProvider(client, { sendFeatureFlagEvents: false })
        )
    );

/**
 * The configured provider, if any. Nothing contacts PostHog unless `POSTHOG_API_KEY` is set.
 *
 * @since 0.0.1
 * @fails {ConfigError} When the PostHog configuration cannot be read.
 * @example
 * const remote = yield* fromConfig;
 */
export const fromConfig: Effect.Effect<Option.Option<Provider>, ConfigError.ConfigError, Scope.Scope> = Effect.flatMap(
    options,
    Option.match({
        /**
         * Remain disabled without acquiring a client or provider when configuration supplies no key.
         *
         * @returns An Effect yielding none.
         */
        onNone: () => Effect.succeed(Option.none()),
        /**
         * Acquire a provider in the caller's scope only for configured settings.
         *
         * @param settings - The configured key and host.
         * @returns A scoped Effect yielding the provider.
         */
        onSome: (settings) => Effect.map(provider(settings), Option.some),
    })
);
