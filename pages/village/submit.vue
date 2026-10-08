<template>
  <view class="page" :class="{ elder: elderOn }">
    <rt-nav-bar title="去说事" />
    <view class="wizard-bar">
      <view
        v-for="(s, i) in wizardLabels"
        :key="s"
        class="wiz-step"
        :class="{ on: step >= i, now: step === i }"
      >
        <view class="wiz-dot">{{ i + 1 }}</view>
        <text class="wiz-label">{{ s }}</text>
      </view>
    </view>

    <rt-card v-if="step === 0" tone="ai" elevated>
      <text class="form-title">把事情说清楚</text>
      <text class="form-hint"
        >可先点场景，或按住「语音说事」；再补文字说明</text
      >

      <view v-if="draftImported" class="draft-banner">
        <text>已恢复未提交草稿，离开页面会自动保存</text>
      </view>

      <view
        v-if="voiceAvailable"
        class="voice-main"
        :class="{ on: voiceing }"
        hover-class="voice-press"
        :hover-stay-time="80"
        @touchstart.prevent="onVoiceStart"
        @touchend.prevent="onVoiceEnd"
        @touchcancel.prevent="onVoiceEnd"
        @click="onVoiceTap"
      >
        <text class="voice-main-title">{{
          voiceing ? "松开结束" : "按住 · 语音说事"
        }}</text>
        <text class="voice-main-sub">{{ voiceHint }}</text>
      </view>
      <text v-else class="form-hint soft"
        >当前环境未开通语音输入，请用文字或场景标签说明</text
      >

      <view class="chip-row">
        <text
          v-for="c in sceneChips"
          :key="c"
          class="scene-chip"
          @click="applyChip(c)"
          >{{ c }}</text
        >
      </view>

      <textarea
        v-model="content"
        class="textarea"
        maxlength="800"
        placeholder="请描述经过、双方诉求及已协商情况"
        :disabled="busy"
        @input="onDraftFieldChange"
      />

      <view class="field-label">补充说明（可选）</view>
      <text class="field-hint"
        >请用文字说明经过与诉求；现场材料请当面交村委，本小程序不采集证件或身份照片。</text
      >

      <rt-skeleton v-if="analyzing" variant="lines" :rows="4" />
    </rt-card>

    <rt-card v-if="step === 1" elevated>
      <text class="form-title">确认案情</text>
      <text class="form-hint soft">核对标题与描述，对了再提交</text>

      <view v-if="aiInsight" class="insight-wrap confirm">
        <rt-ai-taskbar :task="submitTask" @action="onTriadAction" />
      </view>

      <view class="field-label">标题</view>
      <input
        v-model="title"
        class="input"
        placeholder="确认或修改标题"
        :disabled="busy"
        @input="onDraftFieldChange"
      />

      <view class="field-label">描述</view>
      <textarea
        v-model="content"
        class="textarea sm"
        maxlength="800"
        :disabled="busy"
        @input="onDraftFieldChange"
      />

      <view
        v-if="materialChecks.length || checklist.length"
        class="extras-fold"
      >
        <view
          class="extras-toggle"
          hover-class="extras-press"
          :hover-stay-time="80"
          @click="confirmExtrasOpen = !confirmExtrasOpen"
        >
          <text class="extras-toggle-text">{{
            confirmExtrasOpen ? "收起材料与要点" : "补充材料与要点"
          }}</text>
          <text class="extras-toggle-meta">{{ extrasSummary }}</text>
        </view>
        <view v-if="confirmExtrasOpen" class="extras-body">
          <view v-if="materialChecks.length" class="check-block">
            <text class="check-head">材料清单</text>
            <view
              v-for="(item, i) in materialChecks"
              :key="'m' + i"
              class="check-row"
              hover-class="check-press"
              :hover-stay-time="80"
              @click="toggleMaterial(i)"
            >
              <view class="check-box" :class="{ on: item.on }">
                <text v-if="item.on" class="check-mark">✓</text>
              </view>
              <text class="check-text">{{ item.text }}</text>
            </view>
            <view
              class="check-apply soft"
              hover-class="check-apply-press"
              :hover-stay-time="80"
              @click="applyMaterials"
            >
              <text class="check-apply-text soft">写入已选材料</text>
            </view>
          </view>

          <view v-if="checklist.length" class="check-block">
            <text class="check-head">要点（写入描述）</text>
            <view
              v-for="(item, i) in checklist"
              :key="i"
              class="check-row"
              hover-class="check-press"
              :hover-stay-time="80"
              @click="toggleCheck(i)"
            >
              <view class="check-box" :class="{ on: item.on }">
                <text v-if="item.on" class="check-mark">✓</text>
              </view>
              <text class="check-text">{{ item.text }}</text>
            </view>
            <view
              class="check-apply soft"
              hover-class="check-apply-press"
              :hover-stay-time="80"
              @click="applyChecklist"
            >
              <text class="check-apply-text soft">写入已选要点</text>
            </view>
          </view>
        </view>
      </view>

      <text
        class="link-btn inline"
        :class="{ disabled: busy }"
        @click="!busy && goAnalyze()"
        >重新整理</text
      >
      <rt-skeleton v-if="analyzing" variant="lines" :rows="3" />
    </rt-card>

    <view v-if="step === 0 || step === 1" class="submit-footer">
      <template v-if="step === 0">
        <button
          class="primary-btn footer-btn"
          :disabled="!content.trim() || busy"
          @click="goAnalyze"
        >
          {{ analyzing ? "整理中…" : "整理成案" }}
        </button>
      </template>
      <template v-else>
        <view class="footer-row">
          <button
            class="ghost-btn footer-ghost"
            :disabled="busy"
            @click="step = 0"
          >
            返回
          </button>
          <button
            class="primary-btn footer-btn flex"
            :disabled="busy || !title.trim()"
            @click="onSubmit"
          >
            {{ submitting ? "提交中…" : "确认提交" }}
          </button>
        </view>
      </template>
    </view>

    <view v-if="step === 2" class="success-panel">
      <view class="success-mark">
        <view class="check-arm" />
      </view>
      <text class="success-title">已建档</text>
      <text class="success-sub">{{ successEta }}</text>
      <text class="success-hint">办结后可评价，并获得调解激励积分</text>
      <rt-progress-steps
        :steps="workflowSteps"
        :active="0"
        status="processing"
      />
      <view class="success-actions">
        <button class="primary-btn" @click="askAi">本案协办问答</button>
        <text class="success-link" @click="goDetail">先看办理进度</text>
      </view>
    </view>

    <rt-trust-bar v-if="step < 2" />
  </view>
