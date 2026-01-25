// Mirra AI — core (Firebase Realtime Database)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, update, remove, onValue, off } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// ==================== CONFIG ====================
const firebaseConfig = {
  apiKey: "AIzaSyAy7Ewc6b37Rv0rtea_XAN80-nBiMJt6uU",
  authDomain: "mirra-ai-tech.firebaseapp.com",
  databaseURL: "https://mirra-ai-tech-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mirra-ai-tech",
  storageBucket: "mirra-ai-tech.firebasestorage.app",
  messagingSenderId: "350639048251",
  appId: "1:350639048251:web:fc70b273040480607c3e1e",
  measurementId: "G-NYKPHXPXKC"
};

const MISTRAL_API_KEY = "UetH9ifY2y9xU7JL0bYLbuvXrxrVuYrN";

const MISTRAL_MAPPING = {
  'mistral-small-3.2': 'mistral-small-2506',
  'mistral-large-3': 'mistral-large-2512',
  'devstral-2': 'devstral-2512',
  'mistral-tiny': 'mistral-tiny',       // fallback
  'mistral-medium': 'mistral-medium',   // fallback
  'mistral-small': 'mistral-small-latest',
  'codestral-latest': 'codestral-latest',
  'devstral-latest': 'devstral-latest',
  'devstral-medium-latest': 'devstral-medium-latest',
  'devstral-small-latest': 'devstral-small-latest',
  'mistral-large-latest': 'mistral-large-latest',
  'pixtral-large-latest': 'pixtral-large-latest'
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const REMOTE_PATH = 'mirraData/v1';

// ==================== ICONS ====================
const ICONS = {
  mistral: `<svg viewBox="0 0 129 91" style="width:100%;height:100%"><rect x="18.292" y="0" width="18.293" height="18.123" fill="#ffd800"/><rect x="91.473" y="0" width="18.293" height="18.123" fill="#ffd800"/><rect x="18.292" y="18.121" width="36.586" height="18.123" fill="#ffaf00"/><rect x="73.181" y="18.121" width="36.586" height="18.123" fill="#ffaf00"/><rect x="18.292" y="36.243" width="91.476" height="18.122" fill="#ff8205"/><rect x="18.292" y="54.37" width="18.293" height="18.123" fill="#fa500f"/><rect x="54.883" y="54.37" width="18.293" height="18.123" fill="#fa500f"/><rect x="91.473" y="54.37" width="18.293" height="18.123" fill="#fa500f"/><rect x="0" y="72.504" width="54.89" height="18.123" fill="#e10500"/><rect x="73.181" y="72.504" width="54.89" height="18.123" fill="#e10500"/></svg>`,
  google: `<img alt="svgImg" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciICB2aWV3Qm94PSIwIDAgNDggNDgiIHdpZHRoPSI0ODBweCIgaGVpZ2h0PSI0ODBweCI+PHBhdGggZmlsbD0iI0ZGQzEwNyIgZD0iTTQzLjYxMSwyMC4wODNINDJWMjBIMjR2OGgxMS4zMDNjLTEuNjQ5LDQuNjU3LTYuMDgsOC0xMS4zMDMsOGMtNi42MjcsMC0xMi01LjM3My0xMi0xMmMwLTYuNjI3LDUuMzczLTEyLDEyLTEyYzMuMDU5LDAsNS44NDIsMS4xNTQsNy45NjEsMy4wMzlsNS42NTctNS42NTdDMzQuMDQ2LDYuMDUzLDI5LjI2OCw0LDI0LDRDMTIuOTU1LDQsNCwxMi45NTUsNCwyNGMwLDExLjA0NSw4Ljk1NSwyMCwyMCwyMGMxMS4wNDUsMCwyMC04Ljk1NSwyMC0yMEM0NCwyMi42NTksNDMuODYyLDIxLjM1LDQzLjYxMSwyMC4wODN6Ii8+PHBhdGggZmlsbD0iI0ZGM0QwMCIgZD0iTTYuMzA2LDE0LjY5MWw2LjU3MSw0LjgxOUMxNC42NTUsMTUuMTA4LDE4Ljk2MSwxMiwyNCwxMmMzLjA1OSwwLDUuODQyLDEuMTU0LDcuOTYxLDMuMDM5bDUuNjU3LTUuNjU3QzM0LjA0Niw2LjA1MywyOS4yNjgsNCwyNCw0QzE2LjMxOCw0LDkuNjU2LDguMzM3LDYuMzA2LDE0LjY5MXoiLz48cGF0aCBmaWxsPSIjNENBRjUwIiBkPSJNMjQsNDRjNS4xNjYsMCw5Ljg2LTEuOTc3LDEzLjQwOS01LjE5MmwtNi4xOS01LjIzOEMyOS4yMTEsMzUuMDkxLDI2LjcxNSwzNiwyNCwzNmMtNS4yMDIsMC05LjYxOS0zLjMxNy0xMS4yODMtNy45NDZsLTYuNTIyLDUuMDI1QzkuNTA1LDM5LjU1NiwxNi4yMjcsNDQsMjQsNDR6Ii8+PHBhdGggZmlsbD0iIzE5NzZEMiIgZD0iTTQzLjYxMSwyMC4wODNINDJWMjBIMjR2OGgxMS4zMDNjLTAuNzkyLDIuMjM3LTIuMjMxLDQuMTY2LTQuMDg3LDUuNTcxYzAuMDAxLTAuMDAxLDAuMDAyLTAuMDAxLDAuMDAzLTAuMDAybDYuMTksNS4yMzhDMzYuOTcxLDM5LjIwNSw0NCwzNCw0NCwyNEM0NCwyMi42NTksNDMuODYyLDIxLjM1LDQzLjYxMSwyMC4wODN6Ii8+PC9zdmc+" style="width:100%;height:100%;object-fit:contain;"/>`,
  xai: `<img width="48" height="48" src="https://img.icons8.com/color/48/grok--v1.png" alt="grok--v1" style="width:100%;height:100%;object-fit:contain;" />`,
  anthropic: `<img width="48" height="48" src="https://img.icons8.com/fluency/48/claude-ai.png" alt="claude-ai" style="width:100%;height:100%;object-fit:contain;" />`,
  deepseek: `<img width="48" height="48" src="https://img.icons8.com/color/48/deepseek.png" alt="deepseek" style="width:100%;height:100%;object-fit:contain;" />`,
  chatgpt: `<img width="48" height="48" src="https://img.icons8.com/fluency-systems-regular/48/FFFFFF/chatgpt.png" alt="chatgpt" style="width:100%;height:100%;object-fit:contain;" />`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`
};

const TOOL_ICONS = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>`,
  code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M8 9l-3 3 3 3"/><path d="M16 9l3 3-3 3"/><path d="M10 19l4-14"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
  thinking: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 2.96-3.08A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-2.96-3.08A2.5 2.5 0 0 0 14.5 2z"/></svg>`
};

// ==================== MODELS ====================
const MODELS = {
  'gemini-3-flash': { id: 'gemini-3-flash', name: 'Gemini 3 Flash', provider: 'Google AI Studio', icon: 'google', type: 'text', isPro: false },
  'mistral-small-3.2': { id: 'mistral-small-3.2', name: 'Mistral Small 3.2', provider: 'Mistral AI Studio', icon: 'mistral', type: 'text', isPro: false },
  'deepseek-v3.2': { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'DeepSeek API Cloud', icon: 'deepseek', type: 'text', isPro: false },
  'gpt-5.1-mini': { id: 'gpt-5.1-mini', name: 'GPT-5.1 Mini', provider: 'OpenAI API', icon: 'chatgpt', type: 'text', isPro: false },
  'claude-haiku-4.5': { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'Anthropic', icon: 'anthropic', type: 'text', isPro: false },
  'nano-banana': { id: 'nano-banana', name: 'Nano Banana', provider: 'Google AI Studio', icon: 'google', type: 'image', isPro: false },
  'grok-4.1-fast': { id: 'grok-4.1-fast', name: 'Grok 4.1 Fast', provider: 'xAI', icon: 'xai', type: 'text', isPro: false },
  'devstral-latest': { id: 'devstral-latest', name: 'Devstral', provider: 'Mistral AI Studio', icon: 'mistral', type: 'text', isPro: false },
  'devstral-medium-latest': { id: 'devstral-medium-latest', name: 'Devstral Medium', provider: 'Mistral AI Studio', icon: 'mistral', type: 'text', isPro: false },
  'devstral-small-latest': { id: 'devstral-small-latest', name: 'Devstral Small', provider: 'Mistral AI Studio', icon: 'mistral', type: 'text', isPro: false },

  'claude-opus-4.5': { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'Anthropic', icon: 'anthropic', type: 'text', isPro: true },
  'gemini-3-pro': { id: 'gemini-3-pro', name: 'Gemini 3 Pro', provider: 'Google AI Studio', icon: 'google', type: 'text', isPro: true },
  'grok-4.1-thinking': { id: 'grok-4.1-thinking', name: 'Grok 4.1 Thinking', provider: 'xAI', icon: 'xai', type: 'text', isPro: true },
  'mistral-large-3': { id: 'mistral-large-3', name: 'Mistral Large 3', provider: 'Mistral AI Studio', icon: 'mistral', type: 'text', isPro: true },
  'devstral-2': { id: 'devstral-2', name: 'Devstral 2', provider: 'Mistral AI Studio', icon: 'mistral', type: 'text', isPro: true },
  'gpt-5.2-pro': { id: 'gpt-5.2-pro', name: 'GPT-5.2 Pro', provider: 'OpenAI API', icon: 'chatgpt', type: 'text', isPro: true },
  'gpt-5.2-chat': { id: 'gpt-5.2-chat', name: 'GPT-5.2 Chat', provider: 'OpenAI API', icon: 'chatgpt', type: 'text', isPro: true },
  'gpt-5.1-codex': { id: 'gpt-5.1-codex', name: 'GPT-5.1 Codex', provider: 'OpenAI API', icon: 'chatgpt', type: 'text', isPro: true },
  'claude-sonnet-4.5': { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'Anthropic', icon: 'anthropic', type: 'text', isPro: true },
  'nano-banana-pro': { id: 'nano-banana-pro', name: 'Nano Banana Pro', provider: 'Google AI Studio', icon: 'google', type: 'image', isPro: true },
  'codestral-latest': { id: 'codestral-latest', name: 'Codestral', provider: 'Mistral AI Studio', icon: 'mistral', type: 'text', isPro: true },
  'mistral-large-latest': { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'Mistral AI Studio', icon: 'mistral', type: 'text', isPro: true },
  'pixtral-large-latest': { id: 'pixtral-large-latest', name: 'Pixtral Large', provider: 'Mistral AI Studio', icon: 'mistral', type: 'text', isPro: true }
};

// ==================== HELPERS ====================
window.deleteChatUser = async (e, chatId) => {
  e.stopPropagation();
  if (!await uiConfirm('Удалить этот чат безвозвратно?')) return;

  // Check ownership
  const chat = DB.getChats().find(c => c.id === chatId);
  const user = DB.getCurrentUser();
  if (!chat || !user || chat.userId !== user.id) {
    showToast('Ошибка доступа', 'error');
    return;
  }

  await DB.deleteChat(chatId);
  showToast('Чат удален', 'success');
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
window.$ = $;
window.$$ = $$;

const escapeHTML = (str) => String(str ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

function showToast(msg, type = 'info') {
  const t = $('#toast');
  if (!t) return;
  t.className = 'toast show ' + type;
  t.textContent = msg;
  setTimeout(() => t.classList.remove('show'), 3000);
}

function nowId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

function getSafeModel(id) {
  return MODELS[id] || MODELS['mistral-small-3.2'];
}

function formatBytes(bytes) {
  const b = Number(bytes || 0);
  if (!b) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let val = b;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function isImageFile(file) {
  const t = String(file?.type || '');
  const data = String(file?.data || '');
  return t.startsWith('image/') || data.startsWith('data:image');
}

function renderFileBlock(file) {
  if (!file) return '';
  const safeName = escapeHTML(file.name || 'file');
  const size = file.size ? formatBytes(file.size) : '';
  const href = file.data || '#';
  return `
    <div class="message-file">
      <a class="file-row" href="${href}" target="_blank" rel="noopener">
        <span class="file-ico">${ICONS.file}</span>
        <span class="file-info">
          <span class="file-name">${safeName}</span>
          <span class="file-size">${escapeHTML(size)}</span>
        </span>
      </a>
      <div class="file-actions">
        <a href="${href}" target="_blank" rel="noopener">Открыть</a>
        <a href="${href}" download="${safeName}">Скачать</a>
      </div>
    </div>
  `;
}

// Very safe minimal markdown (escape first)
function parseMarkdown(text) {
  const raw = String(text || '');
  let s = escapeHTML(raw);

  // code fences ```lang\ncode```
  s = s.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (m, lang, code) => {
    const l = escapeHTML(lang || '').trim();
    const c = code.replace(/\n$/, '');
    return `<div class="code-block"><button class="code-copy-btn" data-copy="${escapeHTML(c)}" title="Копировать">⧉</button><code>${escapeHTML(c)}</code></div>`;
  });

  // inline code
  s = s.replace(/`([^`]+)`/g, (m, c) => `<span class="inline-code" data-copy="${escapeHTML(c)}">${escapeHTML(c)}</span>`);

  // bold/italic/del
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/_([^_]+)_/g, '<em>$1</em>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // links
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a class="md-link" href="$2" target="_blank" rel="noopener">$1</a>');

  // headings (start of line only)
  s = s.split('<br>').map(line => {
    let l = line.trim();
    if (l.startsWith('### ')) return `<h3 class="md-h3">${l.slice(4)}</h3>`;
    if (l.startsWith('## ')) return `<h2 class="md-h2">${l.slice(3)}</h2>`;
    if (l.startsWith('# ')) return `<h1 class="md-h1">${l.slice(2)}</h1>`;
    return line;
  }).join('<br>');

  s = s.replace(/\n/g, '<br>');
  return s;
}

// Global Custom Modals (Alert/Prompt replacement)
// We inject a generic modal HTML if not present, but for now we assume we can create one on fly or specific ones.
// User said "modalnye okna vmesto alert".
// I'll add `window.uiAlert` and `window.uiPrompt`.
window.uiAlert = (msg) => {
  // reusing existing "toast" for simple alerts or create a blocking modal?
  // Alert usually blocks. But toast is nicer. "vmesto alert" usually implies they hate the native popup.
  // I will use `showToast` for alerts as it is non-intrusive.
  showToast(msg, 'info');
  // Or if they mean CRITICAL alerts, use a modal.
  // Let's stick to Toast for "Alert" and Custom Modal for "Prompt".
};

window.uiConfirm = async (msg) => {
  return new Promise(resolve => {
    // Native confirm for now (reliable)
    const ok = confirm(msg);
    resolve(ok);
  });
};

// ... Wait, user wants "folder rename" to be modal too? 
// I used `prompt` in `window.renameFolder` above. I should fix that eventually.


document.addEventListener('click', (e) => {
  const btn = e.target?.closest?.('.code-copy-btn, .inline-code');
  if (!btn) return;
  const txt = btn.getAttribute('data-copy') || '';
  if (!txt) return;
  navigator.clipboard?.writeText?.(txt).then(() => showToast('Скопировано', 'success')).catch(() => showToast('Не удалось скопировать', 'error'));
});

// ==================== ADMIN GATE ====================
const ADMIN = {
  KEY: 'mirra_admin_active',
  get: () => localStorage.getItem(ADMIN.KEY) === '1',
  set: (v) => v ? localStorage.setItem(ADMIN.KEY, '1') : localStorage.removeItem(ADMIN.KEY),
  clear: () => localStorage.removeItem(ADMIN.KEY)
};

// ==================== DB (Realtime, single source) ====================
const DB = {
  state: {
    users: [],
    chats: [],
    messages: [],
    tickets: [],
    ticketMessages: [],
    folders: [],
    modelAvailability: {},
    adminConfig: null,
    version: 0
  },
  online: false,
  _commitTimer: null,
  _unsub: null,
  _listeners: new Set(),

  subscribe(fn) {
    DB._listeners.add(fn);
    return () => DB._listeners.delete(fn);
  },
  _notify() {
    DB._listeners.forEach((fn) => {
      try { fn(DB.state); } catch (e) { console.error(e); }
    });
  },

  getUsers: () => Array.isArray(DB.state.users) ? DB.state.users : [],
  getChats: () => Array.isArray(DB.state.chats) ? DB.state.chats : [],
  getMessages: () => Array.isArray(DB.state.messages) ? DB.state.messages : [],
  getTickets: () => Array.isArray(DB.state.tickets) ? DB.state.tickets : [],
  getTicketMessages: () => Array.isArray(DB.state.ticketMessages) ? DB.state.ticketMessages : [],
  getFolders: () => Array.isArray(DB.state.folders) ? DB.state.folders : [],
  getAdminConfig: () => (DB.state.adminConfig && typeof DB.state.adminConfig === 'object') ? DB.state.adminConfig : null,
  getModelAvailability: () => DB.state.modelAvailability || {},

  async setUsers(list) {
    DB.state.users = list;
    DB._notify();
    await set(ref(db, `${REMOTE_PATH}/users`), Object.fromEntries(list.map(u => [u.id, u])));
  },
  async setChats(list) {
    DB.state.chats = list;
    DB._notify();
    await set(ref(db, `${REMOTE_PATH}/chats`), Object.fromEntries(list.map(c => [c.id, c])));
  },
  async setMessages(list) {
    DB.state.messages = list;
    DB._notify();
    await set(ref(db, `${REMOTE_PATH}/messages`), Object.fromEntries(list.map(m => [m.id, m])));
  },

  // Granular Actions
  async saveUser(u) {
    if (!u.id) return;
    // local optim
    const idx = DB.state.users.findIndex(x => x.id === u.id);
    if (idx >= 0) DB.state.users[idx] = u;
    else DB.state.users.push(u);
    DB._notify();
    // remote
    await set(ref(db, `${REMOTE_PATH}/users/${u.id}`), u);
  },

  async saveChat(c) {
    if (!c.id) return;
    const idx = DB.state.chats.findIndex(x => x.id === c.id);
    if (idx >= 0) DB.state.chats[idx] = c;
    else DB.state.chats.push(c);
    DB._notify();
    await set(ref(db, `${REMOTE_PATH}/chats/${c.id}`), c);
  },

  async deleteChat(chatId) {
    DB.state.chats = DB.state.chats.filter(c => c.id !== chatId);
    DB.state.messages = DB.state.messages.filter(m => m.chatId !== chatId);
    DB._notify();
    await remove(ref(db, `${REMOTE_PATH}/chats/${chatId}`));
    // Also remove messages for that chat from remote if needed
  },

  async deleteMessage(id) {
    const msg = DB.state.messages.find(m => m.id === id);
    if (!msg) return;
    DB.state.messages = DB.state.messages.filter(m => m.id !== id);
    DB._notify();
    await remove(ref(db, `${REMOTE_PATH}/messages/${id}`));
  },

  async saveMessage(m) {
    if (!m.id) return;
    const idx = DB.state.messages.findIndex(x => x.id === m.id);
    if (idx >= 0) DB.state.messages[idx] = m;
    else DB.state.messages.push(m);
    DB._notify();
    await set(ref(db, `${REMOTE_PATH}/messages/${m.id}`), m);
  },

  async saveTicket(t) {
    if (!t.id) return;
    const idx = DB.state.tickets.findIndex(x => x.id === t.id);
    if (idx >= 0) DB.state.tickets[idx] = t;
    else DB.state.tickets.push(t);
    DB._notify();
    await set(ref(db, `${REMOTE_PATH}/tickets/${t.id}`), t);
  },

  async saveTicketMessage(m) {
    if (!m.id) return;
    const idx = DB.state.ticketMessages.findIndex(x => x.id === m.id);
    if (idx >= 0) DB.state.ticketMessages[idx] = m;
    else DB.state.ticketMessages.push(m);
    DB._notify();
    await set(ref(db, `${REMOTE_PATH}/ticketMessages/${m.id}`), m);
  },

  async saveFolder(f) {
    if (!f.id) return;
    const idx = DB.state.folders.findIndex(x => x.id === f.id);
    if (idx >= 0) DB.state.folders[idx] = f;
    else DB.state.folders.push(f);
    DB._notify();
    await set(ref(db, `${REMOTE_PATH}/folders/${f.id}`), f);
  },

  async saveAdminConfig(cfg) {
    DB.state.adminConfig = cfg;
    DB._notify();
    await set(ref(db, `${REMOTE_PATH}/adminConfig`), cfg);
  },

  async deleteFolder(id) {
    DB.state.folders = DB.state.folders.filter(f => f.id !== id);
    DB._notify();
    await remove(ref(db, `${REMOTE_PATH}/folders/${id}`));
  },

  async deleteChat(id) {
    DB.state.chats = DB.state.chats.filter(c => c.id !== id);
    // clean messages? (optional, usually good to keep or delete orphan messages)
    DB._notify();
    await remove(ref(db, `${REMOTE_PATH}/chats/${id}`));
  },

  async deleteUser(id) {
    DB.state.users = DB.state.users.filter(u => u.id !== id);
    DB._notify();
    await remove(ref(db, `${REMOTE_PATH}/users/${id}`));
  },

  async deleteTicket(id) {
    DB.state.tickets = DB.state.tickets.filter(t => t.id !== id);
    DB._notify();
    await remove(ref(db, `${REMOTE_PATH}/tickets/${id}`));
  },

  async deleteTicketMessage(id) {
    DB.state.ticketMessages = DB.state.ticketMessages.filter(m => m.id !== id);
    DB._notify();
    await remove(ref(db, `${REMOTE_PATH}/ticketMessages/${id}`));
  },

  async deleteMessage(id) {
    DB.state.messages = DB.state.messages.filter(m => m.id !== id);
    DB._notify();
    await remove(ref(db, `${REMOTE_PATH}/messages/${id}`));
  },

  async setModelAvailability(map) {
    // map is { modelId: boolean }
    DB.state.modelAvailability = map;
    DB._notify();
    // remote: we store as array or object? Plan says object in new schema
    // Let's store as object: modelAvailability/modelId = true/false
    // But for simplicity of migration let's just replace the whole node since it's small config
    const list = Object.entries(map).map(([k, v]) => ({ id: k, available: v }));
    await set(ref(db, `${REMOTE_PATH}/modelAvailability`), list);
  },

  getCurrentUser: () => {
    try {
      return JSON.parse(localStorage.getItem('mirra_current_user') || 'null');
    } catch (e) {
      console.warn('Corrupted local user data, clearing...');
      localStorage.removeItem('mirra_current_user');
      return null;
    }
  },
  setCurrentUser: (u) => localStorage.setItem('mirra_current_user', JSON.stringify(u)),
  clearCurrentUser: () => localStorage.removeItem('mirra_current_user'),

  // Legacy full commit removed to prevent overwrites
  // queueCommit() { ... },
  // async commit() { ... },


  async init() {
    // ...

    // Global listener for User Sync & Security & UI
    DB.subscribe((state) => {
      // Force Refresh Check (Client Side)
      // Force Refresh Check (Client Side)
      const cfg = DB.getAdminConfig();
      if (cfg && cfg.forceRefresh) {
        const last = localStorage.getItem('mirra_last_refresh_ts');
        if (!last || Number(last) < cfg.forceRefresh) {
          localStorage.setItem('mirra_last_refresh_ts', cfg.forceRefresh);

          const overlay = document.getElementById('refresh-overlay');
          if (overlay) overlay.classList.add('active');

          setTimeout(() => {
            location.reload();
          }, 1500);
        }
      }

      let local = DB.getCurrentUser();
      if (local) {
        const fresh = state.users.find(u => u.id === local.id);
        if (fresh && JSON.stringify(fresh) !== JSON.stringify(local)) {
          DB.setCurrentUser(fresh);
          local = fresh;
        }
      }

      const isAdmin = local && local.isAdmin;
      if (window.location.pathname.includes('admin.html') && !isAdmin) {
        window.location.href = 'chat.html';
      }

      if (window.renderProfile) window.renderProfile();
    });

    return new Promise((resolve) => {
      let done = false;

      // Helper
      const toArray = (obj) => obj ? Object.values(obj) : [];

      const attach = (key, transform) => {
        onValue(ref(db, `${REMOTE_PATH}/${key}`), (snap) => {
          const val = snap.val();
          DB.state[key] = transform ? transform(val) : toArray(val);
          DB._notify();

          // Resolve boot as soon as users are loaded (critical for auth)
          if (key === 'users' && !done) {
            done = true;
            DB.online = true;
            resolve(true);
          }
        }, (err) => {
          console.error(`DB error [${key}]:`, err);
        });
      };

      // Granular subscriptions
      attach('users');
      attach('chats');
      attach('messages');
      attach('tickets');
      attach('ticketMessages');
      attach('folders');

      // Special handling
      onValue(ref(db, `${REMOTE_PATH}/modelAvailability`), (snap) => {
        const d = snap.val();
        DB.state.modelAvailability = Array.isArray(d)
          ? Object.fromEntries(d.map(m => [m.id, !!m.available]))
          : (d || {});
        DB._notify();
      });

      onValue(ref(db, `${REMOTE_PATH}/adminConfig`), (snap) => {
        DB.state.adminConfig = snap.val() || null;
        DB._notify();
      });

      onValue(ref(db, `${REMOTE_PATH}/version`), (snap) => {
        DB.state.version = snap.val() || 0;
      });
    });
  }
};

// ==================== MODALS ====================
// IMPORTANT: this file is a JS module. If we only set window.openModal, the identifier
// "openModal" is NOT available in module scope and any internal calls like openModal(...)
// will throw ReferenceError. So we define real functions and also export them to window.
const openModal = async (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('active');
  if (id === 'auth-modal') {
    await window.toggleAuthMode('login');
  }
};
const closeModal = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('active');
};
window.openModal = openModal;
window.closeModal = closeModal;

// ==================== AUTH UI ====================
window.toggleAuthMode = async (mode) => {
  const title = $('#modal-title');
  const loginForm = $('#login-form');
  const regForm = $('#register-form');
  if (!loginForm || !regForm) return;

  if (mode === 'register') {
    if (title) title.textContent = 'Регистрация';
    loginForm.classList.add('hidden');
    regForm.classList.remove('hidden');
  } else {
    if (title) title.textContent = 'Вход';
    regForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  }
};

async function ensureBoot() {
  if (window.__mirraBoot) await window.__mirraBoot;
}

window.handleLogin = async (e) => {
  e?.preventDefault?.();
  if (window._isLoggingIn) return;
  const btn = $('#login-form button[type="submit"]');

  try {
    window._isLoggingIn = true;
    if (btn) btn.disabled = true;
    showToast('Проверка...', 'info');

    await ensureBoot();

    const nick = ($('#login-nickname')?.value || '').trim();
    const pass = ($('#login-password')?.value || '');
    const user = DB.getUsers().find(u => (u.nickname || '').toLowerCase() === nick.toLowerCase() && u.password === pass);

    if (!user) {
      showToast('Неверный логин или пароль', 'error');
      return;
    }

    DB.setCurrentUser(user);
    location.href = 'chat.html';
  } catch (err) {
    console.error(err);
    showToast('Ошибка входа', 'error');
  } finally {
    window._isLoggingIn = false;
    if (btn) btn.disabled = false;
  }
};

window.handleRegister = async (e) => {
  e?.preventDefault?.();
  if (window._isRegistering) return;
  const btn = $('#register-form button[type="submit"]');

  try {
    window._isRegistering = true;
    if (btn) btn.disabled = true;
    showToast('Проверка...', 'info');

    await ensureBoot();

    const nick = ($('#reg-nickname')?.value || '').trim();
    const pass = ($('#reg-password')?.value || '');
    const conf = ($('#reg-password-confirm')?.value || '');

    if (!nick || !pass || !conf) { showToast('Заполните все поля', 'error'); return; }
    if (pass !== conf) { showToast('Пароли не совпадают', 'error'); return; }

    const users = DB.getUsers();
    if (users.some(u => (u.nickname || '').toLowerCase() === nick.toLowerCase())) {
      showToast('Никнейм занят', 'error');
      return;
    }

    const newUser = {
      id: nowId(),
      nickname: nick,
      password: pass,
      role: 'user',
      plan: 'free',
      auth: 'email',
      isAdmin: false,
      createdAt: Date.now()
    };

    await DB.saveUser(newUser);

    DB.setCurrentUser(newUser);
    location.href = 'chat.html';
  } catch (err) {
    console.error(err);
    showToast('Ошибка регистрации', 'error');
  } finally {
    window._isRegistering = false;
    if (btn) btn.disabled = false;
  }
};

// ==================== SESSION / PROFILE ====================
window.logout = function () {
  DB.clearCurrentUser();
  location.href = 'index.html';
};

window.openChangeNickModal = () => openModal('change-nick-modal');
window.openChangePasswordModal = () => openModal('change-password-modal');
window.openDeleteAccountModal = () => openModal('delete-account-modal');

window.saveVisibleName = async () => {
  const user = DB.getCurrentUser();
  if (!user) return;
  const val = ($('#new-visible-name')?.value || '').trim();

  const updatedUser = { ...user, visibleName: val };
  await DB.saveUser(updatedUser);
  DB.setCurrentUser(updatedUser);

  showToast('Сохранено', 'success');
  closeModal('change-nick-modal');
};

window.saveNewPassword = async () => {
  const user = DB.getCurrentUser();
  if (!user) return;
  const oldP = ($('#old-password')?.value || '');
  const newP = ($('#new-password')?.value || '');
  const conf = ($('#confirm-new-password')?.value || '');
  const fresh = DB.getUsers().find(u => u.id === user.id);
  if (!fresh || fresh.password !== oldP) return showToast('Неверный текущий пароль', 'error');
  if (!newP || newP.length < 4) return showToast('Пароль слишком короткий', 'error');
  if (newP !== conf) return showToast('Пароли не совпадают', 'error');

  const users = DB.getUsers().map(u => u.id === user.id ? ({ ...u, password: newP }) : u);
  await DB.saveUser({ ...fresh, password: newP });
  DB.setCurrentUser({ ...fresh, password: newP });
  showToast('Пароль изменён', 'success');
  closeModal('change-password-modal');
};

window.confirmDeleteAccount = async () => {
  const user = DB.getCurrentUser();
  if (!user) return;
  const pass = ($('#delete-password')?.value || '');
  const fresh = DB.getUsers().find(u => u.id === user.id);
  if (!fresh || fresh.password !== pass) return showToast('Неверный пароль', 'error');

  // cascade delete
  // cascade delete
  const uid = user.id;
  await DB.deleteUser(uid);

  // delete related chats
  const chats = DB.getChats().filter(c => c.userId === uid);
  for (const c of chats) await DB.deleteChat(c.id);

  // delete orphaned messages (from user OR in user's chats)
  // Logic: remove messages where userId == uid OR chatId is in user's chats
  const chatIds = new Set(chats.map(c => c.id));
  const messages = DB.getMessages().filter(m => m.userId === uid || chatIds.has(m.chatId));
  for (const m of messages) await DB.deleteMessage(m.id);

  // delete tickets
  const tickets = DB.getTickets().filter(t => t.userId === uid);
  for (const t of tickets) await DB.deleteTicket(t.id);

  // delete ticket messages
  const ticketIds = new Set(tickets.map(t => t.id));
  const tMessages = DB.getTicketMessages().filter(m => m.userId === uid || ticketIds.has(m.ticketId));
  for (const m of tMessages) await DB.deleteTicketMessage(m.id);

  DB.clearCurrentUser();
  showToast('Аккаунт удалён', 'success');
  location.href = 'index.html';
};

// ==================== CHAT ====================
let currentChatId = null;
let currentModel = 'mistral-small-3.2';
let attachedFiles = [];
let currentSort = 'date';
let currentUserTool = null;

let _chatUnsub = null;
let _messagesHTMLCache = '';

let currentUserThinking = false;

window.toggleUserTool = (tool) => {
  const tName = String(tool || '').trim();

  if (tName === 'thinking') {
    currentUserThinking = !currentUserThinking;
    const btn = document.getElementById('ut-thinking');
    if (btn) {
      btn.classList.toggle('active', currentUserThinking);
    }
  } else {
    // Other tools are mutually exclusive
    if (currentUserTool === tName) currentUserTool = null;
    else currentUserTool = tName;

    ['search', 'code', 'image', 'music'].forEach(t => {
      const btn = document.getElementById('ut-' + t);
      if (btn) {
        btn.classList.toggle('active', currentUserTool === t);
      }
    });
  }

  // Save tool selection to current chat
  if (currentChatId) {
    const chat = DB.getChats().find(c => c.id === currentChatId);
    if (chat) {
      DB.saveChat({ ...chat, selectedTool: currentUserTool, selectedThinking: currentUserThinking });
    }
  }
};

window.initChat = function () {
  if (window.__chatInited) return;
  window.__chatInited = true;

  // New Global for Abort
  window.currentAbortCtrl = null;

  const user = DB.getCurrentUser();
  if (!user) { location.href = 'index.html'; return; }

  DB.subscribe(() => {
    try {
      // Check if current user still exists in DB - kick out if deleted
      const localUser = DB.getCurrentUser();
      if (localUser) {
        const stillExists = DB.getUsers().some(u => u.id === localUser.id);
        if (!stillExists) {
          DB.clearCurrentUser();
          showToast('Ваш аккаунт был удалён', 'error');
          location.href = 'index.html';
          return;
        }
      }
      renderProfile();
      renderChatList();

      // Real-time ENFORCEMENT of model availability/plan
      const chat = DB.getChats().find(c => c.id === currentChatId);
      if (currentChatId && chat) {
        // If the chat's model is no longer available or allowed, switch it
        // We check currentModel (global) vs Chat model might differ if we just switched chats,
        // but let's ensure the User's "Session Model" is valid.

        // Actually, we should check if currentModel is valid for the user
        const user = DB.getCurrentUser();
        const m = MODELS[currentModel];
        if (user && m) {
          const isAvail = getModelAvailability(currentModel);
          const isAllowed = (user.plan === 'pro') || !m.isPro;

          if (!isAvail || !isAllowed) {
            // Must switch!
            const pick = autoPickModelForUser(user);
            if (pick !== currentModel) {
              currentModel = pick;
              showToast(`Модель ${m.name} недоступна. Переключено на ${MODELS[pick].name}`, 'info');
              renderModelSelector();
              // Update chat model in DB so it persists? 
              // Usually we update chat model on sendMessage. 
              // But if we want instant feedback:
              // const chats = DB.getChats().map(c => c.id === currentChatId ? {...c, model: pick} : c);
              // DB.setChats(chats);
            }
          }
        }
      }

      if (currentChatId) {
        renderMessages();

        // Check if we are "Waiting/Stopping" and if a new message arrived that allows us to reset
        const msgs = DB.getMessages().filter(m => m.chatId === currentChatId).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        const lastMsg = msgs[msgs.length - 1];

        // If the last message is NOT from 'user', then we are not waiting anymore.
        // Also check if we have a currentAbortCtrl active.
        if (window.currentAbortCtrl && lastMsg && lastMsg.role !== 'user') {
          // We received a reply (assistant, admin, system, etc)
          // So we should reset the button to "Send".
          // But for "Auto" mode, callMistralAI already handles reset in finally block.
          // However, for Manual mode, we rely on this or manual stop.
          // To be safe, let's reset if we see a reply.
          window.currentAbortCtrl.abort(); // cleanup listeners if any
          window.currentAbortCtrl = null;
          updateSendButtonState(false);
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  renderProfile();
  renderModelSelector();
  setupChatEvents();
  renderChatList();
};

function renderProfile() {
  const user = DB.getCurrentUser();
  if (!user) return;
  const fresh = DB.getUsers().find(u => u.id === user.id) || user;
  const display = fresh.visibleName || fresh.nickname;

  $$('.user-name').forEach(el => el.textContent = display);
  $$('.user-display-name').forEach(el => el.textContent = display);
  $$('.user-nickname').forEach(el => el.textContent = fresh.nickname);
  $$('.user-id').forEach(el => el.textContent = fresh.id);
  $$('.user-plan').forEach(el => {
    el.textContent = (fresh.plan || 'free').toUpperCase();
    el.className = 'badge ' + ((fresh.plan || 'free') === 'pro' ? 'pro' : 'free');
  });

  // update "ИИ думает" indicator for current chat
  const thinkingEl = document.getElementById('thinking-status');
  if (thinkingEl && currentChatId) {
    const chat = DB.getChats().find(c => c.id === currentChatId);
    if (chat?.thinking) {
      const m = getSafeModel(chat.thinkingModel || chat.model);
      thinkingEl.classList.remove('hidden');
      thinkingEl.innerHTML = `
        <span class="thinking-ico">
          <svg viewBox="0 0 24 24" class="thinking-brain" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M9 4.5c-1.7 0-3 1.4-3 3v1A3 3 0 0 0 4.5 11.1c0 1.1.6 2.1 1.5 2.6V15a3 3 0 0 0 3 3h.5A2.5 2.5 0 0 0 12 20.5"/>
            <path d="M15 4.5c1.7 0 3 1.4 3 3v1a3 3 0 0 1 1.5 2.6c0 1.1-.6 2.1-1.5 2.6V15a3 3 0 0 1-3 3h-.5A2.5 2.5 0 0 1 12 20.5"/>
          </svg>
        </span>
        <span>${escapeHTML(m.name)} думает...</span>
      `;
    } else {
      thinkingEl.classList.add('hidden');
      thinkingEl.textContent = '';
    }
  }

  // Admin gate UI (optional)
  const enterOnly = $('.admin-enter-only');
  const adminOnlyLinks = $$('.admin-only');
  if (enterOnly) enterOnly.style.display = ADMIN.get() ? 'none' : 'flex';
  adminOnlyLinks.forEach(el => {
    if (el.tagName === 'A') el.classList.toggle('hidden', !ADMIN.get());
    else el.style.display = ADMIN.get() ? 'flex' : 'none';
  });
}

function renderChatList() {
  const user = DB.getCurrentUser();
  const listEl = $('#chat-list');
  if (!user || !listEl) return;

  const chats = DB.getChats().filter(c => c.userId === user.id).slice();

  // Sort Logic
  if (currentSort === 'alpha') {
    chats.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (currentSort === 'count') {
    const counts = {};
    DB.getMessages().forEach(m => { counts[m.chatId] = (counts[m.chatId] || 0) + 1; });
    chats.sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
  } else {
    chats.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  // Render Sort Dropdown Label
  const sortLabel = document.getElementById('current-sort-label');
  if (sortLabel) {
    const t = currentSort === 'alpha' ? 'По алфавиту' : (currentSort === 'count' ? 'По сообщениям' : 'По дате');
    if (sortLabel.textContent !== t) sortLabel.textContent = t;
  }

  if (!chats.length && !DB.getFolders().length) {
    listEl.innerHTML = '<div class="empty-state">Нет диалогов</div>';
    return;
  }

  // Sort
  // "сделай возможность сортировки по дате последнего сообщения по алфавиту по кол-во сообщений"
  // Default: Date desc

  const folders = DB.getFolders().filter(f => f.userId === user.id);

  // Render Folders first
  const foldersHtml = folders.map(f => {
    const fChats = chats.filter(c => c.folderId === f.id);
    const isOpen = f.isOpen; // local state or persisted in DB? "isOpen" in DB usually for persistence

    return `
      <div class="folder-item ${isOpen ? 'open' : ''}" 
           onondragover="window.handleDragOver(event, 'folder', '${f.id}')"
           ondrop="window.handleDrop(event, 'folder', '${f.id}')"
           onclick="if(!event.target.closest('.folder-edit')) window.toggleFolder('${f.id}')">
        <div class="folder-header">
           <div class="folder-icon"><svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg></div>
           <div class="folder-name">${escapeHTML(f.name)}</div>
           <div class="folder-count">${fChats.length}</div>
           <button class="folder-edit" onclick="window.renameFolder('${f.id}')">✎</button>
           <button class="folder-edit" style="color:#ff6b7a" onclick="window.deleteFolder('${f.id}')">×</button>
        </div>
        <div class="folder-chats">
           ${renderChatsOnly(fChats)}
        </div>
      </div>
    `;
  }).join('');

  const looseChats = chats.filter(c => !c.folderId);
  const looseHtml = renderChatsOnly(looseChats);

  listEl.innerHTML = foldersHtml + looseHtml;
}

function renderChatsOnly(list) {
  if (!list.length) return ''; // <div class="empty-folder">Пусто</div> ? 
  return list.map(chat => {
    const model = getSafeModel(chat.model);
    const isUnread = chat.unread && currentChatId !== chat.id;
    return `
      <div class="chat-item ${chat.id === currentChatId ? 'active' : ''}" 
           draggable="true"
           ondragstart="window.handleDragStart(event, '${chat.id}')"
           ondragover="window.handleDragOver(event, 'chat', '${chat.id}')"
           ondrop="window.handleDrop(event, 'chat', '${chat.id}')"
           onclick="window.selectChat('${chat.id}')">
        <div class="chat-item-icon">${ICONS[model.icon]}</div>
        <div class="chat-item-info">
          <div class="chat-item-name">${escapeHTML(chat.name || 'Диалог')} ${isUnread ? '<span class="unread-dot"></span>' : ''}</div>
          <div class="chat-item-model">${escapeHTML(model.name)}</div>
        </div>
        <div class="chat-item-actions">
           <button class="chat-item-delete" onclick="event.stopPropagation(); window.deleteChatModal('${chat.id}')">×</button>
        </div>
      </div>
    `;
  }).join('');
}

// Drag & Drop Logic
window.handleDragStart = (e, chatId) => {
  e.dataTransfer.setData('chatId', chatId);
  e.target.classList.add('dragging');
};

window.handleDragOver = (e, type, id) => {
  e.preventDefault(); // allow drop
  // Highlight? CSS uses :hover or .drag-over class. 
  // Native dragover fires continuously. Adding class here might flicker if we don't manage dragleave.
  // CSS "drag-over" is handled better if we set it on target.
  const target = e.currentTarget;
  target.classList.add('drag-over');
};

window.handleDrop = async (e, type, targetId) => {
  e.preventDefault();
  e.stopPropagation();
  const draggingId = e.dataTransfer.getData('chatId');
  $('.dragging')?.classList.remove('dragging');
  $$('.drag-over').forEach(el => el.classList.remove('drag-over'));

  if (!draggingId || draggingId === targetId) return;

  const chats = DB.getChats();
  const draggingChat = chats.find(c => c.id === draggingId);
  if (!draggingChat) return;

  // Drop on Folder -> Move to folder
  if (type === 'folder') {
    if (draggingChat.folderId === targetId) return; // already in
    const nextFn = chats.map(c => c.id === draggingId ? ({ ...c, folderId: targetId }) : c);
    DB.setChats(nextFn);
    return;
  }

  // Drop on Chat -> Merge (Create Folder)
  if (type === 'chat') {
    const targetChat = chats.find(c => c.id === targetId);
    if (!targetChat) return;

    // If target is already in a folder, just move dragging to that folder?
    if (targetChat.folderId) {
      if (draggingChat.folderId === targetChat.folderId) return;
      await DB.saveChat({ ...draggingChat, folderId: targetChat.folderId });
      return;
    }

    // Both are loose -> Create new folder
    const user = DB.getCurrentUser();
    const folderId = nowId();
    const newFolder = {
      id: folderId,
      userId: user.id,
      name: 'Новая папка',
      createdAt: Date.now(),
      isOpen: true
    };

    // Update both chats
    // Update both chats
    await DB.saveFolder(newFolder);
    await DB.saveChat({ ...draggingChat, folderId });
    await DB.saveChat({ ...targetChat, folderId });
  }
};
// clean drag styles on leave
document.addEventListener('dragleave', (e) => {
  if (e.target.classList?.contains('drag-over')) e.target.classList.remove('drag-over');
}, true);
document.addEventListener('dragend', (e) => {
  $('.dragging')?.classList.remove('dragging');
  $$('.drag-over').forEach(el => el.classList.remove('drag-over'));
});

window.toggleFolder = (id) => {
  const folders = DB.getFolders().map(f => f.id === id ? ({ ...f, isOpen: !f.isOpen }) : f);
  DB.setFolders(folders); // persist open state
};

window.renameFolder = async (id) => {
  const f = DB.getFolders().find(x => x.id === id);
  const n = await uiPrompt('Новое название папки:', f ? f.name : '');
  if (n) {
    DB.setFolders(DB.getFolders().map(folder => folder.id === id ? ({ ...folder, name: n }) : folder));
    renderChatList();
  }
};
window.deleteFolder = async (id) => {
  if (!await uiConfirm('Удалить папку? Чаты вернутся в общий список.')) return;
  // Update chats to remove folder reference
  const chatsInFolder = DB.getChats().filter(c => c.folderId === id);
  for (const c of chatsInFolder) {
    await DB.saveChat({ ...c, folderId: null });
  }
  // Delete the folder
  await DB.deleteFolder(id);
  renderChatList();
};

// confirmDeleteAccount is defined earlier in the file (line 629)

// Helper for System Modals
window.injectSystemModal = () => {
  if (document.getElementById('system-modal-overlay')) return;
  const div = document.createElement('div');
  div.id = 'system-modal-overlay';
  div.className = 'modal-overlay';
  div.style.zIndex = '9999';
  div.innerHTML = `
      <div class="modal" style="max-width:400px;text-align:center;">
        <h3 id="sys-modal-title" style="margin-bottom:12px;font-size:18px;"></h3>
        <p id="sys-modal-text" style="color:rgba(255,255,255,0.7);margin-bottom:20px;"></p>
        <div id="sys-modal-input-wrap" class="input-group hidden" style="margin-bottom:20px;">
           <input id="sys-modal-input" class="input-field" type="text">
        </div>
        <div class="modal-actions" style="justify-content:center;gap:10px;display:flex;">
           <button id="sys-modal-cancel" class="btn secondary">Отмена</button>
           <button id="sys-modal-ok" class="btn primary">ОК</button>
        </div>
      </div>
    `;
  document.body.appendChild(div);
};

window.uiConfirm = (text) => {
  return new Promise(resolve => {
    window.injectSystemModal();
    const ov = document.getElementById('system-modal-overlay');
    const title = document.getElementById('sys-modal-title');
    const txt = document.getElementById('sys-modal-text');
    const inp = document.getElementById('sys-modal-input-wrap');
    const ok = document.getElementById('sys-modal-ok');
    const cancel = document.getElementById('sys-modal-cancel');
    const inputEl = document.getElementById('sys-modal-input');

    title.textContent = 'Подтверждение';
    txt.textContent = text;
    inp.classList.add('hidden');
    ov.classList.add('active');

    // handlers
    const cleanup = () => {
      ov.classList.remove('active');
      ok.onclick = null;
      cancel.onclick = null;
    };

    ok.onclick = () => { cleanup(); resolve(true); };
    cancel.onclick = () => { cleanup(); resolve(false); };
  });
};

window.uiPrompt = (text, def = '') => {
  return new Promise(resolve => {
    window.injectSystemModal();
    const ov = document.getElementById('system-modal-overlay');
    const title = document.getElementById('sys-modal-title');
    const txt = document.getElementById('sys-modal-text');
    const inp = document.getElementById('sys-modal-input-wrap');
    const ok = document.getElementById('sys-modal-ok');
    const cancel = document.getElementById('sys-modal-cancel');
    const inputEl = document.getElementById('sys-modal-input');

    title.textContent = text; // Prompt content as title usually, or text
    txt.textContent = '';
    inp.classList.remove('hidden');
    inputEl.value = def;
    inputEl.focus();
    ov.classList.add('active');

    const cleanup = () => {
      ov.classList.remove('active');
      ok.onclick = null;
      cancel.onclick = null;
      inputEl.onkeydown = null;
    };

    ok.onclick = () => { const v = inputEl.value; cleanup(); resolve(v); };
    cancel.onclick = () => { cleanup(); resolve(null); };
    inputEl.onkeydown = (e) => { if (e.key === 'Enter') ok.click(); };
  });
};

window.createChat = () => {
  currentChatId = null;
  const w = $('#welcome-screen');
  const m = $('#messages-area');
  if (w) w.classList.remove('hidden');
  if (m) m.classList.add('hidden');
};

window.selectChat = async (id) => {
  currentChatId = id;
  const chat = DB.getChats().find(c => c.id === id);
  if (chat) {
    currentModel = chat.model;
    if (chat.unread) {
      await DB.saveChat({ ...chat, unread: false });
    }
  }

  // Restore saved tool selection for this chat
  currentUserTool = chat?.selectedTool || null;
  currentUserThinking = !!chat?.selectedThinking;

  // Update tool buttons UI
  ['search', 'code', 'image', 'music'].forEach(t => {
    const btn = document.getElementById('ut-' + t);
    if (btn) btn.classList.toggle('active', currentUserTool === t);
  });
  const thinkBtn = document.getElementById('ut-thinking');
  if (thinkBtn) thinkBtn.classList.toggle('active', currentUserThinking);

  $('#welcome-screen')?.classList.add('hidden');
  $('#messages-area')?.classList.remove('hidden');
  renderModelSelector();
  renderMessages(true);
  renderChatList();
  renderProfile();
};



function renderToolCard(msg) {
  if (!msg || msg.role !== 'assistant') return '';
  const meta = msg.meta || {};

  // Normalise to array
  let tools = [];
  if (meta.multiTools) {
    tools = meta.multiTools;
  } else if (meta.tool) {
    tools = [meta]; // Legacy/Single wrapper
  }

  if (!tools.length) return '';

  return tools.map((t, idx) => renderSingleTool(t, msg, idx)).join('');
}

function renderSingleTool(toolMeta, msg, toolIdx) {
  const type = toolMeta.type || toolMeta.tool;
  const state = toolMeta.state;
  // Show buttons ONLY if we are explicitly in Admin Panel (admin.html) AND have admin rights.
  // The user requested to remove them from "user side" (chat.html) even for admins.
  const isAdmin = window.ADMIN && window.ADMIN.get && window.ADMIN.get();
  const showAdminControls = isAdmin && window.location.pathname.includes('admin.html');

  // ============ THINKING ============
  if (type === 'thinking') {
    const brainSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:100%;height:100%"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 2.96-3.08A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-2.96-3.08A2.5 2.5 0 0 0 14.5 2z"/></svg>`;

    if (state === 'running') {
      const start = toolMeta.start || Date.now();
      return `
              <div class="tool-card tool-thinking">
                <div class="tool-body tool-row">
                   <span class="tool-ico spin-slow">${brainSvg}</span>
                   <span class="tool-shimmer-text shimmer-live">Thinking...(<span class="thinking-timer" data-start="${start}">0s</span>)</span>
                   ${showAdminControls ? `<button class="btn small" style="margin-left:auto;padding:2px 8px;font-size:10px;" onclick="window.openThinkingControl('${msg.id}')">Stop</button>` : ''}
                </div>
              </div>`;
    }
    if (state === 'done') {
      return `
              <div class="coding-result" style="margin-top:4px;">
                <details>
                  <summary>
                    <span style="display:flex;gap:6px;align-items:center;">
                      <span class="tool-ico">${brainSvg}</span>
                      <span>Thought for ${toolMeta.duration || 0}s</span>
                    </span>
                  </summary>
                  <div style="padding:10px;font-size:13px;color:rgba(255,255,255,0.8);white-space:pre-wrap;">${escapeHTML(toolMeta.content || '...')}</div>
                </details>
              </div>`;
    }
  }

  // ============ CODING (Multifile) ============
  if (type === 'coding') {
    const files = toolMeta.files || []; // Array of {name, code, status: 'pending'|'done'|'error'}
    // If legacy single file
    if (!files.length && toolMeta.fileName) {
      files.push({ name: toolMeta.fileName, code: msg.meta.code, status: state });
    }

    const fileListHtml = files.map((f, i) => {
      const st = f.status || 'pending';
      const name = escapeHTML(f.name || 'file');

      if (showAdminControls) {
        // Admin Panel View: shimmer + ✓ and ✗ buttons
        if (st === 'done') {
          return `
            <div class="tool-card tool-coding done">
              <div class="tool-body tool-row">
                <span class="tool-ico">${TOOL_ICONS.plus}</span>
                <span>Создан ${name}</span>
                <span style="color:#2ed573;margin-left:auto;">✔</span>
              </div>
            </div>`;
        }
        if (st === 'error') {
          return `
            <div class="tool-card tool-coding" style="border-color:#ff4757;">
              <div class="tool-body tool-row" style="color:#ff4757;">
                <span class="tool-ico">${TOOL_ICONS.code}</span>
                <span>Ошибка создания ${name}</span>
                <span style="margin-left:auto;">✗</span>
              </div>
            </div>`;
        }
        // pending
        return `
          <div class="tool-card tool-coding">
            <div class="tool-body tool-row">
              <span class="tool-ico">${TOOL_ICONS.code}</span>
              <span class="tool-shimmer-text shimmer-live">Создание ${name}<span class="tool-dots"></span></span>
              <div style="margin-left:auto;display:flex;gap:6px;">
                <button class="btn-icon" style="color:#2ed573;" onclick="window.markCodingFileDone('${msg.id}', ${i})">✓</button>
                <button class="btn-icon" style="color:#ff4757;" onclick="window.markCodingFileError('${msg.id}', ${i})">✗</button>
              </div>
            </div>
          </div>`;
      } else {
        // User View - simple, no buttons
        if (st === 'done') {
          return `
            <div class="tool-card tool-coding done">
              <div class="tool-body tool-row">
                <span class="tool-ico">${TOOL_ICONS.plus}</span>
                <button class="tool-link" onclick="window.openCodingMsgFile('${msg.id}', ${i})">Создан ${name}</button>
              </div>
            </div>`;
        }
        if (st === 'error') {
          return `
            <div class="tool-card tool-coding">
              <div class="tool-body tool-row" style="color:#ff4757;">
                <span class="tool-ico">${TOOL_ICONS.code}</span>
                <span>Ошибка: ${name}</span>
              </div>
            </div>`;
        }
        // pending - just shimmer, no buttons
        return `
          <div class="tool-card tool-coding">
            <div class="tool-body tool-row">
              <span class="tool-ico">${TOOL_ICONS.code}</span>
              <span class="tool-shimmer-text shimmer-live">Создание ${name}<span class="tool-dots"></span></span>
            </div>
          </div>`;
      }
    }).join('');

    return `<div class="tool-group-coding">${fileListHtml}</div>`;
  }

  // ============ SEARCH ============
  if (type === 'search') {
    if (state === 'running') {
      return `
        <div class="tool-card tool-search">
          <div class="tool-body tool-row">
            <span class="tool-ico spin">${TOOL_ICONS.search}</span>
            <span class="tool-shimmer-text shimmer-live">Поиск в интернете...</span>
          </div>
        </div>
      `;
    }
    if (state === 'done') {
      return `
        <div class="tool-card tool-search done">
          <div class="tool-body tool-row">
            <span class="tool-ico">${TOOL_ICONS.search}</span>
            <span class="tool-text">Поиск завершён</span>
          </div>
        </div>
      `;
    }
    if (state === 'error') {
      return `
        <div class="tool-card tool-search" style="border-color:#ff4757;">
          <div class="tool-body tool-row" style="color:#ff4757;">
            <span class="tool-ico">${TOOL_ICONS.search}</span>
            <span class="tool-text">Ошибка поиска</span>
          </div>
        </div>
      `;
    }
  }

  // ============ IMAGE ============
  if (type === 'image') {
    const rawFiles = Array.isArray(msg.files) ? msg.files : (msg.file ? [msg.file] : []);
    if (state === 'running' || state === 'pending') {
      return `
        <div class="tool-card tool-image">
          <div class="tool-body tool-col tool-col-center">
            <div class="gen-image-placeholder" aria-hidden="true"></div>
          </div>
        </div>
      `;
    }
    if (state === 'done') {
      const img = rawFiles.find(isImageFile);
      if (img?.data) {
        return `
          <div class="tool-card tool-image done">
            <div class="tool-body">
              <img class="tool-image-preview" src="${img.data}" alt="image"/>
            </div>
          </div>
        `;
      }
      return `
        <div class="tool-card tool-image done">
          <div class="tool-body">
            <div class="gen-image-placeholder" aria-hidden="true"></div>
          </div>
        </div>
      `;
    }
    if (state === 'error') {
      return `
        <div class="tool-card tool-image" style="border-color:#ff4757;">
          <div class="tool-body tool-col tool-col-center" style="color:#ff4757;">
             <span class="tool-ico">${TOOL_ICONS.image}</span>
             <span>Ошибка генерации</span>
          </div>
        </div>
      `;
    }
  }

  // ============ MUSIC ============
  if (type === 'music') {
    if (state === 'running' || state === 'pending') {
      return `
        <div class="tool-card tool-music">
           <div class="tool-body tool-row">
             <span class="tool-ico spin">${TOOL_ICONS.music}</span>
             <span class="tool-shimmer-text shimmer-live">Creating music...</span>
           </div>
        </div>`;
    }
    if (state === 'done') {
      const audioFile = (msg.files || []).find(f => f.type && f.type.startsWith('audio'));
      if (audioFile) {
        return `
            <div class="tool-card tool-music done">
               <div class="tool-body tool-col">
                  <div style="display:flex;align-items:center;gap:8px;">
                     <span class="tool-ico">${TOOL_ICONS.music}</span>
                     <span><strong>Music Generated</strong></span>
                  </div>
                  <div class="music-player-wrapper" style="margin-top:8px;background:rgba(0,0,0,0.3);border-radius:8px;padding:8px;">
                    <audio controls src="${audioFile.data}" style="width:100%;height:32px;filter:sepia(20%) saturate(70%) grayscale(0.3) contrast(99%) invert(10%);"></audio>
                  </div>
               </div>
            </div>`;
      }
      return `
        <div class="tool-card tool-music done">
           <div class="tool-body tool-row">
             <span class="tool-ico">${TOOL_ICONS.music}</span>
             <span><strong>Music generated</strong> (No audio file)</span>
           </div>
        </div>`;
    }
    if (state === 'error') {
      return `
        <div class="tool-card tool-music" style="border-color:#ff4757;">
           <div class="tool-body tool-row" style="color:#ff4757;">
             <span class="tool-ico">${TOOL_ICONS.music}</span>
             <span>Ошибка генерации музыки</span>
           </div>
        </div>`;
    }
  }

  return '';
}

// Timer Logic
setInterval(() => {
  document.querySelectorAll('.thinking-timer').forEach(el => {
    const start = parseInt(el.getAttribute('data-start') || '0');
    if (!start) return;
    const diff = Math.floor((Date.now() - start) / 1000);
    el.textContent = diff + 's';
  });
}, 1000);

window.openCodingMsgFile = (msgId, idx) => {
  const m = DB.getMessages().find(x => x.id === msgId);
  if (!m) return;

  // Find file
  let file = null;

  // New format: meta.files
  if (m.meta?.files && m.meta.files[idx]) {
    file = m.meta.files[idx];
  }
  // Multi-tools format
  else if (m.meta?.multiTools) {
    const tool = m.meta.multiTools.find(t => t.type === 'coding');
    if (tool?.files?.[idx]) file = tool.files[idx];
  }
  // Legacy fallback
  else if (m.meta?.fileName) {
    file = { name: m.meta.fileName, code: m.meta.code };
  }

  if (!file) return;

  // Use existing coding result modal
  const titleEl = document.getElementById('coding-result-title');
  const bodyEl = document.getElementById('coding-result-body');
  if (titleEl) titleEl.textContent = `Файл: ${file.name}`;
  if (bodyEl) bodyEl.textContent = file.code || file.content || '';
  openModal('coding-result-modal');
};

let __toolWaveTimer = null;
let __toolWavePhase = 0;
function startToolWaveLoop() {
  if (__toolWaveTimer) return;
  __toolWaveTimer = setInterval(() => {
    __toolWavePhase++;
    const wraps = document.querySelectorAll('.tool-anim-wrap[data-wave="1"]');
    wraps.forEach((w) => {
      const base = String(w.getAttribute('data-text') || '').trim();
      if (!base) return;
      const chars = [...base];
      const len = chars.length;
      if (!len) return;
      const win = Math.max(4, Math.min(10, Math.floor(len / 3)));
      const start = __toolWavePhase % len;
      const out = chars.map((ch, i) => {
        const isLetter = /[a-zA-Zа-яА-ЯёЁ]/.test(ch);
        if (!isLetter) return ch;
        const dist = (i - start + len) % len;
        const hi = dist < win;
        return hi ? ch.toUpperCase() : ch.toLowerCase();
      }).join('');

      const b = w.querySelector('.tool-anim-base');
      const s = w.querySelector('.tool-anim-shine');
      if (b && b.textContent !== out) b.textContent = out;
      if (s && s.textContent !== out) s.textContent = out;
    });
  }, 140);
}

// ==================== SHIMMER ENGINE (in-viewport only, seamless) ====================
// Fixes:
// - No modulo "jump" (seamless phase)
// - No reset jump when scrolling (phase is preserved)
// - Observe with rootMargin so elements don't flicker at viewport edge
let __shimmerRAF = 0;
let __shimmerPhase = 0; // px
let __shimmerLastTs = 0;
let __shimmerVisible = new Set();
let __shimmerObs = null;
let __shimmerObserved = new WeakSet();

function __ensureShimmerObserver() {
  if (__shimmerObs) return;
  __shimmerObs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) __shimmerVisible.add(e.target);
      else __shimmerVisible.delete(e.target);
    }
    if (__shimmerVisible.size && !__shimmerRAF) {
      __shimmerLastTs = 0; // will be set on first tick
      __shimmerRAF = requestAnimationFrame(__shimmerTick);
    }
  }, { root: null, threshold: 0, rootMargin: '220px 0px 220px 0px' });
}

