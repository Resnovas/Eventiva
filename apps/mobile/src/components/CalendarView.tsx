import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Event, ViewMode } from '../types/event';
import { theme } from '../theme/tokens';
import { calendarService } from '../services/calendarIntegration';

interface CalendarViewProps {
  events: Event[];
  onSelectEvent?: (event: Event) => void;
  initialMode?: ViewMode;
}

export const CalendarView: React.FC<CalendarViewProps> = React.memo(({
  events,
  onSelectEvent,
  initialMode = 'month',
}) => {
  const [mode, setMode] = useState<ViewMode>(initialMode);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2026-10-15'));
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const viewModes: { key: ViewMode; label: string }[] = [
    { key: 'month', label: 'Month' },
    { key: 'week', label: 'Week' },
    { key: 'day', label: 'Day' },
  ];

  const handlePrevDate = () => {
    const newDate = new Date(selectedDate);
    if (mode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (mode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setSelectedDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(selectedDate);
    if (mode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (mode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date('2026-10-15'));
  };

  // Filter events matching selected date or month
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const evtDate = new Date(evt.startDate);
      if (mode === 'day') {
        return (
          evtDate.getUTCFullYear() === selectedDate.getUTCFullYear() &&
          evtDate.getUTCMonth() === selectedDate.getUTCMonth() &&
          evtDate.getUTCDate() === selectedDate.getUTCDate()
        );
      } else if (mode === 'month') {
        return (
          evtDate.getUTCFullYear() === selectedDate.getUTCFullYear() &&
          evtDate.getUTCMonth() === selectedDate.getUTCMonth()
        );
      } else {
        // week mode: +/- 3 days
        const diffDays = Math.abs(
          (evtDate.getTime() - selectedDate.getTime()) / (1000 * 3600 * 24)
        );
        return diffDays <= 4;
      }
    });
  }, [events, selectedDate, mode]);

  const handleSyncToNativeCalendar = async (evt: Event) => {
    setSyncStatus('Exporting to mobile calendar...');
    const result = await calendarService.exportEventToNativeCalendar(evt);
    if (result.success) {
      setSyncStatus(`Successfully added to device calendar (${result.nativeEventId})`);
    } else {
      setSyncStatus(`Failed: ${result.error}`);
    }
  };

  const formattedHeaderDate = selectedDate.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    day: mode !== 'month' ? 'numeric' : undefined,
  });

  return (
    <View style={styles.container}>
      {/* Header controls */}
      <View style={styles.header}>
        <View style={styles.navigationRow}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handlePrevDate}
            accessibilityRole="button"
            accessibilityLabel="Previous Period"
          >
            <Text style={styles.navButtonText}>◀</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleToday} style={styles.todayBadge}>
            <Text style={styles.headerTitle}>{formattedHeaderDate}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNextDate}
            accessibilityRole="button"
            accessibilityLabel="Next Period"
          >
            <Text style={styles.navButtonText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* View Mode Toggle Pills */}
        <View style={styles.modeToggleRow}>
          {viewModes.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.modePill,
                mode === item.key && styles.modePillActive,
              ]}
              onPress={() => setMode(item.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === item.key }}
              accessibilityLabel={`${item.label} View`}
            >
              <Text
                style={[
                  styles.modePillText,
                  mode === item.key && styles.modePillTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {syncStatus && (
        <View style={styles.syncBanner}>
          <Text style={styles.syncBannerText}>{syncStatus}</Text>
        </View>
      )}

      {/* Events List for Selected View */}
      <ScrollView style={styles.eventsScroll} contentContainerStyle={styles.eventsContent}>
        <Text style={styles.sectionTitle}>
          Events in {mode.toUpperCase()} view ({filteredEvents.length})
        </Text>

        {filteredEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📆</Text>
            <Text style={styles.emptyTitle}>No events scheduled</Text>
            <Text style={styles.emptySubtitle}>Try changing dates or switching view mode</Text>
          </View>
        ) : (
          filteredEvents.map((evt) => (
            <View key={evt.id} style={styles.calendarEventRow}>
              <TouchableOpacity
                style={styles.eventInfoArea}
                onPress={() => onSelectEvent && onSelectEvent(evt)}
              >
                <Text style={styles.eventTime}>
                  {new Date(evt.startDate).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.eventTitle}>{evt.title}</Text>
                <Text style={styles.eventLocation}>📍 {evt.location}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.syncButton}
                onPress={() => handleSyncToNativeCalendar(evt)}
                accessibilityRole="button"
                accessibilityLabel={`Sync ${evt.title} to native calendar`}
              >
                <Text style={styles.syncButtonText}>+ Calendar</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
});

CalendarView.displayName = 'CalendarView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  navButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  navButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
  },
  todayBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 2,
  },
  modePill: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  modePillActive: {
    backgroundColor: theme.colors.primary,
  },
  modePillText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  modePillTextActive: {
    color: theme.colors.textLight,
  },
  syncBanner: {
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  syncBannerText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primaryDark,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  eventsScroll: {
    flex: 1,
  },
  eventsContent: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
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
  calendarEventRow: {
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  eventInfoArea: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  eventTime: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  eventTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginVertical: 2,
  },
  eventLocation: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  syncButton: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  syncButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
