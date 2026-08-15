# CHANGELOGS.md — Nhật ký Phát triển VuaOffice Whitelabel

Tất cả các thay đổi đáng chú ý đối với dự án whitelabel VuaOffice sẽ được ghi lại trong tài liệu này.
Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/) và dự án này tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.7] - 2026-08-15

### Added
- **Kiểm tra Cập nhật Thủ công (Manual Check for Updates)**:
  - Bổ sung hàm `checkForUpdatesManual()` trong `apps/shell/src/main/updater.ts` với hộp thoại phản hồi trực quan (phân biệt bản dev và production release, thông báo khi đã ở bản mới nhất hoặc lỗi mạng).
  - Tích hợp mục "Check for Updates…" vào Menu hệ thống: macOS Application Menu (ngay dưới `About VuaOffice`) và menu `Help` trên Windows/Linux.
  - Tích hợp nút "Check for Updates…" vào Account dropdown menu tại màn hình chính `Home.tsx`.
- **Hỗ trợ Nhà cung cấp AI Hermes Agent**:
  - Bổ sung provider `hermes` với endpoint mặc định `https://hermes.vuahethong.com/v1` trong `@genoffice/ai-provider`.

### Changed
- **Đồng bộ Tài nguyên Icon & Logo Thương hiệu VuaOffice**:
  - Chuẩn hoá toàn bộ icon ứng dụng từ `whitelabel/Logo/vuaoffice-icon.svg` và `whitelabel/Logo/Vua Office Icon.png`.
  - Tạo lại bộ icon native macOS đa độ phân giải (`whitelabel/assets/icon.icns`), Windows (`whitelabel/assets/icon.ico`) và PNG assets (`whitelabel/assets/icon.png`, `whitelabel/assets/app-icon.png`).
  - Đồng bộ icon vector và raster sang toàn bộ các app con (`apps/docs`, `apps/sheets`, `apps/slides`, `apps/pdf`, `apps/markdown`, `apps/shell`).
- **Tối ưu Cấu hình Developer Mode**:
  - Di chuyển tuỳ chọn "Enable Developer Mode" sang menu `Help > Troubleshooting > Enable Developer Mode` dạng checkbox.
  - Đồng bộ trạng thái developer mode theo thời gian thực giữa Main process và Renderer qua IPC (`app:developer-mode-changed`).

### Fixed
- Sửa lỗi thiếu import biến toàn cục `webContents` trong `apps/docs/src/main/docs-main.ts`, `apps/sheets/src/main/sheets-main.ts` và `apps/slides/src/main/ai-ipc.ts`.
- Sửa URL auto-update fallback download từ `genspark-ai/genoffice` sang `360org/vuaoffice`.

## [0.6.6] - 2026-08-15

### Fixed
- Sửa URL auto-update fallback download từ `genspark-ai/genoffice` sang `360org/vuaoffice` — app cũ đang tải bản cập nhật từ repo sai.
- Sửa URL repository trong root `package.json` về đúng `360org/vuaoffice`.
- Thêm rule whitelabel tự động vá URL updater và repository khi chạy `whitelabel apply`.

## [0.6.5] - 2026-08-14

### Changed
- Sửa slogan welcome màn hình chính thành "The 100% Free Office Suite with Native AI & Agentic Workflows".
- Di chuyển nút "Enable Developer Mode" sang menu Help > Troubleshooting.
- Cập nhật quy chuẩn đồng bộ git-sync: Tự động hoá việc tạo Publish Release và push tag lên GitHub.

### Fixed
- Sửa lỗi không lưu được cài đặt AI do thiếu thuộc tính `developerMode` trong Zod validation schema của backend.
- Sửa lỗi Settings modal không tự động đóng sau khi bấm Save.
- Sửa lỗi CI/CD build fail do thiếu `npm ci` trước khi chạy whitelabel verify trong GitHub Actions.

## [0.6.1] - 2026-08-11

### Fixed
- Sửa lỗi khởi động app (IPC handler exception) do thiếu channel `HOME_CHANNELS`.
- Cập nhật chứng chỉ Apple Codesign & Notarization chính thức cho bản build macOS.
- Đổi tên mục Cài đặt AI thành **Settings** với icon bánh răng.

## [0.6.0] - 2026-08-11

### Changed
- Cập nhật toàn bộ giao diện Ribbon UI (Docs, Sheets, Slides, Markdown) từ "Genspark AI" thành "VuaOffice AI".
- Thêm VuaOffice Mail (thay thế Microsoft Office 365 Outlook) vào lộ trình sản phẩm trong `README.md`.
- Sửa lỗi đặt tên file gói Linux `.deb` và `packageName` trong `electron-builder.cjs` và `whitelabel.js` từ `genoffice` thành `vuaoffice`.

## [0.1.0] - 2026-08-10

### Added
- Khởi tạo thư mục `whitelabel` chứa file cấu hình `brand-config.json` và các assets logo, icon thương hiệu VuaOffice.
- Thêm CLI script `scripts/whitelabel.js` quản lý chu kỳ rebrand:
  - `apply`: Vá các file cấu hình build, thay thế text strings bằng regex, copy assets.
  - `restore`: Khôi phục codebase gốc qua git.
- Tích hợp 2 nhà cung cấp AI mới `omirouter` và `ninerouter` vào hệ thống core `@genoffice/ai-provider`:
  - Định nghĩa ID trong `packages/ai-provider/src/types.ts`.
  - Cấu hình metadata, default model, default Base URL, và đặt default provider là `omirouter` trong `packages/ai-provider/src/providers.ts`.
  - Định tuyến stream AI qua chuẩn OpenAI tương thích trong `packages/ai-provider/src/stream.ts`.
- Tạo 7 tài liệu kỹ thuật bắt buộc theo chuẩn dev software:
  - `IDEA.md`: Mô tả ý tưởng rebrand VuaOffice và AI Router.
  - `REQUIREMENTS.md`: Yêu cầu chi tiết chức năng và phi chức năng.
  - `SPEC.md`: Đặc tả kỹ thuật chi tiết của engine và API integration.
  - `ARCH.md`: Sơ đồ kiến trúc Mermaid và Git workflow.
  - `DEPLOY_GUIDE.md`: Hướng dẫn thiết lập, dev, build và update code.
  - `CHANGELOGS.md`: Nhật ký phát triển này.

### Changed
- Sửa đổi CLI script `scripts/whitelabel.js` để tự động khôi phục (restore) toàn bộ các file được cấu hình động trong danh sách `textReplacements` thay vì chỉ khôi phục các file được định nghĩa tĩnh.

### Fixed
- Sửa lỗi thiếu module `@tiptap/extension-highlight` trong môi trường phát triển bằng cách chạy cài đặt node_modules và cấu hình import chính xác cho module Markdown.

---

**Trạng thái phiên bản:** Hoàn thành & Xác minh
**Ngày phát hành:** 2026-08-10
