/**
 * 单据字段结构化：发票 / 简易合同纯文本
 * 可接 OCR/PDF 抽出的 text；本身不做图像识别。
 */
/** OCR 常在汉字间插空格，先压紧再抽字段 */
function normalizeDocText(text) {
  return (
    String(text || "")
      // 只去掉汉字之间的空格/制表符，保留换行以免字段粘连
      .replace(/([\u4e00-\u9fff])[ \t]+(?=[\u4e00-\u9fff])/g, "$1")
      .replace(/[ \t]{2,}/g, " ")
      .trim()
  );
}

function pick(text, re) {
  const m = String(text || "").match(re);
  return m
    ? String(m[1] || "")
        .trim()
        .replace(/^[,:：\s]+/, "")
    : "";
}

function extractInvoiceFields(text) {
  const t = String(text || "");
  return {
    docType: "invoice",
    invoiceNo:
      pick(t, /发票号码[:：,\s]*([0-9A-Za-z]+)/) ||
      pick(t, /发票代码[:：,\s]*([0-9A-Za-z]+)/) ||
      pick(t, /Invoice\s*No\.?[:：,\s]*([0-9A-Za-z]+)/i),
    date:
      pick(t, /开票日期[:：,\s]*([0-9年月日\-/.]+)/) ||
      pick(t, /Date[:：,\s]*([0-9\-/.]+)/i),
    buyer:
      pick(t, /购方名称[:：,\s]*([^\n\r]+)/) ||
      pick(t, /购买方[:：,\s]*([^\n\r]+)/) ||
      pick(t, /Buyer[:：,\s]*([^\n\r]+)/i),
    seller:
      pick(t, /销方名称[:：,\s]*([^\n\r]+)/) ||
      pick(t, /销售方[:：,\s]*([^\n\r]+)/) ||
      pick(t, /Seller[:：,\s]*([^\n\r]+)/i),
    item:
      pick(t, /项目名称[:：,\s]*([^\n\r]+)/) ||
      pick(t, /货物或应税劳务[^\n]*[:：,\s]*([^\n\r]+)/) ||
      pick(t, /Item[:：,\s]*([^\n\r]+)/i),
    amount:
      pick(t, /价税合计[^\d]*([0-9]+(?:\.[0-9]+)?)/) ||
      pick(t, /合计[:：,\s]*[￥¥]?\s*([0-9]+(?:\.[0-9]+)?)/) ||
      pick(t, /Amount(?:\s*\(CNY\))?[:：,\s]*([0-9]+(?:\.[0-9]+)?)/i),
    currency: /人民币|CNY/i.test(t) ? "CNY" : "",
  };
}

function extractContractFields(text) {
  const t = String(text || "");
  return {
    docType: "contract",
    title: pick(t, /合同名称[:：\s]*([^\n\r]+)/) || pick(t, /《([^》]+)》/),
    partyA: pick(t, /甲方[:：\s]*([^\n\r]+)/),
    partyB: pick(t, /乙方[:：\s]*([^\n\r]+)/),
    amount: pick(t, /合同金额[:：\s]*[￥¥人民币]*\s*([0-9]+(?:\.[0-9]+)?)/),
    signDate: pick(t, /签订日期[:：\s]*([0-9年月日\-/.]+)/),
    term: pick(t, /履行期限[:：\s]*([^\n\r]+)/),
  };
}

function detectAndExtract(text) {
  const t = normalizeDocText(text);
  if (/发票|价税合计|开票日期|Invoice\s*No|Amount\s*\(CNY\)/i.test(t)) {
    return {
      ...extractInvoiceFields(t),
      parser: "invoice-rules",
      normalized: true,
    };
  }
  if (/甲方|乙方|合同|Contract/i.test(t)) {
    return {
      ...extractContractFields(t),
      parser: "contract-rules",
      normalized: true,
    };
  }
  return {
    docType: "unknown",
    parser: "none",
    preview: t.slice(0, 200),
    note: "未识别为发票/合同模板，请检查文本或先走 OCR/PDF 解析",
  };
}

module.exports = {
  extractInvoiceFields,
  extractContractFields,
  detectAndExtract,
};
