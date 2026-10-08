<template>
  <view class="page chat-page theme-village" :class="{ elder: elderOn }">
    <rt-nav-bar :title="navTitle">
      <template #right>
        <view class="nav-actions">
          <text class="nav-link" @click="openHistory">历史</text>
          <text v-if="messages.length" class="nav-link" @click="onClear"
            >清空</text
          >
        </view>
      </template>
    </rt-nav-bar>
    <view v-if="!online" class="net-banner">
      <text class="net-text">网络已断开，恢复后可继续发送</text>
    </view>
    <view class="disclaimer" @click="disclaimerOpen = !disclaimerOpen">
      <text class="disclaimer-main">{{ disclaimerShort }}</text>
      <text class="disclaimer-toggle">{{
        disclaimerOpen ? "收起" : "说明"
      }}</text>
    </view>
    <view v-if="disclaimerOpen" class="disclaimer-body">
      <text class="disclaimer-detail"
        >{{ COPY.aiDisclaimer }}。涉及人身安全请先拨打 110 /
        120；正式调解请走「说事建档」。想看法条可点下方「去看法条顾问」。</text
      >
    </view>
    <view v-if="showSafeBar" class="safe-banner">
      <text class="safe-text"
        >如有人身安全风险，请先拨打 110 / 120，并联系村委会</text
      >
    </view>
    <view v-if="disputeContext" class="sub-banner">
      <view class="ctx-main" @click="goDisputeDetail">
        <text class="ctx-chip"
          >本案：{{ disputeContext.title || "当前纠纷" }}</text
        >
        <text v-if="disputeMetaLine" class="ctx-meta">{{
          disputeMetaLine
        }}</text>
      </view>
      <text class="ctx-close" @click="clearDisputeCtx">解除</text>
    </view>

    <scroll-view
      class="chat"
      scroll-y
      :scroll-into-view="scrollInto"
      scroll-with-animation
      :enable-flex="true"
    >
      <view class="chat-inner">
        <view v-if="!messages.length" class="welcome">
          <view class="welcome-mark">
            <rt-icon name="ai" tone="gold" size="md" />
          </view>
          <text class="welcome-kicker">{{ COPY.brandHelper }}</text>
          <text class="welcome-title">{{ COPY.aiVillageWelcome }}</text>
          <text class="welcome-hint">{{ COPY.aiVillageHint }}</text>
          <view class="suggest-list">
            <view
              v-for="(chip, idx) in quickChips.slice(0, 3)"
              :key="idx"
              class="suggest-card"
              hover-class="suggest-card-press"
              :hover-stay-time="80"
              @click="send(chip)"
            >
              <text class="suggest-card-text">{{ chip }}</text>
            </view>
          </view>
          <view class="welcome-links">
            <view
              class="welcome-cta"
              hover-class="cta-press"
              :hover-stay-time="80"
              @click="goSubmit()"
            >
              <text class="welcome-cta-text">{{ COPY.aiVillageCta }} ›</text>
            </view>
            <text class="welcome-switch" @click="goLegal">{{
              COPY.aiSwitchLegal
            }}</text>
          </view>
        </view>

        <view
          v-for="(msg, idx) in messages"
          :key="msg.id || idx"
          :id="'msg-' + idx"
          class="msg-row"
          :class="msg.role"
        >
          <view v-if="msg.role === 'assistant'" class="msg-avatar">
            <rt-icon name="ai" tone="gold" size="sm" />
          </view>
          <view class="bubble" @longpress="onCopy(msg)">
            <text class="bubble-text"
              >{{ msg.content
              }}<text v-if="msg.streaming" class="caret">▍</text></text
            >
            <view
              v-if="msg.citations && msg.citations.length && !msg.streaming"
              class="cite-row"
            >
              <text
                v-for="(c, i) in msg.citations"
                :key="i"
                class="cite-pill"
                >{{ c }}</text
              >
            </view>
            <view v-if="msg.escalate && !msg.streaming" class="esc-tip"
              >建议转人工：村委会 / 110 / 120</view
            >
            <view
              v-if="
                msg.handoff &&
                msg.handoff.channels &&
                msg.handoff.channels.length &&
                !msg.streaming
              "
              class="handoff-row"
            >
              <text class="handoff-label"
                >{{ msg.handoff.label || "转接" }}：</text
              >
              <text
                v-for="(c, i) in msg.handoff.channels"
                :key="i"
                class="handoff-pill"
                >{{ c }}</text
              >
            </view>
            <view
              v-if="
                msg.role === 'assistant' &&
                msg.task &&
                !msg.streaming &&
                !msg.failed
              "
              class="taskbar-wrap"
            >
              <rt-ai-taskbar :task="msg.task" @action="onTaskAction" />
            </view>
            <view
              v-if="
                msg.role === 'assistant' &&
                msg.ctas &&
                msg.ctas.length &&
                !showDock &&
                !msg.streaming &&
                !msg.failed &&
                !msg.task
              "
              class="msg-ctas"
            >
              <view
                v-for="cta in msg.ctas"
                :key="cta.key"
                class="msg-cta"
                :class="{ primary: cta.primary }"
                hover-class="cta-press"
                :hover-stay-time="80"
                @click="onCta(cta)"
                >{{ cta.label }}</view
              >
            </view>
            <view v-if="msg.failed && !msg.streaming" class="fb-row">
              <text class="fb-btn" @click="retryAt(idx)">重试</text>
            </view>
            <view
              v-else-if="
                msg.role === 'assistant' &&
                !msg.streaming &&
                msg.content &&
                !msg.failed
              "
              class="fb-row"
            >
              <text
                class="fb-btn"
                :class="{ on: msg.feedback === 'up' }"
                @click="onFeedback(idx, 'up')"
                >有用</text
              >
              <text
                class="fb-btn"
                :class="{ on: msg.feedback === 'down' }"
                @click="onFeedback(idx, 'down')"
                >无用</text
              >
            </view>
          </view>
        </view>

        <view v-if="typing" class="msg-row assistant">
          <view class="msg-avatar">
            <rt-icon name="ai" tone="gold" size="sm" />
          </view>
          <view class="bubble typing">
            <view class="dot" /><view class="dot" /><view class="dot" />
          </view>
        </view>

        <view id="chat-bottom" class="chat-anchor" />
      </view>
    </scroll-view>

    <view v-if="suggestions.length" class="suggestions">
      <view
        v-for="(s, idx) in suggestions"
        :key="idx"
        class="suggest-chip"
        @click="send(s)"
        >{{ s }}</view
      >
    </view>

    <view v-if="showDock" class="action-dock">
      <view
        class="dock-btn primary"
        hover-class="cta-press"
        :hover-stay-time="80"
        @click="goSubmit(true)"
      >
        去说事建档
      </view>
      <view
        class="dock-btn"
        hover-class="cta-press"
        :hover-stay-time="80"
        @click="goLaw"
      >
        看法条
      </view>
      <view
        class="dock-btn"
        hover-class="cta-press"
        :hover-stay-time="80"
        @click="onCallVillage"
      >
        联系村委
      </view>
    </view>

    <view class="composer">
      <view class="input-bar">
        <view
          v-if="voiceAvailable"
          class="voice-btn"
          :class="{ on: voiceing }"
          @touchstart.prevent="onVoiceStart"
          @touchend.prevent="onVoiceEnd"
          @touchcancel.prevent="onVoiceEnd"
          >{{ voiceing ? "松开" : "语音" }}</view
        >
        <input
          v-model="input"
          class="input"
          placeholder="问问调解流程、积分规则…"
          confirm-type="send"
          @confirm="send(input)"
        />
        <button v-if="busy" class="send-btn stop" @click="onCancel">
          停止
        </button>
        <button
          v-else
          class="send-btn"
          :disabled="!input.trim()"
          @click="send(input)"
        >
          发送
        </button>
      </view>
    </view>
    <view v-if="voiceing" class="voice-tip">正在听，松手结束…</view>
    <view class="trust-pad">
      <view class="trust-line">
        <text class="trust-link" @click="onCallVillage">联系村委</text>
        <text>·</text>
        <text class="trust-link warn" @click="onEmergency"
          >人身安全 110/120</text
        >
      </view>
    </view>

    <view v-if="historyOpen" class="sheet-mask" @click="historyOpen = false">
      <view class="sheet" @click.stop>
        <view class="sheet-head">
          <text class="sheet-title">历史对话</text>
          <text class="sheet-new" @click="onNewChat">新对话</text>
        </view>
        <scroll-view scroll-y class="sheet-list">
          <view
            v-for="item in sessionList"
            :key="item.id"
            class="sheet-item"
            :class="{ active: item.active }"
            @click="onSwitchSession(item.id)"
          >
            <view class="sheet-item-main">
              <text class="sheet-item-title">{{ item.title }}</text>
              <text class="sheet-item-time">{{
                formatTime(item.updatedAt)
              }}</text>
            </view>
            <text class="sheet-del" @click.stop="onDeleteSession(item.id)"
              >删</text
            >
          </view>
          <view v-if="!sessionList.length" class="sheet-empty">暂无历史</view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import { api } from "@/api/index.js";
