<template>
  <view class="container">
    <view class="top-card detail-card">
      <image
        class="section-bg"
        :src="$cloudAssetUrl('static/banner/law.jpg')"
        mode="aspectFill"
      />
      <view class="card-content">
        <view class="user-info">
          <image
            class="avatar"
            :src="$cloudAssetUrl('static/village-icons/touxiang.jpg')"
            mode="aspectFill"
          ></image>
          <view>
            <text class="user-name">某某村民</text>
            <view class="user-tag">某某村村民</view>
          </view>
        </view>
        <view class="demand-box">
          <view class="demand-title"
            >反映诉求 <text class="tag">已评价</text></view
          >
          <text class="demand-text"
            >张某与李某土地争议，双方土地边界存在纠纷，多次协商未达成一致，申请村委介入调解。</text
          >
          <view class="demand-time">
            <text>328查看</text>
            <text>发布于2025-10-28 某某村</text>
          </view>
        </view>
      </view>
    </view>

    <view class="timeline">
      <view class="timeline-item">
        <view class="timeline-dot"></view>
        <view class="timeline-card detail-card">
          <image
            class="section-bg"
            :src="$cloudAssetUrl('static/banner/law.jpg')"
            mode="aspectFill"
          />
          <view class="card-content">
            <view class="card-header">
              <view class="card-title-left">
                <image
                  class="mini-avatar"
                  :src="$cloudAssetUrl('static/village-icons/touxiang.jpg')"
                  mode="aspectFill"
                />
                <text class="card-title">书记回复</text>
              </view>
              <text class="card-tag">已评价</text>
            </view>
            <text class="card-content"
              >收到反馈，我们会立即安排人员实地核查土地边界，组织双方开展调解工作。</text
            >
            <view class="card-time">2025-10-28 15:47</view>
          </view>
        </view>
      </view>

      <view class="timeline-item">
        <view class="timeline-dot"></view>
        <view class="timeline-card detail-card">
          <image
            class="section-bg"
            :src="$cloudAssetUrl('static/banner/law.jpg')"
            mode="aspectFill"
          />
          <view class="card-content">
            <view class="card-header">
              <view class="card-title-left">
                <image
                  class="mini-avatar"
                  :src="$cloudAssetUrl('static/village-icons/touxiang.jpg')"
                  mode="aspectFill"
                />
                <text class="card-title">集体议</text>
              </view>
              <text class="card-tag done">已完成</text>
            </view>
            <text class="card-content"
              >该纠纷已召开村民代表议事会，商议调解方案，确定调解流程。</text
            >
            <view class="card-time">2025-10-29 10:30</view>
          </view>
        </view>
      </view>

      <view class="timeline-item">
        <view class="timeline-dot"></view>
        <view class="timeline-card detail-card">
          <image
            class="section-bg"
            :src="$cloudAssetUrl('static/banner/law.jpg')"
            mode="aspectFill"
          />
          <view class="card-content">
            <view class="card-header">
              <view class="card-title-left">
                <image
                  class="mini-avatar"
                  :src="$cloudAssetUrl('static/village-icons/touxiang.jpg')"
                  mode="aspectFill"
                />
                <text class="card-title">干部办</text>
              </view>
              <text class="card-tag ing">办理中</text>
            </view>
            <text class="card-content"
              >已组织双方当事人到场调解，核对土地确权资料，进一步协商解决方案。</text
            >
            <view class="card-time">2025-10-30 09:15</view>
          </view>
        </view>
      </view>

      <view class="timeline-item">
        <view class="timeline-dot"></view>
        <view class="timeline-card detail-card">
          <image
            class="section-bg"
            :src="$cloudAssetUrl('static/banner/law.jpg')"
            mode="aspectFill"
          />
          <view class="card-content">
            <view class="card-header">
              <view class="card-title-left">
                <image
                  class="mini-avatar"
                  :src="$cloudAssetUrl('static/village-icons/touxiang.jpg')"
                  mode="aspectFill"
                />
                <text class="card-title">办理结果</text>
              </view>
              <text class="card-tag done">已完成</text>
            </view>
            <text class="card-content"
              >经调解，双方达成土地边界共识，签订调解协议，纠纷已妥善解决。</text
            >
            <view class="card-time">2025-11-02 16:30</view>
          </view>
        </view>
      </view>

      <view class="timeline-item">
        <view class="timeline-dot"></view>
        <view class="timeline-card detail-card">
          <image
            class="section-bg"
            :src="$cloudAssetUrl('static/banner/law.jpg')"
            mode="aspectFill"
          />
          <view class="card-content">
            <view class="card-header">
              <view class="card-title-left">
                <image
                  class="mini-avatar"
                  :src="$cloudAssetUrl('static/village-icons/touxiang.jpg')"
                  mode="aspectFill"
                />
                <text class="card-title">居民评</text>
              </view>
              <text class="card-tag">已评价</text>
            </view>
            <view class="score">
              <text>12人评价 满意度</text>
              <text class="star">★★★★★</text>
              <text class="score-num">5分</text>
            </view>
            <text class="eval-text"
              >调解公平公正，高效解决了土地纠纷，非常满意！</text
            >
            <view class="card-time">2025-11-03 10:45</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
  padding-bottom: 120rpx;
}
.top-card {
  margin-bottom: 30rpx;
}
.detail-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 28rpx;
  padding: 30rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 22rpx 44rpx rgba(15, 23, 42, 0.08),
    0 6rpx 14rpx rgba(15, 23, 42, 0.05);
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
.user-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  object-fit: cover;
}
.user-name {
  font-size: 32rpx;
  font-weight: bold;
}
.user-tag {
  background: #fff;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  margin-top: 8rpx;
}
.demand-title {
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}
.tag {
  color: #8b5a2b;
}
.demand-text {
  font-size: 28rpx;
  line-height: 1.6;
}
.demand-time {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #666;
}
.card-title-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.mini-avatar {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  object-fit: cover;
}
.timeline {
  position: relative;
  padding-left: 60rpx;
}
.timeline::before {
  content: "";
  position: absolute;
  left: 20rpx;
  top: 0;
  bottom: 0;
  width: 4rpx;
  background: #d4b886;
}
.timeline-item {
  position: relative;
  margin-bottom: 40rpx;
}
.timeline-dot {
  position: absolute;
  left: -50rpx;
  top: 20rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #fff;
  border: 4rpx solid #d4b886;
}
.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}
.card-title {
  font-size: 32rpx;
  font-weight: bold;
}
.card-tag {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  background: #f5e8d5;
  color: #8b5a2b;
}
.card-tag.done {
  background: #e8f5e9;
  color: #2e7d32;
}
.card-tag.ing {
  background: #e3f2fd;
  color: #1976d2;
}
.card-content {
  font-size: 28rpx;
  line-height: 1.6;
}
.card-time {
  text-align: right;
  font-size: 24rpx;
  color: #777;
  margin-top: 12rpx;
}
.score {
  margin: 16rpx 0;
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.star {
  color: #f7c846;
}
.score-num {
  font-size: 36rpx;
  font-weight: bold;
}
.eval-text {
  font-size: 28rpx;
  line-height: 1.6;
}
</style>
