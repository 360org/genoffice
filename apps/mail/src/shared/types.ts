export interface EmailAccount {
  id: string
  email: string
  name: string
  provider: 'google' | 'microsoft' | 'custom_imap'
  avatarUrl?: string
  isDefault?: boolean
}

export type FolderKind = 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash' | 'junk' | 'custom'

export interface MailFolder {
  id: string
  accountId: string
  name: string
  kind: FolderKind
  iconName: string
  unreadCount: number
  totalCount: number
  isFavorite?: boolean
}

export interface EmailAttachment {
  id: string
  filename: string
  sizeBytes: number
  mimeType: string
  url?: string
}

export interface EmailMessage {
  id: string
  accountId: string
  folderId: string
  senderName: string
  senderEmail: string
  recipientEmails: string[]
  ccEmails?: string[]
  bccEmails?: string[]
  subject: string
  snippet: string
  dateIso: string
  isRead: boolean
  isStarred: boolean
  isImportant?: boolean
  isDraft?: boolean
  hasAttachments: boolean
  attachments?: EmailAttachment[]
  category?: 'focused' | 'other'
}

export interface EmailBody {
  emailId: string
  html: string
  plainText: string
}

export interface MailOp {
  id: string
  opType: 'mark_read' | 'mark_unread' | 'delete' | 'archive' | 'move_folder' | 'send_draft'
  emailId: string
  payloadJson: string
  createdAt: number
}

export interface MailApi {
  getAccounts: () => Promise<EmailAccount[]>
  getFolders: (accountId: string) => Promise<MailFolder[]>
  getEmails: (folderId: string, category?: 'focused' | 'other') => Promise<EmailMessage[]>
  getEmailBody: (emailId: string) => Promise<EmailBody | null>
  markRead: (emailId: string, isRead: boolean) => Promise<void>
  toggleStarred: (emailId: string) => Promise<boolean>
  deleteEmail: (emailId: string) => Promise<void>
  archiveEmail: (emailId: string) => Promise<void>
  sendEmail: (draft: {
    accountId: string
    to: string[]
    cc?: string[]
    subject: string
    bodyHtml: string
    attachments?: EmailAttachment[]
  }) => Promise<{ success: boolean; emailId?: string }>
}

declare global {
  interface Window {
    mailApi?: MailApi
  }
}
