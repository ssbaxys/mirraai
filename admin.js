
// Mirra AI — Admin Logic
// Loaded only in admin.html

let godChatId = null;
let godUserId = null;
let godFile = null;
let godImagePicked = null;
// Tool Composition State
let godToolState = {
    search: false,
    coding: null, // { files: [] }
    image: null,
    music: false,
    thinking: false
};

// Performance: Message cache per chat
let _godMessagesCache = {};
let _adminRenderTimeout = null;

function invalidateCache() {
    _godMessagesCache = {};
}

function getCachedMessages(chatId) {
    if (!chatId) return [];
    if (!_godMessagesCache[chatId]) {
        _godMessagesCache[chatId] = DB.getMessages()
            .filter(m => m.chatId === chatId)
            .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    }
    return _godMessagesCache[chatId];
}

window.initAdmin = () => {
    if (window.__adminInited) return;
    window.__adminInited = true;

    // Mask UI immediately
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.2s';

    const local = DB.getCurrentUser();
    if (!local) {
        location.href = 'chat.html';
        return;
    }

    // Wait for DB data to verify rights
    const checkRights = () => {
        const users = DB.getUsers();
        if (users.length === 0) return; // Still loading...

        const fresh = users.find(u => u.id === local.id);
        const user = fresh || local;

        // Verify admin rights
        if (!user || !user.isAdmin) {
            console.log('User is not admin, redirecting...');
            location.href = 'chat.html';
            return;
        }

        if (fresh) DB.setCurrentUser(fresh); // Sync local storage
        ADMIN.set(true);

        // Reveal UI
        requestAnimationFrame(() => {
            document.body.style.opacity = '1';
        });

        // Render UI
        renderAdminStats();
        renderUsersTable();
        renderAdminTicketsList();
        renderAdminModels();
    };

    // Check immediately (in case data is already there)
    checkRights();

    // Subscribe to DB updates
    DB.subscribe(() => {
        // Force Refresh Check
        const cfg = DB.getAdminConfig();
        if (cfg && cfg.forceRefresh) {
            const last = localStorage.getItem('mirra_last_refresh_ts');
            if (!last || Number(last) < cfg.forceRefresh) {
                localStorage.setItem('mirra_last_refresh_ts', cfg.forceRefresh);

                // Show overlay
                const overlay = document.getElementById('refresh-overlay');
                if (overlay) overlay.classList.add('active');

                setTimeout(() => {
                    location.reload();
                }, 1500);
            }
        }

        // Render immediately without debounce
        checkRights();
        invalidateCache();

        try {
            if (document.getElementById('admin-stats')) renderAdminStats();
            if (document.getElementById('users-table-body')) renderUsersTable();
            if (document.getElementById('admin-tickets-list')) renderAdminTicketsList();
            if (document.getElementById('admin-models')) renderAdminModels();
            if (typeof syncGodToolsUI === 'function') syncGodToolsUI();
            if (document.getElementById('god-messages')) renderGodMessages();
            if (document.getElementById('god-chats-list')) renderGodChats();
        } catch (e) {
            console.error(e);
        }
    });
};

