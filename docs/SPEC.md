# SPEC.md — Đặc tả Kỹ thuật Chi tiết VuaOffice

> **Tài liệu Đặc tả Kỹ thuật (Technical Specification Document)**  
> **Tham chiếu từ**: [REQUIREMENTS.md](REQUIREMENTS.md) và [ARCH.md](ARCH.md)  
> **Phiên bản**: v0.6.7+

---

## 1. Cấu trúc Cây Thư mục & Workspace Monorepo

Dự án sử dụng mô hình npm workspaces với cấu trúc chuẩn hóa:

```text
vuaoffice/
├── apps/
│   ├── docs/               # Ứng dụng Soạn thảo Văn bản (.docx)
│   ├── sheets/             # Ứng dụng Bảng tính & Phân tích Dữ liệu (.xlsx)
│   ├── slides/             # Ứng dụng Trình chiếu & Thiết kế Slide (.pptx)
│   ├── pdf/                # Ứng dụng Xem & Ghi chú PDF (.pdf)
│   ├── markdown/           # Ứng dụng Soạn thảo GFM Notes (.md)
│   ├── mail/               # Ứng dụng VuaMail Client (Email & Lịch)
│   └── shell/              # Khung ứng dụng Desktop chính (Host Shell)
├── packages/
│   ├── docx-engine/        # Lõi phân tích và bố cục OpenXML DOCX
│   ├── pptx-engine/        # Lõi phân tích cấu trúc OpenXML PPTX
│   ├── pptx-render/        # Lõi render Slide Canvas & HarfBuzz Font Shaping
│   ├── file-parse/         # Lõi phân tích nhị phân và stream file
│   ├── ui/                 # Thư viện UI chung & Semantic CSS Tokens
│   ├── i18n/               # Hệ thống Đa ngôn ngữ (19 ngôn ngữ)
│   ├── font-metrics/       # Đo đạc kích thước font chính xác
│   ├── ai-provider/        # Tích hợp AI Gateway (OmiRouter, 9Router, Hermes)
│   ├── agent-core/         # Lõi thực thi Agentic Tools & Reasoning Loop
│   ├── ai-search/          # Tìm kiếm thông minh qua vector/embeddings
│   ├── project-store/      # Quản lý cấu trúc thư mục dự án cục bộ
│   └── electron-utils/     # Tiện ích IPC và tương tác hệ điều hành
├── docs/                   # Toàn bộ tài liệu kiến trúc, đặc tả, hướng dẫn
├── whitelabel/             # Cấu hình thương hiệu và tài nguyên đồ họa VuaOffice
├── scripts/                # Kịch bản tự động hóa Whitelabel & Sync
└── tools/                  # Công cụ kiểm tra lint, theme colors, licenses
```

---

## 2. Đặc tả Cấu hình Whitelabel (`whitelabel/brand-config.json`)

```json
{
  "appName": "VuaOffice",
  "appId": "com.vuahethong.vuaoffice",
  "executableName": "vuaoffice",
  "author": "360 CORP",
  "defaultProvider": "omirouter",
  "omirouterUrl": "https://api.omirouter.com/v1",
  "ninerouterUrl": "https://api.9router.com/v1",
  "hermesUrl": "https://hermes.vuahethong.com/v1",
  "textReplacements": [
    {
      "files": [
        "apps/shell/src/renderer/src/strings.ts",
        "apps/shell/src/renderer/index.html",
        "apps/shell/src/renderer/update.html",
        "apps/shell/src/renderer/src/Home.tsx",
        "apps/shell/src/main/tab-manager.ts",
        "apps/shell/src/main/index.ts",
        "apps/docs/src/renderer/components/Ribbon.tsx",
        "apps/slides/src/renderer/components/RibbonHomeTab.tsx",
        "apps/slides/src/renderer/App.tsx",
        "apps/markdown/src/renderer/components/Ribbon.tsx",
        "apps/sheets/src/renderer/ExcelShell.tsx"
      ],
      "rules": [
        { "regex": "Genspark AI", "to": "VuaOffice AI" },
        { "regex": "\\bGenOffice\\b", "to": "VuaOffice" },
        { "regex": "\\bGenspark\\b", "to": "360 CORP" }
      ]
    }
  ]
}
```

