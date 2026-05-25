const fs = require('fs')
const path = require('path')

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    return null
  }
}

function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8')
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return false
  fs.rmSync(destDir, { recursive: true, force: true })
  fs.cpSync(srcDir, destDir, { recursive: true, force: true })
  return true
}

function syncDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return false
  fs.rmSync(destDir, { recursive: true, force: true })
  fs.cpSync(srcDir, destDir, { recursive: true, force: true })
  return true
}

function sanitizeAppJson(appJsonFile) {
  const appJson = readJson(appJsonFile)
  if (!appJson) return false

  let changed = false

  if (appJson.features) {
    delete appJson.features
    changed = true
  }

  if (changed) writeJson(appJsonFile, appJson)
  return changed
}

const root = path.resolve(__dirname, '..')
const candidateDirs = [
  path.join(root, 'unpackage', 'dist', 'dev', 'mp-weixin'),
  path.join(root, 'dist', 'build', 'mp-weixin')
]

const devOutputDir = path.join(root, 'unpackage', 'dist', 'dev', 'mp-weixin')
const buildOutputDir = path.join(root, 'dist', 'build', 'mp-weixin')

const staticDir = path.join(root, 'static')

let updated = false
for (const dir of candidateDirs) {
  const appJsonFile = path.join(dir, 'app.json')
  if (sanitizeAppJson(appJsonFile)) {
    console.log('sanitized', appJsonFile)
    updated = true
  }

  const staticTarget = path.join(dir, 'static')
  if (copyDir(staticDir, staticTarget)) {
    console.log('copied static to', staticTarget)
    updated = true
  }
}

if (syncDir(devOutputDir, buildOutputDir)) {
  console.log('synced mp-weixin output to', buildOutputDir)
  updated = true
}

if (!updated) {
  console.log('no generated app.json features field found')
}