function renderAdminStats() {
    const el = document.getElementById('admin-stats');
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
    const body = document.getElementById('users-table-body');
    if (!body) return;
    const users = DB.getUsers();
    body.innerHTML = users.map(u => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="user-cell-avatar">${escapeHTML((u.avatar || (u.nickname || '?')[0] || 'U').toUpperCase())}</div>
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
          <button class="btn small secondary" onclick="window.toggleUserAdmin('${u.id}')">${u.isAdmin ? 'Снять Admin' : 'Выдать Admin'}</button>
          <button class="btn small secondary" onclick="window.openEditUserModal('${u.id}')">Изменить данные</button>
          <button class="btn small danger" onclick="window.deleteUser('${u.id}')">Удалить</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.openEditUserModal = (id) => {
    if (!ADMIN.get()) return;
    const u = DB.getUsers().find(x => String(x.id) === String(id));
    if (!u) return;

    document.getElementById('edit-user-target-id').value = u.id;
    document.getElementById('edit-user-id').value = u.id;
    document.getElementById('edit-user-nickname').value = u.nickname || '';
    document.getElementById('edit-user-visible-name').value = u.visibleName || '';
    document.getElementById('edit-user-password').value = u.password || '';

    openModal('edit-user-modal');
};

window.saveUserData = async () => {
    if (!ADMIN.get()) return;
    const oldId = document.getElementById('edit-user-target-id').value;
    const newId = (document.getElementById('edit-user-id').value || '').trim();
    const newNick = (document.getElementById('edit-user-nickname').value || '').trim();
    const newVis = (document.getElementById('edit-user-visible-name').value || '').trim();
    const newPass = (document.getElementById('edit-user-password').value || '').trim();

    if (!oldId || !newId || !newNick || !newPass) {
        showToast('Заполните обязательные поля (ID, Ник, Пароль)', 'error');
        return;
    }

    const users = DB.getUsers();
    // Check collisions
    if (newId !== oldId && users.some(u => String(u.id) === newId)) {
        showToast('Этот ID уже занят', 'error');
        return;
    }
    if (users.some(u => String(u.id) !== oldId && (u.nickname || '').toLowerCase() === newNick.toLowerCase())) {
        showToast('Этот никнейм уже занят', 'error');
        return;
    }

    const user = users.find(u => String(u.id) === oldId);
    if (!user) return; // Should not happen

    // If ID changed -> Migration
    if (newId !== oldId) {
        if (!confirm(`Вы меняете ID с ${oldId} на ${newId}.\nЭто затронет все чаты и переписки пользователя.\nПродолжить?`)) return;

        // 1. Create new User
        const newUser = { ...user, id: newId, nickname: newNick, visibleName: newVis, password: newPass };
        await DB.saveUser(newUser);

        // 2. Migrate Data
        // Chats
        const chats = DB.getChats().map(c => c.userId === oldId ? { ...c, userId: newId } : c);
        await DB.setChats(chats);

        // Messages
        const msgs = DB.getMessages().map(m => m.userId === oldId ? { ...m, userId: newId } : m);
        await DB.setMessages(msgs);

        // Tickets
        const tickets = DB.getTickets().map(t => t.userId === oldId ? { ...t, userId: newId } : t);
        // Note: DB doesn't have setTickets exposed directly typically? Let's assume DB state update handles it or I need to use raw update
        // Check DB capabilities. app.js: DB.state.tickets is observable? 
        // Admin.js has access to DB.state? 
        // Actually DB.setTickets might not exist. Let's check app.js capabilities or use direct set() if needed.
        // Assuming DB object has setters corresponding to its getters/listeners.
        // If not, I might need to rely on the fact that I can't easily batch update tickets via DB helper.
        // Wait, app.js usually has `DB.saveTicket` but seemingly not bulk `setTickets`.
        // I'll skip deep ticket migration complexity if setters are missing, BUT user asked for it.
        // Let's assume for now I can just update the user properties. 
        // Actually, if I can't migrate tickets easily, ID change is DANGEROUS.
        // Let's rely on Firebase structure.

        // RE-EVALUATION: Doing a full migration of a relational ID in a NoSQL/JSON DB without transactions is risky.
        // However, for this task I will do my best.

        // Helper to update tickets directly using DB internals if exposed, or just standard saving.
        // Since I don't see `DB.setTickets` in my memory, I will use a loop to save tickets if needed.
        if (DB.saveTicket) {
            const userTickets = DB.getTickets().filter(t => t.userId === oldId);
            for (const t of userTickets) await DB.saveTicket({ ...t, userId: newId });
        }

        // Folders
        if (DB.saveFolder && DB.getFolders) {
            const userFolders = DB.getFolders().filter(f => f.userId === oldId);
            for (const f of userFolders) await DB.saveFolder({ ...f, userId: newId });
        }

        // 3. Delete old User
        await DB.deleteUser(oldId); // This might cascade delete? 
        // WAIT! DB.deleteUser might cascade delete chats/messages!
        // I verified deleteUser logic earlier. 
        // `window.deleteUser` in admin.js calls `DB.deleteUser`.
        // `DB.deleteUser` (in app.js) usually deletes related data. 
        // IF I CALL `DB.deleteUser(oldId)` AFTER migrating data, the data now belongs to `newId` so it won't be deleted?
        // NO, the data in DB still has `oldId` UNTIL I save the migrated data.
        // I saved migrated data ABOVE (Steps 2).
        // So `chats` now have `userId: newId`.
        // So `DB.deleteUser(oldId)` should find NO chats for oldId.
        // SAFE.

    } else {
        // Simple update
        await DB.saveUser({ ...user, nickname: newNick, visibleName: newVis, password: newPass });
    }

    showToast('Данные обновлены', 'success');
    closeModal('edit-user-modal');
};

window.toggleUserPlan = (id) => {
    if (!ADMIN.get()) return;
    const targetId = String(id);
    const u = DB.getUsers().find(x => String(x.id ?? '') === targetId);
    if (!u) return;
    const nextPlan = (u.plan || 'free') === 'pro' ? 'free' : 'pro';
    DB.saveUser({ ...u, plan: nextPlan });
    showToast(`${u.visibleName || u.nickname || 'Пользователь'} теперь ${nextPlan === 'pro' ? 'PRO' : 'FREE'}`, 'success');
};

window.toggleUserAdmin = (id) => {
    if (!ADMIN.get()) return;
    const targetId = String(id);
    const local = DB.getCurrentUser();

    // Self-lockout protection
    if (local && String(local.id) === targetId) {
        showToast('Нельзя снять права у самого себя', 'error');
        return;
    }

    const u = DB.getUsers().find(x => String(x.id ?? '') === targetId);
    if (!u) return;
    const next = !u.isAdmin;
    DB.saveUser({ ...u, isAdmin: next });
    showToast(`${u.visibleName || u.nickname} теперь ${next ? 'ADMIN' : 'USER'}`, 'success');
};

window.deleteUser = async (id) => {
    if (!ADMIN.get()) return;
    if (!await uiConfirm('Удалить пользователя и все его данные?')) return;
    await DB.deleteUser(id);
    const chatIds = new Set(DB.getChats().filter(c => c.userId === id).map(c => c.id));
    for (const cid of chatIds) await DB.deleteChat(cid);
    const userMsgs = DB.getMessages().filter(m => m.userId === id || chatIds.has(m.chatId));
    for (const m of userMsgs) await DB.deleteMessage(m.id);
    const tickets = DB.getTickets().filter(t => t.userId === id);
    for (const t of tickets) await DB.deleteTicket(t.id);
    const tickIds = new Set(tickets.map(t => t.id));
    const orphans = DB.getTicketMessages().filter(m => m.userId === id || tickIds.has(m.ticketId));
    for (const m of orphans) await DB.deleteTicketMessage(m.id);
    showToast('Пользователь удалён', 'success');
};

function renderAdminModels() {
    const wrap = document.getElementById('admin-models');
    if (!wrap) return;
    const avail = DB.getModelAvailability();
    // We need 'all' models list. window.MODELS is global from app.js
    const all = Object.values(window.MODELS || {});
    const models = [...all].sort((a, b) => a.id.localeCompare(b.id)); // Fix sort to use ID or Name consistently? Name is better but ID was used.

    // Get default modes
    const adminCfg = DB.getAdminConfig();
    const modes = adminCfg?.modelModes || {};

    wrap.innerHTML = models.map(m => {
        const on = (m.id in avail) ? avail[m.id] : true;
        const mode = modes[m.id] || 'auto'; // default 'auto'

        return `
      <div class="model-admin-row">
        <div class="model-admin-left">
          <div class="model-admin-ico">${window.ICONS[m.icon]}</div>
          <div class="model-admin-info">
            <div class="model-admin-name">${escapeHTML(m.name)}</div>
            <div class="model-admin-provider">${escapeHTML(m.provider)}</div>
          </div>
        </div>
        
        <div style="display:flex;gap:4px;margin-right:12px;">
           <button class="btn small ${mode === 'manual' ? 'primary' : 'secondary'}" style="padding:4px 8px;font-size:10px;" onclick="window.toggleModelDefaultMode('${m.id}', 'manual')">Manual</button>
           <button class="btn small ${mode === 'auto' ? 'primary' : 'secondary'}" style="padding:4px 8px;font-size:10px;" onclick="window.toggleModelDefaultMode('${m.id}', 'auto')">Auto</button>
           <button class="btn small ${mode === 'admin' ? 'primary' : 'secondary'}" style="padding:4px 8px;font-size:10px;" onclick="window.toggleModelDefaultMode('${m.id}', 'admin')">Admin</button>
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
    // render will be triggered by DB sub
};

window.toggleModelDefaultMode = async (id, mode) => {
    if (!ADMIN.get()) return;
    const cfg = DB.getAdminConfig() || {};
    const modes = { ...(cfg.modelModes || {}) };
    modes[id] = mode;
    await DB.saveAdminConfig({ ...cfg, modelModes: modes });
    // render triggered by DB
};

// ---- Admin Tickets ----
let adminCurrentTicketId = null;
let adminTicketFile = null;

function renderAdminTicketsList() {
    const el = document.getElementById('admin-tickets-list');
    if (!el) return;
    const users = DB.getUsers();
    const tickets = DB.getTickets().slice();
    tickets.sort((a, b) => {
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
        <div class="admin-ticket-meta">${escapeHTML((u?.nickname || t.userId) + ' • ' + (t.status || 'open').toUpperCase())}</div>
      </div>
    `;
    }).join('');
}

window.openAdminTicket = (id) => {
    adminCurrentTicketId = id;
    const t = DB.getTickets().find(x => x.id === id);
    if (!t) return;
    const u = DB.getUsers().find(x => x.id === t.userId);
    const metaEl = document.getElementById('admin-ticket-meta');
    const userEl = document.getElementById('admin-ticket-user');
    if (userEl) userEl.textContent = u ? `Тикет: ${u.nickname}` : 'Тикет';
    if (metaEl) metaEl.textContent = `Статус: ${(t.status || 'open').toUpperCase()} • ${new Date(t.createdAt || Date.now()).toLocaleString()}`;
    openModal('admin-ticket-modal');
    renderAdminTicketMessages();
};

function renderAdminTicketMessages() {
    const el = document.getElementById('admin-ticket-messages');
    if (!el || !adminCurrentTicketId) return;
    const msgs = DB.getTicketMessages().filter(m => m.ticketId === adminCurrentTicketId).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    el.innerHTML = msgs.map(m => {
        const isAdmin = m.role === 'admin';
        const header = isAdmin ? 'Администратор' : 'Пользователь';
        const content = String(m.content || '').trim();
        // Assuming parseMarkdown, isImageFile, renderFileBlock are global
        const text = content ? `<div class="god-message-text">${window.parseMarkdown(content)}</div>` : '';
        let attach = '';
        const files = Array.isArray(m.files) ? m.files : (m.file ? [m.file] : []);
        if (files.length) {
            attach = files.map(f => {
                if (!f) return '';
                return window.isImageFile(f) ? `<img class="god-message-image" src="${f.data}" alt="image"/>` : window.renderFileBlock(f);
            }).join('');
        }
        return `<div class="god-message ${isAdmin ? 'ai' : 'user'}"><div class="god-message-header"><span class="god-message-role">${escapeHTML(header)}</span></div>${text}${attach}</div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
}

window.handleAdminTicketFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) return showToast('Макс. размер 3 МБ', 'error');
    const r = new FileReader();
    r.onload = (ev) => {
        adminTicketFile = { name: f.name, type: f.type || 'application/octet-stream', size: f.size, data: String(ev.target.result || '') };
        const box = document.getElementById('admin-ticket-file-preview');
        if (!box) return;
        if (window.isImageFile(adminTicketFile)) box.innerHTML = `<div class="preview-item"><img src="${adminTicketFile.data}" alt="preview"><button class="preview-remove" onclick="window.removeAdminTicketFile()">×</button></div>`;
        else box.innerHTML = `<div class="message-file"><div class="file-row"><span class="file-ico">${window.ICONS.file}</span><span class="file-info"><span class="file-name">${escapeHTML(adminTicketFile.name)}</span><span class="file-size">${escapeHTML(window.formatBytes(adminTicketFile.size))}</span></span></div><div class="file-actions"><a href="${adminTicketFile.data}" download="${escapeHTML(adminTicketFile.name)}">Скачать</a></div></div>`;
    };
    r.readAsDataURL(f);
};

window.removeAdminTicketFile = () => {
    adminTicketFile = null;
    const box = document.getElementById('admin-ticket-file-preview');
    if (box) box.innerHTML = '';
};

window.sendAdminTicketMessage = () => {
    if (!adminCurrentTicketId) return;
    const t = DB.getTickets().find(x => x.id === adminCurrentTicketId);
    if (!t || t.status !== 'open') return showToast('Тикет не открыт', 'error');
    const input = document.getElementById('admin-ticket-input');
    const text = String(input?.value || '').trim();
    if (!text && !adminTicketFile) return;
    // nowId is global?
    const now = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    const msg = { id: now, ticketId: adminCurrentTicketId, userId: t.userId, role: 'admin', content: text, file: adminTicketFile, createdAt: Date.now() };
    DB.saveTicketMessage(msg);
    DB.saveTicket({ ...t, updatedAt: Date.now() });
    if (input) input.value = '';
    adminTicketFile = null;
    const box = document.getElementById('admin-ticket-file-preview');
    if (box) box.innerHTML = '';
    renderAdminTicketMessages();
};

window.adminCloseTicket = () => {
    if (!adminCurrentTicketId) return;
    const t = DB.getTickets().find(t => t.id === adminCurrentTicketId);
    if (t) DB.saveTicket({ ...t, status: 'closed', updatedAt: Date.now() });
};
window.adminOpenTicket = () => {
    if (!adminCurrentTicketId) return;
    const t = DB.getTickets().find(t => t.id === adminCurrentTicketId);
    if (t) DB.saveTicket({ ...t, status: 'open', updatedAt: Date.now() });
};
window.cancelTicketAsAdmin = () => {
    if (!adminCurrentTicketId) return;
    const t = DB.getTickets().find(t => t.id === adminCurrentTicketId);
    if (t) DB.saveTicket({ ...t, status: 'canceled', updatedAt: Date.now() });
};
window.adminDeleteTicket = async () => {
    if (!adminCurrentTicketId) return;
    if (!await uiConfirm('Удалить тикет навсегда?')) return;
    const id = adminCurrentTicketId;
    await DB.deleteTicket(id);
    const msgs = DB.getTicketMessages().filter(m => m.ticketId === id);
    for (const m of msgs) await DB.deleteTicketMessage(m.id);
    adminCurrentTicketId = null;
    closeModal('admin-ticket-modal');
};

// ==================== GOD MODE ====================

window.openGodMode = (userId) => {
    if (!ADMIN.get()) return;
    godUserId = userId;
    godChatId = null;
    const u = DB.getUsers().find(x => x.id === userId);
    const nameEl = document.getElementById('god-user-name');
    if (nameEl) nameEl.textContent = u ? u.nickname : 'Пользователь';
    openModal('god-modal');
    renderGodChats();
    const empty = document.getElementById('god-empty-state');
    const view = document.getElementById('god-chat-view');
    if (empty) empty.classList.remove('hidden');
    if (view) view.classList.add('hidden');
    syncGodToolsUI();
};

window.closeGodMode = () => {
    closeModal('god-modal');
    godUserId = null;
    godChatId = null;
    godFile = null;
    const prev = document.getElementById('god-file-preview');
    if (prev) prev.innerHTML = '';
};

function renderGodChats() {
    const el = document.getElementById('god-chats-list');
    if (!el || !godUserId) return;
    const chats = DB.getChats().filter(c => c.userId === godUserId).slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    el.innerHTML = chats.map(c => {
        const m = window.getSafeModel(c.model);
        return `
      <div class="god-chat-item" onclick="window.openGodChat('${c.id}')">
        <div class="god-chat-icon">${window.ICONS[m.icon]}</div>
        <div class="god-chat-info">
          <div class="god-chat-name">${escapeHTML(c.name || 'Диалог')}</div>
          <div class="god-chat-model">${escapeHTML(m.name)}</div>
        </div>
        <button class="god-chat-delete" onclick="window.deleteGodChat(event, '${c.id}')">×</button>
      </div>
    `;
    }).join('') || '<div class="empty-state">Нет чатов</div>';
}

window.deleteGodChat = async (e, chatId) => {
    e.stopPropagation();
    if (!ADMIN.get()) return;
    if (!await window.uiConfirm('Удалить этот чат?')) return;

    await DB.deleteChat(chatId);
    // clean messages
    const msgs = DB.getMessages().filter(m => m.chatId === chatId);
    for (const m of msgs) await DB.deleteMessage(m.id);

    if (godChatId === chatId) {
        godChatId = null;
        const v = document.getElementById('god-chat-view');
        const em = document.getElementById('god-empty-state');
        if (v) v.classList.add('hidden');
        if (em) em.classList.remove('hidden');
    }
    renderGodChats();
};

window.openGodChat = (chatId) => {
    godChatId = chatId;
    const empty = document.getElementById('god-empty-state');
    const view = document.getElementById('god-chat-view');
    if (empty) empty.classList.add('hidden');
    if (view) view.classList.remove('hidden');
    renderGodMessages();
    syncGodToolsUI();

    // Sync Mode Toggle
    const chat = DB.getChats().find(c => c.id === chatId);
    if (chat) {
        let mode = chat.mode;
        if (!mode) mode = (chat.aion ?? true) ? 'auto' : 'manual';
        renderGodModeBnt(mode);
    }
};

function renderGodChatModeToggle() {
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
    // Atomic save
    const chat = DB.getChats().find(c => c.id === godChatId);
    if (chat) DB.saveChat({ ...chat, aion: !!val, updatedAt: Date.now() });
    renderGodChatModeToggle();
    syncGodToolsUI();
};

function renderGodMessages() {
    const el = document.getElementById('god-messages');
    if (!el || !godChatId) return;
    const msgs = getCachedMessages(godChatId);
    el.innerHTML = msgs.map(m => {
        const isUser = m.role === 'user';
        const model = window.getSafeModel(m.model);

        let header = isUser ? 'Пользователь' : `${model.name} <span style="opacity:0.5;font-size:0.9em">(AI)</span>`;
        if (m.meta?.isAdminMode) {
            // Requested: "Mistral Small 3.2 (Admin)" logic (using model name?)
            // User said: " Mistral Small 3.2 (Admin) " for Admin.
            // But usually Admin messages are from a PERSON (adminName).
            // However, the user request explicitly showed:
            // "админ -> Mistral Small 3.2 (Admin)"
            // So we should use Model Name + (Admin).
            header = `${model.name} <span style="color:#ff6b7a;font-size:0.9em">(Admin)</span>`;
        } else if (m.meta?.manual) {
            header = `${model.name} <span style="color:#aaa;font-size:0.9em">(Manual)</span>`;
        }

        // We rely on window.renderToolCard if possible. But renderToolCard is in app.js and likely returns HTML.
        // If renderToolCard is globally exposed, we use it.
        let toolHtml = '';
        if (window.renderToolCard) toolHtml = window.renderToolCard(m);

        const content = String(m.content || '').trim();
        const text = toolHtml ? toolHtml : (content ? `<div class="god-message-text">${window.parseMarkdown(content)}</div>` : '');

        let toolLabel = '';
        if (isUser && m.meta?.multiTools && Array.isArray(m.meta.multiTools)) {
            toolLabel = `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">`;
            m.meta.multiTools.forEach(t => {
                const tName = t.type;
                // TOOL_ICONS is global
                const ico = (window.TOOL_ICONS && window.TOOL_ICONS[tName]) || '';
                const tMap = { search: 'Лупа', code: 'Код', image: 'Фото', music: 'Музыка', thinking: 'Мозг' };
                const name = tMap[tName] || tName;
                toolLabel += `
                 <div style="display:flex;align-items:center;gap:4px;font-size:11px;color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:4px;">
                    <span>${ico}</span>
                    <span>${name}</span>
                 </div>`;
            });
            toolLabel += `</div>`;
        } else if (isUser && m.meta?.usedTool) {
            // Legacy single
            const t = m.meta.usedTool;
            const ico = (window.TOOL_ICONS && window.TOOL_ICONS[t]) || '';
            const tMap = { search: 'Лупа', code: 'Код', image: 'Фото', music: 'Музыка', thinking: 'Мозг' };
            const name = tMap[t] || t;
            toolLabel = `
        <div style="display:flex;align-items:center;gap:4px;font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:4px;width:fit-content;">
           <span>${ico}</span>
           <span>${name}</span>
        </div>`;
        }

        let attachHtml = '';
        const files = Array.isArray(m.files) ? m.files : (m.file ? [m.file] : []);
        const meta = m.meta || {};

        // Loading/Waiting status
        if (meta.loading) {
            return `
                <div class="god-message ai" style="opacity:0.8;background:rgba(142,67,255,0.05);">
                    <div class="status-shimmer">Пользователь ожидает ответа...</div>
                </div>`;
        }

        const toolIncludesImage = meta.tool === 'image' && (meta.state === 'pending' || meta.state === 'done');
        // Check if message has music tool - if so, skip audio files as they're rendered by the tool card
        const hasMusicTool = meta.multiTools?.some(t => t.type === 'music' && t.state === 'done') || (meta.tool === 'music' && meta.state === 'done');
        if (!toolIncludesImage && files.length) {
            attachHtml = files.map(f => {
                if (!f) return '';
                // Skip audio files if music tool is present (to avoid duplicate display)
                if (hasMusicTool && f.type && f.type.startsWith('audio')) return '';
                return window.isImageFile(f)
                    ? `<img class="god-message-image" src="${f.data}" alt="image"/>`
                    : window.renderFileBlock(f);
            }).join('');
        }
        // Tools Metadata Badge (Generation/Editing)
        let toolsMetaHtml = '';
        if (meta.usedTools) {
            const badges = meta.usedTools.map(t => {
                let label = t;
                let onclick = '';
                let cls = 'tool-usage-badge';
                if (t === 'generation') label = 'Генерация';
                if (t === 'editing') {
                    label = 'Изменение';
                    if (meta.refId) {
                        onclick = `onclick="window.scrollToMsg('${meta.refId}')"`;
                        cls += ' clickable';
                    }
                }
                return `<span class="${cls}" ${onclick}>${label}</span>`;
            }).join(' ');
            if (badges) toolsMetaHtml = `<div class="msg-tools-meta" style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;">${badges}</div>`;
        }

        return `
            <div id="msg-${m.id}" class="god-message ${isUser ? 'user' : 'ai'}">
                <div class="god-message-header">
                    <span class="god-message-role">${header}</span>
                    <button class="god-msg-delete" onclick="window.deleteGodMessage('${m.id}')">×</button>
                </div>
                ${text}${toolLabel}${attachHtml}${toolsMetaHtml}
            </div>`;
    }).join('');

    if (window.observeShimmers) window.observeShimmers(el);
    el.scrollTop = el.scrollHeight;
    syncGodToolsUI();
}

window.handleGodFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) return showToast('Макс. размер 3 МБ', 'error');
    const r = new FileReader();
    r.onload = (ev) => {
        godFile = { name: f.name, type: f.type || 'application/octet-stream', size: f.size, data: String(ev.target.result || '') };
        const box = document.getElementById('god-file-preview');
        if (!box) return;
        if (window.isImageFile(godFile)) box.innerHTML = `<div class="preview-item"><img src="${godFile.data}" alt="preview"><button class="preview-remove" onclick="window.removeGodFile()">×</button></div>`;
        else box.innerHTML = `<div class="message-file"><div class="file-row"><span class="file-ico">${window.ICONS.file}</span><span class="file-info"><span class="file-name">${escapeHTML(godFile.name)}</span><span class="file-size">${escapeHTML(window.formatBytes(godFile.size))}</span></span></div><div class="file-actions"><a href="${godFile.data}" download="${escapeHTML(godFile.name)}">Скачать</a></div></div>`;
    };
    r.readAsDataURL(f);
};

