// ── Renderer-side chat client ────────────────────────────────────────────
// Bridges the UI to the Electron main process (window.ora), which does the
// actual provider API calls with keys from .env. In a plain browser (vite dev
// without electron) there is no bridge, so we simulate a streamed reply — the
// whole UI still works, you just won't get real model output until you run the
// app under electron with keys set.

const MOCK_LINES = [
  "I'm running in preview mode — no API bridge is attached yet.",
  'Launch the app with `npm start` (Electron) and add keys to `.env` to talk to a real model.',
  'Meanwhile, persona switching, model switching, and streaming all work.',
]

function mockStream({ onText, onDone }) {
  const text = MOCK_LINES.join(' ')
  let i = 0
  const timer = setInterval(() => {
    if (i >= text.length) {
      clearInterval(timer)
      onDone?.({ text })
      return
    }
    // emit a few chars at a time for a natural typing feel
    const chunk = text.slice(i, i + 3)
    i += 3
    onText?.(chunk)
  }, 24)
  return () => clearInterval(timer)
}

/**
 * Start a streaming completion.
 * @returns {() => void} cancel function
 */
export function streamChat({ provider, model, system, messages, onText, onDone, onError }) {
  const bridge = typeof window !== 'undefined' ? window.ora : undefined
  if (bridge?.hasBridge) {
    return bridge.chat(
      { provider, model, system, messages },
      { onText, onDone, onError },
    )
  }
  return mockStream({ onText, onDone })
}

/** Which providers have API keys configured (main process tells us). */
export async function providerStatus() {
  const bridge = typeof window !== 'undefined' ? window.ora : undefined
  if (bridge?.hasBridge) {
    try {
      return await bridge.status()
    } catch {
      return null
    }
  }
  return null
}

export const hasBridge =
  typeof window !== 'undefined' && !!window.ora?.hasBridge
