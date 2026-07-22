<template>
  <view class="page" :style="{ paddingTop: padTop + 'px' }">
    <swiper class="swiper" :current="current" @change="onChange">
      <swiper-item v-for="(slide, idx) in slides" :key="idx">
        <view class="slide">
          <view class="icon-wrap">
            <rt-icon :name="slide.icon" :tone="slide.tone" />
          </view>
          <text class="title">{{ slide.title }}</text>
          <text class="desc">{{ slide.desc }}</text>
          <view class="bullets">
            <view v-for="(b, i) in slide.points" :key="i" class="bullet">
              <view class="check-icon">
                <view class="check-stem" />
              </view>
              <text class="text">{{ b }}</text>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <view class="dots">
      <view
        v-for="(_, idx) in slides"
        :key="idx"
        class="dot-item"
        :class="{ active: current === idx }"
      />
    </view>

    <view class="footer">
      <text class="skip" @click="finish">跳过</text>
      <button class="next-btn" @click="onNext">
        {{ current === slides.length - 1 ? "开始使用" : "下一步" }}
      </button>
    </view>
  </view>
</template>

<script>
import RtIcon from "@/components/rt-icon/rt-icon.vue";
import { markOnboardingDone } from "@/utils/auth.js";
import { goBootHome } from "@/utils/boot-route.js";
import { getSafeLayout } from "@/utils/safe-area.js";
import { COPY } from "@/utils/copy-voice.js";

export default {
  components: { RtIcon },
  data() {
    const layout = getSafeLayout();
    return {
      current: 0,
      padTop: layout.contentTop + 12,
      slides: [
        {
          icon: "tab-village",
          tone: "primary",
          title: COPY.onboarding1Title,
          desc: COPY.onboarding1Desc,
          points: COPY.onboarding1Points,
        },
        {
          icon: "record",
          tone: "green",
          title: COPY.onboarding2Title,
          desc: COPY.onboarding2Desc,
          points: COPY.onboarding2Points,
        },
        {
          icon: "tab-moral",
          tone: "gold",
          title: COPY.onboarding3Title,
          desc: COPY.onboarding3Desc,
          points: COPY.onboarding3Points,
        },
      ],
    };
  },
  methods: {
    onChange(e) {
      this.current = e.detail.current;
    },
    onNext() {
      if (this.current < this.slides.length - 1) {
        this.current += 1;
        return;
      }
      this.finish();
    },
    finish() {
      markOnboardingDone();
      goBootHome();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";
.page {
  min-height: 100vh;
  padding: 24rpx 48rpx calc(48rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  @include rt-hero-mesh(#9e3428, #c9a24a, #5a6b38);
  display: flex;
  flex-direction: column;
}
.swiper {
  flex: 1;
  height: 720rpx;
}
.slide {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 20rpx;
}
.icon-wrap {
  margin-bottom: 36rpx;
}
.title {
  font-family: $rt-font-title;
  font-size: 48rpx;
  font-weight: 800;
  color: $rt-text;
}
.desc {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: $rt-text-secondary;
  line-height: 1.65;
}
.bullets {
  margin-top: 48rpx;
  width: 100%;
  max-width: 560rpx;
  text-align: left;
}
.bullet {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 20rpx;
}
.check-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  margin-top: 4rpx;
  flex-shrink: 0;
  background: $rt-accent;
  display: flex;
  align-items: center;
  justify-content: center;
}
.check-stem {
  width: 8rpx;
  height: 14rpx;
  border-right: 3rpx solid #fff;
  border-bottom: 3rpx solid #fff;
  transform: rotate(45deg) translateY(-2rpx);
}
.text {
  font-size: 28rpx;
  color: $rt-text-secondary;
  line-height: 1.55;
}
.dots {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin-top: 20rpx;
}
.dot-item {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: $rt-border-strong;
  transition: all 0.2s;
}
.dot-item.active {
  width: 36rpx;
  border-radius: 999rpx;
  background: $rt-accent;
}
.footer {
  margin-top: 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}
.skip {
  font-size: 28rpx;
  color: $rt-text-muted;
  padding: 20rpx;
}
.next-btn {
  flex: 1;
  @include rt-btn-reset;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $rt-accent-dark, $rt-accent);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
}
</style>
