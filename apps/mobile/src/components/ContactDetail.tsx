import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Contact } from '../types/event';
import { theme } from '../theme/tokens';

interface ContactDetailProps {
  contact: Contact;
  onCall?: (phone: string) => void;
  onEmail?: (email: string) => void;
  onBack?: () => void;
}

export const ContactDetail: React.FC<ContactDetailProps> = React.memo(({
  contact,
  onCall,
  onEmail,
  onBack,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>◀ Back to Contacts</Text>
        </TouchableOpacity>
      )}

      {/* Header Profile */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTextLarge}>{getInitials(contact.name)}</Text>
        </View>
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.role}>{contact.role}</Text>
        <Text style={styles.company}>{contact.company}</Text>

        <View style={styles.tagsContainer}>
          {contact.tags.map((tag) => (
            <View key={tag} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => onCall && onCall(contact.phone)}
          accessibilityRole="button"
          accessibilityLabel={`Call ${contact.phone}`}
        >
          <Text style={styles.actionCardIcon}>📞</Text>
          <Text style={styles.actionCardLabel}>Call</Text>
          <Text style={styles.actionCardValue}>{contact.phone}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => onEmail && onEmail(contact.email)}
          accessibilityRole="button"
          accessibilityLabel={`Email ${contact.email}`}
        >
          <Text style={styles.actionCardIcon}>✉️</Text>
          <Text style={styles.actionCardLabel}>Email</Text>
          <Text style={styles.actionCardValue} numberOfLines={1}>{contact.email}</Text>
        </TouchableOpacity>
      </View>

      {/* Notes Section */}
      {contact.notes && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notes & Context</Text>
          <Text style={styles.notesText}>{contact.notes}</Text>
        </View>
      )}
    </ScrollView>
  );
});

ContactDetail.displayName = 'ContactDetail';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  backButton: {
    marginBottom: theme.spacing.md,
  },
  backText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.sm,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatarTextLarge: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  name: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  role: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  company: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  tagBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: 'medium',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  actionCardIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  actionCardLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  actionCardValue: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  notesText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
