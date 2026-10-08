<template>
  <view class="page" :class="{ elder: elderOn }">
    <page-hero compact variant="moral" title="调解激励" />

    <!-- 简洁模式：大按钮清单 -->
    <view v-if="elderOn" class="elder-lite">
      <view class="lite-points">
        <text class="lite-kicker">当前积分</text>
        <text class="lite-num">{{ pointsText }}</text>
      </view>
      <view
        class="lite-btn primary"
        hover-class="lite-press"
        :hover-stay-time="80"
        @click="onMall"
      >
        <text class="lite-btn-title">查看激励礼品</text>
        <text class="lite-btn-desc">意向咨询村委</text>
      </view>
      <view
        class="lite-btn"
        hover-class="lite-press"
        :hover-stay-time="80"
        @click="onDeclare"
      >
        <text class="lite-btn-title">申报善行</text>
        <text class="lite-btn-desc">村内公益加分</text>
      </view>
      <view
        class="lite-btn"
        hover-class="lite-press"
        :hover-stay-time="80"
        @click="goSubmit"
      >
        <text class="lite-btn-title">去说事建档</text>
        <text class="lite-btn-desc">办结后可得积分</text>
      </view>
    </view>

    <template v-else>
      <!-- 激励资产：晨光氛围 + 数字情绪，一眼愉悦 -->
      <view class="wallet enter">
        <view class="wallet-sky" aria-hidden="true">
          <view class="orb o1" />
          <view class="orb o2" />
          <view class="spark s1" />
          <view class="spark s2" />
          <view class="spark s3" />
        </view>
        <view class="wallet-body">
          <view class="wallet-head">
            <view class="mood-badge">
              <rt-icon name="moral" tone="gold" size="sm" />
              <text class="mood-badge-text">调解激励</text>
            </view>
            <view
              class="wallet-cta"
              hover-class="press"
              :hover-stay-time="80"
              @click="onMall"
            >
              <text class="wallet-cta-text">去看礼品</text>
            </view>
          </view>

          <text class="mood-title">{{ moodTitle }}</text>
          <view class="wallet-value">
            <text class="wallet-num" :class="{ pulse: pointsPulse }">{{
              pointsText
            }}</text>
            <text class="wallet-unit">分</text>
          </view>
          <text class="wallet-tip">{{ pointsTip }}</text>
        </view>
      </view>

      <rt-section title="做一件好事">
        <view class="svc-row">
          <view
            class="svc-item"
            hover-class="svc-press"
            :hover-stay-time="80"
            @click="goSubmit"
          >
            <view class="svc-icon tone-a">
              <rt-icon name="dispute" tone="gold" size="sm" />
            </view>
            <view class="svc-copy">
              <text class="svc-title">说事建档</text>
              <text class="svc-desc">办结评价后入账</text>
            </view>
            <text class="svc-go">›</text>
          </view>
          <view
            class="svc-item"
            hover-class="svc-press"
            :hover-stay-time="80"
            @click="onDeclare"
          >
            <view class="svc-icon tone-b">
              <rt-icon name="declare" tone="gold" size="sm" />
            </view>
            <view class="svc-copy">
              <text class="svc-title">申报善行</text>
              <text class="svc-desc">村内公益加分</text>
            </view>
            <text class="svc-go">›</text>
          </view>
          <view
            class="svc-item"
            hover-class="svc-press"
            :hover-stay-time="80"
            @click="onMall"
          >
            <view class="svc-icon tone-c">
              <rt-icon name="mall" tone="gold" size="sm" />
            </view>
            <view class="svc-copy">
              <text class="svc-title">礼品意向</text>
              <text class="svc-desc">积分可咨询核销</text>
            </view>
            <text class="svc-go">›</text>
          </view>
        </view>
      </rt-section>

      <rt-section title="积分明细">
        <rt-card compact elevated tone="gold">
          <rt-skeleton v-if="loading" variant="cell" :count="3" />
          <empty-state
            v-else-if="loadError"
            icon-type="moral"
            icon-tone="gold"
            title="加载失败"
            action-text="点击重试"
            @action="loadProfile()"
          />
          <empty-state
            v-else-if="!records.length"
            icon-type="moral"
            icon-tone="gold"
            title="暂无积分记录"
            desc="办结调解或申报善行后会显示在这里"
            action-text="去说事"
            @action="goSubmit"
          />
          <rt-cell
            v-else
            v-for="(item, idx) in records"
            :key="item._id"
            :title="item.title"
            :desc="item.createTimeText"
            icon="moral"
            icon-tone="gold"
            :tag="
              item.status === 'pending'
                ? '审核中'
                : `${item.points > 0 ? '+' : ''}${item.points}分`
            "
            :tag-type="item.status === 'pending' ? 'pending' : 'done'"
            :show-arrow="false"
            :last="idx === records.length - 1"
          />
        </rt-card>
      </rt-section>
    </template>

    <tab-bar />
  </view>
