import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LoginForm } from '../components/LoginForm.js';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
  onNavigateRegister?: () => void;
  onNavigateForgotPassword?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateRegister,
  onNavigateForgotPassword,
}) => {
  return (
    <SafeAreaView style={styles.safeArea} testID="login-screen">
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <LoginForm
            onSuccess={onLoginSuccess}
            onNavigateRegister={onNavigateRegister}
            onNavigateForgotPassword={onNavigateForgotPassword}
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
