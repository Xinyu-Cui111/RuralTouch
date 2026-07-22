<template>
  <view class="page">
    <rt-nav-bar title="村务意见箱" />

    <view class="intro">
      <text class="intro-title">提建议 · 报问题</text>
      <text class="intro-desc"
        >这里是村务意见与建议，不是纠纷调解。纠纷请走「提交纠纷」主流程。</text
      >
    </view>

    <rt-card elevated tone="green">
      <view class="field-label">意见内容</view>
      <textarea
        v-model="content"
        class="textarea"
        maxlength="500"
        placeholder="例如：路灯损坏、公示看不清、服务建议…"
      />
      <view class="field-label">联系方式（选填）</view>
      <input v-model="contact" class="input" placeholder="手机号或微信" />
      <button class="submit-btn" :loading="submitting" @click="onSubmit">
        提交意见
      </button>
    </rt-card>

    <rt-section title="我的提交">
      <rt-skeleton v-if="listLoading" variant="lines" :rows="4" />
      <empty-state
        v-else-if="listError"
        icon-type="feedback"
        icon-tone="green"
        title="加载失败"
        desc="请检查网络后重试"
        action-text="点击重试"
        @action="loadList"
      />
      <empty-state
        v-else-if="!list.length"
        icon-type="feedback"
        icon-tone="green"
        title="暂无意见记录"
        desc="提交后可在此查看处理状态"
      />
      <rt-card
        v-else
        v-for="item in list"
        :key="item._id"
        compact
        elevated
        tone="green"
        class="fb-card"
      >
        <view class="fb-top">
          <text class="fb-status" :class="item.status">{{
            item.statusLabel
          }}</text>
          <text class="fb-time">{{ item.createTimeText }}</text>
        </view>
        <text class="fb-content">{{ item.content }}</text>
        <view v-if="item.reply" class="fb-reply">
          <text class="fb-reply-label">村委答复</text>
          <text class="fb-reply-text">{{ item.reply }}</text>
          <text v-if="item.replyTimeText" class="fb-reply-time">{{
            item.replyTimeText
          }}</text>
        </view>
      </rt-card>
    </rt-section>
  </view>
</template>

<script>
import EmptyState from "@/components/empty-state/empty-state.vue";
import RtCard from "@/components/rt-card/rt-card.vue";
import RtSection from "@/components/rt-section/rt-section.vue";
import RtSkeleton from "@/components/rt-skeleton/rt-skeleton.vue";
import { api } from "@/api/index.js";
import { ensureLoggedIn } from "@/utils/auth.js";

export default {
  components: { EmptyState, RtCard, RtSection, RtSkeleton },
  data() {
    return {
      content: "",
      contact: "",
      submitting: false,
      listLoading: true,
      listError: false,
      list: [],
    };
  },
  onShow() {
    if (!ensureLoggedIn()) return;
    this.loadList();
  },
  onPullDownRefresh() {
    this.loadList(true).finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    async loadList(isRefresh = false) {
      if (!isRefresh) this.listLoading = true;
      this.listError = false;
      try {
        const res = await api.listMyFeedbacks();
        this.list = res.data.list || [];
      } catch (e) {
        this.listError = !this.list.length;
        uni.showToast({ title: e.message || "加载失败", icon: "none" });
      } finally {
        this.listLoading = false;
      }
    },
    async onSubmit() {
      if (!this.content.trim()) {
        uni.showToast({ title: "请填写意见内容", icon: "none" });
        return;
      }
      this.submitting = true;
      try {
        await api.createFeedback({
          content: this.content.trim(),
          contact: this.contact.trim(),
        });
        this.content = "";
        uni.showToast({ title: "已提交，等待村委处理", icon: "success" });
        this.loadList();
      } catch (e) {
        uni.showToast({ title: e.message || "提交失败", icon: "none" });
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";
.page {
  @include rt-page;
  padding: $rt-page-x;
}
.intro {
  margin-bottom: 20rpx;
  padding: 20rpx 22rpx;
  border-radius: $rt-radius-sm;
  background: rgba(158, 52, 40, 0.06);
  border: 1rpx solid rgba(158, 52, 40, 0.12);
}
.intro-title {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  color: $rt-text;
}
.intro-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: $rt-text-secondary;
  line-height: 1.5;
}
.field-label {
  font-size: 26rpx;
  font-weight: 700;
  color: $rt-text-secondary;
  margin: 8rpx 0 12rpx;
}
.field-label:first-child {
  margin-top: 0;
}
.textarea {
  @include rt-form-textarea;
  margin-bottom: 8rpx;
}
.input {
  @include rt-form-input;
  width: 100%;
  margin-bottom: 8rpx;
}
.submit-btn {
  @include rt-btn-primary;
  margin-top: 28rpx;
  width: 100%;
}
.fb-card {
  margin-bottom: 16rpx;
}
.fb-top {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 10rpx;
}
.fb-status {
  font-size: 22rpx;
  font-weight: 800;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: $rt-accent-soft;
  color: $rt-accent-dark;
}
.fb-status.replied,
.fb-status.closed {
  @include rt-status-done;
}
.fb-time {
  font-size: 22rpx;
  color: $rt-text-muted;
}
.fb-content {
  display: block;
  font-size: 28rpx;
  color: $rt-text;
  line-height: 1.55;
}
.fb-reply {
  margin-top: 16rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  background: rgba(90, 107, 56, 0.08);
}
.fb-reply-label {
  display: block;
  font-size: 22rpx;
  font-weight: 800;
  color: #5a6b38;
}
.fb-reply-text {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: $rt-text;
  line-height: 1.5;
}
.fb-reply-time {
  display: block;
  margin-top: 8rpx;
  font-size: 20rpx;
  color: $rt-text-muted;
}
</style>
