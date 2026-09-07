// ── Council mode ─────────────────────────────────────────────────────────
// A "council" fans one prompt out to several personas at once (independent,
// parallel completions), then an optional Moderator synthesizes their answers
// into one. This module holds the pure logic; the UI lives in components.

import { getPersona } from './personas'

// Who's on the council by default when you first switch modes.
export const DEFAULT_MEMBERS = ['sage', 'byte', 'coach']

// Keep the panel readable and cheap — 2 to 5 advisors.
export const MIN_MEMBERS = 2
export const MAX_MEMBERS = 5

export const MODERATOR_SYSTEM =
  'You are the Council Moderator. Several advisors have each answered the ' +
  "user's question independently. Synthesize their responses into one clear, " +
  'balanced answer: keep the strongest insight from each, reconcile ' +
  'disagreements explicitly, and note the key trade-offs. Integrate their ' +
  'views — do not just list what each one said. Be concise and practical.'

// Build the Moderator's user message from the question + each advisor's answer.
export function buildSynthesisPrompt(question, entries) {
  const answers = entries
    .filter((e) => e.content && !e.error)
    .map((e) => `## ${getPersona(e.personaId).name}\n${e.content}`)
    .join('\n\n')

  return (
    `The user asked:\n"${question}"\n\n` +
    `The advisors answered:\n\n${answers}\n\n` +
    'Now synthesize these into a single, integrated answer for the user.'
  )
}

// Flatten the transcript into plain {role, content} turns for context.
// A council turn contributes its synthesis if it has one; otherwise it's
// skipped (advisors never see each other's raw answers).
export function buildHistory(messages) {
  const out = []
  for (const m of messages) {
    if (m.type === 'council') {
      if (m.synthesis?.content && !m.synthesis.error) {
        out.push({ role: 'assistant', content: m.synthesis.content })
      }
    } else if (m.role === 'user' || m.role === 'assistant') {
      if (m.content) out.push({ role: m.role, content: m.content })
    }
  }
  return out
}