---

## 3. Đặc tả Kỹ thuật các Module Ứng dụng Cốt lõi

### 3.1 VuaOffice Docs (`apps/docs`)
- **Định dạng**: `.docx` (OpenXML), `.doc` (via converter), `.txt`, `.rtf`.
- **Cơ chế Layout**: Phân trang theo thời gian thực (Real-time Canvas Pagination Engine).
- **Khả năng AI**: Paragraph-level AI Patching (chỉnh sửa cục bộ từng đoạn mà không làm xáo trộn bố cục và định dạng của các đoạn xung quanh).

### 3.2 VuaOffice Sheets (`apps/sheets`)
- **Định dạng**: `.xlsx`, `.xlsm`, `.csv`, `.tsv`.
- **Cơ chế Tính toán**: Nhân tính toán hiệu năng cao kết hợp Rust sidecar engine cho các tệp dữ liệu lớn (> 100,000 dòng).
- **Khả năng AI**: Tạo công thức Excel tự động, phân tích xu hướng dữ liệu, tự động tạo Pivot Table và biểu đồ trực quan hóa.

### 3.3 VuaOffice Slides (`apps/slides`)
- **Định dạng**: `.pptx`, `.ppsx`.
- **Cơ chế Render**: Canvas 2D + Konva Engine với HarfBuzz Text Shaping đảm bảo hiển thị chuẩn xác tiếng Việt và các ngôn ngữ phức tạp.
- **Khả năng AI**: Sinh dàn ý thuyết trình từ tài liệu Word/PDF, tự động tạo slide với bố cục và hình ảnh minh họa phù hợp.

### 3.4 VuaOffice PDF (`apps/pdf`)
- **Định dạng**: `.pdf`.
- **Cơ chế Render**: PDF.js WebWorker Rendering Engine với lớp phủ Vector Overlay phục vụ vẽ tay, đóng dấu, highlight và gạch chân.
- **Khả năng AI**: Đọc hiểu tài liệu dài (Long-Context PDF Q&A), tóm tắt các điểm chính và trích xuất bảng dữ liệu từ PDF sang Sheets.

### 3.5 VuaOffice Markdown (`apps/markdown`)
- **Định dạng**: `.md`, `.markdown`.
- **Cơ chế Soạn thảo**: Tiptap Editor (ProseMirror core) hỗ trợ GFM, KaTeX, Mermaid diagrams, và Task Lists.

### 3.6 VuaOffice Mail (`apps/mail`)
- **Giao diện**: Fluent UI Ribbon 3 cột theo chuẩn Microsoft Outlook.
- **Cơ sở dữ liệu**: SQLite cục bộ lưu trữ metadata, full-text search index và hàng đợi offline OpQueue.
- **Khả năng AI**: Tóm tắt chuỗi email dài, tạo bản thảo phản hồi thông minh và phân loại email quan trọng (Focused Inbox).

---

## 4. Đặc tả Tích hợp AI Provider & Gateway (`@genoffice/ai-provider`)

### 4.1 Định nghĩa Types & Providers
```typescript
export type AiProviderId = 
  | 'omirouter' 
  | 'ninerouter' 
  | 'hermes' 
  | 'genspark' 
  | 'anthropic' 
  | 'openai' 
  | 'gemini' 
  | 'deepseek' 
  | 'custom'
```

