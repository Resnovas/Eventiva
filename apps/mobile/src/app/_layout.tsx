import React, { useEffect, useState } from 'react';
import { Stack, Redirect } from 'expo-router';
import { AuthProvider, useAuth } from '../session/use-auth.js';
import { OfflineSyncProvider } from '../session/offline-sync-context.js';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '../theme/tokens.js';

function RootLayoutContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <OfflineSyncProvider>
        <RootLayoutContent />
      </OfflineSyncProvider>
    </AuthProvider>
  );
}
