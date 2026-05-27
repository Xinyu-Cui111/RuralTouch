const fs = require("fs");
const { spawn, spawnSync } = require("child_process");
const path = require("path");

const platform = process.argv[2];
const cliArgs = process.argv.slice(3);

if (!platform) {
  console.error("Missing UNI_PLATFORM value");
  process.exit(1);
}

const uniBin = path.join(
  __dirname,
  "..",
  "node_modules",
  "@dcloudio",
  "vite-plugin-uni",
  "bin",
  "uni.js"
);
const root = path.resolve(__dirname, "..");
const staticDir = path.join(root, "static");
const devOutputDir = path.join(root, "unpackage", "dist", "dev", "mp-weixin");
const buildOutputDir = path.join(root, "dist", "build", "mp-weixin");
const generatedCommonDir = path.join(buildOutputDir, "common");
const isBuild = cliArgs[0] === "build";
let lastStaticSignature = "";
let lastGeneratedAssetsSignature = "";

function listFilesRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = [];

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      entries.push(...listFilesRecursive(entryPath));
      continue;
    }

    const stats = fs.statSync(entryPath);
    entries.push({
      path: entryPath,
      relativePath: path.relative(root, entryPath),
      size: stats.size,
      mtimeMs: stats.mtimeMs,
    });
  }

  return entries;
}

function getTreeSignature(dirPath) {
  return listFilesRecursive(dirPath)
    .map((item) => `${item.relativePath}:${item.size}:${item.mtimeMs}`)
    .sort()
    .join("|");
}

function ensureAssetsShim(outputDir) {
  const commonDir = path.join(outputDir, "common");
  const assetsFile = path.join(commonDir, "assets.js");

  fs.mkdirSync(commonDir, { recursive: true });

  if (!fs.existsSync(assetsFile)) {
    fs.writeFileSync(
      assetsFile,
      '"use strict";\nmodule.exports = {};\n',
      "utf8"
    );
    return true;
  }

  return false;
}

function copyStaticAssets() {
  if (!fs.existsSync(staticDir)) return;

  const signature = getTreeSignature(staticDir);
  if (signature && signature === lastStaticSignature) {
    return false;
  }

  lastStaticSignature = signature;

  fs.mkdirSync(devOutputDir, { recursive: true });
  const devStaticDir = path.join(devOutputDir, "static");
  const buildStaticDir = path.join(buildOutputDir, "static");
  fs.rmSync(devStaticDir, { recursive: true, force: true });
  fs.cpSync(staticDir, devStaticDir, { recursive: true, force: true });
  fs.mkdirSync(buildOutputDir, { recursive: true });
  fs.rmSync(buildStaticDir, { recursive: true, force: true });
  fs.cpSync(staticDir, buildStaticDir, { recursive: true, force: true });

  return true;
}

function copyDevOutputToBuild() {
  if (!fs.existsSync(devOutputDir)) return;
  fs.rmSync(buildOutputDir, { recursive: true, force: true });
  fs.cpSync(devOutputDir, buildOutputDir, { recursive: true, force: true });
}

function syncGeneratedCommonAssets() {
  const assetsFile = path.join(generatedCommonDir, "assets.js");
  const devCommonDir = path.join(devOutputDir, "common");

  if (!fs.existsSync(assetsFile)) {
    return;
  }

  const signature = `${fs.statSync(assetsFile).size}:${
    fs.statSync(assetsFile).mtimeMs
  }`;
  if (signature === lastGeneratedAssetsSignature) {
    return;
  }

  lastGeneratedAssetsSignature = signature;

  fs.mkdirSync(devCommonDir, { recursive: true });
  fs.copyFileSync(assetsFile, path.join(devCommonDir, "assets.js"));

  const assetsMapFile = path.join(generatedCommonDir, "assets.js.map");
  if (fs.existsSync(assetsMapFile)) {
    fs.copyFileSync(assetsMapFile, path.join(devCommonDir, "assets.js.map"));
  }
}

const commandArgs = isBuild
  ? [uniBin, "build", "-p", platform, ...cliArgs.slice(1)]
  : [uniBin, "-p", platform, ...cliArgs];
const env = {
  ...process.env,
  UNI_INPUT_DIR: process.env.UNI_INPUT_DIR || process.cwd(),
  UNI_CLI_CONTEXT: process.env.UNI_CLI_CONTEXT || process.cwd(),
  UNI_PLATFORM: platform,
};

if (isBuild) {
  const result = spawnSync(process.execPath, commandArgs, {
    stdio: "inherit",
    env,
  });

  if (platform === "mp-weixin") {
    copyStaticAssets();
  }

  if (platform === "mp-weixin" && result.status === 0) {
    syncGeneratedCommonAssets();
  }

  process.exit(result.status === null ? 1 : result.status);
}

if (platform === "mp-weixin") {
  copyStaticAssets();
  ensureAssetsShim(devOutputDir);
}

const child = spawn(process.execPath, commandArgs, {
  stdio: "inherit",
  env,
});

if (platform === "mp-weixin") {
  const syncStatic = () => {
    copyStaticAssets();
    ensureAssetsShim(devOutputDir);
    syncGeneratedCommonAssets();
  };

  syncStatic();
  const timer = setInterval(syncStatic, 3000);
  child.once("exit", (code) => {
    clearInterval(timer);
    process.exit(code === null ? 1 : code);
  });
} else {
  child.once("exit", (code) => {
    process.exit(code === null ? 1 : code);
  });
}
