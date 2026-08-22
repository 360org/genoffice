# Kết hợp Kiến trúc VuaMailUI (Blazorise Outlook) sang VuaMail (React 19)

> **Tài liệu tham chiếu thiết kế UI/UX**: Chuyển giao các thành phần từ `/Volumes/DATA/DEV/VuaMailUI/` (Blazorise Outlook Clone) sang `/Volumes/DATA/DEV/VuaMail/apps/mail` (React 19 + TypeScript).

---

## 1. Bản đồ Đối chiếu Thành phần (Component Mapping)

| Thành phần trong VuaMailUI (Blazorise) | Vị trí tương ứng trong VuaMail (React 19) | Trạng thái chuyển giao |
|---|---|---|
| `BlazoriseOutlookClone.UI/Components/TopBarMenu.razor` | `apps/mail/src/renderer/src/components/ribbon/MailRibbon.tsx` | Đã hoàn thành (Home, View, Help tabs) |
| `BlazoriseOutlookClone.UI/Components/TopBarButton.razor` | `apps/mail/src/renderer/src/components/ribbon/RibbonButton.tsx` | Đã hoàn thành (Nút Ribbon chuẩn Fluent UI) |
| `BlazoriseOutlookClone.UI/Layout/MainLayout.razor` (App Switcher) | `apps/mail/src/renderer/src/components/sidebar/AppRail.tsx` | Đã hoàn thành (Icon Mail, Calendar, People, To-Do) |
| `BlazoriseOutlookClone.UI/Components/SideBarMenu.razor` + `SideBarGroup.razor` | `apps/mail/src/renderer/src/components/sidebar/FolderTree.tsx` | Đã hoàn thành (Nhóm Favorites & Folder Tree) |
| `BlazoriseOutlookClone.UI/Components/Mails/MailList.razor` + `MailListItem.razor` | `apps/mail/src/renderer/src/components/list/MailList.tsx` | Đã hoàn thành (Focused/Other filter tabs + search) |
| `BlazoriseOutlookClone.UI/Components/Mails/MailRead.razor` | `apps/mail/src/renderer/src/components/detail/ReadingPane.tsx` | Đã hoàn thành (+ Tích hợp thêm AI Smart Summary Box) |
| `BlazoriseOutlookClone.UI/Components/Mails/MailCompose.razor` | `apps/mail/src/renderer/src/components/compose/ComposeModal.tsx` | Đã hoàn thành (+ Soạn thư nhanh & AI Assist Prompt) |
| `BlazoriseOutlookClone.UI/Pages/PeoplePage.razor` | Dự kiến tích hợp ở phase danh bạ (`ContactList.tsx` / `ContactRead.tsx`) | Kế hoạch mở rộng v0.7.0 |
| `BlazoriseOutlookClone.UI/Pages/CalendarPage.razor` | Dự kiến tích hợp ở phase lịch biểu (`CalendarScheduler.tsx`) | Kế hoạch mở rộng v0.7.0 |

---

## 2. Điểm nâng cấp vượt trội của VuaMail so với VuaMailUI gốc

1. **Local SQLite Data Engine**: 
   - VuaMailUI gốc dùng in-memory list (`MailService.cs`).
   - VuaMail sử dụng **SQLite WAL Mode (`better-sqlite3`)** với kiến trúc Op-Queue offline, lưu trữ dữ liệu an toàn tại máy người dùng và sẵn sàng đồng bộ IMAP/SMTP 2 chiều.
2. **VuaOffice AI Assistant**:
   - Tích hợp sâu cổng AI Gateway của 360 CORP (`@genoffice/ai-provider` & `omirouter`), cho phép:
     - Tóm tắt email dài chỉ trong 3 gạch đầu dòng.
     - Soạn thảo email thông minh dựa trên ngữ cảnh công việc.
     - Đề xuất câu trả lời nhanh (Smart Reply) 1-click.
3. **Tuân thủ Chuẩn Theme VuaOffice**:
   - Sử dụng toàn bộ hệ thống biến màu Semantic Token (`packages/ui/src/tokens.css`) đảm bảo giao diện thích ứng mượt mà giữa chế độ Sáng (Light) và Tối (Dark).
