import React from 'react'
import type { EmailMessage } from '../../../../shared/types'

interface MailListProps {
  emails: EmailMessage[]
  selectedEmailId: string | null
  onSelectEmail: (emailId: string) => void
  categoryTab: 'focused' | 'other'
  onCategoryChange: (cat: 'focused' | 'other') => void
}

export const MailList: React.FC<MailListProps> = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  categoryTab,
  onCategoryChange,
}) => {
  return (
    <div className="vuamail-msglist">
      <div className="msglist-header">
        <div className="msglist-tabs">
          <div
            className={`msg-tab ${categoryTab === 'focused' ? 'active' : ''}`}
            onClick={() => onCategoryChange('focused')}
          >
            Focused
          </div>
          <div
            className={`msg-tab ${categoryTab === 'other' ? 'active' : ''}`}
            onClick={() => onCategoryChange('other')}
          >
            Other
          </div>
        </div>
      </div>

      <div className="msglist-items">
        {emails.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No messages in this folder
          </div>
        ) : (
          emails.map((msg) => {
            const date = new Date(msg.dateIso)
            const dateStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            return (
              <div
                key={msg.id}
                className={`msg-card ${msg.id === selectedEmailId ? 'active' : ''} ${!msg.isRead ? 'unread' : ''}`}
                onClick={() => onSelectEmail(msg.id)}
              >
                <div className="msg-top">
                  <span className="msg-sender">{msg.senderName || msg.senderEmail}</span>
                  <span className="msg-date">{dateStr}</span>
                </div>
                <div className="msg-subject">{msg.subject || '(No subject)'}</div>
                <div className="msg-snippet">{msg.snippet}</div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
