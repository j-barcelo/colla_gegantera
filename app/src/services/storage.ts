import { Preferences } from '@capacitor/preferences';
import { registerStorageSyncAdapter, setStoredApiBaseUrl, setStoredToken, syncAuthToken } from '@shared';

const TOKEN_KEY = 'colla_auth_token';
const API_URL_KEY = 'colla_api_url';

export async function initAppStorage(): Promise<void> {
  try {
    const [{ value: token }, { value: apiUrl }] = await Promise.all([
      Preferences.get({ key: TOKEN_KEY }),
      Preferences.get({ key: API_URL_KEY }),
    ]);

    if (token) {
      setStoredToken(token);
      syncAuthToken(token);
    }

    if (apiUrl) {
      setStoredApiBaseUrl(apiUrl);
    }
  } catch {
    // Fallback silenciós si Preferences no està disponible
  }

  registerStorageSyncAdapter({
    onTokenChange: async (token: string | null): Promise<void> => {
      try {
        if (token) {
          await Preferences.set({ key: TOKEN_KEY, value: token });
        } else {
          await Preferences.remove({ key: TOKEN_KEY });
        }
      } catch {
        // Fallback silenciós
      }
    },
    onApiUrlChange: async (url: string | null): Promise<void> => {
      try {
        if (url) {
          await Preferences.set({ key: API_URL_KEY, value: url });
        } else {
          await Preferences.remove({ key: API_URL_KEY });
        }
      } catch {
        // Fallback silenciós
      }
    },
  });
}
