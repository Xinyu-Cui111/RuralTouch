<template>
  <view class="page">
    <rt-nav-bar title="调解员工作台">
      <template #right>
        <text class="nav-link" @click="goQuality">AI 质量</text>
      </template>
    </rt-nav-bar>
    <view class="workbench-head">
      <text class="wb-sub">{{ workbenchLine }}</text>
    </view>

    <view class="tabs">
      <text
        class="tab"
        :class="{ active: tab === 'disputes' }"
        @click="tab = 'disputes'"
        >调解队列</text
      >
      <text
        class="tab"
        :class="{ active: tab === 'morals' }"
        @click="tab = 'morals'"
        >积分审核</text
      >
      <text
        class="tab"
        :class="{ active: tab === 'feedbacks' }"
        @click="switchFeedback"
        >意见箱</text
      >
    </view>

    <view v-if="tab === 'disputes'">
      <view v-if="!loading" class="today-board">
        <view class="today-head">
          <view class="today-titles">
            <text class="today-kicker">工作台</text>
            <text class="today-title">今日必办</text>
          </view>
          <view class="today-num-wrap" :class="{ empty: !queueCounts.today }">
            <text class="today-num">{{ queueCounts.today }}</text>
            <text class="today-unit">件</text>
          </view>
        </view>
        <view class="today-viz">
          <view class="viz-track">
            <view
              v-if="queueCounts.overdue"
              class="viz-seg overdue"
              :style="{ flexGrow: queueCounts.overdue }"
            />
            <view
              v-if="queueCounts.pending"
              class="viz-seg pending"
              :style="{ flexGrow: queueCounts.pending }"
            />
            <view
              v-if="queueCounts.high"
              class="viz-seg high"
              :style="{ flexGrow: queueCounts.high }"
            />
          </view>
          <view class="viz-legend">
            <text class="leg overdue">超期 {{ queueCounts.overdue }}</text>
            <text class="leg pending">待受理 {{ queueCounts.pending }}</text>
            <text class="leg high">高风险 {{ queueCounts.high }}</text>
          </view>
        </view>
        <view
          v-if="todayPreview.length"
          class="today-focus"
          hover-class="press"
          :hover-stay-time="80"
          @click="focusToday"
        >
          <text class="focus-label">优先处理</text>
          <text class="focus-title">{{ caseTitle(todayPreview[0]) }}</text>
          <text class="focus-meta"
            >{{ adminLabelOf(todayPreview[0]) }} ·
            {{ oralOf(todayPreview[0]) }}</text
          >
        </view>
        <text v-else class="today-empty">今日暂无必办，可看下方全部队列</text>
      </view>

      <view class="sub-tabs">
        <text
          v-for="q in queueTabs"
          :key="q.key"
          class="sub-tab"
          :class="{ active: disputeQueue === q.key }"
          @click="disputeQueue = q.key"
          >{{ q.label }} {{ q.count }}</text
        >
      </view>
      <rt-skeleton v-if="loading" variant="case" :count="3" />
      <empty-state
        v-else-if="loadError"
        icon-type="dispute"
        icon-tone="green"
        title="加载失败"
        desc="请检查网络后重试"
        action-text="点击重试"
        @action="loadDisputes()"
      />
      <empty-state
        v-else-if="!filteredDisputes.length"
        icon-type="dispute"
        icon-tone="green"
        title="暂无纠纷"
        desc="村民提交纠纷后将出现在此处"
      />
      <rt-card
        v-for="item in filteredDisputes"
        :key="item._id"
        compact
        elevated
        :tone="ticketTone(item)"
        class="ticket-card"
        :class="{ flash: flashId === item._id }"
      >
        <view class="card-head">
          <text class="title">{{ caseTitle(item) }}</text>
          <text class="phase-pill">{{ adminLabelOf(item) }}</text>
        </view>
        <view class="sla-row" v-if="slaBadges(item).length">
          <text
            v-for="(b, bi) in slaBadges(item)"
            :key="bi"
            class="sla-badge"
            :class="b.tone"
            >{{ b.text }}</text
          >
        </view>
        <text class="villager-tip">{{ oralOf(item) }}</text>
        <text v-if="contactOf(item)" class="contact-tip">{{
          contactOf(item)
        }}</text>
        <view v-if="citizenFlags(item) || urged(item)" class="citizen-flags">
          <text v-if="urged(item)" class="c-flag urge">村民催办</text>
          <text v-if="hasExtra(item)" class="c-flag">有补充材料</text>
          <text v-if="ratingOf(item)" class="c-flag rate"
            >评价 {{ ratingOf(item) }} 星</text
          >
        </view>

        <view class="advance-row">
          <button
            v-if="nextAdvanceOf(item)"
            class="adv-btn"
            size="mini"
            @click="advance(item, nextAdvanceOf(item))"
          >
            {{ primaryAdvanceLabel(item) }}
          </button>
          <button class="adv-btn ghost" size="mini" @click="goDetail(item._id)">
            详情
          </button>
          <button class="adv-btn ghost" size="mini" @click="openMore(item)">
            更多
          </button>
        </view>
        <text v-if="nextAdvanceOf(item)" class="advance-hint">{{
          adminAdvanceLabel(nextAdvanceOf(item))
        }}</text>
      </rt-card>
    </view>

    <view v-else-if="tab === 'morals'">
      <rt-skeleton v-if="moralLoading" variant="lines" :rows="4" />
      <empty-state
        v-else-if="moralError"
        icon-type="moral"
        icon-tone="green"
        title="加载失败"
        action-text="点击重试"
        @action="loadMorals()"
      />
      <empty-state
        v-else-if="!morals.length"
        icon-type="moral"
        icon-tone="green"
        title="暂无待审核申报"
        desc="村民提交积分申报后将出现在此处"
      />
      <rt-card v-for="item in morals" :key="item._id" compact elevated>
        <text class="title">{{ item.title }}</text>
        <text class="meta"
          >{{ item.createTimeText }} · {{ item.points }} 分</text
        >
        <view class="advance-row">
          <button class="adv-btn" size="mini" @click="reviewMoral(item, true)">
            通过
          </button>
          <button
            class="adv-btn ghost"
            size="mini"
            @click="reviewMoral(item, false)"
          >
            驳回
          </button>
        </view>
      </rt-card>
    </view>

    <view v-else>
      <rt-skeleton v-if="fbLoading" variant="lines" :rows="4" />
      <empty-state
        v-else-if="fbError"
        icon-type="feedback"
        icon-tone="green"
        title="加载失败"
        action-text="点击重试"
        @action="loadFeedbacks()"
      />
      <empty-state
        v-else-if="!feedbacks.length"
        icon-type="feedback"
        icon-tone="green"
        title="暂无村务意见"
        desc="村民在意见箱提交后会出现在此处"
      />
      <rt-card
        v-for="item in feedbacks"
        :key="item._id"
        compact
        elevated
        class="fb-card"
      >
        <view class="card-head">
          <text class="title"
            >{{ item.nickname || "村民" }} ·
            {{ item.village || "示范村" }}</text
          >
          <text class="phase-pill">{{ item.statusLabel }}</text>
        </view>
        <text class="meta"
          >{{ item.createTimeText
          }}{{ item.contact ? " · " + item.contact : "" }}</text
        >
        <text class="content">{{ item.content }}</text>
        <view v-if="item.reply" class="fb-reply">
          <text class="fb-reply-label">已答复</text>
          <text class="content">{{ item.reply }}</text>
        </view>
        <view class="advance-row">
          <button
            v-if="item.status !== 'closed'"
            class="adv-btn"
            size="mini"
            @click="replyFeedback(item, false)"
          >
            答复
          </button>
          <button
            v-if="item.status === 'pending'"
            class="adv-btn ghost"
            size="mini"
            @click="replyFeedback(item, true)"
          >
            答复并关闭
          </button>
        </view>
      </rt-card>
    </view>
  </view>
