<template>
  <view class="page" :class="{ elder: elderOn }">
    <rt-nav-bar title="纠纷详情" />
    <view v-if="fromBoot" class="boot-bar">
      <text class="boot-text">从办件进度进入</text>
      <view
        class="boot-btn"
        hover-class="boot-press"
        :hover-stay-time="80"
        @click="goHomeFromBoot"
      >
        <text class="boot-btn-text">{{ bootBackLabel }}</text>
      </view>
    </view>
    <rt-skeleton v-if="loading" variant="lines" :rows="6" />
    <empty-state
      v-else-if="loadError || !dispute"
      icon-type="dispute"
      icon-tone="green"
      title="记录不存在或加载失败"
      action-text="点击重试"
      @action="loadDetail(disputeId)"
    />
    <template v-else>
      <!-- 1. 办理进度 + 口语时效 -->
      <rt-card :class="{ 'progress-flash': progressFlash }" tone="green">
        <view class="loop-head">
          <text class="loop-title">办理进度</text>
          <text
            class="status-tag"
            :class="{ done: dispute.status === 'completed' }"
          >
            {{ statusLabel }}
          </text>
        </view>
        <text class="oral-line">{{ oralLine }}</text>
        <text v-if="nextContactLine" class="contact-line">{{
          nextContactLine
        }}</text>
        <rt-progress-steps
          :steps="workflowSteps"
          :active="progressActive"
          :status="dispute.status"
        />
      </rt-card>

      <!-- 2. 协办下一步（唯一主行动面） -->
      <view v-if="dispute.aiMeta" class="ai-block">
        <rt-ai-taskbar :task="detailTask" @action="onTaskAction" />
      </view>
      <rt-card v-else tone="ai" class="next-card">
        <text class="next-kicker">下一步</text>
        <text class="next-title">{{ nextAction.title }}</text>
        <text class="next-desc">{{ nextAction.desc }}</text>
        <view class="next-actions">
          <view
            v-for="(act, i) in nextAction.actions"
            :key="i"
            class="next-btn"
            :class="{ primary: act.primary }"
            hover-class="next-press"
            :hover-stay-time="80"
            @click="onNextAction(act.key)"
          >
            <text class="next-btn-text">{{ act.label }}</text>
          </view>
        </view>
      </rt-card>

      <!-- 3. 案情内容 -->
      <rt-card>
        <view class="user-row">
          <view class="avatar">{{ avatarChar }}</view>
          <view>
            <text class="user-name">{{ userName }}</text>
            <text class="user-tag">{{ dispute.village || "村民" }}</text>
          </view>
        </view>
        <view class="demand-head">
          <text class="demand-title">{{ dispute.title }}</text>
        </view>
        <text class="demand-text">{{ dispute.content }}</text>
        <view class="demand-meta">
          <text>{{ dispute.views || 0 }} 查看</text>
          <text>发布于 {{ dispute.createTimeText }}</text>
        </view>
      </rt-card>

      <!-- 4. 证据 / 补充 / 评价 -->
      <rt-card v-if="dispute.evidence && dispute.evidence.length">
        <text class="block-title">提交证据</text>
        <view class="evidence-grid">
          <image
            v-for="(item, idx) in dispute.evidence"
            :key="'e' + idx"
            class="evidence-img"
            :src="item.url || item.mockUrl"
            mode="aspectFill"
            @click="previewEvidence(idx)"
          />
        </view>
      </rt-card>

      <!-- 办理中：补充材料 -->
      <rt-card v-if="canSupplement">
        <text class="block-title">补充材料</text>
        <text class="block-desc"
          >追加照片与说明后将同步至调解员工作台，便于核实</text
        >
        <view class="evidence-grid">
          <image
            v-for="(src, idx) in citizen.extraImages"
            :key="'x' + idx"
            class="evidence-img"
            :src="src"
            mode="aspectFill"
            @click="previewExtra(idx)"
          />
          <view
            v-if="citizen.extraImages.length < 6 && !citizenSaving"
            class="evidence-add"
            @click="addExtraImage"
          >
            <text class="add-plus">+</text>
            <text class="add-text">添加</text>
          </view>
        </view>
        <textarea
          v-model="extraNoteDraft"
          class="extra-note"
          maxlength="200"
          placeholder="补充说明（选填）"
          :disabled="citizenSaving"
          @blur="saveExtraNote"
        />
        <text v-if="citizen.supplementedAt" class="extra-saved">
          {{ citizen.synced ? "已同步调解员" : "已保存（待同步）" }}
        </text>
      </rt-card>

      <!-- 已办结：评价 -->
      <rt-card v-if="isCompleted">
        <text class="block-title">办结评价</text>
        <text class="block-desc">{{
          citizen.rating ? "感谢您的反馈" : "办结后可评价本次调解体验"
        }}</text>
        <view class="star-row">
          <text
            v-for="n in 5"
            :key="n"
            class="star"
            :class="{ on: n <= (rateHover || citizen.rating) }"
            @click="setRating(n)"
            >★</text
          >
        </view>
        <textarea
          v-if="!citizen.ratedAt || rateEditing"
          v-model="rateCommentDraft"
          class="extra-note"
          maxlength="120"
          placeholder="一句评价（选填）"
        />
        <view v-if="!citizen.ratedAt || rateEditing" class="rate-actions">
          <view class="rate-btn" @click="submitRating">提交评价</view>
        </view>
        <text v-else-if="citizen.ratingComment" class="rate-done-text">{{
          citizen.ratingComment
        }}</text>
      </rt-card>

      <!-- 6. 调解进展时间轴 -->
      <view class="section-head">
        <view class="accent-bar" />
        <text class="section-label-text">调解进展</text>
      </view>
      <view
        v-if="!(dispute.stages && dispute.stages.length)"
        class="timeline-empty"
      >
        <text class="timeline-empty-text"
          >提交后，村委受理与办理进展将在此更新</text
        >
      </view>
      <view v-else class="timeline">
        <view class="timeline-line" />
        <view
          v-for="stage in dispute.stages"
          :key="stage.type + stage.time"
          class="timeline-item"
        >
          <view class="timeline-dot" />
          <rt-card class="stage-card" compact flush>
            <view class="stage-head">
              <view class="stage-left">
                <rt-icon name="dispute" size="sm" />
                <text class="stage-title">{{ stage.title }}</text>
              </view>
              <text class="stage-tag" :class="statusClass(stage.status)">{{
                statusText(stage.status)
              }}</text>
            </view>
            <text class="stage-content">{{ stage.content }}</text>
            <text class="stage-time">{{ stage.timeText }}</text>
          </rt-card>
        </view>
      </view>

      <!-- 7. 底部公民动作栏 -->
      <rt-trust-bar tip="办件进度以村委更新为准；紧急情况请先求助" />
      <view class="action-bar">
        <view
          class="action-ghost"
          hover-class="action-press"
          :hover-stay-time="80"
          @click="onCallVillage"
        >
          <text class="action-ghost-text">联系村委</text>
        </view>
        <view
          v-if="canUrge"
          class="action-ghost"
          hover-class="action-press"
          :hover-stay-time="80"
          @click="onUrge"
        >
          <text class="action-ghost-text">催办一下</text>
        </view>
        <view
          v-else-if="isCompleted && !citizen.rating"
          class="action-ghost"
          hover-class="action-press"
          :hover-stay-time="80"
          @click="scrollToRate"
        >
          <text class="action-ghost-text">去评价</text>
        </view>
        <view
          class="action-primary"
          hover-class="action-press"
          :hover-stay-time="80"
          @click="askAiAbout"
        >
          <text class="action-primary-text">咨询助手</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import RtCard from "@/components/rt-card/rt-card.vue";
