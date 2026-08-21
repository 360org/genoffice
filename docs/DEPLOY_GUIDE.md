# DEPLOY_GUIDE.md — Hướng dẫn Triển khai & Đóng gói VuaOffice

> **Tài liệu Hướng dẫn Triển khai, Đóng gói & Phát hành Sản phẩm (Deployment & Build Guide)**  
> **Tham chiếu từ**: [REQUIREMENTS.md](REQUIREMENTS.md) và [ARCH.md](ARCH.md)  
> **Chủ quản**: 360 CORP  
> **Phiên bản**: v1.0.0+

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
npm run dev:mail        # Chạy riêng AI Mail Client
```

---

## 3. Quy trình Kiểm thử Chất lượng Code (Quality Assurance)

Trước khi commit mã nguồn hoặc kích hoạt quy trình phát hành, bắt buộc chạy các lệnh kiểm tra:

```bash
# 0. CỔNG THƯƠNG HIỆU — bắt buộc, chạy đầu tiên.
#    selftest (luật song ánh) + status (đã apply đủ) + check-brand (0 rò rỉ).
#    Báo đỏ → DỪNG, xử lý theo docs/WHITELABEL_STRATEGY.md §8.
npm run brand:gate

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
*Artifacts được tạo tại thư mục `apps/shell/dist/`:*
- `VuaOffice-${version}-macOS-arm64.dmg` / `.zip` (Apple Silicon)
- `VuaOffice-${version}-macOS-x64.dmg` / `.zip` (Intel)

### 4.2 Đóng gói cho Windows (Setup EXE & Portable)
```bash
# Biên dịch và đóng gói trình cài đặt NSIS Setup cho Windows
npm run dist:win
```
*Artifacts được tạo tại `apps/shell/dist/`:*
- `VuaOffice-${version}-Windows-x64-Setup.exe`
- `VuaOffice-${version}-Windows-ia32-Setup.exe`
- `VuaOffice-${version}-Windows-Setup.exe` (bản gộp hai kiến trúc)

### 4.3 Đóng gói cho Linux (AppImage & DEB)
```bash
# Biên dịch và đóng gói cho Linux
npm run dist:linux
```
*Artifacts được tạo tại `apps/shell/dist/`:*
- `VuaOffice-${version}.AppImage`
- `vuaoffice_${version}_amd64.deb`
- `vuaoffice-${version}.x86_64.rpm`

---

## 5. Quy chuẩn Đặt tên File Phát hành (Release Artifact Naming Convention)

> **Nguồn chân lý là các khóa `artifactName` trong `apps/shell/electron-builder.cjs`.**
> Bảng dưới là ảnh chụp đúng những gì cấu hình đó sinh ra, đã đối chiếu với tài sản
> thực tế của bản phát hành v0.7.0 và v1.0.0. Ghi chú đầy đủ: [`RELEASE_PROTOCOL.md`](./RELEASE_PROTOCOL.md) §2.

| Hệ điều hành | Kiến trúc Phần cứng | Tên Tệp Phân phối Thực tế |
|---|---|---|
| **macOS** | Apple Silicon (M1/M2/M3/M4) | `VuaOffice-${version}-macOS-arm64.dmg` / `.zip` |
| **macOS** | Intel (Core i5/i7/i9/Xeon) | `VuaOffice-${version}-macOS-x64.dmg` / `.zip` |
| **Windows** | 64-bit (x64) | `VuaOffice-${version}-Windows-x64-Setup.exe` |
| **Windows** | 32-bit (ia32) | `VuaOffice-${version}-Windows-ia32-Setup.exe` |
| **Windows** | gộp hai kiến trúc | `VuaOffice-${version}-Windows-Setup.exe` |
| **Linux** | 64-bit AppImage | `VuaOffice-${version}.AppImage` |
| **Linux** | 64-bit Debian Package | `vuaoffice_${version}_amd64.deb` |
| **Linux** | 64-bit RPM Package | `vuaoffice-${version}.x86_64.rpm` |

---

## 6. Quy trình Phát hành Sản phẩm Chính thức (Release & Publish Workflow)

> 📕 **Quy chế bắt buộc, đầy đủ: [`RELEASE_PROTOCOL.md`](./RELEASE_PROTOCOL.md)**
> Bảng kiểm 9 bước, 6 điều cấm và mẫu báo cáo nằm ở đó. Phần dưới chỉ tóm tắt kỹ thuật.

