import { AuthTokens } from './types.js';

const ACCESS_TOKEN_KEY = 'eventiva_access_token';
const REFRESH_TOKEN_KEY = 'eventiva_refresh_token';
const EXPIRES_AT_KEY = 'eventiva_token_expires_at';

// In-memory fallback for unit tests and web environments
const inMemoryStore = new Map<string, string>();

let isSecureStoreAvailable = false;
let SecureStoreModule: typeof import('expo-secure-store') | null = null;

try {
  // Dynamically attempt to require expo-secure-store if available in environment
  SecureStoreModule = require('expo-secure-store');
  isSecureStoreAvailable = true;
} catch {
  isSecureStoreAvailable = false;
}

export class SecureStorage {
  private static mockStore = inMemoryStore;

  public static async saveTokens(tokens: AuthTokens): Promise<void> {
    const { accessToken, refreshToken, expiresAt } = tokens;
    if (isSecureStoreAvailable && SecureStoreModule) {
      await SecureStoreModule.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStoreModule.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      await SecureStoreModule.setItemAsync(EXPIRES_AT_KEY, String(expiresAt));
    } else {
      this.mockStore.set(ACCESS_TOKEN_KEY, accessToken);
      this.mockStore.set(REFRESH_TOKEN_KEY, refreshToken);
      this.mockStore.set(EXPIRES_AT_KEY, String(expiresAt));
    }
  }

  public static async getTokens(): Promise<AuthTokens | null> {
    let accessToken: string | null = null;
    let refreshToken: string | null = null;
    let expiresAtStr: string | null = null;

    if (isSecureStoreAvailable && SecureStoreModule) {
      accessToken = await SecureStoreModule.getItemAsync(ACCESS_TOKEN_KEY);
      refreshToken = await SecureStoreModule.getItemAsync(REFRESH_TOKEN_KEY);
      expiresAtStr = await SecureStoreModule.getItemAsync(EXPIRES_AT_KEY);
    } else {
      accessToken = this.mockStore.get(ACCESS_TOKEN_KEY) ?? null;
      refreshToken = this.mockStore.get(REFRESH_TOKEN_KEY) ?? null;
      expiresAtStr = this.mockStore.get(EXPIRES_AT_KEY) ?? null;
    }

    if (!accessToken || !refreshToken) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: expiresAtStr ? Number(expiresAtStr) : 0,
      tokenType: 'Bearer',
    };
  }

  public static async getAccessToken(): Promise<string | null> {
    if (isSecureStoreAvailable && SecureStoreModule) {
      return await SecureStoreModule.getItemAsync(ACCESS_TOKEN_KEY);
    }
    return this.mockStore.get(ACCESS_TOKEN_KEY) ?? null;
  }

  public static async getRefreshToken(): Promise<string | null> {
    if (isSecureStoreAvailable && SecureStoreModule) {
      return await SecureStoreModule.getItemAsync(REFRESH_TOKEN_KEY);
    }
    return this.mockStore.get(REFRESH_TOKEN_KEY) ?? null;
  }

  public static async clearTokens(): Promise<void> {
    if (isSecureStoreAvailable && SecureStoreModule) {
      await SecureStoreModule.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStoreModule.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStoreModule.deleteItemAsync(EXPIRES_AT_KEY);
    }
    this.mockStore.clear();
  }
}
