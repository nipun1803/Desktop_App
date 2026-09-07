import { motion } from 'motion/react'
import { Sparkles, Zap } from 'lucide-react'
import { cn } from '../lib/utils'
import { getPersona } from '../lib/personas'
import Markdown from './Markdown'

const ACCENT = {
  ember: { border: 'border-ember/40', head: 'text-ember', dot: 'bg-ember' },
  rose: { border: 'border-rose/40', head: 'text-rose', dot: 'bg-rose' },
  jade: { border: 'border-jade/40', head: 'text-jade', dot: 'bg-jade' },
}

function Caret() {
  return (
    <span className="ml-0.5 inline-block h-[1.05em] w-[2px] -translate-y-[1px] animate-blink bg-ember align-middle" />
  )
}

function AdvisorCard({ entry }) {
  const persona = getPersona(entry.personaId)
  const accent = ACCENT[persona.accent] ?? ACCENT.ember
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex w-[300px] shrink-0 flex-col rounded-2xl border bg-surface/70 backdrop-blur-sm sm:w-auto sm:flex-1 sm:min-w-[240px]',
        entry.error ? 'border-rose/40' : accent.border,
      )}
    >
      <div className="flex items-center gap-2 border-b border-hair/60 px-3.5 py-2.5">
        <span
          className={cn(
            'grid h-6 w-6 place-items-center rounded-md bg-ink-2/80 font-mono text-[12px]',
            accent.head,
          )}
        >
          {persona.glyph}
        </span>
        <span className="text-[13px] text-cream">{persona.name}</span>
        {entry.pending && (
          <span className={cn('ml-auto h-1.5 w-1.5 animate-pulse rounded-full', accent.dot)} />
        )}
      </div>
      <div
        className={cn(
          'break-words px-3.5 py-3 text-[13.5px] leading-relaxed',
          entry.error ? 'whitespace-pre-wrap text-rose' : 'text-fog',
        )}
      >
        {entry.error ? entry.content : <Markdown>{entry.content}</Markdown>}
        {!entry.content && !entry.pending && '—'}
        {entry.pending && <Caret />}
      </div>
    </motion.div>
  )
}

export default function CouncilTurn({ turn, onSynthesize }) {
  const allDone = turn.entries.every((e) => !e.pending)
  const hasSubstance = turn.entries.some((e) => e.content && !e.error)
  const synth = turn.synthesis

  return (
    <div className="px-6 py-4">
      {/* advisor panel */}
      <div className="scroll-fine flex gap-3 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {turn.entries.map((e) => (
          <AdvisorCard key={e.personaId} entry={e} />
        ))}
      </div>

      {/* synthesize action */}
      {allDone && hasSubstance && !synth && (
        <div className="mt-4 flex justify-center">
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onSynthesize(turn.id)}
            className="group flex items-center gap-2 rounded-full border border-ember/50 bg-ember/10 px-4 py-2 text-[13px] text-ember transition-all hover:scale-[1.03] hover:bg-ember/20"
          >
            <Zap className="h-4 w-4" strokeWidth={2.2} />
            Synthesize the council
          </motion.button>
        </div>
      )}

      {/* synthesis result */}
      {synth && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 rounded-2xl border border-ember/40 bg-surface/80 shadow-[0_0_40px_-12px_var(--color-ember-deep)] backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 border-b border-ember/25 px-4 py-2.5">
            <Sparkles className="h-4 w-4 text-ember" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember">
              Council synthesis
            </span>
          </div>
          <div
            className={cn(
              'break-words px-4 py-3.5 text-[15px] leading-relaxed',
              synth.error ? 'whitespace-pre-wrap text-rose' : 'text-cream',
            )}
          >
            {synth.error ? synth.content : <Markdown>{synth.content}</Markdown>}
            {synth.pending && <Caret />}
          </div>
        </motion.div>
      )}
    </div>
  )
}
