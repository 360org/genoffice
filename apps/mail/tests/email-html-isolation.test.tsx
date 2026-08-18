import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeAll, describe, expect, it } from 'vitest'
import { EmailHtmlFrame } from '../src/renderer/src/components/detail/EmailHtmlFrame'

/**
 * Nội dung email do người gửi kiểm soát hoàn toàn. Bộ kiểm thử này khóa chặt
 * cơ chế cách ly để không ai vô tình mở lại lỗ hổng XSS đã từng tồn tại:
 * ReadingPane trước đây đưa `body.html` thẳng vào DOM ứng dụng qua
 * `dangerouslySetInnerHTML`, cho phép một email chạy mã tùy ý trong tiến trình
 * Renderer và đổi giao diện toàn ứng dụng bằng thẻ `<style>`.
 */

const MALICIOUS = `
  <p>xin chào</p>
  <script>window.__pwned = true</script>
  <img src="x" onerror="window.__pwned = true">
  <a href="javascript:window.__pwned=true">bấm vào đây</a>
  <style>body { display: none }</style>
`

const SRC_DIR = join(__dirname, '../src/renderer/src/components/detail')
const readSrc = (f: string) => readFileSync(join(SRC_DIR, f), 'utf8')

let markup: string
let host: HTMLElement
let frame: HTMLIFrameElement

beforeAll(() => {
  markup = renderToStaticMarkup(<EmailHtmlFrame html={MALICIOUS} />)
  // Cho trình duyệt phân tích thật thay vì chỉ so khớp chuỗi: nếu nội dung độc
  // thoát khỏi thuộc tính srcdoc, nó sẽ hiện ra thành phần tử thật ở đây.
  host = document.createElement('div')
  host.innerHTML = markup
  frame = host.querySelector('iframe')!
})

describe('cách ly nội dung HTML của email', () => {
  it('bọc nội dung trong iframe thay vì chèn vào DOM ứng dụng', () => {
    expect(frame).not.toBeNull()
    // React server-render giữ nguyên camelCase `srcDoc`; HTML không phân biệt
    // hoa thường nên trình duyệt vẫn nhận đúng thuộc tính srcdoc.
    expect(frame.getAttribute('srcdoc')).toBeTruthy()
  })

  it('KHÔNG cấp allow-scripts — đây là thứ vô hiệu hóa mọi mã trong email', () => {
    const sandbox = frame.getAttribute('sandbox')
    expect(sandbox).not.toBeNull()
    expect(sandbox).not.toContain('allow-scripts')
  })

  it('không cấp allow-forms / allow-popups / allow-top-navigation / allow-modals', () => {
    const sandbox = frame.getAttribute('sandbox') ?? ''
    for (const cap of ['allow-forms', 'allow-popups', 'allow-top-navigation', 'allow-modals']) {
      expect(sandbox).not.toContain(cap)
    }
  })

  it('mã độc không trở thành phần tử thật trong DOM của ứng dụng', () => {
    expect(host.querySelector('script')).toBeNull()
    expect(host.querySelector('style')).toBeNull()
    expect(host.querySelector('img')).toBeNull()
    expect(host.querySelector('a')).toBeNull()
    // Toàn bộ nội dung email nằm gọn bên trong thuộc tính srcdoc của iframe.
    expect(frame.getAttribute('srcdoc')).toContain('<script>window.__pwned = true</script>')
  })

  it('không có thuộc tính sự kiện inline nào lọt ra DOM ngoài', () => {
    for (const el of Array.from(host.querySelectorAll('*'))) {
      for (const attr of Array.from(el.attributes)) {
        expect(attr.name.startsWith('on')).toBe(false)
      }
    }
  })

  it('ReadingPane không còn dùng dangerouslySetInnerHTML', () => {
    // Bắt đúng lượt SỬ DỤNG (`dangerouslySetInnerHTML=`), không bắt phần chú
    // thích nhắc tới tên thuộc tính này.
    expect(readSrc('ReadingPane.tsx')).not.toContain('dangerouslySetInnerHTML=')
  })

  it('EmailHtmlFrame không khai báo allow-scripts ở bất kỳ đâu trong mã nguồn', () => {
    const sandboxAttr = /sandbox="([^"]*)"/.exec(readSrc('EmailHtmlFrame.tsx'))?.[1]
    expect(sandboxAttr).toBeDefined()
    expect(sandboxAttr).not.toContain('allow-scripts')
  })
})
