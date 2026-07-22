<template>
  <view class="sk" :class="[`sk-${variant}`, { compact }]">
    <view
      v-if="variant === 'case'"
      v-for="n in count"
      :key="'c' + n"
      class="sk-case"
    >
      <view class="sk-row title" />
      <view class="sk-row meta" />
      <view class="sk-row bar" />
    </view>
    <view
      v-else-if="variant === 'cell'"
      v-for="n in count"
      :key="'e' + n"
      class="sk-cell"
    >
      <view class="sk-avatar" />
      <view class="sk-cell-body">
        <view class="sk-row title" />
        <view class="sk-row meta" />
      </view>
    </view>
    <view
      v-else
      v-for="n in rows"
      :key="'l' + n"
      class="sk-row"
      :style="lineStyle(n)"
    />
  </view>
</template>

<script>
export default {
  name: "RtSkeleton",
  props: {
    /** lines | case | cell */
    variant: { type: String, default: "lines" },
    rows: { type: Number, default: 3 },
    /** case / cell 条目数 */
    count: { type: Number, default: 2 },
    compact: { type: Boolean, default: false },
  },
  methods: {
    lineStyle(n) {
      const widths = [92, 78, 64, 86, 70];
      return { width: `${widths[(n - 1) % widths.length]}%` };
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

@keyframes rt-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@mixin sk-block {
  background: linear-gradient(
    90deg,
    rgba(50, 40, 30, 0.04) 0%,
    rgba(50, 40, 30, 0.09) 45%,
    rgba(50, 40, 30, 0.04) 90%
  );
  background-size: 200% 100%;
  animation: rt-shimmer 1.35s ease-in-out infinite;
  border-radius: 10rpx;
}

.sk {
  padding: 8rpx 0 4rpx;
}
.sk.compact {
  padding: 0;
}

.sk-row {
  @include sk-block;
  height: 24rpx;
  margin-bottom: 18rpx;
}
.sk-row:last-child {
  margin-bottom: 0;
}
.sk-row.title {
  height: 32rpx;
  width: 72%;
  margin-bottom: 14rpx;
}
.sk-row.meta {
  height: 20rpx;
  width: 42%;
  margin-bottom: 18rpx;
}
.sk-row.bar {
  height: 16rpx;
  width: 100%;
  border-radius: 999rpx;
}

.sk-case {
  padding: 22rpx 0;
  border-bottom: 1rpx solid $rt-border;
}
.sk-case:last-child {
  border-bottom: none;
  padding-bottom: 4rpx;
}

.sk-cell {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid $rt-border;
}
.sk-cell:last-child {
  border-bottom: none;
}
.sk-avatar {
  @include sk-block;
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  flex-shrink: 0;
}
.sk-cell-body {
  flex: 1;
  min-width: 0;
}
.sk-cell-body .sk-row {
  margin-bottom: 12rpx;
}
.sk-cell-body .sk-row:last-child {
  margin-bottom: 0;
}
</style>
