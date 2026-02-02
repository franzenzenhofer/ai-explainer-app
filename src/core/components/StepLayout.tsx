// StepLayout - Unified layout for all steps
import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../utils/cn'
import { fadeSlide } from '../utils/animations'
import { EducationalPanel } from './EducationalPanel'
import type { EducationalContent } from '../types'

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
}: StepLayoutProps) {
  return (
    <motion.div
      className="flex h-full flex-col gap-4"
      variants={fadeSlide}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-white shadow-lg"
            style={{ backgroundColor: accentColor }}
          >
            {stepNumber}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="text-slate-500">{subtitle}</p>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 w-8 rounded-full transition-all duration-300',
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

      {/* Main Content - Split View */}
      <div className="grid flex-1 grid-cols-2 gap-6 overflow-hidden">
        {/* Left Panel */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-medium text-slate-500">Input</h2>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {leftPanel}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-medium text-slate-500">Output</h2>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {rightPanel}
          </div>
        </div>
      </div>

      {/* Controls (if any) */}
      <AnimatePresence mode="wait">
        {controls && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            {controls}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Educational Panel */}
      <EducationalPanel content={educational} accentColor={accentColor} />
    </motion.div>
  )
}
