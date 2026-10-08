<template>
  <view class="tabbar" :class="{ elder: elderOn, compact: elderOn }">
    <view
      v-for="item in items"
      :key="item.path"
      class="tab-item"
      :class="{ active: isActive(item) }"
      hover-class="tab-press"
      :hover-stay-time="80"
      @click="switchTo(item.path)"
    >
      <view class="icon-wrap">
        <rt-icon
          :name="item.icon"
          :tone="isActive(item) ? 'primary' : 'neutral'"
          size="sm"
        />
        <text v-if="badgeOf(item)" class="tab-badge">{{ badgeOf(item) }}</text>
      </view>
      <text class="tab-text">{{ item.text }}</text>
      <view v-if="isActive(item)" class="tab-indicator" />
    </view>
  </view>
</template>

<script>
import RtIcon from "@/components/rt-icon/rt-icon.vue";
import { goReLaunch } from "@/utils/nav.js";
import { readTabBadges, refreshTabBadges } from "@/utils/tab-badges.js";
import { isElderMode } from "@/utils/elder-mode.js";

/** 标准模式：5 Tab */
const TABS_FULL = [
  {
    path: "/pages/village/village",
    text: "办事",
    icon: "tab-village",
    badgeKey: "handling",
  },
  { path: "/pages/law/law", text: "法治", icon: "tab-law" },
  { path: "/pages/moral/moral", text: "激励", icon: "tab-moral", badgeKey: "" },
  { path: "/pages/group/group", text: "好物", icon: "tab-group" },
  {
    path: "/pages/profile/profile",
    text: "我的",
    icon: "tab-profile",
    badgeKey: "noticeUnread",
  },
];

/** 老年简洁：真三路径 —— 办事 / 办件 / 我的（商城团购进更多） */
const TABS_ELDER = [
  {
    path: "/pages/village/village",
    text: "办事",
    icon: "tab-village",
    badgeKey: "handling",
  },
  {
    path: "/pages/village/records",
    text: "办件",
    icon: "record",
    badgeKey: "handling",
  },
  {
    path: "/pages/profile/profile",
    text: "我的",
    icon: "tab-profile",
    badgeKey: "noticeUnread",
  },
];

export default {
  components: { RtIcon },
  data() {
    const elderOn = isElderMode();
    return {
      elderOn,
      items: elderOn ? TABS_ELDER : TABS_FULL,
      currentPath: "/pages/village/village",
      badges: readTabBadges(),
    };
  },
  mounted() {
    this.syncCurrentPath();
    this.refreshBadges();
    if (uni.$on) uni.$on("rt-elder-mode", this.onElderChange);
  },
  beforeUnmount() {
    if (uni.$off) uni.$off("rt-elder-mode", this.onElderChange);
  },
  // Vue2 uni-app
  beforeDestroy() {
    if (uni.$off) uni.$off("rt-elder-mode", this.onElderChange);
  },
  methods: {
    onElderChange(on) {
      this.elderOn = !!on;
      this.items = this.elderOn ? TABS_ELDER : TABS_FULL;
      this.syncCurrentPath();
      if (!this.elderOn) {
        const pages = getCurrentPages();
        const cur = pages[pages.length - 1];
        const route = cur && cur.route ? `/${cur.route}` : "";
        if (route === "/pages/benefit/benefit") {
          goReLaunch("/pages/village/village");
        }
      }
    },
    syncCurrentPath() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const route =
        currentPage && currentPage.route
          ? `/${currentPage.route}`
          : "/pages/village/village";
      this.currentPath = route;
      if (this.elderOn) {
        if (
          route.indexOf("/pages/village/records") === 0 ||
          route.indexOf("/pages/disputeDetail/") === 0
        ) {
          this.currentPath = "/pages/village/records";
        }
      } else if (
        route.indexOf("/pages/law/") === 0 ||
        route.indexOf("/pages/moral/") === 0 ||
        route.indexOf("/pages/group/") === 0
      ) {
        // 标准模式各自高亮，见 isActive
      }
    },
    async refreshBadges() {
      this.badges = readTabBadges();
      try {
        this.badges = await refreshTabBadges();
      } catch (e) {
        /* keep cache */
      }
    },
    badgeOf(item) {
      if (!item.badgeKey) return "";
      const n = Number(this.badges[item.badgeKey]) || 0;
      if (n <= 0) return "";
      return n > 99 ? "99+" : String(n);
    },
    isActive(item) {
      if (this.currentPath === item.path) return true;
      // 标准模式：法治子页高亮法治 Tab
      if (
        !this.elderOn &&
        item.path === "/pages/law/law" &&
        this.currentPath.indexOf("/pages/law/") === 0
      ) {
        return true;
      }
      if (
        !this.elderOn &&
        item.path === "/pages/moral/moral" &&
        this.currentPath.indexOf("/pages/moral/") === 0
      ) {
        return true;
      }
      if (
        !this.elderOn &&
        item.path === "/pages/group/group" &&
        this.currentPath.indexOf("/pages/group/") === 0
      ) {
        return true;
      }
      return false;
    },
    switchTo(path) {
      const pages = getCurrentPages();
      const cur = pages[pages.length - 1];
      const route = cur && cur.route ? `/${cur.route}` : "";
      if (route === path) return;
      // 简洁模式：已在法治等子页再点服务 → 回大厅
      if (
        this.elderOn &&
        path === "/pages/benefit/benefit" &&
        this.currentPath === "/pages/benefit/benefit" &&
        route !== path
      ) {
        goReLaunch(path);
        return;
      }
      this.currentPath = path;
      goReLaunch(path);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  height: calc(100rpx + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.96);
  border-top: 1rpx solid rgba(50, 40, 30, 0.06);
  box-shadow: 0 -4rpx 24rpx rgba(50, 40, 30, 0.04);
  box-sizing: border-box;
}

.tab-item {
  position: relative;
  flex: 1;
  height: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  color: #8a8a8a;
}

.tab-press {
  opacity: 0.7;
}

.tab-item.active {
  color: $rt-primary;
}

.icon-wrap {
  position: relative;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-badge {
  position: absolute;
  top: -6rpx;
  right: -14rpx;
  min-width: 28rpx;
  padding: 0 8rpx;
  height: 28rpx;
  line-height: 28rpx;
  border-radius: 999rpx;
  background: $rt-primary;
  color: #fff;
  font-size: 18rpx;
  font-weight: 800;
  text-align: center;
}

.tab-text {
  font-size: 20rpx;
  line-height: 1.2;
  font-weight: 500;
}

.tabbar.elder .tab-text {
  font-size: 24rpx;
  font-weight: 700;
}

.tab-item.active .tab-text {
  font-weight: 700;
  color: $rt-primary-dark;
}

.tab-indicator {
  position: absolute;
  bottom: 8rpx;
  left: 50%;
  width: 32rpx;
  height: 4rpx;
  margin-left: -16rpx;
  border-radius: 999rpx;
  background: $rt-primary;
}
</style>
