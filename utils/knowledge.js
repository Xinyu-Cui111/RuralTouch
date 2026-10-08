/**
 * 客户端 / H5 Mock 用知识检索（与云函数 knowledge.js 对齐）
 * FAQ 为本地关键词知识表 TopK，不是向量库。
 */
import faqList from "@/utils/faq.json";

function tokenize(text) {
  const s = String(text || "").trim();
  if (!s) return [];
  const parts = s.match(/[A-Za-z0-9]+|[\u4e00-\u9fff]{2,}/g) || [];
  const bi = [];
  const pure = s.replace(/\s+/g, "");
  for (let i = 0; i < pure.length - 1; i++) {
    const a = pure[i];
    const b = pure[i + 1];
    if (/[\u4e00-\u9fff]/.test(a) && /[\u4e00-\u9fff]/.test(b)) {
      bi.push(a + b);
    }
  }
  return [...new Set([...parts, ...bi])];
}

export function scoreFaq(text, item) {
  let score = 0;
  const raw = String(text || "");
  (item.keywords || []).forEach((kw) => {
    if (kw && raw.includes(kw)) score += 3;
  });
  if (item.title) {
    tokenize(item.title).forEach((t) => {
      if (t.length >= 2 && raw.includes(t)) score += 1;
    });
  }
  if (item.category && raw.includes(item.category)) score += 1;
  tokenize(item.body)
    .slice(0, 12)
    .forEach((t) => {
      if (t.length >= 2 && raw.includes(t)) score += 0.5;
    });
  return score;
}

export function retrieveFaq(query = "", options = {}) {
  const text = String(query || "").trim();
  const topK = options.topK || 3;
  const minScore = options.minScore == null ? 2 : options.minScore;
  if (!text) return [];

  const ranked = faqList
    .map((item) => ({ item, score: scoreFaq(text, item) }))
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id))
    .slice(0, topK);

  return ranked.map(({ item, score }) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    refs: item.refs || [],
    category: item.category,
    score: Math.round(score * 10) / 10,
  }));
}

export function formatFaqContext(hits) {
  if (!hits || !hits.length) return "";
  return hits
    .map(
      (h, i) =>
        `【参考${i + 1}｜${h.title}】\n${h.body}\n依据：${(h.refs || []).join(
          "、"
        )}`
    )
    .join("\n\n");
}

export function citationsFromHits(hits) {
  if (!hits || !hits.length) return [];
  return hits.map((h) => h.title);
}

export function buildFaqReply(hits) {
  if (!hits || !hits.length) return "";
  const top = hits[0];
  const extra = hits
    .slice(1)
    .map((h) => `· ${h.title}`)
    .join("\n");
  let reply = `${top.body}`;
  if (top.refs && top.refs.length) {
    reply += `\n\n参考依据：${top.refs.join("、")}`;
  }
  if (extra) reply += `\n\n相关条目：\n${extra}`;
  reply +=
    "\n\n以上为普法/村务参考，不构成正式法律意见。复杂情况请申请村委调解。";
  return reply;
}

export function sourceLabel(source) {
  if (source === "llm") return "大模型";
  if (source === "rule") return "规则引擎";
  if (source === "rule_fallback") return "规则降级";
  if (source === "rag") return "知识检索";
  if (source === "rag_llm") return "检索+大模型";
  if (source === "cache") return "短缓存";
  return source || "未知";
}

export { faqList };
