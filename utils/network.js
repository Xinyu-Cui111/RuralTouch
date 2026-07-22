/**
 * 网络状态（小程序）
 */

let listening = false;
const listeners = new Set();

function emit(online) {
  listeners.forEach((fn) => {
    try {
      fn(online);
    } catch (e) {
      /* ignore */
    }
  });
}

function ensureListen() {
  if (listening) return;
  listening = true;
  try {
    uni.onNetworkStatusChange((res) => {
      emit(!!(res && res.isConnected));
    });
  } catch (e) {
    /* ignore */
  }
}

export function getNetworkOnline() {
  return new Promise((resolve) => {
    try {
      uni.getNetworkType({
        success: (res) => {
          const t = (res && res.networkType) || "unknown";
          resolve(t !== "none");
        },
        fail: () => resolve(true),
      });
    } catch (e) {
      resolve(true);
    }
  });
}

/** 订阅在线状态变化，返回取消函数 */
export function watchNetwork(onChange) {
  if (typeof onChange !== "function") return () => {};
  ensureListen();
  listeners.add(onChange);
  getNetworkOnline().then(onChange);
  return () => listeners.delete(onChange);
}
