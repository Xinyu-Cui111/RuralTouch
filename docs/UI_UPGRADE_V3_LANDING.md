# 指尖善治 · UI/产品 V3 落地计划

> 基线备份：`E:\.demo\AIProduct\ruraltouch改ui1`（V2 完成后冻结，勿改）  
> 上一档备份：`ruraltouch未升ui`  
> 施工目录：`E:\.demo\AIProduct\02RuralTouch` → 同步 `E:\RuralTouch-mp`

---

## 0. 范围对照（全部落地）

| #   | 建议                    | 状态 | 关键落地                                |
| --- | ----------------------- | ---- | --------------------------------------- |
| A   | 详情唯一真相源 / 任务流 | ✅   | 下一步 → 进度 → 案情 →AI→ 材料 → 时间线 |
| B   | 低频辅线弱化 / 大字服务 | ✅   | 首页 2×2 大字入口                       |
| C   | 通知第三态主卡          | ✅   | 无办件+有未读 → 去看通知                |
| D   | AI 结构化卡片           | ✅   | `rt-ai-insight` 接入提交/详情           |
| E   | 来源可追溯 + 降级文案   | ✅   | 组件内来源/仅供参考                     |
| F   | 对话钉本案回流          | ✅   | 上下文条 + CTA                          |
| G   | 老年简洁模式            | ✅   | 个人中心开关 + elder.scss               |
| H   | 大字入口替代四 icon     | ✅   | village svc-grid                        |
| I   | 语音主路径强化          | ✅   | elder 下语音按钮高亮                    |
| J   | 激励兑换价值优先        | ✅   | 可兑提示 + 兑换卡强调                   |
| K   | 干部三队列 + 文案对齐   | ✅   | 待受理/超期/高风险 + tip                |
| L   | 办结评价 → 积分仪式     | ✅   | 评价成功弹窗去积分                      |
| M   | 空状态口语 CTA          | ✅   | 首页/记录等保持口语                     |

---

## 1. 关键文件

- `utils/elder-mode.js` / `styles/elder.scss`
- `components/rt-ai-insight/rt-ai-insight.vue`
- `utils/dispute-workflow.js`
- `pages/village/village.vue` / `submit.vue`
- `pages/disputeDetail/disputeDetail.vue`
- `pages/admin/disputes.vue`
- `pages/profile/profile.vue`
- `pages/moral/moral.vue`
- `pages/ai/assistant.vue` / `pages/law/aiLegal.vue`
- `components/page-hero/page-hero.vue`

---

## 2. 进度

| 批次                   | 状态 |
| ---------------------- | ---- |
| 备份 ruraltouch 改 ui1 | ✅   |
| V3-1 ～ V3-8           | ✅   |
| 构建同步               | ✅   |
