/** 村民催办（演示：本地队列，同设备干部台可读） */

const KEY = "rt_urge_queue";

export function readUrges() {
  try {
    const list = uni.getStorageSync(KEY);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

export function urgeDispute(disputeId, title) {
  const id = String(disputeId || "");
  if (!id) return null;
  const item = {
    id: `u_${Date.now()}`,
    disputeId: id,
    title: title || "调解办件",
    at: Date.now(),
    read: false,
  };
  const rest = readUrges().filter((u) => u.disputeId !== id);
  const list = [item, ...rest].slice(0, 40);
  try {
    uni.setStorageSync(KEY, list);
    uni.setStorageSync(`rt_urge_${id}`, item.at);
  } catch (e) {
    /* ignore */
  }
  return item;
}

export function hasUrge(disputeId) {
  const id = String(disputeId || "");
  return readUrges().some((u) => u.disputeId === id && !u.read);
}

export function urgeAt(disputeId) {
  try {
    return Number(uni.getStorageSync(`rt_urge_${disputeId}`)) || 0;
  } catch (e) {
    return 0;
  }
}

export function markUrgeHandled(disputeId) {
  const id = String(disputeId || "");
  const list = readUrges().map((u) =>
    u.disputeId === id ? { ...u, read: true } : u
  );
  try {
    uni.setStorageSync(KEY, list);
  } catch (e) {
    /* ignore */
  }
}

export function countOpenUrges() {
  return readUrges().filter((u) => u && !u.read).length;
}
