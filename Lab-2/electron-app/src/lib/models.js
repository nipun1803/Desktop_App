// ── Model catalog (Groq, free tier) ──────────────────────────────────────
// Every model runs on Groq's free API tier — you only need a free API key, no
// billing setup. `id` is the exact model string sent to Groq's API.
//
// Groq's model IDs change over time. If a call 404s / "model not found", just
// fix the string here — see https://console.groq.com/docs/models

export const MODELS = [
  { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B', provider: 'groq', note: 'Most capable' },
  { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B', provider: 'groq', note: 'Fast' },
  { id: 'qwen/qwen3.8-27b', label: 'Qwen3 27B', provider: 'groq', note: 'Capable' },
  { id: 'groq/compound', label: 'Groq Compound', provider: 'groq', note: 'Agentic + tools' },
]

export const PROVIDER_LABELS = {
  groq: 'Groq',
}

export const DEFAULT_MODEL_ID = 'openai/gpt-oss-120b'

export function getModel(id) {
  return MODELS.find((m) => m.id === id) ?? MODELS[0]
}

// Models grouped by provider, for a sectioned dropdown.
export function modelsByProvider() {
  const groups = {}
  for (const m of MODELS) {
    ;(groups[m.provider] ??= []).push(m)
  }
  return Object.entries(groups).map(([provider, models]) => ({
    provider,
    label: PROVIDER_LABELS[provider] ?? provider,
    models,
  }))
}
