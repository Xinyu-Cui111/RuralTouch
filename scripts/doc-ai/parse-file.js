/**
 * 多格式文档 → 纯文本
 * 支持：.txt .md .csv .xlsx .docx .pdf .png .jpg .jpeg .webp
 */
const fs = require("fs");
const path = require("path");

async function parsePdf(buf) {
  let pdfParse = require("pdf-parse");
  if (pdfParse && pdfParse.default) pdfParse = pdfParse.default;
  if (typeof pdfParse === "function") {
    const data = await pdfParse(buf);
    return data.text || "";
  }
  if (pdfParse && typeof pdfParse.PDFParse === "function") {
    const parser = new pdfParse.PDFParse({ data: buf });
    const data = await parser.getText();
    return (data && data.text) || "";
  }
  throw new Error("无法加载 pdf-parse");
}

async function parseFile(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) throw new Error("文件不存在: " + abs);
  const ext = path.extname(abs).toLowerCase();
  const base = { file: abs, ext, bytes: fs.statSync(abs).size };

  if ([".txt", ".md", ".csv"].includes(ext)) {
    return { ...base, engine: "fs-text", text: fs.readFileSync(abs, "utf8") };
  }

  if (ext === ".xlsx" || ext === ".xls") {
    const XLSX = require("xlsx");
    const wb = XLSX.readFile(abs);
    const sheets = wb.SheetNames.map((name) => {
      const sheet = wb.Sheets[name];
      return "## " + name + "\n" + XLSX.utils.sheet_to_csv(sheet);
    });
    return { ...base, engine: "xlsx", text: sheets.join("\n\n") };
  }

  if (ext === ".docx") {
    const mammoth = require("mammoth");
    const r = await mammoth.extractRawText({ path: abs });
    return { ...base, engine: "mammoth", text: r.value || "" };
  }

  if (ext === ".pdf") {
    const buf = fs.readFileSync(abs);
    const text = await parsePdf(buf);
    return { ...base, engine: "pdf-parse", text };
  }

  if ([".png", ".jpg", ".jpeg", ".webp", ".bmp"].includes(ext)) {
    const { createWorker } = require("tesseract.js");
    const worker = await createWorker("chi_sim+eng");
    try {
      const { data } = await worker.recognize(abs);
      return {
        ...base,
        engine: "tesseract.js",
        text: (data && data.text) || "",
        ocrConfidence: data && data.confidence,
      };
    } finally {
      await worker.terminate();
    }
  }

  throw new Error("暂不支持的格式: " + ext);
}

module.exports = { parseFile };
