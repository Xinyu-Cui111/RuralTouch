<template>
  <view class="page">
    <rt-nav-bar title="协办工具" />

    <view class="mast">
      <view class="mast-veil" />
      <text class="mast-eyebrow">指尖善治 · 干部侧</text>
      <text class="mast-title">查口径、拆单据、看质量</text>
      <text class="mast-desc"
        >给调解员用的小工具台：先检索村里的办事口径，再把发票合同抽成字段，出了错能回到评测里改。</text
      >
    </view>

    <view class="strip">
      <view class="strip-item" v-for="m in metrics" :key="m.label">
        <text class="strip-num">{{ m.value }}</text>
        <text class="strip-label">{{ m.label }}</text>
      </view>
    </view>

    <view class="panel">
      <view class="panel-head">
        <text class="panel-title">查办事口径</text>
        <text class="panel-hint">本地知识库 · 向量 + 关键词</text>
      </view>
      <view class="ask-row">
        <input
          class="ask"
          v-model="query"
          placeholder="例如：土地边界扯不清怎么办"
          confirm-type="search"
          @confirm="runRetrieve(query)"
        />
        <view
          class="ask-btn"
          hover-class="ask-btn-press"
          :hover-stay-time="80"
          @click="runRetrieve(query)"
        >
          <text>检索</text>
        </view>
      </view>
      <view class="hints">
        <text
          v-for="q in sampleQueries"
          :key="q"
          class="hint"
          @click="runRetrieve(q)"
          >{{ q }}</text
        >
      </view>
      <view v-if="hits.length" class="results">
        <view v-for="(h, i) in hits" :key="h.id" class="result">
          <view class="result-top">
            <text class="result-idx">{{ i + 1 }}</text>
            <text class="result-title">{{ h.title }}</text>
          </view>
          <text class="result-body">{{ h.body }}</text>
          <text class="result-foot"
            >相关度 {{ h.score }} · 向量 {{ h.vectorScore }} · 关键词
            {{ h.keywordScore }}</text
          >
        </view>
      </view>
      <view v-else class="empty-tip">
        <text>点上面的例句，或自己输入一句村民常问的话。</text>
      </view>
    </view>

    <view class="actions">
      <view class="action" @click="go('/pages/tools/doc-extract')">
        <text class="action-title">拆单据</text>
        <text class="action-desc">发票、合同抽字段</text>
      </view>
      <view class="action" @click="go('/pages/village/submit')">
        <text class="action-title">去说事</text>
        <text class="action-desc">口述整理成案</text>
      </view>
      <view class="action" @click="go('/pages/admin/ai-quality')">
        <text class="action-title">看质量</text>
        <text class="action-desc">评测与错案</text>
      </view>
      <view class="action" @click="go('/pages/law/aiLegal')">
        <text class="action-title">普法问答</text>
        <text class="action-desc">带参考条目</text>
      </view>
    </view>

    <view class="foot">
      <text class="foot-text"
        >知识条目 {{ kbCount }} · 手册切块 {{ manualCount }} · 索引
        {{ indexDim }} 维。改手册后本地执行 npm run ingest:docs。</text
      >
    </view>
  </view>
</template>

<script>
import { retrieveFaq, retrievalMeta } from "@/utils/knowledge.js";
import faqList from "@/utils/faq.json";

