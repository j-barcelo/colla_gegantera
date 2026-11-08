import { Preferences } from '@capacitor/preferences';
import { getApiBaseUrl, getStoredToken, setStoredApiBaseUrl, setStoredToken } from '@shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initAppStorage } from '../storage';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('storage.ts service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('initializes app storage from preferences when stored values exist', async () => {
    vi.mocked(Preferences.get).mockImplementation(async ({ key }) => {
      if (key === 'colla_auth_token') return { value: 'saved-token' };
      if (key === 'colla_api_url') return { value: 'https://saved-api.cat' };
      return { value: null };
    });

    await initAppStorage();

    expect(getStoredToken()).toBe('saved-token');
    expect(getApiBaseUrl()).toBe('https://saved-api.cat');
  });

  it('syncs token changes back to preferences', async () => {
    await initAppStorage();

    setStoredToken('new-token-123');
    expect(Preferences.set).toHaveBeenCalledWith({
      key: 'colla_auth_token',
      value: 'new-token-123',
    });

    setStoredToken('');
  });

  it('syncs api url changes to preferences', async () => {
    await initAppStorage();

    setStoredApiBaseUrl('https://colla.cat/api');
    expect(Preferences.set).toHaveBeenCalledWith({
      key: 'colla_api_url',
      value: 'https://colla.cat/api',
    });

    setStoredApiBaseUrl(null);
    expect(Preferences.remove).toHaveBeenCalledWith({
      key: 'colla_api_url',
    });
  });
});
