/**
 * 订阅消息（演示可配置）
 * 在公众平台申请模板后，把模板 ID 填入 config/env.js 的 SUBSCRIBE_TMPL_IDS。
 */
import { SUBSCRIBE_TMPL_IDS } from "@/config/env.js";

const ASKED_KEY = "rt_subscribe_asked_dispute";

function tmplId(key) {
  const map = SUBSCRIBE_TMPL_IDS || {};
  return String(map[key] || "").trim();
}

/**
 * 建档成功后请求「调解进度」订阅。
 * 未配置模板 ID 时：仅首次轻提示，不弹系统授权。
 */
export function requestDisputeProgressSubscribe() {
  const id = tmplId("disputeProgress");
  // 非微信小程序环境跳过
  // eslint-disable-next-line no-undef
  const isMp = typeof wx !== "undefined" && wx.requestSubscribeMessage;

  if (!id || !isMp) {
    try {
      if (!uni.getStorageSync(ASKED_KEY)) {
        uni.setStorageSync(ASKED_KEY, 1);
        uni.showToast({
          title: "上线后可开启进度提醒",
          icon: "none",
          duration: 2200,
        });
      }
    } catch (e) {
      /* ignore */
    }
    return Promise.resolve({
      skipped: true,
      reason: id ? "not-mp" : "no-tmpl",
    });
  }

  return new Promise((resolve) => {
    try {
      uni.requestSubscribeMessage({
        tmplIds: [id],
        success: (res) => resolve({ ok: true, res }),
        fail: (err) => resolve({ ok: false, err }),
      });
    } catch (e) {
      resolve({ ok: false, err: e });
    }
  });
}
