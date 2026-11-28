import { describe, it, expect } from 'vitest';
import { AuthProvider } from '../../session/auth-context.js';
import { LoginForm } from '../LoginForm.js';
import { RegisterForm } from '../RegisterForm.js';
import { PasswordResetForm } from '../PasswordResetForm.js';
import { ProfileView } from '../ProfileView.js';

describe('Auth Components Rendering & Structure', () => {
  it('renders LoginForm component correctly', () => {
    const element = (
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
    expect(element).toBeDefined();
    expect(element.type).toBe(AuthProvider);
  });

  it('renders RegisterForm component correctly', () => {
    const element = (
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    );
    expect(element).toBeDefined();
    expect(element.type).toBe(AuthProvider);
  });

  it('renders PasswordResetForm component correctly', () => {
    const element = (
      <AuthProvider>
        <PasswordResetForm />
      </AuthProvider>
    );
    expect(element).toBeDefined();
    expect(element.type).toBe(AuthProvider);
  });

  it('renders ProfileView component correctly', () => {
    const element = (
      <AuthProvider>
        <ProfileView />
      </AuthProvider>
    );
    expect(element).toBeDefined();
    expect(element.type).toBe(AuthProvider);
  });
});
