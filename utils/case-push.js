/** 干部推进后 → 村民站内可读提示（含本机推进 + 村民拉列表相位差） */

import { COPY } from "@/utils/copy-voice.js";
import { normalizePhase } from "@/utils/dispute-workflow.js";
import { advanceNoticeMessage, oralStatusLine } from "@/utils/case-timeline.js";

const KEY = "rt_case_push_list";
const SEEN_KEY = "rt_case_phase_seen";

export function readCasePushes() {
  try {
    const list = uni.getStorageSync(KEY);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function readSeenMap() {
  try {
    const m = uni.getStorageSync(SEEN_KEY);
    return m && typeof m === "object" ? m : {};
  } catch (e) {
    return {};
  }
}

function writeSeenMap(map) {
  try {
    uni.setStorageSync(SEEN_KEY, map || {});
  } catch (e) {
    /* ignore */
  }
}

export function pushCaseNotice({ disputeId, title, message }) {
  const item = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    disputeId: disputeId || "",
    title: title || "办件进展",
    message: message || "",
    read: false,
    at: Date.now(),
  };
  const list = [item, ...readCasePushes()].slice(0, 20);
  try {
    uni.setStorageSync(KEY, list);
  } catch (e) {
    /* ignore */
  }
  return item;
}

export function latestUnreadPush() {
  return readCasePushes().find((p) => p && !p.read) || null;
}

export function markPushRead(id) {
  const list = readCasePushes().map((p) =>
    p.id === id ? { ...p, read: true } : p
  );
  try {
    uni.setStorageSync(KEY, list);
  } catch (e) {
    /* ignore */
  }
}

export function markAllPushesRead() {
  const list = readCasePushes().map((p) => ({ ...p, read: true }));
  try {
    uni.setStorageSync(KEY, list);
  } catch (e) {
    /* ignore */
  }
}

/** 干部本机推进写入；真闭环靠 syncCasePushFromDisputes */
export function pushAdvanceNotice(dispute, advanceKey, note, nextContact) {
  const title = (dispute && dispute.title) || "调解办件";
  const message = advanceNoticeMessage(advanceKey, note, nextContact);
  const id = (dispute && (dispute._id || dispute.id)) || "";
  if (id) {
    const seen = readSeenMap();
    const phaseByAdvance = {
      accept: "accepted",
      handle: "handling",
      complete: "completed",
    };
    if (phaseByAdvance[advanceKey]) seen[id] = phaseByAdvance[advanceKey];
    else seen[id] = normalizePhase(dispute);
    writeSeenMap(seen);
  }
  return pushCaseNotice({
    disputeId: id,
    title: `${COPY.casePushPrefix}：${title}`.slice(0, 40),
    message: message || "办件状态已更新，请查看进度",
  });
}

/**
 * 村民拉办件列表后：对比上次看到的相位，有变化则生成未读进展
 * （修复：干部账号本机 push 村民账号读不到）
 */
export function syncCasePushFromDisputes(list = []) {
  const seen = readSeenMap();
  let changed = false;
  (list || []).forEach((d) => {
    if (!d || !(d._id || d.id)) return;
    const id = d._id || d.id;
    const phase = normalizePhase(d);
    const prev = seen[id];
    if (prev == null) {
      seen[id] = phase;
      changed = true;
      return;
    }
    if (prev !== phase) {
      pushCaseNotice({
        disputeId: id,
        title: `${COPY.casePushPrefix}：${(d.title || "调解办件").slice(
          0,
          24
        )}`,
        message: `${oralStatusLine(d)}。点此查看进度。`,
      });
      seen[id] = phase;
      changed = true;
    }
  });
  if (changed) writeSeenMap(seen);
  return latestUnreadPush();
}
