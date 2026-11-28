import { describe, it, expect, beforeEach } from 'vitest';
import { SecureStorage } from '../secure-storage.js';
import { TokenManager } from '../token-manager.js';

describe('Auth Session Integration', () => {
  beforeEach(async () => {
    await SecureStorage.clearTokens();
  });

  it('completes login flow and stores session tokens', async () => {
    const email = 'organizer@eventiva.co.uk';
    // const password = 'SecurePassword123'; // Removed unused variable

    // Simulate login API token creation
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + 3600;
    const fakeHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    const payload = Buffer.from(
      JSON.stringify({ sub: 'usr_organizer_1', email, name: 'Lead Organizer', role: 'organizer', exp: expiresAt })
    ).toString('base64url');
    
    const accessToken = `${fakeHeader}.${payload}.sig`;
    const refreshToken = 'ref_organizer_1';

    await SecureStorage.saveTokens({
      accessToken,
      refreshToken,
      expiresAt,
      tokenType: 'Bearer',
    });

    const saved = await SecureStorage.getTokens();
    expect(saved).not.toBeNull();
    expect(saved?.accessToken).toBe(accessToken);

    const user = TokenManager.getUserFromToken(saved!.accessToken);
    expect(user?.id).toBe('usr_organizer_1');
    expect(user?.email).toBe(email);
    expect(user?.fullName).toBe('Lead Organizer');
  });

  it('handles transparent token refresh upon access token expiration', async () => {
    const now = Math.floor(Date.now() / 1000);
    const fakeHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    
    // Expired access token
    const expiredPayload = Buffer.from(
      JSON.stringify({ sub: 'usr_renew', email: 'renew@eventiva.co.uk', exp: now - 100 })
    ).toString('base64url');
    const expiredAccessToken = `${fakeHeader}.${expiredPayload}.sig`;

    await SecureStorage.saveTokens({
      accessToken: expiredAccessToken,
      refreshToken: 'valid_refresh_token_renew',
      expiresAt: now - 100,
    });

    expect(TokenManager.isTokenExpired(expiredAccessToken)).toBe(true);

    const refreshed = await TokenManager.refreshSession();
    expect(refreshed).not.toBeNull();
    expect(refreshed?.accessToken).not.toBe(expiredAccessToken);
    expect(TokenManager.isTokenExpired(refreshed!.accessToken)).toBe(false);
  });
});