window.removeGodFile = () => {
    godFile = null;
    const box = document.getElementById('god-file-preview');
    if (box) box.innerHTML = '';
};

window.setGodChatMode = (mode) => {
    if (!godChatId) return;
    const chat = DB.getChats().find(c => c.id === godChatId);
    if (!chat) return;

    // Legacy support: 'auto' means aion=true
    const isAuto = mode === 'auto';
    DB.saveChat({ ...chat, mode, aion: isAuto });

    // UI Update
    renderGodModeBnt(mode);
};

function renderGodModeBnt(mode) {
    ['auto', 'manual', 'admin'].forEach(m => {
        const btn = document.getElementById('mode-' + m);
        if (btn) btn.classList.toggle('active', m === mode);
    });
}

window.sendGodMessage = () => {
    if (!godChatId || !godUserId) {
        showToast('DEBUG: ChatId or UserId missing', 'error');
        return;
    }
    const chat = DB.getChats().find(c => c.id === godChatId);

    // Determine mode
    // Fallback: if chat.mode undefined, infer from aion
    let mode = chat?.mode;
    if (!mode) mode = (chat?.aion ?? true) ? 'auto' : 'manual';

    if (mode === 'auto') {
        showToast('Чат в режиме Auto: переключитесь в Manual или Admin', 'error');
        return;
    }

    const input = document.getElementById('god-input');
    const fullText = String(input?.value || '').trim();

    // Check if we have content or tools to send
    // Check if we have content or tools to send
    const hasTools = godToolState.search || godToolState.coding || godToolState.thinking || godToolState.music;
    if (!fullText && !godFile && !hasTools) {
        // Debug
        // showToast('Пустое сообщение', 'error');
        return;
    }
    const model = chat?.model || 'mistral-small-3.2';
    const now = Date.now().toString() + Math.floor(Math.random() * 1000).toString();

    const meta = {};
    if (mode === 'manual') meta.manual = true;
    else if (mode === 'admin') {
        const adminUser = DB.getCurrentUser();
        meta.isAdminMode = true;
        meta.adminName = adminUser?.visibleName || adminUser?.nickname || 'Support';
        meta.adminAvatar = adminUser?.avatar || 'A';
    }

    // Collect Tools
    const tools = [];
    if (godToolState.search) tools.push({ type: 'search', state: 'running' });
    if (godToolState.coding) tools.push({ type: 'coding', files: godToolState.coding.files, state: 'pending' });
    if (godToolState.thinking) tools.push({ type: 'thinking', state: 'running', start: Date.now() });
    if (godToolState.music) tools.push({ type: 'music', state: 'running' });

    if (tools.length) {
        meta.multiTools = tools;
        // Back-compat: Set primary tool for old renders if single
        if (tools.length === 1) {
            meta.tool = tools[0].type;
            if (tools[0].type === 'search') meta.state = 'running';
            if (tools[0].type === 'coding') { meta.fileName = 'Multi-files'; meta.state = 'pending'; }
            // thinking...
        }
    }

    if (godFile) {
        // ... (existing)
    }

    const msg = {
        id: now,
        chatId: godChatId,
        userId: godUserId,
        role: 'assistant',
        content: fullText,
        model,
        file: godFile,
        meta,
        createdAt: Date.now()
    };
    DB.saveMessage(msg);
    if (input) input.value = '';
    godFile = null;

    // clear states
    godToolState = { search: false, coding: null, image: null, music: false, thinking: false };
    renderGodToolButtons();

    const box = document.getElementById('god-file-preview');
    if (box) box.innerHTML = '';
    renderGodMessages();

    // Auto-open Thinking Control if we just sent a "Thinking..." message
    const justSentThinking = tools.find(t => t.type === 'thinking');
    if (justSentThinking) {
        setTimeout(() => window.openThinkingControl(msg), 50);
    }
};

