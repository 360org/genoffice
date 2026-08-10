# IDEA.md — VuaOffice Whitelabel & Rebrand

> Tài liệu ý tưởng gốc từ Product Owner (Sếp). AI không chỉnh sửa nội dung — chỉ format.

## Bài toán cần giải quyết
Sản phẩm office suite AI-native hiện tại (GenOffice) đang mang thương hiệu mặc định của upstream và phụ thuộc vào hệ thống API của Genspark. Sếp cần một phiên bản tuỳ biến thương hiệu riêng (Whitelabel) thành **VuaOffice** thuộc hệ sinh thái **360 CORP** nhằm cung cấp cho khách hàng doanh nghiệp của công ty mà không bị lộ nguồn gốc sản phẩm gốc. Đồng thời, hệ thống AI cần tích hợp trực tiếp với AI Router riêng của 360 CORP (**9router / omirouter**) để chủ động quản lý chi phí, mô hình và bảo mật dữ liệu.

Quá trình rebrand này phải diễn ra tự động bằng kịch bản cấu hình để khi upstream có bản cập nhật mới, việc merge code và build lại không bị xung đột (conflict).

## Đối tượng khách hàng
Các khách hàng doanh nghiệp trong hệ sinh thái của **360 CORP**, các doanh nghiệp sử dụng giải pháp văn phòng tích hợp AI tại Việt Nam.

## Vision sản phẩm
- Trở thành bộ ứng dụng văn phòng AI-native mang thương hiệu Việt (**VuaOffice** by **360 CORP**).
- Thay thế hoàn toàn nhận diện thương hiệu cũ (GenOffice) từ logo, icon, text hiển thị, thông tin build sản phẩm.
- Sử dụng hạ tầng AI Router độc lập (omirouter/9router) làm default provider.
- Cơ chế Whitelabel dạng Plug-and-Play: Chạy lệnh apply trước khi build, restore về codebase gốc trước khi pull/merge upstream.

## Giá trị cốt lõi
1. **Thương hiệu đồng nhất:** Tích hợp sâu vào hệ sinh thái 360 CORP với tên gọi VuaOffice.
2. **Chủ động hạ tầng AI:** Sử dụng AI Router riêng của 360 CORP để phân phối request AI tối ưu.
3. **Bảo trì dễ dàng (Maintainability):** Không can thiệp cứng vào codebase gốc để tránh conflict khi cập nhật code từ upstream GenOffice.
4. **An toàn & Riêng tư:** Dữ liệu AI đi qua gateway riêng (omirouter/9router), bảo mật thông tin doanh nghiệp.

## Hệ sinh thái / Liên kết
Nằm trong hệ sinh thái giải pháp doanh nghiệp của **360 CORP** (cùng với Vua Hệ Thống, CloudPanel, Hermes, 9router...).

## Ghi chú thêm
- Kịch bản build tự động cần hỗ trợ đa nền tảng (macOS, Windows, Linux).
- Đảm bảo các asset hình ảnh (logo SVG, icon PNG/ICNS/ICO) được thay thế chuẩn xác tại các vị trí hiển thị của Electron shell.

---

**Người viết:** Sếp (Product Owner)
**Ngày:** 2026-08-10
**Trạng thái:** Confirmed
