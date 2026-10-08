const fs = require("fs");
let c = fs.readFileSync("docs/DEMO.md", "utf8");
if (c.includes("JD 对齐演示")) {
  console.log("DEMO already");
  process.exit(0);
}
const jd = `## JD 对齐演示（4 分钟 · 能力台主路径）

> 给「AI 应用培训生」类岗位：先摊开能力，再带业务闭环。

1. **开场 20s**：打开 H5 → 我的 → **AI 能力台**。念一遍链路：整理→切分→向量检索→生成/引用→字段结构化→评测。
2. **检索 60s**：点样例「土地边界…」→ 指 Top3 的 score/vector/kw；再问「知识库维护…」命中手册切块。
3. **单据 50s**：进「单据结构化」→ 填发票样例 → 抽出号码/购销方/金额；口头补一句仓库可跑 PDF/OCR。
4. **成案+质量 50s**：去说事整理成案看引用/来源 → AI 质量看板看 42/42·18/18·Badcase。
5. **收尾 20s**：\`npm run eval\` / \`doc:pipeline\` 可复现；诚实边界：非云厂商验真、非 LangChain。

---

`;
c = c.replace("# 演示脚本 · 指尖善治\n", "# 演示脚本 · 指尖善治\n\n" + jd);
c = c.replace(
  "评测：`npm run eval`（纠纷 42 + FAQ 15）",
  "评测：`npm run eval`（纠纷 42 + 检索 18 + 字段 3）"
);
c = c.replace("知识表 26 条", "知识条目 33（含手册切块）");
fs.writeFileSync("docs/DEMO.md", c);
console.log("DEMO jd section ok");
