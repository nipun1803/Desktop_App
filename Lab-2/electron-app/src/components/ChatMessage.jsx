import { motion } from 'motion/react'
import { cn } from '../lib/utils'
import OraMark from './OraMark'
import Markdown from './Markdown'

export default function ChatMessage({
  role,
  content,
  time,
  pending,
  error,
  assistantName = 'ora',
}) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex w-full gap-3.5 px-6 py-3',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* avatar */}
      <div className="mt-0.5 shrink-0">
        {isUser ? (
          <div className="grid h-9 w-9 place-items-center rounded-full border border-hair bg-surface-2 font-mono text-xs text-fog">
            YOU
          </div>
        ) : (
          <OraMark className="h-9 w-9 bg-surface" glow />
        )}
      </div>

      {/* bubble */}
      <div
        className={cn(
          'flex max-w-[76%] flex-col gap-1.5',
          isUser ? 'items-end' : 'items-start',
        )}
      >
        <div className="flex items-center gap-2 px-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog-dim">
            {isUser ? 'you' : assistantName}
          </span>
          <span className="font-mono text-[10px] text-fog-dim/60">{time}</span>
        </div>

        <div
          className={cn(
            'break-words rounded-2xl px-4 py-3 text-[15px] leading-relaxed',
            isUser
              ? 'whitespace-pre-wrap rounded-tr-sm bg-cream text-ink'
              : error
                ? 'whitespace-pre-wrap rounded-tl-sm border border-rose/40 bg-rose/10 text-rose'
                : 'rounded-tl-sm border border-hair bg-surface/80 text-cream backdrop-blur-sm',
          )}
        >
          {isUser || error ? content : <Markdown>{content}</Markdown>}
          {pending && (
            <span className="ml-0.5 inline-block h-[1.05em] w-[2px] -translate-y-[1px] animate-blink bg-ember align-middle" />
          )}
        </div>
      </div>
    </motion.div>
  )
}
