/**
 * RuralTouch full UI capture — gallery + real-interaction flows + scroll.
 * Spec: 简历制作/RuralTouch-全界面可视化策划.md
 *
 * Requires H5 Mock running (default http://localhost:5173):
 *   npm run dev:h5
 * Then:
 *   npm run capture:ui
 */
import { createRequire } from "module";
import {
  mkdir,
  writeFile,
  rename,
  rm,
  copyFile,
  access,
} from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MEDIA = join(ROOT, "docs", "media");
const GALLERY = join(MEDIA, "gallery");
const FLOWS = join(MEDIA, "flows");
const SCROLL = join(MEDIA, "scroll");
const LEGACY = join(ROOT, "screenshots");
const BASE = process.env.RT_H5_URL || "http://localhost:5173";
const VIEW = { width: 390, height: 844 };

function pageUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}/#${p}`;
}

async function ensureDirs() {
  for (const d of [MEDIA, GALLERY, FLOWS, SCROLL, LEGACY]) {
    await mkdir(d, { recursive: true });
  }
}

async function dismissOverlays(page) {
  await page.keyboard.press("Escape").catch(() => {});
  await page
    .evaluate(() => {
      document.querySelectorAll("vite-error-overlay").forEach((el) => {
        try {
          el.remove();
        } catch (_) {}
      });
      document.querySelectorAll(".uni-mask, .uni-modal").forEach((el) => {
        try {
          el.remove();
        } catch (_) {}
      });
    })
    .catch(() => {});
  for (const t of ["暂不", "确定", "知道了", "再逛逛", "我知道了"]) {
    const btn = page.getByText(t, { exact: true });
    if (await btn.count().catch(() => 0)) {
      await btn.first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(180);
    }
  }
}

async function gotoHash(page, path, settle = 700) {
  await page.goto(pageUrl(path), { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(settle);
  await dismissOverlays(page);
}

async function shot(page, name) {
  await dismissOverlays(page);
  await page.waitForTimeout(280);
  const dest = join(GALLERY, name);
  await page.screenshot({ path: dest, fullPage: false });
  console.log("  gallery", name);
}

async function clickText(page, text, exact = false) {
  await dismissOverlays(page);
  await page.getByText(text, { exact }).first().click({ timeout: 12000, force: true });
}

async function waitConfirm(page) {
  await page.getByText("确认提交", { exact: true }).first().waitFor({
    state: "visible",
    timeout: 25000,
  });
}

async function clickPrimary(page, label) {
  await dismissOverlays(page);
  const candidates = [
    page.locator("button, uni-button, .primary-btn").filter({ hasText: label }).first(),
    page.getByRole("button", { name: label }).first(),
    page.getByText(label, { exact: true }).first(),
  ];
  for (const loc of candidates) {
    if (await loc.count().catch(() => 0)) {
      await loc.click({ force: true, timeout: 8000 }).catch(() => {});
      return;
    }
  }
  throw new Error(`clickPrimary: not found ${label}`);
}

async function tryClickTab(page, label) {
  const tab = page.locator(".tab-bar, .rt-tabbar, .uni-tabbar").getByText(label, { exact: true });
  if (await tab.count().catch(() => 0)) {
    await tab.first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    return true;
  }
  // fallback: any visible text in bottom area
  const any = page.getByText(label, { exact: true });
  if (await any.count().catch(() => 0)) {
    await any.last().click({ force: true }).catch(() => {});
    await page.waitForTimeout(600);
    await dismissOverlays(page);
    return true;
  }
  return false;
}

async function scrollPage(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const root =
      document.querySelector("uni-page-body") ||
      document.querySelector(".uni-page-body") ||
      document.scrollingElement ||
      document.body;
    const max = Math.max(root.scrollHeight || 0, document.body.scrollHeight || 0);
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      root.scrollTo({ top: (max * i) / steps, behavior: "smooth" });
      window.scrollTo({ top: (max * i) / steps, behavior: "smooth" });
      await sleep(350);
    }
    root.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
    await sleep(400);
  });
}

