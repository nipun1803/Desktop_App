import { Users } from 'lucide-react'
import { cn } from '../lib/utils'
import { PERSONAS } from '../lib/personas'
import { MAX_MEMBERS, MIN_MEMBERS } from '../lib/council'

const ACCENT = {
  ember: 'border-ember/60 bg-ember/10 text-ember',
  rose: 'border-rose/60 bg-rose/10 text-rose',
  jade: 'border-jade/60 bg-jade/10 text-jade',
}

export default function CouncilBar({ members, onToggle, disabled }) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-6 pb-1 pt-3">
      <span className="mr-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-fog-dim">
        <Users className="h-3.5 w-3.5" />
        Council
      </span>
      {PERSONAS.map((p) => {
        const active = members.includes(p.id)
        const accent = ACCENT[p.accent] ?? ACCENT.ember
        // Prevent dropping below the minimum or exceeding the maximum.
        const lockOff = active && members.length <= MIN_MEMBERS
        const lockOn = !active && members.length >= MAX_MEMBERS
        const blocked = disabled || lockOff || lockOn
        return (
          <button
            key={p.id}
            onClick={() => !blocked && onToggle(p.id)}
            disabled={blocked}
            title={
              lockOn
                ? `Up to ${MAX_MEMBERS} advisors`
                : lockOff
                  ? `At least ${MIN_MEMBERS} advisors`
                  : p.tagline
            }
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-colors',
              active
                ? accent
                : 'border-hair bg-surface/40 text-fog-dim hover:border-fog-dim/50 hover:text-fog',
              blocked && !active && 'cursor-not-allowed opacity-40',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <span className="font-mono text-[11px]">{p.glyph}</span>
            {p.name}
          </button>
        )
      })}
    </div>
  )
}
