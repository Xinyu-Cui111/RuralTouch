/**
 * 端能力识别（小程序 / App / H5）
 */
import { APP_API_BASE } from "@/config/env.js";

export function getPlatform() {
  // #ifdef APP-PLUS
  return "app";
  // #endif
  // #ifdef MP-WEIXIN
  return "mp-weixin";
  // #endif
  // #ifdef H5
  return "h5";
  // #endif
  return "unknown";
}

export const isApp = getPlatform() === "app";
export const isMpWeixin = getPlatform() === "mp-weixin";
export const isH5 = getPlatform() === "h5";

/** 微信云开发仅小程序可用 */
export function canUseWxCloud() {
  return isMpWeixin;
}

/** App 未配置 HTTP 网关时走 Mock */
export function useAppMockData() {
  if (!isApp) return false;
  const base = String(APP_API_BASE || "").trim();
  return !base;
}

export function platformLabel() {
  const p = getPlatform();
  if (p === "app") return "App";
  if (p === "mp-weixin") return "微信小程序";
  if (p === "h5") return "H5";
  return p;
}
