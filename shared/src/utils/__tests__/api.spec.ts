import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  apiFetch,
  getApiBaseUrl,
  getStoredToken,
  registerStorageSyncAdapter,
  removeStoredToken,
  resolveStorageUrl,
  setStoredApiBaseUrl,
  setStoredToken,
} from '../api';

describe('api.ts utils', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('token management', () => {
    it('stores, retrieves and removes token from localStorage', () => {
      expect(getStoredToken()).toBeNull();

      setStoredToken('test-token-123');
      expect(getStoredToken()).toBe('test-token-123');

      removeStoredToken();
      expect(getStoredToken()).toBeNull();
    });

    it('notifies syncAdapter on token change', () => {
      const onTokenChange = vi.fn();
      registerStorageSyncAdapter({ onTokenChange });

      setStoredToken('new-token');
      expect(onTokenChange).toHaveBeenCalledWith('new-token');

      removeStoredToken();
      expect(onTokenChange).toHaveBeenCalledWith(null);
    });
  });

  describe('api url management', () => {
    it('sets and trims trailing slashes from api url', () => {
      setStoredApiBaseUrl('https://colla.cat/api///');
      expect(getApiBaseUrl()).toBe('https://colla.cat/api');

      setStoredApiBaseUrl(null);
      expect(getApiBaseUrl()).toBe('');
    });

    it('resolves storage url correctly', () => {
      expect(resolveStorageUrl(null)).toBeNull();
      expect(resolveStorageUrl('https://extern.cat/img.jpg')).toBe('https://extern.cat/img.jpg');

      setStoredApiBaseUrl('https://colla.cat');
      expect(resolveStorageUrl('/uploads/photo.jpg')).toBe('https://colla.cat/uploads/photo.jpg');
      expect(resolveStorageUrl('uploads/photo.jpg')).toBe('https://colla.cat/uploads/photo.jpg');
    });
  });

  describe('apiFetch', () => {
    it('injects Bearer token and Accept header', async () => {
      setStoredToken('token-abc');
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const result = await apiFetch('/test-endpoint');

      expect(fetchMock).toHaveBeenCalledWith(
        '/test-endpoint',
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/json',
            Authorization: 'Bearer token-abc',
          }),
        }),
      );
      expect(result).toEqual({ success: true });
    });

    it('handles 204 No Content without parsing body', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
      });
      vi.stubGlobal('fetch', fetchMock);

      const result = await apiFetch('/empty-endpoint');
      expect(result).toEqual({});
    });

    it('throws ApiError with message and validation errors on failure', async () => {
      const errorPayload = {
        message: 'Dades invàlides',
        errors: { email: ['El correu ja existeix'] },
      };
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => errorPayload,
      });
      vi.stubGlobal('fetch', fetchMock);

      await expect(apiFetch('/fail-endpoint')).rejects.toThrow(ApiError);
      await expect(apiFetch('/fail-endpoint')).rejects.toMatchObject({
        status: 422,
        message: 'Dades invàlides',
        errors: { email: ['El correu ja existeix'] },
      });
    });
  });
});
