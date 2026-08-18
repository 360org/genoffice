# VuaOffice (Bộ ứng dụng văn phòng AI 360 CORP)

> **Tài liệu chính thức dành cho Dự án VuaOffice (360 CORP)**  
> VuaOffice là bộ ứng dụng văn phòng tích hợp Trí tuệ nhân tạo (AI-Native Office Suite) dành cho macOS, Windows và Linux, được phát triển dựa trên dự án mã nguồn mở GenOffice theo Giấy phép Apache License 2.0.

---

## 🚀 Giới thiệu VuaOffice

VuaOffice bao gồm các ứng dụng làm việc cốt lõi trên nền tảng Electron với kiến trúc chia sẻ chung tầng Engine:

1. **VuaOffice Docs**: Trình soạn thảo văn bản `.docx` hỗ trợ AI patch theo đoạn, giữ nguyên bố cục ban đầu của tệp Word.
2. **VuaOffice Sheets**: Trình quản lý bảng tính `.xlsx` mở rộng trên nhân Univer, tích hợp engine Rust sidecar (calamine + IronCalc), biểu đồ Konva, Pivot Table và Slicer.
3. **VuaOffice Slides**: Trình trình chiếu `.pptx` hỗ trợ thiết kế slide, HarfBuzz text shaping và công cụ AI tạo nội dung.
4. **VuaOffice PDF**: Trình xem & chỉnh sửa tệp `.pdf` hỗ trợ chú thích, biểu mẫu, chữ ký số và phân tích nội dung qua AI.
5. **VuaOffice Shell**: Khung ứng dụng trung tâm quản lý tab, cài đặt tài khoản 360 CORP, AI Router và tự động cập nhật (Auto-Update).
6. **VuaOffice Mail**: Trình quản lý Email & Lịch tích hợp AI (thay thế Microsoft Office 365 Outlook, đang được lên kế hoạch phát triển ở các phiên bản tiếp theo).

---

## 📦 Tải về phiên bản mới nhất (Releases)

Tất cả các bản build phát hành được đóng gói và kiểm tra tự động qua GitHub Actions:

