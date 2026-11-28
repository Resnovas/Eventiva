import React from 'react';
import { Stack } from 'expo-router';

export default function VenuesLayout() {
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
          headerTitle: 'Venue Details',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          headerTitle: 'Add Venue',
          headerShown: true,
          headerBackTitle: 'Cancel',
        }}
      />
    </Stack>
  );
}