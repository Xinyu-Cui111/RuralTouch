# 云数据库权限配置

在云开发控制台 → 数据库 → 各集合 → 权限设置，开发期可使用以下配置。

## 推荐权限（开发期）

| 集合               | 权限                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| `rt_notices`       | 所有用户可读，仅管理端可写                                              |
| `rt_mall_items`    | 所有用户可读                                                            |
| `rt_products`      | 所有用户可读                                                            |
| `rt_users`         | 仅创建者可读写                                                          |
| `rt_disputes`      | 所有用户可读，仅创建者可写                                              |
| `rt_feedbacks`     | 仅创建者可读写                                                          |
| `rt_moral_records` | 仅创建者可读写                                                          |
| `rt_meta`          | 仅管理端可读写                                                          |
| `rt_ai_events`     | 仅云函数可写（AI 调用指标：action/source/latency/escalate/titleEdited） |
| `rt_ai_badcases`   | 仅云函数可写（管理端 Badcase：phenomenon/rootCause/action）             |

## 生产环境（推荐）

所有集合设置为 **仅云函数可写**，客户端只通过 `rt-api` 云函数访问，避免数据被篡改。

步骤：

1. 各集合权限 → 自定义安全规则
2. 读：`false`（或仅特定字段通过云函数返回）
3. 写：`false`
4. 所有读写走 `cloudfunctions/rt-api`

## 索引建议

| 集合               | 字段          | 排序         |
| ------------------ | ------------- | ------------ |
| `rt_disputes`      | `createTime`  | 降序         |
| `rt_notices`       | `publishTime` | 降序         |
| `rt_moral_records` | `createTime`  | 降序         |
| `rt_users`         | `openid`      | 升序（唯一） |
