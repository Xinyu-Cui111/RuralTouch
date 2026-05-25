<template>
  <view class="page">
    <view class="card">
      <text class="title">批量导出云 URL</text>
      <text class="sub-title"
        >适用于你已经把 `static`
        目录上传到云存储，并且路径结构保持不变的情况。</text
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
          @click="handleExportUrls"
        >
          批量导出临时 URL
        </button>
        <button class="btn" :disabled="!resultText" @click="copyAll">
          复制全部结果
        </button>
      </view>

      <view class="meta-row">
        <text>共 {{ STATIC_FILE_COUNT }} 个文件</text>
        <text>导出结果会按 `fileID => tempFileURL` 输出</text>
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

      <textarea
        class="result-textarea"
        :value="resultText"
        confirm-type="done"
      />

      <view
        v-for="item in results"
        :key="item.relativePath"
        class="result-item"
      >
        <text class="result-path">{{ item.relativePath }}</text>
        <text class="result-url" selectable>{{
          item.tempFileURL || item.errMsg || item.status
        }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import {
  STATIC_FILE_COUNT,
  buildCloudFileIds,
} from "@/utils/cloudStaticPaths.js";

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
      envId: "",
      loading: false,
      errorMessage: "",
      results: [],
    };
  },
  computed: {
    resultText() {
      return this.results
        .map(
          (item) =>
            `${item.fileID} => ${
              item.tempFileURL || item.errMsg || item.status
            }`
        )
        .join("\n");
    },
  },
  methods: {
    async handleExportUrls() {
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

        this.results = mergedResults;

        if (!mergedResults.length) {
          this.errorMessage =
            "没有拿到任何结果，请检查 fileID 是否和云存储中的路径一致。";
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

.result-path {
  display: block;
  margin-bottom: 8rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #111827;
}

.result-url {
  display: block;
  color: #1d4ed8;
  font-size: 24rpx;
  line-height: 1.6;
  word-break: break-all;
}
</style>