function __shimmerTick(ts) {
  if (!__shimmerLastTs) __shimmerLastTs = ts;
  const dt = ts - __shimmerLastTs;
  __shimmerLastTs = ts;

  // speed: px/sec (чуть быстрее, чтобы перелив казался живее)
  const sp = 72;
  __shimmerPhase += (dt / 1000) * sp;

  // diagonal drift; we keep it continuous to avoid visible seam
  const x = -__shimmerPhase;
  const y = -__shimmerPhase;

  __shimmerVisible.forEach((el) => {
    if (!el.isConnected) {
      __shimmerVisible.delete(el);
      try { __shimmerObs?.unobserve?.(el); } catch { }
      return;
    }
    el.style.setProperty('--shx', x + 'px');
    el.style.setProperty('--shy', y + 'px');
  });

  if (__shimmerVisible.size) {
    __shimmerRAF = requestAnimationFrame(__shimmerTick);
  } else {
    __shimmerRAF = 0;
  }
}

function observeShimmers(rootEl) {
  __ensureShimmerObserver();
  if (!rootEl) return;
  const els = rootEl.querySelectorAll?.('.shimmer-live');
  els?.forEach?.((el) => {
    if (__shimmerObserved.has(el)) return;
    __shimmerObserved.add(el);
    __shimmerObs.observe(el);
  });
}

