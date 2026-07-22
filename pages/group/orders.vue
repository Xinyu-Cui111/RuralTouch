<template>
  <view class="page">
    <rt-nav-bar title="我的团购订单" />
    <rt-skeleton v-if="loading" variant="case" :count="3" />
    <empty-state
      v-else-if="loadError"
      icon-type="product"
      icon-tone="green"
      title="加载失败"
      action-text="点击重试"
      @action="load()"
    />
    <empty-state
      v-else-if="!list.length"
      icon-type="product"
      icon-tone="green"
      title="暂无订单"
      desc="去团购页下一单"
      action-text="去团购"
      @action="goGroup"
    />
    <rt-card
      v-else
      v-for="item in list"
      :key="item._id"
      compact
      elevated
      tone="green"
      class="order-card"
    >
      <view class="row">
        <text class="name">{{ item.productName }}</text>
        <text class="tag">{{ item.statusLabel || "已下单" }}</text>
      </view>
      <text class="meta"
        >{{ item.createTimeText }} · ¥{{ item.amount }} ×
        {{ item.qty || 1 }}</text
      >
      <text class="fund"
        >反哺基金 ¥{{ item.fundContribution }}（{{
          Math.round((item.fundRatio || 0.3) * 100)
        }}%）</text
      >
    </rt-card>
  </view>
</template>

<script>
import EmptyState from "@/components/empty-state/empty-state.vue";
import RtCard from "@/components/rt-card/rt-card.vue";
import RtSkeleton from "@/components/rt-skeleton/rt-skeleton.vue";
import { api } from "@/api/index.js";
import { ensureLoggedIn } from "@/utils/auth.js";
import { goReLaunch } from "@/utils/nav.js";

export default {
  components: { EmptyState, RtCard, RtSkeleton },
  data() {
    return { loading: true, loadError: false, list: [] };
  },
  onShow() {
    if (!ensureLoggedIn()) return;
    this.load();
  },
  onPullDownRefresh() {
    this.load(true).finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    goGroup() {
      goReLaunch("/pages/group/group");
    },
    async load(isRefresh = false) {
      if (!isRefresh) this.loading = true;
      this.loadError = false;
      try {
        const res = await api.listMyOrders();
        this.list = res.data.list || [];
      } catch (e) {
        this.loadError = !this.list.length;
        uni.showToast({ title: e.message || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
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
.order-card {
  margin-bottom: 16rpx;
}
.row {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  align-items: flex-start;
}
.name {
  flex: 1;
  font-size: 30rpx;
  font-weight: 800;
  color: $rt-text;
}
.tag {
  @include rt-status-done;
  flex-shrink: 0;
}
.meta {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: $rt-text-muted;
}
.fund {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: $rt-accent-dark;
}
</style>
