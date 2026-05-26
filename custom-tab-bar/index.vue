<template>
  <view class="tabbar-wrap">
    <view class="tabbar">
      <view
        v-for="item in items"
        :key="item.path"
        class="tab-item"
        :class="{ active: currentPath === item.path }"
        @click="switchTo(item.path)"
      >
        <view
          class="tab-icon-wrap"
          :class="{ active: currentPath === item.path }"
        >
          <image
            class="tab-icon"
            :class="{ active: currentPath === item.path }"
            :src="$cloudAssetUrl(item.icon)"
            mode="aspectFill"
          />
        </view>
        <text class="tab-text">{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      iconVersion: "20260523a",
      items: [
        {
          path: "/pages/law/law",
          text: "法治服务",
          icon: "static/icons/lawi.svg",
        },
        {
          path: "/pages/village/village",
          text: "村民议事厅",
          icon: "static/icons/villagei.svg",
        },
        {
          path: "/pages/moral/moral",
          text: "道德银行",
          icon: "static/icons/morali.svg",
        },
        {
          path: "/pages/group/group",
          text: "惠民团购",
          icon: "static/icons/groupi.svg",
        },
      ],
      currentPath: "/pages/law/law",
    };
  },
  mounted() {
    this.syncCurrentPath();
  },
  methods: {
    syncCurrentPath() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const route =
        currentPage && currentPage.route
          ? `/${currentPage.route}`
          : "/pages/law/law";
      this.currentPath = route;
    },
    switchTo(path) {
      if (this.currentPath === path) {
        return;
      }
      this.currentPath = path;
      uni.reLaunch({ url: path });
    },
  },
};
</script>

<style lang="scss" scoped>
.tabbar-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-top: 1rpx solid rgba(47, 93, 58, 0.06);
  box-shadow: 0 -6rpx 18rpx rgba(15, 23, 42, 0.04);
  padding-bottom: env(safe-area-inset-bottom);
}

.tabbar {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 12rpx;
}

.tab-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  color: #8f9a93;
}

.tab-item.active {
  color: #2f5d3a;
}

.tab-icon-wrap {
  width: 58rpx;
  height: 58rpx;
  padding: 4rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.tab-icon-wrap.active {
  background: linear-gradient(
    180deg,
    rgba(235, 245, 238, 0.98) 0%,
    rgba(214, 232, 219, 0.98) 100%
  );
  box-shadow: 0 10rpx 22rpx rgba(47, 93, 58, 0.12);
  transform: translateY(-2rpx);
}

.tab-icon {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 14rpx;
  opacity: 0.72;
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.tab-icon.active {
  opacity: 1;
  transform: scale(1.04);
}

.tab-text {
  font-size: 20rpx;
  line-height: 1;
  font-weight: 500;
  letter-spacing: 0.5rpx;
}
</style>