</template>

<script>
import { api } from "@/api/index.js";
import { ensureLoggedIn, goAiAssistant } from "@/utils/auth.js";
import { WORKFLOW_STEPS } from "@/utils/dispute-workflow.js";
import {
  readSubmitDraft,
  writeSubmitDraft,
  clearSubmitDraft,
} from "@/utils/submit-draft.js";
import { requestDisputeProgressSubscribe } from "@/utils/subscribe.js";
import { COPY } from "@/utils/copy-voice.js";
import { isElderMode } from "@/utils/elder-mode.js";
import {
  isVoiceInputAvailable,
  bindVoiceHandlers,
  startVoiceInput,
  stopVoiceInput,
} from "@/utils/voice-input.js";
import RtCard from "@/components/rt-card/rt-card.vue";
import RtAiTaskbar from "@/components/rt-ai-taskbar/rt-ai-taskbar.vue";
import RtTrustBar from "@/components/rt-trust-bar/rt-trust-bar.vue";
import RtProgressSteps from "@/components/rt-progress-steps/rt-progress-steps.vue";
import RtSkeleton from "@/components/rt-skeleton/rt-skeleton.vue";
import { buildTaskFromInsight } from "@/utils/ai-task.js";
import { etaOfDispute } from "@/utils/case-timeline.js";

