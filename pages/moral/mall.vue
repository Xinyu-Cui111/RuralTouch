<template>
  <view class="page">
    <rt-nav-bar title="积分商城" />
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
      title="暂无可兑换商品"
    />
    <view v-else class="list">
      <view v-for="item in list" :key="item._id" class="goods-card">
        <view class="goods-left">
          <rt-icon name="product" tone="gold" size="sm" />
          <view class="goods-info">
            <text class="goods-name">{{ item.name }}</text>
            <text class="goods-stock">库存 {{ item.stock }}</text>
          </view>
        </view>
        <view class="goods-right">
          <text class="goods-points">{{ item.points }} 分</text>
          <button class="redeem-btn" size="mini" @click="onRedeem(item)">
            兑换
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import EmptyState from "@/components/empty-state/empty-state.vue";
import RtIcon from "@/components/rt-icon/rt-icon.vue";
import RtSkeleton from "@/components/rt-skeleton/rt-skeleton.vue";
import { api } from "@/api/index.js";

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
        const [profile, mall] = await Promise.all([
          api.getMoralProfile(),
          api.listMallItems(),
        ]);
        this.points = profile.data.points || 0;
        this.list = mall.data.list || [];
      } catch (e) {
        this.loadError = !this.list.length;
        uni.showToast({ title: e.message || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    async onRedeem(item) {
      try {
        const res = await api.redeemMallItem(item._id);
        this.points = res.data.points;
        uni.showToast({ title: "兑换成功", icon: "success" });
        this.loadData(true);
      } catch (e) {
        uni.showToast({ title: e.message || "兑换失败", icon: "none" });
      }
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
</style>
