import React, { useState } from 'react'
import type { EmailAccount, MailFolder } from '../../../../shared/types'
import {
  IconInbox,
  IconFileText,
  IconSend,
  IconArchive,
  IconTrash,
  IconFolder,
  IconChevronDown,
  IconChevronRight,
} from '../common/MailIcons'

interface FolderTreeProps {
  accounts: EmailAccount[]
  activeAccountId: string
  onSelectAccount: (accountId: string) => void
  folders: MailFolder[]
  activeFolderId: string
  onSelectFolder: (folderId: string, accountId: string) => void
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  accounts,
  activeAccountId,
  onSelectAccount,
  folders,
  activeFolderId,
  onSelectFolder,
}) => {
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({
    acc_primary: true,
    acc_secondary: true,
  })

  const toggleExpand = (accId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedAccounts((prev) => ({ ...prev, [accId]: !prev[accId] }))
  }

  const getFolderIcon = (kind: string) => {
    switch (kind) {
      case 'inbox':
        return <IconInbox size={15} color="var(--mail-primary-blue, #0077cd)" />
      case 'drafts':
        return <IconFileText size={15} color="var(--text-secondary, #606366)" />
      case 'sent':
        return <IconSend size={15} color="var(--mail-brand-green, #00ce2c)" />
      case 'archive':
        return <IconArchive size={15} color="var(--text-secondary, #606366)" />
      case 'trash':
        return <IconTrash size={15} color="var(--danger, #d13438)" />
      default:
        return <IconFolder size={15} color="var(--text-secondary, #606366)" />
    }
  }

  const getFolderLabel = (f: MailFolder) => {
    switch (f.kind) {
      case 'inbox':
        return 'Hộp thư đến'
      case 'drafts':
        return 'Thư nháp'
      case 'sent':
        return 'Thư đã gửi'
      case 'archive':
        return 'Kho lưu trữ'
      case 'trash':
        return 'Thùng rác'
      default:
        return f.name
    }
  }

  // Favorite quick links: only show favorites for current active account to avoid duplicates
  const favoriteFolders = folders.filter((f) => f.accountId === activeAccountId && f.isFavorite)

  return (
    <div className="mail-folders">
      {/* Favorites Section */}
      {favoriteFolders.length > 0 && (
        <div className="folder-section">
          <div className="folder-group-title">MỤC YÊU THÍCH</div>
          {favoriteFolders.map((f) => {
            const isActive = activeFolderId === f.id && activeAccountId === f.accountId
            return (
              <div
                key={`fav_${f.id}`}
                className={`folder-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectAccount(f.accountId)
                  onSelectFolder(f.id, f.accountId)
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getFolderIcon(f.kind)}
                  <span>{getFolderLabel(f)}</span>
                </div>
                {f.unreadCount > 0 && <span className="folder-unread">{f.unreadCount}</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* Account Trees */}
      {accounts.map((acc) => {
        const isExpanded = expandedAccounts[acc.id] ?? true
        const accFolders = folders.filter((f) => f.accountId === acc.id)

        return (
          <div key={acc.id} className="folder-account-group" style={{ marginTop: '8px' }}>
            <div
              className={`folder-account-header ${activeAccountId === acc.id ? 'current-acc' : ''}`}
              onClick={() => onSelectAccount(acc.id)}
            >
              <button
                type="button"
                className="expand-btn"
                onClick={(e) => toggleExpand(acc.id, e)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {isExpanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
              </button>
              <div className="account-title-box">
                <span className="account-name">{acc.name}</span>
                <span className="account-email">{acc.email}</span>
              </div>
            </div>

            {isExpanded && (
              <div className="account-folders-list">
                {accFolders.map((f) => {
                  const isActive = activeFolderId === f.id && activeAccountId === acc.id
                  return (
                    <div
                      key={f.id}
                      className={`folder-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        onSelectAccount(acc.id)
                        onSelectFolder(f.id, acc.id)
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getFolderIcon(f.kind)}
                        <span>{getFolderLabel(f)}</span>
                      </div>
                      {f.unreadCount > 0 && <span className="folder-unread">{f.unreadCount}</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
