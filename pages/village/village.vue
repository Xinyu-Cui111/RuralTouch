<template>
  <view class="page" :class="{ elder: elderOn }">
    <page-hero brand-only compact variant="village" title="指尖善治" />

    <view v-if="elderOn" class="elder-bar">
      <text class="elder-bar-text">{{ elderBanner }}</text>
      <view
        class="elder-bar-btn"
        hover-class="elder-bar-press"
        :hover-stay-time="80"
        @click="onExitElder"
      >
        <text class="elder-bar-btn-text">{{ elderExitLabel }}</text>
      </view>
    </view>

    <view class="hero-motion enter">
      <rt-case-hero
        :mode="heroMode"
        :kicker="heroKicker"
        :title="heroTitle"
        :desc="heroDesc"
        :cta="heroCta"
        :flash="heroFlash"
        @primary="onHeroPrimary"
      />
    </view>

    <view
      v-if="homeMode !== 'say'"
      class="secondary-link"
      hover-class="secondary-press"
      :hover-stay-time="80"
      @click="goSubmit"
    >
      <text class="secondary-text">另有新事？去说事建档</text>
      <text class="secondary-arrow">›</text>
    </view>
    <view
      v-else-if="noticeUnread && !elderOn"
      class="ticker"
      hover-class="ticker-press"
      :hover-stay-time="80"
      @click="goPage('/pages/village/notice')"
    >
      <text class="ticker-text">{{ latestNoticeTitle }}</text>
      <text class="ticker-badge">{{
        noticeUnread > 99 ? "99+" : noticeUnread
      }}</text>
      <text class="ticker-arrow">通知</text>
    </view>

    <view v-if="elderOn" class="elder-paths">
      <view
        class="path"
        hover-class="path-press"
        :hover-stay-time="80"
        @click="goSubmit"
      >
        <text class="path-title">去说事</text>
        <text class="path-desc">把事情告诉村委</text>
      </view>
      <view
        class="path"
        hover-class="path-press"
        :hover-stay-time="80"
        @click="goRecord"
      >
        <text class="path-title">我的办件</text>
        <text class="path-desc">{{
          handlingCount ? `进行中 ${handlingCount} 件` : "查看进度"
        }}</text>
      </view>
      <view
        class="path"
        hover-class="path-press"
        :hover-stay-time="80"
        @click="onCallVillage"
      >
        <text class="path-title">联系村委</text>
        <text class="path-desc">电话沟通</text>
      </view>
    </view>

    <view v-if="!elderOn" class="svc-lite enter delay-1">
      <view class="svc-main">
        <view
          v-for="item in primaryServices"
          :key="item.title"
          class="svc-main-card"
          hover-class="svc-active"
          :hover-stay-time="80"
          @click="goPage(item.path)"
        >
          <text class="svc-title">{{ item.title }}</text>
          <text class="svc-desc">{{ item.desc }}</text>
          <text v-if="item.badge" class="svc-badge-inline">{{
            item.badge
          }}</text>
        </view>
      </view>
    </view>

    <rt-section
      v-if="!elderOn || disputes.length"
      title="我的调解"
      :badge="handlingBadge"
      :link="disputes.length ? '全部' : ''"
      @link="goRecord"
    >
      <rt-card compact elevated>
        <rt-skeleton v-if="loading" variant="case" :count="2" />
        <empty-state
          v-else-if="loadError"
          compact
          icon-type="dispute"
          icon-tone="green"
          title="加载失败"
          action-text="点击重试"
          @action="loadDisputes()"
        />
        <empty-state
          v-else-if="!disputes.length"
          compact
          icon-type="dispute"
          icon-tone="green"
          title="还没有办件"
          desc="有事可以说，AI 帮您整理成案"
          action-text="去说事"
          @action="goSubmit"
        />
        <view
          v-else
          v-for="(item, index) in disputes"
          :key="item._id"
          class="case-item"
          :class="{ last: index === disputes.length - 1 }"
          hover-class="case-active"
          :hover-stay-time="80"
          @click="goToDisputeDetail(item._id)"
        >
          <view class="case-top">
            <text class="case-title">{{ caseObj(item).title }}</text>
            <text class="case-tag" :class="caseObj(item).phaseTone">
              {{ caseObj(item).phaseLabel }}
            </text>
          </view>
          <text class="case-tip">{{ caseObj(item).oral }}</text>
        </view>
      </rt-card>
    </rt-section>

    <rt-trust-bar
      v-if="!elderOn"
      tip="人身安全请先求助；办件进度以村委更新为准"
    />
    <tab-bar />
  </view>
