import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { PasswordResetForm } from '../components/PasswordResetForm.js';

interface ForgotPasswordScreenProps {
  onResetSuccess?: () => void;
  onNavigateLogin?: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onResetSuccess,
  onNavigateLogin,
}) => {
  return (
    <SafeAreaView style={styles.safeArea} testID="forgot-password-screen">
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <PasswordResetForm
            onSuccess={onResetSuccess}
            onNavigateLogin={onNavigateLogin}
          />
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
