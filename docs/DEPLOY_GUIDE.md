# DEPLOY_GUIDE.md — Hướng dẫn Triển khai & Đóng gói VuaOffice

> **Tài liệu Hướng dẫn Triển khai, Đóng gói & Phát hành Sản phẩm (Deployment & Build Guide)**  
> **Tham chiếu từ**: [REQUIREMENTS.md](REQUIREMENTS.md) và [ARCH.md](ARCH.md)  
> **Chủ quản**: 360 CORP  
> **Phiên bản**: v0.6.7+

---

## 1. Yêu cầu Môi trường Phát triển (Prerequisites)

Để thiết lập môi trường và đóng gói ứng dụng **VuaOffice Suite**, máy trạm cần cài đặt:

- **Node.js**: Phiên bản `>= 22.12.0` (LTS khuyến nghị).
- **NPM**: Phiên bản `>= 10.0.0`.
- **Rust Toolchain**: `cargo` và `rustc` trên PATH hệ thống (phục vụ biên dịch engine tính toán `apps/sheets/native/xlsx-engine`).
- **Git**: Quản lý phiên bản và hỗ trợ cơ chế Whitelabel Sync 2 Remote.
- **Công cụ Đóng gói Hệ điều hành**:
  - **macOS**: Cài đặt Xcode Command Line Tools (`xcode-select --install`).
  - **Windows**: Visual Studio C++ Build Tools hoặc MinGW-w64 toolchain (nếu cross-compile).
  - **Linux**: Các gói thư viện cơ bản (`libgtk-3-dev`, `libnotify-dev`, `libgconf2-4`, `libnss3`, `libasound2`).

---

## 2. Quy trình Cài đặt & Khởi chạy Cục bộ (Local Development)

### 2.1 Cài đặt Thư viện Phụ thuộc
```bash
# Cài đặt toàn bộ dependencies trong monorepo
npm install

# Khởi tạo các fixtures mẫu phục vụ kiểm thử OpenXML DOCX (chạy lần đầu)
npm run fixtures
```

### 2.2 Áp dụng Nhận diện Thương hiệu VuaOffice
Trước khi chạy hoặc build ứng dụng, chạy lệnh tự động hóa:
```bash
npm run whitelabel:apply
```
*Lệnh này sẽ tự động cập nhật cấu hình electron-builder, sao chép icon/logo chính thức vào thư mục assets của Shell và thay thế các từ khóa thương hiệu.*

### 2.3 Khởi chạy Môi trường Phát triển (Dev Mode)
```bash
# Khởi chạy toàn bộ ứng dụng và Shell chính với Vite Dev Server
npm run dev

# Hoặc khởi chạy riêng lẻ từng ứng dụng con:
npm run dev:docs        # Chạy riêng VuaOffice Docs
npm run dev:sheets      # Chạy riêng VuaOffice Sheets
npm run dev:slides      # Chạy riêng VuaOffice Slides
npm run dev:pdf         # Chạy riêng VuaOffice PDF
npm run dev:markdown    # Chạy riêng VuaOffice Markdown
npm run dev:mail        # Chạy riêng VuaMail Client
```

---

## 3. Quy trình Kiểm thử Chất lượng Code (Quality Assurance)

Trước khi commit mã nguồn hoặc kích hoạt quy trình phát hành, bắt buộc chạy các lệnh kiểm tra:

```bash
# 1. Kiểm tra định dạng code (Prettier)
npm run format:check

# 2. Kiểm tra lỗi cú pháp và chuẩn linting (ESLint)
npm run lint

# 3. Kiểm tra kiểu dữ liệu TypeScript trên toàn bộ 19 workspaces
npm run typecheck

# 4. Chạy toàn bộ Unit Tests (Engine & Apps)
npm test

# 5. Kiểm tra tính hợp lệ của giấy phép các thư viện bên thứ ba
npm run licenses

# 6. Kiểm tra việc tuân thủ Semantic Theme Tokens trong CSS
node tools/check-theme-colors.mjs
```

---

## 4. Quy trình Đóng gói Ứng dụng Cục bộ (Local Build)

### 4.1 Đóng gói cho macOS (Apple Silicon & Intel)
```bash
# Biên dịch và đóng gói bộ cài đặt .dmg và .zip cho macOS
npm run dist:mac
```
*Artifacts được tạo tại thư mục `/Volumes/DATA/DEV/vuaoffice/apps/shell/dist/`:*
- `VuaOffice-0.6.7-macOS-Apple-Silicon.dmg` (cho kiến trúc ARM64)
- `VuaOffice-0.6.7-macOS-Intel.dmg` (cho kiến trúc x64)

