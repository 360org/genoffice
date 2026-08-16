# VuaOffice Markdown (Notes & Technical Docs)

Tài liệu kiến trúc và đặc tả kỹ thuật của module Soạn thảo Markdown (`apps/markdown`).

## 1. Tổng quan
- **Mã nguồn**: `apps/markdown`.
- **Định dạng hỗ trợ**: `.md`, `.markdown`, `.mdown`, `.mkd`.
- **Kiến trúc lõi**: Xây dựng trên Tiptap (ProseMirror core) với các extension tuỳ biến cao.

## 2. Tính năng chính
- Trình soạn thảo văn bản hỗ trợ cú pháp Markdown chuẩn CommonMark và GitHub Flavored Markdown (GFM).
- Hỗ trợ khối mã nguồn (Code Blocks) có tô màu cú pháp (Syntax Highlighting), bảng biểu GFM, danh sách việc cần làm (Task Lists), khối toán học LaTeX (Mathjax/KaTeX).
- Xem trước trực tiếp song song (Live Preview) hoặc chế độ WYSIWYG mượt mà.
- VuaOffice AI tích hợp: Hỗ trợ viết mã, tinh chỉnh tài liệu kỹ thuật, chuyển đổi định dạng và dịch thuật ngữ chuyên ngành.
