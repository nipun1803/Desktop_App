import 'dotenv/config'
import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { providerStatus, streamCompletion } from './llm/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,

    minWidth: 720,
    minHeight: 520,
    backgroundColor: '#0b0a0c',
    webPreferences: {
      preload: join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.loadURL('http://localhost:5173')
}

// Track in-flight requests so the renderer can cancel them.
const inflight = new Map() // id -> AbortController

ipcMain.handle('ora:status', () => providerStatus())

ipcMain.on('ora:chat', async (event, { id, provider, model, system, messages }) => {
  const controller = new AbortController()
  inflight.set(id, controller)

  const send = (channel, payload) => {
    if (!event.sender.isDestroyed()) event.sender.send(channel, payload)
  }

  try {
    const text = await streamCompletion({
      provider,
      model,
      system,
      messages,
      signal: controller.signal,
      onText: (delta) => send('ora:chunk', { id, text: delta }),
    })
    send('ora:done', { id, text })
  } catch (err) {
    if (controller.signal.aborted) {
      send('ora:done', { id, text: '' })
    } else {
      send('ora:error', { id, error: err?.message ?? String(err) })
    }
  } finally {
    inflight.delete(id)
  }
})

ipcMain.on('ora:cancel', (_event, id) => {
  inflight.get(id)?.abort()
  inflight.delete(id)
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
