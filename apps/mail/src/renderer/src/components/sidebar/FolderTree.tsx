import React from 'react'
import type { MailFolder } from '../../../../shared/types'

interface FolderTreeProps {
  folders: MailFolder[]
  activeFolderId: string
  onSelectFolder: (folderId: string) => void
  accountEmail: string
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  activeFolderId,
  onSelectFolder,
  accountEmail,
}) => {
  const favorites = folders.filter((f) => f.isFavorite)
  const allFolders = folders

  return (
    <div className="mail-folders">
      {favorites.length > 0 && (
        <>
          <div className="folder-group-title">Favorites</div>
          {favorites.map((f) => (
            <div
              key={`fav_${f.id}`}
              className={`folder-item ${activeFolderId === f.id ? 'active' : ''}`}
              onClick={() => onSelectFolder(f.id)}
            >
              <span>{f.name}</span>
              {f.unreadCount > 0 && <span className="folder-unread">{f.unreadCount}</span>}
            </div>
          ))}
        </>
      )}

      <div className="folder-group-title">{accountEmail || 'Mailbox'}</div>
      {allFolders.map((f) => (
        <div
          key={f.id}
          className={`folder-item ${activeFolderId === f.id ? 'active' : ''}`}
          onClick={() => onSelectFolder(f.id)}
        >
          <span>{f.name}</span>
          {f.unreadCount > 0 && <span className="folder-unread">{f.unreadCount}</span>}
        </div>
      ))}
    </div>
  )
}