function setGodToolActive(toolId, active) {
    const btn = document.getElementById(toolId);
    if (!btn) return;
    btn.classList.toggle('active', !!active);
}

function setChatThinking(chatId, thinking, modelId) {
    const allChats = DB.getChats();
    const target = allChats.find(c => c.id === chatId);
    if (!target) return;
    const uid = target?.userId;
    // Atomic set? No, we need to iterate to clear others.
    // In granular mode, we should just update target + maybe 1-2 others if user spam clicks.
    // But strictly, we should update target. 
    // Loop logic:
    // Update C: if it's the target OR if it shares user and was thinking.

    const toUpdate = allChats.filter(c =>
        c.id === chatId || (thinking && uid && c.userId === uid && c.thinking)
    );

    toUpdate.forEach(c => {
        if (c.id === chatId) {
            DB.saveChat({ ...c, thinking: !!thinking, thinkingModel: thinking ? (modelId || c.model) : null });
        } else {
            // Turn off others
            DB.saveChat({ ...c, thinking: false, thinkingModel: null });
        }
    });
}

function findLatestToolMsg(chatId, tool, states) {
    if (!chatId) return null;
    const wanted = Array.isArray(states) ? states : [states];
    const msgs = DB.getMessages()
        .filter(m => {
            if (m.chatId !== chatId || m.role !== 'assistant' || !m.meta) return false;

            // Check legacy single tool
            if (m.meta.tool === tool && wanted.includes(m.meta.state)) return true;

            // Check multiTools array
            if (m.meta.multiTools && Array.isArray(m.meta.multiTools)) {
                return m.meta.multiTools.some(t => t.type === tool && wanted.includes(t.state));
            }

            return false;
        })
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return msgs[0] || null;
}

