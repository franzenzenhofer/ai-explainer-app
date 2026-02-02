// AttentionNetwork - Interactive token attention visualization
// Click any token to see its attention weights to ALL other tokens
import { useMemo, useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Token, AttentionWeight } from '../../core/types'
import { getTokenColor } from '../../core/utils/colors'

interface AttentionNetworkProps {
  tokens: Token[]
  weights: AttentionWeight[]
  selectedQuery: number | null
  onTokenClick: (index: number | null) => void
  accentColor: string
}

export function AttentionNetwork({
  tokens,
  weights,
  selectedQuery,
  onTokenClick,
  accentColor,
}: AttentionNetworkProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 })
  const [hoveredToken, setHoveredToken] = useState<number | null>(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: Math.max(380, rect.height) })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Layout: Selected token on left, all other tokens on right with probability bars
  const layout = useMemo(() => {
    const leftX = 80
    const rightX = dimensions.width - 150
    const centerY = dimensions.height / 2

    // All tokens positioned on the right
    const tokenSpacing = Math.min(35, (dimensions.height - 60) / Math.max(1, tokens.length))
    const startY = centerY - ((tokens.length - 1) * tokenSpacing) / 2

    return {
      leftX,
      rightX,
      centerY,
      tokenPositions: tokens.map((token, i) => ({
        token,
        index: i,
        x: rightX,
        y: startY + i * tokenSpacing,
      })),
    }
  }, [tokens, dimensions])

  // Get attention weights for selected token
  const selectedWeights = useMemo(() => {
    if (selectedQuery === null) return []
    return weights
      .filter((w) => w.queryIdx === selectedQuery)
      .sort((a, b) => b.weight - a.weight)
  }, [weights, selectedQuery])

  // Get weight for specific pair
  const getWeight = (fromIdx: number, toIdx: number) => {
    const w = weights.find((w) => w.queryIdx === fromIdx && w.keyIdx === toIdx)
    return w?.weight || 0
  }

  if (tokens.length === 0) {
    return (
      <div className="flex h-full min-h-[380px] items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400">
        No tokens to visualize
      </div>
    )
  }

  const selectedToken = selectedQuery !== null ? tokens[selectedQuery] : null

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[380px] h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
    >
      {/* SVG for lines */}
      <svg className="absolute inset-0 pointer-events-none" width={dimensions.width} height={dimensions.height}>
        <defs>
          {/* Glow filter for lines */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines from selected token to all others */}
        <AnimatePresence>
          {selectedQuery !== null && layout.tokenPositions.map(({ index, x, y }) => {
            if (index === selectedQuery) return null
            const weight = getWeight(selectedQuery, index)
            if (weight < 0.01) return null

            const fromX = layout.leftX + 60
            const fromY = layout.centerY

            // Curved path
            const midX = (fromX + x - 100) / 2
            const path = `M ${fromX} ${fromY} Q ${midX} ${(fromY + y) / 2} ${x - 100} ${y}`

            return (
              <motion.path
                key={`line-${selectedQuery}-${index}`}
                d={path}
                fill="none"
                stroke={weight > 0.3 ? '#fbbf24' : weight > 0.15 ? '#f97316' : '#9333ea'}
                strokeWidth={Math.max(1.5, weight * 8)}
                strokeOpacity={Math.max(0.3, weight)}
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: Math.max(0.3, weight) }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.4, delay: index * 0.02 }}
              />
            )
          })}
        </AnimatePresence>
      </svg>

      {/* Selected token (large, on left) */}
      <AnimatePresence mode="wait">
        {selectedToken && (
          <motion.div
            key={`selected-${selectedQuery}`}
            className="absolute flex flex-col items-center"
            style={{ left: layout.leftX, top: layout.centerY, transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <div
              className="rounded-xl px-4 py-3 text-lg font-bold text-white shadow-2xl ring-4 ring-offset-2 ring-offset-slate-900"
              style={{ backgroundColor: accentColor, ringColor: accentColor }}
            >
              {selectedToken.text.trim() || '␣'}
            </div>
            <div className="mt-2 text-xs text-slate-400 font-medium">QUERY TOKEN</div>
            <div className="mt-1 text-[10px] text-slate-500">Attending to →</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt when no selection */}
      {selectedQuery === null && (
        <motion.div
          className="absolute flex flex-col items-center justify-center text-center"
          style={{ left: layout.leftX + 50, top: layout.centerY, transform: 'translate(-50%, -50%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-2xl mb-2">👆</div>
          <div className="text-white font-semibold text-sm">Click any token</div>
          <div className="text-slate-400 text-xs mt-1">to see attention weights</div>
        </motion.div>
      )}

      {/* All tokens on the right with probability bars */}
      {layout.tokenPositions.map(({ token, index, x, y }) => {
        const isSelected = index === selectedQuery
        const weight = selectedQuery !== null ? getWeight(selectedQuery, index) : 0
        const isHovered = hoveredToken === index
        const color = getTokenColor(token.colorIndex)

        return (
          <motion.div
            key={token.id}
            className="absolute flex items-center gap-2 cursor-pointer"
            style={{ left: x - 90, top: y, transform: 'translateY(-50%)' }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onMouseEnter={() => setHoveredToken(index)}
            onMouseLeave={() => setHoveredToken(null)}
            onClick={(e) => {
              e.stopPropagation()
              onTokenClick(isSelected ? null : index)
            }}
          >
            {/* Probability bar (only when a token is selected) */}
            {selectedQuery !== null && !isSelected && (
              <div className="w-20 h-3 rounded-full bg-slate-700 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: weight > 0.3 ? '#fbbf24' : weight > 0.15 ? '#f97316' : '#9333ea',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(2, weight * 100)}%` }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                />
              </div>
            )}

            {/* Token badge */}
            <motion.div
              className={`rounded-lg px-2 py-1 text-xs font-semibold shadow-lg whitespace-nowrap transition-all ${
                isSelected ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''
              }`}
              style={{
                backgroundColor: isSelected ? accentColor : isHovered ? color : `${color}cc`,
                color: 'white',
                ringColor: accentColor,
              }}
              whileHover={{ scale: 1.1 }}
              animate={{ scale: isSelected ? 1.15 : 1 }}
            >
              {token.text.trim() || '␣'}
            </motion.div>

            {/* Probability percentage */}
            {selectedQuery !== null && !isSelected && (
              <motion.span
                className="text-xs font-mono font-bold min-w-[40px]"
                style={{ color: weight > 0.3 ? '#fbbf24' : weight > 0.15 ? '#f97316' : '#c084fc' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 + 0.2 }}
              >
                {(weight * 100).toFixed(1)}%
              </motion.span>
            )}
          </motion.div>
        )
      })}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-4 rounded bg-slate-800/90 px-3 py-2 text-[10px] border border-slate-700">
        <div className="flex items-center gap-1">
          <div className="w-3 h-1.5 rounded-full bg-purple-500" />
          <span className="text-slate-400">Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1.5 rounded-full bg-orange-500" />
          <span className="text-slate-400">Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1.5 rounded-full bg-yellow-400" />
          <span className="text-slate-400">High</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-2 right-2 rounded bg-slate-800/90 px-3 py-2 text-[10px] text-slate-400 border border-slate-700">
        Click different tokens to explore attention patterns
      </div>
    </div>
  )
}