export default {
  components: { RtCard, RtAiTaskbar, RtTrustBar, RtProgressSteps, RtSkeleton },
  data() {
    return {
      step: 0,
      wizardLabels: ["说事", "确认", "建档"],
      workflowSteps: WORKFLOW_STEPS,
      title: "",
      content: "",
      analyzing: false,
      submitting: false,
      aiInsight: null,
      createdId: "",
      draftImported: false,
      draftHydrated: false,
      draftTimer: null,
      checklist: [],
      materialChecks: [],
      confirmExtrasOpen: false,
      voiceing: false,
      _voiceBound: false,
      elderOn: false,
      sceneChips: [
        "土地边界纠纷",
        "邻里噪音/占用通道",
        "劳务用工纠纷",
        "家庭赡养争议",
      ],
    };
  },
  computed: {
    busy() {
      return this.analyzing || this.submitting;
    },
    extrasSummary() {
      const m = this.materialChecks.length;
      const c = this.checklist.length;
      const parts = [];
      if (m) parts.push(`材料 ${m}`);
      if (c) parts.push(`要点 ${c}`);
      return parts.join(" · ") || "";
    },
    aiDisclaimer() {
      return COPY.aiDisclaimer;
    },
    voiceAvailable() {
      return isVoiceInputAvailable();
    },
    voiceHint() {
      if (isVoiceInputAvailable()) return "松手后文字会写入上方输入框";
      return "演示环境语音未开通，可点场景标签或直接打字";
    },
    submitTask() {
      if (!this.aiInsight) return {};
      return buildTaskFromInsight(this.aiInsight, {
        primary: { key: "submit", label: "确认提交", primary: true },
        secondary: [
          { key: "materials", label: "勾材料" },
          { key: "re", label: "重新整理" },
        ],
      });
    },
    successEta() {
      return (
        etaOfDispute({
          status: "processing",
          phase: "submitted",
          aiMeta: this.aiInsight || {},
        }) || "村委将按流程受理办理"
      );
    },
  },
  onLoad() {
    this.hydrateDraft();
  },
  onShow() {
    this.elderOn = isElderMode();
    if (this.draftHydrated && this.step < 2) {
      const d = readSubmitDraft();
      if (d.content && d.content !== this.content && !this.content.trim()) {
        this.content = d.content;
        if (d.title) this.title = d.title;
        this.draftImported = true;
      }
    }
  },
  onHide() {
    this.persistDraft(true);
  },
  onUnload() {
    if (this.draftTimer) {
      clearTimeout(this.draftTimer);
      this.draftTimer = null;
    }
    this.persistDraft(true);
  },
  methods: {
    hydrateDraft() {
      if (this.draftHydrated) return;
      this.draftHydrated = true;
      const d = readSubmitDraft();
      if (!d.content && !d.title && !(d.materials && d.materials.length))
        return;
      this.content = d.content || "";
      this.title = d.title || "";
      if (d.materials && d.materials.length)
        this.materialChecks = d.materials.slice();
      this.draftImported = true;
    },
    onDraftFieldChange() {
      this.dismissDraftBanner();
      if (this.draftTimer) clearTimeout(this.draftTimer);
      this.draftTimer = setTimeout(() => this.persistDraft(false), 400);
    },
    persistDraft(force) {
      if (this.step >= 2) return;
      if (!force && this.busy) return;
      writeSubmitDraft({
        content: this.content,
        title: this.title,
        step: this.step,
        evidencePaths: [],
        materials: this.materialChecks,
        source: "editor",
      });
    },
    dismissDraftBanner() {
      this.draftImported = false;
    },
    setupVoice() {
      if (this._voiceBound) return;
      this._voiceBound = bindVoiceHandlers({
        onResult: (text) => {
          const t = String(text || "").trim();
          if (!t) return;
          this.content = this.content.trim()
            ? `${this.content.trim()}\n${t}`
            : t;
          this.persistDraft(true);
          this.voiceing = false;
        },
        onError: () => {
          this.voiceing = false;
        },
        onEnd: () => {
          this.voiceing = false;
        },
      });
    },
    async onVoiceStart() {
      if (this.busy || this.step !== 0) return;
      if (!isVoiceInputAvailable()) return;
      this.setupVoice();
      try {
        await startVoiceInput({ duration: 30000 });
        this.voiceing = true;
      } catch (e) {
        this.voiceing = false;
        uni.showToast({ title: "语音暂不可用", icon: "none" });
      }
    },
    async onVoiceEnd() {
      if (!this.voiceing) return;
      try {
        await stopVoiceInput();
      } catch (e) {
        /* ignore */
      }
      this.voiceing = false;
    },
    onVoiceTap() {
      if (isVoiceInputAvailable()) return;
      uni.showToast({ title: "请点场景标签或直接打字", icon: "none" });
    },
    applyChip(c) {
      this.dismissDraftBanner();
      if (this.content.trim()) {
        this.content = `${this.content.trim()}\n【场景】${c}`;
      } else {
        this.content = `【场景】${c}。具体情况是：`;
      }
      this.persistDraft(true);
    },
    buildChecklist(insight) {
      const items = [];
      const push = (text, on = true) => {
        const t = String(text || "").trim();
        if (!t || t.length < 2) return;
        if (items.some((x) => x.text === t)) return;
        items.push({ text: t.slice(0, 80), on });
      };
      if (insight.summary) push(`摘要：${insight.summary}`, true);
      if (insight.categoryLabel) push(`类型：${insight.categoryLabel}`, true);
      (insight.steps || []).slice(0, 4).forEach((s) => push(s, true));
      if (insight.mediationAdvice && !insight.escalate)
        push(insight.mediationAdvice, false);
      (insight.legalRefs || [])
        .slice(0, 2)
        .forEach((r) => push(`依据：${r}`, false));
      this.checklist = items.slice(0, 8);
    },
    buildMaterials(insight) {
      const raw = Array.isArray(insight.materials) ? insight.materials : [];
      const fallback = [
        "相关协议 / 合同 / 收据（线下备齐）",
        "现场情况文字说明",
        "双方联系方式",
        "希望村委协助的事项",
      ];
      const list = (raw.length ? raw : fallback)
        .map((m) => {
          const text = typeof m === "string" ? m : (m && m.text) || "";
          return { text: String(text).trim(), on: true };
        })
        .filter((m) => m.text);
      this.materialChecks = list.slice(0, 10);
    },
    toggleCheck(i) {
      if (!this.checklist[i] || this.busy) return;
      this.$set
        ? this.$set(this.checklist[i], "on", !this.checklist[i].on)
        : (this.checklist[i].on = !this.checklist[i].on);
      this.checklist = this.checklist.slice();
    },
    toggleMaterial(i) {
      if (!this.materialChecks[i] || this.busy) return;
      this.$set
        ? this.$set(this.materialChecks[i], "on", !this.materialChecks[i].on)
        : (this.materialChecks[i].on = !this.materialChecks[i].on);
      this.materialChecks = this.materialChecks.slice();
      this.persistDraft(true);
    },
    applyChecklist() {
      const picked = this.checklist.filter((x) => x.on).map((x) => x.text);
      if (!picked.length) {
        uni.showToast({ title: "请先勾选要点", icon: "none" });
        return;
      }
      const block = `【AI 要点】\n${picked
        .map((t, i) => `${i + 1}. ${t}`)
        .join("\n")}`;
      const base = this.content.replace(/\n?【AI 要点】[\s\S]*$/, "").trim();
      this.content = base ? `${base}\n\n${block}` : block;
      this.persistDraft(true);
      uni.showToast({ title: "已写入描述", icon: "success" });
    },
    applyMaterials() {
      const picked = this.materialChecks.filter((x) => x.on).map((x) => x.text);
      if (!picked.length) {
        uni.showToast({ title: "请先勾选材料", icon: "none" });
        return;
      }
      const block = `【材料清单】\n${picked
        .map((t, i) => `${i + 1}. ${t}`)
        .join("\n")}`;
      const base = this.content
        .replace(/\n?【材料清单】[\s\S]*?(?=\n【|$)/, "")
        .trim();
      this.content = base ? `${base}\n\n${block}` : block;
      this.persistDraft(true);
      uni.showToast({ title: "材料已写入", icon: "success" });
    },
    onTriadAction(a) {
      if (!a) return;
      if (a.key === "submit") {
        this.onSubmit();
        return;
      }
      if (a.key === "materials") {
        this.applyMaterials();
        return;
      }
      if (a.key === "re") this.goAnalyze();
    },
    chooseEvidence() {
      uni.showToast({
        title: "请用文字说明；材料当面交村委",
        icon: "none",
      });
    },
    removeEvidence() {},
    async goAnalyze() {
      if (!ensureLoggedIn({ tip: "说事建档请先登录" })) return;
      if (!this.content.trim() || this.busy) return;
      this.persistDraft(true);
      this.analyzing = true;
      try {
        const res = await api.aiAssistDispute({
          content: this.content.trim(),
          title: this.title.trim(),
        });
        this.aiInsight = res.data;
        if (this.aiInsight.suggestedTitle)
          this.title = this.aiInsight.suggestedTitle;
        this.buildChecklist(this.aiInsight);
        this.buildMaterials(this.aiInsight);
        this.confirmExtrasOpen = false;
        this.step = 1;
        this.persistDraft(true);
      } catch (e) {
        uni.showToast({ title: e.message || "整理失败", icon: "none" });
      } finally {
        this.analyzing = false;
      }
    },
    async onSubmit() {
      if (!ensureLoggedIn({ tip: "说事建档请先登录" })) return;
      if (this.busy) return;
      if (!this.title.trim() || !this.content.trim()) {
        uni.showToast({ title: "请完善标题与描述", icon: "none" });
        return;
      }
      if (!this.aiInsight) {
        await this.goAnalyze();
        if (!this.aiInsight) return;
      }
      this.submitting = true;
      uni.showLoading({ title: "提交中", mask: true });
      try {
        let evidence = [];
        // 个人主体合规：不上传证件/身份类影像，证据仅保留文字建档
        const suggested = (this.aiInsight.suggestedTitle || "").trim();
        const finalTitle = this.title.trim();
        const titleEdited = !!suggested && suggested !== finalTitle;
        const selectedMaterials = this.materialChecks
          .filter((m) => m.on)
          .map((m) => m.text);
        const aiMeta = {
          ...this.aiInsight,
          suggestedTitle: suggested || this.aiInsight.suggestedTitle,
          finalTitle,
          titleEdited,
          materials: selectedMaterials.length
            ? selectedMaterials
            : this.aiInsight.materials || [],
        };
        const res = await api.createDispute({
          title: finalTitle,
          content: this.content.trim(),
          aiMeta,
          evidence,
        });
        this.aiInsight = aiMeta;
        this.createdId = res.data.dispute._id;
        this.step = 2;
        clearSubmitDraft();
        // 建档后请求进度订阅（模板 ID 配在 env.js）
        await requestDisputeProgressSubscribe();
      } catch (e) {
        uni.showToast({ title: e.message || "提交失败", icon: "none" });
      } finally {
        uni.hideLoading();
        this.submitting = false;
      }
    },
    goDetail() {
      if (!this.createdId) return;
      uni.redirectTo({
        url: `/pages/disputeDetail/disputeDetail?id=${this.createdId}`,
      });
    },
    askAi() {
      const t = this.title || "这起纠纷";
      const summary =
        (this.aiInsight && this.aiInsight.summary) ||
        (this.content || "").slice(0, 160);
      uni.setStorageSync(
        "rt_ai_prefill",
        `我刚提交了「${t}」，请告诉我接下来要注意什么、缺什么材料`
      );
      uni.setStorageSync("rt_ai_dispute_ctx", {
        id: this.createdId || "",
        title: t,
        status: "processing",
        phase: "submitted",
        category: (this.aiInsight && this.aiInsight.category) || "",
        riskLevel: (this.aiInsight && this.aiInsight.riskLevel) || "",
        summary,
      });
      goAiAssistant();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.page {
  @include rt-page;
  padding: $rt-page-x;
  padding-bottom: calc(200rpx + env(safe-area-inset-bottom));
  background: radial-gradient(
      ellipse 100% 40% at 50% 0%,
      rgba(158, 52, 40, 0.05) 0%,
      transparent 55%
    ),
    linear-gradient(180deg, #faf6f0 0%, #f3ebe3 100%);
}

.draft-banner {
  margin-bottom: 16rpx;
  padding: 14rpx 18rpx;
  border-radius: 12rpx;
  background: rgba(90, 107, 56, 0.08);
  font-size: 22rpx;
  color: #5a6b38;
  line-height: 1.45;
}

.insight-toggle {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: $rt-primary-mid;
}

.ai-disclaimer {
  display: block;
  margin-top: 12rpx;
  font-size: $rt-type-micro;
  color: $rt-text-muted;
  line-height: 1.4;
}

.check-block {
  margin-top: 20rpx;
  padding: 20rpx;
  border-radius: $rt-radius-sm;
  background: rgba(255, 252, 247, 0.9);
  border: 1rpx solid rgba(158, 52, 40, 0.12);
}
.check-head {
  display: block;
  margin-bottom: 14rpx;
  font-size: $rt-type-caption;
  font-weight: 800;
  color: $rt-text;
}
.check-row {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  padding: 14rpx 0;
  min-height: 72rpx;
}
.check-press {
  opacity: 0.88;
}
.check-box {
  width: 40rpx;
  height: 40rpx;
  margin-top: 2rpx;
  border-radius: 10rpx;
  border: 2rpx solid rgba(158, 52, 40, 0.35);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
}
.check-box.on {
  background: $rt-primary;
  border-color: $rt-primary;
}
.check-mark {
  font-size: 22rpx;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}
.check-text {
  flex: 1;
  font-size: $rt-type-caption;
  color: $rt-text;
  line-height: 1.45;
}
.check-apply {
  margin-top: 12rpx;
  min-height: $rt-touch-min;
  padding: 20rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $rt-primary-dark, $rt-primary-mid);
  text-align: center;
  box-sizing: border-box;
}
.check-apply.soft {
  min-height: 72rpx;
  padding: 16rpx 20rpx;
  background: rgba(158, 52, 40, 0.08);
  border: 1rpx solid rgba(158, 52, 40, 0.16);
}
.check-apply-press {
  opacity: 0.92;
}
.check-apply-text {
  font-size: $rt-type-body;
  font-weight: 800;
  color: #fff;
}
.check-apply-text.soft {
  font-size: $rt-type-caption;
  color: $rt-primary-dark;
}

.extras-fold {
  margin-top: 24rpx;
  border-top: 1rpx solid rgba(50, 40, 30, 0.08);
  padding-top: 8rpx;
}
.extras-toggle {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16rpx;
  padding: 18rpx 4rpx;
  min-height: 72rpx;
  box-sizing: border-box;
}
.extras-press {
  opacity: 0.88;
}
.extras-toggle-text {
  font-size: 28rpx;
  font-weight: 700;
  color: $rt-primary-dark;
}
.extras-toggle-meta {
  font-size: 22rpx;
  color: $rt-text-muted;
  flex-shrink: 0;
}
.extras-body {
  padding-bottom: 8rpx;
}

.success-hint {
  display: block;
  margin: 8rpx 0 20rpx;
  font-size: $rt-type-caption;
  color: $rt-gold-label;
  text-align: center;
}

.submit-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  padding: 16rpx $rt-page-x calc(16rpx + env(safe-area-inset-bottom));
  background: rgba(255, 252, 247, 0.96);
  border-top: 1rpx solid rgba(201, 162, 74, 0.22);
  box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.footer-row {
  display: flex;
  gap: 16rpx;
}

.footer-btn {
  margin-top: 0;
  width: 100%;
}

.footer-btn.flex {
  flex: 1;
}

.footer-ghost {
  flex-shrink: 0;
  min-width: 160rpx;
}

.link-btn.inline {
  display: block;
  margin-top: 16rpx;
  text-align: center;
}

.link-btn.disabled {
  opacity: 0.5;
}

.success-link {
  display: block;
  margin-top: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: $rt-accent-dark;
  text-align: center;
}

.wizard-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
  padding: 0 8rpx;
}

.wiz-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  opacity: 0.45;
}
.wiz-step.on {
  opacity: 1;
}
.wiz-dot {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: $rt-accent-soft;
  color: $rt-accent-dark;
  font-size: 22rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wiz-step.now .wiz-dot {
  background: $rt-accent;
  color: #fff;
}
.wiz-label {
  font-size: 22rpx;
  color: $rt-text-muted;
  font-weight: 600;
}
.wiz-step.now .wiz-label {
  color: $rt-forest-text;
}

.form-title {
  display: block;
  font-size: 34rpx;
  font-weight: 800;
  color: $rt-text;
  margin-bottom: 12rpx;
}
.form-hint {
  display: block;
  margin-bottom: 20rpx;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.45;
}
.form-hint.soft {
  margin-bottom: 16rpx;
  color: $rt-text-muted;
}

.voice-main {
  margin-bottom: 20rpx;
  min-height: 140rpx;
  padding: 28rpx 24rpx;
  border-radius: $rt-radius-md;
  background: linear-gradient(135deg, $rt-primary-dark, $rt-primary-mid);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  box-sizing: border-box;
}
.voice-main.on {
  opacity: 0.92;
  transform: scale(0.99);
}
.voice-press {
  opacity: 0.9;
}
.voice-main-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #fff;
}
.voice-main-sub {
  font-size: $rt-type-micro;
  color: rgba(255, 255, 255, 0.88);
  text-align: center;
  line-height: 1.4;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.scene-chip {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(201, 162, 74, 0.12);
  color: $rt-gold-label;
  font-size: 22rpx;
  font-weight: 600;
}

.field-label {
  font-size: 26rpx;
  font-weight: 700;
  color: $rt-text-secondary;
  margin: 20rpx 0 12rpx;
}
.textarea {
  @include rt-form-textarea;
  min-height: 240rpx;
}
.textarea.sm {
  min-height: 160rpx;
}
.input {
  @include rt-form-input;
  width: 100%;
}

.insight-wrap {
  margin: 12rpx 0 8rpx;
  padding: 20rpx;
  border-radius: $rt-radius-sm;
  background: linear-gradient(135deg, #fffef9 0%, #fff4d7 55%, #fffdf5 100%);
  border: 1rpx solid rgba(201, 162, 74, 0.22);
}
.insight-wrap.confirm {
  margin: 4rpx 0 20rpx;
  padding: 16rpx 18rpx;
  background: linear-gradient(160deg, #fffdf9 0%, #f7f1e8 100%);
  border: 1rpx solid rgba(90, 70, 50, 0.1);
}
.escalate-banner {
  margin-bottom: 16rpx;
  padding: 16rpx 18rpx;
  border-radius: 12rpx;
  background: rgba(198, 40, 40, 0.08);
  border: 1rpx solid rgba(198, 40, 40, 0.22);
}
.escalate-title {
  display: block;
  font-size: 26rpx;
  font-weight: 800;
  color: #c62828;
  margin-bottom: 8rpx;
}
.escalate-desc {
  display: block;
  font-size: 24rpx;
  color: $rt-text-secondary;
  line-height: 1.55;
}
.handoff-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8rpx;
  margin-top: 12rpx;
}
.handoff-label {
  font-size: 22rpx;
  color: #c62828;
  font-weight: 700;
}
.handoff-pill {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(198, 40, 40, 0.12);
  color: #c62828;
  font-weight: 600;
}
.source-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
  font-size: 22rpx;
}
.source-label {
  color: $rt-text-muted;
}
.source-value {
  color: $rt-accent-dark;
  font-weight: 700;
}
.ref-pill.cite {
  background: rgba(90, 107, 56, 0.12);
  color: #5a6b38;
}
.pipeline-tip {
  display: block;
  margin-top: 12rpx;
  font-size: 20rpx;
  color: $rt-text-muted;
}
.success-sub {
  display: block;
  margin: 8rpx 0 16rpx;
  font-size: 24rpx;
  color: $rt-text-muted;
  text-align: center;
}
.success-source {
  display: block;
  margin-top: 16rpx;
  font-size: 22rpx;
  color: $rt-accent-dark;
  text-align: center;
  font-weight: 600;
}
.insight-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}
.insight-title {
  font-size: 28rpx;
  font-weight: 800;
  color: $rt-forest-text;
}
.risk-tag {
  font-size: 22rpx;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-weight: 700;
  background: #fff;
}
.risk-tag.low {
  color: #2e7d32;
}
.risk-tag.medium {
  color: #e65100;
}
.risk-tag.high {
  color: #c62828;
}
.summary {
  display: block;
  font-size: 26rpx;
  color: $rt-text-secondary;
  line-height: 1.6;
  margin-bottom: 14rpx;
}
.insight-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
  font-size: 26rpx;
}
.label {
  color: $rt-text-muted;
}
.value {
  color: $rt-text;
  font-weight: 600;
  max-width: 62%;
  text-align: right;
}
.refs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8rpx;
  margin: 8rpx 0 12rpx;
}
.refs-label {
  font-size: 22rpx;
  color: $rt-text-muted;
  margin-right: 4rpx;
}
.ref-pill {
  font-size: 20rpx;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(201, 162, 74, 0.14);
  color: $rt-gold-label;
  font-weight: 600;
}
.advice {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: $rt-text-secondary;
  line-height: 1.6;
}
.disclaimer {
  display: block;
  margin-top: 14rpx;
  font-size: 20rpx;
  color: $rt-text-muted;
  line-height: 1.45;
}
.next-block {
  margin-top: 16rpx;
  padding-top: 14rpx;
  border-top: 1rpx solid rgba(201, 162, 74, 0.2);
}
.next-title {
  display: block;
  font-size: 24rpx;
  font-weight: 800;
  color: $rt-gold-label;
  margin-bottom: 8rpx;
}
.next-item {
  display: block;
  font-size: 24rpx;
  color: $rt-text-secondary;
  line-height: 1.55;
  margin-bottom: 4rpx;
}