1. **Tuyệt đối KHÔNG tự động build khi commit/push lên `main`**: Mọi commit đẩy lên nhánh `main` chỉ lưu trữ lịch sử mã nguồn.
2. **🛑 Release CHỈ kích hoạt khi Sếp yêu cầu trực tiếp và rõ ràng.** Vừa xong tính năng,
   CI đang xanh, hay commit đã lên `main` đều **KHÔNG** phải lệnh phát hành. Không chắc → HỎI LẠI.
3. **Trình tự bắt buộc, không được bỏ bước:**
   - **Bước 1 — Nhánh sạch**: đang ở `main`, `git status --porcelain` rỗng.
   - **Bước 2 — CỔNG THƯƠNG HIỆU** (báo đỏ là DỪNG phát hành):
     ```bash
     npm run brand:gate      # selftest + status + check-brand
     ```
   - **Bước 3 — Cổng chất lượng**:
     ```bash
     npm run lint && npm run typecheck && npm test
     ```
   - **Bước 4 — Bump version đồng bộ ở CẢ hai tệp** (đường dẫn tương đối gốc kho mã):
     - `package.json`
     - `apps/shell/package.json`

     > ⚠️ `release.yml` xác thực tag khớp **chính xác** `apps/shell/package.json`.
     > Lệch nhau là build hỏng ngay job đầu tiên.
   - **Bước 5 — Commit**: `chore(release): bump version to vX.Y.Z`
   - **Bước 6 — Tạo và đẩy tag**:
     ```bash
     git tag vX.Y.Z
     git push origin main && git push origin vX.Y.Z
     # Nếu kho mã cấu hình đa remote, đẩy tag lên cả remote `github`.
     ```
   - **Bước 7 — Theo dõi build tới khi kết thúc.** Tag `v*` kích hoạt `release.yml` với 6 job
     song song. Cấm đẩy tag rồi bỏ đó; build đỏ phải báo cáo Sếp kèm log lỗi.
   - **Bước 8 — Xác minh tên artifact** đúng quy ước tại
     [GitHub Releases](https://github.com/360org/vuaoffice/releases).
4. **Cấm tag lại cùng một số phiên bản.** Build hỏng → sửa lỗi, bump số mới, tag mới —
   người dùng có thể đã tải bản cũ.

---

## 7. Quy trình Đồng bộ với Upstream (Upstream Synchronization)

> 📕 **Quy chế bắt buộc, đầy đủ: [`WHITELABEL_STRATEGY.md`](./WHITELABEL_STRATEGY.md) §7**

**Bước 0 — Thiết lập máy (CHẠY MỘT LẦN duy nhất mỗi máy):**

```bash
npm run upstream:setup
```

> ⚠️ **CỰC KỲ QUAN TRỌNG**: lệnh này thêm remote `upstream` và **đăng ký merge driver `ours`**.
> Git **KHÔNG** tự kích hoạt merge driver khi clone. Thiếu bước này, toàn bộ khai báo
> `merge=ours` trong `.gitattributes` **IM LẶNG không có tác dụng** — trong khi cả nhóm
> tin rằng thương hiệu đang được bảo vệ.

Khi upstream `genspark-ai/genoffice` có các cải tiến công nghệ mới:

1. **Khôi phục Codebase Gốc** để Git merge 3 chiều tối ưu:
   ```bash
   npm run whitelabel:restore
   ```
2. **Kéo mã nguồn mới qua NHÁNH ĐỒNG BỘ RIÊNG** — 🚫 **CẤM merge thẳng vào `main`**:
   ```bash
   git fetch upstream
   git checkout -b sync/upstream-$(date +%Y%m%d)
   git merge upstream/main
   ```
3. **Áp dụng lại Thương hiệu VuaOffice**:
   ```bash
   npm run whitelabel:apply
   ```
4. **Kiểm thử Tính toàn vẹn** — cổng thương hiệu chạy TRƯỚC:
   ```bash
   npm run brand:gate       # bắt rò rỉ + chuỗi upstream mới chưa khai báo
   npm run typecheck && npm test
   ```
   > `brand:check` Tầng 2 báo chuỗi mới là **bình thường** sau mỗi lần đồng bộ — upstream vừa
   > thêm chuỗi thương hiệu mà `brand-config.json` chưa biết. Phân loại theo cây quyết định
   > `WHITELABEL_STRATEGY.md §4`, rồi thêm vào `replacements` hoặc `protected` (kèm `reason`).
5. **Mở Pull Request để rà soát.** Không tự merge vào `main`.

---

**Chủ quản**: 360 CORP  
**Trạng thái**: Đã phê duyệt (Approved)  
**Ngày cập nhật**: 2026-08-16
