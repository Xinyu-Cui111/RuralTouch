<template>
  <view class="page">
    <view class="banner">
      <image class="banner-bg" :src="$cloudAssetUrl('static/banner/profit.png')" mode="widthFix" />
      <view class="banner-topbar">
        <view class="logo-area">
          <image class="logo" :src="$cloudAssetUrl('static/banner/logo.svg')" mode="aspectFit" />
          <text class="brand">智慧村务</text>
        </view>
        <view class="icon-group">
          <image class="mini-icon" :src="$cloudAssetUrl('static/icons/search.svg')" mode="aspectFit" />
          <image class="mini-icon" :src="$cloudAssetUrl('static/icons/bell.svg')" mode="aspectFit" />
          <image class="mini-icon" :src="$cloudAssetUrl('static/icons/user.svg')" mode="aspectFit" />
        </view>
      </view>
      <view class="banner-copy">
        <text class="title">村民议事厅</text>
        <text class="sub-title">民主议事聚民智，共建共享促和谐</text>
      </view>
    </view>

    <view class="section-block">
      <view class="section-header">
        <text>线上调解室</text>
      </view>
      <view class="module-box management-box section-card">
        <image class="section-bg" :src="$cloudAssetUrl('static/banner/law.jpg')" mode="aspectFill" />
        <view class="card-content">
          <view class="btn-row">
            <view class="func-btn" @click="goSubmit">
              <view class="func-inner">
                <view class="func-icon primary">+</view>
                <text class="func-title">提交纠纷</text>
                <text class="func-sub">快速提交并上传证据</text>
              </view>
            </view>
            <view class="func-btn secondary" @click="goRecord">
              <view class="func-inner">
                <view class="func-icon">↻</view>
                <text class="func-title">调解记录</text>
                <text class="func-sub">查看历史进展</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 村务管理 区块 -->
    <view class="section-block">
      <view class="section-header">
        <text>村务管理</text>
      </view>
      <view class="module-box management-box section-card">
        <image class="section-bg" :src="$cloudAssetUrl('static/banner/law.jpg')" mode="aspectFill" />
        <view class="card-content">
          <view class="list-item" @click="goPage('/pages/village/notice')">
            <view class="item-left">
              <view class="village-icon-wrap">
                <image class="village-icon-img" :src="$cloudAssetUrl('static/village-icons/laba.svg')" mode="aspectFill" />
              </view>
              <view class="entry-text">
                <text class="item-title">村务通知</text>
                <text class="item-subdesc">查看最新村务与公告</text>
              </view>
            </view>
            <image class="entry-arrow" :src="$cloudAssetUrl('static/icons/arrow-right.svg')" mode="aspectFit" />
          </view>
          <view class="list-item" @click="goPage('/pages/village/feedback')">
            <view class="item-left">
              <view class="village-icon-wrap">
                <image class="village-icon-img" :src="$cloudAssetUrl('static/village-icons/xinxi.svg')" mode="aspectFill" />
              </view>
              <view class="entry-text">
                <text class="item-title">村民反馈</text>
                <text class="item-subdesc">提交您的建议与意见</text>
              </view>
            </view>
            <image class="entry-arrow" :src="$cloudAssetUrl('static/icons/arrow-right.svg')" mode="aspectFit" />
          </view>
        </view>
      </view>
    </view>

    <!-- 近期调解中 区块 -->
    <view class="section-block recent-section">
      <view class="section-header recent-header">
        <text>近期调解中</text>
        <text class="section-more-outside">☰</text>
      </view>
      <view class="module-box management-box section-card recent-card">
        <image class="section-bg" :src="$cloudAssetUrl('static/banner/law.jpg')" mode="aspectFill" />
        <view class="card-content">
          <view class="case-item" @click="goToDisputeDetail">
            <view class="case-left">
              <view class="village-icon-wrap">
                <image class="village-icon-img" :src="$cloudAssetUrl('static/village-icons/che.svg')" mode="aspectFill" />
              </view>
              <view>
                <text class="case-name">张某与李某土地争议</text>
                <text class="case-time">提交时间：2025-10-28</text>
              </view>
            </view>
            <view class="case-status">处理中</view>
          </view>
          <view class="case-item">
            <view class="case-left">
              <view class="village-icon-wrap">
                <image class="village-icon-img" :src="$cloudAssetUrl('static/village-icons/ling.svg')" mode="aspectFill" />
              </view>
              <view>
                <text class="case-name">王某劳动纠纷</text>
                <text class="case-time">提交时间：2025-10-25</text>
              </view>
            </view>
            <view class="status-tag">处理中</view>
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
    goToDisputeDetail() {
      uni.navigateTo({ url: '/pages/disputeDetail/disputeDetail' })
    },
    goSubmit() {
      uni.showToast({ title: '跳转提交纠纷', icon: 'none' })
    },
    goRecord() {
      uni.showToast({ title: '跳转调解记录', icon: 'none' })
    },
    goPage(path) {
      if (!path) return
      uni.navigateTo({ url: path })
    }
  }
}
</script>

