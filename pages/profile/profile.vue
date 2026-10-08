<template>
  <view class="page" :class="{ elder: elderOn }">
    <page-hero compact variant="village" title="我的" />

    <view v-if="guestMode" class="guest-shell">
      <!-- 身份区：大厂常见「点头像/点登录」主入口 -->
      <view
        class="guest-id enter"
        hover-class="guest-id-press"
        :hover-stay-time="80"
        @click="goLogin"
      >
        <view class="guest-avatar" aria-hidden="true">
          <rt-icon name="user" tone="ghost" size="md" />
        </view>
        <view class="guest-id-body">
          <text class="guest-hello">你好，村民</text>
          <text class="guest-hint">登录后查看办件、积分与个人服务</text>
        </view>
        <view class="guest-login-pill">登录</view>
      </view>

      <view
        class="guest-cta enter delay-1"
        hover-class="press"
        :hover-stay-time="80"
        @click="goLogin"
      >
        <text class="guest-cta-text">微信一键登录</text>
        <text class="guest-cta-sub">安全便捷 · 办理时再登录即可</text>
      </view>

      <!-- 登录权益：降低「为什么要登」心智成本 -->
      <view class="guest-benefits enter delay-1">
        <view v-for="b in guestBenefits" :key="b.title" class="guest-benefit">
          <view class="guest-benefit-icon" :class="b.tone">
            <rt-icon :name="b.icon" :tone="b.iconTone" size="sm" />
          </view>
          <text class="guest-benefit-title">{{ b.title }}</text>
          <text class="guest-benefit-desc">{{ b.desc }}</text>
        </view>
      </view>

      <!-- 可先逛：公开内容不断流 -->
      <rt-section title="可先逛逛" class="enter delay-2">
        <view class="guest-grid">
          <view
            v-for="item in guestBrowse"
            :key="item.path"
            class="guest-tile"
            hover-class="guest-tile-press"
            :hover-stay-time="80"
            @click="goBrowse(item.path)"
          >
            <rt-icon :name="item.icon" :tone="item.tone" size="sm" />
            <text class="guest-tile-title">{{ item.title }}</text>
            <text class="guest-tile-desc">{{ item.desc }}</text>
          </view>
        </view>
      </rt-section>

      <!-- 锁定服务：展示完整信息架构，点击再引导登录 -->
      <rt-section title="登录后可用" class="enter delay-3">
        <rt-card elevated>
          <rt-cell
            v-for="(item, idx) in guestLocked"
            :key="item.key"
            :title="item.title"
            :desc="item.desc"
            :icon="item.icon"
            :icon-tone="item.tone"
            :last="idx === guestLocked.length - 1"
            @click="goLocked(item)"
          />
        </rt-card>
      </rt-section>

      <view class="guest-trust enter delay-3">
        <text class="guest-trust-line"
          >登录即表示同意《用户协议》与《隐私政策》</text
        >
        <text class="guest-trust-line muted">不单独采集手机号与证件影像</text>
        <view class="guest-trust-links">
          <text class="guest-trust-link" @click="onOpenUserAgreement"
            >用户协议</text
          >
          <text class="guest-trust-dot">·</text>
          <text class="guest-trust-link" @click="onOpenPrivacy">隐私政策</text>
          <template v-if="isAppClient">
            <text class="guest-trust-dot">·</text>
            <text
              class="guest-trust-link"
              @click="goPage('/pages/app/permissions')"
              >权限说明</text
            >
          </template>
        </view>
      </view>
    </view>

    <template v-else>
      <!-- 身份卡：个人主体审核不采集头像授权/手机号绑定 -->
      <view class="id-card enter">
        <view class="avatar-btn static">
          <image
            v-if="avatarSrc"
            class="avatar-img"
            :src="avatarSrc"
            mode="aspectFill"
          />
          <view v-else class="avatar">{{ avatarText }}</view>
        </view>
        <view class="id-body">
          <view class="id-name-row">
            <text class="id-name">{{ user.nickname || "村民用户" }}</text>
            <text v-if="user.isAdmin" class="role-pill">干部</text>
            <text v-else class="role-pill soft">村民</text>
          </view>
          <text class="id-meta">{{ user.village || "示范村" }}</text>
          <text class="id-phone soft">{{
            isAppClient ? "本机登录用户" : "微信登录用户"
          }}</text>
        </view>
      </view>

      <!-- 待办聚合（仪表优先） -->
      <view
        class="todo-bar enter delay-1"
        :class="{ empty: !todoCount }"
        hover-class="todo-press"
        :hover-stay-time="80"
        @click="onTodoTap"
      >
        <view class="todo-main">
          <text class="todo-title">{{ todoTitle }}</text>
          <text class="todo-sub">{{ todoSub }}</text>
        </view>
        <text class="todo-action">{{ todoCount ? "去处理" : "去建档" }}</text>
      </view>

      <!-- 最近办件 -->
      <rt-section :title="recentSectionTitle">
        <view v-if="recentDisputes.length" class="recent-list">
          <view
            v-for="item in recentDisputes"
            :key="item._id"
            class="recent-card"
            hover-class="recent-press"
            :hover-stay-time="80"
            @click="goDispute(item._id)"
          >
            <view class="recent-top">
              <text class="recent-title">{{ item.title || "未命名纠纷" }}</text>
              <text class="recent-phase">{{ item.phaseLabel }}</text>
            </view>
            <text class="recent-tip">{{ item.tip }}</text>
          </view>
          <view class="recent-more" @click="goPage('/pages/village/records')"
            >查看全部调解办件</view
          >
        </view>
        <empty-state
          v-else
          compact
          icon-type="dispute"
          icon-tone="green"
          :title="emptyCaseTitle"
          :desc="emptyCaseDesc"
          action-text="去说事建档"
          @action="goPage('/pages/village/submit')"
        />
      </rt-section>

      <!-- 积分入口 -->
      <view
        class="wallet enter delay-2"
        hover-class="wallet-press"
        :hover-stay-time="80"
        @click="goTab('/pages/moral/moral')"
      >
        <view class="wallet-left">
          <text class="wallet-label">我的积分</text>
          <text class="wallet-hint">{{ pointsHint }}</text>
        </view>
        <view class="wallet-right">
          <text class="wallet-num">{{ pointsText }}</text>
          <text
            v-if="monthPointsDelta"
            class="wallet-delta"
            :class="{ up: monthPointsDelta > 0 }"
          >
            本月 {{ monthPointsDelta > 0 ? "+" : "" }}{{ monthPointsDelta }}
          </text>
          <text v-else class="wallet-arrow">去查看</text>
        </view>
      </view>

      <!-- 数字快捷（非简洁模式） -->
      <view v-if="!elderOn" class="stats">
        <view
          v-for="s in stats"
          :key="s.key"
          class="stat"
          hover-class="stat-press"
          :hover-stay-time="80"
          @click="goPage(s.path)"
        >
          <text v-if="loadingStats" class="stat-num muted">—</text>
          <text
            v-else
            class="stat-num"
            :class="{ hot: s.value > 0 && s.hot }"
            >{{ s.value }}</text
          >
          <text class="stat-label">{{ s.label }}</text>
        </view>
      </view>

      <view class="fold enter delay-3" :class="{ open: fold.ai }">
        <view
          class="fold-head"
          hover-class="fold-press"
          :hover-stay-time="80"
          @click="toggleFold('ai')"
        >
          <view class="fold-titles">
            <view class="accent-bar" />
            <text class="fold-title">协办与普法</text>
          </view>
          <text class="fold-arrow">{{ fold.ai ? "收起" : "展开" }}</text>
        </view>
        <view v-if="fold.ai" class="fold-body">
          <view v-if="weekSummary" class="week-card">
            <text class="week-kicker">本周小结</text>
            <text class="week-text">{{ weekSummary }}</text>
          </view>
          <rt-card compact flush elevated class="group-card">
            <rt-cell
              :title="aiVillageTitle"
              :desc="aiContinueDesc"
              icon="ai"
              icon-tone="blue"
              @click="goAi"
            />
            <rt-cell
              :title="aiLegalTitle"
              :desc="aiLegalDesc"
              icon="law"
              icon-tone="blue"
              @click="goLegal"
            />
            <rt-cell
              v-if="submitDraft"
              title="待确认建档草稿"
              :desc="draftPreview"
              icon="declare"
              icon-tone="green"
              tag="草稿"
              tag-type="warn"
              @click="goPage('/pages/village/submit')"
            />
            <rt-cell
              title="对话历史"
              :desc="aiHistoryDesc"
              icon="record"
              icon-tone="blue"
              last
              @click="goAi"
            />
          </rt-card>
        </view>
      </view>

      <view class="fold" :class="{ open: fold.records }">
        <view
          class="fold-head"
          hover-class="fold-press"
          :hover-stay-time="80"
          @click="toggleFold('records')"
        >
          <view class="fold-titles">
            <view class="accent-bar" />
            <text class="fold-title">正在办</text>
          </view>
          <text class="fold-arrow">{{ fold.records ? "收起" : "展开" }}</text>
        </view>
        <view v-if="fold.records" class="fold-body">
          <rt-card compact flush elevated class="group-card">
            <rt-cell
              title="调解办件"
              :desc="disputeDesc"
              icon="record"
              icon-tone="green"
              @click="goPage('/pages/village/records')"
            />
            <rt-cell
              title="意见与答复"
              :desc="feedbackDesc"
              icon="feedback"
              icon-tone="green"
              last
              @click="goPage('/pages/village/feedback')"
            />
          </rt-card>
        </view>
      </view>

      <view class="fold" :class="{ open: fold.more }">
        <view
          class="fold-head"
          hover-class="fold-press"
          :hover-stay-time="80"
          @click="toggleFold('more')"
        >
          <view class="fold-titles">
            <view class="accent-bar" />
            <text class="fold-title">服务与激励</text>
          </view>
          <text class="fold-arrow">{{ fold.more ? "收起" : "展开" }}</text>
        </view>
        <view v-if="fold.more" class="fold-body">
          <rt-card compact flush elevated class="group-card">
            <rt-cell
              title="积分激励"
              desc="查看调解激励说明"
              icon="moral"
              icon-tone="gold"
              @click="goPage('/pages/moral/moral')"
            />
            <rt-cell
              title="积分礼遇"
              desc="礼品意向请联系村委（线下核销，无在线交易）"
              icon="mall"
              icon-tone="gold"
              @click="goPage('/pages/moral/mall')"
            />
            <rt-cell
              title="惠民好物"
              :desc="groupCellDesc"
              icon="product"
              icon-tone="green"
              :last="!showOrdersEntry"
              @click="goPage('/pages/group/group')"
            />
            <rt-cell
              v-if="showOrdersEntry"
              title="我的预约"
              desc="好物意向登记记录"
              icon="record"
              icon-tone="green"
              last
              @click="goPage('/pages/group/orders')"
            />
          </rt-card>
        </view>
      </view>

      <view v-if="user.isAdmin" class="fold" :class="{ open: fold.admin }">
        <view
          class="fold-head"
          hover-class="fold-press"
          :hover-stay-time="80"
          @click="toggleFold('admin')"
        >
          <view class="fold-titles">
            <view class="accent-bar" />
            <text class="fold-title">干部工作台</text>
          </view>
          <text class="fold-arrow">{{ fold.admin ? "收起" : "展开" }}</text>
        </view>
        <view v-if="fold.admin" class="fold-body">
          <rt-card compact flush elevated class="group-card">
            <rt-cell
              title="调解员工作台"
              desc="受理与推进"
              icon="declare"
              icon-tone="green"
              @click="goPage('/pages/admin/disputes')"
            />
            <rt-cell
              title="质量看板"
              desc="评测与问题单"
              icon="ai"
              icon-tone="blue"
              last
              @click="goPage('/pages/admin/ai-quality')"
            />
          </rt-card>
        </view>
      </view>

      <view class="fold" :class="{ open: fold.help }">
        <view
          class="fold-head"
          hover-class="fold-press"
          :hover-stay-time="80"
          @click="toggleFold('help')"
        >
          <view class="fold-titles">
            <view class="accent-bar" />
            <text class="fold-title">设置</text>
          </view>
          <text class="fold-arrow">{{ fold.help ? "收起" : "展开" }}</text>
        </view>
        <view v-if="fold.help" class="fold-body">
          <rt-card compact flush elevated class="group-card">
            <rt-cell
              title="老年简洁模式"
              :desc="
                elderOn
                  ? '已开启 · 字更大、界面更简洁'
                  : '字更大、对比更强、减少装饰'
              "
              :tag="elderOn ? '开' : '关'"
              icon="feedback"
              @click="onToggleElder"
            />
            <rt-cell
              title="村务通知"
              :desc="noticeDesc"
              icon="notice"
              icon-tone="green"
              :tag="noticeUnread ? String(noticeUnread) : ''"
              :tag-type="noticeUnread ? 'warn' : 'default'"
              @click="goPage('/pages/village/notice')"
            />
            <rt-cell
              v-if="isAppClient"
              title="办件进度提醒"
              :desc="pushDesc"
              icon="notice"
              icon-tone="gold"
              :tag="pushOn ? '开' : '关'"
              @click="onTogglePush"
            />
            <rt-cell
              title="联系村委"
              :desc="villagePhone"
              icon="declare"
              icon-tone="green"
              @click="onCallVillage"
            />
            <rt-cell
              title="清除本地缓存"
              desc="聊天历史与草稿将清除"
              icon="feedback"
              @click="onClearCache"
            />
            <rt-cell
              v-if="isAppClient"
              title="权限说明"
              desc="麦克风、电话、通知等何时申请"
              icon="law"
              @click="goPage('/pages/app/permissions')"
            />
            <rt-cell title="用户协议" icon="law" @click="onOpenUserAgreement" />
            <rt-cell
              title="隐私政策"
              icon="feedback"
              :desc="privacyLinkDesc"
              @click="onOpenPrivacy"
            />
            <rt-cell
              title="账号注销说明"
              desc="如何申请注销本账号"
              icon="law"
              @click="onAccountDelete"
            />
            <rt-cell
              title="关于指尖善治"
              :desc="'版本 ' + appVersion"
              icon="ai"
              icon-tone="blue"
              last
              @click="onAbout"
            />
          </rt-card>
        </view>
      </view>

      <button class="logout-btn" @click="onLogout">退出登录</button>

      <!-- 编辑昵称弹层（不采集手机号） -->
      <view v-if="editOpen" class="sheet-mask" @click="closeEdit">
        <view class="sheet" @click.stop>
          <text class="sheet-title">修改昵称</text>
          <input
            v-model="editValue"
            class="sheet-input"
            type="text"
            maxlength="20"
            placeholder="请输入昵称"
            focus
          />
          <view class="sheet-actions">
            <view class="sheet-btn ghost" @click="closeEdit">取消</view>
            <view class="sheet-btn primary" @click="saveEdit">保存</view>
          </view>
        </view>
      </view>
    </template>

    <tab-bar />
  </view>
