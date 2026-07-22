/** 下次沟通（结构化，本地+跟进说明） */

const KEY = "rt_next_contact_map";

function readMap() {
  try {
    const m = uni.getStorageSync(KEY);
    return m && typeof m === "object" ? m : {};
  } catch (e) {
    return {};
  }
}

function writeMap(m) {
  try {
    uni.setStorageSync(KEY, m || {});
  } catch (e) {
    /* ignore */
  }
}

export function setNextContact(disputeId, contact) {
  const id = String(disputeId || "");
  if (!id || !contact) return;
  const map = readMap();
  map[id] = {
    when: String(contact.when || "").trim(),
    how: String(contact.how || "").trim(),
    at: Date.now(),
  };
  writeMap(map);
  return map[id];
}

export function getNextContact(disputeId) {
  const id = String(disputeId || "");
  const c = readMap()[id];
  if (!c || (!c.when && !c.how)) return null;
  return c;
}

export function formatNextContact(contact) {
  if (!contact) return "";
  if (contact.when && contact.how)
    return `下次沟通：${contact.when}（${contact.how}）`;
  if (contact.when) return `下次沟通：${contact.when}`;
  return "";
}

export function clearNextContact(disputeId) {
  const map = readMap();
  delete map[String(disputeId || "")];
  writeMap(map);
}
