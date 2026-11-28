import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Venue } from '../types/venue';
import { theme } from '../theme/tokens';

interface VenueCardProps {
  venue: Venue;
  onSelect?: (venue: Venue) => void;
}

const STATUS_COLORS: Record<string, string> = {
  available: theme.colors.success,
  reserved: theme.colors.warning,
  maintenance: theme.colors.danger,
};

export const VenueCard: React.FC<VenueCardProps> = ({ venue, onSelect }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onSelect?.(venue)} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="map-marker" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>{venue.name}</Text>
          <Text style={styles.city}>{venue.city}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[venue.status] + '20' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[venue.status] }]}>
            {venue.status.charAt(0).toUpperCase() + venue.status.slice(1)}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>{venue.description}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="account-group" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.statText}>{venue.capacity}</Text>
        </View>
        {venue.hourlyRate != null && (
          <View style={styles.stat}>
            <MaterialCommunityIcons name="currency-gbp" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>{venue.hourlyRate}/hr</Text>
          </View>
        )}
      </View>

      {venue.amenities.length > 0 && (
        <View style={styles.amenityRow}>
          {venue.amenities.slice(0, 3).map((amenity) => (
            <View key={amenity} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
          {venue.amenities.length > 3 && (
            <Text style={styles.moreText}>+{venue.amenities.length - 3} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  city: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  amenityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  amenityTag: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  amenityText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  moreText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
  },
});