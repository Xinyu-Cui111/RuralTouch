<template>
  <view class="page">
    <rt-nav-bar title="反诈要点" />
    <view class="body">
      <view v-for="(tip, i) in tips" :key="i" class="card">
        <text class="idx">{{ i + 1 }}</text>
        <view class="content">
          <text class="title">{{ tip.title }}</text>
          <text class="desc">{{ tip.desc }}</text>
        </view>
      </view>
      <view class="action" @click="goVideo">观看反诈短片</view>
    </view>
    <tab-bar />
  </view>
</template>

<script setup>
const tips = [
  {
    title: "不轻信陌生转账",
    desc: "凡要求转账、汇款、扫码支付的，先核实身份。",
  },
  { title: "不泄露验证码", desc: "验证码等于钥匙，任何人索要都可能是诈骗。" },
  { title: "公检法不会电话办案", desc: "真正执法不会通过电话要求移交资金。" },
  { title: "遇事找村委", desc: "拿不准时先联系村委或拨打 110。" },
];

function goVideo() {
  uni.navigateTo({ url: "/pages/law/lawVideo" });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3f7f4;
}
.body {
  padding: 16px 16px 96px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card {
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 6px 18px rgba(20, 60, 40, 0.05);
}
.idx {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3d9b6e;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 28px;
}
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2f27;
}
.desc {
  font-size: 13px;
  color: #6b7f74;
  line-height: 1.5;
}
.action {
  margin-top: 8px;
  text-align: center;
  background: #3d9b6e;
  color: #fff;
  border-radius: 14px;
  padding: 14px;
  font-weight: 700;
}
</style>
