import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Contact } from '../types/event';
import { contactsApi } from '../services/contactsApi';
import { ContactDetail } from '../components/ContactDetail';
import { theme } from '../theme/tokens';

interface ContactDetailScreenProps {
  contactId: string;
  onBack?: () => void;
}

export const ContactDetailScreen: React.FC<ContactDetailScreenProps> = ({
  contactId,
  onBack,
}) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contactsApi.getContactById(contactId).then((data) => {
      setContact(data);
      setLoading(false);
    });
  }, [contactId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!contact) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Contact not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ContactDetail
        contact={contact}
        onBack={onBack}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.md,
  },
});