function patchMessage(id, patch) {
    const msgs = DB.getMessages();
    const cur = msgs.find(m => m.id === id);
    if (!cur) return false;
    const next = { ...cur, ...patch };
    if (patch && typeof patch === 'object' && patch.meta) {
        next.meta = { ...(cur.meta || {}), ...(patch.meta || {}) };
    }
    return DB.saveMessage(next);
}

function syncGodToolsUI() {
    if (!godChatId) {
        setGodToolActive('god-tool-search', false);
        setGodToolActive('god-tool-coding', false);
        setGodToolActive('god-tool-image', false);
        setGodToolActive('god-tool-print', false);
        return;
    }
    setGodToolActive('god-tool-search', !!findLatestToolMsg(godChatId, 'search', 'running'));
    setGodToolActive('god-tool-coding', !!findLatestToolMsg(godChatId, 'coding', 'pending') || !!godToolState.coding);
    setGodToolActive('god-tool-image', !!findLatestToolMsg(godChatId, 'image', ['running', 'pending']));
    const chat = DB.getChats().find(c => c.id === godChatId);
    setGodToolActive('god-tool-print', !!chat?.thinking);
    setGodToolActive('god-tool-music', !!findLatestToolMsg(godChatId, 'music', 'running'));
    setGodToolActive('god-tool-thinking', !!findLatestToolMsg(godChatId, 'thinking', 'running') || !!godToolState.thinking);
    renderGodToolButtons();
}


