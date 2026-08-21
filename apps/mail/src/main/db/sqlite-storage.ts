import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'
import { SQLITE_SCHEMA } from './schema'
import type { EmailAccount, EmailBody, EmailMessage, MailFolder } from '../../shared/types'

interface StorageData {
  accounts: EmailAccount[]
  folders: MailFolder[]
  emails: EmailMessage[]
  bodies: Record<string, { html: string; plainText: string }>
}

export class SQLiteMailStorage {
  private filePath: string
  private data: StorageData

  constructor(customPath?: string) {
    const dbDir = customPath ?? (app ? app.getPath('userData') : '/tmp')
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true })
    }
    this.filePath = join(dbDir, 'vuamail-local.json')
    this.data = this.load()
    if (this.data.accounts.length === 0) {
      this.seedDemoData()
      this.save()
    }
  }

  private load(): StorageData {
    try {
      if (existsSync(this.filePath)) {
        const content = readFileSync(this.filePath, 'utf-8')
        return JSON.parse(content)
      }
    } catch (e) {
      console.error('[MailStorage] Failed to load JSON storage, resetting:', e)
    }
    return {
      accounts: [],
      folders: [],
      emails: [],
      bodies: {},
    }
  }

  private save(): void {
    try {
      writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (e) {
      console.error('[MailStorage] Failed to save JSON storage:', e)
    }
  }

  private seedDemoData(): void {
    const accountId = 'acc_primary'
    const now = Date.now()

    this.data.accounts = [
      {
        id: accountId,
        email: 'chau.le@360.org.vn',
        name: 'Châu Lê',
        provider: 'google',
        isDefault: true,
      },
    ]

    this.data.folders = [
      { id: 'f_inbox', accountId, name: 'Inbox', kind: 'inbox', iconName: 'Inbox', unreadCount: 2, totalCount: 12, isFavorite: true },
      { id: 'f_drafts', accountId, name: 'Drafts', kind: 'drafts', iconName: 'Drafts', unreadCount: 0, totalCount: 2, isFavorite: true },
      { id: 'f_sent', accountId, name: 'Sent Items', kind: 'sent', iconName: 'Send', unreadCount: 0, totalCount: 25, isFavorite: true },
      { id: 'f_archive', accountId, name: 'Archive', kind: 'archive', iconName: 'Archive', unreadCount: 0, totalCount: 40, isFavorite: false },
      { id: 'f_trash', accountId, name: 'Deleted Items', kind: 'trash', iconName: 'Delete', unreadCount: 0, totalCount: 5, isFavorite: false },
    ]

    this.data.emails = [
      {
        id: 'msg_1',
        accountId,
        folderId: 'f_inbox',
        senderName: '360 CORP Team',
        senderEmail: 'support@360.org.vn',
        recipientEmails: ['chau.le@360.org.vn'],
        subject: 'Chào mừng Sếp đến với VuaMail trong hệ sinh thái VuaOffice Suite',
        snippet: 'VuaMail tích hợp AI Smart Summary, Smart Reply và Offline SQLite Sync hoàn toàn mới...',
        dateIso: new Date(now - 1000 * 60 * 30).toISOString(),
        isRead: false,
        isStarred: true,
        hasAttachments: false,
        category: 'focused',
      },
      {
        id: 'msg_2',
        accountId,
        folderId: 'f_inbox',
        senderName: 'VuaOffice AI Agent',
        senderEmail: 'ai@vuahethong.com',
        recipientEmails: ['chau.le@360.org.vn'],
        subject: 'Báo cáo tổng kết tuần & Lịch họp rà soát tính năng mới',
        snippet: 'AI Agent đã chuẩn bị xong báo cáo tuần cho toàn bộ module Docs, Sheets, Slides và Mail...',
        dateIso: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
        isRead: false,
        isStarred: false,
        hasAttachments: false,
        category: 'focused',
      },
      {
        id: 'msg_3',
        accountId,
        folderId: 'f_inbox',
        senderName: 'GitHub Notifications',
        senderEmail: 'notifications@github.com',
        recipientEmails: ['chau.le@360.org.vn'],
        subject: '[360org/vuaoffice] Release v0.6.6 published successfully',
        snippet: 'Branch main release v0.6.6 with updated updater URL is now live...',
        dateIso: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
        isRead: true,
        isStarred: false,
        hasAttachments: false,
        category: 'other',
      },
    ]

    this.data.bodies = {
      msg_1: {
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #0078d4;">Chào mừng đến với VuaMail — VuaOffice Suite</h2>
            <p>Kính gửi Sếp Châu,</p>
            <p>Ứng dụng <strong>VuaMail</strong> đã được khởi tạo thành công với kiến trúc kết hợp:</p>
            <ul>
              <li><strong>Local Engine</strong>: SQLite Storage siêu tốc, đồng bộ Op-Queue offline.</li>
              <li><strong>Giao diện Microsoft Outlook</strong>: Ribbon Fluent UI 3 cột chuẩn Microsoft 365.</li>
              <li><strong>VuaOffice AI</strong>: Hỗ trợ tóm tắt chuỗi thư và soạn thảo phản hồi tự động thông minh.</li>
            </ul>
            <p>Trân trọng,<br/><strong>360 CORP Engineering Team</strong></p>
          </div>
        `,
        plainText: 'Chào mừng Sếp đến với VuaMail trong hệ sinh thái VuaOffice Suite...',
      },
      msg_2: {
        html: `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h3>Báo cáo tuần & Tính năng mới</h3>
            <p>Chào Sếp,</p>
            <p>Tiến độ tích hợp VuaMail vào VuaOffice Shell đang diễn ra đúng kế hoạch.</p>
            <p>Các tài liệu kiến trúc (ARCH.md, SPEC.md, REQUIREMENTS.md) đã được cập nhật đồng bộ.</p>
          </div>
        `,
        plainText: 'Báo cáo tổng kết tuần & Lịch họp rà soát tính năng mới...',
      },
      msg_3: {
        html: '<p>Release v0.6.6 is live on GitHub Releases.</p>',
        plainText: 'Release v0.6.6 is live on GitHub Releases.',
      },
    }
  }

  getAccounts(): EmailAccount[] {
    return this.data.accounts
  }

  getFolders(accountId: string): MailFolder[] {
    return this.data.folders.filter((f) => f.accountId === accountId)
  }

  getEmails(folderId: string, category?: 'focused' | 'other'): EmailMessage[] {
    return this.data.emails
      .filter((e) => e.folderId === folderId && (!category || e.category === category))
      .sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime())
  }

  getEmailBody(emailId: string): EmailBody | null {
    const body = this.data.bodies[emailId]
    if (!body) return null
    return {
      emailId,
      html: body.html,
      plainText: body.plainText,
    }
  }

  markRead(emailId: string, isRead: boolean): void {
    const email = this.data.emails.find((e) => e.id === emailId)
    if (email) {
      email.isRead = isRead
      this.save()
    }
  }

  toggleStarred(emailId: string): boolean {
    const email = this.data.emails.find((e) => e.id === emailId)
    if (email) {
      email.isStarred = !email.isStarred
      this.save()
      return email.isStarred
    }
    return false
  }

  deleteEmail(emailId: string): void {
    this.data.emails = this.data.emails.filter((e) => e.id !== emailId)
    delete this.data.bodies[emailId]
    this.save()
  }

  archiveEmail(emailId: string): void {
    const email = this.data.emails.find((e) => e.id === emailId)
    if (email) {
      email.folderId = 'f_archive'
      this.save()
    }
  }

  sendEmail(draft: {
    accountId: string
    to: string[]
    cc?: string[]
    bcc?: string[]
    subject: string
    bodyHtml: string
    bodyPlain: string
  }): { success: boolean; emailId?: string } {
    const newId = `msg_${Date.now()}`
    const newEmail: EmailMessage = {
      id: newId,
      accountId: draft.accountId,
      folderId: 'f_sent',
      senderName: 'Châu Lê',
      senderEmail: 'chau.le@360.org.vn',
      recipientEmails: draft.to,
      subject: draft.subject,
      snippet: draft.bodyPlain.slice(0, 100),
      dateIso: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      hasAttachments: false,
      category: 'focused',
    }

    this.data.emails.unshift(newEmail)
    this.data.bodies[newId] = {
      html: draft.bodyHtml,
      plainText: draft.bodyPlain,
    }
    this.save()

    return { success: true, emailId: newId }
  }
}
