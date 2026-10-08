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

const BODY = `欢迎使用「指尖善治」智慧村务（微信小程序与 App）。本协议是您与平台之间关于使用本服务所订立的协议。

1. 服务内容：本平台提供村务通知、村民议事协助、普法宣传、调解激励信息、惠民好物信息等服务。微信小程序端为图文普法与信息展示；App 端可提供普法短片播放与惠民预约登记（无线上支付）。
2. 用户义务：您应保证提交文字信息真实、合法，不得发布虚假、违法内容。证件与现场材料请当面交村委核验，请勿在本产品上传证件影像。
3. 隐私保护：我们将按照隐私政策保护您的个人信息。微信小程序端不单独采集手机号；App 端意见箱联系方式为自愿选填，仅用于村委回访。
4. 免责声明：调解与村务办理结果以村委会实际处理为准，平台提供信息协助与流转。
5. 协议更新：我们可能适时更新本协议，更新后继续使用即视为同意。

如有疑问，请通过应用内「意见箱」或联系村委。`;

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
