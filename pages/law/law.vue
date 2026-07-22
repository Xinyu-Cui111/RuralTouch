<template>
  <view class="page" :class="{ elder: elderOn }">
    <page-hero compact variant="law" title="法治" />

    <view
      class="primary-card enter"
      hover-class="press"
      :hover-stay-time="80"
      @click="goSubmit"
    >
      <view class="primary-copy">
        <text class="primary-kicker">有纠纷要办</text>
        <text class="primary-title">去说事建档</text>
        <text class="primary-desc">说清经过，村委组织调解</text>
      </view>
      <text class="primary-cta">去办理</text>
    </view>

    <rt-section title="反诈短片">
      <view class="video-card enter delay-1">
        <!-- 封面：用 image，避免 video.poster 只认网络地址 -->
        <view
          v-if="!videoStarted"
          class="video-cover"
          hover-class="press"
          :hover-stay-time="80"
          @click="startVideo"
        >
          <image class="cover-img" :src="videoCover" mode="aspectFill" />
          <view class="cover-mask">
            <view class="play-btn">
              <text class="play-icon">▶</text>
            </view>
            <text class="cover-title">防范电信诈骗</text>
            <text class="cover-sub">点击播放</text>
          </view>
        </view>
        <video
          v-else
          id="lawHomeVideo"
          class="player"
          :src="videoSrc"
          controls
          show-center-play-btn
          show-play-btn
          enable-play-gesture
          object-fit="contain"
          @error="onVideoError"
          @play="onVideoPlay"
        />
        <view v-if="videoError" class="video-err">
          <text class="video-err-text">{{ videoErrorHint }}</text>
          <text class="tips-more" @click="openLawVideo">去完整页重试 ›</text>
        </view>
        <view class="video-tips">
          <text class="tips-kicker">先记住这三条</text>
          <text class="tip-line">· 不轻信转账保金 / 解冻 / 退款</text>
          <text class="tip-line">· 自称公检法先挂断，官方渠道核实</text>
          <text class="tip-line">· 已转账立即报警并告知村委</text>
          <text class="tips-more" @click="openLawVideo"
            >全屏观看与完整要点 ›</text
          >
        </view>
      </view>
    </rt-section>

    <view
      class="advisor-card enter delay-2"
      hover-class="press"
      :hover-stay-time="80"
      @click="goAiLegal"
    >
      <view class="advisor-copy">
        <text class="advisor-title">普法顾问</text>
        <text class="advisor-desc">土地、邻里、劳务 — 在线问答</text>
      </view>
      <text class="advisor-arrow">去问 ›</text>
    </view>

    <rt-section title="常见纠纷要点">
      <rt-card compact elevated tone="blue" class="enter delay-3">
        <view
          v-for="(item, idx) in essentials"
          :key="item.id"
          class="ess-block"
          :class="{
            last: idx === essentials.length - 1,
            open: openId === item.id,
          }"
        >
          <view
            class="ess-head"
            hover-class="press"
            :hover-stay-time="80"
            @click="toggle(item.id)"
          >
            <view class="ess-no">0{{ idx + 1 }}</view>
            <view class="ess-body">
              <text class="ess-title">{{ item.title }}</text>
              <text class="ess-desc">{{ item.desc }}</text>
            </view>
            <text class="ess-toggle">{{
              openId === item.id ? "收起" : "展开"
            }}</text>
          </view>
          <view v-if="openId === item.id" class="ess-panel">
            <text class="ess-detail">{{ item.detail }}</text>
            <view class="ess-actions">
              <view
                class="ess-btn primary full"
                hover-class="press"
                :hover-stay-time="80"
                @click.stop="goSubmitWith(item)"
                >去建档</view
              >
              <text class="ess-link" @click.stop="askAdvisor(item)"
                >还有疑问？问普法顾问</text
              >
            </view>
          </view>
        </view>
      </rt-card>
    </rt-section>

    <tab-bar />
  </view>
</template>

<script>
import TabBar from "@/components/tab-bar/bar.vue";
import PageHero from "@/components/page-hero/page-hero.vue";
import RtCard from "@/components/rt-card/rt-card.vue";
import RtSection from "@/components/rt-section/rt-section.vue";
import { ensureLoggedIn } from "@/utils/auth.js";
import { goNavigate } from "@/utils/nav.js";
import { setSubmitDraftText } from "@/utils/submit-draft.js";
import { isElderMode } from "@/utils/elder-mode.js";
import {
  getLawVideoCover,
  getLocalLawVideoSrc,
  listLawVideoCandidates,
} from "@/utils/law-video.js";

