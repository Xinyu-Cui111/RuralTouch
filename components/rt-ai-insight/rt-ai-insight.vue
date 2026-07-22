<template>
  <view class="ai-insight" :class="{ compact }">
    <view class="head">
      <text class="head-title">{{ title }}</text>
      <text v-if="riskLabel" class="risk" :class="riskLevel"
        >{{ riskLabel }}风险</text
      >
    </view>

    <text v-if="summary" class="summary">{{ summary }}</text>

    <view v-if="categoryLabel || estimatedDays" class="meta-row">
      <text v-if="categoryLabel" class="meta">类型：{{ categoryLabel }}</text>
      <text v-if="estimatedDays" class="meta"
        >约 {{ estimatedDays }} 个工作日</text
      >
    </view>

    <view v-if="escalate" class="escalate">
      <text class="escalate-title">{{
        escalateHint || "建议转人工优先处理"
      }}</text>
      <text v-if="mediationAdvice" class="escalate-desc">{{
        mediationAdvice
      }}</text>
    </view>

    <view v-if="materials && materials.length" class="block">
      <text class="block-title">建议准备的材料</text>
      <text v-for="(m, i) in materials" :key="'m' + i" class="block-item"
        >· {{ m }}</text
      >
    </view>

    <view v-if="steps && steps.length" class="block">
      <text class="block-title">建议下一步</text>
      <text
        v-for="(s, i) in steps.slice(0, 4)"
        :key="'s' + i"
        class="block-item"
        >{{ i + 1 }}. {{ s }}</text
      >
    </view>

    <view v-if="legalRefs && legalRefs.length" class="refs">
      <text class="refs-label">参考依据</text>
      <text v-for="(ref, i) in legalRefs" :key="'r' + i" class="ref-pill">{{
        ref
      }}</text>
    </view>

    <view class="trust">
      <text class="source">来源：{{ sourceText }}</text>
      <text class="disclaimer">仅供参考，以村委受理为准</text>
    </view>

    <view v-if="showActions && actions.length" class="actions">
      <view
        v-for="(a, i) in actions"
        :key="i"
        class="act"
        :class="{ primary: a.primary }"
        hover-class="act-press"
        :hover-stay-time="80"
        @click="$emit('action', a)"
      >
        <text class="act-text">{{ a.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "RtAiInsight",
  props: {
    title: { type: String, default: "AI 案情建议" },
    compact: { type: Boolean, default: false },
    summary: { type: String, default: "" },
    categoryLabel: { type: String, default: "" },
    riskLabel: { type: String, default: "" },
    riskLevel: { type: String, default: "" },
    estimatedDays: { type: [Number, String], default: "" },
    escalate: { type: Boolean, default: false },
    escalateHint: { type: String, default: "" },
    mediationAdvice: { type: String, default: "" },
    steps: { type: Array, default: () => [] },
    materials: { type: Array, default: () => [] },
    legalRefs: { type: Array, default: () => [] },
    source: { type: String, default: "" },
    sourceLabel: { type: String, default: "" },
    showActions: { type: Boolean, default: false },
    actions: { type: Array, default: () => [] },
  },
  emits: ["action"],
  computed: {
    sourceText() {
      if (this.sourceLabel) return this.sourceLabel;
      const map = {
        llm: "大模型",
        rule: "规则引擎",
        rule_fallback: "规则降级（模型不可用）",
        rag: "知识检索",
        rag_llm: "检索 + 大模型",
        cache: "短缓存",
      };
      return (
        map[this.source] || (this.source ? String(this.source) : "AI 助手")
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.ai-insight {
  padding: 8rpx 0;
}
.ai-insight.compact {
  padding: 0;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 12rpx;
}
.head-title {
  font-size: $rt-type-body;
  font-weight: 800;
  color: $rt-text;
}
.risk {
  flex-shrink: 0;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  font-size: $rt-type-micro;
  font-weight: 800;
  background: rgba(158, 52, 40, 0.1);
  color: $rt-primary;
}
.risk.low {
  background: rgba(90, 107, 56, 0.12);
  color: $rt-olive;
}
.risk.medium,
.risk.mid {
  background: rgba(184, 107, 53, 0.14);
  color: $rt-warm;
}
.risk.high {
  background: rgba(158, 52, 40, 0.14);
  color: $rt-primary;
}

.summary {
  display: block;
  font-size: $rt-type-caption;
  color: $rt-text;
  line-height: 1.55;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 12rpx;
}
.meta {
  font-size: $rt-type-micro;
  color: $rt-text-secondary;
  font-weight: 600;
}

.escalate {
  margin-top: 14rpx;
  padding: 16rpx;
  border-radius: $rt-radius-sm;
  background: rgba(158, 52, 40, 0.08);
  border: 1rpx solid rgba(158, 52, 40, 0.18);
}
.escalate-title {
  display: block;
  font-size: $rt-type-caption;
  font-weight: 800;
  color: $rt-primary;
}
.escalate-desc {
  display: block;
  margin-top: 6rpx;
  font-size: $rt-type-micro;
  color: $rt-text-secondary;
  line-height: 1.45;
}

.block {
  margin-top: 16rpx;
}
.block-title {
  display: block;
  margin-bottom: 8rpx;
  font-size: $rt-type-caption;
  font-weight: 800;
  color: $rt-text;
}
.block-item {
  display: block;
  font-size: $rt-type-caption;
  color: $rt-text-secondary;
  line-height: 1.5;
  margin-bottom: 4rpx;
}

.refs {
  margin-top: 14rpx;
}
.refs-label {
  display: block;
  margin-bottom: 8rpx;
  font-size: $rt-type-micro;
  font-weight: 700;
  color: $rt-text-muted;
}
.ref-pill {
  display: inline-block;
  margin: 0 8rpx 8rpx 0;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: $rt-blue-soft;
  color: $rt-blue;
  font-size: 20rpx;
  font-weight: 600;
}

.trust {
  margin-top: 14rpx;
  padding-top: 12rpx;
  border-top: 1rpx dashed $rt-border;
}
.source {
  display: block;
  font-size: $rt-type-micro;
  font-weight: 700;
  color: $rt-blue;
}
.disclaimer {
  display: block;
  margin-top: 4rpx;
  font-size: $rt-type-micro;
  color: $rt-text-muted;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}
.act {
  min-height: $rt-touch-min;
  padding: 16rpx 24rpx;
  border-radius: 999rpx;
  background: #fff;
  border: 1rpx solid rgba(158, 52, 40, 0.2);
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.act.primary {
  background: linear-gradient(135deg, $rt-primary-dark, $rt-primary-mid);
  border-color: transparent;
}
.act-text {
  font-size: $rt-type-caption;
  font-weight: 800;
  color: $rt-primary-dark;
}
.act.primary .act-text {
  color: #fff;
}
.act-press {
  opacity: 0.9;
}
</style>
