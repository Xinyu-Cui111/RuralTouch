/** 防止连点导致重复跳转 / 页面闪烁 */
let locked = false;

function unlockLater() {
  setTimeout(() => {
    locked = false;
  }, 400);
}

export function goTo(url, type = "navigateTo") {
  if (!url || locked) return;
  locked = true;
  const api = uni[type] || uni.navigateTo;
  api({
    url,
    fail: () => {
      locked = false;
    },
    complete: unlockLater,
  });
}

export function goNavigate(url) {
  goTo(url, "navigateTo");
}

export function goRedirect(url) {
  goTo(url, "redirectTo");
}

export function goReLaunch(url) {
  goTo(url, "reLaunch");
}