const animatedMessages = new Set();

function runTypewriter(el, content, finalHtml) {
  if (!el || !content) {
    if (el) el.innerHTML = finalHtml;
    return;
  }

  el.innerHTML = '';
  const cursorHtml = '<span class="typewriter-cursor"></span>';
  let i = 0;

  // Read speed from config or default to 10
  const cfg = DB.getAdminConfig();
  const speed = parseInt(cfg?.typewriterSpeed) || 10;

  function type() {
    if (i < content.length) {
      const partial = content.substring(0, i + 1);
      // We parse partial markdown live.
      // Note: partial syntax (like a half-closed bold) will just render as raw text until closed.
      el.innerHTML = parseMarkdown(partial) + cursorHtml;

      i++;
      setTimeout(type, speed);

      // Auto-scroll while typing
      const container = document.getElementById('messages-container');
      if (container) {
        const nearBottom = (container.scrollHeight - container.scrollTop - container.clientHeight) < 100;
        if (nearBottom) container.scrollTop = container.scrollHeight;
      }
    } else {
      el.innerHTML = finalHtml;
      const container = document.getElementById('messages-container');
      if (container) container.scrollTop = container.scrollHeight;
    }
  }

  type();
}

function renderMessages(force = false) {
  const container = $('#messages-container');
  const user = DB.getCurrentUser();
  if (!container || !currentChatId || !user) return;

  const msgs = DB.getMessages()
    .filter(m => m.chatId === currentChatId)
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  const nearBottom = (container.scrollHeight - container.scrollTop - container.clientHeight) < 80;

  // Track active IDs to handle deletions
  const newIds = new Set();

  msgs.forEach(m => {
    const isUser = m.role === 'user';
    const model = getSafeModel(m.model || currentModel);

    // Calculate signature to detect changes
    // Includes content, meta (tools state), and user profile (for user messages)
    const sigObj = {
      id: m.id,
      content: m.content,
      meta: m.meta,
      files: m.files,
      user_ver: isUser ? (user.visibleName + user.avatar) : (model.id)
    };
    const sig = JSON.stringify(sigObj);

    newIds.add(`msg-${m.id}`);
    const existingEl = document.getElementById(`msg-${m.id}`);

    // If element exists and signature matches, skip update (prevents flash)
    if (existingEl && existingEl.getAttribute('data-sig') === sig && !force) {
      return;
    }

    // Generate HTML
    let headerHtml = isUser ? escapeHTML(user.visibleName || user.nickname || 'Вы') : escapeHTML(model.name);
    let avatar = isUser ? (user.avatar || 'U') : ICONS[model.icon];

    if (m.meta?.isAdminMode) {
      const name = m.meta.adminName || 'Admin';
      headerHtml = `<span style="color:#ff6b7a;font-weight:bold;margin-right:6px;">[ADMIN]</span>${escapeHTML(name)}`;
      const av = m.meta.adminAvatar;
      if (av && av.length > 5) {
        avatar = `<img src="${escapeHTML(av)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
      } else {
        avatar = `<span style="color:#f4d35e;">${escapeHTML(av || 'A')}</span>`;
      }
    } else if (m.meta?.manual) {
      headerHtml = escapeHTML(model.name);
    }

    const toolHtml = renderToolCard(m);
    const content = String(m.content || '').trim();
    const textHtml = toolHtml ? toolHtml : (content ? `<div class="message-text">${parseMarkdown(content)}</div>` : '');

    let attachHtml = '';
    const files = Array.isArray(m.files) ? m.files : (m.file ? [m.file] : []);

    const meta = m.meta || {};
    const toolIncludesImage = meta.tool === 'image' && (meta.state === 'pending' || meta.state === 'done');
    const hasMusicTool = meta.multiTools?.some(t => t.type === 'music' && t.state === 'done') || (meta.tool === 'music' && meta.state === 'done');

    if (!toolIncludesImage && files.length) {
      attachHtml = `<div class="message-attachments">${files.map(f => {
        if (!f) return '';
        if (hasMusicTool && f.type && f.type.startsWith('audio')) return '';
        return isImageFile(f)
          ? `<img src="${f.data}" class="message-image" alt="image"/>`
          : renderFileBlock(f);
      }).join('')}</div>`;
    }

    // Include data-sig and id
    // We use single quotes for data-sig attribute to avoid escaping issues with JSON double quotes
    const safeSig = sig.replace(/'/g, "&#39;");

    // Check for Image Edit eligibility
    let editBtnHtml = '';
    if (!isUser && (m.model?.includes('nano') || attachHtml.includes('<img') || textHtml.includes('![') || textHtml.includes('<img'))) {
      editBtnHtml = `
        <div class="edit-image-btn-wrap">
          <button id="edit-btn-${m.id}" class="edit-image-btn" onclick="window.startEditImage('${m.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width:16px;height:16px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span>Изменить</span>
          </button>
        </div>
      `;
    }

    // Tools Metadata Badge
    let toolsMetaHtml = '';
    if (m.meta && m.meta.usedTools) {
      const badges = m.meta.usedTools.map(t => {
        let label = t;
        let onclick = '';
        let cls = 'tool-usage-badge';
        if (t === 'generation') label = 'Генерация';
        if (t === 'editing') {
          label = 'Изменение';
          if (m.meta.refId) {
            onclick = `onclick="window.scrollToMsg('${m.meta.refId}')"`;
            cls += ' clickable';
          }
        }
        return `<span class="${cls}" ${onclick}>${label}</span>`;
      }).join(' ');
      if (badges) toolsMetaHtml = `<div class="msg-tools-meta" style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;">${badges}</div>`;
    }

    const msgHtml = `
      <div id="msg-${m.id}" class="message ${isUser ? 'user' : 'assistant'}" data-sig='${safeSig}'>
        <div class="message-avatar ${isUser ? 'user' : ''}">${avatar}</div>
        <div class="message-body" style="position:relative;">
          <div class="message-header">${headerHtml}</div>
          ${textHtml}
          <div class="message-image-container">
            ${attachHtml}
          </div>
          ${editBtnHtml}
          ${toolsMetaHtml}
        </div>
      </div>
    `;

    if (existingEl) {
      existingEl.outerHTML = msgHtml;
    } else {
      container.insertAdjacentHTML('beforeend', msgHtml);
      // Trigger typewriter only for REALLY new assistant messages (e.g. last 15s)
      const isVeryRecent = (Date.now() - (m.createdAt || 0)) < 15000;
      if (!isUser && !animatedMessages.has(m.id) && isVeryRecent) {
        animatedMessages.add(m.id);
        const newEl = document.getElementById(`msg-${m.id}`);
        // Inject tool placeholders logic if needed, but we do it via HTML construction above
        // For Image Placeholder (Generation...):
        // If content is empty text but has pending tool

        const textEl = newEl?.querySelector('.message-text');
        // Only run typewriter if we have actual text and it's NOT just an image container?
        // Actually runTypewriter handles HTML.

        // CUSTOM LOGIC: Edit Button & Metadata
        // We need to inject the Edit button into the rendered message if needed, 
        // OR better: we reconstructed msgHtml above, so we should have modified THAT string before insertion.
        // Wait! I missed the msgHtml construction block in my previous view.
        // I need to look at lines 1758 where `msgHtml` is defined.

        if (textEl && !toolHtml) {
          runTypewriter(textEl, content, parseMarkdown(content));
        }
      }
    }
  });

  // Remove stale messages
  Array.from(container.children).forEach(el => {
    if (el.id.startsWith('msg-') && !newIds.has(el.id)) {
      el.remove();
    }
  });

  // attach shimmer observer (only visible nodes will animate)
  observeShimmers(container);
  if (nearBottom || force) container.scrollTop = container.scrollHeight;
}



window.openCodingResult = (msgId) => {
  const msgs = DB.getMessages();
  const m = msgs.find(x => x.id === msgId);
  if (!m) return showToast('Сообщение не найдено', 'error');

  const code = m.meta?.code || '';
  const file = m.meta?.fileName || 'Code';

  const titleEl = document.getElementById('coding-result-title');
  const bodyEl = document.getElementById('coding-result-body');

  if (titleEl) titleEl.textContent = `Файл: ${file}`;
  if (bodyEl) bodyEl.textContent = code;

  openModal('coding-result-modal');
};

window.sendMessage = async () => {
  // STOP Logic
  if (window.currentAbortCtrl) {
    window.currentAbortCtrl.abort();
    window.currentAbortCtrl = null;
    updateSendButtonState(false);
    // Add system message about stop? Done in catch block usually, or here.
    // If we abort, the fetch throws.
    return;
  }

  const user = DB.getCurrentUser();
  if (!user) return;

  const input = $('#message-input');
  if (!input) return;

  const plan = (user && user.plan) || 'free';
  const maxLen = plan === 'pro' ? 5000 : 2500;
  const content = String(input.value || '').trim().slice(0, maxLen);
  if (!content && !attachedFiles.length) return;

  // create chat on first message
  if (!currentChatId) {
    // Get default mode for this model
    const adminCfg = DB.getAdminConfig();
    const modelModes = adminCfg?.modelModes || {};
    const defaultMode = modelModes[currentModel] || 'auto'; // 'auto', 'manual', 'admin'
    const isAion = defaultMode === 'auto';

    const id = nowId();
    const title = content ? content.slice(0, 32) : (attachedFiles?.[0]?.name || 'Новый чат');

    // Create Chat
    const chat = {
      id,
      userId: user.id,
      name: title,
      model: currentModel,
      aion: isAion,
      mode: defaultMode,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await DB.saveChat(chat);
    currentChatId = id;
    $('#welcome-screen')?.classList.add('hidden');
    $('#messages-area')?.classList.remove('hidden');
  }

  const meta = {};

  // Collect tools
  const tools = [];
  if (currentUserTool) {
    // Map tool names to types if needed, or just use name
    // Legacy mapping: search, code, image, music match
    // code uses 'tool: code' but expects 'coding' type? No, 'code' works in existing logic.
    tools.push({ type: currentUserTool, state: 'pending' }); // or 'running'?
    // Note: Search usually needs 'running', others 'pending'.
    if (currentUserTool === 'search') tools[0].state = 'running';
    if (currentUserTool === 'music') tools[0].state = 'running';
    if (currentUserTool === 'image') tools[0].state = 'pending';
    if (currentUserTool === 'code') tools[0].state = 'pending';
  }

  if (currentUserThinking) {
    tools.push({ type: 'thinking', state: 'running', start: Date.now() });
  }

  if (tools.length) {
    meta.multiTools = tools;
    // Back-compat for single tool
    if (tools.length === 1 && !currentUserThinking) {
      meta.usedTool = currentUserTool; // display logic might use this
    }
  }

  // Handle Image Edit Metadata
  if (window.__editingRefId) {
    if (!meta.usedTools) meta.usedTools = [];
    if (!meta.usedTools.includes('generation')) meta.usedTools.push('generation');
    meta.usedTools.push('editing');
    meta.refId = window.__editingRefId;
    window.__editingRefId = null;
  }

  const msg = {
    id: nowId(),
    chatId: currentChatId,
    userId: user.id,
    role: 'user',
    content,
    model: currentModel,
    files: attachedFiles.slice(0),
    meta,
    createdAt: Date.now()
  };
  await DB.saveMessage(msg);

  // update chat updatedAt
  const chatToUpdate = DB.getChats().find(c => c.id === currentChatId);
  if (chatToUpdate) {
    await DB.saveChat({ ...chatToUpdate, updatedAt: Date.now(), model: currentModel });
  }

  input.value = '';
  input.style.height = 'auto';
  input.style.overflowY = 'hidden';
  attachedFiles = [];

  // Sticky Tool: Loop removed. Tool stays active.

  const fp = $('#file-preview');
  if (fp) fp.innerHTML = '';

  renderMessages(true);

  // AI Response Logic OR Manual Mode Waiting
  const chatNow = DB.getChats().find(c => c.id === currentChatId);
  const isAuto = (chatNow?.aion ?? true) === true;

  // Always show "Stop/Waiting" button when user sends a message.
  // For Auto: It's a real abortable generation.
  // For Manual/Admin: It's "Waiting for reply... Click to cancel".
  updateSendButtonState(true);

  if (isAuto) {
    // Start Generation State
    window.currentAbortCtrl = new AbortController();
    const modelId = currentModel;

    // Per-chat system prompt logic
    const chat = DB.getChats().find(c => c.id === currentChatId);
    const chatPrompt = chat?.systemPrompt;
    const adminCfg = DB.getAdminConfig();
    const finalSystemPrompt = chatPrompt || adminCfg?.systemPrompt || 'Ты — полезный ИИ-ассистент Mirra AI.';

    callMistralAI(currentChatId, modelId, DB.getMessages(), finalSystemPrompt);
  } else {
    // Manual Mode: We define a "virtual" abort controller to handle the "Stop" click
    window.currentAbortCtrl = new AbortController();
    // We don't call API. The button remains in "Stop" state until:
    // 1. User clicks Stop (aborts this controller)
    // 2. An external message comes in (handled in renderMessages/DB.subscribe)

    // Safety timeout? (Optional, maybe 10 mins?)
  }
};

function updateSendButtonState(generating) {
  const btn = document.getElementById('send-btn');
  if (!btn) return;
  if (generating) {
    // Purple circle with black square
    // btn.className = 'btn-icon' ?? No, custom style
    btn.innerHTML = '<div style="width:12px;height:12px;background:#000;"></div>';
    btn.style.width = '36px';
    btn.style.height = '36px';
    btn.style.padding = '0';
    btn.style.borderRadius = '50%';
    btn.style.background = '#8e43ff'; // Purple
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.title = 'Остановить';
  } else {
    // Restore
    btn.textContent = 'Отправить';
    btn.style = '';
    btn.className = 'btn primary small';
    btn.title = 'Отправить';
  }
}


async function callMistralAI(chatId, modelId, allMessages, systemPrompt) {
  const user = DB.getCurrentUser();
  const mapName = MISTRAL_MAPPING[modelId];

  // Fallback/Demo Mock if not a Mistral model or no key? 
  // User gave key, so we assume we should use it. 
  // If mapName is undefined, it might be GPT/Claude. User gave key only for Mistral.
  // I will use Mistral Key for "devstral"/"mistral" models.

  const isMistralFamily = modelId.includes('mistral') || modelId.includes('devstral') || modelId.includes('codestral') || modelId.includes('pixtral');

  if (!isMistralFamily) {
    // Mock for others
    const timerId = setTimeout(() => {
      const ai = { id: nowId(), chatId, userId: user.id, role: 'assistant', content: `[Demo] Ответ от ${MODELS[modelId]?.name} (API не подключено)`, model: modelId, createdAt: Date.now() };
      DB.saveMessage(ai);
      renderMessages(true);
      window.currentAbortCtrl = null;
      updateSendButtonState(false);
    }, 1000);

    // Support Abort for Mock
    if (window.currentAbortCtrl?.signal) {
      window.currentAbortCtrl.signal.addEventListener('abort', () => {
        clearTimeout(timerId);
      });
    }
    return;
  }

  try {
    // Show "Thinking..." state (optional, reusing print tool or just UI state)
    // Note: The UI shows "Thinking" if chat.thinking is true. 
    // We can set it?
    // setChatThinking(chatId, true, modelId); // This is in God Mode section... access it?
    // Let's just rely on async wait.

    // Gather history
    const history = allMessages.filter(m => m.chatId === chatId).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Limit history to last 10
    const limitedHistory = history.slice(-10);

    // Use the passed systemPrompt
    const finalMessages = [{ role: 'system', content: systemPrompt }, ...limitedHistory];

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: mapName || 'mistral-small-latest',
        messages: finalMessages,
        safe_prompt: false
      }),
      signal: window.currentAbortCtrl?.signal
    });

    // Image Placeholder Logic (Client Side)
    // If model name implies image, inject a temp message with "Generation..."
    // Actually, normally we'd save a "pending" message to DB.
    // But since this is a simple client, let's just assume we want the UI state.
    // The user asked for "SVG icon and Generation... text".

    // We can simulate this by manually appending to the DOM or saving a temp message.
    // Saving to DB is safer.
    let tempMsgId = null;
    const isImageModel = modelId.includes('nano') || modelId.includes('image');

    if (isImageModel) {
      tempMsgId = nowId();
      const pendingMsg = {
        id: tempMsgId,
        chatId,
        userId: user.id,
        role: 'assistant',
        content: '',
        model: modelId,
        createdAt: Date.now(),
        meta: { tool: 'image', state: 'pending' } // We use this to render the placeholder
      };
      await DB.saveMessage(pendingMsg);
      renderMessages(true);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mistral API Error Body: ", errorText);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Mistral API Response Data:", data);

    const ans = data.choices?.[0]?.message?.content || "";

    // Remove placeholder
    if (tempMsgId) {
      await DB.deleteMessage(tempMsgId);
    }

    if (!ans) {
      console.warn("Mistral API returned empty content", data);
      throw new Error("Пустой ответ от модели (см. консоль)");
    }

    const aiMsg = {
      id: nowId(),
      chatId,
      userId: user.id,
      role: 'assistant',
      content: ans,
      model: modelId,
      createdAt: Date.now()
    };

    await DB.saveMessage(aiMsg);

    // Unread & Sound Notification
    if (chatId !== currentChatId) {
      const chat = DB.getChats().find(c => c.id === chatId);
      if (chat) await DB.saveChat({ ...chat, unread: true });
    }
    playNotificationSound();

    renderMessages(true);

  } catch (err) {
    console.error(err);
    if (tempMsgId) await DB.deleteMessage(tempMsgId); // Cleanup on error

    if (err.name === 'AbortError') {
      // Save stopped status
      const stopMsg = { id: nowId(), chatId, userId: user.id, role: 'system', content: 'Генерация приостановлена пользователем', createdAt: Date.now() };
      DB.saveMessage(stopMsg);
      renderMessages(true);
    } else {
      showToast('Ошибка обращения к ИИ: ' + err.message, 'error');
    }
  } finally {
    window.currentAbortCtrl = null;
    updateSendButtonState(false);
  }
}

