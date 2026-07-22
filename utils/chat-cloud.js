/**
 * 聊天多会话云端同步（登录后；失败静默降级本地）
 */

import { api } from "@/api/index.js";
import { isLoggedIn } from "@/utils/cloud.js";
import {
  replaceChatStoreFromCloud,
  peekChatStoreRaw,
  mergeCloudSessionsIntoLocal,
} from "@/utils/chat-session.js";

const timers = Object.create(null);

export function scheduleChatCloudPush(kind) {
  if (!isLoggedIn()) return;
  const key = kind === "legal" ? "legal" : "village";
  if (timers[key]) clearTimeout(timers[key]);
  timers[key] = setTimeout(() => {
    pushChatStore(key);
  }, 900);
}

export async function pushChatStore(kind) {
  if (!isLoggedIn()) return;
  const store = peekChatStoreRaw(kind);
  if (!store) return;
  try {
    await api.syncChatStore({ kind, store }, { quiet: true });
  } catch (e) {
    /* offline / not deployed — 本地会话仍可用 */
  }
}

export async function pullAndMergeChatStore(kind) {
  if (!isLoggedIn()) return null;
  try {
    const res = await api.pullChatStore({ kind }, { quiet: true });
    const remote = res && res.data && res.data.store;
    if (!remote || !Array.isArray(remote.sessions)) return null;
    return mergeCloudSessionsIntoLocal(kind, remote);
  } catch (e) {
    return null;
  }
}

/** 强制用云端覆盖（一般不用；保留给调试） */
export async function pullReplaceChatStore(kind) {
  if (!isLoggedIn()) return null;
  try {
    const res = await api.pullChatStore({ kind }, { quiet: true });
    const remote = res && res.data && res.data.store;
    if (!remote) return null;
    replaceChatStoreFromCloud(kind, remote);
    return remote;
  } catch (e) {
    return null;
  }
}
