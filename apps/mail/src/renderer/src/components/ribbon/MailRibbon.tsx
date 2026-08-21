import React from 'react'
import { RibbonButton } from './RibbonButton'

interface MailRibbonProps {
  onNewEmail: () => void
  onDelete: () => void
  onArchive: () => void
  onReply: () => void
  onReplyAll: () => void
  onForward: () => void
  onAiAssist: () => void
  hasSelectedEmail: boolean
}

export const MailRibbon: React.FC<MailRibbonProps> = ({
  onNewEmail,
  onDelete,
  onArchive,
  onReply,
  onReplyAll,
  onForward,
  onAiAssist,
  hasSelectedEmail,
}) => {
  return (
    <div className="mail-ribbon">
      <RibbonButton
        primary
        label="New mail"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        }
        onClick={onNewEmail}
      />
      <div className="ribbon-divider" />
      <RibbonButton
        label="Delete"
        disabled={!hasSelectedEmail}
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        }
        onClick={onDelete}
      />
      <RibbonButton
        label="Archive"
        disabled={!hasSelectedEmail}
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
        }
        onClick={onArchive}
      />
      <div className="ribbon-divider" />
      <RibbonButton
        label="Reply"
        disabled={!hasSelectedEmail}
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 14 4 9 9 4" />
            <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
          </svg>
        }
        onClick={onReply}
      />
      <RibbonButton
        label="Reply All"
        disabled={!hasSelectedEmail}
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="7 14 2 9 7 4" />
            <polyline points="13 14 8 9 13 4" />
            <path d="M22 20v-7a4 4 0 0 0-4-4H8" />
          </svg>
        }
        onClick={onReplyAll}
      />
      <RibbonButton
        label="Forward"
        disabled={!hasSelectedEmail}
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 14 20 9 15 4" />
            <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
          </svg>
        }
        onClick={onForward}
      />
      <div className="ribbon-divider" />
      <RibbonButton
        label="VuaOffice AI Assist"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0078d4" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        }
        onClick={onAiAssist}
      />
    </div>
  )
}
