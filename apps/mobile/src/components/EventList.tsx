import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Event } from '../types/event';
import { EventCard } from './EventCard';
import { CalendarView } from './CalendarView';
import { theme } from '../theme/tokens';

interface EventListProps {
  events: Event[];
  onSelectEvent?: (event: Event) => void;
  onCreateEventPress?: () => void;
}

export const EventList: React.FC<EventListProps> = React.memo(({
  events,
  onSelectEvent,
  onCreateEventPress,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [displayMode, setDisplayMode] = useState<'list' | 'calendar'>('list');

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesSearch =
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === 'all' ? true : evt.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, selectedStatus]);

  const statuses = ['all', 'scheduled', 'live', 'draft', 'completed'];

  return (
    <View style={styles.container}>
      {/* Top Header & Search */}
      <View style={styles.headerContainer}>
        <View style={styles.topRow}>
          <Text style={styles.headerTitle}>Eventiva Events</Text>

          <View style={styles.topRightControls}>
            {/* View mode toggle (List / Calendar) */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() =>
                setDisplayMode(displayMode === 'list' ? 'calendar' : 'list')
              }
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${displayMode === 'list' ? 'Calendar' : 'List'} view`}
            >
              <Text style={styles.toggleButtonText}>
                {displayMode === 'list' ? '📅 Calendar' : '📋 List'}
              </Text>
            </TouchableOpacity>

            {onCreateEventPress && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={onCreateEventPress}
                accessibilityRole="button"
                accessibilityLabel="Create New Event"
              >
                <Text style={styles.createButtonText}>+ Create</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {displayMode === 'list' && (
          <>
            <TextInput
              style={styles.searchInput}
              placeholder="Search events by title, description, venue..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search Events Input"
            />

            {/* Status Filters */}
            <FlatList
              horizontal
              data={statuses}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterPill,
                    selectedStatus === item && styles.filterPillActive,
                  ]}
                  onPress={() => setSelectedStatus(item)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedStatus === item }}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedStatus === item && styles.filterPillTextActive,
                    ]}
                  >
                    {item.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </View>

      {/* Body Content */}
      {displayMode === 'calendar' ? (
        <CalendarView events={events} onSelectEvent={onSelectEvent} />
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard event={item} onPress={onSelectEvent} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🗓️</Text>
              <Text style={styles.emptyTitle}>No matching events</Text>
              <Text style={styles.emptySubtitle}>Try resetting search query or filter pills</Text>
            </View>
          }
        />
      )}
    </View>
  );
});

EventList.displayName = 'EventList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    backgroundColor: theme.colors.cardBackground,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  topRightControls: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  toggleButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  toggleButtonText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  createButtonText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textLight,
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  filterScroll: {
    gap: theme.spacing.xs,
  },
  filterPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.xs,
  },
  filterPillActive: {
    backgroundColor: theme.colors.primary,
  },
  filterPillText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  filterPillTextActive: {
    color: theme.colors.textLight,
  },
  listContent: {
    paddingVertical: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
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
  },
});
