import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Venue } from '../types/venue';
import { theme } from '../theme/tokens';

interface VenueDetailProps {
  venue: Venue;
  onBack?: () => void;
  onEdit?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  available: theme.colors.success,
  reserved: theme.colors.warning,
  maintenance: theme.colors.danger,
};

export const VenueDetail: React.FC<VenueDetailProps> = React.memo(({
  venue,
  onBack,
  onEdit,
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>◀ Back to Venues</Text>
        </TouchableOpacity>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📍</Text>
        </View>
        <Text style={styles.name}>{venue.name}</Text>
        <Text style={styles.address}>{venue.address}, {venue.city}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[venue.status] + '20' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[venue.status] }]}>
            {venue.status.charAt(0).toUpperCase() + venue.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionCard}
          accessibilityRole="button"
          accessibilityLabel={`Call ${venue.contactPhone}`}
        >
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={styles.actionLabel}>Call</Text>
          <Text style={styles.actionValue}>{venue.contactPhone}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          accessibilityRole="button"
          accessibilityLabel={`Email ${venue.contactEmail}`}
        >
          <Text style={styles.actionIcon}>✉️</Text>
          <Text style={styles.actionLabel}>Email</Text>
          <Text style={styles.actionValue} numberOfLines={1}>{venue.contactEmail}</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{venue.capacity}</Text>
          <Text style={styles.statLabel}>Capacity</Text>
        </View>
        {venue.hourlyRate != null && (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{venue.currency} {venue.hourlyRate}</Text>
            <Text style={styles.statLabel}>Per Hour</Text>
          </View>
        )}
      </View>

      {/* Description */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.descriptionText}>{venue.description}</Text>
      </View>

      {/* Amenities */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.tagsContainer}>
          {venue.amenities.map((amenity) => (
            <View key={amenity} style={styles.tagBadge}>
              <Text style={styles.tagText}>{amenity}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
});

VenueDetail.displayName = 'VenueDetail';

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
  header: {
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  icon: {
    fontSize: 28,
  },
  name: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  address: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  statusBadge: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
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
  actionIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  actionLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actionValue: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: 2,
  },
  statsCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  descriptionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
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
    fontWeight: '500',
  },
});