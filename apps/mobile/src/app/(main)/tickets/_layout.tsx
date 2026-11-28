import React from 'react';
import { Stack } from 'expo-router';

export default function TicketsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: 'Ticket Details',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
