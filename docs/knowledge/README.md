# 场景知识库 · 混合检索

## 语料从哪来

1. **FAQ 条目**（`faq.json`）：短问答，适合办事口径
2. **业务手册切分块**（`corpus/*.md` → `ingest-docs.js`）：按 `##` 切分后入库，对齐「文档整理 → 内容切分 → 向量检索」

## 检索怎么做

- 预计算 **384 维**本地向量索引（`faq-index.json`）
- 运行时：向量余弦 ×0.55 + 关键词归一化 ×0.45 → Top3 + 引用
- 自研薄层（`rag/*`），非 LangChain、非托管向量库

## 常用命令

```bash
npm run ingest:docs      # 切分手册并重建索引
npm run build:faq-index  # 仅重建索引
npm run eval:faq         # 检索回归
npm run demo:extract     # 单据纯文本字段结构化（非 OCR）
```

## 诚实口径

| 有                                                  | 没有（可学）                                 |
| --------------------------------------------------- | -------------------------------------------- |
| 手册切分入库、向量+关键词、引用、评测、Badcase 迭代 | 图片/PDF OCR、发票版面识别、企业级向量数据库 |

## 单据 / OCR

见 [DOC_AI.md](../DOC_AI.md)：PDF / 图片 OCR / Excel → 字段结构化（pm run doc:pipeline / doc:eval）。
