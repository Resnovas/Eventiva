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

const fake = (flags: Record<string, boolean | string>) => {
    const listeners = new Set<() => void>();
    return {
        flags,
        listeners,
        client: {
            getFeatureFlag: (key: string) => flags[key],
            onFeatureFlags: (callback: () => void) => {
                listeners.add(callback);
                return () => listeners.delete(callback);
            },
        },
    };
};

describe('PostHogClientProvider', () => {
    it('maps PostHog values to OpenFeature resolutions', () => {
        const provider = new PostHogClientProvider(fake({ on: true, off: false, variant: 'b' }).client);
        expect(provider.resolveBooleanEvaluation('on', false)).toMatchObject({ value: true, reason: 'TARGETING_MATCH' });
        expect(provider.resolveBooleanEvaluation('off', true)).toMatchObject({ value: false });
        expect(provider.resolveBooleanEvaluation('variant', false)).toMatchObject({ value: true });
        expect(provider.resolveStringEvaluation('variant', 'a')).toMatchObject({ value: 'b', variant: 'b' });
    });

    it('reports unknown flags as not found and other types as mismatches, keeping the default', () => {
        const provider = new PostHogClientProvider(fake({ on: true }).client);
        expect(provider.resolveBooleanEvaluation('missing', true)).toMatchObject({
            value: true,
            errorCode: ErrorCode.FLAG_NOT_FOUND,
        });
        expect(provider.resolveStringEvaluation('missing', 'x').errorCode).toBe(ErrorCode.FLAG_NOT_FOUND);
        expect(provider.resolveStringEvaluation('on', 'x')).toMatchObject({ value: 'x', errorCode: ErrorCode.TYPE_MISMATCH });
        expect(provider.resolveNumberEvaluation('on', 3)).toMatchObject({ value: 3, errorCode: ErrorCode.TYPE_MISMATCH });
        expect(provider.resolveObjectEvaluation('on', { a: 1 })).toMatchObject({ value: { a: 1 } });
    });

    it('announces new PostHog flags and stops listening when closed', () => {
        const source = fake({});
        const provider = new PostHogClientProvider(source.client);
        let changes = 0;
        provider.events.addHandler(ProviderEvents.ConfigurationChanged, () => {
            changes += 1;
        });
        for (const listener of source.listeners) listener();
        expect(changes).toBe(1);
        // Closing unsubscribes synchronously; the returned promise only satisfies the Provider contract.
        void provider.onClose();
        expect(source.listeners.size).toBe(0);
    });
});
