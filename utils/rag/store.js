import { cosine } from "./embed.js";

export function searchVectors(queryVec, indexDocs, topK) {
  const scored = (indexDocs || []).map((d) => ({
    id: d.id,
    vectorScore: cosine(queryVec, d.vector),
  }));
  scored.sort((a, b) => b.vectorScore - a.vectorScore);
  return scored.slice(0, topK);
}
