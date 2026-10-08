<template>
  <view class="page" :class="{ elder: elderOn }">
    <rt-nav-bar title="办结完成" />
    <view class="hero">
      <view class="mark"><view class="arm" /></view>
      <text class="brand">指尖善治</text>
      <text class="title">{{ title }}</text>
      <text class="sub">{{ sub }}</text>
    </view>

    <view class="steps">
      <view class="step done"
        ><text class="n">1</text><text class="t">办结</text></view
      >
      <view class="line" />
      <view class="step done"
        ><text class="n">2</text><text class="t">评价</text></view
      >
      <view class="line" />
      <view class="step now"
        ><text class="n">3</text><text class="t">积分</text></view
      >
    </view>

    <rt-card elevated>
      <text class="meta-line">办理结果已确认</text>
      <text class="meta-line soft">{{ durationText }}</text>
      <text class="points-line">{{ pointsLine }}</text>
      <text class="card-desc"
        >激励积分可向村委咨询线下礼品核销（本小程序不提供在线交易）。</text
      >
      <view
        class="cta"
        hover-class="press"
        :hover-stay-time="80"
        @click="goMall"
      >
        <text class="cta-text">查看激励礼品</text>
      </view>
      <text class="link" @click="goHome">返回办事首页</text>
    </rt-card>

    <rt-trust-bar tip="感谢配合调解；如需继续办事请回首页" />
  </view>
</template>

<script>
import RtCard from "@/components/rt-card/rt-card.vue";
import RtTrustBar from "@/components/rt-trust-bar/rt-trust-bar.vue";
import { COPY } from "@/utils/copy-voice.js";
import { goReLaunch } from "@/utils/nav.js";
import { isElderMode } from "@/utils/elder-mode.js";
import { api } from "@/api/index.js";
import { daysSinceCreate } from "@/utils/case-timeline.js";

export default {
  components: { RtCard, RtTrustBar },
  data() {
    return {
      elderOn: false,
      title: COPY.ceremonyTitle,
      sub: COPY.ceremonySub,
      pointsLine: COPY.ceremonyPoints,
      disputeId: "",
      durationText: "村委已完成办理",
    };
  },
  onLoad(q) {
    this.disputeId = (q && q.id) || "";
    if (this.disputeId) this.loadMeta();
  },
  onShow() {
    this.elderOn = isElderMode();
  },
  methods: {
    async loadMeta() {
      try {
        const res = await api.getDispute(this.disputeId);
        const d = (res && res.data && (res.data.dispute || res.data)) || null;
        if (!d) return;
        const days = daysSinceCreate(d);
        this.durationText =
          days > 0 ? `自提交起约 ${days} 天办结` : "已办结，感谢您的配合";
      } catch (e) {
        /* keep default */
      }
    },
    goMall() {
      goReLaunch("/pages/moral/mall");
    },
    goHome() {
      goReLaunch("/pages/village/village");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.page {
  @include rt-page;
  padding: $rt-page-x;
  padding-bottom: 80rpx;
}

.hero {
  text-align: center;
  padding: 40rpx 0 28rpx;
}
.mark {
  width: 96rpx;
  height: 96rpx;
  margin: 0 auto 16rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $rt-olive, $rt-olive-mid);
  display: flex;
  align-items: center;
  justify-content: center;
}
.arm {
  width: 36rpx;
  height: 18rpx;
  border-left: 6rpx solid #fff;
  border-bottom: 6rpx solid #fff;
  transform: rotate(-45deg);
  margin-top: -8rpx;
}
.brand {
  display: block;
  font-size: $rt-type-caption;
  font-weight: 800;
  color: $rt-primary;
  letter-spacing: 4rpx;
  margin-bottom: 8rpx;
}
.title {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: $rt-text;
}
.sub {
  display: block;
  margin-top: 12rpx;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.5;
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-bottom: 28rpx;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  opacity: 0.45;
}
.step.done,
.step.now {
  opacity: 1;
}
.n {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: $rt-accent-soft;
  color: $rt-accent-dark;
  font-size: 22rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.step.now .n {
  background: $rt-primary;
  color: #fff;
}
.t {
  font-size: 22rpx;
  font-weight: 700;
  color: $rt-text;
}
.line {
  width: 48rpx;
  height: 4rpx;
  background: rgba(201, 162, 74, 0.35);
  margin-bottom: 28rpx;
}

.meta-line {
  display: block;
  font-size: $rt-type-body;
  font-weight: 700;
  color: $rt-text;
}
.meta-line.soft {
  margin-top: 8rpx;
  font-weight: 600;
  color: $rt-text-secondary;
  font-size: $rt-type-caption;
}
.points-line {
  display: block;
  margin-top: 16rpx;
  font-size: 36rpx;
  font-weight: 800;
  color: $rt-accent-dark;
}
.card-desc {
  display: block;
  margin-top: 10rpx;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.5;
}
.cta {
  margin-top: 24rpx;
  min-height: $rt-touch-min;
  padding: 22rpx;
  border-radius: 999rpx;
  text-align: center;
  background: linear-gradient(135deg, $rt-primary-dark, $rt-primary-mid);
  box-sizing: border-box;
}
.cta-text {
  font-size: $rt-type-body;
  font-weight: 800;
  color: #fff;
}
.press {
  opacity: 0.92;
}
.link {
  display: block;
  margin-top: 20rpx;
  text-align: center;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-primary-mid;
}
</style>
