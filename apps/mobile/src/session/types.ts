export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'organizer' | 'staff' | 'attendee' | 'guest';
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in seconds
  tokenType?: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  name?: string;
  role?: 'admin' | 'organizer' | 'staff' | 'attendee' | 'guest';
  exp: number;
  iat?: number;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role?: 'organizer' | 'staff' | 'attendee';
}

export interface PasswordResetData {
  email: string;
}

export interface AuthSessionState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