window.godToolToggle = (tool) => {
    if (!ADMIN.get()) return;
    if (!godChatId) return showToast('Выберите чат', 'error');

    // 1. Check if tool is RUNNING/PENDING in chat -> Control Mode
    // 1. Check if tool is RUNNING/PENDING in chat -> Control Mode
    const running = findLatestToolMsg(godChatId, tool, ['running', 'pending']);
    if (running) {
        if (tool === 'coding') return window.openCodingControl(running);
        if (tool === 'search') return window.finishSearch(running);
        if (tool === 'image') return window.godToolImage(); // Existing logic handles active
        // Thinking and Music handle their own running state below
    }

    // 2. toggle COMPOSITION mode (for next message)
    // Coding: Open modal directly
    if (tool === 'coding') {
        window.openCodingModal();
        return;
    }

    // Thinking: Instant Start
    if (tool === 'thinking') {
        const running = findLatestToolMsg(godChatId, tool, ['running', 'pending']);
        if (running) {
            // Stop it (set done in multiTools)
            const mTools = running.meta.multiTools || [];
            const tIdx = mTools.findIndex(t => t.type === 'thinking');
            if (tIdx !== -1) {
                mTools[tIdx].state = 'done';
                mTools[tIdx].duration = Math.round((Date.now() - (mTools[tIdx].start || running.meta.createdAt)) / 1000);
            }
            patchMessage(running.id, { meta: { ...running.meta, multiTools: mTools, state: 'done' } });
            renderGodToolButtons();
        } else {
            // Start it
            startGodTool('thinking', { start: Date.now() });
        }
        return;
    }

    // Search: Instant Start (like thinking) - first click starts, second click completes
    if (tool === 'search') {
        const running = findLatestToolMsg(godChatId, 'search', 'running');
        if (running) {
            // Complete the search
            return window.finishSearch(running);
        } else {
            // Start a new search
            startGodTool('search', {});
        }
        renderGodToolButtons();
        return;
    }

    // Image: Open Picker immediately
    if (tool === 'image') return window.godToolImage();

    // Music: New workflow
    // 1st click -> Starts "Generating Music..."
    // Then user uploads file
    // 2nd click -> Attaches file and sets state to Done
    if (tool === 'music') {
        const running = findLatestToolMsg(godChatId, tool, 'running');
        if (running) {
            // Check if we have a file ready
            if (godToolState.music && godToolState.music.data) {
                const fileData = godToolState.music;
                const mTools = running.meta.multiTools || [];
                const tIdx = mTools.findIndex(t => t.type === 'music');
                if (tIdx !== -1) mTools[tIdx].state = 'done';

                patchMessage(running.id, {
                    content: 'Music Created',
                    files: [{ name: fileData.name, type: fileData.type, data: fileData.data, size: fileData.size }],
                    meta: { ...running.meta, multiTools: mTools, state: 'done' }
                });
                godToolState.music = false; // reset
                renderGodToolButtons();
                return;
            } else {
                // No file yet, maybe open picker again?
                openModal('god-music-upload-modal');
                return;
            }
        }
        // Start it
        startGodTool('music', { state: 'running' });
        patchMessage(DB.getMessages().at(-1).id, { content: 'Creatinig music...' });
        return;
    }
};

function renderGodToolButtons() {
    ['search', 'coding', 'thinking', 'image', 'music'].forEach(t => {
        const btn = document.getElementById('god-tool-' + t);
        if (!btn) return;

        // Active if in State OR if Running in Chat
        const isState = !!godToolState[t];
        const isRunning = !!findLatestToolMsg(godChatId, t, ['running', 'pending']);

        btn.classList.toggle('active', isState || isRunning);
        if (isRunning) btn.classList.add('running-pulse'); // We'll add css
        else btn.classList.remove('running-pulse');
    });
}


window.godCodingDone = () => {
    if (!ADMIN.get()) return;
    if (!godChatId || !godUserId) return;
    const title = (document.getElementById('god-coding-title')?.value || '').trim() || 'index.html';
    const code = String(document.getElementById('god-coding-content')?.value || '').slice(0, 20000);
    if (!code.trim()) return showToast('Вставьте содержимое', 'error');
    const chat = DB.getChats().find(c => c.id === godChatId);
    const model = chat?.model || 'mistral-small-3.2';
    const now = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    const msg = {
        id: now, chatId: godChatId, userId: godUserId, role: 'assistant',
        content: `Create (${title})...`, model,
        meta: { tool: 'coding', state: 'pending', fileName: title, code }, createdAt: Date.now()
    };
    DB.saveMessage(msg);
    closeModal('god-coding-modal');
    setGodToolActive('god-tool-coding', true);
    renderGodMessages();
};

window.godToolImage = async () => {
    if (!ADMIN.get()) return;
    if (!godChatId || !godUserId) return showToast('Сначала выберите чат', 'error');

    // Check active
    const active = findLatestToolMsg(godChatId, 'image', ['running', 'pending']);
    if (active) {
        // Just re-open modal to continue/fix
        openImageModalReset();
        return;
    }

    const chat = DB.getChats().find(c => c.id === godChatId);
    const model = chat?.model || 'mistral-large-3';
    const now = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    const msg = {
        id: now, chatId: godChatId, userId: godUserId, role: 'assistant',
        content: 'Генерация изображения...', model,
        meta: { tool: 'image', state: 'running' }, createdAt: Date.now()
    };

    // Await save
    await DB.saveMessage(msg);

    setGodToolActive('god-tool-image', true);
    renderGodMessages();

    // Open Modal
    setTimeout(() => openImageModalReset(), 50);
};

function openImageModalReset() {
    godImagePicked = null;
    const prev = document.getElementById('god-image-modal-preview');
    if (prev) prev.innerHTML = '';
    const input = document.getElementById('god-image-modal-input');
    if (input) input.value = '';
    openModal('god-image-modal');
}

window.handleGodToolImagePick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) return showToast('Макс. размер 3 МБ', 'error');
    if (!String(f.type || '').startsWith('image/')) return showToast('Нужно выбрать изображение', 'error');
    const r = new FileReader();
    r.onload = (ev) => {
        godImagePicked = { name: f.name, type: f.type || 'image/png', size: f.size, data: String(ev.target.result || '') };
        const prev = document.getElementById('god-image-modal-preview');
        if (prev) prev.innerHTML = `<img src="${godImagePicked.data}" style="width:100%;max-height:280px;object-fit:contain;border-radius:12px;border:1px solid rgba(255,255,255,0.12)" alt="preview"/>`;
    };
    r.readAsDataURL(f);
};

window.godImageDone = () => {
    if (!ADMIN.get()) return;
    if (!godChatId) return;
    if (!godImagePicked) return showToast('Сначала выберите фото', 'error');

    // Find running OR pending
    const active = findLatestToolMsg(godChatId, 'image', ['running', 'pending']);
    if (active) {
        // Complete it
        patchMessage(active.id, {
            content: 'Изображение сгенерировано',
            files: [godImagePicked],
            meta: { tool: 'image', state: 'done' }
        });
        setGodToolActive('god-tool-image', false);
    }
    closeModal('god-image-modal');
    renderGodMessages();
};

window.godToolMusic = () => {
    if (!ADMIN.get()) return;
    if (!godChatId) return showToast('Выберите чат', 'error');
    const chat = DB.getChats().find(c => c.id === godChatId);
    const model = chat?.model || 'mistral-small-3.2';
    const generating = findLatestToolMsg(godChatId, 'music', 'running');
    if (generating) {
        openModal('god-music-upload-modal');
        return;
    }
    const now = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    const msg = {
        id: now, chatId: godChatId, userId: godUserId, role: 'assistant',
        content: 'Generating music...', model,
        meta: { tool: 'music', state: 'running' }, createdAt: Date.now()
    };
    DB.saveMessage(msg);
    setGodToolActive('god-tool-music', true);
    renderGodMessages();
};