function setupChatEvents() {
  $('#message-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      window.sendMessage();
    }
  });

  // Auto-resize textarea
  const msgInput = $('#message-input');
  if (msgInput) {
    msgInput.addEventListener('input', function () {
      const user = DB.getCurrentUser();
      const plan = (user && user.plan) || 'free';
      const maxLen = plan === 'pro' ? 5000 : 2500;

      if (this.value.length > maxLen) {
        this.value = this.value.slice(0, maxLen);
        showToast('Достигнут лимит символов. Попробуйте отправить файл.', 'info');
      }

      this.style.height = 'auto';
      const max = 200; // Adequate max height
      if (this.scrollHeight > max) {
        this.style.height = max + 'px';
        this.style.overflowY = 'auto';
      } else {
        this.style.height = this.scrollHeight + 'px';
        this.style.overflowY = 'hidden';
      }
    });
  }

  // Ticket input (user)
  $('#ticket-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      window.sendTicketMessage();
    }
  });

  // Ticket input (admin)
  $('#admin-ticket-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      window.sendAdminTicketMessage();
    }
  });

  $('#file-input')?.addEventListener('change', async (e) => {
    const files = [...(e.target.files || [])];
    if (!files.length) return;

    const max = 3 * 1024 * 1024;
    const accepted = [];

    // read sequentially (safer for UI)
    for (const f of files) {
      if (!f) continue;
      if (f.size > max) {
        showToast(`Файл «${f.name}» больше 3 МБ`, 'error');
        continue;
      }
      const data = await new Promise((res) => {
        const reader = new FileReader();
        reader.onload = (ev) => res(String(ev.target.result || ''));
        reader.readAsDataURL(f);
      });
      accepted.push({ name: f.name, type: f.type || 'application/octet-stream', size: f.size, data });
    }

    if (!accepted.length) return;
    attachedFiles = [...attachedFiles, ...accepted].slice(0, 10); // limit count

    const fp = $('#file-preview');
    if (!fp) return;
    fp.innerHTML = attachedFiles.map((af, idx) => {
      if (isImageFile(af)) {
        return `<div class="preview-item"><img src="${af.data}" alt="preview"><button class="preview-remove" onclick="window.removeFile(${idx})">×</button></div>`;
      }
      return `<div class="message-file"><div class="file-row"><span class="file-ico">${ICONS.file}</span><span class="file-info"><span class="file-name">${escapeHTML(af.name)}</span><span class="file-size">${escapeHTML(formatBytes(af.size))}</span></span></div><div class="file-actions"><a href="${af.data}" download="${escapeHTML(af.name)}">Скачать</a></div></div>`;
    }).join('');

    // allow selecting same files again
    e.target.value = '';
  });
}

