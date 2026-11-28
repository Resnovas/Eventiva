import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../session/auth-context.js';
// import { useRouter, useLocalSearchParams } from 'expo-router';
import LoginScreen from '../screens/LoginScreen.tsx';
import RegisterScreen from '../screens/RegisterScreen.tsx';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen.tsx';
import DashboardScreen from '../app/(main)/dashboard.tsx';

// Mock expo-router
vi.mock('expo-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  useLocalSearchParams: vi.fn(() => ({ id: 'test-id' })),
  useGlobalSearchParams: vi.fn(() => ({})),
}));

// Mock useAuth
vi.mock('../session/use-auth.js', () => ({
  useAuth: vi.fn(() => ({
    user: { name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    resetPassword: vi.fn(),
  })),
  AuthProvider: ({ children }) => <>{children}</>,
}));

describe('Navigation Structure', () => {
  it('renders login screen with navigation props', () => {
    const router = useRouter();
    const onLoginSuccess = vi.fn();
    const onNavigateRegister = vi.fn();
    const onNavigateForgotPassword = vi.fn();

    render(
      <AuthProvider>
        <LoginScreen
          onLoginSuccess={onLoginSuccess}
          onNavigateRegister={onNavigateRegister}
          onNavigateForgotPassword={onNavigateForgotPassword}
        />
      </AuthProvider>
    );

    expect(screen.getByTestId('login-screen')).toBeDefined();
  });

  it('renders register screen with navigation props', () => {
    const onRegisterSuccess = vi.fn();
    const onNavigateLogin = vi.fn();

    render(
      <AuthProvider>
        <RegisterScreen
          onRegisterSuccess={onRegisterSuccess}
          onNavigateLogin={onNavigateLogin}
        />
      </AuthProvider>
    );

    expect(screen.getByTestId('register-screen')).toBeDefined();
  });

  it('renders forgot password screen with navigation props', () => {
    const onNavigateLogin = vi.fn();

    render(
      <AuthProvider>
        <ForgotPasswordScreen
          onNavigateLogin={onNavigateLogin}
        />
      </AuthProvider>
    );

    expect(screen.getByTestId('forgot-password-screen')).toBeDefined();
  });

  it('renders dashboard with navigation buttons', () => {
    render(
      <AuthProvider>
        <DashboardScreen />
      </AuthProvider>
    );

    expect(screen.getByText('Eventiva')).toBeDefined();
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Events')).toBeDefined();
  });
});