/**
 * @file tests/integrations/posthog-client/src/flags.spec.ts
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

import { PostHogClientProvider } from '@eventiva/integrations.posthog.client/flags';
import { describe, expect, it } from '@effect/vitest';
import { ErrorCode, ProviderEvents } from '@openfeature/web-sdk';

/** Expose a mutable cache and observable subscriptions without creating a real SDK client. */
const fake = (flags: Record<string, boolean | string>) => {
    const listeners = new Set</** Receive a simulated cache refresh without a payload. */ () => void>();
    return {
        flags,
        listeners,
        client: {
            /** Look up the supplied cache directly so missing keys remain undefined. */
            getFeatureFlag: (key: string) => flags[key],
            /** Retain a cache listener and return synchronous removal for disposal assertions. */
            onFeatureFlags: (/** Observe a simulated cache refresh without arguments. */ callback: () => void) => {
                listeners.add(callback);
                return /** Remove only this subscription, preserving other registered listeners. */ () =>
                    listeners.delete(callback);
            },
        },
    };
};

describe('PostHogClientProvider', /** Register cached value mapping, fallback and subscription lifecycle regressions. */ () => {
    it('maps PostHog values to OpenFeature resolutions', /** Verify booleans retain polarity and string variants activate boolean evaluation. */ () => {
        // Opposing caller defaults distinguish cached answers from fallback for both boolean polarities.
        const provider = new PostHogClientProvider(fake({ on: true, off: false, variant: 'b' }).client);
        expect(provider.resolveBooleanEvaluation('on', false)).toMatchObject({
            value: true,
            reason: 'TARGETING_MATCH'
        });
        expect(provider.resolveBooleanEvaluation('off', true)).toMatchObject({ value: false });
        expect(provider.resolveBooleanEvaluation('variant', false)).toMatchObject({ value: true });
        expect(provider.resolveStringEvaluation('variant', 'a')).toMatchObject({ value: 'b', variant: 'b' });
    });

    it('reports unknown flags as not found and other types as mismatches, keeping the default', /** Verify absence differs from incompatible types while caller defaults survive both. */ () => {
        // One known boolean separates absent-key handling from a present value requested through the wrong type.
        const provider = new PostHogClientProvider(fake({ on: true }).client);
        expect(provider.resolveBooleanEvaluation('missing', true)).toMatchObject({
            value: true,
            errorCode: ErrorCode.FLAG_NOT_FOUND,
        });
        expect(provider.resolveStringEvaluation('missing', 'x').errorCode).toBe(ErrorCode.FLAG_NOT_FOUND);
        expect(provider.resolveStringEvaluation('on', 'x')).toMatchObject({
            value: 'x',
            errorCode: ErrorCode.TYPE_MISMATCH
        });
        expect(provider.resolveNumberEvaluation('on', 3)).toMatchObject({
            value: 3,
            errorCode: ErrorCode.TYPE_MISMATCH
        });
        expect(provider.resolveObjectEvaluation('on', { a: 1 })).toMatchObject({ value: { a: 1 } });
    });

    it('announces new PostHog flags and stops listening when closed', /** Verify cache refresh forwarding and synchronous listener removal on close. */ () => {
        const source = fake({});
        const provider = new PostHogClientProvider(source.client);
        let changes = 0;
        provider.events.addHandler(
            ProviderEvents.ConfigurationChanged,
            /** Count forwarded refresh events without changing provider state. */ () => {
                changes += 1;
            }
        );
        for (const listener of source.listeners) listener();
        expect(changes).toBe(1);
        // Closing unsubscribes synchronously; the returned promise only satisfies the Provider contract.
        void provider.onClose();
        expect(source.listeners.size).toBe(0);
    });
});
