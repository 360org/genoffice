#!/usr/bin/env node
/**
 * Thiết lập máy trạm để đồng bộ upstream an toàn.
 * ---------------------------------------------------------------------------
 *   npm run upstream:setup
 *
 * Làm hai việc mà KHÔNG có chúng thì cơ chế chống ghi đè vô hiệu:
 *
 *  1. Thêm remote `upstream` (kho mã gốc) nếu chưa có.
 *
 *  2. Đăng ký merge driver `ours`. ĐÂY LÀ BƯỚC HAY BỊ BỎ QUÊN NHẤT:
 *     `.gitattributes` khai báo `merge=ours` cho tài sản thương hiệu, nhưng
 *     Git KHÔNG tự kích hoạt driver khi clone — nó phải được đăng ký trong
 *     config của TỪNG máy. Thiếu bước này, `.gitattributes` im lặng không có
 *     tác dụng và whitelabel vẫn bị ghi đè y như cũ, trong khi mọi người tin
 *     rằng đã được bảo vệ.
 *
 * Chạy lại nhiều lần vô hại (idempotent).
 */

const { execFileSync } = require('child_process')
const core = require('./lib/brand-core.cjs')

function git(args, { allowFail = false } = {}) {
  try {
    return execFileSync('git', args, { cwd: core.ROOT, encoding: 'utf8' }).trim()
  } catch (e) {
    if (allowFail) return null
    throw e
  }
}

let cfg
try {
  cfg = core.loadConfig()
} catch (e) {
  console.error(`[Upstream] LỖI: ${e.message}`)
  process.exit(1)
}

const upstreamUrl = `https://github.com/${cfg.upstream.repoSlug}.git`
let changed = 0

// --- 1. Remote upstream ----------------------------------------------------
const remotes = (git(['remote'], { allowFail: true }) || '').split('\n').filter(Boolean)

if (!remotes.includes('upstream')) {
  git(['remote', 'add', 'upstream', upstreamUrl])
  console.log(`[Upstream] ✓ Đã thêm remote 'upstream' -> ${upstreamUrl}`)
  changed++
} else {
  const current = git(['remote', 'get-url', 'upstream'], { allowFail: true })
  if (current !== upstreamUrl) {
    console.log(`[Upstream] ! remote 'upstream' đang trỏ tới: ${current}`)
    console.log(`[Upstream]   brand-config khai báo:          ${upstreamUrl}`)
    console.log(`[Upstream]   Sửa bằng: git remote set-url upstream ${upstreamUrl}`)
  } else {
    console.log(`[Upstream] ✓ remote 'upstream' đã đúng`)
  }
}

// --- 2. Merge driver `ours` ------------------------------------------------
const driver = git(['config', '--get', 'merge.ours.driver'], { allowFail: true })

if (driver !== 'true') {
  git(['config', 'merge.ours.driver', 'true'])
  console.log(`[Upstream] ✓ Đã đăng ký merge driver 'ours' (kích hoạt .gitattributes)`)
  changed++
} else {
  console.log(`[Upstream] ✓ merge driver 'ours' đã được đăng ký`)
}

// --- Tổng kết --------------------------------------------------------------
console.log(
  changed > 0
    ? `\n[Upstream] Hoàn tất — đã cấu hình ${changed} mục. Máy này đã sẵn sàng đồng bộ upstream.`
    : `\n[Upstream] Máy này đã được cấu hình đầy đủ, không cần thay đổi.`,
)
console.log('[Upstream] Quy trình đồng bộ bắt buộc: docs/WHITELABEL_STRATEGY.md §7')
