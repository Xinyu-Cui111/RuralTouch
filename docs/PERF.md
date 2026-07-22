# 指尖善治 · 资源与加载策略（对齐竞品）

## 原则

| 竞品做法                       | 本项目落地                                                      |
| ------------------------------ | --------------------------------------------------------------- |
| 图标用字体/矢量组件，单标 <5KB | `rt-icon` 纯 view 绘制，0 图片依赖                              |
| 背景图压到几十 KB + CDN        | `static/lite/*.jpg`（原图压缩后约 12–45KB）叠半透明纱 + 渐变    |
| 视频/大文件不进安装包          | `law.mp4` 在 `assets-source/originals/`，播放走 `LAW_VIDEO_SRC` |
| 首屏先壳后肉                   | Hero/AI 入口 `lazy-load`；CSS 先出氛围                          |

## 目录

- `static/lite/` — **唯一体量受控的上屏图片**
- `assets-source/originals/` — 原始重资源，**不进入构建包**
- `components/rt-icon` — 业务图标唯一来源

## 重新压缩原图

```bash
python scripts/optimize-assets.py
```

原图需放在 `assets-source/originals/`（`banner.png` / `profit.png` / `law.jpg` / `TouMinglogo.png` 等）。

## 配置云端视频

1. 将 `assets-source/originals/law.mp4` 上传到云存储或 HTTPS CDN
2. 在 `config/env.js` 填写：

```js
export const LAW_VIDEO_SRC = "https://你的域名/law.mp4";
// 或 cloud://env-id.xxxx/law.mp4
```

## 体量对照（约）

| 阶段                 | static 体量 |
| -------------------- | ----------- |
| 改造前（含巨型 SVG） | ~145 MB     |
| 过滤后仍含 video     | ~9 MB       |
| **当前 lite 策略**   | **~0.3 MB** |
