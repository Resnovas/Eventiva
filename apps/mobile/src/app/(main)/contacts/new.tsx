import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { ContactDetailScreen } from '../../../screens/ContactDetailScreen.js';
import { useRouter } from 'expo-router';
import { theme } from '../../../theme/tokens.js';

export default function ContactNewRoute() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ContactDetailScreen
        contactId={undefined}
        onBack={() => router.back()}
        onEdit={() => router.back()}
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