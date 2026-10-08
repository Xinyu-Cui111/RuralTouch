/**
 * 混合检索：向量余弦 × α + 关键词分 × (1-α)
 * 自研薄编排，不引入 LangChain。
 */
const faqList = require("../faq.json");
const indexPack = require("../faq-index.json");
const { embedText, cosine, docText, buildIdf } = require("./embed");
const { searchVectors } = require("./store");

function tokenize(text) {
  const s = String(text || "").trim();
  if (!s) return [];
  const parts = s.match(/[A-Za-z0-9]+|[\u4e00-\u9fff]{2,}/g) || [];
  const bi = [];
  const pure = s.replace(/\s+/g, "");
  for (let i = 0; i < pure.length - 1; i++) {
    const a = pure[i];
    const b = pure[i + 1];
    if (/[\u4e00-\u9fff]/.test(a) && /[\u4e00-\u9fff]/.test(b)) bi.push(a + b);
  }
  return [...new Set([...parts, ...bi])];
}

function scoreKeyword(text, item) {
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

function byId() {
  const m = Object.create(null);
  faqList.forEach((item) => {
    m[item.id] = item;
  });
  return m;
}

/**
 * @param {string} query
 * @param {{ topK?: number, minScore?: number, alpha?: number, mode?: 'hybrid'|'vector'|'keyword' }} options
 */
function retrieveFaq(query, options) {
  options = options || {};
  const text = String(query || "").trim();
  const topK = options.topK || 3;
  const mode = options.mode || "hybrid";
  const alpha = options.alpha != null ? options.alpha : 0.55;
  // hybrid 融合分阈值；纯关键词沿用旧阈值 2
  const minScore =
    options.minScore != null ? options.minScore : mode === "keyword" ? 2 : 0.22;
  if (!text) return [];

  const map = byId();
  const idf = indexPack.idf || null;
  const docs = indexPack.docs || [];

  const kwRaw = {};
  let kwMax = 0;
  faqList.forEach((item) => {
    const s = scoreKeyword(text, item);
    kwRaw[item.id] = s;
    if (s > kwMax) kwMax = s;
  });

  const qVec = embedText(text, idf);
  const vecHits = searchVectors(qVec, docs, Math.max(topK * 4, 12));
  const vecMap = Object.create(null);
  let vecMax = 0;
  vecHits.forEach((h) => {
    vecMap[h.id] = h.vectorScore;
    if (h.vectorScore > vecMax) vecMax = h.vectorScore;
  });
  // 未进粗排的也算一次余弦，保证融合完整（N 很小）
  docs.forEach((d) => {
    if (vecMap[d.id] == null) {
      const s = cosine(qVec, d.vector);
      vecMap[d.id] = s;
      if (s > vecMax) vecMax = s;
    }
  });

  const ranked = faqList
    .map((item) => {
      const kw = kwRaw[item.id] || 0;
      const vs = vecMap[item.id] || 0;
      const kwN = kwMax > 0 ? kw / kwMax : 0;
      const vN = vecMax > 0 ? vs / vecMax : 0;
      let score;
      let method;
      if (mode === "keyword") {
        score = kw;
        method = "keyword";
      } else if (mode === "vector") {
        score = vs;
        method = "vector";
      } else {
        score = alpha * vN + (1 - alpha) * kwN;
        method = "hybrid";
      }
      return {
        item,
        score,
        vectorScore: Math.round(vs * 1000) / 1000,
        keywordScore: Math.round(kw * 10) / 10,
        method,
      };
    })
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id))
    .slice(0, topK);

  return ranked.map(({ item, score, vectorScore, keywordScore, method }) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    refs: item.refs || [],
    category: item.category,
    score: Math.round(score * 1000) / 1000,
    vectorScore,
    keywordScore,
    method,
  }));
}

function formatFaqContext(hits) {
  if (!hits || !hits.length) return "";
  return hits
    .map(
      (h, i) =>
        "【参考" +
        (i + 1) +
        "｜" +
        h.title +
        "】\n" +
        h.body +
        "\n依据：" +
        (h.refs || []).join("、")
    )
    .join("\n\n");
}

function citationsFromHits(hits) {
  if (!hits || !hits.length) return [];
  return hits.map((h) => h.title);
}

function buildFaqReply(hits) {
  if (!hits || !hits.length) return "";
  const top = hits[0];
  const extra = hits
    .slice(1)
    .map((h) => "· " + h.title)
    .join("\n");
  let reply = top.body;
  if (top.refs && top.refs.length) {
    reply += "\n\n参考依据：" + top.refs.join("、");
  }
  if (extra) reply += "\n\n相关条目：\n" + extra;
  reply +=
    "\n\n以上为普法/村务参考，不构成正式法律意见。复杂情况请申请村委调解。";
  return reply;
}

function scoreFaq(text, item) {
  return scoreKeyword(text, item);
}

function retrievalMeta() {
  return {
    engine: "hybrid",
    vector: {
      dim: indexPack.dim || 384,
      method: indexPack.method || "hashing-tfidf",
      docs: (indexPack.docs || []).length,
    },
    note: "本地向量索引 + 关键词融合；非托管向量库、非 LangChain",
  };
}

module.exports = {
  faqList,
  retrieveFaq,
  formatFaqContext,
  citationsFromHits,
  buildFaqReply,
  scoreFaq,
  retrievalMeta,
  docText,
  buildIdf,
  embedText,
};
