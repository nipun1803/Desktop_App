import { createOpenAICompatible } from './openai-compatible.js'

// Groq has a genuinely free API tier — create a key and go, no billing setup.
//   https://console.groq.com/keys   → GROQ_API_KEY

const groq = createOpenAICompatible({
  apiKeyEnv: 'GROQ_API_KEY',
  baseURL: 'https://api.groq.com/openai/v1',
})

const PROVIDERS = { groq }

export function providerStatus() {
  return Object.fromEntries(
    Object.entries(PROVIDERS).map(([name, p]) => [name, p.isConfigured()]),
  )
}

/**
 * Stream a completion from the named provider.
 * Throws a friendly Error if the provider is unknown or has no API key.
 */
export async function streamCompletion({ provider, model, system, messages, onText, signal }) {
  const p = PROVIDERS[provider]
  if (!p) throw new Error(`Unknown provider: ${provider}`)
  if (!p.isConfigured()) {
    throw new Error(
      `No API key for ${provider}. Add GROQ_API_KEY to your .env file and restart.`,
    )
  }
  return p.stream({ model, system, messages, onText, signal })
}
