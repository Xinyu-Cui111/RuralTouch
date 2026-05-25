<template>
  <view class="page">
    <view class="banner">
      <image class="banner-bg" src="/static/banner/profit.png" mode="widthFix" />
      <view class="banner-topbar">
        <view class="logo-area">
          <image class="logo" src="/static/banner/logo.svg" mode="aspectFit" />
          <text class="brand">智慧村务</text>
        </view>
        <view class="icon-group">
          <image class="mini-icon" src="/static/icons/search.svg" mode="aspectFit" />
          <image class="mini-icon" src="/static/icons/bell.svg" mode="aspectFit" />
          <image class="mini-icon" src="/static/icons/user.svg" mode="aspectFit" />
        </view>
      </view>
      <view class="banner-copy">
        <text class="title">道德银行</text>
        <text class="sub-title">积分记录善行，激励共建美好乡村</text>
      </view>
    </view>

    <view class="score-header">
      <text class="score-header-title">我的积分</text>
    </view>

    <view class="score-box">
      <view class="score-top">
        <view class="score-num">1,250</view>
        <view class="score-tip">当前可用积分</view>
      </view>

      <view class="score-bottom">
        <view class="score-btn-row">
          <view class="score-btn" @click="onDeclare">
            <image class="btn-icon-img" src="/static/moral-icons/cun.svg" mode="aspectFill" />
            <text class="btn-text">积分申报</text>
          </view>
          <view class="line"></view>
          <view class="score-btn" @click="onMall">
            <image class="btn-icon-img" src="/static/moral-icons/fangzi.svg" mode="aspectFill" />
            <text class="btn-text">积分商城</text>
          </view>
        </view>
      </view>
    </view>

    <view class="record-header">
      <text class="record-header-title">积分获取记录</text>
    </view>

    <view class="record-box">
      <image class="section-bg" src="/static/banner/law.jpg" mode="aspectFill" />
      <view class="card-content">
      <view class="record-item">
        <view class="record-left">
          <image class="record-icon-img" src="/static/moral-icons/chuizi.svg" mode="aspectFill" />
          <view class="record-text">
            <text class="record-name">普法活动</text>
            <text class="record-time">2025-10-20</text>
          </view>
        </view>
        <text class="record-add">+50分</text>
      </view>

      <view class="record-item">
        <view class="record-left">
          <image class="record-icon-img" src="/static/moral-icons/woshou.svg" mode="aspectFill" />
          <view class="record-text">
            <text class="record-name">纠纷调解成功</text>
            <text class="record-time">2025-10-18</text>
          </view>
        </view>
        <text class="record-add">+100分</text>
      </view>

      <view class="record-item">
        <view class="record-left">
          <image class="record-icon-img" src="/static/moral-icons/sanjiao.svg" mode="aspectFill" />
          <view class="record-text">
            <text class="record-name">团购推广成功</text>
            <text class="record-time">2025-10-15</text>
          </view>
        </view>
        <text class="record-add">+30分</text>
      </view>
      </view>
    </view>

    <view class="record-header goods-header">
      <text class="record-header-title">可兑换商品</text>
    </view>

    <view class="record-box goods-box">
      <image class="section-bg" src="/static/banner/law.jpg" mode="aspectFill" />
      <view class="card-content">
      <view class="goods-list">
        <view class="goods-item">
          <image class="goods-icon-img" src="/static/moral-icons/shui.svg" mode="aspectFill" />
          <view class="goods-text">
            <text class="goods-name">洗衣液</text>
            <text class="goods-time record-add">100分</text>
          </view>
        </view>

        <view class="goods-item">
          <image class="goods-icon-img" src="/static/moral-icons/mi.svg" mode="aspectFill" />
          <view class="goods-text">
            <text class="goods-name">大米</text>
            <text class="goods-time record-add">200分</text>
          </view>
        </view>

        <view class="goods-item">
          <image class="goods-icon-img" src="/static/moral-icons/miao.svg" mode="aspectFill" />
          <view class="goods-text">
            <text class="goods-name">茶叶</text>
            <text class="goods-time record-add">500分</text>
          </view>
        </view>

        <view class="goods-item">
          <image class="goods-icon-img" src="/static/moral-icons/banshou.svg" mode="aspectFill" />
          <view class="goods-text">
            <text class="goods-name">农具套装</text>
            <text class="goods-time record-add">800分</text>
          </view>
        </view>
      </view>
      </view>
    </view>

    <tab-bar />
  </view>
</template>

<script>
import TabBar from '@/components/tab-bar/bar.vue'

export default {
  components: { TabBar },
  data() {
    return {}
  },
  methods: {
    onDeclare() {
      uni.navigateTo({ url: '/pages/moral/declare' })
    },
    onMall() {
      uni.navigateTo({ url: '/pages/moral/mall' })
    }
  }
}
</script>

