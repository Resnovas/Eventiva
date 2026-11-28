import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { EventDetailScreen } from '../../../screens/EventDetailScreen.js';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../../theme/tokens.js';

export default function EventDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <EventDetailScreen
        eventId={id}
        onBack={() => router.back()}
        onEdit={() => router.push(`/events/${id}/edit`)}
        onDelete={() => router.back()}
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