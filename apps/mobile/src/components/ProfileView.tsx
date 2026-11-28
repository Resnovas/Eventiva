import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../session/use-auth.js';

interface ProfileViewProps {
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onLogout }) => {
  const { user, tokens, logout, refreshSession, isLoading, error } = useAuth();

  const handleLogout = async () => {
    await logout();
    if (onLogout) {
      onLogout();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <View style={styles.emptyContainer} testID="profile-unauthenticated">
        <Text style={styles.emptyText}>No active user session.</Text>
      </View>
    );
  }

  const initials = getInitials(user.fullName || user.email);
  const formattedExpiry = tokens?.expiresAt
    ? new Date(tokens.expiresAt * 1000).toLocaleString()
    : 'Unknown';

  return (
    <View style={styles.container} testID="profile-view">
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user.role.toUpperCase()}</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer} testID="profile-error">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Details</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>User ID</Text>
          <Text style={styles.rowValue}>{user.id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Token Type</Text>
          <Text style={styles.rowValue}>{tokens?.tokenType || 'Bearer'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Expires At</Text>
          <Text style={styles.rowValue}>{formattedExpiry}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => refreshSession()}
        disabled={isLoading}
        accessibilityLabel="Refresh Session Token"
        testID="profile-refresh-button"
      >
        {isLoading ? (
          <ActivityIndicator color="#4f46e5" />
        ) : (
          <Text style={styles.refreshButtonText}>Refresh Session Token</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={isLoading}
        accessibilityLabel="Sign Out Button"
        testID="profile-logout-button"
      >
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#3730a3',
    fontSize: 12,
    fontWeight: '700',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  refreshButton: {
    borderWidth: 1,
    borderColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
