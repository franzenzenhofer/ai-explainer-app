// FullscreenModal - Reusable fullscreen overlay for output panels
import { useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Maximize2 } from 'lucide-react'

interface FullscreenModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  accentColor?: string
}

export function FullscreenModal({
  isOpen,
  onClose,
  title,
  children,
  accentColor = '#3b82f6',
}: FullscreenModalProps) {
  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative h-[90vh] w-[95vw] overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between border-b px-6 py-4"
              style={{ borderColor: accentColor + '30' }}
            >
              <h2 className="text-lg font-semibold text-slate-800">
                {title || 'Fullscreen View'}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="h-[calc(90vh-80px)] overflow-auto p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Fullscreen button to trigger the modal
interface FullscreenButtonProps {
  onClick: () => void
  accentColor?: string
}

export function FullscreenButton({ onClick, accentColor = '#3b82f6' }: FullscreenButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 hover:scale-110"
      title="Open fullscreen"
    >
      <Maximize2 className="h-4 w-4" />
    </button>
  )
}
