<template>
  <view class="page">
    <view class="bg-layer">
      <view class="mesh" />
      <view class="orb o1" />
      <view class="orb o2" />
    </view>

    <view class="content" :style="{ paddingTop: safePadTop + 'px' }">
      <view class="brand-block">
        <view class="logo-mark">
          <image
            class="logo-img"
            src="/static/lite/logo.jpg"
            mode="aspectFit"
            lazy-load
          />
        </view>
        <text class="brand-name">指尖善治</text>
        <text class="brand-tagline">{{ tagline }}</text>
      </view>

      <view class="login-card">
        <text class="card-title">{{ welcome }}</text>
        <text class="card-sub">{{ cardSub }}</text>

        <view class="agreement">
          <view
            class="check"
            :class="{ on: checked }"
            @click="checked = !checked"
          >
            <view v-if="checked" class="check-mark" />
          </view>
          <text class="agree-text">我已阅读并同意</text>
          <text class="agree-link" @click="openAgreement('user')"
            >《用户协议》</text
          >
          <text class="agree-text">和</text>
          <text class="agree-link" @click="openAgreement('privacy')"
            >《隐私政策》</text
          >
        </view>

        <button class="btn-primary" :loading="loading" @click="onPrimaryLogin">
          <view class="wechat-dot" />
          {{ loginBtnText }}
        </button>
        <text class="guest-link" @click="onGuestBrowse"
          >先逛逛，稍后再登录</text
        >
      </view>
    </view>
  </view>
</template>

<script>
import { wxLogin, isLoggedIn } from "@/utils/cloud.js";
import { goAfterLogin } from "@/utils/auth.js";
import { goReLaunch } from "@/utils/nav.js";
import { getSafeLayout } from "@/utils/safe-area.js";
import { COPY } from "@/utils/copy-voice.js";
import { isApp } from "@/utils/platform.js";
import { openLegalDoc } from "@/utils/legal-links.js";

export default {
  data() {
    return {
      phone: "",
      checked: false,
      loading: false,
      safePadTop: 48,
      tagline: COPY.loginTagline,
      welcome: COPY.loginWelcome,
      cardSub: COPY.loginSub,
    };
  },
  computed: {
    loginBtnText() {
      return isApp ? "本机一键登录" : "微信一键登录";
    },
  },
  onLoad() {
    const layout = getSafeLayout();
    this.safePadTop = layout.contentTop + 24;
  },
  onShow() {
    if (isLoggedIn()) goAfterLogin();
  },
  methods: {
    openAgreement(type) {
      openLegalDoc(type);
    },
    ensureAgreement() {
      if (!this.checked) {
        uni.showToast({ title: "请先同意协议", icon: "none" });
        return false;
      }
      return true;
    },
    enterApp() {
      goAfterLogin();
    },
    onGuestBrowse() {
      goReLaunch("/pages/village/village");
    },
    onPrimaryLogin() {
      this.onWechatLogin();
    },
    async onWechatLogin() {
      if (!this.ensureAgreement()) return;
      this.loading = true;
      try {
        await wxLogin();
        uni.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => this.enterApp(), 500);
      } catch (e) {
        uni.showModal({
          title: "登录失败",
          content:
            e.message ||
            (isApp
              ? "请检查 APP_API_BASE 网关，或允许回退 Mock"
              : "请检查云函数与数据库集合是否已配置"),
          showCancel: false,
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.bg-layer {
  position: absolute;
  inset: 0;
  @include rt-hero-mesh(#9e3428, #c9a24a, #5a6b38);
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(50rpx);
}
.o1 {
  width: 320rpx;
  height: 320rpx;
  top: -100rpx;
  right: -60rpx;
  background: rgba(158, 52, 40, 0.16);
}
.o2 {
  width: 260rpx;
  height: 260rpx;
  bottom: 120rpx;
  left: -80rpx;
  background: rgba(201, 162, 74, 0.18);
}

.content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48rpx 48rpx calc(64rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.brand-block {
  text-align: center;
  margin-bottom: 48rpx;
}

.logo-mark {
  width: 176rpx;
  height: 176rpx;
  margin: 0 auto 32rpx;
  border-radius: 48rpx;
  background: linear-gradient(145deg, $rt-primary, $rt-primary-mid);
  box-shadow: $rt-shadow-glow, 0 0 0 8rpx rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo-img {
  width: 100%;
  height: 100%;
}

.brand-name {
  display: block;
  font-size: 52rpx;
  font-weight: 800;
  color: $rt-text;
  letter-spacing: 6rpx;
}

.brand-tagline {
  display: block;
  margin-top: 12rpx;
  font-size: 28rpx;
  color: $rt-text-secondary;
}

.feature-chips {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 24rpx;
}

.chip {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  font-size: 22rpx;
  color: $rt-primary-mid;
  font-weight: 600;
}

.login-card {
  position: relative;
  overflow: hidden;
  padding: 44rpx 40rpx;
  border-radius: $rt-radius-lg;
  @include rt-card-tone(gold);
  backdrop-filter: blur(24rpx);
  box-shadow: $rt-shadow-card, 0 12rpx 40rpx rgba(201, 162, 74, 0.1);
}

.card-title {
  display: block;
  font-size: 38rpx;
  font-weight: 800;
  color: $rt-text;
}

.card-sub {
  display: block;
  margin-top: 8rpx;
  margin-bottom: 32rpx;
  font-size: 26rpx;
  color: $rt-text-muted;
}

.field {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 0 24rpx;
  height: 104rpx;
  border-radius: $rt-radius-sm;
  background: $rt-bg;
  border: 1rpx solid $rt-border;
  margin-bottom: 24rpx;
}

.field-icon-wrap {
  width: 48rpx;
  height: 48rpx;
  border-radius: 14rpx;
  background: $rt-primary-soft;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.phone-body {
  width: 18rpx;
  height: 26rpx;
  border: 3rpx solid $rt-primary-mid;
  border-radius: 6rpx;
  box-sizing: border-box;
  position: relative;
}

.phone-btn {
  position: absolute;
  bottom: 7rpx;
  left: 50%;
  width: 6rpx;
  height: 3rpx;
  margin-left: -3rpx;
  background: $rt-primary-mid;
  border-radius: 999rpx;
}

.field-input {
  flex: 1;
  font-size: 30rpx;
  color: $rt-text;
}

.ph {
  color: $rt-text-muted;
}

.agreement {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 32rpx;
  font-size: 24rpx;
  color: $rt-text-muted;
}

.check {
  width: 32rpx;
  height: 32rpx;
  border-radius: 10rpx;
  border: 2rpx solid $rt-border-strong;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4rpx;
}

.check.on {
  background: $rt-primary;
  border-color: $rt-primary;
}

.check-mark {
  width: 10rpx;
  height: 16rpx;
  border-right: 3rpx solid #fff;
  border-bottom: 3rpx solid #fff;
  transform: rotate(45deg) translateY(-2rpx);
}

.agree-link {
  color: $rt-primary-mid;
  font-weight: 600;
}

.btn-primary {
  @include rt-btn-primary;
  width: 100%;
}

.btn-ghost {
  @include rt-btn-reset;
  margin-top: 20rpx;
  height: 96rpx;
  border-radius: 999rpx;
  background: $rt-surface;
  border: 1rpx solid $rt-border-strong;
  color: $rt-text;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.wechat-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #07c160;
}

.guest-link {
  display: block;
  margin-top: 28rpx;
  text-align: center;
  font-size: 26rpx;
  color: $rt-text-secondary;
  text-decoration: underline;
}
</style>
