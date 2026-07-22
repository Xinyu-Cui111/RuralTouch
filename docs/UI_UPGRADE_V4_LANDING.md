# 指尖善治 · UI/产品 V4 落地计划

> 基线备份：`E:\.demo\AIProduct\ruraltouch改ui2-V3完成`（V3 完成后冻结）  
> 版本说明：见 `docs/VERSIONS.md`  
> 组件契约：见 `docs/COMPONENT_CONTRACT_V4.md`  
> 施工：`02RuralTouch` → `E:\RuralTouch-mp`  
> 目标：默认路径更短 · AI 三卡协议 · 老年默认可选 · 干部 → 村民感知闭环

---

## 0. 范围对照（上一轮 V4 建议 → 全部落地）

| #   | 建议                                | 批次 | 验收                                   | 状态 |
| --- | ----------------------------------- | ---- | -------------------------------------- | ---- |
| A   | 有办件则启动/登录后直达详情         | V4-1 | 登录后有进行中办件 → 打开该详情        | ✅   |
| B   | Tab 收敛为 办事/服务/我的           | V4-2 | 底栏 3 Tab；法治/激励/团购进服务大厅   | ✅   |
| C   | 老年模式首次引导（可选默认开）      | V4-3 | 首次弹窗二选一；开则全局 elder         | ✅   |
| D   | AI 三卡：结论/依据/去办事           | V4-4 | 对话与详情共用 `rt-ai-triad`           | ✅   |
| E   | 材料清单字段化 + 说事页语音主入口   | V4-5 | 勾选材料写入草稿；提交页大语音钮       | ✅   |
| F   | 信任底栏（人工+紧急）+ 文案人设     | V4-6 | `rt-trust-bar`；文案库 `copy-voice.js` | ✅   |
| G   | 干部今日必办 + 推进后村民可读通知   | V4-7 | 工作台「今日」队列；首页可见推进提示   | ✅   |
| H   | 办结 → 评价 → 积分仪式页            | V4-8 | `completeCeremony` 单页动线            | ✅   |
| I   | 组件契约（主任务/下一步/AI/空状态） | V4-9 | 文档 + 关键页只用标准组件              | ✅   |

---

## 1. 关键落地文件

- `utils/boot-route.js` — 登录后路由（直达详情）
- `utils/elder-mode.js` — 首次引导
- `utils/copy-voice.js` — 统一口语文案
- `utils/case-push.js` — 干部推进 → 村民站内提示
- `utils/dispute-workflow.js` — `isTodayMustDo`
- `utils/chat-handoff.js` — 三卡字段归一化
- `components/rt-ai-triad/` — 三卡协议
- `components/rt-trust-bar/` — 信任底栏
- `pages/benefit/benefit.vue` — 服务大厅 Tab
- `pages/village/completeCeremony.vue` — 仪式页
- `components/tab-bar/bar.vue` — 三 Tab
- 接线：`auth` / `onboarding` / `village` / `submit` / `assistant` / `aiLegal` / `admin/disputes` / `disputeDetail`

---

## 2. 进度

| 批次                           | 状态 |
| ------------------------------ | ---- |
| 备份 ruraltouch 改 ui2-V3 完成 | ✅   |
| 本文档 + VERSIONS + 组件契约   | ✅   |
| V4-1 ～ V4-9                   | ✅   |
| 构建同步 RuralTouch-mp         | ✅   |
