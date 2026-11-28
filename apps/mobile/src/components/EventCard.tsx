import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Event } from '../types/event';
import { theme } from '../theme/tokens';

interface EventCardProps {
  event: Event;
  onPress?: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = React.memo(({ event, onPress }) => {
  const formattedDate = new Date(event.startDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(event.startDate).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'scheduled':
        return theme.colors.statusScheduled;
      case 'live':
        return theme.colors.statusLive;
      case 'completed':
        return theme.colors.statusCompleted;
      case 'cancelled':
        return theme.colors.statusCancelled;
      case 'draft':
      default:
        return theme.colors.statusDraft;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(event)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Event: ${event.title}, Status: ${event.status}`}
      accessibilityHint="Double tap to open event details"
    >
      <View style={styles.headerRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
          <Text style={styles.statusText}>{event.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {event.title}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {event.description}
      </Text>

      <View style={styles.metaContainer}>
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📅</Text>
          <Text style={styles.metaText}>{formattedDate} at {formattedTime}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.capacityText}>
          👥 {event.registeredCount} / {event.capacity} Registered
        </Text>
      </View>
    </TouchableOpacity>
  );
});

EventCard.displayName = 'EventCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  categoryText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    color: theme.colors.textLight,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginVertical: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  metaContainer: {
    marginVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
  },
  metaText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  footerRow: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
  },
  capacityText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
