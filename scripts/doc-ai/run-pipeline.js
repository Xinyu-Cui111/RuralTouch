#!/usr/bin/env node
/**
 * 文档 AI 管线：解析 → 字段抽取
 * 用法：node scripts/doc-ai/run-pipeline.js <file>
 */
const path = require("path");
const fs = require("fs");
const { parseFile } = require("./parse-file");
const { detectAndExtract } = require("./extract-fields");

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const file = args[0];
  if (!file) {
    console.error("用法: node scripts/doc-ai/run-pipeline.js <file>");
    process.exit(1);
  }
  const parsed = await parseFile(file);
  const fields = detectAndExtract(parsed.text);
  const out = {
    ok: true,
    source: path.basename(parsed.file),
    engine: parsed.engine,
    bytes: parsed.bytes,
    textChars: (parsed.text || "").length,
    ocrConfidence: parsed.ocrConfidence,
    textPreview: String(parsed.text || "").slice(0, 280),
    fields,
    pipeline: [
      "parse(" + parsed.engine + ")",
      "extract(" + (fields.parser || "n/a") + ")",
    ],
    note: "OCR=tesseract.js；PDF=pdf-parse；Word=mammoth；表格=xlsx。非云厂商 OCR。",
  };
  const outDir = path.join(__dirname, "../../docs/knowledge/samples/_out");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, path.basename(file) + ".json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  console.log("wrote", outPath);
  if (fields.docType === "unknown") process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
