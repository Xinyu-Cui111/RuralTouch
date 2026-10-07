/**
 * 协议外链：有公网 URL 则打开浏览器；否则进应用内协议页。
 */
import { APP_PRIVACY_URL, APP_USER_AGREEMENT_URL } from "@/config/env.js";
import { goNavigate } from "@/utils/nav.js";

function openExternal(url) {
  const u = String(url || "").trim();
  if (!u || !/^https?:\/\//i.test(u)) return false;
  // #ifdef APP-PLUS
  try {
    if (typeof plus !== "undefined" && plus.runtime && plus.runtime.openURL) {
      plus.runtime.openURL(u);
      return true;
    }
  } catch (e) {
    /* fall through */
  }
  // #endif
  // #ifdef H5
  try {
    if (typeof window !== "undefined" && window.open) {
      window.open(u, "_blank");
      return true;
    }
  } catch (e) {
    /* fall through */
  }
  // #endif
  try {
    uni.setClipboardData({
      data: u,
      success: () =>
        uni.showToast({ title: "链接已复制，请用浏览器打开", icon: "none" }),
    });
    return true;
  } catch (e) {
    return false;
  }
}

export function hasExternalPrivacyUrl() {
  return /^https?:\/\//i.test(String(APP_PRIVACY_URL || "").trim());
}

export function hasExternalUserAgreementUrl() {
  return /^https?:\/\//i.test(String(APP_USER_AGREEMENT_URL || "").trim());
}

export function openPrivacyPolicy() {
  if (openExternal(APP_PRIVACY_URL)) return;
  goNavigate("/pages/agreement/privacy");
}

export function openUserAgreement() {
  if (openExternal(APP_USER_AGREEMENT_URL)) return;
  goNavigate("/pages/agreement/user");
}

export function openLegalDoc(type) {
  if (type === "privacy") openPrivacyPolicy();
  else openUserAgreement();
}
