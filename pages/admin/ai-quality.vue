<template>
  <view class="page">
    <rt-nav-bar title="AI 质量" />
    <view class="hero">
      <text class="hero-sub"
        >调用指标 · 标题采纳 · Badcase 闭环（标 → 修 → 关）</text
      >
    </view>

    <rt-skeleton v-if="loading" variant="lines" :rows="8" />
    <empty-state
      v-else-if="loadError"
      icon-type="ai"
      icon-tone="blue"
      title="加载失败"
      action-text="点击重试"
      @action="refresh()"
    />
    <view v-else>
      <view class="metric-grid">
        <view class="metric">
          <text class="metric-num">{{ metrics.sampleSize || 0 }}</text>
          <text class="metric-label">近期调用</text>
        </view>
        <view class="metric">
          <text class="metric-num">{{ pct(metrics.okRate) }}</text>
          <text class="metric-label">成功率</text>
        </view>
        <view class="metric">
          <text class="metric-num">{{ pct(metrics.escalateRate) }}</text>
          <text class="metric-label">升级率</text>
        </view>
        <view class="metric">
          <text class="metric-num">{{ metrics.avgLatencyMs || 0 }}</text>
          <text class="metric-label">均时延 ms</text>
        </view>
      </view>

      <view class="block eval-block">
        <text class="block-title">离线评测基线</text>
        <view class="eval-row">
          <text class="eval-chip">纠纷 {{ evalBaseline.disputePass }}</text>
          <text class="eval-chip">FAQ {{ evalBaseline.faqPass }}</text>
          <text class="eval-chip">知识 {{ evalBaseline.faqEntries }} 条</text>
        </view>
        <text class="block-body">{{ evalBaseline.note }}</text>
      </view>

      <view class="block">
        <text class="block-title">标题采纳（代理满意度）</text>
        <text class="block-body">
          有 AI 成案 {{ metrics.disputeWithAi || 0 }} 条； 采纳率
          {{ pct(metrics.titleAdoptionRate) }}（未改标题）； 改写率
          {{ pct(metrics.titleEditRate) }}
        </text>
      </view>

      <view class="block">
        <text class="block-title">来源分布</text>
        <view v-if="sourceRows.length" class="src-list">
          <view v-for="row in sourceRows" :key="row.key" class="src-row">
            <view class="src-head">
              <text class="src-key">{{ row.label }}</text>
              <text class="src-val">{{ row.count }} · {{ row.pct }}%</text>
            </view>
            <view class="src-bar-track">
              <view
                class="src-bar-fill"
                :style="{ width: row.pct + '%' }"
              ></view>
            </view>
          </view>
        </view>
        <text v-else class="block-body"
          >暂无事件，先跑几次「整理成案 / 助手」</text
        >
      </view>

      <view class="block">
        <text class="block-title">调解队列</text>
        <text class="block-body">
          待受理 {{ queue.pending || 0 }} · 办理中 {{ queue.handling || 0 }} ·
          升级优先 {{ queue.escalate || 0 }}
        </text>
        <button class="link-btn" size="mini" @click="goWorkbench">
          打开调解工作台
        </button>
        <button class="link-btn" size="mini" @click="goDocExtract">
          拆单据
        </button>
        <button class="link-btn" size="mini" @click="goAiLab">协办工具</button>
      </view>

      <view class="block">
        <view class="block-head">
          <text class="block-title">Badcase</text>
          <button class="link-btn" size="mini" @click="openCreate">
            标一条
          </button>
        </view>
        <view class="bc-tabs">
          <text
            v-for="t in bcTabs"
            :key="t.key"
            class="bc-tab"
            :class="{ active: bcFilter === t.key }"
            @click="bcFilter = t.key"
            >{{ t.label }} {{ t.count }}</text
          >
        </view>
        <view v-if="!filteredBadcases.length" class="block-body">
          {{
            bcFilter === "fixed"
              ? "暂无已修好记录"
              : bcFilter === "open"
              ? "暂无待修复，可点「标一条」"
              : "暂无标注。见 docs/LABEL_GUIDE.md"
          }}
        </view>
        <view v-for="item in filteredBadcases" :key="item._id" class="bc-item">
          <view class="bc-top">
            <text class="bc-phen">{{ item.phenomenon }}</text>
            <text class="bc-status" :class="item.status">{{
              item.statusLabel ||
              (item.status === "fixed" ? "已修好" : "待修复")
            }}</text>
          </view>
          <text class="bc-meta">
            {{ item.createTimeText }}
            {{ item.title ? " · " + item.title : "" }}
            {{ item.fixedAtText ? " · 修好于 " + item.fixedAtText : "" }}
          </text>
          <text v-if="item.rootCause" class="bc-sub"
            >根因：{{ item.rootCause }}</text
          >
          <text v-if="item.action" class="bc-sub">动作：{{ item.action }}</text>
          <text v-if="item.fixNote" class="bc-sub"
            >修复说明：{{ item.fixNote }}</text
          >
          <view class="bc-actions">
            <button
              v-if="(item.status || 'open') !== 'fixed'"
              class="bc-btn"
              size="mini"
              @click="markFixed(item)"
            >
              标记修好了
            </button>
            <button
              v-else
              class="bc-btn ghost"
              size="mini"
              @click="reopen(item)"
            >
              重新打开
            </button>
          </view>
        </view>
      </view>

      <view class="block">
        <text class="block-title">最近调用</text>
        <view v-for="(e, i) in metrics.recent || []" :key="i" class="evt-row">
          <text class="evt-main"
            >{{ e.action }} · {{ e.source || "-"
            }}{{ e.escalate ? " · 升级" : "" }}</text
          >
          <text class="evt-sub"
            >{{ e.createTimeText }} · {{ e.latencyMs || 0 }}ms{{
              e.ok === false ? " · 失败" : ""
            }}</text
          >
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import EmptyState from "@/components/empty-state/empty-state.vue";
import RtSkeleton from "@/components/rt-skeleton/rt-skeleton.vue";
import { api } from "@/api/index.js";
import { getLocalUser } from "@/utils/cloud.js";

