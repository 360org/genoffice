# VuaOffice Docs (Word/Document Engine)

Tài liệu kiến trúc và đặc tả kỹ thuật của module Document Editor (`apps/docs` & `@genoffice/docx-engine`).

## 1. Tổng quan
- **Mã nguồn**: `apps/docs` (Renderer / Editor Shell), `packages/docx-engine` (Lõi xử lý DOCX), `packages/font-metrics`.
- **Định dạng hỗ trợ**: `.docx`, `.doc` (via import converter), `.txt`, `.rtf`.
- **Kiến trúc lõi**: Canvas/DOM hybrid rendering, custom layout engine tuân thủ định dạng Microsoft Word OpenXML.

## 2. Tính năng chính
- Trình biên tập văn bản WYSIWYG tốc độ cao với phân trang thực tế (Real-time page pagination).
- Hỗ trợ đầy đủ bảng biểu (Tables), hình ảnh (Images), hình vẽ (Shapes), Header & Footer, chú thích chân trang (Footnotes).
- Tích hợp trợ lý AI thông minh (VuaOffice AI) hỗ trợ viết lại, tóm tắt, dịch thuật và sinh văn bản tự động.
- Xuất bản đa định dạng: `.docx`, `.pdf`, in ấn trực tiếp qua Chromium printing API.
