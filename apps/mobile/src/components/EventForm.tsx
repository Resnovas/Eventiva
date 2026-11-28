import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Event } from '../types/event';
import { theme } from '../theme/tokens';

interface EventFormProps {
  initialValues?: Partial<Event>;
  onSubmit: (eventData: Omit<Event, 'id'>) => void;
  onCancel?: () => void;
}

export interface EventFormErrors {
  title?: string;
  description?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  capacity?: string;
}

export const EventForm: React.FC<EventFormProps> = React.memo(({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [category, setCategory] = useState(initialValues?.category || 'Conference');
  const [startDate, setStartDate] = useState(
    initialValues?.startDate || '2026-10-15T09:00:00Z'
  );
  const [endDate, setEndDate] = useState(
    initialValues?.endDate || '2026-10-15T18:00:00Z'
  );
  const [location, setLocation] = useState(initialValues?.location || '');
  const [capacity, setCapacity] = useState(
    initialValues?.capacity ? String(initialValues.capacity) : '100'
  );
  const [status] = useState<Event['status']>(initialValues?.status || 'scheduled');

  const [errors, setErrors] = useState<EventFormErrors>({});

  const validate = (): boolean => {
    const newErrors: EventFormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Event title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }

    const numCapacity = parseInt(capacity, 10);
    if (isNaN(numCapacity) || numCapacity <= 0) {
      newErrors.capacity = 'Capacity must be a positive number';
    }

    // Validate dates
    const startMs = Date.parse(startDate);
    const endMs = Date.parse(endDate);

    if (isNaN(startMs)) {
      newErrors.startDate = 'Invalid start date format (ISO required)';
    }

    if (isNaN(endMs)) {
      newErrors.endDate = 'Invalid end date format (ISO required)';
    }

    if (!isNaN(startMs) && !isNaN(endMs) && startMs > endMs) {
      newErrors.endDate = 'End date cannot be earlier than start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        startDate,
        endDate,
        location: location.trim(),
        capacity: parseInt(capacity, 10),
        registeredCount: initialValues?.registeredCount || 0,
        status,
        schedule: initialValues?.schedule || [],
        contacts: initialValues?.contacts || [],
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.formTitle}>
        {initialValues?.title ? 'Edit Event' : 'Create New Event'}
      </Text>

      {/* Title Field */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Event Title *</Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          placeholder="e.g. Annual Tech Summit 2026"
          placeholderTextColor={theme.colors.textMuted}
          value={title}
          onChangeText={setTitle}
          accessibilityLabel="Event Title Input"
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>

      {/* Category Field */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Category *</Text>
        <TextInput
          style={[styles.input, errors.category && styles.inputError]}
          placeholder="e.g. Conference, Gala, Workshop"
          placeholderTextColor={theme.colors.textMuted}
          value={category}
          onChangeText={setCategory}
        />
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
      </View>

      {/* Description Field */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea, errors.description && styles.inputError]}
          placeholder="Detailed event description..."
          placeholderTextColor={theme.colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={4}
        />
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
      </View>

      {/* Date Fields Row */}
      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.label}>Start Date (ISO) *</Text>
          <TextInput
            style={[styles.input, errors.startDate && styles.inputError]}
            value={startDate}
            onChangeText={setStartDate}
          />
          {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
        </View>

        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.label}>End Date (ISO) *</Text>
          <TextInput
            style={[styles.input, errors.endDate && styles.inputError]}
            value={endDate}
            onChangeText={setEndDate}
          />
          {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
        </View>
      </View>

      {/* Location & Capacity */}
      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.flex2]}>
          <Text style={styles.label}>Location / Venue *</Text>
          <TextInput
            style={[styles.input, errors.location && styles.inputError]}
            placeholder="e.g. London Convention Centre"
            placeholderTextColor={theme.colors.textMuted}
            value={location}
            onChangeText={setLocation}
          />
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </View>

        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.label}>Capacity *</Text>
          <TextInput
            style={[styles.input, errors.capacity && styles.inputError]}
            placeholder="500"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
            value={capacity}
            onChangeText={setCapacity}
          />
          {errors.capacity && <Text style={styles.errorText}>{errors.capacity}</Text>}
        </View>
      </View>

      {/* Submit / Cancel Buttons */}
      <View style={styles.buttonRow}>
        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          accessibilityRole="button"
          accessibilityLabel="Submit Event Form"
        >
          <Text style={styles.submitText}>
            {initialValues?.title ? 'Update Event' : 'Create Event'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
});

EventForm.displayName = 'EventForm';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  formTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  fieldGroup: {
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: theme.colors.danger,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.xs,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    justifyContent: 'center',
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  submitText: {
    color: theme.colors.textLight,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
