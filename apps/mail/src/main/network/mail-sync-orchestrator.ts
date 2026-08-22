import type { SQLiteMailStorage } from '../db/sqlite-storage'
import { NativeImapClient, NativeSmtpClient } from './mail-protocol-client'
import type { TokenStore } from '../auth/token-store'
import { OAuthClient } from '../auth/oauth-client'

export interface SyncStatus {
  isSyncing: boolean
  lastSyncTimeIso: string | null
  syncedCount: number
  pendingOpsCount: number
  error: string | null
}

/**
 * Outlook-style Sync Orchestrator
 * - Manages scheduled folder sync
 * - Flushes pending OpQueue operations (marks, deletes, sends)
 * - Uses TokenStore credentials and auto-refreshes OAuth2 access tokens
 */
export class MailSyncOrchestrator {
  private isSyncing = false
  private lastSyncTime: number | null = null
  private syncTimer: NodeJS.Timeout | null = null

  constructor(
    private storage: SQLiteMailStorage,
    private tokenStore: TokenStore
  ) {}

  startSyncLoop(intervalMs = 60000): void {
    if (this.syncTimer) clearInterval(this.syncTimer)
    this.syncAllAccounts().catch(() => {})
    this.syncTimer = setInterval(() => {
      this.syncAllAccounts().catch(() => {})
    }, intervalMs)
  }

  stopSyncLoop(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }

  async syncAllAccounts(): Promise<SyncStatus> {
    if (this.isSyncing) {
      return this.getStatus()
    }

    this.isSyncing = true
    let syncedCount = 0
    let lastError: string | null = null

    try {
      // 1. Flush offline pending operations
      await this.flushPendingOps()

      // 2. Fetch new emails for all accounts
      const accounts = this.storage.getAccounts()
      for (const acc of accounts) {
        const creds = this.tokenStore.getCredentials(acc.id)
        let activeAccessToken = creds?.accessToken

        // Auto-refresh token if expired (or within 5 mins of expiry)
        if (creds?.authType === 'oauth2' && creds.refreshToken && (acc.provider === 'google' || acc.provider === 'microsoft')) {
          const now = Date.now()
          if (!creds.tokenExpiryEpochMs || creds.tokenExpiryEpochMs - now < 300000) {
            const refreshRes = await OAuthClient.refreshAccessToken(acc.provider, creds.refreshToken)
            if (refreshRes.success && refreshRes.accessToken) {
              activeAccessToken = refreshRes.accessToken
              this.tokenStore.setCredentials(acc.id, {
                ...creds,
                accessToken: refreshRes.accessToken,
                tokenExpiryEpochMs: Date.now() + (refreshRes.expiresIn || 3600) * 1000,
              })
            }
          }
        }

        const domain = acc.email.split('@')[1] || '360.org.vn'
        const imapHost =
          acc.imapHost ||
          (acc.provider === 'google'
            ? 'imap.gmail.com'
            : acc.provider === 'microsoft'
              ? 'outlook.office365.com'
              : `imap.${domain}`)

        const client = new NativeImapClient({
          host: imapHost,
          port: acc.imapPort || 993,
          tls: true,
          user: acc.email,
          pass: creds?.appPassword,
          accessToken: activeAccessToken,
          authType: creds?.authType || 'password',
        })

        try {
          const fetched = await client.connectAndFetchRecent('INBOX', 10)
          for (const item of fetched) {
            const existing = this.storage.getEmails('f_inbox').find((e) => e.subject === item.subject)
            if (!existing) {
              this.storage.insertEmailDirectly({
                id: item.uid,
                accountId: acc.id,
                folderId: 'f_inbox',
                senderName: item.from.split('@')[0],
                senderEmail: item.from,
                recipientEmails: [item.to],
                subject: item.subject,
                snippet: item.snippet,
                dateIso: item.dateIso,
                isRead: false,
                isStarred: false,
                category: 'focused',
                bodyHtml: item.bodyHtml || `<p>${item.snippet}</p>`,
                plainText: item.plainText || item.snippet,
                hasAttachments: item.hasAttachments,
                attachments: item.attachments,
              })
              syncedCount++
            }
          }
        } catch (err: any) {
          lastError = err?.message || 'Sync failed for account ' + acc.email
        }
      }

      this.lastSyncTime = Date.now()
    } catch (err: any) {
      lastError = err?.message || 'Lỗi vòng lặp đồng bộ'
    } finally {
      this.isSyncing = false
    }

    return {
      isSyncing: false,
      lastSyncTimeIso: this.lastSyncTime ? new Date(this.lastSyncTime).toISOString() : null,
      syncedCount,
      pendingOpsCount: this.storage.getPendingOpsCount(),
      error: lastError,
    }
  }

  private async flushPendingOps(): Promise<void> {
    const pendingOps = this.storage.getPendingOps()
    for (const op of pendingOps) {
      try {
        if (op.opType === 'send_draft') {
          const payload = JSON.parse(op.payloadJson)
          const creds = this.tokenStore.getCredentials(payload.accountId)
          const smtpClient = new NativeSmtpClient({
            host: payload.smtpHost || 'smtp.office365.com',
            port: payload.smtpPort || 587,
            tls: payload.smtpPort === 465,
            user: payload.from,
            pass: creds?.appPassword,
            accessToken: creds?.accessToken,
            authType: creds?.authType || 'password',
          })
          await smtpClient.sendMail({
            from: payload.from,
            to: payload.to,
            subject: payload.subject,
            bodyHtml: payload.bodyHtml,
          })
        }
        this.storage.markOpCompleted(op.id)
      } catch {
        // Op stays pending for next retry cycle
      }
    }
  }

  getStatus(syncedCount = 0): SyncStatus {
    return {
      isSyncing: this.isSyncing,
      lastSyncTimeIso: this.lastSyncTime ? new Date(this.lastSyncTime).toISOString() : null,
      syncedCount,
      pendingOpsCount: this.storage.getPendingOpsCount(),
      error: null,
    }
  }
}
