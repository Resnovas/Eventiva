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

interface RegisterFormProps {
  onSuccess?: () => void;
  onNavigateLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onNavigateLogin,
}) => {
  const { register, isLoading, error: authError, clearError } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'organizer' | 'staff' | 'attendee'>('organizer');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setFormError(null);
    clearError();

    if (!fullName.trim()) {
      setFormError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      // Error handled by AuthContext
    }
  };

  const displayError = formError || authError;

  return (
    <View style={styles.container} testID="register-form">
      <Text style={styles.title}>Create Eventiva Account</Text>
      <Text style={styles.subtitle}>Join Eventiva to organize and manage event logistics</Text>

      {displayError ? (
        <View style={styles.errorContainer} testID="register-error">
          <Text style={styles.errorText}>{displayError}</Text>
        </View>
      ) : null}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Jane Doe"
          placeholderTextColor="#9ca3af"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            if (formError) setFormError(null);
          }}
          accessibilityLabel="Full Name Input"
          testID="register-name-input"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="jane@eventiva.co.uk"
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
          testID="register-email-input"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (formError) setFormError(null);
          }}
          secureTextEntry
          accessibilityLabel="Password Input"
          testID="register-password-input"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (formError) setFormError(null);
          }}
          secureTextEntry
          accessibilityLabel="Confirm Password Input"
          testID="register-confirm-password-input"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Role</Text>
        <View style={styles.roleContainer}>
          {(['organizer', 'staff', 'attendee'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleChip, role === r && styles.roleChipSelected]}
              onPress={() => setRole(r)}
              accessibilityLabel={`Select role ${r}`}
              testID={`register-role-${r}`}
            >
              <Text style={[styles.roleText, role === r && styles.roleTextSelected]}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
        accessibilityLabel="Register Button"
        testID="register-submit-button"
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" testID="register-loading-indicator" />
        ) : (
          <Text style={styles.submitButtonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity
          onPress={onNavigateLogin}
          accessibilityLabel="Sign In Link"
          testID="register-login-link"
        >
          <Text style={styles.footerLink}>Sign in</Text>
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
    marginBottom: 20,
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
  inputGroup: {
    marginBottom: 14,
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
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  roleChipSelected: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  roleTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerLink: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '600',
  },
});
