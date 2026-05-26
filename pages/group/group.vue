<template>
  <view class="container">
    <view class="banner">
      <image
        class="banner-bg"
        :src="$cloudAssetUrl('static/banner/profit.png')"
        mode="widthFix"
      />
      <view class="banner-topbar">
        <view class="logo-area">
          <image
            class="logo"
            :src="$cloudAssetUrl('static/banner/logo.svg')"
            mode="aspectFit"
          />
          <text class="brand">智慧村务</text>
        </view>
        <view class="icon-group">
          <image
            class="mini-icon"
            :src="$cloudAssetUrl('static/icons/search.svg')"
            mode="aspectFit"
          />
          <image
            class="mini-icon"
            :src="$cloudAssetUrl('static/icons/bell.svg')"
            mode="aspectFit"
          />
          <image
            class="mini-icon"
            :src="$cloudAssetUrl('static/icons/user.svg')"
            mode="aspectFit"
          />
        </view>
      </view>
      <view class="banner-copy">
        <text class="title">惠民团购</text>
        <text class="sub-title">品质团购，惠及村民，利润反哺法治建设</text>
      </view>
    </view>

    <view class="section-head">
      <view class="sec-header">
        <text class="sec-title">热门团购</text>
        <view class="more">
          <text class="more-text">查看更多</text>
          <image
            class="more-icon"
            :src="$cloudAssetUrl('static/icons/arrow-right.svg')"
            mode="aspectFit"
          />
        </view>
      </view>
    </view>
    <view class="grid">
      <product-card
        v-for="item in hotProducts"
        :key="item.id"
        :product="item"
      />
    </view>

    <view class="section-head">
      <view class="sec-header">
        <text class="sec-title">品类导航</text>
      </view>
    </view>
    <view class="nav-section">
      <view class="nav-grid">
        <view class="nav-item" v-for="n in navList" :key="n.text">
          <image
            class="nav-bg"
            :src="$cloudAssetUrl(n.icon)"
            mode="aspectFill"
          />
          <view class="nav-shade"></view>
          <text class="nav-text">{{ n.text }}</text>
        </view>
      </view>
    </view>

    <view class="profit-card">
      <image
        class="profit-bg"
        :src="$cloudAssetUrl('static/banner/banner.png')"
        mode="aspectFill"
      />
      <view class="overlay"></view>
      <view class="card-content">
        <view class="profit-text">
          <text class="card-title">利润反哺</text>
          <text class="card-desc">团购利润30%投入法治服务基金</text>
          <view class="progress-box">
            <progress
              :percent="50"
              active-color="#5a8d46"
              background-color="#e8ede5"
              stroke-width="12"
              border-radius="6"
            />
          </view>
          <view class="info">
            <text>已筹集：¥25,160</text>
            <text>目标：¥50,000</text>
          </view>
        </view>
      </view>
    </view>

    <tab-bar />
  </view>
</template>

<script>
import ProductCard from "@/components/product-card/product-card.vue";
import TabBar from "@/components/tab-bar/bar.vue";

export default {
  components: { ProductCard, TabBar },
  data() {
    return {
      hotProducts: [
        {
          id: 1,
          name: "黑豆粉 500g",
          desc: "低温烘焙细磨，豆香浓郁，早餐冲饮更方便",
          price: "32.8",
          img: "static/products/heidoufen.jpg",
        },
        {
          id: 2,
          name: "花糕粉 1kg",
          desc: "传统配方复配粉，做蒸糕松软细腻，口感香甜",
          price: "26.9",
          img: "static/products/huagaofen.jpg",
        },
        {
          id: 3,
          name: "桑葚鲜果 2斤装",
          desc: "现摘现发，酸甜多汁，适合鲜食与自制果饮",
          price: "39.9",
          img: "static/products/sangshen.jpg",
        },
        {
          id: 4,
          name: "三文鱼切片 300g",
          desc: "冷链直达，纹理细嫩，煎烤刺身都很合适",
          price: "59.0",
          img: "static/products/sanwenyu.jpg",
        },
      ],
      navList: [
        { icon: "static/group-icons/nongzinongju.jpg", text: "农资农具" },
        { icon: "static/group-icons/nongchanpin.jpg", text: "农产品" },
        { icon: "static/group-icons/shenghuoyongpin.jpg", text: "生活用品" },
        { icon: "static/group-icons/fuzhuangxiemao.jpg", text: "服装鞋帽" },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: 0 24rpx 260rpx;
  box-sizing: border-box;
  background: #fcfcf0;
}

.banner {
  height: 360rpx;
  margin: 0 -24rpx 0;
  position: relative;
  overflow: hidden;
}

.banner-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 0;
}

.banner-topbar {
  position: absolute;
  left: 0;
  right: 0;
  top: 44rpx;
  z-index: 2;
  height: 88rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 28rpx 0 24rpx;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 22rpx;
}

.logo {
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(2px);
  display: block;
}

.brand {
  font-size: 32rpx;
  font-weight: 500;
  color: #2b3a23;
}

.icon-group {
  display: flex;
  gap: 22rpx;
  align-items: center;
}

.mini-icon {
  width: 54rpx;
  height: 54rpx;
}

.banner-copy {
  position: absolute;
  left: 10vw;
  top: 176rpx;
  z-index: 2;
  max-width: 70%;
}

.title {
  display: block;
  font-size: 64rpx;
  font-weight: 600;
  line-height: 1;
  color: #2b3a23;
}
.sub-title {
  display: block;
  margin-top: 10rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #4a5f3e;
  white-space: nowrap;
}
// 统一卡片样式，增加更柔和的阴影
.section,
.nav-section,
.profit-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 30rpx;
  margin-top: 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 22rpx 44rpx rgba(15, 23, 42, 0.08),
    0 6rpx 14rpx rgba(15, 23, 42, 0.05);
}

.section-head {
  margin: 24rpx 24rpx 16rpx;
}

.nav-section {
  padding: 0;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  margin-top: 0;
}

// Banner 区域：背景图引用
.banner {
  height: 360rpx;
  margin: -24rpx -24rpx 0;
  padding: 72rpx 32rpx 28rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  border-radius: 0 0 36rpx 36rpx;
}

.title-wrap {
  position: relative;
  z-index: 1;
}

.banner-bg {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: auto;
  z-index: 0;
  border-radius: 0 0 36rpx 36rpx;
  pointer-events: none;
}

.banner-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 22%;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(252, 252, 249, 0) 0%,
    rgba(252, 252, 249, 0.55) 45%,
    rgba(252, 252, 249, 1) 100%
  );
  pointer-events: none;
}

