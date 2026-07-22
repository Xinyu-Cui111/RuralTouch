# 大模型接入配置

指尖善治云函数支持 **DeepSeek**（推荐，极低价）和 **通义千问**（阿里云 DashScope，新用户有免费额度）。

未配置 API Key 时，AI 功能自动降级为规则引擎，不影响演示。

---

## 一、DeepSeek（推荐 · 已为本项目创建 Key「ruraltouch」）

1. Key 已写入 **`cloudfunctions/rt-api/secrets.local.js`**（已加入 `.gitignore`，不会提交 Git）
2. 重新部署云函数即可生效：

```
右键 cloudfunctions/rt-api → 上传并部署：云端安装依赖
```

3. 重新部署云函数后，可在云开发控制台 → 云函数 → `rt-api` → 测试，输入：

```json
{ "action": "aiStatus", "data": {} }
```

返回 `llmEnabled: true` 表示 Key 已生效。

4. 或在云开发控制台配置环境变量（二选一，控制台优先级更高）：

| 变量名         | 值                                |
| -------------- | --------------------------------- |
| `LLM_PROVIDER` | `deepseek`                        |
| `LLM_API_KEY`  | 你的 sk-xxx                       |
| `LLM_MODEL`    | `deepseek-chat`（可选，默认即此） |

> **安全提示：** 勿将 API Key 提交到 GitHub。若 Key 已泄露，请到 DeepSeek 控制台轮换。

**费用参考：** deepseek-chat 约 ¥0.001/千 tokens，一次纠纷分析约 ¥0.001–0.003。

---

## 二、通义千问（DashScope）

1. 注册 [阿里云 DashScope](https://dashscope.aliyun.com/)
2. 开通模型服务，获取 API Key
3. 环境变量：

| 变量名         | 值                   |
| -------------- | -------------------- |
| `LLM_PROVIDER` | `tongyi`             |
| `LLM_API_KEY`  | `sk-xxxxxxxx`        |
| `LLM_MODEL`    | `qwen-turbo`（可选） |

---

## 三、管理员配置

管理后台（纠纷状态、积分审核）需要管理员权限，任选一种方式：

### 方式 A：环境变量（推荐）

| 变量名          | 值                        |
| --------------- | ------------------------- |
| `ADMIN_OPENIDS` | 你的 OpenID,另一个 OpenID |

OpenID 可在云函数日志或 `rt_users` 集合中查看。

### 方式 B：数据库手动设置

云开发控制台 → 数据库 → `rt_users` → 找到你的用户 → 添加字段 `isAdmin: true`

---

## 四、部署步骤

1. 配置环境变量后，右键 `cloudfunctions/rt-api` → **上传并部署：云端安装依赖**
2. 重新编译小程序
3. 测试：
   - 提交纠纷 → AI 智能分析（返回 `source: "llm"` 表示大模型生效）
   - 法治 → AI 普法顾问
   - 个人中心 → 管理后台（需管理员权限）

---

## 五、云存储（证据上传）

1. 云开发控制台 → 存储 → 确认已开通
2. 默认上传路径：`evidence/时间戳-序号.jpg`
3. 无需额外配置，小程序端直接 `wx.cloud.uploadFile`

---

## 六、故障排查

| 现象                            | 原因                     | 解决                          |
| ------------------------------- | ------------------------ | ----------------------------- |
| `未知操作: aiAssistDispute`     | 云函数未重新部署         | 上传并部署 rt-api             |
| AI 返回规则结果 `source: rule`  | 未配 API Key 或 Key 无效 | 检查环境变量                  |
| AI 返回 `source: rule_fallback` | 大模型调用失败           | 查看云函数日志                |
| 管理后台无权限                  | 非管理员                 | 配置 ADMIN_OPENIDS 或 isAdmin |
| 证据上传失败                    | 云存储未开通             | 云开发控制台开通存储          |