</template>

<script>
import EmptyState from "@/components/empty-state/empty-state.vue";
import RtCard from "@/components/rt-card/rt-card.vue";
import RtProgressSteps from "@/components/rt-progress-steps/rt-progress-steps.vue";
import RtSkeleton from "@/components/rt-skeleton/rt-skeleton.vue";
import { api } from "@/api/index.js";
import { getLocalUser } from "@/utils/cloud.js";
import {
  hasCitizenExtra,
  citizenRatingStars,
} from "@/utils/dispute-citizen.js";
import {
  WORKFLOW_STEPS,
  adminLabelOf,
  nextAdvanceOf,
  stepOfDispute,
  normalizePhase,
  adminAdvanceLabel,
  tipOfDispute,
  isOverdueDispute,
  isHighRiskDispute,
  isTodayMustDo,
  slaScore,
  PHASE,
} from "@/utils/dispute-workflow.js";
import { pushAdvanceNotice } from "@/utils/case-push.js";
import { oralStatusLine } from "@/utils/case-timeline.js";
import {
  setNextContact,
  getNextContact,
  formatNextContact,
} from "@/utils/case-contact.js";
import { hasUrge, markUrgeHandled, countOpenUrges } from "@/utils/urge.js";
import { scriptChoices } from "@/utils/admin-scripts.js";
import { caseTitleOf, caseOralLine } from "@/utils/case-object.js";
import { adminTicketTone } from "@/utils/color-semantic.js";
import { COPY } from "@/utils/copy-voice.js";