export default {
  data() {
    return {
      query: "",
      hits: [],
      sampleQueries: ["土地边界扯不清", "打架受伤怎么办", "知识库改完要做什么"],
      metrics: [],
      kbCount: 0,
      manualCount: 0,
      indexDim: 384,
    };
  },
  created() {
    const meta = retrievalMeta();
    const manual = faqList.filter(
      (x) => x.category === "manual" || String(x.id || "").startsWith("doc-")
    ).length;
    this.manualCount = manual;
    this.kbCount = faqList.length;
    this.indexDim = (meta.vector && meta.vector.dim) || 384;
    this.metrics = [
      { value: "42", label: "成案用例" },
      { value: "18", label: "检索用例" },
      { value: "3", label: "单据用例" },
      { value: String(faqList.length), label: "知识条目" },
    ];
  },
  methods: {
    runRetrieve(q) {
      const text = String(q || this.query || "").trim();
      if (!text) return;
      this.query = text;
      this.hits = retrieveFaq(text, { topK: 3, mode: "hybrid" });
    },
    go(url) {
      uni.navigateTo({ url });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme.scss";

.page {
  min-height: 100vh;
  padding: 0 $rt-page-x 80rpx;
  background: radial-gradient(
      120% 80% at 10% -10%,
      rgba(158, 52, 40, 0.08),
      transparent 55%
    ),
    radial-gradient(90% 60% at 100% 0%, rgba(90, 107, 56, 0.1), transparent 50%),
    $rt-bg;
}

.mast {
  position: relative;
  margin: 12rpx 0 20rpx;
  padding: 36rpx 28rpx 32rpx;
  border-radius: 28rpx;
  overflow: hidden;
  background: linear-gradient(
    145deg,
    $rt-card-ai-top 0%,
    $rt-card-ai-mid 48%,
    $rt-card-ai-bottom 100%
  );
  border: 1rpx solid rgba(158, 52, 40, 0.12);
  box-shadow: 0 10rpx 36rpx rgba(106, 70, 40, 0.08);
}
.mast-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent 40%,
    rgba(201, 162, 74, 0.12) 100%
  );
  pointer-events: none;
}
.mast-eyebrow {
  position: relative;
  display: block;
  font-size: 22rpx;
  letter-spacing: 0.08em;
  color: $rt-primary;
  font-weight: 700;
}
.mast-title {
  position: relative;
  display: block;
  margin-top: 12rpx;
  font-size: 40rpx;
  font-weight: 800;
  color: $rt-text;
  letter-spacing: 0.02em;
}
.mast-desc {
  position: relative;
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.55;
  color: $rt-text-secondary;
}

.strip {
  display: flex;
  justify-content: space-between;
  gap: 8rpx;
  margin-bottom: 22rpx;
  padding: 8rpx 4rpx;
}
.strip-item {
  flex: 1;
  text-align: center;
}
.strip-num {
  display: block;
  font-size: 34rpx;
  font-weight: 800;
  color: $rt-primary-dark;
  font-variant-numeric: tabular-nums;
}
.strip-label {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: $rt-text-muted;
}

.panel {
  padding: 28rpx 24rpx;
  border-radius: 24rpx;
  background: $rt-surface;
  border: 1rpx solid $rt-border;
  box-shadow: 0 8rpx 28rpx rgba(106, 70, 40, 0.05);
}
.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 18rpx;
}
.panel-title {
  font-size: 30rpx;
  font-weight: 800;
  color: $rt-text;
}
.panel-hint {
  font-size: 20rpx;
  color: $rt-text-muted;
}
.ask-row {
  display: flex;
  gap: 12rpx;
  align-items: center;
}
.ask {
  flex: 1;
  height: 80rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: $rt-bg;
  border: 1rpx solid $rt-border-strong;
  font-size: 26rpx;
}
.ask-btn {
  flex-shrink: 0;
  height: 80rpx;
  padding: 0 32rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $rt-primary-dark, $rt-primary-mid);
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
}
.ask-btn-press {
  opacity: 0.88;
  transform: scale(0.98);
}
.hints {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}
.hint {
  font-size: 22rpx;
  color: $rt-olive;
  background: $rt-olive-soft;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
}
.results {
  margin-top: 20rpx;
}
.result {
  padding: 18rpx 0;
  border-top: 1rpx solid $rt-border;
}
.result-top {
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
}
.result-idx {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: $rt-primary-soft;
  color: $rt-primary;
  font-size: 20rpx;
  font-weight: 800;
  text-align: center;
  line-height: 36rpx;
  flex-shrink: 0;
}
.result-title {
  flex: 1;
  font-size: 28rpx;
  font-weight: 700;
  color: $rt-text;
  line-height: 1.35;
}
.result-body {
  display: block;
  margin-top: 10rpx;
  margin-left: 48rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: $rt-text-secondary;
}
.result-foot {
  display: block;
  margin-top: 8rpx;
  margin-left: 48rpx;
  font-size: 20rpx;
  color: $rt-text-muted;
}
.empty-tip {
  margin-top: 20rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: $rt-olive-soft;
  font-size: 24rpx;
  color: $rt-forest-text;
  line-height: 1.5;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14rpx;
  margin-top: 22rpx;
}
.action {
  padding: 24rpx 22rpx;
  border-radius: 20rpx;
  background: $rt-surface;
  border: 1rpx solid $rt-border;
}
.action-title {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  color: $rt-text;
}
.action-desc {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $rt-text-muted;
}

.foot {
  margin-top: 28rpx;
  padding: 0 8rpx;
}
.foot-text {
  font-size: 22rpx;
  line-height: 1.5;
  color: $rt-text-muted;
}
</style>
