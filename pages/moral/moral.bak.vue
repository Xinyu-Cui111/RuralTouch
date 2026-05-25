<template>
  <view class="page">
    <view class="score-card">
      <text>当前可用积分</text>
      <text class="num">1,250</text>
    </view>
    <view class="record">
      <text>积分获取记录</text>
      <view v-for="i in 3" :key="i">普法活动 +50分</view>
    </view>
    <view class="mall">
      <text>可兑换商品</text>
      <view class="grid">
        <view class="item">洗衣液 100分</view>
        <view class="item">大米 200分</view>
      </view>
    </view>
    <tab-bar />
  </view>
</template>
<script>
import TabBar from '@/components/tab-bar/bar.vue'

export default {
  components: { TabBar }
}
</script>

<style>
.page { padding: 24rpx 24rpx 220rpx; box-sizing: border-box; background-color: #fcfcf0; min-height: 100vh; }
.score-card { background: #fff; padding: 60rpx; text-align: center; border-radius: 20rpx; }
.num { font-size: 60rpx; color: #d4af37; font-weight: bold; }
.item { width: 45%; background: #fff; padding: 20rpx; margin: 10rpx; border-radius: 10rpx; }
</style>
