# Contributing

感谢你的兴趣！欢迎任何形式的贡献：功能、修复、文档或建议。请按下面流程协作。

## 分支与工作流

- 主分支：`main`（保持稳定）
- 功能分支：`feature/描述`（例如 `feature/login-page`）
- 修复分支：`fix/描述`

开发步骤：

1. 从 `main` 拉取最新：

```bash
git checkout main
git pull origin main
```

2. 新建功能分支并开发：

```bash
git checkout -b feature/描述
```

3. 小步提交，写清变更说明：

```bash
git add .
git commit -m "feat(login): 添加手机号登录入口"
```

4. 推送并发起 Pull Request：

```bash
git push origin feature/描述
```

## 提交规范

- 使用简短语义化前缀：`feat`、`fix`、`docs`、`chore` 等
- 范例：`feat(profile): 添加资料编辑功能`

## PR 模板

请在创建 PR 时填写下列信息：

- 关联 issue（如果有）
- 变更说明（简要）
- 如何测试（复现步骤或截图）
- 影响范围（是否破坏兼容）
