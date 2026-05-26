import { createSSRApp } from "vue";
import App from "./App.vue";
import "./uni.scss";
import {
  cloudAssetState,
  resolveCloudAsset,
  WX_CLOUD_ENV_ID,
} from "./utils/cloudAssetRuntime.js";

// #ifdef MP-WEIXIN
if (typeof wx !== "undefined" && wx.cloud) {
  wx.cloud.init({
    env: WX_CLOUD_ENV_ID,
    traceUser: true,
  });
}
// #endif

// 全局兼容 shim：防止运行时代码调用未定义的 getActiveAppWindow/getInstanceWindow
if (typeof window !== "undefined") {
  window.__global = window.__global || window;
  window.__global.getActiveAppWindow =
    window.__global.getActiveAppWindow || (() => window);
  window.getInstanceWindow = window.getInstanceWindow || (() => window);
}

export function createApp() {
  const app = createSSRApp(App);
  app.config.globalProperties.$cloudAssetUrl = resolveCloudAsset;
  app.config.globalProperties.$cloudAssetState = cloudAssetState;
  return {
    app,
  };
}
