const fs = require('fs')
const { spawn, spawnSync } = require('child_process')
const path = require('path')

const platform = process.argv[2]
const cliArgs = process.argv.slice(3)

if (!platform) {
    console.error('Missing UNI_PLATFORM value')
    process.exit(1)
}

const uniBin = path.join(__dirname, '..', 'node_modules', '@dcloudio', 'vite-plugin-uni', 'bin', 'uni.js')
const root = path.resolve(__dirname, '..')
const staticDir = path.join(root, 'static')
const devOutputDir = path.join(root, 'unpackage', 'dist', 'dev', 'mp-weixin')
const buildOutputDir = path.join(root, 'dist', 'build', 'mp-weixin')
const isBuild = cliArgs[0] === 'build'

function copyStaticAssets() {
    if (!fs.existsSync(staticDir)) return
    fs.mkdirSync(devOutputDir, { recursive: true })
    const devStaticDir = path.join(devOutputDir, 'static')
    const buildStaticDir = path.join(buildOutputDir, 'static')
    fs.rmSync(devStaticDir, { recursive: true, force: true })
    fs.cpSync(staticDir, devStaticDir, { recursive: true, force: true })
    fs.mkdirSync(buildOutputDir, { recursive: true })
    fs.rmSync(buildStaticDir, { recursive: true, force: true })
    fs.cpSync(staticDir, buildStaticDir, { recursive: true, force: true })
}

function copyDevOutputToBuild() {
    if (!fs.existsSync(devOutputDir)) return
    fs.rmSync(buildOutputDir, { recursive: true, force: true })
    fs.cpSync(devOutputDir, buildOutputDir, { recursive: true, force: true })
}

const commandArgs = isBuild
    ? [uniBin, 'build', '-p', platform, ...cliArgs.slice(1)]
    : [uniBin, '-p', platform, ...cliArgs]
const env = {
    ...process.env,
    UNI_INPUT_DIR: process.env.UNI_INPUT_DIR || process.cwd(),
    UNI_CLI_CONTEXT: process.env.UNI_CLI_CONTEXT || process.cwd(),
    UNI_PLATFORM: platform
}

if (isBuild) {
    const result = spawnSync(process.execPath, commandArgs, {
        stdio: 'inherit',
        env
    })

    if (platform === 'mp-weixin') {
        copyStaticAssets()
    }

    if (platform === 'mp-weixin' && result.status === 0) {
        copyDevOutputToBuild()
    }

    process.exit(result.status === null ? 1 : result.status)
}

const child = spawn(process.execPath, commandArgs, {
    stdio: 'inherit',
    env
})

if (platform === 'mp-weixin') {
    const syncStatic = () => {
        copyStaticAssets()
    }

    syncStatic()
    const timer = setInterval(syncStatic, 1500)
    child.once('exit', code => {
        clearInterval(timer)
        process.exit(code === null ? 1 : code)
    })
} else {
    child.once('exit', code => {
        process.exit(code === null ? 1 : code)
    })
}