async function newBrowser() {
  return chromium.launch({ headless: true });
}

async function newPage(browser, { videoDir } = {}) {
  const opts = {
    viewport: VIEW,
    deviceScaleFactor: 2,
    locale: "zh-CN",
  };
  if (videoDir) {
    await mkdir(videoDir, { recursive: true });
    opts.recordVideo = { dir: videoDir, size: VIEW };
  }
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  page.setDefaultTimeout(25000);
  return { context, page };
}

async function finishVideo(page, context, destMp4OrWebm) {
  const video = page.video();
  await page.close();
  await context.close();
  if (!video) return null;
  const raw = await video.path();
  await rename(raw, destMp4OrWebm);
  return destMp4OrWebm;
}

async function loginToHome(page) {
  await gotoHash(page, "/pages/login/login", 800);
  const check = page.locator(".check").first();
  if (await check.count().catch(() => 0)) {
    await check.click({ force: true }).catch(() => {});
  }
  await page.waitForTimeout(200);
  await clickPrimary(page, "微信一键登录").catch(() =>
    clickPrimary(page, "一键登录")
  );
  await page.waitForTimeout(1200);
  await dismissOverlays(page);
  // 关掉无权限等 modal
  const ok = page.getByText("确定", { exact: true });
  if (await ok.count().catch(() => 0)) {
    await ok.first().click({ force: true }).catch(() => {});
  }
  const skip = page.getByText("跳过");
  if (await skip.count().catch(() => 0)) {
    await skip.first().click({ force: true });
    await page.waitForTimeout(700);
  }
  await gotoHash(page, "/pages/village/village", 900);
  // uni H5：rt_user = { type:'object', data:{...} }
  await page
    .evaluate(() => {
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
          db.user = { ...(db.user || {}), ...adminUser };
          localStorage.setItem("ruraltouch_mock_db", JSON.stringify(db));
        }
      } catch (_) {}
    })
    .catch(() => {});
}

