<template>
  <view class="page">
    <rt-nav-bar title="拆单据" />

    <view class="mast">
      <text class="mast-title">把票和合同变成字段</text>
      <text class="mast-desc"
        >粘贴文字即可试抽。图片、PDF 在仓库里用本地 OCR /
        解析脚本跑同一套规则。</text
      >
    </view>

    <view class="tabs">
      <text
        class="tab"
        :class="{ on: kind === 'invoice' }"
        @click="loadSample('invoice')"
        >发票样例</text
      >
      <text
        class="tab"
        :class="{ on: kind === 'contract' }"
        @click="loadSample('contract')"
        >合同样例</text
      >
      <text class="tab ghost" @click="clear">清空</text>
    </view>

    <view class="sheet">
      <textarea
        class="area"
        v-model="raw"
        maxlength="4000"
        placeholder="把发票或合同正文贴进来…"
      />
      <view
        class="cta"
        :class="{ disabled: busy || !raw.trim() }"
        hover-class="cta-press"
        :hover-stay-time="80"
        @click="run"
      >
        <text>{{ busy ? "正在抽取…" : "抽出字段" }}</text>
      </view>
    </view>

    <view v-if="result && result.docType !== 'unknown'" class="card">
      <view class="card-head">
        <text class="card-title">{{ typeLabel }}</text>
        <text class="card-badge">已结构化</text>
      </view>
      <view v-for="row in resultRows" :key="row.k" class="field">
        <text class="field-k">{{ row.label }}</text>
        <text class="field-v">{{ row.v }}</text>
      </view>
    </view>
    <view v-else-if="result" class="warn">
      <text
        >没识别成发票或合同模板，换一段带「发票号码 /
        甲方乙方」的正文再试。</text
      >
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

const LABELS = {
  docType: "类型",
  invoiceNo: "发票号码",
  date: "开票日期",
  buyer: "购方",
  seller: "销方",
  item: "项目",
  amount: "金额",
  currency: "币种",
  title: "合同名称",
  partyA: "甲方",
  partyB: "乙方",
  signDate: "签订日期",
  term: "履行期限",
};

export default {
  data() {
    return {
      raw: "",
      busy: false,
      result: null,
      kind: "invoice",
    };
  },
  computed: {
    typeLabel() {
      if (!this.result) return "";
      if (this.result.docType === "invoice") return "发票";
      if (this.result.docType === "contract") return "合同";
      return this.result.docType;
    },
    resultRows() {
      if (!this.result) return [];
      return Object.keys(this.result)
        .filter(
          (k) =>
            !["parser", "preview", "note", "normalized", "docType"].includes(k)
        )
        .filter((k) => this.result[k] !== "" && this.result[k] != null)
        .map((k) => ({
          k,
          label: LABELS[k] || k,
          v: String(this.result[k]),
        }));
    },
  },
  methods: {
    loadSample(kind) {
      this.kind = kind;
      this.raw = kind === "contract" ? SAMPLE_CONTRACT : SAMPLE_INVOICE;
      this.result = null;
    },
    clear() {
      this.raw = "";
      this.result = null;
    },
    run() {
      if (!this.raw.trim() || this.busy) return;
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
  min-height: 100vh;
  padding: 0 $rt-page-x 80rpx;
  background: radial-gradient(
      100% 70% at 80% -20%,
      rgba(184, 107, 53, 0.1),
      transparent 55%
    ),
    $rt-bg;
}

.mast {
  margin: 12rpx 0 20rpx;
  padding: 8rpx 4rpx 4rpx;
}
.mast-title {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: $rt-text;
}
.mast-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 1.55;
  color: $rt-text-secondary;
}

.tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 18rpx;
}
.tab {
  font-size: 24rpx;
  font-weight: 700;
  padding: 12rpx 22rpx;
  border-radius: 999rpx;
  background: $rt-surface;
  color: $rt-text-secondary;
  border: 1rpx solid $rt-border;
}
.tab.on {
  background: $rt-warm-soft;
  color: $rt-warm;
  border-color: rgba(184, 107, 53, 0.25);
}
.tab.ghost {
  background: transparent;
}

.sheet {
  padding: 22rpx;
  border-radius: 24rpx;
  background: $rt-surface;
  border: 1rpx solid $rt-border;
  box-shadow: 0 8rpx 28rpx rgba(106, 70, 40, 0.05);
}
.area {
  width: 100%;
  min-height: 300rpx;
  padding: 8rpx;
  font-size: 26rpx;
  line-height: 1.55;
  color: $rt-text;
  box-sizing: border-box;
}
.cta {
  margin-top: 16rpx;
  height: 88rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $rt-primary-dark, $rt-primary-mid);
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
}
.cta.disabled {
  opacity: 0.45;
}
.cta-press {
  transform: scale(0.985);
  opacity: 0.92;
}

.card {
  margin-top: 22rpx;
  padding: 8rpx 24rpx 12rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, $rt-card-warm-top, $rt-card-warm-bottom);
  border: 1rpx solid rgba(184, 107, 53, 0.16);
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
}
.card-title {
  font-size: 30rpx;
  font-weight: 800;
  color: $rt-text;
}
.card-badge {
  font-size: 20rpx;
  font-weight: 800;
  color: $rt-warm;
  background: rgba(255, 255, 255, 0.7);
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
}
.field {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 16rpx 0;
  border-top: 1rpx solid rgba(184, 107, 53, 0.12);
}
.field-k {
  font-size: 24rpx;
  color: $rt-text-muted;
  flex-shrink: 0;
}
.field-v {
  font-size: 26rpx;
  font-weight: 700;
  color: $rt-text;
  text-align: right;
}

.warn {
  margin-top: 22rpx;
  padding: 22rpx;
  border-radius: 16rpx;
  background: $rt-primary-soft;
  color: $rt-primary-dark;
  font-size: 24rpx;
  line-height: 1.5;
}
</style>
