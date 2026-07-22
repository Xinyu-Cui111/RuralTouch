import { CLOUD_ENV_ID, USE_MOCK_ON_H5 } from "@/config/env.js";
import { mockApi } from "@/utils/mock.js";

let cloudReady = false;

export function initCloud() {
  // #ifdef MP-WEIXIN
  if (cloudReady) return true;
  if (typeof wx === "undefined" || !wx.cloud) {
    console.error("请使用 2.2.3 及以上基础库以支持云能力");
    return false;
  }
  try {
    wx.cloud.init({
      env: CLOUD_ENV_ID,
      traceUser: true,
    });
    cloudReady = true;
    return true;
  } catch (e) {
    console.warn("[initCloud] failed", e);
    return false;
  }
  // #endif

  // #ifdef H5
  return USE_MOCK_ON_H5;
  // #endif

  return false;
}

function normalizeError(error, result) {
  if (result && result.message) return String(result.message);
  if (error == null)
    return "云能力异常（返回为空，请检查云环境与 rt-api 是否已部署）";
  if (typeof error === "string") return error;
  if (error.errMsg) return String(error.errMsg);
  if (error.message) return String(error.message);
  try {
    return JSON.stringify(error);
  } catch (e) {
    return "请求失败";
  }
}

/** Promise 包装，避免部分基础库 fail 回调传入 undefined 导致 SDK 读 errMsg 崩 */
function callCloudFunction(name, data) {
  return new Promise((resolve, reject) => {
    try {
      if (!wx.cloud || typeof wx.cloud.callFunction !== "function") {
        reject(new Error("当前基础库不支持云函数"));
        return;
      }
      wx.cloud.callFunction({
        name,
        data,
        success: (res) => {
          if (!res) {
            reject(new Error("云函数无返回，请确认已开通云开发并部署 rt-api"));
            return;
          }
          resolve(res);
        },
        fail: (err) => {
          reject(new Error(normalizeError(err)));
        },
      });
    } catch (e) {
      reject(new Error(normalizeError(e)));
    }
  });
}

export async function callApi(action, data = {}, opts = {}) {
  const quiet = !!(opts && opts.quiet);
  // #ifdef MP-WEIXIN
  if (!initCloud()) {
    throw new Error("云能力初始化失败，请在开发者工具开通云开发");
  }
  try {
    const res = await callCloudFunction("rt-api", { action, data });
    const result = (res && res.result) || {};
    if (result.code !== 0) {
      throw new Error(normalizeError(null, result));
    }
    return result;
  } catch (error) {
    const msg = normalizeError(error);
    // 可选能力（如会话云同步）未部署时不打红错，避免控制台刷屏
    if (quiet || /未知操作/.test(msg)) {
      if (!quiet) console.warn("[callApi]", action, msg);
    } else {
      console.error("[callApi]", action, error);
    }
    if (CLOUD_ENV_ID === "your-cloud-env-id") {
      console.warn("云环境未配置，回退到 Mock 数据", error);
      return mockApi(action, data);
    }
    throw new Error(msg);
  }
  // #endif

  // #ifdef H5
  if (USE_MOCK_ON_H5) {
    return Promise.resolve(mockApi(action, data));
  }
  throw new Error("H5 模式未启用 Mock");
  // #endif
}

/** 补集合：失败只打日志，绝不抛到启动链路 */
export function ensureCollectionsSafe() {
  // #ifdef MP-WEIXIN
  return callApi("ensureCollections")
    .then(() => true)
    .catch((err) => {
      console.warn("[ensureCollections]", (err && err.message) || err);
      return false;
    });
  // #endif
  // #ifdef H5
  return Promise.resolve(false);
  // #endif
}

export async function wxLogin() {
  // #ifdef MP-WEIXIN
  if (!initCloud()) {
    throw new Error("云能力初始化失败");
  }
  const loginRes = await new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (!res || !res.code) {
          reject(new Error("wx.login 未返回 code"));
          return;
        }
        resolve(res);
      },
      fail: (err) => reject(new Error(normalizeError(err) || "wx.login 失败")),
    });
  });
  const result = await callApi("login", { code: loginRes.code });
  if (!result.data || !result.data.token) {
    throw new Error("登录返回数据异常");
  }
  uni.setStorageSync("rt_token", result.data.token);
  uni.setStorageSync("rt_user", result.data.user);
  // 登录成功后再补集合，避免 App.onLaunch 触发云 SDK 异常
  ensureCollectionsSafe();
  return result.data;
  // #endif

  // #ifdef H5
  const result = await callApi("login", { nickname: "演示村民" });
  if (result.data && result.data.token) {
    uni.setStorageSync("rt_token", result.data.token);
    uni.setStorageSync("rt_user", result.data.user);
  }
  return result.data;
  // #endif
}

export function getLocalUser() {
  try {
    return uni.getStorageSync("rt_user") || null;
  } catch (e) {
    return null;
  }
}

export function isLoggedIn() {
  return !!uni.getStorageSync("rt_token");
}

export function logout() {
  uni.removeStorageSync("rt_token");
  uni.removeStorageSync("rt_user");
}

export async function uploadEvidenceImages(tempFilePaths = []) {
  // #ifdef MP-WEIXIN
  if (!initCloud()) {
    throw new Error("云能力初始化失败");
  }
  const results = [];
  for (let i = 0; i < tempFilePaths.length; i++) {
    const filePath = tempFilePaths[i];
    const ext = (filePath.match(/\.(\w+)$/) || [, "jpg"])[1];
    const cloudPath = `evidence/${Date.now()}-${i}.${ext}`;
    const res = await new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success: resolve,
        fail: (err) => reject(new Error(normalizeError(err) || "上传失败")),
      });
    });
    results.push({
      fileID: res.fileID,
      cloudPath,
      name: `证据${i + 1}`,
    });
  }
  return results;
  // #endif

  // #ifdef H5
  return tempFilePaths.map((path, i) => ({
    fileID: `mock://${path}`,
    cloudPath: path,
    name: `证据${i + 1}`,
    mockUrl: path,
  }));
  // #endif
}

/** 微信 chooseAvatar 返回的临时路径，开发者工具重启后常 500，不可持久化展示 */
export function isEphemeralAvatarUrl(url) {
  const s = String(url || "").trim();
  if (!s) return true;
  if (/^cloud:\/\//i.test(s)) return false;
  if (/^https?:\/\/(tmp|127\.0\.0\.1|localhost)/i.test(s)) return true;
  if (/^wxfile:\/\//i.test(s)) return true;
  if (/__tmp__/i.test(s)) return true;
  return false;
}

/** 上传头像到云存储，返回可持久 fileID */
export async function uploadAvatarImage(tempFilePath) {
  if (!tempFilePath) throw new Error("无头像文件");
  // #ifdef MP-WEIXIN
  if (!initCloud()) throw new Error("云能力初始化失败");
  const ext = (String(tempFilePath).match(/\.(\w+)(\?|$)/) || [, "jpg"])[1];
  const cloudPath = `avatar/${Date.now()}.${ext || "jpg"}`;
  const res = await new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath,
      success: resolve,
      fail: (err) => reject(new Error(normalizeError(err) || "头像上传失败")),
    });
  });
  if (!res || !res.fileID) throw new Error("头像上传失败");
  return { fileID: res.fileID, cloudPath };
  // #endif
  // #ifdef H5
  return { fileID: tempFilePath, cloudPath: tempFilePath };
  // #endif
}
