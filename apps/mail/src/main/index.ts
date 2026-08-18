import { app, BrowserWindow } from 'electron'
import * as path from 'node:path'
import { SQLiteMailStorage } from './db/sqlite-storage'
import { registerMailIpc } from './ipc/mail-ipc'

let mainWindow: BrowserWindow | null = null
let storage: SQLiteMailStorage | null = null

export function initMailMain(): SQLiteMailStorage {
  if (!storage) {
    storage = new SQLiteMailStorage()
    registerMailIpc(storage)
  }
  return storage
}

function createWindow(): void {
  storage = initMailMain()

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'VuaOffice Mail',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

// In standalone mode or dev
if (process.env.MAIL_STANDALONE === 'true') {
  app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