window.removeFile = (idx) => {
  if (typeof idx === 'number') attachedFiles.splice(idx, 1);
  else attachedFiles = [];
  const fp = $('#file-preview');
  if (!fp) return;
  fp.innerHTML = attachedFiles.map((af, i) => {
    if (isImageFile(af)) {
      return `<div class="preview-item"><img src="${af.data}" alt="preview"><button class="preview-remove" onclick="window.removeFile(${i})">×</button></div>`;
    }
    return `<div class="message-file"><div class="file-row"><span class="file-ico">${ICONS.file}</span><span class="file-info"><span class="file-name">${escapeHTML(af.name)}</span><span class="file-size">${escapeHTML(formatBytes(af.size))}</span></span></div><div class="file-actions"><a href="${af.data}" download="${escapeHTML(af.name)}">Скачать</a></div></div>`;
  }).join('');
};

function renderModelSelector() {
  const el = $('#model-selector');
  if (!el) return;
  const m = getSafeModel(currentModel);
  const available = getModelAvailability(m.id);

  let badgeClass;
  let badgeLabel;
  if (!available) {
    badgeClass = 'unavailable';
    badgeLabel = 'Недоступно';
  } else if (m.isPro) {
    badgeClass = 'pro';
    badgeLabel = 'PRO';
  } else {
    badgeClass = 'free';
    badgeLabel = 'FREE';
  }

  el.innerHTML = `
    <div class="model-selector-icon">${ICONS[m.icon]}</div>
    <div class="model-selector-name">${escapeHTML(m.name)}</div>
    <div class="badge ${badgeClass}">${badgeLabel}</div>
    <div class="model-selector-arrow"></div>
  `;
}

