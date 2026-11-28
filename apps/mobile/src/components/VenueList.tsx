import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VenueCard } from './VenueCard';
import { Venue } from '../types/venue';
import { theme } from '../theme/tokens';

interface VenueListProps {
  venues: Venue[];
  onSelectVenue?: (venue: Venue) => void;
}

export const VenueList: React.FC<VenueListProps> = ({ venues, onSelectVenue }) => {
  if (venues.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No venues found</Text>
        <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {venues.map((venue) => (
        <VenueCard key={venue.id} venue={venue} onSelect={onSelectVenue} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xl,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});