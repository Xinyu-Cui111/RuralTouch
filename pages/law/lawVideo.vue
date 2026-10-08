<template>
  <view class="page">
    <rt-nav-bar title="防范电信诈骗" />

    <view class="body">
      <view
        v-if="!started"
        class="cover"
        hover-class="press"
        :hover-stay-time="80"
        @click="startPlay"
      >
        <image class="cover-img" :src="cover" mode="aspectFill" />
        <view class="cover-mask">
          <view class="play-btn"><text class="play-icon">▶</text></view>
          <text class="cover-title">点击播放反诈短片</text>
          <text class="cover-sub">约 3 分钟 · 点按播放</text>
        </view>
      </view>

      <video
        v-else-if="src && !error"
        id="lawVideoPage"
        class="player"
        :src="src"
        controls
        show-center-play-btn
        show-play-btn
        enable-play-gesture
        object-fit="contain"
        @error="onError"
        @play="onPlay"
      />

      <view v-if="error" class="fail-panel">
        <text class="fail-title">暂时无法播放</text>
        <text class="fail-desc">{{ userError }}</text>
        <view class="fail-actions">
          <view class="fail-btn primary" @click="retry">重新播放</view>
          <view class="fail-btn ghost" @click="goAdvisor">问普法顾问</view>
        </view>
      </view>

      <view class="tips-card" :class="{ emphasize: !!error }">
        <text class="tips-kicker">反诈要点</text>
        <view v-for="(t, i) in tips" :key="i" class="tip-row">
          <text class="tip-no">0{{ i + 1 }}</text>
          <text class="tip-text">{{ t }}</text>
        </view>
      </view>
    </view>

    <view class="hint">
      <text
        >内容仅供普法宣传。如已受骗，请立即拨打
        110，并保留聊天与转账记录。</text
      >
    </view>
  </view>
</template>

<script>
import {
  getLawVideoCover,
  getLocalLawVideoSrc,
  listLawVideoCandidates,
} from "@/utils/law-video.js";
import { goNavigate, goRedirect } from "@/utils/nav.js";
import { FEATURE_LAW_VIDEO } from "@/config/features.js";

