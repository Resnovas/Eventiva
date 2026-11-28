import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { ProfileView } from '../components/ProfileView.js';

interface ProfileScreenProps {
  onLogout?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  return (
    <SafeAreaView style={styles.safeArea} testID="profile-screen">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <ProfileView onLogout={onLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
});
