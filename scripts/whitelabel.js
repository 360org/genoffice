const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('[Whitelabel] Applying VuaOffice branding...');

// Patch electron-builder product name & id
const ebPath = path.join(__dirname, '../apps/shell/electron-builder.cjs');
if (fs.existsSync(ebPath)) {
  let eb = fs.readFileSync(ebPath, 'utf8');
  eb = eb.replace(/appId:s*'.*?'/, "appId: 'com.vuahethong.vuaoffice'");
  eb = eb.replace(/productName:s*'.*?'/, "productName: 'VuaOffice'");
  fs.writeFileSync(ebPath, eb, 'utf8');
}

// Copy icon & logo assets
const assetsDir = path.join(__dirname, '../whitelabel/assets');
const logoDir = path.join(__dirname, '../whitelabel/Logo');
const shellBuild = path.join(__dirname, '../apps/shell/build');
const shellAssets = path.join(__dirname, '../apps/shell/src/renderer/src/assets');

if (fs.existsSync(assetsDir) && fs.existsSync(shellBuild)) {
  ['icon.png', 'icon.icns', 'icon.ico'].forEach(icon => {
    if (fs.existsSync(path.join(assetsDir, icon))) {
      fs.copyFileSync(path.join(assetsDir, icon), path.join(shellBuild, icon));
      if (icon === 'icon.icns') fs.copyFileSync(path.join(assetsDir, icon), path.join(shellBuild, 'app.icns'));
      if (icon === 'icon.ico') fs.copyFileSync(path.join(assetsDir, icon), path.join(shellBuild, 'app.ico'));
    }
  });
}

if (fs.existsSync(logoDir) && fs.existsSync(shellAssets)) {
  ['vuaoffice-logo.svg', 'vuaoffice-icon.svg'].forEach(asset => {
    if (fs.existsSync(path.join(logoDir, asset))) {
      fs.copyFileSync(path.join(logoDir, asset), path.join(shellAssets, asset));
    }
  });
}

// Perform text replacements across all renderer files
const files = glob.sync('apps/**/src/renderer/**/*.{ts,tsx,html,css}', { cwd: path.join(__dirname, '..') });
files.forEach(rel => {
  const full = path.join(__dirname, '..', rel);
  let c = fs.readFileSync(full, 'utf8');
  let changed = false;

  if (c.includes('aria-label="Genspark"')) {
    c = c.replace(/aria-label="Genspark"/g, 'aria-label="VuaOffice AI"');
    changed = true;
  }
  if (c.includes('aria-label="Genspark AI"')) {
    c = c.replace(/aria-label="Genspark AI"/g, 'aria-label="VuaOffice AI"');
    changed = true;
  }
  if (c.includes('>Genspark<')) {
    c = c.replace(/>Genspark</g, '>VuaOffice AI<');
    changed = true;
  }
  if (c.includes("aiPanelTitle: 'Genspark'")) {
    c = c.replace(/aiPanelTitle:\s*'Genspark'/g, "aiPanelTitle: 'VuaOffice AI'");
    changed = true;
  }
  if (c.includes('aiPanelTitle: "Genspark"')) {
    c = c.replace(/aiPanelTitle:\s*"Genspark"/g, 'aiPanelTitle: "VuaOffice AI"');
    changed = true;
  }
  if (c.includes("ribbonAiAssistant: 'Genspark'")) {
    c = c.replace(/ribbonAiAssistant:\s*'Genspark'/g, "ribbonAiAssistant: 'VuaOffice AI'");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(full, c, 'utf8');
    console.log('[Whitelabel] Patched:', rel);
  }
});

console.log('[Whitelabel] Done!');

// Patch updater download page URL (main process)
const updaterPath = path.join(__dirname, '../apps/shell/src/main/updater.ts');
if (fs.existsSync(updaterPath)) {
  let u = fs.readFileSync(updaterPath, 'utf8');
  const oldUrl = 'https://github.com/genspark-ai/genoffice/releases/latest';
  if (u.includes(oldUrl)) {
    u = u.replace(oldUrl, 'https://github.com/360org/vuaoffice/releases/latest');
    fs.writeFileSync(updaterPath, u, 'utf8');
    console.log('[Whitelabel] Patched: updater download URL');
  }
}

// Patch repository URL in root package.json
const rootPkgPath = path.join(__dirname, '../package.json');
if (fs.existsSync(rootPkgPath)) {
  let rp = fs.readFileSync(rootPkgPath, 'utf8');
  if (rp.includes('genspark-ai/genoffice')) {
    rp = rp.replace(/genspark-ai\/genoffice/g, '360org/vuaoffice');
    fs.writeFileSync(rootPkgPath, rp, 'utf8');
    console.log('[Whitelabel] Patched: repository URL');
  }
}
