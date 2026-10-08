import faqList from "@/utils/faq.json";
import indexPack from "@/utils/faq-index.json";
import { embedText, cosine } from "./embed.js";
import { searchVectors } from "./store.js";

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

export function retrieveFaq(query = "", options = {}) {
  const text = String(query || "").trim();
  const topK = options.topK || 3;
  const mode = options.mode || "hybrid";
  const alpha = options.alpha != null ? options.alpha : 0.55;
  const minScore =
    options.minScore != null ? options.minScore : mode === "keyword" ? 2 : 0.22;
  if (!text) return [];

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
  const vecMap = Object.create(null);
  let vecMax = 0;
  docs.forEach((d) => {
    const s = cosine(qVec, d.vector);
    vecMap[d.id] = s;
    if (s > vecMax) vecMax = s;
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

export function scoreFaq(text, item) {
  return scoreKeyword(text, item);
}

export function sourceLabel(source) {
  if (source === "llm") return "大模型";
  if (source === "rule") return "规则引擎";
  if (source === "rule_fallback") return "规则降级";
  if (source === "rag") return "混合检索";
  if (source === "rag_llm") return "检索+大模型";
  if (source === "cache") return "短缓存";
  return source || "未知";
}

export function retrievalMeta() {
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

export { faqList };
