import React from 'react';
import { RegisterScreen } from '../../screens/RegisterScreen.js';
import { useAuth } from '../../session/use-auth.js';
import { useRouter } from 'expo-router';

export default function RegisterRoute() {
  const { register } = useAuth();
  const router = useRouter();

  return (
    <RegisterScreen
      onRegisterSuccess={() => {
        router.replace('/(main)/dashboard');
      }}
      onNavigateLogin={() => {
        router.push('/(auth)/login');
      }}
    />
  );
}