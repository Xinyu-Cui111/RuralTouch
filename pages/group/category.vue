<template>
  <view class="page">
    <rt-nav-bar :title="title || '分类商品'" />

    <view v-if="loading" class="hint">加载中...</view>
    <empty-state
      v-else-if="!list.length"
      icon-type="product"
      icon-tone="green"
      title="暂无商品"
      desc="该分类下还没有商品"
      action-text="返回团购"
      @action="goBack"
    />
    <view v-else class="product-list">
      <product-card
        v-for="item in list"
        :key="item._id || item.id"
        :product="item"
        @add="onBuy"
      />
    </view>
  </view>
</template>

<script>
import EmptyState from "@/components/empty-state/empty-state.vue";
import ProductCard from "@/components/product-card/product-card.vue";
import { api } from "@/api/index.js";
import { ensureLoggedIn } from "@/utils/auth.js";
import { goReLaunch } from "@/utils/nav.js";
import {
  filterByCategory,
  mergeProductList,
  PRODUCT_CATALOG,
} from "@/utils/product-catalog.js";

export default {
  components: { EmptyState, ProductCard },
  data() {
    return {
      loading: true,
      buying: false,
      title: "",
      category: "",
      list: [],
    };
  },
  onLoad(query) {
    this.category = decodeURIComponent((query && query.key) || "");
    this.title = decodeURIComponent(
      (query && query.title) || this.category || "分类商品"
    );
  },
  onShow() {
    if (!ensureLoggedIn()) return;
    this.load();
  },
  methods: {
    goBack() {
      goReLaunch("/pages/group/group");
    },
    async load() {
      this.loading = true;
      try {
        const res = await api.listProducts();
        const all = mergeProductList(res.data.list || []);
        this.list = filterByCategory(all, this.category);
      } catch (e) {
        this.list = filterByCategory(PRODUCT_CATALOG, this.category);
      } finally {
        this.loading = false;
      }
    },
    onBuy(product) {
      if (this.buying || !product) return;
      uni.showModal({
        title: "确认下单",
        content: `「${product.name}」¥${product.price}\n确认下单？`,
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
            uni.showToast({ title: "下单成功", icon: "success" });
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
  padding: $rt-page-x;
  padding-bottom: 48rpx;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.hint {
  text-align: center;
  color: $rt-text-muted;
  padding: 40rpx 0;
  font-size: 26rpx;
}
</style>
