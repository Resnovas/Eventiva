import React from 'react';
import { ProfileScreen } from '../../screens/ProfileScreen.js';
import { useAuth } from '../../session/use-auth.js';
import { useRouter } from 'expo-router';

export default function ProfileRoute() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ProfileScreen
      onLogout={handleLogout}
    />
  );
}
