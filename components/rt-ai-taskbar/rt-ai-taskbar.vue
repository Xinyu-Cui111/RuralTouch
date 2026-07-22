<template>
  <view class="taskbar">
    <view class="head">
      <text class="brand">{{ task.brand || "村委协办员" }}</text>
      <text v-if="task.progressHint" class="hint">{{ task.progressHint }}</text>
    </view>
    <text class="conclusion">{{ task.conclusion || "暂无结论" }}</text>
    <text v-if="task.riskLabel" class="risk" :class="task.riskLevel"
      >{{ task.riskLabel }}风险</text
    >

    <view v-if="basisList.length" class="basis">
      <text v-for="(b, i) in basisList" :key="i" class="basis-item"
        >· {{ b }}</text
      >
      <text v-if="sourceText" class="source">来源：{{ sourceText }}</text>
    </view>

    <view
      class="primary"
      hover-class="press"
      :hover-stay-time="80"
      @click="$emit('action', task.primary || { key: 'submit' })"
    >
      <text class="primary-text">{{
        (task.primary && task.primary.label) || "去办事"
      }}</text>
    </view>

    <view v-if="secondary.length" class="sec-row">
      <text
        v-for="(a, i) in secondary"
        :key="i"
        class="sec"
        @click="$emit('action', a)"
        >{{ a.label }}</text
      >
    </view>
    <text class="disc">{{ task.disclaimer || "" }}</text>
  </view>
</template>

<script>
import { sourceLabelOf } from "@/utils/copy-voice.js";

export default {
  name: "RtAiTaskbar",
  props: {
    task: { type: Object, default: () => ({}) },
  },
  emits: ["action"],
  computed: {
    basisList() {
      return ((this.task && this.task.basis) || []).filter(Boolean).slice(0, 5);
    },
    secondary() {
      return ((this.task && this.task.secondary) || [])
        .filter(Boolean)
        .slice(0, 2);
    },
    sourceText() {
      const t = this.task || {};
      return t.sourceLabel || sourceLabelOf(t.source);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.taskbar {
  padding: 24rpx;
  border-radius: $rt-radius-md;
  background: linear-gradient(160deg, #fff 0%, #fff8f6 100%);
  border: 1rpx solid rgba(158, 52, 40, 0.16);
}
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 12rpx;
}
.brand {
  font-size: $rt-type-caption;
  font-weight: 800;
  color: $rt-primary-dark;
  letter-spacing: 1rpx;
}
.hint {
  flex: 1;
  text-align: right;
  font-size: $rt-type-micro;
  color: $rt-text-muted;
}
.conclusion {
  display: block;
  font-size: $rt-type-body;
  font-weight: 700;
  color: $rt-text;
  line-height: 1.5;
}
.risk {
  display: inline-block;
  margin-top: 10rpx;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  font-size: $rt-type-micro;
  font-weight: 800;
  background: rgba(158, 52, 40, 0.1);
  color: $rt-primary;
}
.risk.low {
  background: rgba(90, 107, 56, 0.12);
  color: $rt-olive;
}
.basis {
  margin-top: 14rpx;
}
.basis-item {
  display: block;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.45;
  margin-bottom: 4rpx;
}
.source {
  display: block;
  margin-top: 8rpx;
  font-size: $rt-type-micro;
  font-weight: 700;
  color: $rt-blue;
}
.primary {
  margin-top: 20rpx;
  min-height: $rt-touch-min;
  padding: 22rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $rt-primary-dark, $rt-primary-mid);
  text-align: center;
  box-sizing: border-box;
}
.primary-text {
  font-size: $rt-type-body;
  font-weight: 800;
  color: #fff;
}
.press {
  opacity: 0.92;
}
.sec-row {
  display: flex;
  justify-content: center;
  gap: 28rpx;
  margin-top: 16rpx;
}
.sec {
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-primary-mid;
}
.disc {
  display: block;
  margin-top: 12rpx;
  font-size: $rt-type-micro;
  color: $rt-text-muted;
  line-height: 1.4;
}
</style>
