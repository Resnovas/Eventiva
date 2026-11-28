import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Vendor } from '../types/vendor';
import { theme } from '../theme/tokens';

interface VendorDetailProps {
  vendor: Vendor;
  onBack?: () => void;
  onEdit?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  catering: 'Catering',
  'audio-visual': 'Audio / Visual',
  photography: 'Photography',
  florist: 'Florist',
  transport: 'Transport',
  entertainment: 'Entertainment',
  decoration: 'Decoration',
  security: 'Security',
  other: 'Other',
};

const CATEGORY_ICONS: Record<string, string> = {
  catering: '🍽️',
  'audio-visual': '🔊',
  photography: '📸',
  florist: '🌸',
  transport: '🚗',
  entertainment: '🎵',
  decoration: '🎨',
  security: '🛡️',
  other: '📦',
};

const STATUS_COLORS: Record<string, string> = {
  active: theme.colors.success,
  inactive: theme.colors.textMuted,
  pending: theme.colors.warning,
};

export const VendorDetail: React.FC<VendorDetailProps> = React.memo(({
  vendor,
  onBack,
  onEdit,
}) => {
  const handleCall = () => Linking.openURL(`tel:${vendor.contactPhone}`);
  const handleEmail = () => Linking.openURL(`mailto:${vendor.contactEmail}`);
  const handleWebsite = () => vendor.website && Linking.openURL(vendor.website);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>◀ Back to Vendors</Text>
        </TouchableOpacity>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{CATEGORY_ICONS[vendor.category] || '📦'}</Text>
        </View>
        <Text style={styles.name}>{vendor.name}</Text>
        <Text style={styles.category}>{CATEGORY_LABELS[vendor.category] || vendor.category}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[vendor.status] + '20' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[vendor.status] }]}>
            {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Rating */}
      <View style={styles.ratingCard}>
        <Text style={styles.ratingStars}>⭐ {vendor.rating}</Text>
        <Text style={styles.ratingCount}>Based on {vendor.reviewCount} reviews</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionCard} onPress={handleCall}>
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={styles.actionLabel}>Call</Text>
          <Text style={styles.actionValue}>{vendor.contactPhone}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={handleEmail}>
          <Text style={styles.actionIcon}>✉️</Text>
          <Text style={styles.actionLabel}>Email</Text>
          <Text style={styles.actionValue} numberOfLines={1}>{vendor.contactEmail}</Text>
        </TouchableOpacity>
      </View>

      {/* Website */}
      {vendor.website && (
        <TouchableOpacity style={styles.websiteCard} onPress={handleWebsite}>
          <Text style={styles.websiteText}>🌐 {vendor.website}</Text>
        </TouchableOpacity>
      )}

      {/* Contact Person */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Contact Person</Text>
        <Text style={styles.contactName}>{vendor.contactName}</Text>
        <Text style={styles.contactAddress}>{vendor.address}</Text>
      </View>

      {/* Description */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.descriptionText}>{vendor.description}</Text>
      </View>

      {/* Tags */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Specialties</Text>
        <View style={styles.tagsContainer}>
          {vendor.tags.map((tag) => (
            <View key={tag} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
});

VendorDetail.displayName = 'VendorDetail';

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
  category: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
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
  ratingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  ratingStars: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.accent,
  },
  ratingCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
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
  websiteCard: {
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  websiteText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
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
  contactName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  contactAddress: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
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