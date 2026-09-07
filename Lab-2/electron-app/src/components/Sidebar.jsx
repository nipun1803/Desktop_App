import { motion } from 'motion/react'
import { Plus, MessageSquare, Settings, Search } from 'lucide-react'
import { cn } from '../lib/utils'
import OraMark from './OraMark'
import PersonaPicker from './PersonaPicker'

export default function Sidebar({
  threads,
  activeId,
  onSelect,
  onNew,
  personaId,
  onPersona,
}) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-hair/70 bg-ink-2/60 backdrop-blur-xl">
      {/* wordmark */}
      <div className="flex items-center gap-2.5 px-5 pb-4 pt-6">
        <OraMark className="h-8 w-8" glow />
        <div className="leading-none">
          <div className="font-display text-[26px] italic tracking-tight text-cream">
            Ora
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.32em] text-fog-dim">
            nocturne assistant
          </div>
        </div>
      </div>

      {/* new chat */}
      <div className="px-3">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-2.5 rounded-xl border border-hair bg-surface/60 px-3.5 py-2.5 text-[14px] text-cream transition-colors hover:border-ember/50 hover:bg-surface-2"
        >
          <Plus className="h-4 w-4 text-ember" strokeWidth={2.4} />
          New conversation
        </button>
      </div>

      {/* search */}
      <div className="px-3 pb-2 pt-3">
        <div className="flex items-center gap-2 rounded-lg bg-surface/40 px-3 py-2">
          <Search className="h-3.5 w-3.5 text-fog-dim" />
          <input
            placeholder="Search"
            className="w-full bg-transparent text-[13px] text-cream placeholder:text-fog-dim focus:outline-none"
          />
        </div>
      </div>

      {/* persona + thread list */}
      <div className="scroll-fine mt-1 flex-1 overflow-y-auto px-3 pb-3">
        <div className="px-2 pb-1.5 pt-2 font-mono text-[9px] uppercase tracking-[0.24em] text-fog-dim/70">
          Persona
        </div>
        <PersonaPicker value={personaId} onChange={onPersona} />

        <div className="mt-4 space-y-0.5">
          <div className="px-2 pb-1.5 pt-2 font-mono text-[9px] uppercase tracking-[0.24em] text-fog-dim/70">
            Recent
          </div>
        {threads.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={cn(
              'group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition-colors',
              t.id === activeId
                ? 'bg-surface-2 text-cream'
                : 'text-fog hover:bg-surface/50 hover:text-cream',
            )}
          >
            {t.id === activeId && (
              <motion.span
                layoutId="thread-active"
                className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-ember"
              />
            )}
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-fog-dim" />
            <span className="truncate">{t.title}</span>
          </button>
        ))}
        </div>
      </div>

      {/* footer / account */}
      <div className="border-t border-hair/70 p-3">
        <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-fog transition-colors hover:bg-surface/50 hover:text-cream">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-ember to-ember-deep font-mono text-[11px] font-medium text-ink">
            N
          </div>
          <div className="flex-1 text-left leading-tight">
            <div className="text-[13px] text-cream">Nipun</div>
            <div className="font-mono text-[10px] text-fog-dim">Free plan</div>
          </div>
          <Settings className="h-4 w-4 text-fog-dim" />
        </button>
      </div>
    </aside>
  )
}
