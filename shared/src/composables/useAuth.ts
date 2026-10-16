import { computed, ref } from 'vue';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '../types/auth';
import { apiFetch, getStoredToken, removeStoredToken, setStoredToken } from '../utils/api';

const currentUser = ref<User | null>(null);
const currentToken = ref<string | null>(getStoredToken());
const isLoading = ref<boolean>(false);
const authError = ref<string | null>(null);

async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  isLoading.value = true;
  authError.value = null;

  try {
    const response = await apiFetch<AuthResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    currentUser.value = response.user;
    currentToken.value = response.token;
    setStoredToken(response.token);

    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      authError.value = err.message;
    } else {
      authError.value = 'Ha ocorregut un error durant la identificació.';
    }
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function register(data: RegisterData): Promise<AuthResponse> {
  isLoading.value = true;
  authError.value = null;

  try {
    const response = await apiFetch<AuthResponse>('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    currentUser.value = response.user;
    currentToken.value = response.token;
    setStoredToken(response.token);

    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      authError.value = err.message;
    } else {
      authError.value = 'Ha ocorregut un error durant el registre.';
    }
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function logout(): Promise<void> {
  isLoading.value = true;
  try {
    if (currentToken.value) {
      await apiFetch('/api/logout', { method: 'POST' }).catch(() => {
        // Si el token ja no és vàlid al backend, ignorem i netegem localment
      });
    }
  } finally {
    currentUser.value = null;
    currentToken.value = null;
    removeStoredToken();
    isLoading.value = false;
  }
}

async function fetchUser(): Promise<User | null> {
  if (!currentToken.value) {
    currentUser.value = null;
    return null;
  }

  isLoading.value = true;
  try {
    const response = await apiFetch<{ user: User }>('/api/user');
    currentUser.value = response.user;
    return response.user;
  } catch {
    // Token caducat o invàlid
    currentUser.value = null;
    currentToken.value = null;
    removeStoredToken();
    return null;
  } finally {
    isLoading.value = false;
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => !!currentToken.value && !!currentUser.value);

  return {
    user: computed(() => currentUser.value),
    token: computed(() => currentToken.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    error: computed(() => authError.value),
    login,
    register,
    logout,
    fetchUser,
  };
}
