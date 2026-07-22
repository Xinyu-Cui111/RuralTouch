# 指尖善治 · UI/产品体验升级 V2 落地计划

> 基线备份：`E:\.demo\AIProduct\ruraltouch未升ui`（本轮升级前完整冻结，勿改）  
> 施工目录：`E:\.demo\AIProduct\02RuralTouch`  
> 产物同步：`E:\RuralTouch-mp`  
> 原则：大厂级信息架构 + 优秀 AI PM 办事流 + 适老化可读 + 色义清晰

---

## 0. 范围对照（上一轮建议 → 本计划全部落地）

| #   | 建议                             | 本计划批次 | 验收标准                                                    |
| --- | -------------------------------- | ---------- | ----------------------------------------------------------- |
| A   | 首页任务化（有/无待办换首屏）    | P1         | 有待办时首屏是「继续办」；无待办时首屏是「我要说事」        |
| B   | 色板收束（金仅积分；模块语义色） | P2         | 议事朱砂 / 法治藏青 / 积分麦金 / 团购橄榄；列表默认中性纸面 |
| C   | 二级页 Hero 减负                 | P3         | 二级页可用 `compact` 顶栏；Tab 首页保留氛围                 |
| D   | 适老化（字号/按钮/对比）         | P4         | 正文 ≥30、标题 ≥36、主钮 ≥88rpx；弱对比标签加深             |
| E   | AI 嵌入办事流                    | P5         | 提交页可勾选要点带入；详情页「下一步」行动卡                |
| F   | 个人中心瘦身                     | P6         | 待办置顶；次要分组可折叠；减少功能墙                        |
| G   | 状态机补齐                       | P7         | 空/载/错/成功闭环文案与 CTA 齐全                            |
| H   | 动效克制                         | P8         | 无持续 3D/强闪；仅按压与进度反馈                            |

---

## 1. 批次与文件清单

### P1 · 首页任务化

- `pages/village/village.vue`
- 逻辑：`handlingCount > 0` → 展示「进行中办件」主卡 + 次级说事入口；否则「我要说事」主卡
- 通知 ticker 保留但降视觉权重
- 常用服务保留，不抢主 CTA

### P2 · 色板收束

- `styles/theme.scss`：补充语义 token 注释与列表默认 tone
- `pages/village/*`、`pages/law/*`、`pages/group/*`、`pages/profile/*`：去掉滥用 `tone="gold"`
- `pages/moral/*`：保留金作为荣誉主色
- `components/rt-card`、`rt-cell`、`rt-icon`：按模块 tone 调用

### P3 · Hero / 顶栏

- `components/page-hero/page-hero.vue`：新增 `compact`（无大图/弱 orb，仅品牌+标题）
- 二级页：`submit`、`records`、`notice`、`feedback`、`orders`、`declare`、`mall`、协议等改 compact 或去掉重 Hero
- Tab 四首页保留氛围图，减弱 orb

### P4 · 适老化

- `theme.scss`：上调 `$rt-type-body`→30、`$rt-type-title`→36、`$rt-type-caption`→26
- 主按钮 mixin 最小高度 88rpx
- 弱灰文案色加深（`$rt-text-muted`）
- 关键案扫一遍口语化关键 CTA（首页/空状态）

### P5 · AI 嵌入

- `pages/village/submit.vue`：AI 结果 → 可勾选要点清单 → 一键写入描述/标题
- `pages/disputeDetail/disputeDetail.vue`：进度旁「下一步」卡（催办/补材料/评价/问 AI）
- 保留免责声明与失败重试

### P6 · 个人中心

- `pages/profile/profile.vue`
- 顺序：身份 → 待办条 → 数字快捷 → 最近办件 →（折叠）AI / 记录 / 干部 / 帮助
- 默认展开「最近办件」；其余用折叠头

### P7 · 状态机

- 各列表页统一：skeleton / error+retry / empty+主 CTA / 成功后引导
- 办结成功路径：评价 + 积分入口提示（详情已有则补文案闭环）

### P8 · 动效

- 确认 moral 金币无翻转 3D
- 全局禁止 `preserve-3d` / 持续 `rotateY`
- 列表 hover 仅 opacity，不做 scale 闪动

### P9 · 构建验收

- `npm run build:mp-weixin` → sync `E:\RuralTouch-mp`
- 对照本文 §0 表格逐项勾选

---

## 2. 不做 / 冻结

- 不改云函数业务协议（除非 AI 卡片需要已有字段）
- 不改 `ruraltouch未升ui` 备份目录
- 不新增大体积图片 / SVG
- 不引入新 UI 框架

---

## 3. 执行顺序（本会话）

1. 写本文档 ✅
2. P4 地基（theme 字号/对比）→ P3 Hero compact → P2 色调用规范
3. P1 首页任务化
4. P5 AI 嵌入
5. P6 个人中心
6. P7 / P8 扫尾
7. P9 构建同步

---

## 4. 进度记录

| 批次                    | 状态 | 备注                                    |
| ----------------------- | ---- | --------------------------------------- |
| 备份 ruraltouch 未升 ui | ✅   | 2026-07-21                              |
| 本文档                  | ✅   |                                         |
| P4 theme                | ✅   | 字号/对比/朱砂主钮                      |
| P3 hero                 | ✅   | compact + Tab 减弱 orb                  |
| P2 color                | ✅   | 金仅 moral/wallet                       |
| P1 home                 | ✅   | 有/无待办首屏                           |
| P5 AI                   | ✅   | 提交勾选 + 详情下一步 + 对话多 CTA/底栏 |
| P6 profile              | ✅   | compact + 折叠分组                      |
| P7 states               | ✅   | 首页/团购/记录/建档成功闭环             |
| P8 motion               | ✅   | 无 3D 翻转残留                          |
| P9 build                | ✅   | 同步 RuralTouch-mp                      |