async function captureGallery(browser) {
  console.log("==> Gallery stills");
  const { context, page } = await newPage(browser);

  // A1 login
  await gotoHash(page, "/pages/login/login", 800);
  const check = page.locator(".check").first();
  if (await check.count().catch(() => 0)) await check.click({ force: true }).catch(() => {});
  await shot(page, "01-login.png");

  await loginToHome(page);

  // A2 onboarding (best-effort)
  await gotoHash(page, "/pages/onboarding/onboarding", 700);
  await shot(page, "02-onboarding.png");

  // B tabs
  await gotoHash(page, "/pages/village/village", 900);
  await shot(page, "03-village-home.png");
  await gotoHash(page, "/pages/law/law", 700);
  await shot(page, "04-law.png");
  await gotoHash(page, "/pages/moral/moral", 700);
  await shot(page, "05-moral.png");
  await gotoHash(page, "/pages/group/group", 700);
  await shot(page, "06-group.png");
  await gotoHash(page, "/pages/profile/profile", 700);
  await shot(page, "07-profile.png");

  // C submit + AI confirm
  await gotoHash(page, "/pages/village/submit", 700);
  await shot(page, "08-submit.png");
  await clickText(page, "土地边界纠纷").catch(() => {});
  const land =
    "两家承包地交界处起争执，对方把界桩挪了约两米，影响我家灌溉。希望村委帮忙丈量、调解。";
  await page.locator("textarea").first().fill(`【场景】土地边界纠纷。${land}`);
  await page.waitForTimeout(300);
  await clickPrimary(page, "整理成案");
  await waitConfirm(page);
  await page.waitForTimeout(600);
  await shot(page, "09-ai-confirm.png");
  await clickPrimary(page, "确认提交");
  await page.waitForTimeout(1200);
  const progress = page.getByText("先看办理进度");
  if (await progress.count().catch(() => 0)) {
    await progress.first().click({ force: true });
    await page.waitForTimeout(1000);
  } else {
    await gotoHash(page, "/pages/village/records", 700);
  }
  await shot(page, "11-dispute-detail.png");

  // C escalate
  await gotoHash(page, "/pages/village/submit", 700);
  const fight =
    "昨天两户因为宅基地吵起来，有人动手打架把人打伤了，头破血流，现在还在威胁对方家人。";
  await page.locator("textarea").first().fill(fight);
  await page.waitForTimeout(300);
  await clickPrimary(page, "整理成案");
  await waitConfirm(page);
  await page.waitForTimeout(600);
  await shot(page, "10-escalate.png");

  await gotoHash(page, "/pages/village/records", 700);
  await shot(page, "12-records.png");

  // D admin：登录后补 isAdmin，再进工作台
  await loginToHome(page).catch(() => {});
  await gotoHash(page, "/pages/admin/disputes", 1400);
  await dismissOverlays(page);
  if (await page.getByText("无权限").count().catch(() => 0)) {
    await page.getByText("确定", { exact: true }).first().click({ force: true }).catch(() => {});
    await loginToHome(page).catch(() => {});
    await gotoHash(page, "/pages/admin/disputes", 1400);
  }
  await page.getByText("调解员工作台").first().waitFor({ timeout: 12000 }).catch(() => {});
  const allTab = page.getByText(/^全部/);
  if (await allTab.count().catch(() => 0)) {
    await allTab.first().click({ force: true });
    await page.waitForTimeout(500);
  }
  await shot(page, "13-admin.png");
  await gotoHash(page, "/pages/admin/ai-quality", 900);
  await shot(page, "14-ai-quality.png");

  // E aux
  await gotoHash(page, "/pages/ai/assistant", 700);
  await shot(page, "15-ai-assistant.png");
  await gotoHash(page, "/pages/law/aiLegal", 700);
  await shot(page, "16-ai-legal.png");
  await gotoHash(page, "/pages/village/notice", 700);
  await shot(page, "17-notice.png");
  await gotoHash(page, "/pages/village/feedback", 700);
  await shot(page, "18-feedback.png");
  await gotoHash(page, "/pages/moral/declare", 700);
  await shot(page, "19-moral-declare.png");
  await gotoHash(page, "/pages/moral/mall", 700);
  await shot(page, "20-moral-mall.png");
  await gotoHash(page, "/pages/benefit/benefit", 700);
  await shot(page, "21-benefit.png");
  await gotoHash(page, "/pages/agreement/privacy", 600);
  await shot(page, "22-privacy.png");
  await gotoHash(page, "/pages/village/completeCeremony", 600);
  await shot(page, "23-ceremony.png");

  await page.close();
  await context.close();
}

async function captureFlow(browser, fileBase, storyFn) {
  console.log("==> Flow", fileBase);
  const tmp = join(FLOWS, `_tmp_${fileBase}`);
  await rm(tmp, { recursive: true, force: true }).catch(() => {});
  const { context, page } = await newPage(browser, { videoDir: tmp });
  try {
    await storyFn(page);
  } catch (e) {
    console.warn("  flow warn:", fileBase, e.message);
  }
  const webm = join(FLOWS, `${fileBase}.webm`);
  await finishVideo(page, context, webm);
  await rm(tmp, { recursive: true, force: true }).catch(() => {});
  return webm;
}

