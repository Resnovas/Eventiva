import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ScheduleItem as ScheduleItemType } from '../types/event';
import { ScheduleItem } from './ScheduleItem';
import { theme } from '../theme/tokens';

interface ScheduleEditorProps {
  eventId: string;
  initialSchedule: ScheduleItemType[];
  onSaveSchedule: (newSchedule: ScheduleItemType[]) => void;
  onCancel?: () => void;
}

export const ScheduleEditor: React.FC<ScheduleEditorProps> = React.memo(({
  eventId,
  initialSchedule,
  onSaveSchedule,
  onCancel,
}) => {
  const [items, setItems] = useState<ScheduleItemType[]>([...initialSchedule]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemSpeaker, setNewItemSpeaker] = useState('');
  const [newItemLocation, setNewItemLocation] = useState('');

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate order indices
    const reindexed = updated.map((item, idx) => ({
      ...item,
      orderIndex: idx,
    }));
    setItems(reindexed);
  };

  const deleteItem = (id: string) => {
    const filtered = items.filter((it) => it.id !== id);
    const reindexed = filtered.map((item, idx) => ({
      ...item,
      orderIndex: idx,
    }));
    setItems(reindexed);
  };

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;

    const newScheduleItem: ScheduleItemType = {
      id: `sch-${Date.now()}`,
      eventId,
      title: newItemTitle,
      speaker: newItemSpeaker.trim() || undefined,
      location: newItemLocation.trim() || undefined,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      orderIndex: items.length,
      category: 'workshop',
      isDraggable: true,
    };

    setItems([...items, newScheduleItem]);
    setNewItemTitle('');
    setNewItemSpeaker('');
    setNewItemLocation('');
    setShowAddModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Schedule Editor</Text>
          <Text style={styles.subtitle}>Drag or reorder sessions with ▲ ▼ controls</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(!showAddModal)}
          accessibilityRole="button"
          accessibilityLabel="Add Session"
        >
          <Text style={styles.addButtonText}>+ Add Session</Text>
        </TouchableOpacity>
      </View>

      {showAddModal && (
        <View style={styles.addCard}>
          <Text style={styles.addCardTitle}>New Session Item</Text>
          <TextInput
            style={styles.input}
            placeholder="Session Title (Required)"
            placeholderTextColor={theme.colors.textMuted}
            value={newItemTitle}
            onChangeText={setNewItemTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Speaker / Host Name"
            placeholderTextColor={theme.colors.textMuted}
            value={newItemSpeaker}
            onChangeText={setNewItemSpeaker}
          />
          <TextInput
            style={styles.input}
            placeholder="Room / Location"
            placeholderTextColor={theme.colors.textMuted}
            value={newItemLocation}
            onChangeText={setNewItemLocation}
          />
          <View style={styles.addActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmAddBtn}
              onPress={handleAddItem}
            >
              <Text style={styles.confirmAddBtnText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollArea}>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>No schedule items yet. Tap "+ Add Session" above.</Text>
        ) : (
          items.map((item, idx) => (
            <ScheduleItem
              key={item.id}
              item={item}
              isEditing={true}
              canMoveUp={idx > 0}
              canMoveDown={idx < items.length - 1}
              onMoveUp={() => moveItem(idx, 'up')}
              onMoveDown={() => moveItem(idx, 'down')}
              onDelete={() => deleteItem(item.id)}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.footerActions}>
        {onCancel && (
          <TouchableOpacity style={styles.footerCancelBtn} onPress={onCancel}>
            <Text style={styles.footerCancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => onSaveSchedule(items)}
          accessibilityRole="button"
          accessibilityLabel="Save Schedule Changes"
        >
          <Text style={styles.saveBtnText}>Save Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

ScheduleEditor.displayName = 'ScheduleEditor';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  addButton: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
  },
  addCard: {
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  addCardTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  cancelBtn: {
    padding: theme.spacing.sm,
  },
  cancelBtnText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
  },
  confirmAddBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  confirmAddBtnText: {
    color: theme.colors.textLight,
    fontWeight: 'bold',
    fontSize: theme.typography.fontSize.sm,
  },
  scrollArea: {
    flex: 1,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginVertical: theme.spacing.xl,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerCancelBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
  },
  footerCancelText: {
    color: theme.colors.textSecondary,
    fontWeight: 'semibold',
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  saveBtnText: {
    color: theme.colors.textLight,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
