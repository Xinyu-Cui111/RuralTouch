<template>
  <view class="page-container">
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
        <text class="title">法治服务与宣传</text>
        <text class="sub-title">普及法律知识，共建和谐乡村</text>
      </view>
    </view>

    <view class="section-block">
      <view class="sec-header">法治知识库</view>
      <view class="section-card">
        <image
          class="section-bg"
          :src="$cloudAssetUrl('static/banner/law.jpg')"
          mode="aspectFill"
        />
        <view class="card-content">
          <view class="nav-grid">
            <view class="grid-item">
              <image
                class="grid-icon"
                :src="$cloudAssetUrl('static/law-icons/rules.svg')"
                mode="aspectFill"
              />
              <text class="grid-text">法律条文</text>
            </view>
            <view class="grid-item">
              <image
                class="grid-icon"
                :src="$cloudAssetUrl('static/law-icons/stories.svg')"
                mode="aspectFill"
              />
              <text class="grid-text">典型案例</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="section-block">
      <view class="sec-header">法律法规速查</view>
      <view class="section-card">
        <image
          class="section-bg"
          :src="$cloudAssetUrl('static/banner/law.jpg')"
          mode="aspectFill"
        />
        <view class="card-content">
          <view class="search-box">
            <image
              class="search-icon"
              :src="$cloudAssetUrl('static/law-icons/search.svg')"
              mode="aspectFit"
            />
            <input placeholder="搜索..." placeholder-style="color:#999" />
          </view>
          <view class="tabs">
            <text
              v-for="(tab, index) in tabs"
              :key="index"
              :class="{ active: activeTab === index }"
              @click="activeTab = index"
              >{{ tab }}</text
            >
          </view>
          <view class="list-item" v-for="i in 3" :key="i">
            <view class="list-content">
              <text class="item-title">中华人民共和国出入境管理条例</text>
              <text class="item-year">2025年</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="section-block">
      <view class="sec-header">普法宣传专栏</view>
      <view class="section-card">
        <image
          class="section-bg"
          :src="$cloudAssetUrl('static/banner/law.jpg')"
          mode="aspectFill"
        />
        <view class="card-content">
          <view class="video-card">
            <view class="video-cover video-poster" @click="openLawVideo">
              <image
                class="video-poster-image"
                :src="$cloudAssetUrl('static/banner/law.jpg')"
                mode="aspectFill"
              />
              <view class="video-play-mask">
                <view class="video-play-btn">▶</view>
                <text class="video-play-text">点击播放</text>
              </view>
            </view>
            <view class="info">
              <text class="title">防范电信诈骗</text>
              <text class="desc">提高防范意识，守护财产安全</text>
              <view class="meta">
                <view class="meta-item">
                  <view class="meta-icon-frame">
                    <image
                      class="meta-icon"
                      :src="$cloudAssetUrl('static/law-icons/eye.svg')"
                      mode="aspectFill"
                    />
                  </view>
                  <text>2.5k浏览</text>
                </view>
                <text>2025-11-05</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showVideoModal" class="video-modal" @click="closeLawVideo">
      <view class="video-modal-panel" @click.stop>
        <view class="video-modal-header">
          <text class="video-modal-title">防范电信诈骗</text>
          <text class="video-modal-close" @click="closeLawVideo">关闭</text>
        </view>
        <video
          id="lawVideo"
          class="video-modal-player"
          :src="$cloudAssetUrl('static/law-videos/law.mp4')"
          controls
          autoplay
          object-fit="contain"
          :poster="$cloudAssetUrl('static/banner/law.jpg')"
        ></video>
      </view>
    </view>

    <tab-bar />
  </view>
</template>

<script>
import TabBar from "@/components/tab-bar/bar.vue";

export default {
  components: { TabBar },
  data() {
    return {
      tabs: ["法律", "行政法规", "司法解释", "部门规章"],
      activeTab: 0,
      showVideoModal: false,
    };
  },
  methods: {
    openLawVideo() {
      this.showVideoModal = true;
      this.$nextTick(() => {
        const videoContext = uni.createVideoContext("lawVideo", this);
        videoContext.play();
      });
    },
    closeLawVideo() {
      const videoContext = uni.createVideoContext("lawVideo", this);
      videoContext.stop();
      this.showVideoModal = false;
    },
  },
};
</script>

