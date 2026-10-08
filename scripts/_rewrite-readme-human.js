const fs = require("fs");
let c = fs.readFileSync("README.md", "utf8");

const oldBlockStart = "## AI 应用能力台（仓库主展示 · 对齐常见培训生 JD）";
const oldBlockEnd = "## 为什么做这个";
const i0 = c.indexOf(oldBlockStart);
const i1 = c.indexOf(oldBlockEnd);
if (i0 < 0 || i1 < 0) {
  console.error("block markers missing", i0, i1);
  process.exit(1);
}

const replacement = `## 先看什么

村民不会写「案由」，干部建档慢——产品把这件事收成一条路：

**说事 → 整理成案 → 建档 → 受理 / 办理 / 办结**

其中 AI 负责把口语变成可推进的档案：标风险、给参考、失败时降级到规则，不装死。

干部侧另有一个**协办工具台**（登录管理员 → 我的 → 协办工具）：

| 做什么 | 怎么试 |
| ------ | ------ |
| 查办事口径（混合检索，现场出 Top3） | H5 打开协办工具，点例句 |
| 拆发票 / 合同字段 | 协办工具 → 拆单据；或 \`npm run doc:pipeline\` |
| 看评测与错案 | AI 质量看板；\`npm run eval\` |

![协办工具](docs/media/gallery/10-ai-lab.png) ![拆单据](docs/media/gallery/11-doc-extract.png)

本地常用命令：

\`\`\`bash
npm run dev:h5
npm run eval                 # 成案 42 · 检索 18 · 字段 3
npm run ingest:docs          # 手册改完重建索引
npm run doc:pipeline -- docs/knowledge/samples/invoice-demo.png
\`\`\`

细节：[DOC_AI.md](docs/DOC_AI.md) · [DEMO.md](docs/DEMO.md) · [knowledge/](docs/knowledge/)

---

`;

c = c.slice(0, i0) + replacement + c.slice(i1);

// soften why section bullets
c = c.replace(
  `- 普法/村务问答走**混合检索（向量 + 关键词）**：本地 384 维 FAQ 向量索引 + 关键词融合 Top3 + 引用展示；无 Key 仍可检索作答（自研薄层，**非** LangChain / **非**托管向量库）
- 成案结果标注来源：规则 / 知识检索 / 大模型 / 降级

适合：基层数字化、政务 AI 落地、uni-app + 云开发、需要「可演示主链路」的产品工程样本。`,
  `- 普法与助手会带上参考条目；检索是本地向量 + 关键词，语料小、能讲清楚
- 成案页标明这次结果来自规则、检索还是大模型；没 Key 也能演示

适合拿来讲「垂直场景里的 AI 应用」，而不是泛 Chat 套壳。`
);

c = c.replace(
  "| **AI 能力台**       | 检索现场跑、单据结构化、评测入口（JD 主展示）   |\n",
  "| **协办工具**         | 查口径、拆单据、看质量                           |\n"
);

c = c.replace(
  "- [x] **AI 能力台**（检索现场跑 / 单据 / 评测入口）+ 质量看板（42/42 · 18/18 · 3/3）",
  "- [x] 协办工具台（检索 / 拆单据 / 质量）与可复现评测"
);

c = c.replace(
  "| [pages/tools/ai-lab.vue](pages/tools/ai-lab.vue) | H5 AI 能力台 |",
  "| [pages/tools/ai-lab.vue](pages/tools/ai-lab.vue) | 协办工具台 |"
);

fs.writeFileSync("README.md", c);
console.log("readme humanized");