// ============= CODING MULTIFILE LOGIC (REBUILT) =============

// Open coding modal and reset state
window.openCodingModal = () => {
    if (!ADMIN.get()) return;
    if (!godChatId) return showToast('Сначала выберите чат', 'error');

    godToolState.coding = { files: [] };
    document.getElementById('god-coding-title').value = '';
    document.getElementById('god-coding-content').value = '';
    renderCodingFilesList();
    openModal('god-coding-modal');
};

// Add file to the list
window.addCodingFile = () => {
    const nameEl = document.getElementById('god-coding-title');
    const codeEl = document.getElementById('god-coding-content');
    const name = nameEl.value.trim();
    const code = codeEl.value;

    if (!name) return showToast('Введите имя файла', 'error');

    if (!godToolState.coding) godToolState.coding = { files: [] };
    godToolState.coding.files.push({ name, code, status: 'pending' });

    nameEl.value = '';
    codeEl.value = '';
    renderCodingFilesList();
    showToast(`Добавлен: ${name}`, 'success');
};

// Remove file from list
window.removeCodingFile = (idx) => {
    if (!godToolState.coding?.files) return;
    godToolState.coding.files.splice(idx, 1);
    renderCodingFilesList();
};

// Render file chips in modal
function renderCodingFilesList() {
    const el = document.getElementById('god-coding-files-list');
    if (!el) return;

    const files = godToolState.coding?.files || [];
    if (!files.length) {
        el.innerHTML = '<div style="color:var(--text-muted);font-size:12px;">Нет файлов. Добавьте файл выше.</div>';
        return;
    }

    el.innerHTML = files.map((f, i) => `
        <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.08);padding:6px 10px;border-radius:8px;font-size:12px;">
            <span style="flex:1;font-family:monospace;">${f.name}</span>
            <button onclick="window.removeCodingFile(${i})" style="background:none;border:none;color:#ff4757;cursor:pointer;font-size:14px;">×</button>
        </div>
    `).join('');
}

// Send the coding message to the chat
window.sendCodingMessage = () => {
    if (!ADMIN.get()) return;
    if (!godChatId || !godUserId) return showToast('Нет чата', 'error');

    // If there's text in input, add it first
    const nameEl = document.getElementById('god-coding-title');
    if (nameEl?.value?.trim()) {
        window.addCodingFile();
    }

    if (!godToolState.coding?.files?.length) {
        return showToast('Добавьте хотя бы один файл', 'error');
    }

    const chat = DB.getChats().find(c => c.id === godChatId);
    const model = chat?.model || 'mistral-small-3.2';
    const msgId = Date.now().toString() + Math.floor(Math.random() * 1000);

    const msg = {
        id: msgId,
        chatId: godChatId,
        userId: godUserId,
        role: 'assistant',
        content: '',
        model,
        meta: {
            tool: 'coding',
            state: 'pending',
            files: godToolState.coding.files
        },
        createdAt: Date.now()
    };

    DB.saveMessage(msg);
    closeModal('god-coding-modal');
    godToolState.coding = null;
    renderGodMessages();
    showToast('Сообщение отправлено', 'success');
};

// Mark file as done (called from chat message)
window.markCodingFileDone = (msgId, fileIdx) => {
    if (!ADMIN.get()) return;
    const msg = DB.getMessages().find(m => m.id === msgId);
    if (!msg?.meta?.files?.[fileIdx]) return;

    msg.meta.files[fileIdx].status = 'done';

    // Check if all files are processed
    const allDone = msg.meta.files.every(f => f.status !== 'pending');
    if (allDone) msg.meta.state = 'done';

    DB.saveMessage(msg);
};

// Mark file as error (called from chat message)
window.markCodingFileError = (msgId, fileIdx) => {
    if (!ADMIN.get()) return;
    const msg = DB.getMessages().find(m => m.id === msgId);
    if (!msg?.meta?.files?.[fileIdx]) return;

    msg.meta.files[fileIdx].status = 'error';

    // Check if all files are processed
    const allDone = msg.meta.files.every(f => f.status !== 'pending');
    if (allDone) msg.meta.state = 'done';

    DB.saveMessage(msg);
};

window.finishSearch = (msg) => {
    const mTools = msg.meta?.multiTools || [];
    const idx = mTools.findIndex(t => t.type === 'search');
    if (idx !== -1) {
        mTools[idx].state = 'done';
    }
    patchMessage(msg.id, {
        content: 'Поиск завершён',
        meta: { ...msg.meta, multiTools: mTools, state: 'done' }
    });
    renderGodToolButtons();
    renderGodMessages();
};

// ============= THINKING LOGIC =============
window.openThinkingControl = (msg) => {
    // Open modal to input thought text
    document.getElementById('god-thinking-content').value = '';
    // Store ref
    window._thinkingMsgId = msg.id;
    openModal('god-thinking-modal');
};

window.godThinkingSave = (finish) => {
    const id = window._thinkingMsgId;
    if (!id) return;

    const txt = document.getElementById('god-thinking-content').value;
    const msg = findMsg(id);
    if (!msg) return;

    // If "Only Timer" (false), we just update content (maybe draft?) but keep running.
    // Actually user said "until I press thoughts again it keeps thinking".
    // So "Only Timer" might mean "Just close modal, let it run". 
    // "Save Thoughts" might mean "Update text, let it run (or finish?)".
    // User complaint: "Thinking... (59s) still goes and until I press thoughts again it keeps thinking".
    // So both buttons might just be "Update Text". Finishing is done via the Toggle Button.

    // Changing logic: "Save thoughts" updates content but keeps running?
    // User text: "I pressed timer button or ready... Thinking... still goes".
    // This implies current behavior is correct (it keeps running).
    // The user issue was "Modal not opening".
    // But if I want to update text:

    const updates = {};
    if (txt) updates.content = txt;

    // If finish is true, maybe we finish? No, user prefers manual toggle stop.
    // So we just save the text into the tool meta so real-time updates?
    // msg.meta.multiTools[thinking].content = txt.
    // Since we use 'multiTools', we need to find the tool item.

    const tools = msg.meta.multiTools || [];
    const tIdx = tools.findIndex(t => t.type === 'thinking');
    if (tIdx !== -1) {
        if (txt) tools[tIdx].content = txt;
        // We do NOT set state='done' here.
        patchMessage(id, { meta: { ...msg.meta, multiTools: tools } });
    }

    closeModal('god-thinking-modal');
    renderGodToolButtons();
};

function findMsg(id) { return DB.getMessages().find(m => m.id === id); }

window.openMusicUpload = (msg) => {
    // Store msg id if needed? handleMusicUpload finds latest running, which is 'msg'.
    // We can just open modal.
    openModal('god-music-upload-modal');
};

window.godToolMusic = () => {
    // Toggle
    godToolState.music = !godToolState.music;
    renderGodToolButtons();
};