### 4.2 Đóng gói cho Windows (Setup EXE & Portable)
```bash
# Biên dịch và đóng gói trình cài đặt NSIS Setup cho Windows
npm run dist:win
```
*Artifacts được tạo tại `/Volumes/DATA/DEV/vuaoffice/apps/shell/dist/`:*
- `VuaOffice-0.6.7-Windows-x64-Setup.exe`
- `VuaOffice-0.6.7-Windows-x86-Setup.exe`

### 4.3 Đóng gói cho Linux (AppImage & DEB)
```bash
# Biên dịch và đóng gói cho Linux
npm run dist:linux
```
*Artifacts được tạo tại `/Volumes/DATA/DEV/vuaoffice/apps/shell/dist/`:*
- `VuaOffice-0.6.7.AppImage`
- `vuaoffice_0.6.7_amd64.deb`

---

## 5. Quy chuẩn Đặt tên File Phát hành (Release Artifact Naming Convention)

Để tránh gây nhầm lẫn cho người dùng cuối trên mọi nền tảng, tên tệp phát hành **BẮT BUỘC** tuân thủ định dạng chuẩn:

| Hệ điều hành | Kiến trúc Phần cứng | Tên Tệp Phân phối Chính thức |
|---|---|---|
| **macOS** | Apple Silicon (M1/M2/M3/M4) | `VuaOffice-${version}-macOS-Apple-Silicon.dmg` / `.zip` |
| **macOS** | Intel (Core i5/i7/i9/Xeon) | `VuaOffice-${version}-macOS-Intel.dmg` / `.zip` |
| **Windows** | 64-bit (x64) | `VuaOffice-${version}-Windows-x64-Setup.exe` |
| **Windows** | 32-bit (x86) | `VuaOffice-${version}-Windows-x86-Setup.exe` |
| **Linux** | 64-bit AppImage | `VuaOffice-${version}.AppImage` |
| **Linux** | 64-bit Debian Package | `vuaoffice_${version}_amd64.deb` |

---

## 6. Quy trình Phát hành Sản phẩm Chính thức (Release & Publish Workflow)

Quy trình phát hành bản phân phối mới tuân thủ nghiêm ngặt theo chỉ đạo của Sếp:

1. **Tuyệt đối KHÔNG tự động build khi commit/push lên `main`**: Mọi commit đẩy lên nhánh `main` chỉ lưu trữ lịch sử mã nguồn.
2. **Quy trình Release CHỈ kích hoạt khi Sếp yêu cầu tạo Release**:
   - **Bước 1**: Đồng bộ nâng version ở cả 2 tệp:
     - Root: `/Volumes/DATA/DEV/vuaoffice/package.json`
     - Shell: `/Volumes/DATA/DEV/vuaoffice/apps/shell/package.json`
   - **Bước 2**: Chạy `npm run whitelabel:apply` để cập nhật các định danh.
   - **Bước 3**: Commit thay đổi version với thông điệp `feat(release): bump version to x.y.z`.
   - **Bước 4**: Tạo Git Tag phiên bản tương ứng:
     ```bash
     git tag v0.6.7
     ```
   - **Bước 5**: Đẩy code và tag đồng thời lên cả GitLab và GitHub:
     ```bash
     # Đẩy lên GitLab Private
     git push origin main && git push origin v0.6.7

     # Đồng bộ bản phân phối sạch sang GitHub Public (qua bộ lọc bảo mật)
     bash /Volumes/DATA/DEV/SKILLS/git-sync-skills/scripts/git-sync-publish.sh
     git push github v0.6.7
     ```
   - **Bước 6**: GitHub Actions (`.github/workflows/release.yml`) tự động kích hoạt tiến trình đóng gói đa nền tảng và xuất bản trực tiếp lên mục [GitHub Releases](https://github.com/360org/vuaoffice/releases).

---

## 7. Quy trình Đồng bộ với Upstream (Upstream Synchronization)

Khi upstream `genspark-ai/genoffice` có các cải tiến công nghệ mới:

1. **Khôi phục Codebase Gốc (Restore Clean Codebase)**:
   ```bash
   npm run whitelabel:restore
   ```
2. **Kéo mã nguồn mới từ Upstream**:
   ```bash
   git fetch upstream
   git merge upstream/main
   ```
3. **Áp dụng lại Thương hiệu VuaOffice**:
   ```bash
   npm run whitelabel:apply
   ```
4. **Kiểm thử Tính toàn vẹn**:
   ```bash
   npm run typecheck
   npm test
   ```
5. **Commit và đẩy lên hệ thống GitLab/GitHub**.

---

**Chủ quản**: 360 CORP  
**Trạng thái**: Đã phê duyệt (Approved)  
**Ngày cập nhật**: 2026-08-16
