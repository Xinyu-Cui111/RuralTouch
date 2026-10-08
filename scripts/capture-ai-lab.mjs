/**
 * Capture AI Lab + doc-extract screens for README/portfolio.
 * Requires: npm run dev:h5
 */
import { createRequire } from "module";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../docs/media/gallery");
const BASE = process.env.RT_H5_URL || "http://localhost:5173";

function pageUrl(path) {
  return `${BASE}/#${path.startsWith("/") ? path : "/" + path}`;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
  });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  page.setDefaultTimeout(25000);

  await page.goto(pageUrl("/pages/login/login"), { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const check = page.locator(".check").first();
  if (await check.count()) await check.click();
  await page.getByText("微信一键登录").first().click({ force: true });
  await page.waitForTimeout(1000);
  const skip = page.getByText("跳过");
  if (await skip.count()) await skip.first().click({ force: true });

  await page.goto(pageUrl("/pages/tools/ai-lab"), { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.getByText("土地边界对不上怎么办").first().click({ force: true });
  await page.waitForTimeout(600);
  await page.screenshot({
    path: join(OUT, "10-ai-lab.png"),
    fullPage: false,
  });
  console.log("saved 10-ai-lab.png");

  await page.goto(pageUrl("/pages/tools/doc-extract"), {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(500);
  await page.getByText("填发票样例").first().click({ force: true });
  await page.waitForTimeout(200);
  await page.getByText("抽取字段").first().click({ force: true });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: join(OUT, "11-doc-extract.png"),
    fullPage: false,
  });
  console.log("saved 11-doc-extract.png");

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
