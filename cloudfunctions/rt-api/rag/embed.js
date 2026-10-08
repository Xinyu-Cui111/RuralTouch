/**
 * 本地稠密向量：字 bigram + 词特征哈希 → 固定维 TF-IDF 风格向量（L2 归一化）。
 * 不依赖外部 Embedding API / LangChain；语料小、可离线、可复现。
 */
const DIM = 384;

function fnv1a(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function tokenizeFeatures(text) {
  const s = String(text || "")
    .trim()
    .toLowerCase();
  if (!s) return [];
  const feats = [];
  const parts = s.match(/[a-z0-9]+|[\u4e00-\u9fff]{2,}/g) || [];
  parts.forEach((p) => feats.push("w:" + p));
  const pure = s.replace(/\s+/g, "");
  for (let i = 0; i < pure.length - 1; i++) {
    const a = pure[i];
    const b = pure[i + 1];
    if (/[\u4e00-\u9fff]/.test(a) && /[\u4e00-\u9fff]/.test(b)) {
      feats.push("bg:" + a + b);
    }
  }
  return feats;
}

function hashBucket(feat) {
  return fnv1a(feat) % DIM;
}

function termFreq(text) {
  const tf = Object.create(null);
  tokenizeFeatures(text).forEach((f) => {
    tf[f] = (tf[f] || 0) + 1;
  });
  return tf;
}

function buildIdf(documents) {
  const df = Object.create(null);
  const n = documents.length || 1;
  documents.forEach((doc) => {
    const seen = new Set(Object.keys(termFreq(doc)));
    seen.forEach((f) => {
      df[f] = (df[f] || 0) + 1;
    });
  });
  const idf = Object.create(null);
  Object.keys(df).forEach((f) => {
    idf[f] = Math.log((n + 1) / (df[f] + 1)) + 1;
  });
  return idf;
}

function embedText(text, idf) {
  const tf = termFreq(text);
  const vec = new Array(DIM).fill(0);
  const keys = Object.keys(tf);
  if (!keys.length) return vec;
  keys.forEach((f) => {
    const idfW = idf && idf[f] != null ? idf[f] : 1;
    const w = idfW * (1 + Math.log(tf[f]));
    vec[hashBucket(f)] += w;
  });
  let norm = 0;
  for (let i = 0; i < DIM; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < DIM; i++)
    vec[i] = Math.round((vec[i] / norm) * 1e6) / 1e6;
  return vec;
}

function cosine(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

function docText(item) {
  return [
    item.title || "",
    (item.keywords || []).join(" "),
    item.category || "",
    item.body || "",
    (item.refs || []).join(" "),
  ].join("\n");
}

module.exports = {
  DIM,
  tokenizeFeatures,
  buildIdf,
  embedText,
  cosine,
  docText,
  termFreq,
};
