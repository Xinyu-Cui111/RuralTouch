# 指尖善治 · UI/产品 V6 落地计划

> 基线备份：`E:\.demo\AIProduct\ruraltouch改ui4-V5完成`  
> 施工：`02RuralTouch` → `E:\RuralTouch-mp`  
> 目标：零黑洞 · AI 挂案默认 · 干部工单可见 · 简洁真收敛 · 办结兑换时序

## 0. 彻查 → 全量落地对照

| #   | 缺口                        | 批次  | 验收                                     | 状态 |
| --- | --------------------------- | ----- | ---------------------------------------- | ---- |
| A   | 催办仅本地，干部不可见      | V6-1  | 催办写入可读标记；干部卡可见「村民催办」 | ✅   |
| B   | 建档后 AI 挂案偏弱          | V6-2  | 成功页主 CTA=本案协办；助手优先挂案会话  | ✅   |
| C   | 下次沟通未结构化展示        | V6-3  | 推进写入 nextContact；详情/干部卡可见    | ✅   |
| D   | SLA 排序但不可见            | V6-4  | 干部卡徽章：超期/高风险/待办天数         | ✅   |
| E   | 无推进话术模板              | V6-5  | 一键话术填入说明                         | ✅   |
| F   | 详情进度缺口语时效          | V6-6  | 进度区展示 oralStatusLine                | ✅   |
| G   | 首页品牌重复、密度高        | V6-7  | hero 收敛；主卡主导                      | ✅   |
| H   | 简洁模式商城/团购未收进更多 | V6-8  | elder 下「更多」折叠；出口文案统一       | ✅   |
| I   | 仪式页提团购抢戏            | V6-9  | CTA 直达兑换商城；去掉团购推销           | ✅   |
| J   | 语音按钮不诚实；triad 残留  | V6-10 | 无语音则隐藏；删 rt-ai-triad；命名清洗   | ✅   |
| K   | 动效克制                    | V6-11 | 主卡入场 + 催办成功反馈；积分币一次跳动  | ✅   |

## 1. 关键文件

- `utils/urge.js` — 村民催办本地队列（演示可读，干部同设备可见）
- `utils/admin-scripts.js` — 推进话术模板
- `utils/case-contact.js` — nextContact 读写
- `pages/village/village.vue` / `submit.vue` / `completeCeremony.vue`
- `pages/disputeDetail/disputeDetail.vue` / `admin/disputes.vue`
- `pages/ai/assistant.vue` / `law/aiLegal.vue` / `profile/profile.vue`
- `components/rt-ai-triad/` 已删除（统一 `rt-ai-taskbar`）
- `components/tab-bar/` / `copy-voice.js` / `moral.vue` / `benefit.vue`

## 2. 验收（开发者工具打开 `E:\RuralTouch-mp`）

1. 清缓存 → 编译
2. 有办件首页主卡显示口语时效；催办后干部台同账号可见标记
3. 建档成功 →「本案协办」进入挂案对话
4. 干部推进填下次沟通 → 详情可见
5. 简洁模式：底栏三路径；商城在「我的 → 更多」
6. 评价后仪式页 → 去兑换进商城

## 3. 进度

| 批次               | 状态 |
| ------------------ | ---- |
| 备份改 ui4-V5 完成 | ✅   |
| V6-1 ～ V6-11      | ✅   |
| 构建同步           | ✅   |