### 4.2 Cấu hình Provider Metadata
```typescript
export const AI_PROVIDERS: readonly AiProviderMeta[] = [
  {
    id: 'omirouter',
    label: 'OmiRouter AI (360 CORP)',
    models: ['claude-3-5-sonnet', 'gpt-4o', 'gemini-1.5-pro', 'deepseek-chat'],
    defaultModel: 'claude-3-5-sonnet',
    keyPlaceholder: 'sk-or-...',
    needsBaseUrl: true,
  },
  {
    id: 'ninerouter',
    label: '9Router AI (360 CORP)',
    models: ['claude-3-5-sonnet', 'gpt-4o', 'gemini-1.5-pro', 'deepseek-chat'],
    defaultModel: 'claude-3-5-sonnet',
    keyPlaceholder: 'sk-9r-...',
    needsBaseUrl: true,
  },
  {
    id: 'hermes',
    label: 'Hermes Agent (360 CORP)',
    models: ['hermes-3-llama-3.1-8b', 'hermes-3-llama-3.1-70b', 'custom-hermes-model'],
    defaultModel: 'hermes-3-llama-3.1-8b',
    keyPlaceholder: 'sk-hermes-...',
    needsBaseUrl: true,
  },
  // ...
]
```

---

## 5. Đặc tả Cơ chế Tự động Cập nhật & Kiểm tra Thủ công (Auto & Manual Updater)

- **Cấu hình Feed URL**: Tự động trỏ về `https://github.com/360org/vuaoffice/releases/latest/download`.
- **Cơ chế Kiểm tra Định kỳ (Background Check)**: Tự động chạy sau 15 giây khi khởi động và lặp lại mỗi 4 giờ. Giữ im lặng nếu không có bản cập nhật mới hoặc lỗi mạng.
- **Cơ chế Kiểm tra Thủ công (Manual Check)**: Gọi qua hàm `checkForUpdatesManual()` khi người dùng chọn menu:
  - Hiển thị Dialog thông báo nếu đang ở bản mới nhất hoặc lỗi kết nối.
  - Mở cửa sổ Update UI nếu có bản phát hành mới với tùy chọn: *Download*, *Install & Restart*, *Later*.

---

## 6. Đặc tả Tính năng Thu thập Log & Báo cáo Lỗi (Diagnostic Report System)

Hệ thống cung cấp cơ chế thu thập và báo cáo lỗi trực tiếp về bộ phận kỹ thuật 360 CORP qua GitLab Issues:

- **Đường dẫn Menu**: `Help` ➜ `Troubleshooting` ➜ `Generate Log, Diagnostic Report…` (hoặc `Tạo Báo cáo Chẩn đoán & Log lỗi…`).
- **Giao diện Modal (`DiagnosticReportModal.tsx`)**:
  - **Mã định danh sự cố (Reference ID)**: Dạng `VUA-DIAG-YYYYMMDD-XXXXX` kèm nút copy nhanh.
  - **Thông tin hệ thống**: OS Platform/Arch, Electron, Chromium, Node.js version, RAM metric, Developer Mode state, Language & Theme.
  - **Kiểm tra mạng song song (Network Reachability)**: Ping đồng thời GitLab API, OmiRouter AI, 9Router AI và Hermes Agent endpoint với timeout 4s.
  - **Bộ lọc bảo mật (Scrubber & Redactor)**:
    - Xóa sạch đường dẫn thư mục cá nhân (`/Users/...` ➜ `~`).
    - Redact toàn bộ Bearer Token, API Key (`sk-...`, `glpat-...`, `ghp_...`).
    - Làm mờ địa chỉ email và địa chỉ IPv4 cục bộ.
    - Ẩn cấu hình nhạy cảm (`<redacted>`).
  - **Xuất tệp (Export to file)**: Hỗ trợ lưu ra `.txt` hoặc `.json` qua hộp thoại Save Dialog của hệ điều hành.
  - **Gửi về VuaOffice (Send to VuaOffice)**: Định dạng báo cáo dạng Markdown hoàn chỉnh và gửi trực tiếp về GitLab Issues của `360org/vuaoffice`.

---

**Chủ quản**: 360 CORP  
**Trạng thái**: Đã phê duyệt (Approved)  
**Ngày cập nhật**: 2026-08-16
