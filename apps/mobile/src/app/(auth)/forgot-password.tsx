import React from 'react';
import { ForgotPasswordScreen } from '../../screens/ForgotPasswordScreen.js';
import { useRouter } from 'expo-router';

export default function ForgotPasswordRoute() {
  const router = useRouter();

  return (
    <ForgotPasswordScreen
      onNavigateLogin={() => {
        router.push('/(auth)/login');
      }}
    />
  );
}
