<template>
  <view class="steps" :class="tone">
    <view
      v-for="(step, i) in steps"
      :key="i"
      class="step"
      :class="{
        done: i < activeIndex,
        active: i === activeIndex,
        upcoming: i > activeIndex,
      }"
    >
      <view class="dot-wrap">
        <view class="dot">
          <view v-if="i < activeIndex" class="check-mark">
            <view class="check-stem" />
          </view>
          <text v-else class="num">{{ i + 1 }}</text>
        </view>
        <view
          v-if="i < steps.length - 1"
          class="rail"
          :class="{ filled: i < activeIndex }"
        />
      </view>
      <text class="label">{{ step }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    steps: {
      type: Array,
      default: () => ["提交", "受理", "办理", "办结"],
    },
    active: { type: Number, default: 0 },
    status: { type: String, default: "" },
    tone: { type: String, default: "green" },
  },
  computed: {
    activeIndex() {
      if (this.status === "completed") return this.steps.length - 1;
      if (typeof this.active === "number" && this.active >= 0)
        return this.active;
      return 1;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.steps {
  display: flex;
  padding: 8rpx 4rpx 4rpx;
}

.step {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dot-wrap {
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 12rpx;
}

.dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: $rt-bg-soft;
  border: 2rpx solid $rt-border-strong;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-sizing: border-box;
}

.num {
  font-size: 20rpx;
  font-weight: 700;
  color: $rt-text-muted;
}

.check {
  font-size: 22rpx;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.check-mark {
  width: 18rpx;
  height: 10rpx;
  border-left: 3rpx solid #fff;
  border-bottom: 3rpx solid #fff;
  transform: rotate(-45deg) translateY(-2rpx);
  box-sizing: border-box;
}

.check-stem {
  display: none;
}

.rail {
  position: absolute;
  left: 50%;
  right: -50%;
  top: 50%;
  height: 4rpx;
  margin-top: -2rpx;
  background: $rt-border-strong;
  z-index: 0;
}

.rail.filled {
  background: linear-gradient(90deg, $rt-olive-mid, $rt-accent);
}

.step.done .dot {
  background: $rt-olive-mid;
  border-color: $rt-olive-mid;
}

.step.active .dot {
  background: $rt-primary;
  border-color: $rt-primary;
  box-shadow: 0 0 0 6rpx rgba(158, 52, 40, 0.15);
}

.step.active .num {
  color: #fff;
}

.label {
  font-size: 22rpx;
  color: $rt-text-muted;
  font-weight: 600;
  text-align: center;
}

.step.done .label {
  color: $rt-olive;
}
.step.active .label {
  color: $rt-primary;
  font-weight: 800;
}

.steps.gold .rail.filled {
  background: linear-gradient(90deg, $rt-accent, $rt-primary);
}
.steps.gold .step.done .dot {
  background: $rt-accent-dark;
  border-color: $rt-accent-dark;
}
</style>
