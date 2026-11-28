import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Event, ScheduleItem as ScheduleItemType } from '../types/event';
import { ScheduleTimeline } from './ScheduleTimeline';
import { ScheduleEditor } from './ScheduleEditor';
import { ContactCard } from './ContactCard';
import { theme } from '../theme/tokens';
import { calendarService } from '../services/calendarIntegration';

interface EventDetailProps {
  event: Event;
  onBack?: () => void;
  onEditPress?: (event: Event) => void;
  onSaveSchedule?: (eventId: string, newSchedule: ScheduleItemType[]) => void;
}

export const EventDetail: React.FC<EventDetailProps> = React.memo(({
  event,
  onBack,
  onEditPress,
  onSaveSchedule,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'contacts'>('overview');
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const formattedDate = new Date(event.startDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = `${new Date(event.startDate).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })} - ${new Date(event.endDate).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  const handleExportToCalendar = async () => {
    setSyncStatus('Adding event to native device calendar...');
    const res = await calendarService.exportEventToNativeCalendar(event);
    if (res.success) {
      setSyncStatus(`Added to calendar (${res.nativeEventId})`);
    } else {
      setSyncStatus(`Error: ${res.error}`);
    }
  };

  const handleSaveScheduleEditor = (newSchedule: ScheduleItemType[]) => {
    if (onSaveSchedule) {
      onSaveSchedule(event.id, newSchedule);
    }
    setIsEditingSchedule(false);
  };

  return (
    <View style={styles.container}>
      {/* Back & Actions Header */}
      <View style={styles.topNav}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>◀ Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.calendarExportBtn}
            onPress={handleExportToCalendar}
            accessibilityRole="button"
            accessibilityLabel="Export event to native calendar"
          >
            <Text style={styles.calendarExportText}>📅 Sync Calendar</Text>
          </TouchableOpacity>
          {onEditPress && (
            <TouchableOpacity style={styles.editBtn} onPress={() => onEditPress(event)}>
              <Text style={styles.editBtnText}>Edit Event</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {syncStatus && (
        <View style={styles.syncBanner}>
          <Text style={styles.syncBannerText}>{syncStatus}</Text>
        </View>
      )}

      {/* Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.categoryRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{event.category}</Text>
          </View>
          <Text style={styles.statusText}>{event.status.toUpperCase()}</Text>
        </View>

        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.metaLine}>📅 {formattedDate}</Text>
        <Text style={styles.metaLine}>⏰ {formattedTime}</Text>
        <Text style={styles.metaLine}>📍 {event.location}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => {
            setActiveTab('overview');
            setIsEditingSchedule(false);
          }}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
          onPress={() => setActiveTab('schedule')}
        >
          <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
            Schedule ({event.schedule?.length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
          onPress={() => {
            setActiveTab('contacts');
            setIsEditingSchedule(false);
          }}
        >
          <Text style={[styles.tabText, activeTab === 'contacts' && styles.activeTabText]}>
            Contacts ({event.contacts?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Body */}
      {activeTab === 'overview' && (
        <ScrollView style={styles.tabContent}>
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>About Event</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Attendance Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{event.capacity}</Text>
                <Text style={styles.statLabel}>Total Capacity</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{event.registeredCount}</Text>
                <Text style={styles.statLabel}>Registered</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{event.capacity - event.registeredCount}</Text>
                <Text style={styles.statLabel}>Seats Remaining</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {activeTab === 'schedule' && (
        <View style={styles.tabContentFlex}>
          {isEditingSchedule ? (
            <ScheduleEditor
              eventId={event.id}
              initialSchedule={event.schedule || []}
              onSaveSchedule={handleSaveScheduleEditor}
              onCancel={() => setIsEditingSchedule(false)}
            />
          ) : (
            <View style={styles.scheduleTabContainer}>
              <View style={styles.scheduleHeaderRow}>
                <Text style={styles.scheduleSubtitle}>Timeline & Session Agenda</Text>
                <TouchableOpacity
                  style={styles.editScheduleBtn}
                  onPress={() => setIsEditingSchedule(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Edit schedule with drag and drop"
                >
                  <Text style={styles.editScheduleBtnText}>✏️ Drag/Edit Schedule</Text>
                </TouchableOpacity>
              </View>
              <ScheduleTimeline schedule={event.schedule || []} />
            </View>
          )}
        </View>
      )}

      {activeTab === 'contacts' && (
        <ScrollView style={styles.tabContent}>
          {!event.contacts || event.contacts.length === 0 ? (
            <View style={styles.emptyContacts}>
              <Text style={styles.emptyText}>No linked contacts for this event.</Text>
            </View>
          ) : (
            event.contacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
});

EventDetail.displayName = 'EventDetail';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    paddingVertical: theme.spacing.xs,
  },
  backBtnText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  topActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  calendarExportBtn: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  calendarExportText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
  },
  editBtn: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  editBtnText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.xs,
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
  },
  heroCard: {
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  badge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginVertical: theme.spacing.xs,
  },
  metaLine: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.cardBackground,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  tabContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  tabContentFlex: {
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  descriptionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  scheduleTabContainer: {
    flex: 1,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  scheduleSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  editScheduleBtn: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  editScheduleBtnText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: 'bold',
  },
  emptyContacts: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSize.sm,
  },
});