import RtIcon from "@/components/rt-icon/rt-icon.vue";
import RtAiTaskbar from "@/components/rt-ai-taskbar/rt-ai-taskbar.vue";
import RtTrustBar from "@/components/rt-trust-bar/rt-trust-bar.vue";
import RtProgressSteps from "@/components/rt-progress-steps/rt-progress-steps.vue";
import RtSkeleton from "@/components/rt-skeleton/rt-skeleton.vue";
import EmptyState from "@/components/empty-state/empty-state.vue";
import { api } from "@/api/index.js";
import { getLocalUser, uploadEvidenceImages } from "@/utils/cloud.js";
import { goAiAssistant } from "@/utils/auth.js";
import { goReLaunch } from "@/utils/nav.js";
import { goVillageHomePrefer } from "@/utils/boot-route.js";
import { VILLAGE_CONTACT_PHONE, EMERGENCY_TIP } from "@/config/env.js";
import { COPY } from "@/utils/copy-voice.js";
import { isElderMode } from "@/utils/elder-mode.js";
import { buildTaskFromDispute } from "@/utils/ai-task.js";
import { urgeDispute, urgeAt } from "@/utils/urge.js";
import { getNextContact, formatNextContact } from "@/utils/case-contact.js";
import { oralStatusLine } from "@/utils/case-timeline.js";
import { caseOralLine, casePhaseLabel } from "@/utils/case-object.js";
import {
  readDisputeCitizen,
  writeDisputeCitizen,
  citizenFromDispute,
} from "@/utils/dispute-citizen.js";
import {
  WORKFLOW_STEPS,
  stepOfDispute,
  adminLabelOf,
} from "@/utils/dispute-workflow.js";

