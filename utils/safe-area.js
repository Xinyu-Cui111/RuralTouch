/**
 * 安全区：小程序躲胶囊；App / H5 仅按状态栏预留。
 */
import { getPlatform } from "@/utils/platform.js";

function readWindowInfo() {
  try {
    if (typeof uni.getWindowInfo === "function") {
      return uni.getWindowInfo() || {};
    }
  } catch (e) {
    /* ignore */
  }
  try {
    const sys = uni.getSystemInfoSync() || {};
    return {
      statusBarHeight: sys.statusBarHeight,
      windowWidth: sys.windowWidth,
      safeAreaInsets: sys.safeAreaInsets,
    };
  } catch (e) {
    return {};
  }
}

const MIN_SIDE_GAP = 4;
const MIN_CAPSULE_EDGE = 8;
/** 自定义内容与胶囊左侧的最小间距 */
const MIN_CAPSULE_CLEAR = 12;

function readSafeBottom(win) {
  const inset = win && win.safeAreaInsets;
  if (inset && typeof inset.bottom === "number") {
    return Math.max(0, inset.bottom);
  }
  return 0;
}

export function getSafeLayout() {
  const fallback = {
    statusBarHeight: 20,
    safeTop: 20,
    safeBottom: 0,
    navBarHeight: 44,
    capsuleHeight: 32,
    capsuleWidth: 87,
    capsuleTop: 26,
    capsuleRight: 10,
    /** 顶栏右侧需预留：整颗胶囊 + 间距（px） */
    capsuleClearRight: 109,
    contentTop: 64,
    /** Tab 栏内容区底部预留（含安全区） */
    tabBarReserve: 50,
    sideGap: 6,
    windowWidth: 375,
  };

  try {
    const win = readWindowInfo();
    const statusBarHeight =
      win.statusBarHeight ||
      (win.safeAreaInsets && win.safeAreaInsets.top) ||
      20;
    const safeBottom = readSafeBottom(win);
    const windowWidth = win.windowWidth || 375;
    const platform = getPlatform();
    const tabBarReserve = 50 + safeBottom;

    // App / H5：无微信胶囊，右侧不必预留 109px
    if (platform === "app" || platform === "h5") {
      const navBarHeight = 44;
      return {
        statusBarHeight,
        safeTop: statusBarHeight,
        safeBottom,
        navBarHeight,
        capsuleHeight: 32,
        capsuleWidth: 0,
        capsuleTop: statusBarHeight + 6,
        capsuleRight: 12,
        capsuleClearRight: 16,
        contentTop: statusBarHeight + navBarHeight,
        tabBarReserve,
        sideGap: 6,
        windowWidth,
      };
    }

    let menu = null;
    try {
      menu =
        uni.getMenuButtonBoundingClientRect &&
        uni.getMenuButtonBoundingClientRect();
    } catch (e) {
      menu = null;
    }

    if (menu && menu.width && menu.top != null && menu.right != null) {
      const sideGap = Math.max(menu.top - statusBarHeight, MIN_SIDE_GAP);
      const navBarHeight = menu.height + sideGap * 2;
      const capsuleRight = Math.max(windowWidth - menu.right, MIN_CAPSULE_EDGE);
      const capsuleClearRight = Math.max(
        windowWidth - menu.left + MIN_CAPSULE_CLEAR,
        menu.width + capsuleRight + MIN_CAPSULE_CLEAR
      );

      return {
        statusBarHeight,
        safeTop: statusBarHeight,
        safeBottom,
        navBarHeight,
        capsuleHeight: menu.height,
        capsuleWidth: menu.width,
        capsuleTop: menu.top,
        capsuleRight,
        capsuleClearRight,
        contentTop: statusBarHeight + navBarHeight,
        tabBarReserve,
        sideGap,
        windowWidth,
      };
    }

    return {
      ...fallback,
      statusBarHeight,
      safeTop: statusBarHeight,
      safeBottom,
      contentTop: statusBarHeight + 44,
      tabBarReserve,
      windowWidth,
    };
  } catch (e) {
    return fallback;
  }
}
