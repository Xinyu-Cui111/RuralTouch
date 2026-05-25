export const STATIC_FILES = [
    "static/banner/banner.png",
    "static/banner/law.jpg",
    "static/banner/logo.png",
    "static/banner/logo.svg",
    "static/banner/profit.png",
    "static/banner/TouMinglogo.png",
    "static/group-icons/fuzhuang.svg",
    "static/group-icons/fuzhuangxiemao.jpg",
    "static/group-icons/nongchanpin.jpg",
    "static/group-icons/nongchanpin.svg",
    "static/group-icons/nongzi.svg",
    "static/group-icons/nongzinongju.jpg",
    "static/group-icons/shenghuo.svg",
    "static/group-icons/shenghuoyongpin.jpg",
    "static/icons/arrow-right.svg",
    "static/icons/bell.svg",
    "static/icons/groupi.svg",
    "static/icons/lawi.svg",
    "static/icons/morali.svg",
    "static/icons/search.svg",
    "static/icons/user.svg",
    "static/icons/villagei.svg",
    "static/images/arrow.svg",
    "static/images/copy.svg",
    "static/law-icons/eye.svg",
    "static/law-icons/rules.svg",
    "static/law-icons/search.svg",
    "static/law-icons/stories.svg",
    "static/law-videos/law.mp4",
    "static/moral-icons/banshou.svg",
    "static/moral-icons/chuizi.svg",
    "static/moral-icons/cun.svg",
    "static/moral-icons/fangzi.svg",
    "static/moral-icons/mi.svg",
    "static/moral-icons/miao.svg",
    "static/moral-icons/sanjiao.svg",
    "static/moral-icons/shui.svg",
    "static/moral-icons/woshou.svg",
    "static/products/heidoufen.jpg",
    "static/products/huagaofen.jpg",
    "static/products/sangshen.jpg",
    "static/products/sanwenyu.jpg",
    "static/village-icons/che.svg",
    "static/village-icons/laba.svg",
    "static/village-icons/ling.svg",
    "static/village-icons/touxiang.jpg",
    "static/village-icons/xinxi.svg",
];

export const STATIC_FILE_COUNT = STATIC_FILES.length;

export function buildCloudFileIds(envId) {
    const trimmedEnvId = String(envId || "").trim();

    if (!trimmedEnvId) {
        return [];
    }

    return STATIC_FILES.map((relativePath) => ({
        relativePath,
        fileID: `cloud://${trimmedEnvId}/${relativePath}`,
    }));
}
