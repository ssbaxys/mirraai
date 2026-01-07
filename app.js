// Mirra AI — core (Firebase Realtime Database)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, off } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ==================== MODAL (EARLY EXPORT) ====================
// Экспортируем openModal/closeModal ДО инициализации DB, чтобы они были доступны сразу
const openModal = async (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('active');
  if (id === 'auth-modal') {
    await window.toggleAuthMode?.('login');
  }
};
const closeModal = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('active');
};
window.openModal = openModal;
window.closeModal = closeModal;

// ==================== CONFIG ====================
const firebaseConfig = {
  apiKey: "AIzaSyD2uNJ45g49PXxXyKZjW-2HI1hZrViPLr4",
  authDomain: "mirraai.firebaseapp.com",
  databaseURL: "https://mirraai-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mirraai",
  storageBucket: "mirraai.firebasestorage.app",
  messagingSenderId: "713154151778",
  appId: "1:713154151778:web:7bdca959ccc2b8b5b7183b",
  measurementId: "G-HNCBTNGHZW"
};

const app = initializeApp(firebaseConfig);
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

// ==================== MODELS ====================
const MODELS = {
  'gemini-3-flash': { id: 'gemini-3-flash', name: 'Gemini 3 Flash', provider: 'Google AI Studio', icon: 'google', type: 'text', isPro: false, order: 1 },
  'mistral-small-3.2': { id: 'mistral-small-3.2', name: 'Mistral Small 3.2', provider: 'Mistral AI Studio', icon: 'mistral', type: 'text', isPro: false, order: 2, apiId: 'mistral-small-2506' },
  'deepseek-v3.2': { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'DeepSeek API Cloud', icon: 'deepseek', type: 'text', isPro: false, order: 3 },
  'gpt-5.1-mini': { id: 'gpt-5.1-mini', name: 'GPT-5.1 Mini', provider: 'OpenAI API', icon: 'chatgpt', type: 'text', isPro: false, order: 4 },
  'claude-haiku-4.5': { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'Anthropic', icon: 'anthropic', type: 'text', isPro: false, order: 5 },
  'nano-banana': { id: 'nano-banana', name: 'Nano Banana', provider: 'Google AI Studio', icon: 'google', type: 'image', isPro: false, order: 6 },
  'grok-4.1-fast': { id: 'grok-4.1-fast', name: 'Grok 4.1 Fast', provider: 'xAI', icon: 'xai', type: 'text', isPro: false, order: 7 },

  'claude-opus-4.5': { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'Anthropic', icon: 'anthropic', type: 'text', isPro: true, order: 8 },
  'gemini-3-pro': { id: 'gemini-3-pro', name: 'Gemini 3 Pro', provider: 'Google AI Studio', icon: 'google', type: 'text', isPro: true, order: 9 },
  'grok-4.1-thinking': { id: 'grok-4.1-thinking', name: 'Grok 4.1 Thinking', provider: 'xAI', icon: 'xai', type: 'text', isPro: true, order: 10 },
  'mistral-large-3': { id: 'mistral-large-3', name: 'Mistral Large 3', provider: 'Mistral AI Studio', icon: 'mistral', type: 'text', isPro: true, order: 11, apiId: 'mistral-large-2512' },
  'devstral-2': { id: 'devstral-2', name: 'Devstral 2', provider: 'Mistral AI Studio', icon: 'mistral', type: 'text', isPro: true, order: 12, apiId: 'devstral-2512' },
  'gpt-5.2-pro': { id: 'gpt-5.2-pro', name: 'GPT-5.2 Pro', provider: 'OpenAI API', icon: 'chatgpt', type: 'text', isPro: true, order: 13 },
  'gpt-5.2-chat': { id: 'gpt-5.2-chat', name: 'GPT-5.2 Chat', provider: 'OpenAI API', icon: 'chatgpt', type: 'text', isPro: true, order: 14 },
  'gpt-5.1-codex': { id: 'gpt-5.1-codex', name: 'GPT-5.1 Codex', provider: 'OpenAI API', icon: 'chatgpt', type: 'text', isPro: true, order: 15 },
  'claude-sonnet-4.5': { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'Anthropic', icon: 'anthropic', type: 'text', isPro: true, order: 16 },
  'nano-banana-pro': { id: 'nano-banana-pro', name: 'Nano Banana Pro', provider: 'Google AI Studio', icon: 'google', type: 'image', isPro: true, order: 17 }
};

// ==================== CHAT SORT MODE ====================
let chatSortMode = localStorage.getItem('chatSortMode') || 'date';

window.selectChatSort = (mode) => {
  chatSortMode = mode;
  localStorage.setItem('chatSortMode', mode);
  renderChatList();
};

// ==================== HELPERS ====================
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

// Дубликат удален - chatSortMode уже объявлен выше на строке 55

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
  return MODELS[id] || MODELS['mistral-large-3'];
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
    const c = code.replace(/\n$/,'');
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

  // line breaks
  s = s.replace(/\n/g, '<br>');
  return s;
}

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
  getModelAvailability: () => DB.state.modelAvailability || {},

  setUsers: (v) => { DB.state.users = v; DB._notify(); DB.queueCommit(); },
  setChats: (v) => { DB.state.chats = v; DB._notify(); DB.queueCommit(); },
  setMessages: (v) => { DB.state.messages = v; DB._notify(); DB.queueCommit(); },
  setTickets: (v) => { DB.state.tickets = v; DB._notify(); DB.queueCommit(); },
  setTicketMessages: (v) => { DB.state.ticketMessages = v; DB._notify(); DB.queueCommit(); },
  setFolders: (v) => { DB.state.folders = v; DB._notify(); DB.queueCommit(); },
  // Доступность моделей храним как часть общего состояния, чтобы избежать конфликтов
  setModelAvailability: (v) => {
    const safe = (v && typeof v === 'object') ? v : {};
    DB.state.modelAvailability = safe;
    // сразу локально уведомляем всех подписчиков (чат, админка и т.д.)
    DB._notify();
    // а запись в Firebase пойдёт через общий commit()
    DB.queueCommit();
  },

  getCurrentUser: () => JSON.parse(localStorage.getItem('mirra_current_user') || 'null'),
  setCurrentUser: (u) => localStorage.setItem('mirra_current_user', JSON.stringify(u)),
  clearCurrentUser: () => localStorage.removeItem('mirra_current_user'),

  queueCommit() {
    clearTimeout(DB._commitTimer);
    // Моментальная синхронизация (30мс дебаунс для оптимизации серии вызовов)
    DB._commitTimer = setTimeout(() => DB.commit(), 30);
  },

  async commit() {
    try {
      DB.state.version = Date.now();
      const payload = {
        ...DB.state,
        modelAvailability: Object.entries(DB.state.modelAvailability || {}).map(([id, available]) => ({ id, available: !!available }))
      };
      await set(ref(db, REMOTE_PATH), payload);
    } catch (e) {
      console.error('Firebase Save Error:', e);
      showToast('Ошибка сохранения в Firebase', 'error');
    }
  },

  async init(timeoutMs = 6000) {
    return new Promise((resolve) => {
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        resolve(!!ok);
      };

      const t = setTimeout(() => {
        DB.online = false;
        console.warn('[DB.init] timeout: no snapshot');
        showToast('Firebase: нет ответа (проверьте правила/доступ)', 'error');
        finish(false);
      }, timeoutMs);

      try {
        if (DB._unsub) {
          try { off(ref(db, REMOTE_PATH)); } catch {}
          DB._unsub = null;
        }

        DB._unsub = onValue(
          ref(db, REMOTE_PATH),
          (snap) => {
            clearTimeout(t);
            DB.online = true;
            const data = snap.val() || {};
            DB.state = {
              users: Array.isArray(data.users) ? data.users : [],
              chats: Array.isArray(data.chats) ? data.chats : [],
              messages: Array.isArray(data.messages) ? data.messages : [],
              tickets: Array.isArray(data.tickets) ? data.tickets : [],
              ticketMessages: Array.isArray(data.ticketMessages) ? data.ticketMessages : [],
              folders: Array.isArray(data.folders) ? data.folders : [],
              modelAvailability: Array.isArray(data.modelAvailability)
                ? Object.fromEntries(data.modelAvailability.map(m => [m.id, !!m.available]))
                : (data.modelAvailability || {}),
              version: data.version || 0
            };

            // Seed admin user if missing (so login always possible)
            if (!DB.getUsers().some(u => (u.nickname || '').toLowerCase() === 'ssbaxys')) {
              const admin = {
                id: 'ssbaxys',
                nickname: 'ssbaxys',
                visibleName: 'SSbaxyS',
                password: '4321',
                role: 'admin',
                plan: 'pro',
                avatar: 'S',
                createdAt: Date.now()
              };
              DB.state.users.push(admin);
              DB.commit().catch(() => {});
            }

            DB._notify();
            finish(true);
          },
          (err) => {
            clearTimeout(t);
            DB.online = false;
            console.error('[DB.init] onValue error:', err);
            showToast('Firebase: ошибка подключения (rules?)', 'error');
            finish(false);
          }
        );
      } catch (e) {
        clearTimeout(t);
        DB.online = false;
        console.error('[DB.init] exception:', e);
        showToast('Firebase: ошибка инициализации', 'error');
        finish(false);
      }
    });
  }
};

