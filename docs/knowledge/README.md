# 场景知识表 · 混合检索

- `faq.json`：条目正文（标题 / 关键词 / 正文 / 法律名称级依据）
- `faq-index.json`：预计算 **384 维**本地向量（字 bigram + 词特征哈希 × IDF，L2 归一化）
- 运行时：`向量余弦 × 0.55 + 关键词归一化分 × 0.45` → Top3 + 引用 chips

## 重建索引

```bash
npm run build:faq-index
npm run eval:faq
```

## 诚实口径（简历 / 面试）

- **是**：自研混合检索；本地向量索引；可评测 Top3
- **不是**：托管向量数据库（Milvus/Pinecone）、不是 LangChain 套壳、不是假「叫 RAG」的纯关键词改名

云函数与 H5 Mock 共用同一套算法（`cloudfunctions/rt-api/rag/*` ↔ `utils/rag/*`）。
