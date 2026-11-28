import { AuthTokens, JWTPayload, User } from './types.js';
import { SecureStorage } from './secure-storage.js';

export class TokenManager {
  private static timeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private static onTimeoutCallback: (() => void) | null = null;

  /**
   * Decode base64 JWT payload safely across Node, browser, and React Native environments
   */
  public static decodeJWT(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      let base64Url = parts[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4 !== 0) {
        base64 += '=';
      }
      
      let jsonPayload = '';
      if (typeof Buffer !== 'undefined') {
        jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
      } else if (typeof atob === 'function') {
        jsonPayload = atob(base64);
      } else {
        return null;
      }
      
      return JSON.parse(jsonPayload) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Derive User object from decoded JWT payload
   */
  public static getUserFromToken(token: string): User | null {
    const payload = this.decodeJWT(token);
    if (!payload) return null;

    const email = payload.email || 'user@eventiva.co.uk';
    return {
      id: payload.sub,
      email,
      fullName: payload.name || email.split('@')[0] || 'User',
      role: payload.role || 'attendee',
    };
  }

  /**
   * Check if token is expired or will expire within buffer seconds (default 60s)
   */
  public static isTokenExpired(token: string, bufferSeconds = 60): boolean {
    const payload = this.decodeJWT(token);
    if (!payload || !payload.exp) return true;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp - bufferSeconds <= nowInSeconds;
  }

  /**
   * Perform transparent token refresh with refresh handler API
   */
  public static async refreshSession(
    refreshApiCall?: (refreshToken: string) => Promise<AuthTokens>
  ): Promise<AuthTokens | null> {
    const currentTokens = await SecureStorage.getTokens();
    if (!currentTokens || !currentTokens.refreshToken) {
      await SecureStorage.clearTokens();
      return null;
    }

    const refreshPayload = this.decodeJWT(currentTokens.refreshToken);
    if (refreshPayload && this.isTokenExpired(currentTokens.refreshToken, 0)) {
      // Refresh token itself expired -> session timed out
      await SecureStorage.clearTokens();
      if (this.onTimeoutCallback) {
        this.onTimeoutCallback();
      }
      return null;
    }

    try {
      let newTokens: AuthTokens;
      if (refreshApiCall) {
        newTokens = await refreshApiCall(currentTokens.refreshToken);
      } else {
        // Fallback / mock token refresh for offline / client-first execution
        const newExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour validity
        const fakeHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
        const user = this.getUserFromToken(currentTokens.accessToken);
        const payloadObj = {
          sub: user?.id || 'usr_default',
          email: user?.email || 'user@eventiva.co.uk',
          name: user?.fullName || 'Eventiva User',
          role: user?.role || 'attendee',
          exp: newExp,
          iat: Math.floor(Date.now() / 1000),
        };
        const encodedPayload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
        const fakeSignature = 'refresh_sig_validated';
        const refreshedAccessToken = `${fakeHeader}.${encodedPayload}.${fakeSignature}`;

        newTokens = {
          accessToken: refreshedAccessToken,
          refreshToken: currentTokens.refreshToken,
          expiresAt: newExp,
          tokenType: 'Bearer',
        };
      }

      await SecureStorage.saveTokens(newTokens);
      this.scheduleSessionTimeout(newTokens);
      return newTokens;
    } catch {
      await SecureStorage.clearTokens();
      if (this.onTimeoutCallback) {
        this.onTimeoutCallback();
      }
      return null;
    }
  }

  /**
   * Schedule session timeout timer based on token expiration
   */
  public static scheduleSessionTimeout(tokens: AuthTokens, onTimeout?: () => void): void {
    if (onTimeout) {
      this.onTimeoutCallback = onTimeout;
    }
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }

    const payload = this.decodeJWT(tokens.accessToken);
    if (!payload || !payload.exp) return;

    const nowSeconds = Math.floor(Date.now() / 1000);
    const msUntilExpiry = Math.max(0, (payload.exp - nowSeconds) * 1000);

    this.timeoutTimer = setTimeout(() => {
      if (this.onTimeoutCallback) {
        this.onTimeoutCallback();
      }
    }, msUntilExpiry);
  }

  /**
   * Clear active timeout timer
   */
  public static clearSessionTimeout(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    this.onTimeoutCallback = null;
  }
}
