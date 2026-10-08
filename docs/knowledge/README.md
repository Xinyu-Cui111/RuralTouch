# 场景知识表（轻量检索）

- 数据：`faq.json`（与 `cloudfunctions/rt-api/faq.json`、`utils/faq.json` 同步）
- 检索：`knowledge.js` 关键词 + 标题分词打分，返回 TopK
- **不是**向量库 / Embedding RAG；面试话术用「可解释的场景知识表检索」

更新 `faq.json` 后请同步复制到上述三处，并跑：

```bash
npm run eval:faq
```
