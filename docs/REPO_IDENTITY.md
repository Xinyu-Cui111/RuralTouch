# 仓库身份与展示说明

## 贡献者为什么曾出现三个

| 显示名           | 原因                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| **Xinyu-Cui111** | 用 GitHub noreply 邮箱提交的 commit                                                                   |
| **hexinying**    | 早期 commit 作者是 `cuixinyu <1368412172@qq.com>`，该邮箱绑在 hexinying 账号上，GitHub 归到另一个头像 |
| **cursoragent**  | Cursor 自动在 commit message 里加了 `Co-authored-by: Cursor <cursoragent@cursor.com>`                 |

已对 `main` 做历史改写：作者/提交者统一为 `Xinyu-Cui111 <Xinyu-Cui111@users.noreply.github.com>`，并去掉 Cursor 的 Co-authored-by，已 force-push。

本地已设置：

- `git config user.name / user.email`（仅本仓库）→ Xinyu-Cui111
- `.mailmap`
- `.git/hooks/prepare-commit-msg`（提交前删掉 Cursor 署名行）

## 你需要再做的两步

1. **关掉 Cursor 自动署名**  
   Cursor Settings → Agents → **Attribution** → 关闭。  
   否则以后再 commit，贡献者里可能又冒出 cursoragent。

2. **刷新 GitHub 贡献者列表**  
   打开 https://github.com/Xinyu-Cui111/RuralTouch ，硬刷新；若仍显示旧三人，等几小时（GitHub 有缓存）。  
   确认只剩 **Xinyu-Cui111**。

建议：QQ 邮箱只保留在 Xinyu-Cui111 账号的 Verified emails 里，或继续只用 noreply 提交，避免再映射到 hexinying。

## 仓库 About 建议（网页上手改）

- Description：`基层纠纷调解小程序：说事建档 → 村委推进（uni-app + 微信云开发）`
- Topics：`uni-app` `wechat-miniprogram` `vue3` `rural-governance` `llm`
- Website：可留空，或日后放演示录屏链接

README 已改为产品向（问题 → 截图 → 功能 → 快速开始），弱化求职/面试话术。
