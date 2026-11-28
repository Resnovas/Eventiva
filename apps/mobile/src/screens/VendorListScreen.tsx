import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Vendor, VendorCategory } from '../types/vendor';
import { vendorsApi } from '../services/vendorsApi';
import { VendorList } from '../components/VendorList';
import { theme } from '../theme/tokens';

interface VendorListScreenProps {
  onSelectVendor?: (vendor: Vendor) => void;
}

const CATEGORIES: { label: string; value: VendorCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Catering', value: 'catering' },
  { label: 'AV', value: 'audio-visual' },
  { label: 'Photo', value: 'photography' },
  { label: 'Florist', value: 'florist' },
  { label: 'Transport', value: 'transport' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Decor', value: 'decoration' },
  { label: 'Security', value: 'security' },
];

export const VendorListScreen: React.FC<VendorListScreenProps> = ({ onSelectVendor }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    vendorsApi
      .getVendors()
      .then((data) => {
        setVendors(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load vendors');
        setLoading(false);
      });
  }, []);

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (selectedCategory !== 'all') {
      const results = await vendorsApi.getVendorsByCategory(selectedCategory);
      const filtered = query.trim()
        ? results.filter(
            (v) =>
              v.name.toLowerCase().includes(query.toLowerCase()) ||
              v.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
          )
        : results;
      setVendors(filtered);
      return;
    }
    if (!query.trim()) {
      const data = await vendorsApi.getVendors();
      setVendors(data);
      return;
    }
    const results = await vendorsApi.searchVendors(query);
    setVendors(results);
  };

  const handleCategoryFilter = async (cat: VendorCategory | 'all') => {
    setSelectedCategory(cat);
    if (cat === 'all') {
      const data = search.trim()
        ? await vendorsApi.searchVendors(search)
        : await vendorsApi.getVendors();
      setVendors(data);
      return;
    }
    const results = await vendorsApi.getVendorsByCategory(cat);
    const filtered = search.trim()
      ? results.filter(
          (v) =>
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
        )
      : results;
    setVendors(filtered);
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
          placeholder="Search vendors by name or service..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={handleSearch}
          autoCorrect={false}
        />
      </View>

      <View style={styles.categoryBar}>
        {CATEGORIES.map((cat) => (
          <View
            key={cat.value}
            style={[
              styles.categoryChip,
              selectedCategory === cat.value && styles.categoryChipActive,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.value && styles.categoryTextActive,
              ]}
              onPress={() => handleCategoryFilter(cat.value)}
            >
              {cat.label}
            </Text>
          </View>
        ))}
      </View>

      <VendorList vendors={vendors} onSelectVendor={onSelectVendor} />
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
    paddingTop: theme.spacing.sm,
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
  categoryBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  categoryChip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  categoryTextActive: {
    color: theme.colors.textLight,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.md,
  },
});