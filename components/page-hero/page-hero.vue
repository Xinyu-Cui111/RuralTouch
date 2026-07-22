<template>
  <view
    class="hero"
    :class="[variant, { compact: effectiveCompact }]"
    :style="{
      paddingTop: layout.safeTop + 'px',
      paddingRight: layout.capsuleClearRight + 'px',
    }"
  >
    <view class="hero-veil" />

    <view class="hero-inner">
      <view
        class="topbar"
        :style="{
          height: layout.navBarHeight + 'px',
          paddingTop: layout.sideGap + 'px',
          paddingBottom: layout.sideGap + 'px',
        }"
      >
        <view class="brand">
          <view class="logo" :style="{ width: logoSize, height: logoSize }">
            <image
              class="logo-img"
              src="/static/lite/logo.jpg"
              mode="aspectFit"
              lazy-load
            />
          </view>
          <text class="brand-name">指尖善治</text>
        </view>
        <view
          v-if="$slots.actions"
          class="actions"
          :style="{ height: layout.capsuleHeight + 'px' }"
        >
          <slot name="actions" />
        </view>
      </view>

      <view class="copy" v-if="showCopy">
        <text class="title">{{ title }}</text>
        <text v-if="subtitle" class="subtitle">{{ subtitle }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getSafeLayout } from "@/utils/safe-area.js";
import { isElderMode } from "@/utils/elder-mode.js";

export default {
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    variant: { type: String, default: "default" },
    /** Tab/二级页统一轻量顶栏；老年模式强制开启 */
    compact: { type: Boolean, default: false },
    /** 仅品牌条，不重复标题（首页主卡承担叙事） */
    brandOnly: { type: Boolean, default: false },
  },
  computed: {
    effectiveCompact() {
      return this.compact || this.elderOn || this.brandOnly;
    },
    logoSize() {
      const h = Math.max((this.layout.capsuleHeight || 32) - 4, 26);
      return `${h}px`;
    },
    showCopy() {
      return !this.brandOnly;
    },
  },
  data() {
    return { layout: getSafeLayout(), elderOn: false };
  },
  mounted() {
    this.layout = getSafeLayout();
    this.syncElder();
    if (uni.$on) uni.$on("rt-elder-mode", this.onElderEvent);
  },
  beforeDestroy() {
    if (uni.$off) uni.$off("rt-elder-mode", this.onElderEvent);
  },
  methods: {
    syncElder() {
      this.elderOn = isElderMode();
    },
    onElderEvent(v) {
      this.elderOn = !!v;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.hero {
  position: relative;
  margin: 0 (-$rt-page-x) 28rpx;
  padding-left: $rt-page-x;
  padding-bottom: 36rpx;
  overflow: hidden;
  border-radius: 0 0 $rt-radius-xl $rt-radius-xl;
  box-shadow: 0 20rpx 48rpx rgba(26, 31, 28, 0.06);
}

.hero.compact {
  margin-bottom: 12rpx;
  padding-bottom: 12rpx;
  border-radius: 0;
  box-shadow: none;
}

.hero.village {
  @include rt-hero-mesh(#9e3428, #c9a24a, #5a6b38);
}
.hero.law {
  @include rt-hero-mesh(#3a4a63, #c9a24a, #9e3428);
}
.hero.moral {
  @include rt-hero-mesh(#c9a24a, #b86b35, #9e3428);
}
.hero.group {
  @include rt-hero-mesh(#5a6b38, #c9a24a, #9e3428);
}
.hero.default {
  @include rt-hero-mesh(#9e3428, #c9a24a, #5a6b38);
}

.hero-veil {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    168deg,
    rgba(255, 255, 255, 0.94) 0%,
    rgba(241, 240, 236, 0.9) 55%,
    rgba(241, 240, 236, 0.96) 100%
  );
}

.compact .hero-veil {
  background: transparent;
}

.hero-inner {
  position: relative;
  z-index: 1;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  margin-bottom: 24rpx;
}

.compact .topbar {
  margin-bottom: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
  flex: 1;
  height: 100%;
}

.logo {
  border-radius: 12rpx;
  background: linear-gradient(145deg, $rt-primary 0%, $rt-primary-mid 100%);
  box-shadow: $rt-shadow-glow;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.logo-img {
  width: 100%;
  height: 100%;
}

.brand-name {
  font-family: $rt-font-title;
  font-size: 26rpx;
  font-weight: 700;
  color: $rt-primary-dark;
  letter-spacing: 2rpx;
  line-height: 1;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-shrink: 0;
}

.actions :deep(.icon-btn) {
  width: 100%;
  height: 100%;
  max-width: 36px;
  max-height: 36px;
  border-radius: 50%;
  box-sizing: border-box;
}

.copy {
  padding-right: 4rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: 800;
  color: $rt-text;
  line-height: 1.18;
  letter-spacing: 1rpx;
}

.compact .title {
  font-size: 40rpx;
}

.subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.4;
}
</style>
