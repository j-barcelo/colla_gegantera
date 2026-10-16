import type { ApiErrorResponse } from '../types/http';

const TOKEN_KEY = 'colla_auth_token';
const API_URL_KEY = 'colla_api_url';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Retorna la URL base configurada per a l'API.
 * Si l'app està vinculada via QR / LocalStorage, utilitza aquesta URL.
 * Si no, utilitza la variable d'entorn VITE_API_URL o la ruta relativa /api.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem(API_URL_KEY);
    if (savedUrl) return savedUrl.replace(/\/+$/, '');
  }

  if (import.meta?.env?.VITE_API_URL) {
    return String(import.meta.env.VITE_API_URL).replace(/\/+$/, '');
  }

  return '';
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Wrapper de Fetch API amb injecció de token Sanctum i gestió d'errors JSON.
 */
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${base}${cleanEndpoint}`;

  const token = getStoredToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorData: ApiErrorResponse | null = null;
    try {
      errorData = (await response.json()) as ApiErrorResponse;
    } catch {
      // Ignorar si no és JSON
    }

    const message = errorData?.message || `Error en la petició (HTTP ${response.status})`;
    throw new ApiError(message, response.status, errorData?.errors);
  }

  // Si és 204 No Content
  if (response.status === 204) return {} as T;

  return (await response.json()) as T;
}