async function captureFlows(browser) {
  await captureFlow(browser, "01-enter", async (page) => {
    await gotoHash(page, "/pages/login/login", 700);
    const check = page.locator(".check").first();
    if (await check.count().catch(() => 0)) await check.click({ force: true });
    await page.waitForTimeout(500);
    await clickText(page, "微信一键登录").catch(() => clickText(page, "一键登录"));
    await page.waitForTimeout(1000);
    await dismissOverlays(page);
    const skip = page.getByText("跳过");
    if (await skip.count().catch(() => 0)) {
      await skip.first().click({ force: true });
      await page.waitForTimeout(800);
    }
    await gotoHash(page, "/pages/village/village", 1200);
    await page.waitForTimeout(800);
  });

  await captureFlow(browser, "02-tabs", async (page) => {
    await loginToHome(page);
    for (const label of ["法治", "激励", "好物", "我的", "办事"]) {
      const ok = await tryClickTab(page, label);
      if (!ok) {
        const map = {
          法治: "/pages/law/law",
          激励: "/pages/moral/moral",
          好物: "/pages/group/group",
          我的: "/pages/profile/profile",
          办事: "/pages/village/village",
        };
        await gotoHash(page, map[label], 700);
      }
      await page.waitForTimeout(900);
    }
  });

  await captureFlow(browser, "03-ai-case", async (page) => {
    await loginToHome(page);
    await gotoHash(page, "/pages/village/submit", 700);
    await clickText(page, "土地边界纠纷").catch(() => {});
    await page
      .locator("textarea")
      .first()
      .fill(
        "两家承包地交界处起争执，对方把界桩挪了约两米，影响灌溉，请村委调解。"
      );
    await page.waitForTimeout(400);
    await clickPrimary(page, "整理成案");
    await waitConfirm(page);
    await page.waitForTimeout(1200);
  });

  await captureFlow(browser, "04-escalate", async (page) => {
    await loginToHome(page);
    await gotoHash(page, "/pages/village/submit", 700);
    await page
      .locator("textarea")
      .first()
      .fill(
        "昨天两户因为宅基地吵起来，有人动手打架把人打伤了，头破血流，还在威胁家人。"
      );
    await page.waitForTimeout(300);
    await clickPrimary(page, "整理成案");
    await waitConfirm(page);
    await page.waitForTimeout(1400);
  });

  await captureFlow(browser, "05-admin", async (page) => {
    await loginToHome(page);
    await gotoHash(page, "/pages/admin/disputes", 1400);
    await dismissOverlays(page);
    await page.getByText("调解员工作台").first().waitFor({ timeout: 12000 }).catch(() => {});
    const allTab = page.getByText(/^全部/);
    if (await allTab.count().catch(() => 0)) {
      await allTab.first().click({ force: true });
      await page.waitForTimeout(700);
    }
    const card = page.locator(".dispute-card, .case-card, .rt-card").first();
    if (await card.count().catch(() => 0)) {
      await card.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1200);
    } else {
      await page.waitForTimeout(1200);
    }
  });

  await captureFlow(browser, "06-quality", async (page) => {
    await loginToHome(page);
    await gotoHash(page, "/pages/admin/ai-quality", 900);
    await scrollPage(page);
    await page.waitForTimeout(800);
  });
}

async function captureScrolls(browser) {
  console.log("==> Scroll clips");
  for (const [name, path] of [
    ["scroll-home", "/pages/village/village"],
    ["scroll-admin", "/pages/admin/disputes"],
    ["scroll-profile", "/pages/profile/profile"],
  ]) {
    const tmp = join(SCROLL, `_tmp_${name}`);
    await rm(tmp, { recursive: true, force: true }).catch(() => {});
    const { context, page } = await newPage(browser, { videoDir: tmp });
    await loginToHome(page);
    await gotoHash(page, path, 900);
    await scrollPage(page);
    await page.waitForTimeout(600);
    await finishVideo(page, context, join(SCROLL, `${name}.webm`));
    await rm(tmp, { recursive: true, force: true }).catch(() => {});
    console.log("  scroll", name);
  }
}

async function captureWalkthrough(browser) {
  console.log("==> Walkthrough overview");
  const tmp = join(MEDIA, "_tmp_walk");
  await rm(tmp, { recursive: true, force: true }).catch(() => {});
  const { context, page } = await newPage(browser, { videoDir: tmp });
  await gotoHash(page, "/pages/login/login", 600);
  const check = page.locator(".check").first();
  if (await check.count().catch(() => 0)) await check.click({ force: true });
  await page.waitForTimeout(400);
  await clickText(page, "微信一键登录").catch(() => {});
  await page.waitForTimeout(800);
  await dismissOverlays(page);
  const skip = page.getByText("跳过");
  if (await skip.count().catch(() => 0)) await skip.first().click({ force: true });
  await gotoHash(page, "/pages/village/village", 800);
  await gotoHash(page, "/pages/village/submit", 600);
  await clickText(page, "土地边界纠纷").catch(() => {});
  await page
    .locator("textarea")
    .first()
    .fill("承包地界桩被挪，影响灌溉，请调解。")
    .catch(() => {});
  await clickText(page, "整理成案").catch(() => {});
  await waitConfirm(page).catch(() => {});
  await page.waitForTimeout(800);
  await gotoHash(page, "/pages/admin/disputes", 900);
  await page.waitForTimeout(1000);
  await finishVideo(page, context, join(MEDIA, "walkthrough.webm"));
  await rm(tmp, { recursive: true, force: true }).catch(() => {});
}

