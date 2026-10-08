<template>
  <view class="page">
    <rt-nav-bar title="激励礼品" />
    <view class="score-card">
      <text class="score-label">当前可用积分</text>
      <text class="score-num">{{ points.toLocaleString() }}</text>
    </view>

    <rt-skeleton v-if="loading" variant="cell" :count="3" />
    <empty-state
      v-else-if="loadError"
      icon-type="mall"
      icon-tone="gold"
      title="加载失败"
      action-text="点击重试"
      @action="loadData()"
    />
    <empty-state
      v-else-if="!list.length"
      icon-type="mall"
      icon-tone="gold"
      title="暂无礼品信息"
    />
    <view v-else class="list">
      <view v-for="item in list" :key="item._id" class="goods-card">
        <view class="goods-left">
          <rt-icon name="product" tone="gold" size="sm" />
          <view class="goods-info">
            <text class="goods-name">{{ item.name }}</text>
            <text class="goods-stock">参考库存 {{ item.stock }}</text>
          </view>
        </view>
        <view class="goods-right">
          <text class="goods-points">{{ item.points }} 分</text>
          <button class="redeem-btn" size="mini" @click="onRedeem(item)">
            咨询村委
          </button>
        </view>
      </view>
    </view>
    <text class="mall-tip"
      >仅展示激励礼品参考信息，积分核销请联系村委线下办理。</text
    >
  </view>
</template>

<script>
import EmptyState from "@/components/empty-state/empty-state.vue";
import RtIcon from "@/components/rt-icon/rt-icon.vue";
import RtSkeleton from "@/components/rt-skeleton/rt-skeleton.vue";
import { api } from "@/api/index.js";
import { isLoggedIn } from "@/utils/cloud.js";
import { VILLAGE_CONTACT_PHONE } from "@/config/env.js";

export default {
  components: { EmptyState, RtIcon, RtSkeleton },
  data() {
    return { loading: true, loadError: false, points: 0, list: [] };
  },
  onShow() {
    this.loadData();
  },
  onPullDownRefresh() {
    this.loadData(true).finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    async loadData(isRefresh = false) {
      if (!isRefresh) this.loading = true;
      this.loadError = false;
      try {
        const mall = await api.listMallItems();
        this.list = mall.data.list || [];
        if (isLoggedIn()) {
          const profile = await api.getMoralProfile();
          this.points = profile.data.points || 0;
        } else {
          this.points = 0;
        }
      } catch (e) {
        this.loadError = !this.list.length;
        uni.showToast({ title: e.message || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    async onRedeem(item) {
      const phone = String(VILLAGE_CONTACT_PHONE || "").replace(/\D/g, "");
      uni.showModal({
        title: "礼品意向",
        content: `「${
          (item && item.name) || "礼品"
        }」需村委线下核销积分。是否拨打村委电话咨询？`,
        success: (res) => {
          if (!res.confirm) return;
          if (!phone) {
            uni.showToast({ title: "暂未配置村委电话", icon: "none" });
            return;
          }
          uni.makePhoneCall({ phoneNumber: phone });
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";
.page {
  @include rt-page;
  padding: $rt-page-x;
}
.score-card {
  position: relative;
  overflow: hidden;
  padding: 32rpx 28rpx 32rpx 32rpx;
  margin-bottom: 24rpx;
  border-radius: $rt-radius-lg;
  background: #fff;
  border: 1rpx solid rgba(50, 40, 30, 0.06);
  box-shadow: $rt-shadow-sm;
}
.score-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 24rpx;
  bottom: 24rpx;
  width: 6rpx;
  border-radius: 0 6rpx 6rpx 0;
  background: linear-gradient(180deg, $rt-accent, $rt-accent-dark);
}
.score-label {
  font-size: $rt-type-caption;
  color: $rt-gold-label;
  font-weight: 700;
}
.score-num {
  display: block;
  margin-top: 12rpx;
  font-family: $rt-font-title;
  font-size: 56rpx;
  font-weight: $rt-weight-heavy;
  line-height: 1;
  color: $rt-gold-value;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.goods-card {
  position: relative;
  overflow: hidden;
  background: #fff;
  border: 1rpx solid rgba(50, 40, 30, 0.06);
  border-radius: $rt-radius-md;
  padding: 24rpx 28rpx 24rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  box-shadow: $rt-shadow-sm;
}
.goods-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 20rpx;
  bottom: 20rpx;
  width: 6rpx;
  border-radius: 0 6rpx 6rpx 0;
  background: linear-gradient(180deg, $rt-accent, $rt-accent-dark);
}
.goods-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
  min-width: 0;
}
.goods-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $rt-text;
}
.goods-stock {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: $rt-text-muted;
}
.goods-right {
  text-align: right;
  flex-shrink: 0;
}
.goods-points {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  color: $rt-accent-dark;
  margin-bottom: 12rpx;
}
.redeem-btn {
  @include rt-btn-reset;
  background: linear-gradient(135deg, $rt-accent-dark, $rt-accent);
  color: #fff;
  border-radius: 999rpx;
  font-size: 24rpx;
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 56rpx;
}
.mall-tip {
  display: block;
  margin: 24rpx 8rpx 40rpx;
  font-size: 22rpx;
  color: $rt-text-muted;
  line-height: 1.5;
  text-align: center;
}
</style>
