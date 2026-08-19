#!/usr/bin/env node
const fs = require('node:fs')
const path = require('node:path')

function parseYml(content) {
  const version = /^version:\s*(.+)$/m.exec(content)?.[1]?.trim()
  const releaseDate = /^releaseDate:\s*['"]?([^'"\n]+)/m.exec(content)?.[1]?.trim()
  const files = []
  const fileBlocks = content.split(/^[ \t]*-[ \t]+url:[ \t]*/m).slice(1)
  for (const block of fileBlocks) {
    const lines = block.split('\n')
    const url = lines[0].trim()
    const sha512 = /sha512:\s*(.+)/.exec(block)?.[1]?.trim()
    const size = /size:\s*(\d+)/.exec(block)?.[1]?.trim()
    if (url && sha512) {
      files.push({ url, sha512, size: size ? Number(size) : undefined })
    }
  }
  return { version, releaseDate, files }
}

function mergeMacFeed(artifactsDir) {
  const arm64Path = path.join(artifactsDir, 'macos-arm64', 'latest-mac.yml')
  const x64Path = path.join(artifactsDir, 'macos-x64', 'latest-mac.yml')

  let arm64Data = { files: [] }
  let x64Data = { files: [] }

  if (fs.existsSync(arm64Path)) {
    arm64Data = parseYml(fs.readFileSync(arm64Path, 'utf8'))
  }
  if (fs.existsSync(x64Path)) {
    x64Data = parseYml(fs.readFileSync(x64Path, 'utf8'))
  }

  const allFiles = [...arm64Data.files]
  for (const f of x64Data.files) {
    if (!allFiles.some((existing) => existing.url === f.url)) {
      allFiles.push(f)
    }
  }

  if (allFiles.length === 0) {
    console.log('[merge-mac-feed] No latest-mac.yml found in artifacts.')
    return
  }

  const version = arm64Data.version || x64Data.version
  const releaseDate = arm64Data.releaseDate || x64Data.releaseDate || new Date().toISOString()

  let out = `version: ${version}\nfiles:\n`
  for (const f of allFiles) {
    out += `  - url: ${f.url}\n`
    out += `    sha512: ${f.sha512}\n`
    if (f.size) out += `    size: ${f.size}\n`
  }
  out += `path: ${allFiles[0].url}\n`
  out += `sha512: ${allFiles[0].sha512}\n`
  out += `releaseDate: '${releaseDate}'\n`

  const targetDir = path.join(artifactsDir, 'merged-feed')
  fs.mkdirSync(targetDir, { recursive: true })
  const outPath = path.join(targetDir, 'latest-mac.yml')
  fs.writeFileSync(outPath, out, 'utf8')
  console.log(`[merge-mac-feed] Merged ${allFiles.length} files into ${outPath}`)
}

const dir = process.argv[2] || 'artifacts'
mergeMacFeed(path.resolve(process.cwd(), dir))
