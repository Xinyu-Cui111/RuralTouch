/**
 * 只重采 hero 三帧：login / ai-confirm / admin
 */
import { createRequire } from "module";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const GALLERY = join(ROOT, "docs", "media", "gallery");
const MEDIA = join(ROOT, "docs", "media");
const BASE = process.env.RT_H5_URL || "http://localhost:5173";

function pageUrl(path) {
  return `${BASE}/#${path.startsWith("/") ? path : `/${path}`}`;
}

async function dismiss(page) {
  await page.keyboard.press("Escape").catch(() => {});
  await page
    .evaluate(() =>
      document.querySelectorAll("vite-error-overlay,.uni-mask").forEach((e) => e.remove())
    )
    .catch(() => {});
}

async function gotoHash(page, path, settle = 800) {
  await page.goto(pageUrl(path), { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(settle);
  await dismiss(page);
}

async function shot(page, name) {
  await dismiss(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(GALLERY, name), fullPage: false });
  console.log("saved", name);
}

async function injectAdmin(page) {
  // uni H5：rt_user = { type:'object', data:{...} }；rt_token 为纯字符串
  await page.evaluate(() => {
    const adminUser = {
      _id: "mock-user-1",
      openid: "mock-openid",
      nickname: "演示调解员",
      phone: "13800000000",
      village: "示范村",
      points: 1250,
      isAdmin: true,
    };
    localStorage.setItem("rt_token", "mock-token");
    localStorage.setItem(
      "rt_user",
      JSON.stringify({ type: "object", data: adminUser })
    );
    try {
      const raw = localStorage.getItem("ruraltouch_mock_db");
      if (raw) {
        const db = JSON.parse(raw);
        db.user = { ...(db.user || {}), ...adminUser, isAdmin: true };
        localStorage.setItem("ruraltouch_mock_db", JSON.stringify(db));
      }
    } catch (_) {}
  });
}

async function login(page) {
  await gotoHash(page, "/pages/login/login", 900);
  const loginBtn = page.getByText("微信一键登录");
  if (await loginBtn.count()) {
    const check = page.locator(".check").first();
    if (await check.count()) await check.click({ force: true }).catch(() => {});
    await loginBtn.first().click({ force: true });
    await page.waitForTimeout(1200);
    await dismiss(page);
    const skip = page.getByText("跳过");
    if (await skip.count()) await skip.first().click({ force: true }).catch(() => {});
  }
  await injectAdmin(page);
  await gotoHash(page, "/pages/village/village", 900);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  locale: "zh-CN",
});
const page = await context.newPage();
page.setDefaultTimeout(25000);
await mkdir(GALLERY, { recursive: true });

await gotoHash(page, "/pages/login/login", 900);
const check = page.locator(".check").first();
if (await check.count()) await check.click({ force: true }).catch(() => {});
await shot(page, "01-login.png");

await login(page);

await gotoHash(page, "/pages/village/submit", 800);
await page.getByText("土地边界纠纷").first().click({ force: true }).catch(() => {});
await page
  .locator("textarea")
  .first()
  .fill(
    "【场景】土地边界纠纷。两家承包地交界处起争执，对方把界桩挪了约两米，影响灌溉，请村委调解。"
  );
await page.waitForTimeout(400);
await page.getByText("整理成案", { exact: true }).first().click({ force: true });
await page.getByText("确认提交", { exact: true }).first().waitFor({
  state: "visible",
  timeout: 25000,
});
await page.waitForTimeout(700);
await shot(page, "09-ai-confirm.png");

await page.getByText("确认提交", { exact: true }).first().click({ force: true });
await page.waitForTimeout(1000);

// escalate — 新 page，避免残留 step=2
const page2 = await context.newPage();
page2.setDefaultTimeout(25000);
await login(page2);
await page2.evaluate(() => {
  for (const k of Object.keys(localStorage)) {
    if (/submit|draft/i.test(k)) localStorage.removeItem(k);
  }
});
await gotoHash(page2, "/pages/village/submit", 1000);
await page2.locator("textarea").first().waitFor({ state: "visible", timeout: 15000 });
await page2
  .locator("textarea")
  .first()
  .fill(
    "昨天两户因为宅基地吵起来，有人动手打架把人打伤了，头破血流，现在还在威胁对方家人。"
  );
await page2.getByText("整理成案", { exact: true }).first().click({ force: true });
await page2.getByText("确认提交", { exact: true }).first().waitFor({
  state: "visible",
  timeout: 25000,
});
await page2.waitForTimeout(700);
await shot(page2, "10-escalate.png");

// admin：走真实登录（uni storage 格式），再进工作台
const page3 = await context.newPage();
page3.setDefaultTimeout(25000);
await gotoHash(page3, "/pages/login/login", 900);
const check3 = page3.locator(".check").first();
if (await check3.count()) await check3.click({ force: true }).catch(() => {});
if (await page3.getByText("微信一键登录").count()) {
  await page3.getByText("微信一键登录").first().click({ force: true });
  await page3.waitForTimeout(1400);
}
await injectAdmin(page3);
await gotoHash(page3, "/pages/admin/disputes", 1600);
await dismiss(page3);
await page3.getByText("确定", { exact: true }).first().click({ force: true }).catch(() => {});
await page3.getByText("调解员工作台").first().waitFor({ timeout: 15000 });
const allTab = page3.getByText(/^全部/);
if (await allTab.count()) await allTab.first().click({ force: true }).catch(() => {});
await page3.waitForTimeout(700);
await shot(page3, "13-admin.png");
await page2.close();
await page3.close();

// sync heroes
const { copyFile } = await import("fs/promises");
await copyFile(join(GALLERY, "01-login.png"), join(MEDIA, "hero-login.png"));
await copyFile(join(GALLERY, "09-ai-confirm.png"), join(MEDIA, "hero-confirm.png"));
await copyFile(join(GALLERY, "13-admin.png"), join(MEDIA, "hero-admin.png"));

await browser.close();
console.log("heroes done");
