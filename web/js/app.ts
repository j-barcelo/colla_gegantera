// web/js/app.ts
import type { Example } from '@shared/types/example';

import faviconSvg from '@shared/assets/icons/favicon.svg';
import gegantsImg from '@shared/assets/images/gegants.webp';

import { fetchApiMessage } from '@shared/utils/api';

console.log('Web pública carregada correctament.');

const testData: Example = {
  id: 1,
  name: 'Gegants de Prova',
};

// Inserir actius compartits a la pàgina
const logoEl = document.getElementById('colla-logo') as HTMLImageElement | null;
if (logoEl && !logoEl.src) {
  logoEl.src = gegantsImg;
}

// Inserir favicon dinàmicament
const linkFavicon = document.createElement('link');
linkFavicon.rel = 'icon';
linkFavicon.type = 'image/svg+xml';
linkFavicon.href = faviconSvg;
document.head.appendChild(linkFavicon);

// Carregar missatge de l'API de prova
const statusEl = document.getElementById('api-status');
const timestampEl = document.getElementById('api-timestamp');

fetchApiMessage()
  .then((data) => {
    if (statusEl) {
      statusEl.textContent = data.message;
    }
    if (timestampEl) {
      timestampEl.textContent = `Timestamp: ${data.timestamp}`;
    }
  })
  .catch((err) => {
    if (statusEl) {
      statusEl.textContent = "No s'ha pogut connectar amb l'API";
    }
    console.error(err);
  });
