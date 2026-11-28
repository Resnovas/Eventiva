import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Contact } from '../types/event';
import { contactsApi } from '../services/contactsApi';
import { ContactList } from '../components/ContactList';
import { theme } from '../theme/tokens';

interface ContactListScreenProps {
  onSelectContact?: (contact: Contact) => void;
}

export const ContactListScreen: React.FC<ContactListScreenProps> = ({
  onSelectContact,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contactsApi.getContacts().then((data) => {
      setContacts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ContactList
        contacts={contacts}
        onSelectContact={onSelectContact}
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
});
