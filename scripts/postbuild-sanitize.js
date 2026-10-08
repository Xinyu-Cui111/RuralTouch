const fs = require("fs");
const path = require("path");

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    return null;
  }
}

function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), "utf8");
}

/** Never ship originals / giants — only static/lite + tiny icons; video goes HTTPS */
const HEAVY_STATIC_PATTERNS = [
  /^banner\/(banner|profit|logo)\.(png|svg|jpg)$/i,
  /^banner\/TouMinglogo\.png$/i,
  /^banner\/law\.jpg$/i,
  /^moral-icons\//,
  /^village-icons\//,
  /^products\//,
  /^group-icons\/.*\.(jpg|jpeg|png)$/i,
  /^icons\/lawi\.svg$/i,
  /^lite\/logo\.png$/i,
  /^lite\/fund-banner\.png$/i, // 1.6MB；页面已用 .jpg
  /^law-videos\//, // mp4 不上主包（微信主包上限 2MB）；播放走 HTTPS
];

function shouldSkipStatic(relPath) {
  const normalized = relPath.replace(/\\/g, "/");
  return HEAVY_STATIC_PATTERNS.some((re) => re.test(normalized));
}

function copyStaticFiltered(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return false;
  try {
    fs.rmSync(destDir, { recursive: true, force: true });
    fs.mkdirSync(destDir, { recursive: true });

    let copied = 0;
    let skipped = 0;
    let bytes = 0;

    function walk(currentSrc, currentDest) {
      const entries = fs.readdirSync(currentSrc, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(currentSrc, entry.name);
        const destPath = path.join(currentDest, entry.name);
        const relPath = path.relative(srcDir, srcPath);

        if (entry.isDirectory()) {
          fs.mkdirSync(destPath, { recursive: true });
          walk(srcPath, destPath);
          continue;
        }

        if (shouldSkipStatic(relPath)) {
          skipped += 1;
          continue;
        }

        fs.copyFileSync(srcPath, destPath);
        copied += 1;
        bytes += fs.statSync(srcPath).size;
      }
    }

    walk(srcDir, destDir);
    console.log(
      `static copy: ${copied} kept, ${skipped} heavy skipped, ${(
        bytes / 1024
      ).toFixed(1)} KB total`
    );
    return true;
  } catch (error) {
    console.warn("skip static copy due to lock:", destDir, error.message);
    return false;
  }
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return false;
  try {
    fs.rmSync(destDir, { recursive: true, force: true });
    fs.cpSync(srcDir, destDir, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.warn("skip copyDir due to lock:", destDir, error.message);
    return false;
  }
}

function sanitizeAppJson(appJsonFile) {
  const appJson = readJson(appJsonFile);
  if (!appJson) return false;

  let changed = false;
  if (appJson.features) {
    delete appJson.features;
    changed = true;
  }

  const globalComponents = {
    "rt-icon": "/components/rt-icon/rt-icon",
    "rt-card": "/components/rt-card/rt-card",
    "rt-cell": "/components/rt-cell/rt-cell",
    "rt-section": "/components/rt-section/rt-section",
    "rt-nav-bar": "/components/rt-nav-bar/rt-nav-bar",
    "page-hero": "/components/page-hero/page-hero",
    "tab-bar": "/components/tab-bar/bar",
    "rt-progress-steps": "/components/rt-progress-steps/rt-progress-steps",
    "rt-skeleton": "/components/rt-skeleton/rt-skeleton",
    "empty-state": "/components/empty-state/empty-state",
    "product-card": "/components/product-card/product-card",
  };

  appJson.usingComponents = {
    ...(appJson.usingComponents || {}),
    ...globalComponents,
  };
  changed = true;

  // 未配置隐私弹窗协议时，真机/模拟器可能白屏；开发期先关掉强制校验
  if (appJson.__usePrivacyCheck__) {
    delete appJson.__usePrivacyCheck__;
    changed = true;
  }

  if (changed) writeJson(appJsonFile, appJson);
  return changed;
}

const root = path.resolve(__dirname, "..");
const buildOutputDir = path.join(root, "dist", "build", "mp-weixin");
const staticDir = path.join(root, "static");
const projectConfig = path.join(root, "project.config.json");
const privateConfig = path.join(root, "project.private.config.json");
const cloudDir = path.join(root, "cloudfunctions");

if (!fs.existsSync(path.join(buildOutputDir, "app.json"))) {
  console.error("build output missing app.json:", buildOutputDir);
  process.exit(1);
}

if (sanitizeAppJson(path.join(buildOutputDir, "app.json"))) {
  console.log("sanitized app.json");
}

if (copyStaticFiltered(staticDir, path.join(buildOutputDir, "static"))) {
  console.log("copied static to build output");
}

// 普法视频不上主包（会撑破 2MB）。播放走 LAW_VIDEO_HTTPS / 云存储。
const lawInBuild = path.join(buildOutputDir, "static", "law-videos");
try {
  if (fs.existsSync(lawInBuild)) {
    fs.rmSync(lawInBuild, { recursive: true, force: true });
    console.log("removed law-videos from build (use HTTPS)");
  }
} catch (error) {
  console.warn("skip remove law-videos:", error.message);
}

if (fs.existsSync(projectConfig)) {
  try {
    fs.copyFileSync(
      projectConfig,
      path.join(buildOutputDir, "project.config.json")
    );
    console.log("copied project.config.json");
  } catch (error) {
    console.warn("skip project.config.json copy:", error.message);
  }
}

if (fs.existsSync(privateConfig)) {
  try {
    fs.copyFileSync(
      privateConfig,
      path.join(buildOutputDir, "project.private.config.json")
    );
    console.log("copied project.private.config.json");
  } catch (error) {
    console.warn("skip project.private.config.json copy:", error.message);
  }
}

if (fs.existsSync(cloudDir)) {
  // 勿同步 node_modules：体积大且易卡住 Windows 复制；部署用「云端安装依赖」
  const destCf = path.join(buildOutputDir, "cloudfunctions");
  try {
    fs.rmSync(destCf, { recursive: true, force: true });
    fs.mkdirSync(destCf, { recursive: true });
    const fns = fs
      .readdirSync(cloudDir, { withFileTypes: true })
      .filter((d) => d.isDirectory());
    for (const fn of fns) {
      const from = path.join(cloudDir, fn.name);
      const to = path.join(destCf, fn.name);
      fs.mkdirSync(to, { recursive: true });
      const entries = fs.readdirSync(from, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === "node_modules") continue;
        const s = path.join(from, entry.name);
        const d = path.join(to, entry.name);
        if (entry.isDirectory())
          fs.cpSync(s, d, { recursive: true, force: true });
        else fs.copyFileSync(s, d);
      }
    }
    console.log("copied cloudfunctions (without node_modules)");
  } catch (error) {
    console.warn("skip cloudfunctions copy:", error.message);
  }
}

console.log("postbuild complete:", buildOutputDir);