function runFfmpeg(args) {
  return new Promise((resolve) => {
    const p = spawn("ffmpeg", args, { stdio: "ignore" });
    p.on("error", () => resolve(false));
    p.on("close", (code) => resolve(code === 0));
  });
}

async function promoteGifs() {
  console.log("==> Promote gif/mp4 (ffmpeg if available)");
  const jobs = [];
  for (const f of [
    "01-enter",
    "02-tabs",
    "03-ai-case",
    "04-escalate",
    "05-admin",
    "06-quality",
  ]) {
    const webm = join(FLOWS, `${f}.webm`);
    try {
      await access(webm);
    } catch {
      continue;
    }
    jobs.push(
      runFfmpeg([
        "-y",
        "-i",
        webm,
        "-vf",
        "scale=390:-1:flags=lanczos",
        "-c:v",
        "libx264",
        "-crf",
        "28",
        "-an",
        join(FLOWS, `${f}.mp4`),
      ]).then(() =>
        runFfmpeg([
          "-y",
          "-i",
          join(FLOWS, `${f}.mp4`),
          "-vf",
          "fps=8,scale=390:-1:flags=lanczos",
          "-t",
          "20",
          "-loop",
          "0",
          join(FLOWS, `${f}.gif`),
        ])
      )
    );
  }
  for (const f of ["scroll-home", "scroll-admin", "scroll-profile"]) {
    const webm = join(SCROLL, `${f}.webm`);
    try {
      await access(webm);
    } catch {
      continue;
    }
    jobs.push(
      runFfmpeg([
        "-y",
        "-i",
        webm,
        "-vf",
        "scale=390:-1:flags=lanczos",
        "-c:v",
        "libx264",
        "-crf",
        "28",
        "-an",
        join(SCROLL, `${f}.mp4`),
      ]).then(() =>
        runFfmpeg([
          "-y",
          "-i",
          join(SCROLL, `${f}.mp4`),
          "-vf",
          "fps=8,scale=390:-1:flags=lanczos",
          "-t",
          "8",
          "-loop",
          "0",
          join(SCROLL, `${f}.gif`),
        ])
      )
    );
  }
  const walk = join(MEDIA, "walkthrough.webm");
  try {
    await access(walk);
    jobs.push(
      runFfmpeg([
        "-y",
        "-i",
        walk,
        "-vf",
        "scale=390:-1:flags=lanczos",
        "-c:v",
        "libx264",
        "-crf",
        "28",
        "-an",
        join(MEDIA, "walkthrough.mp4"),
      ]).then(() =>
        runFfmpeg([
          "-y",
          "-i",
          join(MEDIA, "walkthrough.mp4"),
          "-vf",
          "fps=8,scale=390:-1:flags=lanczos",
          "-t",
          "22",
          "-loop",
          "0",
          join(MEDIA, "walkthrough.gif"),
        ])
      )
    );
  } catch (_) {}
  await Promise.all(jobs);
}

