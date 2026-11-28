export const theme = {
  colors: {
    primary: '#6366F1', // Indigo
    primaryLight: '#EEF2FF',
    primaryDark: '#4F46E5',
    secondary: '#0EA5E9', // Sky Blue
    accent: '#F59E0B', // Amber
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    background: '#F9FAFB',
    cardBackground: '#FFFFFF',
    surface: '#F3F4F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textLight: '#FFFFFF',
    border: '#E5E7EB',
    borderDark: '#D1D5DB',
    statusDraft: '#9CA3AF',
    statusScheduled: '#3B82F6',
    statusLive: '#10B981',
    statusCompleted: '#6B7280',
    statusCancelled: '#EF4444',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      headline: 30,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
};
