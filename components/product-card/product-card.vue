<template>
  <view
    class="product-card"
    hover-class="press"
    :hover-stay-time="80"
    @click="$emit('click', product)"
  >
    <view class="card-stripe" />
    <view class="media">
      <image
        v-if="imgSrc"
        class="img"
        :src="imgSrc"
        mode="aspectFill"
        lazy-load
      />
      <view v-else class="img placeholder">
        <rt-icon name="product" tone="neutral" size="sm" />
      </view>
    </view>
    <view class="body">
      <text class="name">{{ product.name }}</text>
      <text class="desc">{{ product.desc }}</text>
      <view class="footer">
        <view class="price-wrap">
          <text class="currency">¥</text>
          <text class="price">{{ product.price }}</text>
        </view>
        <view
          class="cart-btn"
          hover-class="press"
          :hover-stay-time="80"
          @click.stop="$emit('add', product)"
        >
          <text class="buy-text">下单</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import RtIcon from "@/components/rt-icon/rt-icon.vue";

/** 兼容云库旧路径 /static/products → /static/lite/products */
function normalizeImg(src) {
  if (!src || typeof src !== "string") return "";
  return src.replace(/^\/static\/products\//, "/static/lite/products/");
}

export default {
  components: { RtIcon },
  props: {
    product: { type: Object, required: true },
  },
  computed: {
    imgSrc() {
      return normalizeImg(this.product && this.product.img);
    },
  },
  emits: ["click", "add"],
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.product-card {
  position: relative;
  overflow: hidden;
  display: flex;
  gap: 24rpx;
  padding: 24rpx 24rpx 24rpx 28rpx;
  border-radius: $rt-radius-md;
  background: #fff;
  border: 1rpx solid rgba(50, 40, 30, 0.06);
  box-shadow: $rt-shadow-sm;
}

.press {
  opacity: 0.94;
}

.card-stripe {
  position: absolute;
  left: 0;
  top: 20rpx;
  bottom: 20rpx;
  width: 6rpx;
  border-radius: 0 6rpx 6rpx 0;
  background: linear-gradient(180deg, $rt-primary-mid, $rt-primary);
}

.media {
  width: 168rpx;
  height: 168rpx;
  flex-shrink: 0;
  border-radius: $rt-radius-sm;
  overflow: hidden;
  background: $rt-bg;
}

.img {
  width: 100%;
  height: 100%;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4rpx 0;
}

.name {
  font-size: $rt-type-body;
  font-weight: 700;
  color: $rt-text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.desc {
  margin-top: 8rpx;
  font-size: $rt-type-caption;
  line-height: 1.5;
  color: $rt-text-muted;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  flex: 1;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}

.price-wrap {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
}

.currency {
  font-size: 24rpx;
  font-weight: 700;
  color: $rt-primary-mid;
}

.price {
  font-size: 36rpx;
  font-weight: 800;
  color: $rt-primary-mid;
  line-height: 1;
}

.cart-btn {
  min-width: 96rpx;
  height: 56rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: linear-gradient(145deg, $rt-primary, $rt-primary-mid);
  display: flex;
  align-items: center;
  justify-content: center;
}

.buy-text {
  font-size: 24rpx;
  font-weight: 800;
  color: #fff;
}
</style>
