/**
 * 多会话本地持久化（历史列表 + 当前会话）
 * 兼容旧版单会话结构自动迁移
 */

const MAX_MESSAGES = 40;
const MAX_SESSIONS = 20;

function storageKey(kind) {
  return kind === "legal" ? "rt_chat_legal" : "rt_chat_village";
}

function trimMessages(list = []) {
  const arr = Array.isArray(list) ? list : [];
  if (arr.length <= MAX_MESSAGES) return arr;
  return arr.slice(arr.length - MAX_MESSAGES);
}

function uid() {
  return `s_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function titleFromMessages(messages = []) {
  const first = (messages || []).find(
    (m) => m && m.role === "user" && m.content
  );
  const t = String((first && first.content) || "")
    .trim()
    .replace(/\s+/g, " ");
  if (!t) return "新对话";
  return t.length > 18 ? `${t.slice(0, 18)}…` : t;
}

function emptySession(extra = {}) {
  return {
    id: uid(),
    title: "新对话",
    updatedAt: Date.now(),
    messages: [],
    history: [],
    suggestions: [],
    disputeContext: null,
    ...extra,
  };
}

function normalizeStore(raw) {
  if (!raw || typeof raw !== "object") {
    const s = emptySession();
    return { version: 2, currentId: s.id, sessions: [s] };
  }

  // 旧版单会话：{ messages, history, disputeContext }
  if (!Array.isArray(raw.sessions)) {
    const msgs = Array.isArray(raw.messages) ? trimMessages(raw.messages) : [];
    const s = emptySession({
      messages: msgs,
      history: Array.isArray(raw.history) ? trimMessages(raw.history) : [],
      disputeContext: raw.disputeContext || null,
      title: titleFromMessages(msgs),
      updatedAt: raw.updatedAt || Date.now(),
    });
    return { version: 2, currentId: s.id, sessions: [s] };
  }

  const sessions = raw.sessions
    .filter((s) => s && s.id)
    .map((s) => ({
      id: s.id,
      title: s.title || titleFromMessages(s.messages) || "新对话",
      updatedAt: s.updatedAt || 0,
      messages: trimMessages(s.messages || []),
      history: trimMessages(s.history || []),
      suggestions: Array.isArray(s.suggestions) ? s.suggestions : [],
      disputeContext: s.disputeContext || null,
    }))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, MAX_SESSIONS);

  if (!sessions.length) {
    const s = emptySession();
    return { version: 2, currentId: s.id, sessions: [s] };
  }

  let currentId = raw.currentId;
  if (!sessions.some((s) => s.id === currentId)) currentId = sessions[0].id;
  return { version: 2, currentId, sessions };
}

function readStore(kind) {
  try {
    const raw = uni.getStorageSync(storageKey(kind));
    return normalizeStore(raw);
  } catch (e) {
    return normalizeStore(null);
  }
}

function writeStore(kind, store) {
  try {
    const sessions = (store.sessions || [])
      .slice()
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, MAX_SESSIONS);
    uni.setStorageSync(storageKey(kind), {
      version: 2,
      currentId: store.currentId,
      sessions,
    });
  } catch (e) {
    /* ignore quota */
  }
}

export function listChatSessions(kind) {
  const store = readStore(kind);
  return store.sessions.map((s) => ({
    id: s.id,
    title: s.title || "新对话",
    updatedAt: s.updatedAt || 0,
    preview: titleFromMessages(s.messages),
    messageCount: (s.messages || []).length,
    active: s.id === store.currentId,
  }));
}

export function getCurrentChatSession(kind) {
  const store = readStore(kind);
  const cur =
    store.sessions.find((s) => s.id === store.currentId) || store.sessions[0];
  return {
    id: cur.id,
    messages: cur.messages || [],
    history: cur.history || [],
    suggestions: cur.suggestions || [],
    disputeContext: cur.disputeContext || null,
    title: cur.title || "新对话",
  };
}

export function saveCurrentChatSession(kind, payload = {}) {
  const store = readStore(kind);
  const idx = store.sessions.findIndex((s) => s.id === store.currentId);
  const base =
    idx >= 0 ? store.sessions[idx] : emptySession({ id: store.currentId });
  const messages = trimMessages(
    payload.messages != null ? payload.messages : base.messages
  );
  const next = {
    ...base,
    messages,
    history: trimMessages(
      payload.history != null ? payload.history : base.history
    ),
    suggestions:
      payload.suggestions != null
        ? payload.suggestions
        : base.suggestions || [],
    disputeContext:
      payload.disputeContext !== undefined
        ? payload.disputeContext
        : base.disputeContext,
    title: titleFromMessages(messages),
    updatedAt: Date.now(),
  };
  if (idx >= 0) store.sessions.splice(idx, 1, next);
  else store.sessions.unshift(next);
  writeStore(kind, store);
  return next;
}

export function createChatSession(kind, extra = {}) {
  const store = readStore(kind);
  // 当前已是空会话则复用，避免堆一堆「新对话」
  const cur = store.sessions.find((s) => s.id === store.currentId);
  if (cur && !(cur.messages || []).length) {
    const reused = {
      ...cur,
      ...extra,
      title: "新对话",
      updatedAt: Date.now(),
      messages: [],
      history: [],
      suggestions: [],
    };
    const i = store.sessions.findIndex((s) => s.id === cur.id);
    store.sessions.splice(i, 1, reused);
    writeStore(kind, store);
    return reused;
  }
  const s = emptySession(extra);
  store.sessions.unshift(s);
  store.currentId = s.id;
  writeStore(kind, store);
  return s;
}

export function switchChatSession(kind, id) {
  const store = readStore(kind);
  if (!store.sessions.some((s) => s.id === id))
    return getCurrentChatSession(kind);
  store.currentId = id;
  writeStore(kind, store);
  return getCurrentChatSession(kind);
}

export function deleteChatSession(kind, id) {
  const store = readStore(kind);
  store.sessions = store.sessions.filter((s) => s.id !== id);
  if (!store.sessions.length) {
    const s = emptySession();
    store.sessions = [s];
    store.currentId = s.id;
  } else if (store.currentId === id) {
    store.currentId = store.sessions[0].id;
  }
  writeStore(kind, store);
  return getCurrentChatSession(kind);
}

export function clearCurrentChatSession(kind) {
  const store = readStore(kind);
  const idx = store.sessions.findIndex((s) => s.id === store.currentId);
  if (idx < 0) {
    const s = emptySession();
    writeStore(kind, { version: 2, currentId: s.id, sessions: [s] });
    return s;
  }
  const cleared = {
    ...store.sessions[idx],
    title: "新对话",
    messages: [],
    history: [],
    suggestions: [],
    disputeContext: null,
    updatedAt: Date.now(),
  };
  store.sessions.splice(idx, 1, cleared);
  writeStore(kind, store);
  return cleared;
}

/** 按纠纷 ID 打开或创建绑定会话 */
export function openDisputeChatSession(kind, disputeContext) {
  const ctx =
    disputeContext && typeof disputeContext === "object"
      ? { ...disputeContext }
      : null;
  if (!ctx) return getCurrentChatSession(kind);

  const store = readStore(kind);
  const disputeId = ctx.id ? String(ctx.id) : "";
  if (disputeId) {
    const found = store.sessions.find(
      (s) => s.disputeContext && String(s.disputeContext.id || "") === disputeId
    );
    if (found) {
      found.disputeContext = { ...found.disputeContext, ...ctx };
      found.updatedAt = Date.now();
      if (!(found.messages || []).length && ctx.title) {
        found.title = `本案：${String(ctx.title).slice(0, 14)}`;
      }
      store.currentId = found.id;
      writeStore(kind, store);
      return getCurrentChatSession(kind);
    }
  }

  const titleHint = ctx.title
    ? `本案：${String(ctx.title).slice(0, 14)}`
    : "本案咨询";
  const created = createChatSession(kind, {
    disputeContext: ctx,
    title: titleHint,
  });
  // createChatSession 可能复用空会话，补写 title
  saveCurrentChatSession(kind, {
    messages: created.messages || [],
    history: created.history || [],
    suggestions: [],
    disputeContext: ctx,
  });
  const after = getCurrentChatSession(kind);
  if (!(after.messages || []).length) {
    const st = readStore(kind);
    const i = st.sessions.findIndex((s) => s.id === st.currentId);
    if (i >= 0) {
      st.sessions[i].title = titleHint;
      writeStore(kind, st);
    }
  }
  return getCurrentChatSession(kind);
}

export function peekChatStoreRaw(kind) {
  try {
    const raw = uni.getStorageSync(storageKey(kind));
    if (!raw || typeof raw !== "object") return null;
    return normalizeStore(raw);
  } catch (e) {
    return null;
  }
}

export function replaceChatStoreFromCloud(kind, remote) {
  const store = normalizeStore(remote);
  writeStore(kind, store);
  return getCurrentChatSession(kind);
}

/** 按 session.id 合并；同 id 取 updatedAt 较新的 */
export function mergeCloudSessionsIntoLocal(kind, remote) {
  const local = readStore(kind);
  const remoteStore = normalizeStore(remote);
  const map = Object.create(null);
  [...local.sessions, ...remoteStore.sessions].forEach((s) => {
    if (!s || !s.id) return;
    const prev = map[s.id];
    if (!prev || (s.updatedAt || 0) >= (prev.updatedAt || 0)) map[s.id] = s;
  });
  const sessions = Object.keys(map)
    .map((k) => map[k])
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, MAX_SESSIONS);

  let currentId = local.currentId;
  if (!sessions.some((s) => s.id === currentId)) {
    currentId = (sessions[0] && sessions[0].id) || remoteStore.currentId;
  }
  writeStore(kind, { version: 2, currentId, sessions });
  return getCurrentChatSession(kind);
}

/** @deprecated 兼容旧调用 */
export function loadChatSession(kind) {
  return getCurrentChatSession(kind);
}

/** @deprecated 兼容旧调用 */
export function saveChatSession(kind, payload = {}) {
  saveCurrentChatSession(kind, payload);
}

/** @deprecated 兼容旧调用 */
export function clearChatSession(kind) {
  clearCurrentChatSession(kind);
}

export function formatSessionTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (d.toDateString() === now.toDateString()) return hm;
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return `昨天 ${hm}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
}
