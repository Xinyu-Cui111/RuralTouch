/**
 * 向量索引：预计算 FAQ 向量 + 查询余弦 TopK
 */
const { cosine, embedText } = require("./embed");

function searchVectors(queryVec, indexDocs, topK) {
  const scored = (indexDocs || []).map((d) => ({
    id: d.id,
    vectorScore: cosine(queryVec, d.vector),
  }));
  scored.sort((a, b) => b.vectorScore - a.vectorScore);
  return scored.slice(0, topK);
}

function embedQuery(text, idf) {
  return embedText(text, idf);
}

module.exports = { searchVectors, embedQuery };
