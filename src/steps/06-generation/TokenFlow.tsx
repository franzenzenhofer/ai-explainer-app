// TokenFlow - Visual flow showing token generation with probability lines
import { useMemo, useRef, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import type { Token } from '../../core/types'
import { getTokenColor } from '../../core/utils/colors'

interface TokenFlowProps {
  inputTokens: Token[]
  generatedTokens: Token[]
  accentColor: string
}

export function TokenFlow({ inputTokens, generatedTokens, accentColor }: TokenFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width,
          height: Math.max(250, rect.height),
        })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Combine all tokens for display
  const allTokens = useMemo(() => {
    const combined = [
      ...inputTokens.map((t, i) => ({ ...t, isGenerated: false, index: i })),
      ...generatedTokens.map((t, i) => ({ ...t, isGenerated: true, index: inputTokens.length + i })),
    ]
    return combined.slice(-15) // Show last 15 tokens for better visibility
  }, [inputTokens, generatedTokens])

  // Calculate positions - horizontal flow
  const tokenPositions = useMemo(() => {
    const padding = 50
    const spacing = Math.min(80, (dimensions.width - padding * 2) / Math.max(1, allTokens.length - 1))
    const centerY = dimensions.height / 2

    return allTokens.map((token, i) => ({
      ...token,
      x: padding + i * spacing,
      y: centerY,
      // Simulate probability (higher for generated tokens)
      probability: token.isGenerated ? 0.65 + Math.random() * 0.3 : 1.0,
    }))
  }, [allTokens, dimensions])

  if (allTokens.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400">
        Generate tokens to see the flow
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white"
    >
      {/* SVG for connecting lines */}
      <svg
        className="pointer-events-none absolute inset-0"
        width={dimensions.width}
        height={dimensions.height}
      >
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={accentColor} />
          </marker>
        </defs>

        {/* Flow lines between tokens */}
        {tokenPositions.slice(0, -1).map((from, i) => {
          const to = tokenPositions[i + 1]
          if (!to) return null

          const isGeneratedTransition = from.isGenerated || to.isGenerated
          const strokeWidth = isGeneratedTransition ? 3 : 2
          const strokeColor = isGeneratedTransition ? accentColor : '#94a3b8'

          return (
            <g key={`line-${i}`}>
              {/* Main flow line with arrow */}
              <motion.line
                x1={from.x + 20}
                y1={from.y}
                x2={to.x - 20}
                y2={to.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={0.7}
                markerEnd={isGeneratedTransition ? 'url(#arrowhead)' : undefined}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              />

              {/* Probability label */}
              {isGeneratedTransition && (
                <motion.text
                  x={(from.x + to.x) / 2}
                  y={from.y - 20}
                  textAnchor="middle"
                  className="text-[10px] font-mono"
                  fill={accentColor}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.2 }}
                >
                  {(to.probability * 100).toFixed(0)}%
                </motion.text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Token nodes */}
      {tokenPositions.map((token, i) => (
        <motion.div
          key={`${token.id}-${i}`}
          className="absolute flex flex-col items-center"
          style={{
            left: token.x,
            top: token.y,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 20,
            delay: i * 0.03,
          }}
        >
          {/* Token badge */}
          <div
            className={`rounded-lg px-2 py-1 text-xs font-mono shadow-md whitespace-nowrap ${
              token.isGenerated ? 'ring-2 ring-offset-1' : ''
            }`}
            style={{
              backgroundColor: token.isGenerated
                ? getTokenColor(token.colorIndex)
                : '#f1f5f9',
              color: token.isGenerated ? 'white' : '#475569',
              ringColor: accentColor,
            }}
          >
            {token.text.trim() || '␣'}
          </div>

          {/* Label below */}
          <div className="mt-1 text-[9px] text-slate-400">
            {token.isGenerated ? 'AI' : 'input'}
          </div>
        </motion.div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 flex items-center gap-3 rounded bg-white/90 px-2 py-1 text-[10px] border border-slate-200">
        <div className="flex items-center gap-1">
          <div className="h-0.5 w-4 bg-slate-400" />
          <span className="text-slate-500">Input flow</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-0.5 w-4" style={{ backgroundColor: accentColor }} />
          <span style={{ color: accentColor }}>Predicted</span>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-2 left-2 rounded bg-white/90 px-2 py-1 text-[10px] text-slate-600 border border-slate-200 font-medium">
        Token Flow: Each arrow shows prediction probability
      </div>
    </div>
  )
}
