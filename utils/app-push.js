/**
 * App 推送占位（S4）
 * 正式厂商通道 / uniPush 在 S5+ 接入；此处仅本地开关与 clientId 采集占位。
 */
const ENABLED_KEY = "rt_app_push_enabled";
const CLIENT_ID_KEY = "rt_app_push_cid";

export function isAppPushEnabled() {
  try {
    const v = uni.getStorageSync(ENABLED_KEY);
    if (v === "" || v == null) return false;
    return !!v;
  } catch (e) {
    return false;
  }
}

export function setAppPushEnabled(on) {
  try {
    uni.setStorageSync(ENABLED_KEY, !!on);
  } catch (e) {
    /* ignore */
  }
}

export function getCachedPushClientId() {
  try {
    return String(uni.getStorageSync(CLIENT_ID_KEY) || "");
  } catch (e) {
    return "";
  }
}

function saveClientId(cid) {
  if (!cid) return;
  try {
    uni.setStorageSync(CLIENT_ID_KEY, String(cid));
  } catch (e) {
    /* ignore */
  }
}

/**
 * 尝试读取推送 clientId（未开通 uniPush 时静默失败）
 * @returns {Promise<string>}
 */
export function fetchPushClientId() {
  return new Promise((resolve) => {
    // #ifdef APP-PLUS
    try {
      if (typeof uni.getPushClientId === "function") {
        uni.getPushClientId({
          success: (res) => {
            const cid =
              (res && (res.cid || res.clientid || res.clientId)) || "";
            if (cid) saveClientId(cid);
            resolve(String(cid || ""));
          },
          fail: () => resolve(getCachedPushClientId()),
        });
        return;
      }
    } catch (e) {
      /* ignore */
    }
    try {
      if (typeof plus !== "undefined" && plus.push && plus.push.getClientInfo) {
        plus.push.getClientInfo((info) => {
          const cid = (info && (info.clientid || info.clientId)) || "";
          if (cid) saveClientId(cid);
          resolve(String(cid || ""));
        });
        return;
      }
    } catch (e) {
      /* ignore */
    }
    // #endif
    resolve(getCachedPushClientId());
  });
}

/**
 * 首启同意隐私后调用：若用户曾开启提醒，则尝试取 clientId
 */
export async function initAppPushPlaceholder() {
  // #ifdef APP-PLUS
  if (!isAppPushEnabled()) return { enabled: false, clientId: "" };
  const clientId = await fetchPushClientId();
  return { enabled: true, clientId };
  // #endif
  return { enabled: false, clientId: "" };
}

/**
 * 设置页切换推送意向
 * @returns {Promise<{ enabled: boolean, clientId: string, tip: string }>}
 */
export async function toggleAppPushIntent() {
  const next = !isAppPushEnabled();
  setAppPushEnabled(next);
  if (!next) {
    return {
      enabled: false,
      clientId: getCachedPushClientId(),
      tip: "已关闭办件进度提醒意向",
    };
  }
  const clientId = await fetchPushClientId();
  return {
    enabled: true,
    clientId,
    tip: clientId
      ? "已记录本机推送标识（正式通道待开通）"
      : "已开启意向；正式推送通道开通后生效",
  };
}
