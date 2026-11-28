import React from 'react';
import { Stack } from 'expo-router';

export default function VendorsLayout() {
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
          headerTitle: 'Vendor Details',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          headerTitle: 'Add Vendor',
          headerShown: true,
          headerBackTitle: 'Cancel',
        }}
      />
    </Stack>
  );
}