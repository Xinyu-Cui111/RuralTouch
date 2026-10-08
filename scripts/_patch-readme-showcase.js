const fs = require("fs");
let c = fs.readFileSync("README.md", "utf8");

const showcase = `
---

## AI 应用能力台（仓库主展示 · 对齐常见培训生 JD）

> 业务载体：基层调解。**招聘侧看的是下面这条可演示链路**，不是团购/积分辅线。  
> H5 登录管理员后：**我的 → 干部工作台 → AI 能力台**（\`/pages/tools/ai-lab\`）

### JD 要求 ↔ 本仓库怎么「摊开」演示

| 岗位常见要求 | 本仓库落地 | 你怎么点开 |
| ------------ | ---------- | ---------- |
| 知识问答 / 对话 / 总结 / 信息提取 | 普法&村务问答；说事→结构化成案（标题/类型/风险/步骤） | 能力台 §3 或议事厅「去说事」 |
| 企业知识库建设与维护 | FAQ + **业务手册切分入库**；\`ingest:docs\` 重建索引 | 能力台 §1–2（现场检索 Top3） |
| RAG：整理→切分→向量→生成 | 本地 **384 维**向量索引 + 关键词融合；引用 chips；可接 LLM | 能力台一键检索；\`npm run eval:faq\` **18/18** |
| 单据识别 / 字段结构化 | PDF / 图片 OCR / Excel / Word → 发票&合同 JSON | 能力台 §4；\`npm run doc:pipeline\`；字段评测 **3/3** |
| 错误案例 / Prompt / 知识更新 | Badcase 标→修→关；评测回归；来源可见 | AI 质量看板；\`npm run eval\` |

### 一键验收（面试前跑）

\`\`\`bash
npm run ingest:docs          # 手册切分 + 重建向量索引
npm run eval                 # 纠纷 42 + 检索 18 + 字段 3
npm run doc:pipeline -- docs/knowledge/samples/invoice-demo.pdf
npm run doc:pipeline -- docs/knowledge/samples/invoice-demo.png
npm run dev:h5               # 打开 AI 能力台做现场检索 / 单据抽取
\`\`\`

说明文档：[DOC_AI.md](docs/DOC_AI.md) · [knowledge/](docs/knowledge/) · [DEMO.md](docs/DEMO.md)（含 JD 对齐旁白）

---
`;

if (!c.includes("AI 应用能力台（仓库主展示")) {
  c = c.replace(
    /\n---\n\n## 为什么做这个\n/,
    "\n" + showcase + "\n## 为什么做这个\n"
  );
}

c = c.replace(
  /\| AI   \| 大模型 JSON 结构化输出 \+ 规则引擎兜底 \+ 知识表 Top3 检索引用 \|/,
  "| AI   | 混合检索（本地向量+关键词）+ 手册切分 + 单据 OCR/解析 + 规则/LLM 成案 + 评测/Badcase |"
);

c = c.replace(
  /- \[x\] 管理端 AI 质量看板（H5 Mock 可演示；离线基线 42\/42 · 15\/15）/,
  "- [x] **AI 能力台**（检索现场跑 / 单据 / 评测入口）+ 质量看板（42/42 · 18/18 · 3/3）"
);

if (!c.includes("DOC_AI.md")) {
  c = c.replace(
    "| [docs/EVAL.md](docs/EVAL.md)             | 纠纷整理评测       |",
    "| [docs/EVAL.md](docs/EVAL.md)             | 纠纷整理评测       |\n| [docs/DOC_AI.md](docs/DOC_AI.md)         | 单据 OCR / 字段管线 |\n| [pages/tools/ai-lab.vue](pages/tools/ai-lab.vue) | H5 AI 能力台 |"
  );
}

// 功能一览加能力台
if (!c.includes("| AI 能力台")) {
  c = c.replace(
    "| 纠纷调解            | 场景标签、口述/文字说事、整理确认、建档、时间线 |",
    "| **AI 能力台**       | 检索现场跑、单据结构化、评测入口（JD 主展示）   |\n| 纠纷调解            | 场景标签、口述/文字说事、整理确认、建档、时间线 |"
  );
}

fs.writeFileSync("README.md", c);
console.log("README showcase ok");
