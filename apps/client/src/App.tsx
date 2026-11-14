/**
 * @file apps/client/src/App.tsx
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

import { OpenFeatureProvider, useBooleanFlagValue } from '@openfeature/react-sdk';
import { Effect, Layer, ManagedRuntime } from 'effect';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { FormattedMessage, IntlProvider, defineMessages } from 'react-intl';
import { StyleSheet, Text, View } from 'react-native';
import { FlagsLive, domain, offlineBanner } from './flags.ts';
import { catalogues, deviceLocale } from './i18n.ts';

// The value types each message takes; react-intl checks `values` against them.
const messages = defineMessages<{
    title: Record<never, never>;
    modules: { count: number };
    offline: Record<never, never>;
}>({
    title: { id: 'client.shell.title', defaultMessage: 'Eventiva' },
    modules: {
        id: 'client.shell.modules',
        defaultMessage: '{count, plural, one {# module installed} other {# modules installed}}',
        description: 'How many feature modules the shell has loaded.',
    },
    offline: {
        id: 'client.shell.offline-banner',
        defaultMessage: 'Changes are saved on this device first.',
    },
});

// Builds the flag providers once, for the life of the app.
const runtime = ManagedRuntime.make(Layer.orDie(FlagsLive));

const Shell = () => {
    const showBanner = useBooleanFlagValue(offlineBanner.key, offlineBanner.safeDefault);
    return (
        <View style={styles.container}>
            <Text role="heading" style={styles.title} testID="title">
                <FormattedMessage {...messages.title} />
            </Text>
            <Text testID="modules">
                <FormattedMessage {...messages.modules} values={{ count: 0 }} />
            </Text>
            {showBanner ? (
                <Text testID="offline-banner">
                    <FormattedMessage {...messages.offline} />
                </Text>
            ) : null}
            <StatusBar style="auto" />
        </View>
    );
};

export const App = () => {
    const locale = deviceLocale();
    useEffect(() => {
        runtime.runFork(Effect.void);
    }, []);
    return (
        <IntlProvider locale={locale} defaultLocale="en-GB" messages={catalogues[locale] ?? {}}>
            <OpenFeatureProvider domain={domain}>
                <Shell />
            </OpenFeatureProvider>
        </IntlProvider>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
    title: { fontSize: 32, fontWeight: '600' },
});
