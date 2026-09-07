import { useRef, useState } from 'react'
import { ArrowUp, Paperclip, Sparkles, Square } from 'lucide-react'
import { cn } from '../lib/utils'

export default function Composer({ onSend, onStop, streaming, persona }) {
  const [value, setValue] = useState('')
  const taRef = useRef(null)

  function submit() {
    const text = value.trim()
    if (!text || streaming) return
    onSend(text)
    setValue('')
    if (taRef.current) taRef.current.style.height = 'auto'
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function grow(e) {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  const canSend = !!value.trim() && !streaming

  return (
    <div className="px-6 pb-6 pt-2">
      <div
        className={cn(
          'group relative rounded-[22px] p-[1px] transition-shadow duration-500',
          streaming ? 'opacity-90' : 'moving-border',
        )}
      >
        <div className="rounded-[21px] bg-surface/90 backdrop-blur-xl">
          <textarea
            ref={taRef}
            rows={1}
            value={value}
            onChange={grow}
            onKeyDown={handleKey}
            placeholder={`Message ${persona?.name ?? 'Ora'}…`}
            className="no-scrollbar max-h-[200px] w-full resize-none bg-transparent px-5 pt-4 text-[15px] leading-relaxed text-cream placeholder:text-fog-dim focus:outline-none"
          />
          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            <div className="flex items-center gap-1">
              <button className="grid h-9 w-9 place-items-center rounded-lg text-fog-dim transition-colors hover:bg-surface-2 hover:text-fog">
                <Paperclip className="h-[18px] w-[18px]" />
              </button>
              <button className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-fog-dim transition-colors hover:bg-surface-2 hover:text-fog">
                <Sparkles className="h-[18px] w-[18px]" />
                <span className="text-[13px]">Reason</span>
              </button>
            </div>

            {streaming ? (
              <button
                onClick={onStop}
                className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-cream transition-all duration-200 hover:scale-105 hover:bg-rose hover:text-ink"
                title="Stop generating"
              >
                <Square className="h-[15px] w-[15px]" strokeWidth={2.4} />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={!canSend}
                className={cn(
                  'grid h-9 w-9 place-items-center rounded-full transition-all duration-200',
                  canSend
                    ? 'bg-cream text-ink hover:scale-105 hover:bg-ember'
                    : 'cursor-not-allowed bg-surface-2 text-fog-dim',
                )}
              >
                <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.4} />
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="mt-2.5 text-center font-mono text-[10px] tracking-wide text-fog-dim/70">
        {persona?.name ?? 'Ora'} can be thoughtful, but check anything that matters ·{' '}
        <kbd className="text-fog-dim">⏎</kbd> to send ·{' '}
        <kbd className="text-fog-dim">⇧⏎</kbd> for newline
      </p>
    </div>
  )
}
