// PredictionNetwork - Shows context tokens with their ACTUAL colors and prediction probabilities
// CLICK any context token to see predictions from that point!
import { useMemo, useRef, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import type { Token, Prediction } from '../../core/types'
import { getTokenColor } from '../../core/utils/colors'

interface PredictionNetworkProps {
  inputTokens: Token[]
  predictions: Prediction[]
  accentColor: string
}

export function PredictionNetwork({
  inputTokens,
  predictions,
  accentColor,
}: PredictionNetworkProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 })
  // Track which token is selected (defaults to last token)
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number | null>(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: Math.max(320, rect.height) })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Show last 8 tokens and top 8 predictions
  const visibleTokens = useMemo(() => inputTokens.slice(-8), [inputTokens])

  // Default to last token if none selected
  const activeTokenIdx = selectedTokenIdx ?? (visibleTokens.length - 1)
  const visiblePredictions = useMemo(() => predictions.slice(0, 8), [predictions])

  // Layout calculation
  const layout = useMemo(() => {
    const leftX = 80
    const rightX = dimensions.width - 100
    const centerY = dimensions.height / 2

    const tokenSpacing = Math.min(36, (dimensions.height - 40) / Math.max(1, visibleTokens.length))
    const tokensStartY = centerY - ((visibleTokens.length - 1) * tokenSpacing) / 2

    const predSpacing = Math.min(36, (dimensions.height - 40) / Math.max(1, visiblePredictions.length))
    const predsStartY = centerY - ((visiblePredictions.length - 1) * predSpacing) / 2

    return {
      leftX,
      rightX,
      tokenPositions: visibleTokens.map((token, i) => ({
        token,
        x: leftX,
        y: tokensStartY + i * tokenSpacing,
      })),
      predPositions: visiblePredictions.map((pred, i) => ({
        prediction: pred,
        x: rightX,
        y: predsStartY + i * predSpacing,
      })),
    }
  }, [visibleTokens, visiblePredictions, dimensions])

  if (inputTokens.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400">
        Enter text to see prediction probabilities
      </div>
    )
  }

  // Get the selected token position (for drawing lines)
  const selectedTokenPos = layout.tokenPositions[activeTokenIdx]

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-yellow-50"
    >
      {/* SVG for connection lines */}
      <svg className="pointer-events-none absolute inset-0" width={dimensions.width} height={dimensions.height}>
        {/* Gradient definitions for lines */}
        <defs>
          {visiblePredictions.map((pred, i) => (
            <linearGradient key={`grad-${i}`} id={`line-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={getTokenColor(visibleTokens[activeTokenIdx]?.colorIndex || 0)} />
              <stop offset="100%" stopColor={accentColor} />
            </linearGradient>
          ))}
        </defs>

        {/* Connection lines from SELECTED token to each prediction */}
        {selectedTokenPos && layout.predPositions.map(({ prediction, x: toX, y: toY }, i) => {
          const fromX = selectedTokenPos.x + 45
          const fromY = selectedTokenPos.y

          // Line thickness based on probability
          const strokeWidth = Math.max(2, prediction.probability * 10)
          const opacity = Math.max(0.3, prediction.probability)

          // Curved bezier path
          const midX = (fromX + toX - 80) / 2
          const path = `M ${fromX} ${fromY} C ${midX + 30} ${fromY}, ${midX} ${toY}, ${toX - 80} ${toY}`

          return (
            <motion.path
              key={`line-${i}`}
              d={path}
              fill="none"
              stroke={`url(#line-grad-${i})`}
              strokeWidth={strokeWidth}
              strokeOpacity={opacity}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            />
          )
        })}

        {/* Labels */}
        <text x={layout.leftX - 10} y={20} className="text-[11px] font-semibold" fill="#64748b">
          Context
        </text>
        <text x={layout.rightX - 60} y={20} className="text-[11px] font-semibold" fill={accentColor}>
          Predictions
        </text>
      </svg>

      {/* Input tokens - CLICKABLE with ACTUAL TOKEN COLORS */}
      {layout.tokenPositions.map(({ token, x, y }, i) => {
        const isSelected = i === activeTokenIdx
        const tokenColor = getTokenColor(token.colorIndex)

        return (
          <motion.div
            key={token.id}
            className="absolute flex items-center cursor-pointer"
            style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelectedTokenIdx(i)}
          >
            <motion.div
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold shadow-md whitespace-nowrap transition-all ${
                isSelected ? 'ring-2 ring-offset-2' : 'hover:ring-2 hover:ring-offset-1 hover:ring-slate-300'
              }`}
              style={{
                backgroundColor: tokenColor,
                color: 'white',
                ringColor: accentColor,
              }}
              whileHover={{ scale: 1.05 }}
              animate={{ scale: isSelected ? 1.1 : 1 }}
            >
              {token.text.trim() || '␣'}
            </motion.div>
            {isSelected && (
              <motion.div
                className="ml-2 text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                → predicting
              </motion.div>
            )}
          </motion.div>
        )
      })}

      {/* Prediction tokens with probability bars */}
      {layout.predPositions.map(({ prediction, x, y }, i) => (
        <motion.div
          key={prediction.token}
          className="absolute flex items-center gap-2"
          style={{ left: x - 70, top: y, transform: 'translateY(-50%)' }}
          initial={{ scale: 0, opacity: 0, x: 20 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 + 0.2 }}
        >
          {/* Probability bar */}
          <div className="w-16 h-4 rounded-full bg-slate-200 overflow-hidden shadow-inner">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: accentColor }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(5, prediction.probability * 100)}%` }}
              transition={{ delay: i * 0.05 + 0.3, duration: 0.4 }}
            />
          </div>

          {/* Prediction token */}
          <div
            className="rounded-lg px-2 py-1 text-xs font-semibold shadow-md whitespace-nowrap"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            {prediction.token}
          </div>

          {/* Probability percentage */}
          <span className="text-xs font-mono font-bold min-w-[45px]" style={{ color: accentColor }}>
            {(prediction.probability * 100).toFixed(1)}%
          </span>
        </motion.div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-3 py-1.5 text-[10px] border border-slate-200 shadow-sm">
        <span className="text-slate-600 font-medium">👆 Click any token • Line thickness = probability</span>
      </div>

      {/* Info */}
      <div className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-3 py-1.5 text-[10px] border border-slate-200 shadow-sm">
        <span className="font-semibold" style={{ color: accentColor }}>
          Selected token → Predictions
        </span>
      </div>
    </div>
  )
}