</template>

<script>
import TabBar from "@/components/tab-bar/bar.vue";
import PageHero from "@/components/page-hero/page-hero.vue";
import RtCard from "@/components/rt-card/rt-card.vue";
import RtSection from "@/components/rt-section/rt-section.vue";
import RtSkeleton from "@/components/rt-skeleton/rt-skeleton.vue";
import EmptyState from "@/components/empty-state/empty-state.vue";
import RtTrustBar from "@/components/rt-trust-bar/rt-trust-bar.vue";
import RtCaseHero from "@/components/rt-case-hero/rt-case-hero.vue";
import { api } from "@/api/index.js";
import { ensureLoggedIn, goAiAssistant } from "@/utils/auth.js";
import { isLoggedIn } from "@/utils/cloud.js";
import { countUnreadNotices } from "@/utils/notice-read.js";
import { writeTabBadges } from "@/utils/tab-badges.js";
import { goNavigate, goReLaunch } from "@/utils/nav.js";
import {
  isElderMode,
  maybeAskElderMode,
  exitElderMode,
} from "@/utils/elder-mode.js";
import {
  latestUnreadPush,
  markPushRead,
  syncCasePushFromDisputes,
} from "@/utils/case-push.js";
import { COPY } from "@/utils/copy-voice.js";
import { VILLAGE_CONTACT_PHONE } from "@/config/env.js";
import { buildCaseObject } from "@/utils/case-object.js";

