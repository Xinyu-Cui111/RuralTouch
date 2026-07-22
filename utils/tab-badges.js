/**
 * Tab 角标缓存：首页未读通知 / 进行中办件
 */
import { api } from "@/api/index.js";
import { countUnreadNotices } from "@/utils/notice-read.js";

export const TAB_BADGE_KEY = "rt_tab_badges";

export function readTabBadges() {
  try {
    const raw = uni.getStorageSync(TAB_BADGE_KEY);
    if (raw && typeof raw === "object") {
      return {
        noticeUnread: Number(raw.noticeUnread) || 0,
        handling: Number(raw.handling) || 0,
        updatedAt: Number(raw.updatedAt) || 0,
      };
    }
  } catch (e) {
    /* ignore */
  }
  return { noticeUnread: 0, handling: 0, updatedAt: 0 };
}

export function writeTabBadges(partial = {}) {
  const next = {
    ...readTabBadges(),
    ...partial,
    updatedAt: Date.now(),
  };
  try {
    uni.setStorageSync(TAB_BADGE_KEY, next);
  } catch (e) {
    /* ignore */
  }
  return next;
}

export async function refreshTabBadges() {
  let noticeUnread = 0;
  let handling = 0;
  try {
    const res = await api.listNotices();
    noticeUnread = countUnreadNotices((res.data && res.data.list) || []);
  } catch (e) {
    /* keep 0 */
  }
  try {
    const res = await api.listDisputes();
    handling = ((res.data && res.data.list) || []).filter(
      (d) => d && d.status !== "completed"
    ).length;
  } catch (e) {
    /* keep 0 */
  }
  return writeTabBadges({ noticeUnread, handling });
}
