/**
 * 字段抽取回归
 * 用法：node scripts/doc-ai/eval-extract.js
 */
const fs = require("fs");
const path = require("path");
const { detectAndExtract } = require("./extract-fields");

const casesPath = path.join(__dirname, "../../docs/eval/extract-cases.json");
const pack = JSON.parse(fs.readFileSync(casesPath, "utf8"));

let pass = 0;
const fails = [];

pack.cases.forEach((c) => {
  const got = detectAndExtract(c.text);
  const exp = c.expect || {};
  const keys = Object.keys(exp);
  const bad = keys.filter((k) => String(got[k] || "") !== String(exp[k]));
  if (!bad.length) pass += 1;
  else fails.push({ id: c.id, bad, got, expect: exp });
});

const n = pack.cases.length;
console.log("cases=" + n);
console.log(
  "field_acc=" + ((pass / n) * 100).toFixed(1) + "% (" + pass + "/" + n + ")"
);
if (fails.length) {
  fails.forEach((f) => console.log(JSON.stringify(f)));
  process.exitCode = 1;
} else console.log("all passed");
