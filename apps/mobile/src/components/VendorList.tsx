import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VendorCard } from './VendorCard';
import { Vendor } from '../types/vendor';
import { theme } from '../theme/tokens';

interface VendorListProps {
  vendors: Vendor[];
  onSelectVendor?: (vendor: Vendor) => void;
}

export const VendorList: React.FC<VendorListProps> = ({ vendors, onSelectVendor }) => {
  if (vendors.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No vendors found</Text>
        <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {vendors.map((vendor) => (
        <VendorCard key={vendor.id} vendor={vendor} onSelect={onSelectVendor} />
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