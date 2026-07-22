<template>
  <view
    class="rt-card"
    :class="[
      resolvedTone,
      { compact, flush, elevated: isElevated, premium: isPremium },
    ]"
  >
    <view class="card-glow" :class="resolvedTone" />
    <view
      v-if="usePattern"
      class="card-pattern"
      :class="[resolvedTone, patternKind]"
    />
    <view v-if="usePattern" class="card-motif" :class="resolvedTone">
      <view class="motif-ring outer" />
      <view class="motif-ring inner" />
      <view class="motif-leaf" />
    </view>
    <view class="card-shine" />
    <view v-if="showStripe" class="card-stripe" :class="resolvedTone" />
    <view class="card-inner">
      <slot />
    </view>
  </view>
</template>

<script>
const TONE_MAP = {
  default: "neutral",
  neutral: "neutral",
  elevated: "neutral",
  premium: "neutral",
  glass: "neutral",
  "tint-green": "green",
  green: "green",
  "tint-gold": "gold",
  gold: "gold",
  "tint-blue": "blue",
  blue: "blue",
  warm: "warm",
  ai: "ai",
};

export default {
  props: {
    variant: { type: String, default: "default" },
    tone: { type: String, default: "" },
    compact: { type: Boolean, default: false },
    flush: { type: Boolean, default: false },
    elevated: { type: Boolean, default: false },
    premium: { type: Boolean, default: false },
    stripe: { type: Boolean, default: true },
    // V7 默认关闭纹理，保持白卡干净；显式 pattern 才开
    pattern: { type: [Boolean, String], default: false },
  },
  computed: {
    resolvedTone() {
      if (this.tone) return this.tone;
      return TONE_MAP[this.variant] || "neutral";
    },
    isElevated() {
      return this.elevated || ["elevated", "premium"].includes(this.variant);
    },
    isPremium() {
      return this.premium || this.variant === "premium";
    },
    showStripe() {
      return this.stripe !== false;
    },
    usePattern() {
      if (this.pattern === false || this.pattern === "none") return false;
      if (this.pattern === true || this.pattern === "on") return true;
      return this.resolvedTone !== "neutral";
    },
    patternKind() {
      return "texture";
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.rt-card {
  @include rt-card;
  padding: $rt-card-pad;
  margin-bottom: $rt-space-md;
}

.rt-card.neutral {
  @include rt-card-tone(neutral);
}
.rt-card.green {
  @include rt-card-tone(green);
}
.rt-card.gold {
  @include rt-card-tone(gold);
}
.rt-card.blue {
  @include rt-card-tone(blue);
}
.rt-card.warm {
  @include rt-card-tone(warm);
}
.rt-card.ai {
  @include rt-card-tone(ai);
}

.rt-card.compact {
  padding: $rt-card-pad-sm;
}
.rt-card.flush {
  margin-bottom: 0;
}

.rt-card.elevated {
  box-shadow: $rt-shadow-card, 0 8rpx 28rpx rgba(50, 40, 30, 0.04);
}

.rt-card.premium {
  box-shadow: $rt-shadow-card, 0 0 0 1rpx rgba(255, 255, 255, 0.9) inset,
    0 10rpx 28rpx rgba(50, 40, 30, 0.05);
}

.rt-card.glass {
  @include rt-glass;
  box-shadow: $rt-shadow-md;
}

.card-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.card-glow.neutral {
  @include rt-card-glow(neutral);
}
.card-glow.green {
  @include rt-card-glow(green);
}
.card-glow.gold {
  @include rt-card-glow(gold);
}
.card-glow.blue {
  @include rt-card-glow(blue);
}
.card-glow.warm {
  @include rt-card-glow(warm);
}
.card-glow.ai {
  @include rt-card-glow(ai);
}

.card-pattern {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.35;
}

.card-pattern.green {
  @include rt-card-pattern(green);
}
.card-pattern.gold {
  @include rt-card-pattern(gold);
}
.card-pattern.blue {
  @include rt-card-pattern(blue);
}
.card-pattern.warm {
  @include rt-card-pattern(warm);
}
.card-pattern.ai {
  @include rt-card-pattern(ai);
}
.card-pattern.neutral {
  @include rt-card-pattern(neutral);
}

.card-motif {
  display: none; /* V7 去掉角落装饰，减噪 */
}

.card-shine {
  position: absolute;
  top: 0;
  left: 24rpx;
  right: 24rpx;
  height: 1rpx;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.95),
    transparent
  );
  pointer-events: none;
  z-index: 2;
}

/* V7：左侧语义色条（替代厚底） */
.card-stripe {
  position: absolute;
  top: 20rpx;
  bottom: 20rpx;
  left: 0;
  width: 6rpx;
  border-radius: 0 6rpx 6rpx 0;
  pointer-events: none;
  z-index: 2;
}

.card-stripe.neutral {
  background: linear-gradient(
    180deg,
    rgba(158, 52, 40, 0.35),
    rgba(201, 162, 74, 0.35)
  );
}
.card-stripe.green {
  @include rt-card-stripe(green);
  background: linear-gradient(180deg, #5a6b38, #8fa355);
}
.card-stripe.gold {
  background: linear-gradient(180deg, #c9a24a, #e0c06a);
}
.card-stripe.blue {
  background: linear-gradient(180deg, #3a4a63, #6a7f9b);
}
.card-stripe.warm {
  background: linear-gradient(180deg, #b86b35, #d4a06a);
}
.card-stripe.ai {
  background: linear-gradient(180deg, #9e3428, #c9a24a);
}

.card-inner {
  position: relative;
  z-index: 3;
  padding-left: 8rpx;
}
</style>
