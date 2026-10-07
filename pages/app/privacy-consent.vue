<template>
  <view class="page" :style="{ paddingTop: padTopStyle }">
    <view class="brand">
      <image
        class="logo"
        src="/static/app/icons/splash-logo.png"
        mode="aspectFit"
      />
      <text class="name">指尖善治</text>
      <text class="sub">智慧村务 · 说事成案</text>
    </view>

    <view class="card">
      <text class="card-title">个人信息保护提示</text>
      <text class="card-body"
        >欢迎使用「指尖善治」。我们仅在您主动登录或提交办件后处理必要业务信息，不采集证件影像，也不单独索取手机号。请阅读并同意相关协议后再继续。</text
      >
      <view class="links">
        <text class="link" @click="openDoc('user')">《用户协议》</text>
        <text class="sep">与</text>
        <text class="link" @click="openDoc('privacy')">《隐私政策》</text>
      </view>
    </view>

    <view class="actions">
      <button class="btn primary" :loading="busy" @click="onAgree">
        同意并继续
      </button>
      <button class="btn ghost" :disabled="busy" @click="onRefuse">
        不同意并退出
      </button>
    </view>
  </view>
</template>

<script>
import { getSafeLayout, cssPagePadTop } from "@/utils/safe-area.js";
import { markAppPrivacyAgreed, quitAppIfNeeded } from "@/utils/app-privacy.js";
import { initAppPushPlaceholder } from "@/utils/app-push.js";
import { goReLaunch } from "@/utils/nav.js";
import { openLegalDoc } from "@/utils/legal-links.js";

export default {
  data() {
    return {
      padTopStyle: cssPagePadTop(getSafeLayout(), 24),
      busy: false,
    };
  },
  onLoad() {
    this.syncSafePad();
    if (uni.$on) uni.$on("rt-safe-layout", this.syncSafePad);
  },
  onUnload() {
    if (uni.$off) uni.$off("rt-safe-layout", this.syncSafePad);
  },
  onReady() {
    this.syncSafePad();
  },
  onShow() {
    this.syncSafePad();
  },
  methods: {
    syncSafePad() {
      this.padTopStyle = cssPagePadTop(getSafeLayout(), 24);
    },
    openDoc(type) {
      openLegalDoc(type);
    },
    async onAgree() {
      this.busy = true;
      try {
        markAppPrivacyAgreed();
        try {
          await initAppPushPlaceholder();
        } catch (e) {
          /* 推送占位失败不阻断 */
        }
        goReLaunch("/pages/village/village");
      } finally {
        this.busy = false;
      }
    },
    onRefuse() {
      uni.showModal({
        title: "退出应用",
        content: "需同意协议后方可使用。确定退出？",
        confirmText: "退出",
        success: (res) => {
          if (res.confirm) quitAppIfNeeded();
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.page {
  min-height: 100vh;
  padding: 0 $rt-page-x 48rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f7f4ef 0%, $rt-bg 42%, #ebe8e2 100%);
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 顶部已由 padTopStyle 让开状态栏，品牌区内边距收一点，避免整屏被顶飞 */
  padding: 24rpx 0 36rpx;
}

.logo {
  width: 200rpx;
  height: 200rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.7);
}

.name {
  margin-top: 28rpx;
  font-size: 44rpx;
  font-weight: 800;
  color: $rt-primary-dark;
  letter-spacing: 4rpx;
}

.sub {
  margin-top: 10rpx;
  font-size: 26rpx;
  color: $rt-text-muted;
}

.card {
  flex: 1;
  padding: 36rpx 32rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid rgba(50, 40, 30, 0.06);
}

.card-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: $rt-text;
  margin-bottom: 20rpx;
}

.card-body {
  display: block;
  font-size: 28rpx;
  line-height: 1.75;
  color: $rt-text-secondary;
}

.links {
  margin-top: 28rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8rpx;
}

.link {
  font-size: 28rpx;
  color: $rt-primary-mid;
  font-weight: 600;
}

.sep {
  font-size: 28rpx;
  color: $rt-text-muted;
}

.actions {
  margin-top: 40rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.btn {
  @include rt-btn-reset;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 20rpx;
  font-size: 32rpx;
  font-weight: 700;
}

.btn.primary {
  background: linear-gradient(168deg, $rt-primary-mid, $rt-primary-dark);
  color: #fff;
}

.btn.ghost {
  background: transparent;
  color: $rt-text-muted;
  border: 1rpx solid rgba(50, 40, 30, 0.12);
  font-weight: 600;
}
</style>
