import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { PenLine, Compass, Code2, Sparkle } from 'lucide-react'
import AuroraBackground from './components/AuroraBackground'
import Sidebar from './components/Sidebar'
import ChatMessage from './components/ChatMessage'
import Composer from './components/Composer'
import ModelPicker from './components/ModelPicker'
import CouncilBar from './components/CouncilBar'
import CouncilTurn from './components/CouncilTurn'
import OraMark from './components/OraMark'
import { cn } from './lib/utils'
import { DEFAULT_PERSONA_ID, getPersona } from './lib/personas'
import { DEFAULT_MODEL_ID, getModel } from './lib/models'
import { hasBridge, providerStatus, streamChat } from './lib/chat'
import {
  DEFAULT_MEMBERS,
  MAX_MEMBERS,
  MIN_MEMBERS,
  MODERATOR_SYSTEM,
  buildHistory,
  buildSynthesisPrompt,
} from './lib/council'

const SEED_THREADS = [
  { id: 't1', title: 'Naming a nocturne synth patch' },
  { id: 't2', title: 'Refactor the auth middleware' },
  { id: 't3', title: 'Weekend trip · coastal Portugal' },
  { id: 't4', title: 'Explain diffusion models simply' },
]

const SUGGESTIONS = [
  { icon: PenLine, label: 'Draft a warm follow-up email', tint: 'text-ember' },
  { icon: Code2, label: 'Debug a React re-render loop', tint: 'text-jade' },
  { icon: Compass, label: 'Plan a slow morning routine', tint: 'text-rose' },
  { icon: Sparkle, label: 'Turn notes into a poem', tint: 'text-ember' },
]

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function App() {
  const [threads] = useState(SEED_THREADS)
  const [activeId, setActiveId] = useState('t1')
  const [personaId, setPersonaId] = useState(DEFAULT_PERSONA_ID)
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID)
  const [mode, setMode] = useState('chat') // 'chat' | 'council'
  const [members, setMembers] = useState(DEFAULT_MEMBERS)
  const [messages, setMessages] = useState([])
  const [streaming, setStreaming] = useState(false)
  const [status, setStatus] = useState(null)
  const scrollRef = useRef(null)
  const cancelRef = useRef([]) // array of cancel fns for all in-flight streams

  const persona = getPersona(personaId)

  useEffect(() => {
    providerStatus().then(setStatus)
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  // ── single-persona chat ──────────────────────────────────────────────
  function sendChat(text) {
    const userMsg = { id: crypto.randomUUID(), role: 'user', content: text, time: now() }
    const history = buildHistory([...messages, userMsg])
    const assistantId = crypto.randomUUID()

    setMessages((m) => [
      ...m,
      userMsg,
      { id: assistantId, role: 'assistant', content: '', time: now(), pending: true },
    ])
    setStreaming(true)

    const model = getModel(modelId)
    const patch = (fn) =>
      setMessages((m) => m.map((msg) => (msg.id === assistantId ? fn(msg) : msg)))

    const cancel = streamChat({
      provider: model.provider,
      model: model.id,
      system: persona.system,
      messages: history,
      onText: (delta) => patch((msg) => ({ ...msg, content: msg.content + delta })),
      onDone: () => {
        setStreaming(false)
        cancelRef.current = []
        patch((msg) => ({ ...msg, pending: false }))
      },
      onError: (err) => {
        setStreaming(false)
        cancelRef.current = []
        patch((msg) => ({
          ...msg,
          pending: false,
          error: true,
          content: msg.content || `⚠️ ${err}`,
        }))
      },
    })
    cancelRef.current = [cancel]
  }

  // ── council: fan out to every selected persona in parallel ────────────
  function sendCouncil(text) {
    const memberIds = members
    const userMsg = { id: crypto.randomUUID(), role: 'user', content: text, time: now() }
    const history = buildHistory([...messages, userMsg])
    const turnId = crypto.randomUUID()

    setMessages((m) => [
      ...m,
      userMsg,
      {
        id: turnId,
        type: 'council',
        question: text,
        time: now(),
        entries: memberIds.map((pid) => ({
          personaId: pid,
          content: '',
          pending: true,
          error: false,
        })),
        synthesis: null,
      },
    ])
    setStreaming(true)

    const model = getModel(modelId)
    const patchEntry = (pid, fn) =>
      setMessages((m) =>
        m.map((msg) =>
          msg.id === turnId
            ? { ...msg, entries: msg.entries.map((e) => (e.personaId === pid ? fn(e) : e)) }
            : msg,
        ),
      )

    let remaining = memberIds.length
    const finishOne = () => {
      remaining -= 1
      if (remaining <= 0) {
        setStreaming(false)
        cancelRef.current = []
      }
    }

    cancelRef.current = memberIds.map((pid) => {
      const p = getPersona(pid)
      return streamChat({
        provider: model.provider,
        model: model.id,
        system: p.system,
        messages: history,
        onText: (delta) => patchEntry(pid, (e) => ({ ...e, content: e.content + delta })),
        onDone: () => {
          patchEntry(pid, (e) => ({ ...e, pending: false }))
          finishOne()
        },
        onError: (err) => {
          patchEntry(pid, (e) => ({
            ...e,
            pending: false,
            error: true,
            content: e.content || `⚠️ ${err}`,
          }))
          finishOne()
        },
      })
    })
  }

  // ── moderator merges the council's answers into one ───────────────────
  function synthesize(turnId) {
    const turn = messages.find((m) => m.id === turnId && m.type === 'council')
    if (!turn || turn.synthesis || streaming) return

    const model = getModel(modelId)
    const prompt = buildSynthesisPrompt(turn.question, turn.entries)

    setMessages((m) =>
      m.map((msg) =>
        msg.id === turnId
          ? { ...msg, synthesis: { content: '', pending: true, error: false } }
          : msg,
      ),
    )
    setStreaming(true)

    const patchSynth = (fn) =>
      setMessages((m) =>
        m.map((msg) => (msg.id === turnId ? { ...msg, synthesis: fn(msg.synthesis) } : msg)),
      )

    cancelRef.current = [
      streamChat({
        provider: model.provider,
        model: model.id,
        system: MODERATOR_SYSTEM,
        messages: [{ role: 'user', content: prompt }],
        onText: (delta) => patchSynth((s) => ({ ...s, content: s.content + delta })),
        onDone: () => {
          setStreaming(false)
          cancelRef.current = []
          patchSynth((s) => ({ ...s, pending: false }))
        },
        onError: (err) => {
          setStreaming(false)
          cancelRef.current = []
          patchSynth((s) => ({
            ...s,
            pending: false,
            error: true,
            content: s.content || `⚠️ ${err}`,
          }))
        },
      }),
    ]
  }

  function send(text) {
    if (streaming) return
    if (mode === 'council') {
      if (members.length === 0) return
      sendCouncil(text)
    } else {
      sendChat(text)
    }
  }

  function stop() {
    cancelRef.current.forEach((c) => c?.())
    cancelRef.current = []
    setStreaming(false)
    setMessages((m) =>
      m.map((msg) => {
        if (msg.type === 'council') {
          const entries = msg.entries.map((e) => (e.pending ? { ...e, pending: false } : e))
          const synthesis = msg.synthesis?.pending
            ? { ...msg.synthesis, pending: false }
            : msg.synthesis
          return { ...msg, entries, synthesis }
        }
        return msg.pending ? { ...msg, pending: false } : msg
      }),
    )
  }

  function newChat() {
    stop()
    setMessages([])
  }

  function toggleMember(id) {
    setMembers((cur) =>
      cur.includes(id)
        ? cur.length <= MIN_MEMBERS
          ? cur
          : cur.filter((x) => x !== id)
        : cur.length >= MAX_MEMBERS
          ? cur
          : [...cur, id],
    )
  }

  const empty = messages.length === 0
  const isCouncil = mode === 'council'
  const composerName = isCouncil ? { name: 'the council' } : persona

  return (
    <div className="grain relative flex h-screen w-screen overflow-hidden text-cream">
      <AuroraBackground />

      <div className="relative z-10 flex h-full w-full">
        <Sidebar
          threads={threads}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={newChat}
          personaId={personaId}
          onPersona={setPersonaId}
        />

        {/* main column */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* top bar */}
          <header className="flex items-center justify-between border-b border-hair/50 px-6 py-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jade opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-jade" />
              </span>
              <div className="leading-tight">
                <h1 className="text-[15px] text-cream">
                  {isCouncil ? 'Council' : persona.name}
                </h1>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-fog-dim">
                  {isCouncil ? `${members.length} advisors` : persona.tagline}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ModeToggle mode={mode} onChange={setMode} disabled={streaming} />
              <ModelPicker value={modelId} onChange={setModelId} status={status} />
            </div>
          </header>

          {/* messages / empty state */}
          <div ref={scrollRef} className="scroll-fine flex-1 overflow-y-auto">
            {empty ? (
              <EmptyState
                persona={persona}
                mode={mode}
                members={members}
                onPick={send}
              />
            ) : (
              <div className="py-6">
                {messages.map((m) =>
                  m.type === 'council' ? (
                    <div key={m.id} className="mx-auto max-w-5xl">
                      <CouncilTurn turn={m} onSynthesize={synthesize} />
                    </div>
                  ) : (
                    <div key={m.id} className="mx-auto max-w-3xl">
                      <ChatMessage {...m} assistantName={persona.name} />
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* composer */}
          <div className="mx-auto w-full max-w-3xl">
            {isCouncil && (
              <CouncilBar members={members} onToggle={toggleMember} disabled={streaming} />
            )}
            <Composer
              onSend={send}
              onStop={stop}
              streaming={streaming}
              persona={composerName}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

function ModeToggle({ mode, onChange, disabled }) {
  return (
    <div className="flex items-center rounded-lg border border-hair bg-surface/60 p-0.5">
      {['chat', 'council'].map((m) => (
        <button
          key={m}
          disabled={disabled}
          onClick={() => onChange(m)}
          className={cn(
            'rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors',
            mode === m ? 'bg-surface-2 text-cream' : 'text-fog-dim hover:text-fog',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          {m}
        </button>
      ))}
    </div>
  )
}

function EmptyState({ persona, mode, members, onPick }) {
  const isCouncil = mode === 'council'
  const memberNames = members.map((id) => getPersona(id).name).join(', ')

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="animate-float"
      >
        <OraMark className="h-16 w-16 bg-surface/60" glow />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="mt-6 font-display text-5xl italic tracking-tight"
      >
        <span className="shimmer-text">
          {isCouncil ? 'Convene the council.' : `Talking with ${persona.name}.`}
        </span>
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mt-2.5 max-w-md text-center text-[15px] text-fog"
      >
        {isCouncil
          ? `Ask once — ${memberNames} answer together, then merge into one.`
          : persona.greeting}
      </motion.p>

      <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s.label}
            onClick={() => onPick(s.label)}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
            whileHover={{ y: -3 }}
            className="group flex items-center gap-3 rounded-2xl border border-hair bg-surface/50 px-4 py-3.5 text-left backdrop-blur-sm transition-colors hover:border-ember/40 hover:bg-surface-2"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-2/80">
              <s.icon className={`h-[18px] w-[18px] ${s.tint}`} />
            </span>
            <span className="text-[14px] text-fog transition-colors group-hover:text-cream">
              {s.label}
            </span>
          </motion.button>
        ))}
      </div>

      {!hasBridge && (
        <p className="mt-8 rounded-lg border border-hair/60 bg-surface/40 px-3 py-2 text-center font-mono text-[10px] text-fog-dim">
          preview mode · run <span className="text-ember">npm start</span> with keys in{' '}
          <span className="text-ember">.env</span> for real replies
        </p>
      )}
    </div>
  )
}
