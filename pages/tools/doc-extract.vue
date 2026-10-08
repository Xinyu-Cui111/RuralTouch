<template>
  <view class="page">
    <rt-nav-bar title="单据结构化" />
    <view class="hero">
      <text class="hero-title">解析 → 字段抽取</text>
      <text class="hero-sub"
        >H5 演示粘贴发票/合同文本。图片 OCR / PDF 请用仓库 npm run
        doc:pipeline（tesseract / pdf-parse）。</text
      >
    </view>

    <view class="chips">
      <text class="chip" @click="loadSample('invoice')">填发票样例</text>
      <text class="chip" @click="loadSample('contract')">填合同样例</text>
      <text class="chip ghost" @click="raw = ''">清空</text>
    </view>

    <textarea
      class="area"
      v-model="raw"
      maxlength="4000"
      placeholder="粘贴发票或合同纯文本…"
    />

    <button class="primary" :disabled="busy || !raw.trim()" @click="run">
      {{ busy ? "抽取中…" : "抽取字段" }}
    </button>

    <view v-if="result" class="result">
      <text class="block-title">结构化结果</text>
      <text class="meta"
        >类型 {{ result.docType }} · 解析器 {{ result.parser }}</text
      >
      <view v-for="row in resultRows" :key="row.k" class="row">
        <text class="k">{{ row.k }}</text>
        <text class="v">{{ row.v }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { detectAndExtract } from "@/utils/doc-extract.js";

const SAMPLE_INVOICE = `电子发票（普通发票）
发票号码：24312000000123456789
开票日期：2026年03月18日
购方名称：示范村股份经济合作社
销方名称：上海某某办公用品有限公司
项目名称：A4打印纸
价税合计：人民币 128.00 元`;

const SAMPLE_CONTRACT = `合同名称：村委便民服务耗材采购合同
甲方：示范村民委员会
乙方：上海某某办公用品有限公司
合同金额：人民币 5600.00
签订日期：2026年02月10日
履行期限：2026年02月10日至2026年12月31日`;

export default {
  data() {
    return {
      raw: "",
      busy: false,
      result: null,
    };
  },
  computed: {
    resultRows() {
      if (!this.result) return [];
      return Object.keys(this.result)
        .filter((k) => !["parser", "preview", "note"].includes(k))
        .map((k) => ({
          k,
          v: this.result[k] == null ? "" : String(this.result[k]),
        }));
    },
  },
  methods: {
    loadSample(kind) {
      this.raw = kind === "contract" ? SAMPLE_CONTRACT : SAMPLE_INVOICE;
      this.result = null;
    },
    run() {
      this.busy = true;
      try {
        this.result = detectAndExtract(this.raw);
      } finally {
        this.busy = false;
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
.hero-title {
  display: block;
  font-size: 34rpx;
  font-weight: 800;
  color: $rt-text;
}
.hero-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: $rt-text-muted;
  line-height: 1.5;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin: 20rpx 0;
}
.chip {
  font-size: 22rpx;
  font-weight: 700;
  color: $rt-accent-dark;
  background: $rt-accent-soft;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
}
.chip.ghost {
  background: $rt-surface;
  border: 1rpx solid rgba(0, 0, 0, 0.08);
  color: $rt-text-secondary;
}
.area {
  width: 100%;
  min-height: 280rpx;
  padding: 20rpx;
  background: $rt-surface;
  border-radius: $rt-radius-md;
  font-size: 26rpx;
  line-height: 1.5;
  box-sizing: border-box;
}
.primary {
  @include rt-btn-reset;
  margin-top: 24rpx;
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $rt-accent-dark, $rt-accent);
  color: #fff;
  font-weight: 800;
  font-size: 28rpx;
}
.primary[disabled] {
  opacity: 0.5;
}
.result {
  margin-top: 32rpx;
}
.block-title {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  margin-bottom: 8rpx;
}
.meta {
  display: block;
  font-size: 22rpx;
  color: $rt-text-muted;
  margin-bottom: 12rpx;
}
.row {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  padding: 12rpx 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
  font-size: 24rpx;
}
.k {
  color: $rt-text-secondary;
  flex-shrink: 0;
}
.v {
  color: $rt-text;
  font-weight: 700;
  text-align: right;
}
</style>
