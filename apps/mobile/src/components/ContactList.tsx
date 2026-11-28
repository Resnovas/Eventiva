import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList } from 'react-native';
import { Contact } from '../types/event';
import { ContactCard } from './ContactCard';
import { theme } from '../theme/tokens';

interface ContactListProps {
  contacts: Contact[];
  onSelectContact?: (contact: Contact) => void;
  onCallContact?: (phone: string) => void;
  onEmailContact?: (email: string) => void;
}

export const ContactList: React.FC<ContactListProps> = React.memo(({
  contacts,
  onSelectContact,
  onCallContact,
  onEmailContact,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.company.toLowerCase().includes(query) ||
        c.role.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts by name, role, company..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search Contacts Input"
        />
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactCard
            contact={item}
            onPress={onSelectContact}
            onCall={onCallContact}
            onEmail={onEmailContact}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyTitle}>No contacts found</Text>
            <Text style={styles.emptySubtitle}>Try searching for a different keyword</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
});

ContactList.displayName = 'ContactList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  listContent: {
    paddingVertical: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.xs,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