const SOURCE_LABEL = {
  llm: "大模型",
  rule: "规则",
  rule_fallback: "规则降级",
  rag: "混合检索",
  rag_llm: "检索+大模型",
  cache: "短缓存",
  unknown: "未知",
};

export default {
  components: { EmptyState, RtSkeleton },
  data() {
    return {
      loading: true,
      loadError: false,
      metrics: {},
      badcases: [],
      queue: {},
      bcFilter: "open",
    };
  },
  computed: {
    evalBaseline() {
      const b = this.metrics.evalBaseline || {};
      return {
        disputePass: b.disputePass || "42/42",
        faqPass: b.faqPass || "15/15",
        faqEntries: b.faqEntries || 26,
        note: b.note || "离线 npm run eval（规则引擎 + FAQ）",
      };
    },
    sourceRows() {
      const map = this.metrics.bySource || {};
      const total =
        Object.keys(map).reduce((s, k) => s + (map[k] || 0), 0) || 1;
      return Object.keys(map)
        .map((key) => ({
          key,
          label: SOURCE_LABEL[key] || key,
          count: map[key],
          pct: Math.round((map[key] / total) * 100),
        }))
        .sort((a, b) => b.count - a.count);
    },
    openCount() {
      return this.badcases.filter((b) => (b.status || "open") !== "fixed")
        .length;
    },
    fixedCount() {
      return this.badcases.filter((b) => b.status === "fixed").length;
    },
    bcTabs() {
      return [
        { key: "open", label: "待修复", count: this.openCount },
        { key: "fixed", label: "已修好", count: this.fixedCount },
        { key: "all", label: "全部", count: this.badcases.length },
      ];
    },
    filteredBadcases() {
      if (this.bcFilter === "all") return this.badcases;
      if (this.bcFilter === "fixed")
        return this.badcases.filter((b) => b.status === "fixed");
      return this.badcases.filter((b) => (b.status || "open") !== "fixed");
    },
  },
  onShow() {
    const user = getLocalUser();
    if (!user || !user.isAdmin) {
      uni.showModal({
        title: "无权限",
        content: "仅管理员可访问 AI 质量看板",
        showCancel: false,
        success: () => uni.navigateBack(),
      });
      return;
    }
    this.refresh();
  },
  onPullDownRefresh() {
    this.refresh(true).finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    pct(v) {
      if (v == null || Number.isNaN(Number(v))) return "—";
      return `${Math.round(Number(v) * 100)}%`;
    },
    async refresh(isRefresh = false) {
      if (!isRefresh) this.loading = true;
      this.loadError = false;
      try {
        const [m, b] = await Promise.all([
          api.adminAiMetrics({ limit: 200 }),
          api.adminListBadcases(),
        ]);
        this.metrics = m.data || {};
        this.queue = (m.data && m.data.queue) || {};
        this.badcases = (b.data && b.data.list) || [];
      } catch (e) {
        this.loadError = true;
        uni.showToast({ title: e.message || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    goWorkbench() {
      uni.navigateTo({ url: "/pages/admin/disputes" });
    },
    goDocExtract() {
      uni.navigateTo({ url: "/pages/tools/doc-extract" });
    },
    goAiLab() {
      uni.navigateTo({ url: "/pages/tools/ai-lab" });
    },
    openCreate() {
      uni.showModal({
        title: "标 Badcase · 现象",
        editable: true,
        placeholderText: "例：邻里案未识别噪音关键词",
        success: async (r) => {
          if (!r.confirm || !(r.content || "").trim()) return;
          const phenomenon = String(r.content).trim();
          uni.showModal({
            title: "根因（可选）",
            editable: true,
            placeholderText: "例：规则词表不足",
            success: async (r2) => {
              if (!r2.confirm) return;
              try {
                await api.adminCreateBadcase({
                  phenomenon,
                  rootCause: (r2.content || "").trim(),
                  action: "待改规则/FAQ",
                });
                uni.showToast({ title: "已记录", icon: "success" });
                this.bcFilter = "open";
                this.refresh();
              } catch (err) {
                uni.showToast({ title: err.message || "失败", icon: "none" });
              }
            },
          });
        },
      });
    },
    markFixed(item) {
      uni.showModal({
        title: "标记修好了",
        editable: true,
        placeholderText: "修复说明：如已补 FAQ / 改规则",
        success: async (r) => {
          if (!r.confirm) return;
          try {
            await api.adminUpdateBadcase({
              id: item._id,
              status: "fixed",
              fixNote: String(r.content || "").trim() || "已修复",
            });
            uni.showToast({ title: "已标记修好", icon: "success" });
            this.refresh();
          } catch (err) {
            uni.showToast({ title: err.message || "失败", icon: "none" });
          }
        },
      });
    },
    async reopen(item) {
      try {
        await api.adminUpdateBadcase({ id: item._id, status: "open" });
        uni.showToast({ title: "已重新打开", icon: "success" });
        this.bcFilter = "open";
        this.refresh();
      } catch (err) {
        uni.showToast({ title: err.message || "失败", icon: "none" });
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
  padding-bottom: 80rpx;
}

.hero {
  margin-bottom: 20rpx;
}
.hero-sub {
  display: block;
  font-size: 24rpx;
  color: $rt-text-muted;
  line-height: 1.45;
}

.state-text {
  @include rt-state-text;
}

.metric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.metric {
  padding: 24rpx;
  background: $rt-surface;
  border-radius: $rt-radius-md;
}

.metric-num {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: $rt-accent-dark;
}

.metric-label {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $rt-text-muted;
}

.block {
  margin-bottom: 28rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.block-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.block-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: $rt-text;
  margin-bottom: 8rpx;
}

.block-body {
  display: block;
  font-size: 24rpx;
  color: $rt-text-secondary;
  line-height: 1.55;
}

.eval-block .eval-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin: 8rpx 0 10rpx;
}
.eval-chip {
  font-size: 22rpx;
  font-weight: 700;
  color: $rt-accent-dark;
  background: $rt-accent-soft;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.src-list {
  margin-top: 8rpx;
}
.src-row {
  padding: 10rpx 0;
  font-size: 24rpx;
}
.src-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}
.src-key {
  color: $rt-text-secondary;
}
.src-val {
  font-weight: 700;
  color: $rt-accent-dark;
}
.src-bar-track {
  height: 12rpx;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.src-bar-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, $rt-accent-dark, $rt-accent);
  min-width: 4rpx;
}

.link-btn {
  @include rt-btn-reset;
  margin-top: 16rpx;
  background: $rt-surface;
  color: $rt-accent-dark;
  border: 1rpx solid rgba(201, 162, 74, 0.35);
  border-radius: 999rpx;
  font-size: 22rpx;
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 56rpx;
}

.bc-tabs {
  display: flex;
  gap: 16rpx;
  margin: 12rpx 0 8rpx;
  flex-wrap: wrap;
}
.bc-tab {
  font-size: 24rpx;
  color: $rt-text-muted;
  padding-bottom: 8rpx;
  border-bottom: 4rpx solid transparent;
  font-weight: 600;
}
.bc-tab.active {
  color: $rt-accent-dark;
  border-bottom-color: $rt-accent;
  font-weight: 800;
}

.bc-item {
  margin-top: 16rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.7);
  border: 1rpx solid rgba(201, 162, 74, 0.16);
}
.bc-top {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  align-items: flex-start;
}
.bc-phen {
  flex: 1;
  font-size: 26rpx;
  font-weight: 600;
  color: $rt-text;
}
.bc-status {
  flex-shrink: 0;
  font-size: 20rpx;
  font-weight: 800;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: $rt-accent-soft;
  color: $rt-accent-dark;
}
.bc-status.fixed {
  @include rt-status-done;
}
.bc-meta {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $rt-text-muted;
}
.bc-sub {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: $rt-text-secondary;
}
.bc-actions {
  margin-top: 12rpx;
  display: flex;
  gap: 12rpx;
}
.bc-btn {
  @include rt-btn-reset;
  background: linear-gradient(135deg, $rt-accent-dark, $rt-accent);
  color: #fff;
  font-size: 22rpx;
  border-radius: 999rpx;
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 56rpx;
}
.bc-btn.ghost {
  background: $rt-surface;
  color: $rt-accent-dark;
  border: 1rpx solid rgba(201, 162, 74, 0.35);
}

.evt-row {
  margin-top: 12rpx;
}
.evt-main {
  display: block;
  font-size: 24rpx;
  color: $rt-text;
}
.evt-sub {
  display: block;
  font-size: 20rpx;
  color: $rt-text-muted;
}
</style>