</template>

<script>
import TabBar from "@/components/tab-bar/bar.vue";
import EmptyState from "@/components/empty-state/empty-state.vue";
import PageHero from "@/components/page-hero/page-hero.vue";
import RtCard from "@/components/rt-card/rt-card.vue";
import RtSection from "@/components/rt-section/rt-section.vue";
import RtCell from "@/components/rt-cell/rt-cell.vue";
import RtIcon from "@/components/rt-icon/rt-icon.vue";
import RtSkeleton from "@/components/rt-skeleton/rt-skeleton.vue";
import { api } from "@/api/index.js";
import { ensureLoggedIn } from "@/utils/auth.js";
import { isLoggedIn } from "@/utils/cloud.js";
import { goNavigate } from "@/utils/nav.js";
import { isElderMode } from "@/utils/elder-mode.js";

export default {
  components: {
    TabBar,
    EmptyState,
    PageHero,
    RtCard,
    RtSection,
    RtCell,
    RtIcon,
    RtSkeleton,
  },
  data() {
    return {
      elderOn: false,
      loading: true,
      loadError: false,
      points: 0,
      records: [],
      pointsPulse: false,
    };
  },
  computed: {
    pointsText() {
      return Number(this.points || 0).toLocaleString();
    },
    moodTitle() {
      if (!isLoggedIn()) return "先逛逛，善行看得见";
      const n = Number(this.points || 0);
      if (n <= 0) return "从第一分开始";
      if (n < 100) return "善行正在发芽";
      if (n < 500) return "善行有回响";
      return "积善成礼";
    },
    pointsTip() {
      if (!isLoggedIn()) return "登录后同步个人积分与明细";
      return "可用积分 · 办结评价、善行申报可入账";
    },
  },
  onShow() {
    this.elderOn = isElderMode();
    // 游客可先逛激励说明；申报/兑换再登录
    this.loadProfile();
  },
  onPullDownRefresh() {
    this.loadProfile(true).finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    async loadProfile(isRefresh = false) {
      if (!isLoggedIn()) {
        this.loading = false;
        this.loadError = false;
        this.points = 0;
        this.records = [];
        return;
      }
      if (!isRefresh) this.loading = true;
      this.loadError = false;
      try {
        const res = await api.getMoralProfile();
        this.points = res.data.points || 0;
        this.records = res.data.records || [];
      } catch (e) {
        const msg = (e && e.message) || "";
        if (/请先登录|未登录/.test(msg)) {
          this.points = 0;
          this.records = [];
          this.loadError = false;
          return;
        }
        this.loadError = !this.records.length;
        uni.showToast({ title: msg || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    goSubmit() {
      if (!ensureLoggedIn({ tip: "说事建档请先登录" })) return;
      goNavigate("/pages/village/submit");
    },
    onDeclare() {
      if (!ensureLoggedIn({ tip: "积分申报请先登录" })) return;
      goNavigate("/pages/moral/declare");
    },
    onMall() {
      // 礼品为展示信息，游客也可浏览；核销仍走联系村委
      goNavigate("/pages/moral/mall");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.page {
  @include rt-page;
  padding: 0 $rt-page-x $rt-page-bottom;
  background: radial-gradient(
      ellipse 90% 40% at 50% -5%,
      rgba(255, 248, 230, 0.9) 0%,
      transparent 55%
    ),
    $rt-bg;
}

.enter {
  @include rt-enter(0s);
}

.elder-lite {
  margin-bottom: 24rpx;
}
.lite-points {
  margin-bottom: 24rpx;
  padding: 28rpx 28rpx 26rpx;
  border-radius: $rt-radius-md;
  background: linear-gradient(145deg, #fffaf0 0%, #ffe9c4 100%);
  border: 1rpx solid rgba(201, 162, 74, 0.2);
  box-shadow: $rt-shadow-sm;
}
.lite-kicker {
  display: block;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-gold-label;
}
.lite-num {
  display: block;
  margin-top: 10rpx;
  font-family: $rt-font-title;
  font-size: 56rpx;
  font-weight: 800;
  color: $rt-gold-value;
  line-height: 1;
}
.lite-btn {
  margin-bottom: 16rpx;
  padding: 32rpx 28rpx;
  min-height: 120rpx;
  border-radius: $rt-radius-md;
  background: #fff;
  border: 1rpx solid rgba(50, 40, 30, 0.06);
  box-shadow: $rt-shadow-sm;
  box-sizing: border-box;
}
.lite-btn.primary {
  background: linear-gradient(145deg, #fffaf0 0%, #fff0d2 100%);
  border-color: rgba(201, 162, 74, 0.22);
}
.lite-press {
  opacity: 0.92;
}
.lite-btn-title {
  display: block;
  font-size: 34rpx;
  font-weight: 800;
  color: $rt-text;
}
.lite-btn-desc {
  display: block;
  margin-top: 8rpx;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
}

/* 晨光激励卡：氛围感 + 情绪文案，不堆金 */
.wallet {
  position: relative;
  overflow: hidden;
  margin-bottom: 28rpx;
  border-radius: 40rpx;
  background: linear-gradient(
    155deg,
    #fff9ef 0%,
    #ffe8bc 42%,
    #f5d48a 78%,
    #e8c36a 100%
  );
  box-shadow: 0 18rpx 40rpx rgba(168, 122, 36, 0.18),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.65);
}
.wallet-sky {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.75) 0%,
    rgba(255, 255, 255, 0) 70%
  );
  animation: orb-float 5.5s ease-in-out infinite;
}
.orb.o1 {
  width: 240rpx;
  height: 240rpx;
  right: -48rpx;
  top: -72rpx;
}
.orb.o2 {
  width: 160rpx;
  height: 160rpx;
  left: -36rpx;
  bottom: -48rpx;
  animation-delay: 1.2s;
}
.spark {
  position: absolute;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 12rpx rgba(255, 255, 255, 0.8);
  animation: spark-twinkle 2.4s ease-in-out infinite;
}
.spark.s1 {
  top: 36rpx;
  right: 120rpx;
}
.spark.s2 {
  top: 88rpx;
  right: 56rpx;
  width: 8rpx;
  height: 8rpx;
  animation-delay: 0.6s;
}
.spark.s3 {
  bottom: 48rpx;
  right: 160rpx;
  width: 7rpx;
  height: 7rpx;
  animation-delay: 1.1s;
}
@keyframes orb-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(10rpx);
  }
}
@keyframes spark-twinkle {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.85);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}
.wallet-body {
  position: relative;
  padding: 32rpx 28rpx 30rpx;
}
.wallet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}
.mood-badge {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 8rpx 16rpx 8rpx 10rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.55);
  border: 1rpx solid rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
}
.mood-badge-text {
  font-size: 22rpx;
  font-weight: 800;
  color: $rt-accent-dark;
  letter-spacing: 0.04em;
}
.wallet-cta {
  flex-shrink: 0;
  padding: 14rpx 24rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8f6e24 0%, #c9a24a 100%);
  box-shadow: 0 10rpx 22rpx rgba(110, 78, 20, 0.28);
}
.wallet-cta-text {
  font-size: 24rpx;
  font-weight: 800;
  color: #fff;
}
.mood-title {
  display: block;
  margin-top: 28rpx;
  font-family: $rt-font-title;
  font-size: 34rpx;
  font-weight: 800;
  color: #6e4e16;
  letter-spacing: 0.04em;
}
.wallet-value {
  margin-top: 12rpx;
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}
.wallet-num {
  font-family: $rt-font-title;
  font-size: 80rpx;
  font-weight: 800;
  line-height: 1;
  color: #5a4012;
  letter-spacing: -2rpx;
  text-shadow: 0 2rpx 0 rgba(255, 255, 255, 0.35);
}
.wallet-num.pulse {
  animation: points-pulse 0.75s ease-out 1;
}
@keyframes points-pulse {
  0% {
    transform: scale(1);
  }
  35% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
.wallet-unit {
  font-size: 28rpx;
  font-weight: 800;
  color: rgba(110, 78, 20, 0.72);
}
.wallet-tip {
  display: block;
  margin-top: 16rpx;
  font-size: $rt-type-caption;
  color: rgba(90, 64, 18, 0.72);
  line-height: 1.4;
}
.press {
  opacity: 0.92;
}

.svc-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.svc-item {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 24rpx 22rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.96);
  border: 1rpx solid rgba(201, 162, 74, 0.12);
  box-shadow: $rt-shadow-sm;
}
.svc-press {
  opacity: 0.92;
  transform: scale(0.99);
}
.svc-icon {
  width: 68rpx;
  height: 68rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.svc-icon.tone-a {
  background: linear-gradient(145deg, #fff8e8, #ffe7b8);
}
.svc-icon.tone-b {
  background: linear-gradient(145deg, #fff6f0, #ffd9c8);
}
.svc-icon.tone-c {
  background: linear-gradient(145deg, #f7faf0, #e4efc8);
}
.svc-copy {
  flex: 1;
  min-width: 0;
}
.svc-title {
  display: block;
  font-size: 30rpx;
  font-weight: 800;
  color: $rt-text;
}
.svc-desc {
  display: block;
  margin-top: 4rpx;
  font-size: $rt-type-micro;
  color: $rt-text-muted;
}
.svc-go {
  flex-shrink: 0;
  font-size: 36rpx;
  font-weight: 700;
  color: rgba(201, 162, 74, 0.7);
  line-height: 1;
}
</style>
