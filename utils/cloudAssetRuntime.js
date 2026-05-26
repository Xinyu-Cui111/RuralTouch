import { reactive } from "vue";

import { buildCloudFileIds } from "./cloudStaticPaths.js";

export const WX_CLOUD_ENV_ID = "cloud1-d6gqqruqy1d721eb0";

export const cloudAssetState = reactive({
  loading: false,
  ready: false,
  error: "",
  urls: {},
});

function getRelativePathFromSource(source) {
  const text = String(source || "").trim();

  if (!text) {
    return "";
  }

  if (text.startsWith("static/")) {
    return text;
  }

  const staticIndex = text.indexOf("/static/");
  if (text.startsWith("cloud://") && staticIndex >= 0) {
    return text.slice(staticIndex + 1);
  }

  return text;
}

function writeCloudAssetUrl(source, url) {
  const relativePath = getRelativePathFromSource(source);
  if (!relativePath) {
    return;
  }

  cloudAssetState.urls[relativePath] = url;
  cloudAssetState.urls[source] = url;
}

function chunkArray(list, size) {
  const chunks = [];

  for (let index = 0; index < list.length; index += size) {
    chunks.push(list.slice(index, index + size));
  }

  return chunks;
}

export function resolveCloudAsset(source) {
  const text = String(source || "").trim();

  if (!text) {
    return "";
  }

  const relativePath = getRelativePathFromSource(text);

  return cloudAssetState.urls[text] || cloudAssetState.urls[relativePath] || "";
}

export async function loadCloudAssets() {
  if (cloudAssetState.loading || cloudAssetState.ready) {
    return cloudAssetState.urls;
  }

  if (typeof wx === "undefined" || !wx.cloud) {
    cloudAssetState.error = "wx.cloud unavailable";
    return cloudAssetState.urls;
  }

  cloudAssetState.loading = true;
  cloudAssetState.error = "";

  try {
    wx.cloud.init({
      env: WX_CLOUD_ENV_ID,
      traceUser: true,
    });

    const fileIds = buildCloudFileIds(WX_CLOUD_ENV_ID);
    const batches = chunkArray(fileIds, 50);

    for (const batch of batches) {
      const response = await wx.cloud.getTempFileURL({
        fileList: batch.map((item) => item.fileID),
      });

      const responseMap = new Map(
        (response.fileList || []).map((item) => [item.fileID, item])
      );

      batch.forEach((item) => {
        const matched = responseMap.get(item.fileID);
        if (matched && matched.tempFileURL) {
          writeCloudAssetUrl(item.relativePath, matched.tempFileURL);
        }
      });
    }

    cloudAssetState.ready = true;
  } catch (error) {
    const message = error && error.message ? error.message : "load failed";
    const code = error && (error.errCode || error.code);

    cloudAssetState.error =
      code === 6000100 ? "云存储文件未绑定到当前环境或未完成上传。" : message;

    cloudAssetState.ready = false;
  } finally {
    cloudAssetState.loading = false;
  }

  return cloudAssetState.urls;
}
