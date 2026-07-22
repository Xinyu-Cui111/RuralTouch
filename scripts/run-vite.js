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
const devOutputDir = path.join(root, "unpackage", "dist", "dev", platform);
const buildOutputDir = path.join(root, "dist", "build", platform);
const isBuild = cliArgs[0] === "build";

function copyCloudAssets(outputDir) {
  if (!fs.existsSync(outputDir)) return;
  const projectConfig = path.join(root, "project.config.json");
  const privateConfig = path.join(root, "project.private.config.json");
  const cloudDir = path.join(root, "cloudfunctions");
  if (fs.existsSync(projectConfig)) {
    fs.copyFileSync(projectConfig, path.join(outputDir, "project.config.json"));
    console.log("copied project.config.json to", outputDir);
  }
  if (fs.existsSync(privateConfig)) {
    fs.copyFileSync(
      privateConfig,
      path.join(outputDir, "project.private.config.json")
    );
    console.log("copied project.private.config.json to", outputDir);
  }
  if (fs.existsSync(cloudDir)) {
    const target = path.join(outputDir, "cloudfunctions");
    fs.rmSync(target, { recursive: true, force: true });
    fs.cpSync(cloudDir, target, { recursive: true, force: true });
    console.log("copied cloudfunctions to", target);
  }
}

function copyStaticAssets(outputDir) {
  if (!fs.existsSync(staticDir) || !fs.existsSync(outputDir)) return;
  const staticTarget = path.join(outputDir, "static");
  fs.rmSync(staticTarget, { recursive: true, force: true });
  fs.cpSync(staticDir, staticTarget, { recursive: true, force: true });
  console.log("copied static to", staticTarget);
}

function postProcessOutput(outputDir) {
  copyStaticAssets(outputDir);
  if (platform === "mp-weixin") {
    copyCloudAssets(outputDir);
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

  if (result.status === 0) {
    postProcessOutput(buildOutputDir);
  }

  process.exit(result.status === null ? 1 : result.status);
}

const child = spawn(process.execPath, commandArgs, {
  stdio: "inherit",
  env,
});

if (platform === "mp-weixin") {
  const syncOutput = () => postProcessOutput(devOutputDir);
  syncOutput();
  const timer = setInterval(syncOutput, 2000);
  child.once("exit", (code) => {
    clearInterval(timer);
    process.exit(code === null ? 1 : code);
  });
} else {
  child.once("exit", (code) => {
    process.exit(code === null ? 1 : code);
  });
}
