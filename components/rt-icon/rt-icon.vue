<template>
  <view class="icon-wrap" :class="[tone, size]">
    <image class="icon-img" :src="src" mode="aspectFit" lazy-load />
  </view>
</template>

<script>
/**
 * Lucide 线框图标（ISC），按 name → lucide 文件映射。
 * 颜色用预渲染 PNG tone，避免小程序 SVG 兼容问题。
 */
const NAME_TO_LUCIDE = {
  dispute: "scale",
  chuizi: "scale",
  record: "clipboard-list",
  notice: "bell",
  bell: "bell",
  ling: "bell",
  feedback: "message-square",
  declare: "pen-line",
  mall: "store",
  moral: "star",
  law: "book-open",
  story: "book-marked",
  search: "search",
  ai: "sparkles",
  product: "package",
  user: "user",
  banshou: "wrench",
  mi: "leaf",
  shui: "droplets",
  clothes: "shirt",
  fuzhuang: "shirt",
  rules: "scroll-text",
  "tab-village": "landmark",
  "tab-law": "scale",
  "tab-moral": "star",
  "tab-group": "shopping-bag",
  "tab-benefit": "shopping-bag",
  "tab-profile": "user-round",
};

const TONE_FILE = {
  gold: "gold",
  green: "green",
  forest: "green",
  olive: "green",
  neutral: "neutral",
  muted: "neutral",
  ghost: "ghost",
  white: "ghost",
  blue: "blue",
  civic: "dark",
  dark: "dark",
  primary: "dark",
};

export default {
  props: {
    name: { type: String, default: "moral" },
    tone: { type: String, default: "green" },
    size: { type: String, default: "md" },
  },
  computed: {
    src() {
      const lucide = NAME_TO_LUCIDE[this.name] || "package";
      const tone = TONE_FILE[this.tone] || "neutral";
      return `/static/icons/${lucide}-${tone}.png`;
    },
  },
};
</script>

<style lang="scss" scoped>
.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-wrap.sm {
  width: 40rpx;
  height: 40rpx;
}
.icon-wrap.md {
  width: 48rpx;
  height: 48rpx;
}
.icon-wrap.lg {
  width: 64rpx;
  height: 64rpx;
}

.icon-img {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
