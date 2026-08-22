# Kiến trúc VuaMail (So sánh & Tương thích VuaOffice / GenMail / Outlook)

## 1. Bối cảnh & Mục tiêu
VuaMail được thiết kế như một module ứng dụng email chuyên nghiệp trong hệ sinh thái **VuaOffice Suite**, kết hợp:
1. **Kiến trúc Monorepo & Module của VuaOffice**:
   - `packages/mail-engine`: Core logic phân tích RFC822 EML, cấu trúc PST, threading hội thoại và rule engine (tương đương `docx-engine`, `pptx-engine`).
   - `apps/mail`: Renderer React/TypeScript, Main Process WebContentsView, SQLite cache cục bộ, sync loop.
   - `apps/shell`: Điều phối TabManager, window management, app launcher card, menu, shortcuts.
2. **Kinh nghiệm kiến trúc từ GenMail.app (`/Applications/GenMail.app/`)**:
   - Tách biệt DB Worker Thread (`Worker` from `node:worker_threads`) tránh block main event loop.
   - Sử dụng `better-sqlite3` kết hợp SegmentStore và Metadata Overlay Ops để quản lý optimistic UI update.
   - Cung cấp tính năng Calendar Cache, Tombstones chống race condition khi prefetch.
3. **Mô hình trải nghiệm từ Microsoft Outlook (`/Applications/Microsoft Outlook.app/`)**:
   - 3-Pane Layout kinh điển: Navigation Bar (Mail, Calendar, Contacts, To-Do) + Folder Tree ➔ Message List ➔ Reading Pane.
   - Hỗ trợ định dạng PST/OST cục bộ, hội thoại theo chuỗi (Conversation View), phân loại Focused/Other, Rules tự động.

---

## 2. Bản đồ Kiến trúc VuaOffice Mail

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             VuaOffice Shell                                 │
│  - TabManager (quản lý lifecycle WebContentsView cho AI Mail)                │
│  - Quick Card Launcher: AI Mail (.pst)                                      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ IPC / WebContentsView
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                                 apps/mail                                   │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │         Main Process            │   │         Renderer (React)        │  │
│  │ - WebContentsView Factory       │   │ - Left Activity Bar (Icons)     │  │
│  │ - SQLite Storage / DB Worker    │   │ - Folder Tree & Accounts        │  │
│  │ - Sync Orchestrator (IMAP/SMTP) │   │ - Message List (Search/Filter)  │  │
│  │ - IPC Handlers (mail:*)         │   │ - Reading Pane (Attachments/AI) │  │
│  └────────────────┬────────────────┘   └─────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────────────────────┐
│                           packages/mail-engine                              │
│  - EML Parser / Builder (MIME, RFC822, multipart/mixed, attachments)        │
│  - PST Container Reader & Parser (!BDN header, folder tree)                 │
│  - Conversation Threading Engine (groupIntoThreads theo Message-ID)         │
│  - Rule & Filter Engine (Condition evaluation, auto-folder/star/reply)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Ma trận Đối chiếu Tính năng & Kiến trúc

| Tiêu chí | GenMail.app | Microsoft Outlook | VuaOffice Mail (VuaMail) |
|---|---|---|---|
| **Mô hình kiến trúc** | Single App Electron + Worker Threads | Native macOS Cocoa / CoreData | Multi-App Electron Monorepo (`packages/mail-engine` + `apps/mail` + `apps/shell`) |
| **Engine lõi** | Vue 3 + Pinia + SQLite | C++ / Objective-C Engine + MAPI | TypeScript Native Engine (`@genoffice/mail-engine`) + SQLite |
| **Giao diện & UX** | Web/Vue Hiện đại, AI Tích hợp | 3-Pane Classic / Modern Ribbon | 3-Pane Outlook Style + AI Smart Reply + File Attachment Preview |
| **Định dạng dữ liệu** | Cloud sync Genspark | PST / OST / EML / MSG | EML / PST / SQLite Database cục bộ |
| **Hội thoại & Thread** | Thread list | Conversation View | `groupIntoThreads` chuẩn RFC822/Message-ID |
| **Quản lý Tài khoản** | Đa tài khoản Genspark/Google | IMAP/POP3/Exchange/Outlook.com | Đa tài khoản IMAP/SMTP + Local Mock Offline |
| **Khả năng ngoại tuyến** | Cache SQLite | Offline Data File (.ost) | SQLite Local-First, OpQueue sync khi online |
