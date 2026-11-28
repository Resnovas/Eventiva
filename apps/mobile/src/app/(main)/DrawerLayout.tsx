import React from 'react';
import { Drawer } from 'expo-router';
import TabsLayout from './TabsLayout.js';

/**
 * Drawer navigation that wraps the tab layout.
 * Settings screen is a separate drawer entry.
 */
export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerStyle: { backgroundColor: '#fff' },
        overlayColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <Drawer.Screen
        name="tabs"
        options={{ title: 'Home' }}
        component={TabsLayout}
      />
      <Drawer.Screen
        name="settings"
        options={{ title: 'Settings' }}
      />
    </Drawer>
  );
}
