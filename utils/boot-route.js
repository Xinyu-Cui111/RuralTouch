/**
 * 登录/引导完成后的启动路由：有进行中办件则直达详情。
 * 用户可主动「回首页」并跳过本次直达（见 setSkipDirectDetail）。
 */
import { api } from "@/api/index.js";
import { goReLaunch } from "@/utils/nav.js";

const SKIP_KEY = "rt_skip_direct_detail";
const ONBOARDING_KEY = "rt_onboarding_done";

export function setSkipDirectDetail(skip) {
  try {
    uni.setStorageSync(SKIP_KEY, !!skip);
  } catch (e) {
    /* ignore */
  }
}

export function clearSkipDirectDetail() {
  try {
    uni.removeStorageSync(SKIP_KEY);
  } catch (e) {
    /* ignore */
  }
}

/** 回办事首页并跳过「有办件直达详情」 */
export function goVillageHomePrefer() {
  setSkipDirectDetail(true);
  goReLaunch("/pages/village/village");
}

export async function resolveBootHome() {
  try {
    if (!uni.getStorageSync(ONBOARDING_KEY)) {
      return "/pages/onboarding/onboarding";
    }
  } catch (e) {
    /* ignore */
  }

  try {
    if (uni.getStorageSync(SKIP_KEY)) {
      return "/pages/village/village";
    }
    const res = await api.listDisputes();
    const list = (res && res.data && res.data.list) || [];
    const handling = list.find((d) => d && d.status !== "completed" && d._id);
    if (handling) {
      return `/pages/disputeDetail/disputeDetail?id=${handling._id}&from=boot`;
    }
  } catch (e) {
    /* fall through */
  }
  return "/pages/village/village";
}

export async function goBootHome() {
  const url = await resolveBootHome();
  goReLaunch(url);
}
