import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme/tokens.js';
import { useAuth } from '../../session/use-auth.js';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.greeting}>
              <Text style={styles.greetingText}>Welcome back,</Text>
              <Text style={styles.nameText}>{user?.name || 'User'}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <MaterialCommunityIcons name="logout" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(main)/events/new')}
            >
              <MaterialCommunityIcons name="calendar-plus" size={32} color={theme.colors.primary} />
              <Text style={styles.actionCardText}>Create Event</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(main)/contacts/new')}
            >
              <MaterialCommunityIcons name="account-plus" size={32} color={theme.colors.primary} />
              <Text style={styles.actionCardText}>Add Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(main)/scheduling')}
            >
              <MaterialCommunityIcons name="calendar-clock" size={32} color={theme.colors.primary} />
              <Text style={styles.actionCardText}>View Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(main)/tickets')}
            >
              <MaterialCommunityIcons name="ticket" size={32} color={theme.colors.primary} />
              <Text style={styles.actionCardText}>Manage Tickets</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <View style={styles.comingSoon}>
            <MaterialCommunityIcons name="calendar-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.comingSoonText}>No upcoming events yet</Text>
            <Text style={styles.comingSoonSubtext}>Create your first event to get started</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation</Text>
          <View style={styles.navGrid}>
            <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(main)/events')}>
              <MaterialCommunityIcons name="calendar" size={28} color={theme.colors.primary} />
              <Text style={styles.navCardText}>Events</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(main)/venues')}>
              <MaterialCommunityIcons name="map-marker" size={28} color={theme.colors.primary} />
              <Text style={styles.navCardText}>Venues</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(main)/vendors')}>
              <MaterialCommunityIcons name="store" size={28} color={theme.colors.primary} />
              <Text style={styles.navCardText}>Vendors</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(main)/contacts')}>
              <MaterialCommunityIcons name="contacts" size={28} color={theme.colors.primary} />
              <Text style={styles.navCardText}>Contacts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(main)/tickets')}>
              <MaterialCommunityIcons name="ticket" size={28} color={theme.colors.primary} />
              <Text style={styles.navCardText}>Tickets</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(main)/settings')}>
              <MaterialCommunityIcons name="cog" size={28} color={theme.colors.primary} />
              <Text style={styles.navCardText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  nameText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  logoutButton: {
    padding: theme.spacing.sm,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  actionCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionCardText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  comingSoon: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  comingSoonText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  comingSoonSubtext: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  navCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  navCardText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
});