<style lang="scss" scoped>
/* 页面背景图设置 */
.page-container {
  padding: 0 24rpx 220rpx;
  background-color: #fcfcf0;
  min-height: 100vh;
  box-sizing: border-box;
}

.section-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 28rpx;
  padding: 30rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 22rpx 44rpx rgba(15, 23, 42, 0.08),
    0 6rpx 14rpx rgba(15, 23, 42, 0.05);
}

.section-block {
  margin-top: 24rpx;
}

.section-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  z-index: 0;
}

.card-content {
  position: relative;
  z-index: 1;
  background: transparent;
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
  left: 8vw;
  top: 176rpx;
  z-index: 2;
  max-width: 76%;
}

.title {
  display: block;
  font-size: 64rpx;
  font-weight: 600;
  line-height: 1;
  color: #2b3a23;
  white-space: nowrap;
}
.sub-title {
  display: block;
  margin-top: 10rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #4a5f3e;
  white-space: nowrap;
}

.meta-icon-frame {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  overflow: hidden;
  flex-shrink: 0;
  background: #eef3e8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.meta-icon {
  width: 100%;
  height: 100%;
  display: block;
  transform: scale(1.12);
  transform-origin: center;
}

.sec-header {
  display: flex;
  align-items: center;
  font-size: 34rpx;
  font-weight: 700;
  color: #2c4a30;
  margin: 0 0 12rpx 8rpx;
}
.sec-header::before {
  content: "";
  width: 6rpx;
  height: 22rpx;
  margin-right: 12rpx;
  background: #2c4a30;
  border-radius: 999rpx;
  flex-shrink: 0;
}

.nav-grid {
  display: flex;
  justify-content: space-around;
  padding: 20rpx 0;
}
.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}
.grid-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 24rpx;
  background: #eef3e8;
  display: block;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}
.grid-text {
  font-size: 26rpx;
  color: #333;
}

.search-box {
  background: #f0f4ed;
  border-radius: 40rpx;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.search-icon {
  width: 34rpx;
  height: 34rpx;
  flex-shrink: 0;
  margin-right: 16rpx;
}

.tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
  text {
    font-size: 24rpx;
    padding: 10rpx 24rpx;
    background: #f0f0f0;
    border-radius: 40rpx;
    color: #666;
  }
  .active {
    background: #5a8d46;
    color: #fff;
  }
}

.list-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eef2eb;
}
.list-content {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
}
.item-year {
  color: #999;
  font-size: 24rpx;
}

.video-card {
  display: flex;
  margin-top: 20rpx;
  .video-cover {
    width: 220rpx;
    height: 140rpx;
    border-radius: 16rpx;
    overflow: hidden;
    flex-shrink: 0;
    background: #dce5d5;
  }
  .video-poster {
    position: relative;
    overflow: hidden;
  }
  .video-poster-image {
    width: 100%;
    height: 100%;
    display: block;
  }
  .video-play-mask {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.18);
  }
  .video-play-btn {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    color: #2b3a23;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    line-height: 1;
    margin-bottom: 10rpx;
  }
  .video-play-text {
    font-size: 20rpx;
    color: #fff;
    text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.35);
  }
  .info {
    margin-left: 20rpx;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .title {
    font-size: 28rpx;
    font-weight: bold;
  }
  .desc {
    font-size: 22rpx;
    color: #777;
    margin: 8rpx 0;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .meta {
    display: flex;
    gap: 30rpx;
    font-size: 20rpx;
    color: #aaa;
    align-items: center;
  }
  .meta-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }
  .meta-icon {
    width: 34rpx;
    height: 34rpx;
    flex-shrink: 0;
    transform: scale(1.12);
    transform-origin: center;
    display: block;
  }
}

.video-modal {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  box-sizing: border-box;
}

.video-modal-panel {
  width: 100%;
  max-width: 680rpx;
  background: #0f1710;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 18rpx 50rpx rgba(0, 0, 0, 0.35);
}

.video-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18rpx 20rpx;
  color: #fff;
}

.video-modal-title {
  font-size: 28rpx;
  font-weight: 600;
}

.video-modal-close {
  font-size: 24rpx;
  color: #cfe6d0;
}

.video-modal-player {
  width: 100%;
  height: 420rpx;
  display: block;
  background: #000;
}
</style>
