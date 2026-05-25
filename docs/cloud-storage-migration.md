# 云存储迁移清单

这个清单用于把当前项目里的静态资源按顺序迁移到微信开发者工具的云存储中。建议先上传资源，再把代码里的 `/static/...` 路径替换成云存储返回的地址。

## 1. 先上传的基础资源

这些资源在多个页面里复用，优先上传：

- `static/banner/logo.svg`
- `static/banner/profit.png`
- `static/banner/banner.png`
- `static/banner/law.jpg`
- `static/icons/search.svg`
- `static/icons/bell.svg`
- `static/icons/user.svg`
- `static/icons/arrow-right.svg`
- `static/icons/lawi.svg`
- `static/icons/villagei.svg`
- `static/icons/morali.svg`
- `static/icons/groupi.svg`

## 2. 第二批上传的页面素材

这些资源主要服务于业务页面展示：

- `static/law-icons/rules.svg`
- `static/law-icons/stories.svg`
- `static/law-icons/search.svg`
- `static/law-icons/eye.svg`
- `static/law-videos/law.mp4`
- `static/village-icons/laba.svg`
- `static/village-icons/xinxi.svg`
- `static/village-icons/che.svg`
- `static/village-icons/ling.svg`
- `static/village-icons/touxiang.jpg`

## 3. 第三批上传的模块素材

这些是各业务模块的专项素材：

- `static/moral-icons/banshou.svg`
- `static/moral-icons/chuizi.svg`
- `static/moral-icons/cun.svg`
- `static/moral-icons/fangzi.svg`
- `static/moral-icons/mi.svg`
- `static/moral-icons/miao.svg`
- `static/moral-icons/sanjiao.svg`
- `static/moral-icons/shui.svg`
- `static/moral-icons/woshou.svg`
- `static/group-icons/fuzhuang.svg`
- `static/group-icons/fuzhuangxiemao.jpg`
- `static/group-icons/nongchanpin.jpg`
- `static/group-icons/nongchanpin.svg`
- `static/group-icons/nongzi.svg`
- `static/group-icons/nongzinongju.jpg`
- `static/group-icons/shenghuo.svg`
- `static/group-icons/shenghuoyongpin.jpg`
- `static/products/heidoufen.jpg`
- `static/products/huagaofen.jpg`
- `static/products/sangshen.jpg`
- `static/products/sanwenyu.jpg`

## 4. 上传后要做的事

1. 在微信开发者工具云存储中上传对应文件。
2. 记录每个文件返回的云 URL。
3. 把代码里所有 `/static/...` 替换成对应云 URL。
4. 重新预览和构建，确认图片、视频、图标都能正常加载。
5. 如果你已经把文件按 `static/...` 的目录结构上传，可以直接打开 `pages/tools/cloud-export`，输入云环境 ID 批量导出临时 URL。

## 5. 注意

- 如果某些资源只在本地开发阶段使用，也可以暂时保留在 `static/`。
- 视频文件通常较大，建议优先确认网络访问和缓存策略。
