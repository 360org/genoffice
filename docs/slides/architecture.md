# VuaOffice Slides (Presentation Engine)

Tài liệu kiến trúc và đặc tả kỹ thuật của module Trình chiếu (`apps/slides`, `@genoffice/pptx-engine`, `@genoffice/pptx-render`).

## 1. Tổng quan
- **Mã nguồn**: `apps/slides`, `packages/pptx-engine`, `packages/pptx-render`.
- **Định dạng hỗ trợ**: `.pptx`, `.ppsx`.
- **Kiến trúc lõi**: Canvas + Konva/SVG presentation engine, phân tách rõ ràng giữa Engine phân tích OpenXML và Render Canvas.

## 2. Tính năng chính
- Trình biên tập Slide trực quan kéo thả đối tượng (Shapes, Textboxes, Images, Tables, Charts).
- Chế độ Trình chiếu toàn màn hình (Presenter View & Slideshow) với hỗ trợ phím tắt điều hướng.
- Trợ lý AI tạo bài thuyết trình: Tự động phân tích dàn ý, sinh cấu trúc slide, chọn bố cục và viết nội dung thông minh.
- Xuất bản đa định dạng: `.pptx`, xuất ảnh từng Slide (.png/.jpg), xuất toàn bộ bài trình chiếu sang `.pdf`.
