import React from 'react';
import { Stack } from 'expo-router';

export default function ContactsLayout() {
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
          headerTitle: 'Contact Details',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          headerTitle: 'Add Contact',
          headerShown: true,
          headerBackTitle: 'Cancel',
        }}
      />
    </Stack>
  );
}