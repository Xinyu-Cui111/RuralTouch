/**
 * 从 faq.json 构建本地向量索引 faq-index.json（云函数 + utils 各一份）
 * 用法：node scripts/build-faq-index.js
 */
const fs = require("fs");
const path = require("path");
const {
  DIM,
  buildIdf,
  embedText,
  docText,
} = require("../cloudfunctions/rt-api/rag/embed");

const root = path.join(__dirname, "..");
const faqPath = path.join(root, "cloudfunctions/rt-api/faq.json");
const faq = JSON.parse(fs.readFileSync(faqPath, "utf8"));
const corpus = faq.map((item) => docText(item));
const idf = buildIdf(corpus);
const docs = faq.map((item) => ({
  id: item.id,
  vector: embedText(docText(item), idf),
}));

const pack = {
  version: 1,
  updated: new Date().toISOString().slice(0, 10),
  method: "hashing-tfidf",
  dim: DIM,
  alphaDefault: 0.55,
  note: "字bigram/词特征哈希 + IDF；查询时与关键词分融合。非外部 Embedding API。",
  idf,
  docs,
};

const targets = [
  path.join(root, "cloudfunctions/rt-api/faq-index.json"),
  path.join(root, "utils/faq-index.json"),
  path.join(root, "docs/knowledge/faq-index.json"),
];

targets.forEach((p) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(pack), "utf8");
  console.log(
    "wrote",
    path.relative(root, p),
    "docs=" + docs.length,
    "dim=" + DIM
  );
});

// 同步 FAQ 正文到 docs / utils
const faqTargets = [
  path.join(root, "utils/faq.json"),
  path.join(root, "docs/knowledge/faq.json"),
];
faqTargets.forEach((p) => {
  fs.writeFileSync(p, JSON.stringify(faq, null, 2) + "\n", "utf8");
  console.log("synced faq ->", path.relative(root, p));
});
