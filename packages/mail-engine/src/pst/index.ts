import type { ParsedEmail } from '../types'

export interface MailFolderItem {
  id: string
  name: string
  parentFolderId?: string
  totalCount: number
  unreadCount: number
}

export interface PstMessageRecord {
  id: string
  folderId: string
  subject: string
  sender: string
  senderEmail: string
  recipients: string[]
  receivedTime: number
  bodyText: string
  bodyHtml?: string
  hasAttachments: boolean
}

export class PstContainerReader {
  private buffer: Buffer

  constructor(fileBuffer: Buffer) {
    this.buffer = fileBuffer
  }

  isPstFile(): boolean {
    if (this.buffer.length < 4) return false
    // PST magic header: 0x21 0x42 0x44 0x4E (!BDN)
    return (
      this.buffer[0] === 0x21 &&
      this.buffer[1] === 0x42 &&
      this.buffer[2] === 0x44 &&
      this.buffer[3] === 0x4e
    )
  }

  getFolderTree(): MailFolderItem[] {
    return [
      { id: 'pst-inbox', name: 'Inbox', unreadCount: 0, totalCount: 0 },
      { id: 'pst-sent', name: 'Sent Items', unreadCount: 0, totalCount: 0 },
      { id: 'pst-drafts', name: 'Drafts', unreadCount: 0, totalCount: 0 },
      { id: 'pst-archive', name: 'Archive', unreadCount: 0, totalCount: 0 },
    ]
  }

  toParsedEmail(record: PstMessageRecord): ParsedEmail {
    return {
      messageId: `<${record.id}@pst.local>`,
      threadId: record.id,
      references: [],
      subject: record.subject,
      from: { name: record.sender, address: record.senderEmail },
      to: record.recipients.map((r) => ({ name: r, address: r })),
      cc: [],
      bcc: [],
      date: record.receivedTime,
      bodyText: record.bodyText,
      bodyHtml: record.bodyHtml,
      snippet: record.bodyText.slice(0, 160).replace(/\s+/g, ' ').trim(),
      attachments: [],
      headers: {},
      flags: {
        unread: false,
        starred: false,
        draft: false,
        hasAttachments: record.hasAttachments,
      },
    }
  }
}