export default {
  components: { TabBar, PageHero, RtCard, RtSection },
  data() {
    return {
      elderOn: false,
      openId: "land",
      videoSrc: getLocalLawVideoSrc(),
      videoCover: getLawVideoCover(),
      videoStarted: false,
      videoError: "",
      videoHint: "",
      videoCandidates: [],
      videoCandIndex: 0,
      essentials: [
        {
          id: "land",
          title: "土地边界争议",
          desc: "取证 → 协商 → 村委调解",
          detail:
            "先保留地界凭证、公示材料与现场照片；尽量先与对方协商；协商不成再走「说事建档」，由村委组织核实与调解。线上普法不能替代实地勘界。",
          ask: "土地边界有争议，我该准备什么材料、走哪些步骤？",
          draft: "土地边界存在争议，双方协商未果，申请村委介入调解。",
        },
        {
          id: "noise",
          title: "邻里噪音 / 通道占用",
          desc: "留存记录 → 沟通 → 升级调解",
          detail:
            "记录发生时间、影响与沟通过程；优先当面或请中间人沟通；仍无法解决再提交调解，说清诉求与可接受方案。人身冲突请先报警。",
          ask: "邻居噪音很大还占用通道，调解时怎么表述诉求更合适？",
          draft: "邻里噪音/通道占用影响生活，多次沟通未果，申请村委调解。",
        },
        {
          id: "fraud",
          title: "防电信诈骗",
          desc: "不转账、先核实、再报案",
          detail:
            "凡「转账保金、找回积分、公检法来电」一律先核实。若已受骗，保留聊天与转账记录，立即报警并告知村委协助。",
          ask: "接到自称公检法要求转账的电话，正确应对步骤是什么？",
          draft: "",
        },
      ],
    };
  },
  computed: {
    videoErrorHint() {
      if (this.videoHint) return this.videoHint;
      if (!this.videoError) return "";
      if (/MEDIA_ERR|not supported|解码|格式/i.test(this.videoError)) {
        return "当前模拟器可能播不了。请点「完整页」或用顶部「真机调试」。";
      }
      return this.videoError;
    },
  },
  onShow() {
    this.elderOn = isElderMode();
    ensureLoggedIn();
  },
  onLoad() {
    this._alive = true;
    this.prepareSrc();
  },
  onUnload() {
    // 页面销毁时不要再调 videoContext，易触发开发者工具 __subPageFrameEndTime__ 空指针
    this._alive = false;
    this.videoStarted = false;
  },
  methods: {
    async prepareSrc() {
      try {
        const list = await listLawVideoCandidates();
        this.videoCandidates = list.length
          ? list
          : [{ src: getLocalLawVideoSrc(), from: "local" }];
        this.videoCandIndex = 0;
        const cur = this.videoCandidates[0];
        this.videoSrc = cur.src;
        this.videoHint = cur.hint || "";
      } catch (e) {
        this.videoSrc = getLocalLawVideoSrc();
        this.videoCandidates = [{ src: this.videoSrc, from: "local" }];
      }
    },
    playAfterMount() {
      if (!this._alive || !this.videoStarted) return;
      setTimeout(() => {
        if (!this._alive || !this.videoStarted) return;
        try {
          uni.createVideoContext("lawHomeVideo", this).play();
        } catch (e) {
          /* ignore */
        }
      }, 80);
    },
    startVideo() {
      this.videoError = "";
      this.videoStarted = true;
      this.playAfterMount();
    },
    onVideoPlay() {
      this.videoError = "";
    },
    onVideoError(e) {
      if (!this._alive) return;
      const detail = (e && e.detail) || {};
      const msg = detail.errMsg || detail.message || "播放失败";
      const next = this.videoCandIndex + 1;
      if (next < this.videoCandidates.length) {
        // 先卸掉再换源，避免同帧连毁连建触发工具内部计时 bug
        this.videoStarted = false;
        this.videoCandIndex = next;
        const cur = this.videoCandidates[next];
        this.videoSrc = cur.src;
        this.videoHint = cur.hint || "";
        this.videoError = "";
        setTimeout(() => {
          if (!this._alive) return;
          this.videoStarted = true;
          this.playAfterMount();
        }, 120);
        return;
      }
      this.videoError = msg;
      this.videoStarted = false;
      this.videoHint = /MEDIA_ERR|not supported|解码/i.test(msg)
        ? "当前环境播不了。请用顶部「真机调试」，或检查网络/合法域名。"
        : msg;
    },
    toggle(id) {
      this.openId = this.openId === id ? "" : id;
    },
    goSubmit() {
      goNavigate("/pages/village/submit");
    },
    goSubmitWith(item) {
      if (item && item.draft) setSubmitDraftText(item.draft, "law");
      goNavigate("/pages/village/submit");
    },
    askAdvisor(item) {
      uni.setStorageSync("rt_legal_prefill", item.ask);
      goNavigate("/pages/law/aiLegal");
    },
    goAiLegal() {
      goNavigate("/pages/law/aiLegal");
    },
    openLawVideo() {
      goNavigate("/pages/law/lawVideo");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.page {
  @include rt-page;
  padding: 0 $rt-page-x $rt-page-bottom;
}

.enter {
  @include rt-enter(0s);
}
.delay-1 {
  animation-delay: 0.06s;
}
.delay-2 {
  animation-delay: 0.12s;
}
.delay-3 {
  animation-delay: 0.18s;
}

.primary-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 36rpx 28rpx;
  margin: 8rpx 0 28rpx;
  border-radius: $rt-radius-lg;
  background: radial-gradient(
      ellipse 80% 60% at 100% 0%,
      rgba(255, 255, 255, 0.95) 0%,
      transparent 55%
    ),
    linear-gradient(145deg, #f7f9fc 0%, $rt-blue-soft 55%, #e4eaf2 100%);
  border: 1rpx solid rgba(58, 74, 99, 0.14);
  box-shadow: $rt-shadow-sm;
  box-sizing: border-box;
}
.press {
  opacity: 0.94;
}
.primary-copy {
  flex: 1;
  min-width: 0;
}
.primary-kicker {
  display: block;
  font-size: $rt-type-micro;
  font-weight: 700;
  color: $rt-blue;
  margin-bottom: 6rpx;
}
.primary-title {
  display: block;
  font-family: $rt-font-title;
  font-size: 36rpx;
  font-weight: 800;
  color: $rt-text;
}
.primary-desc {
  display: block;
  margin-top: 8rpx;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
}
.primary-cta {
  flex-shrink: 0;
  padding: 18rpx 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #2f3c52, #5a6b82);
  color: #fff;
  font-size: $rt-type-body;
  font-weight: 800;
}

.video-card {
  overflow: hidden;
  border-radius: $rt-radius-lg;
  background: #fff;
  border: 1rpx solid rgba(50, 40, 30, 0.06);
  box-shadow: $rt-shadow-sm;
}
.player {
  width: 100%;
  height: 380rpx;
  background: #0a0f0c;
  display: block;
}
.video-cover {
  position: relative;
  height: 380rpx;
  overflow: hidden;
  background: #0a0f0c;
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
  background: rgba(10, 15, 12, 0.42);
}
.play-btn {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.25);
}
.play-icon {
  margin-left: 6rpx;
  font-size: 36rpx;
  color: $rt-primary-dark;
  font-weight: 800;
}
.cover-title {
  margin-top: 20rpx;
  font-size: $rt-type-body;
  font-weight: 800;
  color: #fff;
}
.cover-sub {
  margin-top: 6rpx;
  font-size: $rt-type-caption;
  color: rgba(255, 255, 255, 0.85);
}
.video-err {
  padding: 16rpx 24rpx 0;
}
.video-err-text {
  display: block;
  font-size: 22rpx;
  color: #b86b35;
  line-height: 1.45;
}
.video-tips {
  padding: 22rpx 24rpx 26rpx;
}
.tips-kicker {
  display: block;
  margin-bottom: 10rpx;
  font-size: $rt-type-micro;
  font-weight: 800;
  letter-spacing: 1rpx;
  color: $rt-blue;
}
.tip-line {
  display: block;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.55;
}
.tips-more {
  display: block;
  margin-top: 14rpx;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-primary-mid;
}

.advisor-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin: 8rpx 0 28rpx;
  padding: 28rpx 24rpx;
  border-radius: $rt-radius-md;
  background: #fff;
  border: 1rpx solid rgba(50, 40, 30, 0.06);
  box-shadow: $rt-shadow-sm;
}
.advisor-copy {
  flex: 1;
  min-width: 0;
}
.advisor-title {
  display: block;
  font-size: $rt-type-body;
  font-weight: 800;
  color: $rt-text;
}
.advisor-desc {
  display: block;
  margin-top: 6rpx;
  font-size: $rt-type-micro;
  color: $rt-text-secondary;
}
.advisor-arrow {
  flex-shrink: 0;
  font-size: $rt-type-caption;
  font-weight: 800;
  color: $rt-blue;
}

.ess-block {
  padding: 8rpx 0 20rpx;
  border-bottom: 1rpx solid $rt-border;
}
.ess-block.last {
  border-bottom: none;
  padding-bottom: 4rpx;
}
.ess-block.open .ess-title {
  color: $rt-blue;
}
.ess-head {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-height: 88rpx;
}
.ess-no {
  width: 48rpx;
  height: 48rpx;
  border-radius: 14rpx;
  background: $rt-blue-soft;
  color: $rt-blue;
  font-size: 22rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ess-body {
  flex: 1;
  min-width: 0;
}
.ess-title {
  display: block;
  font-size: $rt-type-body;
  font-weight: 800;
  color: $rt-text;
}
.ess-desc {
  display: block;
  margin-top: 4rpx;
  font-size: $rt-type-micro;
  color: $rt-text-secondary;
}
.ess-toggle {
  flex-shrink: 0;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-blue;
}
.ess-panel {
  margin-top: 12rpx;
  padding-left: 64rpx;
}
.ess-detail {
  display: block;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.55;
}
.ess-actions {
  margin-top: 16rpx;
}
.ess-btn {
  @include rt-btn-reset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 72rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  font-size: $rt-type-caption;
  font-weight: 800;
}
.ess-btn.primary {
  background: linear-gradient(135deg, $rt-primary-dark, $rt-primary-mid);
  color: #fff;
}
.ess-btn.full {
  width: 100%;
  box-sizing: border-box;
}
.ess-link {
  display: block;
  margin-top: 16rpx;
  text-align: center;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-blue;
}
</style>
