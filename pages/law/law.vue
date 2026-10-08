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

    <!-- App：完整版内嵌视频卡；小程序：图文要点 -->
    <rt-section
      v-if="enableVideo"
      title="反诈短片"
      link="全屏 ›"
      @link="openLawVideo"
    >
      <view class="video-card enter delay-1">
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
            <text class="cover-sub">{{
              videoSrc ? "点击播放" : "暂无片源 · 点此看完整页"
            }}</text>
          </view>
        </view>
        <video
          v-else-if="videoSrc"
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

    <rt-section v-else title="反诈要点" link="全部 ›" @link="openLawTips">
      <view
        class="fraud-hero enter delay-1"
        hover-class="press"
        :hover-stay-time="80"
        @click="openLawTips"
      >
        <image class="fraud-hero-img" :src="coverImg" mode="aspectFill" />
        <view class="fraud-hero-mask" />
        <view class="fraud-hero-copy">
          <text class="fraud-hero-title">防范电信诈骗</text>
          <text class="fraud-hero-sub">不轻信 · 不转账 · 先核实 · 快报警</text>
        </view>
      </view>

      <view class="fraud-card enter delay-1">
        <text v-for="(line, i) in fraudTips" :key="i" class="fraud-line">{{
          line
        }}</text>
        <view class="fraud-foot">
          <text class="fraud-link" @click.stop="openLawTips">完整要点 ›</text>
          <text class="fraud-link warn" @click.stop="onFraudAlert"
            >已转账求助 ›</text
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
import { VILLAGE_CONTACT_PHONE } from "@/config/env.js";
import { FEATURE_LAW_VIDEO, lawAntiFraudPath } from "@/config/features.js";

const LAW_COVER = "/static/lite/law-cover.jpg";

export default {
  components: { TabBar, PageHero, RtCard, RtSection },
  data() {
    return {
      elderOn: false,
      openId: "land",
      coverImg: LAW_COVER,
      antiFraudLink: FEATURE_LAW_VIDEO ? "看短片 ›" : "全部 ›",
      antiFraudSub: FEATURE_LAW_VIDEO
        ? "点此观看反诈短片 · 也可看图文要点"
        : "不轻信 · 不转账 · 先核实 · 快报警",
      fraudTips: [
        "不轻信转账保金、解冻、退款",
        "自称公检法先挂断，官方渠道核实",
        "已转账立即报警，并告知村委",
      ],
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
  onShow() {
    this.elderOn = isElderMode();
  },
  onLoad() {
    // App：反诈入口进视频页；小程序：图文要点（见 features.js）
  },
  methods: {
    toggle(id) {
      this.openId = this.openId === id ? "" : id;
    },
    goSubmit() {
      if (!ensureLoggedIn({ tip: "说事建档请先登录" })) return;
      goNavigate("/pages/village/submit");
    },
    goSubmitWith(item) {
      if (!ensureLoggedIn({ tip: "说事建档请先登录" })) return;
      if (item && item.draft) setSubmitDraftText(item.draft, "law");
      goNavigate("/pages/village/submit");
    },
    askAdvisor(item) {
      if (!ensureLoggedIn({ tip: "咨询普法顾问请先登录" })) return;
      uni.setStorageSync("rt_legal_prefill", item.ask);
      goNavigate("/pages/law/aiLegal");
    },
    goAiLegal() {
      if (!ensureLoggedIn({ tip: "咨询普法顾问请先登录" })) return;
      goNavigate("/pages/law/aiLegal");
    },
    openLawTips() {
      goNavigate(lawAntiFraudPath());
    },
    onFraudAlert() {
      const phone = String(VILLAGE_CONTACT_PHONE || "").replace(/\D/g, "");
      uni.showActionSheet({
        itemList: phone
          ? ["拨打 110 报警", "联系村委协助", "查看完整反诈要点"]
          : ["拨打 110 报警", "查看完整反诈要点"],
        success: (res) => {
          const i = res.tapIndex;
          if (i === 0) {
            uni.makePhoneCall({
              phoneNumber: "110",
              fail: () =>
                uni.showToast({ title: "请手动拨打 110", icon: "none" }),
            });
            return;
          }
          if (phone && i === 1) {
            uni.makePhoneCall({
              phoneNumber: phone,
              fail: () =>
                uni.showToast({
                  title: "无法拨号，请手动联系村委",
                  icon: "none",
                }),
            });
            return;
          }
          this.openLawTips();
        },
      });
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

/* 反诈：封面 + 三条要点，干净不堆叠 */
.fraud-hero {
  position: relative;
  overflow: hidden;
  height: 240rpx;
  border-radius: $rt-radius-lg;
  background: #1a2230;
  box-shadow: $rt-shadow-sm;
}
.fraud-hero-img {
  width: 100%;
  height: 100%;
  display: block;
}
.fraud-hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(18, 24, 36, 0.12) 0%,
    rgba(18, 24, 36, 0.78) 100%
  );
}
.fraud-hero-copy {
  position: absolute;
  left: 28rpx;
  right: 28rpx;
  bottom: 24rpx;
}
.fraud-hero-title {
  display: block;
  font-family: $rt-font-title;
  font-size: 36rpx;
  font-weight: 800;
  color: #fff;
}
.fraud-hero-sub {
  display: block;
  margin-top: 8rpx;
  font-size: $rt-type-caption;
  color: rgba(255, 255, 255, 0.84);
}
.fraud-card {
  margin-top: 14rpx;
  padding: 22rpx 24rpx 18rpx;
  border-radius: $rt-radius-md;
  background: #fff;
  border: 1rpx solid rgba(50, 40, 30, 0.06);
  box-shadow: $rt-shadow-sm;
}
.fraud-line {
  display: block;
  position: relative;
  padding-left: 22rpx;
  margin-top: 10rpx;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.5;
}
.fraud-line:first-child {
  margin-top: 0;
}
.fraud-line::before {
  content: "";
  position: absolute;
  left: 0;
  top: 14rpx;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: $rt-blue;
}
.fraud-foot {
  margin-top: 18rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid $rt-border;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.fraud-link {
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-blue;
}
.fraud-link.warn {
  color: $rt-primary;
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
