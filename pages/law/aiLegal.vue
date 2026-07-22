<template>
  <view class="page chat-theme law" :class="{ elder: elderOn }">
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
        >普法回答仅供参考，不构成法律意见。正式调解请走「说事建档」。要跟进办件可点「去问村务协办」。</text
      >
    </view>
    <view v-if="showSafeBar" class="safe-banner">
      <text class="safe-text"
        >如有人身安全风险，请先拨打 110 / 120，并联系村委会</text
      >
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
          <text class="welcome-kicker">{{ COPY.aiLegalTitle }}</text>
          <text class="welcome-title">{{ COPY.aiLegalWelcome }}</text>
          <text class="welcome-hint">{{ COPY.aiLegalHint }}</text>
          <view class="chips">
            <view
              v-for="(chip, idx) in quickChips"
              :key="idx"
              class="chip"
              hover-class="chip-active"
              :hover-stay-time="80"
              @click="send(chip)"
              >{{ chip }}</view
            >
          </view>
          <view
            class="welcome-cta ghost"
            hover-class="cta-press"
            :hover-stay-time="80"
            @click="goSubmit()"
          >
            <text class="welcome-cta-text">{{ COPY.aiLegalCta }}</text>
          </view>
          <text class="welcome-switch" @click="goVillageAi">{{
            COPY.aiSwitchVillage
          }}</text>
        </view>

        <view
          v-for="(msg, idx) in messages"
          :key="msg.id || idx"
          :id="'msg-' + idx"
          class="msg-row"
          :class="msg.role"
        >
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
          <view class="bubble typing"
            ><text class="dot">·</text><text class="dot">·</text
            ><text class="dot">·</text></view
          >
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
        placeholder="例如：土地边界被占了怎么办？"
        confirm-type="send"
        @confirm="send(input)"
      />
      <button v-if="busy" class="send-btn stop" @click="onCancel">停止</button>
      <button
        v-else
        class="send-btn"
        :disabled="!input.trim()"
        @click="send(input)"
      >
        发送
      </button>
    </view>
    <view v-if="voiceing" class="voice-tip">正在听，松手结束…</view>
    <view class="trust-pad">
      <rt-trust-bar />
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
import { goNavigate } from "@/utils/nav.js";
import { VILLAGE_CONTACT_PHONE } from "@/config/env.js";
import { isElderMode } from "@/utils/elder-mode.js";
import { COPY } from "@/utils/copy-voice.js";
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