async function syncHeroAndLegacy() {
  const map = [
    ["01-login.png", "hero-login.png"],
    ["09-ai-confirm.png", "hero-confirm.png"],
    ["13-admin.png", "hero-admin.png"],
  ];
  for (const [src, hero] of map) {
    await copyFile(join(GALLERY, src), join(MEDIA, hero)).catch(() => {});
    await copyFile(join(GALLERY, src), join(LEGACY, src)).catch(() => {});
  }
  // legacy numbered aliases for old README links
  const legacy = [
    ["01-login.png", "01-login.png"],
    ["03-village-home.png", "02-village-home.png"],
    ["09-ai-confirm.png", "03-ai-confirm.png"],
    ["10-escalate.png", "04-escalate.png"],
    ["11-dispute-detail.png", "05-dispute-detail.png"],
    ["13-admin.png", "06-admin.png"],
    ["05-moral.png", "07-moral.png"],
    ["04-law.png", "08-law-ai.png"],
    ["14-ai-quality.png", "09-ai-quality.png"],
  ];
  for (const [g, l] of legacy) {
    await copyFile(join(GALLERY, g), join(LEGACY, l)).catch(() => {});
  }
  await copyFile(join(MEDIA, "walkthrough.webm"), join(LEGACY, "demo-walkthrough.webm")).catch(
    () => {}
  );
}

async function writeManifest() {
  const md = `# RuralTouch Simulator media manifest

> H5 Mock + Playwright 真交互采集。角色：村民 / 调解员。

## Gallery

| ID | File | Screen | Role |
| --- | --- | --- | --- |
| A1 | [01-login.png](gallery/01-login.png) | 登录 | 共用 |
| A2 | [02-onboarding.png](gallery/02-onboarding.png) | 引导 | 村民 |
| B1 | [03-village-home.png](gallery/03-village-home.png) | 办事首页 | 村民 |
| B2 | [04-law.png](gallery/04-law.png) | 法治 | 村民 |
| B3 | [05-moral.png](gallery/05-moral.png) | 激励 | 村民 |
| B4 | [06-group.png](gallery/06-group.png) | 好物 | 村民 |
| B5 | [07-profile.png](gallery/07-profile.png) | 我的 | 村民 |
| C1 | [08-submit.png](gallery/08-submit.png) | 说事提交 | 村民 |
| C2 | [09-ai-confirm.png](gallery/09-ai-confirm.png) | AI 确认成案 | 村民 |
| C3 | [10-escalate.png](gallery/10-escalate.png) | 高风险升级 | 村民 |
| C4 | [11-dispute-detail.png](gallery/11-dispute-detail.png) | 办件详情 | 共用 |
| C5 | [12-records.png](gallery/12-records.png) | 调解记录 | 村民 |
| D1 | [13-admin.png](gallery/13-admin.png) | 调解员工作台 | 调解员 |
| D2 | [14-ai-quality.png](gallery/14-ai-quality.png) | AI 质量 | 调解员 |
| E1 | [15-ai-assistant.png](gallery/15-ai-assistant.png) | 村务助手 | 村民 |
| E2 | [16-ai-legal.png](gallery/16-ai-legal.png) | 普法顾问 | 村民 |
| E3 | [17-notice.png](gallery/17-notice.png) | 村务通知 | 村民 |
| E4 | [18-feedback.png](gallery/18-feedback.png) | 意见箱 | 村民 |
| E5 | [19-moral-declare.png](gallery/19-moral-declare.png) | 积分申报 | 村民 |
| E6 | [20-moral-mall.png](gallery/20-moral-mall.png) | 激励礼品 | 村民 |
| E7 | [21-benefit.png](gallery/21-benefit.png) | 服务 | 村民 |
| E8 | [22-privacy.png](gallery/22-privacy.png) | 隐私政策 | 共用 |
| E9 | [23-ceremony.png](gallery/23-ceremony.png) | 办结仪式 | 共用 |

## Flows（真交互）

| File | Story | Role |
| --- | --- | --- |
| [01-enter](flows/01-enter.gif) | 登录 → 首页 | 共用 |
| [02-tabs](flows/02-tabs.gif) | 五 Tab | 村民 |
| [03-ai-case](flows/03-ai-case.gif) | 说事 → 整理成案 | 村民 |
| [04-escalate](flows/04-escalate.gif) | 高风险升级 | 村民 |
| [05-admin](flows/05-admin.gif) | 工作台办理 | 调解员 |
| [06-quality](flows/06-quality.gif) | AI 质量看板 | 调解员 |

## Scroll

| File | Screen |
| --- | --- |
| [scroll-home](scroll/scroll-home.gif) | 办事首页 |
| [scroll-admin](scroll/scroll-admin.gif) | 工作台 |
| [scroll-profile](scroll/scroll-profile.gif) | 我的 |

## Hero

\`hero-login.png\` · \`hero-confirm.png\` · \`hero-admin.png\` · \`walkthrough.*\`
`;
  await writeFile(join(MEDIA, "MANIFEST.md"), md, "utf8");
}

