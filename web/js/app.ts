// web/js/app.ts
import faviconSvg from '@shared/assets/icons/favicon.svg';
import gegantsImg from '@shared/assets/images/gegants.webp';
import { apiFetch } from '@shared/utils/api';

console.log('Web pública carregada correctament.');

// Inserir actius compartits a la pàgina
const logoEl = document.getElementById('colla-logo') as HTMLImageElement | null;
if (logoEl && !logoEl.src) logoEl.src = gegantsImg;

// Inserir favicon dinàmicament
const linkFavicon = document.createElement('link');
linkFavicon.rel = 'icon';
linkFavicon.type = 'image/svg+xml';
linkFavicon.href = faviconSvg;
document.head.appendChild(linkFavicon);

// Carregar missatge de l'API de prova
const statusEl = document.getElementById('api-status');
const timestampEl = document.getElementById('api-timestamp');

interface MessageResponse {
  message: string;
  timestamp: string;
}

if (statusEl) {
  try {
    const data = await apiFetch<MessageResponse>('/api/message');
    statusEl.textContent = data.message;
    if (timestampEl) {
      timestampEl.textContent = `Timestamp: ${data.timestamp}`;
    }
  } catch (err: unknown) {
    statusEl.textContent = "No s'ha pogut connectar amb l'API";
    console.error(err);
  }
}
