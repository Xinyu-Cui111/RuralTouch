/**
 * 本地跑规则引擎评测（不依赖云函数）
 * 用法：node scripts/eval-dispute.js
 */
const fs = require("fs");
const path = require("path");

// 与 cloudfunctions/rt-api/ai-engine.js 对齐的精简加载
const enginePath = path.join(
  __dirname,
  "../cloudfunctions/rt-api/ai-engine.js"
);
const { analyzeDispute } = require(enginePath);

const casesPath = path.join(__dirname, "../docs/eval/dispute-cases.json");
const pack = JSON.parse(fs.readFileSync(casesPath, "utf8"));

let catOk = 0;
let riskOk = 0;
let escOk = 0;
const fails = [];

pack.cases.forEach((c) => {
  const res = analyzeDispute({ content: c.input });
  const data = res.data || {};
  const e = c.expect || {};
  const catHit = !e.category || data.category === e.category;
  const riskHit = !e.riskLevel || data.riskLevel === e.riskLevel;
  const escHit = e.escalate === undefined || !!data.escalate === !!e.escalate;
  if (catHit) catOk += 1;
  if (riskHit) riskOk += 1;
  if (escHit) escOk += 1;
  if (!catHit || !riskHit || !escHit) {
    fails.push({
      id: c.id,
      expect: e,
      got: {
        category: data.category,
        riskLevel: data.riskLevel,
        escalate: !!data.escalate,
      },
    });
  }
});

const n = pack.cases.length;
console.log(`cases=${n}`);
console.log(`category_acc=${((catOk / n) * 100).toFixed(1)}% (${catOk}/${n})`);
console.log(`risk_acc=${((riskOk / n) * 100).toFixed(1)}% (${riskOk}/${n})`);
console.log(`escalate_acc=${((escOk / n) * 100).toFixed(1)}% (${escOk}/${n})`);
if (fails.length) {
  console.log("failures:");
  fails.forEach((f) => console.log(JSON.stringify(f)));
  process.exitCode = 1;
} else {
  console.log("all passed");
}
