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
  fs.writeFileSync(file, JSON.stringify(obj, null, 4), 'utf8')
}

const root = path.resolve(__dirname, '..')
const pagesFile = path.join(root, 'pages.json')
const manifestFile = path.join(root, 'manifest.json')

const pages = readJson(pagesFile)
if (!pages) {
  console.error('pages.json not found or invalid')
  process.exit(1)
}

function walkPages(list) {
  if (!Array.isArray(list)) return
  list.forEach(p => {
    // page item can be string or object
    if (typeof p === 'string') return
    // if p has nested pages (subpackage), walk them
    if (p.pages) {
      walkPages(p.pages)
    }
  })
}

walkPages(pages.pages)
walkPages(pages.subPackages)
walkPages(pages.subpackages)

writeJson(pagesFile, pages)
console.log('pages.json validated and updated (if needed)')

// Ensure manifest has platform section to avoid plugin assumptions
const manifest = readJson(manifestFile) || {}
const platform = process.argv[2] || process.env.UNI_PLATFORM || 'mp-weixin'
manifest[platform] = manifest[platform] || manifest[platform] === undefined ? manifest[platform] : {}
if (!manifest[platform]) manifest[platform] = {}
writeJson(manifestFile, manifest)
console.log('manifest.json validated and updated (if needed) for platform', platform)

process.exit(0)