export default {
  components: { EmptyState, RtCard, RtProgressSteps, RtSkeleton },
  data() {
    return {
      tab: "disputes",
      disputeQueue: "today",
      loading: true,
      loadError: false,
      moralLoading: true,
      moralError: false,
      fbLoading: false,
      fbError: false,
      disputes: [],
      morals: [],
      feedbacks: [],
      workflowSteps: WORKFLOW_STEPS,
      urgeTick: 0,
      flashId: "",
    };
  },
  computed: {
    counts() {
      const pending = this.disputes.filter(
        (d) => normalizePhase(d) === PHASE.SUBMITTED
      ).length;
      const handling = this.disputes.filter((d) => {
        const p = normalizePhase(d);
        return p === PHASE.ACCEPTED || p === PHASE.HANDLING;
      }).length;
      const escalate = this.disputes.filter(
        (d) =>
          d.aiMeta && d.aiMeta.escalate && normalizePhase(d) !== PHASE.COMPLETED
      ).length;
      return { pending, handling, escalate };
    },
    feedbackPending() {
      return this.feedbacks.filter((f) => f.status === "pending").length;
    },
    queueCounts() {
      return {
        today: this.disputes.filter((d) => isTodayMustDo(d)).length,
        all: this.disputes.length,
        pending: this.disputes.filter(
          (d) => normalizePhase(d) === PHASE.SUBMITTED
        ).length,
        overdue: this.disputes.filter((d) => isOverdueDispute(d)).length,
        high: this.disputes.filter((d) => isHighRiskDispute(d)).length,
      };
    },
    queueTabs() {
      const c = this.queueCounts;
      return [
        { key: "today", label: "今日必办", count: c.today },
        { key: "all", label: "全部", count: c.all },
        { key: "pending", label: "待受理", count: c.pending },
        { key: "overdue", label: "超期", count: c.overdue },
        { key: "high", label: "高风险", count: c.high },
      ];
    },
    todayList() {
      return this.sortedDisputes.filter((d) => isTodayMustDo(d));
    },
    todayPreview() {
      return this.todayList.slice(0, 1);
    },
    sortedDisputes() {
      return [...this.disputes].sort((a, b) => {
        const as = slaScore(a);
        const bs = slaScore(b);
        if (bs !== as) return bs - as;
        return (b.createTime || 0) - (a.createTime || 0);
      });
    },
    filteredDisputes() {
      const list = this.sortedDisputes;
      if (this.disputeQueue === "today") {
        return list.filter((d) => isTodayMustDo(d));
      }
      if (this.disputeQueue === "pending") {
        return list.filter((d) => normalizePhase(d) === PHASE.SUBMITTED);
      }
      if (this.disputeQueue === "overdue") {
        return list.filter((d) => isOverdueDispute(d));
      }
      if (this.disputeQueue === "high") {
        return list.filter((d) => isHighRiskDispute(d));
      }
      return list;
    },
    urgeOpen() {
      void this.urgeTick;
      return countOpenUrges();
    },
    workbenchLine() {
      return `${COPY.adminWorkbench} · 催办 ${this.urgeOpen} · 待受理 ${this.counts.pending} · 办理中 ${this.counts.handling} · 升级 ${this.counts.escalate}`;
    },
  },
  onShow() {
    const user = getLocalUser();
    if (!user || !user.isAdmin) {
      uni.showModal({
        title: "无权限",
        content:
          "仅管理员可访问。请在云函数环境变量 ADMIN_OPENIDS 配置您的 OpenID，或在数据库 rt_users 设置 isAdmin: true",
        showCancel: false,
        success: () => uni.navigateBack(),
      });
      return;
    }
    this.urgeTick += 1;
    this.loadDisputes();
    this.loadMorals();
    this.loadFeedbacks();
  },
  onPullDownRefresh() {
    Promise.all([
      this.loadDisputes(true),
      this.loadMorals(true),
      this.loadFeedbacks(true),
    ]).finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    adminLabelOf,
    nextAdvanceOf,
    stepOfDispute,
    adminAdvanceLabel,
    tipOfDispute,
    hasExtra: hasCitizenExtra,
    ratingOf: citizenRatingStars,
    citizenFlags(item) {
      return hasCitizenExtra(item) || citizenRatingStars(item) > 0;
    },
    urged(item) {
      void this.urgeTick;
      return hasUrge(item && item._id);
    },
    oralOf(item) {
      return caseOralLine(item) || tipOfDispute(item);
    },
    caseTitle(item) {
      return caseTitleOf(item);
    },
    ticketTone(item) {
      return adminTicketTone({
        urged: this.urged(item),
        overdue: isOverdueDispute(item),
        highRisk: isHighRiskDispute(item),
      });
    },
    primaryAdvanceLabel(item) {
      const k = nextAdvanceOf(item);
      if (k === "accept") return "受理接案";
      if (k === "handle") return "进入办理";
      if (k === "complete") return "确认办结";
      return "推进";
    },
    openMore(item) {
      const list = ["附说明推进", "一键话术", "标 Badcase", "查看详情"];
      if (this.urged(item)) list.splice(3, 0, "催办已阅");
      uni.showActionSheet({
        itemList: list,
        success: (r) => {
          const label = list[r.tapIndex];
          if (label === "附说明推进") this.openNote(item);
          else if (label === "一键话术") this.pickScript(item);
          else if (label === "标 Badcase") this.markBadcase(item);
          else if (label === "催办已阅") this.clearUrge(item);
          else if (label === "查看详情") this.goDetail(item._id);
        },
      });
    },
    playFlash(id) {
      this.flashId = id;
      setTimeout(() => {
        if (this.flashId === id) this.flashId = "";
      }, 650);
    },
    contactOf(item) {
      void this.urgeTick;
      return formatNextContact(getNextContact(item && item._id));
    },
    slaBadges(item) {
      // 顶栏已表达「今日必办」，卡面只留超期/高风险，减少扫徽章
      const badges = [];
      if (isOverdueDispute(item)) badges.push({ text: "超期", tone: "danger" });
      if (isHighRiskDispute(item))
        badges.push({ text: "高风险", tone: "warn" });
      return badges;
    },
    focusToday() {
      this.disputeQueue = "today";
    },
    pickScript(item) {
      const next = nextAdvanceOf(item) || "handle";
      const list = scriptChoices(next);
      if (!list.length) {
        uni.showToast({ title: "暂无话术", icon: "none" });
        return;
      }
      uni.showActionSheet({
        itemList: list.map(
          (t, i) => `${i + 1}. ${t.slice(0, 22)}${t.length > 22 ? "…" : ""}`
        ),
        success: async (r) => {
          const note = list[r.tapIndex] || list[0];
          try {
            await api.adminUpdateDispute({
              id: item._id,
              advance: next,
              note,
            });
            pushAdvanceNotice(item, next, note, null);
            this.playFlash(item._id);
            uni.showToast({ title: "已用话术推进", icon: "success" });
            this.loadDisputes();
          } catch (err) {
            uni.showToast({ title: err.message || "推进失败", icon: "none" });
          }
        },
      });
    },
    clearUrge(item) {
      markUrgeHandled(item && item._id);
      this.urgeTick += 1;
      this.playFlash(item && item._id);
      uni.showToast({ title: "催办已阅", icon: "success" });
    },
    switchFeedback() {
      this.tab = "feedbacks";
      this.loadFeedbacks();
    },
    async loadDisputes(isRefresh = false) {
      if (!isRefresh) this.loading = true;
      this.loadError = false;
      try {
        const res = await api.adminListDisputes();
        this.disputes = res.data.list || [];
      } catch (e) {
        this.loadError = !this.disputes.length;
        uni.showToast({ title: e.message || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    async loadMorals(isRefresh = false) {
      if (!isRefresh) this.moralLoading = true;
      this.moralError = false;
      try {
        const res = await api.adminListPendingMorals();
        this.morals = res.data.list || [];
      } catch (e) {
        this.moralError = !this.morals.length;
        uni.showToast({ title: e.message || "积分审核加载失败", icon: "none" });
      } finally {
        this.moralLoading = false;
      }
    },
    async loadFeedbacks(isRefresh = false) {
      if (!isRefresh) this.fbLoading = true;
      this.fbError = false;
      try {
        const res = await api.adminListFeedbacks();
        this.feedbacks = res.data.list || [];
      } catch (e) {
        this.fbError = !this.feedbacks.length;
        uni.showToast({ title: e.message || "意见箱加载失败", icon: "none" });
      } finally {
        this.fbLoading = false;
      }
    },
    replyFeedback(item, close) {
      uni.showModal({
        title: close ? "答复并关闭" : "答复意见",
        editable: true,
        placeholderText: "请输入答复内容",
        success: async (r) => {
          if (!r.confirm) return;
          const reply = String(r.content || "").trim();
          if (!reply) {
            uni.showToast({ title: "请填写答复", icon: "none" });
            return;
          }
          try {
            await api.adminReplyFeedback({
              id: item._id,
              reply,
              close: !!close,
            });
            uni.showToast({ title: "已答复", icon: "success" });
            this.loadFeedbacks();
          } catch (err) {
            uni.showToast({ title: err.message || "答复失败", icon: "none" });
          }
        },
      });
    },
    async advance(item, advanceKey) {
      const titleMap = {
        accept: "确认受理接案？",
        handle: "确认进入办理？",
        complete: "确认办结？办结将给当事人记 30 积分激励",
      };
      const ok = await new Promise((resolve) => {
        uni.showModal({
          title: titleMap[advanceKey] || "确认推进",
          content: `${item.title}\n${adminAdvanceLabel(advanceKey)}`,
          success: (r) => resolve(r.confirm),
        });
      });
      if (!ok) return;

      let nextContact = null;
      if (advanceKey !== "complete") {
        const when = await new Promise((resolve) => {
          uni.showModal({
            title: "下次沟通时间（可选）",
            editable: true,
            placeholderText: "如：明日上午 / 本周五电话",
            success: (r) =>
              resolve(r.confirm ? String(r.content || "").trim() : null),
          });
        });
        if (when === null) return;
        let how = "";
        if (when) {
          how = await new Promise((resolve) => {
            uni.showActionSheet({
              itemList: ["电话", "上门", "微信", "村委现场"],
              success: (r) =>
                resolve(
                  ["电话", "上门", "微信", "村委现场"][r.tapIndex] || "电话"
                ),
              fail: () => resolve("电话"),
            });
          });
          nextContact = { when, how };
          setNextContact(item._id, nextContact);
        }
      }

      try {
        await api.adminUpdateDispute({
          id: item._id,
          advance: advanceKey,
          note: nextContact
            ? `下次沟通：${nextContact.when}（${nextContact.how}）`
            : "",
        });
        pushAdvanceNotice(item, advanceKey, "", nextContact);
        if (hasUrge(item._id)) markUrgeHandled(item._id);
        this.urgeTick += 1;
        this.playFlash(item._id);
        uni.showToast({ title: "已推进，村民可见", icon: "success" });
        this.loadDisputes();
      } catch (err) {
        uni.showToast({ title: err.message || "推进失败", icon: "none" });
      }
    },
    openNote(item) {
      const next = nextAdvanceOf(item);
      if (!next) {
        uni.showToast({ title: "本案已办结", icon: "none" });
        return;
      }
      uni.showModal({
        title: "附加说明 + 下次沟通",
        editable: true,
        placeholderText: "如：已约明日上门核实",
        success: async (r) => {
          if (!r.confirm) return;
          try {
            const note = r.content || "";
            if (note) setNextContact(item._id, { when: note, how: "说明" });
            await api.adminUpdateDispute({
              id: item._id,
              advance: next,
              note,
            });
            pushAdvanceNotice(
              item,
              next,
              note,
              note ? { when: note, how: "说明" } : null
            );
            if (hasUrge(item._id)) markUrgeHandled(item._id);
            this.urgeTick += 1;
            uni.showToast({ title: "已推进，村民可见", icon: "success" });
            this.loadDisputes();
          } catch (err) {
            uni.showToast({ title: err.message || "推进失败", icon: "none" });
          }
        },
      });
    },
    markBadcase(item) {
      uni.showModal({
        title: "标 Badcase · 现象",
        editable: true,
        placeholderText: "例：分类错成邻里 / 漏升级",
        success: async (r) => {
          if (!r.confirm || !(r.content || "").trim()) return;
          try {
            await api.adminCreateBadcase({
              disputeId: item._id,
              title: item.title,
              phenomenon: String(r.content).trim(),
              got: item.aiMeta
                ? `${item.aiMeta.categoryLabel || ""} / ${
                    item.aiMeta.riskLabel || ""
                  }`
                : "",
              action: "待改规则/FAQ",
            });
            try {
              const key = "rt_badcase_local";
              const prev = uni.getStorageSync(key);
              const list = Array.isArray(prev) ? prev : [];
              list.unshift({
                id: `bc_${Date.now()}`,
                disputeId: item._id,
                phenomenon: String(r.content).trim(),
                at: Date.now(),
              });
              uni.setStorageSync(key, list.slice(0, 50));
            } catch (e) {
              /* ignore */
            }
            uni.showToast({ title: "已记录，回流质量看板", icon: "success" });
          } catch (err) {
            uni.showToast({ title: err.message || "失败", icon: "none" });
          }
        },
      });
    },
    async reviewMoral(item, approve) {
      try {
        await api.adminApproveMoral({ recordId: item._id, approve });
        uni.showToast({
          title: approve ? "已通过" : "已驳回",
          icon: "success",
        });
        this.loadMorals();
      } catch (err) {
        uni.showToast({ title: err.message || "操作失败", icon: "none" });
      }
    },
    goDetail(id) {
      uni.navigateTo({ url: `/pages/disputeDetail/disputeDetail?id=${id}` });
    },
    goQuality() {
      uni.navigateTo({ url: "/pages/admin/ai-quality" });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.page {
  @include rt-page;
  padding: $rt-page-x;
  padding-bottom: 80rpx;
}

.nav-link {
  font-size: 24rpx;
  font-weight: 700;
  color: $rt-accent-dark;
  padding: 8rpx 4rpx;
}

.ticket-card.flash {
  animation: ticket-flash 0.65s ease-out;
}
@keyframes ticket-flash {
  0% {
    box-shadow: 0 0 0 0 rgba(90, 107, 56, 0.28);
  }
  45% {
    box-shadow: 0 0 0 10rpx rgba(90, 107, 56, 0.1);
  }
  100% {
    box-shadow: none;
  }
}

.wb-sub {
  display: block;
  font-size: 24rpx;
  color: $rt-text-muted;
  line-height: 1.45;
}

.today-board {
  margin-bottom: 20rpx;
  padding: 28rpx 28rpx 24rpx;
  border-radius: $rt-radius-lg;
  background: #fff;
  border: 1rpx solid rgba(50, 40, 30, 0.06);
  box-shadow: $rt-shadow-sm;
}
.today-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16rpx;
}
.today-kicker {
  display: block;
  font-size: 22rpx;
  font-weight: 700;
  color: $rt-text-muted;
  letter-spacing: 2rpx;
}
.today-title {
  display: block;
  margin-top: 4rpx;
  font-family: $rt-font-title;
  font-size: $rt-type-title;
  font-weight: 800;
  color: $rt-text;
}
.today-num-wrap {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  background: rgba(158, 52, 40, 0.08);
}
.today-num-wrap.empty {
  background: rgba(90, 107, 56, 0.08);
}
.today-num {
  font-family: $rt-font-title;
  font-size: 48rpx;
  font-weight: 800;
  color: $rt-primary-dark;
  line-height: 1;
}
.today-num-wrap.empty .today-num {
  color: $rt-olive;
}
.today-unit {
  font-size: 22rpx;
  font-weight: 700;
  color: $rt-text-muted;
}
.today-viz {
  margin-top: 20rpx;
}
.viz-track {
  display: flex;
  height: 12rpx;
  border-radius: 999rpx;
  overflow: hidden;
  background: rgba(50, 40, 30, 0.06);
}
.viz-seg {
  height: 100%;
  min-width: 8rpx;
  flex-basis: 0;
}
.viz-seg.overdue {
  background: $rt-primary-mid;
}
.viz-seg.pending {
  background: $rt-olive;
}
.viz-seg.high {
  background: #b86b35;
}
.viz-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 24rpx;
  margin-top: 12rpx;
}
.leg {
  font-size: 22rpx;
  font-weight: 600;
  color: $rt-text-muted;
}
.leg.overdue {
  color: $rt-primary-mid;
}
.leg.pending {
  color: $rt-olive;
}
.leg.high {
  color: #b86b35;
}
.today-focus {
  margin-top: 20rpx;
  padding: 20rpx;
  border-radius: $rt-radius-md;
  background: rgba(158, 52, 40, 0.05);
  border: 1rpx solid rgba(158, 52, 40, 0.12);
}
.press {
  opacity: 0.92;
}
.focus-label {
  display: block;
  font-size: 22rpx;
  font-weight: 700;
  color: $rt-primary-mid;
}
.focus-title {
  display: block;
  margin-top: 6rpx;
  font-size: $rt-type-body;
  font-weight: 800;
  color: $rt-text;
}
.focus-meta {
  display: block;
  margin-top: 6rpx;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.today-empty {
  display: block;
  margin-top: 16rpx;
  font-size: $rt-type-caption;
  color: $rt-text-muted;
}

.tabs {
  @include rt-tabs;
}

.tab {
  font-size: 28rpx;
  color: $rt-text-muted;
  padding-bottom: 16rpx;
  border-bottom: 4rpx solid transparent;
  font-weight: 500;
}

.tab.active {
  color: $rt-accent-dark;
  font-weight: 700;
  border-bottom-color: $rt-accent;
}

.sub-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.sub-tab {
  font-size: 24rpx;
  color: $rt-text-muted;
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: $rt-surface;
  border: 1rpx solid rgba(201, 162, 74, 0.2);
  font-weight: 600;
}

.sub-tab.active {
  color: $rt-accent-dark;
  font-weight: 800;
  background: $rt-accent-soft;
  border-color: rgba(201, 162, 74, 0.45);
}

.sla-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 8rpx;
}
.sla-badge {
  font-size: 20rpx;
  font-weight: 800;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(90, 107, 56, 0.1);
  color: #5a6b38;
}
.sla-badge.danger {
  background: rgba(198, 40, 40, 0.12);
  color: #c62828;
}
.sla-badge.warn {
  background: rgba(201, 162, 74, 0.2);
  color: $rt-accent-dark;
}
.sla-badge.primary {
  background: rgba(178, 34, 34, 0.1);
  color: $rt-primary;
}
.sla-badge.muted {
  background: rgba(0, 0, 0, 0.06);
  color: $rt-text-muted;
}

.villager-tip {
  display: block;
  font-size: 22rpx;
  color: $rt-text-secondary;
  line-height: 1.45;
  margin-bottom: 8rpx;
}
.contact-tip {
  display: block;
  font-size: 22rpx;
  font-weight: 700;
  color: $rt-primary-mid;
  line-height: 1.4;
  margin-bottom: 8rpx;
}
.c-flag.urge {
  background: rgba(198, 40, 40, 0.12);
  color: #c62828;
}

.advance-hint {
  display: block;
  margin-top: 10rpx;
  font-size: 20rpx;
  color: $rt-text-muted;
  line-height: 1.4;
}

.state-text {
  @include rt-state-text;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.title {
  font-size: 30rpx;
  font-weight: 700;
  color: $rt-text;
  flex: 1;
}

.phase-pill {
  @include rt-pill($rt-accent-soft, $rt-accent-dark);
  flex-shrink: 0;
}

.meta {
  display: block;
  font-size: $rt-type-caption;
  color: $rt-text-muted;
  margin-bottom: 8rpx;
}

.citizen-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 10rpx;
}
.c-flag {
  font-size: 20rpx;
  font-weight: 700;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(90, 107, 56, 0.12);
  color: #5a6b38;
}
.c-flag.rate {
  background: rgba(201, 162, 74, 0.16);
  color: $rt-accent-dark;
}

.content {
  font-size: 26rpx;
  color: $rt-text-secondary;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.steps-wrap {
  margin: 18rpx 0 8rpx;
}

.ai-mini {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: $rt-gold-label;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  align-items: center;
}

.ai-flag {
  font-size: 20rpx;
  color: $rt-accent-dark;
  font-weight: 700;
}

.ai-flag.urgent {
  color: #c62828;
}

.advance-row {
  margin-top: 18rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.adv-btn {
  @include rt-btn-reset;
  background: linear-gradient(135deg, $rt-accent-dark, $rt-accent);
  color: #fff;
  font-size: $rt-type-caption;
  border-radius: 999rpx;
  padding: 0 28rpx;
  height: 64rpx;
  line-height: 64rpx;
}

.adv-btn.ghost {
  background: $rt-surface;
  color: $rt-accent-dark;
  border: 1rpx solid rgba(201, 162, 74, 0.35);
}

.fb-card {
  margin-bottom: 4rpx;
}

.fb-reply {
  margin-top: 12rpx;
  padding: 12rpx 14rpx;
  border-radius: 12rpx;
  background: rgba(90, 107, 56, 0.08);
}

.fb-reply-label {
  display: block;
  font-size: 22rpx;
  font-weight: 800;
  color: #5a6b38;
  margin-bottom: 6rpx;
}
</style>
