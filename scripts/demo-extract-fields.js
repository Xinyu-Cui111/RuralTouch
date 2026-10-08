/**
 * 单据「文本侧」字段结构化 Demo（非 OCR）
 * 输入：粘贴的发票/回单纯文本；输出：结构化 JSON
 * 用法：node scripts/demo-extract-fields.js
 * 诚实口径：证明「字段提取与结构化」能力；图片 OCR 另学，不在此冒充。
 */
const sample = `
电子发票（普通发票）
发票号码：24312000000123456789
开票日期：2026年03月18日
购方名称：示范村股份经济合作社
销方名称：上海某某办公用品有限公司
项目名称：A4打印纸
价税合计：人民币 128.00 元
`;

function extractInvoiceFields(text) {
  const t = String(text || "");
  const pick = (re) => {
    const m = t.match(re);
    return m ? (m[1] || "").trim() : "";
  };
  return {
    docType: /发票/.test(t)
      ? "invoice"
      : /合同/.test(t)
      ? "contract"
      : "unknown",
    invoiceNo: pick(/发票号码[:：\s]*([0-9A-Za-z]+)/),
    date: pick(/开票日期[:：\s]*([0-9年月日\-/\.]+)/),
    buyer: pick(/购方名称[:：\s]*([^\n\r]+)/),
    seller: pick(/销方名称[:：\s]*([^\n\r]+)/),
    item: pick(/项目名称[:：\s]*([^\n\r]+)/),
    amount: pick(/价税合计[:：\s]*[^\d]*([0-9]+(?:\.[0-9]+)?)/),
    currency: /人民币|CNY/i.test(t) ? "CNY" : "",
    note: "规则/正则抽取自纯文本；未使用图像 OCR",
  };
}

const out = extractInvoiceFields(sample);
console.log(JSON.stringify(out, null, 2));
if (!out.invoiceNo || !out.amount) process.exitCode = 1;
else console.log("extract_ok");

module.exports = { extractInvoiceFields };
