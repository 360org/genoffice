const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ROOT_DIR = path.resolve(__dirname, '..')
const CONFIG_PATH = path.join(ROOT_DIR, 'whitelabel', 'brand-config.json')

function log(msg) {
  console.log(`[Whitelabel] ${msg}`)
}

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`Config file not found at ${CONFIG_PATH}`)
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
}

function applyWhitelabel() {
  const config = readConfig()
  log(`Applying whitelabel branding for: ${config.appName}...`)

  // 1. Patch apps/shell/electron-builder.cjs
  const builderPath = path.join(ROOT_DIR, 'apps', 'shell', 'electron-builder.cjs')
  if (fs.existsSync(builderPath)) {
    let builderContent = fs.readFileSync(builderPath, 'utf8')
    builderContent = builderContent.replace(
      /productName:\s*'GenOffice'/g,
      `productName: '${config.appName}'`,
    )
    builderContent = builderContent.replace(
      /appId:\s*'com\.genoffice\.app'/g,
      `appId: '${config.appId}'`,
    )
    builderContent = builderContent.replace(
      /executableName:\s*'genoffice'/g,
      `executableName: '${config.executableName}'`,
    )
    fs.writeFileSync(builderPath, builderContent, 'utf8')
    log('Patched electron-builder.cjs')
  }

  // 2. Patch apps/shell/package.json
  const shellPkgPath = path.join(ROOT_DIR, 'apps', 'shell', 'package.json')
  if (fs.existsSync(shellPkgPath)) {
    let shellPkg = JSON.parse(fs.readFileSync(shellPkgPath, 'utf8'))
    shellPkg.productName = config.appName
    shellPkg.desktopName = `${config.executableName}.desktop`
    shellPkg.author = config.author
    fs.writeFileSync(shellPkgPath, JSON.stringify(shellPkg, null, 2) + '\n', 'utf8')
    log('Patched apps/shell/package.json')
  }

  // 3. Patch packages/ai-provider/src/types.ts
  const typesPath = path.join(ROOT_DIR, 'packages', 'ai-provider', 'src', 'types.ts')
  if (fs.existsSync(typesPath)) {
    let typesContent = fs.readFileSync(typesPath, 'utf8')
    if (!typesContent.includes('omirouter')) {
      typesContent = typesContent.replace(
        /export type AiProviderId = 'genspark' \| 'anthropic' \| 'gemini' \| 'deepseek' \| 'openai' \| 'openrouter' \| 'custom'/g,
        `export type AiProviderId = 'genspark' | 'anthropic' | 'gemini' | 'deepseek' | 'openai' | 'openrouter' | 'custom' | 'omirouter' | 'ninerouter'`,
      )
      fs.writeFileSync(typesPath, typesContent, 'utf8')
      log('Patched packages/ai-provider/src/types.ts')
    }
  }

  // 4. Patch packages/ai-provider/src/providers.ts
  const providersPath = path.join(ROOT_DIR, 'packages', 'ai-provider', 'src', 'providers.ts')
  if (fs.existsSync(providersPath)) {
    let providersContent = fs.readFileSync(providersPath, 'utf8')
    if (!providersContent.includes('omirouter')) {
      // Chèn omirouter & ninerouter vào AI_PROVIDERS array
      const providersPatch = `,
  {
    id: 'omirouter',
    label: 'OmiRouter AI',
    models: ['claude-3-5-sonnet', 'gpt-4o', 'gemini-1.5-pro', 'deepseek-chat'],
    defaultModel: 'claude-3-5-sonnet',
    keyPlaceholder: 'sk-or-...',
    needsBaseUrl: true,
  },
  {
    id: 'ninerouter',
    label: '9Router AI',
    models: ['claude-3-5-sonnet', 'gpt-4o', 'gemini-1.5-pro', 'deepseek-chat'],
    defaultModel: 'claude-3-5-sonnet',
    keyPlaceholder: 'sk-or-...',
    needsBaseUrl: true,
  }
];`
      providersContent = providersContent.replace(
        /needsBaseUrl:\s*true,?\s*\},?\s*\]/g,
        'needsBaseUrl: true,\n  }' + providersPatch,
      )

      // Chèn default baseUrl & default provider
      providersContent = providersContent.replace(
        /baseUrl:\s*meta\.needsBaseUrl\s*\?\s*''\s*:\s*undefined/g,
        `baseUrl: meta.needsBaseUrl ? (meta.id === 'omirouter' ? '${config.omirouterUrl}' : (meta.id === 'ninerouter' ? '${config.ninerouterUrl}' : '')) : undefined`,
      )

      providersContent = providersContent.replace(
        /return\s*\{\s*provider:\s*'genspark',\s*providers\s*\}/g,
        `return { provider: '${config.defaultProvider}', providers }`,
      )

      fs.writeFileSync(providersPath, providersContent, 'utf8')
      log('Patched packages/ai-provider/src/providers.ts')
    }
  }

  // 5. Patch packages/ai-provider/src/stream.ts
  const streamPath = path.join(ROOT_DIR, 'packages', 'ai-provider', 'src', 'stream.ts')
  if (fs.existsSync(streamPath)) {
    let streamContent = fs.readFileSync(streamPath, 'utf8')
    if (!streamContent.includes('omirouter')) {
      streamContent = streamContent.replace(
        /case 'custom':\s*if \(!config\.baseUrl\) throw new Error\('A custom provider requires a Base URL'\)\s*return streamOpenAiCompatible\(config\.baseUrl, config, system, messages, tools, maxTokens, cb\)/g,
        `case 'custom':
      if (!config.baseUrl) throw new Error('A custom provider requires a Base URL')
      return streamOpenAiCompatible(config.baseUrl, config, system, messages, tools, maxTokens, cb)
    case 'omirouter':
    case 'ninerouter':
      if (!config.baseUrl) throw new Error('A Base URL is required')
      return streamOpenAiCompatible(config.baseUrl, config, system, messages, tools, maxTokens, cb)`,
      )
      fs.writeFileSync(streamPath, streamContent, 'utf8')
      log('Patched packages/ai-provider/src/stream.ts')
    }
  }

  // 6. Thay thế text strings trong các file chỉ định
  if (config.textReplacements) {
    for (const entry of config.textReplacements) {
      for (const relativePath of entry.files) {
        const filePath = path.join(ROOT_DIR, relativePath)
        if (fs.existsSync(filePath)) {
          let fileContent = fs.readFileSync(filePath, 'utf8')
          for (const rule of entry.rules) {
            const re = new RegExp(rule.regex, 'g')
            fileContent = fileContent.replace(re, rule.to)
          }
          fs.writeFileSync(filePath, fileContent, 'utf8')
          log(`Applied text replacements in: ${relativePath}`)
        }
      }
    }
  }

  // 7. Thay thế Assets (logo, icons) nếu tồn tại trong whitelabel/assets
  const assetsDir = path.join(ROOT_DIR, 'whitelabel', 'assets')
  if (fs.existsSync(assetsDir)) {
    const copyAsset = (srcName, destPath) => {
      const srcPath = path.join(assetsDir, srcName)
      if (fs.existsSync(srcPath)) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true })
        fs.copyFileSync(srcPath, destPath)
        log(`Copied ${srcName} to ${path.relative(ROOT_DIR, destPath)}`)
      }
    }

    // Đè logo trong renderer của shell
    copyAsset(
      'logo.svg',
      path.join(
        ROOT_DIR,
        'apps',
        'shell',
        'src',
        'renderer',
        'src',
        'assets',
        'genoffice-logo.svg',
      ),
    )
    // Đè app icon của shell để build pack
    copyAsset('icon.png', path.join(ROOT_DIR, 'apps', 'shell', 'build', 'icon.png'))
    copyAsset('icon.icns', path.join(ROOT_DIR, 'apps', 'shell', 'build', 'icon.icns'))
    copyAsset('icon.ico', path.join(ROOT_DIR, 'apps', 'shell', 'build', 'icon.ico'))
    copyAsset('icon.png', path.join(ROOT_DIR, 'apps', 'shell', 'build', 'icon-mac.png'))
  }

  log('Whitelabel applied successfully!')
}

