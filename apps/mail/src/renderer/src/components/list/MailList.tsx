import React, { useState } from 'react'
import type { EmailMessage } from '../../../../shared/types'
import {
  IconRefresh,
  IconStar,
  IconPaperclip,
  IconMail,
  IconCheck,
} from '../common/MailIcons'

interface MailListProps {
  emails: EmailMessage[]
  selectedEmailId: string | null
  onSelectEmail: (emailId: string) => void
  categoryTab: string
  onCategoryChange: (cat: string) => void
  onRefresh?: () => void
}

const CATEGORY_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'primary', label: 'Chính (Primary)' },
  { id: 'social', label: 'Mạng xã hội' },
  { id: 'promotions', label: 'Khuyến mãi' },
  { id: 'updates', label: 'Cập nhật' },
]

type FilterType = 'all' | 'unread' | 'flagged' | 'attachments'

const AVATAR_COLORS = ['#0077cd', '#107c41', '#8764b8', '#d13438', '#008272', '#b4009e', '#d83b01']

export const MailList: React.FC<MailListProps> = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  categoryTab,
  onCategoryChange,
  onRefresh,
}) => {
  const [filterQuery, setFilterQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const filtered = emails.filter((m) => {
    // Category tab filter
    if (categoryTab !== 'all') {
      if (categoryTab === 'primary' && m.category === 'other') return false
      if (categoryTab === 'social' && !m.snippet.toLowerCase().includes('social') && !m.subject.toLowerCase().includes('mạng xã hội')) return false
      if (categoryTab === 'promotions' && !m.snippet.toLowerCase().includes('khuyến mãi') && !m.subject.toLowerCase().includes('ưu đãi')) return false
      if (categoryTab === 'updates' && !m.snippet.toLowerCase().includes('cập nhật') && !m.subject.toLowerCase().includes('update') && !m.subject.toLowerCase().includes('vcloud') && !m.subject.toLowerCase().includes('testflight')) return false
    }

    // Advanced filter type (unread / flagged / attachments)
    if (activeFilter === 'unread' && m.isRead) return false
    if (activeFilter === 'flagged' && !m.isStarred) return false
    if (activeFilter === 'attachments' && !m.hasAttachments) return false

    // Search query filter
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase()
      return (
        m.subject.toLowerCase().includes(q) ||
        m.senderName.toLowerCase().includes(q) ||
        m.snippet.toLowerCase().includes(q)
      )
    }
    return true
  })

  // Group emails by Today / Yesterday / Earlier
  const now = new Date(2026, 7, 16) // Mock current date 2026-08-16
  const todayEmails = filtered.filter((m) => {
    const d = new Date(m.dateIso)
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth()
  })

  const yesterdayEmails = filtered.filter((m) => {
    const d = new Date(m.dateIso)
    return d.getDate() === now.getDate() - 1 && d.getMonth() === now.getMonth()
  })

  const earlierEmails = filtered.filter((m) => {
    const d = new Date(m.dateIso)
    return d.getDate() < now.getDate() - 1 || d.getMonth() < now.getMonth()
  })

  const renderEmailCard = (msg: EmailMessage, index: number) => {
    const date = new Date(msg.dateIso)
    const isToday = date.getDate() === now.getDate()
    const dateStr = isToday
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`

    const isSelected = msg.id === selectedEmailId
    const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length]
    const initial = (msg.senderName || msg.senderEmail || 'U').charAt(0).toUpperCase()

    return (
      <div
        key={msg.id}
        className={`msg-card ${isSelected ? 'active' : ''} ${!msg.isRead ? 'unread' : ''}`}
        onClick={() => onSelectEmail(msg.id)}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          padding: '10px 14px',
          cursor: 'pointer',
          borderBottom: '1px solid var(--border-subtle, #efefef)',
          backgroundColor: isSelected ? 'var(--mail-primary-blue-soft, #e5f3fc)' : 'transparent',
          borderLeft: isSelected ? '3px solid var(--mail-primary-blue, #0077cd)' : '3px solid transparent',
          position: 'relative',
          transition: 'background 0.12s ease',
        }}
      >
        {/* Unread indicator dot */}
        {!msg.isRead && (
          <span
            style={{
              position: 'absolute',
              left: '3px',
              top: '16px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--mail-primary-blue, #0077cd)',
            }}
          />
        )}

        {/* Sender Avatar Initial */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: avatarColor,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '12px',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          {initial}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: !msg.isRead ? 700 : 600,
                color: 'var(--text-primary, #232425)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {msg.senderName || msg.senderEmail}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '6px' }}>
              {msg.hasAttachments && (
                <IconPaperclip size={12} color="var(--text-muted, #878e96)" />
              )}
              {msg.isStarred && (
                <IconStar size={12} active />
              )}
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #878e96)' }}>
                {dateStr}
              </span>
            </div>
          </div>

          <div
            style={{
              fontSize: '12px',
              fontWeight: !msg.isRead ? 600 : 500,
              color: isSelected ? 'var(--mail-primary-blue, #0077cd)' : 'var(--text-primary, #232425)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: '2px',
            }}
          >
            {msg.subject || '(Không có tiêu đề)'}
          </div>

          <div
            style={{
              fontSize: '11.5px',
              color: 'var(--text-muted, #878e96)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.35',
            }}
          >
            {msg.snippet}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        width: '340px',
        minWidth: '280px',
        borderRight: '1px solid var(--border, #e3e6ea)',
        backgroundColor: 'var(--surface, #ffffff)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Mail List Header & Refresh */}
      <div
        style={{
          padding: '10px 14px 6px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle, #efefef)',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #232425)' }}>
          Hộp thư đến (Inbox)
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={onRefresh}
            title="Đồng bộ / Làm mới danh sách"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary, #606366)',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconRefresh size={14} />
          </button>
        </div>
      </div>

      {/* Advanced Quick Filters: All / Unread / Flagged / Attachments */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 12px',
          borderBottom: '1px solid var(--border-subtle, #f0f0f0)',
          backgroundColor: 'var(--surface, #ffffff)',
        }}
      >
        {[
          { id: 'all', label: 'Tất cả', icon: null },
          { id: 'unread', label: 'Chưa đọc', icon: null },
          { id: 'flagged', label: 'Gắn cờ', icon: <IconStar size={11} active={activeFilter === 'flagged'} style={{ marginRight: '3px' }} /> },
          { id: 'attachments', label: 'Đính kèm', icon: <IconPaperclip size={11} style={{ marginRight: '3px' }} /> },
        ].map((f) => {
          const isActive = activeFilter === f.id
          return (
            <button
              type="button"
              key={f.id}
              onClick={() => setActiveFilter(f.id as FilterType)}
              style={{
                background: isActive ? 'var(--mail-primary-blue-soft, #e5f3fc)' : 'transparent',
                border: 'none',
                color: isActive ? 'var(--mail-primary-blue, #0077cd)' : 'var(--text-secondary, #606366)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '11.5px',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {f.icon}
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Category Filter Pills (GenMail + Outlook hybrid) */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          padding: '8px 12px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          borderBottom: '1px solid var(--border, #e3e6ea)',
          backgroundColor: 'var(--surface-subtle, #f6f7f9)',
        }}
      >
        {CATEGORY_TABS.map((tab) => {
          const isActive = categoryTab === tab.id
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onCategoryChange(tab.id)}
              style={{
                padding: '4px 10px',
                borderRadius: '14px',
                border: isActive ? '1px solid var(--mail-primary-blue, #0077cd)' : '1px solid var(--border, #e3e6ea)',
                backgroundColor: isActive ? 'var(--mail-primary-blue, #0077cd)' : 'var(--surface, #ffffff)',
                color: isActive ? '#ffffff' : 'var(--text-primary, #232425)',
                fontSize: '11px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.12s ease',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Email Items Grouped by Date */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted, #878e96)', fontSize: '13px' }}>
            Không có thư nào trong mục này
          </div>
        ) : (
          <>
            {todayEmails.length > 0 && (
              <div>
                <div style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #878e96)', textTransform: 'uppercase', backgroundColor: 'var(--surface-subtle, #f6f7f9)' }}>
                  Hôm nay (Today)
                </div>
                {todayEmails.map((msg, i) => renderEmailCard(msg, i))}
              </div>
            )}

            {yesterdayEmails.length > 0 && (
              <div>
                <div style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #878e96)', textTransform: 'uppercase', backgroundColor: 'var(--surface-subtle, #f6f7f9)' }}>
                  Hôm qua (Yesterday)
                </div>
                {yesterdayEmails.map((msg, i) => renderEmailCard(msg, i + 10))}
              </div>
            )}

            {earlierEmails.length > 0 && (
              <div>
                <div style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #878e96)', textTransform: 'uppercase', backgroundColor: 'var(--surface-subtle, #f6f7f9)' }}>
                  Trước đó (Earlier)
                </div>
                {earlierEmails.map((msg, i) => renderEmailCard(msg, i + 20))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

