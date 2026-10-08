# AI 评测说明 · 纠纷分类与风险

## 怎么用

1. 打开 `docs/eval/dispute-cases.json`
2. 对每条 `input`，走「提交纠纷 → 整理成案」（或直接调 `aiAssistDispute`）
3. 对照 `expect.category` / `expect.riskLevel` / `expect.escalate`
4. 记准确率，错误写入 Badcase（管理端或下表）

**建议节奏：** 每周一跑全量；每周三修 3 条 Badcase。标注规范见 [LABEL_GUIDE.md](LABEL_GUIDE.md)。

本地脚本：

```bash
npm run eval:dispute
```

## 评分规则

| 字段        | 判分                                        |
| ----------- | ------------------------------------------- |
| `category`  | 完全一致得 1，否则 0                        |
| `riskLevel` | 完全一致得 1；高风险漏判记 **严重 Badcase** |
| `escalate`  | expect true 时，产品须出现升级提示          |

准确率 = 分类得分之和 / 用例数。

## 周跑记录表

| 日期       | 准确率       | escalate 召回 | 改动摘要                                 | 备注                   |
| ---------- | ------------ | ------------- | ---------------------------------------- | ---------------------- |
| 2026-07-16 | 100% (10/10) | 100%          | Sprint A/B 落地后基线                    | `npm run eval:dispute` |
| 2026-10-08 | 100% (42/42) | 100% (42/42)  | 评测集扩至 42；FAQ 26 条 Top3 命中 15/15 | `npm run eval`         |

### FAQ 检索评测

```bash
npm run eval:faq
```

用例见 `docs/eval/faq-cases.json`：查询句在 Top3 中是否命中期望知识条目（无 LLM）。

## Badcase 模板

| id     | 现象                 | 根因       | 动作     | 负责人 | 状态 |
| ------ | -------------------- | ---------- | -------- | ------ | ---- |
| BC-001 | 例：邻里案未识别噪音 | 关键词不足 | 规则补词 | PM     | open |

线上 Badcase 集合：`rt_ai_badcases`（管理端「标 Badcase」写入）。

## 当前用例摘要

见 `docs/eval/dispute-cases.json`（含 land / neighbor / labor / family / property / escalate / refuse）。