<style lang="scss" scoped>
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
.logo { width: 92rpx; height: 92rpx; border-radius: 50%; overflow: hidden; background: rgba(255,255,255,0.6); backdrop-filter: blur(4px); display:block; }
.brand { font-size: 30rpx; font-weight: 600; color: #173128; }
.icon-group { display:flex; gap:22rpx; align-items:center; }
.mini-icon { width:54rpx; height:54rpx; }

.banner-copy { position: absolute; left: 10vw; top: 178rpx; z-index: 2; max-width: 70%; }
.title { display:block; font-size: 56rpx; font-weight: 700; line-height: 1.02; color: #0f1720; }
.sub-title { display:block; margin-top: 10rpx; font-size: 28rpx; font-weight:500; color:#4b5f45; white-space:nowrap; }
.section-block { margin-top: 24rpx; }
.module-box { margin: 0; background: transparent; border-radius: 20rpx; padding: 0; }
.management-box { }
.module-title { display: flex; justify-content: space-between; align-items: center; font-size: 34rpx; font-weight: 700; color: #111827; margin-bottom: 22rpx; }
.btn-row { display: flex; gap: 22rpx; }
.btn-circle { width: 80rpx; height: 80rpx; border-radius: 50%; background: #2168d8; color: #fff; font-size: 40rpx; display: flex; align-items: center; justify-content: center; margin-bottom: 15rpx; }
.list-item { display: flex; justify-content: space-between; align-items: center; padding: 25rpx 0; border-bottom: 1rpx solid #eee; }
.item-left { display: flex; align-items: center; gap: 20rpx; }
.village-icon-wrap { width: 96rpx; height: 96rpx; border-radius: 18rpx; overflow: hidden; background: #ffffff; flex: 0 0 auto; box-shadow: 0 6rpx 20rpx rgba(16,24,40,0.06); }
.village-icon-img { width: 100%; height: 100%; display: block; object-fit: cover; }
.case-left { display: flex; align-items: center; gap: 20rpx; flex: 1; min-width: 0; }
.case-item { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid #eee; }
.status-tag { background: #f2e0c9; color: #a06b38; padding: 8rpx 16rpx; border-radius: 10rpx; font-size: 24rpx; }

  .case-name { display: block; font-size: 28rpx; font-weight: 700; color: #111827; }
  .case-time { display: block; font-size: 24rpx; color: #8f9688; margin-top: 6rpx; }

/* 管理模块内的入口样式 */
.management-box .entry-text { display: flex; flex-direction: column; }
.management-box .item-title { font-size: 36rpx; font-weight: 700; color: #2b3a23; }
.management-box .item-desc { font-size: 28rpx; color: #9a9a9a; font-weight: 400; margin-top: 6rpx; display: block; }
.management-box .arrow { font-size: 40rpx; color: #c8c8c8; }
.management-box .arrow { display: flex; align-items: center; }
.list-item .arrow { display: flex; align-items: center; }
.entry-arrow { width: 36rpx; height: 36rpx; }

/* 新的 func-btn / iOS 风格入口 */
.func-btn { flex: 1; display: flex; align-items: center; justify-content: center; padding: 12rpx; border-radius: 12rpx; background: transparent; border: none; box-shadow: none; }
.func-btn.secondary { background: transparent; }
.func-icon { width: 84rpx; height: 84rpx; border-radius: 16rpx; background: #2168d8; color: #fff; font-size: 44rpx; display: flex; align-items: center; justify-content: center; box-shadow: 0 10rpx 26rpx rgba(33,104,216,0.14); }
.func-btn.secondary .func-icon { background: #eef4ff; color: #2168d8; box-shadow: none; }
  .func-inner { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8rpx; }
  .func-title { font-size: 28rpx; font-weight: 700; color: #111827; margin-top: 6rpx; }
  .func-sub { font-size: 24rpx; color: #8a8a8a; margin-top: 4rpx; }
  .btn-text { font-size: 28rpx; color: #2b3a23; margin-top: 6rpx; }
.item-subdesc { display: block; font-size: 24rpx; color: #b5b5b5; font-weight: 400; margin-top: 4rpx; }

/* 模块下方的合并说明行 */
  .module-subtitle { margin-top: 8rpx; margin-bottom: 16rpx; }
.section-card { 
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 28rpx; 
  padding: 30rpx; 
  border: 1rpx solid rgba(255, 255, 255, 0.92);
  box-shadow:
    0 22rpx 44rpx rgba(15, 23, 42, 0.08),
    0 6rpx 14rpx rgba(15, 23, 42, 0.05);
}

.card-wrap { position: relative; }
.section-more-outside { position: absolute; right: 18rpx; top: -22rpx; z-index: 3; background: rgba(255,255,255,0.92); padding: 10rpx 12rpx; border-radius: 16rpx; box-shadow: 0 8rpx 18rpx rgba(16,24,40,0.08); font-size: 34rpx; color: #475b4a; }

.section-bg { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 1; z-index: 0; }

.card-content { position: relative; z-index: 1; background: transparent; }

.section-header { display: flex; align-items: center; justify-content: space-between; margin: 6rpx 24rpx; font-size: 34rpx; font-weight: 700; color: #2c4a30; }
.section-header > text:first-child { flex: 1; text-align: left; }
.section-header::before {
  content: '';
  width: 6rpx;
  height: 22rpx;
  margin-right: 12rpx;
  background: #2c4a30;
  border-radius: 999rpx;
  flex-shrink: 0;
}
.section-block:first-of-type { margin-top: 24rpx; }
.recent-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12rpx; }
.recent-header .section-more-outside { position: static; background: rgba(255,255,255,0.92); padding: 10rpx 14rpx; border-radius: 16rpx; box-shadow: 0 8rpx 18rpx rgba(16,24,40,0.08); font-size: 34rpx; color: #475b4a; }
.recent-card { margin-top: 0; }
  .module-subtitle .sub-line { display:block; font-size: 24rpx; color: #9a9a9a; font-weight: 400; line-height: 1.2; }
</style>