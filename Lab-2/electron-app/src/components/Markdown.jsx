import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Element styling. Font size is inherited from the parent (so the same renderer
// looks right in a 15px chat bubble and a 13.5px council card); we only style
// structure, weight, and color.
const components = {
  p: (props) => <p className="mb-2 last:mb-0" {...props} />,
  h1: (props) => <h1 className="mb-2 mt-1 text-[1.3em] font-semibold text-cream" {...props} />,
  h2: (props) => <h2 className="mb-2 mt-1 text-[1.15em] font-semibold text-cream" {...props} />,
  h3: (props) => <h3 className="mb-1.5 mt-1 text-[1.05em] font-semibold text-cream" {...props} />,
  ul: (props) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...props} />,
  ol: (props) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...props} />,
  li: (props) => <li className="pl-0.5" {...props} />,
  a: (props) => (
    <a
      className="text-ember underline underline-offset-2 hover:text-ember-deep"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  strong: (props) => <strong className="font-semibold text-cream" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  blockquote: (props) => (
    <blockquote className="mb-2 border-l-2 border-hair pl-3 italic text-fog-dim" {...props} />
  ),
  hr: () => <hr className="my-3 border-hair" />,
  code: (props) => (
    <code
      className="rounded bg-ink-2/90 px-1 py-0.5 font-mono text-[0.85em]"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="scroll-fine mb-2 overflow-x-auto rounded-lg border border-hair bg-ink-2/80 p-3 text-[0.85em] last:mb-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit"
      {...props}
    />
  ),
  table: (props) => (
    <div className="mb-2 overflow-x-auto">
      <table className="w-full border-collapse text-[0.9em]" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="border border-hair px-2 py-1 text-left font-semibold" {...props} />
  ),
  td: (props) => <td className="border border-hair px-2 py-1" {...props} />,
}

export default function Markdown({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  )
}
