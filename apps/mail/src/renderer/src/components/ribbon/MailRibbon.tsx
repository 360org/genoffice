import React, { useState } from 'react'
import { GensparkMark } from './GensparkMark'
import { IconX, IconUser } from '../common/MailIcons'

interface MailRibbonProps {
  onNewMail: () => void
  onNewMeeting?: () => void
  onDelete: () => void
  onArchive: () => void
  onJunk?: () => void
  onReply: () => void
  onReplyAll: () => void
  onForward: () => void
  onMarkReadUnread?: () => void
  onToggleFlag?: () => void
  onCategorize?: () => void
  onMoveToFolder?: () => void
  onOpenAddressBook?: () => void
  onFilterEmails?: () => void
  onAiAssist: () => void
  onAiDraft?: () => void
  onSyncNow?: () => void
  onManageRules?: () => void
  onOpenImportExport?: () => void
  onOpenProfile?: () => void
  isSyncing?: boolean
  hasSelectedEmail: boolean
  isSelectedRead?: boolean
  isSelectedFlagged?: boolean
  aiOpen: boolean
  onToggleAi: () => void
  searchQuery: string
  onSearchChange: (q: string) => void
  activeAccountEmail?: string
}

type RibbonTab = 'home' | 'sendreceive' | 'folder' | 'view'

