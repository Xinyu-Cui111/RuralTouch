<template>
  <view class="page">
    <view class="tip-card">
      <text class="tip-title">服务入口已收拢</text>
      <text class="tip-desc"
        >法治、激励、团购请用底部导航；简洁模式请到「我的 → 可兑换」。</text
      >
      <view
        class="tip-btn"
        hover-class="press"
        :hover-stay-time="80"
        @click="goHome"
        >回办事首页</view
      >
      <text class="tip-link" @click="goProfile">去「我的」</text>
    </view>
  </view>
</template>

<script>
import { isElderMode } from "@/utils/elder-mode.js";
import { goReLaunch } from "@/utils/nav.js";

export default {
  onShow() {
    // 深链收口：简洁模式进「我的→更多」，标准模式回办事（底栏已有三服务）
    if (isElderMode()) {
      goReLaunch("/pages/profile/profile?fold=more");
      return;
    }
    // 短暂展示提示后也可手动跳；不强制闪跳，避免困惑
  },
  methods: {
    goHome() {
      goReLaunch("/pages/village/village");
    },
    goProfile() {
      goReLaunch("/pages/profile/profile?fold=more");
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
.tip-card {
  margin-top: 80rpx;
  padding: 40rpx 32rpx;
  border-radius: $rt-radius-lg;
  background: #fff;
  border: 1rpx solid rgba(50, 40, 30, 0.06);
  box-shadow: $rt-shadow-sm;
  text-align: center;
}
.tip-title {
  display: block;
  font-family: $rt-font-title;
  font-size: $rt-type-title;
  font-weight: 800;
  color: $rt-text;
}
.tip-desc {
  display: block;
  margin-top: 16rpx;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.5;
}
.tip-btn {
  margin: 36rpx auto 0;
  max-width: 420rpx;
  min-height: 88rpx;
  padding: 22rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $rt-primary-dark, $rt-primary-mid);
  color: #fff;
  font-size: $rt-type-body;
  font-weight: 800;
  box-sizing: border-box;
}
.press {
  opacity: 0.92;
}
.tip-link {
  display: block;
  margin-top: 24rpx;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-primary-mid;
}
</style>
