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
import { StatusBar } from 'expo-status-bar';
import { useSyncExternalStore } from 'react';
import { FormattedMessage, IntlProvider, defineMessages } from 'react-intl';
import { StyleSheet, Text, View } from 'react-native';
import { startup } from './bootstrap.ts';
import { domain, offlineBanner } from './flags.ts';
import { catalogues, deviceLocale } from './i18n.ts';

// The value types each message takes; react-intl checks `values` against them.
const messages = defineMessages<{
    title: Record<never, never>;
    modules: { count: number };
    offline: Record<never, never>;
    loading: Record<never, never>;
    failed: Record<never, never>;
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
    loading: { id: 'client.shell.loading', defaultMessage: 'Starting Eventiva...' },
    failed: { id: 'client.shell.failed', defaultMessage: 'Unable to start. Restart the app to try again.' },
});

/** Render the localized shell; the banner follows the provider's safe-default flag evaluation. */
const Shell = () => {
    const showBanner = useBooleanFlagValue(offlineBanner.key, offlineBanner.safeDefault);
    return (
        <View role="main" style={styles.container}>
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

/** Render a synchronous bootstrap shell; product content subscribes to the sole readiness owner without acquiring services. */
export const App = () => {
    const locale = deviceLocale();
    // One external snapshot gates all product hooks; the synchronous native root never waits on provider IO.
    const state = useSyncExternalStore(startup.subscribe, startup.snapshot, startup.snapshot);
    return (
        <IntlProvider locale={locale} defaultLocale="en-GB" messages={catalogues[locale] ?? {}}>
            {state === 'ready' ? (
                <OpenFeatureProvider domain={domain}>
                    <Shell />
                </OpenFeatureProvider>
            ) : (
                <View role="main" style={styles.container}>
                    <Text role="heading" style={styles.title}>
                        <FormattedMessage {...messages.title} />
                    </Text>
                    <Text role={state === 'failed' ? 'alert' : 'status'}>
                        <FormattedMessage {...(state === 'failed' ? messages.failed : messages.loading)} />
                    </Text>
                </View>
            )}
        </IntlProvider>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
    title: { fontSize: 32, fontWeight: '600' },
});
