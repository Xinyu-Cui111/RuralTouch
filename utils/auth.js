import { isLoggedIn } from "@/utils/cloud.js";
import { goNavigate, goReLaunch } from "@/utils/nav.js";
import { goBootHome, clearSkipDirectDetail } from "@/utils/boot-route.js";

const ONBOARDING_KEY = "rt_onboarding_done";

export function ensureLoggedIn() {
  if (!isLoggedIn()) {
    goReLaunch("/pages/login/login");
    return false;
  }
  return true;
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
  goNavigate("/pages/ai/assistant");
}
