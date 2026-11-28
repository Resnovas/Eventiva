import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../session/use-auth.js';

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onNavigateLogin?: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onSuccess,
  onNavigateLogin,
}) => {
  const { resetPassword, isLoading, error: authError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setFormError(null);
    setSuccessMessage(null);
    clearError();

    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      const res = await resetPassword({ email: email.trim() });
      setSuccessMessage(res.message);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      // Error handled by AuthContext
    }
  };

  const displayError = formError || authError;

  return (
    <View style={styles.container} testID="password-reset-form">
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your account email to receive a password reset link
      </Text>

      {displayError ? (
        <View style={styles.errorContainer} testID="reset-error">
          <Text style={styles.errorText}>{displayError}</Text>
        </View>
      ) : null}

      {successMessage ? (
        <View style={styles.successContainer} testID="reset-success">
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="name@company.com"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (formError) setFormError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Email Address Input"
          testID="reset-email-input"
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
        accessibilityLabel="Send Reset Link Button"
        testID="reset-submit-button"
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" testID="reset-loading-indicator" />
        ) : (
          <Text style={styles.submitButtonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={onNavigateLogin}
          accessibilityLabel="Back to Sign In Link"
          testID="reset-login-link"
        >
          <Text style={styles.footerLink}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#818cf8',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerLink: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '600',
  },
});
