import { ipcMain } from 'electron'
import { VUA_MAIL_IPC } from '../../shared/ipc-events'
import { SQLiteMailStorage } from '../db/sqlite-storage'

export function registerMailIpc(storage: SQLiteMailStorage): void {
  ipcMain.handle(VUA_MAIL_IPC.GET_ACCOUNTS, () => {
    return storage.getAccounts()
  })

  ipcMain.handle(VUA_MAIL_IPC.GET_FOLDERS, (_evt, accountId: string) => {
    return storage.getFolders(accountId)
  })

  ipcMain.handle(VUA_MAIL_IPC.GET_EMAILS, (_evt, folderId: string, category?: 'focused' | 'other') => {
    return storage.getEmails(folderId, category)
  })

  ipcMain.handle(VUA_MAIL_IPC.GET_EMAIL_BODY, (_evt, emailId: string) => {
    return storage.getEmailBody(emailId)
  })

  ipcMain.handle(VUA_MAIL_IPC.MARK_READ, (_evt, emailId: string, isRead: boolean) => {
    storage.markRead(emailId, isRead)
  })

  ipcMain.handle(VUA_MAIL_IPC.TOGGLE_STARRED, (_evt, emailId: string) => {
    return storage.toggleStarred(emailId)
  })

  ipcMain.handle(VUA_MAIL_IPC.DELETE_EMAIL, (_evt, emailId: string) => {
    storage.deleteEmail(emailId)
  })

  ipcMain.handle(VUA_MAIL_IPC.ARCHIVE_EMAIL, (_evt, emailId: string) => {
    storage.archiveEmail(emailId)
  })

  ipcMain.handle(VUA_MAIL_IPC.SEND_EMAIL, (_evt, draft) => {
    return storage.sendEmail(draft)
  })
}