| Nền tảng                          | Yêu cầu hệ thống    | Tệp cài đặt                                                                                                         |
| :-------------------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------ |
| **macOS** (Apple Silicon `arm64`) | macOS 11+           | [VuaOffice-0.6.7-arm64.dmg](https://github.com/360org/vuaoffice/releases/latest/download/VuaOffice-0.6.7-arm64.dmg) |
| **macOS** (Intel `x64`)           | macOS 11+           | [VuaOffice-0.6.7-x64.dmg](https://github.com/360org/vuaoffice/releases/latest/download/VuaOffice-0.6.7-x64.dmg)     |
| **Windows** (x64)                 | Windows 10 / 11     | [VuaOffice-0.6.7-Windows-x64-Setup.exe](https://github.com/360org/vuaoffice/releases/latest/download/VuaOffice-0.6.7-Windows-x64-Setup.exe) |
| **Linux** (Debian / Ubuntu)       | x86_64, glibc 2.34+ | [vuaoffice_0.6.7_amd64.deb](https://github.com/360org/vuaoffice/releases/latest/download/vuaoffice_0.6.7_amd64.deb) |
| **Linux** (AppImage)              | x86_64, FUSE 2      | [VuaOffice-0.6.7.AppImage](https://github.com/360org/vuaoffice/releases/latest/download/VuaOffice-0.6.7.AppImage)   |

---

## 🔄 Quy trình Đồng bộ & Xử lý Conflict khi Pull từ Official Upstream

Để đảm bảo bộ ứng dụng **VuaOffice** luôn cập nhật các tính năng và bản sửa lỗi mới nhất từ dự án gốc (`genspark-ai/genoffice`) mà **KHÔNG BỊ ĐÈ** hoặc làm mất các tùy chỉnh thương hiệu & AI Provider của 360 CORP, nhà phát triển BẮT BUỘC tuân thủ quy trình sau:

### 1. Cơ chế Whitelabel độc lập (`scripts/whitelabel.js`)

Mọi cấu hình thương hiệu VuaOffice được lưu tập trung tại `whitelabel/brand-config.json`.

- Lệnh áp dụng branding: `node scripts/whitelabel.js apply`
- Lệnh hoàn tác về codebase gốc: `node scripts/whitelabel.js restore`

### 2. Các bước Pull & Merge không conflict

Khi cần đồng bộ code mới nhất từ upstream:

```bash
<<<<<<< HEAD
# Bước 1: Khai báo upstream (nếu chưa có) và fetch code mới nhất
git remote add upstream https://github.com/genspark-ai/genoffice.git 2>/dev/null || true
git fetch upstream main

# Bước 2: Kiểm tra khả năng conflict trước khi merge
git merge-tree $(git merge-base HEAD upstream/main) HEAD upstream/main

# Bước 3: Tiến hành Merge chính thức
git merge upstream/main -m "merge: sync latest official upstream code into main"

# Bước 4: Trong trường hợp có xung đột (conflict) ở các file UI/Brand:
# Ưu tiên giữ lại bản tùy chỉnh của VuaOffice cho các file giao diện gốc
git checkout --ours apps/shell/src/renderer/src/Home.tsx apps/shell/src/renderer/src/strings.ts

# Bước 5: Chạy lại công cụ Whitelabel để áp dụng lại toàn bộ nhận diện VuaOffice & AI Providers
node scripts/whitelabel.js apply

# Bước 6: Thêm thay đổi và hoàn tất commit merge
git add .
git commit -m "merge: resolved conflicts and reapplied VuaOffice whitelabel"
git push origin main
```

---

## 🧠 Cấu hình AI Provider (OmiRouter / 9Router / Hermes / Custom)

VuaOffice hỗ trợ kết nối trực tiếp đến các AI Gateway của 360 CORP hoặc nhà cung cấp tùy chỉnh mà không phụ thuộc vào tài khoản Genspark mặc định:

- **OmiRouter AI**: Cấu hình mặc định với Base URL `https://api.omirouter.com/v1`
- **9Router AI**: Cấu hình với Base URL `https://api.9router.com/v1`
- **Hermes Agent**: Cấu hình với Base URL `https://hermes.vuahethong.com/v1`
- **Custom Provider**: Cho phép người dùng tự nhập OpenAI-compatible Endpoint & API Key tùy chọn ngay tại màn hình **AI Settings** trong menu tài khoản.

---

## 🛠️ Hướng dẫn Phát triển Local (Development)
=======
sudo apt install ./genoffice_0.7.204_amd64.deb
```

On Fedora / RHEL-family / openSUSE, install the rpm instead:

```bash
sudo dnf install ./genoffice-0.7.204.x86_64.rpm     # Fedora / RHEL family
sudo zypper install ./genoffice-0.7.204.x86_64.rpm  # openSUSE
```

The AppImage instead runs in place: install the FUSE 2 runtime
(`sudo apt install libfuse2`; on Ubuntu 24.04 the package is `libfuse2t64`),
make the file executable, then run it:

```bash
chmod +x GenOffice-0.7.204.AppImage
./GenOffice-0.7.204.AppImage
```

## Apps

| App             | Product                | What it is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/docs`     | **GenOffice Docs**     | `.docx` word processor. Byte-preserving round trip: only dirty paragraphs are regenerated (paragraph patch), everything else in the original file is kept byte-for-byte, so opening and saving never breaks layout in Word. Paginated view whose line metrics reproduce the original document's layout, tracked changes, comments, styles, equations, ink.                                                                                                                                                                                                      |
| `apps/sheets`   | **GenOffice Sheets**   | `.xlsx` spreadsheet. UI built on the open-source [Univer](https://github.com/dream-num/univer) core (Apache-2.0) with a large layer of in-house extensions; `.xlsx` import/export runs through an in-house Rust sidecar (calamine + IronCalc), charts are rendered in-house (Konva), plus pivot tables, slicers, conditional formatting, and formula tracing.                                                                                                                                                                                                   |
| `apps/slides`   | **GenOffice Slides**   | `.pptx` presentations. In-house `.pptx` parse/render/edit engine with masters, charts, cropping, ink, and text shaping (HarfBuzz metrics).                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `apps/pdf`      | **GenOffice PDF**      | `.pdf` viewer/editor on [pdf.js](https://github.com/mozilla/pdf.js) (Apache-2.0) + [pdf-lib](https://github.com/Hopding/pdf-lib) (MIT): annotations, forms, outlines, stamps, signatures, page operations, and printing support. True text editing — paragraph selection with in-block reflow, alignment restoration, original-font preservation — and content-stream image insert/edit, all rewriting page content streams through [PDFium](https://pdfium.googlesource.com/pdfium/) wasm (BSD-3-Clause) with subset-embedded fonts — no cover-up annotations. |
| `apps/markdown` | **GenOffice Markdown** | `.md` / `.markdown` editor: Tiptap block editor over plain Markdown files — headings, lists, tables, images, code blocks — saved back as plain Markdown, hosted in shell tabs.                                                                                                                                                                                                                                                                                                                                                                                  |
| `apps/shell`    | **GenOffice**          | The suite shell: home screen, tabbed hosting of the five editors, light/dark/system theme, auto-update.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

Every app embeds the same AI panel: block-granular AI editing with version
snapshots and diffs in docs, a tool-calling agent over workbook/slide/PDF
state in the others.

The whole suite ships light / dark / system UI themes built on shared design
tokens (`packages/ui`), with a CI guard that keeps chrome colors on the token
system. Document surfaces stay light in dark mode — Word-style dark chrome
around white paper — so files render and export identically in both themes.

**AI backend (Genspark).** The apps sign in to a Genspark account through a
device-code flow; no model API key is entered or stored by the user. Model
calls route through the Genspark proxy (Claude, GPT, and Gemini families).
The same account also unlocks the Genspark ("gsk") tool endpoints the agents
build on — web and image search, image generation and editing,
image/audio/video analysis, and audio transcription — all reachable through
`packages/ai-search` for anyone extending the agent layer.

## Engine packages

All pure TypeScript, no Electron dependency, unit-tested (except the UI kit):

- `packages/docx-engine` — docx parsing → block tree (with `docxIndex`
  anchors and passthrough), OOXML fragment generation, byte-level paragraph
  patching.
- `packages/pptx-engine` / `packages/pptx-render` — pptx model and rendering.
- `packages/file-parse` — text extraction for AI attachments (office formats,
  text formats).
- `packages/agent-core` — the AI agent loop and skill composition shared by
  every app.
- `packages/ai-provider` — provider abstraction and streaming for the model
  backends.
- `packages/ai-search` — Genspark auth + web/image search tools.
- `packages/i18n`, `packages/ui`, `packages/project-store`,
  `packages/electron-utils` — shared i18n core, React UI kit, recent-files
  store, and Electron main-process helpers.

## Development
>>>>>>> upstream/main

```bash
# Cài đặt phụ thuộc
npm install

# Tạo dữ liệu test .docx fixtures
npm run fixtures

# Kiểm tra TypeScript & Unit test
npm run typecheck
npm test

# Chạy ứng dụng dev ở môi trường local
npm run dev

# Đóng gói sản phẩm cho macOS / Windows / Linux
npm run dist:mac
npm run dist:win
npm run dist:linux
```

---

## 📚 Cấu trúc Tài liệu Dự án (Documentation)

Toàn bộ tài liệu kiến trúc, đặc tả và hướng dẫn kỹ thuật của VuaOffice được tổ chức tập trung trong thư mục [`/Volumes/DATA/DEV/vuaoffice/docs/`](docs/):

- **Tài liệu hệ thống cốt lõi**:
  - [Ý tưởng & Định hướng (`IDEA.md`)](docs/IDEA.md)
  - [Kiến trúc Tổng thể (`ARCH.md`)](docs/ARCH.md)
  - [Đặc tả Kỹ thuật (`SPEC.md`)](docs/SPEC.md)
  - [Yêu cầu Chức năng (`REQUIREMENTS.md`)](docs/REQUIREMENTS.md)
  - [Hướng dẫn Triển khai & Build (`DEPLOY_GUIDE.md`)](docs/DEPLOY_GUIDE.md)
  - [Nhật ký Phát triển (`CHANGELOGS.md`)](docs/CHANGELOGS.md)
  - [Chính sách Bảo mật (`SECURITY.md`)](docs/SECURITY.md)
  - [Hướng dẫn Đóng góp (`CONTRIBUTING.md`)](docs/CONTRIBUTING.md)
  - [Cấu hình AI Agent (`AGENTS.md`)](docs/AGENTS.md)
- **Tài liệu chi tiết theo từng Ứng dụng**:
  - [VuaOffice Docs](docs/docs/architecture.md)
  - [VuaOffice Sheets](docs/sheets/architecture.md)
  - [VuaOffice Slides](docs/slides/architecture.md)
  - [VuaOffice PDF](docs/pdf/architecture.md)
  - [VuaOffice Markdown](docs/markdown/architecture.md)
  - [VuaOffice Mail](docs/mail/architecture.md)
  - [VuaOffice Shell](docs/shell/architecture.md)

---

## ⚖️ Bản quyền & Ghi nhận (Attribution & License)

- **Mã nguồn**: VuaOffice được phát triển dựa trên dự án mã nguồn mở **GenOffice** tuân thủ theo [Apache License 2.0](LICENSE).
- **Ghi nhận tác giả (Attribution Notice)**:
  - **Original Work**: Copyright 2026 Mainfunc, Inc. (GenOffice).
  - **Derivative Work & Customizations**: Copyright 2026 360 CORP (VuaOffice).
- **Thương hiệu**: Nhãn hiệu "VuaOffice" và "360 CORP" thuộc sở hữu của 360 CORP. Nhãn hiệu "GenOffice" và "Genspark" thuộc sở hữu của Mainfunc, Inc.