<style lang="scss" scoped>
/* Page base */
.page { padding: 0 24rpx 220rpx; box-sizing: border-box; background-color: #fcfcf0; min-height: 100vh; }

/* Banner (copied from pages/group for consistent notch layout) */
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

.logo-area { display: flex; align-items: center; gap: 22rpx; }
.logo { width: 104rpx; height: 104rpx; border-radius: 50%; overflow: hidden; background: rgba(255,255,255,0.55); backdrop-filter: blur(2px); display:block; }
.brand { font-size: 32rpx; font-weight: 500; color: #2b3a23; }
.icon-group { display:flex; gap:22rpx; align-items:center; }
.mini-icon { width:54rpx; height:54rpx; }

.banner-copy { position: absolute; left: 10vw; top: 176rpx; z-index: 2; max-width: 70%; }
.title { display:block; font-size: 64rpx; font-weight: 600; line-height: 1.0; color: #2b3a23; }
.sub-title { display:block; margin-top: 10rpx; font-size: 28rpx; font-weight:500; color:#4a5f3e; white-space:nowrap; }

.score-header { padding: 0 6rpx; }
.score-header-title { display: flex; align-items: center; font-size: 34rpx; font-weight: 700; color: #2c4a30; margin: 18rpx 0 6rpx; }
.score-header-title::before {
  content: '';
  width: 6rpx;
  height: 22rpx;
  margin-right: 12rpx;
  background: #2c4a30;
  border-radius: 999rpx;
  flex-shrink: 0;
}

  .score-box { margin: 0 0 24rpx; background:
  linear-gradient(135deg, #ffffff 0%, #fffef9 16%, #fff4d7 42%, #f4e3b0 64%, #fffdf5 100%);
  border-radius: 28rpx; padding: 20rpx; text-align: center; border: 1rpx solid rgba(255, 255, 255, 0.98); box-shadow:
  0 22rpx 44rpx rgba(15, 23, 42, 0.08),
  0 6rpx 14rpx rgba(15, 23, 42, 0.05); display:flex; flex-direction:column; justify-content:space-between; height:360rpx; overflow: hidden; }
.score-top { display:flex; flex-direction:column; align-items:center; justify-content:flex-start; margin-top:6rpx; }
.score-num { font-size: 84rpx; font-weight: 800; color: #c48b38; margin: 6rpx 0 6rpx; }
.score-tip { font-size: 28rpx; color: #9a8a6a; margin-bottom: 6rpx; }

.score-bottom { display:flex; align-items:flex-end; justify-content:center; }
.score-btn-row { display: flex; align-items: center; gap: 18rpx; width: 100%; max-width: 680rpx; justify-content: center; }
.score-btn { width: 44%; display: flex; align-items: center; justify-content: center; gap: 14rpx; padding: 8rpx 12rpx; background: transparent; border-radius: 14rpx; }
.btn-icon-img { width: 96rpx; height: 96rpx; display: block; border-radius: 18rpx; overflow: hidden; object-fit: cover; background: #ffffff; box-shadow: 0 6rpx 20rpx rgba(16,24,40,0.06); }
.btn-text { font-size: 36rpx; color: #2b3a23; font-weight: 800; }
.line { width: 1rpx; height: 160rpx; background: #eee; border-radius: 1rpx; }
  .record-box, .goods-box { margin: 0; position: relative; overflow: hidden; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); border-radius: 28rpx; padding: 30rpx; border: 1rpx solid rgba(255, 255, 255, 0.92); box-shadow:
  0 22rpx 44rpx rgba(15, 23, 42, 0.08),
  0 6rpx 14rpx rgba(15, 23, 42, 0.05); }

  .record-header { padding: 0 6rpx; margin: 24rpx 0 12rpx; display:flex; justify-content:flex-start; align-items:center; }
  .record-header-title { display: flex; align-items: center; font-size: 34rpx; font-weight: 700; color: #2c4a30; margin: 0; }
  .record-header-title::before {
    content: '';
    width: 6rpx;
    height: 22rpx;
    margin-right: 12rpx;
    background: #2c4a30;
    border-radius: 999rpx;
    flex-shrink: 0;
  }
.record-item { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid #eee; }
.record-item:last-child { border-bottom: none; }
.record-left { display:flex; align-items:center; gap: 20rpx; flex: 1; min-width: 0; }
.record-text { display:flex; flex-direction:column; justify-content:center; min-width: 0; }
.record-name { display:block; font-size: 30rpx; font-weight: 700; color: #111827; line-height: 1.2; }
.record-time { display:block; margin-top: 8rpx; font-size: 24rpx; color: #8f9688; line-height: 1.2; }
.record-icon-img { width: 96rpx; height: 96rpx; display: block; border-radius: 18rpx; overflow: hidden; background: #ffffff; box-shadow: 0 6rpx 20rpx rgba(16,24,40,0.06); object-fit: cover; }
.record-add { font-size: 34rpx; color: #c48b38; font-weight: 800; flex-shrink: 0; }
.goods-header { margin-top: 24rpx; margin-bottom: 12rpx; }
.goods-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20rpx 18rpx; }
.goods-item { display: flex; align-items: center; gap: 18rpx; padding: 18rpx 6rpx; box-sizing: border-box; min-width: 0; }
.goods-icon-img { width: 96rpx; height: 96rpx; display: block; border-radius: 18rpx; overflow: hidden; background: #ffffff; box-shadow: 0 6rpx 20rpx rgba(16,24,40,0.06); object-fit: cover; flex-shrink: 0; }
.goods-text { display: flex; flex-direction: column; justify-content: center; min-width: 0; }
.goods-name { display:block; font-size: 30rpx; font-weight: 700; color: #111827; line-height: 1.2; }
.goods-time { display:block; margin-top: 8rpx; line-height: 1.2; }
.section-bg { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 1; z-index: 0; }
.card-content { position: relative; z-index: 1; background: transparent; }
</style>