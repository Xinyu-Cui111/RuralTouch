<template>
  <view
    class="nav"
    :style="{
      paddingTop: layout.safeTop + 'px',
      paddingRight: layout.capsuleClearRight + 'px',
    }"
  >
    <view
      class="bar"
      :style="{
        height: layout.navBarHeight + 'px',
        paddingTop: layout.sideGap + 'px',
        paddingBottom: layout.sideGap + 'px',
      }"
    >
      <view
        v-if="showBack"
        class="back"
        hover-class="back-press"
        :hover-stay-time="80"
        :style="btnStyle"
        @click="onBack"
      >
        <view class="back-chevron" />
      </view>
      <view v-else class="back-spacer" :style="btnStyle" />

      <text class="title">{{ title }}</text>

      <view class="right" :style="{ minHeight: layout.capsuleHeight + 'px' }">
        <slot name="right" />
      </view>
    </view>
  </view>
  <!-- 占位，避免内容顶到固定导航下 -->
  <view class="nav-placeholder" :style="{ height: layout.contentTop + 'px' }" />
</template>

<script>
import { getSafeLayout } from "@/utils/safe-area.js";

export default {
  props: {
    title: { type: String, default: "" },
    showBack: { type: Boolean, default: true },
  },
  data() {
    return { layout: getSafeLayout() };
  },
  computed: {
    btnStyle() {
      const h = this.layout.capsuleHeight || 32;
      return {
        width: `${h}px`,
        height: `${h}px`,
      };
    },
  },
  mounted() {
    this.layout = getSafeLayout();
  },
  methods: {
    onBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 });
      } else {
        uni.reLaunch({ url: "/pages/village/village" });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding-left: $rt-page-x;
  background: rgba(246, 240, 228, 0.94);
  backdrop-filter: blur(20rpx);
  border-bottom: 1rpx solid rgba(201, 162, 74, 0.16);
  box-sizing: border-box;
}

.bar {
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.back,
.back-spacer {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
}

.back {
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(201, 162, 74, 0.28);
}

.back-press {
  opacity: 0.85;
}

.back-chevron {
  width: 12rpx;
  height: 12rpx;
  margin-left: 4rpx;
  border-left: 4rpx solid $rt-text;
  border-bottom: 4rpx solid $rt-text;
  transform: rotate(45deg);
}

.title {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 800;
  color: $rt-text;
  pointer-events: none;
  padding: 0 120rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.right {
  margin-left: auto;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
  flex-shrink: 0;
}

.nav-placeholder {
  width: 100%;
  flex-shrink: 0;
}
</style>
