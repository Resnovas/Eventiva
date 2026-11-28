import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { ContactDetailScreen } from '../../../screens/ContactDetailScreen.js';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../../theme/tokens.js';

export default function ContactDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ContactDetailScreen
        contactId={id}
        onBack={() => router.back()}
        onEdit={() => router.push(`/contacts/${id}/edit`)}
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