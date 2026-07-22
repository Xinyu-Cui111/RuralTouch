<template>
  <view class="tabbar">
    <view
      v-for="item in items"
      :key="item.path"
      class="tab-item"
      :class="{ active: selected === item.path }"
      @click="switchTo(item.path)"
    >
      <rt-icon
        :name="item.icon"
        :tone="selected === item.path ? 'gold' : 'neutral'"
        size="sm"
      />
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script>
import RtIcon from "@/components/rt-icon/rt-icon.vue";

export default {
  components: { RtIcon },
  data() {
    return {
      selected: "/pages/village/village",
      items: [
        { path: "/pages/village/village", text: "首页", icon: "tab-village" },
        { path: "/pages/law/law", text: "法治", icon: "tab-law" },
        { path: "/pages/moral/moral", text: "激励", icon: "tab-moral" },
        { path: "/pages/group/group", text: "团购", icon: "tab-group" },
        { path: "/pages/profile/profile", text: "我的", icon: "tab-profile" },
      ],
    };
  },
  methods: {
    switchTo(path) {
      this.selected = path;
      uni.reLaunch({ url: path });
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
  background: #ffffff;
  border-top: 1rpx solid rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
}

.tab-item {
  flex: 1;
  height: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  color: #8a8a8a;
}

.tab-item.active {
  color: $rt-accent-dark;
}

.tab-text {
  font-size: 20rpx;
  line-height: 1.2;
  font-weight: 500;
}

.tab-item.active .tab-text {
  font-weight: 600;
  color: $rt-accent-dark;
}
</style>
