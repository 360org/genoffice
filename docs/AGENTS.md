# AGENTS.md — Quy chuẩn Tác tử AI & Lập trình trong VuaOffice

> **Tài liệu Hướng dẫn Dành cho AI Agents & Các Kỹ sư Tham gia Phát triển**  
> **Chủ quản**: 360 CORP  
> **Phiên bản**: v0.6.7+

---

## 1. Quy chuẩn Hệ thống Giao diện & Semantic Theme Tokens (Bắt buộc)

VuaOffice hỗ trợ 3 chế độ giao diện: **Light (Sáng)**, **Dark (Tối)**, và **System (Theo hệ điều hành)**. Cơ chế chuyển đổi theme sử dụng thuộc tính `data-theme` trên thẻ `<html>` và hệ thống biến CSS Custom Properties tại `packages/ui/src/tokens.css`.

### 1.1 Nguyên tắc Màu sắc Giao diện (UI Chrome Colors)
- **Tuyệt đối không dùng mã màu thô (`#hex`, `rgb()`, `hsl()`)** trong các file CSS của Renderer hoặc các inline styles của UI Chrome.
- **Bắt buộc tham chiếu các Semantic Tokens** từ `packages/ui/src/tokens.css`:
  - Bề mặt: `var(--surface)`, `var(--surface-subtle)`, `var(--bg-hover)`, `var(--border)`, `var(--border-subtle)`
  - Văn bản: `var(--text)`, `var(--text-primary)`, `var(--text-muted)`, `var(--text-disabled)`
  - Điểm nhấn: `var(--accent)`, `var(--accent-hover)`, `var(--accent-soft)`
- CI sẽ tự động kiểm tra và chặn commit nếu phát hiện mã màu thô (`tools/check-theme-colors.mjs`).

### 1.2 Nguyên tắc "Dark Chrome, White Paper" (Bảo toàn Dữ liệu Tài liệu)
- **Nội dung tài liệu KHÔNG BAO GIỜ đổi màu theo Theme hệ thống**:
  - Trang giấy soạn thảo Docs, các ô tính Sheets, bề mặt Slide trình chiếu, trang bitmap PDF, sơ đồ biểu đồ xuất bản, con dấu và WordArt là **dữ liệu tài liệu**.
  - Dữ liệu này phải giữ nguyên định dạng màu sắc tiêu chuẩn để hiển thị, in ấn và xuất bản ra ngoài đồng nhất 100% giữa các máy tính (giống như Microsoft Office: thanh công cụ tối, trang giấy trắng).

### 1.3 Canvas Chrome & Konva Constants Table
- Các thành phần điều khiển vẽ trên Canvas (khung chọn selection frames, thước căn guides, điểm neo handles) phải đọc từ bảng hằng số màu (`canvas-colors.ts`) dựa trên theme hiện tại, không viết cứng mã hex trong lệnh `ctx.draw()`.

---

## 2. Lưu ý Kỹ thuật khi Xây dựng & Biên dịch (Build Gotchas)

1. **Tiến trình Main Process của các App con (`apps/*/src/main`)**:
   - Mã nguồn main của các app con được đóng gói chung vào bản build của **Shell** (`apps/shell`).
   - Sau khi chỉnh sửa bất kỳ logic nào trong `apps/*/src/main`, **bắt buộc phải rebuild Shell** (`npm run build:shell` hoặc `npm run dev`) để thay đổi có hiệu lực.
2. **Preload Scripts trong Môi trường Phát triển (Dev Mode)**:
   - Thay đổi trong các file `preload.ts` đòi hỏi phải rebuild preload, nếu không trang Renderer sẽ bị trắng (blank screen).
3. **Phân phối Workspace Packages**:
   - Mọi workspace package nội bộ được khai báo trong `dependencies` của một app con phải được đưa vào danh sách `exclude` của `externalizeDepsPlugin`, nếu không ứng dụng đóng gói sẽ bị crash khi khởi động.
4. **Hệ thống Đa ngôn ngữ `useI18n()`**:
   - Hàm `t` trả về từ `useI18n()` không có tính ổn định tham chiếu (referentially stable). **Tuyệt đối không đưa `t` vào dependency array của `useEffect` hoặc `useCallback`**. Lưu key dịch và gọi `t(key)` tại thời điểm render.

---

## 3. Quy chuẩn Đóng gói Phát hành & Whitelabel (Release & Branding Rules)

1. **Tuyệt đối KHÔNG tự động build khi commit/push lên `main`**: Mọi commit đẩy lên `main` chỉ để lưu lịch sử mã nguồn. CI/Build runner tuyệt đối KHÔNG được phép tự động chạy trừ khi Sếp yêu cầu trực tiếp.
2. **Quy trình Release CHỈ thực hiện khi Sếp yêu cầu rõ ràng**: Chỉ khi Sếp gõ lệnh/yêu cầu trực tiếp (VD: *"release cho anh version 0.6.7"*, *"tạo release v0.6.7"*), AI mới tiến hành các bước:
   - Bump version ở cả 2 tệp: `package.json` & `apps/shell/package.json`.
   - Chạy `npm run whitelabel:apply`.
   - Commit code thay đổi version (`feat(release): bump version to 0.6.7`).
   - Tạo release tag `v*` và push tag lên remote (`git tag v0.6.7 && git push github v0.6.7`).
   - GitHub Actions mới được kích hoạt để build release artifacts đóng gói sản phẩm.
3. **Quy chuẩn Đặt tên File Release**:
   - macOS Apple Silicon: `VuaOffice-${version}-macOS-Apple-Silicon.dmg` / `.zip`
   - macOS Intel: `VuaOffice-${version}-macOS-Intel.dmg` / `.zip` (không thêm x64 vào tên macOS)
   - Windows x64: `VuaOffice-${version}-Windows-x64-Setup.exe`
   - Windows x86: `VuaOffice-${version}-Windows-x86-Setup.exe`
   - Linux: `VuaOffice-${version}.AppImage` / `vuaoffice_${version}_amd64.deb`
4. **Bảo toàn Tính toàn vẹn Thương hiệu VuaOffice**:
   - Logo Sidebar: Dùng logo/icon chính thức `/whitelabel/Logo/vuaoffice-logo.svg` hoặc `/whitelabel/Logo/vuaoffice-icon.svg` (28x28px).
   - Thanh Ribbon & Panel AI: Bắt buộc sử dụng tiêu đề "VuaOffice AI" và icon nhận diện VuaOffice AI, loại bỏ hoàn toàn các ký tự và icon Genspark cũ.
5. **Hạ tầng AI Settings & Developer Mode**:
   - **Chế độ Tiêu chuẩn (Normal Mode)**: Kết nối trực tiếp qua Gateway **OmiRouter** (`https://api.omirouter.com/v1`) hoặc **9Router** (`https://api.9router.com/v1`).
   - **Chế độ Nhà phát triển (Developer Mode)**: Bật/tắt qua menu hệ thống `Help > Troubleshooting > Enable Developer Mode`, hỗ trợ cấu hình Custom Endpoints và kết nối **Hermes Agent** (`https://hermes.vuahethong.com/v1`).

---

**Chủ quản**: 360 CORP  
**Trạng thái**: Đã phê duyệt (Approved)  
**Ngày cập nhật**: 2026-08-16