function getModelAvailability(id) {
  const map = DB.getModelAvailability();
  if (map && typeof map === 'object' && id in map) return !!map[id];
  return true;
}

// Авто-подбор доступной модели для пользователя
function autoPickModelForUser(user, preferredId) {
  const plan = (user?.plan || 'free').toLowerCase();
  const allModels = Object.values(MODELS);

  // Если предпочитаемая модель ещё доступна и подходит по плану — оставляем её
  if (preferredId && MODELS[preferredId]) {
    const pm = MODELS[preferredId];
    const available = getModelAvailability(pm.id);
    const allowedByPlan = plan === 'pro' || !pm.isPro;
    if (available && allowedByPlan) return preferredId;
  }

  // Список доступных моделей по карте доступности
  const freeAvail = allModels.filter(m => getModelAvailability(m.id) && !m.isPro);
  const proAvail = allModels.filter(m => getModelAvailability(m.id) && m.isPro);

  // Для PRO-пользователя сначала пробуем PRO, потом FREE
  if (plan === 'pro') {
    if (proAvail.length) return proAvail[0].id;
    if (freeAvail.length) return freeAvail[0].id;
  }

  // Для FREE-пользователя — только FREE, если нет ни одной доступной FREE, берём любую доступную
  if (freeAvail.length) return freeAvail[0].id;
  const anyAvail = allModels.find(m => getModelAvailability(m.id));
  if (anyAvail) return anyAvail.id;

  // На самый крайний случай — дефолтная модель
  return 'mistral-small-3.2';
}

