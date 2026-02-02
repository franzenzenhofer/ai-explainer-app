// DebugOverlay - Development debugging panel
import { motion, AnimatePresence } from 'motion/react'
import { Bug, X } from 'lucide-react'
import { useDebug } from '../hooks/useDebug'
import { useAppStore } from '../../store/appStore'
import { cn } from '../utils/cn'

export function DebugOverlay() {
  const { debugMode, toggleDebugMode } = useDebug()
  const state = useAppStore()

  return (
    <AnimatePresence>
      {debugMode && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'fixed right-4 top-4 z-50 w-80 max-h-[80vh] overflow-hidden',
            'rounded-xl border border-slate-200 bg-white/95 backdrop-blur shadow-2xl'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-slate-700">Debug Mode</span>
            </div>
            <button
              onClick={toggleDebugMode}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* State inspector */}
          <div className="overflow-auto p-4 text-xs font-mono">
            <StateSection title="Navigation">
              <StateItem label="currentStep" value={state.currentStep} />
            </StateSection>

            <StateSection title="Input">
              <StateItem label="inputText" value={state.inputText || '(empty)'} truncate />
              <StateItem label="tokens" value={state.tokens.length} />
            </StateSection>

            <StateSection title="Attention">
              <StateItem label="selectedLayer" value={state.selectedLayer} />
              <StateItem label="selectedHead" value={state.selectedHead} />
              <StateItem label="selectedQueryToken" value={state.selectedQueryToken ?? 'null'} />
            </StateSection>

            <StateSection title="Prediction">
              <StateItem label="temperature" value={state.temperature.toFixed(2)} />
              <StateItem label="topK" value={state.topK} />
              <StateItem label="topP" value={state.topP.toFixed(2)} />
              <StateItem label="predictions" value={state.predictions.length} />
            </StateSection>

            <StateSection title="Generation">
              <StateItem label="isGenerating" value={state.isGenerating ? 'true' : 'false'} />
              <StateItem label="generatedTokens" value={state.generatedTokens.length} />
              <StateItem label="generationSpeed" value={`${state.generationSpeed}x`} />
            </StateSection>
          </div>

          {/* Keyboard shortcut hint */}
          <div className="border-t border-slate-200 px-4 py-2 text-center text-[10px] text-slate-500">
            Press <kbd className="rounded bg-slate-100 px-1">Cmd+Shift+D</kbd> to toggle
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function StateSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function StateItem({
  label,
  value,
  truncate = false,
}: {
  label: string
  value: string | number
  truncate?: boolean
}) {
  const valueStr = String(value)
  return (
    <div className="flex justify-between text-slate-500">
      <span className="text-slate-400">{label}:</span>
      <span
        className={cn('text-slate-700', truncate && 'max-w-[150px] truncate')}
        title={truncate ? valueStr : undefined}
      >
        {valueStr}
      </span>
    </div>
  )
}

// Debug toggle button (shown in corner)
export function DebugToggle() {
  const { debugMode, toggleDebugMode } = useDebug()

  return (
    <motion.button
      onClick={toggleDebugMode}
      className={cn(
        'fixed bottom-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-colors',
        debugMode ? 'bg-yellow-500 text-slate-900' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={`${debugMode ? 'Disable' : 'Enable'} Debug Mode (Cmd+Shift+D)`}
    >
      <Bug className="h-5 w-5" />
    </motion.button>
  )
}
