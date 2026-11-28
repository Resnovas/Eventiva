import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Event, ScheduleItem } from '../types/event';
import { eventsApi } from '../services/eventsApi';
import { ScheduleEditor } from '../components/ScheduleEditor';
import { theme } from '../theme/tokens';

interface ScheduleEditorScreenProps {
  eventId: string;
  onDone?: () => void;
}

export const ScheduleEditorScreen: React.FC<ScheduleEditorScreenProps> = ({
  eventId,
  onDone,
}) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.getEventById(eventId).then((data) => {
      setEvent(data);
      setLoading(false);
    });
  }, [eventId]);

  const handleSave = async (newSchedule: ScheduleItem[]) => {
    await eventsApi.reorderSchedule(eventId, newSchedule);
    if (onDone) onDone();
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
      <ScheduleEditor
        eventId={eventId}
        initialSchedule={event.schedule || []}
        onSaveSchedule={handleSave}
        onCancel={onDone}
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
