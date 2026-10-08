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
        @contact="onContact"
        @order="onOrder"
      />
      <text class="browse-tip">{{ browseTip }}</text>
    </view>
  </view>
</template>

<script>
import EmptyState from "@/components/empty-state/empty-state.vue";
import ProductCard from "@/components/product-card/product-card.vue";
import { api } from "@/api/index.js";
import { goNavigate, goReLaunch } from "@/utils/nav.js";
import { ensureLoggedIn } from "@/utils/auth.js";
import {
  filterByCategory,
  mergeProductList,
  PRODUCT_CATALOG,
} from "@/utils/product-catalog.js";
import { VILLAGE_CONTACT_PHONE } from "@/config/env.js";
import { FEATURE_GROUP_ORDER } from "@/config/features.js";

export default {
  components: { EmptyState, ProductCard },
  data() {
    return {
      loading: true,
      ordering: false,
      title: "",
      category: "",
      list: [],
    };
  },
  computed: {
    browseTip() {
      return FEATURE_GROUP_ORDER
        ? "App 可预约登记意向（无在线支付）。正式下单下一批落地；也可联系村委。"
        : "仅展示参考价，意向请联系村委。";
    },
  },
  onLoad(query) {
    this.category = decodeURIComponent((query && query.key) || "");
    this.title = decodeURIComponent(
      (query && query.title) || this.category || "分类商品"
    );
  },
  onShow() {
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
    onContact() {
      const phone = String(VILLAGE_CONTACT_PHONE || "").replace(/\D/g, "");
      if (!phone) {
        uni.showToast({ title: "暂未配置村委电话", icon: "none" });
        return;
      }
      uni.showModal({
        title: "咨询村委",
        content: "不提供在线交易。是否拨打村委电话？",
        confirmText: "拨打",
        success: (res) => {
          if (res.confirm) uni.makePhoneCall({ phoneNumber: phone });
        },
      });
    },
    onOrder(product) {
      if (this.ordering || !product) return;
      if (!ensureLoggedIn({ tip: "预约登记请先登录" })) return;
      uni.showModal({
        title: "确认预约",
        content: `「${product.name}」参考价 ¥${product.price}\n登记后村委联系您，无线上支付。`,
        confirmText: "登记",
        success: async (res) => {
          if (!res.confirm) return;
          this.ordering = true;
          try {
            await api.createOrder({
              client: "app",
              productId: product._id || product.id,
              name: product.name,
              price: product.price,
              img: product.img,
              qty: 1,
            });
            uni.showModal({
              title: "预约已登记",
              content: "可在「我的预约」查看。",
              confirmText: "看预约",
              cancelText: "继续逛",
              success: (r) => {
                if (r.confirm) goNavigate("/pages/group/orders");
              },
            });
          } catch (e) {
            uni.showToast({ title: e.message || "登记失败", icon: "none" });
          } finally {
            this.ordering = false;
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
.hint {
  padding: 48rpx;
  text-align: center;
  color: $rt-text-muted;
}
.product-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.browse-tip {
  display: block;
  margin-top: 8rpx;
  font-size: $rt-type-micro;
  color: $rt-text-muted;
  line-height: 1.5;
}
</style>
