import { motion } from 'motion/react'
import { cn } from '../lib/utils'
import { PERSONAS } from '../lib/personas'

const ACCENT = {
  ember: { ring: 'border-ember/50', dot: 'bg-ember', text: 'text-ember' },
  rose: { ring: 'border-rose/50', dot: 'bg-rose', text: 'text-rose' },
  jade: { ring: 'border-jade/50', dot: 'bg-jade', text: 'text-jade' },
}

export default function PersonaPicker({ value, onChange }) {
  return (
    <div className="space-y-0.5">
      {PERSONAS.map((p) => {
        const accent = ACCENT[p.accent] ?? ACCENT.ember
        const active = p.id === value
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={cn(
              'group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
              active
                ? 'bg-surface-2 text-cream'
                : 'text-fog hover:bg-surface/50 hover:text-cream',
            )}
          >
            {active && (
              <motion.span
                layoutId="persona-active"
                className={cn(
                  'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full',
                  accent.dot,
                )}
              />
            )}
            <span
              className={cn(
                'grid h-7 w-7 shrink-0 place-items-center rounded-lg border bg-ink-2/80 font-mono text-[13px]',
                active ? accent.ring : 'border-hair',
                accent.text,
              )}
            >
              {p.glyph}
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[13px]">{p.name}</span>
              <span className="truncate font-mono text-[9px] text-fog-dim">
                {p.tagline}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
