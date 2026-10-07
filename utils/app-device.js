/**
 * App 本机身份（无微信 openid 时用持久化 device 身份）
 */
const KEY = "rt_app_openid";

export function getOrCreateAppOpenId() {
  try {
    const existed = uni.getStorageSync(KEY);
    if (existed && String(existed).startsWith("app_")) return String(existed);
  } catch (e) {
    /* ignore */
  }
  const id = `app_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
  try {
    uni.setStorageSync(KEY, id);
  } catch (e) {
    /* ignore */
  }
  return id;
}