</template>

<script>
import TabBar from "@/components/tab-bar/bar.vue";
import PageHero from "@/components/page-hero/page-hero.vue";
import RtCard from "@/components/rt-card/rt-card.vue";
import RtCell from "@/components/rt-cell/rt-cell.vue";
import RtSection from "@/components/rt-section/rt-section.vue";
import EmptyState from "@/components/empty-state/empty-state.vue";
import RtIcon from "@/components/rt-icon/rt-icon.vue";
import {
  getLocalUser,
  logout,
  isLoggedIn,
  isEphemeralAvatarUrl,
} from "@/utils/cloud.js";
import { ensureLoggedIn, goAiAssistant } from "@/utils/auth.js";
import { api } from "@/api/index.js";
import { goNavigate, goReLaunch } from "@/utils/nav.js";
import { adminLabelOf, tipOfDispute } from "@/utils/dispute-workflow.js";
import { buildCaseObject } from "@/utils/case-object.js";
import { listChatSessions } from "@/utils/chat-session.js";
import { countUnreadNotices } from "@/utils/notice-read.js";
import { draftPreviewText } from "@/utils/submit-draft.js";
import {
  EMERGENCY_TIP,
  VILLAGE_CONTACT_PHONE,
  APP_VERSION_NAME,
  APP_RELEASE_CHANNEL,
} from "@/config/env.js";
import { isElderMode, setElderMode } from "@/utils/elder-mode.js";
import { COPY } from "@/utils/copy-voice.js";
import { isApp } from "@/utils/platform.js";
import { FEATURE_GROUP_ORDER } from "@/config/features.js";
import { isAppPushEnabled, toggleAppPushIntent } from "@/utils/app-push.js";
import {
  openPrivacyPolicy,
  openUserAgreement,
  hasExternalPrivacyUrl,
} from "@/utils/legal-links.js";

