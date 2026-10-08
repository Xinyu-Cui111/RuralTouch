import { isLoggedIn } from "@/utils/cloud.js";
import { goNavigate, goReLaunch } from "@/utils/nav.js";
import { goBootHome, clearSkipDirectDetail } from "@/utils/boot-route.js";

const ONBOARDING_KEY = "rt_onboarding_done";

/**
 * 需要登录时再调。游客可先逛首页/法治/团购展示。
 * 审核要求：先浏览功能，再自愿选择登录（勿强制落地授权）。
 * @returns {boolean}
 */
export function ensureLoggedIn(opts = {}) {
  if (isLoggedIn()) return true;
  const tip = opts.tip || "办理业务请先登录";
  if (opts.silent) {
    goNavigate("/pages/login/login");
    return false;
  }
  uni.showModal({
    title: "需要登录",
    content: `${tip}。也可先返回继续浏览公开内容。`,
    confirmText: "去登录",
    cancelText: "再逛逛",
    success: (res) => {
      if (res.confirm) goNavigate("/pages/login/login");
    },
  });
  return false;
}

export function isOnboardingDone() {
  return !!uni.getStorageSync(ONBOARDING_KEY);
}

export function markOnboardingDone() {
  uni.setStorageSync(ONBOARDING_KEY, true);
}

export async function goAfterLogin() {
  if (!isOnboardingDone()) {
    goReLaunch("/pages/onboarding/onboarding");
    return;
  }
  clearSkipDirectDetail();
  await goBootHome();
}

export function goProfile() {
  goReLaunch("/pages/profile/profile");
}

export function goAiAssistant() {
  if (!ensureLoggedIn({ tip: "咨询协办请先登录" })) return;
  goNavigate("/pages/ai/assistant");
}
