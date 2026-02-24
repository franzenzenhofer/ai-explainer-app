// VectorDisplay - Shows embedding vector values
import { motion } from 'motion/react'
import type { Token, EmbeddingVector } from '../../core/types'
import { MODEL_SPECS } from '../../core/types'
import { getTokenColor } from '../../core/utils/colors'
import { formatVectorValue } from '../../core/utils/formatters'

interface VectorDisplayProps {
  token: Token
  embedding: EmbeddingVector
}

const DISPLAY_DIMS = 12 // Show first 12 dimensions

export function VectorDisplay({ token, embedding }: VectorDisplayProps) {
  const displayValues = embedding.values.slice(0, DISPLAY_DIMS)
  const color = getTokenColor(token.colorIndex)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-slate-200 bg-white p-2.5"
    >
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-500">
          Embedding for "
          <span style={{ color }}>{token.text}</span>"
        </h4>
        <span className="text-xs text-slate-400">
          {MODEL_SPECS.embeddingDim} dimensions
        </span>
      </div>

      {/* Vector Values Grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {displayValues.map((value, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            className="flex flex-col items-center rounded bg-slate-50 px-1.5 py-1"
          >
            <span className="text-[10px] text-slate-400">dim[{i}]</span>
            <span
              className="font-mono text-xs"
              style={{ color: value > 0 ? '#4ade80' : '#f87171' }}
            >
              {formatVectorValue(value)}
            </span>

            {/* Mini bar visualization */}
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="h-full"
                style={{
                  backgroundColor: value > 0 ? '#4ade80' : '#f87171',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.abs(value) * 50)}%` }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ellipsis indicator */}
      <div className="mt-2 text-center text-xs text-slate-400">
        ... and {MODEL_SPECS.embeddingDim - DISPLAY_DIMS} more dimensions
      </div>
    </motion.div>
  )
}