export default {
  components: {
    TabBar,
    PageHero,
    RtCard,
    RtCell,
    RtSection,
    EmptyState,
    RtIcon,
  },
  data() {
    return {
      guestMode: false,
      guestBenefits: [
        {
          title: "办件同步",
          desc: "进度随身看",
          icon: "record",
          tone: "green",
          iconTone: "green",
        },
        {
          title: "积分激励",
          desc: "参与有记录",
          icon: "moral",
          tone: "gold",
          iconTone: "gold",
        },
        {
          title: "意见留档",
          desc: "村委可答复",
          icon: "feedback",
          tone: "blue",
          iconTone: "blue",
        },
      ],
      guestBrowse: [
        {
          title: "办事首页",
          desc: "村务与说事",
          path: "/pages/village/village",
          icon: "tab-village",
          tone: "green",
        },
        {
          title: "法治要点",
          desc: "图文反诈",
          path: "/pages/law/law",
          icon: "tab-law",
          tone: "blue",
        },
        {
          title: "惠民好物",
          desc: "展示与咨询",
          path: "/pages/group/group",
          icon: "tab-group",
          tone: "olive",
        },
      ],
      guestLocked: [
        {
          key: "records",
          title: "我的办件",
          desc: "登录后查看调解进度",
          icon: "record",
          tone: "green",
          tip: "查看办件请先登录",
          path: "/pages/village/records",
        },
        {
          key: "feedback",
          title: "意见箱",
          desc: "登录后提交与查看答复",
          icon: "feedback",
          tone: "blue",
          tip: "使用意见箱请先登录",
          path: "/pages/village/feedback",
        },
        {
          key: "moral",
          title: "我的积分",
          desc: "登录后同步激励积分",
          icon: "moral",
          tone: "gold",
          tip: "查看积分请先登录",
          path: "/pages/moral/moral",
        },
        {
          key: "ai",
          title: "村务助手",
          desc: "登录后咨询协办",
          icon: "ai",
          tone: "blue",
          tip: "咨询协办请先登录",
          path: "/pages/ai/assistant",
        },
      ],
      user: {},
      disputeHandling: 0,
      disputeTotal: 0,
      feedbackPending: 0,
      feedbackTotal: 0,
      recentDisputes: [],
      submitDraft: "",
      villageSessions: 0,
      legalSessions: 0,
      lastChatTitle: "",
      editOpen: false,
      editField: "nickname",
      editValue: "",
      appVersion: APP_VERSION_NAME || "1.0.0",
      releaseChannel: APP_RELEASE_CHANNEL || "internal",
      saving: false,
      loadingStats: true,
      noticeUnread: 0,
      noticeTotal: 0,
      monthPointsDelta: 0,
      weekChatTurns: 0,
      weekSessionHits: 0,
      villagePhone: VILLAGE_CONTACT_PHONE || "",
      elderOn: false,
      isAppClient: isApp,
      showOrdersEntry: FEATURE_GROUP_ORDER,
      pushOn: isApp ? isAppPushEnabled() : false,
      fold: {
        ai: true,
        records: true,
        more: true,
        admin: true,
        help: true,
      },
    };
  },
  computed: {
    avatarText() {
      return (this.user.nickname || "村").slice(0, 1);
    },
    avatarSrc() {
      const url = this.user && this.user.avatarUrl;
      if (!url || isEphemeralAvatarUrl(url)) return "";
      return url;
    },
    pointsText() {
      return Number(this.user.points || 0).toLocaleString();
    },
    pointsHint() {
      if (this.monthPointsDelta > 0) return "本月有新增，可去兑换";
      if (this.monthPointsDelta < 0) return "本月有兑换记录";
      return "激励明细与兑换";
    },
    weekSummary() {
      const chat = this.weekChatTurns;
      const cases = this.disputeTotal;
      const handling = this.disputeHandling;
      if (!chat && !cases) return "";
      const parts = [];
      if (chat) parts.push(`咨询 ${chat} 轮`);
      if (this.weekSessionHits) parts.push(`会话 ${this.weekSessionHits} 个`);
      if (handling) parts.push(`办件进行中 ${handling}`);
      else if (cases) parts.push(`累计办件 ${cases}`);
      if (this.submitDraft) parts.push("有待确认草稿");
      return parts.length ? parts.join(" · ") : "";
    },
    noticeDesc() {
      if (!this.noticeTotal) return "暂无通知";
      if (this.noticeUnread) return `${this.noticeUnread} 条未读`;
      return `共 ${this.noticeTotal} 条 · 已读完`;
    },
    pushDesc() {
      return this.pushOn
        ? "已开启意向 · 正式通道开通后推送"
        : "系统推送占位 · 点此开启意向";
    },
    privacyLinkDesc() {
      return hasExternalPrivacyUrl() ? "已配置公网链接" : "应用内全文";
    },
    groupCellDesc() {
      return this.showOrdersEntry
        ? "可预约登记意向，无线上支付"
        : "商品信息展示，咨询村委";
    },
    todoCount() {
      return this.disputeHandling + this.feedbackPending;
    },
    todoTitle() {
      if (!this.todoCount) {
        if (this.noticeUnread) return `${this.noticeUnread} 条村务通知未读`;
        return COPY.profileTodoEmpty;
      }
      const parts = [];
      if (this.disputeHandling)
        parts.push(`${this.disputeHandling} 件调解待跟进`);
      if (this.feedbackPending)
        parts.push(`${this.feedbackPending} 条意见待答复`);
      return parts.join(" · ");
    },
    recentSectionTitle() {
      return COPY.profileRecent;
    },
    emptyCaseTitle() {
      return COPY.sectionCasesEmpty;
    },
    emptyCaseDesc() {
      return COPY.sectionCasesEmptyDesc;
    },
    todoSub() {
      if (!this.todoCount) {
        if (this.noticeUnread) return "点此查看通知，或去说事建档";
        return "有纠纷或邻里矛盾，可随时说事建档";
      }
      return "点击查看详情并跟进";
    },
    stats() {
      const base = [
        {
          key: "dispute",
          label: "调解中",
          value: this.disputeHandling,
          path: "/pages/village/records",
          hot: true,
        },
        {
          key: "feedback",
          label: "待答复",
          value: this.feedbackPending,
          path: "/pages/village/feedback",
          hot: true,
        },
      ];
      return base;
    },
    disputeDesc() {
      if (!this.disputeTotal) return "暂无办件";
      return `共 ${this.disputeTotal} 件 · 办理中 ${this.disputeHandling}`;
    },
    feedbackDesc() {
      if (!this.feedbackTotal) return "暂无提交记录";
      return this.feedbackPending
        ? `${this.feedbackPending} 条待村委答复`
        : `共 ${this.feedbackTotal} 条 · 均已处理`;
    },
    aiContinueDesc() {
      if (this.lastChatTitle && this.lastChatTitle !== "新对话")
        return this.lastChatTitle;
      return COPY.profileAiVillageDesc;
    },
    aiVillageTitle() {
      return COPY.profileAiVillage;
    },
    aiLegalTitle() {
      return COPY.profileAiLegal;
    },
    aiLegalDesc() {
      return COPY.profileAiLegalDesc;
    },
    aiHistoryDesc() {
      const n = this.villageSessions + this.legalSessions;
      if (!n) return "暂无历史会话";
      return `村务 ${this.villageSessions} · 普法 ${this.legalSessions}`;
    },
    draftPreview() {
      const t = String(this.submitDraft || "")
        .trim()
        .replace(/\s+/g, " ");
      if (!t) return "";
      return t.length > 28 ? `${t.slice(0, 28)}…` : t;
    },
  },
  onLoad(query) {
    const key = query && query.fold ? String(query.fold) : "";
    if (key && Object.prototype.hasOwnProperty.call(this.fold, key)) {
      this._pendingFold = key;
    }
  },
  onShow() {
    this.elderOn = isElderMode();
    const logged = isLoggedIn();
    this.guestMode = !logged;
    if (!logged) return;
    this.user = getLocalUser() || {};
    if (this.user.avatarUrl && isEphemeralAvatarUrl(this.user.avatarUrl)) {
      this.user = { ...this.user, avatarUrl: "" };
      try {
        uni.setStorageSync("rt_user", this.user);
      } catch (e) {
        /* ignore */
      }
    }
    this.refreshLocalAi();
    this.refresh();
    if (this.submitDraft) this.fold.ai = true;
    if (this._pendingFold) {
      this.fold[this._pendingFold] = true;
      this._pendingFold = "";
    }
  },
  methods: {
    goLogin() {
      goNavigate("/pages/login/login");
    },
    goHome() {
      goReLaunch("/pages/village/village");
    },
    goBrowse(path) {
      if (!path) return;
      if (
        path === "/pages/village/village" ||
        path === "/pages/law/law" ||
        path === "/pages/group/group" ||
        path === "/pages/moral/moral" ||
        path === "/pages/profile/profile"
      ) {
        goReLaunch(path);
        return;
      }
      goNavigate(path);
    },
    goLocked(item) {
      if (!item) return;
      if (!ensureLoggedIn({ tip: item.tip || "办理业务请先登录" })) return;
      if (item.path === "/pages/ai/assistant") {
        goAiAssistant();
        return;
      }
      this.goBrowse(item.path);
    },
    toggleFold(key) {
      if (!key || !Object.prototype.hasOwnProperty.call(this.fold, key)) return;
      this.fold[key] = !this.fold[key];
    },
    onToggleElder() {
      const next = setElderMode(!this.elderOn);
      this.elderOn = next;
      // setElderMode 内会 reLaunch，此处仅提示
      uni.showToast({
        title: next ? "简洁模式：底栏 3 项" : COPY.elderExitToast,
        icon: "none",
      });
    },
    refreshLocalAi() {
      try {
        const village = listChatSessions("village") || [];
        const legal = listChatSessions("legal") || [];
        this.villageSessions = village.filter((s) => s.messageCount > 0).length;
        this.legalSessions = legal.filter((s) => s.messageCount > 0).length;
        const latest = [...village, ...legal]
          .filter((s) => s.messageCount > 0)
          .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
        this.lastChatTitle = (latest && latest.title) || "";

        const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const weekSessions = [...village, ...legal].filter(
          (s) => (s.updatedAt || 0) >= weekStart && (s.messageCount || 0) > 0
        );
        this.weekSessionHits = weekSessions.length;
        // 粗算：本周活跃会话的消息数折合为轮次（每会话最多计 6）
        this.weekChatTurns = weekSessions.reduce(
          (n, s) => n + Math.min(Math.ceil((s.messageCount || 0) / 2), 6),
          0
        );
      } catch (e) {
        this.villageSessions = 0;
        this.legalSessions = 0;
        this.lastChatTitle = "";
        this.weekChatTurns = 0;
        this.weekSessionHits = 0;
      }
      this.submitDraft = draftPreviewText(80);
    },
    onTodoTap() {
      if (this.disputeHandling) {
        this.goPage("/pages/village/records");
        return;
      }
      if (this.feedbackPending) {
        this.goPage("/pages/village/feedback");
        return;
      }
      if (this.noticeUnread) {
        this.goPage("/pages/village/notice");
        return;
      }
      this.goPage("/pages/village/submit");
    },
    async refresh() {
      this.loadingStats = true;
      try {
        const userRes = await api.getUser();
        if (userRes.data && userRes.data.user) {
          this.user = userRes.data.user;
          uni.setStorageSync("rt_user", this.user);
        }
      } catch (e) {
        const msg = (e && e.message) || "";
        if (/请先登录|未登录/.test(msg) || !isLoggedIn()) {
          this.guestMode = true;
          this.loadingStats = false;
          return;
        }
      }

      try {
        const dRes = await api.listDisputes();
        const list = dRes.data.list || [];
        this.disputeTotal = list.length;
        this.disputeHandling = list.filter(
          (d) => d.status !== "completed"
        ).length;
        const sorted = [...list].sort(
          (a, b) =>
            (b.updateTime || b.createTime || 0) -
            (a.updateTime || a.createTime || 0)
        );
        const active = sorted.filter((d) => d.status !== "completed");
        const pick = (active.length ? active : sorted).slice(0, 2);
        this.recentDisputes = pick.map((d) => {
          const o = buildCaseObject(d);
          return {
            ...d,
            title: o.title,
            phaseLabel: o.phaseLabel || adminLabelOf(d),
            tip: o.oral || tipOfDispute(d),
          };
        });
      } catch (e) {
        /* ignore */
      }

      try {
        const fRes = await api.listMyFeedbacks();
        const list = fRes.data.list || [];
        this.feedbackTotal = list.length;
        this.feedbackPending = list.filter(
          (f) => f.status === "pending"
        ).length;
      } catch (e) {
        /* ignore */
      }

      try {
        const nRes = await api.listNotices();
        const list = nRes.data.list || [];
        this.noticeTotal = list.length;
        this.noticeUnread = countUnreadNotices(list);
      } catch (e) {
        /* ignore */
      }

      try {
        const mRes = await api.getMoralProfile();
        const records = (mRes.data && mRes.data.records) || [];
        if (mRes.data && mRes.data.points != null) {
          this.user = { ...this.user, points: mRes.data.points };
        }
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        const startTs = start.getTime();
        this.monthPointsDelta = records
          .filter((r) => (r.createTime || 0) >= startTs)
          .reduce((sum, r) => sum + (Number(r.points) || 0), 0);
      } catch (e) {
        this.monthPointsDelta = 0;
      } finally {
        this.loadingStats = false;
      }
    },
    async onChooseAvatar() {
      uni.showToast({ title: "个人主体小程序不采集头像授权", icon: "none" });
    },
    openEdit(field) {
      if (field === "phone") {
        uni.showToast({ title: "不采集手机号", icon: "none" });
        return;
      }
      this.editField = "nickname";
      this.editValue = this.user.nickname || "";
      this.editOpen = true;
    },
    closeEdit() {
      this.editOpen = false;
    },
    async saveEdit() {
      if (this.saving) return;
      const value = String(this.editValue || "").trim();
      if (!value) {
        uni.showToast({ title: "请输入昵称", icon: "none" });
        return;
      }
      this.saving = true;
      try {
        const payload = { nickname: value };
        const res = await api.updateProfile(payload);
        if (res.data && res.data.user) {
          this.user = res.data.user;
          uni.setStorageSync("rt_user", this.user);
        } else {
          this.user = { ...this.user, ...payload };
          uni.setStorageSync("rt_user", this.user);
        }
        this.editOpen = false;
        uni.showToast({ title: "已保存", icon: "success" });
      } catch (e) {
        uni.showToast({ title: e.message || "保存失败", icon: "none" });
      } finally {
        this.saving = false;
      }
    },
    onClearCache() {
      uni.showModal({
        title: "清除本地缓存",
        content:
          "将清除聊天历史、建档草稿与通知已读标记，不影响云端办件。确定清除吗？",
        success: (res) => {
          if (!res.confirm) return;
          try {
            [
              "rt_chat_village",
              "rt_chat_legal",
              "rt_submit_draft",
              "rt_ai_prefill",
              "rt_legal_prefill",
              "rt_ai_dispute_ctx",
              "rt_notice_read_ids",
              "rt_law_video_src_v3",
              "rt_law_video_src_at_v3",
              "rt_law_video_fid_v3",
            ].forEach((k) => {
              try {
                uni.removeStorageSync(k);
              } catch (e) {
                /* ignore */
              }
            });
            this.refreshLocalAi();
            this.noticeUnread = this.noticeTotal;
            uni.showToast({ title: "已清除", icon: "success" });
          } catch (e) {
            uni.showToast({ title: "清除失败", icon: "none" });
          }
        },
      });
    },
    async onTogglePush() {
      try {
        const res = await toggleAppPushIntent();
        this.pushOn = !!res.enabled;
        uni.showToast({ title: res.tip || "已更新", icon: "none" });
      } catch (e) {
        uni.showToast({ title: (e && e.message) || "设置失败", icon: "none" });
      }
    },
    goDispute(id) {
      if (!id) return;
      goNavigate(`/pages/disputeDetail/disputeDetail?id=${id}`);
    },
    goAi() {
      goAiAssistant();
    },
    goLegal() {
      goNavigate("/pages/law/aiLegal");
    },
    goPage(url) {
      goNavigate(url);
    },
    goTab(path) {
      goReLaunch(path);
    },
    openEdit(field) {
      this.editField = field;
      this.editValue =
        field === "phone" ? this.user.phone || "" : this.user.nickname || "";
      this.editOpen = true;
    },
    closeEdit() {
      this.editOpen = false;
    },
    async saveEdit() {
      if (this.saving) return;
      const field = this.editField;
      const value = String(this.editValue || "").trim();
      if (field === "nickname" && !value) {
        uni.showToast({ title: "请输入昵称", icon: "none" });
        return;
      }
      if (field === "phone" && value && !/^1\d{10}$/.test(value)) {
        uni.showToast({ title: "请输入正确手机号", icon: "none" });
        return;
      }
      this.saving = true;
      try {
        const payload =
          field === "phone" ? { phone: value } : { nickname: value };
        const res = await api.updateProfile(payload);
        if (res.data && res.data.user) {
          this.user = res.data.user;
          uni.setStorageSync("rt_user", this.user);
        } else {
          this.user = { ...this.user, ...payload };
          uni.setStorageSync("rt_user", this.user);
        }
        this.editOpen = false;
        uni.showToast({ title: "已保存", icon: "success" });
      } catch (e) {
        uni.showToast({ title: e.message || "保存失败", icon: "none" });
      } finally {
        this.saving = false;
      }
    },
    onOpenPrivacy() {
      openPrivacyPolicy();
    },
    onOpenUserAgreement() {
      openUserAgreement();
    },
    onAbout() {
      const ch = this.releaseChannel === "store" ? "商店版" : "内测版";
      uni.showModal({
        title: "指尖善治",
        content: `版本 ${this.appVersion}（${ch}）\n说事成案 · 干部推进 · 村民可感\n${EMERGENCY_TIP}`,
        showCancel: false,
      });
    },
    onCallVillage() {
      const phone = this.villagePhone;
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
    onAccountDelete() {
      uni.showModal({
        title: "账号注销说明",
        content:
          "如需注销账号，请联系村委会核实身份后办理。注销后本地缓存与登录态将清除，云端办件记录按村务档案规定保留或按规定删除。\n\n演示环境可点「退出登录」结束当前会话。",
        confirmText: "联系村委",
        cancelText: "知道了",
        success: (res) => {
          if (res.confirm) this.onCallVillage();
        },
      });
    },
    onLogout() {
      uni.showModal({
        title: "退出登录",
        content: "确定要退出当前账号吗？",
        success: (res) => {
          if (res.confirm) {
            logout();
            uni.reLaunch({ url: "/pages/login/login" });
          }
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
  animation-delay: 0.05s;
}
.delay-2 {
  animation-delay: 0.1s;
}
.delay-3 {
  animation-delay: 0.16s;
}

/* ── 游客态：对齐大厂「我的」未登录骨架 ── */
.guest-shell {
  padding-bottom: 8rpx;
}
.guest-id {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx 28rpx 28rpx 24rpx;
  margin-bottom: 16rpx;
  border-radius: $rt-radius-md;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.96) 0%,
    #fff8f4 55%,
    #f7efe6 100%
  );
  border: 1rpx solid rgba(201, 162, 74, 0.22);
  box-shadow: $rt-shadow-card;
}
.guest-id-press {
  opacity: 0.94;
}
.guest-avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #f3eee6 0%, #e8e0d4 100%);
  border: 4rpx solid rgba(255, 255, 255, 0.85);
}
.guest-id-body {
  flex: 1;
  min-width: 0;
}
.guest-hello {
  display: block;
  font-size: 36rpx;
  font-weight: 800;
  color: $rt-text;
  letter-spacing: 0.02em;
}
.guest-hint {
  display: block;
  margin-top: 8rpx;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.45;
}
.guest-login-pill {
  flex-shrink: 0;
  min-width: 96rpx;
  height: 56rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $rt-primary, $rt-primary-mid);
  color: #fff;
  font-size: 24rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.guest-cta {
  margin-bottom: 20rpx;
  padding: 28rpx 28rpx 24rpx;
  border-radius: $rt-radius-md;
  background: linear-gradient(135deg, $rt-primary 0%, $rt-primary-mid 100%);
  box-shadow: 0 12rpx 28rpx rgba(158, 52, 40, 0.22);
}
.guest-cta-text {
  display: block;
  font-size: 32rpx;
  font-weight: 800;
  color: #fff;
  text-align: center;
}
.guest-cta-sub {
  display: block;
  margin-top: 8rpx;
  font-size: $rt-type-micro;
  color: rgba(255, 255, 255, 0.82);
  text-align: center;
}
.guest-benefits {
  display: flex;
  gap: 12rpx;
  margin-bottom: 8rpx;
}
.guest-benefit {
  flex: 1;
  min-width: 0;
  padding: 20rpx 12rpx 18rpx;
  border-radius: $rt-radius-sm;
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid rgba(50, 40, 30, 0.06);
  text-align: center;
}
.guest-benefit-icon {
  width: 56rpx;
  height: 56rpx;
  margin: 0 auto 10rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.guest-benefit-icon.green {
  background: $rt-olive-soft;
}
.guest-benefit-icon.gold {
  background: $rt-accent-soft;
}
.guest-benefit-icon.blue {
  background: $rt-blue-soft;
}
.guest-benefit-title {
  display: block;
  font-size: 24rpx;
  font-weight: 800;
  color: $rt-text;
}
.guest-benefit-desc {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: $rt-text-muted;
  line-height: 1.35;
}
.guest-grid {
  display: flex;
  gap: 12rpx;
}
.guest-tile {
  flex: 1;
  min-width: 0;
  padding: 22rpx 16rpx 20rpx;
  border-radius: $rt-radius-sm;
  background: #fff;
  border: 1rpx solid rgba(50, 40, 30, 0.06);
  box-shadow: $rt-shadow-sm;
}
.guest-tile-press {
  opacity: 0.92;
}
.guest-tile-title {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  font-weight: 800;
  color: $rt-text;
}
.guest-tile-desc {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: $rt-text-muted;
}
.guest-trust {
  margin-top: 8rpx;
  padding: 8rpx 8rpx 24rpx;
  text-align: center;
}
.guest-trust-line {
  display: block;
  font-size: $rt-type-micro;
  color: $rt-text-secondary;
  line-height: 1.5;
}
.guest-trust-line.muted {
  margin-top: 4rpx;
  color: $rt-text-muted;
}
.guest-trust-links {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}
.guest-trust-link {
  font-size: $rt-type-micro;
  color: $rt-primary-mid;
  font-weight: 700;
}
.guest-trust-dot {
  font-size: $rt-type-micro;
  color: $rt-text-muted;
}
.press {
  opacity: 0.92;
}

.elder-switch {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
  padding: 22rpx 24rpx;
  min-height: 96rpx;
  border-radius: $rt-radius-md;
  background: linear-gradient(160deg, #fff 0%, #fff8f6 100%);
  border: 1rpx solid rgba(158, 52, 40, 0.2);
  box-sizing: border-box;
}
.elder-switch-press {
  opacity: 0.92;
}
.elder-switch-main {
  flex: 1;
  min-width: 0;
}
.elder-switch-title {
  display: block;
  font-size: 30rpx;
  font-weight: 800;
  color: $rt-text;
}
.elder-switch-desc {
  display: block;
  margin-top: 6rpx;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.4;
}
.elder-switch-tag {
  flex-shrink: 0;
  min-width: 72rpx;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(42, 33, 24, 0.08);
  text-align: center;
}
.elder-switch-tag.on {
  background: $rt-primary;
}
.elder-switch-tag-text {
  font-size: $rt-type-caption;
  font-weight: 800;
  color: $rt-text-secondary;
}
.elder-switch-tag.on .elder-switch-tag-text {
  color: #fff;
}

.id-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx;
  margin-bottom: 16rpx;
  border-radius: $rt-radius-md;
  background: rgba(255, 255, 255, 0.88);
  border: 1rpx solid rgba(201, 162, 74, 0.2);
  box-shadow: $rt-shadow-card;
}

.avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(145deg, $rt-accent-dark, $rt-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  font-weight: 800;
  border: 4rpx solid rgba(255, 255, 255, 0.75);
}

.avatar-btn {
  @include rt-btn-reset;
  padding: 0;
  margin: 0;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: transparent;
  overflow: hidden;
  flex-shrink: 0;
  border: none;
  line-height: 1;
}
.avatar-btn::after {
  border: none;
}

.avatar-img {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.75);
  display: block;
}

.id-body {
  flex: 1;
  min-width: 0;
}

.id-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.id-name {
  font-size: 36rpx;
  font-weight: 800;
  color: $rt-forest-text;
}

.role-pill {
  @include rt-pill($rt-accent-soft, $rt-accent-dark);
  font-size: 20rpx;
  font-weight: 800;
}

.role-pill.soft {
  background: rgba(90, 107, 56, 0.1);
  color: #5a6b38;
}

.id-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $rt-text-secondary;
}

.id-phone-row {
  margin-top: 8rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.id-phone {
  font-size: 22rpx;
  color: $rt-text-muted;
}

.id-phone.warn {
  color: #c62828;
  font-weight: 600;
}

.bind-cta {
  font-size: 22rpx;
  font-weight: 700;
  color: $rt-accent-dark;
}

.bind-cta.soft {
  color: $rt-text-secondary;
  font-weight: 600;
}

.todo-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 16rpx;
  border-radius: $rt-radius-md;
  background: linear-gradient(
    135deg,
    rgba(198, 40, 40, 0.08),
    rgba(201, 162, 74, 0.12)
  );
  border: 1rpx solid rgba(198, 40, 40, 0.16);
}

.todo-bar.empty {
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(201, 162, 74, 0.2);
}

.todo-press {
  opacity: 0.92;
}

.todo-main {
  flex: 1;
  min-width: 0;
}

.todo-title {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  color: $rt-forest-text;
}

.todo-sub {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $rt-text-secondary;
  line-height: 1.4;
}

.todo-action {
  flex-shrink: 0;
  font-size: 24rpx;
  font-weight: 800;
  color: $rt-accent-dark;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.stat {
  padding: 24rpx 12rpx;
  border-radius: $rt-radius-sm;
  background: rgba(255, 255, 255, 0.78);
  border: 1rpx solid rgba(201, 162, 74, 0.18);
  text-align: center;
}

.stat-press {
  background: rgba(201, 162, 74, 0.12);
}

.stat-num {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: $rt-forest-text;
  line-height: 1.1;
}

.stat-num.hot {
  color: #c62828;
}

.stat-num.muted {
  color: $rt-text-muted;
  font-weight: 600;
}

.stat-label {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: $rt-text-muted;
  font-weight: 600;
}

.recent-list {
  margin-bottom: 20rpx;
}

.recent-card {
  padding: 24rpx 26rpx;
  margin-bottom: 12rpx;
  border-radius: $rt-radius-md;
  background: rgba(255, 255, 255, 0.88);
  border: 1rpx solid rgba(201, 162, 74, 0.18);
}

.recent-press {
  background: rgba(201, 162, 74, 0.1);
}

.recent-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.recent-title {
  flex: 1;
  font-size: 28rpx;
  font-weight: 700;
  color: $rt-text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-phase {
  flex-shrink: 0;
  font-size: 22rpx;
  font-weight: 700;
  color: $rt-accent-dark;
}

.recent-tip {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: $rt-text-secondary;
  line-height: 1.45;
}

.recent-more {
  text-align: center;
  padding: 12rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: $rt-accent-dark;
}

.empty-card {
  margin-bottom: 20rpx;
  padding: 36rpx 28rpx;
  border-radius: $rt-radius-md;
  background: rgba(255, 255, 255, 0.82);
  border: 1rpx dashed rgba(201, 162, 74, 0.35);
  text-align: center;
}

.empty-title {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  color: $rt-text;
}

.empty-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: $rt-text-muted;
}

.empty-btn {
  margin: 24rpx auto 0;
  display: inline-flex;
  padding: 14rpx 32rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $rt-accent-dark, $rt-accent);
  color: #fff;
  font-size: 24rpx;
  font-weight: 800;
}

.wallet {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
  border-radius: $rt-radius-md;
  @include rt-card-tone(gold);
  box-shadow: $rt-shadow-card;
}

.wallet-press {
  opacity: 0.94;
}
.wallet-label {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: $rt-gold-label;
}
.wallet-hint {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $rt-gold-muted;
}
.wallet-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
}
.wallet-num {
  font-size: 44rpx;
  font-weight: $rt-weight-heavy;
  color: $rt-gold-value;
  line-height: 1.1;
}
.wallet-arrow {
  font-size: 22rpx;
  font-weight: 700;
  color: $rt-accent-dark;
}
.wallet-delta {
  font-size: 22rpx;
  font-weight: 700;
  color: $rt-text-secondary;
}
.wallet-delta.up {
  color: #5a6b38;
}

.week-card {
  margin-bottom: 12rpx;
  padding: 20rpx 26rpx;
  border-radius: $rt-radius-md;
  background: rgba(90, 107, 56, 0.08);
  border: 1rpx solid rgba(90, 107, 56, 0.16);
}
.week-kicker {
  display: block;
  font-size: 20rpx;
  font-weight: 700;
  color: #5a6b38;
}
.week-text {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: $rt-forest-text;
  line-height: 1.45;
}

.group-card {
  margin-bottom: 0;
}

.fold {
  margin-bottom: $rt-section-gap;
}
.fold-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: $rt-touch-min;
  padding: 8rpx 4rpx;
  box-sizing: border-box;
}
.fold-press {
  opacity: 0.9;
}
.fold-titles {
  display: flex;
  align-items: center;
  min-width: 0;
}
.accent-bar {
  @include rt-accent-bar;
}
.fold-title {
  @include rt-section-title;
}
.fold-arrow {
  flex-shrink: 0;
  font-size: $rt-type-caption;
  font-weight: 700;
  color: $rt-primary-mid;
  padding: 8rpx 4rpx;
}
.fold-body {
  margin-top: 4rpx;
}

.logout-btn {
  margin-top: 8rpx;
  margin-bottom: 12rpx;
  @include rt-btn-ghost;
  width: 100%;
  color: $rt-warm;
  border-color: rgba(188, 108, 37, 0.25);
}

.sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(20, 24, 18, 0.42);
  display: flex;
  align-items: flex-end;
}

.sheet {
  width: 100%;
  background: $rt-surface;
  border-radius: 28rpx 28rpx 0 0;
  padding: 32rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.sheet-title {
  display: block;
  font-size: 30rpx;
  font-weight: 800;
  color: $rt-text;
  margin-bottom: 24rpx;
}

.sheet-input {
  height: 88rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: $rt-bg;
  border: 1rpx solid $rt-border;
  font-size: 28rpx;
}

.sheet-actions {
  margin-top: 28rpx;
  display: flex;
  gap: 16rpx;
}

.sheet-btn {
  flex: 1;
  text-align: center;
  padding: 22rpx 0;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.sheet-btn.ghost {
  color: $rt-text-secondary;
  background: $rt-bg;
}

.sheet-btn.primary {
  color: #fff;
  background: linear-gradient(135deg, $rt-accent-dark, $rt-accent);
}
</style>
