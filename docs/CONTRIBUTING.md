# CONTRIBUTING.md — Hướng dẫn Đóng góp Phát triển VuaOffice

> **Tài liệu Hướng dẫn Dành cho Cộng đồng & Nhà phát triển (Contribution Guidelines)**  
> **Chủ quản**: 360 CORP  
> **Phiên bản**: v0.6.7+

---

## 1. Cơ chế Quản lý Mã nguồn & Luồng Đóng góp (Repository & Branching Model)

Mã nguồn **VuaOffice** được quản lý đồng thời trên 2 nền tảng:

1. **GitLab (`origin`)**: Máy chủ phát triển nội bộ chính thức (Private Repository), lưu trữ toàn bộ lịch sử commit chi tiết, các nhánh tính năng (`feat/*`), sửa lỗi (`fix/*`) và tài liệu nội bộ.
2. **GitHub (`github`)**: Bản phân phối mở công khai (Public Repository) dành cho cộng đồng, tiếp nhận Issues, Discussions và Pull Requests.

### Quy trình Xử lý Pull Requests (PR Workflow)
- Các Pull Request từ cộng đồng trên GitHub luôn được hoan nghênh và đánh giá kỹ lưỡng.
- Sau khi một PR được Review và chấp thuận:
  - Maintainer của 360 CORP sẽ tích hợp thay đổi vào cây mã nguồn chính trên GitLab với đầy đủ thông tin ghi nhận tác giả qua trailer: `Authored-By: <Tên Tác Giả> <email>`.
  - Thay đổi sẽ được đồng bộ trở lại GitHub qua các snapshot commit hoặc bản phát hành chính thức tiếp theo.

---

## 2. Cấu trúc Dự án (Monorepo Layout)

- `apps/*`: 6 ứng dụng văn phòng cốt lõi và Shell Host (Docs, Sheets, Slides, PDF, Markdown, Mail, Shell). Mỗi app là một npm workspace hoàn chỉnh gồm `src/main` (Electron Main Process), `src/renderer` (React UI), và `tests/`.
- `packages/*`: 13 thư viện dùng chung thuần TypeScript (không phụ thuộc Electron, có unit tests độc lập): lõi phân tích docx/pptx, bộ render HarfBuzz, agent core, ai-provider, i18n, UI tokens kit.
- `apps/sheets/native/xlsx-engine`: Engine xử lý bảng tính hiệu năng cao viết bằng **Rust**, chạy dưới dạng tiến trình sidecar độc lập.
- `whitelabel/*`: Cấu hình định danh thương hiệu `brand-config.json` và bộ tài nguyên đồ họa (Icons, SVG Logos).
- `scripts/*`: Kịch bản tự động hóa (`whitelabel.js`, scripts đồng bộ git, word fidelity tests).
- `docs/*`: Toàn bộ hệ thống tài liệu kiến trúc, đặc tả, yêu cầu và hướng dẫn chi tiết theo chuẩn 8 bước của 360 CORP.

---

## 3. Thiết lập Môi trường Phát triển Cục bộ (Getting Started)

### Yêu cầu Tiên quyết (Prerequisites)
- **Node.js**: Phiên bản `>= 22.12.0`
- **NPM**: Phiên bản `>= 10.0.0`
- **Rust Toolchain**: `cargo` và `rustc` trên PATH hệ thống (phục vụ biên dịch `xlsx-engine`)

### Các bước khởi chạy
```bash
# 1. Cài đặt toàn bộ dependencies trong monorepo
npm install

# 2. Sinh các fixtures mẫu phục vụ kiểm thử OpenXML DOCX (chạy lần đầu)
npm run fixtures

# 3. Áp dụng nhận diện thương hiệu VuaOffice
npm run whitelabel:apply

# 4. Khởi chạy toàn bộ ứng dụng và Shell chính với Vite Dev Server
npm run dev
```

---

## 4. Các Tiêu chuẩn Kiểm tra Bắt buộc Trước khi Commit (Quality Gates)

Mọi thay đổi trước khi tạo PR hoặc commit vào hệ thống bắt buộc phải vượt qua các bài kiểm tra tự động:

```bash
# 1. Kiểm tra định dạng code (Prettier)
npm run format:check

# 2. Kiểm tra lỗi cú pháp và chuẩn linting (ESLint - yêu cầu 0 lỗi)
npm run lint

# 3. Kiểm tra kiểu dữ liệu TypeScript (Toàn bộ 19 workspaces)
npm run typecheck

# 4. Chạy toàn bộ Unit Tests (Engine & Apps, bao gồm cả Rust Sidecar tests)
npm test

# 5. Kiểm tra tính hợp lệ của giấy phép các thư viện bên thứ ba
npm run licenses

# 6. Kiểm tra việc tuân thủ Semantic Theme Tokens trong CSS
node tools/check-theme-colors.mjs
```

---

## 5. Quy chuẩn Viết Code & Đặt tên Commit (Conventions)

### 5.1 Quy chuẩn Code (Coding Standards)
- **TypeScript**: Áp dụng triệt để type an toàn; tuyệt đối tránh dùng kiểu `any` khi có thể định nghĩa type/interface cụ thể.
- **Bất biến (Immutability)**: Luôn tạo object/array mới khi cập nhật state (`...spread`), không mutate trực tiếp dữ liệu gốc.
- **Semantic Theme Tokens**: Tuyệt đối không viết mã màu thô `#hex` trong CSS renderer; luôn sử dụng các biến `var(--surface)`, `var(--text)`, `var(--hover)` từ `packages/ui/src/tokens.css`.
- **Đa ngôn ngữ (i18n)**: Mọi chuỗi ký tự hiển thị trên giao diện người dùng phải thông qua tài nguyên i18n (`src/renderer/i18n/` hoặc `tMain` trong main process).

### 5.2 Định dạng Commit Message (Conventional Commits)
Sử dụng cấu trúc chuẩn:
```text
<type>(<scope>): <mô tả ngắn gọn bằng thể mệnh lệnh>

<nội dung chi tiết nếu có>

Authored-By: 360org <support@360.org.vn>
```
*Các type hợp lệ:* `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.

---

## 6. Đóng gói & Build Bộ Cài đặt (Packaging)

Để kiểm tra việc đóng gói bộ cài đặt:
```bash
# Build bộ cài đặt cho macOS (.dmg và .zip)
npm run dist:mac

# Build bộ cài đặt cho Windows (.exe NSIS installer)
npm run dist:win

# Build bộ cài đặt cho Linux (.AppImage và .deb)
npm run dist:linux
```

---

## 7. Quy tắc Ứng xử & Bản quyền (Code of Conduct & License)

- Toàn bộ cộng đồng tham gia phát triển tuân thủ theo [Contributor Covenant](CODE_OF_CONDUCT.md).
- Mã nguồn VuaOffice được phát hành theo giấy phép mã nguồn mở **Apache License 2.0**. Khi bạn đóng góp mã nguồn vào dự án, bạn đồng ý cấp phép đóng góp đó theo điều khoản của Apache 2.0.

---

**Chủ quản**: 360 CORP  
**Trạng thái**: Đã phê duyệt (Approved)  
**Ngày cập nhật**: 2026-08-16