function restoreOfficial() {
  log('Restoring official GenOffice codebase...')

  // Danh sách các file bị thay đổi cấu trúc sẽ được hoàn tác qua git checkout
  const filesToRestore = [
    'apps/shell/electron-builder.cjs',
    'apps/shell/package.json',
    'packages/ai-provider/src/types.ts',
    'packages/ai-provider/src/providers.ts',
    'packages/ai-provider/src/stream.ts',
    'apps/shell/src/renderer/src/strings.ts',
    'apps/shell/src/renderer/src/assets/genoffice-logo.svg',
    'apps/shell/build/icon.png',
    'apps/shell/build/icon.icns',
    'apps/shell/build/icon.ico',
    'apps/shell/build/icon-mac.png',
  ]

  for (const f of filesToRestore) {
    const fullPath = path.join(ROOT_DIR, f)
    if (fs.existsSync(fullPath)) {
      try {
        execSync(`git checkout -- "${fullPath}"`, { stdio: 'ignore' })
        log(`Restored ${f}`)
      } catch (err) {
        log(`Failed to restore ${f} via git, file might not be modified or tracked.`)
      }
    }
  }

  log('Official codebase restored successfully!')
}

const command = process.argv[2]
if (command === 'apply') {
  applyWhitelabel()
} else if (command === 'restore') {
  restoreOfficial()
} else {
  console.log('Usage: node scripts/whitelabel.js [apply|restore]')
}
