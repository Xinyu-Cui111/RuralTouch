const faqList = require("./faq.json");

function scoreFaq(text, item) {
  let score = 0;
  const lower = text.toLowerCase();
  (item.keywords || []).forEach((kw) => {
    if (text.includes(kw)) score += 2;
  });
  if (item.title && text.includes(item.title.slice(0, 4))) score += 1;
  if (item.category && lower.includes(item.category)) score += 1;
  return score;
}

function retrieveFaq(query = "", options = {}) {
  const text = String(query || "").trim();
  const topK = options.topK || 3;
  const minScore = options.minScore == null ? 2 : options.minScore;
  if (!text) return [];

  const ranked = faqList
    .map((item) => ({ item, score: scoreFaq(text, item) }))
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return ranked.map(({ item, score }) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    refs: item.refs || [],
    category: item.category,
    score,
  }));
}

function formatFaqContext(hits) {
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

function citationsFromHits(hits) {
  if (!hits || !hits.length) return [];
  return hits.map((h) => h.title);
}

module.exports = {
  faqList,
  retrieveFaq,
  formatFaqContext,
  citationsFromHits,
};
