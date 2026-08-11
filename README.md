# VuaOffice (Bộ ứng dụng văn phòng AI 360 CORP)

> **Tài liệu chính thức dành cho Dự án VuaOffice (360 CORP)**  
> VuaOffice là bộ ứng dụng văn phòng tích hợp Trí tuệ nhân tạo (AI-Native Office Suite) dành cho macOS, Windows và Linux, được phát triển dựa trên dự án mã nguồn mở GenOffice theo Giấy phép Apache License 2.0.

---

## 🚀 Giới thiệu VuaOffice

VuaOffice bao gồm 5 ứng dụng làm việc cốt lõi trên nền tảng Electron với kiến trúc chia sẻ chung tầng Engine:

1. **VuaOffice Docs**: Trình soạn thảo văn bản `.docx` hỗ trợ AI patch theo đoạn, giữ nguyên bố cục ban đầu của tệp Word.
2. **VuaOffice Sheets**: Trình quản lý bảng tính `.xlsx` mở rộng trên nhân Univer, tích hợp engine Rust sidecar (calamine + IronCalc), biểu đồ Konva, Pivot Table và Slicer.
3. **VuaOffice Slides**: Trình trình chiếu `.pptx` hỗ trợ thiết kế slide, HarfBuzz text shaping và công cụ AI tạo nội dung.
4. **VuaOffice PDF**: Trình xem & chỉnh sửa tệp `.pdf` hỗ trợ chú thích, biểu mẫu, chữ ký số và phân tích nội dung qua AI.
5. **VuaOffice Shell**: Khung ứng dụng trung tâm quản lý tab, cài đặt tài khoản 360 CORP, AI Router và tự động cập nhật (Auto-Update).

---

## 📦 Tải về phiên bản mới nhất (Releases)

Tất cả các bản build phát hành được đóng gói và kiểm tra tự động qua GitHub Actions:

| Nền tảng                          | Yêu cầu hệ thống    | Tệp cài đặt                                                                                                         |
| :-------------------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------ |
| **macOS** (Apple Silicon `arm64`) | macOS 11+           | [VuaOffice-0.6.0-arm64.dmg](https://github.com/360org/vuaoffice/releases/latest/download/VuaOffice-0.6.0-arm64.dmg) |
| **macOS** (Intel `x64`)           | macOS 11+           | [VuaOffice-0.6.0.dmg](https://github.com/360org/vuaoffice/releases/latest/download/VuaOffice-0.6.0.dmg)             |
| **Windows** (x64)                 | Windows 10 / 11     | [VuaOffice.Setup.0.6.0.exe](https://github.com/360org/vuaoffice/releases/latest/download/VuaOffice.Setup.0.6.0.exe) |
| **Linux** (Debian / Ubuntu)       | x86_64, glibc 2.34+ | [vuaoffice_0.6.0_amd64.deb](https://github.com/360org/vuaoffice/releases/latest/download/vuaoffice_0.6.0_amd64.deb) |
| **Linux** (AppImage)              | x86_64, FUSE 2      | [VuaOffice-0.6.0.AppImage](https://github.com/360org/vuaoffice/releases/latest/download/VuaOffice-0.6.0.AppImage)   |

---

## 🔄 Quy trình Đồng bộ & Xử lý Conflict khi Pull từ Official Upstream

Để đảm bảo bộ ứng dụng **VuaOffice** luôn cập nhật các tính năng và bản sửa lỗi mới nhất từ dự án gốc (`genspark-ai/genoffice`) mà **KHÔNG BỊ ĐÈ** hoặc làm mất các tùy chỉnh thương hiệu & AI Provider của 360 CORP, nhà phát triển BẮT BUỘC tuân thủ quy trình sau:

### 1. Cơ chế Whitelabel độc lập (`scripts/whitelabel.js`)

Mọi cấu hình thương hiệu VuaOffice được lưu tập trung tại `whitelabel/brand-config.json`.

- Lệnh áp dụng branding: `node scripts/whitelabel.js apply`
- Lệnh hoàn tác về codebase gốc: `node scripts/whitelabel.js restore`

### 2. Các bước Pull & Merge không conflict

Khi cần đồng bộ code mới nhất từ upstream:

```bash
# Bước 1: Khai báo upstream (nếu chưa có) và fetch code mới nhất
git remote add upstream https://github.com/genspark-ai/genoffice.git 2>/dev/null || true
git fetch upstream main

# Bước 2: Kiểm tra khả năng conflict trước khi merge
git merge-tree $(git merge-base HEAD upstream/main) HEAD upstream/main

# Bước 3: Tiến hành Merge chính thức
git merge upstream/main -m "merge: sync latest official upstream code into main"

# Bước 4: Trong trường hợp có xung đột (conflict) ở các file UI/Brand:
# Ưu tiên giữ lại bản tùy chỉnh của VuaOffice cho các file giao diện gốc
git checkout --ours apps/shell/src/renderer/src/Home.tsx apps/shell/src/renderer/src/strings.ts

# Bước 5: Chạy lại công cụ Whitelabel để áp dụng lại toàn bộ nhận diện VuaOffice & AI Providers
node scripts/whitelabel.js apply

# Bước 6: Thêm thay đổi và hoàn tất commit merge
git add .
git commit -m "merge: resolved conflicts and reapplied VuaOffice whitelabel"
git push origin main
```

---

## 🧠 Cấu hình AI Provider (OmiRouter / 9Router / Custom)

VuaOffice hỗ trợ kết nối trực tiếp đến các AI Gateway của 360 CORP hoặc nhà cung cấp tùy chỉnh mà không phụ thuộc vào tài khoản Genspark mặc định:

- **OmiRouter AI**: Cấu hình mặc định với Base URL `https://api.omirouter.com/v1`
- **9Router AI**: Cấu hình với Base URL `https://api.9router.com/v1`
- **Custom Provider**: Cho phép người dùng tự nhập OpenAI-compatible Endpoint & API Key tùy chọn ngay tại màn hình **AI Settings** trong menu tài khoản.

---

## 🛠️ Hướng dẫn Phát triển Local (Development)

```bash
# Cài đặt phụ thuộc
npm install

# Tạo dữ liệu test .docx fixtures
npm run fixtures

# Kiểm tra TypeScript & Unit test
npm run typecheck
npm test

# Chạy ứng dụng dev ở môi trường local
npm run dev

# Đóng gói sản phẩm cho macOS / Windows / Linux
npm run dist:mac
npm run dist:win
npm run dist:linux
```

---

## ⚖️ Bản quyền & Ghi nhận (Attribution & License)

- **Mã nguồn**: VuaOffice được phát triển dựa trên dự án mã nguồn mở **GenOffice** tuân thủ theo [Apache License 2.0](LICENSE).
- **Ghi nhận tác giả (Attribution Notice)**:
  - **Original Work**: Copyright 2026 Mainfunc, Inc. (GenOffice).
  - **Derivative Work & Customizations**: Copyright 2026 360 CORP (VuaOffice).
- **Thương hiệu**: Nhãn hiệu "VuaOffice" và "360 CORP" thuộc sở hữu của 360 CORP. Nhãn hiệu "GenOffice" và "Genspark" thuộc sở hữu của Mainfunc, Inc.
