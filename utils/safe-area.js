/**
 * 微信小程序刘海 / 胶囊安全区
 * 关键：躲开右上角胶囊（宽度+左右间距），不是只躲刘海
 */
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
    };
  } catch (e) {
    return {};
  }
}

const MIN_SIDE_GAP = 4;
const MIN_CAPSULE_EDGE = 8;
/** 自定义内容与胶囊左侧的最小间距 */
const MIN_CAPSULE_CLEAR = 12;

export function getSafeLayout() {
  const fallback = {
    statusBarHeight: 20,
    safeTop: 20,
    navBarHeight: 44,
    capsuleHeight: 32,
    capsuleWidth: 87,
    capsuleTop: 26,
    capsuleRight: 10,
    /** 顶栏右侧需预留：整颗胶囊 + 间距（px） */
    capsuleClearRight: 109,
    contentTop: 64,
    sideGap: 6,
    windowWidth: 375,
  };

  try {
    const win = readWindowInfo();
    const statusBarHeight = win.statusBarHeight || 20;
    const windowWidth = win.windowWidth || 375;
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
      // 从屏幕右缘到胶囊左缘，再加 clear，保证自定义按钮不钻进胶囊
      const capsuleClearRight = Math.max(
        windowWidth - menu.left + MIN_CAPSULE_CLEAR,
        menu.width + capsuleRight + MIN_CAPSULE_CLEAR
      );

      return {
        statusBarHeight,
        safeTop: statusBarHeight,
        navBarHeight,
        capsuleHeight: menu.height,
        capsuleWidth: menu.width,
        capsuleTop: menu.top,
        capsuleRight,
        capsuleClearRight,
        contentTop: statusBarHeight + navBarHeight,
        sideGap,
        windowWidth,
      };
    }

    return {
      ...fallback,
      statusBarHeight,
      safeTop: statusBarHeight,
      contentTop: statusBarHeight + 44,
      windowWidth,
    };
  } catch (e) {
    return fallback;
  }
}
