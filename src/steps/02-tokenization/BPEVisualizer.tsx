// BPEVisualizer - Shows how Byte-Pair Encoding works
import { useState } from 'react'
import { motion } from 'motion/react'
import { Play, RotateCcw } from 'lucide-react'
import { useStepAnimation } from '../../core/hooks/useAnimation'
import { getTokenColor } from '../../core/utils/colors'

const DEMO_WORD = 'Großmutter'

const BPE_STEPS = [
  {
    phase: 'Characters',
    description: 'Start with individual characters',
    tokens: ['G', 'r', 'o', 'ß', 'm', 'u', 't', 't', 'e', 'r'],
  },
  {
    phase: 'Common Pairs',
    description: 'Merge frequent character pairs',
    tokens: ['Gr', 'oß', 'mu', 'tt', 'er'],
  },
  {
    phase: 'Substrings',
    description: 'Merge into common substrings',
    tokens: ['Groß', 'mutter'],
  },
  {
    phase: 'Final',
    description: 'Found in vocabulary (2 tokens)',
    tokens: ['Groß', 'mutter'],
  },
]

export function BPEVisualizer() {
  const { currentIndex, isRunning, isComplete, start, reset, stepForward } = useStepAnimation(
    BPE_STEPS,
    800
  )

  const currentStep = currentIndex >= 0 ? BPE_STEPS[currentIndex] : null

  return (
    <motion.div
      className="rounded-lg border border-slate-200 bg-white p-2.5"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Byte-Pair Encoding Demo</h4>
          <p className="text-xs text-slate-600">See how "{DEMO_WORD}" gets tokenized step by step</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
          <button
            onClick={currentIndex < 0 ? start : stepForward}
            disabled={isComplete}
            className="flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <Play className="h-3 w-3" />
            {currentIndex < 0 ? 'Start' : isComplete ? 'Done' : 'Next Step'}
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-2 flex gap-1.5">
        {BPE_STEPS.map((step, i) => (
          <div
            key={step.phase}
            className={`flex-1 rounded-full h-1 transition-colors ${
              i <= currentIndex ? 'bg-orange-500' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Current Step Display */}
      <div className="min-h-[90px]">
        {currentStep ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-orange-500">
                Step {currentIndex + 1}: {currentStep.phase}
              </span>
              <p className="text-sm text-slate-500">{currentStep.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {currentStep.tokens.map((token, i) => (
                <motion.span
                  key={`${currentIndex}-${i}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded border px-2 py-1 font-mono text-base"
                  style={{
                    backgroundColor: getTokenColor(i) + '20',
                    borderColor: getTokenColor(i) + '40',
                    color: getTokenColor(i),
                  }}
                >
                  {token}
                </motion.span>
              ))}
            </div>

            {/* Token count indicator */}
            <p className="mt-2 text-xs text-slate-500">
              {currentStep.tokens.length} {currentStep.tokens.length === 1 ? 'token' : 'tokens'}
            </p>
          </motion.div>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            Click "Start" to see the BPE process
          </div>
        )}
      </div>
    </motion.div>
  )
}
