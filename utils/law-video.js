/**

 * 普法视频解析（与常见小程序一致）：

 * 1) 固定 HTTPS / CDN（最优，模拟器也能播）

 * 2) 云函数 getTempFileURL → HTTPS

 * 3) cloud:// fileID

 * 4) 包内 mp4（仅兜底；开发者工具模拟器经常解不了码）

 *

 * 注意：video.poster 只接受网络地址；本地封面用外层 <image>。

 */

import {
  LAW_VIDEO_CLOUD_FILE_ID,
  LAW_VIDEO_HTTPS,
  LAW_VIDEO_SRC,
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

export function getLocalLawVideoSrc() {
  return LAW_VIDEO_SRC || "/static/law-videos/law.mp4";
}

/** 封面：从 law.mp4 截帧；勿用作 video.poster（仅支持网络地址） */

export function getLawVideoCover() {
  return "/static/lite/law-cover.jpg";
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

 * 返回候选列表，播放失败时可换下一个。

 * @returns {Promise<Array<{ src: string, from: string, hint?: string }>>}

 */

export async function listLawVideoCandidates() {
  const list = [];

  const httpsFixed = String(LAW_VIDEO_HTTPS || "").trim();

  const fileId = String(LAW_VIDEO_CLOUD_FILE_ID || "").trim();

  const local = getLocalLawVideoSrc();

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

      hint: "若无法播放：请在云存储上传 law.mp4，或改用 HTTPS CDN。",
    });
  }

  list.push({
    src: local,

    from: "local",

    hint: "包内视频。模拟器常播不了，请用「真机调试」。",
  });

  const seen = new Set();

  return list.filter((item) => {
    const key = String(item.src);

    if (seen.has(key)) return false;

    seen.add(key);

    return true;
  });
}

/**

 * @returns {Promise<{ src: string, from: string, hint?: string, candidates: Array }>}

 */

export async function resolveLawVideoSrc() {
  const candidates = await listLawVideoCandidates();

  const first = candidates[0] || {
    src: getLocalLawVideoSrc(),

    from: "local",

    hint: "无可用视频源",
  };

  return { ...first, candidates };
}
