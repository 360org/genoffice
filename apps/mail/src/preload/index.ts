import { contextBridge, ipcRenderer } from 'electron'
import { VUA_MAIL_IPC } from '../shared/ipc-events'
import type { EmailAccount, EmailBody, EmailMessage, MailFolder, VuaMailApi } from '../shared/types'

const api: VuaMailApi = {
  getAccounts: (): Promise<EmailAccount[]> => ipcRenderer.invoke(VUA_MAIL_IPC.GET_ACCOUNTS),
  getFolders: (accountId: string): Promise<MailFolder[]> => ipcRenderer.invoke(VUA_MAIL_IPC.GET_FOLDERS, accountId),
  getEmails: (folderId: string, category?: 'focused' | 'other'): Promise<EmailMessage[]> =>
    ipcRenderer.invoke(VUA_MAIL_IPC.GET_EMAILS, folderId, category),
  getEmailBody: (emailId: string): Promise<EmailBody | null> => ipcRenderer.invoke(VUA_MAIL_IPC.GET_EMAIL_BODY, emailId),
  markRead: (emailId: string, isRead: boolean): Promise<void> => ipcRenderer.invoke(VUA_MAIL_IPC.MARK_READ, emailId, isRead),
  toggleStarred: (emailId: string): Promise<boolean> => ipcRenderer.invoke(VUA_MAIL_IPC.TOGGLE_STARRED, emailId),
  deleteEmail: (emailId: string): Promise<void> => ipcRenderer.invoke(VUA_MAIL_IPC.DELETE_EMAIL, emailId),
  archiveEmail: (emailId: string): Promise<void> => ipcRenderer.invoke(VUA_MAIL_IPC.ARCHIVE_EMAIL, emailId),
  sendEmail: (draft): Promise<{ success: boolean; emailId?: string }> =>
    ipcRenderer.invoke(VUA_MAIL_IPC.SEND_EMAIL, draft),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('vuaMail', api)
  } catch (error) {
    console.error('Failed to expose vuaMail via contextBridge', error)
  }
} else {
  // @ts-ignore
  window.vuaMail = api
}