export const MailRibbon: React.FC<MailRibbonProps> = ({
  onNewMail,
  onNewMeeting,
  onDelete,
  onArchive,
  onJunk,
  onReply,
  onReplyAll,
  onForward,
  onMarkReadUnread,
  onToggleFlag,
  onCategorize,
  onMoveToFolder,
  onOpenAddressBook,
  onFilterEmails,
  onAiAssist,
  onAiDraft,
  onSyncNow,
  onManageRules,
  onOpenImportExport,
  onOpenProfile,
  isSyncing,
  hasSelectedEmail,
  isSelectedRead = true,
  isSelectedFlagged = false,
  aiOpen,
  onToggleAi,
  searchQuery,
  onSearchChange,
  activeAccountEmail,
}) => {
  const [activeTab, setActiveTab] = useState<RibbonTab>('home')

  return (
    <div className="ribbon">
      {/* Top Tab Strip & Quick Access Toolbar (Parity with Microsoft Outlook 365 & VuaOffice Suite) */}
      <div className="ribbon-tabs">
        {/* Quick Access Action Buttons */}
        <div className="ribbon-qat">
          <button
            type="button"
            className="qa-btn new-mail-qa"
            title="Soạn thư mới (Ctrl+N)"
            onClick={onNewMail}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
          <button
            type="button"
            className="qa-btn"
            title="Đồng bộ / Gửi & Nhận thư (F9)"
            disabled={isSyncing}
            onClick={onSyncNow}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isSyncing ? 'spinning' : ''}
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
          <div className="qa-sep" />
        </div>

        {/* Standard Outlook Ribbon Navigation Tabs */}
        <div className="ribbon-tab-list">
          <button
            type="button"
            className={`ribbon-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Trang chủ
          </button>
          <button
            type="button"
            className={`ribbon-tab-btn ${activeTab === 'sendreceive' ? 'active' : ''}`}
            onClick={() => setActiveTab('sendreceive')}
          >
            Gửi / Nhận
          </button>
          <button
            type="button"
            className={`ribbon-tab-btn ${activeTab === 'folder' ? 'active' : ''}`}
            onClick={() => setActiveTab('folder')}
          >
            Thư mục & Quy tắc
          </button>
          <button
            type="button"
            className={`ribbon-tab-btn ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            Xem & Bố cục
          </button>
        </div>

        {/* Global Search Bar centered/aligned */}
        <div className="ribbon-search-box">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm thư, người gửi, tài liệu..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <IconX size={12} />
            </button>
          )}
        </div>

        {/* Top-right AI Trigger & Profile/Settings Trigger */}
        <div className="ribbon-tabs-right">
          <button
            type="button"
            className={`copilot-btn ${aiOpen ? 'active' : ''}`}
            onClick={onToggleAi}
            title="Bật/Tắt trợ lý VuaOffice AI"
          >
            <GensparkMark size={16} />
            <span>VuaOffice AI</span>
          </button>

          {onOpenProfile && (
            <button
              type="button"
              className="account-badge profile-icon-btn"
              title={activeAccountEmail ? `Hồ sơ & Cài đặt (${activeAccountEmail})` : 'Hồ sơ cá nhân & Cài đặt tài khoản'}
              onClick={onOpenProfile}
            >
              <span className="profile-icon-avatar">
                <IconUser size={15} />
              </span>
              <span className="status-dot" />
            </button>
          )}
        </div>
      </div>

      {/* Ribbon Body (Fixed 80px Height conforming to VuaOffice Suite Standards) */}
      <div className="ribbon-body">
        {activeTab === 'home' && (
          <>
            {/* Nhóm 1: New Items (Chuẩn Outlook: Soạn thư & Cuộc họp) */}
            <div className="ribbon-group">
              <div className="ribbon-group-items">
                <button
                  type="button"
                  className="rb-big rb-primary"
                  onClick={onNewMail}
                  title="Soạn thư mới (Ctrl+N)"
                >
                  <span className="rb-big-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </span>
                  <span>Soạn thư</span>
                </button>
                <button
                  type="button"
                  className="rb-big"
                  onClick={onNewMeeting}
                  title="Tạo lịch hẹn / Cuộc họp mới (Ctrl+Shift+Q)"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <line x1="12" y1="14" x2="12" y2="18" />
                      <line x1="10" y1="16" x2="14" y2="16" />
                    </svg>
                  </span>
                  <span>Mục mới</span>
                </button>
              </div>
            </div>

            <div className="ribbon-sep" />

            {/* Nhóm 2: Xử lý & Xoá (Delete / Archive / Junk) */}
            <div className="ribbon-group">
              <div className="ribbon-group-items">
                <button
                  type="button"
                  className="rb-big"
                  disabled={!hasSelectedEmail}
                  onClick={onDelete}
                  title="Xoá thư đã chọn (Delete)"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </span>
                  <span>Xoá</span>
                </button>
                <button
                  type="button"
                  className="rb-big"
                  disabled={!hasSelectedEmail}
                  onClick={onArchive}
                  title="Lưu trữ thư vào Archive (Backspace)"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="21 8 21 21 3 21 3 8" />
                      <rect x="1" y="3" width="22" height="5" />
                      <line x1="10" y1="12" x2="14" y2="12" />
                    </svg>
                  </span>
                  <span>Lưu trữ</span>
                </button>
                <button
                  type="button"
                  className="rb-big"
                  disabled={!hasSelectedEmail}
                  onClick={onJunk}
                  title="Báo cáo Thư rác / Chặn người gửi (Junk)"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                  </span>
                  <span>Thư rác</span>
                </button>
              </div>
            </div>

            <div className="ribbon-sep" />

            {/* Nhóm 3: Phản hồi & Chuyển tiếp (Reply / Reply All / Forward) */}
            <div className="ribbon-group">
              <div className="ribbon-group-items">
                <button
                  type="button"
                  className="rb-big"
                  disabled={!hasSelectedEmail}
                  onClick={onReply}
                  title="Trả lời người gửi (Ctrl+R)"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 14 4 9 9 4" />
                      <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                    </svg>
                  </span>
                  <span>Trả lời</span>
                </button>
                <button
                  type="button"
                  className="rb-big"
                  disabled={!hasSelectedEmail}
                  onClick={onReplyAll}
                  title="Trả lời tất cả người nhận (Ctrl+Shift+R)"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="7 14 2 9 7 4" />
                      <polyline points="13 14 8 9 13 4" />
                      <path d="M22 20v-7a4 4 0 0 0-4-4H8" />
                    </svg>
                  </span>
                  <span>Trả lời tất cả</span>
                </button>
                <button
                  type="button"
                  className="rb-big"
                  disabled={!hasSelectedEmail}
                  onClick={onForward}
                  title="Chuyển tiếp email (Ctrl+F)"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 14 20 9 15 4" />
                      <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
                    </svg>
                  </span>
                  <span>Chuyển tiếp</span>
                </button>
              </div>
            </div>

            <div className="ribbon-sep" />

            {/* Nhóm 4: Tags & Theo dõi (Read/Unread / Categorize / Follow-up / Move) */}
            <div className="ribbon-group">
              <div className="ribbon-group-items">
                <button
                  type="button"
                  className="rb-big"
                  disabled={!hasSelectedEmail}
                  onClick={onMarkReadUnread}
                  title={isSelectedRead ? 'Đánh dấu Chưa đọc (Ctrl+U)' : 'Đánh dấu Đã đọc (Ctrl+Q)'}
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {isSelectedRead ? (
                        <>
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </>
                      ) : (
                        <>
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="3" fill="currentColor" />
                        </>
                      )}
                    </svg>
                  </span>
                  <span>{isSelectedRead ? 'Chưa đọc' : 'Đã đọc'}</span>
                </button>
                <button
                  type="button"
                  className="rb-big"
                  disabled={!hasSelectedEmail}
                  onClick={onToggleFlag}
                  title="Gắn cờ theo dõi / Follow Up"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isSelectedFlagged ? '#e11d48' : 'none'} stroke={isSelectedFlagged ? '#e11d48' : 'currentColor'} strokeWidth="2">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" />
                    </svg>
                  </span>
                  <span>Theo dõi</span>
                </button>
                <button
                  type="button"
                  className="rb-big"
                  disabled={!hasSelectedEmail}
                  onClick={onCategorize}
                  title="Phân loại nhãn màu sắc"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                  </span>
                  <span>Phân loại</span>
                </button>
                <button
                  type="button"
                  className="rb-big"
                  disabled={!hasSelectedEmail}
                  onClick={onMoveToFolder}
                  title="Di chuyển thư sang thư mục khác"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      <polyline points="12 11 12 17 15 14" />
                    </svg>
                  </span>
                  <span>Di chuyển</span>
                </button>
              </div>
            </div>

            <div className="ribbon-sep" />

            {/* Nhóm 5: Tìm & Danh bạ (Filter & Address Book) */}
            <div className="ribbon-group">
              <div className="ribbon-group-items">
                <button
                  type="button"
                  className="rb-big"
                  onClick={onOpenAddressBook}
                  title="Mở Danh bạ / Sổ địa chỉ (Address Book)"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </span>
                  <span>Danh bạ</span>
                </button>
                <button
                  type="button"
                  className="rb-big"
                  onClick={onFilterEmails}
                  title="Lọc nhanh danh sách thư"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                  </span>
                  <span>Lọc thư</span>
                </button>
              </div>
            </div>

            <div className="ribbon-sep" />

            {/* Nhóm 6: VuaOffice AI Suite */}
            <div className="ribbon-group">
              <div className="ribbon-group-items">
                <button
                  type="button"
                  className={`rb-big ai-entry ${aiOpen ? 'active' : ''}`}
                  onClick={onToggleAi}
                  title="Mở bảng trợ lý VuaOffice AI"
                >
                  <span className="rb-big-icon">
                    <GensparkMark size={24} />
                  </span>
                  <span>VuaOffice AI</span>
                </button>
                <button
                  type="button"
                  className="rb-big ai-entry"
                  disabled={!hasSelectedEmail}
                  onClick={onAiAssist}
                  title="Tóm tắt nội dung email bằng VuaOffice AI"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </span>
                  <span>Tóm tắt AI</span>
                </button>
                <button
                  type="button"
                  className="rb-big ai-entry"
                  disabled={!hasSelectedEmail}
                  onClick={onAiDraft}
                  title="Soạn thư trả lời thông minh bằng AI"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 19l7-7 3 3-7 7-3-3z" />
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                      <path d="M2 2l7.586 7.586" />
                      <circle cx="11" cy="11" r="2" />
                    </svg>
                  </span>
                  <span>AI Smart Draft</span>
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'sendreceive' && (
          <>
            {/* Nhóm Gửi & Nhận Toàn bộ (Outlook 365 Parity) */}
            <div className="ribbon-group">
              <div className="ribbon-group-items">
                <button
                  type="button"
                  className="rb-big rb-primary"
                  disabled={isSyncing}
                  onClick={onSyncNow}
                  title="Gửi và nhận tất cả thư mục (F9)"
                >
                  <span className="rb-big-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                  </span>
                  <span>{isSyncing ? 'Đang đồng bộ...' : 'Gửi / Nhận tất cả'}</span>
                </button>
                <button
                  type="button"
                  className="rb-big"
                  disabled={isSyncing}
                  onClick={onSyncNow}
                  title="Cập nhật thư mục hiện tại"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                  </span>
                  <span>Cập nhật thư mục</span>
                </button>
              </div>
            </div>

            <div className="ribbon-sep" />

            {/* Nhóm Trạng thái kết nối */}
            <div className="ribbon-group">
              <div className="ribbon-group-items">
                <button
                  type="button"
                  className="rb-big"
                  title="Trạng thái đồng bộ ngoại tuyến SQLite WAL"
                >
                  <span className="rb-big-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                    </svg>
                  </span>
                  <span>SQLite Offline</span>
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'folder' && (
          <>
            {/* Nhóm Quy tắc & Bộ lọc */}
            <div className="ribbon-group">
              <div className="ribbon-group-items">
                <button
                  type="button"
                  className="rb-big"
                  onClick={onManageRules}
                  title="Cấu hình bộ lọc & quy tắc tự động xử lý thư"
                >
                  <span className="rb-big-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </span>
                  <span>Quy tắc & Bộ lọc</span>
                </button>
                <button
                  type="button"
                  className="rb-big"
                  onClick={onOpenImportExport}
                  title="Nhập / Xuất dữ liệu thư (.pst & .eml)"
                >
                  <span className="rb-big-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </span>
                  <span>Nhập / Xuất (.pst)</span>
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'view' && (
          <>
            {/* Nhóm Bố cục giao diện */}
            <div className="ribbon-group">
              <div className="ribbon-group-items">
                <button
                  type="button"
                  className={`rb-big ${aiOpen ? 'active' : ''}`}
                  onClick={onToggleAi}
                  title="Hiển thị / Thu gọn bảng AI"
                >
                  <span className="rb-big-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="15" y1="3" x2="15" y2="21" />
                    </svg>
                  </span>
                  <span>Bảng AI Dock</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

