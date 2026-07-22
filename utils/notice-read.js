/**
 * 村务通知已读（本地）：用于未读角标
 */

const KEY = "rt_notice_read_ids";

function readSet() {
  try {
    const raw = uni.getStorageSync(KEY);
    if (Array.isArray(raw)) return new Set(raw.map(String));
    return new Set();
  } catch (e) {
    return new Set();
  }
}

function writeSet(set) {
  try {
    uni.setStorageSync(KEY, Array.from(set));
  } catch (e) {
    /* ignore */
  }
}

export function markNoticeRead(id) {
  if (!id) return;
  const set = readSet();
  set.add(String(id));
  writeSet(set);
}

export function isNoticeRead(id) {
  if (!id) return true;
  return readSet().has(String(id));
}

export function countUnreadNotices(list = []) {
  const set = readSet();
  return (list || []).filter((n) => n && n._id && !set.has(String(n._id)))
    .length;
}

export function clearNoticeReadState() {
  try {
    uni.removeStorageSync(KEY);
  } catch (e) {
    /* ignore */
  }
}