window.toggleModelDropdown = (e) => {
  e?.stopPropagation?.();
  const dd = $('#model-dropdown');
  if (!dd) return;
  if (dd.classList.contains('active')) { dd.classList.remove('active'); return; }

  const all = Object.values(MODELS).map(m => ({ ...m, available: getModelAvailability(m.id) }));
  const freeAvail = all.filter(m => m.available && !m.isPro);
  const proAvail = all.filter(m => m.available && m.isPro);
  const unavail = all.filter(m => !m.available);
  freeAvail.sort((a, b) => a.name.localeCompare(b.name));
  proAvail.sort((a, b) => a.name.localeCompare(b.name));
  unavail.sort((a, b) => a.name.localeCompare(b.name));
  const list = [...freeAvail, ...proAvail, ...unavail];

  dd.innerHTML = `<div class="model-dropdown-grid">
    ${list.map(m => {
    const badge = m.available ? (m.isPro ? '<span class="badge pro">PRO</span>' : '<span class="badge free">FREE</span>') : '<span class="badge unavailable">Недоступно</span>';
    return `
        <div class="model-option ${m.id === currentModel ? 'active' : ''} ${m.available ? '' : 'disabled'}" onclick="window.selectModel('${m.id}')">
          <div class="model-option-top">
            <div class="model-option-left">
              <div class="model-option-icon">${ICONS[m.icon]}</div>
              <div class="model-option-info"><div class="model-option-name">${escapeHTML(m.name)}</div></div>
            </div>
            ${badge}
          </div>
        </div>
      `;
  }).join('')}
  </div>`;

  dd.classList.add('active');
  const rect = $('#model-selector')?.getBoundingClientRect?.();
  if (rect) {
    dd.style.top = (rect.bottom + 10) + 'px';
    dd.style.left = Math.max(10, Math.min(rect.left, window.innerWidth - dd.offsetWidth - 10)) + 'px';
  }
};

window.selectModel = (id) => {
  if (!getModelAvailability(id)) {
    showToast('Эта модель сейчас недоступна', 'error');
    return;
  }

  const m = MODELS[id];
  const user = DB.getCurrentUser();
  if (m.isPro && user?.plan !== 'pro') {
    showToast('Эта модель доступна только по подписке PRO', 'error');
    return;
  }

  currentModel = id;
  renderModelSelector();
  $('#model-dropdown')?.classList.remove('active');
};

document.addEventListener('click', () => {
  $('#model-dropdown')?.classList.remove('active');
});

window.startEditImage = (msgId) => {
  // Set global reference
  window.__editingRefId = msgId;

  // Select Image Tool
  window.toggleUserTool('image');

  // Highlight the edit button
  const btn = document.getElementById(`edit-btn-${msgId}`);
  if (btn) {
    // Remove other highlights?
    $$('.edit-image-btn').forEach(b => b.classList.remove('active-blue'));
    btn.classList.add('active-blue');
  }

  // Focus input
  $('#message-input')?.focus();
};