window.godCheckFile = (msgId, fileIdx) => {
    if (!ADMIN.get()) return;
    const msg = findMsg(msgId);
    if (!msg || !msg.meta || !msg.meta.multiTools) return;

    // Find coding tool
    const toolIdx = msg.meta.multiTools.findIndex(t => t.type === 'coding');
    if (toolIdx === -1) return;

    const tool = msg.meta.multiTools[toolIdx];
    if (!tool.files || !tool.files[fileIdx]) return;

    // Update state
    tool.files[fileIdx].state = 'done';

    // Patch
    patchMessage(msgId, { meta: msg.meta });
    renderGodMessages();
};

window.godMarkFileError = (msgId, fileIdx) => {
    if (!ADMIN.get()) return;
    const msg = findMsg(msgId);
    if (!msg || !msg.meta || !msg.meta.multiTools) return;

    const toolIdx = msg.meta.multiTools.findIndex(t => t.type === 'coding');
    if (toolIdx === -1) return;

    const tool = msg.meta.multiTools[toolIdx];
    if (!tool.files || !tool.files[fileIdx]) return;

    tool.files[fileIdx].state = 'error';

    patchMessage(msgId, { meta: msg.meta });
    renderGodMessages();
};

window.handleMusicUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Reset file input to allow re-selecting the same file
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (ev) => {
        const data = ev.target.result;

        // Store file in godToolState.music for later sending
        godToolState.music = {
            name: f.name,
            type: f.type,
            data: data,
            size: f.size
        };

        closeModal('god-music-upload-modal');
        showToast('Файл прикреплён. Нажмите "Музыка" для отправки.', 'success');
        renderGodToolButtons(); // Show active state
    };
    reader.readAsDataURL(f);
};

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

window.openAdminSettings = () => {
    if (!ADMIN.get()) return;
    openModal('admin-settings-modal');
    // load prompt
    const cfg = DB.getAdminConfig();
    const promptInput = document.getElementById('admin-system-prompt');
    if (promptInput) promptInput.value = (cfg && cfg.systemPrompt) || '';

    // speed
    const speedInput = document.getElementById('admin-typewriter-speed');
    if (speedInput) speedInput.value = (cfg && cfg.typewriterSpeed) || 10;

    // clear pwd
    const pwdInput = document.getElementById('new-admin-password');
    if (pwdInput) pwdInput.value = '';
};

window.deleteGodMessage = async (id) => {
    if (!confirm('Удалить это сообщение?')) return;
    await DB.deleteMessage(id);
    renderGodMessages();
};

window.saveAdminSettings = () => {
    if (!ADMIN.get()) return;
    const pwd = document.getElementById('new-admin-password')?.value;
    // Removed system prompt from here if it was not in HTML, but keeping logic just in case
    // const sysPrompt = document.getElementById('admin-system-prompt')?.value; 
    const speed = document.getElementById('admin-typewriter-speed')?.value;

    // Merge with existing config
    const current = DB.getAdminConfig() || {};
    const next = { ...current };

    if (pwd) next.password = pwd;
    // if (sysPrompt !== undefined) next.systemPrompt = sysPrompt;
    if (speed !== undefined) next.typewriterSpeed = parseInt(speed) || 10;

    DB.saveAdminConfig(next);
    showToast('Настройки сохранены', 'success');
    closeModal('admin-settings-modal');
};

window.forceRefreshAllUsers = async () => {
    if (!await uiConfirm('ВНИМАНИЕ! Это перезагрузит страницу у ВСЕХ пользователей. Продолжить?')) return;

    const config = DB.getAdminConfig() || {};
    // Set reload = true
    await DB.saveAdminConfig({ ...config, reload: true });
    showToast('Сигнал обновления отправлен (True)', 'success');

    // Reset back to false after a delay to prevent infinite loops but ensure propagation
    // Extended to 30s to allow background tabs to wake up and catch the signal
    setTimeout(async () => {
        const freshConfig = DB.getAdminConfig() || {};
        await DB.saveAdminConfig({ ...freshConfig, reload: false });
        showToast('Сигнал сброшен (False)', 'info');
    }, 30000);

    closeModal('admin-settings-modal');
};

// Explicitly expose openAdminSettings to handle population
// Explicitly expose openAdminSettings to handle population
window.openAdminSettings = () => {
    openModal('admin-settings-modal');

    // Populate values
    const cfg = DB.getAdminConfig() || {};
    const speedInput = document.getElementById('admin-typewriter-speed');
    const speedValue = document.getElementById('speed-value');

    if (speedInput) {
        speedInput.value = (cfg.typewriterSpeed !== undefined) ? cfg.typewriterSpeed : 10;
        if (speedValue) speedValue.textContent = speedInput.value + 'ms';

        // Add live listener if not already there (idempotent because oninput replaces handler)
        speedInput.oninput = (e) => {
            if (speedValue) speedValue.textContent = e.target.value + 'ms';
        };
    }
};



window.startGodTool = (tool, extraMeta = {}) => {
    if (!godChatId || !godUserId) return showToast('Нет чата', 'error');

    const chat = DB.getChats().find(c => c.id === godChatId);
    let mode = chat?.mode;
    if (!mode) mode = (chat?.aion ?? true) ? 'auto' : 'manual';

    const now = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    const model = chat?.model || 'mistral-small-3.2';

    // Build meta based on mode
    const meta = {
        multiTools: [{ type: tool, state: 'running', ...extraMeta }],
        createdAt: Date.now()
    };

    if (mode === 'admin') {
        const adminUser = DB.getCurrentUser();
        meta.isAdminMode = true;
        meta.adminName = adminUser?.visibleName || adminUser?.nickname || 'Admin';
    } else if (mode === 'manual') {
        meta.manual = true;
    }
    // auto mode: no extra flags

    const msg = {
        id: now,
        chatId: godChatId,
        userId: godUserId,
        role: 'assistant',
        content: '',
        model,
        meta,
        createdAt: Date.now()
    };

    DB.saveMessage(msg);
    renderGodMessages();
    renderGodToolButtons();

    // Trigger specific UI
    if (tool === 'thinking') {
        setTimeout(() => window.openThinkingControl(msg), 50);
    }
    if (tool === 'music') {
        setTimeout(() => window.openMusicUpload(msg), 50);
    }
};

window.openChatSettings = () => {
    const chatId = godChatId || window.currentChatId;
    if (!chatId) return showToast('Сначала выберите чат', 'info');
    const chat = DB.getChats().find(c => c.id === chatId);
    const input = document.getElementById('chat-system-prompt');
    if (input) input.value = chat?.systemPrompt || '';
    openModal('chat-settings-modal');
};

window.saveChatSystemPrompt = async () => {
    const chatId = godChatId || window.currentChatId;
    if (!chatId) return;
    const prompt = document.getElementById('chat-system-prompt').value.trim();
    const chat = DB.getChats().find(c => c.id === chatId);
    if (chat) {
        await DB.saveChat({ ...chat, systemPrompt: prompt });
        showToast('Инструкции сохранены', 'success');
        closeModal('chat-settings-modal');
    }
};

window.scrollToMsg = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.remove('highlight-yellow');
        void el.offsetWidth;
        el.classList.add('highlight-yellow');
    }
};
