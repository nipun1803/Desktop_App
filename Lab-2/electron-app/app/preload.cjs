// Preload runs in an isolated context with access to ipcRenderer, and exposes
// a small, safe `window.ora` API to the React app. No Node or keys leak into
// the renderer — only these functions cross the bridge.
const { contextBridge, ipcRenderer } = require('electron')

let seq = 0

contextBridge.exposeInMainWorld('ora', {
  hasBridge: true,

  // Which providers have API keys configured (from .env in the main process).
  status: () => ipcRenderer.invoke('ora:status'),

  /**
   * Start a streaming chat. Returns a cancel() function.
   * callbacks: { onText(delta), onDone({ text }), onError(message) }
   */
  chat(payload, { onText, onDone, onError } = {}) {
    const id = `req-${++seq}-${Date.now()}`

    const onChunk = (_e, m) => m.id === id && onText?.(m.text)
    const onDoneEv = (_e, m) => {
      if (m.id !== id) return
      cleanup()
      onDone?.({ text: m.text })
    }
    const onErr = (_e, m) => {
      if (m.id !== id) return
      cleanup()
      onError?.(m.error)
    }

    function cleanup() {
      ipcRenderer.removeListener('ora:chunk', onChunk)
      ipcRenderer.removeListener('ora:done', onDoneEv)
      ipcRenderer.removeListener('ora:error', onErr)
    }

    ipcRenderer.on('ora:chunk', onChunk)
    ipcRenderer.on('ora:done', onDoneEv)
    ipcRenderer.on('ora:error', onErr)
    ipcRenderer.send('ora:chat', { id, ...payload })

    return () => {
      cleanup()
      ipcRenderer.send('ora:cancel', id)
    }
  },
})
