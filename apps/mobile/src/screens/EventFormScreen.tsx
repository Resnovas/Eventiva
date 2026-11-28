import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Event } from '../types/event';
import { EventForm } from '../components/EventForm';
import { eventsApi } from '../services/eventsApi';
import { theme } from '../theme/tokens';

interface EventFormScreenProps {
  initialValues?: Partial<Event>;
  eventId?: string;
  onSuccess?: (event: Event) => void;
  onCancel?: () => void;
}

export const EventFormScreen: React.FC<EventFormScreenProps> = ({
  initialValues,
  eventId,
  onSuccess,
  onCancel,
}) => {
  const handleSubmit = async (eventData: Omit<Event, 'id'>) => {
    let result: Event;
    if (eventId) {
      result = await eventsApi.updateEvent(eventId, eventData);
    } else {
      result = await eventsApi.createEvent(eventData);
    }
    if (onSuccess) onSuccess(result);
  };

  return (
    <View style={styles.container}>
      <EventForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
