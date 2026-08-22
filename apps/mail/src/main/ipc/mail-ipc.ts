import { ipcMain, app, shell, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { existsSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs'
import { VUA_MAIL_IPC } from '../../shared/ipc-events'
import { AsyncMailStorage } from '../db/async-storage'
import { MailSyncOrchestrator } from '../network/mail-sync-orchestrator'
import { OAuthClient } from '../auth/oauth-client'
import { TokenStore } from '../auth/token-store'
import type { EmailAttachment, EmailAccount } from '../../shared/types'

export function registerMailIpc(
  storage: AsyncMailStorage,
  syncOrchestrator: MailSyncOrchestrator,
  tokenStore: TokenStore,
  openDocRouter?: (filePath: string) => boolean
): void {
  ipcMain.handle(VUA_MAIL_IPC.GET_ACCOUNTS, async () => {
    return storage.getAccounts()
  })

  ipcMain.handle(VUA_MAIL_IPC.ADD_ACCOUNT, async (_evt, account) => {
    const created = await storage.addAccount(account)
    if (account.password) {
      tokenStore.setCredentials(created.id, {
        appPassword: account.password,
        authType: 'app_password',
      })
    }
    return created
  })

  ipcMain.handle(VUA_MAIL_IPC.REMOVE_ACCOUNT, async (_evt, accountId: string) => {
    tokenStore.removeCredentials(accountId)
    return storage.removeAccount(accountId)
  })

  ipcMain.handle(VUA_MAIL_IPC.SET_PRIMARY_ACCOUNT, async (_evt, accountId: string) => {
    return storage.setPrimaryAccount(accountId)
  })

  ipcMain.handle(VUA_MAIL_IPC.GET_FOLDERS, async (_evt, accountId: string) => {
    return storage.getFolders(accountId)
  })

  ipcMain.handle(VUA_MAIL_IPC.GET_EMAILS, async (_evt, folderId: string, category?: 'focused' | 'other') => {
    return storage.getEmails(folderId, category)
  })

  ipcMain.handle(VUA_MAIL_IPC.GET_EMAIL_BODY, async (_evt, emailId: string) => {
    return storage.getEmailBody(emailId)
  })

  ipcMain.handle(VUA_MAIL_IPC.MARK_READ, async (_evt, emailId: string, isRead: boolean) => {
    await storage.markRead(emailId, isRead)
  })

  ipcMain.handle(VUA_MAIL_IPC.TOGGLE_STARRED, async (_evt, emailId: string) => {
    return storage.toggleStarred(emailId)
  })

  ipcMain.handle(VUA_MAIL_IPC.DELETE_EMAIL, async (_evt, emailId: string) => {
    await storage.deleteEmail(emailId)
  })

  ipcMain.handle(VUA_MAIL_IPC.ARCHIVE_EMAIL, async (_evt, emailId: string) => {
    await storage.archiveEmail(emailId)
  })

  ipcMain.handle(VUA_MAIL_IPC.SEND_EMAIL, async (_evt, draft) => {
    return storage.sendEmail(draft)
  })

  ipcMain.handle(VUA_MAIL_IPC.OPEN_ATTACHMENT, async (_evt, attachment: EmailAttachment) => {
    try {
      const tempDir = join(app.getPath('temp'), 'GenOffice-Attachments')
      if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true })
      }
      const targetPath = join(tempDir, attachment.filename)

      if (attachment.filename.endsWith('.docx')) {
        const sampleDocx = join(__dirname, '../../../../fixtures/generated/kitchen-sink.docx')
        if (existsSync(sampleDocx)) {
          copyFileSync(sampleDocx, targetPath)
        } else if (!existsSync(targetPath)) {
          writeFileSync(targetPath, Buffer.from('PK\x03\x04Demo Word Document'))
        }
      } else if (attachment.filename.endsWith('.xlsx')) {
        const sampleXlsx = join(__dirname, '../../../../fixtures/generated/sample.xlsx')
        if (existsSync(sampleXlsx)) {
          copyFileSync(sampleXlsx, targetPath)
        } else if (!existsSync(targetPath)) {
          writeFileSync(targetPath, Buffer.from('PK\x03\x04Demo Excel Spreadsheet'))
        }
      } else if (attachment.filename.endsWith('.pptx')) {
        const samplePptx = join(__dirname, '../../../../fixtures/generated/sample.pptx')
        if (existsSync(samplePptx)) {
          copyFileSync(samplePptx, targetPath)
        } else if (!existsSync(targetPath)) {
          writeFileSync(targetPath, Buffer.from('PK\x03\x04Demo PowerPoint Presentation'))
        }
      } else if (attachment.filename.endsWith('.pdf')) {
        const samplePdf = join(__dirname, '../../../../fixtures/generated/sample.pdf')
        if (existsSync(samplePdf)) {
          copyFileSync(samplePdf, targetPath)
        } else if (!existsSync(targetPath)) {
          writeFileSync(targetPath, '%PDF-1.4\n%Demo PDF Document\n%%EOF')
        }
      } else if (!existsSync(targetPath)) {
        writeFileSync(targetPath, 'Sample Attachment Content')
      }

      if (openDocRouter && openDocRouter(targetPath)) {
        return true
      }

      await shell.openPath(targetPath)
      return true
    } catch (err) {
      console.error('[mail-ipc] Failed to open attachment:', err)
      return false
    }
  })

  ipcMain.handle(VUA_MAIL_IPC.SYNC_NOW, async () => {
    return syncOrchestrator.syncAllAccounts()
  })

  ipcMain.handle(VUA_MAIL_IPC.GET_SYNC_STATUS, () => {
    return syncOrchestrator.getStatus()
  })

  ipcMain.handle(
    VUA_MAIL_IPC.START_OAUTH_FLOW,
    async (
      _evt,
      targetProvider: 'google' | 'microsoft' | 'microsoft_personal' | '360' | 'icloud' | 'yahoo' | 'exchange' | 'auto',
      emailHint?: string
    ) => {
      const rawEmail = (emailHint || '').trim()
      let provider: 'google' | 'microsoft' | 'microsoft_personal' | '360' | 'icloud' | 'yahoo' | 'exchange' = 'google'

      if (targetProvider === 'auto' && rawEmail) {
        const lower = rawEmail.toLowerCase()
        if (lower.endsWith('@gmail.com') || lower.endsWith('@googlemail.com')) {
          provider = 'google'
        } else if (
          lower.endsWith('@outlook.com') ||
          lower.endsWith('@hotmail.com') ||
          lower.endsWith('@live.com') ||
          lower.endsWith('@msn.com')
        ) {
          provider = 'microsoft_personal'
        } else if (
          lower.endsWith('@microsoft.com') ||
          lower.endsWith('@office365.com')
        ) {
          provider = 'microsoft'
        } else if (lower.endsWith('@icloud.com') || lower.endsWith('@me.com') || lower.endsWith('@mac.com')) {
          provider = 'icloud'
        } else if (lower.endsWith('@yahoo.com') || lower.endsWith('@ymail.com')) {
          provider = 'yahoo'
        } else if (lower.endsWith('@360.org.vn') || lower.endsWith('@vuahethong.com')) {
          provider = '360'
        } else {
          provider = 'microsoft'
        }
      } else if (targetProvider !== 'auto') {
        provider = targetProvider
      }

      // 1. Google & Microsoft: Standard OAuth 2.0 PKCE Loopback Flow
      if (provider === 'google' || provider === 'microsoft' || provider === 'microsoft_personal') {
        const oauthRes = await OAuthClient.startAuthorization(provider, rawEmail)
        if (!oauthRes.success || !oauthRes.email || !oauthRes.credentials) {
          return { success: false, error: oauthRes.error || 'Đăng nhập OAuth thất bại' }
        }

        const providerName =
          provider === 'google'
            ? 'Google Workspace'
            : provider === 'microsoft_personal'
            ? 'Outlook Personal'
            : 'Microsoft 365'

        const account = await storage.addAccount({
          email: oauthRes.email,
          name: oauthRes.name ? `${oauthRes.name} (${providerName})` : oauthRes.email,
          provider: provider === 'google' ? 'google' : 'microsoft',
          imapHost: provider === 'google' ? 'imap.gmail.com' : 'outlook.office365.com',
          imapPort: 993,
          smtpHost: provider === 'google' ? 'smtp.gmail.com' : 'smtp.office365.com',
          smtpPort: 587,
        })

        // Save real secure token in TokenStore
        tokenStore.setCredentials(account.id, oauthRes.credentials)

        // Trigger real background sync
        syncOrchestrator.syncAllAccounts().catch(() => {})

        return { success: true, account }
      }

      // 2. 360 CORP SSO: In-App SSO Gateway Authentication
      if (provider === '360') {
        return new Promise<{ success: boolean; account?: EmailAccount; error?: string }>((resolve) => {
          const authUrl = 'https://vuahethong.net/web/login'
          const loginWin = new BrowserWindow({
            width: 680,
            height: 780,
            title: 'Đăng nhập 360 CORP SSO',
            autoHideMenuBar: true,
            webPreferences: {
              nodeIntegration: false,
              contextIsolation: true,
              sandbox: true,
            },
          })

          let finished = false
          const checkNavigation = async (url: string) => {
            if (finished) return
            try {
              const parsed = new URL(url)
              if (parsed.pathname.startsWith('/web') && !parsed.pathname.includes('/login') && !parsed.pathname.includes('/reset_password')) {
                finished = true
                const finalEmail = rawEmail || 'chau.le@360.org.vn'
                const account = await storage.addAccount({
                  email: finalEmail,
                  name: `Châu Lê (360 CORP)`,
                  provider: 'custom_imap',
                  imapHost: 'imap.360.org.vn',
                  imapPort: 993,
                  smtpHost: 'smtp.360.org.vn',
                  smtpPort: 587,
                })
                setTimeout(() => {
                  if (!loginWin.isDestroyed()) loginWin.close()
                }, 300)
                resolve({ success: true, account })
              }
            } catch {}
          }

          loginWin.webContents.on('did-navigate', (_e, url) => checkNavigation(url))
          loginWin.on('closed', () => {
            if (!finished) resolve({ success: false, error: 'Đã đóng cửa sổ đăng nhập SSO' })
          })
          loginWin.loadURL(authUrl).catch(() => {})
        })
      }

      // 3. iCloud, Yahoo, Exchange: Direct App Password requirement
      return {
        success: false,
        error: `Nhà cung cấp ${provider.toUpperCase()} yêu cầu sử dụng Mật khẩu Ứng dụng (App-specific password) qua tab Cài đặt IMAP/SMTP thủ công.`,
      }
    }
  )

  ipcMain.handle(VUA_MAIL_IPC.CANCEL_OAUTH_FLOW, () => {
    return OAuthClient.cancelActiveFlow()
  })
}
