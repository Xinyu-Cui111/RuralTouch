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
        <text class="lite-btn-title">去积分商城兑换</text>
        <text class="lite-btn-desc">日用品兑换</text>
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
      <!-- 积分本 / 兑换凭证（器物化，去游戏币） -->
      <view class="ledger-card enter">
        <view class="ledger-spine" />
        <view class="ledger-body">
          <text class="ledger-stamp">积分本</text>
          <text class="ledger-kicker">当前可用积分</text>
          <text class="ledger-num" :class="{ pulse: pointsPulse }">{{
            pointsText
          }}</text>
          <text class="ledger-hint">办结评价、善行申报可入账；可换日用品</text>
          <view
            class="ledger-cta"
            hover-class="press"
            :hover-stay-time="80"
            @click="onMall"
          >
            <text class="ledger-cta-text">去兑换</text>
          </view>
        </view>
      </view>

      <rt-section title="积分服务">
        <view class="svc-grid">
          <view
            class="svc-card"
            hover-class="svc-press"
            :hover-stay-time="80"
            @click="goSubmit"
          >
            <view class="svc-icon-wrap">
              <rt-icon name="dispute" tone="gold" size="sm" />
            </view>
            <text class="svc-title">说事建档</text>
            <text class="svc-desc">办结得积分</text>
          </view>
          <view
            class="svc-card"
            hover-class="svc-press"
            :hover-stay-time="80"
            @click="onDeclare"
          >
            <view class="svc-icon-wrap">
              <rt-icon name="declare" tone="gold" size="sm" />
            </view>
            <text class="svc-title">申报善行</text>
            <text class="svc-desc">村内公益</text>
          </view>
          <view
            class="svc-card hot"
            hover-class="svc-press"
            :hover-stay-time="80"
            @click="onMall"
          >
            <view class="svc-icon-wrap">
              <rt-icon name="mall" tone="gold" size="sm" />
            </view>
            <text class="svc-title">积分兑换</text>
            <text class="svc-desc">日用品</text>
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
  },
  onShow() {
    this.elderOn = isElderMode();
    if (!ensureLoggedIn()) return;
    this.loadProfile();
    this.pointsPulse = false;
    this.$nextTick(() => {
      this.pointsPulse = true;
    });
  },
  onPullDownRefresh() {
    this.loadProfile(true).finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    async loadProfile(isRefresh = false) {
      if (!isRefresh) this.loading = true;
      this.loadError = false;
      try {
        const res = await api.getMoralProfile();
        this.points = res.data.points || 0;
        this.records = res.data.records || [];
      } catch (e) {
        this.loadError = !this.records.length;
        uni.showToast({ title: e.message || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    goSubmit() {
      goNavigate("/pages/village/submit");
    },
    onDeclare() {
      goNavigate("/pages/moral/declare");
    },
    onMall() {
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
}

.enter {
  @include rt-enter(0s);
}

.elder-lite {
  margin-bottom: 24rpx;
}
.lite-points {
  margin-bottom: 24rpx;
  padding: 32rpx 28rpx;
  border-radius: $rt-radius-md;
  background: #fff;
  border: 1rpx solid rgba(201, 162, 74, 0.22);
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
  font-size: 64rpx;
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
  background: linear-gradient(145deg, #fffef9 0%, #fff4d7 100%);
  border-color: rgba(201, 162, 74, 0.28);
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

.ledger-card {
  position: relative;
  display: flex;
  margin-bottom: 28rpx;
  border-radius: $rt-radius-lg;
  overflow: hidden;
  background: #fff;
  border: 1rpx solid rgba(201, 162, 74, 0.28);
  box-shadow: $rt-shadow-card;
}
.ledger-spine {
  width: 18rpx;
  flex-shrink: 0;
  background: linear-gradient(180deg, #c9a24a 0%, #8f6e24 100%);
}
.ledger-body {
  flex: 1;
  padding: 36rpx 32rpx 32rpx;
  background: radial-gradient(
      ellipse 70% 50% at 100% 0%,
      rgba(255, 249, 230, 0.9) 0%,
      transparent 55%
    ),
    linear-gradient(180deg, #fffefa 0%, #fff9ec 100%);
}
.ledger-stamp {
  display: inline-block;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  border: 2rpx solid rgba(143, 110, 36, 0.45);
  color: $rt-gold-label;
  font-size: 20rpx;
  font-weight: 800;
  letter-spacing: 4rpx;
  margin-bottom: 16rpx;
}
.ledger-kicker {
  display: block;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-gold-label;
}
.ledger-num {
  display: block;
  margin-top: 12rpx;
  font-family: $rt-font-title;
  font-size: 72rpx;
  font-weight: 800;
  line-height: 1;
  color: $rt-gold-value;
}
.ledger-num.pulse {
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
.ledger-hint {
  display: block;
  margin-top: 14rpx;
  font-size: $rt-type-micro;
  color: $rt-text-secondary;
  line-height: 1.45;
}
.ledger-cta {
  margin-top: 24rpx;
  display: inline-flex;
  padding: 16rpx 32rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $rt-accent-dark, $rt-accent);
}
.ledger-cta-text {
  font-size: $rt-type-body;
  font-weight: 800;
  color: #fff;
}
.press {
  opacity: 0.92;
}

.svc-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}
.svc-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28rpx 12rpx 24rpx;
  border-radius: $rt-radius-md;
  background: #fff;
  border: 1rpx solid rgba(201, 162, 74, 0.22);
  box-shadow: $rt-shadow-sm;
  text-align: center;
}
.svc-card.hot {
  background: linear-gradient(160deg, #fffef5 0%, #fff4d7 100%);
  border: 2rpx solid rgba(201, 162, 74, 0.4);
}
.svc-press {
  opacity: 0.9;
  transform: scale(0.98);
}
.svc-icon-wrap {
  @include rt-icon-tile(72rpx);
  margin-bottom: 14rpx;
  background: $rt-accent-soft;
}
.svc-title {
  font-size: 26rpx;
  font-weight: 800;
  color: $rt-text;
}
.svc-desc {
  margin-top: 6rpx;
  font-size: 20rpx;
  color: $rt-text-muted;
}
</style>
