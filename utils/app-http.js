/**
 * App HTTP 客户端（S3）
 * POST {APP_API_BASE}{APP_API_PATH}  body: { action, data, token }
 */
import { APP_API_BASE, APP_API_PATH, APP_API_TIMEOUT } from "@/config/env.js";

export function isAppHttpConfigured() {
  const base = String(APP_API_BASE || "").trim();
  return !!base && /^https?:\/\//i.test(base);
}

export function getAppApiBase() {
  return String(APP_API_BASE || "")
    .trim()
    .replace(/\/+$/, "");
}

export function getAppApiUrl() {
  const base = getAppApiBase();
  const path = String(APP_API_PATH || "").trim();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * @returns {Promise<object>} 与云函数 result 同形：{ code, data, message? }
 */
export function appHttpCall(action, data = {}, token = "") {
  const url = getAppApiUrl();
  if (!url) {
    return Promise.reject(new Error("未配置 APP_API_BASE"));
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: "POST",
      timeout: Number(APP_API_TIMEOUT) || 20000,
      header: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      data: {
        action,
        data: data || {},
        token: token || "",
      },
      success: (res) => {
        const status = res.statusCode || 0;
        const body = res.data;
        if (status >= 200 && status < 300) {
          if (body && typeof body === "object") {
            resolve(body);
            return;
          }
          reject(new Error("网关返回格式异常"));
          return;
        }
        const msg = (body && (body.message || body.errMsg)) || `HTTP ${status}`;
        reject(new Error(msg));
      },
      fail: (err) => {
        reject(
          new Error((err && (err.errMsg || err.message)) || "网络请求失败")
        );
      },
    });
  });
}