.evidence-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin: 8rpx 0;
}
.evidence-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: $rt-radius-sm;
  overflow: hidden;
}
.evidence-img {
  width: 100%;
  height: 100%;
}
.evidence-del {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  text-align: center;
  line-height: 40rpx;
}
.evidence-add {
  width: 160rpx;
  height: 160rpx;
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

.btn-row {
  display: flex;
  gap: 16rpx;
  margin-top: 28rpx;
}
.primary-btn {
  @include rt-btn-primary;
  margin-top: 28rpx;
  width: 100%;
  background: linear-gradient(135deg, $rt-accent-dark, $rt-accent);
}
.primary-btn.flex {
  flex: 1;
  margin-top: 0;
}
.primary-btn[disabled] {
  opacity: 0.65;
}
.ghost-btn {
  @include rt-btn-reset;
  margin-top: 0;
  height: 88rpx;
  line-height: 88rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: $rt-surface;
  color: $rt-accent-dark;
  border: 1rpx solid rgba(201, 162, 74, 0.35);
  font-size: 28rpx;
  font-weight: 700;
}
.ghost-btn.full {
  width: 100%;
  margin-top: 16rpx;
}
.link-btn {
  @include rt-btn-reset;
  margin-top: 16rpx;
  background: transparent;
  color: $rt-gold-label;
  font-size: 26rpx;
  font-weight: 600;
}

.success-panel {
  padding: 48rpx 32rpx 40rpx;
  border-radius: $rt-radius-lg;
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    #fffef9 20%,
    #fff4d7 55%,
    #fffdf5 100%
  );
  box-shadow: $rt-shadow-card;
  text-align: center;
}
.success-mark {
  width: 96rpx;
  height: 96rpx;
  margin: 0 auto 24rpx;
  border-radius: 50%;
  background: $rt-accent;
  display: flex;
  align-items: center;
  justify-content: center;
}
.check-arm {
  width: 36rpx;
  height: 18rpx;
  border-left: 6rpx solid #fff;
  border-bottom: 6rpx solid #fff;
  transform: rotate(-45deg);
  margin-top: -8rpx;
}
.success-title {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: $rt-forest-text;
  margin-bottom: 28rpx;
}
.success-actions {
  margin-top: 28rpx;
}
.success-actions .primary-btn {
  margin-top: 0;
}
</style>
