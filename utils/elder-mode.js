/** 老年简洁模式 */

import { COPY } from "@/utils/copy-voice.js";

const KEY = "rt_elder_mode";
const PROMPT_KEY = "rt_elder_prompt_done";

export function isElderMode() {
  try {
    return !!uni.getStorageSync(KEY);
  } catch (e) {
    return false;
  }
}

export function setElderMode(on) {
  const next = !!on;
  try {
    uni.setStorageSync(KEY, next);
  } catch (e) {
    /* ignore */
  }
  try {
    uni.$emit && uni.$emit("rt-elder-mode", next);
  } catch (e) {
    /* ignore */
  }
  // 底栏 3/5 Tab 切换需整页刷新，否则用户感觉「没变化」
  try {
    const pages = getCurrentPages();
    const cur = pages && pages[pages.length - 1];
    const route = cur && cur.route ? `/${cur.route}` : "/pages/village/village";
    // 简洁模式关掉时若在「服务」大厅，回到办事
    let url = route;
    if (!next && route === "/pages/benefit/benefit") {
      url = "/pages/village/village";
    }
    // 开启简洁且停在法治/激励/团购主 Tab：可留在原页（仍有底栏）
    setTimeout(() => {
      uni.reLaunch({ url });
    }, 80);
  } catch (e) {
    /* ignore */
  }
  return next;
}

export function toggleElderMode() {
  return setElderMode(!isElderMode());
}

/** 关闭简洁模式并提示 */
export function exitElderMode() {
  setElderMode(false);
  try {
    uni.showToast({ title: COPY.elderExitToast, icon: "success" });
  } catch (e) {
    /* ignore */
  }
  return false;
}

export function isElderPromptDone() {
  try {
    return !!uni.getStorageSync(PROMPT_KEY);
  } catch (e) {
    return false;
  }
}

export function markElderPromptDone() {
  try {
    uni.setStorageSync(PROMPT_KEY, true);
  } catch (e) {
    /* ignore */
  }
}

/** 首次进入时询问是否开启老年模式 */
export function maybeAskElderMode() {
  return new Promise((resolve) => {
    if (isElderPromptDone()) {
      resolve(isElderMode());
      return;
    }
    uni.showModal({
      title: COPY.elderAskTitle,
      content: COPY.elderAskContent,
      confirmText: "开启",
      cancelText: "暂不",
      success: (res) => {
        markElderPromptDone();
        if (res.confirm) {
          setElderMode(true);
          try {
            uni.showToast({ title: COPY.elderOnToast, icon: "none" });
          } catch (e) {
            /* ignore */
          }
        }
        resolve(isElderMode());
      },
      fail: () => {
        markElderPromptDone();
        resolve(isElderMode());
      },
    });
  });
}
