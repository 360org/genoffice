# VuaOffice PDF (PDF Engine & Annotations)

Tài liệu kiến trúc và đặc tả kỹ thuật của module Xem và Xử lý PDF (`apps/pdf`).

## 1. Tổng quan
- **Mã nguồn**: `apps/pdf`, `packages/file-parse`.
- **Định dạng hỗ trợ**: `.pdf`.
- **Kiến trúc lõi**: Tích hợp PDF.js worker-based rendering kết hợp overlay layer phục vụ ghi chú (annotations) và vẽ biểu mẫu.

## 2. Tính năng chính
- Xem tài liệu PDF đa trang với hiệu năng cao, cuộn mượt mà và tìm kiếm chuỗi ký tự tức thì.
- Ghi chú tài liệu: Highlight, gạch chân (Underline), ghi chú văn bản (Sticky Notes), vẽ tay (Ink/Draw) và đóng dấu (Stamps).
- Xoay trang, sắp xếp lại thứ tự trang và trích xuất trang độc lập.
- VuaOffice AI tích hợp: Đọc hiểu và tóm tắt nhanh nội dung toàn bộ tệp PDF dài, hỏi đáp trực tiếp trên nội dung tài liệu.
