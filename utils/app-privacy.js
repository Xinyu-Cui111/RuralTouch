/**
 * App 首启隐私同意（国内安卓上架常见要求）
 */
const KEY = "rt_app_privacy_agreed";
const KEY_AT = "rt_app_privacy_agreed_at";

export function isAppPrivacyAgreed() {
  try {
    return !!uni.getStorageSync(KEY);
  } catch (e) {
    return false;
  }
}

export function markAppPrivacyAgreed() {
  try {
    uni.setStorageSync(KEY, true);
    uni.setStorageSync(KEY_AT, Date.now());
  } catch (e) {
    /* ignore */
  }
}

export function clearAppPrivacyAgreed() {
  try {
    uni.removeStorageSync(KEY);
    uni.removeStorageSync(KEY_AT);
  } catch (e) {
    /* ignore */
  }
}

/** 仅 App 需要首启同意；小程序走登录页协议勾选 */
export function needsAppPrivacyGate() {
  // #ifdef APP-PLUS
  return !isAppPrivacyAgreed();
  // #endif
  return false;
}

export function quitAppIfNeeded() {
  // #ifdef APP-PLUS
  try {
    if (typeof plus !== "undefined" && plus.runtime && plus.runtime.quit) {
      plus.runtime.quit();
      return;
    }
  } catch (e) {
    /* ignore */
  }
  // #endif
  uni.showToast({ title: "请同意后再使用", icon: "none" });
}
