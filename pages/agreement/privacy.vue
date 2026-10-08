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

const BODY = `「指尖善治」重视您的隐私保护。本政策适用于微信小程序与 App（Android / iOS）客户端。

一、我们收集的信息
1. 登录标识：小程序为微信 OpenID；App 为本机生成的业务标识（形如 app_…）。仅在您主动登录后用于识别账号、保存办件与积分等业务数据。
2. 您主动填写的文字内容：如纠纷描述、意见反馈、评价等业务说明。
3. App 端若您自愿填写联系方式（手机号或微信），仅用于村委回访；微信小程序端不单独采集手机号。本产品不采集、不存储身份证等证件影像；现场材料请当面交村委。
4. 为保障服务运行所必需的基础设备与日志信息；App 若您开启「办件进度提醒」意向，可能保存推送 clientId（正式通道开通前不会滥发通知）。
5. App 端可能播放普法宣传视频（需已配置片源）；小程序端仅提供图文要点。

二、信息使用目的
1. 提供村务通知、议事调解协助、普法图文、团购信息展示等功能。
2. 改进产品体验与服务质量。
3. 满足法律法规要求。

三、信息存储与保护
1. 小程序数据存储于微信云开发环境；App 经 HTTPS（或调试期局域网）网关访问同一业务能力，采取访问控制与权限隔离。
2. 我们不会向无关第三方出售您的个人信息。

四、您的权利
您有权查询、更正与您相关的业务文字信息，可通过意见箱或联系村委协助处理。App 可在系统设置中关闭麦克风、通知等权限。

五、未成年人保护
若您为未成年人，请在监护人指导下使用本服务。

六、政策更新
我们可能适时更新本政策，重大变更将通过应用内提示告知。

更新日期：2026年7月`;

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
