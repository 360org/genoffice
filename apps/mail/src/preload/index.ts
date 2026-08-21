import { contextBridge, ipcRenderer } from 'electron'
import { MAIL_IPC } from '../shared/ipc-events'
import type { EmailAccount, EmailBody, EmailMessage, MailFolder, MailApi } from '../shared/types'

const api: MailApi = {
  getAccounts: (): Promise<EmailAccount[]> => ipcRenderer.invoke(MAIL_IPC.GET_ACCOUNTS),
  getFolders: (accountId: string): Promise<MailFolder[]> => ipcRenderer.invoke(MAIL_IPC.GET_FOLDERS, accountId),
  getEmails: (folderId: string, category?: 'focused' | 'other'): Promise<EmailMessage[]> =>
    ipcRenderer.invoke(MAIL_IPC.GET_EMAILS, folderId, category),
  getEmailBody: (emailId: string): Promise<EmailBody | null> => ipcRenderer.invoke(MAIL_IPC.GET_EMAIL_BODY, emailId),
  markRead: (emailId: string, isRead: boolean): Promise<void> => ipcRenderer.invoke(MAIL_IPC.MARK_READ, emailId, isRead),
  toggleStarred: (emailId: string): Promise<boolean> => ipcRenderer.invoke(MAIL_IPC.TOGGLE_STARRED, emailId),
  deleteEmail: (emailId: string): Promise<void> => ipcRenderer.invoke(MAIL_IPC.DELETE_EMAIL, emailId),
  archiveEmail: (emailId: string): Promise<void> => ipcRenderer.invoke(MAIL_IPC.ARCHIVE_EMAIL, emailId),
  sendEmail: (draft): Promise<{ success: boolean; emailId?: string }> =>
    ipcRenderer.invoke(MAIL_IPC.SEND_EMAIL, draft),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('mailApi', api)
  } catch (error) {
    console.error('Failed to expose mailApi via contextBridge', error)
  }
} else {
  // @ts-ignore
  window.mailApi = api
}
