# Project Guidelines (GENERIC)

> File do AIaC tạo. Quy tắc global được kế thừa từ Global CLAUDE.md.

## Quy tắc cục bộ
- Kế thừa Global CLAUDE.md; không lặp hoặc ghi đè các rule global.
- Chỉ sửa cấu hình `.claude/` do AIaC tạo; giữ nguyên file cục bộ có sẵn.
- Khi cần kỹ năng mới, kiểm tra ECC và 360org trước để tránh trùng lặp.
- **Code Knowledge Graph (360-graphify)**: Codebase đã được index tại `/Volumes/DATA/DEV/vuaoffice/graphify-out/graph.json` và kết nối MCP Server `graphify`. Khi audit hoặc định vị tính năng/hàm/caller/callee, ưu tiên tra cứu qua MCP Server hoặc CLI `/Volumes/DATA/DEV/aiac/360org/plugins/360-graphify/scripts/graphify-run.sh` thay vì quét file nguồn toàn cục.

