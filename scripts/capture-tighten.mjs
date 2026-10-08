/**
 * Quick capture: home + confirm after visual tighten.
 * Requires: npm run dev:h5
 */
import { createRequire } from "module";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "docs", "media", "gallery");
const BASE = process.env.RT_H5_URL || "http://localhost:5173";

async function dismiss(page) {
  await page.keyboard.press("Escape").catch(() => {});
  for (const t of ["暂不", "确定", "知道了", "再逛逛", "我知道了"]) {
    const btn = page.getByText(t, { exact: true });
    if (await btn.count().catch(() => 0)) {
      await btn.first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(150);
    }
  }
}

async function login(page) {
  await page.goto(`${BASE}/#/pages/login/login`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(600);
  const check = page.locator(".check").first();
  if (await check.count().catch(() => 0)) {
    await check.click({ force: true }).catch(() => {});
  }
  await page
    .locator("button, uni-button, .primary-btn")
    .filter({ hasText: /登录/ })
    .first()
    .click({ force: true })
    .catch(() => {});
  await page.waitForTimeout(900);
  await dismiss(page);
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
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });

  await login(page);

  await page.goto(`${BASE}/#/pages/village/village`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1000);
  await dismiss(page);
  await page.screenshot({
    path: join(OUT, "02-village-home.png"),
    fullPage: false,
  });
  console.log("ok 02-village-home.png");

  await page.goto(`${BASE}/#/pages/village/submit`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(800);
  await dismiss(page);

  const story =
    "东头老张家和隔壁王伯为宅基地后院边界吵了半个月。张说围墙占了自家一尺地，王说墙是十年前一起砌的。村里调解过一次没谈拢，想请村委再出面量一下边界，双方愿意协商，不要打官司。";
  const box = page.locator("textarea").first();
  await box.fill(story);
  await page.waitForTimeout(200);
  await page
    .locator("button, uni-button, .primary-btn")
    .filter({ hasText: "整理成案" })
    .first()
    .click({ force: true });
  await page.getByText("确认提交", { exact: true }).first().waitFor({
    state: "visible",
    timeout: 25000,
  });
  await page.waitForTimeout(600);
  await dismiss(page);
  await page.screenshot({
    path: join(OUT, "04-submit-confirm.png"),
    fullPage: false,
  });
  console.log("ok 04-submit-confirm.png");

  // also hero aliases used in docs
  await page.screenshot({
    path: join(OUT, "hero-confirm.png"),
    fullPage: false,
  });
  console.log("ok hero-confirm.png");

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
