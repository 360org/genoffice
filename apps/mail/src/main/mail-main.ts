import { WebContentsView, app } from 'electron'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { SQLiteMailStorage } from './db/sqlite-storage'
import { registerMailIpc } from './ipc/mail-ipc'

let mailStorage: SQLiteMailStorage | null = null

interface MailRuntimePaths {
  preloadPath?: string
  rendererUrl?: string
  rendererFile?: string
}

let runtime: MailRuntimePaths = {}

export function configureMailRuntime(paths: MailRuntimePaths): void {
  runtime = paths
}

export function initMailBackend(): SQLiteMailStorage {
  if (!mailStorage) {
    mailStorage = new SQLiteMailStorage()
    registerMailIpc(mailStorage)
  }
  return mailStorage
}

export function createMailView(): WebContentsView {
  initMailBackend()

  const APPS_ROOT = join(app.getAppPath(), '..')
  const MAIL_OUT = app.isPackaged
    ? join(process.resourcesPath, 'modules', 'mail')
    : join(APPS_ROOT, 'mail', 'out')

  const preloadPath =
    runtime.preloadPath ||
    (app.isPackaged
      ? join(process.resourcesPath, 'modules', 'mail', 'preload', 'index.js')
      : join(MAIL_OUT, 'preload', 'index.js'))

  const rendererFile =
    runtime.rendererFile ||
    (app.isPackaged
      ? join(process.resourcesPath, 'modules', 'mail', 'renderer', 'index.html')
      : join(MAIL_OUT, 'renderer', 'index.html'))

  const view = new WebContentsView({
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (runtime.rendererUrl || process.env.MAIL_RENDERER_URL) {
    void view.webContents.loadURL(runtime.rendererUrl || process.env.MAIL_RENDERER_URL!)
  } else if (!app.isPackaged && !existsSync(rendererFile)) {
    void view.webContents.loadURL('http://localhost:5178')
  } else {
    void view.webContents.loadFile(rendererFile)
  }

  return view
}
