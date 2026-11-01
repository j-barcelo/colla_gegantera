import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../../types/auth';
import * as apiModule from '../../utils/api';
import { useAdminUsers } from '../useAdminUsers';

vi.mock('../../utils/api', async () => {
  const actual = await vi.importActual<typeof import('../../utils/api')>('../../utils/api');
  return { ...actual, apiFetch: vi.fn() };
});

describe('useAdminUsers composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches users via GET /api/admin/users and updates state', async () => {
    const mockUsers: User[] = [
      { id: 1, name: 'Miquel', surname: 'Pons Gomila', email: 'miquel@example.com', role: 'admin' },
      { id: 2, name: 'Maria', surname: 'Genovard Martínez', email: 'maria@example.com', role: 'member' },
    ];

    vi.mocked(apiModule.apiFetch).mockResolvedValueOnce({ data: mockUsers });

    const { fetchUsers, users, totalUsers, isLoading, error } = useAdminUsers();

    const result = await fetchUsers();

    expect(apiModule.apiFetch).toHaveBeenCalledWith('/api/admin/users');
    expect(result).toEqual(mockUsers);
    expect(users.value).toEqual(mockUsers);
    expect(totalUsers.value).toBe(2);
    expect(isLoading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it('handles fetch errors properly', async () => {
    const apiError = new Error('No autoritzat');
    vi.mocked(apiModule.apiFetch).mockRejectedValueOnce(apiError);

    const { fetchUsers, error, isLoading } = useAdminUsers();

    await expect(fetchUsers()).rejects.toThrow('No autoritzat');
    expect(error.value).toBe('No autoritzat');
    expect(isLoading.value).toBe(false);
  });

  it('allows adding a new email for registration', async () => {
    const newPendingUser: User = {
      id: 'pending_1',
      name: 'nou@example.com',
      email: 'nou@example.com',
      role: 'member',
      is_pending: true,
    };

    vi.mocked(apiModule.apiFetch).mockResolvedValueOnce({
      message: 'Correu autoritzat correctament.',
      data: newPendingUser,
    });

    const { addAllowedEmail, users } = useAdminUsers();

    const result = await addAllowedEmail('nou@example.com');

    expect(apiModule.apiFetch).toHaveBeenCalledWith('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email: 'nou@example.com' }),
    });
    expect(result).toEqual(newPendingUser);
    expect(users.value).toContainEqual(newPendingUser);
  });

  it('updates a user role via PUT /api/admin/users/:id', async () => {
    const updatedUser: User = {
      id: 1,
      name: 'Miquel',
      email: 'miquel@example.com',
      role: 'admin',
    };

    vi.mocked(apiModule.apiFetch).mockResolvedValueOnce({
      message: 'Usuari actualitzat correctament.',
      data: updatedUser,
    });

    const { updateUserRole } = useAdminUsers();
    const result = await updateUserRole(1, 'admin');

    expect(apiModule.apiFetch).toHaveBeenCalledWith('/api/admin/users/1', {
      method: 'PUT',
      body: JSON.stringify({ role: 'admin' }),
    });
    expect(result).toEqual(updatedUser);
  });

  it('updates user personal details via PUT /api/admin/users/:id', async () => {
    const updatedUser: User = {
      id: 1,
      name: 'Miquel Nou',
      surname: 'Pons Nou',
      email: 'nou@example.com',
      phone: '600111222',
      address: 'Carrer Nou 2',
      role: 'admin',
    };

    vi.mocked(apiModule.apiFetch).mockResolvedValueOnce({
      message: 'Usuari actualitzat correctament.',
      data: updatedUser,
    });

    const { updateUser } = useAdminUsers();
    const result = await updateUser(1, {
      name: 'Miquel Nou',
      surname: 'Pons Nou',
      email: 'nou@example.com',
      phone: '600111222',
      address: 'Carrer Nou 2',
      role: 'admin',
    });

    expect(apiModule.apiFetch).toHaveBeenCalledWith('/api/admin/users/1', {
      method: 'PUT',
      body: JSON.stringify({
        name: 'Miquel Nou',
        surname: 'Pons Nou',
        email: 'nou@example.com',
        phone: '600111222',
        address: 'Carrer Nou 2',
        role: 'admin',
      }),
    });
    expect(result).toEqual(updatedUser);
  });

  it('removes a user or invitation via DELETE /api/admin/users/:id', async () => {
    vi.mocked(apiModule.apiFetch).mockResolvedValueOnce({ message: 'Invitació eliminada correctament.' });

    const { removeUserOrInvitation } = useAdminUsers();
    await removeUserOrInvitation('pending_1');

    expect(apiModule.apiFetch).toHaveBeenCalledWith('/api/admin/users/pending_1', {
      method: 'DELETE',
    });
  });
});
