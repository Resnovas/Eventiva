import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, SafeAreaView } from 'react-native';
import { Event, ScheduleItem } from '../../types/event';
import { eventsApi } from '../../services/eventsApi';
import { ScheduleTimeline } from '../../components/ScheduleTimeline';
import { theme } from '../../theme/tokens';

export default function SchedulingRoute() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.getEvents().then((data) => {
      setEvents(data);
      if (data.length > 0) setSelectedEvent(data[0]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!selectedEvent) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No events scheduled</Text>
        <Text style={styles.emptySubtext}>Create an event to start scheduling</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.eventSelector}>
        {events.map((evt) => (
          <View
            key={evt.id}
            style={[
              styles.eventChip,
              selectedEvent.id === evt.id && styles.eventChipActive,
            ]}
          >
            <Text
              style={[
                styles.eventChipText,
                selectedEvent.id === evt.id && styles.eventChipTextActive,
              ]}
              onPress={() => setSelectedEvent(evt)}
            >
              {evt.title}
            </Text>
          </View>
        ))}
      </View>

      <ScheduleTimeline
        schedule={selectedEvent.schedule || []}
        onSelectItem={(item: ScheduleItem) => {}}
      />
    </SafeAreaView>
  );
}

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
  eventSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  eventChip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  eventChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  eventChipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  eventChipTextActive: {
    color: theme.colors.textLight,
  },
  emptySchedule: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});