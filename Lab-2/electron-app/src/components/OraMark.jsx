import { cn } from '../lib/utils'

/** The Ora mark — a small ember orbit. Used as the assistant avatar & wordmark glyph. */
export default function OraMark({ className, glow = false }) {
  return (
    <span
      className={cn(
        'relative grid place-items-center rounded-full',
        glow && 'shadow-[0_0_24px_-4px_var(--color-ember-deep)]',
        className,
      )}
    >
      <svg viewBox="0 0 40 40" className="h-full w-full">
        <defs>
          <radialGradient id="ora-core" cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="var(--color-cream)" />
            <stop offset="45%" stopColor="var(--color-ember)" />
            <stop offset="100%" stopColor="var(--color-ember-deep)" />
          </radialGradient>
        </defs>
        <circle cx="20" cy="20" r="9" fill="url(#ora-core)" />
        <ellipse
          cx="20"
          cy="20"
          rx="16.5"
          ry="6.5"
          fill="none"
          stroke="var(--color-ember)"
          strokeWidth="1.4"
          strokeOpacity="0.7"
          transform="rotate(-24 20 20)"
        />
        <circle cx="34.2" cy="14.3" r="1.7" fill="var(--color-cream)" />
      </svg>
    </span>
  )
}
