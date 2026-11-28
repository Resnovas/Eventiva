import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { RegisterForm } from '../components/RegisterForm.js';

interface RegisterScreenProps {
  onRegisterSuccess?: () => void;
  onNavigateLogin?: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onNavigateLogin,
}) => {
  return (
    <SafeAreaView style={styles.safeArea} testID="register-screen">
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <RegisterForm
            onSuccess={onRegisterSuccess}
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
