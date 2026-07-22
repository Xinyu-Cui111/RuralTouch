<template>
  <view class="page">
    <rt-nav-bar title="隐私政策" />
    <rt-card elevated>
      <text class="title" user-select>隐私政策</text>
      <text class="content" user-select>{{ body }}</text>
    </rt-card>
  </view>
</template>

<script>
import RtCard from "@/components/rt-card/rt-card.vue";

const BODY = `「指尖善治」重视您的隐私保护。本政策说明我们如何收集、使用和保护您的信息。

一、我们收集的信息
1. 微信登录标识（OpenID）：用于识别用户身份、保存调解记录与积分数据。
2. 您主动填写的信息：手机号、反馈内容、纠纷描述等。
3. 设备信息：为保障服务安全稳定运行所必需的基础信息。

二、信息使用目的
1. 提供村务通知、纠纷调解、积分管理、反馈提交等核心功能。
2. 改进产品体验与服务质量。
3. 满足法律法规及监管要求。

三、信息存储与保护
1. 数据存储于微信云开发环境，采取访问控制与权限隔离。
2. 我们不会向无关第三方出售您的个人信息。

四、您的权利
您有权查询、更正或删除您的个人信息，可通过「村民反馈」联系我们处理。

五、未成年人保护
若您为未成年人，请在监护人指导下使用本服务。

六、政策更新
我们可能适时更新本政策，重大变更将通过小程序内提示告知。

更新日期：2025年10月`;

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
