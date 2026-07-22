/**

 * 云开发环境配置

 * 在微信开发者工具 → 云开发 → 设置 中复制环境 ID，替换下方占位符

 */

export const CLOUD_ENV_ID = "cloud1-d6gqqruqy1d721eb0";

/** H5 演示模式：无云环境时使用本地 Mock 数据 */

export const USE_MOCK_ON_H5 = true;

/**

 * 是否启用微信同声传译语音输入。

 * 默认 false：避免未授权插件 wx069ba97219f66d99 导致启动报错。

 * 公众平台添加插件并审核通过后，改为 true，并在 manifest.json mp-weixin.plugins 声明 WechatSI。

 */

export const ENABLE_WECHAT_SI = false;

/**

 * 普法视频（与常见小程序一致：HTTPS / CDN，不靠主包塞大 mp4）

 *

 * 优先级：LAW_VIDEO_HTTPS → 云函数换链 → cloud:// → 包内兜底

 *

 * 正式上线建议：换成自己的 CDN / 云存储永久域名；

 * 并在公众平台把该域名加入「downloadFile 合法域名」。

 *

 * video.poster 只能是网络地址；本地封面请用页面里的 <image>。

 */

export const LAW_VIDEO_SRC = "/static/law-videos/law.mp4";

/**

 * 固定 HTTPS（最稳，模拟器/真机都能播）。

 * 当前用仓库公开地址做演示；有自有 CDN 后替换即可。

 */

export const LAW_VIDEO_HTTPS =
  "https://cdn.jsdelivr.net/gh/Xinyu-Cui111/RuralTouch@main/static/law-videos/law.mp4";

/** 是否启用云视频降级（HTTPS 失败时再试） */

export const USE_LAW_VIDEO_CLOUD = true;

/** 云存储 fileID（需在云开发→存储上传同路径文件） */

export const LAW_VIDEO_CLOUD_FILE_ID =
  "cloud://cloud1-d6gqqruqy1d721eb0.636c-cloud1-d6gqqruqy1d721eb0-1435593477/static/law-videos/law.mp4";

/** 村委公开联系电话（演示号，上线请改真实号码） */

export const VILLAGE_CONTACT_PHONE = "010-88886666";

/** 紧急求助提示 */

export const EMERGENCY_TIP = "人身安全请先拨打 110 / 120";

/**

 * 订阅消息模板 ID（公众平台 → 功能 → 订阅消息）

 * 配好后建档成功会弹出授权；留空则仅演示提示，不调起系统弹窗。

 */

export const SUBSCRIBE_TMPL_IDS = {
  /** 调解进度提醒（例：受理/办理/办结） */

  disputeProgress: "",
};