export default {
  data() {
    return {
      src: getLocalLawVideoSrc(),
      cover: getLawVideoCover(),
      started: false,
      error: "",
      candidates: [],
      candIndex: 0,
      tips: [
        "凡要求转账「保金、解冻、退款、积分兑换」一律先核实，不轻信陌生来电。",
        "自称公检法、客服、领导的电话或链接，先挂断，再通过官方渠道回拨确认。",
        "不向陌生人提供验证码、身份证与银行卡信息；家人代转先当面或视频核实。",
        "若已转账，立即报警并告知村委协助留存证据，越早冻结越有利。",
      ],
    };
  },
  computed: {
    userError() {
      if (!this.error) return "";
      if (!this.src && !this.candidates.length) {
        return "暂未配置视频地址。可在 config/env.js 填写 LAW_VIDEO_HTTPS，或先阅读下方要点。";
      }
      if (/MEDIA_ERR|not supported|解码|格式/i.test(this.error)) {
        return "当前环境播不了。请用真机；并配置可用的 HTTPS 视频地址。";
      }
      return String(this.error);
    },
  },
  onLoad() {
    // 小程序个人主体：禁止站内视频，落到图文页
    if (!FEATURE_LAW_VIDEO) {
      goRedirect("/pages/law/lawTips");
      return;
    }
    this._alive = true;
    this.prepare();
  },
  onUnload() {
    this._alive = false;
    this.started = false;
  },
  methods: {
    async prepare() {
      try {
        const list = await listLawVideoCandidates();
        this.candidates = list.length
          ? list
          : [{ src: getLocalLawVideoSrc(), from: "local" }];
        this.candIndex = 0;
        this.src = this.candidates[0].src;
      } catch (e) {
        this.src = getLocalLawVideoSrc();
        this.candidates = [{ src: this.src, from: "local" }];
      }
    },
    playAfterMount() {
      if (!this._alive || !this.started) return;
      setTimeout(() => {
        if (!this._alive || !this.started) return;
        try {
          uni.createVideoContext("lawVideoPage", this).play();
        } catch (e) {
          /* ignore */
        }
      }, 80);
    },
    startPlay() {
      this.error = "";
      if (!this.src) {
        this.error = "no-src";
        this.started = false;
        return;
      }
      this.started = true;
      this.playAfterMount();
    },
    retry() {
      this.error = "";
      this.started = false;
      this.candIndex = 0;
      if (this.candidates[0]) this.src = this.candidates[0].src;
      setTimeout(() => {
        if (!this._alive) return;
        this.startPlay();
      }, 80);
    },
    onError(e) {
      if (!this._alive) return;
      const detail = (e && e.detail) || {};
      const next = this.candIndex + 1;
      if (next < this.candidates.length) {
        this.started = false;
        this.candIndex = next;
        this.src = this.candidates[next].src;
        this.error = "";
        setTimeout(() => {
          if (!this._alive) return;
          this.started = true;
          this.playAfterMount();
        }, 120);
        return;
      }
      this.error = detail.errMsg || detail.message || "播放失败";
      this.started = false;
    },
    onPlay() {
      this.error = "";
    },
    goAdvisor() {
      uni.setStorageSync(
        "rt_legal_prefill",
        "接到自称公检法要求转账的电话，正确应对步骤是什么？"
      );
      goNavigate("/pages/law/aiLegal");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.page {
  min-height: 100vh;
  background: #0a0f0c;
  box-sizing: border-box;
}
.body {
  padding: 24rpx $rt-page-x;
}
.press {
  opacity: 0.94;
}

.cover {
  position: relative;
  height: 420rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #111;
}
.cover-img {
  width: 100%;
  height: 100%;
  display: block;
}
.cover-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(10, 15, 12, 0.45);
}
.play-btn {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
}
.play-icon {
  margin-left: 6rpx;
  font-size: 38rpx;
  color: $rt-primary-dark;
  font-weight: 800;
}
.cover-title {
  margin-top: 20rpx;
  font-size: 30rpx;
  font-weight: 800;
  color: #fff;
}
.cover-sub {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.player {
  width: 100%;
  height: 420rpx;
  background: #000;
  border-radius: 16rpx;
  overflow: hidden;
}

.fail-panel {
  min-height: 240rpx;
  padding: 36rpx 28rpx;
  border-radius: 16rpx;
  background: #141a16;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  text-align: center;
}
.fail-title {
  display: block;
  font-size: 32rpx;
  font-weight: 800;
  color: #fff;
}
.fail-desc {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.65);
}
.fail-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 28rpx;
}
.fail-btn {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  font-weight: 700;
}
.fail-btn.primary {
  background: $rt-primary;
  color: #fff;
}
.fail-btn.ghost {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(255, 255, 255, 0.16);
}

.tips-card {
  margin-top: 24rpx;
  padding: 24rpx 22rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}
.tips-card.emphasize {
  background: rgba(201, 162, 74, 0.12);
  border-color: rgba(201, 162, 74, 0.28);
}
.tips-kicker {
  display: block;
  margin-bottom: 16rpx;
  font-size: 22rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
  color: $rt-accent;
}
.tip-row {
  display: flex;
  gap: 14rpx;
  margin-bottom: 14rpx;
}
.tip-row:last-child {
  margin-bottom: 0;
}
.tip-no {
  flex-shrink: 0;
  font-size: 22rpx;
  font-weight: 800;
  color: rgba(201, 162, 74, 0.85);
}
.tip-text {
  flex: 1;
  font-size: 24rpx;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.78);
}

.hint {
  padding: 8rpx $rt-page-x 48rpx;
  color: rgba(255, 255, 255, 0.4);
  font-size: 22rpx;
  line-height: 1.5;
}
</style>
