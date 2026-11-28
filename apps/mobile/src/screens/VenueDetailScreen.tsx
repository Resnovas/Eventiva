import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Venue } from '../types/venue';
import { venuesApi } from '../services/venuesApi';
import { VenueDetail } from '../components/VenueDetail';
import { theme } from '../theme/tokens';

interface VenueDetailScreenProps {
  venueId: string;
  onBack?: () => void;
}

export const VenueDetailScreen: React.FC<VenueDetailScreenProps> = ({
  venueId,
  onBack,
}) => {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    venuesApi.getVenueById(venueId).then((data) => {
      setVenue(data);
      setLoading(false);
    });
  }, [venueId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!venue) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Venue not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VenueDetail venue={venue} onBack={onBack} />
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