<template>
  <view class="page">
    <view class="card">
      <text class="title">云资源自检</text>
      <text class="sub-title"
        >校验 `static/` 下资源是否已上传到当前云环境，并导出临时 URL。</text
      >

      <view class="field">
        <text class="label">云环境 ID</text>
        <input
          v-model="envId"
          class="input"
          placeholder="请输入云环境 ID，例如 xxxx-xxxx"
          confirm-type="done"
        />
      </view>

      <view class="actions">
        <button
          class="btn primary"
          :loading="loading"
          @click="handleCheckCloudAssets"
        >
          开始自检
        </button>
        <button class="btn" :disabled="!resultText" @click="copyAll">
          复制结果
        </button>
      </view>

      <view class="meta-row">
        <text>共 {{ STATIC_FILE_COUNT }} 个文件</text>
        <text>会标记成功、失败和缺失项，便于核对路径</text>
      </view>
    </view>

    <view class="summary-grid">
      <view class="summary-card">
        <text class="summary-value">{{ summary.total }}</text>
        <text class="summary-label">总文件数</text>
      </view>
      <view class="summary-card success">
        <text class="summary-value">{{ summary.success }}</text>
        <text class="summary-label">成功</text>
      </view>
      <view class="summary-card warning">
        <text class="summary-value">{{ summary.failed }}</text>
        <text class="summary-label">失败</text>
      </view>
      <view class="summary-card danger">
        <text class="summary-value">{{ summary.missing }}</text>
        <text class="summary-label">缺失</text>
      </view>
    </view>

    <view v-if="errorMessage" class="error-card">
      <text class="error-title">提示</text>
      <text class="error-text">{{ errorMessage }}</text>
    </view>

    <view v-if="results.length" class="card result-card">
      <view class="result-header">
        <text class="title">结果</text>
        <text class="count">{{ results.length }} 条</text>
      </view>

      <view class="result-filters">
        <view
          v-for="filter in filters"
          :key="filter.key"
          class="filter-chip"
          :class="{ active: activeFilter === filter.key }"
          @click="activeFilter = filter.key"
        >
          {{ filter.label }}
        </view>
      </view>

      <textarea
        class="result-textarea"
        :value="resultText"
        confirm-type="done"
      />

      <view
        v-for="item in visibleResults"
        :key="item.relativePath"
        class="result-item"
        :class="item.itemClass"
      >
        <text class="result-path">{{ item.relativePath }}</text>
        <text class="result-meta">{{ item.fileID }}</text>
        <text class="result-url" selectable>{{ item.displayText }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import {
  STATIC_FILE_COUNT,
  buildCloudFileIds,
} from "@/utils/cloudStaticPaths.js";
import { WX_CLOUD_ENV_ID } from "@/utils/cloudAssetRuntime.js";

const MAX_BATCH_SIZE = 50;

function chunkArray(list, size) {
  const chunks = [];

  for (let index = 0; index < list.length; index += size) {
    chunks.push(list.slice(index, index + size));
  }

  return chunks;
}

export default {
  data() {
    return {
      STATIC_FILE_COUNT,
      envId: WX_CLOUD_ENV_ID,
      loading: false,
      errorMessage: "",
      results: [],
      activeFilter: "all",
      summary: {
        total: STATIC_FILE_COUNT,
        success: 0,
        failed: 0,
        missing: 0,
      },
      filters: [
        { key: "all", label: "全部" },
        { key: "success", label: "成功" },
        { key: "failed", label: "失败" },
        { key: "missing", label: "缺失" },
      ],
    };
  },
  computed: {
    resultText() {
      return this.results
        .map(
          (item) =>
            `${item.relativePath} | ${item.fileID} => ${item.displayText}`
        )
        .join("\n");
    },
    visibleResults() {
      if (this.activeFilter === "all") {
        return this.results;
      }

      return this.results.filter((item) => item.state === this.activeFilter);
    },
  },
  methods: {
    normalizeResults(rawResults) {
      const items = rawResults.map((item) => {
        const status = Number(item.status);
        const hasUrl = Boolean(item.tempFileURL);
        const state =
          hasUrl || status === 0 ? "success" : status ? "failed" : "missing";

        return {
          relativePath: item.relativePath,
          fileID: item.fileID,
          tempFileURL: item.tempFileURL || "",
          status: Number.isNaN(status) ? item.status : status,
          errMsg: item.errMsg || "",
          state,
          itemClass: `state-${state}`,
          displayText:
            item.tempFileURL || item.errMsg || item.status || "missing",
        };
      });

      const success = items.filter((item) => item.state === "success").length;
      const failed = items.filter((item) => item.state === "failed").length;
      const missing = items.filter((item) => item.state === "missing").length;

      this.summary = {
        total: items.length,
        success,
        failed,
        missing,
      };

      return items;
    },
    async handleCheckCloudAssets() {
      const envId = String(this.envId || "").trim();

      if (!envId) {
        this.errorMessage = "请先填写云环境 ID。";
        return;
      }

      if (typeof wx === "undefined" || !wx.cloud) {
        this.errorMessage =
          "当前环境没有可用的 wx.cloud，请在微信开发者工具的小程序环境中打开这个页面。";
        return;
      }

      this.loading = true;
      this.errorMessage = "";
      this.results = [];

      try {
        wx.cloud.init({ env: envId, traceUser: true });

        const fileIds = buildCloudFileIds(envId);
        const batches = chunkArray(fileIds, MAX_BATCH_SIZE);
        const mergedResults = [];

        for (const batch of batches) {
          const response = await wx.cloud.getTempFileURL({
            fileList: batch.map((item) => item.fileID),
          });

          const responseMap = new Map(
            (response.fileList || []).map((item) => [item.fileID, item])
          );

          batch.forEach((item) => {
            const matched = responseMap.get(item.fileID);

            mergedResults.push({
              relativePath: item.relativePath,
              fileID: item.fileID,
              tempFileURL:
                matched && matched.tempFileURL ? matched.tempFileURL : "",
              status: matched && matched.status ? matched.status : "unknown",
              errMsg: matched && matched.errMsg ? matched.errMsg : "",
            });
          });
        }

        this.results = this.normalizeResults(mergedResults);
        this.activeFilter = "all";

        if (!mergedResults.length) {
          this.errorMessage =
            "没有拿到任何结果，请检查 fileID 是否和云存储中的路径一致。";
        } else if (this.summary.success === 0) {
          this.errorMessage =
            "所有文件都未成功解析，请优先检查环境内是否上传了 static/ 下的资源。";
        }
      } catch (error) {
        this.errorMessage =
          error && error.message
            ? error.message
            : "导出失败，请检查云环境是否正确初始化。";
      } finally {
        this.loading = false;
      }
    },
    copyAll() {
      if (!this.resultText) {
        return;
      }

      uni.setClipboardData({
        data: this.resultText,
        success: () => {
          uni.showToast({ title: "已复制", icon: "success" });
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f6f8fb;
  box-sizing: border-box;
}

.card,
.error-card {
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 12rpx 28rpx rgba(15, 23, 42, 0.06);
}

.title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #111827;
}

.sub-title {
  display: block;
  margin-top: 10rpx;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 1.6;
}

.field {
  margin-top: 20rpx;
}

.label {
  display: block;
  margin-bottom: 12rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #374151;
}

.input {
  width: 100%;
  min-height: 88rpx;
  padding: 0 20rpx;
  border: 1rpx solid #dbe3ee;
  border-radius: 18rpx;
  box-sizing: border-box;
  background: #fdfdfd;
  font-size: 28rpx;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 20rpx;
}

.btn {
  flex: 1;
  min-width: 280rpx;
  border-radius: 18rpx;
  font-size: 28rpx;
}

.primary {
  background: #2563eb;
  color: #fff;
}

.meta-row {
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  color: #6b7280;
  font-size: 24rpx;
}

.error-card {
  border-left: 8rpx solid #f97316;
}

.error-title {
  display: block;
  margin-bottom: 8rpx;
  font-weight: 700;
  color: #c2410c;
}

.error-text {
  color: #7c2d12;
  font-size: 26rpx;
  line-height: 1.6;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.summary-card {
  padding: 20rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 12rpx 28rpx rgba(15, 23, 42, 0.06);
}

.summary-value {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: #111827;
}

.summary-label {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #6b7280;
}

.summary-card.success .summary-value {
  color: #16a34a;
}

.summary-card.warning .summary-value {
  color: #d97706;
}

.summary-card.danger .summary-value {
  color: #dc2626;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.count {
  color: #6b7280;
  font-size: 24rpx;
}

.result-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 18rpx;
}

.filter-chip {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 22rpx;
}

.filter-chip.active {
  background: #1d4ed8;
  color: #fff;
}

.result-textarea {
  width: 100%;
  height: 260rpx;
  margin-top: 18rpx;
  padding: 16rpx;
  border: 1rpx solid #dbe3ee;
  border-radius: 18rpx;
  box-sizing: border-box;
  background: #f8fafc;
  font-size: 24rpx;
}

.result-item {
  margin-top: 16rpx;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #f8fafc;
}

.result-item.state-success {
  border: 1rpx solid rgba(34, 197, 94, 0.2);
}

.result-item.state-failed {
  border: 1rpx solid rgba(249, 115, 22, 0.2);
}

.result-item.state-missing {
  border: 1rpx solid rgba(239, 68, 68, 0.2);
}

.result-path {
  display: block;
  margin-bottom: 8rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #111827;
}

.result-meta {
  display: block;
  margin-bottom: 8rpx;
  color: #6b7280;
  font-size: 22rpx;
  line-height: 1.5;
}

.result-url {
  display: block;
  color: #1d4ed8;
  font-size: 24rpx;
  line-height: 1.6;
  word-break: break-all;
}
</style>
