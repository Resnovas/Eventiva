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

// The exact constructor keeps the vendor's open generic out of public declarations.
/** Construct sanitized shutdown errors through an exact signature rather than exposing Data.TaggedError's generic. */
const postHogShutdownErrorBase: new (
    fields: PostHogShutdownErrorFields
) => Cause.YieldableError & PostHogShutdownErrorFields & { readonly _tag: 'PostHogShutdownError' } = Data.TaggedError(
    'PostHogShutdownError'
)<PostHogShutdownErrorFields>;

/** Bounded shutdown diagnostics only; client failures and credentials are never retained. */
export class PostHogShutdownError extends postHogShutdownErrorBase {}

/** Where the provider connects. The key is a secret; the host defaults to PostHog's EU region. */
export interface PostHogOptions {
    readonly apiKey: Redacted.Redacted<string>;
    readonly host: string;
}

/** PostHog rejects dots in persisted keys; keep vendor aliases here without changing Eventiva's existing gate contracts. */
export const telemetryFlagKeys: Readonly<Record<string, string>> = {
    'telemetry.export.enabled': 'eventiva-telemetry-export-enabled',
    'telemetry.correlation.pseudonymous.enabled': 'eventiva-telemetry-correlation-pseudonymous-enabled',
};

/** The PostHog settings from configuration, or none when no key is set. */
export const options: Effect.Effect<Option.Option<PostHogOptions>, ConfigError.ConfigError> = Config.all({
    apiKey: Config.option(Config.redacted('POSTHOG_API_KEY')),
    host: Config.string('POSTHOG_HOST').pipe(Config.withDefault('https://eu.i.posthog.com')),
}).pipe(
    Effect.map(
        /** A missing key disables the provider; retain configured credentials in their redacted wrapper. */
        ({ apiKey, host }) =>
            Option.map(
                apiKey,
                /** Pair the configured secret with its resolved host without constructing an SDK client. */
                (key) => ({ apiKey: key, host })
            )
    )
);

/** An OpenFeature provider backed by a PostHog client that lives as long as the scope. */
export const provider = (settings: PostHogOptions): Effect.Effect<Provider, never, Scope.Scope> =>
    Effect.acquireRelease(
        Effect.sync(
            /** Reveal the key only at SDK construction; disable GeoIP enrichment and flag-evaluation events. */
            () =>
                new PostHog(Redacted.value(settings.apiKey), {
                    host: settings.host,
                    disableGeoip: true,
                    sendFeatureFlagEvent: false,
                })
        ),
        /** Flush and stop the owned SDK client on scope exit; log only sanitized shutdown failures. */
        (client) =>
            Effect.tryPromise({
                /** Await vendor shutdown before releasing the scope's client ownership. */
                // effect-boundary: posthog-node flushes and stops through a promise.
                try: () => client.shutdown(),
                /** Discard vendor rejection contents rather than retaining possible credentials or event data. */
                catch: () => new PostHogShutdownError({ operation: 'shutdown', reason: 'shutdown-failed' }),
            }).pipe(Effect.ignoreLogged)
    ).pipe(
        Effect.map(
            /** Adapt the scoped client without enabling the provider's own flag-evaluation event capture. */
            (client) => new PostHogServerProvider(client, { sendFeatureFlagEvents: false })
        )
    );

/** The configured provider, if any. */
export const fromConfig: Effect.Effect<Option.Option<Provider>, ConfigError.ConfigError, Scope.Scope> = Effect.flatMap(
    options,
    Option.match({
        /** Remain disabled without acquiring a client or provider when configuration supplies no key. */
        onNone: () => Effect.succeed(Option.none()),
        /** Acquire a provider in the caller's scope only for configured settings. */
        onSome: (settings) => Effect.map(provider(settings), Option.some),
    })
);
