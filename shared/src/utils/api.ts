import type { ApiErrorResponse } from '../types/http';

const TOKEN_KEY = 'colla_auth_token';
const API_URL_KEY = 'colla_api_url';

export interface StorageSyncAdapter {
  onTokenChange?: (token: string | null) => void | Promise<void>;
  onApiUrlChange?: (url: string | null) => void | Promise<void>;
}

let syncAdapter: StorageSyncAdapter | null = null;

export function registerStorageSyncAdapter(adapter: StorageSyncAdapter): void {
  syncAdapter = adapter;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
  void syncAdapter?.onTokenChange?.(token);
}

export function removeStoredToken(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
  void syncAdapter?.onTokenChange?.(null);
}

export function setStoredApiBaseUrl(url: string | null): void {
  if (typeof window !== 'undefined') {
    if (url) {
      localStorage.setItem(API_URL_KEY, url);
    } else {
      localStorage.removeItem(API_URL_KEY);
    }
  }
  void syncAdapter?.onApiUrlChange?.(url);
}

function trimTrailingSlash(url: string): string {
  let end = url.length;
  while (end > 0 && url.codePointAt(end - 1) === 47) {
    end--;
  }
  return url.slice(0, end);
}

/**
 * Retorna la URL base configurada per a l'API.
 * Si l'app està vinculada via QR / LocalStorage, utilitza aquesta URL.
 * Si no, utilitza la variable d'entorn VITE_API_URL o la ruta relativa /api.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem(API_URL_KEY);
    if (savedUrl) return trimTrailingSlash(savedUrl);
  }

  if (import.meta?.env?.VITE_API_URL) return trimTrailingSlash(String(import.meta.env.VITE_API_URL));

  return '';
}

export function resolveStorageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/.test(path)) return path;

  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
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
    ...(options.headers as Record<string, string>),
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
