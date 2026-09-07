import OpenAI from 'openai'

// Groq, OpenRouter, Together, etc. all expose the OpenAI Chat Completions wire
// format — only the base URL and key differ. This factory builds a uniform
// stream() adapter for any of them.
export function createOpenAICompatible({ apiKeyEnv, baseURL, defaultHeaders }) {
  let client
  function getClient() {
    if (!client) {
      client = new OpenAI({
        apiKey: process.env[apiKeyEnv],
        baseURL,
        ...(defaultHeaders ? { defaultHeaders } : {}),
      })
    }
    return client
  }

  const isConfigured = () => !!process.env[apiKeyEnv]

  async function stream({ model, system, messages, onText, signal }) {
    const chatMessages = [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages,
    ]

    const s = await getClient().chat.completions.create(
      { model, messages: chatMessages, stream: true },
      { signal },
    )

    let full = ''
    for await (const chunk of s) {
      const delta = chunk.choices?.[0]?.delta?.content
      if (delta) {
        full += delta
        onText(delta)
      }
    }
    return full
  }

  return { isConfigured, stream }
}
