<template>
  <view class="page">
    <rt-nav-bar title="用户协议" />
    <rt-card elevated>
      <text class="title" user-select>用户服务协议</text>
      <text class="content" user-select>{{ body }}</text>
    </rt-card>
  </view>
</template>

<script>
import RtCard from "@/components/rt-card/rt-card.vue";

const BODY = `欢迎使用「指尖善治」智慧村务小程序。本协议是您与平台之间关于使用本服务所订立的协议。

1. 服务内容：本平台提供村务通知、村民议事、纠纷调解、道德银行积分、惠民团购信息展示等服务。
2. 用户义务：您应保证提交信息真实、合法，不得发布虚假、违法内容。
3. 隐私保护：我们将按照隐私政策保护您的个人信息。
4. 免责声明：调解结果以村委会实际处理为准，平台提供信息流转服务。
5. 协议更新：我们可能适时更新本协议，更新后继续使用即视为同意。

如有疑问，请通过小程序内「村民反馈」联系我们。`;

export default {
  components: { RtCard },
  data() {
    return { body: BODY };
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";
.page {
  @include rt-page;
  padding: $rt-page-x;
}
.title {
  display: block;
  font-size: 36rpx;
  font-weight: $rt-weight-heavy;
  color: $rt-text;
  margin-bottom: 24rpx;
}
.content {
  display: block;
  font-size: $rt-type-body;
  line-height: 1.85;
  color: $rt-text-secondary;
  white-space: pre-wrap;
}
</style>
