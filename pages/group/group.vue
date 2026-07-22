<template>
  <view class="page" :class="{ elder: elderOn }">
    <page-hero compact variant="group" title="惠民团购" />

    <view v-if="elderOn" class="elder-lite">
      <view
        class="lite-btn primary"
        hover-class="lite-press"
        :hover-stay-time="80"
        @click="goOrders"
      >
        <text class="lite-btn-title">我的团购订单</text>
        <text class="lite-btn-desc">查看已下单商品</text>
      </view>
      <view
        v-for="n in navList"
        :key="n.key"
        class="lite-btn"
        hover-class="lite-press"
        :hover-stay-time="80"
        @click="goCategory(n)"
      >
        <text class="lite-btn-title">{{ n.text }}</text>
        <text class="lite-btn-desc">浏览{{ n.text }}商品</text>
      </view>
      <view
        v-if="hotProducts[0]"
        class="lite-btn"
        hover-class="lite-press"
        :hover-stay-time="80"
        @click="onBuy(hotProducts[0])"
      >
        <text class="lite-btn-title"
          >热门：{{
            hotProducts[0].name || hotProducts[0].title || "去下单"
          }}</text
        >
        <text class="lite-btn-desc">点此快速下单</text>
      </view>
    </view>

    <template v-else>
      <rt-section
        title="热门团购"
        link="我的订单"
        @link="goOrders"
        class="enter"
      >
        <view class="product-list">
          <rt-skeleton v-if="loading" variant="case" :count="2" />
          <empty-state
            v-else-if="loadError && !hotProducts.length"
            icon-type="product"
            icon-tone="green"
            title="加载失败"
            action-text="点击重试"
            @action="loadProducts()"
          />
          <empty-state
            v-else-if="!hotProducts.length"
            icon-type="product"
            icon-tone="green"
            title="暂无团购商品"
            desc="稍后再来看看，或去看看品类"
            action-text="刷新"
            @action="loadProducts()"
          />
          <product-card
            v-else
            v-for="item in hotProducts"
            :key="item._id || item.id"
            :product="item"
            @add="onBuy"
          />
        </view>
      </rt-section>

      <rt-section title="品类导航">
        <view class="nav-grid">
          <view
            v-for="n in navList"
            :key="n.key"
            class="nav-item"
            hover-class="nav-active"
            :hover-stay-time="80"
            @click="goCategory(n)"
          >
            <image class="nav-photo" :src="n.img" mode="aspectFill" lazy-load />
            <view class="nav-shade" />
            <text class="nav-label">{{ n.text }}</text>
          </view>
        </view>
      </rt-section>

      <rt-section title="利润反哺法治" subtitle="团购收益投入普法与调解支持">
        <view class="fund-card enter delay-2">
          <image
            class="fund-photo"
            src="/static/lite/fund-banner.jpg"
            mode="aspectFill"
          />
          <view class="fund-overlay" />
          <view class="fund-inner">
            <view class="fund-top">
              <view>
                <text class="fund-title">法治服务基金</text>
                <text class="fund-desc">每下一单，多一分普法与调解支持</text>
              </view>
              <view class="fund-badge">{{ fundPercentText }}</view>
            </view>
            <view class="progress-track">
              <view
                class="progress-fill"
                :style="{ width: fund.percent + '%' }"
              />
            </view>
            <view class="fund-meta">
              <text>已筹 ¥{{ fundRaisedText }}</text>
              <text
                >目标 ¥{{ fundTargetText }} ·
                {{ fund.orderCount || 0 }} 单</text
              >
            </view>
          </view>
        </view>
      </rt-section>
    </template>

    <tab-bar />
  </view>
</template>

<script>
import TabBar from "@/components/tab-bar/bar.vue";
import PageHero from "@/components/page-hero/page-hero.vue";
import ProductCard from "@/components/product-card/product-card.vue";
import RtSection from "@/components/rt-section/rt-section.vue";
import RtSkeleton from "@/components/rt-skeleton/rt-skeleton.vue";
import EmptyState from "@/components/empty-state/empty-state.vue";
import { api } from "@/api/index.js";
import { ensureLoggedIn } from "@/utils/auth.js";
import { goNavigate } from "@/utils/nav.js";
import {
  GROUP_CATEGORIES,
  mergeProductList,
  PRODUCT_CATALOG,
} from "@/utils/product-catalog.js";
import { isElderMode } from "@/utils/elder-mode.js";

