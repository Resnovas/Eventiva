import { describe, it, expect, beforeEach } from 'vitest';
import { SecureStorage } from '../secure-storage.js';
import { TokenManager } from '../token-manager.js';
import { AuthTokens } from '../types.js';

describe('SecureStorage', () => {
  beforeEach(async () => {
    await SecureStorage.clearTokens();
  });

  it('saves and retrieves tokens', async () => {
    const tokens: AuthTokens = {
      accessToken: 'test_access_token',
      refreshToken: 'test_refresh_token',
      expiresAt: 1700000000,
      tokenType: 'Bearer',
    };

    await SecureStorage.saveTokens(tokens);
    const retrieved = await SecureStorage.getTokens();

    expect(retrieved).not.toBeNull();
    expect(retrieved?.accessToken).toBe('test_access_token');
    expect(retrieved?.refreshToken).toBe('test_refresh_token');
    expect(retrieved?.expiresAt).toBe(1700000000);
  });

  it('clears tokens properly', async () => {
    const tokens: AuthTokens = {
      accessToken: 'access_to_clear',
      refreshToken: 'refresh_to_clear',
      expiresAt: 1700000000,
    };

    await SecureStorage.saveTokens(tokens);
    await SecureStorage.clearTokens();

    const retrieved = await SecureStorage.getTokens();
    expect(retrieved).toBeNull();
  });
});

describe('TokenManager', () => {
  const fakeHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
  const now = Math.floor(Date.now() / 1000);

  it('decodes valid JWT tokens', () => {
    const payloadObj = {
      sub: 'usr_12345',
      email: 'alex@eventiva.co.uk',
      name: 'Alex Vance',
      role: 'organizer',
      exp: now + 3600,
      iat: now,
    };
    const encodedPayload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
    const token = `${fakeHeader}.${encodedPayload}.sig`;

    const decoded = TokenManager.decodeJWT(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.sub).toBe('usr_12345');
    expect(decoded?.email).toBe('alex@eventiva.co.uk');
    expect(decoded?.role).toBe('organizer');

    const user = TokenManager.getUserFromToken(token);
    expect(user?.fullName).toBe('Alex Vance');
  });

  it('detects unexpired and expired tokens', () => {
    const validPayload = Buffer.from(
      JSON.stringify({ sub: '1', exp: now + 3600 })
    ).toString('base64url');
    const validToken = `${fakeHeader}.${validPayload}.sig`;
    expect(TokenManager.isTokenExpired(validToken)).toBe(false);

    const expiredPayload = Buffer.from(
      JSON.stringify({ sub: '1', exp: now - 10 })
    ).toString('base64url');
    const expiredToken = `${fakeHeader}.${expiredPayload}.sig`;
    expect(TokenManager.isTokenExpired(expiredToken)).toBe(true);
  });

  it('performs transparent session refresh', async () => {
    const initialTokens: AuthTokens = {
      accessToken: `${fakeHeader}.${Buffer.from(JSON.stringify({ sub: 'usr_test', exp: now + 3600 })).toString('base64url')}.sig`,
      refreshToken: 'valid_refresh_token',
      expiresAt: now + 3600,
    };

    await SecureStorage.saveTokens(initialTokens);
    const refreshed = await TokenManager.refreshSession();

    expect(refreshed).not.toBeNull();
    expect(refreshed?.refreshToken).toBe('valid_refresh_token');
    expect(refreshed?.accessToken).toBeDefined();
  });
});
