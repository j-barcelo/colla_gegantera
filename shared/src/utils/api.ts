import type { ApiMessageResponse } from '../types/api';

/**
 * Retorna la URL base configurada per a l'API.
 * Si l'app està vinculada via QR / LocalStorage, utilitza aquesta URL.
 * Altrament, utilitza la variable d'entorn VITE_API_URL o la ruta relativa /api.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('colla_api_url');
    if (savedUrl) {
      return savedUrl.replace(/\/+$/, '');
    }
  }

  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return String(import.meta.env.VITE_API_URL).replace(/\/+$/, '');
  }

  return '';
}

/**
 * Fa una petició a l'endpoint de prova /api/message
 */
export async function fetchApiMessage(): Promise<ApiMessageResponse> {
  const base = getApiBaseUrl();
  const url = `${base}/api/message`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error en connectar amb el backend (HTTP ${response.status})`);
  }

  return (await response.json()) as ApiMessageResponse;
}
