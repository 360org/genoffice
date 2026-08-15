import { WebContentsView, app } from 'electron'
import { join } from 'node:path'
import { SQLiteMailStorage } from './db/sqlite-storage'
import { registerMailIpc } from './ipc/mail-ipc'

let mailStorage: SQLiteMailStorage | null = null

export function initMailBackend(): SQLiteMailStorage {
  if (!mailStorage) {
    mailStorage = new SQLiteMailStorage()
    registerMailIpc(mailStorage)
  }
  return mailStorage
}

export function createMailView(): WebContentsView {
  initMailBackend()

  const preloadPath = app.isPackaged
    ? join(process.resourcesPath, 'modules', 'mail', 'preload', 'index.js')
    : join(__dirname, '../../mail/out/preload/index.js')

  const view = new WebContentsView({
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
    },
  })

  if (process.env.MAIL_RENDERER_URL) {
    view.webContents.loadURL(process.env.MAIL_RENDERER_URL)
  } else if (!app.isPackaged) {
    view.webContents.loadURL('http://localhost:5178')
  } else {
    view.webContents.loadFile(join(process.resourcesPath, 'modules', 'mail', 'renderer', 'index.html'))
  }

  return view
}