// ==================== MODALS ====================
// IMPORTANT: openModal/closeModal уже экспортированы в начале файла (строки 7-21)
// чтобы они были доступны сразу, до инициализации DB

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
  const btn = $('#login-form button[type="submit"]');
  if (btn) btn.disabled = true;
  showToast('Проверка...', 'info');

  try {
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
    if (btn) btn.disabled = false;
  }
};

window.handleRegister = async (e) => {
  e?.preventDefault?.();
  const btn = $('#register-form button[type="submit"]');
  if (btn) btn.disabled = true;
  showToast('Проверка...', 'info');

  try {
    await ensureBoot();

    const nick = ($('#reg-nickname')?.value || '').trim();
    const pass = ($('#reg-password')?.value || '');
    const conf = ($('#reg-password-confirm')?.value || '');

    if (!nick || !pass || !conf) { showToast('Заполните все поля', 'error'); return; }
    if (pass !== conf) { showToast('Пароли не совпадают', 'error'); return; }

    const users = DB.getUsers();
    if (users.some(u => (u.nickname || '').toLowerCase() === nick.toLowerCase())) {
      showToast('Этот никнейм уже занят', 'error');
      return;
    }

    const id = Math.floor(10000 + Math.random() * 90000).toString();
    const newUser = {
      id,
      nickname: nick,
      visibleName: '',
      password: pass,
      role: 'user',
      plan: 'free',
      avatar: (nick[0] || 'U').toUpperCase(),
      createdAt: Date.now()
    };

    users.push(newUser);
    DB.setUsers(users);
    DB.setCurrentUser(newUser);
    location.href = 'chat.html';
  } catch (err) {
    console.error(err);
    showToast('Ошибка регистрации', 'error');
  } finally {
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

window.saveVisibleName = () => {
  const user = DB.getCurrentUser();
  if (!user) return;
  const val = ($('#new-visible-name')?.value || '').trim();
  const users = DB.getUsers().map(u => u.id === user.id ? ({ ...u, visibleName: val }) : u);
  DB.setUsers(users);
  const fresh = users.find(u => u.id === user.id);
  DB.setCurrentUser(fresh);
  showToast('Сохранено', 'success');
  closeModal('change-nick-modal');
};

window.saveNewPassword = () => {
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
  DB.setUsers(users);
  DB.setCurrentUser({ ...fresh, password: newP });
  showToast('Пароль изменён', 'success');
  closeModal('change-password-modal');
};

window.confirmDeleteAccount = () => {
  const user = DB.getCurrentUser();
  if (!user) return;
  const pass = ($('#delete-password')?.value || '');
  const fresh = DB.getUsers().find(u => u.id === user.id);
  if (!fresh || fresh.password !== pass) return showToast('Неверный пароль', 'error');

  // cascade delete
  const uid = user.id;
  DB.setUsers(DB.getUsers().filter(u => u.id !== uid));
  DB.setChats(DB.getChats().filter(c => c.userId !== uid));
  const chatIds = new Set(DB.getChats().filter(c => c.userId === uid).map(c => c.id));
  DB.setMessages(DB.getMessages().filter(m => m.userId !== uid && !chatIds.has(m.chatId)));
  DB.setTickets(DB.getTickets().filter(t => t.userId !== uid));
  const ticketIds = new Set(DB.getTickets().filter(t => t.userId === uid).map(t => t.id));
  DB.setTicketMessages(DB.getTicketMessages().filter(m => m.userId !== uid && !ticketIds.has(m.ticketId)));

  DB.clearCurrentUser();
  showToast('Аккаунт удалён', 'success');
  location.href = 'index.html';
};

// ==================== CHAT ====================
let currentChatId = null;
let currentModel = 'mistral-large-3';
let attachedFiles = [];
let _chatUnsub = null;
let _messagesHTMLCache = '';
let selectedUserTool = null;

window.initChat = function () {
  if (window.__chatInited) return;
  window.__chatInited = true;

  const user = DB.getCurrentUser();
  if (!user) { location.href = 'index.html'; return; }

  DB.subscribe(() => {
    try {
      renderProfile();
      renderChatList();
      if (currentChatId) renderMessages();

      // Проверяем доступность текущей модели при изменении
      const user = DB.getCurrentUser();
      if (user && currentChatId) {
        const chat = DB.getChats().find(c => c.id === currentChatId);
        if (chat) {
          const validModel = ensureChatModelValid(chat, user);
          if (validModel !== currentModel) {
            currentModel = validModel;
            const updated = DB.getChats().map(c => c.id === chat.id ? ({ ...c, model: validModel }) : c);
            DB.setChats(updated);
            renderModelSelector();
            showToast('Модель переключена на доступную', 'success');
          }
        }
      }
      renderModelSelector();
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

function sortChatsForUser(chats) {
  // сортировка по глобальному режиму
  return chats.slice().sort((a, b) => {
    if (chatSortMode === 'alpha') {
      return (a.name || '').localeCompare(b.name || '');
    }
    if (chatSortMode === 'messages') {
      const ma = DB.getMessages().filter(m => m.chatId === a.id).length;
      const mb = DB.getMessages().filter(m => m.chatId === b.id).length;
      return mb - ma;
    }
    // date (по умолчанию): новые сверху
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });
}

function renderChatList() {
  const user = DB.getCurrentUser();
  const listEl = $('#chat-list');
  if (!user || !listEl) return;

  const rawChats = DB.getChats().filter(c => c.userId === user.id);

  // Разбиваем на папки и чаты вне папок
  const folders = DB.getFolders().filter(f => f.userId === user.id);
  const folderMap = new Map();
  folders.forEach(f => { folderMap.set(f.id, f); });

  // чаты, не находящиеся в папках
  const chatsOutside = rawChats.filter(c => !c.folderId);

  const sortedOutside = sortChatsForUser(chatsOutside);
  const sortedFolders = folders.slice().sort((a,b) => (b.updatedAt||0)-(a.updatedAt||0));

  if (!rawChats.length) {
    listEl.innerHTML = '<div class="empty-state">Нет диалогов</div>';
    return;
  }

  const renderChatItem = (chat) => {
    const model = getSafeModel(chat.model);
    const msgsCount = DB.getMessages().filter(m => m.chatId === chat.id).length;
    return `
      <div class="chat-item ${chat.id === currentChatId ? 'active' : ''}"
           draggable="true"
           ondragstart="window.onChatDragStart(event, '${chat.id}')"
           ondragover="window.onChatDragOver(event)"
           ondragleave="window.onChatDragLeave(event)"
           ondrop="window.onChatDrop(event, '${chat.id}')"
           onclick="window.openChat('${chat.id}')">
        <div class="chat-item-icon">${ICONS[model.icon]}</div>
        <div class="chat-item-info">
          <div class="chat-item-name">${escapeHTML(chat.name || 'Диалог')}</div>
          <div class="chat-item-model">${escapeHTML(model.name)} · ${msgsCount} сообщений</div>
        </div>
      </div>
    `;
  };

  const renderFolder = (folder) => {
    const folderChats = rawChats.filter(c => c.folderId === folder.id);
    const sortedChats = sortChatsForUser(folderChats);
    const isOpen = folder.isOpen !== false;
    return `
      <div class="folder-item ${isOpen ? 'open' : ''}" draggable="true"
           ondragstart="window.onFolderDragStart(event, '${folder.id}')"
           ondragover="window.onChatDragOver(event)"
           ondragleave="window.onChatDragLeave(event)"
           ondrop="window.onFolderDrop(event, '${folder.id}')">
        <div class="folder-header" onclick="window.toggleFolder('${folder.id}')">
          <div class="folder-icon">${isOpen ? '📂' : '📁'}</div>
          <div class="folder-name">${escapeHTML(folder.name || 'Папка')}</div>
          <div class="folder-count">${folderChats.length}</div>
          <button class="folder-edit" onclick="window.renameFolder(event, '${folder.id}')">✎</button>
          <button class="folder-edit" onclick="window.deleteFolder(event, '${folder.id}')">🗑</button>
        </div>
        <div class="folder-chats ${isOpen ? '' : 'hidden'}" id="folder-${folder.id}-chats">
          ${sortedChats.map(renderChatItem).join('') || '<div class="empty-state">Нет чатов</div>'}
        </div>
      </div>
    `;
  };

  listEl.innerHTML = `
    <div class="sidebar-sort">
      <button class="sort-btn ${chatSortMode === 'date' ? 'active' : ''}" onclick="window.selectChatSort('date')" title="Сначала новые">📅</button>
      <button class="sort-btn ${chatSortMode === 'alpha' ? 'active' : ''}" onclick="window.selectChatSort('alpha')" title="По алфавиту">🔤</button>
      <button class="sort-btn ${chatSortMode === 'messages' ? 'active' : ''}" onclick="window.selectChatSort('messages')" title="По количеству">💬</button>
    </div>
    ${sortedOutside.map(renderChatItem).join('')}
    ${sortedFolders.map(renderFolder).join('')}
  `;
}

// ==================== DRAG AND DROP + FOLDERS ====================
let draggedChatId = null;
let draggedFolderId = null;

window.onChatDragStart = (e, chatId) => {
  draggedChatId = chatId;
  draggedFolderId = null;
  e.dataTransfer.effectAllowed = 'move';
  e.target.style.opacity = '0.4';
};

window.onFolderDragStart = (e, folderId) => {
  draggedFolderId = folderId;
  draggedChatId = null;
  e.dataTransfer.effectAllowed = 'move';
  e.target.style.opacity = '0.4';
};

window.onChatDragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
};

window.onChatDragLeave = (e) => {
  e.currentTarget.classList.remove('drag-over');
};

window.onChatDrop = (e, targetChatId) => {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove('drag-over');

  if (!draggedChatId || draggedChatId === targetChatId) {
    draggedChatId = null;
    return;
  }

  const user = DB.getCurrentUser();
  if (!user) return;

  // Создаём папку при перетаскивании чата на чат
  const draggedChat = DB.getChats().find(c => c.id === draggedChatId);
  const targetChat = DB.getChats().find(c => c.id === targetChatId);

  if (!draggedChat || !targetChat) return;

  // Если оба чата вне папок, создаём новую папку
  if (!draggedChat.folderId && !targetChat.folderId) {
    const folderId = nowId();
    const folderName = 'Новая папка';
    const folder = {
      id: folderId,
      userId: user.id,
      name: folderName,
      isOpen: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    DB.setFolders([...DB.getFolders(), folder]);

    const chats = DB.getChats().map(c => {
      if (c.id === draggedChatId || c.id === targetChatId) {
        return { ...c, folderId, updatedAt: Date.now() };
      }
      return c;
    });

    DB.setChats(chats);
    showToast('Папка создана', 'success');
    renderChatList();
  }

  draggedChatId = null;
  document.querySelectorAll('.chat-item').forEach(el => el.style.opacity = '1');
};

window.onFolderDrop = (e, targetFolderId) => {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove('drag-over');

  if (!draggedChatId) {
    draggedFolderId = null;
    return;
  }

  // Перемещаем чат в папку
  const chats = DB.getChats().map(c => {
    if (c.id === draggedChatId) {
      return { ...c, folderId: targetFolderId, updatedAt: Date.now() };
    }
    return c;
  });

  DB.setChats(chats);
  showToast('Чат перемещён', 'success');
  renderChatList();

  draggedChatId = null;
  document.querySelectorAll('.chat-item, .folder-item').forEach(el => el.style.opacity = '1');
};

document.addEventListener('dragend', () => {
  draggedChatId = null;
  draggedFolderId = null;
  document.querySelectorAll('.chat-item, .folder-item').forEach(el => {
    el.style.opacity = '1';
    el.classList.remove('drag-over');
  });
});

window.toggleFolder = (folderId) => {
  const folders = DB.getFolders().map(f => {
    if (f.id === folderId) {
      return { ...f, isOpen: !f.isOpen, updatedAt: Date.now() };
    }
    return f;
  });
  DB.setFolders(folders);
  renderChatList();
};

window.renameFolder = (e, folderId) => {
  e.stopPropagation();
  const folder = DB.getFolders().find(f => f.id === folderId);
  if (!folder) return;

  openModal('rename-folder-modal');
  const input = $('#rename-folder-input');
  if (input) input.value = folder.name || '';

  window.__renameFolderId = folderId;
};

window.confirmRenameFolder = () => {
  const folderId = window.__renameFolderId;
  if (!folderId) return;

  const input = $('#rename-folder-input');
  const newName = (input?.value || '').trim();
  if (!newName) return showToast('Введите название', 'error');

  const folders = DB.getFolders().map(f => {
    if (f.id === folderId) {
      return { ...f, name: newName, updatedAt: Date.now() };
    }
    return f;
  });

  DB.setFolders(folders);
  showToast('Папка переименована', 'success');
  closeModal('rename-folder-modal');
  renderChatList();
};

window.deleteFolder = (e, folderId) => {
  e.stopPropagation();

  openModal('confirm-delete-folder-modal');
  window.__deleteFolderId = folderId;
};

window.confirmDeleteFolder = () => {
  const folderId = window.__deleteFolderId;
  if (!folderId) return;

  // Удаляем папку и убираем folderId у всех чатов
  const folders = DB.getFolders().filter(f => f.id !== folderId);
  const chats = DB.getChats().map(c => {
    if (c.folderId === folderId) {
      const { folderId: _, ...rest } = c;
      return { ...rest, updatedAt: Date.now() };
    }
    return c;
  });

  DB.setFolders(folders);
  DB.setChats(chats);
  showToast('Папка удалена', 'success');
  closeModal('confirm-delete-folder-modal');
  renderChatList();
};

window.createChat = () => {
  currentChatId = null;
  const w = $('#welcome-screen');
  const m = $('#messages-area');
  if (w) w.classList.remove('hidden');
  if (m) m.classList.add('hidden');
};

function ensureChatModelValid(chat, user){
  const mId = chat.model;
  const model = MODELS[mId];
  const available = getModelAvailability(mId);
  const allowedByPlan = (user?.plan || 'free').toLowerCase() === 'pro' || !model?.isPro;
  if (!model || !available || !allowedByPlan) {
    return autoPickModelForUser(user, mId);
  }
  return mId;
}

window.openChat = (id) => {
  currentChatId = id;
  const chat = DB.getChats().find(c => c.id === id);
  const user = DB.getCurrentUser();
  if (chat && user) {
    const valid = ensureChatModelValid(chat, user);
    if (valid !== chat.model) {
      const updated = DB.getChats().map(c => c.id === chat.id ? ({ ...c, model: valid }) : c);
      DB.setChats(updated);
      currentModel = valid;
    } else {
      currentModel = chat.model;
    }
  }

  $('#welcome-screen')?.classList.add('hidden');
  $('#messages-area')?.classList.remove('hidden');
  renderModelSelector();
  renderMessages(true);
  // refresh thinking indicator when switching chat
  renderProfile();
};

const TOOL_ICONS = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>`,
  code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M8 9l-3 3 3 3"/><path d="M16 9l3 3-3 3"/><path d="M10 19l4-14"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><rect x="3" y="5" width="18" height="14" rx="2" ry="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
  music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`
};

// ==================== USER TOOL SELECTION ====================
window.selectUserTool = (tool) => {
  if (selectedUserTool === tool) {
    selectedUserTool = null;
  } else {
    selectedUserTool = tool;
  }

  // Update UI
  ['search', 'code', 'image', 'music'].forEach(t => {
    const btn = document.getElementById(`tool-${t}`);
    if (btn) {
      btn.classList.toggle('active', t === selectedUserTool);
    }
  });
};

function renderToolCard(msg) {
  if (!msg || msg.role !== 'assistant') return '';
  const meta = msg.meta || {};
  const tool = meta.tool;
  const state = meta.state;
  if (!tool) return '';

  const safeFile = escapeHTML(meta.fileName || 'file');
  const files = Array.isArray(msg.files) ? msg.files : (msg.file ? [msg.file] : []);

  // SEARCH
  if (tool === 'search') {
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
  }

  // CODING
  if (tool === 'coding') {
    if (state === 'pending') {
      return `
        <div class="tool-card tool-coding">
          <div class="tool-body tool-row">
            <span class="tool-ico">${TOOL_ICONS.code}</span>
            <span class="tool-shimmer-text shimmer-live">Создание<span class="tool-dots" aria-hidden="true"></span></span>
          </div>
        </div>
      `;
    }
    if (state === 'done') {
      return `
        <div class="tool-card tool-coding done">
          <div class="tool-body tool-row">
            <span class="tool-ico">${TOOL_ICONS.plus}</span>
            <button class="tool-link" onclick="window.openCodingResult('${msg.id}')">Создан ${safeFile}</button>
          </div>
        </div>
      `;
    }
  }

  // IMAGE
  if (tool === 'image') {
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
      const img = files.find(isImageFile);
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
  }

  // MUSIC
  if (tool === 'music') {
    if (state === 'generating') {
      return `
        <div class="tool-card tool-music">
          <div class="tool-body tool-music-generating">
            <span class="tool-music-icon">🎵</span>
            <span class="tool-music-text">Генерация музыки...</span>
          </div>
        </div>
      `;
    }
    if (state === 'done') {
      const audioFile = files.find(f => f && String(f.type || '').startsWith('audio/'));
      if (audioFile?.data) {
        return `
          <div class="tool-card tool-music done">
            <div class="tool-body">
              <div class="tool-music-player">
                <audio id="audio-${msg.id}" src="${audioFile.data}" preload="metadata"></audio>
                <div class="tool-music-controls">
                  <button class="tool-music-btn" onclick="window.toggleAudioPlay('${msg.id}')" id="play-btn-${msg.id}">▶</button>
                  <div class="tool-music-progress" onclick="window.seekAudio(event, '${msg.id}')">
                    <div class="tool-music-progress-bar" id="progress-${msg.id}" style="width:0%"></div>
                  </div>
                  <span class="tool-music-time" id="time-${msg.id}">0:00 / 0:00</span>
                </div>
                <a href="${audioFile.data}" download="${escapeHTML(audioFile.name || 'music.mp3')}" class="btn secondary small" style="width:100%">Скачать</a>
              </div>
            </div>
          </div>
        `;
      }
    }
  }

  return '';
}

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

function __ensureShimmerObserver(){
  if (__shimmerObs) return;
  __shimmerObs = new IntersectionObserver((entries) => {
    for (const e of entries){
      if (e.isIntersecting) __shimmerVisible.add(e.target);
      else __shimmerVisible.delete(e.target);
    }
    if (__shimmerVisible.size && !__shimmerRAF) {
      __shimmerLastTs = 0; // will be set on first tick
      __shimmerRAF = requestAnimationFrame(__shimmerTick);
    }
  }, { root: null, threshold: 0, rootMargin: '220px 0px 220px 0px' });
}

function __shimmerTick(ts){
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
    if (!el.isConnected){
      __shimmerVisible.delete(el);
      try { __shimmerObs?.unobserve?.(el); } catch {}
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

function observeShimmers(rootEl){
  __ensureShimmerObserver();
  if (!rootEl) return;
  const els = rootEl.querySelectorAll?.('.shimmer-live');
  els?.forEach?.((el) => {
    if (__shimmerObserved.has(el)) return;
    __shimmerObserved.add(el);
    __shimmerObs.observe(el);
  });
}

function renderMessages(force = false) {
  const container = $('#messages-container');
  const user = DB.getCurrentUser();
  if (!container || !currentChatId || !user) return;

  const msgs = DB.getMessages().filter(m => m.chatId === currentChatId).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  const html = msgs.map(m => {
    const isUser = m.role === 'user';
    const model = getSafeModel(m.model || currentModel);
    const header = isUser ? (user.visibleName || user.nickname || 'Вы') : model.name;
    const avatar = isUser ? (user.avatar || 'U') : ICONS[model.icon];

    const toolHtml = renderToolCard(m);

    const content = String(m.content || '').trim();
    const textHtml = toolHtml ? toolHtml : (content ? `<div class="message-text">${parseMarkdown(content)}</div>` : '');

    let attachHtml = '';
    const files = Array.isArray(m.files) ? m.files : (m.file ? [m.file] : []);

    // If tool card already includes image, do not duplicate attachments
    const meta = m.meta || {};
    const toolIncludesImage = meta.tool === 'image' && (meta.state === 'pending' || meta.state === 'done');

    if (!toolIncludesImage && files.length) {
      attachHtml = `<div class="message-attachments">${files.map(f => {
        if (!f) return '';
        return isImageFile(f)
          ? `<img src="${f.data}" class="message-image" alt="image"/>`
          : renderFileBlock(f);
      }).join('')}</div>`;
    }

    return `
      <div class="message ${isUser ? 'user' : 'assistant'}">
        <div class="message-avatar ${isUser ? 'user' : ''}">${avatar}</div>
        <div class="message-body">
          <div class="message-header">${escapeHTML(header)}</div>
          ${textHtml}
          ${attachHtml}
        </div>
      </div>
    `;
  }).join('');

  if (!force && html === _messagesHTMLCache) return;
  const nearBottom = (container.scrollHeight - container.scrollTop - container.clientHeight) < 80;
  container.innerHTML = html;
  _messagesHTMLCache = html;
  // attach shimmer observer (only visible nodes will animate)
  observeShimmers(container);
  if (nearBottom || force) container.scrollTop = container.scrollHeight;
}

window.sendMessage = async () => {
  const user = DB.getCurrentUser();
  if (!user) return;

  const input = $('#message-input');
  if (!input) return;

  const content = String(input.value || '').trim().slice(0, 2000);
  if (!content && !attachedFiles.length) return;

  // create chat on first message
  if (!currentChatId) {
    const id = nowId();
    const title = content ? content.slice(0, 32) : (attachedFiles?.[0]?.name || 'Новый чат');
    const picked = autoPickModelForUser(user, currentModel);
    currentModel = picked;
    const chat = { id, userId: user.id, name: title, model: picked, aion: true, createdAt: Date.now(), updatedAt: Date.now() };
    const chats = DB.getChats().slice();
    chats.push(chat);
    DB.setChats(chats);
    currentChatId = id;
    $('#welcome-screen')?.classList.add('hidden');
    $('#messages-area')?.classList.remove('hidden');
  }

  // убедимся, что модель чата валидна (доступна и по плану)
  const chatsAll = DB.getChats();
  const chat = chatsAll.find(c => c.id === currentChatId);
  const validModel = ensureChatModelValid(chat, user);
  if (validModel !== chat.model) {
    const updatedChats = chatsAll.map(c => c.id === chat.id ? ({ ...c, model: validModel }) : c);
    DB.setChats(updatedChats);
    currentModel = validModel;
  }

  const msg = {
    id: nowId(),
    chatId: currentChatId,
    userId: user.id,
    role: 'user',
    content,
    model: currentModel,
    files: attachedFiles.slice(0),
    createdAt: Date.now(),
    usedTool: selectedUserTool
  };
  const msgs = DB.getMessages().slice();
  msgs.push(msg);
  DB.setMessages(msgs);

  // Сброс выбранного инструмента после отправки
  selectedUserTool = null;
  ['search', 'code', 'image', 'music'].forEach(t => {
    const btn = document.getElementById(`tool-${t}`);
    if (btn) btn.classList.remove('active');
  });

  // update chat updatedAt
  const chats2 = DB.getChats().map(c => c.id === currentChatId ? ({ ...c, updatedAt: Date.now(), model: currentModel }) : c);
  DB.setChats(chats2);

  input.value = '';
  attachedFiles = [];
  const fp = $('#file-preview');
  if (fp) fp.innerHTML = '';

  renderMessages(true);

  // AI response ONLY if chat is in auto mode (aion=true)
  const chatNow = DB.getChats().find(c => c.id === currentChatId);
  const isAuto = (chatNow?.aion ?? true) === true;
  if (isAuto) {
    setTimeout(async () => {
      try {
        // Проверяем, является ли модель Mistral
        const model = MODELS[currentModel];
        if (model && model.apiId && ['mistral-small-2506', 'mistral-large-2512', 'devstral-2512'].includes(model.apiId)) {
          // Используем Mistral AI
          const chatMessages = DB.getMessages()
            .filter(m => m.chatId === currentChatId && m.role !== 'assistant')
            .slice(-10); // последние 10 сообщений для контекста

          const response = await window.callMistralAI(model.apiId, chatMessages);

          const ai = {
            id: nowId(),
            chatId: currentChatId,
            userId: user.id,
            role: 'assistant',
            content: response,
            model: currentModel,
            createdAt: Date.now()
          };
          const msgs2 = DB.getMessages().slice();
          msgs2.push(ai);
          DB.setMessages(msgs2);
          renderMessages(true);
        } else {
          // Заглушка для других моделей
          const ai = {
            id: nowId(),
            chatId: currentChatId,
            userId: user.id,
            role: 'assistant',
            content: 'Я получил ваше сообщение и обрабатываю его...',
            model: currentModel,
            createdAt: Date.now()
          };
          const msgs2 = DB.getMessages().slice();
          msgs2.push(ai);
          DB.setMessages(msgs2);
          renderMessages(true);
        }
      } catch (error) {
        console.error('AI Error:', error);
        const ai = {
          id: nowId(),
          chatId: currentChatId,
          userId: user.id,
          role: 'assistant',
          content: `Ошибка при обращении к AI: ${error.message}`,
          model: currentModel,
          createdAt: Date.now()
        };
        const msgs2 = DB.getMessages().slice();
        msgs2.push(ai);
        DB.setMessages(msgs2);
        renderMessages(true);
      }
    }, 900);
  }
};

function setupChatEvents() {
  $('#message-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      window.sendMessage();
    }
  });

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

// авто-подбор модели по доступности/плану
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
  const proAvail  = allModels.filter(m => getModelAvailability(m.id) &&  m.isPro);

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

function renderModelSelector() {
  const el = $('#model-selector');
  if (!el) return;
  // Если текущая модель недоступна или не подходит по плану — переподберём
  const user = DB.getCurrentUser();
  if (user) {
    currentModel = autoPickModelForUser(user, currentModel);
  }
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
  const proAvail  = allModels.filter(m => getModelAvailability(m.id) &&  m.isPro);

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
  freeAvail.sort((a,b) => a.name.localeCompare(b.name));
  proAvail.sort((a,b) => a.name.localeCompare(b.name));
  unavail.sort((a,b) => a.name.localeCompare(b.name));
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
  currentModel = id;
  renderModelSelector();
  $('#model-dropdown')?.classList.remove('active');
};

document.addEventListener('click', () => {
  $('#model-dropdown')?.classList.remove('active');
});

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
  tickets.sort((a,b) => {
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
  DB.setTickets([...DB.getTickets(), t]);
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
  const msgs = DB.getTicketMessages().filter(m => m.ticketId === currentTicketId).sort((a,b) => (a.createdAt||0)-(b.createdAt||0));
  el.innerHTML = msgs.map(m => {
    const isUser = m.role === 'user';
    const header = isUser ? (user.visibleName || user.nickname) : 'Администратор';
    const body = String(m.content||'').trim();
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
  DB.setTicketMessages([...DB.getTicketMessages(), msg]);
  DB.setTickets(DB.getTickets().map(t => t.id === currentTicketId ? ({ ...t, updatedAt: Date.now() }) : t));

  if (input) input.value = '';
  ticketFiles = [];
  window.renderTicketFilePreview?.();
  renderTicketMessages();
};

window.cancelCurrentTicket = () => {
  if (!currentTicketId) return;
  DB.setTickets(DB.getTickets().map(t => t.id === currentTicketId ? ({ ...t, status: 'canceled', updatedAt: Date.now() }) : t));
  renderTicketsList();
  window.openTicket(currentTicketId);
};

window.restoreCurrentTicket = () => {
  if (!currentTicketId) return;
  DB.setTickets(DB.getTickets().map(t => t.id === currentTicketId ? ({ ...t, status: 'open', updatedAt: Date.now() }) : t));
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

// ==================== AUDIO PLAYER ====================
window.toggleAudioPlay = (msgId) => {
  const audio = document.getElementById(`audio-${msgId}`);
  const btn = document.getElementById(`play-btn-${msgId}`);
  if (!audio || !btn) return;

  if (audio.paused) {
    audio.play();
    btn.textContent = '⏸';
    updateAudioProgress(msgId);
  } else {
    audio.pause();
    btn.textContent = '▶';
  }
};

function updateAudioProgress(msgId) {
  const audio = document.getElementById(`audio-${msgId}`);
  const progress = document.getElementById(`progress-${msgId}`);
  const time = document.getElementById(`time-${msgId}`);
  if (!audio || !progress || !time) return;

  const update = () => {
    if (audio.paused) return;
    const percent = (audio.currentTime / audio.duration) * 100 || 0;
    progress.style.width = percent + '%';
    time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    requestAnimationFrame(update);
  };

  audio.addEventListener('ended', () => {
    const btn = document.getElementById(`play-btn-${msgId}`);
    if (btn) btn.textContent = '▶';
    progress.style.width = '0%';
  });

  update();
}

window.seekAudio = (e, msgId) => {
  const audio = document.getElementById(`audio-${msgId}`);
  const progressBar = e.currentTarget;
  if (!audio || !progressBar) return;

  const rect = progressBar.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percent = x / rect.width;
  audio.currentTime = percent * audio.duration;
};

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ==================== ADMIN (PANEL) ====================
window.openAdminGate = () => openModal('admin-gate-modal');

window.enterAdmin = () => {
  const input = $('#admin-gate-password');
  const p = (input?.value || '').trim() || prompt('Введите пароль админа:') || '';
  if (p === '4321') {
    ADMIN.set(true);
    showToast('Админ-доступ включён', 'success');
    location.href = 'admin.html';
  } else {
    showToast('Неверный пароль', 'error');
  }
};

window.exitAdmin = () => {
  ADMIN.clear();
  showToast('Админ-доступ выключен', 'success');
  location.href = 'chat.html';
};

window.initAdmin = () => {
  if (window.__adminInited) return;
  window.__adminInited = true;

  if (!ADMIN.get()) {
    location.href = 'chat.html';
    return;
  }

  DB.subscribe(() => {
    try {
      renderAdminStats();
      renderUsersTable();
      renderAdminTicketsList();
      renderAdminModels();
    } catch (e) {
      console.error(e);
      showToast('Ошибка рендера админки', 'error');
    }
  });

  renderAdminStats();
  renderUsersTable();
  renderAdminTicketsList();
  renderAdminModels();
};

function renderAdminStats() {
  const el = $('#admin-stats');
  if (!el) return;
  const users = DB.getUsers();
  const chats = DB.getChats();
  const tickets = DB.getTickets();
  el.innerHTML = `
    <div class="stat-card"><div class="stat-value">${users.length}</div><div class="stat-label">Пользователей</div></div>
    <div class="stat-card"><div class="stat-value">${chats.length}</div><div class="stat-label">Диалогов</div></div>
    <div class="stat-card"><div class="stat-value">${tickets.length}</div><div class="stat-label">Тикетов</div></div>
  `;
}

function renderUsersTable() {
  const body = $('#users-table-body');
  if (!body) return;
  const users = DB.getUsers();
  body.innerHTML = users.map(u => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="user-cell-avatar">${escapeHTML((u.avatar || (u.nickname||'?')[0] || 'U').toUpperCase())}</div>
          <div>
            <div class="user-cell-name">${escapeHTML(u.visibleName || u.nickname || 'Без имени')}</div>
            <div class="user-cell-date">@${escapeHTML(u.nickname || '')} · ID: ${escapeHTML(u.id || '')}</div>
          </div>
        </div>
      </td>
      <td><span class="badge ${(u.plan || 'free')}">${escapeHTML((u.plan || 'free').toUpperCase())}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn small primary" onclick="window.openGodMode('${u.id}')">God Mode</button>
          <button class="btn small secondary" onclick="window.toggleUserPlan('${u.id}')">${(u.plan || 'free') === 'pro' ? 'Снять PRO' : 'Выдать PRO'}</button>
          <button class="btn small danger" onclick="window.deleteUser('${u.id}')">Удалить</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.toggleUserPlan = (id) => {
  if (!ADMIN.get()) return;

  // Приводим id к строке, чтобы не было проблем, если где-то id хранится как число
  const targetId = String(id);

  const users = DB.getUsers().map(u => {
    const uid = String(u.id ?? '');
    if (uid !== targetId) return u;
    const cur = (u.plan || 'free');
    const nextPlan = cur === 'pro' ? 'free' : 'pro';
    return { ...u, plan: nextPlan };
  });

  DB.setUsers(users);

  // Показать понятный тост, чтобы было видно, что действие сработало
  const updated = users.find(u => String(u.id ?? '') === targetId);
  if (updated) {
    const isPro = (updated.plan || 'free') === 'pro';
    showToast(`${updated.visibleName || updated.nickname || 'Пользователь'} теперь ${isPro ? 'PRO' : 'FREE'}`, 'success');
  }
};

window.deleteUser = (id) => {
  if (!ADMIN.get()) return;
  if (!confirm('Удалить пользователя и все его данные?')) return;
  // cascade
  DB.setUsers(DB.getUsers().filter(u => u.id !== id));
  const chatIds = new Set(DB.getChats().filter(c => c.userId === id).map(c => c.id));
  DB.setChats(DB.getChats().filter(c => c.userId !== id));
  DB.setMessages(DB.getMessages().filter(m => !chatIds.has(m.chatId)));
  const ticketIds = new Set(DB.getTickets().filter(t => t.userId === id).map(t => t.id));
  DB.setTickets(DB.getTickets().filter(t => t.userId !== id));
  DB.setTicketMessages(DB.getTicketMessages().filter(m => !ticketIds.has(m.ticketId)));
  showToast('Пользователь удалён', 'success');
};

// ---- Admin: models availability ----
function renderAdminModels() {
  const wrap = $('#admin-models');
  if (!wrap) return;
  const avail = DB.getModelAvailability();

  // Сортируем по order (иерархия), не меняя порядок в зависимости от доступности
  const all = Object.values(MODELS).map(m => ({ ...m, available: (m.id in avail) ? !!avail[m.id] : true }));
  const models = all.sort((a, b) => (a.order || 999) - (b.order || 999));

  wrap.innerHTML = models.map(m => {
    const on = m.available;
    return `
      <div class="model-admin-row">
        <div class="model-admin-left">
          <div class="model-admin-ico">${ICONS[m.icon]}</div>
          <div class="model-admin-info">
            <div class="model-admin-name">${escapeHTML(m.name)}</div>
            <div class="model-admin-provider">${escapeHTML(m.provider)}</div>
          </div>
        </div>
        <button class="btn small ${on ? 'success' : 'secondary'}" onclick="window.toggleModelAvailability('${m.id}')">${on ? 'Доступна' : 'Недоступна'}</button>
      </div>
    `;
  }).join('');
}

window.toggleModelAvailability = (id) => {
  if (!ADMIN.get()) return;
  const map = { ...DB.getModelAvailability() };
  const cur = (id in map) ? !!map[id] : true;
  map[id] = !cur;
  DB.setModelAvailability(map);
};

// ---- Admin: tickets list ----
let adminCurrentTicketId = null;
let adminTicketFile = null;

function renderAdminTicketsList() {
  const el = $('#admin-tickets-list');
  if (!el) return;
  const users = DB.getUsers();
  const tickets = DB.getTickets().slice();
  tickets.sort((a,b) => {
    const aa = a.status === 'canceled' ? 1 : 0;
    const bb = b.status === 'canceled' ? 1 : 0;
    if (aa !== bb) return aa - bb;
    return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
  });
  if (!tickets.length) {
    el.innerHTML = '<div class="empty-state">Нет тикетов</div>';
    return;
  }
  el.innerHTML = tickets.map(t => {
    const u = users.find(x => x.id === t.userId);
    return `
      <div class="admin-ticket-row" onclick="window.openAdminTicket('${t.id}')">
        <div class="admin-ticket-title">${escapeHTML(t.title || 'Тикет')}</div>
        <div class="admin-ticket-meta">${escapeHTML((u?.nickname || t.userId) + ' • ' + (t.status||'open').toUpperCase())}</div>
      </div>
    `;
  }).join('');
}

window.openAdminTicket = (id) => {
  adminCurrentTicketId = id;
  const t = DB.getTickets().find(x => x.id === id);
  if (!t) return;
  const u = DB.getUsers().find(x => x.id === t.userId);
  $('#admin-ticket-user').textContent = u ? `Тикет: ${u.nickname}` : 'Тикет';
  $('#admin-ticket-meta').textContent = `Статус: ${(t.status || 'open').toUpperCase()} • ${new Date(t.createdAt || Date.now()).toLocaleString()}`;
  openModal('admin-ticket-modal');
  renderAdminTicketMessages();
};

function renderAdminTicketMessages() {
  const el = $('#admin-ticket-messages');
  if (!el || !adminCurrentTicketId) return;
  const msgs = DB.getTicketMessages().filter(m => m.ticketId === adminCurrentTicketId).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
  el.innerHTML = msgs.map(m => {
    const isAdmin = m.role === 'admin';
    const header = isAdmin ? 'Администратор' : 'Пользователь';
    const content = String(m.content||'').trim();
    const text = content ? `<div class="god-message-text">${parseMarkdown(content)}</div>` : '';

    let attach = '';
    const files = Array.isArray(m.files) ? m.files : (m.file ? [m.file] : []);
    if (files.length) {
      attach = files.map(f => {
        if (!f) return '';
        return isImageFile(f) ? `<img class="god-message-image" src="${f.data}" alt="image"/>` : renderFileBlock(f);
      }).join('');
    }

    return `<div class="god-message ${isAdmin ? 'ai' : 'user'}"><div class="god-message-header"><span class="god-message-role">${escapeHTML(header)}</span></div>${text}${attach}</div>`;
  }).join('');
  el.scrollTop = el.scrollHeight;
}

window.handleAdminTicketFileSelect = (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  if (f.size > 3*1024*1024) return showToast('Макс. размер 3 МБ', 'error');
  const r = new FileReader();
  r.onload = (ev) => {
    adminTicketFile = { name: f.name, type: f.type || 'application/octet-stream', size: f.size, data: String(ev.target.result||'') };
    const box = $('#admin-ticket-file-preview');
    if (!box) return;
    if (isImageFile(adminTicketFile)) box.innerHTML = `<div class="preview-item"><img src="${adminTicketFile.data}" alt="preview"><button class="preview-remove" onclick="window.removeAdminTicketFile()">×</button></div>`;
    else box.innerHTML = `<div class="message-file"><div class="file-row"><span class="file-ico">${ICONS.file}</span><span class="file-info"><span class="file-name">${escapeHTML(adminTicketFile.name)}</span><span class="file-size">${escapeHTML(formatBytes(adminTicketFile.size))}</span></span></div><div class="file-actions"><a href="${adminTicketFile.data}" download="${escapeHTML(adminTicketFile.name)}">Скачать</a></div></div>`;
  };
  r.readAsDataURL(f);
};

window.removeAdminTicketFile = () => {
  adminTicketFile = null;
  const box = $('#admin-ticket-file-preview');
  if (box) box.innerHTML = '';
};

window.sendAdminTicketMessage = () => {
  if (!adminCurrentTicketId) return;
  const t = DB.getTickets().find(x => x.id === adminCurrentTicketId);
  if (!t || t.status !== 'open') return showToast('Тикет не открыт', 'error');
  const input = $('#admin-ticket-input');
  const text = String(input?.value||'').trim();
  if (!text && !adminTicketFile) return;
  const msg = { id: nowId(), ticketId: adminCurrentTicketId, userId: t.userId, role: 'admin', content: text, file: adminTicketFile, createdAt: Date.now() };
  DB.setTicketMessages([...DB.getTicketMessages(), msg]);
  DB.setTickets(DB.getTickets().map(x => x.id === adminCurrentTicketId ? ({ ...x, updatedAt: Date.now() }) : x));
  if (input) input.value = '';
  adminTicketFile = null;
  $('#admin-ticket-file-preview') && ($('#admin-ticket-file-preview').innerHTML = '');
  renderAdminTicketMessages();
};

window.adminCloseTicket = () => {
  if (!adminCurrentTicketId) return;
  DB.setTickets(DB.getTickets().map(t => t.id === adminCurrentTicketId ? ({ ...t, status: 'closed', updatedAt: Date.now() }) : t));
};
window.adminOpenTicket = () => {
  if (!adminCurrentTicketId) return;
  DB.setTickets(DB.getTickets().map(t => t.id === adminCurrentTicketId ? ({ ...t, status: 'open', updatedAt: Date.now() }) : t));
};
window.cancelTicketAsAdmin = () => {
  if (!adminCurrentTicketId) return;
  DB.setTickets(DB.getTickets().map(t => t.id === adminCurrentTicketId ? ({ ...t, status: 'canceled', updatedAt: Date.now() }) : t));
};
window.adminDeleteTicket = () => {
  if (!adminCurrentTicketId) return;
  if (!confirm('Удалить тикет навсегда?')) return;
  const id = adminCurrentTicketId;
  DB.setTickets(DB.getTickets().filter(t => t.id !== id));
  DB.setTicketMessages(DB.getTicketMessages().filter(m => m.ticketId !== id));
  adminCurrentTicketId = null;
  closeModal('admin-ticket-modal');
};

// ==================== GOD MODE (minimal, so admin modal not empty) ====================
let godUserId = null;
let godChatId = null;
let godFile = null;

window.openGodMode = (userId) => {
  if (!ADMIN.get()) return;
  godUserId = userId;
  godChatId = null;
  const u = DB.getUsers().find(x => x.id === userId);
  $('#god-user-name').textContent = u ? u.nickname : 'Пользователь';
  openModal('god-modal');
  renderGodChats();
  $('#god-empty-state')?.classList.remove('hidden');
  $('#god-chat-view')?.classList.add('hidden');
  syncGodToolsUI();
};

window.closeGodMode = () => {
  closeModal('god-modal');
  godUserId = null;
  godChatId = null;
  godFile = null;
  $('#god-file-preview') && ($('#god-file-preview').innerHTML = '');
};

function renderGodChats() {
  const el = $('#god-chats-list');
  if (!el || !godUserId) return;
  const chats = DB.getChats().filter(c => c.userId === godUserId).slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  el.innerHTML = chats.map(c => {
    const m = getSafeModel(c.model);
    return `
      <button class="god-chat-item" onclick="window.openGodChat('${c.id}')">
        <div class="god-chat-icon">${ICONS[m.icon]}</div>
        <div class="god-chat-info">
          <div class="god-chat-name">${escapeHTML(c.name || 'Диалог')}</div>
          <div class="god-chat-model">${escapeHTML(m.name)}</div>
        </div>
      </button>
    `;
  }).join('') || '<div class="empty-state">Нет чатов</div>';
}

window.openGodChat = (chatId) => {
  godChatId = chatId;
  $('#god-empty-state')?.classList.add('hidden');
  $('#god-chat-view')?.classList.remove('hidden');
  renderGodMessages();
  syncGodToolsUI();
  renderGodChatModeToggle();
};

function renderGodChatModeToggle(){
  const wrap = document.getElementById('god-mode-toggle');
  if (!wrap || !godChatId) return;
  const chat = DB.getChats().find(c => c.id === godChatId);
  const isAuto = (chat?.aion ?? true) === true;
  wrap.innerHTML = `
    <button class="btn small ${isAuto ? 'primary' : 'secondary'}" onclick="window.setChatAion(true)">Авто</button>
    <button class="btn small ${!isAuto ? 'primary' : 'secondary'}" onclick="window.setChatAion(false)">Ручной</button>
  `;
}

window.setChatAion = (val) => {
  if (!ADMIN.get()) return;
  if (!godChatId) return;
  const chats = DB.getChats().map(c => c.id === godChatId ? ({ ...c, aion: !!val, updatedAt: Date.now() }) : c);
  DB.setChats(chats);
  renderGodChatModeToggle();
  syncGodToolsUI();
};

function renderGodMessages() {
  const el = $('#god-messages');
  if (!el || !godChatId) return;
  const msgs = DB.getMessages().filter(m => m.chatId === godChatId).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
  el.innerHTML = msgs.map(m => {
    const isUser = m.role === 'user';
    const model = getSafeModel(m.model);
    const header = isUser ? 'Пользователь' : model.name;

    const toolHtml = renderToolCard(m);

    const content = String(m.content||'').trim();
    const text = toolHtml ? toolHtml : (content ? `<div class="god-message-text">${parseMarkdown(content)}</div>` : '');

    let attachHtml = '';
    const files = Array.isArray(m.files) ? m.files : (m.file ? [m.file] : []);

    const meta = m.meta || {};
    const toolIncludesImage = meta.tool === 'image' && (meta.state === 'pending' || meta.state === 'done');

    if (!toolIncludesImage && files.length) {
      attachHtml = files.map(f => {
        if (!f) return '';
        return isImageFile(f)
          ? `<img class="god-message-image" src="${f.data}" alt="image"/>`
          : renderFileBlock(f);
      }).join('');
    }

    let usedToolInfo = '';
    if (isUser && m.usedTool) {
      const toolNames = { search: 'Поиск', code: 'Кодинг', image: 'Фото', music: 'Музыка' };
      usedToolInfo = `<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:6px;">Использованный инструмент: ${escapeHTML(toolNames[m.usedTool] || m.usedTool)}</div>`;
    }

    return `<div class="god-message ${isUser ? 'user' : 'ai'}"><div class="god-message-header"><span class="god-message-role">${escapeHTML(header)}</span></div>${text}${attachHtml}${usedToolInfo}</div>`;
  }).join('');
  // attach shimmer observer (only visible nodes will animate)
  observeShimmers(el);
  el.scrollTop = el.scrollHeight;
  syncGodToolsUI();
}

window.handleGodFileSelect = (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  if (f.size > 3*1024*1024) return showToast('Макс. размер 3 МБ', 'error');
  const r = new FileReader();
  r.onload = (ev) => {
    godFile = { name: f.name, type: f.type || 'application/octet-stream', size: f.size, data: String(ev.target.result||'') };
    const box = $('#god-file-preview');
    if (!box) return;
    if (isImageFile(godFile)) box.innerHTML = `<div class="preview-item"><img src="${godFile.data}" alt="preview"><button class="preview-remove" onclick="window.removeGodFile()">×</button></div>`;
    else box.innerHTML = `<div class="message-file"><div class="file-row"><span class="file-ico">${ICONS.file}</span><span class="file-info"><span class="file-name">${escapeHTML(godFile.name)}</span><span class="file-size">${escapeHTML(formatBytes(godFile.size))}</span></span></div><div class="file-actions"><a href="${godFile.data}" download="${escapeHTML(godFile.name)}">Скачать</a></div></div>`;
  };
  r.readAsDataURL(f);
};

window.removeGodFile = () => {
  godFile = null;
  $('#god-file-preview') && ($('#god-file-preview').innerHTML = '');
};

window.sendGodMessage = () => {
  if (!godChatId || !godUserId) return;

  const chat = DB.getChats().find(c => c.id === godChatId);
  const isAuto = (chat?.aion ?? true) === true;
  if (isAuto) {
    showToast('Чат в режиме Авто: писать от лица ИИ нельзя. Переключите в Ручной.', 'error');
    return;
  }

  const input = $('#god-input');
  const fullText = String(input?.value || '').trim();
  if (!fullText && !godFile) return;

  const model = chat?.model || 'mistral-large-3';

  const msg = { id: nowId(), chatId: godChatId, userId: godUserId, role: 'assistant', content: fullText, model, file: godFile, createdAt: Date.now() };
  DB.setMessages([...DB.getMessages(), msg]);

  if (input) input.value = '';
  godFile = null;
  $('#god-file-preview') && ($('#god-file-preview').innerHTML = '');
  renderGodMessages();
};

// ==================== GOD MODE TOOLS (working) ====================
let godImagePicked = null;

function setGodToolActive(toolId, active) {
  const btn = document.getElementById(toolId);
  if (!btn) return;
  btn.classList.toggle('active', !!active);
}

// New tool: "Печать" (thinking status under user input)
// We mark the chat as "thinking" in DB (per-chat flag), and user UI reads it and shows nice status.

function setChatThinking(chatId, thinking, modelId) {
  const allChats = DB.getChats();
  const target = allChats.find(c => c.id === chatId);
  const uid = target?.userId;

  const chats = allChats.map(c => {
    // Обновляем выбранный чат
    if (c.id === chatId) {
      return {
        ...c,
        thinking: !!thinking,
        thinkingModel: thinking ? (modelId || c.model) : null
      };
    }
    // Если включаем "Печать" — сбрасываем thinking у других чатов этого пользователя
    if (thinking && uid && c.userId === uid && c.thinking) {
      return { ...c, thinking: false, thinkingModel: null };
    }
    return c;
  });

  DB.setChats(chats);
}

window.godToolPrint = () => {
  if (!ADMIN.get()) return;
  if (!godChatId) return showToast('Сначала выберите чат', 'error');
  const chats = DB.getChats();
  const chat = chats.find(c => c.id === godChatId);
  if (!chat) return;
  const now = !chat.thinking;
  setChatThinking(godChatId, now, chat.model);
  setGodToolActive('god-tool-print', now);
};

// Real-time print toggle

function findLatestToolMsg(chatId, tool, states) {
  if (!chatId) return null;
  const wanted = Array.isArray(states) ? states : [states];
  const msgs = DB.getMessages()
    .filter(m => m.chatId === chatId && m.role === 'assistant' && m.meta && m.meta.tool === tool && wanted.includes(m.meta.state))
    .slice()
    .sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
  return msgs[0] || null;
}

function patchMessage(id, patch) {
  const msgs = DB.getMessages().slice();
  const idx = msgs.findIndex(m => m.id === id);
  if (idx < 0) return false;
  const cur = msgs[idx];
  const next = { ...cur, ...patch };
  if (patch && typeof patch === 'object' && patch.meta) {
    next.meta = { ...(cur.meta || {}), ...(patch.meta || {}) };
  }
  msgs[idx] = next;
  DB.setMessages(msgs);
  return true;
}

function syncGodToolsUI() {
  // Нет выбранного чата в God Mode — все тулзы считаем выключенными
  if (!godChatId) {
    setGodToolActive('god-tool-search', false);
    setGodToolActive('god-tool-coding', false);
    setGodToolActive('god-tool-image', false);
    setGodToolActive('god-tool-print', false);
    return;
  }

  // Поиск / Кодинг / Генерация изображения берём из сообщений-инструментов
  setGodToolActive('god-tool-search', !!findLatestToolMsg(godChatId, 'search', 'running'));
  setGodToolActive('god-tool-coding', !!findLatestToolMsg(godChatId, 'coding', 'pending'));
  setGodToolActive('god-tool-image', !!findLatestToolMsg(godChatId, 'image', ['running','pending']));

  // Печать (thinking) берём из самого чата
  const chat = DB.getChats().find(c => c.id === godChatId);
  setGodToolActive('god-tool-print', !!chat?.thinking);
}

// Поиск: 1-й клик -> "Поиск в интернете..." (running), 2-й клик -> "Поиск завершен" (done)
window.godToolSearch = () => {
  if (!ADMIN.get()) return;
  if (!godChatId || !godUserId) return showToast('Сначала выберите чат', 'error');

  const running = findLatestToolMsg(godChatId, 'search', 'running');
  if (running) {
    patchMessage(running.id, { content: 'Поиск завершен', meta: { tool: 'search', state: 'done' } });
    setGodToolActive('god-tool-search', false);
    renderGodMessages();
    return;
  }

  const chat = DB.getChats().find(c => c.id === godChatId);
  const model = chat?.model || 'mistral-large-3';
  const msg = {
    id: nowId(),
    chatId: godChatId,
    userId: godUserId,
    role: 'assistant',
    content: 'Поиск в интернете...',
    model,
    meta: { tool: 'search', state: 'running' },
    createdAt: Date.now()
  };
  DB.setMessages([...DB.getMessages(), msg]);
  setGodToolActive('god-tool-search', true);
  renderGodMessages();
};

// Кодинг: 1) открыть модалку -> "Готово" создаёт Create(file)... (pending)
// 2) второй клик по кнопке "Кодинг" финализирует: Created(file) + раскрываемый код
window.godToolCoding = () => {
  if (!ADMIN.get()) return;
  if (!godChatId || !godUserId) return showToast('Сначала выберите чат', 'error');

  const pending = findLatestToolMsg(godChatId, 'coding', 'pending');
  if (pending) {
    const fileName = pending.meta?.fileName || 'file';
    patchMessage(pending.id, { content: `Created (${fileName})`, meta: { tool: 'coding', state: 'done' } });
    setGodToolActive('god-tool-coding', false);
    renderGodMessages();
    return;
  }

  // start config
  $('#god-coding-title') && ($('#god-coding-title').value = '');
  $('#god-coding-content') && ($('#god-coding-content').value = '');
  openModal('god-coding-modal');
};

window.godCodingDone = () => {
  if (!ADMIN.get()) return;
  if (!godChatId || !godUserId) return;
  const title = ($('#god-coding-title')?.value || '').trim() || 'index.html';
  const code = String($('#god-coding-content')?.value || '').slice(0, 20000);
  if (!code.trim()) return showToast('Вставьте содержимое', 'error');

  const chat = DB.getChats().find(c => c.id === godChatId);
  const model = chat?.model || 'mistral-large-3';
  const msg = {
    id: nowId(),
    chatId: godChatId,
    userId: godUserId,
    role: 'assistant',
    content: `Create (${title})...`,
    model,
    meta: { tool: 'coding', state: 'pending', fileName: title, code },
    createdAt: Date.now()
  };
  DB.setMessages([...DB.getMessages(), msg]);
  closeModal('god-coding-modal');
  setGodToolActive('god-tool-coding', true);
  renderGodMessages();
};

// Генерация изображения: 1) клик -> создаём "Генерация изображения..." (running) + открываем модалку
// "Готово" прикрепляет изображение в тот же msg (pending)
// 2) второй клик по кнопке финализирует: state=done, текст "Генерация изображения завершена"
window.godToolImage = () => {
  if (!ADMIN.get()) return;
  if (!godChatId || !godUserId) return showToast('Сначала выберите чат', 'error');

  const pending = findLatestToolMsg(godChatId, 'image', ['running','pending']);
  if (pending && pending.meta?.state === 'pending') {
    patchMessage(pending.id, { content: 'Генерация изображения завершена', meta: { tool: 'image', state: 'done' } });
    setGodToolActive('god-tool-image', false);
    renderGodMessages();
    return;
  }

  // create running placeholder and open modal
  const chat = DB.getChats().find(c => c.id === godChatId);
  const model = chat?.model || 'mistral-large-3';
  const msg = {
    id: nowId(),
    chatId: godChatId,
    userId: godUserId,
    role: 'assistant',
    content: 'Генерация изображения...',
    model,
    meta: { tool: 'image', state: 'running' },
    createdAt: Date.now()
  };
  DB.setMessages([...DB.getMessages(), msg]);
  setGodToolActive('god-tool-image', true);
  renderGodMessages();

  // reset modal state
  godImagePicked = null;
  const prev = $('#god-image-modal-preview');
  if (prev) prev.innerHTML = '';
  const input = $('#god-image-modal-input');
  if (input) input.value = '';
  openModal('god-image-modal');
};

window.handleGodToolImagePick = (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  if (f.size > 3 * 1024 * 1024) return showToast('Макс. размер 3 МБ', 'error');
  if (!String(f.type || '').startsWith('image/')) return showToast('Нужно выбрать изображение', 'error');
  const r = new FileReader();
  r.onload = (ev) => {
    godImagePicked = { name: f.name, type: f.type || 'image/png', size: f.size, data: String(ev.target.result || '') };
    const prev = $('#god-image-modal-preview');
    if (prev) prev.innerHTML = `<img src="${godImagePicked.data}" style="width:100%;max-height:280px;object-fit:contain;border-radius:12px;border:1px solid rgba(255,255,255,0.12)" alt="preview"/>`;
  };
  r.readAsDataURL(f);
};

window.godImageDone = () => {
  if (!ADMIN.get()) return;
  if (!godChatId) return;
  if (!godImagePicked) return showToast('Сначала выберите фото', 'error');

  // attach image to latest running message
  const running = findLatestToolMsg(godChatId, 'image', 'running');
  if (running) {
    patchMessage(running.id, { files: [godImagePicked], meta: { tool: 'image', state: 'pending' } });
  }
  closeModal('god-image-modal');
  renderGodMessages();
};

// ==================== GOD MODE: MUSIC TOOL ====================
let godMusicPicked = null;

window.godToolMusic = () => {
  if (!ADMIN.get()) return;
  if (!godChatId || !godUserId) return showToast('Сначала выберите чат', 'error');

  const pending = findLatestToolMsg(godChatId, 'music', 'generating');
  if (pending) {
    patchMessage(pending.id, { meta: { tool: 'music', state: 'done' } });
    setGodToolActive('god-tool-music', false);
    renderGodMessages();
    return;
  }

  // create generating placeholder and open modal
  const chat = DB.getChats().find(c => c.id === godChatId);
  const model = chat?.model || 'mistral-large-3';
  const msg = {
    id: nowId(),
    chatId: godChatId,
    userId: godUserId,
    role: 'assistant',
    content: 'Генерация музыки...',
    model,
    meta: { tool: 'music', state: 'generating' },
    createdAt: Date.now()
  };
  DB.setMessages([...DB.getMessages(), msg]);
  setGodToolActive('god-tool-music', true);
  renderGodMessages();

  // reset modal state
  godMusicPicked = null;
  const prev = $('#god-music-modal-preview');
  if (prev) prev.innerHTML = '';
  const input = $('#god-music-modal-input');
  if (input) input.value = '';
  openModal('god-music-modal');
};

window.handleGodToolMusicPick = (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  if (f.size > 3 * 1024 * 1024) return showToast('Макс. размер 3 МБ', 'error');
  if (!String(f.type || '').startsWith('audio/')) return showToast('Нужно выбрать аудиофайл', 'error');
  const r = new FileReader();
  r.onload = (ev) => {
    godMusicPicked = { name: f.name, type: f.type || 'audio/mpeg', size: f.size, data: String(ev.target.result || '') };
    const prev = $('#god-music-modal-preview');
    if (prev) prev.innerHTML = `<div style="padding:12px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:8px;font-size:13px;">📁 ${escapeHTML(f.name)} (${formatBytes(f.size)})</div>`;
  };
  r.readAsDataURL(f);
};

window.godMusicDone = () => {
  if (!ADMIN.get()) return;
  if (!godChatId) return;
  if (!godMusicPicked) return showToast('Сначала выберите аудио', 'error');

  // attach audio to latest generating message
  const generating = findLatestToolMsg(godChatId, 'music', 'generating');
  if (generating) {
    patchMessage(generating.id, { files: [godMusicPicked], meta: { tool: 'music', state: 'done' } });
  }
  closeModal('god-music-modal');
  renderGodMessages();
};

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
  if (path === '/' || path.includes('index.html')) window.initIndex();
})();

// export for inline handlers
window.DB = DB;
window.ICONS = ICONS;
window.MODELS = MODELS;
window.showToast = showToast;
window.getSafeModel = getSafeModel;

// ==================== INDEX PAGE ====================
window.initIndex = function() {
  if (window.__indexInited) return;
  window.__indexInited = true;

  const user = DB.getCurrentUser();
  if (user) {
    location.href = 'chat.html';
    return;
  }

  // Страница уже готова, модальные окна работают
  console.log('Index page initialized, openModal available:', typeof window.openModal);
};
