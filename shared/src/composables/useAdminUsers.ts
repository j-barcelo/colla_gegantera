import { computed, ref } from 'vue';
import type { User, UserRole } from '../types/auth';
import { apiFetch } from '../utils/api';

const adminUsers = ref<User[]>([]);
const isLoadingUsers = ref<boolean>(false);
const usersError = ref<string | null>(null);

async function fetchAdminUsers(): Promise<User[]> {
  isLoadingUsers.value = true;
  usersError.value = null;

  try {
    const response = await apiFetch<{ data: User[] }>('/api/admin/users');
    adminUsers.value = response.data;
    return response.data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al carregar els usuaris.';
    usersError.value = message;
    throw err;
  } finally {
    isLoadingUsers.value = false;
  }
}

async function addAllowedEmail(email: string): Promise<User> {
  isLoadingUsers.value = true;
  usersError.value = null;

  try {
    const response = await apiFetch<{ message: string; data: User }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    adminUsers.value = [...adminUsers.value, response.data];
    return response.data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error a l'afegir el correu.";
    usersError.value = message;
    throw err;
  } finally {
    isLoadingUsers.value = false;
  }
}

async function updateUser(userId: number | string, data: Partial<User>): Promise<User> {
  isLoadingUsers.value = true;
  usersError.value = null;

  try {
    const response = await apiFetch<{ message: string; data: User }>(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    adminUsers.value = adminUsers.value.map((u) => (u.id === userId ? { ...u, ...response.data } : u));
    return response.data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error a l'actualitzar l'usuari.";
    usersError.value = message;
    throw err;
  } finally {
    isLoadingUsers.value = false;
  }
}

async function updateUserRole(userId: number | string, role: UserRole): Promise<User> {
  return updateUser(userId, { role });
}

async function removeUserOrInvitation(userId: number | string): Promise<void> {
  isLoadingUsers.value = true;
  usersError.value = null;

  try {
    await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });

    adminUsers.value = adminUsers.value.filter((u) => u.id !== userId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error a l'eliminar.";
    usersError.value = message;
    throw err;
  } finally {
    isLoadingUsers.value = false;
  }
}

export function useAdminUsers() {
  return {
    users: computed(() => adminUsers.value),
    totalUsers: computed(() => adminUsers.value.length),
    isLoading: computed(() => isLoadingUsers.value),
    error: computed(() => usersError.value),
    fetchUsers: fetchAdminUsers,
    addAllowedEmail,
    updateUser,
    updateUserRole,
    removeUserOrInvitation,
  };
}
