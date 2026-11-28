import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Venue } from '../types/venue';
import { venuesApi } from '../services/venuesApi';
import { VenueList } from '../components/VenueList';
import { theme } from '../theme/tokens';

interface VenueListScreenProps {
  onSelectVenue?: (venue: Venue) => void;
}

export const VenueListScreen: React.FC<VenueListScreenProps> = ({ onSelectVenue }) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    venuesApi
      .getVenues()
      .then((data) => {
        setVenues(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load venues');
        setLoading(false);
      });
  }, []);

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query.trim()) {
      const data = await venuesApi.getVenues();
      setVenues(data);
      return;
    }
    const results = await venuesApi.searchVenues(query);
    setVenues(results);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search venues by name or city..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={handleSearch}
          autoCorrect={false}
        />
      </View>
      <VenueList venues={venues} onSelectVenue={onSelectVenue} />
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
    backgroundColor: theme.colors.background,
  },
  searchBar: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.md,
  },
});