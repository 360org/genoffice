// Cổng kiểm tra thương hiệu (Brand Gate).
// ---------------------------------------------------------------------------
// Chặn mọi chuỗi thương hiệu upstream lọt vào bề mặt người dùng nhìn thấy.
// Đây là LƯỚI AN TOÀN CUỐI CÙNG sau mỗi lần merge upstream — thay cho cổng
// `grep -q "VuaOffice"` cũ, vốn luôn PASS kể cả khi whitelabel hỏng hoàn toàn.
//
//   node tools/check-brand.mjs
//
// Quy tắc đọc từ whitelabel/brand-config.json (nguồn chân lý duy nhất).
// Chú thích mã nguồn và định danh kỹ thuật trong `protected` được miễn trừ.
// Xem docs/WHITELABEL_STRATEGY.md §6.3.
import { readFileSync } from 'node:fs'
import { relative } from 'node:path'
import core from '../scripts/lib/brand-core.cjs'

const { ROOT, loadConfig, walkFiles, excludedRanges, overlaps, locate } = core

let cfg
try {
  cfg = loadConfig()
} catch (e) {
  console.error(`[Brand] LỖI: ${e.message}`)
  process.exit(2)
}

// --- Tầng 1: chuỗi upstream đã biết, lẽ ra whitelabel phải thay ------------
const known = cfg.replacements.filter((r) => r.from).map((r) => r.from)

// --- Tầng 2: phát hiện TRÔI DẠT --------------------------------------------
// Bắt các chuỗi thương hiệu upstream MỚI mà brand-config chưa khai báo (ví dụ
// upstream đặt tên module mới "GenOffice Whiteboard"). Không có tầng này, mỗi
// lần upstream thêm chuỗi là một lần rò rỉ âm thầm ra bản phát hành.
// Danh sách mẫu nằm trong brand-config.driftPatterns để chính sách có thể được
// rà soát trong code review, thay vì bị chôn trong mã công cụ.
const drift = (cfg.driftPatterns || [])
  .filter((d) => d.pattern)
  .map((d) => new RegExp(d.pattern, 'g'))

const violations = []

for (const full of walkFiles(cfg)) {
  const text = readFileSync(full, 'utf8')
  if (!text.includes(cfg.upstream.productName) && !text.includes(cfg.upstream.aiBrand)) continue

  const excluded = excludedRanges(text, cfg)
  const rel = relative(ROOT, full)
  const seen = new Set()

  const record = (index, matched, tier) => {
    const end = index + matched.length
    if (overlaps(index, end, excluded)) return
    if (seen.has(index)) return
    seen.add(index)
    const { line, column } = locate(text, index)
    violations.push({ rel, line, column, matched, tier })
  }

  // Tầng 1 — khớp chuỗi nguyên văn
  for (const from of known) {
    let idx = text.indexOf(from)
    while (idx !== -1) {
      record(idx, from, 1)
      idx = text.indexOf(from, idx + from.length)
    }
  }

  // Tầng 2 — khớp mẫu rộng, bỏ qua vị trí đã bắt ở tầng 1
  for (const re of drift) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(text)) !== null) {
      if (![...seen].some((i) => m.index >= i && m.index < i + 40)) record(m.index, m[0], 2)
      if (m.index === re.lastIndex) re.lastIndex++
    }
  }
}

// --- Báo cáo ---------------------------------------------------------------

if (violations.length === 0) {
  console.log('[Brand] ĐẠT — không có chuỗi thương hiệu upstream nào trên bề mặt người dùng.')
  process.exit(0)
}

violations.sort((a, b) => a.rel.localeCompare(b.rel) || a.line - b.line)

const t1 = violations.filter((v) => v.tier === 1)
const t2 = violations.filter((v) => v.tier === 2)

console.error(`[Brand] KHÔNG ĐẠT — phát hiện ${violations.length} rò rỉ thương hiệu\n`)

if (t1.length) {
  console.error(`── Tầng 1: chuỗi upstream đã biết (${t1.length}) ────────────────`)
  console.error('   Khắc phục: npm run whitelabel:apply\n')
  for (const v of t1) console.error(`   ${v.rel}:${v.line}:${v.column}  "${v.matched}"`)
  console.error('')
}

if (t2.length) {
  console.error(`── Tầng 2: TRÔI DẠT — chuỗi upstream mới chưa khai báo (${t2.length}) ──`)
  console.error('   Upstream đã thêm chuỗi thương hiệu mà brand-config.json chưa biết.')
  console.error('   Khắc phục: thêm cặp thay thế vào whitelabel/brand-config.json')
  console.error('   (hoặc thêm vào "protected" nếu là định danh kỹ thuật/tham chiếu')
  console.error('    dịch vụ bên thứ ba hợp lệ), rồi chạy npm run whitelabel:apply\n')
  for (const v of t2) console.error(`   ${v.rel}:${v.line}:${v.column}  "${v.matched}"`)
  console.error('')
}

console.error('Chi tiết quy trình: docs/WHITELABEL_STRATEGY.md')
process.exit(1)
