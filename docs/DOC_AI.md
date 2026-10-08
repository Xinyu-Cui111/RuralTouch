# 文档 AI 管线（查漏补缺 · 对齐「单据识别 / OCR」）

> 诚实口径：本地开源解析栈，可演示、可评测；不是云厂商票据 OCR 商用引擎。

## 覆盖能力

| 步骤       | 实现                                          | 命令 / 入口                      |
| ---------- | --------------------------------------------- | -------------------------------- |
| 文档整理   | `docs/knowledge/samples/*` 样例 + 手册 corpus | —                                |
| 多格式解析 | txt/md、xlsx、docx、pdf、png/jpg              | `npm run doc:pipeline -- <file>` |
| OCR        | tesseract.js（chi_sim+eng）                   | 对图片跑 pipeline                |
| 字段结构化 | 发票 / 合同规则抽取 + OCR 空格归一            | `npm run doc:eval`               |
| 切分入库   | 手册按 `##` 切分进混合检索                    | `npm run ingest:docs`            |
| H5 演示    | 粘贴文本抽取                                  | `/pages/tools/doc-extract`       |

## 样例

- `invoice-demo.txt` / `.png` / `.pdf`
- `contract-demo.txt`
- `invoice-ledger.xlsx`

## 评测

```bash
npm run doc:samples   # 生成样例
npm run doc:eval      # 字段抽取 3/3
npm run doc:pipeline -- docs/knowledge/samples/invoice-demo.pdf
npm run doc:pipeline -- docs/knowledge/samples/invoice-demo.png
```

## 与 JD 对齐怎么讲

- **有：** PDF/表格/图片进文本 → 字段 JSON；与知识库 RAG 同一作品仓
- **没有：** 版面检测、印章识别、增值税专用发票验真、生产级准确率 SLA