.title-wrap {
  position: relative;
  z-index: 2;
}

.title {
  display: block;
  font-size: 64rpx;
  font-weight: 600;
  line-height: 1;
  color: #2b3a23;
}
.sub-title {
  display: block;
  margin-top: 10rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #4a5f3e;
  white-space: nowrap;
}

// 热门团购改为单列，保证每张卡片完整显示
.grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 20rpx;
  width: calc(100% - 18rpx);
  margin-left: auto;
  margin-right: auto;
}

.sec-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}
.sec-title {
  display: flex;
  align-items: center;
  font-size: 34rpx;
  font-weight: 700;
  color: #2c4a30;
  flex: 0 0 auto;
}
.sec-title::before {
  content: "";
  width: 6rpx;
  height: 22rpx;
  margin-right: 12rpx;
  background: #2c4a30;
  border-radius: 999rpx;
  flex-shrink: 0;
}
.more {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-left: auto;
}
.more-text {
  font-size: 24rpx;
  color: #889988;
}
.more-icon {
  width: 24rpx;
  height: 24rpx;
  flex-shrink: 0;
}

.nav-section {
  padding: 0;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  margin-top: 0;
  overflow: hidden;
  width: calc(100% - 18rpx);
  margin-left: auto;
  margin-right: auto;
}

/* 利润反哺卡片：背景图 + 遮罩 */
.profit-card {
  position: relative;
  min-height: 220rpx;
  display: flex;
  align-items: center;
  overflow: hidden;
  width: calc(100% - 18rpx);
  margin-left: auto;
  margin-right: auto;
}
.profit-card .profit-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
.profit-card .overlay {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 68%;
  background-image: linear-gradient(
    90deg,
    rgba(255, 248, 225, 0.96) 0%,
    rgba(255, 242, 204, 0.88) 45%,
    rgba(255, 235, 175, 0.34) 78%,
    rgba(255, 230, 150, 0) 100%
  );
  border-radius: 28rpx;
  z-index: 1;
}
.profit-card .card-content {
  position: relative;
  z-index: 2;
  width: 58%;
  text-align: left;
  padding: 30rpx 18rpx 0 30rpx;
}
.profit-card .profit-text {
  width: 100%;
  text-align: left;
}

/* 品类导航：一排四个小正方形 */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10rpx;
  padding: 14rpx 0;
  width: 100%;
  box-sizing: border-box;
}
.nav-item {
  position: relative;
  width: 100%;
  min-width: 0;
  aspect-ratio: 1 / 1;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
  overflow: hidden;
  box-sizing: border-box;
}
.nav-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.nav-shade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 44%;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(15, 23, 42, 0.18) 100%
  );
}
.nav-text {
  position: absolute;
  left: 12rpx;
  right: 12rpx;
  bottom: 12rpx;
  z-index: 2;
  font-size: 24rpx;
  font-weight: 700;
  color: #000000;
  text-align: center;
  line-height: 1.1;
  white-space: nowrap;
  text-shadow: none;
}
.card-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2b3a23;
}
.card-desc {
  display: block;
  font-size: 22rpx;
  color: #889988;
  margin: 8rpx 0 20rpx;
}

.info {
  margin-top: 16rpx;
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #5f6e5a;
  font-weight: 500;
}
</style>
