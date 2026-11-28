import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Contact } from '../types/event';
import { theme } from '../theme/tokens';

interface ContactCardProps {
  contact: Contact;
  onPress?: (contact: Contact) => void;
  onCall?: (phone: string) => void;
  onEmail?: (email: string) => void;
}

export const ContactCard: React.FC<ContactCardProps> = React.memo(({
  contact,
  onPress,
  onCall,
  onEmail,
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
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(contact)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Contact: ${contact.name}, ${contact.role} at ${contact.company}`}
    >
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
      </View>

      <View style={styles.infoColumn}>
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.roleText}>{contact.role} • {contact.company}</Text>

        <View style={styles.tagsRow}>
          {contact.tags.map((tag) => (
            <View key={tag} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actionsColumn}>
        {onCall && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onCall(contact.phone)}
            accessibilityRole="button"
            accessibilityLabel={`Call ${contact.name}`}
          >
            <Text style={styles.actionIcon}>📞</Text>
          </TouchableOpacity>
        )}
        {onEmail && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onEmail(contact.email)}
            accessibilityRole="button"
            accessibilityLabel={`Email ${contact.name}`}
          >
            <Text style={styles.actionIcon}>✉️</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

ContactCard.displayName = 'ContactCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.md,
  },
  infoColumn: {
    flex: 1,
  },
  name: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  roleText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginVertical: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: 4,
  },
  tagBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: 'medium',
  },
  actionsColumn: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionBtn: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  actionIcon: {
    fontSize: theme.typography.fontSize.md,
  },
});
