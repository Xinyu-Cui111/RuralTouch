<template>
  <view class="product-card" @click="handleItemClick">
    <view class="media-wrap">
      <image
        v-if="product.img"
        class="product-img"
        :src="$cloudAssetUrl(product.img)"
        mode="aspectFill"
      ></image>
      <view v-else class="product-img placeholder">
        <text class="placeholder-text">暂无图片</text>
      </view>
    </view>

    <view class="info-wrap">
      <text class="name">{{ product.name }}</text>
      <text class="desc">{{ product.desc }}</text>

      <view class="footer">
        <text class="price">¥{{ product.price }}</text>
        <view class="cart-btn" @click.stop="handleAddToCart">
          <text class="plus-icon">+</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    // 传入商品对象，包含 img, name, desc, price 等字段
    product: {
      type: Object,
      required: true,
    },
  },
  methods: {
    handleItemClick() {
      this.$emit("click", this.product);
    },
    handleAddToCart() {
      // 阻止事件冒泡
      uni.showToast({ title: "已加入购物车", icon: "none" });
      this.$emit("add", this.product);
    },
  },
};
</script>

<style lang="scss" scoped>
/* 引用我们刚刚配置的 uni.scss 变量 */
.product-card {
  width: calc(100% - 24rpx);
  height: 204rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 28rpx;
  overflow: hidden;
  margin: 0 auto;
  border: 1rpx solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 22rpx 44rpx rgba(15, 23, 42, 0.08),
    0 6rpx 14rpx rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: row;
  align-items: stretch;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  .media-wrap {
    width: 172rpx;
    height: 100%;
    flex-shrink: 0;
    margin: 0;
    border-radius: 28rpx 0 0 28rpx;
    overflow: hidden;
    background: linear-gradient(160deg, #eef2f7 0%, #e2e8f0 100%);
  }

  .product-img {
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
  }

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(160deg, #e7edf5 0%, #dbe4ef 100%);
  }

  .placeholder-text {
    color: #64748b;
    font-size: 22rpx;
  }

  .info-wrap {
    flex: 1;
    padding: 14rpx 12rpx 12rpx 14rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;

    .name {
      font-size: 28rpx;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8rpx;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .desc {
      font-size: 18rpx;
      line-height: 1.5;
      color: #475569;
      margin-bottom: 12rpx;
      display: block;
      min-height: 62rpx;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .price {
        font-size: 28rpx;
        color: #0b7a3e;
        font-weight: 700;
      }

      .cart-btn {
        width: 50rpx;
        height: 50rpx;
        flex-shrink: 0;
        background: linear-gradient(180deg, #3aa45d 0%, #208a49 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        box-shadow: 0 6rpx 14rpx rgba(32, 138, 73, 0.34);

        .plus-icon {
          font-size: 30rpx;
          line-height: 1;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
