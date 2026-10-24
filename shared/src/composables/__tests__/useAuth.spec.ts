import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../../types/auth';
import * as apiModule from '../../utils/api';
import { useAuth } from '../useAuth';

vi.mock('../../utils/api', async () => {
  const actual = await vi.importActual<typeof import('../../utils/api')>('../../utils/api');
  return {
    ...actual,
    apiFetch: vi.fn(),
    getStoredToken: vi.fn(() => 'mock-token'),
    setStoredToken: vi.fn(),
    removeStoredToken: vi.fn(),
  };
});

describe('useAuth composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates user profile via PUT /api/user and updates currentUser state', async () => {
    const updatedUser: User = {
      id: 1,
      name: 'Miquel',
      surname: 'Pons Gomila',
      username: 'mponsgomila',
      email: 'miquelpons@gegantsinca.com',
      phone: '668 30 58 60',
      address: 'Jaume I nº33, Inca, Illes Balears',
    };

    vi.mocked(apiModule.apiFetch).mockResolvedValueOnce({ user: updatedUser });

    const { updateProfile, user, isLoading, error } = useAuth();

    const result = await updateProfile({
      name: updatedUser.name,
      surname: updatedUser.surname || '',
      username: updatedUser.username,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
    });

    expect(apiModule.apiFetch).toHaveBeenCalledWith('/api/user', {
      method: 'PUT',
      body: JSON.stringify({
        name: updatedUser.name,
        surname: updatedUser.surname,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
      }),
    });
    expect(result).toEqual(updatedUser);
    expect(user.value).toEqual(updatedUser);
    expect(isLoading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it('sets authError and rethrows when updateProfile fails', async () => {
    const apiErr = new Error('El correu ja està en ús.');
    vi.mocked(apiModule.apiFetch).mockRejectedValueOnce(apiErr);

    const { updateProfile, error, isLoading } = useAuth();

    await expect(
      updateProfile({
        name: 'Miquel',
        surname: 'Pons',
        email: 'duplicat@gegantsinca.com',
      }),
    ).rejects.toThrow('El correu ja està en ús.');

    expect(error.value).toBe('El correu ja està en ús.');
    expect(isLoading.value).toBe(false);
  });

  it('updates password via PUT /api/user/password', async () => {
    vi.mocked(apiModule.apiFetch).mockResolvedValueOnce({
      message: 'Contrasenya actualitzada correctament.',
    });

    const { updatePassword, isLoading, error } = useAuth();

    const result = await updatePassword({
      current_password: 'old-password-123',
      password: 'new-password-456',
      password_confirmation: 'new-password-456',
    });

    expect(apiModule.apiFetch).toHaveBeenCalledWith('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: 'old-password-123',
        password: 'new-password-456',
        password_confirmation: 'new-password-456',
      }),
    });
    expect(result).toEqual({ message: 'Contrasenya actualitzada correctament.' });
    expect(isLoading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it('sets authError and rethrows when updatePassword fails', async () => {
    const apiErr = new Error('La contrasenya actual no és correcta.');
    vi.mocked(apiModule.apiFetch).mockRejectedValueOnce(apiErr);

    const { updatePassword, error, isLoading } = useAuth();

    await expect(
      updatePassword({
        current_password: 'wrong',
        password: 'new-password-456',
        password_confirmation: 'new-password-456',
      }),
    ).rejects.toThrow('La contrasenya actual no és correcta.');

    expect(error.value).toBe('La contrasenya actual no és correcta.');
    expect(isLoading.value).toBe(false);
  });

  it('uploads avatar via POST /api/user/avatar with FormData and updates user state', async () => {
    const updatedUser: User = {
      id: 1,
      name: 'Miquel',
      surname: 'Pons Gomila',
      email: 'miquelpons@gegantsinca.com',
      avatar: '/storage/avatars/new-avatar.png',
    };

    vi.mocked(apiModule.apiFetch).mockResolvedValueOnce({ user: updatedUser });

    const { updateAvatar, user, isLoading, error } = useAuth();
    const file = new File(['image-content'], 'avatar.png', { type: 'image/png' });

    const result = await updateAvatar(file);

    expect(apiModule.apiFetch).toHaveBeenCalledTimes(1);
    const [endpoint, options] = vi.mocked(apiModule.apiFetch).mock.calls[0];
    expect(endpoint).toBe('/api/user/avatar');
    expect(options?.method).toBe('POST');
    expect(options?.body).toBeInstanceOf(FormData);
    expect((options?.body as FormData).get('avatar')).toBe(file);
    expect(result).toEqual(updatedUser);
    expect(user.value?.avatar).toBe('/storage/avatars/new-avatar.png');
    expect(isLoading.value).toBe(false);
    expect(error.value).toBeNull();
  });
});
