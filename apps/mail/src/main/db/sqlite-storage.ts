import Database from 'better-sqlite3'
import { app } from 'electron'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { SQLITE_SCHEMA } from './schema'
import type { EmailAccount, EmailBody, EmailMessage, MailFolder } from '../../shared/types'

export class SQLiteMailStorage {
  private db: Database.Database | null = null

  constructor(customPath?: string) {
    const dbDir = customPath ?? (app ? app.getPath('userData') : '/tmp')
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }
    const dbFilePath = path.join(dbDir, 'vuamail-local.db')
    this.db = new Database(dbFilePath)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('synchronous = NORMAL')
    this.initSchema()
    this.seedDemoDataIfEmpty()
  }

  private initSchema(): void {
    if (!this.db) return
    this.db.exec(SQLITE_SCHEMA)
  }

  private seedDemoDataIfEmpty(): void {
    if (!this.db) return
    const count = (this.db.prepare('SELECT COUNT(*) as c FROM accounts').get() as { c: number }).c
    if (count > 0) return

    const accountId = 'acc_primary'
    const now = Date.now()

    this.db.prepare(`
      INSERT INTO accounts (id, email, name, provider, is_default, created_at)
      VALUES (?, ?, ?, ?, 1, ?)
    `).run(accountId, 'chau.le@360.org.vn', 'Châu Lê', 'google', now)

    const folders = [
      { id: 'f_inbox', name: 'Inbox', kind: 'inbox', icon: 'Inbox', unread: 2, total: 12, fav: 1 },
      { id: 'f_drafts', name: 'Drafts', kind: 'drafts', icon: 'Drafts', unread: 0, total: 2, fav: 1 },
      { id: 'f_sent', name: 'Sent Items', kind: 'sent', icon: 'Send', unread: 0, total: 25, fav: 1 },
      { id: 'f_archive', name: 'Archive', kind: 'archive', icon: 'Archive', unread: 0, total: 40, fav: 0 },
      { id: 'f_trash', name: 'Deleted Items', kind: 'trash', icon: 'Delete', unread: 0, total: 5, fav: 0 },
    ]

    const folderStmt = this.db.prepare(`
      INSERT INTO email_folders (id, account_id, name, kind, icon_name, unread_count, total_count, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const f of folders) {
      folderStmt.run(f.id, accountId, f.name, f.kind, f.icon, f.unread, f.total, f.fav)
    }

    const demoEmails = [
      {
        id: 'msg_1',
        folderId: 'f_inbox',
        senderName: '360 CORP Team',
        senderEmail: 'support@360.org.vn',
        subject: 'Chào mừng Sếp đến với VuaMail trong hệ sinh thái GenOffice Suite',
        snippet: 'VuaMail tích hợp AI Smart Summary, Smart Reply và Offline SQLite Sync hoàn toàn mới...',
        dateIso: new Date(now - 1000 * 60 * 30).toISOString(),
        isRead: 0,
        isStarred: 1,
        category: 'focused',
        bodyHtml: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #0078d4;">Chào mừng đến với VuaMail — GenOffice Suite</h2>
            <p>Kính gửi Sếp Châu,</p>
            <p>Ứng dụng <strong>VuaMail</strong> đã được khởi tạo thành công với kiến trúc kết hợp:</p>
            <ul>
              <li><strong>Local Engine</strong>: SQLite Storage siêu tốc, đồng bộ Op-Queue offline.</li>
              <li><strong>Giao diện Microsoft Outlook</strong>: Ribbon Fluent UI 3 cột chuẩn Microsoft 365.</li>
              <li><strong>Genspark AI</strong>: Hỗ trợ tóm tắt chuỗi thư và soạn thảo phản hồi tự động thông minh.</li>
            </ul>
            <p>Trân trọng,<br/><strong>360 CORP Engineering Team</strong></p>
          </div>
        `,
        plainText: 'Chào mừng Sếp đến với VuaMail trong hệ sinh thái GenOffice Suite...'
      },
      {
        id: 'msg_2',
        folderId: 'f_inbox',
        senderName: 'Genspark AI Agent',
        senderEmail: 'ai@vuahethong.com',
        subject: 'Báo cáo tổng kết tuần & Lịch họp rà soát tính năng mới',
        snippet: 'AI Agent đã chuẩn bị xong báo cáo tuần cho toàn bộ module Docs, Sheets, Slides và Mail...',
        dateIso: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
        isRead: 0,
        isStarred: 0,
        category: 'focused',
        bodyHtml: `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h3>Báo cáo tuần & Tính năng mới</h3>
            <p>Chào Sếp,</p>
            <p>Tiến độ tích hợp VuaMail vào GenOffice Shell đang diễn ra đúng kế hoạch.</p>
            <p>Các tài liệu kiến trúc (ARCH.md, SPEC.md, REQUIREMENTS.md) đã được cập nhật đồng bộ.</p>
          </div>
        `,
        plainText: 'Báo cáo tổng kết tuần & Lịch họp rà soát tính năng mới...'
      },
      {
        id: 'msg_3',
        folderId: 'f_inbox',
        senderName: 'GitHub Notifications',
        senderEmail: 'notifications@github.com',
        subject: '[genspark-ai/genoffice] Release v0.6.6 published successfully',
        snippet: 'Branch main release v0.6.6 with updated updater URL is now live...',
        dateIso: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
        isRead: 1,
        isStarred: 0,
        category: 'other',
        bodyHtml: '<p>Release v0.6.6 is live on GitHub Releases.</p>',
        plainText: 'Release v0.6.6 is live on GitHub Releases.'
      }
    ]

    const emailStmt = this.db.prepare(`
      INSERT INTO emails (
        id, account_id, folder_id, sender_name, sender_email, recipient_emails,
        subject, snippet, date_iso, is_read, is_starred, category, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const bodyStmt = this.db.prepare(`
      INSERT INTO email_bodies (email_id, html, plain_text)
      VALUES (?, ?, ?)
    `)

    for (const m of demoEmails) {
      emailStmt.run(
        m.id,
        accountId,
        m.folderId,
        m.senderName,
        m.senderEmail,
        'chau.le@360.org.vn',
        m.subject,
        m.snippet,
        m.dateIso,
        m.isRead,
        m.isStarred,
        m.category,
        now
      )
      bodyStmt.run(m.id, m.bodyHtml, m.plainText)
    }
  }

  getAccounts(): EmailAccount[] {
    if (!this.db) return []
    const rows = this.db.prepare('SELECT * FROM accounts ORDER BY is_default DESC').all() as Array<{
      id: string
      email: string
      name: string
      provider: string
      avatar_url?: string
      is_default: number
    }>
    return rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      provider: r.provider as 'google' | 'microsoft' | 'custom_imap',
      avatarUrl: r.avatar_url,
      isDefault: Boolean(r.is_default),
    }))
  }

  getFolders(accountId: string): MailFolder[] {
    if (!this.db) return []
    const rows = this.db.prepare('SELECT * FROM email_folders WHERE account_id = ?').all(accountId) as Array<{
      id: string
      account_id: string
      name: string
      kind: string
      icon_name: string
      unread_count: number
      total_count: number
      is_favorite: number
    }>
    return rows.map((r) => ({
      id: r.id,
      accountId: r.account_id,
      name: r.name,
      kind: r.kind as any,
      iconName: r.icon_name,
      unreadCount: r.unread_count,
      totalCount: r.total_count,
      isFavorite: Boolean(r.is_favorite),
    }))
  }

  getEmails(folderId: string, category?: 'focused' | 'other'): EmailMessage[] {
    if (!this.db) return []
    let query = 'SELECT * FROM emails WHERE folder_id = ?'
    const params: any[] = [folderId]

    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }
    query += ' ORDER BY date_iso DESC'

    const rows = this.db.prepare(query).all(...params) as Array<{
      id: string
      account_id: string
      folder_id: string
      sender_name: string
      sender_email: string
      recipient_emails: string
      subject: string
      snippet: string
      date_iso: string
      is_read: number
      is_starred: number
      has_attachments: number
      category: string
    }>

    return rows.map((r) => ({
      id: r.id,
      accountId: r.account_id,
      folderId: r.folder_id,
      senderName: r.sender_name,
      senderEmail: r.sender_email,
      recipientEmails: [r.recipient_emails],
      subject: r.subject,
      snippet: r.snippet,
      dateIso: r.date_iso,
      isRead: Boolean(r.is_read),
      isStarred: Boolean(r.is_starred),
      hasAttachments: Boolean(r.has_attachments),
      category: r.category as 'focused' | 'other',
    }))
  }

  getEmailBody(emailId: string): EmailBody | null {
    if (!this.db) return null
    const row = this.db.prepare('SELECT * FROM email_bodies WHERE email_id = ?').get(emailId) as
      | { email_id: string; html: string; plain_text: string }
      | undefined
    if (!row) return null
    return {
      emailId: row.email_id,
      html: row.html,
      plainText: row.plain_text,
    }
  }

  markRead(emailId: string, isRead: boolean): void {
    if (!this.db) return
    this.db.prepare('UPDATE emails SET is_read = ? WHERE id = ?').run(isRead ? 1 : 0, emailId)
  }

  toggleStarred(emailId: string): boolean {
    if (!this.db) return false
    const row = this.db.prepare('SELECT is_starred FROM emails WHERE id = ?').get(emailId) as { is_starred: number } | undefined
    const newVal = row && row.is_starred === 1 ? 0 : 1
    this.db.prepare('UPDATE emails SET is_starred = ? WHERE id = ?').run(newVal, emailId)
    return newVal === 1
  }

  deleteEmail(emailId: string): void {
    if (!this.db) return
    this.db.prepare('DELETE FROM emails WHERE id = ?').run(emailId)
  }

  archiveEmail(emailId: string): void {
    if (!this.db) return
    this.db.prepare("UPDATE emails SET folder_id = 'f_archive' WHERE id = ?").run(emailId)
  }

  sendEmail(draft: {
    accountId: string
    to: string[]
    subject: string
    bodyHtml: string
  }): { success: boolean; emailId?: string } {
    if (!this.db) return { success: false }
    const id = `msg_${Date.now()}`
    const nowIso = new Date().toISOString()
    const snippet = draft.bodyHtml.replace(/<[^>]*>?/gm, '').slice(0, 100)

    this.db.prepare(`
      INSERT INTO emails (
        id, account_id, folder_id, sender_name, sender_email, recipient_emails,
        subject, snippet, date_iso, is_read, is_starred, category, created_at
      ) VALUES (?, ?, 'f_sent', 'Châu Lê', 'chau.le@360.org.vn', ?, ?, ?, ?, 1, 0, 'focused', ?)
    `).run(id, draft.accountId, draft.to.join(','), draft.subject, snippet, nowIso, Date.now())

    this.db.prepare(`
      INSERT INTO email_bodies (email_id, html, plain_text)
      VALUES (?, ?, ?)
    `).run(id, draft.bodyHtml, snippet)

    return { success: true, emailId: id }
  }
}
