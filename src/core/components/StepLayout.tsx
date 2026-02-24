// StepLayout - Unified layout for all steps
import { type ReactNode, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Maximize2, X } from 'lucide-react'
import { cn } from '../utils/cn'
import { fadeSlide } from '../utils/animations'
import { EducationalPanel } from './EducationalPanel'
import type { EducationalContent } from '../types'

type LayoutMode = 'balanced' | 'viz-wide' | 'viz-full'

interface StepLayoutProps {
  title: string
  subtitle: string
  accentColor: string
  leftPanel: ReactNode
  rightPanel: ReactNode
  controls?: ReactNode
  educational: EducationalContent
  stepNumber: number
  totalSteps: number
  layout?: LayoutMode
}

export function StepLayout({
  title,
  subtitle,
  accentColor,
  leftPanel,
  rightPanel,
  controls,
  educational,
  stepNumber,
  totalSteps,
  layout = 'balanced',
}: StepLayoutProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsFullscreen(false)
  }, [])

  useEffect(() => {
    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isFullscreen, handleKeyDown])

  const gridClass =
    layout === 'viz-wide'
      ? 'grid-cols-[35fr_65fr]'
      : 'grid-cols-2'

  return (
    <motion.div
      className="flex h-full flex-col gap-1.5"
      variants={fadeSlide}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold text-white shadow-md"
            style={{ backgroundColor: accentColor }}
          >
            {stepNumber}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 w-6 rounded-full transition-all duration-300',
                i < stepNumber
                  ? 'bg-slate-300'
                  : i === stepNumber - 1
                    ? 'bg-current'
                    : 'bg-slate-200'
              )}
              style={i === stepNumber - 1 ? { backgroundColor: accentColor } : undefined}
            />
          ))}
        </div>
      </header>

      {/* Main Content */}
      {layout === 'viz-full' ? (
        <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
          {/* Compact text row from leftPanel */}
          <div className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur">
            {leftPanel}
          </div>

          {/* Controls inline if present */}
          <AnimatePresence mode="wait">
            {controls && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                {controls}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Full-width visualization */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-1">
              <h2 className="text-xs font-medium text-slate-500">{title}</h2>
              <button
                onClick={() => setIsFullscreen(true)}
                className="rounded p-1 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
                title="Fullscreen (Esc to close)"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {rightPanel}
            </div>
          </div>
        </div>
      ) : (
        /* balanced or viz-wide: two-column grid */
        <div className={cn('grid flex-1 gap-3 overflow-hidden', gridClass)}>
          {/* Left Panel */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur">
            <div className="border-b border-slate-200 px-3 py-1.5">
              <h2 className="text-xs font-medium text-slate-500">{title}</h2>
            </div>
            <div className="flex-1 overflow-auto p-3">
              {leftPanel}
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-1.5">
              <h2 className="text-xs font-medium text-slate-500">{subtitle}</h2>
              <button
                onClick={() => setIsFullscreen(true)}
                className="rounded p-1 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
                title="Fullscreen (Esc to close)"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-3">
              {rightPanel}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Overlay - FULL BROWSER */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Fullscreen Header */}
            <div
              className="flex items-center justify-between border-b px-6 py-4"
              style={{ borderColor: accentColor + '30' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {stepNumber}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
                  <p className="text-sm text-slate-500">{subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="Close (Esc)"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Fullscreen Content */}
            <div className="flex-1 overflow-auto p-6">
              {rightPanel}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls (only for non-viz-full, since viz-full renders them inline) */}
      {layout !== 'viz-full' && (
        <AnimatePresence mode="wait">
          {controls && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
            >
              {controls}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Educational Panel */}
      <EducationalPanel content={educational} accentColor={accentColor} />
    </motion.div>
  )
}
