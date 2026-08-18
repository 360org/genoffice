import React, { useCallback, useMemo, useRef, useState } from 'react'

/**
 * Khung hiển thị nội dung HTML của email — CÁCH LY BẮT BUỘC.
 * ---------------------------------------------------------------------------
 * Nội dung email do người gửi kiểm soát hoàn toàn, nên nó KHÔNG BAO GIỜ được
 * đưa thẳng vào cây DOM của ứng dụng. Trước đây ReadingPane dùng
 * `dangerouslySetInnerHTML` với `body.html`, tạo ra hai lỗi:
 *
 *  1. XSS: một email chứa `<script>` hoặc thuộc tính sự kiện (`onerror`,
 *     `onload`…) chạy được mã tùy ý ngay trong tiến trình Renderer, nơi có
 *     quyền gọi các API mà preload công bố qua contextBridge.
 *  2. Rò rỉ CSS: thẻ `<style>` trong email áp lên TOÀN BỘ giao diện ứng dụng,
 *     cho phép người gửi đổi giao diện app của người nhận.
 *
 * Cách xử lý ở đây là cách ly bằng `<iframe sandbox>` thay vì lọc chuỗi:
 *
 *  - Thuộc tính `sandbox` KHÔNG chứa `allow-scripts`, nên trình duyệt chặn mọi
 *    dạng thực thi: thẻ `<script>`, thuộc tính sự kiện inline, và URL
 *    `javascript:`. Đây là chặn ở tầng trình duyệt, không phụ thuộc vào một bộ
 *    lọc chuỗi vốn luôn có nguy cơ bị vượt qua bằng biến thể mã hóa mới.
 *  - Không có `allow-forms`, `allow-popups`, `allow-top-navigation`: email
 *    không thể gửi biểu mẫu, mở cửa sổ, hay điều hướng cửa sổ chính đi nơi khác.
 *  - CSS của email bị giới hạn trong tài liệu của iframe, không chạm tới app.
 *
 * `allow-same-origin` được bật CÓ CHỦ ĐÍCH và an toàn ở đây: nó chỉ cho phép
 * khung cha đọc chiều cao nội dung để tự giãn khung. Cảnh báo kinh điển
 * "đừng kết hợp allow-same-origin với allow-scripts" chỉ áp dụng khi CẢ HAI
 * cùng bật — thiếu `allow-scripts` thì nội dung vẫn hoàn toàn trơ.
 *
 * ⚠️ Khi sửa tệp này: KHÔNG thêm `allow-scripts` vào danh sách sandbox. Thêm
 * vào là mở lại đúng lỗ hổng XSS mà nó sinh ra để bịt.
 */

/** Nền tài liệu email cố định theo chuẩn "dark chrome, white paper" (CLAUDE.md quy tắc 4). */
const FRAME_DOCUMENT_STYLE = `
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #242424;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      overflow-wrap: break-word;
    }
    img, table { max-width: 100%; }
    img { height: auto; }
  </style>
`

const MIN_HEIGHT = 120
const MAX_HEIGHT = 20000

interface EmailHtmlFrameProps {
  html: string
  title?: string
}

export const EmailHtmlFrame: React.FC<EmailHtmlFrameProps> = ({ html, title }) => {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(MIN_HEIGHT)

  const srcDoc = useMemo(() => `<!doctype html><html><head>${FRAME_DOCUMENT_STYLE}</head><body>${html}</body></html>`, [html])

  // Tự giãn theo chiều cao nội dung để người đọc không phải cuộn trong khung.
  // Bọc try/catch: nếu trình duyệt từ chối truy cập tài liệu iframe thì giữ
  // chiều cao mặc định thay vì làm hỏng cả khung đọc.
  const handleLoad = useCallback(() => {
    try {
      const doc = frameRef.current?.contentDocument
      if (!doc?.body) return
      const measured = Math.max(doc.body.scrollHeight, doc.documentElement?.scrollHeight ?? 0)
      if (measured > 0) setHeight(Math.min(Math.max(measured, MIN_HEIGHT), MAX_HEIGHT))
    } catch {
      // giữ nguyên chiều cao mặc định
    }
  }, [])

  return (
    <iframe
      ref={frameRef}
      className="reading-body-frame"
      title={title || 'Nội dung email'}
      // KHÔNG thêm `allow-scripts` — xem chú thích đầu tệp.
      sandbox="allow-same-origin"
      srcDoc={srcDoc}
      onLoad={handleLoad}
      style={{ width: '100%', height: `${height}px`, border: 'none', display: 'block' }}
    />
  )
}
