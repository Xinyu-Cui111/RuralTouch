/**
 * 成案短缓存：同一 title+content 在 TTL 内复用结果，省 LLM 成本、降时延。
 * 云函数实例内存级；冷启动后失效属预期。
 */
const TTL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 40;
const store = new Map();

function normalize(title, content) {
  return `${String(title || "").trim()}||${String(
    content || ""
  ).trim()}`.replace(/\s+/g, " ");
}

function hashKey(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `a:${(h >>> 0).toString(36)}:${text.length}`;
}

function getAssistCache(title, content) {
  const raw = normalize(title, content);
  if (raw.length < 8) return null;
  const key = hashKey(raw);
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) {
    store.delete(key);
    return null;
  }
  return { key, data: hit.data };
}

function setAssistCache(title, content, data) {
  const raw = normalize(title, content);
  if (raw.length < 8 || !data) return;
  const key = hashKey(raw);
  store.set(key, { at: Date.now(), data: JSON.parse(JSON.stringify(data)) });
  if (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    store.delete(oldest);
  }
}

module.exports = { getAssistCache, setAssistCache, TTL_MS };
