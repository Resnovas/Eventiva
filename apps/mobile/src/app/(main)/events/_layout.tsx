import React from 'react';
import { Stack } from 'expo-router';

export default function EventsLayout() {
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
          headerTitle: 'Event Details',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          headerTitle: 'Create Event',
          headerShown: true,
          headerBackTitle: 'Cancel',
        }}
      />
    </Stack>
  );
}
