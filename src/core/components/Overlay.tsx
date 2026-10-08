// An overlay panel on top of the slide ("Go deeper", "Sources"). It never extends the page: the panel
// scrolls inside itself. Escape and the Close button close it; focus moves to Close when it opens.
import { X } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useEscape } from '../navigation/navigation'

interface OverlayProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Overlay({ title, onClose, children }: OverlayProps) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  useEscape(true, onClose)
  useEffect(() => closeRef.current?.focus(), [])
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="slide-overlay absolute inset-0 z-40 flex items-center justify-center bg-slate-900/20 p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-overlay
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border-t-8 bg-paper shadow-2xl"
        style={{ borderColor: 'var(--concept)' }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-rule px-6 py-3">
          <h2 id={titleId} className="m-0 text-xl font-bold" style={{ color: 'var(--concept-strong)' }}>{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center gap-1 rounded-lg border-2 border-ink/15 px-3 text-base font-semibold text-ink hover:border-ink/40"
          >
            <X aria-hidden="true" size={18} />
            Close
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-6 py-5">{children}</div>
      </motion.div>
    </motion.div>
  )
}
