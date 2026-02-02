// AttentionHeatmap - Visualization of attention weights
import { useMemo } from 'react'
import { motion } from 'motion/react'
import type { Token, AttentionWeight } from '../../core/types'
import { getTokenColor, getAttentionColor } from '../../core/utils/colors'
import { createAttentionMatrix } from './attention'

interface AttentionHeatmapProps {
  tokens: Token[]
  weights: AttentionWeight[]
  selectedQuery: number | null
  onCellClick?: (queryIdx: number, keyIdx: number) => void
}

export function AttentionHeatmap({
  tokens,
  weights,
  selectedQuery,
  onCellClick,
}: AttentionHeatmapProps) {
  const matrix = useMemo(
    () => createAttentionMatrix(weights, tokens.length),
    [weights, tokens.length]
  )

  if (tokens.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400">
        No tokens to visualize
      </div>
    )
  }

  const cellSize = Math.min(40, Math.max(20, 300 / tokens.length))

  return (
    <div className="flex h-full flex-col overflow-auto rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex">
        {/* Empty corner cell */}
        <div
          className="flex-shrink-0"
          style={{ width: cellSize * 1.5, height: cellSize }}
        />

        {/* Column headers (Keys) */}
        <div className="flex">
          {tokens.map((token, i) => (
            <motion.div
              key={`col-${i}`}
              className="flex items-center justify-center text-[10px] font-mono"
              style={{
                width: cellSize,
                height: cellSize,
                color: getTokenColor(token.colorIndex),
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              title={token.text}
            >
              {token.text.slice(0, 3)}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Matrix rows */}
      {matrix.map((row, queryIdx) => (
        <div key={`row-${queryIdx}`} className="flex">
          {/* Row header (Query) */}
          <motion.div
            className="flex flex-shrink-0 items-center justify-end pr-2 text-[10px] font-mono"
            style={{
              width: cellSize * 1.5,
              height: cellSize,
              color: getTokenColor(tokens[queryIdx]?.colorIndex || 0),
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: queryIdx * 0.02 }}
          >
            {tokens[queryIdx]?.text.slice(0, 6)}
          </motion.div>

          {/* Cells */}
          <div className="flex">
            {row.map((weight, keyIdx) => {
              const isQueryRow = queryIdx === selectedQuery
              const isKeyCol = keyIdx === selectedQuery

              return (
                <motion.div
                  key={`cell-${queryIdx}-${keyIdx}`}
                  className="flex items-center justify-center cursor-pointer transition-transform hover:scale-110 hover:z-10"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: getAttentionColor(weight),
                    outline: isQueryRow || isKeyCol ? '1px solid rgba(255,255,255,0.3)' : undefined,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: (queryIdx * tokens.length + keyIdx) * 0.002,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => onCellClick?.(queryIdx, keyIdx)}
                  title={`${tokens[queryIdx]?.text} → ${tokens[keyIdx]?.text}: ${(weight * 100).toFixed(1)}%`}
                >
                  {cellSize >= 30 && (
                    <span className="text-[8px] font-mono text-white">
                      {weight > 0.1 ? (weight * 100).toFixed(0) : ''}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <span className="text-xs text-slate-500">Low attention</span>
        <div className="flex h-3 overflow-hidden rounded">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => (
            <div
              key={v}
              className="w-6"
              style={{ backgroundColor: getAttentionColor(v) }}
            />
          ))}
        </div>
        <span className="text-xs text-slate-500">High attention</span>
      </div>
    </div>
  )
}