export default {
  components: {
    TabBar,
    PageHero,
    ProductCard,
    RtSection,
    RtSkeleton,
    EmptyState,
  },
  data() {
    return {
      elderOn: false,
      loading: true,
      loadError: false,
      buying: false,
      hotProducts: [],
      navList: GROUP_CATEGORIES,
      fund: { raised: 0, target: 50000, percent: 0, orderCount: 0 },
    };
  },
  computed: {
    fundRaisedText() {
      return Number(this.fund.raised || 0).toLocaleString();
    },
    fundTargetText() {
      return Number(this.fund.target || 50000).toLocaleString();
    },
    fundPercentText() {
      return `${this.fund.percent || 0}%`;
    },
  },
  onShow() {
    this.elderOn = isElderMode();
    if (!ensureLoggedIn()) return;
    this.loadProducts();
    this.loadFund();
  },
  onPullDownRefresh() {
    Promise.all([this.loadProducts(true), this.loadFund()]).finally(() =>
      uni.stopPullDownRefresh()
    );
  },
  methods: {
    goOrders() {
      goNavigate("/pages/group/orders");
    },
    goCategory(n) {
      goNavigate(
        `/pages/group/category?key=${encodeURIComponent(
          n.key
        )}&title=${encodeURIComponent(n.text)}`
      );
    },
    async loadFund() {
      try {
        const res = await api.getFundStats();
        this.fund = res.data || this.fund;
      } catch (e) {
        /* keep zeros */
      }
    },
    async loadProducts(isRefresh = false) {
      if (!isRefresh) this.loading = true;
      this.loadError = false;
      try {
        const res = await api.listProducts();
        const list = mergeProductList(res.data.list || []);
        this.hotProducts = list.slice(0, 4);
      } catch (e) {
        this.loadError = true;
        if (!this.hotProducts.length)
          this.hotProducts = PRODUCT_CATALOG.slice(0, 4);
        uni.showToast({ title: e.message || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    onBuy(product) {
      if (this.buying || !product) return;
      const price = product.price;
      uni.showModal({
        title: "确认下单",
        content: `「${product.name}」¥${price}\n确认下单？`,
        success: async (res) => {
          if (!res.confirm) return;
          this.buying = true;
          try {
            await api.createOrder({
              productId: product._id || product.id,
              name: product.name,
              price: product.price,
              img: product.img,
              qty: 1,
            });
            this.loadFund();
            uni.showModal({
              title: "下单成功",
              content: "利润将反哺法治服务基金。可在「我的订单」查看。",
              confirmText: "看订单",
              cancelText: "继续逛",
              success: (r) => {
                if (r.confirm) this.goOrders();
              },
            });
          } catch (e) {
            uni.showToast({ title: e.message || "下单失败", icon: "none" });
          } finally {
            this.buying = false;
          }
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
  padding: 0 $rt-page-x $rt-page-bottom;
}

.enter {
  @include rt-enter(0s);
}
.delay-2 {
  animation-delay: 0.1s;
}

.elder-lite {
  margin-bottom: 24rpx;
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
  background: linear-gradient(145deg, #fbfcf0 0%, $rt-olive-soft 100%);
  border-color: rgba(90, 107, 56, 0.18);
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

.product-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14rpx;
}

.nav-item {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: $rt-shadow-tile;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 14rpx;
}

.nav-active {
  opacity: 0.88;
}

.nav-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.nav-shade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 55%;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(15, 23, 42, 0.55) 100%
  );
}

.nav-label {
  position: relative;
  z-index: 2;
  font-size: 22rpx;
  font-weight: 700;
  color: #fff;
  text-align: center;
}

.fund-card {
  position: relative;
  border-radius: $rt-radius-md;
  overflow: hidden;
  min-height: 240rpx;
  background: #fff;
  border: 1rpx solid rgba(90, 107, 56, 0.12);
  box-shadow: $rt-shadow-sm;
}

.fund-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.fund-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  /* 左侧保可读，右侧多透出原图 */
  background: linear-gradient(
    105deg,
    rgba(255, 252, 245, 0.92) 0%,
    rgba(255, 248, 235, 0.72) 38%,
    rgba(255, 255, 255, 0.22) 72%,
    rgba(255, 255, 255, 0.08) 100%
  );
}

.fund-inner {
  position: relative;
  z-index: 2;
  padding: 28rpx;
}

.fund-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28rpx;
}

.fund-title {
  display: block;
  font-size: 32rpx;
  font-weight: 800;
  color: $rt-text;
}

.fund-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $rt-text-muted;
}

.fund-badge {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: $rt-accent;
  color: #fff;
  font-size: 24rpx;
  font-weight: 800;
}

.progress-track {
  height: 12rpx;
  border-radius: 999rpx;
  background: rgba(212, 168, 83, 0.2);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, $rt-accent, $rt-warm);
  min-width: 0;
  transition: width 0.3s ease;
}

.fund-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 16rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: $rt-text-secondary;
}

.hint {
  text-align: center;
  color: $rt-text-muted;
  padding: 40rpx 0;
  font-size: 26rpx;
}
</style>
