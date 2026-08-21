# AI Mail Architecture & Integration Specification

> Module: `@genoffice/mail` (`apps/mail`)  
> Thuộc bộ ứng dụng: **VuaOffice Desktop Suite** (Electron + React 19 + TypeScript)  
> Phân hệ: `AI Mail`

---

## 1. Tổng quan Dự án & Mục tiêu

**AI Mail** là ứng dụng email client thế hệ mới tích hợp trực tiếp bên trong hệ sinh thái **VuaOffice Suite**, kết hợp:
1. **Mail Engine Local**: Kế thừa kiến trúc JSON Storage, Op-Queue offline, MIME parser và sync caching.
2. **Outlook Fluent UI**: Giao diện Ribbon chuẩn Microsoft Office 365, bố cục 3 cột (AppRail/Folders - Message List - Reading/Compose Pane) sang **React 19 + TypeScript**.
3. **VuaOffice AI Integration**: Tích hợp trợ lý trí tuệ nhân tạo (AI Summary, Smart Reply, AI Draft Generator) qua gateway 360 CORP (`@genoffice/ai-provider`).
4. **VuaOffice Shell Integration**: Chạy liền mạch trong hệ thống đa tab của `apps/shell`, hỗ trợ Dark/Light Theme Semantic Tokens (`packages/ui/src/tokens.css`).

---

## 2. Kiến trúc Kỹ thuật (Layered Architecture)

```mermaid
graph TD
    subgraph "VuaOffice Shell Host (apps/shell)"
        ShellTab[TabBar Manager]
        HomeUI[VuaOffice Home Launcher]
    end

    subgraph "Mail Module (apps/mail)"
        subgraph "UI Layer (React 19 + Fluent UI)"
            Ribbon[Mail Ribbon Menu]
            AppRail[AppRail - Mail/Calendar/People/Todo]
            FolderList[Folder Tree Pane]
            MsgList[Message List Pane - Focused/Other]
            ReadPane[Reading & Viewer Pane]
            ComposeModal[Compose & Rich Editor]
        end

        subgraph "AI Assistant Layer"
            AiSummary[AI Thread Summary]
            AiReply[Smart Reply Assistant]
            AiDraft[AI Compose Polish]
            AiProvider[@genoffice/ai-provider Gateway]
        end

        subgraph "Engine & Storage Layer (Node/Electron Main)"
            MailIPC[Mail IPC Bridge]
            SQLiteDB[(JSON Storage Engine)]
            OpQueue[Offline Operation Queue]
            MimeParser[Attachment & MIME Parser]
            SyncManager[2-way Sync Manager]
        end
    end

    HomeUI -->|Launch Mail Tab| ShellTab
    ShellTab --> Ribbon
    Ribbon --> MsgList
    AppRail --> FolderList
    FolderList --> MsgList
    MsgList --> ReadPane
    ReadPane --> AiSummary
    ComposeModal --> AiDraft
    AiSummary --> AiProvider
    AiDraft --> AiProvider

    ReadPane --> MailIPC
    ComposeModal --> MailIPC
    MailIPC --> SQLiteDB
    MailIPC --> OpQueue
    OpQueue --> SyncManager
```

---

## 3. Cấu trúc Thư mục Module (`apps/mail`)

```
apps/mail/
├── package.json                     # Định nghĩa module @genoffice/mail
├── tsconfig.json                    # TypeScript strict mode
├── electron.vite.config.ts          # Build cấu hình Electron Vite
├── vite.renderer.config.ts          # Dev server cho UI renderer
├── src/
│   ├── main/                        # Mail Backend & Engine
│   │   ├── index.ts                 # Main process entry
│   │   ├── db/
│   │   │   ├── schema.ts            # Data model definitions
│   │   │   ├── sqlite-storage.ts    # JSON storage engine cho emails, folders, contacts
│   │   │   └── op-queue.ts          # Hàng đợi thao tác offline
│   │   ├── ipc/
│   │   │   └── mail-ipc.ts          # Đăng ký IPC channels với renderer
│   │   └── sync/
│   │       └── sync-manager.ts      # Quản lý đồng bộ hòm thư
│   ├── preload/
│   │   └── index.ts                 # ContextBridge phơi API `window.mailApi`
│   ├── shared/
│   │   ├── types.ts                 # Kiểu dữ liệu Email, Folder, Contact, Attachment
│   │   └── ipc-events.ts            # Danh mục IPC channels
│   └── renderer/                    # Outlook UI (React 19)
│       ├── index.html
│       └── src/
│           ├── main.tsx             # React Root
│           ├── App.tsx              # Outlook Layout Root
│           ├── components/
│           │   ├── ribbon/          # TopBar Menu (Home, View, Help, AI Tools)
│           │   │   ├── MailRibbon.tsx
│           │   │   └── RibbonButton.tsx
│           │   ├── sidebar/         # Cột 1: App Switcher + Folder List
│           │   │   ├── AppRail.tsx
│           │   │   └── FolderTree.tsx
│           │   ├── list/            # Cột 2: Message List
│           │   │   ├── MailList.tsx
│           │   │   ├── MailListItem.tsx
│           │   │   └── FilterTabs.tsx
│           │   ├── detail/          # Cột 3: Reading Pane & Attachments
│           │   │   ├── MailReadingPane.tsx
│           │   │   ├── MailHeader.tsx
│           │   │   ├── AttachmentChip.tsx
│           │   │   └── AiSummaryBox.tsx
│           │   └── compose/         # Soạn thư & AI Compose
│           │       ├── MailComposeModal.tsx
│           │       └── AiPromptBar.tsx
│           └── styles/
│               ├── mail-theme.css   # Semantic token compliance
│               └── outlook-layout.css
```

---

## 4. Storage Schema

Các entity cơ sở dữ liệu chính:
1. **`accounts`**: Lưu thông tin tài khoản email (Google, Outlook, IMAP/SMTP cá nhân).
2. **`emails`**: Danh sách thư (`id`, `account_id`, `folder_id`, `sender_name`, `sender_email`, `recipient`, `subject`, `snippet`, `is_read`, `is_starred`, `has_attachments`, `date_ms`).
3. **`email_bodies`**: Lưu nội dung thư đầy đủ dạng `html` và `plain_text` đã tách payload nặng.
4. **`email_folders`**: Thư mục hòm thư (`inbox`, `sent`, `drafts`, `archive`, `trash`, `spam`, `custom`).
5. **`op_queue`**: Hàng đợi offline (`id`, `op_type`, `email_id`, `payload`, `created_at`, `status`).
6. **`contacts`**: Danh bạ liên hệ gợi ý tìm kiếm.

---

## 5. Quy tắc Theming & UI Compliance

* Tuân thủ triệt để token từ `/Volumes/DATA/DEV/vuaoffice/packages/ui/src/tokens.css`.
* Sử dụng `--surface`, `--surface-subtle`, `--text-primary`, `--text-secondary`, `--border`, `--hover`.
* Màu chủ đạo (Accent Color): AI Mail sử dụng mã màu chuẩn Outlook Microsoft: `--accent: #0078d4;` (kèm dark-mode adjusted `--accent: #2b88d8;`).