const SESSION_KIND = "legal";

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
      messages: [],
      sessionReady: false,
      historyOpen: false,
      sessionList: [],
      voiceing: false,
      requestSeq: 0,
      _streamer: null,
      _voiceBound: false,
      online: true,
      elderOn: false,
      disclaimerOpen: false,
      _unwatchNet: null,
      quickChips: [
        "土地边界该留什么证据？",
        "邻居占道怎么沟通？",
        "欠薪讨薪先找谁？",
        "防诈骗记住哪三条？",
      ],
      COPY,
    };
  },
  computed: {
    navTitle() {
      return COPY.aiLegalTitle;
    },
    disclaimerShort() {
      return "普法仅供参考，点此看说明";
    },
    busy() {
      return this.typing || this.streaming;
    },
    voiceAvailable() {
      return isVoiceInputAvailable();
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
    const prefill = uni.getStorageSync("rt_legal_prefill");
    if (prefill) {
      uni.removeStorageSync("rt_legal_prefill");
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
          uni.showToast({
            title:
              String(msg || "").includes("plugin") ||
              String(msg || "").includes("VOICE")
                ? "请先在公众平台添加同声传译插件"
                : msg || "语音识别失败",
            icon: "none",
          });
        },
      });
    },
    async syncFromCloudQuiet() {
      try {
        const merged = await pullAndMergeChatStore(SESSION_KIND);
        if (!merged || this.busy || this.messages.length) return;
        this.messages = (merged.messages || []).map((m) => ({
          ...m,
          streaming: false,
          id: m.id || msgId(),
        }));
        this.suggestions = merged.suggestions || [];
      } catch (e) {
        /* ignore */
      }
    },
    restoreSession() {
      const saved = getCurrentChatSession(SESSION_KIND);
      this.messages = (saved.messages || []).map((m) => ({
        ...m,
        streaming: false,
        id: m.id || msgId(),
      }));
      this.suggestions = saved.suggestions || [];
      this.sessionReady = true;
    },
    apiHistory() {
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
    persistSession() {
      const history = this.messages
        .filter(
          (m) =>
            (m.role === "user" || m.role === "assistant") &&
            m.content &&
            !m.failed &&
            !m.streaming
        )
        .map((m) => ({ role: m.role, content: m.content }));
      saveCurrentChatSession(SESSION_KIND, {
        messages: this.messages.map((m) => {
          const { streaming, ...rest } = m;
          return rest;
        }),
        history,
        suggestions: this.suggestions,
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
      createChatSession(SESSION_KIND);
      this.messages = [];
      this.suggestions = [];
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
          this.requestSeq += 1;
          this.typing = false;
          this.streaming = false;
          clearCurrentChatSession(SESSION_KIND);
          this.messages = [];
          this.suggestions = [];
          scheduleChatCloudPush(SESSION_KIND);
        },
      });
    },
    async send(text) {
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
        const res = await api.aiLegalChat({
          message,
          history: this.apiHistory(),
        });
        if (seq !== this.requestSeq) return;
        const data = normalizeChatPayload(res.data || {}, "legal");
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
          task: buildTaskFromChat(data, "legal"),
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
        uni.showToast({
          title:
            msg === "VOICE_UNAVAILABLE"
              ? "语音暂未开通，请用文字输入"
              : msg || "无法开始录音",
          icon: "none",
        });
      }
    },
    onVoiceEnd() {
      if (!this.voiceing) return;
      stopVoiceInput();
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
      const content = `[普法AI·无用] 问：${
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
    goVillageAi() {
      goNavigate("/pages/ai/assistant");
    },
    onCallVillage() {
      const phone = VILLAGE_CONTACT_PHONE || "";
      if (!phone) {
        uni.showToast({ title: "暂未配置村委电话", icon: "none" });
        return;
      }
      uni.makePhoneCall({ phoneNumber: String(phone).replace(/\D/g, "") });
    },
    goSubmit(withDraft) {
      if (withDraft) {
        const draft = lastUserText(this.messages);
        if (draft) setSubmitDraftText(draft, "legal-ai");
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
@import "@/styles/theme.scss";

.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: $rt-bg;
  box-sizing: border-box;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.nav-link {
  font-size: 26rpx;
  font-weight: 600;
  color: $rt-primary-dark;
  padding: 8rpx 4rpx;
}

.net-banner {
  flex-shrink: 0;
  padding: 12rpx $rt-page-x;
  background: rgba(230, 81, 0, 0.1);
  border-bottom: 1rpx solid rgba(230, 81, 0, 0.2);
}
.net-text {
  font-size: 22rpx;
  font-weight: 700;
  color: #e65100;
  line-height: 1.4;
}
.disclaimer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 10rpx $rt-page-x;
  background: rgba(255, 255, 255, 0.72);
  border-bottom: 1rpx solid rgba(201, 162, 74, 0.16);
}
.disclaimer-main {
  flex: 1;
  min-width: 0;
  font-size: 20rpx;
  color: $rt-text-muted;
  line-height: 1.4;
}
.disclaimer-toggle {
  flex-shrink: 0;
  font-size: 20rpx;
  font-weight: 700;
  color: $rt-accent-dark;
}
.disclaimer-body {
  flex-shrink: 0;
  padding: 0 $rt-page-x 12rpx;
  background: rgba(255, 255, 255, 0.72);
}
.disclaimer-detail {
  font-size: 20rpx;
  color: $rt-text-secondary;
  line-height: 1.5;
}

.safe-banner {
  flex-shrink: 0;
  padding: 14rpx $rt-page-x;
  background: rgba(198, 40, 40, 0.08);
  border-bottom: 1rpx solid rgba(198, 40, 40, 0.18);
}
.safe-text {
  font-size: 22rpx;
  font-weight: 700;
  color: #c62828;
  line-height: 1.45;
}

.chat {
  flex: 1;
  height: 0;
  min-height: 0;
  box-sizing: border-box;
}

.chat-inner {
  padding: 24rpx $rt-page-x 48rpx;
  box-sizing: border-box;
}

.chat-anchor {
  width: 100%;
  height: 2rpx;
}

.welcome {
  padding: 40rpx 0;
  text-align: center;
}
.welcome-kicker {
  display: block;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-blue;
  margin-bottom: 8rpx;
}
.welcome-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $rt-text;
  line-height: 1.4;
}
.welcome-hint {
  display: block;
  margin: 12rpx 32rpx 0;
  font-size: $rt-type-micro;
  color: $rt-text-secondary;
  line-height: 1.45;
}
.welcome-switch {
  display: block;
  margin-top: 20rpx;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-primary;
}
.chips {
  margin-top: 28rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  justify-content: center;
}
.chip {
  padding: 14rpx 22rpx;
  border-radius: $rt-radius-sm;
  background: $rt-surface;
  border: 1rpx solid $rt-border;
  color: $rt-text-secondary;
  font-size: 26rpx;
}
.chip-active {
  background: $rt-blue-soft;
  color: $rt-blue;
}
.welcome-cta {
  margin: 28rpx auto 0;
  display: inline-flex;
  padding: 18rpx 36rpx;
  border-radius: 999rpx;
  background: $rt-primary;
}
.welcome-cta.ghost {
  background: $rt-surface;
  border: 1rpx solid rgba(58, 74, 99, 0.2);
}
.welcome-cta.ghost .welcome-cta-text {
  color: $rt-blue;
}
.welcome-cta-text {
  font-size: 26rpx;
  font-weight: 800;
  color: #fff;
}
.cta-press {
  opacity: 0.9;
}
.cite-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}
.cite-pill {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: $rt-radius-xs;
  background: $rt-olive-soft;
  color: $rt-olive;
  font-weight: 600;
}
.esc-tip {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #c62828;
  font-weight: 700;
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
  background: rgba(198, 40, 40, 0.08);
  color: #c62828;
  font-weight: 600;
}
.msg-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 16rpx;
}
.taskbar-wrap {
  margin-top: 16rpx;
}
.trust-pad {
  padding: 0 $rt-page-x 8rpx;
}
.msg-cta {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 700;
  color: $rt-primary-dark;
  background: $rt-primary-soft;
  border: 1rpx solid rgba(27, 67, 50, 0.2);
}
.msg-cta.primary {
  color: #fff;
  background: $rt-primary;
  border-color: transparent;
}
.fb-row {
  display: flex;
  gap: 16rpx;
  margin-top: 14rpx;
}
.fb-btn {
  font-size: 22rpx;
  color: $rt-text-secondary;
  padding: 4rpx 0;
}
.fb-btn.on {
  color: $rt-primary-dark;
  font-weight: 700;
}
.msg-row {
  display: flex;
  margin-bottom: 20rpx;
}
.msg-row.user {
  justify-content: flex-end;
}
.msg-row.assistant {
  justify-content: flex-start;
}
.bubble {
  max-width: 86%;
  padding: 22rpx 26rpx;
  border-radius: 24rpx;
  font-size: 28rpx;
  line-height: 1.6;
  word-break: break-word;
}
.user .bubble {
  background: $rt-primary;
  color: #fff;
  border-bottom-right-radius: 8rpx;
}
.assistant .bubble {
  background: $rt-surface;
  color: $rt-text;
  border: 1rpx solid $rt-border;
  border-bottom-left-radius: 8rpx;
}
.caret {
  opacity: 0.45;
  animation: blink 0.9s step-end infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
.suggestions {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding: 0 $rt-page-x 12rpx;
}
.suggest-chip {
  padding: 12rpx 20rpx;
  border-radius: $rt-radius-sm;
  background: $rt-surface;
  border: 1rpx solid $rt-border;
  font-size: 24rpx;
  color: $rt-text-secondary;
}
.action-dock {
  flex-shrink: 0;
  display: flex;
  gap: 12rpx;
  padding: 12rpx $rt-page-x;
  background: rgba(255, 252, 247, 0.96);
  border-top: 1rpx solid rgba(58, 74, 99, 0.14);
}
.dock-btn {
  flex: 1;
  min-height: $rt-touch-min;
  text-align: center;
  padding: 18rpx 8rpx;
  border-radius: 999rpx;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-blue;
  background: $rt-surface;
  border: 1rpx solid rgba(58, 74, 99, 0.22);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dock-btn.full {
  width: 100%;
}
.dock-btn.primary {
  flex: 1.35;
  color: #fff;
  background: linear-gradient(135deg, #2a3648, $rt-blue);
  border-color: transparent;
}
.input-bar {
  flex-shrink: 0;
  display: flex;
  gap: 12rpx;
  padding: 16rpx $rt-page-x calc(16rpx + env(safe-area-inset-bottom));
  background: $rt-surface;
  border-top: 1rpx solid $rt-border;
}
.voice-btn {
  flex-shrink: 0;
  height: 80rpx;
  padding: 0 18rpx;
  line-height: 80rpx;
  border-radius: $rt-radius-sm;
  font-size: 24rpx;
  font-weight: 700;
  color: $rt-primary-dark;
  background: $rt-primary-soft;
  border: 1rpx solid rgba(27, 67, 50, 0.2);
}
.voice-btn.on {
  background: rgba(198, 40, 40, 0.1);
  color: #c62828;
  border-color: rgba(198, 40, 40, 0.25);
}
.voice-tip {
  flex-shrink: 0;
  text-align: center;
  padding: 0 $rt-page-x 12rpx;
  font-size: 22rpx;
  color: #c62828;
  font-weight: 600;
}
.input {
  flex: 1;
  height: 80rpx;
  padding: 0 24rpx;
  @include rt-form-input;
}
.send-btn {
  @include rt-btn-reset;
  width: 128rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: $rt-radius-sm;
  background: $rt-primary;
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}
.send-btn.stop {
  background: #c62828;
}
.send-btn[disabled] {
  opacity: 0.5;
}
.typing {
  display: flex;
  gap: 8rpx;
}
.dot {
  font-size: 40rpx;
  line-height: 1;
  opacity: 0.5;
}

.sheet-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(20, 24, 18, 0.42);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}
.sheet {
  width: 100%;
  max-height: 68vh;
  background: $rt-surface;
  border-radius: 28rpx 28rpx 0 0;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx 16rpx;
}
.sheet-title {
  font-size: 30rpx;
  font-weight: 800;
  color: $rt-text;
}
.sheet-new {
  font-size: 26rpx;
  font-weight: 700;
  color: $rt-primary-dark;
}
.sheet-list {
  max-height: 52vh;
  padding: 0 16rpx 8rpx;
  box-sizing: border-box;
}
.sheet-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 22rpx 16rpx;
  border-radius: 16rpx;
  margin-bottom: 8rpx;
}
.sheet-item.active {
  background: $rt-primary-soft;
}
.sheet-item-main {
  flex: 1;
  min-width: 0;
}
.sheet-item-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $rt-text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sheet-item-time {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $rt-text-secondary;
}
.sheet-del {
  font-size: 24rpx;
  color: $rt-text-secondary;
  padding: 8rpx 12rpx;
}
.sheet-empty {
  text-align: center;
  padding: 48rpx;
  color: $rt-text-secondary;
  font-size: 26rpx;
}
</style>
