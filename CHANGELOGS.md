# CHANGELOGS.md — Nhật ký Phát triển VuaOffice Whitelabel

Tất cả các thay đổi đáng chú ý đối với dự án whitelabel VuaOffice sẽ được ghi lại trong tài liệu này.
Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/) và dự án này tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