export default {
  components: {
    TabBar,
    PageHero,
    RtCard,
    RtSection,
    RtSkeleton,
    EmptyState,
    RtTrustBar,
    RtCaseHero,
  },
  data() {
    return {
      elderOn: false,
      loading: true,
      loadError: false,
      disputes: [],
      handlingList: [],
      handlingCount: 0,
      noticeUnread: 0,
      latestNoticeTitle: "暂无新通知，点此查看村务公示",
      casePush: null,
      heroFlash: false,
      primaryServices: [
        {
          title: "我的办件",
          desc: "看看办到哪一步了",
          path: "/pages/village/records",
          badge: "",
        },
        { title: "问协办", desc: "先问清楚再去办", path: "__ai__", badge: "" },
        {
          title: "意见箱",
          desc: "有建议随时说",
          path: "/pages/village/feedback",
          badge: "",
        },
        {
          title: "村务通知",
          desc: "村里最新公示",
          path: "/pages/village/notice",
          badge: "",
        },
      ],
      serviceGroups: [],
    };
  },
  computed: {
    handlingBadge() {
      return this.handlingCount > 0 ? String(this.handlingCount) : "";
    },
    homeMode() {
      if (this.casePush) return "casePush";
      if (this.handlingCount > 0) return "handling";
      if (this.noticeUnread > 0 && !this.elderOn) return "notice";
      return "say";
    },
    heroMode() {
      if (this.homeMode === "casePush") return "push";
      if (this.homeMode === "handling") return "handling";
      if (this.homeMode === "notice") return "notice";
      return "say";
    },
    heroKicker() {
      if (this.homeMode === "casePush") return COPY.casePushPrefix;
      if (this.homeMode === "handling")
        return `进行中 · ${this.handlingCount} 件`;
      if (this.homeMode === "notice") return `未读通知 · ${this.noticeUnread}`;
      return COPY.homeKicker;
    },
    heroTitle() {
      if (this.homeMode === "casePush") return this.casePushTitle;
      if (this.homeMode === "handling") return this.latestHandlingTitle;
      if (this.homeMode === "notice") return COPY.homeNoticeTitle;
      return COPY.homeSayTitle;
    },
    heroDesc() {
      if (this.homeMode === "casePush") return this.casePushDesc;
      if (this.homeMode === "handling") {
        const d = this.handlingList[0];
        return buildCaseObject(d).oral;
      }
      if (this.homeMode === "notice") return this.latestNoticeTitle;
      return COPY.homeSayDesc;
    },
    heroCta() {
      if (this.homeMode === "casePush" || this.homeMode === "handling")
        return COPY.goProgress;
      if (this.homeMode === "notice") return "去看通知";
      return COPY.goSubmitShort;
    },
    latestHandlingTitle() {
      const d = this.handlingList[0];
      return (d && d.title) || "办理中的调解";
    },
    casePushTitle() {
      return (this.casePush && this.casePush.title) || "办件有新进展";
    },
    casePushDesc() {
      return (
        (this.casePush && this.casePush.message) ||
        "村委已更新办理状态，点此查看"
      );
    },
    elderBanner() {
      return COPY.elderBanner;
    },
    elderExitLabel() {
      return COPY.elderExit;
    },
  },
  async onShow() {
    this.elderOn = isElderMode();
    // 游客可先逛首页；说事/办件再登录
    this.refreshCasePush();
    this.loadDisputes();
    this.loadLatestNotice();
    const elder = await maybeAskElderMode();
    this.elderOn = elder;
  },
  onPullDownRefresh() {
    Promise.all([this.loadDisputes(true), this.loadLatestNotice()]).finally(
      () => {
        uni.stopPullDownRefresh();
      }
    );
  },
  methods: {
    onHeroPrimary() {
      if (this.homeMode === "casePush") return this.goCasePush();
      if (this.homeMode === "handling") return this.goLatestHandling();
      if (this.homeMode === "notice")
        return this.goPage("/pages/village/notice");
      return this.goSubmit();
    },
    onExitElder() {
      this.elderOn = exitElderMode();
    },
    onCallVillage() {
      const phone = VILLAGE_CONTACT_PHONE || "";
      if (!phone) {
        uni.showToast({ title: "暂未配置村委电话", icon: "none" });
        return;
      }
      uni.makePhoneCall({ phoneNumber: String(phone).replace(/\D/g, "") });
    },
    caseObj(item) {
      return buildCaseObject(item);
    },
    syncServiceBadges() {
      this.primaryServices = this.primaryServices.map((item) => {
        if (item.path === "/pages/village/records") {
          return {
            ...item,
            badge: this.handlingCount ? String(this.handlingCount) : "",
          };
        }
        if (item.path === "/pages/village/notice") {
          return {
            ...item,
            badge: this.noticeUnread
              ? String(this.noticeUnread > 99 ? "99+" : this.noticeUnread)
              : "",
          };
        }
        return item;
      });
    },
    triggerHeroFlash() {
      this.heroFlash = false;
      this.$nextTick(() => {
        this.heroFlash = true;
      });
    },
    async loadLatestNotice() {
      try {
        const res = await api.listNotices();
        const list = res.data.list || [];
        const first = list[0];
        if (first && first.title) this.latestNoticeTitle = first.title;
        this.noticeUnread = countUnreadNotices(list);
        this.syncServiceBadges();
        writeTabBadges({
          noticeUnread: this.noticeUnread,
          handling: this.handlingCount,
        });
      } catch (e) {
        /* keep */
      }
    },
    async loadDisputes(isRefresh = false) {
      // 游客不拉个人办件，避免「未登录」误报加载失败
      if (!isLoggedIn()) {
        this.loading = false;
        this.loadError = false;
        this.disputes = [];
        this.handlingList = [];
        this.handlingCount = 0;
        this.syncServiceBadges();
        return;
      }
      if (!isRefresh) this.loading = true;
      this.loadError = false;
      try {
        const res = await api.listDisputes();
        const list = res.data.list || [];
        this.handlingList = list.filter((d) => d && d.status !== "completed");
        this.handlingCount = this.handlingList.length;
        this.disputes = list.slice(0, 3);
        this.casePush = syncCasePushFromDisputes(list) || latestUnreadPush();
        this.syncServiceBadges();
        writeTabBadges({
          noticeUnread: this.noticeUnread,
          handling: this.handlingCount,
        });
        if (this.casePush) this.triggerHeroFlash();
      } catch (e) {
        this.loadError = !this.disputes.length;
        uni.showToast({ title: e.message || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    goToDisputeDetail(id) {
      goNavigate(`/pages/disputeDetail/disputeDetail?id=${id}`);
    },
    refreshCasePush() {
      this.casePush = latestUnreadPush();
    },
    goCasePush() {
      const p = this.casePush;
      if (!p) return;
      markPushRead(p.id);
      this.casePush = null;
      if (p.disputeId) this.goToDisputeDetail(p.disputeId);
      else this.goRecord();
    },
    goLatestHandling() {
      const d = this.handlingList[0];
      if (d && d._id) this.goToDisputeDetail(d._id);
      else this.goRecord();
    },
    goSubmit() {
      if (!ensureLoggedIn({ tip: "说事建档请先登录" })) return;
      goNavigate("/pages/village/submit");
    },
    goRecord() {
      if (!ensureLoggedIn({ tip: "查看办件请先登录" })) return;
      goNavigate("/pages/village/records");
    },
    goAi() {
      if (this.handlingList[0] && this.handlingList[0]._id) {
        const d = this.handlingList[0];
        uni.setStorageSync("rt_ai_dispute_ctx", {
          id: d._id,
          title: d.title,
          status: d.status,
          phase: d.phase,
          category: (d.aiMeta && d.aiMeta.category) || "",
          riskLevel: (d.aiMeta && d.aiMeta.riskLevel) || "",
          summary:
            (d.aiMeta && d.aiMeta.summary) || (d.content || "").slice(0, 160),
        });
        uni.setStorageSync(
          "rt_ai_prefill",
          `请根据我正在办理的「${d.title || "本案"}」说明下一步要注意什么`
        );
      }
      goAiAssistant();
    },
    goPage(path) {
      if (!path) return;
      if (path === "__ai__") {
        goAiAssistant();
        return;
      }
      if (
        path === "/pages/village/records" ||
        path === "/pages/village/feedback" ||
        path === "/pages/village/submit"
      ) {
        if (!ensureLoggedIn({ tip: "办理业务请先登录" })) return;
      }
      if (
        path === "/pages/law/law" ||
        path === "/pages/moral/moral" ||
        path === "/pages/group/group" ||
        path === "/pages/village/village" ||
        path === "/pages/profile/profile" ||
        path === "/pages/benefit/benefit"
      ) {
        goReLaunch(path);
        return;
      }
      goNavigate(path);
    },
    goSubmitWith(item) {
      if (!ensureLoggedIn({ tip: "说事建档请先登录" })) return;
      if (item && item.draft) setSubmitDraftText(item.draft, "law");
      goNavigate("/pages/village/submit");
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
  animation-delay: 0.08s;
}

.hero-motion {
  /* rise handled by .enter */
}

.elder-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
  padding: 18rpx 20rpx;
  min-height: 88rpx;
  border-radius: $rt-radius-sm;
  background: rgba(158, 52, 40, 0.08);
  border: 1rpx solid rgba(158, 52, 40, 0.22);
  box-sizing: border-box;
}
.elder-bar-text {
  flex: 1;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-text;
}
.elder-bar-btn {
  flex-shrink: 0;
  min-height: 64rpx;
  padding: 12rpx 22rpx;
  border-radius: 999rpx;
  background: $rt-primary;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.elder-bar-press {
  opacity: 0.9;
}
.elder-bar-btn-text {
  font-size: $rt-type-caption;
  font-weight: 800;
  color: #fff;
}

.ticker {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
  padding: 16rpx 18rpx;
  min-height: $rt-touch-min;
  border-radius: $rt-radius-sm;
  background: rgba(255, 255, 255, 0.7);
  border: 1rpx solid rgba(90, 107, 56, 0.14);
  box-sizing: border-box;
}
.ticker-press {
  opacity: 0.92;
}
.ticker-text {
  flex: 1;
  min-width: 0;
  font-size: $rt-type-caption;
  font-weight: 600;
  color: $rt-text-secondary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ticker-arrow {
  flex-shrink: 0;
  font-size: $rt-type-micro;
  font-weight: 700;
  color: $rt-olive;
}
.ticker-badge {
  flex-shrink: 0;
  min-width: 32rpx;
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
  background: rgba(158, 52, 40, 0.12);
  color: $rt-primary;
  font-size: 20rpx;
  font-weight: 800;
  text-align: center;
}

.primary-card {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 36rpx 32rpx 28rpx;
  border-radius: $rt-radius-md;
  background: linear-gradient(145deg, #ffffff 0%, #fff8f6 35%, #f6d9d3 100%);
  border: 1rpx solid rgba(158, 52, 40, 0.16);
  box-shadow: $rt-shadow-card, 0 12rpx 36rpx rgba(158, 52, 40, 0.1);
  margin-bottom: 16rpx;
}
.primary-card.continue {
  background: linear-gradient(145deg, #ffffff 0%, #f7f9f1 40%, #e7edd8 100%);
  border-color: rgba(90, 107, 56, 0.2);
  box-shadow: $rt-shadow-card, 0 12rpx 36rpx rgba(90, 107, 56, 0.1);
}
.primary-card.notice {
  background: linear-gradient(145deg, #ffffff 0%, #eef1f6 40%, #dde4ee 100%);
  border-color: rgba(58, 74, 99, 0.2);
  box-shadow: $rt-shadow-card, 0 12rpx 36rpx rgba(58, 74, 99, 0.1);
}
.primary-press {
  opacity: 0.94;
}
.primary-kicker {
  display: block;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-primary;
  letter-spacing: 2rpx;
}
.continue .primary-kicker {
  color: $rt-olive;
}
.notice .primary-kicker {
  color: $rt-blue;
}
.primary-title {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: $rt-text;
  line-height: 1.25;
}
.primary-desc {
  display: block;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.5;
}
.primary-cta {
  margin-top: 12rpx;
  width: 100%;
  min-height: $rt-touch-min;
  padding: 24rpx 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $rt-primary-dark, $rt-primary-mid);
  box-shadow: 0 8rpx 20rpx rgba(158, 52, 40, 0.28);
  text-align: center;
  box-sizing: border-box;
}
.continue .primary-cta {
  background: linear-gradient(135deg, #4a5532, $rt-olive-mid);
  box-shadow: 0 8rpx 20rpx rgba(90, 107, 56, 0.28);
}
.notice .primary-cta {
  background: linear-gradient(135deg, #2a3648, $rt-blue);
  box-shadow: 0 8rpx 20rpx rgba(58, 74, 99, 0.28);
}
.primary-cta-text {
  font-size: $rt-type-body;
  font-weight: 800;
  color: #fff;
}

.secondary-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
  padding: 22rpx 24rpx;
  min-height: $rt-touch-min;
  border-radius: $rt-radius-sm;
  background: $rt-surface;
  border: 1rpx solid $rt-border;
  box-sizing: border-box;
}
.secondary-press {
  opacity: 0.92;
}
.secondary-text {
  font-size: $rt-type-body;
  font-weight: 600;
  color: $rt-text;
}
.secondary-arrow {
  font-size: 36rpx;
  color: $rt-text-muted;
  line-height: 1;
}

.svc-lite {
  margin-bottom: $rt-section-gap;
}
.svc-main {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}
.svc-main-card {
  position: relative;
  min-height: 128rpx;
  padding: 28rpx 24rpx;
  border-radius: $rt-radius-md;
  background: #fff;
  border: 1rpx solid rgba(50, 40, 30, 0.06);
  box-shadow: $rt-shadow-sm;
  box-sizing: border-box;
}
.svc-active {
  opacity: 0.92;
  transform: scale(0.99);
}
.svc-title {
  display: block;
  font-family: $rt-font-title;
  font-size: $rt-type-body;
  font-weight: 800;
  color: $rt-text;
}
.svc-desc {
  display: block;
  margin-top: 8rpx;
  font-size: $rt-type-micro;
  color: $rt-text-secondary;
  line-height: 1.4;
}
.svc-badge-inline {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  min-width: 32rpx;
  padding: 0 10rpx;
  height: 32rpx;
  line-height: 32rpx;
  border-radius: 999rpx;
  background: $rt-primary-soft;
  color: $rt-primary;
  font-size: 20rpx;
  font-weight: 800;
  text-align: center;
}

.svc-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}
.svc-block {
  position: relative;
  min-height: 120rpx;
  padding: 28rpx 24rpx;
  border-radius: $rt-radius-md;
  background: $rt-surface;
  border: 1rpx solid rgba(90, 107, 56, 0.14);
  box-shadow: $rt-shadow-sm;
  box-sizing: border-box;
}
.svc-active {
  opacity: 0.92;
  background: $rt-olive-soft;
}
.svc-title {
  display: block;
  font-size: 32rpx;
  font-weight: 800;
  color: $rt-text;
  line-height: 1.3;
}
.svc-desc {
  display: block;
  margin-top: 8rpx;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
}
.svc-badge-inline {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  min-width: 28rpx;
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
  background: $rt-primary;
  color: #fff;
  font-size: 18rpx;
  font-weight: 800;
  text-align: center;
}

.case-item {
  padding: 22rpx 0;
  border-bottom: 1rpx solid $rt-border;
}
.case-item.last {
  border-bottom: none;
  padding-bottom: 4rpx;
}
.case-active {
  background: rgba(90, 107, 56, 0.05);
}
.case-top {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  align-items: flex-start;
}
.case-title {
  flex: 1;
  font-size: $rt-type-title;
  font-weight: 800;
  color: $rt-text;
  line-height: 1.35;
}
.case-tag {
  @include rt-status-pending;
  flex-shrink: 0;
}
.case-tag.done {
  @include rt-status-done;
}
.case-tag.urgent {
  background: rgba(158, 52, 40, 0.12);
  color: $rt-primary;
}
.case-meta {
  display: block;
  margin: 8rpx 0 6rpx;
  font-size: $rt-type-micro;
  color: $rt-text-muted;
}
.case-tip {
  display: block;
  margin-bottom: 14rpx;
  font-size: $rt-type-caption;
  font-weight: 600;
  color: $rt-primary-dark;
  line-height: 1.4;
}
</style>

.elder-paths { display: flex; flex-direction: column; gap: 12rpx; margin-bottom:
28rpx; } .path { padding: 28rpx 24rpx; min-height: 100rpx; border-radius: 16rpx;
background: #fff; border: 1rpx solid rgba(158, 52, 40, 0.16); box-sizing:
border-box; } .path-press { opacity: 0.92; } .path-title { display: block;
font-size: 34rpx; font-weight: 800; color: #2a2118; } .path-desc { display:
block; margin-top: 6rpx; font-size: 26rpx; color: #6b5e52; }
