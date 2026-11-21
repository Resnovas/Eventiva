/**
 * @file packages/integrations/posthog-client/src/flags.ts
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
    ErrorCode,
    OpenFeatureEventEmitter,
    type Provider,
    ProviderEvents,
    type ResolutionDetails,
} from '@openfeature/web-sdk';

/**
 * An OpenFeature provider over `posthog-react-native`, which PostHog does not
 * ship. It reads the flags the PostHog client has cached (on device and
 * offline too) and reports a flag it does not know as `FLAG_NOT_FOUND`, so a
 * first-match multi-provider falls through to the next source.
 */

/**
 * What the provider needs from a PostHog client; `posthog-react-native`'s `PostHog` satisfies it.
 *
 * @since 0.0.1
 * @example
 * const client: PostHogFlagClient = { getFeatureFlag: () => undefined, onFeatureFlags: () => () => undefined };
 */
export interface PostHogFlagClient {
    /** Read a cached boolean or variant; undefined means this source cannot resolve the key. */
    readonly getFeatureFlag: (key: string) => boolean | string | undefined;
    /** Subscribe to cache refreshes and return cleanup owned by the provider, not the client connection. */
    readonly onFeatureFlags: (
        /** Notify that cached evaluations may have changed; no flag payload is required. */
        callback: () => void
    ) => /** Detach this subscription without closing the shared PostHog client. */ () => void;
}

/**
 * Preserve the requested default while signalling absence so first-match resolution can try another source.
 *
 * @template T - The type of the requested flag value.
 * @param defaultValue - The caller's default, returned unchanged.
 * @param flagKey - The flag PostHog has no value for.
 * @returns A `FLAG_NOT_FOUND` resolution carrying the default.
 */
const notFound = <T>(defaultValue: T, flagKey: string): ResolutionDetails<T> => ({
    value: defaultValue,
    reason: 'ERROR',
    errorCode: ErrorCode.FLAG_NOT_FOUND,
    errorMessage: `PostHog has no value for ${flagKey}`,
});

/**
 * Report an unsupported value type without coercing it or replacing the caller's default.
 *
 * @template T - The type of the requested flag value.
 * @param defaultValue - The caller's default, returned unchanged.
 * @param flagKey - The flag whose PostHog value has another type.
 * @returns A `TYPE_MISMATCH` resolution carrying the default.
 */
const mismatch = <T>(defaultValue: T, flagKey: string): ResolutionDetails<T> => ({
    value: defaultValue,
    reason: 'ERROR',
    errorCode: ErrorCode.TYPE_MISMATCH,
    errorMessage: `PostHog's value for ${flagKey} has another type`,
});

/**
 * The OpenFeature client provider. Only boolean and string (variant) flags are supported.
 *
 * @since 0.0.1
 * @implements {Provider}
 * @example
 * const provider = new PostHogClientProvider(connect(apiKey, host));
 */
export class PostHogClientProvider implements Provider {
    readonly runsOn = 'client';
    readonly metadata = { name: 'PostHogClientProvider' } as const;
    readonly events = new OpenFeatureEventEmitter();
    private readonly client: PostHogFlagClient;
    private readonly unsubscribe: /** Detach this provider's refresh listener without closing the shared client. */ () => void;

    /**
     * Borrow a cached-flag client and own one refresh subscription until OpenFeature closes this provider.
     *
     * @param client - The shared PostHog flag client; this provider never closes it.
     * @example
     * const provider = new PostHogClientProvider(connect(apiKey, host));
     */
    constructor(client: PostHogFlagClient) {
        this.client = client;
        this.unsubscribe = client.onFeatureFlags(
            /**
             * Invalidate OpenFeature's configuration view when PostHog updates its cached flags.
             *
             * @returns Nothing; the event emitter's result is not used.
             */
            () => this.events.emit(ProviderEvents.ConfigurationChanged)
        );
    }

    /**
     * Detach the refresh subscription synchronously; the resolved promise satisfies OpenFeature's close protocol.
     * The provider borrows the client, so closing it never shuts down other users of that client.
     *
     * @returns A promise that is already resolved.
     * @example
     * await provider.onClose();
     */
    onClose(): Promise<void> {
        this.unsubscribe();
        return Promise.resolve();
    }

    /**
     * Resolve cached booleans and treat a served variant as enabled, because a multivariate flag is on when any
     * variant is served. Unknown keys preserve the caller's default.
     *
     * @param flagKey - The flag to resolve.
     * @param defaultValue - The value to return when PostHog has none.
     * @returns The resolution, or `FLAG_NOT_FOUND` with the default.
     * @example
     * provider.resolveBooleanEvaluation('shell.offline-banner', false);
     */
    resolveBooleanEvaluation(flagKey: string, defaultValue: boolean): ResolutionDetails<boolean> {
        const value = this.client.getFeatureFlag(flagKey);
        if (value === undefined) return notFound(defaultValue, flagKey);
        return { value: typeof value === 'string' ? true : value, reason: 'TARGETING_MATCH' };
    }

    /**
     * Return only actual variant strings. Absence permits source fallback; a known boolean is a type mismatch, not a
     * string variant.
     *
     * @param flagKey - The flag to resolve.
     * @param defaultValue - The value to return when PostHog has no variant.
     * @returns The served variant, `FLAG_NOT_FOUND`, or `TYPE_MISMATCH`, each with the default where no variant applies.
     * @example
     * provider.resolveStringEvaluation('shell.theme', 'light');
     */
    resolveStringEvaluation(flagKey: string, defaultValue: string): ResolutionDetails<string> {
        const value = this.client.getFeatureFlag(flagKey);
        if (value === undefined) return notFound(defaultValue, flagKey);
        return typeof value === 'string'
            ? { value, variant: value, reason: 'TARGETING_MATCH' }
            : mismatch(defaultValue, flagKey);
    }

    /**
     * Reject numeric evaluation without reading the cache; PostHog flags expose only booleans and variants here.
     *
     * @param flagKey - The flag requested as a number.
     * @param defaultValue - The caller's default, returned unchanged.
     * @returns A `TYPE_MISMATCH` resolution.
     * @example
     * provider.resolveNumberEvaluation('shell.limit', 10);
     */
    resolveNumberEvaluation(flagKey: string, defaultValue: number): ResolutionDetails<number> {
        return mismatch(defaultValue, flagKey);
    }

    /**
     * Preserve the object default with a type error; this adapter does not interpret feature-flag payloads.
     *
     * @template T - The type of the requested object.
     * @param flagKey - The flag requested as an object.
     * @param defaultValue - The caller's default, returned unchanged.
     * @returns A `TYPE_MISMATCH` resolution.
     * @example
     * provider.resolveObjectEvaluation('shell.layout', {});
     */
    resolveObjectEvaluation<T>(flagKey: string, defaultValue: T): ResolutionDetails<T> {
        return mismatch(defaultValue, flagKey);
    }
}
