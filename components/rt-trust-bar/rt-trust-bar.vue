<template>
  <view class="trust">
    <text class="tip">{{ tipText }}</text>
    <view class="row">
      <view
        class="btn"
        hover-class="press"
        :hover-stay-time="80"
        @click="onCall"
      >
        <text class="btn-text">{{ callLabel }}</text>
      </view>
      <view
        class="btn danger"
        hover-class="press"
        :hover-stay-time="80"
        @click="onEmergency"
      >
        <text class="btn-text">110 / 120</text>
      </view>
    </view>
  </view>
</template>

<script>
import { COPY } from "@/utils/copy-voice.js";
import { VILLAGE_CONTACT_PHONE, EMERGENCY_TIP } from "@/config/env.js";

export default {
  name: "RtTrustBar",
  props: {
    tip: { type: String, default: "" },
  },
  computed: {
    callLabel() {
      return COPY.callVillage;
    },
    tipText() {
      return this.tip || `${COPY.brandHelper}提醒：${COPY.emergency}`;
    },
  },
  methods: {
    onCall() {
      const phone = VILLAGE_CONTACT_PHONE || "";
      if (!phone) {
        uni.showToast({ title: "暂未配置村委电话", icon: "none" });
        return;
      }
      uni.makePhoneCall({ phoneNumber: String(phone).replace(/\D/g, "") });
    },
    onEmergency() {
      uni.showModal({
        title: "紧急求助",
        content: EMERGENCY_TIP || COPY.emergency,
        showCancel: false,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.trust {
  margin-top: 24rpx;
  margin-bottom: 12rpx;
  padding: 20rpx 22rpx;
  border-radius: $rt-radius-sm;
  background: rgba(255, 255, 255, 0.75);
  border: 1rpx dashed rgba(158, 52, 40, 0.2);
}
.tip {
  display: block;
  font-size: $rt-type-micro;
  color: $rt-text-secondary;
  line-height: 1.45;
  margin-bottom: 12rpx;
}
.row {
  display: flex;
  gap: 12rpx;
}
.btn {
  flex: 1;
  min-height: 72rpx;
  border-radius: 999rpx;
  background: $rt-surface;
  border: 1rpx solid rgba(158, 52, 40, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn.danger {
  border-color: rgba(158, 52, 40, 0.35);
  background: rgba(158, 52, 40, 0.06);
}
.btn-text {
  font-size: $rt-type-caption;
  font-weight: 800;
  color: $rt-primary-dark;
}
.press {
  opacity: 0.9;
}
</style>
