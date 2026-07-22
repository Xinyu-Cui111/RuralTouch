<template>
  <view class="page">
    <rt-nav-bar title="积分申报" />
    <rt-card elevated tone="gold">
      <view class="field-label">申报事项</view>
      <input v-model="title" class="input" placeholder="如：参与普法活动" />
      <view class="field-label">申报积分</view>
      <input
        v-model="points"
        class="input"
        type="number"
        placeholder="默认 50 分"
      />
      <button class="submit-btn" :loading="submitting" @click="onSubmit">
        提交申报
      </button>
    </rt-card>
  </view>
</template>

<script>
import RtCard from "@/components/rt-card/rt-card.vue";
import { api } from "@/api/index.js";

export default {
  components: { RtCard },
  data() {
    return { title: "", points: "50", submitting: false };
  },
  methods: {
    async onSubmit() {
      if (!this.title.trim()) {
        uni.showToast({ title: "请填写申报事项", icon: "none" });
        return;
      }
      this.submitting = true;
      try {
        await api.declareMoral({
          title: this.title.trim(),
          points: Number(this.points) || 50,
        });
        uni.showToast({ title: "已提交，等待村委会审核", icon: "success" });
        setTimeout(() => uni.navigateBack(), 800);
      } catch (e) {
        uni.showToast({ title: e.message || "申报失败", icon: "none" });
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
.field-label {
  font-size: 26rpx;
  font-weight: 700;
  color: $rt-text-secondary;
  margin: 8rpx 0 12rpx;
}
.field-label:first-child {
  margin-top: 0;
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
</style>
