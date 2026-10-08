/**
 * 本地 FAQ 检索评测（不依赖云函数 / LLM）
 * 用法：node scripts/eval-faq.js
 */
const fs = require("fs");
const path = require("path");
const { retrieveFaq } = require("../cloudfunctions/rt-api/knowledge.js");

const casesPath = path.join(__dirname, "../docs/eval/faq-cases.json");
const pack = JSON.parse(fs.readFileSync(casesPath, "utf8"));

let hit = 0;
const fails = [];

pack.cases.forEach((c) => {
  const results = retrieveFaq(c.query, { topK: 3, minScore: 2 });
  const ids = results.map((r) => r.id);
  const ok = (c.expectIds || []).some((id) => ids.includes(id));
  if (ok) hit += 1;
  else {
    fails.push({
      id: c.id,
      query: c.query,
      expectIds: c.expectIds,
      got: ids,
      scores: results.map((r) => ({ id: r.id, score: r.score })),
    });
  }
});

const n = pack.cases.length;
console.log(`cases=${n}`);
console.log(`top3_hit=${((hit / n) * 100).toFixed(1)}% (${hit}/${n})`);
console.log(
  `faq_entries=${require("../cloudfunctions/rt-api/faq.json").length}`
);
if (fails.length) {
  console.log("failures:");
  fails.forEach((f) => console.log(JSON.stringify(f)));
  process.exitCode = 1;
} else {
  console.log("all passed");
}
