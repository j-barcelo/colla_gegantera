import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import router from '../index';

const getStoredTokenMock = vi.fn();
vi.mock('@shared/utils/api', () => ({
  getStoredToken: () => getStoredTokenMock(),
}));

const userMock = ref<{ id: number; role?: string } | null>(null);
const fetchUserMock = vi.fn().mockResolvedValue({});

vi.mock('@shared/composables/useAuth', () => ({
  useAuth: () => ({
    user: userMock,
    fetchUser: fetchUserMock,
  }),
}));

describe('Router navigation guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userMock.value = null;
  });

  it('redirects to Login when unauthenticated user accesses a protected route', async () => {
    getStoredTokenMock.mockReturnValue(null);

    await router.push('/tabs/home');
    expect(router.currentRoute.value.name).toBe('Login');
  });

  it('redirects to /tabs/home when authenticated user accesses a guest-only route', async () => {
    getStoredTokenMock.mockReturnValue('valid-token');
    userMock.value = { id: 1, role: 'member' };

    await router.push('/tabs/home');
    await router.push('/login');
    expect(router.currentRoute.value.path).toBe('/tabs/home');
  });

  it('fetches user details if authenticated and user is null in memory', async () => {
    getStoredTokenMock.mockReturnValue('valid-token');
    userMock.value = null;

    await router.push('/tabs/profile');
    expect(fetchUserMock).toHaveBeenCalled();
  });

  it('blocks access to admin route if user is not admin', async () => {
    getStoredTokenMock.mockReturnValue('valid-token');
    userMock.value = { id: 1, role: 'member' };

    await router.push('/admin/users');
    expect(router.currentRoute.value.path).toBe('/tabs/home');
  });

  it('allows access to admin route if user is admin', async () => {
    getStoredTokenMock.mockReturnValue('valid-token');
    userMock.value = { id: 1, role: 'admin' };

    await router.push('/admin/users');
    expect(router.currentRoute.value.name).toBe('AdminUsers');
  });
});
