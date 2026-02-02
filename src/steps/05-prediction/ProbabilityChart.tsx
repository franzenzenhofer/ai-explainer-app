// ProbabilityChart - Bar chart of token probabilities
import { motion } from 'motion/react'
import type { PredictionCandidate } from '../../core/types'
import { getTokenColor } from '../../core/utils/colors'

interface ProbabilityChartProps {
  predictions: PredictionCandidate[]
  accentColor: string
}

export function ProbabilityChart({ predictions, accentColor }: ProbabilityChartProps) {
  if (predictions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400">
        No predictions available
      </div>
    )
  }

  const maxProb = Math.max(...predictions.map((p) => p.probability))

  return (
    <div className="h-full overflow-auto rounded-xl border border-slate-200 bg-white p-4">
      <div className="space-y-2">
        {predictions.map((pred, index) => {
          const barWidth = (pred.probability / maxProb) * 100

          return (
            <motion.div
              key={pred.token}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              {/* Token */}
              <div
                className="w-16 truncate rounded px-2 py-1 text-right font-mono text-xs font-semibold"
                style={{
                  backgroundColor: getTokenColor(index) + '20',
                  color: getTokenColor(index),
                }}
                title={pred.token}
              >
                {pred.token}
              </div>

              {/* Bar */}
              <div className="flex-1 h-6 overflow-hidden rounded bg-slate-100 relative">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded"
                  style={{
                    backgroundColor: getTokenColor(index),
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{
                    delay: index * 0.03,
                    duration: 0.5,
                    ease: 'easeOut',
                  }}
                />

                {/* Probability label inside bar */}
                {barWidth > 20 && (
                  <motion.span
                    className="absolute inset-y-0 left-2 flex items-center text-xs font-medium text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 + 0.3 }}
                  >
                    {(pred.probability * 100).toFixed(1)}%
                  </motion.span>
                )}
              </div>

              {/* Probability label outside if bar is small */}
              {barWidth <= 20 && (
                <span className="w-14 text-right text-xs text-slate-500">
                  {(pred.probability * 100).toFixed(1)}%
                </span>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Skyline metaphor hint */}
      <motion.p
        className="mt-4 text-center text-xs text-slate-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Like a city skyline - taller buildings = higher probability
      </motion.p>
    </div>
  )
}
