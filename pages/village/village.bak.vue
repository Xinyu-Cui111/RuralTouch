<template>
  <view class="page">
    <view class="blue-banner">村民议事厅</view>
    <view class="card">
      <text>线上调解室</text>
      <view class="actions">
        <button @click="goSubmit">提交纠纷</button><button @click="goRecord">调解记录</button>
      </view>
    </view>
    <view class="card">
      <text>村务通知</text>
      <text>村民反馈</text>
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
.blue-banner { background: #005088; color: #fff; padding: 60rpx; border-radius: 20rpx; text-align: center; }
.card { background: #fff; margin: 20rpx 0; padding: 30rpx; border-radius: 20rpx; }
.actions { display: flex; gap: 20rpx; }
</style>
