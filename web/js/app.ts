// web/js/app.ts
import faviconSvg from '@shared/assets/icons/favicon.svg';
import gegantsImg from '@shared/assets/images/gegants.webp';
import { apiFetch } from '@shared/utils/api';
import { createApp } from 'vue';
import InstallWizard from './components/InstallWizard/InstallWizard.vue';

// Inserir actius compartits a la pàgina
const logoEl = document.getElementById('colla-logo') as HTMLImageElement | null;
if (logoEl && !logoEl.src) logoEl.src = gegantsImg;

// Inserir favicon dinàmicament
const linkFavicon = document.createElement('link');
linkFavicon.rel = 'icon';
linkFavicon.type = 'image/svg+xml';
linkFavicon.href = faviconSvg;
document.head.appendChild(linkFavicon);

// Muntar l'assistent d'instal·lació inicial (/install) si és present al DOM
const installMountEl = document.getElementById('install-app');
if (installMountEl) {
  const action = installMountEl.dataset.action ?? '/install';
  const csrfToken = installMountEl.dataset.csrf ?? '';
  const initialOld = installMountEl.dataset.old
    ? (JSON.parse(installMountEl.dataset.old) as Record<string, string>)
    : {};
  const initialErrors = installMountEl.dataset.errors
    ? (JSON.parse(installMountEl.dataset.errors) as Record<string, string[]>)
    : {};

  createApp(InstallWizard, {
    action,
    csrfToken,
    initialOld,
    initialErrors,
  }).mount(installMountEl);
}

// Carregar missatge de l'API de prova a la pàgina d'inici
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
    if (timestampEl) timestampEl.textContent = `Timestamp: ${data.timestamp}`;
  } catch (err: unknown) {
    statusEl.textContent = "No s'ha pogut connectar amb l'API del backend.";

    console.error('Error carregant API:', err);
  }
}
