<template>
  <view class="section">
    <view class="head">
      <view class="titles">
        <view class="title-row">
          <view class="accent-bar" />
          <text class="title">{{ title }}</text>
          <text v-if="badge" class="badge">{{ badge }}</text>
        </view>
        <text v-if="subtitle" class="subtitle">{{ subtitle }}</text>
      </view>
      <text v-if="link" class="link" @click="$emit('link')">{{ link }}</text>
    </view>
    <slot />
  </view>
</template>

<script>
export default {
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    link: { type: String, default: "" },
    badge: { type: [String, Number], default: "" },
  },
  emits: ["link"],
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.section {
  margin-bottom: $rt-section-gap;
}

.head {
  @include rt-section-head;
}

.titles {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
}

.accent-bar {
  @include rt-accent-bar;
}

.title {
  @include rt-section-title;
}

.badge {
  margin-left: 12rpx;
  min-width: 32rpx;
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
  background: rgba(198, 40, 40, 0.12);
  color: #c62828;
  font-size: 20rpx;
  font-weight: 800;
  line-height: 1.4;
  text-align: center;
}

.subtitle {
  @include rt-section-sub;
}

.link {
  font-size: 26rpx;
  color: $rt-primary-mid;
  font-weight: 600;
  padding: 8rpx 0;
  flex-shrink: 0;
}
</style>