window.scrollToMsg = (msgId) => {
  const el = document.getElementById(`msg-${msgId}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('highlight-yellow');
    void el.offsetWidth; // trigger reflow
    el.classList.add('highlight-yellow');
  }
};

// ==================== TICKETS (USER) ====================
let currentTicketId = null;
let ticketFiles = [];

window.openTickets = () => {
  openModal('tickets-modal');
  renderTicketsList();
};

function renderTicketsList() {
  const user = DB.getCurrentUser();
  const el = $('#tickets-list');
  if (!user || !el) return;
  const tickets = DB.getTickets().filter(t => t.userId === user.id).slice();
  tickets.sort((a, b) => {
    const aa = a.status === 'canceled' ? 1 : 0;
    const bb = b.status === 'canceled' ? 1 : 0;
    if (aa !== bb) return aa - bb;
    return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
  });

  if (!tickets.length) {
    el.innerHTML = '<div class="empty-state">Нет тикетов</div>';
    $('#tickets-empty')?.classList.remove('hidden');
    $('#ticket-view')?.classList.add('hidden');
    return;
  }

  el.innerHTML = tickets.map(t => {
    const st = t.status || 'open';
    const canceled = st === 'canceled';
    return `
      <button class="god-chat-item ticket-item ${canceled ? 'canceled' : ''}" onclick="window.openTicket('${t.id}')">
        <div class="god-chat-info">
          <div class="god-chat-name">${escapeHTML(t.title || 'Тикет')}</div>
          <div class="ticket-meta">${escapeHTML(st.toUpperCase())}</div>
        </div>
      </button>
    `;
  }).join('');
}

window.createTicket = () => {
  const user = DB.getCurrentUser();
  if (!user) return;
  const title = prompt('Название тикета:') || 'Тикет';
  const id = nowId();
  const t = { id, userId: user.id, title: title.slice(0, 60), status: 'open', createdAt: Date.now(), updatedAt: Date.now() };
  DB.saveTicket(t);
  currentTicketId = id;
  renderTicketsList();
  window.openTicket(id);
};

window.openTicket = (id) => {
  currentTicketId = id;
  const t = DB.getTickets().find(x => x.id === id);
  if (!t) return;
  $('#tickets-empty')?.classList.add('hidden');
  $('#ticket-view')?.classList.remove('hidden');
  $('#ticket-title').textContent = t.title || 'Тикет';
  $('#ticket-status').textContent = `Статус: ${(t.status || 'open').toUpperCase()}`;

  // button state
  const btn = $('#ticket-cancel-btn');
  const input = $('#ticket-input');
  const sendBtn = $('#ticket-send-btn');
  const st = t.status || 'open';
  if (btn) {
    if (st === 'canceled') { btn.textContent = 'Восстановить'; btn.className = 'btn success small'; btn.onclick = () => window.restoreCurrentTicket(); }
    else { btn.textContent = 'Отменить'; btn.className = 'btn danger small'; btn.onclick = () => window.cancelCurrentTicket(); }
    btn.style.display = st === 'closed' ? 'none' : 'inline-flex';
  }
  const canWrite = st === 'open';
  if (input) input.disabled = !canWrite;
  if (sendBtn) sendBtn.disabled = !canWrite;

  renderTicketMessages();
};

function renderTicketMessages() {
  const user = DB.getCurrentUser();
  const el = $('#ticket-messages');
  if (!user || !el || !currentTicketId) return;
  const msgs = DB.getTicketMessages().filter(m => m.ticketId === currentTicketId).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  el.innerHTML = msgs.map(m => {
    const isUser = m.role === 'user';
    const header = isUser ? (user.visibleName || user.nickname) : 'Администратор';
    const body = String(m.content || '').trim();
    const text = body ? `<div class="god-message-text">${parseMarkdown(body)}</div>` : '';
    let attach = '';
    const files = Array.isArray(m.files) ? m.files : (m.file ? [m.file] : []);
    if (files.length) {
      attach = files.map(f => {
        if (!f) return '';
        return isImageFile(f)
          ? `<img class="god-message-image" src="${f.data}" alt="image"/>`
          : renderFileBlock(f);
      }).join('');
    }
    return `<div class="god-message ${isUser ? 'user' : 'ai'}"><div class="god-message-header"><span class="god-message-role">${escapeHTML(header)}</span></div>${text}${attach}</div>`;
  }).join('');
  el.scrollTop = el.scrollHeight;
}

window.handleTicketFileSelect = async (e) => {
  const files = [...(e.target.files || [])];
  if (!files.length) return;

  const max = 3 * 1024 * 1024;
  const accepted = [];
  for (const f of files) {
    if (!f) continue;
    if (f.size > max) {
      showToast(`Файл «${f.name}» больше 3 МБ`, 'error');
      continue;
    }
    const data = await new Promise((res) => {
      const reader = new FileReader();
      reader.onload = (ev) => res(String(ev.target.result || ''));
      reader.readAsDataURL(f);
    });
    accepted.push({ name: f.name, type: f.type || 'application/octet-stream', size: f.size, data });
  }

  if (!accepted.length) return;
  ticketFiles = [...ticketFiles, ...accepted].slice(0, 10);
  window.renderTicketFilePreview();
  e.target.value = '';
};

window.renderTicketFilePreview = () => {
  const box = $('#ticket-file-preview');
  if (!box) return;
  box.innerHTML = ticketFiles.map((tf, idx) => {
    if (isImageFile(tf)) {
      return `<div class="preview-item"><img src="${tf.data}" alt="preview"><button class="preview-remove" onclick="window.removeTicketFile(${idx})">×</button></div>`;
    }
    return `<div class="message-file"><div class="file-row"><span class="file-ico">${ICONS.file}</span><span class="file-info"><span class="file-name">${escapeHTML(tf.name)}</span><span class="file-size">${escapeHTML(formatBytes(tf.size))}</span></span></div><div class="file-actions"><a href="${tf.data}" download="${escapeHTML(tf.name)}">Скачать</a></div></div>`;
  }).join('');
};

window.removeTicketFile = (idx) => {
  if (typeof idx === 'number') ticketFiles.splice(idx, 1);
  else ticketFiles = [];
  window.renderTicketFilePreview();
};

window.sendTicketMessage = () => {
  const user = DB.getCurrentUser();
  if (!user || !currentTicketId) return;
  const ticket = DB.getTickets().find(t => t.id === currentTicketId);
  if (!ticket || ticket.status !== 'open') return showToast('Тикет закрыт/отменён', 'error');

  const input = $('#ticket-input');
  const text = String(input?.value || '').trim();
  if (!text && !ticketFiles.length) return;

  const msg = { id: nowId(), ticketId: currentTicketId, userId: user.id, role: 'user', content: text, files: ticketFiles.slice(0), createdAt: Date.now() };
  DB.saveTicketMessage(msg);

  // update ticket
  const t = DB.getTickets().find(t => t.id === currentTicketId);
  if (t) DB.saveTicket({ ...t, updatedAt: Date.now() });

  if (input) input.value = '';
  ticketFiles = [];
  window.renderTicketFilePreview?.();
  renderTicketMessages();
};

window.cancelCurrentTicket = () => {
  if (!currentTicketId) return;
  const t = DB.getTickets().find(t => t.id === currentTicketId);
  if (t) DB.saveTicket({ ...t, status: 'canceled', updatedAt: Date.now() });
  renderTicketsList();
  window.openTicket(currentTicketId);
};

window.restoreCurrentTicket = () => {
  if (!currentTicketId) return;
  const t = DB.getTickets().find(t => t.id === currentTicketId);
  if (t) DB.saveTicket({ ...t, status: 'open', updatedAt: Date.now() });
  renderTicketsList();
  window.openTicket(currentTicketId);
};

// ==================== TOOL RESULT MODALS (USER VIEW) ====================
window.openCodingResult = (msgId) => {
  try {
    const msg = DB.getMessages().find(m => m.id === msgId);
    const code = String(msg?.meta?.code || '').trim();
    const fileName = String(msg?.meta?.fileName || 'file');
    const titleEl = document.getElementById('coding-result-title');
    const bodyEl = document.getElementById('coding-result-body');
    if (titleEl) titleEl.textContent = `Создано: ${fileName}`;
    if (bodyEl) bodyEl.textContent = code || '(пусто)';
    window.openModal('coding-result-modal');
  } catch (e) {
    console.error(e);
    showToast('Не удалось открыть результат', 'error');
  }
};

// Просмотр изображения в крупном виде (для всех картинок в чатах / God Mode / тикетах)
window.openImageModal = (src) => {
  try {
    const img = document.getElementById('image-viewer-img');
    if (!img || !src) return;
    img.src = src;
    openModal('image-viewer-modal');
  } catch (e) {
    console.error(e);
  }
};

document.addEventListener('click', (e) => {
  const img = e.target?.closest?.('.message-image, .god-message-image, .tool-image-preview');
  if (!img) return;
  const src = img.getAttribute('src');
  if (!src) return;
  window.openImageModal(src);
});

// ==================== ADMIN (PANEL) ====================
window.openAdminGate = () => openModal('admin-gate-modal');
// ==================== PROFILE ====================
window.renderProfile = () => {
  // Logic for renders
  const user = DB.getCurrentUser();

  // Admin Button Logic
  // Admin Button Logic - Toggle ALL admin-only elements
  const admBtns = document.querySelectorAll('.admin-only');
  const gatewayBtn = document.querySelector('.admin-enter-only'); // Gate button (for login)
  admBtns.forEach(btn => {
    if (user && user.isAdmin) {
      btn.style.display = 'inline-flex';
      btn.classList.remove('hidden');
    } else {
      btn.style.display = 'none';
      btn.classList.add('hidden');
    }
  });

  // Gateway button allows entering password to BECOME admin
  if (gatewayBtn) {
    if (user && user.isAdmin) {
      // If already admin, we don't need gateway, we have panel link
      gatewayBtn.style.display = 'none';
    } else {
      gatewayBtn.style.display = 'inline-flex';
      gatewayBtn.classList.remove('hidden');
      gatewayBtn.onclick = () => window.openAdminGate();
    }
  }// Profile Modal Content
  const pName = document.querySelector('.profile-card-name');
  const pNick = document.querySelector('.profile-card-nickname .user-nickname');
  const pId = document.querySelector('.profile-card-id .user-id');
  const pPlan = document.querySelector('.profile-card-plan .user-plan');
  const pAvatar = document.querySelector('.profile-avatar-large');

  if (user) {
    if (pName) pName.textContent = user.visibleName || user.nickname || 'User';
    if (pNick) pNick.textContent = user.nickname || '';
    if (pId) pId.textContent = user.id || '';
    if (pPlan) {
      pPlan.textContent = (user.isAdmin ? 'ADMIN' : (user.plan || 'FREE').toUpperCase());
      pPlan.className = 'user-plan badge ' + (user.isAdmin ? 'pro' : (user.plan || 'free'));
    }
    if (pAvatar) pAvatar.textContent = (user.avatar || (user.nickname || 'U')[0]).toUpperCase();
  }

  // Sidebar small profile
  const sbName = document.querySelector('.sidebar .profile-name');
  const sbPlan = document.querySelector('.sidebar .profile-plan');
  const sbAvatar = document.querySelector('.sidebar .profile-avatar');

  if (user) {
    if (sbName) sbName.textContent = user.visibleName || user.nickname || 'User';
    if (sbPlan) sbPlan.textContent = user.isAdmin ? 'ADMIN' : (user.plan || 'FREE').toUpperCase();
    if (sbAvatar) sbAvatar.textContent = (user.avatar || (user.nickname || 'U')[0]).toUpperCase();
  }
};

window.openAdminGate = () => {
  window.openModal('admin-gate-modal');
  setTimeout(() => {
    const el = document.getElementById('admin-gate-password');
    if (el) {
      el.focus();
      el.onkeydown = (e) => {
        if (e.key === 'Enter') window.checkAdminGate();
      };
    }
  }, 100);
};

window.checkAdminGate = async () => {
  const input = document.getElementById('admin-gate-password');
  const pwd = (input?.value || '').trim();
  if (!pwd) return;

  const cfg = DB.getAdminConfig();
  // Safe fallback if cfg exists but password is empty/undefined
  const real = (cfg && cfg.password) ? cfg.password : '4321';

  if (pwd === real) {
    const local = DB.getCurrentUser();
    if (local && !local.isAdmin) {
      // Upgrade user and WAIT for it to finish
      await DB.saveUser({ ...local, isAdmin: true });
    }
    ADMIN.set(true);
    showToast('Админ-доступ включён', 'success');
    location.href = 'admin.html';
  } else {
    showToast('Неверный пароль', 'error');
  }
};

window.enterAdmin = () => {
  // Alias or direct link if admin
  const user = DB.getCurrentUser();
  if (user && user.isAdmin) {
    location.href = 'admin.html';
  } else {
    window.openAdminGate();
  }
};

window.exitAdmin = () => {
  // Just clear anything locally if needed, but mainly redirect
  location.href = 'chat.html';
};

// Admin logic moved to admin.js

// Real-time print toggle

// God tools removed

// ==================== BOOT ====================
window.__mirraBoot = (async function boot() {
  await DB.init();

  // Bind forms (fallback)
  const lf = document.getElementById('login-form');
  if (lf && !lf.__bound) {
    lf.__bound = true;
    lf.addEventListener('submit', (ev) => window.handleLogin(ev));
  }
  const rf = document.getElementById('register-form');
  if (rf && !rf.__bound) {
    rf.__bound = true;
    rf.addEventListener('submit', (ev) => window.handleRegister(ev));
  }

  const path = location.pathname;
  const currentUser = DB.getCurrentUser();

  // Если пользователь уже вошёл и мы на главной/лендинге — сразу в чат
  if (!path.includes('chat.html') && !path.includes('admin.html')) {
    if (currentUser) {
      location.href = 'chat.html';
      return;
    }
  }

  if (path.includes('chat.html')) window.initChat();
  if (path.includes('admin.html')) window.initAdmin();
})();

// export for inline handlers
window.DB = DB;
window.ICONS = ICONS;
window.MODELS = MODELS;
window.showToast = showToast;
window.getSafeModel = getSafeModel;
window.ADMIN = ADMIN;
window.TOOL_ICONS = TOOL_ICONS;
window.parseMarkdown = parseMarkdown;
window.isImageFile = isImageFile;
window.renderFileBlock = renderFileBlock;
window.formatBytes = formatBytes;
window.escapeHTML = escapeHTML;
window.uiConfirm = window.uiConfirm || ((m) => Promise.resolve(confirm(m))); // fallback
window.renderToolCard = renderToolCard;
window.openCodingResult = window.openCodingResult; // logic above exposes it to window but let's be safe
// Sort & Tool Actions
window.toggleSortDropdown = () => {
  const el = $('#sort-dropdown');
  if (el) {
    if (el.style.display === 'block') el.style.display = 'none';
    else el.style.display = 'block';
  }
};
window.setSort = (val) => {
  currentSort = val;
  $('#sort-dropdown') && ($('#sort-dropdown').style.display = 'none');
  renderChatList();
};
document.addEventListener('click', (e) => {
  if (!e.target.closest('.sort-selector')) {
    const el = $('#sort-dropdown');
    if (el) el.style.display = 'none';
  }
});

// ==================== NOTIFICATIONS & CHAT SETTINGS ====================
window.toggleNotifSound = (enabled) => {
  const user = DB.getCurrentUser();
  if (user) {
    user.notifSound = enabled;
    DB.saveUser(user);
    showToast(enabled ? 'Уведомления включены' : 'Уведомления выключены', 'info');
  }
};

window.openChatSettings = () => {
  if (!currentChatId) return showToast('Сначала создайте или выберите чат', 'info');
  const chat = DB.getChats().find(c => c.id === currentChatId);
  const input = document.getElementById('chat-system-prompt');
  if (input) input.value = chat?.systemPrompt || '';
  openModal('chat-settings-modal');
};

window.saveChatSystemPrompt = async () => {
  if (!currentChatId) return;
  const prompt = document.getElementById('chat-system-prompt').value.trim();
  const chat = DB.getChats().find(c => c.id === currentChatId);
  if (chat) {
    await DB.saveChat({ ...chat, systemPrompt: prompt });
    showToast('Настройки чата сохранены', 'success');
    closeModal('chat-settings-modal');
  }
};

function playNotificationSound() {
  const user = DB.getCurrentUser();
  if (user && user.notifSound === false) return; // Disabled

  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    console.error('AudioContext error:', e);
  }
}

// toggleUserTool is defined earlier in the file (line 676)

// ==================== IMAGE EDITING HELPERS ====================
window.startEditImage = (msgId) => {
  // 1. Activate Image Tool
  if (window.currentUserTool !== 'image') {
    window.toggleUserTool('image');
  }

  // 2. Set global edit ref state (we'll store it on window for simplicity)
  window.__editingRefId = msgId;

  // 3. Highlight button
  const btn = document.querySelector(`#msg-${msgId} .edit-image-btn`);
  if (btn) btn.classList.add('active-blue');

  // 4. Toast
  showToast('Режим изменения изображения активирован', 'info');
};

window.scrollToMsg = (msgId) => {
  const el = document.getElementById(`msg-${msgId}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('highlight-yellow');
    void el.offsetWidth; // trigger reflow
    el.classList.add('highlight-yellow');
  }
};

window.playNotificationSound = function () { // Export globally
  const user = DB.getCurrentUser();
  if (user && user.notifSound === false) return; // Disabled

  try {
    // Use HTML5 Audio for background play support
    // Simple glass ping sound (Data URI)
    const audio = new Audio('data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWgAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAABAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAA//uQZAAH8AAAEAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAA//uQZAAH8AAAEAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAA//uQZAAH8AAAEAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAA///uQZAAH8AAAEAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAA');
    // Ok that was empty. Let's use a real one.
    const realBeep = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/pause.wav');
    realBeep.volume = 0.4;
    realBeep.play().catch(e => console.error("Audio Play Error:", e));
  } catch (e) {
    console.error('Audio error:', e);
  }
};
window.deleteChatUser = deleteChatUser;

// Global Exports for Admin & Utils
window.DB = DB;
window.MODELS = MODELS;
window.ICONS = ICONS;
window.TOOL_ICONS = TOOL_ICONS;
window.getSafeModel = getSafeModel;
window.formatBytes = formatBytes;
window.isImageFile = isImageFile;
window.renderFileBlock = renderFileBlock;
window.parseMarkdown = parseMarkdown;
