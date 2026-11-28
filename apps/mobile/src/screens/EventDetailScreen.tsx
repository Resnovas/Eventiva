import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Event, ScheduleItem } from '../types/event';
import { eventsApi } from '../services/eventsApi';
import { EventDetail } from '../components/EventDetail';
import { theme } from '../theme/tokens';

// api wires schedule mutations to local cache
// mobile navigation may supply eventId from Expo Router.

interface EventDetailScreenProps {
  eventId: string;
  onBack?: () => void;
  onEditPress?: (event: Event) => void;
}

export const EventDetailScreen: React.FC<EventDetailScreenProps> = ({
  eventId,
  onBack,
  onEditPress,
}) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.getEventById(eventId).then((data) => {
      setEvent(data);
      setLoading(false);
    });
  }, [eventId]);

  const handleSaveSchedule = async (id: string, newSchedule: ScheduleItem[]) => {
    const updatedSchedule = await eventsApi.reorderSchedule(id, newSchedule);
    if (event) {
      setEvent({ ...event, schedule: updatedSchedule });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EventDetail
        event={event}
        onBack={onBack}
        onEditPress={onEditPress}
        onSaveSchedule={handleSaveSchedule}
      />
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
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.md,
  },
});
