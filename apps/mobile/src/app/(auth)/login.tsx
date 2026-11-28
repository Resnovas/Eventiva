import React from 'react';
import { LoginScreen } from '../../screens/LoginScreen.js';
import { useAuth } from '../../session/use-auth.js';
import { useRouter } from 'expo-router';

export default function LoginRoute() {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <LoginScreen
      onLoginSuccess={() => {
        router.replace('/(main)/dashboard');
      }}
      onNavigateRegister={() => {
        router.push('/(auth)/register');
      }}
      onNavigateForgotPassword={() => {
        router.push('/(auth)/forgot-password');
      }}
    />
  );
}
