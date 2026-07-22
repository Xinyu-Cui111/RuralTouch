<template>
  <view class="empty" :class="{ compact }">
    <view class="icon-ring" :class="{ compact }">
      <rt-icon v-if="iconType" :name="iconType" :tone="iconTone" />
      <text v-else class="fallback-icon">{{ icon }}</text>
    </view>
    <text class="title">{{ title }}</text>
    <text v-if="desc" class="desc">{{ desc }}</text>
    <view
      v-if="actionText || secondaryText"
      class="actions"
      :class="{ compact }"
    >
      <button v-if="actionText" class="action-btn" @click="$emit('action')">
        {{ actionText }}
      </button>
      <button
        v-if="secondaryText"
        class="secondary-btn"
        @click="$emit('secondary')"
      >
        {{ secondaryText }}
      </button>
    </view>
  </view>
</template>

<script>
import RtIcon from "@/components/rt-icon/rt-icon.vue";

export default {
  components: { RtIcon },
  props: {
    icon: { type: String, default: "" },
    iconType: { type: String, default: "" },
    iconTone: { type: String, default: "green" },
    title: { type: String, default: "暂无数据" },
    desc: { type: String, default: "" },
    actionText: { type: String, default: "" },
    secondaryText: { type: String, default: "" },
    compact: { type: Boolean, default: false },
  },
  emits: ["action", "secondary"],
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56rpx 32rpx;
  text-align: center;
}
.empty.compact {
  padding: 28rpx 16rpx 20rpx;
}

.icon-ring {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28rpx;
  box-shadow: $rt-shadow-sm;
  border: 1rpx solid rgba(50, 40, 30, 0.06);
}
.icon-ring.compact {
  width: 88rpx;
  height: 88rpx;
  margin-bottom: 16rpx;
}

.fallback-icon {
  font-size: 48rpx;
}

.title {
  font-family: $rt-font-title;
  font-size: $rt-type-title;
  font-weight: 700;
  color: $rt-text;
}

.desc {
  margin-top: 12rpx;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: $rt-leading-body;
  max-width: 480rpx;
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  margin-top: 32rpx;
  width: 100%;
}
.actions.compact {
  margin-top: 24rpx;
  gap: 12rpx;
}
.action-btn {
  @include rt-btn-primary;
  padding: 0 48rpx;
  height: 84rpx;
  line-height: 84rpx;
  font-size: 28rpx;
  width: auto;
  min-width: 280rpx;
}
.actions.compact .action-btn {
  height: 72rpx;
  line-height: 72rpx;
  font-size: 26rpx;
  min-width: 240rpx;
}
.secondary-btn {
  @include rt-btn-ghost;
  padding: 0 40rpx;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 26rpx;
  width: auto;
  min-width: 240rpx;
  color: $rt-accent-dark;
  border-color: rgba(201, 162, 74, 0.35);
}
.actions.compact .secondary-btn {
  height: 64rpx;
  line-height: 64rpx;
  font-size: 24rpx;
}
</style>