async function writePreviewHtml() {
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RuralTouch UI Gallery</title>
  <style>
    :root { --bg:#0f1714; --card:#15201b; --ink:#e8f2ec; --mute:#8aa396; --accent:#3d9b6e; }
    * { box-sizing: border-box; }
    body { margin:0; font-family: "Segoe UI", "PingFang SC", sans-serif; background:var(--bg); color:var(--ink); }
    header { padding:20px 24px; border-bottom:1px solid #24352c; display:flex; gap:16px; flex-wrap:wrap; align-items:center; }
    h1 { margin:0; font-size:18px; }
    .hint { color:var(--mute); font-size:13px; }
    .stage { display:flex; gap:28px; padding:28px; flex-wrap:wrap; justify-content:center; }
    .phone { width:390px; border-radius:28px; overflow:hidden; border:8px solid #111; background:#000; box-shadow:0 20px 60px rgba(0,0,0,.45); }
    .phone img { display:block; width:100%; }
    .meta { max-width:360px; }
    .meta h2 { margin:0 0 8px; font-size:22px; }
    .meta p { color:var(--mute); line-height:1.6; }
    .pill { display:inline-block; padding:4px 10px; border-radius:999px; background:#1e3329; color:var(--accent); font-size:12px; margin-right:6px; }
    .nav { display:flex; gap:8px; margin-top:16px; }
    button { background:var(--accent); color:#fff; border:0; border-radius:10px; padding:10px 14px; cursor:pointer; font-weight:600; }
    button.secondary { background:#24352c; }
    .thumbs { display:flex; gap:8px; overflow:auto; padding:0 24px 24px; }
    .thumbs img { width:72px; height:156px; object-fit:cover; border-radius:10px; opacity:.55; cursor:pointer; border:2px solid transparent; }
    .thumbs img.active { opacity:1; border-color:var(--accent); }
  </style>
</head>
<body>
  <header>
    <h1>指尖善治 · 全界面预览</h1>
    <span class="hint">← → 翻页 · 真 H5 Mock 截图</span>
  </header>
  <div class="stage">
    <div class="phone"><img id="shot" alt="screen" /></div>
    <div class="meta">
      <div id="role" class="pill">角色</div>
      <h2 id="title">—</h2>
      <p id="desc">按键盘左右键浏览 Gallery。</p>
      <div class="nav">
        <button class="secondary" id="prev">上一页</button>
        <button id="next">下一页</button>
      </div>
    </div>
  </div>
  <div class="thumbs" id="thumbs"></div>
  <script>
    const items = [
      ["01-login.png","登录","共用","合规登录与协议勾选"],
      ["02-onboarding.png","引导","村民","首次进入引导"],
      ["03-village-home.png","办事首页","村民","说事入口与村务卡片"],
      ["04-law.png","法治","村民","普法与反诈入口"],
      ["05-moral.png","激励","村民","道德银行积分"],
      ["06-group.png","好物","村民","惠民团购"],
      ["07-profile.png","我的","村民","个人中心"],
      ["08-submit.png","说事提交","村民","场景标签 + 口述"],
      ["09-ai-confirm.png","AI 确认成案","村民","类型 / 风险 / 依据"],
      ["10-escalate.png","高风险升级","村民","打架受伤提示转办"],
      ["11-dispute-detail.png","办件详情","共用","进度时间线"],
      ["12-records.png","调解记录","村民","办件列表"],
      ["13-admin.png","调解员工作台","调解员","待办队列"],
      ["14-ai-quality.png","AI 质量","调解员","质量看板"],
      ["15-ai-assistant.png","村务助手","村民","问答助手"],
      ["16-ai-legal.png","普法顾问","村民","法律辅助"],
      ["17-notice.png","村务通知","村民","通知列表"],
      ["18-feedback.png","意见箱","村民","意见反馈"],
      ["19-moral-declare.png","积分申报","村民","激励申报"],
      ["20-moral-mall.png","激励礼品","村民","礼品兑换"],
      ["21-benefit.png","服务","村民","服务聚合"],
      ["22-privacy.png","隐私政策","共用","合规文案"],
      ["23-ceremony.png","办结仪式","共用","办结完成页"]
    ];
    let i = 0;
    const shot = document.getElementById("shot");
    const title = document.getElementById("title");
    const desc = document.getElementById("desc");
    const role = document.getElementById("role");
    const thumbs = document.getElementById("thumbs");
    items.forEach((it, idx) => {
      const img = document.createElement("img");
      img.src = "gallery/" + it[0];
      img.onclick = () => { i = idx; render(); };
      thumbs.appendChild(img);
    });
    function render() {
      const it = items[i];
      shot.src = "gallery/" + it[0];
      title.textContent = it[1];
      role.textContent = it[2];
      desc.textContent = (i+1) + " / " + items.length + " · " + it[3];
      [...thumbs.children].forEach((el, idx) => el.classList.toggle("active", idx === i));
    }
    document.getElementById("prev").onclick = () => { i = (i + items.length - 1) % items.length; render(); };
    document.getElementById("next").onclick = () => { i = (i + 1) % items.length; render(); };
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") document.getElementById("next").click();
      if (e.key === "ArrowLeft") document.getElementById("prev").click();
    });
    render();
  </script>
</body>
</html>
`;
  await writeFile(join(MEDIA, "preview.html"), html, "utf8");
}

async function writeMediaReadme() {
  const md = `# 媒体资源（H5 Mock · Playwright 真交互）

规格高于「冷启动切页」方案：截图与动图均来自 **真实点击 / 填写 / 滚动**。

| 层 | 目录 | 用途 |
| --- | --- | --- |
| L1 | \`hero-*.png\` + \`walkthrough.gif\` | README 首屏 |
| L2 | \`flows/\` | 6 条产品操作流 |
| L3 | \`gallery/\` + \`preview.html\` | 全页目录与交互翻页 |
| 附 | \`scroll/\` | 长页滚动 |

索引：[MANIFEST.md](MANIFEST.md) · 翻页预览：本地打开 [preview.html](preview.html)

## 重采

\`\`\`bash
npm run dev:h5
# 另开终端
npm run capture:ui
\`\`\`

CI：Actions → **H5 Screenshots**
`;
  await writeFile(join(MEDIA, "README.md"), md, "utf8");
}

async function waitForH5(timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(BASE);
      if (res.ok || res.status === 404) return;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`H5 not reachable at ${BASE}. Run: npm run dev:h5`);
}

async function main() {
  await ensureDirs();
  const mode = (process.env.RT_CAPTURE_MODE || "all").toLowerCase();
  console.log("Waiting for H5", BASE, "mode=", mode);
  await waitForH5();
  const browser = await newBrowser();
  try {
    if (mode === "all" || mode === "gallery") {
      await captureGallery(browser);
      await waitForH5(30000).catch(() => {});
    }
    if (mode === "all" || mode === "flows") {
      await waitForH5(60000);
      await captureFlows(browser);
      await waitForH5(30000).catch(() => {});
    }
    if (mode === "all" || mode === "scroll" || mode === "flows") {
      await waitForH5(60000);
      try {
        await captureScrolls(browser);
      } catch (e) {
        console.warn("scroll section failed:", e.message);
      }
      try {
        await captureWalkthrough(browser);
      } catch (e) {
        console.warn("walkthrough failed:", e.message);
      }
    }
  } finally {
    await browser.close();
  }
  await promoteGifs();
  await syncHeroAndLegacy();
  await writeManifest();
  await writePreviewHtml();
  await writeMediaReadme();
  console.log("DONE ->", MEDIA);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
