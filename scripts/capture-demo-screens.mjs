/**
 * Capture RuralTouch H5 demo screenshots + silent walkthrough video.
 * Requires: npm run dev:h5 → http://localhost:5173
 */
import { createRequire } from "module";
import { mkdir, rename, rm } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "E:/项目/.demo/简历制作/JD求职工具/career-ops/node_modules/playwright"
);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "screenshots");
const BASE = process.env.RT_H5_URL || "http://localhost:5173";

function pageUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}/#${p}`;
}

async function shot(page, name) {
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(OUT, name), fullPage: false });
  console.log("saved", name);
}

async function dismissOverlays(page) {
  for (const t of ["暂不", "确定", "知道了", "再逛逛"]) {
    const btn = page.getByText(t, { exact: true });
    if (await btn.count()) {
      await btn.first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(200);
    }
  }
  await page
    .evaluate(() => {
      document
        .querySelectorAll(".uni-mask")
        .forEach((el) => el.remove());
    })
    .catch(() => {});
}

async function clickText(page, text, exact = false) {
  await dismissOverlays(page);
  await page.getByText(text, { exact }).first().click({ timeout: 10000, force: true });
}

async function waitConfirm(page) {
  await page
    .locator("uni-button")
    .filter({ hasText: "确认提交" })
    .first()
    .waitFor({ timeout: 15000 });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    locale: "zh-CN",
    recordVideo: {
      dir: join(OUT, "_video"),
      size: { width: 390, height: 844 },
    },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  await page.goto(pageUrl("/pages/login/login"), { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.locator(".check").first().click();
  await shot(page, "01-login.png");
  await clickText(page, "微信一键登录");
  await page.waitForTimeout(1200);
  await dismissOverlays(page);

  const skip = page.getByText("跳过");
  if (await skip.count()) {
    await skip.first().click({ force: true });
    await page.waitForTimeout(800);
  }

  await page.goto(pageUrl("/pages/village/village"), {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(800);
  await dismissOverlays(page);
  await shot(page, "02-village-home.png");

  await page.goto(pageUrl("/pages/village/submit"), {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(600);
  await dismissOverlays(page);
  await clickText(page, "土地边界纠纷");
  const land =
    "两家承包地交界处起争执，对方把界桩挪了约两米，影响我家灌溉。希望村委帮忙丈量、调解。";
  await page.locator("textarea").first().fill(`【场景】土地边界纠纷。${land}`);
  await clickText(page, "整理成案");
  await waitConfirm(page);
  await page.waitForTimeout(400);
  await shot(page, "03-ai-confirm.png");
  await page
    .locator("uni-button")
    .filter({ hasText: "确认提交" })
    .first()
    .click({ force: true });
  await page.waitForTimeout(1000);
  const progress = page.getByText("先看办理进度");
  if (await progress.count()) {
    await progress.first().click({ force: true });
    await page.waitForTimeout(1000);
    await shot(page, "05-dispute-detail.png");
  }

  await page.goto(pageUrl("/pages/village/submit"), {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(500);
  await dismissOverlays(page);
  const fight =
    "昨天两户因为宅基地吵起来，有人动手打架把人打伤了，头破血流，现在还在威胁对方家人。";
  await page.locator("textarea").first().fill(fight);
  await clickText(page, "整理成案");
  await waitConfirm(page);
  await page.waitForTimeout(400);
  await shot(page, "04-escalate.png");

  await page.goto(pageUrl("/pages/admin/disputes"), {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1000);
  await dismissOverlays(page);
  const allTab = page.getByText(/^全部/);
  if (await allTab.count()) {
    await allTab.first().click({ force: true });
    await page.waitForTimeout(600);
  }
  await shot(page, "06-admin.png");

  await page.goto(pageUrl("/pages/moral/moral"), { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await dismissOverlays(page);
  await shot(page, "07-moral.png");

  await page.goto(pageUrl("/pages/law/law"), { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await dismissOverlays(page);
  await shot(page, "08-law-ai.png");

  await page.goto(pageUrl("/pages/admin/ai-quality"), {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(700);
  await dismissOverlays(page);
  await shot(page, "09-ai-quality.png");

  const video = page.video();
  await page.close();
  await browser.close();
  if (video) {
    const raw = await video.path();
    const dest = join(OUT, "demo-walkthrough.webm");
    await rename(raw, dest);
    await rm(join(OUT, "_video"), { recursive: true, force: true }).catch(
      () => {}
    );
    console.log("saved demo-walkthrough.webm");
  }
  console.log("done ->", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
