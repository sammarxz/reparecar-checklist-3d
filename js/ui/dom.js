// Referências de DOM e utilidades de interface compartilhadas.
import { DEBUG } from '../config.js';

export const $ = id => document.getElementById(id);

export const refs = {
  panel: $('panel'),
  drawer: $('drawer'),
  sheet: $('sheet'),
  loading: $('loading'),
  debug: $('debug'),
};

export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const pad2 = n => String(n).padStart(2, '0');

const toastEl = $('toast');
let toastTimer;
export function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
}

refs.debug.hidden = !DEBUG;
export function debugLine(text) {
  if (DEBUG) refs.debug.textContent = `${text} · ${innerWidth}px`;
}

export const ICONS = {
  upload: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
};

// Caixa de upload no formato do produto. O envio fica fora do protótipo.
export const UPLOAD_BOX = `<button class="upload-box" type="button">${ICONS.upload}<span>Enviar arquivo</span></button><p class="upload-hint">JPG, PNG - até 10MB ou MP4, MOV - até 50MB</p>`;
export function bindUploadStubs(root) {
  root.querySelectorAll('.upload-box').forEach(u => u.addEventListener('click', () => toast('Envio de fotos e vídeos fica fora deste protótipo.')));
}
