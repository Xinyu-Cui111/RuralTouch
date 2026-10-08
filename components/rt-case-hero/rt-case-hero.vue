<template>
  <view
    class="hero-card"
    :class="[mode, { flash: flashOn }]"
    hover-class="press"
    :hover-stay-time="80"
    @click="$emit('primary')"
  >
    <view class="accent" />
    <view class="sheen" />
    <text class="kicker">{{ kicker }}</text>
    <text class="title">{{ title }}</text>
    <text class="desc">{{ desc }}</text>
    <view class="cta"
      ><text class="cta-text">{{ cta }}</text></view
    >
  </view>
</template>

<script>
export default {
  name: "RtCaseHero",
  props: {
    mode: { type: String, default: "say" }, // say | handling | push | notice
    kicker: { type: String, default: "" },
    title: { type: String, default: "" },
    desc: { type: String, default: "" },
    cta: { type: String, default: "去办理" },
    flash: { type: Boolean, default: false },
  },
  emits: ["primary"],
  data() {
    return { flashOn: false };
  },
  watch: {
    flash(v) {
      if (v) this.playFlash();
    },
  },
  methods: {
    playFlash() {
      this.flashOn = true;
      setTimeout(() => {
        this.flashOn = false;
      }, 700);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.hero-card {
  position: relative;
  overflow: hidden;
  margin-bottom: $rt-space-sm;
  padding: 40rpx 36rpx 36rpx 40rpx;
  border-radius: $rt-radius-lg;
  background: radial-gradient(
      ellipse 80% 60% at 90% 0%,
      rgba(255, 255, 255, 0.95) 0%,
      transparent 50%
    ),
    linear-gradient(152deg, #fffdf9 0%, #faf0ea 42%, #f3ddd4 100%);
  border: 1rpx solid rgba(158, 52, 40, 0.1);
  box-shadow: 0 10rpx 28rpx rgba(90, 60, 40, 0.06);
  box-sizing: border-box;
}
.hero-card.handling,
.hero-card.push {
  background: radial-gradient(
      ellipse 90% 70% at 100% 0%,
      rgba(255, 255, 255, 0.98) 0%,
      transparent 55%
    ),
    linear-gradient(
      145deg,
      #fbfcf8 0%,
      $rt-olive-soft 55%,
      $rt-olive-light 100%
    );
  border-color: rgba(90, 107, 56, 0.14);
}
.hero-card.notice {
  background: radial-gradient(
      ellipse 90% 70% at 100% 0%,
      rgba(255, 255, 255, 0.98) 0%,
      transparent 55%
    ),
    linear-gradient(145deg, #f8fafc 0%, $rt-blue-soft 55%, #e4eaf2 100%);
  border-color: rgba(58, 74, 99, 0.12);
}
.accent {
  position: absolute;
  left: 0;
  top: 24rpx;
  bottom: 24rpx;
  width: 6rpx;
  border-radius: 0 6rpx 6rpx 0;
  background: linear-gradient(180deg, $rt-primary-dark, $rt-primary-mid);
}
.hero-card.handling .accent,
.hero-card.push .accent {
  background: linear-gradient(180deg, #4a5a30, #8fa355);
}
.hero-card.notice .accent {
  background: linear-gradient(180deg, #2f3c52, #6a7f9b);
}
.sheen {
  position: absolute;
  top: 0;
  left: 40rpx;
  right: 40rpx;
  height: 1rpx;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.95),
    transparent
  );
  pointer-events: none;
}
.hero-card.flash {
  animation: hero-flash 0.65s ease-out;
}
@keyframes hero-flash {
  0% {
    box-shadow: 0 0 0 0 rgba(90, 107, 56, 0.35);
  }
  40% {
    box-shadow: 0 0 0 12rpx rgba(90, 107, 56, 0.12);
  }
  100% {
    box-shadow: $rt-shadow-sm;
  }
}
.press {
  opacity: 0.94;
}
.kicker {
  display: block;
  font-family: $rt-font-title;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-primary;
  margin-bottom: 10rpx;
  letter-spacing: 1rpx;
}
.hero-card.handling .kicker,
.hero-card.push .kicker {
  color: $rt-olive;
}
.hero-card.notice .kicker {
  color: $rt-blue;
}
.title {
  display: block;
  font-family: $rt-font-title;
  font-size: 44rpx;
  font-weight: 800;
  color: $rt-text;
  line-height: 1.28;
  letter-spacing: 1rpx;
}
.desc {
  display: block;
  margin-top: 14rpx;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.55;
  max-width: 92%;
}
.cta {
  margin-top: 32rpx;
  min-height: 84rpx;
  padding: 20rpx 40rpx;
  border-radius: 999rpx;
  background: linear-gradient(
    135deg,
    $rt-primary-dark 0%,
    $rt-primary-mid 100%
  );
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  box-shadow: 0 10rpx 24rpx rgba(158, 52, 40, 0.2);
}
.cta-text {
  font-size: $rt-type-body;
  font-weight: 800;
  color: #fff;
}
.hero-card.handling .cta,
.hero-card.push .cta {
  background: linear-gradient(135deg, #4a5a30 0%, #718544 100%);
  box-shadow: 0 8rpx 20rpx rgba(90, 107, 56, 0.16);
}
.hero-card.notice .cta {
  background: linear-gradient(135deg, #2f3c52 0%, #5a6b82 100%);
  box-shadow: 0 8rpx 20rpx rgba(58, 74, 99, 0.14);
}
</style>