import { ensureLoggedIn } from "@/utils/auth.js";
import { goNavigate } from "@/utils/nav.js";
import { VILLAGE_CONTACT_PHONE, EMERGENCY_TIP } from "@/config/env.js";
import {
  lastUserText,
  normalizeChatPayload,
  userMessageCount,
} from "@/utils/chat-handoff.js";
import { buildTaskFromChat } from "@/utils/ai-task.js";
import { setSubmitDraftText } from "@/utils/submit-draft.js";
import {
  clearCurrentChatSession,
  createChatSession,
  deleteChatSession,
  formatSessionTime,
  getCurrentChatSession,
  listChatSessions,
  openDisputeChatSession,
  saveCurrentChatSession,
  switchChatSession,
} from "@/utils/chat-session.js";
import {
  pullAndMergeChatStore,
  scheduleChatCloudPush,
} from "@/utils/chat-cloud.js";
import { createStreamer } from "@/utils/chat-stream.js";
import {
  bindVoiceHandlers,
  isVoiceInputAvailable,
  startVoiceInput,
  stopVoiceInput,
} from "@/utils/voice-input.js";
import { watchNetwork } from "@/utils/network.js";
import { isElderMode } from "@/utils/elder-mode.js";
import { COPY } from "@/utils/copy-voice.js";

