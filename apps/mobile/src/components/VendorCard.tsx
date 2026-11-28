import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Vendor } from '../types/vendor';
import { theme } from '../theme/tokens';

interface VendorCardProps {
  vendor: Vendor;
  onSelect?: (vendor: Vendor) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  catering: 'silverware-fork-knife',
  'audio-visual': 'speaker',
  photography: 'camera',
  florist: 'flower',
  transport: 'car',
  entertainment: 'music',
  decoration: 'palette',
  security: 'shield',
  other: 'dots-horizontal',
};

const STATUS_COLORS: Record<string, string> = {
  active: theme.colors.success,
  inactive: theme.colors.textMuted,
  pending: theme.colors.warning,
};

export const VendorCard: React.FC<VendorCardProps> = ({ vendor, onSelect }) => {
  const iconName = CATEGORY_ICONS[vendor.category] || 'dots-horizontal';

  return (
    <TouchableOpacity style={styles.card} onPress={() => onSelect?.(vendor)} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={iconName as any}
            size={24}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>{vendor.name}</Text>
          <Text style={styles.category}>
            {vendor.category.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[vendor.status] + '20' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[vendor.status] }]}>
            {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>{vendor.description}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="star" size={16} color={theme.colors.accent} />
          <Text style={styles.statText}>{vendor.rating}</Text>
          <Text style={styles.reviewCount}>({vendor.reviewCount})</Text>
        </View>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="account" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.statText}>{vendor.contactName}</Text>
        </View>
      </View>

      {vendor.tags.length > 0 && (
        <View style={styles.tagRow}>
          {vendor.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {vendor.tags.length > 3 && (
            <Text style={styles.moreText}>+{vendor.tags.length - 3} more</Text>
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
  category: {
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
  reviewCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  moreText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
  },
});