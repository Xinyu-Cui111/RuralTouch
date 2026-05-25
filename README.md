# RuralTouch / 指尖善治

指尖善治（RuralTouch）是一款基于 uni-app + Vue 3 的智慧村务多端应用，支持微信小程序与 H5，包含村务通知、村民议事、纠纷调解、法治服务、道德银行和惠民团购等功能。

## 主要功能

- 村务通知与公告
- 在线议事与调解（提交纠纷、查看调解记录）
- 法治服务与法治视频
- 道德银行与积分管理
- 惠民团购模块

## 本地运行

安装依赖：

```bash
npm install
```

开发（H5）：

```bash
npm run dev:h5
```

开发（微信小程序）：

```bash
npm run dev:mp-weixin
```

构建（H5）：

```bash
npm run build:h5
```

构建（微信小程序）：

```bash
npm run build:mp-weixin
```

## 目录结构（摘要）

- `pages/` 页面
- `components/` 可复用组件
- `static/` 静态资源（图片、视频等）
- `scripts/` 构建脚本

## 贡献与开发流程

本项目遵循分支开发流程：在 `main` 之外创建 `feature/*` 或 `fix/*` 分支，完成后提交 PR 合并。详见 `CONTRIBUTING.md`。

## 联系方式

如需帮助，请在仓库 Issues 中提问，或联系项目维护人。