const SESSION_KIND = "village";

function msgId() {
  return `m_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export default {
  data() {
    return {
      input: "",
      typing: false,
      streaming: false,
      scrollInto: "",
      suggestions: [],
      quickChips: [
        "我的办件办到哪了？",
        "说事建档要准备啥？",
        "调解大概要多久？",
        "怎么联系村委？",
      ],
      messages: [],
      disputeContext: null,
      sessionReady: false,
      historyOpen: false,
      sessionList: [],
      voiceing: false,
      requestSeq: 0,
      _streamer: null,
      _voiceBound: false,
      elderOn: false,
      online: true,
      disclaimerOpen: false,
      _unwatchNet: null,
      COPY,
    };
  },
  computed: {
    navTitle() {
      return COPY.aiVillageTitle;
    },
    disclaimerShort() {
      return "协办建议仅供参考，点此看说明";
    },
    busy() {
      return this.typing || this.streaming;
    },
    voiceAvailable() {
      return isVoiceInputAvailable();
    },
    disputeMetaLine() {
      const c = this.disputeContext;
      if (!c) return "";
      const bits = [];
      if (c.phase || c.status) bits.push(c.phase || c.status);
      if (c.category) bits.push(c.category);
      if (c.riskLevel) bits.push(`风险${c.riskLevel}`);
      return bits.join(" · ");
    },
    showSafeBar() {
      return this.messages.some(
        (m) => m && m.role === "assistant" && m.escalate && !m.streaming
      );
    },
    showDock() {
      if (userMessageCount(this.messages) < 2) return false;
      const last = [...this.messages]
        .reverse()
        .find((m) => m.role === "assistant");
      if (
        last &&
        last.ctas &&
        last.ctas.some((c) => c.key === "submit" && c.primary)
      )
        return false;
      return true;
    },
    aiDisclaimer() {
      return COPY.aiDisclaimer;
    },
  },
  onLoad() {
    this.restoreSession();
    this.setupVoice();
    this._unwatchNet = watchNetwork((online) => {
      this.online = online;
    });
  },
  onUnload() {
    if (this._streamer) this._streamer.cancel();
    this.requestSeq += 1;
    stopVoiceInput();
    if (this._unwatchNet) {
      this._unwatchNet();
      this._unwatchNet = null;
    }
  },
  onShow() {
    this.elderOn = isElderMode();
    if (!this.sessionReady) this.restoreSession();
    this.consumeDisputeHandoff();
    const prefill = uni.getStorageSync("rt_ai_prefill");
    if (prefill) {
      uni.removeStorageSync("rt_ai_prefill");
      this.$nextTick(() => this.send(prefill));
    } else if (this.messages.length) {
      this.scrollToBottom();
    }
    this.syncFromCloudQuiet();
  },
  methods: {
    formatTime: formatSessionTime,
    setupVoice() {
      if (this._voiceBound) return;
      this._voiceBound = bindVoiceHandlers({
        onPartial: (text) => {
          if (text) this.input = text;
        },
        onFinal: (text) => {
          this.voiceing = false;
          if (text) this.input = text;
        },
        onError: (msg) => {
          this.voiceing = false;
          if (String(msg).includes("VOICE") || String(msg).includes("plugin")) {
            uni.showToast({
              title: "请先在公众平台添加同声传译插件",
              icon: "none",
            });
          } else {
            uni.showToast({ title: msg || "语音识别失败", icon: "none" });
          }
        },
      });
    },
    async syncFromCloudQuiet() {
      try {
        const merged = await pullAndMergeChatStore(SESSION_KIND);
        if (!merged || this.busy) return;
        // 仅当当前页仍是空欢迎态时用云端刷新，避免打断正在聊
        if (this.messages.length) return;
        this.messages = (merged.messages || []).map((m) => ({
          ...m,
          streaming: false,
          id: m.id || msgId(),
        }));
        this.suggestions = merged.suggestions || [];
        this.disputeContext = merged.disputeContext || this.disputeContext;
      } catch (e) {
        /* ignore */
      }
    },
    consumeDisputeHandoff() {
      const ctx = uni.getStorageSync("rt_ai_dispute_ctx");
      if (!ctx) return;
      uni.removeStorageSync("rt_ai_dispute_ctx");
      const saved = openDisputeChatSession(SESSION_KIND, ctx);
      this.messages = (saved.messages || []).map((m) => ({
        ...m,
        streaming: false,
        id: m.id || msgId(),
      }));
      this.suggestions = saved.suggestions || [];
      this.disputeContext = saved.disputeContext || ctx;
      this.persistSession();
    },
    clearDisputeCtx() {
      this.disputeContext = null;
      this.persistSession();
    },
    goDisputeDetail() {
      const id = this.disputeContext && this.disputeContext.id;
      if (!id) return;
      goNavigate(`/pages/disputeDetail/disputeDetail?id=${id}`);
    },
    restoreSession() {
      const saved = getCurrentChatSession(SESSION_KIND);
      this.messages = (saved.messages || []).map((m) => ({
        ...m,
        streaming: false,
        id: m.id || msgId(),
      }));
      this.suggestions = saved.suggestions || [];
      this.disputeContext = saved.disputeContext || this.disputeContext;
      this.sessionReady = true;
    },
    persistSession() {
      saveCurrentChatSession(SESSION_KIND, {
        messages: this.messages.map((m) => {
          const { streaming, ...rest } = m;
          return rest;
        }),
        suggestions: this.suggestions,
        disputeContext: this.disputeContext,
      });
      scheduleChatCloudPush(SESSION_KIND);
    },
    refreshSessionList() {
      this.sessionList = listChatSessions(SESSION_KIND);
    },
    openHistory() {
      this.refreshSessionList();
      this.historyOpen = true;
    },
    onNewChat() {
      if (this.busy) return;
      createChatSession(SESSION_KIND, { disputeContext: null });
      this.messages = [];
      this.suggestions = [];
      this.disputeContext = null;
      this.historyOpen = false;
      this.refreshSessionList();
    },
    onSwitchSession(id) {
      if (this.busy) return;
      const saved = switchChatSession(SESSION_KIND, id);
      this.messages = (saved.messages || []).map((m) => ({
        ...m,
        streaming: false,
        id: m.id || msgId(),
      }));
      this.suggestions = saved.suggestions || [];
      this.disputeContext = saved.disputeContext || null;
      this.historyOpen = false;
      this.scrollToBottom();
    },
    onDeleteSession(id) {
      uni.showModal({
        title: "删除对话",
        content: "确定删除这条历史吗？",
        success: (res) => {
          if (!res.confirm) return;
          const saved = deleteChatSession(SESSION_KIND, id);
          this.messages = (saved.messages || []).map((m) => ({
            ...m,
            streaming: false,
            id: m.id || msgId(),
          }));
          this.suggestions = saved.suggestions || [];
          this.disputeContext = saved.disputeContext || null;
          this.refreshSessionList();
        },
      });
    },
    onClear() {
      uni.showModal({
        title: "清空对话",
        content: "确定清空当前聊天记录吗？",
        success: (res) => {
          if (!res.confirm) return;
          if (this._streamer) this._streamer.cancel();
          this.typing = false;
          this.streaming = false;
          clearCurrentChatSession(SESSION_KIND);
          this.messages = [];
          this.suggestions = [];
          this.disputeContext = null;
        },
      });
    },
    priorHistory() {
      return this.messages
        .filter(
          (m) =>
            (m.role === "user" || m.role === "assistant") &&
            m.content &&
            !m.failed
        )
        .slice(0, -1)
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));
    },
    async send(text) {
      if (!ensureLoggedIn({ tip: "咨询协办请先登录" })) return;
      const message = (text || "").trim();
      if (!message || this.busy) return;
      if (!this.online) {
        uni.showToast({ title: "当前无网络，请稍后重试", icon: "none" });
        return;
      }
      this.messages.push({ id: msgId(), role: "user", content: message });
      this.persistSession();
      this.input = "";
      this.suggestions = [];
      this.scrollToBottom();
      await this.requestReply(message);
    },
    async retryAt(idx) {
      if (!ensureLoggedIn({ tip: "咨询协办请先登录" })) return;
      const msg = this.messages[idx];
      if (!msg || !msg.failed || this.busy) return;
      const userMsg = [...this.messages]
        .slice(0, idx)
        .reverse()
        .find((m) => m.role === "user");
      if (!userMsg) return;
      this.messages.splice(idx, 1);
      this.persistSession();
      await this.requestReply(userMsg.content);
    },
    async requestReply(message) {
      const seq = ++this.requestSeq;
      this.typing = true;
      this.scrollToBottom();
      try {
        const res = await api.aiChat({
          message,
          history: this.priorHistory(),
          disputeContext: this.disputeContext,
        });
        if (seq !== this.requestSeq) return;
        const data = normalizeChatPayload(res.data || {}, "village");
        const full = data.reply || "暂时无法回答，请稍后再试。";
        this.typing = false;
        const assistant = {
          id: msgId(),
          role: "assistant",
          content: "",
          streaming: true,
          citations: data.citations,
          escalate: data.escalate,
          handoff: data.handoff,
          ctas: data.ctas,
          task: buildTaskFromChat(data, "village"),
          feedback: null,
        };
        this.messages.push(assistant);
        this.suggestions = data.suggestions || [];
        await this.reveal(assistant, full, seq);
      } catch (e) {
        if (seq !== this.requestSeq) return;
        this.typing = false;
        this.messages.push({
          id: msgId(),
          role: "assistant",
          content: e.message || "网络异常，请重试。",
          failed: true,
        });
        this.persistSession();
        this.scrollToBottom();
      }
    },
    async reveal(msg, full, seq) {
      if (this._streamer) this._streamer.cancel();
      this._streamer = createStreamer();
      this.streaming = true;
      await this._streamer.run(full, (chunk, done) => {
        if (seq != null && seq !== this.requestSeq) return;
        msg.content = chunk;
        msg.streaming = !done;
        this.scrollToBottom();
      });
      if (seq != null && seq !== this.requestSeq) {
        this.streaming = false;
        return;
      }
      msg.streaming = false;
      msg.content = full;
      this.streaming = false;
      this.persistSession();
      this.scrollToBottom();
    },
    onCancel() {
      this.requestSeq += 1;
      if (this._streamer) this._streamer.cancel();
      this.typing = false;
      this.streaming = false;
      const last = this.messages[this.messages.length - 1];
      if (last && last.role === "assistant" && last.streaming) {
        last.streaming = false;
        if (!last.content) last.content = "（已停止生成）";
      }
      this.persistSession();
    },
    async onVoiceStart() {
      if (this.busy) return;
      if (!isVoiceInputAvailable()) {
        uni.showToast({ title: "语音暂未开通，请用文字输入", icon: "none" });
        return;
      }
      this.setupVoice();
      try {
        await startVoiceInput({ duration: 30000 });
        this.voiceing = true;
      } catch (e) {
        this.voiceing = false;
        const msg = (e && e.message) || "";
        if (msg === "VOICE_UNAVAILABLE") {
          uni.showToast({ title: "语音暂未开通，请用文字输入", icon: "none" });
        } else {
          uni.showToast({ title: msg || "无法开始录音", icon: "none" });
        }
      }
    },
    onVoiceEnd() {
      if (!this.voiceing) return;
      stopVoiceInput();
      // onFinal 会收尾；此处兜底
      setTimeout(() => {
        this.voiceing = false;
      }, 400);
    },
    onCopy(msg) {
      if (!msg || !msg.content) return;
      uni.setClipboardData({
        data: msg.content,
        success: () => uni.showToast({ title: "已复制", icon: "none" }),
      });
    },
    async onFeedback(idx, type) {
      const msg = this.messages[idx];
      if (!msg || msg.role !== "assistant" || msg.feedback) return;
      msg.feedback = type;
      this.persistSession();
      if (type === "up") {
        uni.showToast({ title: "感谢反馈", icon: "none" });
        return;
      }
      const userQ = [...this.messages]
        .slice(0, idx)
        .reverse()
        .find((m) => m.role === "user");
      const content = `[AI回答反馈·无用] 问：${
        (userQ && userQ.content) || ""
      }｜答：${(msg.content || "").slice(0, 200)}`;
      try {
        await api.createFeedback({ content });
        uni.showToast({ title: "已记录，我们会改进", icon: "none" });
      } catch (e) {
        uni.showToast({ title: "已记录本地反馈", icon: "none" });
      }
    },
    onCta(cta) {
      if (!cta) return;
      if (cta.key === "submit") {
        this.goSubmit(true);
        return;
      }
      if (cta.key === "call") {
        this.onCallVillage();
        return;
      }
      if (cta.key === "law" || cta.path === "/pages/law/law") {
        this.goLaw();
        return;
      }
      if (cta.path) goNavigate(cta.path);
    },
    onTaskAction(a) {
      this.onCta(a);
    },
    goLaw() {
      goNavigate("/pages/law/law");
    },
    goLegal() {
      goNavigate("/pages/law/aiLegal");
    },
    onCallVillage() {
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
        content: EMERGENCY_TIP || "如有人身安全风险，请立即拨打 110 / 120。",
        confirmText: "拨打 110",
        success: (res) => {
          if (!res.confirm) return;
          uni.makePhoneCall({
            phoneNumber: "110",
            fail: () =>
              uni.showToast({ title: "请手动拨打 110", icon: "none" }),
          });
        },
      });
    },
    goSubmit(withDraft) {
      if (withDraft) {
        const draft = lastUserText(this.messages);
        if (draft) setSubmitDraftText(draft, "village-ai");
      }
      goNavigate("/pages/village/submit");
    },
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollInto = "";
        this.$nextTick(() => {
          this.scrollInto = "chat-bottom";
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/chat-ui.scss";
</style>
