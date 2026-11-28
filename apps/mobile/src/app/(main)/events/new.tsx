import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { EventFormScreen } from '../../../screens/EventFormScreen.js';
import { useRouter } from 'expo-router';
import { theme } from '../../../theme/tokens.js';

export default function EventNewRoute() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <EventFormScreen
        onSubmit={() => router.back()}
        onCancel={() => router.back()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});