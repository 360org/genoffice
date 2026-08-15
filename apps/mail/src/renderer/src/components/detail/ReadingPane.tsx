import React from 'react'
import type { EmailBody, EmailMessage } from '../../../../shared/types'

interface ReadingPaneProps {
  email: EmailMessage | null
  body: EmailBody | null
  aiSummary: string | null
  isLoadingBody: boolean
  onTriggerAiSummary: () => void
}

export const ReadingPane: React.FC<ReadingPaneProps> = ({
  email,
  body,
  aiSummary,
  isLoadingBody,
  onTriggerAiSummary,
}) => {
  if (!email) {
    return (
      <div
        className="vuamail-reading"
        style={{ alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        <div style={{ marginTop: '12px', fontSize: '15px' }}>Select an email to read</div>
      </div>
    )
  }

  const initial = (email.senderName || email.senderEmail || 'U').charAt(0).toUpperCase()

  return (
    <div className="vuamail-reading">
      <div className="reading-header">
        <div className="reading-subject">{email.subject || '(No subject)'}</div>
        <div className="reading-meta">
          <div className="reading-avatar">{initial}</div>
          <div>
            <div className="reading-sender-name">{email.senderName}</div>
            <div className="reading-sender-email">
              &lt;{email.senderEmail}&gt; • To: {email.recipientEmails.join(', ')}
            </div>
          </div>
        </div>
      </div>

      {aiSummary && (
        <div className="ai-summary-card">
          <div className="ai-summary-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            VuaOffice AI Summary
          </div>
          <div className="ai-summary-text">{aiSummary}</div>
        </div>
      )}

      {!aiSummary && (
        <button
          className="ribbon-btn"
          style={{ width: 'fit-content', marginBottom: '16px', border: '1px solid var(--border)' }}
          onClick={onTriggerAiSummary}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0078d4" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Tóm tắt email này với VuaOffice AI
        </button>
      )}

      {isLoadingBody ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading content...</div>
      ) : body?.html ? (
        <div className="reading-body" dangerouslySetInnerHTML={{ __html: body.html }} />
      ) : (
        <div className="reading-body">{body?.plainText || email.snippet}</div>
      )}
    </div>
  )
}
