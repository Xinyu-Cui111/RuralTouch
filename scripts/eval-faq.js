/**
 * FAQ 混合检索评测（向量 + 关键词）
 * 用法：node scripts/eval-faq.js
 */
const fs = require("fs");
const path = require("path");
const {
  retrieveFaq,
  retrievalMeta,
} = require("../cloudfunctions/rt-api/knowledge.js");

const casesPath = path.join(__dirname, "../docs/eval/faq-cases.json");
const pack = JSON.parse(fs.readFileSync(casesPath, "utf8"));
const meta = retrievalMeta();

let hit = 0;
const fails = [];

pack.cases.forEach((c) => {
  const results = retrieveFaq(c.query, { topK: 3, mode: "hybrid" });
  const ids = results.map((r) => r.id);
  const ok = (c.expectIds || []).some((id) => ids.includes(id));
  if (ok) hit += 1;
  else {
    fails.push({
      id: c.id,
      query: c.query,
      expectIds: c.expectIds,
      got: ids,
      detail: results.map((r) => ({
        id: r.id,
        score: r.score,
        vectorScore: r.vectorScore,
        keywordScore: r.keywordScore,
        method: r.method,
      })),
    });
  }
});

const n = pack.cases.length;
console.log(
  "engine=" +
    meta.engine +
    " dim=" +
    meta.vector.dim +
    " method=" +
    meta.vector.method
);
console.log("cases=" + n);
console.log(
  "top3_hit=" + ((hit / n) * 100).toFixed(1) + "% (" + hit + "/" + n + ")"
);
console.log(
  "faq_entries=" + require("../cloudfunctions/rt-api/faq.json").length
);
if (fails.length) {
  console.log("failures:");
  fails.forEach((f) => console.log(JSON.stringify(f)));
  process.exitCode = 1;
} else {
  console.log("all passed");
}
