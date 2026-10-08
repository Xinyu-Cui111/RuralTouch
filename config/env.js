/**

 * 云开发环境配置

 * AppID：wx2dd871f53a658116

 * 云环境：cloud1-d3gi68c7da560e902

 */

export const CLOUD_ENV_ID = "cloud1-d3gi68c7da560e902";

/** H5 演示模式：无云环境时使用本地 Mock 数据 */

export const USE_MOCK_ON_H5 = true;

/**

 * 是否启用微信同声传译语音输入。

 * 默认 false：避免未授权插件导致启动报错。

 */

export const ENABLE_WECHAT_SI = false;

/**

 * 普法视频（仅 App 播放页使用；小程序不进视频页）。

 * 填 HTTPS mp4；空则 App 提示暂无片源并展示要点。

 */

export const LAW_VIDEO_SRC = "";

export const LAW_VIDEO_HTTPS = "";

export const USE_LAW_VIDEO_CLOUD = false;

export const LAW_VIDEO_CLOUD_FILE_ID = "";

/** 村委公开联系电话（演示号，上线请改真实号码） */

export const VILLAGE_CONTACT_PHONE = "010-88886666";

/** 紧急求助提示 */

export const EMERGENCY_TIP = "人身安全请先拨打 110 / 120";

/**

 * 订阅消息模板 ID（公众平台 → 功能 → 订阅消息）

 */

export const SUBSCRIBE_TMPL_IDS = {
  disputeProgress: "",
};

/**

 * App S3：业务 HTTP 网关根地址（勿尾斜杠）。

 * 空字符串 = 未接网关，App 自动走 Mock。

 * 示例：云函数 HTTP 化后填

 *   https://xxx.service.tcloudbase.com/rt-http

 * 或本地调试网关：

 *   http://192.168.1.8:3789

 */

export const APP_API_BASE = "";

/**

 * 网关路径。本地网关默认 /api；

 * 云函数 HTTP 访问若直接打到函数根，可改为 ''。

 */

export const APP_API_PATH = "/api";

/** App 请求超时（毫秒） */

export const APP_API_TIMEOUT = 20000;

/**

 * App HTTP 失败时是否回退 Mock（演示/断网友好）。

 * 正式环境建议 false，避免「假数据当真」。

 */

export const APP_FALLBACK_MOCK = true;

/**

 * App 发布信息（与 manifest versionName 保持一致）

 */

export const APP_VERSION_NAME = "1.0.0";

export const APP_VERSION_CODE = 100;

/**

 * 发布渠道标记（展示用）：internal | store

 */

export const APP_RELEASE_CHANNEL = "internal";

/**

 * 隐私政策 / 用户协议公网外链（应用商店必填）。

 * 空 = 仅用应用内协议页；上架前请托管 static/legal 后填写。

 * 示例：https://your-domain.com/legal/privacy.html

 */

export const APP_PRIVACY_URL = "";

export const APP_USER_AGREEMENT_URL = "";

/**

 * 是否允许明文 HTTP（局域网调试）。

 * 正式上架请改为 false，并只用 https 的 APP_API_BASE；

 * 同时改 manifest.json → app-plus.distribute.android.usesCleartextTraffic。

 */

export const APP_ALLOW_CLEARTEXT = true;
