import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScheduleItem as ScheduleItemType } from '../types/event';
import { ScheduleItem } from './ScheduleItem';
import { theme } from '../theme/tokens';

interface ScheduleTimelineProps {
  schedule: ScheduleItemType[];
  onSelectItem?: (item: ScheduleItemType) => void;
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = React.memo(({
  schedule,
  onSelectItem,
}) => {
  const sortedSchedule = [...schedule].sort((a, b) => a.orderIndex - b.orderIndex);

  if (sortedSchedule.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>⏳</Text>
        <Text style={styles.emptyTitle}>No Schedule Items</Text>
        <Text style={styles.emptySubtitle}>There are no sessions scheduled for this event yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.timelineHeader}>Event Timeline ({sortedSchedule.length} Sessions)</Text>
      <FlatList
        data={sortedSchedule}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ScheduleItem
            item={item}
            onPress={() => onSelectItem && onSelectItem(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
});

ScheduleTimeline.displayName = 'ScheduleTimeline';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  timelineHeader: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.xs,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
