<template>
  <view class="page">
    <rt-nav-bar title="AI 能力台" />
    <view class="hero">
      <text class="hero-kicker">面试 / JD 对齐展示</text>
      <text class="hero-title"
        >文档整理 → 切分 → 向量检索 → 生成/引用 → 字段结构化 → 评测迭代</text
      >
      <text class="hero-sub"
        >场景载体是基层调解；能力面按「AI
        应用培训生」常见要求铺开，均可点开演示。</text
      >
    </view>

    <view class="metric-grid">
      <view class="metric" v-for="m in metrics" :key="m.label">
        <text class="metric-num">{{ m.value }}</text>
        <text class="metric-label">{{ m.label }}</text>
      </view>
    </view>

    <view class="block">
      <text class="block-title">1. 知识库建设与维护</text>
      <text class="block-body"
        >FAQ 条目 + 业务手册 Markdown（按标题切分）。改语料后
        <text class="code">npm run ingest:docs</text> 重建 384
        维本地向量索引。</text
      >
      <view class="tag-row">
        <text class="tag" v-for="t in kbTags" :key="t">{{ t }}</text>
      </view>
    </view>

    <view class="block">
      <text class="block-title">2. 混合检索（现场可跑）</text>
      <text class="block-body"
        >向量余弦 ×0.55 + 关键词融合；返回 Top3 与引用。不是托管向量库，不是
        LangChain。</text
      >
      <view class="chips">
        <text
          class="chip"
          v-for="q in sampleQueries"
          :key="q"
          @click="runRetrieve(q)"
          >{{ q }}</text
        >
      </view>
      <input
        class="input"
        v-model="query"
        placeholder="输入查询，点检索"
        confirm-type="search"
        @confirm="runRetrieve(query)"
      />
      <button class="primary" size="mini" @click="runRetrieve(query)">
        检索 Top3
      </button>
      <view v-if="hits.length" class="hits">
        <view v-for="(h, i) in hits" :key="h.id" class="hit">
          <text class="hit-title">{{ i + 1 }}. {{ h.title }}</text>
          <text class="hit-meta"
            >{{ h.method }} · score {{ h.score }} · vec {{ h.vectorScore }} · kw
            {{ h.keywordScore }}</text
          >
          <text class="hit-body">{{ h.body }}</text>
        </view>
      </view>
    </view>

    <view class="block">
      <text class="block-title">3. 大模型应用能力（产品内）</text>
      <text class="block-body"
        >知识问答 / 内容总结 / 信息提取（成案结构化）/ 对话；无 Key
        规则降级。</text
      >
      <view class="btn-row">
        <button
          class="link-btn"
          size="mini"
          @click="go('/pages/village/submit')"
        >
          说事成案（结构化）
        </button>
        <button class="link-btn" size="mini" @click="go('/pages/ai/assistant')">
          村务对话
        </button>
        <button class="link-btn" size="mini" @click="go('/pages/law/aiLegal')">
          普法问答
        </button>
      </view>
    </view>

    <view class="block">
      <text class="block-title">4. 单据识别与字段结构化</text>
      <text class="block-body"
        >H5 粘贴抽取；仓库管线支持 PDF / 图片 OCR / Excel / Word →
        JSON。字段评测 3/3。</text
      >
      <view class="btn-row">
        <button
          class="link-btn"
          size="mini"
          @click="go('/pages/tools/doc-extract')"
        >
          打开单据结构化
        </button>
      </view>
      <text class="code-line"
        >npm run doc:pipeline -- docs/knowledge/samples/invoice-demo.pdf</text
      >
      <text class="code-line"
        >npm run doc:pipeline -- docs/knowledge/samples/invoice-demo.png</text
      >
      <text class="code-line">npm run doc:eval</text>
    </view>

    <view class="block">
      <text class="block-title">5. 效果验证与迭代闭环</text>
      <text class="block-body"
        >评测集回归 + Badcase（标→修→关）+ 来源可见。对齐「错误案例整理 /
        提示词与知识库更新」。</text
      >
      <view class="btn-row">
        <button
          class="link-btn"
          size="mini"
          @click="go('/pages/admin/ai-quality')"
        >
          AI 质量看板
        </button>
      </view>
      <text class="code-line">npm run eval</text>
    </view>

    <view class="block last">
      <text class="block-title">诚实边界</text>
      <text class="block-body"
        >有：本地向量索引、手册切分、OCR/PDF
        管线、字段评测、业务闭环。没有：云厂商票据验真、版面检测、托管向量库、LangChain
        套壳。</text
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
      sampleQueries: [
        "土地边界对不上怎么办",
        "知识库维护要重建索引和评测吗",
        "打架受伤要不要升级",
      ],
      kbTags: [],
      metrics: [],
    };
  },
  created() {
    const meta = retrievalMeta();
    const manual = faqList.filter(
      (x) => x.category === "manual" || String(x.id || "").startsWith("doc-")
    ).length;
    const faq = faqList.length - manual;
    this.kbTags = [
      `FAQ ${faq} 条`,
      `手册切块 ${manual}`,
      `索引 ${meta.vector.docs} 篇`,
      `${meta.vector.dim} 维`,
      meta.vector.method,
    ];
    this.metrics = [
      { value: "42/42", label: "纠纷评测" },
      { value: "18/18", label: "检索 Top3" },
      { value: "3/3", label: "字段抽取" },
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
  @include rt-page;
  padding: $rt-page-x;
  padding-bottom: 100rpx;
}
.hero-kicker {
  display: block;
  font-size: 22rpx;
  font-weight: 800;
  color: $rt-accent-dark;
  margin-bottom: 8rpx;
}
.hero-title {
  display: block;
  font-size: 32rpx;
  font-weight: 800;
  color: $rt-text;
  line-height: 1.4;
}
.hero-sub {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: $rt-text-muted;
  line-height: 1.5;
}
.metric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
  margin: 24rpx 0;
}
.metric {
  background: $rt-surface;
  border-radius: $rt-radius-md;
  padding: 20rpx;
}
.metric-num {
  display: block;
  font-size: 36rpx;
  font-weight: 800;
  color: $rt-accent-dark;
}
.metric-label {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: $rt-text-muted;
}
.block {
  margin-bottom: 28rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}
