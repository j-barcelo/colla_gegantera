import { computed, ref } from 'vue';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  UpdatePasswordData,
  UpdateProfileData,
  User,
} from '../types/auth';
import { apiFetch, getStoredToken, removeStoredToken, setStoredToken } from '../utils/api';

const currentUser = ref<User | null>(null);
const currentToken = ref<string | null>(getStoredToken());
const isLoading = ref<boolean>(false);
const authError = ref<string | null>(null);

function setSession(response: AuthResponse): void {
  currentUser.value = response.user;
  currentToken.value = response.token;
  setStoredToken(response.token);
}

function clearSession(): void {
  currentUser.value = null;
  currentToken.value = null;
  removeStoredToken();
}

async function withAuthLoading<T>(fallbackMessage: string, action: () => Promise<T>): Promise<T> {
  isLoading.value = true;
  authError.value = null;

  try {
    return await action();
  } catch (err: unknown) {
    authError.value = err instanceof Error ? err.message : fallbackMessage;
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return withAuthLoading('Ha ocorregut un error durant la identificació.', async () => {
    const response = await apiFetch<AuthResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    setSession(response);
    return response;
  });
}

async function register(data: RegisterData): Promise<AuthResponse> {
  return withAuthLoading('Ha ocorregut un error durant el registre.', async () => {
    const response = await apiFetch<AuthResponse>('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    setSession(response);
    return response;
  });
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
    clearSession();
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
    clearSession();
    return null;
  } finally {
    isLoading.value = false;
  }
}

async function updateProfile(data: UpdateProfileData): Promise<User> {
  return withAuthLoading("Ha ocorregut un error durant l'actualització del perfil.", async () => {
    const response = await apiFetch<{ user: User }>('/api/user', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    currentUser.value = response.user;
    return response.user;
  });
}

async function updatePassword(data: UpdatePasswordData): Promise<{ message: string }> {
  return withAuthLoading('Ha ocorregut un error durant el canvi de contrasenya.', async () => {
    return apiFetch<{ message: string }>('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  });
}

async function updateAvatar(file: File): Promise<User> {
  return withAuthLoading("Ha ocorregut un error durant l'actualització de la imatge de perfil.", async () => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiFetch<{ user: User }>('/api/user/avatar', { method: 'POST', body: formData });

    currentUser.value = response.user;
    return response.user;
  });
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
    updateProfile,
    updatePassword,
    updateAvatar,
  };
}
