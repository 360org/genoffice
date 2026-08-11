#!/bin/bash
# Script gỡ bỏ sạch sẽ VuaOffice trên macOS (dành cho Dev / QC Testing)

echo "=== Bắt đầu gỡ bỏ sạch sẽ VuaOffice ==="

# 1. Đóng app nếu đang chạy
pkill -f "VuaOffice" 2>/dev/null
pkill -f "GenOffice" 2>/dev/null

# 2. Xoá File App trong Applications
sudo rm -rf "/Applications/VuaOffice.app" 2>/dev/null
sudo rm -rf "/Applications/GenOffice.app" 2>/dev/null
rm -rf "$HOME/Applications/VuaOffice.app" 2>/dev/null

# 3. Xoá sạch Cache, Application Support, Preferences và Saved State
rm -rf "$HOME/Library/Application Support/VuaOffice"
rm -rf "$HOME/Library/Application Support/com.vuahethong.vuaoffice"
rm -rf "$HOME/Library/Caches/com.vuahethong.vuaoffice"
rm -rf "$HOME/Library/Caches/com.vuahethong.vuaoffice.ShipIt"
rm -rf "$HOME/Library/Preferences/com.vuahethong.vuaoffice.plist"
rm -rf "$HOME/Library/Saved Application State/com.vuahethong.vuaoffice.savedState"
rm -rf "$HOME/Library/Logs/VuaOffice"

# Xoá thêm data GenOffice legacy nếu có
rm -rf "$HOME/Library/Application Support/GenOffice"
rm -rf "$HOME/Library/Caches/com.genspark.office"

echo "=== Đã gỡ sạch VuaOffice! Sếp có thể cài lại từ file DMG mới ==="
