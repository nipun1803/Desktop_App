import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../lib/utils'
import { getModel, modelsByProvider } from '../lib/models'

export default function ModelPicker({ value, onChange, status }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const active = getModel(value)
  const groups = modelsByProvider()

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-hair bg-surface/60 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-fog transition-colors hover:border-ember/40 hover:text-cream"
      >
        {active.label}
        <ChevronDown
          className={cn('h-3 w-3 transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-xl border border-hair bg-ink-2/95 p-1.5 shadow-2xl backdrop-blur-xl"
          >
            {groups.map((g) => {
              const configured = status?.[g.provider]
              return (
                <div key={g.provider} className="mb-1 last:mb-0">
                  <div className="flex items-center justify-between px-2 pb-1 pt-1.5">
                    <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-fog-dim/70">
                      {g.label}
                    </span>
                    {status && (
                      <span
                        className={cn(
                          'flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider',
                          configured ? 'text-jade' : 'text-fog-dim/60',
                        )}
                        title={configured ? 'API key found' : 'No API key in .env'}
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            configured ? 'bg-jade' : 'bg-fog-dim/40',
                          )}
                        />
                        {configured ? 'ready' : 'no key'}
                      </span>
                    )}
                  </div>
                  {g.models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onChange(m.id)
                        setOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors',
                        m.id === value
                          ? 'bg-surface-2 text-cream'
                          : 'text-fog hover:bg-surface/60 hover:text-cream',
                      )}
                    >
                      <span className="flex flex-col leading-tight">
                        <span className="text-[13px]">{m.label}</span>
                        <span className="font-mono text-[9px] text-fog-dim">
                          {m.note}
                        </span>
                      </span>
                      {m.id === value && <Check className="h-3.5 w-3.5 text-ember" />}
                    </button>
                  ))}
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
