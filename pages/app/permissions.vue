<template>
  <view class="page">
    <rt-nav-bar title="权限说明" />
    <rt-card elevated>
      <text class="lead"
        >「指尖善治」仅在您主动使用相关功能时申请权限，可随时在系统设置中关闭。</text
      >
      <view v-for="(item, idx) in items" :key="idx" class="item">
        <text class="item-title">{{ item.title }}</text>
        <text class="item-desc">{{ item.desc }}</text>
      </view>
    </rt-card>
  </view>
</template>

<script>
import RtCard from "@/components/rt-card/rt-card.vue";

export default {
  components: { RtCard },
  data() {
    return {
      items: [
        {
          title: "网络访问",
          desc: "用于加载村务通知、办件进度与登录同步。无网络时部分功能不可用。",
        },
        {
          title: "麦克风",
          desc: "仅在您使用语音说事或语音问答时申请，用于把口述转成文字；不会后台录音。",
        },
        {
          title: "电话（拨号）",
          desc: "仅在您点击「联系村委」或紧急提示中的电话时，调起系统拨号界面。",
        },
        {
          title: "通知（可选）",
          desc: "用于办件进度提醒。默认关闭；您可在「我的 → 设置」中开启意向。正式厂商推送通道开通前不会乱发通知。",
        },
        {
          title: "相册 / 相机（如开通）",
          desc: "仅用于选择或拍摄现场说明材料；请勿上传身份证等证件影像，证件请当面交村委。",
        },
        {
          title: "我们不会申请",
          desc: "持续定位、通讯录、短信读取、后台随意录音等与村务无关的敏感权限。",
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.page {
  @include rt-page;
  padding: $rt-page-x;
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
}

.lead {
  display: block;
  font-size: $rt-type-body;
  line-height: 1.7;
  color: $rt-text-secondary;
  margin-bottom: 28rpx;
}

.item {
  padding: 24rpx 0;
  border-top: 1rpx solid rgba(50, 40, 30, 0.06);
}

.item:first-of-type {
  border-top: none;
  padding-top: 8rpx;
}

.item-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $rt-text;
  margin-bottom: 10rpx;
}

.item-desc {
  display: block;
  font-size: 26rpx;
  line-height: 1.7;
  color: $rt-text-secondary;
}
</style>