export default {
  components: {
    RtCard,
    RtIcon,
    RtAiTaskbar,
    RtTrustBar,
    RtProgressSteps,
    RtSkeleton,
    EmptyState,
  },
  data() {
    return {
      loading: true,
      loadError: false,
      disputeId: "",
      dispute: null,
      userName: "村民用户",
      workflowSteps: WORKFLOW_STEPS,
      urgeSent: false,
      citizen: readDisputeCitizen(""),
      extraNoteDraft: "",
      rateCommentDraft: "",
      rateHover: 0,
      rateEditing: false,
      citizenSaving: false,
      fromBoot: false,
      elderOn: false,
      progressFlash: false,
    };
  },
  computed: {
    bootBackLabel() {
      return COPY.bootBackHome;
    },
    avatarChar() {
      const name = this.userName || "村";
      return name.charAt(0);
    },
    progressActive() {
      return stepOfDispute(this.dispute);
    },
    isCompleted() {
      return !!(this.dispute && this.dispute.status === "completed");
    },
    canUrge() {
      const d = this.dispute;
      return !!(d && d.status !== "completed" && !this.urgeSent);
    },
    canSupplement() {
      return !!(this.dispute && this.dispute.status !== "completed");
    },
    aiMaterials() {
      const ai = this.dispute && this.dispute.aiMeta;
      if (!ai) return [];
      if (Array.isArray(ai.materials) && ai.materials.length)
        return ai.materials;
      return [];
    },
    aiDisclaimer() {
      return COPY.aiDisclaimer;
    },
    oralLine() {
      return caseOralLine(this.dispute) || oralStatusLine(this.dispute);
    },
    nextContactLine() {
      return formatNextContact(getNextContact(this.disputeId));
    },
    statusLabel() {
      return casePhaseLabel(this.dispute) || adminLabelOf(this.dispute);
    },
    detailTask() {
      return buildTaskFromDispute(this.dispute);
    },
    nextAction() {
      if (this.isCompleted) {
        if (!this.citizen.rating) {
          return {
            title: "办结了，给个评价吧",
            desc: "评价后可前往调解激励查看积分",
            actions: [
              { key: "rate", label: "去评价", primary: true },
              { key: "points", label: "看积分", primary: false },
              { key: "ai", label: "问助手", primary: false },
            ],
          };
        }
        return {
          title: "感谢您的反馈",
          desc: "可查看积分明细，或继续咨询村务问题",
          actions: [
            { key: "points", label: "看积分", primary: true },
            { key: "ai", label: "问助手", primary: false },
            { key: "call", label: "联系村委", primary: false },
          ],
        };
      }
      if (this.canUrge) {
        return {
          title: "村委办理中",
          desc: oralStatusLine(this.dispute) || "可补充材料，或催办提醒调解员",
          actions: [
            { key: "supplement", label: "补材料", primary: true },
            { key: "urge", label: "催办一下", primary: false },
            { key: "ai", label: "问助手", primary: false },
          ],
        };
      }
      return {
        title: "已催办，请耐心等待",
        desc: "仍可补充说明与照片，便于核实",
        actions: [
          { key: "supplement", label: "补材料", primary: true },
          { key: "call", label: "联系村委", primary: false },
          { key: "ai", label: "问助手", primary: false },
        ],
      };
    },
  },
  onLoad(query) {
    const user = getLocalUser();
    if (user && user.nickname) this.userName = user.nickname;
    this.disputeId = query.id || "d1";
    this.fromBoot = !!(query && query.from === "boot");
    try {
      this.urgeSent = !!urgeAt(this.disputeId);
    } catch (e) {
      /* ignore */
    }
    this.loadCitizen();
    this.loadDetail(this.disputeId);
  },
  onShow() {
    this.elderOn = isElderMode();
  },
  methods: {
    goHomeFromBoot() {
      goVillageHomePrefer();
    },
    loadCitizen() {
      this.citizen = readDisputeCitizen(this.disputeId);
      this.extraNoteDraft = this.citizen.extraNote || "";
      this.rateCommentDraft = this.citizen.ratingComment || "";
    },
    applyCitizenFromDispute(dispute) {
      const fromCloud = citizenFromDispute(dispute);
      if (
        fromCloud.synced ||
        fromCloud.extraImages.length ||
        fromCloud.rating
      ) {
        this.citizen = writeDisputeCitizen(this.disputeId, fromCloud);
      } else {
        this.citizen = readDisputeCitizen(this.disputeId);
      }
      this.extraNoteDraft = this.citizen.extraNote || "";
      this.rateCommentDraft = this.citizen.ratingComment || "";
    },
    async loadDetail(id) {
      this.loading = true;
      this.loadError = false;
      try {
        const res = await api.getDispute(id);
        this.dispute = res.data.dispute;
        if (!this.dispute) this.loadError = true;
        else this.applyCitizenFromDispute(this.dispute);
      } catch (e) {
        this.loadError = true;
        this.dispute = null;
        uni.showToast({ title: e.message || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    statusText(status) {
      if (status === "done") return "已完成";
      if (status === "processing") return "办理中";
      return "待处理";
    },
    statusClass(status) {
      if (status === "done") return "done";
      if (status === "processing") return "ing";
      return "";
    },
    previewEvidence(index) {
      const urls = (this.dispute.evidence || [])
        .map((e) => e.url || e.mockUrl)
        .filter(Boolean);
      if (!urls.length) return;
      uni.previewImage({ current: urls[index], urls });
    },
    previewExtra(index) {
      const urls = this.citizen.extraImages || [];
      if (!urls.length) return;
      uni.previewImage({ current: urls[index], urls });
    },
    async syncCitizenExtra(evidence, note) {
      const res = await api.updateDisputeCitizen({
        id: this.disputeId,
        evidence,
        extraNote: note,
      });
      const next = citizenFromDispute({
        citizenExtra: res.data.citizenExtra,
        citizenRating: this.dispute && this.dispute.citizenRating,
      });
      if (this.dispute) {
        this.dispute.citizenExtra = res.data.citizenExtra;
      }
      this.citizen = writeDisputeCitizen(this.disputeId, {
        ...next,
        synced: true,
      });
      this.extraNoteDraft = this.citizen.extraNote;
      return next;
    },
    addExtraImage() {
      if (this.citizenSaving) return;
      const left = 6 - (this.citizen.extraImages || []).length;
      if (left <= 0) return;
      uni.chooseImage({
        count: left,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const paths = res.tempFilePaths || [];
          if (!paths.length) return;
          this.citizenSaving = true;
          uni.showLoading({ title: "上传中", mask: true });
          try {
            const uploaded = await uploadEvidenceImages(paths);
            const merged = (this.citizen.extraEvidence || [])
              .concat(uploaded)
              .slice(0, 6);
            await this.syncCitizenExtra(merged, this.extraNoteDraft);
            uni.showToast({ title: "已同步调解员", icon: "success" });
          } catch (e) {
            // 上传失败时仍本地暂存，便于演示
            const local = (this.citizen.extraImages || [])
              .concat(paths)
              .slice(0, 6);
            this.citizen = writeDisputeCitizen(this.disputeId, {
              extraImages: local,
              extraNote: this.extraNoteDraft,
              supplementedAt: Date.now(),
              synced: false,
            });
            uni.showToast({
              title: e.message || "同步失败，已暂存本地",
              icon: "none",
            });
          } finally {
            uni.hideLoading();
            this.citizenSaving = false;
          }
        },
      });
    },
    async saveExtraNote() {
      if (this.citizenSaving) return;
      const note = this.extraNoteDraft;
      if (note === (this.citizen.extraNote || "")) return;
      this.citizenSaving = true;
      try {
        await this.syncCitizenExtra(this.citizen.extraEvidence || [], note);
      } catch (e) {
        this.citizen = writeDisputeCitizen(this.disputeId, {
          extraNote: note,
          supplementedAt: Date.now(),
          synced: false,
        });
        uni.showToast({
          title: e.message || "同步失败，已暂存本地",
          icon: "none",
        });
      } finally {
        this.citizenSaving = false;
      }
    },
    setRating(n) {
      this.rateHover = n;
      this.rateEditing = true;
      this.citizen = { ...this.citizen, rating: n };
    },
    async submitRating() {
      const n = this.rateHover || this.citizen.rating;
      if (!n) {
        uni.showToast({ title: "请先点选星级", icon: "none" });
        return;
      }
      this.citizenSaving = true;
      try {
        const res = await api.updateDisputeCitizen({
          id: this.disputeId,
          rating: n,
          ratingComment: this.rateCommentDraft,
        });
        if (this.dispute) this.dispute.citizenRating = res.data.citizenRating;
        this.citizen = writeDisputeCitizen(this.disputeId, {
          rating: n,
          ratingComment: this.rateCommentDraft,
          ratedAt: Date.now(),
          synced: true,
        });
        this.rateEditing = false;
        uni.showToast({ title: "评价已提交", icon: "success" });
        setTimeout(() => {
          goReLaunch(`/pages/village/completeCeremony?id=${this.disputeId}`);
        }, 480);
      } catch (e) {
        this.citizen = writeDisputeCitizen(this.disputeId, {
          rating: n,
          ratingComment: this.rateCommentDraft,
          ratedAt: Date.now(),
          synced: false,
        });
        this.rateEditing = false;
        uni.showToast({
          title: e.message || "同步失败，已暂存本地",
          icon: "none",
        });
        setTimeout(() => {
          goReLaunch(`/pages/village/completeCeremony?id=${this.disputeId}`);
        }, 600);
      } finally {
        this.citizenSaving = false;
      }
    },
    scrollToRate() {
      this.rateEditing = true;
      uni.showToast({ title: "请在上方评价区打分", icon: "none" });
    },
    askAiAbout() {
      const d = this.dispute || {};
      const title = d.title || "这起纠纷";
      uni.setStorageSync(
        "rt_ai_prefill",
        `请帮我解读「${title}」的调解进展和下一步建议`
      );
      uni.setStorageSync("rt_ai_dispute_ctx", {
        id: d._id || d.id || "",
        title: d.title,
        status: d.status,
        phase: d.phase,
        category: (d.aiMeta && d.aiMeta.category) || d.category || "",
        riskLevel: (d.aiMeta && d.aiMeta.riskLevel) || "",
        summary:
          (d.aiMeta && d.aiMeta.summary) || (d.content || "").slice(0, 160),
      });
      goAiAssistant();
    },
    onCallVillage() {
      const phone = VILLAGE_CONTACT_PHONE;
      if (!phone) {
        uni.showToast({ title: "暂未配置村委电话", icon: "none" });
        return;
      }
      uni.showModal({
        title: "联系村委",
        content: `拨打 ${phone}？\n${EMERGENCY_TIP}`,
        confirmText: "拨打",
        success: (res) => {
          if (!res.confirm) return;
          uni.makePhoneCall({
            phoneNumber: String(phone).replace(/-/g, ""),
            fail: () =>
              uni.showToast({ title: "无法拨号，请手动拨打", icon: "none" }),
          });
        },
      });
    },
    onUrge() {
      uni.showModal({
        title: "催办一下",
        content: "将提醒调解员关注本办件。人身安全请先拨打 110 / 120。",
        confirmText: "确认催办",
        success: (res) => {
          if (!res.confirm) return;
          urgeDispute(
            this.disputeId,
            (this.dispute && this.dispute.title) || ""
          );
          this.urgeSent = true;
          this.progressFlash = true;
          setTimeout(() => {
            this.progressFlash = false;
          }, 700);
          uni.showToast({ title: "已催办，调解员可见", icon: "success" });
        },
      });
    },
    onTaskAction(a) {
      if (!a) return;
      if (a.key === "rate" && this.citizen.rating) {
        goReLaunch("/pages/moral/mall");
        return;
      }
      this.onNextAction(a.key);
    },
    onTriadAction(a) {
      this.onTaskAction(a);
    },
    onNextAction(key) {
      if (key === "rate") {
        this.scrollToRate();
        return;
      }
      if (key === "supplement") {
        uni.pageScrollTo({ scrollTop: 420, duration: 280 });
        uni.showToast({ title: "请在补充材料区添加", icon: "none" });
        return;
      }
      if (key === "urge") {
        this.onUrge();
        return;
      }
      if (key === "ai") {
        this.askAiAbout();
        return;
      }
      if (key === "call") {
        this.onCallVillage();
        return;
      }
      if (key === "points") {
        goReLaunch("/pages/moral/mall");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.page {
  @include rt-page;
  padding: $rt-page-x;
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

.boot-bar {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
  padding: 16rpx 18rpx;
  min-height: 80rpx;
  border-radius: $rt-radius-sm;
  background: rgba(90, 107, 56, 0.08);
  border: 1rpx solid rgba(90, 107, 56, 0.18);
  box-sizing: border-box;
}
.boot-text {
  flex: 1;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-text-secondary;
}
.boot-btn {
  flex-shrink: 0;
  min-height: 64rpx;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: $rt-olive;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.boot-press {
  opacity: 0.9;
}
.boot-btn-text {
  font-size: $rt-type-caption;
  font-weight: 800;
  color: #fff;
}

.ai-block {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.next-card {
  margin-top: 0;
}
.next-kicker {
  display: block;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-primary;
  letter-spacing: 2rpx;
}
.next-title {
  display: block;
  margin-top: 8rpx;
  font-size: $rt-type-title;
  font-weight: 800;
  color: $rt-text;
  line-height: 1.3;
}
.next-desc {
  display: block;
  margin-top: 8rpx;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.45;
}
.next-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}
.next-btn {
  min-height: $rt-touch-min;
  padding: 18rpx 28rpx;
  border-radius: 999rpx;
  background: #fff;
  border: 1rpx solid rgba(158, 52, 40, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.next-btn.primary {
  background: linear-gradient(135deg, $rt-primary-dark, $rt-primary-mid);
  border-color: transparent;
}
.next-btn-text {
  font-size: $rt-type-caption;
  font-weight: 800;
  color: $rt-primary-dark;
}
.next-btn.primary .next-btn-text {
  color: #fff;
}
.next-press {
  opacity: 0.9;
}

.loop-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}
.oral-line {
  display: block;
  margin-bottom: 8rpx;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-olive;
  line-height: 1.4;
}
.progress-flash {
  animation: progress-flash 0.7s ease-out;
}
@keyframes progress-flash {
  0% {
    box-shadow: 0 0 0 0 rgba(90, 107, 56, 0.3);
  }
  40% {
    box-shadow: 0 0 0 12rpx rgba(90, 107, 56, 0.12);
  }
  100% {
    box-shadow: none;
  }
}
.contact-line {
  display: block;
  margin-bottom: 14rpx;
  font-size: $rt-type-caption;
  font-weight: 600;
  color: $rt-primary-mid;
  line-height: 1.4;
}
.loop-title {
  font-size: 30rpx;
  font-weight: 800;
  color: $rt-text;
}
.timeline-empty {
  padding: 28rpx 20rpx;
  margin-bottom: 24rpx;
  border-radius: $rt-radius-sm;
  background: rgba(255, 255, 255, 0.7);
  border: 1rpx dashed rgba(201, 162, 74, 0.35);
  text-align: center;
}
.timeline-empty-text {
  font-size: 24rpx;
  color: $rt-text-muted;
  line-height: 1.5;
}
.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  background: rgba(246, 240, 228, 0.96);
  border-top: 1rpx solid rgba(201, 162, 74, 0.22);
  box-shadow: 0 -8rpx 24rpx rgba(90, 70, 30, 0.06);
}
.action-ghost {
  flex: 1;
  min-height: $rt-touch-min;
  height: $rt-touch-min;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1rpx solid rgba(158, 52, 40, 0.22);
}
.action-ghost-text {
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-primary-dark;
}
.action-primary {
  flex: 1.35;
  min-height: $rt-touch-min;
  height: $rt-touch-min;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $rt-primary-dark, $rt-primary-mid);
  box-shadow: 0 8rpx 18rpx rgba(158, 52, 40, 0.25);
}
.action-primary-text {
  font-size: 28rpx;
  font-weight: 800;
  color: #fff;
}
.action-press {
  opacity: 0.88;
}
.section-head {
  display: flex;
  align-items: center;
  margin: 8rpx 4rpx 20rpx;
}
.accent-bar {
  @include rt-accent-bar;
}
.section-label-text {
  @include rt-section-title;
}
.user-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: $rt-accent-soft;
  color: $rt-accent-dark;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 800;
}
.user-name {
  display: block;
  font-size: 32rpx;
  font-weight: 800;
  color: $rt-text;
}
.user-tag {
  display: inline-block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: $rt-accent-dark;
  background: $rt-accent-soft;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}
.demand-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 16rpx;
}
.demand-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 800;
  color: $rt-text;
  line-height: 1.4;
}
.status-tag {
  font-size: 22rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  @include rt-status-pending;
}
.status-tag.done {
  @include rt-status-done;
}
.demand-text {
  display: block;
  font-size: 28rpx;
  line-height: 1.65;
  color: $rt-text-secondary;
}
.demand-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
  font-size: 24rpx;
  color: $rt-text-muted;
}
.ai-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}
.ai-badge {
  width: 44rpx;
  height: 44rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, $rt-accent-dark, $rt-accent);
  color: #fff;
  font-size: 20rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-title {
  flex: 1;
  font-size: 28rpx;
  font-weight: 800;
  color: $rt-forest-text;
}
.risk-tag {
  font-size: 22rpx;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-weight: 700;
}
.risk-tag.low {
  background: #e8f5e9;
  color: #2e7d32;
}
.risk-tag.medium {
  background: #fff3e0;
  color: #e65100;
}
.risk-tag.high {
  background: #ffebee;
  color: #c62828;
}
.ai-summary {
  display: block;
  font-size: 28rpx;
  color: $rt-text-secondary;
  line-height: 1.6;
}
.ai-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: $rt-text-muted;
}
.escalate-banner {
  margin: 12rpx 0;
  padding: 14rpx 16rpx;
  border-radius: 12rpx;
  background: rgba(198, 40, 40, 0.08);
  border: 1rpx solid rgba(198, 40, 40, 0.2);
}
.escalate-title {
  font-size: 24rpx;
  font-weight: 800;
  color: #c62828;
}
.handoff-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 10rpx;
}
.handoff-pill {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(198, 40, 40, 0.12);
  color: #c62828;
  font-weight: 600;
}
.source-line {
  margin: 8rpx 0 12rpx;
  font-size: 22rpx;
  color: $rt-accent-dark;
  font-weight: 700;
}
.ref-pill.cite {
  background: rgba(90, 107, 56, 0.12);
  color: #5a6b38;
}
.refs {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 14rpx;
}
.ref-pill {
  font-size: 20rpx;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(201, 162, 74, 0.14);
  color: $rt-gold-label;
  font-weight: 600;
}
.block-title {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  color: $rt-forest-text;
  margin-bottom: 8rpx;
}
.block-desc {
  display: block;
  margin-bottom: 16rpx;
  font-size: 22rpx;
  color: $rt-text-muted;
  line-height: 1.45;
}
.evidence-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.evidence-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: $rt-radius-sm;
  background: $rt-bg-soft;
}
.evidence-add {
  width: 200rpx;
  height: 200rpx;
  border-radius: $rt-radius-sm;
  border: 2rpx dashed $rt-border-strong;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: $rt-bg-soft;
}
.add-plus {
  font-size: 48rpx;
  color: $rt-text-muted;
  line-height: 1;
}
.add-text {
  font-size: 22rpx;
  color: $rt-text-muted;
  margin-top: 8rpx;
}
.extra-note {
  @include rt-form-textarea;
  min-height: 120rpx;
  margin-top: 16rpx;
  width: 100%;
  box-sizing: border-box;
}
.extra-saved {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #5a6b38;
  font-weight: 600;
}
.star-row {
  display: flex;
  gap: 12rpx;
  margin: 8rpx 0 16rpx;
}
.star {
  font-size: 48rpx;
  color: rgba(201, 162, 74, 0.28);
  line-height: 1;
}
.star.on {
  color: $rt-accent;
}
.rate-actions {
  margin-top: 12rpx;
}
.rate-btn {
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $rt-accent-dark, $rt-accent);
  color: #fff;
  font-size: 26rpx;
  font-weight: 800;
}
.rate-done-text {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: $rt-text-secondary;
  line-height: 1.5;
}
.timeline {
  position: relative;
  padding-left: 48rpx;
}
.timeline-line {
  position: absolute;
  left: 16rpx;
  top: 0;
  bottom: 0;
  width: 4rpx;
  background: $rt-border;
}
.timeline-item {
  position: relative;
  margin-bottom: 24rpx;
}
.timeline-dot {
  position: absolute;
  left: -40rpx;
  top: 28rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: $rt-accent;
  border: 4rpx solid $rt-bg;
  box-shadow: 0 0 0 2rpx $rt-accent;
}
.stage-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}
.stage-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
  min-width: 0;
}
.stage-title {
  font-size: 30rpx;
  font-weight: 800;
  color: $rt-text;
}
.stage-tag {
  font-size: 22rpx;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  @include rt-status-pending;
}
.stage-tag.done {
  @include rt-status-done;
}
.stage-tag.ing {
  background: $rt-accent-soft;
  color: $rt-accent-dark;
}
.stage-content {
  display: block;
  font-size: 28rpx;
  line-height: 1.6;
  color: $rt-text-secondary;
}
.stage-time {
  display: block;
  text-align: right;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: $rt-text-muted;
}
</style>
