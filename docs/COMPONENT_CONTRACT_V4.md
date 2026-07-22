# 指尖善治 · 组件契约（V4）

关键页优先复用下列标准块，避免再发明临时卡片。

| 契约 | 组件 | 用途 |

|------|------|------|

| 主任务卡 | 首页 `primary-card` / `page-hero` | 一件事：继续办 / 看通知 / 去说事 |

| 下一步 | 详情 `next-card` | 告诉用户此刻该点哪里 |

| AI 三卡 | `rt-ai-taskbar`（V5 起统一协办任务条；旧 `rt-ai-triad` 已退役） | 结论 + 主下一步 |

| AI 案情卡 | `rt-ai-insight` | 建档摘要、风险、材料清单 |

| 信任底栏 | `rt-trust-bar` | 联系村委 + 110/120 |

| 空状态 | `empty-state` | 无数据 / 失败重试 |

| 进度 | `rt-progress-steps` | 受理 → 办理 → 办结 |

| 分区标题 | `rt-section` | 列表区标题 |

文案人设统一走 `utils/copy-voice.js`。
