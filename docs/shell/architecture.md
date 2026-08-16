# VuaOffice Shell (Unified Desktop Host)

Tài liệu kiến trúc và đặc tả kỹ thuật của module Shell chính (`apps/shell`).

## 1. Tổng quan
- **Mã nguồn**: `apps/shell`.
- **Kiến trúc lõi**: Ứng dụng máy tính đa nền tảng (macOS, Windows, Linux) trên nền tảng Electron 43 + React 19 + TypeScript.

## 2. Các thành phần chính
- **Tab Manager (`apps/shell/src/main/tab-manager.ts`)**: Quản lý các tab ứng dụng con đa tiến trình (`WebContentsView`), hỗ trợ chuyển đổi mượt mà giữa Home, Docs, Sheets, Slides, PDF, Markdown, Mail.
- **Home Launcher (`apps/shell/src/renderer/src/Home.tsx`)**: Màn hình trung tâm quản lý tài liệu gần đây (Recent files), tệp đánh dấu sao (Starred), danh sách dự án (Projects), và cài đặt ứng dụng.
- **Auto Updater (`apps/shell/src/main/updater.ts`)**: Quản lý cập nhật phần mềm tự động và kiểm tra thủ công qua kênh phát hành GitHub (`360org/vuaoffice`).
- **AI Gateway Integration**: Kết nối tới 360 CORP Gateway (`omirouter`, `ninerouter`, `hermes`, `openai`, `anthropic`).
