# IDEA.md — Định hướng & Ý tưởng Phát triển VuaOffice

> **Tài liệu Định hướng Cốt lõi (Vision & Ideation Document)**  
> **Chủ quản dự án**: 360 CORP  
> **Phiên bản hiện tại**: v0.6.7 (Hệ sinh thái VuaOffice Suite)

---

## 1. Bài toán Thực tế & Bối cảnh (Problem Statement)
Hầu hết các giải pháp văn phòng trên thị trường hiện nay gặp phải những rào cản lớn:
1. **Phụ thuộc License đắt đỏ**: Microsoft Office 365 đòi hỏi chi phí bản quyền định kỳ cao và phức tạp đối với các doanh nghiệp vừa và nhỏ (SMEs).
2. **AI rời rạc & Thiếu an toàn dữ liệu**: Việc sử dụng các công cụ AI bên ngoài (ChatGPT, Claude web) khiến dữ liệu doanh nghiệp dễ bị rò rỉ, phân tán và không gắn kết trực tiếp vào tài liệu soạn thảo (Docs, Sheets, Slides, PDF, Mail).
3. **Phụ thuộc nền tảng Upstream**: Sản phẩm mã nguồn mở GenOffice gốc phụ thuộc sâu vào hạ tầng API của Genspark, mang nhãn hiệu nước ngoài và thiếu khả năng tùy biến AI Gateway nội bộ.

---

## 2. Tầm nhìn Sản phẩm (Product Vision)
Xây dựng **VuaOffice** trở thành **Bộ ứng dụng văn phòng AI-Native 100% miễn phí bản quyền, hoàn toàn làm chủ hạ tầng AI & bảo mật dữ liệu** dành cho cộng đồng và doanh nghiệp:

- **Bộ ứng dụng toàn diện (All-in-One Office Suite)**: Tích hợp đầy đủ Docs (Soạn thảo văn bản), Sheets (Bảng tính phân tích dữ liệu), Slides (Thuyết trình sáng tạo), PDF (Xem & Ghi chú thông minh), Markdown (Soạn thảo kỹ thuật) và VuaMail (Quản lý Email & Lịch thay thế Outlook).
- **Làm chủ Trí tuệ Nhân tạo (AI Gateway Independence)**: Tích hợp trực tiếp với mạng lưới AI Gateway của 360 CORP (**OmiRouter**, **9Router**, **Hermes Agent**) cùng khả năng tùy biến Custom Endpoint tương thích OpenAI API.
- **Hệ thống Whitelabel & Sync Upstream thông minh**: Duy trì 100% bản quyền thương hiệu **VuaOffice by 360 CORP**, đồng thời tự động cập nhật mọi cải tiến công nghệ từ upstream mà không bị xung đột mã nguồn.

---

## 3. Đối tượng Người dùng & Thị trường Mục tiêu (Target Audience)
1. **Khách hàng Doanh nghiệp (Enterprise & SMEs)**: Các tổ chức trong hệ sinh thái 360 CORP và doanh nghiệp Việt Nam cần môi trường làm việc văn phòng bảo mật, tiết kiệm chi phí bản quyền và tối ưu năng suất làm việc.
2. **Chuyên viên Tri thức & Nhà nghiên cứu (Knowledge Workers)**: Người dùng cần trợ lý AI đồng hành trực tiếp trong việc phân tích bảng biểu phức tạp, tóm tắt tài liệu PDF hàng trăm trang, phác thảo bài thuyết trình và soạn thảo email chuyên nghiệp.
3. **Nhà phát triển & Quản trị viên CNTT (Developers & IT Admins)**: Cần công cụ desktop mã nguồn mở linh hoạt, hỗ trợ chế độ Developer Mode để tích hợp mô hình AI nội bộ (Local LLM / Private Gateway).

---

## 4. Giá trị Cốt lõi & Trụ cột Công nghệ (Core Pillars)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          VUAOFFICE ECOSYSTEM                            │
├────────────────────┬────────────────────┬───────────────────────────────┤
│ 1. AI-NATIVE CORE  │ 2. DESKTOP SUITE   │ 3. ENTERPRISE GATEWAY         │
│ • Paragraph Patch  │ • Word/Docs (DOCX) │ • OmiRouter AI Gateway        │
│ • Formula & Pivot  │ • Sheets (XLSX)    │ • 9Router Failover Gateway    │
│ • Slide Generation │ • Slides (PPTX)    │ • Hermes Agentic Workflows    │
│ • PDF Q&A & Notes  │ • PDF & Annotations│ • Private OpenAI-compat proxy │
│ • Smart Mail Copilot│ • Markdown & Mail │ • Zero Data Leak Policy       │
└────────────────────┴────────────────────┴───────────────────────────────┘
```

1. **AI Native & Agentic Workflows**: AI không chỉ là chatbot bên lề mà là một tác nhân (agent) có khả năng đọc hiểu DOM/Canvas, sửa đổi trực tiếp từng đoạn văn bản, tạo công thức bảng tính, vẽ biểu đồ và phân tích dữ liệu chuyên sâu.
2. **Hiệu năng Cao & Hoạt động Offline**: Hỗ trợ mở và chỉnh sửa tệp tin offline hoàn toàn với tốc độ khởi động tức thì, lưu trữ an toàn trên thiết bị người dùng.
3. **Bảo mật Dữ liệu & Độc lập Hạ tầng**: Không gửi dữ liệu tài liệu ra bên ngoài trừ khi người dùng chủ động kích hoạt tính năng AI qua Gateway bảo mật đã được kiểm duyệt.
4. **Trải nghiệm Người dùng Chuẩn Doanh nghiệp (Enterprise UX)**: Giao diện Ribbon hiện đại, hỗ trợ Dark/Light Semantic Tokens, đa ngôn ngữ (Tiếng Việt, Tiếng Anh và 17 ngôn ngữ quốc tế).

---

## 5. Lộ trình Phát triển (Product Roadmap)
- **Giai đoạn 1 (v0.1.0 - v0.6.0)**: Thiết lập nền tảng Whitelabel tự động, tích hợp OmiRouter/9Router, chuẩn hoá nhận diện thương hiệu VuaOffice.
- **Giai đoạn 2 (v0.6.1 - v0.6.7)**: Tích hợp Hermes Agent, chuyển đổi Developer Mode sang System Menu, bổ sung Manual Check for Updates, nâng cấp bộ icon/logo vector chính thức.
- **Giai đoạn 3 (v0.7.0+)**: Ra mắt chính thức VuaMail (Email & Calendar), hoàn thiện hệ thống Agentic Office Automation và đồng bộ đám mây riêng tư.

---

**Chủ quản**: 360 CORP  
**Trạng thái**: Đã phê duyệt (Active & Maintained)  
**Ngày cập nhật**: 2026-08-16
