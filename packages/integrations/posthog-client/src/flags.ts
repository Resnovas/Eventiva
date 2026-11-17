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

/** What the provider needs from a PostHog client; `posthog-react-native`'s `PostHog` satisfies it. */
export interface PostHogFlagClient {
    /** Read a cached boolean or variant; undefined means this source cannot resolve the key. */
    readonly getFeatureFlag: (key: string) => boolean | string | undefined;
    /** Subscribe to cache refreshes and return cleanup owned by the provider, not the client connection. */
    readonly onFeatureFlags: (
        /** Notify that cached evaluations may have changed; no flag payload is required. */
        callback: () => void
    ) => /** Detach this subscription without closing the shared PostHog client. */ () => void;
}

/** Preserve the requested default while signalling absence so first-match resolution can try another source. */
const notFound = <T>(defaultValue: T, flagKey: string): ResolutionDetails<T> => ({
    value: defaultValue,
    reason: 'ERROR',
    errorCode: ErrorCode.FLAG_NOT_FOUND,
    errorMessage: `PostHog has no value for ${flagKey}`,
});

/** Report an unsupported value type without coercing it or replacing the caller's default. */
const mismatch = <T>(defaultValue: T, flagKey: string): ResolutionDetails<T> => ({
    value: defaultValue,
    reason: 'ERROR',
    errorCode: ErrorCode.TYPE_MISMATCH,
    errorMessage: `PostHog's value for ${flagKey} has another type`,
});

/** The OpenFeature client provider. Only boolean and string (variant) flags are supported. */
export class PostHogClientProvider implements Provider {
    readonly runsOn = 'client';
    readonly metadata = { name: 'PostHogClientProvider' } as const;
    readonly events = new OpenFeatureEventEmitter();
    private readonly client: PostHogFlagClient;
    private readonly unsubscribe: /** Detach this provider's refresh listener without closing the shared client. */ () => void;

    /** Borrow a cached-flag client and own one refresh subscription until OpenFeature closes this provider. */
    constructor(client: PostHogFlagClient) {
        this.client = client;
        this.unsubscribe = client.onFeatureFlags(
            /** Invalidate OpenFeature's configuration view when PostHog updates its cached flags. */
            () => this.events.emit(ProviderEvents.ConfigurationChanged)
        );
    }

    /** Detach the refresh subscription synchronously; the resolved promise satisfies OpenFeature's close protocol. */
    onClose(): Promise<void> {
        // This provider borrows the client, so closing it must not shut down other users of that client.
        this.unsubscribe();
        return Promise.resolve();
    }

    /** Resolve cached booleans and treat a served variant as enabled; unknown keys preserve the caller's default. */
    resolveBooleanEvaluation(flagKey: string, defaultValue: boolean): ResolutionDetails<boolean> {
        const value = this.client.getFeatureFlag(flagKey);
        if (value === undefined) return notFound(defaultValue, flagKey);
        // A multivariate flag is on when any variant is served.
        return { value: typeof value === 'string' ? true : value, reason: 'TARGETING_MATCH' };
    }

    /** Return only actual variant strings; distinguish absent keys from boolean values of the wrong type. */
    resolveStringEvaluation(flagKey: string, defaultValue: string): ResolutionDetails<string> {
        const value = this.client.getFeatureFlag(flagKey);
        // Absence permits source fallback; a known boolean is a type mismatch, not a string variant.
        if (value === undefined) return notFound(defaultValue, flagKey);
        return typeof value === 'string'
            ? { value, variant: value, reason: 'TARGETING_MATCH' }
            : mismatch(defaultValue, flagKey);
    }

    /** Reject numeric evaluation without reading the cache; PostHog flags expose only booleans and variants here. */
    resolveNumberEvaluation(flagKey: string, defaultValue: number): ResolutionDetails<number> {
        return mismatch(defaultValue, flagKey);
    }

    /** Preserve the object default with a type error; this adapter does not interpret feature-flag payloads. */
    resolveObjectEvaluation<T>(flagKey: string, defaultValue: T): ResolutionDetails<T> {
        return mismatch(defaultValue, flagKey);
    }
}
