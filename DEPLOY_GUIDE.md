# DEPLOY_GUIDE.md — Hướng dẫn Triển khai & Build VuaOffice

> Sinh từ [REQUIREMENTS.md](REQUIREMENTS.md).

Tài liệu này hướng dẫn chi tiết các bước thiết lập môi trường phát triển, áp dụng whitelabel thương hiệu và đóng gói ứng dụng **VuaOffice**.

## 1. Yêu cầu Môi trường (Prerequisites)

Để phát triển và build ứng dụng, máy tính của bạn cần được cấu hình các công cụ sau:
- **NodeJS**: Phiên bản `>= 22.12.0` (Khuyên dùng bản LTS mới nhất).
- **NPM**: Phiên bản `>= 10`.
- **Git**: Dùng để quản lý mã nguồn và thực thi tính năng rollback whitelabel.
- **Môi trường Build hệ điều hành**:
  - **macOS**: Cài đặt Xcode Command Line Tools (`xcode-select --install`).
  - **Windows**: Cài đặt build tools cần thiết của windows (nếu đóng gói cho Windows).

## 2. Hướng dẫn Phát triển & Áp dụng Thương hiệu (Whitelabel)

### Bước 2.1: Cấu hình biến số thương hiệu
Tất cả các thông tin về tên app, bundle ID, logo, icon, URL API được định nghĩa sẵn tại:
- Cấu hình: `whitelabel/brand-config.json`
- Assets đồ họa: `whitelabel/assets/`

Nếu bạn muốn thay đổi bất cứ thông tin gì, hãy chỉnh sửa trực tiếp các file này trước khi chạy CLI.

### Bước 2.2: Áp dụng thương hiệu VuaOffice
Chạy lệnh sau tại thư mục gốc dự án:
```bash
npm run whitelabel:apply
```
Lệnh này sẽ tự động:
1. Vá các file cấu hình build của Electron.
2. Sửa đổi các file chứa từ khóa GenOffice / Genspark sang VuaOffice / 360 CORP.
3. Thay thế logo SVG và các icon cho macOS/Windows/Linux.
4. Cấu hình AI Provider mặc định là OmiRouter.

### Bước 2.3: Khôi phục codebase gốc (Restore)
Trước khi commit code hoặc khi cần đồng bộ code mới từ upstream, bạn phải trả codebase về trạng thái sạch của GenOffice bằng lệnh:
```bash
npm run whitelabel:restore
```
*Lưu ý: Lệnh này sử dụng `git checkout` để rollback các thay đổi, hãy đảm bảo bạn đã lưu hoặc stash các thay đổi logic code của mình trước khi chạy.*

## 3. Chạy Môi trường Phát triển (Dev Mode)

Để khởi chạy ứng dụng VuaOffice dưới quyền phát triển:
1. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
2. Áp dụng thương hiệu:
   ```bash
   npm run whitelabel:apply
   ```
3. Chạy ứng dụng:
   ```bash
   npm run dev
   ```

## 4. Hướng dẫn Build Gói Phân Phối (Production Build)

### 4.1 Build cho macOS (DMG & APP)
Chạy lệnh sau tại root dự án:
```bash
npm run dist:mac
```
Sản phẩm build ra sẽ nằm tại thư mục `apps/shell/dist/` dưới dạng file cài đặt `.dmg` và ứng dụng `.app` mang tên **VuaOffice**.

### 4.2 Build cho Windows (EXE)
Chạy lệnh sau tại root dự án:
```bash
npm run dist:win
```
Sản phẩm build ra sẽ nằm tại thư mục `apps/shell/dist/` dưới dạng file `.exe`.

## 5. Quy trình Cập nhật từ Upstream GenOffice

Khi upstream GenOffice có cập nhật mới và bạn muốn cập nhật vào VuaOffice mà không bị conflict code:
1. Khôi phục codebase gốc sạch:
   ```bash
   npm run whitelabel:restore
   ```
2. Pull code mới từ remote repository:
   ```bash
   git pull origin main
   ```
3. Áp dụng lại thương hiệu:
   ```bash
   npm run whitelabel:apply
   ```
4. Kiểm tra độ ổn định bằng cách chạy:
   ```bash
   npm run typecheck
   npm run dev
   ```
5. Thực hiện build lại bản phân phối mới.

---

**Trạng thái tài liệu:** Active
**Ngày cập nhật:** 2026-08-10