.block.last {
  border-bottom: 0;
}
.block-title {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  margin-bottom: 8rpx;
}
.block-body {
  display: block;
  font-size: 24rpx;
  color: $rt-text-secondary;
  line-height: 1.55;
}
.code {
  font-family: ui-monospace, monospace;
  font-size: 22rpx;
  color: $rt-accent-dark;
}
.code-line {
  display: block;
  margin-top: 10rpx;
  font-size: 20rpx;
  font-family: ui-monospace, monospace;
  color: $rt-text-muted;
  background: rgba(0, 0, 0, 0.03);
  padding: 10rpx 12rpx;
  border-radius: 8rpx;
}
.tag-row,
.chips,
.btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 14rpx;
}
.tag,
.chip {
  font-size: 22rpx;
  font-weight: 700;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: $rt-accent-soft;
  color: $rt-accent-dark;
}
.chip {
  background: $rt-surface;
  border: 1rpx solid rgba(201, 162, 74, 0.35);
}
.input {
  margin-top: 14rpx;
  padding: 16rpx;
  background: $rt-surface;
  border-radius: 12rpx;
  font-size: 26rpx;
}
.primary {
  @include rt-btn-reset;
  margin-top: 12rpx;
  background: linear-gradient(135deg, $rt-accent-dark, $rt-accent);
  color: #fff;
  font-size: 24rpx;
  font-weight: 800;
  padding: 0 28rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 999rpx;
}
.link-btn {
  @include rt-btn-reset;
  background: $rt-surface;
  color: $rt-accent-dark;
  border: 1rpx solid rgba(201, 162, 74, 0.35);
  border-radius: 999rpx;
  font-size: 22rpx;
  padding: 0 22rpx;
  height: 60rpx;
  line-height: 60rpx;
  font-weight: 700;
}
.hits {
  margin-top: 16rpx;
}
.hit {
  padding: 14rpx 0;
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
}
.hit-title {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
}
.hit-meta {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: $rt-text-muted;
}
.hit-body {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $rt-text-secondary;
  line-height: 1.45;
}
</style>
