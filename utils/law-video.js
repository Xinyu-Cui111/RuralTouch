/**
 * 普法视频解析：
 * 1) 固定 HTTPS / CDN
 * 2) 云函数 getTempFileURL → HTTPS
 * 3) cloud:// fileID
 *
 * 小程序构建仍可引用本模块，但 FEATURE_LAW_VIDEO=false 时页面不会进入播放。
 * video.poster 只接受网络地址；本地封面用外层 <image>。
 */
import {
  LAW_VIDEO_CLOUD_FILE_ID,
  LAW_VIDEO_HTTPS,
  USE_LAW_VIDEO_CLOUD,
} from "@/config/env.js";
import { callApi, initCloud } from "@/utils/cloud.js";

const CACHE_KEY = "rt_law_video_https_v2";
const CACHE_AT = "rt_law_video_https_at_v2";
const CACHE_FID = "rt_law_video_https_fid_v2";
const CACHE_TTL = 40 * 60 * 1000;

function errText(e) {
  if (!e) return "unknown";
  if (typeof e === "string") return e;
  return e.errMsg || e.message || e.errCode || JSON.stringify(e);
}

/** @deprecated 主包已不含 mp4 */
export function getLocalLawVideoSrc() {
  return String(LAW_VIDEO_HTTPS || "").trim() || "";
}

export function getLawCover() {
  return "/static/lite/law-cover.jpg";
}

export function getLawVideoCover() {
  return getLawCover();
}

export function clearLawVideoCache() {
  try {
    uni.removeStorageSync(CACHE_KEY);
    uni.removeStorageSync(CACHE_AT);
    uni.removeStorageSync(CACHE_FID);
  } catch (e) {
    /* ignore */
  }
}

function readHttpsCache(fileId) {
  try {
    const cached = uni.getStorageSync(CACHE_KEY);
    const cachedFid = uni.getStorageSync(CACHE_FID);
    const at = Number(uni.getStorageSync(CACHE_AT) || 0);
    if (
      cached &&
      cachedFid === fileId &&
      at &&
      Date.now() - at < CACHE_TTL &&
      /^https?:\/\//.test(String(cached))
    ) {
      return String(cached);
    }
  } catch (e) {
    /* ignore */
  }
  return "";
}

function writeHttpsCache(fileId, url) {
  try {
    uni.setStorageSync(CACHE_KEY, url);
    uni.setStorageSync(CACHE_AT, Date.now());
    uni.setStorageSync(CACHE_FID, fileId);
  } catch (e) {
    /* ignore */
  }
}

/**
 * @returns {Promise<Array<{ src: string, from: string, hint?: string }>>}
 */
export async function listLawVideoCandidates() {
  const list = [];
  const httpsFixed = String(LAW_VIDEO_HTTPS || "").trim();
  const fileId = String(LAW_VIDEO_CLOUD_FILE_ID || "").trim();
  const wantCloud = USE_LAW_VIDEO_CLOUD !== false;

  if (/^https?:\/\//.test(httpsFixed)) {
    list.push({ src: httpsFixed, from: "https-config" });
  }

  if (wantCloud && fileId) {
    const cached = readHttpsCache(fileId);
    if (cached) {
      list.push({ src: cached, from: "cache" });
    } else if (initCloud()) {
      try {
        const res = await callApi(
          "getLawVideoUrl",
          { fileID: fileId },
          { quiet: true }
        );
        const url = res && res.data && res.data.url;
        if (url && /^https?:\/\//.test(String(url))) {
          writeHttpsCache(fileId, String(url));
          list.push({ src: String(url), from: "cloud-fn" });
        }
      } catch (e) {
        console.warn("[law-video] getLawVideoUrl", errText(e));
      }
    }
    list.push({
      src: fileId,
      from: "cloud-id",
      hint: "若无法播放：请上传云存储或配置 LAW_VIDEO_HTTPS。",
    });
  }

  const seen = new Set();
  return list.filter((item) => {
    const key = String(item.src);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function resolveLawVideoSrc() {
  const candidates = await listLawVideoCandidates();
  const first = candidates[0] || {
    src: String(LAW_VIDEO_HTTPS || "").trim(),
    from: "https-config",
    hint: "无可用视频源",
  };
  return { ...first, candidates };
}
