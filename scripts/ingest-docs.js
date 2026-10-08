/**
 * 将 corpus 下 Markdown 手册切分为知识块，合并进 faq 检索语料并重建向量索引。
 * 对齐 JD：「文档整理、内容切分、向量检索」
 * 用法：node scripts/ingest-docs.js
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const corpusDir = path.join(root, "docs/knowledge/corpus");
const outChunks = path.join(root, "docs/knowledge/doc-chunks.json");
const faqCloud = path.join(root, "cloudfunctions/rt-api/faq.json");

function chunkMarkdown(md, source) {
  const parts = String(md || "").split(/\n(?=##\s+)/);
  const chunks = [];
  parts.forEach((part, idx) => {
    const text = part.trim();
    if (!text || (text.startsWith("# ") && !text.includes("\n##"))) {
      // 跳过仅有一级标题的前言块若过短
    }
    const titleMatch = text.match(/^##\s+(.+)$/m);
    const title = titleMatch
      ? titleMatch[1].trim()
      : source + "-段" + (idx + 1);
    const body = text.replace(/^##\s+.+$/m, "").trim();
    if (body.length < 20) return;
    const id =
      "doc-" +
      source.replace(/[^a-z0-9]+/gi, "-").toLowerCase() +
      "-" +
      String(idx + 1).padStart(2, "0");
    const keywords = [];
    const kwCandidates = [
      "受理",
      "建档",
      "材料",
      "办理",
      "办结",
      "高风险",
      "升级",
      "知识库",
      "Badcase",
      "评测",
      "降级",
      "调解",
      "报警",
    ];
    kwCandidates.forEach((k) => {
      if (body.includes(k) || title.includes(k)) keywords.push(k);
    });
    chunks.push({
      id,
      title: "【手册】" + title,
      category: "manual",
      keywords: keywords.length ? keywords : ["手册", "流程"],
      body,
      refs: ["村委调解业务操作手册（演示）"],
      sourceFile: source,
      chunkType: "markdown-heading",
    });
  });
  return chunks;
}

function main() {
  if (!fs.existsSync(corpusDir)) {
    console.error("missing corpus dir", corpusDir);
    process.exit(1);
  }
  const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith(".md"));
  let all = [];
  files.forEach((f) => {
    const md = fs.readFileSync(path.join(corpusDir, f), "utf8");
    all = all.concat(chunkMarkdown(md, f.replace(/\.md$/i, "")));
  });
  fs.writeFileSync(outChunks, JSON.stringify(all, null, 2) + "\n", "utf8");
  console.log("chunks=", all.length, "->", path.relative(root, outChunks));

  // 合并：保留非 manual 的 FAQ，替换 manual 块
  const faq = JSON.parse(fs.readFileSync(faqCloud, "utf8"));
  const base = faq.filter(
    (x) => x.category !== "manual" && !(x.id || "").startsWith("doc-")
  );
  const merged = base.concat(all);
  fs.writeFileSync(faqCloud, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log("faq merged entries=", merged.length);

  execSync("node scripts/build-faq-index.js", { cwd: root, stdio: "inherit" });
}

main();
