/**
 * Aceternity-style aurora — warm ember light bleeding through the ink.
 * Pure CSS blobs, blurred and slowly drifting behind everything.
 */
export default function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* base vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,#1a1519_0%,var(--color-ink)_55%)]" />

      {/* drifting ember blobs */}
      <div
        className="absolute -top-40 left-1/4 h-[38rem] w-[38rem] rounded-full opacity-60 blur-[120px] animate-aurora"
        style={{
          background:
            'radial-gradient(circle, var(--color-ember-deep) 0%, transparent 65%)',
        }}
      />
      <div
        className="absolute top-1/3 -right-32 h-[30rem] w-[30rem] rounded-full opacity-40 blur-[120px] animate-aurora"
        style={{
          background:
            'radial-gradient(circle, var(--color-rose) 0%, transparent 65%)',
          animationDelay: '-6s',
        }}
      />
      <div
        className="absolute bottom-[-12rem] left-1/3 h-[34rem] w-[34rem] rounded-full opacity-25 blur-[130px] animate-aurora"
        style={{
          background:
            'radial-gradient(circle, var(--color-jade) 0%, transparent 65%)',
          animationDelay: '-11s',
        }}
      />

      {/* faint dot-grid */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(var(--color-hair) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage:
            'radial-gradient(100% 60% at 50% 0%, black 0%, transparent 80%)',
        }}
      />
    </div>
  )
}
