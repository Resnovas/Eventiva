import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScheduleItem as ScheduleItemType } from '../types/event';
import { theme } from '../theme/tokens';

interface ScheduleItemProps {
  item: ScheduleItemType;
  isEditing?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
}

export const ScheduleItem: React.FC<ScheduleItemProps> = React.memo(({
  item,
  isEditing = false,
  canMoveUp = false,
  canMoveDown = false,
  onMoveUp,
  onMoveDown,
  onDelete,
  onPress,
}) => {
  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const categoryColors: Record<string, string> = {
    keynote: '#8B5CF6',
    workshop: '#3B82F6',
    networking: '#10B981',
    break: '#F59E0B',
    panel: '#EC4899',
  };

  const badgeColor = categoryColors[item.category || 'workshop'] || theme.colors.primary;

  return (
    <View style={styles.container}>
      {/* Drag handle / reorder controls */}
      {isEditing && (
        <View style={styles.reorderControls}>
          <TouchableOpacity
            disabled={!canMoveUp}
            onPress={onMoveUp}
            style={[styles.reorderButton, !canMoveUp && styles.disabledButton]}
            accessibilityRole="button"
            accessibilityLabel={`Move ${item.title} up`}
          >
            <Text style={styles.reorderText}>▲</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!canMoveDown}
            onPress={onMoveDown}
            style={[styles.reorderButton, !canMoveDown && styles.disabledButton]}
            accessibilityRole="button"
            accessibilityLabel={`Move ${item.title} down`}
          >
            <Text style={styles.reorderText}>▼</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Item Content */}
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.7}
      >
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{formatTime(item.startTime)}</Text>
          <Text style={styles.timeEndText}>{formatTime(item.endTime)}</Text>
        </View>

        <View style={styles.lineDivider} />

        <View style={styles.detailsColumn}>
          <View style={styles.topRow}>
            {item.category && (
              <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                <Text style={styles.badgeText}>{item.category.toUpperCase()}</Text>
              </View>
            )}
            <Text style={styles.orderBadge}>#{item.orderIndex + 1}</Text>
          </View>

          <Text style={styles.title}>{item.title}</Text>

          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.footerRow}>
            {item.speaker && <Text style={styles.metaText}>👤 {item.speaker}</Text>}
            {item.location && <Text style={styles.metaText}>📍 {item.location}</Text>}
          </View>
        </View>

        {isEditing && onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            style={styles.deleteButton}
            accessibilityRole="button"
            accessibilityLabel={`Delete schedule item ${item.title}`}
          >
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
});

ScheduleItem.displayName = 'ScheduleItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xs,
  },
  reorderControls: {
    flexDirection: 'column',
    marginRight: theme.spacing.xs,
  },
  reorderButton: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  disabledButton: {
    opacity: 0.3,
  },
  reorderText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  timeColumn: {
    width: 60,
    alignItems: 'flex-start',
  },
  timeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  timeEndText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
  },
  lineDivider: {
    width: 2,
    height: '80%',
    backgroundColor: theme.colors.primaryLight,
    marginHorizontal: theme.spacing.xs,
  },
  detailsColumn: {
    flex: 1,
    paddingLeft: theme.spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  badge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    color: theme.colors.textLight,
    fontSize: 9,
    fontWeight: 'bold',
  },
  orderBadge: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  title: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  description: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  metaText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  deleteButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  deleteText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
  },
});
