# 媒体资源（H5 Mock · Playwright 真交互）

规格高于「冷启动切页」方案：截图与动图均来自 **真实点击 / 填写 / 滚动**。

| 层  | 目录                             | 用途               |
| --- | -------------------------------- | ------------------ |
| L1  | `hero-*.png` + `walkthrough.gif` | README 首屏        |
| L2  | `flows/`                         | 6 条产品操作流     |
| L3  | `gallery/` + `preview.html`      | 全页目录与交互翻页 |
| 附  | `scroll/`                        | 长页滚动           |

索引：[MANIFEST.md](MANIFEST.md) · 翻页预览：本地打开 [preview.html](preview.html)

## 重采

```bash
npm run dev:h5
# 另开终端
npm run capture:ui
```

CI：Actions → **H5 Screenshots**
